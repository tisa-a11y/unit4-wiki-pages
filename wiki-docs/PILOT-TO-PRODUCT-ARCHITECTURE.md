# From Unit 4 Pilot to General Renovation Model: Spatial & Trade Execution OS Blueprint

- **Date:** November 24, 2026
- **Companion Technical Runbook:** [`docs/BACKEND-ARCHITECTURE.md`](./BACKEND-ARCHITECTURE.md) · [Google Doc Runbook](https://docs.google.com/document/d/1dWd8TlHsd_fg4tUqVBAKQYYcV3NnsnFjSpj_pba9Big/edit)

---

## 1. The Core Problem Unit 4 Exposed (And Solved)

Residential remodels fall into a software chasm:
1. **Enterprise GC Platforms (Procore, Autodesk Construction Cloud):** Built for commercial superintendents managing submittals and RFIs—far too heavy for a 2–5 person residential crew checking tile stops or rough-in heights on a phone.
2. **Scan & Design Point Tools (Magicplan, Matterport, Chief Architect, Houzz):** Produce static floor plans that immediately drift once demolition, `1/2"` HardieBacker, or salvaged trim changes real room clearances.
3. **Generic AI Assistants (Standard ChatGPT / Claude / Gemini Chats):** Store dimensions in unstructured conversation history—silently rescaling whole rooms from local tape readings, guessing inches from angled photos, mixing subfloor vs. finished-floor (`AFF`) datums, and hallucinating unapproved field instructions.

**The Unit 4 Pilot Breakthrough:** Treating every room as an **immutable scan baseline** layered with **provenance-ranked local coordinate frames** (`RoomModel v1`), governed by an **optimistic field-intake -> End-of-Day (`EOD`) owner approval loop**, and delivered through a **calm, zero-price, bilingual (`EN/ES`) mobile crew guide + 2-page printable PDF sheet**.

---

## 2. Five Defensible Product Primitives Proven on Unit 4

1. **Immutable Baseline + Local Datum Overlay (`RoomModel`):**
   - Raw LiDAR / Magicplan room geometry is sealed by `payload_sha256` and never stretched.
   - Field tape readings attach to named local coordinate frames (`west_wall_local`, `back_wall_elevation`, `door_b_jamb_local`) with mandatory `measure_boundary` (`wall_to_wall`, `to_casing_edge`, `clear_between_casings`, `rough_opening`, `aff`, `subfloor`), `H_AFF = H_subfloor - t` build-up tracking, explicit `null` unknowns, and strict precedence (`model: 10 < field_photo: 20 < owner: 30 < accepted_baseline: 100`).
2. **Two-Layer Specialist-Engine vs. Human-UI Gate:**
   - **Under the hood:** `1:1` (`scaleX === scaleY`) vector drafting, OEM appliance manual cutout verification, municipal code checks, and clash detection.
   - **On the job-site phone (`390px`):** Plain-language English & Spanish steps, tap-to-pin photo/voice capture, `100%–300%` plan zoom, and deterministic 2-page Letter PDFs taped to the wall.
3. **Structural Public/Private Split (Zero-Leak Crew Sharing):**
   - Crew members, visiting trades (HVAC, electrical, tile), and inspectors scan a doorway QR code with zero login friction and zero exposure to owner budgets, contractor quotes, financing, or private notes.
4. **Multimodal Field-to-EOD Loop (`8 a.m. Brief -> Field Pin/Voice -> EOD Review`):**
   - Crew speaks in Spanish or English or snaps a tape-measure photo -> server transcribes immediately and stages a provisional pin/override -> at End of Day, Owner/PM taps **Accept** (promoting into the governing room spec and regenerating EN/ES PDFs) or **Reject** (atomic snapshot rollback).
5. **Composable Trade, Code & Rebate Guardrails:**
   - Pluggable domain packs enforce real physical gates before money or labor is wasted: *8 Open-Wall Rough-In Gates before Drywall*, *Written Energy-Rebate Reservation before Equipment Purchase*, *Appliance Manual Cutout Cross-Check before Framing*, and *Mandatory `@verification-photo` Proof before Task Closeout*.

---

## 3. Target Multi-Tenant SaaS Architecture (`v1.0 Cloud Product`)

### 3.1 Data & Storage Plane (`Postgres + PostGIS + R2`)
- **Multi-Tenant Relational + Spatial Core (`PostgreSQL 17` with `Row-Level Security`):**
  - `organizations` -> `projects` (`jurisdiction_code`, `default_langs`, `datum_policy`) -> `rooms` (`baseline_jsonb`, `baseline_sha256`, `svg_asset_id`) -> `coordinate_frames` -> `spatial_points` -> `room_corrections` (append-only event log with pre/post state for instant rollback).
- **Content-Addressed Media & Artifact Store (`Cloudflare R2` / `AWS S3`):**
  - Every LiDAR scan, SVG floorplan, HEIC/JPEG tape photo, voice memo, and rendered `EN/ES` PDF is stored by `sha256` digest with signed CDN URLs.
- **Optional Workspace Connectors:** 2-way sync to Google Drive / Docs / Sheets and Dropbox for owners who want live file mirrors.

### 3.2 Unified Edge, Auth & Offline-First Mobile UX
- **Single First-Party Domain (`app.<domain>` + `crew.<domain>/<project>/<room>`):**
  - Eliminates the pilot's split between GitHub Pages (`github.io`) and Tailscale (`ts.net`), removing Chrome Local Network Access (`PNA/LNA`) prompts completely.
  - **Role-Based Access Control (`RBAC`):**
    - `crew_link` (capability token / doorway QR): read approved plans, toggle `EN | ES`, ask Live Voice AI grounded in room specs, and submit field notes/photos/pins.
    - `trade_partner` (scoped invite, e.g., HVAC sub): view curated trade packet (`#hvac`, `#attic-access`, `#electrical`) and upload markout photos.
    - `pm` / `designer`: triage intake, stage `RoomModel` corrections, run `Order-By` procurement radar, and draft shift briefs.
    - `owner`: 1-tap sequential decision approvals, `EOD Accept/Reject` sign-off, and access to the isolated **Private Budget & Procurement Vault**.
- **Offline-First Job-Site PWA:** Service Worker caches active room SVGs, PDFs, and checklists so basements/attics with weak cellular signal queue voice/photo pins locally and sync automatically on reconnect.

### 3.3 Universal Scan Ingestion (`3 Minutes from Empty Room to Live Backend`)
1. **iPhone Pro LiDAR Walk (`Apple RoomPlan` API) or Magicplan / Matterport Import:**
   - Extracts room polygons, wall IDs, door/window rough positions, ceiling heights, and fixture bounding boxes automatically.
2. **Automated Room Seed Minting:**
   - Mints `<room>-plan-data.json` (`RoomModel v2`) across every scanned room in one pass, seals `baseline_sha256`, and generates initial room checklists and open-measurement prompts.

---

## 4. Four-Phase Commercialization Roadmap

1. **Phase 0 — Unit 4 Golden Reference (Nov–Dec 2026):**
   - Operate all 6 Unit 4 rooms + 6 trade modules on `unit4-plan-edits-all-rooms-v3` through bathroom tiling, kitchen L-layout/hood completion, laundry WashTower + Murphy door install, and NEXT HVAC execution. Measure real defect-prevention metrics (caught code clashes, prevented re-cuts, zero missed companion parts).
2. **Phase 1 — Parameterized Multi-Project Engine (`project.yaml`, Q1 2027):**
   - Extract all `unit4`-specific paths, room lists, and jurisdiction constants into a declarative `project.yaml` manifest so onboarding a second unit or San Francisco property requires zero code edits.
3. **Phase 2 — Cloud Multi-Tenant Beta for Owner-Builders & Boutique Design-Build Firms (Q2 2027):**
   - Ship hosted Postgres RLS + R2 backend, one-click iPhone `RoomPlan` LiDAR import, printable doorway QR stickers per room, automated Playwright `EN/ES` PDF publishing on `EOD Accept`, and SMS/WhatsApp 8 a.m. crew brief delivery.
4. **Phase 3 — Jurisdiction Code & OEM Spec Marketplace (H2 2027):**
   - Expand maintained municipal code & rebate packs (CA Title 24 / SF / LA / NYC / Seattle) and verified OEM appliance/fixture spec libraries into a recurring SaaS platform for residential remodelers, interior designers, and multi-unit property owners.
### 7.4 Default Tiling Engine Standard (Proven on Unit 4 Bathroom `rev-20261124-bath-005`)

Every future tiling project generated by the General Renovation Model & Platform enforces four non-negotiable defaults:

1. **Calculated Vertical & Running-Bond Tile Positioning:** Compute exact vertical course pitch (`actualTileH + grout`) and sliver-free starter course from the base datum, plus horizontal running-bond brick coordinates (`actualTileW + grout`) across every wall with zero-sliver corner/end cuts (`>= 2-1/2"`), drawn directly on `1:1` SVG elevations.
2. **Calculated Step-by-Step Crew Sequence (`EN | ES`):** Generate numbered installation steps (on-screen and on 2-page print sheets) carrying exact calculated `X`/`Z` coordinates, full-tile and end-cut widths, plumbing/niche cutouts, bullnose/corner tallies, and grout/silicone quantities.
3. **Single-Piece Large-Format Niche Backs & Hidden-Edge Sequencing:** Default wet niches to one-piece backs + `1/4"`/ft sloped bottom sills cut from a dedicated `24" × 48"` porcelain/ceramic tile (`~5/16"–3/8"` thick to preserve shelf depth and clear `12"`+ niche widths), installed in 4-step order: continuous waterproofing → 1-piece back **FIRST** → 1-piece sloped sill → side/top jamb returns in front of the back panel to hide all 4 cut edges.
4. **Zero-Metal Trim & Matched Fine-Aggregate Grout + 100% Silicone:** Enforce ceramic bullnose/corners (no metal/Schluter), fine-aggregate (`FA`) grout for glossy ceramic `1/16"` joints, and color-matched `100%` silicone at all 90° corners, niche inside seams, and wet edges.
