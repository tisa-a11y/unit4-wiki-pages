/* ============================================================================
   Permanent Attic Hatch — Real-World Human-First Interactive Guide
   Two-Layer Architecture: Clean 4-Step Crew UI + Hidden #blueprint-sheet-shell Print Engine
   Zero External CDNs · Zero Prices · Zero Backend Clutter · Zero Storage · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "spot", en: "1. Spot & Framing", es: "1. Ubicación y Corte" },
    { id: "walkway", en: "2. Walkway & Sheets", es: "2. Pasillo y Hojas" },
    { id: "seal", en: "3. Lid & Air Seal", es: "3. Tapa y Sellado" },
    { id: "gates", en: "4. Hold Checklist", es: "4. Lista de Candados" }
  ];

  var state = {
    step: "spot",
    location: "door4",       // "door4" | "hall"
    fireRating: "unknown",   // "unknown" | "no" | "yes"
    joistBay: "unknown",     // "unknown" | "14.5" | "22.5" | "27.5" | "30"
    walkwayFt: 16,           // 6..24 ft interactive calculator
    equipOpen: false,
    gates: { g1: false, g2: false, g3: false, g4: false, g5: false }
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

  function calcSheets(ft) {
    if (ft <= 7) return 1;
    if (ft <= 14) return 2;
    if (ft <= 20) return 3;
    return Math.ceil(ft / 7);
  }

  function renderHatchFramingSvg(es) {
    var bayVal = state.joistBay === "unknown" ? null : parseFloat(state.joistBay);
    var bayLabel = bayVal == null
      ? (es ? "Claro entre vigas (B): MEDIR" : "Joist bay (B): MEASURE ON SITE")
      : (es ? "Claro B = " + bayVal + '"' : "Joist bay B = " + bayVal + '"');
    var bayOk = bayVal === 27.5;
    var bayWide = bayVal != null && bayVal > 27.5;
    var bayNarrow = bayVal != null && bayVal < 27.5;

    var frameStroke = state.fireRating === "yes" ? "#B42318" : (bayOk ? "#1B6B46" : "#A15206");
    var frameLabel = state.fireRating === "yes"
      ? (es ? "REQUIERE TAPA CORTAFUEGO CERTIFICADA" : "LISTED FIRE-RATED HATCH REQUIRED")
      : (es ? 'Corte madera propuesto: 27-1/2" × 39-1/2"' : 'Proposed wood-kit cut: 27-1/2" × 39-1/2"');

    return '<svg viewBox="0 0 460 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Plano de escotilla 24x36 y paso de calefacción" : "24x36 attic hatch framing and furnace passage diagram") + '">' +
      '<text x="230" y="18" text-anchor="middle" font-size="10" font-weight="800" fill="#184E77">' +
        (es ? 'ESCOTILLA PERMANENTE 24" × 36" LIBRE (NUNCA REDUCIR)' : 'PERMANENT ATTIC HATCH · 24" × 36" FINISHED CLEAR (NEVER SHRINK)') + "</text>" +
      // Ceiling joists background lines
      '<rect x="30" y="34" width="400" height="176" rx="6" fill="#FCFDFE" stroke="#DCE2E9" stroke-width="1.2"/>' +
      '<line x1="30" y1="62" x2="430" y2="62" stroke="#D9A86C" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<line x1="30" y1="184" x2="430" y2="184" stroke="#D9A86C" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      // Proposed outer rough cut (27.5" x 39.5")
      '<rect x="108" y="54" width="244" height="138" fill="#FDF2E4" fill-opacity="0.45" stroke="' + frameStroke + '" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="230" y="47" text-anchor="middle" font-size="8.4" font-weight="800" fill="' + frameStroke + '">' + esc(frameLabel) + "</text>" +
      // Locked finished clear 24" x 36"
      '<rect x="122" y="68" width="216" height="110" fill="#E6F0F8" stroke="#184E77" stroke-width="2.4"/>' +
      // Carrier/Bryant Furnace end-first footprint (14.19" x 29" scaled proportionally inside 24" x 36")
      '<rect x="143" y="88" width="174" height="70" rx="4" fill="#E5F4EC" stroke="#1B6B46" stroke-width="2"/>' +
      '<text x="230" y="114" text-anchor="middle" font-size="9.2" font-weight="800" fill="#1B6B46">' + (es ? "CALEFACCIÓN ENTRA DE PUNTA: PASA ✓" : "FURNACE END-FIRST: PASS ✓") + "</text>" +
      '<text x="230" y="128" text-anchor="middle" font-size="8.2" font-weight="700" fill="#131A22">14-3/16" × 29" (Carrier / Bryant 45k)</text>' +
      '<text x="230" y="141" text-anchor="middle" font-size="7.6" font-weight="700" fill="#1B6B46">' + (es ? '+9-3/4" de ancho y +7" de largo libres' : '+9-3/4" width & +7" length to spare') + "</text>" +
      // Clear dimension labels
      '<rect x="130" y="196" width="200" height="16" rx="4" fill="#FFFFFF" fill-opacity="0.96"/><text x="230" y="207" text-anchor="middle" font-size="8.4" font-weight="800" fill="#184E77">' + (es ? '36" LIBRE TERMINADO (A LO LARGO)' : '36" FINISHED CLEAR (ALONG HALL)') + "</text>" +
      '<text x="360" y="126" font-size="8.8" font-weight="800" fill="#184E77">24"</text>' +
      '<text x="360" y="137" font-size="7.2" fill="#485563">' + (es ? "libre" : "clear") + "</text>" +
      // Joist bay B bracket on left
      '<line x1="88" y1="62" x2="88" y2="184" stroke="' + (bayNarrow ? "#B42318" : "#A15206") + '" stroke-width="1.8"/>' +
      '<line x1="82" y1="62" x2="94" y2="62" stroke="' + (bayNarrow ? "#B42318" : "#A15206") + '" stroke-width="1.8"/>' +
      '<line x1="82" y1="184" x2="94" y2="184" stroke="' + (bayNarrow ? "#B42318" : "#A15206") + '" stroke-width="1.8"/>' +
      '<text x="230" y="232" text-anchor="middle" font-size="8.6" font-weight="800" fill="' + (bayNarrow ? "#B42318" : (bayOk ? "#1B6B46" : "#A15206")) + '">' +
        esc(bayLabel + (bayOk ? (es ? " — ¡Calza exacto!" : " — Exact fit!") : bayWide ? (es ? " — Agregar respaldo lateral sólido" : " — Needs solid side backing") : bayNarrow ? (es ? " — Requiere cabezal estructural o mover punto" : " — Needs structural header or alternate spot") : "")) +
      "</text>" +
    "</svg>";
  }

  function renderWalkwaySvg(es) {
    var ft = state.walkwayFt;
    var pass = ft <= 20;
    var sheets = calcSheets(ft);
    var col = pass ? "#1B6B46" : "#B42318";
    var barW = Math.min(240, Math.max(55, (ft / 24) * 240));
    var maxLineX = 96 + (20 / 24) * 240;

    return '<svg viewBox="0 0 460 225" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="10" font-weight="800" fill="#184E77">' +
        (es ? 'PASILLO SÓLIDO 24" + PLATAFORMA 30"×30" (ALTURA ÁTICO 66")' : 'SOLID 24" WALKWAY + 30"×30" SERVICE PLATFORM (66" ATTIC HEIGHT)') + "</text>" +
      // Attic roof triangle context
      '<polygon points="26,118 230,34 434,118" fill="#F8FAFC" stroke="#C2CCD6" stroke-width="1.4"/>' +
      '<text x="230" y="54" text-anchor="middle" font-size="8.2" font-weight="800" fill="#485563">' + (es ? 'Altura ático confirmada: 66" (< 6 pies → máx. 20 pies)' : 'Confirmed attic height: 66" (< 6 ft → 20 ft max walkway)') + "</text>" +
      // Hatch on left
      '<rect x="38" y="128" width="58" height="40" rx="4" fill="#E6F0F8" stroke="#184E77" stroke-width="2"/>' +
      '<text x="67" y="146" text-anchor="middle" font-size="8" font-weight="800" fill="#184E77">' + (es ? "Escotilla" : "Hatch") + "</text>" +
      '<text x="67" y="158" text-anchor="middle" font-size="7.4" fill="#184E77">24"×36"</text>' +
      // 24" Walkway bar
      '<rect x="96" y="136" width="' + barW.toFixed(1) + '" height="24" fill="' + (pass ? "#E5F4EC" : "#FEECEB") + '" stroke="' + col + '" stroke-width="2"/>' +
      '<text x="' + (96 + barW / 2).toFixed(1) + '" y="151" text-anchor="middle" font-size="8.6" font-weight="800" fill="' + col + '">' + ft + (es ? " pies" : " ft") + " (" + sheets + (es ? " hojas)" : " shts)") + "</text>" +
      // 20 ft code max vertical line
      '<line x1="' + maxLineX.toFixed(1) + '" y1="110" x2="' + maxLineX.toFixed(1) + '" y2="188" stroke="#B42318" stroke-width="1.6" stroke-dasharray="4 2"/>' +
      '<text x="' + maxLineX.toFixed(1) + '" y="104" text-anchor="middle" font-size="7.8" font-weight="800" fill="#B42318">' + (es ? "MÁX. CÓDIGO 20 pies" : "20 ft CODE MAX") + "</text>" +
      // 30x30 Service Platform + Furnace
      '<rect x="' + (96 + barW).toFixed(1) + '" y="124" width="62" height="48" rx="4" fill="#FDF2E4" stroke="#A15206" stroke-width="1.8"/>' +
      '<text x="' + (96 + barW + 31).toFixed(1) + '" y="144" text-anchor="middle" font-size="7.6" font-weight="800" fill="#A15206">30"×30"</text>' +
      '<text x="' + (96 + barW + 31).toFixed(1) + '" y="156" text-anchor="middle" font-size="7" fill="#485563">' + (es ? "Plataforma" : "Platform") + "</text>" +
      // GFCI & Light callout bottom
      '<text x="230" y="206" text-anchor="middle" font-size="8.2" font-weight="700" fill="#184E77">' +
        (es ? 'Usar OSB 23/32" o triplay 3/4" (NUNCA triplay 3/8") · 1 tira real de 24" por hoja 4×8 · GFCI 120V ≤ 25 pies'
            : 'Use 23/32" OSB or 3/4" ply (NEVER 3/8" ply) · 1 true 24" strip per 4×8 sheet · 120V GFCI ≤ 25 ft') +
      "</text>" +
    "</svg>";
  }

  function renderAirSealSvg(es) {
    return '<svg viewBox="0 0 460 230" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="10" font-weight="800" fill="#184E77">' +
        (es ? "CORTE DE TAPA HERMÉTICA, AISLANTE Y DIQUE EN ÁTICO" : "AIRTIGHT LID, INSULATION & DAM CROSS-SECTION") + "</text>" +
      // Loose insulation outside dam
      '<rect x="24" y="96" width="90" height="62" fill="#FEF3C7" stroke="#D97706" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<rect x="346" y="96" width="90" height="62" fill="#FEF3C7" stroke="#D97706" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="69" y="130" text-anchor="middle" font-size="7.5" font-weight="700" fill="#A15206">' + (es ? "Aislante suelto" : "Loose insulation") + "</text>" +
      // 4-sided plywood dam standing 2" above loose fill
      '<rect x="114" y="64" width="10" height="108" fill="#D9A86C" stroke="#7C4D12" stroke-width="1.4"/>' +
      '<rect x="336" y="64" width="10" height="108" fill="#D9A86C" stroke="#7C4D12" stroke-width="1.4"/>' +
      '<text x="352" y="76" font-size="7.8" font-weight="800" fill="#7C4D12">' + (es ? 'Dique 4 lados (+2" alto)' : '4-sided dam (+2" above fill)') + "</text>" +
      // Unfaced batts stacked on lid + 3 wire loops
      '<rect x="134" y="88" width="192" height="44" rx="4" fill="#FCE7F3" stroke="#BE185D" stroke-width="1.4"/>' +
      '<text x="230" y="114" text-anchor="middle" font-size="8.2" font-weight="800" fill="#9D174D">' + (es ? "2 colchonetas R sin papel + 3 lazos de alambre cal. 16" : "2 unfaced R-batts + 3 loose 16-ga wire loops") + "</text>" +
      // 3/4" ply lid resting on 1x2 ledges with weatherstrip
      '<rect x="130" y="136" width="200" height="16" fill="#E6F0F8" stroke="#184E77" stroke-width="1.8"/>' +
      '<text x="230" y="147" text-anchor="middle" font-size="7.8" font-weight="800" fill="#184E77">' + (es ? 'Tapa triplay 3/4" (junta SIN sellador — probar abrir 2×)' : '3/4" ply lid (DO NOT caulk lid seam — test open 2×)') + "</text>" +
      // 1x2 ledges + foam weatherstrip
      '<rect x="124" y="152" width="22" height="10" fill="#1B6B46"/>' +
      '<rect x="314" y="152" width="22" height="10" fill="#1B6B46"/>' +
      '<text x="230" y="180" text-anchor="middle" font-size="8" font-weight="800" fill="#1B6B46">' + (es ? 'Empaque continuo 1/2"×1/8" sobre apoyos 1×2 limpios (sin pintura)' : 'Continuous 1/2"×1/8" foam weatherstrip on clean 1×2 ledges') + "</text>" +
      // Ceiling line + fixed frame backer rod
      '<line x1="24" y1="168" x2="124" y2="168" stroke="#131A22" stroke-width="2.4"/>' +
      '<line x1="336" y1="168" x2="436" y2="168" stroke="#131A22" stroke-width="2.4"/>' +
      '<text x="230" y="206" text-anchor="middle" font-size="8" font-weight="700" fill="#485563">' +
        (es ? 'Marco fijo sellado con cordón 3/8" + sellador pintable · Broches fuera del claro 24"×36"'
            : 'Fixed frame sealed w/ 3/8" backer rod + caulk · Latches mounted OUTSIDE 24"×36" clear') +
      "</text>" +
    "</svg>";
  }

  function renderEquip(es) {
    var sheets = calcSheets(state.walkwayFt);
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="attEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "🔧 Equipo y suministros " : "🔧 Equipment & Supplies ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="attEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Pasillo y plataforma (obra de John)" : "Walkway & Platform (John's Scope)") + "</h4>" +
            "<ul>" +
              "<li>" + sheets + (es ? ' hojas 4×8 de OSB 23/32" o triplay 3/4" (para ' + state.walkwayFt + " pies)" : ' sheets 4×8 of 23/32" OSB or 3/4" ply (for ' + state.walkwayFt + " ft run)") + "</li>" +
              "<li>" + (es ? 'Plataforma nivelada 30"×30" (SIN almohadillas antivibración — las trae NEXT)' : 'Level 30"×30" platform (NO vibration pads — NEXT provides)') + "</li>" +
              "<li>" + (es ? "Luz LED cerrada con apagador al acceso + contacto GFCI 120V (≤25 pies)" : "Entrance-switched enclosed LED utility light + line-side 120V GFCI (≤25 ft)") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Kit de escotilla (SOLO si NO es cortafuego)" : "Wood-Kit Supplies (ONLY if Non-Fire-Rated)") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? "13 pies lin. de 1×2 (apoyos) + 15 pies lin. de 1×3 (marco)" : "13 LF of 1×2 (ledges) + 15 LF of 1×3 (frame)") + "</li>" +
              "<li>" + (es ? '14 pies cordón respaldo 3/8" + 13 pies empaque espuma 1/2"×1/8"' : '14 LF 3/8" backer rod + 13 LF 1/2"×1/8" foam weatherstrip') + "</li>" +
              "<li>" + (es ? '2 colchonetas R sin papel + 3 lazos alambre cal. 16 + 6 armellas (≤1/2")' : '2 unfaced R-batts + 3 × 16-ga wire loops + 6 screw eyes (≤1/2")') + "</li>" +
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
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip is-danger";
      holdEl.innerHTML = es
        ? "<strong>NO CORTAR EL TECHO TODAVÍA:</strong> Confirmar ubicación (descanso Puerta 4 vs pasillo), clasificación cortafuego, ancho entre vigas B y reparar la gotera activa del techo antes de cortar o comprar madera. Mantener abierta la abertura temporal del clóset."
        : "<strong>DO NOT CUT CEILING YET:</strong> Confirm exact spot (Door 4 landing vs interior hall), ceiling fire-rating, joist bay width B, and fix the active roof leak before cutting or buying wood. Keep the temporary bedroom closet opening OPEN.";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Spot, Fire-Rating & Framing Check";
    var titleEs = "Ubicación, Cortafuego y Vigas";
    var subEn = '24" × 36" locked clear opening — fits Carrier/Bryant 45k furnace end-first';
    var subEs = 'Claro fijo 24" × 36" — la calefacción Carrier/Bryant 45k entra de punta';
    var inner = "";

    if (state.step === "spot") {
      var statusCls = state.fireRating === "yes" || state.joistBay === "14.5" || state.joistBay === "22.5" ? "is-fail" : (state.fireRating === "no" && state.joistBay === "27.5" ? "is-pass" : "is-warn");
      var statusText = state.fireRating === "yes"
        ? (es ? "ALTO: Si el plafón es cortafuego, NO usar kit de madera — comprar escotilla cortafuego certificada de 24\"×36\"." : "STOP: If the ceiling is fire-rated, DO NOT use the DIY wood kit — install a listed fire-rated 24\"×36\" access assembly.")
        : state.joistBay === "14.5" || state.joistBay === "22.5"
          ? (es ? "REQUIERE CABEZAL ESTRUCTURAL: Un claro de " + state.joistBay + "\" es menor a 27-1/2\". Necesita refuerzo estructural o mover de lugar; nunca reducir 24\"×36\"." : "NEEDS STRUCTURAL HEADER: A " + state.joistBay + "\" joist bay is narrower than 27-1/2\". Plan a structural header or alternate spot — never shrink 24\"×36\".")
          : state.fireRating === "no" && state.joistBay === "27.5"
            ? (es ? "✓ LISTO EN PAPEL: No cortafuego + claro 27-1/2\" calza exacto. Confirma gotera y ubicación final con Tisa." : "✓ GEOMETRY CLEAR: Non-fire-rated + 27-1/2\" bay is an exact fit. Confirm roof leak repair and final spot with Tisa.")
            : (es ? "EN ESPERA: Confirma clasificación cortafuego y mide el claro real entre vigas B antes de cortar." : "HOLD: Confirm ceiling fire-rating and measure actual joist bay B on site before cutting.");

      inner =
        '<div class="u4h-photo-grid">' +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/attic-hatch-candidate.jpg" alt="' + esc(es ? "Foto real del techo en descanso Puerta 4" : "Real photo of Door 4 landing ceiling") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Foto real — Descanso Puerta 4:" : "Real photo — Door 4 Landing:") + "</strong> " +
              (es ? "Conservar lámpara de techo y moldura alta Edwardian (103\"). Revisar espacio para escalera y giro de Puerta 4."
                  : "Keep existing ceiling light and original 103\" Edwardian picture rail untouched. Verify ladder clearance and Door 4 swing.") +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderHatchFramingSvg(es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "1. ¿El plafón es cortafuego?" : "1. Is this ceiling fire-rated?") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.fireRating === "unknown" ? " is-active" : "") + '" data-fire="unknown">' + (es ? "Sin confirmar (Pausa)" : "Unverified (Hold)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.fireRating === "no" ? " is-active" : "") + '" data-fire="no">' + (es ? "No — techo normal" : "No — standard ceiling") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.fireRating === "yes" ? " is-active" : "") + '" data-fire="yes">' + (es ? "Sí — cortafuego" : "Yes — fire-rated") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "2. Ancho medido entre vigas (B):" : "2. Measured joist bay width (B):") + "</span>" +
            '<div class="u4h-pill-group">' +
              [["unknown", es ? "Sin medir" : "Not measured"], ["14.5", '14-1/2"'], ["22.5", '22-1/2"'], ["27.5", '27-1/2"'], ["30", '> 27-1/2"']].map(function (opt) {
                return '<button type="button" class="u4h-pill' + (state.joistBay === opt[0] ? " is-active" : "") + '" data-bay="' + opt[0] + '">' + opt[1] + "</button>";
              }).join("") +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-status ' + statusCls + '">' + esc(statusText) + "</div>";

    } else if (state.step === "walkway") {
      titleEn = "Walkway Run & 4×8 Sheet Calculator";
      titleEs = "Calculadora de Pasillo y Hojas 4×8";
      subEn = '66" attic height caps continuous walkway at 20 ft max — slide to test distance';
      subEs = 'Altura de 66" limita el pasillo a 20 pies máx. — desliza para calcular hojas';
      var pass = state.walkwayFt <= 20;
      var sheets = calcSheets(state.walkwayFt);

      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Largo de pasillo" : "Walkway length") + "</div>" +
            '<div class="u4h-kpi-val ' + (pass ? "is-ok" : "is-fail") + '">' + state.walkwayFt + (es ? " pies / 20 máx." : " ft / 20 ft max") + "</div>" +
            '<div class="u4h-kpi-sub">' + (pass ? (es ? "Cumple CMC 304.4" : "Meets 20 ft code cap") : (es ? "¡Demasiado lejos!" : "Over 20 ft limit!")) + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Hojas 4×8 necesarias" : "4×8 sheets needed") + "</div>" +
            '<div class="u4h-kpi-val is-info">' + sheets + (es ? " hojas" : " sheets") + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? '1 tira real 24" por hoja' : '1 true 24" strip/sheet') + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Plataforma servicio" : "Service platform") + "</div>" +
            '<div class="u4h-kpi-val is-ok">30" × 30"</div>' +
            '<div class="u4h-kpi-sub">' + (es ? "Sin gomas (las trae NEXT)" : "No pads (NEXT provides)") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderWalkwaySvg(es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Distancia de escotilla a calefacción (pies):" : "Distance from hatch to furnace (ft):") + "</span>" +
            '<div class="u4h-slider-row">' +
              '<input type="range" id="attWalkSlider" min="6" max="24" step="1" value="' + state.walkwayFt + '">' +
              '<span class="u4h-slider-val">' + state.walkwayFt + " ft</span>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-status ' + (pass ? "is-pass" : "is-fail") + '">' +
          (pass
            ? (es ? "✓ PASA (" + state.walkwayFt + " pies ≤ 20 pies) — Compra " + sheets + " hoja(s) de OSB 23/32\" o triplay 3/4\". NUNCA usar triplay de 3/8\"."
                  : "✓ PASS (" + state.walkwayFt + " ft ≤ 20 ft max) — Plan " + sheets + " sheet(s) of 23/32\" OSB or 3/4\" structural ply. NEVER use 3/8\" ply.")
            : (es ? "✗ FALLA (" + state.walkwayFt + " pies > 20 pies) — Con 66\" de altura en ático el pasillo NO puede pasar de 20 pies. Acerca la calefacción o mueve la escotilla."
                  : "✗ FAIL (" + state.walkwayFt + " ft > 20 ft max) — At 66\" attic height, walkway cannot exceed 20 ft. Place furnace closer or move hatch.")) +
        "</div>";

    } else if (state.step === "seal") {
      titleEn = "Airtight Lid, Insulation & Dam";
      titleEs = "Tapa Hermética, Aislante y Dique";
      subEn = "How to keep conditioned air in and loose attic insulation from spilling when opened";
      subEs = "Cómo sellar el aire y evitar que caiga aislante al abrir la escotilla";

      inner =
        '<div class="u4h-svg-wrap">' + renderAirSealSvg(es) + "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Reglas clave del sellado" : "Key Enclosure Rules") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li><strong>" + (es ? "Marco fijo:" : "Fixed frame:") + "</strong> " + (es ? 'Sellar perímetro con cordón de respaldo 3/8" + sellador pintable.' : 'Seal frame perimeter with 3/8" backer rod + paintable caulk.') + "</li>" +
            "<li><strong>" + (es ? "Apoyos 1×2:" : "1×2 ledges:") + "</strong> " + (es ? 'Empaque continuo de espuma 1/2" × 1/8" sobre madera limpia (sin pintura ni silicón).' : 'Continuous 1/2" × 1/8" closed-cell foam on clean ledges (free of paint/caulk).') + "</li>" +
            "<li><strong>" + (es ? "Junta de tapa:" : "Lid perimeter seam:") + "</strong> " + (es ? "NUNCA sellar la tapa con caulk — probar abrir y cerrar dos veces." : "Leave lid seam UNCAULKED — test-open and close twice.") + "</li>" +
            "<li><strong>" + (es ? "Dique y broches:" : "Dam & latches:") + "</strong> " + (es ? 'Dique de triplay en 4 lados 2" arriba del aislante suelto; broches fuera del claro 24"×36".' : '4-sided plywood dam 2" above loose insulation; mount latches outside 24"×36" clear.') + "</li>" +
          "</ul>" +
        "</div>";

    } else {
      titleEn = "Go / No-Go Checklist Before Any Ceiling Cut";
      titleEs = "Lista de Candados Antes de Cortar el Techo";
      subEn = "Every gate must be confirmed before cutting ceiling drywall or buying hatch lumber";
      subEs = "Cada punto debe confirmarse antes de cortar plafón o comprar madera";

      var gates = [
        { k: "g1", en: "1. Active roof / attic water leak repaired", es: "1. Gotera activa del techo reparada" },
        { k: "g2", en: "2. Final hatch spot approved by Tisa (Door 4 landing vs interior hall)", es: "2. Ubicación final aprobada por Tisa (Puerta 4 vs pasillo interior)" },
        { k: "g3", en: "3. Ceiling fire-rating verified (DIY wood kit vs listed fire-rated assembly)", es: "3. Clasificación cortafuego verificada (madera vs tapa cortafuego certificada)" },
        { k: "g4", en: "4. Joist bay width B + overhead wires/pipes measured on site", es: "4. Claro entre vigas B y cables/tubería arriba medidos en obra" },
        { k: "g5", en: "5. Temp bedroom closet hole stays OPEN until LV cable + permanent hatch exist", es: "5. Abertura temporal en clóset recámara sigue ABIERTA hasta tener cable LV + escotilla" }
      ];

      inner =
        '<div class="u4h-item-list">' +
          gates.map(function (g) {
            var done = !!state.gates[g.k];
            return '<div class="u4h-item-card' + (done ? " is-selected" : "") + '">' +
              '<label style="display:flex;gap:10px;align-items:center;flex:1;cursor:pointer">' +
                '<input type="checkbox" data-gate="' + g.k + '"' + (done ? " checked" : "") + ' style="width:17px;height:17px;accent-color:var(--cobalt)">' +
                '<span class="u4h-item-name" style="font-size:13.5px">' + esc(es ? g.es : g.en) + "</span>" +
              "</label>" +
            "</div>";
          }).join("") +
        "</div>" +
        '<div class="u4h-cta-row">' +
          '<button type="button" class="u4h-action-btn" id="attLogBtn">' + (es ? "📝 Enviar medidas al PM" : "📝 Log site readings to PM") + "</button>" +
          '<a class="u4h-nav-link" href="' + esc(window.U4PlanNav.planUrl("hvac-layout")) + '">' + (es ? "Ver Plano de Calefacción →" : "Open Furnace & Ducts Plan →") + "</a>" +
        "</div>" +
        renderEquip(es);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="attPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + (es ? "Anterior" : "Prev") + "</button>" +
      '<span class="u4h-pager-count">' + (es ? "Paso " : "Step ") + (idx + 1) + (es ? " de " : " of ") + STEPS.length + "</span>" +
      '<button type="button" id="attNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + (es ? "Siguiente" : "Next") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(es ? titleEs : titleEn) + "</div>" +
            '<div class="u4h-sub">' + esc(es ? subEs : subEn) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">24"×36"</span>' +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); render(); window.scrollTo(0, 0); });
    });
    host.querySelectorAll("[data-fire]").forEach(function (b) {
      b.addEventListener("click", function () { state.fireRating = b.getAttribute("data-fire"); render(); });
    });
    host.querySelectorAll("[data-bay]").forEach(function (b) {
      b.addEventListener("click", function () { state.joistBay = b.getAttribute("data-bay"); render(); });
    });
    var sl = document.getElementById("attWalkSlider");
    if (sl) sl.addEventListener("input", function () { state.walkwayFt = parseInt(sl.value, 10) || 16; render(); });
    host.querySelectorAll("[data-gate]").forEach(function (cb) {
      cb.addEventListener("change", function () { state.gates[cb.getAttribute("data-gate")] = cb.checked; render(); });
    });
    var eqBtn = document.getElementById("attEquipBtn");
    if (eqBtn) eqBtn.addEventListener("click", function () { state.equipOpen = !state.equipOpen; render(); });
    var logBtn = document.getElementById("attLogBtn");
    if (logBtn) logBtn.addEventListener("click", function () {
      if (window.U4LiveAi) window.U4LiveAi.openNote("Attic hatch field readings — fireRating=" + state.fireRating + ", joistBay=" + state.joistBay + ", walkwayFt=" + state.walkwayFt + "ft: ");
    });
    var pBtn = document.getElementById("attPrevBtn");
    var nBtn = document.getElementById("attNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });
  }

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "attic-hatch",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { render(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); }
      });
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "attic-hatch",
        room: "attic-access",
        titleEn: "Permanent Attic Hatch & Walkway",
        titleEs: "Escotilla Permanente del Ático y Pasillo",
        getContext: function () {
          return "Step=" + state.step + ", LockedClear=24x36in, FireRating=" + state.fireRating + ", JoistBayB=" + state.joistBay + ", WalkwayRun=" + state.walkwayFt + "ft (max 20ft at 66in attic height, " + calcSheets(state.walkwayFt) + " sheets 4x8 OSB/ply). Active roof leak + temp bedroom closet hold.";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Entra la calefacción por 24\"×36\"?", "¿Cuántas hojas de OSB ocupo?", "¿Qué pasa si el techo es cortafuego?"]
            : ["Does the furnace fit through 24\"×36\"?", "How many 4×8 sheets do I need?", "What if the ceiling is fire-rated?"];
        }
      });
    }
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
