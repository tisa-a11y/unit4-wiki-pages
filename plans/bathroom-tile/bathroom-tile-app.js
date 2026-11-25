(function () {
  "use strict";

  const SEED = {
    rev: "rev-20261125-bath-010",
    roomWidthIn: 72.125,
    roomDepthIn: 82.125,
    doorSlabIn: 28.0,
    backerWidthIn: 69.3125,
    tubRimHeightIn: 22.0,
    backerAboveTubIn: 71.25,
    tubOuterDepthIn: 33.0,
    eastToiletStubIn: 37.75,
    westSillRefIn: 35.0,
    westDoorwayToSillIn: 45.5,
    westSillFloorIn: 43.0,
    largeNiche: { x0: 19.0, x1: 30.0, z0: 17.0, z1: 36.0, w: 11.0, h: 19.0, depth: null },
    smallNiche: { x0: 37.5, x1: 45.0, z0: 21.75, z1: 35.75, w: 7.5, h: 14.0, depth: null },
    plumbing: [
      { id: "spout", x: 15.5, z: 5.5, diam: 1.5, en: "Tub Spout", es: "Llave de Tina", ru: "Излив ванны" },
      { id: "valve", x: 15.5, z: 27.0, diam: 4.5, en: "Shower Valve", es: "Válvula de Regadera", ru: "Смеситель душа" },
      { id: "arm", x: 15.5, z: 60.0, diam: 1.5, en: "Shower Head", es: "Salida de Regadera", ru: "Вывод лейки" }
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
    { id: "field-layout", num: 1, en: "Wall Tile Layout", es: "Trazo de Muros", ru: "Раскладка стен" },
    { id: "plumbing-stops", num: 2, en: "Shower & Window Walls", es: "Regadera y Ventana", ru: "Стены душа и окна" },
    { id: "niches-trim", num: 3, en: "Niches & Ceramic Trim", es: "Nichos y Orillas", ru: "Ниши и бордюр" },
    { id: "crew-steps", num: 4, en: "Install Steps & Materials", es: "Pasos y Materiales", ru: "Шаги и материалы" }
  ];

  const state = {
    lang: "en",
    theme: "light",
    step: "field-layout",
    pattern: "half",
    groutIn: 0.0625,
    starterRowIn: 2.25,
    horizShiftIn: 0.0,
    eastStopMode: "35",
    wastePct: 15,
    checks: {
      waterproofPhoto: false,
      nicheMeasure: false,
      valveDepth: false,
      windowReplace: false,
      medCabReturn: false,
      faucetFix: false,
      hingedDoor: false
    },
    lastScaleInfo: { view: "field-layout", scaleX: 2.95, scaleY: 2.95, uniform: true }
  };

  function pick(enT, esT, ruT) {
    if (state.lang === "es") return esT;
    if (state.lang === "ru") return ruT || enT;
    return enT;
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

  function eastFieldSpanIn() {
    if (state.eastStopMode === "33") return 31.0;
    return 33.0;
  }

  function computeLayout() {
    const grout = state.groutIn;
    const pitchW = +(SEED.wallTile.actualW + grout).toFixed(4);
    const pitchH = +(SEED.wallTile.actualH + grout).toFixed(4);
    const topCapBotZ = SEED.backerAboveTubIn - SEED.bullnose.wIn;
    const eFieldIn = eastFieldSpanIn();

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
    const eRows = courses.map((_, i) => rowJoints(eFieldIn, 0.0, i));
    const wRows = courses.map((_, i) => rowJoints(33.0, 0.0, i));

    let minCut = 99;
    [nRows[0], nRows[1], nRows[2], eRows[0], eRows[1], wRows[0]].forEach((r) => {
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
    const eastSqft = (eFieldIn * 69.25) / 144;
    const westSqft = (33.0 * 21.0) / 144;
    const tileAreaSqft = Math.round(northSqft + eastSqft + westSqft);
    const orderSqft = Math.round((northSqft + eastSqft + westSqft) * (1 + state.wastePct / 100));
    const cartons = Math.ceil(orderSqft / SEED.wallTile.sqftPerBox);

    const perimBullnoseIn = SEED.backerWidthIn + eFieldIn + (69.25 + 22.0) + (21.0 + 22.0);
    const nicheFrameIn = 2 * (SEED.largeNiche.w + SEED.largeNiche.h) + 2 * (SEED.smallNiche.w + SEED.smallNiche.h);
    const bullnosePcs = Math.ceil(((perimBullnoseIn + nicheFrameIn) / 6.0) * (1 + state.wastePct / 100));

    return {
      pitchW, pitchH, eFieldIn, totalEastIn: eFieldIn + 2.0, courses, nRows, eRows, wRows,
      minCut: +minCut.toFixed(2), topCourseH, hasSliver, plumbingHits,
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

  function buildHoldAndRefStrip() {
    const qLang = state.lang !== "en" ? `&lang=${state.lang}` : "";
    const qTheme = state.theme === "dark" ? `&theme=dark` : "";
    const baseHref = `../bathroom-measurements/index.html?v=rev010${qLang}${qTheme}`;
    return `
      <div class="u4b-hold-banner no-print">
        <strong>${pick("ACTIVE PRE-TILE HOLD (NOV 24):", "PAUSA PREVIA AL AZULEJO (24 NOV):", "ПАУЗА ПЕРЕД УКЛАДКОЙ ПЛИТКИ (24 НОЯБ.):")}</strong>
        ${pick(
          "Alex is out this week — wall tile stays on hold until: (1) bathroom window & casing are replaced (no tile above 43″ sill), (2) oversized 20″×32″ medicine cabinet is kept off the wall for return, (3) tub faucet trim is fixed, and (4) waterproofed niche dimensions are measured on site. (35″ shower stop, #77 Frost wall grout & ceramic bullnose locked Nov 25.)",
          "Alex no está disponible esta semana — el azulejo en muros queda en pausa hasta: (1) reemplazar ventana y marco (sin azulejo arriba de 43″), (2) retirar el botiquín grande de 20″×32″ para devolución, (3) corregir la llave de la tina y (4) medir los nichos impermeabilizados en obra. (Tope de 35″, boquilla #77 Frost y bullnose aprobados 25 nov.)",
          "Алекс отсутствует на этой неделе — укладка настенной плитки на паузе до: (1) замены окна и наличников (без плитки выше подоконника 43″), (2) возврата шкафчика 20″×32″, (3) исправления излива ванны и (4) замера ниш после гидроизоляции. (Край 35″, затирка #77 Frost и бордюр утверждены 25 нояб.)"
        )}
      </div>
      <div class="u4b-ref-strip no-print">
        <span><strong>${pick("Field Measurements & Photos:", "Medidas de campo y fotos:", "Полевые замеры и фото:")}</strong> ${pick("Open interactive wall & tub drawings:", "Abrir planos y fotos de referencia:", "Открыть чертежи и фото:")}</span>
        <div class="u4b-ref-links">
          <a class="u4b-ref-link" href="${baseHref}&wall=room&view=flat">${pick("Whole Room", "Todo el baño", "Вся ванная")}</a>
          <a class="u4b-ref-link" href="${baseHref}&wall=tub&view=photo">${pick("Tub Wall", "Muro tina", "Стена ванны")}</a>
          <a class="u4b-ref-link" href="${baseHref}&wall=tub-profile&view=photo">${pick("Tub Side", "Perfil tina", "Профиль ванны")}</a>
          <a class="u4b-ref-link" href="${baseHref}&wall=west&view=photo">${pick("West Wall (45-1/2″)", "Muro oeste (45-1/2″)", "Западная стена")}</a>
        </div>
      </div>
    `;
  }

  function buildStep1Svg(lay, forPrint) {
    const S = 2.95;
    if (!forPrint) state.lastScaleInfo = { view: "field-layout", scaleX: S, scaleY: S, uniform: true };
    const xWest0 = 32;
    const xNW = +(xWest0 + 36.0 * S).toFixed(1);
    const xNE = +(xNW + SEED.backerWidthIn * S).toFixed(1);
    const xEastEnd = +(xNE + 38.0 * S).toFixed(1);
    const eField = lay.eFieldIn;
    const isEastOpen = state.eastStopMode === "open";

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
        grid += `<line x1="${xNW}" y1="${yB}" x2="${(xNE + eField * S).toFixed(1)}" y2="${yB}" stroke="#C8D1D6" stroke-width="0.7"/>`;
        if (c.z0 <= 21.0) grid += `<line x1="${(xNW - 33 * S).toFixed(1)}" y1="${yB}" x2="${xNW}" y2="${yB}" stroke="#C8D1D6" stroke-width="0.7"/>`;
      }
      grid += renderVertJoints(lay.nRows[i].joints, xNW, yT, yB, S, false);
      grid += renderVertJoints(lay.eRows[i].joints, xNE, yT, yB, S, false);
      if (c.z0 < 21.0) grid += renderVertJoints(lay.wRows[i].joints, xNW, c.z1 <= 21.0 ? yT : ySill, yB, S, true);
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

    const eastLabel = lay.totalEastIn + "″ " + pick("SHOWER", "REGADERA", "ДУШ");

    return `
    <svg viewBox="0 0 680 392" xmlns="http://www.w3.org/2000/svg" role="img"
         aria-label="${pick("3-wall tub tile layout and bathroom floor plan", "Vista de los 3 muros de la tina y planta del baño", "Раскладка плитки на 3 стенах ванны и план помещения")}">
      <defs>
        <pattern id="noTileH1" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#9A5B06" stroke-width="1.1" opacity="0.32"/>
        </pattern>
      </defs>

      <text x="16" y="18" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
        ${pick("3-WALL TUB TILE LAYOUT (TO SCALE)", "VISTA DE LOS 3 MUROS DE TINA (A ESCALA)", "РАСКЛАДКА 3 СТЕН ВАННЫ (В МАСШТАБЕ)")}
      </text>
      <text x="16" y="30" font-size="7.5" fill="#5D686D">
        ${pick("Window Wall (Left, 43″ sill) | Back Tub Wall (69-5/16″) | Shower Wall (Right — 35″ locked)", "Muro Ventana (Izq., repisa 43″) | Muro Fondo (69-5/16″) | Muro Regadera (Der. — 35″ fijado)", "Окно (слева, подоконник 43″) | Задняя стена (69-5/16″) | Душ (справа — 35″ утверждён)")}
      </text>

      <rect x="${xWest0}" y="${yTopCap}" width="${(xEastEnd - xWest0).toFixed(1)}" height="${(yFloor - yTopCap).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9"/>
      <rect x="${(xNW - 35 * S).toFixed(1)}" y="${yTopCap}" width="${(35 * S).toFixed(1)}" height="${(ySill - yTopCap).toFixed(1)}" fill="url(#noTileH1)" stroke="#9A5B06" stroke-dasharray="4 3"/>
      <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${((yTopCap + ySill) / 2 - 2).toFixed(1)}" text-anchor="middle" font-size="7.2" font-weight="700" fill="#8F5305">${pick("REPLACE WINDOW", "VENTANA NUEVA", "ЗАМЕНА ОКНА")}</text>
      <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${((yTopCap + ySill) / 2 + 9).toFixed(1)}" text-anchor="middle" font-size="6.8" fill="#8F5305">${pick("(NO TILE ABOVE 43″)", "(SIN AZULEJO)", "(БЕЗ ПЛИТКИ)")}</text>

      <rect x="${xNW}" y="${yCapBot}" width="${(SEED.backerWidthIn * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
      <rect x="${xNE}" y="${yCapBot}" width="${(eField * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
      <rect x="${(xNW - 33 * S).toFixed(1)}" y="${ySill}" width="${(33 * S).toFixed(1)}" height="${(yTub - ySill).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
      ${grid}

      <rect x="${xNW}" y="${yTopCap}" width="${((SEED.backerWidthIn + eField) * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
      <rect x="${(xNE + eField * S).toFixed(1)}" y="${yTopCap}" width="${(2 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#8EC6E2" stroke="#1F5F7A"/>
      <rect x="${(xNE + eField * S).toFixed(1)}" y="${yCapBot}" width="${(2 * S).toFixed(1)}" height="${(yFloor - yCapBot).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
      <rect x="${(xNW - 35 * S).toFixed(1)}" y="${ySill}" width="${(2 * S).toFixed(1)}" height="${(yFloor - ySill).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
      <rect x="${(xNW - 35 * S - 2).toFixed(1)}" y="${(ySill - 4).toFixed(1)}" width="${(35 * S + 2).toFixed(1)}" height="4.2" fill="#C99E67" stroke="#6E471B"/>

      <rect x="${lgX}" y="${lgY}" width="${(SEED.largeNiche.w * S).toFixed(1)}" height="${(SEED.largeNiche.h * S).toFixed(1)}" fill="#FFFDF7" stroke="#9A5B06" stroke-width="1.5" stroke-dasharray="4 2"/>
      <text x="${(lgX + SEED.largeNiche.w * S / 2).toFixed(1)}" y="${(lgY + 28).toFixed(1)}" text-anchor="middle" font-size="6.4" font-weight="700" fill="#9A5B06">${pick("NICHE", "NICHO", "НИША")}</text>
      <rect x="${smX}" y="${smY}" width="${(SEED.smallNiche.w * S).toFixed(1)}" height="${(SEED.smallNiche.h * S).toFixed(1)}" fill="#FFFDF7" stroke="#9A5B06" stroke-width="1.5" stroke-dasharray="4 2"/>

      <rect x="${(xNW - 33 * S).toFixed(1)}" y="${yTub}" width="${((33 + SEED.backerWidthIn + 33) * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E7ECEF" stroke="#5D686D" stroke-width="1.2"/>
      <text x="${xCenter}" y="${(yTub + 34).toFixed(1)}" text-anchor="middle" font-size="7.8" font-weight="700" fill="#1D2326">${pick("TUB + ~33″ STONE DECK (22″ ABOVE FLOOR)", "TINA + PIEDRA ~33″ (22″ DEL PISO)", "ВАННА + КАМЕНЬ ~33″ (22″ ОТ ПОЛА)")}</text>

      <line x1="${xNW}" y1="${yTopCap - 5}" x2="${xNW}" y2="${yFloor + 5}" stroke="#1D2326" stroke-width="1.4" stroke-dasharray="5 3"/>
      <line x1="${xNE}" y1="${yTopCap - 5}" x2="${xNE}" y2="${yFloor + 5}" stroke="#1D2326" stroke-width="1.4" stroke-dasharray="5 3"/>
      <line x1="${(xNW - 35 * S).toFixed(1)}" y1="${yLaser}" x2="${(xNE + (eField + 2) * S).toFixed(1)}" y2="${yLaser}" stroke="#C92A2A" stroke-width="1.4" stroke-dasharray="6 3"/>

      <line x1="20" y1="${yFloor}" x2="${(xEastEnd + 10).toFixed(1)}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.6"/>
      <text x="${(xNW - 17.5 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.1" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">${pick("35″ SILL REF", "35″ REPISA", "35″ ПОДОК.")}</text>
      <text x="${xCenter}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">${pick("69-5/16″ BACK WALL", "69-5/16″ FONDO", "69-5/16″ СТЕНА")}</text>
      <text x="${(xNE + 18 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.0" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">${eastLabel}</text>
      <text x="${(xNW - 35 * S - 4).toFixed(1)}" y="${((ySill + yFloor) / 2).toFixed(1)}" text-anchor="end" font-size="7.6" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">43″</text>
      <text x="${(xNE + 35.5 * S).toFixed(1)}" y="${((yTopCap + yTub) / 2).toFixed(1)}" font-size="7.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">71-1/4″*</text>

      <rect x="498" y="10" width="172" height="372" rx="6" fill="#F8FAF9" stroke="#C5CCC9"/>
      <text x="584" y="27" text-anchor="middle" font-size="8.2" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
        ${pick("BATHROOM FLOOR PLAN", "PLANTA DEL BAÑO", "ПЛАН ВАННОЙ")}
      </text>
      <g transform="translate(584, 52)">
        <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#8C99A0" stroke-width="1"/>
        <polygon points="0,-11 3,-3 -3,-3" fill="#1F5F7A"/>
        <text x="0" y="-16" text-anchor="middle" font-size="7" font-weight="700" fill="#1F5F7A">${pick("N", "N", "С")}</text>
        <text x="0" y="21" text-anchor="middle" font-size="6.5" fill="#5D686D">${pick("S", "S", "Ю")}</text>
        <text x="-19" y="2.5" text-anchor="middle" font-size="6.5" fill="#5D686D">${pick("W", "O", "З")}</text>
        <text x="19" y="2.5" text-anchor="middle" font-size="6.5" fill="#5D686D">${pick("E", "E", "В")}</text>
      </g>

      <rect x="${kpX}" y="${kpY}" width="${kpW}" height="${kpD}" fill="#FFFFFF" stroke="#1D2326" stroke-width="1.6"/>
      <rect x="${kpX}" y="${kpY}" width="${kpW}" height="${(33 * Sk).toFixed(1)}" fill="#E3EEF2" stroke="#1F5F7A" stroke-width="1.2"/>
      <text x="${(kpX + kpW / 2).toFixed(1)}" y="${(kpY + 34).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" fill="#1F5F7A">${pick("TUB", "TINA", "ВАННА")}</text>
      <rect x="${kpX + 2}" y="${(kpY + 86).toFixed(1)}" width="28" height="32" rx="4" fill="#F4F5F3" stroke="#5D686D"/>
      <text x="${kpX + 16}" y="${(kpY + 105).toFixed(1)}" text-anchor="middle" font-size="6.2" fill="#1D2326">${pick("Sink", "Lavabo", "Раковина")}</text>
      <rect x="${(kpX + kpW - 30).toFixed(1)}" y="${(kpY + 88).toFixed(1)}" width="28" height="30" rx="4" fill="#F4F5F3" stroke="#5D686D"/>
      <text x="${(kpX + kpW - 16).toFixed(1)}" y="${(kpY + 106).toFixed(1)}" text-anchor="middle" font-size="6.2" fill="#1D2326">${pick("Toilet", "Inodoro", "Унитаз")}</text>

      <line x1="${doorX}" y1="${(kpY + kpD).toFixed(1)}" x2="${(+doorX + doorW).toFixed(1)}" y2="${(kpY + kpD).toFixed(1)}" stroke="#FFFFFF" stroke-width="3"/>
      <line x1="${doorX}" y1="${(kpY + kpD).toFixed(1)}" x2="${doorX}" y2="${(kpY + kpD + doorW * 0.72).toFixed(1)}" stroke="#2F6B3F" stroke-width="2"/>
      <path d="M ${doorX} ${(kpY + kpD + doorW * 0.72).toFixed(1)} A ${(doorW * 0.72).toFixed(1)} ${(doorW * 0.72).toFixed(1)} 0 0 0 ${(+doorX + doorW * 0.72).toFixed(1)} ${(kpY + kpD).toFixed(1)}" fill="none" stroke="#2F6B3F" stroke-width="1.2" stroke-dasharray="3 2"/>
      <text x="584" y="${(kpY + kpD + 54).toFixed(1)}" text-anchor="middle" font-size="7.2" font-weight="700" fill="#2F6B3F">${pick("28″ HINGED DOOR", "PUERTA ABATIBLE 28″", "ДВЕРЬ НА ПЕТЛЯХ 28″")}</text>
      <text x="584" y="${(kpY + kpD + 65).toFixed(1)}" text-anchor="middle" font-size="6.6" fill="#5D686D">${pick("Swings out into hallway", "Abre hacia el pasillo", "Открывается в коридор")}</text>
      <text x="584" y="${(kpY + kpD + 76).toFixed(1)}" text-anchor="middle" font-size="6.4" fill="#9A5B06">${pick("(Pocket door retired)", "(Sin puerta corrediza)", "(Без пенала)")}</text>
      <text x="584" y="${(kpY + kpD + 96).toFixed(1)}" text-anchor="middle" font-size="6.6" font-family="IBM Plex Mono, monospace" fill="#5D686D">72-1/8″ × 82-1/8″</text>
    </svg>
    `;
  }

  function buildStep2PlumbingSvg(lay, forPrint) {
    const S = 3.1;
    if (!forPrint) state.lastScaleInfo = { view: "plumbing-stops", scaleX: S, scaleY: S, uniform: true };
    const yZ = (z) => +(40 + (76.0 - z) * S).toFixed(1);
    const yTopCap = yZ(71.25);
    const yCapBot = yZ(69.25);
    const yTub = yZ(0);
    const yFloor = yZ(-22.0);
    const ySill = yZ(21.0);

    const ex0 = 28;
    const eField = lay.eFieldIn;
    const wxCorner = 618;
    const wxStop = +(wxCorner - 35 * S).toFixed(1);
    const wxApron = +(wxCorner - 33 * S).toFixed(1);

    let eGrid = "";
    let wGrid = "";
    lay.courses.forEach((c, i) => {
      const yT = yZ(c.z1);
      const yB = yZ(c.z0);
      if (i > 0) {
        eGrid += `<line x1="${ex0}" y1="${yB}" x2="${(ex0 + eField * S).toFixed(1)}" y2="${yB}" stroke="#C8D1D6" stroke-width="0.7"/>`;
        if (c.z0 <= 21.0) wGrid += `<line x1="${wxApron}" y1="${yB}" x2="${wxCorner}" y2="${yB}" stroke="#C8D1D6" stroke-width="0.7"/>`;
      }
      eGrid += renderVertJoints(lay.eRows[i].joints, ex0, yT, yB, S, false);
      if (c.z0 < 21.0) wGrid += renderVertJoints(lay.wRows[i].joints, wxCorner, c.z1 <= 21.0 ? yT : ySill, yB, S, true);
    });

    const pMarks = lay.plumbingHits.map((p) => {
      const cx = +(ex0 + p.x * S).toFixed(1);
      const cy = yZ(p.z);
      const r = p.id === "valve" ? 7 : 3.4;
      const pName = pick(p.en, p.es, p.ru);
      return `
        <line x1="${ex0}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="#C92A2A" stroke-width="0.9" stroke-dasharray="3 2"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#F2D492" stroke="#9A5B06" stroke-width="1.4"/>
        <rect x="${(ex0 + 39 * S).toFixed(1)}" y="${(cy - 9).toFixed(1)}" width="156" height="18" rx="4" fill="#FFF8EB" stroke="#9A5B06" stroke-width="0.9"/>
        <text x="${(ex0 + 39 * S + 6).toFixed(1)}" y="${(cy + 3).toFixed(1)}" font-size="7.0" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#7A4404">
          ${pName} (${fmtFrac(p.z)})
        </text>
      `;
    }).join("");

    return `
    <svg viewBox="0 0 660 384" xmlns="http://www.w3.org/2000/svg" role="img"
         aria-label="${pick("Shower wall plumbing and window wall stop", "Muro de regadera y muro de ventana", "Стена душа и стена окна")}">
      <defs>
        <pattern id="noTileH2" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#9A5B06" stroke-width="1.1" opacity="0.32"/>
        </pattern>
      </defs>

      <text x="${ex0}" y="18" font-size="9.0" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
        ${pick("SHOWER WALL (EAST) · 35″ LOCKED", "MURO DE REGADERA · 35″ FIJADO", "СТЕНА ДУША · 35″ УТВЕРЖДЁН")}
      </text>
      <text x="${ex0}" y="30" font-size="7.3" fill="#5D686D">
        ${pick("Pipes at 15-1/2″ · Tub front ~33″ · Toilet stub at 37-3/4″", "Salidas a 15-1/2″ · Frente tina ~33″ · Toma WC a 37-3/4″", "Трубы 15-1/2″ · Край ванны ~33″ · Подводка унитаза 37-3/4″")}
      </text>

      <rect x="${ex0}" y="${yTopCap}" width="${(40 * S).toFixed(1)}" height="${(yFloor - yTopCap).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9"/>
      <rect x="${ex0}" y="${yCapBot}" width="${(eField * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
      ${eGrid}
      <rect x="${ex0}" y="${yTopCap}" width="${(eField * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
      <rect x="${(ex0 + eField * S).toFixed(1)}" y="${yTopCap}" width="${(2 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#8EC6E2" stroke="#1F5F7A"/>
      <rect x="${(ex0 + eField * S).toFixed(1)}" y="${yCapBot}" width="${(2 * S).toFixed(1)}" height="${(yFloor - yCapBot).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
      <rect x="${ex0}" y="${yTub}" width="${(33 * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E7ECEF" stroke="#5D686D" stroke-width="1.2"/>
      <text x="${(ex0 + 16.5 * S).toFixed(1)}" y="${(yTub + 34).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" fill="#1D2326">${pick("~33″ TUB FRONT", "FRENTE TINA ~33″", "КРАЙ ВАННЫ ~33″")}</text>
      ${pMarks}
      <circle cx="${(ex0 + 37.75 * S).toFixed(1)}" cy="${yZ(-14)}" r="3.2" fill="#C86D3B" stroke="#1D2326"/>
      <line x1="${ex0 - 6}" y1="${yFloor}" x2="${(ex0 + 41 * S).toFixed(1)}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.6"/>
      <text x="${(ex0 + 17.5 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">${lay.totalEastIn}″</text>

      <text x="${wxStop}" y="18" font-size="9.0" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
        ${pick("WINDOW WALL (WEST) · 43″ SILL", "MURO DE VENTANA · REPISA 43″", "СТЕНА ОКНА · ПОДОКОННИК 43″")}
      </text>
      <text x="${wxStop}" y="30" font-size="7.3" fill="#5D686D">
        ${pick("35″ sill ref (45-1/2″ from doorway edge) · Replace window first", "35″ repisa (45-1/2″ desde puerta) · Reemplazar ventana primero", "35″ до подоконника (45-1/2″ от двери) · Сначала окно")}
      </text>
      <rect x="${wxStop}" y="${yTopCap}" width="${(35 * S).toFixed(1)}" height="${(ySill - yTopCap).toFixed(1)}" fill="url(#noTileH2)" stroke="#9A5B06" stroke-dasharray="4 3"/>
      <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${((yTopCap + ySill) / 2 - 2).toFixed(1)}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#8F5305">${pick("REPLACE WINDOW", "VENTANA NUEVA", "ЗАМЕНА ОКНА")}</text>
      <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${((yTopCap + ySill) / 2 + 10).toFixed(1)}" text-anchor="middle" font-size="7" fill="#8F5305">${pick("(NO TILE ABOVE SILL)", "(SIN AZULEJO)", "(БЕЗ ПЛИТКИ)")}</text>
      <rect x="${wxApron}" y="${ySill}" width="${(33 * S).toFixed(1)}" height="${(yTub - ySill).toFixed(1)}" fill="#FFFFFF" stroke="#8C99A0"/>
      ${wGrid}
      <rect x="${wxStop}" y="${ySill}" width="${(2 * S).toFixed(1)}" height="${(yFloor - ySill).toFixed(1)}" fill="#D6ECF8" stroke="#1F5F7A"/>
      <rect x="${wxStop - 2}" y="${ySill - 4}" width="${(35 * S + 2).toFixed(1)}" height="4.2" fill="#C99E67" stroke="#6E471B"/>
      <rect x="${wxApron}" y="${yTub}" width="${(33 * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E7ECEF" stroke="#5D686D" stroke-width="1.2"/>
      <line x1="${wxStop - 6}" y1="${yFloor}" x2="${wxCorner + 6}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.6"/>
      <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">${pick("35″ SILL REF · 45-1/2″ DOOR SPAN", "35″ REPISA · 45-1/2″ PUERTA", "35″ ПОДОК. · 45-1/2″ ОТ ДВЕРИ")}</text>
      <text x="${wxStop - 5}" y="${((ySill + yFloor) / 2).toFixed(1)}" text-anchor="end" font-size="7.8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#2F6B3F">43″</text>
    </svg>
    `;
  }

  function buildStep3NichesSvg(lay, forPrint) {
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
         aria-label="${pick("Back wall niches and ceramic bullnose side section", "Nichos en muro de fondo y corte lateral con bullnose cerámico", "Ниши на задней стене и боковой разрез с керамическим бордюром")}">
      <text x="20" y="20" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
        ${pick("1. BACK WALL NICHES", "1. NICHOS EN MURO DE FONDO", "1. НИШИ НА ЗАДНЕЙ СТЕНЕ")}
      </text>
      <text x="20" y="33" font-size="7.6" fill="#9A5B06" font-weight="600">
        ${pick("Approximate sizes — measure waterproofed openings before cutting", "Medidas aproximadas — medir nichos impermeabilizados antes de cortar", "Размеры ориентировочные — замерьте проёмы после гидроизоляции")}
      </text>

      <rect x="${ox}" y="${oy}" width="${wallW}" height="${wallH}" fill="#FFFFFF" stroke="#8C99A0" stroke-width="1.2"/>
      <rect x="${lgX}" y="${lgY}" width="${(SEED.largeNiche.w * S).toFixed(1)}" height="${(SEED.largeNiche.h * S).toFixed(1)}" fill="#F6FAFC" stroke="#9A5B06" stroke-width="1.8" stroke-dasharray="5 3"/>
      <text x="${(lgX + SEED.largeNiche.w * S / 2).toFixed(1)}" y="${(lgY + 28).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" fill="#1F5F7A">${pick("LEFT NICHE", "NICHO IZQ.", "ЛЕВАЯ")}</text>
      <text x="${(lgX + SEED.largeNiche.w * S / 2).toFixed(1)}" y="${(lgY + 40).toFixed(1)}" text-anchor="middle" font-size="7.2" font-family="IBM Plex Mono, monospace" fill="#1D2326">~11″×19″</text>

      <rect x="${smX}" y="${smY}" width="${(SEED.smallNiche.w * S).toFixed(1)}" height="${(SEED.smallNiche.h * S).toFixed(1)}" fill="#F6FAFC" stroke="#9A5B06" stroke-width="1.8" stroke-dasharray="5 3"/>
      <text x="${(smX + SEED.smallNiche.w * S / 2).toFixed(1)}" y="${(smY + 22).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700" fill="#1F5F7A">${pick("RIGHT", "NICHO DER.", "ПРАВАЯ")}</text>
      <text x="${(smX + SEED.smallNiche.w * S / 2).toFixed(1)}" y="${(smY + 34).toFixed(1)}" text-anchor="middle" font-size="6.8" font-family="IBM Plex Mono, monospace" fill="#1D2326">~7.5″×14″</text>

      <line x1="${ox}" y1="${lgY}" x2="${(ox + wallW).toFixed(1)}" y2="${lgY}" stroke="#2F6B3F" stroke-width="1" stroke-dasharray="4 2"/>
      <text x="${(ox + wallW - 4).toFixed(1)}" y="${(lgY - 5).toFixed(1)}" text-anchor="end" font-size="7" font-weight="700" fill="#2F6B3F">${pick("Shared ~36″ top (~35-1/2″ to 36″)", "Misma altura superior (~36″)", "Общий верх ~36″")}</text>

      <text x="${ox}" y="${(oy + wallH + 15).toFixed(1)}" font-size="7.4" fill="#5D686D">${pick("← Window Side", "← Lado Ventana", "← Окно")}</text>
      <text x="${(ox + wallW).toFixed(1)}" y="${(oy + wallH + 15).toFixed(1)}" text-anchor="end" font-size="7.4" fill="#5D686D">${pick("Shower Side →", "Lado Regadera →", "Душ →")}</text>
      <text x="${ox}" y="${(oy + wallH + 32).toFixed(1)}" font-size="7.3" fill="#1D2326">${pick("Left bottom ~17″ · Right bottom ~21-3/4″ above tub rim.", "Base izq. ~17″ · Base der. ~21-3/4″ sobre borde de tina.", "Низ левой ~17″ · Низ правой ~21-3/4″ от борта ванны.")}</text>
      <text x="${ox}" y="${(oy + wallH + 45).toFixed(1)}" font-size="7.2" fill="#9A5B06">${pick("Both niche depths still to be measured on site.", "Profundidad de ambos nichos por medir en obra.", "Глубину обеих ниш замерить на месте.")}</text>

      <rect x="312" y="10" width="326" height="264" rx="6" fill="#F8FAF9" stroke="#C5CCC9"/>
      <text x="324" y="27" font-size="9" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
        ${pick("2. HOW TILE MEETS THE NICHE", "2. CORTE LATERAL DEL NICHO", "2. ПРИМЫКАНИЕ ПЛИТКИ К НИШЕ")}
      </text>
      <text x="324" y="39" font-size="7.2" fill="#5D686D">
        ${pick("Side cutaway (measure niche depth on site)", "Esquema de armado (profundidad por medir en obra)", "Боковой разрез (глубину замерить на месте)")}
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

      <text x="442" y="68" font-size="7.4" font-weight="700" fill="#1D2326">${pick("3″×6″ wall tile", "Azulejo 3″×6″ en muro", "Плитка стены 3″×6″")}</text>
      <text x="442" y="85" font-size="7.4" font-weight="700" fill="#1F5F7A">${pick("2″×6″ ceramic bullnose", "Bullnose cerámico 2″×6″", "Керам. бордюр 2″×6″")}</text>
      <text x="442" y="114" font-size="7.4" font-weight="700" fill="#C92A2A">① ${pick("Waterproof entire niche", "Impermeabilizar todo", "Гидроизоляция всей ниши")}</text>
      <text x="442" y="138" font-size="7.4" font-weight="700" fill="#1F5F7A">② ${pick("Set solid back panel first", "Pegar fondo liso primero", "Сначала цельная задняя панель")}</text>
      <text x="442" y="151" font-size="6.8" fill="#5D686D">${pick("Cut edges stay hidden", "Los cantos quedan ocultos", "Срезы скрыты боковинами")}</text>
      <text x="442" y="176" font-size="7.4" font-weight="700" fill="#2F6B3F">③ ${pick("Slope bottom sill to tub", "Repisa con caída hacia tina", "Уклон полки в сторону ванны")}</text>
      <text x="442" y="200" font-size="7.4" font-weight="700" fill="#1F5F7A">④ ${pick("Set side/top pieces in front", "Colocar retornos al frente", "Боковины поверх задней")}</text>
      <text x="442" y="213" font-size="6.8" fill="#2F6B3F">${pick("Seal corners with silicone", "Sellar esquinas con silicón", "Углы — 100% силикон")}</text>
      <text x="442" y="242" font-size="7" font-weight="700" fill="#9A5B06">${pick("Depth: measure on site", "Profundidad: medir en obra", "Глубина: замер на месте")}</text>
    </svg>
    `;
  }

  function renderAll() {
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-theme", state.theme);
    const lay = computeLayout();
    const stepIdx = STEPS.findIndex((s) => s.id === state.step);
    const prevS = stepIdx > 0 ? STEPS[stepIdx - 1] : null;
    const nextS = stepIdx < STEPS.length - 1 ? STEPS[stepIdx + 1] : null;

    const stepBar = document.getElementById("u4hStepBar");
    if (stepBar) {
      stepBar.innerHTML = STEPS.map((s) => `
        <button type="button" class="u4b-step-btn ${s.id === state.step ? "active" : ""}" data-step="${s.id}">
          <span class="u4b-step-num">${s.num}</span>
          <span>${pick(s.en, s.es, s.ru)}</span>
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
              <h1 class="u4b-title">${pick("Step 1 — 3-Wall Tile Layout & Pattern", "Paso 1 — Trazo de Azulejo en los 3 Muros", "Шаг 1 — Раскладка плитки на 3 стенах")}</h1>
              <p class="u4b-sub">${pick("American Olean 0025 Ice White 3″×6″ with matching ceramic bullnose trim · Back wall 69-5/16″ · Top 71-1/4″ above tub rim", "American Olean 0025 Ice White 3″×6″ con bullnose cerámico · Fondo 69-5/16″ · Altura 71-1/4″ sobre tina", "American Olean 0025 Ice White 3″×6″ с керамическим бордюром · Задняя стена 69-5/16″ · Высота 71-1/4″ от ванны")}</p>
            </div>
            <span class="u4b-badge">${pick("SCALE DRAWING", "DIBUJO A ESCALA", "В МАСШТАБЕ")}</span>
          </div>

          <div class="u4h-svg-wrap" data-u4-zoom-label="3-Wall Tile Layout">
            ${buildStep1Svg(lay, false)}
          </div>

          <div class="u4b-ctrl-panel">
            <div class="u4b-ctrl-row">
              <strong>${pick("Shower-wall tile stop (LOCKED 35″):", "Tope en muro de regadera (FIJADO 35″):", "Край плитки на стене душа (35″ УТВЕРЖДЁН):")}</strong>
              <div class="u4b-pills">
                <button type="button" class="u4b-pill ${state.eastStopMode === "35" ? "active" : ""}" data-east="35">${pick("35″ Locked (match sill ref)", "35″ Fijado (igual a repisa)", "35″ Утверждён")}</button>
                <button type="button" class="u4b-pill ${state.eastStopMode === "33" ? "active" : ""}" data-east="33">${pick("Compare 33″ (tub front)", "Comparar 33″ (frente tina)", "Сравнить 33″")}</button>
              </div>
            </div>
            <div class="u4b-ctrl-row">
              <strong>${pick("Tile pattern:", "Patrón:", "Схема укладки:")}</strong>
              <div class="u4b-pills">
                <button type="button" class="u4b-pill ${state.pattern === "half" ? "active" : ""}" data-pat="half">${pick("Half-Offset 50% (Rec.)", "Mitad 50% (Rec.)", "Вразбежку 50% (рек.)")}</button>
                <button type="button" class="u4b-pill ${state.pattern === "third" ? "active" : ""}" data-pat="third">${pick("Third-Offset 33%", "Un tercio 33%", "Смещение 33%")}</button>
                <button type="button" class="u4b-pill ${state.pattern === "stacked" ? "active" : ""}" data-pat="stacked">${pick("Stacked Grid", "Recto", "Шов в шов")}</button>
              </div>
            </div>
            <div class="u4b-ctrl-row">
              <strong>${pick("Grout line width:", "Junta de boquilla:", "Ширина шва:")}</strong>
              <div class="u4b-pills">
                <button type="button" class="u4b-pill ${state.groutIn === 0.0625 ? "active" : ""}" data-grout="0.0625">1/16″ (${pick("Recommended", "Recomendado", "Рек.")})</button>
                <button type="button" class="u4b-pill ${state.groutIn === 0.125 ? "active" : ""}" data-grout="0.125">1/8″</button>
              </div>
            </div>
            <div class="u4b-ctrl-row">
              <label for="u4Starter"><strong>${pick("Bottom row height:", "Altura 1.ª fila sobre tina:", "Высота 1-го ряда:")}</strong> ${fmtFrac(state.starterRowIn)}</label>
              <input type="range" id="u4Starter" min="1.5" max="3.0" step="0.125" value="${state.starterRowIn}">
            </div>
            <div class="u4b-ctrl-row">
              <label for="u4HShift"><strong>${pick("Slide tile left or right:", "Mover azulejo izq./der.:", "Сдвиг влево/вправо:")}</strong> ${fmtFrac(state.horizShiftIn)}</label>
              <input type="range" id="u4HShift" min="-2.0" max="2.0" step="0.25" value="${state.horizShiftIn}">
            </div>
            <div class="u4b-status ${lay.hasSliver ? "warn" : ""}">
              ${lay.hasSliver
                ? pick(`Narrow cut warning (${fmtFrac(Math.min(state.starterRowIn, lay.topCourseH, lay.minCut))}). Adjust bottom row height or slide tiles left/right.`, `Corte angosto detectado (${fmtFrac(Math.min(state.starterRowIn, lay.topCourseH, lay.minCut))}). Ajusta la 1.ª fila o el trazo horizontal.`, `Узкая подрезка (${fmtFrac(Math.min(state.starterRowIn, lay.topCourseH, lay.minCut))}). Скорректируйте 1-й ряд или горизонтальный сдвиг.`)
                : pick(`No narrow cuts: bottom row ${fmtFrac(state.starterRowIn)}, top row ${fmtFrac(lay.topCourseH)}, smallest corner piece ${fmtFrac(lay.minCut)}.`, `Sin cortes angostos: 1.ª fila ${fmtFrac(state.starterRowIn)}, fila superior ${fmtFrac(lay.topCourseH)}, menor corte en esquinas ${fmtFrac(lay.minCut)}.`, `Без узких подрезок: 1-й ряд ${fmtFrac(state.starterRowIn)}, верхний ряд ${fmtFrac(lay.topCourseH)}, мин. угловой рез ${fmtFrac(lay.minCut)}.`)}
            </div>
          </div>

          <div class="u4b-grid">
            <div class="u4b-box">
              <h4>${pick("BACK TUB WALL (69-5/16″)", "MURO DE FONDO (69-5/16″)", "ЗАДНЯЯ СТЕНА (69-5/16″)")}</h4>
              <p>${pick(`Row 1 starts with ${fmtFrac(lay.nRows[0].firstCut)} on the left and ends with ${fmtFrac(lay.nRows[0].lastCut)} on the right. *Verify 71-1/4″ top height on site (one earlier note typed 71-1/14″).`, `La fila 1 inicia con ${fmtFrac(lay.nRows[0].firstCut)} a la izq. y termina con ${fmtFrac(lay.nRows[0].lastCut)} a la der. *Confirmar altura 71-1/4″ en obra (nota previa escribió 71-1/14″).`, `1-й ряд: ${fmtFrac(lay.nRows[0].firstCut)} слева и ${fmtFrac(lay.nRows[0].lastCut)} справа. *Проверьте высоту 71-1/4″ на месте.`)}</p>
            </div>
            <div class="u4b-box">
              <h4>${pick("SHOWER & WINDOW STOPS", "TOPES EN REGADERA Y VENTANA", "КРАЯ У ДУША И ОКНА")}</h4>
              <p>${pick("Shower-wall stop is LOCKED at 35″ (33″ field + 2″ ceramic bullnose; clears 37-3/4″ toilet stub by 2-3/4″). Window wall matches at 35″ below the 43″ sill (45-1/2″ from doorway-side edge).", "El tope del muro de regadera está FIJADO en 35″ (33″ de azulejo + 2″ de bullnose; libra por 2-3/4″ la toma de WC a 37-3/4″). El muro de ventana coincide en 35″ bajo la repisa de 43″.", "Край плитки на стене душа УТВЕРЖДЁН на 35″ (33″ плитка + 2″ бордюр; зазор 2-3/4″ до подводки 37-3/4″). На стене окна — 35″ ниже подоконника 43″.")}</p>
            </div>
            <div class="u4b-box">
              <h4>${pick("BATHROOM ENTRY DOOR", "PUERTA DE ENTRADA", "ВХОДНАЯ ДВЕРЬ")}</h4>
              <p>${pick("Pocket door permanently retired (Nov 24). Reuse the 28″ × 1-3/8″ slab on hinges swinging outward into the hallway.", "Puerta corrediza retirada definitivamente (24 nov). Se reutiliza la hoja de 28″ × 1-3/8″ con bisagras abriendo hacia el pasillo.", "Раздвижная дверь отменена (24 нояб.). Используется полотно 28″ × 1-3/8″ на петлях с открыванием наружу в коридор.")}</p>
            </div>
          </div>
        </section>
      `;
    } else if (state.step === "plumbing-stops") {
      cardHtml = `
        <section class="u4b-card">
          <div class="u4b-head">
            <div>
              <h1 class="u4b-title">${pick("Step 2 — Shower Wall & Window Wall", "Paso 2 — Muro de Regadera y Muro de Ventana", "Шаг 2 — Стена душа и стена окна")}</h1>
              <p class="u4b-sub">${pick("Shower pipes sit 15-1/2″ from the back corner · Window wall is tiled below the 43″ sill only after window replacement", "Tuberías a 15-1/2″ del rincón · El muro de ventana solo lleva azulejo bajo la repisa de 43″ tras cambiar la ventana", "Трубы душа в 15-1/2″ от угла · Стена окна облицовывается только ниже подоконника 43″ после замены окна")}</p>
            </div>
            <span class="u4b-badge">${pick("35″ STOP LOCKED", "TOPE 35″ FIJADO", "КРАЙ 35″ УТВЕРЖДЁН")}</span>
          </div>

          <div class="u4h-svg-wrap" data-u4-zoom-label="Shower & Window Walls">
            ${buildStep2PlumbingSvg(lay, false)}
          </div>

          <div class="u4b-grid">
            ${lay.plumbingHits.map((p) => `
              <div class="u4b-box">
                <h4>${pick(p.en, p.es, p.ru).toUpperCase()}</h4>
                <p>${pick(`15-1/2″ from back corner and ${fmtFrac(p.z)} above tub rim.`, `A 15-1/2″ del rincón y ${fmtFrac(p.z)} arriba de la tina.`, `15-1/2″ от заднего угла и ${fmtFrac(p.z)} над бортом ванны.`)}</p>
              </div>
            `).join("")}
          </div>

          <div class="u4b-photos">
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5474.jpg" alt="Shower wall plumbing">
              <figcaption><strong>${pick("Shower wall:", "Muro de regadera:", "Стена душа:")}</strong> ${pick("Delta valve, shower head, and toilet water stub (37-3/4″). Tile stops at 35″ (2-3/4″ clear of toilet stub).", "Válvula Delta, regadera y toma de agua del WC (37-3/4″). El azulejo termina a 35″ (2-3/4″ libre de la toma).", "Смеситель Delta, лейка и подводка унитаза (37-3/4″). Плитка заканчивается на 35″ (зазор 2-3/4″).")}</figcaption>
            </figure>
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5488.jpg" alt="Stone tub apron depth">
              <figcaption><strong>${pick("Outer tub front (~33″):", "Frente exterior de tina (~33″):", "Внешний край ванны (~33″):")}</strong> ${pick("Measured from back wall to outer front; fix tub faucet trim before closing wall tile.", "Medido desde el muro de fondo; corregir la llave de tina antes de cerrar con azulejo.", "От задней стены до переднего края; исправьте излив ванны до укладки.")}</figcaption>
            </figure>
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5491.jpg" alt="Window wall below sill">
              <figcaption><strong>${pick("Window wall (43″ sill):", "Muro de ventana (repisa 43″):", "Стена окна (43″):")}</strong> ${pick("45-1/2″ from doorway-side estimated edge to sill (35″ from tub wall). Replace window & casing first.", "45-1/2″ desde borde estimado junto a puerta hasta repisa (35″ desde tina). Cambiar ventana y marco primero.", "45-1/2″ от края у двери до подоконника (35″ от стены ванны). Сначала замените окно.")}</figcaption>
            </figure>
          </div>
        </section>
      `;
    } else if (state.step === "niches-trim") {
      cardHtml = `
        <section class="u4b-card">
          <div class="u4b-head">
            <div>
              <h1 class="u4b-title">${pick("Step 3 — Niches & Ceramic Bullnose Trim", "Paso 3 — Nichos y Orillas con Bullnose Cerámico", "Шаг 3 — Ниши и керамический бордюр")}</h1>
              <p class="u4b-sub">${pick("Measure both niches (width, height, and depth) after waterproofing before cutting solid white back panels", "Medir ambos nichos (ancho, alto y profundidad) después de impermeabilizar antes de cortar los fondos", "Замерьте обе ниши (ширину, высоту и глубину) после гидроизоляции перед резкой задних панелей")}</p>
            </div>
            <span class="u4b-badge open">${pick("MEASURE ON SITE", "MEDIR EN OBRA", "ЗАМЕР НА МЕСТЕ")}</span>
          </div>

          <div class="u4h-svg-wrap" data-u4-zoom-label="Niches & Ceramic Trim">
            ${buildStep3NichesSvg(lay, false)}
          </div>

          <div class="u4b-grid">
            <div class="u4b-box">
              <h4>${pick("LEFT NICHE", "NICHO IZQUIERDO", "ЛЕВАЯ НИША")}</h4>
              <p>${pick("Approx. 11″ wide × 19″ tall (X: ~19″→30″, Z: ~17″→36″ above tub). Measure waterproofed depth on site.", "Aprox. 11″ ancho × 19″ alto (X: ~19″→30″, Z: ~17″→36″ sobre tina). Medir profundidad real en obra.", "Около 11″ × 19″ (X: ~19″→30″, Z: ~17″→36″). Глубину замерить после гидроизоляции.")}</p>
            </div>
            <div class="u4b-box">
              <h4>${pick("RIGHT NICHE", "NICHO DERECHO", "ПРАВАЯ НИША")}</h4>
              <p>${pick("Approx. 7-1/2″ wide × 14″ tall (X: ~37-1/2″→45″, bottom ~21-3/4″, top ~35-1/2″–36″). Measure depth on site.", "Aprox. 7-1/2″ ancho × 14″ alto (X: ~37-1/2″→45″, base ~21-3/4″, tope ~35-1/2″–36″). Medir profundidad en obra.", "Около 7-1/2″ × 14″ (X: ~37-1/2″→45″, низ ~21-3/4″, верх ~35-1/2″–36″). Глубину замерить на месте.")}</p>
            </div>
            <div class="u4b-box">
              <h4>${pick("CERAMIC BULLNOSE TRIM", "ORILLAS DE CERÁMICA", "КЕРАМИЧЕСКИЙ БОРДЮР")}</h4>
              <p>${pick("Approved to order (Nov 25): matching glossy Ice White 2″×6″ ceramic bullnose (0025S42691P4) and 2″×2″ corners (0025SN42691P2).", "Aprobado para pedido (25 nov): bullnose cerámico brillante Ice White 2″×6″ (0025S42691P4) y esquinas 2″×2″ (0025SN42691P2).", "Одобрено к заказу (25 нояб.): глянцевый керамический бордюр 2″×6″ (0025S42691P4) и уголки 2″×2″ (0025SN42691P2) Ice White.")}</p>
            </div>
          </div>

          <div class="u4b-photos">
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5478.jpg" alt="Back tub wall with both framed niches">
              <figcaption><strong>${pick("Back tub wall:", "Muro de fondo:", "Задняя стена:")}</strong> ${pick("69-5/16″ backer span with both framed niches — measure inside openings after waterproofing.", "69-5/16″ de respaldo con ambos nichos — medir vanos interiores tras impermeabilizar.", "Ширина 69-5/16″ с двумя нишами — замерьте проёмы после гидроизоляции.")}</figcaption>
            </figure>
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5493.jpg" alt="American Olean Ice White 3x6 tile box label">
              <figcaption><strong>${pick("Wall tile on hand:", "Azulejo en obra:", "Плитка на объекте:")}</strong> ${pick("American Olean 0025 Ice White 3″×6″ (shade 55501, 12.5 sq ft per box).", "American Olean 0025 Ice White 3″×6″ (tono 55501, 12.5 ft² por caja).", "American Olean 0025 Ice White 3″×6″ (тон 55501, 12.5 кв. футов в коробке).")}</figcaption>
            </figure>
          </div>
        </section>
      `;
    } else {
      const quickSteps = [
        [1, pick("1. Clear pre-tile holds & waterproof", "1. Liberar pendientes e impermeabilizar", "1. Закрыть стоп-пункты и гидроизоляция"),
            pick("Replace window & casing, fix tub faucet trim, waterproof walls & niches, and snap a tape-measure photo.", "Reemplazar ventana y marco, corregir llave de tina, impermeabilizar muros y nichos y tomar foto con cinta.", "Замените окно и наличники, исправьте излив ванны, выполните гидроизоляцию и сделайте фото с рулеткой.")],
        [2, pick("2. Snap laser & tile back wall", "2. Nivelar láser y pegar fondo", "2. Лазерный уровень и задняя стена"),
            pick(`Snap level laser ${fmtFrac(state.starterRowIn)} above tub rim and tile back wall up to 69-1/4″ (verify 71-1/4″ top cap).`, `Trazar láser a ${fmtFrac(state.starterRowIn)} sobre tina y subir hasta 69-1/4″ (verificar tope 71-1/4″).`, `Отбейте лазер на ${fmtFrac(state.starterRowIn)} выше борта ванны и уложите плитку до 69-1/4″ (верх бордюра 71-1/4″).`)],
        [3, pick("3. Tile shower & window walls", "3. Pegar regadera y zona ventana", "3. Стены душа и окна"),
            pick("Stop at 35″ on both side walls (33″ field + 2″ bullnose, clearing toilet stub by 2-3/4″); tile window wall below 43″ sill only.", "Terminar a 35″ en ambos muros laterales (33″ + 2″ bullnose, libre de la toma WC); en ventana solo abajo de 43″.", "Завершите на 35″ с обеих сторон (33″ плитка + 2″ бордюр); стену окна — только ниже подоконника 43″.")],
        [4, pick("4. Measure & finish niches", "4. Medir y armar nichos", "4. Замер и облицовка ниш"),
            pick("Measure waterproofed niches first; set solid 1-piece white back panel before sloped sill and side returns.", "Medir nichos impermeabilizados; pegar fondo blanco de 1 pieza antes de repisa con caída y retornos.", "Замерьте ниши после гидроизоляции; установите цельную заднюю панель до полки с уклоном и откосов.")],
        [5, pick("5. Set matching ceramic bullnose", "5. Colocar bullnose cerámico", "5. Керамический бордюр"),
            pick("Finish top edge (71-1/4″), vertical side drops, and niche frames with matching 2″×6″ ceramic bullnose.", "Rematar borde superior (71-1/4″), bajadas laterales y marcos de nichos con bullnose cerámico 2″×6″.", "Оформите верх (71-1/4″), вертикальные края и рамки ниш керамическим бордюром 2″×6″.")],
        [6, pick("6. Grout walls & seal corners", "6. Boquilla y silicón en esquinas", "6. Затирка и силикон"),
            pick("Grout flat walls with Mapei #77 Frost (locked; floor uses Warm Gray) and seal all corners and tub deck with 100% #77 Frost silicone.", "Emboquillar muros con Mapei #77 Frost (fijado; el piso usa Warm Gray) y sellar esquinas y tina con silicón 100% #77 Frost.", "Затрите стены Mapei #77 Frost (утверждено; пол — Warm Gray) и герметизируйте углы 100% силиконом #77 Frost.")]
      ];
      cardHtml = `
        <section class="u4b-card">
          <div class="u4b-head">
            <div>
              <h1 class="u4b-title">${pick("Step 4 — Install Steps & Materials", "Paso 4 — Pasos de Instalación y Materiales", "Шаг 4 — Порядок работ и материалы")}</h1>
              <p class="u4b-sub">${pick("Visual checklist & material takeoff · Drag ⊕ onto any row or step below to flag a correction", "Guía visual y materiales · Arrastra ⊕ sobre cualquier fila o paso para corregir", "Шаги монтажа и ведомость материалов · Перетащите ⊕ на любую строку для правки")}</p>
            </div>
            <span class="u4b-badge">${pick("INSTALL CHECKLIST", "GUÍA DE OBRA", "ЧЕК-ЛИСТ")}</span>
          </div>

          <div class="u4b-photos">
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5493.jpg" alt="Wall tile box on site">
              <figcaption><strong>${pick("Wall tile:", "Azulejo:", "Плитка:")}</strong> American Olean 0025 Ice White 3″×6″ (shade 55501)</figcaption>
            </figure>
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5478.jpg" alt="Back wall niches">
              <figcaption><strong>${pick("Back wall:", "Muro fondo:", "Задняя стена:")}</strong> ${pick("Measure niches after waterproofing", "Medir nichos tras impermeabilizar", "Замерить ниши после гидроизоляции")}</figcaption>
            </figure>
            <figure class="u4h-photo-card">
              <img src="./assets/IMG_5474.jpg" alt="Shower wall">
              <figcaption><strong>${pick("Shower wall:", "Regadera:", "Стена душа:")}</strong> ${pick("35″ locked stop (clears 37-3/4″ toilet stub)", "Tope fijado en 35″ (libre de toma WC 37-3/4″)", "Край 35″ утверждён (до подводки 37-3/4″)")}</figcaption>
            </figure>
          </div>

          <div class="u4b-steps">
            ${quickSteps.map(([, title, desc]) => `
              <div class="u4b-step-item">
                <span class="u4b-step-item-title">${title}</span>
                <p>${desc}</p>
              </div>
            `).join("")}
          </div>

          <div class="u4b-table-wrap">
            <table class="u4b-table">
              <thead>
                <tr>
                  <th>${pick("Material", "Material", "Материал")}</th>
                  <th>${pick("Product / Part Number", "Modelo / Código", "Модель / Артикул")}</th>
                  <th>${pick("Estimated Amount", "Cantidad estimada", "Расчётное кол-во")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${pick("Ice White 3″×6″ Wall Tile (on hand)", "Azulejo Blanco 3″×6″ (en obra)", "Настенная плитка Ice White 3″×6″ (на объекте)")}</strong><br><span style="font-size:12px;color:var(--muted)">${pick(`~${lay.takeoff.tileAreaSqft} sq ft net wall area (+${state.wastePct}% for cuts)`, `~${lay.takeoff.tileAreaSqft} ft² área neta (+${state.wastePct}% cortes)`, `~${lay.takeoff.tileAreaSqft} кв. футов (+${state.wastePct}% запас)`)}</span></td>
                  <td class="u4b-mono">0025 36MOD1P4 (Shade 55501)</td>
                  <td class="u4b-mono"><strong>${lay.takeoff.cartons} ${pick("boxes", "cajas", "коробок")}</strong><br>(${pick("subtract boxes on site", "restar cajas ya en obra", "минус коробки на месте")})</td>
                </tr>
                <tr>
                  <td><strong>${pick("Matching 2″×6″ Ceramic Bullnose", "Bullnose Cerámico 2″×6″", "Керамический бордюр 2″×6″")}</strong></td>
                  <td class="u4b-mono">0025S42691P4 · <strong>${pick("Approved to order", "Aprobado para pedido", "Одобрено к заказу")}</strong></td>
                  <td class="u4b-mono"><strong>${lay.takeoff.bullnosePcs} ${pick("pieces", "piezas", "шт.")}</strong></td>
                </tr>
                <tr>
                  <td><strong>${pick("Matching 2″×2″ Bullnose Corners", "Esquinas Bullnose 2″×2″", "Уголки бордюра 2″×2″")}</strong></td>
                  <td class="u4b-mono">0025SN42691P2 · <strong>${pick("Approved to order", "Aprobado para pedido", "Одобрено к заказу")}</strong></td>
                  <td class="u4b-mono"><strong>${lay.takeoff.cornerPcs} ${pick("pieces", "piezas", "шт.")}</strong></td>
                </tr>
                <tr>
                  <td><strong>${pick("Solid 1-Piece Niche Backs", "Fondos de Nicho (1 pieza lisa)", "Цельные задние панели ниш")}</strong></td>
                  <td class="u4b-mono">${pick("Smooth white · Measure niches first", "Blanco liso · Medir nichos primero", "Гладкая белая · Сначала замер")}</td>
                  <td class="u4b-mono"><strong>${pick("Confirm after measuring", "Confirmar tras medir", "После замера на месте")}</strong></td>
                </tr>
                <tr>
                  <td><strong>${pick("Wall Grout + 100% Silicone (Floor uses Warm Gray)", "Boquilla de Muro + Silicón (Piso usa Warm Gray)", "Затирка стен + силикон (пол — Warm Gray)")}</strong></td>
                  <td class="u4b-mono">Mapei Ultracolor Plus FA #77 Frost + Mapesil T Plus #77 Frost (${pick("Locked", "Fijado", "Утверждено")})</td>
                  <td class="u4b-mono"><strong>1 ${pick("10-lb bag", "saco 10 lb", "мешок 10 фнт")} + 3 ${pick("tubes", "tubos", "тубы")}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="u4b-checks">
            ${[
              ["waterproofPhoto", "Take verification photos of finished waterproofing before setting tile.", "Tomar fotos de verificación del impermeabilizante antes de pegar azulejo.", "Сделать проверочные фото готовой гидроизоляции до укладки плитки."],
              ["nicheMeasure", "Measure waterproofed width, height, and depth of both niches on site.", "Medir ancho, alto y profundidad de ambos nichos ya impermeabilizados.", "Замерить ширину, высоту и глубину обеих ниш после гидроизоляции."],
              ["valveDepth", "Check Delta shower valve depth & fix tub faucet trim before closing tile.", "Verificar profundidad de válvula Delta y corregir llave de tina antes de cerrar.", "Проверить глубину смесителя Delta и исправить излив ванны до укладки."],
              ["windowReplace", "Replace bathroom window and casing first (zero tile above the 43″ sill).", "Reemplazar primero ventana y marco del baño (sin azulejo arriba de 43″).", "Сначала заменить окно и наличники (без плитки выше подоконника 43″)."],
              ["medCabReturn", "Keep the oversized 20″×32″ medicine cabinet off the wall for return.", "Dejar fuera el botiquín grande de 20″×32″ para devolución.", "Отложить большой шкафчик 20″×32″ на возврат (не монтировать)."],
              ["hingedDoor", "Frame entry for a 28″ × 1-3/8″ hinged door swinging outward into the hallway (pocket door retired).", "Preparar entrada para puerta abatible de 28″ × 1-3/8″ abriendo hacia el pasillo (corrediza retirada).", "Подготовить проём под распашную дверь 28″ × 1-3/8″ наружу в коридор (раздвижная отменена)."]
            ].map(([k, enT, esT, ruT]) => `
              <label class="u4b-check">
                <input type="checkbox" data-chk="${k}" ${state.checks[k] ? "checked" : ""}>
                <span>${pick(enT, esT, ruT)}</span>
              </label>
            `).join("")}
          </div>

          <details class="u4b-details">
            <summary>${pick("Tools & Supplies", "Herramientas y suministros", "Инструменты и расходники")}</summary>
            <div class="u4b-details-body">
              <ul>
                <li>${pick("Wet tile saw with continuous-rim porcelain diamond blade and hand polishing pad", "Cortadora húmeda con disco de diamante continuo y piedra de pulido", "Мокрый плиткорез с алмазным диском по керамограниту и шлифовальный брусок")}</li>
                <li>${pick("Cross-line laser level, 1/16″ T-spacers, and leveling wedges", "Nivel láser, separadores T de 1/16″ y cuñas de nivelación", "Лазерный нивелир, крестики 1/16″ и клинья")}</li>
                <li>${pick("1/4″×1/4″ notched trowel (3″×6″ wall tile) and 1/4″×3/8″ trowel (solid niche backs)", "Llana dentada 1/4″×1/4″ (muro) y 1/4″×3/8″ (fondos de nicho)", "Зубчатый шпатель 1/4″×1/4″ (стены) и 1/4″×3/8″ (панели ниш)")}</li>
                <li>${pick("Diamond hole saws for tub spout, Delta shower valve (4-1/2″), and shower arm", "Brocas sierra de diamante para llave, válvula Delta (4-1/2″) y brazo de regadera", "Алмазные коронки для излива, смесителя Delta (4-1/2″) и вывода душа")}</li>
              </ul>
            </div>
          </details>
        </section>
      `;
    }

    const pager = `
      <div class="u4b-pager no-print">
        <button type="button" class="u4b-pager-btn" id="u4Prev" ${prevS ? "" : "disabled"}>← ${prevS ? pick(prevS.en, prevS.es, prevS.ru) : pick("Prev", "Anterior", "Назад")}</button>
        <span class="u4b-pager-meta">${pick(`Step ${stepIdx + 1} of ${STEPS.length}`, `Paso ${stepIdx + 1} de ${STEPS.length}`, `Шаг ${stepIdx + 1} из ${STEPS.length}`)}</span>
        <button type="button" class="u4b-pager-btn" id="u4Next" ${nextS ? "" : "disabled"}>${nextS ? pick(nextS.en, nextS.es, nextS.ru) : pick("Next", "Siguiente", "Далее")} →</button>
      </div>
    `;

    body.innerHTML = buildHoldAndRefStrip() + cardHtml + pager;
    renderPrintSheets(lay);
    wireEvents(prevS, nextS);

    if (window.U4ZoomPan && typeof window.U4ZoomPan.attach === "function") {
      try { window.U4ZoomPan.attach(); } catch (_) {}
    }
    if (window.U4PinDragger && typeof window.U4PinDragger.attach === "function") {
      try { window.U4PinDragger.attach(); } catch (_) {}
    }
  }

  function renderPrintSheets(lay) {
    const pr = document.getElementById("u4PrintRoot");
    if (!pr) return;
    pr.innerHTML = `
      <section class="u4-print-page">
        <div class="u4-print-head">
          <h2>${pick("UNIT 4 BATHROOM — 3-WALL TILE LAYOUT (PAGE 1/2)", "UNIT 4 BAÑO — TRAZO DE AZULEJO 3 MUROS (PÁG. 1/2)", "UNIT 4 ВАННАЯ — РАСКЛАДКА 3 СТЕН (СТР. 1/2)")}</h2>
          <span>HOLD UNTIL WINDOW &amp; FAUCET PREP · 28″ Outward Hinged Door</span>
        </div>
        ${buildStep1Svg(lay, true)}
        <div style="margin-top:8px">${buildStep2PlumbingSvg(lay, true)}</div>
        <div class="u4-print-foot">
          <span>American Olean 0025 Ice White 3″×6″ · 35″ Side Stops · Matching 2″×6″ Ceramic Bullnose · Mapei #77 Frost</span>
          <span>1231 11th Ave Unit 4 · ${SEED.rev} · Page 1 of 2</span>
        </div>
      </section>
      <section class="u4-print-page">
        <div class="u4-print-head">
          <h2>${pick("UNIT 4 BATHROOM — NICHES & INSTALL GUIDE (PAGE 2/2)", "UNIT 4 BAÑO — NICHOS Y GUÍA DE OBRA (PÁG. 2/2)", "UNIT 4 ВАННАЯ — НИШИ И МОНТАЖ (СТР. 2/2)")}</h2>
          <span>Measure Waterproofed Niches Before Cutting</span>
        </div>
        ${buildStep3NichesSvg(lay, true)}
        <div class="u4-print-foot">
          <span>${pick(`Est. (+${state.wastePct}%): ${lay.takeoff.cartons} boxes 3″×6″ · ${lay.takeoff.bullnosePcs} bullnose 2″×6″ · 10 corners 2″×2″`, `Estimado (+${state.wastePct}%): ${lay.takeoff.cartons} cajas 3″×6″ · ${lay.takeoff.bullnosePcs} bullnose 2″×6″ · 10 esq. 2″×2″`, `Расчёт (+${state.wastePct}%): ${lay.takeoff.cartons} кор. 3″×6″ · ${lay.takeoff.bullnosePcs} бордюр 2″×6″ · 10 уголков 2″×2″`)}</span>
          <span>1231 11th Ave Unit 4 · ${SEED.rev} · Page 2 of 2</span>
        </div>
      </section>
    `;
  }

  function wireEvents(prevS, nextS) {
    document.querySelectorAll("[data-step]").forEach((btn) => {
      btn.onclick = () => { state.step = btn.getAttribute("data-step"); renderAll(); window.scrollTo({ top: 0, behavior: "smooth" }); };
    });
    document.querySelectorAll("[data-east]").forEach((btn) => {
      btn.onclick = () => { state.eastStopMode = btn.getAttribute("data-east") || "35"; renderAll(); };
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
      cb.onchange = () => { state.checks[cb.getAttribute("data-chk")] = !!cb.checked; };
    });
    const prevBtn = document.getElementById("u4Prev");
    if (prevBtn && prevS) prevBtn.onclick = () => { state.step = prevS.id; renderAll(); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const nextBtn = document.getElementById("u4Next");
    if (nextBtn && nextS) nextBtn.onclick = () => { state.step = nextS.id; renderAll(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  }

  function normLang(raw) {
    const s = String(raw || "").toLowerCase();
    if (s.indexOf("ru") === 0) return "ru";
    if (s.indexOf("es") === 0) return "es";
    return "en";
  }

  function boot() {
    window.U4PLAN = {
      id: "bathroom-tile",
      roomKey: "bathroom",
      documentId: "bathroom-tile",
      rev: SEED.rev,
      getLang: () => state.lang,
      setLang: (l) => { state.lang = normLang(l); renderAll(); },
      getScaleInfo: () => state.lastScaleInfo
    };
    if (window.U4PlanNav && document.getElementById("u4hTopbar")) {
      window.U4PlanNav.init({
        planId: "bathroom-tile",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: (l) => {
          state.lang = normLang(l);
          renderAll();
          if (window.U4LiveAi && typeof window.U4LiveAi.refreshPrompts === "function") window.U4LiveAi.refreshPrompts();
        },
        onThemeChange: (th) => {
          state.theme = th === "dark" ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      });
      state.lang = normLang(window.U4PlanNav.getLang());
      state.theme = window.U4PlanNav.getTheme() === "dark" ? "dark" : "light";
    } else {
      const p = new URLSearchParams(window.location.search);
      state.lang = normLang(p.get("lang") || localStorage.getItem("u4_lang") || "en");
      state.theme = (p.get("theme") || localStorage.getItem("u4_theme")) === "dark" ? "dark" : "light";
    }
    if (window.U4LiveAi && typeof window.U4LiveAi.init === "function") {
      window.U4LiveAi.init({
        planId: "bathroom-tile",
        room: "bathroom",
        titleEn: "Bathroom Tub & Wall Tile",
        titleEs: "Baño: Azulejo y Nichos",
        getContext: () => "Step=" + state.step + ", EastStop=35in locked, WallGrout=#77 Frost locked, Bullnose=approved, Door=28in outward hinged hallway door.",
        quickPrompts: (lang) => lang === "es"
          ? ["¿Qué bloqueos siguen activos antes de pegar azulejo?", "¿Dónde termina el azulejo en el muro de regadera?", "¿Qué boquilla lleva el muro vs el piso?"]
          : lang === "ru"
          ? ["Какие работы нужно завершить до укладки плитки?", "Где заканчивается плитка на стене душа?", "Какая затирка на стенах и на полу?"]
          : ["What holds must clear before setting wall tile?", "Where does the tile stop on the shower wall?", "What grout is locked for walls vs floor?"]
      });
    }
    renderAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
