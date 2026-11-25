# Unit 4 Frontend Style Guide & UI Contract (Canonical)

- **Style & Frontend Owner:** `@ag-unit-4-wiki-frontend` (`antigravity:conv:0ed9bd5d`)
- **Owner Directives (Tisa Vo, 2026-11-20):**
  - *05:18–05:19 PT:* *"you're in charge of style choices and front end stuff, so you should be sharing style rules with anyone who's building for the front end"*
  - *13:46 PT (Visual Reversal):* *"i don't like the new style on the wiki. i'd prefer the new elements corresponded with the old style."* -> **Classic Old Wiki Style Wins Everywhere!**
  - *14:02 PT (Universal Pin Dragger):* *"I want the dragger available on every page even the regular pdf ones so that the user can ask questions about specific aspects or correct static documents."*
- **Scope:** Mandatory for ALL agents building, integrating, or reviewing human-facing UI on `tisa-a11y/unit4-wiki-pages` (`index.html`, `src/template.html`, `plans/*/index.html`, `.viewer` PDF pages, and all future interactive modules).
- **Privacy:** Strictly zero currency symbols / prices, zero private owner data, zero secrets.

---

## 1. Two-Layer Separation of Concerns (Preserve Technical Work — Hide Backend Plumbing)

| Layer | Owner | What Lives Here | Visibility |
|---|---|---|---|
| **Technical Engine, Data & Print Layer** | `@ag-unit-4-specialists` + `@ag-unit-4-backend` | True-scale (`scaleX === scaleY`) geometry, code/trade calculations, `*-plan-data.json`, backend `:8444` / `:8791` endpoints, `window.U4PLAN` contract, exact 2-page EN/ES Letter print sheets (`?print=1` / `@media print`) | **Backend / Print / Hidden `#blueprint-sheet-shell` ONLY** — NEVER default human screen |
| **Human-First Live Wiki UI Layer** | `@ag-unit-4-wiki-frontend` (mandatory design & merge gate) | Classic Old Wiki flat aesthetic, calm step-by-step interactive visual guides, plain-language crew copy, global `EN/ES` + `Dark/Light` sync, universal pin dragger & Live AI widget | **Default live screen** on `tisa-a11y.github.io/unit4-wiki-pages` |

**Hard Rule:** NEVER throw away Specialist technical work, AND NEVER ship a raw Specialist CAD/engineering workbench as the default screen of a live wiki page. Every interactive module MUST follow this style guide and clear `@ag-unit-4-wiki-frontend` + `@ag-unit-4-qa` Human-UI Gate before merging to `main`.

---

## 2. Canonical Classic Old Wiki Design Tokens (Master Visual Language — Zero CDNs)

All main wiki components AND all 7 interactive plans MUST use the **Classic Old Wiki** palette, typography, and flat `1px solid var(--line)` `8px` cards (`src/template.html:175–230`, `plans/vendor/u4-human-guide-shell.css`, `plans/kitchen-west-ks4/ks4-5step-guide.css`, `plans/vendor/u4-live-ai-widget.css`, `plans/vendor/u4-pin-dragger.css`):

```css
:root {
  --bg: #f4f5f3;
  --panel: #ffffff;
  --fg: #1d2326;
  --muted: #5d686d;
  --line: #d9dedc;
  --accent: #1f5f7a;
  --accent-soft: #e3eef2;
  --lock: #2f6b3f;
  --lock-soft: #e4f0e6;
  --open: #9a5b06;
  --open-soft: #f7ecd9;
  --crimson: #a8281c;
  --crimson-soft: #f9e6e4;
  --display: "Archivo Narrow", "Arial Narrow", Arial, sans-serif;
  --body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #121618; --panel: #1a2023; --fg: #e4e9ea; --muted: #98a4a8; --line: #2c3539;
    --accent: #7cc0dc; --accent-soft: #1d3440; --lock: #8fd19e; --lock-soft: #1e3324;
    --open: #f0b75a; --open-soft: #3a2d17; --crimson: #f28479; --crimson-soft: #3a1f1d;
    color-scheme: dark;
  }
}

:root[data-theme="dark"], html[data-theme="dark"] {
  --bg: #121618; --panel: #1a2023; --fg: #e4e9ea; --muted: #98a4a8; --line: #2c3539;
  --accent: #7cc0dc; --accent-soft: #1d3440; --lock: #8fd19e; --lock-soft: #1e3324;
  --open: #f0b75a; --open-soft: #3a2d17; --crimson: #f28479; --crimson-soft: #3a1f1d;
  color-scheme: dark;
}
```

