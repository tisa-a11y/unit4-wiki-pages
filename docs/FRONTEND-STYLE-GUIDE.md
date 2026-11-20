# Unit 4 Frontend Style Guide & UI Contract (Canonical)

- **Style & Frontend Owner:** `@ag-unit-4-wiki-frontend` (`antigravity:conv:0ed9bd5d`)
- **Authority:** Tisa Vo (`2026-11-20 05:18–05:19 PT`):
  - *"specialist is building out good stuff and a lot can and should be incorporated into the backend, and the technical work done so far shouldn't be thrown away, but it's not what should be live in the wiki"*
  - *"you're in charge of style choices and front end stuff, so you should be sharing style rules with anyone who's building for the front end"*
- **Scope:** Mandatory for ALL agents building, integrating, or reviewing human-facing UI on `tisa-a11y/unit4-wiki-pages` (`index.html`, `src/template.html`, `plans/*/index.html`, and all future interactive modules including Wave D `kitchen-electrical`).
- **Privacy:** Strictly zero currency symbols / prices, zero private owner data, zero secrets.

---

## 1. Two-Layer Separation of Concerns (Preserve Technical Work — Hide Backend Plumbing)

| Layer | Owner | What Lives Here | Visibility |
|---|---|---|---|
| **Technical Engine, Data & Print Layer** | `@ag-unit-4-specialists` + `@ag-unit-4-backend` | True-scale (`scaleX === scaleY`) geometry, code/trade calculations, `*-plan-data.json`, backend `:8444` / `:8791` endpoints, `window.U4PLAN` contract, exact 2-page EN/ES Letter print sheets (`?print=1` / `@media print`) | **Backend / Print / Hidden `#blueprint-sheet-shell` ONLY** — NEVER default human screen |
| **Human-First Live Wiki UI Layer** | `@ag-unit-4-wiki-frontend` (mandatory design & merge gate) | Calm step-by-step interactive visual guides, plain-language crew copy, smooth room/step/manual navigation, Light/Dark styling, prominent `EN` / `Español (MX)` toggle | **Default live screen** on `tisa-a11y.github.io/unit4-wiki-pages` |

**Hard Rule:** NEVER throw away Specialist technical work, AND NEVER ship a raw Specialist CAD/engineering workbench as the default screen of a live wiki page. Every interactive module MUST follow this style guide and clear `@ag-unit-4-wiki-frontend` + `@ag-unit-4-qa` Human-UI Gate before merging to `main`.

---

## 2. Canonical Visual Design Tokens (Zero External CDNs)

Use these exact CSS custom properties (copied from the Tisa-approved `ks4-5step-guide.css` reference implementation):

```css
:root {
  --paper: #F6F8FA;
  --surface: #FFFFFF;
  --rail: #EEF1F5;
  --sheet-bg: #E6ECF2;
  --ink: #131A22;
  --ink-2: #485563;
  --ink-3: #6E7D8C;
  --rule: #DCE2E9;
  --rule-strong: #C2CCD6;
  --cobalt: #184E77;
  --cobalt-hover: #123D5E;
  --cobalt-soft: #E6F0F8;
  --pine: #1B6B46;
  --pine-soft: #E5F4EC;
  --amber: #A15206;
  --amber-soft: #FDF2E4;
  --crimson: #B42318;
  --crimson-soft: #FEECEB;
  --shadow-sm: 0 1px 3px rgba(19, 26, 34, 0.06);
  --shadow-md: 0 10px 28px rgba(19, 26, 34, 0.14);
  --sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
  --display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif;
  --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --r-sm: 6px;
  --r-md: 10px;
  --r-lg: 14px;
}

html[data-theme="dark"] {
  --paper: #12171D;
  --surface: #1A2129;
  --rail: #161C23;
  --sheet-bg: #0D1116;
  --ink: #ECF1F6;
  --ink-2: #A7B4C2;
  --ink-3: #7A8999;
  --rule: #28323D;
  --rule-strong: #3A4756;
  --cobalt: #6FB3E6;
  --cobalt-hover: #8DC6F0;
  --cobalt-soft: #1B2E3E;
  --pine: #6CD4A0;
  --pine-soft: #173025;
  --amber: #F5B461;
  --amber-soft: #352715;
  --crimson: #F97066;
  --crimson-soft: #3A1B1A;
}
```

