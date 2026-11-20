# Unit 4 Murphy Bookcase Door — Interactive Coupled Planner Module

- **Status:** HARD HOLD until all 9 inside-jamb doorway measurements (`B7`–`B15`), actual hardware hinge stack thicknesses, and a full-size cardboard swing mockup pass. Never use Bathroom Doorway A readings (`27-1/4" × 79-3/8"`).
- **Privacy & Scope:** Zero prices, zero private budget/lender references, and zero order numbers.
- **Coupled Multi-View True Scale (`scaleX === scaleY`):**
  1. Hallway Elevation facing North (`← West Doorway A [Bathroom pocket door deferred Wall A–B clash] | Center Doorway B [Murphy Bookcase] | East Opening C [Bedroom] →`) with live `B7`–`B12` resizing and original crown/casing preservation.
  2. Coupled Top-Down Floor Plan (`41-1/4"` clear hallway + Wall A–B + `36-5/16" × 82-5/8"` Laundry Closet + `LG WKG101HVA` `27" × 30-3/8"` side/rear clearances + true `90°` left-pivot out-swing arc).
  3. Coupled Laundry Closet Interior Elevation + Jamb Section (`V1 ≥ 48 sq in @ ≥ 72"`, `V2 ≥ 24 sq in @ ≤ 12"`, total net free area `≥ 100 sq in`, inside emergency release, Jamb Depth `J`, Case Depth `8-1/4"` vs `9-1/16"`).
- **Integration Contract (`window.U4PLAN`):**
  - `window.U4PLAN.planId` -> `"murphy-door"`
  - `getSvgElement()`, `getState()`, `getLang()`, `getRevisionStamp()`, `getAnnotationDataUrl()`, `setLang(lang)`, `render()`
  - Tailnet backend base: `https://mac-mini.tailcf4007.ts.net:8444/api/unit4/plans/murphy-door` (override via `?api=`).
