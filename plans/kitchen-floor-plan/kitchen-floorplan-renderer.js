/* Unit 4 Kitchen — Coupled Floor Plan & Wall-by-Wall Cabinet Schedule (Module 5)
 * Owned by @ag-unit-4-specialists (83beabda).
 *
 * Unified Integration Contract exposed on window.U4PLAN:
 *   - planId                  -> "kitchen-floor-plan"
 *   - getSvgElement()         -> <svg id="kitchen-fp-svg">
 *   - getState()              -> deep clone of live schedule + room JSON
 *   - getClosureSummary()     -> live 4-wall closure math & narrowest walkway
 *   - getTakeoff()            -> live cross-wall wrap-around tile/backer/counter takeoff (ZERO prices)
 *   - getScaleInfo()          -> { view, scaleX, scaleY, uniform } (always scaleX === scaleY)
 *   - getView() / setView(v)  -> "floor" | "west" | "south" | "east" | "north"
 *   - getLang() / setLang(l)  -> "en" | "es"
 *   - getRevisionStamp()      -> single-line revision & sync stamp
 *   - getAnnotationDataUrl()  -> PNG data URL of Circle-to-Correct canvas (or null)
 *   - applyLocalPatch(patch)  -> apply local preview patch programmatically
 *   - render()                -> force re-render
 *
 * Security & privacy invariants:
 *   - Tailnet-only persistence (:8444/api/unit4/plans/kitchen-floor-plan, ?api= override).
 *   - ZERO fake PIN/token, ZERO browser web-storage offline queue, ZERO prices/order numbers.
 *   - Immutable flagged_clashes (never auto-resolved in code).
 *   - Strict uniform scaleX === scaleY across Floor Plan + West/South/East/North views.
 */

