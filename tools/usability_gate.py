#!/usr/bin/env python3
"""Unit 4 Wiki — 4-Layer, 13-Gate Automated Usability & Visual QA Suite.

Python 3.9-3.14 compatible (no backslashes inside f-string expressions; raw regex strings).
Runs headless Chromium via Playwright against a local HTTP server serving the built wiki
(`index.html`) and all interactive plans (`plans/*/index.html`).

Usage:
  python3 tools/usability_gate.py
  python3 tools/usability_gate.py --update-baselines
  python3 tools/usability_gate.py --json
  python3 tools/usability_gate.py --report tmp/usability-report.html

Exit codes:
  0  All 13 gates PASSED
  1  One or more gates FAILED (details printed + saved to HTML report)
"""
from __future__ import annotations

import argparse
import asyncio
import base64
import datetime
import functools
import itertools
import html
import http.server
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("ERROR: playwright is required (pip install playwright && playwright install chromium)", file=sys.stderr)
    sys.exit(2)

try:
    from PIL import Image, ImageChops
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

from usability_editorial import JS_EDITORIAL_BLOCKS, audit_blocks, render_queue

ROOT = Path(__file__).resolve().parent.parent

ALL_PLAN_IDS = [
    "kitchen-west-ks4",
    "kitchen-floor-plan",
    "kitchen-electrical",
    "attic-hatch",
    "hvac-layout",
    "murphy-door",
    "bathroom-tile",
]

KITCHEN_3TAB_PLANS = [
    "kitchen-west-ks4",
    "kitchen-floor-plan",
    "kitchen-electrical",
]

ROOM_PAGES_CORE = [
    "kitchen",
    "bathroom",
    "electrical",
    "hvac",
    "attic-access",
    "laundry",
]

BROKEN_TEXT_PATTERNS = [
    (re.compile(r"\bundefined\b"), "literal 'undefined'"),
    (re.compile(r"\bnull\b"), "literal 'null'"),
    (re.compile(r"\bNaN\b"), "literal 'NaN'"),
    (re.compile(r"\[object Object\]"), "literal '[object Object]'"),
    (re.compile(r"\ufffd"), "replacement glyph U+FFFD"),
]

ES_LEFTOVER_UI_PATTERNS = [
    (re.compile(r"\bPrint 2-Page PDF\b"), "untranslated 'Print 2-Page PDF'"),
    (re.compile(r"\bAll Plans\s*▾"), "untranslated 'All Plans ▾'"),
    (re.compile(r"\bBack to (Kitchen|Bathroom|Electrical|Heating|Attic|Laundry)\b"), "untranslated 'Back to ...'"),
    (re.compile(r"\b50% running bond\b", re.I), "untranslated '50% running bond'"),
    (re.compile(r"←\s*35[″\"]\s*WEST\b"), "untranslated 'WEST'"),
    (re.compile(r"\b69-5/16[″\"]\s*NORTH\b"), "untranslated 'NORTH'"),
    (re.compile(r"\b35[″\"]\s*EAST\s*→"), "untranslated 'EAST'"),
    (re.compile(r"[☀☾]\s*(Light|Dark)\b"), "untranslated 'Light/Dark' button"),
]

STALE_COPY_PATTERNS = [
    (re.compile(r"\bMon(?:day)?,?\s+Nov\s+23\b", re.I), "stale date 'Mon Nov 23'"),
    (re.compile(r"\blun(?:es)?\s+23\s+(?:de\s+)?nov\b", re.I), "stale date 'lunes 23 nov'"),
    (re.compile(r"\bD6/L6\s+pocket-door\s+cavities\b", re.I), "stale 'D6/L6 pocket-door cavities'"),
    (re.compile(r"A\s+BATHROOM\s+POCKET\s+DOOR", re.I), "stale 'A BATHROOM POCKET DOOR'"),
]

# Privacy & Backend Plumbing Firewall Regexes
PRICE_RE = re.compile(r"(?<![A-Za-z0-9_])\$[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?(?!\w)")
PRIVATE_ID_RE = re.compile(r"1231-11th-avenue-private|1S_PRIVATE_FOLDER", re.I)
MEDICAL_RE = re.compile(r"\b(?:hospitaliz\w*|surgery|chemo\w*|cancer|diagnos\w*|ER\s+visit|urgent\s+care|medical\s+leave)\b", re.I)
BACKEND_JARGON_RE = re.compile(r"\b(?:Tailnet\s+Live|EOD\s+Review|measure_boundary|K_S4_BASELINE|rev-2026\d{4}[-\w]*)\b")
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
AGENT_BRIEF_RE = re.compile(r'<section\s+id=["\']agent-brief["\'][^>]*>.*?</section>', re.S | re.I)
FIREWALL_DEF_RE = re.compile(r"FIREWALL_RE\s*=.*?(?:;|\n)")
INLINE_SCRIPT_RE = re.compile(r"<script(?:\s[^>]*)?>(.*?)</script>", re.S | re.I)
SCRIPT_SRC_ATTR_RE = re.compile(r"\bsrc\s*=", re.I)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format_str: str, *args: Any) -> None:
        pass


def start_server(root: Path) -> Tuple[http.server.ThreadingHTTPServer, str]:
    handler = functools.partial(QuietHandler, directory=str(root))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}"


def find_chromium_executable() -> Optional[str]:
    candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None


def strip_firewall_exclusions(raw_html: str) -> str:
    cleaned = AGENT_BRIEF_RE.sub("", raw_html)
    cleaned = HTML_COMMENT_RE.sub("", cleaned)
    cleaned = FIREWALL_DEF_RE.sub("", cleaned)
    return cleaned


def run_node_syntax_checks(root: Path) -> List[str]:
    failures: List[str] = []
    # Check all standalone JS files under plans/
    js_files = sorted(root.glob("plans/**/*.js"))
    for jf in js_files:
        if "vendor/jspdf" in str(jf) or "vendor/svg2pdf" in str(jf):
            continue
        res = subprocess.run(["node", "--check", str(jf)], capture_output=True, text=True)
        if res.returncode != 0:
            rel = jf.relative_to(root)
            err_line = (res.stderr or res.stdout).strip()[:240]
            failures.append(f"JS syntax error in {rel}: {err_line}")

    # Check inline <script> blocks in index.html and plans/*/index.html
    html_files = [root / "index.html"] + sorted(root.glob("plans/*/index.html"))
    for hf in html_files:
        if not hf.exists():
            continue
        text = hf.read_text(encoding="utf-8", errors="replace")
        for idx, m in enumerate(INLINE_SCRIPT_RE.finditer(text), start=1):
            open_tag = text[m.start():m.start() + 120]
            tag_head = open_tag.split(">", 1)[0]
            if SCRIPT_SRC_ATTR_RE.search(tag_head) or "application/json" in tag_head.lower():
                continue
            code = m.group(1).strip()
            if not code:
                continue
            with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tf:
                tf.write(code)
                tmp_path = tf.name
            try:
                res = subprocess.run(["node", "--check", tmp_path], capture_output=True, text=True)
                if res.returncode != 0:
                    rel = hf.relative_to(root)
                    err_line = (res.stderr or res.stdout).strip()[:240]
                    failures.append(f"Inline <script> #{idx} syntax error in {rel}: {err_line}")
            finally:
                try:
                    os.unlink(tmp_path)
                except OSError:
                    pass
    return failures


def run_static_privacy_and_nav_checks(root: Path) -> Tuple[List[str], List[str]]:
    privacy_failures: List[str] = []
    nav_failures: List[str] = []

    # 1. Privacy firewall across built index.html, content/pages/*, content/packets.json, plans/*
    scan_paths: List[Path] = [root / "index.html", root / "content/packets.json"]
    scan_paths.extend(sorted(root.glob("content/pages/**/*.*")))
    scan_paths.extend(sorted(root.glob("plans/**/*.html")))
    scan_paths.extend(sorted(root.glob("plans/**/*.js")))
    for p in scan_paths:
        if not p.is_file():
            continue
        if any(skip in str(p) for skip in ("jspdf.umd", "svg2pdf.umd", "unit4-backend-knowledge")):
            continue
        raw = p.read_text(encoding="utf-8", errors="replace")
        cleaned = strip_firewall_exclusions(raw)
        rel = str(p.relative_to(root))

        # Remove JS regex literal lines / comment-only firewall descriptions
        for pat_name, rx in [
            ("currency price ($)", PRICE_RE),
            ("Private Drive reference", PRIVATE_ID_RE),
            ("crew medical term", MEDICAL_RE),
        ]:
            for m in rx.finditer(cleaned):
                start = max(0, m.start() - 40)
                end = min(len(cleaned), m.end() + 40)
                snippet = cleaned[start:end].replace("\n", " ")
                # Exclude code regex definitions or harmless JS template interpolation like $1/$2
                if pat_name == "currency price ($)" and (re.search(r"replace\(|RegExp|/\^", snippet) or re.search(r"""["']\$[1-9]["']""", snippet)):
                    continue
                if pat_name == "Private Drive reference" and ("never share" in snippet.lower() or "private folder" in snippet.lower()):
                    continue
                privacy_failures.append(f"{rel}: {pat_name} matched '{m.group(0)}' near '...{snippet}...'")
                break

    # 2. Local nav integrity: zero local wiki-docs/*.html or plans/* links with target="_blank"
    local_blank_rx = re.compile(
        r'<a\b[^>]*href=["\'](?:\./|\.\./)?(?:wiki-docs/[^"\']+\.html|plans/[^"\']+)["\'][^>]*target=["\']_blank["\']|'
        r'<a\b[^>]*target=["\']_blank["\'][^>]*href=["\'](?:\./|\.\./)?(?:wiki-docs/[^"\']+\.html|plans/[^"\']+)["\']',
        re.I,
    )
    for p in [root / "index.html"] + sorted(root.glob("content/pages/**/*.html")) + sorted(root.glob("plans/*/index.html")):
        if not p.is_file():
            continue
        text = strip_firewall_exclusions(p.read_text(encoding="utf-8", errors="replace"))
        for m in local_blank_rx.finditer(text):
            rel = str(p.relative_to(root))
            nav_failures.append(f"{rel}: local wiki-docs/plans link forces target='_blank': {m.group(0)[:120]}")

    return privacy_failures, nav_failures