- **Surface & Chrome Rules:**
  - Crisp flat `1px solid var(--line)` `8px` cards (`box-shadow: none`), matching old-wiki `button.small` / `.chip` pill top-bar controls (`font-family: var(--mono); font-size: 12px; border-radius: 999px;`).
  - **Dark-Mode Drafting Paper SVG Framing (`[P1-U6]`):** Inside `html[data-theme="dark"]`, frame `.u4h-svg-wrap` and `.ks4-svg-wrap` in warm soft drafting paper (`background: #ecefed; border: 1.5px solid #39444a; box-shadow: inset 0 0 0 1px rgba(18, 22, 24, 0.12);`) rather than a stark pure-white `#FFFFFF` cutout, keeping dark SVG ink lines razor-sharp.
  - **Zero Opacity-0 Washout & Reduced Motion (`[P2-U7]`):** Start step-switch `@keyframes u4FadeSlideIn` at `opacity: 0.94; transform: translateY(2px);` and enforce `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }`.
  - **Mobile `390px` Zero-Overflow + `>=36px` Touch Targets (`[P2-U11]`):** All top-bar controls (`.u4h-nav-link`, `.u4h-seg-item`, `.u4h-plans-btn`, `.u4h-lang-btn`, `.u4h-mini-btn`) enforce `min-height: 36px` at `@media (max-width: 640px)` with `scrollWidth <= innerWidth + 2`.

---

## 3. Global App-Wide `EN/ES` & `Dark/Light` Sync Contract (`[P1-U1]` + `[P2-U8]`)

Both the main wiki (`src/template.html`) AND all 7 interactive plans (`plans/vendor/u4-plan-nav.js` + `ks4-5step-guide.js`) share ONE identical preference sync contract:
1. **Shared `localStorage` Keys (wrapped in safe `try/catch`):** `u4_lang` (`"en" | "es"`) and `u4_theme` (`"light" | "dark"`). *(Only UI language & theme preference keys belong in `localStorage` — NEVER store plan data, offline edit queues, credentials, or prices in web storage.)*
2. **Load Precedence:** URL `?lang=` / `?theme=` (if valid, persist to `localStorage`) → `localStorage` (`u4_lang` / `u4_theme`) → fallback (`"en"`, and `prefers-color-scheme: dark` for theme).
3. **Immediate DOM Application:** Set `document.documentElement.lang` AND explicit `document.documentElement.setAttribute("data-theme", theme)` (`"light"` or `"dark"`) immediately on load before paint.
4. **Seamless Propagation:** Toggling language or theme persists to `localStorage`, updates URL search params via `window.history.replaceState(...)`, forwards BOTH `?lang=` & `&theme=` on every cross-link (`withPlanParams()`, `wikiBackUrl()`, `planUrl()`), and listens to `window.addEventListener("storage", ...)` for instant cross-tab sync.
5. **Accessible Popover & Favicon (`[P2-U8]`, `[P2-U10]`):** Pressing `Escape` closes `#u4hAllPlansPop` and returns focus to `#u4hAllPlansBtn`; every `plans/*/index.html` includes `<link rel="icon" type="image/png" href="../../wiki-images/favicon-32.png">`.

---

## 4. Mandatory Human-First Layout, Flow & Copy Rules

1. **One Clean Sticky Top Bar:** Left `← Back to <Room>` + segmented sibling switcher + `All Plans ▾`; Right `Español (MX)` / `English (EN)`, `☾ Dark / ☀ Light`, `Print / PDF`.
2. **Focused Step-by-Step Flow:** Horizontal step pills + bottom `← Prev / Step X of N / Next →` pager (`window.scrollTo(0, 0)`), supporting `#step=<stepId>`.
3. **Zero Backend Plumbing Visible to Humans (Blocking QA Gate):** Never show `Tailnet Live`, `Off-tailnet`, `EOD Review`, `measure_boundary`, raw snake_case tags, `rev-2026...` stamps, `Download JSON`, or engineering override forms on default human screens.
4. **Equipment & Supplies Naming (Tisa, 2026-11-20 05:31 PT):** Always label the collapsed per-step tool/supply drawer **`🔧 Equipment & Supplies ▾`** (EN) / **`🔧 Equipo y suministros ▾`** (ES).
5. **Strict Input Bounds Validation (`[P1-U5]`):** Calculators (such as Murphy Door 9-point `b7`–`b15`) MUST validate plausible architectural bounds (e.g., `18"–48"` W, `60"–96"` H, `60"–110"` Diag, `2"–12"` Jamb) and hold cut size at `— × —` with a clear EN/ES warning rather than ever displaying negative cut dimensions.
6. **Live AI Chat & Voice Widget on Every Page (`plans/vendor/u4-live-ai-widget.{css,js}`):** Mounted on main wiki and all 7 interactive plans (hidden on print), wired to Mac mini `:8791` (`/api/unit4/voice-token`, `/knowledge`, `/wiki-intake`) with 1-tap Mute/Unmute and graceful Chrome 142+ Local Network Access (`LNA`) fallback.

