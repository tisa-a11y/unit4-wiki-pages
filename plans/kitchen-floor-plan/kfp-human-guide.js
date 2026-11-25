/* ============================================================================
   Kitchen Floor Plan & Cabinet Schedule — Real-World Human-First Interactive Guide
   Two-Layer Architecture: Clean 4-Step Crew UI + Hidden #blueprint-sheet-shell Print Engine
   Zero External CDNs · Zero Prices · Zero Backend Clutter · Zero Storage · EN / MX-ES / RU
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "floor", en: "1. Floor Plan", es: "1. Planta y Pasos", ru: "1. План и проходы" },
    { id: "walls", en: "2. Each Wall", es: "2. Cada Muro", ru: "2. По стенам" },
    { id: "cabinets", en: "3. Cabinet List", es: "3. Gabinetes", ru: "3. Список шкафов" },
    { id: "checks", en: "4. Site Checks", es: "4. Medir en Obra", ru: "4. Замеры на объекте" }
  ];

  var state = {
    step: "floor",
    southEnd: "6",       // "6" (6" filler/pullout) or "12" (12" cabinet option)
    sinkBasis: "tape",   // Current calculated setout; window is the earlier comparison
    floorDown: false,    // false = bare subfloor (+3/4"), true = finished floor down
    floorAdd: 0.75,
    wallTab: "south",    // "south" | "east" | "west" | "north"
    listWall: "All",
    selectedId: "S-B3",
    equipOpen: false,
    checked: { c1: false, c2: false, c3: false, c4: false }
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

  function isEs() { return getLang() === "es"; }
  function isRu() { return getLang() === "ru"; }
  function L(en, es, ru) {
    var l = getLang();
    return l === "ru" ? ru : (l === "es" ? es : en);
  }

  function wallLabel(wall) {
    if (wall === "West") return L("West", "Oeste", "Запад");
    if (wall === "South") return L("South", "Sur", "Юг");
    if (wall === "East") return L("East", "Este", "Восток");
    if (wall === "North") return L("North", "Norte", "Север");
    return L("All", "Todos", "Все");
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtIn(n) {
    var r = Math.round(n * 8) / 8;
    var whole = Math.floor(r);
    var frac = Math.round((r - whole) * 8);
    var map = { 1: "1/8", 2: "1/4", 3: "3/8", 4: "1/2", 5: "5/8", 6: "3/4", 7: "7/8" };
    if (frac === 0) return whole + '"';
    return (whole ? whole + "-" : "") + map[frac] + '"';
  }

  function computeLayout() {
    var endW = state.southEnd === "12" ? 12 : 6;
    var sinkStart = state.sinkBasis === "tape" ? 72 : 75;
    var sinkEnd = sinkStart + 30;
    var trashW = 12;
    var dwStart = 36 + trashW;
    var endStart = sinkEnd;
    var southCabTotal = endStart + endW;
    var southWithOverhang = southCabTotal + 1; // +1" counter side overhang
    var casingPass114 = southWithOverhang <= 114;
    var casingPass115 = southWithOverhang <= 115;
    var southEndWalk = 147 - southWithOverhang; // distance from counter edge to West recess wall
    var rangeStepWalk = 34.5; // Range step to South counter front with 1-1/2" overhang
    var narrowestWalk = Math.min(southEndWalk, rangeStepWalk);
    var floorOffset = state.floorDown ? 0 : state.floorAdd;

    var cabinets = [
      { id: "W-B1", wall: "West", start: 0, w: 18, d: 24, status: "locked",
        en: "West Left Base Cabinet (Essex Green)",
        es: "Gabinete Bajo Izquierdo Oeste (Essex Green)",
        ru: "Западная левая нижняя тумба (Essex Green)",
        noteEn: "Starts at South Step Corner (0\"). Left chase duct is dedicated to kitchen hood only (verify >= 6\").",
        noteEs: "Inicia en esquina escalonada Sur (0\"). El ducto izquierdo es exclusivo de campana (verificar >= 6\").",
        noteRu: "Отсчёт от южного выступа (0\"). Левая шахта — строго отдельный канал вытяжки кухни (проверить диаметр >= 6\")." },
      { id: "W-A1", wall: "West", start: 18, w: 30, d: 28.125, status: "locked",
        en: "Viking 30\" Gas Range + Zephyr 30\" Hood Above",
        es: "Estufa Gas Viking 30\" + Campana Zephyr 30\" Arriba",
        ru: "Газовая плита Viking 30\" + вытяжка Zephyr 30\" сверху",
        noteEn: "Center 33\" from South step. Hood 30\"–36\" above cooktop; 1-gang hardwire box hidden inside 8-5/8\" casing.",
        noteEs: "Centro a 33\" desde esquina Sur. Campana 30\"–36\" sobre parrilla; caja sencilla oculta en cubreducto 8-5/8\".",
        noteRu: "Ось 33\" от южного выступа. Вытяжка 30\"–36\" над конфорками; 1-постовая коробка скрыта внутри кожуха 8-5/8\"." },
      { id: "W-B2", wall: "West", start: 48, w: 18, d: 24, status: "locked",
        en: "West Right Base Cabinet + 1/4\" Scribe",
        es: "Gabinete Bajo Derecho Oeste + Tira 1/4\"",
        ru: "Западная правая нижняя тумба + доборная планка 1/4\"",
        noteEn: "Runs to 66-1/4\" North corner. NO upper cabinets on West wall (full-height tile to ceiling).",
        noteEs: "Llega a esquina Norte 66-1/4\". SIN gabinetes altos en muro Oeste (azulejo hasta el techo).",
        noteRu: "Доходит до северного угла 66-1/4\". БЕЗ верхних шкафов на западной стене (плитка на всю высоту до потолка)." },
      { id: "S-B1", wall: "South", start: 0, w: 36, d: 24, status: "verify",
        en: "SE 36\" Diagonal Corner Base (Shared w/ East)",
        es: "Esquinero Diagonal 36\" Sureste (Compartido)",
        ru: "Угловая L-образная тумба ЮВ (общая с восточной стеной)",
        noteEn: "36\" × 36\" corner base starting at SE Corner (0\"). Supports South & East countertops.",
        noteEs: "Esquinero 36\" × 36\" desde esquina SE (0\"). Sostiene cubiertas Sur y Este.",
        noteRu: "Угловой модуль 36\" × 36\" от угла ЮВ (0\"). Несёт южную и восточную столешницы." },
      { id: "S-B2", wall: "South", start: 36, w: trashW, d: 24, status: "verify",
        en: "Trash Pull-Out Cabinet (" + trashW + "\")",
        es: "Gabinete Extraíble de Basura (" + trashW + "\")",
        ru: "Выдвижной модуль для мусора (" + trashW + "\")",
        noteEn: "12\" width confirmed. Check the common zero on site before setting cabinets.",
        noteEs: "Ancho de 12\" confirmado. Verificar en obra el punto cero antes de colocar gabinetes.",
        noteRu: "Ширина 12\" утверждена. Проверить общую нулевую отметку на объекте перед установкой тумб." },
      { id: "S-A1", wall: "South", start: dwStart, w: 24, d: 24, status: "verify",
        en: "24\" Finished-Front Dishwasher Bay",
        es: "Claro Lavavajillas 24\" (Frente Terminado)",
        ru: "Ниша под встраиваемую посудомойку 24\" (под фасад)",
        noteEn: "Sits directly right of sink base; water supply & drain route into sink cabinet.",
        noteEs: "Va justo a la derecha de la tarja; agua y drenaje entran al gabinete de tarja.",
        noteRu: "Справа от тумбы мойки; подводка воды и слив заводятся внутрь тумбы мойки." },
      { id: "S-B3", wall: "South", start: sinkStart, w: 30, d: 24, status: "hold",
        en: "30\" Sink Base (" + sinkStart + "\"–" + sinkEnd + "\" from SE)",
        es: "Gabinete de Tarja 30\" (" + sinkStart + "\"–" + sinkEnd + "\" desde SE)",
        ru: "Тумба под мойку 30\" (" + sinkStart + "\"–" + sinkEnd + "\" от угла ЮВ)",
        noteEn: "Verify the common zero, window center and rear-door casing before moving plumbing.",
        noteEs: "Verificar el punto cero, el eje de la ventana y la moldura de la puerta antes de mover plomería.",
        noteRu: "Сверить нулевую отметку, ось окна и наличник задней двери до переноса труб." },
      { id: "S-F1", wall: "South", start: endStart, w: endW, d: 24, status: casingPass114 ? "verify" : "hold",
        en: endW === 6 ? "6\" End Filler / Spice Pull-Out" : "12\" End Cabinet (Test Option)",
        es: endW === 6 ? "Relleno / Especiero Final 6\"" : "Gabinete Final 12\" (Opción de Prueba)",
        ru: endW === 6 ? "Торцевая вставка / бутылочница 6\"" : "Торцевая тумба 12\" (тестовый вариант)",
        noteEn: casingPass114
          ? "Ends at " + southWithOverhang + "\" with 1\" counter overhang — clears 114\" rear door casing."
          : "Ends at " + southWithOverhang + "\" with 1\" overhang — HITS 114\" rear door casing! Use 6\" end or verify tape.",
        noteEs: casingPass114
          ? "Termina en " + southWithOverhang + "\" con 1\" de vuelo — libra chambrana de puerta trasera (114\")."
          : "Termina en " + southWithOverhang + "\" con 1\" de vuelo — ¡CHOCA con chambrana (114\")! Usa 6\" o verifica cinta.",
        noteRu: casingPass114
          ? "Заканчивается на " + southWithOverhang + "\" со свесом столешницы 1\" — не задевает наличник задней двери (114\")."
          : "Заканчивается на " + southWithOverhang + "\" со свесом 1\" — УПИРАЕТСЯ в наличник двери (114\")! Выберите модуль 6\" или проверьте рулеткой." },
      { id: "E-B1", wall: "East", start: 0, w: 36, d: 24, status: "hold",
        en: "East Corner Return (D04 Subpanel Behind Wall)",
        es: "Retorno Esquinero Este (Subpanel D04 Atrás)",
        ru: "Восточное крыло угла (за стеной подщит D04)",
        noteEn: "STOP: Subpanel D04 sits behind wall 6\"–38\" from SE. NO screws 53\"–77\" off finished floor!",
        noteEs: "ALTO: Subpanel D04 está atrás entre 6\"–38\" desde SE. ¡CERO tornillos entre 53\" y 77\" de altura!",
        noteRu: "СТОП: Подщит D04 находится за стеной на 6\"–38\" от ЮВ. НИКАКИХ саморезов на высоте 53\"–77\" от чистового пола!" },
      { id: "E-B2", wall: "East", start: 36, w: 18, d: 24, status: "locked",
        en: "18\" East Drawer Base Cabinet",
        es: "Gabinete Bajo de Cajones Este (18\")",
        ru: "Восточная тумба с ящиками 18\"",
        noteEn: "36\"–54\" calculated north from SE corner. Verify door and drawer swing on site.",
        noteEs: "36\"–54\" calculadas al norte desde la esquina SE. Verificar en obra el giro de puerta y cajones.",
        noteRu: "36\"–54\" на север от угла ЮВ (по расчёту). Проверить на месте ход фасадов и выдвижных ящиков." },
      { id: "E-U2", wall: "East", start: 24, w: 30, d: 12, status: "locked",
        en: '30" upper beside refrigerator',
        es: 'Gabinete alto de 30" junto al refrigerador',
        ru: 'Верхний шкаф 30" рядом с холодильником',
        noteEn: '24"–54" calculated north from SE corner. Verify backing and panel clearance.',
        noteEs: '24"–54" calculadas al norte desde la esquina SE. Verificar refuerzo y paso al tablero.',
        noteRu: '24"–54" на север от угла ЮВ. Проверить закладные и отступ от зоны щита.' },
      { id: "E-A1", wall: "East", start: 54, w: 28, d: 28.5, status: "locked",
        en: "Haier Counter-Depth Fridge Bay (28\" Wide)",
        es: "Espacio Refrigerador Haier (28\" Ancho)",
        ru: "Ниша под холодильник Haier (ширина 28\")",
        noteEn: "54\"–82\" calculated north from SE. Fridge is 27-9/16\" W × 26-9/16\" D + 2\" rear gap. NOTHING above fridge (locked).",
        noteEs: "54\"–82\" calculadas al norte desde SE. Mide 27-9/16\" × 26-9/16\" + 2\" atrás. NADA arriba del refrigerador (fijo).",
        noteRu: "54\"–82\" на север от угла ЮВ. Корпус 27-9/16\" Ш × 26-9/16\" Г + 2\" зазор сзади. СВЕРХУ БЕЗ ШКАФОВ (утверждено)." }
    ];

    return {
      endW: endW,
      sinkStart: sinkStart,
      sinkEnd: sinkEnd,
      trashW: trashW,
      dwStart: dwStart,
      endStart: endStart,
      southCabTotal: southCabTotal,
      southWithOverhang: southWithOverhang,
      casingPass114: casingPass114,
      casingPass115: casingPass115,
      southEndWalk: southEndWalk,
      rangeStepWalk: rangeStepWalk,
      narrowestWalk: narrowestWalk,
      floorOffset: floorOffset,
      cabinets: cabinets
    };
  }

  function syncUnderlyingPrintEngine() {
    try {
      var idEnd = state.southEnd === "12" ? "btn-south-12in" : "btn-south-6in";
      var idSink = state.sinkBasis === "tape" ? "btn-sink-tape" : "btn-sink-nov2";
      var idFloor = state.floorDown ? "btn-floor-finished" : "btn-floor-bare";
      var elEnd = document.getElementById(idEnd);
      var elSink = document.getElementById(idSink);
      var elFloor = document.getElementById(idFloor);
      if (elEnd) elEnd.click();
      if (elSink) elSink.click();
      if (elFloor) elFloor.click();
    } catch (_) {}
  }

  function renderFloorPlanSvg(m) {
    var S = 2.55;
    var ox = 52;
    var oy = 40;
    var W = 147 * S;
    var H = 126.25 * S;
    var recW = 31.5 * S;
    var rangeH = 66.25 * S;

    var xLeft = ox;
    var xRange = ox + recW;
    var xEast = ox + W;
    var yNorth = oy;
    var yStep = oy + rangeH;
    var ySouth = oy + H;

    function selStroke(id, defStroke) {
      return state.selectedId === id ? "#184E77" : defStroke;
    }
    function selWidth(id) {
      return state.selectedId === id ? 2.6 : 1.3;
    }

    function sx(fromSE, wIn) {
      return xEast - (fromSE + wIn) * S;
    }

    var endColor = m.casingPass114 ? "#E5F4EC" : "#FEECEB";
    var endStroke = m.casingPass114 ? "#1B6B46" : "#B42318";
    var sinkColor = "#FDF2E4";
    var cabColor = "#EEF4F0";
    var appColor = "#E6F0F8";

    var svg =
      '<svg viewBox="0 0 490 412" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(L("True-scale interactive kitchen floor plan", "Planta interactiva de cocina a escala real", "Интерактивный план кухни в масштабе 1:1")) + '">' +
        '<g transform="translate(454,30)">' +
          '<circle r="17" fill="#F6F8FA" stroke="#C2CCD6" stroke-width="1"/>' +
          '<line x1="0" y1="-12" x2="0" y2="12" stroke="#184E77" stroke-width="1.2"/>' +
          '<line x1="-12" y1="0" x2="12" y2="0" stroke="#94A3B8" stroke-width="1"/>' +
          '<polygon points="0,-13 -3.5,-6 3.5,-6" fill="#184E77"/>' +
          '<text x="0" y="-19" text-anchor="middle" font-size="8" font-weight="800" fill="#184E77">' + L("N", "N", "С") + '</text>' +
          '<text x="0" y="25" text-anchor="middle" font-size="7" font-weight="700" fill="#6E7D8C">' + L("S", "S", "Ю") + '</text>' +
          '<text x="-22" y="2.5" text-anchor="middle" font-size="7" font-weight="700" fill="#6E7D8C">' + L("W", "O", "З") + '</text>' +
          '<text x="22" y="2.5" text-anchor="middle" font-size="7" font-weight="700" fill="#6E7D8C">' + L("E", "E", "В") + '</text>' +
        "</g>" +

        '<path d="M ' + xRange.toFixed(1) + " " + yNorth.toFixed(1) +
          " L " + xEast.toFixed(1) + " " + yNorth.toFixed(1) +
          " L " + xEast.toFixed(1) + " " + ySouth.toFixed(1) +
          " L " + xLeft.toFixed(1) + " " + ySouth.toFixed(1) +
          " L " + xLeft.toFixed(1) + " " + yStep.toFixed(1) +
          " L " + xRange.toFixed(1) + " " + yStep.toFixed(1) + ' Z" fill="#FCFDFE" stroke="#131A22" stroke-width="2.4"/>' +

        '<text x="' + ((xRange + xEast) / 2).toFixed(1) + '" y="22" text-anchor="middle" font-size="9.5" font-weight="800" fill="#131A22">' +
          L('NORTH WALL (OPEN) · 115-1/2"', 'MURO NORTE ABIERTO · 115-1/2"', 'СЕВЕРНАЯ СТЕНА (ОТКРЫТА) · 115-1/2"') + "</text>" +
        '<text x="' + (xRange - 8).toFixed(1) + '" y="' + ((yNorth + yStep) / 2).toFixed(1) + '" text-anchor="middle" font-size="8.5" font-weight="800" fill="#184E77" transform="rotate(-90 ' + (xRange - 12).toFixed(1) + " " + ((yNorth + yStep) / 2).toFixed(1) + ')">' +
          L('WEST RANGE 66-1/4"', 'OESTE ESTUFA 66-1/4"', 'ЗАПАД ПЛИТА 66-1/4"') + "</text>" +
        '<text x="' + ((xLeft + xEast) / 2).toFixed(1) + '" y="' + (ySouth + 36).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#131A22">' +
          L('SOUTH WALL 147" · Usable to door casing: 114" (tape) / 115" (scan)', 'MURO SUR 147" · Útil hasta chambrana: 114" (cinta) / 115" (escaneo)', 'ЮЖНАЯ СТЕНА 147" · До наличника двери: 114" (рулетка) / 115" (скан)') + "</text>" +
        '<text x="' + (xEast + 22).toFixed(1) + '" y="' + ((yNorth + ySouth) / 2).toFixed(1) + '" text-anchor="middle" font-size="8.5" font-weight="800" fill="#131A22" transform="rotate(90 ' + (xEast + 22).toFixed(1) + " " + ((yNorth + ySouth) / 2).toFixed(1) + ')">' +
          L('EAST WALL 126-1/4" (88" usable)', 'MURO ESTE 126-1/4" (88" útiles)', 'ВОСТОЧНАЯ СТЕНА 126-1/4" (88" полезн.)') + "</text>" +

        '<line x1="' + (xEast - 29.375 * S).toFixed(1) + '" y1="' + yNorth.toFixed(1) + '" x2="' + xEast.toFixed(1) + '" y2="' + yNorth.toFixed(1) + '" stroke="#FFFFFF" stroke-width="4"/>' +
        '<line x1="' + (xEast - 29.375 * S).toFixed(1) + '" y1="' + yNorth.toFixed(1) + '" x2="' + xEast.toFixed(1) + '" y2="' + yNorth.toFixed(1) + '" stroke="#184E77" stroke-width="1.4" stroke-dasharray="4 3"/>' +
        '<text x="' + (xEast - 14.7 * S).toFixed(1) + '" y="' + (yNorth + 12).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-weight="700" fill="#184E77">' + L('Hall 29-3/8"', 'Pasillo 29-3/8"', 'Коридор 29-3/8"') + "</text>" +

        '<g class="kfp-hit" data-cab="W-B2" style="cursor:pointer">' +
          '<rect x="' + xRange.toFixed(1) + '" y="' + (yNorth + 0.25 * S).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18 * S).toFixed(1) + '" fill="' + cabColor + '" stroke="' + selStroke("W-B2", "#2D4A3E") + '" stroke-width="' + selWidth("W-B2") + '"/>' +
          '<text x="' + (xRange + 12 * S).toFixed(1) + '" y="' + (yNorth + 10.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#131A22">' + L('18" Base', '18" Bajo', '18" тумба') + '</text>' +
        "</g>" +
        '<g class="kfp-hit" data-cab="W-A1" style="cursor:pointer">' +
          '<rect x="' + xRange.toFixed(1) + '" y="' + (yNorth + 18.25 * S).toFixed(1) + '" width="' + (28 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" fill="' + appColor + '" stroke="' + selStroke("W-A1", "#184E77") + '" stroke-width="' + selWidth("W-A1") + '"/>' +
          '<text x="' + (xRange + 14 * S).toFixed(1) + '" y="' + (yNorth + 31.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.6" font-weight="800" fill="#184E77">VIKING 30"</text>' +
          '<text x="' + (xRange + 14 * S).toFixed(1) + '" y="' + (yNorth + 37.5 * S).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#485563">' + L("No uppers", "Sin gab. altos", "Без верхних") + "</text>" +
        "</g>" +
        '<g class="kfp-hit" data-cab="W-B1" style="cursor:pointer">' +
          '<rect x="' + xRange.toFixed(1) + '" y="' + (yNorth + 48.25 * S).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18 * S).toFixed(1) + '" fill="' + cabColor + '" stroke="' + selStroke("W-B1", "#2D4A3E") + '" stroke-width="' + selWidth("W-B1") + '"/>' +
          '<text x="' + (xRange + 12 * S).toFixed(1) + '" y="' + (yNorth + 58.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#131A22">' + L('18" Base', '18" Bajo', '18" тумба') + '</text>' +
        "</g>" +

        '<g class="kfp-hit" data-cab="E-A1" style="cursor:pointer">' +
          '<rect x="' + (xEast - 28.5 * S).toFixed(1) + '" y="' + (ySouth - 82 * S).toFixed(1) + '" width="' + (28.5 * S).toFixed(1) + '" height="' + (28 * S).toFixed(1) + '" fill="' + appColor + '" stroke="' + selStroke("E-A1", "#184E77") + '" stroke-width="' + selWidth("E-A1") + '"/>' +
          '<text x="' + (xEast - 14.25 * S).toFixed(1) + '" y="' + (ySouth - 68.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.4" font-weight="800" fill="#184E77">' + L("HAIER FRIDGE", "REFRI HAIER", "ХОЛОД. HAIER") + "</text>" +
          '<text x="' + (xEast - 14.25 * S).toFixed(1) + '" y="' + (ySouth - 62.5 * S).toFixed(1) + '" text-anchor="middle" font-size="6.9" font-weight="700" fill="#485563">28" ' + L("bay", "libre", "ниша") + "</text>" +
        "</g>" +
        '<g class="kfp-hit" data-cab="E-B2" style="cursor:pointer">' +
          '<rect x="' + (xEast - 24 * S).toFixed(1) + '" y="' + (ySouth - 54 * S).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18 * S).toFixed(1) + '" fill="' + cabColor + '" stroke="' + selStroke("E-B2", "#2D4A3E") + '" stroke-width="' + selWidth("E-B2") + '"/>' +
          '<text x="' + (xEast - 12 * S).toFixed(1) + '" y="' + (ySouth - 45 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#131A22">18" ' + L("Drw", "Caj.", "ящ.") + "</text>" +
        "</g>" +

        '<g class="kfp-hit" data-cab="S-B1" style="cursor:pointer">' +
          '<path d="M ' + (xEast - 24 * S).toFixed(1) + " " + (ySouth - 36 * S).toFixed(1) +
            " L " + xEast.toFixed(1) + " " + (ySouth - 36 * S).toFixed(1) +
            " L " + xEast.toFixed(1) + " " + ySouth.toFixed(1) +
            " L " + (xEast - 36 * S).toFixed(1) + " " + ySouth.toFixed(1) +
            " L " + (xEast - 36 * S).toFixed(1) + " " + (ySouth - 24 * S).toFixed(1) +
            " L " + (xEast - 24 * S).toFixed(1) + " " + (ySouth - 24 * S).toFixed(1) + ' Z" fill="' + cabColor + '" stroke="' + selStroke("S-B1", "#2D4A3E") + '" stroke-width="' + selWidth("S-B1") + '"/>' +
          '<text x="' + (xEast - 17 * S).toFixed(1) + '" y="' + (ySouth - 10 * S).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#131A22">' + L('SE 36"', 'SE 36"', 'ЮВ 36"') + '</text>' +
        "</g>" +
        '<line x1="' + (xEast + 3).toFixed(1) + '" y1="' + (ySouth - 38 * S).toFixed(1) + '" x2="' + (xEast + 3).toFixed(1) + '" y2="' + (ySouth - 6 * S).toFixed(1) + '" stroke="#B42318" stroke-width="3.5"/>' +
        '<text x="' + (xEast + 11).toFixed(1) + '" y="' + (ySouth - 22 * S).toFixed(1) + '" font-size="7.2" font-weight="800" fill="#B42318">D04</text>' +

        '<g class="kfp-hit" data-cab="S-B2" style="cursor:pointer">' +
          '<rect x="' + sx(36, m.trashW).toFixed(1) + '" y="' + (ySouth - 24 * S).toFixed(1) + '" width="' + (m.trashW * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="' + cabColor + '" stroke="' + selStroke("S-B2", "#2D4A3E") + '" stroke-width="' + selWidth("S-B2") + '"/>' +
          '<text x="' + (sx(36, m.trashW) + m.trashW * S / 2).toFixed(1) + '" y="' + (ySouth - 13 * S).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="800" fill="#131A22">' + L("Trash", "Bas.", "Мусор") + "</text>" +
          '<text x="' + (sx(36, m.trashW) + m.trashW * S / 2).toFixed(1) + '" y="' + (ySouth - 7.5 * S).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#485563">' + m.trashW + '"</text>' +
        "</g>" +
        '<g class="kfp-hit" data-cab="S-A1" style="cursor:pointer">' +
          '<rect x="' + sx(m.dwStart, 24).toFixed(1) + '" y="' + (ySouth - 24 * S).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="' + appColor + '" stroke="' + selStroke("S-A1", "#184E77") + '" stroke-width="' + selWidth("S-A1") + '"/>' +
          '<text x="' + (sx(m.dwStart, 24) + 12 * S).toFixed(1) + '" y="' + (ySouth - 11.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#184E77">' + L('DW 24"', 'LV 24"', 'ПММ 24"') + '</text>' +
        "</g>" +
        '<g class="kfp-hit" data-cab="S-B3" style="cursor:pointer">' +
          '<rect x="' + sx(m.sinkStart, 30).toFixed(1) + '" y="' + (ySouth - 24 * S).toFixed(1) + '" width="' + (30 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="' + sinkColor + '" stroke="' + selStroke("S-B3", "#A15206") + '" stroke-width="' + selWidth("S-B3") + '"/>' +
          '<rect x="' + (sx(m.sinkStart, 30) + 5 * S).toFixed(1) + '" y="' + (ySouth - 20 * S).toFixed(1) + '" width="' + (20 * S).toFixed(1) + '" height="' + (15 * S).toFixed(1) + '" rx="3" fill="#FFFFFF" stroke="#A15206" stroke-width="1"/>' +
          '<text x="' + (sx(m.sinkStart, 30) + 15 * S).toFixed(1) + '" y="' + (ySouth - 11 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#A15206">' + L('SINK 30"', 'TARJA 30"', 'МОЙКА 30"') + "</text>" +
        "</g>" +
        '<g class="kfp-hit" data-cab="S-F1" style="cursor:pointer">' +
          '<rect x="' + sx(m.endStart, m.endW).toFixed(1) + '" y="' + (ySouth - 24 * S).toFixed(1) + '" width="' + (m.endW * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="' + endColor + '" stroke="' + selStroke("S-F1", endStroke) + '" stroke-width="' + selWidth("S-F1") + '"/>' +
          '<text x="' + (sx(m.endStart, m.endW) + m.endW * S / 2).toFixed(1) + '" y="' + (ySouth - 11 * S).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="800" fill="' + endStroke + '">' + m.endW + '"</text>' +
        "</g>" +

        '<line x1="' + sx(72.87, 33.81).toFixed(1) + '" y1="' + ySouth.toFixed(1) + '" x2="' + sx(72.87, 0).toFixed(1) + '" y2="' + ySouth.toFixed(1) + '" stroke="#6FB3E6" stroke-width="5"/>' +
        '<text x="' + sx(89.8, 0).toFixed(1) + '" y="' + (ySouth + 14).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-weight="800" fill="#184E77">' + L('Window (CL 90")', 'Ventana (eje 90")', 'Окно (ось 90")') + "</text>" +

        '<line x1="' + (xEast - 114 * S).toFixed(1) + '" y1="' + (ySouth - 30 * S).toFixed(1) + '" x2="' + (xEast - 114 * S).toFixed(1) + '" y2="' + (ySouth + 16).toFixed(1) + '" stroke="#B42318" stroke-width="1.5" stroke-dasharray="4 2"/>' +
        '<text x="' + (xEast - 114 * S - 3).toFixed(1) + '" y="' + (ySouth + 14).toFixed(1) + '" text-anchor="end" font-size="7.4" font-weight="800" fill="#B42318">' + L('Door 114"', 'Puerta 114"', 'Дверь 114"') + "</text>" +

        '<line x1="' + xLeft.toFixed(1) + '" y1="' + (ySouth - 12 * S).toFixed(1) + '" x2="' + (sx(m.endStart, m.endW) - 1 * S).toFixed(1) + '" y2="' + (ySouth - 12 * S).toFixed(1) + '" stroke="' + (m.southEndWalk >= 32 ? "#1B6B46" : "#B42318") + '" stroke-width="1.8"/>' +
        '<rect x="' + ((xLeft + sx(m.endStart, m.endW)) / 2 - 30).toFixed(1) + '" y="' + (ySouth - 12 * S - 10).toFixed(1) + '" width="60" height="17" rx="4" fill="#FFFFFF" stroke="' + (m.southEndWalk >= 32 ? "#1B6B46" : "#B42318") + '" stroke-width="1"/>' +
        '<text x="' + ((xLeft + sx(m.endStart, m.endW)) / 2).toFixed(1) + '" y="' + (ySouth - 12 * S + 1.5).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="800" fill="' + (m.southEndWalk >= 32 ? "#1B6B46" : "#B42318") + '">' + fmtIn(m.southEndWalk) + " " + L("clear", "paso", "своб.") + "</text>" +

        '<line x1="' + (xRange + 14 * S).toFixed(1) + '" y1="' + yStep.toFixed(1) + '" x2="' + (xRange + 14 * S).toFixed(1) + '" y2="' + (ySouth - 25.5 * S).toFixed(1) + '" stroke="#184E77" stroke-width="1.8"/>' +
        '<rect x="' + (xRange + 14 * S - 38).toFixed(1) + '" y="' + ((yStep + ySouth - 25.5 * S) / 2 - 9).toFixed(1) + '" width="76" height="17" rx="4" fill="#E6F0F8" stroke="#184E77" stroke-width="1"/>' +
        '<text x="' + (xRange + 14 * S).toFixed(1) + '" y="' + ((yStep + ySouth - 25.5 * S) / 2 + 2.5).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="800" fill="#184E77">34-1/2" ' + L("pass", "paso", "проход") + "</text>" +

        '<line x1="' + (xRange + 28 * S).toFixed(1) + '" y1="' + (yNorth + 35 * S).toFixed(1) + '" x2="' + (xEast - 28.5 * S).toFixed(1) + '" y2="' + (yNorth + 35 * S).toFixed(1) + '" stroke="#6E7D8C" stroke-width="1.2" stroke-dasharray="4 3"/>' +
        '<text x="' + ((xRange + 28 * S + xEast - 28.5 * S) / 2).toFixed(1) + '" y="' + (yNorth + 31 * S).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="700" fill="#485563">58-7/8" ' + L("range to fridge", "estufa a refri", "от плиты до холод.") + "</text>" +

        '<circle cx="' + xEast.toFixed(1) + '" cy="' + ySouth.toFixed(1) + '" r="4.5" fill="#184E77"/>' +
        '<text x="' + (xEast + 6).toFixed(1) + '" y="' + (ySouth + 14).toFixed(1) + '" font-size="7.8" font-weight="800" fill="#184E77">' + L('SE 0"', 'SE 0"', 'ЮВ 0"') + '</text>' +
      "</svg>";

    return svg;
  }

  function renderWallElevationSvg(m) {
    var offNote = state.floorDown
      ? L("From finished floor", "Desde piso terminado", "От чистового пола")
      : L("From bare subfloor (+3/4\" added)", "Desde subpiso (+3/4\" incluido)", "От чернового пола (+3/4\" добавлено)");
    var ctrH = 36 + m.floorOffset;
    var d04Low = 53 + m.floorOffset;
    var d04High = 77 + m.floorOffset;

    if (state.wallTab === "west") {
      var hoodLow = 68 + m.floorOffset;
      var hoodHigh = 72 + m.floorOffset;
      return '<svg viewBox="0 0 460 250" xmlns="http://www.w3.org/2000/svg">' +
        '<text x="230" y="18" text-anchor="middle" font-size="9.6" font-weight="800" fill="#184E77">' +
          L('WEST WALL — RANGE & HOOD (66-1/4" SOUTH → NORTH)', 'MURO OESTE — ESTUFA Y CAMPANA (66-1/4" DE SUR A NORTE)', 'ЗАПАДНАЯ СТЕНА — ПЛИТА И ВЫТЯЖКА (66-1/4" С ЮГА НА СЕВЕР)') + "</text>" +
        '<text x="230" y="31" text-anchor="middle" font-size="8.0" font-weight="700" fill="#485563">' + esc(offNote) + ' · ' + L("Ceiling 121-1/2\" · NO UPPER CABINETS", "Techo 121-1/2\" · SIN GABINETES ALTOS", "Потолок 121-1/2\" · БЕЗ ВЕРХНИХ ШКАФОВ") + "</text>" +
        '<line x1="35" y1="44" x2="425" y2="44" stroke="#131A22" stroke-width="1.8"/>' +
        '<line x1="35" y1="214" x2="425" y2="214" stroke="#131A22" stroke-width="2.2"/>' +
        '<rect x="64" y="44" width="332" height="170" fill="#FAFBFD" stroke="#D9DEDC" stroke-width="1"/>' +
        '<text x="122" y="88" text-anchor="middle" font-size="7.4" font-weight="700" fill="#2f6b3f">' + L("FULL-HEIGHT TILE", "AZULEJO HASTA TECHO", "ПЛИТКА ДО ПОТОЛКА") + "</text>" +
        '<text x="338" y="88" text-anchor="middle" font-size="7.4" font-weight="700" fill="#2f6b3f">' + L("NO UPPERS (LOCKED)", "SIN ALTOS (FIJO)", "БЕЗ ВЕРХНИХ (УТВ.)") + "</text>" +
        '<rect x="208" y="44" width="44" height="58" fill="#E3EEF2" stroke="#1f5f7a" stroke-width="1.4"/>' +
        '<polygon points="208,102 252,102 305,126 155,126" fill="#DCE4E8" stroke="#1f5f7a" stroke-width="1.8"/>' +
        '<text x="230" y="118" text-anchor="middle" font-size="8.2" font-weight="800" fill="#1d2326">ZEPHYR 30"</text>' +
        '<text x="230" y="75" text-anchor="middle" font-size="7" font-weight="700" fill="#1f5f7a">8-5/8"</text>' +
        '<text x="230" y="142" text-anchor="middle" font-size="7.6" font-weight="700" fill="#1f5f7a">' +
          L("Hood bottom: ", "Borde campana: ", "Низ вытяжки: ") + fmtIn(hoodLow) + "–" + fmtIn(hoodHigh) + "</text>" +
        '<rect x="64" y="158" width="90" height="56" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.5"/>' +
        '<text x="109" y="189" text-anchor="middle" font-size="8.2" font-weight="800" fill="#131A22">' + L('18" Base (S)', '18" Bajo (S)', '18" тумба (Ю)') + '</text>' +
        '<rect x="154" y="158" width="150" height="56" fill="#E6F0F8" stroke="#184E77" stroke-width="1.8"/>' +
        '<text x="229" y="184" text-anchor="middle" font-size="9.2" font-weight="800" fill="#184E77">VIKING 30"</text>' +
        '<text x="229" y="198" text-anchor="middle" font-size="7.4" fill="#485563">' + L('Center 33" from South', 'Eje 33" desde Sur', 'Ось 33" от Юга') + "</text>" +
        '<rect x="304" y="158" width="92" height="56" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.5"/>' +
        '<text x="350" y="189" text-anchor="middle" font-size="8.2" font-weight="800" fill="#131A22">' + L('18" Base (N)', '18" Bajo (N)', '18" тумба (С)') + '</text>' +
        '<text x="64" y="232" font-size="8.2" font-weight="800" fill="#184E77">0" (' + L("South", "Sur", "Юг") + ")</text>" +
        '<text x="229" y="232" text-anchor="middle" font-size="8" font-weight="700" fill="#485563">33" ' + L("CL", "Eje", "ось") + '</text>' +
        '<text x="396" y="232" text-anchor="end" font-size="8.2" font-weight="800" fill="#184E77">66-1/4" (' + L("North", "Norte", "Север") + ")</text>" +
      "</svg>";
    }

    if (state.wallTab === "north") {
      return '<svg viewBox="0 0 460 250" xmlns="http://www.w3.org/2000/svg">' +
        '<text x="230" y="18" text-anchor="middle" font-size="9.4" font-weight="800" fill="#184E77">' +
          L('NORTH WALL (115-1/2" · BORDERS EXTERIOR LANDING & HALLWAY)', 'MURO NORTE (115-1/2" · COLINDA CON DESCANSO EXTERIOR Y PASILLO)', 'СЕВЕРНАЯ СТЕНА (115-1/2" · ГРАНИЧИТ С ПЛОЩАДКОЙ И КОРИДОРОМ)') + "</text>" +
        '<text x="230" y="31" text-anchor="middle" font-size="8.0" font-weight="700" fill="#485563">' +
          L("No cabinets on North wall · Open entry into Hallway / Dining on East", "Sin gabinetes · Paso libre hacia Pasillo / Comedor (lado Este)", "Без шкафов на северной стене · Открытый вход в коридор / столовую") + "</text>" +
        '<line x1="35" y1="44" x2="425" y2="44" stroke="#131A22" stroke-width="1.8"/>' +
        '<line x1="35" y1="214" x2="425" y2="214" stroke="#131A22" stroke-width="2.2"/>' +
        '<rect x="44" y="158" width="76" height="56" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.5"/>' +
        '<text x="82" y="184" text-anchor="middle" font-size="7.8" font-weight="800" fill="#131A22">' + L("West Return", "Retorno", "Торец Запада") + "</text>" +
        '<text x="82" y="196" text-anchor="middle" font-size="7.4" fill="#485563">24" ' + L("D", "F", "Г") + '</text>' +
        '<rect x="120" y="54" width="188" height="160" fill="#F4F5F3" stroke="#9AA5B1" stroke-width="1.3" stroke-dasharray="4 3"/>' +
        '<text x="214" y="114" text-anchor="middle" font-size="8.6" font-weight="800" fill="#1d2326">' + L("OPEN NORTH WALL", "MURO NORTE LIBRE", "СВОБОДНАЯ СЕВЕРНАЯ СТЕНА") + "</text>" +
        '<text x="214" y="130" text-anchor="middle" font-size="7.5" fill="#5d686d">' + L("Behind: Exterior Front Door 4 landing", "Atrás: descanso exterior Puerta 4", "За стеной: площадка у двери 4") + "</text>" +
        '<text x="214" y="144" text-anchor="middle" font-size="7.3" fill="#5d686d">' + L("(Zero cabinets — clear walkway)", "(Sin gabinetes — paso limpio)", "(Ноль шкафов — свободный проход)") + "</text>" +
        '<rect x="308" y="66" width="104" height="148" fill="#E4F0E6" stroke="#2f6b3f" stroke-width="1.6"/>' +
        '<text x="360" y="132" text-anchor="middle" font-size="8.6" font-weight="800" fill="#2f6b3f">' + L("OPEN TO", "PASO AL", "ПРОХОД В") + "</text>" +
        '<text x="360" y="146" text-anchor="middle" font-size="8.6" font-weight="800" fill="#2f6b3f">' + L("HALLWAY", "PASILLO", "КОРИДОР") + "</text>" +
        '<text x="360" y="162" text-anchor="middle" font-size="7.1" fill="#2f6b3f">' + L("Next to Fridge (E)", "Junto a Refri (E)", "У холодильника (В)") + "</text>" +
        '<text x="44" y="232" font-size="8.2" font-weight="800" fill="#184E77">' + L("← West (Range)", "← Oeste (Estufa)", "← Запад (Плита)") + "</text>" +
        '<text x="412" y="232" text-anchor="end" font-size="8.2" font-weight="800" fill="#184E77">' + L("East (Hall) →", "Este (Pasillo) →", "Восток (Коридор) →") + "</text>" +
      "</svg>";
    }

    if (state.wallTab === "east") {
      return '<svg viewBox="0 0 460 250" xmlns="http://www.w3.org/2000/svg">' +
        '<text x="230" y="18" text-anchor="middle" font-size="9.6" font-weight="800" fill="#184E77">' +
          L('EAST WALL (88" USABLE FROM SE CORNER 0" → NORTH)', 'MURO ESTE (88" ÚTILES DESDE ESQUINA SE 0" → NORTE)', 'ВОСТОЧНАЯ СТЕНА (88" ПОЛЕЗНЫХ ОТ УГЛА ЮВ 0" → СЕВЕР)') + "</text>" +
        '<text x="230" y="31" text-anchor="middle" font-size="8.2" font-weight="700" fill="#485563">' + esc(offNote) + "</text>" +
        '<line x1="35" y1="44" x2="425" y2="44" stroke="#131A22" stroke-width="1.8"/>' +
        '<line x1="35" y1="214" x2="425" y2="214" stroke="#131A22" stroke-width="2.2"/>' +
        '<rect x="65" y="96" width="128" height="44" fill="#FEECEB" stroke="#B42318" stroke-width="1.6" stroke-dasharray="5 3"/>' +
        '<text x="129" y="114" text-anchor="middle" font-size="8.4" font-weight="800" fill="#B42318">' + L("D04 SUBPANEL BEHIND", "SUBPANEL D04 ATRÁS", "ПОДЩИТ D04 ЗА СТЕНОЙ") + "</text>" +
        '<text x="129" y="127" text-anchor="middle" font-size="7.6" font-weight="700" fill="#B42318">' +
          L("NO SCREWS ", "SIN TORNILLOS ", "БЕЗ САМОРЕЗОВ ") + fmtIn(d04Low) + "–" + fmtIn(d04High) + "</text>" +
        '<rect x="40" y="160" width="144" height="54" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.5"/>' +
        '<text x="112" y="190" text-anchor="middle" font-size="8.6" font-weight="800" fill="#131A22">' + L('SE Corner 36"', 'Esquina SE 36"', 'Угол ЮВ 36"') + '</text>' +
        '<rect x="184" y="160" width="72" height="54" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.5"/>' +
        '<text x="220" y="190" text-anchor="middle" font-size="8.6" font-weight="800" fill="#131A22">18" ' + L("Drawers", "Cajones", "ящики") + "</text>" +
        '<rect x="256" y="108" width="112" height="106" fill="#E6F0F8" stroke="#184E77" stroke-width="1.8"/>' +
        '<text x="312" y="156" text-anchor="middle" font-size="9.5" font-weight="800" fill="#184E77">HAIER 28"</text>' +
        '<text x="312" y="170" text-anchor="middle" font-size="7.6" fill="#485563">69-7/8" ' + L("H", "Alto", "В") + '</text>' +
        '<rect x="136" y="64" width="120" height="71" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.5"/>' +
        '<text x="196" y="101" text-anchor="middle" font-size="8.2" font-weight="800" fill="#131A22">' + L('30" UPPER', 'ALTO 30"', 'ВЕРХНИЙ 30"') + "</text>" +
        '<rect x="260" y="56" width="104" height="36" rx="6" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.2" stroke-dasharray="4 2"/>' +
        '<text x="312" y="72" text-anchor="middle" font-size="7.8" font-weight="800" fill="#1B6B46">' + L("NOTHING ABOVE", "NADA ARRIBA", "ПУСТО СВЕРХУ") + "</text>" +
        '<text x="312" y="83" text-anchor="middle" font-size="6.8" fill="#1B6B46">' + L("(Owner locked)", "(Decisión fija)", "(Утверждено)") + "</text>" +
        '<text x="40" y="232" font-size="8.2" font-weight="800" fill="#184E77">0" (' + L("SE", "SE", "ЮВ") + ')</text>' +
        '<text x="184" y="232" text-anchor="middle" font-size="8" fill="#485563">36"</text>' +
        '<text x="256" y="232" text-anchor="middle" font-size="8" fill="#485563">54"</text>' +
        '<text x="368" y="232" text-anchor="end" font-size="8.2" font-weight="800" fill="#184E77">82" (' + L("calculated", "calculadas", "расчёт") + ")</text>" +
        '<text x="418" y="164" text-anchor="end" font-size="7.5" font-weight="700" fill="#485563">' + fmtIn(ctrH) + "</text>" +
      "</svg>";
    }

    var Sx = 3.2;
    var x0 = 42;
    return '<svg viewBox="0 0 460 255" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="9.4" font-weight="800" fill="#184E77">' +
        L('SOUTH WALL (SE CORNER 0" → WEST TO REAR DOOR CASING)', 'MURO SUR (DE ESQUINA SE 0" → OESTE HASTA PUERTA TRASERA)', 'ЮЖНАЯ СТЕНА (ОТ УГЛА ЮВ 0" → НА ЗАПАД ДО НАЛИЧНИКА ДВЕРИ)') + "</text>" +
      '<text x="230" y="31" text-anchor="middle" font-size="8.2" font-weight="700" fill="#485563">' + esc(offNote) + ' · ' + L("Countertop at ", "Cubierta a ", "Столешница на ") + fmtIn(ctrH) + "</text>" +
      '<line x1="32" y1="44" x2="432" y2="44" stroke="#131A22" stroke-width="1.8"/>' +
      '<line x1="32" y1="216" x2="432" y2="216" stroke="#131A22" stroke-width="2.2"/>' +
      '<rect x="' + (x0 + 26 * Sx).toFixed(1) + '" y="94" width="' + (33 * Sx).toFixed(1) + '" height="66" fill="#FDF2E4" stroke="#A15206" stroke-width="1.4" stroke-dasharray="4 3"/>' +
      '<text x="' + (x0 + 42.5 * Sx).toFixed(1) + '" y="122" text-anchor="middle" font-size="7.8" font-weight="800" fill="#A15206">' + L("SEAL AND COVER RECESS", "SELLAR Y TAPAR NICHO", "ЗАШИТЬ БЫВШУЮ НИШУ") + "</text>" +
      '<text x="' + (x0 + 42.5 * Sx).toFixed(1) + '" y="135" text-anchor="middle" font-size="7.2" fill="#A15206">~26"–59" (' + L("measure", "medir", "замерить") + ")</text>" +
      '<rect x="' + (x0 + 72.87 * Sx).toFixed(1) + '" y="62" width="' + (33.81 * Sx).toFixed(1) + '" height="86" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
      '<line x1="' + (x0 + 89.78 * Sx).toFixed(1) + '" y1="56" x2="' + (x0 + 89.78 * Sx).toFixed(1) + '" y2="160" stroke="#184E77" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="' + (x0 + 89.78 * Sx).toFixed(1) + '" y="106" text-anchor="middle" font-size="8.4" font-weight="800" fill="#184E77">' + L("SOUTH WINDOW", "VENTANA SUR", "ЮЖНОЕ ОКНО") + "</text>" +
      '<text x="' + (x0 + 89.78 * Sx).toFixed(1) + '" y="118" text-anchor="middle" font-size="7.2" fill="#485563">' + L('Center 89-3/4"', 'Eje 89-3/4"', 'Ось 89-3/4"') + "</text>" +
      '<rect x="' + x0 + '" y="160" width="' + (36 * Sx).toFixed(1) + '" height="56" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.4"/>' +
      '<text x="' + (x0 + 18 * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="8.4" font-weight="800" fill="#131A22">' + L('SE 36"', 'SE 36"', 'ЮВ 36"') + '</text>' +
      '<rect x="' + (x0 + 36 * Sx).toFixed(1) + '" y="160" width="' + (m.trashW * Sx).toFixed(1) + '" height="56" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.4"/>' +
      '<text x="' + (x0 + (36 + m.trashW / 2) * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="7.6" font-weight="800" fill="#131A22">' + m.trashW + '"</text>' +
      '<rect x="' + (x0 + m.dwStart * Sx).toFixed(1) + '" y="160" width="' + (24 * Sx).toFixed(1) + '" height="56" fill="#E6F0F8" stroke="#184E77" stroke-width="1.4"/>' +
      '<text x="' + (x0 + (m.dwStart + 12) * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="8.2" font-weight="800" fill="#184E77">' + L('DW 24"', 'LV 24"', 'ПММ 24"') + '</text>' +
      '<rect x="' + (x0 + m.sinkStart * Sx).toFixed(1) + '" y="160" width="' + (30 * Sx).toFixed(1) + '" height="56" fill="#FDF2E4" stroke="#A15206" stroke-width="1.6"/>' +
      '<text x="' + (x0 + (m.sinkStart + 15) * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="8.4" font-weight="800" fill="#A15206">' + L('SINK 30"', 'TARJA 30"', 'МОЙКА 30"') + "</text>" +
      '<rect x="' + (x0 + m.endStart * Sx).toFixed(1) + '" y="160" width="' + (m.endW * Sx).toFixed(1) + '" height="56" fill="' + (m.casingPass114 ? "#E5F4EC" : "#FEECEB") + '" stroke="' + (m.casingPass114 ? "#1B6B46" : "#B42318") + '" stroke-width="1.6"/>' +
      '<text x="' + (x0 + (m.endStart + m.endW / 2) * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="7.8" font-weight="800" fill="' + (m.casingPass114 ? "#1B6B46" : "#B42318") + '">' + m.endW + '"</text>' +
      '<line x1="' + (x0 + 114 * Sx).toFixed(1) + '" y1="54" x2="' + (x0 + 114 * Sx).toFixed(1) + '" y2="224" stroke="#B42318" stroke-width="1.8" stroke-dasharray="4 3"/>' +
      '<text x="' + (x0 + 114 * Sx + 4).toFixed(1) + '" y="70" font-size="7.6" font-weight="800" fill="#B42318">114"</text>' +
      '<text x="' + (x0 + 114 * Sx + 4).toFixed(1) + '" y="80" font-size="7" fill="#B42318">' + L("Door", "Puerta", "Дверь") + "</text>" +
      '<text x="' + x0 + '" y="234" font-size="8" font-weight="800" fill="#184E77">' + L('SE 0"', 'SE 0"', 'ЮВ 0"') + '</text>' +
      '<text x="' + (x0 + m.sinkStart * Sx).toFixed(1) + '" y="234" text-anchor="middle" font-size="7.6" fill="#A15206">' + m.sinkStart + '"</text>' +
      '<text x="' + (x0 + m.sinkEnd * Sx).toFixed(1) + '" y="234" text-anchor="middle" font-size="7.6" fill="#A15206">' + m.sinkEnd + '"</text>' +
    "</svg>";
  }

  function renderEquipDrawer(m) {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="kfpEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        L("🔧 Equipment & Supplies ", "🔧 Equipo y suministros ", "🔧 Оборудование и материалы ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="kfpEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + L("Site Mockup Tools", "Herramientas de trazado", "Инструменты для разметки") + "</h4>" +
            "<ul>" +
              "<li>" + L("25 ft tape measure + laser level", "Cinta métrica 25 pies + nivel láser", "Рулетка 25 футов + лазерный уровень") + "</li>" +
              "<li>" + L("Blue painter's tape (mark sink & 6\" vs 12\" box)", "Cinta azul de pintor (marcar tarja y 6\" vs 12\")", "Синий малярный скотч (разметка мойки и модуля 6\" / 12\")") + "</li>" +
              "<li>" + L("Stud & live-wire finder (East wall D04 zone)", "Detector de vigas y cables (zona D04 muro Este)", "Детектор стоек и скрытой проводки (зона щита D04 на восточной стене)") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + L("Estimated Quantities (Zero Prices)", "Cantidades estimadas (sin precios)", "Расчётные объёмы (без цен)") + "</h4>" +
            "<ul>" +
              "<li>" + L("Base boxes: 6 cabinets + 1 end filler (" + m.endW + '")', "Gabinetes bajos: 6 cajas + 1 relleno (" + m.endW + '")', "Нижние тумбы: 6 модулей + 1 торцевая вставка (" + m.endW + '")') + "</li>" +
              "<li>" + L("Countertop area approx.: ~32.4 sq ft (verify after site tape)", "Cubierta total aprox.: ~32.4 ft² (verificar tras medidas)", "Площадь столешницы: ~32.4 кв. фута (уточнить после замера)") + "</li>" +
              "<li>" + L("Wrap-around backsplash tile: ~69 sq ft incl. +15% waste", "Azulejo cocina (Oeste + Sur + Este): ~69 ft² con +15%", "Плитка фартука по периметру (З + Ю + В): ~69 кв. футов с запасом +15%") + "</li>" +
              "<li>" + L("1/2\" HardieBacker: 5 sheets (3×5 ft) · check site stock first", "HardieBacker 1/2\": 5 hojas (3×5 pies) · revisar stock primero", "Цементная плита HardieBacker 1/2\": 5 листов (3×5 футов) · сначала проверить остаток") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function renderStepBody() {
    var host = document.getElementById("u4hBody");
    var holdEl = document.getElementById("u4hHoldStrip");
    if (!host) return;
    var m = computeLayout();
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip";
      holdEl.innerHTML = L(
        "<strong>VERIFY BEFORE PLUMBING OR ORDERING:</strong> Tape-measure the South sink center (75\"–105\" vs 72\"–102\"), rear door casing span (114\" vs 115\"), 6\" vs 12\" end box, and East D04 subpanel hold before relocating drain lines or ordering stone.",
        "<strong>PAUSA ANTES DE PLOMERÍA Y GABINETES:</strong> Confirma con cinta en obra la tarja Sur (75\"–105\" vs 72\"–102\"), el claro a puerta trasera (114\" vs 115\"), la opción 6\" vs 12\" y la zona del subpanel D04 antes de mover tubería o pedir cubiertas.",
        "<strong>ПРОВЕРИТЬ ПЕРЕД САНТЕХНИКОЙ И ЗАКАЗОМ:</strong> Замерьте рулеткой ось южной мойки (75\"–105\" или 72\"–102\"), расстояние до наличника задней двери (114\" или 115\"), торцевой модуль 6\" или 12\" и охранную зону подщита D04 на восточной стене до переноса слива и заказа камня."
      );
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(L(s.en, s.es, s.ru)) + "</button>";
      }).join("") +
    "</div>";

    var inner = "";
    var titleTxt = L("Kitchen Floor Plan & Walkways", "Planta de Cocina y Pasillos", "План кухни и ширина проходов");
    var subTxt = L(
      '147" × 126-1/4" room · Tap any cabinet or test 6" vs 12" end box live',
      'Cocina 147" × 126-1/4" · Toca cualquier gabinete o prueba 6" vs 12" en vivo',
      'Помещение 147" × 126-1/4" · Нажмите на любую тумбу или сравните торцевой модуль 6" и 12"'
    );

    if (state.step === "floor") {
      var sel = m.cabinets.find(function (c) { return c.id === state.selectedId; }) || m.cabinets[6];
      var statusCls = m.casingPass114 ? "is-pass" : "is-fail";
      var statusMsg = m.casingPass114
        ? L(
            "✓ PASS — South run ends at " + m.southWithOverhang + "\" (with 1\" overhang), clearing the 114\" rear door casing. Narrowest walkway: " + fmtIn(m.narrowestWalk) + ".",
            "✓ PASA — El muro Sur termina en " + m.southWithOverhang + "\" (incluye 1\" de vuelo), librando la chambrana de 114\". Paso libre mínimo: " + fmtIn(m.narrowestWalk) + ".",
            "✓ ПРОХОДИТ — Южный ряд заканчивается на " + m.southWithOverhang + "\" (со свесом 1\"), не задевая наличник задней двери 114\". Самый узкий проход: " + fmtIn(m.narrowestWalk) + "."
          )
        : L(
            "✗ HITS DOOR CASING — With the 12\" end box, the counter reaches " + m.southWithOverhang + "\" and collides with the 114\" rear door casing. Switch to 6\" or verify tape.",
            "✗ CHOCA CON PUERTA — Con caja de 12\" llega a " + m.southWithOverhang + "\" y pega con la chambrana trasera (114\"). Cambia a 6\" o verifica si la tarja corre a 72\"–102\".",
            "✗ ЗАДЕВАЕТ НАЛИЧНИК ДВЕРИ — С модулем 12\" столешница доходит до " + m.southWithOverhang + "\" и наезжает на наличник двери 114\". Переключите на 6\" или проверьте разметку мойки."
          );

      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + L("Narrowest walkway", "Paso más angosto", "Самый узкий проход") + "</div>" +
            '<div class="u4h-kpi-val ' + (m.narrowestWalk >= 32 ? "is-ok" : "is-fail") + '">' + fmtIn(m.narrowestWalk) + "</div>" +
            '<div class="u4h-kpi-sub">' + L("Target clear pass: 32\"–36\"", "Mínimo cómodo: 32\"–36\"", "Норма прохода: 32\"–36\"") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + L("Rear door casing", "Claro puerta trasera", "Отступ до наличника двери") + "</div>" +
            '<div class="u4h-kpi-val ' + (m.casingPass114 ? "is-ok" : "is-fail") + '">' + m.southWithOverhang + '" / 114"</div>' +
            '<div class="u4h-kpi-sub">' + (m.casingPass114 ? L("Clears door trim", "Libra chambrana", "Не задевает наличник") : L("Past 114\" trim!", "¡Se pasa de 114\"!", "Заходит за 114\"!")) + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + L("West wall uppers", "Muro Oeste altos", "Верхние шкафы Запада") + "</div>" +
            '<div class="u4h-kpi-val is-info">' + L("NONE", "NINGUNO", "НЕТ") + "</div>" +
            '<div class="u4h-kpi-sub">' + L("Full-height tile (locked)", "Azulejo hasta techo", "Плитка до потолка (утв.)") + "</div>" +
          "</div>" +
        "</div>" +

        '<div class="u4h-svg-hint">' +
          '<span>' + L("👆 Tap any cabinet or appliance on the plan to inspect exact width and notes.", "👆 Toca cualquier gabinete o electrodoméstico en el plano para ver sus medidas.", "👆 Нажмите на любую тумбу или прибор на плане, чтобы увидеть точные размеры и примечания.") + "</span>" +
          '<a class="u4h-nav-link" style="padding:3px 9px;font-size:11.5px" href="' + esc(window.U4PlanNav.planUrl("kitchen-west-ks4")) + '">' + L("Open Range Wall →", "Abrir Muro Estufa →", "Стена плиты →") + "</a>" +
        "</div>" +

        '<div class="u4h-svg-wrap">' + renderFloorPlanSvg(m) + "</div>" +

        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + L("South end box (by rear door):", "Caja final Sur (junto a puerta trasera):", "Торцевой модуль Юга (у задней двери):") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.southEnd === "6" ? " is-active" : "") + '" data-end="6">' + L('6" Filler / Pull-Out', '6" Relleno / Especiero', '6" вставка / бутылочница') + "</button>" +
              '<button type="button" class="u4h-pill' + (state.southEnd === "12" ? " is-active" : "") + '" data-end="12">' + L('12" Cabinet Option', '12" Gabinete (Probar)', '12" тумба (проверка)') + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + L("South sink setout (verify on site):", "Posición de tarja Sur (verificar en obra):", "Привязка южной мойки (сверить на объекте):") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.sinkBasis === "window" ? " is-active" : "") + '" data-sink="window">' + L('75"–105" (earlier comparison)', '75"–105" (comparación anterior)', '75"–105" (прежнее сравнение)') + "</button>" +
              '<button type="button" class="u4h-pill' + (state.sinkBasis === "tape" ? " is-active" : "") + '" data-sink="tape">' + L('72"–102" (calculated setout)', '72"–102" (trazo calculado)', '72"–102" (расчётная привязка)') + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + L("Is the finished floor down yet?", "¿Ya está puesto el piso terminado?", "Чистовой пол уже уложен?") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (!state.floorDown ? " is-active" : "") + '" data-floor="bare">' + L("No — bare subfloor (+3/4\")", "No — subpiso (+3/4\")", "Нет — черновой пол (+3/4\")") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.floorDown ? " is-active" : "") + '" data-floor="done">' + L("Yes — finished floor", "Sí — piso terminado", "Да — чистовой пол готов") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="u4h-status ' + statusCls + '">' + esc(statusMsg) + "</div>" +

        '<div class="u4h-item-card is-selected" style="margin-bottom:11px">' +
          '<div class="u4h-item-main">' +
            '<div class="u4h-item-name">' + esc(L(sel.en, sel.es, sel.ru)) + "</div>" +
            '<div class="u4h-item-meta">' +
              esc(wallLabel(sel.wall)) + " · " + fmtIn(sel.start) + "–" + fmtIn(sel.start + sel.w) +
              " (" + fmtIn(sel.w) + " " + L("W", "A", "Ш") + " × " + fmtIn(sel.d) + " " + L("D", "F", "Г") + ")" +
            "</div>" +
            '<div class="u4h-item-note">' + esc(L(sel.noteEn, sel.noteEs, sel.noteRu)) + "</div>" +
          "</div>" +
          '<button type="button" class="u4h-action-btn" id="kfpAskSelected">' + L("Ask AI about this", "Preguntar a IA", "Спросить ИИ") + "</button>" +
        "</div>";

    } else if (state.step === "walls") {
      titleTxt = L("Elevation by Wall & Site Photo", "Elevación por Muro y Foto Real", "Развёртки по стенам и фото объекта");
      subTxt = L(
        "Switch walls to check window center, former pie-safe closure and D04 electrical no-screw zone",
        "Cambia de muro para ver ventana, alacena existente y zona sin tornillos del subpanel D04",
        "Переключайте стены для проверки оси окна, зашивки прежней ниши и запретной зоны подщита D04"
      );

      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + L("Pick a wall:", "Elige el muro:", "Выберите стену:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.wallTab === "south" ? " is-active" : "") + '" data-wall="south">' + L("South Wall (Sink & Pie-Safe)", "Muro Sur (Tarja y Alacena)", "Южная стена (Мойка и ниша)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.wallTab === "east" ? " is-active" : "") + '" data-wall="east">' + L("East Wall (Fridge & D04)", "Muro Este (Refri y D04)", "Восточная стена (Холод. и D04)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.wallTab === "west" ? " is-active" : "") + '" data-wall="west">' + L("West Wall (Range)", "Muro Oeste (Estufa)", "Западная стена (Плита)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.wallTab === "north" ? " is-active" : "") + '" data-wall="north">' + L("North Wall (Hall)", "Muro Norte (Pasillo)", "Северная стена (Коридор)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderWallElevationSvg(m) + "</div>" +
        (state.wallTab === "south"
          ? '<div class="u4h-photo-grid">' +
              '<div class="u4h-photo-card">' +
                '<img src="./assets/kitchen-south-wall.jpg" alt="' + esc(L("Real photo of South kitchen sink and pie-safe wall", "Foto real del muro Sur de cocina", "Реальное фото южной стены кухни с мойкой и прежней нишей")) + '">' +
                '<div class="u4h-photo-cap"><strong>' + L("Real site photo — South Wall:", "Foto real — Muro Sur:", "Фото с объекта — Южная стена:") + "</strong> " +
                  L(
                    "Blue tape marks 36\" counter height. Weatherproof and cover the former recess at left after inspection. Sink window and rear door are on the right.",
                    "La cinta azul marca línea de cubierta a 36\". Alacena empotrada existente a la izquierda (~26\"–59\" desde SE); ventana y puerta trasera a la derecha.",
                    "Синий скотч отмечает уровень столешницы 36\". Бывшую нишу слева (~26\"–59\" от ЮВ) гидроизолировать и зашить заподлицо после осмотра; окно мойки и задняя дверь — справа."
                  ) +
                "</div>" +
              "</div>" +
            "</div>"
          : state.wallTab === "west"
          ? '<div class="u4h-info-box">' +
              '<div class="u4h-info-title">' + L("West Wall — Viking 30\" Range & Zephyr 30\" Hood", "Muro Oeste — Estufa Viking 30\" y Campana Zephyr 30\"", "Западная стена — Плита Viking 30\" и вытяжка Zephyr 30\"") + "</div>" +
              '<ul class="u4h-info-list">' +
                "<li><strong>" + L("Locked 66-1/4\" run:", "Tramo fijo 66-1/4\":", "Утверждённый ряд 66-1/4\":") + "</strong> " +
                  L(
                    "18\" Base (S) · 30\" Viking Range (CL 33\") · 18\" Base (N) + 1/4\" scribe. NO upper cabinets — full-height tile to 121-1/2\" ceiling.",
                    "18\" Base (S) · 30\" Estufa Viking (Eje 33\") · 18\" Base (N) + tira 1/4\". SIN gabinetes altos — azulejo completo hasta techo (121-1/2\").",
                    "Тумба 18\" (Ю) · плита Viking 30\" (ось 33\") · тумба 18\" (С) + планка 1/4\". БЕЗ верхних шкафов — плитка на всю высоту до потолка (121-1/2\")."
                  ) + "</li>" +
                '<li><a class="u4h-nav-link" style="display:inline-flex;margin-top:4px;padding:4px 10px;font-size:12px" href="' + esc(window.U4PlanNav.planUrl("kitchen-west-ks4")) + '">' +
                  L("Open Full 5-Step West Range & Hood Guide →", "Abrir Guía Completa de 5 Pasos (Muro Oeste) →", "Открыть полное 5-шаговое руководство по западной стене →") + "</a></li>" +
              "</ul>" +
            "</div>"
          : state.wallTab === "north"
          ? '<div class="u4h-info-box">' +
              '<div class="u4h-info-title">' + L("North Wall (115-1/2\") — Adjacent Landing & Entry", "Muro Norte (115-1/2\") — Colindancia y Paso", "Северная стена (115-1/2\") — Смежная площадка и вход") + "</div>" +
              '<ul class="u4h-info-list">' +
                "<li><strong>" + L("Open Hallway entry:", "Paso abierto al Pasillo:", "Открытый проход в коридор:") + "</strong> " +
                  L(
                    "Clear wall with zero cabinets to keep unobstructed circulation between range, fridge, and main hallway.",
                    "Muro libre sin gabinetes para mantener paso amplio entre estufa, refrigerador y pasillo principal.",
                    "Свободная стена без шкафов для удобного прохода между плитой, холодильником и главным коридором."
                  ) + "</li>" +
                "<li><strong>" + L("Behind North wall:", "Atrás del muro:", "За северной стеной:") + "</strong> " +
                  L(
                    "Exterior stair landing outside Front Door 4 (confirmed exterior 24\"×36\" attic hatch location).",
                    "Descanso exterior afuera de Puerta Principal 4 (donde va la escotilla del ático 24\"×36\").",
                    "Лестничная площадка снаружи у входной двери 4 (утверждённое место чердачного люка 24\"×36\")."
                  ) + "</li>" +
              "</ul>" +
            "</div>"
          : '<div class="u4h-info-box">' +
              '<div class="u4h-info-title">' + L("Critical East Wall Rules", "Reglas críticas del Muro Este", "Критические правила восточной стены") + "</div>" +
              '<ul class="u4h-info-list">' +
                "<li><strong>" + L("D04 Subpanel (SE corner):", "Subpanel D04 (esquina SE):", "Подщит D04 (юго-восточный угол):") + "</strong> " +
                  L(
                    "Sits behind the wall 6\"–38\" from SE. Never drive cabinet screws between 53\" and 77\" above finished floor.",
                    "Está atrás del muro entre 6\" y 38\" desde SE. Prohibido meter tornillos de gabinete entre 53\" y 77\" sobre piso terminado.",
                    "Расположен с обратной стороны стены на 6\"–38\" от угла ЮВ. Категорически запрещено крутить саморезы на высоте 53\"–77\" от чистового пола."
                  ) + "</li>" +
                "<li><strong>" + L("Haier Fridge (60\"–88\"):", "Refrigerador Haier (60\"–88\"):", "Холодильник Haier (54\"–82\" расчёт / ниша 28\"):") + "</strong> " +
                  L(
                    "Measures 27-9/16\" W × 26-9/16\" D (+2\" rear gap). Freestanding — NOTHING above fridge (owner locked).",
                    "Mide 27-9/16\" de ancho × 26-9/16\" fondo (+2\" atrás). Nada de gabinetes arriba (decisión fija de Tisa).",
                    "Габариты 27-9/16\" Ш × 26-9/16\" Г (+2\" зазор сзади). Отдельностоящий — СВЕРХУ НИЧЕГО НЕ СТАВИТЬ (решение утверждено)."
                  ) + "</li>" +
              "</ul>" +
            "</div>");

    } else if (state.step === "cabinets") {
      titleTxt = L("Cabinet & Appliance Schedule", "Lista de Gabinetes y Electrodomésticos", "Спецификация шкафов и техники");
      subTxt = L(
        "Every box left-to-right from its named zero corner — zero prices",
        "Cada gabinete en orden desde su esquina 0\" — sin precios",
        "Все модули по порядку от опорного угла 0\" — без цен"
      );

      var walls = ["All", "West", "South", "East"];
      var filtered = m.cabinets.filter(function (c) { return state.listWall === "All" || c.wall === state.listWall; });

      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + L("Filter by wall:", "Filtrar por muro:", "Фильтр по стене:") + "</span>" +
            '<div class="u4h-pill-group">' +
              walls.map(function (w) {
                return '<button type="button" class="u4h-pill' + (state.listWall === w ? " is-active" : "") + '" data-list-wall="' + w + '">' + wallLabel(w) + "</button>";
              }).join("") +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-item-list">' +
          filtered.map(function (c) {
            var bCls = c.status === "locked" ? "is-locked" : (c.status === "hold" ? "is-hold" : "is-verify");
            var bTxt = c.status === "locked"
              ? L("Locked", "Fijo", "Утверждено")
              : (c.status === "hold" ? L("Hold / Verify", "Verificar / Pausa", "Пауза / Проверить") : L("Verify on site", "Verificar en obra", "Сверить на месте"));
            return '<div class="u4h-item-card">' +
              '<div class="u4h-item-main">' +
                '<div class="u4h-item-name">' + esc(L(c.en, c.es, c.ru)) + "</div>" +
                '<div class="u4h-item-meta">' + esc(wallLabel(c.wall)) + " · " + fmtIn(c.start) + "–" + fmtIn(c.start + c.w) + " · " + fmtIn(c.w) + " " + L("W", "A", "Ш") + " × " + fmtIn(c.d) + " " + L("D", "F", "Г") + "</div>" +
                '<div class="u4h-item-note">' + esc(L(c.noteEn, c.noteEs, c.noteRu)) + "</div>" +
              "</div>" +
              '<span class="u4h-badge ' + bCls + '">' + bTxt + "</span>" +
            "</div>";
          }).join("") +
        "</div>" +
        renderEquipDrawer(m);

    } else {
      titleTxt = L("On-Site Tape-Measure Checks (Before Ordering)", "Medidas a Confirmar en Obra (Antes de Pedir)", "Контрольные замеры рулеткой на объекте (до заказа)");
      subTxt = L(
        "Check off each reading and send any measurement directly to the project log",
        "Marca cada lectura y envía cualquier medida directo al registro del proyecto",
        "Отметьте каждую проверку и отправьте фактический замер прямо в журнал проекта"
      );

      var checks = [
        {
          k: "c1",
          en: "1. South Sink Centerline (75\"–105\" vs 72\"–102\")",
          es: "1. Eje de Tarja Sur (75\"–105\" vs 72\"–102\")",
          ru: "1. Ось южной мойки (75\"–105\" или 72\"–102\")",
          dEn: "Pull tape straight from SE Zero Corner to window center and existing drain stub. Hold plumbing move until reconciled.",
          dEs: "Jala cinta desde esquina SE (0\") al centro de la ventana y al drenaje existente. No mover plomería hasta confirmar.",
          dRu: "Протяните рулетку от угла ЮВ (0\") до оси окна и существующего вывода канализации. Не переносить сантехнику до сверки."
        },
        {
          k: "c2",
          en: "2. Rear Door Casing Span (114\" vs 115\") & 6\" vs 12\" End Box",
          es: "2. Claro hasta Chambrana Trasera (114\" vs 115\") y Opción 6\" vs 12\"",
          ru: "2. Расстояние до наличника задней двери (114\" или 115\") и выбор 6\" или 12\"",
          dEn: "Measure from SE corner to the outer edge of the rear door casing. Remember +1\" countertop overhang on the end.",
          dEs: "Mide desde esquina SE hasta el borde de la chambrana trasera. Recuerda sumar +1\" de vuelo de cubierta al final.",
          dRu: "Измерьте от угла ЮВ до края наличника задней двери. Учитывайте боковой свес столешницы +1\"."
        },
        {
          k: "c3",
          en: "3. Weatherproofing and closure of the former recess (~26\"–59\" from SE)",
          es: "3. Ancho y Fondo de Alacena Empotrada Existente (~26\"–59\" desde SE)",
          ru: "3. Гидроизоляция и зашивка прежней стенной ниши (~26\"–59\" от угла ЮВ)",
          dEn: "Confirm exact rough opening width, depth, and whether upper cabinet wraps into SE corner beside it.",
          dEs: "Confirma ancho y fondo exactos de la abertura y si el gabinete alto esquinero da vuelta junto a ella.",
          dRu: "Проверьте фактическую ширину и глубину ниши, герметизацию с улицы и примыкание углового верхнего шкафа."
        },
        {
          k: "c4",
          en: "4. East Wall D04 Subpanel Safe Zone (NO Screws 53\"–77\" Off Floor)",
          es: "4. Subpanel D04 Muro Este (CERO Tornillos 53\"–77\" de Altura)",
          ru: "4. Запретная зона подщита D04 на восточной стене (БЕЗ саморезов 53\"–77\" от пола)",
          dEn: "Mark the 6\"–38\" from SE no-screw zone clearly with painter's tape before any East cabinet hanging.",
          dEs: "Marca con cinta azul la zona de 6\"–38\" desde SE antes de colgar cualquier gabinete del muro Este.",
          dRu: "Отметьте малярным скотчем зону 6\"–38\" от ЮВ перед навеской любых шкафов на восточной стене."
        }
      ];

      inner =
        '<div class="u4h-item-list">' +
          checks.map(function (ch) {
            var done = !!state.checked[ch.k];
            var lblTxt = L(ch.en, ch.es, ch.ru);
            return '<div class="u4h-item-card' + (done ? " is-selected" : "") + '">' +
              '<label style="display:flex;gap:10px;align-items:flex-start;flex:1;cursor:pointer">' +
                '<input type="checkbox" data-chk="' + ch.k + '"' + (done ? " checked" : "") + ' style="margin-top:3px;width:17px;height:17px;accent-color:var(--cobalt)">' +
                '<div class="u4h-item-main">' +
                  '<div class="u4h-item-name">' + esc(lblTxt) + "</div>" +
                  '<div class="u4h-item-note">' + esc(L(ch.dEn, ch.dEs, ch.dRu)) + "</div>" +
                "</div>" +
              "</label>" +
              '<button type="button" class="u4h-action-btn" data-log-note="' + esc(lblTxt) + '">' + L("📝 Log measurement", "📝 Registrar medida", "📝 Записать замер") + "</button>" +
            "</div>";
          }).join("") +
        "</div>" +
        renderEquipDrawer(m);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="kfpPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + L("Prev", "Anterior", "Назад") + "</button>" +
      '<span class="u4h-pager-count">' + L("Step ", "Paso ", "Шаг ") + (idx + 1) + L(" of ", " de ", " из ") + STEPS.length + "</span>" +
      '<button type="button" id="kfpNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + L("Next", "Siguiente", "Далее") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(titleTxt) + "</div>" +
            '<div class="u4h-sub">' + esc(subTxt) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">' + L("N ↑ · 1:1", "N ↑ · 1:1", "С ↑ · 1:1") + '</span>' +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.step = b.getAttribute("data-step");
        renderStepBody();
        window.scrollTo(0, 0);
      });
    });
    host.querySelectorAll("[data-cab]").forEach(function (g) {
      g.addEventListener("click", function () {
        state.selectedId = g.getAttribute("data-cab");
        renderStepBody();
      });
    });
    host.querySelectorAll("[data-end]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.southEnd = b.getAttribute("data-end");
        syncUnderlyingPrintEngine();
        renderStepBody();
      });
    });
    host.querySelectorAll("[data-sink]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.sinkBasis = b.getAttribute("data-sink");
        syncUnderlyingPrintEngine();
        renderStepBody();
      });
    });
    host.querySelectorAll("[data-floor]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.floorDown = b.getAttribute("data-floor") === "done";
        syncUnderlyingPrintEngine();
        renderStepBody();
      });
    });
    host.querySelectorAll("[data-wall]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.wallTab = b.getAttribute("data-wall");
        renderStepBody();
      });
    });
    host.querySelectorAll("[data-list-wall]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.listWall = b.getAttribute("data-list-wall");
        renderStepBody();
      });
    });
    host.querySelectorAll("[data-chk]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        state.checked[cb.getAttribute("data-chk")] = cb.checked;
        renderStepBody();
      });
    });
    host.querySelectorAll("[data-log-note]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (window.U4LiveAi) window.U4LiveAi.openNote(b.getAttribute("data-log-note") + L(" — measured: ", " — medida: ", " — замерено: "));
      });
    });

    var askSel = document.getElementById("kfpAskSelected");
    if (askSel) {
      askSel.addEventListener("click", function () {
        var selObj = m.cabinets.find(function (c) { return c.id === state.selectedId; });
        if (window.U4LiveAi && selObj) {
          window.U4LiveAi.open("", L(selObj.en, selObj.es, selObj.ru));
        }
      });
    }

    var eqBtn = document.getElementById("kfpEquipBtn");
    if (eqBtn) {
      eqBtn.addEventListener("click", function () {
        state.equipOpen = !state.equipOpen;
        renderStepBody();
      });
    }

    var prevBtn = document.getElementById("kfpPrevBtn");
    var nextBtn = document.getElementById("kfpNextBtn");
    if (prevBtn) prevBtn.addEventListener("click", function () {
      if (idx > 0) { state.step = STEPS[idx - 1].id; renderStepBody(); window.scrollTo(0, 0); }
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; renderStepBody(); window.scrollTo(0, 0); }
    });

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

  function applyViewArgs(args) {
    args = args || {};
    var changed = false;
    var wallRaw = String(args.wall || "").toLowerCase().trim();
    if (wallRaw === "south" || wallRaw === "east" || wallRaw === "west" || wallRaw === "north") {
      state.step = "walls";
      state.wallTab = wallRaw;
      changed = true;
    } else if (wallRaw === "plan" || wallRaw === "all" || wallRaw === "floor") {
      state.step = "floor";
      changed = true;
    }
    var stepRaw = args.step;
    if (stepRaw != null && stepRaw !== "") {
      var n = Number(stepRaw);
      if (isFinite(n) && n >= 1 && n <= STEPS.length) {
        state.step = STEPS[n - 1].id;
        changed = true;
      } else {
        var s = String(stepRaw).toLowerCase().trim();
        var match = STEPS.find(function (x) { return x.id === s; });
        if (match) { state.step = match.id; changed = true; }
      }
    }
    if (changed) renderStepBody();
    return changed;
  }

  window.U4PlanControl = {
    showView: function (args) {
      return applyViewArgs(args);
    },
    applyChange: function (args) {
      args = args || {};
      var act = String(args.action || args.target || "").toLowerCase();
      var val = args.value;
      if (act === "south_end" || act === "end_box" || act === "end") {
        state.southEnd = String(val) === "12" ? "12" : "6";
      } else if (act === "sink_basis" || act === "sink") {
        state.sinkBasis = String(val).toLowerCase().indexOf("tape") >= 0 || String(val) === "72" ? "tape" : "window";
      } else if (act === "floor_down" || act === "floor") {
        state.floorDown = val === true || val === "done" || val === "yes" || val === "true";
      } else if (act === "wall") {
        return applyViewArgs({ wall: val });
      } else if (act === "select_cabinet" && val) {
        state.selectedId = String(val);
      } else if (act === "reset") {
        state.southEnd = "6";
        state.sinkBasis = "tape";
        state.floorDown = false;
        state.step = "floor";
        state.wallTab = "south";
      } else {
        return false;
      }
      syncUnderlyingPrintEngine();
      renderStepBody();
      return true;
    },
    getState: function () {
      var m = computeLayout();
      return {
        planId: "kitchen-floor-plan",
        step: state.step,
        wall: state.step === "walls" ? state.wallTab : "plan",
        southEnd: m.endW,
        sinkBasis: state.sinkBasis,
        floorDown: state.floorDown,
        casingPass114: m.casingPass114,
        narrowestWalk: m.narrowestWalk,
        summary: "Kitchen Floor Plan: step=" + state.step +
          (state.step === "walls" ? (" (" + state.wallTab + " wall)") : "") +
          ", southEnd=" + m.endW + "in, sink=" + m.sinkStart + "-" + m.sinkEnd + "in, southWithOverhang=" + m.southWithOverhang + "in."
      };
    }
  };

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "kitchen-floor-plan",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { renderStepBody(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); },
        onThemeChange: function () {}
      });
      var bp = window.U4PlanNav.getBootParams ? window.U4PlanNav.getBootParams() : {};
      if (bp.wall || bp.step) applyViewArgs(bp);
    }
    window.addEventListener("u4:lang-change", function () {
      renderStepBody();
      if (window.U4LiveAi) window.U4LiveAi.refreshPrompts();
    });
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "kitchen-floor-plan",
        room: "kitchen",
        titleEn: "Kitchen Floor Plan & Cabinet Schedule",
        titleEs: "Planta de Cocina y Lista de Gabinetes",
        titleRu: "План кухни и раскладка шкафов",
        getContext: function () {
          return window.U4PlanControl.getState().summary;
        },
        quickPrompts: function (lang) {
          if (lang === "ru") {
            return [
              "Поместится ли тумба 12\" возле задней двери?",
              "Где находится запретная зона саморезов у щита D04?",
              "Почему перенос сантехники южной мойки на паузе?"
            ];
          }
          return lang === "es"
            ? ["¿Cabe la caja de 12\" junto a la puerta?", "¿Dónde está la zona sin tornillos D04?", "¿Por qué está en pausa la plomería de tarja?"]
            : ["Does the 12\" end box clear the rear door?", "Where is the D04 no-screw zone?", "Why is South sink plumbing on hold?"];
        }
      });
    }
    renderStepBody();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
