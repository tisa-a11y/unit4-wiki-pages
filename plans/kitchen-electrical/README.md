# Unit 4 Kitchen — Coupled Interactive Kitchen Electrical & Subpanel D04 Plan (Module 6 / Wave D)

Self-contained, offline-first, true-to-scale (`scaleX === scaleY`) bilingual English & Mexican Spanish interactive architectural electrical plan for the **1231 11th Avenue Unit 4 Kitchen** and **Eaton `BRP20L125G` 20-Space Subpanel `D04`**, seeded from `kitchen/kitchen-electrical-plan-data.json`.

## What's Inside
- `index.html` — Visual-first responsive app (phone `390px` -> tablet -> desktop -> exact 2-page Letter print PDF) with top cross-plan jump bar (`← Back to Kitchen Page` · `Kitchen Floor Plan →` · `West Range & Hood Wall →`).
- `kitchen-electrical-renderer.js` — Uniform true-scale (`scaleX === scaleY`) parametric SVG engine (`viewBox="0 0 920 1120"`) with **6 coupled interactive views**:
  1. **Floor, Ceiling & Cable-Route Plan (`147" × 126-1/4"`):** Dining-side `D04` `30" × 36"` working space, solid in-wall bore bands vs. dashed attic home runs, live `24"` countertop reach arcs (green `<= 24"`, red `> 24"`), ceiling lights (`3` task lights vs. `2` pendants).
  2. **South Sink / Window / Pie-Safe Wall (`0"–147"`):** Draggable Pie-Safe (`26"–59"`) & Sink Base (`75"–105"`), `S1 @ 24"`, `S2 @ 65"`, `DW-GD` 2-gang inside sink base `@ 79", 14"` high (separate neutrals labeled, never behind `51"–75"` dishwasher), `30"/26"/24"/20"` bore bands, 1-tap toggle **Option A (Sink-Deck Air Button + Wireless Remote at `S2`)** vs **Option B (Wired 2-Gang Switch `@ 70"`)**.
  3. **East Fridge / `D04` Backside Wall (`0"–126-1/4"`) + 1-Tap Dining `D04` Flip:** `E1 @ 10"`, `E2 @ 48"`, `REF-1 @ 74" (15" high)`, `50"` & `52-1/2"` bore bands, hard red hatched `53"–77"` × `S1–S2` Kitchen No-Screw / No-Back-Entry Zone (`D04` side-entry notches ON HOLD), plus 1-tap Dining Room Front flip (`CL = W/4 + 1"`).
  4. **West Range / Hood Wall (`0"–66-1/4"`):** `W1 @ 9"`, `W2 @ 57"` (`~1"` tile mud rings), `RG-1 @ 33" (3" high)` inside Viking low rear pocket (low `1"` island trim confirmed), `HD-1` flush 1-gang `2"×3"` box `@ 33" ± 2-1/4", ~83"–86"` above finished floor (`+t` bare subfloor, `~1"` proud — replacing retired `4"×4"` box at `100"/104"`), `1/2"` drywall (`0.50"`) to `1/2"` HardieBacker (`0.42"`) with zero stud shims (`~1/16"` skim only).
  5. **North Entry Wall (`115-1/2"`):** `SW-ENTRY` 3-gang (`6"` W of NE corner, `48"` high) + adjacent `29-1/2" × 79"` `[clear_between_casings]` East hallway return opening, toggleable `existing_original_trim` (`9-1/2"` baseboard, `103"` picture rail), global `44"` vs. `41"` counter outlet height toggle.
  6. **Interactive `D04` Eaton `BRP20L125G` 20-Space Schedule & Live Manhattan Cable Calculator:** Click any space (`1–9` Kitchen + `10–20` Unit context) to highlight routes/boxes, live `|Δx| + |Δy| + |Δz| + 18"` box tails + editable waste `%`, and Eaton BR breaker/box/mud-ring counts (**strictly zero prices**, labeled *"Gross Proposed Qty — Verify On-Hand Stock Before Ordering"*).
- `kitchen-electrical-styles.css` — Cool drafting bond + blueprint ink + BM Essex Green HC-188 styling, zero external CDNs, exact 2-page Letter print rules (`@media print` and `?print=1` `.print-mode`).
- `assets/south-sink-wall.jpg` & `assets/west-range-wall.jpeg` — Real Unit 4 open-stud kitchen wall site photos.

## Query Parameters & Unified Integration Contract (`window.U4PLAN`)
- **URL Parameters:** `?lang=en|es`, `?view=floor|south|east|west|north|panel`, `?print=1`, `?api=<origin>` (Tailnet override endpoint), `?voice_api=<origin>`.
- **`window.U4PLAN`:**
  - `planId`: `'kitchen-electrical'`
  - `getSvgElement()`, `getState()`, `getTakeoff()`, `getReachCheck()`, `getScaleInfo()` (`scaleX === scaleY` on all 6 views), `getView()` / `setView('floor'|'south'|'east'|'west'|'north'|'panel')`, `getLang()` / `setLang('en'|'es')`, `selectCircuit(id)`, `setFloorCondition('bare_subfloor'|'finished_installed', tIn)`, `getRevisionStamp()`, `getAnnotationDataUrl()`, `applyLocalPatch(patch)`, `render()`.
- `#btn-download-pdf` auto-wires to `window.U4PlanPdfExport?.exportPdf()` -> `window.U4KS4PdfExport?.exportPdf()` -> `window.print()`.

## Security, Privacy & Crew Safety Invariants
- **Zero Prices / Private-Data Firewall:** Strictly quantities & dimensions only; zero currency symbols, prices, quotes, bids, order numbers, or private contact links.
- **Plain Crew Language (EN & MX Spanish):** Avoids internal document/code abbreviations in crew labels while keeping `D04`, Eaton catalog numbers, appliance models, and explicit `measure_boundary` datums.
- **Tailnet-Only Persistence & Graceful Offline Fallback:** Connects to `https://mac-mini.tailcf4007.ts.net:8444/api/unit4/plans/kitchen-electrical` (`/health`, `GET` w/ `/state` fallback, `POST /override` with `base_rev` `409` guard, and `POST /eod` `accept`/`reject`, `credentials: 'omit'`, PNA-compatible) with automatic offline preview/export mode when unreachable, zero browser storage (`localStorage`/`sessionStorage`/`indexedDB`), and immutable `flagged_clashes`.