---

## 5. Direct 2-Way Synced SVG Element Dragging (Native Pointer Events — Wave E)

Whenever an interactive plan allows adjusting physical positions (KS4 Zephyr hood/blocking, Attic staggered L-path platform, Kitchen Electrical South wall pie-safe/sink, HVAC `F1`/`R1`/`S1`/`S2`/`S3`/`JD-1` reactive Manual D ducts), users MUST be able to drag elements directly via native Pointer Events:
- Bind `pointerdown` with `setPointerCapture(e.pointerId)` + non-passive `touchmove` scroll lock + `pointermove`/`pointerup`/`pointercancel` cleanup.
- Mutate SVG transforms/paths, reactive ductwork, numeric KPIs, PASS/FAIL banners, and paired sliders **in place** during `pointermove` (NEVER wipe parent `innerHTML` mid-drag!).
- Keep 2-way sync with hidden `#blueprint-sheet-shell` controls (`#rng-walkway-l`, `#rng-piesafe`, `#rng-sink`) so Print/PDF always reflects the user's state.
- Include keyboard `tabindex="0"`, ARIA attributes, and Arrow-key nudges.

---

## 6. Universal Pin/Circle Dragger on EVERY Page Including Static PDFs (Tisa, 2026-11-20 14:02 PT)

Users MUST have a consistent drag-or-tap spot marker tool on **every interactive plan AND every static wiki / PDF viewer page** so they can point at any specific detail on a drawing, photo, or PDF page to ask AI a question or flag a correction:
- **Interactive Plans (`plans/vendor/u4-pin-dragger.{css,js}` + KS4 `#dragMarkPill`):**
  - Renders classic old-wiki **`⊕ Drag / Tap to Pin Spot`** (`⊕ Arrastrar / Tocar punto`) pill above drawings & site photos.
  - Supports **BOTH drag-and-drop** (floating dashed ghost circle) **AND 1-tap arm mode** (solid crimson pill with dark high-contrast text `#0D1116` in dark mode `[P2-U9]`).
  - Zero interference with element dragging while disarmed (`pointer-events: none` on overlay layer).
  - Dropping a pin disarms immediately, dismisses the helper toast (`bottom: 76px`, clear of `.u4-lai-dock`), and opens a viewport-clamped inline callout card (`left: 8px; right: 8px; width: auto` on `<= 560px` mobile `[P1-U4]`) with:
    - Intent switch: **`Ask AI`** (opens `U4LiveAi.open(text, locationTag)`) vs **`Correct / Flag`** (posts to `:8791/api/unit4/wiki-intake` with normalized `(xPct, yPct)`, active step/page, and fallback to local note drawer),
    - Optional voice dictation mic (`SpeechRecognition`),
    - Draggable repositioning & delete/clear controls, completely hidden on print (`no-print`).
- **Main Wiki & Static PDF Viewer (`.viewer` in `src/template.html` — owned by `@ag-unit4-pm-macbook`):**
  - Mirror the exact same classic old-wiki `⊕ Drag / Tap to Pin Spot` pill, ghost ring, numbered pin markers, and viewport-clamped callout popup over `.viewer` PDF pages and static room photos/cards, capturing `{ docId, pdfPage, xPct, yPct }` when routing to `#u4VoiceChatDialog` or `:8791/api/unit4/wiki-intake`.

---

## 7. Smooth Zoom & Pan on Interactive Drawings & Reference Photos (`plans/vendor/u4-zoom-pan.{css,js}` — Wave F)

Per Tisa (`2026-11-20`: *"Make the interactive images zoomable"*), every interactive SVG drawing (`.u4h-svg-wrap`, KS4 `.ks4-svg-wrap`) and every reference photo (`.u4h-photo-card`) across all 7 interactive plans MUST support smooth zoom & pan without disrupting normal scrolling, fixture dragging, or pin accuracy:
- **Classic Old-Wiki Controls (`.u4-zoom-bar no-print`):** Slim flat toolbar directly above `.u4-zoom-viewport` (never overlapping compass roses, titles, or photo subjects) with **`−`** | **`100%`** (click to reset) | **`+`** (`100%`–`300%`), EN/ES localized labels synced to `u4_lang`, and dark/light parity.
- **Gestures & Scroll Discipline:**
  - `Ctrl` / `⌘` + Mouse Wheel (including macOS trackpad pinch) zooms smoothly around cursor focal point (`100%`–`300%`). Plain wheel without `Ctrl`/`⌘` NEVER intercepts normal vertical page scrolling.
  - 2-finger touch pinch zooms smoothly around midpoint via Pointer Events multi-touch tracking (`touch-action: pan-y` at `100%`, switching to `touch-action: none` only while zoomed `> 1×`).
  - Drag-to-pan activates **ONLY when zoom `> 1×`**, **NOT** armed for pin drop (`.is-pin-armed` / `.drop-target`), and **NOT** starting on a fixture drag handle, SVG mark, pin dot, or interactive button/input — clamped strictly to the stage bounds.
