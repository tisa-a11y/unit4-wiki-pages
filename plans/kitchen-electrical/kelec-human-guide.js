/* ============================================================================
   Unit 4 Whole-Unit Electrical (Rev R6) — True 1:1 Human-First Interactive Guide
   15 Active Circuits (#1–#10, #12–#16) + 5 Open Spares (#11, #17–#20)
   True 1:1 Unit 4 Geometry (508" x 298", North UP) · Zero Prices · EN / ES / RU
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "outlets",     en: "1. Unit & Kitchen Map",  es: "1. Mapa Unidad y Cocina", ru: "1. План квартиры и кухни" },
    { id: "walls",       en: "2. Room Elevations",     es: "2. Muros por Cuarto",     ru: "2. Развёртки комнат" },
    { id: "panel",       en: "3. Panel (15 + 5)",      es: "3. Panel (15 + 5)",       ru: "3. Щиток (15 + 5)" },
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
      en: "Kitchen Lights (Entry 3-Switch @ 35.5\" W of NE -> Ceiling, Pendants 75/99\", Under-Cab)",
      es: "Luces Cocina (3-Apagadores @ 35.5\" O de NE -> Techo, Colgantes 75/99\", Bajo Gab.)",
      ru: "Свет кухни (тройной выкл. @ 35.5\" З от СВ -> потолок, подвесы 75/99\", подсветка)",
      routeEn: "Attic to North Entry 3-Switch (48\" AFF) & ceiling fixtures",
      routeEs: "Por ático a 3-Apagadores Entrada Norte (48\" AFF) y techo",
      routeRu: "Через чердак к северному входу (48\" от пола) и потолку" },
    { sp: 10, id: "COMMON-R", grp: "unit", st: "REUSE+NEW", amp: "20A*", cat: "BRN120AF (15A if 14 AWG)", wire: "12/2* Reuse+New",
      en: "Living, Dining, Bedroom & Hall Outlets (Reuse + New · Verify w/ C-10)",
      es: "Contactos Sala, Comedor, Recámara y Pasillo (Reuso + Nuevo · C-10)",
      ru: "Розетки гостиной, столовой, спальни и коридора (повторное использование + новые · C-10)",
      routeEn: "Dining 1–4 & Living 1–5 (18\" AFF), Hall 1 (18\"), Bed 1–5 (11.5\" dark horiz.) via J-Boxes; NO D5 on Panel wall; D6/L6 pocket hold",
      routeEs: "Comedor 1–4 y Sala 1–5 (18\" AFF), Pasillo 1 (18\"), Rec. 1–5 (11.5\" horiz. oscuro) vía Cajas; SIN D5 en Panel; pausa D6/L6",
      routeRu: "Dining 1–4 и Living 1–5 (18\"), Hall 1 (18\"), Bed 1–5 (11.5\" гориз. тёмные); без D5 на стене щитка; пауза D6/L6" },
    { sp: 11, id: "SPARE-11", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Future Bedroom / Room Split",
      es: "Reserva Libre — División Futura Recámara / Cuartos",
      ru: "Свободный резерв — будущее выделение спальни / комнат",
      routeEn: "Split-ready from flagged Bed/Hall Attic J-Box (zero drywall demo)",
      routeEs: "Lista para dividir desde Caja Ático Recámara/Pasillo sin romper tablaroca",
      routeRu: "Готово к отделению от чердачной коробки Bed/Hall без вскрытия ГКЛ" },
    { sp: 12, id: "COMMON-L", grp: "unit", st: "REUSE+NEW", amp: "15A", cat: "BRN115AF", wire: "14/2 + 14/3",
      en: "Common-Room Lights (Living, Dining, Bedroom, 2× Hall 3-Way, Laundry)",
      es: "Luces Cuartos Comunes (Sala, Comedor, Recámara, 2× 3-Vías Pasillo, Lavandería)",
      ru: "Освещение комнат (гостиная, столовая, спальня, 2× 3-Way коридор, прачечная)",
      routeEn: "Reuse sound + new via Lights J-Box · 14/3 Red travelers for 2× Hall 3-Way",
      routeEs: "Reuso sano + nuevo vía Caja Luces · 14/3 Rojo viajeras 3-vías Pasillo",
      routeRu: "Сохранение исправной + новые через Lights J-Box · 14/3 красный для 3-Way" },
    { sp: 13, id: "BATH", grp: "unit", st: "NEW", amp: "20A", cat: "BRN120DF", wire: "100% 12/2 Cu",
      en: "Bathroom All-in-One (Vanity, Sep. Pre-Tile Toilet Drop, Lights, Humidity Fan)",
      es: "Baño Todo-en-Uno (Lavabo, Bajada Sep. Inodoro Pre-Azulejo, Luces, Extractor)",
      ru: "Ванная (100% 12/2: раковина, отд. спуск WC до плитки, свет, вытяжка)",
      routeEn: "Via Bath J-Box · 100% 12/2 Yellow · pocket door RETIRED -> 28\" outward hall door; South stud switches OK",
      routeEs: "Vía Caja Baño · 100% 12/2 Amarillo · corrediza RETIRADA -> puerta 28\" afuera; apagadores muro Sur OK",
      routeRu: "Через Bath J-Box · 100% 12/2 · кассетная дверь отменена -> распашная 28\" наружу" },
    { sp: 14, id: "LAUN", grp: "unit", st: "NEW", amp: "20A", cat: "BRN120DF (Panel)", wire: "12/2 Cu",
      en: "Laundry WashTower (1× 20A Duplex East Wall @ 38\" AFF)",
      es: "Lavandería WashTower (1 Toma Doble 20A Muro Este @ 38\" AFF)",
      ru: "Прачечная LG WashTower (1× двойная 20A на восточной стене @ 38\")",
      routeEn: "Both 120V LG WKG101HVA plugs · clears 8-1/4\" Murphy bookcase door · Panel GFCI reset",
      routeEs: "Ambos enchufes 120V LG WKG101HVA · libra puerta Murphy 8-1/4\" · reset GFCI en Panel",
      routeRu: "Обе вилки 120V LG WKG101HVA · вне двери-стеллажа 8-1/4\" · сброс GFCI в щитке" },
    { sp: 15, id: "HVAC", grp: "unit", st: "NEW", amp: "15A", cat: "BR115", wire: "14/2 Cu",
      en: "Attic Furnace F1 + Local Disconnect Switch (174\", 258\")",
      es: "Calefactor Ático F1 + Desconectador Local (174\", 258\")",
      ru: "Чердачная печь F1 + сервисный выключатель (174\", 258\")",
      routeEn: "Dedicated 14/2 run from Panel riser directly to F1 platform",
      routeEs: "Línea 14/2 dedicada desde subida del Panel hasta plataforma F1",
      routeRu: "Выделенная линия 14/2 от щитка напрямую к площадке F1" },
    { sp: 16, id: "ATTIC-SMK", grp: "unit", st: "NEW", amp: "15A", cat: "BRN115AF (AFCI-ONLY!)", wire: "14/2 + 14/3",
      en: "Attic Light/GFCI (LINE-Only) + Unswitched Smoke/CO Interconnect",
      es: "Luz/GFCI Ático (Solo LINE) + Humo/CO Directo 14/3 Rojo",
      ru: "Свет/GFCI чердака (LINE-only) + неотключаемые датчики дыма/CO (14/3)",
      routeEn: "NEVER GFCI breaker! Unswitched 14/2->14/3 to Hall/Bed/Liv Smoke/CO · 2× LEDs on 2×4 blocking >=1.5\" below deck",
      routeEs: "¡NUNCA breaker GFCI! 14/2->14/3 directo a Humo/CO Pasillo/Rec/Sala · 2 LEDs en bloqueo 2×4 >=1.5\" bajo techo",
      routeRu: "Никогда не GFCI-автомат! Прямой 14/2->14/3 к датчикам дыма/CO · 2 LED на перемычках 2×4" },
    { sp: 17, id: "SPARE-17", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Future Living / Dining Split",
      es: "Reserva Libre — División Futura Sala / Comedor",
      ru: "Свободный резерв — будущее разделение гостиной / столовой",
      routeEn: "Split-ready from Living/Dining Attic J-Box",
      routeEs: "Lista desde Caja Ático Sala/Comedor",
      routeRu: "Готово из чердачной коробки Living/Dining" },
    { sp: 18, id: "SPARE-18", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Future Room Split",
      es: "Reserva Libre — División Futura",
      ru: "Свободный резерв — будущее разделение",
      routeEn: "Open full-size panel space",
      routeEs: "Espacio libre completo en panel",
      routeRu: "Свободное место в щитке" },
    { sp: 19, id: "SPARE-19", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Future Toilet Bidet Split",
      es: "Reserva Libre — División Futura Bidet Inodoro",
      ru: "Свободный резерв — будущее выделение биде унитаза",
      routeEn: "Zero-tile-demo split using separate Toilet 12/2 drop in Bath J-Box",
      routeEs: "División sin romper azulejo usando bajada 12/2 separada en Caja Baño",
      routeRu: "Разделение без демонтажа плитки через отдельный спуск 12/2 в Bath J-Box" },
    { sp: 20, id: "SPARE-20", grp: "spare", st: "SPARE", amp: "—", cat: "Open Spare", wire: "—",
      en: "Open Spare — Open Panel Space",
      es: "Reserva Libre — Espacio Libre",
      ru: "Свободный резерв — свободное место",
      routeEn: "Open full-size panel space",
      routeEs: "Espacio libre completo en panel",
      routeRu: "Свободное место в щитке" }
  ];

  var state = {
    step: "outlets",
    mapMode: "unit",        // "unit" | "kitchen"
    counterH: 44,           // 44 or 41
    floorDown: false,       // false = bare subfloor (+3/4"), true = finished floor
    wallTab: "south",       // east | south | west | north | dining | bathroom | laundry | bedroom | living
    selectedCircuit: "COMMON-R",
    panelFilter: "all",     // all | kitchen | unit | spare
    atticFilter: "all",     // all | kitchen | attic | bath | common
    atticSwitchOpt: "optA", // optA | optB
    equipOpen: true,
    holds: { h1: false, h2: false, h3: false, h4: false, h5: false }
  };

  function getLang() {
    return window.U4PlanNav && typeof window.U4PlanNav.getLang === "function" ? window.U4PlanNav.getLang() : "en";
  }

  function t(en, es, ru) {
    var l = getLang();
    if (l === "es") return es;
    if (l === "ru") return ru || en;
    return en;
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

  function syncUnderlyingPrint() {
    try {
      if (window.U4PLAN && typeof window.U4PLAN.setFloorCondition === "function") {
        window.U4PLAN.setFloorCondition(state.floorDown ? "finished_installed" : "bare_subfloor", 0.75);
      }
      if (window.U4PLAN && typeof window.U4PLAN.selectCircuit === "function") {
        window.U4PLAN.selectCircuit(state.selectedCircuit);
      }
    } catch (_) {}
  }

  // Canonical Unit 4 1:1 room polygons (X: 0..508" W->E, Y: 0..298" N->S, North UP)
  var U4_ROOMS = {
    door4:   [[66,34],[147,34],[147,108],[66,108]],
    kitchen: [[31.5,108],[147,108],[147,234.25],[0,234.25],[0,174.25],[31.5,174.25]],
    dining:  [[147,142],[293.7,142],[293.7,297.75],[147,297.75]],
    living:  [[293.7,142],[473.5,142],[508,178],[508,258],[473.5,297.75],[293.7,297.75]],
    hall:    [[147,58],[207,58],[207,88],[352,88],[352,142],[147,142]],
    bath:    [[207,0],[279.1,0],[279.1,88],[207,88]],
    laundry: [[279.1,5.4],[315.4,5.4],[315.4,88],[279.1,88]],
    bedroom: [[315.4,0],[437.5,0],[474,34],[474,96],[437.5,136],[352,136],[352,88],[315.4,88]]
  };

  function polyStr(pts, fx, fy) {
    return pts.map(function (p) { return fx(p[0]).toFixed(1) + "," + fy(p[1]).toFixed(1); }).join(" ");
  }

  function svgCompass(cx, cy) {
    var wLbl = t("W", "O", "З");
    return '<g transform="translate(' + cx + ',' + cy + ')">' +
      '<circle r="15" fill="#FFFFFF" stroke="#0F2537" stroke-width="1.3"/>' +
      '<polygon points="0,-11 3.5,-1 0,-3.5 -3.5,-1" fill="#DC2626"/>' +
      '<text x="0" y="-17" text-anchor="middle" font-size="8" font-weight="800" fill="#DC2626">N</text>' +
      '<text x="0" y="12" text-anchor="middle" font-size="7" font-weight="700" fill="#334155">S</text>' +
      '<text x="10" y="2.5" text-anchor="middle" font-size="7" font-weight="700" fill="#334155">E</text>' +
      '<text x="-10" y="2.5" text-anchor="middle" font-size="7" font-weight="700" fill="#334155">' + wLbl + '</text>' +
    '</g>';
  }

  function renderWholeUnitMapSvg() {
    var S = 1.12;
    var ox = 56, oy = 42;
    function ux(x) { return ox + x * S; }
    function uy(y) { return oy + y * S; }

    return '<svg viewBox="0 0 680 412" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      esc(t("True 1:1 Unit 4 Whole-Unit Electrical Map", "Mapa Eléctrico 1:1 de Toda la Unidad 4", "План электрики всей квартиры 1:1")) + '">' +
      '<rect x="0" y="0" width="680" height="412" fill="#F8FAFC" rx="8"/>' +
      '<text x="340" y="22" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0F2537">' +
        esc(t("TRUE 1:1 UNIT 4 ELECTRICAL MAP (508\" × 298\" · NORTH UP · 15 ACTIVE + 5 SPARES)",
              "MAPA ELÉCTRICO 1:1 UNIDAD 4 (508\" × 298\" · NORTE ARRIBA · 15 ACTIVOS + 5 RESERVAS)",
              "ПЛАН ЭЛЕКТРИКИ 1:1 КВАРТИРА 4 (508\" × 298\" · СЕВЕР ВВЕРХ · 15 АКТИВНЫХ + 5 РЕЗЕРВОВ)")) +
      '</text>' +
      svgCompass(646, 46) +

      // Canonical 1:1 Room Polygons
      '<polygon points="' + polyStr(U4_ROOMS.door4, ux, uy) + '" fill="#F1F5F9" stroke="#475569" stroke-width="1.6"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.kitchen, ux, uy) + '" fill="#FEF9C3" stroke="#B45309" stroke-width="2.2" data-cir="SA-A" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.dining, ux, uy) + '" fill="#E0F2FE" stroke="#0369A1" stroke-width="2" data-cir="COMMON-R" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.living, ux, uy) + '" fill="#E0F2FE" stroke="#0369A1" stroke-width="2" data-cir="COMMON-R" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.hall, ux, uy) + '" fill="#F8FAFC" stroke="#475569" stroke-width="1.6" data-cir="COMMON-L" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.bath, ux, uy) + '" fill="#DCFCE7" stroke="#15803D" stroke-width="2" data-cir="BATH" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.laundry, ux, uy) + '" fill="#FFEDD5" stroke="#C2410C" stroke-width="2" data-cir="LAUN" style="cursor:pointer"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.bedroom, ux, uy) + '" fill="#EEF2FF" stroke="#4338CA" stroke-width="2" data-cir="COMMON-R" style="cursor:pointer"/>' +

      // Door 4 Attic Hatch (24"x36" @ 112,74)
      '<rect x="' + ux(100).toFixed(1) + '" y="' + uy(56).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (36 * S).toFixed(1) + '" fill="#DCFCE7" stroke="#15803D" stroke-width="1.6" data-cir="ATTIC-SMK" style="cursor:pointer"/>' +
      '<text x="' + ux(112).toFixed(1) + '" y="' + uy(77).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-weight="800" fill="#166534">D4</text>' +
      '<text x="' + ux(106).toFixed(1) + '" y="' + uy(48).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#475569">' + esc(t("DOOR 4 HATCH", "ESCOTILLA P4", "ЛЮК D4")) + '</text>' +

      // Panel Eaton BRP20L125G @ X=147, Y=213.75 (faces East into Dining) + 30x36 clear zone
      '<rect x="' + ux(147).toFixed(1) + '" y="' + uy(198.75).toFixed(1) + '" width="' + (36 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.4" stroke-dasharray="3,2"/>' +
      '<rect x="' + (ux(147) - 4).toFixed(1) + '" y="' + uy(203).toFixed(1) + '" width="8" height="' + (22 * S).toFixed(1) + '" fill="#DC2626"/>' +
      '<text x="' + ux(166).toFixed(1) + '" y="' + uy(217).toFixed(1) + '" text-anchor="middle" font-size="7.4" font-weight="800" fill="#991B1B">PANEL</text>' +

      // Double pocket-door hold between Dining & Living (X=293.7)
      '<line x1="' + ux(293.7).toFixed(1) + '" y1="' + uy(186).toFixed(1) + '" x2="' + ux(293.7).toFixed(1) + '" y2="' + uy(252.5).toFixed(1) + '" stroke="#FFFFFF" stroke-width="4.5"/>' +
      '<text x="' + ux(293.7).toFixed(1) + '" y="' + uy(176).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#DC2626">D6/L6 HOLD</text>' +

      // Room Labels + Rev R6 Circuit Badges (tap any room!)
      '<text x="' + ux(84).toFixed(1) + '" y="' + uy(162).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#92400E">' + esc(t("KITCHEN", "COCINA", "КУХНЯ")) + '</text>' +
      '<text x="' + ux(84).toFixed(1) + '" y="' + uy(176).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#B45309">#1–#9 (New)</text>' +

      '<text x="' + ux(222).toFixed(1) + '" y="' + uy(212).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#075985">' + esc(t("DINING ROOM", "COMEDOR", "СТОЛОВАЯ")) + '</text>' +
      '<text x="' + ux(222).toFixed(1) + '" y="' + uy(226).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="700" fill="#0369A1">#10* (D1–D4) · #12 Lts</text>' +
      '<text x="' + ux(222).toFixed(1) + '" y="' + uy(238).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#64748B">F1 Attic above (#15)</text>' +

      '<text x="' + ux(398).toFixed(1) + '" y="' + uy(212).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#075985">' + esc(t("LIVING ROOM", "SALA", "ГОСТИНАЯ")) + '</text>' +
      '<text x="' + ux(398).toFixed(1) + '" y="' + uy(226).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="700" fill="#0369A1">#10* (L1–L5) · #12 Lts</text>' +
      '<text x="' + ux(398).toFixed(1) + '" y="' + uy(238).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#DC2626">#16 Smoke/CO</text>' +

      '<text x="' + ux(243).toFixed(1) + '" y="' + uy(38).toFixed(1) + '" text-anchor="middle" font-size="8.5" font-weight="800" fill="#166534">' + esc(t("BATH", "BAÑO", "ВАННАЯ")) + '</text>' +
      '<text x="' + ux(243).toFixed(1) + '" y="' + uy(51).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-weight="700" fill="#15803D">#13 (100% 12/2)</text>' +
      '<text x="' + ux(243).toFixed(1) + '" y="' + uy(63).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="700" fill="#166534">28\" out-swing</text>' +

      '<text x="' + ux(297).toFixed(1) + '" y="' + uy(38).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="800" fill="#9A3412">' + esc(t("LAUN", "LAV.", "ПРАЧ.")) + '</text>' +
      '<text x="' + ux(297).toFixed(1) + '" y="' + uy(51).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#C2410C">#14</text>' +
      '<text x="' + ux(297).toFixed(1) + '" y="' + uy(63).toFixed(1) + '" text-anchor="middle" font-size="6.5" font-weight="700" fill="#9A3412">38\" E</text>' +

      '<text x="' + ux(400).toFixed(1) + '" y="' + uy(58).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#3730A3">' + esc(t("BEDROOM (NE)", "RECÁMARA (NE)", "СПАЛЬНЯ (СВ)")) + '</text>' +
      '<text x="' + ux(400).toFixed(1) + '" y="' + uy(72).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="700" fill="#4338CA">#10* (B1–B5 @ 11.5\")</text>' +
      '<text x="' + ux(400).toFixed(1) + '" y="' + uy(84).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#4338CA">#11 Spare · #12 Lts · #16 Smoke</text>' +

      '<text x="' + ux(250).toFixed(1) + '" y="' + uy(118).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#334155">' + esc(t("HALLWAY", "PASILLO", "КОРИДОР")) + ' · #10* H1 · #12 2× 3-Way · #16 Smoke/CO</text>' +

      // Legend Footer
      '<text x="340" y="396" text-anchor="middle" font-size="8.2" font-weight="700" fill="#1E293B">' +
        esc(t("*#10 Shared (Reuse + New): Living, Dining, Bedroom & Hall outlets · 5 Open Spares: #11 (Bed split), #17–#20 · Tap any room to inspect",
              "*#10 Compartido (Reuso + Nuevo): Sala, Comedor, Recámara y Pasillo · 5 Reservas: #11, #17–#20 · Toca cualquier cuarto",
              "*#10 Общая (Реус+Нов): гостиная, столовая, спальня и коридор · 5 резервов: #11, #17–#20 · Нажмите на комнату")) +
      '</text>' +
    '</svg>';
  }

  function renderKitchenPlanSvg() {
    var S = 2.45;
    var ox = 110, oy = 46;
    function kx(x) { return ox + x * S; }
    function ky(y) { return oy + (y - 108) * S; }
    var pts = polyStr(U4_ROOMS.kitchen, kx, ky);
    var d = off();
    var cH = fmtIn(state.counterH + d);

    function isSel(cid) { return state.selectedCircuit === cid; }
    function bFill(cid, def) { return isSel(cid) ? "#DC2626" : def; }

    return '<svg viewBox="0 0 640 412" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      esc(t("Kitchen 1:1 Electrical Floor Plan (#1–#9)", "Plano Eléctrico 1:1 de Cocina (#1–#9)", "План электрики кухни 1:1 (#1–#9)")) + '">' +
      '<rect x="0" y="0" width="640" height="412" fill="#F8FAFC" rx="8"/>' +
      '<text x="320" y="22" text-anchor="middle" font-size="11.2" font-weight="800" fill="#0F2537">' +
        esc(t("KITCHEN 1:1 FLOOR PLAN (#1–#9) · COUNTER OUTLETS @ " + cH + " · TAP ANY BOX",
              "PLANO 1:1 COCINA (#1–#9) · CONTACTOS CUBIERTA @ " + cH + " · TOCA CUALQUIER CAJA",
              "ПЛАН КУХНИ 1:1 (#1–#9) · РОЗЕТКИ ФАРТУКА @ " + cH + " · НАЖМИТЕ НА КОРОБКУ")) +
      '</text>' +
      svgCompass(604, 44) +

      // Kitchen L-room polygon (West Range Wall at X=31.5, Rear-Door Alcove X=0..31.5)
      '<polygon points="' + pts + '" fill="#FFFFFF" stroke="#0F2537" stroke-width="2.4"/>' +

      // Openings: North Hall (117.5..147, Y=108), Rear Door (4.75..30.625, Y=234.25), South Window (40.3..74.1, Y=234.25)
      '<line x1="' + kx(117.5).toFixed(1) + '" y1="' + ky(108).toFixed(1) + '" x2="' + kx(147).toFixed(1) + '" y2="' + ky(108).toFixed(1) + '" stroke="#FFFFFF" stroke-width="5"/>' +
      '<line x1="' + kx(117.5).toFixed(1) + '" y1="' + ky(108).toFixed(1) + '" x2="' + kx(147).toFixed(1) + '" y2="' + ky(108).toFixed(1) + '" stroke="#0F2537" stroke-width="1.4" stroke-dasharray="4,3"/>' +
      '<text x="' + kx(132).toFixed(1) + '" y="' + (ky(108) - 6).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-weight="700" fill="#475569">' + esc(t("HALL 29.5\"", "PASO 29.5\"", "ПРОЁМ 29.5\"")) + '</text>' +
      '<line x1="' + kx(4.75).toFixed(1) + '" y1="' + ky(234.25).toFixed(1) + '" x2="' + kx(30.625).toFixed(1) + '" y2="' + ky(234.25).toFixed(1) + '" stroke="#B45309" stroke-width="3.2" stroke-dasharray="4,2"/>' +
      '<text x="' + kx(17.5).toFixed(1) + '" y="' + (ky(234.25) + 13).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#92400E">' + esc(t("REAR DOOR", "PTA TRAS.", "ЗАДН. ДВ.")) + '</text>' +
      '<line x1="' + kx(88).toFixed(1) + '" y1="' + ky(234.25).toFixed(1) + '" x2="' + kx(121).toFixed(1) + '" y2="' + ky(234.25).toFixed(1) + '" stroke="#D97706" stroke-width="4" stroke-dasharray="5,2"/>' +

      // Cabinets & Appliances (True Nov 25 1:1):
      // West 66-1/4": 18" base + 30" Viking Range + 18" base (zero uppers)
      '<rect x="' + kx(31.5).toFixed(1) + '" y="' + ky(108).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18.25 * S).toFixed(1) + '" fill="#F1F5F9" stroke="#94A3B8"/>' +
      '<rect x="' + kx(31.5).toFixed(1) + '" y="' + ky(126.25).toFixed(1) + '" width="' + (26 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" fill="#FFEDD5" stroke="#C2410C" stroke-width="1.5"/>' +
      '<text x="' + kx(44.5).toFixed(1) + '" y="' + ky(143).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#9A3412">VIKING 30"</text>' +
      '<rect x="' + kx(31.5).toFixed(1) + '" y="' + ky(156.25).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18 * S).toFixed(1) + '" fill="#F1F5F9" stroke="#94A3B8"/>' +

      // SE 36"x36" Diagonal Corner Base + East 18" Drawer + 28" Haier Fridge (54"-82" N)
      '<polygon points="' + kx(147).toFixed(1) + ',' + ky(234.25).toFixed(1) + ' ' + kx(111).toFixed(1) + ',' + ky(234.25).toFixed(1) + ' ' + kx(111).toFixed(1) + ',' + ky(210.25).toFixed(1) + ' ' + kx(123).toFixed(1) + ',' + ky(198.25).toFixed(1) + ' ' + kx(147).toFixed(1) + ',' + ky(198.25).toFixed(1) + '" fill="#E2E8F0" stroke="#64748B" stroke-width="1.3"/>' +
      '<text x="' + kx(132).toFixed(1) + '" y="' + ky(220).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#334155">36" DIAG</text>' +
      '<rect x="' + kx(123).toFixed(1) + '" y="' + ky(180.25).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (18 * S).toFixed(1) + '" fill="#F1F5F9" stroke="#94A3B8"/>' +
      '<rect x="' + kx(119).toFixed(1) + '" y="' + ky(152.25).toFixed(1) + '" width="' + (28 * S).toFixed(1) + '" height="' + (28 * S).toFixed(1) + '" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>' +
      '<text x="' + kx(133).toFixed(1) + '" y="' + ky(168).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#1E293B">FRIDGE 28"</text>' +

      // South: 12" Trash (36-48) + 24" Finished-Front DW (48-72) + 30" Sink (72-102) + 6" end
      '<rect x="' + kx(99).toFixed(1) + '" y="' + ky(210.25).toFixed(1) + '" width="' + (12 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="#F1F5F9" stroke="#94A3B8"/>' +
      '<rect x="' + kx(75).toFixed(1) + '" y="' + ky(210.25).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.4"/>' +
      '<text x="' + kx(87).toFixed(1) + '" y="' + ky(224).toFixed(1) + '" text-anchor="middle" font-size="7.8" font-weight="800" fill="#0369A1">DW 24"</text>' +
      '<rect x="' + kx(45).toFixed(1) + '" y="' + ky(210.25).toFixed(1) + '" width="' + (30 * S).toFixed(1) + '" height="' + (24 * S).toFixed(1) + '" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="1.4"/>' +
      '<text x="' + kx(60).toFixed(1) + '" y="' + ky(224).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#1E40AF">SINK 30"</text>' +

      // Dining-side Panel (Eaton BRP20L125G) + 30x36 clear zone on RIGHT of East Wall + No-Screw strip
      '<rect x="' + (kx(147) + 4).toFixed(1) + '" y="' + ky(198.75).toFixed(1) + '" width="' + (34 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" rx="4" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5" stroke-dasharray="4,2"/>' +
      '<rect x="' + (kx(147) - 3).toFixed(1) + '" y="' + ky(206.75).toFixed(1) + '" width="8" height="' + (14.5 * S).toFixed(1) + '" fill="#DC2626"/>' +
      '<text x="' + (kx(147) + 45).toFixed(1) + '" y="' + ky(211).toFixed(1) + '" text-anchor="middle" font-size="8.2" font-weight="800" fill="#991B1B">PANEL (20-Sp)</text>' +
      '<text x="' + (kx(147) + 45).toFixed(1) + '" y="' + ky(221).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#B91C1C">' + esc(t("Dining Side · 30×36\"", "Lado Comedor · 30×36\"", "Столовая · 30×36\"")) + '</text>' +

      // Clickable Physical Boxes (#1–#9)
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
        '<rect x="' + (kx(111.5) - 8).toFixed(1) + '" y="' + (ky(108) - 4).toFixed(1) + '" width="16" height="8" rx="2" fill="' + bFill("LT", "#FEE2E2") + '" stroke="#DC2626" stroke-width="1.5"/>' +
        '<text x="' + kx(92).toFixed(1) + '" y="' + (ky(108) - 8).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="800" fill="#991B1B">3-SW 35.5\" (#9)</text>' +
        '<circle cx="' + kx(89).toFixed(1) + '" cy="' + ky(159).toFixed(1) + '" r="8" fill="#FEF3C7" stroke="#A15206" stroke-width="1.6"/>' +
        '<text x="' + kx(89).toFixed(1) + '" y="' + (ky(159) + 3).toFixed(1) + '" text-anchor="middle" font-size="7" font-weight="800" fill="#92400E">L1</text>' +
        '<circle cx="' + kx(72).toFixed(1) + '" cy="' + ky(201).toFixed(1) + '" r="5.5" fill="#FEF3C7" stroke="#A15206" stroke-width="1.4"/>' +
        '<circle cx="' + kx(48).toFixed(1) + '" cy="' + ky(201).toFixed(1) + '" r="5.5" fill="#FEF3C7" stroke="#A15206" stroke-width="1.4"/>' +
      '</g>' +

      '<text x="320" y="396" text-anchor="middle" font-size="8" font-weight="700" fill="#1E293B">' +
        esc(t("SE = 0\" · Sealed Pie-Safe (26\"–59\" W, dashed amber) · Under-Sink 2-Gang @ 14\" AFF (2 separate yokes) · ZERO back-entries in Panel zone (53\"–77\" AFF)",
              "SE = 0\" · Pie-Safe sellado (26\"–59\" O) · Caja Doble Fregadero @ 14\" AFF (2 yugos separados) · CERO tornillos tras Panel (53\"–77\" AFF)",
              "ЮВ = 0\" · Зашитая ниша (26\"–59\" З) · Коробка под мойкой @ 14\" (2 суппорта) · Ноль саморезов за щитком (53\"–77\")")) +
      '</text>' +
    '</svg>';
  }

  function renderAtticCeilingMapSvg() {
    var S = 1.12;
    var ox = 56, oy = 42;
    function ax(x) { return ox + x * S; }
    function ay(y) { return oy + y * S; }

    var flt = state.atticFilter || "all";
    var swOpt = state.atticSwitchOpt || "optA";
    var all = flt === "all";
    var opKit = (all || flt === "kitchen") ? "1" : "0.16";
    var opAtt = (all || flt === "attic") ? "1" : "0.16";
    var opBth = (all || flt === "bath") ? "1" : "0.16";
    var opCom = (all || flt === "common") ? "1" : "0.16";

    var swX = swOpt === "optA" ? 94 : 112;
    var swY = swOpt === "optA" ? 74 : 92;
    var swLbl = swOpt === "optA"
      ? t("Hatch Sw Opt A (Landing)", "Apagador Op. A (Descanso)", "Выкл. вар. A (стена)")
      : t("Hatch Sw Opt B (2× Curb)", "Apagador Op. B (Marco 2×)", "Выкл. вар. B (короб)");

    return '<svg viewBox="0 0 680 416" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      esc(t("True 1:1 Unit 4 Attic & Ceiling Romex Map", "Mapa 1:1 de Ático y Techo Unidad 4", "План чердака и потолочных трасс 1:1")) + '">' +
      '<rect x="0" y="0" width="680" height="416" fill="#F8FAFC" rx="8"/>' +
      '<text x="340" y="22" text-anchor="middle" font-size="11.2" font-weight="800" fill="#0F2537">' +
        esc(t("TRUE 1:1 ATTIC & CEILING MAP (508\" × 298\" · NORTH UP · REV R6)",
              "MAPA 1:1 ÁTICO Y TECHO (508\" × 298\" · NORTE ARRIBA · REV R6)",
              "ПЛАН ЧЕРДАКА 1:1 (508\" × 298\" · СЕВЕР ВВЕРХ · REV R6)")) +
      '</text>' +
      svgCompass(646, 46) +

      // Underlying Canonical 1:1 Room Walls (exact same coordinates as E-21 / E-25!)
      '<polygon points="' + polyStr(U4_ROOMS.door4, ax, ay) + '" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.kitchen, ax, ay) + '" fill="#FEFCE8" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.dining, ax, ay) + '" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.living, ax, ay) + '" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.hall, ax, ay) + '" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.bath, ax, ay) + '" fill="#F0FDF4" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.laundry, ax, ay) + '" fill="#FFF7ED" stroke="#94A3B8" stroke-width="1.3"/>' +
      '<polygon points="' + polyStr(U4_ROOMS.bedroom, ax, ay) + '" fill="#EEF2FF" stroke="#94A3B8" stroke-width="1.3"/>' +

      // Subtle room watermarks so orientation is unmistakable
      '<text x="' + ax(84).toFixed(1) + '" y="' + ay(222).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="700" fill="#92400E">' + esc(t("KITCHEN (#1–#9)", "COCINA (#1–#9)", "КУХНЯ (#1–#9)")) + '</text>' +
      '<text x="' + ax(222).toFixed(1) + '" y="' + ay(286).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="700" fill="#475569">' + esc(t("DINING (#10/#12)", "COMEDOR (#10/#12)", "СТОЛОВАЯ (#10/#12)")) + '</text>' +
      '<text x="' + ax(400).toFixed(1) + '" y="' + ay(286).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="700" fill="#475569">' + esc(t("LIVING (#10/#12)", "SALA (#10/#12)", "ГОСТИНАЯ (#10/#12)")) + '</text>' +
      '<text x="' + ax(243).toFixed(1) + '" y="' + ay(20).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#166534">' + esc(t("BATH (#13)", "BAÑO (#13)", "ВАННАЯ (#13)")) + '</text>' +
      '<text x="' + ax(297).toFixed(1) + '" y="' + ay(20).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="700" fill="#9A3412">' + esc(t("LAUN (#14)", "LAV (#14)", "ПРАЧ (#14)")) + '</text>' +
      '<text x="' + ax(400).toFixed(1) + '" y="' + ay(20).toFixed(1) + '" text-anchor="middle" font-size="7.6" font-weight="700" fill="#3730A3">' + esc(t("BEDROOM NE (#10/#12)", "RECÁMARA NE (#10/#12)", "СПАЛЬНЯ СВ (#10/#12)")) + '</text>' +

      // 72" Hatch Guard-Strip Zone around Door 4 Hatch (X=28..196, Y=2..164)
      '<rect x="' + ax(28).toFixed(1) + '" y="' + ay(2).toFixed(1) + '" width="' + (168 * S).toFixed(1) + '" height="' + (162 * S).toFixed(1) + '" fill="none" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="5,3"/>' +
      '<text x="' + ax(112).toFixed(1) + '" y="' + ay(15).toFixed(1) + '" text-anchor="middle" font-size="7.2" font-weight="800" fill="#991B1B">NEC 320.23(A): 72" GUARD ZONE</text>' +

      // Door 4 Hatch (24"x36" @ 112,74 on West Landing)
      '<rect x="' + ax(100).toFixed(1) + '" y="' + ay(56).toFixed(1) + '" width="' + (24 * S).toFixed(1) + '" height="' + (36 * S).toFixed(1) + '" fill="#DCFCE7" stroke="#15803D" stroke-width="1.8"/>' +
      '<text x="' + ax(112).toFixed(1) + '" y="' + ay(77).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-weight="800" fill="#166534">D4</text>' +

      // 24" OSB Walkway (15.8 ft <= 20 ft) + 30"x30" Platform + F1 Furnace (174, 258)
      '<polyline points="' + ax(124).toFixed(1) + ',' + ay(74).toFixed(1) + ' ' + ax(174).toFixed(1) + ',' + ay(74).toFixed(1) + ' ' + ax(174).toFixed(1) + ',' + ay(213.5).toFixed(1) + '" fill="none" stroke="#94A3B8" stroke-width="' + (24 * S).toFixed(1) + '" opacity="0.35"/>' +
      '<rect x="' + ax(159).toFixed(1) + '" y="' + ay(213.5).toFixed(1) + '" width="' + (30 * S).toFixed(1) + '" height="' + (30 * S).toFixed(1) + '" fill="#DCFCE7" stroke="#15803D" stroke-width="1.5"/>' +
      '<rect x="' + ax(159).toFixed(1) + '" y="' + ay(243.5).toFixed(1) + '" width="' + (30 * S).toFixed(1) + '" height="' + (29 * S).toFixed(1) + '" fill="#1E293B" stroke="#0F172A"/>' +
      '<text x="' + ax(174).toFixed(1) + '" y="' + ay(261).toFixed(1) + '" text-anchor="middle" font-size="8" font-weight="800" fill="#FFFFFF">F1 #15</text>' +

      // Panel Top Riser @ X=147, Y=213.75
      '<rect x="' + (ax(147) - 5).toFixed(1) + '" y="' + (ay(213.75) - 7).toFixed(1) + '" width="10" height="14" fill="#DC2626"/>' +
      '<text x="' + (ax(147) - 9).toFixed(1) + '" y="' + (ay(213.75) + 3).toFixed(1) + '" text-anchor="end" font-size="7.4" font-weight="800" fill="#991B1B">PANEL</text>' +

      // Kitchen Attic Homeruns (#3, #7, #8, #9)
      '<g opacity="' + opKit + '">' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(65).toFixed(1) + ',' + ay(141).toFixed(1) + ' ' + ax(31.5).toFixed(1) + ',' + ay(141).toFixed(1) + '" fill="none" stroke="#D97706" stroke-width="2.4"/>' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(111.5).toFixed(1) + ',' + ay(108).toFixed(1) + '" fill="none" stroke="#2563EB" stroke-width="2"/>' +
      '</g>' +

      // Attic & HVAC (#15 Furnace + #16 AFCI-ONLY Hatch Switch, 2x LEDs, LINE-only GFCI)
      '<g opacity="' + opAtt + '">' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(159).toFixed(1) + ',' + ay(258).toFixed(1) + '" fill="none" stroke="#0F172A" stroke-width="2.6"/>' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(147).toFixed(1) + ',' + ay(92).toFixed(1) + ' ' + ax(swX).toFixed(1) + ',' + ay(swY).toFixed(1) + '" fill="none" stroke="#16A34A" stroke-width="2.2" stroke-dasharray="5,3"/>' +
        '<circle cx="' + ax(swX).toFixed(1) + '" cy="' + ay(swY).toFixed(1) + '" r="5" fill="#DCFCE7" stroke="#15803D" stroke-width="1.8"/>' +
        '<text x="' + (ax(swX) - 7).toFixed(1) + '" y="' + (ay(swY) + 12).toFixed(1) + '" text-anchor="end" font-size="6.8" font-weight="800" fill="#166534">' + esc(swLbl) + '</text>' +
        '<circle cx="' + ax(152).toFixed(1) + '" cy="' + ay(74).toFixed(1) + '" r="4.8" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.6"/>' +
        '<circle cx="' + ax(174).toFixed(1) + '" cy="' + ay(175).toFixed(1) + '" r="4.8" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.6"/>' +
        '<rect x="' + (ax(159) - 2).toFixed(1) + '" y="' + (ay(228) - 4).toFixed(1) + '" width="11" height="8" rx="2" fill="#FEF3C7" stroke="#B45309" stroke-width="1.4"/>' +
      '</g>' +

      // Bath (#13 via Bath J-Box) & Laundry (#14 East wall @ 38" AFF)
      '<g opacity="' + opBth + '">' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(243).toFixed(1) + ',' + ay(68).toFixed(1) + '" fill="none" stroke="#15803D" stroke-width="2.3"/>' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(315).toFixed(1) + ',' + ay(52).toFixed(1) + '" fill="none" stroke="#EA580C" stroke-width="2.3"/>' +
        '<rect x="' + (ax(243) - 6).toFixed(1) + '" y="' + (ay(68) - 6).toFixed(1) + '" width="12" height="12" fill="#FEF08A" stroke="#15803D" stroke-width="1.8"/>' +
      '</g>' +

      // Common Rooms (#10 Liv/Din & Bed/Hall J-Boxes, #12 Lights J-Box, #16 Unswitched 14/2 -> 14/3 Red Smoke/CO)
      '<g opacity="' + opCom + '">' +
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(255).toFixed(1) + ',' + ay(202).toFixed(1) + ' ' + ax(395).toFixed(1) + ',' + ay(64).toFixed(1) + '" fill="none" stroke="#CA8A04" stroke-width="2.2" stroke-dasharray="6,3"/>' +
        '<rect x="' + (ax(255) - 6).toFixed(1) + '" y="' + (ay(202) - 6).toFixed(1) + '" width="12" height="12" fill="#FEF08A" stroke="#713F12" stroke-width="1.8"/>' +
        '<text x="' + ax(255).toFixed(1) + '" y="' + (ay(202) + 17).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#713F12">JB #10</text>' +
        '<rect x="' + (ax(395) - 6).toFixed(1) + '" y="' + (ay(64) - 6).toFixed(1) + '" width="12" height="12" fill="#FEF08A" stroke="#713F12" stroke-width="1.8"/>' +
        '<text x="' + ax(395).toFixed(1) + '" y="' + (ay(64) - 10).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#713F12">JB #10 (Split #11)</text>' +
        '<rect x="' + (ax(252) - 6).toFixed(1) + '" y="' + (ay(115) - 6).toFixed(1) + '" width="12" height="12" fill="#FFFFFF" stroke="#334155" stroke-width="1.8"/>' +
        '<text x="' + ax(252).toFixed(1) + '" y="' + (ay(115) + 16).toFixed(1) + '" text-anchor="middle" font-size="6.8" font-weight="800" fill="#334155">JB #12</text>' +
        // #16 Smoke/CO 14/2 unswitched -> 14/3 Red interconnect (Hall, NE Bedroom, SE Living)
        '<polyline points="' + ax(147).toFixed(1) + ',' + ay(213.75).toFixed(1) + ' ' + ax(295).toFixed(1) + ',' + ay(115).toFixed(1) + '" fill="none" stroke="#334155" stroke-width="1.8"/>' +
        '<polyline points="' + ax(295).toFixed(1) + ',' + ay(115).toFixed(1) + ' ' + ax(395).toFixed(1) + ',' + ay(88).toFixed(1) + ' ' + ax(395).toFixed(1) + ',' + ay(215).toFixed(1) + '" fill="none" stroke="#DC2626" stroke-width="2.2" stroke-dasharray="5,2"/>' +
        '<circle cx="' + ax(295).toFixed(1) + '" cy="' + ay(115).toFixed(1) + '" r="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.7"/>' +
        '<circle cx="' + ax(395).toFixed(1) + '" cy="' + ay(88).toFixed(1) + '" r="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.7"/>' +
        '<circle cx="' + ax(395).toFixed(1) + '" cy="' + ay(215).toFixed(1) + '" r="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.7"/>' +
        '<text x="' + (ax(395) + 10).toFixed(1) + '" y="' + (ay(215) + 3).toFixed(1) + '" font-size="7.2" font-weight="800" fill="#991B1B">Smoke/CO #16 (14/3)</text>' +
      '</g>' +

      '<text x="340" y="399" text-anchor="middle" font-size="7.8" font-weight="700" fill="#1E293B">' +
        esc(t("NEC 320.23: Run NM-B along side of joists (>=1-1/4\" from edges) · 72\" guard strips at Door 4 Hatch · Flag all 4 J-Boxes above insulation",
              "NEC 320.23: Correr NM-B por costado de vigas (>=1-1/4\" del borde) · Listones 72\" en Puerta 4 · Abanderar las 4 Cajas",
              "NEC 320.23: Прокладка NM-B по бокам балок (>=1-1/4\" от края) · Планки 72\" у люка D4 · Маркировка всех 4 коробок")) +
      '</text>' +
    '</svg>';
  }

  function renderWallDetail() {
    var d = off();
    var cH = fmtIn(state.counterH + d);
    var hdLow = fmtIn(83 + d);
    var hdHigh = fmtIn(86 + d);
    var d04Low = fmtIn(53 + d);
    var d04High = fmtIn(77 + d);

    if (state.wallTab === "east") {
      return '<div class="u4h-info-box" style="border-left-color:var(--crimson)">' +
        '<div class="u4h-info-title" style="color:var(--crimson)">' + esc(t("Kitchen East Wall (126-1/4\") — Fridge & Panel Back No-Screw Zone", "Muro Este Cocina (126-1/4\") — Refri y Respaldo Panel", "Восточная стена кухни (126-1/4\") — Холодильник и тыл щитка")) + '</div>' +
        '<ul class="u4h-info-list">' +
          '<li><strong>' + esc(t("PANEL NO-SCREW / NO-BOX ZONE (13\"–27-1/2\" N of SE):", "ZONA PROHIBIDA PANEL (13\"–27-1/2\" N de SE):", "ЗАПРЕТНАЯ ЗОНА ЩИТКА (13\"–27-1/2\" С от ЮВ):")) + '</strong> ' +
            esc(t("Eaton BRP20L125G sits behind Kitchen drywall from " + d04Low + " to " + d04High + ". ZERO back-entries, ZERO screws, side-entry notches ON HOLD.",
                  "El gabinete Eaton BRP20L125G está detrás de la tablaroca de " + d04Low + " a " + d04High + ". CERO entradas traseras, CERO tornillos, muescas laterales EN PAUSA.",
                  "Корпус Eaton BRP20L125G за ГКЛ от " + d04Low + " до " + d04High + ". Ноль саморезов и задних вводов; боковые вырезы на паузе.")) + '</li>' +
          '<li><strong>East 1 @ 10\" N &amp; East 2 @ 45\" N (#1 · 20A 12/2):</strong> ' + cH + ' · ' + esc(t("50\" in-wall bore band · East 2 centered over 18\" drawer base (36\"–54\" N).", "Franja 50\" · Este 2 centrado sobre cajonera 18\" (36\"–54\" N).", "Зона 50\" · East 2 по центру тумбы 18\" (36\"–54\" С).")) + '</li>' +
          '<li><strong>REF-1 @ 68\" N (#4 · 20A 12/2):</strong> ' + fmtIn(15 + d) + ' · ' + esc(t("Single 20A TR behind 28\" Haier fridge (54\"–82\" N) · 52-1/2\" bore band.", "Sencillo 20A TR tras Haier 28\" (54\"–82\" N) · franja 52-1/2\".", "Одинарная 20A TR за Haier 28\" (54\"–82\" С) · зона 52-1/2\".")) + '</li>' +
        '</ul></div>';
    }
    if (state.wallTab === "south") {
      return '<div class="u4h-photo-grid"><div class="u4h-photo-card">' +
        '<img src="./assets/south-sink-wall.jpg" alt="' + esc(t("Open-stud photo of South sink wall", "Foto real muro Sur", "Фото южной стены")) + '">' +
        '<div class="u4h-photo-cap"><strong>' + esc(t("South Wall (147\" · SE = 0\"):", "Muro Sur (147\" · SE = 0\"):", "Южная стена (147\" · ЮВ = 0\"):")) + '</strong> ' +
        esc(t("South 1 @ 24\" W & South 2 @ 62\" W* (verify window CL 87\" vs 90\") at " + cH + " (#2). Under-Sink 2-Gang INSIDE 30\" sink base @ 76\" W*, " + fmtIn(14 + d) + " with 2 SEPARATE TR receptacles & neutrals (#5 20A DW left + #6 15A Disposal right) — NEVER behind 24\" finished-front DW (48\"–72\" W). Pie-Safe (26\"–59\" W) sealed flush.",
              "Sur 1 @ 24\" O y Sur 2 @ 62\" O* (verificar eje ventana 87\" vs 90\") a " + cH + " (#2). Caja Doble Fregadero DENTRO de tarja 30\" a 76\" O*, " + fmtIn(14 + d) + " con 2 receptáculos y neutros SEPARADOS (#5 20A izq. + #6 15A der.) — NUNCA tras lavavajillas 24\" (48\"–72\" O). Pie-Safe (26\"–59\" O) sellado al ras.",
              "South 1 @ 24\" З и South 2 @ 62\" З* (сверить ось окна 87\"/90\") на " + cH + " (#2). Двойная коробка внутри тумбы мойки @ 76\" З*, " + fmtIn(14 + d) + " на 2 раздельных суппорта (#5 20A ПММ + #6 15A диспоузер). Ниша 26\"–59\" З зашита заподлицо.")) +
        '</div></div></div>';
    }
    if (state.wallTab === "west") {
      return '<div class="u4h-photo-grid"><div class="u4h-photo-card">' +
        '<img src="./assets/west-range-wall.jpeg" alt="' + esc(t("Open-stud photo of West range wall", "Foto real muro Oeste", "Фото западной стены")) + '">' +
        '<div class="u4h-photo-cap"><strong>' + esc(t("West Range Wall (66-1/4\" at X = 31.5\" Step · ZERO Uppers):", "Muro Oeste Estufa (66-1/4\" en escalón X = 31.5\" · SIN altos):", "Западная стена плиты (66-1/4\" уступ X = 31.5\" · без верхних шкафов):")) + '</strong> ' +
        esc(t("West 1 @ 9\" N & West 2 @ 57\" N at " + cH + " (#3, ~1\" tile mud rings; 1/2\" drywall + 1/2\" HardieBacker, zero shims). RG-1 @ 33\" N, " + fmtIn(3 + d) + " (#7). HD-1 flush 1-gang 2\"×3\" set ~1\" proud at 33\"±2-1/4\" N, " + hdLow + "–" + hdHigh + " (#8 + BRLW1 lock — replaces retired 4×4 @ 100\").",
              "Oeste 1 @ 9\" N y Oeste 2 @ 57\" N a " + cH + " (#3, aros ~1\" azulejo; 1/2\" tablaroca + 1/2\" HardieBacker, sin calzas). RG-1 @ 33\" N, " + fmtIn(3 + d) + " (#7). HD-1 caja sencilla 2\"×3\" ~1\" salida a 33\"±2-1/4\" N, " + hdLow + "–" + hdHigh + " (#8 + bloqueo BRLW1).",
              "West 1 @ 9\" С и West 2 @ 57\" С на " + cH + " (#3, рамки ~1\" под плитку). RG-1 @ 33\" С, " + fmtIn(3 + d) + " (#7). HD-1 одинарная 2\"×3\" выступ ~1\" в 33\"±2-1/4\" С, " + hdLow + "–" + hdHigh + " (#8 + BRLW1).")) +
        '</div></div></div>';
    }
    if (state.wallTab === "north") {
      return '<div class="u4h-info-box"><div class="u4h-info-title">' + esc(t("Kitchen North Entry Wall (115-1/2\" × 121-1/2\")", "Muro Norte Entrada Cocina (115-1/2\" × 121-1/2\")", "Северная стена кухни (115-1/2\" × 121-1/2\")")) + '</div>' +
        '<ul class="u4h-info-list">' +
          '<li><strong>Entry 3-Switch (#9 · 15A 14/2):</strong> 35.5\" W of NE (6\" W of 29.5\" hall opening) @ ' + fmtIn(48 + d) + ' -> Main Ceiling Light, Sink Pendants (75\"/99\" W), Under-Cab Lights.</li>' +
          '<li><strong>' + esc(t("Keep Original Trim Intact:", "Conservar Molduras Originales:", "Сохранить оригинальную отделку:")) + '</strong> 103\" Picture Rail &amp; 9-1/2\" Edwardian Baseboard.</li>' +
        '</ul></div>';
    }
    if (state.wallTab === "dining") {
      return '<div class="u4h-info-box"><div class="u4h-info-title">' + esc(t("Dining Room & Panel Face (Eaton BRP20L125G)", "Comedor y Cara del Panel (Eaton BRP20L125G)", "Столовая и щиток (Eaton BRP20L125G)")) + '</div>' +
        '<ul class="u4h-info-list">' +
          '<li><strong>Panel (West Wall, X = 147\", Y = 213.75\"):' + '</strong> 53\"–77\" AFF · SFEC 110.26(A)(3) 30\"W × 36\"D × 78\"H clear space · <strong>ZERO outlet (NO D5) on Panel wall</strong>.</li>' +
          '<li><strong>Dining 1–4 (#10 Shared · Reuse + New):</strong> 18\" AFF in lower trim frames (D01/D02 north &amp; south walls). Pre-existing sound wiring reused in part — verify reused vs. new legs &amp; wire gauge with C-10 electrician (15A AFCI if any reused leg is 14 AWG).</li>' +
          '<li><strong>D6 Pocket Hold:</strong> Keep ~33\" double pocket-door cavities clear on shared Dining/Living wall.</li>' +
        '</ul></div>';
    }
    if (state.wallTab === "bathroom") {
      return '<div class="u4h-info-box"><div class="u4h-info-title">' + esc(t("Bathroom All-in-One (#13 · 20A DF · 100% 12/2 Yellow)", "Baño Todo-en-Uno (#13 · 20A DF · 100% 12/2 Amarillo)", "Ванная (#13 · 20A DF · 100% 12/2)")) + '</div>' +
        '<ul class="u4h-info-list">' +
          '<li><strong>Room &amp; Door (Locked Nov 24):</strong> 72-1/8\" × 82-1/8\" · Pocket door <strong>RETIRED</strong> -> 28\" outward-swing hallway door; South framed stud wall allows switches @ ' + fmtIn(48 + d) + '.</li>' +
          '<li><strong>100% 12/2 Yellow via Bath J-Box:</strong> Vanity GFCI (40\"–44\" AFF), Vanity Light, Damp/Wet Bath Light, Humidity Fan, and <strong>SEPARATE pre-tile 12/2 Toilet drop @ 12\" AFF</strong> (split-ready to Spare #19 with zero tile demo).</li>' +
        '</ul></div>';
    }
    if (state.wallTab === "laundry") {
      return '<div class="u4h-info-box"><div class="u4h-info-title">' + esc(t("Laundry Closet (#14 · 20A DF at Panel · 12/2)", "Clóset Lavandería (#14 · 20A DF en Panel · 12/2)", "Прачечная (#14 · 20A DF в щитке · 12/2)")) + '</div>' +
        '<ul class="u4h-info-list">' +
          '<li><strong>1× Standard 20A TR Duplex on East/Right Wall @ ' + fmtIn(38 + d) + ':</strong> Serves both 120V plugs of stacked <strong>LG WKG101HVA</strong> gas WashTower, clearing the 8-1/4\" Murphy bookcase door projection.</li>' +
          '<li><strong>GFCI Reset &amp; Light Rule:</strong> Keep BRN120DF reset accessible at Panel; put Laundry ceiling light/switch on <strong>#12</strong> (NEVER on #14).</li>' +
        '</ul></div>';
    }
    if (state.wallTab === "bedroom") {
      return '<div class="u4h-info-box"><div class="u4h-info-title">' + esc(t("Bedroom (NE) — Shared #10 Outlets (#11 Spare) + #12 Light + #16 Smoke", "Recámara (NE) — #10 Compartido (#11 Reserva) + #12 Luz + #16 Humo", "Спальня (СВ) — #10 общая (#11 резерв) + #12 свет + #16 дым")) + '</div>' +
        '<ul class="u4h-info-list">' +
          '<li><strong>Bed 1–5 (#10 Shared · Reuse + New):</strong> Wall A (17\"/107\"), Wall C (60-1/2\"), Desk (B4), East Bay (B5) at <strong>11-1/2\" AFF with dark horizontal plates</strong> via flagged Bed/Hall Attic J-Box (split-ready to Open Spare #11).</li>' +
          '<li><strong>Lighting &amp; Life Safety:</strong> Ceiling light/switch on #12 · Interconnected 14/3 Red Smoke/CO on #16 (15A AFCI-ONLY). Keep NW temp-closet ceiling open until LV switch wire &amp; Door 4 hatch finish.</li>' +
        '</ul></div>';
    }
    return '<div class="u4h-info-box"><div class="u4h-info-title">' + esc(t("Living Room (SE) & Hallway — #10 Shared + #12 3-Way + #16 Smoke/CO", "Sala (SE) y Pasillo — #10 Compartido + #12 3-Vías + #16 Humo/CO", "Гостиная (ЮВ) и коридор — #10 общая + #12 3-Way + #16 дым/CO")) + '</div>' +
      '<ul class="u4h-info-list">' +
        '<li><strong>Living 1–5 &amp; Hall 1 (#10 Shared · Reuse + New):</strong> L01 (17-1/2\"/106-1/2\"), Fireplace side frames, East Bay &amp; Hall 1 (solid pier between Bath &amp; Murphy) @ 18\" AFF. Pre-existing sound wiring reused in part (verify gauge w/ C-10; 15A AFCI if 14 AWG). <strong>NO L6</strong> in ~33\" pocket cavity.</li>' +
        '<li><strong>Hall 2× 3-Way Lights (#12 · 14/3 Red) &amp; Smoke/CO (#16 · 15A AFCI-ONLY):</strong> Hall &amp; Living Smoke/CO alarms >=36\" from Bath door/HVAC registers and >=20 ft from Viking gas range.</li>' +
      '</ul></div>';
  }

  function renderAtticWiringGuideSvg() {
    return '<svg viewBox="0 0 600 240" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(t("Attic wiring rules cross-section", "Reglas de cableado en ático", "Правила прокладки на чердаке")) + '">' +
      '<rect x="0" y="0" width="600" height="240" fill="#F8FAFC" rx="8"/>' +
      '<text x="300" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#0F2537">ATTIC ROUTING &amp; FLAT-ROOF LED BLOCKING (NEC 314.23 / 320.23 / 300.4(E))</text>' +
      '<rect x="16" y="34" width="180" height="190" rx="6" fill="#FFFFFF" stroke="#15803D" stroke-width="1.8"/>' +
      '<text x="106" y="52" text-anchor="middle" font-size="8.6" font-weight="800" fill="#166534">1. SIDE OF JOIST (BEST)</text>' +
      '<rect x="76" y="72" width="24" height="90" fill="#E6CCB2" stroke="#7F5539" stroke-width="1.5"/>' +
      '<circle cx="104" cy="116" r="5.5" fill="#D97706" stroke="#92400E" stroke-width="1.5"/>' +
      '<text x="116" y="114" font-size="7.2" font-weight="800" fill="#92400E">NM-B</text>' +
      '<text x="116" y="125" font-size="6.8" fill="#475569">&gt;= 1-1/4\" edges</text>' +
      '<text x="106" y="186" text-anchor="middle" font-size="7.2" font-weight="700" fill="#166534">NEC 320.23(B): No guard strip</text>' +
      '<text x="106" y="200" text-anchor="middle" font-size="6.8" fill="#475569">Staple &lt;=12\" box, every &lt;=4.5 ft</text>' +

      '<rect x="210" y="34" width="180" height="190" rx="6" fill="#FFFFFF" stroke="#D97706" stroke-width="1.8"/>' +
      '<text x="300" y="52" text-anchor="middle" font-size="8.6" font-weight="800" fill="#92400E">2. GUARD STRIPS (&lt;=72\" HATCH)</text>' +
      '<rect x="234" y="120" width="132" height="40" fill="#E6CCB2" stroke="#7F5539" stroke-width="1.5"/>' +
      '<rect x="266" y="100" width="16" height="20" fill="#DDB892" stroke="#7F5539" stroke-width="1.3"/>' +
      '<rect x="318" y="100" width="16" height="20" fill="#DDB892" stroke="#7F5539" stroke-width="1.3"/>' +
      '<circle cx="300" cy="112" r="5.5" fill="#D97706" stroke="#92400E" stroke-width="1.5"/>' +
      '<text x="300" y="186" text-anchor="middle" font-size="7.2" font-weight="700" fill="#92400E">NEC 320.23(A): 1×2 / 2×2 rails</text>' +
      '<text x="300" y="200" text-anchor="middle" font-size="6.8" fill="#475569">Never trap under OSB walkway</text>' +

      '<rect x="404" y="34" width="180" height="190" rx="6" fill="#FFFFFF" stroke="#184E77" stroke-width="1.8"/>' +
      '<text x="494" y="52" text-anchor="middle" font-size="8.6" font-weight="800" fill="#184E77">3. FLAT-ROOF LED BLOCKING</text>' +
      '<rect x="420" y="66" width="148" height="14" fill="#94A3B8" stroke="#334155" stroke-width="1.3"/>' +
      '<text x="494" y="76" text-anchor="middle" font-size="6.8" font-weight="800" fill="#FFFFFF">ROOF DECK — NO SCREWS</text>' +
      '<line x1="494" y1="80" x2="494" y2="100" stroke="#DC2626" stroke-width="1.4" stroke-dasharray="2,2"/>' +
      '<text x="530" y="94" font-size="6.8" font-weight="800" fill="#DC2626">&gt;= 1-1/2\"</text>' +
      '<rect x="434" y="100" width="120" height="20" fill="#E6CCB2" stroke="#7F5539" stroke-width="1.4"/>' +
      '<text x="494" y="113" text-anchor="middle" font-size="6.8" font-weight="700" fill="#5C3D2E">2×4 Rafter Blocking</text>' +
      '<ellipse cx="494" cy="140" rx="24" ry="7" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5"/>' +
      '<text x="494" y="186" text-anchor="middle" font-size="7.2" font-weight="700" fill="#184E77">NEC 314.23 / 300.4(E)</text>' +
      '<text x="494" y="200" text-anchor="middle" font-size="6.8" fill="#475569">2 enclosed LEDs on 4O boxes</text>' +
    '</svg>';
  }

  function renderEquip() {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="kelecEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        esc(t("🔧 Complete Rev R6 Eaton BR Breaker Kit (15 Active + 5 Spares) ",
              "🔧 Kit Completo de Pastillas Eaton BR Rev R6 (15 Activos + 5 Reservas) ",
              "🔧 Комплект автоматов Eaton BR Rev R6 (15 активных + 5 резервов) ")) + (state.equipOpen ? "▴" : "▾") +
      '</button>' +
      '<div id="kelecEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + '>' +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            '<h4>' + esc(t("Kitchen (#1–#9)", "Cocina (#1–#9)", "Кухня (#1–#9)")) + '</h4>' +
            '<ul>' +
              '<li><strong>5× BRN120DF</strong> (20A DF: #1 East, #2 South, #3 West, #4 Fridge, #5 DW)</li>' +
              '<li><strong>2× BRN115DF</strong> (15A DF: #6 Disposal, #7 Gas Range)</li>' +
              '<li><strong>1× BRN115AF + BRLW1</strong> (15A AFCI + Lock-Off: #8 Hood)</li>' +
              '<li><strong>1× BRN115AF</strong> (15A AFCI: #9 Kitchen Lights)</li>' +
            '</ul>' +
          '</div>' +
          '<div class="u4h-equip-col">' +
            '<h4>' + esc(t("Rest of Unit (#10, #12–#16) + 5 Spares", "Resto de la Unidad (#10, #12–#16) + 5 Reservas", "Остальная квартира (#10, #12–#16) + 5 резервов")) + '</h4>' +
            '<ul>' +
              '<li><strong>1× BRN120AF*</strong> (#10 Shared Outlets — step down to <strong>BRN115AF</strong> if any reused leg is 14 AWG!)</li>' +
              '<li><strong>2× BRN115AF</strong> (#12 Common Lights · #16 Attic/Smoke <strong>AFCI-ONLY</strong>)</li>' +
              '<li><strong>2× BRN120DF</strong> (#13 Bathroom All-in-One · #14 Laundry WashTower)</li>' +
              '<li><strong>1× BR115</strong> (#15 Attic Furnace F1) · <strong>5 Open Spares (#11, #17–#20)</strong></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function render() {
    var host = document.getElementById("u4hBody");
    var holdEl = document.getElementById("u4hHoldStrip");
    if (!host) return;
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip is-danger";
      holdEl.innerHTML = t(
        "<strong>REV R6 ACTIVE HOLDS:</strong> Confirm NEXT feeder (80A vs 100A) &amp; hold Panel side-entry notches · Verify #10 reused wire gauge w/ C-10 (14 AWG -> 15A AFCI) · Verify Kitchen South window CL (87\" vs 90\") · Keep non-kitchen wire pull on hold until release.",
        "<strong>PAUSAS ACTIVAS REV R6:</strong> Confirmar alimentador NEXT (80A vs 100A) y pausar muescas laterales del Panel · Verificar calibre de cable reusado en #10 con C-10 (14 AWG -> 15A AFCI) · Verificar eje ventana Sur (87\" vs 90\") · Pausa sin jalar cable fuera de cocina.",
        "<strong>АКТИВНЫЕ ПАУЗЫ REV R6:</strong> Подтвердить ввод NEXT (80A/100A) и боковые вырезы щитка · Проверить калибр сохраняемого кабеля на #10 с C-10 (14 AWG -> 15A AFCI) · Сверить ось южного окна кухни (87\"/90\")."
      );
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(t(s.en, s.es, s.ru)) + '</button>';
      }).join("") +
    '</div>';

    var title = t("Whole-Unit Electrical Map (Rev R6 · 15 Active + 5 Spares)", "Mapa Eléctrico Completo Unidad 4 (Rev R6 · 15 + 5)", "План электрики всей квартиры (Rev R6 · 15 + 5)");
    var sub = t("True 1:1 Unit 4 layout (North UP) — switch between Whole-Unit Map and Kitchen Zoom, or tap any room/box", "Plano real 1:1 Unidad 4 (Norte ARRIBA) — alterna entre Toda la Unidad y Cocina, o toca cualquier cuarto/caja", "Точный план 1:1 (север вверх) — переключайте всю квартиру и кухню, или нажмите на комнату");
    var inner = "";

    if (state.step === "outlets") {
      var sel = CIRCUITS.find(function (c) { return c.id === state.selectedCircuit; }) || CIRCUITS[0];
      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi"><div class="u4h-kpi-lbl">' + esc(t("Active Circuits", "Circuitos Activos", "Активные линии")) + '</div><div class="u4h-kpi-val is-ok">15 / 20</div><div class="u4h-kpi-sub">#1–#10, #12–#16</div></div>' +
          '<div class="u4h-kpi"><div class="u4h-kpi-lbl">' + esc(t("Open Spares", "Reservas Libres", "Свободный резерв")) + '</div><div class="u4h-kpi-val is-info">5 Spares</div><div class="u4h-kpi-sub">#11, #17–#20</div></div>' +
          '<div class="u4h-kpi"><div class="u4h-kpi-lbl">' + esc(t("Counter Outlets", "Altura Cubierta", "Высота фартука")) + '</div><div class="u4h-kpi-val is-info">' + fmtIn(state.counterH + off()) + '</div><div class="u4h-kpi-sub">' + esc(state.floorDown ? t("Finished floor", "Piso terminado", "Чистовой пол") : t("Bare subfloor (+3/4\")", "Subpiso (+3/4\")", "Черновой пол (+3/4\")")) + '</div></div>' +
        '</div>' +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + esc(t("Map View:", "Vista del Mapa:", "Вид плана:")) + '</span>' +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.mapMode === "unit" ? " is-active" : "") + '" data-mmode="unit">' + esc(t("Whole-Unit 1:1 (#1–#20)", "Toda la Unidad 1:1 (#1–#20)", "Вся квартира 1:1 (#1–#20)")) + '</button>' +
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
      title = t("Room-by-Room Wall Details & Real Site Photos", "Detalles por Cuarto y Fotos Reales", "Детали стен по комнатам и фото объекта");
      sub = t("Pick any room or kitchen wall to verify box stations, heights, and Rev R6 rules", "Elige cualquier cuarto o muro de cocina para ver alturas y reglas Rev R6", "Выберите комнату или стену кухни для проверки высот и правил Rev R6");
      inner =
        '<div class="u4h-controls"><div class="u4h-ctrl-row">' +
          '<span class="u4h-ctrl-lbl">' + esc(t("Room / Wall:", "Cuarto / Muro:", "Комната / стена:")) + '</span>' +
          '<div class="u4h-pill-group">' +
            [
              ["east",     t("Kitchen East", "Cocina Este", "Кухня В")],
              ["south",    t("Kitchen South", "Cocina Sur", "Кухня Ю")],
              ["west",     t("Kitchen West", "Cocina Oeste", "Кухня З")],
              ["north",    t("Kitchen North", "Cocina Norte", "Кухня С")],
              ["dining",   t("Dining & Panel", "Comedor y Panel", "Столовая и щиток")],
              ["bathroom", t("Bathroom #13", "Baño #13", "Ванная #13")],
              ["laundry",  t("Laundry #14", "Lavandería #14", "Прачечная #14")],
              ["bedroom",  t("Bedroom NE #10", "Recámara NE #10", "Спальня СВ #10")],
              ["living",   t("Living & Hall #10", "Sala y Pasillo #10", "Гостиная/Кор. #10")]
            ].map(function (w) {
              return '<button type="button" class="u4h-pill' + (state.wallTab === w[0] ? " is-active" : "") + '" data-wtab="' + w[0] + '">' + esc(w[1]) + '</button>';
            }).join("") +
          '</div>' +
        '</div></div>' +
        renderWallDetail();

    } else if (state.step === "panel") {
      title = t("Eaton BRP20L125G Panel Directory — 15 Active + 5 Spares", "Directorio Panel Eaton BRP20L125G — 15 Activos + 5 Reservas", "Таблица щитка Eaton BRP20L125G — 15 активных + 5 резервов");
      sub = t("Dining Room stays named normally · #10 shares Living, Dining, Bedroom & Hall (Reuse + New) · #11 & #17–#20 are open spares", "El Comedor conserva su nombre · #10 comparte Sala, Comedor, Recámara y Pasillo (Reuso + Nuevo) · #11 y #17–#20 son reservas", "Столовая сохраняет название · #10 общая для гостиной, столовой, спальни и коридора · #11 и #17–#20 резерв");
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
              ["unit",    t("Rest of Unit (#10, #12–#16)", "Resto Unidad (#10, #12–#16)", "Остальные (#10, #12–#16)")],
              ["spare",   t("5 Open Spares (#11, #17–#20)", "5 Reservas (#11, #17–#20)", "5 резервов (#11, #17–#20)")]
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
      title = t("Attic & Ceiling Runs — True 1:1 Unit 4 Overlay", "Rutas en Ático y Techo — Superposición Real 1:1", "Чердачные и потолочные трассы — точный план 1:1");
      sub = t("Door 4 Hatch on West Landing · F1 Furnace over Dining · 4 Flagged Attic J-Boxes · #16 AFCI-ONLY Smoke/CO", "Escotilla P4 en Descanso Oeste · Calefactor F1 sobre Comedor · 4 Cajas Ático · #16 Humo/CO Solo-AFCI", "Люк D4 на западной площадке · Печь F1 над столовой · 4 чердачные коробки · #16 только-AFCI");
      inner =
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + esc(t("Filter group:", "Filtrar grupo:", "Фильтр:")) + '</span>' +
            '<div class="u4h-pill-group">' +
              [
                ["all",     t("All Runs", "Todas", "Все трассы")],
                ["kitchen", t("Kitchen (#3, #7–#9)", "Cocina (#3, #7–#9)", "Кухня (#3, #7–#9)")],
                ["attic",   t("Attic / HVAC (#15, #16)", "Ático / HVAC (#15, #16)", "Чердак / F1 (#15, #16)")],
                ["bath",    t("Bath / Laundry (#13, #14)", "Baño / Lav. (#13, #14)", "Ванная / Прач. (#13, #14)")],
                ["common",  t("Common & Smoke (#10, #12, #16)", "Comunes y Humo (#10, #12, #16)", "Комнаты и дым (#10, #12, #16)")]
              ].map(function (f) {
                return '<button type="button" class="u4h-pill' + (state.atticFilter === f[0] ? " is-active" : "") + '" data-attic-flt="' + f[0] + '">' + esc(f[1]) + '</button>';
              }).join("") +
            '</div>' +
          '</div>' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + esc(t("Hatch Switch:", "Apagador Escotilla:", "Выключатель люка:")) + '</span>' +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.atticSwitchOpt === "optA" ? " is-active" : "") + '" data-attic-sw="optA">' + esc(t("Option A: Landing Wall", "Opción A: Muro Descanso", "Вариант A: стена площадки")) + '</button>' +
              '<button type="button" class="u4h-pill' + (state.atticSwitchOpt === "optB" ? " is-active" : "") + '" data-attic-sw="optB">' + esc(t("Option B: Inside 2× Curb", "Opción B: Marco 2×", "Вариант B: внутри короба 2×")) + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="u4h-svg-wrap">' + renderAtticCeilingMapSvg() + '</div>';

    } else if (state.step === "attic-guide") {
      title = t("Attic Wiring & Flat-Roof Mounting Rules", "Reglas de Cableado en Ático y Techo Plano", "Правила прокладки на чердаке и плоской крыше");
      sub = t("NEC 320.23, 334.30, 314.23, CRC R314.6 & 2025 SFEC field rules", "Reglas NEC 320.23, 334.30, 314.23, CRC R314.6 y SFEC 2025", "Нормы NEC 320.23, 334.30, 314.23, CRC R314.6 и SFEC 2025");
      inner =
        '<div class="u4h-svg-wrap">' + renderAtticWiringGuideSvg() + '</div>' +
        '<div class="u4h-info-box"><div class="u4h-info-title">' + esc(t("Mandatory Attic & Life-Safety Rules", "Reglas Obligatorias en Ático y Seguridad", "Обязательные правила чердака и безопасности")) + '</div>' +
          '<ul class="u4h-info-list">' +
            '<li><strong>#16 AFCI-ONLY (BRN115AF — NEVER GFCI breaker):</strong> Unswitched 14/2 ahead of Hatch Switch to Hall Smoke/CO -> 14/3 Red to Bedroom &amp; Living alarms (&gt;=36\" from Bath door &amp; registers; &gt;=10–20 ft from range). Wire Attic GFCI (&lt;=25 ft F1) LINE-only with LOAD taped off.</li>' +
            '<li><strong>Flat-Roof Protection:</strong> Zero screws into roof deck; mount 2 enclosed LEDs on 2×4 rafter blocking &gt;=1-1/2\" below deck.</li>' +
            '<li><strong>R-2 Common-Area Check (SFEC 334.12(A)(12)):</strong> If landing wall outside Door 4 is R-2 common area, use MC/EMT for Switch Option A.</li>' +
          '</ul></div>';

    } else {
      title = t("Pre-Rough-In Holds & Complete Breaker Kit (Rev R6)", "Pausas Previas y Kit Completo de Pastillas (Rev R6)", "Проверки до монтажа и комплект автоматов (Rev R6)");
      sub = t("Confirm every hold before pulling wire or closing walls", "Confirma cada candado antes de jalar cable o cerrar muros", "Проверьте все паузы до протяжки кабеля и зашивки стен");
      var holds = [
        { k: "h1", en: "1. Panel Feeder (80A/#4 vs 100A/#3) confirmed with NEXT & side-entry notches ON HOLD; ZERO screws in Kitchen back zone (13\"–27.5\" N, 53\"–77\" AFF)",
                   es: "1. Alimentador Panel (80A/#4 vs 100A/#3) confirmado con NEXT y muescas laterales EN PAUSA; CERO tornillos tras Panel (53\"–77\" AFF)",
                   ru: "1. Ввод щитка (80A/#4 или 100A/#3) подтверждён с NEXT, боковые вырезы на паузе; ноль саморезов за щитком (53\"–77\")" },
        { k: "h2", en: "2. #10 Reused Wire Gauge Gate: verify reused vs. new Living/Dining/Bedroom legs w/ C-10 — install 15A AFCI (BRN115AF) if ANY reused wire is 14 AWG",
                   es: "2. Candado Calibre #10: verificar tramos reusados vs. nuevos en Sala/Comedor/Recámara con C-10 — instalar 15A AFCI si ALGÚN cable es 14 AWG",
                   ru: "2. Проверка калибра #10: сверить сохраняемые и новые участки с C-10 — при 14 AWG обязателен 15A AFCI (BRN115AF)" },
        { k: "h3", en: "3. Kitchen South Window CL (87\" vs 90\") verified; Under-Sink 2-Gang @ 14\" AFF uses 2 SEPARATE TR receptacles/yokes (#5 20A + #6 15A) & neutrals",
                   es: "3. Eje ventana Sur (87\" vs 90\") verificado; Caja Doble Fregadero @ 14\" AFF usa 2 receptáculos/yugos SEPARADOS (#5 20A + #6 15A) y neutros",
                   ru: "3. Ось южного окна (87\"/90\") проверена; коробка под мойкой @ 14\" на 2 раздельных суппорта (#5 20A + #6 15A)" },
        { k: "h4", en: "4. Hood HD-1 flush 1-gang 2\"×3\" (~1\" proud @ 33\"±2-1/4\" N, 83\"–86\" AFF + BRLW1) — replaces retired 4×4 @ 100\"",
                   es: "4. Campana HD-1 caja sencilla 2\"×3\" (~1\" salida @ 33\"±2-1/4\" N, 83\"–86\" AFF + BRLW1) — reemplaza caja 4×4 @ 100\"",
                   ru: "4. Вытяжка HD-1 одинарная 2\"×3\" (выступ ~1\" @ 33\"±2-1/4\" С, 83\"–86\" + BRLW1) — вместо старой 4×4 @ 100\"" },
        { k: "h5", en: "5. Bathroom (#13 · 100% 12/2): pull SEPARATE 12/2 Toilet drop before wall tile (split-ready to Spare #19); pocket door RETIRED -> 28\" out-swing door",
                   es: "5. Baño (#13 · 100% 12/2): bajar 12/2 SEPARADO al Inodoro antes de azulejo (lista para Reserva #19); corrediza RETIRADA -> puerta 28\" afuera",
                   ru: "5. Ванная (#13 · 100% 12/2): отдельный спуск 12/2 к унитазу до плитки (под резерв #19); распашная дверь 28\" наружу" }
      ];
      inner =
        '<div class="u4h-item-list">' +
          holds.map(function (h) {
            var done = !!state.holds[h.k];
            return '<div class="u4h-item-card' + (done ? " is-selected" : "") + '"><label style="display:flex;gap:10px;align-items:center;flex:1;cursor:pointer">' +
              '<input type="checkbox" data-h="' + h.k + '"' + (done ? " checked" : "") + ' style="width:17px;height:17px;accent-color:var(--cobalt)">' +
              '<span class="u4h-item-name" style="font-size:13px">' + esc(t(h.en, h.es, h.ru)) + '</span></label></div>';
          }).join("") +
        '</div>' +
        renderEquip();
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="kelecPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + '>&larr; ' + esc(t("Prev", "Anterior", "Назад")) + '</button>' +
      '<span class="u4h-pager-count">' + esc(t("Step ", "Paso ", "Шаг ")) + (idx + 1) + esc(t(" of ", " de ", " из ")) + STEPS.length + '</span>' +
      '<button type="button" id="kelecNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + '>' + esc(t("Next", "Siguiente", "Далее")) + ' &rarr;</button>' +
    '</div>';

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head"><div>' +
          '<div class="u4h-title">' + esc(title) + '</div>' +
          '<div class="u4h-sub">' + esc(sub) + '</div>' +
        '</div><span class="u4h-compass">Rev R6 · 15+5</span></div>' +
        stepPills + inner + pager +
      '</div>';

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); render(); window.scrollTo(0, 0); });
    });
    host.querySelectorAll("[data-mmode]").forEach(function (b) {
      b.addEventListener("click", function () { state.mapMode = b.getAttribute("data-mmode"); render(); });
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
    host.querySelectorAll("[data-pfilt]").forEach(function (b) {
      b.addEventListener("click", function () { state.panelFilter = b.getAttribute("data-pfilt"); render(); });
    });
    host.querySelectorAll("[data-attic-flt]").forEach(function (b) {
      b.addEventListener("click", function () { state.atticFilter = b.getAttribute("data-attic-flt"); render(); });
    });
    host.querySelectorAll("[data-attic-sw]").forEach(function (b) {
      b.addEventListener("click", function () { state.atticSwitchOpt = b.getAttribute("data-attic-sw"); render(); });
    });
    host.querySelectorAll("[data-h]").forEach(function (cb) {
      cb.addEventListener("change", function () { state.holds[cb.getAttribute("data-h")] = cb.checked; render(); });
    });
    var eqBtn = document.getElementById("kelecEquipBtn");
    if (eqBtn) eqBtn.addEventListener("click", function () { state.equipOpen = !state.equipOpen; render(); });
    var pBtn = document.getElementById("kelecPrevBtn");
    var nBtn = document.getElementById("kelecNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });

    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext();
    }
  }

  function applyKelecView(args) {
    args = args || {};
    var changed = false;
    var wallRaw = String(args.wall || "").toLowerCase().trim();
    if (["south", "east", "west", "north", "dining", "bathroom", "laundry", "bedroom", "living"].indexOf(wallRaw) >= 0) {
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
        var map = { overview: "outlets", all: "outlets", d04: "panel", subpanel: "panel", checklist: "holds", attic: "attic-runs" };
        var id = map[s] || s;
        if (STEPS.some(function (x) { return x.id === id; })) { state.step = id; changed = true; }
      }
    }
    if (changed) render();
    return changed;
  }

  window.U4PlanControl = {
    showView: function (args) { return applyKelecView(args); },
    getState: function () {
      return {
        planId: "kitchen-electrical",
        step: state.step,
        mapMode: state.mapMode,
        wall: state.step === "walls" ? state.wallTab : "all",
        selectedCircuit: state.selectedCircuit,
        summary: "Whole-Unit Electrical Rev R6 (15 Active + 5 Spares): step=" + state.step + ", mapMode=" + state.mapMode + ", circuit=" + state.selectedCircuit
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
        titleEn: "Whole-Unit Electrical (Rev R6)",
        titleEs: "Eléctrico Completo Unidad 4 (Rev R6)",
        titleRu: "Электрика всей квартиры (Rev R6)",
        getContext: function () {
          return "Rev R6 (15 Active #1-#10, #12-#16 + 5 Open Spares #11, #17-#20). Dining Room named normally; #10 shares Living/Dining/Bedroom/Hall (Reuse+New); #11 Spare. Step=" + state.step + ", ActiveCircuit=" + state.selectedCircuit;
        },
        quickPrompts: function (lang) {
          if (lang === "es") return ["¿Qué comparte el circuito #10?", "¿Dónde va la zona prohibida del Panel?", "¿Qué usa el Baño #13?"];
          if (lang === "ru") return ["Что подключено к линии #10?", "Где запретная зона щитка?", "Как устроена ванная #13?"];
          return ["What shares Circuit #10?", "Where is the Panel no-screw zone?", "How is Bathroom #13 wired?"];
        }
      });
    }
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
