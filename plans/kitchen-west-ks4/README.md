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
- **Tailnet-Only Persistence:** Connects to `https://mac-mini.tailcf4007.ts.net:8444/api/unit4/plans/kitchen-west-ks4` (`?api=` override; voice knowledge via `:8791` / `?voice_api=`). Zero fake PIN/token, zero browser web-storage offline queue; graceful Read-Only / Local-Export mode off-tailnet.
- **Immutable `flagged_clashes`:** Never auto-resolved in client code.
