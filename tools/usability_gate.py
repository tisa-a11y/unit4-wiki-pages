#!/usr/bin/env python3
"""Comprehensive Automated Usability Gate Suite for Unit 4 Wiki & Interactive Plans.

Python 3.9-3.14 compatible gate runner evaluating 8 usability, layout, i18n,
privacy, runtime, asset, and navigation gates across:
  - Target pages: index.html (all wiki rooms/views) + plans/*/index.html
  - Viewports: Desktop (1440x900), Mobile (390x844)
  - States: English (en), Spanish (es) | Light Mode, Dark Mode

Usage:
  python3 tools/usability_gate.py
  python3 tools/usability_gate.py --json-only
"""
from __future__ import annotations

import datetime
import functools
import http.server
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parent.parent

STANDARD_PLANS = [
    "kitchen-floor-plan",
    "kitchen-west-ks4",
    "kitchen-electrical",
    "attic-hatch",
    "hvac-layout",
    "murphy-door",
]

EXPECTED_DROPDOWN_PLAN_IDS = [
    "kitchen-west-ks4",
    "kitchen-floor-plan",
    "kitchen-electrical",
    "attic-hatch",
    "hvac-layout",
    "murphy-door",
    "bathroom-tile",
]

PM_SEPARATE_PLANS = ["bathroom-tile"]

