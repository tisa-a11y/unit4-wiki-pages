# Unit 4 Crew Wiki & Interactive Plans (`1231 11th Ave`, San Francisco)

Open-access bilingual (**English** / **Español**) site published on GitHub Pages at <https://tisa-a11y.github.io/unit4-wiki-pages/> from repo `tisa-a11y/unit4-wiki-pages` (`main`).

> **Strict Privacy & Crew Rule:** Zero prices, zero dollar signs, zero bids, zero leases, zero payroll, and zero API keys or secrets anywhere in this repository, generated PDFs, interactive plans, or synced JSON files.

---

## Canonical Documentation Index (GitHub + Google Drive + Native Google Docs)

- **Frontend Design & Style Guide (Canonical — Mandatory Two-Layer Human-First UI Gate):**
  - GitHub 1:1 Mirror: [`docs/FRONTEND-STYLE-GUIDE.md`](./docs/FRONTEND-STYLE-GUIDE.md)
  - Drive `.md`: `work-control/UNIT4-FRONTEND-STYLE-GUIDE.md` ([Google Drive File](https://drive.google.com/file/d/1aN8nzwwCG5aPqplwR0YZa9N6utYJoSe2/view))
  - Native Google Doc: [`Unit 4 — Frontend Design & Style Guide (Canonical)`](https://docs.google.com/document/d/1q33pExsA-nOdAtcUwA02in85_Vc4oA1ZM5Mw4G5iXaQ/edit)
- **Backend Architecture, APIs & Operations Runbook (Canonical):**
  - GitHub 1:1 Mirror: [`docs/BACKEND-ARCHITECTURE.md`](./docs/BACKEND-ARCHITECTURE.md)
  - Drive `.md`: `work-control/UNIT4-BACKEND-ARCHITECTURE-AND-RUNBOOK.md` ([Google Drive File](https://drive.google.com/file/d/1JobQpG496kHmBWP0CCo_3H3Ps9kMsB4_/view))
  - Native Google Doc: [`Unit 4 — Backend Architecture, APIs & Operations Runbook`](https://docs.google.com/document/d/1dWd8TlHsd_fg4tUqVBAKQYYcV3NnsnFjSpj_pba9Big/edit)
  - Companion Mac mini Service Runbook Folders in Drive: [`unit4-gemini-live-mini-r5`](https://drive.google.com/drive/folders/15KU_mZ8E5A6jezOf3yfWK1Eqk8njs_0E) (`:8791` Funnel) · [`unit4-plan-edits-r1`](https://drive.google.com/drive/folders/10C_TwKp93ausTbLALD5LwsZDlH1zsiIx) (`:8444` -> `:8792` Tailnet-Only)
- **Wiki Editing Rules & Content Map:** [`content/README.md`](./content/README.md) · Project Start-Here (`START-HERE.md`)

### Locked Two-Layer Rule (Specialists Engineering vs. Human-First Wiki UI)

1. Keep and incorporate **ALL** Specialist engineering work (`scaleX === scaleY` SVG geometry, `*-plan-data.json`, `window.U4PLAN`, `:8444`/`:8791` contracts, and 2-page EN/ES print PDFs inside `#blueprint-sheet-shell` for `?print=1` / `@media print`).
2. **NEVER** ship raw CAD/engineering workbenches as the default screen on GitHub Pages. Every interactive plan opens on a clean Human-First UI (`plans/vendor/u4-human-guide-shell.css`, `u4-plan-nav.js`, `u4-live-ai-widget.{js,css}`) with zero exposed Tailnet/EOD/baseline plumbing, collapsed `🔧 Equipment & Supplies ▾`, bare subfloor toggle, prominent `English (EN)` / `Español (MX)` switch, `Light / Dark` theme, and `Print / PDF`.

---

## Architecture & Build Pipeline

- **`docs/`** — Canonical `FRONTEND-STYLE-GUIDE.md` & `BACKEND-ARCHITECTURE.md` (1:1 synced from Drive `work-control/`).
- **`content/`** — Modular page content and shared data:
  - `content/site.json` — Page order (`pages`) and per-page configuration.
  - `content/pages/<page>/` — Per-room/topic Markdown (`en.md`, `es.md`), metadata (`page.json`), milestones (`checklist.json`), key-facts cards (`key-facts.json`), visuals (`visuals.json`), links (`documents.json`), and bilingual `.en.html` / `.es.html` blocks.
  - `content/packets.json` — Crew packets list (each requires English + Spanish).
  - `content/data/` — Shared datasets including `kitchen-cabinet-schedule.json`, `kitchen-west-ks4-plan-data.json`, `kitchen-electrical-plan-data.json`, `attic-hatch-plan-data.json`, `hvac-layout-plan-data.json`, `murphy-door-plan-data.json`, `pdf-files.json`, `document-dates.json`, `project-planning-decisions.js`, `labor-hours.json`, and `todoist-mirror.json`.
  - See [`content/README.md`](./content/README.md) for Tisa's editorial rules (Rules 1–13).
- **`src/template.html`** — App shell, typography/theme CSS, navigation drawer (`nav#rail` with preserved `genieIn` / `genieOut` animations), `?lang=`/`?theme=` seamless plan handoffs, Field Notes intake (`#repForm`), Live Voice Chat (`#u4VoiceChatDialog`, hidden by default behind the floating circular waveform button), and shared `#u4CameraModal` photo/camera capture UI.
- **`tools/`** — Build and verification scripts:
  - `python3 tools/build.py` — Compiles `src/template.html` + `content/` into root `index.html` and validates JSON, EN/ES pairs, and JS syntax (`node --check`).
  - `python3 tools/build.py --check` — Exits non-zero if `index.html` is out of date relative to `src/` or `content/`.
  - `python3 tools/smoke_test.py` — Runs headless Chrome over every wiki page in EN and MX ES at mobile (`390x844`) width and requires `0` errors and `0` horizontal overflow.
  - `python3 tools/extract_from_index.py` — Utility to recover edits back into `content/` and `src/` if someone ever touched `index.html`.
- **Never edit `index.html` by hand.** Always edit `content/` or `src/template.html` and run `python3 tools/build.py` (commit `content/`, `src/`, and regenerated `index.html` together).

---

## 6 Interactive Crew Plans & 12 Official 2-Page EN/ES PDFs (+ Sheet 4 R2)

All **6 interactive modules** share the Human-First shell, Live AI Guidance widget (`plans/vendor/u4-live-ai-widget.{js,css}`), unified seamless navigation (`plans/vendor/u4-plan-nav.js`), local zero-CDN PDF export (`plans/vendor/`: `jspdf.umd.min.js`, `svg2pdf.umd.min.js`, `ks4-pdf-export.js`, local fonts), strict uniform scale (`scaleX === scaleY`), bare subfloor toggle (defaulting to bare subfloor `+ t`), and collapsed `🔧 Equipment & Supplies`:

1. **Kitchen — West Range & Hood Wall (`kitchen-west-ks4`)**
   - Path: [`plans/kitchen-west-ks4/`](./plans/kitchen-west-ks4/index.html) (`ks4-5step-guide.{js,css}` default Human-First 5-step view + print/blueprint `#blueprint-sheet-shell`)
   - Seed JSON: `plans/kitchen-west-ks4-plan-data.json` & `content/data/kitchen-west-ks4-plan-data.json` (`1/2"` drywall ONLY `0.50"` next to `1/2"` HardieBacker 500 `0.42"` with NO `3/16"` stud shims; blank initial tile default showing `39.34 sq ft` net wall area; zero metal edge trim / Schluter ban; silicone-only 90° North inside corner; 4 zero-metal South end options only; low `1"` Viking island trim; flush 1-gang `2" x 3"` box `HD-1` at `~83"-86"` AFF; dedicated kitchen hood duct owned by John/crew, not NEXT HVAC).
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_kitchen_ks4-interactive_R1_EN.pdf` & `_ES.pdf`.
   - Standalone Printable Sheet 4 (`R2`): `wiki-pdfs/2026-11-20_U4_kitchen_zephyr-savona-mock-hookup_04-hood-electrical_R2_EN.pdf` & `_ES.pdf` (`04-hood-electrical` R2 syncing `~83"–86"` flush 1-gang `HD-1` + `1/2"` drywall / NO `3/16"` shims).
2. **Kitchen — Whole-Room Floor Plan & Cabinet Schedule (`kitchen-floor-plan`)**
   - Path: [`plans/kitchen-floor-plan/`](./plans/kitchen-floor-plan/index.html) (compat redirect at `plans/kitchen-floor-plan.html`)
   - Canonical Seed JSON: `content/data/kitchen-cabinet-schedule.json` & `plans/kitchen-cabinet-schedule.json`.
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_kitchen_floor-plan-interactive_R1_EN.pdf` & `_ES.pdf`.
3. **Kitchen — Electrical Plan & Panel `D04` (`kitchen-electrical`)**
   - Path: [`plans/kitchen-electrical/`](./plans/kitchen-electrical/index.html) (`kelec-human-guide.js` 4-step view + 6 coupled `scaleX === scaleY` views, interactive 20-space `D04` breaker schedule, Option A vs. Option B disposal switch toggle, Manhattan cable length takeoff with zero pricing)
   - Canonical Seed JSON: `plans/kitchen-electrical-plan-data.json` & `content/data/kitchen-electrical-plan-data.json`.
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_kitchen_electrical-d04-interactive_R1_EN.pdf` & `_ES.pdf`.
4. **Attic — Permanent Attic Hatch & Enclosure (`attic-hatch`)**
   - Path: [`plans/attic-hatch/`](./plans/attic-hatch/index.html) · Seed JSON: `plans/attic-hatch-plan-data.json` & `content/data/attic-hatch-plan-data.json`.
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_attic_hatch-interactive_R1_EN.pdf` & `_ES.pdf`.
5. **HVAC — Attic Furnace & Ducts Layout (`hvac-layout`)**
   - Path: [`plans/hvac-layout/`](./plans/hvac-layout/index.html) · Seed JSON: `plans/hvac-layout-plan-data.json` & `content/data/hvac-layout-plan-data.json`.
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_hvac_layout-interactive_R1_EN.pdf` & `_ES.pdf`.
6. **Laundry Closet — Murphy Bookcase Door (`murphy-door`)**
   - Path: [`plans/murphy-door/`](./plans/murphy-door/index.html) · Seed JSON: `plans/murphy-door-plan-data.json` & `content/data/murphy-door-plan-data.json`.
   - Official R1 Letter PDFs (`2` pages each): `wiki-pdfs/2026-11-20_U4_laundry_murphy-door-interactive_R1_EN.pdf` & `_ES.pdf`.

Regenerate all 12 official 2-page EN/ES PDFs directly from the interactive plans via headless Chrome:

```sh
python3 plans/generate_official_pdfs.py --all
```

---

## Photo/Camera Intake, Mac mini Backends & Chrome 142+ Tailnet LNA Note

- **Photo & Camera Capture (`#repForm` & `#u4VoiceChatDialog`):** Field Notes (`#u4PhotoTriggerBtn`, `#u4CameraTriggerBtn`) and Voice Chat (`#u4VdPhotoBtn`, `#u4VdCameraBtn`) share `#u4CameraModal` (`getUserMedia` + mobile file-capture fallback, compressed JPEG upload, guaranteed `MediaStreamTrack.stop()` cleanup on close, and Gemini Live WebSocket `inlineData` streaming with carry-over into voice memo and draft tools).
- **Wiki Knowledge Mirror:** [`wiki-assets/unit4-backend-knowledge.json`](./wiki-assets/unit4-backend-knowledge.json) (synced from Mac mini `:8791` `build_r8_knowledge.py` output `work-control/unit4-backend-knowledge-latest.json`, zero pricing).
- **Mac mini `:8791` — Tailscale Funnel (`https://mac-mini.tailcf4007.ts.net/api/unit4/*`, service `com.tisa.unit4-wiki-intake`):**
  - `GET /api/unit4/healthz` (and `GET /healthz`)
  - `POST /api/unit4/voice-token` (`15` Live Voice R8 tools)
  - `GET /api/unit4/knowledge`
  - `POST /api/unit4/wiki-intake` and `POST /api/unit4/wiki-intake/voice-memo`
  - `POST /api/unit4/product-lookup` (`query`, `url` with SSRF guard, or `image_base64` camera label scan; returns `matching_trim_parts[]` and `zero_metal_trim_guidance`; keeps all price fields `null` / zero pricing by default for crew/public clients unless authorized owner flag `include_retail_estimate: true` is sent).
- **Mac mini `:8444` -> `:8792` — Tailnet-Only (`com.tisa.unit4-plan-edits`, NEVER exposed on Funnel):**
  - Persists interactive plan dimension/pin overrides (`base_rev` optimistic concurrency + EOD Accept/Reject queue) across all **6 `plan_id`s** (`kitchen-west-ks4`, `kitchen-floor-plan`, `kitchen-electrical`, `attic-hatch`, `hvac-layout`, `murphy-door`).
- **Chrome 142+ Local Network Access (LNA) Tailnet Note:** On tailnet devices, `mac-mini.tailcf4007.ts.net` resolves via MagicDNS to CGNAT `100.114.3.50` (off-tailnet resolves to Tailscale Funnel public IPs `208.111.34.11` / `208.111.35.209`). Both servers send `Access-Control-Allow-Private-Network: true`, and tailnet Chrome 142+ users must grant site permission **`Local network access -> Allow`** on `https://tisa-a11y.github.io` for live backend calls on-tailnet (AI/Voice/Lookup widgets also degrade gracefully offline without crashing).