- **1:1 Coordinate & Pin Lock:** `<svg>` / `<img>` + `.u4-pin-layer` live inside `.u4-zoom-stage` (`transform: translate3d(tx, ty, 0) scale(z)` with `--u4-inv-scale` keeping pin badges crisp); all fixture drag handlers and pin drops compute coordinates from live transformed `getBoundingClientRect()` so dragging & pinning remain 1:1 accurate at `100%`, `200%`, and `300%` zoom. Hidden cleanly on `@media print` and `body.u4-mode-blueprint`.



---

## 9. Canonical Interactive Symbol, Calm Sidebar, Compact Switches & Modern AI Helper UI (Locked 2026-11-23)

- **Canonical Interactive Plan Symbol (Zero Double Icons):** Use ONE monochrome inline-SVG pointer-click icon (`14×14`, `var(--accent)`) consistently across all sidebar `INTERACTIVE PLANS` links and interactive plan items inside room `Documents (...)` sub-lists. Strip legacy compass (`🧭`) and lightning (`⚡`) emojis so items never double-stack symbols or collide with Electrical.
- **Calm Sidebar Hierarchy (No Extra Filter Clutter):** Style active sidebar links with a soft tinted pill (`var(--accent-soft)` background, `var(--accent)` text, `inset 2.5px 0 0 var(--accent)` left bar) and subtle `1px solid var(--line)` group dividers between `OVERVIEW`, `INTERACTIVE PLANS`, and `PROJECTS`. Do NOT add a sidebar "Jump to" search filter or extra accordion JS that fights the native room tree.
- **Compact Sliding Top-Bar Switches:** Use compact sliding segmented `EN | ES` and inline-SVG Sun/Moon switches across the main wiki, mobile header, all 7 interactive plans, and standalone docs.
- **Modern AI Helper Popover (`#u4VoiceChatDialog`):** Compact bottom-right auto-height card (`height: auto`, collapses empty transcript so it never blocks drawings), symbol-only `32×32` circular voice (waveform / stop square) and mute (mic / slashed-mic, `M` shortcut) controls across dialog header, floating dock, and live minibar, hidden redundant `#waVoiceStatus` banners during idle/live/muted states (and hidden flatlined RMS dots when muted), zero robotic welcome bubble or repeated sender labels, and a unified 2-deck composer card.
- **Pure-CSS & Script Syntax Gate:** Prefer pure CSS (`:empty`, `:has()`, `[aria-pressed]`, SVG masks) over `MutationObserver` for UI state styling (never call `setAttribute` unconditionally inside an attribute-watching `MutationObserver` on the same subtree), and always run `node --check` on extracted inline `<script>` blocks in `index.html` before pushing to `main`.


## 3-Language UI/UX Standard (`EN | ES | RU`)
- **3-Way Segmented Control (`.u4-lang-seg`):** Direct 1-tap `role="radiogroup"` pill with three `role="radio"` buttons (`EN`, `ES`, `RU`), `170ms` sliding accent thumb (`width: calc((100% - 4px) / 3)` at `translateX(0% | 100% | 200%)`), roving `tabindex`, and `ArrowLeft`/`ArrowRight`/`Home`/`End` keyboard support.
- **Active Ink Contrast:** `#ffffff` on `#1f5f7a` in Light mode (`6.8:1` AA+) and `#0d181d` on `#7cc0dc` in Dark mode (`10.4:1` AAA).
- **Decoupled Utility Switches:** `.u4h-seg-switch` is reserved for multi-plan sibling navigation tabs; `.u4h-bin-switch` styles the binary Sun/Moon theme switch; `.u4-lang-seg` styles the 3-way language control.
- **Typography & Persistence:** `IBM Plex Sans` and `IBM Plex Mono` load Latin + Cyrillic glyph subsets seamlessly. `localStorage` persists strictly `u4_lang` (`"en" | "es" | "ru"`) and `u4_theme` (`"light" | "dark"`), synced via `?lang=` query parameter and `u4:set-pref`/`u4:sync-pref` `postMessage`.
