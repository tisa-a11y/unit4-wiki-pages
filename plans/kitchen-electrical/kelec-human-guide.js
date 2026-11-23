/* ============================================================================
   Kitchen Electrical & Subpanel D04 — Real-World Human-First Interactive Guide
   Two-Layer Architecture: Clean 4-Step Crew UI + Hidden #blueprint-sheet-shell
   Zero External CDNs · Zero Prices · Zero Backend Clutter · Zero Storage · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "outlets", en: "1. Outlets & Routes", es: "1. Contactos y Rutas" },
    { id: "walls", en: "2. Each Wall & D04", es: "2. Cada Muro y D04" },
    { id: "panel", en: "3. Subpanel D04", es: "3. Tablero D04" },
    { id: "holds", en: "4. Holds & Supplies", es: "4. Candados y Kit" }
  ];

  var CIRCUITS = [
    { sp: 1, id: "SA-A", grp: "kitchen", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu", ft: 10.5,
      en: "East Counter Outlets (E1, E2)", es: "Contactos Cubierta Este (E1, E2)",
      routeEn: "In-wall East 50\" band", routeEs: "En muro Este franja 50\"" },
    { sp: 2, id: "SA-B", grp: "kitchen", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu", ft: 16.0,
      en: "South Counter Outlets (S1, S2)", es: "Contactos Cubierta Sur (S1, S2)",
      routeEn: "In-wall South 30\" band", routeEs: "En muro Sur franja 30\"" },
    { sp: 3, id: "SA-C", grp: "kitchen", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu", ft: 39.0,
      en: "West Range Counter Outlets (W1, W2 · 1\" tile rings)", es: "Contactos Estufa Oeste (W1, W2 · aros 1\" azulejo)",
      routeEn: "Attic to West 50\" band", routeEs: "Ático a muro Oeste 50\"" },
    { sp: 4, id: "REF", grp: "kitchen", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu", ft: 10.1,
      en: "Haier Fridge Single Outlet (REF-1 @ 74\", 15\" H)", es: "Refrigerador Haier Sencillo (REF-1 @ 74\", 15\" alto)",
      routeEn: "In-wall East 52-1/2\" band", routeEs: "En muro Este franja 52-1/2\"" },
    { sp: 5, id: "DW", grp: "kitchen", amp: "15A", cat: "BRN115DF", wire: "14/2 Cu", ft: 13.6,
      en: "24\" Dishwasher (Sink-Base 2-Gang Left · Separate Neutral)", es: "Lavavajillas 24\" (Caja Doble Tarja Izq. · Neutro Separado)",
      routeEn: "In-wall South 24\" band", routeEs: "En muro Sur franja 24\"" },
    { sp: 6, id: "GD", grp: "kitchen", amp: "15A", cat: "BRN115DF", wire: "14/2 Cu", ft: 17.5,
      en: "Garbage Disposal (Sink-Base 2-Gang Right · Separate Neutral)", es: "Triturador Basura (Caja Doble Tarja Der. · Neutro Separado)",
      routeEn: "In-wall South 26\" / 20\" band", routeEs: "En muro Sur franja 26\" / 20\"" },
    { sp: 7, id: "RG", grp: "kitchen", amp: "15A", cat: "BRN115DF", wire: "14/2 Cu", ft: 34.8,
      en: "Viking 30\" Gas Range Low Pocket (RG-1 @ 33\", 3\" H)", es: "Estufa Gas Viking 30\" Franja Baja (RG-1 @ 33\", 3\" alto)",
      routeEn: "Attic drop to West 3\" high", routeEs: "Ático a muro Oeste 3\" alto" },
    { sp: 8, id: "HD", grp: "kitchen", amp: "15A", cat: "BRN115AF + BRLW1", wire: "14/2 Cu", ft: 24.6,
      en: "Zephyr Hood Direct Hardwire 1-Gang 2\"×3\" (HD-1 @ 83\"–86\")", es: "Campana Zephyr Directa 2\"×3\" (HD-1 @ 83\"–86\")",
      routeEn: "Attic drop to West 84-1/2\"", routeEs: "Ático a muro Oeste 84-1/2\"" },
    { sp: 9, id: "LT", grp: "kitchen", amp: "15A", cat: "BRN115AF", wire: "14/2 Cu", ft: 69.3,
      en: "Kitchen Main Light + Sink Task Lights + SW-ENTRY 3-Gang", es: "Luz Principal + Luces Tarja + Apagador Entrada 3-Gang",
      routeEn: "Attic to North entry & ceiling", routeEs: "Ático a entrada Norte y techo" },
    { sp: 10, id: "HVAC", grp: "unit", amp: "15A", cat: "BR115", wire: "14/2 Cu", ft: 31.2,
      en: "Attic Furnace w/ Disconnect (Heating Only)", es: "Calefactor Ático con Desconectador (Solo Calefacción)",
      routeEn: "Attic overhead", routeEs: "Ático aéreo" },
    { sp: 11, id: "LIV", grp: "unit", amp: "20A", cat: "BRN120AF", wire: "12/2 Cu", ft: 196.5,
      en: "Living Outlets L1–L6 + Hall H1 (ENT Hold)", es: "Contactos Sala L1–L6 + Pasillo H1 (Tubo Vacío)",
      routeEn: "Attic junction", routeEs: "Caja de paso ático" },
    { sp: 12, id: "DIN", grp: "unit", amp: "20A", cat: "BRN120AF", wire: "12/2 Cu", ft: 147.0,
      en: "Dining Outlets D1–D4 (No Outlet on D04 Wall)", es: "Contactos Comedor D1–D4 (Sin Contacto en Muro D04)",
      routeEn: "Attic junction", routeEs: "Caja de paso ático" },
    { sp: 13, id: "BED", grp: "unit", amp: "20A", cat: "BRN120AF", wire: "12/2 Cu", ft: 149.9,
      en: "Bedroom Outlets B1–B5 + Closet Light", es: "Contactos Recámara B1–B5 + Luz Clóset",
      routeEn: "Attic junction", routeEs: "Caja de paso ático" },
    { sp: 14, id: "BATH-R", grp: "unit", amp: "20A", cat: "BRN120GF", wire: "12/2 Cu", ft: 64.4,
      en: "Bathroom Vanity + Toilet Outlets", es: "Contactos Lavabo + Inodoro Baño",
      routeEn: "Attic junction", routeEs: "Caja de paso ático" },
    { sp: 15, id: "BATH-L", grp: "unit", amp: "15A", cat: "BRN115AF", wire: "14/2 Cu", ft: 91.0,
      en: "Bathroom Ceiling Light, Vanity & Fan", es: "Luz Techo, Lavabo y Extractor Baño",
      routeEn: "Attic junction", routeEs: "Caja de paso ático" },
    { sp: 16, id: "LAUN-W", grp: "unit", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu", ft: 45.5,
      en: "Laundry Washer Outlet (2-Gang Left)", es: "Lavadora Lavandería (Caja Doble Izq.)",
      routeEn: "Attic direct", routeEs: "Ático directo" },
    { sp: 17, id: "LTG", grp: "unit", amp: "15A", cat: "BRN115AF", wire: "14/2 + 14/3", ft: 179.9,
      en: "Whole-Unit Lights + Smoke/CO Alarms", es: "Luces Generales + Detectores Humo/CO",
      routeEn: "Attic junction", routeEs: "Caja de paso ático" },
    { sp: 18, id: "LAUN-D", grp: "unit", amp: "15A", cat: "BRN115DF", wire: "14/2 Cu", ft: 45.5,
      en: "Laundry Gas Dryer 120V (2-Gang Right)", es: "Secadora Gas 120V (Caja Doble Der.)",
      routeEn: "Attic direct", routeEs: "Ático directo" },
    { sp: 19, id: "SPARE", grp: "spare", amp: "—", cat: "Filler", wire: "None", ft: 0,
      en: "Open Spare Space (Reserved)", es: "Espacio Libre de Reserva",
      routeEn: "None", routeEs: "Ninguna" },
    { sp: 20, id: "ATTIC", grp: "unit", amp: "15A", cat: "BRN115DF", wire: "14/2 Cu", ft: 39.2,
      en: "Attic Service GFCI (<=25 ft) + Hatch Light", es: "Contacto Servicio Ático (<=25 pies) + Luz",
      routeEn: "Attic direct", routeEs: "Ático directo" }
  ];

  var state = {
    step: "outlets",
    counterH: 44,           // 44 or 41
    floorDown: false,       // false = bare subfloor (+3/4"), true = finished floor
    sinkCtrl: "optA",       // "optA" (air button + wireless) | "optB" (wired 2-gang @ 70")
    taskLights: "3task",    // "3task" | "2pendant"
    wallTab: "south",       // "east" | "south" | "west" | "north"
    pieStart: 26.0,         // 18..40 in from SE (width 33")
    sinkStart: 75.0,        // 70..80 in from SE (width 30")
    selectedCircuit: "SA-A",
    showUnitSlots: false,
    equipOpen: false,
    holds: { h1: false, h2: false, h3: false, h4: false }
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
    var w = Math.floor(r);
    var f = Math.round((r - w) * 8);
    var m = { 1: "1/8", 2: "1/4", 3: "3/8", 4: "1/2", 5: "5/8", 6: "3/4", 7: "7/8" };
    return f === 0 ? w + '"' : (w ? w + "-" : "") + m[f] + '"';
  }

  function off() {
    return state.floorDown ? 0 : 0.75;
  }

  function syncHiddenSouthRanges() {
    try {
      var rp = document.getElementById("rng-piesafe");
      if (rp) { rp.value = String(state.pieStart); rp.dispatchEvent(new Event("input", { bubbles: true })); }
      var rs = document.getElementById("rng-sink");
      if (rs) { rs.value = String(state.sinkStart); rs.dispatchEvent(new Event("input", { bubbles: true })); }
    } catch (_) {}
  }

  function syncUnderlyingPrint() {
    try {
      if (window.U4PLAN && typeof window.U4PLAN.setFloorCondition === "function") {
        window.U4PLAN.setFloorCondition(state.floorDown ? "finished_installed" : "bare_subfloor", 0.75);
      }
      if (window.U4PLAN && typeof window.U4PLAN.selectCircuit === "function") {
        window.U4PLAN.selectCircuit(state.selectedCircuit);
      }
      syncHiddenSouthRanges();
    } catch (_) {}
  }

  function renderFloorElectricalSvg(es) {
    var S = 2.35;
    var ox = 38;
    var oy = 38;
    var W = 147 * S;       // 345.45
    var H = 126.25 * S;    // 296.69
    var recW = 31.5 * S;
    var rangeH = 66.25 * S;
    var xLeft = ox;
    var xRange = ox + recW;
    var xEast = ox + W;
    var yNorth = oy;
    var yStep = oy + rangeH;
    var ySouth = oy + H;

    function isSel(cid) { return state.selectedCircuit === cid; }
    function cCol(cid, def) { return isSel(cid) ? "#B42318" : def; }
    function cW(cid) { return isSel(cid) ? 2.8 : 1.5; }

    var lightsSvg = state.taskLights === "3task"
      ? [45, 76, 107].map(function (fromSE, i) {
          var cx = xEast - fromSE * S;
          return '<circle cx="' + cx.toFixed(1) + '" cy="' + (ySouth - 22 * S).toFixed(1) + '" r="6" fill="#FEF3C7" stroke="#A15206" stroke-width="1.5"/>' +
            '<text x="' + cx.toFixed(1) + '" y="' + (ySouth - 22 * S + 2.5).toFixed(1) + '" text-anchor="middle" font-size="6" font-weight="800" fill="#A15206">T' + (i + 1) + "</text>";
        }).join("")
      : [60, 96].map(function (fromSE, i) {
          var cx = xEast - fromSE * S;
          return '<circle cx="' + cx.toFixed(1) + '" cy="' + (ySouth - 22 * S).toFixed(1) + '" r="7" fill="#FEF3C7" stroke="#A15206" stroke-width="1.6"/>' +
            '<text x="' + cx.toFixed(1) + '" y="' + (ySouth - 22 * S + 2.5).toFixed(1) + '" text-anchor="middle" font-size="6.2" font-weight="800" fill="#A15206">P' + (i + 1) + "</text>";
        }).join("");

    return '<svg viewBox="0 0 490 385" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Planta eléctrica de cocina y subpanel D04" : "Kitchen electrical floor plan and D04 subpanel") + '">' +
      // Title & Compass
      '<text x="18" y="20" font-size="9.5" font-weight="800" fill="#184E77">' +
        (es ? "PLANTA ELÉCTRICA · 9 CIRCUITOS EN D04 (COMEDOR) · ALCANCE CUBIERTA ≤ 24\"" : "KITCHEN ELECTRICAL · 9 CIRCUITS ON D04 (DINING) · ALL COUNTERS ≤ 24\" REACH") + "</text>" +
      '<g transform="translate(460,26)">' +
        '<circle r="14" fill="#F6F8FA" stroke="#C2CCD6" stroke-width="1"/>' +
        '<polygon points="0,-10 -3,-4 3,-4" fill="#184E77"/>' +
        '<text x="0" y="9" text-anchor="middle" font-size="6.5" font-weight="800" fill="#184E77">N</text>' +
      "</g>" +

      // Kitchen L-shape room polygon
      '<path d="M ' + xRange.toFixed(1) + " " + yNorth.toFixed(1) +
        " L " + xEast.toFixed(1) + " " + yNorth.toFixed(1) +
        " L " + xEast.toFixed(1) + " " + ySouth.toFixed(1) +
        " L " + xLeft.toFixed(1) + " " + ySouth.toFixed(1) +
        " L " + xLeft.toFixed(1) + " " + yStep.toFixed(1) +
        " L " + xRange.toFixed(1) + " " + yStep.toFixed(1) + ' Z" fill="#FCFDFE" stroke="#131A22" stroke-width="2.2"/>' +

      // Subtle cabinet outline footprints
      '<rect x="' + xRange.toFixed(1) + '" y="' + yNorth.toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (66 * S).toFixed(1) + '" fill="#F3F6F9" stroke="#CBD5E1" stroke-width="1"/>' +
      '<rect x="' + (xEast - 111 * S).toFixed(1) + '" y="' + (ySouth - 24 * S).toFixed(1) + '" width="' + (111 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="#F3F6F9" stroke="#CBD5E1" stroke-width="1"/>' +
      '<rect x="' + (xEast - 24 * S).toFixed(1) + '" y="' + (ySouth - 88 * S).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (88 * S).toFixed(1) + '" fill="#F3F6F9" stroke="#CBD5E1" stroke-width="1"/>' +

      // Dining-side D04 Subpanel + 30" x 36" Working Space on RIGHT (outside East wall!)
      '<rect x="' + (xEast + 5).toFixed(1) + '" y="' + (ySouth - 38 * S).toFixed(1) + '" width="82" height="74" rx="4" fill="#FEECEB" stroke="#B42318" stroke-width="1.6" stroke-dasharray="4 2"/>' +
      '<rect x="' + (xEast + 2).toFixed(1) + '" y="' + (ySouth - 28 * S).toFixed(1) + '" width="12" height="32" fill="#B42318"/>' +
      '<text x="' + (xEast + 48).toFixed(1) + '" y="' + (ySouth - 27 * S).toFixed(1) + '" text-anchor="middle" font-size="8.6" font-weight="800" fill="#B42318">D04 (20-sp)</text>' +
      '<text x="' + (xEast + 48).toFixed(1) + '" y="' + (ySouth - 20 * S).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#B42318">' + (es ? "Lado Comedor" : "Dining Side") + "</text>" +
      '<text x="' + (xEast + 48).toFixed(1) + '" y="' + (ySouth - 13 * S).toFixed(1) + '" text-anchor="middle" font-size="6.6" fill="#485563">30"×36" ' + (es ? "libre" : "clear") + "</text>" +

      // Dashed Attic Home Runs (to West Wall & North Entry)
      '<path d="M ' + xEast.toFixed(1) + " " + (ySouth - 22 * S).toFixed(1) + " L " + (xRange + 30).toFixed(1) + " " + (yNorth + 33 * S).toFixed(1) + '" fill="none" stroke="' + cCol("SA-C", "#6FB3E6") + '" stroke-width="' + cW("SA-C") + '" stroke-dasharray="5 3"/>' +
      '<path d="M ' + xEast.toFixed(1) + " " + (ySouth - 22 * S).toFixed(1) + " L " + (xEast - 20).toFixed(1) + " " + (yNorth + 12).toFixed(1) + '" fill="none" stroke="' + cCol("LT", "#A15206") + '" stroke-width="' + cW("LT") + '" stroke-dasharray="5 3"/>' +

      // Solid In-Wall Runs (South & East)
      '<line x1="' + (xEast - 4).toFixed(1) + '" y1="' + (ySouth - 10 * S).toFixed(1) + '" x2="' + (xEast - 4).toFixed(1) + '" y2="' + (ySouth - 74 * S).toFixed(1) + '" stroke="' + cCol("SA-A", "#1B6B46") + '" stroke-width="' + cW("SA-A") + '"/>' +
      '<line x1="' + (xEast - 10 * S).toFixed(1) + '" y1="' + (ySouth - 4).toFixed(1) + '" x2="' + (xEast - 80 * S).toFixed(1) + '" y2="' + (ySouth - 4).toFixed(1) + '" stroke="' + cCol("SA-B", "#184E77") + '" stroke-width="' + cW("SA-B") + '"/>' +

      // Outlet & Device Callout Badges (interactive tap to select circuit!)
      // West Wall: W1, W2, RG-1, HD-1
      '<g data-cir="SA-C" style="cursor:pointer">' +
        '<circle cx="' + (xRange + 6).toFixed(1) + '" cy="' + (yStep - 9 * S).toFixed(1) + '" r="8" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
        '<text x="' + (xRange + 6).toFixed(1) + '" y="' + (yStep - 9 * S + 2.5).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#184E77">W1</text>' +
        '<circle cx="' + (xRange + 6).toFixed(1) + '" cy="' + (yStep - 57 * S).toFixed(1) + '" r="8" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
        '<text x="' + (xRange + 6).toFixed(1) + '" y="' + (yStep - 57 * S + 2.5).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#184E77">W2</text>' +
      "</g>" +
      '<g data-cir="HD" style="cursor:pointer">' +
        '<rect x="' + (xRange + 16).toFixed(1) + '" y="' + (yStep - 38 * S).toFixed(1) + '" width="52" height="22" rx="4" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.5"/>' +
        '<text x="' + (xRange + 42).toFixed(1) + '" y="' + (yStep - 38 * S + 10).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#1B6B46">RG-1 / HD-1</text>' +
        '<text x="' + (xRange + 42).toFixed(1) + '" y="' + (yStep - 38 * S + 18.5).toFixed(1) + '" text-anchor="middle" font-size="6.1" fill="#1B6B46">3" / 83"–86"</text>' +
      "</g>" +

      // East Wall: E1 @ 10", E2 @ 48", REF-1 @ 74"
      '<g data-cir="SA-A" style="cursor:pointer">' +
        '<circle cx="' + (xEast - 10).toFixed(1) + '" cy="' + (ySouth - 10 * S).toFixed(1) + '" r="8" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.6"/>' +
        '<text x="' + (xEast - 10).toFixed(1) + '" y="' + (ySouth - 10 * S + 2.5).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#1B6B46">E1</text>' +
        '<circle cx="' + (xEast - 10).toFixed(1) + '" cy="' + (ySouth - 48 * S).toFixed(1) + '" r="8" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.6"/>' +
        '<text x="' + (xEast - 10).toFixed(1) + '" y="' + (ySouth - 48 * S + 2.5).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#1B6B46">E2</text>' +
      "</g>" +
      '<g data-cir="REF" style="cursor:pointer">' +
        '<rect x="' + (xEast - 54).toFixed(1) + '" y="' + (ySouth - 80 * S).toFixed(1) + '" width="44" height="18" rx="4" fill="#E6F0F8" stroke="#184E77" stroke-width="1.5"/>' +
        '<text x="' + (xEast - 32).toFixed(1) + '" y="' + (ySouth - 80 * S + 11.5).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#184E77">REF-1</text>' +
      "</g>" +

      // South Wall: S1 @ 24", S2 @ 65", DW-GD @ 79" (inside sink base!)
      '<g data-cir="SA-B" style="cursor:pointer">' +
        '<circle cx="' + (xEast - 24 * S).toFixed(1) + '" cy="' + (ySouth - 10).toFixed(1) + '" r="8" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
        '<text x="' + (xEast - 24 * S).toFixed(1) + '" y="' + (ySouth - 7.5).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#184E77">S1</text>' +
        '<circle cx="' + (xEast - 65 * S).toFixed(1) + '" cy="' + (ySouth - 10).toFixed(1) + '" r="8" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
        '<text x="' + (xEast - 65 * S).toFixed(1) + '" y="' + (ySouth - 7.5).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#184E77">S2</text>' +
      "</g>" +
      '<g data-cir="DW" style="cursor:pointer">' +
        '<rect x="' + (xEast - (state.sinkStart + 23) * S).toFixed(1) + '" y="' + (ySouth - 40).toFixed(1) + '" width="56" height="20" rx="4" fill="#FDF2E4" stroke="#A15206" stroke-width="1.6"/>' +
        '<text x="' + (xEast - (state.sinkStart + 23) * S + 28).toFixed(1) + '" y="' + (ySouth - 27).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#A15206">DW-GD ' + fmtIn(state.sinkStart + 4) + '</text>' +
      "</g>" +

      // Ceiling Main Light + Task/Pendants + North SW-ENTRY
      '<g data-cir="LT" style="cursor:pointer">' +
        '<circle cx="' + ((xRange + xEast) / 2).toFixed(1) + '" cy="' + ((yNorth + ySouth) / 2 - 14).toFixed(1) + '" r="10" fill="#FEF3C7" stroke="#A15206" stroke-width="1.8"/>' +
        '<text x="' + ((xRange + xEast) / 2).toFixed(1) + '" y="' + ((yNorth + ySouth) / 2 - 11).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#A15206">L1</text>' +
        lightsSvg +
        '<rect x="' + (xEast - 64).toFixed(1) + '" y="' + (yNorth + 4).toFixed(1) + '" width="58" height="17" rx="4" fill="#FEF3C7" stroke="#A15206" stroke-width="1.4"/>' +
        '<text x="' + (xEast - 35).toFixed(1) + '" y="' + (yNorth + 15).toFixed(1) + '" text-anchor="middle" font-size="6.6" font-weight="800" fill="#A15206">SW-ENTRY</text>' +
      "</g>" +

      // Legend bottom strip
      '<text x="245" y="356" text-anchor="middle" font-size="8" font-weight="700" fill="#1B6B46">' +
        (es ? "Línea sólida = en muro (franjas) · Línea punteada = por ático · Toca cualquier caja para ver circuito"
            : "Solid line = in-wall bore band · Dashed line = attic home run · Tap any box to inspect circuit") +
      "</text>" +
    "</svg>";
  }

  function renderWallDetail(es) {
    var d = off();
    var cH = state.counterH + d;
    var hdLow = 83 + d;
    var hdHigh = 86 + d;
    var d04Low = 53 + d;
    var d04High = 77 + d;

    if (state.wallTab === "east") {
      return '<div class="u4h-info-box" style="border-left-color:var(--crimson)">' +
        '<div class="u4h-info-title" style="color:var(--crimson)">' + (es ? "Muro Este — Refrigerador y Respaldo de Subpanel D04" : "East Wall — Fridge & D04 Backside Danger Zone") + "</div>" +
        '<ul class="u4h-info-list">' +
          "<li><strong>" + (es ? "ZONA PROHIBIDA D04 (13\"–27-1/2\" desde SE):" : "D04 NO-SCREW / NO-BOX ZONE (13\"–27-1/2\" from SE):") + "</strong> " +
            (es ? "El gabinete metálico D04 está 1/8\"–5/8\" detrás de la tablaroca entre " + fmtIn(d04Low) + " y " + fmtIn(d04High) + ". ¡NO abrir por atrás y cortes laterales EN PAUSA!"
                : "Dining subpanel D04 steel box sits 1/8\"–5/8\" behind kitchen drywall from " + fmtIn(d04Low) + " to " + fmtIn(d04High) + ". NO back entry, NO screws, side-entry notches ON HOLD!") + "</li>" +
          "<li><strong>E1 @ 10\" &amp; E2 @ 48\" (" + (es ? "Circuito SA-A 20A" : "Circuit SA-A 20A") + "):</strong> " + (es ? "Altura " : "Height ") + fmtIn(cH) + " · " + (es ? "Franja perforación 50\"" : "50\" in-wall bore band") + ".</li>" +
          "<li><strong>REF-1 @ 74\" (" + (es ? "Circuito REF 20A" : "Circuit REF 20A") + "):</strong> " + (es ? "Contacto sencillo a " : "Single outlet at ") + fmtIn(15 + d) + " · " + (es ? "Franja 52-1/2\"" : "52-1/2\" band") + ".</li>" +
        "</ul>" +
      "</div>";
    }
    if (state.wallTab === "south") {
      var Sx = 3.2; // 115" -> 368px starting at x0=44
      var x0 = 44;
      var pieX = x0 + state.pieStart * Sx;
      var pieW = 33 * Sx;
      var sinkX = x0 + state.sinkStart * Sx;
      var sinkW = 30 * Sx;
      var dwgdX = x0 + (state.sinkStart + 4) * Sx;
      var pieClashS1 = state.pieStart < 25;
      var pieClashS2 = (state.pieStart + 33) > 64;
      var sinkClash = (state.sinkStart + 30) > 108;
      var southSvg =
        '<div class="u4h-svg-hint"><span>' + (es ? '✋ Arrastra la Alacena o el Gabinete de Tarja directo sobre el muro Sur (o usa las barras abajo) para probar contactos:' : '✋ Drag the Pie-Safe or 30" Sink Base directly along the South wall (or slide below) to check outlet clearances:') + "</span></div>" +
        '<div class="u4h-svg-wrap">' +
          '<svg id="kelecSouthSvg" viewBox="0 0 460 245" xmlns="http://www.w3.org/2000/svg">' +
            '<text x="230" y="18" text-anchor="middle" font-size="9.6" font-weight="800" fill="#184E77">' + (es ? 'MURO SUR ELÉCTRICO · SE 0" → OESTE (CHAMBRANA 114")' : 'SOUTH WALL ELECTRICAL · SE 0" → WEST (REAR DOOR 114")') + "</text>" +
            '<line x1="34" y1="32" x2="432" y2="32" stroke="#131A22" stroke-width="1.6"/>' +
            '<line x1="34" y1="210" x2="432" y2="210" stroke="#131A22" stroke-width="2.2"/>' +
            // Countertop 36" line
            '<line x1="34" y1="154" x2="426" y2="154" stroke="#6E7D8C" stroke-width="1.2" stroke-dasharray="4 3"/>' +
            // South Window reference (72.87" - 106.68")
            '<rect x="' + (x0 + 72.87 * Sx).toFixed(1) + '" y="48" width="' + (33.81 * Sx).toFixed(1) + '" height="88" fill="#E6F0F8" stroke="#184E77" stroke-width="1.4"/>' +
            '<text x="' + (x0 + 89.78 * Sx).toFixed(1) + '" y="96" text-anchor="middle" font-size="8" font-weight="800" fill="#184E77">' + (es ? "VENTANA" : "WINDOW") + "</text>" +
            // Fixed counter outlets S1 @ 24" & S2 @ 65"
            '<rect x="' + (x0 + 24 * Sx - 7).toFixed(1) + '" y="136" width="14" height="12" rx="2" fill="#184E77"/>' +
            '<text x="' + (x0 + 24 * Sx).toFixed(1) + '" y="144.5" text-anchor="middle" font-size="6.4" font-weight="800" fill="#FFFFFF">S1</text>' +
            '<rect x="' + (x0 + 65 * Sx - 7).toFixed(1) + '" y="136" width="14" height="12" rx="2" fill="#184E77"/>' +
            '<text x="' + (x0 + 65 * Sx).toFixed(1) + '" y="144.5" text-anchor="middle" font-size="6.4" font-weight="800" fill="#FFFFFF">S2</text>' +
            // DRAGGABLE Pie-Safe (33" W)
            '<g id="kelecPieDrag" class="u4-drag-ew" tabindex="0" role="slider" aria-label="' + esc(es ? "Arrastrar alacena existente" : "Drag recessed pie-safe") + '" aria-valuemin="18" aria-valuemax="40" aria-valuenow="' + state.pieStart + '" transform="translate(' + pieX.toFixed(1) + ', 0)">' +
              '<rect class="u4-drag-grip" x="0" y="76" width="' + pieW.toFixed(1) + '" height="68" rx="4" fill="' + (pieClashS1 || pieClashS2 ? "#FEECEB" : "#FDF2E4") + '" stroke="' + (pieClashS1 || pieClashS2 ? "#B42318" : "#A15206") + '" stroke-width="1.8" stroke-dasharray="5 3"/>' +
              '<text x="' + (pieW / 2).toFixed(1) + '" y="98" text-anchor="middle" font-size="8" font-weight="800" fill="' + (pieClashS1 || pieClashS2 ? "#B42318" : "#A15206") + '" pointer-events="none">' + (es ? 'ALACENA 33"' : 'PIE-SAFE 33"') + "</text>" +
              '<text id="kelecPieSvgLbl" x="' + (pieW / 2).toFixed(1) + '" y="111" text-anchor="middle" font-size="7.2" font-weight="700" fill="#485563" pointer-events="none">' + fmtIn(state.pieStart) + "–" + fmtIn(state.pieStart + 33) + "</text>" +
              '<rect x="' + (pieW / 2 - 26).toFixed(1) + '" y="120" width="52" height="13" rx="6" fill="#A15206" pointer-events="none"/>' +
              '<text x="' + (pieW / 2).toFixed(1) + '" y="129" text-anchor="middle" font-size="6.3" font-weight="800" fill="#FFFFFF" pointer-events="none">' + (es ? "↔ MOVER" : "↔ DRAG") + "</text>" +
            "</g>" +
            // DRAGGABLE 30" Sink Base + DW-GD Box inside
            '<g id="kelecSinkDrag" class="u4-drag-ew" tabindex="0" role="slider" aria-label="' + esc(es ? "Arrastrar gabinete de tarja 30 pulgadas" : "Drag 30 inch sink base") + '" aria-valuemin="70" aria-valuemax="80" aria-valuenow="' + state.sinkStart + '" transform="translate(' + sinkX.toFixed(1) + ', 0)">' +
              '<rect class="u4-drag-grip" x="0" y="154" width="' + sinkW.toFixed(1) + '" height="56" rx="3" fill="' + (sinkClash ? "#FEECEB" : "#E5F4EC") + '" stroke="' + (sinkClash ? "#B42318" : "#1B6B46") + '" stroke-width="2"/>' +
              '<text x="' + (sinkW / 2).toFixed(1) + '" y="170" text-anchor="middle" font-size="7.8" font-weight="800" fill="#1B6B46" pointer-events="none">' + (es ? 'TARJA 30"' : 'SINK 30"') + "</text>" +
              '<rect x="6" y="175" width="46" height="14" rx="3" fill="#184E77" pointer-events="none"/>' +
              '<text id="kelecDwgdSvgLbl" x="29" y="184.5" text-anchor="middle" font-size="6.4" font-weight="800" fill="#FFFFFF" pointer-events="none">DW-GD ' + fmtIn(state.sinkStart + 4) + "</text>" +
              '<rect x="' + (sinkW / 2 - 24).toFixed(1) + '" y="193" width="48" height="12" rx="6" fill="#1B6B46" pointer-events="none"/>' +
              '<text x="' + (sinkW / 2).toFixed(1) + '" y="201.5" text-anchor="middle" font-size="6.1" font-weight="800" fill="#FFFFFF" pointer-events="none">' + (es ? "↔ MOVER" : "↔ DRAG") + "</text>" +
            "</g>" +
            // Rear Door Limit 114"
            '<line x1="' + (x0 + 114 * Sx).toFixed(1) + '" y1="42" x2="' + (x0 + 114 * Sx).toFixed(1) + '" y2="220" stroke="#B42318" stroke-width="1.6" stroke-dasharray="4 2"/>' +
            '<text x="' + (x0 + 114 * Sx + 4).toFixed(1) + '" y="56" font-size="7.4" font-weight="800" fill="#B42318">114"</text>' +
            '<text x="44" y="229" font-size="7.8" font-weight="800" fill="#184E77">SE 0"</text>' +
            '<text x="' + (x0 + 24 * Sx).toFixed(1) + '" y="229" text-anchor="middle" font-size="7.2" fill="#184E77">S1: 24"</text>' +
            '<text x="' + (x0 + 65 * Sx).toFixed(1) + '" y="229" text-anchor="middle" font-size="7.2" fill="#184E77">S2: 65"</text>' +
            '<text id="kelecSinkFoot" x="' + (x0 + (state.sinkStart + 15) * Sx).toFixed(1) + '" y="229" text-anchor="middle" font-size="7.2" font-weight="800" fill="#1B6B46">' + fmtIn(state.sinkStart) + "–" + fmtIn(state.sinkStart + 30) + "</text>" +
          "</svg>" +
        "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Alacena existente (desde SE):" : "Pie-Safe start (from SE):") + "</span>" +
            '<div class="u4h-slider-row" style="max-width:340px">' +
              '<input id="kelecPieSlider" type="range" min="18" max="40" step="0.5" value="' + state.pieStart + '">' +
              '<span id="kelecPieReadout" class="u4h-slider-val">' + fmtIn(state.pieStart) + "–" + fmtIn(state.pieStart + 33) + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? 'Gabinete tarja 30" (desde SE):' : '30" Sink Base start (from SE):') + "</span>" +
            '<div class="u4h-slider-row" style="max-width:340px">' +
              '<input id="kelecSinkSlider" type="range" min="70" max="80" step="0.5" value="' + state.sinkStart + '">' +
              '<span id="kelecSinkReadout" class="u4h-slider-val">' + fmtIn(state.sinkStart) + "–" + fmtIn(state.sinkStart + 30) + "</span>" +
            "</div>" +
          "</div>" +
        "</div>";
      return southSvg + '<div class="u4h-photo-grid">' +
        '<div class="u4h-photo-card">' +
          '<img src="./assets/south-sink-wall.jpg" alt="' + esc(es ? "Foto real del muro Sur abierto" : "Real open-stud photo of South sink wall") + '">' +
          '<div class="u4h-photo-cap"><strong>' + (es ? "Foto real — Muro Sur:" : "Real photo — South Sink Wall:") + "</strong> " +
            (es ? "S1 @ 24\" y S2 @ 65\" a " + fmtIn(cH) + ". Caja doble DW-GD DENTRO del gabinete de tarja @ 79\" (" + fmtIn(14 + d) + " alto) con neutros separados — NUNCA detrás del lavavajillas (51\"–75\")."
                : "S1 @ 24\" & S2 @ 65\" at " + fmtIn(cH) + ". DW-GD 2-gang box goes INSIDE sink base @ 79\" (" + fmtIn(14 + d) + " high) with separate neutrals — NEVER behind 51\"–75\" dishwasher.") +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="u4h-info-box">' +
        '<div class="u4h-info-title">' + (es ? "Control de triturador (Opción activa)" : "Disposal Switch Option (Active)") + "</div>" +
        '<ul class="u4h-info-list">' +
          "<li>" + (state.sinkCtrl === "optA"
            ? (es ? "Opción A: Botón de aire en cubierta de tarja + control inalámbrico junto a S2 (sin caja extra en muro)." : "Option A: Sink-deck air button + wireless remote beside S2 (keeps wall clean without extra switch box).")
            : (es ? "Opción B: Caja doble cableada a 70\" desde SE (altura " + fmtIn(cH) + ") controlando triturador y luces de tarja." : "Option B: Wired 2-gang wall switch at 70\" from SE (" + fmtIn(cH) + " high) for disposal + sink task lights.")) + "</li>" +
          "<li>" + (es ? "Franjas de perforación en muro Sur: 30\" (SA-B), 26\"/20\" (GD), 24\" (DW)." : "South in-wall bore bands: 30\" (SA-B), 26\"/20\" (GD), 24\" (DW).") + "</li>" +
        "</ul>" +
      "</div>";
    }
    if (state.wallTab === "west") {
      return '<div class="u4h-photo-grid">' +
        '<div class="u4h-photo-card">' +
          '<img src="./assets/west-range-wall.jpeg" alt="' + esc(es ? "Foto real del muro Oeste de estufa" : "Real open-stud photo of West range wall") + '">' +
          '<div class="u4h-photo-cap"><strong>' + (es ? "Foto real — Muro Oeste:" : "Real photo — West Range Wall:") + "</strong> " +
            (es ? "W1 @ 9\" y W2 @ 57\" a " + fmtIn(cH) + " (aros de 1\" para azulejo). RG-1 @ 33\" (" + fmtIn(3 + d) + " alto). HD-1 caja sencilla 2\"×3\" a " + fmtIn(hdLow) + "–" + fmtIn(hdHigh) + " (saliendo ~1\" — reemplaza caja 4×4 a 100\")."
                : "W1 @ 9\" & W2 @ 57\" at " + fmtIn(cH) + " (1\" tile mud rings). RG-1 @ 33\" (" + fmtIn(3 + d) + " high). HD-1 flush 1-gang 2\"×3\" at " + fmtIn(hdLow) + "–" + fmtIn(hdHigh) + " (~1\" proud — replaces retired 4×4 @ 100\").") +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="u4h-cta-row">' +
        '<a class="u4h-nav-link" href="' + esc(window.U4PlanNav.planUrl("kitchen-west-ks4")) + '">' + (es ? "Abrir Guía Completa de Estufa y Campana →" : "Open Full Range & Hood 5-Step Guide →") + "</a>" +
      "</div>";
    }
    return '<div class="u4h-info-box">' +
      '<div class="u4h-info-title">' + (es ? "Muro Norte — Entrada de Pasillo (115-1/2\")" : "North Entry Wall (115-1/2\")") + "</div>" +
      '<ul class="u4h-info-list">' +
        "<li><strong>SW-ENTRY (3-Gang):</strong> " + (es ? "A 6\" al Oeste de la esquina NE, altura " + fmtIn(48 + d) + " (junto al acceso al pasillo de 29-1/2\" × 79\")." : "6\" West of NE corner, " + fmtIn(48 + d) + " high (beside 29-1/2\" × 79\" hallway opening).") + "</li>" +
        "<li>" + (es ? "Conservar intactos el zoclo original (9-1/2\") y la moldura alta (103\")." : "Keep original 9-1/2\" baseboard and 103\" high picture rail completely untouched.") + "</li>" +
      "</ul>" +
    "</div>";
  }

  function renderEquip(es) {
    var k12 = CIRCUITS.filter(function (c) { return c.grp === "kitchen" && c.wire.indexOf("12/2") === 0; }).reduce(function (a, b) { return a + b.ft; }, 0);
    var k14 = CIRCUITS.filter(function (c) { return c.grp === "kitchen" && c.wire.indexOf("14/2") === 0; }).reduce(function (a, b) { return a + b.ft; }, 0);
    var w12 = Math.ceil(k12 * 1.15);
    var w14 = Math.ceil(k14 * 1.15);
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="kelecEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "🔧 Equipo y suministros " : "🔧 Equipment & Supplies ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="kelecEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Pastillas Eaton BR (9 circuitos cocina)" : "Eaton BR Breakers (9 Kitchen Circuits)") + "</h4>" +
            "<ul>" +
              "<li>4× BRN120DF (20A Dual-Function: SA-A, SA-B, SA-C, REF)</li>" +
              "<li>3× BRN115DF (15A Dual-Function: DW, GD, RG)</li>" +
              "<li>1× BRN115AF + BRLW1 (15A AFCI + Lock-Off: HD-1 Hood)</li>" +
              "<li>1× BRN115AF (15A AFCI: LT Kitchen Lights)</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Cable y cajas (sin precios · revisar stock primero)" : "Cable & Boxes (Zero Prices · Verify Stock First)") + "</h4>" +
            "<ul>" +
              "<li>12/2 Cu Romex (" + (es ? "cocina +15%" : "kitchen +15%") + "): ~" + w12 + " ft</li>" +
              "<li>14/2 Cu Romex (" + (es ? "cocina +15%" : "kitchen +15%") + "): ~" + w14 + " ft</li>" +
              "<li>" + (es ? "Cajas: 1× sencilla 2\"×3\" (HD-1 ~1\" salida), aros de 1\" para W1/W2, 1× doble (DW-GD), 1× triple (SW-ENTRY)" : "Boxes: 1× 1-gang 2\"×3\" (HD-1 ~1\" proud), 1\" tile mud rings (W1/W2), 1× 2-gang (DW-GD), 1× 3-gang (SW-ENTRY)") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
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
        ? "<strong>PAUSA DE INSTALACIÓN ELÉCTRICA:</strong> Confirmar alimentador D04 (80A vs 100A), cortes laterales EN PAUSA y revisión de caja Eaton BRP20L125G el lunes 23 nov antes de jalar cable o cerrar tablaroca. El muro Sur muestra el bastidor existente como referencia. Sellar contra lluvia y tapar el nicho anterior, y volver a revisar las cajas en obra."
        : "<strong>ROUGH-IN ON HOLD:</strong> Confirm D04 feeder (80A vs 100A), side-entry hold, and onsite Eaton BRP20L125G inspection on Mon Nov 23 before pulling kitchen wire or closing drywall. The South elevation shows existing framing for reference. Weatherproof and cover the former recess and recheck box locations on site.";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Kitchen Outlets, Routes & 24\" Reach";
    var titleEs = "Contactos, Rutas y Alcance 24\"";
    var subEn = "9 dedicated kitchen circuits on Eaton D04 — tap any box or adjust height/floor state";
    var subEs = "9 circuitos de cocina en tablero D04 — toca cualquier caja o ajusta altura y piso";
    var inner = "";

    if (state.step === "outlets") {
      var sel = CIRCUITS.find(function (c) { return c.id === state.selectedCircuit; }) || CIRCUITS[0];
      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Alcance en cubiertas" : "Counter reach rule") + "</div>" +
            '<div class="u4h-kpi-val is-ok">≤ 24" PASS</div>' +
            '<div class="u4h-kpi-sub">E1/E2 · S1/S2 · W1/W2</div>' +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Altura contactos" : "Counter outlet height") + "</div>" +
            '<div class="u4h-kpi-val is-info">' + fmtIn(state.counterH + off()) + "</div>" +
            '<div class="u4h-kpi-sub">' + (state.floorDown ? (es ? "Desde piso terminado" : "From finished floor") : (es ? "Desde subpiso (+3/4\")" : "From subfloor (+3/4\")")) + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Circuitos cocina" : "Kitchen circuits") + "</div>" +
            '<div class="u4h-kpi-val is-info">9 / 20</div>' +
            '<div class="u4h-kpi-sub">Eaton BRP20L125G (D04)</div>' +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderFloorElectricalSvg(es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Altura de contactos de cubierta:" : "Countertop outlet height:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.counterH === 44 ? " is-active" : "") + '" data-ch="44">44" ' + (es ? "(estándar)" : "(standard)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.counterH === 41 ? " is-active" : "") + '" data-ch="41">41" ' + (es ? "(más bajo)" : "(lower)") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Interruptor de triturador:" : "Disposal switch:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.sinkCtrl === "optA" ? " is-active" : "") + '" data-sc="optA">' + (es ? "Opción A: Botón aire + remoto" : "Option A: Deck Air + Wireless") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.sinkCtrl === "optB" ? " is-active" : "") + '" data-sc="optB">' + (es ? "Opción B: Switch muro @ 70\"" : "Option B: Wired 2-Gang @ 70\"") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Luces sobre tarja:" : "Sink ceiling lights:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.taskLights === "3task" ? " is-active" : "") + '" data-tl="3task">' + (es ? "3 luces empotradas" : "3 Task Lights") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.taskLights === "2pendant" ? " is-active" : "") + '" data-tl="2pendant">' + (es ? "2 lámparas colgantes" : "2 Pendants") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "¿Piso terminado ya instalado?" : "Is finished floor down?") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (!state.floorDown ? " is-active" : "") + '" data-fl="bare">' + (es ? "No — subpiso (+3/4\")" : "No — bare subfloor (+3/4\")") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.floorDown ? " is-active" : "") + '" data-fl="done">' + (es ? "Sí — piso terminado" : "Yes — finished floor") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-item-card is-selected">' +
          '<div class="u4h-item-main">' +
            '<div class="u4h-item-name">#' + sel.sp + " · " + esc(sel.id) + " — " + esc(es ? sel.es : sel.en) + "</div>" +
            '<div class="u4h-item-meta">' + esc(sel.amp) + " · " + esc(sel.cat) + " · " + esc(sel.wire) + " · ~" + sel.ft + " ft · " + esc(es ? sel.routeEs : sel.routeEn) + "</div>" +
          "</div>" +
          '<button type="button" class="u4h-action-btn" id="kelecAskCir">' + (es ? "Preguntar a IA" : "Ask AI") + "</button>" +
        "</div>";

    } else if (state.step === "walls") {
      titleEn = "Wall-by-Wall Boxes, Heights & Real Photos";
      titleEs = "Cajas por Muro, Alturas y Fotos Reales";
      subEn = "Switch walls to check exact box stations, bore bands, and D04 no-screw warning";
      subEs = "Cambia de muro para ver alturas exactas, franjas y zona prohibida D04";

      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Elige el muro:" : "Pick a wall:") + "</span>" +
            '<div class="u4h-pill-group">' +
              [
                ["east", es ? "Este (Refri y D04)" : "East (Fridge & D04)"],
                ["south", es ? "Sur (Tarja y DW-GD)" : "South (Sink & DW-GD)"],
                ["west", es ? "Oeste (Estufa y HD-1)" : "West (Range & HD-1)"],
                ["north", es ? "Norte (Entrada)" : "North (Entry)"]
              ].map(function (w) {
                return '<button type="button" class="u4h-pill' + (state.wallTab === w[0] ? " is-active" : "") + '" data-wtab="' + w[0] + '">' + w[1] + "</button>";
              }).join("") +
            "</div>" +
          "</div>" +
        "</div>" +
        renderWallDetail(es);

    } else if (state.step === "panel") {
      titleEn = "Subpanel D04 Schedule (Eaton BRP20L125G)";
      titleEs = "Lista de Circuitos Subpanel D04 (Eaton BRP20L125G)";
      subEn = "Spaces 1–9 serve the Kitchen; toggle below to view Spaces 10–20 across the rest of Unit 4";
      subEs = "Espacios 1–9 son de Cocina; activa abajo para ver Espacios 10–20 del resto de la Unidad 4";

      var list = state.showUnitSlots ? CIRCUITS : CIRCUITS.filter(function (c) { return c.grp === "kitchen"; });
      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Mostrar espacios del tablero:" : "Show panel spaces:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (!state.showUnitSlots ? " is-active" : "") + '" data-pshow="k">' + (es ? "Solo Cocina (1–9)" : "Kitchen Only (1–9)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.showUnitSlots ? " is-active" : "") + '" data-pshow="all">' + (es ? "Todos (1–20 Unidad 4)" : "All 20 Spaces (Unit 4)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-item-list">' +
          list.map(function (c) {
            var isK = c.grp === "kitchen";
            return '<div class="u4h-item-card' + (state.selectedCircuit === c.id ? " is-selected" : "") + '" data-cir="' + c.id + '" style="cursor:pointer">' +
              '<div class="u4h-item-main">' +
                '<div class="u4h-item-name">#' + c.sp + " " + esc(c.id) + " — " + esc(es ? c.es : c.en) + "</div>" +
                '<div class="u4h-item-meta">' + esc(c.amp) + " · " + esc(c.cat) + " · " + esc(c.wire) + (c.ft ? " · ~" + c.ft + " ft" : "") + "</div>" +
                '<div class="u4h-item-note">' + esc(es ? c.routeEs : c.routeEn) + "</div>" +
              "</div>" +
              '<span class="u4h-badge ' + (isK ? "is-locked" : "") + '">' + (isK ? (es ? "Cocina" : "Kitchen") : (es ? "Unidad" : "Unit")) + "</span>" +
            "</div>";
          }).join("") +
        "</div>";

    } else {
      titleEn = "Electrical Pre-Rough-In Holds & Supplies";
      titleEs = "Candados Previos al Cableado y Suministros";
      subEn = "Confirm every safety gate before pulling kitchen cable or closing walls";
      subEs = "Confirma cada punto antes de jalar cable en cocina o cerrar muros";

      var holds = [
        { k: "h1", en: "1. D04 Backside (East 13\"–27-1/2\" from SE, 53\"–77\" H): ZERO screws, ZERO boxes, side-entry ON HOLD", es: "1. Respaldo D04 (Este 13\"–27-1/2\" desde SE, 53\"–77\" alto): CERO tornillos, CERO cajas, cortes laterales EN PAUSA" },
        { k: "h2", en: "2. Mon Nov 23 walkthrough: confirm 80A/#4 Cu vs 100A/#3 Cu feeder & inspect Eaton BRP20L125G onsite", es: "2. Visita lunes 23 nov: confirmar alimentador 80A/#4 vs 100A/#3 y revisar caja Eaton BRP20L125G en obra" },
        { k: "h3", en: "3. DW-GD 2-gang goes INSIDE 30\" sink base (@ 79\", 14\" H) with separate neutrals — NEVER behind dishwasher", es: "3. Caja doble DW-GD va DENTRO del gabinete de tarja (@ 79\", 14\" alto) con neutros separados — NUNCA atrás del lavavajillas" },
        { k: "h4", en: "4. HD-1 hood is flush 1-gang 2\"×3\" (~83\"–86\" AFF, ~1\" proud) — replaces retired 4×4 @ 100\"/104\"", es: "4. Campana HD-1 usa caja sencilla 2\"×3\" (~83\"–86\" piso, ~1\" salida) — reemplaza caja 4×4 a 100\"/104\"" }
      ];

      inner =
        '<div class="u4h-item-list">' +
          holds.map(function (h) {
            var done = !!state.holds[h.k];
            return '<div class="u4h-item-card' + (done ? " is-selected" : "") + '">' +
              '<label style="display:flex;gap:10px;align-items:center;flex:1;cursor:pointer">' +
                '<input type="checkbox" data-h="' + h.k + '"' + (done ? " checked" : "") + ' style="width:17px;height:17px;accent-color:var(--cobalt)">' +
                '<span class="u4h-item-name" style="font-size:13.2px">' + esc(es ? h.es : h.en) + "</span>" +
              "</label>" +
            "</div>";
          }).join("") +
        "</div>" +
        '<div class="u4h-cta-row">' +
          '<button type="button" class="u4h-action-btn" id="kelecLogBtn">' + (es ? "📝 Enviar notas eléctricas al PM" : "📝 Log electrical field note to PM") + "</button>" +
        "</div>" +
        renderEquip(es);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="kelecPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + (es ? "Anterior" : "Prev") + "</button>" +
      '<span class="u4h-pager-count">' + (es ? "Paso " : "Step ") + (idx + 1) + (es ? " de " : " of ") + STEPS.length + "</span>" +
      '<button type="button" id="kelecNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + (es ? "Siguiente" : "Next") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(es ? titleEs : titleEn) + "</div>" +
            '<div class="u4h-sub">' + esc(es ? subEs : subEn) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">D04 · 9 Ckt</span>' +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); render(); window.scrollTo(0, 0); });
    });
    host.querySelectorAll("[data-ch]").forEach(function (b) {
      b.addEventListener("click", function () { state.counterH = parseInt(b.getAttribute("data-ch"), 10); render(); });
    });
    host.querySelectorAll("[data-sc]").forEach(function (b) {
      b.addEventListener("click", function () { state.sinkCtrl = b.getAttribute("data-sc"); render(); });
    });
    host.querySelectorAll("[data-tl]").forEach(function (b) {
      b.addEventListener("click", function () { state.taskLights = b.getAttribute("data-tl"); render(); });
    });
    host.querySelectorAll("[data-fl]").forEach(function (b) {
      b.addEventListener("click", function () { state.floorDown = b.getAttribute("data-fl") === "done"; syncUnderlyingPrint(); render(); });
    });
    host.querySelectorAll("[data-wtab]").forEach(function (b) {
      b.addEventListener("click", function () { state.wallTab = b.getAttribute("data-wtab"); render(); });
    });
    host.querySelectorAll("[data-cir]").forEach(function (el) {
      el.addEventListener("click", function () { state.selectedCircuit = el.getAttribute("data-cir"); syncUnderlyingPrint(); render(); });
    });
    host.querySelectorAll("[data-pshow]").forEach(function (b) {
      b.addEventListener("click", function () { state.showUnitSlots = b.getAttribute("data-pshow") === "all"; render(); });
    });
    host.querySelectorAll("[data-h]").forEach(function (cb) {
      cb.addEventListener("change", function () { state.holds[cb.getAttribute("data-h")] = cb.checked; render(); });
    });
    var eqBtn = document.getElementById("kelecEquipBtn");
    if (eqBtn) eqBtn.addEventListener("click", function () { state.equipOpen = !state.equipOpen; render(); });
    var askBtn = document.getElementById("kelecAskCir");
    if (askBtn) askBtn.addEventListener("click", function () {
      var cObj = CIRCUITS.find(function (c) { return c.id === state.selectedCircuit; });
      if (window.U4LiveAi && cObj) window.U4LiveAi.open("", "#" + cObj.sp + " " + cObj.id + " (" + (es ? cObj.es : cObj.en) + ")");
    });
    var logBtn = document.getElementById("kelecLogBtn");
    if (logBtn) logBtn.addEventListener("click", function () {
      if (window.U4LiveAi) window.U4LiveAi.openNote("Kitchen Electrical / D04 field note (counterH=" + state.counterH + ", sinkCtrl=" + state.sinkCtrl + "): ");
    });
    var pBtn = document.getElementById("kelecPrevBtn");
    var nBtn = document.getElementById("kelecNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });

    if (state.step === "walls" && state.wallTab === "south") {
      var Sx = 3.2, x0 = 44;
      function updatePieLive(val) {
        var v = Math.max(18, Math.min(40, Math.round(val * 2) / 2));
        state.pieStart = v;
        var g = document.getElementById("kelecPieDrag");
        if (g) { g.setAttribute("transform", "translate(" + (x0 + v * Sx).toFixed(1) + ", 0)"); g.setAttribute("aria-valuenow", String(v)); }
        var sl = document.getElementById("kelecPieSlider"); if (sl) sl.value = String(v);
        var ro = document.getElementById("kelecPieReadout"); if (ro) ro.textContent = fmtIn(v) + "–" + fmtIn(v + 33);
        var svgL = document.getElementById("kelecPieSvgLbl"); if (svgL) svgL.textContent = fmtIn(v) + "–" + fmtIn(v + 33);
        syncHiddenSouthRanges();
      }
      function updateSinkLive(val) {
        var v = Math.max(70, Math.min(80, Math.round(val * 2) / 2));
        state.sinkStart = v;
        var g = document.getElementById("kelecSinkDrag");
        if (g) { g.setAttribute("transform", "translate(" + (x0 + v * Sx).toFixed(1) + ", 0)"); g.setAttribute("aria-valuenow", String(v)); }
        var sl = document.getElementById("kelecSinkSlider"); if (sl) sl.value = String(v);
        var ro = document.getElementById("kelecSinkReadout"); if (ro) ro.textContent = fmtIn(v) + "–" + fmtIn(v + 30);
        var dwL = document.getElementById("kelecDwgdSvgLbl"); if (dwL) dwL.textContent = "DW-GD " + fmtIn(v + 4);
        var ftL = document.getElementById("kelecSinkFoot"); if (ftL) { ftL.setAttribute("x", (x0 + (v + 15) * Sx).toFixed(1)); ftL.textContent = fmtIn(v) + "–" + fmtIn(v + 30); }
        syncHiddenSouthRanges();
      }
      var pieSl = document.getElementById("kelecPieSlider");
      if (pieSl) { pieSl.addEventListener("input", function () { updatePieLive(parseFloat(pieSl.value)); }); pieSl.addEventListener("change", render); }
      var sinkSl = document.getElementById("kelecSinkSlider");
      if (sinkSl) { sinkSl.addEventListener("input", function () { updateSinkLive(parseFloat(sinkSl.value)); }); sinkSl.addEventListener("change", render); }

      var sSvg = document.getElementById("kelecSouthSvg");
      function bindHDrag(elId, getStart, applyFn) {
        var el = document.getElementById(elId);
        if (!el || !sSvg) return;
        el.addEventListener("pointerdown", function (e) {
          if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
          e.preventDefault();
          var pid = e.pointerId;
          var startVal = getStart();
          var startX = e.clientX;
          var rect = sSvg.getBoundingClientRect();
          var pxPerSvgX = (rect.width || 460) / 460;
          el.classList.add("is-dragging");
          try { el.setPointerCapture(pid); } catch (_) {}
          var blockScroll = function (tev) { if (tev.cancelable) tev.preventDefault(); };
          window.addEventListener("touchmove", blockScroll, { passive: false });
          function onMove(ev) {
            if (ev.pointerId !== pid) return;
            var dxSvg = (ev.clientX - startX) / (pxPerSvgX || 1);
            applyFn(startVal + dxSvg / Sx);
          }
          function finish(ev) {
            if (ev && ev.pointerId !== pid) return;
            el.classList.remove("is-dragging");
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", finish);
            document.removeEventListener("pointercancel", finish);
            window.removeEventListener("touchmove", blockScroll);
            try { if (el.hasPointerCapture && el.hasPointerCapture(pid)) el.releasePointerCapture(pid); } catch (_) {}
            render();
          }
          document.addEventListener("pointermove", onMove);
          document.addEventListener("pointerup", finish);
          document.addEventListener("pointercancel", finish);
        });
        el.addEventListener("keydown", function (e) {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); applyFn(getStart() + 0.5); }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); applyFn(getStart() - 0.5); }
        });
      }
      bindHDrag("kelecPieDrag", function () { return state.pieStart; }, updatePieLive);
      bindHDrag("kelecSinkDrag", function () { return state.sinkStart; }, updateSinkLive);
    }

    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext();
    }
  }

  function applyKelecView(args) {
    args = args || {};
    var changed = false;
    var wallRaw = String(args.wall || "").toLowerCase().trim();
    if (wallRaw === "south" || wallRaw === "east" || wallRaw === "west" || wallRaw === "north") {
      state.step = "walls";
      state.wallTab = wallRaw;
      changed = true;
    } else if (wallRaw === "plan" || wallRaw === "all") {
      state.step = "outlets";
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
        var map = { overview: "outlets", all: "outlets", d04: "panel", subpanel: "panel", checklist: "holds" };
        var id = map[s] || s;
        if (STEPS.some(function (x) { return x.id === id; })) { state.step = id; changed = true; }
      }
    }
    if (changed) render();
    return changed;
  }

  window.U4PlanControl = {
    showView: function (args) { return applyKelecView(args); },
    applyChange: function (args) {
      args = args || {};
      var act = String(args.action || args.target || "").toLowerCase();
      var val = args.value;
      if (act === "pie_start" || act === "piesafe") {
        var v = Math.max(18, Math.min(40, Math.round(Number(val) * 2) / 2));
        if (!isFinite(v)) return false;
        state.pieStart = v;
        state.step = "walls";
        state.wallTab = "south";
      } else if (act === "sink_start" || act === "sink") {
        var sv = Math.max(70, Math.min(80, Math.round(Number(val) * 2) / 2));
        if (!isFinite(sv)) return false;
        state.sinkStart = sv;
        state.step = "walls";
        state.wallTab = "south";
      } else if (act === "counter_h") {
        state.counterH = Number(val) === 41 ? 41 : 44;
      } else if (act === "wall") {
        return applyKelecView({ wall: val });
      } else if (act === "reset") {
        state.pieStart = 26.0;
        state.sinkStart = 75.0;
        state.counterH = 44;
        state.floorDown = false;
      } else {
        return false;
      }
      render();
      return true;
    },
    getState: function () {
      return {
        planId: "kitchen-electrical",
        step: state.step,
        wall: state.step === "walls" ? state.wallTab : "all",
        pieStart: state.pieStart,
        sinkStart: state.sinkStart,
        counterH: state.counterH,
        selectedCircuit: state.selectedCircuit,
        summary: "Kitchen Electrical & D04: step=" + state.step + (state.step === "walls" ? (" (" + state.wallTab + " wall)") : "") + ", pieStart=" + state.pieStart + "in, sinkStart=" + state.sinkStart + "in, counterH=" + state.counterH + "in."
      };
    }
  };

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "kitchen-electrical",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { render(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); }
      });
      var bp = window.U4PlanNav.getBootParams ? window.U4PlanNav.getBootParams() : {};
      if (bp.wall || bp.step) applyKelecView(bp);
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "kitchen-electrical",
        room: "electrical",
        titleEn: "Kitchen Electrical & Subpanel D04",
        titleEs: "Eléctrico de Cocina y Subpanel D04",
        getContext: function () {
          return "Step=" + state.step + ", ActiveCircuit=" + state.selectedCircuit + ", CounterH=" + state.counterH + "in, FloorDown=" + state.floorDown + ", SinkControl=" + state.sinkCtrl + ", 9 kitchen circuits on Eaton BRP20L125G D04 (Dining-side), East D04 no-screw zone 53-77in, HD-1 1-gang 2x3 at 83-86in AFF.";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Dónde va la caja doble DW-GD?", "¿Cuál es la zona prohibida D04?", "¿Por qué HD-1 usa caja sencilla 2\"×3\"?"]
            : ["Where does the DW-GD 2-gang box go?", "Where is the D04 no-screw zone?", "Why is HD-1 a 1-gang 2\"×3\" box?"];
        }
      });
    }
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
