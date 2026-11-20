/* Unit 4 Kitchen — West Range & Vent Hood Wall Interactive Renderer & Tailnet Client
 * Owned by @ag-unit-4-specialists (83beabda).
 *
 * Unified Integration Contract exposed on window.U4PLAN (with window.U4KS4 alias):
 *   - planId                  -> "kitchen-west-ks4"
 *   - getSvgElement()         -> <svg id="ks4-svg">
 *   - getState()              -> deep clone of live plan state
 *   - getTakeoff()            -> live gross proposed materials takeoff (ZERO prices)
 *   - getScaleInfo()          -> { view, scaleX, scaleY, uniform } (always scaleX === scaleY)
 *   - getView() / setView(v)  -> "elevation" | "coupled"
 *   - getLang()               -> "en" | "es"
 *   - getRevisionStamp()      -> single-line revision & sync status stamp
 *   - getAnnotationDataUrl()  -> PNG data URL of Circle-to-Correct canvas (or null if empty)
 *   - setLang(lang)           -> switch EN/ES programmatically
 *   - applyLocalPatch(patch)  -> apply local preview patch programmatically
 *   - render()                -> force re-render
 *
 * Security & privacy invariants:
 *   - Tailnet-only persistence origin (default https://mac-mini.tailcf4007.ts.net:8444,
 *     configurable via ?api= query parameter; voice knowledge via ?voice_api= or :8791).
 *   - ZERO fake PIN/token in client JS or browser web storage.
 *   - ZERO offline client storage sync queue.
 *   - Immutable flagged_clashes (never auto-resolved in code).
 *   - Zero fabricated dimensions (null stays "MEASURE ON SITE" / "MEDIR EN OBRA" with
 *     dashed provisional outline until measured).
 *   - Strict private-data firewall rejecting currency/pricing/estimates/mail links.
 */