async def setup_network_stubs(page: Any, base_url: str, intake_capture: Optional[List[Dict[str, Any]]] = None) -> None:
    async def handle_route(route: Any) -> None:
        req = route.request
        url = req.url
        if "/api/unit4/wiki-intake" in url:
            body_json: Dict[str, Any] = {}
            try:
                body_json = json.loads(req.post_data or "{}")
            except Exception:
                body_json = {"raw": req.post_data}
            if intake_capture is not None:
                intake_capture.append(body_json)
            await route.fulfill(
                status=200,
                content_type="application/json",
                headers={"Access-Control-Allow-Origin": "*"},
                body=json.dumps({"ok": True, "id": "mock-intake-ok"}),
            )
            return
        if "/api/unit4/" in url:
            await route.fulfill(
                status=200,
                content_type="application/json",
                headers={"Access-Control-Allow-Origin": "*"},
                body=json.dumps({"ok": True, "renders": [], "references": [], "items": [], "decisions": [], "reports": []}),
            )
            return
        if url.startswith(base_url) or url.startswith("data:") or url.startswith("blob:"):
            await route.continue_()
            return
        if "cdnjs.cloudflare.com" in url:
            await route.continue_()
            return
        # Abort slow external trackers/Drive fetches so headless runs stay fast & deterministic
        await route.abort()

    await page.route("**/*", handle_route)


async def disable_animations(page: Any) -> None:
    await page.add_style_tag(content="*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }")
    try:
        await page.evaluate("() => document.fonts ? document.fonts.ready : Promise.resolve()")
    except Exception:
        pass


JS_CONTRAST_AND_ARIA = r"""
() => {
  function parseColor(str) {
    if (!str || str === 'transparent') return [0, 0, 0, 0];
    const m = str.match(/rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)(?:[,\s/]+([0-9.]+))?\s*\)/i);
    if (!m) return null;
    return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), m[4] !== undefined ? parseFloat(m[4]) : 1];
  }
  function blend(fg, bg) {
    const a = fg[3];
    return [
      fg[0] * a + bg[0] * (1 - a),
      fg[1] * a + bg[1] * (1 - a),
      fg[2] * a + bg[2] * (1 - a),
      1
    ];
  }
  function effectiveBg(el) {
    const stack = [];
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const c = parseColor(getComputedStyle(cur).backgroundColor);
      if (c && c[3] > 0) stack.push(c);
      if (c && c[3] >= 0.999) break;
      cur = cur.parentElement;
    }
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    let bg = isDark ? [18, 22, 24, 1] : [244, 245, 243, 1];
    for (let i = stack.length - 1; i >= 0; i--) {
      bg = blend(stack[i], bg);
    }
    return bg;
  }
  function relLum(rgb) {
    const s = rgb.slice(0, 3).map(v => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
  }
  function ratio(c1, c2) {
    const l1 = relLum(c1), l2 = relLum(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function isVisible(el) {
    if (!el || el.closest('[hidden], .sr-only, #agent-brief')) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  }

  const contrastIssues = [];
  const ariaIssues = [];

  // Check accessible names on every visible button
  document.querySelectorAll('button, [role="button"]').forEach(btn => {
    if (!isVisible(btn)) return;
    const txt = (btn.innerText || btn.textContent || '').trim();
    const aria = (btn.getAttribute('aria-label') || btn.getAttribute('title') || '').trim();
    const labelledBy = btn.getAttribute('aria-labelledby');
    if (!txt && !aria && !labelledBy) {
      ariaIssues.push('Unnamed button: #' + (btn.id || '') + '.' + (btn.className || ''));
    }
  });

  // Sample primary visible headings, buttons, badges, links, and paragraphs for contrast
  const selectors = 'h1, h2, h3, p, li, button, a, .u4-gal-tag, .u4h-seg-item, .u4h-step-btn, .u4h-pill, .u4h-badge, .u4h-status, .u4h-hold-strip';
  const nodes = Array.from(document.querySelectorAll(selectors)).slice(0, 260);
  for (const el of nodes) {
    if (!isVisible(el)) continue;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.fontSize) < 4) continue; // icon-only font-size:0 button
    let directText = '';
    for (const ch of el.childNodes) {
      if (ch.nodeType === 3) directText += ch.nodeValue;
    }
    if (!directText.trim()) continue;
    const fg = parseColor(cs.color);
    if (!fg || fg[3] < 0.1) continue;
    const bg = effectiveBg(el);
    const fgComp = fg[3] < 1 ? blend(fg, bg) : fg;
    const cr = ratio(fgComp, bg);
    const fs = parseFloat(cs.fontSize);
    const fw = parseInt(cs.fontWeight, 10) || 400;
    const isLarge = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const minReq = isLarge ? 3.0 : 4.5; // WCAG AA computed-color threshold
    if (cr < minReq) {
      contrastIssues.push(
        el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
        (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') +
        ' ratio=' + cr.toFixed(2) + ' < ' + minReq + ' text="' + directText.trim().slice(0, 32) + '"'
      );
      if (contrastIssues.length >= 12) break;
    }
  }
  return { contrastIssues, ariaIssues };
}
"""

JS_SVG_FORENSICS = r"""
() => {
  const issues = [];
  const svgs = Array.from(document.querySelectorAll('svg'));
  for (const svg of svgs) {
    if (svg.closest('[hidden], #blueprint-sheet-shell, #u4PrintRoot')) continue;
    const sr = svg.getBoundingClientRect();
    if (sr.width < 80 || sr.height < 80) continue; // skip tiny UI icons
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || vb.width <= 0 || vb.height <= 0) continue;
    const texts = Array.from(svg.querySelectorAll('text'));
    const boxes = [];
    for (const t of texts) {
      const txt = (t.textContent || '').trim();
      if (!txt) continue;
      const cs = getComputedStyle(t);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue;
      let bb;
      try { bb = t.getBBox(); } catch (_) { continue; }
      if (!bb || bb.width <= 0 || bb.height <= 0) continue;
      // Map text bbox corners into root svg viewBox space
      let ctm = null;
      try {
        const sctm = svg.getScreenCTM();
        const tctm = t.getScreenCTM();
        if (sctm && tctm) {
          const inv = sctm.inverse();
          ctm = inv.multiply(tctm);
        }
      } catch (_) {}
      let x0 = bb.x, y0 = bb.y, x1 = bb.x + bb.width, y1 = bb.y + bb.height;
      if (ctm) {
        const pts = [
          new DOMPoint(bb.x, bb.y).matrixTransform(ctm),
          new DOMPoint(bb.x + bb.width, bb.y).matrixTransform(ctm),
          new DOMPoint(bb.x, bb.y + bb.height).matrixTransform(ctm),
          new DOMPoint(bb.x + bb.width, bb.y + bb.height).matrixTransform(ctm),
        ];
        x0 = Math.min(...pts.map(p => p.x));
        y0 = Math.min(...pts.map(p => p.y));
        x1 = Math.max(...pts.map(p => p.x));
        y1 = Math.max(...pts.map(p => p.y));
      }
      const tol = 8;
      if (x0 < vb.x - tol || y0 < vb.y - tol || x1 > vb.x + vb.width + tol || y1 > vb.y + vb.height + tol) {
        issues.push('SVG text clipped outside viewBox: "' + txt.slice(0, 36) + '" box=[' + Math.round(x0) + ',' + Math.round(y0) + ',' + Math.round(x1) + ',' + Math.round(y1) + '] vb=[' + vb.x + ',' + vb.y + ',' + (vb.x + vb.width) + ',' + (vb.y + vb.height) + ']');
      }
      boxes.push({ txt, x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 });
    }
    // Pairwise severe label collision check (require meaningful intersection > 45% of smaller box area)
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        const ix = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0));
        const iy = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
        if (ix > 4 && iy > 4) {
          const inter = ix * iy;
          const minArea = Math.min(a.w * a.h, b.w * b.h);
          if (minArea > 0 && (inter / minArea) > 0.45) {
            issues.push('SVG text overlap: "' + a.txt.slice(0, 24) + '" vs "' + b.txt.slice(0, 24) + '"');
          }
        }
      }
    }
  }
  return issues.slice(0, 20);
}
"""