- **Canvas & Card Width:** Center human interactive guides in a calm single-column reading/action stage (`max-width: 780px`, subtle rounded `.sheet-card` on `--sheet-bg` with `padding: 14px` desktop / `10px` phone).
- **Typography:** `15px` base body, `line-height: 1.5`, crisp monospace (`--mono`) ONLY for dimensions/SVG callouts, bold display titles (`14.5px–18px`). Zero dense 7pt multi-column CAD wall-of-text layouts on screen.
- **No Horizontal Overflow:** Must fit cleanly at `390px` iPhone width (`document.documentElement.scrollWidth <= window.innerWidth + 2`) with zero sideways scroll.

---

## 3. Mandatory Human-First Layout, Flow & Copy Rules

1. **One Clean Sticky Top Bar (Zero Duplicate Bars):**
   - Left: `← Back to <Room>` + sibling interactive plan pill (preserving `?lang=en|es`).
   - Right: Prominent **`Español (MX)` / `English (EN)`** pill button, **`☀ Light / ☾ Dark`** toggle, and **`Print / PDF`** button.
   - Hide any secondary toolbar unless showing an inline manual summary (where it shows `← Back to plan`).
2. **Focused Step-by-Step Flow (Never Dump Everything on One Screen):**
   - Split multi-trade room plans into clear horizontal step pills (`1. ...`, `2. ...`, ...) with a bottom **`← Prev` / `Step X of N` / `Next →`** pager that resets scroll to top (`window.scrollTo(0, 0)`).
   - Support direct URL hash step deep-links (`#step=<stepId>`) so room wiki pages can jump straight to a specific step.
3. **Zero Backend Plumbing Visible to Humans (Blocking QA Gate):**
   - Default visible screen text MUST NEVER expose internal engineering jargon or backend controls:
     - **BANNED on default human screen:** `Tailnet Live`, `Checking Tailnet`, `Off-tailnet`, `EOD Review`, `measure_boundary`, `wall_to_wall` / `clear_between_casings` raw snake_case tags, `K_S4_BASELINE`, `rev-2026...` stamp badges, `Immutable Flagged Clashes`, `Download JSON`, or 12-field engineering override forms.
   - Translate every technical check into plain, warm, direct human language (e.g., `"Bare subfloor (not installed yet)"`, `"MAX HEIGHT: 4-15/16\" off floor"`, `"Measure on site"`).
4. **No Sticky/Floating Diagrams & No Collapsible Prose Blocks:**
   - Keep interactive SVGs normal in-flow (`position: relative`, full crisp width) — NEVER `position: sticky` floating diagrams.
   - Keep green status summaries, floor condition toggles, and important bulleted facts openly visible — NEVER fold prose text behind disclosure triangles.
   - **ONLY** collapse **`+ Add custom`** (manual numeric overrides) and **`🔧 Equipment & Supplies`** (per-step visual tool icons + calculated supplies) by default until tapped.
5. **Control Priority & Ordering:**
   - Put high-impact structural toggles that reshape the drawing (e.g., `Where the wall studs fall`) **ABOVE** secondary allowances (e.g., floor thickness).
   - For Tile Plans: Top KPI strip (`Total wall area` | `Selected tile: —` | `Est. qty / boxes: —`, blank at startup with zero hardcoded brand defaults) → Main Wall SVG → **Tile Selection** (`Select Tile Size` neutral pills → `Orientation` → `Pattern & waste` → `Product lookup` name/URL/camera → collapsed `+ Add custom`) → **Zero-Metal Edge Finishes bubble** (with live Close-Up Top-Down flat-wall SVG, strictly zero metal/Schluter & zero 45° miter on flat returns) **DIRECTLY BENEATH Tile Selection** → collapsed **`🔧 Equipment & Supplies`** button.