(function () {
  'use strict';

  const DEFAULT_API_ORIGIN = 'https://mac-mini.tailcf4007.ts.net:8444';
  const DEFAULT_VOICE_ORIGIN = 'https://mac-mini.tailcf4007.ts.net:8791';
  const PLAN_ENDPOINT_BASE = '/api/unit4/plans/kitchen-west-ks4';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* Exact baseline matching kitchen/kitchen-west-ks4-plan-data.json (schema 1.0.0) */
  const BASELINE_KS4_DATA = {
    schema_version: '1.0.0',
    project: '1231 11th Avenue Unit 4, San Francisco, CA',
    room_id: 'kitchen',
    wall_id: 'K-S4',
    title_en: 'Kitchen West Vent Hood Wall (K-S4)',
    title_es: 'Muro Oeste de Campana y Estufa (K-S4)',
    governing_spec: 'kitchen/SPEC.md',
    companion_specialist_plan: '2026-11-19_U4_kitchen_range-wall-full-plan_R1_EN.pdf',
    companion_mockup_guide: '2026-11-19_U4_kitchen_zephyr-savona-mock-hookup-plan_R3_EN.pdf',
    base_rev: 'rev-20261120-001',
    status: 'MOCKUP_ONLY_HOLD_CLOSEIN',
    orientation: {
      north_angle_deg: 0,
      wall_cardinal: 'WEST',
      left_corner_cardinal: 'SOUTH',
      left_corner_label_en: 'South Step Corner (0" ref)',
      left_corner_label_es: 'Esquina Escalonada Sur (0" ref)',
      right_corner_cardinal: 'NORTH',
      right_corner_label_en: 'North Corner (Hallway)',
      right_corner_label_es: 'Esquina Norte (Pasillo)'
    },
    appliances: {
      range: {
        model: 'Viking VGCC5304BSS',
        width_in: 29.875,
        clearance_min_in: 30.0,
        clearance_max_in: 36.0,
        source: 'Viking S10 Manual F20543H p. 11 (governs over Zephyr 28" min)'
      },
      hood: {
        model: 'Zephyr Savona ZSA-E30AS',
        width_in: 29.875,
        depth_in: 19.4375,
        chimney_width_in: 8.625,
        chimney_depth_in: 7.5,
        cfm: 685,
        duct_diameter_in: 6.0,
        line_b_offset_above_a_in: 9.5625,
        stock_cover_reach_min_in: 110.0,
        stock_cover_reach_max_in: 117.0,
        source: 'Zephyr Spec may08.0101 + Manual AUG06.0301'
      }
    },
    dimensions: {
      wall_width_in: {
        value: 66.25,
        measure_boundary: 'wall_to_wall',
        verified: 'VERIFY_ON_SITE',
        source: 'Magicplan MASTER abb2d2c6 + K-S4 R8',
        date: '2026-11-19'
      },
      ceiling_height_in: {
        value: 121.5,
        measure_boundary: 'aff',
        verified: 'VERIFY_ON_SITE',
        source: 'Magicplan MASTER abb2d2c6 (10.127 ft)',
        date: '2026-11-19'
      },
      floor_buildup_t_in: {
        value: 0.75,
        measure_boundary: 'subfloor',
        verified: 'MEASURE_ON_SITE',
        source: 'kitchen/SPEC.md provisional t (~3/4" TO MEASURE)',
        date: '2026-11-19'
      },
      counter_height_in: {
        value: 36.0,
        measure_boundary: 'aff',
        verified: 'LOCKED',
        source: 'kitchen/SPEC.md',
        date: '2026-11-19'
      },
      hood_bottom_aff_in: {
        value: 66.9375,
        measure_boundary: 'aff',
        verified: 'K_S4_BASELINE',
        source: 'K-S4 baseline 66-15/16" AFF (passes Viking 66"-72" AFF)',
        date: '2026-11-19'
      },
      left_base_cab_in: {
        value: 18.0,
        measure_boundary: 'wall_to_wall',
        verified: 'K_S4_BASELINE',
        source: 'K-S4 18" + 30" + 18" = 66" (+1/4" scribe)',
        date: '2026-11-19'
      },
      range_opening_in: {
        value: 30.0,
        measure_boundary: 'clear_between_casings',
        verified: 'LOCKED',
        source: 'Viking VGCC5304BSS 30" range bay',
        date: '2026-11-19'
      },
      right_base_cab_in: {
        value: 18.0,
        measure_boundary: 'wall_to_wall',
        verified: 'K_S4_BASELINE',
        source: 'K-S4 18" + 30" + 18" = 66" (+1/4" scribe)',
        date: '2026-11-19'
      },
      lower_blocking_min_aff_in: {
        value: 68.0,
        measure_boundary: 'aff',
        verified: 'LOCKED',
        source: 'kitchen/SPEC.md dual-datum backing 68"-86" AFF (+t)',
        date: '2026-11-19'
      },
      lower_blocking_max_aff_in: {
        value: 86.0,
        measure_boundary: 'aff',
        verified: 'LOCKED',
        source: 'kitchen/SPEC.md dual-datum backing 68"-86" AFF (+t)',
        date: '2026-11-19'
      },
      upper_blocking_min_aff_in: {
        value: 104.0,
        measure_boundary: 'aff',
        verified: 'LOCKED',
        source: 'kitchen/SPEC.md upper backing 104"-121-1/2" AFF (+t), 8"-10" duct bay clear',
        date: '2026-11-19'
      },
      left_chase_width_in: {
        value: null,
        measure_boundary: 'wall_to_wall',
        verified: 'MEASURE_ON_SITE',
        source: 'Site photo P03-IMG_5152.jpeg (framed pipe/flue chase width unmeasured)',
        date: '2026-11-19'
      }
    },
    options: {
      rear_trim: 'island_trim_1in',
      ceiling_gap_solution: 'open_tbd'
    },
    existing_original_trim: {
      baseboard_height_in: {
        value: 9.5,
        measure_boundary: 'aff',
        verified: 'VERIFY_ON_SITE',
        source: 'Existing Unit 4 Edwardian baseboard (measured 9-1/2" in bedroom; stops at base cabinet sides)'
      },
      high_picture_rail_height_in: {
        value: 103.0,
        measure_boundary: 'aff',
        verified: 'VERIFY_ON_SITE',
        source: 'Existing Unit 4 high picture rail (measured 103" above finished floor in bedroom)'
      },
      door_casing_width_in: {
        value: null,
        measure_boundary: 'to_casing_edge',
        verified: 'MEASURE_ON_SITE',
        source: 'Existing Edwardian door casing width (never fabricated)'
      },
      window_casing_width_in: {
        value: null,
        measure_boundary: 'to_casing_edge',
        verified: 'MEASURE_ON_SITE',
        source: 'Existing Edwardian window casing width (never fabricated)'
      },
      north_hall_opening_clear_in: {
        value: [29.375, 84.0],
        measure_boundary: 'clear_between_casings',
        verified: 'VERIFY_ON_SITE',
        source: 'Existing cased opening to North hallway (29-3/8" × 84" in kitchen/SPEC.md)'
      },
      preservation_rule_en: 'Preserve original Edwardian baseboard, high picture rail, and door/window casings. Never mix existing original trim counts with proposed new trim or moulding.',
      preservation_rule_es: 'Conservar zoclo, moldura alta para cuadros y chambranas originales Edwardian. Nunca mezclar molduras originales existentes con molduras nuevas propuestas.'
    },
    takeoff_settings: {
      waste_pct: 15,
      tile_box_sqft: null,
      deduct_chimney: false
    },
    flagged_clashes: [
      {
        id: 'clash-ks4-alcove',
        severity: 'HIGH',
        title_en: 'Alcove vs. Flat Wall Check',
        title_es: 'Revisión Nicho vs. Muro Liso',
        en: 'Earlier notes mention a 42" alcove / 4" pilasters vs. flat 66-1/4" West wall. Verify in field — never auto-resolved.',
        es: 'Notas previas mencionan nicho de 42" / pilastras de 4" vs. muro oeste liso de 66-1/4". Verificar en obra — nunca auto-resuelto.'
      },
      {
        id: 'clash-ks7-jbox',
        severity: 'HIGH',
        title_en: 'Zephyr Direct Hardwire: 1-Gang 2"×3" Box (~83"–86") Replaces 4×4 at 100"',
        title_es: 'Cableado Directo Zephyr: Caja 2"×3" (~83"–86") Reemplaza 4×4 a 100"',
        en: 'Zephyr ZSA-E30AS Manual p. 3 is direct hardwire via 1-gang 2"×3" box (~83"–86" above finished floor, C/L ± 2-1/4", ~1" proud for 1/2" HardieBacker + tile inside 8-5/8"×7-1/2" casing) — replacing the conflicting 4"×4" wall J-box at 100".',
        es: 'El manual Zephyr ZSA-E30AS p. 3 indica cableado directo en caja sencilla 2"×3" (~83"–86" sobre piso terminado, eje ± 2-1/4", ~1" salida para HardieBacker 1/2" + azulejo dentro del cubreducto 8-5/8"×7-1/2") — reemplazando la caja 4"×4" en conflicto a 100".'
      },
      {
        id: 'clash-left-chase',
        severity: 'MEDIUM',
        title_en: 'Dedicated Left-Chase Hood Duct (>= 6") — NEXT HVAC Is Heating Only',
        title_es: 'Ducto Izq. Exclusivo de Campana (>= 6") — NEXT HVAC Solo Calefacción',
        en: 'Existing left-chase duct IS dedicated to kitchen hood exhaust (nothing else connected) — measure chase width & verify >= 6" rigid smooth metal diameter. NEXT HVAC (Serge & Alex Mon) is FURNACE/HEATING ONLY — do NOT route kitchen range hood exhaust to NEXT HVAC.',
        es: 'El ducto existente en el cajón izquierdo ES exclusivo para la campana de cocina (nada más conectado) — medir ancho del cajón y verificar diámetro >= 6" rígido liso. NEXT HVAC (Serge y Alex lunes) es SOLO CALEFACCIÓN — NO conectar extracción de campana a NEXT HVAC.'
      }
    ],
    field_overrides: [],
    pins: []
  };

  const BOUNDARY_OPTIONS = [
    'wall_to_wall',
    'clear_between_casings',
    'to_casing_edge',
    'rough_opening',
    'aff',
    'subfloor'
  ];

  const I18N = {
    en: {
      doc_title: 'West Range & Hood Wall — Unit 4 Kitchen',
      hdr_title: 'West Range & Hood Wall',
      hdr_sub: 'True-to-Scale Interactive Plan · Viking 30" Range + Zephyr Savona Hood · Zero Prices',
      back_room: '← Back to Kitchen Page',
      btn_lang: 'Español (MX)',
      datum_both: 'Heights: Finished Floor + Subfloor (+t)',
      datum_sf: 'Heights: Subfloor (+t) Only',
      datum_aff: 'Heights: Finished Floor Only',
      btn_circle_on: 'Circle-to-Correct',
      btn_circle_off: 'Drawing Active…',
      btn_export_svg: 'Export SVG',
      btn_download_pdf: 'Download / Print PDF',
      hold_html: '<strong>HARD HOLD &amp; MOCKUP ONLY:</strong> Planning and Friday Nov 20 pre-drywall mockup reference only. <strong>NOT</strong> final gas/electrical tie-in and <strong>NOT</strong> drywall close-in permission. Nov 23 drywall delivery is not a close-in release.',
      conflict_text: 'A newer revision was saved on Tailnet by another editor (HTTP 409). Reload the latest plan and re-apply your change.',
      btn_reload: 'Reload Latest Plan',
      svg_panel_title_elev: 'True-to-Scale Wall Elevation — West Range Wall',
      svg_panel_title_coupled: 'True-to-Scale Coupled Corners & Floor Plan — West Wall Interface',
      tab_view_elevation: 'West Wall Elevation',
      tab_view_coupled: 'Coupled Corners & Floor Plan',
      link_full_floorplan: 'Kitchen Floor Plan & Cabinet Schedule →',
      lyr_framing: 'Framing & Backing',
      lyr_appliances: 'Range + Hood',
      lyr_mep: '6" Duct, Gas & Elec',
      lyr_clashes: 'Clashes & Measure Flags',
      circle_bar_hint: 'Draw a circle around any spot on the drawing (touch or mouse) to attach a callout note.',
      btn_clear_sketch: 'Clear Sketch',
      btn_circle_done: 'Exit Circle Mode',
      photo_panel_title: 'Actual Open-Stud West Wall (Site Photo)',
      photo_badge: 'VERIFY FRIDAY',
      photo_left: '← SOUTH (0" ref)',
      photo_mid: 'WEST RANGE WALL',
      photo_right: 'NORTH (Hallway) →',
      photo_callouts: [
        '<li class="callout-alert"><strong>Dedicated Left-Chase Hood Duct:</strong> Existing duct IS dedicated to kitchen hood exhaust (nothing else connected) — measure chase width &amp; verify &ge; 6&quot; diameter. <strong>NEXT HVAC is furnace/heating ONLY</strong> (do NOT route hood exhaust to NEXT HVAC).</li>',
        '<li><strong>South Step Corner (Left = 0"):</strong> All horizontal marks measure right (North) from this fixed corner.</li>',
        '<li><strong>Zephyr Direct Hardwire (Manual p. 3):</strong> 1-gang 2"&times;3" box at ~83"–86" above finished floor (C/L &plusmn; 2-1/4", ~1" proud for 1/2" HardieBacker + tile inside 8-5/8"&times;7-1/2" casing — replaces conflicting 4&times;4 box at 100").</li>',
        '<li><strong>Gas Tee &amp; Lower Framing:</strong> Relocate into rear 18"–48" bay at 0-9/16"–4-15/16" above finished floor (+t) with licensed plumber.</li>'
      ],
      concept_disclaimer_html: '<strong>Site Photo vs. Concept:</strong> Above photo is the real open-stud wall. Any separate 3D kitchen style renders in Drive are <em>Concept reference only — not to scale</em>; always build from this true-scale drawing.',
      clashes_title: 'Flagged Clashes & Field Checks (Never Auto-Resolved)',
      clashes_lock_pill: 'Immutable · Verify in Field',
      marks_title: 'Live Wall Mark Sheet (Crew Marks Directly From Subfloor +t)',
      th_feature: 'Feature / Reference',
      th_aff: 'Above Finished Floor',
      th_subfloor: 'Above Subfloor (+t)',
      th_horiz: 'Horizontal From South (0")',
      th_boundary: 'Boundary & Status',
      takeoff_title: 'Live Proposed Materials Takeoff (Quantities Only · Zero Prices)',
      takeoff_notice: 'Gross Proposed Quantities Only (Zero Prices) — Verify On-Hand Stock Before Ordering.',
      lbl_waste_pct: 'Waste / Overage (%):',
      btn_waste_10: '+10% Straight',
      btn_waste_15: '+15% Brick/Pattern',
      lbl_box_sqft: 'Tile Box Coverage (sq ft/box):',
      box_placeholder: 'Optional',
      lbl_deduct_chimney: 'Deduct chimney cover footprint from tile',
      trim_title: 'Existing Original Trim Baseline (Keep Separate From Proposed New Trim)',
      trim_badge: 'Edwardian Original',
      lbl_trim_base: 'Original Baseboard Height (in)',
      help_trim_base: 'Recorded 9-1/2" in Unit 4 (stops at base cabinet sides).',
      lbl_trim_rail: 'Original High Picture Rail Height (in)',
      help_trim_rail: 'Recorded 103" above finished floor (moves dashed reference line on elevation).',
      lbl_trim_door: 'Original Door Casing Width (in)',
      help_trim_door: 'North hallway opening clear: 29-3/8" × 84". Measure casing width in field.',
      lbl_trim_win: 'Original Window Casing Width (in)',
      help_trim_win: 'Never fabricated — leave blank until measured on site.',
      editor_title: 'Live Field Dimensions & Options',
      preset_lbl: 'Quick Check:',
      preset_baseline: 'Planned Height (66-15/16")',
      preset_fail64: 'Test 64" Height (FAIL)',
      preset_mid70: 'Test 70" Height (PASS)',
      btn_reset: 'Reset Baseline',
      lbl_author: 'Editor Name',
      lbl_floor_t: 'Floor Build-Up (t) (in)',
      help_floor_t: 'Provisional 3/4" — updates every Subfloor (+t) mark live.',
      lbl_wall_w: 'West Wall Width (in)',
      help_wall_w: '66-1/4" from South step corner to North corner (resizes elevation & tile live).',
      lbl_ceil_h: 'Ceiling Height (Above Finished Floor, in)',
      help_ceil_h: '121-1/2" above finished floor (10\'-1-1/2").',
      lbl_hood_aff: 'Hood Bottom Line A (Above Finished Floor, in)',
      help_hood_aff: 'Viking range rule governs: 30"–36" above 36" cooktop (66"–72" above finished floor). 64" FAILS.',
      lbl_left_chase: 'Left Pipe/Flue Chase Width (in)',
      help_left_chase: 'Leave blank until measured Friday (dashed provisional outline until measured).',
      lbl_left_cab: 'Left Base Cabinet (in)',
      lbl_right_cab: 'Right Base Cabinet (in)',
      lbl_counter_h: 'Countertop Height (Above Finished Floor, in)',
      lbl_range_w: 'Range Opening Width (in)',
      lbl_rear_trim: 'Viking Rear Trim (Confirmed: Low Trim Only — No 8" Backguard)',
      opt_trim_1: 'Confirmed Low 1" Island Trim — Tile over HardieBacker non-combustible wall (verify 6" / city approval)',
      opt_trim_8: 'Optional 8" High Backguard (Not on owned unit — 0" rear clearance)',
      lbl_ceil_gap: 'Ceiling Gap Solution (4-1/2"–11-1/2" gap above stock cover)',
      opt_gap_open: 'OPEN CHOICE — Decide after Friday mockup photos',
      opt_gap_a: 'Option A — Framed & Tiled Soffit Chase at Ceiling (Unapproved)',
      opt_gap_b: 'Option B — Zephyr Z1C-00SA Stainless Extension Kit (Verify SKU)',
      btn_apply_local: 'Apply Live Preview',
      btn_save_tailnet: 'Save Live to Tailnet',
      btn_export_json: 'Download JSON',
      save_hint_off: 'Off-tailnet Read-Only / Local Export mode: live edits update preview & local exports only. Connect to Tisa\'s Tailscale network to save live overrides.',
      save_hint_on: 'Connected to Tailnet persistence (:8444). Saves apply immediately with revision stamp + EOD review log.',
      voice_title: 'Attached Comment Callouts & Voice Note',
      lbl_intent: 'Comment Action',
      intent_edit: 'Modify Plan / Field Measurement',
      intent_problem: 'Flag Problem / Clash',
      intent_question: 'Answer a Question ("What is this right here?")',
      lbl_note: 'Field Note or Spoken Command',
      note_placeholder: 'Example: "Set hood to 70 inches", "Floor buildup is 0.875", or "Left chase is 5.5 inches" (Zero prices)',
      btn_dictate: 'Dictate Voice Note',
      btn_dictate_stop: 'Listening… Tap to Stop',
      btn_apply_note: 'Attach Comment Pin',
      btn_pin_mic: 'Dictate',
      btn_pin_send: 'Send to Agent',
      pin_mode_modify: 'Modify Plan',
      pin_mode_question: 'Answer a Question',
      voice_idle: 'Tap Circle-to-Correct above to circle a spot on the drawing — each pin gets a visible leader line, mic button, and Send to Agent button.',
      voice_unsupported: 'Web Speech dictation is unavailable in this browser — type your field note directly.',
      sketch_none: 'No Circle Drawn',
      sketch_ready: 'Circle Ready to Attach',
      eod_title: 'End-of-Day Review & Revert (Tisa)',
      eod_desc: 'Workers never wait: saved tailnet edits stamp the live plan immediately with a revision ID. At end-of-day, Tisa taps <strong>Accept</strong> (promotes to the kitchen room spec) or <strong>Reject</strong> (reverts atomically).',
      btn_refresh_eod: 'Refresh From Tailnet',
      eod_empty: 'No pending end-of-day edits.',
      btn_accept: 'Accept → Room Spec',
      btn_reject: 'Reject → Revert',
      tailnet_live: 'Tailnet Live',
      tailnet_off: 'Off-Tailnet · Read-Only / Local Export',
      mode_live: 'Tailnet Live Write Enabled',
      mode_local: 'Off-Tailnet Read-Only + Local Export',
      measure_on_site: 'MEASURE ON SITE',
      provisional_outline: 'Measure on site — proportion provisional',
      verify_on_site: 'VERIFY ON SITE',
      not_yet_synced: 'Not Yet Synced (Local Preview)',
      pending_eod_stamp: 'Field Update · Pending EOD Review',
      synced_stamp: 'Synced to Baseline',
      firewall_err: 'Blocked by Private-Data Firewall: never enter currency symbols, prices, bids, estimates, financing, or mail links in crew plans.',
      svg: {
        sheet_title: 'WEST WALL — OVEN / RANGE & VENT HOOD RUN',
        sheet_title_coupled: 'COUPLED CORNERS & FLOOR PLAN — WEST WALL INTERFACE',
        sheet_sub: 'Viking 30" Gas Range + Zephyr Savona Hood · MOCKUP ONLY · NO UPPERS · True Scale X = Y',
        pass_badge: 'VIKING 30"–36": PASS',
        fail_badge: 'VIKING CLEARANCE FAIL',
        ceil_bay: '8"–10" CLEAR CEILING BAY · 6" SMOOTH RIGID DUCT',
        cl_lbl: 'FROM SOUTH STEP CORNER',
        south_ref: '← SOUTH (0" ref)',
        north_ref: 'NORTH (Hallway) →',
        range_lbl: 'Range',
        base_lbl: 'BASE',
        essex: 'Essex Green',
        side_trim: '+3/8" above counter',
        line_b_lbl: 'Line B Keyholes (+9-9/16" · 9-27/32" spread)',
        gas_zone: 'REAR GAS + 120V UTILITY BAY: 0-9/16"–4-15/16" Fin. Floor (+t) · Clear of Anti-Tip',
        antitip: 'ANTI-TIP (25-3/4" from S)',
        seam_lbl: '36" Backer Seam (Shim 3/16" for 0.42" Hardie)',
        clash_ks7: 'NO 4×4 BOX AT 100"!',
        clash_ks7_sub: 'Use 1-gang 2"×3" @ 83"–86"',
        canopy_box: '1-Gang 2"×3" (~83"–86", ±2-1/4", ~1" proud)',
        left_chase_null: 'HOOD DUCT CHASE: MEASURE',
        left_chase_prov: 'Measure on site — proportion provisional',
        left_chase_val: 'HOOD CHASE',
        orig_rail_lbl: 'Original Picture Rail',
        orig_base_lbl: 'Orig. Base',
        fail64_line: '64" (28" clear) — FAILS Viking 30" min',
        kp_title: 'TRUE-SCALE KEY PLAN & COMPASS (147" × 126")',
        kp_west: 'WEST WALL',
        kp_n: 'North (Open)',
        kp_s: 'South (Sink)',
        kp_e: 'East (Fridge)',
        kp_origin: 'Fixed Origin: South step corner = 0" horizontal ref',
        callouts_title: 'LIVE MEASUREMENTS & TAKEOFF SUMMARY',
        legend_title: 'SYMBOLS & MEASURE BOUNDARIES',
        leg_blk: 'Solid 2× / 3/4" ply backing (68"–86" & 104"–Ceil)',
        leg_duct: 'Dedicated >=6" hood duct (NEXT HVAC = furnace only)',
        leg_valid: 'Valid Viking 30"–36" hood mount zone (66"–72" Fin. Floor)',
        leg_clash: 'DEPRECATED 4×4 box at 100" (collides w/ 6" duct)',
        leg_canopy: '1-gang 2"×3" direct hardwire (~83"–86", C/L ±2-1/4", ~1" proud)',
        leg_measure: 'Dashed = Measure on site — proportion provisional',
        leg_bounds: 'Boundaries: wall_to_wall · clear_between_casings · aff · subfloor',
        holds_title: 'CLASHES, HOLDS & ATTACHED CALLOUTS',
        holds_l1: '• NO upper cabinets on West range wall (locked).',
        holds_l2: '• Zephyr direct hardwire: 1-gang 2"×3" @ ~83"–86" (no 4×4 @ 100").',
        holds_l3: '• Left-chase duct = hood ONLY (>=6"); NEXT HVAC = furnace ONLY.',
        holds_l4: '• 685 CFM makeup-air + licensed multi-unit gas/elec tie-in.',
        scale_lbl: 'BAR SCALE (Uniform True Scale X = Y)',
        tb_proj: '1231 11th Ave · Unit 4 · Kitchen',
        tb_city: 'San Francisco, CA 94122 · Zero Prices',
        tb_src: 'Data: kitchen-west-ks4-plan-data.json · Magicplan MASTER',
        tb_title: 'West Range & Vent Hood Wall (Interactive)',
        tb_equip: 'Viking VGCC5304BSS + Zephyr ZSA-E30AS (685 CFM)',
        tb_status: 'STATUS: MOCKUP & PLANNING ONLY — NO CLOSE-IN',
        tb_scale: 'SCALE: Uniform True Scale (scaleX = scaleY)',
        tb_datums: 'HEIGHTS: Finished Floor + Subfloor (+t)',
        tb_lang: 'EN Governs · Verify all dims in field'
      }
    },
    es: {
      doc_title: 'Muro Oeste de Estufa y Campana — Cocina Unidad 4',
      hdr_title: 'Muro Oeste de Estufa y Campana',
      hdr_sub: 'Plano Interactivo a Escala Real · Estufa Viking 30" + Campana Zephyr Savona · Sin Precios',
      back_room: '← Volver a Página de Cocina',
      btn_lang: 'English (EN)',
      datum_both: 'Alturas: Piso Terminado + Subpiso (+t)',
      datum_sf: 'Alturas: Solo Subpiso (+t)',
      datum_aff: 'Alturas: Solo Piso Terminado',
      btn_circle_on: 'Circular para Corregir',
      btn_circle_off: 'Dibujo Activo…',
      btn_export_svg: 'Exportar SVG',
      btn_download_pdf: 'Descargar / Imprimir PDF',
      hold_html: '<strong>SUSPENSIÓN Y SOLO MAQUETA:</strong> Referencia de planeación y maqueta del viernes 20 nov. <strong>NO</strong> autoriza conexión final de gas/electricidad ni cierre de tablaroca. La entrega de tablaroca del 23 nov no libera cierre.',
      conflict_text: 'Otro editor guardó una revisión más reciente en Tailnet (HTTP 409). Recarga el plano más reciente y vuelve a aplicar tu cambio.',
      btn_reload: 'Recargar Plano Actual',
      svg_panel_title_elev: 'Alzado a Escala Real — Muro Oeste de Estufa',
      svg_panel_title_coupled: 'Esquinas Acopladas y Planta a Escala Real — Interfaz Muro Oeste',
      tab_view_elevation: 'Alzado Muro Oeste',
      tab_view_coupled: 'Esquinas Acopladas y Planta',
      link_full_floorplan: 'Planta de Cocina y Lista de Gabinetes →',
      lyr_framing: 'Bastidor y Refuerzos',
      lyr_appliances: 'Estufa + Campana',
      lyr_mep: 'Ducto 6", Gas y Eléctrico',
      lyr_clashes: 'Choques y Medir en Obra',
      circle_bar_hint: 'Dibuja un círculo sobre cualquier punto del plano (dedo o ratón) para adjuntar un comentario.',
      btn_clear_sketch: 'Borrar Trazo',
      btn_circle_done: 'Salir de Círculo',
      photo_panel_title: 'Muro Oeste Real con Bastidor Abierto (Foto de Obra)',
      photo_badge: 'VERIFICAR VIERNES',
      photo_left: '← SUR (0" ref)',
      photo_mid: 'MURO OESTE DE ESTUFA',
      photo_right: 'NORTE (Pasillo) →',
      photo_callouts: [
        '<li class="callout-alert"><strong>Ducto Izquierdo Exclusivo de Campana:</strong> El ducto existente ES exclusivo para la campana (nada más conectado) — medir ancho del cajón y verificar diámetro &ge; 6". <strong>NEXT HVAC es SOLO calefacción</strong> (NO conectar campana a NEXT HVAC).</li>',
        '<li><strong>Esquina Escalonada Sur (Izq. = 0"):</strong> Todas las cotas horizontales corren hacia la derecha (Norte) desde esta esquina fija.</li>',
        '<li><strong>Cableado Directo Zephyr (Manual p. 3):</strong> Caja sencilla 2"&times;3" a ~83"–86" sobre piso terminado (eje &plusmn; 2-1/4", ~1" salida para HardieBacker 1/2" + azulejo dentro del cubreducto 8-5/8"&times;7-1/2" — reemplaza caja 4&times;4 a 100").</li>',
        '<li><strong>Te de Gas y Enmarcado Bajo:</strong> Reubicar en vano trasero 18"–48" a 0-9/16"–4-15/16" sobre piso terminado (+t) con plomero con licencia.</li>'
      ],
      concept_disclaimer_html: '<strong>Foto de Obra vs. Concepto:</strong> La foto superior es el muro real abierto. Cualquier render 3D de estilo en Drive es <em>Referencia de concepto — no a escala</em>; construye siempre con este plano a escala real.',
      clashes_title: 'Choques Marcados y Revisiones de Obra (Nunca Auto-Resueltos)',
      clashes_lock_pill: 'Inmutable · Verificar en Obra',
      marks_title: 'Tabla Viva de Alturas (La Cuadrilla Marca Desde Subpiso +t)',
      th_feature: 'Elemento / Línea de Referencia',
      th_aff: 'Sobre Piso Terminado',
      th_subfloor: 'Sobre Subpiso (+t)',
      th_horiz: 'Horizontal desde Sur (0")',
      th_boundary: 'Límite y Estado',
      takeoff_title: 'Cuantificación Viva de Materiales Propuestos (Solo Cantidades · Sin Precios)',
      takeoff_notice: 'Solo Cantidades Brutas Propuestas (Sin Precios) — Verificar Inventario en Obra Antes de Pedir.',
      lbl_waste_pct: 'Desperdicio / Margen (%):',
      btn_waste_10: '+10% Recto',
      btn_waste_15: '+15% Ladrillo/Patrón',
      lbl_box_sqft: 'Rendimiento por Caja (pies²/caja):',
      box_placeholder: 'Opcional',
      lbl_deduct_chimney: 'Descontar huella de cubreducto del azulejo',
      trim_title: 'Molduras Originales Existentes (Separar de Molduras Nuevas Propuestas)',
      trim_badge: 'Original Edwardian',
      lbl_trim_base: 'Altura de Zoclo Original (pulg)',
      help_trim_base: 'Registrado 9-1/2" en Unidad 4 (termina al costado de gabinetes bajos).',
      lbl_trim_rail: 'Altura de Moldura Alta Original (pulg)',
      help_trim_rail: 'Registrada 103" sobre piso terminado (mueve la línea punteada en el alzado).',
      lbl_trim_door: 'Ancho de Chambrana de Puerta Original (pulg)',
      help_trim_door: 'Claro de acceso pasillo norte: 29-3/8" × 84". Medir ancho de chambrana en obra.',
      lbl_trim_win: 'Ancho de Chambrana de Ventana Original (pulg)',
      help_trim_win: 'Nunca inventado — dejar vacío hasta medir en obra.',
      editor_title: 'Medidas de Obra y Opciones en Vivo',
      preset_lbl: 'Prueba Rápida:',
      preset_baseline: 'Altura Planeada (66-15/16")',
      preset_fail64: 'Probar 64" Altura (FALLA)',
      preset_mid70: 'Probar 70" Altura (CUMPLE)',
      btn_reset: 'Restaurar Base',
      lbl_author: 'Nombre del Editor',
      lbl_floor_t: 'Espesor de Piso (t) (pulg)',
      help_floor_t: 'Provisional 3/4" — recalcula todas las marcas Sobre Subpiso (+t).',
      lbl_wall_w: 'Ancho Muro Oeste (pulg)',
      help_wall_w: '66-1/4" de esquina escalonada sur a esquina norte (redimensiona plano y azulejo en vivo).',
      lbl_ceil_h: 'Altura de Techo (Sobre Piso Terminado, pulg)',
      help_ceil_h: '121-1/2" sobre piso terminado (10\'-1-1/2").',
      lbl_hood_aff: 'Base Campana Línea A (Sobre Piso Terminado, pulg)',
      help_hood_aff: 'La regla Viking rige: 30"–36" sobre parrilla de 36" (66"–72" sobre piso terminado). 64" FALLA.',
      lbl_left_chase: 'Ancho Cajón Izq. Tuberías (pulg)',
      help_left_chase: 'Dejar vacío hasta medir el viernes (contorno punteado provisional hasta medir).',
      lbl_left_cab: 'Gabinete Bajo Izq. (pulg)',
      lbl_right_cab: 'Gabinete Bajo Der. (pulg)',
      lbl_counter_h: 'Altura de Cubierta (Sobre Piso Terminado, pulg)',
      lbl_range_w: 'Claro para Estufa (pulg)',
      lbl_rear_trim: 'Remate Trasero Viking (Confirmado: Solo Remate Bajo — Sin Copete 8")',
      opt_trim_1: 'Remate Bajo 1" Confirmado — Azulejo sobre HardieBacker no combustible (confirmar 6" / permiso)',
      opt_trim_8: 'Copete Alto 8" Opcional (No incluido en unidad — 0" atrás)',
      lbl_ceil_gap: 'Solución Claro a Techo (claro 4-1/2"–11-1/2" sobre cubreducto)',
      opt_gap_open: 'DECISIÓN ABIERTA — Definir tras fotos de maqueta del viernes',
      opt_gap_a: 'Opción A — Cajillo Enmarcado con Azulejo en Techo (Sin aprobar)',
      opt_gap_b: 'Opción B — Extensión Inox. Zephyr Z1C-00SA (Verificar SKU)',
      btn_apply_local: 'Aplicar Vista Previa',
      btn_save_tailnet: 'Guardar en Tailnet',
      btn_export_json: 'Descargar JSON',
      save_hint_off: 'Modo Solo Lectura / Exportación Local fuera de Tailnet: los cambios solo se previsualizan y exportan en este dispositivo. Conéctate a Tailscale de Tisa para guardar en vivo.',
      save_hint_on: 'Conectado a persistencia Tailnet (:8444). Los cambios se aplican al instante con sello de revisión y registro EOD.',
      voice_title: 'Comentarios Adjuntos y Nota de Voz',
      lbl_intent: 'Acción del Comentario',
      intent_edit: 'Modificar Plano / Medida en Obra',
      intent_problem: 'Reportar Problema / Choque',
      intent_question: 'Responder una Pregunta ("¿Qué es esto aquí?")',
      lbl_note: 'Nota de Obra o Comando Dictado',
      note_placeholder: 'Ejemplo: "Pon campana a 70 pulgadas", "Espesor de piso 0.875", o "Cajón izquierdo 5.5" (Sin precios)',
      btn_dictate: 'Dictar Nota de Voz',
      btn_dictate_stop: 'Escuchando… Toca para Parar',
      btn_apply_note: 'Adjuntar Pin de Comentario',
      btn_pin_mic: 'Dictar',
      btn_pin_send: 'Enviar al Agente',
      pin_mode_modify: 'Modificar Plano',
      pin_mode_question: 'Responder Pregunta',
      voice_idle: 'Toca Circular para Corregir arriba para marcar un punto — cada pin incluye línea guía, micrófono propio y botón Enviar al Agente.',
      voice_unsupported: 'El dictado Web Speech no está disponible en este navegador — escribe tu nota directamente.',
      sketch_none: 'Sin Círculo',
      sketch_ready: 'Círculo Listo para Adjuntar',
      eod_title: 'Revisión de Fin de Día y Reversión (Tisa)',
      eod_desc: 'La cuadrilla no espera: los cambios guardados en Tailnet sellan el plano vivo de inmediato. Al final del día, Tisa toca <strong>Aceptar</strong> (promueve a la hoja de cocina) o <strong>Rechazar</strong> (revierte).',
      btn_refresh_eod: 'Actualizar desde Tailnet',
      eod_empty: 'No hay cambios pendientes de revisión.',
      btn_accept: 'Aceptar → Hoja Cocina',
      btn_reject: 'Rechazar → Revertir',
      tailnet_live: 'Tailnet Activo',
      tailnet_off: 'Fuera de Tailnet · Solo Lectura / Exportar',
      mode_live: 'Guardado en Vivo Tailnet Activo',
      mode_local: 'Solo Lectura + Exportación Local',
      measure_on_site: 'MEDIR EN OBRA',
      provisional_outline: 'Medir en obra — proporción provisional',
      verify_on_site: 'VERIFICAR EN OBRA',
      not_yet_synced: 'Sin Sincronizar (Vista Local)',
      pending_eod_stamp: 'Cambio de Obra · Revisión EOD Pendiente',
      synced_stamp: 'Sincronizado con Base',
      firewall_err: 'Bloqueado por Filtro de Privacidad: nunca incluyas signos de moneda, precios, cotizaciones, presupuestos, financiamiento ni enlaces de correo.',
      svg: {
        sheet_title: 'MURO OESTE — ESTUFA Y CAMPANA DE EXTRACCIÓN',
        sheet_title_coupled: 'ESQUINAS ACOPLADAS Y PLANTA — INTERFAZ MURO OESTE',
        sheet_sub: 'Estufa Viking 30" + Campana Zephyr Savona · SOLO MAQUETA · SIN GABINETES ALTOS · Escala X = Y',
        pass_badge: 'VIKING 30"–36": CUMPLE',
        fail_badge: 'LIBRAMIENTO VIKING FALLA',
        ceil_bay: 'CLARO LIBRE EN TECHO 8"–10" · DUCTO RÍGIDO LISO 6"',
        cl_lbl: 'DESDE ESQ. ESCALONADA SUR',
        south_ref: '← SUR (0" ref)',
        north_ref: 'NORTE (Pasillo) →',
        range_lbl: 'Estufa',
        base_lbl: 'BASE',
        essex: 'Essex Green',
        side_trim: '+3/8" s/ cubierta',
        line_b_lbl: 'Ojales Línea B (+9-9/16" · sep. 9-27/32")',
        gas_zone: 'FRANJA GAS + 120V TRASERA: 0-9/16"–4-15/16" Piso Term. (+t) · Libre Antivuelco',
        antitip: 'ANTIVUELCO (25-3/4" de Sur)',
        seam_lbl: 'Junta Respaldo 36" (Calza 3/16" p/ Hardie 0.42")',
        clash_ks7: '¡NO CAJA 4×4 A 100"!',
        clash_ks7_sub: 'Usar caja 2"×3" @ 83"–86"',
        canopy_box: 'Caja 2"×3" (~83"–86", ±2-1/4", ~1" salida)',
        left_chase_null: 'DUCTO CAMPANA: MEDIR',
        left_chase_prov: 'Medir en obra — proporción provisional',
        left_chase_val: 'CAJÓN CAMPANA',
        orig_rail_lbl: 'Moldura Alta Original',
        orig_base_lbl: 'Zoclo Orig.',
        fail64_line: '64" (28" libre) — NO CUMPLE mín. 30" Viking',
        kp_title: 'PLANTA A ESCALA REAL Y BRÚJULA (147" × 126")',
        kp_west: 'MURO OESTE',
        kp_n: 'Norte (Abierto)',
        kp_s: 'Sur (Tarja)',
        kp_e: 'Este (Refri)',
        kp_origin: 'Origen Fijo: Esquina escalonada sur = 0" ref. horizontal',
        callouts_title: 'MEDIDAS EN VIVO Y RESUMEN DE MATERIALES',
        legend_title: 'SIMBOLOGÍA Y LÍMITES (measure_boundary)',
        leg_blk: 'Refuerzo 2× / triplay 3/4" (68"–86" y 104"–Techo)',
        leg_duct: 'Ducto exclusivo >=6" campana (NEXT HVAC = solo calefacción)',
        leg_valid: 'Zona válida Viking 30"–36" (66"–72" Piso Term.)',
        leg_clash: 'Caja 4×4 a 100" DESCARTADA (choca con ducto 6")',
        leg_canopy: 'Caja sencilla 2"×3" directa (~83"–86", eje ±2-1/4", ~1" salida)',
        leg_measure: 'Punteado = Medir en obra — proporción provisional',
        leg_bounds: 'Límites: wall_to_wall · clear_between_casings · aff · subfloor',
        holds_title: 'CHOQUES, SUSPENSIONES Y COMENTARIOS ADJUNTOS',
        holds_l1: '• SIN gabinetes altos en el muro oeste (bloqueado).',
        holds_l2: '• Zephyr directo: caja sencilla 2"×3" @ ~83"–86" (no 4×4 @ 100").',
        holds_l3: '• Ducto izq. = SOLO campana (>=6"); NEXT HVAC = SOLO calefacción.',
        holds_l4: '• 685 CFM aire reposición + técnicos con licencia gas/eléc.',
        scale_lbl: 'ESCALA GRÁFICA (Escala Real Uniforme X = Y)',
        tb_proj: '1231 11th Ave · Unidad 4 · Cocina',
        tb_city: 'San Francisco, CA 94122 · Sin Precios',
        tb_src: 'Datos: kitchen-west-ks4-plan-data.json · Magicplan MASTER',
        tb_title: 'Muro Oeste de Estufa y Campana (Interactivo)',
        tb_equip: 'Viking VGCC5304BSS + Zephyr ZSA-E30AS (685 CFM)',
        tb_status: 'ESTADO: SOLO MAQUETA Y PLANEACIÓN — NO CERRAR MURO',
        tb_scale: 'ESCALA: Escala Real Uniforme (scaleX = scaleY)',
        tb_datums: 'ALTURAS: Piso Terminado + Subpiso (+t)',
        tb_lang: 'Inglés Rige · Verificar medidas en obra'
      }
    }
  };

  /* ── Runtime State (strictly in-memory, ZERO browser web storage) ── */
  const params = new URLSearchParams(window.location.search);
  let currentLang = (params.get('lang') || '').toLowerCase() === 'es' ? 'es' : 'en';
  let activeView = (params.get('view') || '').toLowerCase() === 'coupled' ? 'coupled' : 'elevation';
  let datumMode = 'both'; // 'both' | 'subfloor' | 'aff'
  let state = deepClone(BASELINE_KS4_DATA);
  let apiOrigin = resolveApiOrigin(params.get('api'), DEFAULT_API_ORIGIN);
  let voiceOrigin = resolveApiOrigin(params.get('voice_api'), DEFAULT_VOICE_ORIGIN);
  let lastScaleInfo = { view: 'elevation', scaleX: 1, scaleY: 1, uniform: true };
  let tailnetState = {
    checked: false,
    online: false,
    verified: false,
    user: null,
    pendingEod: []
  };
  let hasUnsyncedLocalEdits = false;
  let lastSavedRevId = null;
  let circleMode = false;
  let isDrawing = false;
  let drawPoints = [];
  let pendingCircleNorm = null; // { cx, cy, rx, ry } in normalized [0..1] SVG viewBox space
  let speechRecognition = null;
  let speechListening = false;
  let speechTargetPinIdx = null;
  let toastTimer = null;

  const layers = {
    framing: true,
    appliances: true,
    mep: true,
    clashes: true
  };

  /* ── Helpers ──────────────────────────────────────────────────────── */
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function ensureStateDefaults(target) {
    if (!target.existing_original_trim) {
      target.existing_original_trim = deepClone(BASELINE_KS4_DATA.existing_original_trim);
    } else {
      Object.keys(BASELINE_KS4_DATA.existing_original_trim).forEach((k) => {
        if (target.existing_original_trim[k] === undefined) {
          target.existing_original_trim[k] = deepClone(BASELINE_KS4_DATA.existing_original_trim[k]);
        }
      });
    }
    if (!target.takeoff_settings) {
      target.takeoff_settings = deepClone(BASELINE_KS4_DATA.takeoff_settings);
    }
    target.flagged_clashes = deepClone(BASELINE_KS4_DATA.flagged_clashes);
    if (!Array.isArray(target.pins)) target.pins = [];
    return target;
  }

  function resolveApiOrigin(raw, fallback) {
    const def = fallback || DEFAULT_API_ORIGIN;
    if (!raw) return def;
    try {
      const parsed = new URL(raw);
      if (parsed.protocol === 'https:' || parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') {
        return parsed.origin;
      }
    } catch (_) {
      /* ignore invalid override */
    }
    return def;
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  }

  /* Format inches to nearest 1/16" architectural fraction (never ugly floats) */
  function toFrac16(val) {
    if (val === null || val === undefined || Number.isNaN(Number(val))) {
      return I18N[currentLang].measure_on_site;
    }
    const num = Number(val);
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);
    let whole = Math.floor(abs);
    let sixteenths = Math.round((abs - whole) * 16);
    if (sixteenths === 16) {
      whole += 1;
      sixteenths = 0;
    }
    if (sixteenths === 0) {
      return `${sign}${whole}"`;
    }
    const g = gcd(sixteenths, 16);
    const n = sixteenths / g;
    const d = 16 / g;
    return whole === 0 ? `${sign}${n}/${d}"` : `${sign}${whole}-${n}/${d}"`;
  }

  function formatDualHeight(affVal, tVal) {
    const sf = affVal + tVal;
    if (datumMode === 'aff') return `${toFrac16(affVal)} AFF`;
    if (datumMode === 'subfloor') return `${toFrac16(sf)} SF`;
    return `${toFrac16(affVal)} AFF (${toFrac16(sf)} SF)`;
  }

  /* Private-data firewall check (currency, bids, estimates, financing, private mail) */
  function violatesPrivateFirewall(text) {
    if (!text) return false;
    const s = String(text);
    const blockedMail = ['mail', 'google', 'com'].join('\\.');
    const blockedFinance = [['go', 'green'].join(''), ['cal', 'coast'].join('')].join('|');
    const patterns = [
      new RegExp('\\x24\\s*\\d', 'i'),
      new RegExp('\\x24\\s*[a-z]', 'i'),
      /\b(usd|dollars|dolares|dólares|pesos|mxn|price|pricing|precio|precios|costo|costos|estimate\s*#|cotizaci[oó]n|presupuesto|invoice|factura|payroll|n[oó]mina|financing|financiamiento|bid\s+amount)\b/i,
      new RegExp('\\b(' + blockedFinance + ')\\b', 'i'),
      new RegExp(blockedMail, 'i')
    ];
    return patterns.some((rx) => rx.test(s));
  }

  function showToast(msg, variant) {
    const el = document.getElementById('status-toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'status-toast' + (variant === 'error' ? ' toast-error' : variant === 'ok' ? ' toast-ok' : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 4500);
  }

  function computeDerived() {
    const d = state.dimensions;
    const wallW = Number(d.wall_width_in.value) || 66.25;
    const ceilH = Number(d.ceiling_height_in.value) || 121.5;
    const floorT = d.floor_buildup_t_in.value === null ? 0 : Number(d.floor_buildup_t_in.value);
    const counterH = Number(d.counter_height_in.value) || 36.0;
    const hoodA = Number(d.hood_bottom_aff_in.value) || 66.9375;
    const leftCab = Number(d.left_base_cab_in.value) || 18.0;
    const rangeW = Number(d.range_opening_in.value) || 30.0;
    const rightCab = Number(d.right_base_cab_in.value) || 18.0;
    const lowBlkMin = Number(d.lower_blocking_min_aff_in.value) || 68.0;
    const lowBlkMax = Number(d.lower_blocking_max_aff_in.value) || 86.0;
    const upBlkMin = Number(d.upper_blocking_min_aff_in.value) || 104.0;
    const leftChase = d.left_chase_width_in.value === null || d.left_chase_width_in.value === ''
      ? null
      : Number(d.left_chase_width_in.value);

    const clearance = hoodA - counterH;
    const minClear = state.appliances.range.clearance_min_in; // 30
    const maxClear = state.appliances.range.clearance_max_in; // 36
    const vikingPass = clearance >= minClear - 1e-6 && clearance <= maxClear + 1e-6;
    const vikingDelta = clearance < minClear ? minClear - clearance : (clearance > maxClear ? clearance - maxClear : 0);

    const lineB = hoodA + state.appliances.hood.line_b_offset_above_a_in; // +9-9/16"
    const clX = leftCab + rangeW / 2.0; // 33" on K-S4 baseline
    const runSum = leftCab + rangeW + rightCab;
    const scribe = wallW - runSum;

    /* Stock telescoping cover reaches Line A + 44" (spec) to + 45" (manual) */
    const coverTopSpec = hoodA + 44.0;
    const coverTopManual = hoodA + 45.0;
    const gapMin = Math.max(0, ceilH - coverTopManual);
    const gapMax = Math.max(0, ceilH - coverTopSpec);

    const antitipX = leftCab + rangeW - 22.25; // 25-3/4" from South step corner
    const w1X = leftCab / 2.0; // 9"
    const w2X = leftCab + rangeW + rightCab / 2.0; // 57"

    return {
      wallW, ceilH, floorT, counterH, hoodA, leftCab, rangeW, rightCab,
      lowBlkMin, lowBlkMax, upBlkMin, leftChase,
      clearance, minClear, maxClear, vikingPass, vikingDelta,
      lineB, clX, runSum, scribe,
      coverTopSpec, coverTopManual, gapMin, gapMax,
      antitipX, w1X, w2X
    };
  }

  /* Live Proposed Materials Takeoff (Gross Proposed Quantities ONLY — ZERO prices) */
  function computeTakeoff() {
    ensureStateDefaults(state);
    const m = computeDerived();
    const cfg = state.takeoff_settings;
    const wastePct = Math.max(0, Math.min(35, Number(cfg.waste_pct != null ? cfg.waste_pct : 15)));
    const boxSqFt = cfg.tile_box_sqft !== null && cfg.tile_box_sqft !== '' && Number(cfg.tile_box_sqft) > 0
      ? Number(cfg.tile_box_sqft)
      : null;
    const deductChimney = !!cfg.deduct_chimney;

    const tileHeightIn = Math.max(0, m.ceilH - m.counterH);
    const grossWallSqFt = (m.wallW * tileHeightIn) / 144.0;

    /* Option A tiled soffit adds 2 tiled side returns (9.5" deep × ceiling gap height) */
    const soffitSideSqFt = state.options.ceiling_gap_solution === 'option_a_soffit' && m.gapMax > 0
      ? (2 * 9.5 * m.gapMax) / 144.0
      : 0;

    const chimHeightIn = Math.max(0, Math.min(m.ceilH, m.coverTopSpec) - (m.hoodA + 10.75));
    const chimneyDeductSqFt = deductChimney ? (state.appliances.hood.chimney_width_in * chimHeightIn) / 144.0 : 0;

    const netTileSqFt = Math.max(0, grossWallSqFt + soffitSideSqFt - chimneyDeductSqFt);
    const grossTileSqFt = netTileSqFt * (1 + wastePct / 100.0);
    const proposedBoxes = boxSqFt ? Math.ceil(grossTileSqFt / boxSqFt) : null;

    /* 0.42" HardieBacker 500 sheets (3' x 5' = 15 sq ft) + 10% cut allowance */
    const backerNetSqFt = grossWallSqFt;
    const backerGrossSqFt = backerNetSqFt * 1.10;
    const backerSheets = Math.max(1, Math.ceil(backerGrossSqFt / 15.0));

    /* 3/16" furring / shim strips across 16" OC studs above 36" backer seam */
    const studCount = Math.floor((m.wallW - 3) / 16) + 2;
    const shimLF = Math.ceil((studCount * tileHeightIn) / 12.0);

    /* Solid wood blocking (2x10 / 2x8 lumber courses or 3/4" structural ply) */
    const lowerBandW = Math.min(m.wallW, 46.0);
    const lowerBandH = Math.max(0, m.lowBlkMax - m.lowBlkMin);
    const lowerCourses = Math.max(1, Math.ceil(lowerBandH / 9.25));
    const lowerLF = (lowerBandW * lowerCourses) / 12.0;

    const upperBandW = Math.min(m.wallW, 30.0);
    const upperBandH = Math.max(0, m.ceilH - m.upBlkMin);
    const upperCourses = Math.max(1, Math.ceil(upperBandH / 9.25));
    const upperLF = (Math.max(0, upperBandW - 9.0) * upperCourses) / 12.0; // leaves 8"-10" duct bay clear
    const blockingTotalLF = Math.ceil((lowerLF + upperLF) * 1.15);
    const blocking8ftSticks = Math.max(1, Math.ceil(blockingTotalLF / 8.0));

    /* Lower drywall + primer/adjacent wall paint coverage (1 gal ≈ 350 sq ft) */
    const lowerDrywallSqFt = (m.wallW * m.counterH) / 144.0;
    const paintGallonsMin = Math.max(1, Math.ceil((lowerDrywallSqFt * 2) / 350.0));

    return {
      waste_pct: wastePct,
      tile_box_sqft: boxSqFt,
      deduct_chimney: deductChimney,
      tile_net_sqft: Number(netTileSqFt.toFixed(2)),
      tile_gross_sqft: Number(grossTileSqFt.toFixed(2)),
      tile_soffit_extra_sqft: Number(soffitSideSqFt.toFixed(2)),
      tile_chimney_deduct_sqft: Number(chimneyDeductSqFt.toFixed(2)),
      tile_boxes_proposed: proposedBoxes,
      backer_net_sqft: Number(backerNetSqFt.toFixed(2)),
      backer_gross_sqft: Number(backerGrossSqFt.toFixed(2)),
      backer_sheets_3x5: backerSheets,
      shim_strips_count: studCount,
      shim_total_lf: shimLF,
      blocking_total_lf: blockingTotalLF,
      blocking_8ft_sticks: blocking8ftSticks,
      lower_drywall_sqft: Number(lowerDrywallSqFt.toFixed(2)),
      primer_paint_gallons_min: paintGallonsMin
    };
  }

  function computeRevisionStamp() {
    const tr = I18N[currentLang];
    const rev = lastSavedRevId || state.base_rev || 'rev-20261120-001';
    if (hasUnsyncedLocalEdits) {
      return `${rev} · ${tr.not_yet_synced}`;
    }
    if ((tailnetState.pendingEod && tailnetState.pendingEod.length > 0) || (state.field_overrides && state.field_overrides.length > 0)) {
      return `${rev} · ${tr.pending_eod_stamp}`;
    }
    return `${rev} · ${tr.synced_stamp}`;
  }

  /* ── Anti-Collision Vertical Tick Layout ──────────────────────────── */
  function spreadTicks(ticks, minGap) {
    const sorted = ticks.slice().sort((a, b) => a.trueY - b.trueY);
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].labelY = sorted[i].trueY;
    }
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].labelY - sorted[i - 1].labelY < minGap) {
        sorted[i].labelY = sorted[i - 1].labelY + minGap;
      }
    }
    // Pull back gently if last tick pushed past floor + 10
    for (let i = sorted.length - 2; i >= 0; i--) {
      if (sorted[i + 1].labelY - sorted[i].labelY < minGap) {
        sorted[i].labelY = sorted[i + 1].labelY - minGap;
      }
    }
    return sorted;
  }

  /* ── Shared Attached Comment Callouts Layer (SVG Leader Lines) ────── */
  function buildPinsSvg() {
    const pins = state.pins || [];
    if (!pins.length) return '';
    return pins.map((pin, idx) => {
      const px = (pin.cx || 0.35) * 920;
      const py = (pin.cy || 0.45) * 1120;
      const rx = Math.max(14, (pin.rx || 0.03) * 920);
      const ry = Math.max(14, (pin.ry || 0.025) * 1120);
      const isQuestion = pin.mode === 'ask_question' || pin.intent === 'ask_question';
      const pinColor = pin.intent === 'flag_problem' ? '#b91c1c' : isQuestion ? '#15539e' : '#b45309';
      const badgeX = px + rx * 0.72;
      const badgeY = py - ry * 0.72;
      const cardX = 524;
      const cardY = Math.min(812, 744 + idx * 36);
      const snippet = String(pin.note || (currentLang === 'es' ? 'Comentario adjunto' : 'Attached comment')).slice(0, 44);
      const statusTxt = pin.agent_status === 'answered'
        ? (currentLang === 'es' ? 'Respondido' : 'Answered')
        : pin.agent_status === 'sent_applied'
          ? (currentLang === 'es' ? 'Enviado' : 'Sent')
          : (currentLang === 'es' ? 'Local' : 'Local');
      return `
        <g class="ks4-pin" data-pin-idx="${idx}" data-elem="attached-pin-${idx}">
          <ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"
                   fill="${pinColor}" fill-opacity="0.10" stroke="${pinColor}" stroke-width="2.4" stroke-dasharray="5,3"/>
          <polyline class="pin-leader" points="${badgeX.toFixed(1)},${badgeY.toFixed(1)} ${(cardX - 18).toFixed(1)},${(cardY + 13).toFixed(1)} ${cardX.toFixed(1)},${(cardY + 13).toFixed(1)}"
                    fill="none" stroke="${pinColor}" stroke-width="1.5" stroke-dasharray="4,2"/>
          <circle cx="${cardX.toFixed(1)}" cy="${(cardY + 13).toFixed(1)}" r="3.2" fill="${pinColor}"/>
          <circle cx="${badgeX.toFixed(1)}" cy="${badgeY.toFixed(1)}" r="10" fill="${pinColor}"/>
          <text x="${badgeX.toFixed(1)}" y="${(badgeY + 3.5).toFixed(1)}" font-size="9" text-anchor="middle" font-weight="700" fill="#ffffff">${idx + 1}</text>
          <rect x="${cardX.toFixed(1)}" y="${cardY.toFixed(1)}" width="362" height="27" rx="3" fill="#ffffff" fill-opacity="0.97" stroke="${pinColor}" stroke-width="1.2"/>
          <text x="${(cardX + 8).toFixed(1)}" y="${(cardY + 11.5).toFixed(1)}" font-size="7.4" font-weight="700" fill="${pinColor}">#${idx + 1} · ${esc(pin.author || 'Field')} [${esc(statusTxt)}]</text>
          <text x="${(cardX + 8).toFixed(1)}" y="${(cardY + 22.5).toFixed(1)}" font-size="7.2" fill="#10202b">${esc(snippet)}</text>
        </g>`;
    }).join('');
  }

  /* ── Coupled Corners & Floor Plan Tab (Strict Uniform scaleX === scaleY) ── */
  function renderCoupledSvg(svgEl, m, tk, tr, S, d) {
    const isEs = currentLang === 'es';
    const stamp = computeRevisionStamp();
    /* Uniform single pixels-per-inch scale for 147" x 126" kitchen polygon */
    const planScale = 2.65;
    lastScaleInfo = { view: 'coupled', scaleX: planScale, scaleY: planScale, uniform: true };

    const ox = 72;
    const oy = 186;
    const px = (xIn) => ox + xIn * planScale;
    const py = (yIn) => oy + yIn * planScale;
    const passColor = m.vikingPass ? '#2f4f42' : '#b91c1c';
    const passBg = m.vikingPass ? '#e6efe9' : '#fef2f2';

    /* West Wall runs along x = 31.5 from y = 66.25 (South Step 0") northward to y = 66.25 - m.wallW */
    const westTopY = 66.25 - m.wallW;
    const cabDepth = 24.0;
    const rangeDepth = 28.0625;
    const hoodDepth = 19.4375;
    const wRunStart = 66.25; // South step corner = 0"
    const wCab1End = wRunStart - m.leftCab;
    const wRangeEnd = wCab1End - m.rangeW;
    const wCab2End = wRangeEnd - m.rightCab;
    const wClY = wRunStart - m.clX;

    /* Walk clearance past West range run to South countertop overhang (24" base + 1.5" overhang = 25.5") */
    const southCounterFrontY = 126.0 - 25.5;
    const walkToSouthCounterIn = Math.max(0, southCounterFrontY - 66.25);

    /* Left Chase on West Wall in Plan (provisional dashed when null) */
    let chasePlanSvg = '';
    if (layers.clashes) {
      const chaseW = m.leftChase === null ? 5.5 : m.leftChase;
      const isProv = m.leftChase === null;
      if (chaseW > 0) {
        chasePlanSvg = `
          <rect data-elem="left-chase" x="${px(31.5).toFixed(2)}" y="${py(wRunStart - chaseW).toFixed(2)}"
                width="${(8.0 * planScale).toFixed(2)}" height="${(chaseW * planScale).toFixed(2)}"
                fill="url(#amberHatch)" fill-opacity="0.45" stroke="${isProv ? '#d97706' : '#b45309'}"
                stroke-width="1.5" ${isProv ? 'stroke-dasharray="4,3"' : ''}/>
          <text x="${(px(31.5) + 26).toFixed(2)}" y="${py(wRunStart - chaseW / 2).toFixed(2)}" font-size="6.8" font-weight="700" fill="#92400e">
            ${esc(isProv ? S.left_chase_prov : `${S.left_chase_val}: ${toFrac16(chaseW)}`)}
          </text>`;
      }
    }

    const ftPx = 12 * planScale;
    const barX = 526;
    const barY = 918;
    const pinsMarkup = buildPinsSvg();

    svgEl.innerHTML = `
      <defs>
        <pattern id="amberHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#d97706" stroke-width="1.1"/>
        </pattern>
      </defs>

      <rect x="10" y="10" width="900" height="1100" fill="#ffffff" stroke="#10202b" stroke-width="1.8"/>
      <rect x="10" y="10" width="900" height="54" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <text x="24" y="32" font-size="13.2" font-weight="700" fill="#10202b">${esc(S.sheet_title_coupled)}</text>
      <text x="24" y="49" font-size="8.6" fill="#4b5c69">${esc(S.sheet_sub)}</text>

      <rect x="606" y="18" width="290" height="38" rx="4" fill="${passBg}" stroke="${passColor}" stroke-width="1.3"/>
      <text x="751" y="33" font-size="9.5" text-anchor="middle" font-weight="700" fill="${passColor}">${esc(m.vikingPass ? S.pass_badge : S.fail_badge)} · ${esc(toFrac16(m.clearance))}</text>
      <text x="751" y="47" font-size="7.6" text-anchor="middle" fill="#334155">${esc(stamp)}</text>

      <!-- True-Scale Kitchen Polygon (147" x 126" with 31.5" x 59.75" SW Recess) -->
      <polygon data-elem="coupled-room-poly"
               points="${px(31.5).toFixed(2)},${py(westTopY).toFixed(2)} ${px(147).toFixed(2)},${py(westTopY).toFixed(2)} ${px(147).toFixed(2)},${py(126).toFixed(2)} ${px(0).toFixed(2)},${py(126).toFixed(2)} ${px(0).toFixed(2)},${py(66.25).toFixed(2)} ${px(31.5).toFixed(2)},${py(66.25).toFixed(2)}"
               fill="#fbfdfb" stroke="#10202b" stroke-width="2.4"/>

      <!-- Highlight Active West Range Wall -->
      <line data-elem="coupled-west-run" x1="${px(31.5).toFixed(2)}" y1="${py(westTopY).toFixed(2)}" x2="${px(31.5).toFixed(2)}" y2="${py(66.25).toFixed(2)}" stroke="#15539e" stroke-width="5.5"/>
      <circle cx="${px(31.5).toFixed(2)}" cy="${py(66.25).toFixed(2)}" r="4.5" fill="#b91c1c"/>
      <text x="${(px(31.5) - 6).toFixed(2)}" y="${(py(66.25) - 7).toFixed(2)}" font-size="7.2" text-anchor="end" font-weight="700" fill="#b91c1c">${isEs ? 'Esq. Sur 0"' : 'South Step 0"'}</text>

      <!-- Coupled West Wall Base Cabinets (24" deep) + Viking Range (28-1/16" nose) + Overhead Zephyr (19-7/16" deep) -->
      <rect data-elem="left-cab" x="${px(31.5).toFixed(2)}" y="${py(wCab1End).toFixed(2)}" width="${(cabDepth * planScale).toFixed(2)}" height="${(m.leftCab * planScale).toFixed(2)}" fill="#e6efe9" stroke="#2f4f42" stroke-width="1.6"/>
      <text x="${px(31.5 + 12).toFixed(2)}" y="${py((wRunStart + wCab1End) / 2 + 2).toFixed(2)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#2f4f42">${esc(toFrac16(m.leftCab))}×24"</text>

      <rect data-elem="range-bay" x="${px(31.5).toFixed(2)}" y="${py(wRangeEnd).toFixed(2)}" width="${(rangeDepth * planScale).toFixed(2)}" height="${(m.rangeW * planScale).toFixed(2)}" fill="#f1f5f9" stroke="#10202b" stroke-width="1.9"/>
      <text x="${px(31.5 + rangeDepth / 2).toFixed(2)}" y="${py((wCab1End + wRangeEnd) / 2 - 2).toFixed(2)}" font-size="7.6" text-anchor="middle" font-weight="700" fill="#10202b">VIKING 30"</text>
      <text x="${px(31.5 + rangeDepth / 2).toFixed(2)}" y="${py((wCab1End + wRangeEnd) / 2 + 8).toFixed(2)}" font-size="6.5" text-anchor="middle" fill="#475569">28-1/16" D</text>

      <rect data-elem="right-cab" x="${px(31.5).toFixed(2)}" y="${py(wCab2End).toFixed(2)}" width="${(cabDepth * planScale).toFixed(2)}" height="${(m.rightCab * planScale).toFixed(2)}" fill="#e6efe9" stroke="#2f4f42" stroke-width="1.6"/>
      <text x="${px(31.5 + 12).toFixed(2)}" y="${py((wRangeEnd + wCab2End) / 2 + 2).toFixed(2)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#2f4f42">${esc(toFrac16(m.rightCab))}×24"</text>

      <!-- Overhead Zephyr Hood footprint (dashed, 19-7/16" deep — NO UPPERS) -->
      <rect data-elem="hood-canopy" x="${px(31.5).toFixed(2)}" y="${py(wClY - 14.9375).toFixed(2)}" width="${(hoodDepth * planScale).toFixed(2)}" height="${(29.875 * planScale).toFixed(2)}"
            fill="none" stroke="#15539e" stroke-width="1.3" stroke-dasharray="4,3"/>
      <line x1="${px(22).toFixed(2)}" y1="${py(wClY).toFixed(2)}" x2="${px(66).toFixed(2)}" y2="${py(wClY).toFixed(2)}" stroke="#15539e" stroke-width="1" stroke-dasharray="6,2,2,2"/>
      <text x="${px(68).toFixed(2)}" y="${(py(wClY) + 3).toFixed(2)}" font-size="7.2" font-weight="700" fill="#15539e">C/L ${esc(toFrac16(m.clX))} (${isEs ? 'SIN ALTOS' : 'NO UPPERS'})</text>

      ${chasePlanSvg}

      <!-- Coupled South L-Run & East Fridge Context (24" deep base + 1.5" counter overhang + 12" optional East uppers dashed) -->
      <polygon points="${px(111).toFixed(2)},${py(126).toFixed(2)} ${px(147).toFixed(2)},${py(126).toFixed(2)} ${px(147).toFixed(2)},${py(90).toFixed(2)} ${px(123).toFixed(2)},${py(90).toFixed(2)} ${px(123).toFixed(2)},${py(102).toFixed(2)} ${px(111).toFixed(2)},${py(102).toFixed(2)}"
               fill="#eef2f6" stroke="#64748b" stroke-width="1.2"/>
      <rect x="${px(96).toFixed(2)}" y="${py(102).toFixed(2)}" width="${(15 * planScale).toFixed(2)}" height="${(24 * planScale).toFixed(2)}" fill="#eef2f6" stroke="#64748b" stroke-width="1.1"/>
      <rect x="${px(72).toFixed(2)}" y="${py(102).toFixed(2)}" width="${(24 * planScale).toFixed(2)}" height="${(24 * planScale).toFixed(2)}" fill="#ffffff" stroke="#64748b" stroke-width="1.1"/>
      <rect x="${px(42).toFixed(2)}" y="${py(102).toFixed(2)}" width="${(30 * planScale).toFixed(2)}" height="${(24 * planScale).toFixed(2)}" fill="#eef2f6" stroke="#64748b" stroke-width="1.1"/>
      <rect x="${px(35).toFixed(2)}" y="${py(102).toFixed(2)}" width="${(7 * planScale).toFixed(2)}" height="${(24 * planScale).toFixed(2)}" fill="#fffbeb" stroke="#d97706" stroke-width="1.1" stroke-dasharray="3,2"/>
      <text x="${px(84).toFixed(2)}" y="${py(116).toFixed(2)}" font-size="7.2" text-anchor="middle" fill="#475569">${isEs ? 'Tramo Sur (Tarja/Lavavajillas)' : 'South Run (Sink / DW)'}</text>

      <!-- East Fridge & Drawer Context + 12" optional uppers -->
      <rect x="${px(123).toFixed(2)}" y="${py(66).toFixed(2)}" width="${(24 * planScale).toFixed(2)}" height="${(24 * planScale).toFixed(2)}" fill="#eef2f6" stroke="#64748b" stroke-width="1.1"/>
      <rect x="${px(147 - 26.5625).toFixed(2)}" y="${py(38).toFixed(2)}" width="${(26.5625 * planScale).toFixed(2)}" height="${(28 * planScale).toFixed(2)}" fill="#ffffff" stroke="#64748b" stroke-width="1.3"/>
      <text x="${px(134).toFixed(2)}" y="${py(53).toFixed(2)}" font-size="6.8" text-anchor="middle" fill="#334155">HAIER</text>
      <rect x="${px(135).toFixed(2)}" y="${py(66).toFixed(2)}" width="${(12 * planScale).toFixed(2)}" height="${(60 * planScale).toFixed(2)}" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>

      <!-- Coupled Walkway Clear Check between West Step Corner and South Countertop Overhang -->
      <line x1="${px(44).toFixed(2)}" y1="${py(66.25).toFixed(2)}" x2="${px(44).toFixed(2)}" y2="${py(southCounterFrontY).toFixed(2)}" stroke="#b91c1c" stroke-width="1.3"/>
      <rect x="${(px(44) + 5).toFixed(2)}" y="${(py((66.25 + southCounterFrontY) / 2) - 8).toFixed(2)}" width="136" height="16" rx="2" fill="#fef2f2" stroke="#b91c1c" stroke-width="0.9"/>
      <text x="${(px(44) + 73).toFixed(2)}" y="${(py((66.25 + southCounterFrontY) / 2) + 3).toFixed(2)}" font-size="7.1" text-anchor="middle" font-weight="700" fill="#b91c1c">${esc(toFrac16(walkToSouthCounterIn))} ${isEs ? 'paso libre (c/ vuelo)' : 'clear walk (w/ overhang)'}</text>

      <!-- Wall Labels & Overall True-Scale Dimensions -->
      <text x="${px(89).toFixed(2)}" y="${(py(westTopY) - 10).toFixed(2)}" font-size="8.4" text-anchor="middle" font-weight="700" fill="#10202b">${isEs ? 'MURO NORTE (Abierto · 115-1/2")' : 'NORTH WALL (Open · 115-1/2")'}</text>
      <text x="${px(73.5).toFixed(2)}" y="${(py(126) + 20).toFixed(2)}" font-size="8.4" text-anchor="middle" font-weight="700" fill="#10202b">${isEs ? 'MURO SUR (147" interior · Tarja y Ventana)' : 'SOUTH WALL (147" inside · Sink & Window)'}</text>
      <text x="${(px(31.5) - 12).toFixed(2)}" y="${py(westTopY + m.wallW / 2).toFixed(2)}" font-size="8.2" text-anchor="middle" font-weight="700" fill="#15539e" transform="rotate(-90 ${(px(31.5) - 12).toFixed(1)},${py(westTopY + m.wallW / 2).toFixed(1)})">${isEs ? 'MURO OESTE' : 'WEST WALL'}: ${esc(toFrac16(m.wallW))}</text>

      <!-- Right Column: Compass + Coupled Corner Notes + Takeoff Summary -->
      <rect x="514" y="76" width="382" height="178" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.1"/>
      <text x="526" y="96" font-size="9.2" font-weight="700" fill="#10202b">${isEs ? 'BRÚJULA Y ESQUINAS COMPARTIDAS (scaleX = scaleY)' : 'COMPASS & COUPLED CORNERS (scaleX = scaleY)'}</text>
      <g transform="translate(816, 154)">
        <circle cx="0" cy="0" r="36" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
        <polygon points="0,-28 6,-6 0,-11 -6,-6" fill="#10202b"/>
        <polygon points="0,28 6,6 0,11 -6,6" fill="#94a3b8"/>
        <polygon points="28,0 6,6 11,0 6,-6" fill="#94a3b8"/>
        <polygon points="-28,0 -6,6 -11,0 -6,-6" fill="#15539e"/>
        <text x="0" y="-39" font-size="9.5" text-anchor="middle" font-weight="700" fill="#10202b">N</text>
        <text x="0" y="47" font-size="8.5" text-anchor="middle" font-weight="700" fill="#475569">S</text>
        <text x="44" y="3" font-size="8.5" text-anchor="middle" font-weight="700" fill="#475569">E</text>
        <rect x="-56" y="-8" width="16" height="15" rx="2" fill="#15539e"/>
        <text x="-48" y="3" font-size="8.5" text-anchor="middle" font-weight="700" fill="#ffffff">W</text>
      </g>
      <text x="526" y="122" font-size="8.0" font-weight="700" fill="#15539e">• ${isEs ? 'Esquina Sur Escalonada = 0" Muro Oeste' : 'South Step Corner = 0" West Wall Origin'}</text>
      <text x="526" y="140" font-size="7.7" fill="#334155">• ${isEs ? 'Gabinetes bajos: 24" prof. · Estufa Viking: 28-1/16"' : 'Base cabinets: 24" deep · Viking range: 28-1/16" nose'}</text>
      <text x="526" y="158" font-size="7.7" fill="#334155">• ${isEs ? 'Campana Zephyr: 19-7/16" prof. · SIN gabinetes altos' : 'Zephyr hood: 19-7/16" deep · NO wall uppers'}</text>
      <text x="526" y="176" font-size="7.7" fill="#334155">• ${isEs ? 'Paso libre a cubierta sur:' : 'Clear walk to South counter:'} ${esc(toFrac16(walkToSouthCounterIn))}</text>
      <text x="526" y="198" font-size="7.7" font-weight="700" fill="#2f4f42">• ${isEs ? 'Ver Planta Completa de Cocina para editar Tramo Sur/Este' : 'Open Full Kitchen Floor Plan to edit South/East runs'}</text>

      <!-- Live Materials Takeoff Summary Box -->
      <rect x="514" y="268" width="382" height="176" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1.1"/>
      <rect x="514" y="268" width="382" height="22" rx="4" fill="#e8f1fb"/>
      <text x="526" y="283" font-size="8.8" font-weight="700" fill="#15539e">${esc(S.callouts_title)} (${isEs ? 'SIN PRECIOS' : 'ZERO PRICES'})</text>
      <text x="526" y="308" font-size="8.2" font-weight="700" fill="#10202b">${isEs ? 'Azulejo Muro Estufa' : 'Statement Wall Tile'}: ${tk.tile_net_sqft} net → ${tk.tile_gross_sqft} sq ft (+${tk.waste_pct}%)</text>
      <text x="526" y="326" font-size="8.0" fill="#334155">HardieBacker 0.42" (3'×5'): ${tk.backer_sheets_3x5} ${isEs ? 'hojas' : 'sheets'} · ${tk.shim_strips_count} ${isEs ? 'calzas' : 'shims'} (${tk.shim_total_lf} LF)</text>
      <text x="526" y="344" font-size="8.0" fill="#334155">${isEs ? 'Refuerzo Madera' : 'Solid Wood Blocking'}: ${tk.blocking_total_lf} LF (${tk.blocking_8ft_sticks} × 8' ${isEs ? 'piezas' : 'pcs'})</text>
      <text x="526" y="362" font-size="8.0" fill="#334155">${isEs ? 'Moldura Original' : 'Existing Original Trim'}: ${isEs ? 'Zoclo' : 'Base'} ${esc(toFrac16(state.existing_original_trim.baseboard_height_in.value))} · ${isEs ? 'Riel' : 'Rail'} ${esc(toFrac16(state.existing_original_trim.high_picture_rail_height_in.value))}</text>
      <text x="526" y="388" font-size="7.5" font-weight="700" fill="#92400e">${esc(tr.takeoff_notice)}</text>

      <!-- Bar Scale -->
      <text x="${barX}" y="${barY - 14}" font-size="8.2" font-weight="700" fill="#10202b">${esc(S.scale_lbl)}</text>
      <rect x="${barX}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 2).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 3).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <text x="${barX}" y="${barY + 14}" font-size="8.0" text-anchor="middle">0'</text>
      <text x="${(barX + ftPx).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">1'</text>
      <text x="${(barX + ftPx * 2).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">2'</text>
      <text x="${(barX + ftPx * 3).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">3'</text>
      <text x="${(barX + ftPx * 4).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">4'</text>

      <!-- Title Block -->
      <rect x="16" y="962" width="888" height="138" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <line x1="316" y1="962" x2="316" y2="1100" stroke="#10202b" stroke-width="1.1"/>
      <line x1="654" y1="962" x2="654" y2="1100" stroke="#10202b" stroke-width="1.1"/>
      <text x="28" y="988" font-size="11.2" font-weight="700" fill="#10202b">${esc(S.tb_proj)}</text>
      <text x="28" y="1008" font-size="9.0" fill="#334155">${esc(S.tb_city)}</text>
      <text x="28" y="1032" font-size="7.8" fill="#4b5c69">${esc(S.tb_src)}</text>
      <text x="28" y="1056" font-size="7.6" fill="#4b5c69">${isEs ? 'Vista Acoplada: Planta + Esquinas Sur/Norte' : 'Coupled View: Floor Plan + South/North Corners'}</text>
      <text x="330" y="990" font-size="12.0" font-weight="700" fill="#15539e">${esc(S.tb_title)}</text>
      <text x="330" y="1010" font-size="8.8" fill="#10202b">${esc(S.tb_equip)}</text>
      <text x="330" y="1034" font-size="8.5" font-weight="700" fill="#b91c1c">${esc(S.tb_status)}</text>
      <rect x="330" y="1050" width="310" height="34" rx="3" fill="${hasUnsyncedLocalEdits ? '#fffbeb' : '#e8f1fb'}" stroke="${hasUnsyncedLocalEdits ? '#d97706' : '#15539e'}" stroke-width="1"/>
      <text x="340" y="1064" font-size="7.6" font-weight="700" fill="#10202b">${isEs ? 'SELLO DE REVISIÓN:' : 'REVISION STAMP:'}</text>
      <text x="340" y="1077" font-size="8.0" font-weight="700" fill="${hasUnsyncedLocalEdits ? '#b45309' : '#15539e'}">${esc(stamp)}</text>
      <text x="668" y="990" font-size="9.2" font-weight="700" fill="#10202b">${esc(S.tb_scale)}</text>
      <text x="668" y="1012" font-size="8.4" fill="#334155">${esc(S.tb_datums)}</text>
      <text x="668" y="1034" font-size="8.4" fill="#334155">${isEs ? 'Espesor piso t' : 'Floor t'} = ${esc(toFrac16(m.floorT))}</text>
      <text x="668" y="1058" font-size="8.0" font-weight="700" fill="#10202b">${esc(S.tb_lang)}</text>

      <g id="ks4-pins-layer">${pinsMarkup}</g>
    `;
    syncCanvasSize();
  }

  /* ── Parametric SVG Renderer (viewBox 0 0 920 1120) ───────────────── */
  function renderSvg() {
    const svgEl = document.getElementById('ks4-svg');
    if (!svgEl) return;

    ensureStateDefaults(state);
    const m = computeDerived();
    const tk = computeTakeoff();
    const tr = I18N[currentLang];
    const S = tr.svg;
    const d = state.dimensions;
    const trim = state.existing_original_trim;

    if (activeView === 'coupled') {
      renderCoupledSvg(svgEl, m, tk, tr, S, d);
      return;
    }

    const ox = 152;
    const fy = 830;
    /* Strict Uniform True Scale: ONE scalar pxPerIn for both X and Y (scaleX === scaleY) */
    const pxPerIn = Math.min(332 / Math.max(m.wallW, 48), 614 / Math.max(m.ceilH, 84));
    lastScaleInfo = { view: 'elevation', scaleX: pxPerIn, scaleY: pxPerIn, uniform: true };
    const sx = (inches) => ox + inches * pxPerIn;
    const sy = (affIn) => fy - affIn * pxPerIn;

    const wTot = m.wallW * pxPerIn;
    const x0 = ox;
    const xEnd = ox + wTot;
    const x1 = sx(m.leftCab);
    const x2 = sx(m.leftCab + m.rangeW);
    const x3 = sx(m.leftCab + m.rangeW + m.rightCab);
    const xCl = sx(m.clX);

    const yCeil = sy(m.ceilH);
    const yCtr = sy(m.counterH);
    const yTrim = sy(m.counterH + 0.375);
    const yMin66 = sy(m.counterH + m.minClear);
    const yMax72 = sy(m.counterH + m.maxClear);
    const yFail64 = sy(m.counterH + 28.0);
    const yHoodBot = sy(m.hoodA);
    const yHoodTop = sy(m.hoodA + 10.75);
    const yLineB = sy(m.lineB);
    const yCoverTop = Math.max(yCeil, sy(m.coverTopSpec));
    const yLowBlkTop = sy(m.lowBlkMax);
    const yLowBlkBot = sy(m.lowBlkMin);
    const yUpBlkBot = sy(m.upBlkMin);
    const yUtilTop = sy(4.9375);
    const yUtilBot = sy(0.5625);

    /* Existing Original Trim reference heights (physically move on edit) */
    const railH = trim.high_picture_rail_height_in.value !== null ? Number(trim.high_picture_rail_height_in.value) : null;
    const baseH = trim.baseboard_height_in.value !== null ? Number(trim.baseboard_height_in.value) : null;
    const yOrigRail = railH !== null ? sy(railH) : null;
    const yOrigBase = baseH !== null ? sy(baseH) : null;

    const hoodW = state.appliances.hood.width_in * pxPerIn;
    const chimW = state.appliances.hood.chimney_width_in * pxPerIn;
    const ductW = state.appliances.hood.duct_diameter_in * pxPerIn;
    const soffitW = 10.625 * pxPerIn;
    const hoodX = xCl - hoodW / 2;
    const chimX = xCl - chimW / 2;
    const ductX = xCl - ductW / 2;
    const soffitX = xCl - soffitW / 2;

    /* Studs at 16" OC across actual wall width */
    const studs = [];
    for (let pos = 0; pos < m.wallW - 3; pos += 16) {
      studs.push(pos);
    }
    studs.push(Math.max(0, m.wallW - 1.5));

    const studsMarkup = studs.map((sp) => (
      `<rect x="${sx(sp).toFixed(2)}" y="${yCeil.toFixed(2)}" width="${(1.5 * pxPerIn).toFixed(2)}" height="${(fy - yCeil).toFixed(2)}" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.8"/>`
    )).join('');

    /* Lower & Upper Backing bands */
    const blkLowX1 = sx(Math.max(0, m.clX - 23));
    const blkLowX2 = sx(Math.min(m.wallW, m.clX + 23));
    const blkUpX1 = sx(Math.max(0, m.clX - 15));
    const blkUpX2 = sx(Math.min(m.wallW, m.clX + 15));

    /* Left Chase indicator (dashed provisional outline when null, snaps to solid true scale when measured) */
    let chaseMarkup = '';
    if (layers.clashes) {
      if (m.leftChase === null) {
        const indW = 5.5 * pxPerIn;
        chaseMarkup = `
          <rect data-elem="left-chase" data-provisional="true" x="${x0.toFixed(2)}" y="${yCeil.toFixed(2)}" width="${indW.toFixed(2)}" height="${(fy - yCeil).toFixed(2)}"
                fill="url(#amberHatch)" fill-opacity="0.30" stroke="#d97706" stroke-width="1.4" stroke-dasharray="5,3"/>
          <rect x="${(x0 + 4).toFixed(2)}" y="${(yCeil + 68).toFixed(2)}" width="174" height="26" rx="3" fill="#fffbeb" stroke="#d97706" stroke-width="1"/>
          <text x="${(x0 + 10).toFixed(2)}" y="${(yCeil + 79).toFixed(2)}" font-size="6.9" font-weight="700" fill="#92400e">${esc(S.left_chase_null)}</text>
          <text x="${(x0 + 10).toFixed(2)}" y="${(yCeil + 89.5).toFixed(2)}" font-size="6.3" fill="#92400e">${esc(S.left_chase_prov)}</text>`;
      } else if (m.leftChase > 0) {
        const chW = Math.min(m.leftChase, m.wallW * 0.4) * pxPerIn;
        chaseMarkup = `
          <rect data-elem="left-chase" data-provisional="false" x="${x0.toFixed(2)}" y="${yCeil.toFixed(2)}" width="${chW.toFixed(2)}" height="${(fy - yCeil).toFixed(2)}"
                fill="url(#amberHatch)" fill-opacity="0.42" stroke="#b45309" stroke-width="1.6"/>
          <rect x="${(x0 + 4).toFixed(2)}" y="${(yCeil + 68).toFixed(2)}" width="116" height="24" rx="3" fill="#fffbeb" stroke="#b45309" stroke-width="1"/>
          <text x="${(x0 + 10).toFixed(2)}" y="${(yCeil + 79).toFixed(2)}" font-size="7.4" font-weight="700" fill="#78350f">${esc(S.left_chase_val)}: ${esc(toFrac16(m.leftChase))}</text>
          <text x="${(x0 + 10).toFixed(2)}" y="${(yCeil + 89).toFixed(2)}" font-size="6.4" fill="#92400e">[${esc(d.left_chase_width_in.measure_boundary)}]</text>`;
      }
    }

    /* Existing Original Trim reference overlays (strictly separate from proposed new trim) */
    const origTrimMarkup = `
      ${yOrigRail !== null && yOrigRail > yCeil + 8 && yOrigRail < fy - 20 ? `
        <line data-elem="picture-rail" x1="${x0.toFixed(2)}" y1="${yOrigRail.toFixed(2)}" x2="${xEnd.toFixed(2)}" y2="${yOrigRail.toFixed(2)}"
              stroke="#64748b" stroke-width="1.0" stroke-dasharray="4,4"/>
        <rect x="${(x0 + 6).toFixed(2)}" y="${(yOrigRail - 13).toFixed(2)}" width="116" height="11" rx="2" fill="#f8fafc" fill-opacity="0.95" stroke="#94a3b8" stroke-width="0.7"/>
        <text x="${(x0 + 64).toFixed(2)}" y="${(yOrigRail - 5).toFixed(2)}" font-size="6.2" text-anchor="middle" font-weight="700" fill="#475569">${esc(S.orig_rail_lbl)}: ${esc(toFrac16(railH))}</text>
      ` : ''}
      ${yOrigBase !== null && yOrigBase < fy - 4 ? `
        <line data-elem="orig-baseboard" x1="${x0.toFixed(2)}" y1="${yOrigBase.toFixed(2)}" x2="${xEnd.toFixed(2)}" y2="${yOrigBase.toFixed(2)}" stroke="#64748b" stroke-width="0.9" stroke-dasharray="3,3"/>
        <rect x="${(xEnd - 82).toFixed(2)}" y="${(yOrigBase - 12).toFixed(2)}" width="78" height="10" rx="2" fill="#f8fafc" fill-opacity="0.94" stroke="#94a3b8" stroke-width="0.6"/>
        <text x="${(xEnd - 43).toFixed(2)}" y="${(yOrigBase - 4.5).toFixed(2)}" font-size="6.0" text-anchor="middle" font-weight="700" fill="#475569">${esc(S.orig_base_lbl)} ${esc(toFrac16(baseH))}</text>
      ` : ''}
    `;

    /* Framing & Backing layer */
    const framingMarkup = layers.framing ? `
      <g id="layer-framing">
        ${studsMarkup}
        <!-- Upper Backing 104"-Ceil -->
        <rect x="${blkUpX1.toFixed(2)}" y="${yCeil.toFixed(2)}" width="${(blkUpX2 - blkUpX1).toFixed(2)}" height="${(yUpBlkBot - yCeil).toFixed(2)}"
              fill="url(#woodHatch)" fill-opacity="0.42" stroke="#8f4a16" stroke-width="1.4"/>
        <!-- Lower Backing 68"-86" -->
        <rect x="${blkLowX1.toFixed(2)}" y="${yLowBlkTop.toFixed(2)}" width="${(blkLowX2 - blkLowX1).toFixed(2)}" height="${(yLowBlkBot - yLowBlkTop).toFixed(2)}"
              fill="url(#woodHatch)" fill-opacity="0.42" stroke="#8f4a16" stroke-width="1.5"/>
        <!-- 36" Backer Seam -->
        <line x1="${x0.toFixed(2)}" y1="${yCtr.toFixed(2)}" x2="${xEnd.toFixed(2)}" y2="${yCtr.toFixed(2)}" stroke="#0284c7" stroke-width="1.1" stroke-dasharray="6,3"/>
        ${origTrimMarkup}
      </g>` : origTrimMarkup;

    /* Ceiling gap visual based on options.ceiling_gap_solution */
    const gapMode = state.options.ceiling_gap_solution;
    const isEs = currentLang === 'es';
    let ceilGapSvg = '';
    if (yCoverTop > yCeil + 1) {
      if (gapMode === 'option_a_soffit') {
        ceilGapSvg = `
          <rect x="${soffitX.toFixed(2)}" y="${yCeil.toFixed(2)}" width="${soffitW.toFixed(2)}" height="${(yCoverTop - yCeil + 6).toFixed(2)}"
                fill="url(#soffitDash)" fill-opacity="0.48" stroke="#15539e" stroke-width="1.6"/>
          <rect x="${(xCl - 58).toFixed(2)}" y="${((yCeil + yCoverTop) / 2 - 7).toFixed(2)}" width="116" height="14" rx="2" fill="#ffffff" fill-opacity="0.93" stroke="#15539e" stroke-width="0.8"/>
          <text x="${xCl.toFixed(2)}" y="${((yCeil + yCoverTop) / 2 + 3).toFixed(2)}" font-size="6.9" text-anchor="middle" font-weight="700" fill="#15539e">${isEs ? 'OPC A: CAJILLO' : 'OPT A: SOFFIT'} (${esc(toFrac16(m.gapMax))})</text>`;
      } else if (gapMode === 'option_b_ext_z1c00sa') {
        ceilGapSvg = `
          <rect x="${chimX.toFixed(2)}" y="${yCeil.toFixed(2)}" width="${chimW.toFixed(2)}" height="${(yCoverTop - yCeil).toFixed(2)}"
                fill="#cbd5e1" stroke="#10202b" stroke-width="1.4"/>
          <rect x="${(xCl - 56).toFixed(2)}" y="${((yCeil + yCoverTop) / 2 - 7).toFixed(2)}" width="112" height="14" rx="2" fill="#ffffff" fill-opacity="0.93" stroke="#10202b" stroke-width="0.8"/>
          <text x="${xCl.toFixed(2)}" y="${((yCeil + yCoverTop) / 2 + 3).toFixed(2)}" font-size="6.9" text-anchor="middle" font-weight="700" fill="#10202b">${isEs ? 'OPC B: EXT. Z1C-00SA' : 'OPT B: Z1C-00SA EXT'}</text>`;
      } else {
        ceilGapSvg = `
          <rect x="${soffitX.toFixed(2)}" y="${yCeil.toFixed(2)}" width="${soffitW.toFixed(2)}" height="${(yCoverTop - yCeil).toFixed(2)}"
                fill="#fffbeb" fill-opacity="0.72" stroke="#d97706" stroke-width="1.2" stroke-dasharray="4,3"/>
          <rect x="${(xCl - 66).toFixed(2)}" y="${((yCeil + yCoverTop) / 2 - 7).toFixed(2)}" width="132" height="14" rx="2" fill="#ffffff" fill-opacity="0.94" stroke="#d97706" stroke-width="0.8"/>
          <text x="${xCl.toFixed(2)}" y="${((yCeil + yCoverTop) / 2 + 3).toFixed(2)}" font-size="6.8" text-anchor="middle" font-weight="700" fill="#b45309">${isEs ? 'CLARO' : 'GAP'} ${esc(toFrac16(m.gapMin))}–${esc(toFrac16(m.gapMax))} (${isEs ? 'ABIERTO' : 'OPEN'})</text>`;
      }
    }

    /* Rear trim visual (1" island trim vs 8" high backguard) */
    const is8inBackguard = state.options.rear_trim === 'backguard_8in';
    const yBackguardTop = sy(m.counterH + (is8inBackguard ? 8.0 : 1.0));
    const backguardSvg = is8inBackguard
      ? `<rect x="${x1.toFixed(2)}" y="${yBackguardTop.toFixed(2)}" width="${(m.rangeW * pxPerIn).toFixed(2)}" height="${(yTrim - yBackguardTop).toFixed(2)}" fill="#e2e8f0" stroke="#2f4f42" stroke-width="1.5"/>
         <text x="${xCl.toFixed(2)}" y="${((yBackguardTop + yTrim) / 2 + 3).toFixed(2)}" font-size="7.1" text-anchor="middle" font-weight="700" fill="#2f4f42">${isEs ? 'COPETE 8" + 3/4" = 0" ATRÁS OK' : '8" BACKGUARD + 3/4" = 0" REAR OK'}</text>`
      : `<rect x="${x1.toFixed(2)}" y="${yBackguardTop.toFixed(2)}" width="${(m.rangeW * pxPerIn).toFixed(2)}" height="${(yTrim - yBackguardTop).toFixed(2)}" fill="#fecaca" stroke="#b91c1c" stroke-width="1.3"/>
         <rect x="${(xCl - 78).toFixed(2)}" y="${(yBackguardTop - 16).toFixed(2)}" width="156" height="13" rx="2" fill="#fef2f2" stroke="#b91c1c" stroke-width="0.9"/>
         <text x="${xCl.toFixed(2)}" y="${(yBackguardTop - 7).toFixed(2)}" font-size="6.7" text-anchor="middle" font-weight="700" fill="#b91c1c">${isEs ? 'REMATE 1" = 6" MÍN. ATRÁS' : '1" TRIM = 6" REAR MIN'}</text>`;

    /* Appliances & Cabinetry layer (strict scaleX === scaleY: 18" base : 30" range = 3:5, 36" H : 18" W = 2:1) */
    const hoodStroke = m.vikingPass ? '#10202b' : '#b91c1c';
    const hoodFill = m.vikingPass ? '#cbd5e1' : '#fecaca';
    const scrL = sx(m.clX - 4.921875);
    const scrR = sx(m.clX + 4.921875);

    const appliancesMarkup = layers.appliances ? `
      <g id="layer-appliances">
        <!-- Valid Viking 30"-36" Mount Band -->
        <rect x="${x0.toFixed(2)}" y="${yMax72.toFixed(2)}" width="${wTot.toFixed(2)}" height="${(yMin66 - yMax72).toFixed(2)}"
              fill="#dbeafe" fill-opacity="0.48" stroke="#15539e" stroke-width="0.9" stroke-dasharray="4,3"/>
        <!-- 64" FAIL warning line -->
        <line x1="${x0.toFixed(2)}" y1="${yFail64.toFixed(2)}" x2="${xEnd.toFixed(2)}" y2="${yFail64.toFixed(2)}"
              stroke="#b91c1c" stroke-width="1.0" stroke-dasharray="3,3"/>
        <rect x="${(xEnd - 176).toFixed(2)}" y="${(yFail64 + 2).toFixed(2)}" width="172" height="12" rx="2" fill="#fef2f2" fill-opacity="0.95"/>
        <text x="${(xEnd - 90).toFixed(2)}" y="${(yFail64 + 10.5).toFixed(2)}" font-size="6.6" text-anchor="middle" font-weight="700" fill="#b91c1c">${esc(S.fail64_line)}</text>

        <!-- Stock Telescoping Chimney Cover + Ceiling Gap Solution -->
        ${ceilGapSvg}
        <rect x="${chimX.toFixed(2)}" y="${yCoverTop.toFixed(2)}" width="${chimW.toFixed(2)}" height="${Math.max(8, yHoodTop - yCoverTop).toFixed(2)}"
              fill="#e2e8f0" stroke="#10202b" stroke-width="1.4"/>

        <!-- Zephyr Savona ZSA-E30AS Hood Canopy -->
        <polygon data-elem="hood-canopy" points="${chimX.toFixed(2)},${yHoodTop.toFixed(2)} ${(chimX + chimW).toFixed(2)},${yHoodTop.toFixed(2)} ${(hoodX + hoodW).toFixed(2)},${(yHoodBot - 12).toFixed(2)} ${(hoodX + hoodW).toFixed(2)},${yHoodBot.toFixed(2)} ${hoodX.toFixed(2)},${yHoodBot.toFixed(2)} ${hoodX.toFixed(2)},${(yHoodBot - 12).toFixed(2)}"
                 fill="${hoodFill}" stroke="${hoodStroke}" stroke-width="1.9"/>
        <rect x="${(xCl - 74).toFixed(2)}" y="${(yHoodBot - 24).toFixed(2)}" width="148" height="13" rx="2" fill="#ffffff" fill-opacity="0.95"/>
        <text x="${xCl.toFixed(2)}" y="${(yHoodBot - 14.5).toFixed(2)}" font-size="8.0" text-anchor="middle" font-weight="700" fill="${hoodStroke}">ZEPHYR ZSA-E30AS (${esc(toFrac16(m.hoodA))})</text>

        <!-- Essex Green Left & Right Base Cabinets (exact 18" W x 36" H = 1:2 at baseline) -->
        <rect data-elem="left-cab" x="${x0.toFixed(2)}" y="${yCtr.toFixed(2)}" width="${Math.max(4, x1 - x0).toFixed(2)}" height="${(fy - yCtr).toFixed(2)}" fill="#e6efe9" stroke="#2f4f42" stroke-width="1.8"/>
        <rect x="${x0.toFixed(2)}" y="${yCtr.toFixed(2)}" width="${Math.max(4, x1 - x0).toFixed(2)}" height="${(1.5 * pxPerIn).toFixed(2)}" fill="#94a3b8" stroke="#10202b" stroke-width="1.1"/>
        <text x="${((x0 + x1) / 2).toFixed(2)}" y="${((yCtr + fy) / 2 - 2).toFixed(2)}" font-size="8.6" text-anchor="middle" font-weight="700" fill="#2f4f42">${esc(toFrac16(m.leftCab))} ${esc(S.base_lbl)}</text>
        <text x="${((x0 + x1) / 2).toFixed(2)}" y="${((yCtr + fy) / 2 + 10).toFixed(2)}" font-size="7.4" text-anchor="middle" fill="#2f4f42">${esc(S.essex)}</text>

        <rect data-elem="right-cab" x="${x2.toFixed(2)}" y="${yCtr.toFixed(2)}" width="${Math.max(4, x3 - x2).toFixed(2)}" height="${(fy - yCtr).toFixed(2)}" fill="#e6efe9" stroke="#2f4f42" stroke-width="1.8"/>
        <rect x="${x2.toFixed(2)}" y="${yCtr.toFixed(2)}" width="${Math.max(4, x3 - x2).toFixed(2)}" height="${(1.5 * pxPerIn).toFixed(2)}" fill="#94a3b8" stroke="#10202b" stroke-width="1.1"/>
        <text x="${((x2 + x3) / 2).toFixed(2)}" y="${((yCtr + fy) / 2 - 2).toFixed(2)}" font-size="8.6" text-anchor="middle" font-weight="700" fill="#2f4f42">${esc(toFrac16(m.rightCab))} ${esc(S.base_lbl)}</text>
        <text x="${((x2 + x3) / 2).toFixed(2)}" y="${((yCtr + fy) / 2 + 10).toFixed(2)}" font-size="7.4" text-anchor="middle" fill="#2f4f42">${esc(S.essex)}</text>

        <!-- Viking VGCC5304BSS 30" Range + Rear Trim (exact 30" W vs 18" base = 5:3) -->
        <rect data-elem="range-bay" x="${x1.toFixed(2)}" y="${yTrim.toFixed(2)}" width="${(m.rangeW * pxPerIn).toFixed(2)}" height="${(fy - yTrim).toFixed(2)}" fill="#f1f5f9" stroke="#10202b" stroke-width="2.0"/>
        ${backguardSvg}
        <text x="${xCl.toFixed(2)}" y="${((yCtr + fy) / 2 - 12).toFixed(2)}" font-size="8.8" text-anchor="middle" font-weight="700" fill="#10202b">VIKING VGCC5304BSS</text>
        <text x="${xCl.toFixed(2)}" y="${((yCtr + fy) / 2 + 2).toFixed(2)}" font-size="7.7" text-anchor="middle" fill="#334155">${esc(S.range_lbl)} (29-7/8" W)</text>
        <text x="${xCl.toFixed(2)}" y="${((yCtr + fy) / 2 + 14).toFixed(2)}" font-size="7.2" text-anchor="middle" fill="#4b5c69">${esc(S.side_trim)}</text>
      </g>` : '';

    /* 6" Duct, Clear Ceiling Bay, W1/W2, Gas/120V Utility Zone, 1-Gang 2"x3" Box @ ~83"-86" (replaces 4x4 @ 100") */
    const y100 = sy(100.0);
    const y1Gang = sy(84.5);
    const x1Gang = xCl + 2.25 * pxPerIn;
    const mepMarkup = layers.mep ? `
      <g id="layer-mep">
        <rect x="${(xCl - 4.5 * pxPerIn).toFixed(2)}" y="${(yCeil - 16).toFixed(2)}" width="${(9.0 * pxPerIn).toFixed(2)}" height="16"
              fill="url(#ductBay)" stroke="#0284c7" stroke-width="1.2"/>
        <rect x="${ductX.toFixed(2)}" y="${(yCeil - 14).toFixed(2)}" width="${ductW.toFixed(2)}" height="${Math.max(12, yHoodTop - (yCeil - 14)).toFixed(2)}"
              fill="#e0f2fe" fill-opacity="0.52" stroke="#0369a1" stroke-width="1.4" stroke-dasharray="4,2"/>

        <rect x="${(x1Gang - 5).toFixed(2)}" y="${(y1Gang - 8).toFixed(2)}" width="11" height="16" rx="2" fill="#dcfce7" stroke="#15803d" stroke-width="1.5"/>
        <line x1="${(x1Gang + 6).toFixed(2)}" y1="${y1Gang.toFixed(2)}" x2="${(xEnd - 126).toFixed(2)}" y2="${y1Gang.toFixed(2)}" stroke="#15803d" stroke-width="0.9"/>
        <rect x="${(xEnd - 126).toFixed(2)}" y="${(y1Gang - 12).toFixed(2)}" width="122" height="23" rx="2" fill="#f0fdf4" stroke="#15803d" stroke-width="0.95"/>
        <text x="${(xEnd - 65).toFixed(2)}" y="${(y1Gang - 2).toFixed(2)}" font-size="6.4" text-anchor="middle" font-weight="700" fill="#166534">${isEs ? 'Caja 2"×3" (~83"–86")' : '1-Gang 2"×3" (~83"–86")'}</text>
        <text x="${(xEnd - 65).toFixed(2)}" y="${(y1Gang + 7.5).toFixed(2)}" font-size="5.9" text-anchor="middle" fill="#166534">${isEs ? 'Eje ±2-1/4" · ~1" salida' : 'C/L ±2-1/4" · ~1" proud'}</text>

        ${layers.clashes ? `
          <rect x="${(xCl + 3.2 * pxPerIn).toFixed(2)}" y="${(y100 - 8).toFixed(2)}" width="16" height="16" fill="#fee2e2" stroke="#b91c1c" stroke-width="1.5"/>
          <line x1="${(xCl + 3.2 * pxPerIn).toFixed(2)}" y1="${(y100 - 8).toFixed(2)}" x2="${(xCl + 3.2 * pxPerIn + 16).toFixed(2)}" y2="${(y100 + 8).toFixed(2)}" stroke="#b91c1c" stroke-width="1.4"/>
          <line x1="${(xCl + 3.2 * pxPerIn + 16).toFixed(2)}" y1="${(y100 - 8).toFixed(2)}" x2="${(xCl + 3.2 * pxPerIn).toFixed(2)}" y2="${(y100 + 8).toFixed(2)}" stroke="#b91c1c" stroke-width="1.4"/>
          <rect x="${(xCl + 6.8 * pxPerIn).toFixed(2)}" y="${(y100 - 13).toFixed(2)}" width="108" height="24" rx="2" fill="#fef2f2" stroke="#b91c1c" stroke-width="1"/>
          <text x="${(xCl + 6.8 * pxPerIn + 5).toFixed(2)}" y="${(y100 - 3).toFixed(2)}" font-size="7.0" font-weight="700" fill="#b91c1c">${esc(S.clash_ks7)}</text>
          <text x="${(xCl + 6.8 * pxPerIn + 5).toFixed(2)}" y="${(y100 + 7).toFixed(2)}" font-size="6.4" fill="#7f1d1d">${esc(S.clash_ks7_sub)}</text>
        ` : ''}

        <circle cx="${sx(m.w1X).toFixed(2)}" cy="${sy(m.counterH + 5).toFixed(2)}" r="6.2" fill="#ffffff" stroke="#10202b" stroke-width="1.3"/>
        <line x1="${(sx(m.w1X) - 2).toFixed(2)}" y1="${(sy(m.counterH + 5) - 3).toFixed(2)}" x2="${(sx(m.w1X) - 2).toFixed(2)}" y2="${(sy(m.counterH + 5) + 3).toFixed(2)}" stroke="#10202b" stroke-width="1.1"/>
        <line x1="${(sx(m.w1X) + 2).toFixed(2)}" y1="${(sy(m.counterH + 5) - 3).toFixed(2)}" x2="${(sx(m.w1X) + 2).toFixed(2)}" y2="${(sy(m.counterH + 5) + 3).toFixed(2)}" stroke="#10202b" stroke-width="1.1"/>
        <rect x="${(sx(m.w1X) - 23).toFixed(2)}" y="${(sy(m.counterH + 5) - 19).toFixed(2)}" width="46" height="11" rx="2" fill="#ffffff" fill-opacity="0.94"/>
        <text x="${sx(m.w1X).toFixed(2)}" y="${(sy(m.counterH + 5) - 11).toFixed(2)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#10202b">W1 (${esc(toFrac16(m.w1X))})</text>

        <circle cx="${sx(m.w2X).toFixed(2)}" cy="${sy(m.counterH + 5).toFixed(2)}" r="6.2" fill="#ffffff" stroke="#10202b" stroke-width="1.3"/>
        <line x1="${(sx(m.w2X) - 2).toFixed(2)}" y1="${(sy(m.counterH + 5) - 3).toFixed(2)}" x2="${(sx(m.w2X) - 2).toFixed(2)}" y2="${(sy(m.counterH + 5) + 3).toFixed(2)}" stroke="#10202b" stroke-width="1.1"/>
        <line x1="${(sx(m.w2X) + 2).toFixed(2)}" y1="${(sy(m.counterH + 5) - 3).toFixed(2)}" x2="${(sx(m.w2X) + 2).toFixed(2)}" y2="${(sy(m.counterH + 5) + 3).toFixed(2)}" stroke="#10202b" stroke-width="1.1"/>
        <rect x="${(sx(m.w2X) - 25).toFixed(2)}" y="${(sy(m.counterH + 5) - 19).toFixed(2)}" width="50" height="11" rx="2" fill="#ffffff" fill-opacity="0.94"/>
        <text x="${sx(m.w2X).toFixed(2)}" y="${(sy(m.counterH + 5) - 11).toFixed(2)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#10202b">W2 (${esc(toFrac16(m.w2X))})</text>

        <rect x="${(sx(m.antitipX) - 9).toFixed(2)}" y="${sy(11.5).toFixed(2)}" width="18" height="11" fill="#fef3c7" fill-opacity="0.88" stroke="#8f4a16" stroke-width="1.1" stroke-dasharray="2,2"/>
        <text x="${sx(m.antitipX).toFixed(2)}" y="${(sy(11.5) - 3).toFixed(2)}" font-size="6.4" text-anchor="middle" font-weight="700" fill="#78350f">${esc(S.antitip)}</text>

        <rect x="${(x1 + 10).toFixed(2)}" y="${yUtilTop.toFixed(2)}" width="${Math.max(20, (x2 - x1) - 20).toFixed(2)}" height="${Math.max(12, yUtilBot - yUtilTop).toFixed(2)}"
              fill="#fee2e2" fill-opacity="0.78" stroke="#b91c1c" stroke-width="1.4"/>
      </g>` : '';

    /* Left Dual-Height Axis with automatic vertical anti-overlap */
    const ffTag = isEs ? 'PT' : 'FF';
    const sfTag = isEs ? 'SP' : 'SF';
    const rawTicks = [
      { key: 'ceil', trueY: yCeil, aff: `${toFrac16(m.ceilH)} ${ffTag}`, sf: `${toFrac16(m.ceilH + m.floorT)} ${sfTag}`, color: '#10202b' },
      { key: 'upblk', trueY: yUpBlkBot, aff: `${toFrac16(m.upBlkMin)} ${ffTag}`, sf: `${toFrac16(m.upBlkMin + m.floorT)} ${sfTag}`, color: '#8f4a16' },
      { key: 'loblk_top', trueY: yLowBlkTop, aff: `${toFrac16(m.lowBlkMax)} ${ffTag}`, sf: `${toFrac16(m.lowBlkMax + m.floorT)} ${sfTag}`, color: '#8f4a16' },
      { key: 'loblk_bot', trueY: yLowBlkBot, aff: `${toFrac16(m.lowBlkMin)} ${ffTag}`, sf: `${toFrac16(m.lowBlkMin + m.floorT)} ${sfTag}`, color: '#8f4a16' },
      { key: 'hood', trueY: yHoodBot, aff: `A: ${toFrac16(m.hoodA)}`, sf: `${toFrac16(m.hoodA + m.floorT)} ${sfTag}`, color: m.vikingPass ? '#15539e' : '#b91c1c' },
      { key: 'ctr', trueY: yCtr, aff: `${toFrac16(m.counterH)} ${ffTag}`, sf: `${toFrac16(m.counterH + m.floorT)} ${sfTag}`, color: '#10202b' },
      { key: 'floor', trueY: fy, aff: `0" ${ffTag}`, sf: `${toFrac16(m.floorT)} ${sfTag}`, color: '#10202b' }
    ];
    const placedTicks = spreadTicks(rawTicks, 28);
    const axisMarkup = placedTicks.map((tkItem) => {
      const showAff = datumMode !== 'subfloor';
      const showSf = datumMode !== 'aff';
      const line1 = showAff ? tkItem.aff : tkItem.sf;
      const line2 = showAff && showSf ? `(${tkItem.sf})` : '';
      return `
        <line x1="126" y1="${tkItem.trueY.toFixed(2)}" x2="${(x0 - 4).toFixed(2)}" y2="${tkItem.trueY.toFixed(2)}" stroke="${tkItem.color}" stroke-width="0.9"/>
        <line x1="114" y1="${tkItem.labelY.toFixed(2)}" x2="126" y2="${tkItem.trueY.toFixed(2)}" stroke="${tkItem.color}" stroke-width="0.8"/>
        <text x="110" y="${(tkItem.labelY + (line2 ? -1 : 3)).toFixed(2)}" font-size="8.0" text-anchor="end" font-weight="700" fill="${tkItem.color}">${esc(line1)}</text>
        ${line2 ? `<text x="110" y="${(tkItem.labelY + 9).toFixed(2)}" font-size="7.1" text-anchor="end" fill="#4b5c69">${esc(line2)}</text>` : ''}`;
    }).join('');

    const pinsMarkup = buildPinsSvg();

    /* True-scale mini Key Plan inset (strict scaleX === scaleY = 0.86 px/in) */
    const kpS = 0.86;
    const kpOx = 532;
    const kpOy = 104;
    const kpx = (v) => (kpOx + v * kpS).toFixed(1);
    const kpy = (v) => (kpOy + v * kpS).toFixed(1);

    /* Dynamic bar scale length for 1 foot (12 in) */
    const ftPx = 12 * pxPerIn;
    const barX = 526;
    const barY = 918;

    /* Live Callout values for Right Box B */
    const passColor = m.vikingPass ? '#2f4f42' : '#b91c1c';
    const passBg = m.vikingPass ? '#e6efe9' : '#fef2f2';
    const clearText = m.vikingPass
      ? `${toFrac16(m.clearance)} (${isEs ? 'CUMPLE 30"–36"' : 'PASS 30"–36"'})`
      : `${toFrac16(m.clearance)} (${isEs ? 'FALLA por' : 'FAILS by'} ${toFrac16(m.vikingDelta)})`;

    const gapChoiceLbl = gapMode === 'option_a_soffit'
      ? (isEs ? 'Opc. A Cajillo' : 'Opt A Soffit')
      : gapMode === 'option_b_ext_z1c00sa'
        ? (isEs ? 'Opc. B Z1C-00SA' : 'Opt B Z1C-00SA')
        : (isEs ? 'ABIERTO' : 'OPEN CHOICE');

    const rearTrimShort = is8inBackguard
      ? (isEs ? 'Copete 8" + 3/4" = 0" atrás OK' : '8" Backguard + 3/4" = 0" rear OK')
      : (isEs ? 'Remate 1" = 6" atrás mín.' : '1" Trim = 6" rear min');

    const scribeStatus = m.scribe < 0
      ? (isEs ? `EXCEDE ${toFrac16(Math.abs(m.scribe))}!` : `OVERFLOW ${toFrac16(Math.abs(m.scribe))}!`)
      : `+${toFrac16(m.scribe)} ${isEs ? 'ajuste' : 'scribe'}`;

    const stamp = computeRevisionStamp();

    svgEl.innerHTML = `
      <defs>
        <pattern id="tileGrid" width="14" height="9.5" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 9.5" fill="none" stroke="#e2e8f0" stroke-width="0.7"/>
        </pattern>
        <pattern id="woodHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#8f4a16" stroke-width="1.2"/>
        </pattern>
        <pattern id="ductBay" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#0284c7" stroke-width="0.9"/>
        </pattern>
        <pattern id="soffitDash" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#15539e" stroke-width="1.3"/>
        </pattern>
        <pattern id="amberHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#d97706" stroke-width="1.1"/>
        </pattern>
      </defs>

      <!-- Outer Architectural Border -->
      <rect x="10" y="10" width="900" height="1100" fill="#ffffff" stroke="#10202b" stroke-width="1.8"/>

      <!-- Sheet Header Banner -->
      <rect x="10" y="10" width="900" height="54" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <text x="24" y="32" font-size="13.5" font-weight="700" fill="#10202b">${esc(S.sheet_title)}</text>
      <text x="24" y="49" font-size="8.6" fill="#4b5c69">${esc(S.sheet_sub)}</text>

      <!-- Top-Right Live Validator & Revision Pill -->
      <rect x="606" y="18" width="290" height="38" rx="4" fill="${passBg}" stroke="${passColor}" stroke-width="1.3"/>
      <text x="751" y="33" font-size="9.5" text-anchor="middle" font-weight="700" fill="${passColor}">${esc(m.vikingPass ? S.pass_badge : S.fail_badge)} · ${esc(toFrac16(m.clearance))}</text>
      <text x="751" y="47" font-size="7.6" text-anchor="middle" fill="#334155">${esc(stamp)}</text>

      <!-- Wall Envelope + Tile Backdrop -->
      <rect data-elem="wall-outline" x="${x0.toFixed(2)}" y="${yCeil.toFixed(2)}" width="${wTot.toFixed(2)}" height="${(fy - yCeil).toFixed(2)}" fill="none" stroke="none"/>
      <rect x="${x0.toFixed(2)}" y="${yCeil.toFixed(2)}" width="${wTot.toFixed(2)}" height="${(yCtr - yCeil).toFixed(2)}" fill="url(#tileGrid)" stroke="#475569" stroke-width="0.9"/>
      <rect x="${x0.toFixed(2)}" y="${yCtr.toFixed(2)}" width="${wTot.toFixed(2)}" height="${(fy - yCtr).toFixed(2)}" fill="#ffffff" stroke="#475569" stroke-width="0.9"/>

      ${framingMarkup}
      ${chaseMarkup}
      ${appliancesMarkup}
      ${mepMarkup}
      ${layers.appliances ? `
        <!-- Top-Layer Line B Keyholes (+9-9/16" above Line A, always crisp over 6" duct) -->
        <circle cx="${scrL.toFixed(2)}" cy="${yLineB.toFixed(2)}" r="3.6" fill="#dc2626"/>
        <circle cx="${scrR.toFixed(2)}" cy="${yLineB.toFixed(2)}" r="3.6" fill="#dc2626"/>
        <line x1="${scrL.toFixed(2)}" y1="${yLineB.toFixed(2)}" x2="${scrR.toFixed(2)}" y2="${yLineB.toFixed(2)}" stroke="#dc2626" stroke-width="1.1"/>
        <rect x="${(xCl - 108).toFixed(2)}" y="${(yLineB - 18).toFixed(2)}" width="216" height="13" rx="2" fill="#ffffff" fill-opacity="0.97" stroke="#fca5a5" stroke-width="0.8"/>
        <text x="${xCl.toFixed(2)}" y="${(yLineB - 9).toFixed(2)}" font-size="6.7" text-anchor="middle" font-weight="700" fill="#dc2626">${esc(S.line_b_lbl)}: ${esc(toFrac16(m.lineB))}</text>
      ` : ''}

      <!-- Heavy Architectural Wall & Floor Cut Lines -->
      <line x1="${(x0 - 14).toFixed(2)}" y1="${yCeil.toFixed(2)}" x2="${(xEnd + 14).toFixed(2)}" y2="${yCeil.toFixed(2)}" stroke="#10202b" stroke-width="2.6"/>
      <line x1="${(x0 - 14).toFixed(2)}" y1="${fy.toFixed(2)}" x2="${(xEnd + 14).toFixed(2)}" y2="${fy.toFixed(2)}" stroke="#10202b" stroke-width="2.8"/>
      <line x1="${x0.toFixed(2)}" y1="${yCeil.toFixed(2)}" x2="${x0.toFixed(2)}" y2="${fy.toFixed(2)}" stroke="#10202b" stroke-width="2.4"/>
      <line x1="${xEnd.toFixed(2)}" y1="${yCeil.toFixed(2)}" x2="${xEnd.toFixed(2)}" y2="${fy.toFixed(2)}" stroke="#10202b" stroke-width="2.4"/>

      <!-- Centerline & Overhead Duct Bay Labels -->
      <line x1="${xCl.toFixed(2)}" y1="${(yCeil - 20).toFixed(2)}" x2="${xCl.toFixed(2)}" y2="${(fy + 16).toFixed(2)}" stroke="#15539e" stroke-width="1.1" stroke-dasharray="10,3,2,3"/>
      <text x="${xCl.toFixed(2)}" y="${(yCeil - 40).toFixed(2)}" font-size="8.2" text-anchor="middle" font-weight="700" fill="#0369a1">${esc(S.ceil_bay)}</text>
      <rect x="${(xCl - 134).toFixed(2)}" y="${(yCeil - 34).toFixed(2)}" width="268" height="13" rx="2" fill="#ffffff" fill-opacity="0.96"/>
      <text x="${xCl.toFixed(2)}" y="${(yCeil - 24.5).toFixed(2)}" font-size="8.4" text-anchor="middle" font-weight="700" fill="#15539e">C/L = ${esc(toFrac16(m.clX))} ${esc(S.cl_lbl)}</text>

      <!-- Left Dual-Height Axis -->
      <line x1="126" y1="${yCeil.toFixed(2)}" x2="126" y2="${fy.toFixed(2)}" stroke="#334155" stroke-width="1.1"/>
      ${axisMarkup}

      <!-- Bottom Cardinal Corners & Horizontal Dimension Strings -->
      <text x="${x0.toFixed(2)}" y="${(fy + 16).toFixed(2)}" font-size="8.2" font-weight="700" fill="#15539e">${esc(S.south_ref)}</text>
      <text x="${xEnd.toFixed(2)}" y="${(fy + 16).toFixed(2)}" font-size="8.2" text-anchor="end" font-weight="700" fill="#15539e">${esc(S.north_ref)}</text>

      <!-- Segment Dimension String -->
      <line x1="${x0.toFixed(2)}" y1="${(fy + 38).toFixed(2)}" x2="${xEnd.toFixed(2)}" y2="${(fy + 38).toFixed(2)}" stroke="#10202b" stroke-width="1.0"/>
      <line x1="${x0.toFixed(2)}" y1="${(fy + 22).toFixed(2)}" x2="${x0.toFixed(2)}" y2="${(fy + 72).toFixed(2)}" stroke="#10202b" stroke-width="0.9"/>
      <line x1="${x1.toFixed(2)}" y1="${(fy + 22).toFixed(2)}" x2="${x1.toFixed(2)}" y2="${(fy + 46).toFixed(2)}" stroke="#10202b" stroke-width="0.9"/>
      <line x1="${x2.toFixed(2)}" y1="${(fy + 22).toFixed(2)}" x2="${x2.toFixed(2)}" y2="${(fy + 46).toFixed(2)}" stroke="#10202b" stroke-width="0.9"/>
      <line x1="${x3.toFixed(2)}" y1="${(fy + 22).toFixed(2)}" x2="${x3.toFixed(2)}" y2="${(fy + 46).toFixed(2)}" stroke="#10202b" stroke-width="0.9"/>
      <line x1="${xEnd.toFixed(2)}" y1="${(fy + 22).toFixed(2)}" x2="${xEnd.toFixed(2)}" y2="${(fy + 72).toFixed(2)}" stroke="#10202b" stroke-width="0.9"/>

      <text x="${((x0 + x1) / 2).toFixed(2)}" y="${(fy + 34).toFixed(2)}" font-size="8.4" text-anchor="middle" font-weight="700">${esc(toFrac16(m.leftCab))}</text>
      <text x="${((x1 + x2) / 2).toFixed(2)}" y="${(fy + 34).toFixed(2)}" font-size="8.4" text-anchor="middle" font-weight="700">${esc(toFrac16(m.rangeW))} ${esc(S.range_lbl)}</text>
      <text x="${((x2 + x3) / 2).toFixed(2)}" y="${(fy + 34).toFixed(2)}" font-size="8.4" text-anchor="middle" font-weight="700">${esc(toFrac16(m.rightCab))}</text>

      <text x="${((x0 + x1) / 2).toFixed(2)}" y="${(fy + 49).toFixed(2)}" font-size="6.4" text-anchor="middle" fill="#4b5c69">[${esc(d.left_base_cab_in.measure_boundary)}]</text>
      <text x="${((x1 + x2) / 2).toFixed(2)}" y="${(fy + 49).toFixed(2)}" font-size="6.4" text-anchor="middle" fill="#4b5c69">[${esc(d.range_opening_in.measure_boundary)}]</text>
      <text x="${((x2 + x3) / 2).toFixed(2)}" y="${(fy + 49).toFixed(2)}" font-size="6.4" text-anchor="middle" fill="#4b5c69">[${esc(d.right_base_cab_in.measure_boundary)}]</text>

      <!-- Overall Wall Width String -->
      <line x1="${x0.toFixed(2)}" y1="${(fy + 64).toFixed(2)}" x2="${xEnd.toFixed(2)}" y2="${(fy + 64).toFixed(2)}" stroke="#10202b" stroke-width="1.3"/>
      <text x="${((x0 + xEnd) / 2).toFixed(2)}" y="${(fy + 78).toFixed(2)}" font-size="8.8" text-anchor="middle" font-weight="700" fill="${m.scribe < 0 ? '#b91c1c' : '#10202b'}">
        ${isEs ? 'MURO OESTE' : 'WEST WALL'}: ${esc(toFrac16(m.wallW))} [${esc(d.wall_width_in.measure_boundary)}] · ${esc(scribeStatus)}
      </text>
      <text x="${((x0 + xEnd) / 2).toFixed(2)}" y="${(fy + 93).toFixed(2)}" font-size="7.3" text-anchor="middle" font-weight="700" fill="#b91c1c">${esc(S.gas_zone)}</text>

      <!-- RIGHT ARCHITECTURAL INFO COLUMN (x = 514..896) -->

      <!-- Panel A: True-Scale Key Plan (scaleX === scaleY) + Mandatory N/S/E/W Compass Rose -->
      <rect x="514" y="76" width="382" height="178" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.1"/>
      <text x="526" y="94" font-size="8.8" font-weight="700" fill="#10202b">${esc(S.kp_title)}</text>

      <!-- True-Scale Kitchen Polygon Outline (147" x 126" at uniform 0.86 px/in) -->
      <polygon points="${kpx(31.5)},${kpy(0)} ${kpx(147)},${kpy(0)} ${kpx(147)},${kpy(126)} ${kpx(0)},${kpy(126)} ${kpx(0)},${kpy(66.25)} ${kpx(31.5)},${kpy(66.25)}"
               fill="#ffffff" stroke="#64748b" stroke-width="1.3"/>
      <line x1="${kpx(31.5)}" y1="${kpy(0)}" x2="${kpx(31.5)}" y2="${kpy(66.25)}" stroke="#15539e" stroke-width="4.5"/>
      <circle cx="${kpx(31.5)}" cy="${kpy(66.25)}" r="3.4" fill="#b91c1c"/>
      <text x="${(Number(kpx(31.5)) + 8).toFixed(1)}" y="${kpy(38)}" font-size="7.6" font-weight="700" fill="#15539e">${esc(S.kp_west)}</text>
      <text x="${kpx(90)}" y="${(Number(kpy(0)) + 12).toFixed(1)}" font-size="7.0" text-anchor="middle" fill="#475569">${esc(S.kp_n)}</text>
      <text x="${kpx(78)}" y="${(Number(kpy(126)) - 6).toFixed(1)}" font-size="7.0" text-anchor="middle" fill="#475569">${esc(S.kp_s)}</text>
      <text x="${(Number(kpx(147)) - 4).toFixed(1)}" y="${kpy(64)}" font-size="7.0" text-anchor="end" fill="#475569">${esc(S.kp_e)}</text>

      <!-- Crisp N/S/E/W Compass Rose -->
      <g transform="translate(816, 154)">
        <circle cx="0" cy="0" r="36" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="31" fill="none" stroke="#cbd5e1" stroke-width="0.7" stroke-dasharray="2,2"/>
        <polygon points="0,-28 6,-6 0,-11 -6,-6" fill="#10202b"/>
        <polygon points="0,28 6,6 0,11 -6,6" fill="#94a3b8"/>
        <polygon points="28,0 6,6 11,0 6,-6" fill="#94a3b8"/>
        <polygon points="-28,0 -6,6 -11,0 -6,-6" fill="#15539e"/>
        <text x="0" y="-39" font-size="9.5" text-anchor="middle" font-weight="700" fill="#10202b">N</text>
        <text x="0" y="47" font-size="8.5" text-anchor="middle" font-weight="700" fill="#475569">S</text>
        <text x="44" y="3" font-size="8.5" text-anchor="middle" font-weight="700" fill="#475569">E</text>
        <rect x="-56" y="-8" width="16" height="15" rx="2" fill="#15539e"/>
        <text x="-48" y="3" font-size="8.5" text-anchor="middle" font-weight="700" fill="#ffffff">W</text>
      </g>
      <text x="526" y="232" font-size="7.5" font-weight="700" fill="#10202b">${esc(S.kp_origin)}</text>
      <text x="526" y="245" font-size="7.4" fill="#b91c1c" font-weight="700">${isEs ? 'Espesor piso t' : 'Floor t'} = ${esc(toFrac16(m.floorT))} [${esc(d.floor_buildup_t_in.verified)}]</text>

      <!-- Panel B: Live Recalculated Measurements & Takeoff Summary -->
      <rect x="514" y="266" width="382" height="248" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1.1"/>
      <rect x="514" y="266" width="382" height="22" rx="4" fill="#f1f5f9"/>
      <text x="526" y="281" font-size="8.6" font-weight="700" fill="#15539e">${esc(S.callouts_title)}</text>

      <text x="526" y="304" font-size="8.0" font-weight="700" fill="${passColor}">1. ${isEs ? 'Libramiento Campana' : 'Hood Clearance'}: ${esc(clearText)}</text>
      <text x="526" y="316" font-size="7.2" fill="#4b5c69">${isEs ? 'Línea A' : 'Line A'} = ${esc(toFrac16(m.hoodA))} ${ffTag} (${esc(toFrac16(m.hoodA + m.floorT))} ${sfTag})</text>

      <text x="526" y="336" font-size="8.0" font-weight="700" fill="#dc2626">2. ${isEs ? 'Ojales Línea B (+9-9/16")' : 'Line B Hanger Screws (+9-9/16")'}: ${esc(toFrac16(m.lineB))} ${ffTag}</text>
      <text x="526" y="348" font-size="7.2" fill="#4b5c69">${isEs ? 'Sobre Subpiso (+t)' : 'Above Subfloor (+t)'}: ${esc(toFrac16(m.lineB + m.floorT))} · 9-27/32" ${isEs ? 'sep. en' : 'spread on'} C/L ${esc(toFrac16(m.clX))}</text>

      <text x="526" y="368" font-size="8.0" font-weight="700" fill="#8f4a16">3. ${isEs ? 'Refuerzos' : 'Backing Bands'}: ${esc(toFrac16(m.lowBlkMin))}–${esc(toFrac16(m.lowBlkMax))} &amp; ${esc(toFrac16(m.upBlkMin))}–${esc(toFrac16(m.ceilH))}</text>
      <text x="526" y="380" font-size="7.2" fill="#4b5c69">${isEs ? 'Subpiso (+t)' : 'Subfloor (+t)'}: ${esc(toFrac16(m.lowBlkMin + m.floorT))}–${esc(toFrac16(m.lowBlkMax + m.floorT))} &amp; ${esc(toFrac16(m.upBlkMin + m.floorT))}–${esc(toFrac16(m.ceilH + m.floorT))}</text>

      <text x="526" y="400" font-size="8.0" font-weight="700" fill="#15539e">4. ${isEs ? 'Claro a Techo' : 'Ceiling Gap'}: ${esc(toFrac16(m.gapMin))}–${esc(toFrac16(m.gapMax))} (${esc(gapChoiceLbl)})</text>
      <text x="526" y="412" font-size="7.2" fill="#4b5c69">${isEs ? 'Remate Viking' : 'Rear Trim'}: ${esc(rearTrimShort)} · ${isEs ? 'Cajón Izq.' : 'Left Chase'}: ${esc(m.leftChase === null ? tr.measure_on_site : toFrac16(m.leftChase))}</text>

      <line x1="526" y1="423" x2="884" y2="423" stroke="#cbd5e1" stroke-width="0.8"/>
      <text x="526" y="438" font-size="8.0" font-weight="700" fill="#2f4f42">5. ${isEs ? 'Azulejo Propuesto (Sin Precios)' : 'Proposed Wall Tile (Zero Prices)'}: ${tk.tile_net_sqft} → ${tk.tile_gross_sqft} sq ft (+${tk.waste_pct}%)</text>
      <text x="526" y="450" font-size="7.2" fill="#4b5c69">0.42" HardieBacker: ${tk.backer_sheets_3x5} ${isEs ? 'hojas 3×5' : 'sheets (3×5)'} · ${isEs ? 'Refuerzo' : 'Blocking'}: ${tk.blocking_total_lf} LF (${tk.blocking_8ft_sticks} × 8')</text>

      <text x="526" y="472" font-size="7.8" font-weight="700" fill="#475569">6. ${isEs ? 'Molduras Originales (Separadas)' : 'Existing Original Trim (Separate)'}: ${isEs ? 'Zoclo' : 'Base'} ${esc(toFrac16(baseH))} · ${isEs ? 'Riel' : 'Rail'} ${esc(toFrac16(railH))}</text>
      <text x="526" y="484" font-size="7.2" fill="#4b5c69">${isEs ? 'Chambrana puerta/ventana: MEDIR EN OBRA (nunca inventado)' : 'Door/window casing widths: MEASURE ON SITE (never fabricated)'}</text>

      <text x="526" y="504" font-size="7.3" font-weight="700" fill="#334155">${isEs ? 'Cubierta' : 'Counter'} ${esc(toFrac16(m.counterH))} ${ffTag} (${esc(toFrac16(m.counterH + m.floorT))} ${sfTag}) · W1=${esc(toFrac16(m.w1X))}, W2=${esc(toFrac16(m.w2X))}</text>

      <!-- Panel C: Symbols & Measure Boundaries -->
      <rect x="514" y="526" width="382" height="186" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.1"/>
      <text x="526" y="544" font-size="8.8" font-weight="700" fill="#10202b">${esc(S.legend_title)}</text>

      <rect x="526" y="554" width="18" height="11" fill="url(#woodHatch)" stroke="#8f4a16" stroke-width="1"/>
      <text x="552" y="563" font-size="7.5" fill="#10202b">${esc(S.leg_blk)}</text>

      <rect x="526" y="574" width="18" height="11" fill="#e0f2fe" stroke="#0369a1" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="552" y="583" font-size="7.5" fill="#10202b">${esc(S.leg_duct)}</text>

      <rect x="526" y="594" width="18" height="11" fill="#dbeafe" stroke="#15539e" stroke-width="0.9" stroke-dasharray="3,2"/>
      <text x="552" y="603" font-size="7.5" fill="#10202b">${esc(S.leg_valid)}</text>

      <rect x="526" y="614" width="18" height="11" fill="#fee2e2" stroke="#b91c1c" stroke-width="1.1"/>
      <text x="552" y="623" font-size="7.5" fill="#b91c1c" font-weight="700">${esc(S.leg_clash)}</text>

      <rect x="526" y="634" width="18" height="11" fill="#dcfce7" stroke="#15803d" stroke-width="1.1"/>
      <text x="552" y="643" font-size="7.5" fill="#166534">${esc(S.leg_canopy)}</text>

      <rect x="526" y="654" width="18" height="11" fill="url(#amberHatch)" stroke="#d97706" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="552" y="663" font-size="7.5" fill="#92400e" font-weight="700">${esc(S.leg_measure)}</text>

      <line x1="526" y1="678" x2="884" y2="678" stroke="#cbd5e1" stroke-width="0.8"/>
      <text x="526" y="694" font-size="7.1" font-family="monospace" fill="#334155">${esc(S.leg_bounds)}</text>

      <!-- Panel D: Holds & Pins Box -->
      <rect x="514" y="724" width="382" height="134" rx="4" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.1"/>
      <text x="526" y="742" font-size="8.6" font-weight="700" fill="#991b1b">${esc(S.holds_title)}</text>
      <text x="526" y="760" font-size="7.6" fill="#7f1d1d">${esc(S.holds_l1)}</text>
      <text x="526" y="776" font-size="7.6" fill="#7f1d1d">${esc(S.holds_l2)}</text>
      <text x="526" y="792" font-size="7.6" fill="#7f1d1d">${esc(S.holds_l3)}</text>
      <text x="526" y="808" font-size="7.6" fill="#7f1d1d">${esc(S.holds_l4)}</text>
      <line x1="526" y1="822" x2="884" y2="822" stroke="#fca5a5" stroke-width="0.8"/>
      <text x="526" y="841" font-size="7.8" font-weight="700" fill="#10202b">
        ${isEs ? 'Comentarios Adjuntos Activos' : 'Active Attached Callouts'}: ${(state.pins || []).length} · ${isEs ? 'Cambios Pendientes EOD' : 'Pending EOD Revisions'}: ${(tailnetState.pendingEod || []).length}
      </text>

      <!-- Dynamic True Bar Scale -->
      <text x="${barX}" y="${barY - 14}" font-size="8.2" font-weight="700" fill="#10202b">${esc(S.scale_lbl)}</text>
      <rect x="${barX}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 2).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 3).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <text x="${barX}" y="${barY + 14}" font-size="8.0" text-anchor="middle">0'</text>
      <text x="${(barX + ftPx).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">1'</text>
      <text x="${(barX + ftPx * 2).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">2'</text>
      <text x="${(barX + ftPx * 3).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">3'</text>
      <text x="${(barX + ftPx * 4).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">4'</text>

      <!-- Architectural Title Block -->
      <rect x="16" y="962" width="888" height="138" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <line x1="316" y1="962" x2="316" y2="1100" stroke="#10202b" stroke-width="1.1"/>
      <line x1="654" y1="962" x2="654" y2="1100" stroke="#10202b" stroke-width="1.1"/>

      <text x="28" y="988" font-size="11.2" font-weight="700" fill="#10202b">${esc(S.tb_proj)}</text>
      <text x="28" y="1008" font-size="9.0" fill="#334155">${esc(S.tb_city)}</text>
      <text x="28" y="1032" font-size="7.8" fill="#4b5c69">${esc(S.tb_src)}</text>
      <text x="28" y="1050" font-size="7.8" fill="#4b5c69">${isEs ? 'Hoja de Cuarto' : 'Room Spec'}: ${esc(state.governing_spec)}</text>
      <text x="28" y="1084" font-size="7.4" fill="#4b5c69">${isEs ? 'Guías Relacionadas: Muro Estufa + Planta de Cocina' : 'Companions: West Range Wall Guide + Kitchen Floor Plan'}</text>

      <text x="330" y="990" font-size="12.0" font-weight="700" fill="#15539e">${esc(S.tb_title)}</text>
      <text x="330" y="1010" font-size="8.8" fill="#10202b">${esc(S.tb_equip)}</text>
      <text x="330" y="1034" font-size="8.5" font-weight="700" fill="#b91c1c">${esc(S.tb_status)}</text>
      <rect x="330" y="1050" width="310" height="34" rx="3" fill="${hasUnsyncedLocalEdits ? '#fffbeb' : '#e8f1fb'}" stroke="${hasUnsyncedLocalEdits ? '#d97706' : '#15539e'}" stroke-width="1"/>
      <text x="340" y="1064" font-size="7.6" font-weight="700" fill="#10202b">${isEs ? 'SELLO DE REVISIÓN:' : 'REVISION STAMP:'}</text>
      <text x="340" y="1077" font-size="8.0" font-weight="700" fill="${hasUnsyncedLocalEdits ? '#b45309' : '#15539e'}">${esc(stamp)}</text>

      <text x="668" y="990" font-size="9.2" font-weight="700" fill="#10202b">${esc(S.tb_scale)}</text>
      <text x="668" y="1012" font-size="8.4" fill="#334155">${esc(S.tb_datums)}</text>
      <text x="668" y="1034" font-size="8.4" fill="#334155">${isEs ? 'Espesor piso t' : 'Floor t'} = ${esc(toFrac16(m.floorT))} (${esc(d.floor_buildup_t_in.verified)})</text>
      <text x="668" y="1058" font-size="8.0" font-weight="700" fill="#10202b">${esc(S.tb_lang)}</text>
      <text x="668" y="1084" font-size="7.4" fill="#4b5c69">${isEs ? 'Brújula: Muro OESTE · ← Sur 0" | Norte →' : 'Compass: WEST wall · ← South 0" | North →'}</text>

      <!-- Persistent Circle-to-Correct Attached Comment Callouts Layer -->
      <g id="ks4-pins-layer">${pinsMarkup}</g>
    `;

    syncCanvasSize();
  }

  /* ── Render Clashes, Live Mark Table, Pills, Forms & EOD Drawer ──── */
  function renderStatusPills() {
    const m = computeDerived();
    const tr = I18N[currentLang];

    const vikingPill = document.getElementById('viking-pill');
    if (vikingPill) {
      vikingPill.className = `pill ${m.vikingPass ? 'pill-pass' : 'pill-fail'}`;
      vikingPill.textContent = m.vikingPass
        ? `${currentLang === 'es' ? 'Viking 30"–36": CUMPLE' : 'Viking 30"–36": PASS'} (${toFrac16(m.clearance)})`
        : `${currentLang === 'es' ? 'Viking 30"–36": FALLA' : 'Viking 30"–36": FAIL'} (${toFrac16(m.clearance)} · ${currentLang === 'es' ? 'fuera por' : 'off by'} ${toFrac16(m.vikingDelta)})`;
    }

    const gapPill = document.getElementById('gap-pill');
    if (gapPill) {
      const opt = state.options.ceiling_gap_solution;
      gapPill.className = `pill ${opt === 'open_tbd' ? 'pill-warn' : 'pill-info'}`;
      const tag = opt === 'option_a_soffit' ? 'Opt A' : opt === 'option_b_ext_z1c00sa' ? 'Opt B' : (currentLang === 'es' ? 'ABIERTO' : 'OPEN');
      gapPill.textContent = `${currentLang === 'es' ? 'Claro Techo' : 'Ceiling Gap'}: ${toFrac16(m.gapMin)}–${toFrac16(m.gapMax)} (${tag})`;
    }

    const scribePill = document.getElementById('scribe-pill');
    if (scribePill) {
      scribePill.className = `pill ${m.scribe < 0 ? 'pill-fail' : 'pill-info'}`;
      scribePill.textContent = `${currentLang === 'es' ? 'Tramo' : 'Run'}: ${toFrac16(m.runSum)} / ${toFrac16(m.wallW)} (${m.scribe < 0 ? 'OVERFLOW ' + toFrac16(Math.abs(m.scribe)) : '+' + toFrac16(m.scribe)})`;
    }

    const revBadge = document.getElementById('rev-badge');
    if (revBadge) revBadge.textContent = state.base_rev || 'rev-20261120-001';

    const syncPill = document.getElementById('sync-stamp-pill');
    if (syncPill) {
      syncPill.className = `pill ${hasUnsyncedLocalEdits ? 'pill-warn' : 'pill-pass'}`;
      syncPill.textContent = computeRevisionStamp();
    }

    const tailBadge = document.getElementById('tailnet-badge');
    const modePill = document.getElementById('editor-mode-pill');
    const saveBtn = document.getElementById('btn-save-tailnet');
    const saveHint = document.getElementById('save-hint');
    if (tailnetState.verified) {
      if (tailBadge) {
        tailBadge.className = 'pill pill-pass';
        tailBadge.textContent = `${tr.tailnet_live}${tailnetState.user ? ' · ' + tailnetState.user : ''}`;
      }
      if (modePill) {
        modePill.className = 'pill pill-pass';
        modePill.textContent = tr.mode_live;
      }
      if (saveBtn) saveBtn.disabled = false;
      if (saveHint) saveHint.textContent = tr.save_hint_on;
    } else {
      if (tailBadge) {
        tailBadge.className = 'pill pill-neutral';
        tailBadge.textContent = tr.tailnet_off;
      }
      if (modePill) {
        modePill.className = 'pill pill-neutral';
        modePill.textContent = tr.mode_local;
      }
      if (saveBtn) saveBtn.disabled = true;
      if (saveHint) saveHint.textContent = tr.save_hint_off;
    }
  }

  function renderClashes() {
    const grid = document.getElementById('clashes-grid');
    if (!grid) return;
    /* Immutable flagged_clashes from baseline/data — NEVER auto-resolved */
    const list = (state.flagged_clashes && state.flagged_clashes.length)
      ? state.flagged_clashes
      : BASELINE_KS4_DATA.flagged_clashes;

    grid.innerHTML = list.map((c) => {
      const sevClass = c.severity === 'MEDIUM' ? 'sev-medium' : 'sev-high';
      const pillClass = c.severity === 'MEDIUM' ? 'pill-warn' : 'pill-fail';
      const title = currentLang === 'es' ? (c.title_es || c.id) : (c.title_en || c.id);
      const body = currentLang === 'es' ? (c.es || c.en) : (c.en || c.es);
      return `
        <article class="clash-card ${sevClass}" data-clash-id="${esc(c.id)}">
          <div class="clash-card-head">
            <span><strong>${esc(title)}</strong></span>
            <span class="pill ${pillClass}">${esc(c.severity)}</span>
          </div>
          <div>${esc(body)}</div>
        </article>`;
    }).join('');
  }

  function renderMarkTable() {
    const tbody = document.getElementById('marks-tbody');
    const tPill = document.getElementById('marks-t-pill');
    if (!tbody) return;

    const m = computeDerived();
    const d = state.dimensions;
    const es = currentLang === 'es';

    if (tPill) {
      tPill.className = `pill ${d.floor_buildup_t_in.verified === 'MEASURE_ON_SITE' ? 'pill-warn' : 'pill-pass'}`;
      tPill.textContent = `${es ? 'Espesor piso t' : 'Floor buildup t'} = ${toFrac16(m.floorT)} (${d.floor_buildup_t_in.verified})`;
    }

    const rows = [
      {
        name: es ? 'Franja Gas + 120V Trasera (Estufa Viking)' : 'Rear Gas + 120V Utility Band (Viking Range)',
        aff: '0-9/16" – 4-15/16"',
        sf: `${toFrac16(0.5625 + m.floorT)} – ${toFrac16(4.9375 + m.floorT)}`,
        horiz: `${toFrac16(m.leftCab)} – ${toFrac16(m.leftCab + m.rangeW)} (${es ? 'libre antivuelco' : 'clear of anti-tip'})`,
        boundary: 'aff / subfloor',
        prov: 'LOCKED'
      },
      {
        name: es ? 'Soporte Antivuelco de Estufa' : 'Range Anti-Tip Bracket',
        aff: es ? 'Medida (A) + 1/4"' : 'Meas (A) + 1/4"',
        sf: es ? '(A + 1/4") + t' : '(A + 1/4") + t',
        horiz: `${toFrac16(m.antitipX)} (${es ? '22-1/4" izq. borde der.' : '22-1/4" L of R edge'})`,
        boundary: 'aff',
        prov: 'MEASURE_ON_SITE',
        rowClass: 'row-measure'
      },
      {
        name: es ? 'Cubierta Terminada (remate lateral +3/8")' : 'Finished Countertop (side trim +3/8")',
        aff: toFrac16(m.counterH),
        sf: toFrac16(m.counterH + m.floorT),
        horiz: `0"–${toFrac16(m.leftCab)} & ${toFrac16(m.leftCab + m.rangeW)}–${toFrac16(m.runSum)}`,
        boundary: d.counter_height_in.measure_boundary,
        prov: d.counter_height_in.verified
      },
      {
        name: es ? 'Contactos Barra Izq. y Der. (20A, aro 1")' : 'Counter Outlets Left & Right (20A, 1" ring)',
        aff: `${toFrac16(m.counterH + 5)} / ${toFrac16(m.counterH + 8)}`,
        sf: `${toFrac16(m.counterH + 5 + m.floorT)} / ${toFrac16(m.counterH + 8 + m.floorT)}`,
        horiz: `W1 = ${toFrac16(m.w1X)}, W2 = ${toFrac16(m.w2X)}`,
        boundary: 'aff',
        prov: 'VERIFY_ON_SITE'
      },
      {
        name: es ? 'Línea A — Base Campana (30"–36" sobre estufa)' : 'Line A — Hood Bottom (30"–36" above cooktop)',
        aff: `${toFrac16(m.hoodA)} (${m.vikingPass ? (es ? 'CUMPLE' : 'PASS') : (es ? 'FALLA' : 'FAIL')})`,
        sf: toFrac16(m.hoodA + m.floorT),
        horiz: `C/L ${toFrac16(m.clX)} (${toFrac16(m.clX - 14.9375)}–${toFrac16(m.clX + 14.9375)})`,
        boundary: d.hood_bottom_aff_in.measure_boundary,
        prov: d.hood_bottom_aff_in.verified,
        rowClass: m.vikingPass ? '' : 'row-fail'
      },
      {
        name: es ? 'Línea B — Ojales Soporte (+9-9/16")' : 'Line B — Hanger Keyholes (+9-9/16")',
        aff: toFrac16(m.lineB),
        sf: toFrac16(m.lineB + m.floorT),
        horiz: `C/L ${toFrac16(m.clX)} (±4-59/64" · 9-27/32" ${es ? 'sep.' : 'spread'})`,
        boundary: 'aff',
        prov: 'DERIVED'
      },
      {
        name: es ? 'Refuerzo Inferior Campana (2× / triplay 3/4")' : 'Lower Hood Backing Band (2× / 3/4" ply)',
        aff: `${toFrac16(m.lowBlkMin)} – ${toFrac16(m.lowBlkMax)}`,
        sf: `${toFrac16(m.lowBlkMin + m.floorT)} – ${toFrac16(m.lowBlkMax + m.floorT)}`,
        horiz: `${es ? 'Centrado en' : 'Across'} C/L ${toFrac16(m.clX)} + 1 ${es ? 'claro L/R' : 'bay L/R'}`,
        boundary: d.lower_blocking_min_aff_in.measure_boundary,
        prov: d.lower_blocking_min_aff_in.verified
      },
      {
        name: es ? 'Refuerzo Superior Cubreducto (continuo)' : 'Upper Duct-Cover Backing (continuous)',
        aff: `${toFrac16(m.upBlkMin)} – ${toFrac16(m.ceilH)}`,
        sf: `${toFrac16(m.upBlkMin + m.floorT)} – ${toFrac16(m.ceilH + m.floorT)}`,
        horiz: `${es ? 'Continuo en' : 'Continuous across'} C/L ${toFrac16(m.clX)} + 1 ${es ? 'claro L/R' : 'bay L/R'}`,
        boundary: d.upper_blocking_min_aff_in.measure_boundary,
        prov: d.upper_blocking_min_aff_in.verified
      },
      {
        name: es ? 'Techo Cocina + Claro Ducto 8"–10"' : 'Kitchen Ceiling + 8"–10" Clear Duct Bay',
        aff: toFrac16(m.ceilH),
        sf: toFrac16(m.ceilH + m.floorT),
        horiz: `C/L ${toFrac16(m.clX)} (${es ? 'ducto rígido liso 6"' : '6" rigid smooth duct'})`,
        boundary: d.ceiling_height_in.measure_boundary,
        prov: d.ceiling_height_in.verified
      },
      {
        name: es ? 'Cajón Izquierdo Existente de Tuberías' : 'Existing Left Pipe/Flue Chase',
        aff: es ? 'Piso a techo' : 'Floor to ceiling',
        sf: es ? 'Piso a techo' : 'Floor to ceiling',
        horiz: m.leftChase === null ? (es ? 'MEDIR EN OBRA (0" Sur)' : 'MEASURE ON SITE (0" South)') : `0" – ${toFrac16(m.leftChase)}`,
        boundary: d.left_chase_width_in.measure_boundary,
        prov: d.left_chase_width_in.verified,
        rowClass: m.leftChase === null ? 'row-measure' : ''
      }
    ];

    tbody.innerHTML = rows.map((r) => `
      <tr class="${r.rowClass || ''}">
        <td><strong>${esc(r.name)}</strong></td>
        <td>${esc(r.aff)}</td>
        <td><strong>${esc(r.sf)}</strong></td>
        <td>${esc(r.horiz)}</td>
        <td><span class="boundary-tag">${esc(r.boundary)}</span> <span class="pill pill-neutral">${esc(r.prov)}</span></td>
      </tr>
    `).join('');
  }

  function renderTakeoff() {
    const grid = document.getElementById('takeoff-grid');
    const pill = document.getElementById('takeoff-waste-pill');
    if (!grid) return;

    const tk = computeTakeoff();
    const es = currentLang === 'es';
    if (pill) {
      pill.textContent = `${es ? 'Margen' : 'Waste Factor'}: +${tk.waste_pct}%`;
    }

    const boxLine = tk.tile_boxes_proposed !== null
      ? (es
        ? `<strong>${tk.tile_boxes_proposed} cajas propuestas</strong> (${tk.tile_box_sqft} pies²/caja)`
        : `<strong>${tk.tile_boxes_proposed} proposed boxes</strong> (${tk.tile_box_sqft} sq ft/box)`)
      : (es ? 'Ingresa pies²/caja arriba para calcular cajas' : 'Enter sq ft/box above to calculate cartons');

    const extraNote = tk.tile_soffit_extra_sqft > 0
      ? (es ? ` · +${tk.tile_soffit_extra_sqft} pies² cajillo` : ` · +${tk.tile_soffit_extra_sqft} sq ft soffit sides`)
      : '';
    const dedNote = tk.tile_chimney_deduct_sqft > 0
      ? (es ? ` · −${tk.tile_chimney_deduct_sqft} pies² tiro` : ` · −${tk.tile_chimney_deduct_sqft} sq ft chimney`)
      : '';

    grid.innerHTML = `
      <article class="takeoff-card card-primary">
        <div class="takeoff-card-title">${es ? 'Azulejo Muro de Estufa' : 'Statement Wall Tile'}</div>
        <div class="takeoff-card-big">${tk.tile_gross_sqft} sq ft</div>
        <div class="takeoff-card-sub">${es ? 'Neto' : 'Net'}: ${tk.tile_net_sqft} sq ft (+${tk.waste_pct}%)${extraNote}${dedNote}</div>
        <div class="takeoff-card-sub">${boxLine}</div>
      </article>

      <article class="takeoff-card">
        <div class="takeoff-card-title">${es ? 'Panel Cemento 0.42" + Calzas' : '0.42" HardieBacker + Shims'}</div>
        <div class="takeoff-card-big">${tk.backer_sheets_3x5} ${es ? 'hojas (3\'×5\')' : 'sheets (3\'×5\')'}</div>
        <div class="takeoff-card-sub">${es ? 'Neto' : 'Net'}: ${tk.backer_net_sqft} sq ft · ${es ? 'Bruto +10%' : 'Gross +10%'}: ${tk.backer_gross_sqft} sq ft</div>
        <div class="takeoff-card-sub">${es ? 'Calzas 3/16"' : '3/16" shims'}: ${tk.shim_strips_count} ${es ? 'tiras' : 'strips'} (${tk.shim_total_lf} LF)</div>
      </article>

      <article class="takeoff-card">
        <div class="takeoff-card-title">${es ? 'Refuerzo de Madera Sólida' : 'Solid Wood Blocking'}</div>
        <div class="takeoff-card-big">${tk.blocking_total_lf} LF (${tk.blocking_8ft_sticks} × 8')</div>
        <div class="takeoff-card-sub">${es ? 'Franjas 68"–86" y 104"–Techo (claro ducto 8"–10" libre)' : 'Bands 68"–86" & 104"–Ceil (8"–10" duct bay clear)'}</div>
        <div class="takeoff-card-sub">${es ? 'Alternativa: 1 hoja triplay 3/4" (4×8)' : 'Or 1 sheet 3/4" structural plywood (4×8)'}</div>
      </article>

      <article class="takeoff-card">
        <div class="takeoff-card-title">${es ? 'Sellador y Pintura Muro Bajo' : 'Primer & Lower Wall Paint'}</div>
        <div class="takeoff-card-big">${tk.primer_paint_gallons_min} gal ${es ? 'mín.' : 'min'}</div>
        <div class="takeoff-card-sub">${es ? 'Tablaroca bajo cubierta' : 'Lower drywall below 36"'}: ${tk.lower_drywall_sqft} sq ft</div>
        <div class="takeoff-card-sub">${es ? 'Sin precios · Verificar inventario antes de pedir' : 'Zero prices · Verify on-hand stock first'}</div>
      </article>
    `;
  }

  /* ── Attached Comment Callouts (Per-Comment Mic Dictation + Send to Agent) ── */
  function buildLocalFallbackAnswer(questionText) {
    const q = String(questionText || '').toLowerCase();
    const m = computeDerived();
    const es = currentLang === 'es';
    if (q.includes('hood') || q.includes('campana') || q.includes('height') || q.includes('altura')) {
      return es
        ? `Base de campana planeada: ${toFrac16(m.hoodA)} sobre piso terminado (${toFrac16(m.hoodA + m.floorT)} sobre subpiso). La estufa Viking exige 30"–36" libres sobre la cubierta (66"–72").`
        : `Planned hood bottom: ${toFrac16(m.hoodA)} above finished floor (${toFrac16(m.hoodA + m.floorT)} above subfloor). Viking requires 30"–36" above the cooktop (66"–72").`;
    }
    if (q.includes('tile') || q.includes('azulejo') || q.includes('backer') || q.includes('material')) {
      const tk = computeTakeoff();
      return es
        ? `Cálculo en vivo: ${tk.tile_net_sqft} pies² netos → ${tk.tile_gross_sqft} pies² brutos (+${tk.waste_pct}%) y ${tk.backer_sheets_3x5} hojas HardieBacker 0.42" (sin precios; verificar stock).`
        : `Live takeoff: ${tk.tile_net_sqft} sq ft net → ${tk.tile_gross_sqft} sq ft gross (+${tk.waste_pct}%) and ${tk.backer_sheets_3x5} sheets 0.42" HardieBacker (zero prices; verify stock).`;
    }
    return es
      ? 'Fuera de Tailnet: conéctate a Tailscale de Tisa para consultar al Agente Unidad 4 en vivo (:8791), o guarda el comentario en tu exportación local.'
      : 'Off-tailnet: connect to Tisa\'s Tailscale network to query the live Unit 4 Agent (:8791), or keep this note in your local export.';
  }

  async function sendPinToAgent(idx) {
    const pins = state.pins || [];
    const pin = pins[idx];
    if (!pin) return;
    const tr = I18N[currentLang];
    const es = currentLang === 'es';
    const text = (pin.note || '').trim();
    if (!text) {
      showToast(es ? 'Escribe o dicta un comentario antes de enviar.' : 'Enter or dictate a comment before sending.', 'error');
      return;
    }
    if (violatesPrivateFirewall(text)) {
      showToast(tr.firewall_err, 'error');
      return;
    }

    const mode = pin.mode || (pin.intent === 'ask_question' ? 'ask_question' : 'modify_plan');
    if (mode === 'ask_question') {
      try {
        const qUrl = `${voiceOrigin}/api/unit4/knowledge?q=${encodeURIComponent(text)}&room=kitchen-oven-range`;
        const res = await fetchJsonWithTimeout(qUrl, { method: 'GET' }, 4500);
        if (res.ok && res.data) {
          const answer = res.data.answer || res.data.summary || (Array.isArray(res.data.matches) && res.data.matches[0]?.snippet) || JSON.stringify(res.data).slice(0, 260);
          pin.agent_status = 'answered';
          pin.agent_reply = String(answer);
          renderSvg();
          renderPinsList();
          showToast(es ? `Comentario #${idx + 1} respondido por el Agente` : `Comment #${idx + 1} answered by Agent`, 'ok');
          return;
        }
      } catch (_) {
        /* graceful off-tailnet fallback below */
      }
      pin.agent_status = 'local_answer';
      pin.agent_reply = buildLocalFallbackAnswer(text);
      renderSvg();
      renderPinsList();
      showToast(es ? 'Respuesta local (fuera de Tailnet)' : 'Local spec note (Off-Tailnet)', 'ok');
      return;
    }

    /* Modify Plan mode -> apply parsed measurement locally + send to Tailnet :8444 override */
    const parsedCmd = parseSpokenFieldCommand(text);
    const patch = parsedCmd ? deepClone(parsedCmd) : {};
    patch.pin = deepClone(pin);
    patch.voice_note = text;
    if (parsedCmd) {
      applyPatchToLocalState(parsedCmd);
    }

    if (tailnetState.verified) {
      const ok = await saveOverrideToTailnet(patch, text);
      if (ok) {
        if (state.pins[idx]) {
          state.pins[idx].agent_status = 'sent_applied';
          state.pins[idx].agent_reply = es
            ? `Guardado en Tailnet (${lastSavedRevId || state.base_rev})`
            : `Saved to Tailnet (${lastSavedRevId || state.base_rev})`;
        }
        renderSvg();
        renderPinsList();
      }
    } else {
      pin.agent_status = 'local_only';
      pin.agent_reply = es
        ? 'Aplicado en vista previa local. Conéctate a Tailscale de Tisa para enviarlo en vivo (:8444).'
        : 'Applied in local preview only. Connect to Tisa\'s Tailscale network to send live (:8444).';
      hasUnsyncedLocalEdits = true;
      renderAll();
      showToast(es ? 'Guardado en vista local (sin Tailnet)' : 'Saved in local preview (Off-Tailnet)', 'ok');
    }
  }

  function renderPinsList() {
    const listEl = document.getElementById('pin-list');
    if (!listEl) return;
    const tr = I18N[currentLang];
    const es = currentLang === 'es';
    const pins = state.pins || [];
    if (!pins.length) {
      listEl.innerHTML = '';
      return;
    }
    listEl.innerHTML = pins.map((pin, idx) => {
      const mode = pin.mode || (pin.intent === 'ask_question' ? 'ask_question' : 'modify_plan');
      const statusPill = pin.agent_status === 'answered'
        ? `<span class="pill pill-pass">${es ? 'Respondido' : 'Answered'}</span>`
        : pin.agent_status === 'sent_applied'
          ? `<span class="pill pill-info">${es ? 'Enviado al Agente' : 'Sent to Agent'}</span>`
          : pin.agent_status === 'local_answer' || pin.agent_status === 'local_only'
            ? `<span class="pill pill-warn">${es ? 'Local · Sin Tailnet' : 'Local · Off-Tailnet'}</span>`
            : `<span class="pill pill-neutral">${es ? 'Borrador' : 'Draft'}</span>`;
      const cls = pin.agent_status === 'answered' ? 'pin-answered' : pin.agent_status === 'sent_applied' ? 'pin-sent' : '';
      return `
        <div class="pin-item ${cls}" data-pin-card="${idx}">
          <div class="eod-item-head">
            <strong>#${idx + 1} · ${esc(pin.author || 'Field')} (${Math.round((pin.cx || 0) * 100)}%, ${Math.round((pin.cy || 0) * 100)}%)</strong>
            ${statusPill}
          </div>
          <textarea class="pin-edit-box" data-pin-text="${idx}" rows="2" aria-label="Comment ${idx + 1}">${esc(pin.note || '')}</textarea>
          <div class="pin-actions-row">
            <select class="pin-mode-select" data-pin-mode="${idx}" aria-label="Action for comment ${idx + 1}">
              <option value="modify_plan" ${mode === 'modify_plan' ? 'selected' : ''}>${esc(tr.pin_mode_modify)}</option>
              <option value="ask_question" ${mode === 'ask_question' ? 'selected' : ''}>${esc(tr.pin_mode_question)}</option>
            </select>
            <button type="button" class="btn btn-sm" data-pin-mic="${idx}">&#127908; ${esc(tr.btn_pin_mic)}</button>
            <button type="button" class="btn btn-sm btn-primary" data-pin-send="${idx}">${esc(tr.btn_pin_send)}</button>
          </div>
          ${pin.agent_reply ? `<div class="pin-agent-answer ${pin.agent_status === 'local_only' || pin.agent_status === 'local_answer' ? 'answer-warn' : ''}">${esc(pin.agent_reply)}</div>` : ''}
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-pin-text]').forEach((ta) => {
      ta.addEventListener('input', () => {
        const i = Number(ta.getAttribute('data-pin-text'));
        if (state.pins[i]) {
          state.pins[i].note = ta.value;
          renderSvg();
        }
      });
    });
    listEl.querySelectorAll('[data-pin-mode]').forEach((sel) => {
      sel.addEventListener('change', () => {
        const i = Number(sel.getAttribute('data-pin-mode'));
        if (state.pins[i]) {
          state.pins[i].mode = sel.value;
          state.pins[i].intent = sel.value === 'ask_question' ? 'ask_question' : 'propose_edit';
          renderSvg();
        }
      });
    });
    listEl.querySelectorAll('[data-pin-mic]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-pin-mic'));
        toggleVoiceDictation(i);
      });
    });
    listEl.querySelectorAll('[data-pin-send]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-pin-send'));
        sendPinToAgent(i);
      });
    });
  }

  function renderEodDrawer() {
    const listEl = document.getElementById('eod-list');
    const countPill = document.getElementById('eod-count-pill');
    if (!listEl || !countPill) return;

    const tr = I18N[currentLang];
    const pending = tailnetState.pendingEod || [];
    const localCount = hasUnsyncedLocalEdits ? 1 : 0;
    const total = pending.length + localCount;
    countPill.textContent = `${total} ${currentLang === 'es' ? 'pend.' : 'pending'}`;
    countPill.className = `pill ${total > 0 ? 'pill-warn' : 'pill-pass'}`;

    const items = [];
    if (hasUnsyncedLocalEdits) {
      items.push(`
        <div class="eod-item">
          <div class="eod-item-head">
            <strong>${esc(tr.not_yet_synced)}</strong>
            <span class="pill pill-warn">LOCAL</span>
          </div>
          <div>${currentLang === 'es'
            ? 'Los cambios actuales solo están en vista previa local. Conéctate a Tailnet (:8444) y pulsa Guardar en Tailnet para enviarlos a revisión EOD.'
            : 'Current edits are local preview only. Connect to Tailnet (:8444) and tap Save Live to Tailnet to submit for EOD review.'}</div>
        </div>
      `);
    }

    pending.forEach((entry) => {
      const revId = entry.rev_id || entry.id || 'pending-rev';
      const author = entry.author || 'Field';
      const summary = entry.summary || entry.note_en || entry.note_es || JSON.stringify(entry.patch || {});
      items.push(`
        <div class="eod-item">
          <div class="eod-item-head">
            <strong><code>${esc(revId)}</code> · ${esc(author)}</strong>
            <span class="pill pill-warn">PENDING EOD</span>
          </div>
          <div>${esc(summary)}</div>
          <div class="eod-item-actions">
            <button type="button" class="btn btn-sm btn-essex" data-eod-action="accept" data-rev-id="${esc(revId)}" ${tailnetState.verified ? '' : 'disabled'}>${esc(tr.btn_accept)}</button>
            <button type="button" class="btn btn-sm btn-danger" data-eod-action="reject" data-rev-id="${esc(revId)}" ${tailnetState.verified ? '' : 'disabled'}>${esc(tr.btn_reject)}</button>
          </div>
        </div>
      `);
    });

    listEl.innerHTML = items.length ? items.join('') : `<p class="empty-note">${esc(tr.eod_empty)}</p>`;

    listEl.querySelectorAll('[data-eod-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        handleEodAction(btn.getAttribute('data-rev-id'), btn.getAttribute('data-eod-action'));
      });
    });
  }

  function populateBoundarySelects() {
    const ids = [
      'bnd-floor-t', 'bnd-wall-w', 'bnd-ceil-h', 'bnd-hood-aff',
      'bnd-left-chase', 'bnd-left-cab', 'bnd-right-cab', 'bnd-counter-h', 'bnd-range-w'
    ];
    ids.forEach((id) => {
      const sel = document.getElementById(id);
      if (!sel || sel.options.length > 0) return;
      BOUNDARY_OPTIONS.forEach((opt) => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        sel.appendChild(o);
      });
    });
  }

  function syncFormFromState() {
    populateBoundarySelects();
    const d = state.dimensions;
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v === null || v === undefined ? '' : String(v);
    };
    setVal('inp-floor-t', d.floor_buildup_t_in.value);
    setVal('bnd-floor-t', d.floor_buildup_t_in.measure_boundary);
    setVal('inp-wall-w', d.wall_width_in.value);
    setVal('bnd-wall-w', d.wall_width_in.measure_boundary);
    setVal('inp-ceil-h', d.ceiling_height_in.value);
    setVal('bnd-ceil-h', d.ceiling_height_in.measure_boundary);
    setVal('inp-hood-aff', d.hood_bottom_aff_in.value);
    setVal('bnd-hood-aff', d.hood_bottom_aff_in.measure_boundary);
    setVal('inp-left-chase', d.left_chase_width_in.value);
    setVal('bnd-left-chase', d.left_chase_width_in.measure_boundary);
    setVal('inp-left-cab', d.left_base_cab_in.value);
    setVal('bnd-left-cab', d.left_base_cab_in.measure_boundary);
    setVal('inp-right-cab', d.right_base_cab_in.value);
    setVal('bnd-right-cab', d.right_base_cab_in.measure_boundary);
    setVal('inp-counter-h', d.counter_height_in.value);
    setVal('bnd-counter-h', d.counter_height_in.measure_boundary);
    setVal('inp-range-w', d.range_opening_in.value);
    setVal('bnd-range-w', d.range_opening_in.measure_boundary);
    setVal('sel-rear-trim', state.options.rear_trim);
    setVal('sel-ceil-gap', state.options.ceiling_gap_solution);

    const setProv = (id, val) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = val;
      el.className = `pill ${val === 'MEASURE_ON_SITE' ? 'pill-fail' : val === 'VERIFY_ON_SITE' ? 'pill-warn' : 'pill-info'}`;
    };
    setProv('prov-floor-t', d.floor_buildup_t_in.verified);
    setProv('prov-wall-w', d.wall_width_in.verified);
    setProv('prov-ceil-h', d.ceiling_height_in.verified);
    setProv('prov-hood-aff', d.hood_bottom_aff_in.verified);
    setProv('prov-left-chase', d.left_chase_width_in.verified);

    ensureStateDefaults(state);
    const trim = state.existing_original_trim;
    setVal('inp-trim-baseboard', trim.baseboard_height_in.value);
    setVal('inp-trim-rail', trim.high_picture_rail_height_in.value);
    setVal('inp-trim-door-casing', trim.door_casing_width_in.value);
    setVal('inp-trim-win-casing', trim.window_casing_width_in.value);
    setProv('prov-trim-base', trim.baseboard_height_in.verified);
    setProv('prov-trim-rail', trim.high_picture_rail_height_in.verified);
    setProv('prov-trim-door', trim.door_casing_width_in.verified);
    setProv('prov-trim-win', trim.window_casing_width_in.verified);

    const tk = state.takeoff_settings;
    setVal('inp-waste-pct', tk.waste_pct);
    setVal('inp-box-sqft', tk.tile_box_sqft);
    const chkChim = document.getElementById('chk-deduct-chimney');
    if (chkChim) chkChim.checked = !!tk.deduct_chimney;
    const b10 = document.getElementById('btn-waste-10');
    const b15 = document.getElementById('btn-waste-15');
    if (b10) b10.classList.toggle('btn-primary', Number(tk.waste_pct) === 10);
    if (b15) b15.classList.toggle('btn-primary', Number(tk.waste_pct) === 15);
  }

  function applyUiLanguage() {
    const tr = I18N[currentLang];
    document.documentElement.lang = currentLang;
    document.title = tr.doc_title;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    setText('hdr-title', tr.hdr_title);
    setText('hdr-sub', tr.hdr_sub);
    setText('link-back-room', tr.back_room);
    setText('link-full-floorplan-top', tr.link_full_floorplan);
    setText('btn-lang', tr.btn_lang);
    setText('btn-datum', datumMode === 'both' ? tr.datum_both : datumMode === 'subfloor' ? tr.datum_sf : tr.datum_aff);
    setText('btn-circle-toggle', circleMode ? tr.btn_circle_off : tr.btn_circle_on);
    setText('btn-export-svg', tr.btn_export_svg);
    setText('btn-download-pdf', tr.btn_download_pdf);
    setHtml('hold-banner', tr.hold_html);
    setText('conflict-text', tr.conflict_text);
    setText('btn-reload-latest', tr.btn_reload);
    setText('svg-panel-title', activeView === 'coupled' ? tr.svg_panel_title_coupled : tr.svg_panel_title_elev);
    setText('tab-view-elevation', tr.tab_view_elevation);
    setText('tab-view-coupled', tr.tab_view_coupled);
    setText('link-full-floorplan', tr.link_full_floorplan);
    setText('circle-bar-hint', tr.circle_bar_hint);
    setText('btn-clear-sketch', tr.btn_clear_sketch);
    setText('btn-circle-done', tr.btn_circle_done);
    setText('photo-panel-title', tr.photo_panel_title);
    setText('photo-badge', tr.photo_badge);
    setText('photo-left-lbl', tr.photo_left);
    setText('photo-mid-lbl', tr.photo_mid);
    setText('photo-right-lbl', tr.photo_right);
    setHtml('photo-callouts', tr.photo_callouts.join(''));
    setHtml('concept-disclaimer-box', tr.concept_disclaimer_html);
    setText('clashes-title', tr.clashes_title);
    setText('clashes-lock-pill', tr.clashes_lock_pill);
    setText('marks-title', tr.marks_title);
    setText('th-feature', tr.th_feature);
    setText('th-aff', tr.th_aff);
    setText('th-subfloor', tr.th_subfloor);
    setText('th-horiz', tr.th_horiz);
    setText('th-boundary', tr.th_boundary);
    setText('takeoff-title', tr.takeoff_title);
    setText('takeoff-notice', tr.takeoff_notice);
    setText('lbl-waste-pct', tr.lbl_waste_pct);
    setText('btn-waste-10', tr.btn_waste_10);
    setText('btn-waste-15', tr.btn_waste_15);
    setText('lbl-box-sqft', tr.lbl_box_sqft);
    setText('lbl-deduct-chimney', tr.lbl_deduct_chimney);
    setText('trim-title', tr.trim_title);
    setText('trim-badge', tr.trim_badge);
    ensureStateDefaults(state);
    setText('trim-rule-note', currentLang === 'es' ? state.existing_original_trim.preservation_rule_es : state.existing_original_trim.preservation_rule_en);
    setText('editor-title', tr.editor_title);
    setText('preset-lbl', tr.preset_lbl);
    setText('preset-baseline', tr.preset_baseline);
    setText('preset-fail64', tr.preset_fail64);
    setText('preset-mid70', tr.preset_mid70);
    setText('btn-reset-baseline', tr.btn_reset);
    setText('help-hood-aff', tr.help_hood_aff);
    setText('btn-apply-local', tr.btn_apply_local);
    setText('btn-save-tailnet', tr.btn_save_tailnet);
    setText('btn-export-json', tr.btn_export_json);
    setText('voice-title', tr.voice_title);
    setText('voice-lang-pill', currentLang === 'es' ? 'es-MX' : 'en-US');
    setText('btn-dictate', speechListening && speechTargetPinIdx === null ? tr.btn_dictate_stop : tr.btn_dictate);
    setText('btn-apply-note', tr.btn_apply_note);
    setText('sketch-status-pill', pendingCircleNorm ? tr.sketch_ready : tr.sketch_none);
    setText('eod-title', tr.eod_title);
    setHtml('eod-desc', tr.eod_desc);
    setText('btn-refresh-eod', tr.btn_refresh_eod);

    const tElev = document.getElementById('tab-view-elevation');
    const tCoup = document.getElementById('tab-view-coupled');
    if (tElev) {
      tElev.classList.toggle('active', activeView === 'elevation');
      tElev.setAttribute('aria-selected', String(activeView === 'elevation'));
    }
    if (tCoup) {
      tCoup.classList.toggle('active', activeView === 'coupled');
      tCoup.setAttribute('aria-selected', String(activeView === 'coupled'));
    }

    const scalePill = document.getElementById('scale-pill');
    if (scalePill) {
      scalePill.textContent = currentLang === 'es' ? 'Escala Real 1:1 (X = Y)' : 'True Scale 1:1 (X = Y)';
    }

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (tr[k]) el.textContent = tr[k];
    });

    const chaseInput = document.getElementById('inp-left-chase');
    if (chaseInput) chaseInput.placeholder = tr.measure_on_site;
    const doorTrimInput = document.getElementById('inp-trim-door-casing');
    if (doorTrimInput) doorTrimInput.placeholder = tr.measure_on_site;
    const winTrimInput = document.getElementById('inp-trim-win-casing');
    if (winTrimInput) winTrimInput.placeholder = tr.measure_on_site;
    const boxInput = document.getElementById('inp-box-sqft');
    if (boxInput) boxInput.placeholder = tr.box_placeholder;

    const noteInput = document.getElementById('inp-voice-note');
    if (noteInput) noteInput.placeholder = tr.note_placeholder;

    const selRear = document.getElementById('sel-rear-trim');
    if (selRear && selRear.options.length >= 2) {
      selRear.options[0].textContent = tr.opt_trim_1;
      selRear.options[1].textContent = tr.opt_trim_8;
    }

    const selGap = document.getElementById('sel-ceil-gap');
    if (selGap && selGap.options.length >= 3) {
      selGap.options[0].textContent = tr.opt_gap_open;
      selGap.options[1].textContent = tr.opt_gap_a;
      selGap.options[2].textContent = tr.opt_gap_b;
    }

    const selIntent = document.getElementById('sel-pin-intent');
    if (selIntent && selIntent.options.length >= 3) {
      selIntent.options[0].textContent = tr.intent_edit;
      selIntent.options[1].textContent = tr.intent_problem;
      selIntent.options[2].textContent = tr.intent_question;
    }
  }

  function renderAll() {
    applyUiLanguage();
    renderSvg();
    renderStatusPills();
    renderClashes();
    renderMarkTable();
    renderTakeoff();
    renderPinsList();
    renderEodDrawer();
  }

  /* ── Form Reading & Patch Building ────────────────────────────────── */
  function buildPatchFromForm() {
    const numOrNull = (id) => {
      const el = document.getElementById(id);
      if (!el || el.value.trim() === '') return null;
      const n = Number(el.value);
      return Number.isFinite(n) ? n : null;
    };
    const bnd = (id, fallback) => {
      const el = document.getElementById(id);
      return el && el.value ? el.value : fallback;
    };

    const dimSpecs = [
      ['floor_buildup_t_in', 'inp-floor-t', 'bnd-floor-t', true],
      ['wall_width_in', 'inp-wall-w', 'bnd-wall-w', false],
      ['ceiling_height_in', 'inp-ceil-h', 'bnd-ceil-h', false],
      ['hood_bottom_aff_in', 'inp-hood-aff', 'bnd-hood-aff', false],
      ['left_chase_width_in', 'inp-left-chase', 'bnd-left-chase', true],
      ['left_base_cab_in', 'inp-left-cab', 'bnd-left-cab', false],
      ['right_base_cab_in', 'inp-right-cab', 'bnd-right-cab', false],
      ['counter_height_in', 'inp-counter-h', 'bnd-counter-h', false],
      ['range_opening_in', 'inp-range-w', 'bnd-range-w', false]
    ];

    const dimensions = {};
    dimSpecs.forEach(([key, inpId, bndId, allowNull]) => {
      const val = numOrNull(inpId);
      const boundary = bnd(bndId, state.dimensions[key].measure_boundary);
      const cur = state.dimensions[key];
      if (val === null && !allowNull) return;
      if (val !== cur.value || boundary !== cur.measure_boundary) {
        dimensions[key] = {
          value: val,
          measure_boundary: boundary,
          verified: val === null ? 'MEASURE_ON_SITE' : 'FIELD_UPDATE_PENDING_EOD',
          date: new Date().toISOString().slice(0, 10)
        };
      }
    });

    const options = {};
    const rearTrim = document.getElementById('sel-rear-trim')?.value;
    const ceilGap = document.getElementById('sel-ceil-gap')?.value;
    if (rearTrim && rearTrim !== state.options.rear_trim) options.rear_trim = rearTrim;
    if (ceilGap && ceilGap !== state.options.ceiling_gap_solution) options.ceiling_gap_solution = ceilGap;

    const patch = {};
    if (Object.keys(dimensions).length) patch.dimensions = dimensions;
    if (Object.keys(options).length) patch.options = options;
    return patch;
  }

  function applyPatchToLocalState(patch) {
    if (!patch || typeof patch !== 'object') return;
    if (patch.dimensions) {
      Object.keys(patch.dimensions).forEach((k) => {
        if (!state.dimensions[k]) return;
        const upd = patch.dimensions[k];
        if (upd && typeof upd === 'object') {
          if ('value' in upd) state.dimensions[k].value = upd.value;
          if (upd.measure_boundary) state.dimensions[k].measure_boundary = upd.measure_boundary;
          if (upd.verified) state.dimensions[k].verified = upd.verified;
          if (upd.date) state.dimensions[k].date = upd.date;
        }
      });
    }
    if (patch.options) {
      if (patch.options.rear_trim) state.options.rear_trim = patch.options.rear_trim;
      if (patch.options.ceiling_gap_solution) state.options.ceiling_gap_solution = patch.options.ceiling_gap_solution;
    }
    ensureStateDefaults(state);
    if (patch.existing_original_trim) {
      Object.keys(patch.existing_original_trim).forEach((k) => {
        if (!state.existing_original_trim[k] || typeof state.existing_original_trim[k] !== 'object') return;
        const upd = patch.existing_original_trim[k];
        if (upd && typeof upd === 'object') {
          if ('value' in upd) state.existing_original_trim[k].value = upd.value;
          if (upd.verified) state.existing_original_trim[k].verified = upd.verified;
        }
      });
    }
    if (patch.takeoff_settings) {
      if ('waste_pct' in patch.takeoff_settings) state.takeoff_settings.waste_pct = patch.takeoff_settings.waste_pct;
      if ('tile_box_sqft' in patch.takeoff_settings) state.takeoff_settings.tile_box_sqft = patch.takeoff_settings.tile_box_sqft;
      if ('deduct_chimney' in patch.takeoff_settings) state.takeoff_settings.deduct_chimney = !!patch.takeoff_settings.deduct_chimney;
    }
    if (patch.pin) {
      state.pins = state.pins || [];
      state.pins.push(patch.pin);
    }
    /* Immutable flagged_clashes guard: always restore canonical clashes */
    state.flagged_clashes = deepClone(BASELINE_KS4_DATA.flagged_clashes);
    hasUnsyncedLocalEdits = true;
    syncFormFromState();
    renderAll();
  }

  /* ── Circle-to-Correct Touch & Mouse Canvas ───────────────────────── */
  function syncCanvasSize() {
    const svg = document.getElementById('ks4-svg');
    const canvas = document.getElementById('ks4-sketch-canvas');
    if (!svg || !canvas) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      redrawCanvasStroke();
    }
  }

  function redrawCanvasStroke() {
    const canvas = document.getElementById('ks4-sketch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!drawPoints.length) return;
    ctx.save();
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = Math.max(3, canvas.width * 0.0045);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    drawPoints.forEach((pt, i) => {
      const x = pt.nx * canvas.width;
      const y = pt.ny * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function clearSketch() {
    drawPoints = [];
    pendingCircleNorm = null;
    redrawCanvasStroke();
    const pill = document.getElementById('sketch-status-pill');
    if (pill) {
      pill.className = 'pill pill-neutral';
      pill.textContent = I18N[currentLang].sketch_none;
    }
  }

  function setCircleMode(enabled) {
    circleMode = !!enabled;
    const canvas = document.getElementById('ks4-sketch-canvas');
    const bar = document.getElementById('circle-bar');
    const btn = document.getElementById('btn-circle-toggle');
    if (canvas) canvas.classList.toggle('drawing-active', circleMode);
    if (bar) bar.hidden = !circleMode;
    if (btn) {
      btn.classList.toggle('btn-active', circleMode);
      btn.textContent = circleMode ? I18N[currentLang].btn_circle_off : I18N[currentLang].btn_circle_on;
    }
    syncCanvasSize();
  }

  function initCircleCanvas() {
    const canvas = document.getElementById('ks4-sketch-canvas');
    if (!canvas) return;

    const getNormPt = (evt) => {
      const rect = canvas.getBoundingClientRect();
      return {
        nx: Math.max(0, Math.min(1, (evt.clientX - rect.left) / rect.width)),
        ny: Math.max(0, Math.min(1, (evt.clientY - rect.top) / rect.height))
      };
    };

    canvas.addEventListener('pointerdown', (evt) => {
      if (!circleMode) return;
      evt.preventDefault();
      canvas.setPointerCapture(evt.pointerId);
      isDrawing = true;
      drawPoints = [getNormPt(evt)];
      redrawCanvasStroke();
    });

    canvas.addEventListener('pointermove', (evt) => {
      if (!circleMode || !isDrawing) return;
      evt.preventDefault();
      drawPoints.push(getNormPt(evt));
      redrawCanvasStroke();
    });

    const finishDraw = () => {
      if (!isDrawing) return;
      isDrawing = false;
      if (drawPoints.length >= 2) {
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        drawPoints.forEach((p) => {
          if (p.nx < minX) minX = p.nx;
          if (p.nx > maxX) maxX = p.nx;
          if (p.ny < minY) minY = p.ny;
          if (p.ny > maxY) maxY = p.ny;
        });
        pendingCircleNorm = {
          cx: (minX + maxX) / 2,
          cy: (minY + maxY) / 2,
          rx: Math.max(0.025, (maxX - minX) / 2),
          ry: Math.max(0.02, (maxY - minY) / 2)
        };
        const pill = document.getElementById('sketch-status-pill');
        if (pill) {
          pill.className = 'pill pill-fail';
          pill.textContent = I18N[currentLang].sketch_ready;
        }
        document.getElementById('inp-voice-note')?.focus();
      }
    };

    canvas.addEventListener('pointerup', finishDraw);
    canvas.addEventListener('pointercancel', finishDraw);

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => syncCanvasSize());
      const stage = document.getElementById('svg-stage');
      if (stage) ro.observe(stage);
    }
    window.addEventListener('resize', syncCanvasSize);
  }

  /* ── Web Speech API + Natural Field Command Parser (EN & ES) ──────── */
  function parseSpokenFieldCommand(text) {
    const s = String(text || '').toLowerCase();
    const dimPatch = {};
    const numRe = '(\\d+(?:\\.\\d+)?)';

    const hoodMatch = s.match(new RegExp(`(?:hood|campana|line\\s*a|l[ií]nea\\s*a)[^\\d]{0,20}${numRe}`));
    if (hoodMatch) {
      const v = Number(hoodMatch[1]);
      if (v >= 58 && v <= 80) {
        dimPatch.hood_bottom_aff_in = { value: v, measure_boundary: 'aff', verified: 'FIELD_UPDATE_PENDING_EOD' };
      }
    }

    const floorMatch = s.match(new RegExp(`(?:floor|buildup|build-up|espesor\\s*(?:de\\s*)?piso|subfloor|subpiso)[^\\d]{0,20}${numRe}`));
    if (floorMatch) {
      const v = Number(floorMatch[1]);
      if (v >= 0 && v <= 4) {
        dimPatch.floor_buildup_t_in = { value: v, measure_boundary: 'subfloor', verified: 'FIELD_UPDATE_PENDING_EOD' };
      }
    }

    const chaseMatch = s.match(new RegExp(`(?:chase|caj[oó]n)[^\\d]{0,20}${numRe}`));
    if (chaseMatch) {
      const v = Number(chaseMatch[1]);
      if (v >= 0 && v <= 24) {
        dimPatch.left_chase_width_in = { value: v, measure_boundary: 'wall_to_wall', verified: 'FIELD_UPDATE_PENDING_EOD' };
      }
    }

    const wallMatch = s.match(new RegExp(`(?:wall\\s*width|ancho\\s*(?:de\\s*)?muro)[^\\d]{0,20}${numRe}`));
    if (wallMatch) {
      const v = Number(wallMatch[1]);
      if (v >= 48 && v <= 96) {
        dimPatch.wall_width_in = { value: v, measure_boundary: 'wall_to_wall', verified: 'FIELD_UPDATE_PENDING_EOD' };
      }
    }

    const ceilMatch = s.match(new RegExp(`(?:ceiling|techo)[^\\d]{0,20}${numRe}`));
    if (ceilMatch) {
      const v = Number(ceilMatch[1]);
      if (v >= 84 && v <= 156) {
        dimPatch.ceiling_height_in = { value: v, measure_boundary: 'aff', verified: 'FIELD_UPDATE_PENDING_EOD' };
      }
    }

    return Object.keys(dimPatch).length ? { dimensions: dimPatch } : null;
  }

  function toggleVoiceDictation(targetPinIdx) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const statusEl = document.getElementById('voice-status');
    const tr = I18N[currentLang];
    const pinIdx = typeof targetPinIdx === 'number' && Number.isFinite(targetPinIdx) ? targetPinIdx : null;

    if (!SpeechRec) {
      if (statusEl) statusEl.textContent = tr.voice_unsupported;
      showToast(tr.voice_unsupported, 'error');
      return;
    }

    if (speechListening && speechRecognition) {
      speechRecognition.stop();
      return;
    }

    speechTargetPinIdx = pinIdx;
    speechRecognition = new SpeechRec();
    speechRecognition.lang = currentLang === 'es' ? 'es-MX' : 'en-US';
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onstart = () => {
      speechListening = true;
      const btn = document.getElementById('btn-dictate');
      if (btn && speechTargetPinIdx === null) {
        btn.classList.add('btn-active');
        btn.textContent = tr.btn_dictate_stop;
      }
      if (statusEl) statusEl.textContent = currentLang === 'es' ? 'Habla ahora…' : 'Listening now…';
    };

    speechRecognition.onresult = (evt) => {
      const transcript = evt.results?.[0]?.[0]?.transcript || '';
      if (speechTargetPinIdx !== null && state.pins[speechTargetPinIdx] && transcript) {
        const cur = (state.pins[speechTargetPinIdx].note || '').trim();
        state.pins[speechTargetPinIdx].note = cur ? `${cur} ${transcript}` : transcript;
        renderSvg();
        renderPinsList();
      } else {
        const box = document.getElementById('inp-voice-note');
        if (box && transcript) {
          box.value = box.value ? `${box.value.trim()} ${transcript}` : transcript;
        }
      }
      if (statusEl) statusEl.textContent = `${currentLang === 'es' ? 'Capturado' : 'Captured'}: "${transcript}"`;
    };

    speechRecognition.onerror = (evt) => {
      if (statusEl) statusEl.textContent = `Speech error: ${evt.error}`;
    };

    speechRecognition.onend = () => {
      speechListening = false;
      speechTargetPinIdx = null;
      const btn = document.getElementById('btn-dictate');
      if (btn) {
        btn.classList.remove('btn-active');
        btn.textContent = I18N[currentLang].btn_dictate;
      }
    };

    speechRecognition.start();
  }

  /* ── Tailnet-Only Persistence Client (:8444 / ?api=) ──────────────── */
  async function fetchJsonWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs || 4500);
    try {
      const res = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
      const data = await res.json().catch(() => ({}));
      return { status: res.status, ok: res.ok, data };
    } finally {
      clearTimeout(timer);
    }
  }

  async function hydrateFromLocalJson() {
    if (window.location.protocol === 'file:') return;
    try {
      const res = await fetch('../kitchen-west-ks4-plan-data.json', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.dimensions && data.wall_id === 'K-S4') {
        state = ensureStateDefaults(deepClone(data));
      }
    } catch (_) {
      /* Embedded baseline fallback stays active */
    }
  }

  async function checkTailnetAndLoad() {
    tailnetState.checked = true;
    try {
      const h = await fetchJsonWithTimeout(`${apiOrigin}${PLAN_ENDPOINT_BASE}/health`, { method: 'GET' }, 3000);
      if (h.ok && h.data && h.data.ok && h.data.tailnet_verified) {
        tailnetState.online = true;
        tailnetState.verified = true;
        tailnetState.user = h.data.user || null;

        const planRes = await fetchJsonWithTimeout(`${apiOrigin}${PLAN_ENDPOINT_BASE}`, { method: 'GET' }, 4000);
        if (planRes.ok && planRes.data && planRes.data.ok && planRes.data.data) {
          state = ensureStateDefaults(deepClone(planRes.data.data));
          tailnetState.pendingEod = Array.isArray(planRes.data.pending_eod) ? planRes.data.pending_eod : [];
          hasUnsyncedLocalEdits = false;
          document.getElementById('conflict-banner').hidden = true;
        }
      } else {
        tailnetState.online = false;
        tailnetState.verified = false;
      }
    } catch (_) {
      tailnetState.online = false;
      tailnetState.verified = false;
    }
    syncFormFromState();
    renderAll();
  }

  async function saveOverrideToTailnet(patch, noteText) {
    const tr = I18N[currentLang];
    if (!tailnetState.verified) {
      showToast(tr.save_hint_off, 'error');
      return false;
    }
    if (violatesPrivateFirewall(noteText) || violatesPrivateFirewall(JSON.stringify(patch))) {
      showToast(tr.firewall_err, 'error');
      return false;
    }

    const author = document.getElementById('inp-author')?.value || tailnetState.user || 'Field';
    const payload = {
      base_rev: state.base_rev,
      author,
      patch,
      note_en: currentLang === 'en' ? (noteText || '') : '',
      note_es: currentLang === 'es' ? (noteText || '') : ''
    };

    try {
      const res = await fetchJsonWithTimeout(`${apiOrigin}${PLAN_ENDPOINT_BASE}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 6000);

      if (res.status === 409) {
        document.getElementById('conflict-banner').hidden = false;
        showToast(tr.conflict_text, 'error');
        return false;
      }
      if (res.status === 400) {
        showToast(res.data?.error || tr.firewall_err, 'error');
        return false;
      }
      if (res.status === 403) {
        tailnetState.verified = false;
        renderStatusPills();
        showToast(tr.save_hint_off, 'error');
        return false;
      }
      if (res.ok && res.data && res.data.ok) {
        if (res.data.data) {
          state = deepClone(res.data.data);
          state.flagged_clashes = deepClone(BASELINE_KS4_DATA.flagged_clashes);
        }
        if (res.data.base_rev) state.base_rev = res.data.base_rev;
        lastSavedRevId = res.data.rev_id || state.base_rev;
        hasUnsyncedLocalEdits = false;
        document.getElementById('conflict-banner').hidden = true;
        await checkTailnetAndLoad();
        showToast(`Saved ${lastSavedRevId}`, 'ok');
        return true;
      }
      showToast(res.data?.error || `Save failed (HTTP ${res.status})`, 'error');
      return false;
    } catch (err) {
      showToast(`Tailnet unreachable: ${err.message}`, 'error');
      return false;
    }
  }

  async function handleEodAction(revId, action) {
    if (!tailnetState.verified || !revId) return;
    const actor = document.getElementById('inp-author')?.value || tailnetState.user || 'Tisa';
    try {
      const res = await fetchJsonWithTimeout(`${apiOrigin}${PLAN_ENDPOINT_BASE}/eod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_rev: state.base_rev,
          rev_id: revId,
          action,
          actor
        })
      }, 6000);

      if (res.status === 409) {
        document.getElementById('conflict-banner').hidden = false;
        showToast(I18N[currentLang].conflict_text, 'error');
        return;
      }
      if (res.ok && res.data && res.data.ok) {
        await checkTailnetAndLoad();
        showToast(`${action.toUpperCase()} ${revId}`, 'ok');
      } else {
        showToast(res.data?.error || `EOD ${action} failed (HTTP ${res.status})`, 'error');
      }
    } catch (err) {
      showToast(`EOD error: ${err.message}`, 'error');
    }
  }

  /* ── Local File Exports (Vector SVG, JSON, Print/PDF) ─────────────── */
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportLiveSvg() {
    const svgEl = document.getElementById('ks4-svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const raw = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(svgEl);
    const rev = (state.base_rev || 'ks4').replace(/[^a-zA-Z0-9_-]/g, '');
    downloadBlob(new Blob([raw], { type: 'image/svg+xml;charset=utf-8' }), `U4_kitchen_K-S4_${currentLang.toUpperCase()}_${rev}.svg`);
  }

  function exportLocalJson() {
    const out = deepClone(state);
    out.revision_stamp = computeRevisionStamp();
    out.exported_at = new Date().toISOString();
    downloadBlob(
      new Blob([JSON.stringify(out, null, 2)], { type: 'application/json;charset=utf-8' }),
      `kitchen-west-ks4-plan-data_${currentLang.toUpperCase()}.json`
    );
  }

  function triggerPdfExport() {
    if (window.U4PlanPdfExport && typeof window.U4PlanPdfExport.exportPdf === 'function') {
      window.U4PlanPdfExport.exportPdf();
    } else if (window.U4KS4PdfExport && typeof window.U4KS4PdfExport.exportPdf === 'function') {
      window.U4KS4PdfExport.exportPdf();
    } else {
      window.print();
    }
  }

  /* ── Wire Event Listeners ─────────────────────────────────────────── */
  function wireControls() {
    document.getElementById('btn-lang')?.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'es' : 'en';
      renderAll();
    });

    document.getElementById('btn-datum')?.addEventListener('click', () => {
      datumMode = datumMode === 'both' ? 'subfloor' : datumMode === 'subfloor' ? 'aff' : 'both';
      renderAll();
    });

    document.getElementById('tab-view-elevation')?.addEventListener('click', () => {
      activeView = 'elevation';
      renderAll();
    });
    document.getElementById('tab-view-coupled')?.addEventListener('click', () => {
      activeView = 'coupled';
      renderAll();
    });

    document.getElementById('btn-circle-toggle')?.addEventListener('click', () => {
      setCircleMode(!circleMode);
    });
    document.getElementById('btn-circle-done')?.addEventListener('click', () => setCircleMode(false));
    document.getElementById('btn-clear-sketch')?.addEventListener('click', clearSketch);

    document.getElementById('btn-export-svg')?.addEventListener('click', exportLiveSvg);
    document.getElementById('btn-download-pdf')?.addEventListener('click', triggerPdfExport);
    document.getElementById('btn-export-json')?.addEventListener('click', exportLocalJson);
    document.getElementById('btn-reload-latest')?.addEventListener('click', checkTailnetAndLoad);
    document.getElementById('btn-refresh-eod')?.addEventListener('click', checkTailnetAndLoad);

    ['framing', 'appliances', 'mep', 'clashes'].forEach((k) => {
      const cb = document.getElementById(`lyr-${k}`);
      if (!cb) return;
      cb.addEventListener('change', () => {
        layers[k] = cb.checked;
        renderSvg();
      });
    });

    /* Live Materials Takeoff Controls (Zero Prices) */
    document.getElementById('btn-waste-10')?.addEventListener('click', () => {
      applyPatchToLocalState({ takeoff_settings: { waste_pct: 10 } });
    });
    document.getElementById('btn-waste-15')?.addEventListener('click', () => {
      applyPatchToLocalState({ takeoff_settings: { waste_pct: 15 } });
    });
    document.getElementById('inp-waste-pct')?.addEventListener('input', (e) => {
      const n = Number(e.target.value);
      if (Number.isFinite(n)) applyPatchToLocalState({ takeoff_settings: { waste_pct: Math.max(0, Math.min(35, n)) } });
    });
    document.getElementById('inp-box-sqft')?.addEventListener('input', (e) => {
      const raw = e.target.value.trim();
      const val = raw === '' ? null : Number(raw);
      applyPatchToLocalState({ takeoff_settings: { tile_box_sqft: Number.isFinite(val) && val > 0 ? val : null } });
    });
    document.getElementById('chk-deduct-chimney')?.addEventListener('change', (e) => {
      applyPatchToLocalState({ takeoff_settings: { deduct_chimney: !!e.target.checked } });
    });

    /* Existing Original Trim Baseline Inputs (physically updates SVG lines in real time) */
    const wireTrimInput = (id, key, allowNull) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const raw = el.value.trim();
        const val = raw === '' ? null : Number(raw);
        if (val === null && !allowNull) return;
        const next = {};
        next[key] = {
          value: val !== null && Number.isFinite(val) ? val : null,
          verified: val === null ? 'MEASURE_ON_SITE' : 'FIELD_UPDATE_PENDING_EOD'
        };
        applyPatchToLocalState({ existing_original_trim: next });
      });
    };
    wireTrimInput('inp-trim-baseboard', 'baseboard_height_in', false);
    wireTrimInput('inp-trim-rail', 'high_picture_rail_height_in', false);
    wireTrimInput('inp-trim-door-casing', 'door_casing_width_in', true);
    wireTrimInput('inp-trim-win-casing', 'window_casing_width_in', true);

    /* Live preview while editing any dimension or option */
    const form = document.getElementById('ks4-form');
    if (form) {
      form.addEventListener('input', () => {
        const patch = buildPatchFromForm();
        if (Object.keys(patch).length) applyPatchToLocalState(patch);
      });
      form.addEventListener('change', () => {
        const patch = buildPatchFromForm();
        if (Object.keys(patch).length) applyPatchToLocalState(patch);
      });
    }

    document.getElementById('btn-apply-local')?.addEventListener('click', () => {
      const patch = buildPatchFromForm();
      if (Object.keys(patch).length) {
        applyPatchToLocalState(patch);
      } else {
        renderAll();
      }
      showToast(computeRevisionStamp(), 'ok');
    });

    document.getElementById('btn-save-tailnet')?.addEventListener('click', async () => {
      const patch = buildPatchFromForm();
      const note = document.getElementById('inp-voice-note')?.value?.trim() || '';
      if (!Object.keys(patch).length && !note) {
        showToast(currentLang === 'es' ? 'Sin cambios nuevos para guardar.' : 'No new changes to save.');
        return;
      }
      await saveOverrideToTailnet(patch, note);
    });

    /* Quick verification presets (including explicit 64" FAIL check) */
    document.getElementById('preset-baseline')?.addEventListener('click', () => {
      applyPatchToLocalState({
        dimensions: {
          hood_bottom_aff_in: { value: 66.9375, measure_boundary: 'aff', verified: 'K_S4_BASELINE' }
        }
      });
    });
    document.getElementById('preset-fail64')?.addEventListener('click', () => {
      applyPatchToLocalState({
        dimensions: {
          hood_bottom_aff_in: { value: 64.0, measure_boundary: 'aff', verified: 'FIELD_UPDATE_PENDING_EOD' }
        }
      });
    });
    document.getElementById('preset-mid70')?.addEventListener('click', () => {
      applyPatchToLocalState({
        dimensions: {
          hood_bottom_aff_in: { value: 70.0, measure_boundary: 'aff', verified: 'FIELD_UPDATE_PENDING_EOD' }
        }
      });
    });
    document.getElementById('btn-reset-baseline')?.addEventListener('click', () => {
      state = deepClone(BASELINE_KS4_DATA);
      hasUnsyncedLocalEdits = false;
      lastSavedRevId = null;
      clearSketch();
      syncFormFromState();
      renderAll();
      showToast(currentLang === 'es' ? 'Restaurado a base inicial' : 'Reset to baseline', 'ok');
    });

    /* Voice & Attached Comment Callout Submission */
    document.getElementById('btn-dictate')?.addEventListener('click', () => toggleVoiceDictation(null));

    document.getElementById('btn-apply-note')?.addEventListener('click', async () => {
      const noteInput = document.getElementById('inp-voice-note');
      const note = (noteInput?.value || '').trim();
      if (!note && !pendingCircleNorm) {
        showToast(currentLang === 'es' ? 'Agrega una nota o dibuja un círculo.' : 'Enter a field note or draw a circle first.', 'error');
        return;
      }
      if (violatesPrivateFirewall(note)) {
        showToast(I18N[currentLang].firewall_err, 'error');
        return;
      }

      const author = document.getElementById('inp-author')?.value || tailnetState.user || 'Field';
      const intent = document.getElementById('sel-pin-intent')?.value || 'propose_edit';
      const mode = intent === 'ask_question' ? 'ask_question' : 'modify_plan';
      const parsedCmd = mode === 'modify_plan' ? parseSpokenFieldCommand(note) : null;
      const patch = parsedCmd ? deepClone(parsedCmd) : {};

      if (pendingCircleNorm || note) {
        const pt = pendingCircleNorm || { cx: 0.34, cy: 0.45, rx: 0.032, ry: 0.025 };
        patch.pin = {
          cx: Number(pt.cx.toFixed(4)),
          cy: Number(pt.cy.toFixed(4)),
          rx: Number(pt.rx.toFixed(4)),
          ry: Number(pt.ry.toFixed(4)),
          intent,
          mode,
          author,
          note: note || (currentLang === 'es' ? 'Punto marcado en plano' : 'Circled spot on drawing'),
          agent_status: 'draft',
          agent_reply: '',
          created_at: new Date().toISOString()
        };
      }
      if (note) patch.voice_note = note;

      applyPatchToLocalState(patch);
      if (noteInput) noteInput.value = '';
      clearSketch();
      setCircleMode(false);

      const newIdx = (state.pins || []).length - 1;
      if (mode === 'ask_question' && newIdx >= 0) {
        await sendPinToAgent(newIdx);
      } else if (tailnetState.verified) {
        const ok = await saveOverrideToTailnet(patch, note);
        if (ok && state.pins[newIdx]) {
          state.pins[newIdx].agent_status = 'sent_applied';
          renderAll();
        }
      } else {
        showToast(currentLang === 'es' ? 'Comentario adjunto con línea guía (vista local)' : 'Attached comment pin with leader line (local preview)', 'ok');
      }
    });
  }

  /* ── Unified Public Integration Contract (window.U4PLAN + window.U4KS4 alias) ── */
  const U4PLAN_API = {
    planId: 'kitchen-west-ks4',
    getSvgElement() {
      return document.getElementById('ks4-svg');
    },
    getState() {
      return deepClone(state);
    },
    getTakeoff() {
      return computeTakeoff();
    },
    getScaleInfo() {
      return deepClone(lastScaleInfo);
    },
    getView() {
      return activeView;
    },
    setView(v) {
      if (v === 'elevation' || v === 'coupled') {
        activeView = v;
        renderAll();
      }
    },
    getLang() {
      return currentLang;
    },
    getRevisionStamp() {
      return computeRevisionStamp();
    },
    getAnnotationDataUrl() {
      const canvas = document.getElementById('ks4-sketch-canvas');
      if (!canvas || !drawPoints.length) return null;
      try {
        return canvas.toDataURL('image/png');
      } catch (_) {
        return null;
      }
    },
    setLang(lang) {
      if (lang === 'en' || lang === 'es') {
        currentLang = lang;
        renderAll();
      }
    },
    applyLocalPatch(patch) {
      applyPatchToLocalState(patch);
    },
    render() {
      renderAll();
    }
  };
  window.U4PLAN = U4PLAN_API;
  window.U4KS4 = U4PLAN_API;

  /* ── Smart Cross-Plan Jump Links ──────────────────────────────────── */
  function resolveCrossLinks() {
    const isWikiPlans = /\/plans\//.test(window.location.pathname || '');
    const backEl = document.getElementById('link-back-room');
    const fpTop = document.getElementById('link-full-floorplan-top');
    const fpMid = document.getElementById('link-full-floorplan');
    const backHref = isWikiPlans ? '../../#kitchen-oven-range' : '../../index.html#kitchen-oven-range';
    const fpHref = isWikiPlans ? '../kitchen-floor-plan/index.html' : '../floor-plan-pilot/index.html';
    if (backEl) backEl.href = backHref;
    if (fpTop) fpTop.href = fpHref;
    if (fpMid) fpMid.href = fpHref;
  }

  /* ── Boot Sequence ────────────────────────────────────────────────── */
  async function boot() {
    if (params.get('print') === '1') {
      document.body.classList.add('print-mode');
    }
    resolveCrossLinks();
    initCircleCanvas();
    wireControls();
    await hydrateFromLocalJson();
    syncFormFromState();
    renderAll();
    await checkTailnetAndLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
