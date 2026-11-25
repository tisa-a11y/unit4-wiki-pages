/* Unit 4 Kitchen — Coupled Interactive Kitchen Electrical Plan (Module 6 / Wave D)
   Self-contained, offline-first, true-to-scale (scaleX === scaleY) parametric SVG engine.
   6 Coupled Views: Floor & Cable Routes | South Sink Wall | East Fridge / D04 (+ Dining Flip) |
                    West Range / HD-1 | North Entry Wall | Interactive D04 20-Space Panel Schedule.
   Zero external CDN dependencies · Zero browser storage · Strictly Zero Prices · Plain Crew EN/ES. */

(function () {
  'use strict';

  const PLAN_ID = 'kitchen-electrical';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const DEFAULT_API_ORIGIN = 'https://mac-mini.tailcf4007.ts.net:8444';
  const DEFAULT_VOICE_ORIGIN = 'https://mac-mini.tailcf4007.ts.net:8791';

  /* Private-data & zero-price firewall (mirrors backend :8444 & sibling plans) */
  function violatesPrivateFirewall(text) {
    if (!text) return false;
    const s = String(text);
    const blockedMail = ['mail', 'google', 'com'].join('\\.');
    const blockedFinance = [['go', 'green'].join(''), ['cal', 'coast'].join('')].join('|');
    const patterns = [
      new RegExp('\\x24\\s*\\d', 'i'),
      new RegExp('\\x24\\s*[a-z]', 'i'),
      new RegExp('\\x24', 'i'),
      /\b(usd|dollars?|dolares|dólares|pesos|mxn|price|pricing|precio|precios|costo|costos|quote|bid|bids|estimate\s*#?|5153[-.]?\d*|cotizaci[oó]n|presupuesto|invoice|factura|payroll|n[oó]mina|financing|financiamiento|apr|loan\s+rate)\b/i,
      /\b(po|order)\s*#/i,
      /\bEIN\b\s*[:#]?\s*\d|\b\d{2}-\d{7}\b/i,
      new RegExp('\\b(' + blockedFinance + ')\\b', 'i'),
      new RegExp('mailto:|@gmail\\.com|@yahoo\\.com|@icloud\\.com|' + blockedMail, 'i')
    ];
    return patterns.some((rx) => rx.test(s));
  }

  /* Allowed room / electrical seed matching kitchen/kitchen-electrical-plan-data.json */
  const BASE_SLOTS = [
    { space: 1, id: 'SA-A', group: 'kitchen', amps: 20, poles: 1, breaker_en: '20A Dual-Function', breaker_es: '20A Doble Función', cat: 'BRN120DF', cable: '12/2 Cu', gauge: '12/2', serves_en: 'East Counter Outlets (E1, E2)', serves_es: 'Contactos Cubierta Este (E1, E2)', route_en: 'In-wall East 50" band', route_es: 'En muro Este franja 50"', boxes: ['E1', 'E2'], base_ft: 10.5 },
    { space: 2, id: 'SA-B', group: 'kitchen', amps: 20, poles: 1, breaker_en: '20A Dual-Function', breaker_es: '20A Doble Función', cat: 'BRN120DF', cable: '12/2 Cu', gauge: '12/2', serves_en: 'South Counter Outlets (S1, S2)', serves_es: 'Contactos Cubierta Sur (S1, S2)', route_en: 'In-wall South 30" band', route_es: 'En muro Sur franja 30"', boxes: ['S1', 'S2'], base_ft: 16.0 },
    { space: 3, id: 'SA-C', group: 'kitchen', amps: 20, poles: 1, breaker_en: '20A Dual-Function', breaker_es: '20A Doble Función', cat: 'BRN120DF', cable: '12/2 Cu', gauge: '12/2', serves_en: 'West Range Counter Outlets (W1, W2 · 1" tile rings)', serves_es: 'Contactos Cubierta Oeste (W1, W2 · aros 1" azulejo)', route_en: 'Attic to West 50" band', route_es: 'Ático a muro Oeste 50"', boxes: ['W1', 'W2'], base_ft: 39.0 },
    { space: 4, id: 'REF', group: 'kitchen', amps: 20, poles: 1, breaker_en: '20A Dual-Function', breaker_es: '20A Doble Función', cat: 'BRN120DF', cable: '12/2 Cu', gauge: '12/2', serves_en: 'Haier Fridge Single Outlet (REF-1)', serves_es: 'Refrigerador Haier Contacto Sencillo (REF-1)', route_en: 'In-wall East 52-1/2" band', route_es: 'En muro Este franja 52-1/2"', boxes: ['REF-1'], base_ft: 10.1 },
    { space: 5, id: 'DW', group: 'kitchen', amps: 15, poles: 1, breaker_en: '15A Dual-Function', breaker_es: '15A Doble Función', cat: 'BRN115DF', cable: '14/2 Cu', gauge: '14/2', serves_en: '24" Dishwasher (Sink-Base 2-Gang Left · Sep. Neutral)', serves_es: 'Lavavajillas 24" (Caja Doble Fregadero Izq. · Neutro Sep.)', route_en: 'In-wall South 24" band', route_es: 'En muro Sur franja 24"', boxes: ['DW-GD'], base_ft: 13.6 },
    { space: 6, id: 'GD', group: 'kitchen', amps: 15, poles: 1, breaker_en: '15A Dual-Function', breaker_es: '15A Doble Función', cat: 'BRN115DF', cable: '14/2 Cu', gauge: '14/2', serves_en: 'Garbage Disposal (Sink-Base 2-Gang Right · Sep. Neutral)', serves_es: 'Triturador Basura (Caja Doble Fregadero Der. · Neutro Sep.)', route_en: 'In-wall South 26" / 20" band', route_es: 'En muro Sur franja 26" / 20"', boxes: ['DW-GD', 'GD-AIR-OR-SW'], base_ft: 17.5 },
    { space: 7, id: 'RG', group: 'kitchen', amps: 15, poles: 1, breaker_en: '15A Dual-Function', breaker_es: '15A Doble Función', cat: 'BRN115DF', cable: '14/2 Cu', gauge: '14/2', serves_en: 'Viking 30" Gas Range Low Pocket (RG-1)', serves_es: 'Estufa de Gas Viking 30" Franja Baja (RG-1)', route_en: 'Attic drop to West 3" high', route_es: 'Ático a muro Oeste 3" alto', boxes: ['RG-1'], base_ft: 34.8 },
    { space: 8, id: 'HD', group: 'kitchen', amps: 15, poles: 1, breaker_en: '15A AFCI + Lock-Off', breaker_es: '15A AFCI + Bloqueo', cat: 'BRN115AF + BRLW1', cable: '14/2 Cu', gauge: '14/2', serves_en: 'Zephyr Hood Direct Hardwire 1-Gang 2"×3" (HD-1 @ 83"–86")', serves_es: 'Campana Zephyr Conexión Directa 2"×3" (HD-1 @ 83"–86")', route_en: 'Attic drop to West 84-1/2"', route_es: 'Ático a muro Oeste 84-1/2"', boxes: ['HD-1'], base_ft: 24.6 },
    { space: 9, id: 'LT', group: 'kitchen', amps: 15, poles: 1, breaker_en: '15A AFCI', breaker_es: '15A AFCI', cat: 'BRN115AF', cable: '14/2 Cu', gauge: '14/2', serves_en: 'Kitchen Main Light + Sink Task/Pendants + SW-ENTRY 3-Gang', serves_es: 'Luz Principal + Luces Fregadero + Apagador Entrada 3-Gang', route_en: 'Attic to North entry & ceiling', route_es: 'Ático a entrada Norte y techo', boxes: ['SW-ENTRY', 'L1-MAIN', 'T1-T2-T3'], base_ft: 69.3 },
    { space: 10, id: 'HVAC', group: 'unit_other', amps: 15, poles: 1, breaker_en: '15A Standard (verify)', breaker_es: '15A Estándar (verificar)', cat: 'BR115', cable: '14/2 Cu', gauge: '14/2', serves_en: 'Attic Furnace via Disconnect (Heating Only)', serves_es: 'Calefactor en Ático con Desconectador (Solo Calefacción)', route_en: 'Attic overhead', route_es: 'Ático aéreo', boxes: [], base_ft: 31.2 },
    { space: 11, id: 'LIV', group: 'unit_other', amps: 20, poles: 1, breaker_en: '20A AFCI', breaker_es: '20A AFCI', cat: 'BRN120AF', cable: '12/2 Cu (ENT hold)', gauge: '12/2', serves_en: 'Living Outlets L1–L6 + Hall H1 (Empty Tubing Hold)', serves_es: 'Contactos Sala L1–L6 + Pasillo H1 (Solo Tubo Vacío)', route_en: 'Attic junction', route_es: 'Caja de paso ático', boxes: [], base_ft: 196.5 },
    { space: 12, id: 'DIN', group: 'unit_other', amps: 20, poles: 1, breaker_en: '20A AFCI', breaker_es: '20A AFCI', cat: 'BRN120AF', cable: '12/2 Cu (ENT hold)', gauge: '12/2', serves_en: 'Dining Outlets D1–D4 (No Outlet on D04 Wall)', serves_es: 'Contactos Comedor D1–D4 (Sin Contacto en Muro D04)', route_en: 'Attic junction', route_es: 'Caja de paso ático', boxes: [], base_ft: 147.0 },
    { space: 13, id: 'BED', group: 'unit_other', amps: 20, poles: 1, breaker_en: '20A AFCI', breaker_es: '20A AFCI', cat: 'BRN120AF', cable: '12/2 Cu (ENT hold)', gauge: '12/2', serves_en: 'Bedroom Outlets B1–B5 + Closet Light', serves_es: 'Contactos Recámara B1–B5 + Luz Clóset', route_en: 'Attic junction', route_es: 'Caja de paso ático', boxes: [], base_ft: 149.9 },
    { space: 14, id: 'BATH-R', group: 'unit_other', amps: 20, poles: 1, breaker_en: '20A GFCI / DF', breaker_es: '20A GFCI / DF', cat: 'BRN120GF', cable: '12/2 Cu', gauge: '12/2', serves_en: 'Bathroom Vanity + Toilet Outlets', serves_es: 'Contactos Lavabo + Inodoro Baño', route_en: 'Attic junction', route_es: 'Caja de paso ático', boxes: [], base_ft: 64.4 },
    { space: 15, id: 'BATH-L', group: 'unit_other', amps: 15, poles: 1, breaker_en: '15A AFCI', breaker_es: '15A AFCI', cat: 'BRN115AF', cable: '14/2 Cu', gauge: '14/2', serves_en: 'Bathroom Ceiling Light, Vanity & Humidity Fan', serves_es: 'Luz Techo, Lavabo y Extractor de Baño', route_en: 'Attic junction', route_es: 'Caja de paso ático', boxes: [], base_ft: 91.0 },
    { space: 16, id: 'LAUN-W', group: 'unit_other', amps: 20, poles: 1, breaker_en: '20A Dual-Function', breaker_es: '20A Doble Función', cat: 'BRN120DF', cable: '12/2 Cu', gauge: '12/2', serves_en: 'Laundry Closet Washer Outlet (2-Gang Left)', serves_es: 'Contacto Lavadora Clóset Lavandería (Caja Doble Izq.)', route_en: 'Attic direct', route_es: 'Ático directo', boxes: [], base_ft: 45.5 },
    { space: 17, id: 'LTG', group: 'unit_other', amps: 15, poles: 1, breaker_en: '15A AFCI', breaker_es: '15A AFCI', cat: 'BRN115AF', cable: '14/2 + 14/3 Cu', gauge: '14/2', serves_en: 'Whole-Unit Ceiling Lights + Interconnected Smoke/CO', serves_es: 'Luces Generales + Detectores Humo/CO Interconectados', route_en: 'Attic junction', route_es: 'Caja de paso ático', boxes: [], base_ft: 179.9 },
    { space: 18, id: 'LAUN-D', group: 'unit_other', amps: 15, poles: 1, breaker_en: '15A Dual-Function', breaker_es: '15A Doble Función', cat: 'BRN115DF', cable: '14/2 Cu', gauge: '14/2', serves_en: 'Laundry Closet Gas Dryer 120V Outlet (2-Gang Right)', serves_es: 'Contacto Secadora Gas 120V (Caja Doble Der.)', route_en: 'Attic direct', route_es: 'Ático directo', boxes: [], base_ft: 45.5 },
    { space: 19, id: 'SPARE', group: 'spare', amps: 0, poles: 1, breaker_en: 'Open Spare Filler', breaker_es: 'Espacio Libre Reserva', cat: 'Filler', cable: 'None', gauge: 'none', serves_en: 'Open Spare Space (Reserved for Future Load)', serves_es: 'Espacio Libre de Reserva (Futuro)', route_en: 'None', route_es: 'Ninguna', boxes: [], base_ft: 0.0 },
    { space: 20, id: 'ATTIC', group: 'unit_other', amps: 15, poles: 1, breaker_en: '15A Dual-Function', breaker_es: '15A Doble Función', cat: 'BRN115DF', cable: '14/2 Cu', gauge: '14/2', serves_en: 'Attic Service Outlet (<=25 ft Furnace) + Hatch Light', serves_es: 'Contacto Servicio Ático (<=25 pies) + Luz Escotilla', route_en: 'Attic direct', route_es: 'Ático directo', boxes: [], base_ft: 39.2 }
  ];

  const DEFAULT_STATE = {
    schema_version: '1.0.0',
    plan_id: PLAN_ID,
    base_rev: '2026-11-20-r1',
    status: 'PLANNING_AND_MOCKUP_ONLY_ROUGH_IN_ON_HOLD',
    floor_condition: 'bare_subfloor',
    floor_buildup_t_in: 0.75,
    counter_outlet_height_in: 44.0,
    sink_control_mode: 'option_a_air_wireless',
    south_task_light_mode: 'three_task_lights',
    south_routing_mode: 'in_wall_bored',
    range_gfci_method: 'df_breaker_at_d04',
    east_view_side: 'kitchen',
    dining_wall_width_in: 91.5,
    pie_safe_start_in: 26.0,
    pie_safe_width_in: 33.0,
    sink_base_start_in: 72.0,
    sink_base_width_in: 30.0,
    waste_pct: 15,
    existing_original_trim: {
      baseboard_height_in: 9.5,
      picture_rail_height_in: 103.0
    },
    flagged_clashes: [
      {
        id: 'hold-d04-noscrew',
        severity: 'HIGH',
        title_en: 'D04 Backside: NO Screws / NO Boxes / NO Back Entry (53"–77")',
        title_es: 'Respaldo D04: SIN Tornillos / SIN Cajas / SIN Paso Trasero (53"–77")',
        en: 'Dining subpanel D04 steel can sits 1/8"–5/8" behind East kitchen 1/2" drywall across studs S1–S2 (13"–27-1/2" N of SE, 53"–77" above finished floor). Side-entry notches are ON HOLD — exit vertically through top header or approved below-sill bore bands only.',
        es: 'El gabinete metálico del tablero D04 (comedor) queda a 1/8"–5/8" detrás de la tablaroca 1/2" de la cocina en montantes S1–S2 (13"–27-1/2" al Norte de SE, 53"–77" sobre piso). Cortes laterales EN ESPERA — salir solo por arriba al ático o debajo de 53".'
      },
      {
        id: 'hold-d04-feeder',
        severity: 'HIGH',
        title_en: 'NEXT Planning Visit (Reschedule Req.): D04 Feeder & Side-Entry Hold',
        title_es: 'Recorrido visita NEXT reprogramada: Alimentador D04 y Cortes Laterales',
        en: 'Confirm 80A/#4 Cu vs 100A/#3 Cu feeder and inspect onsite Eaton BRP20L125G box + BRPX2A20L1F flush cover at rescheduled NEXT planning visit. Do NOT pull kitchen wire or close drywall until rough-in release.',
        es: 'Confirmar alimentador 80A/#4 Cu vs 100A/#3 Cu y revisar caja Eaton BRP20L125G + tapa BRPX2A20L1F en obra el visita NEXT reprogramada. NO jalar cable de cocina ni cerrar tablaroca hasta liberar instalación.'
      },
      {
        id: 'hold-hd1-box',
        severity: 'HIGH',
        title_en: 'HD-1 Direct Hardwire: 1-Gang 2"×3" (~83"–86") Replaces 4×4 @ 100"',
        title_es: 'HD-1 Conexión Directa: Sencilla 2"×3" (~83"–86") Reemplaza 4×4 a 100"',
        en: 'Zephyr Savona uses direct hardwire via flush 1-gang 2"×3" box flush to finished surface (follow actual OEM constraints) at C/L 33" ± 2-1/4", ~83"–86" above finished floor (+t bare subfloor). Verify exact knockout side on hood downstairs. NO 4"×4" box at 100"/104".',
        es: 'Campana Zephyr lleva conexión directa en caja sencilla 2"×3" al ras del acabado (seguir montaje real del fabricante) a eje 33" ± 2-1/4", ~83"–86" sobre piso terminado (+t subpiso). Confirmar lado del orificio abajo. NO caja 4"×4" a 100"/104".'
      },
      {
        id: 'hold-south-sink',
        severity: 'MEDIUM',
        title_en: 'South Sink Station (72"–102" / CL 87" (plan-derived)) & Former Pie-Safe Closure',
        title_es: 'Posición Fregadero Sur (72"–102" / CL 87" (plan-derived)) y Cierre de Alacena Anterior',
        en: 'Electrical placement HELD. Verify South sink base station (72"–102" / CL 87" (plan-derived)) and former pie-safe closure (~26"–59", measure on site). Weather-seal and cover; recheck box backing and clearances before fastening S1, S2, and DW-GD. Keep DW-GD inside sink base with separate neutrals — NEVER behind 48"–72" dishwasher.',
        es: 'Ubicación eléctrica EN ESPERA. Confirmar gabinete de fregadero Sur (72"–102" / eje 87" (derivado del plano)) y cierre de alacena anterior (~26"–59", medir en obra). Sellar contra intemperie y cubrir; revisar respaldo y claros de cajas antes de fijar S1, S2 y DW-GD. Mantener DW-GD dentro del fregadero con neutros separados — NUNCA detrás del lavavajillas.'
      }
    ],
    field_overrides: [],
    pins: []
  };

  /* ── Plain Crew I18N (STRICTLY ZERO R1/R8/RevI/AFF/CEC JARGON CODES) ── */
  const I18N = {
    en: {
      doc_title: 'Kitchen Electrical & Subpanel D04 Plan — Unit 4',
      hdr_title: 'Kitchen Electrical & Subpanel D04 Plan',
      hdr_sub: '6 Coupled True-Scale Views (X = Y) · 9 Kitchen Circuits on Eaton D04 · Zero Prices',
      back_room: '← Back to Kitchen Page',
      link_floor_plan: 'Kitchen Floor Plan →',
      link_west_hood: 'West Range & Hood Wall →',
      btn_lang: 'Español (MX)',
      btn_circle_on: 'Circle-to-Correct',
      btn_circle_off: 'Drawing Active…',
      btn_export_svg: 'Export SVG',
      btn_download_pdf: 'Download / Print PDF',
      hold_html: '<strong>PLANNING &amp; MOCKUP ONLY — ROUGH-IN ON HOLD:</strong> Do NOT pull interior kitchen wire, cut subpanel <strong>D04</strong> side-entry notches, or close drywall until Friday layout photos and the NEXT Planning Visit electrical walkthrough confirm exact stations, <strong>D04</strong> feeder size, and box clearances.',
      conflict_text: 'A newer revision was saved on Tailnet by another editor (HTTP 409). Reload the latest plan before saving again.',
      btn_reload: 'Reload Latest Plan',
      tabs: {
        floor: '1. Floor & Cable Routes',
        south: '2. South Sink Wall',
        east: '3. East Fridge / D04',
        west: '4. West Range / HD-1',
        north: '5. North Entry Wall',
        panel: '6. D04 Panel Schedule'
      },
      view_titles: {
        floor: 'View 1 — Top-Down Floor, Ceiling & Cable Routes (147" × 126-1/4")',
        south: 'View 2 — South Sink, Window & Former Pie-Safe Wall (0"–147")',
        east_kitchen: 'View 3 — East Fridge & D04 Backside Wall (0"–126-1/4")',
        east_dining: 'View 3 (Flipped) — Dining Room Front of Subpanel D04',
        west: 'View 4 — West Range & Hood Wall (0"–66-1/4" · HD-1 Direct Hardwire)',
        north: 'View 5 — North Entry Wall & 3-Gang Switch (115-1/2")',
        panel: 'View 6 — Interactive Eaton BRP20L125G 20-Space Subpanel D04'
      },
      tgl_routes: 'Cable Routes & Bore Bands',
      tgl_reach: '24" Counter Reach Arcs',
      tgl_ceiling: 'Ceiling Lights & Switches',
      tgl_trim: 'Original Historic Trim',
      tgl_holds: 'D04 No-Screw & Holds',
      lbl_outlet_h: 'Counter Outlets:',
      btn_h_44: '44" above floor',
      btn_h_41: '41" above floor',
      lbl_sink_ctrl: 'Sink Control:',
      btn_opt_a: 'Option A: Air Button + Wireless',
      btn_opt_b: 'Option B: Wired 2-Gang @ 70"',
      lbl_lights_opt: 'Sink Lights:',
      btn_lt_3: '3 Task Lights',
      btn_lt_2: '2 Pendants',
      lbl_route_opt: 'South Routing:',
      btn_rt_inwall: 'In-Wall Bore Bands',
      btn_rt_attic: 'Via Attic',
      btn_reset: 'Reset',
      lbl_floor_cond: 'Floor Condition Today:',
      btn_floor_bare: 'Bare subfloor (not installed yet)',
      btn_floor_fin: 'Finished floor already down',
      lbl_subfloor_allow: 'Finished-floor allowance (+t):',
      subfloor_note_bare: 'in (added to every height measured off bare subfloor)',
      subfloor_note_fin: '0" offset — measuring directly off finished floor',
      lbl_south_drag: 'Drag Former Opening or Sink Base on drawing, or adjust:',
      lbl_piesafe_pos: 'Former Pie-Safe Start (from SE):',
      lbl_sink_pos: '30" Sink Base Start (from SE):',
      east_desc_kitchen: '<strong>Kitchen Backside:</strong> Red hatched zone (53"–77" above finished floor) = NO screws, NO boxes, NO back entry into Dining Subpanel <strong>D04</strong>.',
      east_desc_dining: '<strong>Dining Room Front (Flipped):</strong> Eaton <strong>BRP20L125G</strong> can centered at <strong>W/4 + 1"</strong> north of dining window trim (30"×36" clear working zone). Side-entry notches ON HOLD.',
      btn_flip_to_dining: 'Flip to Dining Room Side (D04 Front)',
      btn_flip_to_kitchen: 'Flip Back to Kitchen Side (Fridge Wall)',
      circle_bar_hint: 'Draw a circle around any box or cable path on the drawing (touch or mouse) to attach a callout note.',
      btn_clear_sketch: 'Clear Sketch',
      btn_circle_done: 'Exit Circle Mode',
      photo_title_south: 'South Sink & Former Pie-Safe Wall (Site Photo)',
      photo_title_west: 'West Range & Hood Open-Stud Wall (Site Photo)',
      photo_badge: 'VERIFY ON SITE',
      photo_south_l: '← SE CORNER (0" ref)',
      photo_south_m: 'SOUTH SINK WALL',
      photo_south_r: 'REAR DOOR (SW) →',
      photo_west_l: '← SOUTH STEP (0" ref)',
      photo_west_m: 'WEST RANGE WALL',
      photo_west_r: 'NORTH (Hallway) →',
      photo_callouts_south: [
        '<li class="callout-alert"><strong>D04 Backside (Left of Photo, East Wall):</strong> Dining subpanel sits behind 1/2" drywall at 53"–77" above finished floor — NEVER drive screws or mount boxes in that band.</li>',
        '<li><strong>Former Pie-Safe:</strong> Weather-seal and cover. S1 (24") and S2 (65") remain provisional; recheck backing, box locations and clearances at the closed wall before fastening.</li>',
        '<li><strong>DW-GD Inside Sink Base (provisional, 14" high):</strong> 2-gang box inside 30" sink cabinet with <strong>separate neutrals</strong> — NEVER behind the 24" dishwasher bay (48"–72").</li>'
      ],
      photo_callouts_west: [
        '<li class="callout-alert"><strong>HD-1 Direct Hardwire (Zephyr Manual p. 3):</strong> Flush 1-gang 2"×3" box at C/L 33" ± 2-1/4", ~83"–86" above finished floor (+t off bare subfloor). NO 4"×4" box at 100"/104".</li>',
        '<li><strong>1/2" Drywall &amp; Zero Stud Shims:</strong> 1/2" drywall (0.50") meets 1/2" HardieBacker (0.42") directly on studs (~1/16" skim only). Set W1 (9") &amp; W2 (57") with ~1" tile mud rings.</li>',
        '<li><strong>Low Rear Pocket (RG-1 @ 33", 3" high):</strong> Single 15A receptacle beside 1/2" gas shutoff inside 9/16"–4-15/16" pocket. Owned Viking has low 1" island trim only.</li>'
      ],
      concept_disc: '<strong>Site Photo vs. Scale Plan:</strong> Photo shows the actual open-stud kitchen wall. Always pull box heights and bore bands from this uniform true-scale drawing and confirm finished-floor thickness (+t) before fastening boxes.',
      panel_sched_title: 'Subpanel D04 — Eaton BRP20L125G 20-Space Schedule (Tap Any Space to Highlight Routes)',
      panel_counts: '9 Kitchen · 10 Unit · 1 Spare',
      flt_all: 'All 20 Spaces',
      flt_kit: 'Kitchen Only (1–9)',
      flt_unit: 'Other Unit Spaces (10–20)',
      btn_clear_ckt: 'Show All Kitchen Circuits',
      th_space: 'Space',
      th_ckt: 'Circuit',
      th_serves: 'Serves / Boxes',
      th_amps: 'Amps',
      th_breaker: 'Eaton BR Breaker',
      th_cable: 'Cable & Route',
      th_len: 'Live Length',
      holds_title: 'Active Holds & Hard Field Rules (Never Auto-Resolved)',
      holds_lock: 'Immutable · Verify on Site',
      takeoff_title: 'Live Manhattan Cable Calculator & Breaker/Box Takeoff (Quantities Only · Zero Prices)',
      takeoff_notice: 'Gross Proposed Qty — Verify On-Hand Stock Before Ordering (Zero Prices · Zero Order Numbers). Manhattan formula: |Δx| + |Δy| + |Δz| + 18" box tails.',
      lbl_waste_pct: 'Cable Waste / Overage (%):',
      btn_w15: '+15% Standard',
      btn_w20: '+20% Extra',
      lbl_rg_gfci: 'Gas Range Protection:',
      trim_title: 'Original Trim Baseline & Live Plan Sync',
      trim_badge: 'Edwardian Original',
      trim_note: 'Original historic trim (9-1/2" baseboard, 103" picture rail, door/window casings) stays on its own layer. West range wall uses 1/2" drywall (0.50") to 1/2" HardieBacker (0.42") with NO stud shims (~1/16" skim) and ~1" proud tile rings.',
      lbl_author: 'Editor Name',
      lbl_dining_w: 'Dining Wall Width W (in, for D04 CL)',
      lbl_trim_base: 'Original Baseboard Height (in)',
      lbl_trim_rail: 'Original Picture Rail Height (in)',
      btn_save: 'Save Live to Tailnet',
      btn_export_json: 'Download Electrical JSON',
      save_hint_off: 'Off-tailnet Read-Only / Local Export mode: live edits update preview & local exports only. Connect to Tisa\'s Tailscale network to save live overrides to :8444.',
      save_hint_on: 'Connected to Tailnet persistence (:8444 · plan kitchen-electrical). Saves stamp live plan immediately + queue EOD review.',
      voice_title: 'Attached Comment Callouts & Voice Note',
      lbl_intent: 'Comment Action',
      intent_edit: 'Modify Plan / Field Measurement',
      intent_problem: 'Flag Problem / Clash',
      intent_question: 'Answer a Question ("What is this right here?")',
      lbl_note: 'Field Note or Spoken Command',
      note_ph: 'Example: "Switch counter outlets to 41 in", "Verify HD-1 knockout left of center", or "Where is the dishwasher box?" (Zero prices)',
      btn_dictate: 'Dictate Voice Note',
      btn_dictate_stop: 'Listening… Tap to Stop',
      btn_attach_pin: 'Attach Comment Pin',
      btn_pin_mic: 'Dictate',
      btn_pin_send: 'Send to Agent',
      pin_mode_modify: 'Modify Plan',
      pin_mode_question: 'Answer a Question',
      sketch_none: 'No Circle Drawn',
      sketch_ready: 'Circle Ready to Attach',
      eod_title: 'End-of-Day Review & Revert (Tisa)',
      eod_desc: 'Workers never wait: saved tailnet edits stamp the live plan immediately with a revision ID. At end-of-day, Tisa taps <strong>Accept</strong> (promotes to room spec) or <strong>Reject</strong> (reverts atomically).',
      btn_refresh_eod: 'Refresh From Tailnet',
      eod_empty: 'No pending end-of-day edits.',
      btn_accept: 'Accept → Room Spec',
      btn_reject: 'Reject → Revert',
      tailnet_live: 'Tailnet Live',
      tailnet_off: 'Off-Tailnet · Read-Only / Local Export',
      baseline_loaded: 'Baseline Loaded',
      pending_eod_stamp: 'Field Update · Pending EOD Review',
      not_synced: 'Official Seed R3 (2026-11-24)',
      showing_all_ckts: 'Showing: All 9 Kitchen Circuits',
      d04_zone_pill: 'D04 Backside: NO SCREWS 53"–77"',
      scale_pill: 'True Scale 1:1 (X = Y)',
      measure_on_site: 'MEASURE ON SITE',
      verify_on_site: 'VERIFY ON SITE',
      insp_default_title: 'Tap Any Box, Cable Route, or D04 Breaker Slot',
      insp_default_body: 'Tap any electrical box on the drawing or any space (1–20) in the Subpanel D04 schedule below to highlight its route, exact heights from bare subfloor (+t) and finished floor, and crew rules.',
      voice_status: 'Tap Circle-to-Correct above to circle any box or cable route — each pin gets a visible leader line, mic button, and Send to Agent button.',
      rg_opt_df: 'Dual-Function 15A Breaker at D04 (BRN115DF)',
      rg_opt_afci: '15A AFCI Breaker (BRN115AF) + Accessible Dead-Front GFCI',
      firewall_err: 'Blocked by Private-Data Firewall: never enter currency symbols, prices, quotes, bids, order numbers, or email addresses.'
    },
    es: {
      doc_title: 'Plano Eléctrico de Cocina y Tablero D04 — Unidad 4',
      hdr_title: 'Plano Eléctrico de Cocina y Tablero D04',
      hdr_sub: '6 Vistas Acopladas a Escala Real (X = Y) · 9 Circuitos de Cocina en Eaton D04 · Sin Precios',
      back_room: '← Volver a Página Cocina',
      link_floor_plan: 'Planta de Cocina →',
      link_west_hood: 'Muro Oeste Estufa y Campana →',
      btn_lang: 'English (EN)',
      btn_circle_on: 'Circular para Corregir',
      btn_circle_off: 'Dibujo Activo…',
      btn_export_svg: 'Exportar SVG',
      btn_download_pdf: 'Descargar / Imprimir PDF',
      hold_html: '<strong>SOLO PLANEACIÓN Y MAQUETA — INSTALACIÓN EN ESPERA:</strong> NO jalar cable interior de cocina, NO cortar entradas laterales en tablero <strong>D04</strong> ni cerrar tablaroca hasta confirmar fotos del trazo del viernes y el recorrido eléctrico del visita NEXT reprogramada.',
      conflict_text: 'Otro editor guardó una revisión más reciente en Tailnet (HTTP 409). Recarga el plano más reciente antes de volver a guardar.',
      btn_reload: 'Recargar Plano Actual',
      tabs: {
        floor: '1. Planta y Rutas Cable',
        south: '2. Muro Sur Fregadero',
        east: '3. Muro Este Refri / D04',
        west: '4. Muro Oeste Estufa / HD-1',
        north: '5. Muro Norte Entrada',
        panel: '6. Tablero D04 (20 Esp.)'
      },
      view_titles: {
        floor: 'Vista 1 — Planta, Techo y Rutas de Cable (147" × 126-1/4")',
        south: 'Vista 2 — Muro Sur Fregadero, Ventana y Alacena Anterior (0"–147")',
        east_kitchen: 'Vista 3 — Muro Este Refrigerador y Respaldo D04 (0"–126-1/4")',
        east_dining: 'Vista 3 (Volteada) — Frente del Tablero D04 en Comedor',
        west: 'Vista 4 — Muro Oeste Estufa y Campana (0"–66-1/4" · HD-1 Directa)',
        north: 'Vista 5 — Muro Norte Entrada y Apagador Triple (115-1/2")',
        panel: 'Vista 6 — Tablero Interactivo Eaton BRP20L125G D04 (20 Espacios)'
      },
      tgl_routes: 'Rutas de Cable y Franjas',
      tgl_reach: 'Arcos Alcance 24" Cubierta',
      tgl_ceiling: 'Luces Techo y Apagadores',
      tgl_trim: 'Molduras Originales',
      tgl_holds: 'Zona Prohibida D04 y Esperas',
      lbl_outlet_h: 'Contactos Cubierta:',
      btn_h_44: '44" sobre piso',
      btn_h_41: '41" sobre piso',
      lbl_sink_ctrl: 'Control Fregadero:',
      btn_opt_a: 'Opción A: Botón Aire + Inalámbrico',
      btn_opt_b: 'Opción B: Caja Doble @ 70"',
      lbl_lights_opt: 'Luces Fregadero:',
      btn_lt_3: '3 Luces de Tarea',
      btn_lt_2: '2 Colgantes',
      lbl_route_opt: 'Ruta Muro Sur:',
      btn_rt_inwall: 'Franjas en Muro',
      btn_rt_attic: 'Por el Ático',
      btn_reset: 'Restaurar',
      lbl_floor_cond: 'Condición del Piso Hoy:',
      btn_floor_bare: 'Subpiso desnudo (sin piso final)',
      btn_floor_fin: 'Piso terminado ya instalado',
      lbl_subfloor_allow: 'Espesor piso terminado (+t):',
      subfloor_note_bare: 'pulg. (se suma a cada altura medida desde subpiso desnudo)',
      subfloor_note_fin: '0" ajuste — midiendo directo sobre piso terminado',
      lbl_south_drag: 'Arrastra Hueco Anterior o Fregadero en el plano, o ajusta:',
      lbl_piesafe_pos: 'Inicio Hueco Anterior (desde SE):',
      lbl_sink_pos: 'Inicio Fregadero 30" (desde SE):',
      east_desc_kitchen: '<strong>Lado Cocina (Respaldo):</strong> Zona roja rayada (53"–77" sobre piso terminado) = PROHIBIDO tornillos, cajas o pasar cables al Tablero <strong>D04</strong>.',
      east_desc_dining: '<strong>Frente Comedor (Volteado):</strong> Gabinete Eaton <strong>BRP20L125G</strong> centrado en <strong>W/4 + 1"</strong> al norte de la ventana (espacio libre 30"×36"). Cortes laterales EN ESPERA.',
      btn_flip_to_dining: 'Voltear a Lado Comedor (Frente D04)',
      btn_flip_to_kitchen: 'Volver a Lado Cocina (Muro Refri)',
      circle_bar_hint: 'Dibuja un círculo sobre cualquier caja o ruta en el plano (dedo o ratón) para adjuntar un comentario.',
      btn_clear_sketch: 'Borrar Trazo',
      btn_circle_done: 'Salir de Círculo',
      photo_title_south: 'Muro Sur Fregadero y Alacena Anterior (Foto Obra)',
      photo_title_west: 'Muro Oeste Estufa y Campana (Foto Obra)',
      photo_badge: 'VERIFICAR EN OBRA',
      photo_south_l: '← ESQUINA SE (0" ref)',
      photo_south_m: 'MURO SUR FREGADERO',
      photo_south_r: 'PUERTA TRASERA (SO) →',
      photo_west_l: '← ESQ. SUR (0" ref)',
      photo_west_m: 'MURO OESTE ESTUFA',
      photo_west_r: 'NORTE (Pasillo) →',
      photo_callouts_south: [
        '<li class="callout-alert"><strong>Respaldo D04 (Izq. de Foto, Muro Este):</strong> El tablero del comedor queda detrás de la tablaroca 1/2" de 53"–77" sobre piso terminado — NUNCA meter tornillos ni cajas ahí.</li>',
        '<li><strong>Alacena anterior:</strong> Sellar contra intemperie y cubrir. S1 (24") y S2 (65") siguen provisionales; revisar respaldo, ubicación y claros de cajas con el muro cerrado antes de fijarlas.</li>',
        '<li><strong>DW-GD Dentro del Fregadero (79", 14" alto):</strong> Caja doble dentro del gabinete de 30" con <strong>neutros separados</strong> — NUNCA detrás del lavavajillas (48"–72").</li>'
      ],
      photo_callouts_west: [
        '<li class="callout-alert"><strong>HD-1 Conexión Directa (Manual Zephyr p. 3):</strong> Caja sencilla 2"×3" al ras a eje 33" ± 2-1/4", ~83"–86" sobre piso terminado (+t desde subpiso). NO caja 4"×4" a 100"/104".</li>',
        '<li><strong>Tablaroca 1/2" y Cero Calzas:</strong> Tablaroca 1/2" (0.50") une con HardieBacker 1/2" (0.42") directo a madera (solo ~1/16" pasta). W1 (9") y W2 (57") con aros ~1" para azulejo.</li>',
        '<li><strong>Franja Baja Estufa (RG-1 @ 33", 3" alto):</strong> Contacto sencillo 15A junto a llave gas 1/2" dentro de 9/16"–4-15/16". Viking confirmada con borde trasero bajo 1".</li>'
      ],
      concept_disc: '<strong>Foto de Obra vs. Plano a Escala:</strong> La foto muestra el muro abierto real. Marca siempre alturas de cajas y perforaciones con este plano a escala uniforme confirmando el espesor del piso (+t).',
      panel_sched_title: 'Tablero D04 — Eaton BRP20L125G 20 Espacios (Toca Cualquier Espacio para Resaltar Rutas)',
      panel_counts: '9 Cocina · 10 Unidad · 1 Reserva',
      flt_all: 'Los 20 Espacios',
      flt_kit: 'Solo Cocina (1–9)',
      flt_unit: 'Otros Unidad (10–20)',
      btn_clear_ckt: 'Ver Todos Circuitos Cocina',
      th_space: 'Esp.',
      th_ckt: 'Circuito',
      th_serves: 'Alimenta / Cajas',
      th_amps: 'Amp',
      th_breaker: 'Pastilla Eaton BR',
      th_cable: 'Cable y Ruta',
      th_len: 'Largo Vivo',
      holds_title: 'Esperas Activas y Reglas Duras de Obra (Nunca Auto-Resueltas)',
      holds_lock: 'Inmutable · Verificar en Obra',
      takeoff_title: 'Calculadora Viva de Cable (Manhattan) y Materiales Eléctricos (Solo Cantidades · Sin Precios)',
      takeoff_notice: 'Cantidades Brutas Propuestas — Verificar Inventario en Obra Antes de Pedir (Sin Precios · Sin Núm. de Pedido). Fórmula Manhattan: |Δx| + |Δy| + |Δz| + 18" puntas por caja.',
      lbl_waste_pct: 'Margen / Desperdicio Cable (%):',
      btn_w15: '+15% Estándar',
      btn_w20: '+20% Extra',
      lbl_rg_gfci: 'Protección Estufa Gas:',
      trim_title: 'Molduras Originales y Sincronización Viva',
      trim_badge: 'Original Eduardiana',
      trim_note: 'Las molduras originales (zoclo 9-1/2", riel 103", chambranas) van en capa aparte. Muro Oeste usa tablaroca 1/2" (0.50") con HardieBacker 1/2" (0.42") SIN calzas (~1/16" pasta) y aros de ~1" para azulejo.',
      lbl_author: 'Nombre del Editor',
      lbl_dining_w: 'Ancho Muro Comedor W (pulg., eje D04)',
      lbl_trim_base: 'Altura Zoclo Original (pulg.)',
      lbl_trim_rail: 'Altura Riel Original (pulg.)',
      btn_save: 'Guardar en Vivo a Tailnet',
      btn_export_json: 'Descargar JSON Eléctrico',
      save_hint_off: 'Modo Fuera de Tailnet (Solo Lectura / Exportar Local): los cambios actualizan la vista y exportación local. Conecta a Tailscale de Tisa para guardar en :8444.',
      save_hint_on: 'Conectado a Tailnet (:8444 · plan kitchen-electrical). Los cambios estampan el plano de inmediato y pasan a revisión de fin de día.',
      voice_title: 'Comentarios Adjuntos y Nota de Voz',
      lbl_intent: 'Acción del Comentario',
      intent_edit: 'Modificar Plano / Medida de Obra',
      intent_problem: 'Reportar Problema / Choque',
      intent_question: 'Responder una Pregunta ("¿Qué es esto aquí?")',
      lbl_note: 'Nota de Obra o Comando Hablado',
      note_ph: 'Ejemplo: "Cambiar contactos de cubierta a 41 pulg.", "Confirmar salida HD-1 a la izquierda" o "¿Dónde va la caja del lavavajillas?" (Sin precios)',
      btn_dictate: 'Dictar Nota de Voz',
      btn_dictate_stop: 'Escuchando… Toca para Parar',
      btn_attach_pin: 'Adjuntar Pin de Comentario',
      btn_pin_mic: 'Dictar',
      btn_pin_send: 'Enviar al Agente',
      pin_mode_modify: 'Modificar Plano',
      pin_mode_question: 'Responder Pregunta',
      sketch_none: 'Sin Círculo Dibujado',
      sketch_ready: 'Círculo Listo para Adjuntar',
      eod_title: 'Revisión de Fin de Día y Revertir (Tisa)',
      eod_desc: 'La cuadrilla nunca espera: los cambios guardados estampan el plano al instante. Al final del día, Tisa toca <strong>Aceptar</strong> o <strong>Rechazar</strong>.',
      btn_refresh_eod: 'Actualizar desde Tailnet',
      eod_empty: 'No hay cambios pendientes de revisión.',
      btn_accept: 'Aceptar → Hoja de Cuarto',
      btn_reject: 'Rechazar → Revertir',
      tailnet_live: 'Tailnet Activo',
      tailnet_off: 'Fuera de Tailnet · Solo Lectura / Exportar',
      baseline_loaded: 'Base Cargada',
      pending_eod_stamp: 'Actualización Obra · Revisión EOD Pendiente',
      not_synced: 'Semilla Oficial R3 (24 Nov 2026)',
      showing_all_ckts: 'Mostrando: Los 9 Circuitos de Cocina',
      d04_zone_pill: 'Respaldo D04: SIN TORNILLOS 53"–77"',
      scale_pill: 'Escala Real 1:1 (X = Y)',
      measure_on_site: 'MEDIR EN OBRA',
      verify_on_site: 'VERIFICAR EN OBRA',
      insp_default_title: 'Toca Cualquier Caja, Ruta o Espacio del Tablero D04',
      insp_default_body: 'Toca cualquier caja en el plano o cualquier espacio (1–20) en la tabla del tablero D04 abajo para resaltar su ruta, alturas exactas desde subpiso (+t) y piso terminado, y reglas de obra.',
      voice_status: 'Toca Circular para Corregir arriba para encerrar cualquier caja o ruta — cada pin recibe línea guía, micrófono y botón Enviar al Agente.',
      rg_opt_df: 'Pastilla Doble Función 15A en D04 (BRN115DF)',
      rg_opt_afci: 'Pastilla AFCI 15A (BRN115AF) + GFCI Ciego Accesible',
      firewall_err: 'Bloqueado por Filtro de Privacidad: nunca escribas signos de dinero, precios, cotizaciones, números de pedido ni correos.'
    }
  };

  /* ── URL Overrides & Runtime State ── */
  const params = new URLSearchParams(window.location.search);
  function resolveOrigin(raw, fallback) {
    if (!raw) return fallback;
    try {
      const u = new URL(raw);
      if (u.protocol === 'http:' || u.protocol === 'https:') return u.origin;
    } catch (_) {}
    return fallback;
  }
  const apiOrigin = resolveOrigin(params.get('api'), DEFAULT_API_ORIGIN);
  const voiceOrigin = resolveOrigin(params.get('voice_api'), DEFAULT_VOICE_ORIGIN);

  let state = clone(DEFAULT_STATE);
  if (typeof I18N === 'object' && I18N && I18N.en && !I18N.ru) {
    I18N.ru = Object.assign({}, I18N.en, {
      btn_lang: 'Русский (RU)',
      measure_on_site: 'ЗАМЕРИТЬ НА МЕСТЕ',
      verify_friday: 'ПРОВЕРИТЬ НА МЕСТЕ',
      local_preview: 'Локальный просмотр',
      pending_eod: 'Ожидает проверки',
      synced_label: 'Синхронизировано',
      off_tailnet: 'Вне Tailnet (локальный режим)',
      sketch_none: 'Нет отметки',
      sketch_ready: 'Отметка готова',
      btn_dictate: 'Голосовой ввод'
    });
  }
  const _initLangRaw = String(params.get('lang') || '').toLowerCase();
  let lang = _initLangRaw.startsWith('ru') ? 'ru' : (_initLangRaw.startsWith('es') ? 'es' : 'en');
  let activeView = ['floor', 'south', 'east', 'west', 'north', 'panel'].includes(params.get('view'))
    ? params.get('view') : 'floor';
  let selectedCircuit = null; /* null = all, or circuit id e.g. 'SA-B', 'HD' */
  let selectedBoxId = null;
  let selectedSlotSpace = null;
  let slotFilter = 'ALL';
  let layers = { routes: true, reach: true, ceiling: true, trim: true, holds: true };
  let tailnetOnline = false;
  let tailnetUser = null;
  let hasUnsyncedLocalEdits = false;
  let pendingEod = [];
  let circleMode = false;
  let hasSketch = false;
  let sketchStrokes = [];
  let currentStroke = null;
  let lastSketchAnchor = null;
  let lastScaleInfo = { view: 'floor', scaleX: 1, scaleY: 1, uniform: true };
  let dragTarget = null; /* { kind: 'piesafe'|'sink', startClientX, startVal, scale } */
  let speechRec = null;

  /* ── Helpers ── */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function t(k) { return (I18N[lang] && I18N[lang][k] !== undefined) ? I18N[lang][k] : (I18N.en[k] || k); }
  function $(id) { return document.getElementById(id); }

  function fracIn(val) {
    if (val === null || val === undefined || Number.isNaN(Number(val))) {
      return lang === 'es' ? 'MEDIR EN OBRA' : 'MEASURE ON SITE';
    }
    const v = Number(val);
    const neg = v < 0 ? '-' : '';
    const abs = Math.abs(v);
    const whole = Math.floor(abs);
    const sixteenths = Math.round((abs - whole) * 16);
    if (sixteenths === 0) return `${neg}${whole}"`;
    if (sixteenths === 16) return `${neg}${whole + 1}"`;
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const g = gcd(sixteenths, 16);
    const num = sixteenths / g;
    const den = 16 / g;
    return whole > 0 ? `${neg}${whole}-${num}/${den}"` : `${neg}${num}/${den}"`;
  }

  function effectiveFloorT() {
    return state.floor_condition === 'finished_installed' ? 0 : Math.max(0, Number(state.floor_buildup_t_in) || 0);
  }

  function heightDualLabel(affVal) {
    const tVal = effectiveFloorT();
    if (tVal <= 0) {
      return lang === 'es' ? `${fracIn(affVal)} piso term.` : `${fracIn(affVal)} above floor`;
    }
    return lang === 'es'
      ? `${fracIn(affVal)} piso (${fracIn(affVal + tVal)} subpiso)`
      : `${fracIn(affVal)} floor (${fracIn(affVal + tVal)} subfloor)`;
  }

  function showToast(msg, kind) {
    const el = $('status-toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'status-toast' + (kind === 'error' ? ' toast-error' : kind === 'ok' ? ' toast-ok' : '');
    el.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => { el.hidden = true; }, 3400);
  }

  function checkFirewall(text) {
    if (violatesPrivateFirewall(text)) {
      showToast(t('firewall_err'), 'error');
      return false;
    }
    return true;
  }

  /* ── Live Device Coordinates & 24" Counter Reach Engine ── */
  function getLiveDevices() {
    const hCounter = Number(state.counter_outlet_height_in) || 44.0;
    const sinkStart = Number(state.sink_base_start_in) || 72.0;
    const dwGdX = Number((sinkStart + 4.0).toFixed(2));
    const swSinkX = Number((sinkStart - 5.0).toFixed(2));
    const isOptB = state.sink_control_mode === 'option_b_wired_2gang';

    const list = [
      { id: 'E1', ckt: 'SA-A', space: 1, wall: 'east', x: 0, y: 10, z: hCounter, station: 10, gauge: '12/2', boundary: 'above_finished_floor', box_en: '1-gang deep box (20A duplex)', box_es: 'Caja sencilla profunda (contacto 20A)', note_en: 'Below 53" D04 no-screw zone; never attach to D04 steel can.', note_es: 'Debajo de la zona prohibida D04 (53"–77"); nunca fijar al gabinete D04.' },
      { id: 'E2', ckt: 'SA-A', space: 1, wall: 'east', x: 0, y: 48, z: hCounter, station: 48, gauge: '12/2', boundary: 'above_finished_floor', box_en: '1-gang deep box (20A duplex)', box_es: 'Caja sencilla profunda (contacto 20A)', note_en: 'Centered over 24" East drawer base, 12" from Haier fridge bay.', note_es: 'Sobre base cajonera de 24", a 12" del claro del refrigerador Haier.' },
      { id: 'REF-1', ckt: 'REF', space: 4, wall: 'east', x: 0, y: 74, z: 15, station: 74, gauge: '12/2', boundary: 'above_finished_floor', box_en: '1-gang flush box (20A single outlet)', box_es: 'Caja sencilla empotrada (contacto sencillo 20A)', note_en: 'Centered in 60"–88" Haier fridge bay; verify rear cord pocket.', note_es: 'Centrado en claro 60"–88" del refrigerador Haier; verificar hueco trasero.' },
      { id: 'S1', ckt: 'SA-B', space: 2, wall: 'south', x: 24, y: 0, z: hCounter, station: 24, gauge: '12/2', boundary: 'above_finished_floor', box_en: '1-gang box (20A duplex)', box_es: 'Caja sencilla (contacto 20A)', note_en: 'Provisional station; weather-seal and cover former pie-safe, then verify box backing and counter clearance on site.', note_es: 'Posición provisional; sellar contra intemperie y cubrir la alacena anterior; verificar respaldo y claro sobre cubierta en obra.' },
      { id: 'S2', ckt: 'SA-B', space: 2, wall: 'south', x: 65, y: 0, z: hCounter, station: 65, gauge: '12/2', boundary: 'above_finished_floor', box_en: isOptB ? '1-gang box (20A duplex)' : '1-gang (or 2-gang w/ wireless light remote)', box_es: isOptB ? 'Caja sencilla (contacto 20A)' : 'Caja sencilla (o doble con control inalámbrico)', note_en: 'Provisional station near former opening and South window casing (72-7/8"); verify after weather-sealing and covering.', note_es: 'Posición provisional junto al hueco anterior y chambrana Sur (72-7/8"); verificar después de sellar y cubrir.' },
      { id: 'DW-GD', ckt: 'DW + GD', space: 5, spaces: [5, 6], wall: 'south', x: dwGdX, y: 0, z: 14, station: dwGdX, gauge: '14/2', boundary: 'above_finished_floor', box_en: '2-gang box inside sink base (2 separate circuits · separate neutrals)', box_es: 'Caja doble dentro del fregadero (2 circuitos · neutros separados)', note_en: 'Inside 30" sink base, NEVER behind 24" dishwasher (48"–72"). Keep Space 5 & Space 6 neutrals separate and clearly labeled.', note_es: 'Dentro del gabinete de fregadero 30", NUNCA detrás del lavavajillas (48"–72"). Mantener neutros de Espacios 5 y 6 separados y etiquetados.' },
      { id: 'GD-AIR-OR-SW', ckt: isOptB ? 'GD + LT' : 'GD', space: 6, spaces: isOptB ? [6, 9] : [6], wall: 'south', x: isOptB ? swSinkX : (sinkStart + 18), y: 0, z: isOptB ? 39.5 : 36, station: isOptB ? swSinkX : (sinkStart + 18), gauge: isOptB ? '14/3' : '14/2', boundary: 'above_finished_floor', box_en: isOptB ? 'Wired 2-gang wall switch box @ 70" (Disposal + 3-Way Task Lights)' : 'Countertop sink-deck air button beside faucet (zero wall switch box)', box_es: isOptB ? 'Caja doble cableada en muro a 70" (Triturador + Luces 3 vías)' : 'Botón de aire en cubierta junto a la llave (sin caja en pared)', note_en: isOptB ? 'Option B active: adds wired 2-gang box at 70" and 14/3 3-way traveler to entry switch.' : 'Option A active: clean splash wall using sink-deck air button + wireless light remote at S2.', note_es: isOptB ? 'Opción B activa: agrega caja doble a 70" y cable 14/3 de 3 vías a la entrada.' : 'Opción A activa: muro limpio usando botón de aire en cubierta + control inalámbrico en S2.' },
      { id: 'W1', ckt: 'SA-C', space: 3, wall: 'west', x: 115.5, y: 69, z: hCounter, station: 9, gauge: '12/2', boundary: 'above_finished_floor', box_en: '1-gang box + ~1" tile mud ring (20A duplex)', box_es: 'Caja sencilla + aro ~1" azulejo (contacto 20A)', note_en: 'Centered over left 18" base cabinet; ~1" proud for 1/2" HardieBacker + tile (no stud shims).', note_es: 'Centrado sobre gabinete izquierdo 18"; ~1" salida para HardieBacker 1/2" + azulejo (sin calzas).' },
      { id: 'W2', ckt: 'SA-C', space: 3, wall: 'west', x: 115.5, y: 117, z: hCounter, station: 57, gauge: '12/2', boundary: 'above_finished_floor', box_en: '1-gang box + ~1" tile mud ring (20A duplex)', box_es: 'Caja sencilla + aro ~1" azulejo (contacto 20A)', note_en: 'Centered over right 18" base cabinet; ~1" proud for 1/2" HardieBacker + tile (no stud shims).', note_es: 'Centrado sobre gabinete derecho 18"; ~1" salida para HardieBacker 1/2" + azulejo (sin calzas).' },
      { id: 'RG-1', ckt: 'RG', space: 7, wall: 'west', x: 115.5, y: 93, z: 3, station: 33, gauge: '14/2', boundary: 'above_finished_floor', box_en: '1-gang single 15A receptacle (low rear Viking pocket)', box_es: 'Caja sencilla contacto 15A (franja baja trasera Viking)', note_en: 'Inside 9/16"–4-15/16" low rear pocket beside 1/2" gas shutoff (<=2" poke-out). Owned Viking has low 1" island trim.', note_es: 'Dentro de franja baja 9/16"–4-15/16" junto a llave gas 1/2" (<=2" salida). Estufa Viking confirmada con borde bajo 1".' },
      { id: 'HD-1', ckt: 'HD', space: 8, wall: 'west', x: 115.5, y: 95.25, z: 84.5, station: 35.25, gauge: '14/2', boundary: 'above_finished_floor', box_en: 'Flush 1-gang 2"×3" box (direct hardwire into Zephyr hood)', box_es: 'Caja sencilla 2"×3" al ras (conexión directa a campana Zephyr)', note_en: 'Centered at 33" ± 2-1/4", ~83"–86" above finished floor (+t bare subfloor) inside 8-5/8" chimney shroud. Replaces retired 4"×4" box at 100"/104".', note_es: 'A eje 33" ± 2-1/4", ~83"–86" sobre piso terminado (+t subpiso) dentro del cubre-ducto 8-5/8". Reemplaza caja 4"×4" a 100"/104".' },
      { id: 'SW-ENTRY', ckt: 'LT', space: 9, wall: 'north', x: 6, y: 126.25, z: 48, station: 6, gauge: '14/2', boundary: 'above_finished_floor', box_en: '3-gang switch box (Main Dimmer | Sink Lights Dimmer | Under-Cab / Spare)', box_es: 'Caja triple de apagadores (Luz Principal | Fregadero | Bajo Gabinete / Reserva)', note_en: '6" west of NE hallway opening on right side entering kitchen; clear of 29-1/2" × 79" hall opening.', note_es: 'A 6" al oeste de esquina NE entrando del pasillo; libre del vano de 29-1/2" × 79".' },
      { id: 'L1-MAIN', ckt: 'LT', space: 9, wall: 'ceiling', x: 58, y: 75, z: 121.5, station: 58, gauge: '14/2', boundary: 'wall_to_wall', box_en: 'Ceiling main light box (high-efficiency dimmer)', box_es: 'Caja luz principal de techo (con atenuador)', note_en: 'Centered over open kitchen work floor (58" W of East wall, 75" N of South wall).', note_es: 'Centrada en el piso libre de cocina (58" desde muro Este, 75" desde muro Sur).' }
    ];
    return list;
  }

  function evaluateCounterReach() {
    const sinkStart = Number(state.sink_base_start_in) || 72.0;
    const sinkEnd = sinkStart + (Number(state.sink_base_width_in) || 30.0);
    const pieStart = Number(state.pie_safe_start_in) || 26.0;
    const pieEnd = pieStart + (Number(state.pie_safe_width_in) || 33.0);

    const eastMax = Math.max(10, (48 - 10) / 2, 60 - 48); /* 19" */
    const westLeftMax = Math.max(9, 18 - 9); /* 9" */
    const westRightMax = Math.max(57 - 48, 66 - 57); /* 9" */
    const southLeftMax = Math.max(24, (65 - 24) / 2, Math.abs(sinkStart - 65));
    const southRightCounterW = Math.max(0, 112 - sinkEnd); /* counter right of sink before rear door */
    const southRightNeedsOutlet = southRightCounterW >= 12.0;

    const pieClashS1 = pieStart <= 25.5;
    const pieClashS2 = pieEnd >= 63.5;

    const segments = [
      { id: 'east', wall: 'east', maxDist: eastMax, pass: eastMax <= 24.0 },
      { id: 'south_left', wall: 'south', maxDist: southLeftMax, pass: southLeftMax <= 24.0 && !pieClashS1 && !pieClashS2 },
      { id: 'south_right', wall: 'south', maxDist: southRightCounterW, pass: !southRightNeedsOutlet },
      { id: 'west_left', wall: 'west', maxDist: westLeftMax, pass: westLeftMax <= 24.0 },
      { id: 'west_right', wall: 'west', maxDist: westRightMax, pass: westRightMax <= 24.0 }
    ];
    const allPass = segments.every((s) => s.pass);
    return { allPass, segments, pieClashS1, pieClashS2, southRightNeedsOutlet, southRightCounterW };
  }

  /* ── Live 3D Manhattan Cable Length Calculator (|Δx| + |Δy| + |Δz| + 18" tails) ── */
  function manhattanPathFt(pts, boxEnds) {
    let inches = 0;
    for (let i = 1; i < pts.length; i++) {
      inches += Math.abs(pts[i][0] - pts[i - 1][0]) +
                Math.abs(pts[i][1] - pts[i - 1][1]) +
                Math.abs(pts[i][2] - pts[i - 1][2]);
    }
    inches += (boxEnds || 2) * 18;
    return Number((inches / 12).toFixed(1));
  }

  function computeTakeoff() {
    const hC = Number(state.counter_outlet_height_in) || 44.0;
    const sinkStart = Number(state.sink_base_start_in) || 72.0;
    const dwX = sinkStart + 4.0;
    const swX = sinkStart - 5.0;
    const inWall = state.south_routing_mode === 'in_wall_bored';
    const optB = state.sink_control_mode === 'option_b_wired_2gang';
    const threeTask = state.south_task_light_mode === 'three_task_lights';
    const wastePct = Math.max(0, Math.min(40, Number(state.waste_pct) || 15));
    const mult = 1 + wastePct / 100;

    const D04 = [0, 20.25, 65];
    const ATTIC_Z = 126;

    /* Exact live Manhattan runs per Kitchen Circuit (Spaces 1-9) */
    const saAFt = manhattanPathFt([D04, [0, 20.25, 50], [0, 10, 50], [0, 10, hC], [0, 10, 50], [0, 48, 50], [0, 48, hC]], 4);
    const saBFt = inWall
      ? manhattanPathFt([D04, [0, 20.25, 30], [0, 0, 30], [24, 0, 30], [24, 0, hC], [24, 0, 30], [65, 0, 30], [65, 0, hC]], 4)
      : manhattanPathFt([D04, [0, 20.25, ATTIC_Z], [24, 0, ATTIC_Z], [24, 0, hC], [24, 0, ATTIC_Z], [65, 0, ATTIC_Z], [65, 0, hC]], 4);
    const saCFt = manhattanPathFt([D04, [0, 20.25, ATTIC_Z], [115.5, 69, ATTIC_Z], [115.5, 69, hC], [115.5, 69, 50], [115.5, 117, 50], [115.5, 117, hC]], 4);
    const refFt = manhattanPathFt([D04, [0, 20.25, 52.5], [0, 74, 52.5], [0, 74, 15]], 2);

    const dwFt = inWall
      ? manhattanPathFt([D04, [0, 20.25, 24], [0, 0, 24], [dwX, 0, 24], [dwX, 0, 14]], 2)
      : manhattanPathFt([D04, [0, 20.25, ATTIC_Z], [dwX, 0, ATTIC_Z], [dwX, 0, 14]], 2);
    const gdFt = inWall
      ? (optB
          ? manhattanPathFt([D04, [0, 20.25, 26], [0, 0, 26], [swX, 0, 26], [swX, 0, 39.5], [swX, 0, 20], [dwX, 0, 20], [dwX, 0, 14]], 4)
          : manhattanPathFt([D04, [0, 20.25, 26], [0, 0, 26], [dwX, 0, 26], [dwX, 0, 14]], 2))
      : (optB
          ? manhattanPathFt([D04, [0, 20.25, ATTIC_Z], [swX, 0, ATTIC_Z], [swX, 0, 39.5], [swX, 0, 20], [dwX, 0, 20], [dwX, 0, 14]], 4)
          : manhattanPathFt([D04, [0, 20.25, ATTIC_Z], [dwX, 0, ATTIC_Z], [dwX, 0, 14]], 2));
    const rgFt = manhattanPathFt([D04, [0, 20.25, ATTIC_Z], [115.5, 93, ATTIC_Z], [115.5, 93, 3]], 2);
    const hdFt = manhattanPathFt([D04, [0, 20.25, ATTIC_Z], [115.5, 95.25, ATTIC_Z], [115.5, 95.25, 84.5]], 2);

    const taskPts = threeTask
      ? [[6, 126.25, 48], [6, 126.25, ATTIC_Z], [17.75, 14.5, ATTIC_Z], [53.75, 14.5, ATTIC_Z], [89.75, 14.5, ATTIC_Z]]
      : [[6, 126.25, 48], [6, 126.25, ATTIC_Z], [78, 15, ATTIC_Z], [102, 15, ATTIC_Z]];
    const ltFeed = manhattanPathFt([D04, [0, 20.25, ATTIC_Z], [6, 126.25, ATTIC_Z], [6, 126.25, 48]], 2);
    const ltMain = manhattanPathFt([[6, 126.25, 48], [6, 126.25, ATTIC_Z], [58, 75, ATTIC_Z]], 2);
    const ltTask = manhattanPathFt(taskPts, threeTask ? 4 : 3);
    const ltFt = Number((ltFeed + ltMain + ltTask).toFixed(1));

    const traveler143Net = optB
      ? manhattanPathFt([[6, 126.25, 48], [6, 126.25, ATTIC_Z], [swX, 0, ATTIC_Z], [swX, 0, 39.5]], 2)
      : 0.0;

    const perCircuit = {
      'SA-A': saAFt, 'SA-B': saBFt, 'SA-C': saCFt, 'REF': refFt,
      'DW': dwFt, 'GD': gdFt, 'RG': rgFt, 'HD': hdFt, 'LT': ltFt
    };

    const net12_2 = Number((saAFt + saBFt + saCFt + refFt).toFixed(1));
    const net14_2 = Number((dwFt + gdFt + rgFt + hdFt + ltFt).toFixed(1));
    const net14_3 = Number(traveler143Net.toFixed(1));
    const gross12_2 = Math.ceil(net12_2 * mult);
    const gross14_2 = Math.ceil(net14_2 * mult);
    const gross14_3 = optB ? Math.ceil(net14_3 * mult) : 0;

    const useDeadfrontRg = state.range_gfci_method === 'afci_breaker_plus_accessible_deadfront_gfci';
    const breakers = {
      BRN120DF: 4,
      BRN115DF: useDeadfrontRg ? 2 : 3,
      BRN115AF: useDeadfrontRg ? 3 : 2,
      BRLW1_lockoff: 1,
      deadfront_gfci_15a: useDeadfrontRg ? 1 : 0
    };
    const boxes = {
      one_gang_boxes: 8,
      hood_flush_2x3_box: 1,
      west_1in_tile_mud_rings: 2,
      two_gang_boxes: optB ? 2 : 1,
      three_gang_entry_box: 1,
      ceiling_boxes: threeTask ? 4 : 3
    };

    return {
      waste_pct: wastePct,
      perCircuit,
      nm_b_12_2: { net_ft: net12_2, gross_ft: gross12_2 },
      nm_b_14_2: { net_ft: net14_2, gross_ft: gross14_2 },
      nm_b_14_3: { net_ft: net14_3, gross_ft: gross14_3 },
      breakers,
      boxes,
      zero_prices_verified: true
    };
  }

  /* ── SVG Primitive Helpers ── */
  function el(tag, attrs, parent) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, String(attrs[k]));
      });
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  function txt(x, y, str, attrs, parent) {
    const n = el('text', Object.assign({ x, y, 'font-family': 'SF Pro Text, -apple-system, Helvetica, Arial, sans-serif' }, attrs || {}), parent);
    n.textContent = str;
    return n;
  }

  function circuitActive(cktId) {
    if (!selectedCircuit) return true;
    if (String(cktId).includes('+')) {
      return String(cktId).split('+').map((s) => s.trim()).includes(selectedCircuit);
    }
    return cktId === selectedCircuit;
  }

  function wireColor(gauge) {
    if (gauge === '12/2') return '#b45309';
    if (gauge === '14/3') return '#6d28d9';
    return '#1d4ed8';
  }

  /* ── Shared Drafting Frame: Defs, Header, Compass Rose, Bar Scale, Title Block ── */
  function addCommonDefs(svg) {
    const defs = el('defs', {}, svg);
    const patNoScrew = el('pattern', { id: 'pat-noscrew', width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 10, height: 10, fill: '#fee2e2' }, patNoScrew);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: '#dc2626', 'stroke-width': 2.5 }, patNoScrew);

    const patBlock = el('pattern', { id: 'pat-block', width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-45)' }, defs);
    el('rect', { width: 9, height: 9, fill: '#fef3c7' }, patBlock);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 9, stroke: '#d97706', 'stroke-width': 1.6 }, patBlock);

    const patWork = el('pattern', { id: 'pat-workzone', width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 10, height: 10, fill: '#eff6ff' }, patWork);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: '#60a5fa', 'stroke-width': 1.2 }, patWork);
  }

  function drawSheetFrame(svg, titleMain, titleSub, badgeText, badgeOk) {
    el('rect', { x: 0, y: 0, width: 920, height: 1120, fill: '#ffffff' }, svg);
    el('rect', { x: 14, y: 14, width: 892, height: 1092, fill: 'none', stroke: '#10202b', 'stroke-width': 1.8 }, svg);

    /* Top Title Strip */
    el('rect', { x: 15, y: 15, width: 890, height: 54, fill: '#f4f7f9', stroke: '#cbd5e1', 'stroke-width': 1 }, svg);
    txt(28, 37, titleMain, { 'font-size': 15.5, 'font-weight': 800, fill: '#10202b' }, svg);
    txt(28, 56, titleSub, { 'font-size': 10.5, fill: '#4b5c69', 'font-weight': 600 }, svg);

    /* Right Status Badge */
    const bx = 664;
    el('rect', { x: bx, y: 23, width: 228, height: 38, rx: 5, fill: badgeOk ? '#e6efe9' : '#fef2f2', stroke: badgeOk ? '#2f4f42' : '#dc2626', 'stroke-width': 1.2 }, svg);
    txt(bx + 114, 39, badgeText, { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 800, fill: badgeOk ? '#2f4f42' : '#991b1b' }, svg);
    const stampStr = state.base_rev + ' · ' + (tailnetOnline ? t('tailnet_live') : (lang === 'es' ? 'Vista Local' : 'Local Preview'));
    txt(bx + 114, 54, stampStr.slice(0, 46), { 'text-anchor': 'middle', 'font-size': 8.5, fill: '#475569', 'font-weight': 600 }, svg);
  }

  function drawCompass(svg, cx, cy, facingLabel) {
    const g = el('g', {}, svg);
    el('circle', { cx, cy, r: 28, fill: '#ffffff', stroke: '#94a3b8', 'stroke-width': 1.3 }, g);
    el('line', { x1: cx, y1: cy - 22, x2: cx, y2: cy + 22, stroke: '#64748b', 'stroke-width': 1.1 }, g);
    el('line', { x1: cx - 22, y1: cy, x2: cx + 22, y2: cy, stroke: '#64748b', 'stroke-width': 1.1 }, g);
    el('polygon', { points: `${cx},${cy - 22} ${cx - 5},${cy - 8} ${cx + 5},${cy - 8}`, fill: '#b91c1c' }, g);
    txt(cx, cy - 31, 'N', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#b91c1c' }, g);
    txt(cx, cy + 38, 'S', { 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: '#334155' }, g);
    txt(cx + 35, cy + 3.5, 'E', { 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: '#334155' }, g);
    txt(cx - 35, cy + 3.5, lang === 'es' ? 'O' : 'W', { 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: '#334155' }, g);
    if (facingLabel) {
      txt(cx, cy + 52, facingLabel, { 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill: '#15539e' }, g);
    }
  }

  function drawBarScale(svg, x, y, S, maxFeet) {
    const feet = maxFeet || 4;
    txt(x, y - 6, lang === 'es' ? `ESCALA GRÁFICA (Uniforme X = Y · ${S.toFixed(2)} px/pulg)` : `BAR SCALE (Uniform True Scale X = Y · ${S.toFixed(2)} px/in)`, { 'font-size': 9.2, 'font-weight': 800, fill: '#10202b' }, svg);
    for (let f = 0; f < feet; f++) {
      el('rect', {
        x: x + f * 12 * S, y, width: 12 * S, height: 7,
        fill: f % 2 === 0 ? '#10202b' : '#ffffff', stroke: '#10202b', 'stroke-width': 1
      }, svg);
      txt(x + f * 12 * S, y + 19, `${f}'`, { 'text-anchor': 'middle', 'font-size': 8.8, fill: '#334155', 'font-weight': 600 }, svg);
    }
    txt(x + feet * 12 * S, y + 19, `${feet}'`, { 'text-anchor': 'middle', 'font-size': 8.8, fill: '#334155', 'font-weight': 600 }, svg);
  }

  function drawTitleBlock(svg, takeoff, reach) {
    const y0 = 994;
    el('rect', { x: 24, y: y0, width: 872, height: 98, fill: '#fafbfc', stroke: '#10202b', 'stroke-width': 1.4 }, svg);
    el('line', { x1: 315, y1: y0, x2: 315, y2: y0 + 98, stroke: '#94a3b8', 'stroke-width': 1 }, svg);
    el('line', { x1: 625, y1: y0, x2: 625, y2: y0 + 98, stroke: '#94a3b8', 'stroke-width': 1 }, svg);

    const floorTxt = state.floor_condition === 'finished_installed'
      ? (lang === 'es' ? 'Piso terminado instalado (+0")' : 'Finished floor installed (+0")')
      : (lang === 'es' ? `Subpiso desnudo (+t = ${fracIn(effectiveFloorT())})` : `Bare subfloor (+t = ${fracIn(effectiveFloorT())})`);

    txt(34, y0 + 18, '1231 11th Ave · Unit 4 · Kitchen Electrical', { 'font-size': 11, 'font-weight': 800, fill: '#10202b' }, svg);
    txt(34, y0 + 35, lang === 'es' ? 'San Francisco, CA 94122 · Cero Precios' : 'San Francisco, CA 94122 · Zero Prices', { 'font-size': 9.2, fill: '#4b5c69' }, svg);
    txt(34, y0 + 52, `12/2 Cu: ${takeoff.nm_b_12_2.net_ft}→${takeoff.nm_b_12_2.gross_ft} ft (+${takeoff.waste_pct}%)`, { 'font-size': 9.2, 'font-weight': 700, fill: '#b45309' }, svg);
    txt(34, y0 + 68, `14/2 Cu: ${takeoff.nm_b_14_2.net_ft}→${takeoff.nm_b_14_2.gross_ft} ft · 14/3: ${takeoff.nm_b_14_3.gross_ft} ft`, { 'font-size': 9.2, 'font-weight': 700, fill: '#1d4ed8' }, svg);
    txt(34, y0 + 85, lang === 'es' ? 'Tablaroca 1/2" a Hardie 0.42" · SIN calzas' : '1/2" Drywall to 0.42" Hardie · NO stud shims', { 'font-size': 8.8, fill: '#2f4f42', 'font-weight': 700 }, svg);

    txt(327, y0 + 18, lang === 'es' ? 'Tablero D04 (Eaton BRP20L125G · 20 Espacios)' : 'Subpanel D04 (Eaton BRP20L125G · 20 Spaces)', { 'font-size': 10.5, 'font-weight': 800, fill: '#15539e' }, svg);
    txt(327, y0 + 35, lang === 'es' ? `Contactos Cubierta: ${fracIn(state.counter_outlet_height_in)} · HD-1: 83"–86"` : `Counter Outlets: ${fracIn(state.counter_outlet_height_in)} · HD-1: 83"–86"`, { 'font-size': 9.2, fill: '#10202b', 'font-weight': 600 }, svg);
    txt(327, y0 + 51, lang === 'es' ? 'SOLO PLANEACIÓN Y MAQUETA — INSTALACIÓN EN ESPERA' : 'PLANNING & MOCKUP ONLY — ROUGH-IN ON HOLD', { 'font-size': 8.8, 'font-weight': 800, fill: '#b91c1c' }, svg);
    el('rect', { x: 327, y: y0 + 60, width: 286, height: 28, rx: 3, fill: '#fffbeb', stroke: '#f59e0b', 'stroke-width': 1 }, svg);
    txt(335, y0 + 72, lang === 'es' ? 'SELLO DE REVISIÓN:' : 'REVISION STAMP:', { 'font-size': 7.8, 'font-weight': 700, fill: '#92400e' }, svg);
    txt(335, y0 + 83, `${state.base_rev} · ${floorTxt}`, { 'font-size': 8.5, 'font-weight': 700, fill: '#10202b' }, svg);

    txt(637, y0 + 18, lang === 'es' ? 'ESCALA: Uniforme Real (scaleX = scaleY)' : 'SCALE: Uniform True Scale (scaleX = scaleY)', { 'font-size': 10, 'font-weight': 800, fill: '#10202b' }, svg);
    txt(637, y0 + 35, lang === 'es' ? `Alcance 24" Cubierta: ${reach.allPass ? 'CUMPLE' : 'REVISAR'}` : `24" Counter Reach: ${reach.allPass ? 'PASS' : 'CHECK CLASH'}`, { 'font-size': 9.2, 'font-weight': 700, fill: reach.allPass ? '#2f4f42' : '#b91c1c' }, svg);
    txt(637, y0 + 52, lang === 'es' ? 'Límites: wall_to_wall · clear_between_casings' : 'Boundaries: wall_to_wall · clear_between_casings', { 'font-size': 8.4, fill: '#4b5c69' }, svg);
    txt(637, y0 + 68, lang === 'es' ? 'to_casing_edge · above_finished_floor · subfloor' : 'to_casing_edge · above_finished_floor · subfloor', { 'font-size': 8.4, fill: '#4b5c69' }, svg);
    txt(637, y0 + 85, lang === 'es' ? 'Inglés Rige · Verificar todas las medidas en obra' : 'English Governs · Measure & verify on site', { 'font-size': 8.8, 'font-weight': 700, fill: '#15539e' }, svg);
  }

  /* Helper to draw an interactive electrical box badge */
  function drawDeviceBox(svg, cx, cy, dev, wPx, hPx, labelPos, displayId) {
    const active = circuitActive(dev.ckt);
    const isSel = selectedBoxId === dev.id;
    const col = wireColor(dev.gauge);
    const g = el('g', {
      'data-device-id': dev.id,
      'data-circuit': dev.ckt,
      style: 'cursor:pointer;',
      opacity: active ? 1 : 0.25
    }, svg);

    el('rect', {
      x: cx - wPx / 2, y: cy - hPx / 2, width: wPx, height: hPx, rx: 3,
      fill: isSel ? '#fef08a' : '#ffffff',
      stroke: isSel ? '#10202b' : col,
      'stroke-width': isSel ? 2.6 : 1.9
    }, g);
    const labelText = displayId || dev.id;
    const fSz = (wPx <= 30 && labelText.length >= 5) ? 7.0 : 8.2;
    txt(cx, cy + 3.0, labelText, { 'text-anchor': 'middle', 'font-size': fSz, 'font-weight': 800, fill: col }, g);

    if (labelPos === 'top' || labelPos === 'bottom' || labelPos === 'left' || labelPos === 'right') {
      const tVal = effectiveFloorT();
      const hTxt = tVal > 0 ? `${fracIn(dev.z)} (+t ${fracIn(dev.z + tVal)})` : `${fracIn(dev.z)}`;
      let lx = cx;
      let ly = cy + hPx / 2 + 11;
      let anchor = 'middle';
      if (labelPos === 'top') {
        ly = cy - hPx / 2 - 5;
      } else if (labelPos === 'left') {
        lx = cx - wPx / 2 - 5;
        ly = cy + 3;
        anchor = 'end';
      } else if (labelPos === 'right') {
        lx = cx + wPx / 2 + 5;
        ly = cy + 3;
        anchor = 'start';
      }
      const pillW = hTxt.length * 4.5 + 8;
      const pillX = anchor === 'middle' ? lx - pillW / 2 : (anchor === 'end' ? lx - pillW + 2 : lx - 2);
      el('rect', { x: pillX, y: ly - 8.5, width: pillW, height: 11, rx: 2, fill: 'rgba(255,255,255,0.88)' }, g);
      txt(lx, ly, hTxt, { 'text-anchor': anchor, 'font-size': 7.8, 'font-weight': 700, fill: '#1e293b' }, g);
    }

    g.addEventListener('click', (ev) => {
      ev.stopPropagation();
      selectDevice(dev);
    });
    return g;
  }

  function drawHeightRuler(svg, ox, py, ticks, tVal, highlightList) {
    const sorted = ticks.slice().sort((a, b) => a - b);
    sorted.forEach((h, i) => {
      const y = py(h);
      const isHl = Array.isArray(highlightList) && highlightList.includes(h);
      el('line', { x1: ox - 6, y1: y, x2: ox, y2: y, stroke: '#475569', 'stroke-width': 1.2 }, svg);
      const closeToPrev = i > 0 && Math.abs(py(sorted[i - 1]) - y) < 22;
      const closeToNext = i < sorted.length - 1 && Math.abs(y - py(sorted[i + 1])) < 22;
      if (tVal > 0 && (closeToPrev || closeToNext)) {
        txt(ox - 9, y + 3, `${fracIn(h)} (${fracIn(h + tVal)})`, {
          'text-anchor': 'end', 'font-size': 7.6, 'font-weight': 700, fill: isHl ? '#b91c1c' : '#10202b'
        }, svg);
      } else {
        txt(ox - 9, y + 3, fracIn(h), {
          'text-anchor': 'end', 'font-size': 8.4, 'font-weight': 700, fill: isHl ? '#b91c1c' : '#10202b'
        }, svg);
        if (tVal > 0) {
          txt(ox - 9, y + 12.5, `(${fracIn(h + tVal)})`, {
            'text-anchor': 'end', 'font-size': 7.2, fill: '#b45309', 'font-weight': 700
          }, svg);
        }
      }
    });
  }

  function selectDevice(dev) {
    selectedBoxId = dev.id;
    selectedSlotSpace = null;
    selectedCircuit = dev.ckt.includes('+') ? dev.ckt.split('+')[0].trim() : dev.ckt;
    updateInspectorForDevice(dev);
    render();
  }

  function updateInspectorForDevice(dev) {
    const titleEl = $('insp-title');
    const bodyEl = $('insp-body');
    if (!titleEl || !bodyEl) return;
    const hStr = heightDualLabel(dev.z);
    titleEl.textContent = `${dev.id} · ${lang === 'es' ? 'Circuito' : 'Circuit'} ${dev.ckt} (${lang === 'es' ? 'Espacio' : 'Space'} ${dev.spaces ? dev.spaces.join('+') : dev.space})`;
    bodyEl.innerHTML =
      `<div><strong>${lang === 'es' ? 'Caja:' : 'Box:'}</strong> ${lang === 'es' ? dev.box_es : dev.box_en}</div>` +
      `<div><strong>${lang === 'es' ? 'Posición:' : 'Position:'}</strong> ${fracIn(dev.station)} · <strong>${lang === 'es' ? 'Altura:' : 'Height:'}</strong> ${hStr} <span class="boundary-tag">${dev.boundary}</span></div>` +
      `<div style="margin-top:3px;">${lang === 'es' ? dev.note_es : dev.note_en}</div>`;
  }

  function updateInspectorForSlot(slot, takeoff) {
    const titleEl = $('insp-title');
    const bodyEl = $('insp-body');
    if (!titleEl || !bodyEl) return;
    const liveFt = slot.group === 'kitchen' ? takeoff.perCircuit[slot.id] : slot.base_ft;
    const grossFt = Math.ceil((liveFt || 0) * (1 + takeoff.waste_pct / 100));
    titleEl.textContent = `D04 ${lang === 'es' ? 'Espacio' : 'Space'} ${slot.space} — ${slot.id} (${slot.amps ? slot.amps + 'A' : (lang === 'es' ? 'Libre' : 'Spare')})`;
    bodyEl.innerHTML =
      `<div><strong>${lang === 'es' ? 'Alimenta:' : 'Serves:'}</strong> ${lang === 'es' ? slot.serves_es : slot.serves_en}</div>` +
      `<div><strong>${lang === 'es' ? 'Pastilla:' : 'Breaker:'}</strong> ${slot.cat} (${lang === 'es' ? slot.breaker_es : slot.breaker_en})</div>` +
      `<div><strong>${lang === 'es' ? 'Cable / Ruta:' : 'Cable / Route:'}</strong> ${slot.cable} · ${lang === 'es' ? slot.route_es : slot.route_en} · <strong>${liveFt} ft ${lang === 'es' ? 'neto' : 'net'} → ${grossFt} ft (+${takeoff.waste_pct}%)</strong></div>`;
  }

  /* ── VIEW 1: Top-Down Floor, Ceiling & Cable-Route Plan (147" × 126-1/4") ── */
  function renderViewFloor(svg, devs, takeoff, reach) {
    const S = 3.25; /* Strict uniform true scale: 147 * 3.25 = 477.75 px, 126.25 * 3.25 = 410.31 px */
    lastScaleInfo = { view: 'floor', scaleX: S, scaleY: S, uniform: true };

    /* Coordinate mapping: SE corner at (ox + 147*S, oy + 126.25*S); x goes West (left), y goes North (up) */
    const ox = 48;
    const oy = 112;
    const roomW = 147.0;
    const roomH = 126.25;
    const px = (xWest) => ox + (roomW - xWest) * S;
    const py = (yNorth) => oy + (roomH - yNorth) * S;

    drawSheetFrame(
      svg,
      lang === 'es' ? 'VISTA 1 — PLANTA ELÉCTRICA, TECHO Y RUTAS DE CABLE (147" × 126-1/4")' : 'VIEW 1 — TOP-DOWN FLOOR, CEILING & CABLE ROUTES (147" × 126-1/4")',
      lang === 'es' ? 'Escala Uniforme X = Y · Sólido = En Muro · Punteado = Por Ático · Arcos Alcance 24" · Sin Precios' : 'Uniform True Scale X = Y · Solid = In-Wall Bore Band · Dashed = Attic Home Run · Live 24" Reach · Zero Prices',
      reach.allPass
        ? (lang === 'es' ? 'ALCANCE 24": CUMPLE · ESCALA 1:1' : '24" COUNTER REACH: PASS · 1:1')
        : (lang === 'es' ? 'ALCANCE 24": REVISAR CHOQUE' : '24" COUNTER REACH: CHECK'),
      reach.allPass
    );

    /* Room L-Polygon (North 115.5", East 126.25", South 147", West recess 60" + 31.5" step + West range 66.25") */
    const polyPts = [
      [px(0), py(0)],
      [px(147), py(0)],
      [px(147), py(60)],
      [px(115.5), py(60)],
      [px(115.5), py(126.25)],
      [px(0), py(126.25)]
    ].map((p) => p.join(',')).join(' ');
    el('polygon', { points: polyPts, fill: '#f8fafc', stroke: '#10202b', 'stroke-width': 3 }, svg);

    /* Base Cabinets & Appliances (24" counter depth true to scale) */
    const sinkS = state.sink_base_start_in;
    const sinkE = sinkS + state.sink_base_width_in;
    /* East Wall: Corner 0-36, Drawer 36-60, Haier Fridge 60-88 (28" deep w/ 2" gap) */
    el('rect', { x: px(24), y: py(60), width: 24 * S, height: 60 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.3 }, svg);
    el('rect', { x: px(29.5), y: py(88), width: 29.5 * S, height: 28 * S, fill: '#e2e8f0', stroke: '#475569', 'stroke-width': 1.4 }, svg);

    /* South Wall: 0-112 base cabinets (depth 24") */
    el('rect', { x: px(112), y: py(24), width: 112 * S, height: 24 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.3 }, svg);
    /* Dishwasher 48-72 */
    el('rect', { x: px(72), y: py(24), width: 24 * S, height: 24 * S, fill: '#f1f5f9', stroke: '#475569', 'stroke-width': 1.2, 'stroke-dasharray': '4,3' }, svg);
    /* Sink Base (draggable synced!) */
    el('rect', { x: px(sinkE), y: py(24), width: (sinkE - sinkS) * S, height: 24 * S, fill: '#dbeafe', stroke: '#15539e', 'stroke-width': 1.5 }, svg);

    /* West Range Wall: 18" base + 30" Viking Range (28" deep) + 18" base */
    el('rect', { x: px(115.5), y: py(78), width: 24 * S, height: 18 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.3 }, svg);
    el('rect', { x: px(115.5), y: py(108), width: 28 * S, height: 30 * S, fill: '#fff7ed', stroke: '#c2410c', 'stroke-width': 1.6 }, svg);
    el('rect', { x: px(115.5), y: py(126), width: 24 * S, height: 18 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.3 }, svg);

    /* Openings: NE Hall (29.5") & SW Rear Door */
    el('line', { x1: px(0), y1: py(96.5), x2: px(0), y2: py(126), stroke: '#ffffff', 'stroke-width': 4.5 }, svg);
    txt(px(-3), py(111), lang === 'es' ? 'PASILLO 29-1/2"' : 'HALL 29-1/2"', { 'font-size': 8, 'font-weight': 700, fill: '#15539e' }, svg);
    el('line', { x1: px(116.4), y1: py(0), x2: px(142.25), y2: py(0), stroke: '#ffffff', 'stroke-width': 4.5 }, svg);
    txt(px(129.3), py(-5), lang === 'es' ? 'PUERTA TRASERA' : 'REAR DOOR', { 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#475569' }, svg);

    /* Dining-side Subpanel D04 + 30" x 36" Clear Working Zone (east of x=0 wall!) */
    const d04Cy = py(20.25);
    const d04X = px(0);
    el('rect', { x: d04X + 2, y: py(27.5), width: 14, height: 14.5 * S, fill: '#15539e', stroke: '#10202b', 'stroke-width': 1.5 }, svg);
    txt(d04X + 9, d04Cy + 3, 'D04', { 'text-anchor': 'middle', 'font-size': 7.5, 'font-weight': 800, fill: '#ffffff', transform: `rotate(-90 ${d04X + 9} ${d04Cy + 3})` }, svg);
    /* 30" wide x 36" deep Dining Working Zone (true scale!) */
    el('rect', { x: d04X + 16, y: py(35.25), width: 36 * S, height: 30 * S, fill: 'url(#pat-workzone)', stroke: '#2563eb', 'stroke-width': 1.4, 'stroke-dasharray': '5,3' }, svg);
    txt(d04X + 16 + 18 * S, py(23), lang === 'es' ? 'ZONA TRABAJO D04' : 'D04 DINING WORK ZONE', { 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 800, fill: '#1d4ed8' }, svg);
    txt(d04X + 16 + 18 * S, py(17), lang === 'es' ? '30" AN × 36" PROF × 78" AL' : '30" W × 36" D × 78" H', { 'text-anchor': 'middle', 'font-size': 7.8, 'font-weight': 700, fill: '#1e40af' }, svg);

    /* D04 Kitchen-Side No-Screw Strip */
    if (layers.holds) {
      el('rect', { x: px(5), y: py(27.5), width: 5 * S, height: 14.5 * S, fill: 'url(#pat-noscrew)', stroke: '#dc2626', 'stroke-width': 1.5 }, svg);
    }

    /* Live 24" Countertop Reach Arcs (Green <= 24", Red > 24") */
    if (layers.reach) {
      const counterPts = [
        { id: 'E1', x: px(0), y: py(10), pass: reach.segments[0].pass },
        { id: 'E2', x: px(0), y: py(48), pass: reach.segments[0].pass },
        { id: 'S1', x: px(24), y: py(0), pass: !reach.pieClashS1 && reach.segments[1].pass },
        { id: 'S2', x: px(65), y: py(0), pass: !reach.pieClashS2 && reach.segments[1].pass },
        { id: 'W1', x: px(115.5), y: py(69), pass: reach.segments[3].pass },
        { id: 'W2', x: px(115.5), y: py(117), pass: reach.segments[4].pass }
      ];
      counterPts.forEach((pt) => {
        el('circle', {
          cx: pt.x, cy: pt.y, r: 24 * S,
          fill: pt.pass ? 'rgba(22, 163, 74, 0.08)' : 'rgba(220, 38, 38, 0.14)',
          stroke: pt.pass ? '#16a34a' : '#dc2626',
          'stroke-width': 1.3, 'stroke-dasharray': '4,3'
        }, svg);
      });
      if (reach.southRightNeedsOutlet) {
        el('rect', { x: px(112), y: py(24), width: reach.southRightCounterW * S, height: 24 * S, fill: 'rgba(220,38,38,0.22)', stroke: '#dc2626', 'stroke-width': 2 }, svg);
        txt(px(sinkE + reach.southRightCounterW / 2), py(27), lang === 'es' ? '>12" SIN CONTACTO' : '>12" NEEDS OUTLET', { 'text-anchor': 'middle', 'font-size': 7.8, 'font-weight': 800, fill: '#b91c1c' }, svg);
      }
    }

    /* Cable Routes (Solid = In-Wall Bore Bands, Dashed = Attic Home Runs) */
    if (layers.routes) {
      const inWall = state.south_routing_mode === 'in_wall_bored';
      const drawRoute = (ckt, gauge, pts, isAttic) => {
        const active = circuitActive(ckt);
        const col = wireColor(gauge);
        el('polyline', {
          points: pts.map((p) => `${px(p[0])},${py(p[1])}`).join(' '),
          fill: 'none', stroke: col,
          'stroke-width': selectedCircuit === ckt ? 3.2 : 2.0,
          'stroke-dasharray': isAttic ? '6,4' : 'none',
          opacity: active ? 0.92 : 0.16
        }, svg);
      };
      /* East In-Wall (SA-A, REF) */
      drawRoute('SA-A', '12/2', [[0, 20.25], [2, 10], [2, 48]], false);
      drawRoute('REF', '12/2', [[0, 20.25], [4.5, 20.25], [4.5, 74], [0, 74]], false);
      /* South (SA-B, DW, GD) — switches Solid vs Dashed when user toggles routing! */
      const dwX = sinkS + 4;
      drawRoute('SA-B', '12/2', [[0, 20.25], [3, 3], [24, 3], [65, 3]], !inWall);
      drawRoute('DW', '14/2', [[0, 20.25], [6, 6], [dwX, 6]], !inWall);
      drawRoute('GD', '14/2', [[0, 20.25], [8.5, 8.5], [dwX, 8.5]], !inWall);
      /* West Attic Home Runs (SA-C, RG, HD) */
      drawRoute('SA-C', '12/2', [[0, 20.25], [62, 69], [115.5, 69], [113, 117]], true);
      drawRoute('RG', '14/2', [[0, 20.25], [56, 93], [115.5, 93]], true);
      drawRoute('HD', '14/2', [[0, 20.25], [48, 95.25], [115.5, 95.25]], true);
      /* Lighting Attic Run (LT) */
      drawRoute('LT', '14/2', [[0, 20.25], [6, 126.25], [58, 75]], true);
      if (state.sink_control_mode === 'option_b_wired_2gang') {
        drawRoute('LT', '14/3', [[6, 126.25], [sinkS - 5, 70], [sinkS - 5, 0]], true);
      }
    }

    /* Ceiling Lights Layer */
    if (layers.ceiling) {
      const activeLt = circuitActive('LT');
      const drawLight = (xW, yN, lbl) => {
        const g = el('g', { opacity: activeLt ? 1 : 0.25 }, svg);
        el('circle', { cx: px(xW), cy: py(yN), r: 8, fill: '#fef9c3', stroke: '#ca8a04', 'stroke-width': 1.8 }, g);
        el('line', { x1: px(xW) - 5, y1: py(yN) - 5, x2: px(xW) + 5, y2: py(yN) + 5, stroke: '#ca8a04', 'stroke-width': 1.2 }, g);
        el('line', { x1: px(xW) + 5, y1: py(yN) - 5, x2: px(xW) - 5, y2: py(yN) + 5, stroke: '#ca8a04', 'stroke-width': 1.2 }, g);
        txt(px(xW), py(yN) - 11, lbl, { 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 800, fill: '#854d0e' }, g);
      };
      drawLight(58, 75, 'L1');
      if (state.south_task_light_mode === 'three_task_lights') {
        drawLight(17.75, 14.5, 'T1');
        drawLight(53.75, 14.5, 'T2');
        drawLight(89.75, 14.5, 'T3');
      } else {
        drawLight(78, 15, 'P1');
        drawLight(102, 15, 'P2');
      }
    }

    /* Appliance & Base Labels drawn ABOVE routes/arcs with clean background halos */
    el('rect', { x: px(14.8) - 20, y: py(74) - 9, width: 40, height: 12, rx: 2, fill: 'rgba(226,232,240,0.94)' }, svg);
    txt(px(14.8), py(74), 'HAIER', { 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 800, fill: '#334155' }, svg);
    el('rect', { x: px(101.5) - 27, y: py(93) - 9, width: 54, height: 12, rx: 2, fill: 'rgba(255,247,237,0.94)' }, svg);
    txt(px(101.5), py(93), 'VIKING 30"', { 'text-anchor': 'middle', 'font-size': 8.4, 'font-weight': 800, fill: '#9a3412' }, svg);
    el('rect', { x: px(63) - 20, y: py(5.5) - 9, width: 40, height: 12, rx: 2, fill: 'rgba(241,245,249,0.92)' }, svg);
    txt(px(63), py(5.5), 'DW 24"', { 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 700, fill: '#475569' }, svg);
    el('rect', { x: px((sinkS + sinkE) / 2) - 38, y: py(5.5) - 9, width: 76, height: 12, rx: 2, fill: 'rgba(219,234,254,0.92)' }, svg);
    txt(px((sinkS + sinkE) / 2), py(5.5), lang === 'es' ? 'FREGADERO 30"' : 'SINK 30"', { 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 800, fill: '#15539e' }, svg);

    /* Plot All Interactive Device Boxes */
    devs.forEach((d) => {
      if (d.wall === 'ceiling') return;
      let bx = px(d.x);
      let by = py(d.y);
      let disp = d.id;
      let wPx = d.id.length > 4 ? 42 : 28;
      if (d.wall === 'east') {
        bx = px(0) - 16;
      } else if (d.wall === 'south') {
        if (d.id === 'GD-AIR-OR-SW') {
          const isOptA = state.sink_control_mode !== 'option_b_wired_2gang';
          disp = isOptA ? 'GD-AIR' : 'GD-SW';
          wPx = 44;
          bx = px(isOptA ? (sinkS + 15) : (sinkS - 5));
          by = py(30);
          el('line', {
            x1: bx, y1: by + 7.5,
            x2: px(isOptA ? (sinkS + 15) : (sinkS - 5)),
            y2: py(isOptA ? 20 : 0),
            stroke: '#6d28d9', 'stroke-width': 1.2, 'stroke-dasharray': '3,2'
          }, svg);
        } else {
          by = py(0) + 11;
          wPx = d.id === 'DW-GD' ? 42 : 28;
        }
      } else if (d.wall === 'west') {
        bx = px(115.5) - 17;
        if (d.id === 'RG-1') {
          by = py(83);
          el('line', { x1: bx + 14, y1: by, x2: px(115.5), y2: py(93), stroke: '#9a3412', 'stroke-width': 1.1, 'stroke-dasharray': '2,2' }, svg);
        } else if (d.id === 'HD-1') {
          by = py(102);
          el('line', { x1: bx + 14, y1: by, x2: px(115.5), y2: py(95.25), stroke: '#2f4f42', 'stroke-width': 1.1, 'stroke-dasharray': '2,2' }, svg);
        }
      } else if (d.wall === 'north') {
        by = py(126.25) - 13;
        wPx = 56;
      }
      drawDeviceBox(svg, bx, by, d, wPx, 15, 'none', disp);
    });

    /* Wall Dimension Labels & Cardinal Edges */
    txt(px(57.75), oy - 12, lang === 'es' ? 'MURO NORTE: 115-1/2" [wall_to_wall]' : 'NORTH WALL: 115-1/2" [wall_to_wall]', { 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 800, fill: '#10202b' }, svg);
    txt(px(73.5), py(0) + 33, lang === 'es' ? 'MURO SUR: 147" [wall_to_wall] · ← ESQ. SO | ESQ. SE 0" →' : 'SOUTH WALL: 147" [wall_to_wall] · ← SW CORNER | SE 0" →', { 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 800, fill: '#10202b' }, svg);
    txt(px(115.5) - 42, py(93), lang === 'es' ? 'OESTE 66-1/4"' : 'WEST 66-1/4"', { 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#10202b', transform: `rotate(-90 ${px(115.5) - 42} ${py(93)})` }, svg);
    txt(px(0) + 14, py(126.25) - 8, 'NE', { 'font-size': 8.5, 'font-weight': 800, fill: '#15539e' }, svg);
    txt(px(0) + 8, py(0) + 14, 'SE 0"', { 'font-size': 9, 'font-weight': 800, fill: '#b91c1c' }, svg);

    /* Right Side Legend + Compass + Live Key Panel */
    const rx = 685;
    drawCompass(svg, 795, 140, lang === 'es' ? 'PLANTA (NORTE ARRIBA)' : 'FLOOR PLAN (NORTH UP)');

    el('rect', { x: rx, y: 215, width: 205, height: 340, rx: 6, fill: '#f8fafc', stroke: '#cbd5e1', 'stroke-width': 1.2 }, svg);
    txt(rx + 12, 236, lang === 'es' ? 'SIMBOLOGÍA ELÉCTRICA' : 'ELECTRICAL LEGEND', { 'font-size': 10.5, 'font-weight': 800, fill: '#15539e' }, svg);

    const legItems = [
      { y: 258, col: '#b45309', dash: 'none', txt: lang === 'es' ? '12/2 Cu (20A) — En muro' : '12/2 Cu (20A) — In-wall' },
      { y: 278, col: '#b45309', dash: '6,4', txt: lang === 'es' ? '12/2 Cu (20A) — Por ático' : '12/2 Cu (20A) — Via attic' },
      { y: 298, col: '#1d4ed8', dash: 'none', txt: lang === 'es' ? '14/2 Cu (15A) — En muro' : '14/2 Cu (15A) — In-wall' },
      { y: 318, col: '#1d4ed8', dash: '6,4', txt: lang === 'es' ? '14/2 Cu (15A) — Por ático' : '14/2 Cu (15A) — Via attic' },
      { y: 338, col: '#6d28d9', dash: '6,4', txt: lang === 'es' ? '14/3 Cu — Solo Opc. B (70")' : '14/3 Cu — Option B Only' }
    ];
    legItems.forEach((it) => {
      el('line', { x1: rx + 12, y1: it.y - 3, x2: rx + 42, y2: it.y - 3, stroke: it.col, 'stroke-width': 2.5, 'stroke-dasharray': it.dash }, svg);
      txt(rx + 48, it.y, it.txt, { 'font-size': 9.2, fill: '#1e293b', 'font-weight': 600 }, svg);
    });

    el('circle', { cx: rx + 26, cy: 364, r: 9, fill: 'rgba(22,163,74,0.12)', stroke: '#16a34a', 'stroke-width': 1.5, 'stroke-dasharray': '3,2' }, svg);
    txt(rx + 48, 367, lang === 'es' ? 'Arco 24" alcance (Verde = OK)' : '24" reach arc (Green = OK)', { 'font-size': 9.2, fill: '#15803d', 'font-weight': 700 }, svg);
    el('rect', { x: rx + 14, y: 382, width: 24, height: 12, fill: 'url(#pat-noscrew)', stroke: '#dc2626', 'stroke-width': 1.2 }, svg);
    txt(rx + 48, 392, lang === 'es' ? 'Respaldo D04 (Sin tornillos)' : 'D04 Backside (No Screws)', { 'font-size': 9.2, fill: '#b91c1c', 'font-weight': 700 }, svg);
    el('rect', { x: rx + 14, y: 404, width: 24, height: 12, fill: 'url(#pat-workzone)', stroke: '#2563eb', 'stroke-width': 1.2, 'stroke-dasharray': '3,2' }, svg);
    txt(rx + 48, 414, lang === 'es' ? 'Zona Trabajo D04 30"×36"' : 'D04 Work Space 30"×36"', { 'font-size': 9.2, fill: '#1d4ed8', 'font-weight': 700 }, svg);

    /* Quick Live Summary Box inside Legend */
    el('line', { x1: rx + 10, y1: 432, x2: rx + 195, y2: 432, stroke: '#cbd5e1', 'stroke-width': 1 }, svg);
    txt(rx + 12, 450, lang === 'es' ? 'DATOS ACTIVOS EN VIVO:' : 'LIVE ACTIVE SETTINGS:', { 'font-size': 9.5, 'font-weight': 800, fill: '#10202b' }, svg);
    txt(rx + 12, 468, `${lang === 'es' ? 'Contactos:' : 'Outlets:'} ${heightDualLabel(state.counter_outlet_height_in)}`, { 'font-size': 8.8, fill: '#334155', 'font-weight': 600 }, svg);
    txt(rx + 12, 485, `${lang === 'es' ? 'Control:' : 'Sink Ctrl:'} ${state.sink_control_mode === 'option_b_wired_2gang' ? (lang === 'es' ? 'Opc. B Caja 70"' : 'Opt B Wired @ 70"') : (lang === 'es' ? 'Opc. A Aire+Inalám.' : 'Opt A Air+Wireless')}`, { 'font-size': 8.8, fill: '#334155', 'font-weight': 600 }, svg);
    txt(rx + 12, 502, `${lang === 'es' ? 'Luces:' : 'Lights:'} ${state.south_task_light_mode === 'three_task_lights' ? (lang === 'es' ? '3 Empotradas' : '3 Task') : (lang === 'es' ? '2 Colgantes' : '2 Pendants')}`, { 'font-size': 8.8, fill: '#334155', 'font-weight': 600 }, svg);
    txt(rx + 12, 519, `${lang === 'es' ? 'Ruta Sur:' : 'South Route:'} ${state.south_routing_mode === 'in_wall_bored' ? (lang === 'es' ? 'Franjas Muro' : 'In-Wall Bands') : (lang === 'es' ? 'Por Ático' : 'Via Attic')}`, { 'font-size': 8.8, fill: '#334155', 'font-weight': 600 }, svg);
    txt(rx + 12, 538, lang === 'es' ? 'HD-1: 1-Gang 2"×3" @ ~83"–86"' : 'HD-1: 1-Gang 2"×3" @ ~83"–86"', { 'font-size': 8.6, fill: '#2f4f42', 'font-weight': 800 }, svg);

    /* Bottom Routing Notes Card (y=585..920) */
    el('rect', { x: 48, y: 580, width: 842, height: 325, rx: 6, fill: '#fafbfc', stroke: '#cbd5e1', 'stroke-width': 1.2 }, svg);
    txt(64, 603, lang === 'es' ? 'RESUMEN DE CIRCUITOS DE COCINA (ESPACIOS 1–9 EN TABLERO EATON D04)' : 'KITCHEN CIRCUIT SUMMARY (SPACES 1–9 IN EATON D04 SUBPANEL)', { 'font-size': 11, 'font-weight': 800, fill: '#15539e' }, svg);

    const kitSlots = BASE_SLOTS.slice(0, 9);
    kitSlots.forEach((s, idx) => {
      const colIdx = idx < 5 ? 0 : 1;
      const rowIdx = idx < 5 ? idx : idx - 5;
      const cx = 64 + colIdx * 412;
      const cy = 626 + rowIdx * 48;
      const isAct = selectedCircuit === s.id;
      const g = el('g', { style: 'cursor:pointer;' }, svg);
      el('rect', { x: cx, y: cy - 14, width: 396, height: 40, rx: 4, fill: isAct ? '#dbeafe' : '#ffffff', stroke: isAct ? '#15539e' : '#cbd5e1', 'stroke-width': isAct ? 1.8 : 1 }, g);
      el('rect', { x: cx + 6, y: cy - 8, width: 52, height: 28, rx: 3, fill: wireColor(s.gauge) }, g);
      txt(cx + 32, cy + 5, `#${s.space} ${s.id}`, { 'text-anchor': 'middle', 'font-size': 8.8, 'font-weight': 800, fill: '#ffffff' }, g);
      txt(cx + 32, cy + 16, `${s.amps}A`, { 'text-anchor': 'middle', 'font-size': 7.5, 'font-weight': 700, fill: '#e2e8f0' }, g);
      txt(cx + 66, cy + 2, (lang === 'es' ? s.serves_es : s.serves_en), { 'font-size': 8.5, 'font-weight': 700, fill: '#10202b' }, g);
      const lft = takeoff.perCircuit[s.id];
      txt(cx + 66, cy + 17, `${s.cat} · ${s.cable} · ${lft} ft ${lang === 'es' ? 'neto' : 'net'} → ${Math.ceil(lft * (1 + takeoff.waste_pct / 100))} ft`, { 'font-size': 8.3, fill: '#4b5c69', 'font-weight': 600 }, g);
      g.addEventListener('click', () => {
        const nextAct = selectedCircuit === s.id ? null : s.id;
        selectedCircuit = nextAct;
        selectedSlotSpace = nextAct ? s.space : null;
        selectedBoxId = null;
        updateInspectorForSlot(s, takeoff);
        render();
      });
    });

    drawBarScale(svg, 64, 938, S, 4);
    drawTitleBlock(svg, takeoff, reach);
  }

  /* ── VIEW 2: South Sink / Window / Former Pie-Safe Wall (0"–147") ── */
  function renderViewSouth(svg, devs, takeoff, reach) {
    const wallW = 147.0;
    const wallH = 121.5;
    const S = 5.15; /* 147 * 5.15 = 757.05 px; 121.5 * 5.15 = 625.72 px — strict scaleX === scaleY */
    lastScaleInfo = { view: 'south', scaleX: S, scaleY: S, uniform: true };

    const ox = 86;
    const oy = 118;
    const px = (st) => ox + st * S; /* Left = SE Corner 0" -> Right = Rear Door SW 147" */
    const py = (h) => oy + (wallH - h) * S;

    drawSheetFrame(
      svg,
      lang === 'es' ? 'VISTA 2 — MURO SUR: FREGADERO, VENTANA Y HUECO ANTERIOR (0"–147")' : 'VIEW 2 — SOUTH SINK, WINDOW & FORMER OPENING (0"–147")',
      lang === 'es' ? '← ESQ. SE (0" ref) | PUERTA TRASERA (SO) → · Arrastra Hueco Anterior o Fregadero en vivo · Escala Uniforme X = Y' : '← SE CORNER (0" ref) | REAR DOOR (SW) → · Drag Former Opening or Sink Base Live · Uniform True Scale X = Y',
      reach.pieClashS1 || reach.pieClashS2
        ? (lang === 'es' ? 'REVISAR CIERRE / S1/S2' : 'CHECK CLOSED WALL / S1/S2')
        : (lang === 'es' ? 'S1/S2 PROVISIONALES — REVISAR CIERRE' : 'S1/S2 PROVISIONAL — VERIFY CLOSURE'),
      !(reach.pieClashS1 || reach.pieClashS2)
    );

    /* Wall Frame */
    el('rect', { x: ox, y: oy, width: wallW * S, height: wallH * S, fill: '#f8fafc', stroke: '#10202b', 'stroke-width': 2.2 }, svg);

    /* Original Trim Layer (9.5" baseboard & 103" picture rail) */
    if (layers.trim) {
      const railY = py(state.existing_original_trim.picture_rail_height_in || 103);
      el('line', { x1: ox, y1: railY, x2: ox + wallW * S, y2: railY, stroke: '#92400e', 'stroke-width': 1.3, 'stroke-dasharray': '6,4' }, svg);
      txt(ox + 8, railY - 4, lang === 'es' ? `Riel Original ${fracIn(state.existing_original_trim.picture_rail_height_in)}` : `Original Picture Rail ${fracIn(state.existing_original_trim.picture_rail_height_in)}`, { 'font-size': 8.2, fill: '#92400e', 'font-weight': 700 }, svg);
    }

    /* Base Cabinets (36" counter height) */
    const sinkS = state.sink_base_start_in;
    const sinkE = sinkS + state.sink_base_width_in;
    /* 0-36 Corner, 36-48 Base, 48-72 DW, Sink Base, Filler */
    el('rect', { x: px(0), y: py(36), width: 36 * S, height: 36 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.4 }, svg);
    txt(px(18), py(18), lang === 'es' ? 'ESQ. 36"' : 'CORNER 36"', { 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill: '#2f4f42' }, svg);
    el('rect', { x: px(36), y: py(36), width: 12 * S, height: 36 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.4 }, svg);
    txt(px(42), py(18), '12"', { 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: '#2f4f42' }, svg);

    /* Dishwasher Bay 48"-72" (NEVER put DW-GD here!) */
    el('rect', { x: px(48), y: py(36), width: 24 * S, height: 36 * S, fill: '#fef2f2', stroke: '#dc2626', 'stroke-width': 1.4, 'stroke-dasharray': '5,3' }, svg);
    txt(px(60), py(22), lang === 'es' ? 'LAVAVAJILLAS 24"' : 'DISHWASHER 24"', { 'text-anchor': 'middle', 'font-size': 8.8, 'font-weight': 800, fill: '#991b1b' }, svg);
    txt(px(60), py(10), lang === 'es' ? 'SIN CAJAS ATRÁS' : 'NO BOX BEHIND DW', { 'text-anchor': 'middle', 'font-size': 7.8, 'font-weight': 800, fill: '#dc2626' }, svg);

    /* Draggable 30" Sink Base */
    const sinkG = el('g', { style: 'cursor:ew-resize;' }, svg);
    el('rect', { x: px(sinkS), y: py(36), width: (sinkE - sinkS) * S, height: 36 * S, fill: '#dbeafe', stroke: '#15539e', 'stroke-width': 2 }, sinkG);
    sinkG.addEventListener('pointerdown', (ev) => {
      if (circleMode) return;
      ev.preventDefault();
      dragTarget = { kind: 'sink', startClientX: ev.clientX, startVal: state.sink_base_start_in, scale: S };
    });

    /* Filler / Rear Door */
    if (sinkE < 112) {
      el('rect', { x: px(sinkE), y: py(36), width: (112 - sinkE) * S, height: 36 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.2 }, svg);
    }
    /* Rear Door 116.375 - 142.25, H 78.625 */
    el('rect', { x: px(116.375), y: py(78.625), width: 25.875 * S, height: 78.625 * S, fill: '#f1f5f9', stroke: '#475569', 'stroke-width': 1.8 }, svg);
    txt(px(129.3), py(44), lang === 'es' ? 'PUERTA TRASERA' : 'REAR DOOR', { 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill: '#475569' }, svg);
    txt(px(129.3), py(36), '25-7/8" × 78-5/8"', { 'text-anchor': 'middle', 'font-size': 8, fill: '#64748b' }, svg);

    /* South Window (72.875 - 106.6875, sill 45.9375, head 104.0625) */
    el('rect', { x: px(72.875), y: py(104.0625), width: 33.8125 * S, height: (104.0625 - 45.9375) * S, fill: '#e0f2fe', stroke: '#0284c7', 'stroke-width': 2 }, svg);
    el('line', { x1: px(89.75), y1: oy, x2: px(89.75), y2: py(0), stroke: '#0284c7', 'stroke-width': 1.1, 'stroke-dasharray': '5,4' }, svg);
    txt(px(89.75), py(76), lang === 'es' ? 'VENTANA SUR (Eje 89-3/4")' : 'SOUTH WINDOW (CL 89-3/4")', { 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 800, fill: '#0369a1' }, svg);
    txt(px(89.75), py(48), lang === 'es' ? 'Repisa 45-15/16"' : 'Sill 45-15/16"', { 'text-anchor': 'middle', 'font-size': 8, fill: '#0369a1' }, svg);

    /* Draggable Recessed Pie-Safe Niche (dashed provisional) */
    const pieS = state.pie_safe_start_in;
    const pieE = pieS + state.pie_safe_width_in;
    const pieClash = reach.pieClashS1 || reach.pieClashS2;
    const pieG = el('g', { style: 'cursor:ew-resize;' }, svg);
    el('rect', {
      x: px(pieS), y: py(80), width: state.pie_safe_width_in * S, height: (80 - 43) * S,
      fill: pieClash ? 'rgba(220,38,38,0.16)' : '#fffbeb',
      stroke: pieClash ? '#dc2626' : '#d97706', 'stroke-width': 2, 'stroke-dasharray': '6,4'
    }, pieG);
    txt(px((pieS + pieE) / 2), py(66), lang === 'es' ? `↔ CUBRIR HUECO ANTERIOR (${fracIn(pieS)}–${fracIn(pieE)})` : `↔ COVER FORMER OPENING (${fracIn(pieS)}–${fracIn(pieE)})`, { 'text-anchor': 'middle', 'font-size': 8.8, 'font-weight': 800, fill: pieClash ? '#b91c1c' : '#92400e' }, pieG);
    txt(px((pieS + pieE) / 2), py(58), lang === 'es' ? 'Arrastrar · Medir en obra' : 'Drag to test · Measure on site', { 'text-anchor': 'middle', 'font-size': 8, fill: '#78350f' }, pieG);
    pieG.addEventListener('pointerdown', (ev) => {
      if (circleMode) return;
      ev.preventDefault();
      dragTarget = { kind: 'piesafe', startClientX: ev.clientX, startVal: state.pie_safe_start_in, scale: S };
    });

    /* Horizontal In-Wall Bore Bands (30" SA-B, 26" GD feed, 24" DW, 20" GD switched) OR Attic Vertical Drops */
    if (layers.routes) {
      const inWall = state.south_routing_mode === 'in_wall_bored';
      const dwX = sinkS + 4;
      const bands = [
        { h: 30, endX: 65, ckt: 'SA-B', gauge: '12/2', lbl: '30" SA-B (12/2)' },
        { h: 26, endX: dwX, ckt: 'GD', gauge: '14/2', lbl: '26" GD Feed (14/2)' },
        { h: 24, endX: dwX, ckt: 'DW', gauge: '14/2', lbl: '24" DW (14/2)' },
        { h: 20, endX: dwX, ckt: 'GD', gauge: '14/2', lbl: '20" GD Switch (14/2)' }
      ];
      if (inWall) {
        bands.forEach((b) => {
          const act = circuitActive(b.ckt);
          el('line', {
            x1: px(0), y1: py(b.h), x2: px(b.endX), y2: py(b.h),
            stroke: wireColor(b.gauge), 'stroke-width': selectedCircuit === b.ckt ? 3.2 : 2.1,
            opacity: act ? 0.9 : 0.2
          }, svg);
          txt(px(2), py(b.h) - 2.5, b.lbl, { 'font-size': 7.5, 'font-weight': 800, fill: wireColor(b.gauge), opacity: act ? 1 : 0.3 }, svg);
        });
      } else {
        /* Overhead Attic Drops */
        [
          { x: 24, h: state.counter_outlet_height_in, ckt: 'SA-B', g: '12/2' },
          { x: 65, h: state.counter_outlet_height_in, ckt: 'SA-B', g: '12/2' },
          { x: dwX, h: 14, ckt: 'DW', g: '14/2' }
        ].forEach((dr) => {
          el('line', { x1: px(dr.x), y1: oy, x2: px(dr.x), y2: py(dr.h), stroke: wireColor(dr.g), 'stroke-width': 2.2, 'stroke-dasharray': '6,4', opacity: circuitActive(dr.ckt) ? 0.9 : 0.2 }, svg);
        });
      }
      if (state.sink_control_mode === 'option_b_wired_2gang') {
        const swX = sinkS - 5;
        el('line', { x1: px(swX), y1: oy, x2: px(swX), y2: py(39.5), stroke: '#6d28d9', 'stroke-width': 2.3, 'stroke-dasharray': '6,4' }, svg);
        txt(px(swX) - 4, py(95), '14/3 → SW-ENTRY', { 'text-anchor': 'end', 'font-size': 8.2, 'font-weight': 800, fill: '#6d28d9' }, svg);
      }
    }

    /* Sink Base label w/ halo over 24" DW line, plus South Wall Devices */
    el('rect', { x: px((sinkS + sinkE) / 2) - 66, y: py(24) - 9, width: 132, height: 12, rx: 2, fill: 'rgba(219,234,254,0.95)' }, svg);
    txt(px((sinkS + sinkE) / 2), py(24), lang === 'es' ? `↔ FREGADERO 30" (${fracIn(sinkS)}–${fracIn(sinkE)})` : `↔ SINK BASE 30" (${fracIn(sinkS)}–${fracIn(sinkE)})`, { 'text-anchor': 'middle', 'font-size': 8.4, 'font-weight': 800, fill: '#15539e' }, svg);

    const isOptASouth = state.sink_control_mode !== 'option_b_wired_2gang';
    devs.filter((d) => d.wall === 'south').forEach((d) => {
      const isSw = d.id === 'GD-AIR-OR-SW';
      const disp = isSw ? (isOptASouth ? 'GD-AIR' : 'GD-SW') : d.id;
      const wPx = isSw ? (isOptASouth ? 44 : 29) : (d.id === 'DW-GD' ? 42 : (d.id === 'S2' ? 21 : 28));
      const hPx = (isSw && !isOptASouth) || d.id === 'S2' ? 14 : 17;
      const lpos = isSw ? (isOptASouth ? 'bottom' : 'right') : 'top';
      drawDeviceBox(svg, px(d.station), py(d.z), d, wPx, hPx, lpos, disp);
    });

    /* Separate Neutrals Callout on DW-GD */
    const dwX = sinkS + 4;
    txt(px(sinkS + 15), py(6), lang === 'es' ? 'Esp. 5+6 · NEUTROS SEPARADOS' : 'Space 5+6 · SEPARATE NEUTRALS', { 'text-anchor': 'middle', 'font-size': 7.6, 'font-weight': 800, fill: '#1d4ed8' }, svg);

    /* Dual-Datum Left Height Ruler (Finished Floor + Bare Subfloor +t) */
    const tVal = effectiveFloorT();
    drawHeightRuler(svg, ox, py, [0, 14, 36, state.counter_outlet_height_in, 80, 104, 121.5], tVal, [state.counter_outlet_height_in]);

    /* Cardinal Edge Strip below elevation */
    const sy = oy + wallH * S + 18;
    txt(ox, sy, lang === 'es' ? '← ESQUINA SE (0" ref)' : '← SE CORNER (0" ref)', { 'font-size': 9.8, 'font-weight': 800, fill: '#b91c1c' }, svg);
    txt(ox + (wallW * S) / 2, sy, lang === 'es' ? 'MURO SUR: 147" [wall_to_wall]' : 'SOUTH WALL: 147" [wall_to_wall]', { 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 800, fill: '#10202b' }, svg);
    txt(ox + wallW * S, sy, lang === 'es' ? 'PUERTA TRASERA (SO) →' : 'REAR DOOR (SW) →', { 'text-anchor': 'end', 'font-size': 9.8, 'font-weight': 800, fill: '#15539e' }, svg);

    /* Bottom Notes + Compass + Bar Scale */
    drawCompass(svg, 818, 845, lang === 'es' ? 'MIRANDO AL SUR' : 'FACING SOUTH');
    el('rect', { x: 48, y: 782, width: 690, height: 132, rx: 6, fill: '#f8fafc', stroke: '#cbd5e1', 'stroke-width': 1.2 }, svg);
    txt(62, 804, lang === 'es' ? 'REGLAS DE OBRA MURO SUR (FREGADERO Y CIERRE):' : 'SOUTH WALL FIELD RULES (SINK, DISHWASHER & CLOSURE):', { 'font-size': 10.2, 'font-weight': 800, fill: '#15539e' }, svg);
    txt(62, 824, lang === 'es' ? `• Opción Control Activa: ${state.sink_control_mode === 'option_b_wired_2gang' ? 'Opción B — Caja doble cableada a 70" (+30.3 pies 14/3)' : 'Opción A — Botón de aire en cubierta + control inalámbrico en S2 (0 pies 14/3)'}` : `• Active Sink Control: ${state.sink_control_mode === 'option_b_wired_2gang' ? 'Option B — Wired 2-Gang Switch Box @ 70" (+30.3 ft 14/3 traveler)' : 'Option A — Sink-Deck Air Button + Wireless Remote at S2 (0 ft 14/3)'}`, { 'font-size': 9.3, fill: '#10202b', 'font-weight': 700 }, svg);
    txt(62, 844, lang === 'es' ? `• DW-GD (Caja doble a ${fracIn(dwX)}, 14" piso): Dentro del gabinete del fregadero; NUNCA detrás del lavavajillas (48"–72"). Neutros Esp. 5 y 6 separados.` : `• DW-GD (2-gang @ ${fracIn(dwX)}, 14" above floor): Inside sink base; NEVER behind dishwasher (48"–72"). Keep Space 5 & Space 6 neutrals separate.`, { 'font-size': 9.1, fill: '#1e293b' }, svg);
    txt(62, 864, lang === 'es' ? `• Contactos S1 (24") y S2 (65") a ${heightDualLabel(state.counter_outlet_height_in)} — Franjas en muro: 30" / 26" / 24" / 20" (ahorra ~115 pies de cable).` : `• S1 (24") & S2 (65") at ${heightDualLabel(state.counter_outlet_height_in)} — In-wall bore bands: 30" / 26" / 24" / 20" (saves ~115 ft cable).`, { 'font-size': 9.1, fill: '#1e293b' }, svg);
    txt(62, 884, lang === 'es' ? `• Subpiso actual: ${tVal > 0 ? 'Desnudo (+t = ' + fracIn(tVal) + ' sumado entre paréntesis)' : 'Piso terminado instalado (+0")'} · Confirmar medidas en obra.` : `• Current Floor Datum: ${tVal > 0 ? 'Bare subfloor (+t = ' + fracIn(tVal) + ' shown in parentheses)' : 'Finished floor down (+0")'} · Measure & verify on site.`, { 'font-size': 9.1, fill: '#92400e', 'font-weight': 700 }, svg);
    txt(62, 904, lang === 'es' ? '• Alacena anterior: SELLAR CONTRA INTEMPERIE Y CUBRIR. S1/S2 provisionales; verificar respaldo y claros en obra.' : '• Former pie-safe: WEATHER-SEAL AND COVER. S1/S2 are provisional; verify backing and clearances on site.', { 'font-size': 9.1, fill: '#92400e', 'font-weight': 700 }, svg);

    drawBarScale(svg, 62, 940, S, 3);
    drawTitleBlock(svg, takeoff, reach);
  }

  /* ── VIEW 3: East Fridge / D04 Backside Wall + 1-Tap Dining D04 Flip ── */
  function renderViewEast(svg, devs, takeoff, reach) {
    const wallW = 126.25;
    const wallH = 121.5;
    const S = 5.45; /* 126.25 * 5.45 = 688 px; 121.5 * 5.45 = 662 px — strict scaleX === scaleY */
    lastScaleInfo = { view: 'east', scaleX: S, scaleY: S, uniform: true };

    const isDining = state.east_view_side === 'dining';
    const ox = 98;
    const oy = 108;
    const px = (st) => ox + st * S;
    const py = (h) => oy + (wallH - h) * S;
    const tVal = effectiveFloorT();

    drawSheetFrame(
      svg,
      isDining
        ? (lang === 'es' ? 'VISTA 3 (VOLTEADA) — FRENTE TABLERO D04 COMEDOR' : 'VIEW 3 (FLIPPED) — DINING FRONT OF SUBPANEL D04')
        : (lang === 'es' ? 'VISTA 3 — MURO ESTE: REFRIGERADOR Y RESPALDO D04 (0"–126-1/4")' : 'VIEW 3 — EAST FRIDGE & D04 BACKSIDE WALL (0"–126-1/4")'),
      isDining
        ? (lang === 'es' ? '← NORTE | VENTANA COMEDOR (SUR) → · Eje D04 = W/4 + 1" · Espacio Trabajo 30"×36"×78"' : '← NORTH | DINING WINDOW (SOUTH) → · D04 CL = W/4 + 1" · 30"×36"×78" Working Clearance')
        : (lang === 'es' ? '← ESQ. SE (0" ref) | PASILLO NORTE → · ZONA ROJA 53"–77" PROHIBIDO TORNILLOS / CAJAS' : '← SE CORNER (0" ref) | NORTH HALLWAY → · RED ZONE 53"–77" NO SCREWS / NO BOXES / NO BACK ENTRY'),
      isDining
        ? (lang === 'es' ? 'D04 COMEDOR · CORTES EN ESPERA' : 'D04 DINING FRONT · SIDE NOTCHES HOLD')
        : (lang === 'es' ? 'NO TORNILLOS 53"–77" · D04 ATRÁS' : 'NO SCREWS 53"–77" · D04 BEHIND'),
      false
    );

    el('rect', { x: ox, y: oy, width: wallW * S, height: wallH * S, fill: '#f8fafc', stroke: '#10202b', 'stroke-width': 2.2 }, svg);

    if (!isDining) {
      /* KITCHEN FACE: Corner Base 0-36, Drawer 36-60, Haier Fridge 60-88, Hall Opening 96.5-126 */
      el('rect', { x: px(0), y: py(36), width: 36 * S, height: 36 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.4 }, svg);
      txt(px(18), py(18), lang === 'es' ? 'ESQ. 36"' : 'CORNER 36"', { 'text-anchor': 'middle', 'font-size': 9.2, 'font-weight': 700, fill: '#2f4f42' }, svg);
      el('rect', { x: px(36), y: py(36), width: 18 * S, height: 36 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.4 }, svg);
      txt(px(45), py(18), lang === 'es' ? 'CAJONES 18"' : 'DRAWERS 18"', { 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill: '#2f4f42' }, svg);

      /* Optional Dashed East Uppers (0-60, 55.125-95.5625) */
      el('rect', { x: px(0), y: py(95.5625), width: 60 * S, height: (95.5625 - 55.125) * S, fill: 'none', stroke: '#64748b', 'stroke-width': 1.3, 'stroke-dasharray': '5,4' }, svg);
      txt(px(42), py(86), lang === 'es' ? 'ALTOS OPC. (NO TORNILLOS EN D04)' : 'OPTIONAL UPPERS (NO SCREWS IN D04)', { 'text-anchor': 'middle', 'font-size': 7.8, 'font-weight': 700, fill: '#475569' }, svg);

      /* Haier Fridge 60"-88", H 69-7/8" (Nothing above!) */
      el('rect', { x: px(60), y: py(69.875), width: 28 * S, height: 69.875 * S, fill: '#e2e8f0', stroke: '#475569', 'stroke-width': 1.8 }, svg);
      txt(px(74), py(84), lang === 'es' ? 'NADA ARRIBA (FIJO)' : 'NOTHING ABOVE (LOCKED)', { 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 800, fill: '#2f4f42' }, svg);

      /* Hall Opening 96.5"-126", H 79" */
      el('rect', { x: px(96.5), y: py(79), width: 29.5 * S, height: 79 * S, fill: '#ffffff', stroke: '#15539e', 'stroke-width': 1.8 }, svg);
      txt(px(111.25), py(44), lang === 'es' ? 'VANO PASILLO' : 'HALL OPENING', { 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 800, fill: '#15539e' }, svg);
      txt(px(111.25), py(36), '29-1/2" × 79"', { 'text-anchor': 'middle', 'font-size': 8.2, fill: '#475569' }, svg);

      /* HARD RED HATCHED EXCLUSION ZONE: 53"-77" x S1-S2 (13"-27.5" + dashed infill 6"-38") */
      if (layers.holds) {
        el('rect', { x: px(6), y: py(77), width: 32 * S, height: 24 * S, fill: 'rgba(220,38,38,0.08)', stroke: '#ef4444', 'stroke-width': 1.2, 'stroke-dasharray': '4,3' }, svg);
        el('rect', { x: px(13), y: py(77), width: 14.5 * S, height: 24 * S, fill: 'url(#pat-noscrew)', stroke: '#b91c1c', 'stroke-width': 2.5 }, svg);
        el('rect', { x: px(7), y: py(69), width: 26.5 * S, height: 10 * S, rx: 3, fill: '#ffffff', stroke: '#b91c1c', 'stroke-width': 1.3 }, svg);
        txt(px(20.25), py(65.5), lang === 'es' ? 'D04 SIN TORNILLOS' : 'D04 NO SCREWS', { 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 800, fill: '#b91c1c' }, svg);
        txt(px(20.25), py(61.5), 'S1–S2 · 53"–77"', { 'text-anchor': 'middle', 'font-size': 7.8, 'font-weight': 800, fill: '#991b1b' }, svg);
      }

      /* Bore Bands 50" (SA-A) and 52-1/2" (REF) — safely below 53" D04 no-screw zone */
      if (layers.routes) {
        el('line', { x1: px(10), y1: py(50), x2: px(48), y2: py(50), stroke: '#b45309', 'stroke-width': 2.4, opacity: circuitActive('SA-A') ? 0.95 : 0.2 }, svg);
        el('rect', { x: px(29) - 42, y: py(47.2) - 9, width: 84, height: 11, rx: 2, fill: 'rgba(248,250,252,0.94)' }, svg);
        txt(px(29), py(47.2), '50" SA-A (12/2)', { 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 800, fill: '#b45309' }, svg);
        el('line', { x1: px(20.25), y1: py(52.5), x2: px(74), y2: py(52.5), stroke: '#b45309', 'stroke-width': 2.0, 'stroke-dasharray': '5,3', opacity: circuitActive('REF') ? 0.9 : 0.2 }, svg);
        el('line', { x1: px(74), y1: py(52.5), x2: px(74), y2: py(15), stroke: '#b45309', 'stroke-width': 2.0, 'stroke-dasharray': '5,3', opacity: circuitActive('REF') ? 0.9 : 0.2 }, svg);
        el('rect', { x: px(55) - 44, y: py(55.0) - 9, width: 88, height: 11, rx: 2, fill: 'rgba(248,250,252,0.94)' }, svg);
        txt(px(55), py(55.0), '52-1/2" REF (12/2)', { 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 800, fill: '#92400e' }, svg);
      }

      /* Draw Fridge Labels Over REF Wire w/ Solid Pills */
      el('rect', { x: px(74) - 52, y: py(46) - 10, width: 104, height: 24, rx: 3, fill: '#e2e8f0' }, svg);
      txt(px(74), py(46), 'HAIER FRIDGE', { 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 800, fill: '#1e293b' }, svg);
      txt(px(74), py(43.2), 'QJS15HYRFS (60"–88")', { 'text-anchor': 'middle', 'font-size': 8.1, fill: '#475569' }, svg);

      /* East Wall Devices: E1 @ 10", E2 @ 48", REF-1 @ 68" */
      devs.filter((d) => d.wall === 'east').forEach((d) => {
        drawDeviceBox(svg, px(d.station), py(d.z), d, 38, 17, 'bottom');
      });
    } else {
      /* DINING ROOM FLIP VIEW: Looking West at Dining Wall D04 */
      const wDin = Math.max(60, Math.min(180, Number(state.dining_wall_width_in) || 91.5));
      const clFromSouth = Number((wDin / 4 + 1.0).toFixed(2));
      const panelCenterX = wallW - clFromSouth; /* Left = North, Right = South Dining Window Edge */

      /* 30" x 78" Front Clear Working Space */
      el('rect', { x: px(panelCenterX - 15), y: py(78), width: 30 * S, height: 78 * S, fill: 'url(#pat-workzone)', stroke: '#2563eb', 'stroke-width': 1.8, 'stroke-dasharray': '6,4' }, svg);
      txt(px(panelCenterX), py(13), lang === 'es' ? 'ESPACIO LIBRE D04:' : 'CLEAR WORKING SPACE:', { 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 800, fill: '#1d4ed8' }, svg);
      txt(px(panelCenterX), py(9), lang === 'es' ? '30" AN × 78" AL (36" PROF)' : '30" W × 78" H (36" DEEP)', { 'text-anchor': 'middle', 'font-size': 8.0, 'font-weight': 700, fill: '#1e40af' }, svg);

      /* Flush Cover (22" H x 15.3" W) & Eaton BRP20L125G Steel Can (21" H x 14.31" W) centered at 65" (verify vs 70") */
      el('rect', { x: px(panelCenterX - 7.65), y: py(76), width: 15.3 * S, height: 22 * S, fill: '#cbd5e1', stroke: '#334155', 'stroke-width': 1.6 }, svg);
      el('rect', { x: px(panelCenterX - 7.15), y: py(75.5), width: 14.31 * S, height: 21 * S, fill: '#1e3a5f', stroke: '#10202b', 'stroke-width': 2 }, svg);
      txt(px(panelCenterX), py(68), 'EATON D04', { 'text-anchor': 'middle', 'font-size': 10.2, 'font-weight': 800, fill: '#ffffff' }, svg);
      txt(px(panelCenterX), py(63), 'BRP20L125G', { 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 700, fill: '#bfdbfe' }, svg);
      txt(px(panelCenterX), py(58), lang === 'es' ? '20 ESPACIOS · 125A' : '20 SPACES · 125A', { 'text-anchor': 'middle', 'font-size': 7.5, 'font-weight': 700, fill: '#fef08a' }, svg);

      /* Top Header Vertical Conduit/Cable Exit (Attic Route) vs Side-Entry Hold */
      el('line', { x1: px(panelCenterX), y1: oy, x2: px(panelCenterX), y2: py(75.5), stroke: '#16a34a', 'stroke-width': 3.5, 'stroke-dasharray': '6,3' }, svg);
      el('rect', { x: px(panelCenterX) - 76, y: py(96) - 10, width: 152, height: 13, rx: 3, fill: '#ffffff', stroke: '#86efac', 'stroke-width': 1 }, svg);
      txt(px(panelCenterX), py(96), lang === 'es' ? '✓ SALIDA VERTICAL AL ÁTICO' : '✓ VERTICAL EXIT TO ATTIC', { 'text-anchor': 'middle', 'font-size': 8.4, 'font-weight': 800, fill: '#15803d' }, svg);

      /* Side-entry Hold Badge w/ Leader Arrow to Panel Side */
      const badgeW = 28 * S;
      const badgeX = Math.max(ox + 8, px(panelCenterX - 38));
      el('rect', { x: badgeX, y: py(71), width: badgeW, height: 11 * S, rx: 4, fill: '#fef2f2', stroke: '#dc2626', 'stroke-width': 1.5 }, svg);
      el('line', { x1: badgeX + badgeW, y1: py(65.5), x2: px(panelCenterX - 7.65), y2: py(65.5), stroke: '#dc2626', 'stroke-width': 1.6, 'stroke-dasharray': '3,2' }, svg);
      txt(badgeX + badgeW / 2, py(65), lang === 'es' ? 'CORTES LATERALES EN ESPERA' : 'SIDE NOTCHES ON HOLD', { 'text-anchor': 'middle', 'font-size': 7.8, 'font-weight': 800, fill: '#b91c1c' }, svg);

      /* Formula Dimension Line from Right Edge (Dining Window Casing) */
      el('line', { x1: px(panelCenterX), y1: py(42), x2: px(wallW), y2: py(42), stroke: '#15539e', 'stroke-width': 1.6 }, svg);
      el('line', { x1: px(panelCenterX), y1: py(40), x2: px(panelCenterX), y2: py(44), stroke: '#15539e', 'stroke-width': 1.6 }, svg);
      el('line', { x1: px(wallW), y1: py(40), x2: px(wallW), y2: py(44), stroke: '#15539e', 'stroke-width': 1.6 }, svg);
      el('rect', { x: px(wallW) - 186, y: py(44.8) - 9.5, width: 182, height: 12, rx: 2, fill: 'rgba(248,250,252,0.94)' }, svg);
      txt(px(wallW) - 6, py(44.8), `CL = W/4 + 1" = ${fracIn(clFromSouth)} (W=${fracIn(wDin)})`, { 'text-anchor': 'end', 'font-size': 8.4, 'font-weight': 800, fill: '#15539e' }, svg);
    }

    /* Original Trim Layer */
    if (layers.trim) {
      const railY = py(state.existing_original_trim.picture_rail_height_in || 103);
      el('line', { x1: ox, y1: railY, x2: ox + wallW * S, y2: railY, stroke: '#92400e', 'stroke-width': 1.3, 'stroke-dasharray': '6,4' }, svg);
    }

    /* Dual-Datum Left Ruler */
    drawHeightRuler(svg, ox, py, [0, 15, 36, state.counter_outlet_height_in, 53, 77, 103, 121.5], tVal, [53, 77]);

    const sy = oy + wallH * S + 18;
    if (!isDining) {
      txt(ox, sy, lang === 'es' ? '← ESQ. SE (0" ref)' : '← SE CORNER (0" ref)', { 'font-size': 9.8, 'font-weight': 800, fill: '#b91c1c' }, svg);
      txt(ox + (wallW * S) / 2, sy, lang === 'es' ? 'MURO ESTE: 126-1/4" [wall_to_wall]' : 'EAST WALL: 126-1/4" [wall_to_wall]', { 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 800, fill: '#10202b' }, svg);
      txt(ox + wallW * S, sy, lang === 'es' ? 'PASILLO NORTE →' : 'NORTH HALLWAY →', { 'text-anchor': 'end', 'font-size': 9.8, 'font-weight': 800, fill: '#15539e' }, svg);
    } else {
      txt(ox, sy, lang === 'es' ? '← NORTE (Comedor)' : '← NORTH (Dining)', { 'font-size': 9.8, 'font-weight': 800, fill: '#15539e' }, svg);
      txt(ox + (wallW * S) / 2, sy, lang === 'es' ? 'FRENTE COMEDOR D04 (Sin contacto D5 en este muro)' : 'DINING D04 FRONT (No D5 Outlet on Panel Wall)', { 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 800, fill: '#10202b' }, svg);
      txt(ox + wallW * S, sy, lang === 'es' ? 'CHAMBRANA VENTANA SUR →' : 'SOUTH WINDOW CASING →', { 'text-anchor': 'end', 'font-size': 9.8, 'font-weight': 800, fill: '#b91c1c' }, svg);
    }

    drawCompass(svg, 838, 175, isDining ? (lang === 'es' ? 'MIRANDO OESTE' : 'FACING WEST') : (lang === 'es' ? 'MIRANDO ESTE' : 'FACING EAST'));
    drawBarScale(svg, 98, 938, S, 3);
    drawTitleBlock(svg, takeoff, reach);
  }

  /* ── VIEW 4: West Range / Hood Wall (0"–66-1/4", HD-1 Direct Hardwire, 1/2" Drywall) ── */
  function renderViewWest(svg, devs, takeoff, reach) {
    const wallW = 66.25;
    const wallH = 121.5;
    const S = 5.6; /* 66.25 * 5.6 = 371 px; 121.5 * 5.6 = 680.4 px — strict scaleX === scaleY */
    lastScaleInfo = { view: 'west', scaleX: S, scaleY: S, uniform: true };

    const ox = 104;
    const oy = 104;
    const px = (st) => ox + st * S; /* Left = South Step 0" -> Right = North 66-1/4" */
    const py = (h) => oy + (wallH - h) * S;
    const tVal = effectiveFloorT();

    drawSheetFrame(
      svg,
      lang === 'es' ? 'VISTA 4 — MURO OESTE ESTUFA Y CAMPANA (HD-1 CONEXIÓN DIRECTA)' : 'VIEW 4 — WEST RANGE & HOOD WALL (HD-1 DIRECT HARDWIRE)',
      lang === 'es' ? '← ESQ. SUR (0" ref) | NORTE (Pasillo) → · Caja HD-1 2"×3" @ ~83"–86" · Tablaroca 1/2" / Sin Calzas · Escala X = Y' : '← SOUTH STEP (0" ref) | NORTH (Hallway) → · HD-1 1-Gang 2"×3" @ ~83"–86" · 1/2" Drywall / Zero Shims · Scale X = Y',
      lang === 'es' ? 'HD-1: 2"×3" @ 83"–86" · CUMPLE' : 'HD-1: 1-GANG 2"×3" @ 83"–86"',
      true
    );

    el('rect', { x: ox, y: oy, width: wallW * S, height: wallH * S, fill: '#f8fafc', stroke: '#10202b', 'stroke-width': 2.2 }, svg);

    /* Dual Blocking Bands (68"-86" and 104"-121.5") with 8"-10" clear center duct bay */
    el('rect', { x: px(12), y: py(86), width: 42 * S, height: 18 * S, fill: 'url(#pat-block)', stroke: '#d97706', 'stroke-width': 1.2 }, svg);
    el('rect', { x: px(12), y: py(121.5), width: 16 * S, height: 17.5 * S, fill: 'url(#pat-block)', stroke: '#d97706', 'stroke-width': 1.2 }, svg);
    el('rect', { x: px(38), y: py(121.5), width: 16 * S, height: 17.5 * S, fill: 'url(#pat-block)', stroke: '#d97706', 'stroke-width': 1.2 }, svg);

    /* Base Cabinets 18" + Viking 30" + 18" (NO UPPER CABINETS LOCKED) */
    el('rect', { x: px(0), y: py(36), width: 18 * S, height: 36 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.5 }, svg);
    txt(px(9), py(18), lang === 'es' ? 'BASE 18"' : '18" BASE', { 'text-anchor': 'middle', 'font-size': 8.8, 'font-weight': 700, fill: '#2f4f42' }, svg);
    el('rect', { x: px(18), y: py(36.375), width: 30 * S, height: 36.375 * S, fill: '#fff7ed', stroke: '#c2410c', 'stroke-width': 1.8 }, svg);
    el('rect', { x: px(48), y: py(36), width: 18 * S, height: 36 * S, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.5 }, svg);
    txt(px(57), py(18), lang === 'es' ? 'BASE 18"' : '18" BASE', { 'text-anchor': 'middle', 'font-size': 8.8, 'font-weight': 700, fill: '#2f4f42' }, svg);

    /* Low Rear Gas + 120V Pocket (9/16" to 4-15/16") */
    el('rect', { x: px(18), y: py(4.9375), width: 30 * S, height: 4.375 * S, fill: '#dbeafe', stroke: '#2563eb', 'stroke-width': 1.3 }, svg);

    /* Centerline FIRST behind labels + Zephyr Savona Hood (67.5" bottom, 30" W) + Chimney Cover (8-5/8" W) + 6" Duct */
    el('line', { x1: px(33), y1: oy, x2: px(33), y2: py(0), stroke: '#0284c7', 'stroke-width': 1.2, 'stroke-dasharray': '5,4' }, svg);
    el('rect', { x: px(18), y: py(82), width: 30 * S, height: 14.5 * S, fill: '#cbd5e1', stroke: '#334155', 'stroke-width': 1.8 }, svg);
    el('rect', { x: px(33 - 4.3125), y: py(117), width: 8.625 * S, height: 35 * S, fill: 'rgba(226,232,240,0.65)', stroke: '#475569', 'stroke-width': 1.5, 'stroke-dasharray': '5,3' }, svg);
    el('rect', { x: px(30), y: oy, width: 6 * S, height: (121.5 - 82) * S, fill: 'rgba(220,38,38,0.12)', stroke: '#dc2626', 'stroke-width': 1.4, 'stroke-dasharray': '4,3' }, svg);

    /* RETIRED 4"x4" Box at 100" Red X Warning */
    el('rect', { x: px(31), y: py(102), width: 4 * S, height: 4 * S, fill: '#fef2f2', stroke: '#dc2626', 'stroke-width': 1.6, 'stroke-dasharray': '2,2' }, svg);
    el('line', { x1: px(30.5), y1: py(102.5), x2: px(35.5), y2: py(97.5), stroke: '#dc2626', 'stroke-width': 2.2 }, svg);
    el('line', { x1: px(35.5), y1: py(102.5), x2: px(30.5), y2: py(97.5), stroke: '#dc2626', 'stroke-width': 2.2 }, svg);
    txt(px(37), py(100), lang === 'es' ? '✗ NO 4×4 @ 100"' : '✗ NO 4×4 @ 100"', { 'font-size': 8.2, 'font-weight': 800, fill: '#b91c1c' }, svg);

    /* Routes on West Wall (50" SA-C band, attic drops for SA-C, RG, HD) */
    if (layers.routes) {
      el('line', { x1: px(9), y1: oy, x2: px(9), y2: py(state.counter_outlet_height_in), stroke: '#b45309', 'stroke-width': 2.2, 'stroke-dasharray': '6,4', opacity: circuitActive('SA-C') ? 0.9 : 0.2 }, svg);
      el('line', { x1: px(9), y1: py(50), x2: px(57), y2: py(50), stroke: '#b45309', 'stroke-width': 2.3, opacity: circuitActive('SA-C') ? 0.9 : 0.2 }, svg);
      el('line', { x1: px(57), y1: py(50), x2: px(57), y2: py(state.counter_outlet_height_in), stroke: '#b45309', 'stroke-width': 2.2, opacity: circuitActive('SA-C') ? 0.9 : 0.2 }, svg);
      el('line', { x1: px(35.25), y1: oy, x2: px(35.25), y2: py(84.5), stroke: '#1d4ed8', 'stroke-width': 2.4, 'stroke-dasharray': '6,4', opacity: circuitActive('HD') ? 0.95 : 0.2 }, svg);
      el('line', { x1: px(25), y1: oy, x2: px(25), y2: py(3), stroke: '#1d4ed8', 'stroke-width': 2.0, 'stroke-dasharray': '6,4', opacity: circuitActive('RG') ? 0.85 : 0.2 }, svg);
      el('line', { x1: px(25), y1: py(3), x2: px(33), y2: py(3), stroke: '#1d4ed8', 'stroke-width': 2.0, opacity: circuitActive('RG') ? 0.85 : 0.2 }, svg);
    }

    /* Pill-backed appliance & hood labels AFTER wires so dashed lines never strike text */
    el('rect', { x: px(33) - 68, y: py(24.5) - 10, width: 136, height: 32, rx: 3, fill: 'rgba(255,247,237,0.96)' }, svg);
    txt(px(33), py(23), 'VIKING 30"', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#9a3412' }, svg);
    txt(px(33), py(19.5), lang === 'es' ? 'Borde bajo 1" confirmado' : 'Low 1" island trim confirmed', { 'text-anchor': 'middle', 'font-size': 7.8, 'font-weight': 700, fill: '#c2410c' }, svg);
    el('rect', { x: px(33) - 70, y: py(74.5) - 10, width: 140, height: 14, rx: 3, fill: 'rgba(203,213,225,0.96)' }, svg);
    txt(px(33), py(74.5), 'ZEPHYR ZSA-E30AS (67"–68")', { 'text-anchor': 'middle', 'font-size': 8.4, 'font-weight': 800, fill: '#10202b' }, svg);

    /* Plot West Wall Devices: W1, W2, RG-1, HD-1 */
    devs.filter((d) => d.wall === 'west').forEach((d) => {
      drawDeviceBox(svg, px(d.station), py(d.z), d, 38, 17, 'top');
    });

    /* Dual-Datum Left Ruler */
    drawHeightRuler(svg, ox, py, [0, 3, 36, state.counter_outlet_height_in, 67.5, 84.5, 104, 121.5], tVal, [84.5]);

    /* Cardinal Strip */
    const sy = oy + wallH * S + 18;
    txt(ox, sy, lang === 'es' ? '← SUR (0" ref)' : '← SOUTH (0" ref)', { 'font-size': 9.5, 'font-weight': 800, fill: '#b91c1c' }, svg);
    txt(ox + wallW * S, sy, lang === 'es' ? 'NORTE →' : 'NORTH →', { 'text-anchor': 'end', 'font-size': 9.5, 'font-weight': 800, fill: '#15539e' }, svg);

    /* Right Side Detail Panel for HD-1 & 1/2" Drywall Lock */
    const rx = 514;
    drawCompass(svg, 705, 152, lang === 'es' ? 'MIRANDO OESTE' : 'FACING WEST');

    el('rect', { x: rx, y: 225, width: 374, height: 390, rx: 6, fill: '#f8fafc', stroke: '#cbd5e1', 'stroke-width': 1.3 }, svg);
    txt(rx + 14, 248, lang === 'es' ? 'DETALLES FIJOS MURO OESTE (2026-11-20):' : 'LOCKED WEST WALL ELECTRICAL DETAILS:', { 'font-size': 10.5, 'font-weight': 800, fill: '#15539e' }, svg);
    const lines = lang === 'es' ? [
      '1. HD-1 (Espacio 8 · 15A AFCI + Bloqueo BRLW1):',
      '   Caja sencilla 2"×3" al ras para HardieBacker + azulejo.',
      '   Ubicación: Eje 33" ± 2-1/4", ~83"–86" piso (+t subpiso).',
      '   Conexión directa a caja superior Zephyr (NO 4"×4" a 100").',
      '2. W1 (9") y W2 (57") (Espacio 3 · 20A Doble Función):',
      `   Altura: ${heightDualLabel(state.counter_outlet_height_in)} con aros ~1" azulejo.`,
      '3. RG-1 (Espacio 7 · 15A) Estufa Viking 30":',
      '   Franja baja 9/16"–4-15/16" junto a gas 1/2" (<=2" salida).',
      '   Estufa Viking confirmada con borde trasero bajo 1" (sin 8").',
      '4. Tablaroca 1/2" y Cero Calzas en Madera:',
      '   Tablaroca 1/2" (0.50") une con HardieBacker 1/2" (0.42")',
      '   SIN calzas de madera — solo ~1/16" pasta en la junta.',
      '5. SIN Gabinetes Altos en Muro Oeste (Bloqueado).'
    ] : [
      '1. HD-1 (Space 8 · 15A AFCI + Lock-Off BRLW1):',
      '   Flush 1-gang 2"×3" box for backer + tile.',
      '   Position: C/L 33" ± 2-1/4", ~83"–86" floor (+t subfloor).',
      '   Direct hardwire into Zephyr top box (NO 4"×4" at 100").',
      '2. W1 (9") & W2 (57") (Space 3 · 20A Dual-Function):',
      `   Height: ${heightDualLabel(state.counter_outlet_height_in)} w/ ~1" tile rings.`,
      '3. RG-1 (Space 7 · 15A) Viking 30" Gas Range:',
      '   Low 9/16"–4-15/16" pocket beside 1/2" gas (<=2" poke-out).',
      '   Owned Viking confirmed low 1" island trim (no 8" guard).',
      '4. 1/2" Drywall Only — ZERO Stud Shims:',
      '   1/2" drywall (0.50") meets 1/2" HardieBacker (0.42")',
      '   directly on studs — only ~1/16" feather/skim at seam.',
      '5. NO Upper Cabinets on West Range Wall (Locked).'
    ];
    lines.forEach((ln, idx) => {
      const isBold = /^[1-5]\./.test(ln);
      txt(rx + 14, 274 + idx * 24, ln, { 'font-size': isBold ? 9.4 : 8.8, 'font-weight': isBold ? 800 : 600, fill: isBold ? '#10202b' : '#334155' }, svg);
    });

    drawBarScale(svg, 514, 650, S, 3);
    drawTitleBlock(svg, takeoff, reach);
  }

  /* ── VIEW 5: North Entry Wall (115-1/2") + SW-ENTRY 3-Gang + Adjacent NE Hallway Return ── */
  function renderViewNorth(svg, devs, takeoff, reach) {
    const wallW = 115.5;
    const hallW = 29.5;
    const wallH = 121.5;
    const S = 4.9; /* (115.5 + 29.5) * 4.9 = 710.5 px; 121.5 * 4.9 = 595.35 px — strict scaleX === scaleY */
    lastScaleInfo = { view: 'north', scaleX: S, scaleY: S, uniform: true };

    const ox = 84;
    const oy = 112;
    const px = (fromWest) => ox + fromWest * S; /* Left = West Corner -> 115-1/2" = NE Corner -> 145" = Adjacent East Hall Opening */
    const py = (h) => oy + (wallH - h) * S;
    const tVal = effectiveFloorT();

    drawSheetFrame(
      svg,
      lang === 'es' ? 'VISTA 5 — MURO NORTE DE ENTRADA Y APAGADOR TRIPLE (115-1/2")' : 'VIEW 5 — NORTH ENTRY WALL & 3-GANG SWITCH (115-1/2")',
      lang === 'es' ? '← ESQ. OESTE (Estufa) | ESQ. NE PASILLO (0" ref) → · SW-ENTRY 6" al Oeste · Escala Uniforme X = Y' : '← WEST CORNER (Range) | NE HALL CORNER (0" ref) → · SW-ENTRY 6" W of NE · Uniform True Scale X = Y',
      state.south_task_light_mode === 'three_task_lights'
        ? (lang === 'es' ? 'TECHO: 3 LUCES DE TAREA' : 'CEILING: 3 TASK LIGHTS')
        : (lang === 'es' ? 'TECHO: 2 COLGANTES FREGADERO' : 'CEILING: 2 SINK PENDANTS'),
      true
    );

    /* 115-1/2" North Wall + Adjacent East Hall Return (29-1/2" x 79" Hall Opening) */
    el('rect', { x: ox, y: oy, width: wallW * S, height: wallH * S, fill: '#f8fafc', stroke: '#10202b', 'stroke-width': 2.2 }, svg);
    el('rect', { x: px(wallW), y: oy, width: hallW * S, height: wallH * S, fill: '#f1f5f9', stroke: '#94a3b8', 'stroke-width': 1.4, 'stroke-dasharray': '5,4' }, svg);

    /* Original Edwardian Trim Layer (Baseboard 9-1/2" & Picture Rail 103") */
    if (layers.trim) {
      const baseH = state.existing_original_trim.baseboard_height_in || 9.5;
      const railH = state.existing_original_trim.picture_rail_height_in || 103;
      el('rect', { x: px(0), y: py(baseH), width: wallW * S, height: baseH * S, fill: '#fef3c7', stroke: '#92400e', 'stroke-width': 1.2, 'stroke-dasharray': '5,3' }, svg);
      txt(px(48), py(baseH / 2 - 1), lang === 'es' ? `Zoclo Original ${fracIn(baseH)}` : `Original Baseboard ${fracIn(baseH)}`, { 'text-anchor': 'middle', 'font-size': 8.6, 'font-weight': 700, fill: '#92400e' }, svg);
      el('line', { x1: ox, y1: py(railH), x2: px(wallW), y2: py(railH), stroke: '#92400e', 'stroke-width': 1.5, 'stroke-dasharray': '6,4' }, svg);
      txt(ox + 12, py(railH) - 5, lang === 'es' ? `Riel Alto Original ${fracIn(railH)}` : `Original High Picture Rail ${fracIn(railH)}`, { 'font-size': 8.6, 'font-weight': 700, fill: '#92400e' }, svg);
    }

    /* Reference Line for Global Counter Outlet Height (44" vs 41") */
    const refY = py(state.counter_outlet_height_in);
    el('line', { x1: ox, y1: refY, x2: px(wallW), y2: refY, stroke: '#b45309', 'stroke-width': 1.1, 'stroke-dasharray': '3,4' }, svg);
    txt(ox + 12, refY - 4, lang === 'es' ? `Referencia Contactos Cubierta: ${heightDualLabel(state.counter_outlet_height_in)}` : `Global Counter Outlet Height Ref: ${heightDualLabel(state.counter_outlet_height_in)}`, { 'font-size': 8.4, 'font-weight': 700, fill: '#b45309' }, svg);

    /* Adjacent East Wall Return: Hallway Opening (29-1/2" W x 79" H) */
    el('rect', { x: px(wallW), y: py(79), width: hallW * S, height: 79 * S, fill: '#ffffff', stroke: '#15539e', 'stroke-width': 2 }, svg);
    txt(px(wallW + hallW / 2), py(90), lang === 'es' ? 'GIRO MURO ESTE:' : 'EAST WALL RETURN:', { 'text-anchor': 'middle', 'font-size': 7.8, 'font-weight': 800, fill: '#475569' }, svg);
    txt(px(wallW + hallW / 2), py(46), lang === 'es' ? 'VANO PASILLO' : 'HALL OPENING', { 'text-anchor': 'middle', 'font-size': 9.4, 'font-weight': 800, fill: '#15539e' }, svg);
    txt(px(wallW + hallW / 2), py(38), '29-1/2" × 79"', { 'text-anchor': 'middle', 'font-size': 8.4, fill: '#475569', 'font-weight': 700 }, svg);
    txt(px(wallW + hallW / 2), py(31), '[clear_between_casings]', { 'text-anchor': 'middle', 'font-size': 7.2, fill: '#64748b' }, svg);

    /* SW-ENTRY 3-Gang Switch Box (6" West of NE corner, 48" above finished floor) */
    const swXFromWest = wallW - 6;
    const swDev = devs.find((d) => d.id === 'SW-ENTRY');
    if (layers.routes) {
      el('line', { x1: px(swXFromWest), y1: oy, x2: px(swXFromWest), y2: py(48), stroke: '#1d4ed8', 'stroke-width': 2.5, 'stroke-dasharray': '6,4', opacity: circuitActive('LT') ? 0.95 : 0.2 }, svg);
      if (state.sink_control_mode === 'option_b_wired_2gang') {
        el('line', { x1: px(swXFromWest) + 5, y1: oy, x2: px(swXFromWest) + 5, y2: py(48), stroke: '#6d28d9', 'stroke-width': 2.2, 'stroke-dasharray': '6,4' }, svg);
      }
    }
    if (swDev) {
      drawDeviceBox(svg, px(swXFromWest), py(48), swDev, 58, 22, 'left');
      el('rect', { x: px(swXFromWest) - 134, y: py(57.5) - 9, width: 128, height: 12, rx: 2, fill: 'rgba(248,250,252,0.92)' }, svg);
      txt(px(swXFromWest) - 8, py(57.5), lang === 'es' ? '3-GANG (6" O. de Esq. NE)' : '3-GANG (6" W of NE Corner)', { 'text-anchor': 'end', 'font-size': 8.2, 'font-weight': 800, fill: '#1d4ed8' }, svg);
    }

    /* Ceiling Fixture Indicator Bar along Top of Wall */
    if (layers.ceiling) {
      el('rect', { x: ox + 10, y: oy + 6, width: 280, height: 34, rx: 4, fill: '#fef9c3', stroke: '#ca8a04', 'stroke-width': 1.3 }, svg);
      txt(ox + 20, oy + 20, lang === 'es' ? 'CIRCUITO LT (Esp. 9 · 15A AFCI):' : 'CIRCUIT LT (Space 9 · 15A AFCI):', { 'font-size': 8.6, 'font-weight': 800, fill: '#854d0e' }, svg);
      txt(ox + 20, oy + 33, state.south_task_light_mode === 'three_task_lights'
        ? (lang === 'es' ? '1 Luz Principal + 3 Luces Tarea Sur (17-3/4, 53-3/4, 89-3/4")' : '1 Main Light + 3 South Task Lights (17-3/4, 53-3/4, 89-3/4")')
        : (lang === 'es' ? '1 Luz Principal + 2 Colgantes sobre Fregadero (78", 102")' : '1 Main Light + 2 Sink Pendants (78", 102")'), { 'font-size': 8.2, fill: '#713f12', 'font-weight': 600 }, svg);
    }

    /* Left Ruler */
    drawHeightRuler(svg, ox, py, [0, 9.5, state.counter_outlet_height_in, 48, 79, 103, 121.5], tVal, [48]);

    const sy = oy + wallH * S + 18;
    txt(ox, sy, lang === 'es' ? '← ESQ. OESTE (Estufa)' : '← WEST CORNER (Range)', { 'font-size': 9.2, 'font-weight': 800, fill: '#10202b' }, svg);
    txt(ox + (wallW * S) / 2, sy, lang === 'es' ? 'MURO NORTE: 115-1/2" [wall_to_wall] · SIN GABINETES BAJOS' : 'NORTH WALL: 115-1/2" [wall_to_wall] · NO BASE CABINETS', { 'text-anchor': 'middle', 'font-size': 9.2, 'font-weight': 800, fill: '#10202b' }, svg);
    txt(px(wallW), sy, lang === 'es' ? 'ESQ. NE · PASILLO →' : 'NE CORNER · HALL →', { 'text-anchor': 'end', 'font-size': 9.2, 'font-weight': 800, fill: '#15539e' }, svg);

    drawCompass(svg, 848, 178, lang === 'es' ? 'MIRANDO NORTE' : 'FACING NORTH');
    drawBarScale(svg, 84, 938, S, 3);
    drawTitleBlock(svg, takeoff, reach);
  }

  /* ── VIEW 6: Interactive Eaton BRP20L125G 20-Space Subpanel D04 Schematic ── */
  function renderViewPanel(svg, devs, takeoff, reach) {
    /* True-scale physical panel enclosure: 21" H x 14.31" W (Flush Cover 22" x 15.3") at S = 22 px/in */
    const S = 22.0; /* 15.3 * 22 = 336.6 px W; 22 * 22 = 484 px H — strict scaleX === scaleY */
    lastScaleInfo = { view: 'panel', scaleX: S, scaleY: S, uniform: true };

    drawSheetFrame(
      svg,
      lang === 'es' ? 'VISTA 6 — TABLERO INTERACTIVO D04 EATON BRP20L125G (20 ESPACIOS)' : 'VIEW 6 — INTERACTIVE SUBPANEL D04 EATON BRP20L125G (20 SPACES)',
      lang === 'es' ? 'Escala Uniforme X = Y · Toca Espacios 1–9 (Cocina) o 10–20 (Unidad) · Cero Precios' : 'Uniform True Scale X = Y · Tap Spaces 1–9 (Kitchen) or 10–20 (Unit) to Highlight Routes · Zero Prices',
      selectedCircuit
        ? `${lang === 'es' ? 'ACTIVO:' : 'ACTIVE:'} ${selectedCircuit}`
        : (lang === 'es' ? '9 COCINA · 10 UNIDAD · 1 RESERVA' : '9 KITCHEN · 10 UNIT · 1 SPARE'),
      true
    );

    const cx = 248;
    const topY = 128;
    const coverW = 15.3 * S;
    const coverH = 22.0 * S;
    const canW = 14.31 * S;
    const canH = 21.0 * S;

    /* Flush Cover BRPX2A20L1F & Steel Can BRP20L125G (exact physical proportions!) */
    el('rect', { x: cx - coverW / 2, y: topY, width: coverW, height: coverH, rx: 6, fill: '#e2e8f0', stroke: '#475569', 'stroke-width': 1.8 }, svg);
    el('rect', { x: cx - canW / 2, y: topY + 0.5 * S, width: canW, height: canH, rx: 3, fill: '#1e293b', stroke: '#0f172a', 'stroke-width': 2 }, svg);

    /* Main Lug Bus Header */
    txt(cx, topY + 28, 'EATON BRP20L125G · 125A MLO', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#ffffff' }, svg);
    txt(cx, topY + 42, lang === 'es' ? '20 Espacios Completos · Tapa BRPX2A20L1F' : '20 Full-Size Spaces · Cover BRPX2A20L1F', { 'text-anchor': 'middle', 'font-size': 8.5, fill: '#93c5fd', 'font-weight': 600 }, svg);

    /* Draw 10 Rows x 2 Columns (Odd Left 1..19, Even Right 2..20) */
    const rowTop = topY + 56;
    const rowH = 39;
    const slotW = 136;
    BASE_SLOTS.forEach((slot) => {
      const isLeft = slot.space % 2 === 1;
      const rowIdx = Math.floor((slot.space - 1) / 2);
      const sx = isLeft ? (cx - slotW - 10) : (cx + 10);
      const sy = rowTop + rowIdx * rowH;
      const isSel = selectedCircuit === slot.id;
      const isKit = slot.group === 'kitchen';
      const isSpare = slot.group === 'spare';
      const fillCol = isSel ? '#fef08a' : (isKit ? '#e6efe9' : (isSpare ? '#f1f5f9' : '#eef2f6'));
      const strokeCol = isSel ? '#15539e' : (isKit ? '#2f4f42' : '#94a3b8');

      const g = el('g', { 'data-panel-space': slot.space, style: 'cursor:pointer;' }, svg);
      el('rect', { x: sx, y: sy, width: slotW, height: rowH - 5, rx: 4, fill: fillCol, stroke: strokeCol, 'stroke-width': isSel ? 2.4 : 1.3 }, g);
      /* Breaker Handle Pill */
      el('rect', { x: isLeft ? sx + slotW - 22 : sx + 4, y: sy + 7, width: 18, height: 20, rx: 3, fill: isSpare ? '#94a3b8' : (isKit ? wireColor(slot.gauge) : '#475569') }, g);
      txt(isLeft ? sx + slotW - 13 : sx + 13, sy + 20, slot.amps ? `${slot.amps}` : '—', { 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 800, fill: '#ffffff' }, g);

      const tx = isLeft ? sx + 7 : sx + 28;
      txt(tx, sy + 13, `#${slot.space} ${slot.id}`, { 'font-size': 9.4, 'font-weight': 800, fill: '#10202b' }, g);
      txt(tx, sy + 26, slot.cat.slice(0, 17), { 'font-size': 7.8, 'font-weight': 600, fill: '#475569' }, g);
      g.addEventListener('click', () => {
        const nextAct = selectedCircuit === slot.id ? null : slot.id;
        selectedCircuit = nextAct;
        selectedSlotSpace = nextAct ? slot.space : null;
        selectedBoxId = null;
        updateInspectorForSlot(slot, takeoff);
        render();
      });
    });

    /* Right Panel: Live Manhattan Cable Calculator & Breaker Counts Summary (Strictly Zero Prices) */
    const rx = 456;
    el('rect', { x: rx, y: 128, width: 432, height: 484, rx: 6, fill: '#f8fafc', stroke: '#cbd5e1', 'stroke-width': 1.3 }, svg);
    txt(rx + 16, 152, lang === 'es' ? 'CALCULADORA VIVA MANHATTAN Y PASTILLAS EATON BR' : 'LIVE MANHATTAN CABLE & EATON BR COUNTS (ZERO PRICES)', { 'font-size': 10.6, 'font-weight': 800, fill: '#15539e' }, svg);
    txt(rx + 16, 169, lang === 'es' ? `Cantidades Brutas Propuestas (+${takeoff.waste_pct}%) — Verificar stock antes de pedir.` : `Gross Proposed Qty (+${takeoff.waste_pct}%) — Verify On-Hand Stock Before Ordering.`, { 'font-size': 8.8, 'font-weight': 700, fill: '#92400e' }, svg);

    const cards = lang === 'es' ? [
      { y: 186, col: '#b45309', title: '12/2 Cu NM-B (20A: SA-A, SA-B, SA-C, REF)', big: `${takeoff.nm_b_12_2.gross_ft} pies (+${takeoff.waste_pct}%)`, sub: `Manhattan Neto: ${takeoff.nm_b_12_2.net_ft} pies (incl. colas 18")` },
      { y: 256, col: '#1d4ed8', title: '14/2 Cu NM-B (15A: DW, GD, RG, HD, LT)', big: `${takeoff.nm_b_14_2.gross_ft} pies (+${takeoff.waste_pct}%)`, sub: `Manhattan Neto: ${takeoff.nm_b_14_2.net_ft} pies (incl. colas 18")` },
      { y: 326, col: '#6d28d9', title: '14/3 Cu NM-B (Escalera 3 vías apagador fregadero)', big: `${takeoff.nm_b_14_3.gross_ft} pies`, sub: state.sink_control_mode === 'option_b_wired_2gang' ? `Opción B Cableada @ 70": ${takeoff.nm_b_14_3.net_ft} pies neto` : 'Opción A Botón Aire + Control Inalámbrico (0 pies)' },
      { y: 396, col: '#2f4f42', title: 'Pastillas Eaton BR Cocina (Espacios 1–9)', big: `${takeoff.breakers.BRN120DF}× BRN120DF · ${takeoff.breakers.BRN115DF}× BRN115DF · ${takeoff.breakers.BRN115AF}× BRN115AF`, sub: `Más 1× Bloqueo BRLW1 (HD Esp. 8)${takeoff.breakers.deadfront_gfci_15a ? ' + 1× GFCI Frente Muerto' : ''}` },
      { y: 466, col: '#334155', title: 'Cajas Cocina y Aros ~1" Azulejo (Cero Precios)', big: `${takeoff.boxes.one_gang_boxes}× 1G · 1× HD-1 (2"×3") · ${takeoff.boxes.two_gang_boxes}× 2G · 1× 3G · ${takeoff.boxes.ceiling_boxes}× Techo`, sub: 'Incluye 2× aros ~1" azulejo (W1/W2) + caja HD-1 al ras' }
    ] : [
      { y: 186, col: '#b45309', title: '12/2 Cu NM-B (20A: SA-A, SA-B, SA-C, REF)', big: `${takeoff.nm_b_12_2.gross_ft} ft (+${takeoff.waste_pct}%)`, sub: `Net Manhattan: ${takeoff.nm_b_12_2.net_ft} ft (incl. 18" box tails)` },
      { y: 256, col: '#1d4ed8', title: '14/2 Cu NM-B (15A: DW, GD, RG, HD, LT)', big: `${takeoff.nm_b_14_2.gross_ft} ft (+${takeoff.waste_pct}%)`, sub: `Net Manhattan: ${takeoff.nm_b_14_2.net_ft} ft (incl. 18" box tails)` },
      { y: 326, col: '#6d28d9', title: '14/3 Cu NM-B (3-Way Sink Switch Traveler)', big: `${takeoff.nm_b_14_3.gross_ft} ft`, sub: state.sink_control_mode === 'option_b_wired_2gang' ? `Option B Wired @ 70": ${takeoff.nm_b_14_3.net_ft} ft net` : 'Option A Air Button + Wireless Remote (0 ft needed)' },
      { y: 396, col: '#2f4f42', title: 'Eaton BR Kitchen Breakers (Spaces 1–9)', big: `${takeoff.breakers.BRN120DF}× BRN120DF · ${takeoff.breakers.BRN115DF}× BRN115DF · ${takeoff.breakers.BRN115AF}× BRN115AF`, sub: `Plus 1× BRLW1 Lock-Off (HD Space 8)${takeoff.breakers.deadfront_gfci_15a ? ' + 1× Dead-Front GFCI' : ''}` },
      { y: 466, col: '#334155', title: 'Kitchen Boxes & 1" Tile Mud Rings (Zero Prices)', big: `${takeoff.boxes.one_gang_boxes}× 1G · 1× HD-1 (2"×3") · ${takeoff.boxes.two_gang_boxes}× 2G · 1× 3G · ${takeoff.boxes.ceiling_boxes}× Ceil`, sub: 'Includes 2× ~1" tile mud rings (W1/W2) + flush HD-1 box' }
    ];
    cards.forEach((c) => {
      el('rect', { x: rx + 14, y: c.y, width: 404, height: 58, rx: 5, fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 1.2 }, svg);
      el('rect', { x: rx + 14, y: c.y, width: 5, height: 58, rx: 2, fill: c.col }, svg);
      txt(rx + 28, c.y + 16, c.title, { 'font-size': 8.6, 'font-weight': 800, fill: '#4b5c69' }, svg);
      txt(rx + 28, c.y + 35, c.big, { 'font-size': 11.2, 'font-weight': 800, fill: '#10202b' }, svg);
      txt(rx + 28, c.y + 50, c.sub, { 'font-size': 8.4, fill: '#475569', 'font-weight': 600 }, svg);
    });

    /* Scale & Compass */
    drawCompass(svg, 818, 700, lang === 'es' ? 'TABLERO D04' : 'SUBPANEL D04');
    txt(80, 646, lang === 'es' ? 'Caja Acero: 14-5/16" × 21" (claro 14-1/2") · Tapa: 15-5/16" × 22"' : 'Steel Can: 14-5/16" × 21" (14-1/2" bay) · Flush Cover: 15-5/16" × 22"', { 'font-size': 9.2, 'font-weight': 700, fill: '#334155' }, svg);
    drawBarScale(svg, 80, 675, S, 1);

    /* Active Holds Summary Card at Bottom of Panel View */
    el('rect', { x: 48, y: 745, width: 840, height: 215, rx: 6, fill: '#fef2f2', stroke: '#fca5a5', 'stroke-width': 1.4 }, svg);
    txt(64, 768, lang === 'es' ? 'ESPERAS ACTIVAS EN TABLERO D04 (NO LIBERAR SIN CONFIRMAR):' : 'ACTIVE SUBPANEL D04 HOLDS (DO NOT RELEASE WITHOUT SIGN-OFF):', { 'font-size': 10.5, 'font-weight': 800, fill: '#b91c1c' }, svg);
    const holdLines = lang === 'es' ? [
      '• Recorrido visita NEXT reprogramada: Confirmar alimentador 80A/#4 Cu vs 100A/#3 Cu y revisar caja física Eaton BRP20L125G + tapa.',
      '• Cortes laterales D04 EN ESPERA: Salir solo hacia arriba al ático o debajo de la zona prohibida de 53"–77" (NUNCA por atrás).',
      '• Circuitos no-cocina (Espacios 11–13): Cajas + tubo vacío ENT solamente — NO jalar cable antes de liberación.',
      '• Circuito HD (Espacio 8): Bloqueo BRLW1 obligatorio + caja sencilla 2"×3" (~83"–86" piso, al ras del acabado).',
      '• Espacios 5 y 6 (DW + GD): Neutros estrictamente separados y etiquetados dentro del gabinete del fregadero (72"–102").'
    ] : [
      '• NEXT Planning Visit (Reschedule Req.): Reconcile 80A/#4 Cu vs 100A/#3 Cu feeder & inspect onsite Eaton BRP20L125G box + flush cover.',
      '• D04 Side-Entry Notches ON HOLD: Route exits vertically through top header to attic or approved bands — NEVER through back.',
      '• Non-Kitchen Circuits (Spaces 11–13): Approved boxes + empty ENT tubing only — NO wire pull before release.',
      '• Circuit HD (Space 8): BRLW1 handle lock-off required + flush 1-gang 2"×3" box (~83"–86" above floor, flush to finished surface).',
      '• Spaces 5 & 6 (DW + GD): Strictly separate labeled neutrals inside sink base (72"–102") — NEVER behind dishwasher.'
    ];
    holdLines.forEach((ln, i) => {
      txt(64, 794 + i * 30, ln, { 'font-size': 9.4, 'font-weight': 600, fill: '#7f1d1d' }, svg);
    });

    drawTitleBlock(svg, takeoff, reach);
  }

  /* ── Render Attached Comment Callout Pins onto SVG ── */
  function renderSvgPins(svg) {
    const viewPins = (state.pins || []).filter((p) => !p.view || p.view === activeView);
    viewPins.forEach((p, idx) => {
      const ax = Number(p.x) || 460;
      const ay = Number(p.y) || 320;
      const lx = ax > 600 ? ax - 150 : ax + 54;
      const ly = ay > 800 ? ay - 46 : Math.max(96, ay - 26);
      const col = p.intent === 'flag_problem' ? '#dc2626' : (p.intent === 'ask_question' ? '#15539e' : '#2f4f42');

      el('circle', { cx: ax, cy: ay, r: 16, fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': '4,3' }, svg);
      el('line', { x1: ax, y1: ay, x2: lx, y2: ly + 12, stroke: col, 'stroke-width': 1.8 }, svg);
      el('rect', { x: lx, y: ly, width: 145, height: 28, rx: 4, fill: '#ffffff', stroke: col, 'stroke-width': 1.6 }, svg);
      txt(lx + 7, ly + 12, `#${idx + 1} ${p.author || 'Crew'}`, { 'font-size': 8.2, 'font-weight': 800, fill: col }, svg);
      txt(lx + 7, ly + 23, String(p.note || '').slice(0, 24), { 'font-size': 7.8, fill: '#10202b' }, svg);
    });
  }

  /* ── Render HTML Companion Sections (Schedule Table, Summary Strip, Holds, Takeoff, Pins, EOD) ── */
  function renderSummaryStrip(takeoff, reach) {
    const strip = $('elec-summary-strip');
    if (!strip) return;
    const tVal = effectiveFloorT();
    strip.innerHTML =
      `<div class="closure-card ${reach.allPass ? 'ok' : 'fail'}"><strong>${lang === 'es' ? 'Alcance 24" Cubierta' : '24" Counter Reach'}</strong>${reach.allPass ? (lang === 'es' ? 'CUMPLE en Este, Sur y Oeste' : 'PASS on East, South & West') : (lang === 'es' ? 'Revisar cierre o cubierta >12"' : 'Check closure or >12" counter')}</div>` +
      `<div class="closure-card ok"><strong>${lang === 'es' ? 'HD-1 Campana Zephyr' : 'HD-1 Zephyr Hood'}</strong>${lang === 'es' ? 'Caja 2"×3" @ ~83"–86" (+t) · Bloqueo' : 'Flush 1-Gang 2"×3" @ ~83"–86" (+t) · Lock-Off'}</div>` +
      `<div class="closure-card fail"><strong>${lang === 'es' ? 'Zona D04 (53"–77")' : 'D04 Backside (53"–77")'}</strong>${lang === 'es' ? 'PROHIBIDO tornillos/cajas · Cortes en espera' : 'NO screws/boxes/back entry · Side notches HOLD'}</div>` +
      `<div class="closure-card warn"><strong>${lang === 'es' ? 'Subpiso y Tablaroca' : 'Subfloor & Wall Substrate'}</strong>${tVal > 0 ? `+t = ${fracIn(tVal)} (${lang === 'es' ? 'subpiso' : 'bare'})` : (lang === 'es' ? 'Piso instalado (+0")' : 'Finished floor (+0")')} · ${lang === 'es' ? 'Tablaroca 1/2" sin calzas' : '1/2" drywall / no shims'}</div>`;
  }

  function renderPanelTable(takeoff) {
    const tbody = $('panel-schedule-tbody');
    if (!tbody) return;
    const mult = 1 + takeoff.waste_pct / 100;
    tbody.innerHTML = '';

    BASE_SLOTS.forEach((slot) => {
      if (slotFilter !== 'ALL' && slot.group !== slotFilter) {
        if (!(slotFilter === 'unit_other' && slot.group === 'spare')) return;
      }
      const tr = document.createElement('tr');
      if (slot.group === 'unit_other') tr.className = 'row-unit-other';
      if (slot.group === 'spare') tr.className = 'row-spare';
      if (selectedCircuit === slot.id) tr.classList.add('row-selected');

      const liveNet = slot.group === 'kitchen' ? takeoff.perCircuit[slot.id] : slot.base_ft;
      const liveGross = liveNet > 0 ? Math.ceil(liveNet * mult) : 0;
      const wireCls = slot.gauge === '12/2' ? 'wire-12' : (slot.gauge === '14/2' ? 'wire-14' : 'wire-none');
      let cableLabel = slot.cable;
      if (slot.id === 'LT' && state.sink_control_mode === 'option_b_wired_2gang') {
        cableLabel = `14/2 + ${takeoff.nm_b_14_3.gross_ft}ft 14/3`;
      }
      let brkCat = slot.cat;
      if (slot.id === 'RG' && state.range_gfci_method === 'afci_breaker_plus_accessible_deadfront_gfci') {
        brkCat = 'BRN115AF + DF-GFCI';
      }

      tr.innerHTML =
        `<td><strong>#${slot.space}</strong></td>` +
        `<td><strong>${slot.id}</strong></td>` +
        `<td>${lang === 'es' ? slot.serves_es : slot.serves_en}</td>` +
        `<td>${slot.amps ? slot.amps + 'A' : '—'}</td>` +
        `<td><code>${brkCat}</code><div class="tbl-sub">${lang === 'es' ? slot.breaker_es : slot.breaker_en}</div></td>` +
        `<td><span class="wire-chip ${wireCls}">${cableLabel}</span><div class="tbl-sub">${lang === 'es' ? slot.route_es : slot.route_en}</div></td>` +
        `<td>${liveNet > 0 ? `<strong>${liveGross} ft</strong><div class="tbl-sub">${liveNet} ft ${lang === 'es' ? 'neto' : 'net'}</div>` : '—'}</td>`;

      tr.addEventListener('click', () => {
        const nextAct = selectedCircuit === slot.id ? null : slot.id;
        selectedCircuit = nextAct;
        selectedSlotSpace = nextAct ? slot.space : null;
        selectedBoxId = null;
        updateInspectorForSlot(slot, takeoff);
        render();
      });
      tbody.appendChild(tr);
    });
  }

  function renderClashes() {
    const grid = $('clashes-grid');
    if (!grid) return;
    grid.innerHTML = '';
    (state.flagged_clashes || []).forEach((c) => {
      const card = document.createElement('div');
      card.className = 'clash-card' + (c.severity === 'MEDIUM' ? ' sev-medium' : '');
      card.innerHTML =
        `<div class="clash-card-head"><span>${lang === 'es' ? c.title_es : c.title_en}</span><span class="pill ${c.severity === 'HIGH' ? 'pill-fail' : 'pill-warn'}">${c.severity}</span></div>` +
        `<div>${lang === 'es' ? c.es : c.en}</div>`;
      grid.appendChild(card);
    });
  }

  function renderTakeoffCards(takeoff) {
    const grid = $('takeoff-grid');
    if (!grid) return;
    const wPill = $('takeoff-waste-pill');
    if (wPill) wPill.textContent = `${lang === 'es' ? 'Margen' : 'Waste Factor'}: +${takeoff.waste_pct}%`;

    const isOptB = state.sink_control_mode === 'option_b_wired_2gang';
    grid.innerHTML =
      `<div class="takeoff-card card-12">` +
        `<div class="takeoff-card-title">12/2 Cu NM-B (20A · SA-A/B/C, REF)</div>` +
        `<div class="takeoff-card-big">${takeoff.nm_b_12_2.gross_ft} ft</div>` +
        `<div class="takeoff-card-sub">${lang === 'es' ? 'Neto Manhattan:' : 'Net Manhattan:'} ${takeoff.nm_b_12_2.net_ft} ft (+${takeoff.waste_pct}%)<br>SA-A ${takeoff.perCircuit['SA-A']} · SA-B ${takeoff.perCircuit['SA-B']} · SA-C ${takeoff.perCircuit['SA-C']} · REF ${takeoff.perCircuit['REF']} ft</div>` +
      `</div>` +
      `<div class="takeoff-card card-14">` +
        `<div class="takeoff-card-title">14/2 Cu NM-B (15A · DW, GD, RG, HD, LT)</div>` +
        `<div class="takeoff-card-big">${takeoff.nm_b_14_2.gross_ft} ft</div>` +
        `<div class="takeoff-card-sub">${lang === 'es' ? 'Neto Manhattan:' : 'Net Manhattan:'} ${takeoff.nm_b_14_2.net_ft} ft (+${takeoff.waste_pct}%)<br>DW ${takeoff.perCircuit['DW']} · GD ${takeoff.perCircuit['GD']} · RG ${takeoff.perCircuit['RG']} · HD ${takeoff.perCircuit['HD']} · LT ${takeoff.perCircuit['LT']} ft</div>` +
      `</div>` +
      `<div class="takeoff-card card-143">` +
        `<div class="takeoff-card-title">14/3 Cu NM-B (${lang === 'es' ? '3 Vías Fregadero' : 'Sink 3-Way Traveler'})</div>` +
        `<div class="takeoff-card-big">${takeoff.nm_b_14_3.gross_ft} ft</div>` +
        `<div class="takeoff-card-sub">${isOptB
          ? (lang === 'es' ? `Opción B caja doble @ 70": ${takeoff.nm_b_14_3.net_ft} ft neto (+${takeoff.waste_pct}%)` : `Option B wired switch @ 70": ${takeoff.nm_b_14_3.net_ft} ft net (+${takeoff.waste_pct}%)`)
          : (lang === 'es' ? 'Opción A botón aire + inalámbrico S2 (0 ft necesarios)' : 'Option A air button + wireless remote at S2 (0 ft needed)')}</div>` +
      `</div>` +
      `<div class="takeoff-card card-essex">` +
        `<div class="takeoff-card-title">${lang === 'es' ? 'Pastillas Eaton BR y Cajas Cocina' : 'Eaton BR Breakers & Kitchen Boxes'}</div>` +
        `<div class="takeoff-card-big">${takeoff.breakers.BRN120DF}×20A DF · ${takeoff.breakers.BRN115DF}×15A DF · ${takeoff.breakers.BRN115AF}×15A AF</div>` +
        `<div class="takeoff-card-sub">+ 1× BRLW1 ${lang === 'es' ? 'bloqueo HD' : 'HD lock-off'}${takeoff.breakers.deadfront_gfci_15a ? ' + 1× Dead-Front GFCI' : ''}<br>${takeoff.boxes.one_gang_boxes}×1G · 1×HD-1(2"×3") · ${takeoff.boxes.two_gang_boxes}×2G · 1×3G · ${takeoff.boxes.ceiling_boxes}×${lang === 'es' ? 'Techo' : 'Ceil'} · 2×1" ${lang === 'es' ? 'aros' : 'rings'}</div>` +
      `</div>`;
  }

  function renderPhotoSidePanel() {
    const isWest = activeView === 'west';
    const img = $('site-photo-img');
    const title = $('photo-panel-title');
    const lLbl = $('photo-left-lbl');
    const mLbl = $('photo-mid-lbl');
    const rLbl = $('photo-right-lbl');
    const list = $('photo-callouts');

    if (img) {
      const targetSrc = isWest ? './assets/west-range-wall.jpeg' : './assets/south-sink-wall.jpg';
      if (!img.getAttribute('src') || !img.getAttribute('src').endsWith(targetSrc.slice(2))) {
        img.src = targetSrc;
      }
    }
    if (title) title.textContent = isWest ? t('photo_title_west') : t('photo_title_south');
    if (lLbl) lLbl.textContent = isWest ? t('photo_west_l') : t('photo_south_l');
    if (mLbl) mLbl.textContent = isWest ? t('photo_west_m') : t('photo_south_m');
    if (rLbl) rLbl.textContent = isWest ? t('photo_west_r') : t('photo_south_r');
    if (list) list.innerHTML = (isWest ? t('photo_callouts_west') : t('photo_callouts_south')).join('');
  }

  function renderPinsList() {
    const list = $('pin-list');
    if (!list) return;
    list.innerHTML = '';
    const pins = state.pins || [];
    if (!pins.length) {
      list.innerHTML = `<p class="empty-note">${lang === 'es' ? 'Sin comentarios adjuntos todavía.' : 'No comment pins attached yet.'}</p>`;
      return;
    }
    pins.forEach((p, idx) => {
      const item = document.createElement('div');
      item.className = 'pin-item';
      item.innerHTML =
        `<div class="pin-head"><strong>#${idx + 1} · ${p.author || 'Crew'} (${p.view || 'floor'})</strong><span class="pill pill-info">${p.intent}</span></div>` +
        `<div>${escapeHtml(p.note)}</div>` +
        `<div class="pin-actions">` +
          `<button type="button" class="btn btn-sm" data-pin-send-mod="${idx}">${t('btn_pin_send')} (${t('pin_mode_modify')})</button>` +
          `<button type="button" class="btn btn-sm" data-pin-send-q="${idx}">${t('btn_pin_send')} (${t('pin_mode_question')})</button>` +
        `</div>`;
      item.querySelector(`[data-pin-send-mod="${idx}"]`).addEventListener('click', () => sendPinToAgent(p, 'modify'));
      item.querySelector(`[data-pin-send-q="${idx}"]`).addEventListener('click', () => sendPinToAgent(p, 'question'));
      list.appendChild(item);
    });
  }

  function renderEodList() {
    const list = $('eod-list');
    const pill = $('eod-count-pill');
    if (pill) pill.textContent = `${pendingEod.length} ${lang === 'es' ? 'pendientes' : 'pending'}`;
    if (!list) return;
    list.innerHTML = '';
    if (!pendingEod.length) {
      list.innerHTML = `<p class="empty-note">${t('eod_empty')}</p>`;
      return;
    }
    pendingEod.forEach((ed) => {
      const div = document.createElement('div');
      div.className = 'eod-item';
      div.innerHTML =
        `<div class="eod-head"><strong>${escapeHtml(ed.rev_id || ed.id || 'edit')}</strong><span class="pill pill-warn">${escapeHtml(ed.author || 'crew')}</span></div>` +
        `<div>${escapeHtml(ed.summary || ed.note || 'Field override')}</div>` +
        `<div class="eod-actions">` +
          `<button type="button" class="btn btn-sm btn-essex" data-eod-acc="${escapeHtml(ed.rev_id || ed.id)}">${t('btn_accept')}</button>` +
          `<button type="button" class="btn btn-sm btn-danger" data-eod-rej="${escapeHtml(ed.rev_id || ed.id)}">${t('btn_reject')}</button>` +
        `</div>`;
      div.querySelector('[data-eod-acc]').addEventListener('click', () => decideEod(ed.rev_id || ed.id, 'accept'));
      div.querySelector('[data-eod-rej]').addEventListener('click', () => decideEod(ed.rev_id || ed.id, 'reject'));
      list.appendChild(div);
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Apply I18N & Active Control States ── */
  function syncChromeUi(reach) {
    document.documentElement.lang = (window.U4PlanNav && typeof window.U4PlanNav.getLang === 'function') ? window.U4PlanNav.getLang() : (lang === 'ru' ? 'ru' : (lang === 'es' ? 'es-MX' : 'en'));
    document.title = t('doc_title');
    if ($('hdr-title')) $('hdr-title').textContent = t('hdr_title');
    if ($('hdr-sub')) $('hdr-sub').textContent = t('hdr_sub');
    if ($('link-back-room')) $('link-back-room').textContent = t('back_room');
    if ($('link-floor-plan-top')) $('link-floor-plan-top').textContent = t('link_floor_plan');
    if ($('link-west-hood-top')) $('link-west-hood-top').textContent = t('link_west_hood');
    if ($('btn-lang')) $('btn-lang').textContent = t('btn_lang');
    if ($('btn-circle-toggle')) $('btn-circle-toggle').textContent = circleMode ? t('btn_circle_off') : t('btn_circle_on');
    if ($('btn-export-svg')) $('btn-export-svg').textContent = t('btn_export_svg');
    if ($('btn-download-pdf')) $('btn-download-pdf').textContent = t('btn_download_pdf');
    if ($('hold-banner')) $('hold-banner').innerHTML = t('hold_html');
    if ($('conflict-text')) $('conflict-text').textContent = t('conflict_text');
    if ($('btn-reload-latest')) $('btn-reload-latest').textContent = t('btn_reload');

    ['floor', 'south', 'east', 'west', 'north', 'panel'].forEach((v) => {
      const btn = $(`tab-${v}`);
      if (btn) {
        btn.textContent = t('tabs')[v];
        btn.classList.toggle('active', activeView === v);
        btn.setAttribute('aria-selected', activeView === v ? 'true' : 'false');
      }
    });

    const vtMap = t('view_titles');
    const titleKey = activeView === 'east' ? (state.east_view_side === 'dining' ? 'east_dining' : 'east_kitchen') : activeView;
    if ($('svg-panel-title')) $('svg-panel-title').textContent = vtMap[titleKey] || vtMap.floor;

    if ($('active-circuit-pill')) {
      $('active-circuit-pill').textContent = selectedCircuit
        ? `${lang === 'es' ? 'Resaltando Circuito:' : 'Highlighting Circuit:'} ${selectedCircuit}`
        : t('showing_all_ckts');
    }

    ['routes', 'reach', 'ceiling', 'trim', 'holds'].forEach((k) => {
      const btn = $(`tgl-${k}`);
      if (btn) {
        btn.textContent = t(`tgl_${k}`);
        btn.className = 'toggle-pill-btn' + (layers[k] ? (k === 'holds' ? ' on-alert' : ' on') : '');
        btn.setAttribute('aria-pressed', layers[k] ? 'true' : 'false');
      }
    });

    if ($('lbl-outlet-h')) $('lbl-outlet-h').textContent = t('lbl_outlet_h');
    if ($('btn-h-44')) { $('btn-h-44').textContent = t('btn_h_44'); $('btn-h-44').classList.toggle('btn-primary', Number(state.counter_outlet_height_in) === 44); }
    if ($('btn-h-41')) { $('btn-h-41').textContent = t('btn_h_41'); $('btn-h-41').classList.toggle('btn-primary', Number(state.counter_outlet_height_in) === 41); }
    if ($('lbl-sink-ctrl')) $('lbl-sink-ctrl').textContent = t('lbl_sink_ctrl');
    if ($('btn-sink-optA')) { $('btn-sink-optA').textContent = t('btn_opt_a'); $('btn-sink-optA').classList.toggle('btn-essex', state.sink_control_mode === 'option_a_air_wireless'); }
    if ($('btn-sink-optB')) { $('btn-sink-optB').textContent = t('btn_opt_b'); $('btn-sink-optB').classList.toggle('btn-essex', state.sink_control_mode === 'option_b_wired_2gang'); }
    if ($('lbl-lights-opt')) $('lbl-lights-opt').textContent = t('lbl_lights_opt');
    if ($('btn-lt-3task')) { $('btn-lt-3task').textContent = t('btn_lt_3'); $('btn-lt-3task').classList.toggle('btn-primary', state.south_task_light_mode === 'three_task_lights'); }
    if ($('btn-lt-2pend')) { $('btn-lt-2pend').textContent = t('btn_lt_2'); $('btn-lt-2pend').classList.toggle('btn-primary', state.south_task_light_mode === 'two_pendants'); }
    if ($('lbl-route-opt')) $('lbl-route-opt').textContent = t('lbl_route_opt');
    if ($('btn-rt-inwall')) { $('btn-rt-inwall').textContent = t('btn_rt_inwall'); $('btn-rt-inwall').classList.toggle('btn-primary', state.south_routing_mode === 'in_wall_bored'); }
    if ($('btn-rt-attic')) { $('btn-rt-attic').textContent = t('btn_rt_attic'); $('btn-rt-attic').classList.toggle('btn-primary', state.south_routing_mode === 'via_attic'); }
    if ($('btn-reset-elec')) $('btn-reset-elec').textContent = t('btn_reset');

    /* Bare subfloor controls */
    const isBare = state.floor_condition !== 'finished_installed';
    if ($('lbl-floor-cond')) $('lbl-floor-cond').textContent = t('lbl_floor_cond');
    if ($('btn-floor-bare')) { $('btn-floor-bare').textContent = t('btn_floor_bare'); $('btn-floor-bare').classList.toggle('btn-primary', isBare); $('btn-floor-bare').setAttribute('aria-pressed', isBare ? 'true' : 'false'); }
    if ($('btn-floor-finished')) { $('btn-floor-finished').textContent = t('btn_floor_fin'); $('btn-floor-finished').classList.toggle('btn-primary', !isBare); $('btn-floor-finished').setAttribute('aria-pressed', !isBare ? 'true' : 'false'); }
    if ($('lbl-subfloor-allow')) $('lbl-subfloor-allow').textContent = t('lbl_subfloor_allow');
    if ($('inp-subfloor-allow')) { $('inp-subfloor-allow').value = state.floor_buildup_t_in; $('inp-subfloor-allow').disabled = !isBare; }
    if ($('subfloor-status-note')) $('subfloor-status-note').textContent = isBare ? t('subfloor_note_bare') : t('subfloor_note_fin');

    /* Context Bars for South (drag sliders) & East (Dining flip) */
    if ($('south-drag-bar')) $('south-drag-bar').hidden = activeView !== 'south';
    if ($('lbl-south-drag')) $('lbl-south-drag').textContent = t('lbl_south_drag');
    if ($('lbl-piesafe-pos')) $('lbl-piesafe-pos').textContent = t('lbl_piesafe_pos');
    if ($('lbl-sink-pos')) $('lbl-sink-pos').textContent = t('lbl_sink_pos');
    if ($('rng-piesafe')) $('rng-piesafe').value = state.pie_safe_start_in;
    if ($('val-piesafe-pos')) $('val-piesafe-pos').textContent = `${fracIn(state.pie_safe_start_in)}–${fracIn(state.pie_safe_start_in + state.pie_safe_width_in)}`;
    if ($('rng-sink')) $('rng-sink').value = state.sink_base_start_in;
    if ($('val-sink-pos')) $('val-sink-pos').textContent = `${fracIn(state.sink_base_start_in)}–${fracIn(state.sink_base_start_in + state.sink_base_width_in)}`;

    if ($('east-flip-bar')) $('east-flip-bar').hidden = activeView !== 'east';
    const isDin = state.east_view_side === 'dining';
    if ($('east-flip-desc')) $('east-flip-desc').innerHTML = isDin ? t('east_desc_dining') : t('east_desc_kitchen');
    if ($('btn-flip-dining')) {
      $('btn-flip-dining').textContent = isDin ? t('btn_flip_to_kitchen') : t('btn_flip_to_dining');
      $('btn-flip-dining').setAttribute('aria-pressed', isDin ? 'true' : 'false');
    }

    /* Status strip */
    if ($('reach-pill')) {
      $('reach-pill').className = 'pill ' + (reach.allPass ? 'pill-pass' : 'pill-fail');
      $('reach-pill').textContent = reach.allPass
        ? (lang === 'es' ? 'Alcance 24" Cubierta: CUMPLE' : '24" Counter Reach: PASS')
        : (lang === 'es' ? 'Alcance 24" Cubierta: REVISAR' : '24" Counter Reach: CHECK');
    }
    if ($('d04-zone-pill')) $('d04-zone-pill').textContent = t('d04_zone_pill');
    if ($('hd1-pill')) {
      $('hd1-pill').textContent = `HD-1: 1-Gang 2"×3" @ ~83"–86" ${isBare ? '(+t ' + fracIn(effectiveFloorT()) + ')' : '(+0")'}`;
    }
    if ($('scale-pill')) $('scale-pill').textContent = t('scale_pill');
    if ($('sync-stamp-pill')) {
      const hasEod = pendingEod.length > 0 || state.status === 'PENDING_EOD_REVIEW';
      $('sync-stamp-pill').className = 'pill ' + (hasEod || hasUnsyncedLocalEdits ? 'pill-warn' : (tailnetOnline ? 'pill-pass' : 'pill-neutral'));
      $('sync-stamp-pill').textContent = hasEod
        ? t('pending_eod_stamp')
        : (hasUnsyncedLocalEdits ? t('not_synced') : (tailnetOnline ? t('tailnet_live') : t('baseline_loaded')));
    }
    if ($('rev-badge')) $('rev-badge').textContent = state.base_rev;
    if ($('tailnet-badge')) {
      $('tailnet-badge').className = 'pill ' + (tailnetOnline ? 'pill-pass' : 'pill-neutral');
      const displayUser = tailnetUser ? String(tailnetUser).split('@')[0] : '';
      $('tailnet-badge').textContent = tailnetOnline ? `${t('tailnet_live')}${displayUser ? ' · ' + displayUser : ''}` : t('tailnet_off');
    }

    /* Section Headers & Labels */
    if ($('photo-badge')) $('photo-badge').textContent = t('photo_badge');
    if ($('panel-sched-title')) $('panel-sched-title').textContent = t('panel_sched_title');
    if ($('panel-counts-pill')) $('panel-counts-pill').textContent = t('panel_counts');
    if ($('flt-slots-all')) { $('flt-slots-all').textContent = t('flt_all'); $('flt-slots-all').classList.toggle('btn-primary', slotFilter === 'ALL'); }
    if ($('flt-slots-kitchen')) { $('flt-slots-kitchen').textContent = t('flt_kit'); $('flt-slots-kitchen').classList.toggle('btn-primary', slotFilter === 'kitchen'); }
    if ($('flt-slots-unit')) { $('flt-slots-unit').textContent = t('flt_unit'); $('flt-slots-unit').classList.toggle('btn-primary', slotFilter === 'unit_other'); }
    if ($('btn-clear-circuit')) $('btn-clear-circuit').textContent = t('btn_clear_ckt');
    if ($('th-space')) $('th-space').textContent = t('th_space');
    if ($('th-ckt')) $('th-ckt').textContent = t('th_ckt');
    if ($('th-serves')) $('th-serves').textContent = t('th_serves');
    if ($('th-amps')) $('th-amps').textContent = t('th_amps');
    if ($('th-breaker')) $('th-breaker').textContent = t('th_breaker');
    if ($('th-cable')) $('th-cable').textContent = t('th_cable');
    if ($('th-len')) $('th-len').textContent = t('th_len');
    if ($('holds-title')) $('holds-title').textContent = t('holds_title');
    if ($('holds-lock-pill')) $('holds-lock-pill').textContent = t('holds_lock');
    if ($('takeoff-title')) $('takeoff-title').textContent = t('takeoff_title');
    if ($('takeoff-notice')) $('takeoff-notice').textContent = t('takeoff_notice');
    if ($('lbl-waste-pct')) $('lbl-waste-pct').textContent = t('lbl_waste_pct');
    if ($('btn-waste-15')) { $('btn-waste-15').textContent = t('btn_w15'); $('btn-waste-15').classList.toggle('btn-primary', Number(state.waste_pct) === 15); }
    if ($('btn-waste-20')) { $('btn-waste-20').textContent = t('btn_w20'); $('btn-waste-20').classList.toggle('btn-primary', Number(state.waste_pct) === 20); }
    if ($('inp-waste-pct')) $('inp-waste-pct').value = state.waste_pct;
    if ($('lbl-rg-gfci')) $('lbl-rg-gfci').textContent = t('lbl_rg_gfci');
    if ($('sel-rg-gfci')) {
      $('sel-rg-gfci').value = state.range_gfci_method;
      const optDf = $('sel-rg-gfci').querySelector('option[value="df_breaker_at_d04"]');
      const optAf = $('sel-rg-gfci').querySelector('option[value="afci_breaker_plus_accessible_deadfront_gfci"]');
      if (optDf) optDf.textContent = t('rg_opt_df');
      if (optAf) optAf.textContent = t('rg_opt_afci');
    }
    if ($('trim-title')) $('trim-title').textContent = t('trim_title');
    if ($('trim-badge')) $('trim-badge').textContent = t('trim_badge');
    if ($('trim-rule-note')) $('trim-rule-note').textContent = t('trim_note');
    if ($('lbl-author')) $('lbl-author').textContent = t('lbl_author');
    if ($('lbl-dining-w')) $('lbl-dining-w').textContent = t('lbl_dining_w');
    if ($('lbl-trim-base')) $('lbl-trim-base').textContent = t('lbl_trim_base');
    if ($('lbl-trim-rail')) $('lbl-trim-rail').textContent = t('lbl_trim_rail');
    if ($('inp-dining-w')) $('inp-dining-w').value = state.dining_wall_width_in;
    if ($('inp-trim-baseboard')) $('inp-trim-baseboard').value = state.existing_original_trim.baseboard_height_in;
    if ($('inp-trim-rail')) $('inp-trim-rail').value = state.existing_original_trim.picture_rail_height_in;
    document.querySelectorAll('.dim-grid .pill-warn').forEach((pillEl) => {
      pillEl.textContent = pillEl.id === 'prov-dining-w' ? t('measure_on_site') : t('verify_on_site');
    });
    if ($('btn-save-tailnet')) { $('btn-save-tailnet').textContent = t('btn_save'); $('btn-save-tailnet').disabled = !tailnetOnline; }
    if ($('btn-export-json')) $('btn-export-json').textContent = t('btn_export_json');
    if ($('save-hint')) $('save-hint').textContent = tailnetOnline ? t('save_hint_on') : t('save_hint_off');
    if ($('voice-title')) $('voice-title').textContent = t('voice_title');
    if ($('voice-lang-pill')) $('voice-lang-pill').textContent = lang === 'es' ? 'es-MX' : 'en-US';
    if ($('lbl-intent')) $('lbl-intent').textContent = t('lbl_intent');
    if ($('sel-pin-intent')) {
      const oEdit = $('sel-pin-intent').querySelector('option[value="propose_edit"]');
      const oProb = $('sel-pin-intent').querySelector('option[value="flag_problem"]');
      const oQ = $('sel-pin-intent').querySelector('option[value="ask_question"]');
      if (oEdit) oEdit.textContent = t('intent_edit');
      if (oProb) oProb.textContent = t('intent_problem');
      if (oQ) oQ.textContent = t('intent_question');
    }
    if ($('lbl-note')) $('lbl-note').textContent = t('lbl_note');
    if ($('inp-voice-note')) $('inp-voice-note').placeholder = t('note_ph');
    if ($('btn-dictate')) $('btn-dictate').textContent = speechRec ? t('btn_dictate_stop') : t('btn_dictate');
    if ($('btn-apply-note')) $('btn-apply-note').textContent = t('btn_attach_pin');
    if ($('voice-status')) $('voice-status').textContent = t('voice_status');
    if ($('sketch-status-pill')) $('sketch-status-pill').textContent = hasSketch ? t('sketch_ready') : t('sketch_none');
    if ($('eod-title')) $('eod-title').textContent = t('eod_title');
    if ($('eod-desc')) $('eod-desc').innerHTML = t('eod_desc');
    if ($('btn-refresh-eod')) $('btn-refresh-eod').textContent = t('btn_refresh_eod');
    if ($('concept-disclaimer-box')) $('concept-disclaimer-box').innerHTML = t('concept_disc');
    if ($('circle-bar-hint')) $('circle-bar-hint').textContent = t('circle_bar_hint');
    if ($('btn-clear-sketch')) $('btn-clear-sketch').textContent = t('btn_clear_sketch');
    if ($('btn-circle-done')) $('btn-circle-done').textContent = t('btn_circle_done');
    resolveCrossLinks();
  }

  function syncInspectorState(devs, takeoff) {
    if (selectedBoxId) {
      const dev = devs.find((d) => d.id === selectedBoxId);
      if (dev) {
        updateInspectorForDevice(dev);
        return;
      }
    }
    if (selectedSlotSpace) {
      const slot = BASE_SLOTS.find((s) => s.space === selectedSlotSpace);
      if (slot) {
        updateInspectorForSlot(slot, takeoff);
        return;
      }
    }
    if (selectedCircuit) {
      const slot = BASE_SLOTS.find((s) => s.id === selectedCircuit);
      if (slot) {
        updateInspectorForSlot(slot, takeoff);
        return;
      }
    }
    if ($('insp-title')) $('insp-title').textContent = t('insp_default_title');
    if ($('insp-body')) $('insp-body').textContent = t('insp_default_body');
  }

  /* ── Master Render Loop ── */
  function render() {
    const svg = $('kitchen-elec-svg');
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    addCommonDefs(svg);

    const devs = getLiveDevices();
    const takeoff = computeTakeoff();
    const reach = evaluateCounterReach();

    if (activeView === 'floor') renderViewFloor(svg, devs, takeoff, reach);
    else if (activeView === 'south') renderViewSouth(svg, devs, takeoff, reach);
    else if (activeView === 'east') renderViewEast(svg, devs, takeoff, reach);
    else if (activeView === 'west') renderViewWest(svg, devs, takeoff, reach);
    else if (activeView === 'north') renderViewNorth(svg, devs, takeoff, reach);
    else renderViewPanel(svg, devs, takeoff, reach);

    renderSvgPins(svg);
    renderSummaryStrip(takeoff, reach);
    renderPanelTable(takeoff);
    renderClashes();
    renderTakeoffCards(takeoff);
    renderPhotoSidePanel();
    renderPinsList();
    renderEodList();
    syncInspectorState(devs, takeoff);
    syncChromeUi(reach);
  }

  /* ── Circle-to-Correct Canvas Overlay ── */
  function resizeSketchCanvas() {
    const cvs = $('kitchen-elec-sketch-canvas');
    const svg = $('kitchen-elec-svg');
    if (!cvs || !svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      cvs.width = 920;
      cvs.height = 1120;
    }
    redrawSketch();
  }

  function redrawSketch() {
    const cvs = $('kitchen-elec-sketch-canvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    sketchStrokes.forEach((st) => {
      if (st.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(st[0][0], st[0][1]);
      for (let i = 1; i < st.length; i++) ctx.lineTo(st[i][0], st[i][1]);
      ctx.stroke();
    });
  }

  function setupSketchCanvas() {
    const cvs = $('kitchen-elec-sketch-canvas');
    if (!cvs) return;
    const toSvgCoords = (ev) => {
      const r = cvs.getBoundingClientRect();
      return [
        Math.round(((ev.clientX - r.left) / Math.max(1, r.width)) * 920),
        Math.round(((ev.clientY - r.top) / Math.max(1, r.height)) * 1120)
      ];
    };
    cvs.addEventListener('pointerdown', (ev) => {
      if (!circleMode) return;
      ev.preventDefault();
      cvs.setPointerCapture(ev.pointerId);
      const pt = toSvgCoords(ev);
      currentStroke = [pt];
      sketchStrokes.push(currentStroke);
      hasSketch = true;
      lastSketchAnchor = { x: pt[0], y: pt[1] };
      redrawSketch();
    });
    cvs.addEventListener('pointermove', (ev) => {
      if (!currentStroke) return;
      const pt = toSvgCoords(ev);
      currentStroke.push(pt);
      redrawSketch();
    });
    const finishStroke = () => {
      if (!currentStroke) return;
      /* Compute stroke centroid for pin anchor */
      let sx = 0, sy = 0;
      currentStroke.forEach((p) => { sx += p[0]; sy += p[1]; });
      lastSketchAnchor = { x: Math.round(sx / currentStroke.length), y: Math.round(sy / currentStroke.length) };
      currentStroke = null;
      syncChromeUi(evaluateCounterReach());
    };
    cvs.addEventListener('pointerup', finishStroke);
    cvs.addEventListener('pointercancel', finishStroke);
  }

  /* ── Tailnet Persistence (:8444 plan_id: kitchen-electrical) + Voice (:8791) ── */
  async function fetchJsonWithTimeout(url, opts, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs || 4000);
    try {
      const res = await fetch(url, Object.assign({ mode: 'cors', credentials: 'omit', signal: ctrl.signal }, opts || {}));
      let data = null;
      try { data = await res.json(); } catch (_) { data = null; }
      return { ok: res.ok, status: res.status, data };
    } finally {
      clearTimeout(timer);
    }
  }

  function resolveCrossLinks() {
    const isWikiPlans = /\/plans\//.test(window.location.pathname || '');
    const qLang = `?lang=${lang}`;
    const backEl = $('link-back-room');
    const fpEl = $('link-floor-plan-top');
    const whEl = $('link-west-hood-top');
    if (backEl) backEl.href = (isWikiPlans ? '../../' : '../../index.html') + qLang + '#kitchen';
    if (fpEl) fpEl.href = (isWikiPlans ? '../kitchen-floor-plan/index.html' : '../floor-plan-pilot/index.html') + qLang;
    if (whEl) whEl.href = (isWikiPlans ? '../kitchen-west-ks4/index.html' : '../interactive-pilot/index.html') + qLang;
  }

  async function probeTailnet() {
    const baseUrl = `${apiOrigin}/api/unit4/plans/${PLAN_ID}`;
    try {
      let verified = false;
      let userFromHealth = null;
      const h = await fetchJsonWithTimeout(`${baseUrl}/health`, { method: 'GET' }, 3000);
      if (h.ok && h.data && h.data.ok) {
        verified = h.data.tailnet_verified !== false;
        userFromHealth = h.data.user || h.data.tailnet_user || null;
      } else if (h.status === 404) {
        verified = true;
      }
      if (!verified) throw new Error('Tailnet check failed');

      let planRes = await fetchJsonWithTimeout(baseUrl, { method: 'GET' }, 4000);
      if (!planRes.ok && planRes.status === 404) {
        planRes = await fetchJsonWithTimeout(`${baseUrl}/state`, { method: 'GET' }, 4000);
      }
      if (!planRes.ok || !planRes.data || planRes.data.ok === false) {
        throw new Error(`HTTP ${planRes.status}`);
      }
      const d = planRes.data;
      tailnetOnline = d.tailnet_verified !== false;
      tailnetUser = userFromHealth || d.tailnet_user || d.user || 'tailnet';
      if (typeof d.base_rev === 'string' && d.base_rev) state.base_rev = d.base_rev;
      const payloadData = d.data || d.plan;
      if (payloadData && typeof payloadData === 'object') {
        applyLocalPatch(payloadData);
      }
      if (Array.isArray(d.pending_eod)) pendingEod = d.pending_eod;
      hasUnsyncedLocalEdits = false;
      if ($('conflict-banner')) $('conflict-banner').hidden = true;
    } catch (_) {
      tailnetOnline = false;
      tailnetUser = null;
    }
    render();
  }

  async function saveToTailnet(summaryNote, extraPatch) {
    if (!tailnetOnline) {
      showToast(t('save_hint_off'), 'error');
      return false;
    }
    const noteStr = summaryNote || `Kitchen electrical field update (${activeView})`;
    if (!checkFirewall(noteStr)) return false;
    const author = ($('inp-author') && $('inp-author').value) || 'Crew';
    const patch = {
      options: {
        floor_condition: state.floor_condition,
        floor_buildup_t_in: state.floor_buildup_t_in,
        counter_outlet_height_in: state.counter_outlet_height_in,
        sink_control_mode: state.sink_control_mode,
        south_task_light_mode: state.south_task_light_mode,
        south_routing_mode: state.south_routing_mode,
        range_gfci_method: state.range_gfci_method,
        east_view_side: state.east_view_side,
        dining_wall_width_in: state.dining_wall_width_in,
        pie_safe_start_in: state.pie_safe_start_in,
        sink_base_start_in: state.sink_base_start_in,
        waste_pct: state.waste_pct
      },
      existing_original_trim: clone(state.existing_original_trim),
      scale_and_datum_rules: {
        floor_buildup_datum: {
          current_site_surface: state.floor_condition,
          provisional_t_in: state.floor_buildup_t_in
        }
      }
    };
    if (extraPatch && typeof extraPatch === 'object') {
      if (extraPatch.pin && typeof extraPatch.pin === 'object') patch.pin = extraPatch.pin;
      if (typeof extraPatch.voice_note === 'string' && extraPatch.voice_note.trim()) patch.voice_note = extraPatch.voice_note.trim();
    }
    if (!checkFirewall(JSON.stringify(patch))) return false;

    const payload = {
      base_rev: state.base_rev,
      author,
      patch,
      note_en: lang === 'en' ? noteStr : '',
      note_es: lang === 'es' ? noteStr : ''
    };
    try {
      const res = await fetchJsonWithTimeout(`${apiOrigin}/api/unit4/plans/${PLAN_ID}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 6000);
      if (res.status === 409) {
        if ($('conflict-banner')) $('conflict-banner').hidden = false;
        showToast(t('conflict_text'), 'error');
        return false;
      }
      if (res.status === 400) {
        showToast((res.data && res.data.error) || t('firewall_err'), 'error');
        return false;
      }
      if (res.status === 403) {
        tailnetOnline = false;
        render();
        showToast(t('save_hint_off'), 'error');
        return false;
      }
      if (!res.ok || !res.data || !res.data.ok) {
        throw new Error((res.data && res.data.error) || `HTTP ${res.status}`);
      }
      const out = res.data;
      if (out.data && typeof out.data === 'object') applyLocalPatch(out.data);
      state.base_rev = out.base_rev || out.new_rev || out.rev_id || state.base_rev;
      if (Array.isArray(out.pending_eod)) pendingEod = out.pending_eod;
      else pendingEod.unshift({ rev_id: out.rev_id || state.base_rev, author, note_en: noteStr });
      hasUnsyncedLocalEdits = false;
      if ($('conflict-banner')) $('conflict-banner').hidden = true;
      showToast(`${t('pending_eod_stamp')} (${state.base_rev})`, 'ok');
      render();
      return true;
    } catch (err) {
      showToast(`Tailnet save error: ${err.message}`, 'error');
      return false;
    }
  }

  async function decideEod(revId, action) {
    if (!tailnetOnline || !revId) return;
    try {
      const actor = ($('inp-author') && $('inp-author').value) || 'Tisa';
      const res = await fetchJsonWithTimeout(`${apiOrigin}/api/unit4/plans/${PLAN_ID}/eod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_rev: state.base_rev, rev_id: revId, action, actor })
      }, 6000);
      if (res.status === 409) {
        if ($('conflict-banner')) $('conflict-banner').hidden = false;
        showToast(t('conflict_text'), 'error');
        return;
      }
      if (!res.ok || !res.data || !res.data.ok) {
        throw new Error((res.data && res.data.error) || `HTTP ${res.status}`);
      }
      const out = res.data;
      if (out.data && typeof out.data === 'object') applyLocalPatch(out.data);
      if (out.base_rev) state.base_rev = out.base_rev;
      if (Array.isArray(out.pending_eod)) pendingEod = out.pending_eod;
      hasUnsyncedLocalEdits = false;
      await probeTailnet();
      showToast(`EOD ${action.toUpperCase()} ok (${revId})`, 'ok');
    } catch (err) {
      showToast(`EOD ${action} error: ${err.message}`, 'error');
    }
  }

  async function sendPinToAgent(pin, mode) {
    if (!checkFirewall(pin.note)) return;
    if (mode === 'modify') {
      await saveToTailnet(`[Pin ${pin.view}] ${pin.note}`, {
        pin: {
          id: pin.id,
          x_norm: Math.min(1, Math.max(0, (Number(pin.x) || 460) / 920)),
          y_norm: Math.min(1, Math.max(0, (Number(pin.y) || 320) / 1120)),
          r_norm: 0.04,
          target: `svg:${pin.view || activeView}`,
          intent: pin.intent || 'propose_edit',
          note: pin.note
        },
        voice_note: pin.note
      });
      return;
    }
    try {
      const q = encodeURIComponent(pin.note);
      const res = await fetchJsonWithTimeout(`${voiceOrigin}/api/unit4/knowledge?q=${q}&room=kitchen`, { method: 'GET' }, 4500);
      if (!res.ok || !res.data) throw new Error(`HTTP ${res.status}`);
      const d = res.data;
      const ans = (d.summary || d.answer || (Array.isArray(d.results) && d.results[0] && d.results[0].snippet)) || 'Matched kitchen electrical spec.';
      showToast(String(ans).replace(new RegExp('\\x24', 'g'), '').slice(0, 140), 'ok');
    } catch (_) {
      showToast(lang === 'es' ? 'Consulta de voz no disponible fuera de línea.' : 'Voice knowledge endpoint unreachable offline.', 'error');
    }
  }

  /* ── Local Exports (SVG, JSON, 1-Click PDF Hook) ── */
  function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 200);
  }

  function exportSvgFile() {
    const svg = $('kitchen-elec-svg');
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    downloadBlob(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }), `unit4-kitchen-electrical-${activeView}-${lang}.svg`);
  }

  function exportJsonFile() {
    const out = Object.assign(clone(state), {
      takeoff_quantities_zero_prices: computeTakeoff(),
      reach_check: evaluateCounterReach()
    });
    downloadBlob(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }), `unit4-kitchen-electrical-state.json`);
  }

  function triggerPdfExport() {
    if (window.U4PlanPdfExport && typeof window.U4PlanPdfExport.exportPdf === 'function') {
      return window.U4PlanPdfExport.exportPdf();
    }
    if (window.U4KS4PdfExport && typeof window.U4KS4PdfExport.exportPdf === 'function') {
      return window.U4KS4PdfExport.exportPdf();
    }
    window.print();
  }

  /* ── Programmatic Patch (Immutable flagged_clashes & strict zero-price guard) ── */
  function applyLocalPatch(patch) {
    if (!patch || typeof patch !== 'object') return;
    const keepClashes = clone(state.flagged_clashes);
    const merged = Object.assign({}, patch, (patch.options && typeof patch.options === 'object') ? patch.options : {});
    if (typeof merged.base_rev === 'string' && merged.base_rev) state.base_rev = merged.base_rev;
    else if (typeof merged.revision === 'string' && merged.revision) state.base_rev = merged.revision;

    if (merged.scale_and_datum_rules && merged.scale_and_datum_rules.floor_buildup_datum) {
      const fd = merged.scale_and_datum_rules.floor_buildup_datum;
      if (fd.current_site_surface === 'bare_subfloor' || fd.current_site_surface === 'finished_installed') {
        state.floor_condition = fd.current_site_surface;
      }
      if (fd.provisional_t_in !== undefined && Number.isFinite(Number(fd.provisional_t_in))) {
        const tn = Number(fd.provisional_t_in);
        if (tn >= 0 && tn <= 4) state.floor_buildup_t_in = tn;
      }
    }

    if (merged.floor_condition === 'bare_subfloor' || merged.floor_condition === 'finished_installed') {
      state.floor_condition = merged.floor_condition;
    }
    if (merged.floor_buildup_t_in !== undefined) {
      const n = Number(merged.floor_buildup_t_in);
      if (Number.isFinite(n) && n >= 0 && n <= 4) state.floor_buildup_t_in = n;
    }
    if (Number(merged.counter_outlet_height_in) === 41 || Number(merged.counter_outlet_height_in) === 44) {
      state.counter_outlet_height_in = Number(merged.counter_outlet_height_in);
    }
    if (merged.sink_control_mode === 'option_a_air_wireless' || merged.sink_control_mode === 'option_b_wired_2gang') {
      state.sink_control_mode = merged.sink_control_mode;
    }
    if (merged.south_task_light_mode === 'three_task_lights' || merged.south_task_light_mode === 'two_pendants') {
      state.south_task_light_mode = merged.south_task_light_mode;
    }
    if (merged.south_routing_mode === 'in_wall_bored' || merged.south_routing_mode === 'via_attic') {
      state.south_routing_mode = merged.south_routing_mode;
    }
    if (merged.range_gfci_method === 'df_breaker_at_d04' || merged.range_gfci_method === 'afci_breaker_plus_accessible_deadfront_gfci') {
      state.range_gfci_method = merged.range_gfci_method;
    }
    if (merged.east_view_side === 'kitchen' || merged.east_view_side === 'dining') {
      state.east_view_side = merged.east_view_side;
    }
    if (merged.pie_safe_start_in !== undefined) {
      const n = Number(merged.pie_safe_start_in);
      if (Number.isFinite(n) && n >= 16 && n <= 42) state.pie_safe_start_in = n;
    }
    if (merged.sink_base_start_in !== undefined) {
      const n = Number(merged.sink_base_start_in);
      if (Number.isFinite(n) && n >= 68 && n <= 82) state.sink_base_start_in = n;
    }
    if (merged.dining_wall_width_in !== undefined) {
      const n = Number(merged.dining_wall_width_in);
      if (Number.isFinite(n) && n >= 60 && n <= 180) state.dining_wall_width_in = n;
    }
    if (merged.waste_pct !== undefined) {
      const n = Number(merged.waste_pct);
      if (Number.isFinite(n) && n >= 0 && n <= 40) state.waste_pct = n;
    }
    if (merged.existing_original_trim && typeof merged.existing_original_trim === 'object') {
      if (Number.isFinite(Number(merged.existing_original_trim.baseboard_height_in))) {
        state.existing_original_trim.baseboard_height_in = Number(merged.existing_original_trim.baseboard_height_in);
      }
      if (Number.isFinite(Number(merged.existing_original_trim.picture_rail_height_in))) {
        state.existing_original_trim.picture_rail_height_in = Number(merged.existing_original_trim.picture_rail_height_in);
      }
    }
    if (Array.isArray(merged.pins)) {
      state.pins = merged.pins
        .filter((p) => p && !violatesPrivateFirewall(String(p.note || '')))
        .map((p) => ({
          id: p.id || ('pin-' + Date.now()),
          view: p.view || (typeof p.target === 'string' && p.target.startsWith('svg:') ? p.target.slice(4) : activeView),
          x: p.x !== undefined ? Number(p.x) : Math.round((Number(p.x_norm) || 0.5) * 920),
          y: p.y !== undefined ? Number(p.y) : Math.round((Number(p.y_norm) || 0.28) * 1120),
          intent: p.intent || 'propose_edit',
          author: p.author || 'Crew',
          note: String(p.note || '')
        }));
    }
    /* Never auto-resolve or remove flagged_clashes */
    state.flagged_clashes = keepClashes;
    render();
  }

  /* ── Global Pointer Drag Handlers for South Pie-Safe & Sink Base ── */
  window.addEventListener('pointermove', (ev) => {
    if (!dragTarget) return;
    const svg = $('kitchen-elec-svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgScale = 920 / Math.max(1, rect.width);
    const deltaIn = ((ev.clientX - dragTarget.startClientX) * svgScale) / dragTarget.scale;
    const snapped = Math.round((dragTarget.startVal + deltaIn) * 2) / 2;
    if (dragTarget.kind === 'piesafe') {
      state.pie_safe_start_in = Math.max(18, Math.min(40, snapped));
      hasUnsyncedLocalEdits = true;
    } else if (dragTarget.kind === 'sink') {
      state.sink_base_start_in = Math.max(70, Math.min(80, snapped));
      hasUnsyncedLocalEdits = true;
    }
    render();
  });
  window.addEventListener('pointerup', () => { dragTarget = null; });
  window.addEventListener('pointercancel', () => { dragTarget = null; });

  /* ── Wire UI Controls ── */
  function bindEvents() {
    $('btn-lang').addEventListener('click', () => { lang = lang === 'en' ? 'es' : 'en'; render(); });
    $('btn-export-svg').addEventListener('click', exportSvgFile);
    $('btn-download-pdf').addEventListener('click', triggerPdfExport);
    $('btn-export-json').addEventListener('click', exportJsonFile);
    $('btn-save-tailnet').addEventListener('click', () => saveToTailnet('Manual save from Kitchen Electrical Plan'));
    $('btn-reload-latest').addEventListener('click', () => { if ($('conflict-banner')) $('conflict-banner').hidden = true; probeTailnet(); });
    $('btn-refresh-eod').addEventListener('click', probeTailnet);

    /* 6 Coupled View Tabs */
    document.querySelectorAll('.view-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeView = btn.dataset.view || 'floor';
        render();
      });
    });

    /* Layer Toggles */
    ['routes', 'reach', 'ceiling', 'trim', 'holds'].forEach((k) => {
      const btn = $(`tgl-${k}`);
      if (btn) btn.addEventListener('click', () => { layers[k] = !layers[k]; render(); });
    });

    /* Global Options */
    const touchEdit = () => { hasUnsyncedLocalEdits = true; render(); };
    $('btn-h-44').addEventListener('click', () => { state.counter_outlet_height_in = 44; touchEdit(); });
    $('btn-h-41').addEventListener('click', () => { state.counter_outlet_height_in = 41; touchEdit(); });
    $('btn-sink-optA').addEventListener('click', () => { state.sink_control_mode = 'option_a_air_wireless'; touchEdit(); });
    $('btn-sink-optB').addEventListener('click', () => { state.sink_control_mode = 'option_b_wired_2gang'; touchEdit(); });
    $('btn-lt-3task').addEventListener('click', () => { state.south_task_light_mode = 'three_task_lights'; touchEdit(); });
    $('btn-lt-2pend').addEventListener('click', () => { state.south_task_light_mode = 'two_pendants'; touchEdit(); });
    $('btn-rt-inwall').addEventListener('click', () => { state.south_routing_mode = 'in_wall_bored'; touchEdit(); });
    $('btn-rt-attic').addEventListener('click', () => { state.south_routing_mode = 'via_attic'; touchEdit(); });
    $('btn-reset-elec').addEventListener('click', () => {
      const keepPins = state.pins;
      const keepRev = state.base_rev;
      const keepClashes = state.flagged_clashes;
      state = clone(DEFAULT_STATE);
      state.pins = keepPins;
      if (keepRev) state.base_rev = keepRev;
      if (Array.isArray(keepClashes) && keepClashes.length) state.flagged_clashes = keepClashes;
      selectedCircuit = null;
      selectedSlotSpace = null;
      selectedBoxId = null;
      hasUnsyncedLocalEdits = false;
      render();
    });

    /* Bare Subfloor Toggle & Allowance */
    $('btn-floor-bare').addEventListener('click', () => { state.floor_condition = 'bare_subfloor'; touchEdit(); });
    $('btn-floor-finished').addEventListener('click', () => { state.floor_condition = 'finished_installed'; touchEdit(); });
    $('inp-subfloor-allow').addEventListener('input', (ev) => {
      const n = Number(ev.target.value);
      if (Number.isFinite(n) && n >= 0 && n <= 4) { state.floor_buildup_t_in = n; touchEdit(); }
    });

    /* South Wall Sliders & East Wall Dining Flip */
    $('rng-piesafe').addEventListener('input', (ev) => { state.pie_safe_start_in = Number(ev.target.value); touchEdit(); });
    $('rng-sink').addEventListener('input', (ev) => { state.sink_base_start_in = Number(ev.target.value); touchEdit(); });
    $('btn-flip-dining').addEventListener('click', () => {
      state.east_view_side = state.east_view_side === 'dining' ? 'kitchen' : 'dining';
      render();
    });

    /* Panel Schedule Filters */
    document.querySelectorAll('[data-slot-filter]').forEach((btn) => {
      btn.addEventListener('click', () => { slotFilter = btn.dataset.slotFilter || 'ALL'; render(); });
    });
    $('btn-clear-circuit').addEventListener('click', () => { selectedCircuit = null; selectedSlotSpace = null; selectedBoxId = null; render(); });

    /* Takeoff Controls */
    $('btn-waste-15').addEventListener('click', () => { state.waste_pct = 15; touchEdit(); });
    $('btn-waste-20').addEventListener('click', () => { state.waste_pct = 20; touchEdit(); });
    $('inp-waste-pct').addEventListener('input', (ev) => {
      const n = Number(ev.target.value);
      if (Number.isFinite(n) && n >= 0 && n <= 40) { state.waste_pct = n; touchEdit(); }
    });
    $('sel-rg-gfci').addEventListener('change', (ev) => { state.range_gfci_method = ev.target.value; touchEdit(); });

    /* Trim & Dining Width Controls */
    $('inp-dining-w').addEventListener('input', (ev) => {
      const n = Number(ev.target.value);
      if (Number.isFinite(n) && n >= 60 && n <= 180) { state.dining_wall_width_in = n; touchEdit(); }
    });
    $('inp-trim-baseboard').addEventListener('input', (ev) => {
      const n = Number(ev.target.value);
      if (Number.isFinite(n) && n >= 3 && n <= 16) { state.existing_original_trim.baseboard_height_in = n; touchEdit(); }
    });
    $('inp-trim-rail').addEventListener('input', (ev) => {
      const n = Number(ev.target.value);
      if (Number.isFinite(n) && n >= 72 && n <= 120) { state.existing_original_trim.picture_rail_height_in = n; touchEdit(); }
    });

    /* Circle-to-Correct Controls */
    const setCircleMode = (on) => {
      circleMode = !!on;
      const cvs = $('kitchen-elec-sketch-canvas');
      if (cvs) cvs.classList.toggle('drawing-on', circleMode);
      if ($('circle-bar')) $('circle-bar').hidden = !circleMode;
      if ($('btn-circle-toggle')) $('btn-circle-toggle').classList.toggle('btn-active', circleMode);
      syncChromeUi(evaluateCounterReach());
    };
    $('btn-circle-toggle').addEventListener('click', () => setCircleMode(!circleMode));
    $('btn-circle-done').addEventListener('click', () => setCircleMode(false));
    $('btn-clear-sketch').addEventListener('click', () => {
      sketchStrokes = [];
      hasSketch = false;
      lastSketchAnchor = null;
      redrawSketch();
      syncChromeUi(evaluateCounterReach());
    });

    /* Voice Dictation & Attach Comment Pin */
    $('btn-dictate').addEventListener('click', () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        showToast(lang === 'es' ? 'Dictado no disponible en este navegador.' : 'Voice dictation not supported in this browser.', 'error');
        return;
      }
      if (speechRec) {
        speechRec.stop();
        speechRec = null;
        $('btn-dictate').textContent = t('btn_dictate');
        return;
      }
      speechRec = new SR();
      speechRec.lang = lang === 'es' ? 'es-MX' : 'en-US';
      speechRec.interimResults = false;
      speechRec.onresult = (ev) => {
        const transcript = ev.results[0][0].transcript || '';
        if (checkFirewall(transcript) && $('inp-voice-note')) {
          $('inp-voice-note').value = ($('inp-voice-note').value ? $('inp-voice-note').value + ' ' : '') + transcript;
        }
      };
      speechRec.onend = () => { speechRec = null; $('btn-dictate').textContent = t('btn_dictate'); };
      $('btn-dictate').textContent = t('btn_dictate_stop');
      speechRec.start();
    });

    $('btn-apply-note').addEventListener('click', () => {
      const note = ($('inp-voice-note') && $('inp-voice-note').value || '').trim();
      if (!note) return;
      if (!checkFirewall(note)) return;
      const anchor = lastSketchAnchor || { x: 460, y: 320 };
      const pin = {
        id: 'pin-' + Date.now(),
        view: activeView,
        x: anchor.x,
        y: anchor.y,
        intent: ($('sel-pin-intent') && $('sel-pin-intent').value) || 'propose_edit',
        author: ($('inp-author') && $('inp-author').value) || 'Crew',
        note
      };
      state.pins.push(pin);
      hasUnsyncedLocalEdits = true;
      if ($('inp-voice-note')) $('inp-voice-note').value = '';
      render();
      showToast(lang === 'es' ? 'Pin de comentario adjuntado.' : 'Comment pin attached to drawing.', 'ok');
    });

    window.addEventListener('resize', resizeSketchCanvas);
  }

  /* ── Unified Integration Contract (window.U4PLAN) ── */
  window.U4PLAN = {
    planId: PLAN_ID,
    getSvgElement: () => $('kitchen-elec-svg'),
    getState: () => clone(state),
    getTakeoff: () => computeTakeoff(),
    getReachCheck: () => evaluateCounterReach(),
    getScaleInfo: () => clone(lastScaleInfo),
    getView: () => activeView,
    setView: (v) => {
      if (['floor', 'south', 'east', 'west', 'north', 'panel'].includes(v)) {
        activeView = v;
        render();
      }
    },
    getLang: () => lang,
    setLang: (l) => {
      if (l === 'en' || l === 'es' || l === 'ru') {
        lang = l;
        render();
      }
    },
    selectCircuit: (ckt) => {
      selectedCircuit = ckt || null;
      selectedSlotSpace = null;
      render();
    },
    setFloorCondition: (cond, buildupIn) => {
      if (cond === 'bare_subfloor' || cond === 'finished_installed') state.floor_condition = cond;
      if (buildupIn !== undefined && Number.isFinite(Number(buildupIn))) state.floor_buildup_t_in = Number(buildupIn);
      render();
    },
    getRevisionStamp: () => state.base_rev,
    getAnnotationDataUrl: () => {
      const cvs = $('kitchen-elec-sketch-canvas');
      return cvs && hasSketch ? cvs.toDataURL('image/png') : null;
    },
    applyLocalPatch,
    render
  };

  /* ── Bootstrap ── */
  document.addEventListener('DOMContentLoaded', () => {
    if (params.get('print') === '1') document.body.classList.add('print-mode');
    resolveCrossLinks();
    bindEvents();
    setupSketchCanvas();
    render();
    resizeSketchCanvas();
    // Official PDFs use the reviewed checked-in seed, never a later live edit.
    if (params.get('snapshot') !== '1') probeTailnet();
  });
})();
