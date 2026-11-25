/* ============================================================================
   Kitchen Electrical & Subpanel D04 — Real-World Human-First Interactive Guide
   Two-Layer Architecture: Clean 4-Step Crew UI + Hidden #blueprint-sheet-shell
   Zero External CDNs · Zero Prices · Zero Backend Clutter · Zero Storage · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "outlets", en: "1. Outlets & Routes", es: "1. Contactos y Rutas" },
    { id: "walls", en: "2. All Walls & D04", es: "2. Todos los Muros" },
    { id: "panel", en: "3. Subpanel D04", es: "3. Tablero D04" },
    { id: "wire-3d", en: "4. 3D Wire Mockup", es: "4. Modelo 3D" },
    { id: "attic-runs", en: "5. Attic & Ceiling Runs", es: "5. Rutas en Ático" },
    { id: "attic-guide", en: "6. Attic Wiring Guide", es: "6. Guía de Ático" },
    { id: "holds", en: "7. Holds & Supplies", es: "7. Candados y Kit" }
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
    sinkStart: 72.0,        // 70..80 in from SE (width 30")
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
          "<li><strong>E1 @ 10\" &amp; E2 @ 45\" (" + (es ? "Circuito SA-A 20A" : "Circuit SA-A 20A") + "):</strong> " + (es ? "Altura " : "Height ") + fmtIn(cH) + " · " + (es ? "Franja perforación 50\"" : "50\" in-wall bore band") + ".</li>" +
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
        '<div class="u4h-svg-hint"><span>' + (es ? '✋ Arrastra el Hueco Anterior o el Gabinete de Tarja directo sobre el muro Sur (o usa las barras abajo) para probar contactos:' : '✋ Drag the Former Opening or 30" Sink Base directly along the South wall (or slide below) to check outlet clearances:') + "</span></div>" +
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
            '<g id="kelecPieDrag" class="u4-drag-ew" tabindex="0" role="slider" aria-label="' + esc(es ? "Arrastrar hueco anterior por cubrir" : "Drag former opening to be covered") + '" aria-valuemin="18" aria-valuemax="40" aria-valuenow="' + state.pieStart + '" transform="translate(' + pieX.toFixed(1) + ', 0)">' +
              '<rect class="u4-drag-grip" x="0" y="76" width="' + pieW.toFixed(1) + '" height="68" rx="4" fill="' + (pieClashS1 || pieClashS2 ? "#FEECEB" : "#FDF2E4") + '" stroke="' + (pieClashS1 || pieClashS2 ? "#B42318" : "#A15206") + '" stroke-width="1.8" stroke-dasharray="5 3"/>' +
              '<text x="' + (pieW / 2).toFixed(1) + '" y="98" text-anchor="middle" font-size="8" font-weight="800" fill="' + (pieClashS1 || pieClashS2 ? "#B42318" : "#A15206") + '" pointer-events="none">' + (es ? 'CUBRIR HUECO 33"' : 'COVER OPENING 33"') + "</text>" +
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
            '<span class="u4h-ctrl-lbl">' + (es ? "Hueco anterior (desde SE):" : "Former opening start (from SE):") + "</span>" +
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
            (es ? "S1 @ 24\" y S2 @ 65\" a " + fmtIn(cH) + ". Caja doble DW-GD DENTRO del gabinete de tarja (provisional) (" + fmtIn(14 + d) + " alto) con neutros separados — NUNCA detrás del lavavajillas (48\"–72\")."
                : "S1 @ 24\" & S2 @ 65\" at " + fmtIn(cH) + ". DW-GD 2-gang box goes INSIDE sink base (provisional) (" + fmtIn(14 + d) + " high) with separate neutrals — NEVER behind 48\"–72\" dishwasher.") +
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
            (es ? "W1 @ 9\" y W2 @ 57\" a " + fmtIn(cH) + " (aros de 1\" para azulejo). RG-1 @ 33\" (" + fmtIn(3 + d) + " alto). HD-1 caja sencilla 2\"×3\" a " + fmtIn(hdLow) + "–" + fmtIn(hdHigh) + " (al ras — reemplaza caja 4×4 a 100\")."
                : "W1 @ 9\" & W2 @ 57\" at " + fmtIn(cH) + " (1\" tile mud rings). RG-1 @ 33\" (" + fmtIn(3 + d) + " high). HD-1 flush 1-gang 2\"×3\" at " + fmtIn(hdLow) + "–" + fmtIn(hdHigh) + " (flush — replaces retired 4×4 @ 100\").") +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="u4h-cta-row">' +
        '<a class="u4h-nav-link" href="' + esc(window.U4PlanNav.planUrl("kitchen-west-ks4")) + '">' + (es ? "Abrir Guía Completa de Estufa y Campana →" : "Open Full Range & Hood 5-Step Guide →") + "</a>" +
      "</div>";
    }
    return renderExtraWallSvg(es, state.wallTab, d);
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
              "<li>" + (es ? "Cajas: 1× sencilla 2\"×3\" (HD-1 al ras), aros de 1\" para W1/W2, 1× doble (DW-GD), 1× triple (SW-ENTRY)" : "Boxes: 1× 1-gang 2\"×3\" (HD-1 flush), 1\" tile mud rings (W1/W2), 1× 2-gang (DW-GD), 1× 3-gang (SW-ENTRY)") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

/* U4_KELEC_ATTIC_STEPS_HELPERS_START */
  function renderExtraWallSvg(es, tab, d) {
    // Clean proportional SVG elevations for all previously missing walls (North, Dining/D04, Bath, Laundry, Bedroom, Living/Hall)
    if (tab === "north") {
      return '<div class="u4h-svg-card">' +
        '<svg viewBox="0 0 560 275" width="100%" role="img" aria-label="' + esc(es ? "Elevación Muro Norte de Cocina" : "Kitchen North Entry Wall Elevation") + '">' +
          '<rect x="0" y="0" width="560" height="275" fill="#F8FAF8" rx="8"/>' +
          '<text x="280" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#131A22">' +
            (es ? "MURO NORTE COCINA (115-1/2\" × 121-1/2\") — ENTRADA PASILLO Y MOLDURAS ORIGINALES" : "KITCHEN NORTH ENTRY WALL (115-1/2\" × 121-1/2\") — HALL OPENING &amp; ORIGINAL TRIM") +
          '</text>' +
          // Wall outline: 115.5" wide -> 420px (3.64 px/in), 121.5" tall -> 210px (1.73 px/in), ox=70, oy=34, floor=244
          '<rect x="70" y="34" width="420" height="210" fill="#FCFDFE" stroke="#131A22" stroke-width="2"/>' +
          // 103" picture rail (y = 244 - 103*1.73 = 65.8)
          '<line x1="70" y1="65.8" x2="490" y2="65.8" stroke="#8A5A2B" stroke-width="3" stroke-dasharray="6,3"/>' +
          '<text x="76" y="61" font-size="7.5" font-weight="700" fill="#8A5A2B">' + (es ? "Moldura alta original 103\" — NO CORTAR" : "Original 103\" Picture Rail — DO NOT CUT") + '</text>' +
          // 9.5" baseboard (y = 244 - 9.5*1.73 = 227.6)
          '<rect x="70" y="227.6" width="312" height="16.4" fill="#EFE4D6" stroke="#8A5A2B" stroke-width="1"/>' +
          '<text x="225" y="239" text-anchor="middle" font-size="7.2" font-weight="700" fill="#7C4D1E">' + (es ? "Zoclo Eduardiano original 9-1/2\" — CONSERVAR" : "Original 9-1/2\" Edwardian Baseboard — KEEP INTACT") + '</text>' +
          // Hallway opening on East side (29.5" wide = 107.3px, 79" tall = 136.7px -> x=382.7..490, y=107.3..244)
          '<rect x="382.7" y="107.3" width="107.3" height="136.7" fill="#E8EEF2" stroke="#2C3E50" stroke-width="2"/>' +
          '<text x="436" y="172" text-anchor="middle" font-size="9" font-weight="800" fill="#2C3E50">' + (es ? "VANO PASILLO" : "HALL OPENING") + '</text>' +
          '<text x="436" y="185" text-anchor="middle" font-size="7.5" fill="#4A5568">29-1/2" × 79"</text>' +
          // Attic vertical drop to SW-ENTRY (6" W of opening -> x=360, y=244 - 48*1.73 = 161)
          '<line x1="360" y1="34" x2="360" y2="152" stroke="#184E77" stroke-width="2.2" stroke-dasharray="5,3"/>' +
          '<rect x="346" y="152" width="28" height="18" rx="3" fill="#E6F0F8" stroke="#184E77" stroke-width="1.8"/>' +
          '<text x="360" y="164" text-anchor="middle" font-size="6.8" font-weight="800" fill="#184E77">3-G</text>' +
          '<text x="338" y="156" text-anchor="end" font-size="8" font-weight="800" fill="#184E77">SW-ENTRY (LT Sp 9)</text>' +
          '<text x="338" y="167" text-anchor="end" font-size="7" fill="#4A5568">' + (es ? "6\" O del vano · " : "6\" W of opening · ") + fmtIn(48 + d) + '</text>' +
          // Compass / dims
          '<text x="70" y="262" font-size="7.5" font-weight="700" fill="#4A5568">' + (es ? "← ESQUINA NO (Muro Oeste)" : "← NW CORNER (West Wall)") + '</text>' +
          '<text x="490" y="262" text-anchor="end" font-size="7.5" font-weight="700" fill="#4A5568">' + (es ? "ESQUINA NE (Pasillo) →" : "NE CORNER (Hallway) →") + '</text>' +
        '</svg>' +
      '</div>';
    }
    if (tab === "dining") {
      return '<div class="u4h-svg-card">' +
        '<svg viewBox="0 0 560 280" width="100%" role="img" aria-label="' + esc(es ? "Elevación Comedor y Tablero D04" : "Dining Room & Subpanel D04 Face Elevation") + '">' +
          '<rect x="0" y="0" width="560" height="280" fill="#F8FAF8" rx="8"/>' +
          '<text x="280" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#131A22">' +
            (es ? "COMEDOR — CARA DEL SUBPANEL D04 (EATON BRP20L125G) Y RUTA VERTICAL AL ÁTICO" : "DINING ROOM — SUBPANEL D04 FACE (EATON BRP20L125G) &amp; VERTICAL ATTIC RISER") +
          '</text>' +
          '<rect x="46" y="34" width="468" height="212" fill="#FCFDFE" stroke="#131A22" stroke-width="2"/>' +
          // SFEC 110.26(A)(3) 30" W x 78" H clear working space around D04
          '<rect x="192" y="111" width="112" height="135" fill="#FEF3C7" fill-opacity="0.55" stroke="#B45309" stroke-width="1.5" stroke-dasharray="5,3"/>' +
          '<text x="248" y="238" text-anchor="middle" font-size="7" font-weight="800" fill="#92400E">SFEC 110.26(A)(3): 30"W × 36"D × 78"H CLEAR</text>' +
          // Vertical attic chase above D04
          '<rect x="232" y="34" width="32" height="80" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="1.4" stroke-dasharray="4,2"/>' +
          '<text x="272" y="64" font-size="7.5" font-weight="800" fill="#1E40AF">' + (es ? "Bajada/Subida Vertical al Ático" : "Vertical Attic Riser Chase") + '</text>' +
          '<text x="272" y="75" font-size="6.8" fill="#1E40AF">' + (es ? "Sello cortafuego en doble solera" : "Firestopped double top plate") + '</text>' +
          // D04 Can (53" to 77" AFF -> y = 246 - 77*1.73 = 112.8 to 246 - 53*1.73 = 154.3)
          '<rect x="224" y="113" width="48" height="42" rx="3" fill="#CBD5E1" stroke="#0F172A" stroke-width="2.2"/>' +
          '<text x="248" y="131" text-anchor="middle" font-size="8.5" font-weight="900" fill="#0F172A">D04</text>' +
          '<text x="248" y="143" text-anchor="middle" font-size="6.4" font-weight="700" fill="#334155">20 Sp · 65" CL</text>' +
          // Bottom 80A/#4 Cu Feeder
          '<line x1="248" y1="155" x2="248" y2="246" stroke="#334155" stroke-width="4"/>' +
          '<text x="256" y="198" font-size="7.2" font-weight="800" fill="#1E293B">80A #4 Cu Feeder</text>' +
          // D1-D4 Dining receptacles (Sp 12) at 18" AFF (y = 246 - 18*1.73 = 215)
          '<circle cx="96" cy="215" r="8" fill="#FEF3C7" stroke="#B45309" stroke-width="1.8"/>' +
          '<text x="96" y="217.5" text-anchor="middle" font-size="6.5" font-weight="800" fill="#92400E">D1</text>' +
          '<circle cx="380" cy="215" r="8" fill="#FEF3C7" stroke="#B45309" stroke-width="1.8"/>' +
          '<text x="380" y="217.5" text-anchor="middle" font-size="6.5" font-weight="800" fill="#92400E">D2</text>' +
          '<circle cx="468" cy="215" r="8" fill="#FEF3C7" stroke="#B45309" stroke-width="1.8"/>' +
          '<text x="468" y="217.5" text-anchor="middle" font-size="6.5" font-weight="800" fill="#92400E">D3/4</text>' +
          '<text x="46" y="266" font-size="7.5" font-weight="700" fill="#4A5568">' +
            (es ? "Sp 12 (DIN 20A): D1–D4 a 18\" AFF · Sin D5 detrás de D04 · Puerta corrediza baño retirada (puerta abatible 28\")" : "Sp 12 (DIN 20A): D1–D4 @ 18\" AFF · No D5 on D04 back · Bath pocket door retired (28\" outward-swing)") +
          '</text>' +
        '</svg>' +
      '</div>';
    }
    if (tab === "bathroom") {
      return '<div class="u4h-svg-card">' +
        '<svg viewBox="0 0 560 270" width="100%" role="img" aria-label="' + esc(es ? "Elevación Eléctrica de Baño" : "Bathroom Electrical Elevation") + '">' +
          '<rect x="0" y="0" width="560" height="270" fill="#F8FAF8" rx="8"/>' +
          '<text x="280" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#131A22">' +
            (es ? "BAÑO — CONTACTOS V1/T1 (Sp 14 / Op. Sp 19) Y LUZ + EXTRACTOR (Sp 15)" : "BATHROOM — V1/T1 GFCI (Sp 14 / Opt Sp 19) &amp; LIGHT + FAN (Sp 15)") +
          '</text>' +
          '<rect x="46" y="34" width="468" height="205" fill="#FCFDFE" stroke="#131A22" stroke-width="2"/>' +
          // Ceiling light + humidity fan (Sp 15)
          '<rect x="190" y="36" width="84" height="16" rx="3" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
          '<text x="232" y="47" text-anchor="middle" font-size="7" font-weight="800" fill="#184E77">BATH-L Light (Sp 15)</text>' +
          '<rect x="315" y="36" width="96" height="16" rx="3" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
          '<text x="363" y="47" text-anchor="middle" font-size="7" font-weight="800" fill="#184E77">Humidity Fan (Sp 15)</text>' +
          // Vanity light @ 78" AFF + Mirror + Vanity
          '<circle cx="155" cy="96" r="10" fill="#FEF9C3" stroke="#CA8A04" stroke-width="1.8"/>' +
          '<text x="155" y="98.5" text-anchor="middle" font-size="6.5" font-weight="800" fill="#854D0E">VL</text>' +
          '<rect x="112" y="114" width="86" height="54" fill="#E2E8F0" stroke="#64748B" stroke-width="1.2"/>' +
          '<rect x="104" y="178" width="102" height="61" fill="#F1F5F9" stroke="#334155" stroke-width="1.6"/>' +
          '<text x="155" y="212" text-anchor="middle" font-size="8" font-weight="700" fill="#334155">' + (es ? "Lavabo / Vanity" : "Vanity") + '</text>' +
          // V1 GFCI @ 42" AFF
          '<line x1="226" y1="34" x2="226" y2="156" stroke="#B45309" stroke-width="2" stroke-dasharray="5,3"/>' +
          '<rect x="214" y="156" width="24" height="16" rx="3" fill="#FEF3C7" stroke="#B45309" stroke-width="1.8"/>' +
          '<text x="226" y="167" text-anchor="middle" font-size="7" font-weight="800" fill="#92400E">V1</text>' +
          '<text x="244" y="167" font-size="7.2" font-weight="700" fill="#92400E">20A GFCI @ 42" (Sp 14)</text>' +
          // Toilet + T1 Bidet @ 12" AFF
          '<rect x="352" y="188" width="48" height="51" rx="8" fill="#F1F5F9" stroke="#334155" stroke-width="1.6"/>' +
          '<text x="376" y="217" text-anchor="middle" font-size="7.5" font-weight="700" fill="#334155">WC</text>' +
          '<line x1="422" y1="34" x2="422" y2="210" stroke="#7C3AED" stroke-width="2" stroke-dasharray="5,3"/>' +
          '<rect x="410" y="210" width="24" height="16" rx="3" fill="#F3E8FF" stroke="#7C3AED" stroke-width="1.8"/>' +
          '<text x="422" y="221" text-anchor="middle" font-size="7" font-weight="800" fill="#6D28D9">T1</text>' +
          '<text x="438" y="218" font-size="7" font-weight="700" fill="#6D28D9">' + (es ? "Bidet GFCI" : "Bidet GFCI") + '</text>' +
          '<text x="438" y="228" font-size="6.4" fill="#6D28D9">(Sp 14 / Opt Sp 19)</text>' +
          '<text x="46" y="256" font-size="7.4" font-weight="700" fill="#4A5568">' +
            (es ? "Recomendación profesional: usar Sp 19 libre para Bidet T1 (10–12A) y evitar disparo con secadora de cabello en V1." : "Best practice: put heated Bidet T1 (10–12A) on open Spare Sp 19 so hair dryers on V1 never trip the breaker.") +
          '</text>' +
        '</svg>' +
      '</div>';
    }
    if (tab === "laundry") {
      return '<div class="u4h-svg-card">' +
        '<svg viewBox="0 0 560 265" width="100%" role="img" aria-label="' + esc(es ? "Elevación Clóset de Lavandería" : "Laundry Closet Electrical Elevation") + '">' +
          '<rect x="0" y="0" width="560" height="265" fill="#F8FAF8" rx="8"/>' +
          '<text x="280" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#131A22">' +
            (es ? "CLÓSET DE LAVANDERÍA — LAVADORA 20A (Sp 16) Y SECADORA GAS 15A (Sp 18)" : "LAUNDRY CLOSET — 20A WASHER (Sp 16) &amp; 15A GAS DRYER (Sp 18)") +
          '</text>' +
          '<rect x="110" y="34" width="340" height="202" fill="#FCFDFE" stroke="#131A22" stroke-width="2"/>' +
          // Two dedicated vertical attic drops
          '<line x1="256" y1="34" x2="256" y2="148" stroke="#B45309" stroke-width="2.4" stroke-dasharray="5,3"/>' +
          '<line x1="292" y1="34" x2="292" y2="148" stroke="#184E77" stroke-width="2.4" stroke-dasharray="5,3"/>' +
          '<text x="248" y="72" text-anchor="end" font-size="7.3" font-weight="800" fill="#92400E">Sp 16: 12/2 20A DF</text>' +
          '<text x="300" y="72" font-size="7.3" font-weight="800" fill="#184E77">Sp 18: 14/2 15A DF</text>' +
          // 2-gang box @ 42" AFF
          '<rect x="240" y="148" width="68" height="24" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>' +
          '<rect x="244" y="152" width="28" height="16" rx="2" fill="#FEF3C7" stroke="#B45309" stroke-width="1.4"/>' +
          '<text x="258" y="163" text-anchor="middle" font-size="6.4" font-weight="800" fill="#92400E">WSH-1</text>' +
          '<rect x="276" y="152" width="28" height="16" rx="2" fill="#E6F0F8" stroke="#184E77" stroke-width="1.4"/>' +
          '<text x="290" y="163" text-anchor="middle" font-size="6.4" font-weight="800" fill="#184E77">DRY-1</text>' +
          '<text x="316" y="163" font-size="7.3" font-weight="700" fill="#334155">2-Gang @ 42" AFF (Separate Neutrals)</text>' +
          // Washer & Dryer outlines
          '<rect x="132" y="182" width="110" height="54" fill="#F1F5F9" stroke="#64748B" stroke-width="1.4"/>' +
          '<text x="187" y="213" text-anchor="middle" font-size="8" font-weight="700" fill="#334155">' + (es ? "Lavadora" : "Washer") + '</text>' +
          '<rect x="306" y="182" width="110" height="54" fill="#F1F5F9" stroke="#64748B" stroke-width="1.4"/>' +
          '<text x="361" y="213" text-anchor="middle" font-size="8" font-weight="700" fill="#334155">' + (es ? "Secadora Gas" : "Gas Dryer") + '</text>' +
          '<text x="110" y="253" font-size="7.4" font-weight="700" fill="#4A5568">' +
            (es ? "Neutros independientes etiquetados · Mantener claro de válvula de gas y ducto metálico rígido." : "Separate labeled neutrals for AFCI/GFCI · Keep clear of gas shutoff and rigid metal dryer duct.") +
          '</text>' +
        '</svg>' +
      '</div>';
    }
    if (tab === "bedroom") {
      return '<div class="u4h-svg-card">' +
        '<svg viewBox="0 0 560 265" width="100%" role="img" aria-label="' + esc(es ? "Elevación Recámara NW" : "Bedroom NW Electrical Elevation") + '">' +
          '<rect x="0" y="0" width="560" height="265" fill="#F8FAF8" rx="8"/>' +
          '<text x="280" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#131A22">' +
            (es ? "RECÁMARA (NO) — B1–B5 (Sp 13 20A AFCI) + LUZ/HUMO-CO 14/3 (Sp 17) + ENT" : "BEDROOM (NW) — B1–B5 (Sp 13 20A AFCI) + LIGHT/SMOKE-CO 14/3 (Sp 17) + ENT") +
          '</text>' +
          '<rect x="46" y="34" width="468" height="200" fill="#FCFDFE" stroke="#131A22" stroke-width="2"/>' +
          // Ceiling light + Smoke/CO 14/3
          '<rect x="176" y="36" width="90" height="16" rx="3" fill="#E6F0F8" stroke="#184E77" stroke-width="1.6"/>' +
          '<text x="221" y="47" text-anchor="middle" font-size="7" font-weight="800" fill="#184E77">Ceiling Light (Sp 17)</text>' +
          '<rect x="306" y="36" width="108" height="16" rx="3" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.6"/>' +
          '<text x="360" y="47" text-anchor="middle" font-size="7" font-weight="800" fill="#B91C1C">Smoke/CO 14/3 Red</text>' +
          // B1-B5 outlets @ 18" AFF
          '<line x1="90" y1="34" x2="90" y2="206" stroke="#B45309" stroke-width="2" stroke-dasharray="5,3"/>' +
          '<line x1="90" y1="206" x2="466" y2="206" stroke="#B45309" stroke-width="2"/>' +
          [90, 184, 278, 372, 466].map(function (cx, i) {
            return '<circle cx="' + cx + '" cy="206" r="9" fill="#FEF3C7" stroke="#B45309" stroke-width="1.8"/>' +
              '<text x="' + cx + '" y="208.5" text-anchor="middle" font-size="6.8" font-weight="800" fill="#92400E">B' + (i + 1) + '</text>';
          }).join("") +
          // ENT Low voltage chase >= 6" away
          '<line x1="494" y1="34" x2="494" y2="176" stroke="#0D9488" stroke-width="2.2" stroke-dasharray="4,3"/>' +
          '<rect x="478" y="176" width="30" height="14" rx="2" fill="#CCFBF1" stroke="#0D9488" stroke-width="1.4"/>' +
          '<text x="493" y="185.5" text-anchor="middle" font-size="6.4" font-weight="800" fill="#0F766E">ENT</text>' +
          '<text x="46" y="252" font-size="7.4" font-weight="700" fill="#4A5568">' +
            (es ? "NEC 210.52(A): máximo 12 pies entre contactos · ENT separado >= 6\" de potencia (en pausa 6hvRcQ7Gmh3fG5m7)." : "NEC 210.52(A): <= 12 ft receptacle spacing · Keep ENT >= 6\" from power (hold 6hvRcQ7Gmh3fG5m7).") +
          '</text>' +
        '</svg>' +
      '</div>';
    }
    // living & hall
    return '<div class="u4h-svg-card">' +
      '<svg viewBox="0 0 560 265" width="100%" role="img" aria-label="' + esc(es ? "Elevación Sala y Pasillo" : "Living Room & Hallway Electrical Elevation") + '">' +
        '<rect x="0" y="0" width="560" height="265" fill="#F8FAF8" rx="8"/>' +
        '<text x="280" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#131A22">' +
          (es ? "SALA Y PASILLO — L1–L6 + H1 (Sp 11 20A) + PUERTA 4 ÁTICO (Sp 20) + HUMO-CO (Sp 17)" : "LIVING &amp; HALLWAY — L1–L6 + H1 (Sp 11 20A) + DOOR 4 HATCH (Sp 20) + SMOKE/CO (Sp 17)") +
        '</text>' +
        '<rect x="46" y="34" width="468" height="200" fill="#FCFDFE" stroke="#131A22" stroke-width="2"/>' +
        // Door 4 Hatch overhead + Switch Option A vs B
        '<rect x="356" y="34" width="96" height="14" fill="#DCFCE7" stroke="#15803D" stroke-width="1.8"/>' +
        '<text x="404" y="44" text-anchor="middle" font-size="6.8" font-weight="800" fill="#166534">DOOR 4 HATCH (Opt B Rim)</text>' +
        '<line x1="340" y1="34" x2="340" y2="146" stroke="#15803D" stroke-width="2" stroke-dasharray="4,3"/>' +
        '<rect x="326" y="146" width="28" height="16" rx="3" fill="#DCFCE7" stroke="#15803D" stroke-width="1.8"/>' +
        '<text x="340" y="157" text-anchor="middle" font-size="6.4" font-weight="800" fill="#166534">Opt A</text>' +
        '<text x="360" y="157" font-size="6.8" font-weight="700" fill="#166534">' + (es ? "Apagador Ático ~48\" (MC/EMT si área común R-2)" : "Attic Switch ~48\" (MC/EMT if R-2 common area)") + '</text>' +
        // L1-L6 + H1 @ 18" AFF
        '<line x1="84" y1="34" x2="84" y2="206" stroke="#B45309" stroke-width="2" stroke-dasharray="5,3"/>' +
        '<line x1="84" y1="206" x2="480" y2="206" stroke="#B45309" stroke-width="2"/>' +
        [["L1",84],["L2",150],["L3",216],["L4",282],["L5",348],["L6",414],["H1",480]].map(function (pt) {
          return '<circle cx="' + pt[1] + '" cy="206" r="9" fill="#FEF3C7" stroke="#B45309" stroke-width="1.8"/>' +
            '<text x="' + pt[1] + '" y="208.5" text-anchor="middle" font-size="6.5" font-weight="800" fill="#92400E">' + pt[0] + '</text>';
        }).join("") +
        '<text x="46" y="252" font-size="7.4" font-weight="700" fill="#4A5568">' +
          (es ? "Sp 11 (20A AFCI) · Sp 17 (14/3 Humo/CO pasillo y sala) · Verificar candado ENT 6hvRcQ7Gmh3fG5m7 antes de cablear." : "Sp 11 (20A AFCI) · Sp 17 (14/3 Smoke/CO hall &amp; living) · Verify ENT hold 6hvRcQ7Gmh3fG5m7 before pulling.") +
        '</text>' +
      '</svg>' +
    '</div>';
  }

  function render3dWireMockupSvg(es, camView, explodeAttic, grpFilter, swOpt) {
    // True 3D Axonometric / Isometric Whole-Unit Wire Routing Mockup
    // Unit 4 Envelope: X = 0..508" (W->E), Y = 0..298" (N->S), Z = 0..187.5" (Floor=0, Ceiling/Joists=121.5, Flat Roof=187.5)
    var lift = explodeAttic ? 54 : 0;
    var zCeil = 121.5 + lift;
    var zRoof = 187.5 + lift;

    // 4 camera orientations around Unit 4
    var cosA = 0.866, sinA = 0.5;
    var s = 0.72;
    function proj(x, y, z) {
      var rx = x, ry = y;
      if (camView === "se") { rx = 508 - x; ry = y; }
      else if (camView === "nw") { rx = x; ry = 298 - y; }
      else if (camView === "ne") { rx = 508 - x; ry = 298 - y; }
      var sx = 305 + (rx - ry) * cosA * s * 0.62 - 64;
      var sy = 258 + (rx + ry) * sinA * s * 0.44 - z * s * 0.82;
      return [sx, sy];
    }
    function ptStr(p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }
    function poly3(pts) { return pts.map(function (p) { return ptStr(proj(p[0], p[1], p[2])); }).join(" "); }
    function line3(a, b, stroke, w, dash, op) {
      var p1 = proj(a[0], a[1], a[2]), p2 = proj(b[0], b[1], b[2]);
      return '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" stroke="' + stroke + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + (op ? ' opacity="' + op + '"' : "") + '/>';
    }
    function path3(pts, stroke, w, dash, op) {
      return '<polyline points="' + poly3(pts) + '" fill="none" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + (op ? ' opacity="' + op + '"' : "") + '/>';
    }
    function wall3(x1, y1, x2, y2, z0, z1, fill, stroke, op) {
      return '<polygon points="' + poly3([[x1,y1,z0],[x2,y2,z0],[x2,y2,z1],[x1,y1,z1]]) + '" fill="' + fill + '" fill-opacity="' + op + '" stroke="' + stroke + '" stroke-width="0.9"/>';
    }
    function label3(x, y, z, txt, color, size) {
      var p = proj(x, y, z);
      return '<text x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" text-anchor="middle" font-size="' + (size || 7.2) + '" font-weight="800" fill="' + (color || "#131A22") + '">' + txt + '</text>';
    }
    function dot3(x, y, z, r, fill, stroke) {
      var p = proj(x, y, z);
      return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.3"/>';
    }

    var all = (grpFilter === "all");
    var opKit = (all || grpFilter === "kitchen") ? "1" : "0.14";
    var opAtt = (all || grpFilter === "attic") ? "1" : "0.14";
    var opBth = (all || grpFilter === "bath") ? "1" : "0.14";
    var opLiv = (all || grpFilter === "living") ? "1" : "0.14";

    var svg = [];
    svg.push('<svg viewBox="0 0 640 430" width="100%" role="img" aria-label="' + esc(es ? "Modelo 3D Completo de Cableado Unidad 4" : "Unit 4 Full 3D Whole-Unit Wire Routing Mockup") + '">');
    svg.push('<rect x="0" y="0" width="640" height="430" fill="#F4F6F5" rx="8"/>');

    // 1. Floor slab (Z = 0)
    svg.push('<polygon points="' + poly3([[0,0,0],[508,0,0],[508,298,0],[0,298,0]]) + '" fill="#FFFFFF" stroke="#64748B" stroke-width="1.4"/>');
    // Subtle room zones on floor
    svg.push('<polygon points="' + poly3([[210,160,0],[356,160,0],[356,286,0],[210,286,0]]) + '" fill="#FEF9C3" fill-opacity="0.32" stroke="#CBD5E1" stroke-width="0.8"/>'); // Kitchen
    svg.push('<polygon points="' + poly3([[356,160,0],[508,160,0],[508,298,0],[356,298,0]]) + '" fill="#E0F2FE" fill-opacity="0.28" stroke="#CBD5E1" stroke-width="0.8"/>'); // Dining
    svg.push('<polygon points="' + poly3([[180,0,0],[288,0,0],[288,124,0],[180,124,0]]) + '" fill="#F3E8FF" fill-opacity="0.30" stroke="#CBD5E1" stroke-width="0.8"/>'); // Bathroom
    svg.push('<polygon points="' + poly3([[288,0,0],[356,0,0],[356,80,0],[288,80,0]]) + '" fill="#FFEDD5" fill-opacity="0.35" stroke="#CBD5E1" stroke-width="0.8"/>'); // Laundry
    svg.push('<polygon points="' + poly3([[0,0,0],[180,0,0],[180,160,0],[0,160,0]]) + '" fill="#ECFDF5" fill-opacity="0.28" stroke="#CBD5E1" stroke-width="0.8"/>'); // Bedroom
    svg.push('<polygon points="' + poly3([[0,160,0],[210,160,0],[210,298,0],[0,298,0]]) + '" fill="#F1F5F9" fill-opacity="0.45" stroke="#CBD5E1" stroke-width="0.8"/>'); // Living

    // 2. All Room Walls (Z = 0 -> 121.5) — Including ALL previously missing walls!
    var Z1 = 121.5;
    // Outer shell
    svg.push(wall3(0,0,508,0,0,Z1,"#E2E8F0","#94A3B8","0.22"));       // North exterior
    svg.push(wall3(0,0,0,298,0,Z1,"#E2E8F0","#94A3B8","0.18"));       // West exterior
    svg.push(wall3(508,0,508,298,0,Z1,"#E2E8F0","#94A3B8","0.16"));   // East exterior
    svg.push(wall3(0,298,508,298,0,Z1,"#E2E8F0","#94A3B8","0.12"));   // South exterior
    // Interior partitions (Kitchen 4 walls, Dining/D04 wall, Bath, Laundry, Bedroom, Hall)
    svg.push(wall3(356,160,356,286,0,Z1,"#FDE68A","#B45309","0.22")); // Kitchen East / D04 Wall
    svg.push(wall3(210,286,356,286,0,Z1,"#FEF3C7","#B45309","0.20")); // Kitchen South Wall
    svg.push(wall3(210,160,210,286,0,Z1,"#FEF3C7","#B45309","0.20")); // Kitchen West Wall
    svg.push(wall3(210,160,326,160,0,Z1,"#FEF3C7","#B45309","0.24")); // Kitchen North Entry Wall (previously missing!)
    svg.push(wall3(180,0,180,160,0,Z1,"#E9D5FF","#7C3AED","0.18"));   // Bedroom / Bath Wall
    svg.push(wall3(288,0,288,124,0,Z1,"#E9D5FF","#7C3AED","0.18"));   // Bath / Laundry Wall
    svg.push(wall3(180,124,356,124,0,Z1,"#E2E8F0","#64748B","0.18")); // Hallway North Wall
    svg.push(wall3(0,160,210,160,0,Z1,"#E2E8F0","#64748B","0.16"));   // Bedroom / Living Wall

    // 3. Subpanel D04 on Wall D04 (X=356, Y=266, Z=53..77) + 80A Feeder from floor
    svg.push(wall3(356,258,356,274,53,77,"#334155","#0F172A","0.92"));
    svg.push(path3([[356,266,0],[356,266,53]], "#0F172A", 3.4, "", "1")); // 80A #4 Cu Feeder
    svg.push(label3(374,266,65,"D04","#0F172A",7.8));

    // 4. Attic Joist Plane (Z = zCeil) + Flat-Roof Deck Outline (Z = zRoof)
    svg.push('<polygon points="' + poly3([[0,0,zCeil],[508,0,zCeil],[508,298,zCeil],[0,298,zCeil]]) + '" fill="#E0F2FE" fill-opacity="0.16" stroke="#64748B" stroke-width="1.1" stroke-dasharray="5,3"/>');
    // Subtle flat-roof outline 66" above joists
    svg.push('<polygon points="' + poly3([[0,0,zRoof],[508,0,zRoof],[508,298,zRoof],[0,298,zRoof]]) + '" fill="none" stroke="#94A3B8" stroke-width="0.8" stroke-dasharray="2,4"/>');
    // 24" OSB Walkway + 30x30 Platform + F1 Furnace + Door 4 Hatch
    svg.push('<polygon points="' + poly3([[100,62,zCeil],[124,62,zCeil],[124,98,zCeil],[100,98,zCeil]]) + '" fill="#DCFCE7" stroke="#15803D" stroke-width="1.6"/>'); // Door 4 Hatch
    svg.push('<polygon points="' + poly3([[124,62,zCeil],[186,62,zCeil],[186,86,zCeil],[124,86,zCeil]]) + '" fill="#E5E7EB" fill-opacity="0.7" stroke="#6B7280" stroke-width="1"/>'); // OSB leg 1
    svg.push('<polygon points="' + poly3([[162,86,zCeil],[186,86,zCeil],[186,214,zCeil],[162,214,zCeil]]) + '" fill="#E5E7EB" fill-opacity="0.7" stroke="#6B7280" stroke-width="1"/>'); // OSB leg 2
    svg.push('<polygon points="' + poly3([[159,214,zCeil],[189,214,zCeil],[189,244,zCeil],[159,244,zCeil]]) + '" fill="#D1D5DB" stroke="#4B5563" stroke-width="1.2"/>'); // 30x30 platform
    svg.push(wall3(162,248,186,248,zCeil,zCeil+22,"#BBF7D0","#15803D","0.85")); // F1 Furnace front
    svg.push(label3(174,258,zCeil+30,"F1 HVAC","#166534",7.2));

    // Exploded vertical riser guide line if exploded
    if (explodeAttic) {
      svg.push(line3([356,266,Z1],[356,266,zCeil],"#94A3B8",1.2,"3,3","0.8"));
      svg.push(line3([112,74,Z1],[112,74,zCeil],"#15803D",1.1,"3,3","0.7"));
    }

    // 5. KITCHEN CIRCUITS (Spaces 1–9) — In-Wall Bore Bands + Attic Drops
    // Sp 1 SA-A (East 50" band -> E1@10", E2@45") & Sp 4 REF (East 52.5" band -> REF-1@68")
    svg.push(path3([[356,266,77],[356,266,50],[356,276,50],[356,241,50]], "#D97706", 2.2, "", opKit)); // SA-A
    svg.push(path3([[356,266,77],[356,266,52.5],[356,218,52.5]], "#D97706", 2.0, "4,2", opKit)); // REF
    // Sp 2 SA-B (South 30" band -> S1@24", S2@62") & Sp 5/6 DW-GD (South 24"/26" -> 76")
    svg.push(path3([[356,266,77],[356,286,30],[332,286,30],[294,286,30]], "#D97706", 2.2, "", opKit)); // SA-B
    svg.push(path3([[356,266,77],[356,286,24],[280,286,24]], "#2563EB", 2.0, "", opKit)); // DW + GD
    // Sp 3 SA-C, Sp 7 RG, Sp 8 HD (Up D04 -> Attic Joist Side -> Drop West Range Wall)
    svg.push(path3([[356,266,77],[356,266,zCeil],[210,266,zCeil],[210,248,zCeil],[210,248,44],[210,210,44]], "#D97706", 2.2, "", opKit)); // SA-C W1/W2
    svg.push(path3([[356,266,77],[356,266,zCeil],[210,266,zCeil],[210,228,zCeil],[210,228,84],[210,228,6]], "#2563EB", 2.0, "", opKit)); // HD-1 & RG-1
    // Sp 9 LT (Kitchen Ceiling + South T3 Pendants + North Wall SW-ENTRY drop!)
    svg.push(path3([[356,266,77],[356,266,zCeil],[283,220,zCeil],[283,160,zCeil],[283,160,48]], "#2563EB", 1.9, "", opKit)); // LT -> SW-ENTRY
    svg.push(path3([[283,220,zCeil],[269,282,zCeil]], "#2563EB", 1.7, "3,2", opKit)); // T3 pendants

    // 6. ATTIC & HVAC CIRCUITS (Spaces 10 & 20)
    // Sp 10 HVAC -> F1 Furnace
    svg.push(path3([[356,266,77],[356,266,zCeil],[198,266,zCeil],[198,258,zCeil],[174,258,zCeil+12]], "#15803D", 2.4, "", opAtt));
    // Sp 20 ATTIC -> Switch Opt A (landing wall Z=48) OR Opt B (hatch rim Z=zCeil+2) -> 2 LEDs on rafter blocking (Z=zRoof-4) + always-live GFCI at platform
    if (swOpt === "optA") {
      svg.push(path3([[356,266,77],[356,266,zCeil],[198,100,zCeil],[98,100,zCeil],[98,64,zCeil],[98,64,48]], "#16A34A", 2.2, "", opAtt));
      svg.push(dot3(98,64,48,3.6,"#DCFCE7","#15803D"));
      svg.push(path3([[98,64,48],[98,64,zCeil],[140,74,zRoof-4],[174,200,zRoof-4]], "#16A34A", 2.0, "4,2", opAtt));
    } else {
      svg.push(path3([[356,266,77],[356,266,zCeil],[198,100,zCeil],[112,100,zCeil],[112,88,zCeil+4]], "#16A34A", 2.2, "", opAtt));
      svg.push(dot3(112,88,zCeil+4,3.6,"#DCFCE7","#15803D"));
      svg.push(path3([[112,88,zCeil+4],[140,74,zRoof-4],[174,200,zRoof-4]], "#16A34A", 2.0, "4,2", opAtt));
    }
    // Always-live GFCI branch at platform (unswitched hot from Sp 20)
    svg.push(path3([[198,100,zCeil],[198,228,zCeil],[174,228,zCeil+12]], "#15803D", 2.0, "2,2", opAtt));
    svg.push(dot3(140,74,zRoof-4,3.6,"#FEF08A","#CA8A04")); // LED 1
    svg.push(dot3(174,200,zRoof-4,3.6,"#FEF08A","#CA8A04")); // LED 2

    // 7. BATHROOM & LAUNDRY CIRCUITS (Spaces 14, 15, 16, 18, Opt 19)
    // Sp 14 BATH-R (V1 & T1) + Opt Sp 19
    svg.push(path3([[356,266,77],[356,266,zCeil],[340,124,zCeil],[234,124,zCeil],[234,40,zCeil],[234,40,42]], "#9333EA", 2.2, "", opBth)); // V1
    svg.push(path3([[234,40,zCeil],[270,40,zCeil],[270,40,14]], "#9333EA", 1.8, "3,2", opBth)); // T1 Bidet
    // Sp 15 BATH-L (Ceiling + Fan)
    svg.push(path3([[340,124,zCeil],[234,74,zCeil]], "#2563EB", 1.9, "", opBth));
    // Sp 16 LAUN-W (20A) & Sp 18 LAUN-D (15A) -> Laundry Closet 2-Gang @ 42" AFF
    svg.push(path3([[356,266,77],[356,266,zCeil],[340,44,zCeil],[320,44,zCeil],[320,44,42]], "#D97706", 2.2, "", opBth));

    // 8. LIVING, DINING, BEDROOM & SMOKE/CO INTERCONNECT (Spaces 11, 12, 13, 17 + ENT)
    // Sp 12 DIN (D1-D4 in Dining walls @ 18" AFF)
    svg.push(path3([[356,266,77],[356,266,zCeil],[450,266,zCeil],[450,266,18],[496,200,18]], "#D97706", 2.0, "", opLiv));
    // Sp 11 LIV (L1-L6 + H1)
    svg.push(path3([[356,266,77],[356,266,zCeil],[110,266,zCeil],[40,266,zCeil],[40,266,18],[40,180,18]], "#D97706", 2.0, "", opLiv));
    // Sp 13 BED (B1-B5)
    svg.push(path3([[356,266,77],[356,266,zCeil],[204,136,zCeil],[80,136,zCeil],[80,40,zCeil],[80,40,18],[20,40,18]], "#D97706", 2.0, "", opLiv));
    // Sp 17 LTG + 14/3 Red Hardwired Interconnected Smoke/CO loop across ceilings
    svg.push(path3([[356,266,zCeil],[420,220,zCeil],[220,142,zCeil],[90,80,zCeil],[90,230,zCeil]], "#DC2626", 2.0, "6,3", opLiv));
    svg.push(dot3(220,142,zCeil,3.3,"#FEE2E2","#DC2626")); // Hall Smoke/CO
    svg.push(dot3(90,80,zCeil,3.3,"#FEE2E2","#DC2626"));   // Bedroom Smoke/CO
    svg.push(dot3(90,230,zCeil,3.3,"#FEE2E2","#DC2626"));  // Living Smoke/CO
    // ENT Low-voltage Smurf tube (>= 6" separation, 90 deg crossings)
    svg.push(path3([[150,150,zCeil],[40,150,zCeil],[40,150,18]], "#0D9488", 1.8, "3,3", opLiv));

    // Room floor labels
    svg.push(label3(282,226,4, es ? "COCINA" : "KITCHEN", "#92400E", 8));
    svg.push(label3(435,232,4, es ? "COMEDOR" : "DINING", "#0369A1", 8));
    svg.push(label3(234,62,4, es ? "BAÑO" : "BATH", "#6B21A8", 7.6));
    svg.push(label3(322,38,4, es ? "LAV." : "LAUN", "#9A3412", 7.2));
    svg.push(label3(88,82,4, es ? "RECÁMARA" : "BEDROOM", "#047857", 8));
    svg.push(label3(98,232,4, es ? "SALA" : "LIVING", "#334155", 8));

    // Legend bar at bottom
    svg.push('<rect x="14" y="388" width="612" height="32" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>');
    var leg = [
      ["#0F172A", "80A #4 Cu", 26],
      ["#D97706", "12/2 20A", 112],
      ["#2563EB", "14/2 15A", 192],
      ["#15803D", "Attic/HVAC", 272],
      ["#9333EA", "Bath/Bidet", 364],
      ["#DC2626", "14/3 Smoke/CO", 456],
      ["#0D9488", "ENT LV >=6\"", 554]
    ];
    leg.forEach(function (it) {
      svg.push('<line x1="' + it[2] + '" y1="404" x2="' + (it[2] + 14) + '" y2="404" stroke="' + it[0] + '" stroke-width="3"/>');
      svg.push('<text x="' + (it[2] + 18) + '" y="407" font-size="7.2" font-weight="700" fill="#1E293B">' + it[1] + '</text>');
    });
    svg.push('</svg>');
    return svg.join("");
  }

  function renderAtticCeilingMapSvg(es, grpFilter, swOpt) {
    // True-scale 1:1 Unit 4 Whole-Unit Attic & Ceiling Romex Map (X: 0..508", Y: 0..298", N up)
    var S = 1.04;
    var ox = 34, oy = 32;
    function px(x) { return (ox + x * S).toFixed(1); }
    function py(y) { return (oy + y * S).toFixed(1); }
    function sw(w) { return (w * S).toFixed(1); }

    var showAll = (grpFilter === "all");
    var opKit = (showAll || grpFilter === "kitchen") ? "1" : "0.18";
    var opHvac = (showAll || grpFilter === "attic") ? "1" : "0.18";
    var opBath = (showAll || grpFilter === "bath") ? "1" : "0.18";
    var opEnt = (showAll || grpFilter === "ent") ? "1" : "0.18";

    var swX = swOpt === "optA" ? 96 : 112;
    var swY = swOpt === "optA" ? 64 : 88;
    var swLbl = swOpt === "optA"
      ? (es ? "Apagador Op. A (Muro 48\")" : "Switch Opt A (Landing Wall)")
      : (es ? "Apagador Op. B (Marco 2x)" : "Switch Opt B (Hatch Rim)");

    return '<svg viewBox="0 0 600 378" width="100%" role="img" aria-label="' + esc(es ? "Mapa 1:1 de Rutas de Cable Romex en Ático y Techo" : "True-Scale 1:1 Whole-Unit Attic & Ceiling Romex Map") + '">' +
      '<rect x="0" y="0" width="600" height="378" fill="#F6F8F7" rx="8"/>' +
      '<text x="300" y="19" text-anchor="middle" font-size="11" font-weight="800" fill="#131A22">' +
        (es ? "MAPA 1:1 DE RUTAS EN ÁTICO Y TECHO (508\" × 298\" · NORTE ARRIBA)" : "TRUE-SCALE 1:1 ATTIC &amp; CEILING ROMEX MAP (508\" × 298\" · NORTH UP)") +
      '</text>' +
      // Unit 4 outer boundary
      '<rect x="' + px(0) + '" y="' + py(0) + '" width="' + sw(508) + '" height="' + sw(298) + '" fill="#FFFFFF" stroke="#131A22" stroke-width="2"/>' +
      // Rooms (dashed interior walls below ceiling)
      '<rect x="' + px(0) + '" y="' + py(0) + '" width="' + sw(180) + '" height="' + sw(160) + '" fill="#F0FDF4" fill-opacity="0.45" stroke="#94A3B8" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<text x="' + px(90) + '" y="' + py(142) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#475569">' + (es ? "RECÁMARA (Sp 13)" : "BEDROOM (Sp 13)") + '</text>' +
      '<rect x="' + px(180) + '" y="' + py(0) + '" width="' + sw(108) + '" height="' + sw(124) + '" fill="#FAF5FF" fill-opacity="0.5" stroke="#94A3B8" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<text x="' + px(234) + '" y="' + py(22) + '" text-anchor="middle" font-size="7.5" font-weight="700" fill="#6B21A8">' + (es ? "BAÑO (Sp 14/15)" : "BATH (Sp 14/15)") + '</text>' +
      '<rect x="' + px(288) + '" y="' + py(0) + '" width="' + sw(68) + '" height="' + sw(80) + '" fill="#FFF7ED" fill-opacity="0.55" stroke="#94A3B8" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<text x="' + px(322) + '" y="' + py(22) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#9A3412">' + (es ? "LAV. (16/18)" : "LAUN (16/18)") + '</text>' +
      '<rect x="' + px(0) + '" y="' + py(160) + '" width="' + sw(210) + '" height="' + sw(138) + '" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<text x="' + px(72) + '" y="' + py(282) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#475569">' + (es ? "SALA (Sp 11)" : "LIVING (Sp 11)") + '</text>' +
      '<rect x="' + px(210) + '" y="' + py(160) + '" width="' + sw(146) + '" height="' + sw(126) + '" fill="#FEFCE8" fill-opacity="0.6" stroke="#B45309" stroke-width="1.2" stroke-dasharray="4,3"/>' +
      '<text x="' + px(283) + '" y="' + py(280) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#92400E">' + (es ? "COCINA (Sp 1–9)" : "KITCHEN (Sp 1–9)") + '</text>' +
      '<rect x="' + px(356) + '" y="' + py(160) + '" width="' + sw(152) + '" height="' + sw(138) + '" fill="#F0F9FF" fill-opacity="0.5" stroke="#94A3B8" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<text x="' + px(432) + '" y="' + py(282) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#0369A1">' + (es ? "COMEDOR (Sp 12)" : "DINING (Sp 12)") + '</text>' +
      // 6 ft Guard-Strip Zone around Door 4 Hatch (NEC 320.23(A))
      '<circle cx="' + px(112) + '" cy="' + py(74) + '" r="' + sw(72) + '" fill="#FEF3C7" fill-opacity="0.32" stroke="#D97706" stroke-width="1.2" stroke-dasharray="5,3"/>' +
      '<text x="' + px(112) + '" y="' + py(14) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#B45309">NEC 320.23(A): 6 ft Guard-Strip Zone</text>' +
      // 24" OSB Walkway + 30x30 Platform + F1 Furnace + Door 4 Hatch
      '<rect x="' + px(124) + '" y="' + py(62) + '" width="' + sw(62) + '" height="' + sw(24) + '" fill="#E5E7EB" stroke="#6B7280" stroke-width="1"/>' +
      '<rect x="' + px(162) + '" y="' + py(86) + '" width="' + sw(24) + '" height="' + sw(128) + '" fill="#E5E7EB" stroke="#6B7280" stroke-width="1"/>' +
      '<rect x="' + px(159) + '" y="' + py(214) + '" width="' + sw(30) + '" height="' + sw(30) + '" fill="#D1D5DB" stroke="#374151" stroke-width="1.4"/>' +
      '<rect x="' + px(160) + '" y="' + py(246) + '" width="' + sw(28) + '" height="' + sw(22) + '" rx="3" fill="#BBF7D0" stroke="#15803D" stroke-width="1.6"/>' +
      '<text x="' + px(174) + '" y="' + py(260) + '" text-anchor="middle" font-size="7.2" font-weight="800" fill="#166534">F1</text>' +
      '<rect x="' + px(100) + '" y="' + py(56) + '" width="' + sw(24) + '" height="' + sw(36) + '" fill="#DCFCE7" stroke="#15803D" stroke-width="1.8"/>' +
      '<text x="' + px(112) + '" y="' + py(76) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#166534">D4</text>' +
      // D04 Subpanel Riser
      '<rect x="' + px(350) + '" y="' + py(254) + '" width="' + sw(12) + '" height="' + sw(24) + '" fill="#1E293B" stroke="#0F172A" stroke-width="1.5"/>' +
      '<text x="' + px(368) + '" y="' + py(269) + '" font-size="8" font-weight="900" fill="#0F172A">D04 Riser</text>' +
      // Kitchen Attic Homeruns (Sp 3, 7, 8, 9)
      '<polyline points="' + px(356) + ',' + py(266) + ' ' + px(210) + ',' + py(266) + ' ' + px(210) + ',' + py(215) + '" fill="none" stroke="#D97706" stroke-width="2.6" opacity="' + opKit + '"/>' +
      '<polyline points="' + px(356) + ',' + py(266) + ' ' + px(283) + ',' + py(266) + ' ' + px(283) + ',' + py(162) + '" fill="none" stroke="#2563EB" stroke-width="2.2" opacity="' + opKit + '"/>' +
      // Attic & HVAC Trunks (Sp 10 & Sp 20)
      '<polyline points="' + px(356) + ',' + py(266) + ' ' + px(198) + ',' + py(266) + ' ' + px(198) + ',' + py(258) + ' ' + px(188) + ',' + py(258) + '" fill="none" stroke="#15803D" stroke-width="2.6" opacity="' + opHvac + '"/>' +
      '<polyline points="' + px(198) + ',' + py(258) + ' ' + px(198) + ',' + py(96) + ' ' + px(swX) + ',' + py(96) + ' ' + px(swX) + ',' + py(swY) + '" fill="none" stroke="#16A34A" stroke-width="2.2" stroke-dasharray="5,3" opacity="' + opHvac + '"/>' +
      '<circle cx="' + px(swX) + '" cy="' + py(swY) + '" r="5" fill="#DCFCE7" stroke="#15803D" stroke-width="1.8" opacity="' + opHvac + '"/>' +
      '<text x="' + px(swX - 6) + '" y="' + py(swY + 14) + '" text-anchor="end" font-size="6.8" font-weight="800" fill="#166534" opacity="' + opHvac + '">' + swLbl + '</text>' +
      // 2 Enclosed LEDs + Live GFCI
      '<circle cx="' + px(142) + '" cy="' + py(74) + '" r="4.5" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5" opacity="' + opHvac + '"/>' +
      '<circle cx="' + px(174) + '" cy="' + py(202) + '" r="4.5" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5" opacity="' + opHvac + '"/>' +
      '<rect x="' + px(185) + '" y="' + py(222) + '" width="12" height="10" rx="2" fill="#FEF3C7" stroke="#B45309" stroke-width="1.3" opacity="' + opHvac + '"/>' +
      // Bath & Laundry Trunks (Sp 14, 15, 16, 18, Opt 19)
      '<polyline points="' + px(356) + ',' + py(266) + ' ' + px(342) + ',' + py(266) + ' ' + px(342) + ',' + py(48) + ' ' + px(234) + ',' + py(48) + '" fill="none" stroke="#9333EA" stroke-width="2.4" opacity="' + opBath + '"/>' +
      // Living, Bedroom, Smoke/CO 14/3 & ENT
      '<polyline points="' + px(356) + ',' + py(266) + ' ' + px(204) + ',' + py(142) + ' ' + px(84) + ',' + py(142) + ' ' + px(84) + ',' + py(60) + '" fill="none" stroke="#DC2626" stroke-width="2.1" stroke-dasharray="6,3" opacity="' + opEnt + '"/>' +
      '<polyline points="' + px(204) + ',' + py(142) + ' ' + px(84) + ',' + py(220) + '" fill="none" stroke="#DC2626" stroke-width="2.1" stroke-dasharray="6,3" opacity="' + opEnt + '"/>' +
      '<polyline points="' + px(150) + ',' + py(150) + ' ' + px(42) + ',' + py(150) + '" fill="none" stroke="#0D9488" stroke-width="2" stroke-dasharray="3,3" opacity="' + opEnt + '"/>' +
      // Footer note
      '<text x="300" y="362" text-anchor="middle" font-size="7.8" font-weight="700" fill="#334155">' +
        (es ? "Regla NEC 320.23: correr por costado de vigas (>=1-1/4\" del borde) · Proteger con listones dentro de 6 pies de Puerta 4 · Nunca bajo pasillo OSB"
            : "NEC 320.23 Rule: Run along side of joists (>=1-1/4\" from edges) · Guard strips within 6 ft of Door 4 hatch · Never trap under OSB walkway") +
      '</text>' +
    '</svg>';
  }

  function renderAtticWiringGuideSvg(es) {
    return '<svg viewBox="0 0 600 250" width="100%" role="img" aria-label="' + esc(es ? "Sección Transversal de 3 Métodos de Cableado en Ático" : "3-Method Attic Romex Routing Cross-Section") + '">' +
      '<rect x="0" y="0" width="600" height="250" fill="#F8FAF8" rx="8"/>' +
      '<text x="300" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#131A22">' +
        (es ? "3 MÉTODOS PROFESIONALES EN ÁTICO + BLOQUEO LED DE TECHO PLANO" : "3 PRO ATTIC ROUTING METHODS + FLAT-ROOF LED BLOCKING (NEC 314.23 / 320.23)") +
      '</text>' +
      // Panel 1: Side of Joist (BEST)
      '<rect x="16" y="34" width="180" height="198" rx="6" fill="#FFFFFF" stroke="#15803D" stroke-width="1.8"/>' +
      '<text x="106" y="52" text-anchor="middle" font-size="8.8" font-weight="800" fill="#166534">' + (es ? "1. COSTADO DE VIGA (MEJOR)" : "1. SIDE OF JOIST (BEST)") + '</text>' +
      '<rect x="76" y="74" width="24" height="96" fill="#E6CCB2" stroke="#7F5539" stroke-width="1.6"/>' +
      '<circle cx="104" cy="122" r="5.5" fill="#D97706" stroke="#92400E" stroke-width="1.5"/>' +
      '<text x="116" y="120" font-size="7.2" font-weight="800" fill="#92400E">NM-B</text>' +
      '<text x="116" y="131" font-size="6.8" fill="#475569">>= 1-1/4" edges</text>' +
      '<text x="106" y="190" text-anchor="middle" font-size="7.2" font-weight="700" fill="#166534">NEC 320.23(B): No guard strip</text>' +
      '<text x="106" y="204" text-anchor="middle" font-size="6.8" fill="#475569">' + (es ? "Grapa <=12\" caja, c/ 4.5 pies" : "Staple <=12\" box, every <=4.5 ft") + '</text>' +
      // Panel 2: Guard Strips within 6 ft of Hatch
      '<rect x="210" y="34" width="180" height="198" rx="6" fill="#FFFFFF" stroke="#D97706" stroke-width="1.8"/>' +
      '<text x="300" y="52" text-anchor="middle" font-size="8.8" font-weight="800" fill="#92400E">' + (es ? "2. LISTONES GUARD (<=6 PIES)" : "2. GUARD STRIPS (<=6 FT)") + '</text>' +
      '<rect x="234" y="126" width="132" height="44" fill="#E6CCB2" stroke="#7F5539" stroke-width="1.6"/>' +
      '<rect x="266" y="106" width="16" height="20" fill="#DDB892" stroke="#7F5539" stroke-width="1.4"/>' +
      '<rect x="318" y="106" width="16" height="20" fill="#DDB892" stroke="#7F5539" stroke-width="1.4"/>' +
      '<circle cx="300" cy="118" r="6" fill="#D97706" stroke="#92400E" stroke-width="1.5"/>' +
      '<text x="300" y="190" text-anchor="middle" font-size="7.2" font-weight="700" fill="#92400E">NEC 320.23(A): 1x2 / 2x2 rails</text>' +
      '<text x="300" y="204" text-anchor="middle" font-size="6.8" fill="#475569">' + (es ? "Nunca atrapar bajo pasillo OSB" : "Never trap under OSB walkway") + '</text>' +
      // Panel 3: Flat-Roof LED Blocking >= 1-1/2" below deck
      '<rect x="404" y="34" width="180" height="198" rx="6" fill="#FFFFFF" stroke="#184E77" stroke-width="1.8"/>' +
      '<text x="494" y="52" text-anchor="middle" font-size="8.8" font-weight="800" fill="#184E77">' + (es ? "3. BLOQUEO LED TECHO PLANO" : "3. FLAT-ROOF LED BLOCKING") + '</text>' +
      '<rect x="420" y="68" width="148" height="14" fill="#94A3B8" stroke="#334155" stroke-width="1.4"/>' +
      '<text x="494" y="78" text-anchor="middle" font-size="6.8" font-weight="800" fill="#FFFFFF">ROOF DECK — NO SCREWS</text>' +
      '<line x1="494" y1="82" x2="494" y2="104" stroke="#DC2626" stroke-width="1.4" stroke-dasharray="2,2"/>' +
      '<text x="530" y="96" font-size="6.8" font-weight="800" fill="#DC2626">>= 1-1/2"</text>' +
      '<rect x="434" y="104" width="120" height="22" fill="#E6CCB2" stroke="#7F5539" stroke-width="1.5"/>' +
      '<text x="494" y="118" text-anchor="middle" font-size="6.8" font-weight="700" fill="#5C3D2E">2x4 / 2x6 Rafter Blocking</text>' +
      '<rect x="478" y="126" width="32" height="16" rx="2" fill="#E2E8F0" stroke="#334155" stroke-width="1.5"/>' +
      '<ellipse cx="494" cy="148" rx="24" ry="7" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.6"/>' +
      '<text x="494" y="190" text-anchor="middle" font-size="7.2" font-weight="700" fill="#184E77">NEC 314.23 / 300.4(E)</text>' +
      '<text x="494" y="204" text-anchor="middle" font-size="6.8" fill="#475569">' + (es ? "2 LEDs cerrados <=3\" + 4O box" : "2 enclosed LEDs <=3\" on 4O boxes") + '</text>' +
    '</svg>';
  }
  /* U4_KELEC_ATTIC_STEPS_HELPERS_END */

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
        ? "<strong>PAUSA DE INSTALACIÓN ELÉCTRICA:</strong> Confirmar alimentador D04 (80A vs 100A), cortes laterales EN PAUSA y revisión de caja Eaton BRP20L125G en la visita reprogramada con NEXT antes de jalar cable o cerrar tablaroca. El muro Sur muestra el bastidor existente como referencia. Sellar contra lluvia y tapar el nicho anterior, y volver a revisar las cajas en obra."
        : "<strong>ROUGH-IN ON HOLD:</strong> Confirm D04 feeder (80A vs 100A), side-entry hold, and onsite Eaton BRP20L125G inspection during the rescheduled NEXT walkthrough before pulling kitchen wire or closing drywall. The South elevation shows existing framing for reference. Weatherproof and cover the former recess and recheck box locations on site.";
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
                ["east", es ? "Cocina Este (D04)" : "Kitchen East (D04)"],
                ["south", es ? "Cocina Sur (Tarja)" : "Kitchen South (Sink)"],
                ["west", es ? "Cocina Oeste (Estufa)" : "Kitchen West (Range)"],
                ["north", es ? "Cocina Norte (Entrada)" : "Kitchen North (Entry)"],
                ["dining", es ? "Comedor y D04" : "Dining & D04 Face"],
                ["bathroom", es ? "Baño (V1/T1)" : "Bathroom (V1/T1)"],
                ["laundry", es ? "Lavandería" : "Laundry Closet"],
                ["bedroom", es ? "Recámara (NO)" : "Bedroom (NW)"],
                ["living", es ? "Sala y Pasillo" : "Living & Hall"]
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

    } else if (state.step === "wire-3d") {
      titleEn = "3D Whole-Unit Wire Routing Mockup (All 20 Circuits)";
      titleEs = "Modelo 3D Completo de Cableado (Los 20 Circuitos)";
      subEn = "Rotate the 3D view, lift the attic plane, or filter circuit groups to inspect every wall drop and ceiling trunk";
      subEs = "Rota la vista 3D, eleva el plano del ático o filtra circuitos para revisar cada bajada y troncal";
      var camV = state.cam3d || "sw";
      var expA = !!state.explode3d;
      var flt3 = state.atticFilter || "all";
      var sw3 = state.atticSwitchOpt || "optA";

      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Ángulo 3D:" : "3D Camera:") + '</span>' +
            '<div class="u4h-pill-group">' +
              [["sw","SW 3D"],["se","SE 3D"],["nw","NW 3D"],["ne","NE 3D"]].map(function (c) {
                return '<button type="button" class="u4h-pill' + (camV === c[0] ? " is-active" : "") + '" data-cam3d="' + c[0] + '">' + c[1] + '</button>';
              }).join("") +
              '<button type="button" class="u4h-pill' + (expA ? " is-active" : "") + '" data-exp3d="1">' + (es ? (expA ? "Ático Elevado (+54\")" : "Elevar Ático (+54\")") : (expA ? "Attic Exploded (+54\")" : "Explode Attic (+54\")")) + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Circuitos:" : "Circuits:") + '</span>' +
            '<div class="u4h-pill-group">' +
              [
                ["all", es ? "Todos (20)" : "All 20 Spaces"],
                ["kitchen", es ? "Cocina (1–9)" : "Kitchen (1–9)"],
                ["attic", es ? "Ático/HVAC (10,20)" : "Attic/HVAC (10,20)"],
                ["bath", es ? "Baño/Lav (14–16,18–19)" : "Bath/Laun (14–16,18–19)"],
                ["living", es ? "Sala/Rec/Humo (11–13,17)" : "Liv/Bed/Smoke (11–13,17)"]
              ].map(function (f) {
                return '<button type="button" class="u4h-pill' + (flt3 === f[0] ? " is-active" : "") + '" data-attic-flt="' + f[0] + '">' + f[1] + '</button>';
              }).join("") +
            '</div>' +
          '</div>' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Apagador Ático:" : "Attic Switch:") + '</span>' +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (sw3 === "optA" ? " is-active" : "") + '" data-attic-sw="optA">' + (es ? "Opción A: Muro Descanso (48\")" : "Option A: Landing Wall (48\")") + '</button>' +
              '<button type="button" class="u4h-pill' + (sw3 === "optB" ? " is-active" : "") + '" data-attic-sw="optB">' + (es ? "Opción B: Marco Escotilla 2×" : "Option B: Hatch Rim 2×") + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="u4h-svg-card">' + render3dWireMockupSvg(es, camV, expA, flt3, sw3) + '</div>' +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Mejores Prácticas Profesionales Aplicadas en este Modelo 3D" : "Professional Best Practices Applied in This 3D Mockup") + '</div>' +
          '<ul class="u4h-info-list">' +
            '<li><strong>' + (es ? "Subida vertical D04 y sellado cortafuego:" : "Vertical D04 riser chase &amp; firestopping:") + '</strong> ' + (es ? "Todos los circuitos al ático salen por la parte superior de D04 a través de la doble solera sellada con espuma cortafuego (nunca por la espalda)." : "All attic homeruns exit D04 vertically through firestopped double top plates — never through the panel back; side-entry notches stay on hold.") + '</li>' +
            '<li><strong>' + (es ? "Troncales por costado de viga (NEC 320.23):" : "Side-of-joist attic trunks (NEC 320.23):") + '</strong> ' + (es ? "El cable Romex corre paralelo a vigas (>=1-1/4\" del borde) con listones protectores dentro de 6 pies de Puerta 4 y nunca bajo el pasillo OSB." : "NM-B runs along the side of joists (>=1-1/4\" from edges), uses 1×2/2×2 guard strips within 6 ft of Door 4 hatch, and never traps under OSB walkway.") + '</li>' +
            '<li><strong>' + (es ? "Bucle interconectado 14/3 Humo/CO (Sp 17):" : "Hardwired 14/3 Smoke/CO interconnect (Sp 17):") + '</strong> ' + (es ? "Conecta Sala, Pasillo y Recámara en techo con hilo rojo viajero." : "Links Living, Hallway, and Bedroom ceiling alarms via dedicated 14/3 red interconnect conductor.") + '</li>' +
            '<li><strong>' + (es ? "Separación baja tensión ENT (>=6\"):" : "Low-voltage ENT separation (>=6\"):") + '</strong> ' + (es ? "Tubería azul ENT corre separada >=6\" de cables 120V o cruza estrictamente a 90° (en pausa 6hvRcQ7Gmh3fG5m7)." : "Blue ENT Smurf tube maintains >=6\" parallel clearance from 120V NM-B or crosses strictly at 90° (hold 6hvRcQ7Gmh3fG5m7).") + '</li>' +
          '</ul>' +
        '</div>';

    } else if (state.step === "attic-runs") {
      titleEn = "Attic & Ceiling Runs (True-Scale 1:1 Map)";
      titleEs = "Rutas en Ático y Techo (Mapa 1:1)";
      subEn = "Top-down whole-unit ceiling routing from D04 riser to every room, F1 furnace, 2 enclosed LEDs, and platform GFCI";
      subEs = "Rutas en planta desde la subida D04 a cada cuarto, horno F1, 2 luces LED cerradas y contacto GFCI";
      var fltA = state.atticFilter || "all";
      var swA = state.atticSwitchOpt || "optA";

      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Filtrar grupo:" : "Filter group:") + '</span>' +
            '<div class="u4h-pill-group">' +
              [
                ["all", es ? "Todos" : "All Runs"],
                ["kitchen", es ? "Cocina (3,7,8,9)" : "Kitchen (3,7,8,9)"],
                ["attic", es ? "Ático/HVAC (10,20)" : "Attic/HVAC (10,20)"],
                ["bath", es ? "Baño/Lav (14–18)" : "Bath/Laun (14–18)"],
                ["ent", es ? "Humo/CO y ENT" : "Smoke/CO & ENT"]
              ].map(function (f) {
                return '<button type="button" class="u4h-pill' + (fltA === f[0] ? " is-active" : "") + '" data-attic-flt="' + f[0] + '">' + f[1] + '</button>';
              }).join("") +
            '</div>' +
          '</div>' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Apagador Ático:" : "Attic Switch:") + '</span>' +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (swA === "optA" ? " is-active" : "") + '" data-attic-sw="optA">' + (es ? "Opción A: Muro Descanso" : "Option A: Landing Wall") + '</button>' +
              '<button type="button" class="u4h-pill' + (swA === "optB" ? " is-active" : "") + '" data-attic-sw="optB">' + (es ? "Opción B: Marco Escotilla" : "Option B: Hatch Rim") + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="u4h-svg-card">' + renderAtticCeilingMapSvg(es, fltA, swA) + '</div>';

    } else if (state.step === "attic-guide") {
      titleEn = "Attic Wiring & Flat-Roof Mounting Guide";
      titleEs = "Guía de Cableado en Ático y Montaje en Techo Plano";
      subEn = "NEC 320.23, 334.30, 314.23 & 2025 SFEC R-2 field rules for Romex, enclosed LEDs, and accessible junction boxes";
      subEs = "Reglas NEC 320.23, 334.30, 314.23 y SFEC 2025 R-2 para Romex, luces LED cerradas y cajas de registro";

      inner =
        '<div class="u4h-svg-card">' + renderAtticWiringGuideSvg(es) + '</div>' +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Reglas Clave en Obra (2025 CEC / NEC / SFEC)" : "Field Execution Rules (2025 CEC / NEC / SFEC)") + '</div>' +
          '<ul class="u4h-info-list">' +
            '<li><strong>' + (es ? "Grapado y radios (NEC 334.30 / 334.24):" : "Stapling &amp; bend radius (NEC 334.30 / 334.24):") + '</strong> ' + (es ? "Engrapar <=12\" de cajas metálicas (8\" en plásticas sin abrazadera) y cada <=4.5 pies. Radio de curvatura >=5× diámetro." : "Staple within 12\" of boxes (8\" for clamp-less 1-gang plastic) and every <=4.5 ft; bend radius >=5× cable diameter.") + '</li>' +
            '<li><strong>' + (es ? "Cajas accesibles y zonas secas (NEC 300.15 / 334.12):" : "Accessible J-boxes &amp; dry zones (NEC 300.15 / 334.12):") + '</strong> ' + (es ? "Todas las cajas de empalme deben quedar visibles arriba del aislamiento con tapa. Mantener Romex fuera de zonas de gotera en techo plano." : "All splices must sit in covered, accessible boxes above insulation; keep NM-B clear of the flat-roof leak zone.") + '</li>' +
            '<li><strong>' + (es ? "Verificación SFEC 334.12(A)(12) Área Común R-2:" : "SFEC 334.12(A)(12) Group R-2 Common-Area Check:") + '</strong> ' + (es ? "Si el muro del descanso fuera de Puerta 4 es área común R-2, usar cable blindado MC o tubería EMT para la bajada del apagador Opción A." : "If the landing wall outside Door 4 is classified as an R-2 common area, run MC cable or EMT (not NM-B) for Switch Option A.") + '</li>' +
          '</ul>' +
        '</div>';
    } else {
      titleEn = "Electrical Pre-Rough-In Holds & Supplies";
      titleEs = "Candados Previos al Cableado y Suministros";
      subEn = "Confirm every safety gate before pulling kitchen cable or closing walls";
      subEs = "Confirma cada punto antes de jalar cable en cocina o cerrar muros";

      var holds = [
        { k: "h1", en: "1. D04 Backside (East 13\"–27-1/2\" from SE, 53\"–77\" H): ZERO screws, ZERO boxes, side-entry ON HOLD", es: "1. Respaldo D04 (Este 13\"–27-1/2\" desde SE, 53\"–77\" alto): CERO tornillos, CERO cajas, cortes laterales EN PAUSA" },
        { k: "h2", en: "2. Rescheduled NEXT walkthrough: confirm 80A/#4 Cu vs 100A/#3 Cu feeder & inspect Eaton BRP20L125G onsite", es: "2. Visita reprogramada con NEXT: confirmar alimentador 80A/#4 vs 100A/#3 y revisar caja Eaton BRP20L125G en obra" },
        { k: "h3", en: "3. DW-GD 2-gang goes INSIDE 30\" sink base (@ 76\", 14\" H) with separate neutrals — NEVER behind dishwasher", es: "3. Caja doble DW-GD va DENTRO del gabinete de tarja (@ 79\", 14\" alto) con neutros separados — NUNCA atrás del lavavajillas" },
        { k: "h4", en: "4. HD-1 hood is flush 1-gang 2\"×3\" (~83\"–86\" AFF, flush) — replaces retired 4×4 @ 100\"/104\"", es: "4. Campana HD-1 usa caja sencilla 2\"×3\" (~83\"–86\" piso, al ras) — reemplaza caja 4×4 a 100\"/104\"" }
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
    host.querySelectorAll("[data-cam3d]").forEach(function (b) {
      b.addEventListener("click", function () { state.cam3d = b.getAttribute("data-cam3d") || "sw"; render(); });
    });
    host.querySelectorAll("[data-exp3d]").forEach(function (b) {
      b.addEventListener("click", function () { state.explode3d = !state.explode3d; render(); });
    });
    host.querySelectorAll("[data-attic-flt]").forEach(function (b) {
      b.addEventListener("click", function () { state.atticFilter = b.getAttribute("data-attic-flt") || "all"; render(); });
    });
    host.querySelectorAll("[data-attic-sw]").forEach(function (b) {
      b.addEventListener("click", function () { state.atticSwitchOpt = b.getAttribute("data-attic-sw") || "optA"; render(); });
    });
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
        state.sinkStart = 72.0;
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
