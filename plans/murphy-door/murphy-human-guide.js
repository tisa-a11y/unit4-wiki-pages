/* ============================================================================
   Murphy Bookcase Door (Hallway B) — Real-World Human-First Interactive Guide
   Interactive 9-Point R4 Segment Highlighter · Diag A/B Lean & Scribing Guide
   Strict [P1-U5] Range Validation · Strict 1:1 True-Scale Deep Closet (MD-1)
   Zero External CDNs · Zero Prices · Zero Backend Clutter · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "measure", en: "1. Measure Door B", es: "1. Medir Puerta B" },
    { id: "swing", en: "2. 90° Swing & Depth", es: "2. Giro 90° y Fondo" },
    { id: "vents", en: "3. Laundry Vents", es: "3. Rejillas Lavadora" },
    { id: "trim", en: "4. Trim & Supplies", es: "4. Molduras y Kit" }
  ];

  // Field definitions with R4 Worksheet guidance & strict architectural bounds [P1-U5]
  var FIELDS = [
    {
      k: "b7", num: 1, kind: "w", min: 18, max: 48, ph: "28-7/16",
      en: "1. Top width", es: "1. Ancho arriba",
      guideEn: "Hook tape inside left wood jamb just below the head jamb → measure straight across to inside right wood jamb (exclude outside trim).",
      guideEs: "Engancha la cinta por dentro de la jamba izquierda justo debajo del cabezal → mide en línea recta a la jamba derecha (sin molduras exteriores)."
    },
    {
      k: "b8", num: 2, kind: "w", min: 18, max: 48, ph: "28-7/16",
      en: "2. Mid width", es: "2. Ancho medio",
      guideEn: "Measure horizontally across the middle (~40\" off floor) between the inside faces of the left and right wood jambs.",
      guideEs: "Mide horizontalmente al centro (~40\" del piso) entre las caras interiores de las jambas izquierda y derecha."
    },
    {
      k: "b9", num: 3, kind: "w", min: 18, max: 48, ph: "28-7/16",
      en: "3. Bottom width", es: "3. Ancho abajo",
      guideEn: "Measure horizontally just above the finished floor between the inside faces of both wood jambs (keep tape flat).",
      guideEs: "Mide horizontalmente justo arriba del piso terminado entre las caras interiores de ambas jambas (cinta plana)."
    },
    {
      k: "b10", num: 4, kind: "h", min: 60, max: 96, ph: "80-7/16",
      en: "4. Left height", es: "4. Alto izq.",
      guideEn: "Stand tape on finished floor along the LEFT (hinge-side) jamb straight up to the underside of the head jamb.",
      guideEs: "Apoya la cinta en el piso terminado junto a la jamba IZQUIERDA (lado pivote) hasta la cara inferior del cabezal."
    },
    {
      k: "b11", num: 5, kind: "h", min: 60, max: 96, ph: "80-7/16",
      en: "5. Center height", es: "5. Alto centro",
      guideEn: "Stand tape on finished floor at the exact CENTER of Doorway B straight up to the underside of the head jamb.",
      guideEs: "Apoya la cinta en el piso terminado justo al CENTRO de la Puerta B hasta la cara inferior del cabezal."
    },
    {
      k: "b12", num: 6, kind: "h", min: 60, max: 96, ph: "80-7/16",
      en: "6. Right height", es: "6. Alto der.",
      guideEn: "Stand tape on finished floor along the RIGHT (latch-side) jamb straight up to the underside of the head jamb.",
      guideEs: "Apoya la cinta en el piso terminado junto a la jamba DERECHA (lado seguro) hasta la cara inferior del cabezal."
    },
    {
      k: "b13", num: 7, kind: "d", min: 60, max: 110, ph: "85-5/16",
      en: "7. Diagonal A (TL→BR)", es: "7. Diagonal A (SI→ID)",
      guideEn: "Press tape hook tight into the TOP-LEFT inside corner → stretch straight to the BOTTOM-RIGHT inside corner at the floor.",
      guideEs: "Presiona la punta de la cinta en la esquina interior SUPERIOR-IZQUIERDA → estira recto a la esquina INFERIOR-DERECHA en el piso."
    },
    {
      k: "b14", num: 8, kind: "d", min: 60, max: 110, ph: "85-5/16",
      en: "8. Diagonal B (TR→BL)", es: "8. Diagonal B (SD→II)",
      guideEn: "Press tape hook tight into the TOP-RIGHT inside corner → stretch straight to the BOTTOM-LEFT inside corner. Compare |A − B| (≤ 1/8\" is square).",
      guideEs: "Presiona la punta en la esquina interior SUPERIOR-DERECHA → estira recto a la esquina INFERIOR-IZQUIERDA. Compara |A − B| (≤ 1/8\" está a escuadra)."
    },
    {
      k: "b15", num: 9, kind: "j", min: 2, max: 12, ph: "4-3/4",
      en: "9. Jamb depth (J)", es: "9. Fondo jamba (J)",
      guideEn: "Measure straight through the wood jamb from the hallway face to the laundry-closet face (EXCLUDE outside trim casings).",
      guideEs: "Mide el grosor de la jamba de madera desde la cara del pasillo hasta la cara del clóset (SIN contar chambranas exteriores)."
    }
  ];

  var FIELD_MAP = {};
  FIELDS.forEach(function (f) { FIELD_MAP[f.k] = f; });

  var state = {
    step: "measure",
    activeField: "b7",
    b7: "", b8: "", b9: "",     // top/mid/bot widths
    b10: "", b11: "", b12: "",  // left/center/right heights
    b13: "", b14: "",           // diagonals A (TL->BR) & B (TR->BL)
    b15: "",                    // jamb depth J
    hingeStack: 2.375,          // T + Bt + 1/8"
    depthOpt: "8.25",           // "8.25" (7-3/16" shelf) or "9.0625" (8" shelf)
    equipOpen: false
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

  function parseIn(v) {
    var s = String(v == null ? "" : v).trim().replace(/"/g, "");
    if (!s) return { empty: true, num: null, badSyntax: false };
    // Allow negative sign to be parsed so we explicitly flag it as out-of-range!
    var fracM = s.match(/^(-?\d+)(?:[\s-]+(\d+)\/(\d+))$/);
    if (fracM) {
      var whole = parseFloat(fracM[1]);
      var num = parseFloat(fracM[2]);
      var den = parseFloat(fracM[3]);
      if (den > 0) {
        var val = whole < 0 ? whole - num / den : whole + num / den;
        return { empty: false, num: val, badSyntax: false };
      }
      return { empty: false, num: null, badSyntax: true };
    }
    if (/^-?\d+(?:\.\d+)?$/.test(s)) {
      return { empty: false, num: parseFloat(s), badSyntax: false };
    }
    return { empty: false, num: null, badSyntax: true };
  }

  function fmtIn(n) {
    if (n == null || isNaN(n)) return "—";
    var neg = n < 0;
    var r = Math.round(Math.abs(n) * 16) / 16;
    var whole = Math.floor(r);
    var num = Math.round((r - whole) * 16);
    if (num === 16) { whole += 1; num = 0; }
    var sign = neg ? "-" : "";
    if (num === 0) return sign + whole + '"';
    var den = 16;
    while (num % 2 === 0 && den > 1) { num /= 2; den /= 2; }
    return sign + (whole ? whole + "-" : "") + num + "/" + den + '"';
  }

  function computeMath() {
    var parsed = {};
    var invalidKeys = [];
    var validCount = 0;

    FIELDS.forEach(function (f) {
      var p = parseIn(state[f.k]);
      if (p.empty) {
        parsed[f.k] = { empty: true, valid: false, invalid: false, val: null };
      } else if (p.badSyntax || p.num === null || p.num <= 0 || p.num < f.min || p.num > f.max) {
        parsed[f.k] = { empty: false, valid: false, invalid: true, val: null, rawNum: p.num };
        invalidKeys.push(f.k);
      } else {
        parsed[f.k] = { empty: false, valid: true, invalid: false, val: p.num };
        validCount += 1;
      }
    });

    var hasAnyInvalid = invalidKeys.length > 0;
    var wInvalid = invalidKeys.some(function (k) { return k === "b7" || k === "b8" || k === "b9"; });
    var hInvalid = invalidKeys.some(function (k) { return k === "b10" || k === "b11" || k === "b12"; });
    var dInvalid = invalidKeys.some(function (k) { return k === "b13" || k === "b14"; });

    var ws = [parsed.b7.val, parsed.b8.val, parsed.b9.val].filter(function (x) { return x != null; });
    var hs = [parsed.b10.val, parsed.b11.val, parsed.b12.val].filter(function (x) { return x != null; });

    var minW = (!wInvalid && ws.length) ? Math.min.apply(null, ws) : null;
    var minH = (!hInvalid && hs.length) ? Math.min.apply(null, hs) : null;

    // [P1-U5] Never compute or display negative/bogus box dimensions if ANY reading is invalid!
    var rawCaseW = (!hasAnyInvalid && minW != null) ? +(minW - 0.25 - 1.0).toFixed(4) : null;
    var rawCaseH = (!hasAnyInvalid && minH != null) ? +(minH - state.hingeStack).toFixed(4) : null;
    var caseW = (rawCaseW != null && rawCaseW > 0) ? rawCaseW : null;
    var caseH = (rawCaseH != null && rawCaseH > 0) ? rawCaseH : null;

    var diagA = parsed.b13.val;
    var diagB = parsed.b14.val;
    var diagDiff = (!dInvalid && diagA != null && diagB != null) ? +Math.abs(diagA - diagB).toFixed(4) : null;
    var squareOk = diagDiff != null ? diagDiff <= 0.125 : null;
    // Exact geometry: Diag A = TL->BR, Diag B = TR->BL. If A > B, top leans LEFT (West toward Bath A); if B > A, top leans RIGHT (East toward Bed C).
    var leanDir = null;
    if (diagDiff != null && diagDiff > 0.125) {
      leanDir = diagA > diagB ? "left" : "right";
    }

    var depth = parseFloat(state.depthOpt);
    var shelfDepth = depth === 8.25 ? 7.1875 : 8.0;
    var doorSwingW = caseW != null ? caseW : 27.1875;
    var hallPassLeft = +(41.25 - doorSwingW).toFixed(2);

    // Guard against accidentally entering Bathroom Doorway A (27.25" x 79.375")
    var looksLikeDoorA = !hasAnyInvalid && (
      (minW != null && Math.abs(minW - 27.25) <= 0.25) ||
      (minH != null && Math.abs(minH - 79.375) <= 0.25)
    );

    return {
      parsed: parsed,
      invalidKeys: invalidKeys,
      hasAnyInvalid: hasAnyInvalid,
      dInvalid: dInvalid,
      filledCount: validCount,
      minW: minW,
      minH: minH,
      caseW: caseW,
      caseH: caseH,
      diagA: diagA,
      diagB: diagB,
      diagDiff: diagDiff,
      squareOk: squareOk,
      leanDir: leanDir,
      depth: depth,
      shelfDepth: shelfDepth,
      doorSwingW: doorSwingW,
      hallPassLeft: hallPassLeft,
      jambDepth: parsed.b15.val,
      looksLikeDoorA: looksLikeDoorA
    };
  }

  function renderDoorwayElevationSvg(m, es) {
    var ready = m.filledCount === 9 && !m.hasAnyInvalid && m.squareOk !== false && !m.looksLikeDoorA;
    var strokeB = m.hasAnyInvalid ? "#a8281c" : (ready ? "#2f6b3f" : "#9a5b06");
    var wTxt = m.hasAnyInvalid ? "—" : (m.caseW != null ? fmtIn(m.caseW) : '27-3/16" (prov.)');
    var hTxt = m.hasAnyInvalid ? "—" : (m.caseH != null ? fmtIn(m.caseH) : '78-1/16" (prov.)');
    var af = state.activeField || "b7";

    // Doorway B inside-jamb rect coordinates:
    var bx = 166, by = 56, bw = 104, bh = 166;
    var bx2 = bx + bw, by2 = by + bh;
    var bmx = bx + bw / 2, bmy = by + bh / 2;

    // Build vivid R4 segment highlight layer for whichever field b7..b15 is focused/selected!
    var segOverlay = "";
    var activeCol = "#a8281c";
    var diagACol = "#1f5f7a";
    var diagBCol = "#9a5b06";

    function arrowH(y, label, val) {
      return '<line x1="' + (bx + 2) + '" y1="' + y + '" x2="' + (bx2 - 2) + '" y2="' + y + '" stroke="' + activeCol + '" stroke-width="2.8" marker-start="url(#murArr)" marker-end="url(#murArr)"/>' +
        '<circle cx="' + (bx + 2) + '" cy="' + y + '" r="3.5" fill="' + activeCol + '"/>' +
        '<circle cx="' + (bx2 - 2) + '" cy="' + y + '" r="3.5" fill="' + activeCol + '"/>' +
        '<rect x="' + (bmx - 36) + '" y="' + (y - 16) + '" width="72" height="14" rx="3" fill="' + activeCol + '"/>' +
        '<text x="' + bmx + '" y="' + (y - 6.5) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#ffffff">' + esc(label + (val ? " " + val : "")) + "</text>";
    }

    function arrowV(x, label, val) {
      var lx = x < bmx ? x + 22 : (x > bmx ? x - 22 : x);
      return '<line x1="' + x + '" y1="' + (by + 2) + '" x2="' + x + '" y2="' + (by2 - 2) + '" stroke="' + activeCol + '" stroke-width="2.8"/>' +
        '<circle cx="' + x + '" cy="' + (by + 2) + '" r="3.5" fill="' + activeCol + '"/>' +
        '<circle cx="' + x + '" cy="' + (by2 - 2) + '" r="3.5" fill="' + activeCol + '"/>' +
        '<rect x="' + (lx - 29) + '" y="' + (bmy - 8) + '" width="58" height="15" rx="3" fill="' + activeCol + '"/>' +
        '<text x="' + lx + '" y="' + (bmy + 2) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#ffffff">' + esc(label + (val ? " " + val : "")) + "</text>";
    }

    var activeVal = m.parsed[af] && m.parsed[af].valid ? fmtIn(m.parsed[af].val) : "";

    if (af === "b7") segOverlay += arrowH(by + 16, "#1 Top W", activeVal);
    else if (af === "b8") segOverlay += arrowH(bmy, "#2 Mid W", activeVal);
    else if (af === "b9") segOverlay += arrowH(by2 - 14, "#3 Bot W", activeVal);
    else if (af === "b10") segOverlay += arrowV(bx + 14, "#4 L Ht", activeVal);
    else if (af === "b11") segOverlay += arrowV(bmx, "#5 C Ht", activeVal);
    else if (af === "b12") segOverlay += arrowV(bx2 - 14, "#6 R Ht", activeVal);

    // Diagonals A (TL -> BR) and B (TR -> BL): always show active diagonal vividly, and show BOTH when both entered!
    var showA = af === "b13" || (m.diagA != null && m.diagB != null);
    var showB = af === "b14" || (m.diagA != null && m.diagB != null);
    if (showA) {
      var colA = af === "b13" ? activeCol : diagACol;
      segOverlay +=
        '<line x1="' + (bx + 3) + '" y1="' + (by + 3) + '" x2="' + (bx2 - 3) + '" y2="' + (by2 - 3) + '" stroke="' + colA + '" stroke-width="' + (af === "b13" ? 3 : 2.1) + '"/>' +
        '<circle cx="' + (bx + 3) + '" cy="' + (by + 3) + '" r="4.2" fill="' + colA + '"/>' +
        '<circle cx="' + (bx2 - 3) + '" cy="' + (by2 - 3) + '" r="4.2" fill="' + colA + '"/>' +
        '<rect x="' + (bx + 6) + '" y="' + (by + 18) + '" width="58" height="14" rx="3" fill="' + colA + '"/>' +
        '<text x="' + (bx + 35) + '" y="' + (by + 27.5) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff">A: ' + (m.diagA != null ? fmtIn(m.diagA) : "TL→BR") + "</text>";
    }
    if (showB) {
      var colB = af === "b14" ? activeCol : diagBCol;
      segOverlay +=
        '<line x1="' + (bx2 - 3) + '" y1="' + (by + 3) + '" x2="' + (bx + 3) + '" y2="' + (by2 - 3) + '" stroke="' + colB + '" stroke-width="' + (af === "b14" ? 3 : 2.1) + '" stroke-dasharray="' + (af === "b14" ? "none" : "5 3") + '"/>' +
        '<circle cx="' + (bx2 - 3) + '" cy="' + (by + 3) + '" r="4.2" fill="' + colB + '"/>' +
        '<circle cx="' + (bx + 3) + '" cy="' + (by2 - 3) + '" r="4.2" fill="' + colB + '"/>' +
        '<rect x="' + (bx2 - 64) + '" y="' + (by2 - 34) + '" width="58" height="14" rx="3" fill="' + colB + '"/>' +
        '<text x="' + (bx2 - 35) + '" y="' + (by2 - 24.5) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff">B: ' + (m.diagB != null ? fmtIn(m.diagB) : "TR→BL") + "</text>";
    }

    // Right-hand side panel inside SVG: Top-down Jamb Depth Cross-Section Inset (highlighted on #9 b15) + Clickable 1-9 Pills
    var jambHighlight = af === "b15";
    var jambBorder = jambHighlight ? "#a8281c" : "#c5ccc9";
    var jambBg = jambHighlight ? "#f9e6e4" : "#f4f5f3";
    var jambValTxt = m.jambDepth != null ? fmtIn(m.jambDepth) : (es ? "Medir J" : "Measure J");

    var quickPillsSvg = FIELDS.map(function (f, idx) {
      var col = idx % 3;
      var row = Math.floor(idx / 3);
      var rx = 294 + col * 58;
      var ry = 166 + row * 18;
      var isAct = f.k === af;
      var isInv = m.parsed[f.k] && m.parsed[f.k].invalid;
      var isVal = m.parsed[f.k] && m.parsed[f.k].valid;
      var fill = isInv ? "#a8281c" : (isAct ? "#1f5f7a" : (isVal ? "#e4f0e6" : "#ffffff"));
      var stroke = isInv ? "#a8281c" : (isAct ? "#1f5f7a" : (isVal ? "#2f6b3f" : "#c5ccc9"));
      var tcol = (isInv || isAct) ? "#ffffff" : (isVal ? "#2f6b3f" : "#1d2326");
      var lbl = f.num + "." + (f.k === "b13" ? "DiagA" : f.k === "b14" ? "DiagB" : f.k === "b15" ? "Jamb" : (f.kind === "w" ? "W" : "H"));
      return '<g class="mur-svg-pill" data-pick-mf="' + f.k + '" style="cursor:pointer">' +
        '<rect x="' + rx + '" y="' + ry + '" width="54" height="15" rx="7.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1"/>' +
        '<text x="' + (rx + 27) + '" y="' + (ry + 10) + '" text-anchor="middle" font-size="6.3" font-weight="700" fill="' + tcol + '">' + lbl + "</text>" +
      "</g>";
    }).join("");

    return '<svg id="murElevSvg" viewBox="0 0 480 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Elevación interactiva 9 puntos Puerta B" : "Interactive 9-point Doorway B elevation") + '">' +
      '<text x="240" y="17" text-anchor="middle" font-size="9.2" font-weight="800" fill="#1f5f7a">' +
        (es ? "PASILLO AL NORTE · ← OESTE (Baño A) | CENTRO (Murphy B) | ESTE (Jamba / Puntos 1–9) →"
            : "HALLWAY FACING NORTH · ← WEST (Bath A) | CENTER (Murphy B) | EAST (Jamb / Points 1–9) →") + "</text>" +

      // Original Edwardian Crown Molding
      '<rect x="14" y="25" width="268" height="12" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1"/>' +
      '<text x="148" y="34" text-anchor="middle" font-size="7" font-weight="800" fill="#2f6b3f">' + (es ? "MOLDURA CORONA ORIGINAL — NO TOCAR" : "ORIGINAL CROWN MOLDING — KEEP UNTOUCHED") + "</text>" +

      // Door A (Bathroom — DO NOT MEASURE)
      '<rect x="20" y="56" width="72" height="166" fill="#f9e6e4" stroke="#a8281c" stroke-width="1.4"/>' +
      '<text x="56" y="122" text-anchor="middle" font-size="8.2" font-weight="800" fill="#a8281c">' + (es ? "PUERTA A" : "DOOR A") + "</text>" +
      '<text x="56" y="135" text-anchor="middle" font-size="7.2" fill="#a8281c">' + (es ? "Baño" : "Bathroom") + "</text>" +
      '<text x="56" y="148" text-anchor="middle" font-size="7" font-weight="800" fill="#a8281c">' + (es ? "NO MEDIR" : "DO NOT USE") + "</text>" +

      // Wall A-B warning zone
      '<rect x="98" y="56" width="60" height="166" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="4 2"/>' +
      '<text x="128" y="128" text-anchor="middle" font-size="7" font-weight="800" fill="#9a5b06">' + (es ? "MURO A–B" : "WALL A–B") + "</text>" +
      '<text x="128" y="140" text-anchor="middle" font-size="6.4" fill="#9a5b06">' + (es ? "Revisar bastidor" : "Check framing") + "</text>" +

      // Doorway B — MURPHY BOOKCASE TARGET (with live 9-point highlight!)
      '<rect x="' + (bx - 5) + '" y="' + (by - 5) + '" width="' + (bw + 10) + '" height="' + (bh + 5) + '" fill="none" stroke="#2f6b3f" stroke-width="2.2"/>' +
      '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="#e3eef2" stroke="' + strokeB + '" stroke-width="2.2" stroke-dasharray="' + (ready ? "none" : "6 3") + '"/>' +
      // Faint shelf guides
      '<line x1="' + (bx + 4) + '" y1="92" x2="' + (bx2 - 4) + '" y2="92" stroke="#1f5f7a" stroke-width="1" opacity="0.35"/>' +
      '<line x1="' + (bx + 4) + '" y1="126" x2="' + (bx2 - 4) + '" y2="126" stroke="#1f5f7a" stroke-width="1" opacity="0.35"/>' +
      '<line x1="' + (bx + 4) + '" y1="160" x2="' + (bx2 - 4) + '" y2="160" stroke="#1f5f7a" stroke-width="1" opacity="0.35"/>' +
      '<line x1="' + (bx + 4) + '" y1="194" x2="' + (bx2 - 4) + '" y2="194" stroke="#1f5f7a" stroke-width="1" opacity="0.35"/>' +
      // Left pivot + Right push latch indicator
      '<circle cx="' + (bx + 5) + '" cy="' + (by + 7) + '" r="3" fill="#1f5f7a"/><circle cx="' + (bx + 5) + '" cy="' + (by2 - 7) + '" r="3" fill="#1f5f7a"/>' +
      '<circle cx="' + (bx2 - 5) + '" cy="142" r="3.4" fill="#a8281c"/>' +
      '<text x="' + bmx + '" y="48" text-anchor="middle" font-size="8" font-weight="800" fill="#1f5f7a">' + (es ? "PUERTA B (MURPHY)" : "DOOR B (MURPHY)") + "</text>" +
      '<text x="' + bmx + '" y="109" text-anchor="middle" font-size="7.2" font-weight="800" fill="' + strokeB + '">W: ' + esc(wTxt) + "</text>" +
      '<text x="' + bmx + '" y="120" text-anchor="middle" font-size="7.2" font-weight="800" fill="' + strokeB + '">H: ' + esc(hTxt) + "</text>" +

      // Live Active Segment Highlight Layer
      segOverlay +

      // Floor line left side
      '<line x1="14" y1="222" x2="282" y2="222" stroke="#1d2326" stroke-width="2.2"/>' +

      // Right-hand Panel: Top-Down Jamb Depth Inset (#9 b15) + Interactive 1-9 Picker
      '<rect x="288" y="25" width="180" height="128" rx="6" fill="' + jambBg + '" stroke="' + jambBorder + '" stroke-width="' + (jambHighlight ? 2 : 1.1) + '"/>' +
      '<text x="378" y="39" text-anchor="middle" font-size="7.4" font-weight="800" fill="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '">' + (es ? "#9 CORTE SUPERIOR JAMBA (SIN MOLDURA)" : "#9 TOP-DOWN JAMB DEPTH (NO TRIM)") + "</text>" +
      // Wall core + wood jamb + outside casings labeled clearly
      '<text x="378" y="53" text-anchor="middle" font-size="6.4" font-weight="700" fill="#5d686d">' + (es ? "↑ Clóset Lavandería (Norte)" : "↑ Laundry Closet (North)") + "</text>" +
      '<rect x="304" y="60" width="38" height="44" fill="#d9dedc" stroke="#5d686d" stroke-width="1.2"/>' +
      '<rect x="342" y="60" width="12" height="44" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1.5"/>' +
      '<rect x="304" y="55" width="44" height="5" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="0.9"/>' +
      '<rect x="304" y="104" width="44" height="5" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="0.9"/>' +
      // Bold Jamb Depth J arrow (strictly between wood jamb faces, excluding green casings!)
      '<line x1="364" y1="60" x2="364" y2="104" stroke="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '" stroke-width="2.2"/>' +
      '<line x1="358" y1="60" x2="370" y2="60" stroke="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '" stroke-width="1.6"/>' +
      '<line x1="358" y1="104" x2="370" y2="104" stroke="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '" stroke-width="1.6"/>' +
      '<text x="374" y="80" font-size="7.4" font-weight="800" fill="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '">J = ' + esc(jambValTxt) + "</text>" +
      '<text x="374" y="92" font-size="6.2" font-weight="600" fill="#5d686d">' + (es ? "Solo madera jamba" : "Wood jamb only") + "</text>" +
      '<text x="374" y="102" font-size="6" fill="#2f6b3f">' + (es ? "(excluir chambrana)" : "(exclude casing)") + "</text>" +
      '<text x="378" y="122" text-anchor="middle" font-size="6.4" font-weight="700" fill="#5d686d">' + (es ? "↓ Pasillo (Sur)" : "↓ Hallway (South)") + "</text>" +
      '<text x="378" y="144" text-anchor="middle" font-size="6.6" font-weight="700" fill="#5d686d">' + (es ? "Toca un punto 1–9 para resaltar:" : "Tap any point 1–9 to highlight:") + "</text>" +
      quickPillsSvg +

      '<text x="240" y="241" text-anchor="middle" font-size="7.6" font-weight="700" fill="#1f5f7a">' +
        (es ? "Medir POR DENTRO de las jambas (sin molduras exteriores) al 1/16\" más cercano, dos veces"
            : "Measure INSIDE wood jambs (excluding outside trim) to nearest 1/16\", twice") +
      "</text>" +
    "</svg>";
  }

  // Strict 1:1 True-Scale (scaleX === scaleY = 2.0 px/in) Deep Laundry Closet & Hallway Swing Plan matching MD-1 & unit4-floorplan-proof.png!
  function renderSwingPlanSvg(m, es) {
    var S = 2.0; // exact 1:1 uniform scale: 1 inch = 2.0 px in BOTH X and Y!
    var closetWIn = 36.3125; // 36-5/16"
    var closetDIn = 82.625;  // 82-5/8" (~2.28:1 deep shaft!)
    var washWIn = 27.0;
    var washDIn = 30.375;
    var hallDIn = 41.25;     // 41-1/4"
    var jambDIn = m.jambDepth != null ? m.jambDepth : 4.75;
    var doorWIn = m.doorSwingW; // ~27.19"
    var caseDIn = m.depth;      // 8.25" or 9.0625"

    var closetW = +(closetWIn * S).toFixed(1); // 72.6 px
    var closetD = +(closetDIn * S).toFixed(1); // 165.3 px
    var closetX = 118;
    var closetY = 34;
    var wallTopY = +(closetY + closetD).toFixed(1);       // 199.3
    var wallBotY = +(wallTopY + jambDIn * S).toFixed(1);  // ~208.8
    var hallBotY = +(wallBotY + hallDIn * S).toFixed(1);  // ~291.3

    var washW = +(washWIn * S).toFixed(1); // 54.0 px
    var washD = +(washDIn * S).toFixed(1); // 60.8 px
    var washX = +(closetX + (closetW - washW) / 2).toFixed(1);
    var washY = +(closetY + 4.0 * S).toFixed(1); // 4" rear clearance!
    var clearFrontIn = +(closetDIn - 4.0 - washDIn).toFixed(1); // ~48.25" (~4 ft clear!)
    var clearFrontTop = +(washY + washD).toFixed(1);

    var openWpx = +(28.4375 * S).toFixed(1);
    var openX = +(closetX + (closetW - openWpx) / 2).toFixed(1);
    var openX2 = +(openX + openWpx).toFixed(1);
    var doorLenPx = +(doorWIn * S).toFixed(1);
    var caseDpx = +(caseDIn * S).toFixed(1);

    return '<svg id="murSwingSvg" viewBox="0 0 460 326" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Planta a escala 1:1 del clóset profundo de lavandería y giro 90 grados" : "Strict 1:1 true-scale deep laundry closet and 90-degree out-swing plan") + '">' +
      '<text x="14" y="18" font-size="8.8" font-weight="800" fill="#1f5f7a">' +
        (es ? 'PLANTA ESCALA REAL 1:1 (X = Y) · CLÓSET 36-5/16" × 82-5/8" Y PASILLO 41-1/4"'
            : 'TRUE 1:1 SCALE PLAN (X = Y) · CLOSET 36-5/16" × 82-5/8" & HALLWAY 41-1/4"') + "</text>" +
      // N/S/E/W Compass Rose
      '<g transform="translate(436,24)">' +
        '<circle r="13" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-9 -2.8,-3 2.8,-3" fill="#a8281c"/>' +
        '<text x="0" y="-10" text-anchor="middle" font-size="5.8" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="11" text-anchor="middle" font-size="5.2" font-weight="700" fill="#5d686d">S</text>' +
      "</g>" +

      // Deep Laundry Closet (strict 1:1 36-5/16" W x 82-5/8" D -> ~2.28:1 vertical proportion!)
      '<rect id="murClosetRect" data-w-in="' + closetWIn + '" data-d-in="' + closetDIn + '" x="' + closetX + '" y="' + closetY + '" width="' + closetW + '" height="' + closetD + '" fill="#fbfcfb" stroke="#1d2326" stroke-width="2.2"/>' +
      // Closet width & depth dimensions
      '<text x="' + (closetX + closetW / 2).toFixed(1) + '" y="' + (closetY - 4) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#1f5f7a">36-5/16" W</text>' +
      '<line x1="' + (closetX - 12) + '" y1="' + closetY + '" x2="' + (closetX - 12) + '" y2="' + wallTopY + '" stroke="#1f5f7a" stroke-width="1.2"/>' +
      '<line x1="' + (closetX - 16) + '" y1="' + closetY + '" x2="' + (closetX - 8) + '" y2="' + closetY + '" stroke="#1f5f7a" stroke-width="1.2"/>' +
      '<line x1="' + (closetX - 16) + '" y1="' + wallTopY + '" x2="' + (closetX - 8) + '" y2="' + wallTopY + '" stroke="#1f5f7a" stroke-width="1.2"/>' +
      '<text x="' + (closetX - 17) + '" y="' + ((closetY + wallTopY) / 2 + 2).toFixed(1) + '" text-anchor="end" font-size="7.4" font-weight="800" fill="#1f5f7a">82-5/8"</text>' +
      '<text x="' + (closetX - 17) + '" y="' + ((closetY + wallTopY) / 2 + 12).toFixed(1) + '" text-anchor="end" font-size="6.4" fill="#5d686d">' + (es ? "fondo real" : "true depth") + "</text>" +

      // LG WashTower (27" W x 30-3/8" D) tucked at far North end (>=4" rear, >=1" each side)
      '<rect x="' + washX + '" y="' + washY + '" width="' + washW + '" height="' + washD + '" rx="3" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.6"/>' +
      '<text x="' + (washX + washW / 2).toFixed(1) + '" y="' + (washY + 24).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#1f5f7a">LG</text>' +
      '<text x="' + (washX + washW / 2).toFixed(1) + '" y="' + (washY + 34).toFixed(1) + '" text-anchor="middle" font-size="6.6" font-weight="700" fill="#1d2326">WashTower</text>' +
      '<text x="' + (washX + washW / 2).toFixed(1) + '" y="' + (washY + 45).toFixed(1) + '" text-anchor="middle" font-size="6" fill="#5d686d">27"×30-3/8"</text>' +
      // Rear 4" gap note & Clear ~4 ft front closet floor space!
      '<rect x="' + (closetX + 6) + '" y="' + (clearFrontTop + 12).toFixed(1) + '" width="' + (closetW - 12).toFixed(1) + '" height="' + (wallTopY - clearFrontTop - 22).toFixed(1) + '" rx="4" fill="#e4f0e6" fill-opacity="0.55" stroke="#2f6b3f" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="' + (closetX + closetW / 2).toFixed(1) + '" y="' + ((clearFrontTop + wallTopY) / 2 - 2).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#2f6b3f">~4 ft (' + Math.round(clearFrontIn) + '")</text>' +
      '<text x="' + (closetX + closetW / 2).toFixed(1) + '" y="' + ((clearFrontTop + wallTopY) / 2 + 8).toFixed(1) + '" text-anchor="middle" font-size="6.1" font-weight="700" fill="#2f6b3f">' + (es ? "libre al frente" : "clear floor") + "</text>" +

      // Hallway North Wall (with Jamb Depth J) & South Hallway Wall (41-1/4" clear at exact same 2.0 px/in!)
      '<rect x="20" y="' + wallTopY + '" width="' + (openX - 20).toFixed(1) + '" height="' + (wallBotY - wallTopY).toFixed(1) + '" fill="#d9dedc" stroke="#1d2326" stroke-width="1.6"/>' +
      '<rect x="' + openX2 + '" y="' + wallTopY + '" width="' + (254 - openX2).toFixed(1) + '" height="' + (wallBotY - wallTopY).toFixed(1) + '" fill="#d9dedc" stroke="#1d2326" stroke-width="1.6"/>' +
      // Wall A-B caution hatch left of Door B
      '<rect x="44" y="' + (wallTopY + 1) + '" width="56" height="' + Math.max(4, wallBotY - wallTopY - 2).toFixed(1) + '" fill="#f9e6e4" stroke="#a8281c" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="72" y="' + (wallTopY - 5) + '" text-anchor="middle" font-size="6.6" font-weight="800" fill="#a8281c">' + (es ? "Muro A–B" : "Wall A–B") + "</text>" +
      '<line x1="20" y1="' + hallBotY + '" x2="254" y2="' + hallBotY + '" stroke="#1d2326" stroke-width="2.4"/>' +

      // Hallway 41-1/4" vertical dimension on far left
      '<line x1="34" y1="' + wallBotY + '" x2="34" y2="' + hallBotY + '" stroke="#5d686d" stroke-width="1.2"/>' +
      '<text x="40" y="' + ((wallBotY + hallBotY) / 2 + 3).toFixed(1) + '" font-size="7.2" font-weight="800" fill="#5d686d">' + (es ? 'Pasillo 41-1/4"' : 'Hall 41-1/4"') + "</text>" +

      // Bookcase Door Closed (ghost inside jamb) + Swung 90° Open South into Hallway!
      '<rect x="' + openX + '" y="' + wallTopY + '" width="' + doorLenPx + '" height="' + caseDpx + '" fill="#e4f0e6" fill-opacity="0.55" stroke="#2f6b3f" stroke-width="1.2" stroke-dasharray="3 2"/>' +
      '<rect x="' + openX + '" y="' + wallBotY + '" width="' + caseDpx + '" height="' + doorLenPx + '" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1.8"/>' +
      '<path d="M ' + (openX + doorLenPx).toFixed(1) + " " + wallBotY + " A " + doorLenPx + " " + doorLenPx + " 0 0 1 " + openX + " " + (wallBotY + doorLenPx).toFixed(1) + '" fill="none" stroke="#1f5f7a" stroke-width="1.6" stroke-dasharray="4 3"/>' +
      '<circle cx="' + (openX + 2) + '" cy="' + (wallBotY + 2) + '" r="3.5" fill="#1f5f7a"/>' +

      // Right-hand Legend & Coupled Clearance Box (completely clear of deep closet & hallway!)
      '<rect x="266" y="44" width="180" height="248" rx="6" fill="#f4f5f3" stroke="#c5ccc9" stroke-width="1.1"/>' +
      '<text x="278" y="64" font-size="8" font-weight="800" fill="#1f5f7a">' + (es ? "PROPORCIÓN REAL (MD-1)" : "TRUE SCALE CHECK (MD-1)") + "</text>" +
      '<text x="278" y="82" font-size="7.4" font-weight="700" fill="#1d2326">• ' + (es ? 'Clóset: 36-5/16" × 82-5/8" (~2.28:1)' : 'Closet: 36-5/16" W × 82-5/8" D') + "</text>" +
      '<text x="278" y="98" font-size="7.4" font-weight="700" fill="#2f6b3f">• ' + (es ? 'LG: 27"×30-3/8" (≥4" atrás, ≥1" lados)' : 'LG: 27"×30-3/8" (≥4" rear, ≥1" sides)') + "</text>" +
      '<text x="278" y="114" font-size="7.4" font-weight="700" fill="#2f6b3f">• ' + (es ? 'Espacio frontal libre: ~4 pies (48")' : 'Front floor space: ~4 ft (48" clear)') + "</text>" +
      '<line x1="278" y1="128" x2="434" y2="128" stroke="#d9dedc" stroke-width="1"/>' +
      '<text x="278" y="146" font-size="8" font-weight="800" fill="#9a5b06">' + (es ? "GIRO 90° HACIA EL PASILLO" : "90° OUT-SWING INTO HALL") + "</text>" +
      '<text x="278" y="164" font-size="7.4" font-weight="700" fill="#1d2326">• ' + (es ? "Fondo librero: " : "Case depth: ") + fmtIn(m.depth) + "</text>" +
      '<text x="278" y="179" font-size="7.4" font-weight="700" fill="#1d2326">• ' + (es ? "Repisa útil: ~" : "Usable shelf: ~") + fmtIn(m.shelfDepth) + "</text>" +
      '<text x="278" y="194" font-size="7.4" font-weight="700" fill="#1f5f7a">• ' + (es ? 'Pasillo libre: 41-1/4"' : 'Hallway clear: 41-1/4"') + "</text>" +
      '<text x="278" y="209" font-size="7.4" font-weight="800" fill="#2f6b3f">• ' + (es ? "Paso libre al abrir: ~" : "Pass clear open: ~") + fmtIn(m.hallPassLeft) + "</text>" +
      '<text x="278" y="226" font-size="6.8" fill="#5d686d">' + (es ? "Pivote izquierdo · Presiona derecha" : "Left pivot · Press right edge to open") + "</text>" +
      '<rect x="276" y="242" width="160" height="38" rx="4" fill="#f7ecd9" stroke="#9a5b06" stroke-width="0.9"/>' +
      '<text x="356" y="256" text-anchor="middle" font-size="6.8" font-weight="800" fill="#9a5b06">' + (es ? "OBLIGATORIO ANTES DE CORTAR:" : "REQUIRED BEFORE DRILLING:") + "</text>" +
      '<text x="356" y="269" text-anchor="middle" font-size="6.6" font-weight="700" fill="#1d2326">' + (es ? "Plantilla de cartón a tamaño real" : "Full-size cardboard swing mockup") + "</text>" +

      '<text x="230" y="314" text-anchor="middle" font-size="7.4" font-weight="700" fill="#5d686d">' +
        (es ? "Escala estricta 1:1 (2.0 px/pulg en X y Y) · Alineado con MD-1 y planta Unidad 4"
            : "Strict 1:1 true scale (2.0 px/in in X & Y) · Matches MD-1 & Unit 4 floor plan") +
      "</text>" +
    "</svg>";
  }

  function renderVentsSvg(es) {
    return '<svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="9.4" font-weight="800" fill="#1f5f7a">' +
        (es ? "REJILLAS DE VENTILACIÓN LG WASHTOWER (GAS) Y APERTURA INTERIOR" : "LG GAS WASHTOWER LOUVER VENTS & INSIDE SAFETY RELEASE") + "</text>" +
      '<rect x="150" y="30" width="120" height="170" rx="4" fill="#fbfcfb" stroke="#1f5f7a" stroke-width="2"/>' +
      '<rect x="168" y="42" width="84" height="28" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.8"/>' +
      '<text x="210" y="54" text-anchor="middle" font-size="7.8" font-weight="800" fill="#2f6b3f">' + (es ? "Rejilla alta" : "Upper Vent") + "</text>" +
      '<text x="210" y="65" text-anchor="middle" font-size="7.2" font-weight="700" fill="#2f6b3f">≥ 48 sq in net</text>' +
      '<text x="282" y="58" font-size="7.8" font-weight="800" fill="#2f6b3f">' + (es ? 'Altura ≥ 72" (plan 72-1/2")' : 'Height ≥ 72" (plan 72-1/2")') + "</text>" +
      '<rect x="234" y="106" width="22" height="10" rx="3" fill="#a8281c"/>' +
      '<text x="282" y="114" font-size="8" font-weight="800" fill="#a8281c">' + (es ? 'Manija interior de emergencia (~40")' : 'Inside safety release (~40" high)') + "</text>" +
      '<rect x="168" y="160" width="84" height="28" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.8"/>' +
      '<text x="210" y="172" text-anchor="middle" font-size="7.8" font-weight="800" fill="#2f6b3f">' + (es ? "Rejilla baja" : "Lower Vent") + "</text>" +
      '<text x="210" y="183" text-anchor="middle" font-size="7.2" font-weight="700" fill="#2f6b3f">≥ 24 sq in net</text>' +
      '<text x="282" y="176" font-size="7.8" font-weight="800" fill="#2f6b3f">' + (es ? 'Tope ≤ 12" (plan 7")' : 'Top ≤ 12" (plan 7")') + "</text>" +
      '<rect x="18" y="84" width="118" height="58" rx="7" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.2"/>' +
      '<text x="77" y="104" text-anchor="middle" font-size="8.4" font-weight="800" fill="#1f5f7a">' + (es ? "TOTAL MÍNIMO" : "TOTAL MINIMUM") + "</text>" +
      '<text x="77" y="120" text-anchor="middle" font-size="11" font-weight="800" fill="#2f6b3f">≥ 100 sq in</text>' +
      '<text x="77" y="133" text-anchor="middle" font-size="7" fill="#5d686d">' + (es ? "área libre neta" : "net free airflow") + "</text>" +
    "</svg>";
  }

  function renderEquip(es) {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="murEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "🔧 Equipo y suministros " : "🔧 Equipment & Supplies ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="murEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Herrajes requeridos" : "Required Hardware") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? "Kit de pivote Murphy Door (medir grosor real T + Bt antes de cortar)" : "Murphy Door Single Hidden Door Hardware Kit (measure actual T + Bt stack first)") + "</li>" +
              "<li>" + (es ? "Seguro de empuje negro Sugatsune ML-ZN80-BL (~40\" alto)" : "Sugatsune ML-ZN80-BL black push latch (~40\" height)") + "</li>" +
              "<li>" + (es ? "Manija de liberación interior + rejillas de ventilación (≥100 sq in neto)" : "Inside safety release handle + louver vents (≥100 sq in total net)") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Madera y acabado" : "Woodwork & Finish") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? 'Triplay para pintar + 4 repisas fijas con labio 1-1/2" (3/4" arriba)' : 'Paint-grade ply carcass + 4 fixed shelves w/ 1-1/2" retaining lips') + "</li>" +
              "<li>" + (es ? "Marco frontal de álamo sólido (poplar) · color Chantilly Lace OC-65" : "Solid poplar face frame · Chantilly Lace OC-65 woodwork (sheen TBD)") + "</li>" +
              "<li>" + (es ? "Cartón grande para plantilla de prueba de giro 90° antes de cortar" : "Large cardboard sheet for mandatory full-size 90° swing mockup") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function buildGuidanceHtml(m, es) {
    var f = FIELD_MAP[state.activeField] || FIELDS[0];
    var parts = [];
    parts.push('<div><strong>' + esc(es ? f.es : f.en) + ':</strong> ' + esc(es ? f.guideEs : f.guideEn) + "</div>");

    // When both diagonals A & B are validly entered, show live |A - B| + lean/rack carpentry help!
    if (m.diagDiff != null) {
      if (m.squareOk) {
        parts.push('<div style="margin-top:6px;color:var(--lock);font-weight:600">' +
          (es ? "✓ Escuadra confirmada: |Diag A − Diag B| = " + fmtIn(m.diagDiff) + " (≤ 1/8\"). El marco está a escuadra — puedes construir la caja recta al menor ancho/alto."
              : "✓ Frame is square: |Diag A − Diag B| = " + fmtIn(m.diagDiff) + " (≤ 1/8\"). Build bookcase straight to the smallest measured width & height.") +
        "</div>");
      } else {
        var dirTxtEn = m.leanDir === "left"
          ? "Top of frame leans LEFT (West toward Bathroom A) because Diag A (TL→BR) is longer than Diag B (TR→BL)."
          : "Top of frame leans RIGHT (East toward Bedroom C) because Diag B (TR→BL) is longer than Diag A (TL→BR).";
        var dirTxtEs = m.leanDir === "left"
          ? "La parte superior del marco se inclina a la IZQUIERDA (Oeste hacia Baño A) porque Diag A es mayor que Diag B."
          : "La parte superior del marco se inclina a la DERECHA (Este hacia Recámara C) porque Diag B es mayor que Diag A.";
        parts.push('<div style="margin-top:6px;color:var(--crimson);font-weight:600">' +
          (es ? "⚠ Descuadre de " + fmtIn(m.diagDiff) + " (> 1/8\"): " + dirTxtEs + " Acción de carpintería: NO cortes a medida nominal — descuenta el desplome en el ancho inscrito o cepilla/calza el marco frontal y prueba primero en plantilla de cartón."
              : "⚠ Out of square by " + fmtIn(m.diagDiff) + " (> 1/8\"): " + dirTxtEn + " Carpentry action: reduce inscribed box width or plan face-frame scribing/shimming, and verify swing with full-size cardboard mockup before cutting wood.") +
        "</div>");
      }
    }
    return parts.join("");
  }

  function updateMeasureLive() {
    var es = isEs();
    var m = computeMath();

    // Update SVG in place without wiping inputs, zoom stage, or dropped pins!
    var svgHost = document.getElementById("murSvgHost");
    if (svgHost) {
      var oldSvg = svgHost.querySelector("svg");
      if (oldSvg) {
        oldSvg.outerHTML = renderDoorwayElevationSvg(m, es);
      } else {
        svgHost.innerHTML = renderDoorwayElevationSvg(m, es);
      }
      wireSvgPillPickers();
    }

    // Update KPI readouts in place
    var kCount = document.getElementById("murKpiCount");
    var kCountSub = document.getElementById("murKpiCountSub");
    if (kCount) {
      kCount.className = "u4h-kpi-val " + (m.hasAnyInvalid ? "is-fail" : (m.filledCount === 9 ? "is-ok" : "is-warn"));
      kCount.textContent = m.filledCount + " / 9";
    }
    if (kCountSub) {
      kCountSub.textContent = m.hasAnyInvalid
        ? (es ? "Revisar medidas marcadas" : "Check highlighted inputs")
        : (m.filledCount === 9 ? (es ? "Todas completas" : "All 9 entered") : (es ? "Faltan medidas" : "Hold until 9/9"));
    }

    var kSq = document.getElementById("murKpiSq");
    var kSqSub = document.getElementById("murKpiSqSub");
    var sqText = m.dInvalid
      ? (es ? "Revisar diag. (60\"–110\")" : "Check diag (60\"–110\")")
      : (m.diagDiff == null
          ? (es ? "Medir diagonales" : "Enter diagonals")
          : (m.squareOk
              ? (es ? "✓ Escuadrado (" + fmtIn(m.diagDiff) + ")" : "✓ Square (" + fmtIn(m.diagDiff) + ")")
              : (es ? "⚠ Descuadrado (" + fmtIn(m.diagDiff) + ")" : "⚠ Out of square (" + fmtIn(m.diagDiff) + ")")));
    if (kSq) {
      kSq.className = "u4h-kpi-val " + ((m.dInvalid || m.squareOk === false) ? "is-fail" : (m.squareOk === true ? "is-ok" : "is-warn"));
      kSq.textContent = sqText;
    }
    if (kSqSub) {
      kSqSub.textContent = m.leanDir
        ? (m.leanDir === "left" ? (es ? "Inclinado a la izq. (Oeste)" : "Leans left at top (West)") : (es ? "Inclinado a la der. (Este)" : "Leans right at top (East)"))
        : (es ? "Tolerancia ≤ 1/8\"" : "Tolerance ≤ 1/8\"");
    }

    var kBox = document.getElementById("murKpiBox");
    var kBoxSub = document.getElementById("murKpiBoxSub");
    if (kBox) {
      kBox.className = "u4h-kpi-val " + (m.hasAnyInvalid ? "is-fail" : "is-info");
      kBox.textContent = (m.caseW != null && !m.hasAnyInvalid ? fmtIn(m.caseW) : "—") + " × " + (m.caseH != null && !m.hasAnyInvalid ? fmtIn(m.caseH) : "—");
    }
    if (kBoxSub) {
      kBoxSub.textContent = m.hasAnyInvalid
        ? (es ? "En pausa — corregir medida" : "Held — fix invalid reading")
        : (es ? "Resta juegos y bisagras" : "Minus gaps & hinge stack");
    }

    // Update [P1-U5] invalid banner & Door A guard banner
    var invEl = document.getElementById("murInvalidBanner");
    if (invEl) {
      invEl.hidden = !m.hasAnyInvalid;
      invEl.textContent = es
        ? '⛔ Revisar medida fuera de rango (Ancho 18"–48" · Alto 60"–96" · Diagonales 60"–110" · Jamba 2"–12"). El cálculo de corte queda en — × — hasta corregir.'
        : '⛔ Check reading (18"–48" W / 60"–96" H / 60"–110" Diag / 2"–12" Jamb). Calculated box size is held at — × — until all entered numbers are in range.';
    }
    var doorAEl = document.getElementById("murDoorABanner");
    if (doorAEl) doorAEl.hidden = !m.looksLikeDoorA;

    // Update R4 live guidance box
    var gEl = document.getElementById("murGuidanceBox");
    if (gEl) gEl.innerHTML = buildGuidanceHtml(m, es);

    // Update active/invalid classes & inline error text on every .u4h-field WITHOUT touching <input> value/focus!
    FIELDS.forEach(function (f) {
      var wrap = document.getElementById("murFieldWrap_" + f.k);
      var err = document.getElementById("murFieldErr_" + f.k);
      if (!wrap) return;
      var st = m.parsed[f.k];
      wrap.classList.toggle("is-active", state.activeField === f.k);
      wrap.classList.toggle("is-invalid", !!(st && st.invalid));
      if (err) {
        err.hidden = !(st && st.invalid);
        err.textContent = es ? ("Rango: " + f.min + '"–' + f.max + '"') : ("Range: " + f.min + '"–' + f.max + '"');
      }
    });
  }

  function wireSvgPillPickers() {
    var svg = document.getElementById("murElevSvg");
    if (!svg) return;
    svg.querySelectorAll("[data-pick-mf]").forEach(function (g) {
      g.addEventListener("click", function () {
        var k = g.getAttribute("data-pick-mf");
        state.activeField = k;
        updateMeasureLive();
        var inp = document.getElementById("mur_" + k);
        if (inp) inp.focus();
      });
    });
  }

  function render() {
    var host = document.getElementById("u4hBody");
    var holdEl = document.getElementById("u4hHoldStrip");
    if (!host) return;
    var es = isEs();
    var m = computeMath();
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip is-danger";
      holdEl.innerHTML = es
        ? "<strong>NO CORTAR MADERA NI PERFORAR TODAVÍA:</strong> Completa las 9 medidas interiores de la <strong>Puerta Central B</strong> (NUNCA Puerta A del Baño 27-1/4\" × 79-3/8\"), aprueba giro doble (55\" puerta LG abierta), pausa cortes de respaldo/rejillas hasta validar área libre y <strong>mete la LG WashTower ANTES de colgar la puerta</strong>."
        : "<strong>DO NOT CUT WOOD OR DRILL PIVOTS YET:</strong> Enter all 9 inside-jamb measurements of <strong>Middle Doorway B</strong> (NEVER Bathroom Door A: 27-1/4\" × 79-3/8\"), pass the dual-door swing mockup (LG 55\" open-door depth), hold back/grille cuts for rated free-area review, and <strong>move LG WashTower into closet BEFORE hanging door</strong>.";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Measure Middle Doorway B (9 Points · R4)";
    var titleEs = "Medir Puerta Central B (9 Puntos · R4)";
    var subEn = "Tap any input (1–9) to highlight the exact tape path on Doorway B and calculate squareness & box size live";
    var subEs = "Toca cualquier campo (1–9) para resaltar la ruta exacta de la cinta en Puerta B y calcular escuadra y corte";
    var inner = "";

    if (state.step === "measure") {
      inner =
        '<div class="u4h-photo-grid">' +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/hallway-doorway-b-photo.png" alt="' + esc(es ? "Foto real del pasillo mostrando Puertas A, B y C" : "Real hallway photo showing Doors A, B, and C") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Foto real — ¿Cuál puerta medir?" : "Real photo — Which door to measure:") + "</strong> " +
              (es ? "Mide SOLO la Puerta Central B (lavandería). NO medir Puerta A (baño a la izquierda)." : "Measure ONLY Middle Doorway B (laundry). NEVER measure Bathroom Door A on left.") +
            "</div>" +
          "</div>" +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/murphy-bookcase-concept.png" alt="' + esc(es ? "Referencia visual del librero empotrado" : "Built-in bookcase visual goal") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Objetivo visual (Chantilly Lace):" : "Visual goal (Chantilly Lace):") + "</strong> " +
              (es ? "Librero limpio conservando corona y chambranas originales intactas." : "Clean built-in look while preserving existing original crown and casings.") +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Lecturas válidas" : "Valid readings") + "</div>" +
            '<div id="murKpiCount" class="u4h-kpi-val is-warn">' + m.filledCount + " / 9</div>" +
            '<div id="murKpiCountSub" class="u4h-kpi-sub">' + (es ? "Faltan medidas" : "Hold until 9/9") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Escuadra (Diag A–B)" : "Squareness (Diag A–B)") + "</div>" +
            '<div id="murKpiSq" class="u4h-kpi-val is-warn">' + (es ? "Medir diagonales" : "Enter diagonals") + "</div>" +
            '<div id="murKpiSqSub" class="u4h-kpi-sub">' + (es ? "Tolerancia ≤ 1/8\"" : "Tolerance ≤ 1/8\"") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Corte estimado caja" : "Calculated box size") + "</div>" +
            '<div id="murKpiBox" class="u4h-kpi-val is-info">— × —</div>' +
            '<div id="murKpiBoxSub" class="u4h-kpi-sub">' + (es ? "Resta juegos y bisagras" : "Minus gaps & hinge stack") + "</div>" +
          "</div>" +
        "</div>" +

        '<div id="murInvalidBanner" class="u4h-status is-fail" hidden></div>' +
        '<div id="murDoorABanner" class="u4h-status is-fail"' + (m.looksLikeDoorA ? "" : " hidden") + ">" +
          (es ? "⛔ ¡ALERTA! Esas medidas parecen de la PUERTA A DEL BAÑO (27-1/4\" × 79-3/8\"). Verifica que estás midiendo la PUERTA CENTRAL B."
              : "⛔ WARNING! Those numbers match BATHROOM DOOR A (27-1/4\" × 79-3/8\"). Double-check that you are measuring MIDDLE DOORWAY B!") +
        "</div>" +

        '<div id="murSvgHost" class="u4h-svg-wrap">' + renderDoorwayElevationSvg(m, es) + "</div>" +
        '<div id="murGuidanceBox" class="u4h-info-box">' + buildGuidanceHtml(m, es) + "</div>" +

        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-lbl">' + (es ? "Ingresa medidas de Puerta B (acepta decimales o fracciones, ej. 28-7/16):" : "Enter Doorway B inside-jamb readings (decimals or fractions, e.g. 28-7/16):") + "</div>" +
          '<div class="u4h-input-grid">' +
            FIELDS.map(function (f) {
              return '<div id="murFieldWrap_' + f.k + '" class="u4h-field' + (state.activeField === f.k ? " is-active" : "") + '">' +
                '<label for="mur_' + f.k + '">' + esc(es ? f.es : f.en) + "</label>" +
                '<input id="mur_' + f.k + '" data-mf="' + f.k + '" type="text" inputmode="decimal" placeholder="e.g. ' + esc(f.ph) + '" value="' + esc(state[f.k]) + '">' +
                '<span id="murFieldErr_' + f.k + '" class="u4h-field-err" hidden></span>' +
              "</div>";
            }).join("") +
          "</div>" +
          '<div class="u4h-cta-row">' +
            '<button type="button" class="u4h-action-btn" id="murSendBtn">' + (es ? "📝 Enviar medidas al PM / Tisa" : "📝 Send 9-point readings to PM / Tisa") + "</button>" +
          "</div>" +
        "</div>";

    } else if (state.step === "swing") {
      titleEn = "90° Out-Swing, True-Scale Deep Closet & Wall A–B";
      titleEs = "Giro 90° Afuera, Clóset Escala 1:1 y Muro A–B";
      subEn = 'Strict 1:1 scale (36-5/16" W × 82-5/8" deep closet + 41-1/4" hall) matching MD-1 & floor plan';
      subEs = 'Escala real 1:1 (clóset 36-5/16" × 82-5/8" fondo + pasillo 41-1/4") según MD-1 y planta';

      inner =
        '<div class="u4h-svg-wrap">' + renderSwingPlanSvg(m, es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Fondo del librero (confirmar con cartón):" : "Bookcase depth (confirm with cardboard mockup):") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.depthOpt === "8.25" ? " is-active" : "") + '" data-depth="8.25">' + (es ? '8-1/4" estándar (repisa 7-3/16")' : '8-1/4" standard (7-3/16" shelf)') + "</button>" +
              '<button type="button" class="u4h-pill' + (state.depthOpt === "9.0625" ? " is-active" : "") + '" data-depth="9.0625">' + (es ? '9-1/16" más hondo (repisa 8")' : '9-1/16" deeper (8" shelf)') + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Actualización importante del Muro A–B" : "Important Wall A–B Framing Note") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li>" + (es ? "Los planos antiguos suponían puerta corrediza de baño dentro del muro A–B. Esa corrediza fue pospuesta — revisa el bastidor real del muro A–B en obra antes de colocar refuerzos para el pivote izquierdo." : "Older drawings assumed a sliding bathroom pocket door inside Wall A–B. That pocket door was deferred — verify actual Wall A–B studs on site before anchoring left pivot blocking.") + "</li>" +
            "<li>" + (es ? "El librero pivota a la izquierda abriendo hacia el pasillo: presiona el borde derecho hacia adentro para liberar el seguro y jala hacia afuera." : "Left-pivot out-swing into hallway: press the right edge inward to release the push latch, then pull outward.") + "</li>" +
          "<li><strong>" + (es ? "Giro doble (55\" puerta abierta) y orden obligatorio:" : "Dual-door swing (55\" open depth) & mandatory sequence:") + "</strong> " + (es ? "En la maqueta verifica acceso y giro con AMBAS puertas abiertas (LG WKG101HVA mide 55\" de fondo con puerta abierta + 4\" atrás = 59\" dentro del clóset de 82-5/8\"). METER la LG WashTower al clóset ANTES de colgar la puerta librero Murphy." : "During mockup verify move-in, service access & full swing with BOTH bookcase door and LG WKG101HVA doors open (55\" depth with door open + 4\" rear = 59\" inside 82-5/8\" closet). MOVE LG WashTower into closet BEFORE hanging Murphy bookcase door.") + "</li>" +
          "</ul>" +
        "</div>";

    } else if (state.step === "vents") {
      titleEn = "LG Gas WashTower Vents & Safety Release";
      titleEs = "Ventilación LG WashTower (Gas) y Apertura Interior";
      subEn = "HOLD back & grille cuts until rated free-area review passes (LG WKG101HVA delivery Tue Dec 1 — delivery only, verify rating plate)";
      subEs = "PAUSAR cortes de respaldo y rejillas hasta validar área libre real (entrega LG mar 1 dic — solo entrega, revisar placa)";

      inner =
        '<div class="u4h-svg-wrap">' + renderVentsSvg(es) + "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Requisitos de seguridad y equipo" : "Appliance & Code Requirements") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li><strong>LG WKG101HVA:</strong> 27\" W × 30-3/8\" D × 74-3/8\" H (" + (es ? '55" fondo con puerta abierta, mín. 1" lados, 4" atrás; referencia Samsung retirada; revisar placa el mar 1 dic' : '55" depth w/ door open, min 1" sides, 4" rear; legacy Samsung retired; verify rating plate on Tue Dec 1 delivery') + ").</li>" +
            "<li><strong>" + (es ? "Ventilación obligatoria:" : "Mandatory combustion/dryer airflow:") + "</strong> " + (es ? 'PAUSAR corte de respaldo/rejillas hasta confirmar con librero cerrado y cargado usando ÁREA LIBRE EFECTIVA de rejilla (no marco exterior): LG ≥ 48 sq in arriba (≥ 6 pies / 72" NPT) + ≥ 24 sq in abajo (≤ 1 pie / 12" NPT); CMC 2025 §504.4.1 exige 100 sq in netos (independiente del ducto exterior de secadora).' : 'HOLD bookcase back & grille cuts until reviewer confirms unobstructed openings with bookcase closed & loaded using RATED FREE/OPEN GRILLE AREA (not outside frame size): LG ≥ 48 sq in upper (≥ 6 ft / 72" AFF) + ≥ 24 sq in lower (≤ 1 ft / 12" AFF); 2025 CMC §504.4.1 requires 100 sq in net makeup air (separate from exterior dryer exhaust).') + "</li>" +
            "<li><strong>" + (es ? "Manija interior:" : "Inside release:") + "</strong> " + (es ? "Obligatoria para poder abrir desde adentro del clóset en cualquier momento." : "Required so nobody can ever get trapped inside the laundry closet.") + "</li>" +
          "</ul>" +
        "</div>";

    } else {
      titleEn = "Original Trim Protection, Hardware & Supplies";
      titleEs = "Protección de Molduras, Herrajes y Suministros";
      subEn = "Keep Edwardian hallway woodwork untouched while building a tight custom bookcase door";
      subEs = "Conservar intacta la carpintería Edwardian original mientras se arma la puerta librero";

      inner =
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Reglas de acabado y herrajes" : "Finish & Hardware Rules") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li>" + (es ? "Conservar intactas la moldura corona original del pasillo, las chambranas de Puertas A/B/C y el zoclo." : "Keep original hallway crown molding, Door A/B/C casings, and baseboards completely untouched.") + "</li>" +
            "<li>" + (es ? "Verificar entrega física del kit de pivotes Murphy Door y medir el espesor real de las bisagras (T + Bt) antes de cortar la altura." : "Confirm physical delivery of the Murphy Door hardware kit and measure actual hinge stack (T + Bt) before cutting box height.") + "</li>" +
            "<li>" + (es ? "Acabado pintado en Chantilly Lace OC-65 (brillo por confirmar por Tisa)." : "Paint-grade woodwork in Chantilly Lace OC-65 (final sheen to be confirmed by Tisa).") + "</li>" +
          "</ul>" +
        "</div>" +
        renderEquip(es);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="murPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + (es ? "Anterior" : "Prev") + "</button>" +
      '<span class="u4h-pager-count">' + (es ? "Paso " : "Step ") + (idx + 1) + (es ? " de " : " of ") + STEPS.length + "</span>" +
      '<button type="button" id="murNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + (es ? "Siguiente" : "Next") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(es ? titleEs : titleEn) + "</div>" +
            '<div class="u4h-sub">' + esc(es ? subEs : subEn) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">' + (es ? "Puerta B · R4" : "Door B · R4") + "</span>" +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); render(); window.scrollTo(0, 0); });
    });

    if (state.step === "measure") {
      host.querySelectorAll("[data-mf]").forEach(function (inp) {
        var k = inp.getAttribute("data-mf");
        inp.addEventListener("focus", function () {
          state.activeField = k;
          updateMeasureLive();
        });
        inp.addEventListener("input", function () {
          state.activeField = k;
          state[k] = inp.value;
          updateMeasureLive();
        });
      });
      updateMeasureLive();
    }

    host.querySelectorAll("[data-depth]").forEach(function (b) {
      b.addEventListener("click", function () { state.depthOpt = b.getAttribute("data-depth"); render(); });
    });
    var eqBtn = document.getElementById("murEquipBtn");
    if (eqBtn) eqBtn.addEventListener("click", function () { state.equipOpen = !state.equipOpen; render(); });
    var sendBtn = document.getElementById("murSendBtn");
    if (sendBtn) sendBtn.addEventListener("click", function () {
      if (window.U4LiveAi) {
        var summary = "Murphy Door B 9-point readings: W=" + [state.b7, state.b8, state.b9].join("/") +
          ", H=" + [state.b10, state.b11, state.b12].join("/") +
          ", Diag=" + state.b13 + "/" + state.b14 + ", Jamb=" + state.b15;
        window.U4LiveAi.openNote(summary);
      }
    });
    var pBtn = document.getElementById("murPrevBtn");
    var nBtn = document.getElementById("murNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });

    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext();
    }
  }

  function applyMurphyView(args) {
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
        var map = { r4: "measure", door: "measure", closet: "swing", depth: "swing", airflow: "vents", laundry: "vents", supplies: "trim" };
        var id = map[s] || s;
        if (STEPS.some(function (x) { return x.id === id; })) { state.step = id; changed = true; }
      }
    }
    if (changed) render();
    return changed;
  }

  window.U4PlanControl = {
    showView: function (args) { return applyMurphyView(args); },
    applyChange: function (args) {
      args = args || {};
      var act = String(args.action || args.target || "").toLowerCase();
      var val = args.value;
      if (act === "depth" || act === "bookcase_depth") {
        var ds = String(val);
        if (ds === "8.25" || ds === "9.0625") state.depthOpt = ds;
        else return false;
        render();
        return true;
      }
      if (act === "focus_pt" || act === "point") {
        var idxPt = Number(val);
        if (idxPt >= 1 && idxPt <= 9) {
          state.step = "measure";
          state.activeField = "b" + (6 + idxPt);
          render();
          return true;
        }
        return false;
      }
      if (/^b(7|8|9|10|11|12|13|14|15)$/.test(act)) {
        state.step = "measure";
        state.activeField = act;
        state[act] = String(val == null ? "" : val);
        render();
        return true;
      }
      if (act === "measure" && val && typeof val === "object") {
        state.step = "measure";
        Object.keys(val).forEach(function (k) {
          if (/^b(7|8|9|10|11|12|13|14|15)$/.test(k)) state[k] = String(val[k]);
        });
        render();
        return true;
      }
      if (act === "reset") {
        ["b7","b8","b9","b10","b11","b12","b13","b14","b15"].forEach(function (k) { state[k] = ""; });
        state.depthOpt = "8.25";
        state.activeField = "b7";
        render();
        return true;
      }
      return false;
    },
    getState: function () {
      var m = computeMath();
      return {
        planId: "murphy-door",
        step: state.step,
        wall: "hallway_door_b",
        activeField: state.activeField,
        filledCount: m.filledCount,
        depthOpt: state.depthOpt,
        caseW: m.caseW,
        caseH: m.caseH,
        summary: "Murphy Bookcase Door (Hallway B): step=" + state.step + ", activePt=" + state.activeField + ", readings=" + m.filledCount + "/9, depth=" + fmtIn(m.depth) + "."
      };
    }
  };

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "murphy-door",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { render(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); }
      });
      var bp = window.U4PlanNav.getBootParams ? window.U4PlanNav.getBootParams() : {};
      if (bp.step) applyMurphyView(bp);
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "murphy-door",
        room: "laundry",
        titleEn: "Murphy Bookcase Door (Hallway B)",
        titleEs: "Puerta Librero Murphy (Pasillo B)",
        getContext: function () {
          var m = computeMath();
          return "Step=" + state.step + ", ActivePoint=" + state.activeField + ", ValidReadings=" + m.filledCount + "/9, CaseEst=" + fmtIn(m.caseW) + "x" + fmtIn(m.caseH) + ", Depth=" + fmtIn(m.depth) + ", Hard hold until all 9 inside-jamb readings of Middle Doorway B (never Bathroom Door A) + cardboard mockup pass.";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Cómo tomo las 9 medidas de Puerta B?", "¿Qué significa si Diagonal A es mayor que B?", "¿Cuánta ventilación pide la LG WashTower?"]
            : ["How do I take the 9 measurements of Door B?", "What if Diagonal A is longer than Diagonal B?", "What louver vent size does the LG WashTower need?"];
        }
      });
    }
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
