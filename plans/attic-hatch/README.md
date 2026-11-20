# Unit 4 Permanent Attic Hatch (24" × 36" Finished Clear) — Interactive Plan (Module 2)

Self-contained, offline-first, true-to-scale interactive architectural plan for the **Unit 4 Permanent Attic Access Hatch, Walkway & Enclosure** (working planning draft — zero ceiling cuts until gates pass).

## What's Inside
- `index.html` — Visual-first responsive app (phone -> tablet -> desktop -> exact 2-page Letter print PDF) in plain on-site English & Mexican Spanish.
- `attic-renderer.js` — Strict uniform-scale (`scaleX === scaleY`) parametric SVG engine (`viewBox="0 0 920 1120"`) with coupled **Ceiling & Hallway Plan** and **Attic Vertical Section** tabs, Ceiling Fire-Rating Gate (disables proposed `27-1/2" × 39-1/2"` wood kit & lumber takeoff when fire-rated ceiling is required), live Joist Bay `B` validator, **Draggable Walkway `L` (`<= 20 ft` cap at `66"` headroom)** + Saw-Kerf `4×8` OSB/Plywood Sheet Calculator (`<=7 ft: 1`, `7–14 ft: 2`, `14–20 ft: 3`), pre-seeded `existing_original_trim` baseline (`9-1/2"` baseboard, `103"` picture rail), Live Proposed Materials Takeoff (**zero prices**), Attached Comment Callout UX (SVG leader lines + per-comment mic dictation + individual **Send to Agent**), and EOD Accept/Reject drawer.
- `attic-styles.css` — Cool drafting bond + blueprint ink + BM Essex Green HC-188 architectural styling, zero external CDN dependencies.
- `assets/attic-hatch-candidate.jpg` — Upright real site photo of the Door 4 landing candidate ceiling area.

## Unified Integration Contract (`window.U4PLAN`)
- `planId`: `'attic-hatch'`
- `getSvgElement()`: returns `<svg id="attic-svg">`
- `getState()`, `getTakeoff()`, `getScaleInfo()` (`scaleX === scaleY`), `getView()` / `setView('plan' | 'section')`, `getLang()` / `setLang('en' | 'es')`, `getRevisionStamp()`, `getAnnotationDataUrl()`, `applyLocalPatch(patch)`, `render()`.
- `#btn-download-pdf` auto-wires to `window.U4PlanPdfExport?.exportPdf()` -> `window.U4KS4PdfExport?.exportPdf()` -> `window.print()`.

## Security, Privacy & Accuracy Invariants
- **Locked `24" × 36"` Finished Clear:** Client code never allows shrinking the locked clear opening (`14.19" × 29"` Carrier/Bryant Legacy 45k furnace end-first pass).
- **Provisional Dashed Outlines:** Unmeasured `joist_bay_width_b_in`, `walkway_run_length_ft`, and wall offsets render with dashed `"Measure on site — proportion provisional"` / `"Medir en obra — proporción provisional"` until measured.
- **Tailnet-Only Persistence:** Connects to `https://mac-mini.tailcf4007.ts.net:8444/api/unit4/plans/attic-hatch` (`?api=` override; voice knowledge `:8791` / `?voice_api=`). Zero fake PIN/token, zero browser web-storage queue, zero `$` / prices, immutable `flagged_clashes`.