JS_IMAGE_INTEGRITY = r"""
async () => {
  const issues = [];
  const imgs = Array.from(document.querySelectorAll('img'));
  for (const img of imgs) {
    if (img.closest('[hidden], #u4PrintRoot, #blueprint-sheet-shell, .u4-lb-backdrop[hidden]')) continue;
    let hidden = false;
    for (let node = img; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' ||
          (node.tagName === 'DETAILS' && !node.open && !img.closest('summary'))) hidden = true;
    }
    if (hidden || !img.getClientRects().length) continue;
    // Visible lazy images must finish loading before checking their dimensions.
    img.loading = 'eager';
    try { await img.decode(); } catch (_) { /* broken images are reported below */ }
    const cs = getComputedStyle(img);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = img.getBoundingClientRect();
    if (r.width === 0 && r.height === 0 && !img.getAttribute('src')) continue;
    const src = img.getAttribute('src') || '';
    if (!src) continue;
    if (!img.complete || img.naturalWidth === 0) {
      issues.push('Broken image (naturalWidth=0): ' + src + ' alt="' + (img.alt || '').slice(0, 40) + '"');
      continue;
    }
    if (r.width > 20 && r.height > 20 && (cs.objectFit === 'fill' || !cs.objectFit)) {
      const natRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
      const renRatio = r.width / Math.max(1, r.height);
      const dist = Math.max(natRatio / renRatio, renRatio / natRatio);
      if (dist > 2.2) {
        issues.push('Distorted aspect ratio (' + dist.toFixed(2) + 'x): ' + src);
      }
    }
  }
  return issues;
}
"""

JS_OVERLAP_AND_WRAP = r"""
() => {
  const issues = [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  function visibleRect(el) {
    if (!el || el.closest('[hidden]')) return null;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return null;
    return r;
  }

  function intersectArea(a, b) {
    const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return ix * iy;
  }

  // 1. Check fixed floating controls against content cards/headings/checklist/buttons
  const floaters = Array.from(document.querySelectorAll('.u4-pin-fab, .u4-pin-float-pill, #u4AiFloatingDock, .u4-lai-dock')).filter(el => {
    const cs = getComputedStyle(el);
    return cs.position === 'fixed' && visibleRect(el);
  });
  const allTargets = Array.from(document.querySelectorAll('main h1, main h2, .u4h-card h2, .u4h-card h3, .u4h-card p, .u4h-step-body p, .ck li, .u4-plan-launch-card, .u4-gal-btn, .u4-who-chip, #repSend, .u4h-body button, .u4h-body input'));
  for (const fl of floaters) {
    const fr = visibleRect(fl);
    if (!fr) continue;
    const checkList = allTargets;
    for (const tg of checkList) {
      if (fl.contains(tg) || tg.contains(fl)) continue;
      const txt = (tg.innerText || tg.getAttribute('aria-label') || '').trim();
      if (!txt) continue;
      const tr = visibleRect(tg);
      if (!tr) continue;
      const area = intersectArea(fr, tr);
      if (area > 60) {
        issues.push('Fixed floater ' + (fl.id ? '#' + fl.id : '.' + fl.className) + ' overlaps ' + tg.tagName.toLowerCase() + ' "' + txt.slice(0, 32) + '"');
        if (issues.length >= 10) break;
      }
    }
  }

  // 2. Check top-bar segmented pills for 2-line wrapping or border clipping
  const segContainers = Array.from(document.querySelectorAll('div.u4h-seg-switch'));
  for (const sc of segContainers) {
    const sr = visibleRect(sc);
    if (!sr) continue;
    const items = Array.from(sc.querySelectorAll('.u4h-seg-item'));
    let firstTop = null;
    for (const it of items) {
      const ir = it.getBoundingClientRect();
      if (ir.width < 1 || ir.height < 1) continue;
      if (firstTop === null) firstTop = ir.top;
      if (Math.abs(ir.top - firstTop) > 6) {
        issues.push('Segmented switcher wrapped to 2nd row: "' + (it.innerText || '').trim() + '"');
      }
      if (it.scrollHeight > it.clientHeight + 2) {
        issues.push('Segmented pill text overflow/clip: "' + (it.innerText || '').trim() + '" (scrollH=' + it.scrollHeight + ' clientH=' + it.clientHeight + ')');
      }
      if (ir.height > 44) {
        issues.push('Segmented pill wrapped to multiple lines (h=' + Math.round(ir.height) + 'px): "' + (it.innerText || '').trim() + '"');
      }
    }
  }
  return issues;
}
"""

JS_TARGET_SIZE = r"""
(isMobile) => {
  const issues = [];
  const overflow = document.documentElement.scrollWidth > window.innerWidth + 2;
  if (overflow) {
    issues.push('Horizontal overflow: scrollWidth=' + document.documentElement.scrollWidth + ' > innerWidth=' + window.innerWidth);
  }
  // Check sticky header targets on 390px phone (>= 36px height)
  if (isMobile) {
    const headerBtns = Array.from(document.querySelectorAll('.mobile button, .u4h-topbar button, .u4h-topbar a.u4h-nav-link, .u4h-topbar a.u4h-seg-item'));
    for (const el of headerBtns) {
      if (el.closest('[hidden]')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.height < 35.5) {
        issues.push('Mobile sticky header control < 36px tall (' + Math.round(r.height) + 'px): "' + (el.innerText || el.getAttribute('aria-label') || el.id).trim().slice(0, 30) + '"');
      }
    }
  }
  // Global 24x24 minimum for primary interactive buttons
  const primaryBtns = Array.from(document.querySelectorAll('header button, main > .bar button, .u4h-topbar button, .u4h-pager button, .u4-gal-btn, .u4-pin-fab, #u4AiFloatingDock button'));
  for (const el of primaryBtns) {
    if (el.closest('[hidden]')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.width < 23.5 || r.height < 23.5) {
      issues.push('Control < 24x24px (' + Math.round(r.width) + 'x' + Math.round(r.height) + '): ' + (el.id || el.className));
    }
  }
  return issues;
}
"""


