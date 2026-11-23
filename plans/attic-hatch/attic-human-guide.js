/* ============================================================================
   Plan 1: Attic Hatch, Wood Walkway & Service Platform
   Focused carpentry & air-sealing plan:
     View 1: Hatch Location & 24" Wood Walkway Map (true scale, draggable platform)
     View 2: Ceiling Framing & 24" × 36" Clear Opening (joist & fire-door checks)
     View 3: Insulated Lid, Air Seal & Lumber List (4-sided dam + weatherstrip)
   Zero Ductwork Clutter · Zero Walkthrough Tab · Zero Prices · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "map", en: "1. Hatch & Walkway Map", es: "1. Mapa de Escotilla y Pasillo" },
    { id: "framing", en: "2. Ceiling Opening (24\" × 36\")", es: "2. Abertura en Plafón (24\" × 36\")" },
    { id: "seal", en: "3. Insulated Lid & Lumber", es: "3. Tapa Aislada y Madera" }
  ];

  var SC = 0.86;
  var OX = 24;
  var OY = 38;
  function px(xIn) { return +(OX + xIn * SC).toFixed(1); }
  function py(yIn) { return +(OY + yIn * SC).toFixed(1); }

  var HATCH_DOOR4 = { x: 112, y: 74, w: 24, h: 36 };
  var HATCH_HALL = { x: 204, y: 108, w: 36, h: 24 };

  var bootParams = new URLSearchParams(window.location.search || "");

  function resolveStep(raw) {
    var s = String(raw || "").toLowerCase().trim();
    if (s === "2" || s === "framing" || s === "hatch" || s === "spot" || s === "opening") return "framing";
    if (s === "3" || s === "seal" || s === "lid" || s === "lumber" || s === "dam") return "seal";
    return "map";
  }

  var initFx = Number(bootParams.get("fx"));
  var initFy = Number(bootParams.get("fy"));
  var state = {
    step: resolveStep(bootParams.get("step")),
    hatchSpot: (bootParams.get("loc") || "").toLowerCase() === "hall" ? "hall" : "door4",
    furnacePos: {
      x: isFinite(initFx) && initFx >= 162 && initFx <= 420 ? Math.round(initFx) : 174,
      y: isFinite(initFy) && initFy >= 140 && initFy <= 274 ? Math.round(initFy) : 258
    },
    preset: "sw_dining",
    ceilingType: "standard",
    joistBay: "unknown",
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

  function activeHatch() {
    return state.hatchSpot === "hall" ? HATCH_HALL : HATCH_DOOR4;
  }

  function computeWalkway(fPos) {
    var h = activeHatch();
    var platCenterY = fPos.y - 29.5;
    var hallSpineY = 108;
    var platEdgeY = platCenterY <= hallSpineY ? Math.min(fPos.y - 14.5, platCenterY + 15) : platCenterY - 15;
    var pts;

    if (state.hatchSpot === "hall") {
      var hEast = h.x + h.w / 2;
      if (Math.abs(fPos.x - h.x) <= 18) {
        pts = [
          { x: h.x, y: h.y + h.h / 2 },
          { x: fPos.x, y: h.y + h.h / 2 },
          { x: fPos.x, y: platEdgeY }
        ];
      } else {
        var turnX = fPos.x >= hEast ? fPos.x : Math.max(166, fPos.x);
        var startX = fPos.x >= h.x ? hEast : (h.x - h.w / 2);
        pts = [
          { x: startX, y: hallSpineY },
          { x: turnX, y: hallSpineY },
          { x: turnX, y: platEdgeY }
        ];
      }
    } else {
      var hatchEastX = h.x + h.w / 2;
      var hatchMidY = h.y;
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
      next.set("loc", state.hatchSpot);
      next.set("fx", String(Math.round(state.furnacePos.x)));
      next.set("fy", String(Math.round(state.furnacePos.y)));
      window.history.replaceState(null, "", "?" + next.toString() + (window.location.hash || ""));
    } catch (_) {}
  }

  function renderCarpentryMapSvg(m, es) {
    var h = activeHatch();
    var fx = px(state.furnacePos.x);
    var fy = py(state.furnacePos.y);
    var fW = +(33.25 * SC).toFixed(1);
    var fH = +(29 * SC).toFixed(1);
    var pS = +(30 * SC).toFixed(1);
    var walkCol = m.walkPass ? "#2f6b3f" : "#a8281c";
    var walkFill = m.walkPass ? "#e4f0e6" : "#f9e6e4";

    return '<svg id="atticWalkwaySvg" viewBox="0 0 500 332" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Mapa de escotilla 24x36, pasillo de madera de 24 pulgadas y plataforma de 30x30" : "Map of 24x36 attic hatch, 24-inch wood walkway and 30x30 service platform") + '" style="touch-action:none">' +
      '<text x="14" y="17" font-size="8.4" font-weight="800" fill="#1f5f7a">' +
        (es ? "MAPA DE CARPINTERÍA EN ÁTICO · ESCOTILLA + PASILLO 24\" + PLATAFORMA 30\"×30\""
            : "ATTIC CARPENTRY MAP · 24\"×36\" HATCH + 24\" WOOD WALKWAY + 30\"×30\" PLATFORM") + "</text>" +
      '<g transform="translate(476,21)">' +
        '<circle r="14" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-10 -3,-3.5 3,-3.5" fill="#a8281c"/>' +
        '<text x="0" y="-11" text-anchor="middle" font-size="6.2" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="11.8" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">S</text>' +
        '<text x="9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">E</text>' +
        '<text x="-9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">' + (es ? "O" : "W") + "</text>" +
      "</g>" +

      '<rect x="' + px(66) + '" y="' + py(34) + '" width="' + +(81 * SC).toFixed(1) + '" height="' + +(74 * SC).toFixed(1) + '" rx="3" fill="#fdf6e7" stroke="#9a5b06" stroke-width="1.4" stroke-dasharray="5 3"/>' +
      '<text x="' + px(106.5) + '" y="' + py(45) + '" text-anchor="middle" font-size="6.0" font-weight="800" fill="#9a5b06">' + (es ? "DESCANSO PUERTA 4" : "DOOR 4 LANDING") + "</text>" +

      '<path d="M ' + px(31.5) + " " + py(108) + " L " + px(147) + " " + py(108) + " L " + px(147) + " " + py(234) + " L " + px(0) + " " + py(234) + " L " + px(0) + " " + py(174) + " L " + px(31.5) + " " + py(174) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(88) + '" y="' + py(174) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + (es ? "Cocina" : "Kitchen") + "</text>" +

      '<path d="M ' + px(147) + " " + py(58) + " L " + px(207) + " " + py(58) + " L " + px(207) + " " + py(88) + " L " + px(352) + " " + py(88) + " L " + px(352) + " " + py(142) + " L " + px(147) + " " + py(142) + ' Z" fill="#f4f5f3" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(252) + '" y="' + py(118) + '" text-anchor="middle" font-size="7.4" font-weight="700" fill="#5d686d">' + (es ? "Pasillo Central" : "Central Hallway") + "</text>" +

      '<rect x="' + px(207) + '" y="' + py(0) + '" width="' + +(72.1 * SC).toFixed(1) + '" height="' + +(88 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(243) + '" y="' + py(45) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#5d686d">' + (es ? "Baño" : "Bathroom") + "</text>" +

      '<rect x="' + px(279.1) + '" y="' + py(5.4) + '" width="' + +(36.3 * SC).toFixed(1) + '" height="' + +(82.6 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(297.2) + '" y="' + py(47) + '" text-anchor="middle" font-size="6.0" font-weight="700" fill="#5d686d">' + (es ? "Lav." : "Laundry") + "</text>" +

      '<path d="M ' + px(315.4) + " " + py(0) + " L " + px(437.5) + " " + py(0) + " L " + px(474) + " " + py(34) + " L " + px(474) + " " + py(96) + " L " + px(437.5) + " " + py(136) + " L " + px(352) + " " + py(136) + " L " + px(352) + " " + py(88) + " L " + px(315.4) + " " + py(88) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(398) + '" y="' + py(56) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + (es ? "Recámara" : "Bedroom") + "</text>" +
      '<rect x="' + px(356) + '" y="' + py(96) + '" width="34" height="16" rx="2" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="2 2"/>' +
      '<text x="' + (px(356) + 17) + '" y="' + (py(96) + 10) + '" text-anchor="middle" font-size="5.2" font-weight="700" fill="#9a5b06">' + (es ? "Clóset temp." : "Temp. closet") + "</text>" +

      '<rect x="' + px(147) + '" y="' + py(142) + '" width="' + +(146.7 * SC).toFixed(1) + '" height="' + +(155.75 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(244) + '" y="' + py(166) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + (es ? "Comedor" : "Dining Room") + "</text>" +

      '<path d="M ' + px(293.7) + " " + py(142) + " L " + px(473.5) + " " + py(142) + " L " + px(508) + " " + py(178) + " L " + px(508) + " " + py(258) + " L " + px(473.5) + " " + py(297.75) + " L " + px(293.7) + " " + py(297.75) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(400) + '" y="' + py(222) + '" text-anchor="middle" font-size="8.2" font-weight="700" fill="#5d686d">' + (es ? "Sala" : "Living Room") + "</text>" +

      '<path id="atticWalkHalo" d="' + m.d + '" fill="none" stroke="' + walkCol + '" stroke-width="' + +(30 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.12"/>' +
      '<path id="atticWalkBand" d="' + m.d + '" fill="none" stroke="#d9a86c" stroke-width="' + +(24 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.55"/>' +
      '<path id="atticWalkCenter" d="' + m.d + '" fill="none" stroke="' + walkCol + '" stroke-width="2.2" stroke-dasharray="5 3"/>' +

      '<g id="atticHatchBox" style="cursor:pointer">' +
        '<rect x="' + px(h.x - h.w / 2) + '" y="' + py(h.y - h.h / 2) + '" width="' + +(h.w * SC).toFixed(1) + '" height="' + +(h.h * SC).toFixed(1) + '" rx="2.5" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2.2"/>' +
        '<text x="' + px(h.x) + '" y="' + (py(h.y) - 2) + '" text-anchor="middle" font-size="6.2" font-weight="800" fill="#1f5f7a">24"×36"</text>' +
        '<text x="' + px(h.x) + '" y="' + (py(h.y) + 6.5) + '" text-anchor="middle" font-size="5.4" font-weight="700" fill="#1f5f7a">' + (es ? "Escotilla" : "Hatch") + "</text>" +
      "</g>" +

      '<g id="atticPlatformDrag" class="u4-drag-move" tabindex="0" role="application" aria-label="' + esc(es ? "Arrastrar plataforma de servicio de 30x30 y huella del calefactor" : "Drag 30x30 wood service platform and furnace footprint") + '" transform="translate(0, 0)">' +
        '<rect x="' + (fx - pS / 2).toFixed(1) + '" y="' + (fy - fH / 2 - pS).toFixed(1) + '" width="' + pS + '" height="' + pS + '" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2.0"/>' +
        '<text x="' + fx + '" y="' + (fy - fH / 2 - pS / 2 - 1).toFixed(1) + '" text-anchor="middle" font-size="6.0" font-weight="800" fill="#2f6b3f" pointer-events="none">' + (es ? "Plataforma" : "Platform") + "</text>" +
        '<text x="' + fx + '" y="' + (fy - fH / 2 - pS / 2 + 6.5).toFixed(1) + '" text-anchor="middle" font-size="5.8" font-weight="800" fill="#2f6b3f" pointer-events="none">30" × 30"</text>' +
        '<rect class="u4-drag-grip" x="' + (fx - fW / 2).toFixed(1) + '" y="' + (fy - fH / 2).toFixed(1) + '" width="' + fW + '" height="' + fH + '" rx="3.5" fill="#334155" stroke="#ffffff" stroke-width="1.5"/>' +
        '<text x="' + fx + '" y="' + (fy - 1) + '" text-anchor="middle" font-size="6.2" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "Calefactor" : "Furnace") + "</text>" +
        '<text x="' + fx + '" y="' + (fy + 7) + '" text-anchor="middle" font-size="5.3" font-weight="700" fill="#cbd5e1" pointer-events="none">33" × 29"</text>' +
      "</g>" +

      '<rect id="atticWalkPill" x="14" y="303" width="472" height="20" rx="5" fill="' + walkFill + '" stroke="' + walkCol + '" stroke-width="1"/>' +
      '<text id="atticWalkPillTxt" x="250" y="316" text-anchor="middle" font-size="7.2" font-weight="700" fill="' + walkCol + '">' +
        (es ? "Pasillo continuo de madera 24\": " + m.walkFt + " pies (máx. 20 pies) · " + m.walkSheets + " hojas para pasillo + 1 hoja para plataforma y dique"
            : "Continuous 24\" wood walkway: " + m.walkFt + " ft (20 ft max) · " + m.walkSheets + " walkway sheets + 1 sheet for 30\"×30\" platform & dam") +
      "</text>" +
    "</svg>";
  }

  function renderFramingSvg(es) {
    var bayVal = state.joistBay === "unknown" ? null : parseFloat(state.joistBay);
    var bayOk = bayVal === 27.5;
    var bayNarrow = bayVal != null && bayVal < 27.5;
    var bayWide = bayVal != null && bayVal > 27.5;
    var isFire = state.ceilingType === "fire_rated";
    var frameStroke = isFire ? "#a8281c" : (bayOk ? "#2f6b3f" : "#9a5b06");
    var frameLabel = isFire
      ? (es ? "PEDIR PUERTA CORTAFUEGO LISTADA (24\" × 36\" LIBRES REALES)" : "ORDER LISTED FIRE-RATED DOOR (FULL 24\" × 36\" CLEAR)")
      : (es ? "Corte en plafón estándar: 27-1/2\" × 39-1/2\" (marco de madera)" : "Standard ceiling rough cut: 27-1/2\" × 39-1/2\" (wood frame)");
    var bayNote = bayVal == null
      ? (es ? "Separación de vigas existentes: verificar antes de cortar" : "Existing ceiling joist spacing: verify before cutting")
      : (es ? 'Espacio libre entre vigas = ' + bayVal + '"' : 'Clear bay between joists = ' + bayVal + '"');

    return '<svg viewBox="0 0 480 268" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Diagrama de marco de escotilla de 24 por 36 pulgadas libres y paso del calefactor" : "Diagram of 24 by 36 inch clear hatch framing and end-first furnace fit") + '">' +
      '<text x="14" y="18" font-size="8.6" font-weight="800" fill="#1f5f7a">' +
        (es ? 'MARCO DE ESCOTILLA · 24" × 36" LIBRES REALES AFUERA DE PUERTA 4' : 'HATCH FRAMING · FULL 24" × 36" CLEAR OPENING OUTSIDE DOOR 4') + "</text>" +
      '<rect x="34" y="34" width="412" height="186" rx="6" fill="#fbfcfb" stroke="#c5ccc9" stroke-width="1.3"/>' +
      '<line x1="34" y1="62" x2="446" y2="62" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<line x1="34" y1="190" x2="446" y2="190" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<text x="42" y="49" font-size="7" font-weight="700" fill="#5d686d">' + (es ? "← Escaleras (Oeste)" : "← Stairs (West)") + "</text>" +
      '<text x="438" y="49" text-anchor="end" font-size="7" font-weight="800" fill="#1f5f7a">' + (es ? "Puerta Principal 4 →" : "Front Door 4 →") + "</text>" +
      '<rect x="114" y="56" width="252" height="140" fill="#f7ecd9" fill-opacity="0.45" stroke="' + frameStroke + '" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="240" y="68" text-anchor="middle" font-size="7.1" font-weight="800" fill="' + frameStroke + '">' + esc(frameLabel) + "</text>" +
      '<rect x="130" y="76" width="220" height="106" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2.3"/>' +
      '<rect x="152" y="95" width="176" height="68" rx="4" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2"/>' +
      '<text x="240" y="117" text-anchor="middle" font-size="8.6" font-weight="800" fill="#2f6b3f">' + (es ? "CALEFACTOR SUBE DE PUNTA ✓" : "FURNACE PASSES END-FIRST ✓") + "</text>" +
      '<text x="240" y="132" text-anchor="middle" font-size="7.8" font-weight="700" fill="#1d2326">' + (es ? 'Perfil 14-3/16" × 29" dentro de 24" × 36"' : '14-3/16" × 29" profile inside 24" × 36"') + "</text>" +
      '<text x="240" y="146" text-anchor="middle" font-size="7.2" font-weight="700" fill="#2f6b3f">' + (es ? '+9-3/4" y +7" de holgura libre' : '+9-3/4" & +7" clear margin to spare') + "</text>" +
      '<text x="240" y="210" text-anchor="middle" font-size="8.0" font-weight="800" fill="#1f5f7a">' + (es ? 'MANTENER 24" × 36" LIBRES · BROCHES POR FUERA DEL CLARO' : 'KEEP FULL 24" × 36" CLEAR · MOUNT LATCHES OUTSIDE OPENING') + "</text>" +
      '<text x="240" y="246" text-anchor="middle" font-size="7.9" font-weight="800" fill="' + (bayNarrow ? "#a8281c" : (bayOk ? "#2f6b3f" : "#9a5b06")) + '">' +
        esc(bayNote + (bayOk ? (es ? " — Calza directo" : " — Direct fit") : bayWide ? (es ? " — Agregar respaldo lateral" : " — Add solid side backing") : bayNarrow ? (es ? " — Armar cabezal doble" : " — Frame double header") : "")) +
      "</text>" +
    "</svg>";
  }

  function renderAirSealSvg(es) {
    return '<svg viewBox="0 0 470 214" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Corte de tapa aislada de triplay de 3/4, empaque de espuma y dique de 4 lados" : "Cross-section of 3/4 plywood insulated lid, foam weatherstrip and 4-sided dam") + '">' +
      '<text x="235" y="17" text-anchor="middle" font-size="8.6" font-weight="800" fill="#1f5f7a">' +
        (es ? "CORTE DE ESCOTILLA: TAPA DE TRIPLAY 3/4\", EMPAQUE Y DIQUE DE 4 LADOS" : "HATCH SECTION: 3/4\" PLYWOOD LID, FOAM GASKET & 4-SIDED DAM") + "</text>" +
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
      var nx = Math.max(162, Math.min(420, Math.round(nxIn)));
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
          ? "Pasillo continuo de madera 24\": " + m.walkFt + " pies (máx. 20 pies) · " + m.walkSheets + " hojas para pasillo + 1 hoja para plataforma y dique"
          : "Continuous 24\" wood walkway: " + m.walkFt + " ft (20 ft max) · " + m.walkSheets + " walkway sheets + 1 sheet for 30\"×30\" platform & dam";
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
        var svgX = ((e.clientX - rect.left) / (rect.width || 500)) * 500;
        var svgY = ((e.clientY - rect.top) / (rect.height || 332)) * 332;
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
        ? "<strong>Plano 1 de 2 — Carpintería y Acceso al Ático:</strong> Escotilla de <code>24\" × 36\"</code> libres afuera de Puerta Principal 4, pasillo continuo de <code>24\"</code> y plataforma de <code>30\" × 30\"</code>. ¿Buscas los ductos y salida lateral? Abre <a href=\"../hvac-layout/index.html\">2. Calefactor, Ductos y Salida →</a>"
        : "<strong>Plan 1 of 2 — Attic Carpentry &amp; Enclosure:</strong> <code>24\" × 36\"</code> clear hatch outside Front Door 4, continuous <code>24\"</code> wood walkway &amp; <code>30\" × 30\"</code> service platform. Need ductwork &amp; exhaust? Switch to <a href=\"../hvac-layout/index.html\">2. Furnace, Ducts &amp; Exhaust →</a>";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Attic Hatch, Wood Walkway & Service Platform";
    var titleEs = "Escotilla del Ático, Pasillo de Madera y Plataforma";
    var subEn = "Drag the 30\" × 30\" service platform to check the 20 ft walkway limit, or tap a tab above for ceiling framing & air-sealing";
    var subEs = "Arrastra la plataforma de 30\" × 30\" para revisar el límite de 20 pies del pasillo, o elige una pestaña arriba para marco y sellado";
    var inner = "";

    if (state.step === "map") {
      var stCls = m.walkPass ? "is-pass" : "is-fail";
      var stTxt = m.walkPass
        ? (es ? "✓ Dentro del límite: Pasillo continuo de 24\" de " + m.walkFt + " pies (máx. 20 pies con 66\" de altura en ático)."
              : "✓ Within 20 ft limit: Continuous 24\" wood walkway measures " + m.walkFt + " ft at 66\" flat-roof attic height.")
        : (es ? "✗ Excede 20 pies (" + m.walkFt + " pies): acerca la plataforma hacia el Comedor Suroeste."
              : "✗ Over 20 ft limit (" + m.walkFt + " ft): move the service platform closer toward Southwest Dining.");

      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Abertura Libre" : "Clear Hatch Opening") + "</div>" +
            '<div class="u4h-kpi-val is-info">24" × 36"</div>' +
            '<div class="u4h-kpi-sub">' + (es ? (state.hatchSpot === "door4" ? "Descanso afuera Puerta 4" : "Pasillo interior (Ref.)") : (state.hatchSpot === "door4" ? "Landing outside Door 4" : "Interior hallway (Ref.)")) + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Largo de Pasillo 24\"" : "24\" Walkway Length") + "</div>" +
            '<div id="atticKpiLen" class="u4h-kpi-val ' + (m.walkPass ? "is-ok" : "is-fail") + '">' + m.walkFt + (es ? " pies / 20" : " ft / 20 ft") + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "30\" libres de altura sobre pasillo" : "30\" clear height above walkway") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Hojas OSB 23/32\" o Triplay 3/4\"" : "23/32\" OSB or 3/4\" Plywood") + "</div>" +
            '<div id="atticKpiSheets" class="u4h-kpi-val is-ok">' + m.totalSheets + (es ? " hojas 4×8 total" : " sheets 4×8 total") + "</div>" +
            '<div class="u4h-kpi-sub">' + m.walkSheets + (es ? " pasillo + 1 plataforma/dique" : " walkway + 1 platform/dam") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderCarpentryMapSvg(m, es) + "</div>" +
        '<div class="u4h-status ' + stCls + '">' + esc(stTxt) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Ubicación de escotilla:" : "Hatch location:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.hatchSpot === "door4" ? " is-active" : "") + '" data-loc="door4">' + (es ? "Afuera de Puerta 4 (Elegida)" : "Outside Front Door 4 (Selected)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.hatchSpot === "hall" ? " is-active" : "") + '" data-loc="hall">' + (es ? "Pasillo interior (Comparación)" : "Interior Hallway (Comparison)") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Posición de plataforma 30\"×30\":" : "30\" × 30\" Platform spot:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.preset === "sw_dining" ? " is-active" : "") + '" data-preset="sw_dining">' + (es ? "Comedor SO · 15.8 pies (Recomendado)" : "Southwest Dining · 15.8 ft (Recommended)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.preset === "nw_dining" ? " is-active" : "") + '" data-preset="nw_dining">' + (es ? "Comedor NO · 10.6 pies" : "Northwest Dining · 10.6 ft") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.preset === "east_living" ? " is-active" : "") + '" data-preset="east_living">' + (es ? "Sala Este · >20 pies (Excede)" : "East Living · >20 ft (Over limit)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>";

    } else if (state.step === "framing") {
      titleEn = "Ceiling Opening & Framing (24\" × 36\" Clear)";
      titleEs = "Abertura en Plafón y Marco (24\" × 36\" Libres)";
      subEn = "Common stair landing outside Front Door 4 — confirm ceiling type and joist spacing before cutting";
      subEs = "Descanso común afuera de Puerta Principal 4 — verificar tipo de plafón y separación de vigas antes de cortar";

      var fCls = state.ceilingType === "fire_rated" || state.joistBay === "14.5" || state.joistBay === "22.5"
        ? "is-warn"
        : (state.joistBay === "27.5" ? "is-pass" : "is-warn");
      var fTxt = state.ceilingType === "fire_rated"
        ? (es ? "Plafón cortafuego: Pedir una puerta cortafuego listada que deje las 24\" × 36\" libres completas (no armar el kit de madera ni usar puertas nominales que reduzcan el claro)."
              : "Fire-rated ceiling: Order a listed fire-rated access door that preserves the full 24\" × 36\" clear opening (do not build the wood kit or use nominal doors that shrink clear passage).")
        : state.joistBay === "14.5" || state.joistBay === "22.5"
          ? (es ? "Espacio entre vigas de " + state.joistBay + "\": requiere cabezal doble estructural para mantener las 24\" × 36\" libres."
                : "A " + state.joistBay + "\" joist bay requires structural header framing so the finished opening stays a full 24\" × 36\" clear.")
          : state.joistBay === "27.5"
            ? (es ? "✓ Espacio de 27-1/2\" entre vigas: el marco de madera calza directo dejando 24\" × 36\" libres."
                  : "✓ 27-1/2\" clear bay between joists: wood frame fits directly with a full 24\" × 36\" clear opening.")
            : (es ? "Fotografiar el trazo afuera de Puerta 4 y medir la separación entre vigas antes de cortar el plafón."
                  : "Photograph the markout outside Front Door 4 and measure existing joist spacing before cutting the ceiling.");

      inner =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;align-items:start;margin-bottom:12px">' +
          '<div class="u4h-photo-card" style="margin:0">' +
            '<img src="./assets/attic-hatch-candidate.jpg" alt="' + esc(es ? "Plafón del descanso afuera de Puerta Principal 4" : "Common landing ceiling outside Front Door 4") + '" style="height:228px;object-fit:cover">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Descanso afuera de Puerta 4:" : "Landing outside Front Door 4:") + "</strong> " +
              (es ? "Proteger la lámpara y moldura original. Conecta directo al pasillo de " + m.walkFt + " pies."
                  : "Protect the existing fixture and trim. Connects straight onto the " + m.walkFt + " ft wood walkway.") +
            "</div>" +
          "</div>" +
          '<div class="u4h-svg-wrap" style="margin:0">' + renderFramingSvg(es) + "</div>" +
        "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Tipo de plafón en descanso:" : "Landing ceiling type:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.ceilingType === "standard" ? " is-active" : "") + '" data-ceil="standard">' + (es ? "Estándar (Marco de madera)" : "Standard (Wood frame kit)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ceilingType === "fire_rated" ? " is-active" : "") + '" data-ceil="fire_rated">' + (es ? "Cortafuego (Puerta listada)" : "Fire-Rated (Listed door)") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Espacio libre entre vigas:" : "Clear bay between joists:") + "</span>" +
            '<div class="u4h-pill-group">' +
              [["unknown", es ? "Por medir" : "Unmeasured"], ["14.5", '14-1/2" (16" OC)'], ["22.5", '22-1/2" (24" OC)'], ["27.5", '27-1/2"'], ["30", '> 27-1/2"']].map(function (opt) {
                return '<button type="button" class="u4h-pill' + (state.joistBay === opt[0] ? " is-active" : "") + '" data-bay="' + opt[0] + '">' + opt[1] + "</button>";
              }).join("") +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-status ' + fCls + '">' + esc(fTxt) + "</div>";

    } else {
      titleEn = "Insulated Lid, Air Seal & Crew Lumber List";
      titleEs = "Tapa Aislada, Sellado de Aire y Lista de Madera";
      subEn = "4-sided insulation dam, foam weatherstripping, walkway decking, and attic service light & outlet";
      subEs = "Dique de 4 lados, empaque de espuma, madera para pasillo y plataforma, luz y contacto en ático";

      inner =
        '<div class="u4h-svg-wrap">' + renderAirSealSvg(es) + "</div>" +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:12px">' +
          '<div class="u4h-info-box" style="margin:0">' +
            '<div class="u4h-info-title">' + (es ? "Sellado y Tapa Aislada" : "Lid & Air-Sealing Checklist") + "</div>" +
            '<ul class="u4h-info-list">' +
              "<li>" + (es ? 'Marco fijo sellado con cordón de respaldo de 3/8" y sellador acrílico/siliconizado.' : 'Caulk fixed outer frame perimeter using 3/8" backer rod.') + "</li>" +
              "<li>" + (es ? 'Empaque continuo de espuma cerrada de 1/2" × 1/8" sobre apoyos limpios de 1×2.' : 'Continuous 1/2" × 1/8" closed-cell foam gasket on clean 1×2 ledger strips.') + "</li>" +
              "<li>" + (es ? "Dejar la junta de la tapa removible SIN sellador (probar abrir y cerrar 2 veces)." : "Leave the removable 3/4\" plywood lid seam UNCAULKED (test-open twice).") + "</li>" +
              "<li>" + (es ? "2 colchonetas de fibra sin papel sujetas a la tapa con 3 lazos sueltos de alambre cal. 16 + dique en 4 lados (+2\")." : "2 unfaced fiberglass batts held to lid back with 3 loose 16-ga wire loops + 4-sided dam (+2\" above fill).") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-info-box" style="margin:0">' +
            '<div class="u4h-info-title">' + (es ? "Madera y Eléctrico en Ático" : "Walkway Lumber & Attic Electrical") + "</div>" +
            '<ul class="u4h-info-list">' +
              "<li>" + m.walkSheets + (es ? ' hojas 4×8 de OSB 23/32" o triplay estructural 3/4" para el pasillo de 24" (' + m.walkFt + ' pies; nunca usar 3/8").' : ' sheets 4×8 of 23/32" OSB or 3/4" structural plywood for the 24" walkway (' + m.walkFt + ' ft; never 3/8").') + "</li>" +
              "<li>" + (es ? '1 hoja 4×8 adicional para la plataforma nivelada de 30" × 30" en el lado Norte y el dique de 4 lados.' : '1 additional 4×8 sheet for the level 30" × 30" North service platform and 4-sided dam.') + "</li>" +
              "<li>" + (es ? "1 lámpara LED cerrada permanente con apagador junto a la escotilla + 1 contacto GFCI 120V a ≤ 25 pies." : "1 permanent switched enclosed LED light near hatch + 1 line-side 120V GFCI receptacle within 25 ft.") + "</li>" +
              "<li>" + (es ? "Mantener abierto el techo del clóset de recámara hasta terminar el cable de termostato y la escotilla." : "Keep bedroom-closet ceiling open until both thermostat cable and permanent hatch are finished.") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>";
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
    host.querySelectorAll("[data-loc]").forEach(function (b) {
      b.addEventListener("click", function () { state.hatchSpot = b.getAttribute("data-loc"); syncUrl(); render(); });
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
      if (act === "hatch_location" || act === "location" || act === "spot") {
        state.hatchSpot = val.indexOf("hall") >= 0 ? "hall" : "door4";
      } else if (act === "ceiling_type" || act === "fire_rating") {
        state.ceilingType = val.indexOf("fire") >= 0 || val === "yes" ? "fire_rated" : "standard";
      } else if (act === "joist_bay") {
        state.joistBay = String(args.value || "unknown");
      } else if (act === "reset") {
        state.hatchSpot = "door4";
        state.furnacePos = { x: 174, y: 258 };
        state.preset = "sw_dining";
        state.ceilingType = "standard";
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
        hatchSpot: state.hatchSpot,
        ceilingType: state.ceilingType,
        joistBay: state.joistBay,
        walkFt: m.walkFt,
        totalSheets: m.totalSheets,
        summary: "Plan 1 Attic Hatch & Walkway: view=" + state.step + ", spot=" + state.hatchSpot + " (24x36 clear), walkway=" + m.walkFt + "ft (" + m.totalSheets + " sheets total)."
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
          return "Plan1=attic-hatch, View=" + state.step + ", Hatch=" + state.hatchSpot + " (24x36in clear), Walkway=" + m.walkFt + "ft (" + m.walkSheets + " walkway sheets + 1 platform/dam sheet), Ceiling=" + state.ceilingType + ", JoistBay=" + state.joistBay + ".";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Cómo sellamos la tapa de 24×36 sin pegar la junta?", "¿Cuántas hojas de OSB/triplay lleva el pasillo y plataforma?", "¿Qué pasa si el plafón del descanso requiere puerta cortafuego?"]
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