6. **Mandatory Bilingual (`EN` ↔ Mexican `ES`) Parity:**
   - Every single heading, SVG label, button, step pill, status banner, manual summary, close-up diagram, and toast MUST translate immediately when toggling English ↔ Mexican Spanish (`Español (MX)`), and preserve `?lang=es` / `?lang=en` on cross-plan links.
7. **Live Wiki Shell & Old PDFs Protection:**
   - Never reorganize the main wiki layout, sidebar `nav#rail`, `genieIn`/`genieOut` animation, room hierarchy (`Kitchen` as one parent room with sub-areas nested underneath), or existing room PDFs (`wiki-pdfs/*`, including the 17-page Bedroom Trim Installation Packet).
8. **Zero Prices & Zero Web Storage on Public Crew Pages:**
   - Strictly zero currency symbols / prices on all public GitHub Pages crew modules (`plans/*/`), never pass `include_retail_estimate: true` from crew pages, and zero `localStorage`/`sessionStorage` inside standalone interactive plan modules.

---

## 4. Reference Implementation & Pre-Merge Checklist

- **Gold Standard Reference:** `plans/kitchen-west-ks4/index.html` + `ks4-5step-guide.css` + `ks4-5step-guide.js` (with hidden `#blueprint-sheet-shell` preserving `window.U4PLAN` `scaleX === scaleY` + exact 2-page EN/ES print PDFs on `?print=1` / `@media print`).
- **Before Any Future Module (Including Wave D `kitchen-electrical`) Can Merge to `main`:**
  1. `@ag-unit-4-specialists` completes technical geometry, `*-plan-data.json`, `window.U4PLAN` engine, and 2-page EN/ES print sheet.
  2. `@ag-unit-4-wiki-frontend` reviews/authors the clean human-first default screen layer adhering to Sections 1–3 above.
  3. `@ag-unit-4-qa` verifies BOTH clean human screen (automated zero-backend-clutter regex + `0` `USD-currency` + `390px` mobile EN/ES + visual `read_file` screenshot check) AND `window.U4PLAN` / 2-page print PDF parity.

---

## 5. Main Wiki (`src/template.html`), Transitions, Live AI Widget & Chrome LNA Rules

### 5.1 Main Wiki Shell & Global Chrome (`src/template.html`)
- **Preserved Navigation & Layout:** Keep sidebar `nav#rail`, sticky room top bar, room hierarchy (`Kitchen` as one parent room with sub-areas nested underneath), `genieIn` / `genieOut` animation, and all existing room PDFs (`wiki-pdfs/*`, including the 17-page Bedroom Trim Installation Packet) untouched.
- **Visual-First Rule:** Every room wiki page and PDF sheet leads with labeled real site photos, renderings, or crisp diagrams at the top before checklists or dense text.
- **Seamless Theme & Language Handoff:** Any link from the main wiki (`src/template.html`) into `./plans/*/index.html` or between sibling interactive plans MUST preserve both `?lang=en|es` and `?theme=light|dark` via query parameters (never via `localStorage` inside `plans/*/`).
- **Unified Top Bar & Sibling Switchers across All Interactive Plans:**
  - Every interactive module (`plans/kitchen-west-ks4/`, `plans/kitchen-floor-plan/`, `plans/attic-hatch/`, `plans/hvac-layout/`, `plans/murphy-door/`, and future `plans/kitchen-electrical/`) uses the shared calm shell (`plans/vendor/u4-human-guide-shell.css`):
    - Left: `← Back to <Room>` + segmented sibling switcher pill (e.g., `Range & Hood Wall | Floor Plan & Cabinets` or `Attic Hatch | Furnace & Ducts`) + compact `All Plans ▾` quick-switcher dropdown.
    - Right: `Español (MX)` / `English (EN)` pill, `☀ Light / ☾ Dark` toggle, `Print / PDF` button.
    - Smooth 180ms step & view transitions (`prefers-reduced-motion` safe) and scroll-to-top on step changes so moving across rooms and plans feels like one calm app.
