(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);

  // Canonical Locked Baseline (rev-20261124-bath-006)
  const SEED = {
    rev: "rev-20261124-bath-006",
    roomWidthIn: 72.125,
    roomDepthIn: 82.125,
    backerWidthIn: 69.3125,     // 69-5/16" North back wall corner-to-corner (IMG_5478)
    tubRimHeightIn: 22.0,       // 22" laid floor to top of stone tub rim (IMG_5473)
    backerAboveTubIn: 71.25,    // 71-1/4" tub rim to top of HardieBacker (~93-1/4" AFF)
    tubOuterDepthIn: 33.0,      // ~33" back wall to front face of stone waterfall apron (IMG_5488)
    eastTileStopIn: 35.0,       // LOCKED: 35" from North corner (33" field + 2" vertical bullnose)
    eastToiletStubIn: 37.75,    // ~37-1/2" to 38" copper toilet supply stub-out (IMG_5474)
    eastBackerEdgeIn: 39.0,     // ~39" HardieBacker seam to 1/2" drywall
    westSillStopIn: 35.0,       // LOCKED: 35" from North corner to wood sill tip
    westDoorwaySpanIn: 45.5,    // 45-1/2" doorway finished edge to sill stop (IMG_5491)
    westSillFloorIn: 43.0,      // 43" laid floor to sill bottom (21" above 22" tub rim)
    westCasingWidthIn: 5.25,    // 5-1/4" window casing (zero wall tile above 43" sill)
    largeNiche: { x0: 19.0, x1: 30.0, z0: 17.0, z1: 36.0, w: 11.0, h: 19.0, depth: null },
    smallNiche: { x0: 37.5, x1: 45.0, z0: 21.75, z1: 35.75, w: 7.5, h: 14.0, depth: null },
    plumbing: [
      { id: "spout", x: 15.5, z: 5.5, diam: 1.5, en: "Tub Spout", es: "Llave Tina" },
      { id: "valve", x: 15.5, z: 27.0, diam: 4.5, en: "Delta Arcadia Valve (4-1/2″ hole)", es: "Válvula Delta Arcadia (4-1/2″)" },
      { id: "arm", x: 15.5, z: 60.0, diam: 1.5, en: "Shower Arm", es: "Brazo Regadera" }
    ],
    wallTile: {
      sku: "002536MOD1P4",
      name: "American Olean 0025 Ice White 3″×6″ Glossy",
      actualW: 6.028,
      actualH: 3.012,
      groutIn: 0.0625,
      sqftPerBox: 12.5
    },
    bullnose: {
      sku: "0025S42691P4",
      cornerSku: "0025SN42691P2",
      wIn: 2.0,
      lenIn: 6.0
    },
    grout: {
      name: "Mapei Ultracolor Plus FA #77 Frost",
      silicone: "Mapei Mapesil T Plus 100% Silicone #77 Frost",
      stroke: "#CBD3D8"
    }
  };

  const STEPS = [
    { id: "cut-map", num: 1, en: "3-Wall Cut Map & Laser", es: "Corte 3 Muros y Láser" },
    { id: "niche-cuts", num: 2, en: "24″×48″ Niche Cut Sheet", es: "Corte 24″×48″ Nichos" },
    { id: "plumbing-stops", num: 3, en: "Plumbing & 35″ Stops", es: "Plomería y Topes 35″" },
    { id: "crew-steps", num: 4, en: "Steps 1–7 & Materials", es: "Pasos 1–7 y Materiales" }
  ];

  function safeGet(k) { try { return window.localStorage.getItem(k); } catch (_) { return null; } }
  function safeSet(k, v) { try { window.localStorage.setItem(k, v); } catch (_) {} }

  const state = {
    lang: params.get("lang") === "es" ? "es" : (safeGet("u4_lang") === "es" ? "es" : "en"),
    theme: params.get("theme") === "dark" ? "dark" : (safeGet("u4_theme") === "dark" ? "dark" : "light"),
    step: "cut-map",
    starterRowIn: 2.25,
    wastePct: 15,
    zoomPct: 100,
    inspectedId: "laser",
    checks: {
      levelTub: false,
      nicheMeasure: false,
      waterproofPhoto: false,
      valveDepth: false,
      medCabHold: false
    },
    lastScaleInfo: { view: "cut-map", scaleX: 3.3, scaleY: 3.3, uniform: true }
  };

  function fmtFrac(val) {
    if (val == null || !isFinite(val)) return "—";
    const sign = val < 0 ? "-" : "";
    const abs = Math.abs(val);
    let whole = Math.floor(abs + 1e-6);
    let sixteenths = Math.round((abs - whole) * 16);
    if (sixteenths === 16) { whole += 1; sixteenths = 0; }
    if (sixteenths === 0) return sign + whole + "″";
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const g = gcd(sixteenths, 16);
    return sign + (whole > 0 ? whole + "-" + (sixteenths / g) + "/" + (16 / g) : (sixteenths / g) + "/" + (16 / g)) + "″";
  }

  function showToast(msg) {
    const el = document.getElementById("u4Toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.hidden = true; }, 2400);
  }

  // ── EXACT MATHEMATICAL TILE & COURSE ENGINE ─────────────────────────────
  function computeLayout() {
    const tileW = SEED.wallTile.actualW;
    const tileH = SEED.wallTile.actualH;
    const grout = SEED.wallTile.groutIn;
    const pitchW = +(tileW + grout).toFixed(4); // 6.0905"
    const pitchH = +(tileH + grout).toFixed(4); // 3.0745"
    const topCapBotZ = SEED.backerAboveTubIn - SEED.bullnose.wIn; // 69.25"

    // Vertical courses (Course 1 = starter row above 0" tub rim)
    const joints = [0, state.starterRowIn];
    let z = state.starterRowIn;
    while (z + pitchH < topCapBotZ - 0.05) {
      z += pitchH;
      joints.push(+z.toFixed(3));
    }
    const courses = [];
    for (let i = 0; i < joints.length; i++) {
      const z0 = joints[i];
      const z1 = (i + 1 < joints.length) ? joints[i + 1] : topCapBotZ;
      courses.push({
        num: i + 1,
        z0: +z0.toFixed(2),
        z1: +z1.toFixed(2),
        h: +(z1 - z0).toFixed(2),
        isOdd: (i % 2 === 0)
      });
    }

    // North Back Wall (69-5/16"): Odd = 2-5/8" + 10 full + 5-11/16"; Even flips symmetrically
    const northW = SEED.backerWidthIn;
    const nOddL = +((northW - (10 * pitchW + grout)) * 0.318).toFixed(2); // ~2.65" (2-5/8")
    const nOddR = +(northW - nOddL - 10 * pitchW - grout).toFixed(2);    // ~5.67" (5-11/16")
    const northOddJoints = [];
    for (let x = nOddL; x < northW - 0.1; x += pitchW) northOddJoints.push(+x.toFixed(3));
    const northEvenJoints = [];
    for (let x = nOddR; x < northW - 0.1; x += pitchW) northEvenJoints.push(+x.toFixed(3));

    // East & West Walls (33" tiled field + 2" vertical bullnose = 35" stop)
    const sideW = 33.0;
    const sideOddJoints = [];
    for (let x = pitchW; x < sideW - 0.1; x += pitchW) sideOddJoints.push(+x.toFixed(3));
    const sOddEnd = +(sideW - 5 * pitchW).toFixed(2); // 2.55" (2-9/16")

    const sEvenStart = +(tileW / 2).toFixed(2); // 3.01" (3")
    const sideEvenJoints = [+(sEvenStart + grout).toFixed(3)];
    for (let x = sideEvenJoints[0] + pitchW; x < sideW - 0.1; x += pitchW) sideEvenJoints.push(+x.toFixed(3));
    const sEvenEnd = +(sideW - (sEvenStart + grout + 4 * pitchW)).toFixed(2); // 5.59" (5-9/16")

    // Map each plumbing fixture to exact course number(s)
    const plumbingHits = SEED.plumbing.map((p) => {
      const hitNums = courses
        .filter((c) => c.z1 >= p.z - p.diam / 2 && c.z0 <= p.z + p.diam / 2)
        .map((c) => c.num);
      return Object.assign({}, p, { courses: hitNums });
    });

    // Nearest joint to 36" shared niche top header
    let headerDelta = 99;
    let headerCourse = 12;
    courses.forEach((c) => {
      const d = Math.abs(36.0 - c.z1);
      if (d < headerDelta) { headerDelta = +d.toFixed(2); headerCourse = c.num; }
    });

    // Quantities (zero prices)
    const northSqft = (northW * 69.25 - SEED.largeNiche.w * SEED.largeNiche.h - SEED.smallNiche.w * SEED.smallNiche.h) / 144;
    const eastSqft = (33.0 * 69.25) / 144;
    const westSqft = (33.0 * 21.0) / 144;
    const returnsSqft = ((19 * 2 + 11) * 4 + (14 * 2 + 7.5) * 4) / 144;
    const netSqft = +(northSqft + eastSqft + westSqft + returnsSqft).toFixed(1);
    const grossSqft = +(netSqft * (1 + state.wastePct / 100)).toFixed(1);
    const cartons = Math.ceil(grossSqft / SEED.wallTile.sqftPerBox);

    const perimBullnoseIn = northW + 33.0 + (69.25 + 22.0) + (21.0 + 22.0);
    const nicheFrameIn = 2 * (SEED.largeNiche.w + SEED.largeNiche.h) + 2 * (SEED.smallNiche.w + SEED.smallNiche.h);
    const bullnosePcs = Math.ceil(((perimBullnoseIn + nicheFrameIn) / 6.0) * (1 + state.wastePct / 100));

    return {
      pitchW, pitchH, topCapBotZ, courses,
      north: { nOddL, nOddR, oddJoints: northOddJoints, evenJoints: northEvenJoints },
      side: { sOddEnd, sEvenStart, sEvenEnd, oddJoints: sideOddJoints, evenJoints: sideEvenJoints },
      plumbingHits,
      headerDelta,
      headerCourse,
      takeoff: { netSqft, grossSqft, cartons, bullnosePcs, cornerPcs: 10 }
    };
  }

  function renderVertJoints(joints, xOrigin, yTop, yBot, S, reverseDir) {
    let s = "";
    for (let i = 0; i < joints.length; i++) {
      const x = +(reverseDir ? (xOrigin - joints[i] * S) : (xOrigin + joints[i] * S)).toFixed(1);
      s += `<line x1="${x}" y1="${yTop}" x2="${x}" y2="${yBot}" stroke="${SEED.grout.stroke}" stroke-width="0.75"/>`;
    }
    return s;
  }

  // ── STEP 1 SVG: 1:1 UNFOLDED 3-WALL CUT MAP & LASER LINES ───────────────
  function buildStep1Svg(es, lay, forPrint) {
    const S = 3.3; // strict 1:1 uniform px/in
    if (!forPrint) state.lastScaleInfo = { view: "cut-map", scaleX: S, scaleY: S, uniform: true };

    const westSpan = 37.0;
    const northSpan = SEED.backerWidthIn;
    const eastSpan = 41.0;

    const xWest0 = 36;
    const xNW = +(xWest0 + westSpan * S).toFixed(1);
    const xNE = +(xNW + northSpan * S).toFixed(1);
    const xEastEnd = +(xNE + eastSpan * S).toFixed(1);

    const zTop = 78.0;
    const yZ = (zIn) => +(40 + (zTop - zIn) * S).toFixed(1);
    const yTopCap = yZ(71.25);
    const yCapBot = yZ(69.25);
    const yTub = yZ(0);
    const yFloor = yZ(-22.0);
    const ySill = yZ(21.0);
    const yLaser = yZ(state.starterRowIn);

    // Draw running-bond joints + shade end-cut strips so crew immediately sees cut widths!
    let gridSvg = "";
    lay.courses.forEach((c, idx) => {
      const yT = yZ(c.z1);
      const yB = yZ(c.z0);
      if (idx > 0) {
        gridSvg += `<line x1="${xNW}" y1="${yB}" x2="${(xNE + 33 * S).toFixed(1)}" y2="${yB}" stroke="${SEED.grout.stroke}" stroke-width="0.75"/>`;
        if (c.z0 <= 21.0) {
          gridSvg += `<line x1="${(xNW - 33 * S).toFixed(1)}" y1="${yB}" x2="${xNW}" y2="${yB}" stroke="${SEED.grout.stroke}" stroke-width="0.75"/>`;
        }
      }
      // Subtle tint on North corner cuts & East/West 33" end cuts
      const nL = c.isOdd ? lay.north.nOddL : lay.north.nOddR;
      const nR = c.isOdd ? lay.north.nOddR : lay.north.nOddL;
      const sEnd = c.isOdd ? lay.side.sOddEnd : lay.side.sEvenEnd;
      gridSvg += `<rect x="${xNW}" y="${yT}" width="${(nL * S).toFixed(1)}" height="${(yB - yT).toFixed(1)}" fill="#F2F7FA"/>`;
      gridSvg += `<rect x="${(xNE - nR * S).toFixed(1)}" y="${yT}" width="${(nR * S).toFixed(1)}" height="${(yB - yT).toFixed(1)}" fill="#F2F7FA"/>`;
      gridSvg += `<rect x="${(xNE + (33 - sEnd) * S).toFixed(1)}" y="${yT}" width="${(sEnd * S).toFixed(1)}" height="${(yB - yT).toFixed(1)}" fill="#F2F7FA"/>`;
      if (c.z0 < 21.0) {
        const yTW = c.z1 <= 21.0 ? yT : ySill;
        gridSvg += `<rect x="${(xNW - 33 * S).toFixed(1)}" y="${yTW}" width="${(sEnd * S).toFixed(1)}" height="${(yB - yTW).toFixed(1)}" fill="#F2F7FA"/>`;
      }
      gridSvg += renderVertJoints(c.isOdd ? lay.north.oddJoints : lay.north.evenJoints, xNW, yT, yB, S, false);
      gridSvg += renderVertJoints(c.isOdd ? lay.side.oddJoints : lay.side.evenJoints, xNE, yT, yB, S, false);
      if (c.z0 < 21.0) {
        gridSvg += renderVertJoints(c.isOdd ? lay.side.oddJoints : lay.side.evenJoints, xNW, c.z1 <= 21.0 ? yT : ySill, yB, S, true);
      }
    });

    const lgX = +(xNW + SEED.largeNiche.x0 * S).toFixed(1);
    const lgY = yZ(SEED.largeNiche.z1);
    const smX = +(xNW + SEED.smallNiche.x0 * S).toFixed(1);
    const smY = yZ(SEED.smallNiche.z1);
    const xPlumb = +(xNW + (SEED.backerWidthIn / 2) * S).toFixed(1);

    return `
      <svg viewBox="0 0 584 418" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="${es ? "Alzado desplegado 1:1 de los 3 muros de tina con cortes y líneas láser" : "True 1:1 unfolded 3-wall tub alcove cut map with laser lines"}">
        <defs>
          <pattern id="noTileHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#9A5B06" stroke-width="1.1" opacity="0.32"/>
          </pattern>
        </defs>

        <!-- Header & Compass -->
        <text x="16" y="18" font-size="10" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "ALZADO DESPLEGADO 1:1 · MAPA DE CORTES Y LÁSER" : "UNFOLDED 3-WALL CUT MAP & LASER LINES (TRUE 1:1)"}
        </text>
        <text x="568" y="18" text-anchor="end" font-size="8.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#5D686D">
          ${es ? "OESTE | NORTE (FONDO) | ESTE" : "WEST | NORTH (BACK) | EAST"}
        </text>

        <!-- Untiled Drywall Surround -->
        <rect x="${xWest0}" y="${yTopCap}" width="${(xEastEnd - xWest0).toFixed(1)}" height="${(yFloor - yTopCap).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9" stroke-width="0.9"/>

        <!-- West Upper No-Tile Window Zone -->
        <rect x="${(xNW - 35 * S).toFixed(1)}" y="${yTopCap}" width="${(35 * S).toFixed(1)}" height="${(ySill - yTopCap).toFixed(1)}" fill="url(#noTileHatch)" stroke="#9A5B06" stroke-width="1.1" stroke-dasharray="4 3"/>
        <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${((yTopCap + ySill) / 2).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" fill="#8F5305">${es ? "VENTANA + CHAMBRANA" : "WINDOW + CASING"}</text>
        <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${((yTopCap + ySill) / 2 + 11).toFixed(1)}" text-anchor="middle" font-size="7.2" fill="#8F5305">${es ? "(SIN AZULEJO)" : "(NO WALL TILE)"}</text>

        <!-- Tiled Field Backgrounds (White) -->
        <rect class="u4-svg-clickable" data-inspect="north" x="${xNW}" y="${yCapBot}" width="${(northSpan * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0" stroke-width="1"/>
        <rect class="u4-svg-clickable" data-inspect="east" x="${xNE}" y="${yCapBot}" width="${(33 * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0" stroke-width="1"/>
        <rect class="u4-svg-clickable" data-inspect="west" x="${(xNW - 33 * S).toFixed(1)}" y="${ySill}" width="${(33 * S).toFixed(1)}" height="${(yTub - ySill).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0" stroke-width="1"/>

        <!-- Exact Running-Bond Brick Grid & Shaded End Cuts -->
        ${gridSvg}

        <!-- Locked Zero-Metal 2"x6" Bullnose Borders + 2"x2" Corners -->
        <rect class="u4-svg-clickable" data-inspect="bullnose" x="${xNW}" y="${yTopCap}" width="${((northSpan + 33) * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A" stroke-width="1.1"/>
        <rect class="u4-svg-clickable" data-inspect="bullnose" x="${(xNE + 33 * S).toFixed(1)}" y="${yTopCap}" width="${(2 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#8EC6E2" stroke="#1F5F7A" stroke-width="1.2"/>
        <rect class="u4-svg-clickable" data-inspect="bullnose" x="${(xNE + 33 * S).toFixed(1)}" y="${yCapBot}" width="${(2 * S).toFixed(1)}" height="${(yFloor - yCapBot).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A" stroke-width="1.1"/>
        <rect class="u4-svg-clickable" data-inspect="bullnose" x="${(xNW - 35 * S).toFixed(1)}" y="${ySill}" width="${(2 * S).toFixed(1)}" height="${(yFloor - ySill).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A" stroke-width="1.1"/>
        <rect x="${(xNW - 35 * S - 2).toFixed(1)}" y="${(ySill - 4).toFixed(1)}" width="${(35 * S + 2).toFixed(1)}" height="4.5" fill="#C99E67" stroke="#6E471B" stroke-width="1"/>

        <!-- Both 1-Piece Glossy/Satin White Niches on North Wall -->
        <g class="u4-svg-clickable" data-inspect="left-niche">
          <rect x="${lgX}" y="${lgY}" width="${(SEED.largeNiche.w * S).toFixed(1)}" height="${(SEED.largeNiche.h * S).toFixed(1)}" fill="#F7FBFD" stroke="#1F5F7A" stroke-width="2"/>
          <text x="${(lgX + SEED.largeNiche.w * S / 2).toFixed(1)}" y="${(lgY + 26).toFixed(1)}" text-anchor="middle" font-size="7.2" font-weight="700" fill="#1F5F7A">1-PC</text>
          <text x="${(lgX + SEED.largeNiche.w * S / 2).toFixed(1)}" y="${(lgY + 37).toFixed(1)}" text-anchor="middle" font-size="6.8" font-family="IBM Plex Mono, monospace" fill="#1D2326">~11×19″</text>
        </g>
        <g class="u4-svg-clickable" data-inspect="right-niche">
          <rect x="${smX}" y="${smY}" width="${(SEED.smallNiche.w * S).toFixed(1)}" height="${(SEED.smallNiche.h * S).toFixed(1)}" fill="#F7FBFD" stroke="#1F5F7A" stroke-width="2"/>
          <text x="${(smX + SEED.smallNiche.w * S / 2).toFixed(1)}" y="${(smY + 21).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700" fill="#1F5F7A">1-PC</text>
          <text x="${(smX + SEED.smallNiche.w * S / 2).toFixed(1)}" y="${(smY + 31).toFixed(1)}" text-anchor="middle" font-size="6.4" font-family="IBM Plex Mono, monospace" fill="#1D2326">~7.5×14″</text>
        </g>

        <!-- East Wall Plumbing Penetration Targets -->
        ${lay.plumbingHits.map((p) => `
          <circle class="u4-svg-clickable" data-inspect="east" cx="${(xNE + p.x * S).toFixed(1)}" cy="${yZ(p.z)}" r="${p.id === "valve" ? 6.5 : 3.2}" fill="#E8C988" stroke="#8C5A12" stroke-width="1.3"/>
        `).join("")}

        <!-- Tub & Stone Waterfall Aprons (0" to -22") -->
        <rect x="${(xNW - 33 * S).toFixed(1)}" y="${yTub}" width="${((33 + northSpan + 33) * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E7ECEF" stroke="#5D686D" stroke-width="1.3"/>
        <text x="${xPlumb}" y="${(yTub + 38).toFixed(1)}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#1D2326">${es ? "TINA KOHLER + CUBIERTA DE PIEDRA (22″ DEL PISO)" : "KOHLER TUB + STONE DECK (22″ ABOVE FLOOR)"}</text>

        <!-- Corner Fold Lines (NW 0" and NE 69-5/16") -->
        <line x1="${xNW}" y1="${yTopCap - 6}" x2="${xNW}" y2="${yFloor + 6}" stroke="#1D2326" stroke-width="1.5" stroke-dasharray="5 3"/>
        <line x1="${xNE}" y1="${yTopCap - 6}" x2="${xNE}" y2="${yFloor + 6}" stroke="#1D2326" stroke-width="1.5" stroke-dasharray="5 3"/>

        <!-- BRIGHT RED LASER LINES: Horizontal Course-1 / Ledger Line + North Center Plumb Line -->
        <line class="u4-svg-clickable" data-inspect="laser" x1="${(xNW - 35 * S).toFixed(1)}" y1="${yLaser}" x2="${(xNE + 35 * S).toFixed(1)}" y2="${yLaser}" stroke="#C92A2A" stroke-width="1.6" stroke-dasharray="6 3"/>
        <line class="u4-svg-clickable" data-inspect="laser" x1="${xPlumb}" y1="${yTopCap}" x2="${xPlumb}" y2="${yTub}" stroke="#C92A2A" stroke-width="1.2" stroke-dasharray="4 3"/>
        <rect x="${(xPlumb - 48).toFixed(1)}" y="${(yLaser - 13).toFixed(1)}" width="96" height="12" rx="3" fill="#C92A2A"/>
        <text x="${xPlumb}" y="${(yLaser - 4.5).toFixed(1)}" text-anchor="middle" font-size="7.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#FFFFFF">
          ${es ? `LÁSER ${fmtFrac(state.starterRowIn)}` : `LASER ${fmtFrac(state.starterRowIn)}`}
        </text>

        <!-- Floor Datum & Running Dimension Callouts -->
        <line x1="22" y1="${yFloor}" x2="552" y2="${yFloor}" stroke="#1D2326" stroke-width="1.8"/>
        <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="8.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">← 35″ WEST</text>
        <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${(yFloor + 25).toFixed(1)}" text-anchor="middle" font-size="6.8" font-family="IBM Plex Mono, monospace" fill="#5D686D">(33″ + 2″ trim)</text>
        <text x="${xPlumb}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="8.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">69-5/16″ NORTH</text>
        <text x="${xPlumb}" y="${(yFloor + 25).toFixed(1)}" text-anchor="middle" font-size="6.8" font-family="IBM Plex Mono, monospace" fill="#5D686D">(50% running bond)</text>
        <text x="${(xNE + 17.5 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="8.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">35″ EAST →</text>
        <text x="${(xNE + 17.5 * S).toFixed(1)}" y="${(yFloor + 25).toFixed(1)}" text-anchor="middle" font-size="6.8" font-family="IBM Plex Mono, monospace" fill="#5D686D">(33″ + 2″ trim)</text>
        <text x="${(xNW - 35 * S - 5).toFixed(1)}" y="${((ySill + yFloor) / 2).toFixed(1)}" text-anchor="end" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">43″</text>
        <text x="${(xNE + 36 * S + 4).toFixed(1)}" y="${((yTopCap + yTub) / 2).toFixed(1)}" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">71-1/4″</text>
      </svg>
    `;
  }

  // ── STEP 2 SVG: 24"x48" WET-SAW CUT SHEET + 4-STEP HIDDEN-EDGE SECTION ──
  function buildStep2Svg(es, forPrint) {
    // Left: 24" x 48" tile at exact 1:1 scale S = 5.4 px/in (48" = 259.2px, 24" = 129.6px)
    const S = 5.4;
    if (!forPrint) state.lastScaleInfo = { view: "niche-cuts", scaleX: S, scaleY: S, uniform: true };
    const ox = 24;
    const oy = 56;
    const w48 = +(48 * S).toFixed(1);
    const h24 = +(24 * S).toFixed(1);

    // Piece A: Left Niche Back 11" wide x 19" tall -> rotated 19" along 48" length x 11" along 24" height
    const aW = +(19 * S).toFixed(1);
    const aH = +(11 * S).toFixed(1);
    // Piece B: Right Niche Back 7.5" wide x 14" tall -> 14" along 48" length x 7.5" along 24" height
    const bX = +(ox + aW + 3).toFixed(1);
    const bW = +(14 * S).toFixed(1);
    const bH = +(7.5 * S).toFixed(1);
    // Piece C: Left Niche Sill (11" x 4.5") below Piece A
    const cY = +(oy + aH + 3).toFixed(1);
    const cW = +(11 * S).toFixed(1);
    const cH = +(4.5 * S).toFixed(1);
    // Piece D: Right Niche Sill (7.5" x 4.5") next to Piece C
    const dX = +(ox + cW + 3).toFixed(1);
    const dW = +(7.5 * S).toFixed(1);
    const dH = +(4.5 * S).toFixed(1);

    return `
      <svg viewBox="0 0 580 236" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="${es ? "Diagrama de corte de 1 azulejo 24x48 y corte lateral de armado en 4 pasos" : "Single 24x48 tile wet-saw cut sheet and 4-step hidden-edge cross section"}">
        <!-- LEFT PANEL: 24" x 48" WET-SAW CUT DIAGRAM -->
        <text x="20" y="20" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "1. CORTE EN SIERRA HÚMEDA · 1 PIEZA 24″×48″ (1:1)" : "1. WET-SAW CUT SHEET · ONE 24″×48″ TILE (1:1)"}
        </text>
        <text x="20" y="33" font-size="8" fill="#5D686D">
          ${es ? "Porcelanato Blanco Brillante/Satín (~5/16″–3/8″) · 1 pieza da ambos fondos + repisas" : "Glossy/Satin White Porcelain (~5/16″–3/8″) · 1 tile yields BOTH backs + sills"}
        </text>

        <!-- Full 24x48 Slab Outline -->
        <rect x="${ox}" y="${oy}" width="${w48}" height="${h24}" fill="#EDF2F4" stroke="#5D686D" stroke-width="1.4" stroke-dasharray="4 2"/>
        <text x="${(ox + w48 / 2).toFixed(1)}" y="${(oy - 6).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1D2326">← 48″ (actual ~47.2″) →</text>
        <text x="${(ox - 6).toFixed(1)}" y="${(oy + h24 / 2).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1D2326" transform="rotate(-90 ${ox - 6} ${oy + h24 / 2})">24″</text>

        <!-- Piece A: Left Niche Back -->
        <rect x="${ox}" y="${oy}" width="${aW}" height="${aH}" fill="#FFFFFF" stroke="#1F5F7A" stroke-width="1.8"/>
        <text x="${(ox + aW / 2).toFixed(1)}" y="${(oy + aH / 2 - 3).toFixed(1)}" text-anchor="middle" font-size="8.2" font-weight="700" fill="#1F5F7A">${es ? "A: FONDO IZQ." : "A: LEFT BACK"}</text>
        <text x="${(ox + aW / 2).toFixed(1)}" y="${(oy + aH / 2 + 9).toFixed(1)}" text-anchor="middle" font-size="7.6" font-family="IBM Plex Mono, monospace" fill="#1D2326">~11″ × 19″</text>

        <!-- Piece B: Right Niche Back -->
        <rect x="${bX}" y="${oy}" width="${bW}" height="${bH}" fill="#FFFFFF" stroke="#1F5F7A" stroke-width="1.8"/>
        <text x="${(bX + bW / 2).toFixed(1)}" y="${(oy + bH / 2 - 2).toFixed(1)}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#1F5F7A">${es ? "B: FONDO DER." : "B: RIGHT BACK"}</text>
        <text x="${(bX + bW / 2).toFixed(1)}" y="${(oy + bH / 2 + 9).toFixed(1)}" text-anchor="middle" font-size="7.2" font-family="IBM Plex Mono, monospace" fill="#1D2326">~7-1/2″ × 14″</text>

        <!-- Piece C: Left Sill -->
        <rect x="${ox}" y="${cY}" width="${cW}" height="${cH}" fill="#E4F0E6" stroke="#2F6B3F" stroke-width="1.5"/>
        <text x="${(ox + cW / 2).toFixed(1)}" y="${(cY + cH / 2 + 3).toFixed(1)}" text-anchor="middle" font-size="6.8" font-weight="700" fill="#2F6B3F">${es ? "C: REPISA IZQ." : "C: LEFT SILL"}</text>

        <!-- Piece D: Right Sill -->
        <rect x="${dX}" y="${cY}" width="${dW}" height="${dH}" fill="#E4F0E6" stroke="#2F6B3F" stroke-width="1.5"/>
        <text x="${(dX + dW / 2).toFixed(1)}" y="${(cY + dH / 2 + 3).toFixed(1)}" text-anchor="middle" font-size="6.4" font-weight="700" fill="#2F6B3F">${es ? "D: DER." : "D: R-SILL"}</text>

        <!-- Spare Margin Label -->
        <text x="${(ox + w48 - 34).toFixed(1)}" y="${(oy + h24 - 16).toFixed(1)}" text-anchor="middle" font-size="7.2" fill="#5D686D">${es ? "SOBRANTE" : "SPARE"}</text>
        <text x="${(ox + w48 - 34).toFixed(1)}" y="${(oy + h24 - 6).toFixed(1)}" text-anchor="middle" font-size="6.8" font-family="IBM Plex Mono, monospace" fill="#5D686D">&gt;14″</text>

        <text x="20" y="206" font-size="7.6" font-weight="700" fill="#9A5B06">
          ${es ? "MEDIR ANCHO/ALTO IMPERMEABILIZADO ANTES DE CORTAR (1/8″ holgura)" : "MEASURE WATERPROOFED OPENING BEFORE CUTTING (1/8″ clearance)"}
        </text>

        <!-- RIGHT PANEL: 4-STEP HIDDEN-EDGE CROSS-SECTION -->
        <rect x="304" y="8" width="264" height="218" rx="6" fill="#F8FAF9" stroke="#C5CCC9" stroke-width="1"/>
        <text x="316" y="25" font-size="9.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "2. CORTE LATERAL · CANTOS OCULTOS" : "2. CROSS-SECTION · HIDDEN CUT EDGES"}
        </text>

        <!-- Wall Framing + Waterproofing (1) -->
        <rect x="320" y="42" width="18" height="148" fill="#EFE6D8" stroke="#A6947D"/>
        <line x1="339" y1="42" x2="339" y2="190" stroke="#C92A2A" stroke-width="2.5"/>
        <!-- 1-Piece Back Panel SET FIRST (2) -->
        <rect x="342" y="54" width="11" height="122" fill="#FFFFFF" stroke="#1F5F7A" stroke-width="1.8"/>
        <!-- Top Jamb Return Lapping IN FRONT of Back Panel (4) -->
        <rect x="353" y="54" width="66" height="11" fill="#D6ECF8" stroke="#1F5F7A" stroke-width="1.4"/>
        <!-- Bottom 1-Piece Sill SLOPED 1/4"/ft toward tub (3) -->
        <polygon points="353,164 422,169 422,180 353,176" fill="#E4F0E6" stroke="#2F6B3F" stroke-width="1.6"/>
        <!-- 100% Silicone Beads at Inside 90° Corners -->
        <circle cx="353" cy="65" r="3.2" fill="#2F6B3F"/>
        <circle cx="353" cy="164" r="3.2" fill="#2F6B3F"/>

        <!-- Numbered Crew Callouts -->
        <text x="434" y="58" font-size="7.8" font-weight="700" fill="#C92A2A">① ${es ? "Membrana continua" : "Waterproof first"}</text>
        <text x="434" y="84" font-size="7.8" font-weight="700" fill="#1F5F7A">② ${es ? "Fondo 1 pza PRIMERO" : "1-pc back FIRST"}</text>
        <text x="434" y="100" font-size="7.2" fill="#5D686D">${es ? "Canto cortado atrás" : "Cut edge trapped behind"}</text>
        <text x="434" y="128" font-size="7.8" font-weight="700" fill="#2F6B3F">③ ${es ? "Repisa 1/4″/pie" : "Sill sloped 1/4″/ft"}</text>
        <text x="434" y="142" font-size="7.2" fill="#5D686D">${es ? "Desagua hacia tina" : "Drains into tub"}</text>
        <text x="434" y="168" font-size="7.8" font-weight="700" fill="#1F5F7A">④ ${es ? "Retornos DELANTE" : "Jambs IN FRONT"}</text>
        <text x="434" y="182" font-size="7.2" fill="#2F6B3F">${es ? "+ 100% silicón #77" : "+ 100% #77 silicone"}</text>
      </svg>
    `;
  }

  // ── STEP 3 SVG: EAST PLUMBING HOLE MAP + WEST 43" SILL WRAP (1:1) ───────
  function buildStep3Svg(es, lay, forPrint) {
    const S = 3.2;
    if (!forPrint) state.lastScaleInfo = { view: "plumbing-stops", scaleX: S, scaleY: S, uniform: true };

    const zTop = 76.0;
    const yZ = (zIn) => +(42 + (zTop - zIn) * S).toFixed(1);
    const yTopCap = yZ(71.25);
    const yCapBot = yZ(69.25);
    const yTub = yZ(0);
    const yFloor = yZ(-22.0);
    const ySill = yZ(21.0);

    const ex0 = 32; // East 0" (North corner)
    const wxCorner = 540; // West 0" (North corner on right, going left to 35" sill)
    const wxStop = +(wxCorner - 35 * S).toFixed(1);
    const wxApron = +(wxCorner - 33 * S).toFixed(1);

    let eastGrid = "";
    let westGrid = "";
    lay.courses.forEach((c, idx) => {
      const yT = yZ(c.z1);
      const yB = yZ(c.z0);
      if (idx > 0) {
        eastGrid += `<line x1="${ex0}" y1="${yB}" x2="${(ex0 + 33 * S).toFixed(1)}" y2="${yB}" stroke="${SEED.grout.stroke}" stroke-width="0.75"/>`;
        if (c.z0 <= 21.0) {
          westGrid += `<line x1="${wxApron}" y1="${yB}" x2="${wxCorner}" y2="${yB}" stroke="${SEED.grout.stroke}" stroke-width="0.75"/>`;
        }
      }
      eastGrid += renderVertJoints(c.isOdd ? lay.side.oddJoints : lay.side.evenJoints, ex0, yT, yB, S, false);
      if (c.z0 < 21.0) {
        westGrid += renderVertJoints(c.isOdd ? lay.side.oddJoints : lay.side.evenJoints, wxCorner, c.z1 <= 21.0 ? yT : ySill, yB, S, true);
      }
    });

    const plumbMarks = lay.plumbingHits.map((p) => {
      const cx = +(ex0 + p.x * S).toFixed(1);
      const cy = yZ(p.z);
      const r = p.id === "valve" ? 7.2 : 3.5;
      const cLabel = p.courses.length > 1 ? `C${p.courses[0]}–C${p.courses[p.courses.length - 1]}` : `C${p.courses[0] || "?"}`;
      return `
        <line x1="${ex0}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="#C92A2A" stroke-width="0.9" stroke-dasharray="3 2"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#F2D492" stroke="#9A5B06" stroke-width="1.5"/>
        <rect x="${(ex0 + 37 * S).toFixed(1)}" y="${(cy - 9).toFixed(1)}" width="122" height="18" rx="4" fill="#FFF8EB" stroke="#9A5B06" stroke-width="0.9"/>
        <text x="${(ex0 + 37 * S + 5).toFixed(1)}" y="${(cy + 3).toFixed(1)}" font-size="7.1" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#7A4404">
          ${cLabel} · Z=${fmtFrac(p.z)} (${es ? p.es.split(" ")[0] : p.en.split(" ")[0]})
        </text>
      `;
    }).join("");

    return `
      <svg viewBox="0 0 572 392" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="${es ? "Mapa de perforaciones de plomería muro Este y remate bajo repisa 43 muro Oeste" : "East control wall plumbing hole map and West 43-inch sill wrap"}">
        <defs>
          <pattern id="wHatch3" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#9A5B06" stroke-width="1.1" opacity="0.32"/>
          </pattern>
        </defs>

        <!-- LEFT: EAST CONTROL WALL -->
        <text x="${ex0}" y="18" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "MURO ESTE · PERFORACIONES (X=15-1/2″)" : "EAST CONTROL WALL · HOLE MAP (X=15-1/2″)"}
        </text>
        <text x="${ex0}" y="30" font-size="7.8" fill="#5D686D">
          ${es ? "Tope 35″ (33″ + 2″ bullnose) · Libra WC (~38″) y junta (~39″)" : "35″ stop (33″ field + 2″ bullnose) · Clears ~38″ WC stub"}
        </text>

        <rect x="${ex0}" y="${yTopCap}" width="${(41 * S).toFixed(1)}" height="${(yFloor - yTopCap).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9"/>
        <rect x="${ex0}" y="${yCapBot}" width="${(33 * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
        ${eastGrid}
        <!-- Bullnose 2x6 + 2x2 Corner -->
        <rect x="${ex0}" y="${yTopCap}" width="${(33 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
        <rect x="${(ex0 + 33 * S).toFixed(1)}" y="${yTopCap}" width="${(2 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#8EC6E2" stroke="#1F5F7A"/>
        <rect x="${(ex0 + 33 * S).toFixed(1)}" y="${yCapBot}" width="${(2 * S).toFixed(1)}" height="${(yFloor - yCapBot).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
        <!-- Stone Apron -->
        <rect x="${ex0}" y="${yTub}" width="${(33 * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E7ECEF" stroke="#5D686D" stroke-width="1.3"/>
        <text x="${(ex0 + 16.5 * S).toFixed(1)}" y="${(yTub + 34).toFixed(1)}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#1D2326">~33″ STONE APRON</text>
        <!-- Plumbing Hole Targets & Course Labels -->
        ${plumbMarks}
        <!-- WC Stub & Hardie Seam -->
        <line x1="${(ex0 + 39 * S).toFixed(1)}" y1="${yTopCap}" x2="${(ex0 + 39 * S).toFixed(1)}" y2="${yFloor}" stroke="#9A5B06" stroke-dasharray="3 2"/>
        <circle cx="${(ex0 + 37.75 * S).toFixed(1)}" cy="${yZ(-14)}" r="3.2" fill="#C86D3B" stroke="#1D2326"/>
        <line x1="${ex0 - 6}" y1="${yFloor}" x2="${(ex0 + 42 * S).toFixed(1)}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.8"/>
        <text x="${(ex0 + 17.5 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">0″ — 35″ STOP →</text>

        <!-- RIGHT: WEST WINDOW WALL -->
        <text x="${wxStop}" y="18" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "MURO OESTE · BAJO REPISA 43″" : "WEST WALL · UNDER 43″ SILL"}
        </text>
        <text x="${wxStop}" y="30" font-size="7.8" fill="#5D686D">
          ${es ? "Solo Hiladas 1–7 · Cero azulejo arriba" : "Courses 1–7 ONLY · Zero tile above sill"}
        </text>

        <rect x="${wxStop}" y="${yTopCap}" width="${(35 * S).toFixed(1)}" height="${(ySill - yTopCap).toFixed(1)}" fill="url(#wHatch3)" stroke="#9A5B06" stroke-dasharray="4 3"/>
        <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${((yTopCap + ySill) / 2).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" fill="#8F5305">${es ? "VENTANA + 5-1/4″" : "WINDOW + 5-1/4″"}</text>
        <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${((yTopCap + ySill) / 2 + 12).toFixed(1)}" text-anchor="middle" font-size="7.2" fill="#8F5305">${es ? "(SIN AZULEJO)" : "(NO WALL TILE)"}</text>

        <rect x="${wxApron}" y="${ySill}" width="${(33 * S).toFixed(1)}" height="${(yTub - ySill).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
        ${westGrid}
        <rect x="${wxStop}" y="${ySill}" width="${(2 * S).toFixed(1)}" height="${(yFloor - ySill).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
        <rect x="${wxStop - 2}" y="${ySill - 4}" width="${(35 * S + 2).toFixed(1)}" height="4.5" fill="#C99E67" stroke="#6E471B"/>
        <rect x="${wxApron}" y="${yTub}" width="${(33 * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E7ECEF" stroke="#5D686D" stroke-width="1.3"/>
        <line x1="${wxStop - 6}" y1="${yFloor}" x2="${wxCorner + 6}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.8"/>
        <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">← 35″ SILL — 0″</text>
        <text x="${wxStop - 5}" y="${((ySill + yFloor) / 2).toFixed(1)}" text-anchor="end" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">43″</text>
      </svg>
    `;
  }

  function buildCrewSteps(es, lay) {
    const lastC = lay.courses[lay.courses.length - 1];
    const startCut = fmtFrac(state.starterRowIn);
    const topCut = fmtFrac(lastC.h);
    return [
      {
        num: 1,
        dim: `Laser Z = ${startCut} · Plumb X = 34-5/8″`,
        enT: "Check Tub Level, Waterproofing & Snap Laser Lines",
        esT: "Nivelar Tina, Impermeabilizar y Trazar Láser",
        en: `Check tub rim high/low points and photograph continuous waterproofing. Snap horizontal laser at ${startCut} above highest rim point (1/8″ silicone gap at tub) and vertical plumb line at 34-5/8″ North center.`,
        es: `Revisar nivel de la tina y fotografiar impermeabilización continua. Trazar láser horizontal a ${startCut} sobre el punto alto de la tina (1/8″ para silicón) y plomo vertical al centro Norte (34-5/8″).`
      },
      {
        num: 2,
        dim: `24″×48″ White · Slope 1/4″/ft`,
        enT: "Cut & Set 1-Piece Niche Backs & Sloped Sills FIRST",
        esT: "Cortar y Pegar Fondos 1 Pieza y Repisas PRIMERO",
        en: `Measure waterproofed niche openings, then slice one 24″×48″ Glossy/Satin White porcelain tile into Left Back (~11″×19″), Right Back (~7-1/2″×14″), and both 1-piece sills. Set back panels FIRST, sills sloped 1/4″/ft into tub, then lap jamb returns IN FRONT of backs so all 4 cut edges are hidden.`,
        es: `Medir nichos impermeabilizados y cortar un porcelanato Blanco 24″×48″ para Fondo Izq. (~11″×19″), Fondo Der. (~7-1/2″×14″) y ambas repisas. Pegar fondos PRIMERO, repisas con pendiente 1/4″/pie y retornos DELANTE del fondo para ocultar los 4 cantos.`
      },
      {
        num: 3,
        dim: `N: ${fmtFrac(lay.north.nOddL)} + 10×6″ + ${fmtFrac(lay.north.nOddR)}`,
        enT: "Tile North Back Wall (23 Courses · Zero Slivers)",
        esT: "Pegar Muro Norte (23 Hiladas · Cero Tiras)",
        en: `Odd courses: ${fmtFrac(lay.north.nOddL)} NW + 10 full 6″ tiles + ${fmtFrac(lay.north.nOddR)} NE. Even courses flip (${fmtFrac(lay.north.nOddR)} NW + 10 full + ${fmtFrac(lay.north.nOddL)} NE). Course ${lay.headerCourse} lands cleanly on the ~36″ shared niche top; Course ${lastC.num} finishes at ${topCut} under the 69-1/4″ cap line.`,
        es: `Impares: ${fmtFrac(lay.north.nOddL)} NO + 10 enteras 6″ + ${fmtFrac(lay.north.nOddR)} NE. Pares invierten (${fmtFrac(lay.north.nOddR)} NO + 10 enteras + ${fmtFrac(lay.north.nOddL)} NE). Hilada ${lay.headerCourse} alinea con dintel ~36″; Hilada ${lastC.num} remata en ${topCut} a 69-1/4″.`
      },
      {
        num: 4,
        dim: `X=15-1/2″ · C2 Spout · C9–10 Valve · C20 Arm`,
        enT: "Tile East Control Wall & Core Plumbing Holes",
        esT: "Pegar Muro Este y Perforar Salidas de Plomería",
        en: `Odd courses start full 6″ at 0″ North corner (5 full + ${fmtFrac(lay.side.sOddEnd)} at 33″); even courses start ${fmtFrac(lay.side.sEvenStart)} (4 full + ${fmtFrac(lay.side.sEvenEnd)} at 33″). Core X=15-1/2″ holes at Z=5-1/2″ (Course 2), Z=27″ (Courses 9–10, 4-1/2″ Delta valve), and Z=60″ (Course 20).`,
        es: `Impares inician con entera 6″ en rincón 0″ (5 enteras + ${fmtFrac(lay.side.sOddEnd)} en 33″); pares inician ${fmtFrac(lay.side.sEvenStart)} (4 enteras + ${fmtFrac(lay.side.sEvenEnd)} en 33″). Perforar en X=15-1/2″ a Z=5-1/2″ (Hilada 2), Z=27″ (Hiladas 9–10, válvula 4-1/2″) y Z=60″ (Hilada 20).`
      },
      {
        num: 5,
        dim: `West: Courses 1–7 ONLY (0″→21″ above tub)`,
        enT: "Tile West Lower Wrap Under 43″ Window Sill",
        esT: "Pegar Muro Oeste Solo Bajo Repisa 43″",
        en: `Match East horizontal cuts (33″ field + 2″ vertical bullnose to 35″ sill tip) for Courses 1–7 ONLY beneath the 43″ sill. Stop completely at the sill underside — zero wall tile in the upper window/5-1/4″ casing zone.`,
        es: `Repetir cortes horizontales del Este (33″ + 2″ bullnose hasta punta 35″) solo en Hiladas 1–7 bajo la repisa de 43″. Cero azulejo arriba de la repisa (ventana y chambrana 5-1/4″ se reemplazan).`
      },
      {
        num: 6,
        dim: `${lay.takeoff.bullnosePcs} × 2″×6″ · 10 × 2″×2″ Corners`,
        enT: "Set Zero-Metal 2″×6″ Surface Bullnose & 2″×2″ Corners",
        esT: "Instalar Bullnose 2″×6″ y Esquinas 2″×2″ (Cero Metal)",
        en: `Cap 69-1/4″→71-1/4″ across North & East with 0025S42691P4 2″×6″ bullnose + 0025SN42691P2 2″×2″ corners. Drop vertical 2″×6″ bullnose from 33″→35″ down East & West apron legs (3 full 6″ + 4″ cut above baseboard) and frame both niches.`,
        es: `Rematar 69-1/4″→71-1/4″ en Norte y Este con bullnose 0025S42691P4 2″×6″ y esquinas 0025SN42691P2 2″×2″. Bajar bullnose vertical 33″→35″ junto a la piedra en Este y Oeste (3 enteras 6″ + corte 4″ al zoclo) y enmarcar nichos.`
      },
      {
        num: 7,
        dim: `1/16″ Joint · Mapei #77 Frost + 100% Silicone`,
        enT: "Grout Flat Walls & Silicone All 90° Wet Corners",
        esT: "Emboquillar Muros y Sellar Esquinas 90° con Silicón",
        en: `After 24h cure, grout flat 1/16″ joints with Mapei Ultracolor Plus FA #77 Frost (1 × 10-lb bag). Leave all 90° inside wall corners, tub deck, niche seams, and 33″ stone apron corner free of hard grout and seal with Mapesil T Plus #77 Frost 100% silicone.`,
        es: `Tras 24 h, emboquillar juntas planas de 1/16″ con Mapei Ultracolor Plus FA #77 Frost (1 saco 10 lb). Dejar esquinas internas 90°, unión con tina, nichos y canto de piedra 33″ libres de boquilla dura y sellar con silicón 100% Mapesil T Plus #77 Frost.`
      }
    ];
  }

  function inspectText(es, lay) {
    const id = state.inspectedId;
    const map = {
      laser: {
        en: `LASER SETUP: Horizontal ledger line at Z = ${fmtFrac(state.starterRowIn)} above highest tub rim (1/8″ gap at tub) · Vertical plumb line at X = 34-5/8″ (North center).`,
        es: `TRAZO LÁSER: Línea horizontal a Z = ${fmtFrac(state.starterRowIn)} sobre el punto alto de la tina (1/8″ holgura) · Plomo vertical a X = 34-5/8″ (centro Norte).`
      },
      north: {
        en: `NORTH WALL (69-5/16″ × 71-1/4″): Odd rows = ${fmtFrac(lay.north.nOddL)} NW + 10 full 6″ + ${fmtFrac(lay.north.nOddR)} NE · Even rows flip (${fmtFrac(lay.north.nOddR)} NW + 10 full + ${fmtFrac(lay.north.nOddL)} NE). Zero slivers.`,
        es: `MURO NORTE (69-5/16″ × 71-1/4″): Impares = ${fmtFrac(lay.north.nOddL)} NO + 10 enteras 6″ + ${fmtFrac(lay.north.nOddR)} NE · Pares invierten. Cero tiras delgadas.`
      },
      east: {
        en: `EAST WALL (33″ field + 2″ bullnose = 35″ stop): Odd = 5 full + ${fmtFrac(lay.side.sOddEnd)} · Even = ${fmtFrac(lay.side.sEvenStart)} + 4 full + ${fmtFrac(lay.side.sEvenEnd)}. Holes at X=15-1/2″: C2 spout, C9–10 valve, C20 shower arm.`,
        es: `MURO ESTE (33″ + 2″ bullnose = 35″): Impares = 5 enteras + ${fmtFrac(lay.side.sOddEnd)} · Pares = ${fmtFrac(lay.side.sEvenStart)} + 4 enteras + ${fmtFrac(lay.side.sEvenEnd)}. Perforaciones X=15-1/2″: H2 tina, H9–10 válvula, H20 regadera.`
      },
      west: {
        en: `WEST WALL (35″ stop, 43″ floor to sill): Tile Courses 1–7 ONLY under wood sill (0″→21″ above tub). Zero wall tile above sill (window + 5-1/4″ casing replaced separately).`,
        es: `MURO OESTE (tope 35″, 43″ piso a repisa): Pegar solo Hiladas 1–7 bajo repisa (0″→21″ sobre tina). Cero azulejo arriba de la repisa.`
      },
      "left-niche": {
        en: `LEFT NICHE (~11″×19″ at X=19″→30″, Z=17″→36″): 1-piece back + 1/4″/ft sloped sill cut from 24″×48″ White porcelain. Set back FIRST; top aligns with Course ${lay.headerCourse}.`,
        es: `NICHO IZQ. (~11″×19″ en X=19″→30″, Z=17″→36″): Fondo 1 pieza + repisa 1/4″/pie de porcelanato Blanco 24″×48″. Pegar fondo PRIMERO; dintel alinea con Hilada ${lay.headerCourse}.`
      },
      "right-niche": {
        en: `RIGHT NICHE (~7-1/2″×14″ at X=37-1/2″→45″, Z=21-3/4″→35-3/4″): 1-piece back + 1/4″/ft sloped sill from same 24″×48″ tile. Set back FIRST so returns hide cut edges.`,
        es: `NICHO DER. (~7-1/2″×14″ en X=37-1/2″→45″, Z=21-3/4″→35-3/4″): Fondo 1 pieza + repisa 1/4″/pie de la misma pieza 24″×48″. Pegar fondo PRIMERO.`
      },
      bullnose: {
        en: `ZERO-METAL TRIM: 0025S42691P4 2″×6″ bullnose (${lay.takeoff.bullnosePcs} pcs w/ +${state.wastePct}%) + 0025SN42691P2 2″×2″ corners (10 pcs). 22″ apron legs = 3 full 6″ + 4″ bottom cut.`,
        es: `REMATE CERO METAL: Bullnose 0025S42691P4 2″×6″ (${lay.takeoff.bullnosePcs} pzs con +${state.wastePct}%) + 10 esquinas 2″×2″. Bajada 22″ = 3 enteras 6″ + corte 4″.`
      }
    };
    const item = map[id] || map.laser;
    return es ? item.es : item.en;
  }

  function renderAll() {
    const es = state.lang === "es";
    document.documentElement.lang = es ? "es-MX" : "en";
    document.documentElement.setAttribute("data-theme", state.theme);
    const lay = computeLayout();
    const lastC = lay.courses[lay.courses.length - 1];
    const stepIdx = STEPS.findIndex((s) => s.id === state.step);
    const prevS = stepIdx > 0 ? STEPS[stepIdx - 1] : null;
    const nextS = stepIdx < STEPS.length - 1 ? STEPS[stepIdx + 1] : null;

    const app = document.getElementById("u4App");
    if (!app) return;

    const topbar = `
      <header class="u4-topbar">
        <div class="u4-topbar-left">
          <a class="u4-back-link" href="../../#bathroom">← ${es ? "Baño" : "Bathroom"}</a>
          <span class="u4-top-title">${es ? "Azulejo Baño — Plano de Obra" : "Bathroom Wall Tile — Field Plan"}</span>
        </div>
        <div class="u4-topbar-right">
          <button type="button" class="u4-pill-btn" id="u4LangBtn">${es ? "EN | <strong>ES</strong>" : "<strong>EN</strong> | ES"}</button>
          <button type="button" class="u4-pill-btn" id="u4ThemeBtn">${state.theme === "dark" ? "☀ Light" : "☾ Dark"}</button>
          <button type="button" class="u4-pill-btn primary" id="u4PrintBtn">${es ? "Imprimir 2 Págs." : "Print 2-Page PDF"}</button>
        </div>
      </header>
      <nav class="u4-steps-bar" aria-label="${es ? "Pasos de instalación" : "Build steps"}">
        ${STEPS.map((s) => `
          <button type="button" class="u4-step-tab ${s.id === state.step ? "active" : ""}" data-step="${s.id}">
            <span class="u4-step-num">${s.num}</span>
            <span>${es ? s.es : s.en}</span>
          </button>
        `).join("")}
      </nav>
    `;

    const zoomBar = (hintEn, hintEs) => `
      <div class="u4-svg-bar">
        <span class="u4-svg-hint">${es ? hintEs : hintEn}</span>
        <div class="u4-zoom-group">
          ${[100, 150, 200].map((z) => `<button type="button" class="u4-mini-btn ${state.zoomPct === z ? "active" : ""}" data-zoom="${z}">${z}%</button>`).join("")}
        </div>
      </div>
    `;

    let bodyHtml = "";
    if (state.step === "cut-map") {
      bodyHtml = `
        <section class="u4-card">
          <div class="u4-card-head">
            <div>
              <h1 class="u4-card-title">${es ? "Paso 1 — Mapa de Cortes 1:1 y Líneas Láser" : "Step 1 — 1:1 Wall Cut Map & Laser Setup"}</h1>
              <p class="u4-card-sub">${es ? "Bloqueado: 3″×6″ Ice White · Junta 1/16″ #77 Frost · Bullnose 2″×6″ (cero metal) · Topes 35″" : "Locked: 3″×6″ Ice White · 1/16″ #77 Frost grout · 2″×6″ bullnose (zero metal) · 35″ stops"}</p>
            </div>
            <span class="u4-badge">${es ? "ESPEC. BLOQUEADA" : "LOCKED BUILD PLAN"}</span>
          </div>

          ${zoomBar("Tap any wall, niche, trim, or red laser line to inspect exact cuts.", "Toca cualquier muro, nicho, remate o línea láser para ver medidas exactas.")}
          <div class="u4-svg-viewport">
            <div class="u4-svg-inner" style="width:${state.zoomPct}%">
              ${buildStep1Svg(es, lay, false)}
            </div>
          </div>

          <div class="u4-inspect-bar">
            <span>${inspectText(es, lay)}</span>
          </div>

          <div class="u4-calc-grid">
            <div class="u4-calc-box">
              <h4>${es ? "MURO NORTE (69-5/16″)" : "NORTH BACK WALL (69-5/16″)"}</h4>
              <p>${es ? "Impares:" : "Odd rows:"} <strong>${fmtFrac(lay.north.nOddL)}</strong> + 10×6″ + <strong>${fmtFrac(lay.north.nOddR)}</strong></p>
              <p>${es ? "Pares:" : "Even rows:"} <strong>${fmtFrac(lay.north.nOddR)}</strong> + 10×6″ + <strong>${fmtFrac(lay.north.nOddL)}</strong></p>
            </div>
            <div class="u4-calc-box">
              <h4>${es ? "ESTE Y OESTE (33″ + 2″)" : "EAST & WEST (33″ + 2″)"}</h4>
              <p>${es ? "Impares:" : "Odd rows:"} 5×6″ + <strong>${fmtFrac(lay.side.sOddEnd)}</strong> ${es ? "en 33″" : "at 33″"}</p>
              <p>${es ? "Pares:" : "Even rows:"} <strong>${fmtFrac(lay.side.sEvenStart)}</strong> + 4×6″ + <strong>${fmtFrac(lay.side.sEvenEnd)}</strong></p>
            </div>
            <div class="u4-calc-box">
              <h4>${es ? `23 HILADAS (0″ → 69-1/4″)` : `23 COURSES (0″ → 69-1/4″)`}</h4>
              <p>${es ? "Hilada 1 (láser):" : "Course 1 (laser):"} <strong>${fmtFrac(state.starterRowIn)}</strong></p>
              <p>${es ? `Hilada ${lastC.num} (tope):` : `Course ${lastC.num} (top):`} <strong>${fmtFrac(lastC.h)}</strong> + 2″ bullnose</p>
            </div>
          </div>

          <div class="u4-photo-grid">
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5478.jpg" alt="North back wall with two niches">
              <figcaption><strong>IMG_5478:</strong> ${es ? "Muro Norte 69-5/16″ con ambos nichos alineados a ~36″." : "69-5/16″ North back wall with both niches aligned at ~36″."}</figcaption>
            </figure>
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5474.jpg" alt="East shower control wall">
              <figcaption><strong>IMG_5474:</strong> ${es ? "Muro Este: controles a 15-1/2″, piedra ~33″, tope 35″." : "East wall: controls at 15-1/2″, ~33″ apron, 35″ stop."}</figcaption>
            </figure>
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5491.jpg" alt="West wall below 43-inch sill">
              <figcaption><strong>IMG_5491:</strong> ${es ? "Muro Oeste: azulejo solo bajo repisa 43″ hasta tope 35″." : "West wall: tile ONLY under 43″ sill stopping at 35″."}</figcaption>
            </figure>
          </div>
        </section>
      `;
    } else if (state.step === "niche-cuts") {
      bodyHtml = `
        <section class="u4-card">
          <div class="u4-card-head">
            <div>
              <h1 class="u4-card-title">${es ? "Paso 2 — Corte 24″×48″ para Fondos de Nicho en 1 Pieza" : "Step 2 — 24″×48″ Single-Piece Niche Cut Sheet"}</h1>
              <p class="u4-card-sub">${es ? "Bloqueado: 1 pieza 24″×48″ Porcelanato Blanco Brillante/Satín (~5/16″–3/8″) · Fondo PRIMERO, cantos ocultos" : "Locked: 1 × 24″×48″ Glossy/Satin White Porcelain (~5/16″–3/8″) · Set back FIRST so returns hide all 4 cut edges"}</p>
            </div>
            <span class="u4-badge accent">${es ? "0 JUNTAS EN FONDO" : "ZERO BACK SEAMS"}</span>
          </div>

          ${zoomBar("1:1 wet-saw cut layout (left) and 4-step hidden-edge assembly section (right).", "Corte 1:1 en sierra húmeda (izquierda) y armado en 4 pasos (derecha).")}
          <div class="u4-svg-viewport">
            <div class="u4-svg-inner" style="width:${state.zoomPct}%">
              ${buildStep2Svg(es, false)}
            </div>
          </div>

          <div class="u4-calc-grid">
            <div class="u4-calc-box">
              <h4>${es ? "PIEZA A — NICHO IZQUIERDO" : "PIECE A — LEFT NICHE BACK"}</h4>
              <p><strong>~11″ × 19″</strong> (${es ? "X: 19″→30″ · Z: 17″→36″" : "X: 19″→30″ · Z: 17″→36″"})</p>
              <p>${es ? "Alinea dintel con Hilada" : "Top aligns with Course"} <strong>${lay.headerCourse}</strong> (${lay.headerDelta}″)</p>
            </div>
            <div class="u4-calc-box">
              <h4>${es ? "PIEZA B — NICHO DERECHO" : "PIECE B — RIGHT NICHE BACK"}</h4>
              <p><strong>~7-1/2″ × 14″</strong> (${es ? "X: 37-1/2″→45″ · Z: 21-3/4″→35-3/4″" : "X: 37-1/2″→45″ · Z: 21-3/4″→35-3/4″"})</p>
              <p>${es ? "Misma altura superior (~36″)" : "Shared ~36″ header height"}</p>
            </div>
            <div class="u4-calc-box">
              <h4>${es ? "PIEZAS C y D — REPISAS" : "PIECES C & D — SLOPED SILLS"}</h4>
              <p><strong>~4-1/2″ × 11″</strong> &amp; <strong>~4-1/2″ × 7-1/2″</strong></p>
              <p>${es ? "Pendiente 1/4″/pie hacia la tina" : "Slope 1/4″ per foot into tub"}</p>
            </div>
          </div>

          <div class="u4-photo-grid">
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5478.jpg" alt="Framed bathroom niches">
              <figcaption><strong>IMG_5478:</strong> ${es ? "Medir ancho/alto neto impermeabilizado de ambos nichos antes de cortar la pieza 24″×48″." : "Measure waterproofed inside width & height of both niches before cutting the 24″×48″ tile."}</figcaption>
            </figure>
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5493.jpg" alt="American Olean 0025 Ice White wall tile">
              <figcaption><strong>IMG_5493:</strong> ${es ? "Azulejo de muro en obra: American Olean 0025 Ice White 3″×6″ (tono 55501)." : "Wall tile on site: American Olean 0025 Ice White 3″×6″ (shade 55501)."}</figcaption>
            </figure>
          </div>
        </section>
      `;
    } else if (state.step === "plumbing-stops") {
      bodyHtml = `
        <section class="u4-card">
          <div class="u4-card-head">
            <div>
              <h1 class="u4-card-title">${es ? "Paso 3 — Mapa de Plomería Este y Remate Oeste 43″" : "Step 3 — East Plumbing Hole Map & West 43″ Wrap"}</h1>
              <p class="u4-card-sub">${es ? "Simetría exacta 35″ Este / 35″ Oeste · Bajada bullnose 2″×6″ junto a piedra ~33″" : "Exact 35″ East / 35″ West symmetry · 2″×6″ vertical bullnose drops beside ~33″ stone apron"}</p>
            </div>
            <span class="u4-badge">${es ? "TOPES 35″ / 35″" : "35″ / 35″ STOPS"}</span>
          </div>

          ${zoomBar("East control wall hole-saw targets (left) and West 43″ sill stop (right).", "Perforaciones en muro Este (izquierda) y tope bajo repisa 43″ Oeste (derecha).")}
          <div class="u4-svg-viewport">
            <div class="u4-svg-inner" style="width:${state.zoomPct}%">
              ${buildStep3Svg(es, lay, false)}
            </div>
          </div>

          <div class="u4-calc-grid">
            ${lay.plumbingHits.map((p) => `
              <div class="u4-calc-box">
                <h4>${es ? p.es.toUpperCase() : p.en.toUpperCase()}</h4>
                <p><strong>X = ${fmtFrac(p.x)}</strong> ${es ? "desde esquina Norte" : "from North corner"} · <strong>Z = ${fmtFrac(p.z)}</strong></p>
                <p>${es ? "Cae en Hilada:" : "Hits Course:"} <strong>${p.courses.map((n) => "C" + n).join("–")}</strong></p>
              </div>
            `).join("")}
          </div>

          <div class="u4-photo-grid">
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5474.jpg" alt="East wall plumbing rough-in">
              <figcaption><strong>IMG_5474:</strong> ${es ? "Válvula Delta (~27″), llave (~5-1/2″), regadera (~60″), WC (~38″), Hardie (~39″)." : "Delta valve (~27″), spout (~5-1/2″), shower arm (~60″), WC stub (~38″), Hardie seam (~39″)."}</figcaption>
            </figure>
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5488.jpg" alt="33-inch stone waterfall apron">
              <figcaption><strong>IMG_5488:</strong> ${es ? "Falda de piedra termina en ~33″; bullnose 2″×6″ cubre 33″→35″ al piso." : "Stone apron ends at ~33″; vertical 2″×6″ bullnose covers 33″→35″ to floor."}</figcaption>
            </figure>
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5491.jpg" alt="West wall 43-inch sill">
              <figcaption><strong>IMG_5491:</strong> ${es ? "Muro Oeste: solo Hiladas 1–7 bajo la repisa de 43″ (tope 35″)." : "West wall: Courses 1–7 only beneath 43″ sill (35″ stop)."}</figcaption>
            </figure>
          </div>
        </section>
      `;
    } else {
      const stepsList = buildCrewSteps(es, lay);
      bodyHtml = `
        <section class="u4-card">
          <div class="u4-card-head">
            <div>
              <h1 class="u4-card-title">${es ? "Paso 4 — Secuencia de Obra (Pasos 1–7) y Materiales" : "Step 4 — Crew Build Sequence (Steps 1–7) & Materials"}</h1>
              <p class="u4-card-sub">${es ? "Todo calculado para obra · Cero precios · Mapei #77 Frost bloqueado" : "Fully calculated for field crew · Zero prices · Mapei #77 Frost locked"}</p>
            </div>
            <span class="u4-badge">${es ? "LISTO PARA OBRA" : "FIELD READY"}</span>
          </div>

          <div class="u4-step-cards">
            ${stepsList.map((st) => `
              <div class="u4-step-card">
                <div class="u4-step-card-head">
                  <span class="u4-step-card-title">${es ? `Paso ${st.num}: ${st.esT}` : `Step ${st.num}: ${st.enT}`}</span>
                  <span class="u4-step-card-dim">${st.dim}</span>
                </div>
                <p>${es ? st.es : st.en}</p>
              </div>
            `).join("")}
          </div>

          <div class="u4-table-wrap">
            <table class="u4-table">
              <thead>
                <tr>
                  <th>${es ? "Material Bloqueado" : "Locked Material"}</th>
                  <th>${es ? "SKU / Medida" : "SKU / Size"}</th>
                  <th>${es ? `Cantidad (+${state.wastePct}%)` : `Quantity (+${state.wastePct}%)`}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${es ? "Azulejo Muro Blanco Brillante" : "Glossy White Wall Field Tile"}</strong><br><span style="font-size:12px;color:var(--muted)">~${lay.takeoff.netSqft} sf net → ${lay.takeoff.grossSqft} sf gross</span></td>
                  <td class="u4-mono">002536MOD1P4<br>3″×6″ (12.5 sf/box)</td>
                  <td class="u4-mono"><strong>${lay.takeoff.cartons} ${es ? "cajas" : "cartons"}</strong><br>(${es ? "restar cajas en obra" : "deduct boxes on site"})</td>
                </tr>
                <tr>
                  <td><strong>${es ? "Bullnose Cerámico 2″×6″ (Cero Metal)" : "Zero-Metal 2″×6″ Surface Bullnose"}</strong></td>
                  <td class="u4-mono">0025S42691P4<br>2″×6″ Glossy</td>
                  <td class="u4-mono"><strong>${lay.takeoff.bullnosePcs} ${es ? "piezas" : "pieces"}</strong></td>
                </tr>
                <tr>
                  <td><strong>${es ? "Esquinas Bullnose 2″×2″" : "2″×2″ Factory Bullnose Corners"}</strong></td>
                  <td class="u4-mono">0025SN42691P2<br>2″×2″ Glossy</td>
                  <td class="u4-mono"><strong>${lay.takeoff.cornerPcs} ${es ? "piezas" : "pieces"}</strong></td>
                </tr>
                <tr>
                  <td><strong>${es ? "Fondos y Repisas de Nicho (1 Pieza)" : "1-Piece Niche Backs & Sloped Sills"}</strong></td>
                  <td class="u4-mono">24″×48″ White Porcelain<br>~5/16″–3/8″ thick</td>
                  <td class="u4-mono"><strong>1 ${es ? "pieza" : "tile"}</strong> (${es ? "ambos nichos + repisas" : "both niches + sills"})</td>
                </tr>
                <tr>
                  <td><strong>${es ? "Boquilla Muro (1/16″) + Silicón 100%" : "Wall Grout (1/16″) + 100% Silicone"}</strong></td>
                  <td class="u4-mono">Mapei Ultracolor Plus FA #77 Frost<br>+ Mapesil T Plus #77 Frost</td>
                  <td class="u4-mono"><strong>1 × 10-lb ${es ? "saco" : "bag"} + 3 ${es ? "tubos" : "tubes"}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="u4-checklist">
            ${[
              ["levelTub", "Verify tub rim level & confirm HardieBacker top at 71-1/4″ above rim before snapping laser.", "Verificar nivel de tina y altura HardieBacker 71-1/4″ antes de trazar láser."],
              ["nicheMeasure", "Measure waterproofed inside width & height of both niches before cutting the 24″×48″ White porcelain tile.", "Medir ancho y alto interior impermeabilizado de ambos nichos antes de cortar la pieza 24″×48″."],
              ["waterproofPhoto", "Photograph continuous waterproofing membrane & dry layout with tape in frame before thinset.", "Tomar fotos con cinta en cuadro de la impermeabilización continua y trazo en seco."],
              ["valveDepth", "Verify Delta Arcadia valve plaster-guard depth against 5/16″ tile + thinset finished plane.", "Verificar profundidad de válvula Delta Arcadia contra azulejo 5/16″ + pegazulejo."],
              ["medCabHold", "Keep oversized 20″×32″ medicine cabinet OFF wall for return — do NOT install.", "Mantener botiquín 20″×32″ FUERA del muro para devolución — NO instalar."]
            ].map(([k, enT, esT]) => `
              <label class="u4-check-item">
                <input type="checkbox" data-chk="${k}" ${state.checks[k] ? "checked" : ""}>
                <span>${es ? esT : enT}</span>
              </label>
            `).join("")}
          </div>

          <details class="u4-details">
            <summary>${es ? "Ajustes opcionales (1.ª hilada / % desperdicio)" : "Optional Adjustments (Starter Course / Waste %)"}</summary>
            <div class="u4-details-body">
              <div class="u4-ctrl-row">
                <label for="u4StarterSlider">${es ? "1.ª hilada sobre tina:" : "Starter row above tub:"}</label>
                <div class="u4-slider-wrap">
                  <input type="range" id="u4StarterSlider" min="1.5" max="3.0" step="0.125" value="${state.starterRowIn}">
                  <span class="u4-mono">${fmtFrac(state.starterRowIn)}</span>
                  <button type="button" class="u4-mini-btn" id="u4ResetStarter">2-1/4″</button>
                </div>
              </div>
              <div class="u4-ctrl-row">
                <span>${es ? "Margen de cortes:" : "Waste allowance:"}</span>
                <div class="u4-zoom-group">
                  ${[10, 15, 20].map((w) => `<button type="button" class="u4-mini-btn ${state.wastePct === w ? "active" : ""}" data-waste="${w}">+${w}%</button>`).join("")}
                </div>
              </div>
            </div>
          </details>
        </section>
      `;
    }

    const pager = `
      <div class="u4-pager">
        <button type="button" class="u4-pager-btn" id="u4Prev" ${prevS ? "" : "disabled"}>← ${prevS ? (es ? prevS.es : prevS.en) : (es ? "Anterior" : "Prev")}</button>
        <span class="u4-pager-meta">${es ? `Paso ${stepIdx + 1} de ${STEPS.length}` : `Step ${stepIdx + 1} of ${STEPS.length}`}</span>
        <button type="button" class="u4-pager-btn" id="u4Next" ${nextS ? "" : "disabled"}>${nextS ? (es ? nextS.es : nextS.en) : (es ? "Siguiente" : "Next")} →</button>
      </div>
    `;

    app.innerHTML = topbar + `<main class="u4-stage">${bodyHtml}${pager}</main><div class="u4-toast" id="u4Toast" hidden></div>`;
    renderPrintSheets(es, lay);
    wireEvents(es, prevS, nextS);
  }

  function renderPrintSheets(es, lay) {
    const pr = document.getElementById("u4PrintRoot");
    if (!pr) return;
    const stepsList = buildCrewSteps(es, lay);
    pr.innerHTML = `
      <section class="u4-print-page">
        <div class="u4-print-head">
          <h2>${es ? "UNIT 4 BAÑO — MAPA DE CORTES 1:1 Y CORTE 24″×48″ (PÁG. 1/2)" : "UNIT 4 BATHROOM — 1:1 CUT MAP & 24″×48″ NICHE SHEET (PAGE 1/2)"}</h2>
          <span>rev-20261124-bath-006 · 35″ E/W · 71-1/4″ H · #77 Frost</span>
        </div>
        ${buildStep1Svg(es, lay, true)}
        <div style="margin-top:8px">${buildStep2Svg(es, true)}</div>
        <div class="u4-print-foot">
          <span>${es ? "Azulejo: American Olean 0025 Ice White 3″×6″ + Bullnose 2″×6″ (CERO METAL)" : "Tile: American Olean 0025 Ice White 3″×6″ + 2″×6″ Bullnose (ZERO METAL)"}</span>
          <span>1231 11th Ave Unit 4 · Page 1 of 2</span>
        </div>
      </section>
      <section class="u4-print-page">
        <div class="u4-print-head">
          <h2>${es ? "UNIT 4 BAÑO — PLOMERÍA, PASOS 1–7 Y MATERIALES (PÁG. 2/2)" : "UNIT 4 BATHROOM — PLUMBING HOLES, STEPS 1–7 & MATERIALS (PAGE 2/2)"}</h2>
          <span>Mapei Ultracolor Plus FA #77 Frost + Mapesil T Plus #77</span>
        </div>
        ${buildStep3Svg(es, lay, true)}
        <div style="margin-top:8px;border:1px solid #c5ccc9;border-radius:6px;padding:6px 8px;background:#f8faf9">
          ${stepsList.map((st) => `
            <div style="font-size:8.8px;line-height:1.34;margin-bottom:2.5px">
              <strong>${st.num}. ${es ? st.esT : st.enT}</strong> <span style="font-family:IBM Plex Mono,monospace;color:#1f5f7a">[${st.dim}]</span> — ${es ? st.es : st.en}
            </div>
          `).join("")}
        </div>
        <div class="u4-print-foot">
          <span>${es ? `Stock: ${lay.takeoff.cartons} cajas 3″×6″ · ${lay.takeoff.bullnosePcs} bullnose 2″×6″ · 10 esq. 2″×2″ · 1 pza 24″×48″ · 1 saco #77 + 3 silicón` : `Qty: ${lay.takeoff.cartons} boxes 3″×6″ · ${lay.takeoff.bullnosePcs} bullnose 2″×6″ · 10 corners 2″×2″ · 1 × 24″×48″ · 1 bag #77 + 3 silicone`}</span>
          <span>1231 11th Ave Unit 4 · Page 2 of 2</span>
        </div>
      </section>
    `;
  }

  function wireEvents(es, prevS, nextS) {
    const langBtn = document.getElementById("u4LangBtn");
    if (langBtn) langBtn.onclick = () => {
      state.lang = state.lang === "es" ? "en" : "es";
      safeSet("u4_lang", state.lang);
      renderAll();
    };
    const themeBtn = document.getElementById("u4ThemeBtn");
    if (themeBtn) themeBtn.onclick = () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      safeSet("u4_theme", state.theme);
      renderAll();
    };
    const printBtn = document.getElementById("u4PrintBtn");
    if (printBtn) printBtn.onclick = () => window.print();

    document.querySelectorAll("[data-step]").forEach((btn) => {
      btn.onclick = () => {
        state.step = btn.getAttribute("data-step");
        state.zoomPct = 100;
        renderAll();
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    });
    document.querySelectorAll("[data-zoom]").forEach((btn) => {
      btn.onclick = () => {
        state.zoomPct = Number(btn.getAttribute("data-zoom")) || 100;
        renderAll();
      };
    });
    document.querySelectorAll("[data-inspect]").forEach((el) => {
      el.onclick = () => {
        state.inspectedId = el.getAttribute("data-inspect");
        renderAll();
      };
    });
    document.querySelectorAll("[data-chk]").forEach((cb) => {
      cb.onchange = () => { state.checks[cb.getAttribute("data-chk")] = !!cb.checked; };
    });
    document.querySelectorAll("[data-waste]").forEach((btn) => {
      btn.onclick = () => { state.wastePct = Number(btn.getAttribute("data-waste")) || 15; renderAll(); };
    });
    const slider = document.getElementById("u4StarterSlider");
    if (slider) slider.oninput = () => { state.starterRowIn = Number(slider.value) || 2.25; renderAll(); };
    const rst = document.getElementById("u4ResetStarter");
    if (rst) rst.onclick = () => { state.starterRowIn = 2.25; renderAll(); showToast(es ? "1.ª hilada restablecida a 2-1/4″" : "Starter row reset to 2-1/4″"); };
    const prevBtn = document.getElementById("u4Prev");
    if (prevBtn && prevS) prevBtn.onclick = () => { state.step = prevS.id; renderAll(); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const nextBtn = document.getElementById("u4Next");
    if (nextBtn && nextS) nextBtn.onclick = () => { state.step = nextS.id; renderAll(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  }

  function boot() {
    window.U4PLAN = {
      id: "bathroom-tile",
      rev: SEED.rev,
      getScaleInfo: () => state.lastScaleInfo,
      setLang: (l) => { state.lang = l === "es" ? "es" : "en"; renderAll(); },
      setTheme: (t) => { state.theme = t === "dark" ? "dark" : "light"; renderAll(); }
    };
    window.addEventListener("message", (ev) => {
      const d = ev && ev.data;
      if (!d || typeof d !== "object") return;
      if (d.theme === "dark" || d.theme === "light") { state.theme = d.theme; renderAll(); }
      if (d.lang === "en" || d.lang === "es") { state.lang = d.lang; renderAll(); }
    });
    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
