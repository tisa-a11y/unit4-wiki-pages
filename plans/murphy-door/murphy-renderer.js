/* Unit 4 Murphy Bookcase Door (Middle Hall Doorway B -> Laundry Closet)
 * Module 4 — laundry/interactive-pilot/murphy-renderer.js
 *
 * Integration contract on window.U4PLAN:
 *   - planId: "murphy-door"
 *   - getSvgElement(), getState(), getLang(), getRevisionStamp(), getAnnotationDataUrl(), setLang(), render()
 *
 * Invariants:
 *   - Coupled multi-wall true scale (scaleX === scaleY) across Hallway Elevation, Floor Plan + 90° Swing, and Closet Interior + Louvers.
 *   - Hard hold until all 9 B7:B15 measurements entered & cardboard swing mockup passes.
 *   - Never use Bathroom Doorway A readings (27-1/4" × 79-3/8").
 *   - Dashed provisional outlines ("Measure on site — proportion provisional") whenever B7:B15 is null.
 *   - Attached SVG leader-line comment callouts with per-comment Mic Dictation and per-comment "Send to Agent".
 */

(function () {
  'use strict';

  const DEFAULT_API_ORIGIN = 'https://mac-mini.tailcf4007.ts.net:8444';
  const LIVE_INTAKE_ORIGIN = 'https://mac-mini.tailcf4007.ts.net';
  const PLAN_ENDPOINT_BASE = '/api/unit4/plans/murphy-door';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const BASELINE_MURPHY_DATA = {
    schema_version: '1.0.0',
    project: '1231 11th Avenue Unit 4, San Francisco, CA',
    room_id: 'laundry',
    element_id: 'MURPHY-DOOR-B',
    title_en: 'Unit 4 Murphy Bookcase Door — Hallway Doorway B',
    title_es: 'Puerta Librero Murphy — Puerta Central B del Pasillo',
    governing_spec: 'laundry/SPEC.md',
    base_rev: 'rev-20261120-murphy-001',
    status: 'HOLD_UNTIL_9_POINT_FIELD_MEASUREMENTS',
    orientation: {
      north_angle_deg: 0,
      viewing_from: 'Hallway facing North toward middle Doorway B (Left West: Bathroom Door A; Right East: Bedroom C)'
    },
    nine_point_measurements_b7_b15: {
      floor_finished: 'unknown',
      b7_top_width_in: { value: null, provisional_magicplan: 28.4375, measure_boundary: 'clear_between_casings', verified: 'MEASURE_ON_SITE' },
      b8_mid_width_in: { value: null, provisional_magicplan: 28.4375, measure_boundary: 'clear_between_casings', verified: 'MEASURE_ON_SITE' },
      b9_bot_width_in: { value: null, provisional_magicplan: 28.4375, measure_boundary: 'clear_between_casings', verified: 'MEASURE_ON_SITE' },
      b10_left_height_in: { value: null, provisional_magicplan: 80.4375, measure_boundary: 'aff', verified: 'MEASURE_ON_SITE' },
      b11_center_height_in: { value: null, provisional_magicplan: 80.4375, measure_boundary: 'aff', verified: 'MEASURE_ON_SITE' },
      b12_right_height_in: { value: null, provisional_magicplan: 80.4375, measure_boundary: 'aff', verified: 'MEASURE_ON_SITE' },
      b13_diagonal_a_in: { value: null, measure_boundary: 'clear_between_casings', verified: 'MEASURE_ON_SITE' },
      b14_diagonal_b_in: { value: null, measure_boundary: 'clear_between_casings', verified: 'MEASURE_ON_SITE' },
      b15_jamb_depth_j_in: { value: null, measure_boundary: 'wall_to_wall', verified: 'MEASURE_ON_SITE' }
    },
    case_and_hardware_parameters: {
      case_depth_d_in: 8.25,
      hinge_side_gap_gl_in: 0.25,
      free_side_gap_gr_in: 1.0,
      hinge_stack_total_ah_in: 2.375,
      hall_clear_width_in: 41.25,
      closet_width_in: 36.3125,
      closet_depth_in: 82.625,
      v1_net_sq_in: 48,
      v1_height_in: 72.5,
      v2_net_sq_in: 52,
      v2_top_in: 7.0,
      waste_pct: 10
    },
    existing_original_trim: {
      baseline_en: 'Existing original woodwork stays untouched: hallway crown molding (~121-1/2" ceiling), Door A/B/C casings, and hallway baseboards. Paint-grade bookcase finished in Chantilly Lace OC-65.',
      baseline_es: 'Conservar intactas molduras originales: corona del pasillo (~121-1/2" techo), marcos de puertas A/B/C y zoclos. El librero va en Chantilly Lace OC-65.'
    },
    flagged_clashes: [
      {
        id: 'clash-murphy-pocket-deferred',
        severity: 'MEDIUM',
        en: 'Wall A–B Framing Check: Nov 19 update deferred the 28" bathroom pocket door for a hinged door. Verify actual inside Wall A–B studs/cavity on site before fastening pivot blocking.',
        es: 'Revisión muro A–B: la puerta corrediza de baño del 19 nov quedó EN PAUSA por puerta abatible. Verificar bastidor real del muro A–B antes de atornillar pivote.'
      },
      {
        id: 'clash-murphy-unmeasured',
        severity: 'HIGH',
        en: 'All 9 Doorway B inside-jamb readings and kit hinge stacks stay UNMEASURED. Zero cutting or drilling until measured and full-size cardboard swing mockup passes.',
        es: 'Las 9 medidas del vano B y grosor de bisagras siguen SIN MEDIR. Cero cortes ni barrenos hasta medir y aprobar la plantilla de cartón a tamaño real.'
      }
    ],
    field_overrides: [],
    pins: []
  };

  const FIREWALL_RE = /(\$\s*\d|\bUSD\b|\bdollars?\b|\bpesos\b|\bprices?\b|\bcosts?\b|\bbids?\b|\bestimate\s*#?\s*\d+|\b51[5]3[-.]?\d*\b|\bgo[g]reen\b|\bcal[c]oast\b|\bfinan[c]|\border\s*#\s*[a-z0-9-]+|mail\.google\.com|\bEIN\b\s*[:#]?\s*\d|\b\d{2}-\d{7}\b)/i;

  const I18N = {
    en: {
      hdr_title: 'Murphy Bookcase Door — Middle Hallway to Laundry Closet',
      hdr_sub: 'Middle Hall Doorway to Laundry Closet · Left Pivot Out-Swing · Zero Prices / Order #',
      btn_lang: 'Español (MX)',
      btn_circle_on: 'Exit Circle Mode',
      btn_circle_off: 'Circle-to-Correct',
      btn_svg: 'Export SVG',
      btn_pdf: 'Download / Print PDF',
      hold_banner: '<strong>HARD HOLD — DO NOT CUT WOOD OR DRILL PIVOTS:</strong> All 9 inside-jamb measurements (excluding outside trim), actual kit hinge thicknesses, and a full-size cardboard swing mockup are required before cutting. <strong>NEVER use Bathroom Doorway A measurements (27-1/4" × 79-3/8").</strong>',
      svg_title: 'Coupled Hallway, Plan & Laundry Closet Views (True Uniform Scale)',
      lyr_trim: 'Original Trim (Keep)',
      lyr_case: 'Bookcase & Shelves',
      lyr_swing: '90° Swing & WashTower',
      lyr_vents: 'Vents & Clashes',
      tab_all: 'All Coupled Views',
      tab_hall: 'Hallway Elevation (Facing North)',
      tab_plan: 'Floor Plan & 90° Swing',
      tab_closet: 'Closet Interior & Louver Vents',
      photo_title: 'Hallway Site Photo & Visual Goal',
      photo_badge_hold: 'DO NOT CUT YET',
      photo_badge_ready: '9/9 ENTERED · MOCKUP NEXT',
      concept_disc: 'Concept reference only — not to scale',
      clashes_title: 'Flagged Clashes & Field Holds (Never Auto-Resolved)',
      takeoff_title: 'Live Proposed Materials Takeoff & Existing Original Trim',
      takeoff_notice: 'PROPOSED QUANTITIES ONLY — ZERO PRICES, ZERO ORDER NUMBERS. Verify onsite hardware kit delivery and 9-point measurements before buying or cutting plywood.',
      marks_title: 'Live 9-Point Doorway Summary, Case Cut Size & Louver Vent Checks',
      editor_title: 'Interactive 9-Point Doorway & Louver Worksheet',
      voice_title: 'Circle-to-Correct & Voice Field Note',
      eod_title: 'End-of-Day Review & Revert (Tisa)',
      dictate: 'Dictate Voice Note',
      dictate_stop: 'Listening… Tap to Stop',
      firewall_err: 'Blocked by privacy guard: keep prices, bids, lender terms, and order numbers in Private records only.',
      synced_label: 'Synced to Murphy Baseline',
      local_preview: 'Not Yet Synced (Local Preview)',
      pending_eod: 'Field Update · Pending EOD Review',
      off_tailnet: 'Read-Only / Local Export (Off Tailnet)',
      on_tailnet: 'Tailnet Connected',
      save_live: 'Save Live to Tailnet',
      apply_local: 'Apply Live Preview',
      reset: 'Reset'
    },
    es: {
      hdr_title: 'Puerta Librero Murphy — Pasillo Central a Lavandería',
      hdr_sub: 'Entrada Central al Clóset de Lavandería · Giro Izquierdo hacia Afuera · Sin Precios / Orden',
      btn_lang: 'English (US)',
      btn_circle_on: 'Salir de Círculo',
      btn_circle_off: 'Encerrar / Corregir',
      btn_svg: 'Exportar SVG',
      btn_pdf: 'Descargar / Imprimir PDF',
      hold_banner: '<strong>ALTO OBLIGATORIO — NO CORTAR NI BARRENAR TODAVÍA:</strong> Se requieren las 9 medidas por dentro del marco (sin moldura exterior), grosor real de bisagras del kit y prueba en cartón a tamaño real. <strong>NUNCA usar medidas de Puerta A del Baño (27-1/4" × 79-3/8").</strong>',
      svg_title: 'Vistas Acopladas: Pasillo, Planta y Clóset (Escala Real Uniforme)',
      lyr_trim: 'Molduras Originales (Cuidar)',
      lyr_case: 'Librero y Repisas',
      lyr_swing: 'Giro 90° y Lavasecadora',
      lyr_vents: 'Rejillas y Choques',
      tab_all: 'Todas las Vistas',
      tab_hall: 'Elevación Pasillo (al Norte)',
      tab_plan: 'Planta y Giro 90°',
      tab_closet: 'Interior Clóset y Rejillas',
      photo_title: 'Foto Real del Pasillo y Meta Visual',
      photo_badge_hold: 'NO CORTAR AÚN',
      photo_badge_ready: '9/9 LISTAS · FALTA PLANTILLA',
      concept_disc: 'Solo referencia visual — sin escala',
      clashes_title: 'Choques y Retenciones en Sitio (Nunca Se Ocultan)',
      takeoff_title: 'Cálculo Vivo de Materiales y Molduras Originales',
      takeoff_notice: 'SOLO CANTIDADES PROPUESTAS — CERO PRECIOS NI NÚMEROS DE ORDEN. Verificar kit y 9 medidas antes de cortar triplay.',
      marks_title: 'Resumen 9 Puntos, Medida de Corte del Librero y Ventilación',
      editor_title: 'Hoja Interactiva de 9 Medidas y Rejillas',
      voice_title: 'Encerrar para Corregir y Nota por Voz',
      eod_title: 'Revisión de Fin de Día (Tisa)',
      dictate: 'Dictar Nota por Voz',
      dictate_stop: 'Escuchando… Tocar para Parar',
      firewall_err: 'Bloqueado por privacidad: nunca incluir precios, presupuestos ni números de orden.',
      synced_label: 'Sincronizado con Base Murphy',
      local_preview: 'Sin Sincronizar (Vista Local)',
      pending_eod: 'Actualización en Sitio · Pendiente EOD',
      off_tailnet: 'Solo Lectura / Exportar Local (Fuera de Tailnet)',
      on_tailnet: 'Conectado a Tailnet',
      save_live: 'Guardar en Tailnet',
      apply_local: 'Aplicar Vista Previa',
      reset: 'Restaurar'
    }
  };

  const params = new URLSearchParams(window.location.search);
  const API_ORIGIN = (params.get('api') || DEFAULT_API_ORIGIN).replace(/\/+$/, '');
  const INTAKE_ORIGIN = (params.get('intake_api') || LIVE_INTAKE_ORIGIN).replace(/\/+$/, '');

  let state = deepClone(BASELINE_MURPHY_DATA);
  let currentLang = params.get('lang') === 'es' ? 'es' : 'en';
  let activeView = 'all';
  let layers = { trim: true, case: true, swing: true, vents: true };
  let tailnetState = { checked: false, verified: false, user: null, pendingEod: [] };
  let hasUnsyncedLocalEdits = false;
  let lastSavedRevId = null;

  let circleMode = false;
  let isSketching = false;
  let drawPoints = [];
  let pendingCircleNorm = null;
  let recognition = null;
  let isDictating = false;

  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function violatesPrivateFirewall(s) { return typeof s === 'string' && FIREWALL_RE.test(s); }

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
    if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    if (parent) parent.appendChild(el);
    return el;
  }

  /* ── 9-Point Doorway, Case Cut & LG Louver Calculations ────────────── */
  function computeMurphyMetrics() {
    const pts = state.nine_point_measurements_b7_b15 || {};
    const cfg = state.case_and_hardware_parameters || {};
    const getVal = (k, minV, maxV) => {
      const v = pts[k] && typeof pts[k].value === 'number' ? pts[k].value : null;
      if (v === null || Number.isNaN(v) || v <= 0) return null;
      if (minV !== undefined && (v < minV || v > maxV)) return null;
      return v;
    };

    const b7 = getVal('b7_top_width_in', 18, 48);
    const b8 = getVal('b8_mid_width_in', 18, 48);
    const b9 = getVal('b9_bot_width_in', 18, 48);
    const b10 = getVal('b10_left_height_in', 60, 96);
    const b11 = getVal('b11_center_height_in', 60, 96);
    const b12 = getVal('b12_right_height_in', 60, 96);
    const b13 = getVal('b13_diagonal_a_in', 60, 110);
    const b14 = getVal('b14_diagonal_b_in', 60, 110);
    const b15 = getVal('b15_jamb_depth_j_in', 2, 12);

    const measuredCount = [b7, b8, b9, b10, b11, b12, b13, b14, b15].filter((v) => v !== null).length;
    const allMeasured = measuredCount === 9;

    const wProv = 28.4375;
    const hProv = 80.4375;
    const jProv = 4.75;

    const wList = [b7, b8, b9].filter((v) => v !== null);
    const hList = [b10, b11, b12].filter((v) => v !== null);
    const wMin = wList.length ? Math.min(...wList) : wProv;
    const hMin = hList.length ? Math.min(...hList) : hProv;
    const wProvisional = wList.length < 3;
    const hProvisional = hList.length < 3;
    const jDepth = b15 !== null ? b15 : jProv;
    const jProvisional = b15 === null;

    const gL = Number(cfg.hinge_side_gap_gl_in ?? 0.25);
    const gR = Number(cfg.free_side_gap_gr_in ?? 1.0);
    const ah = Number(cfg.hinge_stack_total_ah_in ?? 2.375);
    const caseD = Number(cfg.case_depth_d_in ?? 8.25);
    const usableShelfD = Number((caseD - 1.0625).toFixed(4));

    const wc = Number((wMin - gL - gR).toFixed(4));
    const hc = Number((hMin - ah).toFixed(4));

    const sqDiff = (b13 !== null && b14 !== null) ? Number(Math.abs(b13 - b14).toFixed(4)) : null;
    const sqPass = sqDiff !== null ? sqDiff <= 0.125 : null;

    /* Detect accidental Bathroom Doorway A (27.25" x 79.375") entry */
    const nearBathW = wList.some((w) => w <= 27.6);
    const nearBathH = hList.some((h) => h <= 79.6);
    const bathDoorConfusion = nearBathW || nearBathH;

    /* Hallway & Closet clearances */
    const hallClearW = Number(cfg.hall_clear_width_in ?? 41.25);
    const swingSweepIn = Number((wc + 0.5).toFixed(2)); /* approx front swing clearance into 41.25" hall */
    const hallPassThroughAfterSwing = Number((hallClearW - wc).toFixed(2));

    const closetW = Number(cfg.closet_width_in ?? 36.3125);
    const closetD = Number(cfg.closet_depth_in ?? 82.625);
    const washW = 27.0;
    const washD = 30.375;
    const washH = 74.375;
    const washSideEach = Number(((closetW - washW) / 2).toFixed(3));
    const washSidePass = washSideEach >= 1.0;

    /* Louver vents */
    const v1Area = Number(cfg.v1_net_sq_in ?? 48);
    const v1Height = Number(cfg.v1_height_in ?? 72.5);
    const v2Area = Number(cfg.v2_net_sq_in ?? 52);
    const v2Top = Number(cfg.v2_top_in ?? 7.0);
    const totalVentNet = Number((v1Area + v2Area).toFixed(1));
    const v1Pass = v1Area >= 48 && v1Height >= 72;
    const v2Pass = v2Area >= 24 && v2Top <= 12;
    const totalVentPass = v1Pass && v2Pass && totalVentNet >= 100;

    return {
      b7, b8, b9, b10, b11, b12, b13, b14, b15,
      measuredCount, allMeasured,
      wMin, hMin, wProvisional, hProvisional, jDepth, jProvisional,
      gL, gR, ah, caseD, usableShelfD, wc, hc,
      sqDiff, sqPass, bathDoorConfusion,
      hallClearW, swingSweepIn, hallPassThroughAfterSwing,
      closetW, closetD, washW, washD, washH, washSideEach, washSidePass,
      v1Area, v1Height, v2Area, v2Top, totalVentNet, v1Pass, v2Pass, totalVentPass,
      floorStatus: pts.floor_finished || 'unknown'
    };
  }

  /* ── Render Coupled Multi-Wall SVG (scaleX === scaleY) ────────────── */
  function renderSvg() {
    const svg = document.getElementById('murphy-svg');
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    if (activeView === 'hall') svg.setAttribute('viewBox', '0 85 920 435');
    else if (activeView === 'plan') svg.setAttribute('viewBox', '0 520 920 315');
    else if (activeView === 'closet') svg.setAttribute('viewBox', '0 830 920 278');
    else svg.setAttribute('viewBox', '0 0 920 1120');

    const m = computeMurphyMetrics();
    const es = currentLang === 'es';

    svgEl('rect', { x: 0, y: 0, width: 920, height: 1120, fill: '#ffffff' }, svg);

    /* Top Title & Mandatory Compass Rose */
    svgEl('rect', { x: 16, y: 12, width: 888, height: 68, rx: 6, fill: '#f8fafc', stroke: '#cbd5e1', 'stroke-width': 1.5 }, svg);
    svgEl('text', { x: 30, y: 34, 'font-size': 15, 'font-weight': 800, fill: '#10202b' }, svg).textContent =
      es ? 'UNIDAD 4 — PUERTA LIBRERO MURPHY (VANO CENTRAL B · ESCALA REAL UNIFORME)'
         : 'UNIT 4 — MURPHY BOOKCASE DOOR (HALLWAY DOORWAY B · COUPLED TRUE SCALE)';
    svgEl('text', { x: 30, y: 53, 'font-size': 11, 'font-weight': 600, fill: '#4b5c69' }, svg).textContent =
      m.allMeasured
        ? (es ? `9/9 medidas ingresadas · Corte preliminar librero: ${fmtIn(m.wc)} ancho × ${fmtIn(m.hc)} alto (falta plantilla cartón)`
              : `9/9 readings entered · Case cut: ${fmtIn(m.wc)} W × ${fmtIn(m.hc)} H (confirm w/ cardboard mockup)`)
        : (es ? `RETENCIÓN ACTIVA (${m.measuredCount}/9 medidas) · Contorno punteado PROVISIONAL — ¡NO CORTAR NI BARRENAR!`
              : `HARD HOLD (${m.measuredCount}/9 measured) · Dashed outline is PROVISIONAL — DO NOT CUT OR DRILL!`);
    svgEl('text', { x: 30, y: 69, 'font-size': 10.5, 'font-weight': 700, fill: '#15539e' }, svg).textContent =
      `scaleX === scaleY · ${computeRevisionStamp()}`;

    /* N / S / E / W Compass Rose showing hallway viewer facing NORTH toward Doorway B */
    const comp = svgEl('g', { transform: 'translate(856, 46)' }, svg);
    svgEl('circle', { cx: 0, cy: 0, r: 28, fill: '#ffffff', stroke: '#94a3b8', 'stroke-width': 1.5 }, comp);
    svgEl('path', { d: 'M0,16 L-12,-14 L12,-14 Z', fill: '#15539e', 'fill-opacity': 0.16 }, comp);
    svgEl('polygon', { points: '0,-22 -4,-9 4,-9', fill: '#b91c1c' }, comp);
    svgEl('text', { x: 0, y: -23, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#b91c1c' }, comp).textContent = 'N';
    svgEl('text', { x: 0, y: 31, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: '#334155' }, comp).textContent = 'S';
    svgEl('text', { x: 25, y: 3, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: '#334155' }, comp).textContent = 'E';
    svgEl('text', { x: -25, y: 3, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: '#334155' }, comp).textContent = es ? 'O' : 'W';

    /* ── PANEL A: HALLWAY ELEVATION FACING NORTH (uniform scale 2.8 px/in) ── */
    const scA = 2.8;
    const baseFloorY = 480;
    const wallLeftX = 120;

    svgEl('rect', { x: 16, y: 90, width: 888, height: 424, rx: 6, fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 1.5 }, svg);
    svgEl('rect', { x: 16, y: 90, width: 888, height: 26, rx: 6, fill: '#eef4fb' }, svg);
    svgEl('text', { x: 30, y: 107, 'font-size': 11.5, 'font-weight': 800, fill: '#15539e' }, svg).textContent =
      es ? 'VISTA 1: ELEVACIÓN DEL PASILLO VIENDO AL NORTE · ← OESTE (Baño A) | CENTRO (Puerta B) | ESTE (Recámara C) →'
         : 'VIEW 1: HALLWAY ELEVATION FACING NORTH · ← WEST (Bathroom A) | CENTER (Murphy B) | EAST (Bedroom C) →';

    /* Floor line & 121-1/2" ceiling line */
    const ceilY = baseFloorY - 121.5 * scA;
    svgEl('line', { x1: 60, y1: baseFloorY, x2: 860, y2: baseFloorY, stroke: '#1e293b', 'stroke-width': 2.5 }, svg);
    svgEl('line', { x1: 60, y1: ceilY, x2: 860, y2: ceilY, stroke: '#334155', 'stroke-width': 2 }, svg);
    svgEl('text', { x: 850, y: ceilY - 5, 'text-anchor': 'end', 'font-size': 9.5, 'font-weight': 700, fill: '#475569' }, svg).textContent = '121-1/2" Ceiling';

    /* Existing original trim (Crown & Baseboards untouched) */
    if (layers.trim) {
      svgEl('rect', { x: 60, y: ceilY, width: 800, height: 6 * scA, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1.2 }, svg);
      svgEl('text', { x: 460, y: ceilY + 12, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 800, fill: '#2f4f42' }, svg).textContent =
        es ? 'MOLDURA CORONA ORIGINAL — CONSERVAR INTACTA' : 'ORIGINAL CROWN MOLDING — KEEP UNTOUCHED';
      svgEl('rect', { x: 60, y: baseFloorY - 8 * scA, width: 800, height: 8 * scA, fill: '#e6efe9', stroke: '#2f4f42', 'stroke-width': 1 }, svg);
    }

    /* Doorway A (Bathroom on West/left, x_in ~ 0..27.25) */
    const doorAx = wallLeftX;
    const doorAw = 27.25 * scA;
    const doorAh = 79.375 * scA;
    svgEl('rect', { x: doorAx, y: baseFloorY - doorAh, width: doorAw, height: doorAh, fill: '#f1f5f9', stroke: '#64748b', 'stroke-width': 1.8 }, svg);
    svgEl('text', { x: doorAx + doorAw / 2, y: baseFloorY - doorAh / 2 - 6, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#334155' }, svg).textContent = 'DOOR A';
    svgEl('text', { x: doorAx + doorAw / 2, y: baseFloorY - doorAh / 2 + 8, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: '#b91c1c' }, svg).textContent = '27-1/4"×79-3/8"';
    svgEl('text', { x: doorAx + doorAw / 2, y: baseFloorY - doorAh / 2 + 21, 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#b91c1c' }, svg).textContent = es ? '(NO USAR)' : '(DO NOT USE)';

    /* Wall A–B (36" bay + Pocket-door deferred immutable warning hatch!) */
    const wallABx = doorAx + doorAw + 4;
    const wallABw = 34 * scA;
    if (layers.vents) {
      svgEl('rect', {
        x: wallABx + 6, y: baseFloorY - doorAh + 12,
        width: wallABw - 12, height: doorAh - 24,
        fill: '#fef2f2', stroke: '#dc2626', 'stroke-width': 1.8, 'stroke-dasharray': '5,3'
      }, svg);
      svgEl('text', { x: wallABx + wallABw / 2, y: baseFloorY - doorAh / 2 - 4, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 800, fill: '#b91c1c' }, svg).textContent = 'WALL A–B';
      svgEl('text', { x: wallABx + wallABw / 2, y: baseFloorY - doorAh / 2 + 10, 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#991b1b' }, svg).textContent = es ? 'Corrediza PAUSA' : 'Pocket Deferred';
      svgEl('text', { x: wallABx + wallABw / 2, y: baseFloorY - doorAh / 2 + 22, 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#991b1b' }, svg).textContent = es ? 'Revisar bastidor' : 'Verify framing';
    }

    /* Doorway B (Murphy Bookcase — dynamically sized from B7:B12!) */
    const doorBx = wallABx + wallABw + 10;
    const doorBw = m.wMin * scA;
    const doorBh = m.hMin * scA;

    /* Outer casing (KEEP UNTOUCHED) */
    if (layers.trim) {
      svgEl('rect', {
        x: doorBx - 4.5 * scA, y: baseFloorY - doorBh - 4.5 * scA,
        width: doorBw + 9 * scA, height: doorBh + 4.5 * scA,
        fill: 'none', stroke: '#2f4f42', 'stroke-width': 3
      }, svg);
    }

    /* Opening boundary (dashed if provisional unmeasured, solid if 9/9 entered) */
    svgEl('rect', {
      x: doorBx, y: baseFloorY - doorBh,
      width: doorBw, height: doorBh,
      fill: '#ffffff',
      stroke: m.allMeasured ? '#15539e' : '#d97706',
      'stroke-width': 2.2,
      'stroke-dasharray': m.allMeasured ? 'none' : '6,4'
    }, svg);

    /* Bookcase carcass Wc × Hc + 4 shelves inside Doorway B */
    if (layers.case) {
      const cx = doorBx + m.gL * scA;
      const cw = m.wc * scA;
      const ch = m.hc * scA;
      const cy = baseFloorY - ch - 0.375 * scA;

      svgEl('rect', {
        x: cx, y: cy, width: cw, height: ch,
        fill: '#fdfcf8',
        stroke: m.allMeasured ? '#2f4f42' : '#b45309',
        'stroke-width': 2.2,
        'stroke-dasharray': m.allMeasured ? 'none' : '5,3'
      }, svg);

      /* 4 Shelves with 1-1/2" lips (3/4" above shelf) */
      for (let i = 1; i <= 4; i++) {
        const sy = cy + (ch / 5) * i;
        svgEl('line', { x1: cx + 2, y1: sy, x2: cx + cw - 2, y2: sy, stroke: '#8f4a16', 'stroke-width': 3 }, svg);
      }

      /* Left Pivot hinge stack & Right push latch (~40" above floor) */
      svgEl('circle', { cx: cx + 4, cy: baseFloorY - 4, r: 5, fill: '#15539e' }, svg);
      svgEl('circle', { cx: cx + cw - 3, cy: baseFloorY - 40 * scA, r: 5, fill: '#dc2626' }, svg);
      svgEl('text', { x: cx + cw / 2, y: cy + 16, 'text-anchor': 'middle', 'font-size': 7.5, 'font-weight': 800, fill: '#2f4f42' }, svg).textContent =
        `Wc=${fmtIn(m.wc)}`;
      svgEl('text', { x: cx + cw / 2, y: cy + 28, 'text-anchor': 'middle', 'font-size': 7.5, 'font-weight': 800, fill: '#15539e' }, svg).textContent =
        `Hc=${fmtIn(m.hc)}`;
    }

    /* Label for Opening B bottom / provisional flag */
    svgEl('text', { x: doorBx + doorBw / 2, y: baseFloorY + 15, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: m.allMeasured ? '#15539e' : '#b45309' }, svg).textContent =
      m.allMeasured
        ? `DOOR B (${fmtIn(m.wMin)} × ${fmtIn(m.hMin)}) [clear_between_casings]`
        : (es ? 'PUERTA B (Medir 9 puntos — provisional)' : 'DOOR B (Measure on site — provisional)');

    /* Bedroom Opening C on East/Right */
    const doorCx = doorBx + doorBw + 55;
    const doorCw = 33.25 * scA;
    svgEl('rect', { x: doorCx, y: baseFloorY - 84 * scA, width: doorCw, height: 84 * scA, fill: '#f1f5f9', stroke: '#475569', 'stroke-width': 1.8 }, svg);
    svgEl('text', { x: doorCx + doorCw / 2, y: baseFloorY - 42 * scA, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#334155' }, svg).textContent = 'DOOR C';
    svgEl('text', { x: doorCx + doorCw / 2, y: baseFloorY - 42 * scA + 14, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 600, fill: '#475569' }, svg).textContent = es ? '(Recámara)' : '(Bedroom)';

    /* Scale bar Panel A (scA = 2.8 px/in -> 24" = 67.2 px) */
    svgEl('text', { x: 645, y: 499, 'font-size': 8.5, 'font-weight': 700, fill: '#334155' }, svg).textContent = 'SCALE: 0–24"–48"';
    svgEl('rect', { x: 735, y: 491, width: 24 * scA, height: 6, fill: '#1e293b' }, svg);
    svgEl('rect', { x: 735 + 24 * scA, y: 491, width: 24 * scA, height: 6, fill: '#ffffff', stroke: '#1e293b' }, svg);

    /* ── PANEL B: COUPLED TOP-DOWN FLOOR PLAN & 90° SWING (scale = 1.85 px/in, scaleX === scaleY) ── */
    const scB = 1.85;
    svgEl('rect', { x: 16, y: 526, width: 888, height: 298, rx: 6, fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 1.5 }, svg);
    svgEl('rect', { x: 16, y: 526, width: 888, height: 26, rx: 6, fill: '#f3f7f4' }, svg);
    svgEl('text', { x: 30, y: 543, 'font-size': 11.5, 'font-weight': 800, fill: '#2f4f42' }, svg).textContent =
      es ? 'VISTA 2: PLANTA ACOPLADA — PASILLO 41-1/4", MURO A–B, GIRO 90° Y CLÓSET 36-5/16" × 82-5/8" (ESCALA UNIFORME)'
         : 'VIEW 2: COUPLED FLOOR PLAN — HALLWAY 41-1/4", WALL A–B, 90° OUT-SWING & LAUNDRY CLOSET 36-5/16" × 82-5/8"';

    const planWallY = 716;
    const planHallBotY = planWallY + m.hallClearW * scB;
    const closetLeftX = 370;
    const closetWpx = m.closetW * scB;
    const closetDpx = m.closetD * scB;

    /* Laundry Closet Box (positioned North of hallway wall) */
    svgEl('rect', {
      x: closetLeftX, y: planWallY - closetDpx,
      width: closetWpx, height: closetDpx,
      fill: '#f8fafc', stroke: '#1e293b', 'stroke-width': 2.5
    }, svg);
    svgEl('text', { x: closetLeftX + closetWpx / 2, y: planWallY - 14, 'text-anchor': 'middle', 'font-size': 8.2, 'font-weight': 800, fill: '#334155' }, svg).textContent =
      `Closet ${fmtIn(m.closetW)}×${fmtIn(m.closetD)}`;

    /* LG WKG101HVA stacked WashTower inside closet (27" W x 30-3/8" D, >=4" rear, >=1" sides) */
    if (layers.swing) {
      const ww = m.washW * scB;
      const wd = m.washD * scB;
      const wx = closetLeftX + (closetWpx - ww) / 2;
      const wy = planWallY - closetDpx + 4.5 * scB;
      svgEl('rect', { x: wx, y: wy, width: ww, height: wd, rx: 3, fill: '#cbd5e1', stroke: '#334155', 'stroke-width': 2 }, svg);
      svgEl('text', { x: wx + ww / 2, y: wy + wd / 2 - 2, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 800, fill: '#0f172a' }, svg).textContent = 'LG WKG101HVA';
      svgEl('text', { x: wx + ww / 2, y: wy + wd / 2 + 10, 'text-anchor': 'middle', 'font-size': 7.8, 'font-weight': 700, fill: '#15539e' }, svg).textContent =
        `Side: ${fmtIn(m.washSideEach)} each (≥1")`;
    }

    /* Hallway floor & South Hallway Wall (41-1/4" clear) */
    svgEl('line', { x1: 60, y1: planHallBotY, x2: 700, y2: planHallBotY, stroke: '#1e293b', 'stroke-width': 3 }, svg);
    svgEl('text', { x: 75, y: planWallY + 26, 'font-size': 9.2, 'font-weight': 700, fill: '#475569' }, svg).textContent =
      `Hallway Clear: ${fmtIn(m.hallClearW)} [clear_between_casings]`;

    /* Wall A–B Left of Doorway B + Jamb Depth J */
    const jambPx = m.jDepth * scB;
    const planDoorBx = closetLeftX + (closetWpx - m.wMin * scB) / 2;
    const planDoorBw = m.wMin * scB;

    /* Wall segments with exact Jamb Depth J */
    svgEl('rect', { x: 220, y: planWallY, width: planDoorBx - 220, height: jambPx, fill: '#e2e8f0', stroke: '#1e293b', 'stroke-width': 2 }, svg);
    svgEl('rect', { x: planDoorBx + planDoorBw, y: planWallY, width: 170, height: jambPx, fill: '#e2e8f0', stroke: '#1e293b', 'stroke-width': 2 }, svg);
    /* Wall A–B hatch */
    svgEl('rect', { x: 245, y: planWallY + 1, width: 70, height: jambPx - 2, fill: '#fecaca', stroke: '#dc2626', 'stroke-width': 1.2, 'stroke-dasharray': '3,2' }, svg);
    svgEl('text', { x: 280, y: planWallY - 5, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 800, fill: '#b91c1c' }, svg).textContent =
      es ? 'Muro A–B (Corrediza en pausa)' : 'Wall A–B (Pocket Deferred)';

    /* Bookcase Case Closed (D deep inside jamb J) + True 90° Out-Swing Arc into Hallway */
    const caseDpx = m.caseD * scB;
    const caseWpx = m.wc * scB;
    if (layers.case) {
      svgEl('rect', {
        x: planDoorBx + m.gL * scB,
        y: planWallY,
        width: caseWpx,
        height: caseDpx,
        fill: '#e6efe9',
        stroke: m.allMeasured ? '#2f4f42' : '#d97706',
        'stroke-width': 2,
        'stroke-dasharray': m.allMeasured ? 'none' : '4,3'
      }, svg);
    }
    if (layers.swing) {
      const pivX = planDoorBx + m.gL * scB;
      const pivY = planWallY + jambPx;
      /* Open 90° position swinging South into Hallway */
      svgEl('rect', {
        x: pivX, y: pivY,
        width: caseDpx, height: caseWpx,
        fill: '#e8f1fb', 'fill-opacity': 0.72, stroke: '#15539e', 'stroke-width': 1.8, 'stroke-dasharray': '4,3'
      }, svg);
      svgEl('path', {
        d: `M${pivX + caseWpx},${pivY} A${caseWpx},${caseWpx} 0 0,1 ${pivX},${pivY + caseWpx}`,
        fill: 'none', stroke: '#15539e', 'stroke-width': 2, 'stroke-dasharray': '6,4'
      }, svg);
      svgEl('text', { x: pivX + caseWpx + 12, y: pivY + 34, 'font-size': 9.5, 'font-weight': 800, fill: '#15539e' }, svg).textContent =
        es ? `Giro 90° · Quedan ${fmtIn(m.hallPassThroughAfterSwing)} libres`
           : `90° Out-Swing · ${fmtIn(m.hallPassThroughAfterSwing)} pass clear left`;
    }

    /* Callout badge on right of Panel B summarizing D & J */
    svgEl('rect', { x: 590, y: 580, width: 280, height: 112, rx: 5, fill: '#f8fafc', stroke: '#94a3b8' }, svg);
    svgEl('text', { x: 604, y: 602, 'font-size': 10, 'font-weight': 800, fill: '#10202b' }, svg).textContent =
      es ? 'Acoplamiento Planta / Sección:' : 'Coupled Plan / Case Clearances:';
    svgEl('text', { x: 604, y: 622, 'font-size': 9.5, 'font-weight': 700, fill: '#15539e' }, svg).textContent =
      `Depth D = ${fmtIn(m.caseD)} (Shelf ~${fmtIn(m.usableShelfD)})`;
    svgEl('text', { x: 604, y: 640, 'font-size': 9.5, 'font-weight': 700, fill: m.jProvisional ? '#b45309' : '#2f4f42' }, svg).textContent =
      `Jamb J = ${fmtIn(m.jDepth)} ${m.jProvisional ? '(Provisional)' : '(Measured)'}`;
    svgEl('text', { x: 604, y: 658, 'font-size': 9.5, 'font-weight': 700, fill: m.sqPass === false ? '#b91c1c' : '#2f4f42' }, svg).textContent =
      m.sqDiff === null
        ? (es ? 'Descuadre |B13–B14|: Medir diagonales' : 'Squareness |Diag A−B|: Measure on site')
        : `|Diag A−B| = ${fmtIn(m.sqDiff)} (${m.sqPass ? 'PASS ≤1/8"' : 'FAIL >1/8"!'})`;
    svgEl('text', { x: 604, y: 676, 'font-size': 9, 'font-weight': 600, fill: '#475569' }, svg).textContent =
      es ? `Escala uniforme 1.85 px/in` : 'Uniform scale 1.85 px/in';

    /* ── PANEL C: COUPLED LAUNDRY CLOSET INTERIOR ELEVATION + LOUVER VENTS (scale = 2.1 px/in) ── */
    const scC = 2.1;
    const cTopY = 836;
    const cFloorY = 1072;
    svgEl('rect', { x: 16, y: cTopY, width: 888, height: 268, rx: 6, fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 1.5 }, svg);
    svgEl('rect', { x: 16, y: cTopY, width: 888, height: 26, rx: 6, fill: '#fffdf7' }, svg);
    svgEl('text', { x: 30, y: cTopY + 17, 'font-size': 11.5, 'font-weight': 800, fill: '#8f4a16' }, svg).textContent =
      es ? 'VISTA 3: INTERIOR DEL CLÓSET VIENDO AL SUR — REJILLAS LG WKG101HVA (≥48 + ≥24 / ≥100 SQ IN) Y SEGURO INTERIOR'
         : 'VIEW 3: LAUNDRY CLOSET INTERIOR FACING SOUTH — LG WKG101HVA LOUVER VENTS (≥48 + ≥24 / ≥100 SQ IN NET) & INSIDE RELEASE';

    const intDoorW = m.wc * scC;
    const intDoorH = m.hc * scC;
    const intDoorX = 180;
    const intFloorY = cFloorY;
    svgEl('line', { x1: 60, y1: intFloorY, x2: 860, y2: intFloorY, stroke: '#1e293b', 'stroke-width': 2.5 }, svg);

    /* Ghost LG WKG101HVA silhouette behind door (74-3/8" H) */
    const lgHpx = m.washH * scC;
    svgEl('rect', {
      x: 420, y: intFloorY - lgHpx, width: m.washW * scC, height: lgHpx,
      fill: '#f1f5f9', stroke: '#94a3b8', 'stroke-width': 1.5, 'stroke-dasharray': '5,4'
    }, svg);
    svgEl('text', { x: 420 + (m.washW * scC) / 2, y: intFloorY - lgHpx / 2, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill: '#475569' }, svg).textContent = 'LG WashTower';
    svgEl('text', { x: 420 + (m.washW * scC) / 2, y: intFloorY - lgHpx / 2 + 12, 'text-anchor': 'middle', 'font-size': 8.5, fill: '#64748b' }, svg).textContent = '74-3/8" Tall';

    /* Bookcase Rear Panel Inside Closet + Upper/Lower Louver Vents */
    svgEl('rect', {
      x: intDoorX, y: intFloorY - intDoorH,
      width: intDoorW, height: intDoorH,
      fill: '#ffffff', stroke: m.allMeasured ? '#2f4f42' : '#d97706',
      'stroke-width': 2.2,
      'stroke-dasharray': m.allMeasured ? 'none' : '5,3'
    }, svg);

    if (layers.vents) {
      const v1W = Math.min(intDoorW - 8, Math.max(24, Math.sqrt(m.v1Area) * 2.5 * scC));
      const v1Y = intFloorY - m.v1Height * scC;
      svgEl('rect', {
        x: intDoorX + (intDoorW - v1W) / 2, y: v1Y - 12,
        width: v1W, height: 14,
        fill: m.v1Pass ? '#e6efe9' : '#fef2f2',
        stroke: m.v1Pass ? '#2f4f42' : '#dc2626', 'stroke-width': 1.8
      }, svg);
      svgEl('text', { x: intDoorX + intDoorW + 10, y: v1Y - 2, 'font-size': 8.6, 'font-weight': 800, fill: m.v1Pass ? '#2f4f42' : '#b91c1c' }, svg).textContent =
        `V1 Upper: ${m.v1Area} sq in @ ${fmtIn(m.v1Height)} (${m.v1Pass ? 'PASS ≥48 @ ≥72"' : 'FAIL!'})`;

      const v2W = Math.min(intDoorW - 8, Math.max(20, Math.sqrt(m.v2Area) * 2.5 * scC));
      const v2Y = intFloorY - m.v2Top * scC;
      svgEl('rect', {
        x: intDoorX + (intDoorW - v2W) / 2, y: v2Y,
        width: v2W, height: 14,
        fill: m.v2Pass ? '#e6efe9' : '#fef2f2',
        stroke: m.v2Pass ? '#2f4f42' : '#dc2626', 'stroke-width': 1.8
      }, svg);
      svgEl('text', { x: intDoorX + intDoorW + 10, y: v2Y + 10, 'font-size': 8.6, 'font-weight': 800, fill: m.v2Pass ? '#2f4f42' : '#b91c1c' }, svg).textContent =
        `V2 Lower: ${m.v2Area} sq in @ top ${fmtIn(m.v2Top)} (${m.v2Pass ? 'PASS ≥24 @ ≤12"' : 'FAIL!'})`;

      /* Total Vent Free Area Badge + Mandatory Inside Release */
      svgEl('rect', { x: 560, y: 890, width: 325, height: 74, rx: 5, fill: m.totalVentPass ? '#e6efe9' : '#fef2f2', stroke: m.totalVentPass ? '#2f4f42' : '#dc2626' }, svg);
      svgEl('text', { x: 574, y: 912, 'font-size': 10, 'font-weight': 800, fill: m.totalVentPass ? '#14532d' : '#991b1b' }, svg).textContent =
        `Total Net Vent Area: ${m.totalVentNet} sq in (${m.totalVentPass ? 'PASS ≥ 100 sq in' : 'FAIL < 100!'})`;
      svgEl('text', { x: 574, y: 932, 'font-size': 9.2, 'font-weight': 700, fill: '#15539e' }, svg).textContent =
        es ? 'Seguro Interior: OBLIGATORIO (~40" piso)'
           : 'Inside Emergency Release: REQUIRED (~40" floor)';
      svgEl('text', { x: 574, y: 950, 'font-size': 8.6, 'font-weight': 600, fill: '#475569' }, svg).textContent =
        es ? 'No encerrar sin ventilación neta para gas'
           : 'Combustion & exhaust makeup air for WashTower';

      /* Inside release handle marker on Door */
      svgEl('rect', { x: intDoorX + 8, y: intFloorY - 40 * scC - 6, width: 14, height: 12, rx: 2, fill: '#15539e' }, svg);
    }

    /* Render Attached SVG Leader-Line Callout Marks for Every Comment/Pin */
    renderSvgLeaderPins(svg);
  }

  function renderSvgLeaderPins(svg) {
    const pins = state.pins || [];
    if (!pins.length) return;
    const grp = svgEl('g', { id: 'pin-callouts-layer' }, svg);
    pins.forEach((pin, idx) => {
      const num = idx + 1;
      const cx = (pin.cx || 0.45) * 920;
      const cy = (pin.cy || 0.35) * 1120;
      const rx = (pin.rx || 0.035) * 920;
      const ry = (pin.ry || 0.028) * 1120;
      const color = pin.intent === 'flag_problem' ? '#dc2626' : pin.intent === 'ask_question' ? '#15539e' : '#2f4f42';

      /* Circle highlight on SVG */
      svgEl('ellipse', {
        cx, cy, rx, ry,
        fill: color, 'fill-opacity': 0.1,
        stroke: color, 'stroke-width': 2.5, 'stroke-dasharray': '5,3'
      }, grp);

      /* Attached leader line & callout pill */
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

  /* ── Render Status Pills, Clashes, Live Takeoff & Table ───────────── */
  function renderStatusAndLists() {
    const m = computeMurphyMetrics();
    const es = currentLang === 'es';

    const holdPill = document.getElementById('hold-count-pill');
    if (holdPill) {
      holdPill.className = `pill ${m.allMeasured ? 'pill-warn' : 'pill-fail'}`;
      holdPill.textContent = es
        ? (m.allMeasured ? '9/9 medidas — FALTA plantilla cartón' : `ALTO 9 Puntos: ${m.measuredCount}/9 (NO CORTAR)`)
        : (m.allMeasured ? '9/9 Entered — Do Cardboard Mockup' : `9-Point Hold: ${m.measuredCount}/9 Measured (HOLD)`);
    }

    const sqPill = document.getElementById('square-pill');
    if (sqPill) {
      sqPill.className = `pill ${m.sqPass === true ? 'pill-pass' : m.sqPass === false ? 'pill-fail' : 'pill-warn'}`;
      sqPill.textContent = m.sqDiff === null
        ? (es ? 'Descuadre: Medir diagonales' : 'Squareness: Measure Diagonals')
        : (m.sqPass ? `Square ≤1/8" PASS (${fmtIn(m.sqDiff)})` : `OUT OF SQUARE FAIL (${fmtIn(m.sqDiff)})`);
    }

    const casePill = document.getElementById('case-size-pill');
    if (casePill) {
      casePill.className = `pill ${m.allMeasured && !m.bathDoorConfusion ? 'pill-info' : 'pill-warn'}`;
      casePill.textContent = m.wProvisional || m.hProvisional
        ? (es ? `Librero Prov.: ${fmtIn(m.wc)}×${fmtIn(m.hc)}` : `Prov. Case: ${fmtIn(m.wc)}×${fmtIn(m.hc)}`)
        : `Case Wc×Hc: ${fmtIn(m.wc)} × ${fmtIn(m.hc)}`;
    }

    const ventPill = document.getElementById('vent-pill');
    if (ventPill) {
      ventPill.className = `pill ${m.totalVentPass ? 'pill-pass' : 'pill-fail'}`;
      ventPill.textContent = es
        ? `Rejillas LG: ${m.totalVentNet} sq in (${m.totalVentPass ? '≥100 OK' : 'FALLA'})`
        : `LG Louver Vents: ${m.totalVentNet} sq in (${m.totalVentPass ? 'PASS ≥100' : 'FAIL'})`;
    }

    const pb = document.getElementById('photo-badge');
    if (pb) {
      pb.className = `pill ${m.allMeasured ? 'pill-warn' : 'pill-fail'}`;
      pb.textContent = m.allMeasured ? I18N[currentLang].photo_badge_ready : I18N[currentLang].photo_badge_hold;
    }

    const syncEl = document.getElementById('sync-stamp-pill');
    if (syncEl) syncEl.textContent = computeRevisionStamp();

    /* Immutable + Dynamic Clashes */
    const cg = document.getElementById('clashes-grid');
    if (cg) {
      cg.innerHTML = '';
      const allClashes = [...(state.flagged_clashes || [])];
      if (m.bathDoorConfusion) {
        allClashes.unshift({
          id: 'live-bath-confusion',
          severity: 'HIGH',
          en: 'STOP: Entered readings match Bathroom Door A (~27-1/4" × 79-3/8"). Stand facing Middle Door B to Laundry Closet and re-measure!',
          es: 'ALTO: Las medidas coinciden con Puerta A del Baño (~27-1/4" × 79-3/8"). ¡Medir la Puerta Central B de Lavandería!'
        });
      }
      if (m.sqPass === false) {
        allClashes.unshift({
          id: 'live-square-fail',
          severity: 'HIGH',
          en: `Diagonal difference |B13−B14| = ${fmtIn(m.sqDiff)} (> 1/8" limit). Shim or re-square existing jamb before fabricating bookcase.`,
          es: `Descuadre |B13−B14| = ${fmtIn(m.sqDiff)} (supera 1/8"). Nivelar/escuadrar marco antes de cortar madera.`
        });
      }
      if (!m.totalVentPass) {
        allClashes.unshift({
          id: 'live-vent-fail',
          severity: 'HIGH',
          en: `LG WKG101HVA louver net free area fails (V1=${m.v1Area} @ ${m.v1Height}", V2=${m.v2Area} @ ${m.v2Top}", Total=${m.totalVentNet} sq in; need ≥48 @ ≥72", ≥24 @ ≤12", Total ≥100).`,
          es: `Ventilación insuficiente para LG WKG101HVA (Total=${m.totalVentNet} sq in; requiere ≥48 arriba @ ≥72", ≥24 abajo @ ≤12", Total ≥100 sq in).`
        });
      }
      allClashes.forEach((c) => {
        const card = document.createElement('div');
        card.className = `clash-card ${c.severity === 'MEDIUM' ? 'sev-medium' : ''}`;
        const h = document.createElement('div'); h.className = 'clash-card-head';
        const s1 = document.createElement('span');
        s1.textContent = c.id.startsWith('live-') ? (es ? 'ALERTA EN VIVO' : 'LIVE CHECK FLAG') : (es ? 'CHOQUE FIJO' : 'IMMUTABLE FLAG');
        const s2 = document.createElement('span');
        s2.className = `pill ${c.severity === 'MEDIUM' ? 'pill-warn' : 'pill-fail'}`;
        s2.textContent = c.severity;
        h.appendChild(s1); h.appendChild(s2);
        const p = document.createElement('div');
        p.textContent = es ? (c.es || c.en) : c.en;
        card.appendChild(h); card.appendChild(p);
        cg.appendChild(card);
      });
    }

    /* Live Proposed Materials Takeoff (0 prices, 0 order numbers) */
    const tg = document.getElementById('takeoff-grid');
    if (tg) {
      tg.innerHTML = '';
      const cfg = state.case_and_hardware_parameters || {};
      const waste = Math.max(0, Math.min(30, Number(cfg.waste_pct ?? 10)));
      const mult = 1 + waste / 100;

      /* Carcass net area (sq ft): 2 sides (Hc * D) + top/bottom + 4 shelves ((Wc-1.5) * D) */
      const sideSqFt = (2 * m.hc * m.caseD) / 144;
      const horizSqFt = (6 * Math.max(12, m.wc - 1.5) * m.caseD) / 144;
      const carcassNetSqFt = Number((sideSqFt + horizSqFt).toFixed(1));
      const carcassGrossSqFt = Number((carcassNetSqFt * mult).toFixed(1));
      const carcassSheets = Math.max(1, Math.ceil(carcassGrossSqFt / 32));

      const backNetSqFt = Number(((m.wc * m.hc) / 144).toFixed(1));
      const backSheets = Math.max(1, Math.ceil((backNetSqFt * mult) / 32));

      /* Poplar face frame & 1-1/2" shelf lips (LF) */
      const poplarNetLf = Number((((2 * m.hc + 2 * m.wc) + 4 * m.wc) / 12).toFixed(1));
      const poplarGrossLf = Number((poplarNetLf * mult).toFixed(1));

      const cards = [
        {
          primary: true,
          title: es ? 'Triplay 3/4" Pintable (Cuerpo)' : '3/4" Paint-Grade Plywood (Carcass)',
          big: `${carcassSheets} ${es ? 'hojas 4×8' : 'sheets 4×8'}`,
          sub: es
            ? `${carcassNetSqFt} sq ft netos → ${carcassGrossSqFt} sq ft brutos (+${waste}% merma) para lados + 4 repisas (prof. ${fmtIn(m.caseD)})`
            : `${carcassNetSqFt} sq ft net → ${carcassGrossSqFt} sq ft gross (+${waste}% waste) for sides, top/bot & 4 shelves (D=${fmtIn(m.caseD)})`
        },
        {
          primary: false,
          title: es ? 'Panel Trasero Aplicado' : 'Applied Back Panel',
          big: `${backSheets} ${es ? 'hoja 4×8' : 'sheet 4×8'}`,
          sub: es
            ? `${backNetSqFt} sq ft netos (${fmtIn(m.wc)}×${fmtIn(m.hc)}) — incluir cortes exactos para rejillas superior e inferior`
            : `${backNetSqFt} sq ft net (${fmtIn(m.wc)}×${fmtIn(m.hc)}) — cut net openings for upper & lower louvers`
        },
        {
          primary: false,
          title: es ? 'Álamo Sólido (Frente y Labios)' : 'Solid Poplar Face Frame & 1-1/2" Lips',
          big: `${poplarGrossLf} LF ${es ? 'brutos' : 'gross'}`,
          sub: es
            ? `${poplarNetLf} LF netos (+${waste}%): frente + 4 labios de 1-1/2" (3/4" arriba de cada repisa) · Chantilly Lace OC-65`
            : `${poplarNetLf} LF net (+${waste}%): face frame + 4× 1-1/2" shelf lips (3/4" up) · Chantilly Lace OC-65`
        },
        {
          primary: false,
          title: es ? 'Herrajes y Rejillas (Cantidades)' : 'Hardware & Vents (Quantities Only)',
          big: `1 Kit + 2 ${es ? 'Rejillas' : 'Louvers'}`,
          sub: es
            ? `1 kit pivote sencillo Murphy Door + 1 seguro Sugatsune ML-ZN80-BL + 1 manija interior + 2 rejillas (≥100 sq in netos)`
            : `1 Murphy Single Door Kit + 1 Sugatsune ML-ZN80-BL latch + 1 inside emergency release + 2 louver grilles (≥100 sq in net)`
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
          es ? 'Ancho Vano B7 / B8 / B9 (mínimo)' : 'Doorway B Width B7 / B8 / B9 (min)',
          `${fmtIn(m.b7)} / ${fmtIn(m.b8)} / ${fmtIn(m.b9)} → min ${m.wProvisional ? `${fmtIn(m.wMin)} prov.` : fmtIn(m.wMin)}`,
          es ? 'Dentro de marco (sin moldura exterior)' : 'Inside jambs excl. trim',
          'clear_between_casings',
          m.wProvisional ? 'MEASURE ON SITE' : (m.bathDoorConfusion ? 'BATH DOOR WARNING' : 'MEASURED'),
          m.bathDoorConfusion ? 'row-fail' : m.wProvisional ? 'row-measure' : ''
        ],
        [
          es ? 'Altura Vano B10 / B11 / B12 (mínimo)' : 'Doorway B Height B10 / B11 / B12 (min)',
          `${fmtIn(m.b10)} / ${fmtIn(m.b11)} / ${fmtIn(m.b12)} → min ${m.hProvisional ? `${fmtIn(m.hMin)} prov.` : fmtIn(m.hMin)}`,
          es ? `Desde piso terminado (${m.floorStatus})` : `From finished floor (floor=${m.floorStatus})`,
          'above_finished_floor',
          m.hProvisional ? 'MEASURE ON SITE' : 'MEASURED',
          m.hProvisional ? 'row-measure' : ''
        ],
        [
          es ? 'Diagonales B13 / B14 (Descuadre)' : 'Diagonals B13 / B14 (Out-of-Square)',
          `${fmtIn(m.b13)} vs ${fmtIn(m.b14)} (Δ ${m.sqDiff === null ? 'TBD' : fmtIn(m.sqDiff)})`,
          '≤ 1/8" max diagonal difference',
          'clear_between_casings',
          m.sqPass === null ? 'MEASURE ON SITE' : (m.sqPass ? 'PASS (≤ 1/8")' : 'FAIL (> 1/8")'),
          m.sqPass === false ? 'row-fail' : m.sqPass === null ? 'row-measure' : ''
        ],
        [
          es ? 'Profundidad Marco J (B15) y Librero D' : 'Jamb Depth J (B15) & Case Depth D',
          `J=${m.jProvisional ? `${fmtIn(m.jDepth)} prov.` : fmtIn(m.jDepth)} · D=${fmtIn(m.caseD)}`,
          `Shelf usable ~${fmtIn(m.usableShelfD)}`,
          'wall_to_wall',
          m.jProvisional ? 'MEASURE ON SITE' : 'MEASURED',
          m.jProvisional ? 'row-measure' : ''
        ],
        [
          es ? 'Corte Librero Wc × Hc' : 'Computed Case Size Wc × Hc',
          `${fmtIn(m.wc)} × ${fmtIn(m.hc)} ${!m.allMeasured ? '(PROVISIONAL)' : ''}`,
          `gL=${fmtIn(m.gL)}, gR=${fmtIn(m.gR)}, Ah=${fmtIn(m.ah)}`,
          'clear_between_casings',
          m.allMeasured ? 'VERIFY WITH CARDBOARD' : 'HARD HOLD — DO NOT CUT',
          !m.allMeasured ? 'row-fail' : ''
        ],
        [
          es ? 'Rejillas LG WKG101HVA + Claro Lavadora' : 'LG WKG101HVA Louvers & Closet Clearance',
          `V1=${m.v1Area} + V2=${m.v2Area} = ${m.totalVentNet} sq in · Side ${fmtIn(m.washSideEach)}`,
          'V1≥48 @ ≥72", V2≥24 @ ≤12", Total≥100, Side≥1"',
          'above_finished_floor',
          m.totalVentPass && m.washSidePass ? 'PASS' : 'FAIL',
          !(m.totalVentPass && m.washSidePass) ? 'row-fail' : ''
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

  /* ── Sync Form, Localization, Leader Comments, Dictation & Tailnet ──── */
  function syncFormFromState() {
    const pts = state.nine_point_measurements_b7_b15 || {};
    const cfg = state.case_and_hardware_parameters || {};
    const setNum = (id, obj) => {
      const el = document.getElementById(id);
      if (el) el.value = (obj && typeof obj.value === 'number') ? String(obj.value) : '';
    };
    setNum('inp-b7', pts.b7_top_width_in);
    setNum('inp-b8', pts.b8_mid_width_in);
    setNum('inp-b9', pts.b9_bot_width_in);
    setNum('inp-b10', pts.b10_left_height_in);
    setNum('inp-b11', pts.b11_center_height_in);
    setNum('inp-b12', pts.b12_right_height_in);
    setNum('inp-b13', pts.b13_diagonal_a_in);
    setNum('inp-b14', pts.b14_diagonal_b_in);
    setNum('inp-b15', pts.b15_jamb_depth_j_in);

    const setVal = (id, v) => { const e = document.getElementById(id); if (e && v !== undefined) e.value = String(v); };
    setVal('sel-floor-done', pts.floor_finished || 'unknown');
    setVal('sel-case-depth', cfg.case_depth_d_in ?? 8.25);
    setVal('inp-waste-pct', cfg.waste_pct ?? 10);
    setVal('inp-ah', cfg.hinge_stack_total_ah_in ?? 2.375);
    setVal('inp-v1-area', cfg.v1_net_sq_in ?? 48);
    setVal('inp-v1-h', cfg.v1_height_in ?? 72.5);
    setVal('inp-v2-area', cfg.v2_net_sq_in ?? 52);
    setVal('inp-v2-h', cfg.v2_top_in ?? 7.0);
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
    setTxt('tab-view-hall', t.tab_hall);
    setTxt('tab-view-plan', t.tab_plan);
    setTxt('tab-view-closet', t.tab_closet);
    setTxt('photo-panel-title', t.photo_title);
    setTxt('concept-disclaimer', t.concept_disc);
    setTxt('clashes-title', t.clashes_title);
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

    const mapData = { lyr_trim: t.lyr_trim, lyr_case: t.lyr_case, lyr_swing: t.lyr_swing, lyr_vents: t.lyr_vents };
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (mapData[k]) el.textContent = mapData[k];
    });
    const vl = document.getElementById('voice-lang-pill');
    if (vl) vl.textContent = currentLang === 'es' ? 'es-MX' : 'en-US';
    const es = currentLang === 'es';
    document.title = t.hdr_title;
    setTxt('nav-back-room', es ? '← Volver a Página de Lavandería' : '← Back to Laundry Closet Page');
    setTxt('nav-peer-hall', es ? 'Contexto del Pasillo →' : 'Hallway Context →');
    setTxt('th-feat', es ? 'Elemento / Fila de Hoja' : 'Item / Worksheet Row');
    setTxt('th-val', es ? 'Medida / Valor Calculado' : 'Measured / Computed Value');
    setTxt('th-rule', es ? 'Meta / Revisión de Fórmula' : 'Target / Formula Check');
    setTxt('th-bound', es ? 'Frontera de Medición' : 'Measurement Boundary');
    setTxt('th-stat', es ? 'Estado de Liberación' : 'Release Status');
    const pc = document.getElementById('photo-callouts');
    if (pc) {
      pc.innerHTML = es
        ? '<li class="callout-alert"><strong>Medir Solo Por Dentro del Marco:</strong> Párate en el pasillo viendo a Puerta B. Excluye molduras exteriores y mide dos veces al 1/16".</li>' +
          '<li><strong>Conservar Madera Original:</strong> No tocar la corona original del pasillo, marcos exteriores de puertas A/B/C ni zoclos del pasillo.</li>' +
          '<li><strong>Revisión Muro A–B:</strong> El 19 nov se pospuso la puerta corrediza del baño por abatible — revisar bastidor real de muro A–B antes de atornillar pivote.</li>' +
          '<li><strong>Rejillas WashTower y Seguro:</strong> Superior ≥ 48 sq in libres (≥ 72" arriba) + inferior ≥ 24 sq in libres (≤ 12" arriba), total ≥ 100 sq in + manija interior.</li>'
        : '<li class="callout-alert"><strong>Measure Inside Jambs Only:</strong> Stand in hallway facing Doorway B. Exclude outside casings and measure twice to nearest 1/16&quot;.</li>' +
          '<li><strong>Preserve Existing Woodwork:</strong> Keep original hallway crown molding, door casings around Doors A/B/C, and hallway baseboard untouched.</li>' +
          '<li><strong>Wall A–B Check:</strong> Nov 19 update deferred the bathroom pocket door for a hinged door — verify actual Wall A–B framing before setting pivot blocking.</li>' +
          '<li><strong>WashTower Louvers &amp; Release:</strong> Upper vent ≥ 48 sq in net (≥ 72&quot; up) + lower ≥ 24 sq in net (≤ 12&quot; up), total ≥ 100 sq in net + inside release handle.</li>';
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
    const rev = state.base_rev || 'rev-20261120-murphy-001';
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

  function buildPatchFromForm() {
    const numOrNull = (id) => {
      const el = document.getElementById(id);
      if (!el || el.value.trim() === '') return null;
      const v = Number(el.value);
      return Number.isNaN(v) ? null : v;
    };
    const b9 = {
      floor_finished: document.getElementById('sel-floor-done')?.value || 'unknown',
      b7_top_width_in: { value: numOrNull('inp-b7'), measure_boundary: 'clear_between_casings', verified: numOrNull('inp-b7') === null ? 'MEASURE_ON_SITE' : 'FIELD_VERIFIED' },
      b8_mid_width_in: { value: numOrNull('inp-b8'), measure_boundary: 'clear_between_casings', verified: numOrNull('inp-b8') === null ? 'MEASURE_ON_SITE' : 'FIELD_VERIFIED' },
      b9_bot_width_in: { value: numOrNull('inp-b9'), measure_boundary: 'clear_between_casings', verified: numOrNull('inp-b9') === null ? 'MEASURE_ON_SITE' : 'FIELD_VERIFIED' },
      b10_left_height_in: { value: numOrNull('inp-b10'), measure_boundary: 'aff', verified: numOrNull('inp-b10') === null ? 'MEASURE_ON_SITE' : 'FIELD_VERIFIED' },
      b11_center_height_in: { value: numOrNull('inp-b11'), measure_boundary: 'aff', verified: numOrNull('inp-b11') === null ? 'MEASURE_ON_SITE' : 'FIELD_VERIFIED' },
      b12_right_height_in: { value: numOrNull('inp-b12'), measure_boundary: 'aff', verified: numOrNull('inp-b12') === null ? 'MEASURE_ON_SITE' : 'FIELD_VERIFIED' },
      b13_diagonal_a_in: { value: numOrNull('inp-b13'), measure_boundary: 'clear_between_casings', verified: numOrNull('inp-b13') === null ? 'MEASURE_ON_SITE' : 'FIELD_VERIFIED' },
      b14_diagonal_b_in: { value: numOrNull('inp-b14'), measure_boundary: 'clear_between_casings', verified: numOrNull('inp-b14') === null ? 'MEASURE_ON_SITE' : 'FIELD_VERIFIED' },
      b15_jamb_depth_j_in: { value: numOrNull('inp-b15'), measure_boundary: 'wall_to_wall', verified: numOrNull('inp-b15') === null ? 'MEASURE_ON_SITE' : 'FIELD_VERIFIED' }
    };
    const cfg = {
      case_depth_d_in: Number(document.getElementById('sel-case-depth')?.value ?? 8.25),
      waste_pct: Number(document.getElementById('inp-waste-pct')?.value ?? 10),
      hinge_stack_total_ah_in: Number(document.getElementById('inp-ah')?.value ?? 2.375),
      v1_net_sq_in: Number(document.getElementById('inp-v1-area')?.value ?? 48),
      v1_height_in: Number(document.getElementById('inp-v1-h')?.value ?? 72.5),
      v2_net_sq_in: Number(document.getElementById('inp-v2-area')?.value ?? 52),
      v2_top_in: Number(document.getElementById('inp-v2-h')?.value ?? 7.0)
    };
    return { nine_point_measurements_b7_b15: b9, case_and_hardware_parameters: cfg };
  }

  function applyPatchToLocalState(patch) {
    if (!patch) return;
    if (patch.nine_point_measurements_b7_b15) {
      state.nine_point_measurements_b7_b15 = Object.assign({}, state.nine_point_measurements_b7_b15 || {}, patch.nine_point_measurements_b7_b15);
    }
    if (patch.case_and_hardware_parameters) {
      state.case_and_hardware_parameters = Object.assign({}, state.case_and_hardware_parameters || {}, patch.case_and_hardware_parameters);
    }
    if (patch.pin) {
      if (!Array.isArray(state.pins)) state.pins = [];
      state.pins.push(patch.pin);
    }
    hasUnsyncedLocalEdits = true;
    syncFormFromState();
    renderAll();
  }

  /* ── Addendum #2: Attached Comment Callouts, Per-Comment Dictation & Send to Agent ── */
  function startCommentDictation(idx, textareaEl) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast(currentLang === 'es' ? 'Dictado por voz no disponible aquí — escribe directo.' : 'Speech recognition unavailable — type directly in the card.');
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
      /* Answer a Question -> try /api/unit4/knowledge when live/allowlisted, fallback to local spec context */
      const allowLiveKnowledge = Boolean(params.get('intake_api')) || (window.location.hostname !== '127.0.0.1' && window.location.hostname !== 'localhost');
      if (allowLiveKnowledge) {
        try {
          const resp = await fetch(`${INTAKE_ORIGIN}/api/unit4/knowledge?q=${encodeURIComponent(pin.note)}&room=laundry`);
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
      /* Graceful off-tailnet or read-only local answer grounded in Murphy/Laundry spec */
      const m = computeMurphyMetrics();
      const q = (pin.note || '').toLowerCase();
      if (/louver|vent|lg|washtower|rejilla|ventil/.test(q)) {
        pin.answer = currentLang === 'es'
          ? `Respuesta local (Spec Murphy): La torre LG WKG101HVA exige rejilla superior ≥48 sq in libres (≥72" arriba), inferior ≥24 sq in libres (≤12" arriba), suma ≥100 sq in libres (actual ${m.totalVentNet} sq in), 1" lateral / 4" atrás y jaladera interior de emergencia.`
          : `Local Spec Answer (Murphy Door B): LG WKG101HVA gas WashTower requires upper louver ≥48 sq in net (≥72" up), lower ≥24 sq in net (≤12" up), total ≥100 sq in net (current: ${m.totalVentNet} sq in), 1" side & 4" rear clearances, and an inside emergency release.`;
      } else if (/bath|doorway a|27-1\/4|79-3\/8|baño|puerta a|wall a/.test(q)) {
        pin.answer = currentLang === 'es'
          ? 'Respuesta local (Spec Murphy): NUNCA usar las medidas de Puerta A del baño (27-1/4" × 79-3/8") para la Puerta B. Además la puerta corrediza del baño se pospuso el 19 nov; revisar primero el bastidor real del muro A–B antes de fijar refuerzos de pivote.'
          : 'Local Spec Answer (Murphy Door B): NEVER use Bathroom Doorway A (27-1/4" × 79-3/8") for Doorway B. Bathroom pocket door was deferred on Nov 19 — verify Wall A–B framing before placing pivot blocking.';
      } else {
        pin.answer = currentLang === 'es'
          ? `Respuesta local (Puerta Murphy B): requiere 9 medidas por dentro del marco (${m.measuredCount}/9 capturadas), confirmar muro A–B (baño en pausa) y ≥100 sq in de rejillas (actual: ${m.totalVentNet} sq in). Conecta a Tailscale para respuesta en vivo.`
          : `Local Spec Answer (Murphy Door B): requires all 9 inside-jamb measurements (${m.measuredCount}/9 entered), Wall A–B framing check (bathroom pocket door deferred), and ≥100 sq in net louver vent area (current: ${m.totalVentNet} sq in). Connect to Tailscale for live Q&A.`;
      }
      pin.status = tailnetState.verified ? 'answered' : 'off_tailnet_local';
      renderPinsAndEod();
      return;
    }

    /* Modify Plan / Flag Problem -> :8444 override when on Tailnet */
    if (!tailnetState.verified) {
      pin.status = 'off_tailnet_local';
      showToast(I18N[currentLang].off_tailnet);
      renderPinsAndEod();
      return;
    }
    const patch = Object.assign(buildPatchFromForm(), { pin, voice_note: pin.note });
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
        const card = document.createElement('div'); card.className = 'eod-item';
        const head = document.createElement('div'); head.className = 'eod-item-head';
        head.textContent = `${item.rev_id || ''} · ${item.author || ''}`;
        const acts = document.createElement('div'); acts.className = 'eod-item-actions';
        const bAcc = document.createElement('button'); bAcc.type = 'button'; bAcc.className = 'btn btn-sm btn-essex';
        bAcc.textContent = es ? 'Aceptar' : 'Accept'; bAcc.onclick = () => sendEodAction(item.rev_id, 'accept');
        const bRej = document.createElement('button'); bRej.type = 'button'; bRej.className = 'btn btn-sm btn-danger';
        bRej.textContent = es ? 'Rechazar' : 'Reject'; bRej.onclick = () => sendEodAction(item.rev_id, 'reject');
        acts.appendChild(bAcc); acts.appendChild(bRej);
        card.appendChild(head); card.appendChild(acts);
        el.appendChild(card);
      });
    }
  }

  /* ── Tailnet Persistence (/api/unit4/plans/murphy-door) ───────────── */
  function numVal(v, fallback) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (v && typeof v === 'object' && typeof v.value === 'number' && Number.isFinite(v.value)) return v.value;
    return fallback;
  }

  function mergeServerData(raw) {
    const base = deepClone(BASELINE_MURPHY_DATA);
    if (!raw || typeof raw !== 'object') return base;
    if (raw.base_rev) base.base_rev = raw.base_rev;
    if (raw.title_en) base.title_en = raw.title_en;
    if (raw.title_es) base.title_es = raw.title_es;

    if (raw.nine_point_measurements_b7_b15 && typeof raw.nine_point_measurements_b7_b15 === 'object') {
      const rp = raw.nine_point_measurements_b7_b15;
      base.nine_point_measurements_b7_b15.floor_finished = rp.floor_finished || base.nine_point_measurements_b7_b15.floor_finished || 'unknown';
      [
        'b7_top_width_in', 'b8_mid_width_in', 'b9_bot_width_in',
        'b10_left_height_in', 'b11_center_height_in', 'b12_right_height_in',
        'b13_diagonal_a_in', 'b14_diagonal_b_in', 'b15_jamb_depth_j_in'
      ].forEach((k) => {
        if (rp[k] && typeof rp[k] === 'object') {
          base.nine_point_measurements_b7_b15[k] = Object.assign({}, base.nine_point_measurements_b7_b15[k] || {}, rp[k]);
        }
      });
    }

    if (raw.case_and_hardware_parameters && typeof raw.case_and_hardware_parameters === 'object') {
      const rc = raw.case_and_hardware_parameters;
      const bc = base.case_and_hardware_parameters;
      bc.case_depth_d_in = numVal(rc.case_depth_d_in, bc.case_depth_d_in);
      bc.hinge_side_gap_gl_in = numVal(rc.hinge_side_gap_gl_in, bc.hinge_side_gap_gl_in);
      bc.free_side_gap_gr_in = numVal(rc.free_side_gap_gr_in, bc.free_side_gap_gr_in);
      bc.hinge_stack_total_ah_in = numVal(rc.hinge_stack_total_ah_in, bc.hinge_stack_total_ah_in);
      bc.hall_clear_width_in = numVal(rc.hall_clear_width_in, bc.hall_clear_width_in);
      bc.closet_width_in = numVal(rc.closet_width_in ?? rc.closet_interior_in?.width, bc.closet_width_in);
      bc.closet_depth_in = numVal(rc.closet_depth_in ?? rc.closet_interior_in?.depth, bc.closet_depth_in);
      bc.v1_net_sq_in = numVal(rc.v1_net_sq_in, bc.v1_net_sq_in);
      bc.v1_height_in = numVal(rc.v1_height_in ?? raw.appliance_and_vent_requirements?.upper_vent_v1?.planned_height_in, bc.v1_height_in);
      bc.v2_net_sq_in = numVal(rc.v2_net_sq_in, bc.v2_net_sq_in);
      bc.v2_top_in = numVal(rc.v2_top_in ?? raw.appliance_and_vent_requirements?.lower_vent_v2?.planned_top_in, bc.v2_top_in);
      bc.waste_pct = numVal(rc.waste_pct, bc.waste_pct);
    }

    if (raw.existing_original_trim && typeof raw.existing_original_trim === 'object' && raw.existing_original_trim.baseline_en) {
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
      const resp = await fetch('../murphy-door-plan-data.json', { cache: 'no-store' });
      if (resp.ok) {
        const j = await resp.json();
        state = mergeServerData(j);
      }
    } catch (_) {}
  }

  async function checkTailnetAndLoad() {
    const tb = document.getElementById('tailnet-badge');
    const saveBtn = document.getElementById('btn-save-tailnet');
    try {
      const hr = await fetch(`${API_ORIGIN}${PLAN_ENDPOINT_BASE}/health`);
      if (hr.ok) {
        const hj = await hr.json();
        tailnetState.checked = true;
        tailnetState.verified = Boolean(hj.tailnet_verified);
        tailnetState.user = hj.user || null;
        if (tailnetState.verified && saveBtn) saveBtn.disabled = false;
        const pr = await fetch(`${API_ORIGIN}${PLAN_ENDPOINT_BASE}`);
        if (pr.ok) {
          const pj = await pr.json();
          if (pj && pj.data) state = mergeServerData(pj.data);
          tailnetState.pendingEod = (pj && pj.pending_eod) || [];
        }
      } else {
        tailnetState.checked = true; tailnetState.verified = false;
      }
    } catch (_) {
      tailnetState.checked = true; tailnetState.verified = false;
    }
    if (tb && !tailnetState.verified) {
      tb.className = 'pill pill-neutral';
      tb.textContent = I18N[currentLang].off_tailnet;
    }
    syncFormFromState();
    renderAll();
  }

  async function saveOverrideToTailnet(patch, note) {
    if (violatesPrivateFirewall(JSON.stringify({ patch, note }))) {
      showToast(I18N[currentLang].firewall_err, 'error');
      return;
    }
    const author = document.getElementById('inp-author')?.value || tailnetState.user || 'Field';
    try {
      const r = await fetch(`${API_ORIGIN}${PLAN_ENDPOINT_BASE}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_rev: state.base_rev, author, patch,
          note_en: currentLang === 'en' ? note : undefined,
          note_es: currentLang === 'es' ? note : undefined
        })
      });
      if (r.status === 409) {
        const cb = document.getElementById('conflict-banner'); if (cb) cb.hidden = false;
        showToast('409 Conflict — Reload Latest Plan', 'error');
        return;
      }
      const res = await r.json();
      if (!r.ok || !res.ok) { showToast(res.error || `Save error (${r.status})`, 'error'); return; }
      if (res.data) state = res.data;
      hasUnsyncedLocalEdits = false;
      lastSavedRevId = res.rev_id || res.base_rev;
      await checkTailnetAndLoad();
      showToast(`Saved ${lastSavedRevId}`, 'ok');
    } catch (e) { showToast(String(e), 'error'); }
  }

  async function sendEodAction(revId, action) {
    const actor = document.getElementById('inp-author')?.value || tailnetState.user || 'Tisa';
    try {
      const r = await fetch(`${API_ORIGIN}${PLAN_ENDPOINT_BASE}/eod`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_rev: state.base_rev, rev_id: revId, action, actor })
      });
      const res = await r.json();
      if (!r.ok || !res.ok) { showToast(res.error || `EOD error (${r.status})`, 'error'); return; }
      await checkTailnetAndLoad();
      showToast(`${action.toUpperCase()} complete (${revId})`, 'ok');
    } catch (e) { showToast(String(e), 'error'); }
  }

  /* ── Circle Mode & Dictation ──────────────────────────────────────── */
  function setCircleMode(on) {
    circleMode = Boolean(on);
    const cvs = document.getElementById('murphy-sketch-canvas');
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
    const cvs = document.getElementById('murphy-sketch-canvas');
    drawPoints = []; pendingCircleNorm = null;
    if (cvs) cvs.getContext('2d')?.clearRect(0, 0, cvs.width, cvs.height);
    const pill = document.getElementById('sketch-status-pill');
    if (pill) pill.textContent = currentLang === 'es' ? 'Sin círculo' : 'No Circle Drawn';
  }

  function initCircleCanvas() {
    const cvs = document.getElementById('murphy-sketch-canvas');
    if (!cvs) return;
    cvs.width = 920; cvs.height = 1120;
    const ctx = cvs.getContext('2d');
    const getPt = (e) => {
      const r = cvs.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * 920, y: ((e.clientY - r.top) / r.height) * 1120 };
    };
    cvs.addEventListener('pointerdown', (e) => { if (!circleMode) return; isSketching = true; drawPoints = [getPt(e)]; });
    cvs.addEventListener('pointermove', (e) => {
      if (!circleMode || !isSketching) return;
      const p = getPt(e); drawPoints.push(p);
      ctx.clearRect(0, 0, 920, 1120); ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 4;
      ctx.beginPath(); drawPoints.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y))); ctx.stroke();
    });
    cvs.addEventListener('pointerup', () => {
      if (!circleMode || !isSketching) return; isSketching = false;
      if (drawPoints.length > 2) {
        let minX = 920, minY = 1120, maxX = 0, maxY = 0;
        drawPoints.forEach((pt) => { minX = Math.min(minX, pt.x); maxX = Math.max(maxX, pt.x); minY = Math.min(minY, pt.y); maxY = Math.max(maxY, pt.y); });
        pendingCircleNorm = { cx: (minX + maxX) / 2 / 920, cy: (minY + maxY) / 2 / 1120, rx: Math.max(0.025, (maxX - minX) / 2 / 920), ry: Math.max(0.022, (maxY - minY) / 2 / 1120) };
        const pill = document.getElementById('sketch-status-pill'); if (pill) pill.textContent = currentLang === 'es' ? 'Círculo listo' : 'Circle Captured';
      }
    });
  }

  function toggleVoiceDictation() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast(currentLang === 'es' ? 'Dictado no disponible aquí — escribe tu nota.' : 'Speech recognition unavailable — type note below.'); return; }
    if (isDictating && recognition) { recognition.stop(); return; }
    recognition = new SR(); recognition.lang = currentLang === 'es' ? 'es-MX' : 'en-US';
    isDictating = true; applyLocalization();
    recognition.onresult = (evt) => {
      const t = evt.results?.[0]?.[0]?.transcript || '';
      const box = document.getElementById('inp-voice-note');
      if (box) box.value = box.value ? `${box.value} ${t}` : t;
    };
    recognition.onend = () => { isDictating = false; applyLocalization(); };
    recognition.onerror = () => { isDictating = false; applyLocalization(); };
    recognition.start();
  }

  /* ── Controls Wiring ──────────────────────────────────────────────── */
  function wireControls() {
    document.getElementById('btn-lang')?.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'es' : 'en';
      renderAll();
    });
    document.getElementById('btn-circle-toggle')?.addEventListener('click', () => setCircleMode(!circleMode));
    document.getElementById('btn-circle-done')?.addEventListener('click', () => setCircleMode(false));
    document.getElementById('btn-clear-sketch')?.addEventListener('click', clearSketch);

    ['trim', 'case', 'swing', 'vents'].forEach((k) => {
      document.getElementById(`lyr-${k}`)?.addEventListener('change', (e) => { layers[k] = Boolean(e.target.checked); renderSvg(); });
    });

    document.querySelectorAll('.view-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeView = btn.getAttribute('data-view') || 'all';
        document.querySelectorAll('.view-tab').forEach((b) => b.classList.toggle('active', b === btn));
        renderSvg();
      });
    });

    ['inp-b7', 'inp-b8', 'inp-b9', 'inp-b10', 'inp-b11', 'inp-b12', 'inp-b13', 'inp-b14', 'inp-b15',
      'sel-floor-done', 'sel-case-depth', 'inp-waste-pct', 'inp-ah', 'inp-v1-area', 'inp-v1-h', 'inp-v2-area', 'inp-v2-h'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', () => applyPatchToLocalState(buildPatchFromForm()));
    });

    document.getElementById('btn-apply-local')?.addEventListener('click', () => {
      applyPatchToLocalState(buildPatchFromForm()); showToast(computeRevisionStamp(), 'ok');
    });
    document.getElementById('btn-save-tailnet')?.addEventListener('click', async () => {
      const note = document.getElementById('inp-voice-note')?.value?.trim() || '';
      await saveOverrideToTailnet(buildPatchFromForm(), note);
    });
    document.getElementById('btn-export-svg')?.addEventListener('click', () => {
      const svg = document.getElementById('murphy-svg'); if (!svg) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }));
      a.download = `unit4-murphy-door-${currentLang}.svg`; a.click();
    });
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
      a.download = `murphy-door-plan-data-${currentLang}.json`; a.click();
    });
    document.getElementById('btn-download-pdf')?.addEventListener('click', () => {
      if (window.U4KS4PdfExport && typeof window.U4KS4PdfExport.exportPdf === 'function') window.U4KS4PdfExport.exportPdf();
      else window.print();
    });

    /* Presets */
    document.getElementById('preset-hold')?.addEventListener('click', () => {
      state = deepClone(BASELINE_MURPHY_DATA); hasUnsyncedLocalEdits = false; syncFormFromState(); renderAll();
    });
    document.getElementById('btn-reset-baseline')?.addEventListener('click', () => {
      state = deepClone(BASELINE_MURPHY_DATA); hasUnsyncedLocalEdits = false; lastSavedRevId = null; clearSketch(); syncFormFromState(); renderAll();
    });
    document.getElementById('preset-sample-pass')?.addEventListener('click', () => {
      applyPatchToLocalState({
        nine_point_measurements_b7_b15: {
          floor_finished: 'yes',
          b7_top_width_in: { value: 28.5, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b8_mid_width_in: { value: 28.4375, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b9_bot_width_in: { value: 28.5, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b10_left_height_in: { value: 80.5, measure_boundary: 'aff', verified: 'WHAT_IF_TEST' },
          b11_center_height_in: { value: 80.4375, measure_boundary: 'aff', verified: 'WHAT_IF_TEST' },
          b12_right_height_in: { value: 80.5, measure_boundary: 'aff', verified: 'WHAT_IF_TEST' },
          b13_diagonal_a_in: { value: 85.3125, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b14_diagonal_b_in: { value: 85.25, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b15_jamb_depth_j_in: { value: 4.75, measure_boundary: 'wall_to_wall', verified: 'WHAT_IF_TEST' }
        }
      });
    });
    document.getElementById('preset-fail-square')?.addEventListener('click', () => {
      applyPatchToLocalState({
        nine_point_measurements_b7_b15: {
          floor_finished: 'yes',
          b7_top_width_in: { value: 28.5, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b8_mid_width_in: { value: 28.5, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b9_bot_width_in: { value: 28.5, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b10_left_height_in: { value: 80.5, measure_boundary: 'aff', verified: 'WHAT_IF_TEST' },
          b11_center_height_in: { value: 80.5, measure_boundary: 'aff', verified: 'WHAT_IF_TEST' },
          b12_right_height_in: { value: 80.5, measure_boundary: 'aff', verified: 'WHAT_IF_TEST' },
          b13_diagonal_a_in: { value: 85.5, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b14_diagonal_b_in: { value: 85.125, measure_boundary: 'clear_between_casings', verified: 'WHAT_IF_TEST' },
          b15_jamb_depth_j_in: { value: 4.75, measure_boundary: 'wall_to_wall', verified: 'WHAT_IF_TEST' }
        }
      });
    });
    document.getElementById('preset-fail-vents')?.addEventListener('click', () => {
      applyPatchToLocalState({
        case_and_hardware_parameters: Object.assign({}, state.case_and_hardware_parameters, { v1_net_sq_in: 36, v2_net_sq_in: 20 })
      });
    });

    document.getElementById('btn-dictate')?.addEventListener('click', toggleVoiceDictation);
    document.getElementById('btn-refresh-eod')?.addEventListener('click', checkTailnetAndLoad);
    document.getElementById('btn-reload-latest')?.addEventListener('click', () => {
      const cb = document.getElementById('conflict-banner'); if (cb) cb.hidden = true; checkTailnetAndLoad();
    });

    document.getElementById('btn-apply-note')?.addEventListener('click', () => {
      const box = document.getElementById('inp-voice-note');
      const note = (box?.value || '').trim();
      if (!note && !pendingCircleNorm) {
        showToast(currentLang === 'es' ? 'Agrega una nota o dibuja un círculo.' : 'Enter a field note or draw a circle first.', 'error');
        return;
      }
      if (violatesPrivateFirewall(note)) { showToast(I18N[currentLang].firewall_err, 'error'); return; }
      const author = document.getElementById('inp-author')?.value || tailnetState.user || 'Field';
      const intent = document.getElementById('sel-pin-intent')?.value || 'propose_edit';
      const pt = pendingCircleNorm || { cx: 0.44, cy: 0.36, rx: 0.035, ry: 0.028 };
      const pin = {
        cx: Number(pt.cx.toFixed(4)), cy: Number(pt.cy.toFixed(4)),
        rx: Number(pt.rx.toFixed(4)), ry: Number(pt.ry.toFixed(4)),
        intent, author,
        note: note || (currentLang === 'es' ? 'Punto marcado en puerta Murphy' : 'Circled spot on Murphy drawing'),
        status: 'draft',
        created_at: new Date().toISOString()
      };
      applyPatchToLocalState({ pin });
      if (box) box.value = '';
      clearSketch();
      setCircleMode(false);
      showToast(currentLang === 'es' ? 'Comentario adjunto con guía en el plano' : 'Attached comment card + SVG leader added', 'ok');
    });
  }

  /* ── Unified Public Contract (window.U4PLAN) ──────────────────────── */
  window.U4PLAN = {
    planId: 'murphy-door',
    getSvgElement() { return document.getElementById('murphy-svg'); },
    getState() { return deepClone(state); },
    getLang() { return currentLang; },
    getRevisionStamp() { return computeRevisionStamp(); },
    getAnnotationDataUrl() {
      const cvs = document.getElementById('murphy-sketch-canvas');
      if (!cvs || !drawPoints.length) return null;
      try { return cvs.toDataURL('image/png'); } catch (_) { return null; }
    },
    setLang(lang) { if (lang === 'en' || lang === 'es') { currentLang = lang; renderAll(); } },
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
