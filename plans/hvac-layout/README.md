# Unit 4 HVAC & Ductwork — Interactive What-If Layout Module

- **Status:** Planning Sandbox for Monday, Nov 23, 2026 Walkthrough (Serge + Alex) — zero ceiling cuts, zero roof penetrations, and zero equipment installation released.
- **Privacy & Scope:** Zero prices, zero private budget/lender references, and zero internal task identifiers.
- **Scale Guarantee:** Uniform true scale (`scaleX === scaleY`) across both the Unit 4 8-room Attic Floor Plan and the coupled Attic Vertical Section (`66"` attic ridge height, `33.25" H × 14.19" W × 29" D` Carrier/Bryant Legacy 45k BTU furnace, `30" × 30"` service platform, continuous `24"` walkway with `30"` clear passage, Type B flue clearance `≥ 1"`, and `120V` GFCI `≤ 25 ft` live check).
- **Integration Contract (`window.U4PLAN`):**
  - `window.U4PLAN.planId` -> `"hvac-layout"`
  - `getSvgElement()`, `getState()`, `getLang()`, `getRevisionStamp()`, `getAnnotationDataUrl()`, `setLang(lang)`, `render()`
  - Tailnet backend base: `https://mac-mini.tailcf4007.ts.net:8444/api/unit4/plans/hvac-layout` (override via `?api=`).
