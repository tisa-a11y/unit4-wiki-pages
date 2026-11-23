/* ============================================================================
   Plan 1: Attic Hatch, Wood Walkway & Service Platform (R7 Dark-Mode & UI Polish)
   4 Focused Carpentry & Enclosure Views:
     1. Walkway Map (24"×36" clear hatch outside Door 4 + draggable 30"×30" platform)
     2. Door 4 Framing (full-width framing SVG + uncropped upright Door 4 landing photo)
     3. Lid & Air Seal (cross-section SVG + air-seal rules + Equipment & Supplies drawer)
     4. Pre-Cut Checks (interactive crew pre-cut hold checklist)
   Zero Ductwork Clutter · Zero Walkthrough Tab · Zero Prices · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "map", en: "1. Walkway Map", es: "1. Mapa y Pasillo" },
    { id: "framing", en: "2. Door 4 Framing", es: "2. Marco Puerta 4" },
    { id: "seal", en: "3. Lid & Air Seal", es: "3. Tapa y Sellado" },
    { id: "checks", en: "4. Pre-Cut Checks", es: "4. Candados de Corte" }
  ];

  var SC = 0.86;
  var OX = 28;
  var OY = 40;
  function px(xIn) { return +(OX + xIn * SC).toFixed(1); }
  function py(yIn) { return +(OY + yIn * SC).toFixed(1); }

  var HATCH_DOOR4 = { x: 112, y: 74, w: 24, h: 36 };

  var bootParams = new URLSearchParams(window.location.search || "");

  function resolveStep(raw) {
    var s = String(raw || "").toLowerCase().trim();
    if (s === "2" || s === "framing" || s === "hatch" || s === "spot" || s === "opening") return "framing";
    if (s === "3" || s === "seal" || s === "lid" || s === "lumber" || s === "dam") return "seal";
    if (s === "4" || s === "checks" || s === "hold" || s === "gates") return "checks";
    return "map";
  }

  var rawFx = bootParams.get("fx");
  var rawFy = bootParams.get("fy");
  var initFx = rawFx !== null && rawFx !== "" ? Number(rawFx) : NaN;
  var initFy = rawFy !== null && rawFy !== "" ? Number(rawFy) : NaN;
  var state = {
    step: resolveStep(bootParams.get("step")),
    furnacePos: {
      x: isFinite(initFx) && initFx >= 162 && initFx <= 420 ? Math.round(initFx) : 174,
      y: isFinite(initFy) && initFy >= 140 && initFy <= 274 ? Math.round(initFy) : 258
    },
    preset: "sw_dining",
    ceilingType: "hold",
    joistBay: "unknown",
    checks: {},
    dragActive: false
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

  function computeWalkway(fPos) {
    var h = HATCH_DOOR4;
    var platCenterY = fPos.y - 29.5;
    var hallSpineY = 108;
    var platEdgeY = platCenterY <= hallSpineY ? Math.min(fPos.y - 14.5, platCenterY + 15) : platCenterY - 15;
    var hatchEastX = h.x + h.w / 2;
    var hatchMidY = h.y;
    var pts;

    if (fPos.x >= 162 && fPos.x <= 192 && platEdgeY >= hatchMidY) {
      pts = [
        { x: hatchEastX, y: hatchMidY },
        { x: fPos.x, y: hatchMidY },
        { x: fPos.x, y: platEdgeY }
      ];
    } else {
      var entryX = 170;
      pts = [
        { x: hatchEastX, y: hatchMidY },
        { x: entryX, y: hatchMidY },
        { x: entryX, y: hallSpineY },
        { x: fPos.x, y: hallSpineY },
        { x: fPos.x, y: platEdgeY }
      ];
    }

    var lenIn = 0;
    for (var i = 1; i < pts.length; i++) {
      lenIn += Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
    }
    var walkFt = +(lenIn / 12).toFixed(1);
    var walkPass = walkFt <= 20.0;
    var walkSheets = walkFt <= 7 ? 1 : (walkFt <= 14 ? 2 : (walkFt <= 20 ? 3 : Math.ceil(walkFt / 7)));
    var dStr = pts.map(function (pt, idx) {
      return (idx === 0 ? "M " : " L ") + px(pt.x) + " " + py(pt.y);
    }).join("");

    return {
      pts: pts,
      d: dStr,
      walkFt: walkFt,
      walkPass: walkPass,
      walkSheets: walkSheets,
      totalSheets: walkSheets + 1
    };
  }

  function syncUrl() {
    try {
      var next = new URLSearchParams(window.location.search || "");
      next.set("step", state.step);
      next.set("fx", String(Math.round(state.furnacePos.x)));
      next.set("fy", String(Math.round(state.furnacePos.y)));
      window.history.replaceState(null, "", "?" + next.toString() + (window.location.hash || ""));
    } catch (_) {}
  }

  function renderMapLegend(es) {
    var items = [
      { col: "#1f5f7a", lbl: es ? 'Escotilla 24"×36" (Afuera Puerta 4)' : '24"×36" Clear Hatch (Outside Door 4)' },
      { col: "#d99b52", lbl: es ? 'Pasillo Continuo Madera 24"' : '24" Continuous Wood Walkway' },
      { col: "#2f6b3f", lbl: es ? 'Plataforma Servicio 30"×30"' : '30"×30" Wood Service Platform' },
      { col: "#9a5b06", lbl: es ? "Clóset Temp. (Mantener Abierto)" : "Temp. Closet Opening (Keep Open)" }
    ];
    return '<div class="u4h-legend-row">' +
      items.map(function (it) {
        return '<span class="u4h-legend-chip"><span class="u4h-legend-dot" style="background:' + it.col + '"></span>' + esc(it.lbl) + "</span>";
      }).join("") +
    "</div>";
  }

  function renderEquipDrawer(m, es) {
    var rows = es
      ? [
          m.walkSheets + ' hojas 4×8 de OSB estructural 23/32" o triplay CDX 3/4" para el pasillo de 24" (1 tira por hoja; nunca triplay 3/8").',
          '1 hoja 4×8 adicional de triplay 3/4" para la plataforma nivelada de 30" × 30" (lado Norte) y el dique de 4 lados (+2").',
          'Tiras limpias de 1×2 + empaque continuo de espuma cerrada de 1/2" × 1/8" + cordón de respaldo de 3/8" y sellador.',
          '2 colchonetas de fibra de vidrio sin papel + 3 lazos sueltos de alambre calibre 16 + broches fuera del claro de 24" × 36".',
          '1 lámpara LED cerrada permanente con apagador junto a la escotilla + 1 contacto GFCI 120V a ≤ 25 pies del calefactor.'
        ]
      : [
          m.walkSheets + ' sheets (4×8) of 23/32" rated OSB or 3/4" structural plywood for the 24" walkway (1 strip per sheet; never 3/8" ply).',
          '1 additional 4×8 sheet of 3/4" plywood for the level 30" × 30" North service platform and 4-sided insulation dam (+2").',
          'Clean 1×2 ledger strips + continuous 1/2" × 1/8" closed-cell foam gasket + 3/8" backer rod and caulk for fixed outer frame.',
          '2 unfaced fiberglass batts + 3 loose 16-gauge wire loops + compression latches mounted outside the 24" × 36" clear opening.',
          '1 permanent switched enclosed LED utility light near hatch + 1 line-side 120V GFCI outlet within 25 ft of furnace.'
        ];
    return '<details class="u4h-equip-wrap">' +
      '<summary class="u4h-equip-btn"><span>' + (es ? "Equipo y suministros (Carpintería y Sellado)" : "Equipment & Supplies (Carpentry & Air Seal)") + '</span><span>▾</span></summary>' +
      '<div class="u4h-equip-body"><ul class="u4h-info-list">' +
        rows.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") +
      "</ul></div>" +
    "</details>";
  }

  function renderCarpentryMapSvg(m, es) {
    var h = HATCH_DOOR4;
    var hx = px(h.x), hy = py(h.y);
    var hw = +(h.w * SC).toFixed(1), hh = +(h.h * SC).toFixed(1);
    var fx = px(state.furnacePos.x);
    var fy = py(state.furnacePos.y);
    var fW = +(33.25 * SC).toFixed(1);
    var fH = +(29 * SC).toFixed(1);
    var pS = +(30 * SC).toFixed(1);
    var walkCol = m.walkPass ? "#2f6b3f" : "#a8281c";
    var walkFill = m.walkPass ? "#e4f0e6" : "#f9e6e4";

    return '<svg id="atticWalkwaySvg" viewBox="0 0 516 344" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Mapa a escala de escotilla 24x36 afuera de Puerta 4, pasillo de madera de 24 pulgadas y plataforma de 30x30" : "True-scale map of 24x36 hatch outside Door 4, 24-inch wood walkway and 30x30 service platform") + '" style="touch-action:none">' +
      '<text x="14" y="18" font-size="8.4" font-weight="800" fill="#1f5f7a">' +
        (es ? 'PLANTA DE ÁTICO A ESCALA · ESCOTILLA 24"×36" (PUERTA 4) + PASILLO 24" + PLATAFORMA 30"×30"'
            : 'TRUE-SCALE ATTIC MAP · 24"×36" HATCH (OUTSIDE DOOR 4) + 24" WALKWAY + 30"×30" PLATFORM') + "</text>" +
      '<g transform="translate(490,22)">' +
        '<circle r="14" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-10 -3,-3.5 3,-3.5" fill="#a8281c"/>' +
        '<text x="0" y="-11" text-anchor="middle" font-size="6.2" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="11.8" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">S</text>' +
        '<text x="9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">E</text>' +
        '<text x="-9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">' + (es ? "O" : "W") + "</text>" +
      "</g>" +

      '<rect x="' + px(66) + '" y="' + py(34) + '" width="' + +(81 * SC).toFixed(1) + '" height="' + +(74 * SC).toFixed(1) + '" rx="3" fill="#fdf6e7" stroke="#9a5b06" stroke-width="1.4" stroke-dasharray="5 3"/>' +
      '<text x="' + px(106.5) + '" y="' + py(44) + '" text-anchor="middle" font-size="6.0" font-weight="800" fill="#9a5b06">' + (es ? "DESCANSO PUERTA 4" : "DOOR 4 LANDING") + "</text>" +

      '<path d="M ' + px(31.5) + " " + py(108) + " L " + px(147) + " " + py(108) + " L " + px(147) + " " + py(234) + " L " + px(0) + " " + py(234) + " L " + px(0) + " " + py(174) + " L " + px(31.5) + " " + py(174) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(88) + '" y="' + py(174) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + (es ? "Cocina" : "Kitchen") + "</text>" +

      '<path d="M ' + px(147) + " " + py(58) + " L " + px(207) + " " + py(58) + " L " + px(207) + " " + py(88) + " L " + px(352) + " " + py(88) + " L " + px(352) + " " + py(142) + " L " + px(147) + " " + py(142) + ' Z" fill="#f4f5f3" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(256) + '" y="' + py(120) + '" text-anchor="middle" font-size="7.4" font-weight="700" fill="#5d686d">' + (es ? "Pasillo Central" : "Central Hallway") + "</text>" +

      '<rect x="' + px(207) + '" y="' + py(0) + '" width="' + +(72.1 * SC).toFixed(1) + '" height="' + +(88 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(243) + '" y="' + py(45) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#5d686d">' + (es ? "Baño" : "Bathroom") + "</text>" +

      '<rect x="' + px(279.1) + '" y="' + py(5.4) + '" width="' + +(36.3 * SC).toFixed(1) + '" height="' + +(82.6 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(297.2) + '" y="' + py(47) + '" text-anchor="middle" font-size="6.0" font-weight="700" fill="#5d686d">' + (es ? "Lav." : "Laundry") + "</text>" +

      '<path d="M ' + px(315.4) + " " + py(0) + " L " + px(437.5) + " " + py(0) + " L " + px(474) + " " + py(34) + " L " + px(474) + " " + py(96) + " L " + px(437.5) + " " + py(136) + " L " + px(352) + " " + py(136) + " L " + px(352) + " " + py(88) + " L " + px(315.4) + " " + py(88) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(398) + '" y="' + py(54) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + (es ? "Recámara" : "Bedroom") + "</text>" +

      '<rect x="' + px(355) + '" y="' + py(94) + '" width="58" height="17" rx="3" fill="#fdf6e7" stroke="#9a5b06" stroke-width="1.1" stroke-dasharray="3 2"/>' +
      '<text x="' + (px(355) + 29) + '" y="' + (py(94) + 11) + '" text-anchor="middle" font-size="5.6" font-weight="800" fill="#9a5b06">' + (es ? "Clóset temp. (Abierto)" : "Temp. Closet (Open)") + "</text>" +

      '<rect x="' + px(147) + '" y="' + py(142) + '" width="' + +(146.7 * SC).toFixed(1) + '" height="' + +(155.75 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(246) + '" y="' + py(166) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + (es ? "Comedor" : "Dining Room") + "</text>" +

      '<path d="M ' + px(293.7) + " " + py(142) + " L " + px(473.5) + " " + py(142) + " L " + px(508) + " " + py(178) + " L " + px(508) + " " + py(258) + " L " + px(473.5) + " " + py(297.75) + " L " + px(293.7) + " " + py(297.75) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(400) + '" y="' + py(222) + '" text-anchor="middle" font-size="8.2" font-weight="700" fill="#5d686d">' + (es ? "Sala" : "Living Room") + "</text>" +

      '<path id="atticWalkHalo" d="' + m.d + '" fill="none" stroke="' + walkCol + '" stroke-width="' + +(30 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.12"/>' +
      '<path id="atticWalkBand" d="' + m.d + '" fill="none" stroke="#d9a86c" stroke-width="' + +(24 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.62"/>' +
      '<path id="atticWalkCenter" d="' + m.d + '" fill="none" stroke="' + walkCol + '" stroke-width="2.2" stroke-dasharray="5 3"/>' +

      '<g id="atticHatchBox" style="cursor:pointer">' +
        '<rect x="' + (hx - hw / 2).toFixed(1) + '" y="' + (hy - hh / 2).toFixed(1) + '" width="' + hw + '" height="' + hh + '" rx="2.5" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2.3"/>' +
        '<line x1="' + (hx - hw / 2).toFixed(1) + '" y1="' + hy + '" x2="' + (hx - hw / 2 - 12).toFixed(1) + '" y2="' + hy + '" stroke="#1f5f7a" stroke-width="1.4"/>' +
        '<rect x="14" y="' + (hy - 11).toFixed(1) + '" width="86" height="22" rx="4" fill="#1f5f7a"/>' +
        '<text x="57" y="' + (hy - 1.5).toFixed(1) + '" text-anchor="middle" font-size="6.2" font-weight="800" fill="#ffffff">' + (es ? 'Escotilla 24"×36"' : '24"×36" Hatch') + "</text>" +
        '<text x="57" y="' + (hy + 6.8).toFixed(1) + '" text-anchor="middle" font-size="5.4" font-weight="700" fill="#d8eff8">' + (es ? "Afuera Puerta 4" : "Outside Door 4") + "</text>" +
      "</g>" +

      '<g id="atticPlatformDrag" class="u4-drag-move" tabindex="0" role="application" aria-label="' + esc(es ? "Arrastrar plataforma de servicio de 30x30 y huella del calefactor" : "Drag 30x30 wood service platform and furnace footprint") + '" transform="translate(0, 0)">' +
        '<rect x="' + (fx - pS / 2).toFixed(1) + '" y="' + (fy - fH / 2 - pS).toFixed(1) + '" width="' + pS + '" height="' + pS + '" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2.1"/>' +
        '<rect x="' + (fx + pS / 2 + 5).toFixed(1) + '" y="' + (fy - fH / 2 - pS / 2 - 8.5).toFixed(1) + '" width="72" height="17" rx="4" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.2"/>' +
        '<text x="' + (fx + pS / 2 + 41).toFixed(1) + '" y="' + (fy - fH / 2 - pS / 2 + 2.2).toFixed(1) + '" text-anchor="middle" font-size="5.9" font-weight="800" fill="#1f512c" pointer-events="none">' + (es ? 'Plataforma 30"×30"' : '30"×30" Platform') + "</text>" +
        '<rect class="u4-drag-grip" x="' + (fx - fW / 2).toFixed(1) + '" y="' + (fy - fH / 2).toFixed(1) + '" width="' + fW + '" height="' + fH + '" rx="3.5" fill="#1d2326" stroke="#ffffff" stroke-width="1.5"/>' +
        '<rect x="' + (fx + fW / 2 + 5).toFixed(1) + '" y="' + (fy - 8.5).toFixed(1) + '" width="72" height="17" rx="4" fill="#1d2326"/>' +
        '<text x="' + (fx + fW / 2 + 41).toFixed(1) + '" y="' + (fy + 2.2).toFixed(1) + '" text-anchor="middle" font-size="5.9" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? 'Calefactor 33"×29"' : 'Furnace 33"×29"') + "</text>" +
      "</g>" +

      '<rect id="atticWalkPill" x="14" y="313" width="488" height="21" rx="5" fill="' + walkFill + '" stroke="' + walkCol + '" stroke-width="1.1"/>' +
      '<text id="atticWalkPillTxt" x="258" y="326.5" text-anchor="middle" font-size="7.2" font-weight="800" fill="' + walkCol + '">' +
        (es ? 'Pasillo continuo 24": ' + m.walkFt + ' pies (máx. 20 pies) · ' + m.walkSheets + ' hojas pasillo + 1 hoja plataforma y dique'
            : 'Continuous 24" wood walkway: ' + m.walkFt + ' ft (20 ft max) · ' + m.walkSheets + ' walkway sheets + 1 sheet platform & dam') +
      "</text>" +
    "</svg>";
  }

  function renderFramingSvg(es) {
    var bayVal = state.joistBay === "unknown" ? null : parseFloat(state.joistBay);
    var bayOk = bayVal === 27.5;
    var bayNarrow = bayVal != null && bayVal < 27.5;
    var bayWide = bayVal != null && bayVal > 27.5;
    var isFire = state.ceilingType === "fire_rated";
    var isHold = state.ceilingType === "hold";
    var frameStroke = isFire ? "#a8281c" : (isHold ? "#9a5b06" : (bayOk ? "#2f6b3f" : "#9a5b06"));
    var frameLabel = isFire
      ? (es ? 'PUERTA CORTAFUEGO LISTADA (MANTENER 24" × 36" LIBRES)' : 'ORDER LISTED FIRE-RATED DOOR (FULL 24" × 36" CLEAR)')
      : isHold
        ? (es ? "CANDADO ACTIVO: VERIFICAR CORTAFUEGO Y VIGAS ANTES DE CORTAR" : "HOLD BEFORE CUTTING: VERIFY FIRE-RATING & JOISTS ON SITE")
        : (es ? 'Plafón no cortafuego confirmado: corte 27-1/2" × 39-1/2" elegible' : 'Non-rated ceiling confirmed: 27-1/2" × 39-1/2" wood frame eligible');
    var bayNote = bayVal == null
      ? (es ? "Separación de vigas existentes: medir en sitio antes de cortar" : "Existing ceiling joist bay width: measure on site before cutting")
      : (es ? 'Espacio libre entre vigas = ' + bayVal + '"' : 'Clear bay between joists = ' + bayVal + '"');

    return '<svg viewBox="0 0 480 264" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Diagrama de abertura libre de 24 por 36 pulgadas afuera de Puerta 4 y paso del calefactor de punta" : "Diagram of 24 by 36 inch finished clear opening outside Door 4 and end-first furnace pass") + '">' +
      '<text x="14" y="18" font-size="8.5" font-weight="800" fill="#1f5f7a">' +
        (es ? 'ABERTURA AFUERA DE PUERTA 4 · 24" × 36" LIBRES TERMINADAS (NO REDUCIR)' : 'OUTSIDE FRONT DOOR 4 · FULL 24" × 36" FINISHED CLEAR OPENING') + "</text>" +
      '<rect x="30" y="32" width="420" height="184" rx="6" fill="#fbfcfb" stroke="#c5ccc9" stroke-width="1.3"/>' +
      '<line x1="30" y1="60" x2="450" y2="60" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<line x1="30" y1="188" x2="450" y2="188" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<text x="40" y="47" font-size="7.1" font-weight="700" fill="#5d686d">' + (es ? "← Escaleras y Ventana (Oeste)" : "← Stairs & Window (West)") + "</text>" +
      '<text x="440" y="47" text-anchor="end" font-size="7.1" font-weight="800" fill="#1f5f7a">' + (es ? "Puerta Principal 4 →" : "Front Door 4 →") + "</text>" +
      '<rect x="98" y="54" width="284" height="140" fill="#f7ecd9" fill-opacity="0.48" stroke="' + frameStroke + '" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="240" y="67" text-anchor="middle" font-size="6.8" font-weight="800" fill="' + frameStroke + '">' + esc(frameLabel) + "</text>" +
      '<rect x="128" y="75" width="224" height="106" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2.3"/>' +
      '<rect x="152" y="94" width="176" height="68" rx="4" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2"/>' +
      '<text x="240" y="116" text-anchor="middle" font-size="8.6" font-weight="800" fill="#2f6b3f">' + (es ? "CALEFACTOR SUBE DE PUNTA ✓" : "FURNACE PASSES END-FIRST ✓") + "</text>" +
      '<text x="240" y="131" text-anchor="middle" font-size="7.7" font-weight="700" fill="#1d2326">' + (es ? 'Perfil 14-3/16" × 29" dentro de 24" × 36" libres' : '14-3/16" × 29" profile inside 24" × 36" clear') + "</text>" +
      '<text x="240" y="145" text-anchor="middle" font-size="7.1" font-weight="700" fill="#2f6b3f">' + (es ? '+9-3/4" y +7" de holgura libre' : '+9-3/4" & +7" clear margin to spare') + "</text>" +
      '<text x="240" y="208" text-anchor="middle" font-size="7.8" font-weight="800" fill="#1f5f7a">' + (es ? '24" × 36" ES MEDIDA LIBRE TERMINADA · BROCHES FUERA DEL CLARO' : '24" × 36" IS FINISHED CLEAR · MOUNT LATCHES OUTSIDE OPENING') + "</text>" +
      '<text x="240" y="244" text-anchor="middle" font-size="7.8" font-weight="800" fill="' + (bayNarrow ? "#a8281c" : (bayOk ? "#2f6b3f" : "#9a5b06")) + '">' +
        esc(bayNote + (bayOk ? (es ? " — Calza entre vigas" : " — Direct bay fit") : bayWide ? (es ? " — Agregar respaldo lateral sólido" : " — Add solid side backing") : bayNarrow ? (es ? " — Requiere cabezal doble estructural" : " — Frame structural double header") : "")) +
      "</text>" +
    "</svg>";
  }

  function renderAirSealSvg(es) {
    return '<svg viewBox="0 0 470 214" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Corte de tapa aislada de triplay de 3/4, empaque de espuma y dique de 4 lados" : "Cross-section of 3/4 plywood insulated lid, foam weatherstrip and 4-sided dam") + '">' +
      '<text x="235" y="17" text-anchor="middle" font-size="8.6" font-weight="800" fill="#1f5f7a">' +
        (es ? 'CORTE DE ESCOTILLA: TAPA DE TRIPLAY 3/4", EMPAQUE Y DIQUE DE 4 LADOS' : 'HATCH SECTION: 3/4" PLYWOOD LID, FOAM GASKET & 4-SIDED DAM') + "</text>" +
      '<rect x="24" y="88" width="92" height="54" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<rect x="354" y="88" width="92" height="54" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="70" y="118" text-anchor="middle" font-size="7.3" font-weight="700" fill="#9a5b06">' + (es ? "Aislante del ático" : "Attic insulation") + "</text>" +
      '<rect x="116" y="56" width="11" height="98" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<rect x="343" y="56" width="11" height="98" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<text x="360" y="70" font-size="7.4" font-weight="800" fill="#7c4d12">' + (es ? 'Dique +2" (4 lados)' : '4-sided dam (+2")') + "</text>" +
      '<rect x="136" y="74" width="198" height="44" rx="4" fill="#fce7f3" stroke="#be185d" stroke-width="1.4"/>' +
      '<text x="235" y="100" text-anchor="middle" font-size="7.9" font-weight="800" fill="#9d174d">' + (es ? "2 colchonetas sin papel + 3 lazos alambre cal. 16" : "2 unfaced fiberglass batts + 3 loose 16-ga wire loops") + "</text>" +
      '<rect x="132" y="122" width="206" height="16" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.8"/>' +
      '<text x="235" y="133" text-anchor="middle" font-size="7.6" font-weight="800" fill="#1f5f7a">' + (es ? 'Tapa triplay 3/4" (dejar junta SIN sellador)' : '3/4" plywood lid (leave removable seam UNCAULKED)') + "</text>" +
      '<rect x="127" y="138" width="22" height="10" fill="#2f6b3f"/>' +
      '<rect x="321" y="138" width="22" height="10" fill="#2f6b3f"/>' +
      '<line x1="24" y1="154" x2="127" y2="154" stroke="#1d2326" stroke-width="2.3"/>' +
      '<line x1="343" y1="154" x2="446" y2="154" stroke="#1d2326" stroke-width="2.3"/>' +
      '<text x="235" y="175" text-anchor="middle" font-size="7.8" font-weight="800" fill="#2f6b3f">' + (es ? 'Empaque espuma 1/2"×1/8" sobre tiras 1×2 · Cordón 3/8" + sellador en marco fijo' : '1/2"×1/8" closed-cell foam gasket on 1×2 strips · Caulk fixed outer frame') + "</text>" +
      '<text x="235" y="196" text-anchor="middle" font-size="7.4" font-weight="600" fill="#5d686d">' + (es ? "Confirmar seca la reparación del techo plano antes de colocar el aislante" : "Confirm flat-roof leak repair is completely dry before placing insulation") + "</text>" +
    "</svg>";
  }

  function wirePlatformDrag() {
    var svg = document.getElementById("atticWalkwaySvg");
    var handle = document.getElementById("atticPlatformDrag");
    var hatchBox = document.getElementById("atticHatchBox");
    if (hatchBox) {
      hatchBox.addEventListener("click", function () {
        state.step = "framing";
        syncUrl();
        render();
        window.scrollTo(0, 0);
      });
    }
    if (!svg || !handle) return;
    var es = isEs();
    var initX = state.furnacePos.x;
    var initY = state.furnacePos.y;

    function updateInPlace(nxIn, nyIn) {
      var nx = Math.max(162, Math.min(410, Math.round(nxIn)));
      var ny = Math.max(140, Math.min(274, Math.round(nyIn)));
      state.furnacePos.x = nx;
      state.furnacePos.y = ny;
      state.preset = "custom";
      var dxPx = +(px(nx) - px(initX)).toFixed(1);
      var dyPx = +(py(ny) - py(initY)).toFixed(1);
      handle.setAttribute("transform", "translate(" + dxPx + ", " + dyPx + ")");

      var m = computeWalkway(state.furnacePos);
      var walkCol = m.walkPass ? "#2f6b3f" : "#a8281c";
      var walkFill = m.walkPass ? "#e4f0e6" : "#f9e6e4";
      var halo = document.getElementById("atticWalkHalo");
      var band = document.getElementById("atticWalkBand");
      var cntr = document.getElementById("atticWalkCenter");
      if (halo) { halo.setAttribute("d", m.d); halo.setAttribute("stroke", walkCol); }
      if (band) band.setAttribute("d", m.d);
      if (cntr) { cntr.setAttribute("d", m.d); cntr.setAttribute("stroke", walkCol); }

      var pill = document.getElementById("atticWalkPill");
      var ptxt = document.getElementById("atticWalkPillTxt");
      if (pill) { pill.setAttribute("fill", walkFill); pill.setAttribute("stroke", walkCol); }
      if (ptxt) {
        ptxt.setAttribute("fill", walkCol);
        ptxt.textContent = es
          ? 'Pasillo continuo 24": ' + m.walkFt + " pies (máx. 20 pies) · " + m.walkSheets + " hojas pasillo + 1 hoja plataforma y dique"
          : 'Continuous 24" wood walkway: ' + m.walkFt + " ft (20 ft max) · " + m.walkSheets + " walkway sheets + 1 sheet platform & dam";
      }

      var kpiLen = document.getElementById("atticKpiLen");
      if (kpiLen) {
        kpiLen.className = "u4h-kpi-val " + (m.walkPass ? "is-ok" : "is-fail");
        kpiLen.textContent = m.walkFt + (es ? " pies / 20" : " ft / 20 ft");
      }
      var kpiSht = document.getElementById("atticKpiSheets");
      if (kpiSht) kpiSht.textContent = m.totalSheets + (es ? " hojas 4×8 total" : " sheets 4×8 total");
    }

    handle.addEventListener("pointerdown", function (ev) {
      if (ev.button !== undefined && ev.button !== 0 && ev.pointerType === "mouse") return;
      ev.preventDefault();
      var pid = ev.pointerId;
      state.dragActive = true;
      handle.classList.add("is-dragging");
      try { handle.setPointerCapture(pid); } catch (_) {}
      var blockScroll = function (tev) { if (tev.cancelable) tev.preventDefault(); };
      window.addEventListener("touchmove", blockScroll, { passive: false });

      function onMove(e) {
        if (!state.dragActive || e.pointerId !== pid) return;
        var rect = svg.getBoundingClientRect();
        var svgX = ((e.clientX - rect.left) / (rect.width || 516)) * 516;
        var svgY = ((e.clientY - rect.top) / (rect.height || 344)) * 344;
        updateInPlace((svgX - OX) / SC, (svgY - OY) / SC);
      }
      function finish(e) {
        if (e && e.pointerId !== pid) return;
        state.dragActive = false;
        handle.classList.remove("is-dragging");
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", finish);
        document.removeEventListener("pointercancel", finish);
        window.removeEventListener("touchmove", blockScroll);
        try { if (handle.hasPointerCapture && handle.hasPointerCapture(pid)) handle.releasePointerCapture(pid); } catch (_) {}
        syncUrl();
        render();
      }
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", finish);
      document.addEventListener("pointercancel", finish);
    });
  }

  function render() {
    var host = document.getElementById("u4hBody");
    var holdEl = document.getElementById("u4hHoldStrip");
    if (!host) return;
    var es = isEs();
    var m = computeWalkway(state.furnacePos);
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip";
      holdEl.innerHTML = es
        ? '<strong>CANDADO ANTES DE CORTAR PLAFÓN:</strong> Ubicación elegida afuera de <strong>Puerta Principal 4</strong> (<code>24" × 36"</code> libres terminadas). No cortar plafón hasta verificar vigas y clasificación cortafuego. ¿Buscas ductos y salida lateral? <a href="../hvac-layout/index.html">2. Calefactor, Ductos y Salida &rarr;</a>'
        : '<strong>HOLD CEILING CUTS UNTIL VERIFIED:</strong> Permanent spot is outside <strong>Front Door 4</strong> (<code>24" × 36"</code> finished clear). Confirm ceiling fire-rating &amp; joist bay before cutting. Need ductwork &amp; exhaust? <a href="../hvac-layout/index.html">2. Furnace, Ducts &amp; Exhaust &rarr;</a>';
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Attic Hatch, Wood Walkway & Service Platform";
    var titleEs = "Escotilla del Ático, Pasillo de Madera y Plataforma";
    var subEn = 'Outside Front Door 4 (24" × 36" clear) — drag the 30" × 30" platform to check the 20 ft walkway limit';
    var subEs = 'Afuera de Puerta Principal 4 (24" × 36" libres) — arrastra la plataforma de 30" × 30" para revisar el límite de 20 pies';
    var inner = "";

    if (state.step === "map") {
      var stCls = m.walkPass ? "is-pass" : "is-fail";
      var stTxt = m.walkPass
        ? (es ? '✓ Dentro del límite: Pasillo continuo de madera de 24" mide ' + m.walkFt + ' pies (máx. 20 pies con 66" de altura en ático).'
              : '✓ Within 20 ft limit: Continuous 24" wood walkway measures ' + m.walkFt + ' ft at 66" flat-roof attic height.')
        : (es ? "✗ Excede 20 pies (" + m.walkFt + " pies): acerca la plataforma hacia el Comedor Suroeste."
              : "✗ Over 20 ft limit (" + m.walkFt + " ft): move the service platform closer toward Southwest Dining.");

      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Claro Libre Permanente" : "Finished Clear Opening") + "</div>" +
            '<div class="u4h-kpi-val is-info">24" × 36"</div>' +
            '<div class="u4h-kpi-sub">' + (es ? "Descanso afuera de Puerta 4" : "Landing outside Front Door 4") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? 'Pasillo Madera 24"' : '24" Wood Walkway') + "</div>" +
            '<div id="atticKpiLen" class="u4h-kpi-val ' + (m.walkPass ? "is-ok" : "is-fail") + '">' + m.walkFt + (es ? " pies / 20" : " ft / 20 ft") + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? '30" libres de altura sobre pasillo' : '30" clear height above walkway') + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? 'OSB 23/32" o Triplay 3/4"' : '23/32" OSB or 3/4" Plywood') + "</div>" +
            '<div id="atticKpiSheets" class="u4h-kpi-val is-ok">' + m.totalSheets + (es ? " hojas 4×8 total" : " sheets 4×8 total") + "</div>" +
            '<div class="u4h-kpi-sub">' + m.walkSheets + (es ? " pasillo + 1 plataforma/dique" : " walkway + 1 platform/dam") + "</div>" +
          "</div>" +
        "</div>" +
        renderMapLegend(es) +
        '<div class="u4h-svg-wrap">' + renderCarpentryMapSvg(m, es) + "</div>" +
        '<div class="u4h-svg-hint">' + (es ? 'Consejo: Arrastra la plataforma 30"×30" en el plano, o toca la escotilla 24"×36" para ver el marco y vigas.' : 'Tip: Drag the 30" × 30" platform on the map, or tap the 24" × 36" hatch to inspect ceiling framing.') + "</div>" +
        '<div class="u4h-status ' + stCls + '">' + esc(stTxt) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? 'Posición de plataforma 30"×30":' : '30" × 30" Platform spot:') + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.preset === "sw_dining" ? " is-active" : "") + '" data-preset="sw_dining">' + (es ? "Comedor SO · 15.8 pies (Recomendado)" : "Southwest Dining · 15.8 ft (Recommended)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.preset === "nw_dining" ? " is-active" : "") + '" data-preset="nw_dining">' + (es ? "Comedor NO · 10.6 pies" : "Northwest Dining · 10.6 ft") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.preset === "east_living" ? " is-active" : "") + '" data-preset="east_living">' + (es ? "Sala Este · >20 pies (Excede)" : "East Living · >20 ft (Over limit)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        renderEquipDrawer(m, es);

    } else if (state.step === "framing") {
      titleEn = 'Door 4 Landing Framing & 24" × 36" Clear Opening';
      titleEs = 'Marco en Descanso de Puerta 4 y Claro Libre de 24" × 36"';
      subEn = "24\" × 36\" is finished clear (not rough cut) — verify ceiling fire-rating and joist bay before cutting";
      subEs = "24\" × 36\" es paso libre terminado (no corte rústico) — verificar cortafuego y vigas antes de cortar";

      var fCls = (state.ceilingType === "non_rated" && state.joistBay === "27.5") ? "is-pass" : "is-warn";
      var fTxt = state.ceilingType === "fire_rated"
        ? (es ? 'Plafón cortafuego requerido: Pedir puerta cortafuego listada que conserve las 24" × 36" libres reales (no armar marco de madera ni usar puertas nominales que reduzcan el paso).'
              : 'Fire-rated ceiling required: Order a listed fire-rated access door that preserves the full 24" × 36" finished clear opening (do not build the wood kit or use nominal doors that shrink clear passage).')
        : state.ceilingType === "hold"
          ? (es ? 'Candado activo: Fotografiar primero el trazo afuera de Puerta 4 y confirmar si el descanso requiere puerta cortafuego y cuánto miden las vigas antes de cortar.'
                : 'Active hold: Photograph the markout outside Front Door 4 and confirm ceiling fire-rating and joist bay width before making any ceiling cut.')
          : (state.joistBay === "14.5" || state.joistBay === "22.5")
            ? (es ? 'Espacio entre vigas de ' + state.joistBay + '": armar cabezal doble estructural para mantener las 24" × 36" libres completas.'
                  : 'A ' + state.joistBay + '" joist bay requires structural double-header framing so the finished opening stays a full 24" × 36" clear.')
            : state.joistBay === "27.5"
              ? (es ? '✓ Plafón no cortafuego + vigas a 27-1/2": el marco de madera calza directo dejando 24" × 36" libres.'
                    : '✓ Non-rated ceiling + 27-1/2" joist bay: wood frame fits directly with a full 24" × 36" clear opening.')
              : (es ? 'Plafón no cortafuego seleccionado — mide ahora el espacio libre entre vigas antes de cortar.'
                    : 'Non-rated ceiling selected — measure the clear bay between joists before cutting.');

      inner =
        '<div class="u4h-svg-wrap">' + renderFramingSvg(es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Estado cortafuego del plafón:" : "Ceiling fire-rating gate:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.ceilingType === "hold" ? " is-active" : "") + '" data-ceil="hold">' + (es ? "Pendiente verificar (Candado)" : "Unverified Hold (Do not cut)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ceilingType === "non_rated" ? " is-active" : "") + '" data-ceil="non_rated">' + (es ? "No cortafuego confirmado" : "Non-Rated Confirmed") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ceilingType === "fire_rated" ? " is-active" : "") + '" data-ceil="fire_rated">' + (es ? "Cortafuego (Puerta listada)" : "Fire-Rated (Listed door)") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Espacio libre entre vigas:" : "Clear bay between joists:") + "</span>" +
            '<div class="u4h-pill-group">' +
              [["unknown", es ? "Por medir" : "Measure on site"], ["14.5", '14-1/2" (16" OC)'], ["22.5", '22-1/2" (24" OC)'], ["27.5", '27-1/2"'], ["30", '> 27-1/2"']].map(function (opt) {
                return '<button type="button" class="u4h-pill' + (state.joistBay === opt[0] ? " is-active" : "") + '" data-bay="' + opt[0] + '">' + opt[1] + "</button>";
              }).join("") +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-status ' + fCls + '">' + esc(fTxt) + "</div>" +
        '<div class="u4h-photo-card is-contain">' +
          '<img src="./assets/attic-hatch-candidate.jpg" alt="' + esc(es ? "Foto real del descanso común afuera de Puerta Principal 4 mostrando plafón, lámpara y riel original a 103 pulgadas" : "Upright site photo of common landing outside Front Door 4 showing ceiling, fixture, and original 103-inch picture rail") + '">' +
          '<div class="u4h-photo-cap"><strong>' + (es ? "Foto del sitio — Descanso afuera de Puerta 4:" : "Site Photo — Common Landing Outside Front Door 4:") + "</strong> " +
            (es ? 'Conservar la lámpara, el riel original de cuadros a 103" y los contramarcos de Puerta 4 y ventana completamente separados del marco de la escotilla.'
                : 'Keep the landing light fixture, original 103" high picture rail, and Door 4 / stairwell window casings intact and separate from hatch trim.') +
          "</div>" +
        "</div>";

    } else if (state.step === "seal") {
      titleEn = "Insulated Lid, Air Seal & Crew Lumber List";
      titleEs = "Tapa Aislada, Sellado de Aire y Lista de Madera";
      subEn = "4-sided insulation dam, closed-cell foam gasket, walkway decking, and attic service light & GFCI";
      subEs = "Dique de 4 lados, empaque de espuma cerrada, madera de pasillo y plataforma, luz LED y GFCI";

      inner =
        '<div class="u4h-svg-wrap">' + renderAirSealSvg(es) + "</div>" +
        '<div class="u4h-two-col">' +
          '<div class="u4h-info-box" style="margin:0">' +
            '<div class="u4h-info-title">' + (es ? "Sellado y Tapa Aislada" : "Lid & Air-Sealing Rules") + "</div>" +
            '<ul class="u4h-info-list">' +
              "<li>" + (es ? 'Sellar el marco fijo exterior con cordón de respaldo de 3/8" y sellador.' : 'Caulk fixed outer frame perimeter using 3/8" backer rod.') + "</li>" +
              "<li>" + (es ? 'Empaque continuo de espuma cerrada de 1/2" × 1/8" sobre tiras limpias de 1×2.' : 'Continuous 1/2" × 1/8" closed-cell foam gasket on clean 1×2 ledger strips.') + "</li>" +
              "<li>" + (es ? 'Dejar la junta de la tapa removible SIN sellador (probar abrir y cerrar 2 veces).' : 'Leave removable 3/4" plywood lid seam UNCAULKED (test-open twice).') + "</li>" +
              "<li>" + (es ? '2 colchonetas sin papel sujetas a la tapa con 3 lazos sueltos de alambre cal. 16 + dique en 4 lados (+2").' : '2 unfaced fiberglass batts held to lid back with 3 loose 16-ga wire loops + 4-sided dam (+2" above fill).') + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-info-box" style="margin:0">' +
            '<div class="u4h-info-title">' + (es ? "Madera y Eléctrico en Ático" : "Walkway Lumber & Attic Electrical") + "</div>" +
            '<ul class="u4h-info-list">' +
              "<li>" + m.walkSheets + (es ? ' hojas 4×8 de OSB 23/32" o triplay estructural 3/4" para el pasillo de 24" (' + m.walkFt + ' pies; nunca usar 3/8").' : ' sheets 4×8 of 23/32" OSB or 3/4" structural plywood for the 24" walkway (' + m.walkFt + ' ft; never 3/8").') + "</li>" +
              "<li>" + (es ? '1 hoja 4×8 adicional para la plataforma nivelada de 30" × 30" (lado Norte) y el dique de 4 lados.' : '1 additional 4×8 sheet for the level 30" × 30" North service platform and 4-sided dam.') + "</li>" +
              "<li>" + (es ? "1 lámpara LED cerrada permanente con apagador junto a la escotilla + 1 contacto GFCI 120V a ≤ 25 pies." : "1 permanent switched enclosed LED light near hatch + 1 line-side 120V GFCI outlet within 25 ft.") + "</li>" +
              "<li>" + (es ? "Mantener abierta la abertura temporal del clóset de recámara hasta terminar el cable de termostato y la escotilla." : "Keep temporary bedroom-closet opening open until both thermostat cable and permanent hatch are finished.") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
        renderEquipDrawer(m, es);

    } else {
      titleEn = "Pre-Cut & Closeout Field Checks";
      titleEs = "Candados de Campo Antes de Cortar o Cerrar";
      subEn = "Tap to check off each verification gate on site before cutting the Door 4 landing ceiling";
      subEs = "Marca cada verificación en sitio antes de cortar el plafón afuera de Puerta Principal 4";

      var gateItems = [
        {
          id: "markout",
          tEn: '1. Photograph 24" × 36" clear markout outside Front Door 4 before cutting',
          tEs: '1. Fotografiar el trazo de 24" × 36" libres afuera de Puerta 4 antes de cortar',
          dEn: "Confirm ladder setup, lid swing, Door 4 swing, and clearance from the landing light fixture.",
          dEs: "Confirmar posición de escalera, abatimiento de tapa, giro de Puerta 4 y distancia a la lámpara."
        },
        {
          id: "fire_joist",
          tEn: "2. Confirm landing ceiling fire-rating & measure existing joist bay width",
          tEs: "2. Confirmar clasificación cortafuego del descanso y medir separación entre vigas",
          dEn: 'Do not cut a 27-1/2" × 39-1/2" wood-kit opening unless non-rated ceiling is confirmed; order a listed 24" × 36" clear fire door if fire-rated.',
          dEs: 'No cortar 27-1/2" × 39-1/2" sin confirmar plafón no cortafuego; pedir puerta cortafuego listada de 24" × 36" libres si aplica.'
        },
        {
          id: "roof_dry",
          tEn: "3. Verify flat-roof leak repair is completely dry before placing batts or loose fill",
          tEs: "3. Verificar completamente seca la reparación de gotera en techo plano antes de aislar",
          dEn: "Moisture check roof framing above hallway/landing before installing fiberglass insulation.",
          dEs: "Revisar humedad en vigas superiores antes de colocar fibra de vidrio o aislante."
        },
        {
          id: "trim_safe",
          tEn: '4. Protect original 103" picture rail, 9-1/2" baseboard & Door 4 casings',
          tEs: '4. Proteger riel original a 103", zoclo de 9-1/2" y contramarcos de Puerta 4',
          dEn: "Keep hatch casing/trim completely separate from original Edwardian woodwork.",
          dEs: "Mantener el marco de la escotilla completamente separado de la carpintería original."
        },
        {
          id: "temp_closet",
          tEn: "5. Keep temporary bedroom-closet ceiling opening OPEN until final sign-off",
          tEs: "5. Mantener ABIERTA la abertura temporal del clóset de recámara hasta el cierre",
          dEn: "Close bedroom-closet ceiling only after thermostat wire pull and permanent Door 4 hatch are complete.",
          dEs: "Cerrar el techo del clóset solo cuando estén terminados el cable de termostato y la escotilla permanente."
        }
      ];

      var doneCount = gateItems.filter(function (g) { return !!state.checks[g.id]; }).length;
      var allDone = doneCount === gateItems.length;

      inner =
        '<div class="u4h-status ' + (allDone ? "is-pass" : "is-warn") + '">' +
          esc(allDone
            ? (es ? "✓ Los 5 candados previos verificados en este dispositivo." : "✓ All 5 pre-cut & closeout checks marked verified on this device.")
            : (es ? doneCount + " de " + gateItems.length + " candados verificados — no cortar plafón hasta completar los candados previos."
                  : doneCount + " of " + gateItems.length + " checks verified — hold ceiling cuts until pre-cut gates are confirmed.")) +
        "</div>" +
        '<div class="u4h-check-grid">' +
          gateItems.map(function (g) {
            var ck = !!state.checks[g.id];
            return '<label class="u4h-check-row' + (ck ? " is-checked" : "") + '">' +
              '<input type="checkbox" data-gate-check="' + g.id + '"' + (ck ? " checked" : "") + ">" +
              '<span class="u4h-check-body"><strong>' + esc(es ? g.tEs : g.tEn) + "</strong><span>" + esc(es ? g.dEs : g.dEn) + "</span></span>" +
            "</label>";
          }).join("") +
        "</div>" +
        renderEquipDrawer(m, es);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="atticPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + (es ? "Anterior" : "Prev") + "</button>" +
      '<span class="u4h-pager-count">' + (es ? "Vista " : "View ") + (idx + 1) + (es ? " de " : " of ") + STEPS.length + "</span>" +
      '<button type="button" id="atticNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + (es ? "Siguiente" : "Next") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(es ? titleEs : titleEn) + "</div>" +
            '<div class="u4h-sub">' + esc(es ? subEs : subEn) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">' + (es ? "Plano 1 · Escotilla y Pasillo" : "Plan 1 · Hatch & Walkway") + "</span>" +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); syncUrl(); render(); window.scrollTo(0, 0); });
    });
    host.querySelectorAll("[data-preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-preset");
        state.preset = p;
        if (p === "sw_dining") state.furnacePos = { x: 174, y: 258 };
        else if (p === "nw_dining") state.furnacePos = { x: 174, y: 196 };
        else state.furnacePos = { x: 350, y: 248 };
        syncUrl();
        render();
      });
    });
    host.querySelectorAll("[data-ceil]").forEach(function (b) {
      b.addEventListener("click", function () { state.ceilingType = b.getAttribute("data-ceil"); render(); });
    });
    host.querySelectorAll("[data-bay]").forEach(function (b) {
      b.addEventListener("click", function () { state.joistBay = b.getAttribute("data-bay"); render(); });
    });
    host.querySelectorAll("[data-gate-check]").forEach(function (chk) {
      chk.addEventListener("change", function () {
        var k = chk.getAttribute("data-gate-check");
        state.checks[k] = !!chk.checked;
        render();
      });
    });

    var pBtn = document.getElementById("atticPrevBtn");
    var nBtn = document.getElementById("atticNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; syncUrl(); render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; syncUrl(); render(); window.scrollTo(0, 0); } });

    if (state.step === "map") wirePlatformDrag();

    if (window.U4ZoomPan && typeof window.U4ZoomPan.refresh === "function") {
      try { window.U4ZoomPan.refresh(); } catch (_) {}
    }
    if (window.U4PinDragger && typeof window.U4PinDragger.refresh === "function") {
      try { window.U4PinDragger.refresh(); } catch (_) {}
    }
    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext();
    }
  }

  window.U4PlanControl = {
    showView: function (args) {
      args = args || {};
      if (args.step != null && args.step !== "") {
        state.step = resolveStep(args.step);
        syncUrl();
        render();
        return true;
      }
      return false;
    },
    applyChange: function (args) {
      args = args || {};
      var act = String(args.action || args.target || "").toLowerCase();
      var val = String(args.value || "").toLowerCase();
      if (act === "ceiling_type" || act === "fire_rating") {
        state.ceilingType = val.indexOf("fire") >= 0 || val === "yes" ? "fire_rated" : (val.indexOf("non") >= 0 ? "non_rated" : "hold");
      } else if (act === "joist_bay") {
        state.joistBay = String(args.value || "unknown");
      } else if (act === "reset") {
        state.furnacePos = { x: 174, y: 258 };
        state.preset = "sw_dining";
        state.ceilingType = "hold";
        state.joistBay = "unknown";
      } else {
        return false;
      }
      syncUrl();
      render();
      return true;
    },
    getState: function () {
      var m = computeWalkway(state.furnacePos);
      return {
        planId: "attic-hatch",
        step: state.step,
        wall: "attic_carpentry",
        hatchSpot: "door4",
        ceilingType: state.ceilingType,
        joistBay: state.joistBay,
        walkFt: m.walkFt,
        totalSheets: m.totalSheets,
        summary: "Plan 1 Attic Hatch & Walkway: view=" + state.step + ", spot=door4 (24x36 clear), walkway=" + m.walkFt + "ft (" + m.totalSheets + " sheets total), fireGate=" + state.ceilingType + "."
      };
    }
  };

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "attic-hatch",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { render(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); }
      });
      var bp = window.U4PlanNav.getBootParams ? window.U4PlanNav.getBootParams() : {};
      if (bp.step) state.step = resolveStep(bp.step);
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "attic-hatch",
        room: "attic-access",
        titleEn: "Attic Hatch, Wood Walkway & Platform",
        titleEs: "Escotilla del Ático, Pasillo de Madera y Plataforma",
        getContext: function () {
          var m = computeWalkway(state.furnacePos);
          return "Plan1=attic-hatch, View=" + state.step + ", Hatch=Outside Front Door 4 (24x36in finished clear), Walkway=" + m.walkFt + "ft (" + m.walkSheets + " walkway sheets + 1 platform/dam sheet), FireGate=" + state.ceilingType + ", JoistBay=" + state.joistBay + ".";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Cómo sellamos la tapa de 24×36 sin pegar la junta?", "¿Cuántas hojas de OSB/triplay lleva el pasillo y plataforma?", "¿Qué cambia si el plafón del descanso requiere puerta cortafuego?"]
            : ["How do we air-seal the 24×36 hatch lid so it still lifts cleanly?", "How many 4×8 sheets of OSB or 3/4 plywood are needed?", "What changes if the landing ceiling requires a fire-rated hatch door?"];
        }
      });
    }
    syncUrl();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
