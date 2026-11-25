(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const IS_PRINT_MODE = params.get("print") === "1";

  // Canonical Seed Baseline from bathroom/bathroom-plan-data.json (rev-20261124-bath-005)
  const SEED = {
    roomWidthIn: 72.125,
    roomDepthIn: 82.125,
    entryWidthIn: 28.0,
    backerWidthIn: 69.3125,     // 69-5/16" corner-to-corner on North back wall (IMG_5478)
    tubRimHeightIn: 22.0,       // 22" laid floor to top of stone tub rim (IMG_5473)
    backerAboveTubIn: 71.25,    // 71-1/4" tub rim to top of HardieBacker (~93-1/4" AFF)
    ceilingAffIn: 121.5,        // 121-1/2" Magicplan room ceiling
    tubOuterDepthIn: 33.0,      // ~33" back wall to front face of stone waterfall apron (IMG_5488)
    eastTileStopIn: 35.0,       // Locked: 35" from back wall (~2" past ~33" stone apron)
    eastToiletStubIn: 37.75,    // ~37-1/2" to 38" copper toilet supply stub-out (IMG_5474)
    eastBackerEdgeIn: 39.0,     // ~39" HardieBacker seam to 1/2" Mold-Tough drywall
    westSillStopIn: 35.0,       // Confirmed: 35" from back wall to front tip of wood sill
    westDoorwaySpanIn: 45.5,    // Confirmed: 45-1/2" future doorway finished edge to sill stop
    westSillFloorIn: 43.0,      // Confirmed: 43" laid floor tile to bottom of sill wrap (21" above 22" tub)
    westCasingWidthIn: 5.25,    // Reported: 5-1/4" right window casing (no wall tile in upper window zone)
    largeNiche: { x0: 19.0, x1: 30.0, z0: 17.0, z1: 36.0, w: 11.0, h: 19.0, depth: null },
    smallNiche: { x0: 37.5, x1: 45.0, z0: 21.75, z1: 35.75, w: 7.5, h: 14.0, depth: null },
    wallTile: {
      brand: "American Olean Color Story",
      color: "0025 Ice White Glossy",
      sku: "002536MOD1P4",
      shade: "55501",
      actualW: 6.028,
      actualH: 3.012,
      thickIn: 0.311,
      groutIn: 0.0625,
      sqftPerBox: 12.5,
      pcsPerBox: 100
    },
    bullnose: {
      sku: "0025S42691P4",
      cornerSku: "0025SN42691P2",
      wIn: 2.0,
      lenIn: 6.0
    },
    floorTile: {
      brand: "STAINMASTER Calacatta Gem",
      sku: "SM421224XTMTLW",
      actualW: 11.902,
      actualL: 23.669,
      thickIn: 0.295
    }
  };

  const STEPS = [
    { id: "alcove-overview", num: 1, en: "3-Wall Layout", es: "Alzado 3 Muros" },
    { id: "north-niches", num: 2, en: "Niches & 1-Pc Back", es: "Nichos y Fondo 1 Pza" },
    { id: "east-west-stops", num: 3, en: "East & West Stops", es: "Remates Este/Oeste" },
    { id: "holds-takeoff", num: 4, en: "Holds & Quantities", es: "Esperas y Cantidades" }
  ];

  const state = {
    lang: params.get("lang") === "es" ? "es" : (safeGetPref("u4_lang") === "es" ? "es" : "en"),
    theme: params.get("theme") === "dark" ? "dark" : (safeGetPref("u4_theme") === "dark" ? "dark" : "light"),
    step: "alcove-overview",
    nicheBackMode: "large24x48",    // "large24x48" | "large12x24" | "subway3x6"
    nicheLookMode: "glossWhite",    // "glossWhite" | "softVein" | "stoneSlab"
    nicheSillMode: "solidSill",     // "solidSill" | "bullnoseSill"
    nicheFrameMode: "bullnose2x6",  // "bullnose2x6" | "glazedReturn"
    groutMode: "frost77",           // "frost77" | "avalanche38" | "warmGray93"
    starterRowIn: 2.25,             // 2-1/4" aligns Course 12 dead-on the 36" shared niche header!
    wastePct: 15,
    zoomPct: 100,
    equipOpen: false,
    pinArmed: false,
    ephemeralPin: null, // strictly ephemeral per unit4-interactive-plan-builder (zero localStorage)
    checks: {
      winCasing: false,
      nicheWidth: false,
      spareFloorTile: false,
      wallBoxCount: false,
      valveDepth: false,
      medCabHold: false,
      waterproofPhoto: false
    },
    lastScaleInfo: { view: "alcove-overview", scaleX: 3.2, scaleY: 3.2, uniform: true }
  };

  function safeGetPref(k) {
    try { return window.localStorage.getItem(k); } catch (_) { return null; }
  }
  function safeSetPref(k, v) {
    try { window.localStorage.setItem(k, v); } catch (_) {}
  }

  function fmtFrac(val) {
    if (val == null || !isFinite(val)) return "—";
    const sign = val < 0 ? "-" : "";
    const abs = Math.abs(val);
    let whole = Math.floor(abs + 1e-6);
    let sixteenths = Math.round((abs - whole) * 16);
    if (sixteenths === 16) { whole += 1; sixteenths = 0; }
    if (sixteenths === 0) return sign + whole + '"';
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const g = gcd(sixteenths, 16);
    const num = sixteenths / g;
    const den = 16 / g;
    return sign + (whole > 0 ? whole + "-" + num + "/" + den : num + "/" + den) + '"';
  }

  function showToast(msg) {
    const el = document.getElementById("u4Toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.hidden = true; }, 2600);
  }

  // Live Course & Quantities Math (Zero Prices)
  function computeCourseAnalysis() {
    const pitchH = SEED.wallTile.actualH + SEED.wallTile.groutIn; // 3.0745"
    const topCapBottomZ = SEED.backerAboveTubIn - SEED.bullnose.wIn; // 69.25" (below 2" horizontal bullnose cap)
    const joints = [0, state.starterRowIn];
    let z = state.starterRowIn;
    while (z + pitchH < topCapBottomZ - 0.05) {
      z += pitchH;
      joints.push(+z.toFixed(3));
    }
    const topCourseH = +(topCapBottomZ - joints[joints.length - 1]).toFixed(2);

    // Closest joint distance to key niche horizontal edges (17", 21.75", 35.75", 36")
    function nearestCut(targetZ) {
      let best = 99;
      for (let i = 0; i < joints.length; i++) {
        const d = Math.abs(targetZ - joints[i]);
        if (d < best) best = d;
      }
      return +best.toFixed(2);
    }
    const headerDelta = nearestCut(36.0);
    const lgBotDelta = nearestCut(17.0);
    const smBotDelta = nearestCut(21.75);
    const minPiece = Math.min(state.starterRowIn, topCourseH);
    const hasSliver = minPiece < 1.5;

    return {
      pitchH,
      topCapBottomZ,
      joints,
      rowCount: joints.length,
      topCourseH,
      headerDelta,
      lgBotDelta,
      smBotDelta,
      hasSliver
    };
  }

  function computeTakeoff() {
    // 1. North Back Wall (69.3125" x 71.25" minus top 2" bullnose = 69.25" field height)
    const northGrossSqft = (SEED.backerWidthIn * 69.25) / 144;
    const lgNicheSqft = (SEED.largeNiche.w * SEED.largeNiche.h) / 144;
    const smNicheSqft = (SEED.smallNiche.w * SEED.smallNiche.h) / 144;
    const northFieldSqft = northGrossSqft - lgNicheSqft - smNicheSqft + (state.nicheBackMode === "subway3x6" ? (lgNicheSqft + smNicheSqft) : 0);

    // 2. East Shower-Control Wall: 33" field width (35" minus 2" bullnose border) x 69.25" above tub + 2" x 22" apron leg
    const eastFieldSqft = (33.0 * 69.25 + 1.5 * 22.0) / 144;

    // 3. West Window Wall (below 43" sill ONLY: 33" x 21" above tub rim + 1.5" x 22" apron leg)
    const westFieldSqft = (33.0 * 21.0 + 1.5 * 22.0) / 144;

    // 4. Niche side & top returns (assuming ~4" interior return depth)
    const nicheReturnsSqft = ((19 * 2 + 11 + (state.nicheSillMode === "bullnoseSill" ? 11 : 0)) * 4 +
                              (14 * 2 + 7.5 + (state.nicheSillMode === "bullnoseSill" ? 7.5 : 0)) * 4) / 144;

    const netSubwaySqft = +(northFieldSqft + eastFieldSqft + westFieldSqft + nicheReturnsSqft).toFixed(1);
    const grossSubwaySqft = +(netSubwaySqft * (1 + state.wastePct / 100)).toFixed(1);
    const cartonsNeeded = Math.ceil(grossSubwaySqft / SEED.wallTile.sqftPerBox);

    // Zero-Metal 2"x6" Surface Bullnose (0025S42691P4, 6" long pieces)
    const perimeterBullnoseIn = SEED.backerWidthIn + 33.0 + (69.25 + 22.0) + (21.0 + 22.0); // North top + East top + East full vertical + West lower vertical
    const nicheFrameIn = state.nicheFrameMode === "bullnose2x6"
      ? (2 * (SEED.largeNiche.w + SEED.largeNiche.h) + 2 * (SEED.smallNiche.w + SEED.smallNiche.h))
      : 0;
    const totalBullnoseIn = +(perimeterBullnoseIn + nicheFrameIn).toFixed(1);
    const bullnosePcs = Math.ceil((totalBullnoseIn / 6.0) * (1 + state.wastePct / 100));
    const cornerPcs = 2 + (state.nicheFrameMode === "bullnose2x6" ? 8 : 0);

    // Single-Piece Large-Format Niche Back Tile Count (Product TBD)
    let largeTileCount = 0;
    let largeTileDescEn = 'None (using 3″×6″ subway)';
    let largeTileDescEs = 'Ninguna (usando 3″×6″)';
    if (state.nicheBackMode === "large24x48") {
      largeTileCount = 1;
      largeTileDescEn = '1 tile (24″×48″ cuts BOTH backs + sills)';
      largeTileDescEs = '1 pieza (24″×48″ da AMBOS fondos + repisas)';
    } else if (state.nicheBackMode === "large12x24") {
      largeTileCount = 2 + (state.nicheSillMode === "solidSill" ? 1 : 0);
      largeTileDescEn = `${largeTileCount} tiles (12″×24″ — verify Left Niche <= 11-3/4″)`;
      largeTileDescEs = `${largeTileCount} piezas (12″×24″ — verificar Nicho Izq. ≤ 11-3/4″)`;
    }

    return {
      netSubwaySqft,
      grossSubwaySqft,
      cartonsNeeded,
      totalBullnoseFt: +(totalBullnoseIn / 12).toFixed(1),
      bullnosePcs,
      cornerPcs,
      largeTileCount,
      largeTileDescEn,
      largeTileDescEs
    };
  }


  // ── EXACT TILE POSITIONING & RUNNING-BOND CUT CALCULATOR ────────────────
  function computeWallBrickLayout() {
    const tileW = SEED.wallTile.actualW; // 6.028"
    const grout = SEED.wallTile.groutIn; // 0.0625" (1/16")
    const pitchW = +(tileW + grout).toFixed(4); // 6.0905"
    const halfPitch = +(pitchW / 2).toFixed(4); // 3.04525"

    // North Back Wall (69-5/16" = 69.3125"):
    // Symmetric Zero-Sliver Offset: Odd courses start at NW with 2-5/8" (2.65") + 10 full 6" tiles + 5-11/16" (5.67") at NE.
    // Even courses flip symmetrically: 5-11/16" (5.67") at NW + 10 full 6" tiles + 2-5/8" (2.65") at NE.
    const northW = SEED.backerWidthIn; // 69.3125"
    const northOddStart = +( (northW - (10 * pitchW + grout)) * 0.318 ).toFixed(2); // ~2.65"
    const northOddEnd = +(northW - northOddStart - 10 * pitchW - grout).toFixed(2);   // ~5.67"
    const northOddJoints = [];
    let nx = northOddStart;
    while (nx < northW - 0.1) {
      northOddJoints.push(+nx.toFixed(3));
      nx += pitchW;
    }
    const northEvenStart = northOddEnd;
    const northEvenEnd = northOddStart;
    const northEvenJoints = [];
    nx = northEvenStart;
    while (nx < northW - 0.1) {
      northEvenJoints.push(+nx.toFixed(3));
      nx += pitchW;
    }

    // East & West Walls (35" stop = 33.0" tiled field + 2.0" vertical bullnose):
    // Odd courses start full 6.028" at 0" North corner -> 5 full tiles (30.45") + 2-9/16" (2.55") cut at 33" bullnose.
    // Even courses start half 3.00" at 0" North corner -> 4 full tiles + 5-9/16" (5.59") cut at 33" bullnose.
    const sideFieldW = 33.0;
    const sideOddJoints = [];
    let sx = pitchW;
    while (sx < sideFieldW - 0.1) {
      sideOddJoints.push(+sx.toFixed(3));
      sx += pitchW;
    }
    const sideOddEnd = +(sideFieldW - (5 * pitchW)).toFixed(2); // 2.55" (~2-9/16")

    const sideEvenJoints = [+(tileW / 2 + grout).toFixed(3)];
    sx = sideEvenJoints[0] + pitchW;
    while (sx < sideFieldW - 0.1) {
      sideEvenJoints.push(+sx.toFixed(3));
      sx += pitchW;
    }
    const sideEvenEnd = +(sideFieldW - (tileW / 2 + grout + 4 * pitchW)).toFixed(2); // 5.59" (~5-9/16")

    // Exact Course Table (Courses 1..N from 0" tub rim to 69-1/4" below 2" bullnose cap)
    const ca = computeCourseAnalysis();
    const courseRows = [];
    for (let i = 0; i < ca.joints.length; i++) {
      const z0 = ca.joints[i];
      const z1 = (i + 1 < ca.joints.length) ? ca.joints[i + 1] : ca.topCapBottomZ;
      const h = +(z1 - z0).toFixed(2);
      const isOdd = (i % 2 === 0);
      courseRows.push({
        courseNum: i + 1,
        z0: +z0.toFixed(2),
        z1: +z1.toFixed(2),
        heightIn: h,
        isOdd,
        westActive: z0 < 20.95
      });
    }

    return {
      pitchW,
      halfPitch,
      north: {
        widthIn: northW,
        fullPerRow: 10,
        oddLeftCut: northOddStart,
        oddRightCut: northOddEnd,
        evenLeftCut: northEvenStart,
        evenRightCut: northEvenEnd,
        oddJoints: northOddJoints,
        evenJoints: northEvenJoints
      },
      side: {
        fieldWidthIn: sideFieldW,
        stopIn: 35.0,
        oddFull: 5,
        oddEndCut: sideOddEnd,
        evenStartCut: +(tileW / 2).toFixed(2),
        evenFull: 4,
        evenEndCut: sideEvenEnd,
        oddJoints: sideOddJoints,
        evenJoints: sideEvenJoints,
        apronFullVertBullnose: 3, // 3 x 6" = 18"
        apronBottomCut: 4.0       // 22" - 18" = 4" above 3x12 baseboard
      },
      courseRows
    };
  }

  function renderVerticalBrickJoints(joints, xOrigin, yTop, yBot, S, strokeColor, strokeW, reverseDir) {
    let out = "";
    for (let i = 0; i < joints.length; i++) {
      const dx = joints[i] * S;
      const x = +(reverseDir ? (xOrigin - dx) : (xOrigin + dx)).toFixed(1);
      out += `<line x1="${x}" y1="${yTop}" x2="${x}" y2="${yBot}" stroke="${strokeColor}" stroke-width="${strokeW}"/>`;
    }
    return out;
  }

  function buildCalculatedSteps(es) {
    const ca = computeCourseAnalysis();
    const bl = computeWallBrickLayout();
    const tk = computeTakeoff();
    const grout = currentGrout();
    const lastCourse = bl.courseRows[bl.courseRows.length - 1];
    const startCut = fmtFrac(state.starterRowIn);
    const topCut = fmtFrac(lastCourse.heightIn);

    return [
      {
        num: 1,
        titleEn: "Verify Datums, Waterproofing & Pre-Tile Holds",
        titleEs: "Verificar Cotas, Impermeabilización y Retenciones",
        dim: `71-1/4" Z · 69-5/16" N · 35" E/W`,
        en: `Confirm HardieBacker top at ${fmtFrac(SEED.backerAboveTubIn)} above tub rim (${fmtFrac(22 + SEED.backerAboveTubIn)} AFF), North width ${fmtFrac(SEED.backerWidthIn)}, West sill ${fmtFrac(43)} to floor (${fmtFrac(35)} stop), and Delta Arcadia valve depth. Keep 20"×32" medicine cabinet OFF wall for return.`,
        es: `Confirmar HardieBacker a ${fmtFrac(SEED.backerAboveTubIn)} sobre tina (${fmtFrac(22 + SEED.backerAboveTubIn)} AFF), ancho Norte ${fmtFrac(SEED.backerWidthIn)}, repisa Oeste a ${fmtFrac(43)} del piso (tope ${fmtFrac(35)}) y válvula Delta Arcadia. Dejar botiquín 20"×32" fuera para devolución.`
      },
      {
        num: 2,
        titleEn: "Strike Laser Line & Set Tub-Rim Starter Course (Course 1)",
        titleEs: "Trazar Láser y Pegar 1.ª Hilada sobre Tina (Hilada 1)",
        dim: `Z: 0" → ${startCut} (${bl.courseRows.length} courses total)`,
        en: `Level laser line at ${startCut} above highest tub-rim point, leaving 1/8" silicone gap at tub deck. North wall odd courses: start ${fmtFrac(bl.north.oddLeftCut)} at NW corner, run 10 full 6" tiles, end ${fmtFrac(bl.north.oddRightCut)} at NE corner. East/West odd courses: start full 6" tile at 0" corner, run ${bl.side.oddFull} full tiles, end ${fmtFrac(bl.side.oddEndCut)} at 33" line.`,
        es: `Nivelar láser a ${startCut} sobre cubierta de tina dejando 1/8" para silicón. Muro Norte impares: iniciar con ${fmtFrac(bl.north.oddLeftCut)} en esquina NO, 10 piezas enteras de 6", rematar ${fmtFrac(bl.north.oddRightCut)} en NE. Este/Oeste impares: iniciar con entera 6" en rincón 0", ${bl.side.oddFull} enteras y corte ${fmtFrac(bl.side.oddEndCut)} en línea 33".`
      },
      {
        num: 3,
        titleEn: "Set 1-Piece Large-Format Niche Backs & Sloped Sills FIRST",
        titleEs: "Pegar Fondos de Nicho en 1 Pieza y Repisas con Pendiente PRIMERO",
        dim: `L: ~11"×19" · R: ~7-1/2"×14" · Slope 1/4"/ft`,
        en: `${state.nicheBackMode === "large24x48" ? 'Cut both single-piece backs (~11"×19" Left, ~7-1/2"×14" Right) plus both 1-piece sloped sills from one 24"×48" Glossy/Satin White porcelain tile.' : 'Cut single-piece niche backs from selected large-format stock.'} Set 1-piece back slab flat FIRST, then 1-piece sill sloped 1/4"/ft toward tub, then lap side/top jamb returns IN FRONT of the back panel so all 4 cut edges are hidden.`,
        es: `${state.nicheBackMode === "large24x48" ? 'Cortar ambos fondos de 1 pieza (~11"×19" Izq., ~7-1/2"×14" Der.) más ambas repisas de 1 pieza de un solo porcelanato Blanco 24"×48".' : 'Cortar fondos de 1 pieza.'} Pegar el fondo PRIMERO, luego la repisa con pendiente 1/4"/pie hacia la tina y al final los retornos laterales/superiores DELANTE del fondo para ocultar los 4 cantos cortados.`
      },
      {
        num: 4,
        titleEn: "Run Staggered Wall Courses Up Through Niche Header & Plumbing",
        titleEs: "Subir Hiladas Trabadas hasta Dintel de Nichos y Plomería",
        dim: `Header @ Course 12 (${fmtFrac(ca.joints[11] || 36)}) · Top Cut ${topCut}`,
        en: `Alternate North even courses (${fmtFrac(bl.north.evenLeftCut)} NW → 10 full → ${fmtFrac(bl.north.evenRightCut)} NE) and East/West even courses (${fmtFrac(bl.side.evenStartCut)} corner → ${bl.side.evenFull} full → ${fmtFrac(bl.side.evenEndCut)} at 33"). West wall ends at Course 7 beneath the 43" sill (zero tile above sill). East wall cuts around 5-1/2" spout, 27" Delta valve (4-1/2" trim), and 60" shower arm up to Course ${bl.courseRows.length} (${topCut} cut ending at 69-1/4").`,
        es: `Alternar pares Norte (${fmtFrac(bl.north.evenLeftCut)} NO → 10 enteras → ${fmtFrac(bl.north.evenRightCut)} NE) y Este/Oeste (${fmtFrac(bl.side.evenStartCut)} rincón → ${bl.side.evenFull} enteras → ${fmtFrac(bl.side.evenEndCut)} en 33"). Muro Oeste termina en Hilada 7 bajo repisa 43" (cero azulejo arriba). Muro Este libra salida 5-1/2", válvula 27" y regadera 60" hasta Hilada ${bl.courseRows.length} (corte ${topCut} a 69-1/4").`
      },
      {
        num: 5,
        titleEn: "Install Zero-Metal 2″×6″ Surface Bullnose & 2″×2″ Corners",
        titleEs: "Instalar Bullnose Cerámico 2″×6″ y Esquinas 2″×2″ (Cero Metal)",
        dim: `${tk.bullnosePcs} × 2"×6" · ${tk.cornerPcs} × 2"×2" Corners`,
        en: `Cap 69-1/4" to 71-1/4" across North (12 pcs) and East (6 pcs) with 0025S42691P4 2"×6" bullnose; place 2"×2" factory corners (0025SN42691P2) at top 35" corners. Run vertical 2"×6" bullnose from 33" to 35" down East (11.5 pcs above tub + 3 full + 4" cut on 22" apron leg) and West (3.5 pcs under 43" sill + 3 full + 4" cut on apron leg), plus both niche frames.`,
        es: `Rematar 69-1/4" a 71-1/4" en Norte (12 pzs) y Este (6 pzs) con bullnose 0025S42691P4 2"×6"; poner esquinas 2"×2" (0025SN42691P2) en esquinas superiores a 35". Bajar bullnose vertical 33"–35" en Este (11.5 pzs sobre tina + 3 enteras + corte 4" al piso) y Oeste (3.5 pzs bajo repisa + 3 enteras + corte 4" al piso), más marcos de nichos.`
      },
      {
        num: 6,
        titleEn: "Grout Field Joints (1/16″) with Mapei #77 Frost",
        titleEs: "Emboquillar Juntas (1/16″) con Mapei #77 Frost",
        dim: `1/16" Joint · 1 × 10-lb Bag FA Grout`,
        en: `After 24 hr cure, rake 1/16" spacers cleanly and grout all flat wall joints with ${grout.sku.split(" + ")[0]}. Keep inside 90° vertical wall corners, tub-deck joint, and niche inside corners free of hard grout.`,
        es: `Tras 24 h de fraguado, retirar separadores de 1/16" y emboquillar muros planos con ${grout.sku.split(" + ")[0]}. Dejar libres de boquilla dura las esquinas internas a 90°, junta de tina y esquinas de nichos.`
      },
      {
        num: 7,
        titleEn: "Seal All 90° Corners & Wet Stone Apron with 100% Silicone",
        titleEs: "Sellar Esquinas 90° y Falda de Piedra con Silicón 100%",
        dim: `3 Tubes Mapesil T Plus #77 Frost`,
        en: `Apply color-matched 100% silicone (Mapesil T Plus #77 Frost) along tub-deck joint, NW & NE vertical corners, both niche inside seams, and the 33" vertical stone waterfall apron corner before installing Delta trim.`,
        es: `Aplicar silicón 100% al tono (Mapesil T Plus #77 Frost) en unión con tina, esquinas verticales NO/NE, uniones internas de nichos y canto vertical de piedra a 33" antes de instalar chapetón Delta.`
      }
    ];
  }
  // ── SVG BUILDERS (Strict Uniform 1:1 Scale: scaleX === scaleY) ────────────
  const GROUT_SPECS = {
    frost77: {
      stroke: "#CBD3D8",
      swatch: "#DCE2E6",
      sku: "Mapei Ultracolor Plus FA #77 Frost + Mapesil T Plus #77",
      shortEn: "#77 Frost (Soft Mist · Rec.)",
      shortEs: "#77 Frost (Gris Niebla Suave · Rec.)"
    },
    avalanche38: {
      stroke: "#EAEFF2",
      swatch: "#F5F7F8",
      sku: "Mapei Ultracolor Plus FA #38 Avalanche + Mapesil T Plus #38",
      shortEn: "#38 Avalanche (Seamless White)",
      shortEs: "#38 Avalanche (Blanco Continuo)"
    },
    warmGray93: {
      stroke: "#ABA59C",
      swatch: "#C2BCB2",
      sku: "Mapei Ultracolor Plus FA #93 Warm Gray + Mapesil T Plus #93",
      shortEn: "#93 Warm Gray (Matches Floor)",
      shortEs: "#93 Warm Gray (Igual al Piso)"
    }
  };
  function currentGrout() { return GROUT_SPECS[state.groutMode] || GROUT_SPECS.frost77; }

  function getNicheBackFill(prefix) {
    if (state.nicheBackMode === "subway3x6") return "#FFFFFF";
    if (state.nicheLookMode === "glossWhite") return "#F8FBFD";
    if (state.nicheLookMode === "stoneSlab") return "#EDEFF2";
    return `url(#${prefix}-calacatta)`;
  }

  function buildCalacattaDefs(prefix) {
    return `
      <pattern id="${prefix}-calacatta" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
        <rect width="44" height="44" fill="#F2EFE9"/>
        <path d="M-4,12 Q12,6 24,15 T48,11" fill="none" stroke="#BEB6A8" stroke-width="1.5" opacity="0.75"/>
        <path d="M2,31 Q18,25 31,34 T48,29" fill="none" stroke="#CFC8BC" stroke-width="1.0" opacity="0.7"/>
      </pattern>
      <pattern id="${prefix}-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#8F5305" stroke-width="1.2" opacity="0.32"/>
      </pattern>
    `;
  }

  function buildStep1OverviewSvg(es, forPrint) {
    // Unfolded 3-Wall Tub Alcove Elevation at strict 1:1 scale S = 3.2 px/in
    // Total unfolded width = 39" (West) + 69.3125" (North) + 42" (East) = 150.3125" * 3.2 = 481px
    // Total vertical span = -22" (floor) to +84" (open stud band above 71.25" backer) = 106" * 3.2 = 339.2px
    const S = 3.2;
    if (!forPrint) {
      state.lastScaleInfo = { view: "alcove-overview", scaleX: S, scaleY: S, uniform: true };
    }

    const westSpan = 39.0;
    const northSpan = SEED.backerWidthIn; // 69.3125"
    const eastSpan = 42.0;

    const xWest0 = 44; // doorway-side cut of West alcove view (39" from corner)
    const xFoldNW = +(xWest0 + westSpan * S).toFixed(1); // North-West corner (0" on North & West!)
    const xFoldNE = +(xFoldNW + northSpan * S).toFixed(1); // North-East corner (69-5/16" on North, 0" on East!)
    const xEastEnd = +(xFoldNE + eastSpan * S).toFixed(1);

    const zTopIn = 82.0;
    const yFromZ = (zIn) => +(42 + (zTopIn - zIn) * S).toFixed(1);

    const yBackerTop = yFromZ(71.25);
    const yBullnoseBot = yFromZ(69.25);
    const yTubRim = yFromZ(0);
    const yFloor = yFromZ(-22.0);
    const yWestSill = yFromZ(21.0); // 43" above floor = 21" above 22" tub rim!

    // Course & Running-Bond Vertical Brick Joints across all 3 walls
    const courses = computeCourseAnalysis();
    const brickLayout = computeWallBrickLayout();
    const groutStroke = currentGrout().stroke;
    const groutW = state.groutMode === "warmGray93" ? "0.95" : "0.7";
    let courseLines = "";
    for (let i = 0; i < brickLayout.courseRows.length; i++) {
      const cr = brickLayout.courseRows[i];
      const yTopC = yFromZ(cr.z1);
      const yBotC = yFromZ(cr.z0);
      if (i > 0) {
        courseLines += `<line x1="${xFoldNW}" y1="${yBotC}" x2="${(xFoldNE + 33 * S).toFixed(1)}" y2="${yBotC}" stroke="${groutStroke}" stroke-width="${groutW}"/>`;
        if (cr.z0 <= 21.0) {
          courseLines += `<line x1="${(xFoldNW - 33 * S).toFixed(1)}" y1="${yBotC}" x2="${xFoldNW}" y2="${yBotC}" stroke="${groutStroke}" stroke-width="${groutW}"/>`;
        }
      }
      // Vertical brick joints (odd vs even stagger)
      const nJ = cr.isOdd ? brickLayout.north.oddJoints : brickLayout.north.evenJoints;
      const sJ = cr.isOdd ? brickLayout.side.oddJoints : brickLayout.side.evenJoints;
      courseLines += renderVerticalBrickJoints(nJ, xFoldNW, yTopC, yBotC, S, groutStroke, groutW, false);
      courseLines += renderVerticalBrickJoints(sJ, xFoldNE, yTopC, yBotC, S, groutStroke, groutW, false);
      if (cr.z1 <= 21.2) {
        courseLines += renderVerticalBrickJoints(sJ, xFoldNW, yTopC, yBotC, S, groutStroke, groutW, true);
      } else if (cr.z0 < 21.0) {
        courseLines += renderVerticalBrickJoints(sJ, xFoldNW, yFromZ(21.0), yBotC, S, groutStroke, groutW, true);
      }
    }

    // West wall geometry (measured right-to-left away from xFoldNW!)
    const xWestApron = +(xFoldNW - 33.0 * S).toFixed(1);
    const xWestStop = +(xFoldNW - 35.0 * S).toFixed(1);
    const xWestCasing = +(xFoldNW - 5.25 * S).toFixed(1);

    // East wall geometry (measured left-to-right away from xFoldNE!)
    const xEastApron = +(xFoldNE + 33.0 * S).toFixed(1);
    const xEastStop = +(xFoldNE + 35.0 * S).toFixed(1);
    const xEastToiletStub = +(xFoldNE + 37.75 * S).toFixed(1);
    const xEastBackerSeam = +(xFoldNE + 39.0 * S).toFixed(1);
    const xEastValve = +(xFoldNE + 15.5 * S).toFixed(1);

    // Niches on North wall
    const lgX = +(xFoldNW + SEED.largeNiche.x0 * S).toFixed(1);
    const lgW = +(SEED.largeNiche.w * S).toFixed(1);
    const lgY = yFromZ(SEED.largeNiche.z1);
    const lgH = +(SEED.largeNiche.h * S).toFixed(1);

    const smX = +(xFoldNW + SEED.smallNiche.x0 * S).toFixed(1);
    const smW = +(SEED.smallNiche.w * S).toFixed(1);
    const smY = yFromZ(SEED.smallNiche.z1);
    const smH = +(SEED.smallNiche.h * S).toFixed(1);

    const nicheFill = getNicheBackFill("ov");

    // Top-Down Room Key Plan at right (true uniform scale Sk = 1.95 px/in)
    const Sk = 1.95;
    const kpX = 594;
    const kpY = 74;
    const kpW = +(SEED.roomWidthIn * Sk).toFixed(1);  // 140.6
    const kpD = +(SEED.roomDepthIn * Sk).toFixed(1);  // 160.1

    return `
      <svg id="u4BathSvg" viewBox="0 0 770 426" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="${es ? "Alzado desplegado de 3 muros del área de tina a escala real 1:1 y planta llave" : "True 1:1 scale unfolded 3-wall tub alcove elevation and key plan"}">
        <defs>${buildCalacattaDefs("ov")}</defs>

        <!-- Title & Scale Header inside Drafting Sheet -->
        <text x="20" y="21" font-size="10.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? 'ALZADO DESPLEGADO DE 3 MUROS · ESCALA UNIFORME 1:1 (X = Y)' : 'UNFOLDED 3-WALL TUB ALCOVE ELEVATION · TRUE 1:1 SCALE (X = Y)'}
        </text>
        <text x="20" y="34" font-size="8.8" fill="#556066">
          ${es ? 'Oeste (Ventana)  |  Norte / Fondo (69-5/16" · 2 Nichos)  |  Este (Controles Regadera)' : 'West (Window Wall)  |  North / Back Wall (69-5/16" · 2 Niches)  |  East (Shower Controls)'}
        </text>

        <!-- Open Framing Band Above 71-1/4" HardieBacker (71.25" to 82" shown; 121-1/2" ceiling) -->
        <rect x="${xWest0}" y="${yFromZ(82)}" width="${(xEastEnd - xWest0).toFixed(1)}" height="${(yBackerTop - yFromZ(82)).toFixed(1)}" fill="#F6F2EA" stroke="#C8C0B0" stroke-width="0.9"/>
        <text x="${((xFoldNW + xFoldNE) / 2).toFixed(1)}" y="${(yBackerTop - 12).toFixed(1)}" text-anchor="middle" font-size="8.2" font-weight="700" fill="#6E5D46">
          ${es ? 'ARRIBA DE 71-1/4": BASTIDOR ABIERTO → TABLAROCA 1/2" RESISTENTE A HUMEDAD HASTA TECHO (121-1/2")' : 'ABOVE 71-1/4": OPEN FRAMING → 1/2" MOISTURE-RESISTANT DRYWALL TO 121-1/2" CEILING'}
        </text>

        <!-- Drywall / Untiled Zones on West & East -->
        <rect x="${xWest0}" y="${yBackerTop}" width="${(xFoldNW - xWest0).toFixed(1)}" height="${(yFloor - yBackerTop).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9" stroke-width="0.9"/>
        <rect x="${xFoldNE}" y="${yBackerTop}" width="${(xEastEnd - xFoldNE).toFixed(1)}" height="${(yFloor - yBackerTop).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9" stroke-width="0.9"/>

        <!-- WEST UPPER WINDOW + 5-1/4" CASING REPLACEMENT ZONE (NO WALL TILE ABOVE 43" SILL!) -->
        <rect x="${xWestStop}" y="${yBackerTop}" width="${(xFoldNW - xWestStop).toFixed(1)}" height="${(yWestSill - yBackerTop).toFixed(1)}" fill="url(#ov-hatch)" stroke="#8F5305" stroke-width="1.2" stroke-dasharray="4 3"/>
        <rect x="${xWestCasing}" y="${yBackerTop}" width="${(xFoldNW - xWestCasing).toFixed(1)}" height="${(yWestSill - yBackerTop).toFixed(1)}" fill="#EDE3D2" stroke="#8F5305" stroke-width="1.1"/>
        <text x="${((xWestStop + xWestCasing) / 2).toFixed(1)}" y="${((yBackerTop + yWestSill) / 2 - 6).toFixed(1)}" text-anchor="middle" font-size="8.2" font-weight="700" fill="#8F5305">
          ${es ? 'VENTANA NUEVA' : 'REPLACEMENT WINDOW'}
        </text>
        <text x="${((xWestStop + xWestCasing) / 2).toFixed(1)}" y="${((yBackerTop + yWestSill) / 2 + 5).toFixed(1)}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#8F5305">
          ${es ? '+ CHAMBRANA 5-1/4"' : '+ 5-1/4" CASING'}
        </text>
        <text x="${((xWestStop + xWestCasing) / 2).toFixed(1)}" y="${((yBackerTop + yWestSill) / 2 + 16).toFixed(1)}" text-anchor="middle" font-size="7.4" fill="#7A4404">
          ${es ? '(SIN AZULEJO ARRIBA)' : '(NO WALL TILE HERE)'}
        </text>

        <!-- TILED WALL FIELD: North (0..69.3125" x 0..69.25"), East (0..33" x 0..69.25" + 33..34.5" leg), West below sill (0..33" x 0..21") -->
        <rect x="${xFoldNW}" y="${yBullnoseBot}" width="${(northSpan * S).toFixed(1)}" height="${(yTubRim - yBullnoseBot).toFixed(1)}" fill="#FFFFFF" stroke="#9AA8B0" stroke-width="1"/>
        <rect x="${xFoldNE}" y="${yBullnoseBot}" width="${(33.0 * S).toFixed(1)}" height="${(yTubRim - yBullnoseBot).toFixed(1)}" fill="#FFFFFF" stroke="#9AA8B0" stroke-width="1"/>
        <rect x="${xWestApron}" y="${yWestSill}" width="${(33.0 * S).toFixed(1)}" height="${(yTubRim - yWestSill).toFixed(1)}" fill="#FFFFFF" stroke="#9AA8B0" stroke-width="1"/>

        ${courseLines}

        <!-- Wood Window Sill at z = 21" above tub (43" above laid floor) extending to 35" -->
        <rect x="${(xWestStop - 2).toFixed(1)}" y="${(yWestSill - 4).toFixed(1)}" width="${(35.0 * S + 2).toFixed(1)}" height="4.5" fill="#C99E67" stroke="#6E471B" stroke-width="1.1"/>

        <!-- ZERO-METAL 2"x6" SURFACE BULLNOSE BORDERS (0025S42691P4 + 2"x2" Corner 0025SN42691P2) -->
        <!-- Top horizontal 2" cap across North + East (69-1/4" to 71-1/4") -->
        <rect x="${xFoldNW}" y="${yBackerTop}" width="${((northSpan + 35.0) * S).toFixed(1)}" height="${(2.0 * S).toFixed(1)}" fill="#D9ECFF" stroke="#1F5F7A" stroke-width="1.2"/>
        <!-- East vertical 2" bullnose border (33" to 35") from top cap ALL THE WAY TO LAID FLOOR (-22")! -->
        <rect x="${xEastApron}" y="${yBullnoseBot}" width="${(2.0 * S).toFixed(1)}" height="${(yFloor - yBullnoseBot).toFixed(1)}" fill="#D9ECFF" stroke="#1F5F7A" stroke-width="1.2"/>
        <!-- 2"x2" Factory Bullnose Corner at East top-right (33"..35", 69.25"..71.25") -->
        <rect x="${xEastApron}" y="${yBackerTop}" width="${(2.0 * S).toFixed(1)}" height="${(2.0 * S).toFixed(1)}" fill="#97CDE4" stroke="#1F5F7A" stroke-width="1.3"/>
        <!-- West vertical 2" bullnose border below window sill (33" to 35", from 43" sill down to floor) -->
        <rect x="${xWestStop}" y="${yWestSill}" width="${(2.0 * S).toFixed(1)}" height="${(yFloor - yWestSill).toFixed(1)}" fill="#D9ECFF" stroke="#1F5F7A" stroke-width="1.2"/>

        <!-- TWO NICHES ON NORTH BACK WALL (Single-Piece 12x24 Calacatta Gem vs 3x6 Subway) -->
        <rect x="${lgX}" y="${lgY}" width="${lgW}" height="${lgH}" fill="${nicheFill}" stroke="#1F5F7A" stroke-width="1.6"/>
        <rect x="${smX}" y="${smY}" width="${smW}" height="${smH}" fill="${nicheFill}" stroke="#1F5F7A" stroke-width="1.6"/>
        ${state.nicheBackMode === "subway3x6" ? `
          <line x1="${lgX}" y1="${(lgY + lgH * 0.33).toFixed(1)}" x2="${(Number(lgX) + Number(lgW)).toFixed(1)}" y2="${(lgY + lgH * 0.33).toFixed(1)}" stroke="#B8C2BE" stroke-width="0.8"/>
          <line x1="${lgX}" y1="${(lgY + lgH * 0.66).toFixed(1)}" x2="${(Number(lgX) + Number(lgW)).toFixed(1)}" y2="${(lgY + lgH * 0.66).toFixed(1)}" stroke="#B8C2BE" stroke-width="0.8"/>
          <line x1="${smX}" y1="${(smY + smH * 0.5).toFixed(1)}" x2="${(Number(smX) + Number(smW)).toFixed(1)}" y2="${(smY + smH * 0.5).toFixed(1)}" stroke="#B8C2BE" stroke-width="0.8"/>
        ` : ""}
        <text x="${(Number(lgX) + Number(lgW) / 2).toFixed(1)}" y="${(Number(lgY) + Number(lgH) / 2 - 2).toFixed(1)}" text-anchor="middle" font-size="7.2" font-weight="700" fill="#1D2326">~11"×19"</text>
        <text x="${(Number(lgX) + Number(lgW) / 2).toFixed(1)}" y="${(Number(lgY) + Number(lgH) / 2 + 8).toFixed(1)}" text-anchor="middle" font-size="6.5″ fill="#286138">${state.nicheBackMode !== "subway3x6" ? (es ? "1 SOLA PZA" : "1-PC SLAB") : "3×6"}</text>
        <text x="${(Number(smX) + Number(smW) / 2).toFixed(1)}" y="${(Number(smY) + Number(smH) / 2 - 2).toFixed(1)}" text-anchor="middle" font-size="6.8" font-weight="700" fill="#1D2326">~7.5"×14"</text>
        <text x="${(Number(smX) + Number(smW) / 2).toFixed(1)}" y="${(Number(smY) + Number(smH) / 2 + 8).toFixed(1)}" text-anchor="middle" font-size="6.3″ fill="#286138">${state.nicheBackMode !== "subway3x6" ? (es ? "1 PZA" : "1-PC") : "3×6"}</text>

        <!-- East Wall Shower Fixtures (Spout, Delta Arcadia Valve, Shower Arm, Partial Glass Screen, Toilet Stub-out) -->
        <circle cx="${xEastValve}" cy="${yFromZ(60)}" r="3.5" fill="#B58938" stroke="#1D2326" stroke-width="1"/>
        <circle cx="${xEastValve}" cy="${yFromZ(27)}" r="6.5" fill="#E8D3A2" stroke="#8C651E" stroke-width="1.3"/>
        <rect x="${(Number(xEastValve) - 4).toFixed(1)}" y="${yFromZ(5.5)}" width="8" height="4" rx="1.5" fill="#B58938" stroke="#1D2326" stroke-width="0.9"/>
        <!-- Partial Fixed Glass Screen Indicator (~26" wide on East rim) -->
        <rect x="${xFoldNE}" y="${yFromZ(68)}" width="${(24.0 * S).toFixed(1)}" height="${(68.0 * S).toFixed(1)}" fill="rgba(124,192,220,0.12)" stroke="#1F5F7A" stroke-width="1" stroke-dasharray="3 2"/>
        <text x="${(xFoldNE + 12 * S).toFixed(1)}" y="${(yFromZ(68) + 11).toFixed(1)}" text-anchor="middle" font-size="6.8″ font-weight="700″ fill="#1F5F7A">${es ? "CRISTAL FIJO PARCIAL" : "PARTIAL GLASS"}</text>

        <!-- Copper Toilet Supply Stub-Out (~37.75") & HardieBacker Seam (~39") -->
        <line x1="${xEastBackerSeam}" y1="${yBackerTop}" x2="${xEastBackerSeam}" y2="${yFloor}" stroke="#8F5305" stroke-width="1.1" stroke-dasharray="3 2"/>
        <circle cx="${xEastToiletStub}" cy="${yFromZ(-14)}" r="3.2" fill="#C86D3B" stroke="#1D2326" stroke-width="0.9"/>
        <text x="${(Number(xEastToiletStub) + 5).toFixed(1)}" y="${(yFromZ(-14) + 2.5).toFixed(1)}" font-size="6.6" font-weight="700" fill="#8F5305">${es ? 'Toma WC ~38"' : 'WC stub ~38"'}</text>

        <!-- KOHLER K-1821 TUB & ~33" STONE WATERFALL APRON (z = -22" to 0") -->
        <rect x="${xWestApron}" y="${yTubRim}" width="${((33.0 + northSpan + 33.0) * S).toFixed(1)}" height="${(22.0 * S).toFixed(1)}" fill="#EAECEF" stroke="#556066" stroke-width="1.5"/>
        <text x="${((xFoldNW + xFoldNE) / 2).toFixed(1)}" y="${(yTubRim + 28).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="700" fill="#1D2326">
          ${es ? 'TINA KOHLER K-1821 + CUBIERTA/FALDA DE PIEDRA (~33" FONDO · 22" ALTO DESDE PISO)' : 'KOHLER K-1821 TUB + WHITE STONE WATERFALL APRON (~33" DEPTH · 22" HIGH OFF FLOOR)'}
        </text>
        <text x="${((xFoldNW + xFoldNE) / 2).toFixed(1)}" y="${(yTubRim + 41).toFixed(1)}" text-anchor="middle" font-size="7.6" fill="#286138">
          ${es ? 'Ambas esquinas 33"–35" bajan con bullnose 2"×6" al costado de la piedra hasta el piso Calacatta' : 'Both 33"–35" borders carry 2"×6" ceramic bullnose down beside the stone apron to the Calacatta floor'}
        </text>

        <!-- Fold Lines & Floor Baseline -->
        <line x1="${xFoldNW}" y1="${yFromZ(82)}" x2="${xFoldNW}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.8" stroke-dasharray="5 3"/>
        <line x1="${xFoldNE}" y1="${yFromZ(82)}" x2="${xFoldNE}" y2="${yFloor}" stroke="#1D2326" stroke-width="1.8" stroke-dasharray="5 3"/>
        <line x1="${(xWest0 - 8).toFixed(1)}" y1="${yFloor}" x2="${(xEastEnd + 8).toFixed(1)}" y2="${yFloor}" stroke="#1D2326" stroke-width="2.2"/>

        <!-- Dimension Callouts -->
        <!-- 71-1/4" Backer Top Cap -->
        <line x1="${(xWest0 - 14).toFixed(1)}" y1="${yBackerTop}" x2="${(xWest0 - 14).toFixed(1)}" y2="${yTubRim}" stroke="#1F5F7A" stroke-width="1.3"/>
        <text x="${(xWest0 - 18).toFixed(1)}" y="${((yBackerTop + yTubRim) / 2).toFixed(1)}" text-anchor="end" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">71-1/4"</text>
        <text x="${(xWest0 - 18).toFixed(1)}" y="${((yBackerTop + yTubRim) / 2 + 10).toFixed(1)}" text-anchor="end" font-size="6.8″ fill="#556066">${es ? "sobre tina" : "above tub"}</text>

        <!-- 43" West Sill to Floor -->
        <line x1="${xWestStop}" y1="${yWestSill}" x2="${xWestStop}" y2="${yFloor}" stroke="#286138" stroke-width="1.2"/>
        <text x="${(Number(xWestStop) - 4).toFixed(1)}" y="${((yWestSill + yFloor) / 2).toFixed(1)}" text-anchor="end" font-size="7.8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#286138">43"</text>

        <!-- Bottom Running Dimension Strings -->
        <text x="${((xWestStop + xFoldNW) / 2).toFixed(1)}" y="${(yFloor + 16).toFixed(1)}" text-anchor="middle" font-size="8.2″ font-weight="700″ font-family="IBM Plex Mono, monospace" fill="#286138">← 35" ${es ? "TOPE OESTE" : "WEST STOP"}</text>
        <text x="${((xFoldNW + xFoldNE) / 2).toFixed(1)}" y="${(yFloor + 16).toFixed(1)}" text-anchor="middle" font-size="8.5″ font-weight="700″ font-family="IBM Plex Mono, monospace" fill="#1D2326">← 69-5/16" ${es ? "MURO NORTE (FONDO)" : "NORTH BACK WALL"} →</text>
        <text x="${((xFoldNE + xEastStop) / 2).toFixed(1)}" y="${(yFloor + 16).toFixed(1)}" text-anchor="middle" font-size="8.2″ font-weight="700″ font-family="IBM Plex Mono, monospace" fill="#286138">35" ${es ? "TOPE ESTE" : "EAST STOP"} →</text>
        <text x="${((xFoldNW + xFoldNE) / 2).toFixed(1)}" y="${(yFloor + 30).toFixed(1)}" text-anchor="middle" font-size="7.5" fill="#556066">
          ${es ? 'Piso Calacatta Gem 12"×24" ya colocado (boquilla Warm Gray pendiente) · Cero perfiles metálicos' : 'Laid 12"×24" Calacatta Gem floor (Warm Gray grout pending) · Zero metal / Schluter trim'}
        </text>

        <!-- RIGHT INSET: TOP-DOWN ROOM KEY PLAN (72-1/8" x 82-1/8", True Uniform Scale) -->
        <g>
          <rect x="576" y="44" width="180" height="266" rx="6" fill="#F8FAF9" stroke="#C5CCC9" stroke-width="1"/>
          <text x="666" y="61" text-anchor="middle" font-size="8.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
            ${es ? 'PLANTA LLAVE (72-1/8"×82-1/8")' : 'ROOM KEY PLAN (72-1/8"×82-1/8")'}
          </text>
          <!-- Room Envelope -->
          <rect x="${kpX}" y="${kpY}" width="${kpW}" height="${kpD}" fill="#FFFFFF" stroke="#1D2326" stroke-width="1.8"/>
          <!-- Tub + ~33" Stone Apron -->
          <rect x="${kpX}" y="${kpY}" width="${kpW}" height="${(33.0 * Sk).toFixed(1)}" fill="#E9EEF2" stroke="#556066" stroke-width="1.2"/>
          <text x="${(kpX + kpW / 2).toFixed(1)}" y="${(kpY + 28).toFixed(1)}" text-anchor="middle" font-size="7.5" font-weight="700" fill="#1D2326">${es ? 'TINA + PIEDRA ~33"' : 'TUB + ~33" STONE'}</text>
          <!-- Highlighted Tiled Walls (North full + West 35" sill + East 35" full) -->
          <line x1="${kpX}" y1="${kpY}" x2="${(kpX + kpW).toFixed(1)}" y2="${kpY}" stroke="#286138" stroke-width="4"/>
          <line x1="${kpX}" y1="${kpY}" x2="${kpX}" y2="${(kpY + 35.0 * Sk).toFixed(1)}" stroke="#8F5305" stroke-width="4"/>
          <line x1="${(kpX + kpW).toFixed(1)}" y1="${kpY}" x2="${(kpX + kpW).toFixed(1)}" y2="${(kpY + 35.0 * Sk).toFixed(1)}" stroke="#286138" stroke-width="4"/>
          <circle cx="${kpX}" cy="${(kpY + 35.0 * Sk).toFixed(1)}" r="3" fill="#8F5305"/>
          <circle cx="${(kpX + kpW).toFixed(1)}" cy="${(kpY + 35.0 * Sk).toFixed(1)}" r="3" fill="#286138"/>
          <text x="${(kpX + 6).toFixed(1)}" y="${(kpY + 35.0 * Sk + 11).toFixed(1)}" font-size="6.8″ font-weight="700″ fill="#8F5305">35″ (${es ? "bajo repisa" : "under sill"})</text>
          <text x="${(kpX + kpW - 6).toFixed(1)}" y="${(kpY + 35.0 * Sk + 11).toFixed(1)}" text-anchor="end" font-size="6.8″ font-weight="700″ fill="#286138">35″ (${es ? "alto total" : "full ht"})</text>

          <!-- Pedestal Sink (West) & 10" Rough-in Toilet (East) + 28" Outward Door (South) -->
          <ellipse cx="${(kpX + 18).toFixed(1)}" cy="${(kpY + 112).toFixed(1)}" rx="13" ry="17" fill="#F4F5F3" stroke="#6C777C" stroke-width="1" stroke-dasharray="3 2"/>
          <text x="${(kpX + 36).toFixed(1)}" y="${(kpY + 115).toFixed(1)}" font-size="6.8″ fill="#556066">${es ? "Lavabo" : "Sink"}</text>
          <rect x="${(kpX + kpW - 30).toFixed(1)}" y="${(kpY + 86).toFixed(1)}" width="26" height="18" rx="3" fill="#F4F5F3" stroke="#6C777C" stroke-width="1"/>
          <text x="${(kpX + kpW - 34).toFixed(1)}" y="${(kpY + 98).toFixed(1)}" text-anchor="end" font-size="6.8" fill="#556066">WC</text>
          <!-- 28" Entry Door Opening -->
          <line x1="${(kpX + 12).toFixed(1)}" y1="${(kpY + kpD).toFixed(1)}" x2="${(kpX + 12 + 28 * Sk).toFixed(1)}" y2="${(kpY + kpD).toFixed(1)}" stroke="#FFFFFF" stroke-width="3.5"/>
          <text x="${(kpX + 12 + 14 * Sk).toFixed(1)}" y="${(kpY + kpD + 11).toFixed(1)}" text-anchor="middle" font-size="6.8" font-weight="700" fill="#1F5F7A">${es ? 'ENTRADA 28"' : '28" ENTRY'}</text>

          <!-- Compass Rose -->
          <g transform="translate(666, 276)">
            <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#1F5F7A" stroke-width="1.2"/>
            <polygon points="0,-11 3.5,0 0,-3 -3.5,0" fill="#1F5F7A"/>
            <text x="0" y="-16" text-anchor="middle" font-size="7.5" font-weight="700" fill="#1F5F7A">N</text>
            <text x="19" y="3" font-size="7" font-weight="700" fill="#556066">E</text>
            <text x="-24" y="3" font-size="7" font-weight="700" fill="#556066">W</text>
            <text x="0" y="23" text-anchor="middle" font-size="7" font-weight="700" fill="#556066">S</text>
          </g>
        </g>

        <!-- Ephemeral Pin Overlay -->
        ${renderPinSvgOverlay("alcove-overview")}
      </svg>
    `;
  }

  function buildStep2NichesSvg(es, forPrint) {
    // Left half: True 1:1 Zoomed North Wall Niche Zone (x = 12"..52", z = 0"..44" at S = 6.2 px/in)
    // Right half: True 1:1 Parent 12x24 Calacatta Gem Cut Nesting Map (S2 = 5.4 px/in) + 4-Side Hidden-Edge Lap Section
    const S = 6.2;
    if (!forPrint) {
      state.lastScaleInfo = { view: "north-niches", scaleX: S, scaleY: S, uniform: true };
    }

    const xMinIn = 13.0;
    const xMaxIn = 51.0;
    const zMaxIn = 42.0;
    const ox = 46;
    const oy = 38;
    const wPx = +((xMaxIn - xMinIn) * S).toFixed(1); // 235.6
    const hPx = +(zMaxIn * S).toFixed(1);           // 260.4
    const xAt = (xIn) => +(ox + (xIn - xMinIn) * S).toFixed(1);
    const yAt = (zIn) => +(oy + (zMaxIn - zIn) * S).toFixed(1);

    const courses = computeCourseAnalysis();
    const tileW = SEED.wallTile.actualW; // 6.028"
    let gridSvg = "";
    for (let r = 0; r < courses.joints.length; r++) {
      const zBot = courses.joints[r];
      const zTop = r + 1 < courses.joints.length ? courses.joints[r + 1] : courses.topCapBottomZ;
      if (zBot >= zMaxIn) break;
      const yTop = yAt(Math.min(zMaxIn, zTop));
      const yBot = yAt(zBot);
      if (zTop <= zMaxIn) {
        const isHeaderLine = Math.abs(zTop - 36.0) < 0.35;
        gridSvg += `<line x1="${ox}" y1="${yTop}" x2="${(ox + wPx).toFixed(1)}" y2="${yTop}" stroke="${isHeaderLine ? '#286138' : currentGrout().stroke}" stroke-width="${isHeaderLine ? '1.3' : '0.75'}"/>`;
      }
      // Running bond 50% vertical joints centered on wall (69.3125 / 2 = 34.656")
      const rowOffset = (r % 2 === 1) ? tileW / 2 : 0;
      for (let k = -8; k <= 8; k++) {
        const xJ = 34.656 + k * tileW + rowOffset;
        if (xJ > xMinIn && xJ < xMaxIn) {
          const xPx = xAt(xJ);
          gridSvg += `<line x1="${xPx}" y1="${yTop}" x2="${xPx}" y2="${yBot}" stroke="${currentGrout().stroke}" stroke-width="${state.groutMode === 'warmGray93' ? '0.95' : '0.7'}"/>`;
        }
      }
    }

    const lgX = xAt(19.0), lgY = yAt(36.0), lgW = +(11.0 * S).toFixed(1), lgH = +(19.0 * S).toFixed(1);
    const smX = xAt(37.5), smY = yAt(35.75), smW = +(7.5 * S).toFixed(1), smH = +(14.0 * S).toFixed(1);
    const is1Pc = state.nicheBackMode !== "subway3x6";
    const nFill = getNicheBackFill("nc");
    const frameW = state.nicheFrameMode === "bullnose2x6" ? +(2.0 * S).toFixed(1) : 0;

    return `
      <svg id="u4BathSvg" viewBox="0 0 770 356" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="${es ? "Detalle a escala 1:1 de ambos nichos y aprovechamiento de azulejo de piso 12x24 de una sola pieza" : "True 1:1 dual-niche elevation and single-piece 12x24 floor-tile cut map"}">
        <defs>
          ${buildCalacattaDefs("nc")}
          <clipPath id="nicheFieldClip"><rect x="${ox}" y="${oy}" width="${wPx}" height="${hPx}"/></clipPath>
        </defs>

        <!-- LEFT PANEL: 1:1 ZOOMED DUAL-NICHE COURSE ALIGNMENT -->
        <text x="${ox}" y="19" font-size="9.8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? 'MURO NORTE · ZONA DE 2 NICHOS (ESCALA 1:1)' : 'NORTH WALL · DUAL-NICHE ZONE (TRUE 1:1 SCALE)'}
        </text>
        <text x="${ox}" y="31" font-size="8" fill="#556066">
          ${es ? `Primera hilada en tina: ${fmtFrac(state.starterRowIn)} · Desfase en dintel 36": ${courses.headerDelta}"` : `Starter row at tub: ${fmtFrac(state.starterRowIn)} · Joint delta at 36" niche top: ${courses.headerDelta}"`}
        </text>

        <rect x="${ox}" y="${oy}" width="${wPx}" height="${hPx}" fill="#FFFFFF" stroke="#1D2326" stroke-width="1.3"/>
        <g clip-path="url(#nicheFieldClip)">${gridSvg}</g>

        <!-- Optional 2"x6" Ceramic Surface Bullnose Frame around Niches -->
        ${frameW > 0 ? `
          <rect x="${(lgX - frameW).toFixed(1)}" y="${(lgY - frameW).toFixed(1)}" width="${(Number(lgW) + 2 * frameW).toFixed(1)}" height="${(Number(lgH) + 2 * frameW).toFixed(1)}" fill="rgba(217,236,255,0.68)" stroke="#1F5F7A" stroke-width="1"/>
          <rect x="${(smX - frameW).toFixed(1)}" y="${(smY - frameW).toFixed(1)}" width="${(Number(smW) + 2 * frameW).toFixed(1)}" height="${(Number(smH) + 2 * frameW).toFixed(1)}" fill="rgba(217,236,255,0.68)" stroke="#1F5F7A" stroke-width="1"/>
        ` : ""}

        <!-- Left (Large) Niche ~19"-30" W x ~17"-36" H -->
        <rect x="${lgX}" y="${lgY}" width="${lgW}" height="${lgH}" fill="${nFill}" stroke="#1D2326" stroke-width="1.8" stroke-dasharray="${is1Pc ? 'none' : '3 2'}"/>
        ${!is1Pc ? `
          <line x1="${lgX}" y1="${yAt(20)}" x2="${(lgX + Number(lgW)).toFixed(1)}" y2="${yAt(20)}" stroke="#9AA8B0" stroke-width="0.9"/>
          <line x1="${lgX}" y1="${yAt(23)}" x2="${(lgX + Number(lgW)).toFixed(1)}" y2="${yAt(23)}" stroke="#9AA8B0" stroke-width="0.9"/>
          <line x1="${lgX}" y1="${yAt(26)}" x2="${(lgX + Number(lgW)).toFixed(1)}" y2="${yAt(26)}" stroke="#9AA8B0" stroke-width="0.9"/>
          <line x1="${lgX}" y1="${yAt(29)}" x2="${(lgX + Number(lgW)).toFixed(1)}" y2="${yAt(29)}" stroke="#9AA8B0" stroke-width="0.9"/>
          <line x1="${lgX}" y1="${yAt(32)}" x2="${(lgX + Number(lgW)).toFixed(1)}" y2="${yAt(32)}" stroke="#9AA8B0" stroke-width="0.9"/>
        ` : ""}
        <!-- Sloped Sill Highlight -->
        <line x1="${lgX}" y1="${(lgY + Number(lgH)).toFixed(1)}" x2="${(lgX + Number(lgW)).toFixed(1)}" y2="${(lgY + Number(lgH)).toFixed(1)}" stroke="#286138" stroke-width="3.2"/>
        <text x="${(lgX + Number(lgW) / 2).toFixed(1)}" y="${(lgY + Number(lgH) / 2 - 8).toFixed(1)}" text-anchor="middle" font-size="8.2″ font-weight="700″ fill="#1D2326">${es ? "NICHO IZQ." : "LEFT NICHE"}</text>
        <text x="${(lgX + Number(lgW) / 2).toFixed(1)}" y="${(lgY + Number(lgH) / 2 + 3).toFixed(1)}" text-anchor="middle" font-size="7.8" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">~11" × 19"</text>
        <text x="${(lgX + Number(lgW) / 2).toFixed(1)}" y="${(lgY + Number(lgH) / 2 + 14).toFixed(1)}" text-anchor="middle" font-size="7.2″ font-weight="700″ fill="${is1Pc ? '#286138' : '#8F5305'}">${is1Pc ? (es ? "0 JUNTAS" : "0 SEAMS") : (es ? "6+ JUNTAS" : "6+ SEAMS")}</text>

        <!-- Right (Small) Niche ~37.5"-45" W x ~21.75"-35.75" H -->
        <rect x="${smX}" y="${smY}" width="${smW}" height="${smH}" fill="${nFill}" stroke="#1D2326" stroke-width="1.8"/>
        ${!is1Pc ? `
          <line x1="${smX}" y1="${yAt(25)}" x2="${(smX + Number(smW)).toFixed(1)}" y2="${yAt(25)}" stroke="#9AA8B0" stroke-width="0.9"/>
          <line x1="${smX}" y1="${yAt(28)}" x2="${(smX + Number(smW)).toFixed(1)}" y2="${yAt(28)}" stroke="#9AA8B0" stroke-width="0.9"/>
          <line x1="${smX}" y1="${yAt(31)}" x2="${(smX + Number(smW)).toFixed(1)}" y2="${yAt(31)}" stroke="#9AA8B0" stroke-width="0.9"/>
        ` : ""}
        <line x1="${smX}" y1="${(smY + Number(smH)).toFixed(1)}" x2="${(smX + Number(smW)).toFixed(1)}" y2="${(smY + Number(smH)).toFixed(1)}" stroke="#286138" stroke-width="3.2"/>
        <text x="${(smX + Number(smW) / 2).toFixed(1)}" y="${(smY + Number(smH) / 2 - 6).toFixed(1)}" text-anchor="middle" font-size="7.6″ font-weight="700″ fill="#1D2326">${es ? "DER." : "RIGHT"}</text>
        <text x="${(smX + Number(smW) / 2).toFixed(1)}" y="${(smY + Number(smH) / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="7.2" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">~7.5"×14"</text>
        <text x="${(smX + Number(smW) / 2).toFixed(1)}" y="${(smY + Number(smH) / 2 + 14).toFixed(1)}" text-anchor="middle" font-size="6.8″ font-weight="700″ fill="${is1Pc ? '#286138' : '#8F5305'}">${is1Pc ? (es ? "0 JUNTAS" : "0 SEAMS") : (es ? "4+ JUNTAS" : "4+ SEAMS")}</text>

        <!-- Tub Deck Baseline -->
        <rect x="${ox}" y="${(oy + hPx).toFixed(1)}" width="${wPx}" height="18" fill="#E6EBEF" stroke="#556066" stroke-width="1.3"/>
        <text x="${(ox + wPx / 2).toFixed(1)}" y="${(oy + hPx + 12).toFixed(1)}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#1D2326">
          ${es ? 'CUBIERTA DE PIEDRA DE LA TINA (Z = 0" · 1/8" SILICÓN)' : 'TUB STONE DECK (Z = 0" · 1/8" SILICONE JOINT)'}
        </text>

        <!-- Elevation Marks on Left Axis -->
        <text x="${(ox - 5).toFixed(1)}" y="${(yAt(36) + 3).toFixed(1)}" text-anchor="end" font-size="7.5" font-family="IBM Plex Mono, monospace" font-weight="700" fill="#286138">~36"</text>
        <text x="${(ox - 5).toFixed(1)}" y="${(yAt(21.75) + 3).toFixed(1)}" text-anchor="end" font-size="7.5" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">~21-3/4"</text>
        <text x="${(ox - 5).toFixed(1)}" y="${(yAt(17) + 3).toFixed(1)}" text-anchor="end" font-size="7.5" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">~17"</text>
        <text x="${(ox - 5).toFixed(1)}" y="${(yAt(0) + 3).toFixed(1)}" text-anchor="end" font-size="7.5" font-family="IBM Plex Mono, monospace" fill="#556066">0"</text>

        <!-- Horizontal Station Marks -->
        <text x="${lgX}" y="${(oy + hPx + 31).toFixed(1)}" text-anchor="middle" font-size="7.2" font-family="IBM Plex Mono, monospace" fill="#556066">~19"</text>
        <text x="${(lgX + Number(lgW)).toFixed(1)}" y="${(oy + hPx + 31).toFixed(1)}" text-anchor="middle" font-size="7.2" font-family="IBM Plex Mono, monospace" fill="#556066">~30"</text>
        <text x="${smX}" y="${(oy + hPx + 31).toFixed(1)}" text-anchor="middle" font-size="7.2" font-family="IBM Plex Mono, monospace" fill="#556066">~37.5"</text>
        <text x="${(smX + Number(smW)).toFixed(1)}" y="${(oy + hPx + 31).toFixed(1)}" text-anchor="middle" font-size="7.2" font-family="IBM Plex Mono, monospace" fill="#556066">~45"</text>

        <!-- RIGHT TOP: 1:1 LARGE-FORMAT SINGLE-PIECE TILE CUT NESTING (24x48 1-Tile vs 12x24 2-Tile) -->
        <rect x="318" y="14" width="436" height="190" rx="6" fill="#F8FAF9" stroke="#C5CCC9" stroke-width="1"/>
        <text x="332" y="31" font-size="9.0" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${state.nicheBackMode === "large12x24"
            ? (es ? 'CORTE EN 2 PIEZAS GRANDES 12"×24" (VERIFICAR ANCHO <= 11-3/4")' : 'CUT MAP ON TWO 12"×24" LARGE TILES (CHECK WIDTH <= 11-3/4")')
            : (es ? '1 SOLA PIEZA FORMATO GRANDE 24"×48" CORTA AMBOS NICHOS + REPISAS' : 'ONE 24"×48" LARGE-FORMAT TILE CUTS BOTH NICHE BACKS + SILLS')}
        </text>
        <text x="332" y="44" font-size="7.6" fill="#556066">
          ${es ? 'Porcelanato/cerámica delgada (~5/16"–3/8") conserva toda la profundidad útil para botellas (producto por elegir)' : 'Thin ~5/16"–3/8" large-format porcelain/ceramic keeps full bottle shelf depth (product selection open)'}
        </text>

        ${state.nicheBackMode === "large12x24" ? `
          <!-- Two 12x24 tiles at uniform scale 4.8 px/in -->
          <rect x="336" y="58" width="57" height="114" fill="#ECEEEB" stroke="#556066" stroke-width="1.2" stroke-dasharray="3 2"/>
          <rect x="336" y="81" width="53" height="91" fill="${nFill}" stroke="#8F5305" stroke-width="1.7"/>
          <text x="364" y="124" text-anchor="middle" font-size="7.2" font-weight="700" fill="#1D2326">~11"×19"</text>
          <text x="364" y="135" text-anchor="middle" font-size="6.5" fill="#8F5305">${es ? 'Margen ~3/4"' : '~3/4" margin'}</text>
          <text x="364" y="185" text-anchor="middle" font-size="7.0" font-weight="700" fill="#1D2326">${es ? '12"×24" #1 (Izq.)' : '12"×24" #1 (Left)'}</text>

          <rect x="412" y="58" width="57" height="114" fill="#ECEEEB" stroke="#556066" stroke-width="1.2" stroke-dasharray="3 2"/>
          <rect x="412" y="105" width="36" height="67" fill="${nFill}" stroke="#286138" stroke-width="1.7"/>
          <text x="430" y="139" text-anchor="middle" font-size="7.0" font-weight="700" fill="#1D2326">~7.5"×14"</text>
          <text x="440" y="185" text-anchor="middle" font-size="7.0" font-weight="700" fill="#1D2326">${es ? '12"×24" #2 (Der.)' : '12"×24" #2 (Right)'}</text>
        ` : `
          <!-- Single 24"x48" large-format slab laid horizontally (47.2" x 23.6" at uniform scale 3.4 px/in -> 160.5 x 80.2 px) -->
          <rect x="334" y="68" width="161" height="81" fill="#ECEEEB" stroke="#556066" stroke-width="1.3" stroke-dasharray="3 2"/>
          <!-- Left Niche Back 11" x 19" -> 37.4 x 64.6 px -->
          <rect x="338" y="81" width="37.4" height="64.6" fill="${nFill}" stroke="#286138" stroke-width="1.8"/>
          <text x="356.7″ y="112″ text-anchor="middle" font-size="6.8″ font-weight="700″ fill="#1D2326">${es ? "IZQ." : "LEFT"}</text>
          <text x="356.7" y="122" text-anchor="middle" font-size="6.4" font-family="IBM Plex Mono, monospace" fill="#286138">11"×19"</text>
          <!-- Right Niche Back 7.5" x 14" -> 25.5 x 47.6 px -->
          <rect x="382" y="98" width="25.5" height="47.6" fill="${nFill}" stroke="#286138" stroke-width="1.8"/>
          <text x="394.8″ y="121″ text-anchor="middle" font-size="6.5″ font-weight="700″ fill="#1D2326">${es ? "DER." : "RIGHT"}</text>
          <text x="394.8" y="130" text-anchor="middle" font-size="6.1" font-family="IBM Plex Mono, monospace" fill="#286138">7.5"×14"</text>
          <!-- Both 1-Piece Sloped Sills cut from remaining half! -->
          ${state.nicheSillMode === "solidSill" ? `
            <rect x="416" y="110" width="37.4" height="14" fill="${nFill}" stroke="#1F5F7A" stroke-width="1.4"/>
            <rect x="416" y="130" width="25.5" height="14" fill="${nFill}" stroke="#1F5F7A" stroke-width="1.4"/>
            <text x="458″ y="128″ font-size="6.4″ font-weight="700″ fill="#1F5F7A">${es ? "2 Repisas" : "2 Sills"}</text>
          ` : ""}
          <text x="414" y="62" text-anchor="middle" font-size="7.2" font-weight="700" fill="#1D2326">${es ? '1 PIEZA 24"×48" (ESCALA 1:1)' : '1 SINGLE 24"×48" TILE (1:1 SCALE)'}</text>
          <text x="414" y="164" text-anchor="middle" font-size="6.9" fill="#286138">${es ? 'Sobra amplio margen incluso si el nicho mide > 12"' : 'Plenty of margin even if Left Niche measures > 12"'}</text>
        `}

        <!-- Callout bullets next to Large-Format Tile -->
        <text x="506″ y="68″ font-size="7.7″ font-weight="700″ fill="#286138">${es ? "✓ Por qué 1 pieza grande es ideal:" : "✓ Why 1 large-format piece wins:"}</text>
        <text x="506″ y="83″ font-size="7.2″ fill="#1D2326">${es ? "• Cero líneas de boquilla en el fondo" : "• Zero grout seams on the wet back wall"}</text>
        <text x="506″ y="97″ font-size="7.2″ fill="#1D2326">${es ? "• 24″×48″ da ambos fondos de 1 pieza" : "• One 24″×48″ tile yields BOTH backs"}</text>
        <text x="506″ y="111″ font-size="7.2″ fill="#1D2326″>${es ? "  sin riesgo si el nicho pasa de 12″" : "  safely even if Left Niche exceeds 12″"}</text>
        <text x="506″ y="125″ font-size="7.2″ fill="#1D2326">${es ? "• Fondo entra PRIMERO: los 4 cortes" : "• Set back piece FIRST: side/top/sill"}</text>
        <text x="506″ y="137″ font-size="7.2″ fill="#1D2326">${es ? "  quedan ocultos tras los retornos" : "  returns lap in front & hide all 4 cuts"}</text>
        <text x="506″ y="153″ font-size="7.2″ font-weight="700″ fill="#8F5305">${es ? "• Profundidad nichos: diferida (null)" : "• Niche depths: deferred (null)"}</text>
        <text x="506″ y="165″ font-size="7.0″ fill="#556066">${es ? "  Porcelanato 3/8″ no roba espacio útil" : "  ~3/8″ tile keeps max bottle depth"}</text>

        <!-- RIGHT BOTTOM: 4-STEP HIDDEN-EDGE NICHE SECTION DETAIL -->
        <rect x="318" y="214" width="436" height="128" rx="6" fill="#F8FAF9" stroke="#C5CCC9" stroke-width="1"/>
        <text x="332" y="231" font-size="8.8" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? 'CORTE LATERAL DEL NICHO — ORDEN DE COLOCACIÓN (OCULTA LOS 4 CORTES)' : 'NICHE SIDE SECTION — 4-STEP INSTALL SEQUENCE (HIDES ALL CUT EDGES)'}
        </text>
        <!-- Waterproofed Niche Pocket Section -->
        <path d="M352,244 L446,244 L446,314 L518,314 L518,330 L338,330 L338,244 Z" fill="#EDE6DA" stroke="#8C7A65" stroke-width="1.2"/>
        <!-- Waterproof Membrane Red Line -->
        <path d="M446,244 L446,314 L518,314" fill="none" stroke="#C93B2B" stroke-width="2.4"/>
        <!-- Step 1: 1-Piece Calacatta Back Slab against back -->
        <rect x="448" y="250" width="8" height="56" fill="${nFill}" stroke="#286138" stroke-width="1.5"/>
        <!-- Step 2: Sloped Bottom Sill (pitched toward tub at right!) lapping in front of back slab bottom! -->
        <polygon points="448,307 522,311 522,318 448,314" fill="${state.nicheSillMode === 'solidSill' ? nFill : '#D9ECFF'}" stroke="#1F5F7A" stroke-width="1.5"/>
        <!-- Step 3: Wall Face Tile + Bullnose below sill -->
        <rect x="518" y="319" width="7" height="14" fill="#FFFFFF" stroke="#556066" stroke-width="1.1"/>

        <text x="542″ y="256″ font-size="7.4″ font-weight="700″ fill="#C93B2B">${es ? "1. Membrana continua impermeable" : "1. Continuous waterproof membrane"}</text>
        <text x="542″ y="272″ font-size="7.4″ font-weight="700″ fill="#286138">${es ? "2. Fondo de 1 sola pieza PRIMERO" : "2. Set 1-piece cut tile back FIRST"}</text>
        <text x="542" y="288" font-size="7.4" font-weight="700" fill="#1F5F7A">${es ? '3. Repisa con pendiente 1/4"/pie a tina' : '3. Set bottom sill sloped 1/4"/ft to tub'}</text>
        <text x="542″ y="304″ font-size="7.4″ font-weight="700″ fill="#1D2326">${es ? "4. Costados tapan cantos + 100% silicón" : "4. Jambs lap cut edges + 100% silicone"}</text>
        <text x="542″ y="320″ font-size="7.0″ fill="#556066">${es ? "Cero esquineros metálicos / Schluter" : "Zero metal / Schluter trim anywhere"}</text>

        ${renderPinSvgOverlay("north-niches")}
      </svg>
    `;
  }

  function buildStep3StopsSvg(es, forPrint) {
    // True 1:1 Side-by-Side Elevations of East Control Wall & West Window Wall (S = 3.1 px/in)
    // Plus Bottom Zoomed Top-Down Cutaway of 33" Stone Apron -> 35" 2x6 Ceramic Bullnose Stop
    const S = 3.1;
    if (!forPrint) {
      state.lastScaleInfo = { view: "east-west-stops", scaleX: S, scaleY: S, uniform: true };
    }
    const zTop = 74.0;
    const yAt = (zIn) => +(38 + (zTop - zIn) * S).toFixed(1);
    const yBackerTop = yAt(71.25);
    const yCapBot = yAt(69.25);
    const yWestSill = yAt(21.0); // 43" above floor
    const yTub = yAt(0);
    const yFloor = yAt(-22.0);

    // Left Box: East Shower-Control Wall (0" North corner at left -> 45" toward South toilet)
    const ex0 = 48;
    // Right Box: West Window Wall (46" doorway-side edge at left -> 0" North corner at right!)
    const wxCorner = 528; // North-West corner (0")
    const wxDoorEdge = +(wxCorner - 45.5 * S).toFixed(1); // 45-1/2" span!
    const wxStop = +(wxCorner - 35.0 * S).toFixed(1);
    const wxApron = +(wxCorner - 33.0 * S).toFixed(1);
    const wxCasing = +(wxCorner - 5.25 * S).toFixed(1);

    return `
      <svg id="u4BathSvg" viewBox="0 0 770 368" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="${es ? "Alzados a escala 1:1 de remates Este y Oeste a 35 pulgadas y detalle superior del bullnose" : "True 1:1 East and West 35-inch tile-stop elevations and top-down bullnose cutaway"}">
        <defs>${buildCalacattaDefs("ew")}</defs>

        <!-- LEFT: EAST SHOWER-CONTROL WALL (0" North -> 44" South) -->
        <text x="${ex0}" y="19" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? 'MURO ESTE (CONTROLES) · 0" NORTE → SUR (1:1)' : 'EAST CONTROL WALL · 0" NORTH → SOUTH (1:1)'}
        </text>
        <text x="${ex0}" y="31" font-size="7.8" fill="#556066">
          ${es ? 'Tope bloqueado a 35" (2" pasando la piedra de ~33")' : 'Locked 35" stop (2" past ~33" stone waterfall apron)'}
        </text>

        <!-- East Wall Substrate -->
        <rect x="${ex0}" y="${yBackerTop}" width="${(44 * S).toFixed(1)}" height="${(yFloor - yBackerTop).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9" stroke-width="1"/>
        <!-- Tiled Field (0..33" x 0..69.25") -->
        <rect x="${ex0}" y="${yCapBot}" width="${(33 * S).toFixed(1)}" height="${(yTub - yCapBot).toFixed(1)}" fill="#FFFFFF" stroke="#9AA8B0" stroke-width="1"/>
        <!-- 2"x6" Top Bullnose + 2"x2" Corner + Full-Height Vertical 2"x6" Bullnose down to floor (33"..35") -->
        <rect x="${ex0}" y="${yBackerTop}" width="${(33 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#D9ECFF" stroke="#1F5F7A" stroke-width="1.2"/>
        <rect x="${(ex0 + 33 * S).toFixed(1)}" y="${yBackerTop}" width="${(2 * S).toFixed(1)}" height="${(2 * S).toFixed(1)}" fill="#97CDE4" stroke="#1F5F7A" stroke-width="1.3"/>
        <rect x="${(ex0 + 33 * S).toFixed(1)}" y="${yCapBot}" width="${(2 * S).toFixed(1)}" height="${(yFloor - yCapBot).toFixed(1)}" fill="#D9ECFF" stroke="#1F5F7A" stroke-width="1.2"/>

        <!-- Tub + Stone Apron (0..33", -22..0) -->
        <rect x="${ex0}" y="${yTub}" width="${(33 * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E6EBEF" stroke="#556066" stroke-width="1.4"/>
        <text x="${(ex0 + 16.5 * S).toFixed(1)}" y="${(yTub + 34).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" fill="#1D2326">${es ? 'PIEDRA ~33"' : '~33" STONE APRON'}</text>

        <!-- Plumbing & Seam Landmarks -->
        <circle cx="${(ex0 + 15.5 * S).toFixed(1)}" cy="${yAt(60)}" r="3.2" fill="#B58938" stroke="#1D2326"/>
        <circle cx="${(ex0 + 15.5 * S).toFixed(1)}" cy="${yAt(27)}" r="6" fill="#E8D3A2" stroke="#8C651E" stroke-width="1.2"/>
        <rect x="${(ex0 + 15.5 * S - 4).toFixed(1)}" y="${yAt(5.5)}" width="8" height="4" fill="#B58938"/>
        <line x1="${(ex0 + 39 * S).toFixed(1)}" y1="${yBackerTop}" x2="${(ex0 + 39 * S).toFixed(1)}" y2="${yFloor}" stroke="#8F5305" stroke-width="1.1" stroke-dasharray="3 2"/>
        <circle cx="${(ex0 + 37.75 * S).toFixed(1)}" cy="${yAt(-14)}" r="3.2" fill="#C86D3B" stroke="#1D2326"/>

        <line x1="${(ex0 - 6).toFixed(1)}" y1="${yFloor}" x2="${(ex0 + 45 * S).toFixed(1)}" y2="${yFloor}" stroke="#1D2326" stroke-width="2"/>
        <text x="${(ex0 + 17.5 * S).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="8″ font-weight="700″ font-family="IBM Plex Mono, monospace" fill="#286138">0" ─── 35" ${es ? "TOPE" : "STOP"} →</text>
        <text x="${(ex0 + 39 * S).toFixed(1)}" y="${(yFloor + 25).toFixed(1)}" text-anchor="middle" font-size="6.8" fill="#8F5305">${es ? '~38" agua WC · ~39" junta Hardie' : '~38" WC stub · ~39" Hardie seam'}</text>

        <!-- MIDDLE: WEST WINDOW WALL (45-1/2" Doorway Edge -> 35" Sill Stop -> 0" North Corner) -->
        <text x="${wxDoorEdge}" y="19" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? 'MURO OESTE (VENTANA) · SUR → 0" NORTE (1:1)' : 'WEST WINDOW WALL · SOUTH → 0" NORTH (1:1)'}
        </text>
        <text x="${wxDoorEdge}" y="31" font-size="7.8" fill="#556066">
          ${es ? '45-1/2" desde borde futuro puerta hasta repisa · 35" al rincón tina' : '45-1/2" future doorway edge to sill · 35" sill to tub corner'}
        </text>

        <rect x="${wxDoorEdge}" y="${yBackerTop}" width="${(wxCorner - wxDoorEdge).toFixed(1)}" height="${(yFloor - yBackerTop).toFixed(1)}" fill="#F4F5F3" stroke="#C5CCC9" stroke-width="1"/>
        <!-- Upper No-Tile Window + 5-1/4" Casing Zone -->
        <rect x="${wxStop}" y="${yBackerTop}" width="${(wxCorner - wxStop).toFixed(1)}" height="${(yWestSill - yBackerTop).toFixed(1)}" fill="url(#ew-hatch)" stroke="#8F5305" stroke-width="1.2" stroke-dasharray="4 3"/>
        <rect x="${wxCasing}" y="${yBackerTop}" width="${(wxCorner - wxCasing).toFixed(1)}" height="${(yWestSill - yBackerTop).toFixed(1)}" fill="#EDE3D2" stroke="#8F5305" stroke-width="1.1"/>
        <text x="${((wxStop + wxCasing) / 2).toFixed(1)}" y="${((yBackerTop + yWestSill) / 2).toFixed(1)}" text-anchor="middle" font-size="7.4″ font-weight="700″ fill="#8F5305">${es ? "VENTANA + CHAMBRANA" : "WINDOW + CASING"}</text>
        <text x="${((wxStop + wxCasing) / 2).toFixed(1)}" y="${((yBackerTop + yWestSill) / 2 + 11).toFixed(1)}" text-anchor="middle" font-size="7.0″ fill="#7A4404">${es ? "(SIN AZULEJO)" : "(NO WALL TILE)"}</text>

        <!-- Lower Tiled Wrap Below 43" Window Sill (0..33" + 33..35" vertical bullnose) -->
        <rect x="${wxApron}" y="${yWestSill}" width="${(33 * S).toFixed(1)}" height="${(yTub - yWestSill).toFixed(1)}" fill="#FFFFFF" stroke="#9AA8B0" stroke-width="1"/>
        <rect x="${wxStop}" y="${yWestSill}" width="${(2 * S).toFixed(1)}" height="${(yFloor - yWestSill).toFixed(1)}" fill="#D9ECFF" stroke="#1F5F7A" stroke-width="1.2"/>
        <rect x="${(wxStop - 2).toFixed(1)}" y="${(yWestSill - 4).toFixed(1)}" width="${(35 * S + 2).toFixed(1)}" height="4.5" fill="#C99E67" stroke="#6E471B" stroke-width="1.1"/>
        <!-- Tub + Stone Apron on West -->
        <rect x="${wxApron}" y="${yTub}" width="${(33 * S).toFixed(1)}" height="${(22 * S).toFixed(1)}" fill="#E6EBEF" stroke="#556066" stroke-width="1.4"/>

        <line x1="${(wxDoorEdge - 6).toFixed(1)}" y1="${yFloor}" x2="${(wxCorner + 6).toFixed(1)}" y2="${yFloor}" stroke="#1D2326" stroke-width="2"/>
        <text x="${((wxDoorEdge + wxStop) / 2).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="7.4" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#556066">← 45-1/2" →</text>
        <text x="${((wxStop + wxCorner) / 2).toFixed(1)}" y="${(yFloor + 14).toFixed(1)}" text-anchor="middle" font-size="8″ font-weight="700″ font-family="IBM Plex Mono, monospace" fill="#286138">← 35" ${es ? "REPISA" : "SILL"} ─── 0″</text>
        <text x="${(wxStop - 5).toFixed(1)}" y="${((yWestSill + yFloor) / 2).toFixed(1)}" text-anchor="end" font-size="7.6" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#286138">43"</text>

        <!-- RIGHT PANEL: ZOOMED TOP-DOWN CUTAWAY OF 33" STONE APRON -> 35" BULLNOSE STOP -->
        <rect x="550" y="42" width="206" height="296" rx="6" fill="#F8FAF9" stroke="#C5CCC9" stroke-width="1"/>
        <text x="653" y="59" text-anchor="middle" font-size="8.4" font-weight="700" font-family="IBM Plex Mono, monospace" fill="#1F5F7A">
          ${es ? 'CORTE PLANTA: 33" → 35"' : 'TOP-DOWN DETAIL: 33" → 35"'}
        </text>
        <!-- Stud + 1/2" HardieBacker + 1/2" Drywall Feather Seam -->
        <rect x="566" y="88" width="174" height="16" fill="#EFE6D8" stroke="#A6947D" stroke-width="1"/>
        <rect x="566" y="104" width="118" height="10" fill="#CFD8DC" stroke="#556066" stroke-width="1"/>
        <rect x="684" y="104" width="56" height="11.5" fill="#E8ECE9" stroke="#556066" stroke-width="1"/>
        <text x="625" y="99" text-anchor="middle" font-size="6.6" fill="#556066">${es ? '1/2" Hardie (0.42") + 1/2" Tablaroca (0.50") · 0 calzas' : '1/2" Hardie (0.42") + 1/2" Drywall (0.50") · 0 shims'}</text>

        <!-- 3x6 Field Tile up to 33", then 2"x6" Bullnose from 33" to 35" -->
        <rect x="566" y="114" width="66" height="8" fill="#FFFFFF" stroke="#1D2326" stroke-width="1.1"/>
        <path d="M632,114 L662,114 Q668,114 668,120 L668,122 L632,122 Z" fill="#97CDE4" stroke="#1F5F7A" stroke-width="1.4"/>
        <!-- Stone Tub Waterfall Apron ending at 33" (x=632) + 100% Silicone Bead -->
        <rect x="566" y="124" width="66" height="44" fill="#E6EBEF" stroke="#556066" stroke-width="1.3"/>
        <circle cx="632" cy="123" r="3" fill="#286138"/>
        <text x="599" y="149" text-anchor="middle" font-size="7.2" font-weight="700" fill="#1D2326">${es ? 'PIEDRA ~33"' : '~33" STONE'}</text>
        <text x="650" y="136" text-anchor="middle" font-size="7.1" font-weight="700" fill="#1F5F7A">2" Bullnose</text>
        <text x="650" y="146" text-anchor="middle" font-size="6.7" font-family="IBM Plex Mono, monospace" fill="#286138">33" → 35"</text>

        <text x="564″ y="190″ font-size="7.5″ font-weight="700″ fill="#286138">${es ? "Detalles bloqueados:" : "Locked Stop Details:"}</text>
        <text x="564″ y="205″ font-size="7.1″ fill="#1D2326">${es ? "• Sella esquina húmeda con 100% silicón" : "• Wraps wet stone corner w/ 100% silicone"}</text>
        <text x="564″ y="219″ font-size="7.1″ fill="#1D2326">${es ? "• Bullnose 2\"×6\" (0025S42691P4)" : "• 2\"×6\" Surface Bullnose (0025S42691P4)"}</text>
        <text x="564″ y="233″ font-size="7.1″ fill="#1D2326">${es ? "• Esquina fábrica 2\"×2\" (0025SN42691P2)" : "• 2\"×2\" Factory Corner (0025SN42691P2)"}</text>
        <text x="564″ y="247″ font-size="7.1″ fill="#1D2326">${es ? "• Emparejar ~1/16\" en junta a ~39\"" : "• Feather ~1/16\" drywall seam at ~39\""}</text>
        <text x="564″ y="261″ font-size="7.1″ fill="#1D2326">${es ? "• Libra toma de agua WC (~37.5\"–38\")" : "• Clears WC water stub (~37.5\"–38\")"}</text>
        <text x="564″ y="279″ font-size="7.1″ font-weight="700″ fill="#8F5305">${es ? "• Botiquín 20×32: EN ESPERA (devolver)" : "• 20×32 Med Cabinet: HOLD (return)"}</text>
        <text x="564″ y="293″ font-size="7.1″ fill="#556066">${es ? "  Elegir modelo menor sobrepuesto" : "  Select smaller surface-mount model"}</text>

        ${renderPinSvgOverlay("east-west-stops")}
      </svg>
    `;
  }

  function renderPinSvgOverlay(stepId) {
    const p = state.ephemeralPin;
    if (!p || p.step !== stepId) return "";
    const tagX = p.x > 385 ? Math.max(60, p.x - 54) : Math.min(710, p.x + 54);
    const tagY = Math.max(26, p.y - 18);
    return `
      <g class="u4-ephemeral-pin">
        <line x1="${p.x}" y1="${p.y}" x2="${tagX}" y2="${tagY}" stroke="#A1261B" stroke-width="1.6" stroke-dasharray="3 2"/>
        <circle cx="${p.x}" cy="${p.y}" r="12" fill="rgba(161,38,27,0.16)" stroke="#A1261B" stroke-width="2"/>
        <rect x="${tagX - 24}" y="${tagY - 10}" width="48" height="19" rx="9.5" fill="#A1261B"/>
        <text x="${tagX}" y="${tagY + 3}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#FFFFFF">PIN</text>
      </g>
    `;
  }

  // ── TOP BAR & STEP RENDERING ──────────────────────────────────────────────
  function renderTopbar() {
    const es = state.lang === "es";
    const hdr = document.getElementById("u4Topbar");
    if (!hdr) return;

    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-theme", state.theme);

    hdr.innerHTML = `
      <div class="u4-topbar-inner">
        <div class="u4-nav-left">
          <a class="u4-back-link" href="../../#bathroom">← ${es ? "Baño" : "Bathroom"}</a>
          <span class="u4-plan-crumb">${es ? " Unidad 4 · Plan de Azulejo de Baño" : "Unit 4 · Bathroom Tub & Wall Tile Plan"}</span>
        </div>
        <div class="u4-nav-right">
          <button type="button" id="u4LangSwitch" class="u4-seg-switch" role="switch"
                  aria-checked="${es ? "true" : "false"}"
                  aria-label="${es ? "Cambiar idioma EN o ES" : "Switch language EN or ES"}">
            <span class="u4-seg-thumb" aria-hidden="true"></span>
            <span class="u4-seg-opt">EN</span>
            <span class="u4-seg-opt">ES</span>
          </button>

          <button type="button" id="u4ThemeSwitch" class="u4-seg-switch" role="switch"
                  aria-checked="${state.theme === "dark" ? "true" : "false"}"
                  aria-label="${es ? "Cambiar tema claro u oscuro" : "Toggle light or dark theme"}">
            <span class="u4-seg-thumb" aria-hidden="true"></span>
            <span class="u4-seg-opt" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>
            </span>
            <span class="u4-seg-opt" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
            </span>
          </button>

          <button type="button" id="u4PrintBtn" class="u4-print-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>${es ? "Imprimir / PDF 2 Págs" : "Print / 2-Page PDF"}</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById("u4LangSwitch").onclick = () => {
      state.lang = state.lang === "en" ? "es" : "en";
      safeSetPref("u4_lang", state.lang);
      renderAll();
    };
    document.getElementById("u4ThemeSwitch").onclick = () => {
      state.theme = state.theme === "light" ? "dark" : "light";
      safeSetPref("u4_theme", state.theme);
      renderAll();
    };
    document.getElementById("u4PrintBtn").onclick = () => {
      renderPrintSheets();
      window.print();
    };
  }

  function renderSvgToolbarHtml(es, stepId) {
    return `
      <div class="u4-svg-toolbar">
        <div class="u4-zoom-group">
          <button type="button" class="u4-mini-btn" id="u4ZoomOutBtn" aria-label="${es ? "Alejar" : "Zoom out"}">−</button>
          <span class="u4-mono" style="min-width:46px;text-align:center;font-weight:700">${state.zoomPct}%</span>
          <button type="button" class="u4-mini-btn" id="u4ZoomInBtn" aria-label="${es ? "Acercar" : "Zoom in"}">+</button>
          <button type="button" class="u4-mini-btn" id="u4ZoomResetBtn">${es ? "100%" : "Reset"}</button>
        </div>
        <button type="button" class="u4-mini-btn ${state.pinArmed ? "active" : ""}" id="u4PinToggleBtn">
          ⊕ ${state.pinArmed
            ? (es ? "Toca el dibujo para marcar ✕" : "Tap drawing to place note ✕")
            : (es ? "Marcar punto en el plano" : "Pin a spot on plan")}
        </button>
      </div>
    `;
  }

  function renderPinBoxHtml(es, stepId) {
    const p = state.ephemeralPin;
    if (!p || p.step !== stepId) return "";
    return `
      <div class="u4-pin-box" data-lang="${state.lang}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <strong style="font-size:13px">${es ? "Nota puntual en el plano (efímera — se envía al instante)" : "Pinned Spot Note (ephemeral — clears after apply)"}</strong>
          <button type="button" class="u4-mini-btn" id="u4ClearPinBtn" style="min-height:30px;padding:0 8px">✕</button>
        </div>
        <div class="u4-pin-row">
          <input type="text" id="u4PinInput" class="u4-pin-input" value="${(p.note || "").replace(/"/g, "&quot;")}"
                 placeholder="${es ? "Ej. Confirmar ancho interno del nicho izq. con cinta..." : "E.g. Confirm inside width of Left Niche with tape..."}">
          <button type="button" class="u4-print-btn" id="u4ApplyPinBtn">${es ? "Registrar nota" : "Log field note"}</button>
        </div>
      </div>
    `;
  }

  function wireSvgInteractions(stepId) {
    const zOut = document.getElementById("u4ZoomOutBtn");
    const zIn = document.getElementById("u4ZoomInBtn");
    const zRes = document.getElementById("u4ZoomResetBtn");
    const pinBtn = document.getElementById("u4PinToggleBtn");
    const svg = document.getElementById("u4BathSvg");

    if (zOut) zOut.onclick = () => { state.zoomPct = Math.max(100, state.zoomPct - 25); renderStage(); };
    if (zIn) zIn.onclick = () => { state.zoomPct = Math.min(250, state.zoomPct + 25); renderStage(); };
    if (zRes) zRes.onclick = () => { state.zoomPct = 100; renderStage(); };
    if (pinBtn) pinBtn.onclick = () => { state.pinArmed = !state.pinArmed; renderStage(); };

    if (svg) {
      svg.onclick = (ev) => {
        if (!state.pinArmed) return;
        const rect = svg.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        const x = Math.round(((ev.clientX - rect.left) / (rect.width || 1)) * vb.width);
        const y = Math.round(((ev.clientY - rect.top) / (rect.height || 1)) * vb.height);
        state.pinArmed = false;
        state.ephemeralPin = { step: stepId, x, y, note: "" };
        renderStage();
        const inp = document.getElementById("u4PinInput");
        if (inp) inp.focus();
      };
    }

    const clrBtn = document.getElementById("u4ClearPinBtn");
    const appBtn = document.getElementById("u4ApplyPinBtn");
    const pinInp = document.getElementById("u4PinInput");
    if (pinInp) pinInp.oninput = (e) => { if (state.ephemeralPin) state.ephemeralPin.note = e.target.value; };
    if (clrBtn) clrBtn.onclick = () => { state.ephemeralPin = null; renderStage(); };
    if (appBtn) {
      appBtn.onclick = () => {
        const es = state.lang === "es";
        state.ephemeralPin = null; // Consume & clear per ephemeral pin rule!
        renderStage();
        showToast(es ? "Nota registrada para revisión en obra" : "Field note logged for site walkthrough");
      };
    }
  }

  function renderStage() {
    const es = state.lang === "es";
    const root = document.getElementById("u4Stage");
    if (!root) return;

    const tk = computeTakeoff();
    const ca = computeCourseAnalysis();
    const stepIdx = STEPS.findIndex((s) => s.id === state.step);
    const prevStep = stepIdx > 0 ? STEPS[stepIdx - 1] : null;
    const nextStep = stepIdx < STEPS.length - 1 ? STEPS[stepIdx + 1] : null;

    const holdHtml = `
      <div class="u4-hold-banner" role="status">
        <strong>${es ? "PLANEACIÓN Y TRAZO EN SECO — COLOCACIÓN EN ESPERA:" : "PLANNING & DRY-FIT LAYOUT — HOLD WALL TILE SETTING:"}</strong>
        ${es
          ? "Alex no está disponible esta semana. Antes de pegar azulejo en muro: (1) reemplazar la ventana y su chambrana de 5-1/4\" (NO va azulejo en el área superior de ventana/chambrana), (2) elegir la pieza de formato grande (ej. 1 azulejo de 24\"×48\") y medir abertura real de ambos nichos para cortar cada fondo de 1 sola pieza, y (3) contar cajas 3\"×6\" y fotografiar membrana continua + trazo en seco."
          : "Alex is out this week. Before setting wall tile: (1) replace the bathroom window and 5-1/4\" casing (NO wall tile in the upper window-casing zone), (2) pick your large-format tile (e.g., one 24\"×48\" tile) and measure exact waterproofed niche openings so each niche back cuts from 1 single piece, and (3) count 3\"×6\" cartons and photograph continuous waterproofing + dry layout."}
      </div>
    `;

    const tabsHtml = `
      <nav class="u4-step-tabs" aria-label="${es ? "Pasos del plan de azulejo" : "Bathroom tile plan steps"}">
        ${STEPS.map((st) => `
          <button type="button" class="u4-step-btn ${st.id === state.step ? "active" : ""}" data-step="${st.id}">
            <span class="u4-step-num">${st.num}</span>
            <span>${es ? st.es : st.en}</span>
          </button>
        `).join("")}
      </nav>
    `;

    let bodyCardHtml = "";

    if (state.step === "alcove-overview") {
      bodyCardHtml = `
        <section class="u4-card">
          <div class="u4-card-head">
            <div>
              <h1 class="u4-card-title">${es ? "Paso 1 — Alzado de 3 Muros y Decisiones Bloqueadas" : "Step 1 — 3-Wall Tub Alcove Layout & Locked Endpoints"}</h1>
              <p class="u4-card-sub">${es ? "Azulejo en obra: American Olean Color Story 0025 Ice White 3\"×6\" (36MOD1P4) · Junta 1/16\" al 50%" : "Tile on hand: American Olean Color Story 0025 Ice White 3\"×6\" (36MOD1P4) · 50% running bond · 1/16\" joint"}</p>
            </div>
            <span class="u4-badge lock">${es ? "3 REMATES BLOQUEADOS" : "3 ENDPOINTS LOCKED"}</span>
          </div>

          <div class="u4-kpi-grid">
            <div class="u4-kpi">
              <div class="u4-kpi-lbl">${es ? "Tope Este y Oeste" : "East & West Stops"}</div>
              <div class="u4-kpi-val">35"</div>
              <div class="u4-kpi-sub">${es ? "2\" pasando piedra (~33\")" : "2\" past ~33\" stone apron"}</div>
            </div>
            <div class="u4-kpi">
              <div class="u4-kpi-lbl">${es ? "Tope Superior" : "Top Tile Line"}</div>
              <div class="u4-kpi-val">71-1/4"</div>
              <div class="u4-kpi-sub">${es ? "Borde actual HardieBacker" : "Current HardieBacker top"}</div>
            </div>
            <div class="u4-kpi">
              <div class="u4-kpi-lbl">${es ? "Remate Cero Metal" : "Zero-Metal Trim"}</div>
              <div class="u4-kpi-val">2"×6"</div>
              <div class="u4-kpi-sub">${es ? "Bullnose 0025S42691P4" : "Bullnose 0025S42691P4"}</div>
            </div>
            <div class="u4-kpi">
              <div class="u4-kpi-lbl">${es ? "Fondo de 2 Nichos" : "Both Niche Backs"}</div>
              <div class="u4-kpi-val">${state.nicheBackMode !== "subway3x6" ? (es ? "1 Pieza" : "1-Piece") : "3\"×6\""}</div>
              <div class="u4-kpi-sub">${state.nicheBackMode === "large24x48" ? (es ? "1 azulejo 24\"×48\"" : "One 24\"×48\" tile") : (state.nicheBackMode === "large12x24" ? "2 × 12\"×24\"" : (es ? "Subway con juntas" : "Subway w/ grout lines"))}</div>
            </div>
          </div>

          ${renderSvgToolbarHtml(es, "alcove-overview")}
          <div class="u4-svg-viewport">
            <div class="u4-svg-inner" style="width:${state.zoomPct}%">
              ${buildStep1OverviewSvg(es, false)}
            </div>
          </div>
          ${renderPinBoxHtml(es, "alcove-overview")}
          <div class="u4-controls">
            <div class="u4-ctrl-row">
              <span class="u4-ctrl-label">${es ? "Vista previa de boquilla en muro (junta fina 1/16″):" : "Live Wall Grout Preview (1/16″ fine joint):"}</span>
              <div class="u4-pill-group">
                ${Object.entries(GROUT_SPECS).map(([gk, gv]) => `
                  <button type="button" class="u4-choice-btn ${state.groutMode === gk ? "active" : ""}" data-grout="${gk}">
                    <span style="display:inline-block;width:11px;height:11px;border-radius:99px;background:${gv.swatch};border:1px solid #6c777c;vertical-align:-1px;margin-right:5px"></span>${es ? gv.shortEs : gv.shortEn}
                  </button>
                `).join("")}
              </div>
            </div>
          </div>

          <div class="u4-calc-grid">
            ${(() => {
              const bl = computeWallBrickLayout();
              const lastC = bl.courseRows[bl.courseRows.length - 1];
              return `
                <div class="u4-calc-box">
                  <h4>${es ? "MURO NORTE (69-5/16″)" : "NORTH BACK WALL (69-5/16″)"}</h4>
                  <p>${es ? "Impares:" : "Odd rows:"} <strong>${fmtFrac(bl.north.oddLeftCut)}</strong> NO + ${bl.north.fullPerRow}×6" + <strong>${fmtFrac(bl.north.oddRightCut)}</strong> NE</p>
                  <p>${es ? "Pares:" : "Even rows:"} <strong>${fmtFrac(bl.north.evenLeftCut)}</strong> NO + ${bl.north.fullPerRow}×6" + <strong>${fmtFrac(bl.north.evenRightCut)}</strong> NE</p>
                </div>
                <div class="u4-calc-box">
                  <h4>${es ? "MUROS ESTE Y OESTE (33″ + 2″)" : "EAST & WEST WALLS (33″ + 2″)"}</h4>
                  <p>${es ? "Impares:" : "Odd rows:"} <strong>${bl.side.oddFull}×6"</strong> + <strong>${fmtFrac(bl.side.oddEndCut)}</strong> ${es ? "en tope 33″" : "at 33″ line"}</p>
                  <p>${es ? "Pares:" : "Even rows:"} <strong>${fmtFrac(bl.side.evenStartCut)}</strong> + ${bl.side.evenFull}×6" + <strong>${fmtFrac(bl.side.evenEndCut)}</strong></p>
                  <p>${es ? "Bajada piedra 22″:" : "22″ apron leg:"} ${bl.side.apronFullVertBullnose}×6" + <strong>${fmtFrac(bl.side.apronBottomCut)}</strong></p>
                </div>
                <div class="u4-calc-box">
                  <h4>${es ? `HILADAS VERTICALES (${bl.courseRows.length} FILAS)` : `VERTICAL COURSES (${bl.courseRows.length} ROWS)`}</h4>
                  <p>${es ? "1.ª hilada:" : "Course 1:"} <strong>${fmtFrac(state.starterRowIn)}</strong> (0" → ${fmtFrac(state.starterRowIn)})</p>
                  <p>${es ? `Última (${lastC.courseNum}):` : `Top (${lastC.courseNum}):`} <strong>${fmtFrac(lastC.heightIn)}</strong> (${fmtFrac(lastC.z0)} → ${fmtFrac(lastC.z1)})</p>
                  <p>${es ? "Remate:" : "Top cap:"} <strong>2"×6" bullnose</strong> (${fmtFrac(lastC.z1)} → 71-1/4")</p>
                </div>
              `;
            })()}
          </div>

          <ul class="u4-list">
            <li><strong>${es ? "Simetría exacta 35\" / 35\":" : "Exact 35\" East / 35\" West symmetry:"}</strong> ${es ? "En el muro Este (controles) el azulejo corre hasta 35\" desde el muro de fondo (2\" más afuera que la falda de piedra de ~33\") y baja por ese costado de 2\" hasta el piso. En el muro Oeste (ventana), la zona bajo la repisa (43\" al piso) corre exactamente hasta 35\" en la punta de la repisa." : "On the East shower-control wall, tile runs to 35\" from the back wall (2\" past the ~33\" stone waterfall apron) and drops down beside the stone apron to the floor. On the West window wall, the lower wrap under the 43\" sill stops at the exact same 35\" sill tip."}</li>
            <li><strong>${es ? "Ventana y chambrana Oeste (sin azulejo arriba de la repisa):" : "West window & casing zone (no wall tile above sill):"}</strong> ${es ? "La ventana y su chambrana de 5-1/4\" serán reemplazadas; la nueva chambrana cubre el espacio entre la ventana y la esquina del muro de fondo sin llevar azulejo arriba de la repisa." : "Both the bathroom window and 5-1/4\" casing are being replaced; the new casing fills the upper window-side strip with zero wall tile above the sill."}</li>
            <li><strong>${es ? "Altura superior fija en el HardieBacker actual:" : "Top height locked to existing HardieBacker:"}</strong> ${es ? "El azulejo termina exactamente donde termina hoy el HardieBacker (71-1/4\" sobre la cubierta de la tina; confirmar fracción en obra antes de cortar), rematado con bullnose horizontal de 2\"×6\" y esquina de fábrica de 2\"×2\"." : "Tile ends right where the installed HardieBacker currently stops (71-1/4\" above the tub rim; verify exact tape fraction before final cuts), capped with horizontal 2\"×6\" surface bullnose and a 2\"×2\" factory corner."}</li>
          </ul>
        </section>
      `;
    } else if (state.step === "north-niches") {
      bodyCardHtml = `
        <section class="u4-card">
          <div class="u4-card-head">
            <div>
              <h1 class="u4-card-title">${es ? "Paso 2 — Fondo de Nichos en 1 Sola Pieza (Azulejo Formato Grande)" : "Step 2 — Single-Piece Large-Format Niche Backs & Course Alignment"}</h1>
              <p class="u4-card-sub">${es ? "Usa un azulejo grande (ej. 24\"×48\") cortado a la medida para dejar cada fondo de 1 sola pieza sin boquilla" : "Cut a single seamless panel per niche from a large-format tile (e.g. 24\"×48\") — product/finish open"}</p>
            </div>
            <span class="u4-badge accent">${es ? "0 JUNTAS EN FONDO" : "ZERO BACK GROUT SEAMS"}</span>
          </div>

          <div class="u4-controls">
            <div class="u4-ctrl-row">
              <span class="u4-ctrl-label">${es ? "Formato de azulejo grande para cortar 1 sola pieza:" : "Large-Format Tile Size for 1-Piece Niche Backs:"}</span>
              <div class="u4-pill-group">
                <button type="button" class="u4-choice-btn ${state.nicheBackMode === "large24x48" ? "active" : ""}" data-nback="large24x48">
                  ${es ? "1 Azulejo 24″×48″ (Corta AMBOS nichos · Recomendado)" : "One 24″×48″ Tile (Cuts BOTH niches · Recommended)"}
                </button>
                <button type="button" class="u4-choice-btn ${state.nicheBackMode === "large12x24" ? "active" : ""}" data-nback="large12x24">
                  ${es ? "2 Azulejos 12″×24″ (Solo si Nicho Izq. ≤ 11-3/4″)" : "Two 12″×24″ Tiles (Only if Left Niche <= 11-3/4″)"}
                </button>
                <button type="button" class="u4-choice-btn ${state.nicheBackMode === "subway3x6" ? "active" : ""}" data-nback="subway3x6">
                  ${es ? "Subway 3″×6″ (con juntas)" : "3″×6″ Subway Grid (seamed)"}
                </button>
              </div>
            </div>

            ${state.nicheBackMode !== "subway3x6" ? `
            <div class="u4-ctrl-row">
              <span class="u4-ctrl-label">${es ? "Acabado visual a explorar (producto por elegir):" : "Visual Finish Direction (product TBD):"}</span>
              <div class="u4-pill-group">
                <button type="button" class="u4-choice-btn ${state.nicheLookMode === "glossWhite" ? "active" : ""}" data-nlook="glossWhite">
                  ${es ? "Blanco Brillante Liso (combina con 3″×6″)" : "Crisp Glossy White (matches 3″×6″)"}
                </button>
                <button type="button" class="u4-choice-btn ${state.nicheLookMode === "softVein" ? "active" : ""}" data-nlook="softVein">
                  ${es ? "Porcelanato Veta Suave (tipo mármol)" : "Soft Veined Marble-Look Porcelain"}
                </button>
                <button type="button" class="u4-choice-btn ${state.nicheLookMode === "stoneSlab" ? "active" : ""}" data-nlook="stoneSlab">
                  ${es ? "Remanente Cuarzo / Piedra Blanca" : "White Quartz / Stone Slab Remnant"}
                </button>
              </div>
            </div>
            ` : ""}

            <div class="u4-ctrl-row">
              <span class="u4-ctrl-label">${es ? "Repisa inferior del nicho (pendiente 1/4″/pie):" : "Niche Bottom Sill (1/4″/ft slope to tub):"}</span>
              <div class="u4-pill-group">
                <button type="button" class="u4-choice-btn ${state.nicheSillMode === "solidSill" ? "active" : ""}" data-nsill="solidSill">
                  ${es ? "Repisa 1 Sola Pieza (del mismo formato grande)" : "1-Piece Solid Sill (cut from same large tile/stone)"}
                </button>
                <button type="button" class="u4-choice-btn ${state.nicheSillMode === "bullnoseSill" ? "active" : ""}" data-nsill="bullnoseSill">
                  ${es ? "Bullnose Cerámico 2″×6″" : "2″×6″ Ceramic Bullnose Sill"}
                </button>
              </div>
            </div>


            <div class="u4-ctrl-row">
              <span class="u4-ctrl-label">${es ? "Color de boquilla en muro 3″×6″ (junta 1/16″):" : "Wall Grout Color on 3″×6″ Ice White (1/16″ joint):"}</span>
              <div class="u4-pill-group">
                ${Object.entries(GROUT_SPECS).map(([gk, gv]) => `
                  <button type="button" class="u4-choice-btn ${state.groutMode === gk ? "active" : ""}" data-grout="${gk}">
                    <span style="display:inline-block;width:11px;height:11px;border-radius:99px;background:${gv.swatch};border:1px solid #6c777c;vertical-align:-1px;margin-right:5px"></span>${es ? gv.shortEs : gv.shortEn}
                  </button>
                `).join("")}
              </div>
            </div>

            <div class="u4-ctrl-row">
              <span class="u4-ctrl-label">${es ? "Marco exterior de los nichos (cero metal):" : "Outer Niche Perimeter Frame (zero metal):"}</span>
              <div class="u4-pill-group">
                <button type="button" class="u4-choice-btn ${state.nicheFrameMode === "bullnose2x6" ? "active" : ""}" data-nframe="bullnose2x6">
                  ${es ? "Marco Bullnose 2\"×6\" + Esquinas 2\"×2\"" : "2\"×6\" Bullnose + 2\"×2\" Corners"}
                </button>
                <button type="button" class="u4-choice-btn ${state.nicheFrameMode === "glazedReturn" ? "active" : ""}" data-nframe="glazedReturn">
                  ${es ? "Retorno Bullnose Interior Limpio" : "Flush Glazed Bullnose Jamb Return"}
                </button>
              </div>
            </div>

            <div class="u4-ctrl-row">
              <label class="u4-ctrl-label" for="u4StarterSlider">${es ? "Altura de la 1.ª hilada sobre la tina:" : "Bottom Starter Row Height at Tub:"}</label>
              <div class="u4-slider-wrap">
                <input type="range" id="u4StarterSlider" min="1.5" max="3.0" step="0.125" value="${state.starterRowIn}">
                <span class="u4-mono-readout">${fmtFrac(state.starterRowIn)}</span>
                <button type="button" class="u4-mini-btn" id="u4SnapHeaderBtn">${es ? "Alinear 36\"" : "Align 36\" Top"}</button>
              </div>
            </div>

            <div class="u4-status-bar ${ca.hasSliver ? "warn" : ""}">
              ${ca.hasSliver
                ? (es ? `AVISO DE TIRA DELGADA: Queda una fila menor a 1-1/2" (arriba: ${fmtFrac(ca.topCourseH)}). Ajusta la 1.ª hilada a 2-1/4".` : `SLIVER WARNING: Produces a row under 1-1/2" (top row under bullnose: ${fmtFrac(ca.topCourseH)}). Try 2-1/4" starter row.`)
                : (es ? `TRAZO LIMPIO: 1.ª hilada ${fmtFrac(state.starterRowIn)} → última hilada bajo bullnose ${fmtFrac(ca.topCourseH)} (cero tiras delgadas · dintel común ~36" a solo ${ca.headerDelta}" de junta).` : `CLEAN COURSE FIT: ${fmtFrac(state.starterRowIn)} starter row → ${fmtFrac(ca.topCourseH)} top row beneath bullnose cap (zero slivers · shared ~36" niche header within ${ca.headerDelta}" of course line).`)}
            </div>
          </div>

          ${renderSvgToolbarHtml(es, "north-niches")}
          <div class="u4-svg-viewport">
            <div class="u4-svg-inner" style="width:${state.zoomPct}%">
              ${buildStep2NichesSvg(es, false)}
            </div>
          </div>
          ${renderPinBoxHtml(es, "north-niches")}

          <div class="u4-photo-grid">
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5478.jpg" alt="${es ? "Foto real del muro Norte de 69-5/16 pulgadas con ambos nichos" : "Real site photo of 69-5/16 inch North back wall showing both niches"}">
              <figcaption class="u4-photo-cap">
                <strong>${es ? "Foto real en obra (IMG_5478):" : "Actual North Back Wall (IMG_5478):"}</strong>
                ${es ? "Ambos nichos comparten el mismo nivel superior (~36\"). Con 1 sola pieza de azulejo grande (24\"×48\") salen ambos fondos (~11\"×19\" y ~7.5\"×14\") sin una sola línea de boquilla." : "Both niche tops share one level header (~36\" above tub). One 24\"×48\" large-format tile easily yields both seamless backs (~11\"×19\" and ~7.5\"×14\") with zero grout lines."}
              </figcaption>
            </figure>
          </div>
        </section>
      `;
    } else if (state.step === "east-west-stops") {
      bodyCardHtml = `
        <section class="u4-card">
          <div class="u4-card-head">
            <div>
              <h1 class="u4-card-title">${es ? "Paso 3 — Remates Laterales a 35\", Plomería y Ventana Oeste" : "Step 3 — East & West 35\" Tile Stops, Plumbing & Window Boundary"}</h1>
              <p class="u4-card-sub">${es ? "Alzados a escala 1:1 y corte superior del remate de piedra (~33\") a bullnose cerámico (35\")" : "True 1:1 side elevations and top-down section where ~33\" stone waterfall apron meets 35\" ceramic bullnose"}</p>
            </div>
            <span class="u4-badge lock">${es ? "CERO METAL / CERO CALZAS" : "ZERO METAL · ZERO SHIMS"}</span>
          </div>

          ${renderSvgToolbarHtml(es, "east-west-stops")}
          <div class="u4-svg-viewport">
            <div class="u4-svg-inner" style="width:${state.zoomPct}%">
              ${buildStep3StopsSvg(es, false)}
            </div>
          </div>
          ${renderPinBoxHtml(es, "east-west-stops")}

          <div class="u4-photo-grid">
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5488.jpg" alt="${es ? "Cinta métrica mostrando ~33 pulgadas al frente de la falda de piedra" : "Tape measure showing ~33 inches from back wall to stone waterfall apron front"}">
              <figcaption class="u4-photo-cap">
                <strong>${es ? "Frente de piedra ~33\" (IMG_5488):" : "Stone Apron Front at ~33\" (IMG_5488):"}</strong>
                ${es ? "Extender el azulejo 2\" más afuera (hasta 35\") envuelve esta esquina húmeda con silicón 100% detrás del cristal parcial." : "Extending tile 2\" past this ~33\" waterfall face (to 35\") wraps the wet deck-to-apron miter behind glazed tile + 100% silicone."}
              </figcaption>
            </figure>
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5474.jpg" alt="${es ? "Muro Este con válvula Delta, salida de regadera, toma de WC y borde HardieBacker" : "East shower wall showing Delta valve, shower arm, toilet supply stub, and HardieBacker seam"}">
              <figcaption class="u4-photo-cap">
                <strong>${es ? "Muro Este de Controles (IMG_5474):" : "East Shower-Control Wall (IMG_5474):"}</strong>
                ${es ? "Parar en 35\" deja ~2.5\"–3\" libres antes de la toma de cobre del WC (~38\") y 4\" para desvanecer la junta con tablaroca (~39\")." : "Stopping at 35\" leaves ~2.5\"–3\" clear ahead of the copper toilet stub-out (~38\") and 4\" inside the ~39\" HardieBacker edge."}
              </figcaption>
            </figure>
            <figure class="u4-photo-card">
              <img src="./assets/IMG_5491.jpg" alt="${es ? "Muro Oeste mostrando trazo con lápiz bajo la repisa hasta 35 pulgadas y 43 pulgadas al piso" : "West wall showing pencil tile layout below window sill stopping at 35 inches and 43 inches to floor"}">
              <figcaption class="u4-photo-cap">
                <strong>${es ? "Muro Oeste y Repisa (IMG_5491):" : "West Sill & Open Sink Wall (IMG_5491):"}</strong>
                ${es ? "Abajo de la repisa (43\" al piso) ya se ven las líneas de lápiz hasta 35\"; arriba de la repisa irá la ventana nueva + chambrana sin azulejo." : "Below the 43\" sill, pencil layout lines already stop right at the 35\" sill tip; above the sill receives the replacement window + casing with no tile."}
              </figcaption>
            </figure>
          </div>
        </section>
      `;
    } else {
      const doneCount = Object.values(state.checks).filter(Boolean).length;
      bodyCardHtml = `
        <section class="u4-card">
          <div class="u4-card-head">
            <div>
              <h1 class="u4-card-title">${es ? "Paso 4 — Compuertas Previas y Cantidades de Material (Sin Precios)" : "Step 4 — Pre-Tile Hold Gates & Live Material Quantities (Zero Prices)"}</h1>
              <p class="u4-card-sub">${es ? `Compuertas verificadas en recorrido: ${doneCount} de 7 · Verificar cajas en sitio antes de pedir` : `Walkthrough gates checked: ${doneCount} of 7 · Verify on-hand stock before ordering any trim or tile`}</p>
            </div>
            <span class="u4-badge open">${es ? "SIN PRECIOS" : "QUANTITIES ONLY"}</span>
          </div>

          <div class="u4-check-list">
            ${[
              ["winCasing",
               "Replace bathroom window & 5-1/4\" casing + waterproof sill interface BEFORE setting adjacent tile (no wall tile in upper window-casing zone)",
               "Reemplazar ventana de baño y chambrana de 5-1/4\" + impermeabilizar repisa ANTES de pegar azulejo adyacente (sin azulejo arriba de la repisa)"],
              ["nicheWidth",
               "Measure exact waterproofed inside width & height of both niches (~11″×19″ Left, ~7-1/2″×14″ Right) — note a 24″×48″ tile clears any width, while a 12″×24″ tile requires Left Niche <= 11-3/4″",
               "Medir ancho y alto interior impermeabilizado de ambos nichos (~11″×19″ Izq., ~7-1/2″×14″ Der.) — un azulejo 24″×48″ libra cualquier ancho; uno 12″×24″ exige Nicho Izq. ≤ 11-3/4″"],
              ["spareFloorTile",
               `Select & stage large-format tile for 1-piece niche backs (${tk.largeTileDescEn}; ~5/16"–3/8″ porcelain/ceramic preserves full shelf depth)`,
               `Elegir y tener en obra el azulejo grande para los fondos de 1 pieza (${tk.largeTileDescEs}; ~5/16"–3/8″ conserva toda la profundidad)`],
              ["wallBoxCount",
               `Count matching cartons of American Olean 0025 Ice White 3"×6" (002536MOD1P4, shade 55501) on site against ${tk.cartonsNeeded}-carton (+${state.wastePct}%) estimate & order 2"×6" bullnose (0025S42691P4)`,
               `Contar cajas del mismo lote de American Olean 0025 Ice White 3"×6" (002536MOD1P4, tono 55501) frente a ${tk.cartonsNeeded} cajas (+${state.wastePct}%) y pedir bullnose 2"×6" (0025S42691P4)`],
              ["valveDepth",
               "Check Delta Arcadia (144892-CZ-HS) rough-in valve plaster-guard depth against 5/16\" tile + thinset finished plane, and inspect bathtub stone trim fix",
               "Verificar profundidad de válvula Delta Arcadia (144892-CZ-HS) respecto al paño terminado de azulejo 5/16\" + pegazulejo, y revisar ajuste de piedra en tina"],
              ["medCabHold",
               "Keep oversized 20\"×32\" medicine cabinet ON HOLD for return — do NOT install; stage smaller surface-mounted replacement",
               "Mantener botiquín grande de 20\"×32\" EN ESPERA para devolución — NO instalar; elegir modelo menor sobrepuesto"],
              ["waterproofPhoto",
               "Confirm wall grout color (do not assume floor Warm Gray without owner check) and snap clear tape-in-frame photos of continuous waterproofing & dry layout before setting",
               "Confirmar color de boquilla para muro y tomar fotos claras con cinta de la membrana impermeable continua y trazo en seco antes de pegar"]
            ].map(([k, enTxt, esTxt]) => `
              <label class="u4-check-item">
                <input type="checkbox" data-chk="${k}" ${state.checks[k] ? "checked" : ""}>
                <span>${es ? esTxt : enTxt}</span>
              </label>
            `).join("")}
          </div>

          <div class="u4-controls">
            <div class="u4-ctrl-row">
              <span class="u4-ctrl-label">${es ? "Margen por cortes y desperdicio:" : "Waste / Overage Allowance:"}</span>
              <div class="u4-pill-group">
                ${[10, 15, 20].map((pct) => `
                  <button type="button" class="u4-choice-btn ${state.wastePct === pct ? "active" : ""}" data-waste="${pct}">+${pct}%${pct === 15 ? (es ? " (Estándar)" : " (Standard)") : ""}</button>
                `).join("")}
              </div>
            </div>
          </div>

          <div class="u4-table-wrap">
            <table class="u4-table">
              <thead>
                <tr>
                  <th>${es ? "Material / Pieza" : "Material / Trim Part"}</th>
                  <th>${es ? "Modelo / Medida" : "SKU / Actual Size"}</th>
                  <th>${es ? "Cantidad Calculada" : "Calculated Quantity"}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${es ? "Azulejo Blanco Brillante Muro" : "Glossy White Wall Field Tile"}</strong><br><span style="font-size:12px;color:var(--muted)">${es ? `Área neta ~${tk.netSubwaySqft} ft² (+${state.wastePct}% = ${tk.grossSubwaySqft} ft²)` : `Net tiled area ~${tk.netSubwaySqft} sq ft (+${state.wastePct}% = ${tk.grossSubwaySqft} sq ft)`}</span></td>
                  <td class="u4-mono">002536MOD1P4<br>3"×6"×5/16" (12.5 sf/box)</td>
                  <td class="u4-mono"><strong>${tk.cartonsNeeded} ${es ? "cajas" : "cartons"}</strong><br>(${tk.cartonsNeeded * 100} ${es ? "pzs — restar stock en sitio" : "pcs — deduct boxes on site"})</td>
                </tr>
                <tr>
                  <td><strong>${es ? "Bullnose Cerámico 2\"×6\" (Cero Metal)" : "Zero-Metal 2\"×6\" Surface Bullnose"}</strong><br><span style="font-size:12px;color:var(--muted)">${es ? `Tope sup. + bajadas 35″ Este/Oeste${state.nicheFrameMode === "bullnose2x6" ? " + marcos 2 nichos" : ""} (${tk.totalBullnoseFt} ft)` : `Top cap + 35″ East/West stops${state.nicheFrameMode === "bullnose2x6" ? " + both niche frames" : ""} (${tk.totalBullnoseFt} lin ft)`}</span></td>
                  <td class="u4-mono">0025S42691P4<br>2"×6"×5/16" Glossy</td>
                  <td class="u4-mono"><strong>${tk.bullnosePcs} ${es ? "piezas" : "pieces"}</strong><br>(+${state.wastePct}% ${es ? "incluido" : "included"})</td>
                </tr>
                <tr>
                  <td><strong>${es ? "Esquinas Bullnose de Fábrica 2\"×2\"" : "Matching 2\"×2\" Bullnose Corners"}</strong><br><span style="font-size:12px;color:var(--muted)">${es ? "Giros a 90° sin cortes en inglete" : "Factory 90° turns — zero fragile 45° miters"}</span></td>
                  <td class="u4-mono">0025SN42691P2<br>2"×2"×5/16" Glossy</td>
                  <td class="u4-mono"><strong>${tk.cornerPcs} ${es ? "piezas" : "pieces"}</strong></td>
                </tr>
                <tr>
                  <td><strong>${es ? "Azulejo Formato Grande (Fondos 1 Pieza)" : "Large-Format Tile (1-Piece Niche Backs)"}</strong><br><span style="font-size:12px;color:var(--muted)">${es ? "Corta ~11″×19″ (Izq.) + ~7.5″×14″ (Der.) sin juntas" : "Cuts ~11″×19″ (Left) + ~7.5″×14″ (Right) w/ 0 seams"}</span></td>
                  <td class="u4-mono">${state.nicheBackMode === "large24x48" ? "24″×48″ (Product TBD)" : (state.nicheBackMode === "large12x24" ? "12″×24″ (Product TBD)" : "—")}<br>~5/16"–3/8″ thick</td>
                  <td class="u4-mono"><strong>${es ? tk.largeTileDescEs : tk.largeTileDescEn}</strong></td>
                </tr>
                <tr>
                  <td><strong>${es ? "Boquilla Fina de Muro + Silicón 100% al Tono" : "Fine-Aggregate Wall Grout + Matched 100% Silicone"}</strong><br><span style="font-size:12px;color:var(--muted)">${es ? "Junta 1/16″ sin eflorescencia + esquinas 90° y tina" : "1/16″ efflorescence-free joint + all 90° corners & tub"}</span></td>
                  <td class="u4-mono">${currentGrout().sku}</td>
                  <td class="u4-mono"><strong>1 ${es ? "saco 10 lb" : "× 10-lb bag"} + 3 ${es ? "tubos silicón" : "silicone tubes"}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

                    <div class="u4-step-cards">
            ${buildCalculatedSteps(es).map((st) => `
              <div class="u4-step-card">
                <div class="u4-step-card-head">
                  <span class="u4-step-card-title">${es ? `Paso ${st.num}: ${st.titleEs}` : `Step ${st.num}: ${st.titleEn}`}</span>
                  <span class="u4-step-card-dim">${st.dim}</span>
                </div>
                <p>${es ? st.es : st.en}</p>
              </div>
            `).join("")}
          </div>

          <div class="u4-fold">
            <button type="button" class="u4-fold-btn" id="u4EquipBtn" aria-expanded="${state.equipOpen ? "true" : "false"}">
              <span style="display:inline-flex;align-items:center;gap:7px">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                ${es ? "Equipo y suministros" : "Equipment & Supplies"}
              </span>
              <span>${state.equipOpen ? "▴" : "▾"}</span>
            </button>
            ${state.equipOpen ? `
              <div class="u4-fold-body">
                <ul class="u4-list" style="margin-top:10px">
                  <li>${es ? "Cortadora húmeda de puente / riel con disco continuo de diamante (para cortes rectos limpios de 19\" en el azulejo de formato grande)" : "Bridge wet saw or score-and-snap rail cutter + diamond pad (for clean 19\" single-piece cuts on the large-format tile)"}</li>
                  <li>${es ? "Nivel láser de líneas cruzadas (nivelar la 1.ª hilada continua entre muro Norte y muro Este)" : "Cross-line laser level (locks one continuous horizontal course datum across North & East walls)"}</li>
                  <li>${es ? "Separadores de 1/16\" + cuñas para nivelar sobre la cubierta de piedra de la tina" : "1/16\" tile spacers + leveling wedges along the stone tub deck"}</li>
                  <li>${es ? "Llana dentada de 1/4\"×1/4\" (3\"×6\") y 1/4\"×3/8\" (respaldo completo 95%+ en nichos húmedos)" : "1/4\"×1/4\" notched trowel (3\"×6\" wall) & 1/4\"×3/8\" trowel (95%+ mortar coverage per wet-area standard)"}</li>
                  <li>${es ? "Piedra de diamante para pulir cantos cortados antes de ocultarlos tras los retornos" : "Diamond hand polishing pad to dress cut porcelain edges cleanly"}</li>
                </ul>
              </div>
            ` : ""}
          </div>
        </section>
      `;
    }

    const pagerHtml = `
      <div class="u4-pager">
        <button type="button" class="u4-pager-btn" id="u4PrevStep" ${prevStep ? "" : "disabled"}>
          ← ${prevStep ? (es ? prevStep.es : prevStep.en) : (es ? "Anterior" : "Prev")}
        </button>
        <span class="u4-pager-meta">${es ? `Paso ${stepIdx + 1} de ${STEPS.length}` : `Step ${stepIdx + 1} of ${STEPS.length}`}</span>
        <button type="button" class="u4-pager-btn" id="u4NextStep" ${nextStep ? "" : "disabled"}>
          ${nextStep ? (es ? nextStep.es : nextStep.en) : (es ? "Siguiente" : "Next")} →
        </button>
      </div>
    `;

    root.innerHTML = holdHtml + tabsHtml + bodyCardHtml + pagerHtml;

    // Wire Step Tabs & Pager
    root.querySelectorAll("[data-step]").forEach((btn) => {
      btn.onclick = () => {
        state.step = btn.dataset.step;
        window.history.replaceState(null, "", "#step=" + state.step);
        renderStage();
        window.scrollTo(0, 0);
      };
    });
    const prevBtn = document.getElementById("u4PrevStep");
    const nextBtn = document.getElementById("u4NextStep");
    if (prevBtn && prevStep) prevBtn.onclick = () => { state.step = prevStep.id; window.history.replaceState(null, "", "#step=" + state.step); renderStage(); window.scrollTo(0, 0); };
    if (nextBtn && nextStep) nextBtn.onclick = () => { state.step = nextStep.id; window.history.replaceState(null, "", "#step=" + state.step); renderStage(); window.scrollTo(0, 0); };

    // Wire Step 2 Niche & Course Controls
    root.querySelectorAll("[data-nback]").forEach((b) => { b.onclick = () => { state.nicheBackMode = b.dataset.nback; renderAll(); }; });
    root.querySelectorAll("[data-nlook]").forEach((b) => { b.onclick = () => { state.nicheLookMode = b.dataset.nlook; renderAll(); }; });
    root.querySelectorAll("[data-nsill]").forEach((b) => { b.onclick = () => { state.nicheSillMode = b.dataset.nsill; renderAll(); }; });
    root.querySelectorAll("[data-nframe]").forEach((b) => { b.onclick = () => { state.nicheFrameMode = b.dataset.nframe; renderAll(); }; });
    root.querySelectorAll("[data-grout]").forEach((b) => { b.onclick = () => { state.groutMode = b.dataset.grout; renderAll(); }; });
    const sl = document.getElementById("u4StarterSlider");
    if (sl) sl.oninput = (e) => { state.starterRowIn = Number(e.target.value); renderStage(); };
    const snapBtn = document.getElementById("u4SnapHeaderBtn");
    if (snapBtn) snapBtn.onclick = () => { state.starterRowIn = 2.25; renderStage(); };

    // Wire Step 4 Checkboxes, Waste & Fold
    root.querySelectorAll("[data-chk]").forEach((ck) => { ck.onchange = (e) => { state.checks[ck.dataset.chk] = e.target.checked; renderStage(); }; });
    root.querySelectorAll("[data-waste]").forEach((wb) => { wb.onclick = () => { state.wastePct = Number(wb.dataset.waste); renderAll(); }; });
    const eqBtn = document.getElementById("u4EquipBtn");
    if (eqBtn) eqBtn.onclick = () => { state.equipOpen = !state.equipOpen; renderStage(); };

    wireSvgInteractions(state.step);
  }

  // ── 2-PAGE LETTER PRINT RENDERER (?print=1 / window.print()) ─────────────
  function renderPrintSheets() {
    const es = state.lang === "es";
    const tk = computeTakeoff();
    const shell = document.getElementById("u4PrintShell");
    if (!shell) return;

    shell.innerHTML = `
      <!-- PAGE 1: 3-WALL 1:1 ALCOVE ELEVATION + ROOM KEY PLAN + GOVERNING SPECS -->
      <section class="print-sheet">
        <div class="print-hdr">
          <div>
            <h1>${es ? "Unidad 4 Baño — Plan de Azulejo en Tina y Nichos (R1 · ES)" : "Unit 4 Bathroom — Tub Alcove & Niche Wall Tile Plan (R1 · EN)"}</h1>
            <div style="font-size:11px;color:#455056">${es ? "1231 11th Ave, Unidad 4, SF · Escala Real 1:1 · Cero Metal · Cero Precios (Inglés rige)" : "1231 11th Ave, Unit 4, SF · True 1:1 Scale (X = Y) · Zero Metal Trim · Zero Prices"}</div>
          </div>
          <div class="print-hdr-meta">
            <div>2026-11-24 · R1</div>
            <div>${es ? "Hoja 1 de 2" : "Sheet 1 of 2"}</div>
          </div>
        </div>

        <div class="print-hold">
          <strong>${es ? "ESPERA DE COLOCACIÓN:" : "HOLD BEFORE SETTING TILE:"}</strong>
          ${es
            ? "Reemplazar ventana y chambrana de 5-1/4\" antes del azulejo adyacente (SIN azulejo arriba de la repisa Oeste). Elegir azulejo de formato grande (1 pza 24\"×48\" recomendado) y medir abertura impermeabilizada de ambos nichos antes de cortar."
            : "Complete window & 5-1/4\" casing replacement before adjacent tile (NO wall tile in upper West window-casing zone). Select large-format tile (one 24\"×48\" tile recommended) and verify waterproofed niche openings on site before cutting."}
        </div>

        <div class="print-box" style="margin-bottom:9px">
          ${buildStep1OverviewSvg(es, true)}
        </div>

        <div class="print-box">
          <h2>${es ? "Cotas y Especificaciones Bloqueadas por Tisa (24 Nov 2026)" : "Owner-Locked Specifications & Field Dimensions (Nov 24, 2026)"}</h2>
          <table class="print-table">
            <thead>
              <tr>
                <th>${es ? "Zona / Elemento" : "Zone / Element"}</th>
                <th>${es ? "Especificación Rectora" : "Governing Specification"}</th>
                <th>${es ? "Estado / Compuerta" : "Status / Field Gate"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${es ? "Azulejo de Muro" : "Wall Field Tile"}</strong></td>
                <td>American Olean Color Story 0025 Ice White 3″×6″×5/16″ (002536MOD1P4 · 50% · 1/16″ joint)</td>
                <td>${es ? "En sitio (IMG_5493) — contar cajas tono 55501" : "On hand (IMG_5493) — verify carton count"}</td>
              </tr>
              <tr>
                <td><strong>${es ? "Tope Muro Este (Controles)" : "East Control Wall Stop"}</strong></td>
                <td>${es ? "35\" desde muro Norte (~2\" pasando piedra de ~33\"), bajando hasta el piso" : "35\" from back wall (~2\" past ~33\" stone apron), carried down to floor"}</td>
                <td>${es ? "BLOQUEADO · Libra toma WC (~38\")" : "LOCKED · Clears ~38\" toilet supply"}</td>
              </tr>
              <tr>
                <td><strong>${es ? "Muro Oeste (Ventana)" : "West Window Wall"}</strong></td>
                <td>${es ? "Bajo repisa (43\" al piso): azulejo hasta 35\". Arriba de repisa: ventana + chambrana 5-1/4\" SIN azulejo" : "Below 43\" sill: tile to 35\" sill tip. Above sill: replacement window + 5-1/4\" casing, NO tile"}</td>
                <td>${es ? "BLOQUEADO · Esperar ventana/chambrana" : "LOCKED · Hold for window/casing"}</td>
              </tr>
              <tr>
                <td><strong>${es ? "Altura Superior y Remate" : "Top Line & Zero-Metal Trim"}</strong></td>
                <td>${es ? "71-1/4\" sobre tina (borde actual HardieBacker) · Bullnose 2\"×6\" (0025S42691P4) + Esquina 2\"×2\" (0025SN42691P2)" : "71-1/4\" above tub (current HardieBacker top) · 2\"×6\" Bullnose (0025S42691P4) + 2\"×2\" Corner (0025SN42691P2)"}</td>
                <td>${es ? "BLOQUEADO · Cero metal / Schluter" : "LOCKED · Zero metal / Schluter"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="print-ftr">
          <span>1231 11th Ave Unit 4 · Bathroom Tile Plan R1</span>
          <span>${es ? "Cero precios · Verificar en obra antes de cortar" : "Zero prices · Verify on site before cutting"}</span>
        </div>
      </section>

      <!-- PAGE 2: 1:1 NICHE SINGLE-PIECE BACK PLAN + STOPS + ZERO-PRICE TAKEOFF -->
      <section class="print-sheet">
        <div class="print-hdr">
          <div>
            <h1>${es ? "Unidad 4 Baño — Nichos de 1 Sola Pieza, Remates y Cantidades" : "Unit 4 Bathroom — Single-Piece Niche Backs, Stops & Takeoff"}</h1>
            <div style="font-size:11px;color:#455056">${es ? "Fondos continuos de 1 sola pieza cortados de azulejo formato grande (ej. 24\"×48\" · producto por elegir)" : "Seamless 1-piece niche backs cut from large-format tile (e.g. 24\"×48\" · product TBD)"}</div>
          </div>
          <div class="print-hdr-meta">
            <div>2026-11-24 · R1</div>
            <div>${es ? "Hoja 2 de 2" : "Sheet 2 of 2"}</div>
          </div>
        </div>

        <div class="print-box" style="margin-bottom:8px">
          ${buildStep2NichesSvg(es, true)}
        </div>

        <div class="print-grid-2">
          <div class="print-box">
            <h2>${es ? "Cantidades Propuestas (+15% · Sin Precios)" : "Proposed Material Takeoff (+15% · Zero Prices)"}</h2>
            <table class="print-table">
              <thead>
                <tr><th>${es ? "Material" : "Item"}</th><th>SKU</th><th>${es ? "Cant." : "Qty"}</th></tr>
              </thead>
              <tbody>
                <tr><td>3″×6″ Ice White Wall Tile</td><td class="u4-mono">002536MOD1P4</td><td class="u4-mono">${tk.cartonsNeeded} ${es ? "cajas" : "boxes"} (${tk.grossSubwaySqft} sf)</td></tr>
                <tr><td>2″×6″ Surface Bullnose</td><td class="u4-mono">0025S42691P4</td><td class="u4-mono">${tk.bullnosePcs} ${es ? "pzs" : "pcs"} (${tk.totalBullnoseFt} ft)</td></tr>
                <tr><td>2″×2″ Bullnose Corner</td><td class="u4-mono">0025SN42691P2</td><td class="u4-mono">${tk.cornerPcs} ${es ? "pzs" : "pcs"}</td></tr>
                <tr><td>Large-Format Niche Back Tile</td><td class="u4-mono">24″×48″ (TBD)</td><td class="u4-mono">${tk.largeTileCount} ${es ? "pza" : "tile"}</td></tr>
              </tbody>
            </table>
          </div>

          <div class="print-box">
            <h2>${es ? "Compuertas Antes de Pegar Azulejo" : "Mandatory Pre-Tile Gates"}</h2>
            <table class="print-table">
              <tbody>
                <tr><td>1. ${es ? "Reemplazar ventana + chambrana 5-1/4\" e impermeabilizar repisa" : "Install replacement window + 5-1/4\" casing & waterproof sill"}</td></tr>
                <tr><td>2. ${es ? "Elegir azulejo grande (24\"×48\") y medir ancho/alto real de nichos" : "Pick large-format tile (24\"×48\") & measure exact niche openings"}</td></tr>
                <tr><td>3. ${es ? "Colocar fondo 1 pza PRIMERO; repisa con pendiente 1/4\"/pie a tina" : "Set 1-pc back slab FIRST; pitch sill 1/4\"/ft toward tub"}</td></tr>
                <tr><td>4. ${es ? "Devolver botiquín grande 20×32 (NO instalar); revisar válvula Delta" : "Hold/return oversized 20×32 cabinet; verify Delta valve depth"}</td></tr>
                <tr><td>5. ${es ? "Foto con cinta de membrana continua y trazo en seco aprobado" : "Snap tape-in-frame photos of membrane & dry-fit before setting"}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="print-ftr">
          <span>1231 11th Ave Unit 4 · Bathroom Tile Plan R1</span>
          <span>${es ? "Escala uniforme 1:1 verificada · Cero perfiles metálicos" : "Verified 1:1 uniform scale · Zero metal edge trim"}</span>
        </div>
      </section>
    `;
  }

  function applyHashStep() {
    const h = (window.location.hash || "").replace(/^#/, "");
    const m = h.match(/^step=([a-z0-9-]+)$/i);
    if (m) {
      const alias = {
        "1": "alcove-overview", overview: "alcove-overview",
        "2": "north-niches", niches: "north-niches", niche: "north-niches",
        "3": "east-west-stops", stops: "east-west-stops",
        "4": "holds-takeoff", takeoff: "holds-takeoff"
      };
      const target = alias[m[1].toLowerCase()] || m[1];
      if (STEPS.some((s) => s.id === target)) state.step = target;
    }
  }

  function renderAll() {
    renderTopbar();
    renderStage();
    renderPrintSheets();
  }

  // Expose Canonical window.U4PLAN Contract per unit4-interactive-plan-builder
  window.U4PLAN = {
    planId: "bathroom-tile",
    getSvgElement: () => document.getElementById("u4BathSvg"),
    getState: () => JSON.parse(JSON.stringify(state)),
    getTakeoff: () => computeTakeoff(),
    getScaleInfo: () => Object.assign({}, state.lastScaleInfo),
    getLang: () => state.lang,
    setLang: (lang) => {
      state.lang = lang === "es" ? "es" : "en";
      safeSetPref("u4_lang", state.lang);
      renderAll();
    },
    render: () => renderAll()
  };

  function boot() {
    applyHashStep();
    window.addEventListener("hashchange", () => { applyHashStep(); renderStage(); });
    if (IS_PRINT_MODE) {
      document.body.classList.add("u4-print-mode");
    }
    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
