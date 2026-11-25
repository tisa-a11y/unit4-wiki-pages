/* Unit 4 Permanent Attic Hatch (24" x 36" Finished Clear) Interactive Renderer & Tailnet Client
 * Owned by @ag-unit-4-specialists (83beabda).
 *
 * Unified Integration Contract exposed on window.U4PLAN:
 *   - planId                  -> "attic-hatch"
 *   - getSvgElement()         -> <svg id="attic-svg">
 *   - getState()              -> deep clone of live plan state
 *   - getTakeoff()            -> live gross proposed materials takeoff (ZERO prices)
 *   - getScaleInfo()          -> { view, scaleX, scaleY, uniform } (always scaleX === scaleY)
 *   - getView() / setView(v)  -> "plan" | "section"
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
  const PLAN_ENDPOINT_BASE = '/api/unit4/plans/attic-hatch';

  /* Exact baseline matching attic/attic-hatch-plan-data.json (schema 1.0.0) */
  const BASELINE_ATTIC_DATA = {
    schema_version: '1.0.0',
    project: '1231 11th Avenue Unit 4, San Francisco, CA',
    room_id: 'attic',
    element_id: 'ATTIC-HATCH-01',
    title_en: 'Permanent Attic Access Hatch, Walkway & Enclosure (24" × 36" Finished Clear)',
    title_es: 'Escotilla Permanente de Ático, Pasillo y Sellado (24" × 36" Libre Terminado)',
    governing_spec: 'attic/SPEC.md',
    base_rev: 'rev-20261124-attic-r4',
    status: 'PLANNING_HOLD_ZERO_CUTS_UNTIL_GATES_PASS',
    orientation: {
      north_angle_deg: 0,
      candidate_location: 'DOOR4_LANDING',
      proposed_hatch_axis: '36in_along_hall_x_24in_across',
      wall_offset_1_in: { value: null, measure_boundary: 'wall_to_wall', verified: 'MEASURE_ON_SITE' },
      wall_offset_2_in: { value: null, measure_boundary: 'wall_to_wall', verified: 'MEASURE_ON_SITE' }
    },
    equipment_basis: {
      furnace: {
        model: 'Carrier/Bryant Legacy 45k BTU, 80% AFUE, Low NOx (confirm exact SKU at NEXT planning visit)',
        height_in: 33.25,
        width_in: 14.19,
        depth_in: 29.0,
        pass_end_first_in: [14.19, 29.0],
        source: 'NEXT HVAC signed scope'
      }
    },
    dimensions: {
      finished_clear_width_in: {
        value: 24.0,
        measure_boundary: 'clear_between_casings',
        verified: 'LOCKED_NEVER_SHRINK',
        source: 'attic/SPEC.md (locked 24" × 36" finished clear)',
        date: '2026-11-19'
      },
      finished_clear_length_in: {
        value: 36.0,
        measure_boundary: 'clear_between_casings',
        verified: 'LOCKED_NEVER_SHRINK',
        source: 'attic/SPEC.md',
        date: '2026-11-19'
      },
      proposed_wood_kit_cut_width_in: {
        value: 27.5,
        measure_boundary: 'rough_opening',
        verified: 'PROPOSED_HOLD_UNTIL_FIRE_AND_JOIST_CHECK',
        source: 'Wood-kit rough opening (disabled if listed fire-rated assembly required)',
        date: '2026-11-19'
      },
      proposed_wood_kit_cut_length_in: {
        value: 39.5,
        measure_boundary: 'rough_opening',
        verified: 'PROPOSED_HOLD_UNTIL_FIRE_AND_JOIST_CHECK',
        source: 'Wood-kit rough opening (disabled if listed fire-rated assembly required)',
        date: '2026-11-19'
      },
      joist_bay_width_b_in: {
        value: null,
        measure_boundary: 'rough_opening',
        verified: 'MEASURE_ON_SITE',
        source: 'Gate 1 (27.5" fits; >27.5" needs solid side backing; <27.5" needs header plan or alternate spot)',
        date: '2026-11-19'
      },
      attic_height_in: {
        value: 66.0,
        measure_boundary: 'aff',
        verified: 'CONFIRMED',
        source: '66" attic height (< 6 ft) caps walkway run at <= 20 ft',
        date: '2026-11-19'
      },
      walkway_run_length_ft: {
        value: 15.8,
        measure_boundary: 'wall_to_wall',
        verified: 'VERIFY_ON_SITE',
        max_allowed_ft: 20.0,
        saw_kerf_rule: '1 true 24" strip per 4x8 sheet (<=7ft: 1 sheet, 7-14ft: 2 sheets, 14-20ft: 3 sheets) -> 3 sheets for 15.8 ft SW Dining route',
        source: 'Reconciled SW Dining F1 (X=174", Y=258") -> 15.8 ft <= 20.0 ft cap (CMC 304.4)',
        date: '2026-11-19'
      },
      walkway_min_width_in: {
        value: 24.0,
        measure_boundary: 'clear_between_casings',
        verified: 'LOCKED',
        source: '24" solid walkway with 30" clear unobstructed passage',
        date: '2026-11-19'
      },
      service_platform_in: {
        value: [30.0, 30.0],
        measure_boundary: 'clear_between_casings',
        verified: 'LOCKED',
        source: '30" × 30" level service platform (confirm vibration mount requirements w/ NEXT)',
        date: '2026-11-19'
      }
    },
    enclosure_rules: {
      fire_rating_gate: 'UNVERIFIED_HOLD',
      lid_finish_status: 'PENDING_OWNER_OK',
      fixed_frame_seal: '3/8" backer rod + paintable sealant',
      ledge_weatherstrip: 'Continuous 1/2" × 1/8" closed-cell on 1×2 ledges (clean of paint/caulk)',
      lid_seam: 'Uncaulked operable perimeter seam (test-open twice)',
      lid_insulation: 'Uninsulated 3/4" ply lid + 2 ring pulls + 4 latches outside 24"×36" clear (unconditioned Door 4 landing)" × 37-1/4") + 3 loose 1x2 gasket ledger + confirm w/ NEXT (<= 1/2" shank)',
      insulation_dam: '1x2 gasket ledger standing 2" above loose-fill insulation',
      lid_finish: 'Proposed ~1-1/2" recessed 3/4" ply lid (PENDING OWNER OK) + compression latches outside 24"×36" clear',
      temp_bedroom_closet_hold: 'KEEP OPEN until LV switch cable AND permanent 24"×36" hatch exist',
      roof_leak_gate: 'Active roof/attic water leak must be resolved before enclosing work',
      b_vent_clearance_min_in: 1.0
    },
    electrical_rules: {
      light: 'Entrance-switched enclosed LED utility light (retain landing light)',
      gfci_outlet: '120V GFCI within 25 ft of furnace (ideally at 30"×30" platform), wired live on line side independent of furnace disconnect',
      furnace_disconnect: 'Dedicated furnace circuit + disconnect in sight'
    },
    existing_original_trim: {
      baseboard_height_in: {
        value: 9.5,
        measure_boundary: 'aff',
        verified: 'VERIFY_ON_SITE',
        source: 'Existing Unit 4 Edwardian baseboard (measured 9-1/2")'
      },
      high_picture_rail_height_in: {
        value: 103.0,
        measure_boundary: 'aff',
        verified: 'VERIFY_ON_SITE',
        source: 'Existing Unit 4 high picture rail (103", visible in Door 4 landing photo)'
      },
      door_casing_width_in: {
        value: null,
        measure_boundary: 'to_casing_edge',
        verified: 'MEASURE_ON_SITE',
        source: 'Original Door 4 casing width (never fabricated)'
      },
      window_casing_width_in: {
        value: null,
        measure_boundary: 'to_casing_edge',
        verified: 'MEASURE_ON_SITE',
        source: 'Original landing window casing width (never fabricated)'
      },
      preservation_rule_en: 'Preserve original Edwardian baseboard (9-1/2"), high picture rail (103" — visible in candidate photo), and Door 4 / window casings. Keep separate from proposed hatch trim.',
      preservation_rule_es: 'Conservar zoclo original Edwardian (9-1/2"), moldura alta (103" — visible en la foto) y chambranas de Puerta 4 / ventana. Separar completamente de la moldura de la escotilla.'
    },
    takeoff_settings: {
      waste_pct: 10
    },
    flagged_clashes: [
      {
        id: 'clash-attic-location',
        severity: 'HIGH',
        title_en: 'Candidate Spot & Ceiling Fire Rating Unverified',
        title_es: 'Ubicación y Clasificación Cortafuego Sin Verificar',
        en: 'The common landing outside Front Door 4 is selected. Hold ceiling cuts and hatch kit until markout, fire protection and support have been verified.',
        es: 'El descanso común fuera de la Puerta Principal 4 está elegido. No cortar el plafón ni comprar el kit hasta verificar el trazo, la protección contra incendios y los apoyos.'
      },
      {
        id: 'clash-attic-joist-bay',
        severity: 'HIGH',
        title_en: 'Joist Bay B & Overhead Framing Unmeasured',
        title_es: 'Claro Entre Vigas B e Instalaciones Arriba',
        en: 'Joist bay width B and overhead framing/wires/pipes are MEASURE ON SITE. Never shrink 24" × 36" finished clear.',
        es: 'Ancho de claro entre vigas B e instalaciones arriba: MEDIR EN OBRA. Nunca reducir el libre terminado de 24" × 36".'
      }
    ],
    field_overrides: [],
    pins: []
  };

  const I18N = {
    en: {
      doc_title: 'Permanent Attic Hatch — Unit 4',
      hdr_title: 'Permanent Attic Hatch',
      hdr_sub: 'Working Planning Draft · 24" × 36" Clear · True Scale (X = Y) · Furnace & Walkway Calculator · Zero Prices',
      back_room: '← Back to Attic Page',
      jump_hvac: 'Attic Furnace & Ducts →',
      btn_lang: 'Español (MX)',
      btn_circle_on: 'Circle-to-Correct',
      btn_circle_off: 'Drawing Active…',
      btn_export_svg: 'Export SVG',
      btn_download_pdf: 'Download / Print PDF',
      hold_html: '<strong>WORKING PLANNING DRAFT — ZERO CEILING CUTS HOLD:</strong> The common landing outside Front Door 4 is selected. Verify the exact markout, ceiling fire protection and joist bay width <strong>B</strong>. <strong>ZERO</strong> ceiling cuts, <strong>ZERO</strong> wood-kit purchases, and keep the temporary bedroom closet opening <strong>OPEN</strong> until all gates pass and the active roof leak is repaired.',
      conflict_text: 'A newer revision was saved on Tailnet by another editor (HTTP 409). Reload the latest plan and re-apply your change.',
      btn_reload: 'Reload Latest Plan',
      svg_title_plan: 'True-to-Scale Attic Hatch & Walkway Plan (24" × 36" Clear)',
      svg_title_section: 'True-to-Scale Attic Vertical Section (66" Headroom & 5 Enclosure Seals)',
      tab_view_plan: 'Ceiling & Hallway Plan',
      tab_view_section: 'Attic Vertical Section',
      drag_hint: 'Drag walkway handle on drawing or edit ft below',
      lyr_framing: 'Joists & Cut',
      lyr_furnace: 'Furnace Pass & Platform',
      lyr_enclosure: 'Gasket, Frame & Power',
      circle_bar_hint: 'Draw a circle around any spot on the plan (touch or mouse) to attach a callout note.',
      btn_clear_sketch: 'Clear Sketch',
      btn_circle_done: 'Exit Circle Mode',
      photo_panel_title: 'Selected Landing — Exact Ceiling Markout Pending (Site Photo)',
      photo_badge: 'LOCATION SELECTED · MARKOUT PENDING',
      photo_left: 'Stairwell / Window',
      photo_mid: 'CANDIDATE CEILING (HOLD)',
      photo_right: 'Door 4 Entry →',
      photo_callouts: [
        '<li class="callout-alert"><strong>Common landing outside Front Door 4:</strong> Confirm the exact markout, framing and fire protection before cutting.</li>',
        '<li><strong>Ceiling Light Fixture:</strong> Keep landing light; add entrance-switched enclosed LED utility light inside attic.</li>',
        '<li><strong>Original 103" High Picture Rail:</strong> Visible original Edwardian moulding along walls — preserve intact, keep separate from hatch trim.</li>',
        '<li><strong>Stair Railing Clearance:</strong> Verify ladder setup and lid swing clear stairs, Door 4 swing, and original door/window casings.</li>'
      ],
      concept_disclaimer_html: '<strong>Site Photo vs. Concept:</strong> Above photo is the real Door 4 landing ceiling. Any separate illustrative attic sketches are <em>Concept reference only — not to scale</em>; always verify from true-scale drawings and field checks.',
      rules_title: '5 Mandatory Enclosure & Hold Rules (Before Any Cut or Close-In)',
      rules_pill: '24" × 36" Clear Locked',
      rules_cards: [
        { hold: true, title: '1. Fire Rating + Joist Bay B First', body: 'Verify ceiling fire-rating status AND joist bay B before cutting or buying wood kit. Listed fire-rated ceiling disables the wood kit.' },
        { hold: false, title: '2. Air-Seal & Dust Gasket (No Lid Batts)', body: '3/8" backer rod + sealant on fixed frame; continuous 1/2"×1/8" closed-cell weatherstrip on 1×2 ledges; uncaulked operable lid seam (test-open twice); Uninsulated 3/4" ply lid + 2 ring pulls + 4 latches outside 24"×36" clear (unconditioned Door 4 landing)"×37-1/4") + 3 wire loops + confirm w/ NEXT (<=1/2"); 1x2 gasket ledger 2" above loose fill.' },
        { hold: false, title: '3. Lid Finish & Latches', body: 'Proposed ~1-1/2" recessed 3/4" ply lid (pending owner OK) with compression latches mounted outside the locked 24"×36" clear opening.' },
        { hold: true, title: '4. Keep Bedroom Closet Open', body: 'KEEP temporary bedroom closet ceiling opening OPEN until BOTH the low-voltage switch cable AND the permanent 24"×36" hatch are installed.' },
        { hold: true, title: '5. Active Roof Leak Gate', body: 'Repair the active roof/attic water leak before enclosing framing, or finishing ceiling work.' }
      ],
      clashes_title: 'Flagged Clashes & Field Checks (Never Auto-Resolved)',
      clashes_lock_pill: 'Immutable · Verify in Field',
      takeoff_title: 'Live Proposed Materials Takeoff (Quantities Only · Zero Prices)',
      takeoff_notice: 'Gross Proposed Quantities Only (Zero Prices) — Verify On-Hand Stock Before Ordering. Never use 3/8" plywood for walkway.',
      lbl_waste_pct: 'Waste / Overage (%):',
      btn_waste_10: '+10% Standard',
      btn_waste_15: '+15% Extra',
      saw_kerf_hint: 'Saw-kerf rule: 1 true 24" strip per 4×8 sheet (<=7 ft = 1 sheet, 7–14 ft = 2 sheets, 14–20 ft = 3 sheets).',
      editor_title: 'Live Gates, Joist Bay & Walkway Calculator',
      preset_lbl: 'Quick Field Test:',
      preset_b_275: 'Bay B = 27.5" (Fits)',
      preset_b_30: 'Bay B = 30" (Side Backing)',
      preset_b_22: 'Bay B = 22" (Header Needed)',
      preset_l_12: 'Walkway 12 ft (2 Sheets)',
      preset_l_22: 'Walkway 22 ft (FAIL >20 ft)',
      btn_reset: 'Reset Baseline',
      lbl_author: 'Editor Name',
      lbl_location: 'Candidate Location Status',
      lbl_fire_gate: 'Ceiling Fire-Rating Gate (Blocks Cut & Wood Kit When Fire-Rated)',
      lbl_joist_b: 'Measured Joist Bay Width B (in)',
      help_joist_b: '27.5" fits cleanly · >27.5" needs solid side backing · <27.5" needs structural header or new spot (never shrink 24"×36").',
      lbl_walkway_l: 'Walkway Run Length L (ft · max 20 ft)',
      help_walkway_l: '66" attic headroom (<6 ft) caps walkway at 20 ft max. Drag handle on SVG or type exact feet.',
      lbl_offset_1: 'Corner / Wall Offset 1 (in · wall_to_wall)',
      lbl_offset_2: 'Corner / Wall Offset 2 (in · wall_to_wall)',
      lbl_lid_finish: 'Recessed Lid Finish Status (~1-1/2" recessed 3/4" ply lid)',
      loc_opts: [
        'UNCONFIRMED — Door 4 Landing vs. Interior Hall',
        'Interior hallway — earlier reference',
        'Common landing outside Front Door 4'
      ],
      fire_opts: [
        'UNVERIFIED HOLD — Do NOT cut ceiling or buy wood kit yet',
        'Non-Rated Ceiling Confirmed — Proposed 27-1/2" × 39-1/2" wood kit eligible',
        'FIRE-RATED CEILING REQUIRED — Wood kit DISABLED (listed 24" × 36" fire-rated hatch required)'
      ],
      lid_opts: [
        'Proposed ~1-1/2" recessed 3/4" ply lid (Pending Owner Approval) + latches outside 24"×36"',
        'Owner Approved — Recessed 3/4" ply lid + compression latches outside 24"×36"',
        'Listed Fire-Rated Insulated Attic Door (24" × 36" finished clear)'
      ],
      btn_apply_local: 'Apply Live Preview',
      btn_save_tailnet: 'Save Live to Tailnet',
      btn_export_json: 'Download JSON',
      save_hint_off: 'Off-tailnet Read-Only / Local Export mode: live edits update preview & local exports only. Connect to Tisa\'s Tailscale network to save live overrides.',
      save_hint_on: 'Connected to Tailnet persistence (:8444). Saves apply immediately with revision stamp + EOD review log.',
      trim_title: 'Existing Original Trim Baseline (Keep Separate From Hatch Trim)',
      trim_badge: 'Edwardian Original',
      lbl_trim_base: 'Original Baseboard Height (in)',
      lbl_trim_rail: 'Original High Picture Rail Height (in)',
      lbl_trim_door: 'Original Door 4 Casing Width (in)',
      lbl_trim_win: 'Original Window Casing Width (in)',
      voice_title: 'Attached Comment Callouts & Voice Note',
      lbl_intent: 'Comment Action',
      intent_edit: 'Modify Plan / Field Measurement',
      intent_problem: 'Flag Problem / Clash',
      intent_question: 'Answer a Question ("What is this right here?")',
      lbl_note: 'Field Note or Spoken Command',
      note_placeholder: 'Example: "Joist bay is 27.5 inches", "Walkway is 14 feet", or "Is this ceiling fire rated?" (Zero prices)',
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
      eod_desc: 'Workers never wait: saved tailnet edits stamp the live plan immediately with a revision ID. At end-of-day, Tisa taps <strong>Accept</strong> (promotes to the attic room spec) or <strong>Reject</strong> (reverts atomically).',
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
      not_yet_synced: 'Not Yet Synced (Local Preview)',
      pending_eod_stamp: 'Field Update · Pending EOD Review',
      synced_stamp: 'Synced to Working Draft',
      firewall_err: 'Blocked by Private-Data Firewall: never enter currency symbols, prices, bids, estimates, financing, or mail links in crew plans.'
    },
    es: {
      doc_title: 'Escotilla Permanente de Ático — Unidad 4',
      hdr_title: 'Escotilla Permanente de Ático',
      hdr_sub: 'Borrador de Planeación · 24" × 36" Libre · Escala Real (X = Y) · Calefactor y Pasillo · Sin Precios',
      back_room: '← Volver a Página de Ático',
      jump_hvac: 'Calefactor y Ductos en Ático →',
      btn_lang: 'English (EN)',
      btn_circle_on: 'Circular para Corregir',
      btn_circle_off: 'Dibujo Activo…',
      btn_export_svg: 'Exportar SVG',
      btn_download_pdf: 'Descargar / Imprimir PDF',
      hold_html: '<strong>BORRADOR DE PLANEACIÓN — CERO CORTES EN PLAFÓN:</strong> Está elegido el descanso común fuera de la Puerta Principal 4. El trazo exacto, la protección contra incendios del plafón y el claro entre vigas <strong>B</strong> siguen sin verificar. <strong>CERO</strong> cortes, <strong>CERO</strong> compra de kit de madera, y mantener <strong>ABIERTA</strong> la abertura temporal del clóset hasta pasar todas las compuertas y reparar la gotera del techo.',
      conflict_text: 'Otro editor guardó una revisión más reciente en Tailnet (HTTP 409). Recarga el plano más reciente y vuelve a aplicar tu cambio.',
      btn_reload: 'Recargar Plano Actual',
      svg_title_plan: 'Planta a Escala Real — Escotilla de Ático y Pasillo (24" × 36" Libre)',
      svg_title_section: 'Corte Vertical a Escala Real — Ático (66" Altura y 5 Sellos)',
      tab_view_plan: 'Planta Plafón y Pasillo',
      tab_view_section: 'Corte Vertical de Ático',
      drag_hint: 'Arrastra la manija del pasillo en el plano o captura pies abajo',
      lyr_framing: 'Vigas y Corte',
      lyr_furnace: 'Calefactor y Plataforma',
      lyr_enclosure: 'Empaque, Marco y Energía',
      circle_bar_hint: 'Dibuja un círculo sobre cualquier punto del plano (dedo o ratón) para adjuntar un comentario.',
      btn_clear_sketch: 'Borrar Trazo',
      btn_circle_done: 'Salir de Círculo',
      photo_panel_title: 'Descanso elegido — Trazo exacto del plafón pendiente (foto de obra)',
      photo_badge: 'UBICACIÓN ELEGIDA · TRAZO PENDIENTE',
      photo_left: 'Escaleras / Ventana',
      photo_mid: 'PLAFÓN CANDIDATO (ESPERA)',
      photo_right: 'Acceso Puerta 4 →',
      photo_callouts: [
        '<li class="callout-alert"><strong>Descanso común fuera de la Puerta Principal 4:</strong> Confirmar el trazo exacto, los apoyos y la protección contra incendios antes de cortar.</li>',
        '<li><strong>Lámpara de Plafón:</strong> Conservar la luz del descanso y agregar lámpara LED cerrada con apagador en la entrada del ático.</li>',
        '<li><strong>Moldura Alta Original (103"):</strong> Moldura Edwardian original visible en muros — conservar intacta y separar del marco de escotilla.</li>',
        '<li><strong>Libramiento Barandal de Escalera:</strong> Verificar espacio para escalera y apertura de tapa libre de barandal, Puerta 4 y chambranas.</li>'
      ],
      concept_disclaimer_html: '<strong>Foto de Obra vs. Concepto:</strong> La foto superior es el plafón real de Puerta 4. Cualquier boceto ilustrativo aparte es <em>Referencia de concepto — no a escala</em>; verifica siempre con estos planos a escala real.',
      rules_title: '5 Reglas Obligatorias de Sellado y Espera (Antes de Cortar o Cerrar)',
      rules_pill: '24" × 36" Libre Fijo',
      rules_cards: [
        { hold: true, title: '1. Cortafuego + Claro Vigas B Primero', body: 'Confirmar si el plafón es cortafuego Y medir claro B antes de cortar o comprar madera. Si es cortafuego, el kit de madera queda deshabilitado.' },
        { hold: false, title: '2. Sello Fijo y Empaque (Sin Fibra)', body: 'Cordón respaldo 3/8" + sellador en marco fijo; burlete continuo 1/2"×1/8" en apoyos 1×2; junta operable sin sellador (abrir 2 veces); 2 1x2 gasket ledger (12-5/8"×37-1/4") + 3 alambres cal.16 + confirm w/ NEXT (<=1/2"); marco con empaque guardapolvo (sin dique)" sobre aislante.' },
        { hold: false, title: '3. Tapa y Broches', body: 'Tapa propuesta de triplay 3/4" remetida ~1-1/2" (pendiente aprobación dueña) con broches de compresión fuera del claro 24"×36".' },
        { hold: true, title: '4. Mantener Clóset Abierto', body: 'MANTENER ABIERTA la abertura temporal del clóset de recámara hasta tener TANTO el cable de bajo voltaje COMO la escotilla permanente 24"×36".' },
        { hold: true, title: '5. Reparar Gotera del Techo', body: 'Reparar la filtración activa de agua en techo/ático antes de encerrar bastidor, colocar aislante o cerrar plafón.' }
      ],
      clashes_title: 'Choques Marcados y Revisiones de Obra (Nunca Auto-Resueltos)',
      clashes_lock_pill: 'Inmutable · Verificar en Obra',
      takeoff_title: 'Cuantificación Viva de Materiales Propuestos (Solo Cantidades · Sin Precios)',
      takeoff_notice: 'Solo Cantidades Brutas Propuestas (Sin Precios) — Verificar Inventario en Obra Antes de Pedir. Nunca usar triplay de 3/8" en el pasillo.',
      lbl_waste_pct: 'Desperdicio / Margen (%):',
      btn_waste_10: '+10% Estándar',
      btn_waste_15: '+15% Extra',
      saw_kerf_hint: 'Regla de corte de sierra: 1 tira real de 24" por hoja 4×8 (<=7 pies = 1 hoja, 7–14 pies = 2 hojas, 14–20 pies = 3 hojas).',
      editor_title: 'Compuertas en Vivo, Claro Vigas B y Calculadora de Pasillo',
      preset_lbl: 'Prueba Rápida:',
      preset_b_275: 'Claro B = 27.5" (Cabe)',
      preset_b_30: 'Claro B = 30" (Refuerzo Lat.)',
      preset_b_22: 'Claro B = 22" (Exige Cabezal)',
      preset_l_12: 'Pasillo 12 pies (2 Hojas)',
      preset_l_22: 'Pasillo 22 pies (FALLA >20)',
      btn_reset: 'Restaurar Base',
      lbl_author: 'Nombre del Editor',
      lbl_location: 'Estado de Ubicación Candidata',
      lbl_fire_gate: 'Compuerta Cortafuego del Plafón (Bloquea Corte y Kit de Madera)',
      lbl_joist_b: 'Claro Medido Entre Vigas B (pulg)',
      help_joist_b: '27.5" cabe limpio · >27.5" exige respaldo sólido lateral · <27.5" exige cabezal estructural u otro punto (nunca reducir 24"×36").',
      lbl_walkway_l: 'Largo del Pasillo L (pies · máx. 20 pies)',
      help_walkway_l: 'Altura libre de 66" (<6 pies) limita el pasillo a 20 pies máx. Arrastra en el plano o escribe los pies exactos.',
      lbl_offset_1: 'Distancia a Muro / Esquina 1 (pulg · wall_to_wall)',
      lbl_offset_2: 'Distancia a Muro / Esquina 2 (pulg · wall_to_wall)',
      lbl_lid_finish: 'Estado de Tapa Remetida (~1-1/2" triplay 3/4")',
      loc_opts: [
        'SIN CONFIRMAR — Descanso Puerta 4 vs. Pasillo Interior',
        'Confirmado — Dentro del Pasillo Interior Unidad 4',
        'Confirmado — Descanso Puerta 4 (Confirmar Cortafuego)'
      ],
      fire_opts: [
        'EN ESPERA SIN VERIFICAR — NO cortar plafón ni comprar kit de madera',
        'Plafón No Cortafuego Confirmado — Kit de madera 27-1/2" × 39-1/2" elegible',
        'EXIGE PLAFÓN CORTAFUEGO — Kit de madera DESHABILITADO (exige escotilla certificada cortafuego 24" × 36")'
      ],
      lid_opts: [
        'Tapa propuesta ~1-1/2" triplay 3/4" (Pendiente Aprobación) + broches fuera de 24"×36"',
        'Aprobado por Dueña — Tapa remetida triplay 3/4" + broches fuera de 24"×36"',
        'Puerta Cortafuego Aislada Certificada (24" × 36" libre terminado)'
      ],
      btn_apply_local: 'Aplicar Vista Previa',
      btn_save_tailnet: 'Guardar en Tailnet',
      btn_export_json: 'Descargar JSON',
      save_hint_off: 'Modo Solo Lectura / Exportación Local fuera de Tailnet: los cambios solo se previsualizan y exportan en este dispositivo. Conéctate a Tailscale de Tisa para guardar en vivo.',
      save_hint_on: 'Conectado a persistencia Tailnet (:8444). Los cambios se aplican al instante con sello de revisión y registro EOD.',
      trim_title: 'Molduras Originales Existentes (Separar de Moldura de Escotilla)',
      trim_badge: 'Original Edwardian',
      lbl_trim_base: 'Altura de Zoclo Original (pulg)',
      lbl_trim_rail: 'Altura de Moldura Alta Original (pulg)',
      lbl_trim_door: 'Ancho Chambrana Puerta 4 Original (pulg)',
      lbl_trim_win: 'Ancho Chambrana Ventana Original (pulg)',
      voice_title: 'Comentarios Adjuntos y Nota de Voz',
      lbl_intent: 'Acción del Comentario',
      intent_edit: 'Modificar Plano / Medida en Obra',
      intent_problem: 'Reportar Problema / Choque',
      intent_question: 'Responder una Pregunta ("¿Qué es esto aquí?")',
      lbl_note: 'Nota de Obra o Comando Dictado',
      note_placeholder: 'Ejemplo: "Claro entre vigas 27.5 pulgadas", "Pasillo 14 pies", o "¿Es plafón cortafuego?" (Sin precios)',
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
      eod_desc: 'La cuadrilla no espera: los cambios guardados en Tailnet sellan el plano vivo de inmediato. Al final del día, Tisa toca <strong>Aceptar</strong> (promueve a la hoja del ático) o <strong>Rechazar</strong> (revierte).',
      btn_refresh_eod: 'Actualizar desde Tailnet',
      eod_empty: 'No hay cambios pendientes de revisión.',
      btn_accept: 'Aceptar → Hoja Ático',
      btn_reject: 'Rechazar → Revertir',
      tailnet_live: 'Tailnet Activo',
      tailnet_off: 'Fuera de Tailnet · Solo Lectura / Exportar',
      mode_live: 'Guardado en Vivo Tailnet Activo',
      mode_local: 'Solo Lectura + Exportación Local',
      measure_on_site: 'MEDIR EN OBRA',
      provisional_outline: 'Medir en obra — proporción provisional',
      not_yet_synced: 'Sin Sincronizar (Vista Local)',
      pending_eod_stamp: 'Cambio de Obra · Revisión EOD Pendiente',
      synced_stamp: 'Sincronizado con Borrador',
      firewall_err: 'Bloqueado por Filtro de Privacidad: nunca incluyas signos de moneda, precios, cotizaciones, presupuestos, financiamiento ni enlaces de correo.'
    }
  };

  /* ── Runtime State (strictly in-memory, ZERO browser web storage) ── */
  const params = new URLSearchParams(window.location.search);
  let currentLang = (params.get('lang') || '').toLowerCase() === 'es' ? 'es' : 'en';
  let activeView = (params.get('view') || '').toLowerCase() === 'section' ? 'section' : 'plan';
  let state = deepClone(BASELINE_ATTIC_DATA);
  let apiOrigin = resolveApiOrigin(params.get('api'), DEFAULT_API_ORIGIN);
  let voiceOrigin = resolveApiOrigin(params.get('voice_api'), DEFAULT_VOICE_ORIGIN);
  let lastScaleInfo = { view: 'plan', scaleX: 1, scaleY: 1, uniform: true };
  let tailnetState = { checked: false, online: false, verified: false, user: null, pendingEod: [] };
  let hasUnsyncedLocalEdits = false;
  let lastSavedRevId = null;
  let circleMode = false;
  let isDrawing = false;
  let isDraggingWalkway = false;
  let walkwayDragOriginX = 112;
  let walkwayDragScale = 1.4;
  let drawPoints = [];
  let pendingCircleNorm = null;
  let speechRecognition = null;
  let speechListening = false;
  let speechTargetPinIdx = null;
  let toastTimer = null;

  const layers = { framing: true, furnace: true, enclosure: true };

  /* ── Helpers ──────────────────────────────────────────────────────── */
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function ensureStateDefaults(target) {
    if (!target.existing_original_trim) {
      target.existing_original_trim = deepClone(BASELINE_ATTIC_DATA.existing_original_trim);
    }
    if (!target.takeoff_settings) {
      target.takeoff_settings = deepClone(BASELINE_ATTIC_DATA.takeoff_settings);
    }
    if (!target.enclosure_rules) {
      target.enclosure_rules = deepClone(BASELINE_ATTIC_DATA.enclosure_rules);
    }
    if (!target.enclosure_rules.lid_finish_status) {
      target.enclosure_rules.lid_finish_status = 'PENDING_OWNER_OK';
    }
    if (!target.orientation) {
      target.orientation = deepClone(BASELINE_ATTIC_DATA.orientation);
    }
    /* Immutable locked finished clear 24" x 36" + immutable flagged_clashes */
    target.dimensions.finished_clear_width_in.value = 24.0;
    target.dimensions.finished_clear_length_in.value = 36.0;
    target.flagged_clashes = deepClone(BASELINE_ATTIC_DATA.flagged_clashes);
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
    if (sixteenths === 0) return `${sign}${whole}"`;
    const g = gcd(sixteenths, 16);
    const n = sixteenths / g;
    const d = 16 / g;
    return whole === 0 ? `${sign}${n}/${d}"` : `${sign}${whole}-${n}/${d}"`;
  }

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
    toastTimer = setTimeout(() => { el.hidden = true; }, 4500);
  }

  /* ── Engineering Validation & Live Materials Takeoff (ZERO prices) ── */
  function computeDerived() {
    ensureStateDefaults(state);
    const d = state.dimensions;
    const enc = state.enclosure_rules;
    const furn = state.equipment_basis.furnace;

    const clearW = 24.0;
    const clearL = 36.0;
    const woodCutW = 27.5;
    const woodCutL = 39.5;
    const fireGate = enc.fire_rating_gate || 'UNVERIFIED_HOLD';
    const woodKitDisabled = fireGate === 'FIRE_RATED_REQUIRED';
    const woodKitHold = fireGate === 'UNVERIFIED_HOLD';

    const joistB = d.joist_bay_width_b_in.value === null || d.joist_bay_width_b_in.value === ''
      ? null
      : Number(d.joist_bay_width_b_in.value);

    let joistStatus = 'MEASURE';
    if (joistB !== null) {
      if (Math.abs(joistB - woodCutW) < 0.0625) joistStatus = 'FITS_EXACT';
      else if (joistB > woodCutW) joistStatus = 'PASS_SIDE_BACKING';
      else joistStatus = 'STOP_HEADER_REQUIRED';
    }

    const atticH = Number(d.attic_height_in.value) || 66.0;
    const maxWalkFt = atticH < 72.0 ? 20.0 : 30.0;
    const walkFt = d.walkway_run_length_ft.value === null || d.walkway_run_length_ft.value === ''
      ? null
      : Number(d.walkway_run_length_ft.value);

    let walkStatus = 'MEASURE';
    let walkwaySheets = null;
    if (walkFt !== null) {
      if (walkFt > maxWalkFt + 1e-6) {
        walkStatus = 'FAIL_CAP';
        walkwaySheets = Math.ceil(walkFt / 7.0);
      } else {
        walkStatus = 'PASS';
        /* Saw-kerf rule: 1 true 24" strip per 4x8 sheet (<=7ft: 1, 7-14ft: 2, 14-20ft: 3) */
        walkwaySheets = walkFt <= 0 ? 0 : (walkFt <= 7.0 ? 1 : walkFt <= 14.0 ? 2 : 3);
      }
    }

    /* Furnace end-first clearance check (14.19" x 29.0" through 24" x 36" locked clear) */
    const furnW = furn.width_in || 14.19;
    const furnD = furn.depth_in || 29.0;
    const clearMarginAcross = Number((clearW - furnW).toFixed(2)); // 9.81"
    const clearMarginAlong = Number((clearL - furnD).toFixed(2));  // 7.00"
    const furnaceFits = clearMarginAcross > 0 && clearMarginAlong > 0;

    const off1 = state.orientation.wall_offset_1_in.value === null ? null : Number(state.orientation.wall_offset_1_in.value);
    const off2 = state.orientation.wall_offset_2_in.value === null ? null : Number(state.orientation.wall_offset_2_in.value);

    return {
      clearW, clearL, woodCutW, woodCutL,
      fireGate, woodKitDisabled, woodKitHold,
      joistB, joistStatus,
      atticH, maxWalkFt, walkFt, walkStatus, walkwaySheets,
      furnW, furnD, clearMarginAcross, clearMarginAlong, furnaceFits,
      off1, off2
    };
  }

  function computeTakeoff() {
    ensureStateDefaults(state);
    const m = computeDerived();
    const wastePct = Math.max(0, Math.min(30, Number(state.takeoff_settings.waste_pct != null ? state.takeoff_settings.waste_pct : 10)));

    /* 4x8 23/32" OSB or 3/4" Structural Plywood (NEVER 3/8" ply) */
    const walkSheetsNet = m.walkwaySheets !== null ? m.walkwaySheets : null;
    /* 1 sheet covers 30"x30" service platform + 1x2 gasket ledger offcuts + lid when wood kit applies */
    const platformDamSheets = 1;
    const totalSheetsNet = walkSheetsNet !== null ? walkSheetsNet + platformDamSheets : null;
    const totalSheetsGross = totalSheetsNet !== null ? Math.ceil(totalSheetsNet * (1 + wastePct / 100.0)) : null;

    /* Wood-kit framing & trim (DISABLED when FIRE_RATED_REQUIRED) */
    const ledge1x2LF = m.woodKitDisabled ? 0 : Math.ceil(11.0 * (1 + wastePct / 100.0));
    const trim1x3LF = m.woodKitDisabled ? 0 : Math.ceil(13.0 * (1 + wastePct / 100.0));
    const sideBackingLF = (!m.woodKitDisabled && m.joistStatus === 'PASS_SIDE_BACKING') ? 10 : 0;

    /* Air-seal & weatherstrip */
    const backerRodLF = Math.ceil(12.5 * (1 + wastePct / 100.0));
    const weatherstripLF = Math.ceil(11.0 * (1 + wastePct / 100.0));

    return {
      waste_pct: wastePct,
      wood_kit_disabled: m.woodKitDisabled,
      walkway_sheets_4x8: walkSheetsNet,
      platform_dam_sheets_4x8: platformDamSheets,
      total_osb_ply_sheets_net: totalSheetsNet,
      total_osb_ply_sheets_gross: totalSheetsGross,
      walkway_cap_exceeded: m.walkStatus === 'FAIL_CAP',
      ledge_1x2_lf: ledge1x2LF,
      trim_1x3_lf: trim1x3LF,
      side_backing_2x_lf: sideBackingLF,
      wood_screws_9_pcs: m.woodKitDisabled ? 30 : 60,
      backer_rod_3_8_lf: backerRodLF,
      weatherstrip_closed_cell_lf: weatherstripLF,
      unfaced_batts_count: 0,
      wire_loops_16ga_count: 3,
      screw_eyes_half_in_count: 0,
      compression_latches_count: 4
    };
  }

  function computeRevisionStamp() {
    const tr = I18N[currentLang];
    const rev = 'rev-20261124-attic-r4';
    if (params.get('snapshot') === '1' || params.get('print') === '1') {
      return currentLang === 'es' ? `${rev} · Edición Oficial R4 (24 Nov 2026)` : `${rev} · Official Print Edition R4 (2026-11-24)`;
    }
    if (hasUnsyncedLocalEdits) return `${rev} · ${tr.not_yet_synced}`;
    if ((tailnetState.pendingEod && tailnetState.pendingEod.length > 0) || (state.field_overrides && state.field_overrides.length > 0)) {
      return `${rev} · ${tr.pending_eod_stamp}`;
    }
    return `${rev} · ${tr.synced_stamp}`;
  }

  /* ── Shared Attached Comment Callouts Layer (SVG Leader Lines) ────── */
  function buildPinsSvg() {
    const pins = state.pins || [];
    if (!pins.length) return '';
    return pins.map((pin, idx) => {
      const px = (pin.cx || 0.35) * 920;
      const py = (pin.cy || 0.35) * 1120;
      const rx = Math.max(14, (pin.rx || 0.03) * 920);
      const ry = Math.max(14, (pin.ry || 0.025) * 1120);
      const isQuestion = pin.mode === 'ask_question' || pin.intent === 'ask_question';
      const pinColor = pin.intent === 'flag_problem' ? '#b91c1c' : isQuestion ? '#15539e' : '#b45309';
      const badgeX = px + rx * 0.72;
      const badgeY = py - ry * 0.72;
      const cardX = 526;
      const cardY = Math.min(820, 744 + idx * 36);
      const snippet = String(pin.note || (currentLang === 'es' ? 'Comentario adjunto' : 'Attached comment')).slice(0, 44);
      const statusTxt = pin.agent_status === 'answered'
        ? (currentLang === 'es' ? 'Respondido' : 'Answered')
        : pin.agent_status === 'sent_applied'
          ? (currentLang === 'es' ? 'Enviado' : 'Sent')
          : 'Local';
      return `
        <g class="attic-pin" data-pin-idx="${idx}" data-elem="attached-pin-${idx}">
          <ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"
                   fill="${pinColor}" fill-opacity="0.10" stroke="${pinColor}" stroke-width="2.4" stroke-dasharray="5,3"/>
          <polyline class="pin-leader" points="${badgeX.toFixed(1)},${badgeY.toFixed(1)} ${(cardX - 18).toFixed(1)},${(cardY + 13).toFixed(1)} ${cardX.toFixed(1)},${(cardY + 13).toFixed(1)}"
                    fill="none" stroke="${pinColor}" stroke-width="1.5" stroke-dasharray="4,2"/>
          <circle cx="${cardX.toFixed(1)}" cy="${(cardY + 13).toFixed(1)}" r="3.2" fill="${pinColor}"/>
          <circle cx="${badgeX.toFixed(1)}" cy="${badgeY.toFixed(1)}" r="10" fill="${pinColor}"/>
          <text x="${badgeX.toFixed(1)}" y="${(badgeY + 3.5).toFixed(1)}" font-size="9" text-anchor="middle" font-weight="700" fill="#ffffff">${idx + 1}</text>
          <rect x="${cardX.toFixed(1)}" y="${cardY.toFixed(1)}" width="360" height="27" rx="3" fill="#ffffff" fill-opacity="0.97" stroke="${pinColor}" stroke-width="1.2"/>
          <text x="${(cardX + 8).toFixed(1)}" y="${(cardY + 11.5).toFixed(1)}" font-size="7.4" font-weight="700" fill="${pinColor}">#${idx + 1} · ${esc(pin.author || 'Field')} [${esc(statusTxt)}]</text>
          <text x="${(cardX + 8).toFixed(1)}" y="${(cardY + 22.5).toFixed(1)}" font-size="7.2" fill="#10202b">${esc(snippet)}</text>
        </g>`;
    }).join('');
  }

  /* ── Tab 2: True-Scale Attic Vertical Section (scaleX === scaleY) ─── */
  function renderSectionSvg(svgEl, m, tk) {
    const isEs = currentLang === 'es';
    const stamp = computeRevisionStamp();
    const trim = state.existing_original_trim;
    /* Strict Uniform True Scale: ONE scalar pxPerIn for both X & Y */
    const pxPerIn = 2.60;
    lastScaleInfo = { view: 'section', scaleX: pxPerIn, scaleY: pxPerIn, uniform: true };

    const ox = 110;
    const floorY = 895;
    const hallH = 108.0; // Hallway ceiling height reference
    const joistDepth = 10.0; // Joist/ceiling assembly thickness
    const atticH = m.atticH; // 66" confirmed (< 6 ft)
    const wallSpan = 128.0; // Section cut width across hallway + attic

    const sx = (xIn) => ox + xIn * pxPerIn;
    const sy = (hIn) => floorY - hIn * pxPerIn;

    const yHallCeil = sy(hallH);
    const yAtticFloor = sy(hallH + joistDepth);
    const yAtticPeak = sy(hallH + joistDepth + atticH);

    const railH = trim.high_picture_rail_height_in.value !== null ? Number(trim.high_picture_rail_height_in.value) : 103.0;
    const baseH = trim.baseboard_height_in.value !== null ? Number(trim.baseboard_height_in.value) : 9.5;
    const yRail = sy(railH);
    const yBase = sy(baseH);

    /* Hatch opening centered in hallway (36" along section cut) */
    const hatchStartIn = 24.0;
    const hatchClearW = m.clearL; // 36" clear along hall
    const woodCutW = m.woodCutL;  // 39.5" wood-kit rough opening
    const cutStartIn = hatchStartIn - (woodCutW - hatchClearW) / 2;

    /* Furnace sits on 30"x30" service platform to right of hatch */
    const platXIn = 78.0;
    const furnH = state.equipment_basis.furnace.height_in || 33.25;
    const furnD = state.equipment_basis.furnace.depth_in || 29.0;

    const ftPx = 12 * pxPerIn;
    const barX = 526;
    const barY = 918;
    const pinsMarkup = buildPinsSvg();

    const gateColor = m.woodKitDisabled ? '#b91c1c' : m.woodKitHold ? '#b45309' : '#2f4f42';
    const gateBg = m.woodKitDisabled ? '#fef2f2' : m.woodKitHold ? '#fffbeb' : '#e6efe9';
    const gateBanner = m.woodKitDisabled
      ? (isEs ? 'CORTAFUEGO EXIGIDO · KIT MADERA BLOQUEADO' : 'FIRE-RATED REQUIRED · WOOD KIT DISABLED')
      : m.woodKitHold
        ? (isEs ? 'CORTAFUEGO SIN VERIFICAR · CERO CORTES' : 'FIRE RATING UNVERIFIED · ZERO CUTS HOLD')
        : (isEs ? 'NO CORTAFUEGO · KIT MADERA ELEGIBLE' : 'NON-RATED CONFIRMED · WOOD KIT ELIGIBLE');

    svgEl.innerHTML = `
      <defs>
        <pattern id="insulHatch" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 0 5 Q 2.5 0, 5 5 T 10 5" fill="none" stroke="#d97706" stroke-width="0.9"/>
        </pattern>
        <pattern id="woodHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#8f4a16" stroke-width="1.2"/>
        </pattern>
      </defs>

      <rect x="10" y="10" width="900" height="1100" fill="#ffffff" stroke="#10202b" stroke-width="1.8"/>
      <rect x="10" y="10" width="900" height="54" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <text x="24" y="32" font-size="13.2" font-weight="700" fill="#10202b">${isEs ? 'CORTE VERTICAL DE ÁTICO — ESCOTILLA 24" × 36" Y ALTURA 66"' : 'ATTIC VERTICAL SECTION — 24" × 36" HATCH & 66" HEADROOM'}</text>
      <text x="24" y="49" font-size="8.6" fill="#4b5c69">${isEs ? 'Borrador de Planeación · Escala Real Uniforme (scaleX = scaleY) · 5 Reglas de Sellado · Sin Precios' : 'Working Planning Draft · Uniform True Scale (scaleX = scaleY) · 5 Enclosure Seals · Zero Prices'}</text>

      <rect x="576" y="18" width="320" height="38" rx="4" fill="${gateBg}" stroke="${gateColor}" stroke-width="1.3"/>
      <text x="736" y="33" font-size="8.8" text-anchor="middle" font-weight="700" fill="${gateColor}">${esc(gateBanner)}</text>
      <text x="736" y="47" font-size="7.4" text-anchor="middle" fill="#334155">${esc(stamp)}</text>

      <!-- Flat / Low-Slope Roof Deck over 66" Clear Attic Cavity (ZERO Roof Penetrations) -->
      <rect x="${sx(0).toFixed(1)}" y="${yAtticPeak.toFixed(1)}" width="${(wallSpan * pxPerIn).toFixed(1)}" height="${(yAtticFloor - yAtticPeak).toFixed(1)}"
            fill="#f8fafc" stroke="#10202b" stroke-width="2.0"/>
      <rect x="${sx(0).toFixed(1)}" y="${(yAtticPeak - 9).toFixed(1)}" width="${(wallSpan * pxPerIn).toFixed(1)}" height="9"
            fill="#cbd5e1" stroke="#10202b" stroke-width="1.6"/>
      <text x="${sx(wallSpan / 2).toFixed(1)}" y="${(yAtticPeak + 14).toFixed(1)}" font-size="7.6" text-anchor="middle" font-weight="700" fill="#15539e">${isEs ? 'TECHO PLANO (66" LIBRES · CERO PENETRACIONES EN TECHO)' : 'FLAT / LOW-SLOPE ROOF DECK (66" CAVITY · ZERO ROOF PENETRATIONS)'}</text>

      <!-- Loose-fill Attic Insulation (left & right of 1x2 gasket ledger) -->
      <rect x="${sx(4).toFixed(1)}" y="${(yAtticFloor - 11 * pxPerIn).toFixed(1)}" width="${((cutStartIn - 4) * pxPerIn).toFixed(1)}" height="${(11 * pxPerIn).toFixed(1)}" fill="url(#insulHatch)" stroke="#d97706" stroke-width="0.9"/>
      <rect x="${sx(cutStartIn + woodCutW).toFixed(1)}" y="${(yAtticFloor - 11 * pxPerIn).toFixed(1)}" width="${((platXIn - (cutStartIn + woodCutW)) * pxPerIn).toFixed(1)}" height="${(11 * pxPerIn).toFixed(1)}" fill="url(#insulHatch)" stroke="#d97706" stroke-width="0.9"/>

      <!-- uninsulated gasketed frame (unconditioned landing)" above loose fill (13" high) -->
      

      <!-- Ceiling Joist Layer (split by hatch opening) -->
      <rect x="${sx(0).toFixed(1)}" y="${yAtticFloor.toFixed(1)}" width="${(cutStartIn * pxPerIn).toFixed(1)}" height="${(joistDepth * pxPerIn).toFixed(1)}" fill="url(#woodHatch)" stroke="#10202b" stroke-width="1.5"/>
      <rect x="${sx(cutStartIn + woodCutW).toFixed(1)}" y="${yAtticFloor.toFixed(1)}" width="${((wallSpan - (cutStartIn + woodCutW)) * pxPerIn).toFixed(1)}" height="${(joistDepth * pxPerIn).toFixed(1)}" fill="url(#woodHatch)" stroke="#10202b" stroke-width="1.5"/>

      <!-- Locked 24" x 36" Hatch Opening + Lid + Uninsulated 3/4" ply lid + 2 ring pulls + 4 latches outside 24"×36" clear (unconditioned Door 4 landing)
      <rect data-elem="hatch-clear" x="${sx(hatchStartIn).toFixed(1)}" y="${yAtticFloor.toFixed(1)}" width="${(hatchClearW * pxPerIn).toFixed(1)}" height="${(joistDepth * pxPerIn).toFixed(1)}"
            fill="#e8f1fb" stroke="#15539e" stroke-width="1.8"/>
      <!-- Recessed 3/4" ply lid (~1-1/2" recess) + Uninsulated 3/4" ply lid + 2 ring pulls + 4 latches outside 24"×36" clear (unconditioned Door 4 landing)
      <rect x="${sx(hatchStartIn).toFixed(1)}" y="${(yHallCeil - 2.25 * pxPerIn).toFixed(1)}" width="${(hatchClearW * pxPerIn).toFixed(1)}" height="${(1.5 * pxPerIn).toFixed(1)}"
            fill="${m.woodKitDisabled ? '#fecaca' : '#cbd5e1'}" stroke="${m.woodKitDisabled ? '#b91c1c' : '#10202b'}" stroke-width="1.3"/>
      
      <text x="${sx(hatchStartIn + hatchClearW / 2).toFixed(1)}" y="${(yHallCeil + 14).toFixed(1)}" font-size="8.0" text-anchor="middle" font-weight="700" fill="#15539e">${isEs ? '36" LIBRE TERMINADO (FIJO)' : '36" FINISHED CLEAR (LOCKED)'}</text>

      <!-- 30" x 30" Service Platform + 33.25" Tall Carrier/Bryant Furnace + Type B Vent >= 1" -->
      <rect data-elem="service-platform" x="${sx(platXIn).toFixed(1)}" y="${(yAtticFloor - 1.5 * pxPerIn).toFixed(1)}" width="${(30 * pxPerIn).toFixed(1)}" height="${(1.5 * pxPerIn).toFixed(1)}" fill="#2f4f42"/>
      <rect data-elem="furnace-section" x="${sx(platXIn + 2).toFixed(1)}" y="${(yAtticFloor - (1.5 + furnH) * pxPerIn).toFixed(1)}" width="${(furnD * pxPerIn).toFixed(1)}" height="${(furnH * pxPerIn).toFixed(1)}"
            fill="#e2e8f0" stroke="#10202b" stroke-width="1.7"/>
      <text x="${sx(platXIn + 16.5).toFixed(1)}" y="${(yAtticFloor - 19 * pxPerIn).toFixed(1)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#10202b">CARRIER / BRYANT</text>
      <text x="${sx(platXIn + 16.5).toFixed(1)}" y="${(yAtticFloor - 14 * pxPerIn).toFixed(1)}" font-size="6.8" text-anchor="middle" fill="#334155">33-1/4" H × 29" D</text>
      <!-- Horizontal Sidewall Exhaust (Power Venter or 95%+ PVC Direct-Vent, >=1/4"/ft pitch out exterior wall) -->
      <line x1="${sx(platXIn + 26).toFixed(1)}" y1="${(yAtticFloor - (furnH - 4) * pxPerIn).toFixed(1)}"
            x2="${sx(wallSpan).toFixed(1)}" y2="${(yAtticFloor - (furnH + 3) * pxPerIn).toFixed(1)}"
            stroke="#c2410c" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="${sx(wallSpan).toFixed(1)}" cy="${(yAtticFloor - (furnH + 3) * pxPerIn).toFixed(1)}" r="4.5" fill="#fff7ed" stroke="#c2410c" stroke-width="1.8"/>
      <text x="${(sx(wallSpan) - 4).toFixed(1)}" y="${(yAtticFloor - (furnH + 7) * pxPerIn).toFixed(1)}" font-size="6.5" text-anchor="end" font-weight="700" fill="#9a3412">${isEs ? 'Salida Lateral >=1/4"/pie (SFMC 802.8 >=4ft)' : 'Sidewall Exit >=1/4"/ft (SFMC 802.8 >=4ft)'}</text>

      <!-- 66" Confirmed Attic Headroom Dimension (< 6 ft -> 20 ft walkway cap) -->
      <line x1="${(sx(0) - 24).toFixed(1)}" y1="${yAtticFloor.toFixed(1)}" x2="${(sx(0) - 24).toFixed(1)}" y2="${yAtticPeak.toFixed(1)}" stroke="#b91c1c" stroke-width="1.5"/>
      <text x="${(sx(0) - 30).toFixed(1)}" y="${((yAtticFloor + yAtticPeak) / 2).toFixed(1)}" font-size="8.4" text-anchor="end" font-weight="700" fill="#b91c1c">66" (5'-6")</text>
      <text x="${(sx(0) - 30).toFixed(1)}" y="${((yAtticFloor + yAtticPeak) / 2 + 11).toFixed(1)}" font-size="6.8" text-anchor="end" fill="#7f1d1d">${isEs ? 'Tope pasillo 20 pies' : 'Caps walk <= 20 ft'}</text>

      <!-- Hallway Walls & Floor Below + Existing Original Trim (9-1/2" Baseboard & 103" Picture Rail) -->
      <rect x="${sx(0).toFixed(1)}" y="${yHallCeil.toFixed(1)}" width="${(wallSpan * pxPerIn).toFixed(1)}" height="${(floorY - yHallCeil).toFixed(1)}" fill="#fbfdfb" stroke="#10202b" stroke-width="2.0"/>

      <!-- Original 103" High Picture Rail (physically moves on edit!) -->
      <line data-elem="picture-rail" x1="${sx(0).toFixed(1)}" y1="${yRail.toFixed(1)}" x2="${sx(wallSpan).toFixed(1)}" y2="${yRail.toFixed(1)}" stroke="#64748b" stroke-width="1.4" stroke-dasharray="5,3"/>
      <rect x="${(sx(wallSpan) - 156).toFixed(1)}" y="${(yRail - 13).toFixed(1)}" width="150" height="12" rx="2" fill="#ffffff" stroke="#64748b" stroke-width="0.8"/>
      <text x="${(sx(wallSpan) - 81).toFixed(1)}" y="${(yRail - 4.5).toFixed(1)}" font-size="6.8" text-anchor="middle" font-weight="700" fill="#334155">${isEs ? 'Moldura Alta Orig.' : 'Orig. Picture Rail'}: ${esc(toFrac16(railH))}</text>

      <!-- Original 9-1/2" Baseboard (physically moves on edit!) -->
      <rect data-elem="orig-baseboard" x="${sx(0).toFixed(1)}" y="${yBase.toFixed(1)}" width="${(wallSpan * pxPerIn).toFixed(1)}" height="${(floorY - yBase).toFixed(1)}" fill="#e2e8f0" fill-opacity="0.6" stroke="#475569" stroke-width="1.1"/>
      <text x="${sx(wallSpan / 2).toFixed(1)}" y="${((yBase + floorY) / 2 + 3).toFixed(1)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#334155">${isEs ? 'Zoclo Original Edwardian (Conservar):' : 'Original Edwardian Baseboard (Preserve):'} ${esc(toFrac16(baseH))}</text>

      <!-- Right Column: 5 Enclosure Seal Details & Electrical Rules -->
      <rect x="514" y="76" width="382" height="390" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.1"/>
      <text x="526" y="96" font-size="9.2" font-weight="700" fill="#15539e">${isEs ? 'DETALLE DE 5 SELLOS Y REGLAS ELÉCTRICAS' : '5 ENCLOSURE SEAL DETAILS & ELECTRICAL RULES'}</text>
      <text x="526" y="118" font-size="8.0" font-weight="700" fill="#10202b">1. ${isEs ? 'Marco Fijo:' : 'Fixed Frame Seal:'}</text>
      <text x="536" y="132" font-size="7.5" fill="#334155">${isEs ? 'Cordón respaldo 3/8" + sellador pintable alrededor del marco.' : '3/8" backer rod + paintable sealant around perimeter frame.'}</text>
      <text x="526" y="152" font-size="8.0" font-weight="700" fill="#10202b">2. ${isEs ? 'Burlete y Junta Operable:' : 'Ledge Weatherstrip & Operable Seam:'}</text>
      <text x="536" y="166" font-size="7.5" fill="#334155">${isEs ? '1/2"×1/8" celda cerrada en apoyos 1×2 (sin pintura/sellador).' : 'Continuous 1/2"×1/8" closed-cell on 1×2 ledges (clean of paint).'}</text>
      <text x="536" y="179" font-size="7.5" fill="#334155">${isEs ? 'Junta de tapa SIN sellador — probar apertura 2 veces.' : 'Uncaulked operable lid seam — test-open twice.'}</text>
      <text x="526" y="199" font-size="8.0" font-weight="700" fill="#10202b">3. ${isEs ? 'Tapa 3/4" Sin Fibra + Empaque:' : 'Lid Batts + 1x2 gasket ledger:'}</text>
      <text x="536" y="213" font-size="7.5" fill="#334155">${isEs ? '2 1x2 gasket ledger (12-5/8"×37-1/4") + 3 alambres cal.16 + confirm w/ NEXT <=1/2".' : 'Uninsulated 3/4" ply lid + 2 ring pulls + 4 latches outside 24"×36" clear (unconditioned Door 4 landing)"×37-1/4") + 3 1x2 gasket ledger + confirm w/ NEXT <=1/2".'}</text>
      <text x="536" y="226" font-size="7.5" fill="#334155">${isEs ? 'Descanso no acondicionado (CAEC §160.1(a)): cero fibra ni dique.' : '1x2 gasket ledger standing 2" above loose-fill insulation.'}</text>
      <text x="526" y="246" font-size="8.0" font-weight="700" fill="#10202b">4. ${isEs ? 'Tapa Remetida y Broches:' : 'Recessed Lid & Latches:'}</text>
      <text x="536" y="260" font-size="7.5" fill="#334155">${isEs ? 'Tapa triplay 3/4" remetida ~1-1/2" (pend. dueña) · broches fuera de 24"×36".' : 'Proposed ~1-1/2" recessed 3/4" ply lid (pending OK) · latches outside 24"×36".'}</text>
      <text x="526" y="282" font-size="8.0" font-weight="700" fill="#b91c1c">5. ${isEs ? 'Bloqueos Clóset y Gotera Techo:' : 'Closet Hold & Active Roof Leak:'}</text>
      <text x="536" y="296" font-size="7.5" fill="#7f1d1d">${isEs ? 'Mantener clóset recámara ABIERTO hasta cable LV + escotilla 24"×36".' : 'KEEP temp bedroom closet OPEN until LV cable + permanent 24"×36" hatch.'}</text>
      <text x="536" y="309" font-size="7.5" fill="#7f1d1d">${isEs ? 'Reparar gotera activa de techo antes de aislar o encerrar.' : 'Repair active roof/attic leak before enclosing or insulating.'}</text>
      <line x1="526" y1="326" x2="884" y2="326" stroke="#cbd5e1" stroke-width="0.9"/>
      <text x="526" y="346" font-size="8.2" font-weight="700" fill="#2f4f42">${isEs ? 'ELECTRICIDAD ÁTICO:' : 'ATTIC ELECTRICAL REQUIREMENTS:'}</text>
      <text x="536" y="362" font-size="7.5" fill="#334155">• ${isEs ? 'Lámpara LED cerrada con apagador en entrada (conservar luz descanso).' : 'Entrance-switched enclosed LED light (retain landing light).'}</text>
      <text x="536" y="376" font-size="7.5" fill="#334155">• ${isEs ? 'Contacto 120V GFCI <= 25 pies en lado línea (independiente).' : '120V GFCI <= 25 ft wired live on line side (independent of disconnect).'}</text>
      <text x="536" y="390" font-size="7.5" fill="#334155">• ${isEs ? 'Circuito dedicado calefactor + desconectador a la vista.' : 'Dedicated furnace circuit + disconnect switch in sight.'}</text>
      <text x="536" y="410" font-size="7.5" font-weight="700" fill="#b91c1c">• ${isEs ? 'Plataforma 30"×30": confirmar herraje de montaje con NEXT.' : '30"×30" Platform: confirm vibration mount requirements w/ NEXT (HVAC handles install).'}</text>

      <!-- Bar Scale -->
      <text x="${barX}" y="${barY - 14}" font-size="8.2" font-weight="700" fill="#10202b">${isEs ? 'ESCALA GRÁFICA CORTE (Escala Real X = Y)' : 'SECTION BAR SCALE (Uniform True Scale X = Y)'}</text>
      <rect x="${barX}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 2).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 3).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <text x="${barX}" y="${barY + 14}" font-size="8.0" text-anchor="middle">0'</text>
      <text x="${(barX + ftPx).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">1'</text>
      <text x="${(barX + ftPx * 2).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">2'</text>
      <text x="${(barX + ftPx * 3).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">3'</text>
      <text x="${(barX + ftPx * 4).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">4'</text>

      ${buildTitleBlockSvg(m, tk, isEs, stamp)}
      <g id="attic-pins-layer">${pinsMarkup}</g>
    `;
    syncCanvasSize();
  }

  function buildTitleBlockSvg(m, tk, isEs, stamp) {
    const sheetsTxt = tk.total_osb_ply_sheets_gross !== null
      ? `${tk.total_osb_ply_sheets_gross} × 4×8 (23/32" OSB / 3/4" ply)`
      : (isEs ? 'Medir pasillo L' : 'Measure walkway L');
    return `
      <rect x="16" y="962" width="888" height="138" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <line x1="316" y1="962" x2="316" y2="1100" stroke="#10202b" stroke-width="1.1"/>
      <line x1="654" y1="962" x2="654" y2="1100" stroke="#10202b" stroke-width="1.1"/>
      <text x="28" y="988" font-size="11.2" font-weight="700" fill="#10202b">1231 11th Ave · Unit 4 · ${isEs ? 'Ático' : 'Attic'}</text>
      <text x="28" y="1008" font-size="9.0" fill="#334155">San Francisco, CA 94122 · ${isEs ? 'Sin Precios' : 'Zero Prices'}</text>
      <text x="28" y="1032" font-size="7.8" fill="#4b5c69">${isEs ? 'Semilla' : 'Seed'}: attic-hatch-plan-data.json</text>
      <text x="28" y="1050" font-size="7.8" fill="#4b5c69">${isEs ? 'Hoja de Cuarto' : 'Room Spec'}: attic/SPEC.md</text>
      <text x="28" y="1084" font-size="7.4" fill="#4b5c69">${isEs ? 'Hojas Pasillo + Plataforma' : 'Walkway + Platform Sheets'}: ${esc(sheetsTxt)}</text>

      <text x="330" y="990" font-size="11.8" font-weight="700" fill="#15539e">${isEs ? 'Escotilla Permanente de Ático (24" × 36" Libre)' : 'Permanent Attic Hatch (24" × 36" Clear)'}</text>
      <text x="330" y="1010" font-size="8.5" fill="#10202b">Carrier/Bryant 45k BTU (14.19" × 29" ${isEs ? 'de punta' : 'end-first'}) · 66" ${isEs ? 'altura' : 'attic H'}</text>
      <text x="330" y="1034" font-size="8.4" font-weight="700" fill="#b91c1c">${isEs ? 'BORRADOR DE PLANEACIÓN — CERO CORTES HASTA CONFIRMAR' : 'WORKING PLANNING DRAFT — ZERO CUTS UNTIL GATES PASS'}</text>
      <rect x="330" y="1050" width="310" height="34" rx="3" fill="${hasUnsyncedLocalEdits ? '#fffbeb' : '#e8f1fb'}" stroke="${hasUnsyncedLocalEdits ? '#d97706' : '#15539e'}" stroke-width="1"/>
      <text x="340" y="1064" font-size="7.6" font-weight="700" fill="#10202b">${isEs ? 'SELLO DE REVISIÓN:' : 'REVISION STAMP:'}</text>
      <text x="340" y="1077" font-size="8.0" font-weight="700" fill="${hasUnsyncedLocalEdits ? '#b45309' : '#15539e'}">${esc(stamp)}</text>

      <text x="668" y="990" font-size="9.0" font-weight="700" fill="#10202b">${isEs ? 'ESCALA: Escala Real (scaleX = scaleY)' : 'SCALE: Uniform True Scale (scaleX = scaleY)'}</text>
      <text x="668" y="1012" font-size="8.2" fill="#334155">${isEs ? 'Claro Fijo' : 'Locked Clear'}: 24" × 36" (clear_between_casings)</text>
      <text x="668" y="1034" font-size="8.2" fill="#334155">${isEs ? 'Claro Vigas B' : 'Joist Bay B'}: ${esc(m.joistB === null ? I18N[currentLang].measure_on_site : toFrac16(m.joistB))}</text>
      <text x="668" y="1058" font-size="8.0" font-weight="700" fill="#10202b">${isEs ? 'Inglés Rige · Verificar en obra' : 'EN Governs · Verify all dims in field'}</text>
      <text x="668" y="1084" font-size="7.4" fill="#4b5c69">${isEs ? 'Brújula N/S/E/O · 36" a lo largo × 24" ancho' : 'Compass N/S/E/W · 36" along hall × 24" across'}</text>
    `;
  }

  /* ── Tab 1: True-Scale Ceiling & Hallway Plan + Draggable Walkway ─── */
  function renderSvg() {
    const svgEl = document.getElementById('attic-svg');
    if (!svgEl) return;

    ensureStateDefaults(state);
    const m = computeDerived();
    const tk = computeTakeoff();
    const tr = I18N[currentLang];
    const isEs = currentLang === 'es';
    const stamp = computeRevisionStamp();

    if (activeView === 'section') {
      renderSectionSvg(svgEl, m, tk);
      return;
    }

    /* Upper View: Ceiling Framing & Hatch Plan at strict uniform scale (scaleX === scaleY = 4.8 px/in) */
    const sTop = 4.8;
    lastScaleInfo = { view: 'plan', scaleX: sTop, scaleY: sTop, uniform: true };

    const cx = 264;
    const cy = 286;
    const clearWpx = m.clearL * sTop; // 36" along hall (horizontal)
    const clearHpx = m.clearW * sTop; // 24" across hall (vertical)
    const cutWpx = m.woodCutL * sTop; // 39.5"
    const cutHpx = m.woodCutW * sTop; // 27.5"

    const furnWpx = m.furnD * sTop;   // 29.0" along 36"
    const furnHpx = m.furnW * sTop;   // 14.19" across 24"

    /* Joist bay B spacing (vertical bay height between joists in px) */
    const bayProv = m.joistB === null;
    const drawnBayIn = bayProv ? 27.5 : Math.max(14, Math.min(44, m.joistB));
    const bayHpx = drawnBayIn * sTop;
    const joistTopY = cy - bayHpx / 2;
    const joistBotY = cy + bayHpx / 2;
    const joistStroke = bayProv ? '#d97706' : m.joistStatus === 'STOP_HEADER_REQUIRED' ? '#b91c1c' : '#8f4a16';

    /* Side backing strips when B > 27.5" */
    const sideGapPx = Math.max(0, (bayHpx - cutHpx) / 2);
    const sideBackingSvg = (!bayProv && m.joistStatus === 'PASS_SIDE_BACKING' && !m.woodKitDisabled)
      ? `<rect x="${(cx - cutWpx / 2).toFixed(1)}" y="${joistTopY.toFixed(1)}" width="${cutWpx.toFixed(1)}" height="${sideGapPx.toFixed(1)}" fill="#fef3c7" stroke="#8f4a16" stroke-width="1.2"/>
         <rect x="${(cx - cutWpx / 2).toFixed(1)}" y="${(cy + cutHpx / 2).toFixed(1)}" width="${cutWpx.toFixed(1)}" height="${sideGapPx.toFixed(1)}" fill="#fef3c7" stroke="#8f4a16" stroke-width="1.2"/>`
      : '';

    /* Wood-Kit Cut Overlay (explicitly DISABLED & crossed out when FIRE_RATED_REQUIRED) */
    let woodCutSvg = '';
    if (layers.framing) {
      if (m.woodKitDisabled) {
        woodCutSvg = `
          <rect data-elem="wood-kit-cut" data-disabled="true" x="${(cx - cutWpx / 2).toFixed(1)}" y="${(cy - cutHpx / 2).toFixed(1)}" width="${cutWpx.toFixed(1)}" height="${cutHpx.toFixed(1)}"
                fill="#fee2e2" fill-opacity="0.45" stroke="#b91c1c" stroke-width="2.0" stroke-dasharray="6,4"/>
          <line x1="${(cx - cutWpx / 2).toFixed(1)}" y1="${(cy - cutHpx / 2).toFixed(1)}" x2="${(cx + cutWpx / 2).toFixed(1)}" y2="${(cy + cutHpx / 2).toFixed(1)}" stroke="#b91c1c" stroke-width="2.0"/>
          <line x1="${(cx + cutWpx / 2).toFixed(1)}" y1="${(cy - cutHpx / 2).toFixed(1)}" x2="${(cx - cutWpx / 2).toFixed(1)}" y2="${(cy + cutHpx / 2).toFixed(1)}" stroke="#b91c1c" stroke-width="2.0"/>
          <rect x="${(cx - 122).toFixed(1)}" y="${(cy - cutHpx / 2 - 20).toFixed(1)}" width="244" height="16" rx="3" fill="#b91c1c"/>
          <text x="${cx}" y="${(cy - cutHpx / 2 - 9).toFixed(1)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#ffffff">${isEs ? 'KIT MADERA 27-1/2"×39-1/2" DESHABILITADO (CORTAFUEGO)' : 'WOOD KIT 27-1/2"×39-1/2" DISABLED (FIRE-RATED REQ)'}</text>
        `;
      } else {
        const cutStroke = m.woodKitHold ? '#d97706' : '#15539e';
        const cutDash = m.woodKitHold ? 'stroke-dasharray="6,3"' : '';
        woodCutSvg = `
          <rect data-elem="wood-kit-cut" data-disabled="false" x="${(cx - cutWpx / 2).toFixed(1)}" y="${(cy - cutHpx / 2).toFixed(1)}" width="${cutWpx.toFixed(1)}" height="${cutHpx.toFixed(1)}"
                fill="none" stroke="${cutStroke}" stroke-width="1.8" ${cutDash}/>
          <rect x="${(cx - 106).toFixed(1)}" y="${(cy - cutHpx / 2 - 19).toFixed(1)}" width="212" height="15" rx="2" fill="#ffffff" stroke="${cutStroke}" stroke-width="0.9"/>
          <text x="${cx}" y="${(cy - cutHpx / 2 - 8.5).toFixed(1)}" font-size="7.2" text-anchor="middle" font-weight="700" fill="${cutStroke}">
            ${isEs ? 'Corte Kit Madera (Propuesto): 27-1/2" × 39-1/2"' : 'Proposed Wood-Kit Cut: 27-1/2" × 39-1/2"'}
          </text>
        `;
      }
    }

    /* Wall Offsets 1 & 2 (dashed provisional when null) */
    const off1Prov = m.off1 === null;
    const off2Prov = m.off2 === null;
    const off1Txt = off1Prov ? tr.provisional_outline : `${isEs ? 'Dist. Muro 1' : 'Wall Offset 1'}: ${toFrac16(m.off1)} [wall_to_wall]`;
    const off2Txt = off2Prov ? tr.provisional_outline : `${isEs ? 'Dist. Muro 2' : 'Wall Offset 2'}: ${toFrac16(m.off2)} [wall_to_wall]`;

    /* Lower View: Interactive Walkway & 30"x30" Platform Plan at strict uniform scale (1.05 px/in = 12.60 px/ft; fits up to 25 ft cleanly inside panel) */
    const sWalk = 1.05;
    const pxPerFt = 12 * sWalk; // 12.60 px/ft
    const wOx = 42;
    const wCy = 708;
    walkwayDragOriginX = wOx + 36 * sWalk; // end of hatch where walkway starts
    walkwayDragScale = pxPerFt;

    const walkProv = m.walkFt === null;
    const drawnWalkFt = walkProv ? 12.0 : Math.max(0.5, Math.min(25.0, m.walkFt));
    const walkLenPx = drawnWalkFt * pxPerFt;
    const walkWpx = 24.0 * sWalk;     // 24" solid walkway width
    const passWpx = 30.0 * sWalk;     // 30" unobstructed passage width
    const platSizePx = 30.0 * sWalk;  // 30" x 30" service platform
    const wStartX = walkwayDragOriginX;
    const wEndX = wStartX + walkLenPx;
    const walkFail = m.walkStatus === 'FAIL_CAP';
    const walkStroke = walkFail ? '#b91c1c' : walkProv ? '#d97706' : '#2f4f42';
    const walkFill = walkFail ? '#fee2e2' : walkProv ? '#fffbeb' : '#e6efe9';

    /* 7-ft Saw-Kerf Sheet Segment Dividers on Walkway */
    let sheetDividersSvg = '';
    const numSegs = Math.ceil(drawnWalkFt / 7.0);
    for (let i = 1; i < numSegs; i++) {
      const dx = wStartX + i * 7.0 * pxPerFt;
      if (dx < wEndX - 4) {
        sheetDividersSvg += `<line x1="${dx.toFixed(1)}" y1="${(wCy - walkWpx / 2).toFixed(1)}" x2="${dx.toFixed(1)}" y2="${(wCy + walkWpx / 2).toFixed(1)}" stroke="${walkStroke}" stroke-width="1.2" stroke-dasharray="3,2"/>`;
      }
    }
    /* 20-ft Cap Marker Line */
    const cap20X = wStartX + 20.0 * pxPerFt;

    /* Gate Banner Color */
    const gateColor = m.woodKitDisabled ? '#b91c1c' : m.woodKitHold ? '#b45309' : '#2f4f42';
    const gateBg = m.woodKitDisabled ? '#fef2f2' : m.woodKitHold ? '#fffbeb' : '#e6efe9';
    const gateBanner = m.woodKitDisabled
      ? (isEs ? 'CORTAFUEGO EXIGIDO · KIT MADERA BLOQUEADO' : 'FIRE-RATED REQUIRED · WOOD KIT DISABLED')
      : m.woodKitHold
        ? (isEs ? 'CORTAFUEGO SIN VERIFICAR · CERO CORTES' : 'FIRE RATING UNVERIFIED · ZERO CUTS HOLD')
        : (isEs ? 'NO CORTAFUEGO · KIT MADERA ELEGIBLE' : 'NON-RATED CONFIRMED · WOOD KIT ELIGIBLE');

    const joistResultTxt = m.joistStatus === 'MEASURE'
      ? (isEs ? 'MEDIR EN OBRA (proporción provisional)' : 'MEASURE ON SITE (proportion provisional)')
      : m.joistStatus === 'FITS_EXACT'
        ? (isEs ? `CUMPLE (${toFrac16(m.joistB)}) — Cabe limpio` : `PASS (${toFrac16(m.joistB)}) — Fits wood-kit cleanly`)
        : m.joistStatus === 'PASS_SIDE_BACKING'
          ? (isEs ? `CUMPLE (${toFrac16(m.joistB)}) — Exige respaldo lateral sólido` : `PASS (${toFrac16(m.joistB)}) — Solid side backing required`)
          : (isEs ? `ALTO (${toFrac16(m.joistB)}) — Exige cabezal estructural u otro punto` : `STOP (${toFrac16(m.joistB)}) — Structural header or alternate spot`);

    const humanLoc = state.orientation.candidate_location === 'DOOR4_LANDING'
      ? (isEs ? 'Confirmado: Descanso Puerta 4' : 'Confirmed: Door 4 Landing')
      : state.orientation.candidate_location === 'INTERIOR_HALL'
        ? (isEs ? 'Confirmado: Pasillo Interior Unidad 4' : 'Confirmed: Interior Unit 4 Hall')
        : (isEs ? 'Sin Confirmar (Puerta 4 vs. Pasillo)' : 'Unconfirmed (Door 4 Landing vs. Hall)');
    const humanFire = m.fireGate === 'FIRE_RATED_REQUIRED'
      ? (isEs ? 'Exige Cortafuego (Kit Madera Bloqueado)' : 'Fire-Rated Required (Wood Kit Disabled)')
      : m.fireGate === 'NON_FIRE_RATED_CONFIRMED'
        ? (isEs ? 'No Cortafuego Confirmado' : 'Non-Fire-Rated Confirmed')
        : (isEs ? 'Sin Verificar (Espera)' : 'Unverified (Hold)');

    const ftPxTop = 12 * sTop;
    const barX = 526;
    const barY = 918;
    const pinsMarkup = buildPinsSvg();

    svgEl.innerHTML = `
      <defs>
        <pattern id="amberHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#d97706" stroke-width="1.1"/>
        </pattern>
        <pattern id="woodHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#8f4a16" stroke-width="1.1"/>
        </pattern>
      </defs>

      <rect x="10" y="10" width="900" height="1100" fill="#ffffff" stroke="#10202b" stroke-width="1.8"/>
      <rect x="10" y="10" width="900" height="54" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <text x="24" y="32" font-size="13.2" font-weight="700" fill="#10202b">${isEs ? 'ESCOTILLA PERMANENTE DE ÁTICO (24" × 36" LIBRE) Y PASILLO' : 'PERMANENT ATTIC ACCESS HATCH (24" × 36" CLEAR) & WALKWAY'}</text>
      <text x="24" y="49" font-size="8.6" fill="#4b5c69">${isEs ? 'Borrador de Planeación · Escala Real Uniforme (scaleX = scaleY) · Paso Calefactor 14.19"×29" · Sin Precios' : 'Working Planning Draft · Uniform True Scale (scaleX = scaleY) · 14.19"×29" Furnace End-First · Zero Prices'}</text>

      <rect x="576" y="18" width="320" height="38" rx="4" fill="${gateBg}" stroke="${gateColor}" stroke-width="1.3"/>
      <text x="736" y="33" font-size="8.8" text-anchor="middle" font-weight="700" fill="${gateColor}">${esc(gateBanner)}</text>
      <text x="736" y="47" font-size="7.4" text-anchor="middle" fill="#334155">${esc(stamp)}</text>

      <!-- VIEW 1 (TOP-LEFT): CEILING OPENING, JOIST BAY B & FURNACE END-FIRST PASS (scaleX === scaleY = 4.8 px/in) -->
      <rect x="24" y="76" width="478" height="446" rx="4" fill="#fbfdfb" stroke="#94a3b8" stroke-width="1.1"/>
      <rect x="24" y="76" width="478" height="22" rx="4" fill="#f1f5f9"/>
      <text x="36" y="91" font-size="8.8" font-weight="700" fill="#15539e">1. ${isEs ? 'PLANTA DE PLAFÓN — CLARO VIGAS B Y PASO CALEFACTOR (scaleX = scaleY)' : 'CEILING FRAMING PLAN — JOIST BAY B & FURNACE PASS (scaleX = scaleY)'}</text>

      <!-- Hallway / Door 4 Landing Cardinal Landmarks (Aligned with unit4-floorplan-proof.png: N ↑ / S ↓ / ← W / E →) -->
      <line x1="42" y1="126" x2="486" y2="126" stroke="#475569" stroke-width="2.0" ${off1Prov ? 'stroke-dasharray="6,4"' : ''}/>
      <text x="264" y="118" font-size="7.2" text-anchor="middle" font-weight="700" fill="${off1Prov ? '#b45309' : '#10202b'}">↑ N (${isEs ? 'Ventana / Muro Norte' : 'Frosted Window / North Wall'}) · ${esc(off1Txt)}</text>
      <line x1="42" y1="454" x2="486" y2="454" stroke="#475569" stroke-width="2.0" ${off2Prov ? 'stroke-dasharray="6,4"' : ''}/>
      <text x="264" y="468" font-size="7.2" text-anchor="middle" font-weight="700" fill="${off2Prov ? '#b45309' : '#10202b'}">↓ S (${isEs ? 'Muro Norte Cocina 115-1/2"' : 'Kitchen North Wall 115-1/2"'}) · ${esc(off2Txt)}</text>
      <text x="480" y="142" font-size="6.8" text-anchor="end" font-weight="700" fill="#15539e">${isEs ? 'Puerta 4 (abre Este al Pasillo) →' : 'Entry Door 4 (swings East into Hall) →'}</text>

      <!-- Ceiling Joists framing Joist Bay B (physically moves on edit!) -->
      ${layers.framing ? `
        <rect data-elem="joist-bay" data-provisional="${bayProv}" x="42" y="${joistTopY.toFixed(1)}" width="444" height="${bayHpx.toFixed(1)}"
              fill="${bayProv ? '#fffbeb' : m.joistStatus === 'STOP_HEADER_REQUIRED' ? '#fef2f2' : '#f8fafc'}" fill-opacity="0.55"
              stroke="${joistStroke}" stroke-width="1.2" ${bayProv ? 'stroke-dasharray="6,4"' : ''}/>
        <rect x="42" y="${(joistTopY - 9).toFixed(1)}" width="444" height="9" fill="url(#woodHatch)" stroke="${joistStroke}" stroke-width="1.4" ${bayProv ? 'stroke-dasharray="4,3"' : ''}/>
        <rect x="42" y="${joistBotY.toFixed(1)}" width="444" height="9" fill="url(#woodHatch)" stroke="${joistStroke}" stroke-width="1.4" ${bayProv ? 'stroke-dasharray="4,3"' : ''}/>
        ${sideBackingSvg}
        <!-- Joist Bay B Dimension Line -->
        <line x1="66" y1="${joistTopY.toFixed(1)}" x2="66" y2="${joistBotY.toFixed(1)}" stroke="${joistStroke}" stroke-width="1.4"/>
        <rect x="44" y="${(cy - 14).toFixed(1)}" width="92" height="28" rx="3" fill="#ffffff" stroke="${joistStroke}" stroke-width="1"/>
        <text x="90" y="${(cy - 2).toFixed(1)}" font-size="7.2" text-anchor="middle" font-weight="700" fill="${joistStroke}">B = ${esc(bayProv ? tr.measure_on_site : toFrac16(m.joistB))}</text>
        <text x="90" y="${(cy + 9).toFixed(1)}" font-size="6.0" text-anchor="middle" fill="${joistStroke}">${esc(bayProv ? (isEs ? 'provisional' : 'provisional') : '[rough_opening]')}</text>
      ` : ''}

      <!-- 1x2 gasket ledger outside rough opening -->
      ${layers.enclosure ? `
        ` : ''}

      <!-- Proposed Wood-Kit Rough Cut (27.5" x 39.5" — DISABLED when FIRE_RATED_REQUIRED) -->
      ${woodCutSvg}

      <!-- LOCKED 24" x 36" Finished Clear Hatch Opening (NEVER SHRINKS) -->
      <rect data-elem="hatch-clear" x="${(cx - clearWpx / 2).toFixed(1)}" y="${(cy - clearHpx / 2).toFixed(1)}" width="${clearWpx.toFixed(1)}" height="${clearHpx.toFixed(1)}"
            fill="#e8f1fb" fill-opacity="0.72" stroke="#15539e" stroke-width="2.4"/>

      <!-- Compression Latches OUTSIDE 24" x 36" clear opening -->
      ${layers.enclosure ? `
        <circle cx="${(cx - clearWpx / 2 - 5).toFixed(1)}" cy="${(cy - 26).toFixed(1)}" r="3.2" fill="#2f4f42"/>
        <circle cx="${(cx - clearWpx / 2 - 5).toFixed(1)}" cy="${(cy + 26).toFixed(1)}" r="3.2" fill="#2f4f42"/>
        <circle cx="${(cx + clearWpx / 2 + 5).toFixed(1)}" cy="${(cy - 26).toFixed(1)}" r="3.2" fill="#2f4f42"/>
        <circle cx="${(cx + clearWpx / 2 + 5).toFixed(1)}" cy="${(cy + 26).toFixed(1)}" r="3.2" fill="#2f4f42"/>
      ` : ''}

      <!-- Furnace End-First Pass Envelope (14.19" x 29.0" centered inside 24" x 36" clear) -->
      ${layers.furnace ? `
        <rect data-elem="furnace-pass" x="${(cx - furnWpx / 2).toFixed(1)}" y="${(cy - furnHpx / 2).toFixed(1)}" width="${furnWpx.toFixed(1)}" height="${furnHpx.toFixed(1)}"
              fill="#e6efe9" stroke="#2f4f42" stroke-width="1.8"/>
        <text x="${cx}" y="${(cy - 7).toFixed(1)}" font-size="8.0" text-anchor="middle" font-weight="700" fill="#2f4f42">${isEs ? 'CALEFACTOR DE PUNTA: PASS' : 'FURNACE END-FIRST: PASS'}</text>
        <text x="${cx}" y="${(cy + 5).toFixed(1)}" font-size="7.4" text-anchor="middle" fill="#10202b">14.19" × 29.0" (Carrier/Bryant 45k)</text>
        <text x="${cx}" y="${(cy + 16).toFixed(1)}" font-size="6.8" text-anchor="middle" font-weight="700" fill="#15539e">+${m.clearMarginAcross}" ${isEs ? 'ancho' : 'across'} · +${m.clearMarginAlong}" ${isEs ? 'largo' : 'along'}</text>
      ` : ''}

      <!-- 24" x 36" Locked Clear Dimensions -->
      <line x1="${(cx - clearWpx / 2).toFixed(1)}" y1="${(cy + clearHpx / 2 + 16).toFixed(1)}" x2="${(cx + clearWpx / 2).toFixed(1)}" y2="${(cy + clearHpx / 2 + 16).toFixed(1)}" stroke="#15539e" stroke-width="1.3"/>
      <text x="${cx}" y="${(cy + clearHpx / 2 + 29).toFixed(1)}" font-size="8.4" text-anchor="middle" font-weight="700" fill="#15539e">36" ${isEs ? 'LIBRE TERMINADO (FIJO)' : 'FINISHED CLEAR (LOCKED)'} [clear_between_casings]</text>
      <line x1="${(cx + clearWpx / 2 + 18).toFixed(1)}" y1="${(cy - clearHpx / 2).toFixed(1)}" x2="${(cx + clearWpx / 2 + 18).toFixed(1)}" y2="${(cy + clearHpx / 2).toFixed(1)}" stroke="#15539e" stroke-width="1.3"/>
      <text x="${(cx + clearWpx / 2 + 25).toFixed(1)}" y="${(cy + 3).toFixed(1)}" font-size="8.4" font-weight="700" fill="#15539e">24"</text>
      <text x="36" y="492" font-size="7.8" font-weight="700" fill="${joistStroke}">${isEs ? 'Resultado Vigas B:' : 'Joist Bay B Check:'} ${esc(joistResultTxt)}</text>
      <text x="36" y="508" font-size="7.1" fill="#4b5c69">${isEs ? 'Descanso no acondicionado (sin fibra/dique) · Broches fuera de 24"×36"' : '1x2 gasket ledger 2" above loose fill · Latches outside 24"×36" clear'}</text>

      <!-- VIEW 2 (BOTTOM-LEFT): DRAGGABLE WALKWAY L (<= 20 ft) + 30"x30" SERVICE PLATFORM (scaleX === scaleY = 1.28 px/in) -->
      <rect x="24" y="534" width="478" height="392" rx="4" fill="#fbfdfb" stroke="#94a3b8" stroke-width="1.1"/>
      <rect x="24" y="534" width="478" height="22" rx="4" fill="#f1f5f9"/>
      <text x="36" y="549" font-size="8.6" font-weight="700" fill="#15539e">2. ${isEs ? 'PASILLO ARRASTRABLE (<= 20 PIES) Y PLATAFORMA 30"×30" (X = Y)' : 'DRAGGABLE WALKWAY (<= 20 FT) & 30"×30" PLATFORM (X = Y)'}</text>

      <!-- Hatch opening on left of walkway -->
      <rect x="${wOx.toFixed(1)}" y="${(wCy - 12 * sWalk).toFixed(1)}" width="${(36 * sWalk).toFixed(1)}" height="${(24 * sWalk).toFixed(1)}" fill="#e8f1fb" stroke="#15539e" stroke-width="1.6"/>
      <text x="${(wOx + 18 * sWalk).toFixed(1)}" y="${(wCy + 3).toFixed(1)}" font-size="6.8" text-anchor="middle" font-weight="700" fill="#15539e">24×36</text>

      <!-- 30" Unobstructed Passage Envelope (dashed) -->
      <rect x="${wStartX.toFixed(1)}" y="${(wCy - passWpx / 2).toFixed(1)}" width="${walkLenPx.toFixed(1)}" height="${passWpx.toFixed(1)}"
            fill="none" stroke="#64748b" stroke-width="1.0" stroke-dasharray="4,3"/>

      <!-- 24" Solid Continuous Walkway (23/32" OSB / 3/4" ply — NEVER 3/8" ply) -->
      <rect data-elem="walkway-deck" data-provisional="${walkProv}" x="${wStartX.toFixed(1)}" y="${(wCy - walkWpx / 2).toFixed(1)}" width="${walkLenPx.toFixed(1)}" height="${walkWpx.toFixed(1)}"
            fill="${walkFill}" stroke="${walkStroke}" stroke-width="1.8" ${walkProv ? 'stroke-dasharray="5,3"' : ''}/>
      ${sheetDividersSvg}

      <!-- 20-ft Maximum Cap Vertical Marker (at 66" attic height) -->
      <line x1="${cap20X.toFixed(1)}" y1="${(wCy - 66).toFixed(1)}" x2="${cap20X.toFixed(1)}" y2="${(wCy + 56).toFixed(1)}" stroke="#b91c1c" stroke-width="1.2" stroke-dasharray="4,2"/>
      <text x="${cap20X.toFixed(1)}" y="${(wCy - 70).toFixed(1)}" font-size="6.8" text-anchor="middle" font-weight="700" fill="#b91c1c">20 ft MAX (66" H)</text>

      <!-- 30" x 30" Service Platform + Furnace + >= 1" Type B Vent + 120V GFCI -->
      <rect data-elem="service-platform" x="${wEndX.toFixed(1)}" y="${(wCy - platSizePx / 2).toFixed(1)}" width="${platSizePx.toFixed(1)}" height="${platSizePx.toFixed(1)}"
            fill="#e6efe9" stroke="#2f4f42" stroke-width="1.8"/>
      <text x="${(wEndX + platSizePx / 2).toFixed(1)}" y="${(wCy - 3).toFixed(1)}" font-size="6.6" text-anchor="middle" font-weight="700" fill="#2f4f42">30"×30"</text>
      <text x="${(wEndX + platSizePx / 2).toFixed(1)}" y="${(wCy + 7).toFixed(1)}" font-size="5.8" text-anchor="middle" fill="#2f4f42">${isEs ? 'PLAT.' : 'PLAT.'}</text>
      ${layers.furnace ? `
        <rect x="${(wEndX + 2).toFixed(1)}" y="${(wCy - platSizePx / 2 - 24).toFixed(1)}" width="${(29 * sWalk).toFixed(1)}" height="${(14.19 * sWalk).toFixed(1)}" fill="#e2e8f0" stroke="#10202b" stroke-width="1.4"/>
        <text x="${(wEndX + 20).toFixed(1)}" y="${(wCy - platSizePx / 2 - 12).toFixed(1)}" font-size="6.0" text-anchor="middle" font-weight="700" fill="#10202b">FURNACE</text>
      ` : ''}
      ${layers.enclosure ? `
        <circle cx="${(wEndX + platSizePx - 6).toFixed(1)}" cy="${(wCy - platSizePx / 2 - 22).toFixed(1)}" r="7" fill="#e0f2fe" stroke="#0369a1" stroke-width="1.2"/>
        <text x="${(wEndX + platSizePx + 6).toFixed(1)}" y="${(wCy - platSizePx / 2 - 20).toFixed(1)}" font-size="6.2" font-weight="700" fill="#0369a1">&ge;1" B-Vent</text>
        <circle cx="${(wEndX + platSizePx / 2).toFixed(1)}" cy="${(wCy + platSizePx / 2 + 12).toFixed(1)}" r="6" fill="#dcfce7" stroke="#15803d" stroke-width="1.2"/>
        <text x="${(wEndX + platSizePx / 2).toFixed(1)}" y="${(wCy + platSizePx / 2 + 27).toFixed(1)}" font-size="6.2" text-anchor="middle" font-weight="700" fill="#166534">120V GFCI &le;25'</text>
      ` : ''}

      <!-- Interactive DRAGGABLE Walkway Endpoint Handle -->
      <g class="walkway-drag-handle" data-elem="walkway-drag-handle" id="walkway-drag-handle">
        <line x1="${wEndX.toFixed(1)}" y1="${(wCy - 42).toFixed(1)}" x2="${wEndX.toFixed(1)}" y2="${(wCy + 42).toFixed(1)}" stroke="#15539e" stroke-width="2.2"/>
        <circle cx="${wEndX.toFixed(1)}" cy="${(wCy + 44).toFixed(1)}" r="11" fill="#15539e" stroke="#ffffff" stroke-width="2"/>
        <text x="${wEndX.toFixed(1)}" y="${(wCy + 47.5).toFixed(1)}" font-size="9" text-anchor="middle" font-weight="700" fill="#ffffff">&harr;</text>
      </g>

      <!-- Live Walkway Length & Saw-Kerf Readout -->
      <text x="${((wStartX + wEndX) / 2).toFixed(1)}" y="${(wCy + 3).toFixed(1)}" font-size="7.8" text-anchor="middle" font-weight="700" fill="${walkStroke}">
        ${walkProv ? (isEs ? 'MEDIR EN OBRA' : 'MEASURE ON SITE') : `${m.walkFt} ft (${walkFail ? (isEs ? 'FALLA >20 PIES' : 'FAIL >20 FT') : (isEs ? 'CUMPLE' : 'PASS')})`}
      </text>
      <text x="36" y="794" font-size="8.0" font-weight="700" fill="${walkStroke}">
        ${isEs ? 'Pasillo L:' : 'Walkway L:'} ${walkProv ? tr.provisional_outline : `${m.walkFt} ft · ${tk.walkway_sheets_4x8} ${isEs ? 'hojas 4×8 (1 tira 24"/hoja por sierra)' : 'sheets 4×8 (1 true 24" strip/sheet)'}`}
      </text>
      <text x="36" y="812" font-size="7.4" fill="#334155">• ${isEs ? 'Material obligatorio: OSB 23/32" o triplay estructural 3/4" (NUNCA 3/8").' : 'Required decking: 23/32" OSB or 3/4" structural ply (NEVER 3/8" ply).'}</text>
      <text x="36" y="828" font-size="7.4" fill="#334155">• ${isEs ? 'Plataforma 30"×30" nivelada · confirmar herraje de montaje con NEXT.' : 'Level 30"×30" service platform · confirm vibration mount requirements w/ NEXT.'}</text>
      <text x="36" y="844" font-size="7.4" fill="#334155">• ${isEs ? 'Paso libre mínimo 30" · Lámpara LED cerrada + GFCI 120V en lado línea <= 25 pies.' : '30" clear passage · Enclosed LED utility light + line-side 120V GFCI <= 25 ft.'}</text>
      <text x="36" y="864" font-size="7.4" font-weight="700" fill="#15539e">${isEs ? 'Arrastra el círculo azul ↔ para probar largo L (0–25 pies) y ver hojas 4×8 en vivo.' : 'Drag blue ↔ handle to test walkway L (0–25 ft) and recalculate 4×8 sheets live.'}</text>

      <!-- RIGHT COLUMN: N/S/E/W COMPASS + GATE STATUS + LIVE TAKEOFF SUMMARY -->
      <rect x="514" y="76" width="382" height="170" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.1"/>
      <text x="526" y="95" font-size="9.0" font-weight="700" fill="#10202b">${isEs ? 'BRÚJULA N/S/E/O Y DESCANSO ELEGIDO' : 'N/S/E/W COMPASS & SELECTED LANDING'}</text>
      <g transform="translate(822, 152)">
        <circle cx="0" cy="0" r="34" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
        <polygon points="0,-26 6,-6 0,-11 -6,-6" fill="#10202b"/>
        <polygon points="0,26 6,6 0,11 -6,6" fill="#94a3b8"/>
        <polygon points="26,0 6,6 11,0 6,-6" fill="#94a3b8"/>
        <polygon points="-26,0 -6,6 -11,0 -6,-6" fill="#94a3b8"/>
        <text x="0" y="-37" font-size="9.5" text-anchor="middle" font-weight="700" fill="#10202b">N</text>
        <text x="0" y="45" font-size="8.5" text-anchor="middle" font-weight="700" fill="#475569">S</text>
        <text x="42" y="3" font-size="8.5" text-anchor="middle" font-weight="700" fill="#475569">E</text>
        <text x="-42" y="3" font-size="8.5" text-anchor="middle" font-weight="700" fill="#475569">W</text>
      </g>
      <text x="526" y="118" font-size="7.8" font-weight="700" fill="#b91c1c">${esc(humanLoc)}</text>
      <text x="526" y="138" font-size="7.6" fill="#334155">• ${isEs ? 'Eje propuesto: 36" a lo largo × 24" ancho' : 'Proposed axis: 36" along hall × 24" across'}</text>
      <text x="526" y="156" font-size="7.6" fill="#334155">• ${isEs ? 'Claro fijo: 24" × 36" (nunca reducir)' : 'Locked clear: 24" × 36" (never shrink)'}</text>
      <text x="526" y="174" font-size="7.6" fill="#334155">• ${isEs ? 'Altura ático confirmada: 66" (< 6 pies)' : 'Confirmed attic height: 66" (< 6 ft)'}</text>
      <text x="526" y="192" font-size="7.6" fill="#334155">• ${isEs ? 'Moldura original: Zoclo 9-1/2" · Riel 103"' : 'Original trim: 9-1/2" base · 103" picture rail'}</text>
      <text x="526" y="218" font-size="7.4" font-weight="700" fill="#475569">${isEs ? 'Contorno punteado = Medir en obra — proporción provisional' : 'Dashed outline = Measure on site — proportion provisional'}</text>

      <!-- Live Gate Checklist & Materials Takeoff Summary -->
      <rect x="514" y="258" width="382" height="264" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1.1"/>
      <rect x="514" y="258" width="382" height="22" rx="4" fill="#e8f1fb"/>
      <text x="526" y="273" font-size="8.6" font-weight="700" fill="#15539e">${isEs ? 'COMPUERTAS EN VIVO Y MATERIALES (SIN PRECIOS)' : 'LIVE GATES & MATERIALS TAKEOFF (ZERO PRICES)'}</text>

      <text x="526" y="298" font-size="8.0" font-weight="700" fill="${gateColor}">1. ${isEs ? 'Cortafuego Plafón:' : 'Ceiling Fire Rating:'} ${esc(humanFire)}</text>
      <text x="526" y="316" font-size="8.0" font-weight="700" fill="${joistStroke}">2. ${isEs ? 'Claro Vigas B:' : 'Joist Bay B:'} ${esc(m.joistB === null ? tr.measure_on_site : toFrac16(m.joistB))}</text>
      <text x="526" y="334" font-size="8.0" font-weight="700" fill="#2f4f42">3. ${isEs ? 'Calefactor De Punta:' : 'Furnace End-First:'} 14.19"×29" → PASS (+9.81" / +7")</text>
      <text x="526" y="352" font-size="8.0" font-weight="700" fill="${walkStroke}">4. ${isEs ? 'Pasillo L:' : 'Walkway L:'} ${m.walkFt === null ? tr.measure_on_site : `${m.walkFt} ft / 20 ft max`}</text>
      <text x="526" y="370" font-size="7.6" font-weight="700" fill="#b91c1c">5. ${isEs ? 'Gotera Activa Techo + Clóset Recámara ABIERTOS' : 'Active Roof Leak + Temp Bedroom Closet OPEN'}</text>

      <line x1="526" y1="384" x2="884" y2="384" stroke="#cbd5e1" stroke-width="0.9"/>
      <text x="526" y="402" font-size="8.0" font-weight="700" fill="#10202b">${isEs ? 'Hojas 4×8 (OSB 23/32" o Triplay 3/4"):' : '4×8 Sheets (23/32" OSB / 3/4" Ply):'} ${tk.total_osb_ply_sheets_gross !== null ? `${tk.total_osb_ply_sheets_gross} (+${tk.waste_pct}%)` : tr.measure_on_site}</text>
      <text x="526" y="418" font-size="7.6" fill="${m.woodKitDisabled ? '#b91c1c' : '#334155'}">${isEs ? 'Kit Madera (1×2 / 1×3):' : 'Wood Kit (1×2 / 1×3):'} ${m.woodKitDisabled ? (isEs ? 'DESHABILITADO (Exige Cortafuego)' : 'DISABLED (Fire-Rated Required)') : `${tk.ledge_1x2_lf} LF 1×2 · ${tk.trim_1x3_lf} LF 1×3`}</text>
      <text x="526" y="434" font-size="7.6" fill="#334155">${isEs ? 'Sellos:' : 'Seals:'} ${tk.backer_rod_3_8_lf} LF 3/8" rod · ${tk.weatherstrip_closed_cell_lf} LF 1/2"×1/8" strip</text>
      <text x="526" y="450" font-size="7.6" fill="#334155">${isEs ? 'Tapa:' : 'Lid:'} uninsulated 3/4" ply · 2 ring pulls · 4 latches (outside 24"×36")</text>
      <text x="526" y="472" font-size="7.3" font-weight="700" fill="#92400e">${isEs ? 'Cantidades brutas propuestas (0 precios) — verificar stock.' : 'Gross proposed qty only (zero prices) — verify stock first.'}</text>

      <!-- Holds & Attached Comments Panel -->
      <rect x="514" y="534" width="382" height="314" rx="4" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.1"/>
      <text x="526" y="553" font-size="8.6" font-weight="700" fill="#991b1b">${isEs ? 'BLOQUEOS OBLIGATORIOS Y COMENTARIOS ADJUNTOS' : 'MANDATORY HOLDS & ATTACHED CALLOUTS'}</text>
      <text x="526" y="573" font-size="7.6" fill="#7f1d1d">• ${isEs ? 'CERO cortes en plafón hasta confirmar ubicación + cortafuego + B.' : 'ZERO ceiling cuts until location + fire rating + joist bay B verified.'}</text>
      <text x="526" y="590" font-size="7.6" fill="#7f1d1d">• ${isEs ? 'NUNCA reducir el claro libre terminado de 24" × 36".' : 'NEVER shrink the locked 24" × 36" finished clear opening.'}</text>
      <text x="526" y="607" font-size="7.6" fill="#7f1d1d">• ${isEs ? 'Mantener abierto clóset temporal hasta cable LV + escotilla.' : 'Keep temp bedroom closet OPEN until LV cable + permanent hatch.'}</text>
      <text x="526" y="624" font-size="7.6" fill="#7f1d1d">• ${isEs ? 'Reparar gotera activa del techo antes de aislar o cerrar.' : 'Resolve active roof/attic leak before insulating or enclosing.'}</text>
      <text x="526" y="641" font-size="7.6" fill="#7f1d1d">• ${isEs ? 'NUNCA usar triplay 3/8" ; confirmar herrajes de montaje con NEXT.' : 'NEVER use 3/8" plywood for walkway ; confirm any furnace mounts w/ NEXT.'}</text>
      <line x1="526" y1="658" x2="884" y2="658" stroke="#fca5a5" stroke-width="0.9"/>
      <text x="526" y="676" font-size="7.8" font-weight="700" fill="#10202b">${isEs ? 'Comentarios Adjuntos' : 'Attached Callouts'}: ${(state.pins || []).length} · ${isEs ? 'Pendientes EOD' : 'Pending EOD'}: ${(tailnetState.pendingEod || []).length}</text>

      <!-- Bar Scale (Upper Plan Uniform True Scale) -->
      <text x="${barX}" y="${barY - 14}" font-size="8.2" font-weight="700" fill="#10202b">${isEs ? 'ESCALA GRÁFICA PLAFÓN (Escala Real X = Y)' : 'CEILING PLAN BAR SCALE (Uniform True Scale X = Y)'}</text>
      <rect x="${barX}" y="${barY - 6}" width="${ftPxTop.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPxTop).toFixed(1)}" y="${barY - 6}" width="${ftPxTop.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <rect x="${(barX + ftPxTop * 2).toFixed(1)}" y="${barY - 6}" width="${ftPxTop.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPxTop * 3).toFixed(1)}" y="${barY - 6}" width="${ftPxTop.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <text x="${barX}" y="${barY + 14}" font-size="8.0" text-anchor="middle">0'</text>
      <text x="${(barX + ftPxTop).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">1'</text>
      <text x="${(barX + ftPxTop * 2).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">2'</text>
      <text x="${(barX + ftPxTop * 3).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">3'</text>
      <text x="${(barX + ftPxTop * 4).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">4'</text>

      ${buildTitleBlockSvg(m, tk, isEs, stamp)}
      <g id="attic-pins-layer">${pinsMarkup}</g>
    `;

    wireWalkwayDragHandle();
    syncCanvasSize();
  }

  /* ── Interactive Drag Handle for Walkway Length L on SVG ──────────── */
  function wireWalkwayDragHandle() {
    const handle = document.getElementById('walkway-drag-handle');
    const svg = document.getElementById('attic-svg');
    if (!handle || !svg) return;

    const updateFromClientX = (clientX) => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      const svgX = ((clientX - rect.left) / rect.width) * 920;
      const rawFt = (svgX - walkwayDragOriginX) / walkwayDragScale;
      const clampedFt = Math.max(1, Math.min(25, Math.round(rawFt * 2) / 2));
      if (state.dimensions.walkway_run_length_ft.value !== clampedFt) {
        state.dimensions.walkway_run_length_ft.value = clampedFt;
        state.dimensions.walkway_run_length_ft.verified = 'PENDING_EOD_REVIEW';
        hasUnsyncedLocalEdits = true;
        syncFormFromState();
        renderAll();
      }
    };

    handle.addEventListener('pointerdown', (evt) => {
      if (circleMode) return;
      evt.preventDefault();
      isDraggingWalkway = true;
      const onMove = (e) => {
        if (!isDraggingWalkway) return;
        updateFromClientX(e.clientX);
      };
      const onUp = () => {
        isDraggingWalkway = false;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });
  }

  /* ── Render Status Pills, 5 Enclosure Rules, Clashes, Takeoff, Pins, EOD ── */
  function renderStatusPills() {
    const m = computeDerived();
    const tr = I18N[currentLang];
    const es = currentLang === 'es';

    const firePill = document.getElementById('fire-gate-pill');
    if (firePill) {
      firePill.className = `pill ${m.woodKitDisabled ? 'pill-fail' : m.woodKitHold ? 'pill-warn' : 'pill-pass'}`;
      firePill.textContent = m.woodKitDisabled
        ? (es ? 'Cortafuego: EXIGIDO (Kit Madera Bloqueado)' : 'Fire Gate: FIRE-RATED (Wood Kit Disabled)')
        : m.woodKitHold
          ? (es ? 'Cortafuego: SIN VERIFICAR (ESPERA)' : 'Fire Gate: UNVERIFIED HOLD')
          : (es ? 'Cortafuego: No Cortafuego Confirmado' : 'Fire Gate: Non-Rated Confirmed');
    }

    const joistPill = document.getElementById('joist-pill');
    if (joistPill) {
      joistPill.className = `pill ${m.joistStatus === 'STOP_HEADER_REQUIRED' ? 'pill-fail' : m.joistStatus === 'MEASURE' ? 'pill-warn' : 'pill-pass'}`;
      joistPill.textContent = m.joistB === null
        ? (es ? 'Claro Vigas B: MEDIR EN OBRA' : 'Joist Bay B: MEASURE ON SITE')
        : m.joistStatus === 'FITS_EXACT'
          ? `Bay B: ${toFrac16(m.joistB)} (${es ? 'CABE' : 'FITS'})`
          : m.joistStatus === 'PASS_SIDE_BACKING'
            ? `Bay B: ${toFrac16(m.joistB)} (${es ? 'RESPALDO LAT.' : 'SIDE BACKING'})`
            : `Bay B: ${toFrac16(m.joistB)} (${es ? 'ALTO · CABEZAL' : 'STOP · HEADER'})`;
    }

    const walkPill = document.getElementById('walkway-pill');
    if (walkPill) {
      walkPill.className = `pill ${m.walkStatus === 'FAIL_CAP' ? 'pill-fail' : m.walkStatus === 'MEASURE' ? 'pill-warn' : 'pill-pass'}`;
      walkPill.textContent = m.walkFt === null
        ? (es ? 'Pasillo L: MEDIR EN OBRA (<= 20 pies)' : 'Walkway L: MEASURE ON SITE (<= 20 ft)')
        : m.walkStatus === 'FAIL_CAP'
          ? `${es ? 'Pasillo L' : 'Walkway L'}: ${m.walkFt} ft (FAIL > 20 ft)`
          : `${es ? 'Pasillo L' : 'Walkway L'}: ${m.walkFt} ft (${m.walkwaySheets} ${es ? 'hojas 4×8' : '4×8 sheets'})`;
    }

    const revBadge = document.getElementById('rev-badge');
    if (revBadge) revBadge.textContent = state.base_rev || 'rev-20261124-attic-r4';

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
      if (tailBadge) { tailBadge.className = 'pill pill-pass'; tailBadge.textContent = `${tr.tailnet_live}${tailnetState.user ? ' · ' + tailnetState.user : ''}`; }
      if (modePill) { modePill.className = 'pill pill-pass'; modePill.textContent = tr.mode_live; }
      if (saveBtn) saveBtn.disabled = false;
      if (saveHint) saveHint.textContent = tr.save_hint_on;
    } else {
      if (tailBadge) { tailBadge.className = 'pill pill-neutral'; tailBadge.textContent = tr.tailnet_off; }
      if (modePill) { modePill.className = 'pill pill-neutral'; modePill.textContent = tr.mode_local; }
      if (saveBtn) saveBtn.disabled = true;
      if (saveHint) saveHint.textContent = tr.save_hint_off;
    }
  }

  function renderEnclosureRules() {
    const grid = document.getElementById('rules-grid');
    if (!grid) return;
    const cards = I18N[currentLang].rules_cards;
    grid.innerHTML = cards.map((c) => `
      <article class="rule-card ${c.hold ? 'rule-hold' : ''}">
        <strong>${esc(c.title)}</strong>
        <div>${esc(c.body)}</div>
      </article>
    `).join('');
  }

  function renderClashes() {
    const grid = document.getElementById('clashes-grid');
    if (!grid) return;
    const list = BASELINE_ATTIC_DATA.flagged_clashes;
    grid.innerHTML = list.map((c) => {
      const title = currentLang === 'es' ? (c.title_es || c.id) : (c.title_en || c.id);
      const body = currentLang === 'es' ? c.es : c.en;
      return `
        <article class="clash-card" data-clash-id="${esc(c.id)}">
          <div class="clash-card-head">
            <span><strong>${esc(title)}</strong></span>
            <span class="pill pill-fail">${esc(c.severity)}</span>
          </div>
          <div>${esc(body)}</div>
        </article>`;
    }).join('');
  }

  function renderTakeoff() {
    const grid = document.getElementById('takeoff-grid');
    const pill = document.getElementById('takeoff-waste-pill');
    if (!grid) return;

    const tk = computeTakeoff();
    const m = computeDerived();
    const es = currentLang === 'es';
    if (pill) pill.textContent = `${es ? 'Margen' : 'Waste Factor'}: +${tk.waste_pct}%`;

    const sheetMain = tk.total_osb_ply_sheets_gross !== null
      ? `${tk.total_osb_ply_sheets_gross} ${es ? 'hojas 4×8' : 'sheets (4×8)'}`
      : (es ? 'Medir pasillo L + 1 hoja plat.' : 'Measure L + 1 plat. sheet');

    const sheetSub = tk.walkway_sheets_4x8 !== null
      ? (es
        ? `Pasillo (${m.walkFt} pies): ${tk.walkway_sheets_4x8} hoja(s) + Plataforma + Tapa: 1 hoja · Neto ${tk.total_osb_ply_sheets_net}`
        : `Walkway (${m.walkFt} ft): ${tk.walkway_sheets_4x8} sheet(s) + Platform + Lid: 1 sheet · Net ${tk.total_osb_ply_sheets_net}`)
      : (es
        ? 'Regla sierra: <=7 pies = 1, 7–14 pies = 2, 14–20 pies = 3 hojas (OSB 23/32" o triplay 3/4", NUNCA 3/8")'
        : 'Saw-kerf: <=7 ft = 1, 7–14 ft = 2, 14–20 ft = 3 sheets (23/32" OSB / 3/4" ply, NEVER 3/8")');

    const woodCard = tk.wood_kit_disabled
      ? `
        <article class="takeoff-card card-disabled" data-elem="wood-kit-takeoff" data-disabled="true">
          <div class="takeoff-card-title">${es ? 'Kit de Madera Escotilla' : 'Wood Hatch Kit Lumber'}</div>
          <div class="takeoff-card-big">${es ? 'DESHABILITADO' : 'DISABLED'}</div>
          <div class="takeoff-card-sub">${es ? 'Plafón cortafuego exige conjunto certificado 24"×36" libre (cero compra de kit madera).' : 'Fire-rated ceiling requires listed 24"×36" fire-rated assembly (zero wood-kit lumber).'}</div>
        </article>`
      : `
        <article class="takeoff-card" data-elem="wood-kit-takeoff" data-disabled="false">
          <div class="takeoff-card-title">${es ? 'Kit de Madera (Si No Cortafuego)' : 'Wood Kit Lumber (If Non-Rated)'}</div>
          <div class="takeoff-card-big">${tk.ledge_1x2_lf} LF 1×2 · ${tk.trim_1x3_lf} LF 1×3</div>
          <div class="takeoff-card-sub">${es ? 'Tornillos #9×2-1/2"/3"' : '#9 × 2-1/2" or 3" screws'}: ~${tk.wood_screws_9_pcs} pcs${tk.side_backing_2x_lf ? ` · +${tk.side_backing_2x_lf} LF 2× ${es ? 'respaldo lat.' : 'side backing'}` : ''}</div>
          <div class="takeoff-card-sub">${es ? 'En espera hasta confirmar cortafuego y claro B.' : 'On hold until fire-rating & joist bay B verified.'}</div>
        </article>`;

    grid.innerHTML = `
      <article class="takeoff-card ${tk.walkway_cap_exceeded ? 'card-disabled' : 'card-primary'}">
        <div class="takeoff-card-title">${es ? 'OSB 23/32" o Triplay 3/4" (4×8)' : '23/32" OSB or 3/4" Ply (4×8)'}</div>
        <div class="takeoff-card-big">${sheetMain}</div>
        <div class="takeoff-card-sub">${sheetSub}</div>
        ${tk.walkway_cap_exceeded ? `<div class="takeoff-card-sub" style="color:#b91c1c;font-weight:700;">${es ? '¡EXCEDE LÍMITE DE 20 PIES A 66" DE ALTURA!' : 'EXCEEDS 20 FT MAX AT 66" ATTIC HEIGHT!'}</div>` : ''}
      </article>

      ${woodCard}

      <article class="takeoff-card">
        <div class="takeoff-card-title">${es ? 'Sellado de Aire y Burlete' : 'Air-Seal & Weatherstrip'}</div>
        <div class="takeoff-card-big">${tk.backer_rod_3_8_lf} LF + ${tk.weatherstrip_closed_cell_lf} LF</div>
        <div class="takeoff-card-sub">${es ? 'Cordón 3/8" + sellador pintable (marco fijo) · Burlete 1/2"×1/8" celda cerrada (apoyos 1×2)' : '3/8" backer rod + sealant (fixed frame) · Continuous 1/2"×1/8" closed-cell strip (1×2 ledges)'}</div>
      </article>

      <article class="takeoff-card">
        <div class="takeoff-card-title">${es ? 'Aislamiento Tapa y Herrajes' : 'Lid Hardware (Uninsulated)'}</div>
        <div class="takeoff-card-big">2 ${es ? 'jaladeras' : 'pulls'} · 4 ${es ? 'cierres' : 'latches'}</div>
        <div class="takeoff-card-sub">${es ? '2 1x2 gasket ledger (12-5/8"×37-1/4") + 3 alambres cal.16 + confirm w/ NEXT <=1/2" + 4 broches' : 'Uninsulated 3/4" ply lid + 2 ring pulls + 4 latches outside 24"×36" clear (unconditioned Door 4 landing)"×37-1/4") + 3 1x2 gasket ledger + confirm w/ NEXT <=1/2" + 4 latches'}</div>
      </article>
    `;
  }

  /* ── Attached Comment Callouts (Per-Comment Mic + Send to Agent) ──── */
  function buildLocalFallbackAnswer(questionText) {
    const q = String(questionText || '').toLowerCase();
    const m = computeDerived();
    const es = currentLang === 'es';
    if (q.includes('fire') || q.includes('fuego') || q.includes('cut') || q.includes('cort')) {
      return es
        ? `Estado cortafuego actual: ${m.fireGate}. Cero cortes ni compra de kit de madera hasta confirmar si el plafón es cortafuego y medir el claro entre vigas B.`
        : `Current ceiling fire-rating status: ${m.fireGate}. Zero ceiling cuts or wood-kit purchases until fire rating and joist bay B are verified.`;
    }
    if (q.includes('walk') || q.includes('pasillo') || q.includes('sheet') || q.includes('hoja')) {
      return es
        ? 'Con 66" de altura (<6 pies), el pasillo máximo es 20 pies. Regla sierra: 1 tira de 24" por hoja 4×8 (<=7 pies: 1 hoja, 7–14 pies: 2 hojas, 14–20 pies: 3 hojas) en OSB 23/32" o triplay 3/4" (nunca 3/8").'
        : 'At 66" attic height (<6 ft), maximum walkway run is 20 ft. Saw-kerf rule: 1 true 24" strip per 4×8 sheet (<=7 ft: 1, 7–14 ft: 2, 14–20 ft: 3) in 23/32" OSB or 3/4" ply (never 3/8").';
    }
    return es
      ? 'Fuera de Tailnet: conéctate a Tailscale de Tisa para consultar al Agente Unidad 4 en vivo (:8791), o guarda el comentario en tu exportación local.'
      : 'Off-tailnet: connect to Tisa\'s Tailscale network to query the live Unit 4 Agent (:8791), or keep this note in your local export.';
  }

  async function sendPinToAgent(idx) {
    const pin = (state.pins || [])[idx];
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
        const qUrl = `${voiceOrigin}/api/unit4/knowledge?q=${encodeURIComponent(text)}&room=attic-access`;
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
        /* graceful off-tailnet fallback */
      }
      pin.agent_status = 'local_answer';
      pin.agent_reply = buildLocalFallbackAnswer(text);
      renderSvg();
      renderPinsList();
      showToast(es ? 'Respuesta local (fuera de Tailnet)' : 'Local spec note (Off-Tailnet)', 'ok');
      return;
    }

    const parsedCmd = parseSpokenFieldCommand(text);
    const patch = parsedCmd ? deepClone(parsedCmd) : {};
    patch.pin = deepClone(pin);
    patch.voice_note = text;
    if (parsedCmd) applyPatchToLocalState(parsedCmd);

    if (tailnetState.verified) {
      const ok = await saveOverrideToTailnet(patch, text);
      if (ok && state.pins[idx]) {
        state.pins[idx].agent_status = 'sent_applied';
        state.pins[idx].agent_reply = es ? `Guardado en Tailnet (${lastSavedRevId || state.base_rev})` : `Saved to Tailnet (${lastSavedRevId || state.base_rev})`;
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
        if (state.pins[i]) { state.pins[i].note = ta.value; renderSvg(); }
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
      btn.addEventListener('click', () => toggleVoiceDictation(Number(btn.getAttribute('data-pin-mic'))));
    });
    listEl.querySelectorAll('[data-pin-send]').forEach((btn) => {
      btn.addEventListener('click', () => sendPinToAgent(Number(btn.getAttribute('data-pin-send'))));
    });
  }

  function renderEodDrawer() {
    const listEl = document.getElementById('eod-list');
    const countPill = document.getElementById('eod-count-pill');
    if (!listEl || !countPill) return;

    const tr = I18N[currentLang];
    const pending = tailnetState.pendingEod || [];
    const total = pending.length + (hasUnsyncedLocalEdits ? 1 : 0);
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
            ? 'Los cambios actuales solo están en vista previa local. Conéctate a Tailnet (:8444) y pulsa Guardar en Tailnet.'
            : 'Current edits are local preview only. Connect to Tailnet (:8444) and tap Save Live to Tailnet.'}</div>
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
      btn.addEventListener('click', () => handleEodAction(btn.getAttribute('data-rev-id'), btn.getAttribute('data-eod-action')));
    });
  }

  function syncFormFromState() {
    ensureStateDefaults(state);
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v === null || v === undefined ? '' : String(v);
    };
    setVal('sel-location', state.orientation.candidate_location);
    setVal('sel-fire-gate', state.enclosure_rules.fire_rating_gate);
    setVal('inp-joist-b', state.dimensions.joist_bay_width_b_in.value);
    setVal('inp-walkway-l', state.dimensions.walkway_run_length_ft.value);
    setVal('rng-walkway-l', state.dimensions.walkway_run_length_ft.value === null ? 12 : state.dimensions.walkway_run_length_ft.value);
    setVal('inp-offset-1', state.orientation.wall_offset_1_in.value);
    setVal('inp-offset-2', state.orientation.wall_offset_2_in.value);
    setVal('sel-lid-finish', state.enclosure_rules.lid_finish_status);

    const trim = state.existing_original_trim;
    setVal('inp-trim-baseboard', trim.baseboard_height_in.value);
    setVal('inp-trim-rail', trim.high_picture_rail_height_in.value);
    setVal('inp-trim-door-casing', trim.door_casing_width_in.value);
    setVal('inp-trim-win-casing', trim.window_casing_width_in.value);

    const wPct = state.takeoff_settings.waste_pct;
    setVal('inp-waste-pct', wPct);
    document.getElementById('btn-waste-10')?.classList.toggle('btn-primary', Number(wPct) === 10);
    document.getElementById('btn-waste-15')?.classList.toggle('btn-primary', Number(wPct) === 15);

    const setProv = (id, val) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = val;
      el.className = `pill ${val === 'MEASURE_ON_SITE' || val === 'FIRE_RATED_REQUIRED' || val === 'UNVERIFIED_HOLD' ? 'pill-fail' : val === 'VERIFY_ON_SITE' ? 'pill-warn' : 'pill-pass'}`;
    };
    setProv('prov-fire-gate', state.enclosure_rules.fire_rating_gate);
    setProv('prov-joist-b', state.dimensions.joist_bay_width_b_in.verified);
    setProv('prov-walkway-l', state.dimensions.walkway_run_length_ft.verified);
    setProv('prov-offset-1', state.orientation.wall_offset_1_in.verified);
    setProv('prov-offset-2', state.orientation.wall_offset_2_in.verified);
    setProv('prov-trim-base', trim.baseboard_height_in.verified);
    setProv('prov-trim-rail', trim.high_picture_rail_height_in.verified);
    setProv('prov-trim-door', trim.door_casing_width_in.verified);
    setProv('prov-trim-win', trim.window_casing_width_in.verified);
  }

  function applyUiLanguage() {
    const tr = I18N[currentLang];
    document.documentElement.lang = currentLang;
    document.title = tr.doc_title;
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    setText('hdr-title', tr.hdr_title);
    setText('hdr-sub', tr.hdr_sub);
    setText('link-back-room', tr.back_room);
    setText('link-hvac-plan', tr.jump_hvac);
    setText('btn-lang', tr.btn_lang);
    setText('btn-circle-toggle', circleMode ? tr.btn_circle_off : tr.btn_circle_on);
    setText('btn-export-svg', tr.btn_export_svg);
    setText('btn-download-pdf', tr.btn_download_pdf);
    setHtml('hold-banner', tr.hold_html);
    setText('conflict-text', tr.conflict_text);
    setText('btn-reload-latest', tr.btn_reload);
    setText('svg-panel-title', activeView === 'section' ? tr.svg_title_section : tr.svg_title_plan);
    setText('tab-view-plan', tr.tab_view_plan);
    setText('tab-view-section', tr.tab_view_section);
    setText('drag-hint-lbl', tr.drag_hint);
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
    setText('rules-title', tr.rules_title);
    setText('rules-pill', tr.rules_pill);
    setText('clashes-title', tr.clashes_title);
    setText('clashes-lock-pill', tr.clashes_lock_pill);
    setText('takeoff-title', tr.takeoff_title);
    setText('takeoff-notice', tr.takeoff_notice);
    setText('lbl-waste-pct', tr.lbl_waste_pct);
    setText('btn-waste-10', tr.btn_waste_10);
    setText('btn-waste-15', tr.btn_waste_15);
    setText('saw-kerf-hint', tr.saw_kerf_hint);
    setText('editor-title', tr.editor_title);
    setText('preset-lbl', tr.preset_lbl);
    setText('preset-b-275', tr.preset_b_275);
    setText('preset-b-30', tr.preset_b_30);
    setText('preset-b-22', tr.preset_b_22);
    setText('preset-l-12', tr.preset_l_12);
    setText('preset-l-22', tr.preset_l_22);
    setText('btn-reset-baseline', tr.btn_reset);
    setText('help-joist-b', tr.help_joist_b);
    setText('help-walkway-l', tr.help_walkway_l);
    setText('btn-apply-local', tr.btn_apply_local);
    setText('btn-save-tailnet', tr.btn_save_tailnet);
    setText('btn-export-json', tr.btn_export_json);
    setText('trim-title', tr.trim_title);
    setText('trim-badge', tr.trim_badge);
    setText('trim-rule-note', currentLang === 'es' ? state.existing_original_trim.preservation_rule_es : state.existing_original_trim.preservation_rule_en);
    setText('voice-title', tr.voice_title);
    setText('voice-lang-pill', currentLang === 'es' ? 'es-MX' : 'en-US');
    setText('btn-dictate', speechListening && speechTargetPinIdx === null ? tr.btn_dictate_stop : tr.btn_dictate);
    setText('btn-apply-note', tr.btn_apply_note);
    setText('sketch-status-pill', pendingCircleNorm ? tr.sketch_ready : tr.sketch_none);
    setText('eod-title', tr.eod_title);
    setHtml('eod-desc', tr.eod_desc);
    setText('btn-refresh-eod', tr.btn_refresh_eod);

    const tPlan = document.getElementById('tab-view-plan');
    const tSec = document.getElementById('tab-view-section');
    if (tPlan) { tPlan.classList.toggle('active', activeView === 'plan'); tPlan.setAttribute('aria-selected', String(activeView === 'plan')); }
    if (tSec) { tSec.classList.toggle('active', activeView === 'section'); tSec.setAttribute('aria-selected', String(activeView === 'section')); }
    setText('scale-pill', currentLang === 'es' ? 'Escala Real 1:1 (X = Y)' : 'True Scale 1:1 (X = Y)');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (tr[k]) el.textContent = tr[k];
    });

    ['inp-joist-b', 'inp-walkway-l', 'inp-offset-1', 'inp-offset-2', 'inp-trim-door-casing', 'inp-trim-win-casing'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.placeholder = tr.measure_on_site;
    });
    const noteEl = document.getElementById('inp-voice-note');
    if (noteEl) noteEl.placeholder = tr.note_placeholder;

    const setOpts = (id, list) => {
      const sel = document.getElementById(id);
      if (sel && sel.options.length >= list.length) {
        list.forEach((t, i) => { sel.options[i].textContent = t; });
      }
    };
    setOpts('sel-location', tr.loc_opts);
    setOpts('sel-fire-gate', tr.fire_opts);
    setOpts('sel-lid-finish', tr.lid_opts);
    setOpts('sel-pin-intent', [tr.intent_edit, tr.intent_problem, tr.intent_question]);
  }

  function renderAll() {
    applyUiLanguage();
    renderSvg();
    renderStatusPills();
    renderEnclosureRules();
    renderClashes();
    renderTakeoff();
    renderPinsList();
    renderEodDrawer();
  }

  /* ── Form Patch Building & Local State Application ────────────────── */
  function buildPatchFromForm() {
    const numOrNull = (id) => {
      const el = document.getElementById(id);
      if (!el || el.value.trim() === '') return null;
      const n = Number(el.value);
      return Number.isFinite(n) ? n : null;
    };

    const patch = {};
    const dimensions = {};
    const jB = numOrNull('inp-joist-b');
    if (jB !== state.dimensions.joist_bay_width_b_in.value) {
      dimensions.joist_bay_width_b_in = { value: jB, measure_boundary: 'rough_opening', verified: jB === null ? 'MEASURE_ON_SITE' : 'PENDING_EOD_REVIEW' };
    }
    const wL = numOrNull('inp-walkway-l');
    if (wL !== state.dimensions.walkway_run_length_ft.value) {
      dimensions.walkway_run_length_ft = { value: wL, measure_boundary: 'wall_to_wall', verified: wL === null ? 'MEASURE_ON_SITE' : 'PENDING_EOD_REVIEW' };
    }
    if (Object.keys(dimensions).length) patch.dimensions = dimensions;

    const orientation = {};
    const loc = document.getElementById('sel-location')?.value;
    if (loc && loc !== state.orientation.candidate_location) orientation.candidate_location = loc;
    const o1 = numOrNull('inp-offset-1');
    if (o1 !== state.orientation.wall_offset_1_in.value) {
      orientation.wall_offset_1_in = { value: o1, measure_boundary: 'wall_to_wall', verified: o1 === null ? 'MEASURE_ON_SITE' : 'PENDING_EOD_REVIEW' };
    }
    const o2 = numOrNull('inp-offset-2');
    if (o2 !== state.orientation.wall_offset_2_in.value) {
      orientation.wall_offset_2_in = { value: o2, measure_boundary: 'wall_to_wall', verified: o2 === null ? 'MEASURE_ON_SITE' : 'PENDING_EOD_REVIEW' };
    }
    if (Object.keys(orientation).length) patch.orientation = orientation;

    const enc = {};
    const fg = document.getElementById('sel-fire-gate')?.value;
    if (fg && fg !== state.enclosure_rules.fire_rating_gate) enc.fire_rating_gate = fg;
    const lf = document.getElementById('sel-lid-finish')?.value;
    if (lf && lf !== state.enclosure_rules.lid_finish_status) enc.lid_finish_status = lf;
    if (Object.keys(enc).length) patch.enclosure_rules = enc;

    return patch;
  }

  function applyPatchToLocalState(patch) {
    if (!patch || typeof patch !== 'object') return;
    ensureStateDefaults(state);
    if (patch.dimensions) {
      Object.keys(patch.dimensions).forEach((k) => {
        /* NEVER shrink locked 24" x 36" finished clear */
        if (k === 'finished_clear_width_in' || k === 'finished_clear_length_in') return;
        if (!state.dimensions[k]) return;
        const upd = patch.dimensions[k];
        if (upd && typeof upd === 'object') {
          if ('value' in upd) state.dimensions[k].value = upd.value;
          if (upd.verified) state.dimensions[k].verified = upd.verified;
        }
      });
    }
    if (patch.orientation) {
      if (patch.orientation.candidate_location) state.orientation.candidate_location = patch.orientation.candidate_location;
      if (patch.orientation.wall_offset_1_in) Object.assign(state.orientation.wall_offset_1_in, patch.orientation.wall_offset_1_in);
      if (patch.orientation.wall_offset_2_in) Object.assign(state.orientation.wall_offset_2_in, patch.orientation.wall_offset_2_in);
    }
    if (patch.enclosure_rules) {
      if (patch.enclosure_rules.fire_rating_gate) state.enclosure_rules.fire_rating_gate = patch.enclosure_rules.fire_rating_gate;
      if (patch.enclosure_rules.lid_finish_status) state.enclosure_rules.lid_finish_status = patch.enclosure_rules.lid_finish_status;
    }
    if (patch.existing_original_trim) {
      Object.keys(patch.existing_original_trim).forEach((k) => {
        if (state.existing_original_trim[k] && typeof state.existing_original_trim[k] === 'object') {
          Object.assign(state.existing_original_trim[k], patch.existing_original_trim[k]);
        }
      });
    }
    if (patch.takeoff_settings && 'waste_pct' in patch.takeoff_settings) {
      state.takeoff_settings.waste_pct = patch.takeoff_settings.waste_pct;
    }
    if (patch.pin) {
      state.pins = state.pins || [];
      state.pins.push(patch.pin);
    }
    /* Immutable safeguards */
    state.dimensions.finished_clear_width_in.value = 24.0;
    state.dimensions.finished_clear_length_in.value = 36.0;
    state.flagged_clashes = deepClone(BASELINE_ATTIC_DATA.flagged_clashes);
    hasUnsyncedLocalEdits = true;
    syncFormFromState();
    renderAll();
  }

  /* ── Circle-to-Correct Canvas ─────────────────────────────────────── */
  function syncCanvasSize() {
    const svg = document.getElementById('attic-svg');
    const canvas = document.getElementById('attic-sketch-canvas');
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
    const canvas = document.getElementById('attic-sketch-canvas');
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
    if (pill) { pill.className = 'pill pill-neutral'; pill.textContent = I18N[currentLang].sketch_none; }
  }

  function setCircleMode(enabled) {
    circleMode = !!enabled;
    const canvas = document.getElementById('attic-sketch-canvas');
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
    const canvas = document.getElementById('attic-sketch-canvas');
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
        if (pill) { pill.className = 'pill pill-fail'; pill.textContent = I18N[currentLang].sketch_ready; }
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
    const numRe = '(\\d+(?:\\.\\d+)?)';
    const patch = {};

    const joistMatch = s.match(new RegExp(`(?:joist|bay|viga|claro)[^\\d]{0,20}${numRe}`));
    if (joistMatch) {
      const v = Number(joistMatch[1]);
      if (v >= 10 && v <= 48) {
        patch.dimensions = patch.dimensions || {};
        patch.dimensions.joist_bay_width_b_in = { value: v, measure_boundary: 'rough_opening', verified: 'PENDING_EOD_REVIEW' };
      }
    }

    const walkMatch = s.match(new RegExp(`(?:walkway|walk|pasillo|run)[^\\d]{0,20}${numRe}`));
    if (walkMatch) {
      const v = Number(walkMatch[1]);
      if (v >= 0 && v <= 25) {
        patch.dimensions = patch.dimensions || {};
        patch.dimensions.walkway_run_length_ft = { value: v, measure_boundary: 'wall_to_wall', verified: 'PENDING_EOD_REVIEW' };
      }
    }

    if (/(fire[\s-]*rated|cortafuego)/.test(s) && !/(non[\s-]*rated|no\s+cortafuego)/.test(s)) {
      patch.enclosure_rules = { fire_rating_gate: 'FIRE_RATED_REQUIRED' };
    } else if (/(non[\s-]*rated|no\s+cortafuego)/.test(s)) {
      patch.enclosure_rules = { fire_rating_gate: 'NON_RATED_CONFIRMED' };
    }

    return Object.keys(patch).length ? patch : null;
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
      if (btn && speechTargetPinIdx === null) { btn.classList.add('btn-active'); btn.textContent = tr.btn_dictate_stop; }
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
        if (box && transcript) box.value = box.value ? `${box.value.trim()} ${transcript}` : transcript;
      }
      if (statusEl) statusEl.textContent = `${currentLang === 'es' ? 'Capturado' : 'Captured'}: "${transcript}"`;
    };
    speechRecognition.onerror = (evt) => { if (statusEl) statusEl.textContent = `Speech error: ${evt.error}`; };
    speechRecognition.onend = () => {
      speechListening = false;
      speechTargetPinIdx = null;
      const btn = document.getElementById('btn-dictate');
      if (btn) { btn.classList.remove('btn-active'); btn.textContent = I18N[currentLang].btn_dictate; }
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
      const res = await fetch('../attic-hatch-plan-data.json', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.dimensions && data.room_id === 'attic') {
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
        if (res.data.data) state = ensureStateDefaults(deepClone(res.data.data));
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
        body: JSON.stringify({ base_rev: state.base_rev, rev_id: revId, action, actor })
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
    const svgEl = document.getElementById('attic-svg');
    if (!svgEl) return;
    const raw = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svgEl);
    const rev = (state.base_rev || 'attic').replace(/[^a-zA-Z0-9_-]/g, '');
    downloadBlob(new Blob([raw], { type: 'image/svg+xml;charset=utf-8' }), `U4_attic-hatch_${currentLang.toUpperCase()}_${rev}.svg`);
  }

  function exportLocalJson() {
    const out = deepClone(state);
    out.takeoff = computeTakeoff();
    out.revision_stamp = computeRevisionStamp();
    out.exported_at = new Date().toISOString();
    downloadBlob(
      new Blob([JSON.stringify(out, null, 2)], { type: 'application/json;charset=utf-8' }),
      `attic-hatch-plan-data_${currentLang.toUpperCase()}.json`
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
    document.getElementById('tab-view-plan')?.addEventListener('click', () => { activeView = 'plan'; renderAll(); });
    document.getElementById('tab-view-section')?.addEventListener('click', () => { activeView = 'section'; renderAll(); });
    document.getElementById('btn-circle-toggle')?.addEventListener('click', () => setCircleMode(!circleMode));
    document.getElementById('btn-circle-done')?.addEventListener('click', () => setCircleMode(false));
    document.getElementById('btn-clear-sketch')?.addEventListener('click', clearSketch);
    document.getElementById('btn-export-svg')?.addEventListener('click', exportLiveSvg);
    document.getElementById('btn-download-pdf')?.addEventListener('click', triggerPdfExport);
    document.getElementById('btn-export-json')?.addEventListener('click', exportLocalJson);
    document.getElementById('btn-reload-latest')?.addEventListener('click', checkTailnetAndLoad);
    document.getElementById('btn-refresh-eod')?.addEventListener('click', checkTailnetAndLoad);

    ['framing', 'furnace', 'enclosure'].forEach((k) => {
      const cb = document.getElementById(`lyr-${k}`);
      if (!cb) return;
      cb.addEventListener('change', () => { layers[k] = cb.checked; renderSvg(); });
    });

    document.getElementById('btn-waste-10')?.addEventListener('click', () => applyPatchToLocalState({ takeoff_settings: { waste_pct: 10 } }));
    document.getElementById('btn-waste-15')?.addEventListener('click', () => applyPatchToLocalState({ takeoff_settings: { waste_pct: 15 } }));
    document.getElementById('inp-waste-pct')?.addEventListener('input', (e) => {
      const n = Number(e.target.value);
      if (Number.isFinite(n)) applyPatchToLocalState({ takeoff_settings: { waste_pct: Math.max(0, Math.min(30, n)) } });
    });

    /* Walkway slider synced directly with numeric input & SVG */
    document.getElementById('rng-walkway-l')?.addEventListener('input', (e) => {
      const v = Number(e.target.value);
      if (Number.isFinite(v)) {
        applyPatchToLocalState({
          dimensions: { walkway_run_length_ft: { value: v, measure_boundary: 'wall_to_wall', verified: 'PENDING_EOD_REVIEW' } }
        });
      }
    });

    const wireTrimInput = (id, key, allowNull) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const raw = el.value.trim();
        const val = raw === '' ? null : Number(raw);
        if (val === null && !allowNull) return;
        const next = {};
        next[key] = { value: val !== null && Number.isFinite(val) ? val : null, verified: val === null ? 'MEASURE_ON_SITE' : 'PENDING_EOD_REVIEW' };
        applyPatchToLocalState({ existing_original_trim: next });
      });
    };
    wireTrimInput('inp-trim-baseboard', 'baseboard_height_in', false);
    wireTrimInput('inp-trim-rail', 'high_picture_rail_height_in', false);
    wireTrimInput('inp-trim-door-casing', 'door_casing_width_in', true);
    wireTrimInput('inp-trim-win-casing', 'window_casing_width_in', true);

    const form = document.getElementById('attic-form');
    if (form) {
      form.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'rng-walkway-l') return;
        const patch = buildPatchFromForm();
        if (Object.keys(patch).length) applyPatchToLocalState(patch);
      });
      form.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'rng-walkway-l') return;
        const patch = buildPatchFromForm();
        if (Object.keys(patch).length) applyPatchToLocalState(patch);
      });
    }

    document.getElementById('btn-apply-local')?.addEventListener('click', () => {
      const patch = buildPatchFromForm();
      if (Object.keys(patch).length) applyPatchToLocalState(patch);
      else renderAll();
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

    /* Quick field test presets */
    document.getElementById('preset-b-275')?.addEventListener('click', () => {
      applyPatchToLocalState({ dimensions: { joist_bay_width_b_in: { value: 27.5, verified: 'PENDING_EOD_REVIEW' } } });
    });
    document.getElementById('preset-b-30')?.addEventListener('click', () => {
      applyPatchToLocalState({ dimensions: { joist_bay_width_b_in: { value: 30.0, verified: 'PENDING_EOD_REVIEW' } } });
    });
    document.getElementById('preset-b-22')?.addEventListener('click', () => {
      applyPatchToLocalState({ dimensions: { joist_bay_width_b_in: { value: 22.0, verified: 'PENDING_EOD_REVIEW' } } });
    });
    document.getElementById('preset-l-12')?.addEventListener('click', () => {
      applyPatchToLocalState({ dimensions: { walkway_run_length_ft: { value: 12.0, verified: 'PENDING_EOD_REVIEW' } } });
    });
    document.getElementById('preset-l-22')?.addEventListener('click', () => {
      applyPatchToLocalState({ dimensions: { walkway_run_length_ft: { value: 22.0, verified: 'PENDING_EOD_REVIEW' } } });
    });
    document.getElementById('btn-reset-baseline')?.addEventListener('click', () => {
      state = deepClone(BASELINE_ATTIC_DATA);
      hasUnsyncedLocalEdits = false;
      lastSavedRevId = null;
      clearSketch();
      syncFormFromState();
      renderAll();
      showToast(currentLang === 'es' ? 'Restaurado a borrador base' : 'Reset to working draft baseline', 'ok');
    });

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
      const pt = pendingCircleNorm || { cx: 0.28, cy: 0.30, rx: 0.035, ry: 0.025 };
      patch.pin = {
        cx: Number(pt.cx.toFixed(4)),
        cy: Number(pt.cy.toFixed(4)),
        rx: Number(pt.rx.toFixed(4)),
        ry: Number(pt.ry.toFixed(4)),
        intent,
        mode,
        author,
        note: note || (currentLang === 'es' ? 'Punto marcado en plano' : 'Circled spot on plan'),
        agent_status: 'draft',
        agent_reply: '',
        created_at: new Date().toISOString()
      };
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
        if (ok && state.pins[newIdx]) { state.pins[newIdx].agent_status = 'sent_applied'; renderAll(); }
      } else {
        showToast(currentLang === 'es' ? 'Comentario adjunto con línea guía (vista local)' : 'Attached comment pin with leader line (local preview)', 'ok');
      }
    });
  }

  /* ── Unified Public Integration Contract (window.U4PLAN) ──────────── */
  window.U4PLAN = {
    planId: 'attic-hatch',
    getSvgElement() { return document.getElementById('attic-svg'); },
    getState() { return deepClone(state); },
    getTakeoff() { return computeTakeoff(); },
    getScaleInfo() { return deepClone(lastScaleInfo); },
    getView() { return activeView; },
    setView(v) {
      if (v === 'plan' || v === 'section') { activeView = v; renderAll(); }
    },
    getLang() { return currentLang; },
    getRevisionStamp() { return computeRevisionStamp(); },
    getAnnotationDataUrl() {
      const canvas = document.getElementById('attic-sketch-canvas');
      if (!canvas || !drawPoints.length) return null;
      try { return canvas.toDataURL('image/png'); } catch (_) { return null; }
    },
    setLang(lang) {
      if (lang === 'en' || lang === 'es') { currentLang = lang; renderAll(); }
    },
    applyLocalPatch(patch) { applyPatchToLocalState(patch); },
    render() { renderAll(); }
  };

  function resolveCrossLinks() {
    const isWikiPlans = /\/plans\//.test(window.location.pathname || '');
    const backEl = document.getElementById('link-back-room');
    const hvacEl = document.getElementById('link-hvac-plan');
    if (backEl) backEl.href = isWikiPlans ? '../../#attic-access' : '../../index.html#attic-access';
    if (hvacEl) hvacEl.href = isWikiPlans ? '../hvac-layout/index.html' : '../../hvac/interactive-pilot/index.html';
  }

  async function boot() {
    if (params.get('print') === '1') document.body.classList.add('print-mode');
    resolveCrossLinks();
    initCircleCanvas();
    wireControls();
    await hydrateFromLocalJson();
    if (params.get('snapshot') === '1' || params.get('print') === '1') { state.pins = []; state.field_overrides = []; hasUnsyncedLocalEdits = false; }
    syncFormFromState();
    renderAll();
    if (params.get('snapshot') !== '1') await checkTailnetAndLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
