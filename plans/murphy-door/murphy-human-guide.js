/* ============================================================================
   Murphy Bookcase Door (Hallway B) — Real-World Human-First Interactive Guide
   Interactive 9-Point R4 Segment Highlighter · Diag A/B Lean & Scribing Guide
   Strict [P1-U5] Range Validation · Strict 1:1 True-Scale Deep Closet (MD-1)
   Zero External CDNs · Zero Prices · Zero Backend Clutter · EN / MX-ES / RU
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "measure", en: "1. Measure Door B", es: "1. Medir Puerta B", ru: "1. Замер проёма B" },
    { id: "swing", en: "2. 90° Swing & Depth", es: "2. Giro 90° y Fondo", ru: "2. Открывание 90° и глубина" },
    { id: "vents", en: "3. Laundry Vents", es: "3. Rejillas Lavadora", ru: "3. Вентиляция прачечной" },
    { id: "trim", en: "4. Trim & Supplies", es: "4. Molduras y Kit", ru: "4. Наличники и материалы" }
  ];

  var FIELDS = [
    {
      k: "b7", num: 1, kind: "w", min: 18, max: 48, ph: "28-7/16",
      en: "1. Top width", es: "1. Ancho arriba", ru: "1. Ширина вверху",
      guideEn: "Hook tape inside left wood jamb just below the head jamb → measure straight across to inside right wood jamb (exclude outside trim).",
      guideEs: "Engancha la cinta por dentro de la jamba izquierda justo debajo del cabezal → mide en línea recta a la jamba derecha (sin molduras exteriores).",
      guideRu: "Зацепите рулетку за внутреннюю грань левой стойки коробки сразу под притолокой → измерьте строго по горизонтали до правой стойки (без наружных наличников)."
    },
    {
      k: "b8", num: 2, kind: "w", min: 18, max: 48, ph: "28-7/16",
      en: "2. Mid width", es: "2. Ancho medio", ru: "2. Ширина посередине",
      guideEn: "Measure horizontally across the middle (~40\" off floor) between the inside faces of the left and right wood jambs.",
      guideEs: "Mide horizontalmente al centro (~40\" del piso) entre las caras interiores de las jambas izquierda y derecha.",
      guideRu: "Измерьте горизонтально посередине проёма (~40\" от пола) между внутренними гранями левой и правой деревянных стоек коробки."
    },
    {
      k: "b9", num: 3, kind: "w", min: 18, max: 48, ph: "28-7/16",
      en: "3. Bottom width", es: "3. Ancho abajo", ru: "3. Ширина внизу",
      guideEn: "Measure horizontally just above the finished floor between the inside faces of both wood jambs (keep tape flat).",
      guideEs: "Mide horizontalmente justo arriba del piso terminado entre las caras interiores de ambas jambas (cinta plana).",
      guideRu: "Измерьте горизонтально сразу над чистовым полом между внутренними гранями обеих стоек коробки (держите ленту ровно)."
    },
    {
      k: "b10", num: 4, kind: "h", min: 60, max: 96, ph: "80-7/16",
      en: "4. Left height", es: "4. Alto izq.", ru: "4. Высота слева",
      guideEn: "Stand tape on finished floor along the LEFT (hinge-side) jamb straight up to the underside of the head jamb.",
      guideEs: "Apoya la cinta en el piso terminado junto a la jamba IZQUIERDA (lado pivote) hasta la cara inferior del cabezal.",
      guideRu: "Уприте рулетку в чистовой пол вдоль ЛЕВОЙ стойки (сторона поворотной петли) строго вверх до нижней грани притолоки."
    },
    {
      k: "b11", num: 5, kind: "h", min: 60, max: 96, ph: "80-7/16",
      en: "5. Center height", es: "5. Alto centro", ru: "5. Высота по центру",
      guideEn: "Stand tape on finished floor at the exact CENTER of Doorway B straight up to the underside of the head jamb.",
      guideEs: "Apoya la cinta en el piso terminado justo al CENTRO de la Puerta B hasta la cara inferior del cabezal.",
      guideRu: "Уприте рулетку в чистовой пол строго по ЦЕНТРУ проёма B вертикально вверх до нижней грани притолоки."
    },
    {
      k: "b12", num: 6, kind: "h", min: 60, max: 96, ph: "80-7/16",
      en: "6. Right height", es: "6. Alto der.", ru: "6. Высота справа",
      guideEn: "Stand tape on finished floor along the RIGHT (latch-side) jamb straight up to the underside of the head jamb.",
      guideEs: "Apoya la cinta en el piso terminado junto a la jamba DERECHA (lado seguro) hasta la cara inferior del cabezal.",
      guideRu: "Уприте рулетку в чистовой пол вдоль ПРАВОЙ стойки (сторона нажимной защёлки) строго вверх до нижней грани притолоки."
    },
    {
      k: "b13", num: 7, kind: "d", min: 60, max: 110, ph: "85-5/16",
      en: "7. Diagonal A (TL→BR)", es: "7. Diagonal A (SI→ID)", ru: "7. Диагональ А (ВЛ→НП)",
      guideEn: "Press tape hook tight into the TOP-LEFT inside corner → stretch straight to the BOTTOM-RIGHT inside corner at the floor.",
      guideEs: "Presiona la punta de la cinta en la esquina interior SUPERIOR-IZQUIERDA → estira recto a la esquina INFERIOR-DERECHA en el piso.",
      guideRu: "Плотно уприте зацеп рулетки во внутренний ВЕРХНИЙ ЛЕВЫЙ угол → натяните по прямой до НИЖНЕГО ПРАВОГО угла у пола."
    },
    {
      k: "b14", num: 8, kind: "d", min: 60, max: 110, ph: "85-5/16",
      en: "8. Diagonal B (TR→BL)", es: "8. Diagonal B (SD→II)", ru: "8. Диагональ Б (ВП→НЛ)",
      guideEn: "Press tape hook tight into the TOP-RIGHT inside corner → stretch straight to the BOTTOM-LEFT inside corner. Compare |A − B| (≤ 1/8\" is square).",
      guideEs: "Presiona la punta en la esquina interior SUPERIOR-DERECHA → estira recto a la esquina INFERIOR-IZQUIERDA. Compara |A − B| (≤ 1/8\" está a escuadra).",
      guideRu: "Плотно уприте зацеп во внутренний ВЕРХНИЙ ПРАВЫЙ угол → натяните до НИЖНЕГО ЛЕВОГО угла. Сравните |А − Б| (≤ 1/8\" — проём прямоугольный)."
    },
    {
      k: "b15", num: 9, kind: "j", min: 2, max: 12, ph: "4-3/4",
      en: "9. Jamb depth (J)", es: "9. Fondo jamba (J)", ru: "9. Глубина коробки (J)",
      guideEn: "Measure straight through the wood jamb from the hallway face to the laundry-closet face (EXCLUDE outside trim casings).",
      guideEs: "Mide el grosor de la jamba de madera desde la cara del pasillo hasta la cara del clóset (SIN contar chambranas exteriores).",
      guideRu: "Измерьте чистую глубину деревянной коробки от плоскости коридора до плоскости ниши прачечной (БЕЗ учёта наружных наличников)."
    }
  ];

  var FIELD_MAP = {};
  FIELDS.forEach(function (f) { FIELD_MAP[f.k] = f; });

  var state = {
    step: "measure",
    activeField: "b7",
    b7: "", b8: "", b9: "",
    b10: "", b11: "", b12: "",
    b13: "", b14: "",
    b15: "",
    hingeStack: 2.375,
    depthOpt: "8.25",
    equipOpen: false
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

  function parseIn(v) {
    var s = String(v == null ? "" : v).trim().replace(/"/g, "");
    if (!s) return { empty: true, num: null, badSyntax: false };
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

    var rawCaseW = (!hasAnyInvalid && minW != null) ? +(minW - 0.25 - 1.0).toFixed(4) : null;
    var rawCaseH = (!hasAnyInvalid && minH != null) ? +(minH - state.hingeStack).toFixed(4) : null;
    var caseW = (rawCaseW != null && rawCaseW > 0) ? rawCaseW : null;
    var caseH = (rawCaseH != null && rawCaseH > 0) ? rawCaseH : null;

    var diagA = parsed.b13.val;
    var diagB = parsed.b14.val;
    var diagDiff = (!dInvalid && diagA != null && diagB != null) ? +Math.abs(diagA - diagB).toFixed(4) : null;
    var squareOk = diagDiff != null ? diagDiff <= 0.125 : null;
    var leanDir = null;
    if (diagDiff != null && diagDiff > 0.125) {
      leanDir = diagA > diagB ? "left" : "right";
    }

    var depth = parseFloat(state.depthOpt);
    var shelfDepth = depth === 8.25 ? 7.1875 : 8.0;
    var doorSwingW = caseW != null ? caseW : 27.1875;
    var hallPassLeft = +(41.25 - doorSwingW).toFixed(2);

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

  function renderDoorwayElevationSvg(m) {
    var ready = m.filledCount === 9 && !m.hasAnyInvalid && m.squareOk !== false && !m.looksLikeDoorA;
    var strokeB = m.hasAnyInvalid ? "#a8281c" : (ready ? "#2f6b3f" : "#9a5b06");
    var wTxt = m.hasAnyInvalid ? "—" : (m.caseW != null ? fmtIn(m.caseW) : '27-3/16" ' + L("(prov.)", "(prov.)", "(предв.)"));
    var hTxt = m.hasAnyInvalid ? "—" : (m.caseH != null ? fmtIn(m.caseH) : '78-1/16" ' + L("(prov.)", "(prov.)", "(предв.)"));
    var af = state.activeField || "b7";

    var bx = 166, by = 56, bw = 104, bh = 166;
    var bx2 = bx + bw, by2 = by + bh;
    var bmx = bx + bw / 2, bmy = by + bh / 2;

    var segOverlay = "";
    var activeCol = "#a8281c";
    var diagACol = "#1f5f7a";
    var diagBCol = "#9a5b06";

    function arrowH(y, label, val) {
      return '<line x1="' + (bx + 2) + '" y1="' + y + '" x2="' + (bx2 - 2) + '" y2="' + y + '" stroke="' + activeCol + '" stroke-width="2.8" marker-start="url(#murArr)" marker-end="url(#murArr)"/>' +
        '<circle cx="' + (bx + 2) + '" cy="' + y + '" r="3.5" fill="' + activeCol + '"/>' +
        '<circle cx="' + (bx2 - 2) + '" cy="' + y + '" r="3.5" fill="' + activeCol + '"/>' +
        '<rect x="' + (bmx - 38) + '" y="' + (y - 16) + '" width="76" height="14" rx="3" fill="' + activeCol + '"/>' +
        '<text x="' + bmx + '" y="' + (y - 6.5) + '" text-anchor="middle" font-size="6.5" font-weight="800" fill="#ffffff">' + esc(label + (val ? " " + val : "")) + "</text>";
    }

    function arrowV(x, label, val) {
      var lx = x < bmx ? x + 22 : (x > bmx ? x - 22 : x);
      return '<line x1="' + x + '" y1="' + (by + 2) + '" x2="' + x + '" y2="' + (by2 - 2) + '" stroke="' + activeCol + '" stroke-width="2.8"/>' +
        '<circle cx="' + x + '" cy="' + (by + 2) + '" r="3.5" fill="' + activeCol + '"/>' +
        '<circle cx="' + x + '" cy="' + (by2 - 2) + '" r="3.5" fill="' + activeCol + '"/>' +
        '<rect x="' + (lx - 31) + '" y="' + (bmy - 8) + '" width="62" height="15" rx="3" fill="' + activeCol + '"/>' +
        '<text x="' + lx + '" y="' + (bmy + 2) + '" text-anchor="middle" font-size="6.5" font-weight="800" fill="#ffffff">' + esc(label + (val ? " " + val : "")) + "</text>";
    }

    var activeVal = m.parsed[af] && m.parsed[af].valid ? fmtIn(m.parsed[af].val) : "";

    if (af === "b7") segOverlay += arrowH(by + 16, L("#1 Top W", "#1 Ancho S", "#1 Верх Ш"), activeVal);
    else if (af === "b8") segOverlay += arrowH(bmy, L("#2 Mid W", "#2 Ancho M", "#2 Сер. Ш"), activeVal);
    else if (af === "b9") segOverlay += arrowH(by2 - 14, L("#3 Bot W", "#3 Ancho I", "#3 Низ Ш"), activeVal);
    else if (af === "b10") segOverlay += arrowV(bx + 14, L("#4 L Ht", "#4 Alto I", "#4 Лев. В"), activeVal);
    else if (af === "b11") segOverlay += arrowV(bmx, L("#5 C Ht", "#5 Alto C", "#5 Центр В"), activeVal);
    else if (af === "b12") segOverlay += arrowV(bx2 - 14, L("#6 R Ht", "#6 Alto D", "#6 Прав. В"), activeVal);

    var showA = af === "b13" || (m.diagA != null && m.diagB != null);
    var showB = af === "b14" || (m.diagA != null && m.diagB != null);
    if (showA) {
      var colA = af === "b13" ? activeCol : diagACol;
      segOverlay +=
        '<line x1="' + (bx + 3) + '" y1="' + (by + 3) + '" x2="' + (bx2 - 3) + '" y2="' + (by2 - 3) + '" stroke="' + colA + '" stroke-width="' + (af === "b13" ? 3 : 2.1) + '"/>' +
        '<circle cx="' + (bx + 3) + '" cy="' + (by + 3) + '" r="4.2" fill="' + colA + '"/>' +
        '<circle cx="' + (bx2 - 3) + '" cy="' + (by2 - 3) + '" r="4.2" fill="' + colA + '"/>' +
        '<rect x="' + (bx + 6) + '" y="' + (by + 18) + '" width="60" height="14" rx="3" fill="' + colA + '"/>' +
        '<text x="' + (bx + 36) + '" y="' + (by + 27.5) + '" text-anchor="middle" font-size="6.3" font-weight="800" fill="#ffffff">' + L("A: ", "A: ", "А: ") + (m.diagA != null ? fmtIn(m.diagA) : L("TL→BR", "SI→ID", "ВЛ→НП")) + "</text>";
    }
    if (showB) {
      var colB = af === "b14" ? activeCol : diagBCol;
      segOverlay +=
        '<line x1="' + (bx2 - 3) + '" y1="' + (by + 3) + '" x2="' + (bx + 3) + '" y2="' + (by2 - 3) + '" stroke="' + colB + '" stroke-width="' + (af === "b14" ? 3 : 2.1) + '" stroke-dasharray="' + (af === "b14" ? "none" : "5 3") + '"/>' +
        '<circle cx="' + (bx2 - 3) + '" cy="' + (by + 3) + '" r="4.2" fill="' + colB + '"/>' +
        '<circle cx="' + (bx + 3) + '" cy="' + (by2 - 3) + '" r="4.2" fill="' + colB + '"/>' +
        '<rect x="' + (bx2 - 66) + '" y="' + (by2 - 34) + '" width="60" height="14" rx="3" fill="' + colB + '"/>' +
        '<text x="' + (bx2 - 36) + '" y="' + (by2 - 24.5) + '" text-anchor="middle" font-size="6.3" font-weight="800" fill="#ffffff">' + L("B: ", "B: ", "Б: ") + (m.diagB != null ? fmtIn(m.diagB) : L("TR→BL", "SD→II", "ВП→НЛ")) + "</text>";
    }

    var jambHighlight = af === "b15";
    var jambBorder = jambHighlight ? "#a8281c" : "#c5ccc9";
    var jambBg = jambHighlight ? "#f9e6e4" : "#f4f5f3";
    var jambValTxt = m.jambDepth != null ? fmtIn(m.jambDepth) : L("Measure J", "Medir J", "Замер J");

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
      var suffix = f.k === "b13"
        ? L("DiagA", "DiagA", "ДиагА")
        : f.k === "b14"
          ? L("DiagB", "DiagB", "ДиагБ")
          : f.k === "b15"
            ? L("Jamb", "Jamba", "Короб")
            : (f.kind === "w" ? L("W", "A", "Ш") : L("H", "Alto", "В"));
      var lbl = f.num + "." + suffix;
      return '<g class="mur-svg-pill" data-pick-mf="' + f.k + '" style="cursor:pointer">' +
        '<rect x="' + rx + '" y="' + ry + '" width="54" height="15" rx="7.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1"/>' +
        '<text x="' + (rx + 27) + '" y="' + (ry + 10) + '" text-anchor="middle" font-size="6.1" font-weight="700" fill="' + tcol + '">' + lbl + "</text>" +
      "</g>";
    }).join("");

    return '<svg id="murElevSvg" viewBox="0 0 480 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(L("Interactive 9-point Doorway B elevation", "Elevación interactiva 9 puntos Puerta B", "Интерактивная схема 9 замеров проёма B")) + '">' +
      '<text x="240" y="17" text-anchor="middle" font-size="8.6" font-weight="800" fill="#1f5f7a">' +
        L(
          "HALLWAY FACING NORTH · ← WEST (Bath A) | CENTER (Murphy B) | EAST (Jamb / Points 1–9) →",
          "PASILLO AL NORTE · ← OESTE (Baño A) | CENTRO (Murphy B) | ESTE (Jamba / Puntos 1–9) →",
          "КОРИДОР (ВИД НА СЕВЕР) · ← ЗАПАД (Ванная A) | ЦЕНТР (Murphy B) | ВОСТОК (Короб / Точки 1–9) →"
        ) + "</text>" +

      '<rect x="14" y="25" width="268" height="12" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1"/>' +
      '<text x="148" y="34" text-anchor="middle" font-size="6.8" font-weight="800" fill="#2f6b3f">' + L("ORIGINAL CROWN MOLDING — KEEP UNTOUCHED", "MOLDURA CORONA ORIGINAL — NO TOCAR", "ОРИГИНАЛЬНЫЙ КАРНИЗ — НЕ ТРОГАТЬ") + "</text>" +

      '<rect x="20" y="56" width="72" height="166" fill="#f9e6e4" stroke="#a8281c" stroke-width="1.4"/>' +
      '<text x="56" y="122" text-anchor="middle" font-size="8.0" font-weight="800" fill="#a8281c">' + L("DOOR A", "PUERTA A", "ДВЕРЬ A") + "</text>" +
      '<text x="56" y="135" text-anchor="middle" font-size="7.2" fill="#a8281c">' + L("Bathroom", "Baño", "Ванная") + "</text>" +
      '<text x="56" y="148" text-anchor="middle" font-size="6.8" font-weight="800" fill="#a8281c">' + L("DO NOT USE", "NO MEDIR", "НЕ МЕРИТЬ") + "</text>" +

      '<rect x="98" y="56" width="60" height="166" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="4 2"/>' +
      '<text x="128" y="128" text-anchor="middle" font-size="7" font-weight="800" fill="#9a5b06">' + L("WALL A–B", "MURO A–B", "СТЕНА A–B") + "</text>" +
      '<text x="128" y="140" text-anchor="middle" font-size="6.2" fill="#9a5b06">' + L("Check framing", "Revisar bastidor", "Сверить стойки") + "</text>" +

      '<rect x="' + (bx - 5) + '" y="' + (by - 5) + '" width="' + (bw + 10) + '" height="' + (bh + 5) + '" fill="none" stroke="#2f6b3f" stroke-width="2.2"/>' +
      '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="#e3eef2" stroke="' + strokeB + '" stroke-width="2.2" stroke-dasharray="' + (ready ? "none" : "6 3") + '"/>' +
      '<line x1="' + (bx + 4) + '" y1="92" x2="' + (bx2 - 4) + '" y2="92" stroke="#1f5f7a" stroke-width="1" opacity="0.35"/>' +
      '<line x1="' + (bx + 4) + '" y1="126" x2="' + (bx2 - 4) + '" y2="126" stroke="#1f5f7a" stroke-width="1" opacity="0.35"/>' +
      '<line x1="' + (bx + 4) + '" y1="160" x2="' + (bx2 - 4) + '" y2="160" stroke="#1f5f7a" stroke-width="1" opacity="0.35"/>' +
      '<line x1="' + (bx + 4) + '" y1="194" x2="' + (bx2 - 4) + '" y2="194" stroke="#1f5f7a" stroke-width="1" opacity="0.35"/>' +
      '<circle cx="' + (bx + 5) + '" cy="' + (by + 7) + '" r="3" fill="#1f5f7a"/><circle cx="' + (bx + 5) + '" cy="' + (by2 - 7) + '" r="3" fill="#1f5f7a"/>' +
      '<circle cx="' + (bx2 - 5) + '" cy="142" r="3.4" fill="#a8281c"/>' +
      '<text x="' + bmx + '" y="48" text-anchor="middle" font-size="7.8" font-weight="800" fill="#1f5f7a">' + L("DOOR B (MURPHY)", "PUERTA B (MURPHY)", "ПРОЁМ B (MURPHY)") + "</text>" +
      '<text x="' + bmx + '" y="109" text-anchor="middle" font-size="7.0" font-weight="800" fill="' + strokeB + '">' + L("W: ", "A: ", "Ш: ") + esc(wTxt) + "</text>" +
      '<text x="' + bmx + '" y="120" text-anchor="middle" font-size="7.0" font-weight="800" fill="' + strokeB + '">' + L("H: ", "H: ", "В: ") + esc(hTxt) + "</text>" +

      segOverlay +

      '<line x1="14" y1="222" x2="282" y2="222" stroke="#1d2326" stroke-width="2.2"/>' +

      '<rect x="288" y="25" width="180" height="128" rx="6" fill="' + jambBg + '" stroke="' + jambBorder + '" stroke-width="' + (jambHighlight ? 2 : 1.1) + '"/>' +
      '<text x="378" y="39" text-anchor="middle" font-size="6.8" font-weight="800" fill="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '">' + L("#9 TOP-DOWN JAMB DEPTH (NO TRIM)", "#9 CORTE SUPERIOR JAMBA (SIN MOLDURA)", "#9 ГЛУБИНА КОРОБКИ СВЕРХУ (БЕЗ НАЛИЧН.)") + "</text>" +
      '<text x="378" y="53" text-anchor="middle" font-size="6.2" font-weight="700" fill="#5d686d">' + L("↑ Laundry Closet (North)", "↑ Clóset Lavandería (Norte)", "↑ Прачечная (Север)") + "</text>" +
      '<rect x="304" y="60" width="38" height="44" fill="#d9dedc" stroke="#5d686d" stroke-width="1.2"/>' +
      '<rect x="342" y="60" width="12" height="44" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1.5"/>' +
      '<rect x="304" y="55" width="44" height="5" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="0.9"/>' +
      '<rect x="304" y="104" width="44" height="5" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="0.9"/>' +
      '<line x1="364" y1="60" x2="364" y2="104" stroke="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '" stroke-width="2.2"/>' +
      '<line x1="358" y1="60" x2="370" y2="60" stroke="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '" stroke-width="1.6"/>' +
      '<line x1="358" y1="104" x2="370" y2="104" stroke="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '" stroke-width="1.6"/>' +
      '<text x="374" y="80" font-size="7.2" font-weight="800" fill="' + (jambHighlight ? "#a8281c" : "#1f5f7a") + '">J = ' + esc(jambValTxt) + "</text>" +
      '<text x="374" y="92" font-size="6.0" font-weight="600" fill="#5d686d">' + L("Wood jamb only", "Solo madera jamba", "Чистая доска коробки") + "</text>" +
      '<text x="374" y="102" font-size="5.8" fill="#2f6b3f">' + L("(exclude casing)", "(excluir chambrana)", "(без наличника)") + "</text>" +
      '<text x="378" y="122" text-anchor="middle" font-size="6.2" font-weight="700" fill="#5d686d">' + L("↓ Hallway (South)", "↓ Pasillo (Sur)", "↓ Коридор (Юг)") + "</text>" +
      '<text x="378" y="144" text-anchor="middle" font-size="6.3" font-weight="700" fill="#5d686d">' + L("Tap any point 1–9 to highlight:", "Toca un punto 1–9 para resaltar:", "Нажмите точку 1–9 для подсветки:") + "</text>" +
      quickPillsSvg +

      '<text x="240" y="241" text-anchor="middle" font-size="7.2" font-weight="700" fill="#1f5f7a">' +
        L(
          "Measure INSIDE wood jambs (excluding outside trim) to nearest 1/16\", twice",
          "Medir POR DENTRO de las jambas (sin molduras exteriores) al 1/16\" más cercano, dos veces",
          "Замерять ВНУТРИ деревянной коробки (без наличников) с точностью до 1/16\", дважды"
        ) +
      "</text>" +
    "</svg>";
  }

  function renderSwingPlanSvg(m) {
    var S = 2.0; // exact 1:1 uniform scale: 1 inch = 2.0 px in BOTH X and Y!
    var closetWIn = 36.3125;
    var closetDIn = 82.625;
    var washWIn = 27.0;
    var washDIn = 30.375;
    var hallDIn = 41.25;
    var jambDIn = m.jambDepth != null ? m.jambDepth : 4.75;
    var doorWIn = m.doorSwingW;
    var caseDIn = m.depth;

    var closetW = +(closetWIn * S).toFixed(1);
    var closetD = +(closetDIn * S).toFixed(1);
    var closetX = 118;
    var closetY = 34;
    var wallTopY = +(closetY + closetD).toFixed(1);
    var wallBotY = +(wallTopY + jambDIn * S).toFixed(1);
    var hallBotY = +(wallBotY + hallDIn * S).toFixed(1);

    var washW = +(washWIn * S).toFixed(1);
    var washD = +(washDIn * S).toFixed(1);
    var washX = +(closetX + (closetW - washW) / 2).toFixed(1);
    var washY = +(closetY + 4.0 * S).toFixed(1);
    var clearFrontIn = +(closetDIn - 4.0 - washDIn).toFixed(1);
    var clearFrontTop = +(washY + washD).toFixed(1);

    var openWpx = +(28.4375 * S).toFixed(1);
    var openX = +(closetX + (closetW - openWpx) / 2).toFixed(1);
    var openX2 = +(openX + openWpx).toFixed(1);
    var doorLenPx = +(doorWIn * S).toFixed(1);
    var caseDpx = +(caseDIn * S).toFixed(1);

    return '<svg id="murSwingSvg" viewBox="0 0 460 326" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(L("Strict 1:1 true-scale deep laundry closet and 90-degree out-swing plan", "Planta a escala 1:1 del clóset profundo de lavandería y giro 90 grados", "План глубокой ниши прачечной и открывания двери на 90 градусов в масштабе 1:1")) + '">' +
      '<text x="14" y="18" font-size="8.2" font-weight="800" fill="#1f5f7a">' +
        L(
          'TRUE 1:1 SCALE PLAN (X = Y) · CLOSET 36-5/16" × 82-5/8" & HALLWAY 41-1/4"',
          'PLANTA ESCALA REAL 1:1 (X = Y) · CLÓSET 36-5/16" × 82-5/8" Y PASILLO 41-1/4"',
          'ПЛАН В МАСШТАБЕ 1:1 (X = Y) · НИША 36-5/16" × 82-5/8" И КОРИДОР 41-1/4"'
        ) + "</text>" +
      '<g transform="translate(436,24)">' +
        '<circle r="13" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-9 -2.8,-3 2.8,-3" fill="#a8281c"/>' +
        '<text x="0" y="-10" text-anchor="middle" font-size="5.8" font-weight="800" fill="#a8281c">' + L("N", "N", "С") + '</text>' +
        '<text x="0" y="11" text-anchor="middle" font-size="5.2" font-weight="700" fill="#5d686d">' + L("S", "S", "Ю") + '</text>' +
      "</g>" +

      '<rect id="murClosetRect" data-w-in="' + closetWIn + '" data-d-in="' + closetDIn + '" x="' + closetX + '" y="' + closetY + '" width="' + closetW + '" height="' + closetD + '" fill="#fbfcfb" stroke="#1d2326" stroke-width="2.2"/>' +
      '<text x="' + (closetX + closetW / 2).toFixed(1) + '" y="' + (closetY - 4) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#1f5f7a">36-5/16" ' + L("W", "A", "Ш") + '</text>' +
      '<line x1="' + (closetX - 12) + '" y1="' + closetY + '" x2="' + (closetX - 12) + '" y2="' + wallTopY + '" stroke="#1f5f7a" stroke-width="1.2"/>' +
      '<line x1="' + (closetX - 16) + '" y1="' + closetY + '" x2="' + (closetX - 8) + '" y2="' + closetY + '" stroke="#1f5f7a" stroke-width="1.2"/>' +
      '<line x1="' + (closetX - 16) + '" y1="' + wallTopY + '" x2="' + (closetX - 8) + '" y2="' + wallTopY + '" stroke="#1f5f7a" stroke-width="1.2"/>' +
      '<text x="' + (closetX - 17) + '" y="' + ((closetY + wallTopY) / 2 + 2).toFixed(1) + '" text-anchor="end" font-size="7.4" font-weight="800" fill="#1f5f7a">82-5/8"</text>' +
      '<text x="' + (closetX - 17) + '" y="' + ((closetY + wallTopY) / 2 + 12).toFixed(1) + '" text-anchor="end" font-size="6.2" fill="#5d686d">' + L("true depth", "fondo real", "глубина") + "</text>" +

      '<rect x="' + washX + '" y="' + washY + '" width="' + washW + '" height="' + washD + '" rx="3" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.6"/>' +
      '<text x="' + (washX + washW / 2).toFixed(1) + '" y="' + (washY + 24).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#1f5f7a">LG</text>' +
      '<text x="' + (washX + washW / 2).toFixed(1) + '" y="' + (washY + 34).toFixed(1) + '" text-anchor="middle" font-size="6.6" font-weight="700" fill="#1d2326">WashTower</text>' +
      '<text x="' + (washX + washW / 2).toFixed(1) + '" y="' + (washY + 45).toFixed(1) + '" text-anchor="middle" font-size="6" fill="#5d686d">27"×30-3/8"</text>' +

      '<rect x="' + (closetX + 6) + '" y="' + (clearFrontTop + 12).toFixed(1) + '" width="' + (closetW - 12).toFixed(1) + '" height="' + (wallTopY - clearFrontTop - 22).toFixed(1) + '" rx="4" fill="#e4f0e6" fill-opacity="0.55" stroke="#2f6b3f" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="' + (closetX + closetW / 2).toFixed(1) + '" y="' + ((clearFrontTop + wallTopY) / 2 - 2).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#2f6b3f">~4 ' + L("ft", "pies", "фут.") + ' (' + Math.round(clearFrontIn) + '")</text>' +
      '<text x="' + (closetX + closetW / 2).toFixed(1) + '" y="' + ((clearFrontTop + wallTopY) / 2 + 8).toFixed(1) + '" text-anchor="middle" font-size="6.0" font-weight="700" fill="#2f6b3f">' + L("clear floor", "libre al frente", "свободно") + "</text>" +

      '<rect x="20" y="' + wallTopY + '" width="' + (openX - 20).toFixed(1) + '" height="' + (wallBotY - wallTopY).toFixed(1) + '" fill="#d9dedc" stroke="#1d2326" stroke-width="1.6"/>' +
      '<rect x="' + openX2 + '" y="' + wallTopY + '" width="' + (254 - openX2).toFixed(1) + '" height="' + (wallBotY - wallTopY).toFixed(1) + '" fill="#d9dedc" stroke="#1d2326" stroke-width="1.6"/>' +
      '<rect x="44" y="' + (wallTopY + 1) + '" width="56" height="' + Math.max(4, wallBotY - wallTopY - 2).toFixed(1) + '" fill="#f9e6e4" stroke="#a8281c" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="72" y="' + (wallTopY - 5) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#a8281c">' + L("Wall A–B", "Muro A–B", "Стена A–B") + "</text>" +
      '<line x1="20" y1="' + hallBotY + '" x2="254" y2="' + hallBotY + '" stroke="#1d2326" stroke-width="2.4"/>' +

      '<line x1="34" y1="' + wallBotY + '" x2="34" y2="' + hallBotY + '" stroke="#5d686d" stroke-width="1.2"/>' +
      '<text x="40" y="' + ((wallBotY + hallBotY) / 2 + 3).toFixed(1) + '" font-size="7.0" font-weight="800" fill="#5d686d">' + L('Hall 41-1/4"', 'Pasillo 41-1/4"', 'Коридор 41-1/4"') + "</text>" +

      '<rect x="' + openX + '" y="' + wallTopY + '" width="' + doorLenPx + '" height="' + caseDpx + '" fill="#e4f0e6" fill-opacity="0.55" stroke="#2f6b3f" stroke-width="1.2" stroke-dasharray="3 2"/>' +
      '<rect x="' + openX + '" y="' + wallBotY + '" width="' + caseDpx + '" height="' + doorLenPx + '" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1.8"/>' +
      '<path d="M ' + (openX + doorLenPx).toFixed(1) + " " + wallBotY + " A " + doorLenPx + " " + doorLenPx + " 0 0 1 " + openX + " " + (wallBotY + doorLenPx).toFixed(1) + '" fill="none" stroke="#1f5f7a" stroke-width="1.6" stroke-dasharray="4 3"/>' +
      '<circle cx="' + (openX + 2) + '" cy="' + (wallBotY + 2) + '" r="3.5" fill="#1f5f7a"/>' +

      '<rect x="266" y="44" width="182" height="248" rx="6" fill="#f4f5f3" stroke="#c5ccc9" stroke-width="1.1"/>' +
      '<text x="276" y="64" font-size="7.6" font-weight="800" fill="#1f5f7a">' + L("TRUE SCALE CHECK (MD-1)", "PROPORCIÓN REAL (MD-1)", "МАСШТАБ 1:1 (MD-1)") + "</text>" +
      '<text x="276" y="82" font-size="7.0" font-weight="700" fill="#1d2326">• ' + L('Closet: 36-5/16" W × 82-5/8" D', 'Clóset: 36-5/16" × 82-5/8" (~2.28:1)', 'Ниша: 36-5/16" Ш × 82-5/8" Г') + "</text>" +
      '<text x="276" y="98" font-size="7.0" font-weight="700" fill="#2f6b3f">• ' + L('LG: 27"×30-3/8" (≥4" rear, ≥1" sides)', 'LG: 27"×30-3/8" (≥4" atrás, ≥1" lados)', 'LG: 27"×30-3/8" (≥4" сзади, ≥1" бок)') + "</text>" +
      '<text x="276" y="114" font-size="7.0" font-weight="700" fill="#2f6b3f">• ' + L('Front floor space: ~4 ft (48" clear)', 'Espacio frontal libre: ~4 pies (48")', 'Спереди свободно: ~4 фут. (48")') + "</text>" +
      '<line x1="276" y1="128" x2="436" y2="128" stroke="#d9dedc" stroke-width="1"/>' +
      '<text x="276" y="146" font-size="7.6" font-weight="800" fill="#9a5b06">' + L("90° OUT-SWING INTO HALL", "GIRO 90° HACIA EL PASILLO", "ОТКРЫВАНИЕ 90° В КОРИДОР") + "</text>" +
      '<text x="276" y="164" font-size="7.0" font-weight="700" fill="#1d2326">• ' + L("Case depth: ", "Fondo librero: ", "Глубина шкафа: ") + fmtIn(m.depth) + "</text>" +
      '<text x="276" y="179" font-size="7.0" font-weight="700" fill="#1d2326">• ' + L("Usable shelf: ~", "Repisa útil: ~", "Полезная полка: ~") + fmtIn(m.shelfDepth) + "</text>" +
      '<text x="276" y="194" font-size="7.0" font-weight="700" fill="#1f5f7a">• ' + L('Hallway clear: 41-1/4"', 'Pasillo libre: 41-1/4"', 'Коридор в свету: 41-1/4"') + "</text>" +
      '<text x="276" y="209" font-size="7.0" font-weight="800" fill="#2f6b3f">• ' + L("Pass clear open: ~", "Paso libre al abrir: ~", "Проход при откр.: ~") + fmtIn(m.hallPassLeft) + "</text>" +
      '<text x="276" y="226" font-size="6.5" fill="#5d686d">' + L("Left pivot · Press right edge to open", "Pivote izquierdo · Presiona derecha", "Петля слева · Нажать справа") + "</text>" +
      '<rect x="276" y="242" width="162" height="38" rx="4" fill="#f7ecd9" stroke="#9a5b06" stroke-width="0.9"/>' +
      '<text x="357" y="256" text-anchor="middle" font-size="6.5" font-weight="800" fill="#9a5b06">' + L("REQUIRED BEFORE DRILLING:", "OBLIGATORIO ANTES DE CORTAR:", "ОБЯЗАТЕЛЬНО ДО СВЕРЛЕНИЯ:") + "</text>" +
      '<text x="357" y="269" text-anchor="middle" font-size="6.3" font-weight="700" fill="#1d2326">' + L("Full-size cardboard swing mockup", "Plantilla de cartón a tamaño real", "Картонный шаблон в натуральную величину") + "</text>" +

      '<text x="230" y="314" text-anchor="middle" font-size="7.1" font-weight="700" fill="#5d686d">' +
        L(
          "Strict 1:1 true scale (2.0 px/in in X & Y) · Matches MD-1 & Unit 4 floor plan",
          "Escala estricta 1:1 (2.0 px/pulg en X y Y) · Alineado con MD-1 y planta Unidad 4",
          "Строгий масштаб 1:1 (2.0 пикс./дюйм по X и Y) · Соответствует листу MD-1 и плану квартиры"
        ) +
      "</text>" +
    "</svg>";
  }

  function renderVentsSvg() {
    return '<svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="8.8" font-weight="800" fill="#1f5f7a">' +
        L("LG GAS WASHTOWER LOUVER VENTS & INSIDE SAFETY RELEASE", "REJILLAS DE VENTILACIÓN LG WASHTOWER (GAS) Y APERTURA INTERIOR", "РЕШЁТКИ ВЕНТИЛЯЦИИ ГАЗОВОЙ КОЛОННЫ LG И ВНУТРЕННЯЯ РУЧКА") + "</text>" +
      '<rect x="150" y="30" width="120" height="170" rx="4" fill="#fbfcfb" stroke="#1f5f7a" stroke-width="2"/>' +
      '<rect x="168" y="42" width="84" height="28" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.8"/>' +
      '<text x="210" y="54" text-anchor="middle" font-size="7.4" font-weight="800" fill="#2f6b3f">' + L("Upper Vent", "Rejilla alta", "Верхняя решётка") + "</text>" +
      '<text x="210" y="65" text-anchor="middle" font-size="6.8" font-weight="700" fill="#2f6b3f">' + L("≥ 48 sq in net", "≥ 48 pulg² netas", "≥ 48 кв. дюйм.") + '</text>' +
      '<text x="282" y="58" font-size="7.4" font-weight="800" fill="#2f6b3f">' + L('Height ≥ 72" (plan 72-1/2")', 'Altura ≥ 72" (plan 72-1/2")', 'Высота ≥ 72" (план 72-1/2")') + "</text>" +
      '<rect x="234" y="106" width="22" height="10" rx="3" fill="#a8281c"/>' +
      '<text x="282" y="114" font-size="7.4" font-weight="800" fill="#a8281c">' + L('Inside safety release (~40" high)', 'Manija interior de emergencia (~40")', 'Внутр. ручка открывания (~40")') + "</text>" +
      '<rect x="168" y="160" width="84" height="28" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.8"/>' +
      '<text x="210" y="172" text-anchor="middle" font-size="7.4" font-weight="800" fill="#2f6b3f">' + L("Lower Vent", "Rejilla baja", "Нижняя решётка") + "</text>" +
      '<text x="210" y="183" text-anchor="middle" font-size="6.8" font-weight="700" fill="#2f6b3f">' + L("≥ 24 sq in net", "≥ 24 pulg² netas", "≥ 24 кв. дюйм.") + '</text>' +
      '<text x="282" y="176" text-anchor="middle" font-size="7.4" font-weight="800" fill="#2f6b3f" transform="translate(52,0)">' + L('Top ≤ 12" (plan 7")', 'Tope ≤ 12" (plan 7")', 'Верх ≤ 12" (план 7")') + "</text>" +
      '<rect x="18" y="84" width="118" height="58" rx="7" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.2"/>' +
      '<text x="77" y="104" text-anchor="middle" font-size="7.8" font-weight="800" fill="#1f5f7a">' + L("TOTAL MINIMUM", "TOTAL MÍNIMO", "ОБЩИЙ МИНИМУМ") + "</text>" +
      '<text x="77" y="120" text-anchor="middle" font-size="10.2" font-weight="800" fill="#2f6b3f">' + L("≥ 100 sq in", "≥ 100 pulg²", "≥ 100 кв. д.") + '</text>' +
      '<text x="77" y="133" text-anchor="middle" font-size="6.8" fill="#5d686d">' + L("net free airflow", "área libre neta", "живое сечение") + "</text>" +
    "</svg>";
  }

  function renderEquip() {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="murEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        L("🔧 Equipment & Supplies ", "🔧 Equipo y suministros ", "🔧 Оборудование и материалы ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="murEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + L("Required Hardware", "Herrajes requeridos", "Обязательная фурнитура") + "</h4>" +
            "<ul>" +
              "<li>" + L("Murphy Door Single Hidden Door Hardware Kit (measure actual T + Bt stack first)", "Kit de pivote Murphy Door (medir grosor real T + Bt antes de cortar)", "Комплект осевых петель Murphy Door (замерить фактическую толщину пакета T + Bt до распила)") + "</li>" +
              "<li>" + L("Sugatsune ML-ZN80-BL black push latch (~40\" height)", "Seguro de empuje negro Sugatsune ML-ZN80-BL (~40\" alto)", "Чёрная нажимная защёлка Sugatsune ML-ZN80-BL (на высоте ~40\")") + "</li>" +
              "<li>" + L("Inside safety release handle + louver vents (≥100 sq in total net)", "Manija de liberación interior + rejillas de ventilación (≥100 pulg² netas)", "Внутренняя ручка экстренного открывания + жалюзийные решётки (≥100 кв. дюйм. живого сечения)") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + L("Woodwork & Finish", "Madera y acabado", "Столярка и отделка") + "</h4>" +
            "<ul>" +
              "<li>" + L('Paint-grade ply carcass + 4 fixed shelves w/ 1-1/2" retaining lips', 'Triplay para pintar + 4 repisas fijas con labio 1-1/2" (3/4" arriba)', 'Корпус из фанеры под покраску + 4 жёсткие полки с буртиком 1-1/2"') + "</li>" +
              "<li>" + L("Solid poplar face frame · Chantilly Lace OC-65 woodwork (sheen TBD)", "Marco frontal de álamo sólido (poplar) · color Chantilly Lace OC-65", "Лицевая рамка из массива тополя · эмаль Chantilly Lace OC-65 (степень блеска уточняется)") + "</li>" +
              "<li>" + L("Large cardboard sheet for mandatory full-size 90° swing mockup", "Cartón grande para plantilla de prueba de giro 90° antes de cortar", "Лист плотного картона для обязательного полноразмерного шаблона открывания 90°") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function buildGuidanceHtml(m) {
    var f = FIELD_MAP[state.activeField] || FIELDS[0];
    var parts = [];
    parts.push('<div><strong>' + esc(L(f.en, f.es, f.ru)) + ':</strong> ' + esc(L(f.guideEn, f.guideEs, f.guideRu)) + "</div>");

    if (m.diagDiff != null) {
      if (m.squareOk) {
        parts.push('<div style="margin-top:6px;color:var(--lock);font-weight:600">' +
          L(
            "✓ Frame is square: |Diag A − Diag B| = " + fmtIn(m.diagDiff) + " (≤ 1/8\"). Build bookcase straight to the smallest measured width & height.",
            "✓ Escuadra confirmada: |Diag A − Diag B| = " + fmtIn(m.diagDiff) + " (≤ 1/8\"). El marco está a escuadra — puedes construir la caja recta al menor ancho/alto.",
            "✓ Геометрия в норме: |Диаг. А − Диаг. Б| = " + fmtIn(m.diagDiff) + " (≤ 1/8\"). Проём прямоугольный — собирайте корпус по наименьшим замерам ширины и высоты."
          ) +
        "</div>");
      } else {
        var dirTxt = m.leanDir === "left"
          ? L(
              "Top of frame leans LEFT (West toward Bathroom A) because Diag A (TL→BR) is longer than Diag B (TR→BL).",
              "La parte superior del marco se inclina a la IZQUIERDA (Oeste hacia Baño A) porque Diag A es mayor que Diag B.",
              "Верх коробки завален ВЛЕВО (на Запад к ванной A), так как Диагональ А (ВЛ→НП) длиннее Диагонали Б (ВП→НЛ)."
            )
          : L(
              "Top of frame leans RIGHT (East toward Bedroom C) because Diag B (TR→BL) is longer than Diag A (TL→BR).",
              "La parte superior del marco se inclina a la DERECHA (Este hacia Recámara C) porque Diag B es mayor que Diag A.",
              "Верх коробки завален ВПРАВО (на Восток к спальне C), так как Диагональ Б (ВП→НЛ) длиннее Диагонали А (ВЛ→НП)."
            );
        parts.push('<div style="margin-top:6px;color:var(--crimson);font-weight:600">' +
          L(
            "⚠ Out of square by " + fmtIn(m.diagDiff) + " (> 1/8\"): " + dirTxt + " Carpentry action: reduce inscribed box width or plan face-frame scribing/shimming, and verify swing with full-size cardboard mockup before cutting wood.",
            "⚠ Descuadre de " + fmtIn(m.diagDiff) + " (> 1/8\"): " + dirTxt + " Acción de carpintería: NO cortes a medida nominal — descuenta el desplome en el ancho inscrito o cepilla/calza el marco frontal y prueba primero en plantilla de cartón.",
            "⚠ Перекос диагоналей " + fmtIn(m.diagDiff) + " (> 1/8\"): " + dirTxt + " Действие плотника: НЕ пилить в номинал — уменьшить вписанную ширину корпуса либо заложить подгонку лицевой рамки и сначала проверить поворот картонным шаблоном."
          ) +
        "</div>");
      }
    }
    return parts.join("");
  }

  function updateMeasureLive() {
    var m = computeMath();

    var svgHost = document.getElementById("murSvgHost");
    if (svgHost) {
      var oldSvg = svgHost.querySelector("svg");
      if (oldSvg) {
        oldSvg.outerHTML = renderDoorwayElevationSvg(m);
      } else {
        svgHost.innerHTML = renderDoorwayElevationSvg(m);
      }
      wireSvgPillPickers();
    }

    var kCount = document.getElementById("murKpiCount");
    var kCountSub = document.getElementById("murKpiCountSub");
    if (kCount) {
      kCount.className = "u4h-kpi-val " + (m.hasAnyInvalid ? "is-fail" : (m.filledCount === 9 ? "is-ok" : "is-warn"));
      kCount.textContent = m.filledCount + " / 9";
    }
    if (kCountSub) {
      kCountSub.textContent = m.hasAnyInvalid
        ? L("Check highlighted inputs", "Revisar medidas marcadas", "Проверьте выделенные поля")
        : (m.filledCount === 9
            ? L("All 9 entered", "Todas completas", "Все 9 замеров внесены")
            : L("Hold until 9/9", "Faltan medidas", "Пауза до 9/9"));
    }

    var kSq = document.getElementById("murKpiSq");
    var kSqSub = document.getElementById("murKpiSqSub");
    var sqText = m.dInvalid
      ? L("Check diag (60\"–110\")", "Revisar diag. (60\"–110\")", "Проверить диаг. (60\"–110\")")
      : (m.diagDiff == null
          ? L("Enter diagonals", "Medir diagonales", "Введите диагонали")
          : (m.squareOk
              ? L("✓ Square (" + fmtIn(m.diagDiff) + ")", "✓ Escuadrado (" + fmtIn(m.diagDiff) + ")", "✓ Ровно (" + fmtIn(m.diagDiff) + ")")
              : L("⚠ Out of square (" + fmtIn(m.diagDiff) + ")", "⚠ Descuadrado (" + fmtIn(m.diagDiff) + ")", "⚠ Перекос (" + fmtIn(m.diagDiff) + ")")));
    if (kSq) {
      kSq.className = "u4h-kpi-val " + ((m.dInvalid || m.squareOk === false) ? "is-fail" : (m.squareOk === true ? "is-ok" : "is-warn"));
      kSq.textContent = sqText;
    }
    if (kSqSub) {
      kSqSub.textContent = m.leanDir
        ? (m.leanDir === "left"
            ? L("Leans left at top (West)", "Inclinado a la izq. (Oeste)", "Завал влево вверху (Запад)")
            : L("Leans right at top (East)", "Inclinado a la der. (Este)", "Завал вправо вверху (Восток)"))
        : L("Tolerance ≤ 1/8\"", "Tolerancia ≤ 1/8\"", "Допуск ≤ 1/8\"");
    }

    var kBox = document.getElementById("murKpiBox");
    var kBoxSub = document.getElementById("murKpiBoxSub");
    if (kBox) {
      kBox.className = "u4h-kpi-val " + (m.hasAnyInvalid ? "is-fail" : "is-info");
      kBox.textContent = (m.caseW != null && !m.hasAnyInvalid ? fmtIn(m.caseW) : "—") + " × " + (m.caseH != null && !m.hasAnyInvalid ? fmtIn(m.caseH) : "—");
    }
    if (kBoxSub) {
      kBoxSub.textContent = m.hasAnyInvalid
        ? L("Held — fix invalid reading", "En pausa — corregir medida", "Пауза — исправьте замер")
        : L("Minus gaps & hinge stack", "Resta juegos y bisagras", "Минус зазоры и пакет петель");
    }

    var invEl = document.getElementById("murInvalidBanner");
    if (invEl) {
      invEl.hidden = !m.hasAnyInvalid;
      invEl.textContent = L(
        '⛔ Check reading (18"–48" W / 60"–96" H / 60"–110" Diag / 2"–12" Jamb). Calculated box size is held at — × — until all entered numbers are in range.',
        '⛔ Revisar medida fuera de rango (Ancho 18"–48" · Alto 60"–96" · Diagonales 60"–110" · Jamba 2"–12"). El cálculo de corte queda en — × — hasta corregir.',
        '⛔ Проверьте замер вне допустимого диапазона (Ширина 18"–48" · Высота 60"–96" · Диагонали 60"–110" · Коробка 2"–12"). Расчёт габарита поставлен на паузу (— × —).'
      );
    }
    var doorAEl = document.getElementById("murDoorABanner");
    if (doorAEl) doorAEl.hidden = !m.looksLikeDoorA;

    var gEl = document.getElementById("murGuidanceBox");
    if (gEl) gEl.innerHTML = buildGuidanceHtml(m);

    FIELDS.forEach(function (f) {
      var wrap = document.getElementById("murFieldWrap_" + f.k);
      var err = document.getElementById("murFieldErr_" + f.k);
      if (!wrap) return;
      var st = m.parsed[f.k];
      wrap.classList.toggle("is-active", state.activeField === f.k);
      wrap.classList.toggle("is-invalid", !!(st && st.invalid));
      if (err) {
        err.hidden = !(st && st.invalid);
        err.textContent = L("Range: ", "Rango: ", "Диапазон: ") + f.min + '"–' + f.max + '"';
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
    var m = computeMath();
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip is-danger";
      holdEl.innerHTML = L(
        "<strong>DO NOT CUT WOOD OR DRILL PIVOTS YET:</strong> Enter all 9 inside-jamb measurements of <strong>Middle Doorway B</strong> (NEVER Bathroom Door A: 27-1/4\" × 79-3/8\"), pass the dual-door swing mockup (LG 55\" open-door depth), hold back/grille cuts for rated free-area review, and <strong>move LG WashTower into closet BEFORE hanging door</strong>.",
        "<strong>NO CORTAR MADERA NI PERFORAR TODAVÍA:</strong> Completa las 9 medidas interiores de la <strong>Puerta Central B</strong> (NUNCA Puerta A del Baño 27-1/4\" × 79-3/8\"), aprueba giro doble (55\" puerta LG abierta), pausa cortes de respaldo/rejillas hasta validar área libre y <strong>mete la LG WashTower ANTES de colgar la puerta</strong>.",
        "<strong>НЕ ПИЛИТЬ И НЕ СВЕРЛИТЬ ОСИ ДО ПРОВЕРКИ:</strong> Снимите все 9 внутренних замеров <strong>среднего проёма B</strong> (НЕ путать с дверью ванной A: 27-1/4\" × 79-3/8\"), проверьте шаблон двойного открывания (глубина LG с открытым люком 55\"), держите на паузе вырезы под решётки до расчёта живого сечения и <strong>завезите колонну LG WashTower В НИШУ ДО навески шкаф-двери</strong>."
      );
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(L(s.en, s.es, s.ru)) + "</button>";
      }).join("") +
    "</div>";

    var titleTxt = L("Measure Middle Doorway B (9 Points · R4)", "Medir Puerta Central B (9 Puntos · R4)", "Замер среднего проёма B (9 точек · R4)");
    var subTxt = L(
      "Tap any input (1–9) to highlight the exact tape path on Doorway B and calculate squareness & box size live",
      "Toca cualquier campo (1–9) para resaltar la ruta exacta de la cinta en Puerta B y calcular escuadra y corte",
      "Нажмите на любое поле (1–9), чтобы подсветить линию рулетки на проёме B и рассчитать диагонали и размер корпуса"
    );
    var inner = "";

    if (state.step === "measure") {
      inner =
        '<div class="u4h-photo-grid">' +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/hallway-doorway-b-photo.png" alt="' + esc(L("Real hallway photo showing Doors A, B, and C", "Foto real del pasillo mostrando Puertas A, B y C", "Реальное фото коридора с проёмами A, B и C")) + '">' +
            '<div class="u4h-photo-cap"><strong>' + L("Real photo — Which door to measure:", "Foto real — ¿Cuál puerta medir?", "Фото объекта — Какой проём замерять:") + "</strong> " +
              L("Measure ONLY Middle Doorway B (laundry). NEVER measure Bathroom Door A on left.", "Mide SOLO la Puerta Central B (lavandería). NO medir Puerta A (baño a la izquierda).", "Замеряйте ТОЛЬКО средний проём B (прачечная). НИКОГДА не берите размеры двери ванной A слева.") +
            "</div>" +
          "</div>" +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/murphy-bookcase-concept.png" alt="' + esc(L("Built-in bookcase visual goal", "Referencia visual del librero empotrado", "Визуальный образец встроенной шкаф-двери")) + '">' +
            '<div class="u4h-photo-cap"><strong>' + L("Visual goal (Chantilly Lace):", "Objetivo visual (Chantilly Lace):", "Целевой вид (эмаль Chantilly Lace):") + "</strong> " +
              L("Clean built-in look while preserving existing original crown and casings.", "Librero limpio conservando corona y chambranas originales intactas.", "Аккуратный встроенный стеллаж с полным сохранением исторического карниза и наличников.") +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + L("Valid readings", "Lecturas válidas", "Внесено замеров") + "</div>" +
            '<div id="murKpiCount" class="u4h-kpi-val is-warn">' + m.filledCount + " / 9</div>" +
            '<div id="murKpiCountSub" class="u4h-kpi-sub">' + L("Hold until 9/9", "Faltan medidas", "Пауза до 9/9") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + L("Squareness (Diag A–B)", "Escuadra (Diag A–B)", "Прямоугольность (Диаг. А–Б)") + "</div>" +
            '<div id="murKpiSq" class="u4h-kpi-val is-warn">' + L("Enter diagonals", "Medir diagonales", "Введите диагонали") + "</div>" +
            '<div id="murKpiSqSub" class="u4h-kpi-sub">' + L("Tolerance ≤ 1/8\"", "Tolerancia ≤ 1/8\"", "Допуск ≤ 1/8\"") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + L("Calculated box size", "Corte estimado caja", "Расчётный габарит корпуса") + "</div>" +
            '<div id="murKpiBox" class="u4h-kpi-val is-info">— × —</div>' +
            '<div id="murKpiBoxSub" class="u4h-kpi-sub">' + L("Minus gaps & hinge stack", "Resta juegos y bisagras", "Минус зазоры и пакет петель") + "</div>" +
          "</div>" +
        "</div>" +

        '<div id="murInvalidBanner" class="u4h-status is-fail" hidden></div>' +
        '<div id="murDoorABanner" class="u4h-status is-fail"' + (m.looksLikeDoorA ? "" : " hidden") + ">" +
          L(
            "⛔ WARNING! Those numbers match BATHROOM DOOR A (27-1/4\" × 79-3/8\"). Double-check that you are measuring MIDDLE DOORWAY B!",
            "⛔ ¡ALERTA! Esas medidas parecen de la PUERTA A DEL BAÑO (27-1/4\" × 79-3/8\"). Verifica que estás midiendo la PUERTA CENTRAL B.",
            "⛔ ВНИМАНИЕ! Эти размеры совпадают с ДВЕРЬЮ ВАННОЙ A (27-1/4\" × 79-3/8\"). Перепроверьте, что замеряете СРЕДНИЙ ПРОЁМ B!"
          ) +
        "</div>" +

        '<div id="murSvgHost" class="u4h-svg-wrap">' + renderDoorwayElevationSvg(m) + "</div>" +
        '<div id="murGuidanceBox" class="u4h-info-box">' + buildGuidanceHtml(m) + "</div>" +

        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-lbl">' + L("Enter Doorway B inside-jamb readings (decimals or fractions, e.g. 28-7/16):", "Ingresa medidas de Puerta B (acepta decimales o fracciones, ej. 28-7/16):", "Введите внутренние замеры коробки проёма B (дроби или десятичные, напр. 28-7/16):") + "</div>" +
          '<div class="u4h-input-grid">' +
            FIELDS.map(function (f) {
              return '<div id="murFieldWrap_' + f.k + '" class="u4h-field' + (state.activeField === f.k ? " is-active" : "") + '">' +
                '<label for="mur_' + f.k + '">' + esc(L(f.en, f.es, f.ru)) + "</label>" +
                '<input id="mur_' + f.k + '" data-mf="' + f.k + '" type="text" inputmode="decimal" placeholder="' + esc(L("e.g. ", "ej. ", "напр. ") + f.ph) + '" value="' + esc(state[f.k]) + '">' +
                '<span id="murFieldErr_' + f.k + '" class="u4h-field-err" hidden></span>' +
              "</div>";
            }).join("") +
          "</div>" +
          '<div class="u4h-cta-row">' +
            '<button type="button" class="u4h-action-btn" id="murSendBtn">' + L("📝 Send 9-point readings to PM / Tisa", "📝 Enviar medidas al PM / Tisa", "📝 Отправить все 9 замеров руководителю / Tisa") + "</button>" +
          "</div>" +
        "</div>";

    } else if (state.step === "swing") {
      titleTxt = L("90° Out-Swing, True-Scale Deep Closet & Wall A–B", "Giro 90° Afuera, Clóset Escala 1:1 y Muro A–B", "Открывание 90° наружу, ниша 1:1 и стена A–B");
      subTxt = L(
        'Strict 1:1 scale (36-5/16" W × 82-5/8" deep closet + 41-1/4" hall) matching MD-1 & floor plan',
        'Escala real 1:1 (clóset 36-5/16" × 82-5/8" fondo + pasillo 41-1/4") según MD-1 y planta',
        'Точный масштаб 1:1 (глубокая ниша 36-5/16" Ш × 82-5/8" Г + коридор 41-1/4") по чертежу MD-1'
      );

      inner =
        '<div class="u4h-svg-wrap">' + renderSwingPlanSvg(m) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + L("Bookcase depth (confirm with cardboard mockup):", "Fondo del librero (confirmar con cartón):", "Глубина шкафа (проверить картонным шаблоном):") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.depthOpt === "8.25" ? " is-active" : "") + '" data-depth="8.25">' + L('8-1/4" standard (7-3/16" shelf)', '8-1/4" estándar (repisa 7-3/16")', '8-1/4" стандарт (полка 7-3/16")') + "</button>" +
              '<button type="button" class="u4h-pill' + (state.depthOpt === "9.0625" ? " is-active" : "") + '" data-depth="9.0625">' + L('9-1/16" deeper (8" shelf)', '9-1/16" más hondo (repisa 8")', '9-1/16" глубже (полка 8")') + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + L("Important Wall A–B Framing Note", "Actualización importante del Muro A–B", "Важное примечание по каркасу стены A–B и порядку монтажа") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li>" + L("Bathroom uses a locked 28\" outward-swing hinged hallway door (pocket door retired Nov 24) — verify actual Wall A–B studs on site before anchoring left pivot blocking.", "El baño usa una puerta abatible estándar de 28\" hacia el pasillo (puerta corrediza retirada el 24 nov) — verifica los postes reales del muro A–B en obra antes de anclar el refuerzo del pivote izquierdo.", "В ванной утверждена распашная дверь 28\" наружу в коридор (кассетная дверь отменена 24 нояб.) — проверьте фактические стойки стены A–B на месте перед креплением закладной под левую ось.") + "</li>" +
            "<li>" + L("Left-pivot out-swing into hallway: press the right edge inward to release the push latch, then pull outward.", "El librero pivota a la izquierda abriendo hacia el pasillo: presiona el borde derecho hacia adentro para liberar el seguro y jala hacia afuera.", "Левая осевая петля с открыванием наружу в коридор: нажмите правый край внутрь для расфиксации защёлки и потяните на себя.") + "</li>" +
            "<li><strong>" + L("Dual-door swing (55\" open depth) & mandatory sequence:", "Giro doble (55\" puerta abierta) y orden obligatorio:", "Проверка открывания обеих дверей (глубина 55\") и порядок работ:") + "</strong> " + L("During mockup verify move-in, service access & full swing with BOTH bookcase door and LG WKG101HVA doors open (55\" depth with door open + 4\" rear = 59\" inside 82-5/8\" closet). MOVE LG WashTower into closet BEFORE hanging Murphy bookcase door.", "En la maqueta verifica acceso y giro con AMBAS puertas abiertas (LG WKG101HVA mide 55\" de fondo con puerta abierta + 4\" atrás = 59\" dentro del clóset de 82-5/8\"). METER la LG WashTower al clóset ANTES de colgar la puerta librero Murphy.", "На макете проверить занос, сервис и полное открывание ОБЕИХ дверей (глубина колонны LG WKG101HVA с открытым люком 55\" + 4\" сзади = 59\" внутри ниши глубиной 82-5/8\"). ЗАВЕЗТИ колонну LG WashTower в нишу СТРОГО ДО навески шкаф-двери Murphy.") + "</li>" +
          "</ul>" +
        "</div>";

    } else if (state.step === "vents") {
      titleTxt = L("LG Gas WashTower Vents & Safety Release", "Ventilación LG WashTower (Gas) y Apertura Interior", "Вентиляция газовой колонны LG WashTower и безопасность");
      subTxt = L(
        "HOLD back & grille cuts until rated free-area review passes (LG WKG101HVA delivery Mon, Dec 14 (10 a.m.–2 p.m. PT) — delivery only, verify rating plate)",
        "PAUSAR cortes de respaldo y rejillas hasta validar área libre real (entrega LG lun 14 dic (10 a.m.–2 p.m. PT) — solo entrega, revisar placa)",
        "ПАУЗА на вырезы задней стенки и решёток до проверки живого сечения (доставка LG WKG101HVA — пн, 14 дек., 10:00–14:00 PT; сверить шильдик)"
      );

      inner =
        '<div class="u4h-svg-wrap">' + renderVentsSvg() + "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + L("Appliance & Code Requirements", "Requisitos de seguridad y equipo", "Требования производителя и строительных норм") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li><strong>LG WKG101HVA:</strong> 27\" " + L("W", "A", "Ш") + " × 30-3/8\" " + L("D", "F", "Г") + " × 74-3/8\" " + L("H", "Alto", "В") + " (" + L('55" depth w/ door open, min 1" sides, 4" rear; legacy Samsung retired; verify rating plate on Mon, Dec 14 (10 a.m.–2 p.m. PT) delivery', '55" fondo con puerta abierta, mín. 1" lados, 4" atrás; referencia Samsung retirada; revisar placa el lun 14 dic (10 a.m.–2 p.m. PT)', 'глубина 55" с открытой дверцей, зазоры мин. 1" по бокам и 4" сзади; прежняя модель Samsung отменена; проверить паспортный шильдик при доставке пн, 14 дек.') + ").</li>" +
            "<li><strong>" + L("Mandatory combustion/dryer airflow:", "Ventilación obligatoria:", "Обязательный приток воздуха для горения и сушки:") + "</strong> " + L('HOLD bookcase back & grille cuts until reviewer confirms unobstructed openings with bookcase closed & loaded usando RATED FREE/OPEN GRILLE AREA (not outside frame size): LG ≥ 48 sq in upper (≥ 6 ft / 72" AFF) + ≥ 24 sq in lower (≤ 1 ft / 12" AFF); 2025 CMC §504.4.1 requires 100 sq in net makeup air (separate from exterior dryer exhaust).'.replace('usando', 'using'), 'PAUSAR corte de respaldo/rejillas hasta confirmar con librero cerrado y cargado usando ÁREA LIBRE EFECTIVA de rejilla (no marco exterior): LG ≥ 48 pulg² arriba (≥ 6 pies / 72" NPT) + ≥ 24 pulg² abajo (≤ 1 pie / 12" NPT); CMC 2025 §504.4.1 exige 100 pulg² netas (independiente del ducto exterior de secadora).', 'НЕ ВЫРЕЗАТЬ заднюю стенку и решётки до подтверждения свободного прохода воздуха при закрытом и заполненном стеллаже по ПАСПОРТНОМУ ЖИВОМУ СЕЧЕНИЮ решётки (не по внешнему размеру рамки): LG требует ≥ 48 кв. дюйм. вверху (≥ 72" от пола) + ≥ 24 кв. дюйм. внизу (≤ 12" от пола); код CMC 2025 §504.4.1 требует ≥ 100 кв. дюйм. чистого притока (отдельно от наружного выхлопа сушилки).') + "</li>" +
            "<li><strong>" + L("Inside release:", "Manija interior:", "Внутренняя ручка безопасности:") + "</strong> " + L("Required so nobody can ever get trapped inside the laundry closet.", "Obligatoria para poder abrir desde adentro del clóset en cualquier momento.", "Обязательна, чтобы шкаф-дверь всегда открывалась изнутри ниши прачечной без ключа и усилия.") + "</li>" +
          "</ul>" +
        "</div>";

    } else {
      titleTxt = L("Original Trim Protection, Hardware & Supplies", "Protección de Molduras, Herrajes y Suministros", "Защита исторических наличников, фурнитура и материалы");
      subTxt = L(
        "Keep Edwardian hallway woodwork untouched while building a tight custom bookcase door",
        "Conservar intacta la carpintería Edwardian original mientras se arma la puerta librero",
        "Сохранить оригинальные деревянные элементы коридора нетронутыми при сборке встроенной шкаф-двери"
      );

      inner =
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + L("Finish & Hardware Rules", "Reglas de acabado y herrajes", "Правила отделки и комплектации фурнитуры") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li>" + L("Keep original hallway crown molding, Door A/B/C casings, and baseboards completely untouched.", "Conservar intactas la moldura corona original del pasillo, las chambranas de Puertas A/B/C y el zoclo.", "Полностью сохранить потолочный карниз коридора, оригинальные наличники проёмов A/B/C и высокие плинтусы.") + "</li>" +
            "<li>" + L("Confirm physical delivery of the Murphy Door hardware kit and measure actual hinge stack (T + Bt) before cutting box height.", "Verificar entrega física del kit de pivotes Murphy Door y medir el espesor real de las bisagras (T + Bt) antes de cortar la altura.", "Дождаться физической поставки комплекта петель Murphy Door и измерить реальную высоту верхнего и нижнего узлов (T + Bt) до раскроя вертикальных стоек.") + "</li>" +
            "<li>" + L("Paint-grade woodwork in Chantilly Lace OC-65 (final sheen to be confirmed by Tisa).", "Acabado pintado en Chantilly Lace OC-65 (brillo por confirmar por Tisa).", "Столярная окраска в цвет Chantilly Lace OC-65 (итоговую степень блеска подтверждает Tisa).") + "</li>" +
          "</ul>" +
        "</div>" +
        renderEquip();
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="murPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + L("Prev", "Anterior", "Назад") + "</button>" +
      '<span class="u4h-pager-count">' + L("Step ", "Paso ", "Шаг ") + (idx + 1) + L(" of ", " de ", " из ") + STEPS.length + "</span>" +
      '<button type="button" id="murNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + L("Next", "Siguiente", "Далее") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(titleTxt) + "</div>" +
            '<div class="u4h-sub">' + esc(subTxt) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">' + L("Door B · R4", "Puerta B · R4", "Проём B · R4") + "</span>" +
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
        var summary = L(
          "Murphy Door B 9-point readings: W=",
          "Medidas 9 puntos Puerta B: Ancho=",
          "Замеры 9 точек проёма B (Murphy): Ш="
        ) + [state.b7, state.b8, state.b9].join("/") +
          ", H=" + [state.b10, state.b11, state.b12].join("/") +
          ", Diag=" + state.b13 + "/" + state.b14 + ", Jamb=" + state.b15;
        window.U4LiveAi.openNote(summary);
      }
    });
    var pBtn = document.getElementById("murPrevBtn");
    var nBtn = document.getElementById("murNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });

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
    window.addEventListener("u4:lang-change", function () {
      render();
      if (window.U4LiveAi) window.U4LiveAi.refreshPrompts();
    });
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "murphy-door",
        room: "laundry",
        titleEn: "Murphy Bookcase Door (Hallway B)",
        titleEs: "Puerta Librero Murphy (Pasillo B)",
        titleRu: "Потайная шкаф-дверь Murphy (Коридор B)",
        getContext: function () {
          var m = computeMath();
          return "Step=" + state.step + ", ActivePoint=" + state.activeField + ", ValidReadings=" + m.filledCount + "/9, CaseEst=" + fmtIn(m.caseW) + "x" + fmtIn(m.caseH) + ", Depth=" + fmtIn(m.depth) + ", Hard hold until all 9 inside-jamb readings of Middle Doorway B (never Bathroom Door A) + cardboard mockup pass.";
        },
        quickPrompts: function (lang) {
          if (lang === "ru") {
            return [
              "Как правильно снять 9 замеров среднего проёма B?",
              "Что делать, если Диагональ А длиннее Диагонали Б?",
              "Какое живое сечение решёток нужно для газовой LG WashTower?"
            ];
          }
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
