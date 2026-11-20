# Unit 4 Crew Wiki & Interactive Plans (`1231 11th Ave`, San Francisco)

Open-access bilingual (**English** / **Español**) site published on GitHub Pages at <https://tisa-a11y.github.io/unit4-wiki-pages/> from repo `tisa-a11y/unit4-wiki-pages` (`main`).

> **Strict Privacy & Crew Rule:** Zero prices, zero dollar signs, zero bids, zero leases, zero payroll, and zero API keys or secrets anywhere in this repository, generated PDFs, interactive plans, or synced JSON files.

---

## Architecture & Build Pipeline

- **`content/`** — Modular page content and shared data:
  - `content/site.json` — Page order (`pages`) and per-page configuration.
  - `content/pages/<page>/` — Per-room/topic Markdown (`en.md`, `es.md`), metadata (`page.json`), milestones (`checklist.json`), key-facts cards (`key-facts.json`), visuals (`visuals.json`), links (`documents.json`), and bilingual `.en.html` / `.es.html` blocks.
  - `content/packets.json` — Crew packets list (each requires English + Spanish).
  - `content/data/` — Shared datasets including `kitchen-cabinet-schedule.json`, `*-plan-data.json`, `pdf-files.json`, `document-dates.json`, `project-planning-decisions.js`, `labor-hours.json`, `todoist-mirror.json`.
  - See [`content/README.md`](./content/README.md) for Tisa's editorial rules (Rules 1–13).
- **`src/template.html`** — App shell, typography/theme CSS, navigation drawer (`nav#rail` with preserved `genieIn` / `genieOut` animations), Field Notes intake (`#repForm`), Live Voice Chat (`#u4VoiceChatDialog`, hidden by default behind the floating circular waveform button), and shared `#u4CameraModal` photo/camera capture UI.
- **`tools/`** — Build and verification scripts:
  - `python3 tools/build.py` — Compiles `src/template.html` + `content/` into root `index.html` and validates JSON, EN/ES pairs, and JS syntax (`node --check`).
  - `python3 tools/build.py --check` — Exits non-zero if `index.html` is out of date relative to `src/` or `content/`.
  - `python3 tools/smoke_test.py` — Runs headless Chrome over every wiki page in EN and MX ES at mobile (`390x844`) width and requires `0` errors and `0` horizontal overflow.
  - `python3 tools/extract_from_index.py` — Utility to recover edits back into `content/` and `src/` if someone ever touched `index.html`.
- **Never edit `index.html` by hand.** Always edit `content/` or `src/template.html` and run `python3 tools/build.py` (commit `content/`, `src/`, and regenerated `index.html` together).

---

## Interactive Crew Plans & Official 2-Page EN/ES PDFs

All 5 interactive modules render vector SVG plans with strict uniform scale (`scaleX === scaleY`), local zero-CDN PDF export (`plans/vendor/`: `jspdf.umd.min.js`, `svg2pdf.umd.min.js`, `ks4-pdf-export.js`, local fonts), attached SVG leader-line comments with per-comment mic dictation, bare subfloor toggle (defaulting to bare subfloor `+ t` vs. finished floor down), and collapsed per-step `Equipment Needed & Calculate Materials` panels:

1. **Kitchen — West Range & Hood Wall (`kitchen-west-ks4`)**
   - Path: [`plans/kitchen-west-ks4/`](./plans/kitchen-west-ks4/index.html)
   - Seed JSON: `plans/kitchen-west-ks4-plan-data.json` (`1/2"` drywall ONLY next to `1/2"` HardieBacker 500 `0.42"` with NO `3/16"` stud shims; blank initial tile default showing `39.34 sq ft` net wall area; zero metal edge trim / Schluter ban; silicone-only 90° North inside corner; 4 zero-metal South end options only; low `1"` Viking island trim; flush 1-gang `2" x 3"` box `~83"-86"` AFF; dedicated kitchen hood duct owned by John/crew, not NEXT HVAC).
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_kitchen_ks4-interactive_R1_EN.pdf` & `_ES.pdf`.
2. **Kitchen — Whole-Room Floor Plan & Cabinet Schedule (`kitchen-floor-plan`)**
   - Path: [`plans/kitchen-floor-plan/`](./plans/kitchen-floor-plan/index.html) (compat redirect at `plans/kitchen-floor-plan.html`)
   - Canonical Seed JSON: `content/data/kitchen-cabinet-schedule.json` & `plans/kitchen-cabinet-schedule.json`.
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_kitchen_floor-plan-interactive_R1_EN.pdf` & `_ES.pdf`.
3. **Attic — Permanent Attic Hatch & Enclosure (`attic-hatch`)**
   - Path: [`plans/attic-hatch/`](./plans/attic-hatch/index.html) · Seed JSON: `plans/attic-hatch-plan-data.json` & `content/data/attic-hatch-plan-data.json`.
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_attic_hatch-interactive_R1_EN.pdf` & `_ES.pdf`.
4. **HVAC — Attic Furnace & Ducts Layout (`hvac-layout`)**
   - Path: [`plans/hvac-layout/`](./plans/hvac-layout/index.html) · Seed JSON: `plans/hvac-layout-plan-data.json` & `content/data/hvac-layout-plan-data.json`.
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_hvac_layout-interactive_R1_EN.pdf` & `_ES.pdf`.
5. **Laundry Closet — Murphy Bookcase Door (`murphy-door`)**
   - Path: [`plans/murphy-door/`](./plans/murphy-door/index.html) · Seed JSON: `plans/murphy-door-plan-data.json` & `content/data/murphy-door-plan-data.json`.
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_laundry_murphy-door-interactive_R1_EN.pdf` & `_ES.pdf`.

Regenerate the official 2-page EN/ES PDFs directly from the interactive plans via headless Chrome:

```sh
python3 plans/generate_official_pdfs.py --all
```

---

## Photo/Camera Intake & Mac mini Backend Services

- **Photo & Camera Capture (`#repForm` & `#u4VoiceChatDialog`):** Field Notes (`#u4PhotoTriggerBtn`, `#u4CameraTriggerBtn`) and Voice Chat (`#u4VdPhotoBtn`, `#u4VdCameraBtn`) share `#u4CameraModal` (`getUserMedia` + mobile file-capture fallback, compressed JPEG upload, guaranteed `MediaStreamTrack.stop()` cleanup on close, and Gemini Live WebSocket `inlineData` streaming with carry-over into voice memo and draft tools).
- **Wiki Knowledge Mirror:** [`wiki-assets/unit4-backend-knowledge.json`](./wiki-assets/unit4-backend-knowledge.json) (synced from Mac mini `:8791` `build_r8_knowledge.py` output `work-control/unit4-backend-knowledge-latest.json`, zero pricing).
- **Mac mini `:8791` — Tailscale Funnel (`https://mac-mini.tailcf4007.ts.net/api/unit4/*`, service `com.tisa.unit4-wiki-intake`):**
  - `GET /api/unit4/healthz`
  - `POST /api/unit4/voice-token` (`15` Live Voice R8 tools)
  - `GET /api/unit4/knowledge`
  - `POST /api/unit4/wiki-intake` and `POST /api/unit4/wiki-intake/voice-memo`
  - `POST /api/unit4/product-lookup` (`query`, `url` with SSRF guard, or `image_base64` camera label scan; returns `matching_trim_parts[]` and `zero_metal_trim_guidance`; keeps all price fields `null` / zero pricing by default for crew/public clients unless authorized owner flag `include_retail_estimate: true` is sent).
- **Mac mini `:8444` -> `:8792` — Tailnet-Only (`com.tisa.unit4-plan-edits`, NEVER exposed on Funnel):**
  - Persists interactive plan dimension/pin overrides (`base_rev` optimistic concurrency + EOD Accept/Reject queue) across all 5 `plan_id`s.
  - Interactive plan UIs read live overrides gracefully and degrade cleanly offline when accessed outside the tailnet.