- **Equipment & Supplies Button Naming (Tisa, 2026-11-20 05:31 PT):**
  - Always label the collapsed per-step tool/supply drawer **`🔧 Equipment & Supplies ▾`** (EN) / **`🔧 Equipo y suministros ▾`** (ES). Never use `🧰` (reads like a red flag on dark cobalt) and say **Supplies** rather than Materials.

### 5.2 Live AI Chat & Voice Guidance on EVERY Page (`#u4VoiceChatDialog` & `plans/vendor/u4-live-ai-widget.{css,js}`)
- **Never Drop Live Guidance on Interactive Pages (Tisa, 2026-11-20 05:32 PT):** Both the main wiki (`src/template.html`) and ALL standalone interactive plan pages (`plans/*/index.html`) MUST mount the floating **AI Helper** orb + docked **Live Voice & Chat Guidance** drawer (`plans/vendor/u4-live-ai-widget.{css,js}`), hidden cleanly on `@media print` / `?print=1` (`no-print`).
- **Required Interactive Controls & Endpoints (`https://mac-mini.tailcf4007.ts.net`, Mac mini `:8791`):**
  1. **Live Voice Guidance:** `POST /api/unit4/voice-token` → Gemini Live WebSocket PCM16/PCM24k audio, seeded with the active room, interactive plan, and active step context, with a visible **1-tap Mute / Unmute** control directly beside Start/Stop Voice (and quick-mute pill on the floating dock when live).
  2. **Live Text Chat Guidance:** Queries `GET /api/unit4/knowledge?q=...&room=...` with quick step-aware prompt chips + automatic offline/LNA fallback explaining local answers when `:8791` is unreachable.
  3. **Field Note & Site Photo Intake:** `POST /api/unit4/wiki-intake` supporting both gallery attach (`#u4PhotoTriggerBtn` / `#u4VdPhotoBtn`) and mobile camera capture (`#u4CameraTriggerBtn` / `#u4VdCameraBtn`).
  4. **Pin-to-AI Wiring:** Clicking/dragging a zone pin's "Ask AI" action on an interactive plan opens `window.U4LiveAi.open(promptText, zoneLabel)` pre-populated with that exact zone.
  5. **Strict Privacy & Hygiene:** Zero external CDNs, zero currency symbols / prices, zero `localStorage`/`sessionStorage` inside `plans/*/`, full EN ↔ Mexican ES parity synced live with the page toggle.

### 5.3 Chrome 142+ Local Network Access (`LNA`) & Private Network Access (`PNA`) Guidance
- Mac mini `:8791` (`com.tisa.unit4-wiki-intake`) and `:8444` (`com.tisa.unit4-plan-edits`, tailnet-only) emit `Access-Control-Allow-Private-Network: true` for allowlisted origins (`https://tisa-a11y.github.io`, `http://localhost`, `null`).
- **Off-Tailnet Devices:** `mac-mini.tailcf4007.ts.net` resolves to public Tailscale Funnel IPs, so `:8791` works directly without LNA prompts.
- **On-Tailnet Laptops / Phones (Chrome 142+):** Tailscale MagicDNS resolves `mac-mini.tailcf4007.ts.net` to CGNAT `100.114.3.50`. Chrome 142+ enforces **Local Network Access (`LNA`)** from public HTTPS origins (`https://tisa-a11y.github.io`) to private/CGNAT IPs.
  - **User Setup (1-time per browser):** Click the site-settings icon left of the address bar on `https://tisa-a11y.github.io` → **Local network access → Allow**.
  - **UI Requirement:** Whenever a live `:8791` fetch fails with a network/TypeError in the Live AI widget or main wiki, NEVER show raw `TypeError: Failed to fetch` or expose internal Tailnet/host status badges on screen; instead fall back seamlessly to built-in local answers and show a calm 1-line helper tip: *"Live AI helper blocked by browser? Tap Site Settings → Local network access → Allow."*
