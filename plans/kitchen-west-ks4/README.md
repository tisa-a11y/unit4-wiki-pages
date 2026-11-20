# Unit 4 Kitchen — West Range & Vent Hood Wall Interactive Plan (Module 1B)

Self-contained, offline-first, true-to-scale interactive architectural plan for the **Unit 4 Kitchen West Range & Vent Hood Wall** (`Viking VGCC5304BSS` + `Zephyr Savona ZSA-E30AS`).

## What's Inside
- `index.html` — Visual-first responsive app (phone -> tablet -> desktop -> exact 2-page Letter print PDF) with plain on-site English & Mexican Spanish UI.
- `ks4-renderer.js` — Strict uniform-scale (`scaleX === scaleY`) parametric SVG engine (`viewBox="0 0 920 1120"`), Coupled Corners & Floor Plan view tab, pre-seeded `existing_original_trim` baseline, Live Proposed Materials Takeoff calculator (**quantities only — zero prices**), Attached Comment Callout UX (SVG leader lines + per-comment mic dictation + individual **Send to Agent** for Modify Plan `:8444` or Answer a Question `:8791`), and EOD Accept/Reject drawer.
- `ks4-styles.css` — Cool drafting bond + blueprint ink + BM Essex Green HC-188 architectural styling, zero external CDN dependencies.
- `assets/P03-IMG_5152.jpeg` — Real open-stud West wall site photo (`← SOUTH 0" ref | NORTH →`).

## Unified Integration Contract (`window.U4PLAN` + `window.U4KS4` alias)
- `planId`: `'kitchen-west-ks4'`
- `getSvgElement()`: returns `<svg id="ks4-svg">`
- `getState()`: returns deep clone of live plan JSON (including `existing_original_trim` & `takeoff_settings`)
- `getTakeoff()`: returns live gross proposed materials takeoff (**zero prices**)
- `getScaleInfo()`: returns `{ view, scaleX, scaleY, uniform: true }` (`scaleX === scaleY` always enforced)
- `getView()` / `setView('elevation' | 'coupled')`: switch coupled views programmatically
- `getLang()` / `setLang('en' | 'es')`: switch English / Mexican Spanish
- `getRevisionStamp()`, `getAnnotationDataUrl()`, `applyLocalPatch(patch)`, `render()`
- `#btn-download-pdf` auto-wires to `window.U4PlanPdfExport?.exportPdf()` -> `window.U4KS4PdfExport?.exportPdf()` -> `window.print()`.

## Security, Privacy & Accuracy Invariants
- **Strict True Scale (`scaleX === scaleY`):** `18"` base cabinet : `30"` range = `3:5`; `36"` height : `18"` base = `2:1`; `24"` base depth in coupled floor plan.
- **Provisional Dashed Outlines:** Any `null` dimension (`left_chase_width_in`, unmeasured casings) renders with dashed `"Measure on site — proportion provisional"` / `"Medir en obra — proporción provisional"` and snaps to solid true scale on edit.
- **Zero Prices / Private-Data Firewall:** Strictly quantities only; blocks currency symbols, prices, bids, estimates, financing, and mail links.
- **Tailnet-Only Persistence & Product Lookup:** Connects to `https://mac-mini.tailcf4007.ts.net:8444/api/unit4/plans/kitchen-west-ks4` (`?api=` override), voice knowledge (`:8791`), and 3-mode Product Lookup (`POST https://mac-mini.tailcf4007.ts.net/api/unit4/product-lookup`, `?lookup_api=` override, always passing `"check_matching_trim_parts": true` and never passing `include_retail_estimate`; graceful offline fallback). Zero fake PIN/token, zero browser web-storage offline queue; graceful Read-Only / Local-Export mode off-tailnet.
- **Wave C + Addendum Locks (Zero Metal Trim · 1/2" Drywall · Bare Subfloor · Blank Tile Startup):** Starts with blank/unselected tile prompt (`39.34 sq ft` wall area — no hardcoded brand default); enforces **ZERO metal edge trim / Schluter / 45° miter** (North 90° inside corner = silicone only; South flat painted return = ceramic bullnose, ceramic pencil, painted Edwardian wood trim, or factory glazed-edge tile); locks **`1/2"` drywall (`0.50"`) to `1/2"` HardieBacker 500 (`0.42"`) with NO stud shims** (`~1/16"` feather/skim only); includes live Bare Subfloor (`+t`, default `3/4"`) vs. Finished Floor toggle and collapsed-by-default **Equipment Needed & Calculate Materials** drawers at the bottom of all 4 visual steps.
- **Immutable `flagged_clashes`:** Never auto-resolved in client code.
