/* ============================================================================
   Permanent Attic Hatch — Real-World Human-First Interactive Guide (R3)
   Reconciled 1:1 with Attic Furnace & Ducts Plan (Pin u4-auto-1795396710261)
   True-Scale Unit 4 Floor Plan (N ↑ / S ↓ / ← W / E →) · 2D Draggable F1 Platform
   Flat-Roof 66" Cavity (<= 20 ft 24" Walkway Cap · CMC 304.4) · Cross-Plan Sync
   Zero External CDNs · Zero Prices · Zero Backend Clutter · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "spot", en: "1. Spot & Framing", es: "1. Ubicación y Corte" },
    { id: "walkway", en: "2. 24\" Pathway & F1 Spot", es: "2. Pasillo 24\" y F1" },
    { id: "seal", en: "3. Lid & Flat Roof", es: "3. Tapa y Techo Plano" },
    { id: "gates", en: "4. Hold Checklist", es: "4. Lista de Candados" }
  ];

  // Shared Uniform True-Scale Unit 4 Coordinate System (identical to hvac-human-guide.js!)
  // N = UP (y=0), S = DOWN (y=298"), W = LEFT (x=0), E = RIGHT (x=508")
  // SVG viewBox 0 0 500 342 -> SC = 0.86 px/in (scaleX === scaleY)
  var SC = 0.86;
  var OX = 24;
  var OY = 38;
  function px(xIn) { return +(OX + xIn * SC).toFixed(1); }
  function py(yIn) { return +(OY + yIn * SC).toFixed(1); }

  var HATCH_DOOR4_IN = { x: 112, y: 74, w: 24, h: 36 };
  var HATCH_HALL_IN  = { x: 204, y: 108, w: 36, h: 24 };

  // Reconciled SW Dining Baseline per Tisa Pin u4-auto-1795396710261 (walkway:0 @ 35.3%, 77.9%)
  var RECONCILED_F1_DEFAULT = { x: 174, y: 258 };

  var bootUrlParams = new URLSearchParams(window.location.search || "");
  var initFx = Number(bootUrlParams.get("fx"));
  var initFy = Number(bootUrlParams.get("fy"));
  var initLoc = (bootUrlParams.get("loc") || "").toLowerCase() === "hall" ? "hall" : "door4";
  var initVent = bootUrlParams.get("vent") || "power_venter";
  var initEwall = bootUrlParams.get("ewall") || "south";

  var state = {
    step: "spot",
    location: initLoc,        // "door4" (Exterior Door 4 Landing) | "hall" (Interior Hallway reference)
    f1: {
      x: isFinite(initFx) && initFx >= 156 && initFx <= 430 ? Math.round(initFx) : RECONCILED_F1_DEFAULT.x,
      y: isFinite(initFy) && initFy >= 108 && initFy <= 274 ? Math.round(initFy) : RECONCILED_F1_DEFAULT.y
    },
    ventMode: initVent,
    exitWall: initEwall,
    fireRating: "unknown",    // "unknown" | "no" | "yes"
    joistBay: "unknown",      // "unknown" | "14.5" | "22.5" | "27.5" | "30"
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

  // Wall-respecting orthogonal 24" continuous walkway route (identical math to hvac-human-guide.js!)
  function computeWalkwayRoute(location, f1) {
    var hatch = location === "hall" ? HATCH_HALL_IN : HATCH_DOOR4_IN;
    var platCenterY = f1.y - 29.5; // 30"x30" service platform on NORTH face of F1
    var hallSpineY = 108;
    var platEdgeY = platCenterY <= hallSpineY ? Math.min(f1.y - 14.5, platCenterY + 15) : platCenterY - 15;
    var pts;

    if (location === "hall") {
      var hEast = hatch.x + hatch.w / 2; // 222"
      if (Math.abs(f1.x - hatch.x) <= 18) {
        pts = [
          { x: hatch.x, y: hatch.y + hatch.h / 2 },
          { x: f1.x,    y: hatch.y + hatch.h / 2 },
          { x: f1.x,    y: platEdgeY }
        ];
      } else {
        var turnX = f1.x >= hEast ? f1.x : Math.max(166, f1.x);
        var startX = f1.x >= hatch.x ? hEast : (hatch.x - hatch.w / 2);
        pts = [
          { x: startX, y: hallSpineY },
          { x: turnX,  y: hallSpineY },
          { x: turnX,  y: platEdgeY }
        ];
      }
    } else {
      // Outside Front Door 4 Hatch (East edge = 124", Y = 74") -> East across Door 4 threshold (X=147") into Hall foyer
      var hatchEastX = hatch.x + hatch.w / 2; // 124"
      var hatchMidY = hatch.y;                // 74"
      // When F1 sits in West Hall / SW Dining (X = 162..192", e.g. reconciled X=174"), run East to F1.x then straight South (1 single 90° turn!)
      if (f1.x >= 162 && f1.x <= 192 && platEdgeY >= hatchMidY) {
        pts = [
          { x: hatchEastX, y: hatchMidY },
          { x: f1.x,       y: hatchMidY },
          { x: f1.x,       y: platEdgeY }
        ];
      } else {
        var entryX = 170;
        pts = [
          { x: hatchEastX, y: hatchMidY },
          { x: entryX,     y: hatchMidY },
          { x: entryX,     y: hallSpineY },
          { x: f1.x,       y: hallSpineY },
          { x: f1.x,       y: platEdgeY }
        ];
      }
    }

    var walkIn = 0;
    for (var i = 1; i < pts.length; i++) {
      walkIn += Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
    }
    var walkFt = +(walkIn / 12).toFixed(1);
    var dStr = pts.map(function (pt, idx) {
      return (idx === 0 ? "M " : " L ") + px(pt.x) + " " + py(pt.y);
    }).join("");

    return {
      hatch: hatch,
      pts: pts,
      dStr: dStr,
      walkIn: walkIn,
      walkFt: walkFt,
      pass: walkFt <= 20.0,
      sheets: calcSheets(walkFt),
      platCenter: { x: f1.x, y: platCenterY }
    };
  }

  function syncedHvacHref() {
    var base = window.U4PlanNav ? window.U4PlanNav.planUrl("hvac-layout") : "../hvac-layout/index.html";
    var sep = base.indexOf("?") >= 0 ? "&" : "?";
    return base + sep + "fx=" + Math.round(state.f1.x) + "&fy=" + Math.round(state.f1.y) +
      "&loc=" + encodeURIComponent(state.location) +
      "&vent=" + encodeURIComponent(state.ventMode) +
      "&ewall=" + encodeURIComponent(state.exitWall);
  }

  function broadcastCrossPlanSync() {
    try {
      var next = new URLSearchParams(window.location.search || "");
      next.set("fx", String(Math.round(state.f1.x)));
      next.set("fy", String(Math.round(state.f1.y)));
      next.set("loc", state.location);
      window.history.replaceState(null, "", "?" + next.toString() + (window.location.hash || ""));
    } catch (_) {}
    if (window.U4PlanNav && typeof window.U4PlanNav.postToParent === "function") {
      window.U4PlanNav.postToParent({
        type: "u4:attic-hvac-sync",
        sourcePlan: "attic-hatch",
        f1: { x: Math.round(state.f1.x), y: Math.round(state.f1.y) },
        location: state.location,
        ventMode: state.ventMode,
        exitWall: state.exitWall
      });
    }
  }

  function syncBlueprintWalkway(ft) {
    try {
      var hiddenRng = document.getElementById("rng-walkway-l");
      if (hiddenRng) {
        hiddenRng.value = String(ft);
        hiddenRng.dispatchEvent(new Event("input", { bubbles: true }));
      }
      var hiddenLoc = document.getElementById("sel-location");
      if (hiddenLoc) {
        hiddenLoc.value = state.location === "hall" ? "INTERIOR_HALL" : "DOOR4_LANDING";
      }
    } catch (_) {}
    broadcastCrossPlanSync();
  }

  function renderHatchFramingSvg(es) {
    var bayVal = state.joistBay === "unknown" ? null : parseFloat(state.joistBay);
    var bayLabel = bayVal == null
      ? (es ? "Claro entre vigas (B): MEDIR" : "Joist bay (B): MEASURE ON SITE")
      : (es ? "Claro B = " + bayVal + '"' : "Joist bay B = " + bayVal + '"');
    var bayOk = bayVal === 27.5;
    var bayWide = bayVal != null && bayVal > 27.5;
    var bayNarrow = bayVal != null && bayVal < 27.5;
    var isDoor4 = state.location === "door4";

    var frameStroke = state.fireRating === "yes" ? "#a8281c" : (bayOk ? "#2f6b3f" : "#9a5b06");
    var frameLabel = state.fireRating === "yes"
      ? (es ? "REQUIERE TAPA CORTAFUEGO CERTIFICADA" : "LISTED FIRE-RATED HATCH REQUIRED")
      : (es ? 'Corte madera propuesto: 27-1/2" × 39-1/2"' : 'Proposed wood-kit cut: 27-1/2" × 39-1/2"');

    var northLandmark = isDoor4
      ? (es ? "↑ NORTE · Ventana esmerilada descanso" : "↑ NORTH · Frosted Landing Window")
      : (es ? "↑ NORTE · Muro Baño / Lavandería" : "↑ NORTH · Bathroom / Laundry Wall");
    var southLandmark = isDoor4
      ? (es ? '↓ SUR · Muro Norte Cocina (115-1/2")' : '↓ SOUTH · Kitchen North Wall (115-1/2")')
      : (es ? "↓ SUR · Muro Comedor" : "↓ SOUTH · Dining Room Wall");
    var eastLandmark = isDoor4
      ? (es ? "Puerta 4 → (abre al Este al Pasillo)" : "Door 4 → (swings East into Hall)")
      : (es ? "Recámara →" : "Bedroom →");
    var westLandmark = isDoor4
      ? (es ? "← OESTE · Escaleras" : "← WEST · Stairs")
      : (es ? "← OESTE · Puerta 4" : "← WEST · Door 4");

    return '<svg viewBox="0 0 480 282" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Plano de escotilla 24x36 alineado al Norte y paso de calefacción" : "North-aligned 24x36 attic hatch framing and furnace passage diagram") + '">' +
      '<text x="14" y="18" font-size="9" font-weight="800" fill="#1f5f7a">' +
        (es ? 'ESCOTILLA 24" × 36" LIBRE · ' + (isDoor4 ? "DESCANSO PUERTA 4 (EXT.)" : "PASILLO INTERIOR")
            : 'PERMANENT HATCH 24" × 36" CLEAR · ' + (isDoor4 ? "DOOR 4 LANDING (EXT.)" : "INTERIOR HALLWAY")) + "</text>" +
      '<g transform="translate(454,24)">' +
        '<circle r="14" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-10 -3,-3.5 3,-3.5" fill="#a8281c"/>' +
        '<text x="0" y="-11" text-anchor="middle" font-size="6.2" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="11.8" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">S</text>' +
        '<text x="9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">E</text>' +
        '<text x="-9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">' + (es ? "O" : "W") + "</text>" +
      "</g>" +
      '<rect x="112" y="26" width="236" height="15" rx="3" fill="#e3eef2" stroke="#1f5f7a" stroke-width="0.8"/>' +
      '<text x="230" y="36.5" text-anchor="middle" font-size="7.4" font-weight="800" fill="#1f5f7a">' + esc(northLandmark) + "</text>" +
      '<rect x="34" y="48" width="392" height="176" rx="6" fill="#fbfcfb" stroke="#c5ccc9" stroke-width="1.3"/>' +
      '<line x1="34" y1="74" x2="426" y2="74" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<line x1="34" y1="196" x2="426" y2="196" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<text x="40" y="60" font-size="7" font-weight="700" fill="#5d686d">' + esc(westLandmark) + "</text>" +
      '<text x="420" y="60" text-anchor="end" font-size="7" font-weight="800" fill="#1f5f7a">' + esc(eastLandmark) + "</text>" +
      '<rect x="108" y="68" width="244" height="136" fill="#f7ecd9" fill-opacity="0.45" stroke="' + frameStroke + '" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="230" y="79" text-anchor="middle" font-size="7.5" font-weight="800" fill="' + frameStroke + '">' + esc(frameLabel) + "</text>" +
      '<rect x="122" y="86" width="216" height="106" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2.4"/>' +
      '<rect x="143" y="105" width="174" height="68" rx="4" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2"/>' +
      '<text x="230" y="128" text-anchor="middle" font-size="9" font-weight="800" fill="#2f6b3f">' + (es ? "CALEFACCIÓN ENTRA DE PUNTA: PASA ✓" : "FURNACE END-FIRST: PASS ✓") + "</text>" +
      '<text x="230" y="142" text-anchor="middle" font-size="8" font-weight="700" fill="#1d2326">14-3/16" × 29" (Carrier / Bryant 45k)</text>' +
      '<text x="230" y="155" text-anchor="middle" font-size="7.4" font-weight="700" fill="#2f6b3f">' + (es ? '+9-3/4" de ancho y +7" de largo libres' : '+9-3/4" width & +7" length to spare') + "</text>" +
      '<rect x="130" y="202" width="200" height="16" rx="4" fill="#ffffff" fill-opacity="0.96"/>' +
      '<text x="230" y="213" text-anchor="middle" font-size="8.2" font-weight="800" fill="#1f5f7a">' + (es ? '36" LIBRE TERMINADO · EJE N–S EN DESCANSO' : '36" FINISHED CLEAR · N–S LANDING AXIS') + "</text>" +
      '<text x="358" y="138" font-size="8.6" font-weight="800" fill="#1f5f7a">24"</text>' +
      '<text x="358" y="149" font-size="7.2" fill="#5d686d">' + (es ? "libre" : "clear") + "</text>" +
      '<line x1="88" y1="74" x2="88" y2="196" stroke="' + (bayNarrow ? "#a8281c" : "#9a5b06") + '" stroke-width="1.8"/>' +
      '<line x1="82" y1="74" x2="94" y2="74" stroke="' + (bayNarrow ? "#a8281c" : "#9a5b06") + '" stroke-width="1.8"/>' +
      '<line x1="82" y1="196" x2="94" y2="196" stroke="' + (bayNarrow ? "#a8281c" : "#9a5b06") + '" stroke-width="1.8"/>' +
      '<rect x="112" y="230" width="236" height="15" rx="3" fill="#f4f5f3" stroke="#c5ccc9" stroke-width="0.8"/>' +
      '<text x="230" y="240.5" text-anchor="middle" font-size="7.4" font-weight="700" fill="#5d686d">' + esc(southLandmark) + "</text>" +
      '<text x="230" y="266" text-anchor="middle" font-size="8.4" font-weight="800" fill="' + (bayNarrow ? "#a8281c" : (bayOk ? "#2f6b3f" : "#9a5b06")) + '">' +
        esc(bayLabel + (bayOk ? (es ? " — ¡Calza exacto!" : " — Exact fit!") : bayWide ? (es ? " — Agregar respaldo lateral sólido" : " — Needs solid side backing") : bayNarrow ? (es ? " — Requiere cabezal estructural o mover punto" : " — Needs structural header or alternate spot") : "")) +
      "</text>" +
    "</svg>";
  }

  // Step 2 SVG: True-Scale Unit 4 Map Reconciled 1:1 with HVAC Plan (2D Draggable F1 + 30"x30" Platform!)
  function renderWalkwaySvg(es) {
    var route = computeWalkwayRoute(state.location, state.f1);
    var ft = route.walkFt;
    var pass = route.pass;
    var sheets = route.sheets;
    var col = pass ? "#2f6b3f" : "#a8281c";
    var fillBg = pass ? "#e4f0e6" : "#f9e6e4";
    var isDoor4 = state.location === "door4";
    var h = route.hatch;
    var f1x = px(state.f1.x), f1y = py(state.f1.y);
    var fW = +(33.25 * SC).toFixed(1);
    var fH = +(29 * SC).toFixed(1);
    var pS = +(30 * SC).toFixed(1);
    var flueEnd = state.exitWall === "west"
      ? { x: px(147), y: f1y }
      : { x: f1x, y: py(297.75) };

    return '<svg id="attWalkSvg" viewBox="0 0 500 342" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Pasillo continuo de 24 pulgadas reconciliado con plataforma F1 en Comedor SO" : "Reconciled 24-inch continuous walkway and SW Dining F1 platform") + '" style="touch-action:none">' +
      '<text x="14" y="17" font-size="8.5" font-weight="800" fill="#1f5f7a">' +
        (es ? 'PASILLO 24" RECONCILIADO CON HVAC (CMC 304.4 · ESCALA REAL) · ← OESTE | NORTE ↑ | ESTE →'
            : 'RECONCILED 24" PATHWAY & F1 PLATFORM (CMC 304.4 · TRUE SCALE) · ← WEST | NORTH ↑ | EAST →') + "</text>" +
      '<g transform="translate(476,22)">' +
        '<circle r="15" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-11 -3.2,-4 3.2,-4" fill="#a8281c"/>' +
        '<text x="0" y="-12.2" text-anchor="middle" font-size="6.4" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="12.5" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">S</text>' +
        '<text x="10.5" y="2.2" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">E</text>' +
        '<text x="-10.5" y="2.2" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">' + (es ? "O" : "W") + "</text>" +
      "</g>" +

      // Exterior Door 4 Common Landing (West of X=147")
      '<rect x="' + px(72) + '" y="' + py(38) + '" width="' + +(75 * SC).toFixed(1) + '" height="' + +(70 * SC).toFixed(1) + '" fill="#f7ecd9" fill-opacity="0.48" stroke="#9a5b06" stroke-width="1.3" stroke-dasharray="4 3"/>' +
      '<line x1="' + px(78) + '" y1="' + py(44) + '" x2="' + px(78) + '" y2="' + py(102) + '" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<line x1="' + px(84) + '" y1="' + py(44) + '" x2="' + px(84) + '" y2="' + py(102) + '" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<line x1="' + px(90) + '" y1="' + py(44) + '" x2="' + px(90) + '" y2="' + py(102) + '" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<text x="' + px(112) + '" y="' + py(48) + '" text-anchor="middle" font-size="5.3" font-weight="800" fill="#9a5b06">' + (es ? "AFUERA PTA 4" : "OUTSIDE DOOR 4") + "</text>" +

      // Kitchen (SW) + Dedicated 6" Range Hood Chase exclusion note
      '<path d="M ' + px(31.5) + " " + py(108) + " L " + px(147) + " " + py(108) + " L " + px(147) + " " + py(234) + " L " + px(0) + " " + py(234) + " L " + px(0) + " " + py(174) + " L " + px(31.5) + " " + py(174) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.4"/>' +
      '<text x="' + px(82) + '" y="' + py(166) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Cocina" : "Kitchen") + "</text>" +
      '<text x="' + px(82) + '" y="' + py(178) + '" text-anchor="middle" font-size="6.1" fill="#9a5b06">' + (es ? "(Campana 6\" aparte)" : "(6\" Hood separate)") + "</text>" +

      // Hallway + Door 4 Foyer
      '<path d="M ' + px(147) + " " + py(58) + " L " + px(207) + " " + py(58) + " L " + px(207) + " " + py(88) + " L " + px(352) + " " + py(88) + " L " + px(352) + " " + py(142) + " L " + px(147) + " " + py(142) + ' Z" fill="#f4f5f3" stroke="#5d686d" stroke-width="1.4"/>' +
      '<line x1="' + px(147) + '" y1="' + py(68) + '" x2="' + px(147) + '" y2="' + py(100) + '" stroke="#f4f5f3" stroke-width="3.2"/>' +
      '<line x1="' + px(147) + '" y1="' + py(68) + '" x2="' + px(177) + '" y2="' + py(68) + '" stroke="#1f5f7a" stroke-width="2.1"/>' +
      '<path d="M ' + px(177) + " " + py(68) + " A " + +(30 * SC).toFixed(1) + " " + +(30 * SC).toFixed(1) + " 0 0 1 " + px(147) + " " + py(98) + '" fill="none" stroke="#1f5f7a" stroke-width="1.2" stroke-dasharray="3 2"/>' +
      '<text x="' + px(164) + '" y="' + py(85) + '" font-size="6.1" font-weight="800" fill="#1f5f7a">' + (es ? "Pta 4→" : "Door 4→") + "</text>" +
      '<text x="' + px(266) + '" y="' + py(136) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#5d686d">' + (es ? "Pasillo" : "Hallway") + "</text>" +

      // Bath + Laundry + Bedroom
      '<rect x="' + px(207) + '" y="' + py(0) + '" width="' + +(72.1 * SC).toFixed(1) + '" height="' + +(88 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.3"/>' +
      '<text x="' + px(243) + '" y="' + py(44) + '" text-anchor="middle" font-size="7.4" font-weight="700" fill="#5d686d">' + (es ? "Baño" : "Bath") + "</text>" +
      '<rect x="' + px(279.1) + '" y="' + py(5.4) + '" width="' + +(36.3 * SC).toFixed(1) + '" height="' + +(82.6 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.3"/>' +
      '<text x="' + px(297.2) + '" y="' + py(46) + '" text-anchor="middle" font-size="6.2" font-weight="700" fill="#5d686d">' + (es ? "Lav." : "Ldry") + "</text>" +
      '<path d="M ' + px(315.4) + " " + py(0) + " L " + px(437.5) + " " + py(0) + " L " + px(474) + " " + py(34) + " L " + px(474) + " " + py(96) + " L " + px(437.5) + " " + py(136) + " L " + px(352) + " " + py(136) + " L " + px(352) + " " + py(88) + " L " + px(315.4) + " " + py(88) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.3"/>' +
      '<text x="' + px(396) + '" y="' + py(56) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Recámara" : "Bedroom") + "</text>" +

      // Dining Room & Living Room South
      '<rect x="' + px(147) + '" y="' + py(142) + '" width="' + +(146.7 * SC).toFixed(1) + '" height="' + +(155.75 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.4"/>' +
      '<text x="' + px(238) + '" y="' + py(166) + '" text-anchor="middle" font-size="7.8" font-weight="700" fill="#5d686d">' + (es ? "Comedor" : "Dining") + "</text>" +
      '<path d="M ' + px(293.7) + " " + py(142) + " L " + px(473.5) + " " + py(142) + " L " + px(508) + " " + py(178) + " L " + px(508) + " " + py(258) + " L " + px(473.5) + " " + py(297.75) + " L " + px(293.7) + " " + py(297.75) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.4"/>' +
      '<text x="' + px(398) + '" y="' + py(222) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Sala" : "Living Room") + "</text>" +

      // E1/P Subpanel Bay landmark on Kitchen/Dining wall (X=147, Y=206)
      '<rect x="' + (px(147) + 2) + '" y="' + (py(206) - 6) + '" width="22" height="12" rx="2" fill="#ecedea" stroke="#5d686d" stroke-width="0.9"/>' +
      '<text x="' + (px(147) + 13) + '" y="' + (py(206) + 2.5) + '" text-anchor="middle" font-size="5.6" font-weight="700" fill="#5d686d">E1/P</text>' +

      // 30" Unobstructed Passage Halo + 24" Continuous Solid Wood Walkway (CMC 304.4.2)
      '<path id="attWalkHalo" d="' + route.dStr + '" fill="none" stroke="' + col + '" stroke-width="' + +(30 * SC).toFixed(1) + '" stroke-linejoin="round" stroke-linecap="butt" opacity="0.14"/>' +
      '<path id="attWalkPathBg" d="' + route.dStr + '" fill="none" stroke="' + col + '" stroke-width="' + +(24 * SC).toFixed(1) + '" stroke-linejoin="round" stroke-linecap="butt" opacity="0.30"/>' +
      '<path id="attWalkPathLn" d="' + route.dStr + '" fill="none" stroke="' + col + '" stroke-width="2.2" stroke-dasharray="5 3" stroke-linejoin="round"/>' +

      // Sidewall Exhaust Vector Cue (Flat Roof -> Exit Out Sidewall)
      '<line id="attFlueVec" x1="' + f1x + '" y1="' + f1y + '" x2="' + flueEnd.x + '" y2="' + flueEnd.y + '" stroke="#9a5b06" stroke-width="2" stroke-dasharray="3 2"/>' +
      '<circle id="attFlueDot" cx="' + flueEnd.x + '" cy="' + flueEnd.y + '" r="4.8" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1.4"/>' +

      // Locked 24"x36" Attic Hatch
      '<g id="attHatchBox" transform="translate(' + px(h.x) + ', ' + py(h.y) + ')">' +
        '<rect x="' + +(-h.w * SC / 2).toFixed(1) + '" y="' + +(-h.h * SC / 2).toFixed(1) + '" width="' + +(h.w * SC).toFixed(1) + '" height="' + +(h.h * SC).toFixed(1) + '" rx="2.5" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2"/>' +
        '<text x="0" y="-2" text-anchor="middle" font-size="6.1" font-weight="800" fill="#1f5f7a">24"×36"</text>' +
        '<text x="0" y="6.5" text-anchor="middle" font-size="5.3" font-weight="700" fill="#1f5f7a">' + (es ? "Escotilla" : "Hatch") + "</text>" +
      "</g>" +

      // 2D DRAGGABLE 30"x30" NORTH PLATFORM + F1 FURNACE (Reconciled SW Dining X=174", Y=258")
      '<g id="attPlatformDragHandle" class="u4-drag-move" tabindex="0" role="application" aria-label="' + esc(es ? "Arrastrar plataforma 30x30 y calefacción F1 en el ático" : "Drag 30x30 service platform and F1 furnace in 2D") + '" transform="translate(' + f1x + ', ' + f1y + ')">' +
        '<rect x="-26" y="-44" width="52" height="64" fill="transparent"/>' +
        // North 30"x30" Service Platform
        '<rect x="' + (-pS / 2).toFixed(1) + '" y="' + (-fH / 2 - pS).toFixed(1) + '" width="' + pS + '" height="' + pS + '" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.8"/>' +
        '<text x="0" y="' + (-fH / 2 - pS / 2 - 1).toFixed(1) + '" text-anchor="middle" font-size="6.0" font-weight="800" fill="#2f6b3f" pointer-events="none">30"×30"</text>' +
        '<text x="0" y="' + (-fH / 2 - pS / 2 + 6.5).toFixed(1) + '" text-anchor="middle" font-size="5.4" font-weight="700" fill="#2f6b3f" pointer-events="none">' + (es ? "Plat. N" : "N Plat.") + '</text>' +
        // Horizontal F1 Furnace Cabinet
        '<rect class="u4-drag-grip" x="' + (-fW / 2).toFixed(1) + '" y="' + (-fH / 2).toFixed(1) + '" width="' + fW + '" height="' + fH + '" rx="3.5" fill="#1d2326" stroke="#7cc0dc" stroke-width="1.8"/>' +
        '<text x="0" y="-2" text-anchor="middle" font-size="6.3" font-weight="800" fill="#ffffff" pointer-events="none">F1 · 45k</text>' +
        '<text x="0" y="6.8" text-anchor="middle" font-size="5.4" font-weight="700" fill="#7cc0dc" pointer-events="none">' + (es ? "✥ MOVER" : "✥ DRAG 2D") + "</text>" +
      "</g>" +

      // Bottom live compliance & sheet bar
      '<rect id="attWalkPill" x="14" y="302" width="472" height="20" rx="5" fill="' + fillBg + '" stroke="' + col + '" stroke-width="1"/>' +
      '<text id="attWalkPillTxt" x="250" y="315" text-anchor="middle" font-size="7.3" font-weight="700" fill="' + col + '">' +
        (es ? (isDoor4 ? "Desde Puerta 4 (Ext.): " : "Desde Pasillo Int.: ") + ft + "' / 20' máx (" + (pass ? "PASA ✓" : "EXCEDE ✗") + ") · " + sheets + ' hojas 4×8 OSB 23/32" · F1 (X=' + state.f1.x + '", Y=' + state.f1.y + '")'
            : (isDoor4 ? "From Outside Door 4: " : "From Interior Hall: ") + ft + "' / 20' max (" + (pass ? "PASS ✓" : "OVER ✗") + ") · " + sheets + ' shts 4×8 23/32" OSB · F1 (X=' + state.f1.x + '", Y=' + state.f1.y + '")') +
      "</text>" +
      '<text x="250" y="334" text-anchor="middle" font-size="6.3" font-weight="600" fill="#5d686d">' +
        (es ? 'Reconciliado con Plano HVAC (Comedor SO) · Paso libre 30" · Techo plano 66" (salida lateral V1, cero cortes en techo)'
            : 'Reconciled w/ HVAC Plan (SW Dining) · 30" clear passage · 66" flat-roof cavity (sidewall V1 exit, zero roof cuts)') +
      "</text>" +
    "</svg>";
  }

  // Step 3 SVG: Flat-Roof Attic Enclosure, Insulation Dam & Airtight Lid Section
  function renderAirSealSvg(es) {
    return '<svg viewBox="0 0 460 236" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="16" text-anchor="middle" font-size="9.2" font-weight="800" fill="#1f5f7a">' +
        (es ? 'TECHO PLANO (66" LIBRE) + CORTE DE TAPA HERMÉTICA Y DIQUE' : 'FLAT ROOF (66" CAVITY) + AIRTIGHT LID, INSULATION & DAM') + "</text>" +
      // Flat Roof Deck & Membrane at Top (Zero Gable Triangle!)
      '<rect x="20" y="24" width="420" height="10" fill="#5d686d" stroke="#1d2326" stroke-width="1.4"/>' +
      '<text x="230" y="31.5" text-anchor="middle" font-size="6.8" font-weight="800" fill="#ffffff">' +
        (es ? "TECHO PLANO UNIDAD 4 · REPARAR GOTERA ACTIVA ANTES DE AISLAR / CERRAR" : "UNIT 4 FLAT ROOF · REPAIR ACTIVE LEAK BEFORE INSULATING / ENCLOSING") + "</text>" +
      '<line x1="42" y1="34" x2="42" y2="168" stroke="#1f5f7a" stroke-width="1.3" stroke-dasharray="3 2"/>' +
      '<text x="48" y="52" font-size="7.4" font-weight="800" fill="#1f5f7a">' + (es ? '66" altura libre (<6\')' : '66" clear height (<6\')') + "</text>" +

      '<rect x="24" y="102" width="90" height="60" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<rect x="346" y="102" width="90" height="60" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="69" y="135" text-anchor="middle" font-size="7.5" font-weight="700" fill="#9a5b06">' + (es ? "Aislante suelto" : "Loose insulation") + "</text>" +
      '<rect x="114" y="70" width="10" height="104" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<rect x="336" y="70" width="10" height="104" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<text x="352" y="82" font-size="7.6" font-weight="800" fill="#7c4d12">' + (es ? 'Dique 4 lados (+2" alto)' : '4-sided dam (+2" above fill)') + "</text>" +
      '<rect x="134" y="92" width="192" height="44" rx="4" fill="#fce7f3" stroke="#be185d" stroke-width="1.4"/>' +
      '<text x="230" y="118" text-anchor="middle" font-size="8.2" font-weight="800" fill="#9d174d">' + (es ? "2 colchonetas R sin papel + 3 lazos de alambre cal. 16" : "2 unfaced R-batts + 3 loose 16-ga wire loops") + "</text>" +
      '<rect x="130" y="140" width="200" height="16" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.8"/>' +
      '<text x="230" y="151" text-anchor="middle" font-size="7.8" font-weight="800" fill="#1f5f7a">' + (es ? 'Tapa triplay 3/4" (junta SIN sellador — probar abrir 2×)' : '3/4" ply lid (DO NOT caulk lid seam — test open 2×)') + "</text>" +
      '<rect x="124" y="156" width="22" height="10" fill="#2f6b3f"/>' +
      '<rect x="314" y="156" width="22" height="10" fill="#2f6b3f"/>' +
      '<text x="230" y="186" text-anchor="middle" font-size="8" font-weight="800" fill="#2f6b3f">' + (es ? 'Empaque continuo 1/2"×1/8" sobre apoyos 1×2 limpios (sin pintura)' : 'Continuous 1/2"×1/8" foam weatherstrip on clean 1×2 ledges') + "</text>" +
      '<line x1="24" y1="172" x2="124" y2="172" stroke="#1d2326" stroke-width="2.4"/>' +
      '<line x1="336" y1="172" x2="436" y2="172" stroke="#1d2326" stroke-width="2.4"/>' +
      '<text x="230" y="214" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' +
        (es ? 'Marco fijo sellado con cordón 3/8" + sellador pintable · Broches fuera del claro 24"×36"'
            : 'Fixed frame sealed w/ 3/8" backer rod + caulk · Latches mounted OUTSIDE 24"×36" clear') +
      "</text>" +
    "</svg>";
  }

  function renderEquip(es) {
    var route = computeWalkwayRoute(state.location, state.f1);
    var sheets = route.sheets;
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="attEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "🔧 Equipo y suministros " : "🔧 Equipment & Supplies ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="attEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Pasillo 24\" y plataforma (obra de John)" : "24\" Walkway & Platform (John's Scope)") + "</h4>" +
            "<ul>" +
              "<li>" + sheets + (es ? ' hojas 4×8 de OSB 23/32" o triplay 3/4" (pasillo ' + route.walkFt + " pies; 1 tira 24\"/hoja)" : ' sheets 4×8 of 23/32" OSB or 3/4" ply (' + route.walkFt + " ft run; 1 true 24\" strip/sheet)") + "</li>" +
              "<li>" + (es ? '1 hoja 4×8 adicional para plataforma nivelada 30"×30" + dique (SIN gomas — las trae NEXT)' : '1 extra 4×8 sheet for level 30"×30" North platform + dam (NO vibration pads — NEXT provides)') + "</li>" +
              "<li>" + (es ? "Luz LED cerrada con apagador al acceso + contacto GFCI 120V en lado línea (≤25 pies)" : "Entrance-switched enclosed LED utility light + line-side 120V GFCI (≤25 ft)") + "</li>" +
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

  function locationToggleRowHtml(es) {
    return '<div class="u4h-ctrl-row">' +
      '<span class="u4h-ctrl-lbl">' + (es ? "Ubicación de la escotilla:" : "Hatch location:") + "</span>" +
      '<div class="u4h-pill-group">' +
        '<button type="button" id="attLocDoor4Btn" class="u4h-pill' + (state.location === "door4" ? " is-active" : "") + '" data-loc="door4">' + (es ? "Afuera de Puerta Principal 4 (Descanso)" : "Outside Front Door 4 (Landing)") + "</button>" +
        '<button type="button" id="attLocHallBtn" class="u4h-pill' + (state.location === "hall" ? " is-active" : "") + '" data-loc="hall">' + (es ? "Pasillo interior (referencia anterior)" : "Interior hallway (earlier reference)") + "</button>" +
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
    var route = computeWalkwayRoute(state.location, state.f1);

    if (holdEl) {
      holdEl.className = "u4h-hold-strip is-danger";
      holdEl.innerHTML = es
        ? "<strong>NO CORTAR TECHO NI TECHO PLANO TODAVÍA:</strong> Escotilla 24\"×36\" aprobada afuera de Puerta 4; plataforma F1 reconciliada en Comedor SO (15.8 pies ≤ 20 pies máx.). Reparar gotera del techo plano y confirmar cortafuego/vigas antes de cortar."
        : "<strong>DO NOT CUT CEILING OR FLAT ROOF YET:</strong> 24\"×36\" hatch approved outside Front Door 4; F1 + 30\"×30\" platform reconciled in SW Dining (15.8 ft ≤ 20 ft cap). Repair active flat-roof leak and confirm fire-rating & joists first.";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Spot, Fire-Rating & Framing Check";
    var titleEs = "Ubicación, Cortafuego y Vigas";
    var subEn = '24" × 36" locked clear opening outside Front Door 4 — aligned with Unit 4 floor plan (N ↑)';
    var subEs = 'Claro fijo 24" × 36" afuera de Puerta 4 — alineado con la planta Unidad 4 (N ↑)';
    var inner = "";

    if (state.step === "spot") {
      var statusCls = state.fireRating === "yes" || state.joistBay === "14.5" || state.joistBay === "22.5" ? "is-fail" : (state.fireRating === "no" && state.joistBay === "27.5" ? "is-pass" : "is-warn");
      var statusText = state.fireRating === "yes"
        ? (es ? "ALTO: Si el plafón es cortafuego, NO usar kit de madera — instalar escotilla cortafuego certificada de 24\"×36\"." : "STOP: If the ceiling is fire-rated, DO NOT use the DIY wood kit — install a listed fire-rated 24\"×36\" access assembly.")
        : state.joistBay === "14.5" || state.joistBay === "22.5"
          ? (es ? "REQUIERE CABEZAL ESTRUCTURAL: Un claro de " + state.joistBay + "\" es menor a 27-1/2\". Necesita refuerzo estructural o mover de lugar; nunca reducir 24\"×36\"." : "NEEDS STRUCTURAL HEADER: A " + state.joistBay + "\" joist bay is narrower than 27-1/2\". Plan a structural header or alternate spot — never shrink 24\"×36\".")
          : state.fireRating === "no" && state.joistBay === "27.5"
            ? (es ? "✓ LISTO EN PAPEL: No cortafuego + claro 27-1/2\" calza exacto. Confirma gotera y trazo final con Tisa." : "✓ GEOMETRY CLEAR: Non-fire-rated + 27-1/2\" bay is an exact fit. Confirm roof leak repair and final markout with Tisa.")
            : (es ? "EN ESPERA: Confirma clasificación cortafuego y mide el claro real entre vigas B antes de cortar." : "HOLD: Confirm ceiling fire-rating and measure actual joist bay B on site before cutting.");

      inner =
        '<div class="u4h-photo-grid">' +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/attic-hatch-candidate.jpg" alt="' + esc(es ? "Foto real del techo en descanso exterior Puerta 4" : "Real photo of exterior Door 4 landing ceiling") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Foto real — Descanso Exterior Puerta 4:" : "Real photo — Exterior Door 4 Landing:") + "</strong> " +
              (es ? "Conservar lámpara de techo y moldura alta Edwardian (103\"). Revisar espacio para escalera y giro hacia el Este de Puerta 4."
                  : "Keep existing ceiling light and original 103\" Edwardian picture rail untouched. Verify ladder clearance and East swing of Door 4.") +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderHatchFramingSvg(es) + "</div>" +
        '<div class="u4h-controls">' +
          locationToggleRowHtml(es) +
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
      titleEn = "Reconciled 24\" Continuous Pathway & SW Dining F1 Platform";
      titleEs = "Pasillo Continuo 24\" Reconciliado y Plataforma F1 (Comedor SO)";
      subEn = 'Synced 1:1 with HVAC Plan — drag F1 + 30"×30" platform in 2D to recalculate real orthogonal routing & 4×8 sheets';
      subEs = 'Sincronizado 1:1 con Plano HVAC — arrastra F1 + plataforma 30"×30" en 2D para recalcular ruta real y hojas 4×8';
      var pass = route.pass;
      var sheets = route.sheets;

      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Pasillo 24\" (CMC 304.4)" : "24\" Pathway (CMC 304.4)") + "</div>" +
            '<div id="attKpiWalkVal" class="u4h-kpi-val ' + (pass ? "is-ok" : "is-fail") + '">' + route.walkFt + (es ? " pies / 20 máx." : " ft / 20 ft max") + "</div>" +
            '<div id="attKpiWalkSub" class="u4h-kpi-sub">' + (pass ? (es ? 'Paso libre 30" · Altura 66"' : '30" clear passage · 66" H') : (es ? "¡Excede tope de 20 pies!" : "Exceeds 20 ft cap!")) + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Hojas 4×8 pasillo" : "Walkway 4×8 sheets") + "</div>" +
            '<div id="attKpiSheetsVal" class="u4h-kpi-val is-info">' + sheets + (es ? " hojas (+1 plat.)" : " shts (+1 plat.)") + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? 'OSB 23/32" (1 tira 24"/hoja)' : '23/32" OSB (1 strip/sheet)') + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Ubicación F1 + 30\"×30\"" : "F1 + 30\"×30\" Spot") + "</div>" +
            '<div id="attKpiPosVal" class="u4h-kpi-val is-ok">X ' + state.f1.x + '" · Y ' + state.f1.y + '"</div>' +
            '<div class="u4h-kpi-sub">' + (es ? "Sincronizado con HVAC" : "Synced w/ HVAC Plan") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-hint">' +
          "<span>" + (es ? "✋ Arrastra F1 + Plataforma 30\"×30\" en 2D sobre la planta real (o usa los botones rápidos abajo):" : "✋ Drag F1 + 30\"×30\" Platform in 2D across the true-scale floor plan (or tap a preset below):") + "</span>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderWalkwaySvg(es) + "</div>" +
        '<div class="u4h-controls">' +
          locationToggleRowHtml(es) +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Puntos reconciliados F1:" : "Reconciled F1 spots:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.f1.x === 174 && state.f1.y === 258 ? " is-active" : "") + '" data-f1preset="sw_dining">' + (es ? "↺ Comedor SO Reconciliado (15.8')" : "↺ Reconciled SW Dining (15.8')") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.f1.x === 174 && state.f1.y === 196 ? " is-active" : "") + '" data-f1preset="nw_dining">' + (es ? "Comedor NO (~10.6')" : "NW Dining (~10.6')") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.f1.x === 350 && state.f1.y === 248 ? " is-active" : "") + '" data-f1preset="far_east">' + (es ? "Sala Este (>20' · Falla)" : "East Living (>20' · Fails)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div id="attWalkStatus" class="u4h-status ' + (pass ? "is-pass" : "is-fail") + '">' +
          (pass
            ? (es ? "✓ PASA (" + route.walkFt + " pies ≤ 20 pies máx. CMC 304.4.1) — Pasillo sólido continuo de 24\" (30\" libres) requiere " + sheets + " hoja(s) 4×8 de OSB 23/32\" o triplay 3/4\" (+1 hoja para plataforma 30\"×30\" y dique). NUNCA usar triplay 3/8\"."
                  : "✓ PASS (" + route.walkFt + " ft ≤ 20 ft max per CMC 304.4.1) — Continuous 24\" solid wood pathway (30\" clear) uses " + sheets + " sheet(s) of 4×8 23/32\" OSB or 3/4\" structural ply (+1 sheet for 30\"×30\" platform & dam). NEVER use 3/8\" ply.")
            : (es ? "✗ FALLA (" + route.walkFt + " pies > 20 pies máx.) — Con 66\" de altura libre bajo el techo plano, CMC 304.4.1 prohíbe pasar de 20 pies. Acerca F1 hacia el Comedor SO."
                  : "✗ FAIL (" + route.walkFt + " ft > 20 ft max) — At 66\" flat-roof attic height, CMC 304.4.1 caps the 24\" pathway at 20 ft. Move F1 closer toward SW Dining.")) +
        "</div>" +
        '<div class="u4h-cta-row" style="margin-top:10px">' +
          '<a id="attOpenSyncedHvacLink" class="u4h-nav-link" href="' + esc(syncedHvacHref()) + '">' +
            (es ? "Abrir Plano Integrado de Calefacción y Ductos (Posición F1 Sincronizada) →" : "Open Synced Furnace, Ducts & Sidewall Vent Plan →") +
          "</a>" +
        "</div>";

    } else if (state.step === "seal") {
      titleEn = "Flat Roof Cavity, Airtight Lid & Insulation Dam";
      titleEs = "Ático de Techo Plano, Tapa Hermética y Dique";
      subEn = "66\" flat-roof cavity (zero new roof penetrations) + 5 enclosure rules to seal air and hold loose insulation";
      subEs = "Cavidad de 66\" bajo techo plano (cero penetraciones nuevas) + 5 reglas de sellado y retención de aislante";

      inner =
        '<div class="u4h-svg-wrap">' + renderAirSealSvg(es) + "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Reglas clave de techo plano y sellado" : "Flat-Roof & Enclosure Rules") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li><strong>" + (es ? "Techo plano + salida lateral:" : "Flat roof + sidewall exit:") + "</strong> " + (es ? "Unidad 4 tiene techo plano con gotera activa en espera de reparación — cero penetraciones nuevas en techo. El escape del calefactor sale por muro lateral cumpliendo SFMC §802.8 (≥4 pies a colindancia)." : "Unit 4 has a flat roof with an active leak hold — zero new roof penetrations. Furnace exhaust exits out the sidewall per 2025 SFMC §802.8 (≥4 ft from interior property line) & OEM power-venter/direct-vent rules.") + "</li>" +
            "<li><strong>" + (es ? "Marco fijo y apoyos 1×2:" : "Fixed frame & 1×2 ledges:") + "</strong> " + (es ? 'Cordón 3/8" + sellador pintable en marco fijo; empaque continuo 1/2"×1/8" sobre apoyos 1×2 limpios.' : 'Seal fixed frame w/ 3/8" backer rod + caulk; continuous 1/2"×1/8" foam weatherstrip on clean 1×2 ledges.') + "</li>" +
            "<li><strong>" + (es ? "Junta de tapa operable:" : "Operable lid seam:") + "</strong> " + (es ? "NUNCA sellar la tapa con caulk — probar abrir y cerrar dos veces." : "Leave lid seam UNCAULKED — test-open and close twice.") + "</li>" +
            "<li><strong>" + (es ? "Dique 4 lados y broches:" : "4-sided dam & latches:") + "</strong> " + (es ? 'Dique de triplay 2" arriba del aislante suelto; broches fuera del claro fijo 24"×36".' : '4-sided plywood dam 2" above loose fill; mount latches completely outside 24"×36" clear.') + "</li>" +
          "</ul>" +
        "</div>";

    } else {
      titleEn = "Go / No-Go Checklist Before Any Ceiling Cut";
      titleEs = "Lista de Candados Antes de Cortar el Techo";
      subEn = "Every gate must be confirmed before cutting ceiling drywall or buying hatch lumber";
      subEs = "Cada punto debe confirmarse antes de cortar plafón o comprar madera";

      var gates = [
        { k: "g1", en: "1. Active flat-roof / attic water leak repaired & confirmed dry", es: "1. Gotera activa del techo plano reparada y confirmada seca" },
        { k: "g2", en: "2. Markout and fixed-edge offsets verified on the common landing outside Front Door 4", es: "2. Trazo y distancias a bordes fijos verificados en el descanso común afuera de Puerta 4" },
        { k: "g3", en: "3. Ceiling fire-rating verified (DIY wood kit vs listed fire-rated assembly)", es: "3. Clasificación cortafuego verificada (madera vs tapa cortafuego certificada)" },
        { k: "g4", en: "4. Joist bay width B + overhead wires/pipes + 15.8 ft SW Dining pathway verified", es: "4. Claro entre vigas B + cables/tubería + ruta 15.8 pies a Comedor SO verificados" },
        { k: "g5", en: "5. Temp bedroom closet hole stays OPEN until LV cable + permanent hatch exist", es: "5. Abertura temporal en clóset recámara sigue ABIERTA hasta tener cable LV + escotilla" }
      ];

      inner =
        '<div class="u4h-item-list">' +
          gates.map(function (g) {
            var done = !!state.gates[g.k];
            return '<div class="u4h-item-card' + (done ? " is-selected" : "") + '">' +
              '<label style="display:flex;gap:10px;align-items:center;flex:1;cursor:pointer">' +
                '<input type="checkbox" data-gate="' + g.k + '"' + (done ? " checked" : "") + ' style="width:17px;height:17px;accent-color:var(--accent)">' +
                '<span class="u4h-item-name" style="font-size:13.5px">' + esc(es ? g.es : g.en) + "</span>" +
              "</label>" +
            "</div>";
          }).join("") +
        "</div>" +
        '<div class="u4h-cta-row">' +
          '<button type="button" class="u4h-action-btn" id="attLogBtn">' + (es ? "📝 Enviar medidas al PM" : "📝 Log site readings to PM") + "</button>" +
          '<a class="u4h-nav-link" href="' + esc(syncedHvacHref()) + '">' + (es ? "Ver Plano de Calefacción y Salida Lateral →" : "Open Synced Furnace & Sidewall Vent Plan →") + "</a>" +
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
          '<span class="u4h-compass">24"×36" · Flat Roof</span>' +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); render(); window.scrollTo(0, 0); });
    });
    host.querySelectorAll("[data-loc]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.location = b.getAttribute("data-loc");
        var r2 = computeWalkwayRoute(state.location, state.f1);
        syncBlueprintWalkway(r2.walkFt);
        render();
      });
    });
    host.querySelectorAll("[data-f1preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-f1preset");
        if (p === "sw_dining") state.f1 = { x: 174, y: 258 };
        else if (p === "nw_dining") state.f1 = { x: 174, y: 196 };
        else if (p === "far_east") state.f1 = { x: 350, y: 248 };
        var r2 = computeWalkwayRoute(state.location, state.f1);
        syncBlueprintWalkway(r2.walkFt);
        render();
      });
    });
    host.querySelectorAll("[data-fire]").forEach(function (b) {
      b.addEventListener("click", function () { state.fireRating = b.getAttribute("data-fire"); render(); });
    });
    host.querySelectorAll("[data-bay]").forEach(function (b) {
      b.addEventListener("click", function () { state.joistBay = b.getAttribute("data-bay"); render(); });
    });

    function updateAtticPosLive(rawXIn, rawYIn) {
      var nx = Math.max(162, Math.min(430, Math.round(rawXIn)));
      var ny = Math.max(118, Math.min(274, Math.round(rawYIn)));
      state.f1.x = nx;
      state.f1.y = ny;
      var rNow = computeWalkwayRoute(state.location, state.f1);
      var ft = rNow.walkFt;
      var pass = rNow.pass;
      var sheets = rNow.sheets;
      var col = pass ? "#2f6b3f" : "#a8281c";
      var fillBg = pass ? "#e4f0e6" : "#f9e6e4";
      var isDoor4 = state.location === "door4";

      var pHalo = document.getElementById("attWalkHalo");
      var pBg = document.getElementById("attWalkPathBg");
      var pLn = document.getElementById("attWalkPathLn");
      var grp = document.getElementById("attPlatformDragHandle");
      var fVec = document.getElementById("attFlueVec");
      var fDot = document.getElementById("attFlueDot");
      var pill = document.getElementById("attWalkPill");
      var ptxt = document.getElementById("attWalkPillTxt");

      var f1x = px(nx), f1y = py(ny);
      var flueEnd = state.exitWall === "west" ? { x: px(147), y: f1y } : { x: f1x, y: py(297.75) };

      if (pHalo) { pHalo.setAttribute("d", rNow.dStr); pHalo.setAttribute("stroke", col); }
      if (pBg)   { pBg.setAttribute("d", rNow.dStr);   pBg.setAttribute("stroke", col); }
      if (pLn)   { pLn.setAttribute("d", rNow.dStr);   pLn.setAttribute("stroke", col); }
      if (grp)   { grp.setAttribute("transform", "translate(" + f1x + ", " + f1y + ")"); }
      if (fVec)  { fVec.setAttribute("x1", f1x); fVec.setAttribute("y1", f1y); fVec.setAttribute("x2", flueEnd.x); fVec.setAttribute("y2", flueEnd.y); }
      if (fDot)  { fDot.setAttribute("cx", flueEnd.x); fDot.setAttribute("cy", flueEnd.y); }
      if (pill)  { pill.setAttribute("fill", fillBg); pill.setAttribute("stroke", col); }
      if (ptxt) {
        ptxt.setAttribute("fill", col);
        ptxt.textContent = es
          ? (isDoor4 ? "Desde Puerta 4 (Ext.): " : "Desde Pasillo Int.: ") + ft + "' / 20' máx (" + (pass ? "PASA ✓" : "EXCEDE ✗") + ") · " + sheets + ' hojas 4×8 OSB 23/32" · F1 (X=' + nx + '", Y=' + ny + '")'
          : (isDoor4 ? "From Outside Door 4: " : "From Interior Hall: ") + ft + "' / 20' max (" + (pass ? "PASS ✓" : "OVER ✗") + ") · " + sheets + ' shts 4×8 23/32" OSB · F1 (X=' + nx + '", Y=' + ny + '")';
      }

      var kW = document.getElementById("attKpiWalkVal");
      if (kW) { kW.className = "u4h-kpi-val " + (pass ? "is-ok" : "is-fail"); kW.textContent = ft + (es ? " pies / 20 máx." : " ft / 20 ft max"); }
      var kS = document.getElementById("attKpiSheetsVal");
      if (kS) kS.textContent = sheets + (es ? " hojas (+1 plat.)" : " shts (+1 plat.)");
      var kP = document.getElementById("attKpiPosVal");
      if (kP) kP.textContent = "X " + nx + '" · Y ' + ny + '"';
      var syncLnk = document.getElementById("attOpenSyncedHvacLink");
      if (syncLnk) syncLnk.setAttribute("href", syncedHvacHref());

      var st = document.getElementById("attWalkStatus");
      if (st) {
        st.className = "u4h-status " + (pass ? "is-pass" : "is-fail");
        st.textContent = pass
          ? (es ? "✓ PASA (" + ft + " pies ≤ 20 pies máx. CMC 304.4.1) — Pasillo sólido continuo de 24\" (30\" libres) requiere " + sheets + " hoja(s) 4×8 de OSB 23/32\" o triplay 3/4\" (+1 hoja para plataforma 30\"×30\" y dique). NUNCA usar triplay 3/8\"."
                : "✓ PASS (" + ft + " ft ≤ 20 ft max per CMC 304.4.1) — Continuous 24\" solid wood pathway (30\" clear) uses " + sheets + " sheet(s) of 4×8 23/32\" OSB or 3/4\" structural ply (+1 sheet for 30\"×30\" platform & dam). NEVER use 3/8\" ply.")
          : (es ? "✗ FALLA (" + ft + " pies > 20 pies máx.) — Con 66\" de altura libre bajo el techo plano, CMC 304.4.1 prohíbe pasar de 20 pies. Acerca F1 hacia el Comedor SO."
                : "✗ FAIL (" + ft + " ft > 20 ft max) — At 66\" flat-roof attic height, CMC 304.4.1 caps the 24\" pathway at 20 ft. Move F1 closer toward SW Dining.");
      }
      syncBlueprintWalkway(ft);
    }

    var dragGrp = document.getElementById("attPlatformDragHandle");
    var walkSvg = document.getElementById("attWalkSvg");
    if (dragGrp && walkSvg) {
      dragGrp.addEventListener("pointerdown", function (e) {
        if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
        e.preventDefault();
        var pid = e.pointerId;
        dragGrp.classList.add("is-dragging");
        try { dragGrp.setPointerCapture(pid); } catch (_) {}
        var blockScroll = function (tev) { if (tev.cancelable) tev.preventDefault(); };
        window.addEventListener("touchmove", blockScroll, { passive: false });
        function onMove(ev) {
          if (ev.pointerId !== pid) return;
          var rect = walkSvg.getBoundingClientRect();
          var svgX = ((ev.clientX - rect.left) / (rect.width || 500)) * 500;
          var svgY = ((ev.clientY - rect.top) / (rect.height || 342)) * 342;
          updateAtticPosLive((svgX - OX) / SC, (svgY - OY) / SC);
        }
        function finish(ev) {
          if (ev && ev.pointerId !== pid) return;
          dragGrp.classList.remove("is-dragging");
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", finish);
          document.removeEventListener("pointercancel", finish);
          window.removeEventListener("touchmove", blockScroll);
          try { if (dragGrp.hasPointerCapture && dragGrp.hasPointerCapture(pid)) dragGrp.releasePointerCapture(pid); } catch (_) {}
          render();
        }
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", finish);
        document.addEventListener("pointercancel", finish);
      });
      dragGrp.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); updateAtticPosLive(state.f1.x + 6, state.f1.y); }
        if (e.key === "ArrowLeft")  { e.preventDefault(); updateAtticPosLive(state.f1.x - 6, state.f1.y); }
        if (e.key === "ArrowDown")  { e.preventDefault(); updateAtticPosLive(state.f1.x, state.f1.y + 6); }
        if (e.key === "ArrowUp")    { e.preventDefault(); updateAtticPosLive(state.f1.x, state.f1.y - 6); }
      });
    }

    host.querySelectorAll("[data-gate]").forEach(function (cb) {
      cb.addEventListener("change", function () { state.gates[cb.getAttribute("data-gate")] = cb.checked; render(); });
    });
    var eqBtn = document.getElementById("attEquipBtn");
    if (eqBtn) eqBtn.addEventListener("click", function () { state.equipOpen = !state.equipOpen; render(); });
    var logBtn = document.getElementById("attLogBtn");
    if (logBtn) logBtn.addEventListener("click", function () {
      var rLog = computeWalkwayRoute(state.location, state.f1);
      if (window.U4LiveAi) window.U4LiveAi.openNote("Attic hatch & reconciled F1 field readings — spot=" + state.location + ", F1=(" + state.f1.x + "in," + state.f1.y + "in), walkway=" + rLog.walkFt + "ft (" + rLog.sheets + " sheets), fireRating=" + state.fireRating + ", joistBay=" + state.joistBay + ": ");
    });
    var pBtn = document.getElementById("attPrevBtn");
    var nBtn = document.getElementById("attNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });

    // Keep header sibling link synced with live F1 position!
    document.querySelectorAll('[data-plan-id="hvac-layout"]').forEach(function (a) {
      a.setAttribute("href", syncedHvacHref());
    });

    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext();
    }
  }

  window.addEventListener("message", function (ev) {
    var msg = ev && ev.data;
    if (!msg || msg.type !== "u4:attic-hvac-sync" || msg.sourcePlan === "attic-hatch") return;
    if (msg.f1 && isFinite(msg.f1.x) && isFinite(msg.f1.y)) {
      state.f1 = { x: Math.round(msg.f1.x), y: Math.round(msg.f1.y) };
    }
    if (msg.location === "hall" || msg.location === "door4") state.location = msg.location;
    if (msg.ventMode) state.ventMode = msg.ventMode;
    if (msg.exitWall) state.exitWall = msg.exitWall;
    render();
  });

  function applyAtticView(args) {
    args = args || {};
    var changed = false;
    var stepRaw = args.step;
    if (stepRaw != null && stepRaw !== "") {
      var n = Number(stepRaw);
      if (isFinite(n) && n >= 1 && n <= STEPS.length) {
        state.step = STEPS[n - 1].id;
        changed = true;
      } else {
        var s = String(stepRaw).toLowerCase().trim();
        var map = { hatch: "spot", framing: "spot", plan: "spot", clearance: "walkway", sheets: "walkway", pathway: "walkway", lid: "seal", checklist: "gates", holds: "gates" };
        var id = map[s] || s;
        if (STEPS.some(function (x) { return x.id === id; })) { state.step = id; changed = true; }
      }
    }
    if (changed) render();
    return changed;
  }

  window.U4PlanControl = {
    showView: function (args) { return applyAtticView(args); },
    applyChange: function (args) {
      args = args || {};
      var act = String(args.action || args.target || "").toLowerCase();
      var val = args.value;
      if (act === "move_f1" || act === "f1") {
        var pos = (val && typeof val === "object") ? val : args;
        if (pos.x != null && isFinite(Number(pos.x))) state.f1.x = Math.max(162, Math.min(430, Math.round(Number(pos.x))));
        if (pos.y != null && isFinite(Number(pos.y))) state.f1.y = Math.max(118, Math.min(274, Math.round(Number(pos.y))));
      } else if (act === "walkway_ft" || act === "walkway" || act === "walkway_length") {
        var targetFt = Math.max(8, Math.min(24, Number(val)));
        if (!isFinite(targetFt)) return false;
        // Adjust Y along X=174 (or X into Living if >18 ft) to match requested walkway length realistically
        var remIn = targetFt * 12 - 50;
        if (remIn <= 155) {
          state.f1 = { x: 174, y: Math.max(128, Math.min(274, Math.round(74 + remIn + 44.5))) };
        } else {
          state.f1 = { x: Math.min(420, Math.round(170 + (remIn - 140))), y: 258 };
        }
      } else if (act === "hatch_location" || act === "location" || act === "spot") {
        state.location = String(val).toLowerCase().indexOf("hall") >= 0 ? "hall" : "door4";
      } else if (act === "fire_rating") {
        state.fireRating = String(val || "unknown");
      } else if (act === "joist_bay") {
        state.joistBay = String(val || "unknown");
      } else if (act === "reset") {
        state.location = "door4";
        state.f1 = { x: RECONCILED_F1_DEFAULT.x, y: RECONCILED_F1_DEFAULT.y };
        state.fireRating = "unknown";
        state.joistBay = "unknown";
      } else {
        return false;
      }
      var rUpd = computeWalkwayRoute(state.location, state.f1);
      syncBlueprintWalkway(rUpd.walkFt);
      render();
      return true;
    },
    getState: function () {
      var r = computeWalkwayRoute(state.location, state.f1);
      return {
        planId: "attic-hatch",
        step: state.step,
        wall: state.location === "door4" ? "exterior_door4_landing" : "interior_hallway",
        location: state.location,
        f1: { x: state.f1.x, y: state.f1.y },
        walkwayFt: r.walkFt,
        sheets: r.sheets,
        fireRating: state.fireRating,
        joistBay: state.joistBay,
        roofGeometry: "flat_roof_66in_cavity",
        summary: "Attic Hatch (Reconciled w/ HVAC): step=" + state.step + ", hatch=" + state.location + " (24x36in clear), F1=(" + state.f1.x + "in," + state.f1.y + "in SW Dining), 24in pathway=" + r.walkFt + "ft (" + r.sheets + " sheets, <=20ft cap at 66in flat roof)."
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
      if (bp.step) applyAtticView(bp);
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "attic-hatch",
        room: "attic-access",
        titleEn: "Permanent Attic Hatch & Reconciled 24\" Pathway",
        titleEs: "Escotilla Permanente del Ático y Pasillo Reconciliado de 24\"",
        getContext: function () {
          var r = computeWalkwayRoute(state.location, state.f1);
          return "Step=" + state.step + ", Spot=" + state.location + " (Outside Front Door 4 Landing), LockedClear=24x36in, ReconciledF1=(" + state.f1.x + "in," + state.f1.y + "in SW Dining per Tisa pin), Walkway=" + r.walkFt + "ft (<=20ft cap at 66in flat-roof height, " + r.sheets + " walkway sheets + 1 platform/dam sheet), FlatRoofLeakHold=active, SidewallVent=SFMC 802.8 >=4ft property line.";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Dónde quedó reconciliada la plataforma F1?", "¿Cuántas hojas 4×8 ocupa el pasillo de 15.8 pies?", "¿Qué exige el código para el pasillo de 24\" y techo plano?"]
            : ["Where is the reconciled F1 platform located?", "How many 4×8 sheets for the 15.8 ft pathway?", "What are the CMC 304.4 & flat-roof rules?"];
        }
      });
    }
    var rInit = computeWalkwayRoute(state.location, state.f1);
    syncBlueprintWalkway(rInit.walkFt);
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
