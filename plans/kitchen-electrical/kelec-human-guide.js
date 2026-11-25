/* ============================================================================
   Unit 4 Whole-Unit Electrical (Rev R8) — True 1:1 Human-First Interactive Guide
   14 New Subpanel Circuits (#1–#10, #13–#16) + 6 Open Spares (#11, #12, #17–#20)
   - Reused circuits (original room lights/switches + reused room outlets) stay on the Existing Panel (0 new subpanel spaces!)
   - #12 is now an Open Spare on the 20-space Eaton subpanel; #10 feeds only newly added common-room outlet runs
   - Clean room names ONLY inside floor-plan rooms (zero cryptic sublabels; visual markers show new vs. reused devices)
   - 10-year sealed-battery Smoke/CO alarms (zero hardwired 14/3 ceiling pulls; #16 = Attic Service Outlet & Utility Lights)
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "outlets",     en: "1. Unit & Kitchen Map",  es: "1. Mapa Unidad y Cocina", ru: "1. План квартиры и кухни" },
    { id: "walls",       en: "2. Room Details",        es: "2. Detalles por Cuarto",  ru: "2. По комнатам" },
    { id: "panel",       en: "3. Subpanel (14 + 6)",   es: "3. Subpanel (14 + 6)",    ru: "3. Субщиток (14 + 6)" },
    { id: "attic-runs",  en: "4. Attic 1:1 Map",       es: "4. Mapa 1:1 Ático",       ru: "4. План чердака 1:1" },
    { id: "attic-guide", en: "5. Attic Rules",         es: "5. Reglas Ático",         ru: "5. Правила чердака" },
    { id: "holds",       en: "6. Holds & Breakers",    es: "6. Pausas y Kit",         ru: "6. Паузы и автоматы" }
  ];

  var CIRCUITS = [
    { sp: 1, id: "SA-A", grp: "kitchen", st: "NEW", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu",
      en: "Kitchen East Counter (East 1 @ 10\" N, East 2 @ 45\" N)",
      es: "Encimera Este Cocina (Este 1 @ 10\" N, Este 2 @ 45\" N)",
      ru: "Восточная столешница кухни (East 1 @ 10\" С, East 2 @ 45\" С)",
      routeEn: "In-wall East 50\" bore band · 44\" AFF (+t)",
      routeEs: "En muro Este franja 50\" · 44\" AFF (+t)",
      routeRu: "В восточной стене, зона 50\" · 44\" от пола (+t)" },
    { sp: 2, id: "SA-B", grp: "kitchen", st: "NEW", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu",
      en: "Kitchen South Counter (South 1 @ 24\" W, South 2 @ 62\" W*)",
      es: "Encimera Sur Cocina (Sur 1 @ 24\" O, Sur 2 @ 62\" O*)",
      ru: "Южная столешница кухни (South 1 @ 24\" З, South 2 @ 62\" З*)",
      routeEn: "In-wall South 30\" bore band · verify window CL 87\" vs 90\"",
      routeEs: "En muro Sur franja 30\" · verificar eje ventana 87\" vs 90\"",
      routeRu: "В южной стене, зона 30\" · сверить ось окна 87\" и 90\"" },
    { sp: 3, id: "SA-C", grp: "kitchen", st: "NEW", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu",
      en: "Kitchen West Counter (West 1 @ 9\" N, West 2 @ 57\" N · ~1\" tile rings)",
      es: "Encimera Oeste Cocina (Oeste 1 @ 9\" N, Oeste 2 @ 57\" N · aros ~1\")",
      ru: "Западная столешница кухни (West 1 @ 9\" С, West 2 @ 57\" С · рамки ~1\")",
      routeEn: "Attic home run to West Range Wall (X = 31.5\" step)",
      routeEs: "Por ático a muro Oeste Estufa (escalón X = 31.5\")",
      routeRu: "Через чердак к западной стене плиты (уступ X = 31.5\")" },
    { sp: 4, id: "REF", grp: "kitchen", st: "NEW", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu",
      en: "Haier 28\" Fridge Single 20A TR (REF-1 @ 68\" N of SE, 15\" AFF)",
      es: "Refrigerador Haier 28\" Sencillo 20A TR (REF-1 @ 68\" N, 15\" AFF)",
      ru: "Холодильник Haier 28\" 20A TR (REF-1 @ 68\" С от ЮВ, 15\" от пола)",
      routeEn: "In-wall East 52-1/2\" band · behind 28\" fridge (54\"–82\" N)",
      routeEs: "En muro Este franja 52-1/2\" · tras refri 28\" (54\"–82\" N)",
      routeRu: "В восточной стене, зона 52-1/2\" · за холодильником 54\"–82\"" },
    { sp: 5, id: "DW", grp: "kitchen", st: "NEW", amp: "20A", cat: "BRN120DF", wire: "12/2 Cu",
      en: "24\" Finished-Front Dishwasher (Under-Sink 2-Gang LEFT yoke · 14\" AFF)",
      es: "Lavavajillas 24\" Frente Terminado (Caja Doble Tarja yugo IZQ. · 14\" AFF)",
      ru: "Посудомойка 24\" (левый суппорт коробки под мойкой · 14\" от пола)",
      routeEn: "In-wall South 24\" band · separate 20A TR receptacle & neutral",
      routeEs: "En muro Sur franja 24\" · receptáculo 20A TR y neutro separados",
      routeRu: "В южной стене, зона 24\" · отдельная розетка 20A и нейтраль" },
    { sp: 6, id: "GD", grp: "kitchen", st: "NEW", amp: "15A", cat: "BRN115DF", wire: "14/2 Cu",
      en: "Garbage Disposal (Under-Sink 2-Gang RIGHT yoke + Air Button @ 90\"*)",
      es: "Triturador (Caja Doble Tarja yugo DER. + Botón Aire @ 90\"*)",
      ru: "Измельчитель (правый суппорт под мойкой + пневмокнопка @ 90\"*)",
      routeEn: "In-wall South 26\" band · separate 15A TR receptacle & neutral",
      routeEs: "En muro Sur franja 26\" · receptáculo 15A TR y neutro separados",
      routeRu: "В южной стене, зона 26\" · отдельная розетка 15A и нейтраль" },
    { sp: 7, id: "RG", grp: "kitchen", st: "NEW", amp: "15A", cat: "BRN115DF", wire: "14/2 Cu",
      en: "Viking 30\" Gas Range Low Pocket (RG-1 @ 33\" N of Step, 3\" AFF)",
      es: "Estufa Gas Viking 30\" (RG-1 @ 33\" N del escalón, 3\" AFF)",
      ru: "Газовая плита Viking 30\" (RG-1 @ 33\" С от уступа, 3\" от пола)",
      routeEn: "Attic drop to West 3\" AFF beside <=2\" gas shutoff",
      routeEs: "Bajada de ático a muro Oeste 3\" AFF junto a llave gas <=2\"",
      routeRu: "Спуск с чердака на 3\" рядом с газовым краном <=2\"" },
    { sp: 8, id: "HD", grp: "kitchen", st: "NEW", amp: "15A", cat: "BRN115AF + BRLW1", wire: "14/2 Cu",
      en: "Zephyr Hood Flush 1-Gang 2\"×3\" (HD-1 @ 33\"±2.25\" N, 83\"–86\" AFF)",
      es: "Campana Zephyr 1-Gang 2\"×3\" (HD-1 @ 33\"±2.25\" N, 83\"–86\" AFF)",
      ru: "Вытяжка Zephyr 1-Gang 2\"×3\" (HD-1 @ 33\"±2.25\" С, 83\"–86\" от пола)",
      routeEn: "Attic drop ~1\" proud inside 8-5/8\" shroud (NO 4×4 @ 100\")",
      routeEs: "Bajada de ático ~1\" salida en chimenea 8-5/8\" (NO 4×4 a 100\")",
      routeRu: "Спуск с чердака, выступ ~1\" в коробе 8-5/8\" (без 4×4 на 100\")" },
    { sp: 9, id: "LT", grp: "kitchen", st: "NEW", amp: "15A", cat: "BRN115AF", wire: "14/2 Cu",
      en: "Kitchen Lights (Entry 3-Switch @ 6\" W of NE -> Ceiling, Pendants 75/99\", Under-Cab)",
      es: "Luces Cocina (3-Apagadores @ 6\" O de NE -> Techo, Colgantes 75/99\", Bajo Gab.)",
      ru: "Свет кухни (тройной выкл. @ 6\" З от СВ -> потолок, подвесы 75/99\", подсветка)",
      routeEn: "Attic to North Entry 3-Switch (48\" AFF) & ceiling fixtures",
      routeEs: "Por ático a 3-Apagadores Entrada Norte (48\" AFF) y techo",
      routeRu: "Через чердак к северному входу (48\" от пола) и потолку" },
    { sp: 10, id: "COMMON-R", grp: "unit", st: "NEW ONLY", amp: "20A", cat: "BRN120AF", wire: "12/2 Cu (New Legs)",
      en: "New Common-Room Outlets Only (Living, Dining, Bedroom & Hall New Drops)",
      es: "Solo Contactos Nuevos en Cuartos (Bajadas Nuevas Sala, Comedor, Recámara y Pasillo)",
      ru: "Только новые розетки жилых комнат (гостиная, столовая, спальня и коридор)",
      routeEn: "Feeds ONLY newly added 12/2 receptacle drops (Bed @ 11.5\" dark horiz., Hall H1 @ 18\"). Reused outlets stay on Existing Panel (0 subpanel spaces)! Zero Panel-wall outlet; D6/L6 pocket hold.",
      routeEs: "Alimenta SOLO contactos nuevos 12/2 (Rec. @ 11.5\" horiz. oscuro, H1 @ 18\"). ¡Los contactos reusados quedan en el Panel Existente (0 espacios aquí)! Sin toma en muro Panel; pausa D6/L6.",
      routeRu: "Питает ТОЛЬКО новые линии 12/2 (спальня @ 11.5\" тёмные гориз., H1 @ 18\"). Сохраняемые розетки остаются на существующем щите (0 мест в субщитке)!" },
    { sp: 11, id: "SPARE-11", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Future Bedroom / Room Outlet Split",
      es: "Reserva Libre — División Futura Contactos Recámara / Cuartos",
      ru: "Свободный резерв — будущее выделение спальни / комнат",
      routeEn: "Split-ready from accessible Attic J-Box with zero drywall demo",
      routeEs: "Lista para dividir desde Caja en Ático sin romper tablaroca",
      routeRu: "Готово к отделению из чердачной коробки без вскрытия ГКЛ" },
    { sp: 12, id: "SPARE-12", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare (Lights on Existing Panel)", wire: "—",
      en: "Open Spare — Original Room Lights & Switches Stay on Existing Panel (0 Spaces Used)",
      es: "Reserva Libre — Luces y Apagadores Originales Quedan en Panel Existente (0 Espacios)",
      ru: "Свободный резерв — родной свет и выключатели остаются на существующем щите (0 мест)",
      routeEn: "Living, Dining, Bedroom & Hallway original switches, 3-way travelers & ceiling lights stay on Existing Panel (takes 0 spaces on this subpanel!)",
      routeEs: "Los apagadores, 3-vías y luces originales de Sala, Comedor, Recámara y Pasillo permanecen en su Panel Existente (¡0 espacios en este subpanel!)",
      routeRu: "Родные выключатели, проходные схемы и потолочный свет жилых комнат остаются на старом щите (0 мест в субщитке)" },
    { sp: 13, id: "BATH", grp: "unit", st: "NEW", amp: "20A", cat: "BRN120DF", wire: "100% 12/2 Cu",
      en: "Bathroom All-in-One (Vanity, Sep. Pre-Tile Toilet Drop, Lights, Humidity Fan)",
      es: "Baño Todo-en-Uno (Lavabo, Bajada Sep. Inodoro Pre-Azulejo, Luces, Extractor)",
      ru: "Ванная (100% 12/2: раковина, отд. спуск WC до плитки, свет, вытяжка)",
      routeEn: "Via Bath J-Box · 100% 12/2 Yellow · pocket door RETIRED -> 28\" outward hall door; South stud switches OK",
      routeEs: "Vía Caja Baño · 100% 12/2 Amarillo · corrediza RETIRADA -> puerta 28\" afuera; apagadores muro Sur OK",
      routeRu: "Через Bath J-Box · 100% 12/2 · кассетная дверь отменена -> распашная 28\" наружу" },
    { sp: 14, id: "LAUN", grp: "unit", st: "NEW", amp: "20A", cat: "BRN120DF (Subpanel)", wire: "12/2 Cu",
      en: "Laundry WashTower (1× 20A Duplex East Wall @ 38\" AFF)",
      es: "Lavandería WashTower (1 Toma Doble 20A Muro Este @ 38\" AFF)",
      ru: "Прачечная LG WashTower (1× двойная 20A на восточной стене @ 38\")",
      routeEn: "Both 120V LG WKG101HVA plugs · clears 8-1/4\" Murphy bookcase door · Subpanel GFCI reset",
      routeEs: "Ambos enchufes 120V del LG WKG101HVA · libra puerta librero Murphy 8-1/4\" · reset GFCI en Subpanel",
      routeRu: "Обе вилки 120V LG WKG101HVA · зазор двери-шкафа Murphy 8-1/4\" · сброс GFCI в субщитке" },
    { sp: 15, id: "HVAC", grp: "unit", st: "NEW", amp: "15A", cat: "BR115", wire: "14/2 Cu",
      en: "Attic Furnace F1 + Local Disconnect Switch (174\", 258\")",
      es: "Calefactor Ático F1 + Desconectador Local (174\", 258\")",
      ru: "Печь на чердаке F1 + местный выключатель (174\", 258\")",
      routeEn: "Dedicated circuit to SW Dining attic service platform (30\"×30\")",
      routeEs: "Circuito dedicado a plataforma de servicio en ático (30\"×30\")",
      routeRu: "Выделенная линия к сервисной площадке чердака (30\"×30\")" },
    { sp: 16, id: "ATTIC-SVC", grp: "unit", st: "NEW", amp: "15A", cat: "BRN115DF", wire: "14/2 Cu",
      en: "Attic Service GFCI Outlet & Utility Lights (Hatch Switch + 2× Attic LEDs)",
      es: "Toma GFCI de Servicio y Luces de Utilidad en Ático (Apagador Escotilla + 2 LEDs)",
      ru: "Сервисная розетка GFCI и свет чердака (выкл. у люка + 2 LED)",
      routeEn: "GFCI outlet <=25 ft from F1 + Hatch Switch outside Door 4 + 2× enclosed LEDs (+ Laundry closet light if newly added). Smoke/CO = 10-yr sealed battery!",
      routeEs: "Toma GFCI <=25 pies de F1 + Apagador afuera Puerta 4 + 2 LEDs cerrados (+ luz clóset Lavandería si es nueva). ¡Humo/CO de batería sellada 10 años!",
      routeRu: "Розетка GFCI <=25 фут. от F1 + выкл. у двери 4 + 2 LED (+ свет прачечной при новом выводе). Датчики дыма/CO автономные на 10 лет!" },
    { sp: 17, id: "SPARE-17", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Future Living / Dining Split",
      es: "Reserva Libre — División Futura Sala / Comedor",
      ru: "Свободный резерв — будущее разделение гостиной / столовой",
      routeEn: "Reserved full-size subpanel space",
      routeEs: "Espacio libre tamaño completo",
      routeRu: "Полноразмерное резервное место" },
    { sp: 18, id: "SPARE-18", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Future Split",
      es: "Reserva Libre — División Futura",
      ru: "Свободный резерв — будущее расширение",
      routeEn: "Reserved full-size subpanel space",
      routeEs: "Espacio libre tamaño completo",
      routeRu: "Полноразмерное резервное место" },
    { sp: 19, id: "SPARE-19", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Future Toilet Bidet Split (from Bath J-Box)",
      es: "Reserva Libre — División Futura Bidet Inodoro (desde Caja Baño)",
      ru: "Свободный резерв — линия крышки-биде (от коробки ванной)",
      routeEn: "Pre-tile Toilet 12/2 drop ready in Bath J-Box",
      routeEs: "Bajada 12/2 pre-azulejo ya separada en Caja Baño",
      routeRu: "Отдельный спуск 12/2 к унитазу уже заложен в коробке ванной" },
    { sp: 20, id: "SPARE-20", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Future Expansion (Pairs w/ #18 for 2-Pole if Needed)",
      es: "Reserva Libre — Expansión Futura (Par 2-Polos con #18 si se Requiere)",
      ru: "Свободный резерв — запасное место (пара с #18 под 2-полюсный автомат)",
      routeEn: "Reserved full-size subpanel space",
      routeEs: "Espacio libre tamaño completo",
      routeRu: "Полноразмерное резервное место" }
  ];

  var state = {
    lang: "en",
    step: "outlets",
    mapMode: "unit",
    floorDown: false,
    counterH: 44,
    wallTab: "east",
    panelFilter: "all",
    atticFilter: "all",
    atticSwitchOpt: "optA",
    selectedCircuit: "SA-A"
  };

  function getLang() {
    var attr = (document.documentElement.getAttribute("data-u4-lang") || document.documentElement.lang || "").toLowerCase();
    if (attr.indexOf("ru") === 0) return "ru";
    if (attr.indexOf("es") === 0) return "es";
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q === "ru" || q === "es" || q === "en") return q;
    } catch (e) {}
    return state.lang || "en";
  }

  function t(en, es, ru) {
    var l = getLang();
    if (l === "ru") return ru !== undefined ? ru : en;
    if (l === "es") return es !== undefined ? es : en;
    return en;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function off() { return state.floorDown ? 0 : 0.75; }

  function fmtIn(v) {
    var whole = Math.floor(v + 1e-6);
    var rem = Math.round((v - whole) * 8);
    if (rem === 8) { whole += 1; rem = 0; }
    var map = { 0: "", 1: "-1/8", 2: "-1/4", 3: "-3/8", 4: "-1/2", 5: "-5/8", 6: "-3/4", 7: "-7/8" };
    return whole + (map[rem] || "") + '"';
  }

  // Exact 1:1 room polygons matching Plan 1 (attic-human-guide.js): X = 0..508" W->E, Y = 0..298" N->S, North UP
  var U4_ROOMS = {
    landing:    [[66,34],[147,34],[147,108],[66,108]],
    kitchen:    [[31.5,108],[147,108],[147,234.25],[0,234.25],[0,174.25],[31.5,174.25]],
    dining:     [[147,142],[293.7,142],[293.7,297.75],[147,297.75]],
    living:     [[293.7,142],[473.5,142],[508,178],[508,258],[473.5,297.75],[293.7,297.75]],
    hall:       [[147,58],[207,58],[207,88],[352,88],[352,142],[147,142]],
    bath:       [[207,0],[279.1,0],[279.1,88],[207,88]],
    laundry:    [[279.1,5.4],[315.4,5.4],[315.4,88],[279.1,88]],
    tempCloset: [[315.4,5.4],[352.0,5.4],[352.0,88],[315.4,88]],
    bedroom:    [[352,0],[437.5,0],[474,34],[474,96],[437.5,136],[352,136]]
  };

  function polyStr(pts, fx, fy) {
    return pts.map(function (p) { return fx(p[0]).toFixed(1) + "," + fy(p[1]).toFixed(1); }).join(" ");
  }

  function svgCompass(cx, cy) {
    var wLbl = t("W", "O", "З");
    return '<g transform="translate(' + cx + ',' + cy + ')">' +
      '<circle r="15" fill="#FFFFFF" stroke="#0F2537" stroke-width="1.3"/>' +
      '<polygon points="0,-10 3.5,-1 0,-3.5 -3.5,-1" fill="#DC2626"/>' +
      '<text x="0" y="-11" text-anchor="middle" font-size="7" font-weight="800" fill="#DC2626">N</text>' +
      '<text x="0" y="12" text-anchor="middle" font-size="6.8" font-weight="700" fill="#334155">S</text>' +
      '<text x="10" y="2.5" text-anchor="middle" font-size="6.8" font-weight="700" fill="#334155">E</text>' +
      '<text x="-10" y="2.5" text-anchor="middle" font-size="6.8" font-weight="700" fill="#334155">' + wLbl + '</text>' +
    '</g>';
  }

  function renderWholeUnitMapSvg() {
    var S = 1.12;
    var ox = 56, oy = 40;
    function ux(x) { return ox + x * S; }
    function uy(y) { return oy + y * S; }

    function newDot(x, y, cir, fill, stroke) {
      var isSel = state.selectedCircuit === cir;
      return '<circle cx="' + ux(x).toFixed(1) + '" cy="' + uy(y).toFixed(1) + '" r="' + (isSel ? "5.2" : "4.0") + '" fill="' + (isSel ? "#F59E0B" : fill) + '" stroke="' + stroke + '" stroke-width="1.5" data-cir="' + cir + '" style="cursor:pointer"/>';
    }
    function reusedDot(x, y, cir) {
      return '<circle cx="' + ux(x).toFixed(1) + '" cy="' + uy(y).toFixed(1) + '" r="4.2" fill="#FFFFFF" stroke="#475569" stroke-width="1.4" stroke-dasharray="2,1.5" data-cir="' + cir + '" style="cursor:pointer"/>';
    }

    return '<svg viewBox="0 0 680 416" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      esc(t("True 1:1 Unit 4 Whole-Unit Electrical Map", "Mapa Eléctrico 1:1 de Toda la Unidad 4", "План электрики всей квартиры 1:1")) + '">' +
      '<rect x="0" y="0" width="680" height="416" fill="#F8FAFC" rx="8"/>' +
      '<text x="340" y="22" text-anchor="middle" font-size="11.0" font-weight="800" fill="#0F2537">' +
        esc(t("UNIT 4 ELECTRICAL MAP (1:1 SCALE · 14 NEW SUBPANEL CIRCUITS + 6 OPEN SPARES)",
              "MAPA ELÉCTRICO UNIDAD 4 (ESCALA 1:1 · 14 CIRCUITOS NUEVOS + 6 RESERVAS)",
              "ПЛАН ЭЛЕКТРИКИ КВАРТИРЫ 4 (МАСШТАБ 1:1 · 14 НОВЫХ ЛИНИЙ + 6 РЕЗЕРВОВ)")) +
      '</text>' +
      svgCompass(646, 46) +

      // Clean Room Polygons (1:1 true scale)
      '<polygon points="' + polyStr(U4_ROOMS.landing, ux, uy) + '" fill="#FDF6E7" stroke="#9A5B06" stroke-width="1.4" stroke-dasharray="5,3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.kitchen, ux, uy) + '" fill="#FEFCE8" stroke="#B45309" stroke-width="2.0" data-cir="SA-A" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.dining, ux, uy) + '" fill="#F0F9FF" stroke="#0369A1" stroke-width="1.8" data-cir="COMMON-R" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.living, ux, uy) + '" fill="#F0F9FF" stroke="#0369A1" stroke-width="1.8" data-cir="COMMON-R" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.hall, ux, uy) + '" fill="#FFFFFF" stroke="#475569" stroke-width="1.6" data-cir="COMMON-R" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.bath, ux, uy) + '" fill="#F0FDF4" stroke="#15803D" stroke-width="1.9" data-cir="BATH" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.laundry, ux, uy) + '" fill="#FFF7ED" stroke="#C2410C" stroke-width="1.9" data-cir="LAUN" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.tempCloset, ux, uy) + '" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.3" stroke-dasharray="4,2"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.bedroom, ux, uy) + '" fill="#EEF2FF" stroke="#4338CA" stroke-width="1.8" data-cir="COMMON-R" style="cursor:pointer"/>' +

      // Cased openings: Kitchen-to-Hallway (East wall X=147, Y=108..137.5) & Dining-to-Living
      '<line x1="' + ux(147).toFixed(1) + '" y1="' + uy(108.5).toFixed(1) + '" x2="' + ux(147).toFixed(1) + '" y2="' + uy(137.5).toFixed(1) + '" stroke="#FFFFFF" stroke-width="4.5"/>' +
      '<line x1="' + ux(147).toFixed(1) + '" y1="' + uy(108.5).toFixed(1) + '" x2="' + ux(147).toFixed(1) + '" y2="' + uy(137.5).toFixed(1) + '" stroke="#475569" stroke-width="1.2" stroke-dasharray="3,2"/>' +
      '<line x1="' + ux(293.7).toFixed(1) + '" y1="' + uy(186).toFixed(1) + '" x2="' + ux(293.7).toFixed(1) + '" y2="' + uy(252.5).toFixed(1) + '" stroke="#FFFFFF" stroke-width="4.5"/>' +

      // 24"x36" Attic Hatch on Common Stair Landing
      '<rect x="' + ux(100).toFixed(1) + '" y="' + uy(56).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (36 * S).toFixed(1) + '" rx="2" fill="#E3EEF2" stroke="#1F5F7A" stroke-width="1.8" data-cir="ATTIC-SVC" style="cursor:pointer"/>' +
      '<text x="' + ux(112).toFixed(1) + '" y="' + uy(76).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#1F5F7A">HATCH</text>' +

      // New 20-Space Eaton Subpanel @ X=147, Y=213.75 (faces East into Dining) + 30x36 clear zone
      '<rect x="' + ux(147).toFixed(1) + '" y="' + uy(198.75).toFixed(1) + '" width="' + (36 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="3,2"/>' +
      '<rect x="' + (ux(147) - 3.5).toFixed(1) + '" y="' + uy(203).toFixed(1) + '" width="7" height="' + (22 * S).toFixed(1) + '" fill="#DC2626"/>' +
      '<text x="' + ux(165.5).toFixed(1) + '" y="' + uy(216.5).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#991B1B">PANEL</text>' +

      // Clean Room Names ONLY (zero cryptic sublabels!)
      '<text x="' + ux(106.5).toFixed(1) + '" y="' + uy(46).toFixed(1) + '" text-anchor="middle" font-size="6.6" font-weight="800" fill="#9A5B06">' + esc(t("STAIR LANDING", "DESCANSO", "ПЛОЩАДКА")) + '</text>' +
      '<text x="' + ux(88).toFixed(1) + '" y="' + uy(172).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#92400E">' + esc(t("KITCHEN", "COCINA", "КУХНЯ")) + '</text>' +
      '<text x="' + ux(232).toFixed(1) + '" y="' + uy(216).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#075985">' + esc(t("DINING ROOM", "COMEDOR", "СТОЛОВАЯ")) + '</text>' +
      '<text x="' + ux(402).toFixed(1) + '" y="' + uy(216).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#075985">' + esc(t("LIVING ROOM", "SALA", "ГОСТИНАЯ")) + '</text>' +
      '<text x="' + ux(250).toFixed(1) + '" y="' + uy(118).toFixed(1) + '" text-anchor="middle" font-size="8.4" font-weight="800" fill="#334155">' + esc(t("HALLWAY", "PASILLO", "КОРИДОР")) + '</text>' +
      '<text x="' + ux(243).toFixed(1) + '" y="' + uy(46).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#166534">' + esc(t("BATHROOM", "BAÑO", "ВАННАЯ")) + '</text>' +
      '<text x="' + ux(297.2).toFixed(1) + '" y="' + uy(46).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#9A3412">' + esc(t("LAUNDRY", "LAV.", "ПРАЧ.")) + '</text>' +
      '<text x="' + ux(414).toFixed(1) + '" y="' + uy(68).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#3730A3">' + esc(t("BEDROOM", "RECÁMARA", "СПАЛЬНЯ")) + '</text>' +

      // Visual 1:1 Device Markers — Solid = New Subpanel Circuits
      // Kitchen (#1–#9)
      newDot(31.5, 165.25, "SA-C", "#FEF08A", "#92400E") +
      newDot(31.5, 117.25, "SA-C", "#FEF08A", "#92400E") +
      newDot(31.5, 141.0,  "HD",   "#FEE2E2", "#DC2626") +
      newDot(147,  224.25, "SA-A", "#FEF08A", "#92400E") +
      newDot(147,  189.25, "SA-A", "#FEF08A", "#92400E") +
      newDot(147,  166.25, "REF",  "#FEF08A", "#92400E") +
      newDot(123,  234.25, "SA-B", "#FEF08A", "#92400E") +
      newDot(85,   234.25, "SA-B", "#FEF08A", "#92400E") +
      newDot(71,   234.25, "DW",   "#DBEAFE", "#1D4ED8") +
      newDot(141.0,108.0,  "LT",   "#FEF3C7", "#A15206") +
      // Bathroom (#13) & Laundry (#14)
      newDot(207,  58,     "BATH", "#DCFCE7", "#15803D") +
      newDot(279,  60,     "BATH", "#DCFCE7", "#15803D") +
      newDot(243,  22,     "BATH", "#DCFCE7", "#15803D") +
      newDot(315.4,52,     "LAUN", "#FFEDD5", "#C2410C") +
      // Common-Room Outlets (New #10 drops vs. Reused Existing Panel outlets)
      newDot(265,  88,     "COMMON-R", "#DBEAFE", "#0284C7") +
      newDot(370,  0,      "COMMON-R", "#DBEAFE", "#0284C7") +
      newDot(426,  0,      "COMMON-R", "#DBEAFE", "#0284C7") +
      newDot(415,  136,    "COMMON-R", "#DBEAFE", "#0284C7") +
      reusedDot(190, 142,  "COMMON-R") +
      reusedDot(268, 142,  "COMMON-R") +
      reusedDot(190, 297.75, "COMMON-R") +
      reusedDot(258, 297.75, "COMMON-R") +
      reusedDot(340, 142,  "COMMON-R") +
      reusedDot(432, 142,  "COMMON-R") +
      reusedDot(345, 297.75, "COMMON-R") +
      reusedDot(430, 297.75, "COMMON-R") +
      reusedDot(508, 218,  "COMMON-R") +
      reusedDot(474, 65,   "COMMON-R") +
      // Reused Original Ceiling Lights (Stay on Existing Panel — 0 Subpanel Spaces!)
      reusedDot(228, 190,  "SPARE-12") +
      reusedDot(402, 190,  "SPARE-12") +
      reusedDot(414, 42,   "SPARE-12") +
      reusedDot(185, 102,  "SPARE-12") +
      reusedDot(315, 102,  "SPARE-12") +

      // Clean Visual Legend Bar at Bottom
      '<circle cx="96" cy="396" r="4.5" fill="#FEF08A" stroke="#92400E" stroke-width="1.5"/>' +
      '<text x="106" y="399" font-size="7.8" font-weight="700" fill="#0F2537">' +
        esc(t("New Subpanel Circuit (#1–#10, #13–#16)", "Circuito Nuevo en Subpanel (#1–#10, #13–#16)", "Новая линия субщитка (#1–#10, #13–#16)")) +
      '</text>' +
      '<circle cx="338" cy="396" r="4.5" fill="#FFFFFF" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,1.5"/>' +
      '<text x="348" y="399" font-size="7.8" font-weight="700" fill="#334155">' +
        esc(t("Reused on Existing Panel (0 Subpanel Spaces)", "Reusado en Panel Existente (0 Espacios en Subpanel)", "Сохранено на старом щите (0 мест в субщитке)")) +
      '</text>' +
    '</svg>';
  }

  function renderKitchenPlanSvg() {
    var S = 2.45;
    var ox = 72, oy = 48 - 108 * S;
    function kx(x) { return ox + x * S; }
    function ky(y) { return oy + y * S; }
    var cH = fmtIn(state.counterH + off());

    var pts = U4_ROOMS.kitchen.map(function (p) { return kx(p[0]).toFixed(1) + "," + ky(p[1]).toFixed(1); }).join(" ");
    function bFill(id, def) { return state.selectedCircuit === id ? "#F59E0B" : def; }

    return '<svg viewBox="0 0 640 412" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      esc(t("True 1:1 Unit 4 Kitchen Electrical Floor Plan", "Plano 1:1 Eléctrico de Cocina", "План электрики кухни 1:1")) + '">' +
      '<rect x="0" y="0" width="640" height="412" fill="#F8FAFC" rx="8"/>' +
      '<text x="320" y="22" text-anchor="middle" font-size="11.2" font-weight="800" fill="#0F2537">' +
        esc(t("KITCHEN 1:1 FLOOR PLAN (#1–#9) · COUNTER OUTLETS @ " + cH + " · TAP ANY BOX",
              "PLANO 1:1 COCINA (#1–#9) · CONTACTOS CUBIERTA @ " + cH + " · TOCA CUALQUIER CAJA",
              "ПЛАН КУХНИ 1:1 (#1–#9) · РОЗЕТКИ ФАРТУКА @ " + cH + " · НАЖМИТЕ НА КОРОБКУ")) +
      '</text>' +
      svgCompass(604, 44) +

      '<polygon points="' + pts + '" fill="#FFFFFF" stroke="#0F2537" stroke-width="2.4"/>' +

      '<line x1="' + kx(147).toFixed(1) + '" y1="' + ky(108).toFixed(1) + '" x2="' + kx(147).toFixed(1) + '" y2="' + ky(137.5).toFixed(1) + '" stroke="#FFFFFF" stroke-width="5.5"/>' +
      '<line x1="' + kx(147).toFixed(1) + '" y1="' + ky(108).toFixed(1) + '" x2="' + kx(147).toFixed(1) + '" y2="' + ky(137.5).toFixed(1) + '" stroke="#15539E" stroke-width="1.5" stroke-dasharray="4,3"/>' +
      '<text x="' + (kx(147) + 10).toFixed(1) + '" y="' + ky(123.5).toFixed(1) + '" font-size="7.6" font-weight="800" fill="#15539E">' + esc(t("HALL 29-1/2\"", "PASILLO 29-1/2\"", "ПРОЁМ 29-1/2\"")) + '</text>' +
      '<line x1="' + kx(4.75).toFixed(1) + '" y1="' + ky(234.25).toFixed(1) + '" x2="' + kx(30.625).toFixed(1) + '" y2="' + ky(234.25).toFixed(1) + '" stroke="#B45309" stroke-width="3.2" stroke-dasharray="4,2"/>' +
      '<text x="' + kx(17.5).toFixed(1) + '" y="' + (ky(234.25) + 13).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#92400E">' + esc(t("REAR DOOR", "PTA TRAS.", "ЗАДН. ДВ.")) + '</text>' +
      '<line x1="' + kx(88).toFixed(1) + '" y1="' + ky(234.25).toFixed(1) + '" x2="' + kx(121).toFixed(1) + '" y2="' + ky(234.25).toFixed(1) + '" stroke="#D97706" stroke-width="4" stroke-dasharray="5,2"/>' +

      '<rect x="' + kx(31.5).toFixed(1) + '" y="' + ky(108).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18.25 * S).toFixed(1) + '" fill="#F1F5F9" stroke="#94A3B8"/>' +
      '<rect x="' + kx(31.5).toFixed(1) + '" y="' + ky(126.25).toFixed(1) + '" width="' + (26 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" fill="#FFEDD5" stroke="#C2410C" stroke-width="1.5"/>' +
      '<text x="' + kx(44.5).toFixed(1) + '" y="' + ky(143).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#9A3412">VIKING 30"</text>' +
      '<rect x="' + kx(31.5).toFixed(1) + '" y="' + ky(156.25).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18 * S).toFixed(1) + '" fill="#F1F5F9" stroke="#94A3B8"/>' +

      '<polygon points="' + kx(147).toFixed(1) + ',' + ky(234.25).toFixed(1) + ' ' + kx(111).toFixed(1) + ',' + ky(234.25).toFixed(1) + ' ' + kx(111).toFixed(1) + ',' + ky(210.25).toFixed(1) + ' ' + kx(123).toFixed(1) + ',' + ky(198.25).toFixed(1) + ' ' + kx(147).toFixed(1) + ',' + ky(198.25).toFixed(1) + '" fill="#E2E8F0" stroke="#64748B" stroke-width="1.3"/>' +
      '<text x="' + kx(132).toFixed(1) + '" y="' + ky(220).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#334155">36" DIAG</text>' +
      '<rect x="' + kx(123).toFixed(1) + '" y="' + ky(180.25).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18 * S).toFixed(1) + '" fill="#F1F5F9" stroke="#94A3B8"/>' +
      '<rect x="' + kx(119).toFixed(1) + '" y="' + ky(152.25).toFixed(1) + '" width="' + (28 * S).toFixed(1) + '" height="' + (28 * S).toFixed(1) + '" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>' +
      '<text x="' + kx(133).toFixed(1) + '" y="' + ky(168).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#1E293B">FRIDGE 28"</text>' +

      '<rect x="' + kx(99).toFixed(1) + '" y="' + ky(210.25).toFixed(1) + '" width="' + (12 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="#F1F5F9" stroke="#94A3B8"/>' +
      '<rect x="' + kx(75).toFixed(1) + '" y="' + ky(210.25).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.4"/>' +
      '<text x="' + kx(87).toFixed(1) + '" y="' + ky(224).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="800" fill="#0369A1">DW 24"</text>' +
      '<rect x="' + kx(45).toFixed(1) + '" y="' + ky(210.25).toFixed(1) + '" width="' + (30 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="1.4"/>' +
      '<text x="' + kx(60).toFixed(1) + '" y="' + ky(224).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#1E40AF">SINK 30"</text>' +

      '<rect x="' + (kx(147) + 4).toFixed(1) + '" y="' + ky(198.75).toFixed(1) + '" width="' + (34 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" rx="4" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5" stroke-dasharray="4,2"/>' +
      '<rect x="' + (kx(147) - 3).toFixed(1) + '" y="' + ky(206.75).toFixed(1) + '" width="8" height="' + (14.5 * S).toFixed(1) + '" fill="#DC2626"/>' +
      '<text x="' + (kx(147) + 45).toFixed(1) + '" y="' + ky(211).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#991B1B">PANEL (20-Sp)</text>' +
      '<text x="' + (kx(147) + 45).toFixed(1) + '" y="' + ky(221).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#B91C1C">' + esc(t("Dining Side · 30×36\"", "Lado Comedor · 30×36\"", "Столовая · 30×36\"")) + '</text>' +

      '<g data-cir="SA-C" style="cursor:pointer">' +
        '<circle cx="' + kx(31.5).toFixed(1) + '" cy="' + ky(165.25).toFixed(1) + '" r="7" fill="' + bFill("SA-C", "#FEF08A") + '" stroke="#713F12" stroke-width="1.6"/>' +
        '<text x="' + (kx(31.5) - 12).toFixed(1) + '" y="' + (ky(165.25) + 3).toFixed(1) + '" text-anchor="end" font-size="7.8" font-weight="800" fill="#0F2537">W1 (#3)</text>' +
        '<circle cx="' + kx(31.5).toFixed(1) + '" cy="' + ky(117.25).toFixed(1) + '" r="7" fill="' + bFill("SA-C", "#FEF08A") + '" stroke="#713F12" stroke-width="1.6"/>' +
        '<text x="' + (kx(31.5) - 12).toFixed(1) + '" y="' + (ky(117.25) + 3).toFixed(1) + '" text-anchor="end" font-size="7.8" font-weight="800" fill="#0F2537">W2 (#3)</text>' +
      '</g>' +
      '<g data-cir="HD" style="cursor:pointer">' +
        '<rect x="' + (kx(31.5) - 5).toFixed(1) + '" y="' + (ky(140) - 6).toFixed(1) + '" width="10" height="12" rx="2" fill="' + bFill("HD", "#FEE2E2") + '" stroke="#DC2626" stroke-width="1.6"/>' +
        '<text x="' + (kx(31.5) - 12).toFixed(1) + '" y="' + (ky(141) + 3).toFixed(1) + '" text-anchor="end" font-size="7.6" font-weight="800" fill="#991B1B">RG #7 / HD #8</text>' +
      '</g>' +
      '<g data-cir="SA-A" style="cursor:pointer">' +
        '<circle cx="' + kx(147).toFixed(1) + '" cy="' + ky(224.25).toFixed(1) + '" r="6.5" fill="' + bFill("SA-A", "#FEF08A") + '" stroke="#713F12" stroke-width="1.6"/>' +
        '<text x="' + (kx(147) + 12).toFixed(1) + '" y="' + (ky(231) + 3).toFixed(1) + '" font-size="7.8" font-weight="800" fill="#0F2537">E1 @ 10\" (#1)</text>' +
        '<circle cx="' + kx(147).toFixed(1) + '" cy="' + ky(189.25).toFixed(1) + '" r="6.5" fill="' + bFill("SA-A", "#FEF08A") + '" stroke="#713F12" stroke-width="1.6"/>' +
        '<text x="' + (kx(147) + 12).toFixed(1) + '" y="' + (ky(189.25) + 3).toFixed(1) + '" font-size="7.8" font-weight="800" fill="#0F2537">E2 @ 45\" (#1)</text>' +
      '</g>' +
      '<g data-cir="REF" style="cursor:pointer">' +
        '<circle cx="' + kx(147).toFixed(1) + '" cy="' + ky(166.25).toFixed(1) + '" r="6.5" fill="' + bFill("REF", "#FEF08A") + '" stroke="#713F12" stroke-width="1.6"/>' +
        '<text x="' + (kx(147) + 12).toFixed(1) + '" y="' + (ky(166.25) + 3).toFixed(1) + '" font-size="7.8" font-weight="800" fill="#0F2537">REF-1 @ 68\" (#4)</text>' +
      '</g>' +
      '<g data-cir="SA-B" style="cursor:pointer">' +
        '<circle cx="' + kx(123).toFixed(1) + '" cy="' + ky(234.25).toFixed(1) + '" r="6.5" fill="' + bFill("SA-B", "#FEF08A") + '" stroke="#713F12" stroke-width="1.6"/>' +
        '<text x="' + kx(123).toFixed(1) + '" y="' + (ky(234.25) + 17).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="800" fill="#0F2537">S1 24\" (#2)</text>' +
        '<circle cx="' + kx(85).toFixed(1) + '" cy="' + ky(234.25).toFixed(1) + '" r="6.5" fill="' + bFill("SA-B", "#FEF08A") + '" stroke="#713F12" stroke-width="1.6"/>' +
        '<text x="' + kx(92).toFixed(1) + '" y="' + (ky(234.25) + 29).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="800" fill="#0F2537">S2 62\"* (#2)</text>' +
      '</g>' +
      '<g data-cir="DW" style="cursor:pointer">' +
        '<rect x="' + (kx(71) - 7).toFixed(1) + '" y="' + (ky(234.25) - 9).toFixed(1) + '" width="14" height="9" rx="2" fill="' + bFill("DW", "#DBEAFE") + '" stroke="#1D4ED8" stroke-width="1.6"/>' +
        '<text x="' + kx(62).toFixed(1) + '" y="' + (ky(234.25) + 17).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="800" fill="#1D4ED8">DW+GD 76\" (#5/#6)</text>' +
      '</g>' +
      '<g data-cir="LT" style="cursor:pointer">' +
        '<rect x="' + (kx(141) - 8).toFixed(1) + '" y="' + (ky(108) - 4).toFixed(1) + '" width="16" height="8" rx="2" fill="' + bFill("LT", "#FEE2E2") + '" stroke="#DC2626" stroke-width="1.5"/>' +
        '<text x="' + kx(136).toFixed(1) + '" y="' + (ky(108) - 8).toFixed(1) + '" text-anchor="end" font-size="7.6" font-weight="800" fill="#991B1B">3-SW 6\" W (#9)</text>' +
        '<circle cx="' + kx(89).toFixed(1) + '" cy="' + ky(159).toFixed(1) + '" r="8" fill="#FEF3C7" stroke="#A15206" stroke-width="1.6"/>' +
        '<text x="' + kx(89).toFixed(1) + '" y="' + (ky(159) + 3).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#92400E">L1</text>' +
        '<circle cx="' + kx(72).toFixed(1) + '" cy="' + ky(201).toFixed(1) + '" r="5.5" fill="#FEF3C7" stroke="#A15206" stroke-width="1.4"/>' +
        '<circle cx="' + kx(48).toFixed(1) + '" cy="' + ky(201).toFixed(1) + '" r="5.5" fill="#FEF3C7" stroke="#A15206" stroke-width="1.4"/>' +
      '</g>' +

      '<text x="320" y="396" text-anchor="middle" font-size="8.0" font-weight="700" fill="#475569">' +
        esc(t("*Verify South window CL (87\" vs 90\" W) before fastening S2 & DW/GD · Zero screws 53\"–77\" AFF behind Panel",
              "*Verificar eje ventana Sur (87\" vs 90\" O) antes de fijar S2 y DW/GD · Cero tornillos 53\"–77\" AFF tras Panel",
              "*Сверить ось южного окна (87\" и 90\" З) до крепежа S2 и DW/GD · Без саморезов 53\"–77\" за щитком")) +
      '</text>' +
    '</svg>';
  }

  function renderAtticMapSvg() {
    var S = 1.12;
    var ox = 56, oy = 40;
    function ax(x) { return ox + x * S; }
    function ay(y) { return oy + y * S; }
    var flt = state.atticFilter;
    var swOpt = state.atticSwitchOpt;
    var all = flt === "all";

    var opKit = (all || flt === "kitchen") ? "1" : "0.16";
    var opAtt = (all || flt === "attic") ? "1" : "0.16";
    var opBth = (all || flt === "bath") ? "1" : "0.16";
    var opCom = (all || flt === "common") ? "1" : "0.16";

    var swX = swOpt === "optA" ? 94 : 112;
    var swY = swOpt === "optA" ? 74 : 92;
    var swLbl = swOpt === "optA"
      ? t("Hatch Sw Opt A (Landing Wall)", "Apagador Op. A (Muro Descanso)", "Выкл. вар. A (стена площадки)")
      : t("Hatch Sw Opt B (Inside 2× Curb)", "Apagador Op. B (Marco 2×)", "Выкл. вар. B (внутри короба 2×)");

    return '<svg viewBox="0 0 680 416" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      esc(t("True 1:1 Unit 4 Attic & Ceiling Romex Map", "Mapa 1:1 de Ático y Techo Unidad 4", "План чердака и потолочных трасс 1:1")) + '">' +
      '<rect x="0" y="0" width="680" height="416" fill="#F8FAFC" rx="8"/>' +
      '<text x="340" y="22" text-anchor="middle" font-size="11.0" font-weight="800" fill="#0F2537">' +
        esc(t("ATTIC & CEILING HOMERUNS (1:1 SCALE · NEW SUBPANEL RUNS ONLY)",
              "RUTAS EN ÁTICO Y TECHO (ESCALA 1:1 · SOLO CIRCUITOS NUEVOS DEL SUBPANEL)",
              "ЧЕРДАЧНЫЕ ТРАССЫ (МАСШТАБ 1:1 · ТОЛЬКО НОВЫЕ ЛИНИИ СУБЩИТКА)")) +
      '</text>' +
      svgCompass(646, 46) +

      '<polygon points="' + polyStr(U4_ROOMS.landing, ax, ay) + '" fill="#FDF6E7" stroke="#9A5B06" stroke-width="1.4" stroke-dasharray="5,3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.kitchen, ax, ay) + '" fill="#FEFCE8" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.dining, ax, ay) + '" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.living, ax, ay) + '" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.hall, ax, ay) + '" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.bath, ax, ay) + '" fill="#F0FDF4" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.laundry, ax, ay) + '" fill="#FFF7ED" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.tempCloset, ax, ay) + '" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.3" stroke-dasharray="4,2"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.bedroom, ax, ay) + '" fill="#EEF2FF" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<line x1="' + ax(147).toFixed(1) + '" y1="' + ay(108.5).toFixed(1) + '" x2="' + ax(147).toFixed(1) + '" y2="' + ay(137.5).toFixed(1) + '" stroke="#F8FAFC" stroke-width="3.6"/>' +

      // Clean Room Names ONLY (zero sublabel soup!)
      '<text x="' + ax(84).toFixed(1) + '" y="' + ay(222).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="800" fill="#92400E">' + esc(t("KITCHEN", "COCINA", "КУХНЯ")) + '</text>' +
      '<text x="' + ax(242).toFixed(1) + '" y="' + ay(286).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="800" fill="#475569">' + esc(t("DINING ROOM", "COMEDOR", "СТОЛОВАЯ")) + '</text>' +
      '<text x="' + ax(402).toFixed(1) + '" y="' + ay(286).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="800" fill="#475569">' + esc(t("LIVING ROOM", "SALA", "ГОСТИНАЯ")) + '</text>' +
      '<text x="' + ax(243).toFixed(1) + '" y="' + ay(20).toFixed(1) + '" text-anchor="middle" font-size="7.4" font-weight="800" fill="#166534">' + esc(t("BATHROOM", "BAÑO", "ВАННАЯ")) + '</text>' +
      '<text x="' + ax(297.2).toFixed(1) + '" y="' + ay(20).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#9A3412">' + esc(t("LAUNDRY", "LAV.", "ПРАЧ.")) + '</text>' +
      '<text x="' + ax(414).toFixed(1) + '" y="' + ay(20).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="800" fill="#3730A3">' + esc(t("BEDROOM", "RECÁMARA", "СПАЛЬНЯ")) + '</text>' +

      // 72" Hatch Guard-Strip Zone around 24"x36" Attic Hatch
      '<rect x="' + ax(28).toFixed(1) + '" y="' + ay(2).toFixed(1) + '" width="' + (168 * S).toFixed(1) + '" height="' + (162 * S).toFixed(1) + '" fill="none" stroke="#DC2626" stroke-width="1.2" stroke-dasharray="5,3"/>' +
      '<text x="' + ax(112).toFixed(1) + '" y="' + ay(15).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="800" fill="#991B1B">NEC 320.23(A): 72" HATCH GUARD ZONE</text>' +

      // 24" OSB Walkway + 30"x30" Platform + F1 Furnace (exact match to Plan 1)
      '<polyline points="' + ax(124).toFixed(1) + ',' + ay(74).toFixed(1) + ' ' + ax(174).toFixed(1) + ',' + ay(74).toFixed(1) + ' ' + ax(174).toFixed(1) + ',' + ay(213.5).toFixed(1) + '" fill="none" stroke="#D9A86C" stroke-width="' + (24 * S).toFixed(1) + '" opacity="0.55"/>' +
      '<rect x="' + ax(159).toFixed(1) + '" y="' + ay(213.5).toFixed(1) + '" width="' + (30 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" fill="#E4F0E6" stroke="#2F6B3F" stroke-width="1.6"/>' +
      '<rect x="' + ax(157.4).toFixed(1) + '" y="' + ay(243.5).toFixed(1) + '" width="' + (33.25 * S).toFixed(1) + '" height="' + (29 * S).toFixed(1) + '" rx="3" fill="#1E293B" stroke="#0F172A"/>' +
      '<text x="' + ax(174).toFixed(1) + '" y="' + ay(261).toFixed(1) + '" text-anchor="middle" font-size="7.4" font-weight="800" fill="#FFFFFF">FURNACE #15</text>' +

      // 24"x36" Attic Hatch outside Door 4
      '<rect x="' + ax(100).toFixed(1) + '" y="' + ay(56).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (36 * S).toFixed(1) + '" rx="2.5" fill="#E3EEF2" stroke="#1F5F7A" stroke-width="2.0"/>' +
      '<text x="' + ax(112).toFixed(1) + '" y="' + ay(76).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#1F5F7A">HATCH</text>' +

      // Subpanel Top Riser @ X=147, Y=213.75
      '<rect x="' + (ax(147) - 5).toFixed(1) + '" y="' + (ay(213.75) - 7).toFixed(1) + '" width="10" height="14" fill="#DC2626"/>' +
      '<text x="' + (ax(147) - 9).toFixed(1) + '" y="' + (ay(213.75) + 3).toFixed(1) + '" text-anchor="end" font-size="7.4" font-weight="800" fill="#991B1B">PANEL</text>' +

      // 1. Kitchen Attic Homeruns (#3, #7, #8, #9)
      '<g opacity="' + opKit + '">' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(65).toFixed(1) + ',' + ay(141).toFixed(1) + ' ' + ax(31.5).toFixed(1) + ',' + ay(141).toFixed(1) + '" fill="none" stroke="#D97706" stroke-width="2.4"/>' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(141).toFixed(1) + ',' + ay(108).toFixed(1) + '" fill="none" stroke="#2563EB" stroke-width="2"/>' +
      '</g>' +

      // 2. Attic Furnace (#15) & Attic Service GFCI + Hatch LEDs (#16 — ZERO wired smoke alarms!)
      '<g opacity="' + opAtt + '">' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(159).toFixed(1) + ',' + ay(258).toFixed(1) + '" fill="none" stroke="#0F172A" stroke-width="2.6"/>' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(147).toFixed(1) + ',' + ay(92).toFixed(1) + ' ' + ax(swX).toFixed(1) + ',' + ay(swY).toFixed(1) + '" fill="none" stroke="#16A34A" stroke-width="2.2" stroke-dasharray="5,3"/>' +
        '<circle cx="' + ax(swX).toFixed(1) + '" cy="' + ay(swY).toFixed(1) + '" r="5" fill="#DCFCE7" stroke="#15803D" stroke-width="1.8"/>' +
        '<text x="' + (ax(swX) - 7).toFixed(1) + '" y="' + (ay(swY) + 12).toFixed(1) + '" text-anchor="end" font-size="6.8" font-weight="800" fill="#166534">' + esc(swLbl) + '</text>' +
        '<circle cx="' + ax(152).toFixed(1) + '" cy="' + ay(74).toFixed(1) + '" r="4.8" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.6"/>' +
        '<circle cx="' + ax(174).toFixed(1) + '" cy="' + ay(175).toFixed(1) + '" r="4.8" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.6"/>' +
        '<rect x="' + (ax(159) - 2).toFixed(1) + '" y="' + (ay(228) - 4).toFixed(1) + '" width="12" height="9" rx="2" fill="#FEF3C7" stroke="#B45309" stroke-width="1.4"/>' +
        '<text x="' + (ax(159) + 38).toFixed(1) + '" y="' + (ay(228) + 3).toFixed(1) + '" font-size="6.8" font-weight="800" fill="#92400E">GFCI #16</text>' +
      '</g>' +

      // 3. Bath (#13 via Bath J-Box) & Laundry (#14 East wall @ 38" AFF)
      '<g opacity="' + opBth + '">' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(243).toFixed(1) + ',' + ay(68).toFixed(1) + '" fill="none" stroke="#15803D" stroke-width="2.3"/>' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(315).toFixed(1) + ',' + ay(52).toFixed(1) + '" fill="none" stroke="#EA580C" stroke-width="2.3"/>' +
        '<rect x="' + (ax(243) - 6).toFixed(1) + '" y="' + (ay(68) - 6).toFixed(1) + '" width="12" height="12" fill="#FEF08A" stroke="#15803D" stroke-width="1.8"/>' +
        '<text x="' + ax(243).toFixed(1) + '" y="' + (ay(68) - 10).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#166534">Bath JB #13</text>' +
      '</g>' +

      // 4. New Common-Room Outlet Drops (#10 — Reused Outlets & Lights Stay on Existing Panel!)
      '<g opacity="' + opCom + '">' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(265).toFixed(1) + ',' + ay(108).toFixed(1) + ' ' + ax(395).toFixed(1) + ',' + ay(68).toFixed(1) + '" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-dasharray="6,3"/>' +
        '<rect x="' + (ax(395) - 6).toFixed(1) + '" y="' + (ay(68) - 6).toFixed(1) + '" width="12" height="12" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>' +
        '<text x="' + ax(395).toFixed(1) + '" y="' + (ay(68) - 10).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#075985">New Outlets JB #10</text>' +
      '</g>' +

      '<text x="340" y="398" text-anchor="middle" font-size="7.8" font-weight="700" fill="#334155">' +
        esc(t("Reused room lights/switches & reused outlets stay on Existing Panel (0 attic runs to this subpanel) · 72\" hatch guard strips",
              "Luces/apagadores y contactos reusados quedan en su Panel Existente (0 rutas nuevas aquí) · Listones de guardia a 72\" en escotilla",
              "Сохраняемый свет/выключатели и розетки остаются на старом щите (0 новых трасс к субщитку) · Защитные планки 72\" у люка")) +
      '</text>' +
    '</svg>';
  }

  function renderWallDetail() {
    var cH = fmtIn(state.counterH + off());
    var w = state.wallTab;
    var cards = {
      east: {
        title: t("Kitchen East Wall (126-1/4\") — Counter #1, Fridge #4 & Panel Back Zone", "Muro Este Cocina (126-1/4\") — Cubierta #1, Refri #4 y Reverso Panel", "Восточная стена кухни (126-1/4\") — фартук #1, холодильник #4 и тыл щитка"),
        photo: "../../wiki-images/2026-11-19_U4_kitchen_east-wall-fridge-bay.jpg",
        bullets: [
          t("East 1 @ 10\" N & East 2 @ 45\" N of SE at " + cH + " (#1 · 20A BRN120DF · 12/2 in 50\" bore band); 29-1/2\" × 79\" Hallway cased opening sits at 96-1/2\"–126\" N (NE corner).", "Este 1 @ 10\" N y Este 2 @ 45\" N de SE a " + cH + " (#1 · 20A BRN120DF · 12/2); vano al Pasillo de 29-1/2\" × 79\" en 96-1/2\"–126\" N (esquina NE).", "East 1 @ 10\" С и East 2 @ 45\" С на " + cH + " (#1 · 20A BRN120DF · 12/2); проём в коридор 29-1/2\" × 79\" на 96-1/2\"–126\" С (угол СВ)."),
          t("Haier 28\" Fridge single 20A TR @ 68\" N of SE, " + fmtIn(15 + off()) + " (#4 · 12/2 in 52-1/2\" bore band).", "Refrigerador Haier 28\" toma sencilla 20A TR @ 68\" N, " + fmtIn(15 + off()) + " (#4 · 12/2).", "Холодильник Haier 28\" одиночная 20A TR @ 68\" С, " + fmtIn(15 + off()) + " (#4 · 12/2)."),
          t("RED ZONE (13\"–27-1/2\" N, 53\"–77\" AFF): ZERO screws, boxes, or back-entries behind the Dining Subpanel.", "ZONA ROJA (13\"–27-1/2\" N, 53\"–77\" AFF): CERO tornillos, cajas ni entradas traseras detrás del Subpanel.", "КРАСНАЯ ЗОНА (13\"–27-1/2\" С, 53\"–77\"): БЕЗ саморезов, коробок и ввода сзади за субщитком.")
        ]
      },
      south: {
        title: t("Kitchen South Sink Wall (147\") — Counter #2 & Under-Sink 2-Gang (#5/#6)", "Muro Sur Tarja (147\") — Cubierta #2 y Caja Doble Bajo Tarja (#5/#6)", "Южная стена мойки (147\") — фартук #2 и двойная коробка (#5/#6)"),
        photo: "../../wiki-images/2026-11-21_U4_kitchen_sink-wall-wide.jpg",
        bullets: [
          t("South 1 @ 24\" W & South 2 @ 62\" W* of SE at " + cH + " (#2 · 20A BRN120DF · 12/2; Pie-Safe sealed & flush).", "Sur 1 @ 24\" O y Sur 2 @ 62\" O* de SE a " + cH + " (#2 · 20A BRN120DF · 12/2; Pie-Safe sellado al paño).", "South 1 @ 24\" З и South 2 @ 62\" З* на " + cH + " (#2 · 20A BRN120DF · 12/2)."),
          t("Under-Sink 2-Gang @ 76\" W*, " + fmtIn(14 + off()) + ": TWO separate TR receptacles on separate yokes — LEFT = #5 24\" Finished-Front DW (20A · 12/2), RIGHT = #6 Disposal (15A · 14/2 + Air Button @ 90\"*).", "Caja Doble Bajo Tarja @ 76\" O*, " + fmtIn(14 + off()) + ": DOS receptáculos TR separados — IZQ. = #5 Lavavajillas 24\" frente terminado (20A · 12/2), DER. = #6 Triturador (15A · 14/2 + Botón Aire @ 90\"*).", "Двойная коробка @ 76\" З*, " + fmtIn(14 + off()) + ": ЛЕВЫЙ = #5 посудомойка 24\" (20A · 12/2), ПРАВЫЙ = #6 измельчитель (15A · 14/2)."),
          t("*HOLD: Verify South window CL (87\" vs. 90\" W of SE) before fastening South 2 & Under-Sink 2-Gang.", "*PAUSA: Verificar eje de ventana Sur (87\" vs. 90\" O de SE) antes de fijar Sur 2 y Caja Doble.", "*ПАУЗА: Сверить ось южного окна (87\" или 90\" З от ЮВ) до крепежа коробок.")
        ]
      },
      west: {
        title: t("Kitchen West Range Wall (66-1/4\" @ X = 31.5\") — #3, Range #7 & Hood #8", "Muro Oeste Estufa (66-1/4\" @ X = 31.5\") — #3, Estufa #7 y Campana #8", "Западная стена плиты (66-1/4\" @ X = 31.5\") — #3, плита #7 и вытяжка #8"),
        photo: "../../wiki-images/2026-11-19_U4_kitchen_west-wall-hood-duct.jpg",
        bullets: [
          t("West 1 @ 9\" N & West 2 @ 57\" N of Step at " + cH + " (#3 · 20A 12/2 · ~1\" tile mud rings; 1/2\" drywall + 1/2\" HardieBacker, zero shims).", "Oeste 1 @ 9\" N y Oeste 2 @ 57\" N a " + cH + " (#3 · 20A 12/2 · aros ~1\"; tablaroca 1/2\" + HardieBacker 1/2\", sin calzas).", "West 1 @ 9\" С и West 2 @ 57\" С на " + cH + " (#3 · 20A 12/2 · выступ ~1\" под плитку)."),
          t("Viking 30\" Gas Range (#7 · 15A 14/2) @ 33\" N, " + fmtIn(3 + off()) + " low rear pocket beside <=2\" gas shutoff.", "Estufa Viking 30\" (#7 · 15A 14/2) @ 33\" N, " + fmtIn(3 + off()) + " junto a llave de gas <=2\".", "Плита Viking 30\" (#7 · 15A 14/2) @ 33\" С, " + fmtIn(3 + off()) + " рядом с газовым краном <=2\"."),
          t("Zephyr Hood (#8 · 15A AFCI + BRLW1 · 14/2): Flush 1-gang 2\"×3\" set ~1\" proud @ 33\"±2.25\" N, " + fmtIn(83 + off()) + "–" + fmtIn(86 + off()) + " inside 8-5/8\" shroud (replaces retired 4×4 @ 100\").", "Campana Zephyr (#8 · 15A AFCI + BRLW1 · 14/2): Caja 1-gang 2\"×3\" ~1\" salida @ 33\"±2.25\" N, " + fmtIn(83 + off()) + "–" + fmtIn(86 + off()) + " dentro de chimenea 8-5/8\".", "Вытяжка Zephyr (#8 · 15A AFCI + BRLW1 · 14/2): коробка 2\"×3\" @ 33\"±2.25\" С, " + fmtIn(83 + off()) + "–" + fmtIn(86 + off()) + ".")
        ]
      },
      north: {
        title: t("Kitchen North Entry Wall (115-1/2\") — 3-Switch #9 & Trim Protection", "Muro Norte Entrada (115-1/2\") — 3-Apagadores #9 y Molduras", "Северная стена входа (115-1/2\") — выключатели #9 и молдинги"),
        photo: "",
        bullets: [
          t("Entry 3-Switch @ 6\" W of NE corner at " + fmtIn(48 + off()) + " (#9 · 15A BRN115AF · 14/2 — immediately on your right entering from the 29-1/2\" East-wall Hallway opening) controlling Ceiling Light, Sink Pendants (75\"/99\" W), and Under-Cabinet LEDs.", "3-Apagadores @ 6\" O de la esquina NE a " + fmtIn(48 + off()) + " (#9 · 15A BRN115AF · 14/2 — justo a la derecha al entrar por el vano Este de 29-1/2\" desde el Pasillo) para Luz Central, Colgantes (75\"/99\" O) y LEDs Bajo Gabinete.", "Тройной выключатель @ 6\" З от угла СВ на " + fmtIn(48 + off()) + " (#9 · 15A BRN115AF · 14/2 — сразу справа при входе из коридора через восточный проём 29-1/2\")."),
          t("Protect intact 9-1/2\" baseboard and 103\" high picture rail.", "Proteger zoclo original de 9-1/2\" y riel superior de 103\".", "Сохранить оригинальный плинтус 9-1/2\" и верхний карниз 103\".")
        ]
      },
      dining: {
        title: t("Dining Room — 20-Space Subpanel, Reused Lights & Outlets (#10 New Only)", "Comedor — Subpanel de 20 Espacios, Luces Reusadas y Contactos", "Столовая — 20-местный субщиток, родной свет и розетки"),
        photo: "",
        bullets: [
          t("Subpanel Eaton BRP20L125G (125A main-lug, 20 spaces) @ X=147\", Y=213.75\" opens East into Dining: keep 30\"W × 36\"D × 78\"H clear (SFEC 110.26(A)(3)) and put ZERO outlets on the Panel wall.", "Subpanel Eaton BRP20L125G (20 espacios) @ X=147\", Y=213.75\" abre al Este al Comedor: mantener 30\"×36\"×78\" libres y CERO contactos en el muro del Panel.", "Субщиток Eaton BRP20L125G (20 мест) открывается в столовую: свободная зона 30\"×36\"×78\", БЕЗ розеток на стене щитка."),
          t("Reused existing Dining outlets & original Dining ceiling light/switch stay on the Existing Panel (taking 0 spaces on this subpanel). Only newly added 12/2 outlet drops land on #10; zero boxes inside ~33\" D03 pocket-door cavities.", "Los contactos existentes reusados y la luz/apagador originales del Comedor quedan en el Panel Existente (0 espacios en este subpanel). Solo contactos nuevos 12/2 van a #10; cero cajas en cavidades ~33\" de puertas corredizas.", "Сохраняемые розетки и родной свет/выключатель столовой остаются на существующем щите (0 мест в субщитке). Только новые линии 12/2 идут на #10.")
        ]
      },
      bathroom: {
        title: t("Bathroom (72-1/8\" × 82-1/8\") — All-in-One #13 (100% 12/2) & Outward Door", "Baño (72-1/8\" × 82-1/8\") — Todo-en-Uno #13 (100% 12/2) y Puerta Abatible", "Ванная (72-1/8\" × 82-1/8\") — линия #13 (100% 12/2) и распашная дверь"),
        photo: "",
        bullets: [
          t("Pocket door permanently RETIRED (Nov 24): standard hinged 28\" × 1-3/8\" door swings outward into hallway; South stud wall permits active Bath Switches.", "Puerta corrediza RETIRADA definitivamente (24 nov): puerta abatible 28\" × 1-3/8\" abre hacia el pasillo; muro Sur de postes permite apagadores.", "Кассетная дверь отменена (24 нояб.): распашная дверь 28\" наружу в коридор; выключатели на южной каркасной стене."),
          t("ALL branches from Bath J-Box (#13 · 20A BRN120DF) MUST be 12/2 Yellow (Vanity GFCI 40\"–44\", Vanity Light, Damp/Wet Bath Light, Humidity Fan, plus a SEPARATE pre-tile 12/2 Toilet drop @ 12\" AFF for future #19 bidet split).", "TODOS los ramales desde Caja Baño (#13 · 20A BRN120DF) DEBEN ser 12/2 Amarillo (incluyendo bajada 12/2 SEPARADA pre-azulejo al Inodoro a 12\" AFF para futuro bidet en #19).", "ВСЕ ответвления от Bath J-Box (#13 · 20A BRN120DF) — строго 12/2 (включая отдельный спуск 12/2 к унитазу 12\" до укладки плитки под резерв #19).")
        ]
      },
      laundry: {
        title: t("Laundry Closet — East Wall Duplex #14 @ 38\" AFF (LG WashTower)", "Clóset Lavandería — Toma Doble #14 Muro Este @ 38\" AFF (LG WashTower)", "Прачечная — двойная розетка #14 на восточной стене @ 38\""),
        photo: "",
        bullets: [
          t("Single 20A TR duplex (#14 · 12/2 · BRN120DF reset at Subpanel) on East/Right wall at " + fmtIn(38 + off()) + " feeds both 120V plugs of LG WKG101HVA gas WashTower, clearing the 8-1/4\" Murphy bookcase door.", "1 toma doble 20A TR (#14 · 12/2 · reset GFCI en Subpanel) en muro Este a " + fmtIn(38 + off()) + " recibe ambos cables 120V del LG WKG101HVA, librando las 8-1/4\" de la puerta Murphy.", "Одна двойная розетка 20A TR (#14 · 12/2 · сброс GFCI в субщитке) на восточной стене @ " + fmtIn(38 + off()) + " для обеих вилок 120V LG WKG101HVA."),
          t("Closet light stays off #14 (reuses existing light if present, or taps #16 15A utility lighting right above — 0 extra subpanel spaces).", "La luz del clóset nunca va en #14 (reusa luz existente o toma #16 15A de utilidad arriba — 0 espacios extra en subpanel).", "Свет прачечной не подключается к #14 (сохраняется существующий или запитывается от сервисной линии #16 сверху — 0 лишних мест в субщитке).")
        ]
      },
      bedroom: {
        title: t("Bedroom — Dark Horizontal Outlets, Reused Light & Open Temp Closet", "Recámara — Placas Horizontales Oscuras, Luz Reusada y Clóset Temporal", "Спальня — тёмные гориз. розетки, родной свет и временный люк шкафа"),
        photo: "",
        bullets: [
          t("Bed 1–5 outlets at " + fmtIn(11.5 + off()) + " (dark horizontal plates clearing 9-1/2\" baseboard & 13-1/2\" lower trim frames): reused outlets stay on Existing Panel (0 subpanel spaces); newly added 12/2 drops land on #10 (split-ready to Spare #11).", "Contactos Rec 1–5 a " + fmtIn(11.5 + off()) + " (placas horizontales oscuras): los reusados quedan en el Panel Existente (0 espacios en subpanel); bajadas nuevas 12/2 van a #10 (divisible a Reserva #11).", "Розетки спальни 1–5 на " + fmtIn(11.5 + off()) + " (тёмные горизонтальные рамки): сохраняемые остаются на старом щите, новые линии 12/2 — на #10."),
          t("Original Bedroom ceiling light & entry switch stay on Existing Panel (0 subpanel spaces). Keep NW Temp Closet ceiling OPEN until LV switch wire reaches attic, Door 4 hatch is framed, and furnace passage clears.", "La luz y apagador originales quedan en su Panel Existente (0 espacios). Mantener ABIERTO el techo del Clóset Temporal hasta pasar cable BV, enmarcar escotilla Puerta 4 y librar paso del calefactor.", "Родной свет и выключатель остаются на существующем щите. Потолок временного шкафа не зашивать до вывода слаботочки и монтажа люка у двери 4.")
        ]
      },
      living: {
        title: t("Living Room & Hallway — Reused Switches/Lights & Pocket-Door Hold", "Sala y Pasillo — Apagadores/Luces Reusados y Pausa Puertas Corredizas", "Гостиная и коридор — сохранение родного света/выключателей"),
        photo: "",
        bullets: [
          t("Original switches, 3-way hallway travelers, and ceiling lights stay intact on Existing Panel (0 subpanel spaces). Smoke & CO alarms use listed 10-year sealed-battery units (zero ceiling 14/3 pulls).", "Los apagadores originales, 3-vías del pasillo y luces de techo permanecen intactos en el Panel Existente (0 espacios en subpanel). Detectores Humo/CO de batería sellada 10 años (cero cableado 14/3).", "Родные выключатели, проходные переключатели коридора и люстры остаются на существующем щите (0 мест в субщитке). Датчики дыма/CO автономные на 10 лет."),
          t("Reused Living receptacles stay on Existing Panel; newly added 12/2 outlets (such as Hall H1 @ " + fmtIn(18 + off()) + " between Bath & Murphy doors) land on #10. ZERO boxes inside ~33\" L02 pocket-door cavities.", "Contactos reusados de Sala quedan en el Panel Existente; tomas nuevas 12/2 (como Pasillo H1 @ " + fmtIn(18 + off()) + ") van a #10. CERO cajas en cavidades ~33\" de puertas corredizas L02.", "Сохраняемые розетки гостиной остаются на старом щите; новые точки 12/2 (включая H1 в коридоре) — на #10. Без коробок в кассетах дверей ~33\".")
        ]
      }
    };

    var cur = cards[w] || cards.east;
    return '<div class="u4h-card">' +
      '<h3 style="margin:0 0 8px;font-size:15px;">' + esc(cur.title) + '</h3>' +
      (cur.photo ? '<img src="' + cur.photo + '" alt="' + esc(cur.title) + '" style="width:100%;max-height:240px;object-fit:cover;border-radius:8px;margin-bottom:10px;border:1px solid var(--rule);"/>' : '') +
      '<ul class="u4h-StatusList">' +
        cur.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join("") +
      '</ul>' +
    '</div>';
  }

  function render() {
    var host = document.getElementById("u4HumanGuide");
    if (!host) return;

    var stepIdx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (stepIdx < 0) { stepIdx = 0; state.step = STEPS[0].id; }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(t(s.en, s.es, s.ru)) + '</button>';
      }).join("") +
    '</div>';

    var title = t("Whole-Unit Electrical Map (Rev R8 · 14 New + 6 Open Spares)", "Mapa Eléctrico Unidad 4 (Rev R8 · 14 Nuevos + 6 Reservas)", "План электрики квартиры 4 (Rev R8 · 14 новых + 6 резервов)");
    var sub = t("Reused room lights, switches & outlets stay on Existing Panel (0 subpanel spaces) · 10-yr sealed-battery Smoke/CO", "Luces, apagadores y contactos reusados quedan en Panel Existente (0 espacios en subpanel) · Humo/CO batería 10 años", "Сохраняемый свет, выключатели и розетки остаются на старом щите (0 мест в субщитке) · Автономные датчики 10 лет");
    var inner = "";

    if (state.step === "outlets") {
      var sel = CIRCUITS.find(function (c) { return c.id === state.selectedCircuit; }) || CIRCUITS[0];
      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi"><div class="u4h-kpi-lbl">' + esc(t("Subpanel Used", "Subpanel Usado", "Занято в субщитке")) + '</div><div class="u4h-kpi-val is-ok">14 / 20</div><div class="u4h-kpi-sub">#1–#10, #13–#16</div></div>' +
          '<div class="u4h-kpi"><div class="u4h-kpi-lbl">' + esc(t("Open Spares", "Reservas Libres", "Свободный резерв")) + '</div><div class="u4h-kpi-val is-info">6 Spares</div><div class="u4h-kpi-sub">#11, #12, #17–#20</div></div>' +
          '<div class="u4h-kpi"><div class="u4h-kpi-lbl">' + esc(t("Counter Outlets", "Altura Cubierta", "Высота фартука")) + '</div><div class="u4h-kpi-val is-info">' + fmtIn(state.counterH + off()) + '</div><div class="u4h-kpi-sub">' + esc(state.floorDown ? t("Finished floor", "Piso terminado", "Чистовой пол") : t("Bare subfloor (+3/4\")", "Subpiso (+3/4\")", "Черновой пол (+3/4\")")) + '</div></div>' +
        '</div>' +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + esc(t("Map View:", "Vista del Mapa:", "Вид плана:")) + '</span>' +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.mapMode === "unit" ? " is-active" : "") + '" data-mmode="unit">' + esc(t("Whole-Unit 1:1 Map", "Toda la Unidad 1:1", "Вся квартира 1:1")) + '</button>' +
              '<button type="button" class="u4h-pill' + (state.mapMode === "kitchen" ? " is-active" : "") + '" data-mmode="kitchen">' + esc(t("Kitchen 1:1 Zoom (#1–#9)", "Zoom Cocina 1:1 (#1–#9)", "Кухня крупно 1:1 (#1–#9)")) + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + esc(t("Floor Datum:", "Referencia Piso:", "Уровень пола:")) + '</span>' +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (!state.floorDown ? " is-active" : "") + '" data-fl="bare">' + esc(t("Bare Subfloor (+3/4\")", "Subpiso (+3/4\")", "Черновой (+3/4\")")) + '</button>' +
              '<button type="button" class="u4h-pill' + (state.floorDown ? " is-active" : "") + '" data-fl="done">' + esc(t("Finished Floor", "Piso Terminado", "Чистовой пол")) + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="u4h-svg-wrap">' + (state.mapMode === "unit" ? renderWholeUnitMapSvg() : renderKitchenPlanSvg()) + '</div>' +
        '<div class="u4h-item-card is-selected">' +
          '<div class="u4h-item-main">' +
            '<div class="u4h-item-name">#' + sel.sp + ' · ' + esc(t(sel.en, sel.es, sel.ru)) + '</div>' +
            '<div class="u4h-item-meta">' + esc(sel.st + " · " + sel.amp + " · " + sel.cat + " · " + sel.wire) + '</div>' +
            '<div class="u4h-item-note">' + esc(t(sel.routeEn, sel.routeEs, sel.routeRu)) + '</div>' +
          '</div>' +
        '</div>';

    } else if (state.step === "walls") {
      title = t("Room-by-Room Details & Real Site Photos", "Detalles por Cuarto y Fotos Reales", "Детали по комнатам и фото объекта");
      sub = t("Pick any room or kitchen wall to verify box stations, heights, and Existing Panel vs. New Subpanel rules", "Elige cualquier cuarto o muro de cocina para ver alturas y qué queda en el Panel Existente vs. Subpanel Nuevo", "Выберите комнату или стену кухни для проверки высот и разделения старого и нового щитков");
      inner =
        '<div class="u4h-controls"><div class="u4h-ctrl-row">' +
          '<span class="u4h-ctrl-lbl">' + esc(t("Room / Wall:", "Cuarto / Muro:", "Комната / стена:")) + '</span>' +
          '<div class="u4h-pill-group">' +
            [
              ["east",     t("Kitchen East", "Cocina Este", "Кухня В")],
              ["south",    t("Kitchen South", "Cocina Sur", "Кухня Ю")],
              ["west",     t("Kitchen West", "Cocina Oeste", "Кухня З")],
              ["north",    t("Kitchen North", "Cocina Norte", "Кухня С")],
              ["dining",   t("Dining & Subpanel", "Comedor y Subpanel", "Столовая и щиток")],
              ["bathroom", t("Bathroom #13", "Baño #13", "Ванная #13")],
              ["laundry",  t("Laundry #14", "Lavandería #14", "Прачечная #14")],
              ["bedroom",  t("Bedroom", "Recámara", "Спальня")],
              ["living",   t("Living & Hall", "Sala y Pasillo", "Гостиная и кор.")]
            ].map(function (w) {
              return '<button type="button" class="u4h-pill' + (state.wallTab === w[0] ? " is-active" : "") + '" data-wtab="' + w[0] + '">' + esc(w[1]) + '</button>';
            }).join("") +
          '</div>' +
        '</div></div>' +
        renderWallDetail();

    } else if (state.step === "panel") {
      title = t("Eaton BRP20L125G Subpanel — 14 New Circuits + 6 Open Spares", "Subpanel Eaton BRP20L125G — 14 Circuitos Nuevos + 6 Reservas", "Субщиток Eaton BRP20L125G — 14 новых линий + 6 резервов");
      sub = t("Reused circuits stay on Existing Panel (0 spaces used here) · #11, #12 & #17–#20 are Open Spares · #10 feeds newly pulled common-room outlets only", "Circuitos reusados quedan en su Panel Existente (0 espacios aquí) · #11, #12 y #17–#20 Libres · #10 solo contactos nuevos", "Сохраняемые линии остаются на существующем щите (0 мест здесь) · #11, #12 и #17–#20 свободны · #10 только новые розетки");
      var list = CIRCUITS.filter(function (c) {
        if (state.panelFilter === "all") return true;
        return c.grp === state.panelFilter;
      });
      inner =
        '<div class="u4h-controls"><div class="u4h-ctrl-row">' +
          '<span class="u4h-ctrl-lbl">' + esc(t("Filter:", "Filtrar:", "Фильтр:")) + '</span>' +
          '<div class="u4h-pill-group">' +
            [
              ["all",     t("All 20 Spaces", "Todos (20)", "Все 20 мест")],
              ["kitchen", t("Kitchen (#1–#9)", "Cocina (#1–#9)", "Кухня (#1–#9)")],
              ["unit",    t("New Unit Circuits (#10, #13–#16)", "Nuevos Unidad (#10, #13–#16)", "Новые по квартире (#10, #13–#16)")],
              ["spare",   t("6 Open Spares (#11, #12, #17–#20)", "6 Reservas (#11, #12, #17–#20)", "6 резервов (#11, #12, #17–#20)")]
            ].map(function (f) {
              return '<button type="button" class="u4h-pill' + (state.panelFilter === f[0] ? " is-active" : "") + '" data-pfilt="' + f[0] + '">' + esc(f[1]) + '</button>';
            }).join("") +
          '</div>' +
        '</div></div>' +
        '<div class="u4h-item-list">' +
          list.map(function (c) {
            return '<div class="u4h-item-card' + (state.selectedCircuit === c.id ? " is-selected" : "") + '" data-cir="' + c.id + '" style="cursor:pointer">' +
              '<div class="u4h-item-main">' +
                '<div class="u4h-item-name">#' + c.sp + ' — ' + esc(t(c.en, c.es, c.ru)) + '</div>' +
                '<div class="u4h-item-meta">' + esc(c.amp + " · " + c.cat + " · " + c.wire) + '</div>' +
                '<div class="u4h-item-note">' + esc(t(c.routeEn, c.routeEs, c.routeRu)) + '</div>' +
              '</div>' +
              '<span class="u4h-badge' + (c.grp === "kitchen" ? " is-locked" : "") + '">' + esc(c.st) + '</span>' +
            '</div>';
          }).join("") +
        '</div>';

    } else if (state.step === "attic-runs") {
      title = t("Attic & Ceiling Homeruns — New Subpanel Circuits Only", "Rutas en Ático y Techo — Solo Circuitos Nuevos del Subpanel", "Чердачные трассы — только новые линии субщитка");
      sub = t("24\"×36\" Hatch outside Door 4 · 24\" walkway to Furnace #15 & GFCI #16 · Reused lights/outlets stay on Existing Panel (0 attic pulls here)", "Escotilla 24\"×36\" afuera Puerta 4 · Pasillo 24\" a Calefactor #15 y Toma #16 · Luces/contactos reusados quedan en Panel Existente", "Люк 24\"×36\" у двери 4 · Мостки 24\" к печи #15 и розетке #16 · Сохраняемые линии остаются на старом щите");
      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + esc(t("Filter group:", "Filtrar grupo:", "Фильтр:")) + '</span>' +
            '<div class="u4h-pill-group">' +
              [
                ["all",     t("All Attic Runs", "Todas", "Все трассы")],
                ["kitchen", t("Kitchen (#3, #7–#9)", "Cocina (#3, #7–#9)", "Кухня (#3, #7–#9)")],
                ["attic",   t("Attic / Furnace (#15, #16)", "Ático / Calefactor (#15, #16)", "Чердак / Печь (#15, #16)")],
                ["bath",    t("Bath / Laundry (#13, #14)", "Baño / Lav. (#13, #14)", "Ванная / Прач. (#13, #14)")],
                ["common",  t("New #10 Outlet Drops", "Bajadas Nuevas #10", "Новые розетки #10")]
              ].map(function (f) {
                return '<button type="button" class="u4h-pill' + (state.atticFilter === f[0] ? " is-active" : "") + '" data-afilt="' + f[0] + '">' + esc(f[1]) + '</button>';
              }).join("") +
            '</div>' +
          '</div>' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + esc(t("Hatch Switch:", "Apagador Escotilla:", "Выключатель люка:")) + '</span>' +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.atticSwitchOpt === "optA" ? " is-active" : "") + '" data-asw="optA">' + esc(t("Option A: Landing Wall", "Opción A: Muro Descanso", "Вариант A: стена площадки")) + '</button>' +
              '<button type="button" class="u4h-pill' + (state.atticSwitchOpt === "optB" ? " is-active" : "") + '" data-asw="optB">' + esc(t("Option B: Inside 2× Curb", "Opción B: Marco 2×", "Вариант B: внутри короба 2×")) + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="u4h-svg-wrap">' + renderAtticMapSvg() + '</div>';

    } else if (state.step === "attic-guide") {
      title = t("Attic J-Box, Flat-Roof & Protection Rules", "Reglas de Cajas en Ático, Techo Plano y Protección", "Правила коробок чердака и плоской крыши");
      sub = t("Keep all J-Boxes accessible above insulation · Zero screws into flat roof deck · 72\" guard strips at Door 4 Hatch", "Cajas accesibles sobre aislamiento · Cero tornillos al techo plano · Listones a 72\" de Escotilla Puerta 4", "Коробки выше утеплителя · Без саморезов в настил крыши · Планки 72\" у люка двери 4");
      inner =
        '<div class="u4h-card"><ul class="u4h-StatusList">' +
          '<li><strong>' + esc(t("NEC 320.23(A) — 72\" Hatch Guard Zone:", "NEC 320.23(A) — Zona 72\" Escotilla:", "NEC 320.23(A) — Зона 72\" у люка:")) + '</strong> ' + esc(t("Protect any NM-B cable within 6 ft (72\") of the outside-Door-4 24\"×36\" hatch edge with wood guard strips along joists, and never trap cable under the 24\" OSB walkway.", "Proteger cualquier cable NM-B dentro de 72\" de la escotilla 24\"×36\" con listones de madera y nunca atrapar cable bajo el pasillo OSB de 24\".", "Защитить кабели NM-B в радиусе 72\" от люка 24\"×36\" деревянными планками; не зажимать под настилом 24\".")) + '</li>' +
          '<li><strong>' + esc(t("Flat Roof Deck Protection (#16):", "Protección Techo Plano (#16):", "Плоская крыша (#16):")) + '</strong> ' + esc(t("Mount both enclosed attic LEDs on horizontal 2×4 rafter blocking >=1-1/2\" below the flat roof deck — ZERO screws upward into roofing membrane.", "Montar los 2 LEDs cerrados sobre bloqueo 2×4 >=1-1/2\" bajo la cubierta — CERO tornillos hacia la membrana del techo plano.", "Крепить оба закрытых LED на перемычках 2×4 >=1-1/2\" ниже настила — БЕЗ саморезов в кровлю.")) + '</li>' +
          '<li><strong>' + esc(t("Flagged Accessible Attic J-Boxes:", "Cajas Abanderadas en Ático:", "Флажки над коробками чердака:")) + '</strong> ' + esc(t("Mount 4-11/16\" × 2-1/8\" metal J-Boxes (Bath #13, plus New Outlets #10 if split) above insulation with blank covers and visible flags; max 2 cables per top-plate hole sealed with fire caulk.", "Montar cajas metálicas 4-11/16\" × 2-1/8\" sobre el aislamiento con tapa ciega y bandera visible; máx. 2 cables por perforación con sellador cortafuego.", "Металлические коробки 4-11/16\" × 2-1/8\" выше утеплителя с глухими крышками и флажками; макс. 2 кабеля в отверстие + огнезащитный герметик.")) + '</li>' +
        '</ul></div>';

    } else {
      title = t("Active Holds & 14-Breaker Subpanel Kit (Rev R8)", "Pausas Activas y Kit de 14 Interruptores (Rev R8)", "Активные паузы и комплект 14 автоматов (Rev R8)");
      sub = t("Confirm active holds before pulling interior wire · Reused circuits stay on Existing Panel (0 breakers needed here)", "Confirmar pausas antes de jalar cable · Los circuitos reusados quedan en su Panel Existente (0 interruptores aquí)", "Проверить паузы до протяжки · Сохраняемые линии остаются на существующем щите (0 автоматов здесь)");
      inner =
        '<div class="u4h-banner is-warn">' +
          '<strong>' + esc(t("Active Rough-In & Panel Holds:", "Pausas Activas de Obra y Subpanel:", "Активные паузы чернового монтажа:")) + '</strong>' +
          '<ul class="u4h-StatusList" style="margin-top:6px;">' +
            '<li>' + esc(t("Subpanel & Feeder Hold: Reconcile NEXT 80A/#4 vs. 100A/#3 feeder & side-entry notches before closing framing; zero screws 53\"–77\" AFF on Kitchen back.", "Pausa Subpanel y Alimentador: Conciliar NEXT 80A/#4 vs. 100A/#3 y muescas laterales antes de cerrar; cero tornillos 53\"–77\" AFF detrás en Cocina.", "Пауза щитка и ввода: согласовать ввод NEXT 80A/#4 или 100A/#3 и боковые вводы; без саморезов 53\"–77\" со стороны кухни.")) + '</li>' +
            '<li>' + esc(t("Non-Kitchen Wire-Pull Hold (6hvRcQ7Gmh3fG5m7): Do not pull wire through held ENT runs until owner/C-10 release (SFEC 334.10(2) permits concealed NM-B).", "Pausa Fuera de Cocina (6hvRcQ7Gmh3fG5m7): No jalar cable por tramos ENT en pausa hasta liberación con C-10.", "Пауза вне кухни (6hvRcQ7Gmh3fG5m7): не протягивать провод в гофре ENT до согласования с электриком C-10.")) + '</li>' +
            '<li>' + esc(t("Kitchen South Window CL (87\" vs. 90\" W) & Pre-Tile Toilet 12/2 Drop: Verify window CL before fastening S2 / DW-GD; pull separate 12/2 Toilet drop before bathroom wall tile.", "Eje Ventana Sur Cocina (87\" vs. 90\" O) y Bajada 12/2 Inodoro Pre-Azulejo: Verificar antes de fijar cajas o azulejar baño.", "Ось южного окна кухни (87\" и 90\") и отдельный спуск 12/2 к унитазу до плитки.")) + '</li>' +
            '<li>' + esc(t("Smoke & CO Alarms: Listed 10-year sealed-battery units (CRC R314.2.2 / R315.2.2 existing-dwelling exceptions — zero hardwired 14/3 ceiling pulls).", "Detectores Humo y CO: Unidades selladas de batería 10 años (cero cableado 14/3 en techo).", "Датчики дыма и CO: сертифицированные автономные с 10-летней батареей (без потолочной проводки 14/3).")) + '</li>' +
          '</ul>' +
        '</div>' +
        '<div class="u4h-card"><h3 style="margin:0 0 8px;font-size:15px;">' + esc(t("Eaton BR 14-Breaker Kit (6 Open Spares #11, #12, #17–#20)", "Kit de 14 Interruptores Eaton BR (6 Reservas #11, #12, #17–#20)", "Комплект 14 автоматов Eaton BR (6 резервов #11, #12, #17–#20)")) + '</h3>' +
          '<ul class="u4h-StatusList">' +
            '<li><strong>7× Eaton BRN120DF</strong> — 20A Dual-Function AFCI/GFCI (#1, #2, #3, #4, #5, #13, #14)</li>' +
            '<li><strong>3× Eaton BRN115DF</strong> — 15A Dual-Function AFCI/GFCI (#6 Disposal, #7 Range, #16 Attic Service GFCI & LEDs)</li>' +
            '<li><strong>1× Eaton BRN120AF</strong> — 20A AFCI (#10 Newly Added Common-Room Outlets Only)</li>' +
            '<li><strong>2× Eaton BRN115AF + 1× BRLW1</strong> — 15A AFCI (#8 Hood w/ lock-off, #9 Kitchen Lights)</li>' +
            '<li><strong>1× Eaton BR115</strong> — 15A Standard Thermal-Magnetic (#15 Attic Furnace F1)</li>' +
          '</ul>' +
        '</div>';
    }

    var prevDisabled = stepIdx <= 0 ? " disabled" : "";
    var nextHidden = stepIdx >= STEPS.length - 1 ? ' style="visibility:hidden"' : "";

    host.innerHTML =
      stepPills +
      '<div class="u4h-head"><h2 class="u4h-title">' + esc(title) + '</h2><p class="u4h-sub">' + esc(sub) + '</p></div>' +
      inner +
      '<div class="u4h-pager">' +
        '<button type="button" class="u4h-btn" data-nav="-1"' + prevDisabled + '>' + esc(t("← Prev", "← Ant.", "← Назад")) + '</button>' +
        '<span class="u4h-step-count">' + esc(t("Step " + (stepIdx + 1) + " of " + STEPS.length, "Paso " + (stepIdx + 1) + " de " + STEPS.length, "Шаг " + (stepIdx + 1) + " из " + STEPS.length)) + '</span>' +
        '<button type="button" class="u4h-btn is-primary" data-nav="1"' + nextHidden + '>' + esc(t("Next →", "Sig. →", "Далее →")) + '</button>' +
      '</div>';
  }

  function wireEvents() {
    var host = document.getElementById("u4HumanGuide");
    if (!host) return;
    host.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-step],[data-nav],[data-mmode],[data-fl],[data-wtab],[data-pfilt],[data-afilt],[data-asw],[data-cir]");
      if (!btn) return;
      if (btn.hasAttribute("data-step")) {
        state.step = btn.getAttribute("data-step");
        window.scrollTo(0, 0);
      } else if (btn.hasAttribute("data-nav")) {
        var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
        var nxt = idx + parseInt(btn.getAttribute("data-nav"), 10);
        if (nxt >= 0 && nxt < STEPS.length) {
          state.step = STEPS[nxt].id;
          window.scrollTo(0, 0);
        }
      } else if (btn.hasAttribute("data-mmode")) {
        state.mapMode = btn.getAttribute("data-mmode");
      } else if (btn.hasAttribute("data-fl")) {
        state.floorDown = btn.getAttribute("data-fl") === "done";
      } else if (btn.hasAttribute("data-wtab")) {
        state.wallTab = btn.getAttribute("data-wtab");
      } else if (btn.hasAttribute("data-pfilt")) {
        state.panelFilter = btn.getAttribute("data-pfilt");
      } else if (btn.hasAttribute("data-afilt")) {
        state.atticFilter = btn.getAttribute("data-afilt");
      } else if (btn.hasAttribute("data-asw")) {
        state.atticSwitchOpt = btn.getAttribute("data-asw");
      } else if (btn.hasAttribute("data-cir")) {
        state.selectedCircuit = btn.getAttribute("data-cir");
      }
      render();
    });
  }

  function boot() {
    var shell = document.querySelector("main.page-shell");
    var header = document.querySelector("header.page-header");
    if (header) header.style.display = "none";
    if (shell) shell.style.display = "none";

    var wrap = document.getElementById("u4HumanShell");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "u4HumanShell";
      wrap.className = "u4h-wrap";
      wrap.innerHTML =
        '<header class="u4h-topbar">' +
          '<div class="u4h-top-left">' +
            '<a class="u4h-back" href="../../index.html#electrical" id="u4hBackLink">← Electrical</a>' +
          '</div>' +
          '<div class="u4h-top-right">' +
            '<div class="u4-lang-seg" role="radiogroup" aria-label="Language">' +
              '<button type="button" class="u4-lang-btn" data-lang-pick="en" role="radio" aria-checked="true">EN</button>' +
              '<button type="button" class="u4-lang-btn" data-lang-pick="es" role="radio" aria-checked="false">ES</button>' +
              '<button type="button" class="u4-lang-btn" data-lang-pick="ru" role="radio" aria-checked="false">RU</button>' +
            '</div>' +
            '<button type="button" class="u4h-btn" id="u4hPrintBtn">Print / PDF</button>' +
          '</div>' +
        '</header>' +
        '<main id="u4HumanGuide" class="u4h-stage"></main>';
      document.body.insertBefore(wrap, document.body.firstChild);

      wrap.addEventListener("click", function (ev) {
        var lbtn = ev.target.closest("[data-lang-pick]");
        if (lbtn) {
          var l = lbtn.getAttribute("data-lang-pick");
          state.lang = l;
          document.documentElement.setAttribute("data-u4-lang", l);
          document.documentElement.lang = l;
          syncTopChrome();
          render();
          return;
        }
        if (ev.target.closest("#u4hPrintBtn")) {
          window.print();
        }
      });
    }

    state.lang = getLang();
    document.documentElement.setAttribute("data-u4-lang", state.lang);
    syncTopChrome();
    wireEvents();
    render();

    var obs = new MutationObserver(function () {
      var cur = getLang();
      if (cur !== state.lang) {
        state.lang = cur;
        syncTopChrome();
        render();
      }
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-u4-lang", "lang"] });
  }

  function syncTopChrome() {
    var l = getLang();
    var back = document.getElementById("u4hBackLink");
    if (back) {
      back.textContent = t("← Electrical", "← Electricidad", "← Электрика");
      back.href = "../../index.html?lang=" + encodeURIComponent(l) + "#electrical";
    }
    var pr = document.getElementById("u4hPrintBtn");
    if (pr) pr.textContent = t("Print / PDF", "Imprimir / PDF", "Печать / PDF");
    var btns = document.querySelectorAll("[data-lang-pick]");
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute("data-lang-pick") === l;
      btns[i].classList.toggle("is-active", on);
      btns[i].setAttribute("aria-checked", on ? "true" : "false");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
