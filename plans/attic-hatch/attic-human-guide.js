/* ============================================================================
   Permanent Attic Hatch — Real-World Human-First Interactive Guide
   Aligned with unit4-floorplan-proof.png (N ↑ / S ↓ / ← W / E →) & HVAC Rev P2
   Staggered L-Path Walkway · Door 4 Landing vs Interior Hall Toggle · 2-Way Drag
   Zero External CDNs · Zero Prices · Zero Backend Clutter · EN / MX-ES
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
    location: "door4",       // "door4" (Exterior Door 4 Landing) | "hall" (Interior Hallway)
    fireRating: "unknown",   // "unknown" | "no" | "yes"
    joistBay: "unknown",     // "unknown" | "14.5" | "22.5" | "27.5" | "30"
    walkwayFt: 18,           // 6..24 ft (Rev P2 default ~18 ft from Door 4 Landing to South Dining F1)
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

  // Piece-wise staggered L-path geometry inside Step 2 Unit 4 mini-map (viewBox 0 0 480 288, N ↑ / S ↓ / ← W / E →)
  // Scale: 12 px = 1 ft (1 px = 1 in) along the walkway legs
  function computeStaggeredRoute(location, ft) {
    var clampedFt = Math.max(6, Math.min(24, ft));
    // Segments defined by polyline vertices in SVG px (1 ft = 10.5 px)
    var PX_PER_FT = 10.5;
    var basePts = location === "hall"
      // Interior Hallway hatch (x=226, y=104) -> East along Hall -> South into Dining -> East toward Living
      ? [
          { x: 226, y: 104 },
          { x: 256, y: 104 },
          { x: 256, y: 214 },
          { x: 392, y: 214 }
        ]
      // Exterior Door 4 Landing hatch (x=114, y=72, outside WEST of Entry Door 4!)
      // -> East across Entry Door 4 (x=152) -> jog South to Hallway spine (y=108) -> East into Hall/Dining (x=232) -> South into Dining (y=214) -> East toward Living
      : [
          { x: 124, y: 72 },
          { x: 170, y: 72 },
          { x: 170, y: 108 },
          { x: 232, y: 108 },
          { x: 232, y: 214 },
          { x: 392, y: 214 }
        ];

    function sampleAtDist(distPx) {
      var out = [basePts[0]];
      var rem = distPx;
      for (var i = 1; i < basePts.length; i++) {
        var a = basePts[i - 1], b = basePts[i];
        var segLen = Math.hypot(b.x - a.x, b.y - a.y);
        if (rem <= segLen) {
          var t = segLen > 0 ? rem / segLen : 0;
          out.push({ x: +(a.x + (b.x - a.x) * t).toFixed(1), y: +(a.y + (b.y - a.y) * t).toFixed(1) });
          return out;
        }
        out.push(b);
        rem -= segLen;
      }
      return out;
    }

    var activePts = sampleAtDist(clampedFt * PX_PER_FT);
    var endPt = activePts[activePts.length - 1];
    var capPts = sampleAtDist(20 * PX_PER_FT);
    var capPt = capPts[capPts.length - 1];
    var dStr = activePts.map(function (p, i) { return (i === 0 ? "M " : " L ") + p.x + " " + p.y; }).join("");
    var fullGuideD = basePts.map(function (p, i) { return (i === 0 ? "M " : " L ") + p.x + " " + p.y; }).join("");

    return {
      pts: activePts,
      dStr: dStr,
      fullGuideD: fullGuideD,
      endPt: endPt,
      capPt: capPt,
      hatchCenter: location === "hall" ? { x: 204, y: 104 } : { x: 112, y: 72 },
      basePts: basePts,
      pxPerFt: PX_PER_FT
    };
  }

  // Project arbitrary SVG point (mx, my) onto the staggered L-path to derive exact walkway feet (6..24 ft)
  function projectSvgPointToFt(location, mx, my) {
    var r = computeStaggeredRoute(location, 24);
    var pts = r.basePts;
    var bestDist = Infinity;
    var bestAlong = 0;
    var acc = 0;
    for (var i = 1; i < pts.length; i++) {
      var ax = pts[i - 1].x, ay = pts[i - 1].y;
      var bx = pts[i].x, by = pts[i].y;
      var vx = bx - ax, vy = by - ay;
      var len2 = vx * vx + vy * vy;
      var t = len2 > 0 ? Math.max(0, Math.min(1, ((mx - ax) * vx + (my - ay) * vy) / len2)) : 0;
      var px = ax + vx * t, py = ay + vy * t;
      var d = Math.hypot(mx - px, my - py);
      if (d < bestDist) {
        bestDist = d;
        bestAlong = acc + Math.sqrt(len2) * t;
      }
      acc += Math.sqrt(len2);
    }
    return Math.max(6, Math.min(24, Math.round(bestAlong / r.pxPerFt)));
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
      // Title & N/S/E/W Compass Rose
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

      // Cardinal Floor Plan Landmarks matching unit4-floorplan-proof.png
      '<rect x="112" y="26" width="236" height="15" rx="3" fill="#e3eef2" stroke="#1f5f7a" stroke-width="0.8"/>' +
      '<text x="230" y="36.5" text-anchor="middle" font-size="7.4" font-weight="800" fill="#1f5f7a">' + esc(northLandmark) + "</text>" +

      // Ceiling framing envelope
      '<rect x="34" y="48" width="392" height="176" rx="6" fill="#fbfcfb" stroke="#c5ccc9" stroke-width="1.3"/>' +
      '<line x1="34" y1="74" x2="426" y2="74" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<line x1="34" y1="196" x2="426" y2="196" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +

      // West & East Landmarks cleanly on top rim (zero overlap with rough-cut header below!)
      '<text x="40" y="60" font-size="7" font-weight="700" fill="#5d686d">' + esc(westLandmark) + "</text>" +
      '<text x="420" y="60" text-anchor="end" font-size="7" font-weight="800" fill="#1f5f7a">' + esc(eastLandmark) + "</text>" +

      // Proposed outer rough cut (27.5" x 39.5") with label cleanly inside top framing strip
      '<rect x="108" y="68" width="244" height="136" fill="#f7ecd9" fill-opacity="0.45" stroke="' + frameStroke + '" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="230" y="79" text-anchor="middle" font-size="7.5" font-weight="800" fill="' + frameStroke + '">' + esc(frameLabel) + "</text>" +

      // Locked finished clear 24" x 36"
      '<rect x="122" y="86" width="216" height="106" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2.4"/>' +

      // Carrier/Bryant Furnace end-first footprint (14.19" x 29" scaled proportionally inside 24" x 36")
      '<rect x="143" y="105" width="174" height="68" rx="4" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2"/>' +
      '<text x="230" y="128" text-anchor="middle" font-size="9" font-weight="800" fill="#2f6b3f">' + (es ? "CALEFACCIÓN ENTRA DE PUNTA: PASA ✓" : "FURNACE END-FIRST: PASS ✓") + "</text>" +
      '<text x="230" y="142" text-anchor="middle" font-size="8" font-weight="700" fill="#1d2326">14-3/16" × 29" (Carrier / Bryant 45k)</text>' +
      '<text x="230" y="155" text-anchor="middle" font-size="7.4" font-weight="700" fill="#2f6b3f">' + (es ? '+9-3/4" de ancho y +7" de largo libres' : '+9-3/4" width & +7" length to spare') + "</text>" +

      // Clear dimension labels
      '<rect x="130" y="202" width="200" height="16" rx="4" fill="#ffffff" fill-opacity="0.96"/>' +
      '<text x="230" y="213" text-anchor="middle" font-size="8.2" font-weight="800" fill="#1f5f7a">' + (es ? '36" LIBRE TERMINADO (EJE E–O)' : '36" FINISHED CLEAR (E–W AXIS)') + "</text>" +
      '<text x="358" y="138" font-size="8.6" font-weight="800" fill="#1f5f7a">24"</text>' +
      '<text x="358" y="149" font-size="7.2" fill="#5d686d">' + (es ? "libre" : "clear") + "</text>" +

      // Joist bay B bracket on left
      '<line x1="88" y1="74" x2="88" y2="196" stroke="' + (bayNarrow ? "#a8281c" : "#9a5b06") + '" stroke-width="1.8"/>' +
      '<line x1="82" y1="74" x2="94" y2="74" stroke="' + (bayNarrow ? "#a8281c" : "#9a5b06") + '" stroke-width="1.8"/>' +
      '<line x1="82" y1="196" x2="94" y2="196" stroke="' + (bayNarrow ? "#a8281c" : "#9a5b06") + '" stroke-width="1.8"/>' +

      // South landmark & Joist Bay status footer
      '<rect x="112" y="230" width="236" height="15" rx="3" fill="#f4f5f3" stroke="#c5ccc9" stroke-width="0.8"/>' +
      '<text x="230" y="240.5" text-anchor="middle" font-size="7.4" font-weight="700" fill="#5d686d">' + esc(southLandmark) + "</text>" +
      '<text x="230" y="266" text-anchor="middle" font-size="8.4" font-weight="800" fill="' + (bayNarrow ? "#a8281c" : (bayOk ? "#2f6b3f" : "#9a5b06")) + '">' +
        esc(bayLabel + (bayOk ? (es ? " — ¡Calza exacto!" : " — Exact fit!") : bayWide ? (es ? " — Agregar respaldo lateral sólido" : " — Needs solid side backing") : bayNarrow ? (es ? " — Requiere cabezal estructural o mover punto" : " — Needs structural header or alternate spot") : "")) +
      "</text>" +
    "</svg>";
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
  }

  function renderWalkwaySvg(es) {
    var ft = state.walkwayFt;
    var pass = ft <= 20;
    var sheets = calcSheets(ft);
    var col = pass ? "#2f6b3f" : "#a8281c";
    var fillBg = pass ? "#e4f0e6" : "#f9e6e4";
    var route = computeStaggeredRoute(state.location, ft);
    var isDoor4 = state.location === "door4";
    var hx = route.hatchCenter.x, hy = route.hatchCenter.y;
    var ex = route.endPt.x, ey = route.endPt.y;
    var cx = route.capPt.x, cy = route.capPt.y;

    return '<svg id="attWalkSvg" viewBox="0 0 480 286" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Pasillo escalonado en L desde escotilla hasta plataforma F1" : "Staggered L-path attic walkway from hatch to F1 platform") + '" style="touch-action:none">' +
      // Title & N/S/E/W Compass Rose
      '<text x="14" y="17" font-size="8.8" font-weight="800" fill="#1f5f7a">' +
        (es ? 'PASILLO ESCALONADO 24" EN PLANTA · ← OESTE (Puerta 4) | NORTE ↑ | ESTE →'
            : 'STAGGERED 24" L-PATH WALKWAY · ← WEST (Door 4) | NORTH ↑ | EAST →') + "</text>" +
      '<g transform="translate(456,22)">' +
        '<circle r="14" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-10 -3,-3.5 3,-3.5" fill="#a8281c"/>' +
        '<text x="0" y="-11" text-anchor="middle" font-size="6.2" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="11.8" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">S</text>' +
        '<text x="9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">E</text>' +
        '<text x="-9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">' + (es ? "O" : "W") + "</text>" +
      "</g>" +

      // Accurate Unit 4 Floor Plan Context underneath staggered L-walkway (N ↑ / S ↓ / ← W / E →)
      // Exterior Door 4 Landing (OUTSIDE WEST of Front Door 4, with stairs on far West!)
      '<rect x="70" y="42" width="74" height="68" fill="#f7ecd9" fill-opacity="0.46" stroke="#9a5b06" stroke-width="1.3" stroke-dasharray="4 3"/>' +
      '<line x1="76" y1="48" x2="76" y2="104" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<line x1="82" y1="48" x2="82" y2="104" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<line x1="88" y1="48" x2="88" y2="104" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<text x="108" y="51" text-anchor="middle" font-size="5.3" font-weight="800" fill="#9a5b06">' + (es ? "AFUERA PTA 4" : "OUTSIDE DOOR 4") + "</text>" +

      // Kitchen (SW)
      '<path d="M 38 110 L 144 110 L 144 218 L 16 218 L 16 164 L 38 164 Z" fill="#fbfcfb" stroke="#98a4a8" stroke-width="1.3"/>' +
      '<text x="84" y="170" text-anchor="middle" font-size="7.8" font-weight="700" fill="#5d686d">' + (es ? "Cocina" : "Kitchen") + "</text>" +

      // Hallway + 60" Door 4 Foyer (with Entry Door 4 on West wall swinging East!)
      '<path d="M 144 62 L 200 62 L 200 84 L 348 84 L 348 134 L 144 134 Z" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1.3"/>' +
      // Entry Door 4 swinging EAST inward
      '<line x1="144" y1="70" x2="144" y2="98" stroke="#f4f5f3" stroke-width="3"/>' +
      '<line x1="144" y1="70" x2="170" y2="70" stroke="#1f5f7a" stroke-width="2"/>' +
      '<path d="M 170 70 A 26 26 0 0 1 144 96" fill="none" stroke="#1f5f7a" stroke-width="1.2" stroke-dasharray="3 2"/>' +
      '<text x="159" y="87" font-size="6" font-weight="800" fill="#1f5f7a">' + (es ? "Pta 4→" : "Door 4→") + "</text>" +
      '<text x="292" y="128" text-anchor="middle" font-size="7" font-weight="700" fill="#5d686d">' + (es ? "Pasillo" : "Hallway") + "</text>" +

      // Bathroom + Laundry + Bedroom edge on North
      '<rect x="200" y="34" width="68" height="50" fill="#fbfcfb" stroke="#98a4a8" stroke-width="1.2"/>' +
      '<text x="234" y="62" text-anchor="middle" font-size="7.2" font-weight="700" fill="#5d686d">' + (es ? "Baño" : "Bath") + "</text>" +
      '<rect x="268" y="34" width="36" height="50" fill="#fbfcfb" stroke="#98a4a8" stroke-width="1.2"/>' +
      '<text x="286" y="62" text-anchor="middle" font-size="6.4" font-weight="700" fill="#5d686d">' + (es ? "Lav." : "Ldry") + "</text>" +
      '<path d="M 304 34 L 424 34 L 452 60 L 452 108 L 424 134 L 348 134 L 348 84 L 304 84 Z" fill="#fbfcfb" stroke="#98a4a8" stroke-width="1.2"/>' +
      '<text x="386" y="76" text-anchor="middle" font-size="7.6" font-weight="700" fill="#5d686d">' + (es ? "Recámara" : "Bedroom") + "</text>" +

      // Dining Room & Living Room South
      '<rect x="144" y="134" width="142" height="118" fill="#fbfcfb" stroke="#98a4a8" stroke-width="1.3"/>' +
      '<text x="180" y="242" text-anchor="middle" font-size="7.8" font-weight="700" fill="#5d686d">' + (es ? "Comedor" : "Dining") + "</text>" +
      '<path d="M 286 134 L 434 134 L 460 162 L 460 226 L 434 252 L 286 252 Z" fill="#fbfcfb" stroke="#98a4a8" stroke-width="1.3"/>' +
      '<text x="376" y="160" text-anchor="middle" font-size="7.8" font-weight="700" fill="#5d686d">' + (es ? "Sala" : "Living Room") + "</text>" +

      // Faint full staggered guide track (6..24 ft)
      '<path d="' + route.fullGuideD + '" fill="none" stroke="#c5ccc9" stroke-width="12" stroke-linejoin="round" opacity="0.35"/>' +

      // Active Staggered L-Path 24" Walkway
      '<path id="attWalkPathBg" d="' + route.dStr + '" fill="none" stroke="' + col + '" stroke-width="14" stroke-linejoin="round" opacity="0.26"/>' +
      '<path id="attWalkPathLn" d="' + route.dStr + '" fill="none" stroke="' + col + '" stroke-width="2.2" stroke-dasharray="5 3" stroke-linejoin="round"/>' +

      // 20 ft Code Max Marker on the L-Path
      '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="#f9e6e4" stroke="#a8281c" stroke-width="1.6"/>' +
      '<rect x="' + (cx - 38).toFixed(1) + '" y="' + (cy + 8).toFixed(1) + '" width="76" height="13" rx="3" fill="#f9e6e4" stroke="#a8281c" stroke-width="0.9"/>' +
      '<text x="' + cx + '" y="' + (cy + 17).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#a8281c">' + (es ? "TOPE 20 pies" : "20 ft MAX CAP") + "</text>" +

      // Dynamic 24"x36" Attic Hatch (moves cleanly when toggling Door 4 Landing vs Interior Hall!)
      '<g id="attHatchBox" transform="translate(' + hx + ', ' + hy + ')">' +
        '<rect x="' + (isDoor4 ? -12 : -18) + '" y="' + (isDoor4 ? -18 : -12) + '" width="' + (isDoor4 ? 24 : 36) + '" height="' + (isDoor4 ? 36 : 24) + '" rx="3" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2"/>' +
        '<text x="0" y="-1" text-anchor="middle" font-size="6.4" font-weight="800" fill="#1f5f7a">24×36</text>' +
        '<text x="0" y="8" text-anchor="middle" font-size="5.6" font-weight="700" fill="#1f5f7a">' + (es ? "Escotilla" : "Hatch") + "</text>" +
      "</g>" +

      // DIRECTLY DRAGGABLE 30"x30" Service Platform + F1 Furnace (2-way synced with #attWalkSlider & #rng-walkway-l!)
      '<g id="attPlatformDragHandle" class="u4-drag-move" tabindex="0" role="slider" aria-label="' + esc(es ? "Arrastrar plataforma F1 sobre el pasillo escalonado (pies)" : "Drag F1 service platform along staggered walkway (ft)") + '" aria-valuemin="6" aria-valuemax="24" aria-valuenow="' + ft + '" transform="translate(' + ex + ', ' + ey + ')">' +
        '<rect x="-32" y="-26" width="64" height="52" fill="transparent"/>' +
        '<rect class="u4-drag-grip" x="-26" y="-20" width="52" height="40" rx="5" fill="#f7ecd9" stroke="#9a5b06" stroke-width="2"/>' +
        '<text x="0" y="-6" text-anchor="middle" font-size="7.2" font-weight="800" fill="#9a5b06" pointer-events="none">F1 · 30"×30"</text>' +
        '<text x="0" y="4" text-anchor="middle" font-size="6.4" fill="#1d2326" pointer-events="none">' + (es ? "Plataforma" : "Platform") + "</text>" +
        '<rect x="-21" y="7" width="42" height="11" rx="5.5" fill="#9a5b06" pointer-events="none"/>' +
        '<text x="0" y="14.8" text-anchor="middle" font-size="5.8" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "✥ MOVER" : "✥ DRAG") + "</text>" +
      "</g>" +

      // Bottom live pill clear of rooms
      '<rect id="attWalkPill" x="14" y="260" width="452" height="20" rx="5" fill="' + fillBg + '" stroke="' + col + '" stroke-width="1"/>' +
      '<text id="attWalkPillTxt" x="240" y="273" text-anchor="middle" font-size="7.8" font-weight="700" fill="' + col + '">' +
        (es ? (isDoor4 ? "Desde Puerta 4 (Ext.): " : "Desde Pasillo Interior: ") + ft + ' pies / 20 máx. (' + (pass ? "PASA ✓" : "EXCEDE ✗") + ') · ' + sheets + ' hojas 4×8 OSB 23/32" (NUNCA 3/8")'
            : (isDoor4 ? "From Ext. Door 4 Landing: " : "From Interior Hall: ") + ft + ' ft / 20 max (' + (pass ? "PASS ✓" : "OVER ✗") + ') · ' + sheets + ' shts 4×8 23/32" OSB (NEVER 3/8")') +
      "</text>" +
    "</svg>";
  }

  function renderAirSealSvg(es) {
    return '<svg viewBox="0 0 460 230" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="9.6" font-weight="800" fill="#1f5f7a">' +
        (es ? "CORTE DE TAPA HERMÉTICA, AISLANTE Y DIQUE EN ÁTICO" : "AIRTIGHT LID, INSULATION & DAM CROSS-SECTION") + "</text>" +
      '<rect x="24" y="96" width="90" height="62" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<rect x="346" y="96" width="90" height="62" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="69" y="130" text-anchor="middle" font-size="7.5" font-weight="700" fill="#9a5b06">' + (es ? "Aislante suelto" : "Loose insulation") + "</text>" +
      '<rect x="114" y="64" width="10" height="108" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<rect x="336" y="64" width="10" height="108" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<text x="352" y="76" font-size="7.8" font-weight="800" fill="#7c4d12">' + (es ? 'Dique 4 lados (+2" alto)' : '4-sided dam (+2" above fill)') + "</text>" +
      '<rect x="134" y="88" width="192" height="44" rx="4" fill="#fce7f3" stroke="#be185d" stroke-width="1.4"/>' +
      '<text x="230" y="114" text-anchor="middle" font-size="8.2" font-weight="800" fill="#9d174d">' + (es ? "2 colchonetas R sin papel + 3 lazos de alambre cal. 16" : "2 unfaced R-batts + 3 loose 16-ga wire loops") + "</text>" +
      '<rect x="130" y="136" width="200" height="16" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.8"/>' +
      '<text x="230" y="147" text-anchor="middle" font-size="7.8" font-weight="800" fill="#1f5f7a">' + (es ? 'Tapa triplay 3/4" (junta SIN sellador — probar abrir 2×)' : '3/4" ply lid (DO NOT caulk lid seam — test open 2×)') + "</text>" +
      '<rect x="124" y="152" width="22" height="10" fill="#2f6b3f"/>' +
      '<rect x="314" y="152" width="22" height="10" fill="#2f6b3f"/>' +
      '<text x="230" y="180" text-anchor="middle" font-size="8" font-weight="800" fill="#2f6b3f">' + (es ? 'Empaque continuo 1/2"×1/8" sobre apoyos 1×2 limpios (sin pintura)' : 'Continuous 1/2"×1/8" foam weatherstrip on clean 1×2 ledges') + "</text>" +
      '<line x1="24" y1="168" x2="124" y2="168" stroke="#1d2326" stroke-width="2.4"/>' +
      '<line x1="336" y1="168" x2="436" y2="168" stroke="#1d2326" stroke-width="2.4"/>' +
      '<text x="230" y="206" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' +
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

    if (holdEl) {
      holdEl.className = "u4h-hold-strip is-danger";
      holdEl.innerHTML = es
        ? "<strong>NO CORTAR EL TECHO TODAVÍA:</strong> El descanso común afuera de la puerta 4 es la ubicación aprobada. Confirmar trazo, sistema de techo, protección contra incendio y refuerzo. Reparar la gotera antes de cortar o comprar madera. Mantener abierta la abertura temporal del clóset."
        : "<strong>DO NOT CUT CEILING YET:</strong> The common landing outside Front Door 4 is approved. Confirm exact markout, ceiling assembly, fire protection and framing. Repair the roof leak before cutting or buying wood. Keep the temporary bedroom closet opening OPEN.";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Spot, Fire-Rating & Framing Check";
    var titleEs = "Ubicación, Cortafuego y Vigas";
    var subEn = '24" × 36" locked clear opening — aligned with Unit 4 floor plan (N ↑)';
    var subEs = 'Claro fijo 24" × 36" — alineado con la planta Unidad 4 (N ↑)';
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
      titleEn = "Staggered L-Path Walkway & 4×8 Sheets";
      titleEs = "Pasillo Escalonado en L y Hojas 4×8";
      subEn = '66" attic height caps continuous walkway at 20 ft max — drag F1 platform or toggle Door 4 vs Interior Hall';
      subEs = 'Altura de 66" limita el pasillo a 20 pies máx. — arrastra la plataforma F1 o cambia Puerta 4 vs Pasillo';
      var pass = state.walkwayFt <= 20;
      var sheets = calcSheets(state.walkwayFt);

      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Largo de pasillo" : "Walkway length") + "</div>" +
            '<div id="attKpiWalkVal" class="u4h-kpi-val ' + (pass ? "is-ok" : "is-fail") + '">' + state.walkwayFt + (es ? " pies / 20 máx." : " ft / 20 ft max") + "</div>" +
            '<div class="u4h-kpi-sub">' + (pass ? (es ? "Cumple límite 20 pies" : "Meets 20 ft code cap") : (es ? "¡Demasiado lejos!" : "Over 20 ft limit!")) + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Hojas 4×8 necesarias" : "4×8 sheets needed") + "</div>" +
            '<div id="attKpiSheetsVal" class="u4h-kpi-val is-info">' + sheets + (es ? " hojas" : " sheets") + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? '1 tira real 24" por hoja' : '1 true 24" strip/sheet') + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Plataforma servicio" : "Service platform") + "</div>" +
            '<div class="u4h-kpi-val is-ok">30" × 30"</div>' +
            '<div class="u4h-kpi-sub">' + (es ? "Sin gomas (las trae NEXT)" : "No pads (NEXT provides)") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-hint">' +
          "<span>" + (es ? "✋ Arrastra la plataforma F1 a lo largo del pasillo escalonado en L, o cambia el origen de la escotilla abajo:" : "✋ Drag the F1 platform along the staggered L-path, or switch hatch spot below:") + "</span>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderWalkwaySvg(es) + "</div>" +
        '<div class="u4h-controls">' +
          locationToggleRowHtml(es) +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Distancia de escotilla a plataforma F1 (pies):" : "Distance from hatch to F1 platform (ft):") + "</span>" +
            '<div class="u4h-slider-row">' +
              '<input type="range" id="attWalkSlider" min="6" max="24" step="1" value="' + state.walkwayFt + '">' +
              '<span id="attWalkSliderVal" class="u4h-slider-val">' + state.walkwayFt + (es ? " pies" : " ft") + "</span>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div id="attWalkStatus" class="u4h-status ' + (pass ? "is-pass" : "is-fail") + '">' +
          (pass
            ? (es ? "✓ PASA (" + state.walkwayFt + " pies ≤ 20 pies) — Compra " + sheets + " hoja(s) de OSB 23/32\" o triplay 3/4\". NUNCA usar triplay de 3/8\"."
                  : "✓ PASS (" + state.walkwayFt + " ft ≤ 20 ft max) — Plan " + sheets + " sheet(s) of 23/32\" OSB or 3/4\" structural ply. NEVER use 3/8\" ply.")
            : (es ? "✗ FALLA (" + state.walkwayFt + " pies > 20 pies) — Con 66\" de altura en ático el pasillo NO puede pasar de 20 pies. Acerca F1 o usa escotilla interior."
                  : "✗ FAIL (" + state.walkwayFt + " ft > 20 ft max) — At 66\" attic height, walkway cannot exceed 20 ft. Place F1 closer or switch hatch to Interior Hall.")) +
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
        { k: "g2", en: "2. Markout and fixed-edge offsets verified on the common landing outside Front Door 4", es: "2. Trazo y distancias a bordes fijos verificados en el descanso común afuera de la puerta 4" },
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
                '<input type="checkbox" data-gate="' + g.k + '"' + (done ? " checked" : "") + ' style="width:17px;height:17px;accent-color:var(--accent)">' +
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
          '<span class="u4h-compass">24"×36" · N ↑</span>' +
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
        // Keep walkway realistic when switching between exterior Door 4 landing & closer Interior Hall
        if (state.location === "hall" && state.walkwayFt > 14) state.walkwayFt = 13;
        else if (state.location === "door4" && state.walkwayFt < 16) state.walkwayFt = 18;
        syncBlueprintWalkway(state.walkwayFt);
        render();
      });
    });
    host.querySelectorAll("[data-fire]").forEach(function (b) {
      b.addEventListener("click", function () { state.fireRating = b.getAttribute("data-fire"); render(); });
    });
    host.querySelectorAll("[data-bay]").forEach(function (b) {
      b.addEventListener("click", function () { state.joistBay = b.getAttribute("data-bay"); render(); });
    });

    function updateAtticWalkLive(rawFt) {
      var ft = Math.max(6, Math.min(24, Math.round(rawFt)));
      state.walkwayFt = ft;
      var pass = ft <= 20;
      var sheets = calcSheets(ft);
      var col = pass ? "#2f6b3f" : "#a8281c";
      var fillBg = pass ? "#e4f0e6" : "#f9e6e4";
      var route = computeStaggeredRoute(state.location, ft);
      var isDoor4 = state.location === "door4";

      var pBg = document.getElementById("attWalkPathBg");
      var pLn = document.getElementById("attWalkPathLn");
      var grp = document.getElementById("attPlatformDragHandle");
      var pill = document.getElementById("attWalkPill");
      var ptxt = document.getElementById("attWalkPillTxt");
      if (pBg) { pBg.setAttribute("d", route.dStr); pBg.setAttribute("stroke", col); }
      if (pLn) { pLn.setAttribute("d", route.dStr); pLn.setAttribute("stroke", col); }
      if (grp) {
        grp.setAttribute("transform", "translate(" + route.endPt.x + ", " + route.endPt.y + ")");
        grp.setAttribute("aria-valuenow", String(ft));
      }
      if (pill) { pill.setAttribute("fill", fillBg); pill.setAttribute("stroke", col); }
      if (ptxt) {
        ptxt.setAttribute("fill", col);
        ptxt.textContent = es
          ? (isDoor4 ? "Desde Puerta 4 (Ext.): " : "Desde Pasillo Interior: ") + ft + ' pies / 20 máx. (' + (pass ? "PASA ✓" : "EXCEDE ✗") + ') · ' + sheets + ' hojas 4×8 OSB 23/32" (NUNCA 3/8")'
          : (isDoor4 ? "From Ext. Door 4 Landing: " : "From Interior Hall: ") + ft + ' ft / 20 max (' + (pass ? "PASS ✓" : "OVER ✗") + ') · ' + sheets + ' shts 4×8 23/32" OSB (NEVER 3/8")';
      }

      var kW = document.getElementById("attKpiWalkVal");
      if (kW) { kW.className = "u4h-kpi-val " + (pass ? "is-ok" : "is-fail"); kW.textContent = ft + (es ? " pies / 20 máx." : " ft / 20 ft max"); }
      var kS = document.getElementById("attKpiSheetsVal");
      if (kS) kS.textContent = sheets + (es ? " hojas" : " sheets");
      var sv = document.getElementById("attWalkSliderVal");
      if (sv) sv.textContent = ft + (es ? " pies" : " ft");
      var slEl = document.getElementById("attWalkSlider");
      if (slEl) slEl.value = String(ft);
      var st = document.getElementById("attWalkStatus");
      if (st) {
        st.className = "u4h-status " + (pass ? "is-pass" : "is-fail");
        st.textContent = pass
          ? (es ? "✓ PASA (" + ft + " pies ≤ 20 pies) — Compra " + sheets + " hoja(s) de OSB 23/32\" o triplay 3/4\". NUNCA usar triplay de 3/8\"."
                : "✓ PASS (" + ft + " ft ≤ 20 ft max) — Plan " + sheets + " sheet(s) of 23/32\" OSB or 3/4\" structural ply. NEVER use 3/8\" ply.")
          : (es ? "✗ FALLA (" + ft + " pies > 20 pies) — Con 66\" de altura en ático el pasillo NO puede pasar de 20 pies. Acerca F1 o usa escotilla interior."
                : "✗ FAIL (" + ft + " ft > 20 ft max) — At 66\" attic height, walkway cannot exceed 20 ft. Place F1 closer or switch hatch to Interior Hall.");
      }
      syncBlueprintWalkway(ft);
    }

    var sl = document.getElementById("attWalkSlider");
    if (sl) {
      sl.addEventListener("input", function () { updateAtticWalkLive(parseFloat(sl.value) || 18); });
      sl.addEventListener("change", function () { render(); });
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
          var mx = ((ev.clientX - rect.left) / (rect.width || 480)) * 480;
          var my = ((ev.clientY - rect.top) / (rect.height || 286)) * 286;
          updateAtticWalkLive(projectSvgPointToFt(state.location, mx, my));
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
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); updateAtticWalkLive(state.walkwayFt + 1); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp")    { e.preventDefault(); updateAtticWalkLive(state.walkwayFt - 1); }
      });
    }

    host.querySelectorAll("[data-gate]").forEach(function (cb) {
      cb.addEventListener("change", function () { state.gates[cb.getAttribute("data-gate")] = cb.checked; render(); });
    });
    var eqBtn = document.getElementById("attEquipBtn");
    if (eqBtn) eqBtn.addEventListener("click", function () { state.equipOpen = !state.equipOpen; render(); });
    var logBtn = document.getElementById("attLogBtn");
    if (logBtn) logBtn.addEventListener("click", function () {
      if (window.U4LiveAi) window.U4LiveAi.openNote("Attic hatch field readings — spot=" + state.location + ", fireRating=" + state.fireRating + ", joistBay=" + state.joistBay + ", walkwayFt=" + state.walkwayFt + "ft: ");
    });
    var pBtn = document.getElementById("attPrevBtn");
    var nBtn = document.getElementById("attNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });

    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext();
    }
  }

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
        var map = { hatch: "spot", framing: "spot", plan: "spot", clearance: "walkway", sheets: "walkway", lid: "seal", checklist: "gates", holds: "gates" };
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
      if (act === "walkway_ft" || act === "walkway" || act === "walkway_length") {
        var ft = Math.max(6, Math.min(24, Math.round(Number(val))));
        if (!isFinite(ft)) return false;
        state.walkwayFt = ft;
        syncBlueprintWalkway(ft);
      } else if (act === "hatch_location" || act === "location" || act === "spot") {
        state.location = String(val).toLowerCase().indexOf("hall") >= 0 ? "hall" : "door4";
        syncBlueprintWalkway(state.walkwayFt);
      } else if (act === "fire_rating") {
        state.fireRating = String(val || "unknown");
      } else if (act === "joist_bay") {
        state.joistBay = String(val || "unknown");
      } else if (act === "reset") {
        state.location = "door4";
        state.walkwayFt = 18;
        state.fireRating = "unknown";
        state.joistBay = "unknown";
        syncBlueprintWalkway(18);
      } else {
        return false;
      }
      render();
      return true;
    },
    getState: function () {
      return {
        planId: "attic-hatch",
        step: state.step,
        wall: state.location === "door4" ? "exterior_door4_landing" : "interior_hallway",
        location: state.location,
        walkwayFt: state.walkwayFt,
        sheets: calcSheets(state.walkwayFt),
        fireRating: state.fireRating,
        joistBay: state.joistBay,
        summary: "Attic Hatch: step=" + state.step + ", location=" + state.location + ", lockedClear=24x36in, walkway=" + state.walkwayFt + "ft (" + calcSheets(state.walkwayFt) + " sheets)."
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
        titleEn: "Permanent Attic Hatch & Walkway",
        titleEs: "Escotilla Permanente del Ático y Pasillo",
        getContext: function () {
          return "Step=" + state.step + ", Spot=" + state.location + " (Door 4 exterior landing west of Entry Door 4 vs Interior Hallway), LockedClear=24x36in, FireRating=" + state.fireRating + ", JoistBayB=" + state.joistBay + ", WalkwayRun=" + state.walkwayFt + "ft staggered L-path (max 20ft at 66in attic height, " + calcSheets(state.walkwayFt) + " sheets 4x8 OSB/ply). Active roof leak + temp bedroom closet hold.";
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