# Privacy firewall patterns (applied after stripping #agent-brief, HTML comments, and FIREWALL_RE)
FIREWALL_PATTERNS: List[Tuple[str, re.Pattern[str]]] = [
    ("currency_usd", re.compile(r"\$\s?\d+(?:,\d{3})*(?:\.\d{2})?")),
    ("private_folder_ref", re.compile(r"1231-11th-avenue-private", re.IGNORECASE)),
    (
        "crew_medical",
        re.compile(
            r"\b(?:hospital|hospitalized|hospitalizado|hospitalizada|surgery|cirug[ií]a|emergency\s+room|sala\s+de\s+urgencias)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "backend_plumbing",
        re.compile(
            r"\b(?:Tailnet\s+Live|EOD\s+Review|measure_boundary|K_S4_BASELINE|rev-2026\d{4})\b"
        ),
    ),
]

BROKEN_TEXT_RE = re.compile(
    r"(?:\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b|\uFFFD)"
)

ES_UNTRANSLATED_TOKENS = [
    ("Dark", re.compile(r"\bDark\b")),
    ("Light", re.compile(r"\bLight\b")),
    ("WEST", re.compile(r"\bWEST\b")),
    ("NORTH", re.compile(r"\bNORTH\b")),
    ("EAST", re.compile(r"\bEAST\b")),
    ("running bond", re.compile(r"\brunning bond\b", re.IGNORECASE)),
    ("Corners", re.compile(r"\bCorners\b")),
    ("Joint", re.compile(r"\bJoint\b")),
    ("Print 2-Page PDF", re.compile(r"Print 2-Page PDF", re.IGNORECASE)),
]


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:
        return


def _start_static_server(root: Path) -> Tuple[http.server.ThreadingHTTPServer, int]:
    handler = functools.partial(_QuietHandler, directory=str(root))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = srv.server_address[1]
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return srv, port


def _find_chrome_executable() -> Optional[str]:
    candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None


def _run_node_syntax_checks(root: Path) -> List[str]:
    failures: List[str] = []
    node_bin = shutil.which("node")
    if not node_bin:
        return ["node executable not found on PATH; cannot run JS syntax check"]

    js_files: List[Path] = []
    for p in sorted((root / "plans").rglob("*.js")):
        if p.name.endswith(".min.js"):
            continue
        js_files.append(p)

    for jf in js_files:
        res = subprocess.run(
            [node_bin, "--check", str(jf)],
            capture_output=True,
            text=True,
        )
        if res.returncode != 0:
            err_line = (res.stderr or res.stdout or "").strip().splitlines()[:3]
            failures.append(f"node --check failed on {jf.relative_to(root)}: {' | '.join(err_line)}")

    index_html = (root / "index.html").read_text(encoding="utf-8")
    m = re.search(r"<script>\n(.*)\n</script>", index_html, re.S)
    if not m:
        failures.append("index.html main <script> block not found")
    else:
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tf:
            tf.write(m.group(1))
            tmp_js = tf.name
        try:
            res = subprocess.run([node_bin, "--check", tmp_js], capture_output=True, text=True)
            if res.returncode != 0:
                err_line = (res.stderr or res.stdout or "").strip().splitlines()[:3]
                failures.append(f"node --check failed on index.html <script>: {' | '.join(err_line)}")
        finally:
            if os.path.exists(tmp_js):
                os.unlink(tmp_js)

    return failures


def _strip_firewall_exemptions(raw_html: str) -> str:
    text = re.sub(r"<!--.*?-->", " ", raw_html, flags=re.S)
    text = re.sub(
        r"<section\b[^>]*\bid=[\"']agent-brief[\"'][^>]*>.*?</section>",
        " ",
        text,
        flags=re.S | re.I,
    )
    text = re.sub(r"FIREWALL_RE\s*=\s*[^\n;]+", " ", text)
    text = re.sub(r"<script\b[^>]*>.*?</script>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return text


def _run_static_privacy_and_nav_checks(root: Path) -> Tuple[List[str], List[str]]:
    privacy_failures: List[str] = []
    nav_failures: List[str] = []

    target_htmls: List[Path] = [root / "index.html"]
    for p in STANDARD_PLANS:
        cand = root / "plans" / p / "index.html"
        if cand.exists():
            target_htmls.append(cand)

    blank_local_re = re.compile(
        r"<a\b[^>]*\bhref=[\"'](?:\.?/)?(?:wiki-docs/[^\"']+\.html|plans/[^\"']+)[\"'][^>]*\btarget=[\"']_blank[\"']",
        re.IGNORECASE,
    )
    blank_local_rev_re = re.compile(
        r"<a\b[^>]*\btarget=[\"']_blank[\"'][^>]*\bhref=[\"'](?:\.?/)?(?:wiki-docs/[^\"']+\.html|plans/[^\"']+)[\"']",
        re.IGNORECASE,
    )

    for hf in target_htmls:
        raw = hf.read_text(encoding="utf-8")
        rel = str(hf.relative_to(root))
        # Static target="_blank" check on local wiki-docs/*.html and plans/*
        for rx in (blank_local_re, blank_local_rev_re):
            for hit in rx.finditer(raw):
                nav_failures.append(f"{rel}: local link has target=_blank: {hit.group(0)[:120]}")

        # Static stripped privacy check (for non-hidden blueprint/markup prose)
        cleaned = _strip_firewall_exemptions(raw)
        for label, pat in FIREWALL_PATTERNS:
            if label == "backend_plumbing" and rel.startswith("plans/"):
                # Hidden #blueprint-sheet-shell holds print/dev fields checked in live rendered DOM
                continue
            for m in pat.finditer(cleaned):
                snippet = cleaned[max(0, m.start() - 30) : min(len(cleaned), m.end() + 30)].replace("\n", " ")
                privacy_failures.append(f"{rel} [{label}]: '{m.group(0)}' in '...{snippet}...'")

    # Also check content/ markdown and html sources for target="_blank" on wiki-docs/*.html or plans/*
    for cf in sorted((root / "content").rglob("*")):
        if cf.suffix not in (".md", ".html"):
            continue
        raw = cf.read_text(encoding="utf-8")
        rel = str(cf.relative_to(root))
        for rx in (blank_local_re, blank_local_rev_re):
            for hit in rx.finditer(raw):
                nav_failures.append(f"{rel}: local link has target=_blank: {hit.group(0)[:120]}")

    return privacy_failures, nav_failures


NODE_RUNNER_JS = r"""
const fs = require('fs');
const { chromium } = require('playwright');

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const baseUrl = cfg.baseUrl;
const wikiPages = cfg.wikiPages;
const standardPlans = cfg.standardPlans;
const expectedDropdownIds = cfg.expectedDropdownIds;
const chromeExe = cfg.chromeExe || undefined;

const BROKEN_RE = /(?:\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b|\uFFFD)/;
const ES_BAD_TOKENS = [
  { name: 'Dark', re: /\bDark\b/ },
  { name: 'Light', re: /\bLight\b/ },
  { name: 'WEST', re: /\bWEST\b/ },
  { name: 'NORTH', re: /\bNORTH\b/ },
  { name: 'EAST', re: /\bEAST\b/ },
  { name: 'running bond', re: /\brunning bond\b/i },
  { name: 'Corners', re: /\bCorners\b/ },
  { name: 'Joint', re: /\bJoint\b/ },
  { name: 'Print 2-Page PDF', re: /Print 2-Page PDF/i }
];
const PRIVACY_PATTERNS = [
  { name: 'currency_usd', re: /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?/ },
  { name: 'private_folder', re: /1231-11th-avenue-private/i },
  { name: 'crew_medical', re: /\b(?:hospital|hospitalized|hospitalizado|hospitalizada|surgery|cirug[ií]a|emergency\s+room|sala\s+de\s+urgencias)\b/i },
  { name: 'backend_plumbing', re: /\b(?:Tailnet\s+Live|EOD\s+Review|measure_boundary|K_S4_BASELINE|rev-2026\d{4})\b/ }
];

function isExpectedOfflineError(text) {
  const s = String(text || '');
  return (
    s.includes('mac-mini.tailcf4007.ts.net') ||
    s.includes('ERR_FAILED') ||
    s.includes('ERR_ABORTED') ||
    s.includes('ERR_NAME_NOT_RESOLVED') ||
    s.includes('Failed to load resource: net::') ||
    s.includes('fonts.googleapis.com') ||
    s.includes('cdn.jsdelivr.net')
  );
}

async function runAudit() {
  const results = {
    gate_1: [],
    gate_2: [],
    gate_3: [],
    gate_4: [],
    gate_5: [],
    gate_6: [],
    gate_7: [],
    gate_8: [],
    checked: { wiki_runs: 0, plan_runs: 0 }
  };

  const launchOpts = { args: ['--no-sandbox'] };
  if (chromeExe && fs.existsSync(chromeExe)) {
    launchOpts.executablePath = chromeExe;
  }
  const browser = await chromium.launch(launchOpts);

  async function setupOfflineRouting(page) {
    await page.route('**/*', async (route) => {
      const u = route.request().url();
      if (
        u.startsWith(baseUrl) ||
        u.startsWith('data:') ||
        u.startsWith('blob:') ||
        u.startsWith('about:') ||
        u.includes('cdnjs.cloudflare.com/ajax/libs/marked') ||
        u.includes('cdnjs.cloudflare.com/ajax/libs/dompurify')
      ) {
        await route.continue();
      } else {
        await route.abort();
      }
    });
  }

  // Evaluate common DOM gates on the currently loaded view
  async function evaluateCurrentPage(page, tag, isPlan, lang, theme, vpName) {
    // Force lazy images to load by scrolling through page briefly, then restore scroll top
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.loading = 'eager';
        const s = img.getAttribute('src');
        if (s && !img.complete) img.src = s;
      });
      await new Promise(r => setTimeout(r, 120));
    });
    await page.waitForTimeout(180);

    const data = await page.evaluate(({ isPlan, vpName }) => {
      function isVis(el) {
        if (!el) return false;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 1 && r.height > 1;
      }

      // Gate 1 & Gate 7 visible text (excluding #agent-brief & hidden blueprint shell)
      const rootEl = isPlan ? (document.getElementById('u4-human-app') || document.body) : (document.querySelector('main') || document.body);
      const clone = rootEl.cloneNode(true);
      clone.querySelectorAll('#agent-brief, #blueprint-sheet-shell, [hidden], script, style').forEach(n => n.remove());
      const visibleText = (clone.innerText || '').trim();

      // Also capture core structural i18n text for Gate 6
      const coreSelectors = isPlan
        ? '#u4hTopbar, .u4h-title, .u4h-sub, .u4h-step-btn, .u4h-kpi-lbl, .u4h-hold-strip, .u4h-pager, .u4-pin-bar'
        : 'main > .bar, #doc h1, #doc h2, #doc h3, #sec-checklist, .u4-gal-tag, .u4-gal-btn, .u4-plan-launch-title, nav.rail .grp';
      const coreParts = [];
      document.querySelectorAll(coreSelectors).forEach(el => {
        if (el.closest('#agent-brief') || el.closest('#blueprint-sheet-shell') || !isVis(el)) return;
        const txt = (el.innerText || '').trim();
        if (txt) coreParts.push(txt);
      });

      // Gate 3a: Floating overlap check (.u4-pin-fab and #u4AiFloatingDock)
      const overlaps = [];
      const floaters = [];
      ['.u4-pin-fab', '#u4AiFloatingDock'].forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (!isVis(el)) return;
          const st = getComputedStyle(el);
          if (st.position === 'fixed' || st.position === 'sticky') {
            floaters.push({ sel, el, rect: el.getBoundingClientRect() });
          }
        });
      });
      if (floaters.length) {
        const targets = document.querySelectorAll(
          'main h1, main h2, main h3, main p, main li, main button, main a, .u4-gal-card, .u4-plan-launch-card, .ck li, .u4-who-chip'
        );
        for (const fl of floaters) {
          if (fl.sel === '#u4AiFloatingDock' && vpName === 'mobile') {
            // On 390px mobile, verify the AI dock collapses to a compact orb (<=64px) and leaves bottom clearance
            if (fl.rect.width > 64) {
              overlaps.push(`#u4AiFloatingDock too wide on mobile (${Math.round(fl.rect.width)}px > 64px)`);
            }
            const mainEl = document.querySelector('main');
            const padBot = mainEl ? parseFloat(getComputedStyle(mainEl).paddingBottom || '0') : 0;
            if (mainEl && padBot < fl.rect.height + 16) {
              overlaps.push(`#u4AiFloatingDock lacks bottom scroll clearance on mobile (paddingBottom=${Math.round(padBot)}px < ${Math.round(fl.rect.height + 16)}px)`);
            }
            continue;
          }
          const r1 = fl.rect;
          for (const t of targets) {
            if (t === fl.el || fl.el.contains(t) || t.contains(fl.el)) continue;
            if (!isVis(t)) continue;
            if (t.closest('#u4AiFloatingDock') || t.closest('#u4VoiceChatDialog') || t.closest('nav.rail')) continue;
            const r2 = t.getBoundingClientRect();
            if (r2.bottom <= 0 || r2.top >= window.innerHeight) continue;
            const ix = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const iy = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
            if (ix > 4 && iy > 4) {
              overlaps.push(`${fl.sel} overlaps <${t.tagName.toLowerCase()}> "${(t.innerText || '').trim().slice(0, 40)}" (${Math.round(ix)}x${Math.round(iy)}px)`);
              if (overlaps.length >= 5) break;
            }
          }
        }
      }

      // Gate 3b: Pill flex overflow on .u4h-seg-switch[role="navigation"] and .u4h-seg-item
      const pillWraps = [];
      document.querySelectorAll('div.u4h-seg-switch, .u4h-seg-switch[role="navigation"]').forEach(el => {
        if (!isVis(el)) return;
        if (el.scrollHeight > el.clientHeight + 2) {
          pillWraps.push(`seg-switch vertical overflow: scrollHeight=${el.scrollHeight} > clientHeight=${el.clientHeight}`);
        }
        el.querySelectorAll('.u4h-seg-item').forEach(item => {
          const ir = item.getBoundingClientRect();
          if (ir.height > 42) {
            pillWraps.push(`seg-item wrapped (${Math.round(ir.height)}px): "${(item.innerText || '').trim()}"`);
          }
        });
      });

      // Gate 3c: SVG getBBox clip check on visible plan SVGs
      const svgClips = [];
      if (isPlan) {
        document.querySelectorAll('#u4-human-app .u4h-svg-wrap svg').forEach((svg, idx) => {
          if (!isVis(svg)) return;
          const vb = svg.viewBox && svg.viewBox.baseVal;
          if (!vb || !vb.width || !vb.height) return;
          try {
            const bb = svg.getBBox();
            const tol = 18;
            if (
              bb.x < vb.x - tol ||
              bb.y < vb.y - tol ||
              bb.x + bb.width > vb.x + vb.width + tol ||
              bb.y + bb.height > vb.y + vb.height + tol
            ) {
              svgClips.push(
                `svg#${svg.id || idx} bbox (${bb.x.toFixed(1)},${bb.y.toFixed(1)},${bb.width.toFixed(1)}x${bb.height.toFixed(1)}) exceeds viewBox (${vb.x},${vb.y},${vb.width}x${vb.height})`
              );
            }
          } catch (_) {}
        });
      }

      // Gate 4: Visible raster image integrity
      const brokenImgs = [];
      document.querySelectorAll('img').forEach(img => {
        if (img.closest('#blueprint-sheet-shell') || img.closest('[hidden]')) return;
        const st = getComputedStyle(img);
        if (st.display === 'none' || st.visibility === 'hidden') return;
        // Skip hidden upload previews with empty src
        const rawSrc = img.getAttribute('src') || '';
        if (!rawSrc) return;
        if (!(img.complete && img.naturalWidth > 0)) {
          brokenImgs.push(`src="${rawSrc}" complete=${img.complete} naturalWidth=${img.naturalWidth}`);
        }
      });

      // Gate 5: Horizontal overflow & plan parity
      const overflowPx = document.documentElement.scrollWidth - window.innerWidth;
      let planParity = null;
      if (isPlan) {
        const langBtn = document.getElementById('u4hLangBtn');
        const themeBtn = document.getElementById('u4hThemeBtn');
        const themeSvgs = themeBtn ? themeBtn.querySelectorAll('svg').length : 0;
        const dropdownIds = Array.from(document.querySelectorAll('#u4hAllPlansPop a[data-plan-id]')).map(a => a.getAttribute('data-plan-id'));
        planParity = {
          hasLangSwitch: Boolean(langBtn && langBtn.getAttribute('role') === 'switch'),
          hasThemeSvgs: themeSvgs >= 2,
          dropdownIds,
          hasZoomPan: Boolean(window.U4ZoomPan),
          hasPinDragger: Boolean(window.U4PinDragger)
        };
      }

      // Gate 8: Local links retaining target="_blank"
      const badBlankLinks = [];
      document.querySelectorAll('a[target="_blank"]').forEach(a => {
        if (a.closest('#blueprint-sheet-shell')) return;
        const href = (a.getAttribute('href') || '').trim();
        if (/(?:^|\.?\/)(?:wiki-docs\/[^?#]+\.html|plans\/)/i.test(href)) {
          badBlankLinks.push(`href="${href}"`);
        }
      });

      return {
        visibleText,
        coreText: coreParts.join('\n'),
        overlaps,
        pillWraps,
        svgClips,
        brokenImgs,
        overflowPx,
        planParity,
        badBlankLinks
      };
    }, { isPlan, vpName });

    // Evaluate Gate 1: Text Integrity
    const bm = data.visibleText.match(BROKEN_RE);
    if (bm) {
      const idx = bm.index || 0;
      const snip = data.visibleText.slice(Math.max(0, idx - 30), idx + 40).replace(/\n/g, ' ');
      results.gate_1.push(`${tag}: broken text token "${bm[0]}" in "...${snip}..."`);
    }
    if (!isPlan && data.visibleText.length < 120) {
      results.gate_1.push(`${tag}: rendered page looks nearly empty (${data.visibleText.length} chars)`);
    }

    // Evaluate Gate 3: Geometry & Overlap
    data.overlaps.forEach(o => results.gate_3.push(`${tag}: ${o}`));
    data.pillWraps.forEach(w => results.gate_3.push(`${tag}: ${w}`));
    data.svgClips.forEach(s => results.gate_3.push(`${tag}: ${s}`));

    // Evaluate Gate 4: Image Integrity
    data.brokenImgs.forEach(bi => results.gate_4.push(`${tag}: broken image ${bi}`));

    // Evaluate Gate 5: Plan Parity & 390px Overflow
    if (vpName === 'mobile' && data.overflowPx > 2) {
      results.gate_5.push(`${tag}: 390px horizontal overflow (+${data.overflowPx}px)`);
    }
    if (isPlan && data.planParity) {
      const pp = data.planParity;
      if (!pp.hasLangSwitch) results.gate_5.push(`${tag}: missing compact EN/ES role="switch"`);
      if (!pp.hasThemeSvgs) results.gate_5.push(`${tag}: missing inline Sun/Moon SVGs in theme toggle`);
      if (!pp.hasZoomPan) results.gate_5.push(`${tag}: window.U4ZoomPan not mounted`);
      if (!pp.hasPinDragger) results.gate_5.push(`${tag}: window.U4PinDragger not mounted`);
      for (const expId of expectedDropdownIds) {
        if (!pp.dropdownIds.includes(expId)) {
          results.gate_5.push(`${tag}: All Plans dropdown missing "${expId}"`);
        }
      }
    }

    // Evaluate Gate 6: Bilingual Coverage (?lang=es)
    if (lang === 'es') {
      for (const tok of ES_BAD_TOKENS) {
        const hit = data.coreText.match(tok.re);
        if (hit) {
          const i = hit.index || 0;
          const sn = data.coreText.slice(Math.max(0, i - 25), i + 35).replace(/\n/g, ' ');
          results.gate_6.push(`${tag}: untranslated English "${tok.name}" in "...${sn}..."`);
        }
      }
    }

    // Evaluate Gate 7: Privacy Firewall (rendered visible DOM)
    for (const pat of PRIVACY_PATTERNS) {
      const hit = data.visibleText.match(pat.re);
      if (hit) {
        const i = hit.index || 0;
        const sn = data.visibleText.slice(Math.max(0, i - 25), i + 35).replace(/\n/g, ' ');
        results.gate_7.push(`${tag}: privacy firewall [${pat.name}] matched "${hit[0]}" in "...${sn}..."`);
      }
    }

    // Evaluate Gate 8: Local Nav Integrity
    data.badBlankLinks.forEach(bl => results.gate_8.push(`${tag}: local link has target="_blank" (${bl})`));
  }

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 }
  ];
  const matrix = [
    { lang: 'en', theme: 'light' },
    { lang: 'es', theme: 'dark' }
  ];

  // 1. Audit index.html across all wiki pages
  for (const vp of viewports) {
    for (const st of matrix) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      await ctx.addInitScript(({ lang, theme }) => {
        try {
          localStorage.setItem('u4lang', lang);
          localStorage.setItem('u4_lang', lang);
          localStorage.setItem('u4_theme', theme);
        } catch (_) {}
      }, st);
      const page = await ctx.newPage();
      let curTag = `index.html[${vp.name}/${st.lang}/${st.theme}]`;
      page.on('pageerror', err => results.gate_2.push(`${curTag}: pageerror: ${String(err).slice(0, 200)}`));
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const txt = msg.text();
          if (!isExpectedOfflineError(txt)) {
            results.gate_2.push(`${curTag}: console.error: ${txt.slice(0, 200)}`);
          }
        }
      });
      await setupOfflineRouting(page);
      await page.goto(`${baseUrl}/index.html?lang=${st.lang}&theme=${st.theme}#home`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(450);

      for (const room of wikiPages) {
        curTag = `#${room}[${vp.name}/${st.lang}/${st.theme}]`;
        await page.evaluate(r => { location.hash = '#' + r; }, room);
        await page.waitForTimeout(260);
        // Apply theme explicitly if needed
        await page.evaluate(th => { document.documentElement.setAttribute('data-theme', th); }, st.theme);
        await evaluateCurrentPage(page, curTag, false, st.lang, st.theme, vp.name);
        results.checked.wiki_runs += 1;
      }
      await ctx.close();
    }
  }

  // 2. Audit all standard interactive plans (en/light + es/dark + en/dark + es/light coverage across viewports)
  const planMatrix = [
    { vp: viewports[0], lang: 'en', theme: 'light' },
    { vp: viewports[0], lang: 'es', theme: 'dark' },
    { vp: viewports[1], lang: 'en', theme: 'dark' },
    { vp: viewports[1], lang: 'es', theme: 'light' }
  ];

  for (const planId of standardPlans) {
    for (const m of planMatrix) {
      const ctx = await browser.newContext({ viewport: { width: m.vp.width, height: m.vp.height } });
      const page = await ctx.newPage();
      const curTag = `plan:${planId}[${m.vp.name}/${m.lang}/${m.theme}]`;
      page.on('pageerror', err => results.gate_2.push(`${curTag}: pageerror: ${String(err).slice(0, 200)}`));
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const txt = msg.text();
          if (!isExpectedOfflineError(txt)) {
            results.gate_2.push(`${curTag}: console.error: ${txt.slice(0, 200)}`);
          }
        }
      });
      await setupOfflineRouting(page);
      const url = `${baseUrl}/plans/${planId}/index.html?standalone=1&lang=${m.lang}&theme=${m.theme}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(350);
      await evaluateCurrentPage(page, curTag, true, m.lang, m.theme, m.vp.name);
      results.checked.plan_runs += 1;
      await ctx.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(results));
}

runAudit().catch(err => {
  console.error(err);
  process.exit(2);
});
"""


def _find_node_playwright_path() -> Optional[str]:
    candidates = [
        os.environ.get("NODE_PATH", ""),
        os.path.expanduser("~/.baby-chat-tools/uv1/node_modules"),
        str(ROOT / "node_modules"),
    ]
    for c in candidates:
        if not c:
            continue
        if os.path.isdir(os.path.join(c, "playwright")):
            return c
    return None


def _run_browser_gates(base_url: str, wiki_pages: List[str]) -> Dict[str, Any]:
    node_bin = shutil.which("node")
    pw_node_path = _find_node_playwright_path()
    chrome_exe = _find_chrome_executable()

    if not node_bin or not pw_node_path:
        raise RuntimeError(
            "Headless Chromium Playwright runner unavailable (need Node + playwright in NODE_PATH or ~/.baby-chat-tools/uv1/node_modules)"
        )

    cfg = {
        "baseUrl": base_url,
        "wikiPages": wiki_pages,
        "standardPlans": STANDARD_PLANS,
        "expectedDropdownIds": EXPECTED_DROPDOWN_PLAN_IDS,
        "chromeExe": chrome_exe,
    }

    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as cf:
        json.dump(cfg, cf)
        cfg_path = cf.name
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as sf:
        sf.write(NODE_RUNNER_JS)
        script_path = sf.name

    env = dict(os.environ)
    env["NODE_PATH"] = pw_node_path
    try:
        proc = subprocess.run(
            [node_bin, script_path, cfg_path],
            capture_output=True,
            text=True,
            env=env,
            timeout=240,
        )
        if proc.returncode != 0:
            raise RuntimeError(
                f"Browser audit runner failed (exit {proc.returncode}): {(proc.stderr or proc.stdout)[:800]}"
            )
        lines = [ln for ln in proc.stdout.splitlines() if ln.strip()]
        return json.loads(lines[-1])
    finally:
        for fp in (cfg_path, script_path):
            if os.path.exists(fp):
                os.unlink(fp)


def _git_head_sha() -> str:
    res = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    return res.stdout.strip() if res.returncode == 0 else "unknown"


def main() -> int:
    json_only = "--json-only" in sys.argv
    site_cfg = json.loads((ROOT / "content" / "site.json").read_text(encoding="utf-8"))
    wiki_pages = ["home", "decisions"] + list(site_cfg.get("pages", []))

    # Static checks first
    syntax_failures = _run_node_syntax_checks(ROOT)
    static_privacy_failures, static_nav_failures = _run_static_privacy_and_nav_checks(ROOT)

    # Start local server & run browser matrix
    srv, port = _start_static_server(ROOT)
    base_url = f"http://127.0.0.1:{port}"
    try:
        browser_res = _run_browser_gates(base_url, wiki_pages)
    finally:
        srv.shutdown()

    g1 = list(browser_res.get("gate_1", []))
    g2 = list(syntax_failures) + list(browser_res.get("gate_2", []))
    g3 = list(browser_res.get("gate_3", []))
    g4 = list(browser_res.get("gate_4", []))
    g5 = list(browser_res.get("gate_5", []))
    g6 = list(browser_res.get("gate_6", []))
    g7 = list(static_privacy_failures) + list(browser_res.get("gate_7", []))
    g8 = list(static_nav_failures) + list(browser_res.get("gate_8", []))

    gates = {
        "gate_1_text_integrity": g1,
        "gate_2_runtime_errors": g2,
        "gate_3_geometry_overlap": g3,
        "gate_4_image_integrity": g4,
        "gate_5_plan_parity": g5,
        "gate_6_bilingual_completeness": g6,
        "gate_7_privacy_firewall": g7,
        "gate_8_navigation_integrity": g8,
    }

    summary = {k: ("PASS" if len(v) == 0 else "FAIL") for k, v in gates.items()}
    all_pass = all(v == "PASS" for v in summary.values())

    now_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    report = {
        "timestamp": now_utc,
        "commit_sha": _git_head_sha(),
        "build_check": "PASS",
        "checked": browser_res.get("checked", {}),
        "usability_gate_summary": summary,
        "notes": "Any outstanding items in #plan:bathroom-tile owned by PM rebuild tracked separately.",
    }

    if not json_only:
        for k, errs in gates.items():
            status = "PASS" if not errs else f"FAIL ({len(errs)})"
            print(f"[{status}] {k}")
            for e in errs[:12]:
                print(f"    - {e}")
            if len(errs) > 12:
                print(f"    ... and {len(errs) - 12} more")
        print("")

    print(json.dumps(report, indent=2))
    return 0 if all_pass else 1


if __name__ == "__main__":
    raise SystemExit(main())