(function () {
  'use strict';

  const DEFAULT_API_ORIGIN = 'https://mac-mini.tailcf4007.ts.net:8444';
  const DEFAULT_VOICE_ORIGIN = 'https://mac-mini.tailcf4007.ts.net:8791';
  const PLAN_ENDPOINT_BASE = '/api/unit4/plans/kitchen-floor-plan';

  const BASELINE_KITCHEN_FP = {
    schema_version: '1.0.0',
    project: '1231 11th Avenue Unit 4, San Francisco, CA',
    room_id: 'kitchen',
    plan_id: 'kitchen-floor-plan',
    title_en: 'Kitchen Floor Plan & Cabinet Schedule',
    title_es: 'Planta de Cocina y Lista de Gabinetes',
    governing_spec: 'kitchen/SPEC.md',
    base_rev: 'rev-20261120-kitchen-fp-001',
    status: 'LAYOUT_STAGING_HOLD_PENDING_FRIDAY_MOCKUP_PHOTOS',
    room_geometry: {
      south_width_in: 147.0,
      east_depth_in: 126.25,
      north_width_in: 115.5,
      west_range_wall_in: 66.25,
      west_recess_depth_in: 31.5,
      west_recess_length_in: 59.75,
      ceiling_height_in: 121.5,
      floor_buildup_t_in: { value: 0.75, measure_boundary: 'subfloor', verified: 'MEASURE_ON_SITE' },
      counter_height_in: 36.0,
      base_depth_in: 24.0,
      counter_overhang_front_in: 1.5,
      counter_overhang_side_in: 1.0,
      upper_depth_in: 12.0,
      south_window: { from_se_start_in: 72.87, from_se_end_in: 106.68, width_in: 33.81, centerline_from_se_in: 89.78, sill_aff_in: 45.94, head_aff_in: 104.06 },
      south_rear_door: { from_se_start_in: 116.41, from_se_end_in: 142.28, width_in: 25.875, height_in: 78.625, usable_span_magicplan_in: 115.0, usable_span_john_tape_in: 114.0 },
      ne_hall_opening: { width_in: 29.375, height_in: 84.0 },
      pie_safe_existing: { from_se_start_in: 26.0, from_se_end_in: 59.0, approx_width_in: 33.0, bottom_aff_in: 36.0, top_aff_in: 80.0, final_reduced_width_in: null, final_depth_in: null },
      east_d04_infill_zone: { from_se_start_in: 6.0, from_se_end_in: 38.0, no_screw_min_aff_in: 53.0, no_screw_max_aff_in: 77.0 }
    },
    options: {
      south_end_option: '6in_filler_pullout',
      south_sink_basis: 'nov2_75_105',
      east_optional_uppers: true,
      west_left_chase_width_in: null
    },
    existing_original_trim: {
      baseboard_height_in: { value: 9.5, measure_boundary: 'aff', verified: 'VERIFY_ON_SITE' },
      high_picture_rail_height_in: { value: 103.0, measure_boundary: 'aff', verified: 'VERIFY_ON_SITE' },
      door_casing_width_in: { value: null, measure_boundary: 'to_casing_edge', verified: 'MEASURE_ON_SITE' },
      window_casing_width_in: { value: null, measure_boundary: 'to_casing_edge', verified: 'MEASURE_ON_SITE' },
      preservation_rule_en: 'Preserve original Edwardian baseboards (9-1/2"), high picture rail (103"), and door/window casings. Never mix existing original trim with proposed new cabinet fillers.',
      preservation_rule_es: 'Conservar zoclo (9-1/2"), moldura alta (103") y chambranas originales Edwardian. Nunca mezclar molduras originales con rellenos nuevos.'
    },
    walls: {
      West: { span_in: 66.25, usable_span_in: 66.25, zero_corner_en: 'South Step Corner (0" → North)', zero_corner_es: 'Esquina Sur (0" → Norte)', uppers_locked_none: true },
      South: { span_in: 147.0, usable_span_in: 115.0, tape_span_in: 114.0, zero_corner_en: 'SE Corner (0" → West)', zero_corner_es: 'Esquina SE (0" → Oeste)', uppers_locked_none: false },
      East: { span_in: 126.25, usable_span_in: 88.0, zero_corner_en: 'SE Corner (0" → North)', zero_corner_es: 'Esquina SE (0" → Norte)', uppers_locked_none: false },
      North: { span_in: 115.5, usable_span_in: 115.5, zero_corner_en: 'NW Corner (0" → East)', zero_corner_es: 'Esquina NO (0" → Este)', uppers_locked_none: false }
    },
    cabinets: [
      { id: 'W-B1', wall: 'West', type: 'Base', order: 1, label_en: 'West Left Base Cabinet (Essex Green)', label_es: 'Gabinete Bajo Izq. Oeste (Essex Green)', station_start_in: 0, width_in: 18, depth_in: 24, height_in: 34.5, measure_boundary: 'wall_to_wall', status: 'Locked', editable_width: true, note_en: 'Starts at South Step Corner (0"). Existing left-chase duct IS dedicated to kitchen hood exhaust (nothing else connected; verify >= 6"). NEXT HVAC is furnace/heating ONLY — do not route hood exhaust to NEXT HVAC.', note_es: 'Inicia en Esquina Sur (0"). Ducto izq. ES exclusivo de campana (nada más conectado; verificar >= 6"). NEXT HVAC es SOLO calefacción — no conectar campana ahí.' },
      { id: 'W-A1', wall: 'West', type: 'Appliance Bay', order: 2, label_en: 'Viking 30" Gas Range Bay (VGCC5304BSS)', label_es: 'Claro Estufa Gas Viking 30" (VGCC5304BSS)', station_start_in: 18, width_in: 30, depth_in: 28.0625, height_in: 36.375, measure_boundary: 'clear_between_casings', status: 'Locked', editable_width: true, note_en: 'CL 33". Zephyr ZSA-E30AS hood above: direct hardwire via 1-gang 2"×3" box (~83"–86" above finished floor, C/L ± 2-1/4", ~1" proud for 1/2" HardieBacker + tile inside 8-5/8"×7-1/2" casing; replaces 4×4 box at 100").', note_es: 'Eje 33". Campana Zephyr arriba: cableado directo caja sencilla 2"×3" (~83"–86" piso term., eje ± 2-1/4", ~1" salida p/ HardieBacker + azulejo; reemplaza caja 4×4 a 100").' },
      { id: 'W-B2', wall: 'West', type: 'Base', order: 3, label_en: 'West Right Base Cabinet (Essex Green)', label_es: 'Gabinete Bajo Der. Oeste (Essex Green)', station_start_in: 48, width_in: 18, depth_in: 24, height_in: 34.5, measure_boundary: 'wall_to_wall', status: 'Locked', editable_width: true, note_en: 'Runs to 66" (+1/4" scribe to North corner).', note_es: 'Llega a 66" (+1/4" ajuste a esquina Norte).' },
      { id: 'W-F1', wall: 'West', type: 'Filler', order: 4, label_en: 'North Corner Scribe Strip', label_es: 'Tira de Ajuste Esquina Norte', station_start_in: 66, width_in: 0.25, depth_in: 24, height_in: 34.5, measure_boundary: 'wall_to_wall', status: 'Verify on Site', editable_width: true, note_en: 'Closes 66" run cleanly to 66-1/4" wall.', note_es: 'Cierra tramo de 66" al muro de 66-1/4".' },
      { id: 'W-U0', wall: 'West', type: 'Wall Upper', order: 5, label_en: 'NO Wall Upper Cabinets on West Range Wall', label_es: 'SIN Gabinetes Altos en Muro Oeste', station_start_in: 0, width_in: 0, depth_in: 0, height_in: 0, measure_boundary: 'wall_to_wall', status: 'Locked', editable_width: false, note_en: 'Locked open for full-height statement tile up to 121-1/2" ceiling.', note_es: 'Bloqueado libre para azulejo hasta el techo de 121-1/2".' },
      { id: 'S-B1', wall: 'South', type: 'Base', order: 1, label_en: 'Shared SE L-Corner Base (Coupled w/ East)', label_es: 'Esquinero en L Sureste (Acoplado con Este)', station_start_in: 0, width_in: 36, depth_in: 24, height_in: 34.5, measure_boundary: 'wall_to_wall', status: 'Verify on Site', editable_width: true, coupled_id: 'E-B1', note_en: 'Shared 36"×36" SE corner base; edits update East wall return automatically.', note_es: 'Esquinero compartido 36"×36" SE; cambios actualizan el muro Este.' },
      { id: 'S-B2', wall: 'South', type: 'Base', order: 2, label_en: 'Trash Pull-Out Base Cabinet', label_es: 'Gabinete Extraíble de Basura', station_start_in: 36, width_in: 15, depth_in: 24, height_in: 34.5, measure_boundary: 'wall_to_wall', status: 'Verify on Site', editable_width: true, note_en: '36"–51" from SE zero corner beside dishwasher.', note_es: '36"–51" desde esquina SE junto a lavavajillas.' },
      { id: 'S-A1', wall: 'South', type: 'Appliance Bay', order: 3, label_en: '24" Dishwasher Bay (Panel-Ready)', label_es: 'Claro Lavavajillas 24" (Panelable)', station_start_in: 51, width_in: 24, depth_in: 24, height_in: 34.5, measure_boundary: 'clear_between_casings', status: 'Verify on Site', editable_width: true, note_en: '51"–75" from SE corner (supply & drain inside sink base).', note_es: '51"–75" desde esquina SE (agua y drenaje en tarja).' },
      { id: 'S-B3', wall: 'South', type: 'Base', order: 4, label_en: '30" Sink Base (Hold: 75–105 vs 72–102)', label_es: 'Gabinete Tarja 30" (75–105 vs 72–102)', station_start_in: 75, width_in: 30, depth_in: 24, height_in: 34.5, measure_boundary: 'wall_to_wall', status: 'Verify on Site', editable_width: true, note_en: 'Centered under South window (90" vs 89-3/4"). Hold plumbing move until tape clash reconciles Friday.', note_es: 'Centrado bajo ventana Sur. Detener plomería hasta conciliar cinta el viernes.' },
      { id: 'S-F1', wall: 'South', type: 'Filler', order: 5, label_en: 'South End Pull-Out / Filler (6" vs 12" Option)', label_es: 'Relleno / Extraíble Sur (Opción 6" vs 12")', station_start_in: 105, width_in: 6, depth_in: 24, height_in: 34.5, measure_boundary: 'to_casing_edge', status: 'Open Option', editable_width: true, note_en: 'Toggle 6" vs 12" to check rear door casing (114"/115") & narrowest clear walkway with overhang.', note_es: 'Alterna 6" vs 12" para verificar chambrana (114"/115") y paso libre mínimo con vuelo.' },
      { id: 'S-U1', wall: 'South', type: 'Wall Upper', order: 6, label_en: 'Existing Recessed Pie-Safe Shelving (TBD)', label_es: 'Alacena Empotrada Existente (Por Definir)', station_start_in: 26, width_in: null, depth_in: null, height_in: null, provisional_width_in: 33, provisional_height_in: 44, bottom_aff_in: 36, measure_boundary: 'rough_opening', status: 'Verify on Site', editable_width: true, note_en: 'Verify on Friday mockup / measure on site. Existing opening approx 26"–59" from SE, top approx 80".', note_es: 'Verificar en maqueta viernes / medir en obra. Abertura aprox 26"–59" desde SE, altura ~80".' },
      { id: 'S-U2', wall: 'South', type: 'Wall Upper', order: 7, label_en: 'Optional South Flanking Wall Upper (TBD)', label_es: 'Gabinete Alto Opcional Sur (Por Definir)', station_start_in: 0, width_in: null, depth_in: 12, height_in: null, provisional_width_in: 24, provisional_height_in: 40.4375, bottom_aff_in: 55.125, measure_boundary: 'to_casing_edge', status: 'Open Option', editable_width: true, note_en: 'Verify on Friday mockup / measure on site.', note_es: 'Verificar en maqueta viernes / medir en obra.' },
      { id: 'E-B1', wall: 'East', type: 'Base', order: 1, label_en: 'Shared SE L-Corner Return (Coupled w/ South)', label_es: 'Retorno Esquinero SE (Acoplado con Sur)', station_start_in: 0, width_in: 36, depth_in: 24, height_in: 34.5, measure_boundary: 'wall_to_wall', status: 'Verify on Site', editable_width: true, coupled_id: 'S-B1', note_en: '0"–36" North from SE. Overlaps D04 subpanel zone (no screws 53"–77").', note_es: '0"–36" al Norte desde SE. Cruza zona D04 (sin tornillos 53"–77").' },
      { id: 'E-B2', wall: 'East', type: 'Base', order: 2, label_en: 'East Drawer Base Cabinet (24")', label_es: 'Gabinete Bajo Cajones Este (24")', station_start_in: 36, width_in: 24, depth_in: 24, height_in: 34.5, measure_boundary: 'wall_to_wall', status: 'Verify on Site', editable_width: true, note_en: '36"–60" North from SE between corner box and fridge.', note_es: '36"–60" al Norte desde SE entre esquinero y refri.' },
      { id: 'E-A1', wall: 'East', type: 'Appliance Bay', order: 3, label_en: 'Haier Counter-Depth Fridge Bay (QJS15HYRFS)', label_es: 'Claro Refrigerador Haier (QJS15HYRFS)', station_start_in: 60, width_in: 28, depth_in: 28.5625, height_in: 69.875, measure_boundary: 'clear_between_casings', status: 'Locked', editable_width: true, note_en: '60"–88" North from SE. 27-9/16" W × 26-9/16" D + 2" rear gap. NOTHING above fridge.', note_es: '60"–88" al Norte desde SE. 27-9/16" × 26-9/16" + 2" atrás. NADA arriba.' },
      { id: 'E-U1', wall: 'East', type: 'Wall Upper', order: 4, label_en: 'Optional East SE Corner Upper (24")', label_es: 'Gabinete Alto Esquinero Opcional Este (24")', station_start_in: 0, width_in: 24, depth_in: 12, height_in: 40.4375, bottom_aff_in: 55.125, measure_boundary: 'wall_to_wall', status: 'Open Option', editable_width: true, note_en: 'Verify on Friday mockup / measure on site. Check D04 no-screw zone 53"–77".', note_es: 'Verificar en maqueta viernes / medir en obra. Revisar zona sin tornillos D04.' },
      { id: 'E-U2', wall: 'East', type: 'Wall Upper', order: 5, label_en: 'Optional East Adjacent Upper (36")', label_es: 'Gabinete Alto Opcional Este (36")', station_start_in: 24, width_in: 36, depth_in: 12, height_in: 40.4375, bottom_aff_in: 55.125, measure_boundary: 'wall_to_wall', status: 'Open Option', editable_width: true, note_en: 'Verify on Friday mockup / measure on site. Stops at 60" before fridge.', note_es: 'Verificar en maqueta viernes / medir en obra. Termina a 60" antes del refri.' },
      { id: 'E-U0', wall: 'East', type: 'Wall Upper', order: 6, label_en: 'NO Cabinet Above Refrigerator (Locked)', label_es: 'SIN Gabinete Sobre Refrigerador (Bloqueado)', station_start_in: 60, width_in: 0, depth_in: 0, height_in: 0, measure_boundary: 'clear_between_casings', status: 'Locked', editable_width: false, note_en: 'Owner locked: open space above freestanding Haier fridge.', note_es: 'Fijo: espacio abierto sobre refrigerador Haier.' },
      { id: 'N-B0', wall: 'North', type: 'Base', order: 1, label_en: 'Open North Wall — No Base Cabinets', label_es: 'Muro Norte Abierto — Sin Gabinetes Bajos', station_start_in: 0, width_in: 0, depth_in: 0, height_in: 0, measure_boundary: 'wall_to_wall', status: 'Locked', editable_width: false, note_en: '115-1/2" open wall meeting NE hallway cased opening (29-3/8" × 84").', note_es: 'Muro abierto 115-1/2" hacia acceso a pasillo NE (29-3/8" × 84").' },
      { id: 'N-U1', wall: 'North', type: 'Wall Upper', order: 2, label_en: 'Optional North Wall Shelving (Verify on Site)', label_es: 'Repisas Opcionales Muro Norte (Verificar)', station_start_in: 36, width_in: null, depth_in: null, height_in: null, provisional_width_in: 36, provisional_height_in: 24, bottom_aff_in: 56, measure_boundary: 'to_casing_edge', status: 'Open Option', editable_width: true, note_en: 'Verify on Friday mockup / measure on site.', note_es: 'Verificar en maqueta viernes / medir en obra.' }
    ],
    takeoff_settings: {
      waste_pct: 15,
      tile_box_sqft: null,
      include_south_backsplash: true,
      include_east_backsplash: true
    },
    flagged_clashes: [
      {
        id: 'clash-south-sink-station',
        severity: 'HIGH',
        title_en: 'South Sink Base 75"–105" vs. Taped 72"–102"',
        title_es: 'Tarja Sur 75"–105" vs. Cinta 72"–102"',
        en: 'Prior layout places 30" sink base at 75"–105" (CL 90" under window) vs. site photos showing 72"–102" (CL 87"). Hold sink plumbing move until common SE tape zero reconciles Friday.',
        es: 'El trazo previo ubica la tarja de 30" en 75"–105" (eje 90" bajo ventana) vs. fotos con cinta en 72"–102" (eje 87"). Detener plomería hasta conciliar origen SE el viernes.'
      },
      {
        id: 'clash-south-casing-114-115',
        severity: 'HIGH',
        title_en: 'Rear Door Casing Span 114" vs. 115" & 6" vs. 12" Option',
        title_es: 'Claro a Chambrana 114" vs. 115" y Opción 6" vs. 12"',
        en: 'Usable South span to rear door casing reads 114" in field photos vs. 115" in scan. Adding a 12" box + 1" overhang collides with casing unless sink shifts or 6" filler/pullout stays.',
        es: 'El claro útil Sur hasta la chambrana marca 114" en fotos vs. 115" en escaneo. Un gabinete de 12" + 1" de vuelo choca con la chambrana si no se mantiene 6".'
      },
      {
        id: 'clash-east-d04-subpanel',
        severity: 'HIGH',
        title_en: 'East Wall D04 Subpanel Infill Hold (No Screws 53"–77")',
        title_es: 'Espera Subpanel D04 Muro Este (Sin Tornillos 53"–77")',
        en: 'Dining-side subpanel D04 sits behind East SE corner (est. 6"–38" from SE). Side-entry framing hold active — never route behind panel or drive cabinet screws in 53"–77" zone.',
        es: 'El subpanel D04 está detrás del muro Este cerca de esquina SE (aprox. 6"–38"). Espera activa de entrada lateral — sin tornillos en 53"–77".'
      },
      {
        id: 'clash-west-alcove-and-chase',
        severity: 'MEDIUM',
        title_en: 'West Wall: Dedicated Hood Duct Chase (>= 6") & 1-Gang Direct Hardwire',
        title_es: 'Muro Oeste: Ducto Exclusivo Campana (>= 6") y Caja Sencilla 2"×3"',
        en: 'Existing left-chase duct IS dedicated to kitchen hood exhaust (nothing else connected; verify >= 6"). NEXT HVAC Mon is furnace/heating ONLY — do NOT route hood exhaust to NEXT HVAC. Zephyr ZSA-E30AS Manual p. 3 is direct hardwire via 1-gang 2"×3" box (~83"–86" above finished floor, C/L ± 2-1/4", ~1" proud for 1/2" HardieBacker + tile inside 8-5/8"×7-1/2" casing; replaces 4×4 box at 100").',
        es: 'El ducto izq. ES exclusivo de la campana (nada más conectado; verificar >= 6"). NEXT HVAC el lunes es SOLO calefacción — NO conectar campana ahí. Zephyr ZSA-E30AS Manual p. 3 es cableado directo en caja sencilla 2"×3" (~83"–86" piso term., eje ± 2-1/4", ~1" salida p/ HardieBacker 1/2" + azulejo en cubreducto 8-5/8"×7-1/2"; reemplaza caja 4×4 a 100").'
      }
    ],
    field_overrides: [],
    pins: []
  };

  const I18N = {
    en: {
      doc_title: 'Kitchen Floor Plan & Cabinet Schedule — Unit 4 Interactive Plan',
      hdr_title: 'Kitchen Floor Plan & Cabinet Schedule',
      hdr_sub: '147" × 126-1/4" True-to-Scale Coupled Room Model (X = Y) · All 4 Walls Synced · Zero Prices',
      back_room: '← Back to Kitchen Page',
      jump_west_hood: 'West Range & Hood Wall →',
      btn_lang: 'Español (MX)',
      btn_circle_on: 'Circle-to-Correct',
      btn_circle_off: 'Drawing Active…',
      btn_export_svg: 'Export SVG',
      btn_download_pdf: 'Download / Print PDF',
      hold_html: '<strong>LAYOUT STAGING HOLD — VERIFY ON FRIDAY MOCKUP PHOTOS:</strong> Reconcile South sink station (<strong>75"–105"</strong> vs. taped <strong>72"–102"</strong>), rear door casing span (<strong>114"</strong> vs. <strong>115"</strong>), <strong>6" vs. 12"</strong> passage width, and East <strong>D04</strong> subpanel side-entry hold before relocating sink plumbing, ordering cabinets/stone, or closing drywall.',
      conflict_text: 'A newer revision was saved on Tailnet by another editor (HTTP 409). Reload the latest plan and re-apply your change.',
      btn_reload: 'Reload Latest Plan',
      view_titles: {
        floor: 'True-to-Scale Kitchen Floor Plan (147" × 126-1/4")',
        west: 'Coupled West Wall Elevation — Range & Vent Hood Run (66-1/4")',
        south: 'Coupled South Wall Elevation — Sink, Window & Pie-Safe (147")',
        east: 'Coupled East Wall Elevation — Haier Fridge & SE Return (126-1/4")',
        north: 'Coupled North Wall Elevation — Open Wall & Hallway Edge (115-1/2")'
      },
      tabs: { floor: 'Floor Plan (147"×126-1/4")', west: 'West Wall (Range)', south: 'South Wall (Sink)', east: 'East Wall (Fridge)', north: 'North Wall (Open)' },
      tgl_base: 'Base Cabinets & Appliances',
      tgl_uppers: 'Wall Upper Cabinets',
      tgl_swings: 'Swings & Clear Walkways',
      tgl_utilities: 'Rough-In Utilities (HOLD)',
      lbl_south_opt: 'South End Box:',
      btn_opt_6: '6" Filler / Pull-Out',
      btn_opt_12: '12" Cabinet Option',
      lbl_sink_basis: 'Sink Station:',
      btn_sink_75: '75"–105" (CL 90" Window)',
      btn_sink_72: '72"–102" (Site Tape CL 87")',
      btn_reset: 'Reset Baseline',
      circle_bar_hint: 'Draw a circle around any spot on the drawing (touch or mouse) to attach a callout note.',
      btn_clear_sketch: 'Clear Sketch',
      btn_circle_done: 'Exit Circle Mode',
      photo_panel_title: 'South Sink & Pie-Safe Wall (Real Photo)',
      photo_badge: 'VERIFY FRIDAY',
      photo_left: '← SE CORNER (0" ref)',
      photo_mid: 'SOUTH SINK WALL',
      photo_right: 'REAR DOOR (SW) →',
      photo_callouts: [
        '<li class="callout-alert"><strong>Existing Recessed Pie-Safe (~26"–59" from SE):</strong> Blue tape marks 36" counter line. Final width &amp; depth are <strong>Verify on Friday mockup / measure on site</strong>.</li>',
        '<li><strong>South Window &amp; Sink Stubs:</strong> Reconcile 75"–105" (CL 90") vs. taped 72"–102" (CL 87") before moving drain/water lines.</li>',
        '<li><strong>Rear Door Casing (Right):</strong> Verify 114" vs. 115" usable span and test 6" vs. 12" box with 1" countertop overhang.</li>'
      ],
      concept_disclaimer_html: '<strong>Site Photo vs. Concept:</strong> Above photo is the real South kitchen wall. Any separate 3D L-layout concept renders in Drive are <em>Concept reference only — not to scale</em>; always mark out from this true-scale floor plan.',
      schedule_title: 'Wall-by-Wall Kitchen Cabinet Schedule (Base vs. Wall Upper · Live Closure)',
      th_wall: 'Wall / ID',
      th_label: 'Cabinet / Appliance Label',
      th_type: 'Type',
      th_station: 'L→R Station (From Corner)',
      th_size: 'W × D × H (in · Live Edit W)',
      th_boundary: 'Boundary',
      th_status: 'Status',
      clashes_title: 'Flagged Clashes & Field Checks (Never Auto-Resolved)',
      clashes_lock_pill: 'Immutable · Verify in Field',
      takeoff_title: 'Live Cross-Wall Tile, Backer & Countertop Takeoff (Quantities Only · Zero Prices)',
      takeoff_notice: 'Gross Proposed Quantities Only (Zero Prices · Zero Order Numbers) — Verify On-Hand Stock Before Ordering.',
      lbl_waste_pct: 'Waste / Overage (%):',
      btn_waste_10: '+10% Straight',
      btn_waste_15: '+15% Brick/Pattern',
      lbl_box_sqft: 'Tile Box Coverage (sq ft/box):',
      lbl_south_tile: 'Include South Sink Backsplash',
      lbl_east_tile: 'Include East Return Backsplash',
      trim_title: 'Existing Original Trim Baseline & Live Room Controls',
      trim_badge: 'Edwardian Original',
      lbl_author: 'Editor Name',
      lbl_floor_t: 'Floor Build-Up (t) (in)',
      lbl_trim_base: 'Original Baseboard Height (in)',
      lbl_trim_rail: 'Original High Picture Rail Height (in)',
      lbl_trim_door: 'Original Door Casing Width (in)',
      lbl_trim_win: 'Original Window Casing Width (in)',
      btn_save_tailnet: 'Save Live to Tailnet',
      btn_export_json: 'Download Schedule JSON',
      save_hint_off: 'Off-tailnet Read-Only / Local Export mode: live edits update preview & local exports only. Connect to Tisa\'s Tailscale network to save live overrides.',
      save_hint_on: 'Connected to Tailnet persistence (:8444). Saves apply immediately with revision stamp + EOD review log.',
      voice_title: 'Attached Comment Callouts & Voice Note',
      lbl_intent: 'Comment Action',
      intent_edit: 'Modify Plan / Field Measurement',
      intent_problem: 'Flag Problem / Clash',
      intent_question: 'Answer a Question ("What is this right here?")',
      lbl_note: 'Field Note or Spoken Command',
      note_placeholder: 'Example: "Try 12 inch South box", "Switch to 6 inch filler", or "Does the fridge have an upper cabinet?" (Zero prices)',
      btn_dictate: 'Dictate Voice Note',
      btn_dictate_stop: 'Listening… Tap to Stop',
      btn_apply_note: 'Attach Comment Pin',
      btn_pin_mic: 'Dictate',
      btn_pin_send: 'Send to Agent',
      pin_mode_modify: 'Modify Plan',
      pin_mode_question: 'Answer a Question',
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
      measure_on_site: 'MEASURE ON SITE',
      verify_friday: 'Verify on Friday mockup / measure on site',
      provisional_outline: 'Measure on site — proportion provisional',
      not_yet_synced: 'Not Yet Synced (Local Preview)',
      pending_eod_stamp: 'Field Update · Pending EOD Review',
      synced_stamp: 'Synced to Schedule Seed',
      firewall_err: 'Blocked by Private-Data Firewall: never enter currency symbols, prices, bids, estimates, financing, or mail links in crew plans.'
    },
    es: {
      doc_title: 'Planta de Cocina y Lista de Gabinetes — Plano Interactivo Unidad 4',
      hdr_title: 'Planta de Cocina y Lista de Gabinetes',
      hdr_sub: 'Modelo Acoplado 147" × 126-1/4" a Escala Real (X = Y) · 4 Muros Sincronizados · Sin Precios',
      back_room: '← Volver a Página Cocina',
      jump_west_hood: 'Muro Oeste Estufa y Campana →',
      btn_lang: 'English (EN)',
      btn_circle_on: 'Circular para Corregir',
      btn_circle_off: 'Dibujo Activo…',
      btn_export_svg: 'Exportar SVG',
      btn_download_pdf: 'Descargar / Imprimir PDF',
      hold_html: '<strong>ESPERA DE TRAZO — VERIFICAR CON FOTOS DEL VIERNES:</strong> Conciliar posición de tarja Sur (<strong>75"–105"</strong> vs. cinta <strong>72"–102"</strong>), claro a chambrana trasera (<strong>114"</strong> vs. <strong>115"</strong>), paso libre <strong>6" vs. 12"</strong> y subpanel Este <strong>D04</strong> antes de mover plomería, pedir gabinetes/piedra o cerrar tablaroca.',
      conflict_text: 'Otro editor guardó una revisión más reciente en Tailnet (HTTP 409). Recarga el plano más reciente y vuelve a aplicar tu cambio.',
      btn_reload: 'Recargar Plano Actual',
      view_titles: {
        floor: 'Planta de Cocina a Escala Real (147" × 126-1/4")',
        west: 'Alzado Acoplado Muro Oeste — Estufa y Campana (66-1/4")',
        south: 'Alzado Acoplado Muro Sur — Tarja, Ventana y Alacena (147")',
        east: 'Alzado Acoplado Muro Este — Refrigerador Haier y Retorno SE (126-1/4")',
        north: 'Alzado Acoplado Muro Norte — Muro Abierto y Acceso Pasillo (115-1/2")'
      },
      tabs: { floor: 'Planta (147"×126-1/4")', west: 'Muro Oeste (Estufa)', south: 'Muro Sur (Tarja)', east: 'Muro Este (Refri)', north: 'Muro Norte (Abierto)' },
      tgl_base: 'Gabinetes Bajos y Equipos',
      tgl_uppers: 'Gabinetes Altos de Muro',
      tgl_swings: 'Giros y Pasos Libres',
      tgl_utilities: 'Instalaciones (EN ESPERA)',
      lbl_south_opt: 'Remate Sur:',
      btn_opt_6: 'Relleno / Extraíble 6"',
      btn_opt_12: 'Opción Gabinete 12"',
      lbl_sink_basis: 'Posición Tarja:',
      btn_sink_75: '75"–105" (Eje 90" Ventana)',
      btn_sink_72: '72"–102" (Cinta Obra Eje 87")',
      btn_reset: 'Restaurar Base',
      circle_bar_hint: 'Dibuja un círculo sobre cualquier punto del plano (dedo o ratón) para adjuntar un comentario.',
      btn_clear_sketch: 'Borrar Trazo',
      btn_circle_done: 'Salir de Círculo',
      photo_panel_title: 'Muro Sur de Tarja y Alacena (Foto Real)',
      photo_badge: 'VERIFICAR VIERNES',
      photo_left: '← ESQUINA SE (0" ref)',
      photo_mid: 'MURO SUR DE TARJA',
      photo_right: 'PUERTA TRASERA (SO) →',
      photo_callouts: [
        '<li class="callout-alert"><strong>Alacena Empotrada Existente (~26"–59" de SE):</strong> La cinta azul marca cubierta a 36". Ancho y fondo: <strong>Verificar en maqueta viernes / medir en obra</strong>.</li>',
        '<li><strong>Ventana Sur y Salidas de Tarja:</strong> Conciliar 75"–105" (eje 90") vs. cinta 72"–102" (eje 87") antes de mover plomería.</li>',
        '<li><strong>Chambrana Puerta Trasera (Der.):</strong> Confirmar 114" vs. 115" y probar 6" vs. 12" con vuelo de cubierta de 1".</li>'
      ],
      concept_disclaimer_html: '<strong>Foto de Obra vs. Concepto:</strong> La foto superior es el muro Sur real. Cualquier render 3D en Drive es <em>Referencia de concepto — no a escala</em>; marca siempre con esta planta a escala real.',
      schedule_title: 'Lista de Gabinetes por Muro (Bajos vs. Altos · Cierre de Medidas en Vivo)',
      th_wall: 'Muro / ID',
      th_label: 'Gabinete / Equipo',
      th_type: 'Tipo',
      th_station: 'Estación Izq→Der (Desde Esquina)',
      th_size: 'Ancho × Prof × Alto (pulg · Editar)',
      th_boundary: 'Límite',
      th_status: 'Estado',
      clashes_title: 'Choques Marcados y Revisiones de Obra (Nunca Auto-Resueltos)',
      clashes_lock_pill: 'Inmutable · Verificar en Obra',
      takeoff_title: 'Cuantificación Cruzada de Azulejo, Respaldo y Cubierta (Solo Cantidades · Sin Precios)',
      takeoff_notice: 'Solo Cantidades Brutas Propuestas (Sin Precios · Sin Núm. de Pedido) — Verificar Inventario en Obra Antes de Pedir.',
      lbl_waste_pct: 'Desperdicio / Margen (%):',
      btn_waste_10: '+10% Recto',
      btn_waste_15: '+15% Ladrillo/Patrón',
      lbl_box_sqft: 'Rendimiento por Caja (pies²/caja):',
      lbl_south_tile: 'Incluir Salpicadero Muro Sur',
      lbl_east_tile: 'Incluir Salpicadero Retorno Este',
      trim_title: 'Molduras Originales Existentes y Controles del Cuarto',
      trim_badge: 'Original Edwardian',
      lbl_author: 'Nombre del Editor',
      lbl_floor_t: 'Espesor de Piso (t) (pulg)',
      lbl_trim_base: 'Altura de Zoclo Original (pulg)',
      lbl_trim_rail: 'Altura de Moldura Alta Original (pulg)',
      lbl_trim_door: 'Ancho Chambrana Puerta Original (pulg)',
      lbl_trim_win: 'Ancho Chambrana Ventana Original (pulg)',
      btn_save_tailnet: 'Guardar en Tailnet',
      btn_export_json: 'Descargar JSON Lista',
      save_hint_off: 'Modo Solo Lectura / Exportación Local fuera de Tailnet: los cambios solo se previsualizan y exportan en este dispositivo. Conéctate a Tailscale de Tisa para guardar en vivo.',
      save_hint_on: 'Conectado a persistencia Tailnet (:8444). Los cambios se aplican al instante con sello de revisión y registro EOD.',
      voice_title: 'Comentarios Adjuntos y Nota de Voz',
      lbl_intent: 'Acción del Comentario',
      intent_edit: 'Modificar Plano / Medida en Obra',
      intent_problem: 'Reportar Problema / Choque',
      intent_question: 'Responder una Pregunta ("¿Qué es esto aquí?")',
      lbl_note: 'Nota de Obra o Comando Dictado',
      note_placeholder: 'Ejemplo: "Probar caja Sur de 12 pulgadas", "Cambiar a relleno 6", o "¿Lleva gabinete arriba del refri?" (Sin precios)',
      btn_dictate: 'Dictar Nota de Voz',
      btn_dictate_stop: 'Escuchando… Toca para Parar',
      btn_apply_note: 'Adjuntar Pin de Comentario',
      btn_pin_mic: 'Dictar',
      btn_pin_send: 'Enviar al Agente',
      pin_mode_modify: 'Modificar Plano',
      pin_mode_question: 'Responder Pregunta',
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
      measure_on_site: 'MEDIR EN OBRA',
      verify_friday: 'Verificar en maqueta viernes / medir en obra',
      provisional_outline: 'Medir en obra — proporción provisional',
      not_yet_synced: 'Sin Sincronizar (Vista Local)',
      pending_eod_stamp: 'Cambio de Obra · Revisión EOD Pendiente',
      synced_stamp: 'Sincronizado con Semilla',
      firewall_err: 'Bloqueado por Filtro de Privacidad: nunca incluyas signos de moneda, precios, cotizaciones, presupuestos, financiamiento ni enlaces de correo.'
    }
  };

  /* ── Runtime State (Strictly in-memory, ZERO browser web storage) ── */
  const params = new URLSearchParams(window.location.search);
  let currentLang = (params.get('lang') || '').toLowerCase() === 'es' ? 'es' : 'en';
  const rawView = (params.get('view') || '').toLowerCase();
  let activeView = ['floor', 'west', 'south', 'east', 'north'].includes(rawView) ? rawView : 'floor';
  let wallFilter = 'ALL';
  let typeFilter = 'ALL';
  let selectedCabId = null;
  let state = deepClone(BASELINE_KITCHEN_FP);
  let apiOrigin = resolveApiOrigin(params.get('api'), DEFAULT_API_ORIGIN);
  let voiceOrigin = resolveApiOrigin(params.get('voice_api'), DEFAULT_VOICE_ORIGIN);
  let lastScaleInfo = { view: 'floor', scaleX: 1, scaleY: 1, uniform: true };
  let tailnetState = { checked: false, online: false, verified: false, user: null, pendingEod: [] };
  let hasUnsyncedLocalEdits = false;
  let lastSavedRevId = null;
  let circleMode = false;
  let isDrawing = false;
  let drawPoints = [];
  let pendingCircleNorm = null;
  let speechRecognition = null;
  let speechListening = false;
  let speechTargetPinIdx = null;
  let toastTimer = null;

  const layers = {
    base: true,
    uppers: true,
    swings: true,
    utilities: true
  };

  /* ── Helpers ──────────────────────────────────────────────────────── */
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function ensureStateDefaults(target) {
    if (!target.room_geometry) target.room_geometry = deepClone(BASELINE_KITCHEN_FP.room_geometry);
    if (!target.options) target.options = deepClone(BASELINE_KITCHEN_FP.options);
    if (!target.existing_original_trim) target.existing_original_trim = deepClone(BASELINE_KITCHEN_FP.existing_original_trim);
    if (!target.walls) target.walls = deepClone(BASELINE_KITCHEN_FP.walls);
    if (!Array.isArray(target.cabinets) || !target.cabinets.length) target.cabinets = deepClone(BASELINE_KITCHEN_FP.cabinets);
    if (!target.takeoff_settings) target.takeoff_settings = deepClone(BASELINE_KITCHEN_FP.takeoff_settings);
    target.flagged_clashes = deepClone(BASELINE_KITCHEN_FP.flagged_clashes);
    if (!Array.isArray(target.pins)) target.pins = [];
    return target;
  }

  function resolveApiOrigin(raw, fallback) {
    const def = fallback || DEFAULT_API_ORIGIN;
    if (!raw) return def;
    try {
      const parsed = new URL(raw);
      if (parsed.protocol === 'https:' || parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') return parsed.origin;
    } catch (_) { /* ignore */ }
    return def;
  }

  function esc(str) {
    return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function gcd(a, b) {
    let x = Math.abs(a), y = Math.abs(b);
    while (y) { const t = y; y = x % y; x = t; }
    return x || 1;
  }

  function toFrac16(val) {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return I18N[currentLang].measure_on_site;
    const num = Number(val);
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);
    let whole = Math.floor(abs);
    let sixteenths = Math.round((abs - whole) * 16);
    if (sixteenths === 16) { whole += 1; sixteenths = 0; }
    if (sixteenths === 0) return `${sign}${whole}"`;
    const g = gcd(sixteenths, 16);
    return whole === 0 ? `${sign}${sixteenths / g}/${16 / g}"` : `${sign}${whole}-${sixteenths / g}/${16 / g}"`;
  }

  function violatesPrivateFirewall(text) {
    if (!text) return false;
    const s = String(text);
    const blockedMail = ['mail', 'google', 'com'].join('\\.');
    const blockedFinance = [['go', 'green'].join(''), ['cal', 'coast'].join('')].join('|');
    const patterns = [
      new RegExp('\\x24\\s*\\d', 'i'),
      new RegExp('\\x24\\s*[a-z]', 'i'),
      /\b(usd|dollars|dolares|dólares|pesos|mxn|price|pricing|precio|precios|costo|costos|estimate\s*#|order\s*#|cotizaci[oó]n|presupuesto|invoice|factura|payroll|n[oó]mina|financing|financiamiento|bid\s+amount)\b/i,
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

  /* ── Coupled Multi-Wall Station Chain & Live Closure Math ─────────── */
  function recomputeWallStations() {
    ensureStateDefaults(state);
    const walls = ['West', 'South', 'East', 'North'];
    const baseTypes = new Set(['Base', 'Appliance Bay', 'Filler', 'Tall']);
    const shiftSouth = state.options.south_sink_basis === 'john_72_102' ? -3.0 : 0.0;

    walls.forEach((wallName) => {
      const list = state.cabinets.filter((c) => c.wall === wallName && baseTypes.has(c.type)).sort((a, b) => a.order - b.order);
      let cursor = 0.0;
      list.forEach((c) => {
        if (wallName === 'South' && c.id === 'S-B3' && shiftSouth !== 0) {
          /* John's taped 72"-102" comparison shifts sink base 3" East (compressing corner/DW bay check) */
          c.station_start_in = Math.max(0, cursor + shiftSouth);
          cursor = c.station_start_in + (Number(c.width_in) || 0);
        } else {
          c.station_start_in = Number(cursor.toFixed(4));
          cursor += Number(c.width_in) || 0;
        }
      });
    });
  }

  function computeClosureSummary() {
    recomputeWallStations();
    const g = state.room_geometry;
    const baseTypes = new Set(['Base', 'Appliance Bay', 'Filler', 'Tall']);

    const sumWall = (wallName) => {
      const rows = state.cabinets.filter((c) => c.wall === wallName && baseTypes.has(c.type) && (Number(c.width_in) || 0) > 0);
      const total = rows.reduce((acc, c) => acc + (Number(c.width_in) || 0), 0);
      const maxEnd = rows.reduce((mx, c) => Math.max(mx, (c.station_start_in || 0) + (Number(c.width_in) || 0)), 0);
      const upperRows = state.cabinets.filter((c) => c.wall === wallName && c.type === 'Wall Upper' && (c.width_in === null || c.width_in > 0));
      return { total: Number(total.toFixed(3)), maxEnd: Number(maxEnd.toFixed(3)), baseCount: rows.length, upperCount: upperRows.length };
    };

    const W = sumWall('West');
    const S = sumWall('South');
    const E = sumWall('East');
    const N = sumWall('North');

    const westSpan = state.walls.West.span_in; // 66.25
    const southSpanScan = state.walls.South.usable_span_in; // 115.0
    const southSpanTape = state.walls.South.tape_span_in;   // 114.0
    const eastRunTarget = state.walls.East.usable_span_in;  // 88.0

    /* Live South end + 1" side countertop overhang vs 114" tape / 115" scan casing AND West recess walk */
    const sideOverhang = g.counter_overhang_side_in || 1.0;
    const frontOverhang = g.counter_overhang_front_in || 1.5;
    const southWithOverhang = Number((S.maxEnd + sideOverhang).toFixed(3));
    const marginToScanCasing = Number((southSpanScan - southWithOverhang).toFixed(3));
    const marginToTapeCasing = Number((southSpanTape - southWithOverhang).toFixed(3));
    const casingClash = marginToTapeCasing < 0 || marginToScanCasing < 0;

    /* Walkways (all include countertop overhangs!):
       1) South counter end to West recess wall (147" - southWithOverhang)
       2) West range step corner (y = 66.25") to South countertop front (126.25" - 24" - 1.5" = 100.75")
       3) West range nose (31.5 + 28.0625) to East Haier fridge front (147 - 28.5625) */
    const walkSouthEndToWestWall = Number((g.south_width_in - southWithOverhang).toFixed(2));
    const walkStepToSouthCounter = Number(((g.east_depth_in - g.base_depth_in - frontOverhang) - g.west_range_wall_in).toFixed(2));
    const walkRangeToFridge = Number(((g.south_width_in - 28.5625) - (g.west_recess_depth_in + 28.0625)).toFixed(2));
    const narrowestWalkway = Math.min(walkSouthEndToWestWall, walkStepToSouthCounter, walkRangeToFridge);

    const counts = {
      Base: state.cabinets.filter((c) => c.type === 'Base' && (c.width_in === null || c.width_in > 0)).length,
      'Wall Upper': state.cabinets.filter((c) => c.type === 'Wall Upper' && (c.width_in === null || c.width_in > 0)).length,
      'Appliance Bay': state.cabinets.filter((c) => c.type === 'Appliance Bay').length,
      Filler: state.cabinets.filter((c) => c.type === 'Filler' && (c.width_in === null || c.width_in > 0)).length
    };

    return {
      West: { sum: W.total, span: westSpan, diff: Number((westSpan - W.total).toFixed(3)), ok: Math.abs(westSpan - W.total) <= 0.5 && W.total <= westSpan + 0.01 },
      South: { sum: S.maxEnd, withOverhang: southWithOverhang, spanScan: southSpanScan, spanTape: southSpanTape, marginScan: marginToScanCasing, marginTape: marginToTapeCasing, casingClash },
      East: { sum: E.total, span: eastRunTarget, wallTotal: g.east_depth_in, diff: Number((eastRunTarget - E.total).toFixed(3)), ok: E.total <= eastRunTarget + 0.5 },
      North: { sum: N.total, span: g.north_width_in, ok: true },
      walkways: {
        southEndToWestWall: walkSouthEndToWestWall,
        stepToSouthCounter: walkStepToSouthCounter,
        rangeToFridge: walkRangeToFridge,
        narrowest: narrowestWalkway
      },
      counts
    };
  }

  /* ── Cross-Wall Wrap-Around Tile, Backer & Countertop Takeoff (ZERO prices) ── */
  function computeTakeoff() {
    const cl = computeClosureSummary();
    const g = state.room_geometry;
    const cfg = state.takeoff_settings;
    const wastePct = Math.max(0, Math.min(35, Number(cfg.waste_pct != null ? cfg.waste_pct : 15)));
    const boxSqFt = cfg.tile_box_sqft !== null && cfg.tile_box_sqft !== '' && Number(cfg.tile_box_sqft) > 0 ? Number(cfg.tile_box_sqft) : null;

    /* 1. West Statement Wall Tile (Countertop 36" to Ceiling 121-1/2") */
    const westTileH = Math.max(0, g.ceiling_height_in - g.counter_height_in);
    const westTileSqFt = (g.west_range_wall_in * westTileH) / 144.0;

    /* 2. South Sink Wall Backsplash (coupled to live South run minus window opening above sill 45-15/16") */
    const southRunIn = cl.South.sum;
    const southSplashH = 19.125; // counter 36" to upper bottom 55-1/8"
    const winCutoutSqFt = (g.south_window.width_in * Math.max(0, southSplashH - (g.south_window.sill_aff_in - g.counter_height_in))) / 144.0;
    const southTileSqFt = cfg.include_south_backsplash ? Math.max(0, (southRunIn * southSplashH) / 144.0 - winCutoutSqFt) : 0;

    /* 3. East Counter Return Backsplash (SE corner + East drawer base up to fridge edge = E-B1 + E-B2) */
    const eastCounterIn = state.cabinets.filter((c) => c.wall === 'East' && c.type === 'Base').reduce((a, c) => a + (Number(c.width_in) || 0), 0);
    const eastTileSqFt = cfg.include_east_backsplash ? (eastCounterIn * southSplashH) / 144.0 : 0;

    const netTileSqFt = westTileSqFt + southTileSqFt + eastTileSqFt;
    const grossTileSqFt = netTileSqFt * (1 + wastePct / 100.0);
    const boxes = boxSqFt ? Math.ceil(grossTileSqFt / boxSqFt) : null;

    /* 0.42" HardieBacker 500 (3' x 5' = 15 sq ft) for combined tiled zones + 10% cut waste */
    const backerSheets = Math.max(1, Math.ceil((netTileSqFt * 1.10) / 15.0));

    /* Live Countertop sq ft across West (left + right bases) + South + East return (excluding overlapping SE corner double-count!) */
    const dCounter = g.base_depth_in + g.counter_overhang_front_in; // 25.5"
    const westCtrIn = state.cabinets.filter((c) => c.wall === 'West' && (c.type === 'Base' || c.type === 'Filler')).reduce((a, c) => a + (Number(c.width_in) || 0), 0);
    const southCtrIn = cl.South.withOverhang;
    const eastExtraIn = Math.max(0, eastCounterIn - dCounter); // subtract shared SE corner
    const counterNetSqFt = ((westCtrIn * dCounter) + (southCtrIn * dCounter) + (eastExtraIn * dCounter)) / 144.0;

    return {
      waste_pct: wastePct,
      tile_box_sqft: boxSqFt,
      west_tile_sqft: Number(westTileSqFt.toFixed(2)),
      south_tile_sqft: Number(southTileSqFt.toFixed(2)),
      east_tile_sqft: Number(eastTileSqFt.toFixed(2)),
      tile_net_sqft: Number(netTileSqFt.toFixed(2)),
      tile_gross_sqft: Number(grossTileSqFt.toFixed(2)),
      tile_boxes_proposed: boxes,
      backer_sheets_3x5: backerSheets,
      countertop_net_sqft: Number(counterNetSqFt.toFixed(1)),
      cabinet_counts: cl.counts
    };
  }

  function computeRevisionStamp() {
    const tr = I18N[currentLang];
    const rev = lastSavedRevId || state.base_rev || 'rev-20261120-kitchen-fp-001';
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
      const py = (pin.cy || 0.40) * 1120;
      const rx = Math.max(14, (pin.rx || 0.03) * 920);
      const ry = Math.max(14, (pin.ry || 0.025) * 1120);
      const isQuestion = pin.mode === 'ask_question' || pin.intent === 'ask_question';
      const pinColor = pin.intent === 'flag_problem' ? '#b91c1c' : isQuestion ? '#15539e' : '#b45309';
      const badgeX = px + rx * 0.72;
      const badgeY = py - ry * 0.72;
      const cardX = 532;
      const cardY = Math.min(820, 744 + idx * 36);
      const snippet = String(pin.note || (currentLang === 'es' ? 'Comentario adjunto' : 'Attached comment')).slice(0, 44);
      const statusTxt = pin.agent_status === 'answered'
        ? (currentLang === 'es' ? 'Respondido' : 'Answered')
        : pin.agent_status === 'sent_applied'
          ? (currentLang === 'es' ? 'Enviado' : 'Sent')
          : 'Local';
      return `
        <g class="kfp-pin" data-pin-idx="${idx}" data-elem="attached-pin-${idx}">
          <ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"
                   fill="${pinColor}" fill-opacity="0.10" stroke="${pinColor}" stroke-width="2.4" stroke-dasharray="5,3"/>
          <polyline class="pin-leader" points="${badgeX.toFixed(1)},${badgeY.toFixed(1)} ${(cardX - 18).toFixed(1)},${(cardY + 13).toFixed(1)} ${cardX.toFixed(1)},${(cardY + 13).toFixed(1)}"
                    fill="none" stroke="${pinColor}" stroke-width="1.5" stroke-dasharray="4,2"/>
          <circle cx="${cardX.toFixed(1)}" cy="${(cardY + 13).toFixed(1)}" r="3.2" fill="${pinColor}"/>
          <circle cx="${badgeX.toFixed(1)}" cy="${badgeY.toFixed(1)}" r="10" fill="${pinColor}"/>
          <text x="${badgeX.toFixed(1)}" y="${(badgeY + 3.5).toFixed(1)}" font-size="9" text-anchor="middle" font-weight="700" fill="#ffffff">${idx + 1}</text>
          <rect x="${cardX.toFixed(1)}" y="${cardY.toFixed(1)}" width="356" height="27" rx="3" fill="#ffffff" fill-opacity="0.97" stroke="${pinColor}" stroke-width="1.2"/>
          <text x="${(cardX + 8).toFixed(1)}" y="${(cardY + 11.5).toFixed(1)}" font-size="7.4" font-weight="700" fill="${pinColor}">#${idx + 1} · ${esc(pin.author || 'Field')} [${esc(statusTxt)}]</text>
          <text x="${(cardX + 8).toFixed(1)}" y="${(cardY + 22.5).toFixed(1)}" font-size="7.2" fill="#10202b">${esc(snippet)}</text>
        </g>`;
    }).join('');
  }

  function buildTitleBlockSvg(cl, tk, isEs, stamp) {
    const viewLabel = isEs
      ? { floor: 'Planta Acoplada (147" × 126-1/4")', west: 'Alzado Muro Oeste (Estufa)', south: 'Alzado Muro Sur (Tarja)', east: 'Alzado Muro Este (Refri)', north: 'Alzado Muro Norte (Abierto)' }[activeView]
      : { floor: 'Coupled Floor Plan (147" × 126-1/4")', west: 'West Wall Elevation (Range)', south: 'South Wall Elevation (Sink)', east: 'East Wall Elevation (Fridge)', north: 'North Wall Elevation (Open)' }[activeView];
    return `
      <rect x="16" y="962" width="888" height="138" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <line x1="316" y1="962" x2="316" y2="1100" stroke="#10202b" stroke-width="1.1"/>
      <line x1="654" y1="962" x2="654" y2="1100" stroke="#10202b" stroke-width="1.1"/>
      <text x="28" y="988" font-size="11.2" font-weight="700" fill="#10202b">1231 11th Ave · Unit 4 · ${isEs ? 'Cocina' : 'Kitchen'}</text>
      <text x="28" y="1008" font-size="9.0" fill="#334155">San Francisco, CA 94122 · ${isEs ? 'Sin Precios' : 'Zero Prices'}</text>
      <text x="28" y="1032" font-size="7.8" fill="#4b5c69">${isEs ? 'Datos' : 'Seed'}: kitchen-cabinet-schedule.json</text>
      <text x="28" y="1050" font-size="7.8" fill="#4b5c69">${isEs ? 'Azulejo Cruzado' : 'Wrap-Around Tile'}: ${tk.tile_net_sqft} → ${tk.tile_gross_sqft} sq ft (+${tk.waste_pct}%)</text>
      <text x="28" y="1084" font-size="7.4" fill="#4b5c69">${isEs ? 'Cubierta Est.' : 'Countertop Est.'}: ${tk.countertop_net_sqft} sq ft · Hardie 0.42": ${tk.backer_sheets_3x5} ${isEs ? 'hojas' : 'sheets'}</text>

      <text x="330" y="990" font-size="11.5" font-weight="700" fill="#15539e">${esc(viewLabel)}</text>
      <text x="330" y="1010" font-size="8.4" fill="#10202b">${isEs ? 'Paso Libre Mínimo' : 'Narrowest Walkway'}: ${esc(toFrac16(cl.walkways.narrowest))} · ${isEs ? 'Tramo Sur' : 'South End'}: ${esc(toFrac16(cl.South.withOverhang))} (${isEs ? 'c/ vuelo' : 'w/ overhang'})</text>
      <text x="330" y="1034" font-size="8.3" font-weight="700" fill="#b91c1c">${isEs ? 'ESPERA DE TRAZO — VERIFICAR EN FOTOS DEL VIERNES' : 'LAYOUT STAGING HOLD — VERIFY FRIDAY MOCKUP PHOTOS'}</text>
      <rect x="330" y="1050" width="310" height="34" rx="3" fill="${hasUnsyncedLocalEdits ? '#fffbeb' : '#e8f1fb'}" stroke="${hasUnsyncedLocalEdits ? '#d97706' : '#15539e'}" stroke-width="1"/>
      <text x="340" y="1064" font-size="7.6" font-weight="700" fill="#10202b">${isEs ? 'SELLO DE REVISIÓN:' : 'REVISION STAMP:'}</text>
      <text x="340" y="1077" font-size="8.0" font-weight="700" fill="${hasUnsyncedLocalEdits ? '#b45309' : '#15539e'}">${esc(stamp)}</text>

      <text x="668" y="990" font-size="9.0" font-weight="700" fill="#10202b">${isEs ? 'ESCALA: Uniforme Real (scaleX = scaleY)' : 'SCALE: Uniform True Scale (scaleX = scaleY)'}</text>
      <text x="668" y="1012" font-size="8.2" fill="#334155">${isEs ? 'Bajos: 24" prof. · Altos: 12" prof.' : 'Base depth: 24" · Upper depth: 12"'}</text>
      <text x="668" y="1034" font-size="8.2" fill="#334155">${isEs ? 'Muro Oeste Altos' : 'West Wall Uppers'}: ${isEs ? 'NINGUNO (Fijo)' : 'NONE (Locked)'}</text>
      <text x="668" y="1058" font-size="8.0" font-weight="700" fill="#10202b">${isEs ? 'Inglés Rige · Verificar en obra' : 'EN Governs · Verify all dims in field'}</text>
      <text x="668" y="1084" font-size="7.4" fill="#4b5c69">${isEs ? 'Toca cualquier caja para inspeccionar' : 'Tap any box to inspect in schedule'}</text>
    `;
  }

  /* ── Main Coupled SVG Renderer (Strict Uniform scaleX === scaleY on ALL 5 tabs) ── */
  function renderSvg() {
    const svgEl = document.getElementById('kitchen-fp-svg');
    if (!svgEl) return;

    const cl = computeClosureSummary();
    const tk = computeTakeoff();
    const isEs = currentLang === 'es';
    const stamp = computeRevisionStamp();

    if (activeView === 'floor') {
      renderFloorPlanSvg(svgEl, cl, tk, isEs, stamp);
    } else {
      renderWallElevationSvg(svgEl, activeView, cl, tk, isEs, stamp);
    }

    /* Wire bidirectional Tap-to-Inspect on every clickable SVG cabinet/appliance element */
    svgEl.querySelectorAll('[data-cab-id]').forEach((el) => {
      el.addEventListener('click', (evt) => {
        if (circleMode) return;
        evt.stopPropagation();
        selectCabinet(el.getAttribute('data-cab-id'), true);
      });
    });

    syncCanvasSize();
  }

  function renderFloorPlanSvg(svgEl, cl, tk, isEs, stamp) {
    const g = state.room_geometry;
    /* Uniform single scaleX === scaleY = 3.05 px/in for 147" x 126.25" room */
    const S = 3.05;
    lastScaleInfo = { view: 'floor', scaleX: S, scaleY: S, uniform: true };

    const ox = 66;
    const oy = 186;
    const px = (xIn) => ox + xIn * S;
    const py = (yIn) => oy + yIn * S;

    const roomW = g.south_width_in;   // 147
    const roomH = g.east_depth_in;    // 126.25
    const recX = g.west_recess_depth_in; // 31.5
    const stepY = g.west_range_wall_in;  // 66.25
    const baseD = g.base_depth_in;       // 24
    const upD = g.upper_depth_in;        // 12

    const cabById = {};
    state.cabinets.forEach((c) => { cabById[c.id] = c; });

    const hiStroke = (id, def) => (selectedCabId === id ? '#15539e' : def);
    const hiWidth = (id, def) => (selectedCabId === id ? '3.0' : def);
    const hiFill = (id, def) => (selectedCabId === id ? '#dbeafe' : def);

    /* Base Cabinets & Appliances Layer (exact W x D proportions: 24" base, 28-1/16" Viking, 28-9/16" Haier) */
    let baseSvg = '';
    if (layers.base) {
      /* WEST WALL RUN (along x = 31.5, from y = stepY northward) */
      const wB1 = cabById['W-B1'], wA1 = cabById['W-A1'], wB2 = cabById['W-B2'];
      const w1H = (wB1.width_in || 18), wR = (wA1.width_in || 30), w2H = (wB2.width_in || 18);
      const yW0 = stepY;
      const yW1 = yW0 - w1H;
      const yW2 = yW1 - wR;
      const yW3 = yW2 - w2H;

      /* SOUTH WALL RUN (along y = roomH, from x = roomW [SE 0"] westward) */
      const sB1 = cabById['S-B1'], sB2 = cabById['S-B2'], sA1 = cabById['S-A1'], sB3 = cabById['S-B3'], sF1 = cabById['S-F1'];
      const eB1 = cabById['E-B1'], eB2 = cabById['E-B2'], eA1 = cabById['E-A1'];
      const sCornerW = sB1.width_in || 36;
      const eCornerW = eB1.width_in || 36;
      const sTrashStart = sB2.station_start_in, sTrashW = sB2.width_in || 15;
      const sDwStart = sA1.station_start_in, sDwW = sA1.width_in || 24;
      const sSinkStart = sB3.station_start_in, sSinkW = sB3.width_in || 30;
      const sFillStart = sF1.station_start_in, sFillW = sF1.width_in || 6;

      const eDrwStart = eB2.station_start_in, eDrwW = eB2.width_in || 24;
      const eFrStart = eA1.station_start_in, eFrW = eA1.width_in || 28;
      const frDepth = 26.5625 + 2.0; // Haier 26-9/16" + 2" rear clearance = 28-9/16"

      /* Side countertop overhang box at South run end (1") */
      const sEndIn = sFillStart + sFillW;
      const sOvhgX = roomW - (sEndIn + (g.counter_overhang_side_in || 1.0));

      baseSvg = `
        <g id="layer-base-cabs">
          <!-- West Run -->
          <rect data-cab-id="W-B1" data-elem="fp-west-b1" x="${px(recX).toFixed(1)}" y="${py(yW1).toFixed(1)}" width="${(baseD * S).toFixed(1)}" height="${(w1H * S).toFixed(1)}"
                fill="${hiFill('W-B1', '#e6efe9')}" stroke="${hiStroke('W-B1', '#2f4f42')}" stroke-width="${hiWidth('W-B1', '1.6')}"/>
          <text x="${px(recX + baseD / 2).toFixed(1)}" y="${py(yW1 + w1H / 2 + 2).toFixed(1)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#2f4f42">W-B1 ${esc(toFrac16(w1H))}×24"</text>

          <rect data-cab-id="W-A1" data-elem="fp-west-range" x="${px(recX).toFixed(1)}" y="${py(yW2).toFixed(1)}" width="${(28.0625 * S).toFixed(1)}" height="${(wR * S).toFixed(1)}"
                fill="${hiFill('W-A1', '#f1f5f9')}" stroke="${hiStroke('W-A1', '#10202b')}" stroke-width="${hiWidth('W-A1', '1.9')}"/>
          <text x="${px(recX + 14).toFixed(1)}" y="${py(yW2 + wR / 2 - 2).toFixed(1)}" font-size="7.8" text-anchor="middle" font-weight="700" fill="#10202b">VIKING 30"</text>
          <text x="${px(recX + 14).toFixed(1)}" y="${py(yW2 + wR / 2 + 9).toFixed(1)}" font-size="6.4" text-anchor="middle" fill="#475569">28-1/16" D · CL 33"</text>

          <rect data-cab-id="W-B2" data-elem="fp-west-b2" x="${px(recX).toFixed(1)}" y="${py(yW3).toFixed(1)}" width="${(baseD * S).toFixed(1)}" height="${(w2H * S).toFixed(1)}"
                fill="${hiFill('W-B2', '#e6efe9')}" stroke="${hiStroke('W-B2', '#2f4f42')}" stroke-width="${hiWidth('W-B2', '1.6')}"/>
          <text x="${px(recX + baseD / 2).toFixed(1)}" y="${py(yW3 + w2H / 2 + 2).toFixed(1)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#2f4f42">W-B2 ${esc(toFrac16(w2H))}×24"</text>

          <!-- Shared SE L-Corner Base (S-B1 / E-B1 coupled) -->
          <polygon data-cab-id="S-B1" data-elem="fp-se-corner"
                   points="${px(roomW - sCornerW).toFixed(1)},${py(roomH).toFixed(1)} ${px(roomW).toFixed(1)},${py(roomH).toFixed(1)} ${px(roomW).toFixed(1)},${py(roomH - eCornerW).toFixed(1)} ${px(roomW - baseD).toFixed(1)},${py(roomH - eCornerW).toFixed(1)} ${px(roomW - baseD).toFixed(1)},${py(roomH - baseD).toFixed(1)} ${px(roomW - sCornerW).toFixed(1)},${py(roomH - baseD).toFixed(1)}"
                   fill="${selectedCabId === 'S-B1' || selectedCabId === 'E-B1' ? '#dbeafe' : '#e6efe9'}" stroke="${selectedCabId === 'S-B1' || selectedCabId === 'E-B1' ? '#15539e' : '#2f4f42'}" stroke-width="${selectedCabId === 'S-B1' || selectedCabId === 'E-B1' ? '3.0' : '1.6'}"/>
          <text x="${px(roomW - 14).toFixed(1)}" y="${py(roomH - 11).toFixed(1)}" font-size="7.2" text-anchor="middle" font-weight="700" fill="#2f4f42">SE ${esc(toFrac16(sCornerW))}</text>

          <!-- South Trash, DW, 30" Sink Base, 6" vs 12" End Box -->
          <rect data-cab-id="S-B2" x="${px(roomW - sTrashStart - sTrashW).toFixed(1)}" y="${py(roomH - baseD).toFixed(1)}" width="${(sTrashW * S).toFixed(1)}" height="${(baseD * S).toFixed(1)}"
                fill="${hiFill('S-B2', '#e6efe9')}" stroke="${hiStroke('S-B2', '#2f4f42')}" stroke-width="${hiWidth('S-B2', '1.5')}"/>
          <text x="${px(roomW - sTrashStart - sTrashW / 2).toFixed(1)}" y="${py(roomH - 12).toFixed(1)}" font-size="6.8" text-anchor="middle" font-weight="700" fill="#2f4f42">${isEs ? 'BAS.' : 'TRASH'}</text>
          <text x="${px(roomW - sTrashStart - sTrashW / 2).toFixed(1)}" y="${py(roomH - 5).toFixed(1)}" font-size="6.4" text-anchor="middle" fill="#2f4f42">${esc(toFrac16(sTrashW))}</text>

          <rect data-cab-id="S-A1" x="${px(roomW - sDwStart - sDwW).toFixed(1)}" y="${py(roomH - baseD).toFixed(1)}" width="${(sDwW * S).toFixed(1)}" height="${(baseD * S).toFixed(1)}"
                fill="${hiFill('S-A1', '#ffffff')}" stroke="${hiStroke('S-A1', '#10202b')}" stroke-width="${hiWidth('S-A1', '1.5')}"/>
          <text x="${px(roomW - sDwStart - sDwW / 2).toFixed(1)}" y="${py(roomH - 12).toFixed(1)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#10202b">DW ${esc(toFrac16(sDwW))}</text>

          <rect data-cab-id="S-B3" data-elem="fp-south-sink" x="${px(roomW - sSinkStart - sSinkW).toFixed(1)}" y="${py(roomH - baseD).toFixed(1)}" width="${(sSinkW * S).toFixed(1)}" height="${(baseD * S).toFixed(1)}"
                fill="${hiFill('S-B3', '#e6efe9')}" stroke="${hiStroke('S-B3', '#2f4f42')}" stroke-width="${hiWidth('S-B3', '1.7')}"/>
          <rect x="${px(roomW - sSinkStart - sSinkW + 4).toFixed(1)}" y="${py(roomH - baseD + 4).toFixed(1)}" width="${((sSinkW - 8) * S).toFixed(1)}" height="${(15 * S).toFixed(1)}" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="1.0"/>
          <text x="${px(roomW - sSinkStart - sSinkW / 2).toFixed(1)}" y="${py(roomH - 11).toFixed(1)}" font-size="7.2" text-anchor="middle" font-weight="700" fill="#10202b">${isEs ? 'TARJA' : 'SINK'} ${esc(toFrac16(sSinkW))}</text>

          <rect data-cab-id="S-F1" data-elem="fp-south-end-box" x="${px(roomW - sFillStart - sFillW).toFixed(1)}" y="${py(roomH - baseD).toFixed(1)}" width="${(sFillW * S).toFixed(1)}" height="${(baseD * S).toFixed(1)}"
                fill="${hiFill('S-F1', cl.South.casingClash ? '#fecaca' : '#fffbeb')}" stroke="${hiStroke('S-F1', cl.South.casingClash ? '#b91c1c' : '#d97706')}" stroke-width="${hiWidth('S-F1', '1.8')}"/>
          <text x="${px(roomW - sFillStart - sFillW / 2).toFixed(1)}" y="${py(roomH - 12).toFixed(1)}" font-size="6.8" text-anchor="middle" font-weight="700" fill="${cl.South.casingClash ? '#b91c1c' : '#92400e'}">${esc(toFrac16(sFillW))}</text>

          <!-- 1" Side Countertop Overhang Indicator -->
          <rect x="${px(sOvhgX).toFixed(1)}" y="${py(roomH - baseD - 1.5).toFixed(1)}" width="${((sEndIn + 1.0) * S).toFixed(1)}" height="${(1.5 * S).toFixed(1)}" fill="#94a3b8" fill-opacity="0.5"/>
          <line x1="${px(sOvhgX).toFixed(1)}" y1="${py(roomH - baseD - 1.5).toFixed(1)}" x2="${px(sOvhgX).toFixed(1)}" y2="${py(roomH).toFixed(1)}" stroke="${cl.South.casingClash ? '#b91c1c' : '#475569'}" stroke-width="1.4" stroke-dasharray="3,2"/>

          <!-- East Drawer Base + Haier Fridge -->
          <rect data-cab-id="E-B2" x="${px(roomW - baseD).toFixed(1)}" y="${py(roomH - eDrwStart - eDrwW).toFixed(1)}" width="${(baseD * S).toFixed(1)}" height="${(eDrwW * S).toFixed(1)}"
                fill="${hiFill('E-B2', '#e6efe9')}" stroke="${hiStroke('E-B2', '#2f4f42')}" stroke-width="${hiWidth('E-B2', '1.5')}"/>
          <text x="${px(roomW - 12).toFixed(1)}" y="${py(roomH - eDrwStart - eDrwW / 2 + 2).toFixed(1)}" font-size="7.2" text-anchor="middle" font-weight="700" fill="#2f4f42">E-B2 ${esc(toFrac16(eDrwW))}</text>

          <rect data-cab-id="E-A1" data-elem="fp-east-fridge" x="${px(roomW - frDepth).toFixed(1)}" y="${py(roomH - eFrStart - eFrW).toFixed(1)}" width="${(frDepth * S).toFixed(1)}" height="${(eFrW * S).toFixed(1)}"
                fill="${hiFill('E-A1', '#ffffff')}" stroke="${hiStroke('E-A1', '#10202b')}" stroke-width="${hiWidth('E-A1', '1.9')}"/>
          <text x="${px(roomW - frDepth / 2).toFixed(1)}" y="${py(roomH - eFrStart - eFrW / 2 - 2).toFixed(1)}" font-size="7.6" text-anchor="middle" font-weight="700" fill="#10202b">HAIER</text>
          <text x="${px(roomW - frDepth / 2).toFixed(1)}" y="${py(roomH - eFrStart - eFrW / 2 + 9).toFixed(1)}" font-size="6.4" text-anchor="middle" fill="#475569">27-9/16" · +2" gap</text>
        </g>`;
    }

    /* Wall Upper Cabinets Layer (12" deep dashed proportional overlay; explicitly shows NO UPPERS on West & NOTHING ABOVE FRIDGE) */
    let uppersSvg = '';
    if (layers.uppers) {
      const eU1 = cabById['E-U1'], eU2 = cabById['E-U2'];
      const sU1 = cabById['S-U1'];
      const eu1W = eU1.width_in || 24, eu2W = eU2.width_in || 36;
      const pieW = sU1.width_in !== null ? sU1.width_in : sU1.provisional_width_in;
      const pieProv = sU1.width_in === null;
      uppersSvg = `
        <g id="layer-wall-uppers">
          <!-- West Wall: Explicit NO UPPERS badge + Zephyr Hood 19-7/16" overhead footprint -->
          <rect x="${px(recX).toFixed(1)}" y="${py(stepY - 33 - 14.94).toFixed(1)}" width="${(19.4375 * S).toFixed(1)}" height="${(29.875 * S).toFixed(1)}"
                fill="none" stroke="#15539e" stroke-width="1.3" stroke-dasharray="4,3"/>
          <rect x="${px(recX + 26).toFixed(1)}" y="${py(14).toFixed(1)}" width="102" height="14" rx="2" fill="#e8f1fb" stroke="#15539e" stroke-width="0.9"/>
          <text x="${px(recX + 26) + 51}" y="${py(14) + 10}" font-size="6.6" text-anchor="middle" font-weight="700" fill="#15539e">${isEs ? 'OESTE: SIN ALTOS' : 'WEST: NO UPPERS'}</text>

          <!-- East Wall Optional 12" Deep Wall Uppers (24" corner + 36" adjacent; NOTHING above fridge!) -->
          <rect data-cab-id="E-U1" data-elem="fp-upper-e1" x="${px(roomW - upD).toFixed(1)}" y="${py(roomH - eu1W).toFixed(1)}" width="${(upD * S).toFixed(1)}" height="${(eu1W * S).toFixed(1)}"
                fill="#15539e" fill-opacity="0.10" stroke="${hiStroke('E-U1', '#15539e')}" stroke-width="${hiWidth('E-U1', '1.4')}" stroke-dasharray="5,3"/>
          <rect data-cab-id="E-U2" data-elem="fp-upper-e2" x="${px(roomW - upD).toFixed(1)}" y="${py(roomH - eu1W - eu2W).toFixed(1)}" width="${(upD * S).toFixed(1)}" height="${(eu2W * S).toFixed(1)}"
                fill="#15539e" fill-opacity="0.10" stroke="${hiStroke('E-U2', '#15539e')}" stroke-width="${hiWidth('E-U2', '1.4')}" stroke-dasharray="5,3"/>
          <text x="${px(roomW - 6).toFixed(1)}" y="${py(roomH - 42).toFixed(1)}" font-size="6.4" text-anchor="middle" font-weight="700" fill="#15539e" transform="rotate(-90 ${px(roomW - 6).toFixed(1)},${py(roomH - 42).toFixed(1)})">12" UPPERS (OPT)</text>

          <!-- South Wall Existing Recessed Pie-Safe (dashed provisional when width_in === null) -->
          <rect data-cab-id="S-U1" data-provisional="${pieProv}" x="${px(roomW - 26 - pieW).toFixed(1)}" y="${py(roomH).toFixed(1)}" width="${(pieW * S).toFixed(1)}" height="${(6 * S).toFixed(1)}"
                fill="#fffbeb" stroke="#d97706" stroke-width="1.4" ${pieProv ? 'stroke-dasharray="4,2"' : ''}/>
          <text x="${px(roomW - 26 - pieW / 2).toFixed(1)}" y="${py(roomH + 10).toFixed(1)}" font-size="6.4" text-anchor="middle" font-weight="700" fill="#92400e">
            ${isEs ? 'ALACENA' : 'PIE-SAFE'}${pieProv ? (isEs ? ' (Medir — prov.)' : ' (Measure — prov.)') : ` (${toFrac16(pieW)})`}
          </text>
        </g>`;
    }

    /* Swings & Clear Walkways Layer (fridge door, range oven door, DW door, rear door, narrowest walkway!) */
    let swingsSvg = '';
    if (layers.swings) {
      const sA1 = cabById['S-A1'];
      const dwX = roomW - sA1.station_start_in - (sA1.width_in || 24);
      const rearDoorW = g.south_rear_door.width_in; // 25.875
      const rearHingeX = roomW - g.south_rear_door.from_se_end_in; // ~4.72
      const sEndX = roomW - cl.South.withOverhang;
      const walkColor = cl.walkways.narrowest < 32 ? '#b91c1c' : '#2f4f42';
      swingsSvg = `
        <g id="layer-swings-walkways">
          <!-- Rear Door Inward Swing (25-7/8") -->
          <line x1="${px(rearHingeX).toFixed(1)}" y1="${py(roomH).toFixed(1)}" x2="${px(rearHingeX).toFixed(1)}" y2="${py(roomH - rearDoorW).toFixed(1)}" stroke="#475569" stroke-width="1.6"/>
          <path d="M ${px(rearHingeX).toFixed(1)} ${py(roomH - rearDoorW).toFixed(1)} A ${(rearDoorW * S).toFixed(1)} ${(rearDoorW * S).toFixed(1)} 0 0 1 ${px(rearHingeX + rearDoorW).toFixed(1)} ${py(roomH).toFixed(1)}"
                fill="none" stroke="#64748b" stroke-width="1.1" stroke-dasharray="4,3"/>

          <!-- Dishwasher Open Door Swing (24" x 24" into floor) -->
          <rect x="${px(dwX).toFixed(1)}" y="${py(roomH - baseD - 24).toFixed(1)}" width="${(24 * S).toFixed(1)}" height="${(24 * S).toFixed(1)}"
                fill="#0284c7" fill-opacity="0.06" stroke="#0284c7" stroke-width="1.0" stroke-dasharray="3,2"/>
          <text x="${px(dwX + 12).toFixed(1)}" y="${py(roomH - baseD - 11).toFixed(1)}" font-size="6.2" text-anchor="middle" fill="#0369a1">DW ${isEs ? 'puerta' : 'open'}</text>

          <!-- Viking Oven Door Swing (20" into floor) -->
          <rect x="${px(recX + 28.0625).toFixed(1)}" y="${py(stepY - 48).toFixed(1)}" width="${(20 * S).toFixed(1)}" height="${(30 * S).toFixed(1)}"
                fill="#b45309" fill-opacity="0.06" stroke="#b45309" stroke-width="1.0" stroke-dasharray="3,2"/>
          <text x="${px(recX + 38).toFixed(1)}" y="${py(stepY - 32).toFixed(1)}" font-size="6.0" text-anchor="middle" fill="#92400e">${isEs ? 'Horno' : 'Oven'}</text>

          <!-- Haier Fridge Door Swing (27.5" radius) -->
          <path d="M ${px(roomW - 28.56).toFixed(1)} ${py(roomH - 88).toFixed(1)} A ${(26 * S).toFixed(1)} ${(26 * S).toFixed(1)} 0 0 0 ${px(roomW - 54.56).toFixed(1)} ${py(roomH - 62).toFixed(1)}"
                fill="none" stroke="#0284c7" stroke-width="1.1" stroke-dasharray="3,2"/>

          <!-- Live Clear Walkway 1: South End (+1" overhang) to West Recess Wall -->
          <line data-elem="walkway-south-end" x1="${px(0).toFixed(1)}" y1="${py(roomH - 14).toFixed(1)}" x2="${px(sEndX).toFixed(1)}" y2="${py(roomH - 14).toFixed(1)}" stroke="${walkColor}" stroke-width="1.8"/>
          <rect x="${Math.max(px(1), px(sEndX / 2) - 48).toFixed(1)}" y="${py(roomH - 28).toFixed(1)}" width="98" height="14" rx="2" fill="#ffffff" stroke="${walkColor}" stroke-width="1.0"/>
          <text x="${(Math.max(px(1), px(sEndX / 2) - 48) + 49).toFixed(1)}" y="${py(roomH - 28) + 9.8}" font-size="6.5" text-anchor="middle" font-weight="700" fill="${walkColor}">${esc(toFrac16(cl.walkways.southEndToWestWall))} ${isEs ? 'paso puerta' : 'to recess wall'}</text>

          <!-- Live Clear Walkway 2: West Step Corner to South Countertop Front (+1.5" overhang) -->
          <line x1="${px(40).toFixed(1)}" y1="${py(stepY).toFixed(1)}" x2="${px(40).toFixed(1)}" y2="${py(roomH - baseD - 1.5).toFixed(1)}" stroke="#15539e" stroke-width="1.6"/>
          <rect x="${px(43).toFixed(1)}" y="${py((stepY + roomH - baseD - 1.5) / 2 - 2).toFixed(1)}" width="110" height="15" rx="2" fill="#ffffff" stroke="#15539e" stroke-width="0.9"/>
          <text x="${px(43) + 55}" y="${py((stepY + roomH - baseD - 1.5) / 2 - 2) + 10.5}" font-size="6.8" text-anchor="middle" font-weight="700" fill="#15539e">${esc(toFrac16(cl.walkways.stepToSouthCounter))} ${isEs ? 'paso L' : 'clear pass'}</text>
        </g>`;
    }

    /* Rough-In Utilities (HOLD) Layer */
    let utilSvg = '';
    if (layers.utilities) {
      const sB3 = cabById['S-B3'];
      const sinkClFromSE = sB3.station_start_in + (sB3.width_in || 30) / 2;
      utilSvg = `
        <g id="layer-utilities-hold">
          <!-- West Gas Tee & 1-Gang Direct Hood Hardwire (HOLD) -->
          <circle cx="${px(recX + 4).toFixed(1)}" cy="${py(stepY - 33).toFixed(1)}" r="4.5" fill="#fef2f2" stroke="#b91c1c" stroke-width="1.4"/>
          <rect x="${px(recX + 29).toFixed(1)}" y="${py(stepY - 46).toFixed(1)}" width="94" height="12" rx="2" fill="#fef2f2" fill-opacity="0.94" stroke="#fca5a5" stroke-width="0.7"/>
          <text x="${px(recX + 29) + 47}" y="${py(stepY - 46) + 8.5}" font-size="5.9" text-anchor="middle" font-weight="700" fill="#b91c1c">GAS + 1-GANG HOOD (HOLD)</text>

          <!-- South Sink Plumbing Stubs CL (HOLD until 75-105 vs 72-102 reconciles) -->
          <line x1="${px(roomW - sinkClFromSE).toFixed(1)}" y1="${py(roomH + 4).toFixed(1)}" x2="${px(roomW - sinkClFromSE).toFixed(1)}" y2="${py(roomH - baseD - 8).toFixed(1)}" stroke="#b91c1c" stroke-width="1.3" stroke-dasharray="5,2,1,2"/>
          <text x="${px(roomW - sinkClFromSE).toFixed(1)}" y="${py(roomH - baseD - 11).toFixed(1)}" font-size="6.4" text-anchor="middle" font-weight="700" fill="#b91c1c">SINK CL ${esc(toFrac16(sinkClFromSE))} (HOLD)</text>

          <!-- East Wall D04 Subpanel Infill Zone (HOLD: 6"-38" from SE) -->
          <rect x="${px(roomW).toFixed(1)}" y="${py(roomH - 38).toFixed(1)}" width="11" height="${(32 * S).toFixed(1)}" fill="#fee2e2" stroke="#b91c1c" stroke-width="1.3" stroke-dasharray="3,2"/>
          <text x="${px(roomW) + 15}" y="${py(roomH - 22).toFixed(1)}" font-size="6.5" font-weight="700" fill="#b91c1c" transform="rotate(-90 ${px(roomW) + 15},${py(roomH - 22).toFixed(1)})">D04 HOLD (No screws 53–77")</text>

          <!-- Casing Clash Line at 114" (John Tape) / 115" (Scan) -->
          <line x1="${px(roomW - 114).toFixed(1)}" y1="${py(roomH + 14).toFixed(1)}" x2="${px(roomW - 114).toFixed(1)}" y2="${py(roomH - 30).toFixed(1)}" stroke="#b91c1c" stroke-width="1.2" stroke-dasharray="3,2"/>
          <text x="${px(roomW - 114).toFixed(1)}" y="${py(roomH + 24).toFixed(1)}" font-size="6.2" text-anchor="middle" font-weight="700" fill="#b91c1c">114"/115" ${isEs ? 'Chambrana' : 'Casing'}</text>
        </g>`;
    }

    const ftPx = 12 * S;
    const barX = 548;
    const barY = 918;
    const pinsMarkup = buildPinsSvg();

    const statusBadgeBg = cl.South.casingClash ? '#fef2f2' : '#e6efe9';
    const statusBadgeCol = cl.South.casingClash ? '#b91c1c' : '#2f4f42';
    const statusBadgeTxt = cl.South.casingClash
      ? (isEs ? 'CHOQUE CHAMBRANA SUR (AJUSTAR 6"/12")' : 'SOUTH CASING CLASH (CHECK 6"/12")')
      : (isEs ? `PASO LIBRE MÍN.: ${toFrac16(cl.walkways.narrowest)} · OK` : `NARROWEST WALK: ${toFrac16(cl.walkways.narrowest)} · OK`);

    svgEl.innerHTML = `
      <rect x="10" y="10" width="900" height="1100" fill="#ffffff" stroke="#10202b" stroke-width="1.8"/>
      <rect x="10" y="10" width="900" height="54" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <text x="24" y="32" font-size="13.2" font-weight="700" fill="#10202b">${isEs ? 'PLANTA DE COCINA ACOPLADA (147" × 126-1/4") — ESCALA REAL' : 'COUPLED KITCHEN FLOOR PLAN (147" × 126-1/4") — TRUE SCALE'}</text>
      <text x="24" y="49" font-size="8.6" fill="#4b5c69">${isEs ? '4 Muros Sincronizados · Escala Uniforme X = Y · Toca Cualquier Gabinete · Sin Precios' : 'All 4 Walls Synced · Uniform Scale X = Y · Tap Any Box to Inspect · Zero Prices'}</text>

      <rect x="576" y="18" width="320" height="38" rx="4" fill="${statusBadgeBg}" stroke="${statusBadgeCol}" stroke-width="1.3"/>
      <text x="736" y="33" font-size="8.8" text-anchor="middle" font-weight="700" fill="${statusBadgeCol}">${esc(statusBadgeTxt)}</text>
      <text x="736" y="47" font-size="7.4" text-anchor="middle" fill="#334155">${esc(stamp)}</text>

      <!-- True-Scale Kitchen Room Polygon (147" x 126-1/4" with 31-1/2" x 59-3/4" SW Recess) -->
      <polygon data-elem="room-polygon"
               points="${px(recX).toFixed(1)},${py(0).toFixed(1)} ${px(roomW).toFixed(1)},${py(0).toFixed(1)} ${px(roomW).toFixed(1)},${py(roomH).toFixed(1)} ${px(0).toFixed(1)},${py(roomH).toFixed(1)} ${px(0).toFixed(1)},${py(stepY).toFixed(1)} ${px(recX).toFixed(1)},${py(stepY).toFixed(1)}"
               fill="#fbfdfb" stroke="#10202b" stroke-width="2.6"/>

      <!-- Openings: NE Hallway Opening (29-3/8") & South Window (33-13/16") -->
      <line x1="${px(roomW).toFixed(1)}" y1="${py(0).toFixed(1)}" x2="${px(roomW).toFixed(1)}" y2="${py(g.ne_hall_opening.width_in).toFixed(1)}" stroke="#ffffff" stroke-width="5.0"/>
      <text x="${px(roomW - 4).toFixed(1)}" y="${py(14).toFixed(1)}" font-size="7.0" text-anchor="end" font-weight="700" fill="#15539e">${isEs ? 'PASILLO 29-3/8"' : 'HALL 29-3/8"'}</text>
      <line x1="${px(roomW - g.south_window.from_se_end_in).toFixed(1)}" y1="${py(roomH).toFixed(1)}" x2="${px(roomW - g.south_window.from_se_start_in).toFixed(1)}" y2="${py(roomH).toFixed(1)}" stroke="#0284c7" stroke-width="4.5"/>

      ${baseSvg}
      ${uppersSvg}
      ${swingsSvg}
      ${utilSvg}

      <!-- Named Zero Corners (Red Target Dots) -->
      <circle cx="${px(roomW).toFixed(1)}" cy="${py(roomH).toFixed(1)}" r="4.5" fill="#b91c1c"/>
      <text x="${px(roomW) - 4}" y="${py(roomH) + 14}" font-size="7.2" text-anchor="end" font-weight="700" fill="#b91c1c">${isEs ? 'SE 0" (Sur/Este)' : 'SE Zero 0"'}</text>
      <circle cx="${px(recX).toFixed(1)}" cy="${py(stepY).toFixed(1)}" r="4.5" fill="#b91c1c"/>
      <text x="${px(recX) - 6}" y="${py(stepY) - 6}" font-size="7.0" text-anchor="end" font-weight="700" fill="#b91c1c">${isEs ? 'Sur 0" (Oeste)' : 'South Step 0"'}</text>

      <!-- Wall Overall Dimensions -->
      <text x="${px(recX + g.north_width_in / 2).toFixed(1)}" y="${py(0) - 10}" font-size="8.6" text-anchor="middle" font-weight="700" fill="#10202b">${isEs ? 'MURO NORTE (Abierto · 115-1/2")' : 'NORTH WALL (Open · 115-1/2")'}</text>
      <text x="${px(roomW / 2).toFixed(1)}" y="${py(roomH) + 38}" font-size="8.6" text-anchor="middle" font-weight="700" fill="#10202b">${isEs ? 'MURO SUR: 147" interior · Claro a chambrana 114"/115"' : 'SOUTH WALL: 147" inside · Usable to casing 114"/115"'}</text>
      <text x="${px(recX) - 14}" y="${py(stepY / 2).toFixed(1)}" font-size="8.4" text-anchor="middle" font-weight="700" fill="#15539e" transform="rotate(-90 ${px(recX) - 14},${py(stepY / 2).toFixed(1)})">${isEs ? 'OESTE 66-1/4" (ESTUFA)' : 'WEST 66-1/4" (RANGE)'}</text>

      <!-- RIGHT COLUMN: N/S/E/W COMPASS + LIVE 4-WALL CLOSURE + WRAP-AROUND TAKEOFF -->
      <rect x="536" y="76" width="360" height="162" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.1"/>
      <text x="548" y="95" font-size="8.8" font-weight="700" fill="#10202b">${isEs ? 'BRÚJULA N/S/E/O Y ESQUINAS CERO' : 'N/S/E/W COMPASS & NAMED ZERO CORNERS'}</text>
      <g transform="translate(826, 150)">
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
      <text x="548" y="118" font-size="7.6" font-weight="700" fill="#15539e">• West: ${esc(isEs ? 'Esq. Sur 0" → Norte' : 'South Step 0" → North')}</text>
      <text x="548" y="136" font-size="7.6" font-weight="700" fill="#2f4f42">• South: ${esc(isEs ? 'Esq. SE 0" → Oeste' : 'SE Corner 0" → West')}</text>
      <text x="548" y="154" font-size="7.6" font-weight="700" fill="#2f4f42">• East: ${esc(isEs ? 'Esq. SE 0" → Norte' : 'SE Corner 0" → North')}</text>
      <text x="548" y="172" font-size="7.6" fill="#475569">• North: ${esc(isEs ? 'Esq. NO 0" → Este' : 'NW Corner 0" → East')}</text>
      <text x="548" y="196" font-size="7.3" fill="#475569">${isEs ? 'Moldura original: Zoclo 9-1/2" · Riel 103"' : 'Original trim: 9-1/2" base · 103" picture rail'}</text>
      <text x="548" y="214" font-size="7.3" font-weight="700" fill="#b45309">${isEs ? 'Punteado = Medir en obra — proporción provisional' : 'Dashed = Measure on site — proportion provisional'}</text>

      <!-- Live 4-Wall Closure & Walkway Card -->
      <rect x="536" y="250" width="360" height="252" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1.1"/>
      <rect x="536" y="250" width="360" height="22" rx="4" fill="#e8f1fb"/>
      <text x="548" y="265" font-size="8.6" font-weight="700" fill="#15539e">${isEs ? 'CIERRE DE MEDIDAS POR MURO Y PASOS LIBRES' : 'LIVE 4-WALL CLOSURE & CLEAR WALKWAYS'}</text>
      <text x="548" y="289" font-size="7.9" font-weight="700" fill="${cl.West.ok ? '#2f4f42' : '#b91c1c'}">West: ${esc(toFrac16(cl.West.sum))} / ${esc(toFrac16(cl.West.span))} · ${isEs ? 'SIN altos (Fijo)' : 'NO uppers (Locked)'}</text>
      <text x="548" y="307" font-size="7.9" font-weight="700" fill="${cl.South.casingClash ? '#b91c1c' : '#2f4f42'}">South: ${esc(toFrac16(cl.South.sum))} (+1" = ${esc(toFrac16(cl.South.withOverhang))}) vs 114"/115"</text>
      <text x="548" y="325" font-size="7.9" font-weight="700" fill="${cl.East.ok ? '#2f4f42' : '#b91c1c'}">East: ${esc(toFrac16(cl.East.sum))} / ${esc(toFrac16(cl.East.span))} · ${isEs ? 'Nada sobre Haier' : 'Nothing above Haier'}</text>
      <text x="548" y="343" font-size="7.9" fill="#334155">North: ${isEs ? '115-1/2" abierto · Acceso pasillo 29-3/8"×84"' : '115-1/2" open · NE hall opening 29-3/8"×84"'}</text>
      <line x1="548" y1="356" x2="884" y2="356" stroke="#cbd5e1" stroke-width="0.9"/>
      <text x="548" y="374" font-size="8.0" font-weight="700" fill="${cl.walkways.narrowest < 32 ? '#b91c1c' : '#2f4f42'}">${isEs ? 'Paso Más Angosto (c/ vuelo):' : 'Narrowest Walkway (w/ overhang):'} ${esc(toFrac16(cl.walkways.narrowest))}</text>
      <text x="548" y="391" font-size="7.4" fill="#4b5c69">• ${isEs ? 'Remate Sur → muro oeste:' : 'South end → West recess wall:'} ${esc(toFrac16(cl.walkways.southEndToWestWall))}</text>
      <text x="548" y="406" font-size="7.4" fill="#4b5c69">• ${isEs ? 'Esquina estufa → cubierta Sur:' : 'Range step → South counter front:'} ${esc(toFrac16(cl.walkways.stepToSouthCounter))}</text>
      <text x="548" y="421" font-size="7.4" fill="#4b5c69">• ${isEs ? 'Estufa Viking → refri Haier:' : 'Viking range → Haier fridge:'} ${esc(toFrac16(cl.walkways.rangeToFridge))}</text>
      <line x1="548" y1="434" x2="884" y2="434" stroke="#cbd5e1" stroke-width="0.9"/>
      <text x="548" y="452" font-size="8.0" font-weight="700" fill="#15539e">${isEs ? 'Azulejo Combinado:' : 'Wrap-Around Tile:'} ${tk.tile_net_sqft} → ${tk.tile_gross_sqft} sq ft (+${tk.waste_pct}%)</text>
      <text x="548" y="468" font-size="7.5" fill="#334155">0.42" HardieBacker: ${tk.backer_sheets_3x5} ${isEs ? 'hojas' : 'sheets'} · ${isEs ? 'Cubierta' : 'Counter'}: ~${tk.countertop_net_sqft} sq ft</text>
      <text x="548" y="486" font-size="7.3" font-weight="700" fill="#92400e">${isEs ? '0 precios · 0 núm. pedido · verificar stock antes de pedir' : 'Zero prices · Zero order #s · verify stock first'}</text>

      <!-- Holds & Attached Comments Box -->
      <rect x="536" y="514" width="360" height="340" rx="4" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.1"/>
      <text x="548" y="534" font-size="8.6" font-weight="700" fill="#991b1b">${isEs ? 'ESPERAS ACTIVAS Y COMENTARIOS ADJUNTOS' : 'ACTIVE HOLDS & ATTACHED CALLOUTS'}</text>
      <text x="548" y="554" font-size="7.4" fill="#7f1d1d">• ${isEs ? 'Tarja Sur: conciliar 75"–105" vs 72"–102" antes de plomería.' : 'South Sink: reconcile 75"–105" vs 72"–102" before plumbing.'}</text>
      <text x="548" y="570" font-size="7.4" fill="#7f1d1d">• ${isEs ? 'Subpanel D04 (Este SE): sin tornillos 53"–77"; espera lateral.' : 'D04 Subpanel (East SE): no screws 53"–77"; side-entry hold.'}</text>
      <text x="548" y="586" font-size="7.3" fill="#7f1d1d">• ${isEs ? 'Ducto izq. Oeste es exclusivo campana (>= 6"); NEXT HVAC = solo calefacción.' : 'West left-chase duct = hood ONLY (>= 6"); NEXT HVAC = furnace ONLY.'}</text>
      <text x="548" y="602" font-size="7.3" fill="#7f1d1d">• ${isEs ? 'Zephyr: caja sencilla 2"×3" (~83"–86", eje ±2-1/4", ~1" salida; no 4×4 a 100").' : 'Zephyr: 1-gang 2"×3" box (~83"–86", C/L ±2-1/4", ~1" proud; no 4×4 at 100").'}</text>
      <line x1="548" y1="620" x2="884" y2="620" stroke="#fca5a5" stroke-width="0.9"/>
      <text x="548" y="638" font-size="7.8" font-weight="700" fill="#10202b">${isEs ? 'Comentarios Adjuntos:' : 'Attached Callouts:'} ${(state.pins || []).length} · ${isEs ? 'Pendientes EOD:' : 'Pending EOD:'} ${(tailnetState.pendingEod || []).length}</text>

      <!-- Bar Scale -->
      <text x="${barX}" y="${barY - 14}" font-size="8.2" font-weight="700" fill="#10202b">${isEs ? 'ESCALA GRÁFICA (Uniforme X = Y)' : 'BAR SCALE (Uniform True Scale X = Y)'}</text>
      <rect x="${barX}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 2).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 3).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <text x="${barX}" y="${barY + 14}" font-size="8.0" text-anchor="middle">0'</text>
      <text x="${(barX + ftPx).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">1'</text>
      <text x="${(barX + ftPx * 2).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">2'</text>
      <text x="${(barX + ftPx * 3).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">3'</text>
      <text x="${(barX + ftPx * 4).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">4'</text>

      ${buildTitleBlockSvg(cl, tk, isEs, stamp)}
      <g id="kfp-pins-layer">${pinsMarkup}</g>
    `;
  }

  /* ── Coupled 4-Wall Elevations (West, South, East, North) at Strict scaleX === scaleY ── */
  function renderWallElevationSvg(svgEl, wallKey, cl, tk, isEs, stamp) {
    const g = state.room_geometry;
    const trim = state.existing_original_trim;
    const wallMap = { west: 'West', south: 'South', east: 'East', north: 'North' };
    const wallName = wallMap[wallKey];
    const spanIn = state.walls[wallName].span_in;
    const ceilH = g.ceiling_height_in; // 121.5

    /* Single uniform scalar S = scaleX === scaleY fitting wall width & ceiling height cleanly */
    const S = Math.min(720 / Math.max(spanIn, 66), 540 / Math.max(ceilH, 96));
    lastScaleInfo = { view: wallKey, scaleX: S, scaleY: S, uniform: true };

    const ox = 100 + Math.max(0, (720 - spanIn * S) / 2);
    const fy = 780;
    const sx = (xIn) => ox + xIn * S;
    const sy = (hIn) => fy - hIn * S;

    const wallCabs = state.cabinets.filter((c) => c.wall === wallName);
    const hiStroke = (id, def) => (selectedCabId === id ? '#15539e' : def);
    const hiWidth = (id, def) => (selectedCabId === id ? '3.0' : def);
    const hiFill = (id, def) => (selectedCabId === id ? '#dbeafe' : def);

    let elemSvg = '';

    /* Original Edwardian trim reference lines (baseboard 9.5" & high picture rail 103") */
    const railH = trim.high_picture_rail_height_in.value !== null ? Number(trim.high_picture_rail_height_in.value) : 103.0;
    const baseH = trim.baseboard_height_in.value !== null ? Number(trim.baseboard_height_in.value) : 9.5;
    elemSvg += `
      <line data-elem="picture-rail" x1="${sx(0).toFixed(1)}" y1="${sy(railH).toFixed(1)}" x2="${sx(spanIn).toFixed(1)}" y2="${sy(railH).toFixed(1)}" stroke="#64748b" stroke-width="1.2" stroke-dasharray="5,3"/>
      <text x="${(sx(spanIn) - 6).toFixed(1)}" y="${(sy(railH) - 4).toFixed(1)}" font-size="7.2" text-anchor="end" font-weight="700" fill="#475569">${isEs ? 'Moldura Alta Orig.' : 'Orig. Picture Rail'}: ${esc(toFrac16(railH))}</text>
      <line data-elem="orig-baseboard" x1="${sx(0).toFixed(1)}" y1="${sy(baseH).toFixed(1)}" x2="${sx(spanIn).toFixed(1)}" y2="${sy(baseH).toFixed(1)}" stroke="#94a3b8" stroke-width="0.9" stroke-dasharray="3,3"/>
    `;

    /* Wall-specific architectural openings */
    if (wallName === 'South') {
      const w = g.south_window;
      const rd = g.south_rear_door;
      elemSvg += `
        <!-- South Window -->
        <rect x="${sx(w.from_se_start_in).toFixed(1)}" y="${sy(w.head_aff_in).toFixed(1)}" width="${(w.width_in * S).toFixed(1)}" height="${((w.head_aff_in - w.sill_aff_in) * S).toFixed(1)}"
              fill="#e0f2fe" stroke="#0369a1" stroke-width="1.6"/>
        <text x="${sx(w.centerline_from_se_in).toFixed(1)}" y="${sy(76).toFixed(1)}" font-size="8.0" text-anchor="middle" font-weight="700" fill="#0369a1">${isEs ? 'VENTANA SUR' : 'SOUTH WINDOW'}</text>
        <text x="${sx(w.centerline_from_se_in).toFixed(1)}" y="${sy(70).toFixed(1)}" font-size="7.0" text-anchor="middle" fill="#0369a1">CL ${esc(toFrac16(w.centerline_from_se_in))}</text>

        <!-- Rear Door -->
        <rect x="${sx(rd.from_se_start_in).toFixed(1)}" y="${sy(rd.height_in).toFixed(1)}" width="${(rd.width_in * S).toFixed(1)}" height="${(rd.height_in * S).toFixed(1)}"
              fill="#f8fafc" stroke="#10202b" stroke-width="1.8"/>
        <text x="${sx(rd.from_se_start_in + rd.width_in / 2).toFixed(1)}" y="${sy(42).toFixed(1)}" font-size="7.4" text-anchor="middle" font-weight="700" fill="#334155">${isEs ? 'PUERTA TRASERA' : 'REAR DOOR'}</text>

        <!-- 114" / 115" Casing Line -->
        <line x1="${sx(114).toFixed(1)}" y1="${sy(ceilH).toFixed(1)}" x2="${sx(114).toFixed(1)}" y2="${(fy + 16).toFixed(1)}" stroke="#b91c1c" stroke-width="1.2" stroke-dasharray="4,2"/>
        <text x="${sx(114).toFixed(1)}" y="${(sy(ceilH) - 6).toFixed(1)}" font-size="7.2" text-anchor="middle" font-weight="700" fill="#b91c1c">114"/115" ${isEs ? 'Chambrana' : 'Casing'}</text>
      `;
    } else if (wallName === 'East') {
      /* NE Hall Opening at far right (from SE 96.875 to 126.25) + D04 subpanel hold at SE 6..38 */
      const hallStart = spanIn - g.ne_hall_opening.width_in;
      elemSvg += `
        <rect x="${sx(hallStart).toFixed(1)}" y="${sy(g.ne_hall_opening.height_in).toFixed(1)}" width="${(g.ne_hall_opening.width_in * S).toFixed(1)}" height="${(g.ne_hall_opening.height_in * S).toFixed(1)}"
              fill="#f8fafc" stroke="#15539e" stroke-width="1.8"/>
        <text x="${sx(hallStart + g.ne_hall_opening.width_in / 2).toFixed(1)}" y="${sy(44).toFixed(1)}" font-size="7.6" text-anchor="middle" font-weight="700" fill="#15539e">${isEs ? 'PASILLO 29-3/8"×84"' : 'HALL 29-3/8"×84"'}</text>
        <rect x="${sx(6).toFixed(1)}" y="${sy(77).toFixed(1)}" width="${(32 * S).toFixed(1)}" height="${(24 * S).toFixed(1)}"
              fill="#fee2e2" fill-opacity="0.55" stroke="#b91c1c" stroke-width="1.3" stroke-dasharray="4,2"/>
        <text x="${sx(22).toFixed(1)}" y="${sy(65).toFixed(1)}" font-size="7.2" text-anchor="middle" font-weight="700" fill="#b91c1c">D04 NO-SCREW 53"–77"</text>
      `;
    } else if (wallName === 'West') {
      /* Zephyr Savona Hood on West Wall (NO UPPERS) */
      const clX = (wallCabs.find((c) => c.id === 'W-B1')?.width_in || 18) + (wallCabs.find((c) => c.id === 'W-A1')?.width_in || 30) / 2;
      elemSvg += `
        <rect x="${sx(clX - 4.3125).toFixed(1)}" y="${sy(111).toFixed(1)}" width="${(8.625 * S).toFixed(1)}" height="${((111 - 77.7) * S).toFixed(1)}" fill="#e2e8f0" stroke="#10202b" stroke-width="1.4"/>
        <rect x="${sx(clX - 14.9375).toFixed(1)}" y="${sy(77.7).toFixed(1)}" width="${(29.875 * S).toFixed(1)}" height="${(10.75 * S).toFixed(1)}" fill="#cbd5e1" stroke="#10202b" stroke-width="1.7"/>
        <text x="${sx(clX).toFixed(1)}" y="${sy(71).toFixed(1)}" font-size="7.6" text-anchor="middle" font-weight="700" fill="#10202b">ZEPHYR ZSA-E30AS (NO UPPERS)</text>
      `;
    }

    /* Draw Base, Appliance, Filler & Wall Upper Boxes for this Wall at strict scaleX === scaleY */
    wallCabs.forEach((c) => {
      const isUpper = c.type === 'Wall Upper';
      if (isUpper && !layers.uppers) return;
      if (!isUpper && !layers.base) return;
      if (c.width_in === 0) return;

      const isProv = c.width_in === null;
      const wIn = isProv ? (c.provisional_width_in || 24) : Number(c.width_in);
      const hIn = isUpper
        ? (c.height_in !== null ? Number(c.height_in) : (c.provisional_height_in || 36))
        : (c.height_in !== null ? Number(c.height_in) : 36);
      const botIn = isUpper ? (c.bottom_aff_in || 55.125) : 0;
      const xStart = c.station_start_in || 0;

      const fill = isUpper
        ? (isProv ? '#fffbeb' : '#e8f1fb')
        : (c.type === 'Appliance Bay' ? '#f1f5f9' : c.type === 'Filler' ? '#fffbeb' : '#e6efe9');
      const stroke = isProv ? '#d97706' : isUpper ? '#15539e' : c.type === 'Appliance Bay' ? '#10202b' : '#2f4f42';
      const dash = isProv || isUpper ? 'stroke-dasharray="5,3"' : '';

      elemSvg += `
        <rect data-cab-id="${esc(c.id)}" data-elem="elev-${esc(c.id)}" data-provisional="${isProv}"
              x="${sx(xStart).toFixed(1)}" y="${sy(botIn + hIn).toFixed(1)}" width="${(wIn * S).toFixed(1)}" height="${(hIn * S).toFixed(1)}"
              fill="${hiFill(c.id, fill)}" fill-opacity="${isUpper ? '0.68' : '1'}" stroke="${hiStroke(c.id, stroke)}" stroke-width="${hiWidth(c.id, '1.7')}" ${dash}/>
        <text x="${sx(xStart + wIn / 2).toFixed(1)}" y="${sy(botIn + hIn / 2 + 2).toFixed(1)}" font-size="7.6" text-anchor="middle" font-weight="700" fill="${stroke}">${esc(c.id)} · ${esc(isProv ? I18N[currentLang].measure_on_site : toFrac16(wIn))}</text>
        ${isProv ? `<text x="${sx(xStart + wIn / 2).toFixed(1)}" y="${sy(botIn + hIn / 2 - 5).toFixed(1)}" font-size="6.2" text-anchor="middle" fill="#92400e">${esc(I18N[currentLang].provisional_outline)}</text>` : ''}
      `;
    });

    const ftPx = 12 * S;
    const barX = 100;
    const barY = 895;
    const pinsMarkup = buildPinsSvg();

    svgEl.innerHTML = `
      <rect x="10" y="10" width="900" height="1100" fill="#ffffff" stroke="#10202b" stroke-width="1.8"/>
      <rect x="10" y="10" width="900" height="54" fill="#f8fafc" stroke="#10202b" stroke-width="1.4"/>
      <text x="24" y="32" font-size="13.2" font-weight="700" fill="#10202b">${esc(I18N[currentLang].view_titles[wallKey])}</text>
      <text x="24" y="49" font-size="8.6" fill="#4b5c69">${esc(isEs ? state.walls[wallName].zero_corner_es : state.walls[wallName].zero_corner_en)} · ${isEs ? 'Escala Real Uniforme X = Y · Sin Precios' : 'Uniform True Scale X = Y · Zero Prices'}</text>

      <!-- Wall Outline -->
      <rect data-elem="elev-wall-outline" x="${sx(0).toFixed(1)}" y="${sy(ceilH).toFixed(1)}" width="${(spanIn * S).toFixed(1)}" height="${(ceilH * S).toFixed(1)}"
            fill="#fbfdfb" stroke="#10202b" stroke-width="2.4"/>

      ${elemSvg}

      <!-- Left & Right Corner Labels & Overall Span -->
      <text x="${sx(0).toFixed(1)}" y="${(fy + 20).toFixed(1)}" font-size="8.4" font-weight="700" fill="#b91c1c">0" ${esc(isEs ? state.walls[wallName].zero_corner_es : state.walls[wallName].zero_corner_en)}</text>
      <text x="${sx(spanIn).toFixed(1)}" y="${(fy + 20).toFixed(1)}" font-size="8.4" text-anchor="end" font-weight="700" fill="#15539e">${esc(toFrac16(spanIn))} [wall_to_wall]</text>
      <text x="${(sx(0) - 10).toFixed(1)}" y="${sy(ceilH).toFixed(1)}" font-size="7.8" text-anchor="end" font-weight="700" fill="#10202b">121-1/2"</text>
      <text x="${(sx(0) - 10).toFixed(1)}" y="${sy(36).toFixed(1)}" font-size="7.8" text-anchor="end" font-weight="700" fill="#2f4f42">36"</text>
      <text x="${(sx(0) - 10).toFixed(1)}" y="${fy.toFixed(1)}" font-size="7.8" text-anchor="end" font-weight="700" fill="#10202b">0"</text>

      <!-- Bar Scale -->
      <text x="${barX}" y="${barY - 14}" font-size="8.2" font-weight="700" fill="#10202b">${isEs ? 'ESCALA GRÁFICA ALZADO (Uniforme X = Y)' : 'ELEVATION BAR SCALE (Uniform True Scale X = Y)'}</text>
      <rect x="${barX}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 2).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#10202b" stroke="#10202b"/>
      <rect x="${(barX + ftPx * 3).toFixed(1)}" y="${barY - 6}" width="${ftPx.toFixed(1)}" height="8" fill="#ffffff" stroke="#10202b"/>
      <text x="${barX}" y="${barY + 14}" font-size="8.0" text-anchor="middle">0'</text>
      <text x="${(barX + ftPx).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">1'</text>
      <text x="${(barX + ftPx * 2).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">2'</text>
      <text x="${(barX + ftPx * 3).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">3'</text>
      <text x="${(barX + ftPx * 4).toFixed(1)}" y="${barY + 14}" font-size="8.0" text-anchor="middle">4'</text>

      ${buildTitleBlockSvg(cl, tk, isEs, stamp)}
      <g id="kfp-pins-layer">${pinsMarkup}</g>
    `;
  }

  /* ── Bidirectional Tap-to-Inspect + Live Schedule Table + Closure Strip ── */
  function selectCabinet(cabId, scrollTable) {
    selectedCabId = cabId;
    const c = state.cabinets.find((item) => item.id === cabId);
    const titleEl = document.getElementById('insp-title');
    const bodyEl = document.getElementById('insp-body');
    const es = currentLang === 'es';
    if (c && titleEl && bodyEl) {
      const label = es ? c.label_es : c.label_en;
      const note = es ? c.note_es : c.note_en;
      const wTxt = c.width_in === null ? I18N[currentLang].verify_friday : toFrac16(c.width_in);
      const stEnd = c.width_in !== null ? `${toFrac16(c.station_start_in)}–${toFrac16(c.station_start_in + c.width_in)}` : `${toFrac16(c.station_start_in)} + TBD`;
      titleEl.textContent = `${c.id} · ${label} (${c.wall} · ${c.type})`;
      bodyEl.innerHTML = `<strong>${es ? 'Estación:' : 'Station:'}</strong> ${esc(stEnd)} · <strong>${es ? 'Ancho:' : 'Width:'}</strong> ${esc(wTxt)} · <strong>${es ? 'Estado:' : 'Status:'}</strong> ${esc(c.status)}<br>${esc(note)}`;
    }
    renderSvg();
    renderScheduleTable();
    if (scrollTable) {
      const row = document.querySelector(`[data-schedule-row="${cabId}"]`);
      if (row && typeof row.scrollIntoView === 'function') {
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function updateCabinetWidth(cabId, newVal) {
    const cab = state.cabinets.find((c) => c.id === cabId);
    if (!cab || !cab.editable_width) return;
    const v = newVal === '' || newVal === null ? null : Number(newVal);
    if (v !== null && (!Number.isFinite(v) || v < 0 || v > 96)) return;
    cab.width_in = v;
    /* Coupled SE L-Corner propagation (S-B1 <-> E-B1)! */
    if (cab.coupled_id) {
      const mate = state.cabinets.find((c) => c.id === cab.coupled_id);
      if (mate) mate.width_in = v;
    }
    if (cabId === 'S-F1') {
      state.options.south_end_option = v === 12 ? '12in_cabinet' : '6in_filler_pullout';
    }
    hasUnsyncedLocalEdits = true;
    renderAll();
  }

  function renderScheduleTable() {
    const stripEl = document.getElementById('closure-strip');
    const tbody = document.getElementById('schedule-tbody');
    const pill = document.getElementById('schedule-counts-pill');
    if (!tbody) return;

    const cl = computeClosureSummary();
    const es = currentLang === 'es';
    const tr = I18N[currentLang];

    if (pill) {
      pill.textContent = `${cl.counts.Base} Base · ${cl.counts['Wall Upper']} ${es ? 'Altos' : 'Upper'} · ${cl.counts['Appliance Bay']} ${es ? 'Equipos' : 'Appliance'} · ${cl.counts.Filler} ${es ? 'Rellenos' : 'Filler'}`;
    }

    if (stripEl) {
      stripEl.innerHTML = `
        <div class="closure-card ${cl.West.ok ? 'closure-ok' : 'closure-fail'}">
          <strong>West (${es ? 'Estufa' : 'Range'}): ${esc(toFrac16(cl.West.sum))} / ${esc(toFrac16(cl.West.span))}</strong>
          <span>${es ? 'Altos: NINGUNO (Bloqueado)' : 'Wall Uppers: NONE (Locked)'}</span>
        </div>
        <div class="closure-card ${cl.South.casingClash ? 'closure-fail' : 'closure-ok'}">
          <strong>South (${es ? 'Tarja' : 'Sink'}): ${esc(toFrac16(cl.South.sum))} (+1" = ${esc(toFrac16(cl.South.withOverhang))})</strong>
          <span>${cl.South.casingClash ? (es ? 'CHOQUE chambrana 114"/115"' : 'CLASH vs 114"/115" casing') : (es ? 'Libre chambrana 114"/115"' : 'Clears 114"/115" casing')}</span>
        </div>
        <div class="closure-card ${cl.East.ok ? 'closure-ok' : 'closure-fail'}">
          <strong>East (${es ? 'Refri' : 'Fridge'}): ${esc(toFrac16(cl.East.sum))} / ${esc(toFrac16(cl.East.span))}</strong>
          <span>${es ? 'Nada sobre Haier · D04 en espera' : 'Nothing above Haier · D04 hold'}</span>
        </div>
        <div class="closure-card closure-ok">
          <strong>North (${es ? 'Abierto' : 'Open'}): 115-1/2"</strong>
          <span>${es ? 'Acceso pasillo 29-3/8"×84"' : 'NE Hall opening 29-3/8"×84"'}</span>
        </div>
      `;
    }

    const filtered = state.cabinets.filter((c) => {
      if (wallFilter !== 'ALL' && c.wall !== wallFilter) return false;
      if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;
      return true;
    });

    tbody.innerHTML = filtered.map((c) => {
      const label = es ? c.label_es : c.label_en;
      const isProv = c.width_in === null;
      const isZero = c.width_in === 0;
      const stTxt = isZero
        ? '—'
        : isProv
          ? `${toFrac16(c.station_start_in)} – TBD`
          : `${toFrac16(c.station_start_in)} – ${toFrac16(c.station_start_in + c.width_in)}`;
      const dTxt = c.depth_in === null ? 'TBD' : toFrac16(c.depth_in);
      const hTxt = c.height_in === null ? 'TBD' : toFrac16(c.height_in);
      const statusCls = c.status === 'Locked' ? 'pill-pass' : c.status === 'Open Option' ? 'pill-info' : 'pill-warn';
      const rowCls = [
        selectedCabId === c.id ? 'row-selected' : '',
        isProv ? 'row-measure' : '',
        isZero ? 'row-none' : ''
      ].filter(Boolean).join(' ');

      const sizeCell = c.editable_width
        ? `<input type="number" class="inline-width-input" data-edit-cab="${esc(c.id)}" step="0.25" min="0" max="72" value="${isProv ? '' : c.width_in}" placeholder="TBD" aria-label="Width for ${esc(c.id)}"> × ${esc(dTxt)} × ${esc(hTxt)}${isProv ? `<div style="font-size:10.5px;color:#92400e;">${esc(tr.verify_friday)}</div>` : ''}`
        : `${esc(toFrac16(c.width_in))} × ${esc(dTxt)} × ${esc(hTxt)}`;

      return `
        <tr class="${rowCls}" data-schedule-row="${esc(c.id)}">
          <td><strong>${esc(c.wall)}</strong><br><span class="boundary-tag">${esc(c.id)}</span></td>
          <td><strong>${esc(label)}</strong></td>
          <td><span class="pill pill-neutral">${esc(c.type)}</span></td>
          <td>${esc(stTxt)}</td>
          <td>${sizeCell}</td>
          <td><span class="boundary-tag">${esc(c.measure_boundary)}</span></td>
          <td><span class="pill ${statusCls}">${esc(c.status)}</span></td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-schedule-row]').forEach((trEl) => {
      trEl.addEventListener('click', (e) => {
        if (e.target && e.target.tagName === 'INPUT') return;
        selectCabinet(trEl.getAttribute('data-schedule-row'), false);
      });
    });

    tbody.querySelectorAll('[data-edit-cab]').forEach((inp) => {
      inp.addEventListener('change', () => {
        updateCabinetWidth(inp.getAttribute('data-edit-cab'), inp.value.trim());
      });
    });
  }

  /* ── Render Status Pills, Clashes, Wrap-Around Takeoff, Pins & EOD ── */
  function renderStatusPills() {
    const cl = computeClosureSummary();
    const tr = I18N[currentLang];
    const es = currentLang === 'es';

    const wPill = document.getElementById('walkway-pill');
    if (wPill) {
      wPill.className = `pill ${cl.walkways.narrowest < 32 ? 'pill-fail' : 'pill-pass'}`;
      wPill.textContent = `${es ? 'Paso Libre Mín.' : 'Narrowest Walkway'}: ${toFrac16(cl.walkways.narrowest)}`;
    }
    const cPill = document.getElementById('casing-pill');
    if (cPill) {
      cPill.className = `pill ${cl.South.casingClash ? 'pill-fail' : 'pill-pass'}`;
      cPill.textContent = cl.South.casingClash
        ? (es ? `Chambrana Sur: CHOQUE (${toFrac16(cl.South.withOverhang)} > 114")` : `South Casing: CLASH (${toFrac16(cl.South.withOverhang)} > 114")`)
        : (es ? `Chambrana Sur: CUMPLE (${toFrac16(cl.South.withOverhang)} <= 114")` : `South Casing: PASS (${toFrac16(cl.South.withOverhang)} <= 114")`);
    }
    const uPill = document.getElementById('uppers-pill');
    if (uPill) uPill.textContent = es ? 'Altos Muro Oeste: NINGUNO (Fijo)' : 'West Wall Uppers: NONE (Locked)';

    const revBadge = document.getElementById('rev-badge');
    if (revBadge) revBadge.textContent = state.base_rev || 'rev-20261120-kitchen-fp-001';

    const syncPill = document.getElementById('sync-stamp-pill');
    if (syncPill) {
      syncPill.className = `pill ${hasUnsyncedLocalEdits ? 'pill-warn' : 'pill-pass'}`;
      syncPill.textContent = computeRevisionStamp();
    }

    const tailBadge = document.getElementById('tailnet-badge');
    const saveBtn = document.getElementById('btn-save-tailnet');
    const saveHint = document.getElementById('save-hint');
    if (tailnetState.verified) {
      if (tailBadge) { tailBadge.className = 'pill pill-pass'; tailBadge.textContent = `${tr.tailnet_live}${tailnetState.user ? ' · ' + tailnetState.user : ''}`; }
      if (saveBtn) saveBtn.disabled = false;
      if (saveHint) saveHint.textContent = tr.save_hint_on;
    } else {
      if (tailBadge) { tailBadge.className = 'pill pill-neutral'; tailBadge.textContent = tr.tailnet_off; }
      if (saveBtn) saveBtn.disabled = true;
      if (saveHint) saveHint.textContent = tr.save_hint_off;
    }

    /* Update 6" vs 12" & Sink basis buttons */
    const sF1 = state.cabinets.find((c) => c.id === 'S-F1');
    const is12 = sF1 && Number(sF1.width_in) === 12;
    document.getElementById('btn-opt-6')?.classList.toggle('btn-primary', !is12);
    document.getElementById('btn-opt-12')?.classList.toggle('btn-primary', is12);
    const is72 = state.options.south_sink_basis === 'john_72_102';
    document.getElementById('btn-sink-75')?.classList.toggle('btn-essex', !is72);
    document.getElementById('btn-sink-72')?.classList.toggle('btn-essex', is72);
  }

  function renderClashes() {
    const grid = document.getElementById('clashes-grid');
    if (!grid) return;
    grid.innerHTML = BASELINE_KITCHEN_FP.flagged_clashes.map((c) => {
      const sevCls = c.severity === 'MEDIUM' ? 'sev-medium' : '';
      const pillCls = c.severity === 'MEDIUM' ? 'pill-warn' : 'pill-fail';
      const title = currentLang === 'es' ? c.title_es : c.title_en;
      const body = currentLang === 'es' ? c.es : c.en;
      return `
        <article class="clash-card ${sevCls}" data-clash-id="${esc(c.id)}">
          <div class="clash-card-head">
            <span><strong>${esc(title)}</strong></span>
            <span class="pill ${pillCls}">${esc(c.severity)}</span>
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
    const es = currentLang === 'es';
    if (pill) pill.textContent = `${es ? 'Margen' : 'Waste Factor'}: +${tk.waste_pct}%`;

    const boxTxt = tk.tile_boxes_proposed !== null
      ? (es ? `<strong>${tk.tile_boxes_proposed} cajas</strong> (${tk.tile_box_sqft} pies²/caja)` : `<strong>${tk.tile_boxes_proposed} boxes</strong> (${tk.tile_box_sqft} sq ft/box)`)
      : (es ? 'Ingresa pies²/caja arriba para cajas' : 'Enter sq ft/box above for cartons');

    grid.innerHTML = `
      <article class="takeoff-card card-primary">
        <div class="takeoff-card-title">${es ? 'Azulejo Combinado (Oeste + Sur + Este)' : 'Combined Wrap-Around Wall Tile'}</div>
        <div class="takeoff-card-big">${tk.tile_gross_sqft} sq ft</div>
        <div class="takeoff-card-sub">${es ? 'Neto' : 'Net'}: ${tk.tile_net_sqft} sq ft (W ${tk.west_tile_sqft} + S ${tk.south_tile_sqft} + E ${tk.east_tile_sqft})</div>
        <div class="takeoff-card-sub">${boxTxt}</div>
      </article>

      <article class="takeoff-card">
        <div class="takeoff-card-title">${es ? 'Respaldo Cemento 0.42" (3\'×5\')' : '0.42" HardieBacker 500 (3\'×5\')'}</div>
        <div class="takeoff-card-big">${tk.backer_sheets_3x5} ${es ? 'hojas' : 'sheets'}</div>
        <div class="takeoff-card-sub">${es ? 'Incluye +10% corte en muros azulejados' : 'Includes +10% cut allowance across tiled runs'}</div>
      </article>

      <article class="takeoff-card">
        <div class="takeoff-card-title">${es ? 'Área Viva de Cubierta (Piedra)' : 'Live Countertop Surface Area'}</div>
        <div class="takeoff-card-big">~${tk.countertop_net_sqft} sq ft</div>
        <div class="takeoff-card-sub">${es ? 'Se actualiza al cambiar 6" vs 12" o cajas (plantillar tras nivelar)' : 'Updates live with 6" vs 12" & box edits (template after leveling)'}</div>
      </article>

      <article class="takeoff-card">
        <div class="takeoff-card-title">${es ? 'Conteo Vivo de Gabinetes (0 Precios)' : 'Live Cabinet Counts (Zero Prices)'}</div>
        <div class="takeoff-card-big">${tk.cabinet_counts.Base} Base · ${tk.cabinet_counts['Wall Upper']} ${es ? 'Altos' : 'Upper'}</div>
        <div class="takeoff-card-sub">${tk.cabinet_counts['Appliance Bay']} ${es ? 'Equipos' : 'Appliances'} · ${tk.cabinet_counts.Filler} ${es ? 'Rellenos' : 'Fillers'} · ${es ? 'Oeste: 0 altos' : 'West: 0 uppers'}</div>
      </article>
    `;
  }

  /* ── Attached Comment Callouts (Per-Comment Mic + Send to Agent) ──── */
  function buildLocalFallbackAnswer(qText) {
    const q = String(qText || '').toLowerCase();
    const cl = computeClosureSummary();
    const es = currentLang === 'es';
    if (q.includes('fridge') || q.includes('refri') || q.includes('upper') || q.includes('alto')) {
      return es
        ? 'Muro Oeste (estufa) lleva CERO gabinetes altos (fijo) y el refrigerador Haier en Muro Este lleva NADA arriba (fijo). Los altos en Este/Sur siguen opcionales hasta maqueta del viernes.'
        : 'West range wall has ZERO wall uppers (locked) and the East Haier fridge has NOTHING above it (locked). East/South wall uppers remain optional pending Friday mockup.';
    }
    if (q.includes('walk') || q.includes('paso') || q.includes('12') || q.includes('6')) {
      return es
        ? `Con la configuración actual, el paso libre más angosto (con vuelo de cubierta) es ${toFrac16(cl.walkways.narrowest)} y el tramo Sur con vuelo mide ${toFrac16(cl.South.withOverhang)} frente a 114"/115" de chambrana.`
        : `With current boxes, narrowest clear walkway (including overhang) is ${toFrac16(cl.walkways.narrowest)}, and South run + 1" overhang is ${toFrac16(cl.South.withOverhang)} vs 114"/115" casing.`;
    }
    return es
      ? 'Fuera de Tailnet: conéctate a Tailscale de Tisa para consultar al Agente Unidad 4 en vivo (:8791), o conserva tu comentario en la exportación local.'
      : 'Off-tailnet: connect to Tisa\'s Tailscale network to query the live Unit 4 Agent (:8791), or keep this note in your local export.';
  }

  async function sendPinToAgent(idx) {
    const pin = (state.pins || [])[idx];
    if (!pin) return;
    const tr = I18N[currentLang];
    const es = currentLang === 'es';
    const text = (pin.note || '').trim();
    if (!text) { showToast(es ? 'Escribe o dicta un comentario primero.' : 'Enter or dictate a comment first.', 'error'); return; }
    if (violatesPrivateFirewall(text)) { showToast(tr.firewall_err, 'error'); return; }

    const mode = pin.mode || (pin.intent === 'ask_question' ? 'ask_question' : 'modify_plan');
    if (mode === 'ask_question') {
      try {
        const res = await fetchJsonWithTimeout(`${voiceOrigin}/api/unit4/knowledge?q=${encodeURIComponent(text)}&room=kitchen`, { method: 'GET' }, 4500);
        if (res.ok && res.data) {
          pin.agent_status = 'answered';
          pin.agent_reply = String(res.data.answer || res.data.summary || (Array.isArray(res.data.matches) && res.data.matches[0]?.snippet) || JSON.stringify(res.data).slice(0, 260));
          renderSvg();
          renderPinsList();
          showToast(es ? `Comentario #${idx + 1} respondido` : `Comment #${idx + 1} answered`, 'ok');
          return;
        }
      } catch (_) { /* graceful off-tailnet fallback */ }
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
      pin.agent_reply = es ? 'Aplicado en vista previa local. Conéctate a Tailscale de Tisa para enviar en vivo (:8444).' : 'Applied in local preview only. Connect to Tisa\'s Tailscale network to send live (:8444).';
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
    if (!pins.length) { listEl.innerHTML = ''; return; }
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
      items.push(`<div class="eod-item"><div class="eod-item-head"><strong>${esc(tr.not_yet_synced)}</strong><span class="pill pill-warn">LOCAL</span></div><div>${currentLang === 'es' ? 'Cambios en vista local. Conéctate a Tailnet (:8444) y guarda en vivo.' : 'Edits in local preview. Connect to Tailnet (:8444) and tap Save Live.'}</div></div>`);
    }
    pending.forEach((entry) => {
      const revId = entry.rev_id || entry.id || 'pending-rev';
      items.push(`
        <div class="eod-item">
          <div class="eod-item-head"><strong><code>${esc(revId)}</code> · ${esc(entry.author || 'Field')}</strong><span class="pill pill-warn">PENDING EOD</span></div>
          <div>${esc(entry.summary || entry.note_en || entry.note_es || '')}</div>
          <div class="eod-item-actions">
            <button type="button" class="btn btn-sm btn-essex" data-eod-action="accept" data-rev-id="${esc(revId)}" ${tailnetState.verified ? '' : 'disabled'}>${esc(tr.btn_accept)}</button>
            <button type="button" class="btn btn-sm btn-danger" data-eod-action="reject" data-rev-id="${esc(revId)}" ${tailnetState.verified ? '' : 'disabled'}>${esc(tr.btn_reject)}</button>
          </div>
        </div>`);
    });
    listEl.innerHTML = items.length ? items.join('') : `<p class="empty-note">${esc(tr.eod_empty)}</p>`;
    listEl.querySelectorAll('[data-eod-action]').forEach((btn) => {
      btn.addEventListener('click', () => handleEodAction(btn.getAttribute('data-rev-id'), btn.getAttribute('data-eod-action')));
    });
  }

  function syncFormFromState() {
    ensureStateDefaults(state);
    const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v === null || v === undefined ? '' : String(v); };
    setVal('inp-floor-t', state.room_geometry.floor_buildup_t_in.value);
    const trim = state.existing_original_trim;
    setVal('inp-trim-baseboard', trim.baseboard_height_in.value);
    setVal('inp-trim-rail', trim.high_picture_rail_height_in.value);
    setVal('inp-trim-door-casing', trim.door_casing_width_in.value);
    setVal('inp-trim-win-casing', trim.window_casing_width_in.value);
    const tk = state.takeoff_settings;
    setVal('inp-waste-pct', tk.waste_pct);
    setVal('inp-box-sqft', tk.tile_box_sqft);
    const cS = document.getElementById('chk-south-tile'); if (cS) cS.checked = !!tk.include_south_backsplash;
    const cE = document.getElementById('chk-east-tile'); if (cE) cE.checked = !!tk.include_east_backsplash;
    document.getElementById('btn-waste-10')?.classList.toggle('btn-primary', Number(tk.waste_pct) === 10);
    document.getElementById('btn-waste-15')?.classList.toggle('btn-primary', Number(tk.waste_pct) === 15);
  }

  function applyUiLanguage() {
    const tr = I18N[currentLang];
    document.documentElement.lang = currentLang;
    document.title = tr.doc_title;
    const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    const setHtml = (id, h) => { const el = document.getElementById(id); if (el) el.innerHTML = h; };

    setText('hdr-title', tr.hdr_title);
    setText('hdr-sub', tr.hdr_sub);
    setText('link-back-room', tr.back_room);
    setText('link-west-hood', tr.jump_west_hood);
    setText('link-west-hood-top', tr.jump_west_hood);
    setText('btn-lang', tr.btn_lang);
    setText('btn-circle-toggle', circleMode ? tr.btn_circle_off : tr.btn_circle_on);
    setText('btn-export-svg', tr.btn_export_svg);
    setText('btn-download-pdf', tr.btn_download_pdf);
    setHtml('hold-banner', tr.hold_html);
    setText('conflict-text', tr.conflict_text);
    setText('btn-reload-latest', tr.btn_reload);
    setText('svg-panel-title', tr.view_titles[activeView]);

    ['floor', 'west', 'south', 'east', 'north'].forEach((v) => {
      const btn = document.getElementById(`tab-${v}`);
      if (btn) {
        btn.textContent = tr.tabs[v];
        btn.classList.toggle('active', activeView === v);
        btn.setAttribute('aria-selected', String(activeView === v));
      }
    });

    setText('tgl-base', tr.tgl_base);
    setText('tgl-uppers', tr.tgl_uppers);
    setText('tgl-swings', tr.tgl_swings);
    setText('tgl-utilities', tr.tgl_utilities);
    document.getElementById('tgl-base')?.classList.toggle('on', layers.base);
    document.getElementById('tgl-uppers')?.classList.toggle('on', layers.uppers);
    document.getElementById('tgl-swings')?.classList.toggle('on', layers.swings);
    document.getElementById('tgl-utilities')?.classList.toggle('on-alert', layers.utilities);

    setText('lbl-south-opt', tr.lbl_south_opt);
    setText('btn-opt-6', tr.btn_opt_6);
    setText('btn-opt-12', tr.btn_opt_12);
    setText('lbl-sink-basis', tr.lbl_sink_basis);
    setText('btn-sink-75', tr.btn_sink_75);
    setText('btn-sink-72', tr.btn_sink_72);
    setText('btn-reset-baseline', tr.btn_reset);
    setText('scale-pill', currentLang === 'es' ? 'Escala Real 1:1 (X = Y)' : 'True Scale 1:1 (X = Y)');
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
    setText('schedule-title', tr.schedule_title);
    setText('th-wall', tr.th_wall);
    setText('th-label', tr.th_label);
    setText('th-type', tr.th_type);
    setText('th-station', tr.th_station);
    setText('th-size', tr.th_size);
    setText('th-boundary', tr.th_boundary);
    setText('th-status', tr.th_status);
    setText('clashes-title', tr.clashes_title);
    setText('clashes-lock-pill', tr.clashes_lock_pill);
    setText('takeoff-title', tr.takeoff_title);
    setText('takeoff-notice', tr.takeoff_notice);
    setText('lbl-waste-pct', tr.lbl_waste_pct);
    setText('btn-waste-10', tr.btn_waste_10);
    setText('btn-waste-15', tr.btn_waste_15);
    setText('lbl-box-sqft', tr.lbl_box_sqft);
    setText('lbl-south-tile', tr.lbl_south_tile);
    setText('lbl-east-tile', tr.lbl_east_tile);
    setText('trim-title', tr.trim_title);
    setText('trim-badge', tr.trim_badge);
    setText('trim-rule-note', currentLang === 'es' ? state.existing_original_trim.preservation_rule_es : state.existing_original_trim.preservation_rule_en);
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

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (tr[k]) el.textContent = tr[k];
    });
    const noteEl = document.getElementById('inp-voice-note');
    if (noteEl) noteEl.placeholder = tr.note_placeholder;
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
    renderScheduleTable();
    renderClashes();
    renderTakeoff();
    renderPinsList();
    renderEodDrawer();
  }

  /* ── Local Patch Application ──────────────────────────────────────── */
  function applyPatchToLocalState(patch) {
    if (!patch || typeof patch !== 'object') return;
    ensureStateDefaults(state);
    if (patch.options) {
      if (patch.options.south_end_option) {
        state.options.south_end_option = patch.options.south_end_option;
        const sF1 = state.cabinets.find((c) => c.id === 'S-F1');
        if (sF1) sF1.width_in = patch.options.south_end_option === '12in_cabinet' ? 12.0 : 6.0;
      }
      if (patch.options.south_sink_basis) {
        state.options.south_sink_basis = patch.options.south_sink_basis;
      }
    }
    if (patch.cabinet_widths && typeof patch.cabinet_widths === 'object') {
      Object.keys(patch.cabinet_widths).forEach((cid) => {
        const cab = state.cabinets.find((c) => c.id === cid);
        if (cab && cab.editable_width) {
          cab.width_in = patch.cabinet_widths[cid];
          if (cab.coupled_id) {
            const mate = state.cabinets.find((m) => m.id === cab.coupled_id);
            if (mate) mate.width_in = patch.cabinet_widths[cid];
          }
        }
      });
    }
    if (patch.existing_original_trim) {
      Object.keys(patch.existing_original_trim).forEach((k) => {
        if (state.existing_original_trim[k] && typeof state.existing_original_trim[k] === 'object') {
          Object.assign(state.existing_original_trim[k], patch.existing_original_trim[k]);
        }
      });
    }
    if (patch.takeoff_settings) {
      Object.assign(state.takeoff_settings, patch.takeoff_settings);
    }
    if (patch.pin) {
      state.pins = state.pins || [];
      state.pins.push(patch.pin);
    }
    state.flagged_clashes = deepClone(BASELINE_KITCHEN_FP.flagged_clashes);
    hasUnsyncedLocalEdits = true;
    syncFormFromState();
    renderAll();
  }

  /* ── Circle-to-Correct Canvas & Voice ─────────────────────────────── */
  function syncCanvasSize() {
    const svg = document.getElementById('kitchen-fp-svg');
    const canvas = document.getElementById('kitchen-fp-sketch-canvas');
    if (!svg || !canvas) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h; redrawCanvasStroke();
    }
  }

  function redrawCanvasStroke() {
    const canvas = document.getElementById('kitchen-fp-sketch-canvas');
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
      const x = pt.nx * canvas.width, y = pt.ny * canvas.height;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
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
    const canvas = document.getElementById('kitchen-fp-sketch-canvas');
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
    const canvas = document.getElementById('kitchen-fp-sketch-canvas');
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
          if (p.nx < minX) minX = p.nx; if (p.nx > maxX) maxX = p.nx;
          if (p.ny < minY) minY = p.ny; if (p.ny > maxY) maxY = p.ny;
        });
        pendingCircleNorm = { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, rx: Math.max(0.025, (maxX - minX) / 2), ry: Math.max(0.02, (maxY - minY) / 2) };
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

  function parseSpokenFieldCommand(text) {
    const s = String(text || '').toLowerCase();
    if (/(12\s*(?:inch|in|pulg|")|twelve)/.test(s) && /(south|sur|box|cab|filler|gabinete|caja|relleno)/.test(s)) {
      return { options: { south_end_option: '12in_cabinet' } };
    }
    if (/(6\s*(?:inch|in|pulg|")|six)/.test(s) && /(south|sur|filler|pullout|relleno)/.test(s)) {
      return { options: { south_end_option: '6in_filler_pullout' } };
    }
    if (/72/.test(s) && /(sink|tarja|tape|cinta)/.test(s)) {
      return { options: { south_sink_basis: 'john_72_102' } };
    }
    if (/75/.test(s) && /(sink|tarja|window|ventana)/.test(s)) {
      return { options: { south_sink_basis: 'nov2_75_105' } };
    }
    return null;
  }

  function toggleVoiceDictation(targetPinIdx) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const statusEl = document.getElementById('voice-status');
    const tr = I18N[currentLang];
    const pinIdx = typeof targetPinIdx === 'number' && Number.isFinite(targetPinIdx) ? targetPinIdx : null;
    if (!SpeechRec) { if (statusEl) statusEl.textContent = tr.voice_unsupported; showToast(tr.voice_unsupported, 'error'); return; }
    if (speechListening && speechRecognition) { speechRecognition.stop(); return; }
    speechTargetPinIdx = pinIdx;
    speechRecognition = new SpeechRec();
    speechRecognition.lang = currentLang === 'es' ? 'es-MX' : 'en-US';
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.onstart = () => {
      speechListening = true;
      const btn = document.getElementById('btn-dictate');
      if (btn && speechTargetPinIdx === null) { btn.classList.add('btn-active'); btn.textContent = tr.btn_dictate_stop; }
    };
    speechRecognition.onresult = (evt) => {
      const transcript = evt.results?.[0]?.[0]?.transcript || '';
      if (speechTargetPinIdx !== null && state.pins[speechTargetPinIdx] && transcript) {
        const cur = (state.pins[speechTargetPinIdx].note || '').trim();
        state.pins[speechTargetPinIdx].note = cur ? `${cur} ${transcript}` : transcript;
        renderSvg(); renderPinsList();
      } else {
        const box = document.getElementById('inp-voice-note');
        if (box && transcript) box.value = box.value ? `${box.value.trim()} ${transcript}` : transcript;
      }
    };
    speechRecognition.onend = () => {
      speechListening = false; speechTargetPinIdx = null;
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
    } finally { clearTimeout(timer); }
  }

  async function hydrateFromLocalJson() {
    if (window.location.protocol === 'file:') return;
    const candidates = ['../kitchen-cabinet-schedule.json', '../../content/data/kitchen-cabinet-schedule.json'];
    for (let i = 0; i < candidates.length; i++) {
      try {
        const res = await fetch(candidates[i], { cache: 'no-store' });
        if (!res.ok) continue;
        const data = await res.json();
        if (data && Array.isArray(data.cabinets)) {
          state = ensureStateDefaults(deepClone(data));
          return;
        }
      } catch (_) { /* try next */ }
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
        tailnetState.online = false; tailnetState.verified = false;
      }
    } catch (_) {
      tailnetState.online = false; tailnetState.verified = false;
    }
    syncFormFromState();
    renderAll();
  }

  async function saveOverrideToTailnet(patch, noteText) {
    const tr = I18N[currentLang];
    if (!tailnetState.verified) { showToast(tr.save_hint_off, 'error'); return false; }
    if (violatesPrivateFirewall(noteText) || violatesPrivateFirewall(JSON.stringify(patch))) { showToast(tr.firewall_err, 'error'); return false; }
    const author = document.getElementById('inp-author')?.value || tailnetState.user || 'Field';
    try {
      const res = await fetchJsonWithTimeout(`${apiOrigin}${PLAN_ENDPOINT_BASE}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_rev: state.base_rev, author, patch, note_en: currentLang === 'en' ? (noteText || '') : '', note_es: currentLang === 'es' ? (noteText || '') : '' })
      }, 6000);
      if (res.status === 409) { document.getElementById('conflict-banner').hidden = false; showToast(tr.conflict_text, 'error'); return false; }
      if (res.status === 400) { showToast(res.data?.error || tr.firewall_err, 'error'); return false; }
      if (res.status === 403) { tailnetState.verified = false; renderStatusPills(); showToast(tr.save_hint_off, 'error'); return false; }
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
      if (res.status === 409) { document.getElementById('conflict-banner').hidden = false; showToast(I18N[currentLang].conflict_text, 'error'); return; }
      if (res.ok && res.data && res.data.ok) { await checkTailnetAndLoad(); showToast(`${action.toUpperCase()} ${revId}`, 'ok'); }
    } catch (err) { showToast(`EOD error: ${err.message}`, 'error'); }
  }

  /* ── Exports & Smart Cross-Plan Jump Links ────────────────────────── */
  function resolveCrossLinks() {
    const isWikiPlans = /\/plans\//.test(window.location.pathname || '');
    const backEl = document.getElementById('link-back-room');
    const hoodTop = document.getElementById('link-west-hood-top');
    const hoodHead = document.getElementById('link-west-hood');
    const backHref = isWikiPlans ? '../../#kitchen' : '../../index.html#kitchen';
    const hoodHref = isWikiPlans ? '../kitchen-west-ks4/index.html' : '../interactive-pilot/index.html';
    if (backEl) backEl.href = backHref;
    if (hoodTop) hoodTop.href = hoodHref;
    if (hoodHead) hoodHead.href = hoodHref;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportLiveSvg() {
    const svgEl = document.getElementById('kitchen-fp-svg');
    if (!svgEl) return;
    const raw = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svgEl);
    downloadBlob(new Blob([raw], { type: 'image/svg+xml;charset=utf-8' }), `U4_kitchen-floor-plan_${activeView}_${currentLang.toUpperCase()}.svg`);
  }

  function exportLocalJson() {
    const out = deepClone(state);
    out.closure_summary = computeClosureSummary();
    out.takeoff = computeTakeoff();
    out.revision_stamp = computeRevisionStamp();
    out.exported_at = new Date().toISOString();
    downloadBlob(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json;charset=utf-8' }), `kitchen-cabinet-schedule_${currentLang.toUpperCase()}.json`);
  }

  function triggerPdfExport() {
    if (window.U4PlanPdfExport && typeof window.U4PlanPdfExport.exportPdf === 'function') window.U4PlanPdfExport.exportPdf();
    else if (window.U4KS4PdfExport && typeof window.U4KS4PdfExport.exportPdf === 'function') window.U4KS4PdfExport.exportPdf();
    else window.print();
  }

  /* ── Wire Controls ────────────────────────────────────────────────── */
  function wireControls() {
    document.getElementById('btn-lang')?.addEventListener('click', () => { currentLang = currentLang === 'en' ? 'es' : 'en'; renderAll(); });
    document.getElementById('btn-circle-toggle')?.addEventListener('click', () => setCircleMode(!circleMode));
    document.getElementById('btn-circle-done')?.addEventListener('click', () => setCircleMode(false));
    document.getElementById('btn-clear-sketch')?.addEventListener('click', clearSketch);
    document.getElementById('btn-export-svg')?.addEventListener('click', exportLiveSvg);
    document.getElementById('btn-download-pdf')?.addEventListener('click', triggerPdfExport);
    document.getElementById('btn-export-json')?.addEventListener('click', exportLocalJson);
    document.getElementById('btn-reload-latest')?.addEventListener('click', checkTailnetAndLoad);
    document.getElementById('btn-refresh-eod')?.addEventListener('click', checkTailnetAndLoad);

    ['floor', 'west', 'south', 'east', 'north'].forEach((v) => {
      document.getElementById(`tab-${v}`)?.addEventListener('click', () => { activeView = v; renderAll(); });
    });

    const wireLayerBtn = (id, key) => {
      document.getElementById(id)?.addEventListener('click', () => {
        layers[key] = !layers[key];
        document.getElementById(id)?.setAttribute('aria-pressed', String(layers[key]));
        renderAll();
      });
    };
    wireLayerBtn('tgl-base', 'base');
    wireLayerBtn('tgl-uppers', 'uppers');
    wireLayerBtn('tgl-swings', 'swings');
    wireLayerBtn('tgl-utilities', 'utilities');

    document.getElementById('btn-opt-6')?.addEventListener('click', () => applyPatchToLocalState({ options: { south_end_option: '6in_filler_pullout' } }));
    document.getElementById('btn-opt-12')?.addEventListener('click', () => applyPatchToLocalState({ options: { south_end_option: '12in_cabinet' } }));
    document.getElementById('btn-sink-75')?.addEventListener('click', () => applyPatchToLocalState({ options: { south_sink_basis: 'nov2_75_105' } }));
    document.getElementById('btn-sink-72')?.addEventListener('click', () => applyPatchToLocalState({ options: { south_sink_basis: 'john_72_102' } }));

    document.getElementById('btn-reset-baseline')?.addEventListener('click', () => {
      state = deepClone(BASELINE_KITCHEN_FP);
      selectedCabId = null; hasUnsyncedLocalEdits = false; lastSavedRevId = null;
      clearSketch(); syncFormFromState(); renderAll();
      showToast(currentLang === 'es' ? 'Restaurado a base inicial' : 'Reset to baseline', 'ok');
    });

    document.querySelectorAll('[data-wall-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        wallFilter = btn.getAttribute('data-wall-filter');
        document.querySelectorAll('[data-wall-filter]').forEach((b) => b.classList.toggle('btn-primary', b === btn));
        renderScheduleTable();
      });
    });
    document.getElementById('sel-type-filter')?.addEventListener('change', (e) => { typeFilter = e.target.value; renderScheduleTable(); });

    document.getElementById('btn-waste-10')?.addEventListener('click', () => applyPatchToLocalState({ takeoff_settings: { waste_pct: 10 } }));
    document.getElementById('btn-waste-15')?.addEventListener('click', () => applyPatchToLocalState({ takeoff_settings: { waste_pct: 15 } }));
    document.getElementById('inp-waste-pct')?.addEventListener('input', (e) => {
      const n = Number(e.target.value);
      if (Number.isFinite(n)) applyPatchToLocalState({ takeoff_settings: { waste_pct: Math.max(0, Math.min(35, n)) } });
    });
    document.getElementById('inp-box-sqft')?.addEventListener('input', (e) => {
      const raw = e.target.value.trim(); const val = raw === '' ? null : Number(raw);
      applyPatchToLocalState({ takeoff_settings: { tile_box_sqft: Number.isFinite(val) && val > 0 ? val : null } });
    });
    document.getElementById('chk-south-tile')?.addEventListener('change', (e) => applyPatchToLocalState({ takeoff_settings: { include_south_backsplash: !!e.target.checked } }));
    document.getElementById('chk-east-tile')?.addEventListener('change', (e) => applyPatchToLocalState({ takeoff_settings: { include_east_backsplash: !!e.target.checked } }));

    document.getElementById('inp-floor-t')?.addEventListener('input', (e) => {
      const n = Number(e.target.value);
      if (Number.isFinite(n)) { state.room_geometry.floor_buildup_t_in.value = n; hasUnsyncedLocalEdits = true; renderAll(); }
    });
    const wireTrim = (id, key, allowNull) => {
      document.getElementById(id)?.addEventListener('input', (e) => {
        const raw = e.target.value.trim(); const val = raw === '' ? null : Number(raw);
        if (val === null && !allowNull) return;
        const upd = {}; upd[key] = { value: val !== null && Number.isFinite(val) ? val : null, verified: val === null ? 'MEASURE_ON_SITE' : 'FIELD_UPDATE_PENDING_EOD' };
        applyPatchToLocalState({ existing_original_trim: upd });
      });
    };
    wireTrim('inp-trim-baseboard', 'baseboard_height_in', false);
    wireTrim('inp-trim-rail', 'high_picture_rail_height_in', false);
    wireTrim('inp-trim-door-casing', 'door_casing_width_in', true);
    wireTrim('inp-trim-win-casing', 'window_casing_width_in', true);

    document.getElementById('btn-save-tailnet')?.addEventListener('click', async () => {
      const note = document.getElementById('inp-voice-note')?.value?.trim() || '';
      const widths = {};
      state.cabinets.filter((c) => c.editable_width).forEach((c) => { widths[c.id] = c.width_in; });
      await saveOverrideToTailnet({ options: state.options, cabinet_widths: widths, existing_original_trim: state.existing_original_trim }, note);
    });

    document.getElementById('btn-dictate')?.addEventListener('click', () => toggleVoiceDictation(null));
    document.getElementById('btn-apply-note')?.addEventListener('click', async () => {
      const noteInput = document.getElementById('inp-voice-note');
      const note = (noteInput?.value || '').trim();
      if (!note && !pendingCircleNorm) { showToast(currentLang === 'es' ? 'Agrega una nota o dibuja un círculo.' : 'Enter a note or draw a circle first.', 'error'); return; }
      if (violatesPrivateFirewall(note)) { showToast(I18N[currentLang].firewall_err, 'error'); return; }
      const author = document.getElementById('inp-author')?.value || tailnetState.user || 'Field';
      const intent = document.getElementById('sel-pin-intent')?.value || 'propose_edit';
      const mode = intent === 'ask_question' ? 'ask_question' : 'modify_plan';
      const parsedCmd = mode === 'modify_plan' ? parseSpokenFieldCommand(note) : null;
      const patch = parsedCmd ? deepClone(parsedCmd) : {};
      const pt = pendingCircleNorm || { cx: 0.30, cy: 0.48, rx: 0.035, ry: 0.025 };
      patch.pin = {
        cx: Number(pt.cx.toFixed(4)), cy: Number(pt.cy.toFixed(4)),
        rx: Number(pt.rx.toFixed(4)), ry: Number(pt.ry.toFixed(4)),
        intent, mode, author, note: note || (currentLang === 'es' ? 'Punto marcado en planta' : 'Circled spot on floor plan'),
        agent_status: 'draft', agent_reply: '', created_at: new Date().toISOString()
      };
      if (note) patch.voice_note = note;
      applyPatchToLocalState(patch);
      if (noteInput) noteInput.value = '';
      clearSketch(); setCircleMode(false);
      const newIdx = (state.pins || []).length - 1;
      if (mode === 'ask_question' && newIdx >= 0) await sendPinToAgent(newIdx);
      else if (tailnetState.verified) {
        const ok = await saveOverrideToTailnet(patch, note);
        if (ok && state.pins[newIdx]) { state.pins[newIdx].agent_status = 'sent_applied'; renderAll(); }
      } else showToast(currentLang === 'es' ? 'Comentario adjunto con línea guía (vista local)' : 'Attached comment pin with leader line (local preview)', 'ok');
    });
  }

  /* ── Unified Public Integration Contract (window.U4PLAN) ──────────── */
  window.U4PLAN = {
    planId: 'kitchen-floor-plan',
    getSvgElement() { return document.getElementById('kitchen-fp-svg'); },
    getState() { return deepClone(state); },
    getClosureSummary() { return computeClosureSummary(); },
    getTakeoff() { return computeTakeoff(); },
    getScaleInfo() { return deepClone(lastScaleInfo); },
    getView() { return activeView; },
    setView(v) { if (['floor', 'west', 'south', 'east', 'north'].includes(v)) { activeView = v; renderAll(); } },
    getLang() { return currentLang; },
    setLang(l) { if (l === 'en' || l === 'es') { currentLang = l; renderAll(); } },
    getRevisionStamp() { return computeRevisionStamp(); },
    getAnnotationDataUrl() {
      const canvas = document.getElementById('kitchen-fp-sketch-canvas');
      if (!canvas || !drawPoints.length) return null;
      try { return canvas.toDataURL('image/png'); } catch (_) { return null; }
    },
    applyLocalPatch(patch) { applyPatchToLocalState(patch); },
    render() { renderAll(); }
  };

  async function boot() {
    if (params.get('print') === '1') document.body.classList.add('print-mode');
    resolveCrossLinks();
    initCircleCanvas();
    wireControls();
    await hydrateFromLocalJson();
    syncFormFromState();
    renderAll();
    await checkTailnetAndLoad();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
