/* ============================================================================
   Plan 1: Attic Hatch, Wood Walkway & Service Platform (R8 Pin & Uninsulated Lid)
   4 Focused Carpentry Views:
     1. Walkway Map (24"×36" hatch outside Door 4 + pinned NW Bedroom Closet + draggable 30"×30" platform)
     2. Door 4 Framing (full-width framing SVG + uncropped upright Door 4 landing photo)
     3. Lid & Lumber (uninsulated 3/4" plywood lid + foam dust gasket + walkway/platform lumber)
     4. Pre-Cut Checks (interactive crew pre-cut hold checklist)
   Zero Lid Batts/Dam · Pinned NW Closet (X=315.4–352.0, Y=5.4–88.0) · Zero Prices · EN / MX-ES / RU
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "map",     en: "1. Walkway Map",     es: "1. Mapa y Pasillo",    ru: "1. Карта и мостки" },
    { id: "framing", en: "2. Door 4 Framing",  es: "2. Marco Puerta 4",    ru: "2. Проём у двери 4" },
    { id: "seal",    en: "3. Lid & Lumber",    es: "3. Tapa y Madera",     ru: "3. Крышка и доски" },
    { id: "checks",  en: "4. Pre-Cut Checks",  es: "4. Candados de Corte", ru: "4. Проверки до резки" }
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

  function getLang() {
    if (window.U4PlanNav && typeof window.U4PlanNav.getLang === "function") {
      var l = window.U4PlanNav.getLang();
      if (l === "ru" || l === "es") return l;
      return "en";
    }
    var hl = String(document.documentElement.lang || "").toLowerCase();
    if (hl.indexOf("ru") === 0) return "ru";
    if (hl.indexOf("es") === 0) return "es";
    return "en";
  }

  function L(en, es, ru) {
    var l = getLang();
    return l === "ru" ? ru : (l === "es" ? es : en);
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
        { x: fPos.x,     y: hatchMidY },
        { x: fPos.x,     y: platEdgeY }
      ];
    } else {
      var entryX = 170;
      pts = [
        { x: hatchEastX, y: hatchMidY },
        { x: entryX,     y: hatchMidY },
        { x: entryX,     y: hallSpineY },
        { x: fPos.x,     y: hallSpineY },
        { x: fPos.x,     y: platEdgeY }
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

  function renderMapLegend() {
    var items = [
      { col: "#1f5f7a", lbl: L('24"×36" Clear Hatch (Outside Door 4)', 'Escotilla 24"×36" (Afuera Puerta 4)', 'Чистовой люк 24"×36" (у двери 4)') },
      { col: "#d99b52", lbl: L('24" Continuous Wood Walkway', 'Pasillo Continuo Madera 24"', 'Сплошные деревянные мостки 24"') },
      { col: "#2f6b3f", lbl: L('30"×30" Wood Service Platform', 'Plataforma Servicio 30"×30"', 'Сервисная площадка 30"×30"') },
      { col: "#9a5b06", lbl: L("NW Temp. Closet (Keep Open)", "Clóset NO Temp. (Mantener Abierto)", "Врем. проём шкафа СЗ (не закрывать)") }
    ];
    return '<div class="u4h-legend-row">' +
      items.map(function (it) {
        return '<span class="u4h-legend-chip"><span class="u4h-legend-dot" style="background:' + it.col + '"></span>' + esc(it.lbl) + "</span>";
      }).join("") +
      "</div>";
  }

  function renderEquipDrawer(m) {
    var rows = [
      L(
        m.walkSheets + ' sheets (4×8) of 23/32" rated OSB or 3/4" structural plywood for the 24" walkway (1 strip per sheet; never 3/8" ply).',
        m.walkSheets + ' hojas 4×8 de OSB estructural 23/32" o triplay CDX 3/4" para el pasillo de 24" (1 tira por hoja; nunca triplay 3/8").',
        m.walkSheets + ' лист. (4×8 футов) конструкционной плиты OSB 23/32" или фанеры CDX 3/4" для мостков шириной 24" (1 полоса с листа; фанеру 3/8" не применять).'
      ),
      L(
        '1 additional 4×8 sheet of 3/4" plywood for the level 30" × 30" North service platform and removable lid (no lid batts or dam above unconditioned Door 4 landing).',
        '1 hoja 4×8 adicional de triplay 3/4" para la plataforma nivelada de 30" × 30" (lado Norte) y la tapa removible (sin fibra ni dique sobre el descanso no acondicionado).',
        '1 дополнительный лист 4×8 фанеры 3/4" для горизонтальной сервисной площадки 30" × 30" (с севера) и съёмной крышки люка (без утеплителя и бортика над неотапливаемой площадкой двери 4).'
      ),
      L(
        'Clean 1×2 ledger strips + continuous 1/2" × 1/8" closed-cell foam dust gasket + 3/8" backer rod and caulk for fixed outer frame.',
        'Tiras limpias de 1×2 + empaque continuo de espuma cerrada de 1/2" × 1/8" + cordón de respaldo de 3/8" y sellador en el marco fijo.',
        'Чистые опорные бруски 1×2 + сплошной пылезащитный уплотнитель из закрытоячеистой пены 1/2" × 1/8" + шнур 3/8" и герметик по контуру неподвижной рамы.'
      ),
      L(
        '4 compression latches mounted outside the 24" × 36" clear opening (or listed 24" × 36" clear fire door if ceiling is fire-rated).',
        '4 broches de compresión montados fuera del claro libre de 24" × 36" (o puerta cortafuego listada de 24" × 36" libres si aplica).',
        '4 прижимные защёлки снаружи чистового просвета 24" × 36" (или сертифицированный противопожарный люк с просветом 24" × 36", если потолок противопожарный).'
      ),
      L(
        '1 permanent switched enclosed LED utility light near hatch + 1 line-side 120V GFCI outlet within 25 ft of furnace.',
        '1 lámpara LED cerrada permanente con apagador junto a la escotilla + 1 contacto GFCI 120V a ≤ 25 pies del calefactor.',
        '1 стационарный закрытый LED-светильник с выключателем у люка + 1 сервисная розетка GFCI 120В не далее 25 футов от печи.'
      )
    ];
    return '<details class="u4h-equip-wrap">' +
      '<summary class="u4h-equip-btn"><span>' + L("Equipment & Supplies (Carpentry & Lid)", "Equipo y suministros (Carpintería y Tapa)", "Оборудование и материалы (Плотницкие работы и крышка)") + '</span><span>▾</span></summary>' +
      '<div class="u4h-equip-body"><ul class="u4h-info-list">' +
      rows.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") +
      "</ul></div>" +
      "</details>";
  }

  function walkPillText(m) {
    return L(
      'Continuous 24" wood walkway: ' + m.walkFt + ' ft (20 ft max) · ' + m.walkSheets + ' walkway sheets + 1 sheet 30"×30" platform',
      'Pasillo continuo 24": ' + m.walkFt + ' pies (máx. 20 pies) · ' + m.walkSheets + ' hojas pasillo + 1 hoja plataforma 30"×30"',
      'Сплошные мостки 24": ' + m.walkFt + ' фут. (макс. 20 фут.) · ' + m.walkSheets + ' лист. мостки + 1 лист площадка 30"×30"'
    );
  }

  function renderCarpentryMapSvg(m) {
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
    var clX = px(315.4), clY = py(5.4), clW = +(36.6 * SC).toFixed(1), clH = +(82.6 * SC).toFixed(1);
    var clMidX = +(clX + clW / 2).toFixed(1);

    return '<svg id="atticWalkwaySvg" viewBox="0 0 516 344" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(L("True-scale map of 24x36 hatch outside Door 4, pinned NW bedroom closet, 24-inch wood walkway and 30x30 service platform", "Mapa a escala de escotilla 24x36 afuera de Puerta 4, clóset NO temporal, pasillo de madera de 24 pulgadas y plataforma de 30x30", "Карта чердака в масштабе 1:1: люк 24x36 у двери 4, временный проём шкафа СЗ, мостки 24 дюйма и площадка 30x30")) + '" style="touch-action:none">' +
      '<text x="14" y="18" font-size="8.0" font-weight="800" fill="#1f5f7a">' +
        L(
          'TRUE-SCALE ATTIC MAP · 24"×36" HATCH (OUTSIDE DOOR 4) + 24" WALKWAY + 30"×30" PLATFORM',
          'PLANTA DE ÁTICO A ESCALA · ESCOTILLA 24"×36" (PUERTA 4) + PASILLO 24" + PLATAFORMA 30"×30"',
          'КАРТА ЧЕРДАКА 1:1 · ЛЮК 24"×36" (У ДВЕРИ 4) + МОСТКИ 24" + ПЛОЩАДКА 30"×30"'
        ) + "</text>" +
      '<g transform="translate(490,22)">' +
        '<circle r="14" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-10 -3,-3.5 3,-3.5" fill="#a8281c"/>' +
        '<text x="0" y="-11" text-anchor="middle" font-size="6.2" font-weight="800" fill="#a8281c">' + L("N", "N", "С") + '</text>' +
        '<text x="0" y="11.8" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">' + L("S", "S", "Ю") + '</text>' +
        '<text x="9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">' + L("E", "E", "В") + '</text>' +
        '<text x="-9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">' + L("W", "O", "З") + "</text>" +
      "</g>" +

      '<rect x="' + px(66) + '" y="' + py(34) + '" width="' + +(81 * SC).toFixed(1) + '" height="' + +(74 * SC).toFixed(1) + '" rx="3" fill="#fdf6e7" stroke="#9a5b06" stroke-width="1.4" stroke-dasharray="5 3"/>' +
      '<text x="' + px(106.5) + '" y="' + py(44) + '" text-anchor="middle" font-size="5.8" font-weight="800" fill="#9a5b06">' + L("DOOR 4 LANDING", "DESCANSO PUERTA 4", "ПЛОЩАДКА ДВЕРИ 4") + "</text>" +

      '<path d="M ' + px(31.5) + " " + py(108) + " L " + px(147) + " " + py(108) + " L " + px(147) + " " + py(234) + " L " + px(0) + " " + py(234) + " L " + px(0) + " " + py(174) + " L " + px(31.5) + " " + py(174) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(88) + '" y="' + py(174) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + L("Kitchen", "Cocina", "Кухня") + "</text>" +

      '<path d="M ' + px(147) + " " + py(58) + " L " + px(207) + " " + py(58) + " L " + px(207) + " " + py(88) + " L " + px(352) + " " + py(88) + " L " + px(352) + " " + py(142) + " L " + px(147) + " " + py(142) + ' Z" fill="#f4f5f3" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(256) + '" y="' + py(120) + '" text-anchor="middle" font-size="7.4" font-weight="700" fill="#5d686d">' + L("Central Hallway", "Pasillo Central", "Центральный коридор") + "</text>" +

      '<rect x="' + px(207) + '" y="' + py(0) + '" width="' + +(72.1 * SC).toFixed(1) + '" height="' + +(88 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(243) + '" y="' + py(45) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#5d686d">' + L("Bathroom", "Baño", "Ванная") + "</text>" +

      '<rect x="' + px(279.1) + '" y="' + py(5.4) + '" width="' + +(36.3 * SC).toFixed(1) + '" height="' + +(82.6 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(297.2) + '" y="' + py(47) + '" text-anchor="middle" font-size="6.0" font-weight="700" fill="#5d686d">' + L("Laundry", "Lav.", "Прач.") + "</text>" +

      '<rect x="' + clX + '" y="' + clY + '" width="' + clW + '" height="' + clH + '" rx="2.5" fill="#fdf6e7" stroke="#9a5b06" stroke-width="1.5" stroke-dasharray="4 2"/>' +
      '<text x="' + clMidX + '" y="' + (clY + 26).toFixed(1) + '" text-anchor="middle" font-size="5.4" font-weight="800" fill="#9a5b06">' + L("Temp.", "Clóset", "Врем.") + "</text>" +
      '<text x="' + clMidX + '" y="' + (clY + 34).toFixed(1) + '" text-anchor="middle" font-size="5.4" font-weight="800" fill="#9a5b06">' + L("Closet", "temp.", "шкаф") + "</text>" +
      '<text x="' + clMidX + '" y="' + (clY + 42).toFixed(1) + '" text-anchor="middle" font-size="5.0" font-weight="700" fill="#9a5b06">' + L("(Open)", "(Abierto)", "(откр.)") + "</text>" +

      '<path d="M ' + px(352) + " " + py(0) + " L " + px(437.5) + " " + py(0) + " L " + px(474) + " " + py(34) + " L " + px(474) + " " + py(96) + " L " + px(437.5) + " " + py(136) + " L " + px(352) + " " + py(136) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(410) + '" y="' + py(66) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + L("Bedroom", "Recámara", "Спальня") + "</text>" +

      '<rect x="' + px(147) + '" y="' + py(142) + '" width="' + +(146.7 * SC).toFixed(1) + '" height="' + +(155.75 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(246) + '" y="' + py(166) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + L("Dining Room", "Comedor", "Столовая") + "</text>" +

      '<path d="M ' + px(293.7) + " " + py(142) + " L " + px(473.5) + " " + py(142) + " L " + px(508) + " " + py(178) + " L " + px(508) + " " + py(258) + " L " + px(473.5) + " " + py(297.75) + " L " + px(293.7) + " " + py(297.75) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(400) + '" y="' + py(222) + '" text-anchor="middle" font-size="8.2" font-weight="700" fill="#5d686d">' + L("Living Room", "Sala", "Гостиная") + "</text>" +

      '<path id="atticWalkHalo" d="' + m.d + '" fill="none" stroke="' + walkCol + '" stroke-width="' + +(30 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.12"/>' +
      '<path id="atticWalkBand" d="' + m.d + '" fill="none" stroke="#d9a86c" stroke-width="' + +(24 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.62"/>' +
      '<path id="atticWalkCenter" d="' + m.d + '" fill="none" stroke="' + walkCol + '" stroke-width="2.2" stroke-dasharray="5 3"/>' +

      '<g id="atticHatchBox" style="cursor:pointer">' +
        '<rect x="' + (hx - hw / 2).toFixed(1) + '" y="' + (hy - hh / 2).toFixed(1) + '" width="' + hw + '" height="' + hh + '" rx="2.5" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2.3"/>' +
        '<line x1="' + (hx - hw / 2).toFixed(1) + '" y1="' + hy + '" x2="' + (hx - hw / 2 - 12).toFixed(1) + '" y2="' + hy + '" stroke="#1f5f7a" stroke-width="1.4"/>' +
        '<rect x="14" y="' + (hy - 11).toFixed(1) + '" width="86" height="22" rx="4" fill="#1f5f7a"/>' +
        '<text x="57" y="' + (hy - 1.5).toFixed(1) + '" text-anchor="middle" font-size="6.0" font-weight="800" fill="#ffffff">' + L('24"×36" Hatch', 'Escotilla 24"×36"', 'Люк 24"×36"') + "</text>" +
        '<text x="57" y="' + (hy + 6.8).toFixed(1) + '" text-anchor="middle" font-size="5.3" font-weight="700" fill="#d8eff8">' + L("Outside Door 4", "Afuera Puerta 4", "У входной двери 4") + "</text>" +
      "</g>" +

      '<g id="atticPlatformDrag" class="u4-drag-move" tabindex="0" role="application" aria-label="' + esc(L("Drag 30x30 wood service platform and furnace footprint", "Arrastrar plataforma de servicio de 30x30 y huella del calefactor", "Перетащить сервисную площадку 30x30 и контур печи")) + '" transform="translate(0, 0)">' +
        '<rect x="' + (fx - pS / 2).toFixed(1) + '" y="' + (fy - fH / 2 - pS).toFixed(1) + '" width="' + pS + '" height="' + pS + '" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2.1"/>' +
        '<rect x="' + (fx + pS / 2 + 5).toFixed(1) + '" y="' + (fy - fH / 2 - pS / 2 - 8.5).toFixed(1) + '" width="76" height="17" rx="4" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.2"/>' +
        '<text x="' + (fx + pS / 2 + 43).toFixed(1) + '" y="' + (fy - fH / 2 - pS / 2 + 2.2).toFixed(1) + '" text-anchor="middle" font-size="5.7" font-weight="800" fill="#1f512c" pointer-events="none">' + L('30"×30" Platform', 'Plataforma 30"×30"', 'Площадка 30"×30"') + "</text>" +
        '<rect class="u4-drag-grip" x="' + (fx - fW / 2).toFixed(1) + '" y="' + (fy - fH / 2).toFixed(1) + '" width="' + fW + '" height="' + fH + '" rx="3.5" fill="#1d2326" stroke="#ffffff" stroke-width="1.5"/>' +
        '<rect x="' + (fx + fW / 2 + 5).toFixed(1) + '" y="' + (fy - 8.5).toFixed(1) + '" width="76" height="17" rx="4" fill="#1d2326"/>' +
        '<text x="' + (fx + fW / 2 + 43).toFixed(1) + '" y="' + (fy + 2.2).toFixed(1) + '" text-anchor="middle" font-size="5.7" font-weight="800" fill="#ffffff" pointer-events="none">' + L('Furnace 33"×29"', 'Calefactor 33"×29"', 'Печь 33"×29"') + "</text>" +
      "</g>" +

      '<rect id="atticWalkPill" x="14" y="313" width="488" height="21" rx="5" fill="' + walkFill + '" stroke="' + walkCol + '" stroke-width="1.1"/>' +
      '<text id="atticWalkPillTxt" x="258" y="326.5" text-anchor="middle" font-size="7.0" font-weight="800" fill="' + walkCol + '">' +
        esc(walkPillText(m)) +
      "</text>" +
    "</svg>";
  }

  function renderFramingSvg() {
    var bayVal = state.joistBay === "unknown" ? null : parseFloat(state.joistBay);
    var bayOk = bayVal === 27.5;
    var bayNarrow = bayVal != null && bayVal < 27.5;
    var bayWide = bayVal != null && bayVal > 27.5;
    var isFire = state.ceilingType === "fire_rated";
    var isHold = state.ceilingType === "hold";
    var frameStroke = isFire ? "#a8281c" : (isHold ? "#9a5b06" : (bayOk ? "#2f6b3f" : "#9a5b06"));
    var frameLabel = isFire
      ? L('ORDER LISTED FIRE-RATED DOOR (FULL 24" × 36" CLEAR)', 'PUERTA CORTAFUEGO LISTADA (MANTENER 24" × 36" LIBRES)', 'ЗАКАЗАТЬ СЕРТИФИЦИРОВАННЫЙ ПРОТИВОПОЖАРНЫЙ ЛЮК (24" × 36" В СВЕТУ)')
      : isHold
        ? L("HOLD BEFORE CUTTING: VERIFY FIRE-RATING & JOISTS ON SITE", "CANDADO ACTIVO: VERIFICAR CORTAFUEGO Y VIGAS ANTES DE CORTAR", "СТОП ДО РЕЗКИ: ПРОВЕРИТЬ ОГНЕСТОЙКОСТЬ И ШАГ БАЛОК НА ОБЪЕКТЕ")
        : L('Non-rated ceiling confirmed: 27-1/2" × 39-1/2" wood frame eligible', 'Plafón no cortafuego confirmado: corte 27-1/2" × 39-1/2" elegible', 'Неогнестойкий потолок подтверждён: деревянная рама 27-1/2" × 39-1/2" допустима');
    var bayNote = bayVal == null
      ? L("Existing ceiling joist bay width: measure on site before cutting", "Separación de vigas existentes: medir en sitio antes de cortar", "Просвет между потолочными балками: замерить на месте до резки")
      : L('Clear bay between joists = ' + bayVal + '"', 'Espacio libre entre vigas = ' + bayVal + '"', 'Чистый просвет между балками = ' + bayVal + '"');

    return '<svg viewBox="0 0 480 264" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(L("Diagram of 24 by 36 inch finished clear opening outside Door 4 and end-first furnace pass", "Diagrama de abertura libre de 24 por 36 pulgadas afuera de Puerta 4 y paso del calefactor de punta", "Схема чистового проёма 24 на 36 дюймов снаружи двери 4 и прохода печи торцом")) + '">' +
      '<text x="14" y="18" font-size="8.2" font-weight="800" fill="#1f5f7a">' +
        L('OUTSIDE FRONT DOOR 4 · FULL 24" × 36" FINISHED CLEAR OPENING', 'ABERTURA AFUERA DE PUERTA 4 · 24" × 36" LIBRES TERMINADAS (NO REDUCIR)', 'ПЛОЩАДКА У ДВЕРИ 4 · ПОЛНЫЙ ЧИСТОВОЙ ПРОСВЕТ 24" × 36" (НЕ ЗАУЖАТЬ)') + "</text>" +
      '<rect x="30" y="32" width="420" height="184" rx="6" fill="#fbfcfb" stroke="#c5ccc9" stroke-width="1.3"/>' +
      '<line x1="30" y1="60" x2="450" y2="60" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<line x1="30" y1="188" x2="450" y2="188" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<text x="40" y="47" font-size="7.1" font-weight="700" fill="#5d686d">' + L("← Stairs & Window (West)", "← Escaleras y Ventana (Oeste)", "← Лестница и окно (Запад)") + "</text>" +
      '<text x="440" y="47" text-anchor="end" font-size="7.1" font-weight="800" fill="#1f5f7a">' + L("Front Door 4 →", "Puerta Principal 4 →", "Входная дверь 4 →") + "</text>" +
      '<rect x="98" y="54" width="284" height="140" fill="#f7ecd9" fill-opacity="0.48" stroke="' + frameStroke + '" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="240" y="67" text-anchor="middle" font-size="6.4" font-weight="800" fill="' + frameStroke + '">' + esc(frameLabel) + "</text>" +
      '<rect x="128" y="75" width="224" height="106" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2.3"/>' +
      '<rect x="152" y="94" width="176" height="68" rx="4" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2"/>' +
      '<text x="240" y="116" text-anchor="middle" font-size="8.4" font-weight="800" fill="#2f6b3f">' + L("FURNACE PASSES END-FIRST ✓", "CALEFACTOR SUBE DE PUNTA ✓", "ПЕЧЬ ПРОХОДИТ ТОРЦОМ ✓") + "</text>" +
      '<text x="240" y="131" text-anchor="middle" font-size="7.5" font-weight="700" fill="#1d2326">' + L('14-3/16" × 29" profile inside 24" × 36" clear', 'Perfil 14-3/16" × 29" dentro de 24" × 36" libres', 'Профиль 14-3/16" × 29" внутри 24" × 36" в свету') + "</text>" +
      '<text x="240" y="145" text-anchor="middle" font-size="7.0" font-weight="700" fill="#2f6b3f">' + L('+9-3/4" & +7" clear margin to spare', '+9-3/4" y +7" de holgura libre', 'Запас +9-3/4" и +7" по сторонам') + "</text>" +
      '<text x="240" y="208" text-anchor="middle" font-size="7.4" font-weight="800" fill="#1f5f7a">' + L('24" × 36" IS FINISHED CLEAR · MOUNT LATCHES OUTSIDE OPENING', '24" × 36" ES MEDIDA LIBRE TERMINADA · BROCHES FUERA DEL CLARO', '24" × 36" — ЧИСТОВОЙ ПРОСВЕТ · ЗАЩЁЛКИ СТАВИТЬ СНАРУЖИ') + "</text>" +
      '<text x="240" y="244" text-anchor="middle" font-size="7.5" font-weight="800" fill="' + (bayNarrow ? "#a8281c" : (bayOk ? "#2f6b3f" : "#9a5b06")) + '">' +
        esc(bayNote + (bayOk ? L(" — Direct bay fit", " — Calza entre vigas", " — Входит между балками") : bayWide ? L(" — Add solid side backing", " — Agregar respaldo lateral sólido", " — Добавить боковые вкладыши") : bayNarrow ? L(" — Frame structural double header", " — Requiere cabezal doble estructural", " — Установить сдвоенные перемычки") : "")) +
      "</text>" +
    "</svg>";
  }

  function renderAirSealSvg() {
    return '<svg viewBox="0 0 470 204" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(L("Cross-section of uninsulated 3/4 plywood lid, closed-cell foam dust gasket and latches outside clear opening", "Corte de tapa de triplay de 3/4 sin aislante, empaque guardapolvo de espuma y broches fuera del claro", "Разрез неутеплённой фанерной крышки 3/4 дюйма с пылезащитным уплотнителем и защёлками снаружи проёма")) + '">' +
      '<text x="235" y="17" text-anchor="middle" font-size="7.9" font-weight="800" fill="#1f5f7a">' +
        L(
          'UNCONDITIONED LANDING HATCH: SNUG 3/4" PLYWOOD LID + FOAM GASKET (NO BATTS OR DAM)',
          'CORTE DE ESCOTILLA (DESCANSO NO ACONDICIONADO): TAPA 3/4" + EMPAQUE (SIN FIBRA NI DIQUE)',
          'ЛЮК НАД НЕОТАПЛИВАЕМОЙ ПЛОЩАДКОЙ: КРЫШКА 3/4" + УПЛОТНИТЕЛЬ (БЕЗ УТЕПЛИТЕЛЯ И БОРТИКА)'
        ) + "</text>" +
      '<rect x="30" y="54" width="410" height="44" rx="5" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1.1" stroke-dasharray="4 3"/>' +
      '<text x="235" y="74" text-anchor="middle" font-size="7.6" font-weight="800" fill="#1f5f7a">' +
        L(
          "Attic above unconditioned common stair landing outside Front Door 4",
          "Ático sobre descanso común no acondicionado afuera de Puerta Principal 4",
          "Чердак над неотапливаемой общей лестничной площадкой у двери 4"
        ) + "</text>" +
      '<text x="235" y="88" text-anchor="middle" font-size="6.9" font-weight="700" fill="#5d686d">' +
        L(
          "Zero lid insulation · Zero wire loops/screw eyes · Zero perimeter dam (2025 CA Energy Code §160.1(a))",
          "Cero aislante en tapa · Cero alambres/armellas · Cero dique perimetral (Código Energía CA §160.1(a))",
          "Ноль утеплителя на крышке · Ноль проволоки/проушин · Ноль бортика (Энергокодекс CA 2025 §160.1(a))"
        ) + "</text>" +
      '<rect x="114" y="106" width="13" height="46" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<rect x="343" y="106" width="13" height="46" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<rect x="132" y="116" width="206" height="18" rx="2" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.9"/>' +
      '<text x="235" y="128" text-anchor="middle" font-size="7.3" font-weight="800" fill="#1f5f7a">' +
        L(
          'Snug 3/4" plywood lid (leave removable seam UNCAULKED · test twice)',
          'Tapa triplay 3/4" ajustada (dejar junta SIN sellador · probar 2 veces)',
          'Плотная фанерная крышка 3/4" (съёмный стык НЕ ГЕРМЕТИЗИРОВАТЬ · открыть 2 раза)'
        ) + "</text>" +
      '<rect x="127" y="134" width="22" height="10" fill="#2f6b3f"/>' +
      '<rect x="321" y="134" width="22" height="10" fill="#2f6b3f"/>' +
      '<rect x="94" y="140" width="18" height="9" rx="2" fill="#1d2326"/>' +
      '<rect x="358" y="140" width="18" height="9" rx="2" fill="#1d2326"/>' +
      '<line x1="24" y1="152" x2="127" y2="152" stroke="#1d2326" stroke-width="2.3"/>' +
      '<line x1="343" y1="152" x2="446" y2="152" stroke="#1d2326" stroke-width="2.3"/>' +
      '<text x="235" y="172" text-anchor="middle" font-size="7.4" font-weight="800" fill="#2f6b3f">' +
        L(
          '1/2"×1/8" closed-cell foam dust gasket on 1×2 strips · 4 latches outside 24"×36" clear',
          'Empaque espuma cerrada 1/2"×1/8" sobre tiras 1×2 · 4 broches fuera del claro 24"×36"',
          'Пеноуплотнитель 1/2"×1/8" на брусках 1×2 · 4 защёлки снаружи просвета 24"×36"'
        ) + "</text>" +
      '<text x="235" y="191" text-anchor="middle" font-size="7.0" font-weight="600" fill="#5d686d">' +
        L(
          "If landing ceiling is fire-rated: use listed fire-rated access door preserving full 24\"×36\" clear",
          "Si el descanso requiere plafón cortafuego: instalar puerta cortafuego listada con 24\"×36\" libres reales",
          "Если потолок площадки противопожарный: ставить сертифицированный люк с полным просветом 24\"×36\""
        ) + "</text>" +
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
        ptxt.textContent = walkPillText(m);
      }

      var kpiLen = document.getElementById("atticKpiLen");
      if (kpiLen) {
        kpiLen.className = "u4h-kpi-val " + (m.walkPass ? "is-ok" : "is-fail");
        kpiLen.textContent = m.walkFt + L(" ft / 20 ft", " pies / 20", " фут. / 20 фут.");
      }
      var kpiSht = document.getElementById("atticKpiSheets");
      if (kpiSht) kpiSht.textContent = m.totalSheets + L(" sheets 4×8 total", " hojas 4×8 total", " лист. 4×8 всего");
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
    var m = computeWalkway(state.furnacePos);
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;
    var hvacHref = (window.U4PlanNav && typeof window.U4PlanNav.planUrl === "function")
      ? window.U4PlanNav.planUrl("hvac-layout")
      : "../hvac-layout/index.html";

    if (holdEl) {
      holdEl.className = "u4h-hold-strip";
      holdEl.innerHTML = L(
        '<strong>HOLD CEILING CUTS UNTIL VERIFIED:</strong> Permanent spot is outside <strong>Front Door 4</strong> (<code>24" × 36"</code> finished clear on unconditioned landing — no lid batts or dam). Confirm fire-rating &amp; joist bay before cutting. Need ductwork &amp; exhaust? <a href="' + esc(hvacHref) + '">2. Furnace, Ducts &amp; Exhaust &rarr;</a>',
        '<strong>CANDADO ANTES DE CORTAR PLAFÓN:</strong> Ubicación elegida afuera de <strong>Puerta Principal 4</strong> (<code>24" × 36"</code> libres terminadas, descanso común no acondicionado — sin fibra ni dique). No cortar hasta verificar vigas y cortafuego. ¿Ductos y salida lateral? <a href="' + esc(hvacHref) + '">2. Calefactor, Ductos y Salida &rarr;</a>',
        '<strong>СТОП ДО ПРОВЕРКИ ПОТОЛКА:</strong> Постоянное место люка — снаружи у <strong>входной двери 4</strong> (чистовой просвет <code>24" × 36"</code> над неотапливаемой площадкой — крышка без утеплителя и бортика). Подтвердить огнестойкость и шаг балок до резки. Воздуховоды и выброс: <a href="' + esc(hvacHref) + '">2. Печь и воздуховоды &rarr;</a>'
      );
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(L(s.en, s.es, s.ru)) + "</button>";
      }).join("") +
      "</div>";

    var titleTxt = L("Attic Hatch, Wood Walkway & Service Platform", "Escotilla del Ático, Pasillo de Madera y Plataforma", "Чердачный люк, деревянные мостки и сервисная площадка");
    var subTxt = L(
      'Outside Front Door 4 (24" × 36" clear) — drag the 30" × 30" platform to check the 20 ft walkway limit',
      'Afuera de Puerta Principal 4 (24" × 36" libres) — arrastra la plataforma de 30" × 30" para revisar el límite de 20 pies',
      'Снаружи у двери 4 (просвет 24" × 36") — перетащите площадку 30" × 30" для проверки лимита мостков 20 футов'
    );
    var inner = "";

    if (state.step === "map") {
      var stCls = m.walkPass ? "is-pass" : "is-fail";
      var stTxt = m.walkPass
        ? L(
            '✓ Within 20 ft limit: Continuous 24" wood walkway measures ' + m.walkFt + ' ft at 66" flat-roof attic height.',
            '✓ Dentro del límite: Pasillo continuo de madera de 24" mide ' + m.walkFt + ' pies (máx. 20 pies con 66" de altura en ático).',
            '✓ В пределах нормы 20 футов: сплошные мостки шириной 24" составляют ' + m.walkFt + ' фут. при высоте чердака 66".'
          )
        : L(
            "✗ Over 20 ft limit (" + m.walkFt + " ft): move the service platform closer toward Southwest Dining.",
            "✗ Excede 20 pies (" + m.walkFt + " pies): acerca la plataforma hacia el Comedor Suroeste.",
            "✗ Превышен лимит 20 футов (" + m.walkFt + " фут.): сдвиньте сервисную площадку ближе к юго-западу столовой."
          );

      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + L("Finished Clear Opening", "Claro Libre Permanente", "Чистовой просвет люка") + "</div>" +
            '<div class="u4h-kpi-val is-info">24" × 36"</div>' +
            '<div class="u4h-kpi-sub">' + L("Unconditioned Door 4 landing", "Descanso afuera Puerta 4 (sin fibra)", "Неотапл. площадка двери 4 (без утепл.)") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + L('24" Wood Walkway', 'Pasillo Madera 24"', 'Деревянные мостки 24"') + "</div>" +
            '<div id="atticKpiLen" class="u4h-kpi-val ' + (m.walkPass ? "is-ok" : "is-fail") + '">' + m.walkFt + L(" ft / 20 ft", " pies / 20", " фут. / 20 фут.") + "</div>" +
            '<div class="u4h-kpi-sub">' + L('30" clear height above walkway', '30" libres de altura sobre pasillo', 'Мин. 30" в свету над мостками') + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + L('23/32" OSB or 3/4" Plywood', 'OSB 23/32" o Triplay 3/4"', 'Плита OSB 23/32" или фанера 3/4"') + "</div>" +
            '<div id="atticKpiSheets" class="u4h-kpi-val is-ok">' + m.totalSheets + L(" sheets 4×8 total", " hojas 4×8 total", " лист. 4×8 всего") + "</div>" +
            '<div class="u4h-kpi-sub">' + m.walkSheets + L(" walkway + 1 platform/lid", " pasillo + 1 plataforma/tapa", " мостки + 1 площадка/крышка") + "</div>" +
          "</div>" +
        "</div>" +
        renderMapLegend() +
        '<div class="u4h-svg-wrap">' + renderCarpentryMapSvg(m) + "</div>" +
        '<div class="u4h-svg-hint">' + L('Tip: Drag the 30" × 30" platform on the map, or tap the 24" × 36" hatch to inspect ceiling framing.', 'Consejo: Arrastra la plataforma 30"×30" en el plano, o toca la escotilla 24"×36" para ver el marco y vigas.', 'Подсказка: перетащите площадку 30"×30" по карте или нажмите на люк 24"×36", чтобы открыть схему обвязки балок.') + "</div>" +
        '<div class="u4h-status ' + stCls + '">' + esc(stTxt) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + L('30" × 30" Platform spot:', 'Posición de plataforma 30"×30":', 'Точка площадки 30"×30":') + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.preset === "sw_dining" ? " is-active" : "") + '" data-preset="sw_dining">' + L("Southwest Dining · 15.8 ft (Recommended)", "Comedor SO · 15.8 pies (Recomendado)", "ЮЗ столовая · 15.8 фут. (реком.)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.preset === "nw_dining" ? " is-active" : "") + '" data-preset="nw_dining">' + L("Northwest Dining · 10.6 ft", "Comedor NO · 10.6 pies", "СЗ столовая · 10.6 фут.") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.preset === "east_living" ? " is-active" : "") + '" data-preset="east_living">' + L("East Living · >20 ft (Over limit)", "Sala Este · >20 pies (Excede)", "Восток гостиной · >20 фут. (превышение)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        renderEquipDrawer(m);

    } else if (state.step === "framing") {
      titleTxt = L('Door 4 Landing Framing & 24" × 36" Clear Opening', 'Marco en Descanso de Puerta 4 y Claro Libre de 24" × 36"', 'Обвязка проёма у двери 4 и чистовой просвет 24" × 36"');
      subTxt = L(
        '24" × 36" is finished clear (not rough cut) — verify ceiling fire-rating and joist bay before cutting',
        '24" × 36" es paso libre terminado (no corte rústico) — verificar cortafuego y vigas antes de cortar',
        '24" × 36" — чистовой размер в свету (не черновой вырез); до резки проверить огнестойкость и шаг балок'
      );

      var fCls = (state.ceilingType === "non_rated" && state.joistBay === "27.5") ? "is-pass" : "is-warn";
      var fTxt = state.ceilingType === "fire_rated"
        ? L(
            'Fire-rated ceiling required: Order a listed fire-rated access door that preserves the full 24" × 36" finished clear opening (do not build the wood kit or use nominal doors that shrink clear passage).',
            'Plafón cortafuego requerido: Pedir puerta cortafuego listada que conserve las 24" × 36" libres reales (no armar marco de madera ni usar puertas nominales que reduzcan el paso).',
            'Требуется противопожарный потолок: заказать сертифицированный противопожарный люк с полным чистовым просветом 24" × 36" (не собирать деревянный короб и не брать номинальные люки, заужающие проход).'
          )
        : state.ceilingType === "hold"
          ? L(
              'Active hold: Photograph the markout outside Front Door 4 and confirm ceiling fire-rating and joist bay width before making any ceiling cut.',
              'Candado activo: Fotografiar primero el trazo afuera de Puerta 4 y confirmar si el descanso requiere puerta cortafuego y cuánto miden las vigas antes de cortar.',
              'Активная пауза: сначала сфотографировать разметку снаружи у двери 4 и подтвердить огнестойкость потолка и расстояние между балками до начала резки.'
            )
          : (state.joistBay === "14.5" || state.joistBay === "22.5")
            ? L(
                'A ' + state.joistBay + '" joist bay requires structural double-header framing so the finished opening stays a full 24" × 36" clear.',
                'Espacio entre vigas de ' + state.joistBay + '": armar cabezal doble estructural para mantener las 24" × 36" libres completas.',
                'Просвет между балками ' + state.joistBay + '" требует устройства сдвоенных несущих перемычек, чтобы чистовой проём остался полными 24" × 36".'
              )
            : state.joistBay === "27.5"
              ? L(
                  '✓ Non-rated ceiling + 27-1/2" joist bay: wood frame fits directly with a full 24" × 36" clear opening.',
                  '✓ Plafón no cortafuego + vigas a 27-1/2": el marco de madera calza directo dejando 24" × 36" libres.',
                  '✓ Неогнестойкий потолок + просвет 27-1/2": деревянная рама встаёт напрямую с полным просветом 24" × 36".'
                )
              : L(
                  'Non-rated ceiling selected — measure the clear bay between joists before cutting.',
                  'Plafón no cortafuego seleccionado — mide ahora el espacio libre entre vigas antes de cortar.',
                  'Выбран неогнестойкий потолок — измерьте чистый просвет между балками перед вырезом.'
                );

      inner =
        '<div class="u4h-svg-wrap">' + renderFramingSvg() + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + L("Ceiling fire-rating gate:", "Estado cortafuego del plafón:", "Проверка огнестойкости потолка:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.ceilingType === "hold" ? " is-active" : "") + '" data-ceil="hold">' + L("Unverified Hold (Do not cut)", "Pendiente verificar (Candado)", "Не проверено (Стоп резка)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ceilingType === "non_rated" ? " is-active" : "") + '" data-ceil="non_rated">' + L("Non-Rated Confirmed", "No cortafuego confirmado", "Неогнестойкий подтверждён") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ceilingType === "fire_rated" ? " is-active" : "") + '" data-ceil="fire_rated">' + L("Fire-Rated (Listed door)", "Cortafuego (Puerta listada)", "Противопожарный (серт. люк)") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + L("Clear bay between joists:", "Espacio libre entre vigas:", "Чистый просвет между балками:") + "</span>" +
            '<div class="u4h-pill-group">' +
              [
                ["unknown", L("Measure on site", "Por medir", "Замерить на месте")],
                ["14.5", L('14-1/2" (16" OC)', '14-1/2" (16" eje)', '14-1/2" (шаг 16")')],
                ["22.5", L('22-1/2" (24" OC)', '22-1/2" (24" eje)', '22-1/2" (шаг 24")')],
                ["27.5", '27-1/2"'],
                ["30", '> 27-1/2"']
              ].map(function (opt) {
                return '<button type="button" class="u4h-pill' + (state.joistBay === opt[0] ? " is-active" : "") + '" data-bay="' + opt[0] + '">' + opt[1] + "</button>";
              }).join("") +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-status ' + fCls + '">' + esc(fTxt) + "</div>" +
        '<div class="u4h-photo-card is-contain">' +
          '<img src="./assets/attic-hatch-candidate.jpg" alt="' + esc(L("Upright site photo of common landing outside Front Door 4 showing ceiling, fixture, and original 103-inch picture rail", "Foto real del descanso común afuera de Puerta Principal 4 mostrando plafón, lámpara y riel original a 103 pulgadas", "Вертикальное фото площадки снаружи двери 4: потолок, светильник и оригинальный молдинг на высоте 103 дюйма")) + '">' +
          '<div class="u4h-photo-cap"><strong>' + L("Site Photo — Common Landing Outside Front Door 4:", "Foto del sitio — Descanso afuera de Puerta 4:", "Фото объекта — Площадка снаружи входной двери 4:") + "</strong> " +
            L(
              'Keep the landing light fixture, original 103" high picture rail, and Door 4 / stairwell window casings intact and separate from hatch trim.',
              'Conservar la lámpara, el riel original de cuadros a 103" y los contramarcos de Puerta 4 y ventana completamente separados del marco de la escotilla.',
              'Сохранить светильник площадки, оригинальный верхний молдинг 103" и наличники двери 4 и лестничного окна нетронутыми и отдельно от обрамления люка.'
            ) +
          "</div>" +
        "</div>";

    } else if (state.step === "seal") {
      titleTxt = L('Uninsulated 3/4" Lid, Foam Gasket & Crew Lumber List', 'Tapa de 3/4" Sin Aislante, Empaque y Lista de Madera', 'Неутеплённая крышка 3/4", уплотнитель и ведомость досок');
      subTxt = L(
        "Unconditioned common landing outside Door 4 — zero lid insulation or perimeter dam; dust-sealed lid, walkway decking, LED light & GFCI",
        "Descanso común no acondicionado afuera de Puerta 4 — sin aislante ni dique; tapa con empaque, madera de pasillo, luz LED y GFCI",
        "Неотапливаемая общая площадка у двери 4 — без утеплителя и бортика на крышке; пылезащитный контур, настил мостков, свет LED и розетка GFCI"
      );

      inner =
        '<div class="u4h-svg-wrap">' + renderAirSealSvg() + "</div>" +
        '<div class="u4h-two-col">' +
          '<div class="u4h-info-box" style="margin:0">' +
            '<div class="u4h-info-title">' + L('Uninsulated 3/4" Lid & Gasket Rules', 'Tapa de 3/4" y Empaque Guardapolvo', 'Правила сборки неутеплённой крышки 3/4" и уплотнителя') + "</div>" +
            '<ul class="u4h-info-list">' +
              "<li>" + L("Unconditioned common landing outside Door 4: NO lid insulation, wire loops, screw eyes, or perimeter dam.", "Descanso común no acondicionado afuera de Puerta 4: NO instalar aislante en tapa, alambres, armellas ni dique perimetral.", "Площадка снаружи двери 4 не отапливается: НЕ крепить к крышке минвату, проволоку, проушины и не ставить бортик утеплителя.") + "</li>" +
              "<li>" + L('Caulk fixed outer frame perimeter using 3/8" backer rod and paintable sealant.', 'Sellar el marco fijo exterior con cordón de respaldo de 3/8" y sellador pintable.', 'Загерметизировать неподвижную внешнюю раму уплотнительным шнуром 3/8" и окрашиваемым герметиком.') + "</li>" +
              "<li>" + L('Continuous 1/2" × 1/8" closed-cell foam gasket on clean 1×2 ledger strips + leave removable 3/4" lid seam UNCAULKED (test-open twice).', 'Empaque continuo de espuma cerrada de 1/2" × 1/8" sobre tiras limpias de 1×2 + dejar junta de tapa SIN sellador (probar abrir 2 veces).', 'Наклеить сплошной пеноуплотнитель 1/2" × 1/8" на бруски 1×2 + оставить съёмный стык крышки 3/4" БЕЗ герметика (дважды проверить открывание).') + "</li>" +
              "<li>" + L('Mount 4 compression latches outside the 24" × 36" clear opening (or listed 24" × 36" clear fire door if ceiling is fire-rated).', 'Montar 4 broches de compresión fuera del claro de 24" × 36" (o puerta cortafuego listada de 24" × 36" libres si aplica).', 'Установить 4 прижимные защёлки снаружи чистового проёма 24" × 36" (или сертифицированный противопожарный люк 24" × 36" в свету).') + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-info-box" style="margin:0">' +
            '<div class="u4h-info-title">' + L("Walkway Lumber & Attic Electrical", "Madera y Eléctrico en Ático", "Пиломатериалы мостков и электрика чердака") + "</div>" +
            '<ul class="u4h-info-list">' +
              "<li>" + m.walkSheets + L(' sheets 4×8 of 23/32" OSB or 3/4" structural plywood for the 24" walkway (' + m.walkFt + ' ft; never 3/8").', ' hojas 4×8 de OSB 23/32" o triplay estructural 3/4" para el pasillo de 24" (' + m.walkFt + ' pies; nunca usar 3/8").', ' лист. 4×8 плиты OSB 23/32" или конструкционной фанеры 3/4" для мостков 24" (' + m.walkFt + ' фут.; фанеру 3/8" не брать).') + "</li>" +
              "<li>" + L('1 additional 4×8 sheet for the level 30" × 30" North service platform and removable hatch lid.', '1 hoja 4×8 adicional para la plataforma nivelada de 30" × 30" (lado Norte) y la tapa removible.', '1 дополнительный лист 4×8 для ровной сервисной площадки 30" × 30" с севера и съёмной крышки люка.') + "</li>" +
              "<li>" + L("1 permanent switched enclosed LED light near hatch + 1 line-side 120V GFCI outlet within 25 ft.", "1 lámpara LED cerrada permanente con apagador junto a la escotilla + 1 contacto GFCI 120V a ≤ 25 pies.", "1 стационарный закрытый светильник LED с выключателем у люка + 1 розетка GFCI 120В не далее 25 футов от печи.") + "</li>" +
              "<li>" + L("Keep temporary NW bedroom-closet opening open until both thermostat cable and permanent hatch are finished.", "Mantener abierta la abertura temporal del clóset NO de recámara hasta terminar el cable de termostato y la escotilla.", "Оставить открытым временный проём в потолке шкафа СЗ спальни до завершения протяжки кабеля термостата и монтажа постоянного люка.") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
        renderEquipDrawer(m);

    } else {
      titleTxt = L("Pre-Cut & Closeout Field Checks", "Candados de Campo Antes de Cortar o Cerrar", "Полевые фото-проверки до выреза и закрытия");
      subTxt = L(
        "Tap to check off each verification gate on site before cutting the Door 4 landing ceiling",
        "Marca cada verificación en sitio antes de cortar el plafón afuera de Puerta Principal 4",
        "Отметьте каждый обязательный пункт на объекте перед вырезом потолка на площадке двери 4"
      );

      var gateItems = [
        {
          id: "markout",
          tEn: '1. Photograph 24" × 36" clear markout outside Front Door 4 before cutting',
          tEs: '1. Fotografiar el trazo de 24" × 36" libres afuera de Puerta 4 antes de cortar',
          tRu: '1. Сфотографировать разметку просвета 24" × 36" снаружи у двери 4 до резки',
          dEn: "Confirm ladder setup, lid swing, Door 4 swing, and clearance from the landing light fixture.",
          dEs: "Confirmar posición de escalera, abatimiento de tapa, giro de Puerta 4 y distancia a la lámpara.",
          dRu: "Проверить установку стремянки, ход крышки, открывание двери 4 и отступ от потолочного светильника."
        },
        {
          id: "fire_joist",
          tEn: "2. Confirm landing ceiling fire-rating & measure existing joist bay width",
          tEs: "2. Confirmar clasificación cortafuego del descanso y medir separación entre vigas",
          tRu: "2. Подтвердить огнестойкость потолка площадки и замерить просвет между балками",
          dEn: 'Do not cut a 27-1/2" × 39-1/2" wood-kit opening unless non-rated ceiling is confirmed; order a listed 24" × 36" clear fire door if fire-rated.',
          dEs: 'No cortar 27-1/2" × 39-1/2" sin confirmar plafón no cortafuego; pedir puerta cortafuego listada de 24" × 36" libres si aplica.',
          dRu: 'Не вырезать 27-1/2" × 39-1/2" без подтверждения неогнестойкого потолка; при противопожарном требовании заказать сертифицированный люк 24" × 36" в свету.'
        },
        {
          id: "roof_dry",
          tEn: "3. Verify flat-roof leak repair is completely dry before closing ceilings",
          tEs: "3. Verificar completamente seca la reparación de gotera en techo plano antes de cerrar plafones",
          tRu: "3. Убедиться, что зона ремонта протечки плоской крыши полностью сухая до закрытия потолков",
          dEn: "Moisture check roof framing above landing/hallway and NW bedroom closet before final enclosure.",
          dEs: "Revisar humedad en vigas superiores sobre descanso/pasillo y clóset NO antes de cerrar.",
          dRu: "Проверить влажность балок перекрытия над площадкой/коридором и гардеробной СЗ спальни."
        },
        {
          id: "trim_safe",
          tEn: '4. Protect original 103" picture rail, 9-1/2" baseboard & Door 4 casings',
          tEs: '4. Proteger riel original a 103", zoclo de 9-1/2" y contramarcos de Puerta 4',
          tRu: '4. Защитить оригинальный молдинг 103", плинтус 9-1/2" и наличники двери 4',
          dEn: "Keep hatch casing/trim completely separate from original Edwardian woodwork.",
          dEs: "Mantener el marco de la escotilla completamente separado de la carpintería original.",
          dRu: "Держать наличник люка полностью отдельно от исторических деревянных элементов."
        },
        {
          id: "temp_closet",
          tEn: "5. Keep temporary NW bedroom-closet ceiling opening OPEN until final sign-off",
          tEs: "5. Mantener ABIERTA la abertura temporal del clóset NO de recámara hasta el cierre",
          tRu: "5. Держать ОТКРЫТЫМ временный проём в потолке шкафа СЗ спальни до приёмки",
          dEn: "Close NW bedroom-closet ceiling (X=315.4–352.0, Y=5.4–88.0) only after thermostat wire pull and permanent Door 4 hatch are complete.",
          dEs: "Cerrar el techo del clóset NO (X=315.4–352.0, Y=5.4–88.0) solo cuando estén terminados el cable de termostato y la escotilla permanente.",
          dRu: "Зашивать потолок шкафа СЗ (X=315.4–352.0, Y=5.4–88.0) только после протяжки кабеля термостата и сдачи постоянного люка у двери 4."
        }
      ];

      var doneCount = gateItems.filter(function (g) { return !!state.checks[g.id]; }).length;
      var allDone = doneCount === gateItems.length;

      inner =
        '<div class="u4h-status ' + (allDone ? "is-pass" : "is-warn") + '">' +
          esc(allDone
            ? L("✓ All 5 pre-cut & closeout checks marked verified on this device.", "✓ Los 5 candados previos verificados en este dispositivo.", "✓ Все 5 предмонтажных проверок отмечены выполненными на этом устройстве.")
            : L(
                doneCount + " of " + gateItems.length + " checks verified — hold ceiling cuts until pre-cut gates are confirmed.",
                doneCount + " de " + gateItems.length + " candados verificados — no cortar plafón hasta completar los candados previos.",
                "Проверено " + doneCount + " из " + gateItems.length + " — не вырезать потолок до подтверждения всех стоп-пунктов."
              )) +
        "</div>" +
        '<div class="u4h-check-grid">' +
          gateItems.map(function (g) {
            var ck = !!state.checks[g.id];
            return '<label class="u4h-check-row' + (ck ? " is-checked" : "") + '">' +
              '<input type="checkbox" data-gate-check="' + g.id + '"' + (ck ? " checked" : "") + ">" +
              '<span class="u4h-check-body"><strong>' + esc(L(g.tEn, g.tEs, g.tRu)) + "</strong><span>" + esc(L(g.dEn, g.dEs, g.dRu)) + "</span></span>" +
            "</label>";
          }).join("") +
        "</div>" +
        renderEquipDrawer(m);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="atticPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + L("Prev", "Anterior", "Назад") + "</button>" +
      '<span class="u4h-pager-count">' + L("Step ", "Paso ", "Шаг ") + (idx + 1) + L(" of ", " de ", " из ") + STEPS.length + "</span>" +
      '<button type="button" id="atticNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + L("Next", "Siguiente", "Далее") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(titleTxt) + "</div>" +
            '<div class="u4h-sub">' + esc(subTxt) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">' + L("Plan 1 · Hatch & Walkway", "Plano 1 · Escotilla y Pasillo", "План 1 · Люк и мостки") + "</span>" +
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
        lidInsulation: "none_unconditioned_landing",
        tempClosetNicheIn: { xMin: 315.4, xMax: 352.0, yMin: 5.4, yMax: 88.0 },
        ceilingType: state.ceilingType,
        joistBay: state.joistBay,
        walkFt: m.walkFt,
        totalSheets: m.totalSheets,
        summary: "Plan 1 Attic Hatch & Walkway: view=" + state.step + ", spot=door4 (24x36 clear, uninsulated lid), nwCloset=(315.4..352, 5.4..88), walkway=" + m.walkFt + "ft (" + m.totalSheets + " sheets total), fireGate=" + state.ceilingType + "."
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
    window.addEventListener("u4:lang-change", function () {
      render();
      if (window.U4LiveAi) window.U4LiveAi.refreshPrompts();
    });
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "attic-hatch",
        room: "attic-access",
        titleEn: "Attic Hatch, Wood Walkway & Platform",
        titleEs: "Escotilla del Ático, Pasillo de Madera y Plataforma",
        titleRu: "Чердачный люк, деревянные мостки и площадка",
        getContext: function () {
          var m = computeWalkway(state.furnacePos);
          return "Plan1=attic-hatch, View=" + state.step + ", Hatch=Outside Front Door 4 (24x36in finished clear on unconditioned landing, uninsulated 3/4 plywood lid + foam gasket, zero batts/dam), NWTempCloset=(315.4..352.0, 5.4..88.0), Walkway=" + m.walkFt + "ft (" + m.walkSheets + " walkway sheets + 1 platform/lid sheet), FireGate=" + state.ceilingType + ", JoistBay=" + state.joistBay + ".";
        },
        quickPrompts: function (lang) {
          if (lang === "ru") {
            return [
              "Почему крышка люка 24×36 у двери 4 делается без утеплителя?",
              "Сколько листов OSB или фанеры 3/4 нужно на мостки и площадку?",
              "Что меняется, если потолок площадки требует противопожарный люк?"
            ];
          }
          return lang === "es"
            ? ["¿Cómo sellamos la tapa de 24×36 con empaque sin pegar la junta?", "¿Cuántas hojas de OSB/triplay lleva el pasillo y plataforma?", "¿Qué cambia si el plafón del descanso requiere puerta cortafuego?"]
            : ["How do we gasket the uninsulated 24×36 lid so it lifts cleanly?", "How many 4×8 sheets of OSB or 3/4 plywood are needed?", "What changes if the landing ceiling requires a fire-rated hatch door?"];
        }
      });
    }
    var lastLang = getLang();
    if (window.MutationObserver) {
      new MutationObserver(function () {
        var curLang = getLang();
        if (curLang !== lastLang) {
          lastLang = curLang;
          render();
        }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    }
    syncUrl();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
