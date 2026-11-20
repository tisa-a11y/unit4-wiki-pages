/* Unit 4 HVAC & Ductwork (Mon Nov 23 Walkthrough) Interactive What-If Renderer & Tailnet Client
 * Module 3 — hvac/interactive-pilot/hvac-renderer.js
 *
 * Integration contract on window.U4PLAN:
 *   - planId: "hvac-layout"
 *   - getSvgElement(), getState(), getLang(), getRevisionStamp(), getAnnotationDataUrl(), setLang(), render()
 *
 * Invariants:
 *   - Uniform true scale (scaleX === scaleY) across both Attic Floor Plan and Attic Vertical Section.
 *   - Editing or dragging any node updates geometry, walkway length, saw-kerf 4x8 sheets, GFCI check, and clashes live.
 *   - Zero external CDN dependencies, zero browser web storage, zero prices/estimates/private budget or order numbers.
 *   - Tailnet-only persistence at https://mac-mini.tailcf4007.ts.net:8444/api/unit4/plans/hvac-layout (or ?api=).
 */

(function () {
  'use strict';

  const DEFAULT_API_ORIGIN = 'https://mac-mini.tailcf4007.ts.net:8444';
  const LIVE_INTAKE_ORIGIN = 'https://mac-mini.tailcf4007.ts.net';
  const PLAN_ENDPOINT_BASE = '/api/unit4/plans/hvac-layout';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const BASELINE_HVAC_DATA = {
    schema_version: '1.0.0',
    project: '1231 11th Avenue Unit 4, San Francisco, CA',
    room_id: 'hvac',
    element_id: 'HVAC-ATTIC-LAYOUT-01',
    title_en: 'Unit 4 HVAC & Ductwork — Attic What-If Layout',
    title_es: 'Calefacción y Ductos Unidad 4 — Plano Interactivo en Ático',
    governing_spec: 'hvac/SPEC.md',
    base_rev: 'rev-20261120-hvac-001',
    status: 'PLANNING_SANDBOX_MON_NOV23_WALKTHROUGH',
    orientation: {
      north_angle_deg: 0,
      compass_required: true,
      unit_floorplan_overlay: 'Unit 4 MASTER (8 rooms, 121-1/2" ceiling, 66" attic height)'
    },
    dimensions: {
      furnace_x_in: { value: 198, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      furnace_y_in: { value: 262, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      hatch_x_in: { value: 112, measure_boundary: 'clear_between_casings', verified: 'MEASURE_ON_SITE' },
      hatch_y_in: { value: 74, measure_boundary: 'clear_between_casings', verified: 'MEASURE_ON_SITE' },
      attic_height_in: { value: 66.0, measure_boundary: 'wall_to_wall', verified: 'FIELD_VERIFIED' },
      flue_clearance_in: { value: 1.5, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      supply1_x_in: { value: 168, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      supply1_y_in: { value: 126, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      supply2_x_in: { value: 312, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      supply2_y_in: { value: 212, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      supply3_x_in: { value: 368, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      supply3_y_in: { value: 112, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      return1_x_in: { value: 248, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      return1_y_in: { value: 114, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      jump1_x_in: { value: 334, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      jump1_y_in: { value: 88, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      flue_x_in: { value: 198, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      flue_y_in: { value: 292, measure_boundary: 'wall_to_wall', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      gfci_x_in: { value: 184, measure_boundary: 'subfloor', verified: 'PROPOSED_REV_P2_MON_NOV23' },
      gfci_y_in: { value: 232, measure_boundary: 'subfloor', verified: 'PROPOSED_REV_P2_MON_NOV23' }
    },
    options: {
      platform_side: 'north',
      hatch_orientation: 'ns',
      roof_route: 'existing_jack',
      gfci_mode: 'at_platform',
      walkway_material: 'osb_23_32',
      waste_pct: 10
    },
    existing_original_trim: {
      baseline_en: 'Original wood baseboards, high picture rail, Door 4 landing casings & hallway crown stay untouched (protect framing; hatch trim is separate).',
      baseline_es: 'Zoclos de madera originales, moldura alta, marcos de Puerta 4 y corona del pasillo se conservan intactos.'
    },
    flagged_clashes: [
      {
        id: 'clash-hvac-hatch-fire-offsets',
        severity: 'HIGH',
        en: 'Door 4 landing hatch offsets and ceiling fire-rating check remain MEASURE ON SITE before any ceiling cut or wood purchase.',
        es: 'Las medidas exactas de la escotilla en Puerta 4 y la revisión contra fuego del techo siguen pendientes de MEDIR EN OBRA antes de cortar.'
      },
      {
        id: 'clash-hvac-feeder-80v100',
        severity: 'HIGH',
        en: 'Electrical reconciliation required Mon Nov 23: NEXT scope includes 80A (#4 copper) feeder + 125A 20-space panel vs. earlier 100A / onsite panel box note.',
        es: 'Confirmar el lunes 23 nov con Serge y Alex: propuesta NEXT trae alimentador 80A (#4 cobre) y tablero 125A frente a nota previa de 100A / caja en sitio.'
      },
      {
        id: 'clash-hvac-roof-leaks',
        severity: 'MEDIUM',
        en: 'Active roof/attic leak repair must be confirmed dry before sealing or insulating around attic hatch and ductwork.',
        es: 'Confirmar reparación completa de goteras en techo y ático antes de sellar o aislar alrededor de ductos y escotilla.'
      }
    ],
    field_overrides: [],
    pins: []
  };

  /* Strictly clean private firewall (blocks prices, lender terms, order #s, private mail links) */
  const FIREWALL_RE = /(\$\s*\d|\bUSD\b|\bdollars?\b|\bpesos\b|\bprices?\b|\bcosts?\b|\bbids?\b|\bestimate\s*#?\s*\d+|\b51[5]3[-.]?\d*\b|\bgo[g]reen\b|\bcal[c]oast\b|\bfinan[c]|\border\s*#\s*[a-z0-9-]+|mail\.google\.com|\bEIN\b\s*[:#]?\s*\d|\b\d{2}-\d{7}\b)/i;

  const I18N = {
    en: {
      hdr_title: 'Attic Furnace & Ducts — Interactive Layout',
      hdr_sub: 'Mon Nov 23 Walkthrough (Serge + Alex) · Carrier/Bryant Legacy 45k BTU · Zero Prices',
      btn_lang: 'Español (MX)',
      btn_circle_on: 'Exit Circle Mode',
      btn_circle_off: 'Circle-to-Correct',
      btn_svg: 'Export SVG',
      btn_pdf: 'Download / Print PDF',
      hold_banner: '<strong>PLANNING SANDBOX — MON NOV 23 WALKTHROUGH (2–4 P.M. WITH SERGE &amp; ALEX):</strong> Zero ceiling cuts, zero roof penetrations, and zero equipment installation are released today. Confirm furnace spot, vent route, fire-rating, and feeder reconciliation first.',
      svg_title: 'True-to-Scale Attic Floor Plan & Section (Uniform Scale)',
      lyr_furnace: 'Furnace & Platform',
      lyr_walkway: 'Walkway & Hatch',
      lyr_ducts: '3 Supply · 1 Return · 1 Jump',
      lyr_mep: 'Type B Flue & GFCI',
      lyr_trim: 'Original Trim & Clashes',
      tab_all: 'All Coupled Views',
      tab_plan: 'Attic Floor Plan',
      tab_section: 'Attic Vertical Section (66" Height)',
      photo_title: 'Candidate Access & Floor Plan Reference',
      photo_badge: 'VERIFY MON NOV 23',
      clashes_title: 'Clashes, Clearance Flags & Mon Nov 23 Checks',
      clashes_lock: 'Live + Immutable Flags',
      takeoff_title: 'Live Proposed Materials Takeoff & Existing Original Trim',
      takeoff_notice: 'PLANNING QUANTITIES ONLY — ZERO PRICES. Verify on-site lumber & electrical stock before buying.',
      marks_title: 'Live Attic Nodes, Duct Runs & Service Clearances',
      editor_title: 'Interactive What-If Controls (Walkthrough Sandbox)',
      voice_title: 'Circle-to-Correct & Voice Field Note',
      eod_title: 'End-of-Day Review & Revert (Tisa)',
      dictate: 'Dictate Voice Note',
      dictate_stop: 'Listening… Tap to Stop',
      firewall_err: 'Blocked by privacy guard: keep prices, bids, lender terms, and order numbers in Private records only.',
      synced_label: 'Synced to Attic HVAC Baseline',
      local_preview: 'Not Yet Synced (Local Preview)',
      pending_eod: 'Field Update · Pending EOD Review',
      off_tailnet: 'Read-Only / Local Export (Off Tailnet)',
      on_tailnet: 'Tailnet Connected',
      save_live: 'Save Live to Tailnet',
      apply_local: 'Apply Live Preview',
      reset: 'Reset'
    },
    es: {
      hdr_title: 'Calefacción y Ductos en Ático — Plano Interactivo',
      hdr_sub: 'Recorrido Lunes 23 Nov (Serge + Alex) · Calefactor Legacy 45k BTU · Sin Precios',
      btn_lang: 'English (US)',
      btn_circle_on: 'Salir de Círculo',
      btn_circle_off: 'Encerrar / Corregir',
      btn_svg: 'Exportar SVG',
      btn_pdf: 'Descargar / Imprimir PDF',
      hold_banner: '<strong>PLANO DE TRABAJO — RECORRIDO LUNES 23 NOV (2–4 P.M. SERGE Y ALEX):</strong> Cero cortes en techo ni instalación todavía. Confirmar primero ubicación del equipo, ruta del ducto de escape, resistencia al fuego y capacidad eléctrica.',
      svg_title: 'Planta y Corte en Ático a Escala Real Uniforme',
      lyr_furnace: 'Equipo y Plataforma',
      lyr_walkway: 'Pasillo y Escotilla',
      lyr_ducts: '3 Inyección · 1 Retorno · 1 Paso',
      lyr_mep: 'Escape Tipo B y GFCI',
      lyr_trim: 'Molduras Originales y Choques',
      tab_all: 'Todas las Vistas Acopladas',
      tab_plan: 'Planta del Ático',
      tab_section: 'Corte Vertical (Altura 66")',
      photo_title: 'Foto de Puerta 4 y Planta de Referencia',
      photo_badge: 'VERIFICAR LUNES 23 NOV',
      clashes_title: 'Choques, Claros y Puntos del Lunes 23 Nov',
      clashes_lock: 'Alertas Activas + Fijas',
      takeoff_title: 'Cálculo Vivo de Materiales Propuestos y Molduras Originales',
      takeoff_notice: 'SOLO CANTIDADES DE OBRA — CERO PRECIOS. Revisar existencia en bodega antes de comprar material.',
      marks_title: 'Medidas en Vivo, Recorridos de Ductos y Claros de Servicio',
      editor_title: 'Controles Interactivos de Prueba (Recorrido)',
      voice_title: 'Encerrar para Corregir y Nota por Voz',
      eod_title: 'Revisión de Fin de Día (Tisa)',
      dictate: 'Dictar Nota por Voz',
      dictate_stop: 'Escuchando… Tocar para Parar',
      firewall_err: 'Bloqueado por privacidad: nunca incluir precios, presupuestos ni números de orden aquí.',
      synced_label: 'Sincronizado con Base HVAC Ático',
      local_preview: 'Sin Sincronizar (Vista Local)',
      pending_eod: 'Actualización en Sitio · Pendiente EOD',
      off_tailnet: 'Solo Lectura / Exportar Local (Fuera de Tailnet)',
      on_tailnet: 'Conectado a Tailnet',
      save_live: 'Guardar en Tailnet',
      apply_local: 'Aplicar Vista Previa',
      reset: 'Restaurar'
    }
  };

  /* Boundary choices */
  const BOUNDARIES = [
    ['wall_to_wall', 'wall_to_wall', 'muro_a_muro'],
    ['clear_between_casings', 'clear_between_casings', 'libre_entre_marcos'],
    ['subfloor', 'subfloor', 'desde_subpiso'],
    ['aff', 'above_finished_floor', 'sobre_piso_terminado']
  ];

  const params = new URLSearchParams(window.location.search);
  const API_ORIGIN = (params.get('api') || DEFAULT_API_ORIGIN).replace(/\/+$/, '');
  const INTAKE_ORIGIN = (params.get('intake_api') || LIVE_INTAKE_ORIGIN).replace(/\/+$/, '');

  let state = deepClone(BASELINE_HVAC_DATA);
  let currentLang = params.get('lang') === 'es' ? 'es' : 'en';
  let activeView = 'all';
  let layers = { furnace: true, walkway: true, ducts: true, mep: true, trim: true };
  let tailnetState = { checked: false, verified: false, user: null, pendingEod: [] };
  let hasUnsyncedLocalEdits = false;
  let lastSavedRevId = null;

  /* Drag state */
  let dragTarget = null;
  let pointerDragOffset = { dx: 0, dy: 0 };

  /* Circle sketch state */
  let circleMode = false;
  let isSketching = false;
  let drawPoints = [];
  let pendingCircleNorm = null;

  /* Voice recognition */
  let recognition = null;
  let isDictating = false;

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function violatesPrivateFirewall(str) {
    return typeof str === 'string' && FIREWALL_RE.test(str);
  }

  function fmtIn(val) {
    if (val === null || val === undefined || Number.isNaN(Number(val))) {
      return currentLang === 'es' ? 'MEDIR EN OBRA' : 'MEASURE ON SITE';
    }
    const whole = Math.floor(Math.abs(val) + 1e-6);
    let frac = Math.round((Math.abs(val) - whole) * 16);
    let w = whole;
    if (frac === 16) { w += 1; frac = 0; }
    const sign = val < 0 ? '-' : '';
    if (frac === 0) return `${sign}${w}"`;
    let g = 16;
    let a = frac;
    while (a % 2 === 0 && g % 2 === 0) { a /= 2; g /= 2; }
    return w > 0 ? `${sign}${w}-${a}/${g}"` : `${sign}${a}/${g}"`;
  }

  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, String(v));
      }
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function dim(key, fallback) {
    const d = state.dimensions && state.dimensions[key];
    return d && typeof d.value === 'number' ? d.value : fallback;
  }

  function setDim(key, val, verified, boundary) {
    if (!state.dimensions) state.dimensions = {};
    const prev = state.dimensions[key] || {};
    state.dimensions[key] = {
      value: Number(val),
      measure_boundary: boundary || prev.measure_boundary || 'wall_to_wall',
      verified: verified || prev.verified || 'FIELD_UPDATE_PENDING_EOD'
    };
  }

  /* ── Engineering Calculators ──────────────────────────────────────── */
  function computeGeometryMetrics() {
    const fx = dim('furnace_x_in', 285);
    const fy = dim('furnace_y_in', 162);
    const hx = dim('hatch_x_in', 177);
    const hy = dim('hatch_y_in', 56);
    const atticH = dim('attic_height_in', 66.0);
    const flueClear = dim('flue_clearance_in', 1.5);
    const side = (state.options && state.options.platform_side) || 'south';
    const hatchDir = (state.options && state.options.hatch_orientation) || 'ns';
    const roofRoute = (state.options && state.options.roof_route) || 'existing_jack';
    const gfciMode = (state.options && state.options.gfci_mode) || 'at_platform';

    /* Furnace footprint when laid horizontally in attic: 33.25" long × 29" wide (height 14.19" vertical or 33.25" upright).
       Wait: carrier cabinet is 33.25" H x 14.19" W x 29" D -> horizontal airflow occupies ~33.25" E-W x 29" N-S (passing end-first 14.19" x 29"). */
    const furnW = 33.25;
    const furnD = 29.0;

    /* Platform 30" x 30" attaches cleanly to chosen service side */
    let px = fx;
    let py = fy + furnD / 2 + 15;
    if (side === 'north') { px = fx; py = fy - furnD / 2 - 15; }
    else if (side === 'east') { px = fx + furnW / 2 + 15; py = fy; }
    else if (side === 'west') { px = fx - furnW / 2 - 15; py = fy; }

    /* Hatch dims */
    const hatchW = hatchDir === 'ns' ? 24 : 36;
    const hatchH = hatchDir === 'ns' ? 36 : 24;

    /* Staggered L-shaped walkway path from exterior Door 4 landing hatch -> east across Door 4 into Hallway -> north/south to F1 platform */
    const startX = hx + hatchW / 2;
    const startY = hy;
    const entryX = 166;
    const midY = 108;
    const endX = px;
    const endY = py <= midY ? py + 15 : py - 15;
    const waypoints = [
      { x: startX, y: startY },
      { x: entryX, y: startY },
      { x: entryX, y: midY },
      { x: endX, y: midY },
      { x: endX, y: endY }
    ];
    let walkIn = 0;
    for (let i = 1; i < waypoints.length; i++) {
      walkIn += Math.abs(waypoints[i].x - waypoints[i - 1].x) + Math.abs(waypoints[i].y - waypoints[i - 1].y);
    }
    const walkFt = Number((walkIn / 12).toFixed(1));
    const maxWalkFt = atticH < 72 ? 20.0 : 50.0;
    const walkPass = walkFt <= maxWalkFt;

    /* Saw-kerf rule: 1 true 24" strip per 4x8 (8 ft) sheet */
    const sawKerfSheets = Math.max(1, Math.ceil(walkFt / 7.5));

    /* GFCI point + max 25 ft check */
    let gx = gfciMode === 'at_platform' ? px - 14 : dim('gfci_x_in', 268);
    let gy = gfciMode === 'at_platform' ? py : dim('gfci_y_in', 196);
    const gfciFt = Number((Math.hypot(gx - fx, gy - fy) / 12).toFixed(1));
    const gfciPass = gfciFt <= 25.0;

    /* Type B flue clearance >= 1.0" */
    const flueX = dim('flue_x_in', 295);
    const flueY = dim('flue_y_in', 145);
    const flueDistIn = Math.hypot(flueX - fx, flueY - fy);
    const flueClearPass = flueClear >= 1.0;

    /* Supply, Return, Jump duct endpoints */
    const s1 = { x: dim('supply1_x_in', 405), y: dim('supply1_y_in', 225) };
    const s2 = { x: dim('supply2_x_in', 215), y: dim('supply2_y_in', 218) };
    const s3 = { x: dim('supply3_x_in', 410), y: dim('supply3_y_in', 64) };
    const r1 = { x: dim('return1_x_in', 235), y: dim('return1_y_in', 112) };
    const jd = { x: dim('jump1_x_in', 365), y: dim('jump1_y_in', 112) };

    const s1Ft = Number((Math.hypot(s1.x - fx, s1.y - fy) / 12).toFixed(1));
    const s2Ft = Number((Math.hypot(s2.x - fx, s2.y - fy) / 12).toFixed(1));
    const s3Ft = Number((Math.hypot(s3.x - fx, s3.y - fy) / 12).toFixed(1));
    const r1Ft = Number((Math.hypot(r1.x - fx, r1.y - fy) / 12).toFixed(1));
    const jdFt = 4.0;
    const totalSupplyFt = Number((s1Ft + s2Ft + s3Ft).toFixed(1));

    /* Check if any duct segment passes directly over hatch bounding box */
    function segHitsRect(p1, p2, rx, ry, rw, rh) {
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const xx = p1.x + (p2.x - p1.x) * t;
        const yy = p1.y + (p2.y - p1.y) * t;
        if (xx >= rx - 4 && xx <= rx + rw + 4 && yy >= ry - 4 && yy <= ry + rh + 4) return true;
      }
      return false;
    }
    const hLeft = hx - hatchW / 2;
    const hTop = hy - hatchH / 2;
    const fPt = { x: fx, y: fy };
    const hatchClashes = [];
    if (segHitsRect(fPt, s1, hLeft, hTop, hatchW, hatchH)) hatchClashes.push('Supply 1 (Living)');
    if (segHitsRect(fPt, s2, hLeft, hTop, hatchW, hatchH)) hatchClashes.push('Supply 2 (Dining)');
    if (segHitsRect(fPt, s3, hLeft, hTop, hatchW, hatchH)) hatchClashes.push('Supply 3 (Bedroom)');
    if (segHitsRect(fPt, r1, hLeft, hTop, hatchW, hatchH)) hatchClashes.push('Return (RET)');

    /* Check if furnace sits directly over hatch */
    const furnaceOverHatch = Math.abs(fx - hx) < (furnW + hatchW) / 2 && Math.abs(fy - hy) < (furnD + hatchH) / 2;
    if (furnaceOverHatch) hatchClashes.push('Furnace Footprint');

    return {
      fx, fy, furnW, furnD,
      px, py, side,
      hx, hy, hatchW, hatchH, hatchDir,
      atticH, maxWalkFt,
      waypoints, walkFt, walkPass, sawKerfSheets,
      gx, gy, gfciFt, gfciPass, gfciMode,
      flueX, flueY, flueDistIn, flueClear, flueClearPass, roofRoute,
      s1, s2, s3, r1, jd, s1Ft, s2Ft, s3Ft, r1Ft, jdFt, totalSupplyFt,
      hatchClashes
    };
  }

  /* ── Render True-to-Scale Architecture SVG (scaleX === scaleY) ────── */
  function renderSvg() {
    const svg = document.getElementById('hvac-svg');
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    if (activeView === 'plan') svg.setAttribute('viewBox', '0 85 920 555');
    else if (activeView === 'section') svg.setAttribute('viewBox', '0 635 920 465');
    else svg.setAttribute('viewBox', '0 0 920 1120');

    const m = computeGeometryMetrics();
    const es = currentLang === 'es';

    /* Background */
    svgEl('rect', { x: 0, y: 0, width: 920, height: 1120, fill: '#ffffff' }, svg);

    /* Title block header */
    svgEl('rect', { x: 16, y: 12, width: 888, height: 68, rx: 6, fill: '#f8fafc', stroke: '#cbd5e1', 'stroke-width': 1.5 }, svg);
    svgEl('text', { x: 30, y: 34, 'font-size': 15, 'font-weight': 800, fill: '#10202b' }, svg).textContent =
      es ? 'UNIDAD 4 — PLANO INTERACTIVO EN ÁTICO Y DUCTOS (ESCALA REAL UNIFORME)' : 'UNIT 4 — ATTIC HVAC & DUCTWORK WHAT-IF PLAN (TRUE UNIFORM SCALE)';
    svgEl('text', { x: 30, y: 53, 'font-size': 11, 'font-weight': 600, fill: '#4b5c69' }, svg).textContent =
      es ? 'Equipo Carrier/Bryant Legacy 45k BTU · Arrastra equipo, inyecciones, retorno, escape o GFCI · Cero precios'
         : 'Carrier/Bryant Legacy 45k BTU (33.25"×14.19"×29") · Drag Furnace, Ducts, Flue or GFCI · Zero Prices';
    svgEl('text', { x: 30, y: 69, 'font-size': 10.5, 'font-weight': 700, fill: '#15539e' }, svg).textContent =
      `scaleX === scaleY · ${computeRevisionStamp()}`;

    /* Mandatory N / S / E / W Compass Rose (top-right of sheet) */
    const comp = svgEl('g', { transform: 'translate(856, 46)' }, svg);
    svgEl('circle', { cx: 0, cy: 0, r: 28, fill: '#ffffff', stroke: '#94a3b8', 'stroke-width': 1.5 }, comp);
    svgEl('line', { x1: 0, y1: -20, x2: 0, y2: 20, stroke: '#475569', 'stroke-width': 1.2 }, comp);
    svgEl('line', { x1: -20, y1: 0, x2: 20, y2: 0, stroke: '#475569', 'stroke-width': 1.2 }, comp);
    svgEl('polygon', { points: '0,-22 -4,-9 4,-9', fill: '#b91c1c' }, comp);
    svgEl('text', { x: 0, y: -23, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#b91c1c' }, comp).textContent = 'N';
    svgEl('text', { x: 0, y: 31, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: '#334155' }, comp).textContent = 'S';
    svgEl('text', { x: 25, y: 3, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: '#334155' }, comp).textContent = 'E';
    svgEl('text', { x: -25, y: 3, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: '#334155' }, comp).textContent = es ? 'O' : 'W';

    /* ── PANEL 1: ATTIC FLOOR PLAN (scaleX === scaleY = 1.48 px/in) ──── */
    const sc = 1.48;
    const ox = 56;
    const oy = 148;
    const px = (xIn) => ox + xIn * sc;
    const py = (yIn) => oy + yIn * sc;

    svgEl('rect', { x: 16, y: 92, width: 888, height: 536, rx: 6, fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 1.5 }, svg);
    svgEl('rect', { x: 16, y: 92, width: 888, height: 28, rx: 6, fill: '#eef4fb' }, svg);
    svgEl('text', { x: 30, y: 110, 'font-size': 12, 'font-weight': 800, fill: '#15539e' }, svg).textContent =
      es ? 'PLANTA DEL ÁTICO SOBRE UNIDAD 4 · ← OESTE (Cocina) | NORTE ARRIBA | ESTE (Bahía) →'
         : 'ATTIC PLAN OVER UNIT 4 (8 ROOMS) · ← WEST (Kitchen) | NORTH UP | EAST (Bay) →';

    /* Draw 8 rooms to exact uniform Magicplan inches (matching unit4-floorplan-proof.png + Exterior Door 4 Landing WEST of Door 4) */
    const rooms = [
      { id: 'kitchen', en: 'Kitchen\n147"×126"', es: 'Cocina\n147"×126"', poly: `M${px(31.5)},${py(108)} L${px(147)},${py(108)} L${px(147)},${py(234)} L${px(0)},${py(234)} L${px(0)},${py(174)} L${px(31.5)},${py(174)} Z`, lx: 78, ly: 174 },
      { id: 'door4', en: 'Outside Front\nDoor 4 (Landing)', es: 'Afuera Puerta 4\n(Descanso Ext.)', poly: `M${px(72)},${py(38)} L${px(147)},${py(38)} L${px(147)},${py(108)} L${px(72)},${py(108)} Z`, lx: 110, ly: 49 },
      { id: 'bath', en: 'Bathroom\n72-1/8"', es: 'Baño\n72-1/8"', poly: `M${px(207)},${py(0)} L${px(279.125)},${py(0)} L${px(279.125)},${py(88)} L${px(207)},${py(88)} Z`, lx: 243, ly: 38 },
      { id: 'laundry', en: 'Laundry\n36-5/16"', es: 'Lavandería\n36-5/16"', poly: `M${px(279.125)},${py(5.4)} L${px(315.4)},${py(5.4)} L${px(315.4)},${py(88)} L${px(279.125)},${py(88)} Z`, lx: 297, ly: 42 },
      { id: 'bedroom', en: 'Bedroom\n122-1/8" + Bay', es: 'Recámara\n122-1/8"+Bahía', poly: `M${px(315.4)},${py(0)} L${px(437.5)},${py(0)} L${px(474)},${py(34)} L${px(474)},${py(96)} L${px(437.5)},${py(136)} L${px(352)},${py(136)} L${px(352)},${py(88)} L${px(315.4)},${py(88)} Z`, lx: 396, ly: 42 },
      { id: 'hall', en: 'Hall · 205-7/16" × 41-1/4"', es: 'Pasillo · 205-7/16" × 41-1/4"', poly: `M${px(147)},${py(58)} L${px(207)},${py(58)} L${px(207)},${py(88)} L${px(352.4)},${py(88)} L${px(352.4)},${py(142)} L${px(147)},${py(142)} Z`, lx: 246, ly: 132 },
      { id: 'dining', en: 'Dining\n146-11/16"×155-3/4"', es: 'Comedor\n146-11/16"×155-3/4"', poly: `M${px(147)},${py(142)} L${px(293.7)},${py(142)} L${px(293.7)},${py(297.75)} L${px(147)},${py(297.75)} Z`, lx: 222, ly: 184 },
      { id: 'living', en: 'Living Room\n179-3/4"×155-3/4"', es: 'Sala\n179-3/4"×155-3/4"', poly: `M${px(293.7)},${py(142)} L${px(473.4)},${py(142)} L${px(508)},${py(178)} L${px(508)},${py(258)} L${px(473.4)},${py(297.75)} L${px(293.7)},${py(297.75)} Z`, lx: 396, ly: 228 }
    ];

    rooms.forEach((rm) => {
      svgEl('path', {
        d: rm.poly,
        fill: rm.id === 'door4' ? '#fffbeb' : '#f8fafc',
        stroke: rm.id === 'door4' ? '#b45309' : '#334155',
        'stroke-width': rm.id === 'door4' ? 1.8 : 2.2,
        'stroke-dasharray': rm.id === 'door4' ? '5,3' : 'none'
      }, svg);
      if (layers.trim && rm.id !== 'door4') {
        svgEl('path', {
          d: rm.poly,
          fill: 'none',
          stroke: '#0f766e',
          'stroke-width': 1,
          'stroke-dasharray': '4,3',
          opacity: 0.65
        }, svg);
      }
      const lines = (es ? rm.es : rm.en).split('\n');
      lines.forEach((ln, idx) => {
        svgEl('text', {
          x: px(rm.lx),
          y: py(rm.ly) + idx * 12,
          'text-anchor': 'middle',
          'font-size': idx === 0 ? 10 : 8.5,
          'font-weight': idx === 0 ? 700 : 500,
          fill: rm.id === 'door4' ? '#92400e' : '#475569'
        }, svg).textContent = ln;
      });
    });

    /* Entry Door 4 on West Wall of Hallway swinging INWARD (East) */
    svgEl('line', { x1: px(147), y1: py(68), x2: px(147), y2: py(100), stroke: '#f8fafc', 'stroke-width': 4 }, svg);
    svgEl('line', { x1: px(147), y1: py(68), x2: px(177), y2: py(68), stroke: '#15539e', 'stroke-width': 2.4 }, svg);
    svgEl('path', { d: `M${px(177)},${py(68)} A${(30 * sc).toFixed(1)},${(30 * sc).toFixed(1)} 0 0,1 ${px(147)},${py(98)}`, fill: 'none', stroke: '#15539e', 'stroke-width': 1.4, 'stroke-dasharray': '4,3' }, svg);
    svgEl('text', { x: px(172), y: py(84), 'font-size': 8, 'font-weight': 800, fill: '#15539e' }, svg).textContent = es ? 'Puerta 4 →' : 'Door 4 →';

    /* Existing original trim preservation badge on Plan */
    if (layers.trim) {
      svgEl('rect', { x: px(0), y: py(298), width: 325, height: 20, rx: 4, fill: '#e6efe9', stroke: '#2f4f42' }, svg);
      svgEl('text', { x: px(0) + 162.5, y: py(298) + 13, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill: '#2f4f42' }, svg).textContent =
        es ? 'MOLDURAS Y ZOCLOS ORIGINALES: PROTEGER' : 'EXISTING ORIGINAL TRIM / BASEBOARDS: PROTECT';
    }

    /* Graphical Scale Bar (uniform scale 1.48 px/in -> 12 ft = 144" = 213.1 px) */
    const sbX = 560;
    const sbY = 602;
    const bar4ft = 48 * sc;
    svgEl('text', { x: sbX - 8, y: sbY + 10, 'text-anchor': 'end', 'font-size': 9.5, 'font-weight': 700, fill: '#334155' }, svg).textContent =
      es ? 'ESCALA UNIFORME:' : 'TRUE SCALE:';
    for (let i = 0; i < 3; i++) {
      svgEl('rect', {
        x: sbX + i * bar4ft,
        y: sbY,
        width: bar4ft,
        height: 8,
        fill: i % 2 === 0 ? '#1e293b' : '#ffffff',
        stroke: '#1e293b',
        'stroke-width': 1
      }, svg);
      svgEl('text', { x: sbX + i * bar4ft, y: sbY + 20, 'text-anchor': 'middle', 'font-size': 8.5, fill: '#334155' }, svg).textContent = `${i * 4} ft`;
    }
    svgEl('text', { x: sbX + 3 * bar4ft, y: sbY + 20, 'text-anchor': 'middle', 'font-size': 8.5, fill: '#334155' }, svg).textContent = '12 ft';

    /* Permanent Attic Hatch (24"x36" dashed MEASURE ON SITE) & Continuous 24" Walkway */
    if (layers.walkway) {
      /* 30" clear walkway corridor + 24" solid wood deck orthogonal segments */
      const pts = m.waypoints.map((w) => `${px(w.x)},${py(w.y)}`).join(' ');
      svgEl('polyline', {
        points: pts,
        fill: 'none',
        stroke: m.walkPass ? '#f59e0b' : '#dc2626',
        'stroke-width': 30 * sc,
        'stroke-opacity': 0.22,
        'stroke-linecap': 'square',
        'stroke-linejoin': 'miter'
      }, svg);
      svgEl('polyline', {
        points: pts,
        fill: 'none',
        stroke: m.walkPass ? '#d97706' : '#b91c1c',
        'stroke-width': 24 * sc,
        'stroke-opacity': 0.52,
        'stroke-dasharray': '10,4',
        'stroke-linecap': 'butt',
        'stroke-linejoin': 'miter'
      }, svg);

      /* Hatch dashed rectangle (provisional MEASURE ON SITE) */
      const hg = svgEl('g', { class: 'svg-draggable', 'data-drag': 'hatch' }, svg);
      svgEl('rect', {
        x: px(m.hx - m.hatchW / 2),
        y: py(m.hy - m.hatchH / 2),
        width: m.hatchW * sc,
        height: m.hatchH * sc,
        fill: '#fef3c7',
        'fill-opacity': 0.85,
        stroke: '#b45309',
        'stroke-width': 2,
        'stroke-dasharray': '5,3'
      }, hg);
      svgEl('text', {
        x: px(m.hx),
        y: py(m.hy) - 3,
        'text-anchor': 'middle',
        'font-size': 8.5,
        'font-weight': 800,
        fill: '#78350f'
      }, hg).textContent = '24"×36"';
      svgEl('text', {
        x: px(m.hx),
        y: py(m.hy) + 8,
        'text-anchor': 'middle',
        'font-size': 7.5,
        'font-weight': 700,
        fill: '#b45309'
      }, hg).textContent = es ? 'MEDIR OBRA' : 'MEASURE';

      /* Walkway label badge */
      svgEl('rect', {
        x: px(215),
        y: py(72),
        width: 145,
        height: 20,
        rx: 4,
        fill: m.walkPass ? '#fffbeb' : '#fef2f2',
        stroke: m.walkPass ? '#d97706' : '#b91c1c'
      }, svg);
      svgEl('text', {
        x: px(215) + 72.5,
        y: py(72) + 13.5,
        'text-anchor': 'middle',
        'font-size': 9.2,
        'font-weight': 800,
        fill: m.walkPass ? '#92400e' : '#b91c1c'
      }, svg).textContent = es
        ? `Pasillo 24": ${m.walkFt} ft (${m.walkPass ? 'OK' : '>20ft!'})`
        : `24" Walkway: ${m.walkFt} ft (${m.walkPass ? 'PASS' : '>20ft!'})`;
    }

    /* Ducts layer (3 supply + 1 return + 1 jump duct) */
    if (layers.ducts) {
      function drawDuct(node, id, label, color, dash, dragName) {
        svgEl('line', {
          x1: px(m.fx), y1: py(m.fy),
          x2: px(node.x), y2: py(node.y),
          stroke: color,
          'stroke-width': 3.2,
          'stroke-dasharray': dash || 'none'
        }, svg);
        const g = svgEl('g', { class: 'svg-draggable', 'data-drag': dragName }, svg);
        svgEl('rect', {
          x: px(node.x) - 16, y: py(node.y) - 10,
          width: 32, height: 20, rx: 4,
          fill: color, stroke: '#ffffff', 'stroke-width': 1.5
        }, g);
        svgEl('text', {
          x: px(node.x), y: py(node.y) + 4,
          'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#ffffff'
        }, g).textContent = label;
      }
      drawDuct(m.s1, 's1', 'S1', '#15539e', null, 's1');
      drawDuct(m.s2, 's2', 'S2', '#15539e', null, 's2');
      drawDuct(m.s3, 's3', 'S3', '#15539e', null, 's3');
      drawDuct(m.r1, 'r1', 'RET', '#0f766e', '6,3', 'r1');

      /* Pressure-relief Jump duct at Bedroom entry */
      const jg = svgEl('g', { class: 'svg-draggable', 'data-drag': 'jump' }, svg);
      svgEl('line', {
        x1: px(m.jd.x), y1: py(m.jd.y - 10),
        x2: px(m.jd.x), y2: py(m.jd.y + 18),
        stroke: '#7c3aed', 'stroke-width': 4, 'stroke-dasharray': '4,2'
      }, jg);
      svgEl('rect', {
        x: px(m.jd.x) - 17, y: py(m.jd.y) - 9,
        width: 34, height: 18, rx: 4,
        fill: '#7c3aed', stroke: '#ffffff', 'stroke-width': 1.5
      }, jg);
      svgEl('text', {
        x: px(m.jd.x), y: py(m.jd.y) + 4,
        'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#ffffff'
      }, jg).textContent = 'JD';
    }

    /* Furnace & 30"x30" Service Platform layer (draggable) */
    if (layers.furnace) {
      /* Service Platform 30" x 30" */
      svgEl('rect', {
        x: px(m.px - 15),
        y: py(m.py - 15),
        width: 30 * sc,
        height: 30 * sc,
        fill: '#e6efe9',
        stroke: '#2f4f42',
        'stroke-width': 2
      }, svg);
      svgEl('text', {
        x: px(m.px),
        y: py(m.py) + 3,
        'text-anchor': 'middle',
        'font-size': 8.5,
        'font-weight': 800,
        fill: '#2f4f42'
      }, svg).textContent = '30"×30"';

      /* Furnace cabinet 33.25" x 29" footprint */
      const fg = svgEl('g', { class: 'svg-draggable', 'data-drag': 'furnace' }, svg);
      svgEl('rect', {
        x: px(m.fx - m.furnW / 2),
        y: py(m.fy - m.furnD / 2),
        width: m.furnW * sc,
        height: m.furnD * sc,
        rx: 3,
        fill: '#1e293b',
        stroke: '#0284c7',
        'stroke-width': 2.5
      }, fg);
      svgEl('text', {
        x: px(m.fx), y: py(m.fy) - 2,
        'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#ffffff'
      }, fg).textContent = 'FURNACE';
      svgEl('text', {
        x: px(m.fx), y: py(m.fy) + 9,
        'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#7dd3fc'
      }, fg).textContent = '45k BTU';
    }

    /* Type B Flue & 120V GFCI layer */
    if (layers.mep) {
      /* Flue path + roof jack */
      svgEl('line', {
        x1: px(m.fx), y1: py(m.fy),
        x2: px(m.flueX), y2: py(m.flueY),
        stroke: m.flueClearPass ? '#ea580c' : '#dc2626',
        'stroke-width': 3
      }, svg);
      const flg = svgEl('g', { class: 'svg-draggable', 'data-drag': 'flue' }, svg);
      svgEl('circle', {
        cx: px(m.flueX), cy: py(m.flueY), r: 10,
        fill: m.flueClearPass ? '#fff7ed' : '#fef2f2',
        stroke: m.flueClearPass ? '#ea580c' : '#dc2626',
        'stroke-width': 2.2
      }, flg);
      svgEl('text', {
        x: px(m.flueX), y: py(m.flueY) + 3.5,
        'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 800, fill: '#9a3412'
      }, flg).textContent = 'B';

      /* 120V GFCI service outlet */
      svgEl('line', {
        x1: px(m.fx), y1: py(m.fy),
        x2: px(m.gx), y2: py(m.gy),
        stroke: m.gfciPass ? '#16a34a' : '#dc2626',
        'stroke-width': 1.8,
        'stroke-dasharray': '3,3'
      }, svg);
      const gfg = svgEl('g', { class: 'svg-draggable', 'data-drag': 'gfci' }, svg);
      svgEl('rect', {
        x: px(m.gx) - 18, y: py(m.gy) - 9,
        width: 36, height: 18, rx: 3,
        fill: m.gfciPass ? '#dcfce7' : '#fef2f2',
        stroke: m.gfciPass ? '#15803d' : '#b91c1c',
        'stroke-width': 1.8
      }, gfg);
      svgEl('text', {
        x: px(m.gx), y: py(m.gy) + 3.5,
        'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 800,
        fill: m.gfciPass ? '#14532d' : '#991b1b'
      }, gfg).textContent = 'GFCI';
    }

    /* Hatch clash banner directly on SVG if triggered */
    if (m.hatchClashes.length) {
      svgEl('rect', { x: 30, y: 584, width: 410, height: 26, rx: 4, fill: '#fef2f2', stroke: '#b91c1c', 'stroke-width': 1.5 }, svg);
      svgEl('text', { x: 42, y: 601, 'font-size': 10.5, 'font-weight': 800, fill: '#b91c1c' }, svg).textContent =
        (es ? 'CHOQUE EN ESCOTILLA: ' : 'HATCH / ROUTE CLASH: ') + m.hatchClashes.join(', ');
    }

    /* ── PANEL 2: COUPLED ATTIC VERTICAL SECTION (66" Height, scaleX === scaleY = 2.6 px/in) ── */
    const ssc = 2.6;
    const secTopY = 644;
    svgEl('rect', { x: 16, y: secTopY, width: 888, height: 452, rx: 6, fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 1.5 }, svg);
    svgEl('rect', { x: 16, y: secTopY, width: 888, height: 28, rx: 6, fill: '#f3f7f4' }, svg);
    svgEl('text', { x: 30, y: secTopY + 18, 'font-size': 12, 'font-weight': 800, fill: '#2f4f42' }, svg).textContent =
      es ? 'CORTE VERTICAL ACOPLADO DEL ÁTICO (ALTURA 66" · ESCALA UNIFORME) · ← OESTE (Puerta 4) | ESTE →'
         : 'COUPLED ATTIC VERTICAL SECTION (66" RIDGE HEIGHT · UNIFORM SCALE) · ← WEST (Door 4) | EAST →';

    const joistY = 928;
    const ridgeY = joistY - m.atticH * ssc; /* exact 66" above attic deck */
    const roomFloorY = joistY + 104;        /* hallway zone below ceiling joists */

    /* Roof rafters enclosing 66" height proportionally */
    svgEl('polygon', {
      points: `80,${joistY} 460,${ridgeY} 840,${joistY}`,
      fill: '#f8fafc',
      stroke: '#334155',
      'stroke-width': 3
    }, svg);

    /* Ceiling Joists & Insulation zone */
    svgEl('rect', { x: 80, y: joistY, width: 760, height: 18, fill: '#fde68a', stroke: '#92400e', 'stroke-width': 1.5 }, svg);
    svgEl('text', { x: 750, y: joistY + 13, 'text-anchor': 'end', 'font-size': 9.5, 'font-weight': 700, fill: '#78350f' }, svg).textContent =
      es ? 'Vigas de techo y aislamiento (respetar claro libre)' : 'Ceiling Joists & Insulation (Maintain Air Seal + Dam)';

    /* 66" Height vertical dimension */
    svgEl('line', { x1: 460, y1: ridgeY, x2: 460, y2: joistY, stroke: '#15539e', 'stroke-width': 1.5, 'stroke-dasharray': '4,3' }, svg);
    svgEl('rect', { x: 400, y: ridgeY + 26, width: 120, height: 20, rx: 4, fill: '#e8f1fb', stroke: '#15539e' }, svg);
    svgEl('text', { x: 460, y: ridgeY + 40, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#15539e' }, svg).textContent =
      `${fmtIn(m.atticH)} ${es ? 'altura libre' : 'attic height'}`;

    /* Hatch Opening (24"x36" finished clear left section) */
    const secHx = 210;
    svgEl('rect', { x: secHx - 12 * ssc, y: joistY - 4, width: 24 * ssc, height: 26, fill: '#ffffff', stroke: '#b45309', 'stroke-width': 2.2, 'stroke-dasharray': '5,3' }, svg);
    svgEl('text', { x: secHx, y: joistY + 38, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#b45309' }, svg).textContent =
      es ? 'Escotilla 24"×36" (Medir en obra)' : '24"×36" Clear Hatch (Measure on site)';

    /* Walkway running East toward Platform (proportional horizontal distance clamped to visible section span) */
    const walkSpanPx = Math.min(280, Math.max(90, m.walkFt * 12));
    const secPlatX = secHx + 12 * ssc + walkSpanPx;
    svgEl('rect', {
      x: secHx + 12 * ssc,
      y: joistY - 3,
      width: walkSpanPx,
      height: 5,
      fill: m.walkPass ? '#d97706' : '#b91c1c'
    }, svg);
    svgEl('text', {
      x: secHx + 12 * ssc + walkSpanPx / 2,
      y: joistY - 10,
      'text-anchor': 'middle',
      'font-size': 9.5,
      'font-weight': 800,
      fill: m.walkPass ? '#92400e' : '#b91c1c'
    }, svg).textContent = `24" Walkway: ${m.walkFt} ft / ${m.maxWalkFt} ft max`;

    /* 30"x30" Platform + Furnace (33.25" H x 29" W cross-section) */
    const platW = 30 * ssc;
    svgEl('rect', { x: secPlatX, y: joistY - 4, width: platW + 30 * ssc, height: 6, fill: '#2f4f42' }, svg);
    svgEl('text', { x: secPlatX + platW / 2, y: joistY + 32, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 800, fill: '#2f4f42' }, svg).textContent =
      es ? 'Plataforma 30"×30"' : '30"×30" Platform';

    const secFurnX = secPlatX + platW - 10;
    const furnHeightPx = 33.25 * ssc;
    const furnWidthPx = 29.0 * ssc;
    svgEl('rect', {
      x: secFurnX,
      y: joistY - 4 - furnHeightPx,
      width: furnWidthPx,
      height: furnHeightPx,
      fill: '#1e293b',
      stroke: '#0284c7',
      'stroke-width': 2.2
    }, svg);
    svgEl('text', { x: secFurnX + furnWidthPx / 2, y: joistY - furnHeightPx / 2 - 8, 'text-anchor': 'middle', 'font-size': 8.8, 'font-weight': 800, fill: '#ffffff' }, svg).textContent = 'Carrier 45k';
    svgEl('text', { x: secFurnX + furnWidthPx / 2, y: joistY - furnHeightPx / 2 + 4, 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#7dd3fc' }, svg).textContent = '33.25" H';
    svgEl('text', { x: secFurnX + furnWidthPx / 2, y: joistY - furnHeightPx / 2 + 15, 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#7dd3fc' }, svg).textContent = '× 29" D';

    /* Type B Flue Vent rising with >= 1" clearance halo */
    const flueSecX = secFurnX + furnWidthPx * 0.72;
    const flueRoofY = ridgeY + Math.abs(flueSecX - 460) * ((joistY - ridgeY) / 380);
    svgEl('rect', {
      x: flueSecX - 10,
      y: flueRoofY - 26,
      width: 20,
      height: (joistY - 4 - furnHeightPx) - (flueRoofY - 26),
      fill: m.flueClearPass ? '#fff7ed' : '#fef2f2',
      stroke: m.flueClearPass ? '#ea580c' : '#dc2626',
      'stroke-width': 1.5,
      'stroke-dasharray': '3,2'
    }, svg);
    svgEl('rect', {
      x: flueSecX - 4,
      y: flueRoofY - 28,
      width: 8,
      height: (joistY - 4 - furnHeightPx) - (flueRoofY - 28),
      fill: '#64748b'
    }, svg);
    svgEl('text', {
      x: flueSecX + 16,
      y: flueRoofY + 12,
      'font-size': 9,
      'font-weight': 800,
      fill: m.flueClearPass ? '#9a3412' : '#b91c1c'
    }, svg).textContent = `Type B (${fmtIn(m.flueClear)} clear)`;

    /* GFCI Service Outlet on Section */
    svgEl('rect', {
      x: secPlatX + 8,
      y: joistY - 28,
      width: 34,
      height: 18,
      rx: 3,
      fill: m.gfciPass ? '#dcfce7' : '#fef2f2',
      stroke: m.gfciPass ? '#15803d' : '#b91c1c',
      'stroke-width': 1.8
    }, svg);
    svgEl('text', { x: secPlatX + 25, y: joistY - 16, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 800, fill: m.gfciPass ? '#14532d' : '#991b1b' }, svg).textContent = 'GFCI';

    /* Hallway Ceiling + Original Crown Zone below joists */
    svgEl('line', { x1: 80, y1: roomFloorY, x2: 840, y2: roomFloorY, stroke: '#94a3b8', 'stroke-width': 1.5, 'stroke-dasharray': '6,4' }, svg);
    svgEl('text', { x: 460, y: roomFloorY - 12, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: '#2f4f42' }, svg).textContent =
      es ? 'Planta Habitada Debajo (121-1/2" alto · Proteger corona y marcos originales · Clóset recámara abierto hasta cable LV y escotilla)'
         : 'Living Level Below (121-1/2" ceiling · Protect original crown/casings · Keep bedroom closet ceiling open until LV + permanent hatch)';

    /* Section Scale Bar (2.6 px/in -> 24" = 62.4 px) */
    const ssbX = 620;
    const ssbY = 1054;
    svgEl('text', { x: ssbX - 8, y: ssbY + 10, 'text-anchor': 'end', 'font-size': 9, 'font-weight': 700, fill: '#334155' }, svg).textContent =
      es ? 'ESCALA SECCIÓN:' : 'SECTION SCALE:';
    for (let i = 0; i < 2; i++) {
      svgEl('rect', {
        x: ssbX + i * (24 * ssc), y: ssbY, width: 24 * ssc, height: 7,
        fill: i % 2 === 0 ? '#1e293b' : '#ffffff', stroke: '#1e293b', 'stroke-width': 1
      }, svg);
      svgEl('text', { x: ssbX + i * (24 * ssc), y: ssbY + 18, 'text-anchor': 'middle', 'font-size': 8.5, fill: '#334155' }, svg).textContent = `${i * 24}"`;
    }
    svgEl('text', { x: ssbX + 2 * (24 * ssc), y: ssbY + 18, 'text-anchor': 'middle', 'font-size': 8.5, fill: '#334155' }, svg).textContent = '48"';

    renderSvgLeaderPins(svg);
    wireSvgDrag(sc, ox, oy);
  }

  function renderSvgLeaderPins(svg) {
    const pins = state.pins || [];
    if (!pins.length) return;
    const grp = svgEl('g', { id: 'pin-callouts-layer' }, svg);
    pins.forEach((pin, idx) => {
      const num = idx + 1;
      const cx = (pin.cx || 0.42) * 920;
      const cy = (pin.cy || 0.35) * 1120;
      const rx = (pin.rx || 0.03) * 920;
      const ry = (pin.ry || 0.03) * 1120;
      const color = pin.intent === 'flag_problem' ? '#dc2626' : pin.intent === 'ask_question' ? '#15539e' : '#2f4f42';

      svgEl('ellipse', {
        cx, cy, rx, ry,
        fill: color, 'fill-opacity': 0.1,
        stroke: color, 'stroke-width': 2.5, 'stroke-dasharray': '5,3'
      }, grp);

      const cardX = Math.min(725, Math.max(30, cx + rx + 26));
      const cardY = Math.min(1080, Math.max(96, cy - 18));
      svgEl('line', { x1: cx + rx * 0.7, y1: cy, x2: cardX, y2: cardY + 11, stroke: color, 'stroke-width': 2 }, grp);

      const snippet = (pin.note || 'Comment').slice(0, 26) + ((pin.note || '').length > 26 ? '…' : '');
      svgEl('rect', { x: cardX, y: cardY, width: 175, height: 22, rx: 4, fill: '#ffffff', stroke: color, 'stroke-width': 1.8 }, grp);
      svgEl('circle', { cx: cardX + 11, cy: cardY + 11, r: 8, fill: color }, grp);
      svgEl('text', { x: cardX + 11, y: cardY + 14.5, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#ffffff' }, grp).textContent = String(num);
      svgEl('text', { x: cardX + 24, y: cardY + 14.5, 'font-size': 9.2, 'font-weight': 700, fill: '#10202b' }, grp).textContent = snippet;
    });
  }

  /* ── SVG Pointer Dragging (Updates Geometry & State Live) ─────────── */
  function wireSvgDrag(sc, ox, oy) {
    const svg = document.getElementById('hvac-svg');
    if (!svg) return;

    function clientToInches(evt) {
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 285, y: 162 };
      const p = pt.matrixTransform(ctm.inverse());
      return {
        x: Math.round(Math.max(15, Math.min(500, (p.x - ox) / sc))),
        y: Math.round(Math.max(12, Math.min(280, (p.y - oy) / sc)))
      };
    }

    svg.querySelectorAll('.svg-draggable').forEach((g) => {
      g.onpointerdown = (evt) => {
        if (circleMode) return;
        evt.preventDefault();
        dragTarget = g.getAttribute('data-drag');
        const cur = clientToInches(evt);
        pointerDragOffset = { dx: 0, dy: 0, start: cur };
        try { g.setPointerCapture(evt.pointerId); } catch (_) {}
      };
    });

    svg.onpointermove = (evt) => {
      if (!dragTarget || circleMode) return;
      const pos = clientToInches(evt);
      const map = {
        furnace: ['furnace_x_in', 'furnace_y_in'],
        hatch: ['hatch_x_in', 'hatch_y_in'],
        s1: ['supply1_x_in', 'supply1_y_in'],
        s2: ['supply2_x_in', 'supply2_y_in'],
        s3: ['supply3_x_in', 'supply3_y_in'],
        r1: ['return1_x_in', 'return1_y_in'],
        jump: ['jump1_x_in', 'jump1_y_in'],
        flue: ['flue_x_in', 'flue_y_in'],
        gfci: ['gfci_x_in', 'gfci_y_in']
      };
      if (dragTarget === 'gfci') {
        if (!state.options) state.options = {};
        state.options.gfci_mode = 'custom_drag';
      }
      const pair = map[dragTarget];
      if (pair) {
        setDim(pair[0], pos.x, 'FIELD_UPDATE_PENDING_EOD');
        setDim(pair[1], pos.y, 'FIELD_UPDATE_PENDING_EOD');
        hasUnsyncedLocalEdits = true;
        syncFormFromState();
        renderAll();
      }
    };

    svg.onpointerup = () => { dragTarget = null; };
    svg.onpointercancel = () => { dragTarget = null; };
  }

  /* ── Render Clashes, Live Takeoff, Node Table & Status Strip ──────── */
  function renderStatusAndLists() {
    const m = computeGeometryMetrics();
    const es = currentLang === 'es';

    /* Top strip pills */
    const wp = document.getElementById('walkway-pill');
    if (wp) {
      wp.className = `pill ${m.walkPass ? 'pill-pass' : 'pill-fail'}`;
      wp.textContent = es
        ? `Pasillo 24": ${m.walkFt} ft / ${m.maxWalkFt} ft (${m.walkPass ? 'CUMPLE' : 'FALLA'})`
        : `Walkway: ${m.walkFt} ft / ${m.maxWalkFt} ft (${m.walkPass ? 'PASS' : 'FAIL'})`;
    }
    const sp = document.getElementById('sheets-pill');
    if (sp) sp.textContent = es ? `Hojas 4×8: ${m.sawKerfSheets} (1 tira/hoja)` : `4×8 Sheets: ${m.sawKerfSheets} (saw-kerf)`;

    const gp = document.getElementById('gfci-pill');
    if (gp) {
      gp.className = `pill ${m.gfciPass ? 'pill-pass' : 'pill-fail'}`;
      gp.textContent = es
        ? `GFCI 120V: ${m.gfciFt} ft (${m.gfciPass ? '≤25 ft OK' : '>25 ft FALLA'})`
        : `120V GFCI: ${m.gfciFt} ft (${m.gfciPass ? 'PASS' : 'FAIL >25 ft'})`;
    }
    const fp = document.getElementById('flue-pill');
    if (fp) {
      fp.className = `pill ${m.flueClearPass ? 'pill-pass' : 'pill-fail'}`;
      fp.textContent = es
        ? `Escape Tipo B: ${fmtIn(m.flueClear)} (${m.flueClearPass ? '≥1" OK' : '<1" FALLA'})`
        : `Type B Clear: ${fmtIn(m.flueClear)} (${m.flueClearPass ? 'PASS' : 'FAIL'})`;
    }
    const cp = document.getElementById('clash-pill');
    if (cp) {
      const ok = m.hatchClashes.length === 0;
      cp.className = `pill ${ok ? 'pill-pass' : 'pill-fail'}`;
      cp.textContent = ok
        ? (es ? 'Sin cruce en escotilla' : 'Clear of Hatch')
        : (es ? `CRUCE: ${m.hatchClashes.length}` : `HATCH CLASH (${m.hatchClashes.length})`);
    }
    const syncEl = document.getElementById('sync-stamp-pill');
    if (syncEl) syncEl.textContent = computeRevisionStamp();

    /* Immutable Clashes + Dynamic Live Clashes */
    const cg = document.getElementById('clashes-grid');
    if (cg) {
      cg.innerHTML = '';
      const allClashes = [...(state.flagged_clashes || [])];
      if (!m.walkPass) {
        allClashes.unshift({
          id: 'live-walkway-fail',
          severity: 'HIGH',
          en: `Walkway run is ${m.walkFt} ft — EXCEEDS 20 ft maximum at 66" attic height! Move furnace closer to Door 4 hatch or re-verify route.`,
          es: `El pasillo mide ${m.walkFt} ft — ¡EXCEDE el máximo de 20 ft para 66" de altura! Acercar el equipo a la escotilla.`
        });
      }
      if (m.hatchClashes.length) {
        allClashes.unshift({
          id: 'live-hatch-clash',
          severity: 'HIGH',
          en: `Hatch / Duct Clearance Clash: ${m.hatchClashes.join(', ')} crosses the 24"×36" finished clear attic hatch opening.`,
          es: `Cruce en escotilla 24"×36": ${m.hatchClashes.join(', ')} invade la abertura libre.`
        });
      }
      if (!m.gfciPass) {
        allClashes.unshift({
          id: 'live-gfci-fail',
          severity: 'HIGH',
          en: `120V GFCI receptacle is ${m.gfciFt} ft from furnace — EXCEEDS 25 ft max. Mount GFCI right at 30"×30" service platform.`,
          es: `Contacto GFCI 120V quedó a ${m.gfciFt} ft del equipo — EXCEDE el máximo de 25 ft.`
        });
      }
      allClashes.forEach((c) => {
        const card = document.createElement('div');
        card.className = `clash-card ${c.severity === 'MEDIUM' ? 'sev-medium' : ''}`;
        const h = document.createElement('div');
        h.className = 'clash-card-head';
        const s1 = document.createElement('span');
        s1.textContent = c.id.startsWith('live-') ? (es ? 'ALERTA EN VIVO' : 'LIVE CHECK FLAG') : (es ? 'CHOQUE FIJO' : 'IMMUTABLE FLAG');
        const s2 = document.createElement('span');
        s2.className = `pill ${c.severity === 'MEDIUM' ? 'pill-warn' : 'pill-fail'}`;
        s2.textContent = c.severity;
        h.appendChild(s1);
        h.appendChild(s2);
        const p = document.createElement('div');
        p.textContent = es ? (c.es || c.en) : c.en;
        card.appendChild(h);
        card.appendChild(p);
        cg.appendChild(card);
      });
    }

    /* Live Proposed Materials Takeoff (Quantities ONLY, ZERO Prices) */
    const tg = document.getElementById('takeoff-grid');
    if (tg) {
      tg.innerHTML = '';
      const waste = Math.max(0, Math.min(30, Number((state.options && state.options.waste_pct) ?? 10)));
      const mat = (state.options && state.options.walkway_material) || 'osb_23_32';
      const matLabel = {
        osb_23_32: es ? 'OSB 23/32" (más económico)' : '23/32" Rated OSB (cheapest)',
        ply_3_4: es ? 'Triplay estructural 3/4"' : '3/4" Structural Plywood',
        lumber_2x: es ? 'Madera sólida 2×' : '2× Solid Lumber'
      }[mat];

      const netWalkSqFt = Number((m.walkFt * 2.0).toFixed(1));
      const grossSheets = m.sawKerfSheets + (waste >= 15 ? 1 : 0);
      const platSqFt = 6.25;
      const screwCount = Math.ceil((m.walkFt * 4 + 24) * (1 + waste / 100));
      const ductGrossFt = Number(((m.totalSupplyFt + m.r1Ft + m.jdFt) * (1 + waste / 100)).toFixed(1));

      const cards = [
        {
          primary: true,
          title: es ? 'Pasillo 24" (Alcance Cuadrilla)' : '24" Walkway (Our Crew)',
          big: `${m.sawKerfSheets} ${es ? 'hojas 4×8' : 'sheets 4×8'}`,
          sub: es
            ? `${netWalkSqFt} sq ft netos (${m.walkFt} pies) · ${matLabel} · 1 tira 24"/hoja (corte sierra) · con ${waste}% merma: ${grossSheets} hojas`
            : `${netWalkSqFt} sq ft net (${m.walkFt} ft) · ${matLabel} · 1 strip/sheet (saw kerf) · w/ ${waste}% spare: ${grossSheets} sheets`
        },
        {
          primary: false,
          title: es ? 'Plataforma 30"×30" y Tornillos' : '30"×30" Platform & Screws',
          big: `1 ${es ? 'hoja' : 'sheet'} + ${screwCount} #9`,
          sub: es
            ? `${platSqFt} sq ft netos · Tornillos #9 × 2-1/2" o 3" · CERO soportes antivibración (los incluye NEXT)`
            : `${platSqFt} sq ft net · #9 × 2-1/2" or 3" wood screws · ZERO vibration pads for John (NEXT supplies)`
        },
        {
          primary: false,
          title: es ? 'Eléctrica Ático (Cuadrilla)' : 'Attic Service Elec (Our Crew)',
          big: `1 LED + 1 GFCI`,
          sub: es
            ? `1 luz LED cerrada + apagador en entrada + 1 GFCI 120V vivo (${m.gfciFt} ft al equipo) · cable aprox. ${Math.ceil(m.gfciFt + 15)} ft`
            : `1 enclosed LED utility light + entrance switch + 1 live 120V GFCI (${m.gfciFt} ft from unit) · ~${Math.ceil(m.gfciFt + 15)} ft cable`
        },
        {
          primary: false,
          title: es ? 'Ductos NEXT (Solo Recorrido)' : 'NEXT Ductwork (Walkthrough Ref)',
          big: `${ductGrossFt} ft ${es ? 'brutos' : 'gross'}`,
          sub: es
            ? `3 inyecciones (${m.totalSupplyFt} ft) + 1 retorno (${m.r1Ft} ft) + 1 paso (${m.jdFt} ft) + escape Tipo B · +${waste}% tolerancia`
            : `3 supplies (${m.totalSupplyFt} ft) + 1 return (${m.r1Ft} ft) + 1 jump (${m.jdFt} ft) + Type B flue · incl. +${waste}% allowance`
        }
      ];

      cards.forEach((cd) => {
        const el = document.createElement('div');
        el.className = `takeoff-card ${cd.primary ? 'card-primary' : ''}`;
        const t = document.createElement('div'); t.className = 'takeoff-card-title'; t.textContent = cd.title;
        const b = document.createElement('div'); b.className = 'takeoff-card-big'; b.textContent = cd.big;
        const s = document.createElement('div'); s.className = 'takeoff-card-sub'; s.textContent = cd.sub;
        el.appendChild(t); el.appendChild(b); el.appendChild(s);
        tg.appendChild(el);
      });
    }

    const trimNote = document.getElementById('trim-baseline-note');
    if (trimNote && state.existing_original_trim) {
      trimNote.textContent = es ? state.existing_original_trim.baseline_es : state.existing_original_trim.baseline_en;
    }

    /* Live Table */
    const tb = document.getElementById('marks-tbody');
    if (tb) {
      tb.innerHTML = '';
      const rows = [
        [
          es ? 'Calefactor Ático (33.25×14.19×29")' : 'Attic Furnace (33.25"×14.19"×29")',
          `X=${fmtIn(m.fx)}, Y=${fmtIn(m.fy)}`,
          `30"×30" (${m.side})`,
          es ? 'Revisar Lunes 23 Nov' : 'Verify Mon Nov 23',
          'wall_to_wall · PROPOSED'
        ],
        [
          es ? 'Escotilla 24"×36" Libre Terminada' : '24"×36" Finished Clear Hatch',
          `X=${fmtIn(m.hx)}, Y=${fmtIn(m.hy)}`,
          `${m.hatchW}" × ${m.hatchH}"`,
          es ? 'MEDIR EN OBRA (Alto sin corte)' : 'MEASURE ON SITE (HOLD)',
          'clear_between_casings · MEASURE'
        ],
        [
          es ? 'Pasillo Continuo 24" (Claro 30")' : '24" Continuous Walkway (30" clear)',
          `${es ? 'Puerta 4 → Plataforma' : 'Door 4 → Platform'}`,
          `${m.walkFt} ft (${m.sawKerfSheets} ${es ? 'hojas' : 'sheets'})`,
          m.walkPass ? (es ? 'CUMPLE (≤ 20 ft)' : 'PASS (≤ 20 ft)') : (es ? 'FALLA (> 20 ft!)' : 'FAIL (> 20 ft!)'),
          'wall_to_wall · saw-kerf 1/sheet',
          !m.walkPass ? 'row-fail' : ''
        ],
        [
          es ? 'Contacto GFCI 120V (Línea viva)' : '120V GFCI Receptacle (Live side)',
          `X=${fmtIn(m.gx)}, Y=${fmtIn(m.gy)}`,
          `${m.gfciFt} ft ${es ? 'al equipo' : 'to furnace'}`,
          m.gfciPass ? (es ? 'CUMPLE (≤ 25 ft)' : 'PASS (≤ 25 ft)') : (es ? 'FALLA (> 25 ft!)' : 'FAIL (> 25 ft!)'),
          'subfloor · max 25 ft',
          !m.gfciPass ? 'row-fail' : ''
        ],
        [
          es ? 'Escape Doble Pared Tipo B' : 'Type B Double-Wall Exhaust Flue',
          `X=${fmtIn(m.flueX)}, Y=${fmtIn(m.flueY)}`,
          `${fmtIn(m.flueClear)} ${es ? 'claro' : 'clearance'}`,
          m.flueClearPass ? (es ? 'CUMPLE (≥ 1")' : 'PASS (≥ 1")') : (es ? 'FALLA (< 1"!)' : 'FAIL (< 1"!)'),
          'wall_to_wall · roof jack',
          !m.flueClearPass ? 'row-fail' : ''
        ],
        [
          es ? 'Ductos: S1 Sala / S2 Comedor / S3 Recám. / RET / Paso' : 'Ducts: S1 Living / S2 Dining / S3 Bed / RET / Jump',
          `${es ? 'Ver nodos en planta' : 'Live nodes on floorplan'}`,
          `S1 ${m.s1Ft} · S2 ${m.s2Ft} · S3 ${m.s3Ft} · RET ${m.r1Ft} · JD ${m.jdFt} ft`,
          m.hatchClashes.length ? (es ? 'CRUCE CON ESCOTILLA' : 'HATCH CLASH!') : (es ? 'Libre de escotilla' : 'Clear of hatch'),
          'wall_to_wall · NEXT scope',
          m.hatchClashes.length ? 'row-fail' : ''
        ]
      ];
      rows.forEach((r) => {
        const tr = document.createElement('tr');
        if (r[5]) tr.className = r[5];
        for (let i = 0; i < 5; i++) {
          const td = document.createElement('td');
          td.textContent = r[i];
          tr.appendChild(td);
        }
        tb.appendChild(tr);
      });
    }
  }

  /* ── Form Sync & Localization ─────────────────────────────────────── */
  function populateBoundarySelects() {
    document.querySelectorAll('.boundary-select').forEach((sel) => {
      if (sel.options.length) return;
      BOUNDARIES.forEach(([val, enLbl, esLbl]) => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = currentLang === 'es' ? esLbl : enLbl;
        sel.appendChild(opt);
      });
    });
  }

  function syncFormFromState() {
    populateBoundarySelects();
    const pair = [
      ['inp-furnace-x', 'bnd-furnace-x', 'furnace_x_in'],
      ['inp-furnace-y', 'bnd-furnace-y', 'furnace_y_in'],
      ['inp-attic-h', 'bnd-attic-h', 'attic_height_in'],
      ['inp-flue-clear', 'bnd-flue-clear', 'flue_clearance_in'],
      ['inp-hatch-x', null, 'hatch_x_in'],
      ['inp-hatch-y', null, 'hatch_y_in']
    ];
    pair.forEach(([id, bndId, key]) => {
      const el = document.getElementById(id);
      const d = state.dimensions && state.dimensions[key];
      if (el && d && d.value !== null && d.value !== undefined) el.value = String(d.value);
      if (bndId && d && d.measure_boundary) {
        const bEl = document.getElementById(bndId);
        if (bEl) bEl.value = d.measure_boundary;
      }
    });
    const opts = state.options || {};
    const setVal = (id, val) => { const e = document.getElementById(id); if (e && val !== undefined) e.value = String(val); };
    setVal('sel-platform-side', opts.platform_side || 'south');
    setVal('sel-hatch-dir', opts.hatch_orientation || 'ns');
    setVal('sel-roof-route', opts.roof_route || 'existing_jack');
    setVal('sel-gfci-mode', opts.gfci_mode || 'at_platform');
    setVal('inp-waste-pct', opts.waste_pct ?? 10);
    setVal('sel-walkway-mat', opts.walkway_material || 'osb_23_32');
  }

  function applyLocalization() {
    const t = I18N[currentLang];
    document.documentElement.lang = currentLang === 'es' ? 'es-MX' : 'en';
    const setTxt = (id, s) => { const el = document.getElementById(id); if (el) el.textContent = s; };
    setTxt('hdr-title', t.hdr_title);
    setTxt('hdr-sub', t.hdr_sub);
    setTxt('btn-lang', t.btn_lang);
    setTxt('btn-circle-toggle', circleMode ? t.btn_circle_on : t.btn_circle_off);
    setTxt('btn-export-svg', t.btn_svg);
    setTxt('btn-download-pdf', t.btn_pdf);
    setTxt('svg-panel-title', t.svg_title);
    setTxt('tab-view-all', t.tab_all);
    setTxt('tab-view-plan', t.tab_plan);
    setTxt('tab-view-section', t.tab_section);
    setTxt('photo-panel-title', t.photo_title);
    setTxt('photo-badge', t.photo_badge);
    setTxt('clashes-title', t.clashes_title);
    setTxt('clashes-lock-pill', t.clashes_lock);
    setTxt('takeoff-title', t.takeoff_title);
    setTxt('takeoff-notice', t.takeoff_notice);
    setTxt('marks-title', t.marks_title);
    setTxt('editor-title', t.editor_title);
    setTxt('voice-title', t.voice_title);
    setTxt('eod-title', t.eod_title);
    setTxt('btn-save-tailnet', t.save_live);
    setTxt('btn-apply-local', t.apply_local);
    setTxt('btn-reset-baseline', t.reset);
    setTxt('btn-dictate', isDictating ? t.dictate_stop : t.dictate);
    const hb = document.getElementById('hold-banner');
    if (hb) hb.innerHTML = t.hold_banner;

    const mapDataI18n = {
      lyr_furnace: t.lyr_furnace,
      lyr_walkway: t.lyr_walkway,
      lyr_ducts: t.lyr_ducts,
      lyr_mep: t.lyr_mep,
      lyr_trim: t.lyr_trim
    };
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (mapDataI18n[k]) el.textContent = mapDataI18n[k];
    });
    const vl = document.getElementById('voice-lang-pill');
    if (vl) vl.textContent = currentLang === 'es' ? 'es-MX' : 'en-US';
    const es = currentLang === 'es';
    document.title = t.hdr_title;
    setTxt('nav-back-room', es ? '← Volver a Página de Clima / HVAC' : '← Back to HVAC Room Page');
    setTxt('nav-peer-hatch', es ? 'Plano de Escotilla Permanente del Ático →' : 'Permanent Attic Hatch Plan →');
    const peerHatch = document.getElementById('nav-peer-hatch');
    if (peerHatch) {
      const baseHref = window.location.pathname.includes('/interactive-pilot/')
        ? '../../attic/interactive-pilot/index.html'
        : '../attic-hatch/index.html';
      peerHatch.setAttribute('href', `${baseHref}?lang=${currentLang}`);
    }
    setTxt('th-item', es ? 'Equipo / Elemento de Ruta' : 'Equipment / Route Element');
    setTxt('th-pos', es ? 'Posición en Planta (desde NO)' : 'Plan Position (from NW Corner)');
    setTxt('th-run', es ? 'Longitud / Claro Calculado' : 'Computed Length / Clearance');
    setTxt('th-gate', es ? 'Estado / Revisión' : 'Rule / Check Status');
    setTxt('th-bound', es ? 'Frontera y Origen' : 'Boundary & Provenance');
    const pc = document.getElementById('photo-callouts');
    if (pc) {
      pc.innerHTML = es
        ? '<li class="callout-alert"><strong>Arrastrar en Planta:</strong> Arrastra Equipo, Inyecciones (S1–S3), Retorno (RET), Paso, GFCI o Escape Tipo B en el SVG para probar largo del pasillo y cruces.</li>' +
          '<li><strong>Tope por Altura 66":</strong> El pasillo continuo de 24" máximo mide <strong>20 ft</strong> con 30" de paso libre y <strong>1 tira real de 24" por hoja 4×8</strong> (corte de sierra).</li>' +
          '<li><strong>Aislamiento Incluido por NEXT:</strong> John arma solo la plataforma nivelada de 30" × 30" — <strong>NO comprar gomas antivibración</strong>.</li>' +
          '<li><strong>Alimentador por Confirmar:</strong> Confirmar el lunes 23 nov propuesta NEXT 80A/#4 vs. nota previa de 100A / tablero Eaton en sitio.</li>'
        : '<li class="callout-alert"><strong>Drag on Plan:</strong> Drag Furnace, Supply Boots (S1–S3), Return (RET), Jump Duct, GFCI, or Type B Flue directly on the SVG to test walkway length and clashes.</li>' +
          '<li><strong>66&quot; Attic Height Cap:</strong> Continuous 24&quot; wood walkway is capped at <strong>20 ft max</strong> with a 30&quot; clear passage and <strong>1 true 24&quot; strip per 4×8 sheet</strong> (saw kerf).</li>' +
          '<li><strong>Isolation Included by NEXT:</strong> John builds the level 30&quot; × 30&quot; solid platform only — <strong>do NOT buy vibration pads</strong>.</li>' +
          '<li><strong>Feeder Reconciliation Open:</strong> Reconcile NEXT 80A/#4 feeder proposal vs. 100A/onsite Eaton panel box on Mon Nov 23.</li>';
    }
    const tb = document.getElementById('tailnet-badge');
    if (tb && tailnetState.checked) {
      tb.className = `pill ${tailnetState.verified ? 'pill-pass' : 'pill-neutral'}`;
      tb.textContent = tailnetState.verified ? `${t.on_tailnet} (${tailnetState.user || 'tisa'})` : t.off_tailnet;
    }
  }

  function renderAll() {
    applyLocalization();
    renderSvg();
    renderStatusAndLists();
    renderPinsAndEod();
  }

  function computeRevisionStamp() {
    const rev = state.base_rev || 'rev-20261120-hvac-001';
    if (hasUnsyncedLocalEdits) return `${rev} · ${I18N[currentLang].local_preview}`;
    if (lastSavedRevId) return `${rev} · ${I18N[currentLang].pending_eod} (${lastSavedRevId})`;
    return `${rev} · ${I18N[currentLang].synced_label}`;
  }

  function showToast(msg, kind) {
    const el = document.getElementById('status-toast');
    if (!el) return;
    el.textContent = msg;
    el.className = `status-toast ${kind === 'error' ? 'toast-error' : kind === 'ok' ? 'toast-ok' : ''}`;
    el.hidden = false;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.hidden = true; }, 4200);
  }

  /* ── Form Reading & Patch Helpers ─────────────────────────────────── */
  function buildPatchFromForm() {
    const dims = {};
    const numMap = [
      ['inp-furnace-x', 'bnd-furnace-x', 'furnace_x_in'],
      ['inp-furnace-y', 'bnd-furnace-y', 'furnace_y_in'],
      ['inp-attic-h', 'bnd-attic-h', 'attic_height_in'],
      ['inp-flue-clear', 'bnd-flue-clear', 'flue_clearance_in'],
      ['inp-hatch-x', null, 'hatch_x_in'],
      ['inp-hatch-y', null, 'hatch_y_in']
    ];
    numMap.forEach(([id, bndId, key]) => {
      const el = document.getElementById(id);
      if (!el || el.value === '') return;
      const v = Number(el.value);
      if (!Number.isNaN(v)) {
        dims[key] = {
          value: v,
          measure_boundary: bndId ? (document.getElementById(bndId)?.value || 'wall_to_wall') : 'clear_between_casings',
          verified: 'FIELD_UPDATE_PENDING_EOD'
        };
      }
    });
    const opts = {
      platform_side: document.getElementById('sel-platform-side')?.value || 'south',
      hatch_orientation: document.getElementById('sel-hatch-dir')?.value || 'ns',
      roof_route: document.getElementById('sel-roof-route')?.value || 'existing_jack',
      gfci_mode: document.getElementById('sel-gfci-mode')?.value || 'at_platform',
      walkway_material: document.getElementById('sel-walkway-mat')?.value || 'osb_23_32',
      waste_pct: Number(document.getElementById('inp-waste-pct')?.value ?? 10)
    };
    return { dimensions: dims, options: opts };
  }

  function applyPatchToLocalState(patch) {
    if (!patch) return;
    if (patch.dimensions) {
      if (!state.dimensions) state.dimensions = {};
      for (const [k, v] of Object.entries(patch.dimensions)) {
        state.dimensions[k] = Object.assign({}, state.dimensions[k] || {}, v);
      }
    }
    if (patch.options) {
      state.options = Object.assign({}, state.options || {}, patch.options);
    }
    if (patch.pin) {
      if (!Array.isArray(state.pins)) state.pins = [];
      state.pins.push(patch.pin);
    }
    hasUnsyncedLocalEdits = true;
    syncFormFromState();
    renderAll();
  }

  /* ── Spoken Field Command Parser (EN & ES) ────────────────────────── */
  function parseSpokenFieldCommand(text) {
    if (!text) return null;
    const s = text.toLowerCase();
    const out = {};
    const sideMatch = s.match(/(?:platform|plataforma)\s*(north|south|east|west|norte|sur|este|oeste)/i);
    if (sideMatch) {
      const m = { norte: 'north', sur: 'south', este: 'east', oeste: 'west' };
      out.options = { platform_side: m[sideMatch[1].toLowerCase()] || sideMatch[1].toLowerCase() };
    }
    const wasteMatch = s.match(/(?:waste|merma)\s*(\d+)/i);
    if (wasteMatch) {
      out.options = Object.assign(out.options || {}, { waste_pct: Math.min(30, Math.max(0, Number(wasteMatch[1]))) });
    }
    const clearMatch = s.match(/(?:flue|escape)\s*(\d+(?:\.\d+)?)/i);
    if (clearMatch) {
      out.dimensions = { flue_clearance_in: { value: Number(clearMatch[1]), measure_boundary: 'wall_to_wall', verified: 'FIELD_UPDATE_PENDING_EOD' } };
    }
    return Object.keys(out).length ? out : null;
  }

  /* ── Tailnet Persistence Client (/api/unit4/plans/hvac-layout) ────── */
  function mergeServerData(raw) {
    const base = deepClone(BASELINE_HVAC_DATA);
    if (!raw || typeof raw !== 'object') return base;
    if (raw.base_rev) base.base_rev = raw.base_rev;
    if (raw.title_en) base.title_en = raw.title_en;
    if (raw.title_es) base.title_es = raw.title_es;
    if (raw.dimensions && typeof raw.dimensions === 'object') {
      Object.entries(raw.dimensions).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
          base.dimensions[k] = Object.assign({}, base.dimensions[k] || {}, v);
        }
      });
    }
    if (raw.options && typeof raw.options === 'object') {
      base.options = Object.assign({}, base.options, raw.options);
    }
    if (raw.existing_original_trim && typeof raw.existing_original_trim === 'object') {
      base.existing_original_trim = Object.assign({}, base.existing_original_trim, raw.existing_original_trim);
    }
    if (Array.isArray(raw.flagged_clashes) && raw.flagged_clashes.length) {
      base.flagged_clashes = raw.flagged_clashes;
    }
    if (Array.isArray(raw.field_overrides)) base.field_overrides = raw.field_overrides;
    if (Array.isArray(raw.pins)) base.pins = raw.pins;
    return base;
  }

  async function hydrateFromLocalJson() {
    try {
      const resp = await fetch('../hvac-layout-plan-data.json', { cache: 'no-store' });
      if (resp.ok) {
        const j = await resp.json();
        state = mergeServerData(j);
      }
    } catch (_) {}
  }

  async function checkTailnetAndLoad() {
    const tb = document.getElementById('tailnet-badge');
    const saveBtn = document.getElementById('btn-save-tailnet');
    const hint = document.getElementById('save-hint');
    try {
      const hr = await fetch(`${API_ORIGIN}${PLAN_ENDPOINT_BASE}/health`, { method: 'GET' });
      if (hr.ok) {
        const hj = await hr.json();
        tailnetState.checked = true;
        tailnetState.verified = Boolean(hj.tailnet_verified);
        tailnetState.user = hj.user || null;
        if (tailnetState.verified && saveBtn) saveBtn.disabled = false;
        if (hint && tailnetState.verified) {
          hint.textContent = currentLang === 'es'
            ? 'Conectado a Tailscale: al guardar se crea respaldo EOD para revisión de Tisa.'
            : 'Tailnet connected: saving updates the live plan and logs an EOD review item for Tisa.';
        }
        const pr = await fetch(`${API_ORIGIN}${PLAN_ENDPOINT_BASE}`, { method: 'GET' });
        if (pr.ok) {
          const pj = await pr.json();
          if (pj && pj.data) state = mergeServerData(pj.data);
          tailnetState.pendingEod = (pj && pj.pending_eod) || [];
        }
      } else {
        tailnetState.checked = true;
        tailnetState.verified = false;
      }
    } catch (_) {
      tailnetState.checked = true;
      tailnetState.verified = false;
    }
    if (tb && !tailnetState.verified) {
      tb.className = 'pill pill-neutral';
      tb.textContent = I18N[currentLang].off_tailnet;
    }
    syncFormFromState();
    renderAll();
  }

  async function saveOverrideToTailnet(patch, note) {
    const payloadStr = JSON.stringify({ patch, note });
    if (violatesPrivateFirewall(payloadStr)) {
      showToast(I18N[currentLang].firewall_err, 'error');
      return;
    }
    const author = document.getElementById('inp-author')?.value || tailnetState.user || 'Field';
    try {
      const r = await fetch(`${API_ORIGIN}${PLAN_ENDPOINT_BASE}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_rev: state.base_rev,
          author,
          patch,
          note_en: currentLang === 'en' ? note : undefined,
          note_es: currentLang === 'es' ? note : undefined
        })
      });
      if (r.status === 409) {
        const cb = document.getElementById('conflict-banner');
        if (cb) cb.hidden = false;
        showToast('409 Conflict — Reload Latest Plan', 'error');
        return;
      }
      const res = await r.json();
      if (!r.ok || !res.ok) {
        showToast(res.error || `Save error (${r.status})`, 'error');
        return;
      }
      if (res.data) state = res.data;
      hasUnsyncedLocalEdits = false;
      lastSavedRevId = res.rev_id || res.base_rev;
      await checkTailnetAndLoad();
      showToast(`Saved ${lastSavedRevId}`, 'ok');
    } catch (e) {
      showToast(String(e), 'error');
    }
  }

  async function sendEodAction(revId, action) {
    const actor = document.getElementById('inp-author')?.value || tailnetState.user || 'Tisa';
    try {
      const r = await fetch(`${API_ORIGIN}${PLAN_ENDPOINT_BASE}/eod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_rev: state.base_rev, rev_id: revId, action, actor })
      });
      const res = await r.json();
      if (!r.ok || !res.ok) {
        showToast(res.error || `EOD error (${r.status})`, 'error');
        return;
      }
      await checkTailnetAndLoad();
      showToast(`${action.toUpperCase()} complete (${revId})`, 'ok');
    } catch (e) {
      showToast(String(e), 'error');
    }
  }

  function startCommentDictation(idx, textareaEl) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast(currentLang === 'es' ? 'Dictado no disponible aquí — escribe en el cuadro.' : 'Speech recognition unavailable — type directly in the card.');
      return;
    }
    const rec = new SR();
    rec.lang = currentLang === 'es' ? 'es-MX' : 'en-US';
    rec.interimResults = false;
    rec.onresult = (evt) => {
      const spoken = evt.results?.[0]?.[0]?.transcript || '';
      if (spoken && state.pins[idx]) {
        state.pins[idx].note = state.pins[idx].note ? `${state.pins[idx].note} ${spoken}` : spoken;
        textareaEl.value = state.pins[idx].note;
        renderSvg();
      }
    };
    rec.start();
  }

  async function sendCommentToAgent(idx) {
    const pin = state.pins[idx];
    if (!pin) return;
    if (violatesPrivateFirewall(pin.note)) {
      showToast(I18N[currentLang].firewall_err, 'error');
      return;
    }
    pin.status = 'sending';
    renderPinsAndEod();

    if (pin.intent === 'ask_question') {
      const allowLiveKnowledge = Boolean(params.get('intake_api')) || (window.location.hostname !== '127.0.0.1' && window.location.hostname !== 'localhost');
      if (allowLiveKnowledge) {
        try {
          const resp = await fetch(`${INTAKE_ORIGIN}/api/unit4/knowledge?q=${encodeURIComponent(pin.note)}&room=hvac`);
          if (resp.ok) {
            const data = await resp.json();
            let liveAns = data.answer || data.summary || '';
            if (!liveAns && Array.isArray(data.results) && data.results.length) {
              const r0 = data.results[0];
              const cleanEx = String(r0.excerpt || '').replace(/\s+/g, ' ').trim().slice(0, 260);
              liveAns = `${r0.title || r0.sourcePath}: ${cleanEx}`;
            }
            if (liveAns) {
              pin.answer = liveAns;
              pin.status = 'answered';
              renderPinsAndEod();
              return;
            }
          }
        } catch (_) {}
      }
      const m = computeGeometryMetrics();
      const q = (pin.note || '').toLowerCase();
      if (/pad|vibrat|isolat|platform|aislam|plataform/.test(q)) {
        pin.answer = currentLang === 'es'
          ? 'Respuesta local (Spec HVAC): Sí — NEXT incluye las gomas de aislamiento contra vibración en su alcance. John y equipo solo arman la plataforma sólida nivelada de 30" × 30"; NO comprar gomas aparte.'
          : 'Local Spec Answer (Attic HVAC): Yes — NEXT includes vibration isolation pads in their furnace install scope. Crew builds only a solid, level 30" × 30" service platform; do NOT buy vibration pads separately.';
      } else if (/feeder|80a|100a|panel|electr|gfci|tablero|aliment/.test(q)) {
        pin.answer = currentLang === 'es'
          ? `Respuesta local (Spec HVAC): Revisar el lunes 23 nov con Serge y Alex el alimentador (NEXT marca 80A #4 cobre + tablero 125A frente a nota previa de 100A). Contacto GFCI 120V actual = ${m.gfciFt} ft (máx 25 ft).`
          : `Local Spec Answer (Attic HVAC): Confirm Mon Nov 23 with Serge & Alex whether NEXT 80A (#4 Cu) feeder + 125A panel governs over the earlier 100A/onsite panel note. Live 120V GFCI distance = ${m.gfciFt} ft (max 25 ft).`;
      } else if (/walk|sheet|ply|osb|kerf|pasillo|hoja|corte/.test(q)) {
        pin.answer = currentLang === 'es'
          ? `Respuesta local (Spec HVAC): Con 66" de altura (<6 ft), el pasillo continuo de 24" máximo mide 20 ft (actual ${m.walkFt} ft) con 30" libres y 1 tira real de 24" por hoja 4×8 (corte de sierra) = ${m.sawKerfSheets} hojas.`
          : `Local Spec Answer (Attic HVAC): At 66" attic height (<6 ft), the 24" walkway caps at 20 ft max (${m.walkFt} ft current) with 30" clear passage and 1 true 24" strip per 4×8 sheet (saw kerf) = ${m.sawKerfSheets} sheets.`;
      } else {
        pin.answer = currentLang === 'es'
          ? `Respuesta local (HVAC Ático): Pasillo actual = ${m.walkFt} ft (máx 20 ft), ${m.sawKerfSheets} hojas 4×8, GFCI a ${m.gfciFt} ft (máx 25 ft), escape Tipo B ${fmtIn(m.flueClear)} (mín 1"). Conecta a Tailscale para respuesta en vivo.`
          : `Local Spec Answer (Attic HVAC): Current walkway = ${m.walkFt} ft (max 20 ft), ${m.sawKerfSheets} 4×8 sheets, GFCI at ${m.gfciFt} ft (max 25 ft), Type B clearance ${fmtIn(m.flueClear)} (min 1"). Connect to Tailscale for live Q&A.`;
      }
      pin.status = tailnetState.verified ? 'answered' : 'off_tailnet_local';
      renderPinsAndEod();
      return;
    }

    if (!tailnetState.verified) {
      pin.status = 'off_tailnet_local';
      showToast(I18N[currentLang].off_tailnet);
      renderPinsAndEod();
      return;
    }
    const parsedCmd = parseSpokenFieldCommand(pin.note);
    const patch = Object.assign(buildPatchFromForm(), parsedCmd || {}, { pin, voice_note: pin.note });
    await saveOverrideToTailnet(patch, pin.note);
    pin.status = 'sent';
    renderPinsAndEod();
  }

  function renderPinsAndEod() {
    const pl = document.getElementById('pin-list');
    const es = currentLang === 'es';
    if (pl) {
      pl.innerHTML = '';
      (state.pins || []).forEach((pin, idx) => {
        const card = document.createElement('div');
        card.className = `pin-card intent-${pin.intent || 'propose_edit'}`;

        const head = document.createElement('div');
        head.className = 'pin-card-head';
        const leftGrp = document.createElement('div');
        leftGrp.style.display = 'flex';
        leftGrp.style.alignItems = 'center';
        leftGrp.style.gap = '6px';
        const badge = document.createElement('span');
        badge.className = 'pin-num-badge';
        badge.textContent = String(idx + 1);
        const selIntent = document.createElement('select');
        selIntent.style.fontSize = '11.5px';
        selIntent.innerHTML = es
          ? `<option value="propose_edit">Modificar Plano</option><option value="ask_question">Responder Pregunta</option><option value="flag_problem">Reportar Choque</option>`
          : `<option value="propose_edit">Modify Plan</option><option value="ask_question">Answer a Question</option><option value="flag_problem">Flag Problem</option>`;
        selIntent.value = pin.intent || 'propose_edit';
        selIntent.onchange = () => { pin.intent = selIntent.value; renderSvg(); renderPinsAndEod(); };
        leftGrp.appendChild(badge);
        leftGrp.appendChild(selIntent);

        const st = document.createElement('span');
        const stMap = {
          sent: ['pill-pass', es ? 'Enviado' : 'Sent to Agent'],
          answered: ['pill-info', es ? 'Respondido' : 'Answered'],
          sending: ['pill-warn', es ? 'Enviando…' : 'Sending…'],
          off_tailnet_local: ['pill-neutral', es ? 'Solo Local (Sin Tailnet)' : 'Off-Tailnet Preview']
        };
        const pair = stMap[pin.status] || ['pill-neutral', es ? 'Borrador' : 'Draft Local'];
        st.className = `pill ${pair[0]}`;
        st.textContent = pair[1];
        head.appendChild(leftGrp);
        head.appendChild(st);

        const ta = document.createElement('textarea');
        ta.value = pin.note || '';
        ta.oninput = () => { pin.note = ta.value; renderSvg(); };

        const acts = document.createElement('div');
        acts.className = 'pin-card-actions';
        const bMic = document.createElement('button');
        bMic.type = 'button';
        bMic.className = 'btn btn-sm';
        bMic.textContent = es ? 'Dictar' : 'Mic Dictate';
        bMic.onclick = () => startCommentDictation(idx, ta);

        const bSend = document.createElement('button');
        bSend.type = 'button';
        bSend.className = 'btn btn-sm btn-primary';
        bSend.textContent = es ? 'Enviar al Agente' : 'Send to Agent';
        bSend.onclick = () => sendCommentToAgent(idx);

        acts.appendChild(bMic);
        acts.appendChild(bSend);
        card.appendChild(head);
        card.appendChild(ta);
        card.appendChild(acts);

        if (pin.answer) {
          const ans = document.createElement('div');
          ans.className = 'pin-answer';
          ans.textContent = pin.answer;
          card.appendChild(ans);
        }
        pl.appendChild(card);
      });
    }
    const cnt = document.getElementById('eod-count-pill');
    const list = tailnetState.pendingEod || [];
    if (cnt) cnt.textContent = `${list.length} pending`;
    const el = document.getElementById('eod-list');
    if (el) {
      el.innerHTML = '';
      list.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'eod-item';
        const head = document.createElement('div');
        head.className = 'eod-item-head';
        head.textContent = `${item.rev_id || ''} · ${item.author || ''}`;
        const acts = document.createElement('div');
        acts.className = 'eod-item-actions';
        const bAcc = document.createElement('button');
        bAcc.type = 'button'; bAcc.className = 'btn btn-sm btn-essex';
        bAcc.textContent = currentLang === 'es' ? 'Aceptar' : 'Accept';
        bAcc.onclick = () => sendEodAction(item.rev_id, 'accept');
        const bRej = document.createElement('button');
        bRej.type = 'button'; bRej.className = 'btn btn-sm btn-danger';
        bRej.textContent = currentLang === 'es' ? 'Rechazar / Revertir' : 'Reject';
        bRej.onclick = () => sendEodAction(item.rev_id, 'reject');
        acts.appendChild(bAcc); acts.appendChild(bRej);
        card.appendChild(head); card.appendChild(acts);
        el.appendChild(card);
      });
    }
  }

  /* ── Circle-to-Correct Sketch Canvas ──────────────────────────────── */
  function setCircleMode(on) {
    circleMode = Boolean(on);
    const cvs = document.getElementById('hvac-sketch-canvas');
    const bar = document.getElementById('circle-bar');
    const btn = document.getElementById('btn-circle-toggle');
    if (cvs) cvs.classList.toggle('drawing-active', circleMode);
    if (bar) bar.hidden = !circleMode;
    if (btn) {
      btn.classList.toggle('btn-active', circleMode);
      btn.textContent = circleMode ? I18N[currentLang].btn_circle_on : I18N[currentLang].btn_circle_off;
    }
  }

  function clearSketch() {
    const cvs = document.getElementById('hvac-sketch-canvas');
    drawPoints = [];
    pendingCircleNorm = null;
    if (cvs) {
      const ctx = cvs.getContext('2d');
      ctx?.clearRect(0, 0, cvs.width, cvs.height);
    }
    const pill = document.getElementById('sketch-status-pill');
    if (pill) pill.textContent = currentLang === 'es' ? 'Sin círculo' : 'No Circle Drawn';
  }

  function initCircleCanvas() {
    const cvs = document.getElementById('hvac-sketch-canvas');
    if (!cvs) return;
    cvs.width = 920;
    cvs.height = 1120;
    const ctx = cvs.getContext('2d');

    function getCanvasPt(evt) {
      const rect = cvs.getBoundingClientRect();
      return {
        x: ((evt.clientX - rect.left) / rect.width) * cvs.width,
        y: ((evt.clientY - rect.top) / rect.height) * cvs.height
      };
    }

    cvs.addEventListener('pointerdown', (e) => {
      if (!circleMode) return;
      isSketching = true;
      drawPoints = [getCanvasPt(e)];
      try { cvs.setPointerCapture(e.pointerId); } catch (_) {}
    });
    cvs.addEventListener('pointermove', (e) => {
      if (!circleMode || !isSketching) return;
      const p = getCanvasPt(e);
      drawPoints.push(p);
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      drawPoints.forEach((pt, idx) => (idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.stroke();
    });
    cvs.addEventListener('pointerup', () => {
      if (!circleMode || !isSketching) return;
      isSketching = false;
      if (drawPoints.length > 2) {
        let minX = 920, minY = 1120, maxX = 0, maxY = 0;
        drawPoints.forEach((pt) => {
          if (pt.x < minX) minX = pt.x; if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y; if (pt.y > maxY) maxY = pt.y;
        });
        pendingCircleNorm = {
          cx: (minX + maxX) / 2 / 920,
          cy: (minY + maxY) / 2 / 1120,
          rx: Math.max(0.02, (maxX - minX) / 2 / 920),
          ry: Math.max(0.02, (maxY - minY) / 2 / 1120)
        };
        const pill = document.getElementById('sketch-status-pill');
        if (pill) pill.textContent = currentLang === 'es' ? 'Círculo listo' : 'Circle Captured';
      }
    });
  }

  /* ── Voice Dictation ──────────────────────────────────────────────── */
  function toggleVoiceDictation() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast(currentLang === 'es' ? 'Dictado no disponible aquí — escribe tu nota.' : 'Speech recognition unavailable here — type note below.');
      return;
    }
    if (isDictating && recognition) {
      recognition.stop();
      return;
    }
    recognition = new SR();
    recognition.lang = currentLang === 'es' ? 'es-MX' : 'en-US';
    recognition.interimResults = false;
    isDictating = true;
    applyLocalization();
    recognition.onresult = (evt) => {
      const transcript = evt.results?.[0]?.[0]?.transcript || '';
      const box = document.getElementById('inp-voice-note');
      if (box) box.value = box.value ? `${box.value} ${transcript}` : transcript;
    };
    recognition.onend = () => { isDictating = false; applyLocalization(); };
    recognition.onerror = () => { isDictating = false; applyLocalization(); };
    recognition.start();
  }

  /* ── Wire Controls & Export ───────────────────────────────────────── */
  function wireControls() {
    document.getElementById('btn-lang')?.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'es' : 'en';
      document.querySelectorAll('.boundary-select').forEach((s) => { s.innerHTML = ''; });
      syncFormFromState();
      renderAll();
    });

    document.getElementById('btn-circle-toggle')?.addEventListener('click', () => setCircleMode(!circleMode));
    document.getElementById('btn-circle-done')?.addEventListener('click', () => setCircleMode(false));
    document.getElementById('btn-clear-sketch')?.addEventListener('click', clearSketch);

    ['furnace', 'walkway', 'ducts', 'mep', 'trim'].forEach((k) => {
      document.getElementById(`lyr-${k}`)?.addEventListener('change', (e) => {
        layers[k] = Boolean(e.target.checked);
        renderSvg();
      });
    });

    document.querySelectorAll('.view-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeView = btn.getAttribute('data-view') || 'all';
        document.querySelectorAll('.view-tab').forEach((b) => b.classList.toggle('active', b === btn));
        renderSvg();
      });
    });

    /* Live reaction on input change */
    const liveIds = ['inp-furnace-x', 'inp-furnace-y', 'inp-attic-h', 'inp-flue-clear', 'inp-hatch-x', 'inp-hatch-y',
      'sel-platform-side', 'sel-hatch-dir', 'sel-roof-route', 'sel-gfci-mode', 'inp-waste-pct', 'sel-walkway-mat'];
    liveIds.forEach((id) => {
      document.getElementById(id)?.addEventListener('change', () => applyPatchToLocalState(buildPatchFromForm()));
    });

    document.getElementById('btn-apply-local')?.addEventListener('click', () => {
      applyPatchToLocalState(buildPatchFromForm());
      showToast(computeRevisionStamp(), 'ok');
    });

    document.getElementById('btn-save-tailnet')?.addEventListener('click', async () => {
      const note = document.getElementById('inp-voice-note')?.value?.trim() || '';
      await saveOverrideToTailnet(buildPatchFromForm(), note);
    });

    document.getElementById('btn-export-svg')?.addEventListener('click', () => {
      const svg = document.getElementById('hvac-svg');
      if (!svg) return;
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `unit4-hvac-layout-${currentLang}.svg`;
      a.click();
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `hvac-layout-plan-data-${currentLang}.json`;
      a.click();
    });

    document.getElementById('btn-download-pdf')?.addEventListener('click', () => {
      if (window.U4KS4PdfExport && typeof window.U4KS4PdfExport.exportPdf === 'function') {
        window.U4KS4PdfExport.exportPdf();
      } else {
        window.print();
      }
    });

    /* Presets */
    document.getElementById('preset-baseline')?.addEventListener('click', () => {
      state = deepClone(BASELINE_HVAC_DATA);
      hasUnsyncedLocalEdits = false;
      syncFormFromState();
      renderAll();
    });
    document.getElementById('btn-reset-baseline')?.addEventListener('click', () => {
      state = deepClone(BASELINE_HVAC_DATA);
      hasUnsyncedLocalEdits = false;
      lastSavedRevId = null;
      clearSketch();
      syncFormFromState();
      renderAll();
    });
    document.getElementById('preset-fail-walkway')?.addEventListener('click', () => {
      applyPatchToLocalState({
        dimensions: {
          furnace_x_in: { value: 420, measure_boundary: 'wall_to_wall', verified: 'WHAT_IF_TEST' },
          furnace_y_in: { value: 215, measure_boundary: 'wall_to_wall', verified: 'WHAT_IF_TEST' }
        }
      });
    });
    document.getElementById('preset-fail-clash')?.addEventListener('click', () => {
      applyPatchToLocalState({
        dimensions: {
          furnace_x_in: { value: 235, measure_boundary: 'wall_to_wall', verified: 'WHAT_IF_TEST' },
          furnace_y_in: { value: 45, measure_boundary: 'wall_to_wall', verified: 'WHAT_IF_TEST' },
          supply2_x_in: { value: 145, measure_boundary: 'wall_to_wall', verified: 'WHAT_IF_TEST' },
          supply2_y_in: { value: 90, measure_boundary: 'wall_to_wall', verified: 'WHAT_IF_TEST' }
        }
      });
    });
    document.getElementById('preset-fail-gfci')?.addEventListener('click', () => {
      applyPatchToLocalState({
        options: { gfci_mode: 'custom_drag' },
        dimensions: {
          gfci_x_in: { value: 495, measure_boundary: 'subfloor', verified: 'WHAT_IF_TEST' },
          gfci_y_in: { value: 270, measure_boundary: 'subfloor', verified: 'WHAT_IF_TEST' }
        }
      });
    });

    document.getElementById('btn-dictate')?.addEventListener('click', toggleVoiceDictation);
    document.getElementById('btn-refresh-eod')?.addEventListener('click', checkTailnetAndLoad);
    document.getElementById('btn-reload-latest')?.addEventListener('click', () => {
      const cb = document.getElementById('conflict-banner');
      if (cb) cb.hidden = true;
      checkTailnetAndLoad();
    });

    document.getElementById('btn-apply-note')?.addEventListener('click', async () => {
      const box = document.getElementById('inp-voice-note');
      const note = (box?.value || '').trim();
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
      const cmd = parseSpokenFieldCommand(note);
      const patch = cmd ? deepClone(cmd) : {};
      const pt = pendingCircleNorm || { cx: 0.42, cy: 0.35, rx: 0.03, ry: 0.03 };
      patch.pin = {
        cx: Number(pt.cx.toFixed(4)), cy: Number(pt.cy.toFixed(4)),
        rx: Number(pt.rx.toFixed(4)), ry: Number(pt.ry.toFixed(4)),
        intent, author,
        note: note || (currentLang === 'es' ? 'Punto marcado en plano HVAC' : 'Circled spot on HVAC plan'),
        status: 'draft',
        created_at: new Date().toISOString()
      };
      if (note) patch.voice_note = note;
      applyPatchToLocalState(patch);
      if (box) box.value = '';
      clearSketch();
      setCircleMode(false);
      showToast(currentLang === 'es' ? 'Comentario adjunto con guía en el plano' : 'Attached comment card + SVG leader added', 'ok');
    });
  }

  /* ── Unified Public Integration Contract (window.U4PLAN) ────────────── */
  window.U4PLAN = {
    planId: 'hvac-layout',
    getSvgElement() { return document.getElementById('hvac-svg'); },
    getState() { return deepClone(state); },
    getLang() { return currentLang; },
    getRevisionStamp() { return computeRevisionStamp(); },
    getAnnotationDataUrl() {
      const cvs = document.getElementById('hvac-sketch-canvas');
      if (!cvs || !drawPoints.length) return null;
      try { return cvs.toDataURL('image/png'); } catch (_) { return null; }
    },
    setLang(lang) {
      if (lang === 'en' || lang === 'es') {
        currentLang = lang;
        document.querySelectorAll('.boundary-select').forEach((s) => { s.innerHTML = ''; });
        syncFormFromState();
        renderAll();
      }
    },
    applyLocalPatch(patch) { applyPatchToLocalState(patch); },
    render() { renderAll(); }
  };

  async function boot() {
    if (params.get('print') === '1') document.body.classList.add('print-mode');
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
