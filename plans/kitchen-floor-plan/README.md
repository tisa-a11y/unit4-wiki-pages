# Unit 4 Kitchen — Coupled Floor Plan & Wall-by-Wall Cabinet Schedule (Module 5)

Self-contained, offline-first, true-to-scale coupled room model (`147" × 126-1/4"`) syncing all 4 kitchen walls and a complete wall-by-wall Base + Wall Upper Cabinet Schedule from ONE canonical seed (`kitchen/kitchen-cabinet-schedule.json`).

## What's Inside
- `index.html` — Visual-first responsive app (phone -> tablet -> desktop -> exact 2-page Letter print PDF) in plain on-site English & Mexican Spanish, with a top cross-plan jump bar (`← Back to Kitchen Page` · `West Range & Hood Wall →`).
- `kitchen-floorplan-renderer.js` — Strict uniform-scale (`scaleX === scaleY`) parametric SVG engine (`viewBox="0 0 920 1120"`) with **5 coupled view tabs** (`Floor Plan` | `West Wall` | `South Wall` | `East Wall` | `North Wall`), **4 1-tap crew layer toggles** (Base Cabinets & Appliances, Wall Upper Cabinets, Swings & Clear Walkways, Rough-In Utilities HOLD), live **`6"` vs `12"` South box** & **`75"–105"` vs `72"–102"`** sink comparisons recalculating narrowest clear walkway (incl. countertop overhang) and 4-wall dimensional closure, bidirectional **Tap-to-Inspect** Cabinet Schedule highlighting + live inline width edits (coupled SE corner `S-B1` <-> `E-B1`), wrap-around tile/backer/countertop takeoff (**zero prices, zero order numbers**), Attached Comment Callout UX (SVG leader lines + per-comment mic dictation + individual **Send to Agent**), and EOD Accept/Reject drawer.
- `kitchen-floorplan-styles.css` — Cool drafting bond + blueprint ink + BM Essex Green HC-188 architectural styling, zero external CDN dependencies.
- `assets/kitchen-south-wall.jpg` — Real upright site photo of the open-stud South kitchen wall (existing pie-safe, blue countertop tape, window, plumbing stubs, rear door).

## Unified Integration Contract (`window.U4PLAN`)
- `planId`: `'kitchen-floor-plan'`
- `getSvgElement()`: returns `<svg id="kitchen-fp-svg">`
- `getState()`, `getClosureSummary()`, `getTakeoff()`, `getScaleInfo()` (`scaleX === scaleY`), `getView()` / `setView('floor'|'west'|'south'|'east'|'north')`, `getLang()` / `setLang('en'|'es')`, `getRevisionStamp()`, `getAnnotationDataUrl()`, `applyLocalPatch(patch)`, `render()`.
- `#btn-download-pdf` auto-wires to `window.U4PlanPdfExport?.exportPdf()` -> `window.U4KS4PdfExport?.exportPdf()` -> `window.print()`.

## Security, Privacy & Accuracy Invariants
- **Strict True Scale (`scaleX === scaleY`):** `24"` base cabinet depth, `12"` wall upper depth, `28-1/16"` Viking range nose, `26-9/16" + 2"` Haier fridge, exact Magicplan L-recess room polygon.
- **Zero Prices / Zero Order Numbers / Private-Data Firewall:** Strictly quantities & dimensions only; unconfirmed boxes carry `"Verify on Friday mockup / measure on site"` + dashed provisional outlines.
- **Tailnet-Only Persistence:** Connects to `https://mac-mini.tailcf4007.ts.net:8444/api/unit4/plans/kitchen-floor-plan` (`?api=` override; voice knowledge `:8791` / `?voice_api=`). Zero fake PIN/token, zero browser web-storage queue, immutable `flagged_clashes`.
