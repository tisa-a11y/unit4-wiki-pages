# Unit 4 Backend Architecture, All-Rooms Spatial Engine & Productization Runbook (Canonical R10 / v3)

- **Current Operating Reference:** November 24, 2026 (`unit4-plan-edits-all-rooms-v3` + `r9-voice-18tools-persistent-live-ai`)
- **Backend, Ingress & Storage Owner:** `@ag-unit-4-backend` & Unit 4 PM / Wiki Architecture
- **Canonical Locations:**
  1. **Google Doc Runbook (Native Mirror):** [Unit 4 — Backend Architecture, APIs & Operations Runbook](https://docs.google.com/document/d/1dWd8TlHsd_fg4tUqVBAKQYYcV3NnsnFjSpj_pba9Big/edit)
  2. **GitHub Wiki Repository:** [`docs/BACKEND-ARCHITECTURE.md`](https://github.com/tisa-a11y/unit4-wiki-pages/blob/main/docs/BACKEND-ARCHITECTURE.md) and [`docs/PILOT-TO-PRODUCT-ARCHITECTURE.md`](https://github.com/tisa-a11y/unit4-wiki-pages/blob/main/docs/PILOT-TO-PRODUCT-ARCHITECTURE.md)
  3. **SMB / Google Drive Shared Source:** `work-control/UNIT4-BACKEND-ARCHITECTURE-AND-RUNBOOK.md` ([Drive File](https://drive.google.com/file/d/1JobQpG496kHmBWP0CCo_3H3Ps9kMsB4_/view))
  4. **Service Runbooks:** `work-control/unit4-gemini-live-mini-r5/README.md` (`:8791`) and `work-control/unit4-plan-edits-r1/README.md` (`:8444` -> `127.0.0.1:8792`)
- **Privacy & Security Boundary:** Zero currency symbols or retail/bid figures, zero API keys or tokens, zero private owner/personnel records, and zero metal/Schluter tile trim recommendations across public crew artifacts.

---

## 1. Three-Plane System Architecture

The 1231 11th Avenue Unit 4 platform separates public static crew delivery from two isolated Python HTTP daemons on the always-on Mac mini (`mac-mini.tailcf4007.ts.net`):

1. **Plane A — Static Edge Delivery & Two-Layer Human-UI Gate (`GitHub Pages CDN`):**
   - Built deterministically by `python3 tools/build.py` from modular sources (`src/template.html`, `content/pages/<room>/`, `content/data/<plan_id>-plan-data.json`, `plans/<module>/`, `wiki-pdfs/`).
   - Enforces the **Two-Layer Gate**: exact `1:1` (`scaleX === scaleY`) SVG geometry, `window.U4PLAN` state, and 2-page EN/ES `?print=1&snapshot=1` Letter PDFs run in the technical engine while the default mobile screen (`390px`) stays calm, bilingual (`EN | ES`), and human-first.
2. **Plane B — Public Tailscale Funnel Ingress (`:443 /api/unit4/*` -> `127.0.0.1:8791`):**
   - Managed by LaunchAgent `com.tisa.unit4-wiki-intake` (`mini_unit4_live_server.py`).
   - Serves field-note and voice-memo intake (`SQLite WAL` + `to-triage/` dual-write with immediate Whisper/`gemini-2.5-flash` audio transcription), multi-photo and camera uploads, dual room galleries (`renders` + `references`), Gemini Live bidirectional voice (`18` declared tools across `16` allowlisted rooms), scrubbed knowledge search (`GET /api/unit4/knowledge`), and SSRF-guarded zero-metal material lookup (`POST /api/unit4/product-lookup`).
3. **Plane C — Tailnet-Only Spatial Room-Model & Plan-Edits Engine (`:8444 /api/unit4/plans/*` -> `127.0.0.1:8792`):**
   - Managed by LaunchAgent `com.tisa.unit4-plan-edits` (`mini_unit4_plan_edits_server.py`, service version `unit4-plan-edits-all-rooms-v3`).
   - Exposed strictly on the private Tailscale tailnet (`:8444`, never on Funnel — any `Tailscale-Funnel-Request` header returns HTTP `403`).
   - Serves **all 12 allowlisted Unit 4 plans**: **6 whole-room canonical `RoomModel v1` seeds** (`bathroom`, `bedroom`, `living-dining`, `hallway`, `laundry`, `kitchen`) plus **6 specialized interactive trade/elevation modules** (`kitchen-west-ks4`, `kitchen-floor-plan`, `kitchen-electrical`, `attic-hatch`, `hvac-layout`, `murphy-door`).

---

## 2. Service 1 — Voice Agent R9, Dual Galleries, Intake & Knowledge Base (`:8791`)

- **LaunchAgent:** `com.tisa.unit4-wiki-intake` (`/Users/tisavo/.local/share/unit4-intake/mini_unit4_live_server.py`)
- **Allowlisted Rooms (`16`):** `home`, `roadmap`, `decisions`, `kitchen`, `kitchen-oven-range`, `kitchen-sink-north`, `bathroom`, `electrical`, `laundry`, `bedroom`, `living-dining`, `hallway`, `paint-floors`, `hvac`, `attic-access`, `agents`.
- **Key Endpoints:** `GET /api/unit4/healthz`, `POST /api/unit4/voice-token`, `GET /api/unit4/knowledge`, `POST /api/unit4/wiki-intake/voice-memo`, `GET /api/unit4/gallery`, `POST /api/unit4/gallery/upload`, `GET /api/unit4/gallery/file/<room>/<gallery>/<filename>`, `POST /api/unit4/product-lookup`, and `POST /api/unit4/gemini-live/session`.
- **18 Voice Tools (`VOICE_TOOLS_DECLARATION` <-> `bridgeActions`):** `query_todoist_cards`, `navigate_room`, `focus_section`, `open_document`, `go_to_document_page`, `read_active_document`, `set_language`, `fill_draft_note`, `submit_voice_memo`, `show_room_renders`, `get_pm_standup_brief`, `load_pm_skill`, `apply_pm_action`, `query_wiki_and_backend_knowledge`, `propose_wiki_or_plan_edit`, `show_plan_view`, `update_plan_state`, `capture_screen_snapshot`.

---

## 3. Service 2 — Tailnet-Only All-Rooms Spatial Backend & Plan Edits (`:8444` -> `127.0.0.1:8792`)

### 3.1 All 12 Allowlisted `plan_id`s (`6` Whole-Room Seeds + `6` Interactive Trade Modules)

| `plan_id` | Kind | Canonical Seed JSON Path (SMB, Drive & `content/data/`) | Governing Spec (`EOD accept` Target) | Magicplan Room UID(s) | Drive File Link |
|---|---|---|---|---|---|
| `bathroom` | Whole-Room Seed (`RoomModel v1`) | `bathroom/bathroom-plan-data.json` | `bathroom/SPEC.md` | `6ac582a0.dea16fff` (`72-1/8" × 82-1/8"`) | [bathroom-plan-data.json](https://drive.google.com/file/d/1yrA0ysbe9GFmH4vXKSbbjBShxcgQiR6F/view) |
| `bedroom` | Whole-Room Seed (`RoomModel v1`) | `bedroom/bedroom-plan-data.json` | `bedroom/SPEC.md` | `6ac582a0.df23abff` + NW Closet `6ac582a0.ded15bff` | [bedroom-plan-data.json](https://drive.google.com/file/d/1Jtxk9ZKUGWKGkzyVPiSa-ji1WR0Kz1Od/view) |
| `living-dining` | Whole-Room Seed (`RoomModel v1`) | `living-dining/living-dining-plan-data.json` | `living-dining/SPEC.md` | `6ac582a0.defaf7ff` + Dining `6ac582a0.dee273ff` | [living-dining-plan-data.json](https://drive.google.com/file/d/1d_KlcHmqMFlV_GxCIUhIPdw75MDdIZJp/view) |
| `hallway` | Whole-Room Seed (`RoomModel v1`) | `hallway/hallway-plan-data.json` | `hallway/SPEC.md` | `6ac582a0.deaa9fff` (`205-7/16" × 95-15/16"`) | [hallway-plan-data.json](https://drive.google.com/file/d/1kz5uoe5a5nqFa2ShbqDTrMbapks290F3/view) |
| `laundry` | Whole-Room Seed (`RoomModel v1`) | `laundry/laundry-plan-data.json` | `laundry/SPEC.md` | `6ac582a0.debe03ff` (`36-5/16" × 82-5/8"`) | [laundry-plan-data.json](https://drive.google.com/file/d/1-3xLOz7yrgpUmn5ZbXqNkE7_0nLizayj/view) |
| `kitchen` | Whole-Room Seed (`RoomModel v1`) | `kitchen/kitchen-plan-data.json` | `kitchen/SPEC.md` | `6ac582a0.de82fbff` (`147" × 126-1/4"`) | [kitchen-plan-data.json](https://drive.google.com/file/d/1AJU82I2JeB9qsY2IpgYdIKQSDaIT7Cz1/view) |
| `kitchen-west-ks4` | Interactive Elevation Module | `kitchen/kitchen-west-ks4-plan-data.json` | `kitchen/SPEC.md` | `K-S4` West Range Wall | [kitchen-west-ks4-plan-data.json](https://drive.google.com/file/d/1wlsL133iHPsHnMtR1vgxhRkmx5RMGAXe/view) |
| `kitchen-floor-plan` | Interactive Floor Module | `kitchen/kitchen-cabinet-schedule.json` | `kitchen/SPEC.md` | `KITCHEN-FLOOR-PLAN` | `plans/kitchen-floor-plan/` |
| `kitchen-electrical` | Interactive Trade Module | `kitchen/kitchen-electrical-plan-data.json` | `kitchen/SPEC.md` | `KITCHEN-ELECTRICAL` + `D04` | `plans/kitchen-electrical/` |
| `attic-hatch` | Interactive Framing Module | `attic/attic-hatch-plan-data.json` | `attic/SPEC.md` | `ATTIC-HATCH-01` (Door 4 Landing) | [attic-hatch-plan-data.json](https://drive.google.com/file/d/1HFhDl6B4Mwk8M4WqdHYA-HbTV9uM5YIo/view) |
| `hvac-layout` | Interactive MEP Module | `hvac/hvac-layout-plan-data.json` | `hvac/SPEC.md` | `HVAC-ATTIC-LAYOUT-01` | [hvac-layout-plan-data.json](https://drive.google.com/file/d/1ySkGfMq6BKiaI5mivEIVk1oWL6VJ-d82/view) |
| `murphy-door` | Interactive Millwork Module | `laundry/murphy-door-plan-data.json` | `laundry/SPEC.md` | `MURPHY-DOOR-B` (`B7–B15`) | [murphy-door-plan-data.json](https://drive.google.com/file/d/1YMnqMLiGihxkjNJ9JGz1qVa2y098IEvU/view) |

---

## 4. Canonical Room-Model Schema (`1.0-room-canonical`) & Why Generic AI Chats Fail

### 4.1 Three-Layer Spatial Data Model (`ROOM_MODEL_PLAN_IDS`)

Generic LLM chats fail on renovation intake because they store measurements as flat prose, silently rescaling room outlines when a backer-board span differs by `2-13/16"` from framing, guessing inches from angled photos, or promoting assistant suggestions into fabrication numbers. Every Unit 4 room seed (`<room>/<room>-plan-data.json`) enforces three separated layers:

1. **Layer 1 — Immutable Scan & Vector Baseline (`room_model.baseline`):**
   - Stores raw [Magicplan MASTER](https://cloud.magicplan.app/plan/abb2d2c6-aa1c-4a88-a57e-1260847b6410) (`abb2d2c6-aa1c-4a88-a57e-1260847b6410`) `source_room` (preserving metre-valued symbol strings) and `source_statistics`, paired with `svg_object_transforms` extracted from the byte-preserved vector export (`unit4-magicplan-master-floorplan.svg`, `sha256: 0ff23f07702577b85b095d79f2ce314982a2b47dfc9938119d67b711dc7e700f`, root matrix `[68.0915, 0, 0, 68.0915, 440.42, 415.957]`).
   - Sealed by deterministic `payload_sha256`. Any API request attempting to mutate `room_model.baseline`, `room_model.identity`, or `room_model.outline` corners (`room_back_left`, `room_back_right`, `room_entry_right`, `room_entry_left`) is rejected with HTTP `400`.
2. **Layer 2 — Named Coordinate Frames, Typed Points & Explicit `null` Unknowns (`points`, `sources`, `point_groups`):**
   - Every point declares `unit: "in"`, `coordinate_system` (e.g., `room_plan`, `back_wall_elevation`, `west_wall_local`, `tub_side_local`, `east_wall_elevation`, `door_b_jamb_local`, `south_sink_run_from_se`), `source` ID, `measure_boundary` (`wall_to_wall`, `to_casing_edge`, `clear_between_casings`, `rough_opening`, `aff`, `subfloor`), `confidence`, and `precedence` (`model: 10 < field_photo: 20 < owner: 30 < accepted_baseline: 100`).
   - Lower-precedence patches cannot overwrite higher-precedence points. Unmeasured coordinates stay explicit `null` (`room_plan` points cannot set non-null `z` while `z_datum` is `null`).
3. **Layer 3 — Auditable Corrections & End-of-Day (`EOD`) Governance (`room_model.corrections`, `field_overrides`):**
   - `POST /api/unit4/plans/<plan_id>/override` validates `base_rev` (HTTP `409` on conflict), checks axis-aligned rectangle coherence (`rectangles`), snapshots exact pre-edit bytes to `~/.local/share/unit4-plan-edits/snapshots/<plan_id>/<rev>_before.json`, writes JSON in place (`r+b` / `seek(0)` / `truncate` / `fsync` preserving `st_ino` and Google Drive File ID), and emits an EOD triage receipt to `to-triage/`.
   - `POST /api/unit4/plans/<plan_id>/eod` with `action: "reject"` restores the exact byte snapshot; `action: "accept"` promotes the accepted override into `<room>/SPEC.md` via `work-control/safe_unit4_write.py`.

### 4.2 Mandatory PM Operating Contract Over All Room Backends

1. **Read Room JSON + `SPEC.md` First:** Before asking Tisa or John any measurement question, read `<room>/SPEC.md` and `<room>/<room>-plan-data.json` so known Magicplan baselines and recorded field points are never re-asked.
2. **Capture Intake Before Building Interactive UIs:** Record new tape/photo measurements into `<room>/<room>-plan-data.json` (`sources` + `points` + `room_model.correction`) with explicit `null` for deferred dimensions, and confirm open endpoints/decisions with Tisa **before** generating a crew-facing interactive plan UI.
3. **Sequential Quick-Reply Questions:** Format questions for Tisa as a numbered list (`1.`, `2.`) with one single decision per number, short labeled choices (`A / B` or `Yes / No`), and one recommended pick.

---

## 5. Networking, Storage Integrity & LaunchAgent Runbook

- **DNS & Chrome 142+ Local Network Access:** Off-tailnet crew devices resolve public Funnel IPs (`:443` only). On-tailnet PM/Owner devices resolve MagicDNS `100.114.3.50` (`:443` + `:8444`) with `Access-Control-Allow-Private-Network: true` (allow `Local network access` once on `tisa-a11y.github.io`).
- **Inode & Drive File ID Preservation:** Never write via `GoogleDrive-*` mirror paths; all mutations use `r+b` / `seek(0)` / `truncate` / `fsync` or `work-control/safe_unit4_write.py`.
- **Verification Suite:** Run `test_mini_unit4_plan_edits_server.py`, `test_bathroom_room_data.py`, and `validate-room.cjs` (`18/18` Python HTTP/store tests + `6/6` Node room-schema & SHA-256 baseline checks) before `launchctl kickstart -k gui/501/com.tisa.unit4-plan-edits`.

---

## 6. Looking Forward: Turning the Unit 4 Pilot into a Real General Renovation Model

See companion architecture brief [`docs/PILOT-TO-PRODUCT-ARCHITECTURE.md`](./PILOT-TO-PRODUCT-ARCHITECTURE.md) for the full productization roadmap. In summary:

| Layer | Unit 4 Pilot Implementation (Today) | Multi-Tenant SaaS Product Architecture (Target) |
|---|---|---|
| **Spatial Room Engine** | Magicplan MASTER JSON + preserved SVG (`0ff23f07...`) -> 6 `<room>-plan-data.json` files | **Universal Scan Importer** (Apple iPhone LiDAR `RoomPlan` USDZ/JSON, Magicplan, Matterport, PDF plans) -> **Postgres 17 + PostGIS / JSONB** `rooms`, `frames`, `points`, and append-only `room_events` |
| **Compute & Ingress** | Mac mini `launchd` (`:8791` Funnel + `:8444` Tailscale Serve + Chrome LNA permission) | **Single-Domain Cloud Edge** (Cloudflare Workers + FastAPI on Cloud Run / Fly.io) eliminating cross-origin PNA/LNA prompts; capability QR links for crew + Passkey/OAuth RBAC for Owners/PMs/GCs |
| **File & Print Pipeline** | SMB/Drive `r+b` inode locks (`safe_unit4_write.py`) + local headless Chrome `--print-to-pdf` | **Content-Addressed Object Store** (Cloudflare R2 / S3 keyed by `sha256`) + **Stateless Playwright PDF Worker** auto-rendering bilingual `EN/ES` job-site sheets on `EOD Accept` + offline-first **PWA Service Worker** |
| **Public / Private Split** | Separate unshared Drive `Private` folder + regex firewall blocking currency/private tokens | **Hardware-Isolated Tenant Vaults & Row-Level Security (`RLS`)**: Owner budget/procurement ledger stays cryptographically isolated from no-login Crew Room Views, with automated egress DLP |
| **Task & Photo Gates** | Todoist project `6hcMQpGhXWprg6m7` + `@verification-photo` subtasks + `todoist-mirror.json` | **Native Last-Planner & Pre-Close-In Gate Engine** (`Should -> Can -> Will -> Did -> Learn`, 7 Make-Ready constraints, `Order-By` lead-time calculator, hard photo-proof gates before drywall/tile) + 2-way Todoist/Procore/Buildertrend sync |
| **Specialist Intelligence** | Unit 4 `SKILL.md` modules (`sf-code-check`, `unit4-tile-and-waterproofing`, `appliance-install-crosscheck`) | **Versioned Jurisdiction & OEM Rule Packs** (CA Title 24 / SF / NYC / Seattle municipal codes, utility rebate guards, and verified OEM cutout/venting libraries) |
