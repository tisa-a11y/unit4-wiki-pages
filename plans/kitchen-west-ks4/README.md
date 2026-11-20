# Unit 4 Kitchen — West Vent Hood Wall (K-S4) Interactive Plan Pilot

**Owner (Overnight Lane 1):** `@ag-unit-4-specialists` (`83beabda`)
**Status:** Planning & Friday Nov 20 Mockup Reference Only (`MOCKUP_ONLY_HOLD_CLOSEIN` — NOT final tie-in, NOT wall close-in release).
**Zero Pricing:** Strict private-data firewall enforced (`0` currency symbols, prices, bids, estimates, financing, or private mail links).

---

## 1. File Manifest
- `index.html` — Visual-First standalone interactive HTML sheet (zero CDN scripts/fonts).
- `ks4-renderer.js` — Parametric SVG generator (`viewBox="0 0 920 1120"`), dual-datum (`AFF` + `Subfloor +t`) live math, Viking `30"–36"` (`66"–72"` AFF) validator, EN/ES localization, touch/mouse Circle-to-Correct canvas, Web Speech API voice note parser, and Tailnet-only persistence client (`:8444` / `?api=`).
- `ks4-styles.css` — Architectural drafting studio stylesheet with mobile/tablet/desktop responsive layout and clean `@media print` / `?print=1` Letter pagination (Page 1: single full-page architectural SVG; Page 2: open-stud site photo + live dual-datum mark table + immutable clashes).
- `assets/P03-IMG_5152.jpeg` — Verified open-stud West range wall site photo downloaded directly from Google Drive `1aEkoxrzR_XpTJhWQ4I5x8EjUUa_13Mxh` (`543,703` B, SHA-256 `3b4ef3a41125a2045ed16c98d8499ce8e9473aecce49ea6ae81858e285507205`).

## 2. Locked Integration Contract (`window.U4KS4` — Lane 3 / PDF Bundle Ready)
`ks4-renderer.js` exposes `window.U4KS4` synchronously on load:
- `window.U4KS4.getSvgElement()` — Returns the live `<svg id="ks4-svg">` element (`viewBox="0 0 920 1120"`).
- `window.U4KS4.getState()` — Returns a deep-cloned copy of the active `kitchen-west-ks4-plan-data` state object.
- `window.U4KS4.getLang()` — Returns `"en"` or `"es"`.
- `window.U4KS4.getRevisionStamp()` — Returns the exact single-line revision & sync status stamp (e.g., `rev-20261120-001 · Synced to K-S4 Baseline`, `Field Update · Pending EOD Review`, or `Not Yet Synced (Local Preview)`).
- `window.U4KS4.getAnnotationDataUrl()` — Returns a PNG `data:image/png;base64,...` snapshot of the Circle-to-Correct canvas when drawn, or `null` when blank.
- **Query parameters supported:**
  - `?lang=en` or `?lang=es` — Boots directly into English or Mexican Spanish.
  - `?print=1` — Activates print-ready mode matching `@media print` for `plans/generate_official_pdfs.py`.
  - `?api=http://127.0.0.1:8792` — Overrides the default Tailnet origin (`https://mac-mini.tailcf4007.ts.net:8444`) for local persistence testing.
- **Zero-friction PDF button hook:** `#btn-download-pdf` automatically invokes `window.U4KS4PdfExport.exportPdf()` when Lane 3 injects `plans/vendor/ks4-pdf-export.js`, falling back cleanly to `window.print()` standalone.

## 3. Security, Concurrency & Data Provenance Rules
- **Tailnet-Only Write Guard:** Calls `GET /api/unit4/plans/kitchen-west-ks4/health` on boot. Devices off Tisa's tailnet automatically enter **Read-Only / Local Preview & Export** mode (Save button disabled). Zero fake PINs, tokens, or offline queues in JS or `localStorage`/`sessionStorage`.
- **Optimistic Concurrency (`base_rev`):** HTTP `409 Conflict` surfaces an explicit reload banner rather than overwriting concurrent edits.
- **No Fabricated Numbers:** Unmeasured field values (`left_chase_width_in: null`) render explicitly as `MEASURE ON SITE` / `MEDIR EN OBRA`.
- **Immutable Clashes:** `flagged_clashes` (`clash-ks4-alcove`, `clash-ks7-jbox`, `clash-left-chase`) remain permanently surfaced and are never auto-resolved in code.

## 4. Local Verification Commands
```bash
# 1. JS syntax check
node --check ks4-renderer.js

# 2. Serve locally and inspect in headless Chrome / Playwright
python3 -m http.server 8799 --directory "/Volumes/tisavo/Agent Shared - Mini Hosted/1231 11th Avenue Unit 4/kitchen"
# Open http://127.0.0.1:8799/interactive-pilot/?lang=en  and  ?lang=es
```
