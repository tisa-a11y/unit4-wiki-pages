/* ============================================================================
   Attic Furnace & Ducts — Real-World Human-First Interactive Guide
   Two-Layer Architecture: Clean 3-Step Walkthrough UI + Hidden #blueprint-sheet-shell
   Zero External CDNs · Zero Prices · Zero Backend Clutter · Zero Storage · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "layout", en: "1. Attic Layout", es: "1. Plano en Ático" },
    { id: "section", en: "2. Height & Vent", es: "2. Altura y Flujo" },
    { id: "walkthrough", en: "3. Mon Walkthrough", es: "3. Visita Lunes 23" }
  ];

  // Clean normalized room plan coordinates inside 460x290 SVG (8 rooms of Unit 4)
  // Scale: 12 px = 1 ft (1 px = 1 in)
  // Door 4 hatch approx (122, 66); Furnace draggable inside attic footprint [95..355, 65..220]
  var state = {
    step: "layout",
    furnaceX: 226,
    furnaceY: 162,
    gfciOffsetFt: 3,
    flueClearIn: 1.5,
    dragActive: false,
    equipOpen: false,
    qChecks: { q1: false, q2: false, q3: false, q4: false, q5: false, q6: false }
  };

  var HATCH_X = 126;
  var HATCH_Y = 74;

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

  function computeMetrics() {
    // Orthogonal hallway walkway distance in feet from Door 4 hatch to furnace platform
    var dxPx = Math.abs(state.furnaceX - HATCH_X);
    var dyPx = Math.abs(state.furnaceY - HATCH_Y);
    var walkFt = +((dxPx + dyPx) / 10.2).toFixed(1);
    var walkPass = walkFt <= 20.0;
    var sheets = walkFt <= 7 ? 1 : (walkFt <= 14 ? 2 : (walkFt <= 20 ? 3 : Math.ceil(walkFt / 7)));
    var gfciPass = state.gfciOffsetFt <= 25;
    var fluePass = state.flueClearIn >= 1.0;
    return {
      walkFt: walkFt,
      walkPass: walkPass,
      sheets: sheets,
      gfciPass: gfciPass,
      fluePass: fluePass
    };
  }

  function renderAtticPlanSvg(m, es) {
    var fx = state.furnaceX;
    var fy = state.furnaceY;
    var walkCol = m.walkPass ? "#1B6B46" : "#B42318";
    var walkFill = m.walkPass ? "#E5F4EC" : "#FEECEB";

    // Fixed room register targets (Living S1, Dining/Kitchen S2, Bedroom S3, Return RET, Jump JD)
    var s1 = { x: 325, y: 230, lbl: es ? "S1 Sala" : "S1 Living" };
    var s2 = { x: 162, y: 230, lbl: es ? "S2 Comedor" : "S2 Dining" };
    var s3 = { x: 332, y: 92, lbl: es ? "S3 Recámara" : "S3 Bedroom" };
    var ret = { x: 186, y: 122, lbl: es ? "Retorno" : "Return" };
    var jd = { x: 274, y: 112, lbl: "Jump" };

    return '<svg id="hvacHumanSvg" viewBox="0 0 460 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Plano interactivo de calefacción y ductos en el ático" : "Interactive attic furnace and ductwork plan") + '" style="touch-action:none">' +
      // Top orientation & compass
      '<text x="16" y="18" font-size="9.2" font-weight="800" fill="#184E77">' +
        (es ? "ÁTICO SOBRE UNIDAD 4 · ← OESTE (Cocina) | NORTE ↑ | ESTE (Sala) →" : "ATTIC OVER UNIT 4 · ← WEST (Kitchen) | NORTH ↑ | EAST (Bay) →") + "</text>" +
      '<g transform="translate(432,26)">' +
        '<circle r="14" fill="#F6F8FA" stroke="#C2CCD6" stroke-width="1"/>' +
        '<polygon points="0,-10 -3,-4 3,-4" fill="#184E77"/>' +
        '<text x="0" y="9" text-anchor="middle" font-size="6.5" font-weight="800" fill="#184E77">N</text>' +
      "</g>" +

      // Simplified clean Unit 4 8-room footprint below attic (zero overlapping labels!)
      // West: Kitchen
      '<rect x="22" y="160" width="90" height="106" fill="#FCFDFE" stroke="#94A3B8" stroke-width="1.4"/>' +
      '<text x="67" y="214" text-anchor="middle" font-size="8.2" font-weight="700" fill="#6E7D8C">' + (es ? "Cocina" : "Kitchen") + "</text>" +
      '<text x="67" y="226" text-anchor="middle" font-size="6.8" fill="#A15206">' + (es ? "(Campana aparte)" : "(Hood separate)") + "</text>" +

      // NW: Door 4 Landing + Bathroom + Laundry
      '<rect x="94" y="42" width="66" height="72" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.4"/>' +
      '<text x="127" y="54" text-anchor="middle" font-size="7.4" font-weight="700" fill="#485563">' + (es ? "Puerta 4" : "Door 4") + "</text>" +
      '<rect x="160" y="42" width="66" height="72" fill="#FCFDFE" stroke="#94A3B8" stroke-width="1.4"/>' +
      '<text x="193" y="60" text-anchor="middle" font-size="7.6" font-weight="700" fill="#6E7D8C">' + (es ? "Baño" : "Bath") + "</text>" +
      '<rect x="226" y="42" width="44" height="72" fill="#FCFDFE" stroke="#94A3B8" stroke-width="1.4"/>' +
      '<text x="248" y="60" text-anchor="middle" font-size="7" font-weight="700" fill="#6E7D8C">' + (es ? "Lav." : "Ldry") + "</text>" +

      // NE: Bedroom + Bay
      '<path d="M 270 42 L 392 42 L 424 72 L 424 148 L 270 148 Z" fill="#FCFDFE" stroke="#94A3B8" stroke-width="1.4"/>' +
      '<text x="348" y="62" text-anchor="middle" font-size="8.2" font-weight="700" fill="#6E7D8C">' + (es ? "Recámara" : "Bedroom") + "</text>" +

      // Center: Hallway
      '<rect x="112" y="114" width="158" height="46" fill="#F6F8FA" stroke="#94A3B8" stroke-width="1.2"/>' +
      '<text x="132" y="152" font-size="7.2" font-weight="700" fill="#6E7D8C">' + (es ? "Pasillo" : "Hall") + "</text>" +

      // South: Dining + Living Room + Bay
      '<rect x="112" y="160" width="128" height="106" fill="#FCFDFE" stroke="#94A3B8" stroke-width="1.4"/>' +
      '<text x="176" y="256" text-anchor="middle" font-size="8.2" font-weight="700" fill="#6E7D8C">' + (es ? "Comedor" : "Dining") + "</text>" +
      '<path d="M 240 160 L 424 160 L 424 236 L 392 266 L 240 266 Z" fill="#FCFDFE" stroke="#94A3B8" stroke-width="1.4"/>' +
      '<text x="330" y="256" text-anchor="middle" font-size="8.2" font-weight="700" fill="#6E7D8C">' + (es ? "Sala" : "Living Room") + "</text>" +

      // Door 4 Permanent Hatch 24" x 36"
      '<rect x="' + (HATCH_X - 18) + '" y="' + (HATCH_Y - 12) + '" width="36" height="24" rx="3" fill="#FDF2E4" stroke="#A15206" stroke-width="1.8" stroke-dasharray="4 2"/>' +
      '<text x="' + HATCH_X + '" y="' + (HATCH_Y + 3) + '" text-anchor="middle" font-size="7.2" font-weight="800" fill="#A15206">24"×36"</text>' +

      // Continuous 24" Walkway L-path from Hatch to Furnace
      '<path d="M ' + HATCH_X + " " + (HATCH_Y + 12) + " L " + HATCH_X + " " + fy + " L " + fx + " " + fy + '" fill="none" stroke="' + walkCol + '" stroke-width="12" stroke-linejoin="round" opacity="0.22"/>' +
      '<path d="M ' + HATCH_X + " " + (HATCH_Y + 12) + " L " + HATCH_X + " " + fy + " L " + fx + " " + fy + '" fill="none" stroke="' + walkCol + '" stroke-width="2" stroke-dasharray="5 3"/>' +

      // Supply Duct Lines (Blue) + Return (Teal Dashed) + Jump (Purple)
      '<line x1="' + fx + '" y1="' + fy + '" x2="' + s1.x + '" y2="' + s1.y + '" stroke="#184E77" stroke-width="2.2"/>' +
      '<line x1="' + fx + '" y1="' + fy + '" x2="' + s2.x + '" y2="' + s2.y + '" stroke="#184E77" stroke-width="2.2"/>' +
      '<line x1="' + fx + '" y1="' + fy + '" x2="' + s3.x + '" y2="' + s3.y + '" stroke="#184E77" stroke-width="2.2"/>' +
      '<line x1="' + fx + '" y1="' + fy + '" x2="' + ret.x + '" y2="' + ret.y + '" stroke="#0F766E" stroke-width="2" stroke-dasharray="4 3"/>' +
      '<line x1="' + fx + '" y1="' + fy + '" x2="' + jd.x + '" y2="' + jd.y + '" stroke="#6D28D9" stroke-width="1.6" stroke-dasharray="3 3"/>' +

      // Register pills
      [s1, s2, s3].map(function (pt) {
        return '<rect x="' + (pt.x - 32) + '" y="' + (pt.y - 9) + '" width="64" height="18" rx="4" fill="#184E77"/>' +
          '<text x="' + pt.x + '" y="' + (pt.y + 3) + '" text-anchor="middle" font-size="7.4" font-weight="800" fill="#FFFFFF">' + esc(pt.lbl) + "</text>";
      }).join("") +
      '<rect x="' + (ret.x - 26) + '" y="' + (ret.y - 9) + '" width="52" height="18" rx="4" fill="#0F766E"/>' +
      '<text x="' + ret.x + '" y="' + (ret.y + 3) + '" text-anchor="middle" font-size="7.4" font-weight="800" fill="#FFFFFF">' + esc(ret.lbl) + "</text>" +
      '<rect x="' + (jd.x - 20) + '" y="' + (jd.y - 8) + '" width="40" height="16" rx="4" fill="#6D28D9"/>' +
      '<text x="' + jd.x + '" y="' + (jd.y + 2.5) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#FFFFFF">JD</text>' +

      // Draggable Furnace + 30x30 Platform + Type B Flue badge
      '<g id="hvacDragFurnace" style="cursor:grab">' +
        '<rect x="' + (fx - 26) + '" y="' + (fy - 22) + '" width="52" height="44" rx="5" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.5" stroke-dasharray="3 2"/>' +
        '<rect x="' + (fx - 21) + '" y="' + (fy - 14) + '" width="42" height="28" rx="4" fill="#131A22" stroke="#6FB3E6" stroke-width="1.8"/>' +
        '<text x="' + fx + '" y="' + (fy - 1) + '" text-anchor="middle" font-size="7.2" font-weight="800" fill="#FFFFFF">' + (es ? "EQUIPO" : "FURNACE") + "</text>" +
        '<text x="' + fx + '" y="' + (fy + 9) + '" text-anchor="middle" font-size="6.8" font-weight="700" fill="#6FB3E6">45k BTU</text>' +
        '<circle cx="' + (fx + 22) + '" cy="' + (fy - 16) + '" r="8" fill="#FDF2E4" stroke="#A15206" stroke-width="1.5"/>' +
        '<text x="' + (fx + 22) + '" y="' + (fy - 13.5) + '" text-anchor="middle" font-size="7.4" font-weight="800" fill="#A15206">B</text>' +
      "</g>" +

      // Clean floating walkway badge at bottom-left clear of rooms
      '<rect x="22" y="274" width="416" height="20" rx="5" fill="' + walkFill + '" stroke="' + walkCol + '" stroke-width="1"/>' +
      '<text x="230" y="287" text-anchor="middle" font-size="8.2" font-weight="800" fill="' + walkCol + '">' +
        (es ? "Pasillo 24\": " + m.walkFt + " pies / 20 máx. (" + (m.walkPass ? "PASA ✓" : "EXCEDE ✗") + ") · " + m.sheets + " hojas 4×8 · GFCI: " + state.gfciOffsetFt + " pies · Ducto B: " + state.flueClearIn + '"'
            : "24\" Walkway: " + m.walkFt + " ft / 20 ft max (" + (m.walkPass ? "PASS ✓" : "OVER LIMIT ✗") + ") · " + m.sheets + " sheets 4×8 · GFCI: " + state.gfciOffsetFt + " ft · Type B: " + state.flueClearIn + '"') +
      "</text>" +
    "</svg>";
  }

  function renderSectionSvg(es) {
    return '<svg viewBox="0 0 460 210" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="10" font-weight="800" fill="#184E77">' +
        (es ? 'CORTE VERTICAL DEL ÁTICO (ALTURA 66" · DUCTO TIPO B ≥ 1" LIBRE)' : 'ATTIC VERTICAL SECTION (66" RIDGE HEIGHT · TYPE B FLUE ≥ 1" CLEAR)') + "</text>" +
      '<polygon points="30,174 230,36 430,174" fill="#F8FAFC" stroke="#131A22" stroke-width="2"/>' +
      '<line x1="30" y1="174" x2="430" y2="174" stroke="#131A22" stroke-width="2.4"/>' +
      // 66" height dimension
      '<line x1="168" y1="78" x2="168" y2="174" stroke="#184E77" stroke-width="1.4" stroke-dasharray="3 2"/>' +
      '<rect x="116" y="114" width="96" height="18" rx="4" fill="#E6F0F8" stroke="#184E77" stroke-width="1"/>' +
      '<text x="164" y="126" text-anchor="middle" font-size="8" font-weight="800" fill="#184E77">' + (es ? '66" altura ático' : '66" attic height') + "</text>" +
      // Type B double wall flue going straight through existing roof jack
      '<rect x="260" y="34" width="14" height="106" fill="#FDF2E4" stroke="#A15206" stroke-width="1.8"/>' +
      '<text x="282" y="64" font-size="8.2" font-weight="800" fill="#A15206">' + (es ? "Ducto Tipo B (doble pared)" : "Type B double-wall flue") + "</text>" +
      '<text x="282" y="76" font-size="7.4" font-weight="700" fill="#1B6B46">' + (es ? '≥ 1" libre a madera · reusar salida' : '≥ 1" clear to wood · reuse roof jack') + "</text>" +
      // Furnace sitting on 30x30 platform
      '<rect x="220" y="136" width="60" height="30" rx="3" fill="#131A22" stroke="#6FB3E6" stroke-width="1.6"/>' +
      '<text x="250" y="150" text-anchor="middle" font-size="7.6" font-weight="800" fill="#FFFFFF">45k BTU</text>' +
      '<text x="250" y="160" text-anchor="middle" font-size="6.8" fill="#6FB3E6">33-1/4" H</text>' +
      '<rect x="206" y="166" width="88" height="8" fill="#1B6B46"/>' +
      '<text x="250" y="192" text-anchor="middle" font-size="8.2" font-weight="800" fill="#1B6B46">' +
        (es ? 'Plataforma sólida 30"×30" (obra de John · SIN gomas antivibración — las trae NEXT)' : 'Solid 30"×30" platform (John builds · NO vibration pads — NEXT provides)') +
      "</text>" +
    "</svg>";
  }

  function renderEquip(m, es) {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="hvacEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "🔧 Equipo y suministros " : "🔧 Equipment & Supplies ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="hvacEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Alcance de John (carpintería y eléctrico)" : "John / Crew Scope (Prep Only)") + "</h4>" +
            "<ul>" +
              "<li>" + m.sheets + (es ? ' hojas 4×8 OSB 23/32" o triplay 3/4" (pasillo ' + m.walkFt + " pies)" : ' sheets 4×8 of 23/32" OSB or 3/4" ply (' + m.walkFt + " ft walkway)") + "</li>" +
              "<li>" + (es ? 'Plataforma nivelada 30"×30" (NO comprar gomas antivibración)' : 'Level 30"×30" solid platform (do NOT buy vibration pads)') + "</li>" +
              "<li>" + (es ? "Luz LED con apagador en acceso + contacto GFCI 120V (≤25 pies) + desconectador" : "Switched LED attic light + line-side 120V GFCI (≤25 ft) + furnace disconnect") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Alcance de NEXT HVAC (SOLO calefacción)" : "NEXT HVAC Scope (Heating ONLY)") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? "Equipo Carrier/Bryant Legacy 45k BTU (80% AFUE, Low NOx)" : "Carrier/Bryant Legacy 45k BTU furnace (80% AFUE, Low NOx)") + "</li>" +
              "<li>" + (es ? "3 ductos suministro (Sala, Comedor, Recámara) + Retorno + Jump duct + Tipo B" : "3 supply runs (Living, Dining, Bedroom) + Return + Jump duct + Type B flue") + "</li>" +
              "<li><strong>" + (es ? "NO incluye campana de cocina:" : "Does NOT include kitchen range hood:") + "</strong> " + (es ? "la campana va aparte por su propio ducto." : "range hood uses its own dedicated duct.") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function wireDrag(host) {
    var svg = document.getElementById("hvacHumanSvg");
    var handle = document.getElementById("hvacDragFurnace");
    if (!svg || !handle) return;

    function ptFromEvent(ev) {
      var rect = svg.getBoundingClientRect();
      var cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      var cy = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top;
      return {
        x: Math.max(122, Math.min(340, Math.round((cx / rect.width) * 460))),
        y: Math.max(92, Math.min(212, Math.round((cy / rect.height) * 300)))
      };
    }

    function onMove(ev) {
      if (!state.dragActive) return;
      ev.preventDefault();
      var pt = ptFromEvent(ev);
      state.furnaceX = pt.x;
      state.furnaceY = pt.y;
      render();
    }

    function onUp() {
      state.dragActive = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchcancel", onUp);
    }

    handle.addEventListener("mousedown", function (ev) {
      ev.preventDefault();
      state.dragActive = true;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });
    handle.addEventListener("touchstart", function (ev) {
      ev.preventDefault();
      state.dragActive = true;
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
      window.addEventListener("touchcancel", onUp);
    }, { passive: false });
  }

  function render() {
    var host = document.getElementById("u4hBody");
    var holdEl = document.getElementById("u4hHoldStrip");
    if (!host) return;
    var es = isEs();
    var m = computeMetrics();
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip";
      holdEl.innerHTML = es
        ? "<strong>PLANIFICACIÓN — VISITA LUNES 23 NOV (2–4 PM CON SERGE Y ALEX):</strong> Cero cortes en techo ni perforaciones nuevas todavía. <strong>NEXT HVAC es SOLO calefacción y ductos de aire</strong> (NO la campana de la estufa)."
        : "<strong>PLANNING SANDBOX — MON NOV 23 WALKTHROUGH (2–4 PM WITH SERGE &amp; ALEX):</strong> No ceiling cuts or roof holes yet. <strong>NEXT HVAC is heating furnace &amp; ducts ONLY</strong> (NOT the kitchen range hood exhaust).";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Interactive Attic Furnace & Duct Layout";
    var titleEs = "Plano Interactivo de Calefacción y Ductos";
    var subEn = "Drag the furnace on the plan (or tap a preset) to test the 20 ft walkway cap live";
    var subEs = "Arrastra el equipo en el plano (o toca una opción rápida) para probar el límite de 20 pies";
    var inner = "";

    if (state.step === "layout") {
      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Pasillo desde Puerta 4" : "Walkway from Door 4") + "</div>" +
            '<div class="u4h-kpi-val ' + (m.walkPass ? "is-ok" : "is-fail") + '">' + m.walkFt + (es ? " pies / 20" : " ft / 20 ft") + "</div>" +
            '<div class="u4h-kpi-sub">' + m.sheets + (es ? " hojas 4×8 OSB/triplay" : " sheets 4×8 OSB/ply") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Contacto GFCI 120V" : "120V Service GFCI") + "</div>" +
            '<div class="u4h-kpi-val is-ok">' + state.gfciOffsetFt + (es ? " pies (≤ 25)" : " ft (≤ 25 ft)") + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "Vivo independiente del switch" : "Line-side at platform") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Claro ducto Tipo B" : "Type B flue clear") + "</div>" +
            '<div class="u4h-kpi-val is-ok">1-1/2" (≥ 1")</div>' +
            '<div class="u4h-kpi-sub">' + (es ? "Reusar salida de techo" : "Reuse roof jack goal") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-hint">' +
          "<span>" + (es ? "✋ Arrastra el cuadro negro del equipo en el dibujo o elige una ubicación rápida:" : "✋ Drag the dark FURNACE box on the plan or tap a quick placement:") + "</span>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderAtticPlanSvg(m, es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Probar ubicación rápida del equipo:" : "Quick-test furnace spot:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill" data-preset="close">' + (es ? "Cerca de Puerta 4 (~13 pies · 2 hojas)" : "Closer to Hatch (~13 ft · 2 sheets)") + "</button>" +
              '<button type="button" class="u4h-pill" data-preset="center">' + (es ? "Centro pasillo (~18.4 pies · 3 hojas)" : "Central Hall (~18.4 ft · 3 sheets)") + "</button>" +
              '<button type="button" class="u4h-pill" data-preset="far">' + (es ? "Lejos hacia Sala (>20 pies · Falla)" : "Far East (>20 ft · Fails cap)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-status ' + (m.walkPass ? "is-pass" : "is-fail") + '">' +
          (m.walkPass
            ? (es ? "✓ PASA — Pasillo de " + m.walkFt + " pies cumple el límite de 20 pies (altura ático 66\"). Requiere " + m.sheets + " hoja(s) de 4×8."
                  : "✓ PASS — " + m.walkFt + " ft walkway meets the 20 ft code cap (66\" attic height). Plan " + m.sheets + " sheet(s) of 4×8 OSB/ply.")
            : (es ? "✗ DEMASIADO LEJOS (" + m.walkFt + " pies > 20 pies) — Acerca la calefacción al acceso de Puerta 4 para cumplir código."
                  : "✗ TOO FAR (" + m.walkFt + " ft > 20 ft max) — Move furnace closer to the Door 4 hatch to meet the 20 ft walkway cap.")) +
        "</div>";

    } else if (state.step === "section") {
      titleEn = '66" Attic Height, Roof Flue & Access Photo';
      titleEs = 'Altura de 66", Salida de Techo y Foto de Acceso';
      subEn = "Why walkway maxes out at 20 ft and how to reuse the existing roof penetration";
      subEs = "Por qué el pasillo tiene tope de 20 pies y cómo reutilizar la salida existente en techo";

      inner =
        '<div class="u4h-svg-wrap">' + renderSectionSvg(es) + "</div>" +
        '<div class="u4h-photo-grid">' +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/attic-hatch-candidate.jpg" alt="' + esc(es ? "Foto real descanso Puerta 4" : "Real Door 4 landing ceiling photo") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Acceso candidato — Puerta 4:" : "Candidate access — Door 4:") + "</strong> " +
              (es ? 'Escotilla 24"×36" libre deja pasar el equipo Carrier/Bryant (14-3/16"×29") de punta con margen.' : 'Locked 24"×36" clear hatch passes the 14-3/16"×29" furnace end-first with room to spare.') +
            "</div>" +
          "</div>" +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/unit4-floorplan-proof.png" alt="' + esc(es ? "Planta de referencia Unidad 4" : "Unit 4 reference floor plan") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Planta completa Unidad 4:" : "Unit 4 full floor plan:") + "</strong> " +
              (es ? "Referencia de cuartos debajo del ático (Oeste Cocina → Este Sala/Recámara)." : "Reference of all 8 rooms below the attic (West Kitchen → East Bay rooms).") +
            "</div>" +
          "</div>" +
        "</div>";

    } else {
      titleEn = "Mon Nov 23 Walkthrough Questions (Serge & Alex)";
      titleEs = "Preguntas para Visita Lunes 23 Nov (Serge y Alex)";
      subEn = "Check off each decision live on site and log answers straight to the project record";
      subEs = "Confirma cada punto en la visita y guarda las respuestas directo al proyecto";

      var qs = [
        { k: "q1", en: "1. Confirm exact Carrier/Bryant 45k BTU SKU & cabinet dimensions", es: "1. Confirmar modelo exacto Carrier/Bryant 45k BTU y medidas de gabinete" },
        { k: "q2", en: "2. Lock exact furnace location keeping 24\" walkway ≤ 20 ft from hatch", es: "2. Definir lugar exacto del equipo manteniendo pasillo 24\" ≤ 20 pies" },
        { k: "q3", en: "3. Verify Type B flue can reuse existing roof jack (avoid new roof holes)", es: "3. Verificar si el ducto Tipo B reutiliza la salida existente del techo" },
        { k: "q4", en: "4. Mark exact ceiling spots for 3 supply boots, Return filter box & Jump duct", es: "4. Marcar en techo los 3 suministros, caja de retorno con filtro y jump duct" },
        { k: "q5", en: "5. Confirm Door 4 hatch spot & ceiling fire-rating with Tisa before cutting", es: "5. Confirmar lugar de escotilla Puerta 4 y si es cortafuego con Tisa" },
        { k: "q6", en: "6. Confirm dedicated furnace circuit, disconnect in sight & line-side GFCI", es: "6. Confirmar circuito dedicado, desconectador a la vista y GFCI 120V" }
      ];

      inner =
        '<div class="u4h-item-list">' +
          qs.map(function (q) {
            var done = !!state.qChecks[q.k];
            return '<div class="u4h-item-card' + (done ? " is-selected" : "") + '">' +
              '<label style="display:flex;gap:10px;align-items:center;flex:1;cursor:pointer">' +
                '<input type="checkbox" data-q="' + q.k + '"' + (done ? " checked" : "") + ' style="width:17px;height:17px;accent-color:var(--cobalt)">' +
                '<span class="u4h-item-name" style="font-size:13.5px">' + esc(es ? q.es : q.en) + "</span>" +
              "</label>" +
            "</div>";
          }).join("") +
        "</div>" +
        '<div class="u4h-cta-row">' +
          '<button type="button" class="u4h-action-btn" id="hvacLogBtn">' + (es ? "📝 Guardar notas de la visita" : "📝 Log walkthrough answers") + "</button>" +
          '<a class="u4h-nav-link" href="' + esc(window.U4PlanNav.planUrl("attic-hatch")) + '">' + (es ? "Abrir Escotilla Ático →" : "Open Attic Hatch Plan →") + "</a>" +
        "</div>" +
        renderEquip(m, es);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="hvacPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + (es ? "Anterior" : "Prev") + "</button>" +
      '<span class="u4h-pager-count">' + (es ? "Paso " : "Step ") + (idx + 1) + (es ? " de " : " of ") + STEPS.length + "</span>" +
      '<button type="button" id="hvacNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + (es ? "Siguiente" : "Next") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(es ? titleEs : titleEn) + "</div>" +
            '<div class="u4h-sub">' + esc(es ? subEs : subEn) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">66" H · ≤20 ft</span>' +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); render(); window.scrollTo(0, 0); });
    });
    host.querySelectorAll("[data-preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-preset");
        if (p === "close") { state.furnaceX = 186; state.furnaceY = 148; }
        else if (p === "center") { state.furnaceX = 226; state.furnaceY = 162; }
        else { state.furnaceX = 312; state.furnaceY = 192; }
        render();
      });
    });
    host.querySelectorAll("[data-q]").forEach(function (cb) {
      cb.addEventListener("change", function () { state.qChecks[cb.getAttribute("data-q")] = cb.checked; render(); });
    });
    var eqBtn = document.getElementById("hvacEquipBtn");
    if (eqBtn) eqBtn.addEventListener("click", function () { state.equipOpen = !state.equipOpen; render(); });
    var logBtn = document.getElementById("hvacLogBtn");
    if (logBtn) logBtn.addEventListener("click", function () {
      if (window.U4LiveAi) window.U4LiveAi.openNote("HVAC Mon Nov 23 walkthrough notes (walkway=" + m.walkFt + "ft, sheets=" + m.sheets + "): ");
    });
    var pBtn = document.getElementById("hvacPrevBtn");
    var nBtn = document.getElementById("hvacNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });

    if (state.step === "layout") wireDrag(host);
  }

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "hvac-layout",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { render(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); }
      });
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "hvac-layout",
        room: "hvac",
        titleEn: "Attic Furnace & Ducts Layout",
        titleEs: "Plano de Calefacción y Ductos en Ático",
        getContext: function () {
          var m = computeMetrics();
          return "Step=" + state.step + ", Walkway=" + m.walkFt + "ft (20ft cap at 66in attic height, " + m.sheets + " sheets), Furnace=Carrier/Bryant 45k BTU, NEXT HVAC=heating ONLY (not kitchen hood), Mon Nov 23 2-4pm walkthrough with Serge & Alex.";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿NEXT HVAC conecta la campana de cocina?", "¿Cuál es el límite del pasillo en ático?", "¿John compra gomas antivibración?"]
            : ["Does NEXT HVAC connect the kitchen range hood?", "What is the max walkway length in the attic?", "Should John buy vibration pads?"];
        }
      });
    }
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
