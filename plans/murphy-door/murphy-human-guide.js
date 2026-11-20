/* ============================================================================
   Murphy Bookcase Door (Hallway B) — Real-World Human-First Interactive Guide
   Two-Layer Architecture: 9-Point Live Site Calculator + Hidden #blueprint-sheet-shell
   Zero External CDNs · Zero Prices · Zero Backend Clutter · Zero Storage · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "measure", en: "1. Measure Door B", es: "1. Medir Puerta B" },
    { id: "swing", en: "2. 90° Swing & Depth", es: "2. Giro 90° y Fondo" },
    { id: "vents", en: "3. Laundry Vents", es: "3. Rejillas Lavadora" },
    { id: "trim", en: "4. Trim & Supplies", es: "4. Molduras y Kit" }
  ];

  var state = {
    step: "measure",
    // 9-point inside-jamb readings (blank until John enters real site tape!)
    b7: "", b8: "", b9: "",     // top/mid/bot widths
    b10: "", b11: "", b12: "",  // left/center/right heights
    b13: "", b14: "",           // diagonals A & B
    b15: "",                    // jamb depth J
    hingeStack: 2.375,          // T + Bt + 1/8"
    depthOpt: "8.25",           // "8.25" (7-3/16" shelf) or "9.0625"
    equipOpen: false
  };

  function isEs() {
    return window.U4PlanNav ? window.U4PlanNav.getLang() === "es" : false;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseIn(v) {
    var s = String(v == null ? "" : v).trim();
    if (!s) return null;
    // Support decimals ("28.4375") AND fractions ("28-7/16" or "28 7/16")
    var m = s.match(/^(\d+)(?:[\s-]+(\d+)\/(\d+))?$/);
    if (m) {
      var whole = parseFloat(m[1]);
      if (m[2] && m[3] && parseFloat(m[3]) > 0) return whole + parseFloat(m[2]) / parseFloat(m[3]);
      return whole;
    }
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  function fmtIn(n) {
    if (n == null || isNaN(n)) return "—";
    var r = Math.round(n * 16) / 16;
    var whole = Math.floor(r);
    var num = Math.round((r - whole) * 16);
    if (num === 0) return whole + '"';
    var den = 16;
    while (num % 2 === 0 && den > 1) { num /= 2; den /= 2; }
    return (whole ? whole + "-" : "") + num + "/" + den + '"';
  }

  function computeMath() {
    var vals = [state.b7, state.b8, state.b9, state.b10, state.b11, state.b12, state.b13, state.b14, state.b15].map(parseIn);
    var filledCount = vals.filter(function (x) { return x != null; }).length;
    var ws = [vals[0], vals[1], vals[2]].filter(function (x) { return x != null; });
    var hs = [vals[3], vals[4], vals[5]].filter(function (x) { return x != null; });
    var minW = ws.length ? Math.min.apply(null, ws) : null;
    var minH = hs.length ? Math.min.apply(null, hs) : null;
    // Preliminary gap formula: gl = 1/4" hinge side, gr = 1" latch side, ah = hingeStack (2-3/8" prelim)
    var caseW = minW != null ? +(minW - 0.25 - 1.0).toFixed(4) : null;
    var caseH = minH != null ? +(minH - state.hingeStack).toFixed(4) : null;
    var diagDiff = (vals[6] != null && vals[7] != null) ? Math.abs(vals[6] - vals[7]) : null;
    var squareOk = diagDiff != null ? diagDiff <= 0.125 : null;
    var depth = parseFloat(state.depthOpt);
    var shelfDepth = depth === 8.25 ? 7.1875 : 8.0;
    var doorSwingW = caseW != null ? caseW : 27.1875;
    var hallPassLeft = +(41.25 - doorSwingW).toFixed(2);
    // Guard against accidentally entering Bathroom Doorway A (27.25" x 79.375")
    var looksLikeDoorA = (minW != null && Math.abs(minW - 27.25) <= 0.25) || (minH != null && Math.abs(minH - 79.375) <= 0.25);

    return {
      filledCount: filledCount,
      minW: minW,
      minH: minH,
      caseW: caseW,
      caseH: caseH,
      diagDiff: diagDiff,
      squareOk: squareOk,
      depth: depth,
      shelfDepth: shelfDepth,
      doorSwingW: doorSwingW,
      hallPassLeft: hallPassLeft,
      jambDepth: vals[8],
      looksLikeDoorA: looksLikeDoorA
    };
  }

  function renderDoorwayElevationSvg(m, es) {
    var ready = m.filledCount === 9 && m.squareOk !== false && !m.looksLikeDoorA;
    var strokeB = ready ? "#1B6B46" : "#A15206";
    var wTxt = m.caseW != null ? fmtIn(m.caseW) : (es ? "27-3/16\" (prov.)" : "27-3/16\" (prov.)");
    var hTxt = m.caseH != null ? fmtIn(m.caseH) : (es ? "78-1/16\" (prov.)" : "78-1/16\" (prov.)");

    return '<svg viewBox="0 0 460 245" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Elevación del pasillo mostrando Puertas A, B y C" : "Hallway elevation showing Doors A, B and C") + '">' +
      '<text x="230" y="18" text-anchor="middle" font-size="9.6" font-weight="800" fill="#184E77">' +
        (es ? "PASILLO MIRANDO AL NORTE · ← OESTE (Baño A) | CENTRO (Murphy B) | ESTE (Recámara C) →" : "HALLWAY FACING NORTH · ← WEST (Bath A) | CENTER (Murphy B) | EAST (Bedroom C) →") + "</text>" +
      // Original Edwardian Crown Molding
      '<rect x="20" y="28" width="420" height="12" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1"/>' +
      '<text x="230" y="37" text-anchor="middle" font-size="7.4" font-weight="800" fill="#1B6B46">' + (es ? "MOLDURA CORONA ORIGINAL — NO TOCAR" : "ORIGINAL CROWN MOLDING — KEEP UNTOUCHED") + "</text>" +
      // Door A (Bathroom — DO NOT MEASURE)
      '<rect x="34" y="58" width="76" height="162" fill="#FEECEB" stroke="#B42318" stroke-width="1.4"/>' +
      '<text x="72" y="122" text-anchor="middle" font-size="8.6" font-weight="800" fill="#B42318">' + (es ? "PUERTA A" : "DOOR A") + "</text>" +
      '<text x="72" y="135" text-anchor="middle" font-size="7.4" fill="#B42318">' + (es ? "Baño" : "Bathroom") + "</text>" +
      '<text x="72" y="148" text-anchor="middle" font-size="7.2" font-weight="800" fill="#B42318">' + (es ? "NO MEDIR" : "DO NOT USE") + "</text>" +
      // Wall A-B warning zone
      '<rect x="116" y="58" width="60" height="162" fill="#FDF2E4" stroke="#A15206" stroke-width="1" stroke-dasharray="4 2"/>' +
      '<text x="146" y="128" text-anchor="middle" font-size="7.2" font-weight="800" fill="#A15206">' + (es ? "MURO A–B" : "WALL A–B") + "</text>" +
      '<text x="146" y="140" text-anchor="middle" font-size="6.6" fill="#A15206">' + (es ? "Revisar bastidor" : "Check framing") + "</text>" +
      // Doorway B — MURPHY BOOKCASE TARGET (with 9 measurement markers!)
      '<rect x="182" y="56" width="96" height="164" fill="#E6F0F8" stroke="' + strokeB + '" stroke-width="2.4" stroke-dasharray="' + (ready ? "none" : "6 3") + '"/>' +
      // 4 fixed shelves inside Doorway B
      '<line x1="186" y1="90" x2="274" y2="90" stroke="#184E77" stroke-width="1.5"/>' +
      '<line x1="186" y1="124" x2="274" y2="124" stroke="#184E77" stroke-width="1.5"/>' +
      '<line x1="186" y1="158" x2="274" y2="158" stroke="#184E77" stroke-width="1.5"/>' +
      '<line x1="186" y1="192" x2="274" y2="192" stroke="#184E77" stroke-width="1.5"/>' +
      // Left pivot + Right push latch indicator
      '<circle cx="187" cy="64" r="3.5" fill="#184E77"/><circle cx="187" cy="212" r="3.5" fill="#184E77"/>' +
      '<circle cx="272" cy="142" r="4" fill="#B42318"/>' +
      '<text x="230" y="78" text-anchor="middle" font-size="8.4" font-weight="800" fill="#184E77">' + (es ? "PUERTA B (MURPHY)" : "DOOR B (MURPHY)") + "</text>" +
      '<text x="230" y="109" text-anchor="middle" font-size="7.6" font-weight="800" fill="' + strokeB + '">W: ' + esc(wTxt) + "</text>" +
      '<text x="230" y="120" text-anchor="middle" font-size="7.6" font-weight="800" fill="' + strokeB + '">H: ' + esc(hTxt) + "</text>" +
      '<text x="225" y="145" text-anchor="middle" font-size="6.3" font-weight="700" fill="#485563">' + (es ? "Pivote Izq · Empuje" : "Left Pivot · Push") + "</text>" +
      // Door C (Bedroom)
      '<rect x="316" y="58" width="90" height="162" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.4"/>' +
      '<text x="361" y="132" text-anchor="middle" font-size="8.4" font-weight="800" fill="#485563">' + (es ? "PUERTA C" : "DOOR C") + "</text>" +
      '<text x="361" y="145" text-anchor="middle" font-size="7.4" fill="#6E7D8C">' + (es ? "Recámara" : "Bedroom") + "</text>" +
      // Floor line
      '<line x1="20" y1="220" x2="440" y2="220" stroke="#131A22" stroke-width="2.2"/>' +
      '<text x="230" y="236" text-anchor="middle" font-size="8" font-weight="700" fill="#184E77">' +
        (es ? "Medir POR DENTRO de las jambas (sin molduras exteriores) al 1/16\" más cercano, dos veces"
            : "Measure INSIDE wood jambs (excluding outside trim) to nearest 1/16\", twice") +
      "</text>" +
    "</svg>";
  }

  function renderSwingPlanSvg(m, es) {
    return '<svg viewBox="0 0 460 225" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="9.6" font-weight="800" fill="#184E77">' +
        (es ? 'PLANTA DE GIRO 90° HACIA EL PASILLO (41-1/4" LIBRE) Y CLÓSET LAVANDERÍA' : '90° OUT-SWING PLAN INTO HALLWAY (41-1/4" CLEAR) & LAUNDRY CLOSET') + "</text>" +
      // Laundry Closet top (36-5/16" W x 82-5/8" D)
      '<rect x="148" y="30" width="110" height="90" fill="#FCFDFE" stroke="#131A22" stroke-width="2"/>' +
      // LG WashTower inside closet (27" W x 30-3/8" D)
      '<rect x="166" y="42" width="74" height="58" rx="4" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
      '<text x="203" y="68" text-anchor="middle" font-size="8" font-weight="800" fill="#184E77">LG WashTower</text>' +
      '<text x="203" y="80" text-anchor="middle" font-size="7" fill="#485563">27" W × 30-3/8" D</text>' +
      '<text x="203" y="92" text-anchor="middle" font-size="6.7" fill="#1B6B46">' + (es ? '≥1" lados · ≥4" atrás' : '≥1" sides · ≥4" rear') + "</text>" +
      // Hallway walls (41-1/4" clear height)
      '<line x1="28" y1="120" x2="174" y2="120" stroke="#131A22" stroke-width="4"/>' +
      '<line x1="242" y1="120" x2="432" y2="120" stroke="#131A22" stroke-width="4"/>' +
      '<line x1="28" y1="204" x2="432" y2="204" stroke="#131A22" stroke-width="2.2"/>' +
      // Left-pivot bookcase door swung 90° open into hallway
      '<rect x="174" y="120" width="18" height="58" fill="#FDF2E4" stroke="#A15206" stroke-width="1.8"/>' +
      '<path d="M 240 120 A 66 66 0 0 1 174 178" fill="none" stroke="#184E77" stroke-width="1.6" stroke-dasharray="4 3"/>' +
      '<circle cx="177" cy="122" r="4" fill="#184E77"/>' +
      '<text x="250" y="156" font-size="8.2" font-weight="800" fill="#184E77">' + (es ? "Giro 90° afuera (pivote izq.)" : "90° out-swing (left pivot)") + "</text>" +
      '<text x="250" y="169" font-size="7.6" font-weight="700" fill="#1B6B46">' +
        (es ? "Paso libre restante: ~" + fmtIn(m.hallPassLeft) + ' · Fondo librero: ' + fmtIn(m.depth)
            : "Remaining hall pass: ~" + fmtIn(m.hallPassLeft) + ' · Case depth: ' + fmtIn(m.depth)) +
      "</text>" +
      '<text x="96" y="166" text-anchor="middle" font-size="8" font-weight="800" fill="#485563">' + (es ? 'Pasillo 41-1/4"' : 'Hallway 41-1/4"') + "</text>" +
      '<text x="230" y="219" text-anchor="middle" font-size="7.8" font-weight="700" fill="#A15206">' +
        (es ? "OBLIGATORIO: hacer plantilla de cartón a tamaño real para probar el giro antes de perforar"
            : "REQUIRED: test full-size cardboard swing mockup in hallway before drilling pivots") +
      "</text>" +
    "</svg>";
  }

  function renderVentsSvg(es) {
    return '<svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="9.6" font-weight="800" fill="#184E77">' +
        (es ? "REJILLAS DE VENTILACIÓN LG WASHTOWER (GAS) Y APERTURA INTERIOR" : "LG GAS WASHTOWER LOUVER VENTS & INSIDE SAFETY RELEASE") + "</text>" +
      // Interior view of door leaf
      '<rect x="150" y="30" width="120" height="170" rx="4" fill="#FCFDFE" stroke="#184E77" stroke-width="2"/>' +
      // Upper vent >= 48 sq in net at >= 72"
      '<rect x="168" y="42" width="84" height="28" rx="3" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.8"/>' +
      '<text x="210" y="54" text-anchor="middle" font-size="7.8" font-weight="800" fill="#1B6B46">' + (es ? "Rejilla alta" : "Upper Vent") + "</text>" +
      '<text x="210" y="65" text-anchor="middle" font-size="7.2" font-weight="700" fill="#1B6B46">≥ 48 sq in net</text>' +
      '<text x="282" y="58" font-size="7.8" font-weight="800" fill="#1B6B46">' + (es ? 'Altura ≥ 72" (plan 72-1/2")' : 'Height ≥ 72" (plan 72-1/2")') + "</text>" +
      // Inside safety release handle (~40")
      '<rect x="234" y="106" width="22" height="10" rx="3" fill="#B42318"/>' +
      '<text x="282" y="114" font-size="8" font-weight="800" fill="#B42318">' + (es ? 'Manija interior de emergencia (~40")' : 'Inside safety release (~40" high)') + "</text>" +
      // Lower vent >= 24 sq in net at <= 12"
      '<rect x="168" y="160" width="84" height="28" rx="3" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.8"/>' +
      '<text x="210" y="172" text-anchor="middle" font-size="7.8" font-weight="800" fill="#1B6B46">' + (es ? "Rejilla baja" : "Lower Vent") + "</text>" +
      '<text x="210" y="183" text-anchor="middle" font-size="7.2" font-weight="700" fill="#1B6B46">≥ 24 sq in net</text>' +
      '<text x="282" y="176" font-size="7.8" font-weight="800" fill="#1B6B46">' + (es ? 'Tope ≤ 12" (plan 7")' : 'Top ≤ 12" (plan 7")') + "</text>" +
      // Left summary pill
      '<rect x="18" y="84" width="118" height="58" rx="7" fill="#E6F0F8" stroke="#184E77" stroke-width="1.2"/>' +
      '<text x="77" y="104" text-anchor="middle" font-size="8.4" font-weight="800" fill="#184E77">' + (es ? "TOTAL MÍNIMO" : "TOTAL MINIMUM") + "</text>" +
      '<text x="77" y="120" text-anchor="middle" font-size="11" font-weight="800" fill="#1B6B46">≥ 100 sq in</text>' +
      '<text x="77" y="133" text-anchor="middle" font-size="7" fill="#485563">' + (es ? "área libre neta" : "net free airflow") + "</text>" +
    "</svg>";
  }

  function renderEquip(es) {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="murEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "🔧 Equipo y suministros " : "🔧 Equipment & Supplies ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="murEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Herrajes requeridos" : "Required Hardware") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? "Kit de pivote Murphy Door (medir grosor real T + Bt antes de cortar)" : "Murphy Door Single Hidden Door Hardware Kit (measure actual T + Bt stack first)") + "</li>" +
              "<li>" + (es ? "Seguro de empuje negro Sugatsune ML-ZN80-BL (~40\" alto)" : "Sugatsune ML-ZN80-BL black push latch (~40\" height)") + "</li>" +
              "<li>" + (es ? "Manija de liberación interior + rejillas de ventilación (≥100 sq in neto)" : "Inside safety release handle + louver vents (≥100 sq in total net)") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Madera y acabado" : "Woodwork & Finish") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? 'Triplay para pintar + 4 repisas fijas con labio 1-1/2" (3/4" arriba)' : 'Paint-grade ply carcass + 4 fixed shelves w/ 1-1/2" retaining lips') + "</li>" +
              "<li>" + (es ? "Marco frontal de álamo sólido (poplar) · color Chantilly Lace OC-65" : "Solid poplar face frame · Chantilly Lace OC-65 woodwork (sheen TBD)") + "</li>" +
              "<li>" + (es ? "Cartón grande para plantilla de prueba de giro 90° antes de cortar" : "Large cardboard sheet for mandatory full-size 90° swing mockup") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function render() {
    var host = document.getElementById("u4hBody");
    var holdEl = document.getElementById("u4hHoldStrip");
    if (!host) return;
    var es = isEs();
    var m = computeMath();
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip is-danger";
      holdEl.innerHTML = es
        ? "<strong>NO CORTAR MADERA NI PERFORAR TODAVÍA:</strong> Completa las 9 medidas por dentro de las jambas de la <strong>Puerta Central B</strong> (NUNCA usar medidas de Puerta A del Baño 27-1/4\" × 79-3/8\"), mide las bisagras reales del kit y aprueba la plantilla de cartón."
        : "<strong>DO NOT CUT WOOD OR DRILL PIVOTS YET:</strong> Enter all 9 inside-jamb measurements of <strong>Middle Doorway B</strong> (NEVER use Bathroom Doorway A: 27-1/4\" × 79-3/8\"), measure actual kit hinge thickness, and pass the cardboard swing mockup.";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Measure Middle Doorway B (9 Points)";
    var titleEs = "Medir Puerta Central B (9 Puntos)";
    var subEn = "Enter your tape readings below to calculate squareness and exact bookcase cut size live";
    var subEs = "Ingresa tus medidas abajo para calcular escuadra y corte exacto del librero en vivo";
    var inner = "";

    if (state.step === "measure") {
      var sqText = m.diagDiff == null
        ? (es ? "Medir diagonales" : "Enter diagonals")
        : (m.squareOk ? (es ? "✓ Escuadrado (≤1/8\")" : "✓ Square (≤1/8\")") : (es ? "⚠ Descuadrado (" + fmtIn(m.diagDiff) + ")" : "⚠ Out of square (" + fmtIn(m.diagDiff) + ")"));

      inner =
        '<div class="u4h-photo-grid">' +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/hallway-doorway-b-photo.png" alt="' + esc(es ? "Foto real del pasillo mostrando Puertas A, B y C" : "Real hallway photo showing Doors A, B, and C") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Foto real — ¿Cuál puerta medir?" : "Real photo — Which door to measure:") + "</strong> " +
              (es ? "Mide SOLO la Puerta Central B (lavandería). NO medir Puerta A (baño a la izquierda)." : "Measure ONLY Middle Doorway B (laundry). NEVER measure Bathroom Door A on left.") +
            "</div>" +
          "</div>" +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/murphy-bookcase-concept.png" alt="' + esc(es ? "Referencia visual del librero empotrado" : "Built-in bookcase visual goal") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Objetivo visual (Chantilly Lace):" : "Visual goal (Chantilly Lace):") + "</strong> " +
              (es ? "Librero limpio conservando corona y chambranas originales intactas." : "Clean built-in look while preserving existing original crown and casings.") +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Lecturas capturadas" : "Readings entered") + "</div>" +
            '<div class="u4h-kpi-val ' + (m.filledCount === 9 ? "is-ok" : "is-warn") + '">' + m.filledCount + " / 9</div>" +
            '<div class="u4h-kpi-sub">' + (m.filledCount === 9 ? (es ? "Todas completas" : "All 9 entered") : (es ? "Faltan medidas" : "Hold until 9/9")) + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Escuadra (Diag A–B)" : "Squareness (Diag A–B)") + "</div>" +
            '<div class="u4h-kpi-val ' + (m.squareOk === true ? "is-ok" : (m.squareOk === false ? "is-fail" : "is-warn")) + '">' + esc(sqText) + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "Tolerancia ≤ 1/8\"" : "Tolerance ≤ 1/8\"") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Corte estimado caja" : "Calculated box size") + "</div>" +
            '<div class="u4h-kpi-val is-info">' + (m.caseW != null ? fmtIn(m.caseW) : "—") + " × " + (m.caseH != null ? fmtIn(m.caseH) : "—") + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "Resta juegos y bisagras" : "Minus gaps & hinge stack") + "</div>" +
          "</div>" +
        "</div>" +

        (m.looksLikeDoorA
          ? '<div class="u4h-status is-fail">' + (es ? "⛔ ¡ALERTA! Esas medidas parecen de la PUERTA A DEL BAÑO (27-1/4\" × 79-3/8\"). Verifica que estás midiendo la PUERTA CENTRAL B." : "⛔ WARNING! Those numbers match BATHROOM DOOR A (27-1/4\" × 79-3/8\"). Double-check that you are measuring MIDDLE DOORWAY B!") + "</div>"
          : "") +

        '<div class="u4h-svg-wrap">' + renderDoorwayElevationSvg(m, es) + "</div>" +

        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-lbl">' + (es ? "Ingresa medidas de Puerta B (acepta decimales o fracciones, ej. 28-7/16):" : "Enter Doorway B inside-jamb readings (decimals or fractions, e.g. 28-7/16):") + "</div>" +
          '<div class="u4h-input-grid">' +
            [
              ["b7", es ? "1. Ancho arriba" : "1. Top width"],
              ["b8", es ? "2. Ancho medio" : "2. Mid width"],
              ["b9", es ? "3. Ancho abajo" : "3. Bottom width"],
              ["b10", es ? "4. Alto izq." : "4. Left height"],
              ["b11", es ? "5. Alto centro" : "5. Center height"],
              ["b12", es ? "6. Alto der." : "6. Right height"],
              ["b13", es ? "7. Diagonal A" : "7. Diagonal A"],
              ["b14", es ? "8. Diagonal B" : "8. Diagonal B"],
              ["b15", es ? "9. Fondo jamba" : "9. Jamb depth"]
            ].map(function (f) {
              return '<div class="u4h-field">' +
                '<label for="mur_' + f[0] + '">' + esc(f[1]) + "</label>" +
                '<input id="mur_' + f[0] + '" data-mf="' + f[0] + '" type="text" inputmode="decimal" placeholder=\'e.g. 28-7/16\' value="' + esc(state[f[0]]) + '">' +
              "</div>";
            }).join("") +
          "</div>" +
          '<div class="u4h-cta-row">' +
            '<button type="button" class="u4h-action-btn" id="murSendBtn">' + (es ? "📝 Enviar medidas al PM / Tisa" : "📝 Send 9-point readings to PM / Tisa") + "</button>" +
          "</div>" +
        "</div>";

    } else if (state.step === "swing") {
      titleEn = "90° Out-Swing, Depth & Wall A–B Check";
      titleEs = "Giro 90° Afuera, Fondo y Revisión Muro A–B";
      subEn = "Compare bookcase depth against 41-1/4\" hallway width and check Wall A–B framing";
      subEs = "Compara fondo del librero en el pasillo de 41-1/4\" y revisa bastidor del muro A–B";

      inner =
        '<div class="u4h-svg-wrap">' + renderSwingPlanSvg(m, es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Fondo del librero (confirmar con cartón):" : "Bookcase depth (confirm with cardboard mockup):") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.depthOpt === "8.25" ? " is-active" : "") + '" data-depth="8.25">' + (es ? '8-1/4" estándar (repisa 7-3/16")' : '8-1/4" standard (7-3/16" shelf)') + "</button>" +
              '<button type="button" class="u4h-pill' + (state.depthOpt === "9.0625" ? " is-active" : "") + '" data-depth="9.0625">' + (es ? '9-1/16" más hondo (repisa 8")' : '9-1/16" deeper (8" shelf)') + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Actualización importante del Muro A–B" : "Important Wall A–B Framing Note") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li>" + (es ? "Los planos antiguos suponían puerta corrediza de baño dentro del muro A–B. Esa corrediza fue pospuesta — revisa el bastidor real del muro A–B en obra antes de colocar refuerzos para el pivote izquierdo." : "Older drawings assumed a sliding bathroom pocket door inside Wall A–B. That pocket door was deferred — verify actual Wall A–B studs on site before anchoring left pivot blocking.") + "</li>" +
            "<li>" + (es ? "El librero pivota a la izquierda abriendo hacia el pasillo: presiona el borde derecho hacia adentro para liberar el seguro y jala hacia afuera." : "Left-pivot out-swing into hallway: press the right edge inward to release the push latch, then pull outward.") + "</li>" +
          "</ul>" +
        "</div>";

    } else if (state.step === "vents") {
      titleEn = "LG Gas WashTower Vents & Safety Release";
      titleEs = "Ventilación LG WashTower (Gas) y Apertura Interior";
      subEn = "Required airflow and inside escape release for the stacked gas laundry unit (delivery Tue Dec 1)";
      subEs = "Flujo de aire y manija interior obligatorios para el centro de lavado de gas (entrega mar 1 dic)";

      inner =
        '<div class="u4h-svg-wrap">' + renderVentsSvg(es) + "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Requisitos de seguridad y equipo" : "Appliance & Code Requirements") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li><strong>LG WKG101HVA:</strong> 27\" W × 30-3/8\" D × 74-3/8\" H (" + (es ? 'mín. 1" lados, 4" atrás' : 'min 1" sides, 4" rear clearance') + ").</li>" +
            "<li><strong>" + (es ? "Ventilación obligatoria:" : "Mandatory combustion/dryer airflow:") + "</strong> " + (es ? '≥ 48 sq in neto arriba (≥ 72" alto) + ≥ 24 sq in neto abajo (≤ 12" alto), total ≥ 100 sq in neto.' : '≥ 48 sq in net upper (≥ 72" high) + ≥ 24 sq in net lower (≤ 12" high), total ≥ 100 sq in net.') + "</li>" +
            "<li><strong>" + (es ? "Manija interior:" : "Inside release:") + "</strong> " + (es ? "Obligatoria para poder abrir desde adentro del clóset en cualquier momento." : "Required so nobody can ever get trapped inside the laundry closet.") + "</li>" +
          "</ul>" +
        "</div>";

    } else {
      titleEn = "Original Trim Protection, Hardware & Supplies";
      titleEs = "Protección de Molduras, Herrajes y Suministros";
      subEn = "Keep Edwardian hallway woodwork untouched while building a tight custom bookcase door";
      subEs = "Conservar intacta la carpintería Edwardian original mientras se arma la puerta librero";

      inner =
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Reglas de acabado y herrajes" : "Finish & Hardware Rules") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li>" + (es ? "Conservar intactas la moldura corona original del pasillo, las chambranas de Puertas A/B/C y el zoclo." : "Keep original hallway crown molding, Door A/B/C casings, and baseboards completely untouched.") + "</li>" +
            "<li>" + (es ? "Verificar entrega física del kit de pivotes Murphy Door y medir el espesor real de las bisagras (T + Bt) antes de cortar la altura." : "Confirm physical delivery of the Murphy Door hardware kit and measure actual hinge stack (T + Bt) before cutting box height.") + "</li>" +
            "<li>" + (es ? "Acabado pintado en Chantilly Lace OC-65 (brillo por confirmar por Tisa)." : "Paint-grade woodwork in Chantilly Lace OC-65 (final sheen to be confirmed by Tisa).") + "</li>" +
          "</ul>" +
        "</div>" +
        renderEquip(es);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="murPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + (es ? "Anterior" : "Prev") + "</button>" +
      '<span class="u4h-pager-count">' + (es ? "Paso " : "Step ") + (idx + 1) + (es ? " de " : " of ") + STEPS.length + "</span>" +
      '<button type="button" id="murNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + (es ? "Siguiente" : "Next") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(es ? titleEs : titleEn) + "</div>" +
            '<div class="u4h-sub">' + esc(es ? subEs : subEn) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">' + (es ? "Puerta B" : "Door B") + "</span>" +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); render(); window.scrollTo(0, 0); });
    });
    host.querySelectorAll("[data-mf]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        state[inp.getAttribute("data-mf")] = inp.value;
        render();
      });
    });
    host.querySelectorAll("[data-depth]").forEach(function (b) {
      b.addEventListener("click", function () { state.depthOpt = b.getAttribute("data-depth"); render(); });
    });
    var eqBtn = document.getElementById("murEquipBtn");
    if (eqBtn) eqBtn.addEventListener("click", function () { state.equipOpen = !state.equipOpen; render(); });
    var sendBtn = document.getElementById("murSendBtn");
    if (sendBtn) sendBtn.addEventListener("click", function () {
      if (window.U4LiveAi) {
        var summary = "Murphy Door B 9-point readings: W=" + [state.b7, state.b8, state.b9].join("/") +
          ", H=" + [state.b10, state.b11, state.b12].join("/") +
          ", Diag=" + state.b13 + "/" + state.b14 + ", Jamb=" + state.b15;
        window.U4LiveAi.openNote(summary);
      }
    });
    var pBtn = document.getElementById("murPrevBtn");
    var nBtn = document.getElementById("murNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });
  }

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "murphy-door",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { render(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); }
      });
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "murphy-door",
        room: "laundry",
        titleEn: "Murphy Bookcase Door (Hallway B)",
        titleEs: "Puerta Librero Murphy (Pasillo B)",
        getContext: function () {
          var m = computeMath();
          return "Step=" + state.step + ", ReadingsEntered=" + m.filledCount + "/9, CaseEst=" + fmtIn(m.caseW) + "x" + fmtIn(m.caseH) + ", Depth=" + fmtIn(m.depth) + ", Hard hold until all 9 inside-jamb readings of Middle Doorway B (never Bathroom Door A) + cardboard mockup pass.";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Cómo tomo las 9 medidas de Puerta B?", "¿Cuánta ventilación pide la LG WashTower?", "¿Qué cambió con la puerta del baño A–B?"]
            : ["How do I take the 9 measurements of Door B?", "What louver vent size does the LG WashTower need?", "What changed about Wall A–B pocket door?"];
        }
      });
    }
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
