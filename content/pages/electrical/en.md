# Electrical

## Concept
New 20-space Eaton **Panel** (`BRP20L125G`) in the shared Kitchen / Dining wall, opening East into the Dining Room. Every drawing separates fixed physical box names from assigned breaker numbers (`#1`–`#20`) so circuits can be split later without renaming any wall box or switch.

## Official Working Blueprints (Rev R5) & Interactive Plan
- **Module 1 — Kitchen Electrical Sheets (`E-00A` to `E-14`, 6 Landscape Pages):** [Preview PDF in Wiki](#doc:1Emm8uxfmx1TNmCpM6mAkHwOSThP7aZDK) · [Open Web Sheets](./wiki-docs/2026-11-23_U4_Module1_Kitchen-Electrical_R5_EN.html) — 20-space `Panel` directory, `1:1` Kitchen floor plan (`X = 31.5"` West Range Wall step), all four `1:1` wall elevations with dual bare-subfloor (`+t`) datums, and pre-drywall checklist.
- **Module 2 — Whole-Unit Electrical Segments (`E-00A` to `E-25`, 7 Landscape Pages):** [Preview PDF in Wiki](#doc:10_htwyB2y2TxyG7GW0LkpDwUm92Eo1pY) · [Open Web Sheets](./wiki-docs/2026-11-23_U4_Module2_Whole-Unit-Segments_R5_EN.html) — `1:1` unit key map, Living & Dining (`E-22`), Bathroom All-in-One (`E-23`), Laundry + Bedroom & Hall (`E-24`), and Attic Furnace & Smoke/CO (`E-25`).
- **Interactive Kitchen Reference:** Open the [Interactive Kitchen Electrical Plan](./plans/kitchen-electrical/index.html) or the [Hood Test-Hang Wiring & Photos Sheet](#doc:2026-11-20_U4_kitchen_zephyr-savona-mock-hookup_04-hood-electrical_R2_EN).

## Panel (`#1`–`#20`) & Room Circuit Summary
- **Panel & Clear Space:** Eaton `BRP20L125G` (`125A` main-lug, 20 spaces; called `D04` on older framing sheets) at `X = 147"`, `Y = 213.75"`, opening East into Dining. Keep `30" W × 36" D × 78" H` clear in front of the `Panel`, put **zero outlets on the Dining Panel wall**, and keep **zero screws or back-entries** in the `13"–27-1/2"` N, `53"–77"` AFF Kitchen back zone.
- **Kitchen (`#1`–`#9`, New Romex):**
  - `#1` **Kitchen East Counter** (`20A · 12/2` → `East 1 @ 10"`, `East 2 @ 45"`), `#2` **Kitchen South Counter** (`20A · 12/2` → `South 1 @ 24"`, `South 2 @ 62"*`), `#3` **Kitchen West Counter** (`20A · 12/2` → `West 1 @ 9"`, `West 2 @ 57"` N of Step, `~1"` tile mud rings; `1/2"` drywall + `1/2"` HardieBacker, zero shims).
  - `#4` **Fridge** (`20A · 12/2` → `Fridge @ 68"` N, `15"` AFF), `#5` **Dishwasher** (`20A · 12/2` → left yoke of `Under-Sink 2-Gang @ 76"*`, `14"` AFF) & `#6` **Disposal** (`15A · 14/2` → right yoke on separate receptacle/neutral + `Disposal Air Button @ 90"*`).
  - `#7` **Gas Range** (`15A · 14/2` → `Range @ 33"` N, `3"` AFF), `#8` **Range Hood** (`15A AFCI + BRLW1` lock → flush 1-gang `2" × 3"` set `~1"` proud at `33" ± 2-1/4"` N, `83"–86"` AFF), `#9` **Kitchen Lights** (`15A · 14/2` → `Entry 3-Switch @ 35.5"` W of NE feeding `Ceiling Light`, `Sink Pendants @ 75"/99"`, and `Under-Cab Lights`).
- **Common Rooms (`#10`–`#12`, Reuse Sound Existing + New via Attic J-Boxes):**
  - `#10` **Living & Dining Outlets** (`Dining 1–4`, `Living 1–5` via `Living/Dining J-Box`), `#11` **Bedroom & Hall Outlets** (`Bed 1–5`, `Hall 1` via `Bed/Hall J-Box`), `#12` **Room Lights** (`15A · 14/2 + 14/3` Red 3-way travelers via `Lights J-Box`).
  - **Mandatory Gauge Gate:** Verify wire gauge on every reused leg; if **any** reused wire on `#10` or `#11` is `14 AWG`, install a `15A AFCI` (`BRN115AF`) breaker — never `20A`.
- **Bathroom, Laundry & Attic (`#13`–`#16`, New) + Spares (`#17`–`#20`):**
  - `#13` **Bathroom All-in-One** (`20A AFCI/GFCI · 12/2` via `Bath J-Box`): **100% `12/2` Yellow** on all legs (`Vanity`, `Vanity Light`, `Bath Light`, `Humidity Fan`, solid-jamb `Bath Switches`, plus a **separate `12/2` drop for `Toilet` before Tuesday tile** so it can split cleanly to Spare `#19` later).
  - `#14` **Laundry WashTower** (`20A AFCI/GFCI at Panel · 12/2`): **one standard `20A` duplex outlet** on the East/Right wall at `38"` AFF clearing the `8-1/4"` Murphy bookcase door for both `120V` plugs of the `LG WKG101HVA` gas WashTower.
  - `#15` **Attic Furnace** (`15A · 14/2` dedicated to `F1` + disconnect at `174", 258"`).
  - `#16` **Attic Light, Outlet & Smoke/CO** (`15A AFCI-ONLY BRN115AF` — **never** a GFCI breaker): unswitched `14/2 + 14/3` Red interconnect to Hall, Bedroom, and Living Smoke/CO alarms (`>=36"` from Bath door & HVAC supply registers; `>=10–20 ft` from gas range), `LINE`-only GFCI `Attic Outlet` (`<=25 ft` from `F1`), `Hatch Switch` (Option A landing wall or Option B inside `2x` curb), and 2 enclosed LEDs on `2×4` rafter blocking `>=1-1/2"` below the flat-roof deck.
  - `#17`–`#20` **Open Spares:** Reserved for optional future splits from the 4 flagged Attic J-Boxes.

## Active Holds Before Fastening or Pulling Wire
- **Panel & Feeder Hold:** Confirm NEXT `80A/#4` vs. `100A/#3` feeder and hold side-entry notches on the `Panel` wall before closing framing.
- **Non-kitchen wire hold:** Keep wire pulling on hold until owner/inspector release. `SFEC 362.10` restricts `ENT` in wood walls; `SFEC 334.10(2)` permits concealed `NM-B`.
- **Bathroom and closet:** The pocket door was retired Nov 24 for a 28" outward-swing hallway door; the framed South wall allows switches. Keep the NW bedroom-closet ceiling open until the switch cable and hatch finish.
- **Kitchen South Window & Bare Subfloor Datum:** Verify South window centerline (`87"` vs. `90"` W of SE) and finished-floor thickness `+t` (`H_subfloor = H_AFF + t`, est. `3/4"`) on site before fastening boxes.

## Bathroom wall work
Keep bathroom wall tile on hold until Alex returns; the separate toilet drop must precede tile. The retired pocket door is replaced by the locked 28" outward-swing hallway door; the South stud wall allows switches.
