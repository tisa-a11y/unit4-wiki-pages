/* ============================================================================
   Kitchen Floor Plan & Cabinet Schedule — Real-World Human-First Interactive Guide
   Two-Layer Architecture: Clean 4-Step Crew UI + Hidden #blueprint-sheet-shell Print Engine
   Zero External CDNs · Zero Prices · Zero Backend Clutter · Zero Storage · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "floor", en: "1. Floor Plan", es: "1. Planta y Pasos" },
    { id: "walls", en: "2. Each Wall", es: "2. Cada Muro" },
    { id: "cabinets", en: "3. Cabinet List", es: "3. Gabinetes" },
    { id: "checks", en: "4. Site Checks", es: "4. Medir en Obra" }
  ];

  var state = {
    step: "floor",
    southEnd: "6",       // "6" (6" filler/pullout) or "12" (12" cabinet option)
    sinkBasis: "window", // "window" (75-105 CL 90) or "tape" (72-102 CL 87)
    floorDown: false,    // false = bare subfloor (+3/4"), true = finished floor down
    floorAdd: 0.75,
    wallTab: "south",    // "south" | "east" | "west"
    listWall: "All",
    selectedId: "S-B3",
    equipOpen: false,
    checked: { c1: false, c2: false, c3: false, c4: false }
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
    var trashW = state.sinkBasis === "tape" ? 12 : 15;
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
        en: "West Left Base Cabinet (Essex Green)", es: "Gabinete Bajo Izquierdo Oeste (Essex Green)",
        noteEn: "Starts at South Step Corner (0\"). Left chase duct is dedicated to kitchen hood only (verify >= 6\").",
        noteEs: "Inicia en esquina escalonada Sur (0\"). El ducto izquierdo es exclusivo de campana (verificar >= 6\")." },
      { id: "W-A1", wall: "West", start: 18, w: 30, d: 28.125, status: "locked",
        en: "Viking 30\" Gas Range + Zephyr 30\" Hood Above", es: "Estufa Gas Viking 30\" + Campana Zephyr 30\" Arriba",
        noteEn: "Center 33\" from South step. Hood 30\"–36\" above cooktop; 1-gang hardwire box hidden inside 8-5/8\" casing.",
        noteEs: "Centro a 33\" desde esquina Sur. Campana 30\"–36\" sobre parrilla; caja sencilla oculta en cubreducto 8-5/8\"." },
      { id: "W-B2", wall: "West", start: 48, w: 18, d: 24, status: "locked",
        en: "West Right Base Cabinet + 1/4\" Scribe", es: "Gabinete Bajo Derecho Oeste + Tira 1/4\"",
        noteEn: "Runs to 66-1/4\" North corner. NO upper cabinets on West wall (full-height tile to ceiling).",
        noteEs: "Llega a esquina Norte 66-1/4\". SIN gabinetes altos en muro Oeste (azulejo hasta el techo)." },
      { id: "S-B1", wall: "South", start: 0, w: 36, d: 24, status: "verify",
        en: "SE L-Corner Base (Shared with East Wall)", es: "Esquinero en L Sureste (Compartido con Este)",
        noteEn: "36\" × 36\" corner base starting at SE Corner (0\"). Supports South & East countertops.",
        noteEs: "Esquinero 36\" × 36\" desde esquina SE (0\"). Sostiene cubiertas Sur y Este." },
      { id: "S-B2", wall: "South", start: 36, w: trashW, d: 24, status: "verify",
        en: "Trash Pull-Out Cabinet (" + trashW + "\")", es: "Gabinete Extraíble de Basura (" + trashW + "\")",
        noteEn: state.sinkBasis === "tape" ? "Adjusts to 12\" if sink stays on 72\"–102\" site tape marks." : "15\" pull-out when sink centers on South window (75\"–105\").",
        noteEs: state.sinkBasis === "tape" ? "Queda de 12\" si la tarja sigue en 72\"–102\" (cinta en obra)." : "Extraíble de 15\" cuando la tarja se centra bajo la ventana (75\"–105\")." },
      { id: "S-A1", wall: "South", start: dwStart, w: 24, d: 24, status: "verify",
        en: "24\" Panel-Ready Dishwasher Bay", es: "Claro Lavavajillas 24\" (Panelable)",
        noteEn: "Sits directly right of sink base; water supply & drain route into sink cabinet.",
        noteEs: "Va justo a la derecha de la tarja; agua y drenaje entran al gabinete de tarja." },
      { id: "S-B3", wall: "South", start: sinkStart, w: 30, d: 24, status: "hold",
        en: "30\" Sink Base (" + sinkStart + "\"–" + sinkEnd + "\" from SE)", es: "Gabinete de Tarja 30\" (" + sinkStart + "\"–" + sinkEnd + "\" desde SE)",
        noteEn: "HOLD plumbing move until Friday tape check confirms 75\"–105\" (window center) vs 72\"–102\" (site tape).",
        noteEs: "PAUSA en plomería hasta verificar con cinta el viernes: 75\"–105\" (centro ventana) vs 72\"–102\" (cinta)." },
      { id: "S-F1", wall: "South", start: endStart, w: endW, d: 24, status: casingPass114 ? "verify" : "hold",
        en: endW === 6 ? "6\" End Filler / Spice Pull-Out" : "12\" End Cabinet (Test Option)",
        es: endW === 6 ? "Relleno / Especiero Final 6\"" : "Gabinete Final 12\" (Opción de Prueba)",
        noteEn: casingPass114
          ? "Ends at " + southWithOverhang + "\" with 1\" counter overhang — clears 114\" rear door casing."
          : "Ends at " + southWithOverhang + "\" with 1\" overhang — HITS 114\" rear door casing! Use 6\" end or verify tape.",
        noteEs: casingPass114
          ? "Termina en " + southWithOverhang + "\" con 1\" de vuelo — libra chambrana de puerta trasera (114\")."
          : "Termina en " + southWithOverhang + "\" con 1\" de vuelo — ¡CHOCA con chambrana (114\")! Usa 6\" o verifica cinta." },
      { id: "S-U1", wall: "South", start: 26, w: 33, d: 12, status: "verify",
        en: "Existing Recessed Pie-Safe (~26\"–59\" from SE)", es: "Alacena Empotrada Existente (~26\"–59\" desde SE)",
        noteEn: "Verify exact width & depth on Friday mockup before deciding final trim/weather-seal.",
        noteEs: "Medir ancho y fondo exactos el viernes antes de cerrar moldura y sellado." },
      { id: "E-B1", wall: "East", start: 0, w: 36, d: 24, status: "hold",
        en: "East Corner Return (D04 Subpanel Behind Wall)", es: "Retorno Esquinero Este (Subpanel D04 Atrás)",
        noteEn: "STOP: Subpanel D04 sits behind wall 6\"–38\" from SE. NO screws 53\"–77\" off finished floor!",
        noteEs: "ALTO: Subpanel D04 está atrás entre 6\"–38\" desde SE. ¡CERO tornillos entre 53\" y 77\" de altura!" },
      { id: "E-B2", wall: "East", start: 36, w: 24, d: 24, status: "verify",
        en: "24\" East Drawer Base Cabinet", es: "Gabinete Bajo de Cajones Este (24\")",
        noteEn: "36\"–60\" North from SE corner between corner cabinet and fridge.",
        noteEs: "36\"–60\" al Norte desde esquina SE entre esquinero y refrigerador." },
      { id: "E-A1", wall: "East", start: 60, w: 28, d: 28.5, status: "locked",
        en: "Haier Counter-Depth Fridge Bay (28\" Wide)", es: "Espacio Refrigerador Haier (28\" Ancho)",
        noteEn: "60\"–88\" North from SE. Fridge is 27-9/16\" W × 26-9/16\" D + 2\" rear gap. NOTHING above fridge (locked).",
        noteEs: "60\"–88\" al Norte desde SE. Mide 27-9/16\" × 26-9/16\" + 2\" atrás. NADA arriba del refrigerador (fijo)." }
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

  function renderFloorPlanSvg(m, es) {
    // True 1:1 uniform scale (scaleX === scaleY = 2.6 px/in)
    // Room: 147" wide (X: 0..147 -> left=West recess, right=East wall), 126.25" tall (Y: 0..126.25 -> top=North, bottom=South)
    var S = 2.55;
    var ox = 52;
    var oy = 40;
    var W = 147 * S;       // 374.85
    var H = 126.25 * S;    // 321.94
    var recW = 31.5 * S;   // 80.325 (West range wall sits at x = ox + recW)
    var rangeH = 66.25 * S; // 168.94 (from North down to South Step)

    // Coordinates:
    // North wall: (ox + recW, oy) to (ox + W, oy)
    // East wall:  (ox + W, oy) to (ox + W, oy + H)
    // South wall: (ox, oy + H) to (ox + W, oy + H)  [SE Zero Corner = (ox + W, oy + H)]
    // West recess: (ox, oy + rangeH) to (ox, oy + H)
    // West step:   (ox, oy + rangeH) to (ox + recW, oy + rangeH)
    // West range:  (ox + recW, oy) to (ox + recW, oy + rangeH)

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

    // South wall items measure WEST from SE corner (xEast)
    function sx(fromSE, wIn) {
      return xEast - (fromSE + wIn) * S;
    }

    var endColor = m.casingPass114 ? "#E5F4EC" : "#FEECEB";
    var endStroke = m.casingPass114 ? "#1B6B46" : "#B42318";
    var sinkColor = "#FDF2E4";
    var cabColor = "#EEF4F0";
    var appColor = "#E6F0F8";

    var svg =
      '<svg viewBox="0 0 490 412" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Planta interactiva de cocina a escala real" : "True-scale interactive kitchen floor plan") + '">' +
        // Compass badge top-right
        '<g transform="translate(454,30)">' +
          '<circle r="17" fill="#F6F8FA" stroke="#C2CCD6" stroke-width="1"/>' +
          '<line x1="0" y1="-12" x2="0" y2="12" stroke="#184E77" stroke-width="1.2"/>' +
          '<line x1="-12" y1="0" x2="12" y2="0" stroke="#94A3B8" stroke-width="1"/>' +
          '<polygon points="0,-13 -3.5,-6 3.5,-6" fill="#184E77"/>' +
          '<text x="0" y="-19" text-anchor="middle" font-size="8" font-weight="800" fill="#184E77">N</text>' +
          '<text x="0" y="25" text-anchor="middle" font-size="7" font-weight="700" fill="#6E7D8C">S</text>' +
          '<text x="-22" y="2.5" text-anchor="middle" font-size="7" font-weight="700" fill="#6E7D8C">' + (es ? "O" : "W") + '</text>' +
          '<text x="22" y="2.5" text-anchor="middle" font-size="7" font-weight="700" fill="#6E7D8C">E</text>' +
        "</g>" +

        // Room outline polygon (exact L-shape)
        '<path d="M ' + xRange.toFixed(1) + " " + yNorth.toFixed(1) +
          " L " + xEast.toFixed(1) + " " + yNorth.toFixed(1) +
          " L " + xEast.toFixed(1) + " " + ySouth.toFixed(1) +
          " L " + xLeft.toFixed(1) + " " + ySouth.toFixed(1) +
          " L " + xLeft.toFixed(1) + " " + yStep.toFixed(1) +
          " L " + xRange.toFixed(1) + " " + yStep.toFixed(1) + ' Z" fill="#FCFDFE" stroke="#131A22" stroke-width="2.4"/>' +

        // Wall labels outside room
        '<text x="' + ((xRange + xEast) / 2).toFixed(1) + '" y="22" text-anchor="middle" font-size="9.5" font-weight="800" fill="#131A22">' +
          (es ? 'MURO NORTE ABIERTO · 115-1/2"' : 'NORTH WALL (OPEN) · 115-1/2"') + "</text>" +
        '<text x="' + (xRange - 8).toFixed(1) + '" y="' + ((yNorth + yStep) / 2).toFixed(1) + '" text-anchor="middle" font-size="8.5" font-weight="800" fill="#184E77" transform="rotate(-90 ' + (xRange - 12).toFixed(1) + " " + ((yNorth + yStep) / 2).toFixed(1) + ')">' +
          (es ? 'OESTE ESTUFA 66-1/4"' : 'WEST RANGE 66-1/4"') + "</text>" +
        '<text x="' + ((xLeft + xEast) / 2).toFixed(1) + '" y="' + (ySouth + 36).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#131A22">' +
          (es ? 'MURO SUR 147" · Útil hasta chambrana: 114" (cinta) / 115" (escaneo)' : 'SOUTH WALL 147" · Usable to door casing: 114" (tape) / 115" (scan)') + "</text>" +
        '<text x="' + (xEast + 22).toFixed(1) + '" y="' + ((yNorth + ySouth) / 2).toFixed(1) + '" text-anchor="middle" font-size="8.5" font-weight="800" fill="#131A22" transform="rotate(90 ' + (xEast + 22).toFixed(1) + " " + ((yNorth + ySouth) / 2).toFixed(1) + ')">' +
          (es ? 'MURO ESTE 126-1/4" (88" útiles)' : 'EAST WALL 126-1/4" (88" usable)') + "</text>" +

        // NE Hall Opening indicator (29-3/8")
        '<line x1="' + (xEast - 29.375 * S).toFixed(1) + '" y1="' + yNorth.toFixed(1) + '" x2="' + xEast.toFixed(1) + '" y2="' + yNorth.toFixed(1) + '" stroke="#FFFFFF" stroke-width="4"/>' +
        '<line x1="' + (xEast - 29.375 * S).toFixed(1) + '" y1="' + yNorth.toFixed(1) + '" x2="' + xEast.toFixed(1) + '" y2="' + yNorth.toFixed(1) + '" stroke="#184E77" stroke-width="1.4" stroke-dasharray="4 3"/>' +
        '<text x="' + (xEast - 14.7 * S).toFixed(1) + '" y="' + (yNorth + 12).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-weight="700" fill="#184E77">' + (es ? 'Pasillo 29-3/8"' : 'Hall 29-3/8"') + "</text>" +

        // WEST RANGE WALL CABINETS (W-B2 top, W-A1 middle, W-B1 bottom at South Step)
        '<g class="kfp-hit" data-cab="W-B2" style="cursor:pointer">' +
          '<rect x="' + xRange.toFixed(1) + '" y="' + (yNorth + 0.25 * S).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18 * S).toFixed(1) + '" fill="' + cabColor + '" stroke="' + selStroke("W-B2", "#2D4A3E") + '" stroke-width="' + selWidth("W-B2") + '"/>' +
          '<text x="' + (xRange + 12 * S).toFixed(1) + '" y="' + (yNorth + 10.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#131A22">18" Base</text>' +
        "</g>" +
        '<g class="kfp-hit" data-cab="W-A1" style="cursor:pointer">' +
          '<rect x="' + xRange.toFixed(1) + '" y="' + (yNorth + 18.25 * S).toFixed(1) + '" width="' + (28 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" fill="' + appColor + '" stroke="' + selStroke("W-A1", "#184E77") + '" stroke-width="' + selWidth("W-A1") + '"/>' +
          '<text x="' + (xRange + 14 * S).toFixed(1) + '" y="' + (yNorth + 31.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.6" font-weight="800" fill="#184E77">VIKING 30"</text>' +
          '<text x="' + (xRange + 14 * S).toFixed(1) + '" y="' + (yNorth + 37.5 * S).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#485563">' + (es ? "Sin gab. altos" : "No uppers") + "</text>" +
        "</g>" +
        '<g class="kfp-hit" data-cab="W-B1" style="cursor:pointer">' +
          '<rect x="' + xRange.toFixed(1) + '" y="' + (yNorth + 48.25 * S).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18 * S).toFixed(1) + '" fill="' + cabColor + '" stroke="' + selStroke("W-B1", "#2D4A3E") + '" stroke-width="' + selWidth("W-B1") + '"/>' +
          '<text x="' + (xRange + 12 * S).toFixed(1) + '" y="' + (yNorth + 58.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#131A22">18" Base</text>' +
        "</g>" +

        // EAST WALL CABINETS (measuring North from SE corner ySouth)
        '<g class="kfp-hit" data-cab="E-A1" style="cursor:pointer">' +
          '<rect x="' + (xEast - 28.5 * S).toFixed(1) + '" y="' + (ySouth - 88 * S).toFixed(1) + '" width="' + (28.5 * S).toFixed(1) + '" height="' + (28 * S).toFixed(1) + '" fill="' + appColor + '" stroke="' + selStroke("E-A1", "#184E77") + '" stroke-width="' + selWidth("E-A1") + '"/>' +
          '<text x="' + (xEast - 14.25 * S).toFixed(1) + '" y="' + (ySouth - 74.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.4" font-weight="800" fill="#184E77">' + (es ? "REFRI HAIER" : "HAIER FRIDGE") + "</text>" +
          '<text x="' + (xEast - 14.25 * S).toFixed(1) + '" y="' + (ySouth - 68.5 * S).toFixed(1) + '" text-anchor="middle" font-size="6.9" font-weight="700" fill="#485563">28" ' + (es ? "libre" : "bay") + "</text>" +
        "</g>" +
        '<g class="kfp-hit" data-cab="E-B2" style="cursor:pointer">' +
          '<rect x="' + (xEast - 24 * S).toFixed(1) + '" y="' + (ySouth - 60 * S).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="' + cabColor + '" stroke="' + selStroke("E-B2", "#2D4A3E") + '" stroke-width="' + selWidth("E-B2") + '"/>' +
          '<text x="' + (xEast - 12 * S).toFixed(1) + '" y="' + (ySouth - 47 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#131A22">24" ' + (es ? "Caj." : "Drw") + "</text>" +
        "</g>" +

        // SHARED SE CORNER (36x36 L-Corner) + D04 No-Screw Warning Stripe on East Wall
        '<g class="kfp-hit" data-cab="S-B1" style="cursor:pointer">' +
          '<path d="M ' + (xEast - 24 * S).toFixed(1) + " " + (ySouth - 36 * S).toFixed(1) +
            " L " + xEast.toFixed(1) + " " + (ySouth - 36 * S).toFixed(1) +
            " L " + xEast.toFixed(1) + " " + ySouth.toFixed(1) +
            " L " + (xEast - 36 * S).toFixed(1) + " " + ySouth.toFixed(1) +
            " L " + (xEast - 36 * S).toFixed(1) + " " + (ySouth - 24 * S).toFixed(1) +
            " L " + (xEast - 24 * S).toFixed(1) + " " + (ySouth - 24 * S).toFixed(1) + ' Z" fill="' + cabColor + '" stroke="' + selStroke("S-B1", "#2D4A3E") + '" stroke-width="' + selWidth("S-B1") + '"/>' +
          '<text x="' + (xEast - 17 * S).toFixed(1) + '" y="' + (ySouth - 10 * S).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#131A22">SE 36"</text>' +
        "</g>" +
        '<line x1="' + (xEast + 3).toFixed(1) + '" y1="' + (ySouth - 38 * S).toFixed(1) + '" x2="' + (xEast + 3).toFixed(1) + '" y2="' + (ySouth - 6 * S).toFixed(1) + '" stroke="#B42318" stroke-width="3.5"/>' +
        '<text x="' + (xEast + 11).toFixed(1) + '" y="' + (ySouth - 22 * S).toFixed(1) + '" font-size="7.2" font-weight="800" fill="#B42318">D04</text>' +

        // SOUTH WALL CABINETS (Trash, DW, Sink, End Box)
        '<g class="kfp-hit" data-cab="S-B2" style="cursor:pointer">' +
          '<rect x="' + sx(36, m.trashW).toFixed(1) + '" y="' + (ySouth - 24 * S).toFixed(1) + '" width="' + (m.trashW * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="' + cabColor + '" stroke="' + selStroke("S-B2", "#2D4A3E") + '" stroke-width="' + selWidth("S-B2") + '"/>' +
          '<text x="' + (sx(36, m.trashW) + m.trashW * S / 2).toFixed(1) + '" y="' + (ySouth - 13 * S).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="800" fill="#131A22">' + (es ? "Bas." : "Trash") + "</text>" +
          '<text x="' + (sx(36, m.trashW) + m.trashW * S / 2).toFixed(1) + '" y="' + (ySouth - 7.5 * S).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#485563">' + m.trashW + '"</text>' +
        "</g>" +
        '<g class="kfp-hit" data-cab="S-A1" style="cursor:pointer">' +
          '<rect x="' + sx(m.dwStart, 24).toFixed(1) + '" y="' + (ySouth - 24 * S).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="' + appColor + '" stroke="' + selStroke("S-A1", "#184E77") + '" stroke-width="' + selWidth("S-A1") + '"/>' +
          '<text x="' + (sx(m.dwStart, 24) + 12 * S).toFixed(1) + '" y="' + (ySouth - 11.5 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#184E77">DW 24"</text>' +
        "</g>" +
        '<g class="kfp-hit" data-cab="S-B3" style="cursor:pointer">' +
          '<rect x="' + sx(m.sinkStart, 30).toFixed(1) + '" y="' + (ySouth - 24 * S).toFixed(1) + '" width="' + (30 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="' + sinkColor + '" stroke="' + selStroke("S-B3", "#A15206") + '" stroke-width="' + selWidth("S-B3") + '"/>' +
          '<rect x="' + (sx(m.sinkStart, 30) + 5 * S).toFixed(1) + '" y="' + (ySouth - 20 * S).toFixed(1) + '" width="' + (20 * S).toFixed(1) + '" height="' + (15 * S).toFixed(1) + '" rx="3" fill="#FFFFFF" stroke="#A15206" stroke-width="1"/>' +
          '<text x="' + (sx(m.sinkStart, 30) + 15 * S).toFixed(1) + '" y="' + (ySouth - 11 * S).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#A15206">' + (es ? 'TARJA 30"' : 'SINK 30"') + "</text>" +
        "</g>" +
        '<g class="kfp-hit" data-cab="S-F1" style="cursor:pointer">' +
          '<rect x="' + sx(m.endStart, m.endW).toFixed(1) + '" y="' + (ySouth - 24 * S).toFixed(1) + '" width="' + (m.endW * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="' + endColor + '" stroke="' + selStroke("S-F1", endStroke) + '" stroke-width="' + selWidth("S-F1") + '"/>' +
          '<text x="' + (sx(m.endStart, m.endW) + m.endW * S / 2).toFixed(1) + '" y="' + (ySouth - 11 * S).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="800" fill="' + endStroke + '">' + m.endW + '"</text>' +
        "</g>" +

        // South Window highlight on bottom wall (72.87"–106.68" from SE)
        '<line x1="' + sx(72.87, 33.81).toFixed(1) + '" y1="' + ySouth.toFixed(1) + '" x2="' + sx(72.87, 0).toFixed(1) + '" y2="' + ySouth.toFixed(1) + '" stroke="#6FB3E6" stroke-width="5"/>' +
        '<text x="' + sx(89.8, 0).toFixed(1) + '" y="' + (ySouth + 14).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-weight="800" fill="#184E77">' + (es ? 'Ventana (eje 90")' : 'Window (CL 90")') + "</text>" +

        // Rear Door Casing Limit Line (114" from SE)
        '<line x1="' + (xEast - 114 * S).toFixed(1) + '" y1="' + (ySouth - 30 * S).toFixed(1) + '" x2="' + (xEast - 114 * S).toFixed(1) + '" y2="' + (ySouth + 16).toFixed(1) + '" stroke="#B42318" stroke-width="1.5" stroke-dasharray="4 2"/>' +
        '<text x="' + (xEast - 114 * S - 3).toFixed(1) + '" y="' + (ySouth + 14).toFixed(1) + '" text-anchor="end" font-size="7.4" font-weight="800" fill="#B42318">' + (es ? 'Puerta 114"' : 'Door 114"') + "</text>" +

        // Live Clear Walkway Dimension Lines (clean, legible!)
        // 1) South End to West Recess Walkway
        '<line x1="' + xLeft.toFixed(1) + '" y1="' + (ySouth - 12 * S).toFixed(1) + '" x2="' + (sx(m.endStart, m.endW) - 1 * S).toFixed(1) + '" y2="' + (ySouth - 12 * S).toFixed(1) + '" stroke="' + (m.southEndWalk >= 32 ? "#1B6B46" : "#B42318") + '" stroke-width="1.8"/>' +
        '<rect x="' + ((xLeft + sx(m.endStart, m.endW)) / 2 - 28).toFixed(1) + '" y="' + (ySouth - 12 * S - 10).toFixed(1) + '" width="56" height="17" rx="4" fill="#FFFFFF" stroke="' + (m.southEndWalk >= 32 ? "#1B6B46" : "#B42318") + '" stroke-width="1"/>' +
        '<text x="' + ((xLeft + sx(m.endStart, m.endW)) / 2).toFixed(1) + '" y="' + (ySouth - 12 * S + 1.5).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="' + (m.southEndWalk >= 32 ? "#1B6B46" : "#B42318") + '">' + fmtIn(m.southEndWalk) + " " + (es ? "paso" : "clear") + "</text>" +

        // 2) Range Step to South Counter Front (34-1/2")
        '<line x1="' + (xRange + 14 * S).toFixed(1) + '" y1="' + yStep.toFixed(1) + '" x2="' + (xRange + 14 * S).toFixed(1) + '" y2="' + (ySouth - 25.5 * S).toFixed(1) + '" stroke="#184E77" stroke-width="1.8"/>' +
        '<rect x="' + (xRange + 14 * S - 36).toFixed(1) + '" y="' + ((yStep + ySouth - 25.5 * S) / 2 - 9).toFixed(1) + '" width="72" height="17" rx="4" fill="#E6F0F8" stroke="#184E77" stroke-width="1"/>' +
        '<text x="' + (xRange + 14 * S).toFixed(1) + '" y="' + ((yStep + ySouth - 25.5 * S) / 2 + 2.5).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#184E77">34-1/2" ' + (es ? "paso" : "pass") + "</text>" +

        // 3) Center Viking -> Haier Fridge clear span (58-7/8")
        '<line x1="' + (xRange + 28 * S).toFixed(1) + '" y1="' + (yNorth + 35 * S).toFixed(1) + '" x2="' + (xEast - 28.5 * S).toFixed(1) + '" y2="' + (yNorth + 35 * S).toFixed(1) + '" stroke="#6E7D8C" stroke-width="1.2" stroke-dasharray="4 3"/>' +
        '<text x="' + ((xRange + 28 * S + xEast - 28.5 * S) / 2).toFixed(1) + '" y="' + (yNorth + 31 * S).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#485563">58-7/8" ' + (es ? "estufa a refri" : "range to fridge") + "</text>" +

        // SE Zero Corner pin
        '<circle cx="' + xEast.toFixed(1) + '" cy="' + ySouth.toFixed(1) + '" r="4.5" fill="#184E77"/>' +
        '<text x="' + (xEast + 6).toFixed(1) + '" y="' + (ySouth + 14).toFixed(1) + '" font-size="7.8" font-weight="800" fill="#184E77">SE 0"</text>' +
      "</svg>";

    return svg;
  }

  function renderWallElevationSvg(m, es) {
    var offNote = state.floorDown
      ? (es ? "Desde piso terminado" : "From finished floor")
      : (es ? "Desde subpiso (+3/4\" incluido)" : "From bare subfloor (+3/4\" added)");
    var ctrH = 36 + m.floorOffset;
    var d04Low = 53 + m.floorOffset;
    var d04High = 77 + m.floorOffset;

    if (state.wallTab === "east") {
      return '<svg viewBox="0 0 460 250" xmlns="http://www.w3.org/2000/svg">' +
        '<text x="230" y="18" text-anchor="middle" font-size="10" font-weight="800" fill="#184E77">' +
          (es ? 'MURO ESTE (88" ÚTILES DESDE ESQUINA SE 0" → NORTE)' : 'EAST WALL (88" USABLE FROM SE CORNER 0" → NORTH)') + "</text>" +
        '<text x="230" y="31" text-anchor="middle" font-size="8.2" font-weight="700" fill="#485563">' + esc(offNote) + "</text>" +
        // Ceiling & floor lines
        '<line x1="35" y1="44" x2="425" y2="44" stroke="#131A22" stroke-width="1.8"/>' +
        '<line x1="35" y1="214" x2="425" y2="214" stroke="#131A22" stroke-width="2.2"/>' +
        // D04 No-Screw Zone (6"–38" from SE, 53"–77" high)
        '<rect x="65" y="96" width="128" height="44" fill="#FEECEB" stroke="#B42318" stroke-width="1.6" stroke-dasharray="5 3"/>' +
        '<text x="129" y="114" text-anchor="middle" font-size="8.8" font-weight="800" fill="#B42318">' + (es ? "SUBPANEL D04 ATRÁS" : "D04 SUBPANEL BEHIND") + "</text>" +
        '<text x="129" y="127" text-anchor="middle" font-size="7.8" font-weight="700" fill="#B42318">' +
          (es ? "SIN TORNILLOS " : "NO SCREWS ") + fmtIn(d04Low) + "–" + fmtIn(d04High) + "</text>" +
        // SE 36" Corner Base (0-36)
        '<rect x="40" y="160" width="144" height="54" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.5"/>' +
        '<text x="112" y="190" text-anchor="middle" font-size="9" font-weight="800" fill="#131A22">SE Corner 36"</text>' +
        // 24" Drawer Base (36-60)
        '<rect x="184" y="160" width="96" height="54" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.5"/>' +
        '<text x="232" y="190" text-anchor="middle" font-size="9" font-weight="800" fill="#131A22">24" ' + (es ? "Cajones" : "Drawers") + "</text>" +
        // Haier Fridge (60-88, ~70" tall)
        '<rect x="280" y="108" width="112" height="106" fill="#E6F0F8" stroke="#184E77" stroke-width="1.8"/>' +
        '<text x="336" y="156" text-anchor="middle" font-size="9.5" font-weight="800" fill="#184E77">HAIER 28"</text>' +
        '<text x="336" y="170" text-anchor="middle" font-size="7.6" fill="#485563">69-7/8" H</text>' +
        // Nothing above fridge badge
        '<rect x="284" y="56" width="104" height="36" rx="6" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.2" stroke-dasharray="4 2"/>' +
        '<text x="336" y="72" text-anchor="middle" font-size="8" font-weight="800" fill="#1B6B46">' + (es ? "NADA ARRIBA" : "NOTHING ABOVE") + "</text>" +
        '<text x="336" y="83" text-anchor="middle" font-size="7" fill="#1B6B46">' + (es ? "(Decisión fija)" : "(Owner locked)") + "</text>" +
        // Counter height & zero labels
        '<text x="40" y="232" font-size="8.2" font-weight="800" fill="#184E77">0" (SE)</text>' +
        '<text x="184" y="232" text-anchor="middle" font-size="8" fill="#485563">36"</text>' +
        '<text x="280" y="232" text-anchor="middle" font-size="8" fill="#485563">60"</text>' +
        '<text x="392" y="232" text-anchor="end" font-size="8.2" font-weight="800" fill="#184E77">88" (' + (es ? "Pasillo" : "Hall") + ")</text>" +
        '<text x="418" y="164" text-anchor="end" font-size="7.5" font-weight="700" fill="#485563">' + fmtIn(ctrH) + "</text>" +
      "</svg>";
    }

    // Default: South Sink & Pie-Safe Wall Elevation (facing South: Left = SE 0", Right = Rear Door 114")
    var Sx = 3.2; // 115" * 3.2 = 368px
    var x0 = 42;
    return '<svg viewBox="0 0 460 255" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="10" font-weight="800" fill="#184E77">' +
        (es ? 'MURO SUR (DE ESQUINA SE 0" → OESTE HASTA PUERTA TRASERA)' : 'SOUTH WALL (SE CORNER 0" → WEST TO REAR DOOR CASING)') + "</text>" +
      '<text x="230" y="31" text-anchor="middle" font-size="8.2" font-weight="700" fill="#485563">' + esc(offNote) + ' · ' + (es ? "Cubierta a " : "Countertop at ") + fmtIn(ctrH) + "</text>" +
      '<line x1="32" y1="44" x2="432" y2="44" stroke="#131A22" stroke-width="1.8"/>' +
      '<line x1="32" y1="216" x2="432" y2="216" stroke="#131A22" stroke-width="2.2"/>' +
      // Existing Recessed Pie-Safe (~26" to 59")
      '<rect x="' + (x0 + 26 * Sx).toFixed(1) + '" y="94" width="' + (33 * Sx).toFixed(1) + '" height="66" fill="#FDF2E4" stroke="#A15206" stroke-width="1.4" stroke-dasharray="4 3"/>' +
      '<text x="' + (x0 + 42.5 * Sx).toFixed(1) + '" y="122" text-anchor="middle" font-size="8.2" font-weight="800" fill="#A15206">' + (es ? "ALACENA EXISTENTE" : "EXISTING PIE-SAFE") + "</text>" +
      '<text x="' + (x0 + 42.5 * Sx).toFixed(1) + '" y="135" text-anchor="middle" font-size="7.2" fill="#A15206">~26"–59" (' + (es ? "medir" : "measure") + ")</text>" +
      // South Window (72.87" to 106.68")
      '<rect x="' + (x0 + 72.87 * Sx).toFixed(1) + '" y="62" width="' + (33.81 * Sx).toFixed(1) + '" height="86" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
      '<line x1="' + (x0 + 89.78 * Sx).toFixed(1) + '" y1="56" x2="' + (x0 + 89.78 * Sx).toFixed(1) + '" y2="160" stroke="#184E77" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="' + (x0 + 89.78 * Sx).toFixed(1) + '" y="106" text-anchor="middle" font-size="8.6" font-weight="800" fill="#184E77">' + (es ? "VENTANA SUR" : "SOUTH WINDOW") + "</text>" +
      '<text x="' + (x0 + 89.78 * Sx).toFixed(1) + '" y="118" text-anchor="middle" font-size="7.2" fill="#485563">' + (es ? 'Eje 89-3/4"' : 'Center 89-3/4"') + "</text>" +
      // Base Cabinets along South
      '<rect x="' + x0 + '" y="160" width="' + (36 * Sx).toFixed(1) + '" height="56" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.4"/>' +
      '<text x="' + (x0 + 18 * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="8.4" font-weight="800" fill="#131A22">SE 36"</text>' +
      '<rect x="' + (x0 + 36 * Sx).toFixed(1) + '" y="160" width="' + (m.trashW * Sx).toFixed(1) + '" height="56" fill="#EEF4F0" stroke="#2D4A3E" stroke-width="1.4"/>' +
      '<text x="' + (x0 + (36 + m.trashW / 2) * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="7.6" font-weight="800" fill="#131A22">' + m.trashW + '"</text>' +
      '<rect x="' + (x0 + m.dwStart * Sx).toFixed(1) + '" y="160" width="' + (24 * Sx).toFixed(1) + '" height="56" fill="#E6F0F8" stroke="#184E77" stroke-width="1.4"/>' +
      '<text x="' + (x0 + (m.dwStart + 12) * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="8.2" font-weight="800" fill="#184E77">DW 24"</text>' +
      '<rect x="' + (x0 + m.sinkStart * Sx).toFixed(1) + '" y="160" width="' + (30 * Sx).toFixed(1) + '" height="56" fill="#FDF2E4" stroke="#A15206" stroke-width="1.6"/>' +
      '<text x="' + (x0 + (m.sinkStart + 15) * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="8.4" font-weight="800" fill="#A15206">' + (es ? 'TARJA 30"' : 'SINK 30"') + "</text>" +
      '<rect x="' + (x0 + m.endStart * Sx).toFixed(1) + '" y="160" width="' + (m.endW * Sx).toFixed(1) + '" height="56" fill="' + (m.casingPass114 ? "#E5F4EC" : "#FEECEB") + '" stroke="' + (m.casingPass114 ? "#1B6B46" : "#B42318") + '" stroke-width="1.6"/>' +
      '<text x="' + (x0 + (m.endStart + m.endW / 2) * Sx).toFixed(1) + '" y="191" text-anchor="middle" font-size="7.8" font-weight="800" fill="' + (m.casingPass114 ? "#1B6B46" : "#B42318") + '">' + m.endW + '"</text>' +
      // Rear Door Casing Limit 114"
      '<line x1="' + (x0 + 114 * Sx).toFixed(1) + '" y1="54" x2="' + (x0 + 114 * Sx).toFixed(1) + '" y2="224" stroke="#B42318" stroke-width="1.8" stroke-dasharray="4 3"/>' +
      '<text x="' + (x0 + 114 * Sx + 4).toFixed(1) + '" y="70" font-size="7.6" font-weight="800" fill="#B42318">114"</text>' +
      '<text x="' + (x0 + 114 * Sx + 4).toFixed(1) + '" y="80" font-size="7" fill="#B42318">' + (es ? "Puerta" : "Door") + "</text>" +
      '<text x="' + x0 + '" y="234" font-size="8" font-weight="800" fill="#184E77">SE 0"</text>' +
      '<text x="' + (x0 + m.sinkStart * Sx).toFixed(1) + '" y="234" text-anchor="middle" font-size="7.6" fill="#A15206">' + m.sinkStart + '"</text>' +
      '<text x="' + (x0 + m.sinkEnd * Sx).toFixed(1) + '" y="234" text-anchor="middle" font-size="7.6" fill="#A15206">' + m.sinkEnd + '"</text>' +
    "</svg>";
  }

  function renderEquipDrawer(m, es) {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="kfpEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "🔧 Equipo y suministros " : "🔧 Equipment & Supplies ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="kfpEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Herramientas de trazado" : "Site Mockup Tools") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? "Cinta métrica 25 pies + nivel láser" : "25 ft tape measure + laser level") + "</li>" +
              "<li>" + (es ? "Cinta azul de pintor (marcar tarja y 6\" vs 12\")" : "Blue painter's tape (mark sink & 6\" vs 12\" box)") + "</li>" +
              "<li>" + (es ? "Detector de vigas y cables (zona D04 muro Este)" : "Stud & live-wire finder (East wall D04 zone)") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Cantidades estimadas (sin precios)" : "Estimated Quantities (Zero Prices)") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? "Gabinetes bajos: 6 cajas + 1 relleno (" + m.endW + '")' : "Base boxes: 6 cabinets + 1 end filler (" + m.endW + '")') + "</li>" +
              "<li>" + (es ? "Cubierta total aprox.: ~32.4 ft² (verificar tras medidas)" : "Countertop area approx.: ~32.4 sq ft (verify after site tape)") + "</li>" +
              "<li>" + (es ? "Azulejo cocina (Oeste + Sur + Este): ~69 ft² con +15%" : "Wrap-around backsplash tile: ~69 sq ft incl. +15% waste") + "</li>" +
              "<li>" + (es ? "HardieBacker 1/2\": 5 hojas (3×5 pies) · revisar stock primero" : "1/2\" HardieBacker: 5 sheets (3×5 ft) · check site stock first") + "</li>" +
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
    var es = isEs();
    var m = computeLayout();
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip";
      holdEl.innerHTML = es
        ? "<strong>PAUSA ANTES DE PLOMERÍA Y GABINETES:</strong> Confirma con cinta en obra la tarja Sur (75\"–105\" vs 72\"–102\"), el claro a puerta trasera (114\" vs 115\"), la opción 6\" vs 12\" y la zona del subpanel D04 antes de mover tubería o pedir cubiertas."
        : "<strong>VERIFY BEFORE PLUMBING OR ORDERING:</strong> Tape-measure the South sink center (75\"–105\" vs 72\"–102\"), rear door casing span (114\" vs 115\"), 6\" vs 12\" end box, and East D04 subpanel hold before relocating drain lines or ordering stone.";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var inner = "";
    var titleEn = "Kitchen Floor Plan & Walkways";
    var titleEs = "Planta de Cocina y Pasillos";
    var subEn = '147" × 126-1/4" room · Tap any cabinet or test 6" vs 12" end box live';
    var subEs = 'Cocina 147" × 126-1/4" · Toca cualquier gabinete o prueba 6" vs 12" en vivo';

    if (state.step === "floor") {
      var sel = m.cabinets.find(function (c) { return c.id === state.selectedId; }) || m.cabinets[6];
      var statusCls = m.casingPass114 ? "is-pass" : "is-fail";
      var statusMsg = m.casingPass114
        ? (es
            ? "✓ PASA — El muro Sur termina en " + m.southWithOverhang + "\" (incluye 1\" de vuelo), librando la chambrana de 114\". Paso libre mínimo: " + fmtIn(m.narrowestWalk) + "."
            : "✓ PASS — South run ends at " + m.southWithOverhang + "\" (with 1\" overhang), clearing the 114\" rear door casing. Narrowest walkway: " + fmtIn(m.narrowestWalk) + ".")
        : (es
            ? "✗ CHOCA CON PUERTA — Con caja de 12\" llega a " + m.southWithOverhang + "\" y pega con la chambrana trasera (114\"). Cambia a 6\" o verifica si la tarja corre a 72\"–102\"."
            : "✗ HITS DOOR CASING — With the 12\" end box, the counter reaches " + m.southWithOverhang + "\" and collides with the 114\" rear door casing. Switch to 6\" or verify tape.");

      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Paso más angosto" : "Narrowest walkway") + "</div>" +
            '<div class="u4h-kpi-val ' + (m.narrowestWalk >= 32 ? "is-ok" : "is-fail") + '">' + fmtIn(m.narrowestWalk) + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "Mínimo cómodo: 32\"–36\"" : "Target clear pass: 32\"–36\"") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Claro puerta trasera" : "Rear door casing") + "</div>" +
            '<div class="u4h-kpi-val ' + (m.casingPass114 ? "is-ok" : "is-fail") + '">' + m.southWithOverhang + '" / 114"</div>' +
            '<div class="u4h-kpi-sub">' + (m.casingPass114 ? (es ? "Libra chambrana" : "Clears door trim") : (es ? "¡Se pasa de 114\"!" : "Past 114\" trim!")) + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Muro Oeste altos" : "West wall uppers") + "</div>" +
            '<div class="u4h-kpi-val is-info">' + (es ? "NINGUNO" : "NONE") + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "Azulejo hasta techo" : "Full-height tile (locked)") + "</div>" +
          "</div>" +
        "</div>" +

        '<div class="u4h-svg-hint">' +
          '<span>' + (es ? "👆 Toca cualquier gabinete o electrodoméstico en el plano para ver sus medidas." : "👆 Tap any cabinet or appliance on the plan to inspect exact width and notes.") + "</span>" +
          '<a class="u4h-nav-link" style="padding:3px 9px;font-size:11.5px" href="' + esc(window.U4PlanNav.planUrl("kitchen-west-ks4")) + '">' + (es ? "Abrir Muro Estufa →" : "Open Range Wall →") + "</a>" +
        "</div>" +

        '<div class="u4h-svg-wrap">' + renderFloorPlanSvg(m, es) + "</div>" +

        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Caja final Sur (junto a puerta trasera):" : "South end box (by rear door):") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.southEnd === "6" ? " is-active" : "") + '" data-end="6">' + (es ? '6" Relleno / Especiero' : '6" Filler / Pull-Out') + "</button>" +
              '<button type="button" class="u4h-pill' + (state.southEnd === "12" ? " is-active" : "") + '" data-end="12">' + (es ? '12" Gabinete (Probar)' : '12" Cabinet Option') + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Posición de tarja Sur (verificar):" : "South sink spot (verify Friday):") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.sinkBasis === "window" ? " is-active" : "") + '" data-sink="window">' + (es ? '75"–105" (Centro Ventana)' : '75"–105" (Window Center)') + "</button>" +
              '<button type="button" class="u4h-pill' + (state.sinkBasis === "tape" ? " is-active" : "") + '" data-sink="tape">' + (es ? '72"–102" (Cinta en Obra)' : '72"–102" (Site Tape)') + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "¿Ya está puesto el piso terminado?" : "Is the finished floor down yet?") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (!state.floorDown ? " is-active" : "") + '" data-floor="bare">' + (es ? "No — subpiso (+3/4\")" : "No — bare subfloor (+3/4\")") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.floorDown ? " is-active" : "") + '" data-floor="done">' + (es ? "Sí — piso terminado" : "Yes — finished floor") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="u4h-status ' + statusCls + '">' + esc(statusMsg) + "</div>" +

        // Selected Cabinet Inspector Card
        '<div class="u4h-item-card is-selected" style="margin-bottom:11px">' +
          '<div class="u4h-item-main">' +
            '<div class="u4h-item-name">' + esc(es ? sel.es : sel.en) + "</div>" +
            '<div class="u4h-item-meta">' +
              esc(sel.wall) + " · " + fmtIn(sel.start) + "–" + fmtIn(sel.start + sel.w) +
              " (" + fmtIn(sel.w) + " W × " + fmtIn(sel.d) + " D)" +
            "</div>" +
            '<div class="u4h-item-note">' + esc(es ? sel.noteEs : sel.noteEn) + "</div>" +
          "</div>" +
          '<button type="button" class="u4h-action-btn" id="kfpAskSelected">' + (es ? "Preguntar a IA" : "Ask AI about this") + "</button>" +
        "</div>";

    } else if (state.step === "walls") {
      titleEn = "Elevation by Wall & Site Photo";
      titleEs = "Elevación por Muro y Foto Real";
      subEn = "Switch walls to check window center, pie-safe opening, and D04 electrical no-screw zone";
      subEs = "Cambia de muro para ver ventana, alacena existente y zona sin tornillos del subpanel D04";

      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Elige el muro:" : "Pick a wall:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.wallTab === "south" ? " is-active" : "") + '" data-wall="south">' + (es ? "Muro Sur (Tarja y Alacena)" : "South Wall (Sink & Pie-Safe)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.wallTab === "east" ? " is-active" : "") + '" data-wall="east">' + (es ? "Muro Este (Refri y D04)" : "East Wall (Fridge & D04)") + "</button>" +
              '<a class="u4h-pill" style="text-decoration:none" href="' + esc(window.U4PlanNav.planUrl("kitchen-west-ks4")) + '">' + (es ? "Muro Oeste (Estufa) →" : "West Wall (Range) →") + "</a>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderWallElevationSvg(m, es) + "</div>" +
        (state.wallTab === "south"
          ? '<div class="u4h-photo-grid">' +
              '<div class="u4h-photo-card">' +
                '<img src="./assets/kitchen-south-wall.jpg" alt="' + esc(es ? "Foto real del muro Sur de cocina" : "Real photo of South kitchen sink and pie-safe wall") + '">' +
                '<div class="u4h-photo-cap"><strong>' + (es ? "Foto real — Muro Sur:" : "Real site photo — South Wall:") + "</strong> " +
                  (es ? "La cinta azul marca línea de cubierta a 36\". Alacena empotrada existente a la izquierda (~26\"–59\" desde SE); ventana y puerta trasera a la derecha."
                      : "Blue tape marks 36\" counter height. Existing recessed pie-safe sits left (~26\"–59\" from SE); sink window and rear door on right.") +
                "</div>" +
              "</div>" +
            "</div>"
          : '<div class="u4h-info-box">' +
              '<div class="u4h-info-title">' + (es ? "Reglas críticas del Muro Este" : "Critical East Wall Rules") + "</div>" +
              '<ul class="u4h-info-list">' +
                "<li><strong>" + (es ? "Subpanel D04 (esquina SE):" : "D04 Subpanel (SE corner):") + "</strong> " +
                  (es ? "Está atrás del muro entre 6\" y 38\" desde SE. Prohibido meter tornillos de gabinete entre 53\" y 77\" sobre piso terminado."
                      : "Sits behind the wall 6\"–38\" from SE. Never drive cabinet screws between 53\" and 77\" above finished floor.") + "</li>" +
                "<li><strong>" + (es ? "Refrigerador Haier (60\"–88\"):" : "Haier Fridge (60\"–88\"):") + "</strong> " +
                  (es ? "Mide 27-9/16\" de ancho × 26-9/16\" fondo (+2\" atrás). Nada de gabinetes arriba (decisión fija de Tisa)."
                      : "Measures 27-9/16\" W × 26-9/16\" D (+2\" rear gap). Freestanding — NOTHING above fridge (owner locked).") + "</li>" +
              "</ul>" +
            "</div>");

    } else if (state.step === "cabinets") {
      titleEn = "Cabinet & Appliance Schedule";
      titleEs = "Lista de Gabinetes y Electrodomésticos";
      subEn = "Every box left-to-right from its named zero corner — zero prices";
      subEs = "Cada gabinete en orden desde su esquina 0\" — sin precios";

      var walls = ["All", "West", "South", "East"];
      var filtered = m.cabinets.filter(function (c) { return state.listWall === "All" || c.wall === state.listWall; });

      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Filtrar por muro:" : "Filter by wall:") + "</span>" +
            '<div class="u4h-pill-group">' +
              walls.map(function (w) {
                var lbl = w === "All" ? (es ? "Todos" : "All") : (w === "West" ? (es ? "Oeste" : "West") : (w === "South" ? (es ? "Sur" : "South") : (es ? "Este" : "East")));
                return '<button type="button" class="u4h-pill' + (state.listWall === w ? " is-active" : "") + '" data-list-wall="' + w + '">' + lbl + "</button>";
              }).join("") +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-item-list">' +
          filtered.map(function (c) {
            var bCls = c.status === "locked" ? "is-locked" : (c.status === "hold" ? "is-hold" : "is-verify");
            var bTxt = c.status === "locked" ? (es ? "Fijo" : "Locked") : (c.status === "hold" ? (es ? "Verificar / Pausa" : "Hold / Verify") : (es ? "Verificar en obra" : "Verify on site"));
            return '<div class="u4h-item-card">' +
              '<div class="u4h-item-main">' +
                '<div class="u4h-item-name">' + esc(es ? c.es : c.en) + "</div>" +
                '<div class="u4h-item-meta">' + esc(c.wall) + " · " + fmtIn(c.start) + "–" + fmtIn(c.start + c.w) + " · " + fmtIn(c.w) + " W × " + fmtIn(c.d) + " D</div>" +
                '<div class="u4h-item-note">' + esc(es ? c.noteEs : c.noteEn) + "</div>" +
              "</div>" +
              '<span class="u4h-badge ' + bCls + '">' + bTxt + "</span>" +
            "</div>";
          }).join("") +
        "</div>" +
        renderEquipDrawer(m, es);

    } else {
      titleEn = "On-Site Tape-Measure Checks (Before Ordering)";
      titleEs = "Medidas a Confirmar en Obra (Antes de Pedir)";
      subEn = "Check off each reading and send any measurement directly to the project log";
      subEs = "Marca cada lectura y envía cualquier medida directo al registro del proyecto";

      var checks = [
        {
          k: "c1",
          en: "1. South Sink Centerline (75\"–105\" vs 72\"–102\")",
          es: "1. Eje de Tarja Sur (75\"–105\" vs 72\"–102\")",
          dEn: "Pull tape straight from SE Zero Corner to window center and existing drain stub. Hold plumbing move until reconciled.",
          dEs: "Jala cinta desde esquina SE (0\") al centro de la ventana y al drenaje existente. No mover plomería hasta confirmar."
        },
        {
          k: "c2",
          en: "2. Rear Door Casing Span (114\" vs 115\") & 6\" vs 12\" End Box",
          es: "2. Claro hasta Chambrana Trasera (114\" vs 115\") y Opción 6\" vs 12\"",
          dEn: "Measure from SE corner to the outer edge of the rear door casing. Remember +1\" countertop overhang on the end.",
          dEs: "Mide desde esquina SE hasta el borde de la chambrana trasera. Recuerda sumar +1\" de vuelo de cubierta al final."
        },
        {
          k: "c3",
          en: "3. Existing Recessed Pie-Safe Width & Depth (~26\"–59\" from SE)",
          es: "3. Ancho y Fondo de Alacena Empotrada Existente (~26\"–59\" desde SE)",
          dEn: "Confirm exact rough opening width, depth, and whether upper cabinet wraps into SE corner beside it.",
          dEs: "Confirma ancho y fondo exactos de la abertura y si el gabinete alto esquinero da vuelta junto a ella."
        },
        {
          k: "c4",
          en: "4. East Wall D04 Subpanel Safe Zone (NO Screws 53\"–77\" Off Floor)",
          es: "4. Subpanel D04 Muro Este (CERO Tornillos 53\"–77\" de Altura)",
          dEn: "Mark the 6\"–38\" from SE no-screw zone clearly with painter's tape before any East cabinet hanging.",
          dEs: "Marca con cinta azul la zona de 6\"–38\" desde SE antes de colgar cualquier gabinete del muro Este."
        }
      ];

      inner =
        '<div class="u4h-item-list">' +
          checks.map(function (ch) {
            var done = !!state.checked[ch.k];
            return '<div class="u4h-item-card' + (done ? " is-selected" : "") + '">' +
              '<label style="display:flex;gap:10px;align-items:flex-start;flex:1;cursor:pointer">' +
                '<input type="checkbox" data-chk="' + ch.k + '"' + (done ? " checked" : "") + ' style="margin-top:3px;width:17px;height:17px;accent-color:var(--cobalt)">' +
                '<div class="u4h-item-main">' +
                  '<div class="u4h-item-name">' + esc(es ? ch.es : ch.en) + "</div>" +
                  '<div class="u4h-item-note">' + esc(es ? ch.dEs : ch.dEn) + "</div>" +
                "</div>" +
              "</label>" +
              '<button type="button" class="u4h-action-btn" data-log-note="' + esc(es ? ch.es : ch.en) + '">' + (es ? "📝 Registrar medida" : "📝 Log measurement") + "</button>" +
            "</div>";
          }).join("") +
        "</div>" +
        renderEquipDrawer(m, es);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="kfpPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + (es ? "Anterior" : "Prev") + "</button>" +
      '<span class="u4h-pager-count">' + (es ? "Paso " : "Step ") + (idx + 1) + (es ? " de " : " of ") + STEPS.length + "</span>" +
      '<button type="button" id="kfpNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + (es ? "Siguiente" : "Next") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(es ? titleEs : titleEn) + "</div>" +
            '<div class="u4h-sub">' + esc(es ? subEs : subEn) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">N ↑ · 1:1</span>' +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    // Wire events
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
        if (window.U4LiveAi) window.U4LiveAi.openNote(b.getAttribute("data-log-note") + " — measured: ");
      });
    });

    var askSel = document.getElementById("kfpAskSelected");
    if (askSel) {
      askSel.addEventListener("click", function () {
        var selObj = m.cabinets.find(function (c) { return c.id === state.selectedId; });
        if (window.U4LiveAi && selObj) {
          window.U4LiveAi.open("", es ? selObj.es : selObj.en);
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
  }

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "kitchen-floor-plan",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { renderStepBody(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); },
        onThemeChange: function () {}
      });
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "kitchen-floor-plan",
        room: "kitchen",
        titleEn: "Kitchen Floor Plan & Cabinet Schedule",
        titleEs: "Planta de Cocina y Lista de Gabinetes",
        getContext: function () {
          var m = computeLayout();
          return "Step=" + state.step + ", SouthEnd=" + m.endW + "in, Sink=" + m.sinkStart + "-" + m.sinkEnd + "in, SouthWithOverhang=" + m.southWithOverhang + "in (rear door casing 114in tape / 115in scan), NarrowestWalkway=" + m.narrowestWalk + "in, WestUppers=NONE, EastD04NoScrews=53-77in.";
        },
        quickPrompts: function (lang) {
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
