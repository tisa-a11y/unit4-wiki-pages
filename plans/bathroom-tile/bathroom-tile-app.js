(function () {
  "use strict";

  const SEED = {
    rev: "bath-tile-v9",
    roomWidthIn: 72.125,
    roomDepthIn: 82.125,
    doorSlabIn: 28.0,
    backerWidthIn: 69.3125,
    tubRimHeightIn: 22.0,
    backerAboveTubIn: 71.25,
    tubOuterDepthIn: 33.0,
    eastTileStopIn: 35.0,
    eastToiletStubIn: 37.75,
    westSillStopIn: 35.0,
    westSillFloorIn: 43.0,
    largeNiche: { x0: 19.0, x1: 30.0, z0: 17.0, z1: 36.0, w: 11.0, h: 19.0, depth: null },
    smallNiche: { x0: 37.5, x1: 45.0, z0: 21.75, z1: 35.75, w: 7.5, h: 14.0, depth: null },
    plumbing: [
      { id: "spout", x: 15.5, z: 5.5, diam: 1.5, en: "Tub Spout", es: "Llave de Tina" },
      { id: "valve", x: 15.5, z: 27.0, diam: 4.5, en: "Shower Valve", es: "Válvula de Regadera" },
      { id: "arm", x: 15.5, z: 60.0, diam: 1.5, en: "Shower Head", es: "Salida de Regadera" }
    ],
    wallTile: {
      sku: "0025 36MOD1P4",
      shade: "55501",
      actualW: 6.028,
      actualH: 3.012,
      sqftPerBox: 12.5
    },
    bullnose: {
      sku: "0025S42691P4",
      cornerSku: "0025SN42691P2",
      wIn: 2.0
    }
  };

  const STEPS = [
    { id: "field-layout", num: 1, en: "Wall Tile Layout", es: "Trazo de Muros" },
    { id: "plumbing-stops", num: 2, en: "Shower & Window Walls", es: "Regadera y Ventana" },
    { id: "niches-trim", num: 3, en: "Niches & Ceramic Trim", es: "Nichos y Orillas" },
    { id: "crew-steps", num: 4, en: "Pre-Tile Checks & Materials", es: "Verificaciones y Materiales" }
  ];

  const state = {
    lang: "en",
    theme: "light",
    step: "field-layout",
    pattern: "half",
    groutIn: 0.0625,
    starterRowIn: 2.25,
    horizShiftIn: 0.0,
    wastePct: 15,
    checks: {
      waterproofPhoto: false,
      nicheMeasure: false,
      valveDepth: false
    },
    lastScaleInfo: { view: "field-layout", scaleX: 2.95, scaleY: 2.95, uniform: true }
  };

  function resolveStepId(raw) {
    const val = String(raw || "").trim().toLowerCase();
    if (!val) return null;
    const byNum = parseInt(val, 10);
    if (byNum >= 1 && byNum <= STEPS.length) return STEPS[byNum - 1].id;
    const hit = STEPS.find((s) => s.id === val);
    return hit ? hit.id : null;
  }

  function fmtFrac(val) {
    if (val == null || !isFinite(val)) return "—";
    const sign = val < 0 ? "-" : "";
    const abs = Math.abs(val);
    let whole = Math.floor(abs + 1e-6);
    let six = Math.round((abs - whole) * 16);
    if (six === 16) { whole += 1; six = 0; }
    if (six === 0) return sign + whole + "″";
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const g = gcd(six, 16);
    return sign + (whole > 0 ? whole + "-" + (six / g) + "/" + (16 / g) : (six / g) + "/" + (16 / g)) + "″";
  }

  function computeLayout() {
    const grout = state.groutIn;
    const pitchW = +(SEED.wallTile.actualW + grout).toFixed(4);
    const pitchH = +(SEED.wallTile.actualH + grout).toFixed(4);
    const topCapBotZ = SEED.backerAboveTubIn - SEED.bullnose.wIn;

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
      courses.push({ num: i + 1, z0: +z0.toFixed(2), z1: +z1.toFixed(2), h: +(z1 - z0).toFixed(2) });
    }

    function rowOffset(rowIdx) {
      if (state.pattern === "stacked") return 0;
      if (state.pattern === "third") return ((rowIdx % 3) * (pitchW / 3));
      return (rowIdx % 2) * (pitchW / 2);
    }

    function rowJoints(spanIn, baseStartIn, rowIdx) {
      const off = (baseStartIn + state.horizShiftIn + rowOffset(rowIdx)) % pitchW;
      let start = off <= 0.05 ? off + pitchW : off;
      if (start < 0) start += pitchW;
      const arr = [];
      for (let x = start; x < spanIn - 0.08; x += pitchW) arr.push(+x.toFixed(3));
      const firstCut = arr.length ? arr[0] : spanIn;
      const lastCut = arr.length ? +(spanIn - arr[arr.length - 1]).toFixed(2) : spanIn;
      return { joints: arr, firstCut: +firstCut.toFixed(2), lastCut };
    }

    const nRows = courses.map((_, i) => rowJoints(SEED.backerWidthIn, 2.65, i));
    const sRows = courses.map((_, i) => rowJoints(33.0, 0.0, i));

    let minCut = 99;
    [nRows[0], nRows[1], nRows[2], sRows[0], sRows[1], sRows[2]].forEach((r) => {
      if (r) minCut = Math.min(minCut, r.firstCut, r.lastCut);
    });
    const topCourseH = courses[courses.length - 1].h;
    const hasSliver = Math.min(state.starterRowIn, topCourseH, minCut) < 1.5;

    const plumbingHits = SEED.plumbing.map((p) => {
      const hitNums = courses
        .filter((c) => c.z1 >= p.z - p.diam / 2 && c.z0 <= p.z + p.diam / 2)
        .map((c) => c.num);
      return Object.assign({}, p, { courses: hitNums });
    });

    const northSqft = (SEED.backerWidthIn * 69.25 - SEED.largeNiche.w * SEED.largeNiche.h - SEED.smallNiche.w * SEED.smallNiche.h) / 144;
    const eastSqft = (33.0 * 69.25) / 144;
    const westSqft = (33.0 * 21.0) / 144;
    const tileAreaSqft = Math.round(northSqft + eastSqft + westSqft);
    const orderSqft = Math.round((northSqft + eastSqft + westSqft) * (1 + state.wastePct / 100));
    const cartons = Math.ceil(orderSqft / SEED.wallTile.sqftPerBox);

    const perimBullnoseIn = SEED.backerWidthIn + 33.0 + (69.25 + 22.0) + (21.0 + 22.0);
    const nicheFrameIn = 2 * (SEED.largeNiche.w + SEED.largeNiche.h) + 2 * (SEED.smallNiche.w + SEED.smallNiche.h);
    const bullnosePcs = Math.ceil(((perimBullnoseIn + nicheFrameIn) / 6.0) * (1 + state.wastePct / 100));

    return {
      pitchW, pitchH, courses, nRows, sRows, minCut: +minCut.toFixed(2), topCourseH, hasSliver, plumbingHits,
      takeoff: { tileAreaSqft, orderSqft, cartons, bullnosePcs, cornerPcs: 10 }
    };
  }

  function renderVertJoints(joints, xOrigin, yTop, yBot, S, reverseDir) {
    let out = "";
    for (let i = 0; i < joints.length; i++) {
      const x = +(reverseDir ? (xOrigin - joints[i] * S) : (xOrigin + joints[i] * S)).toFixed(1);
      out += `<line x1="${x}" y1="${yTop}" x2="${x}" y2="${yBot}" stroke="#C8D1D6" stroke-width="0.7"/>`;
    }
    return out;
  }

  function buildStep1Svg(es, lay, forPrint) {
    const S = 2.95;
    if (!forPrint) state.lastScaleInfo = { view: "field-layout", scaleX: S, scaleY: S, uniform: true };
    const xWest0 = 32;
    const xNW = +(xWest0 + 36.0 * S).toFixed(1);
    const xNE = +(xNW + SEED.backerWidthIn * S).toFixed(1);
    const xEastEnd = +(xNE + 38.0 * S).toFixed(1);

    const yZ = (z) => +(38 + (78.0 - z) * S).toFixed(1);
    const yTopCap = yZ(71.25);
    const yCapBot = yZ(69.25);
    const yTub = yZ(0);
    const yFloor = yZ(-22.0);
    const ySill = yZ(21.0);
    const yLaser = yZ(state.starterRowIn);

    let grid = "";
    lay.courses.forEach((c, i) => {
      const yT = yZ(c.z1);
      const yB = yZ(c.z0);
      if (i > 0) {
        grid += `<line x1="${xNW}" y1="${yB}" x2="${(xNE + 33 * S).toFixed(1)}" y2="${yB}" stroke="#C8D1D6" stroke-width="0.7"/>`;
        if (c.z0 <= 21.0) grid += `<line x1="${(xNW - 33 * S).toFixed(1)}" y1="${yB}" x2="${xNW}" y2="${yB}" stroke="#C8D1D6" stroke-width="0.7"/>`;
      }
      grid += renderVertJoints(lay.nRows[i].joints, xNW, yT, yB, S, false);
      grid += renderVertJoints(lay.sRows[i].joints, xNE, yT, yB, S, false);
      if (c.z0 < 21.0) grid += renderVertJoints(lay.sRows[i].joints, xNW, c.z1 <= 21.0 ? yT : ySill, yB, S, true);
    });

    const lgX = +(xNW + SEED.largeNiche.x0 * S).toFixed(1);
    const lgY = yZ(SEED.largeNiche.z1);
    const smX = +(xNW + SEED.smallNiche.x0 * S).toFixed(1);
    const smY = yZ(SEED.smallNiche.z1);
    const xCenter = +(xNW + (SEED.backerWidthIn / 2) * S).toFixed(1);

    const Sk = 1.9;
    const kpX = 516;
    const kpY = 76;
    const kpW = +(SEED.roomWidthIn * Sk).toFixed(1);
    const kpD = +(SEED.roomDepthIn * Sk).toFixed(1);
    const doorX = +(kpX + 26).toFixed(1);
    const doorW = +(SEED.doorSlabIn * Sk).toFixed(1);

    return `
      <svg viewBox="0 0 680 392" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="${es ? "Vista de los 3 muros de la tina y planta de orientación del baño" : "3-wall tub tile layout and bathroom orientation plan"}">
        <defs>
          <pattern id="noTileH1" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#9A5B06" stroke-width="1.1" opacity="0.32"/>
          </pattern>
        </defs>

        <text x="16" y="18" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "VISTA DE LOS 3 MUROS DE TINA (ESCALA REAL)" : "3-WALL TUB TILE LAYOUT (TO SCALE)"}
        </text>
        <text x="16" y="31" font-size="7.6" fill="#5D686D">
          ${es ? "Muro Oeste Ventana (Izq.)  |  Muro Norte Fondo (69-5/16″)  |  Muro Este Regadera (Der.)" : "West Window Wall (Left)  |  North Back Wall (69-5/16″)  |  East Shower Wall (Right)"}
        </text>

        <rect x="${xWest0}" y="${yTopCap}" width="${(xEastEnd - xWest0).toFixed(1)}" height="${(yFloor - yTopCap).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9"/>
        <rect x="${(xNW - 35 * S).toFixed(1)}" y="${yTopCap}" width="${(35 * S).toFixed(1)}" height="${(ySill - yTopCap).toFixed(1)}" fill="url(#noTileH1)" stroke="#9A5B06" stroke-dasharray="4 3"/>
        <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${((yTopCap + ySill) / 2 - 3).toFixed(1)}" text-anchor="middle" font-size="7.2" font-weight="700" fill="#8F5305">${es ? "ARRIBA DE REPISA 43″" : "ABOVE 43″ SILL"}</text>
        <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${((yTopCap + ySill) / 2 + 10).toFixed(1)}" text-anchor="middle" font-size="6.8" fill="#8F5305">${es ? "(SIN AZULEJO)" : "(NO WALL TILE)"}</text>

        <rect x="${xNW}" y="${yCapBot}" width="${(SEED.backerWidthIn * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
        <rect x="${xNE}" y="${yCapBot}" width="${(33 * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
        <rect x="${(xNW - 33 * S).toFixed(1)}" y="${ySill}" width="${(33 * S).toFixed(1)}" height="${(yTub - ySill).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
        ${grid}

        <rect x="${xNW}" y="${yTopCap}" width="${((SEED.backerWidthIn + 33) * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
        <rect x="${(xNE + 33 * S).toFixed(1)}" y="${yTopCap}" width="${(2 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#8EC6E2" stroke="#1F5F7A"/>
        <rect x="${(xNE + 33 * S).toFixed(1)}" y="${yCapBot}" width="${(2 * S).toFixed(1)}" height="${(yFloor - yCapBot).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
        <rect x="${(xNW - 35 * S).toFixed(1)}" y="${ySill}" width="${(2 * S).toFixed(1)}" height="${(yFloor - ySill).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
        <rect x="${(xNW - 35 * S - 2).toFixed(1)}" y="${(ySill - 4).toFixed(1)}" width="${(35 * S + 2).toFixed(1)}" height="4.2" fill="#C99E67" stroke="#6E471B"/>

        <rect x="${lgX}" y="${lgY}" width="${(SEED.largeNiche.w * S).toFixed(1)}" height="${(SEED.largeNiche.h * S).toFixed(1)}" fill="#FFFDF7" stroke="#9A5B06" stroke-width="1.5" stroke-dasharray="4 2"/>
        <text x="${(lgX + SEED.largeNiche.w * S / 2).toFixed(1)}" y="${(lgY + 28).toFixed(1)}" text-anchor="middle" font-size="6.4" font-weight="700" fill="#9A5B06">${es ? "NICHO" : "NICHE"}</text>
        <rect x="${smX}" y="${smY}" width="${(SEED.smallNiche.w * S).toFixed(1)}" height="${(SEED.smallNiche.h * S).toFixed(1)}" fill="#FFFDF7" stroke="#9A5B06" stroke-width="1.5" stroke-dasharray="4 2"/>

        <rect x="${(xNW - 33 * S).toFixed(1)}" y="${yTub}" width="${((33 + SEED.backerWidthIn + 33) * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E7ECEF" stroke="#5D686D" stroke-width="1.2"/>
        <text x="${xCenter}" y="${(yTub + 34).toFixed(1)}" text-anchor="middle" font-size="7.8" font-weight="700" fill="#1D2326">${es ? "TINA + CUBIERTA DE PIEDRA (22″ DEL PISO)" : "TUB + STONE DECK (22″ ABOVE FLOOR)"}</text>

        <line x1="${xNW}" y1="${yTopCap - 5}" x2="${xNW}" y2="${yFloor + 5}" stroke="#1D2326" stroke-width="1.4" stroke-dasharray="5 3"/>
        <line x1="${xNE}" y1="${yTopCap - 5}" x2="${xNE}" y2="${yFloor + 5}" stroke="#1D2326" stroke-width="1.4" stroke-dasharray="5 3"/>
        <line x1="${(xNW - 35 * S).toFixed(1)}" y1="${yLaser}" x2="${(xNE + 35 * S).toFixed(1)}" y2="${yLaser}" stroke="#C92A2A" stroke-width="1.4" stroke-dasharray="6 3"/>

        <line x1="20" y1="${yFloor}" x2="${(xEastEnd + 10).toFixed(1)}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.6"/>
        <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">${es ? "35″ OESTE" : "35″ WEST"}</text>
        <text x="${xCenter}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">${es ? "69-5/16″ NORTE" : "69-5/16″ NORTH"}</text>
        <text x="${(xNE + 17.5 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">${es ? "35″ ESTE" : "35″ EAST"}</text>
        <text x="${(xNW - 35 * S - 4).toFixed(1)}" y="${((ySill + yFloor) / 2).toFixed(1)}" text-anchor="end" font-size="7.6" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">43″</text>
        <text x="${(xNE + 35 * S + 4).toFixed(1)}" y="${((yTopCap + yTub) / 2).toFixed(1)}" font-size="7.4" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">71-1/4″</text>

        <rect x="498" y="10" width="172" height="372" rx="6" fill="#F8FAF9" stroke="#C5CCC9"/>
        <text x="584" y="27" text-anchor="middle" font-size="8.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "ORIENTACIÓN" : "KEY PLAN"}
        </text>
        <g transform="translate(584, 52)">
          <circle cx="0" cy="0" r="13" fill="#FFFFFF" stroke="#8C99A0" stroke-width="1"/>
          <polygon points="0,-10 3,-2 -3,-2" fill="#1F5F7A"/>
          <text x="0" y="-15" text-anchor="middle" font-size="7" font-weight="700" fill="#1F5F7A">N</text>
          <text x="0" y="21" text-anchor="middle" font-size="6.5" fill="#5D686D">S</text>
          <text x="-19" y="2.5" text-anchor="middle" font-size="6.5" fill="#5D686D">W</text>
          <text x="19" y="2.5" text-anchor="middle" font-size="6.5" fill="#5D686D">E</text>
        </g>

        <rect x="${kpX}" y="${kpY}" width="${kpW}" height="${kpD}" fill="#FFFFFF" stroke="#1D2326" stroke-width="1.6"/>
        <rect x="${kpX}" y="${kpY}" width="${kpW}" height="${(33 * Sk).toFixed(1)}" fill="#E3EEF2" stroke="#1F5F7A" stroke-width="1.2"/>
        <text x="${(kpX + kpW / 2).toFixed(1)}" y="${(kpY + 34).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" fill="#1F5F7A">${es ? "TINA" : "TUB"}</text>
        <rect x="${kpX + 2}" y="${(kpY + 86).toFixed(1)}" width="28" height="32" rx="4" fill="#F4F5F3" stroke="#5D686D"/>
        <text x="${kpX + 16}" y="${(kpY + 105).toFixed(1)}" text-anchor="middle" font-size="6.2" fill="#1D2326">${es ? "Lavabo" : "Sink"}</text>
        <rect x="${(kpX + kpW - 30).toFixed(1)}" y="${(kpY + 88).toFixed(1)}" width="28" height="30" rx="4" fill="#F4F5F3" stroke="#5D686D"/>
        <text x="${(kpX + kpW - 16).toFixed(1)}" y="${(kpY + 106).toFixed(1)}" text-anchor="middle" font-size="6.2" fill="#1D2326">${es ? "Inodoro" : "Toilet"}</text>

        <line x1="${doorX}" y1="${(kpY + kpD).toFixed(1)}" x2="${(+doorX + doorW).toFixed(1)}" y2="${(kpY + kpD).toFixed(1)}" stroke="#FFFFFF" stroke-width="3"/>
        <line x1="${doorX}" y1="${(kpY + kpD).toFixed(1)}" x2="${doorX}" y2="${(kpY + kpD + doorW * 0.72).toFixed(1)}" stroke="#2F6B3F" stroke-width="2"/>
        <path d="M ${doorX} ${(kpY + kpD + doorW * 0.72).toFixed(1)} A ${(doorW * 0.72).toFixed(1)} ${(doorW * 0.72).toFixed(1)} 0 0 0 ${(+doorX + doorW * 0.72).toFixed(1)} ${(kpY + kpD).toFixed(1)}" fill="none" stroke="#2F6B3F" stroke-width="1.2" stroke-dasharray="3 2"/>
        <text x="584" y="${(kpY + kpD + 56).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700" fill="#2F6B3F">${es ? "Puerta 28″ (al pasillo)" : "28″ Door (to hall)"}</text>
        <text x="584" y="${(kpY + kpD + 74).toFixed(1)}" text-anchor="middle" font-size="6.6" font-family="IBM Plex Mono, monospace" fill="#5D686D">72-1/8″ × 82-1/8″</text>
      </svg>
    `;
  }

  function buildStep2PlumbingSvg(es, lay, forPrint) {
    const S = 3.1;
    if (!forPrint) state.lastScaleInfo = { view: "plumbing-stops", scaleX: S, scaleY: S, uniform: true };
    const yZ = (z) => +(40 + (76.0 - z) * S).toFixed(1);
    const yTopCap = yZ(71.25);
    const yCapBot = yZ(69.25);
    const yTub = yZ(0);
    const yFloor = yZ(-22.0);
    const ySill = yZ(21.0);

    const ex0 = 28;
    const wxCorner = 618;
    const wxStop = +(wxCorner - 35 * S).toFixed(1);
    const wxApron = +(wxCorner - 33 * S).toFixed(1);

    let eGrid = "";
    let wGrid = "";
    lay.courses.forEach((c, i) => {
      const yT = yZ(c.z1);
      const yB = yZ(c.z0);
      if (i > 0) {
        eGrid += `<line x1="${ex0}" y1="${yB}" x2="${(ex0 + 33 * S).toFixed(1)}" y2="${yB}" stroke="#C8D1D6" stroke-width="0.7"/>`;
        if (c.z0 <= 21.0) wGrid += `<line x1="${wxApron}" y1="${yB}" x2="${wxCorner}" y2="${yB}" stroke="#C8D1D6" stroke-width="0.7"/>`;
      }
      eGrid += renderVertJoints(lay.sRows[i].joints, ex0, yT, yB, S, false);
      if (c.z0 < 21.0) wGrid += renderVertJoints(lay.sRows[i].joints, wxCorner, c.z1 <= 21.0 ? yT : ySill, yB, S, true);
    });

    const pMarks = lay.plumbingHits.map((p) => {
      const cx = +(ex0 + p.x * S).toFixed(1);
      const cy = yZ(p.z);
      const r = p.id === "valve" ? 7 : 3.4;
      return `
        <line x1="${ex0}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="#C92A2A" stroke-width="0.9" stroke-dasharray="3 2"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#F2D492" stroke="#9A5B06" stroke-width="1.4"/>
        <rect x="${(ex0 + 39 * S).toFixed(1)}" y="${(cy - 9).toFixed(1)}" width="152" height="18" rx="4" fill="#FFF8EB" stroke="#9A5B06" stroke-width="0.9"/>
        <text x="${(ex0 + 39 * S + 6).toFixed(1)}" y="${(cy + 3).toFixed(1)}" font-size="7.1" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#7A4404">
          ${es ? p.es : p.en} (${fmtFrac(p.z)} ${es ? "arriba" : "up"})
        </text>
      `;
    }).join("");

    return `
      <svg viewBox="0 0 660 384" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="${es ? "Muro de regadera y muro de ventana" : "Shower wall plumbing and window wall stop"}">
        <defs>
          <pattern id="noTileH2" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#9A5B06" stroke-width="1.1" opacity="0.32"/>
          </pattern>
        </defs>

        <text x="${ex0}" y="18" font-size="9.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "MURO ESTE (REGADERA) · TOPE 35″" : "EAST SHOWER WALL · 35″ EDGE"}
        </text>
        <text x="${ex0}" y="31" font-size="7.5" fill="#5D686D">
          ${es ? "Salidas a 15-1/2″ del rincón · Libra agua del inodoro (~38″)" : "Pipes 15-1/2″ from North corner · Clears toilet water line (~38″)"}
        </text>

        <rect x="${ex0}" y="${yTopCap}" width="${(40 * S).toFixed(1)}" height="${(yFloor - yTopCap).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9"/>
        <rect x="${ex0}" y="${yCapBot}" width="${(33 * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
        ${eGrid}
        <rect x="${ex0}" y="${yTopCap}" width="${(33 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
        <rect x="${(ex0 + 33 * S).toFixed(1)}" y="${yTopCap}" width="${(2 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#8EC6E2" stroke="#1F5F7A"/>
        <rect x="${(ex0 + 33 * S).toFixed(1)}" y="${yCapBot}" width="${(2 * S).toFixed(1)}" height="${(yFloor - yCapBot).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
        <rect x="${ex0}" y="${yTub}" width="${(33 * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E7ECEF" stroke="#5D686D" stroke-width="1.2"/>
        <text x="${(ex0 + 16.5 * S).toFixed(1)}" y="${(yTub + 34).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" fill="#1D2326">${es ? "PIEDRA ~33″" : "~33″ STONE APRON"}</text>
        ${pMarks}
        <circle cx="${(ex0 + 37.75 * S).toFixed(1)}" cy="${yZ(-14)}" r="3.2" fill="#C86D3B" stroke="#1D2326"/>
        <line x1="${ex0 - 6}" y1="${yFloor}" x2="${(ex0 + 41 * S).toFixed(1)}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.6"/>
        <text x="${(ex0 + 17.5 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">${es ? "35″ DE AZULEJO" : "35″ TILE EDGE"}</text>

        <text x="${wxStop}" y="18" font-size="9.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "MURO OESTE (VENTANA) · REPISA 43″" : "WEST WINDOW WALL · 43″ SILL"}
        </text>
        <text x="${wxStop}" y="31" font-size="7.5" fill="#5D686D">
          ${es ? "Azulejo solo debajo de 43″ · Sin azulejo arriba" : "Tile below 43″ sill only · No tile above sill"}
        </text>
        <rect x="${wxStop}" y="${yTopCap}" width="${(35 * S).toFixed(1)}" height="${(ySill - yTopCap).toFixed(1)}" fill="url(#noTileH2)" stroke="#9A5B06" stroke-dasharray="4 3"/>
        <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${((yTopCap + ySill) / 2 - 3).toFixed(1)}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#8F5305">${es ? "ARRIBA DE REPISA 43″" : "ABOVE 43″ SILL"}</text>
        <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${((yTopCap + ySill) / 2 + 10).toFixed(1)}" text-anchor="middle" font-size="7" fill="#8F5305">${es ? "(SIN AZULEJO)" : "(NO WALL TILE)"}</text>
        <rect x="${wxApron}" y="${ySill}" width="${(33 * S).toFixed(1)}" height="${(yTub - ySill).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
        ${wGrid}
        <rect x="${wxStop}" y="${ySill}" width="${(2 * S).toFixed(1)}" height="${(yFloor - ySill).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
        <rect x="${wxStop - 2}" y="${ySill - 4}" width="${(35 * S + 2).toFixed(1)}" height="4.2" fill="#C99E67" stroke="#6E471B"/>
        <rect x="${wxApron}" y="${yTub}" width="${(33 * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E7ECEF" stroke="#5D686D" stroke-width="1.2"/>
        <line x1="${wxStop - 6}" y1="${yFloor}" x2="${wxCorner + 6}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.6"/>
        <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">${es ? "35″ HASTA REPISA" : "35″ TO SILL TIP"}</text>
        <text x="${wxStop - 5}" y="${((ySill + yFloor) / 2).toFixed(1)}" text-anchor="end" font-size="7.8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">43″</text>
      </svg>
    `;
  }

  function buildStep3NichesSvg(es, lay, forPrint) {
    const S = 3.8;
    if (!forPrint) state.lastScaleInfo = { view: "niches-trim", scaleX: S, scaleY: S, uniform: true };
    const ox = 24;
    const oy = 52;
    const wallW = +(SEED.backerWidthIn * S).toFixed(1);
    const wallH = +(44 * S).toFixed(1);
    const yZ = (z) => +(oy + (50 - z) * S).toFixed(1);
    const lgX = +(ox + SEED.largeNiche.x0 * S).toFixed(1);
    const lgY = yZ(SEED.largeNiche.z1);
    const smX = +(ox + SEED.smallNiche.x0 * S).toFixed(1);
    const smY = yZ(SEED.smallNiche.z1);

    return `
      <svg viewBox="0 0 650 286" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="${es ? "Nichos en muro de fondo y corte lateral con bullnose cerámico" : "Back wall niches and ceramic bullnose side section"}">
        <text x="20" y="20" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "1. NICHOS EN MURO NORTE (FONDO)" : "1. NORTH BACK WALL NICHES"}
        </text>
        <text x="20" y="33" font-size="7.6" fill="#9A5B06" font-weight="600">
          ${es ? "Medidas aproximadas — medir nichos impermeabilizados antes de cortar" : "Approximate sizes — measure waterproofed openings before cutting"}
        </text>

        <rect x="${ox}" y="${oy}" width="${wallW}" height="${wallH}" fill="#FFFFFF" stroke="#8C99A0" stroke-width="1.2"/>
        <rect x="${lgX}" y="${lgY}" width="${(SEED.largeNiche.w * S).toFixed(1)}" height="${(SEED.largeNiche.h * S).toFixed(1)}" fill="#F6FAFC" stroke="#9A5B06" stroke-width="1.8" stroke-dasharray="5 3"/>
        <text x="${(lgX + SEED.largeNiche.w * S / 2).toFixed(1)}" y="${(lgY + 26).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" fill="#1F5F7A">${es ? "NICHO IZQ." : "LEFT NICHE"}</text>
        <text x="${(lgX + SEED.largeNiche.w * S / 2).toFixed(1)}" y="${(lgY + 40).toFixed(1)}" text-anchor="middle" font-size="7.2" font-family="IBM Plex Mono, monospace" fill="#1D2326">~11″×19″</text>

        <rect x="${smX}" y="${smY}" width="${(SEED.smallNiche.w * S).toFixed(1)}" height="${(SEED.smallNiche.h * S).toFixed(1)}" fill="#F6FAFC" stroke="#9A5B06" stroke-width="1.8" stroke-dasharray="5 3"/>
        <text x="${(smX + SEED.smallNiche.w * S / 2).toFixed(1)}" y="${(smY + 21).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700" fill="#1F5F7A">${es ? "DER." : "RIGHT"}</text>
        <text x="${(smX + SEED.smallNiche.w * S / 2).toFixed(1)}" y="${(smY + 35).toFixed(1)}" text-anchor="middle" font-size="6.8" font-family="IBM Plex Mono, monospace" fill="#1D2326">~7.5″×14″</text>

        <line x1="${ox}" y1="${lgY}" x2="${(ox + wallW).toFixed(1)}" y2="${lgY}" stroke="#2F6B3F" stroke-width="1" stroke-dasharray="4 2"/>
        <text x="${(ox + wallW - 4).toFixed(1)}" y="${(lgY - 6).toFixed(1)}" text-anchor="end" font-size="7" font-weight="700" fill="#2F6B3F">${es ? "Misma altura superior (~36″)" : "Same top height (~36″)"}</text>

        <text x="${ox}" y="${(oy + wallH + 15).toFixed(1)}" font-size="7.4" fill="#5D686D">${es ? "← Oeste (Ventana)" : "← West (Window)"}</text>
        <text x="${(ox + wallW).toFixed(1)}" y="${(oy + wallH + 15).toFixed(1)}" text-anchor="end" font-size="7.4" fill="#5D686D">${es ? "Este (Regadera) →" : "East (Shower) →"}</text>
        <text x="${ox}" y="${(oy + wallH + 31).toFixed(1)}" font-size="7.4" fill="#1D2326">${es ? "Fondo liso de 1 sola pieza en cada nicho (sin juntas)." : "Solid 1-piece white back panel per niche (no grout lines)."}</text>
        <text x="${ox}" y="${(oy + wallH + 45).toFixed(1)}" font-size="7.2" fill="#9A5B06">${es ? "Profundidad pendiente de medir en obra." : "Niche depth: measure on site."}</text>

        <rect x="312" y="10" width="326" height="264" rx="6" fill="#F8FAF9" stroke="#C5CCC9"/>
        <text x="324" y="27" font-size="9" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? "2. CORTE LATERAL DEL NICHO" : "2. HOW TILE MEETS THE NICHE"}
        </text>
        <text x="324" y="40" font-size="7.2" fill="#5D686D">
          ${es ? "Esquema de armado (medir profundidad en obra)" : "Side cutaway (measure niche depth on site)"}
        </text>

        <rect x="326" y="54" width="18" height="194" fill="#EFE6D8" stroke="#A6947D"/>
        <rect x="344" y="54" width="58" height="32" fill="#EFE6D8" stroke="#A6947D"/>
        <rect x="344" y="210" width="58" height="38" fill="#EFE6D8" stroke="#A6947D"/>
        <rect x="402" y="54" width="10" height="32" fill="#CFD8DC" stroke="#5D686D"/>
        <rect x="402" y="210" width="10" height="38" fill="#CFD8DC" stroke="#5D686D"/>
        <polyline points="413,54 413,86 346,86 346,210 413,210 413,248" fill="none" stroke="#C92A2A" stroke-width="2.4"/>

        <rect x="415" y="54" width="12" height="20" fill="#FFFFFF" stroke="#1D2326"/>
        <rect x="415" y="222" width="12" height="26" fill="#FFFFFF" stroke="#1D2326"/>
        <path d="M415,74 L427,74 L427,82 Q427,86 422,86 L415,86 Z" fill="#8EC6E2" stroke="#1F5F7A" stroke-width="1.3"/>
        <path d="M415,210 L422,210 Q427,210 427,214 L427,222 L415,222 Z" fill="#8EC6E2" stroke="#1F5F7A" stroke-width="1.3"/>

        <rect x="349" y="88" width="10" height="120" fill="#FFFFFF" stroke="#1F5F7A" stroke-width="1.6"/>
        <rect x="359" y="88" width="56" height="9" fill="#D6ECF8" stroke="#1F5F7A" stroke-width="1.2"/>
        <polygon points="359,198 424,203 424,210 359,208" fill="#E4F0E6" stroke="#2F6B3F" stroke-width="1.4"/>
        <circle cx="359" cy="97" r="3" fill="#2F6B3F"/>
        <circle cx="359" cy="198" r="3" fill="#2F6B3F"/>

        <text x="442" y="68" font-size="7.4" font-weight="700" fill="#1D2326">${es ? "Azulejo 3″×6″ en muro" : "3″×6″ wall tile"}</text>
        <text x="442" y="86" font-size="7.4" font-weight="700" fill="#1F5F7A">${es ? "Bullnose cerámico 2″×6″" : "2″×6″ ceramic bullnose"}</text>
        <text x="442" y="114" font-size="7.4" font-weight="700" fill="#C92A2A">① ${es ? "Impermeabilizar todo" : "Waterproof entire niche"}</text>
        <text x="442" y="138" font-size="7.4" font-weight="700" fill="#1F5F7A">② ${es ? "Pegar fondo liso primero" : "Set solid back panel first"}</text>
        <text x="442" y="152" font-size="6.8" fill="#5D686D">${es ? "Los cantos quedan ocultos" : "Cut edges stay hidden"}</text>
        <text x="442" y="176" font-size="7.4" font-weight="700" fill="#2F6B3F">③ ${es ? "Repisa con caída hacia tina" : "Slope bottom sill to tub"}</text>
        <text x="442" y="200" font-size="7.4" font-weight="700" fill="#1F5F7A">④ ${es ? "Colocar retornos al frente" : "Set side/top pieces in front"}</text>
        <text x="442" y="214" font-size="6.8" fill="#2F6B3F">${es ? "Sellar esquinas con silicón" : "Seal corners with silicone"}</text>
        <text x="442" y="242" font-size="7" font-weight="700" fill="#9A5B06">${es ? "Profundidad: medir en obra" : "Depth: measure on site"}</text>
      </svg>
    `;
  }

  function renderAll() {
    const es = state.lang === "es";
    document.documentElement.lang = es ? "es" : "en";
    document.documentElement.setAttribute("data-theme", state.theme);
    const lay = computeLayout();
    const stepIdx = STEPS.findIndex((s) => s.id === state.step);
    const prevS = stepIdx > 0 ? STEPS[stepIdx - 1] : null;
    const nextS = stepIdx < STEPS.length - 1 ? STEPS[stepIdx + 1] : null;

    const stepBar = document.getElementById("u4hStepBar");
    if (stepBar) {
      stepBar.setAttribute("aria-label", es ? "Pasos del plano" : "Plan steps");
      stepBar.innerHTML = STEPS.map((s) => `
        <button type="button" class="u4b-step-btn ${s.id === state.step ? "active" : ""}" data-step="${s.id}">
          <span class="u4b-step-num">${s.num}</span>
          <span>${es ? s.es : s.en}</span>
        </button>
      `).join("");
    }

    const body = document.getElementById("u4hBody");
    if (!body) return;

    let cardHtml = "";
    if (state.step === "field-layout") {
      cardHtml = `
        <section class="u4b-card">
          <div class="u4b-head">
            <div>
              <h1 class="u4b-title">${es ? "Paso 1 — Trazo de Azulejo en los 3 Muros" : "Step 1 — 3-Wall Tile Layout & Pattern"}</h1>
              <p class="u4b-sub">${es ? "American Olean 0025 Ice White 3″×6″ con bullnose cerámico del mismo color · Topes a 35″ en ambos costados" : "American Olean 0025 Ice White 3″×6″ with matching ceramic bullnose trim · 35″ symmetrical edges"}</p>
            </div>
            <span class="u4b-badge">${es ? "DIBUJO A ESCALA" : "SCALE DRAWING"}</span>
          </div>

          <div class="u4h-svg-wrap" data-u4-zoom-label="${es ? "Trazo de 3 muros" : "3-Wall Tile Layout"}">
            ${buildStep1Svg(es, lay, false)}
          </div>

          <div class="u4b-ctrl-panel">
            <div class="u4b-ctrl-row">
              <strong>${es ? "Patrón:" : "Tile pattern:"}</strong>
              <div class="u4b-pills">
                <button type="button" class="u4b-pill ${state.pattern === "half" ? "active" : ""}" data-pat="half">${es ? "Mitad 50% (Rec.)" : "Half-Offset 50% (Rec.)"}</button>
                <button type="button" class="u4b-pill ${state.pattern === "third" ? "active" : ""}" data-pat="third">${es ? "Un tercio 33%" : "Third-Offset 33%"}</button>
                <button type="button" class="u4b-pill ${state.pattern === "stacked" ? "active" : ""}" data-pat="stacked">${es ? "Recto" : "Stacked Grid"}</button>
              </div>
            </div>
            <div class="u4b-ctrl-row">
              <strong>${es ? "Junta de boquilla:" : "Grout line width:"}</strong>
              <div class="u4b-pills">
                <button type="button" class="u4b-pill ${state.groutIn === 0.0625 ? "active" : ""}" data-grout="0.0625">1/16″ (${es ? "Recomendado" : "Recommended"})</button>
                <button type="button" class="u4b-pill ${state.groutIn === 0.125 ? "active" : ""}" data-grout="0.125">1/8″</button>
              </div>
            </div>
            <div class="u4b-ctrl-row">
              <label for="u4Starter"><strong>${es ? "Altura 1.ª fila sobre tina:" : "Bottom row height:"}</strong> ${fmtFrac(state.starterRowIn)}</label>
              <input type="range" id="u4Starter" min="1.5" max="3.0" step="0.125" value="${state.starterRowIn}">
            </div>
            <div class="u4b-ctrl-row">
              <label for="u4HShift"><strong>${es ? "Mover azulejo izq./der.:" : "Slide tile left or right:"}</strong> ${fmtFrac(state.horizShiftIn)}</label>
              <input type="range" id="u4HShift" min="-2.0" max="2.0" step="0.25" value="${state.horizShiftIn}">
            </div>
            <div class="u4b-status ${lay.hasSliver ? "warn" : ""}">
              ${lay.hasSliver
                ? (es ? `Corte angosto detectado (${fmtFrac(Math.min(state.starterRowIn, lay.topCourseH, lay.minCut))}). Mueve la 1.ª fila o el trazo horizontal.` : `Narrow cut warning (${fmtFrac(Math.min(state.starterRowIn, lay.topCourseH, lay.minCut))}). Adjust bottom row height or slide tiles left/right.`)
                : (es ? `Sin cortes angostos: 1.ª fila ${fmtFrac(state.starterRowIn)}, fila superior ${fmtFrac(lay.topCourseH)}, menor corte en esquinas ${fmtFrac(lay.minCut)}.` : `No narrow cuts: bottom row ${fmtFrac(state.starterRowIn)}, top row ${fmtFrac(lay.topCourseH)}, smallest corner piece ${fmtFrac(lay.minCut)}.`)}
            </div>
          </div>

          <div class="u4b-grid">
            <div class="u4b-box">
              <h4>${es ? "MURO NORTE DE FONDO (69-5/16″)" : "NORTH BACK WALL (69-5/16″)"}</h4>
              <p>${es ? `La fila 1 inicia con ${fmtFrac(lay.nRows[0].firstCut)} a la izquierda y termina con ${fmtFrac(lay.nRows[0].lastCut)} a la derecha.` : `Row 1 starts with ${fmtFrac(lay.nRows[0].firstCut)} on the left and ends with ${fmtFrac(lay.nRows[0].lastCut)} on the right.`}</p>
            </div>
            <div class="u4b-box">
              <h4>${es ? "COSTADOS SIMÉTRICOS (35″)" : "SYMMETRICAL SIDE STOPS (35″)"}</h4>
              <p>${es ? "33″ de azulejo + 2″ de bullnose cerámico vertical bajando junto a la piedra hasta el piso." : "33″ of field tile plus a 2″ vertical ceramic bullnose dropping beside the stone apron to the floor."}</p>
            </div>
            <div class="u4b-box">
              <h4>${es ? "MURO OESTE (BAJO REPISA 43″)" : "WEST WALL (BELOW 43″ SILL)"}</h4>
              <p>${es ? "Azulejo únicamente debajo de la repisa de 43″ (21″ sobre la tina) hasta el borde a 35″; sin azulejo arriba de la repisa." : "Tile only below the 43″ sill (21″ above tub rim) out to the 35″ vertical bullnose edge; no tile above the sill."}</p>
            </div>
          </div>
        </section>
      `;
    } else if (state.step === "plumbing-stops") {
      cardHtml = `
        <section class="u4b-card">
          <div class="u4b-head">
            <div>
              <h1 class="u4b-title">${es ? "Paso 2 — Muro de Regadera y Muro de Ventana" : "Step 2 — Shower Wall & Window Wall"}</h1>
              <p class="u4b-sub">${es ? "Perforaciones de plomería a 15-1/2″ del rincón · En ventana, azulejo solo debajo de la repisa de 43″" : "Shower pipes sit 15-1/2″ from the North corner · Window wall is tiled below the 43″ sill only"}</p>
            </div>
            <span class="u4b-badge">${es ? "TOPES A 35″" : "35″ TILE EDGES"}</span>
          </div>

          <div class="u4h-svg-wrap" data-u4-zoom-label="${es ? "Regadera y ventana" : "Shower & Window Walls"}">
            ${buildStep2PlumbingSvg(es, lay, false)}
          </div>

          <div class="u4b-grid">
            ${lay.plumbingHits.map((p) => `
              <div class="u4b-box">
                <h4>${es ? p.es.toUpperCase() : p.en.toUpperCase()}</h4>
                <p>${es ? `A 15-1/2″ del rincón norte y ${fmtFrac(p.z)} arriba de la tina.` : `15-1/2″ from North corner and ${fmtFrac(p.z)} above tub rim.`}</p>
              </div>
            `).join("")}
          </div>

          <div class="u4b-photos">
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5474.jpg" alt="${es ? "Plomería en muro de regadera" : "Shower wall plumbing"}">
              <figcaption><strong>${es ? "Muro de regadera:" : "Shower wall:"}</strong> ${es ? "Válvula Delta, regadera y toma de agua del inodoro (~38″) fuera del tope a 35″." : "Delta valve, shower head, and toilet water line (~38″) staying clear of the 35″ tile edge."}</figcaption>
            </figure>
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5488.jpg" alt="${es ? "Frente de piedra de la tina" : "Stone tub apron depth"}">
              <figcaption><strong>${es ? "Piedra de la tina (~33″):" : "Stone tub apron (~33″):"}</strong> ${es ? "El bullnose vertical de 2″ remata de 33″ a 35″ hasta el piso." : "The 2″ vertical ceramic bullnose finishes cleanly from 33″ to 35″ down to the floor."}</figcaption>
            </figure>
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5491.jpg" alt="${es ? "Muro de ventana bajo repisa" : "Window wall below sill"}">
              <figcaption><strong>${es ? "Límite en repisa (43″):" : "43″ sill tile stop:"}</strong> ${es ? "El azulejo termina debajo de la repisa de 43″; sin azulejo en la zona superior." : "Wall tile stops below the 43″ sill; no wall tile in the upper window area."}</figcaption>
            </figure>
          </div>
        </section>
      `;
    } else if (state.step === "niches-trim") {
      cardHtml = `
        <section class="u4b-card">
          <div class="u4b-head">
            <div>
              <h1 class="u4b-title">${es ? "Paso 3 — Nichos y Orillas con Bullnose Cerámico" : "Step 3 — Niches & Ceramic Bullnose Trim"}</h1>
              <p class="u4b-sub">${es ? "Medir ambos nichos (ancho, alto y profundidad) después de impermeabilizar antes de cortar los fondos" : "Measure both niches (width, height, and depth) after waterproofing before cutting back panels"}</p>
            </div>
            <span class="u4b-badge open">${es ? "MEDIR EN OBRA" : "MEASURE ON SITE"}</span>
          </div>

          <div class="u4h-svg-wrap" data-u4-zoom-label="${es ? "Nichos y bullnose" : "Niches & Ceramic Trim"}">
            ${buildStep3NichesSvg(es, lay, false)}
          </div>

          <div class="u4b-grid">
            <div class="u4b-box">
              <h4>${es ? "NICHO IZQUIERDO" : "LEFT NICHE"}</h4>
              <p>${es ? "Aprox. 11″ ancho × 19″ alto. Medir profundidad real en obra." : "Approx. 11″ wide × 19″ tall. Measure actual depth on site."}</p>
            </div>
            <div class="u4b-box">
              <h4>${es ? "NICHO DERECHO" : "RIGHT NICHE"}</h4>
              <p>${es ? "Aprox. 7-1/2″ ancho × 14″ alto. Comparte la misma altura superior (~36″)." : "Approx. 7-1/2″ wide × 14″ tall. Shares the same ~36″ top height."}</p>
            </div>
            <div class="u4b-box">
              <h4>${es ? "ORILLAS DE CERÁMICA" : "CERAMIC BULLNOSE TRIM"}</h4>
              <p>${es ? "Rematar bordes expuestos con bullnose cerámico brillante 2″×6″ y esquinas 2″×2″ Ice White." : "Finish every exposed edge with matching 2″×6″ glossy Ice White ceramic bullnose and 2″×2″ corners."}</p>
            </div>
          </div>

          <div class="u4b-photos">
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5478.jpg" alt="${es ? "Muro de fondo con ambos nichos" : "Back tub wall with both framed niches"}">
              <figcaption><strong>${es ? "Muro de fondo:" : "Back tub wall:"}</strong> ${es ? "Vista completa con ambos nichos — medir vanos interiores tras impermeabilizar." : "Full view of both framed niches — measure inside openings after waterproofing."}</figcaption>
            </figure>
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5493.jpg" alt="${es ? "Etiqueta de caja American Olean Ice White" : "American Olean Ice White 3x6 tile box label"}">
              <figcaption><strong>${es ? "Azulejo en obra:" : "Wall tile on hand:"}</strong> ${es ? "American Olean 0025 Ice White 3″×6″ (tono 55501, 12.5 ft² por caja)." : "American Olean 0025 Ice White 3″×6″ (shade 55501, 12.5 sq ft per box)."}</figcaption>
            </figure>
          </div>
        </section>
      `;
    } else {
      const refHref = (wall, view) => `../bathroom-measurements/index.html?wall=${wall}&view=${view}&lang=${es ? "es" : "en"}&theme=${state.theme}`;
      const preTileChecks = [
        ["waterproofPhoto", "Take photos of finished waterproofing before setting tile.", "Tomar fotos de la impermeabilización terminada antes de pegar azulejo."],
        ["nicheMeasure", "Measure waterproofed width, height, and depth of both niches.", "Medir ancho, alto y profundidad interior de ambos nichos ya impermeabilizados."],
        ["valveDepth", "Check Delta shower valve depth against finished tile plane.", "Revisar la profundidad de la válvula Delta respecto al paño final del azulejo."]
      ];
      cardHtml = `
        <section class="u4b-card">
          <div class="u4b-head">
            <div>
              <h1 class="u4b-title">${es ? "Paso 4 — Verificaciones Previas y Materiales" : "Step 4 — Pre-Tile Checks & Materials"}</h1>
              <p class="u4b-sub">${es ? "Tres verificaciones antes de pegar azulejo, tabla de materiales y planos de referencia de muros y tina" : "Three pre-tile checks before setting tile, material takeoff, and wall/tub reference renderings"}</p>
            </div>
            <span class="u4b-badge">${es ? "VERIFICACIONES Y MATERIALES" : "CHECKS & MATERIALS"}</span>
          </div>

          <div class="u4b-ref-hero">
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5493.jpg" alt="${es ? "Caja American Olean 0025 Ice White en obra" : "American Olean 0025 Ice White 3x6 box on site"}">
              <figcaption><strong>${es ? "Azulejo en obra:" : "Tile on hand:"}</strong> American Olean 0025 Ice White 3″×6″ · ${es ? "Tono 55501 (12.5 ft² / 100 pzas)" : "Shade 55501 (12.5 sq ft / 100 pcs)"}</figcaption>
            </figure>
            <div class="u4b-ref-links-card">
              <div>
                <h3 class="u4b-ref-heading">${es ? "Planos de Referencia: Muros, Tina y Cuarto" : "Wall, Tub & Room Reference Renderings"}</h3>
                <p class="u4b-ref-note">${es ? "Abre las vistas a escala y sobre foto para consultar medidas de cada muro:" : "Open the scale drawings and annotated site-photo views for each wall:"}</p>
              </div>
              <div class="u4b-ref-grid">
                <a class="u4b-ref-pill" href="${refHref("room", "flat")}">
                  <strong>${es ? "Planta del Baño Completo →" : "Whole Room Floor Plan →"}</strong>
                  <span>${es ? "72-1/8″ × 82-1/8″ · Tina, lavabo, inodoro y puerta 28″" : "72-1/8″ × 82-1/8″ · Tub, sink, toilet & 28″ door"}</span>
                </a>
                <a class="u4b-ref-pill" href="${refHref("tub", "photo")}">
                  <strong>${es ? "Muro de Fondo y Nichos →" : "Tub Back Wall & Niches →"}</strong>
                  <span>${es ? "69-5/16″ ancho · Foto anotada y dibujo" : "69-5/16″ span · Annotated photo & flat drawing"}</span>
                </a>
                <a class="u4b-ref-pill" href="${refHref("tub-profile", "flat")}">
                  <strong>${es ? "Perfil y Altura de Tina →" : "Tub Height & Outer Depth →"}</strong>
                  <span>${es ? "22″ altura desde piso actual · ~33″ frente" : "22″ height from floor · ~33″ outer front"}</span>
                </a>
                <a class="u4b-ref-pill" href="${refHref("west", "photo")}">
                  <strong>${es ? "Muro Oeste de Ventana →" : "West Window Wall →"}</strong>
                  <span>${es ? "Tramo hasta repisa · Fotos de obra" : "Span to window sill · Site photos"}</span>
                </a>
              </div>
            </div>
          </div>

          <h2 class="u4b-sec-label">${es ? "Verificaciones antes de pegar azulejo" : "Pre-tile checks"}</h2>
          <div class="u4b-checks">
            ${preTileChecks.map(([k, enT, esT]) => `
              <label class="u4b-check ${state.checks[k] ? "is-done" : ""}">
                <input type="checkbox" data-chk="${k}" ${state.checks[k] ? "checked" : ""}>
                <span>${es ? esT : enT}</span>
              </label>
            `).join("")}
          </div>

          <h2 class="u4b-sec-label">${es ? "Materiales y cantidades" : "Materials & quantities"}</h2>
          <div class="u4b-table-wrap">
            <table class="u4b-table">
              <thead>
                <tr>
                  <th>${es ? "Material" : "Material"}</th>
                  <th>${es ? "Modelo / Código" : "Product / Part Number"}</th>
                  <th>${es ? "Cantidad estimada" : "Estimated Quantity"}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${es ? "Azulejo Blanco 3″×6″ (en obra)" : "Ice White 3″×6″ Wall Tile (on hand)"}</strong><br><span style="font-size:12px;color:var(--muted)">${es ? `~${lay.takeoff.tileAreaSqft} ft² de muro (+${state.wastePct}% cortes)` : `~${lay.takeoff.tileAreaSqft} sq ft tiled area (+${state.wastePct}% cuts)`}</span></td>
                  <td class="u4b-mono">American Olean 0025 36MOD1P4<br>(${es ? "Tono 55501" : "Shade 55501"})</td>
                  <td class="u4b-mono"><strong>${lay.takeoff.cartons} ${es ? "cajas" : "boxes"}</strong><br>(${es ? "restar cajas ya en obra" : "subtract boxes on site"})</td>
                </tr>
                <tr>
                  <td><strong>${es ? "Bullnose Cerámico 2″×6″" : "Matching 2″×6″ Ceramic Bullnose"}</strong></td>
                  <td class="u4b-mono">American Olean 0025S42691P4<br>(${es ? "Ice White Brillante" : "Ice White Glossy"})</td>
                  <td class="u4b-mono"><strong>${lay.takeoff.bullnosePcs} ${es ? "piezas" : "pieces"}</strong></td>
                </tr>
                <tr>
                  <td><strong>${es ? "Esquinas Bullnose 2″×2″" : "Matching 2″×2″ Bullnose Corners"}</strong></td>
                  <td class="u4b-mono">American Olean 0025SN42691P2<br>(${es ? "Ice White Brillante" : "Ice White Glossy"})</td>
                  <td class="u4b-mono"><strong>${lay.takeoff.cornerPcs} ${es ? "piezas" : "pieces"}</strong></td>
                </tr>
                <tr>
                  <td><strong>${es ? "Fondos Lisos de Nicho (1 pieza)" : "Solid 1-Piece White Niche Backs"}</strong></td>
                  <td class="u4b-mono">${es ? "Porcelánico/cerámico blanco liso · Medir en obra" : "Smooth white porcelain/ceramic · Measure on site"}</td>
                  <td class="u4b-mono"><strong>${es ? "Cortar tras medir nichos" : "Cut after measuring niches"}</strong></td>
                </tr>
                <tr>
                  <td><strong>${es ? "Boquilla y Silicón 100%" : "Wall Grout & Matching Silicone"}</strong></td>
                  <td class="u4b-mono">Mapei Ultracolor Plus FA #77 Frost<br>+ Mapesil T Plus #77 Frost</td>
                  <td class="u4b-mono"><strong>1 ${es ? "saco 10 lb" : "10-lb bag"} + 3 ${es ? "tubos" : "tubes"}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <details class="u4b-details">
            <summary>${es ? "Herramientas y suministros" : "Tools & Supplies"}</summary>
            <div class="u4b-details-body">
              <ul class="u4b-supply-list">
                <li>${es ? "Cortadora húmeda con disco continuo de diamante y almohadilla manual de pulido" : "Wet tile saw with continuous-rim diamond blade and diamond hand polishing pad"}</li>
                <li>${es ? "Nivel láser de líneas cruzadas, separadores en T de 1/16″ y cuñas de nivelación" : "Cross-line laser level, 1/16″ T-spacers, and tile leveling wedges"}</li>
                <li>${es ? "Llana dentada de 1/4″×1/4″ (azulejo 3″×6″) y llana de 1/4″×3/8″ (fondos lisos de nicho)" : "1/4″×1/4″ notched trowel (3″×6″ wall tile) and 1/4″×3/8″ trowel (solid niche backs)"}</li>
                <li>${es ? "Brocas de diamante para salida de tina, válvula Delta (4-1/2″) y brazo de regadera" : "Diamond hole saws for tub spout, Delta shower valve (4-1/2″), and shower arm"}</li>
              </ul>
            </div>
          </details>
        </section>
      `;
    }

    const prevControl = prevS
      ? `<button type="button" class="u4h-pager-btn u4b-pager-btn" id="u4Prev">← ${es ? prevS.es : prevS.en}</button>`
      : `<span class="u4b-pager-spacer" aria-hidden="true"></span>`;
    const nextControl = nextS
      ? `<button type="button" class="u4h-pager-btn is-next u4b-pager-btn" id="u4Next">${es ? nextS.es : nextS.en} →</button>`
      : `<span class="u4b-pager-spacer" aria-hidden="true"></span>`;

    const pager = `
      <div class="u4h-pager u4b-pager no-print">
        ${prevControl}
        <span class="u4h-pager-count u4b-pager-meta">${es ? `Paso ${stepIdx + 1} de ${STEPS.length}` : `Step ${stepIdx + 1} of ${STEPS.length}`}</span>
        ${nextControl}
      </div>
    `;

    body.innerHTML = cardHtml + pager;
    renderPrintSheets(es, lay);
    wireEvents(prevS, nextS);

    if (window.U4ZoomPan && typeof window.U4ZoomPan.attach === "function") {
      try { window.U4ZoomPan.attach(); } catch (_) {}
    }
    if (window.U4PinDragger && typeof window.U4PinDragger.attach === "function") {
      try { window.U4PinDragger.attach(); } catch (_) {}
    }
    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext({ step: state.step });
    }
  }

  function renderPrintSheets(es, lay) {
    const pr = document.getElementById("u4PrintRoot");
    if (!pr) return;
    pr.innerHTML = `
      <section class="u4-print-page">
        <div class="u4-print-head">
          <h2>${es ? "UNIT 4 BAÑO — TRAZO DE AZULEJO 3 MUROS (PÁG. 1/2)" : "UNIT 4 BATHROOM — 3-WALL TILE LAYOUT (PAGE 1/2)"}</h2>
          <span>${es ? "Topes 35″ · Alto 71-1/4″ · Repisa 43″" : "35″ Side Edges · 71-1/4″ Top · 43″ Sill Stop"}</span>
        </div>
        ${buildStep1Svg(es, lay, true)}
        <div style="margin-top:8px">${buildStep2PlumbingSvg(es, lay, true)}</div>
        <div class="u4-print-foot">
          <span>American Olean 0025 Ice White 3″×6″ · Matching 2″×6″ Ceramic Bullnose · Mapei #77 Frost</span>
          <span>1231 11th Ave Unit 4 · ${es ? "Pág. 1 de 2" : "Page 1 of 2"}</span>
        </div>
      </section>
      <section class="u4-print-page">
        <div class="u4-print-head">
          <h2>${es ? "UNIT 4 BAÑO — NICHOS Y MATERIALES (PÁG. 2/2)" : "UNIT 4 BATHROOM — NICHES & MATERIALS (PAGE 2/2)"}</h2>
          <span>${es ? "Medir Nichos Impermeabilizados Antes de Cortar" : "Measure Waterproofed Niches Before Cutting"}</span>
        </div>
        ${buildStep3NichesSvg(es, lay, true)}
        <div class="u4-print-foot">
          <span>${es ? `Estimado (+${state.wastePct}%): ${lay.takeoff.cartons} cajas 3″×6″ · ${lay.takeoff.bullnosePcs} bullnose 2″×6″ · 10 esq. 2″×2″ · Mapei #77 Frost` : `Est. (+${state.wastePct}%): ${lay.takeoff.cartons} boxes 3″×6″ · ${lay.takeoff.bullnosePcs} bullnose 2″×6″ · 10 corners 2″×2″ · Mapei #77 Frost`}</span>
          <span>1231 11th Ave Unit 4 · ${es ? "Pág. 2 de 2" : "Page 2 of 2"}</span>
        </div>
      </section>
    `;
  }

  function wireEvents(prevS, nextS) {
    document.querySelectorAll("[data-step]").forEach((btn) => {
      btn.onclick = () => { state.step = btn.getAttribute("data-step"); renderAll(); window.scrollTo(0, 0); };
    });
    document.querySelectorAll("[data-pat]").forEach((btn) => {
      btn.onclick = () => { state.pattern = btn.getAttribute("data-pat"); renderAll(); };
    });
    document.querySelectorAll("[data-grout]").forEach((btn) => {
      btn.onclick = () => { state.groutIn = Number(btn.getAttribute("data-grout")) || 0.0625; renderAll(); };
    });
    const stSl = document.getElementById("u4Starter");
    if (stSl) stSl.oninput = () => { state.starterRowIn = Number(stSl.value) || 2.25; renderAll(); };
    const hsSl = document.getElementById("u4HShift");
    if (hsSl) hsSl.oninput = () => { state.horizShiftIn = Number(hsSl.value) || 0; renderAll(); };
    document.querySelectorAll("[data-chk]").forEach((cb) => {
      cb.onchange = () => {
        const k = cb.getAttribute("data-chk");
        state.checks[k] = !!cb.checked;
        const row = cb.closest(".u4b-check");
        if (row) row.classList.toggle("is-done", !!cb.checked);
      };
    });
    const prevBtn = document.getElementById("u4Prev");
    if (prevBtn && prevS) prevBtn.onclick = () => { state.step = prevS.id; renderAll(); window.scrollTo(0, 0); };
    const nextBtn = document.getElementById("u4Next");
    if (nextBtn && nextS) nextBtn.onclick = () => { state.step = nextS.id; renderAll(); window.scrollTo(0, 0); };
  }

  function boot() {
    const p = new URLSearchParams(window.location.search);
    const reqStep = resolveStepId(p.get("step"));
    if (reqStep) state.step = reqStep;

    window.U4PlanControl = {
      getState: () => ({
        step: state.step,
        pattern: state.pattern,
        groutIn: state.groutIn,
        summary: "Step=" + state.step + ", Pattern=" + state.pattern
      }),
      showView: (args) => {
        if (args && args.step != null) {
          const hit = resolveStepId(args.step);
          if (hit) { state.step = hit; renderAll(); window.scrollTo(0, 0); }
        }
      }
    };

    window.U4PLAN = {
      id: "bathroom-tile",
      roomKey: "bathroom",
      documentId: "bathroom-tile",
      rev: SEED.rev,
      getLang: () => state.lang,
      setLang: (l) => { state.lang = l === "es" ? "es" : "en"; renderAll(); },
      getScaleInfo: () => state.lastScaleInfo,
      render: renderAll
    };

    if (window.U4PlanNav && document.getElementById("u4hTopbar")) {
      window.U4PlanNav.init({
        planId: "bathroom-tile",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: (l) => {
          state.lang = l === "es" ? "es" : "en";
          renderAll();
          if (window.U4LiveAi && typeof window.U4LiveAi.refreshPrompts === "function") window.U4LiveAi.refreshPrompts();
        },
        onThemeChange: (th) => {
          state.theme = th === "dark" ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      });
      state.lang = window.U4PlanNav.getLang() === "es" ? "es" : "en";
      state.theme = window.U4PlanNav.getTheme() === "dark" ? "dark" : "light";
    } else {
      state.lang = p.get("lang") === "es" ? "es" : "en";
      state.theme = p.get("theme") === "dark" ? "dark" : "light";
    }
    if (window.U4LiveAi && typeof window.U4LiveAi.init === "function") {
      window.U4LiveAi.init({
        planId: "bathroom-tile",
        room: "bathroom",
        titleEn: "Bathroom Tub & Wall Tile",
        titleEs: "Baño: Azulejo y Nichos",
        getContext: () => "Step=" + state.step + ", Pattern=" + state.pattern + ", Grout=" + fmtFrac(state.groutIn),
        quickPrompts: (lang) => lang === "es"
          ? ["¿Dónde termina el azulejo en los costados?", "¿Qué verificaciones van antes de pegar azulejo?", "¿Cuántas cajas de azulejo se estiman?"]
          : ["Where does the wall tile stop on the sides?", "What checks happen before setting tile?", "How many boxes of wall tile are estimated?"]
      });
    }
    renderAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