async def run_suite(args: argparse.Namespace) -> Dict[str, Any]:
    srv, base_url = start_server(ROOT)
    baselines_dir = Path(args.baselines_dir)
    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    if args.update_baselines:
        baselines_dir.mkdir(parents=True, exist_ok=True)

    gates: Dict[str, Dict[str, Any]] = {
        "gate_1_pin_send_e2e": {"layer": "Layer 1 — Real Interactive User Journeys", "title": "Pin Send Correction E2E (Click + Enter)", "status": "PASS", "details": []},
        "gate_2_lang_theme_continuous_nav": {"layer": "Layer 1 — Real Interactive User Journeys", "title": "Language, Theme & Continuous Nav Journey", "status": "PASS", "details": []},
        "gate_3_plan_controls_ai_ergonomics": {"layer": "Layer 1 — Real Interactive User Journeys", "title": "Plan Controls, All Plans Parity & Ask AI Ergonomics", "status": "PASS", "details": []},
        "gate_4_target_size_390px_touch": {"layer": "Layer 2 — WCAG 2.2 AA & Touch Ergonomics", "title": "Target Size 2.5.8 & 390px Touch Craft", "status": "PASS", "details": []},
        "gate_5_focus_not_obscured_keyboard": {"layer": "Layer 2 — WCAG 2.2 AA & Touch Ergonomics", "title": "Focus Not Obscured 2.4.11 & Keyboard Walk", "status": "PASS", "details": []},
        "gate_6_contrast_aria_light_dark": {"layer": "Layer 2 — WCAG 2.2 AA & Touch Ergonomics", "title": "WCAG Contrast & ARIA in Light + Dark", "status": "PASS", "details": []},
        "gate_7_svg_clip_collision": {"layer": "Layer 3 — Geometric, SVG, Photo & Content Forensics", "title": "SVG Text Clipping & Label Collision", "status": "PASS", "details": []},
        "gate_8_image_integrity_aspect": {"layer": "Layer 3 — Geometric, SVG, Photo & Content Forensics", "title": "Image Integrity & Aspect Ratio", "status": "PASS", "details": []},
        "gate_9_multiscroll_overlap_pill_wrap": {"layer": "Layer 3 — Geometric, SVG, Photo & Content Forensics", "title": "Multi-Scroll Overlap & Top-Bar Pill Wrap", "status": "PASS", "details": []},
        "gate_10_text_es_parity_print": {"layer": "Layer 3 — Geometric, SVG, Photo & Content Forensics", "title": "Zero Broken Text, ES Parity & Print Emulation", "status": "PASS", "details": []},
        "gate_11_privacy_hygiene_syntax": {"layer": "Layer 3 — Geometric, SVG, Photo & Content Forensics", "title": "Privacy Firewall, Spec Hygiene & Script Syntax", "status": "PASS", "details": []},
        "gate_12_visual_baselines_report": {"layer": "Layer 4 — Visual Baselines & HTML QA Report", "title": "Golden Screenshots + Diff Report", "status": "PASS", "details": []},
        "gate_13_editorial_audit": {"layer": "Layer 4 — Editorial Review", "title": "Editorial, Anti-Redundancy & Meaningful Instructions", "status": "PASS", "details": []},
    }

    screenshots_for_report: List[Dict[str, str]] = []
    runtime_errors: List[str] = []
    editorial_queue: List[Dict[str, str]] = []
    editorial_seen = set()
    coverage: List[str] = []

    async def editorial_audit(page: Any, label: str, lang: str, room: bool = False) -> None:
        snapshot = await page.evaluate(JS_EDITORIAL_BLOCKS)
        coverage.append(label + "/" + lang)
        for finding in audit_blocks(snapshot, label, lang, room=room):
            key = (finding["page"], lang, finding["selector"], finding["text"], finding["reason"])
            if key not in editorial_seen:
                editorial_seen.add(key)
                editorial_queue.append(finding)
                fail("gate_13_editorial_audit", label + " [" + lang + "] " + finding["selector"] + ": " + finding["reason"])


    def fail(gate_key: str, msg: str) -> None:
        gates[gate_key]["status"] = "FAIL"
        gates[gate_key]["details"].append(msg)

    def note(gate_key: str, msg: str) -> None:
        gates[gate_key]["details"].append(msg)

    # ── Static checks for Gate 2 & Gate 11 ───────────────────────────────────
    syntax_errs = run_node_syntax_checks(ROOT)
    for err in syntax_errs:
        fail("gate_11_privacy_hygiene_syntax", err)
    if not syntax_errs:
        note("gate_11_privacy_hygiene_syntax", "node --check passed on all inline scripts and plans/**/*.js")

    priv_errs, nav_errs = run_static_privacy_and_nav_checks(ROOT)
    for err in priv_errs:
        fail("gate_11_privacy_hygiene_syntax", err)
    if not priv_errs:
        note("gate_11_privacy_hygiene_syntax", "Static privacy firewall passed (0 prices, 0 Private IDs, 0 medical leaks)")

    for err in nav_errs:
        fail("gate_2_lang_theme_continuous_nav", err)

    async with async_playwright() as pw:
        launch_kw: Dict[str, Any] = {"args": ["--no-sandbox"]}
        exe = find_chromium_executable()
        if exe:
            launch_kw["executable_path"] = exe
        browser = await pw.chromium.launch(**launch_kw)
        print("Running 13 usability gates (backend requests intercepted).", file=sys.stderr, flush=True)

        def attach_err_listeners(page: Any, label: str) -> None:
            page.on("pageerror", lambda e: runtime_errors.append(f"[{label}] pageerror: {str(e)[:200]}"))
            def on_console(msg: Any) -> None:
                if msg.type == "error":
                    txt = msg.text
                    if "Failed to load resource" in txt and ("ERR_FAILED" in txt or "ERR_ABORTED" in txt):
                        return
                    runtime_errors.append(f"[{label}] console.error: {txt[:200]}")
            page.on("console", on_console)

        # ══════════════════════════════════════════════════════════════════════
        # LAYER 1 — GATE 1: Pin Send Correction E2E (Click + Enter)
        # ══════════════════════════════════════════════════════════════════════
        intake_payloads: List[Dict[str, Any]] = []
        ctx1 = await browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        p1 = await ctx1.new_page()
        attach_err_listeners(p1, "gate1-pin")
        await setup_network_stubs(p1, base_url, intake_capture=intake_payloads)
        await p1.goto(f"{base_url}/index.html?lang=en&theme=light#kitchen", wait_until="domcontentloaded")
        await p1.wait_for_timeout(900)
        try:
            pill = p1.locator("#u4PinDragPill")
            if not await pill.is_visible():
                fail("gate_1_pin_send_e2e", "#u4PinDragPill not visible on #kitchen")
            else:
                # 1a. Click Drag/Tap -> tap #doc -> type note -> click Send Correction
                await pill.click()
                await p1.wait_for_timeout(150)
                if await pill.get_attribute("aria-pressed") != "true":
                    fail("gate_1_pin_send_e2e", "Clicking #u4PinDragPill did not arm pin mode (aria-pressed!='true')")
                doc_box = await p1.locator("#doc").bounding_box()
                if not doc_box:
                    fail("gate_1_pin_send_e2e", "#doc bounding box missing")
                else:
                    await p1.mouse.click(doc_box["x"] + min(220, doc_box["width"] / 2), doc_box["y"] + 160)
                    await p1.wait_for_timeout(200)
                    inp = p1.locator("#u4PinInput")
                    if not await inp.is_visible():
                        fail("gate_1_pin_send_e2e", "#u4PinInput popover did not open after dropping pin")
                    else:
                        await inp.fill("Verify 12-inch South base cabinet clearance")
                        await p1.locator("[data-u4-ps-send]").click()
                        await p1.wait_for_timeout(350)
                        status_txt = (await p1.locator("[data-u4-ps-status]").inner_text()).strip()
                        if not status_txt:
                            fail("gate_1_pin_send_e2e", "Inline status [data-u4-ps-status] stayed empty after Send Correction")
                        if not intake_payloads:
                            fail("gate_1_pin_send_e2e", "No POST /api/unit4/wiki-intake intercepted on Send Correction click")
                        else:
                            pl = intake_payloads[-1]
                            missing = [k for k in ("room", "summary", "details", "text", "x_pct", "y_pct") if k not in pl or pl[k] in ("", None)]
                            if missing:
                                fail("gate_1_pin_send_e2e", f"Intercepted pin payload missing fields: {missing}")
                            elif pl.get("room") != "kitchen":
                                fail("gate_1_pin_send_e2e", f"Expected room='kitchen', got '{pl.get('room')}'")
                        # Wait for auto-clear (~1400ms)
                        await p1.wait_for_timeout(1650)
                        remaining_pins = await p1.locator(".u4-pin-marker").count()
                        if remaining_pins != 0:
                            fail("gate_1_pin_send_e2e", f"Ephemeral pin did not auto-clear after send (remaining={remaining_pins})")

                        # 1b. Test Enter-to-send keyboard trigger
                        count_before = len(intake_payloads)
                        await pill.click()
                        await p1.wait_for_timeout(150)
                        await p1.mouse.click(doc_box["x"] + min(260, doc_box["width"] / 2), doc_box["y"] + 210)
                        await p1.wait_for_timeout(200)
                        await inp.fill("Check hood 6-inch rigid duct center via Enter")
                        await inp.press("Enter")
                        await p1.wait_for_timeout(350)
                        if len(intake_payloads) <= count_before:
                            fail("gate_1_pin_send_e2e", "Pressing Enter in #u4PinInput did not trigger POST /api/unit4/wiki-intake")
                        else:
                            await p1.wait_for_timeout(1650)
                            if await p1.locator(".u4-pin-marker").count() != 0:
                                fail("gate_1_pin_send_e2e", "Pin sent via Enter did not auto-clear")
                            else:
                                note("gate_1_pin_send_e2e", "Verified click + Enter pin send E2E, full payload fields, instant inline status, and ephemeral auto-clear")
        except Exception as exc:
            fail("gate_1_pin_send_e2e", f"Exception in Pin E2E journey: {exc}")
        await ctx1.close()

        # ══════════════════════════════════════════════════════════════════════
        # LAYER 1 — GATE 2: Language, Theme & Continuous Nav Journey
        # ══════════════════════════════════════════════════════════════════════
        ctx2 = await browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        p2 = await ctx2.new_page()
        attach_err_listeners(p2, "gate2-nav")
        await setup_network_stubs(p2, base_url)
        await p2.goto(f"{base_url}/index.html?lang=en&theme=light#home", wait_until="domcontentloaded")
        await p2.wait_for_timeout(800)
        try:
            # Toggle EN -> ES and Light -> Dark on Home
            await p2.locator("#langBtn").click()
            await p2.wait_for_timeout(250)
            await p2.locator("#themeBtn").click()
            await p2.wait_for_timeout(250)
            home_lang = await p2.evaluate("() => document.documentElement.lang")
            home_theme = await p2.evaluate("() => document.documentElement.getAttribute('data-theme')")
            if not str(home_lang).startswith("es") or home_theme != "dark":
                fail("gate_2_lang_theme_continuous_nav", f"Home toggle failed: lang={home_lang}, theme={home_theme}")

            # Hop to room (#attic-access)
            await p2.evaluate("() => { location.hash = '#attic-access'; }")
            await p2.wait_for_timeout(450)
            room_lang = await p2.evaluate("() => document.documentElement.lang")
            room_theme = await p2.evaluate("() => document.documentElement.getAttribute('data-theme')")
            if not str(room_lang).startswith("es") or room_theme != "dark":
                fail("gate_2_lang_theme_continuous_nav", f"Room hop dropped pref: lang={room_lang}, theme={room_theme}")

            # Check local wiki-docs link on #attic-access has no target="_blank"
            bad_links = await p2.evaluate(r"""() => {
                return Array.from(document.querySelectorAll('a[href]'))
                  .filter(a => /wiki-docs\/.+\.html|plans\//.test(a.getAttribute('href') || '') && a.getAttribute('target') === '_blank')
                  .map(a => a.getAttribute('href'));
            }""")
            if bad_links:
                fail("gate_2_lang_theme_continuous_nav", f"Local links on #attic-access force target=_blank: {bad_links}")

            # Hop to interactive plan (#plan:kitchen-floor-plan) inside persistent shell
            await p2.evaluate("() => { location.hash = '#plan:kitchen-floor-plan'; }")
            await p2.wait_for_timeout(900)
            shell_vis = await p2.locator("#u4PlanShell").is_visible()
            if not shell_vis:
                fail("gate_2_lang_theme_continuous_nav", "#u4PlanShell did not open on #plan:kitchen-floor-plan")
            else:
                frame = p2.frame_locator("#u4PlanFrame")
                iframe_lang = await frame.locator("html").get_attribute("lang")
                iframe_theme = await frame.locator("html").get_attribute("data-theme")
                if not str(iframe_lang or "").startswith("es") or iframe_theme != "dark":
                    fail("gate_2_lang_theme_continuous_nav", f"Plan iframe dropped pref: lang={iframe_lang}, theme={iframe_theme}")

            # Hop to local wiki-docs/*.html guide via #doc:2026-11-19_Attic-Opening-Plan-Interactive
            await p2.evaluate("() => { location.hash = '#doc:2026-11-19_Attic-Opening-Plan-Interactive'; }")
            await p2.wait_for_timeout(700)
            doc_iframe_count = await p2.locator("#doc iframe").count()
            doc_lang = await p2.evaluate("() => document.documentElement.lang")
            doc_theme = await p2.evaluate("() => document.documentElement.getAttribute('data-theme')")
            if doc_iframe_count < 1:
                fail("gate_2_lang_theme_continuous_nav", "Local attic-opening-plan.html did not render inside #doc iframe")
            if not str(doc_lang).startswith("es") or doc_theme != "dark":
                fail("gate_2_lang_theme_continuous_nav", f"Local guide hop dropped pref: lang={doc_lang}, theme={doc_theme}")
            if gates["gate_2_lang_theme_continuous_nav"]["status"] == "PASS":
                note("gate_2_lang_theme_continuous_nav", "EN->ES & Light->Dark persisted across Home -> #attic-access -> #plan:kitchen-floor-plan -> local wiki-docs guide with 0 target=_blank leaks")
        except Exception as exc:
            fail("gate_2_lang_theme_continuous_nav", f"Exception in continuous nav journey: {exc}")
        await ctx2.close()

        # ══════════════════════════════════════════════════════════════════════
        # LAYER 1 — GATE 3: Plan Controls, All Plans Parity & Ask AI Ergonomics
        # ══════════════════════════════════════════════════════════════════════
        ctx3 = await browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        p3 = await ctx3.new_page()
        attach_err_listeners(p3, "gate3-controls")
        await setup_network_stubs(p3, base_url)
        try:
            # 3a. Verify All Plans dropdown parity across all active interactive plans
            expected_set = set(ALL_PLAN_IDS)
            for pid in ALL_PLAN_IDS:
                await p3.goto(f"{base_url}/plans/{pid}/index.html?standalone=1&lang=en&theme=light", wait_until="domcontentloaded")
                await p3.wait_for_timeout(450)
                all_btn = p3.locator("#u4hAllPlansBtn")
                if not await all_btn.is_visible():
                    fail("gate_3_plan_controls_ai_ergonomics", f"plans/{pid}: missing #u4hAllPlansBtn")
                    continue
                await all_btn.click()
                await p3.wait_for_timeout(120)
                pop = p3.locator("#u4hAllPlansPop")
                if not await pop.is_visible():
                    fail("gate_3_plan_controls_ai_ergonomics", f"plans/{pid}: All Plans popover did not open")
                else:
                    found_ids = await p3.evaluate(r"""() => Array.from(document.querySelectorAll('#u4hAllPlansPop a[data-plan-id]')).map(a => a.getAttribute('data-plan-id'))""")
                    if set(found_ids) != expected_set:
                        fail("gate_3_plan_controls_ai_ergonomics", f"plans/{pid}: All Plans mismatch: found={sorted(found_ids)} expected={sorted(expected_set)}")
                    # Press Escape and assert focus returns to #u4hAllPlansBtn
                    await p3.keyboard.press("Escape")
                    await p3.wait_for_timeout(100)
                    if await pop.is_visible():
                        fail("gate_3_plan_controls_ai_ergonomics", f"plans/{pid}: Escape did not close All Plans dropdown")
                    focused_id = await p3.evaluate("() => document.activeElement ? document.activeElement.id : ''")
                    if focused_id != "u4hAllPlansBtn":
                        fail("gate_3_plan_controls_ai_ergonomics", f"plans/{pid}: Escape did not return focus to #u4hAllPlansBtn (got '{focused_id}')")

            # 3b. Step tabs, Next/Prev pager scroll reset, and zoom +/-/100% on kitchen-floor-plan
            await p3.goto(f"{base_url}/plans/kitchen-floor-plan/index.html?standalone=1&lang=en&theme=light", wait_until="domcontentloaded")
            await p3.wait_for_timeout(550)
            await p3.evaluate("() => window.scrollTo(0, 500)")
            await p3.wait_for_timeout(100)
            next_btn = p3.locator(".u4h-pager-btn.is-next").first
            if await next_btn.is_visible() and await next_btn.is_enabled():
                await next_btn.click()
                await p3.wait_for_timeout(200)
                sy = await p3.evaluate("() => window.scrollY")
                if sy > 8:
                    fail("gate_3_plan_controls_ai_ergonomics", f"Next pager did not reset scroll to top (scrollY={sy})")
            # Zoom controls check
            zoom_bar = p3.locator(".u4-zoom-bar").first
            if not await zoom_bar.is_visible():
                fail("gate_3_plan_controls_ai_ergonomics", "Zoom bar (.u4-zoom-bar) not visible on kitchen-floor-plan")
            else:
                zoom_in = zoom_bar.locator("button").nth(2)
                zoom_pct = zoom_bar.locator(".u4-zoom-pct")
                if await zoom_in.is_visible():
                    await zoom_in.click()
                    await p3.wait_for_timeout(120)
                    pct_after = (await zoom_pct.inner_text()).strip() if await zoom_pct.count() else ""
                    if pct_after == "100%":
                        fail("gate_3_plan_controls_ai_ergonomics", "Zoom-in button did not change zoom percentage from 100%")
                    if await zoom_pct.count():
                        await zoom_pct.click()
                        await p3.wait_for_timeout(100)

            # 3c. Ask AI popover ergonomics on index.html
            await p3.goto(f"{base_url}/index.html?lang=en&theme=light#kitchen", wait_until="domcontentloaded")
            await p3.wait_for_timeout(800)
            orb = p3.locator("#u4AiBubbleOrb")
            if not await orb.is_visible():
                fail("gate_3_plan_controls_ai_ergonomics", "#u4AiBubbleOrb not visible on #kitchen")
            else:
                await orb.click()
                await p3.wait_for_timeout(250)
                dlg = p3.locator("#u4VoiceChatDialog")
                box = await dlg.bounding_box()
                if not box:
                    fail("gate_3_plan_controls_ai_ergonomics", "#u4VoiceChatDialog did not open")
                else:
                    if box["height"] >= 220:
                        fail("gate_3_plan_controls_ai_ergonomics", f"Empty Ask AI dialog too tall: {box['height']:.1f}px (must be < 220px)")
                    mic_box = await p3.locator("#waVoiceMicPill").bounding_box()
                    if not mic_box or abs(mic_box["width"] - 32) > 2 or abs(mic_box["height"] - 32) > 2:
                        fail("gate_3_plan_controls_ai_ergonomics", f"#waVoiceMicPill not 32x32 circular: {mic_box}")
                    tr_text = (await p3.locator("#u4VoiceChatTranscript").inner_text()).strip()
                    if tr_text:
                        fail("gate_3_plan_controls_ai_ergonomics", f"Empty Ask AI has filler greeting text: '{tr_text[:80]}'")
                    # Check mute-banner resize stability: toggling data-live=muted should not change dialog height
                    h_before = box["height"]
                    await p3.evaluate("() => { const d = document.getElementById('u4VoiceChatDialog'); d.setAttribute('data-live', 'muted'); const m = document.getElementById('waVoiceMuteBtn'); if (m) m.hidden = false; }")
                    await p3.wait_for_timeout(120)
                    mute_box = await p3.locator("#waVoiceMuteBtn").bounding_box()
                    if not mute_box or abs(mute_box["width"] - 32) > 2 or abs(mute_box["height"] - 32) > 2:
                        fail("gate_3_plan_controls_ai_ergonomics", f"#waVoiceMuteBtn not 32x32 circular when visible: {mute_box}")
                    box_muted = await dlg.bounding_box()
                    if box_muted and abs(box_muted["height"] - h_before) > 6:
                        fail("gate_3_plan_controls_ai_ergonomics", f"Mute state caused Ask AI resize jump: {h_before:.1f}px -> {box_muted['height']:.1f}px")
            if gates["gate_3_plan_controls_ai_ergonomics"]["status"] == "PASS":
                note("gate_3_plan_controls_ai_ergonomics", "All 7 active plans share identical 7-item All Plans dropdown (Esc returns focus), pagers reset scroll, zoom works, Ask AI empty height <220px & 32x32 icon buttons verified")
        except Exception as exc:
            fail("gate_3_plan_controls_ai_ergonomics", f"Exception in Gate 3: {exc}")
        await ctx3.close()

        # ══════════════════════════════════════════════════════════════════════
        # LAYER 2 & LAYER 3 — FULL MATRIX SWEEP (Wiki Pages + 7 Plans)
        # ══════════════════════════════════════════════════════════════════════
        site_json = json.loads((ROOT / "content/site.json").read_text(encoding="utf-8"))
        all_wiki_keys = ["home", "decisions"] + [k for k in site_json.get("pages", []) if k not in ("home", "decisions")]

        # ── A. Desktop 1440x900 & Mobile 390x844 across Light/Dark & EN/ES ───
        viewports = [("desktop", 1440, 900), ("mobile", 390, 844)]
        for vp_name, vw, vh in viewports:
            is_mobile = vp_name == "mobile"
            for lang, theme in itertools.product(("en", "es"), ("light", "dark")):
                print(f"Matrix {vp_name}/{lang}/{theme}", file=sys.stderr, flush=True)
                ctx = await browser.new_context(viewport={"width": vw, "height": vh}, reduced_motion="reduce")
                page = await ctx.new_page()
                attach_err_listeners(page, f"wiki-{vp_name}-{lang}-{theme}")
                await setup_network_stubs(page, base_url)
                await page.goto(f"{base_url}/index.html?lang={lang}&theme={theme}#home", wait_until="domcontentloaded")
                await page.wait_for_timeout(750)
                await disable_animations(page)

                check_keys = all_wiki_keys
                for key in check_keys:
                    await page.evaluate(f"() => {{ location.hash = '#{key}'; window.scrollTo(0, 0); }}")
                    await page.wait_for_timeout(320)

                    if vp_name == "desktop" and theme == "light":
                        await editorial_audit(page, "#" + key, lang, room=key in site_json.get("perPage", {}).get("CHECKLISTS", {}).get("order", ROOM_PAGES_CORE))

                    # Gate 4: Target size & 390px overflow
                    t_issues = await page.evaluate(JS_TARGET_SIZE, is_mobile)
                    for ti in t_issues:
                        fail("gate_4_target_size_390px_touch", f"[{vp_name}/{lang}/{theme}] #{key}: {ti}")

                    # Gate 8: Image integrity across every viewport/language/theme state
                    # Scroll images into view to trigger lazy-loading cleanly
                    await page.evaluate(r"""async () => {
                        const imgs = Array.from(document.querySelectorAll('img[loading="lazy"]'));
                        for (const im of imgs) { im.loading = 'eager'; }
                        await new Promise(r => setTimeout(r, 120));
                    }""")
                    img_issues = await page.evaluate(JS_IMAGE_INTEGRITY)
                    for ii in img_issues:
                        fail("gate_8_image_integrity_aspect", f"[{vp_name}/{lang}/{theme}] #{key}: {ii}")

                    # Gate 9: Multi-scroll overlap on core room pages
                    if key in ROOM_PAGES_CORE:
                        max_y = await page.evaluate("() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight)")
                        for pos_lbl, sy in [("top", 0), ("mid", int(max_y * 0.5)), ("bottom", int(max_y))]:
                            await page.evaluate(f"() => window.scrollTo(0, {sy})")
                            await page.wait_for_timeout(80)
                            ov_issues = await page.evaluate(JS_OVERLAP_AND_WRAP)
                            for oi in ov_issues:
                                fail("gate_9_multiscroll_overlap_pill_wrap", f"[{vp_name}/{lang}/{theme}] #{key}@{pos_lbl}: {oi}")
                        await page.evaluate("() => window.scrollTo(0, 0)")

                    # Gate 10: Broken text, HVAC/Attic checklists, Bathroom RETIRED badge, stale dates, ES parity
                    body_txt = await page.evaluate("() => (document.querySelector('main') || document.body).innerText")
                    for rx, desc in BROKEN_TEXT_PATTERNS:
                        if rx.search(body_txt):
                            fail("gate_10_text_es_parity_print", f"[{vp_name}/{lang}/{theme}] #{key}: found {desc}")
                    if key != "decisions":
                        for rx, desc in STALE_COPY_PATTERNS:
                            if rx.search(body_txt):
                                fail("gate_10_text_es_parity_print", f"[{vp_name}/{lang}/{theme}] #{key}: found {desc}")
                    if BACKEND_JARGON_RE.search(body_txt):
                        m_bj = BACKEND_JARGON_RE.search(body_txt)
                        fail("gate_11_privacy_hygiene_syntax", f"[{vp_name}/{lang}/{theme}] #{key}: visible backend jargon '{m_bj.group(0)}'")
                    if lang == "es":
                        for rx, desc in ES_LEFTOVER_UI_PATTERNS:
                            if rx.search(body_txt):
                                fail("gate_10_text_es_parity_print", f"[{vp_name}/es] #{key}: {desc}")

                    if vp_name == "desktop" and key == "hvac":
                        ck_items = await page.evaluate("() => Array.from(document.querySelectorAll('#sec-checklist li')).map(li => li.innerText.trim())")
                        if len(ck_items) != 5 or any("undefined" in x.lower() or len(x) < 10 for x in ck_items):
                            fail("gate_10_text_es_parity_print", f"[{lang}] #hvac checklist invalid (count={len(ck_items)}): {ck_items}")
                    if vp_name == "desktop" and key == "attic-access":
                        ck_items = await page.evaluate("() => Array.from(document.querySelectorAll('#sec-checklist li')).map(li => li.innerText.trim())")
                        if len(ck_items) != 6 or any("undefined" in x.lower() or len(x) < 10 for x in ck_items):
                            fail("gate_10_text_es_parity_print", f"[{lang}] #attic-access checklist invalid (count={len(ck_items)}): {ck_items}")
                    if vp_name == "desktop" and key == "bathroom":
                        tags = await page.evaluate("() => Array.from(document.querySelectorAll('#sec-renders .u4-gal-tag')).map(el => el.innerText.trim().toUpperCase())")
                        want_tag = "RETIRADO" if lang == "es" else "RETIRED"
                        if want_tag not in tags or "DEFERRED" in tags or "POSPUESTA" in tags:
                            fail("gate_10_text_es_parity_print", f"[{lang}] #bathroom render badges expected '{want_tag}', got {tags}")

                    # Gate 6: Contrast & ARIA on key pages in Light & Dark
                    if vp_name == "desktop":
                        ca = await page.evaluate(JS_CONTRAST_AND_ARIA)
                        for ai in ca.get("ariaIssues", []):
                            fail("gate_6_contrast_aria_light_dark", f"[{lang}/{theme}] #{key}: {ai}")
                        for ci in ca.get("contrastIssues", []):
                            fail("gate_6_contrast_aria_light_dark", f"[{lang}/{theme}] #{key}: {ci}")

                await ctx.close()

        # ── B. Interactive Plans Matrix (All 7 plans x Desktop/Mobile x EN/ES x Light/Dark) ──
        for vp_name, vw, vh in viewports:
            is_mobile = vp_name == "mobile"
            for lang, theme in itertools.product(("en", "es"), ("light", "dark")):
                print(f"Matrix {vp_name}/{lang}/{theme}", file=sys.stderr, flush=True)
                ctx = await browser.new_context(viewport={"width": vw, "height": vh}, reduced_motion="reduce")
                page = await ctx.new_page()
                attach_err_listeners(page, f"plans-{vp_name}-{lang}-{theme}")
                await setup_network_stubs(page, base_url)

                for pid in ALL_PLAN_IDS:
                    await page.goto(f"{base_url}/plans/{pid}/index.html?standalone=1&lang={lang}&theme={theme}", wait_until="domcontentloaded")
                    await page.wait_for_timeout(480)
                    await disable_animations(page)

                    # Gate 4: Target size & 390px overflow
                    t_issues = await page.evaluate(JS_TARGET_SIZE, is_mobile)
                    for ti in t_issues:
                        fail("gate_4_target_size_390px_touch", f"[{vp_name}/{lang}/{theme}] plans/{pid}: {ti}")

                    # Gate 7: SVG text clipping & collisions (desktop)
                    if vp_name == "desktop":
                        svg_issues = await page.evaluate(JS_SVG_FORENSICS)
                        for si in svg_issues:
                            fail("gate_7_svg_clip_collision", f"[{lang}/{theme}] plans/{pid}: {si}")

                    # Gate 8: Image integrity
                    img_issues = await page.evaluate(JS_IMAGE_INTEGRITY)
                    for ii in img_issues:
                        fail("gate_8_image_integrity_aspect", f"[{vp_name}/{lang}/{theme}] plans/{pid}: {ii}")

                    # Gate 9: compare fixed controls at top, middle and bottom on plans too.
                    max_y = await page.evaluate("() => Math.max(0, document.documentElement.scrollHeight - innerHeight)")
                    for pos_lbl, sy in (("top", 0), ("mid", int(max_y / 2)), ("bottom", max_y)):
                        await page.evaluate("y => scrollTo(0, y)", sy)
                        await page.wait_for_timeout(80)
                        for oi in await page.evaluate(JS_OVERLAP_AND_WRAP):
                            fail("gate_9_multiscroll_overlap_pill_wrap", f"[{vp_name}/{lang}/{theme}] plans/{pid}@{pos_lbl}: {oi}")
                    await page.evaluate("() => scrollTo(0, 0)")

                    # Gate 10: Broken text, stale copy, ES parity, print emulation
                    txt = await page.evaluate("() => document.body.innerText")
                    for rx, desc in BROKEN_TEXT_PATTERNS:
                        if rx.search(txt):
                            fail("gate_10_text_es_parity_print", f"[{vp_name}/{lang}/{theme}] plans/{pid}: found {desc}")
                    for rx, desc in STALE_COPY_PATTERNS:
                        if rx.search(txt):
                            fail("gate_10_text_es_parity_print", f"[{vp_name}/{lang}/{theme}] plans/{pid}: found {desc}")
                    if BACKEND_JARGON_RE.search(txt):
                        m_bj = BACKEND_JARGON_RE.search(txt)
                        fail("gate_11_privacy_hygiene_syntax", f"[{vp_name}/{lang}/{theme}] plans/{pid}: visible backend jargon '{m_bj.group(0)}'")
                    if lang == "es":
                        for rx, desc in ES_LEFTOVER_UI_PATTERNS:
                            if rx.search(txt):
                                fail("gate_10_text_es_parity_print", f"[{vp_name}/es] plans/{pid}: {desc}")

                    # Gate 6: Contrast & ARIA on desktop in Light & Dark
                    if vp_name == "desktop":
                        ca = await page.evaluate(JS_CONTRAST_AND_ARIA)
                        for ai in ca.get("ariaIssues", []):
                            fail("gate_6_contrast_aria_light_dark", f"[{lang}/{theme}] plans/{pid}: {ai}")
                        for ci in ca.get("contrastIssues", []):
                            fail("gate_6_contrast_aria_light_dark", f"[{lang}/{theme}] plans/{pid}: {ci}")

                    # Gate 10: Print media emulation check (desktop EN)
                    if vp_name == "desktop":
                        await page.emulate_media(media="print")
                        await page.wait_for_timeout(120)
                        print_clip = await page.evaluate("() => document.documentElement.scrollWidth > window.innerWidth + 10")
                        await page.emulate_media(media="screen")
                        if print_clip:
                            fail("gate_10_text_es_parity_print", f"plans/{pid}: horizontal clipping under @media print emulation")

                await ctx.close()

        # Gate 13: inspect every plan step and every local HTML guide, EN + ES.
        for lang in ("en", "es"):
            ctx13 = await browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
            p13 = await ctx13.new_page()
            p13.set_default_timeout(5000)
            attach_err_listeners(p13, "editorial-" + lang)
            await setup_network_stubs(p13, base_url)
            for pid in ALL_PLAN_IDS:
                await p13.goto(f"{base_url}/plans/{pid}/index.html?standalone=1&lang={lang}&theme=light", wait_until="domcontentloaded")
                await p13.wait_for_timeout(450)
                await disable_animations(p13)
                await editorial_audit(p13, "plans/" + pid, lang)
                # Reset before each top-level step so a manual view cannot
                # unmount the remaining tabs and silently skip their audit.
                plan_url = p13.url
                steps = [(None, None)]
                for attribute in ("data-step", "data-jump-sheet"):
                    values = await p13.locator("button[" + attribute + "]:visible").evaluate_all("(els, attr) => [...new Set(els.map(e => e.getAttribute(attr)))]", attribute)
                    steps.extend((attribute, value) for value in values)
                for attribute, step in steps:
                    await p13.goto(plan_url, wait_until="domcontentloaded")
                    await p13.wait_for_timeout(200)
                    label = "plans/" + pid
                    if attribute is not None:
                        button = p13.locator("button[" + attribute + "=" + json.dumps(step) + "]:visible").first
                        if not await button.count():
                            fail("gate_13_editorial_audit", "plans/" + pid + ": unreachable step " + step)
                            continue
                        await button.click()
                        await p13.wait_for_timeout(150)
                        label += "#step=" + step
                    await editorial_audit(p13, label, lang)
                    for sub_attribute in ("data-wall", "data-wtab"):
                        values = await p13.locator("button[" + sub_attribute + "]:visible").evaluate_all("(els, attr) => [...new Set(els.map(e => e.getAttribute(attr)))]", sub_attribute)
                        for value in values:
                            sub_button = p13.locator("button[" + sub_attribute + "=" + json.dumps(value) + "]:visible").first
                            if not await sub_button.count():
                                fail("gate_13_editorial_audit", label + ": unreachable sub-view " + value)
                                continue
                            await sub_button.click()
                            await p13.wait_for_timeout(100)
                            await editorial_audit(p13, label + "&" + sub_attribute + "=" + value, lang)
            for guide in sorted(ROOT.glob("wiki-docs/**/*.html")):
                relative = guide.relative_to(ROOT).as_posix()
                fixed_lang = re.search(r"_(EN|ES)\.html$", guide.name, re.I)
                if fixed_lang and fixed_lang.group(1).lower() != lang:
                    continue
                await p13.goto(f"{base_url}/{relative}?lang={lang}&theme=light", wait_until="domcontentloaded")
                await p13.wait_for_timeout(150)
                actual_lang = (await p13.locator("html").get_attribute("lang") or "unknown").split("-")[0]
                if actual_lang != lang:
                    fail("gate_10_text_es_parity_print", relative + ": requested " + lang + " but rendered " + actual_lang)
                await editorial_audit(p13, relative, actual_lang)
            await ctx13.close()

        # ══════════════════════════════════════════════════════════════════════
        # LAYER 2 — GATE 5: Focus Not Obscured 2.4.11 & Keyboard Walk + 2.5.7
        # ══════════════════════════════════════════════════════════════════════
        ctx5 = await browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        p5 = await ctx5.new_page()
        attach_err_listeners(p5, "gate5-focus")
        await setup_network_stubs(p5, base_url)
        try:
            for label, target_url in [
                ("#kitchen", f"{base_url}/index.html?lang=en&theme=light#kitchen"),
                ("plans/kitchen-floor-plan", f"{base_url}/plans/kitchen-floor-plan/index.html?standalone=1&lang=en&theme=light"),
            ]:
                await p5.goto(target_url, wait_until="domcontentloaded")
                await p5.wait_for_timeout(550)
                for _ in range(18):
                    await p5.keyboard.press("Tab")
                    res = await p5.evaluate(r"""() => {
                        const el = document.activeElement;
                        if (!el || el === document.body) return { ok: true };
                        const r = el.getBoundingClientRect();
                        if (r.width < 2 || r.height < 2) return { ok: true };
                        if (r.bottom <= 0 || r.top >= window.innerHeight) return { ok: true };
                        const cx = Math.min(window.innerWidth - 2, Math.max(2, r.left + r.width / 2));
                        const cy = Math.min(window.innerHeight - 2, Math.max(2, r.top + r.height / 2));
                        const topEl = document.elementFromPoint(cx, cy);
                        if (!topEl) return { ok: true };
                        if (el.contains(topEl) || topEl.contains(el)) return { ok: true };
                        const blocker = topEl.closest('.u4h-topbar, .mobile, #u4AiFloatingDock, .u4-pin-fab');
                        if (blocker) {
                            return { ok: false, target: el.tagName + '#' + (el.id || ''), blocker: blocker.id || blocker.className };
                        }
                        return { ok: true };
                    }""")
                    if not res.get("ok"):
                        fail("gate_5_focus_not_obscured_keyboard", f"{label}: focused {res.get('target')} obscured by {res.get('blocker')}")
                        break
            # Check WCAG 2.5.7 Dragging Movements alternative (tap-to-arm + Escape cancel) on #kitchen
            await p5.goto(f"{base_url}/index.html?lang=en&theme=light#kitchen", wait_until="domcontentloaded")
            await p5.wait_for_timeout(500)
            await p5.locator("#u4PinDragPill").click()
            await p5.wait_for_timeout(120)
            armed = await p5.locator("#u4PinDragPill").get_attribute("aria-pressed")
            await p5.keyboard.press("Escape")
            await p5.wait_for_timeout(120)
            disarmed = await p5.locator("#u4PinDragPill").get_attribute("aria-pressed")
            if armed != "true" or disarmed != "false":
                fail("gate_5_focus_not_obscured_keyboard", f"Pin drag tap/Esc alternative failed: armed={armed}, disarmed={disarmed}")
            if gates["gate_5_focus_not_obscured_keyboard"]["status"] == "PASS":
                note("gate_5_focus_not_obscured_keyboard", "Tab walk verified zero obscured focus behind sticky headers/floaters + tap/Escape alternative for drag control")
        except Exception as exc:
            fail("gate_5_focus_not_obscured_keyboard", f"Exception in Gate 5: {exc}")
        await ctx5.close()

        # ══════════════════════════════════════════════════════════════════════
        # LAYER 4 — GATE 12: Golden Screenshots + Pixel-Diff & HTML QA Report
        # ══════════════════════════════════════════════════════════════════════
        shots_spec = [
            (f"{name}-{vp}-{lang}-{theme}", f"{base_url}/{path}?standalone=1&lang={lang}&theme={theme}{fragment}", width, height)
            for name, path, fragment in (
                ("kitchen", "index.html", "#kitchen"),
                ("kitchen-electrical", "plans/kitchen-electrical/index.html", ""),
                ("bathroom-tile", "plans/bathroom-tile/index.html", ""),
            )
            for vp, width, height in viewports
            for lang, theme in itertools.product(("en", "es"), ("light", "dark"))
        ]
        shots_dir = report_path.parent / "usability-shots"
        shots_dir.mkdir(parents=True, exist_ok=True)
        for shot_name, shot_url, sw, sh in shots_spec:
            ctx12 = await browser.new_context(viewport={"width": sw, "height": sh}, reduced_motion="reduce")
            p12 = await ctx12.new_page()
            await setup_network_stubs(p12, base_url)
            await p12.goto(shot_url, wait_until="domcontentloaded")
            await p12.wait_for_timeout(650)
            await disable_animations(p12)
            title_selector = "#doc h1" if "/index.html?" in shot_url and "/plans/" not in shot_url else "#u4hBody h1, #u4hBody .u4h-title"
            if not await p12.locator(title_selector).first.is_visible():
                fail("gate_12_visual_baselines_report", shot_name + ": target content did not render; refusing empty baseline")
                await ctx12.close()
                continue
            cur_png = await p12.screenshot(full_page=False)
            cur_file = shots_dir / f"{shot_name}.png"
            cur_file.write_bytes(cur_png)
            b64 = base64.b64encode(cur_png).decode("ascii")
            diff_note = "captured"

            base_file = baselines_dir / f"{shot_name}.png"
            if args.update_baselines:
                base_file.write_bytes(cur_png)
                diff_note = "baseline updated"
            elif not base_file.exists():
                diff_note = "MISSING BASELINE"
                fail("gate_12_visual_baselines_report", shot_name + ": missing baseline; inspect captures then run --update-baselines")
            elif not HAS_PIL:
                diff_note = "PILLOW REQUIRED"
                fail("gate_12_visual_baselines_report", shot_name + ": Pillow required for pixel comparisons")
            elif base_file.exists() and HAS_PIL:
                im_cur = Image.open(io.BytesIO(cur_png)).convert("RGB")
                im_base = Image.open(base_file).convert("RGB")
                if im_cur.size != im_base.size:
                    fail("gate_12_visual_baselines_report", f"{shot_name}: size changed {im_base.size} -> {im_cur.size}")
                    diff_note = f"SIZE MISMATCH ({im_base.size} -> {im_cur.size})"
                else:
                    diff = ImageChops.difference(im_cur, im_base)
                    bbox = diff.getbbox()
                    if bbox:
                        hist = diff.convert("L").histogram()
                        total_px = im_cur.width * im_cur.height
                        changed_px = sum(hist[12:])  # ignore minor subpixel font AA <=11
                        pct = (changed_px / max(1, total_px)) * 100.0
                        diff_note = f"diff {pct:.2f}%"
                        if pct > 2.5:
                            fail("gate_12_visual_baselines_report", f"{shot_name}: pixel diff {pct:.2f}% exceeds 2.5% threshold")
                    else:
                        diff_note = "exact match (0.00% diff)"

            screenshots_for_report.append({
                "name": shot_name,
                "url": shot_url.replace(base_url, ""),
                "size": f"{sw}x{sh}",
                "status": diff_note,
                "data_uri": f"data:image/png;base64,{b64}",
            })
            await ctx12.close()

        await browser.close()

    # Finalize Gate 11 runtime errors
    for err in runtime_errors:
        fail("gate_11_privacy_hygiene_syntax", err)
    if not runtime_errors and gates["gate_11_privacy_hygiene_syntax"]["status"] == "PASS":
        note("gate_11_privacy_hygiene_syntax", "0 console.error / pageerror exceptions across all browser sessions")

    # Add passing summary notes for quiet gates
    for gk, ginfo in gates.items():
        if ginfo["status"] == "PASS" and not ginfo["details"]:
            ginfo["details"].append("All assertions passed cleanly.")

    srv.shutdown()
    srv.server_close()

    passed_count = sum(1 for g in gates.values() if g["status"] == "PASS")
    failed_count = len(gates) - passed_count
    overall = "PASS" if failed_count == 0 else "FAIL"

    # Emit self-contained HTML QA Report (Gate 12)
    ts_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    rows_html = []
    for gk, g in gates.items():
        badge_cls = "pass" if g["status"] == "PASS" else "fail"
        det_items = "".join(f"<li>{html.escape(str(d))}</li>" for d in g["details"])
        rows_html.append(
            f"<tr><td><code>{html.escape(gk)}</code></td>"
            f"<td>{html.escape(g['layer'])}</td>"
            f"<td><strong>{html.escape(g['title'])}</strong></td>"
            f"<td><span class='badge {badge_cls}'>{g['status']}</span></td>"
            f"<td><ul>{det_items}</ul></td></tr>"
        )

    shots_html = []
    for sh in screenshots_for_report:
        shots_html.append(
            f"<figure class='shot'><img src='{sh['data_uri']}' alt='{html.escape(sh['name'])}'>"
            f"<figcaption><strong>{html.escape(sh['name'])}</strong> ({html.escape(sh['size'])}) — "
            f"{html.escape(sh['status'])}<br><code>{html.escape(sh['url'])}</code></figcaption></figure>"
        )

    report_html = (
        "<!doctype html><html lang='en'><head><meta charset='utf-8'>"
        "<title>Unit 4 Wiki — 13-Gate Usability QA Report</title>"
        "<style>"
        "body{font-family:system-ui,-apple-system,sans-serif;background:#f4f5f3;color:#1d2326;margin:0;padding:24px;line-height:1.45}"
        "h1,h2{margin:0 0 10px} .meta{color:#5d686d;font-size:13px;margin-bottom:18px}"
        ".badge{display:inline-block;padding:2px 8px;border-radius:999px;font-weight:700;font-size:12px}"
        ".badge.pass{background:#e4f0e6;color:#2f6b3f} .badge.fail{background:#fef1f0;color:#b42318}"
        "table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #d9dedc;border-radius:8px;overflow:hidden;margin-bottom:24px}"
        "th,td{padding:10px 12px;border-bottom:1px solid #d9dedc;vertical-align:top;text-align:left;font-size:13px}"
        "th{background:#ecedea;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#5d686d}"
        "ul{margin:0;padding-left:18px} li{margin:2px 0}"
        ".shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}"
        ".shot{margin:0;background:#fff;border:1px solid #d9dedc;border-radius:8px;overflow:hidden}"
        ".shot img{width:100%;height:auto;display:block;border-bottom:1px solid #d9dedc}"
        ".shot figcaption{padding:8px 10px;font-size:12px;color:#5d686d}"
        "</style></head><body>"
        f"<h1>Unit 4 Wiki — 13-Gate Usability QA Report <span class='badge {'pass' if overall == 'PASS' else 'fail'}'>{overall}</span></h1>"
        f"<div class='meta'>Generated {html.escape(ts_utc)} · Passed {passed_count}/13 · Failed {failed_count}/13</div>"
        "<table><thead><tr><th>Gate ID</th><th>Layer</th><th>Check</th><th>Status</th><th>Details</th></tr></thead><tbody>"
        + "".join(rows_html)
        + "</tbody></table>"
        + render_queue(editorial_queue)
        + "<h2>Layer 4 — Golden Screenshots</h2><div class='shots'>"
        + "".join(shots_html)
        + "</div></body></html>"
    )
    report_path.write_text(report_html, encoding="utf-8")
    note("gate_12_visual_baselines_report", f"Captured {len(screenshots_for_report)} screenshots and wrote HTML QA report to {report_path}")

    return {
        "timestamp": ts_utc,
        "overall": overall,
        "baseline_update": bool(args.update_baselines),
        "passed": passed_count,
        "total": len(gates),
        "cut_rewrite_queue_count": len(editorial_queue),
        "failed": failed_count,
        "report": str(report_path),
        "editorial_queue": editorial_queue,
        "editorial_coverage": coverage,
        "gates": {k: v["status"] for k, v in gates.items()},
        "details": {k: v["details"] for k, v in gates.items()},
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Unit 4 Wiki 13-Gate Automated Usability Suite")
    parser.add_argument("--update-baselines", action="store_true", help="Save/update golden baseline PNGs for Gate 12")
    parser.add_argument("--baselines-dir", default=str(ROOT / "tests/usability-baselines"), help="Directory for golden PNG baselines")
    parser.add_argument("--report", default=str(ROOT / "tmp/usability-report.html"), help="Path for self-contained HTML QA report")
    parser.add_argument("--json", action="store_true", help="Print full JSON summary to stdout")
    args = parser.parse_args()

    result = asyncio.run(run_suite(args))
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"USABILITY GATE SUITE: {result['overall']} ({result['passed']}/13 passed, {result['failed']}/13 failed)")
        print(f"HTML Report: {result['report']}")
        for gk, st in result["gates"].items():
            print(f"  [{st}] {gk}")
            if st == "FAIL":
                for d in result["details"][gk][:12]:
                    print(f"        - {d}")
    return 0 if result["overall"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
