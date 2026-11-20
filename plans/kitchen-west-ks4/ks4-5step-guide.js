(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const U4_PRODUCT_LOOKUP_URL = (params.get("lookup_api") || "https://mac-mini.tailcf4007.ts.net").replace(/\/$/, "") + "/api/unit4/product-lookup";

  const I18N = {
    en: {
      brandTitle: "Unit 4 Binder",
      navOverview: "Overview",
      navRooms: "Rooms & trades",
      home: "Home",
      decisions: "Open decisions",
      kitchen: "Kitchen",
      ovenRange: "Oven & Range",
      sinkNorth: "Sink & North Wall",
      bedroom: "Bedroom",
      bathroom: "Bathroom",
      hvac: "HVAC & Attic",
      electrical: "Electrical",
      plans: "Plans",
      menuLabel: "Menu",
      rooms: "Rooms",
      note: "Note",
      addNote: "+ Note",
      askAi: "Ask AI",
      currentPlans: "Current plans",
      planHint: "Tap any plan to view beside checklist",
      checklist: "Checklist",
      techSpecs: "Full technical details & code references",
      noteTitle: "Add site note or photo",
      noteRoomLabel: "Room",
      noteFromLabel: "From",
      noteTextLabel: "What changed or needs checking?",
      saveNote: "Save note",
      aiTitle: "Unit 4 AI Helper (Voice & Text)",
      send: "Send",
      doneOf: (d, t) => `${d} of ${t} done`,
      openInPane: "Interactive plan",
      viewing: "Viewing",
      inTabs: "Interactive · open",
      pdf: "Manual PDF",
      collapse: "Hide",
      circleMark: "Circle mark",
      markingOn: "Tap SVG to drop pin",
      exportPdf: "Export PDF",
      clearPins: "Clear marks",
      hoodSlider: "Hood bottom (AFF)",
      passViking: (c) => `PASS · ${c}" above range (Viking 30"–36" OK)`,
      failLow: (c) => `FAIL · ${c}" is below Viking 30" minimum`,
      failHigh: (c) => `WARN · ${c}" exceeds 36" recommended max`,
    },
    es: {
      brandTitle: "Carpeta Unidad 4",
      navOverview: "Resumen",
      navRooms: "Cuartos y oficios",
      home: "Inicio",
      decisions: "Decisiones abiertas",
      kitchen: "Cocina",
      ovenRange: "Estufa y Campana",
      sinkNorth: "Fregadero y Muro Norte",
      bedroom: "Recámara",
      bathroom: "Baño",
      hvac: "Clima y Ático",
      electrical: "Electricidad",
      plans: "Planos",
      menuLabel: "Menú",
      rooms: "Cuartos",
      note: "Nota",
      addNote: "+ Nota",
      askAi: "Ayuda IA",
      currentPlans: "Planos vigentes",
      planHint: "Toca un plano para verlo junto a la lista",
      checklist: "Lista de pasos",
      techSpecs: "Detalles técnicos y código",
      noteTitle: "Agregar nota o foto de obra",
      noteRoomLabel: "Cuarto",
      noteFromLabel: "De",
      noteTextLabel: "¿Qué cambió o falta verificar?",
      saveNote: "Guardar nota",
      aiTitle: "Asistente IA Unidad 4 (Voz y Texto)",
      send: "Enviar",
      doneOf: (d, t) => `${d} de ${t} listos`,
      openInPane: "Plano interactivo",
      viewing: "Viendo",
      inTabs: "Interactivo · abierto",
      pdf: "Manual PDF",
      collapse: "Ocultar",
      circleMark: "Marcar círculo",
      markingOn: "Toca el plano para marcar",
      exportPdf: "Exportar PDF",
      clearPins: "Borrar marcas",
      hoodSlider: "Base campana (AFF)",
      passViking: (c) => `OK · ${c}" sobre estufa (rango Viking 30"–36")`,
      failLow: (c) => `FALLA · ${c}" está debajo del mínimo Viking de 30"`,
      failHigh: (c) => `AVISO · ${c}" pasa el máximo de 36"`,
    }
  };

  const state = {
    lang: params.get("lang") === "es" ? "es" : "en",
    theme: (params.get("theme") || "").toLowerCase() === "dark" ? "dark" : "light",
    activeTab: "range-hood-plan",
    installStep: "ks4-live",
    hoodAff: 68,
    floorInstalled: false,
    floorUndecided: true,
    floorT: 0.75,
    blockingFocus: "both",
    studLayout: "1bay",
    jboxMode: "oem1gang",
    koSide: "north",
    ductMode: "attic",
    gasProtrusion: "recessed",
    vikingTrim: "island1",
    tileW: null,
    tileH: null,
    tileOrient: "horizontal",
    tilePattern: "stacked",
    tileTrim: "quarter",
    tileTrimCeiling: false,
    tileBoxSqft: null,
    tilePriceSqft: null,
    tileWastePct: 15,
    tileProductKey: null,
    tileShowCustom: false,
    tileCustomName: "",
    tileUrlInput: "",
    tileLookupBusy: false,
    tileLookupNoteEn: "",
    tileLookupNoteEs: "",
    tileSnapPreview: "",
    prevPlanBeforeManual: null,
    calcOpenByStep: {},
    foldOpen: { edgeBubble: true },
    voiceOpen: false,
    voiceLive: false,
    voiceMuted: false,
    voiceReply: "",
    selectedMarkId: null,
    marksBySheet: {
      "ks4-live": [],
      "hood-s1": [],
      "hood-s2": [],
      "range-gas": [],
      "tile-plan": []
    }
  };

  const PLANS = {
    "range-hood-plan": {
      id: "range-hood-plan",
      tabEn: "Range & Hood Install Plan",
      tabEs: "Plan de Estufa y Campana",
      titleEn: "Range & Hood Install Plan (5 Connected Steps)",
      titleEs: "Plan de Instalación de Estufa y Campana (5 Pasos)",
      subEn: "One connected plan: 1. Wall Layout · 2. Blocking · 3. Vent & 15A · 4. Gas & Outlet · 5. HardieBacker & Tile",
      subEs: "Un solo plan conectado: 1. Alzado · 2. Respaldos · 3. Ducto y 15A · 4. Gas y Contacto · 5. HardieBacker y Azulejo",
      kind: "interactive-unified"
    },
    "ks4-live": {
      id: "ks4-live",
      parentPlan: "range-hood-plan",
      stepNum: 1,
      tabEn: "1. Wall Layout",
      tabEs: "1. Alzado",
      titleEn: "Range & Hood Install Plan — Step 1: Wall Layout & Height",
      titleEs: "Plan Estufa y Campana — Paso 1: Alzado del Muro y Altura",
      subEn: "Full West wall at 1:1 scale (18\" | 30\" | 18\"), live hood height slider & HardieBacker + tile",
      subEs: "Muro Oeste escala 1:1 (18\" | 30\" | 18\"), altura de campana y HardieBacker + azulejo",
      kind: "interactive"
    },
    "hood-s1": {
      id: "hood-s1",
      parentPlan: "range-hood-plan",
      stepNum: 2,
      tabEn: "2. Blocking",
      tabEs: "2. Respaldos",
      titleEn: "Range & Hood Install Plan — Step 2: Wood Blocking & Mounting",
      titleEs: "Plan Estufa y Campana — Paso 2: Respaldos y Puntos de Montaje",
      subEn: "Exact hanging screw heights (synced to Step 1), compact 1-bay blocking & ceiling bracket",
      subEs: "Altura exacta de los 2 tornillos (conectada al Paso 1), respaldos compactos y soporte superior",
      kind: "interactive-sheet-1"
    },
    "hood-s2": {
      id: "hood-s2",
      parentPlan: "range-hood-plan",
      stepNum: 3,
      tabEn: "3. Vent & 15A",
      tabEs: "3. Ducto y 15A",
      titleEn: "Range & Hood Install Plan — Step 3: Vent Duct & 15A Wiring",
      titleEs: "Plan Estufa y Campana — Paso 3: Ducto 6\" y Caja Eléctrica 15A",
      subEn: "True-scale 8-5/8\"×7-1/2\" casing cutaway, 1-gang box right above hood & dedicated duct tie-in",
      subEs: "Corte real de cubierta 8-5/8\"×7-1/2\", caja 1-gang arriba de la campana y empalme al ducto",
      kind: "interactive-sheet-2"
    },
    "range-gas": {
      id: "range-gas",
      parentPlan: "range-hood-plan",
      stepNum: 4,
      tabEn: "4. Gas & Outlet",
      tabEs: "4. Gas y Contacto",
      titleEn: "Range & Hood Install Plan — Step 4: Stove Gas & Outlet Check",
      titleEs: "Plan Estufa y Campana — Paso 4: Gas y Contacto de Estufa",
      subEn: "Check gas line height (9/16\"–4-15/16\" off floor), 2\" max wall poke-out & side-by-side 120V outlet",
      subEs: "Revisar altura de gas (9/16\"–4-15/16\" del piso), salida máx. 2\" y contacto 120V al lado",
      kind: "interactive-sheet-4"
    },
    "tile-plan": {
      id: "tile-plan",
      parentPlan: "range-hood-plan",
      stepNum: 5,
      tabEn: "5. Tile Plan",
      tabEs: "5. Azulejo",
      titleEn: "Range & Hood Install Plan — Step 5: HardieBacker & Full-Height Tile Plan",
      titleEs: "Plan Estufa y Campana — Paso 5: HardieBacker y Azulejo hasta el Techo",
      subEn: "Enter tile size or scan product for live takeoff, centered layout, W1/W2 counter outlets & zero 4\" curb",
      subEs: "Ingresa medida o escanea producto para cálculo de cajas, trazo centrado, contactos W1/W2 y sin zoclo de 4\"",
      kind: "interactive-sheet-5"
    },
    "zephyr-oem": {
      id: "zephyr-oem",
      tabEn: "Zephyr Manual",
      tabEs: "Manual Zephyr",
      titleEn: "Zephyr Savona Hood Manual (ZSA-E30AS)",
      titleEs: "Manual Campana Zephyr Savona (ZSA-E30AS)",
      subEn: "Official PDF · Page 3 hardwire & Page 4 mounting (Drive link included)",
      subEs: "PDF oficial · Pág. 3 eléctrica y Pág. 4 montaje (con enlace Drive)",
      kind: "pdf",
      driveUrl: "https://drive.google.com/file/d/1QH6N_nnFVBHvfaEZiU0ZP1pyJDXAeNz3/view",
      specUrl: "https://drive.google.com/file/d/1D2YflscPC7hJGxr-AptP887Gci1LZLKO/view",
      pages: [
        { titleEn: "Page 1 & 2 — Clearances & Ducting (6\" Rigid Metal Only)", titleEs: "Págs. 1 y 2 — Distancias y Ducto (Solo Metal Rígido de 6\")", bodyEn: "Minimum 6\" round or 3-1/4\" × 10\" rectangular rigid smooth metal duct (max 100 equiv ft; deduct 15 ft per 90° elbow, 9 ft per 45° elbow, 30 ft for roof/wall cap). Never use flexible duct or vent into attic/wall cavity. Note: Viking range 30\"–36\" clearance overrides Zephyr's 28\" minimum.", bodyEs: "Mínimo ducto metálico rígido liso de 6\" redondo (o 3-1/4\" × 10\" rectangular), máximo 100 pies equiv. (restar 15 pies por codo 90°, 9 pies por codo 45°, 30 pies por sombrero de techo/muro). Nunca usar ducto flexible ni ventilar al ático o muro. Nota: la regla de 30\"–36\" de Viking manda sobre el mínimo de 28\" de Zephyr." },
        { titleEn: "Page 3 — Dimensions & Electrical (Direct Hardwire)", titleEs: "Pág. 3 — Medidas y Electricidad (Conexión Directa)", bodyEn: "Hood canopy: 29-7/8\" W × 19-7/16\" D × 10-3/4\" H. Chimney casing: 8-5/8\" W × 7-1/2\" D (stock telescopic reach 28-1/2\"–44\", max 117\" ceiling; Z1C-00SA extension kit reaches 14'). Power: 120V 60Hz, 415W / 3.4A, dedicated 15A or 20A 2-wire + ground branch circuit wired straight into the hood's built-in top wiring box (with breaker lock-off at subpanel).", bodyEs: "Cuerpo de campana: 29-7/8\" ancho × 19-7/16\" fondo × 10-3/4\" alto. Cubierta de chimenea: 8-5/8\" ancho × 7-1/2\" fondo (alcance telescópico estándar 28-1/2\"–44\", hasta techo de 117\"; kit extensión Z1C-00SA hasta 14 pies). Energía: 120V 60Hz, 415W / 3.4A, circuito dedicado 15A o 20A de 2 hilos + tierra conectado directo a la caja eléctrica propia de la campana (con seguro en el breaker)." },
        { titleEn: "Page 4 (fig. A) — Exact Mounting Points", titleEs: "Pág. 4 (fig. A) — Puntos Exactos de Montaje", bodyEn: "Mark the hood bottom (67\"–68\" off finished floor) and vertical centerline (33\" from South corner). The 2 hanging screws sit 9-9/16\" above the hood bottom, spaced 9-27/32\" apart (±4-15/16\" from center) into solid wood blocking, plus the narrow 8-5/8\" upper chimney bracket directly below the ceiling or soffit.", bodyEs: "Marca el borde inferior de la campana (67\"–68\" del piso terminado) y el centro vertical (33\" desde la esquina Sur). Los 2 tornillos de carga van 9-9/16\" arriba del borde inferior, separados 9-27/32\" (±4-15/16\" del centro) en madera sólida, más el soporte angosto superior de 8-5/8\" justo debajo del techo o cajillo." }
      ]
    },
    "viking-oem": {
      id: "viking-oem",
      tabEn: "Viking Manual",
      tabEs: "Manual Viking",
      titleEn: "Viking 30\" Gas Range Manual (VGCC5304BSS)",
      titleEs: "Manual Estufa Viking 30\" (VGCC5304BSS)",
      subEn: "Official Form F20543H · Hood height, 1/2\" gas stub (≤ 2\"), 120V outlet",
      subEs: "Manual F20543H · Altura de campana, gas 1/2\" (máx. 2\") y contacto 120V",
      kind: "pdf",
      driveUrl: "https://www.manualslib.com/p/897490/Viking-Professional-Custom-Vgcc5304bss.html",
      specUrl: "https://www.vikingrange.com/",
      pages: [
        { titleEn: "Hood Clearance Rule (Governs Over Zephyr)", titleEs: "Altura de Campana (Manda sobre Zephyr)", bodyEn: "Viking VGCC5304BSS requires 30\" minimum to 36\" maximum open space from the 36\" cooking surface to the bottom of the metal hood (= 66\"–72\" off finished floor; target 67\"–68\"). Mounting at 64\" fails Viking.", bodyEs: "La estufa Viking VGCC5304BSS exige mínimo 30\" y máximo 36\" libres sobre la superficie de cocción de 36\" hasta la base de la campana (= 66\"–72\" del piso terminado; meta 67\"–68\"). Colgarla a 64\" falla la regla Viking." },
        { titleEn: "Low Rear Gas Line & Shutoff Valve (≤ 2\" Max Poke-Out)", titleEs: "Tubería de Gas Baja y Llave de Paso (Máx. 2\" de Salida)", bodyEn: "1/2\" rigid gas stub + accessible manual T-handle shutoff valve placed very low (9/16\" to 4-15/16\" off finished floor), recessed in a wall box or poking out 2\" max so the stove pushes back flush. Air-seal all wall and floor holes behind the range and pressure-test before closing the wall.", bodyEs: "Tubería rígida de gas de 1/2\" con llave de paso manual accesible colocada muy baja (entre 9/16\" y 4-15/16\" del piso terminado), empotrada en caja o saliendo máximo 2\" para que la estufa entre al ras. Sellar todos los huecos detrás de la estufa y hacer prueba de presión antes de cerrar el muro." },
        { titleEn: "Standard 120V / 15A Plug Outlet (14/2 Wire — No 240V)", titleEs: "Contacto Normal 120V / 15A (Cable 14/2 — Sin 240V)", bodyEn: "All-gas range: needs a standard grounded 120V 3-prong outlet on its own dedicated 15A circuit run with 14/2 copper wire with ground (factory 4-ft cord plugs straight in for igniters, light, and fan). Place side-by-side with the gas stub in that same low strip, clear of the anti-tip bracket at 25-3/4\" from the South corner.", bodyEs: "Estufa 100% a gas: solo requiere contacto normal aterrizado de 120V (3 patas) en circuito dedicado de 15A con cable de cobre 14/2 con tierra (su cable de fábrica de 4 pies conecta directo para chisperos, luz y ventilador). Colocar junto al gas en la misma franja baja, libre del soporte antivuelco a 25-3/4\" de la esquina Sur." }
      ]
    },
    "bedroom-r2": {
      id: "bedroom-r2",
      tabEn: "Bedroom Trim Guide",
      tabEs: "Guía Molduras Recámara",
      titleEn: "Bedroom Wall Moulding Guide (Walls A–D)",
      titleEs: "Guía de Molduras en Recámara (Muros A–D)",
      subEn: "Wall A–D elevations, 9-1/2\" baseboard alignment, 99\" high trim line",
      subEs: "Elevaciones Muros A–D, zoclo 9-1/2\", línea superior 99\"",
      kind: "pdf",
      pages: [
        { title: "Wall A (North) & Wall C (South) — Centerline Tape-Fit", body: "Align lower frames to existing 9-1/2\" baseboard and upper line to 99\" AFF. Keep Wall B (East bay window) frame-free." }
      ]
    }
  };

  const SHEET_ORDER = ["ks4-live", "hood-s1", "hood-s2", "range-gas", "tile-plan", "zephyr-oem", "viking-oem"];

  const INSTALL_STEPS = ["ks4-live", "hood-s1", "hood-s2", "range-gas", "tile-plan"];

  function t(key, ...args) {
    const val = I18N[state.lang][key];
    return typeof val === "function" ? val(...args) : val;
  }

  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById("u4gToast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function scrollPlanTop() {
    const reset = () => { window.scrollTo(0, 0); };
    reset();
    requestAnimationFrame(reset);
  }

  function openPlan(planId) {
    const p = PLANS[planId];
    if (p && p.kind === "pdf" && state.activeTab && PLANS[state.activeTab] && PLANS[state.activeTab].kind !== "pdf") {
      state.prevPlanBeforeManual = state.activeTab === "range-hood-plan" ? state.installStep : state.activeTab;
    }
    if (p && p.parentPlan) {
      state.installStep = planId;
      state.activeTab = p.parentPlan;
    } else if (p) {
      state.activeTab = planId;
    }
    renderDrawer();
    scrollPlanTop();
  }

  function installStepNavHtml(curStep) {
    const es = state.lang === "es";
    return `
      <div class="sheet-seg-tabs" role="tablist" aria-label="Range & Hood Install Plan Steps">
        ${INSTALL_STEPS.map(sid => {
          const sp = PLANS[sid];
          const act = curStep === sid;
          return `<button class="seg-tab-btn ${act ? "active" : ""}" data-jump-sheet="${sid}" type="button" role="tab" aria-selected="${act}">${es ? sp.tabEs : sp.tabEn}</button>`;
        }).join("")}
      </div>
    `;
  }

  function renderSheetPager(planId) {
    const es = state.lang === "es";
    const idx = SHEET_ORDER.indexOf(planId);
    if (idx < 0) return "";
    const prevId = idx > 0 ? SHEET_ORDER[idx - 1] : null;
    const nextId = idx < SHEET_ORDER.length - 1 ? SHEET_ORDER[idx + 1] : null;
    const prev = prevId ? PLANS[prevId] : null;
    const next = nextId ? PLANS[nextId] : null;
    const isStep = INSTALL_STEPS.includes(planId);
    return `
      <div class="binder-pager">
        <button class="pager-btn" ${prevId ? `data-jump-sheet="${prevId}"` : "disabled"} type="button">← ${prev ? (es ? prev.tabEs : prev.tabEn) : ""}</button>
        <span class="pager-meta">${isStep ? (es ? `Paso ${INSTALL_STEPS.indexOf(planId) + 1} de 5` : `Step ${INSTALL_STEPS.indexOf(planId) + 1} of 5`) : (es ? "Manual" : "Manual")}</span>
        <button class="pager-btn" ${nextId ? `data-jump-sheet="${nextId}"` : "disabled"} type="button">${next ? (es ? next.tabEs : next.tabEn) : ""} →</button>
      </div>
    `;
  }

  function triggerBlueprintPdfExport() {
    const es = state.lang === "es";
    showToast(es ? "Generando PDF de 2 páginas..." : "Generating 2-page print PDF...");
    if (window.U4PLAN && typeof window.U4PLAN.setLang === "function") {
      window.U4PLAN.setLang(state.lang);
    }
    const bpBtn = document.getElementById("btn-download-pdf");
    if (bpBtn) bpBtn.click();
    else window.print();
  }

  function renderVoiceStrip() { /* standalone 5-step mode uses inline toast & mark replies */ }
  function renderPage() {}
  function renderAll() { renderTopChrome(); renderDrawer(); }

  function setAppMode(mode) {
    const isBp = mode === "blueprint";
    const guideEl = document.getElementById("u4-5step-app");
    const bpEl = document.getElementById("blueprint-sheet-shell");
    if (guideEl) guideEl.hidden = isBp;
    if (bpEl) bpEl.hidden = !isBp;
    document.body.classList.toggle("mode-5step", !isBp);
    if (isBp && window.U4PLAN && typeof window.U4PLAN.render === "function") {
      window.U4PLAN.setLang(state.lang);
      window.U4PLAN.render();
    }
    window.scrollTo(0, 0);
  }

  function renderTopChrome() {
    const es = state.lang === "es";
    const isWikiPlans = /\/plans\//.test(window.location.pathname || "");
    const backHref = isWikiPlans ? "../../#kitchen-oven-range" : "../../index.html#kitchen-oven-range";
    const fpHref = (isWikiPlans ? "../kitchen-floor-plan/index.html" : "../floor-plan-pilot/index.html") + `?lang=${state.lang}`;
    const backEl = document.getElementById("u4gBackKitchen");
    const fpEl = document.getElementById("u4gFloorPlanLink");
    const langBtn = document.getElementById("u4gLangBtn");
    const themeBtn = document.getElementById("u4gThemeBtn");
    const pdfBtn = document.getElementById("u4gPdfBtn");
    const bpBtn = document.getElementById("u4gBlueprintBtn");
    const holdEl = document.getElementById("u4gHoldStrip");
    const retLbl = document.getElementById("u4gBpReturnLabel");
    const retBtn = document.getElementById("u4gBpReturnBtn");

    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-theme", state.theme);
    if (window.U4LiveAi && typeof window.U4LiveAi.setLang === "function") window.U4LiveAi.setLang(state.lang);
    if (backEl) { backEl.href = backHref; backEl.textContent = es ? "← Cocina" : "← Back to Kitchen"; }
    if (fpEl) { fpEl.href = fpHref; fpEl.textContent = es ? "Planta de Cocina →" : "Full Floor Plan →"; }
    if (langBtn) langBtn.textContent = es ? "English (EN)" : "Español (MX)";
    if (themeBtn) themeBtn.textContent = state.theme === "dark" ? (es ? "☀ Claro" : "☀ Light") : (es ? "☾ Oscuro" : "☾ Dark");
    if (pdfBtn) pdfBtn.textContent = es ? "Imprimir / PDF" : "Print / PDF";
    if (bpBtn) bpBtn.hidden = true;
    if (holdEl) {
      holdEl.innerHTML = es
        ? "<strong>SOLO MAQUETA Y PLANEACIÓN:</strong> Referencia pre-tablaroca (viernes 20 nov). <strong>NO</strong> autoriza conexión final de gas/electricidad ni cierre de muro."
        : "<strong>MOCKUP &amp; PLANNING ONLY:</strong> Pre-drywall mockup guide (Fri Nov 20). <strong>NOT</strong> final gas/electrical tie-in and <strong>NOT</strong> drywall close-in permission.";
    }
    if (retLbl) retLbl.textContent = es ? "Viendo hoja técnica CAD y formulario Tailnet (:8444)" : "Viewing Technical CAD Blueprint & Tailnet (:8444) form";
    if (retBtn) retBtn.textContent = es ? "← Volver a la Guía de 5 Pasos" : "← Back to 5-Step Interactive Guide";
  }

  function fmtFrac(v) {
    const whole = Math.floor(v);
    const rem = Math.round((v - whole) * 8);
    if (rem === 0) return String(whole);
    const map = { 1: "1/8", 2: "1/4", 3: "3/8", 4: "1/2", 5: "5/8", 6: "3/4", 7: "7/8" };
    return whole > 0 ? `${whole}-${map[rem]}` : map[rem];
  }

  function currentSheetKey() {
    if (state.activeTab === "range-hood-plan") return state.installStep || "ks4-live";
    if (["ks4-live", "hood-s1", "hood-s2", "range-gas", "tile-plan"].includes(state.activeTab)) return state.activeTab;
    return null;
  }

  function detectZone(sheetKey, x, y) {
    const es = state.lang === "es";
    if (sheetKey === "ks4-live") {
      if (y < 54) return es ? "Refuerzo superior (110\"–121-1/2\")" : "Upper Blocking (110\"–121-1/2\")";
      if (x >= 196 && x <= 212 && y >= 94 && y <= 114) return es ? "Caja 1-gang 15A (84\"–88\" AFF)" : "1-Gang 15A Box (84\"–88\" AFF)";
      if (x >= 180 && x <= 200 && y < 140) return es ? "Ducto rígido 6\"" : "6\" Rigid Duct";
      if (y >= 104 && y <= 134) return es ? "Refuerzo inferior (72\"–83\" · 9-27/32\")" : "Lower Blocking (72\"–83\" · 9-27/32\" screws)";
      if (y >= 122 && y <= 165 && x >= 156 && x <= 224) return es ? "Campana Zephyr 30\"" : "Zephyr 30\" Hood";
      if (y >= 205 && x >= 157 && x <= 223) return es ? "Estufa Viking 30\"" : "Viking 30\" Range";
      if (y >= 205 && x >= 116 && x < 157) return es ? "Gabinete base Sur (18\")" : "South 18\" Base Cabinet";
      if (y >= 205 && x > 223 && x <= 264) return es ? "Gabinete base Norte (18\")" : "North 18\" Base Cabinet";
      return es ? "Muro Oeste" : "West Wall";
    }
    if (sheetKey === "hood-s1") {
      if (y < 76) return es ? "Soporte superior 8-5/8\" (110\"–121-1/2\")" : "Upper 8-5/8\" Bracket & Blocking (110\"–121-1/2\")";
      if (y >= 124 && y <= 216) return es ? "Tornillos Línea B (9-27/32\" en C/L 33\")" : "Line B Screws (9-27/32\" on C/L 33\")";
      return es ? "Postes muro Oeste (16\" OC)" : "West Wall Stud Framing (16\" OC)";
    }
    if (sheetKey === "hood-s2") {
      if (y < 158) return es ? "Corte chimenea 8-5/8\"×7-1/2\" y caja 1-gang" : "8-5/8\"×7-1/2\" Chimney Cutaway & 1-Gang Box";
      return es ? "Empalme a ducto dedicado de cocina (6\")" : "Dedicated Kitchen Exhaust Tie-In (6\")";
    }
    if (sheetKey === "range-gas") {
      if (y < 145) return es ? "Zona trasera Viking (gas 1/2\" + 120V + antivuelco)" : "Viking Lower Rear Utility Zone (Gas + 120V + Anti-Tip)";
      return es ? "Corte lateral: salida máxima de gas (≤ 2\") y respaldo trasero" : "Side Depth Cutaway: Max Gas Protrusion (≤ 2\") & Rear Trim";
    }
    if (sheetKey === "tile-plan") {
      if (y >= 175 && x < 165) return es ? "Contacto de cubierta izquierdo W1 (9\" del Sur)" : "Left Countertop Outlet W1 (9\" from South)";
      if (y >= 175 && x > 215) return es ? "Contacto de cubierta derecho W2 (57\" del Sur)" : "Right Countertop Outlet W2 (57\" from South)";
      if (y > 215) return es ? "Unión azulejo con cubierta (silicón, sin zoclo de 4\")" : "Tile-to-Counter Seam (Silicone only, no 4\" stone curb)";
      return es ? "Trazo de azulejo sobre HardieBacker 1/2\"" : "Full-Height Tile Layout on 1/2\" HardieBacker";
    }
    return es ? "Punto en plano" : "Plan Spot";
  }

  const MIC_SVG = `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2.5" width="6" height="9.5" rx="3"/><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0"/><line x1="10" y1="15" x2="10" y2="18"/><line x1="7" y1="18" x2="13" y2="18"/></svg>`;

  function sheetViewBoxHeight(sheetKey) {
    return sheetKey === "tile-plan" ? 292 : (sheetKey === "range-gas" ? 288 : 310);
  }

  function activePinSteerHtml(sheetKey) {
    const es = state.lang === "es";
    const marks = state.marksBySheet[sheetKey] || [];
    const idx = marks.findIndex(m => m.id === state.selectedMarkId);
    if (idx < 0) return "";
    const m = marks[idx];
    const isListening = dictatingMarkId === m.id;
    const vbH = sheetViewBoxHeight(sheetKey);
    const pctX = (m.x / 380) * 100;
    const pctY = (m.y / vbH) * 100;
    const placeBelow = pctY < 62;
    const topStyle = placeBelow
      ? `top:calc(${pctY.toFixed(1)}% + ${m.r + 8}px);`
      : `bottom:calc(${(100 - pctY).toFixed(1)}% + ${m.r + 8}px);`;
    const leftPct = Math.max(2, Math.min(50, pctX - 34));
    return `
      <div class="pin-steer" id="activePinSteer" style="left:clamp(8px, ${leftPct.toFixed(1)}%, calc(100% - 304px));${topStyle}">
        <div class="pin-steer-head">
          <div style="display:flex;align-items:center;gap:5px;min-width:0">
            <span class="mark-num" style="width:18px;height:18px;font-size:10px;background:var(--cobalt)">${idx + 1}</span>
            <span class="mark-zone">${detectZone(sheetKey, m.x, m.y)}</span>
          </div>
          <button class="pin-steer-btn" data-del-mark="${m.id}" type="button" style="height:22px;padding:0 6px;color:var(--crimson)">×</button>
        </div>
        <div class="pin-steer-row">
          <input id="steerInput" data-input-mark="${m.id}" type="text" value="${(m.comment || "").replace(/"/g, "&quot;")}" placeholder="${es ? "Escribe o usa el micrófono..." : "Ask or change this spot..."}">
          <button class="pin-steer-btn ${isListening ? "listening" : ""}" data-dictate-mark="${m.id}" type="button" aria-label="Voice dictation" title="Microphone" style="display:inline-flex;align-items:center;justify-content:center;width:30px;padding:0">${MIC_SVG}</button>
          <button class="pin-steer-btn send" data-send-steer="${m.id}" type="button">${es ? "Enviar" : "Send"}</button>
        </div>
        <div class="pin-steer-foot">
          <span>${es ? "Arrastra el círculo para moverlo" : "Drag circle to move · pull dot to resize"}</span>
          <div style="display:flex;gap:4px">
            <button class="pin-steer-btn" data-send-ask="${m.id}" type="button" style="height:22px;padding:0 7px">${es ? "Preguntar" : "Ask"}</button>
            <button class="pin-steer-btn" data-send-modify="${m.id}" type="button" style="height:22px;padding:0 7px">${es ? "Modificar" : "Modify"}</button>
          </div>
        </div>
        ${m.reply ? `<div class="comment-reply ${m.status === "applied" ? "applied" : ""}" style="font-size:11.5px;padding:5px 8px">${m.reply}</div>` : ""}
      </div>
    `;
  }

  function svgMarksHtml(sheetKey) {
    const marks = state.marksBySheet[sheetKey] || [];
    const maxTagY = sheetViewBoxHeight(sheetKey) - 22;
    return marks.map((m, idx) => {
      const sel = m.id === state.selectedMarkId;
      const stroke = m.status === "applied" ? "#1B6B46" : (sel ? "#184E77" : "#B42318");
      const fill = m.status === "applied" ? "rgba(27,107,70,0.14)" : (sel ? "rgba(24,78,119,0.14)" : "rgba(180,35,24,0.12)");
      // Callout leader line extending cleanly to the left or right edge
      const goRight = m.x >= 190;
      const edgeX = m.x + (goRight ? m.r : -m.r);
      const tagX = goRight ? Math.min(342, m.x + m.r + 24) : Math.max(38, m.x - m.r - 24);
      const tagY = Math.max(22, Math.min(maxTagY, m.y - 6));
      const handleX = m.x + Math.round(m.r * 0.72);
      const handleY = m.y + Math.round(m.r * 0.72);
      return `
        <g class="mark-group" data-mark-id="${m.id}">
          <line x1="${edgeX}" y1="${m.y}" x2="${tagX}" y2="${tagY}" stroke="${stroke}" stroke-width="1.4" stroke-dasharray="3 2"/>
          <circle cx="${m.x}" cy="${m.y}" r="${m.r}" fill="${fill}" stroke="${stroke}" stroke-width="${sel ? 2.4 : 1.7}" stroke-dasharray="${sel ? 'none' : '4 2'}"/>
          <rect x="${tagX - 18}" y="${tagY - 10}" width="36" height="20" rx="10" fill="${stroke}" stroke="#FFFFFF" stroke-width="1.5"/>
          <text x="${tagX}" y="${tagY + 3.5}" text-anchor="middle" font-size="9" font-weight="700" fill="#FFFFFF" pointer-events="none">#${idx + 1}</text>
          ${sel ? `<circle class="mark-resize" data-resize-id="${m.id}" cx="${handleX}" cy="${handleY}" r="5" fill="#FFFFFF" stroke="${stroke}" stroke-width="2"/>` : ""}
        </g>
      `;
    }).join("");
  }

  let activeRecog = null;
  let dictatingMarkId = null;

  function markEditorAndListHtml(sheetKey) {
    const es = state.lang === "es";
    const marks = state.marksBySheet[sheetKey] || [];
    if (!marks.length) return "";
    return `
      <div class="mark-list">
        ${marks.map((m, idx) => {
          const sel = m.id === state.selectedMarkId;
          const isListening = dictatingMarkId === m.id;
          return `
            <div class="comment-card ${sel ? "selected" : ""}" data-card-mark="${m.id}">
              <div class="comment-top">
                <div style="display:flex;align-items:center;gap:6px;min-width:0">
                  <span class="mark-num" style="background:${m.status === 'applied' ? 'var(--pine)' : (sel ? 'var(--cobalt)' : 'var(--crimson)')}">${idx + 1}</span>
                  <span class="mark-zone">${detectZone(sheetKey, m.x, m.y)}</span>
                </div>
                <button class="mini-btn" data-del-mark="${m.id}" type="button" style="padding:2px 7px;color:var(--crimson)">×</button>
              </div>

              <div class="comment-line-row">
                <input class="comment-line-input" data-input-mark="${m.id}" type="text" value="${(m.comment || "").replace(/"/g, "&quot;")}" placeholder="${es ? "Escribe o usa el micrófono..." : "Type or use microphone..."}">
                <button class="mic-btn ${isListening ? "listening" : ""}" data-dictate-mark="${m.id}" type="button" aria-label="Voice dictation" title="Microphone" style="display:inline-flex;align-items:center;justify-content:center;width:34px;padding:0">${MIC_SVG}</button>
              </div>

              <div class="comment-actions">
                <span style="font-size:11px;color:var(--ink-3)">${es ? "Enviar este comentario al agente:" : "Send this comment individually:"}</span>
                <div style="display:flex;gap:5px">
                  <button class="mini-btn" data-send-ask="${m.id}" type="button">${es ? "Preguntar IA" : "Ask AI"}</button>
                  <button class="mini-btn primary" data-send-modify="${m.id}" type="button">${es ? "Modificar plano" : "Modify plan"}</button>
                </div>
              </div>

              ${m.reply ? `<div class="comment-reply ${m.status === "applied" ? "applied" : ""}">${m.reply}</div>` : ""}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function handleIndividualComment(sheetKey, mark, mode) {
    const es = state.lang === "es";
    const zone = detectZone(sheetKey, mark.x, mark.y);
    const txt = (mark.comment || "").trim();
    const low = txt.toLowerCase();

    if (mode === "modify") {
      // Real interactive agent plan modification based on the comment!
      const numMatch = low.match(/(\d+(?:\.\d+)?)/);
      if (low.includes("hood") || low.includes("campana") || (sheetKey === "ks4-live" && numMatch && Number(numMatch[1]) >= 60 && Number(numMatch[1]) <= 76)) {
        const target = numMatch ? Math.max(64, Math.min(74, Math.round(Number(numMatch[1])))) : 70;
        state.hoodAff = target;
        const clr = target - 36;
        mark.status = "applied";
        mark.reply = es
          ? `✓ Plano modificado: altura de campana actualizada a ${target}" (${clr}" sobre la estufa Viking · ${clr >= 30 && clr <= 36 ? "CUMPLE" : "REVISAR"}).`
          : `✓ Plan modified: hood bottom updated to ${target}" (${clr}" above 36" Viking range · ${clr >= 30 && clr <= 36 ? "Viking 30\"–36\" PASS" : "OUT OF VIKING RANGE"}).`;
      } else if (low.includes("floor") || low.includes("piso") || low.includes("buildup") || low.includes("1 inch") || low.includes("1\"")) {
        state.floorT = low.includes("0.5") || low.includes("1/2") ? 0.5 : (low.includes("1") && !low.includes("3/4") ? 1.0 : 0.75);
        mark.status = "applied";
        mark.reply = es
          ? `✓ Plano modificado: espesor de piso actualizado a ${fmtFrac(state.floorT)}" — todas las cotas sobre subpiso recalculadas.`
          : `✓ Plan modified: floor buildup updated to ${fmtFrac(state.floorT)}" — all subfloor tape marks recalculated live.`;
      } else if (low.includes("4x4") || low.includes("4\"x4\"") || low.includes("4×4")) {
        state.jboxMode = "box4x4";
        mark.status = "applied";
        mark.reply = es ? "✓ Ducto y 15A actualizado: mostrando por qué la caja 4\"×4\" sobresale 2-11/16\" fuera de la chimenea de 8-5/8\"." : "✓ Vent Duct & 15A updated: showing why a 4\"×4\" box beside the 6\" pipe sticks 2-11/16\" past the 8-5/8\" chimney onto the tile.";
      } else if (low.includes("clash") || low.includes("center") || low.includes("100")) {
        state.jboxMode = "centerClash";
        mark.status = "applied";
        mark.reply = es ? "✓ Ducto y 15A actualizado: mostrando el choque si se centra la caja detrás del ducto de 6\"." : "✓ Vent Duct & 15A updated: showing collision when centered behind the 6\" pipe (< 1\" wall gap).";
      } else if (low.includes("1-gang") || low.includes("hardwire") || low.includes("offset") || low.includes("move") || low.includes("desplaz")) {
        state.jboxMode = "oem1gang";
        mark.status = "applied";
        mark.reply = es ? "✓ Ducto y 15A actualizado: caja 1-gang (2\"×3\") a 84\"–88\" AFF y ±2-1/4\" del centro — oculta 100% dentro de 8-5/8\"." : "✓ Vent Duct & 15A updated: recessed 1-gang (2\"×3\") box at 84\"–88\" AFF, C/L ± 2-1/4\" — hidden 11/16\" inside 8-5/8\" chimney.";
      } else if (low.includes("attic") || low.includes("ático")) {
        state.ductMode = "attic";
        mark.status = "applied";
        mark.reply = es ? "✓ Ruta cambiada a unión recta en el ático (dos codos 45°, -18 pies equiv.) al ducto dedicado de cocina." : "✓ Route switched to straight-up attic tie-in (two 45° elbows, -18 ft equiv.) into the existing dedicated kitchen exhaust.";
      } else if (low.includes("side") || low.includes("lateral") || low.includes("takeoff")) {
        state.ductMode = "side";
        mark.status = "applied";
        mark.reply = es ? "✓ Ruta cambiada a toma lateral con collarín de 6\" (verificar ducto existente ≥ 6\" y tapar fondo muerto)." : "✓ Route switched to 6\" side spin-in takeoff (confirm existing duct ≥ 6\", cap dead bottom, UL-181 foil tape).";
      } else if (low.includes("flex")) {
        state.ductMode = "flex";
        mark.status = "applied";
        mark.reply = es ? "✓ Ducto flexible marcado como FALLA de código." : "✓ Flex duct flagged as CODE FAIL.";
      } else {
        mark.status = "applied";
        mark.reply = es
          ? `✓ Cambio propuesto registrado en "${zone}" en la bandeja del proyecto para revisión: "${txt || "Ajuste marcado"}".`
          : `✓ Proposed edit logged on "${zone}" and saved to project intake for review: "${txt || "Marked adjustment"}".`;
      }
      showToast(es ? "Agente aplicó el cambio al plano" : "Agent applied comment to plan");
      renderAll();
      return;
    }

    // mode === "ask"
    mark.status = "answered";
    if (zone.toLowerCase().includes("cabinet") || zone.toLowerCase().includes("gabinete")) {
      mark.reply = es
        ? `Respuesta IA (${zone}): Base proporcional de 18" ancho × 36" alto a cada lado de la estufa Viking de 30" (total muro Oeste 66-1/4" con ajuste de 1/4").`
        : `AI Answer (${zone}): Proportional 18" W × 36" H Essex Green base cabinet flanking the 30" Viking range (66-1/4" total wall width with +1/4" scribe).`;
    } else if (zone.toLowerCase().includes("1-gang") || zone.toLowerCase().includes("chimney") || zone.toLowerCase().includes("caja") || low.includes("box") || low.includes("100")) {
      mark.reply = es
        ? `Respuesta IA (${zone}): Manual Zephyr p. 3 es conexión directa (120V/415W/15A). Usa caja empotrada 1-gang (2"×3", placa 2-3/4") a 84"–88" AFF, desplazada 2-1/4" del centro al lado del knockout — queda 11/16" oculta dentro de la chimenea de 8-5/8" y libra el ducto curvo de 6". Nunca pongas una caja 4"×4" al lado del ducto (sobresale 2-11/16").`
        : `AI Answer (${zone}): Zephyr Manual p. 3 is direct hardwire (120V/415W/15A). Use a flush 1-gang box (2"×3", 2-3/4" KO plate + 90° 3/8" whip) at 84"–88" AFF, offset 2-1/4" from C/L on the hood knockout side — stays 11/16" hidden inside the 8-5/8" cover and clears the curved 6" pipe (~1.9" gap). A 4"×4" box sticks 2-11/16" out past the chimney.`;
    } else if (zone.toLowerCase().includes("duct") || zone.toLowerCase().includes("exhaust") || low.includes("attic") || low.includes("side")) {
      mark.reply = es
        ? `Respuesta IA (${zone}): Ese ducto existente es dedicado de la campana anterior (no corresponde a NEXT HVAC). Mide que tenga ≥ 6": subir recto al ático con dos codos 45° (-18 pies equiv.) es lo más limpio; toma lateral usa collarín de 6", tornillos #8, cinta UL-181 y tapa el fondo muerto.`
        : `AI Answer (${zone}): Existing metal duct is dedicated to the old kitchen hood (not NEXT HVAC scope). Verify diameter ≥ 6": straight-up through attic + two 45° elbows (-18 ft equiv.) is cleanest; side takeoff needs a 6" spin-in collar, #8 screws, UL-181 tape, and capping the dead lower stub.`;
    } else if (zone.toLowerCase().includes("block") || zone.toLowerCase().includes("screw") || zone.toLowerCase().includes("refuerzo") || zone.toLowerCase().includes("tornill")) {
      const lineB = fmtFrac(state.hoodAff + 9.5625);
      mark.reply = es
        ? `Respuesta IA (${zone}): Manual Zephyr p. 4: solo 2 tornillos en Línea B (${lineB}" AFF) separados 9-27/32" (±4-15/16" del centro 33"), más soporte superior de 8-5/8". Pon respaldo 2× entre postes estrictamente dentro del ancho de 30" (inf. 72"–83", sup. 110"–121-1/2").`
        : `AI Answer (${zone}): Zephyr Manual p. 4 fig. A: only 2 screws on Line B (${lineB}" AFF) spaced 9-27/32" apart (±4-15/16" from C/L 33"), plus narrow 8-5/8" top bracket. Nail solid 2× stud-to-stud strictly inside the 30" hood width (lower 72"–83", upper 110"–121-1/2").`;
    } else {
      mark.reply = es
        ? `Respuesta IA (${zone}): Campana actual a ${state.hoodAff}" AFF (${state.hoodAff - 36}" sobre estufa Viking · Línea B ${fmtFrac(state.hoodAff + 9.5625)}"). Ducto rígido 6" al ducto dedicado de cocina; caja 1-gang 15A a 84"–88" AFF.`
        : `AI Answer (${zone}): Current hood bottom is ${state.hoodAff}" AFF (${state.hoodAff - 36}" above Viking range · Line B ${fmtFrac(state.hoodAff + 9.5625)}"). 6" rigid duct to dedicated kitchen exhaust; recessed 1-gang 15A box at 84"–88" AFF.`;
    }
    renderDrawer();
  }

  function wireInteractiveSvgMarks(sheetKey, svgId, wrapId) {
    const svg = document.getElementById(svgId);
    const wrap = document.getElementById(wrapId);
    if (!svg || !wrap) return;
    const es = state.lang === "es";
    const marks = state.marksBySheet[sheetKey] || (state.marksBySheet[sheetKey] = []);
    const vb = svg.viewBox && svg.viewBox.baseVal;
    const vbW = (vb && vb.width) ? vb.width : 380;
    const vbH = (vb && vb.height) ? vb.height : sheetViewBoxHeight(sheetKey);

    function ensureDragGhost() {
      let el = document.getElementById("dragGhost");
      if (!el) {
        el = document.createElement("div");
        el.id = "dragGhost";
        el.className = "drag-ghost no-print";
        el.setAttribute("aria-hidden", "true");
        el.textContent = "⊕";
        document.body.appendChild(el);
      }
      return el;
    }

    let tapPlaceMode = false;
    const dragPill = document.getElementById("dragMarkPill");
    function setTapPlace(on) {
      tapPlaceMode = !!on;
      wrap.classList.toggle("drop-target", tapPlaceMode);
      if (dragPill) {
        dragPill.classList.toggle("is-armed", tapPlaceMode);
        dragPill.setAttribute("aria-pressed", tapPlaceMode ? "true" : "false");
        dragPill.textContent = tapPlaceMode
          ? (es ? "Toca el plano ✕" : "Tap plan ✕")
          : (es ? "⊕ Arrastrar / Tocar" : "⊕ Drag / Tap");
      }
    }

    function clientToSvg(cx, cy) {
      const rect = svg.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      return {
        x: Math.max(20, Math.min(vbW - 20, Math.round(((cx - rect.left) / w) * vbW))),
        y: Math.max(20, Math.min(vbH - 20, Math.round(((cy - rect.top) / h) * vbH)))
      };
    }

    function addMarkAt(pt) {
      document.getElementById("u4gToast")?.classList.remove("show");
      const id = sheetKey + "-" + Date.now();
      marks.push({ id, x: pt.x, y: pt.y, r: 16, comment: "", reply: "", status: "" });
      state.selectedMarkId = id;
      renderDrawer();
      const inp = document.getElementById("steerInput") || document.querySelector(`[data-input-mark="${id}"]`);
      if (inp) {
        try { inp.focus({ preventScroll: true }); } catch (_) { inp.focus(); }
      }
    }

    svg.ondblclick = (e) => {
      setTapPlace(false);
      addMarkAt(clientToSvg(e.clientX, e.clientY));
    };

    let activeDrag = null;
    svg.onpointerdown = (e) => {
      const resizeEl = e.target.closest("[data-resize-id]");
      const markEl = e.target.closest("[data-mark-id]");
      if (resizeEl) {
        const m = marks.find(x => x.id === resizeEl.dataset.resizeId);
        if (!m) return;
        e.preventDefault();
        activeDrag = { mode: "resize", mark: m };
        try { svg.setPointerCapture(e.pointerId); } catch (_) {}
        return;
      }
      if (markEl) {
        const m = marks.find(x => x.id === markEl.dataset.markId);
        if (!m) return;
        e.preventDefault();
        state.selectedMarkId = m.id;
        const pt = clientToSvg(e.clientX, e.clientY);
        activeDrag = { mode: "move", mark: m, dx: m.x - pt.x, dy: m.y - pt.y, moved: false };
        try { svg.setPointerCapture(e.pointerId); } catch (_) {}
        return;
      }
      if (tapPlaceMode) {
        e.preventDefault();
        setTapPlace(false);
        addMarkAt(clientToSvg(e.clientX, e.clientY));
      }
    };
    svg.onpointermove = (e) => {
      if (!activeDrag) return;
      const pt = clientToSvg(e.clientX, e.clientY);
      const m = activeDrag.mark;
      if (activeDrag.mode === "move") {
        m.x = Math.max(20, Math.min(vbW - 20, pt.x + activeDrag.dx));
        m.y = Math.max(20, Math.min(vbH - 20, pt.y + activeDrag.dy));
        activeDrag.moved = true;
      } else if (activeDrag.mode === "resize") {
        m.r = Math.max(10, Math.min(46, Math.round(Math.hypot(pt.x - m.x, pt.y - m.y))));
      }
      const g = svg.querySelector(`[data-mark-id="${m.id}"]`);
      if (g) {
        const goRight = m.x >= 190;
        const edgeX = m.x + (goRight ? m.r : -m.r);
        const tagX = goRight ? Math.min(342, m.x + m.r + 24) : Math.max(38, m.x - m.r - 24);
        const tagY = Math.max(22, Math.min(vbH - 22, m.y - 6));
        const hx = m.x + Math.round(m.r * 0.72), hy = m.y + Math.round(m.r * 0.72);
        const line = g.querySelector("line");
        const circles = g.querySelectorAll("circle");
        const rect = g.querySelector("rect");
        const txt = g.querySelector("text");
        if (line) { line.setAttribute("x1", edgeX); line.setAttribute("y1", m.y); line.setAttribute("x2", tagX); line.setAttribute("y2", tagY); }
        if (circles[0]) { circles[0].setAttribute("cx", m.x); circles[0].setAttribute("cy", m.y); circles[0].setAttribute("r", m.r); }
        if (rect) { rect.setAttribute("x", tagX - 18); rect.setAttribute("y", tagY - 10); }
        if (txt) { txt.setAttribute("x", tagX); txt.setAttribute("y", tagY + 3.5); }
        if (circles[1]) { circles[1].setAttribute("cx", hx); circles[1].setAttribute("cy", hy); }
      }
    };
    svg.onpointerup = () => {
      if (!activeDrag) return;
      const moved = activeDrag.moved || activeDrag.mode === "resize";
      activeDrag = null;
      renderDrawer();
      if (moved) showToast(es ? "Comentario reposicionado" : "Comment moved — target updated");
    };
    svg.onpointercancel = () => {
      activeDrag = null;
    };

    const ghost = ensureDragGhost();
    if (dragPill && ghost) {
      dragPill.onpointerdown = (e) => {
        if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
        e.preventDefault();
        const pointerId = e.pointerId;
        const startX = e.clientX;
        const startY = e.clientY;
        let moved = false;
        try { dragPill.setPointerCapture(pointerId); } catch (_) {}
        const blockScroll = (tev) => { if (tev.cancelable) tev.preventDefault(); };
        window.addEventListener("touchmove", blockScroll, { passive: false });

        function cleanup() {
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", onCancel);
          window.removeEventListener("touchmove", blockScroll);
          try { if (dragPill.hasPointerCapture && dragPill.hasPointerCapture(pointerId)) dragPill.releasePointerCapture(pointerId); } catch (_) {}
          ghost.classList.remove("active");
        }
        function onMove(ev) {
          if (ev.pointerId !== pointerId) return;
          if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) >= 6) {
            moved = true;
            ghost.classList.add("active");
            wrap.classList.add("drop-target");
          }
          if (moved) {
            ghost.style.left = ev.clientX + "px";
            ghost.style.top = ev.clientY + "px";
          }
        }
        function onCancel(ev) {
          if (ev.pointerId !== pointerId) return;
          cleanup();
          wrap.classList.toggle("drop-target", tapPlaceMode);
        }
        function onUp(ev) {
          if (ev.pointerId !== pointerId) return;
          cleanup();
          if (moved) {
            setTapPlace(false);
            const rect = svg.getBoundingClientRect();
            const margin = 16;
            const inside = ev.clientX >= rect.left - margin && ev.clientX <= rect.right + margin && ev.clientY >= rect.top - margin && ev.clientY <= rect.bottom + margin;
            if (inside) {
              addMarkAt(clientToSvg(ev.clientX, ev.clientY));
            } else {
              showToast(es ? "Suelta ⊕ sobre el dibujo, o toca ⊕ y luego toca el dibujo" : "Drop ⊕ onto the drawing, or tap ⊕ then tap any spot");
            }
          } else {
            const next = !tapPlaceMode;
            setTapPlace(next);
            if (next) {
              showToast(es ? "Ahora toca cualquier punto del plano para poner una nota" : "Now tap any spot on the drawing to place a note");
            }
          }
        }
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
        document.addEventListener("pointercancel", onCancel);
      };
    }

    // Wire per-comment cards (input, dictation, individual Ask AI / Modify Plan, delete)
    document.querySelectorAll("[data-card-mark]").forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest("button") || e.target.closest("input")) return;
        state.selectedMarkId = card.dataset.cardMark;
        renderDrawer();
      };
    });
    document.querySelectorAll("[data-input-mark]").forEach(inp => {
      inp.onfocus = () => { state.selectedMarkId = inp.dataset.inputMark; };
      inp.oninput = () => {
        const m = marks.find(x => x.id === inp.dataset.inputMark);
        if (m) m.comment = inp.value;
      };
      inp.onkeydown = (e) => {
        if (e.key === "Enter") {
          const m = marks.find(x => x.id === inp.dataset.inputMark);
          if (m) handleIndividualComment(sheetKey, m, "ask");
        }
      };
    });
    document.querySelectorAll("[data-del-mark]").forEach(btn => {
      btn.onclick = () => {
        const idx = marks.findIndex(x => x.id === btn.dataset.delMark);
        if (idx >= 0) marks.splice(idx, 1);
        state.selectedMarkId = marks.length ? marks[marks.length - 1].id : null;
        renderDrawer();
      };
    });
    // Wire smart Send (auto-steers Voice AI — modifies plan if edit intent, answers if question, and mirrors reply in the always-on Voice AI bar!)
    document.querySelectorAll("[data-send-steer]").forEach(btn => {
      btn.onclick = () => {
        const m = marks.find(x => x.id === btn.dataset.sendSteer);
        if (!m) return;
        const low = (m.comment || "").toLowerCase();
        const isEdit = /\b(move|set|change|make|raise|lower|update|offset|center|flex|rigid|sube|baja|cambia|mueve|pon)\b|\b\d{2}\s*(?:in|inch|\"|pulg)/i.test(low);
        handleIndividualComment(sheetKey, m, isEdit ? "modify" : "ask");
        state.voiceOpen = true;
        state.voiceReply = m.reply;
        renderVoiceStrip();
      };
    });
    document.querySelectorAll("[data-send-ask]").forEach(btn => {
      btn.onclick = () => {
        const m = marks.find(x => x.id === btn.dataset.sendAsk);
        if (m) {
          handleIndividualComment(sheetKey, m, "ask");
          state.voiceOpen = true;
          state.voiceReply = m.reply;
          renderVoiceStrip();
        }
      };
    });
    document.querySelectorAll("[data-send-modify]").forEach(btn => {
      btn.onclick = () => {
        const m = marks.find(x => x.id === btn.dataset.sendModify);
        if (m) {
          handleIndividualComment(sheetKey, m, "modify");
          state.voiceOpen = true;
          state.voiceReply = m.reply;
          renderVoiceStrip();
        }
      };
    });
    document.querySelectorAll("[data-dictate-mark]").forEach(btn => {
      btn.onclick = () => {
        const m = marks.find(x => x.id === btn.dataset.dictateMark);
        if (!m) return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
          showToast(state.lang === "es" ? "El micrófono del navegador no está disponible en esta vista previa" : "Browser speech mic unavailable in this preview frame (works live in Chrome/Safari)");
          return;
        }
        if (activeRecog) { try { activeRecog.stop(); } catch (e) {} activeRecog = null; }
        const recog = new SR();
        recog.lang = state.lang === "es" ? "es-MX" : "en-US";
        recog.interimResults = false;
        dictatingMarkId = m.id;
        activeRecog = recog;
        renderDrawer();
        recog.onresult = (ev) => {
          const spoken = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : "";
          if (spoken) m.comment = (m.comment ? (m.comment + " ") : "") + spoken;
        };
        recog.onend = () => { dictatingMarkId = null; activeRecog = null; renderDrawer(); };
        recog.onerror = () => { dictatingMarkId = null; activeRecog = null; renderDrawer(); };
        recog.start();
      };
    });
  }

  /* ================= DOCKED LIVE VOICE STRIP ================= */
  function openVoiceStripWithAnswer(zone, userNote) {
    state.voiceOpen = true;
    const es = state.lang === "es";
    if (zone) {
      const lineB = fmtFrac(state.hoodAff + 9.5625);
      state.voiceReply = es
        ? `Viendo tu marca en "${zone}"${userNote ? ` ("${userNote}")` : ""}: campana a ${state.hoodAff}" AFF (Línea B ${lineB}", 2 tornillos a 9-27/32"). Caja 1-gang 15A a 83"–86" AFF justo arriba de la campana dentro de la cubierta de 8-5/8".`
        : `Looking at your mark on "${zone}"${userNote ? ` ("${userNote}")` : ""}: hood bottom is ${state.hoodAff}" AFF (Line B ${lineB}", 2 screws spaced 9-27/32"). 1-gang 15A hardwire box sits at 83"–86" AFF right above the canopy, hidden inside the 8-5/8" casing.`;
    }
    renderVoiceStrip();
  }

  function renderVoiceStrip() {
    const strip = document.getElementById("voiceStrip");
    if (!strip) return;
    strip.classList.toggle("open", state.voiceOpen);
    if (!state.voiceOpen) return;
    const es = state.lang === "es";
    document.getElementById("voicePulse").classList.toggle("muted", state.voiceMuted);
    document.getElementById("voiceStatusLabel").textContent = state.voiceMuted
      ? (es ? "Voz silenciada · Plano sincronizado" : "Mic muted · Room + open plan synced")
      : (es ? "Voz en vivo · Viendo cuarto + plano abierto" : "Live Voice · Seeing room + open plan");
    document.getElementById("voiceMuteBtn").textContent = state.voiceMuted ? (es ? "Activar" : "Unmute") : (es ? "Silenciar" : "Mute");
    document.getElementById("voiceEndBtn").textContent = es ? "Terminar" : "End";
    document.getElementById("voiceReplyBox").textContent = state.voiceReply || (es
      ? "Escuchando — prueba un comando abajo o arrastra ⊕ a cualquier parte del plano."
      : "Listening — tap a live voice command below or drag ⊕ onto any spot on the plan.");

    const sk = currentSheetKey();
    const marks = sk ? (state.marksBySheet[sk] || []) : [];
    const activeMark = marks.find(m => m.id === state.selectedMarkId) || marks[0];
    const cmds = [
      { id: "mark", label: activeMark ? (es ? "Explícame la marca" : "Explain selected mark") : (es ? "¿Dónde va la caja 15A?" : "Where does 15A box go?") },
      { id: "hood70", label: es ? "Sube campana a 70\"" : "Move hood to 70\"" },
      { id: "sheets", label: es ? "Ver Respaldos y Montaje" : "Open Wood Blocking & Mounting" },
      { id: "jbox", label: es ? "Ver Ducto y Caja 15A" : "Open Vent Duct & 15A Wiring" }
    ];
    const row = document.getElementById("voiceQuickCmds");
    row.innerHTML = cmds.map(c => `<button class="ai-chip" data-vcmd="${c.id}" type="button">${c.label}</button>`).join("");
    row.querySelectorAll("[data-vcmd]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.vcmd;
        if (id === "mark") {
          const z = activeMark ? detectZone(sk, activeMark.x, activeMark.y) : "1-Gang 15A Hardwire Box";
          openVoiceStripWithAnswer(z, activeMark ? activeMark.comment : "");
        } else if (id === "hood70") {
          state.hoodAff = 70;
          openPlan("ks4-live");
          state.voiceReply = es
            ? "Listo — campana a 70\" del piso (34\" sobre estufa Viking · tornillos a 79-9/16\" · CUMPLE 30\"–36\")."
            : "Done — hood bottom moved to 70\" off floor (34\" above Viking range · hanging screws at 79-9/16\" · PASS 30\"–36\").";
          renderAll();
        } else if (id === "sheets") {
          openPlan("hood-s1");
          state.voiceReply = es
            ? "Abrí Respaldos y Montaje: solo necesitas un 2×10 abajo (73\"–82-1/4\") para los 2 tornillos a 9-27/32\" y un 2×6 arriba (116\"–121-1/2\") para el soporte de 8-5/8\"."
            : "Opened Wood Blocking & Mounting: you only need one compact 2×10 below (73\"–82-1/4\") for the two 9-27/32\" Line B screws and one 2×6 at the ceiling (116\"–121-1/2\") for the 8-5/8\" bracket.";
          renderAll();
        } else if (id === "jbox") {
          openPlan("hood-s2");
          state.jboxMode = "oem1gang";
          state.voiceReply = es
            ? "Abrí Ducto y Cableado 15A: la cubierta mide 8-5/8\" × 7-1/2\" y el tubo de 6\" va al centro. Usa caja 1-gang (2\"×3\") a 83\"–86\" AFF justo arriba de la campana, a ±2-1/4\" del centro."
            : "Opened Vent Duct & 15A Wiring: casing is 8-5/8\" W × 7-1/2\" D with the 6\" vent centered. Set a flush 1-gang (2\"×3\") box at 83\"–86\" AFF right above the canopy, ±2-1/4\" from C/L on the hood's knockout side.";
          renderAll();
        }
      };
    });
  }

  function manualLinksBarHtml() {
    const es = state.lang === "es";
    return `
      <div class="manual-links">
        <a class="manual-link" href="https://drive.google.com/file/d/1QH6N_nnFVBHvfaEZiU0ZP1pyJDXAeNz3/view" target="_blank" rel="noopener">↗ ${es ? "Manual Zephyr Savona (PDF)" : "Zephyr Savona Manual (PDF)"}</a>
        <a class="manual-link" href="https://drive.google.com/file/d/1D2YflscPC7hJGxr-AptP887Gci1LZLKO/view" target="_blank" rel="noopener">↗ ${es ? "Ficha Zephyr" : "Zephyr Spec Sheet"}</a>
        <a class="manual-link" href="https://www.manualslib.com/p/897490/Viking-Professional-Custom-Vgcc5304bss.html" target="_blank" rel="noopener">↗ ${es ? "Manual Estufa Viking" : "Viking VGCC5304BSS Manual"}</a>
        <button class="manual-link" data-jump-sheet="zephyr-oem" type="button" style="cursor:pointer">${es ? "Ver resumen Zephyr" : "Open Zephyr Summary"}</button>
        <button class="manual-link" data-jump-sheet="viking-oem" type="button" style="cursor:pointer">${es ? "Ver resumen Viking" : "Open Viking Summary"}</button>
      </div>
    `;
  }

  function topDragBarHtml() {
    const es = state.lang === "es";
    return `
      <div class="top-drag-bar" style="justify-content:space-between">
        <span style="flex:1;min-width:170px">${es ? "Arrastra <b>⊕</b> a cualquier punto (o toca <b>⊕</b> y luego el plano) para editar o preguntar sobre esa zona." : "Drag <b>⊕</b> onto any spot (or tap <b>⊕</b>, then tap the plan) to ask or edit that area."}</span>
        <button type="button" class="drag-pill" id="dragMarkPill" aria-pressed="false" title="${es ? "Arrastra al plano o toca para marcar" : "Drag onto the plan or tap to place a note"}" style="flex-shrink:0">⊕ ${es ? "Arrastrar / Tocar" : "Drag / Tap"}</button>
      </div>
    `;
  }

  // U4_PRODUCT_LOOKUP_URL declared at top of IIFE (supports ?lookup_api= override)

  function effectiveFloorT() {
    return state.floorInstalled ? 0 : (Number(state.floorT) || 0.75);
  }

  function foldBoxHtml(key, cls, titleHtml, bodyHtml) {
    const isOpen = !!state.foldOpen[key];
    return `
      <div class="u4-fold ${cls || ""}">
        <button class="u4-fold-btn" data-fold-key="${key}" type="button" aria-expanded="${isOpen}">
          <span>${titleHtml}</span>
          <span class="u4-fold-chev">${isOpen ? "▴" : "▾"}</span>
        </button>
        ${isOpen ? `<div class="u4-fold-body">${bodyHtml}</div>` : ""}
      </div>
    `;
  }

  function wireFoldBoxes() {
    document.querySelectorAll("[data-fold-key]").forEach(btn => {
      btn.onclick = () => {
        const k = btn.dataset.foldKey;
        state.foldOpen[k] = !state.foldOpen[k];
        renderDrawer();
      };
    });
  }

  function floorStatusControlHtml(es) {
    const tVal = effectiveFloorT();
    return `
      <div class="slider-row" style="flex-wrap:wrap">
        <span>${es ? "¿El piso terminado ya está puesto?" : "Is the finished floor down yet?"}</span>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <button class="intent-btn ${!state.floorInstalled ? "active" : ""}" data-floor-inst="bare" type="button">${es ? "No — subpiso crudo (actual)" : "No — bare subfloor (current)"}</button>
          <button class="intent-btn ${state.floorInstalled ? "active" : ""}" data-floor-inst="done" type="button">${es ? "Sí — piso terminado puesto" : "Yes — finished floor down"}</button>
        </div>
      </div>
      ${!state.floorInstalled ? `
        <div class="slider-row" style="flex-wrap:wrap">
          <span>${es ? "Grosor futuro del piso:" : "Future flooring allowance:"}</span>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <button class="intent-btn ${state.floorUndecided ? "active" : ""}" data-floor-t="undecided" type="button">${es ? 'Sin elegir aún (~3/4" seguro)' : 'Not picked yet (~3/4" safe)'}</button>
            <button class="intent-btn ${!state.floorUndecided && state.floorT === 0.5 ? "active" : ""}" data-floor-t="0.5" type="button">1/2" LVP</button>
            <button class="intent-btn ${!state.floorUndecided && state.floorT === 0.75 ? "active" : ""}" data-floor-t="0.75" type="button">${es ? '3/4" madera' : '3/4" wood'}</button>
            <button class="intent-btn ${!state.floorUndecided && state.floorT === 1.0 ? "active" : ""}" data-floor-t="1" type="button">${es ? '1" azulejo' : '1" tile'}</button>
          </div>
        </div>
        <div class="floor-note">
          ${es
            ? `<strong>Si el piso aún no está puesto:</strong> mide desde el <b>subpiso crudo</b> sumando <b>+${fmtFrac(tVal)}"</b> para el piso futuro. El bloque 2×10 mide 9-1/4" de alto y la zona de gas mide 4-3/8", así que ambos toleran sin problema si el piso cambia ±1/2" después.`
            : `<strong>When the floor isn't finished yet:</strong> measure straight up from <b>bare subfloor</b> adding <b>+${fmtFrac(tVal)}"</b> for future flooring. Both the 2×10 block (9-1/4" tall) and the low stove utility band (4-3/8" tall) stay forgiving even if final flooring shifts ±1/2" later.`}
        </div>
      ` : `
        <div class="floor-note">
          ${es
            ? "<strong>Piso terminado ya puesto:</strong> mide directo desde el piso donde estás parado (sin sumar extra)."
            : "<strong>Finished floor is already installed:</strong> measure straight off the floor you're standing on (no extra thickness added)."}
        </div>
      `}
    `;
  }

  function wireFloorStatusControls() {
    document.querySelectorAll("[data-floor-inst]").forEach(b => {
      b.onclick = () => {
        state.floorInstalled = (b.dataset.floorInst === "done");
        renderDrawer();
      };
    });
    document.querySelectorAll("[data-floor-t]").forEach(b => {
      b.onclick = () => {
        if (b.dataset.floorT === "undecided") {
          state.floorUndecided = true;
          state.floorT = 0.75;
        } else {
          state.floorUndecided = false;
          state.floorT = Number(b.dataset.floorT);
        }
        renderDrawer();
      };
    });
  }

  function equipStripHtml(stepId, es) {
    const EQUIP = {
      "ks4-live": [
        { ico: "📏", en: "Tape & Laser", es: "Cinta y Láser", subEn: "33\" centerline", subEs: "Centro a 33\"" },
        { ico: "📐", en: "4-ft Level", es: "Nivel 4 pies", subEn: "Check wall flat", subEs: "Revisar plano" },
        { ico: "✏️", en: "Carpenter Pencil", es: "Lápiz obra", subEn: "Mark studs", subEs: "Marcar postes" },
        { ico: "📸", en: "Phone Camera", es: "Cámara cel", subEn: "Tape-in-frame", subEs: "Foto con cinta" }
      ],
      "hood-s1": [
        { ico: "🪚", en: "Circular / Miter Saw", es: "Sierra corte", subEn: "Cut 2×10 & 2×6", subEs: "Cortar 2×10/2×6" },
        { ico: "🔩", en: "Impact Driver", es: "Atornillador", subEn: "3\" structural screws", subEs: "Tornillos 3\"" },
        { ico: "📐", en: "6-ft Straightedge", es: "Regla 6 pies", subEn: "≤ 1/8\" flat", subEs: "Plano ≤ 1/8\"" },
        { ico: "🔦", en: "Stud Finder", es: "Detector postes", subEn: "Find 1 vs 2 bays", subEs: "Ver claros" }
      ],
      "hood-s2": [
        { ico: "✂️", en: "Tin Snips & Crimper", es: "Tijera lámina", subEn: "6\" rigid duct", subEs: "Ducto rígido 6\"" },
        { ico: "⚡", en: "Wire Stripper & Tester", es: "Pelacables/Tester", subEn: "14/2 · 15A AFCI", subEs: "14/2 · 15A AFCI" },
        { ico: "🪛", en: "Drill + 6\" Hole Saw", es: "Taladro + Sierra 6\"", subEn: "Ceiling pass-thru", subEs: "Paso techo" },
        { ico: "🪜", en: "8-ft Step Ladder", es: "Escalera 8 pies", subEn: "10' ceiling reach", subEs: "Techo 10'" }
      ],
      "range-gas": [
        { ico: "🔧", en: "2 Pipe Wrenches", es: "2 Llaves Stilson", subEn: "1/2\" black iron", subEs: "Tubo gas 1/2\"" },
        { ico: "⏱️", en: "15 PSI Test Gauge", es: "Manómetro 15 PSI", subEn: "10 psi / 15 min", subEs: "Prueba 15 min" },
        { ico: "🫧", en: "Leak Solution", es: "Detector fugas", subEn: "Bubble check", subEs: "Prueba burbuja" },
        { ico: "⚡", en: "Outlet / GFCI Tester", es: "Probador GFCI", subEn: "120V / 15A 14/2", subEs: "120V / 15A 14/2" }
      ],
      "tile-plan": [
        { ico: "🌊", en: "Wet Tile Saw", es: "Cortadora c/ agua", subEn: "Clean tile cuts", subEs: "Cortes limpios" },
        { ico: "💎", en: "Wet Diamond Bits", es: "Brocas diamante", subEn: "2 hood screws", subEs: "2 hoyos campana" },
        { ico: "🧱", en: "Notched Trowel", es: "Llana dentada", subEn: "1/4\"–3/8\" notch", subEs: "Diente 1/4\"–3/8\"" },
        { ico: "🧽", en: "Grout Float & Sponge", es: "Flota y Esponja", subEn: "Grout + silicone", subEs: "Boquilla/silicón" }
      ]
    };
    const items = EQUIP[stepId] || [];
    if (!items.length) return "";
    return `
      <div class="equip-block">
        <div class="equip-head">
          <span>🔧 ${es ? "Equipo y herramientas para este paso" : "Equipment & tools needed for this step"}</span>
        </div>
        <div class="equip-grid">
          ${items.map(it => `
            <div class="equip-card">
              <div class="equip-ico">${it.ico}</div>
              <div class="equip-name">${es ? it.es : it.en}</div>
              <div class="equip-sub">${es ? it.subEs : it.subEn}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function calcMaterialsBlockHtml(stepId, es, ctx) {
    const isOpen = !!state.calcOpenByStep[stepId];
    let rows = [];
    let estNote = "";
    const is2Bay = state.studLayout === "2bay";
    const tVal = effectiveFloorT();

    if (stepId === "ks4-live") {
      rows = [
        [es ? "Láser / línea de tiza (centro 33\")" : "Layout reference (33\" centerline)", es ? "1 juego" : "1 set"],
        [es ? "Cinta azul pintor (maqueta altura campana)" : "Painter's tape (mock up hood height)", es ? "1 rollo" : "1 roll"],
        [es ? "Nota piso actual" : "Current floor datum", state.floorInstalled ? (es ? "Piso terminado (+0\")" : "Finished floor (+0\")") : (es ? `Subpiso crudo (+${fmtFrac(tVal)}")` : `Bare subfloor (+${fmtFrac(tVal)}")`)]
      ];
      estNote = es ? "Paso de trazo y revisión — compra la madera, ducto, cables y azulejo en los Pasos 2–5." : "Layout & height check step — actual lumber, duct, wire, gas & tile quantities calculate in Steps 2–5.";
    } else if (stepId === "hood-s1") {
      rows = [
        [es ? `Bloque inferior 2×10 (horma los 2 tornillos a ${ctx.lineBAff}" piso)` : `Lower 2×10 lumber (holds 2 screws at ${ctx.lineBAff}" floor)`, is2Bay ? (es ? "1 pieza 2×10×4' (2 claros)" : "1 × 2×10×4' (2 bays)") : (es ? "1 pieza 2×10×2' (1 claro)" : "1 × 2×10×2' (1 bay)")],
        [es ? "Bloque superior 2×6 (soporte techo 121-1/2\")" : "Upper 2×6 lumber (ceiling chimney bracket)", is2Bay ? (es ? "1 pieza 2×6×4'" : "1 × 2×6×4'") : (es ? "1 pieza 2×6×2'" : "1 × 2×6×2'")],
        [es ? "Tornillos estructurales 3\" (para fijar bloques)" : "3\" structural framing screws (for blocks)", es ? "1 caja (~20 pzs)" : "1 box (~20 pcs)"],
        [es ? "Tornillos campana (acero inox., muerden ≥ 1-1/2\" tras azulejo)" : "Hood mounting screws (2-1/2\"–3\" through tile)", es ? "4 pzs (#10 / 1/4\")" : "4 pcs (#10 or 1/4\")"]
      ];
      estNote = es ? "Solo cantidades — verifica stock en obra antes de pedir." : "Quantities only — verify on-hand stock before ordering.";
    } else if (stepId === "hood-s2") {
      rows = [
        [es ? "Ducto metálico rígido 6\" (calibre ≥ 28)" : "6\" round rigid metal duct (≥ 28 ga)", es ? "1–2 tramos de 5'" : "1–2 × 5' sections"],
        [state.ductMode === "side" ? (es ? "Collarín 6\" + tapa final para tubo viejo" : "6\" spin-in collar + end cap for old stack") : (es ? "2 codos ajustables 45° de 6\" (en ático)" : "Two 6\" 45° rigid elbows (attic offset)"), es ? "1 juego" : "1 set"],
        [es ? "Cinta aluminio UL-181 + tornillos lámina 1/2\"" : "UL-181 foil tape + 1/2\" sheet-metal screws", es ? "1 rollo + 1 paquete" : "1 roll + 1 pack"],
        [es ? "Caja metálica 1-gang (2\"×3\") + anillo 1\" + conector 90°" : "1-gang (2\"×3\") box + 1\" tile ring + 90° clamp", es ? "1 juego" : "1 set"],
        [es ? "Cable cobre 14/2 NM-B (circuito dedicado 15A) + seguro breaker" : "14/2 copper NM-B wire (dedicated 15A) + breaker lock", es ? "1 tramo + 1 seguro" : "1 run + 1 lock-off"],
        [es ? "Lana mineral + sellador cortafuego (paso techo)" : "Mineral wool + fireblock caulk (ceiling pass-thru)", es ? "1 paquete + 1 tubo" : "1 batt + 1 tube"]
      ];
      estNote = es ? "Solo cantidades — ducto rígido liso 6\" + caja 1-gang 2\"×3\" (sin precios)." : "Quantities only — 6\" smooth rigid duct + 1-gang 2\"×3\" hardwire box (zero prices).";
    } else if (stepId === "range-gas") {
      rows = [
        [es ? "Tubo hierro negro 1/2\" + válvula de cierre manual tipo T" : "1/2\" black iron nipple + manual T-handle shutoff", es ? "1 juego (sale ≤ 2\")" : "1 set (≤ 2\" poke-out)"],
        [es ? "Caja empotrada de gas (opcional para máxima holgura)" : "Recessed gas outlet box (optional for tight wall)", es ? "1 caja" : "1 box"],
        [es ? "Conector flexible acero inox. 1/2\" para estufa (final)" : "1/2\" stainless gas appliance flex connector (final)", es ? "1 pza (36\"–48\")" : "1 pc (36\"–48\")"],
        [es ? "Cable 14/2 cobre con tierra (120V / 15A — NO 240V)" : "14/2 copper w/ ground (120V / 15A — NOT 240V)", es ? "1 circuito dedicado" : "1 dedicated circuit"],
        [es ? "Contacto 120V/15A aterrizado + GFCI frente muerto accesible" : "120V/15A grounded outlet + accessible dead-front GFCI", es ? "1 juego" : "1 set"],
        [es ? "Sellador de huecos (piso y muro atrás de estufa)" : "Air-seal caulk / foam (rear wall & floor openings)", es ? "1 tubo" : "1 tube"]
      ];
      estNote = es ? "Solo cantidades — gas 1/2\" y circuito dedicado 120V/15A en cobre 14/2 (sin precios)." : "Quantities only — 1/2\" gas stub & dedicated 120V/15A on 14/2 copper (zero prices).";
    } else if (stepId === "tile-plan") {
      const tileRowQty = !ctx.hasTile
        ? (es ? "Elige medida arriba" : "Pick tile size above")
        : (ctx.tileTotalCost != null
          ? `${ctx.boxesNeeded} ${es ? "cajas" : "boxes"} (~${ctx.tilesNeeded} pzs)`
          : (ctx.boxesNeeded != null ? `${ctx.boxesNeeded} ${es ? "cajas" : "boxes"} (~${ctx.tilesNeeded} pzs)` : `${ctx.orderSqft} sq ft (~${ctx.tilesNeeded} pzs)`));
      rows = [
        [ctx.hasTile
          ? (es ? `Azulejo ${ctx.tw}"×${ctx.th}" (${ctx.grossSqft} ft² + ${state.tileWastePct}% = ${ctx.orderSqft} ft²)` : `Tile ${ctx.tw}"×${ctx.th}" (${ctx.grossSqft} sf + ${state.tileWastePct}% = ${ctx.orderSqft} sf)`)
          : (es ? `Azulejo por elegir (${ctx.grossSqft} ft² pared + ${state.tileWastePct}% = ${ctx.orderSqft} ft²)` : `Tile TBD (${ctx.grossSqft} sf wall + ${state.tileWastePct}% = ${ctx.orderSqft} sf)`), tileRowQty],
        [es ? "Remate sin metal (solo orilla Izq. = 7.1 ft)" : "Zero-metal edge (Left edge only = 7.1 ft)", es ? ctx.trimShortEs : ctx.trimShortEn],
        [es ? "HardieBacker 500 1/2\" (hojas 3'×5')" : "1/2\" HardieBacker 500 (3'×5' sheets)", `${ctx.hardieSheets} ${es ? "hojas" : "sheets"}`],
        [es ? "Unión con tablaroca de 1/2\" comprada (0.42\" vs 0.50\")" : "Transition to purchased 1/2\" drywall (0.42\" vs 0.50\")", es ? "Emparejar ~1/16\"" : "~1/16\" skim/feather"],
        [es ? "Pegazulejo modificado + boquilla + silicón al color" : "Modified thinset (2 bags) + grout + color-matched silicone", es ? "1 juego" : "1 set"],
        [es ? "Cinta malla 2\" + tornillos Backer-On + 2 anillos 1\" (W1/W2)" : "2\" mesh tape + Backer-On screws + two 1\" rings (W1/W2)", es ? "1 juego" : "1 set"]
      ];
      estNote = !ctx.hasTile
        ? (es ? `Pared: ${ctx.grossSqft} ft² (${ctx.orderSqft} ft² con +${state.tileWastePct}%). Elige medida o busca un producto arriba para calcular cajas exactas.` : `Wall area: ${ctx.grossSqft} sq ft (${ctx.orderSqft} sf with +${state.tileWastePct}%). Pick a size or look up a product above to calculate exact boxes.`)
        : (ctx.tileTotalCost != null
          ? (es ? `Solo cantidades: ${ctx.boxesNeeded} cajas (${ctx.billedSqft} ft² brutos) — verifica stock antes de pedir.` : `Quantities only: ${ctx.boxesNeeded} boxes (${ctx.billedSqft} gross sf) — verify stock before ordering.`)
          : (es ? `Agrega ft²/caja en (+ Agregar medida) o busca un producto para calcular cajas.` : `Add sf/box under (+ Add custom) or look up a product to calculate boxes.`));
    }

    return `
      <div class="calc-mat-wrap">
        <button class="calc-mat-btn ${isOpen ? "open" : ""}" data-calc-step="${stepId}" type="button" aria-expanded="${isOpen}">
          🔧 ${isOpen
            ? (es ? "Ocultar equipo y suministros ▴" : "Hide Equipment & Supplies ▴")
            : (es ? "Equipo y suministros ▾" : "Equipment & Supplies ▾")}
        </button>
        ${isOpen ? `
          <div class="calc-mat-panel">
            ${equipStripHtml(stepId, es)}
            <div style="font-weight:800;color:var(--cobalt);font-size:12.5px;margin-top:2px">
              🧮 ${es ? "Suministros calculados según tus opciones actuales:" : "Calculated supplies from your current selections:"}
            </div>
            <div>
              ${rows.map(([item, qty]) => `<div class="calc-row"><span>${item}</span><span class="calc-qty">${qty}</span></div>`).join("")}
            </div>
            <div style="font-size:11.5px;color:var(--ink-2);background:var(--paper);padding:6px 8px;border-radius:6px">${estNote}</div>
          </div>
        ` : ""}
      </div>
    `;
  }

  function wireCalcMaterials() {
    document.querySelectorAll("[data-calc-step]").forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.calcStep;
        state.calcOpenByStep[sid] = !state.calcOpenByStep[sid];
        renderDrawer();
      };
    });
  }


  function renderDrawer() {
    const es = state.lang === "es";
    const toolEl = document.getElementById("u4gToolBar");
    const bodyEl = document.getElementById("u4gBody");
    if (!toolEl || !bodyEl) return;

    const active = state.activeTab === "range-hood-plan"
      ? (PLANS[state.installStep] || PLANS["ks4-live"])
      : (PLANS[state.activeTab] || PLANS["ks4-live"]);
    toolEl.hidden = !(active && active.kind === "pdf");

    const effT = effectiveFloorT();
    const lineBAffNum = state.hoodAff + 9.5625; // Line A + 9-9/16" (Manual p. 4)
    const lineBAff = fmtFrac(lineBAffNum);
    const lineBSub = fmtFrac(lineBAffNum + effT);
    const canopyTopAff = state.hoodAff + 10.75; // 10-3/4" hood canopy height (Manual p. 3)
    const boxLowAff = Math.max(83, Math.ceil(canopyTopAff + 3));
    const boxHighAff = boxLowAff + 3;
    const koFromSouth = state.koSide === "south" ? "30-3/4\"" : "35-1/4\"";

    if (active.kind === "interactive") {
      toolEl.innerHTML = `
        <span style="font-weight:600;color:var(--ink)">${es ? "Alzado Muro Estufa · Escala 1:1" : "Range Wall Elevation · 1:1 Scale"}</span>
        <button class="mini-btn primary" id="exportPdfBtn" type="button">${t("exportPdf")}</button>
      `;
      document.getElementById("exportPdfBtn").onclick = () => {
        triggerBlueprintPdfExport();
      };

      // STRICT 1:1 PROPORTIONAL TRUE SCALE (scaleX === scaleY === 2.15 px/in)
      const S = 2.15;
      const floorY = 285.2;
      const ceilY = +(floorY - 121.5 * S).toFixed(1);   // 24.0
      const wallW = +(66.25 * S).toFixed(1);             // 142.4
      const wallX0 = +(190 - wallW / 2).toFixed(1);      // 118.8
      const cabW = +(18 * S).toFixed(1);                 // 38.7
      const cabH = +(36 * S).toFixed(1);                 // 77.4
      const rangeW = +(30 * S).toFixed(1);               // 64.5
      const rangeX = +(wallX0 + cabW).toFixed(1);        // 157.5
      const rightCabX = +(rangeX + rangeW).toFixed(1);   // 222.0
      const counterY = +(floorY - cabH).toFixed(1);      // 207.8
      const hoodBottomY = +(floorY - state.hoodAff * S).toFixed(1);
      const hoodTopY = +(hoodBottomY - 10.75 * S).toFixed(1);
      const ductW = +(6 * S).toFixed(1);                 // 12.9
      const shroudW = +(8.625 * S).toFixed(1);           // 18.5

      // COMPACT, REALISTIC STUD-BAY WOOD BLOCKING (strictly inside 30" hood width!)
      // 1 stud bay centered on C/L = 14.5" wide = 31.2px (174.4..205.6) — FAR narrower than 64.5px hood!
      const blkW = +(14.5 * S).toFixed(1);               // 31.2px (1 stud bay!)
      const blkX = +(190 - blkW / 2).toFixed(1);         // 174.4
      const lowBlkBotS1 = Math.max(70, Math.round((lineBAffNum - 4.5) * 4) / 4);
      const lowBlkTopS1 = lowBlkBotS1 + 9.25;
      const lowTopY = +(floorY - lowBlkTopS1 * S).toFixed(1);
      const lowBotY = +(floorY - lowBlkBotS1 * S).toFixed(1);
      const upBotY = +(floorY - 116.0 * S).toFixed(1);   // 2x6 bottom (116" AFF) -> 11.8px tall!
      const lineBY = +(floorY - lineBAffNum * S).toFixed(1);
      const screwDx = +(4.922 * S).toFixed(1);           // half of 9-27/32" = 10.6px
      const jboxY = +(floorY - boxHighAff * S).toFixed(1);
      const jboxH = +(3 * S).toFixed(1);                 // 3" tall 1-gang box = 6.5px
      const jboxW = +(2 * S).toFixed(1);                 // 2" wide 1-gang box = 4.3px
      const koDir = state.koSide === "south" ? -1 : 1;
      const jboxX = +(190 + koDir * (2.25 * S) - jboxW / 2).toFixed(1);

      const clearance = state.hoodAff - 36;
      const subfloorAff = fmtFrac(state.hoodAff + effT);
      const isPass = clearance >= 30 && clearance <= 36;
      const statusCls = clearance < 30 ? "fail" : (isPass ? "pass" : "fail");
      const statusTxt = clearance < 30 ? t("failLow", clearance) : (isPass ? t("passViking", clearance) : t("failHigh", clearance));

      bodyEl.innerHTML = `
        <div class="sheet-card">
          <div class="sheet-head">
            <div>
              <div class="sheet-title">${es ? "Alzado Muro Oeste — Estufa y Campana" : "Range Wall Elevation — Full West Wall"}</div>
              <div class="sheet-sub">${es ? "← Sur (0\") | Norte → · Escala 1:1 (18\" | 30\" | 18\") · Respaldos compactos" : "← South (0\") | North → · Strict 1:1 Scale (18\" | 30\" | 18\") · Compact Blocking"}</div>
            </div>
            <span class="compass">N ↑ · 1:1</span>
          </div>

          ${installStepNavHtml("ks4-live")}
          ${topDragBarHtml()}

          <div class="ks4-svg-wrap" id="ks4SvgWrap">
            <svg class="ks4-svg" id="ks4Svg" viewBox="0 0 380 310" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="woodHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#A15206" stroke-width="1.3" stroke-opacity="0.55"/>
                </pattern>
              </defs>
              <!-- Wall Envelope (exact 66-1/4" W x 121-1/2" H at 2.15 px/in) -->
              <rect x="${wallX0}" y="${ceilY}" width="${wallW}" height="${(floorY - ceilY).toFixed(1)}" fill="#FFFFFF" stroke="#C2CCD6" stroke-width="1"/>
              <!-- Subtle 16" OC studs behind wall -->
              ${[138.4, 172.8, 207.2, 241.6].map(sx => `<rect x="${sx}" y="${ceilY}" width="3.2" height="${(floorY - ceilY).toFixed(1)}" fill="#F1ECE4" stroke="#DDD3C5" stroke-width="0.6"/>`).join("")}
              <!-- Centerline C/L = 33" -->
              <line x1="190" y1="${ceilY}" x2="190" y2="${floorY}" stroke="#184E77" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.6"/>

              <line x1="16" y1="${ceilY}" x2="364" y2="${ceilY}" stroke="#131A22" stroke-width="1.8"/>
              <text x="20" y="16" font-size="7.8" font-family="monospace" fill="#485563">${es ? `TECHO 121-1/2" (${fmtFrac(121.5 + effT)}" subpiso) · CENTRO = 33" DEL SUR` : `CEILING 121-1/2" (${fmtFrac(121.5 + effT)}" subfloor) · CENTER = 33" FROM SOUTH`}</text>
              <line x1="16" y1="${floorY}" x2="364" y2="${floorY}" stroke="#131A22" stroke-width="2.2"/>
              <text x="20" y="300" font-size="7.8" font-family="monospace" fill="#485563">${es ? '← SUR 0"  |  18" BASE · 30" ESTUFA · 18" BASE (66-1/4")  |  NORTE →' : '← SOUTH 0"  |  18" BASE · 30" RANGE · 18" BASE (66-1/4")  |  NORTH →'}</text>

              <!-- COMPACT Upper 2x6 Wood Blocking (116"–121.5" AFF, 1 stud bay 14-1/2" W ONLY!) -->
              <rect x="${blkX}" y="${ceilY}" width="${blkW}" height="${(upBotY - ceilY).toFixed(1)}" fill="url(#woodHatch)" stroke="#A15206" stroke-width="1.2"/>
              <line x1="114" y1="${((ceilY + upBotY) / 2).toFixed(1)}" x2="${blkX}" y2="${((ceilY + upBotY) / 2).toFixed(1)}" stroke="#A15206" stroke-width="0.9"/>
              <text x="110" y="${(ceilY + 12).toFixed(1)}" text-anchor="end" font-size="7.2" font-weight="700" fill="#A15206">${es ? "BLOQUE 2×6 SUP." : "2×6 UPPER BLOCK"}</text>
              <text x="110" y="${(ceilY + 21).toFixed(1)}" text-anchor="end" font-size="6.7" font-family="monospace" fill="#78350F">${es ? '116"–121.5" · 1 claro' : '116"–121.5" · 1 bay'}</text>

              <!-- COMPACT Lower 2x10 Wood Blocking (tracks hood height live!) -->
              <rect id="ks4LowerBlkRect" x="${blkX}" y="${lowTopY}" width="${blkW}" height="${(lowBotY - lowTopY).toFixed(1)}" fill="url(#woodHatch)" stroke="#A15206" stroke-width="1.2"/>
              <line id="ks4LowerBlkLine" x1="114" y1="${((lowTopY + lowBotY) / 2).toFixed(1)}" x2="${blkX}" y2="${((lowTopY + lowBotY) / 2).toFixed(1)}" stroke="#A15206" stroke-width="0.9"/>
              <text id="ks4LowerBlkTxt1" x="110" y="${((lowTopY + lowBotY) / 2 - 1).toFixed(1)}" text-anchor="end" font-size="7.2" font-weight="700" fill="#A15206">${es ? "BLOQUE 2×10 INF." : "2×10 LOWER BLOCK"}</text>
              <text id="ks4LowerBlkTxt2" x="110" y="${((lowTopY + lowBotY) / 2 + 8).toFixed(1)}" text-anchor="end" font-size="6.7" font-family="monospace" fill="#78350F">${fmtFrac(lowBlkBotS1)}"–${fmtFrac(lowBlkTopS1)}" · ${es ? "1 claro" : "1 bay"}</text>

              <!-- 8-5/8" Stainless Chimney Casing + 6" Centered Vertical Vent -->
              <rect id="ks4ShroudRect" x="${(190 - shroudW / 2).toFixed(1)}" y="${ceilY}" width="${shroudW}" height="${Math.max(20, hoodTopY - ceilY).toFixed(1)}" fill="rgba(220,226,233,0.45)" stroke="#6E7D8C" stroke-dasharray="3 2"/>
              <rect id="ks4DuctRect" x="${(190 - ductW / 2).toFixed(1)}" y="${ceilY}" width="${ductW}" height="${Math.max(20, hoodTopY - ceilY).toFixed(1)}" fill="#E6F0F8" stroke="#184E77" stroke-width="1.2"/>
              <!-- Upper 8-5/8" Duct Cover Bracket -->
              <rect x="${(190 - shroudW / 2 + 1).toFixed(1)}" y="${(ceilY + 2).toFixed(1)}" width="${(shroudW - 2).toFixed(1)}" height="3" fill="#184E77"/>

              <!-- 1-Gang 15A Hardwire Box (Right above canopy, hidden inside 8-5/8" casing!) -->
              <rect id="ks4JboxRect" x="${jboxX}" y="${jboxY}" width="${jboxW}" height="${jboxH}" fill="#1B6B46" stroke="#FFFFFF" stroke-width="0.7"/>
              <line id="ks4JboxLine" x1="${(Number(jboxX) + Number(jboxW)).toFixed(1)}" y1="${(Number(jboxY) + Number(jboxH) / 2).toFixed(1)}" x2="268" y2="96" stroke="#1B6B46" stroke-width="0.9"/>
              <text x="272" y="94" font-size="7.2" font-weight="700" fill="#1B6B46">${es ? "CAJA 1-GANG 15A" : "1-GANG 15A BOX"}</text>
              <text id="ks4JboxSub" x="272" y="103" font-size="6.7" font-family="monospace" fill="#1B6B46">${boxLowAff}"–${boxHighAff}" ${es ? "piso · oculta" : "floor · hidden"}</text>

              <line x1="${(190 + shroudW / 2).toFixed(1)}" y1="62" x2="268" y2="62" stroke="#184E77" stroke-width="0.9"/>
              <text x="272" y="60" font-size="7.2" font-weight="700" fill="#184E77">${es ? 'CUBIERTA 8-5/8"' : '8-5/8" CASING'}</text>
              <text x="272" y="69" font-size="6.7" font-family="monospace" fill="#485563">${es ? 'Ducto 6" al centro' : '6" rigid vent centered'}</text>

              <!-- Exact 2 Zephyr Hanging Screws (9-27/32" spread) -->
              <circle id="ks4ScrewL" cx="${(190 - screwDx).toFixed(1)}" cy="${lineBY}" r="2.4" fill="#B42318" stroke="#FFFFFF" stroke-width="0.8"/>
              <circle id="ks4ScrewR" cx="${(190 + screwDx).toFixed(1)}" cy="${lineBY}" r="2.4" fill="#B42318" stroke="#FFFFFF" stroke-width="0.8"/>

              <!-- DIRECTLY DRAGGABLE Zephyr 30" Chimney Hood (2-way synced with #hoodRange 64"–74" AFF!) -->
              <g id="ks4HoodDragHandle" class="u4-drag-ns" data-drag-hood="step1" tabindex="0" role="slider" aria-label="${es ? 'Arrastrar altura de campana Zephyr' : 'Drag Zephyr hood height'}" aria-valuemin="64" aria-valuemax="74" aria-valuenow="${state.hoodAff}">
                <rect id="ks4HoodHit" x="${(rangeX - 8).toFixed(1)}" y="${(hoodTopY - 8).toFixed(1)}" width="${(rangeW + 16).toFixed(1)}" height="${(hoodBottomY - hoodTopY + 24).toFixed(1)}" fill="transparent"/>
                <polygon id="ks4HoodPoly" class="u4-drag-grip" points="${(190 - shroudW / 2).toFixed(1)},${hoodTopY} ${(190 + shroudW / 2).toFixed(1)},${hoodTopY} ${(rangeX + rangeW).toFixed(1)},${hoodBottomY} ${rangeX},${hoodBottomY}" fill="rgba(220,226,233,0.86)" stroke="#184E77" stroke-width="1.6"/>
                <text id="ks4HoodText" x="190" y="${(hoodBottomY - 4).toFixed(1)}" text-anchor="middle" font-size="6.8" font-weight="700" fill="#131A22" pointer-events="none">ZEPHYR 30"</text>
                <g id="ks4HoodGrip" pointer-events="none">
                  <rect x="167" y="${(hoodBottomY + 2.5).toFixed(1)}" width="46" height="11" rx="5.5" fill="#184E77"/>
                  <text x="190" y="${(hoodBottomY + 10.3).toFixed(1)}" text-anchor="middle" font-size="6.0" font-weight="800" fill="#FFFFFF">${es ? "↕ MOVER" : "↕ DRAG"}</text>
                </g>
              </g>

              <!-- Live Clearance Dimension Arrow -->
              <line id="ks4ClearLine" x1="${(wallX0 + wallW + 14).toFixed(1)}" y1="${hoodBottomY}" x2="${(wallX0 + wallW + 14).toFixed(1)}" y2="${counterY}" stroke="${isPass ? '#184E77' : '#B42318'}" stroke-width="1.5"/>
              <line id="ks4ClearTopTick" x1="${(wallX0 + wallW + 9).toFixed(1)}" y1="${hoodBottomY}" x2="${(wallX0 + wallW + 19).toFixed(1)}" y2="${hoodBottomY}" stroke="${isPass ? '#184E77' : '#B42318'}" stroke-width="1.5"/>
              <line id="ks4ClearBotTick" x1="${(wallX0 + wallW + 9).toFixed(1)}" y1="${counterY}" x2="${(wallX0 + wallW + 19).toFixed(1)}" y2="${counterY}" stroke="${isPass ? '#184E77' : '#B42318'}" stroke-width="1.5"/>
              <text id="ks4ClearText" x="${(wallX0 + wallW + 23).toFixed(1)}" y="${((hoodBottomY + counterY) / 2 - 1).toFixed(1)}" font-size="9.5" font-weight="700" font-family="monospace" fill="${isPass ? '#184E77' : '#B42318'}">${clearance}" ${es ? "libre" : "clear"}</text>
              <text id="ks4ClearFloorText" x="${(wallX0 + wallW + 23).toFixed(1)}" y="${((hoodBottomY + counterY) / 2 + 10).toFixed(1)}" font-size="7.8" fill="#485563">${state.hoodAff}" ${es ? "piso" : "floor"}</text>

              <!-- STRICTLY PROPORTIONAL BASE CABINETS (18" W x 36" H) & VIKING RANGE (30" W x 36" H) -->
              <rect x="${wallX0}" y="${counterY}" width="${cabW}" height="${cabH}" fill="#E6EEE8" stroke="#2D4A3E" stroke-width="1.3"/>
              <line x1="${wallX0}" y1="${(counterY + 14).toFixed(1)}" x2="${(wallX0 + cabW).toFixed(1)}" y2="${(counterY + 14).toFixed(1)}" stroke="#2D4A3E" stroke-width="0.9"/>
              <text x="${(wallX0 + cabW / 2).toFixed(1)}" y="${(counterY + 42).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" fill="#2D4A3E">18"</text>
              <text x="${(wallX0 + cabW / 2).toFixed(1)}" y="${(counterY + 53).toFixed(1)}" text-anchor="middle" font-size="6.8" fill="#485563">${es ? "BASE (S)" : "BASE (S)"}</text>

              <rect x="${rangeX}" y="${counterY}" width="${rangeW}" height="${cabH}" rx="1.5" fill="#EEF1F5" stroke="#131A22" stroke-width="1.6"/>
              <line x1="${rangeX}" y1="${(counterY + 12).toFixed(1)}" x2="${(rangeX + rangeW).toFixed(1)}" y2="${(counterY + 12).toFixed(1)}" stroke="#131A22" stroke-width="1"/>
              <text x="190" y="${(counterY + 40).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" fill="#131A22">VIKING 30"</text>
              <text x="190" y="${(counterY + 51).toFixed(1)}" text-anchor="middle" font-size="7" fill="#485563">${es ? 'cubierta 36"' : '36" counter'}</text>

              <rect x="${rightCabX}" y="${counterY}" width="${cabW}" height="${cabH}" fill="#E6EEE8" stroke="#2D4A3E" stroke-width="1.3"/>
              <line x1="${rightCabX}" y1="${(counterY + 14).toFixed(1)}" x2="${(rightCabX + cabW).toFixed(1)}" y2="${(counterY + 14).toFixed(1)}" stroke="#2D4A3E" stroke-width="0.9"/>
              <text x="${(rightCabX + cabW / 2).toFixed(1)}" y="${(counterY + 42).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" fill="#2D4A3E">18"</text>
              <text x="${(rightCabX + cabW / 2).toFixed(1)}" y="${(counterY + 53).toFixed(1)}" text-anchor="middle" font-size="6.8" fill="#485563">${es ? "BASE (N)" : "BASE (N)"}</text>

              ${svgMarksHtml("ks4-live")}
            </svg>
            ${activePinSteerHtml("ks4-live")}
          </div>

          <div class="ks4-controls">
            <div class="slider-row">
              <label for="hoodRange">${t("hoodSlider")}</label>
              <input id="hoodRange" type="range" min="64" max="74" step="1" value="${state.hoodAff}">
              <span id="ks4HoodReadout" class="slider-readout">${state.hoodAff}"</span>
            </div>
            <div id="ks4SubfloorSummary" style="font-size:12px;color:var(--ink-2);font-family:var(--mono)">
              ${es ? `Desde subpiso: ${subfloorAff}" · 2 tornillos de carga: ${lineBAff}" piso (${lineBSub}" subpiso)` : `Off bare subfloor: ${subfloorAff}" · 2 hanging screws: ${lineBAff}" off floor (${lineBSub}" off subfloor)`}
            </div>
            ${floorStatusControlHtml(es)}
            <div id="ks4StatusStrip" class="status-strip ${statusCls}"><span>${statusTxt}</span></div>
          </div>

          ${markEditorAndListHtml("ks4-live")}

          <div class="key-facts">
            <div class="key-facts-title">${es ? "Lo importante (en palabras simples)" : "Important Things to Know"}</div>
            <ul>
              <li><strong>${es ? "Por qué la campana va 30\"–36\" arriba de la estufa:" : "Why the hood hangs 30\"–36\" above the stove:"}</strong> ${es ? "La estufa de gas Viking calienta más que una normal, así que exige al menos 30\" de espacio libre sobre las hornillas (66\"–72\" desde el piso terminado; apuntamos a 67\"–68\"). Aunque Zephyr permite 28\", la regla de Viking manda por seguridad y garantía." : "The Viking gas range puts out more heat than a standard stove, so Viking requires at least 30\" of open air above the burners (66\"–72\" off the finished floor; we're aiming for 67\"–68\"). Even though Zephyr allows 28\", Viking's rule wins for safety and warranty."}</li>
              <li><strong>${es ? "Por qué el respaldo de madera es pequeño:" : "Why the wood backing stays compact:"}</strong> ${es ? "Toda la campana se cuelga de solo 2 tornillos cerca del centro, más un soporte pequeño arriba. Por eso solo necesitas dos bloques cortos detrás de la campana — nunca más anchos que las 30\"." : "The entire hood hangs from just two screws near the middle, plus one small bracket right at the ceiling to steady the chimney cover. So you only need two short horizontal blocks tucked behind the hood — never stretching out past the 30\" hood onto the open tiled wall."}</li>
              <li><strong>${es ? "El pequeño hueco posible arriba del tubo:" : "Why there may be a small gap at the ceiling:"}</strong> ${es ? "La cubierta metálica estándar alcanza hasta ~110\"–117\" de altura y este techo mide 121-1/2\". Medir ese hueco al colgarla de prueba decide si pides la extensión de Zephyr o haces un cajillo pequeño arriba." : "Zephyr's stock stainless chimney cover reaches up to about 110\"–117\" high, while this ceiling is 121-1/2\" tall. Measuring that leftover gap during the test-hang tells you whether to order Zephyr's tall extension cover or frame a small tiled drop box at the ceiling."}</li>
              <li><strong>${es ? "HardieBacker y azulejo hasta el techo:" : "HardieBacker + full-height tile plan:"}</strong> ${es ? "Este muro lleva HardieBacker de 1/2\" (no tablaroca) más ~3/8\"–1/2\" de pegamento y azulejo hasta el techo (total ~1\" sobre los postes). Por eso la caja 1-gang 15A debe quedar ~1\" salida al frente y la campana se instala encima del azulejo con tornillos largos de 2-1/2\"–3\"." : "This entire stove wall gets 1/2\" HardieBacker cement board (not regular drywall) plus ~3/8\"–1/2\" thinset & full-height tile to the ceiling (~1\" total wall buildup over bare studs). Set the 1-gang electrical box proud ~1\" so it ends flush with the tile, and hang the hood on top of finished tile with 2-1/2\"–3\" screws."}</li>
            </ul>
            ${manualLinksBarHtml()}
          </div>

          ${calcMaterialsBlockHtml("ks4-live", es, {})}
          ${renderSheetPager("ks4-live")}
        </div>
      `;

      function updateKs4Step1Live(newAff) {
        const aff = Math.max(64, Math.min(74, Math.round(newAff)));
        state.hoodAff = aff;
        const hBotY = +(floorY - aff * S).toFixed(1);
        const hTopY = +(hBotY - 10.75 * S).toFixed(1);
        const lbAffNum = aff + 9.5625;
        const lbY = +(floorY - lbAffNum * S).toFixed(1);
        const lbBot = Math.max(70, Math.round((lbAffNum - 4.5) * 4) / 4);
        const lbTop = lbBot + 9.25;
        const lTopY = +(floorY - lbTop * S).toFixed(1);
        const lBotY = +(floorY - lbBot * S).toFixed(1);
        const bLow = Math.max(82, Math.round(aff + 15));
        const bHigh = bLow + 3;
        const jbY = +(floorY - bHigh * S).toFixed(1);
        const clr = aff - 36;
        const ok = clr >= 30 && clr <= 36;
        const col = ok ? "#184E77" : "#B42318";

        const poly = document.getElementById("ks4HoodPoly");
        if (poly) poly.setAttribute("points", `${(190 - shroudW / 2).toFixed(1)},${hTopY} ${(190 + shroudW / 2).toFixed(1)},${hTopY} ${(rangeX + rangeW).toFixed(1)},${hBotY} ${rangeX},${hBotY}`);
        const hTxt = document.getElementById("ks4HoodText");
        if (hTxt) hTxt.setAttribute("y", (hBotY - 4).toFixed(1));
        const hHit = document.getElementById("ks4HoodHit");
        if (hHit) { hHit.setAttribute("y", (hTopY - 8).toFixed(1)); hHit.setAttribute("height", (hBotY - hTopY + 24).toFixed(1)); }
        const hGrip = document.getElementById("ks4HoodGrip");
        if (hGrip) {
          const r = hGrip.querySelector("rect"), tx = hGrip.querySelector("text");
          if (r) r.setAttribute("y", (hBotY + 2.5).toFixed(1));
          if (tx) tx.setAttribute("y", (hBotY + 10.3).toFixed(1));
        }
        const sh = document.getElementById("ks4ShroudRect");
        if (sh) sh.setAttribute("height", Math.max(20, hTopY - ceilY).toFixed(1));
        const dt = document.getElementById("ks4DuctRect");
        if (dt) dt.setAttribute("height", Math.max(20, hTopY - ceilY).toFixed(1));
        const scL = document.getElementById("ks4ScrewL"), scR = document.getElementById("ks4ScrewR");
        if (scL) scL.setAttribute("cy", lbY);
        if (scR) scR.setAttribute("cy", lbY);
        const jb = document.getElementById("ks4JboxRect"), jbl = document.getElementById("ks4JboxLine"), jbs = document.getElementById("ks4JboxSub");
        if (jb) jb.setAttribute("y", jbY);
        if (jbl) jbl.setAttribute("y1", (jbY + Number(jboxH) / 2).toFixed(1));
        if (jbs) jbs.textContent = `${bLow}"–${bHigh}" ${es ? "piso · oculta" : "floor · hidden"}`;
        const lbR = document.getElementById("ks4LowerBlkRect"), lbLn = document.getElementById("ks4LowerBlkLine");
        const lbT1 = document.getElementById("ks4LowerBlkTxt1"), lbT2 = document.getElementById("ks4LowerBlkTxt2");
        const lbMid = ((lTopY + lBotY) / 2).toFixed(1);
        if (lbR) { lbR.setAttribute("y", lTopY); lbR.setAttribute("height", (lBotY - lTopY).toFixed(1)); }
        if (lbLn) { lbLn.setAttribute("y1", lbMid); lbLn.setAttribute("y2", lbMid); }
        if (lbT1) lbT1.setAttribute("y", (Number(lbMid) - 1).toFixed(1));
        if (lbT2) { lbT2.setAttribute("y", (Number(lbMid) + 8).toFixed(1)); lbT2.textContent = `${fmtFrac(lbBot)}"–${fmtFrac(lbTop)}" · ${es ? "1 claro" : "1 bay"}`; }

        const clL = document.getElementById("ks4ClearLine"), clT = document.getElementById("ks4ClearTopTick"), clB = document.getElementById("ks4ClearBotTick");
        const clTx = document.getElementById("ks4ClearText"), clFl = document.getElementById("ks4ClearFloorText");
        if (clL) { clL.setAttribute("y1", hBotY); clL.setAttribute("stroke", col); }
        if (clT) { clT.setAttribute("y1", hBotY); clT.setAttribute("y2", hBotY); clT.setAttribute("stroke", col); }
        if (clB) clB.setAttribute("stroke", col);
        if (clTx) { clTx.setAttribute("y", ((hBotY + counterY) / 2 - 1).toFixed(1)); clTx.setAttribute("fill", col); clTx.textContent = `${clr}" ${es ? "libre" : "clear"}`; }
        if (clFl) { clFl.setAttribute("y", ((hBotY + counterY) / 2 + 10).toFixed(1)); clFl.textContent = `${aff}" ${es ? "piso" : "floor"}`; }

        const rng = document.getElementById("hoodRange");
        if (rng) rng.value = String(aff);
        const ro = document.getElementById("ks4HoodReadout");
        if (ro) ro.textContent = `${aff}"`;
        const subEl = document.getElementById("ks4SubfloorSummary");
        if (subEl) {
          const sf = fmtFrac(aff + effT);
          const lbA = fmtFrac(lbAffNum);
          const lbS = fmtFrac(lbAffNum + effT);
          subEl.textContent = es
            ? `Desde subpiso: ${sf}" · 2 tornillos de carga: ${lbA}" piso (${lbS}" subpiso)`
            : `Off bare subfloor: ${sf}" · 2 hanging screws: ${lbA}" off floor (${lbS}" off subfloor)`;
        }
        const stEl = document.getElementById("ks4StatusStrip");
        if (stEl) {
          stEl.className = "status-strip " + (ok ? "pass" : "fail");
          stEl.innerHTML = `<span>${clr < 30 ? t("failLow", clr) : (ok ? t("passViking", clr) : t("failHigh", clr))}</span>`;
        }
        const dh = document.getElementById("ks4HoodDragHandle");
        if (dh) dh.setAttribute("aria-valuenow", String(aff));
      }

      const hoodRangeEl = document.getElementById("hoodRange");
      hoodRangeEl.oninput = (e) => {
        updateKs4Step1Live(Number(e.target.value));
      };
      hoodRangeEl.onchange = () => {
        renderDrawer();
      };

      const hoodDragEl = document.getElementById("ks4HoodDragHandle");
      const ks4SvgEl = document.getElementById("ks4Svg");
      const ks4WrapEl = document.getElementById("ks4SvgWrap");
      if (hoodDragEl && ks4SvgEl) {
        hoodDragEl.addEventListener("pointerdown", (e) => {
          if (ks4WrapEl && ks4WrapEl.classList.contains("drop-target")) return;
          if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
          e.preventDefault();
          e.stopPropagation();
          const pointerId = e.pointerId;
          const startAff = state.hoodAff;
          const rect = ks4SvgEl.getBoundingClientRect();
          const pxPerSvgY = (rect.height || 310) / 310;
          const startClientY = e.clientY;
          hoodDragEl.classList.add("is-dragging");
          try { hoodDragEl.setPointerCapture(pointerId); } catch (_) {}
          const blockScroll = (tev) => { if (tev.cancelable) tev.preventDefault(); };
          window.addEventListener("touchmove", blockScroll, { passive: false });

          function onMove(ev) {
            if (ev.pointerId !== pointerId) return;
            const deltaSvgY = (ev.clientY - startClientY) / (pxPerSvgY || 1);
            const deltaIn = -deltaSvgY / S;
            updateKs4Step1Live(startAff + deltaIn);
          }
          function finish(ev) {
            if (ev && ev.pointerId !== pointerId) return;
            hoodDragEl.classList.remove("is-dragging");
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", finish);
            document.removeEventListener("pointercancel", finish);
            window.removeEventListener("touchmove", blockScroll);
            try { if (hoodDragEl.hasPointerCapture && hoodDragEl.hasPointerCapture(pointerId)) hoodDragEl.releasePointerCapture(pointerId); } catch (_) {}
            renderDrawer();
          }
          document.addEventListener("pointermove", onMove);
          document.addEventListener("pointerup", finish);
          document.addEventListener("pointercancel", finish);
        });
        hoodDragEl.addEventListener("keydown", (e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); updateKs4Step1Live(state.hoodAff + 1); }
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); updateKs4Step1Live(state.hoodAff - 1); }
        });
      }

      wireFloorStatusControls();
      wireCalcMaterials();
      wireInteractiveSvgMarks("ks4-live", "ks4Svg", "ks4SvgWrap");

    } else if (active.kind === "interactive-sheet-1") {
      toolEl.innerHTML = `
        <span style="font-weight:600;color:var(--ink)">${es ? "Respaldos y Puntos de Montaje" : "Wood Blocking & Exact Mounting Points"}</span>
        <button class="mini-btn primary" id="exportSheetPdfBtn" type="button">${t("exportPdf")}</button>
      `;
      document.getElementById("exportSheetPdfBtn").onclick = () => {
        showToast(es ? "Exportando Respaldos y Montaje en PDF..." : "Exporting Wood Blocking & Mounting PDF...");
      };

      const is2Bay = state.studLayout === "2bay";
      const lowBlkBotAff = Math.max(70, Math.round((lineBAffNum - 4.5) * 4) / 4);
      const lowBlkTopAff = lowBlkBotAff + 9.25; // exact 2x10 height (9-1/4") centered on Line B!
      const lowSub = `${fmtFrac(lowBlkBotAff + effT)}"–${fmtFrac(lowBlkTopAff + effT)}"`;
      const upSub = `${fmtFrac(116 + effT)}"–${fmtFrac(121.5 + effT)}"`;
      const stockMaxReach = state.hoodAff + 10.75 + 44; // canopy 10-3/4" + stock 44" chimney cover
      const ceilingGap = Math.max(0, +(121.5 - stockMaxReach).toFixed(2));
      const soffitBotAff = +(121.5 - ceilingGap).toFixed(2);

      // Zoomed true horizontal scale: 5.4 px/in centered at x=190 (C/L = 33" from South)
      // 30" hood = 162px (109..271); 8-5/8" chimney = 46.6px (166.7..213.3); 9-27/32" screws = 53.2px (163.4..216.6)
      // 16" OC stud spacing = 86.4px; stud width = 1.5" = 8.1px
      const studs = is2Bay
        ? [100, 186, 272]             // stud dead on C/L -> 2 bays spanning inside 30" hood (108..272 = 30.4")
        : [57, 143, 229, 315];        // centered bay -> 1 bay (151..229 = 14.5" clear inside 30" hood!)
      const blkX0 = is2Bay ? 108 : 151;
      const blkW = is2Bay ? 164 : 78;
      const lineBY = Math.max(150, Math.min(204, Math.round(176 - (state.hoodAff - 68) * 3.5)));

      bodyEl.innerHTML = `
        <div class="sheet-card">
          <div class="sheet-head">
            <div>
              <div class="sheet-title">${es ? "Respaldos de Madera y Puntos Exactos de Montaje" : "Wood Blocking & Exact Mounting Points"}</div>
              <div class="sheet-sub">${es ? "← Sur (0\") | Norte → · Medidas reales desde centro 33\" (Manual Zephyr p. 4)" : "← South (0\") | North → · Exact Screw Coordinates on C/L 33\" (Zephyr Manual p. 4)"}</div>
            </div>
            <span class="compass">C/L = 33"</span>
          </div>

          ${installStepNavHtml("hood-s1")}
          ${topDragBarHtml()}

          <div class="ks4-svg-wrap" id="s1SvgWrap">
            <svg class="ks4-svg" id="s1Svg" viewBox="0 0 380 310" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="woodHatchS1" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="7" stroke="#A15206" stroke-width="1.3" stroke-opacity="0.48"/>
                </pattern>
              </defs>

              <!-- 16" OC Vertical Wall Studs -->
              ${studs.map(sx => `<rect x="${sx}" y="22" width="8" height="264" fill="#EFE6D8" stroke="#BEA98D" stroke-width="1"/>`).join("")}

              <!-- Ceiling & Break Lines -->
              <line x1="16" y1="22" x2="364" y2="22" stroke="#131A22" stroke-width="2"/>
              <text x="190" y="14" text-anchor="middle" font-size="8" font-weight="700" font-family="monospace" fill="#184E77">${es ? 'LÍNEA CENTRAL A PLOMO = 33" DESDE ESQUINA SUR' : 'PLUMB CENTERLINE = 33" FROM SOUTH CORNER'}</text>
              <line x1="190" y1="22" x2="190" y2="286" stroke="#184E77" stroke-width="1.1" stroke-dasharray="5 3"/>

              <!-- Dashed 8-5/8" Chimney Casing Reference (166.7..213.3) -->
              <rect x="166.7" y="22" width="46.6" height="232" fill="rgba(220,226,233,0.22)" stroke="#6E7D8C" stroke-width="1" stroke-dasharray="3 3"/>
              <text x="219" y="108" font-size="7.2" fill="#485563">${es ? 'cubierta 8-5/8"' : '8-5/8" casing outline'}</text>

              <!-- Dashed 30" Hood Footprint Reference (109..271) -->
              <rect x="109" y="128" width="162" height="126" fill="none" stroke="#131A22" stroke-width="1" stroke-dasharray="4 3"/>
              <text x="275" y="246" font-size="7.2" font-weight="700" fill="#131A22">${es ? 'ancho campana 30"' : '30" hood width'}</text>
              <text x="275" y="255" font-size="6.8" fill="#485563">${es ? '(madera queda dentro)' : '(blocking stays inside)'}</text>

              <!-- UPPER 2x6 WOOD BLOCKING -->
              <rect x="${blkX0}" y="22" width="${blkW}" height="34" fill="url(#woodHatchS1)" stroke="#A15206" stroke-width="1.7"/>
              ${is2Bay ? `<rect x="186" y="22" width="8" height="34" fill="#EFE6D8" stroke="#BEA98D" stroke-width="1"/>` : ""}
              <rect x="169" y="27" width="42" height="8" rx="1.5" fill="#184E77"/>
              <circle cx="176" cy="31" r="2.2" fill="#FFFFFF"/>
              <circle cx="204" cy="31" r="2.2" fill="#FFFFFF"/>
              <text x="190" y="67" text-anchor="middle" font-size="7.4" font-weight="700" fill="#78350F">${es ? `BLOQUE 2×6 SUP. (116"–121-1/2" piso · Subpiso: ${upSub})` : `2×6 UPPER BLOCK (116"–121-1/2" off floor · Subfloor: ${upSub})`}</text>
              <text x="190" y="77" text-anchor="middle" font-size="7" font-family="monospace" fill="#184E77">${es ? 'Sostiene el soporte superior de 8-5/8" junto al techo' : 'Holds narrow 8-5/8" ceiling chimney bracket'}</text>

              <line x1="22" y1="98" x2="150" y2="98" stroke="#DCE2E9" stroke-dasharray="2 3"/>
              <text x="24" y="94" font-size="7" fill="#6E7D8C">${es ? 'Sin madera necesaria aquí (83"–116")' : 'No wood blocking needed (83"–116")'}</text>

              <!-- LOWER 2x10 WOOD BLOCKING -->
              <rect x="${blkX0}" y="140" width="${blkW}" height="68" fill="url(#woodHatchS1)" stroke="#A15206" stroke-width="1.8"/>
              ${is2Bay ? `<rect x="186" y="140" width="8" height="68" fill="#EFE6D8" stroke="#BEA98D" stroke-width="1"/>` : ""}
              <rect x="74" y="121" width="232" height="15" rx="3" fill="#FFFFFF" fill-opacity="0.96"/>
              <text id="s1LowBlockText" x="190" y="131.5" text-anchor="middle" font-size="6.9" font-weight="700" fill="#78350F">${es ? `BLOQUE 2×10 INF.: ${fmtFrac(lowBlkBotAff)}"–${fmtFrac(lowBlkTopAff)}" piso (Sub: ${lowSub})` : `2×10 LOWER BLOCK: ${fmtFrac(lowBlkBotAff)}"–${fmtFrac(lowBlkTopAff)}" floor (Sub: ${lowSub})`}</text>

              <!-- DIRECTLY DRAGGABLE ZEPHYR HANGING SCREW BAR (2-way synced with #s1HoodRange 66"–72" AFF!) -->
              <g id="s1ScrewDragHandle" class="u4-drag-ns" data-drag-hood="step2" tabindex="0" role="slider" aria-label="${es ? 'Arrastrar altura de tornillos de carga' : 'Drag hood hanging screw height'}" aria-valuemin="66" aria-valuemax="72" aria-valuenow="${Math.max(66, Math.min(72, state.hoodAff))}" transform="translate(0, 0)">
                <rect x="108" y="${lineBY - 16}" width="164" height="54" fill="transparent"/>
                <line x1="112" y1="${lineBY}" x2="268" y2="${lineBY}" stroke="#B42318" stroke-width="1.4" stroke-dasharray="3 2"/>
                <circle class="u4-drag-grip" cx="163.4" cy="${lineBY}" r="5.5" fill="rgba(180,35,24,0.18)" stroke="#B42318" stroke-width="1.8"/>
                <circle cx="163.4" cy="${lineBY}" r="2" fill="#B42318"/>
                <circle class="u4-drag-grip" cx="216.6" cy="${lineBY}" r="5.5" fill="rgba(180,35,24,0.18)" stroke="#B42318" stroke-width="1.8"/>
                <circle cx="216.6" cy="${lineBY}" r="2" fill="#B42318"/>

                <line x1="163.4" y1="${lineBY + 17}" x2="216.6" y2="${lineBY + 17}" stroke="#B42318" stroke-width="1.4"/>
                <line x1="163.4" y1="${lineBY + 12}" x2="163.4" y2="${lineBY + 22}" stroke="#B42318" stroke-width="1.4"/>
                <line x1="216.6" y1="${lineBY + 12}" x2="216.6" y2="${lineBY + 22}" stroke="#B42318" stroke-width="1.4"/>
                <rect x="139" y="${lineBY + 21}" width="102" height="15" rx="4" fill="#FEECEB" stroke="#B42318" stroke-width="1.1"/>
                <text x="190" y="${lineBY + 31.2}" text-anchor="middle" font-size="7.2" font-weight="800" font-family="monospace" fill="#B42318">↕ ${es ? '9-27/32" · MOVER' : '9-27/32" · DRAG'}</text>

                <text x="104" y="${lineBY - 3}" text-anchor="end" font-size="7.2" font-weight="700" fill="#B42318">${es ? "TORNILLO IZQ." : "LEFT SCREW"}</text>
                <text x="104" y="${lineBY + 7}" text-anchor="end" font-size="7" font-family="monospace" fill="#131A22">${es ? '28-1/16" del Sur' : '28-1/16" from S'}</text>
                <text x="104" y="${lineBY + 16}" text-anchor="end" font-size="6.7" fill="#485563">${es ? '(Centro − 4-15/16")' : '(Center − 4-15/16")'}</text>

                <text x="276" y="${lineBY - 3}" font-size="7.2" font-weight="700" fill="#B42318">${es ? "TORNILLO DER." : "RIGHT SCREW"}</text>
                <text x="276" y="${lineBY + 7}" font-size="7" font-family="monospace" fill="#131A22">${es ? '37-15/16" del Sur' : '37-15/16" from S'}</text>
                <text x="276" y="${lineBY + 16}" font-size="6.7" fill="#485563">${es ? '(Centro + 4-15/16")' : '(Center + 4-15/16")'}</text>
              </g>

              <line x1="109" y1="254" x2="271" y2="254" stroke="#184E77" stroke-width="1.6"/>
              <text id="s1FooterReadout" x="190" y="267" text-anchor="middle" font-size="7.4" font-weight="700" font-family="monospace" fill="#184E77">${es ? `BASE CAMPANA: ${state.hoodAff}" piso · 2 TORNILLOS: ${lineBAff}" (${lineBSub}" subpiso)` : `HOOD BOTTOM: ${state.hoodAff}" off floor · 2 SCREWS: ${lineBAff}" (${lineBSub}" subfloor)`}</text>
              <text x="190" y="280" text-anchor="middle" font-size="7.1" fill="#485563">${es ? 'Al ras de postes para HardieBacker 1/2" + azulejo (~1") · tornillos 2-1/2"–3"' : 'Flush w/ studs for 1/2" HardieBacker + tile (~1" buildup) · use 2-1/2"–3" screws'}</text>

              ${svgMarksHtml("hood-s1")}
            </svg>
            ${activePinSteerHtml("hood-s1")}
          </div>

          <div class="ks4-controls">
            <div class="slider-row">
              <label for="s1HoodRange">${es ? "Altura elegida (borde inferior):" : "Chosen hood bottom height:"}</label>
              <input id="s1HoodRange" type="range" min="66" max="72" step="1" value="${Math.max(66, Math.min(72, state.hoodAff))}">
              <span id="s1HoodReadout" class="slider-readout">${state.hoodAff}" ${es ? "piso" : "off floor"}</span>
            </div>
            <div class="slider-row">
              <span>${es ? "Cómo caen los postes:" : "Where the wall studs fall:"}</span>
              <div style="display:flex;gap:5px">
                <button class="intent-btn ${!is2Bay ? "active" : ""}" data-studs="1bay" type="button">${es ? '1 claro (~14-1/2")' : '1 bay (~14-1/2")'}</button>
                <button class="intent-btn ${is2Bay ? "active" : ""}" data-studs="2bay" type="button">${es ? "Poste al centro (2 claros)" : "Stud on center (2 bays)"}</button>
              </div>
            </div>
            ${floorStatusControlHtml(es)}
            <div class="status-strip pass" style="flex-direction:column;align-items:flex-start;gap:6px">
              ${es ? `
                <div>
                  <strong>1. Bloque inferior (2×10) — carga la campana:</strong><br>
                  • <b>2 tornillos:</b> 9-9/16" arriba de la base → <b>${lineBAff}" del piso</b> (${lineBSub}" del subpiso) · 9-27/32" entre sí (~5" a cada lado del centro)<br>
                  • <b>Madera:</b> un 2×10 horizontal de <b>${fmtFrac(lowBlkBotAff)}" a ${fmtFrac(lowBlkTopAff)}"</b> del piso
                </div>
                <div style="padding-top:4px;border-top:1px dashed rgba(27,107,70,0.28);width:100%">
                  <strong>2. Bloque superior (2×6) — sujeta la chimenea arriba:</strong><br>
                  • <b>Madera:</b> un 2×6 pegado al techo (<b>116"–121-1/2"</b> del piso / ${upSub} del subpiso)<br>
                  • <b>Cubierta:</b> ${ceilingGap > 0 ? `falta ${fmtFrac(ceilingGap)}" al techo — usa extensión o cajillo a ${fmtFrac(soffitBotAff)}"` : "la cubierta de fábrica alcanza hasta el techo"}
                </div>
              ` : `
                <div>
                  <strong>1. Lower block (2×10) — carries the hood:</strong><br>
                  • <b>2 screws:</b> 9-9/16" above hood bottom → <b>${lineBAff}" off floor</b> (${lineBSub}" off subfloor) · 9-27/32" apart (~5" each side of center)<br>
                  • <b>Wood block:</b> one horizontal 2×10 from <b>${fmtFrac(lowBlkBotAff)}"–${fmtFrac(lowBlkTopAff)}"</b> off floor
                </div>
                <div style="padding-top:4px;border-top:1px dashed rgba(27,107,70,0.28);width:100%">
                  <strong>2. Upper block (2×6) — steadies top of chimney:</strong><br>
                  • <b>Wood block:</b> one 2×6 tight under ceiling (<b>116"–121-1/2"</b> off floor / ${upSub} off subfloor)<br>
                  • <b>Chimney reach:</b> ${ceilingGap > 0 ? `${fmtFrac(ceilingGap)}" short of ceiling — order extension or drop soffit to ${fmtFrac(soffitBotAff)}"` : "stock cover reaches the full ceiling"}
                </div>
              `}
            </div>
          </div>

          ${markEditorAndListHtml("hood-s1")}

          <div class="key-facts">
            <div class="key-facts-title">${es ? "Lo importante sobre el montaje (en palabras simples)" : "Important Mounting Facts (Plain English)"}</div>
            <ul>
              <li><strong>${es ? "Dónde van los 2 tornillos de carga según la altura:" : "Where the two hanging screws go (moves with hood height):"}</strong> ${es ? `Las ranuras atrás de la campana siempre quedan 9-9/16" arriba del borde inferior. Así que si cuelgas la campana a ${state.hoodAff}", los 2 tornillos van a ${lineBAff}" del piso terminado (a 66" van a 75-9/16"; a 72" van a 81-9/16"), separados 9-27/32" entre sí.` : `The two keyhole slots on the back of the hood always sit 9-9/16" higher than the hood's bottom edge. At your current ${state.hoodAff}" hood height, the screws land at ${lineBAff}" off the finished floor (at 66" hood they sit at 75-9/16"; at 72" they sit at 81-9/16"). They are 9-27/32" apart — almost 5" to each side of center — so one short 2×10 block catches both easily.`}</li>
              <li><strong>${es ? "Para qué sirve el bloque superior:" : "What the upper block is for:"}</strong> ${es ? `Un soporte pequeño (cabe dentro de la cubierta de 8-5/8") se atornilla justo bajo el techo de 121-1/2" (si usas la extensión) o bajo el cajillo a ${fmtFrac(soffitBotAff)}" solo para mantener recta la chimenea.` : `A narrow metal bracket (fits inside the 8-5/8" stainless cover) screws into the wall right under the 121-1/2" ceiling — or right under a small ceiling drop box at ${fmtFrac(soffitBotAff)}" if you don't order the tall extension — simply to hold the top of the stainless chimney straight. One short 2×6 block up top is plenty.`}</li>
              <li><strong>${es ? "Cómo mantenerla exactamente centrada:" : "How to keep it dead-centered over the stove:"}</strong> ${es ? "Marca primero una línea vertical al centro de la estufa (33\" desde la esquina Sur/izquierda) y mide 4-15/16\" hacia cada lado — nunca midas desde un poste." : "Mark a straight vertical centerline up from the middle of the 30\" stove first (33\" from the South/left corner). Always measure the two hanging screws outward from that centerline — never off a wall stud, since studs rarely land on center."}</li>
            </ul>
            ${manualLinksBarHtml()}
          </div>

          ${calcMaterialsBlockHtml("hood-s1", es, { lineBAff })}
          ${renderSheetPager("hood-s1")}
        </div>
      `;

      const s1InitLineBY = lineBY;
      function updateKs4Step2Live(newAff) {
        const aff = Math.max(66, Math.min(72, Math.round(newAff)));
        state.hoodAff = aff;
        const targetY = Math.max(150, Math.min(204, Math.round(176 - (aff - 68) * 3.5)));
        const dy = targetY - s1InitLineBY;
        const gEl = document.getElementById("s1ScrewDragHandle");
        if (gEl) {
          gEl.setAttribute("transform", `translate(0, ${dy})`);
          gEl.setAttribute("aria-valuenow", String(aff));
        }
        const lbNum = aff + 9.5625;
        const lbA = fmtFrac(lbNum);
        const lbS = fmtFrac(lbNum + effT);
        const lbBot = Math.max(70, Math.round((lbNum - 4.5) * 4) / 4);
        const lbTop = lbBot + 9.25;
        const lSub = `${fmtFrac(lbBot + effT)}"–${fmtFrac(lbTop + effT)}"`;
        const rng = document.getElementById("s1HoodRange");
        if (rng) rng.value = String(aff);
        const ro = document.getElementById("s1HoodReadout");
        if (ro) ro.textContent = `${aff}" ${es ? "piso" : "off floor"}`;
        const lbl = document.getElementById("s1LowBlockText");
        if (lbl) lbl.textContent = es ? `BLOQUE 2×10 INF.: ${fmtFrac(lbBot)}"–${fmtFrac(lbTop)}" piso (Sub: ${lSub})` : `2×10 LOWER BLOCK: ${fmtFrac(lbBot)}"–${fmtFrac(lbTop)}" floor (Sub: ${lSub})`;
        const ft = document.getElementById("s1FooterReadout");
        if (ft) ft.textContent = es ? `BASE CAMPANA: ${aff}" piso · 2 TORNILLOS: ${lbA}" (${lbS}" subpiso)` : `HOOD BOTTOM: ${aff}" off floor · 2 SCREWS: ${lbA}" (${lbS}" subfloor)`;
      }

      const s1RangeEl = document.getElementById("s1HoodRange");
      s1RangeEl.oninput = (e) => updateKs4Step2Live(Number(e.target.value));
      s1RangeEl.onchange = () => renderDrawer();

      const s1DragEl = document.getElementById("s1ScrewDragHandle");
      const s1SvgEl = document.getElementById("s1Svg");
      const s1WrapEl = document.getElementById("s1SvgWrap");
      if (s1DragEl && s1SvgEl) {
        s1DragEl.addEventListener("pointerdown", (e) => {
          if (s1WrapEl && s1WrapEl.classList.contains("drop-target")) return;
          if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
          e.preventDefault();
          e.stopPropagation();
          const pointerId = e.pointerId;
          const startAff = Math.max(66, Math.min(72, state.hoodAff));
          const rect = s1SvgEl.getBoundingClientRect();
          const pxPerSvgY = (rect.height || 310) / 310;
          const startClientY = e.clientY;
          s1DragEl.classList.add("is-dragging");
          try { s1DragEl.setPointerCapture(pointerId); } catch (_) {}
          const blockScroll = (tev) => { if (tev.cancelable) tev.preventDefault(); };
          window.addEventListener("touchmove", blockScroll, { passive: false });

          function onMove(ev) {
            if (ev.pointerId !== pointerId) return;
            const deltaSvgY = (ev.clientY - startClientY) / (pxPerSvgY || 1);
            const deltaIn = -deltaSvgY / 3.5;
            updateKs4Step2Live(startAff + deltaIn);
          }
          function finish(ev) {
            if (ev && ev.pointerId !== pointerId) return;
            s1DragEl.classList.remove("is-dragging");
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", finish);
            document.removeEventListener("pointercancel", finish);
            window.removeEventListener("touchmove", blockScroll);
            try { if (s1DragEl.hasPointerCapture && s1DragEl.hasPointerCapture(pointerId)) s1DragEl.releasePointerCapture(pointerId); } catch (_) {}
            renderDrawer();
          }
          document.addEventListener("pointermove", onMove);
          document.addEventListener("pointerup", finish);
          document.addEventListener("pointercancel", finish);
        });
        s1DragEl.addEventListener("keydown", (e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); updateKs4Step2Live(state.hoodAff + 1); }
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); updateKs4Step2Live(state.hoodAff - 1); }
        });
      }

      wireFloorStatusControls();
      wireCalcMaterials();
      document.querySelectorAll("[data-studs]").forEach(b => b.onclick = () => { state.studLayout = b.dataset.studs; renderDrawer(); });
      wireInteractiveSvgMarks("hood-s1", "s1Svg", "s1SvgWrap");

    } else if (active.kind === "interactive-sheet-2") {
      toolEl.innerHTML = `
        <span style="font-weight:600;color:var(--ink)">${es ? "Ducto 6\" y Ubicación Exacta 15A" : "Vent Duct Tie-In & Exact 15A Box Placement"}</span>
        <button class="mini-btn primary" id="exportSheetPdfBtn" type="button">${t("exportPdf")}</button>
      `;
      document.getElementById("exportSheetPdfBtn").onclick = () => {
        showToast(es ? "Exportando Ducto y Cableado 15A en PDF..." : "Exporting Vent Duct & 15A Wiring PDF...");
      };

      const jm = state.jboxMode; // "oem1gang" | "outlet1gang" | "box4x4" | "centerClash"
      const dm = state.ductMode; // "attic" | "side" | "flex"
      const koDir = state.koSide === "south" ? -1 : 1;
      const sideLabel = state.koSide === "south" ? (es ? "Izq. (Sur · 30-3/4\")" : "Left (South · 30-3/4\")") : (es ? "Der. (Norte · 35-1/4\")" : "Right (North · 35-1/4\")");

      // TOP-DOWN TRUE-SCALE CUTAWAY OF 8-5/8" W x 7-1/2" D CASING (12 px/in!)
      // Wall finish plane y = 40; Casing width = 8.625 * 12 = 103.5px (138.2..241.8); Casing depth = 7.5 * 12 = 90px (40..130)
      // 6" Round Vent Pipe centered at x=190, cy=85 (radius 36px -> 9px = 3/4" off back wall, 9px = 3/4" from front of casing)
      const boxCx = +(190 + koDir * (2.25 * 12)).toFixed(1); // ±27px -> 163 or 217
      const box4x4X = koDir > 0 ? 226 : (154 - 48); // beside 6" pipe (190±36) -> visibly sticks 32px (2-11/16") OUTSIDE 138..242 casing!

      let boxSvg = "";
      let boxStatus = { cls: "pass", text: "" };
      if (jm === "oem1gang") {
        boxSvg = `
          <rect x="${(boxCx - 12).toFixed(1)}" y="18" width="24" height="22" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.8"/>
          <rect x="${(boxCx - 16.5).toFixed(1)}" y="38" width="33" height="4" fill="#1B6B46"/>
          <path d="M ${boxCx} 42 L ${boxCx} 51 L ${koDir > 0 ? boxCx - 6 : boxCx + 6} 55" fill="none" stroke="#1B6B46" stroke-width="2.4" stroke-linecap="round"/>
          <text x="${boxCx}" y="31" text-anchor="middle" font-size="6.8" font-weight="700" fill="#1B6B46">2"×3"</text>
          <text x="${koDir > 0 ? 248 : 132}" y="54" text-anchor="${koDir > 0 ? 'start' : 'end'}" font-size="7.6" font-weight="700" fill="#1B6B46">${es ? "✓ 1-GANG DIRECTO" : "✓ 1-GANG HARDWIRE"}</text>
          <text x="${koDir > 0 ? 248 : 132}" y="64" text-anchor="${koDir > 0 ? 'start' : 'end'}" font-size="6.8" font-family="monospace" fill="#131A22">${boxLowAff}"–${boxHighAff}" ${es ? "piso" : "floor"} · ${koFromSouth} S</text>
          <text x="${koDir > 0 ? 248 : 132}" y="73" text-anchor="${koDir > 0 ? 'start' : 'end'}" font-size="6.6" fill="#1B6B46">${es ? '11/16" oculta · libra tubo' : '11/16" inside · clears pipe'}</text>
        `;
        boxStatus = {
          cls: "pass",
          text: es
            ? `OK · Caja 1-gang (2"×3") a ${boxLowAff}"–${boxHighAff}" del piso, ${koFromSouth} del Sur — oculta 11/16" dentro de 8-5/8" y libra el ducto`
            : `PASS · 1-gang box (2"×3", 2-3/4" cover + 90° whip) at ${boxLowAff}"–${boxHighAff}" off floor, ${koFromSouth} from South — hidden 11/16" inside 8-5/8" casing`
        };
      } else if (jm === "outlet1gang") {
        boxSvg = `
          <rect x="${(boxCx - 12).toFixed(1)}" y="18" width="24" height="22" fill="#FDF2E4" stroke="#A15206" stroke-width="1.8"/>
          <rect x="${(boxCx - 16.5).toFixed(1)}" y="38" width="33" height="4" fill="#A15206"/>
          <rect x="${(boxCx - 6).toFixed(1)}" y="42" width="12" height="12" rx="2" fill="#F5B461" stroke="#A15206" stroke-width="1.2"/>
          <text x="${boxCx}" y="31" text-anchor="middle" font-size="6.5" font-weight="700" fill="#A15206">REC</text>
          <text x="${koDir > 0 ? 248 : 132}" y="54" text-anchor="${koDir > 0 ? 'start' : 'end'}" font-size="7.5" font-weight="700" fill="#A15206">${es ? "⚠ CONTACTO EMPOTRADO" : "⚠ RECESSED OUTLET"}</text>
          <text x="${koDir > 0 ? 248 : 132}" y="64" text-anchor="${koDir > 0 ? 'start' : 'end'}" font-size="6.7" fill="#78350F">${es ? "Solo tipo reloj + clavija plana" : "Needs clock-recess + flat plug"}</text>
          <text x="${koDir > 0 ? 248 : 132}" y="73" text-anchor="${koDir > 0 ? 'start' : 'end'}" font-size="6.6" fill="#485563">${es ? "Viene directa de fábrica (p. 3)" : "Savona ships hardwired (p. 3)"}</text>
        `;
        boxStatus = {
          cls: "fail",
          text: es
            ? "AVISO · La Zephyr Savona viene para conexión directa (sin clavija); solo cabe un contacto empotrado tipo reloj con clavija plana"
            : "NOTE · Zephyr Savona ships hardwired (Manual p. 3, no cord). Only use a recessed clock outlet + flat right-angle plug if adding a cord kit."
        };
      } else if (jm === "box4x4") {
        boxSvg = `
          <rect x="${box4x4X}" y="18" width="48" height="22" fill="#FEECEB" stroke="#B42318" stroke-width="2"/>
          <rect x="${box4x4X}" y="38" width="48" height="6" fill="#B42318"/>
          <text x="${box4x4X + 24}" y="32" text-anchor="middle" font-size="7.2" font-weight="700" fill="#B42318">${es ? 'CAJA 4"×4"' : '4"×4" BOX'}</text>
          <text x="${koDir > 0 ? 279 : 101}" y="54" text-anchor="${koDir > 0 ? 'start' : 'end'}" font-size="7.6" font-weight="700" fill="#B42318">${es ? '✗ SALE 2-11/16"!' : '✗ STICKS OUT 2-11/16"!'}</text>
          <text x="${koDir > 0 ? 279 : 101}" y="64" text-anchor="${koDir > 0 ? 'start' : 'end'}" font-size="6.8" fill="#B42318">${es ? '6" + 4" = 10" > 8-5/8"' : '6" + 4" = 10" > 8-5/8" casing'}</text>
          <text x="${koDir > 0 ? 279 : 101}" y="74" text-anchor="${koDir > 0 ? 'start' : 'end'}" font-size="6.7" fill="#78350F">${es ? "¡Queda visible en azulejo!" : "Exposed on tile wall!"}</text>
        `;
        boxStatus = {
          cls: "fail",
          text: es
            ? "FALLA · Caja 4\"×4\" al lado del ducto de 6\" suma 10\" (> 8-5/8\") y sobresale 2-11/16\" sobre el azulejo visible"
            : "FAIL · A 4\"×4\" box beside the 6\" pipe needs 10\" width (> 8-5/8\" casing) — sticks 2-11/16\" out onto the visible wall tile!"
        };
      } else {
        boxSvg = `
          <rect x="178" y="18" width="24" height="22" fill="#FEECEB" stroke="#B42318" stroke-width="2"/>
          <rect x="174" y="38" width="32" height="14" fill="rgba(180,35,24,0.45)" stroke="#B42318" stroke-width="1.6"/>
          <text x="190" y="31" text-anchor="middle" font-size="6.8" font-weight="700" fill="#B42318">${es ? "CHOQUE" : "CLASH"}</text>
          <text x="248" y="54" font-size="7.6" font-weight="700" fill="#B42318">${es ? '✗ CHOCA CON TUBO 6"!' : '✗ HITS 6" PIPE!'}</text>
          <text x="248" y="64" font-size="6.8" fill="#B42318">${es ? 'Solo 3/4" atrás del tubo' : 'Only 3/4" behind pipe'}</text>
          <text x="248" y="74" font-size="6.7" fill="#78350F">${es ? "Tapa bloqueada por ducto" : "Cover blocked by duct"}</text>
        `;
        boxStatus = {
          cls: "fail",
          text: es
            ? "CHOQUE · Centrar la caja detrás del tubo de 6\" deja menos de 1\" de hueco y bloquea el acceso a la tapa"
            : "CLASH · Centering a box on center behind the 6\" pipe leaves < 1\" wall gap and blocks cover access."
        };
      }

      const overallFail = boxStatus.cls === "fail" || dm === "flex";
      const finalStatusTxt = dm === "flex"
        ? (es ? "FALLA DE CÓDIGO · No se permite ducto flexible en campana de cocina (solo metal rígido 6\")" : "CODE FAIL · Flexible duct prohibited on kitchen range hood (6\" smooth rigid metal only)")
        : boxStatus.text;

      bodyEl.innerHTML = `
        <div class="sheet-card">
          <div class="sheet-head">
            <div>
              <div class="sheet-title">${es ? "Paso 3 — Ducto de Cocina 6\" y Caja Eléctrica 15A" : "Step 3 — Vent Duct Tie-In & Exact 15A Box Placement"}</div>
              <div class="sheet-sub">${es ? "Corte real de cubierta 8-5/8\"×7-1/2\" (arriba) + empalme al ducto existente (abajo)" : "True-scale 8-5/8\"×7-1/2\" casing cutaway (top) + dedicated kitchen duct tie-in (bottom)"}</div>
            </div>
            <span class="compass">8-5/8" × 7-1/2"</span>
          </div>

          ${installStepNavHtml("hood-s2")}
          ${topDragBarHtml()}

          <div class="ks4-svg-wrap" id="s2SvgWrap">
            <svg class="ks4-svg" id="s2Svg" viewBox="0 0 380 310" xmlns="http://www.w3.org/2000/svg">
              <text x="16" y="13" font-size="7.5" font-weight="700" font-family="monospace" fill="#184E77">${es ? 'VISTA SUPERIOR CUBIERTA CHIMENEA (ESCALA REAL: 8-5/8" × 7-1/2")' : 'TOP-DOWN VIEW INSIDE CHIMNEY CASING (TRUE SCALE: 8-5/8" W × 7-1/2" D)'}</text>
              <rect x="20" y="18" width="340" height="22" fill="#F4F6F9" stroke="#C2CCD6" stroke-width="1"/>
              <line x1="20" y1="40" x2="360" y2="40" stroke="#131A22" stroke-width="2.2"/>
              <text x="26" y="32" font-size="6.8" fill="#485563">${es ? 'POSTES + HARDIEBACKER 1/2" + AZULEJO (~1")' : 'STUDS + 1/2" HARDIEBACKER + TILE (~1")'}</text>
              <text x="354" y="32" text-anchor="end" font-size="6.8" fill="#485563">${es ? "(← Sur | Norte →)" : "(← South | North →)"}</text>

              <rect x="138.2" y="40" width="103.6" height="90" fill="rgba(220,226,233,0.38)" stroke="#131A22" stroke-width="1.8"/>
              <line x1="190" y1="18" x2="190" y2="144" stroke="#184E77" stroke-width="0.9" stroke-dasharray="4 3"/>
              <text x="190" y="143" text-anchor="middle" font-size="7.3" font-weight="700" font-family="monospace" fill="#131A22">${es ? '← CUBIERTA INOX 8-5/8" (7-1/2" FONDO) →' : '← 8-5/8" STAINLESS CASING (7-1/2" DEEP) →'}</text>

              <circle cx="190" cy="85" r="36" fill="${dm === 'flex' ? '#FEECEB' : '#E6F0F8'}" stroke="${dm === 'flex' ? '#B42318' : '#184E77'}" stroke-width="2" stroke-dasharray="${dm === 'flex' ? '5 3' : 'none'}"/>
              <text x="190" y="83" text-anchor="middle" font-size="8.2" font-weight="700" fill="${dm === 'flex' ? '#B42318' : '#184E77'}">${es ? 'DUCTO 6"' : '6" VENT'}</text>
              <text x="190" y="93" text-anchor="middle" font-size="6.8" fill="#485563">${es ? "AL CENTRO" : "DEAD CENTER"}</text>
              <text x="190" y="102" text-anchor="middle" font-size="6.5" font-family="monospace" fill="#485563">${es ? '(Centro = 33")' : '(Center = 33")'}</text>

              <text x="133" y="90" text-anchor="end" font-size="6.8" fill="#485563">${es ? '1-5/16" libre' : '1-5/16" flat'}</text>
              <text x="133" y="99" text-anchor="end" font-size="6.6" fill="#485563">${es ? "por lado" : "side gap"}</text>

              ${boxSvg}

              <line x1="16" y1="156" x2="364" y2="156" stroke="#C2CCD6" stroke-width="1" stroke-dasharray="4 3"/>

              <text x="16" y="170" font-size="7.4" font-weight="700" font-family="monospace" fill="#184E77">${es ? "EMPALME AL DUCTO DEDICADO DE COCINA (SOLO CAMPANA · NO NEXT HVAC)" : "EXISTING DEDICATED KITCHEN DUCT TIE-IN (FORMER HOOD ONLY · NOT NEXT HVAC)"}</text>

              <rect x="20" y="176" width="340" height="44" fill="#F8FAFC" stroke="#DCE2E9" stroke-width="1"/>
              <text x="354" y="187" text-anchor="end" font-size="6.8" font-weight="700" fill="#485563">${es ? "ESPACIO ÁTICO" : "ATTIC SPACE"}</text>
              <line x1="20" y1="220" x2="360" y2="220" stroke="#131A22" stroke-width="2"/>
              <text x="354" y="233" text-anchor="end" font-size="7.2" font-weight="700" fill="#485563">${es ? 'TECHO COCINA (121-1/2")' : 'KITCHEN CEILING (121-1/2")'}</text>

              <rect x="74" y="176" width="22" height="102" fill="#EFECE6" stroke="#6E7D8C" stroke-width="1.5"/>
              <text x="68" y="248" text-anchor="end" font-size="7" font-weight="700" fill="#485563">${es ? "Ducto viejo" : "Old kitchen"}</text>
              <text x="68" y="257" text-anchor="end" font-size="6.7" fill="#485563">${es ? "de campana" : "hood duct"}</text>
              <text x="68" y="266" text-anchor="end" font-size="6.5" fill="#1B6B46">${es ? '(medir ≥ 6")' : '(verify ≥ 6")'}</text>

              <polygon points="154,284 226,284 236,298 144,298" fill="#DCE2E9" stroke="#131A22" stroke-width="1.4"/>
              <text x="190" y="294" text-anchor="middle" font-size="7" font-weight="700" fill="#131A22">${es ? 'CAMPANA ZEPHYR 30"' : 'ZEPHYR 30" HOOD'}</text>

              ${dm === "attic" ? `
                <path d="M 190 284 L 190 208 L 116 190 L 96 190" fill="none" stroke="#1B6B46" stroke-width="14" stroke-linejoin="round"/>
                <path d="M 190 284 L 190 208 L 116 190 L 96 190" fill="none" stroke="#E5F4EC" stroke-width="10" stroke-linejoin="round"/>
                <rect x="72" y="274" width="26" height="6" fill="#1B6B46"/>
                <text x="204" y="205" text-anchor="start" font-size="6.8" font-weight="700" fill="#1B6B46">${es ? "45° + 45° EN ÁTICO (~18 pies equiv.)" : "45° + 45° IN ATTIC (~18 ft equiv.)"}</text>
                <text x="108" y="280" font-size="6.7" font-weight="700" fill="#1B6B46">${es ? "Tapar tramo viejo" : "Cap dead stub"}</text>
                <text x="242" y="258" font-size="7.3" font-weight="700" fill="#1B6B46">${es ? "✓ RUTA MÁS LIMPIA" : "✓ CLEANEST ROUTE"}</text>
                <text x="242" y="268" font-size="6.8" fill="#485563">${es ? 'Sube recto 6" en cubierta' : 'Straight 6" up inside casing'}</text>
                <text x="242" y="278" font-size="6.8" fill="#485563">${es ? "Sin cajillo horizontal" : "Zero horizontal box in kitchen"}</text>
              ` : (dm === "side" ? `
                <path d="M 190 284 L 190 240 L 96 240" fill="none" stroke="#184E77" stroke-width="14" stroke-linejoin="round"/>
                <path d="M 190 284 L 190 240 L 96 240" fill="none" stroke="#E6F0F8" stroke-width="10" stroke-linejoin="round"/>
                <rect x="94" y="230" width="8" height="20" fill="#184E77"/>
                <rect x="72" y="256" width="26" height="6" fill="#A15206"/>
                <text x="146" y="232" text-anchor="middle" font-size="7.1" font-weight="700" fill="#184E77">${es ? 'Collarín lateral 6"' : '6" spin-in collar'}</text>
                <text x="108" y="266" font-size="6.7" font-weight="700" fill="#A15206">${es ? "Tapar fondo muerto" : "Cap dead bottom"}</text>
                <text x="242" y="254" font-size="7.2" font-weight="700" fill="#184E77">${es ? "TOMA LATERAL (-30 pies)" : "SIDE TAKEOFF (-30 ft)"}</text>
                <text x="242" y="264" font-size="6.7" fill="#485563">${es ? "2 codos 90° + cinta UL-181" : "2×90° turns + UL-181 foil tape"}</text>
                <text x="242" y="274" font-size="6.7" fill="#485563">${es ? "Ocupa cajillo para ocultar" : "Needs soffit to hide jog"}</text>
              ` : `
                <path d="M 190 284 Q 174 264 190 248 Q 204 234 150 232 Q 115 232 96 232" fill="none" stroke="#B42318" stroke-width="12" stroke-dasharray="5 3"/>
                <text x="242" y="258" font-size="7.6" font-weight="700" fill="#B42318">${es ? "✗ DUCTO FLEXIBLE FALLA" : "✗ FLEX DUCT FAIL"}</text>
                <text x="242" y="268" font-size="6.8" fill="#B42318">${es ? "Riesgo incendio · -50% flujo" : "Grease fire hazard · -50% flow"}</text>
                <text x="242" y="278" font-size="6.8" fill="#B42318">${es ? "Prohibido por código" : "Banned by code & Zephyr"}</text>
              `)}

              ${svgMarksHtml("hood-s2")}
            </svg>
            ${activePinSteerHtml("hood-s2")}
          </div>

          <div class="ks4-controls">
            <div class="slider-row" style="flex-wrap:wrap">
              <span>${es ? "Caja 15A / contacto:" : "15A Box / Outlet:"}</span>
              <div style="display:flex;gap:4px;flex-wrap:wrap">
                <button class="intent-btn ${jm === 'oem1gang' ? 'active' : ''}" data-jbox="oem1gang" type="button">${es ? "1-Gang Directo (Ideal)" : "1-Gang Hardwire (OEM)"}</button>
                <button class="intent-btn ${jm === 'outlet1gang' ? 'active' : ''}" data-jbox="outlet1gang" type="button">${es ? "Contacto Empotrado" : "Recessed Outlet"}</button>
                <button class="intent-btn ${jm === 'box4x4' ? 'active' : ''}" data-jbox="box4x4" type="button">${es ? '4"×4" Al Lado' : '4"×4" Beside Duct'}</button>
                <button class="intent-btn ${jm === 'centerClash' ? 'active' : ''}" data-jbox="centerClash" type="button">${es ? "Centrada Atrás" : "Centered Behind Duct"}</button>
              </div>
            </div>
            <div class="slider-row">
              <span>${es ? "Lado del orificio eléctrico (ver caja):" : "Hood knockout side (check carton):"}</span>
              <div style="display:flex;gap:5px">
                <button class="intent-btn ${state.koSide === 'south' ? 'active' : ''}" data-koside="south" type="button">${es ? 'Izq. / Sur (30-3/4")' : 'Left / South (30-3/4")'}</button>
                <button class="intent-btn ${state.koSide === 'north' ? 'active' : ''}" data-koside="north" type="button">${es ? 'Der. / Norte (35-1/4")' : 'Right / North (35-1/4")'}</button>
              </div>
            </div>
            <div class="slider-row" style="flex-wrap:wrap">
              <span>${es ? "Empalme al ducto existente:" : "Dedicated kitchen duct route:"}</span>
              <div style="display:flex;gap:4px;flex-wrap:wrap">
                <button class="intent-btn ${dm === 'attic' ? 'active' : ''}" data-duct="attic" type="button">${es ? "Unión Ático (Mejor)" : "Attic Tie-In (Best)"}</button>
                <button class="intent-btn ${dm === 'side' ? 'active' : ''}" data-duct="side" type="button">${es ? 'Toma Lateral 6"' : 'Side 6" Spin-In'}</button>
                <button class="intent-btn ${dm === 'flex' ? 'active' : ''}" data-duct="flex" type="button">${es ? "Flexible (Falla)" : "Flex Duct (Fail)"}</button>
              </div>
            </div>
            <div class="status-strip ${overallFail ? "fail" : "pass"}">
              <span>${finalStatusTxt}</span>
            </div>
          </div>

          ${markEditorAndListHtml("hood-s2")}

          <div class="key-facts">
            <div class="key-facts-title">${es ? "Lo importante sobre la chimenea, luz y ducto (en palabras simples)" : "Important Wiring & Vent Facts (Plain English)"}</div>
            <ul>
              <li><strong>${es ? "Qué tan grande es la cubierta metálica:" : "How much space is inside the stainless chimney cover:"}</strong> ${es ? "La cubierta vertical mide 8-5/8\" de ancho × 7-1/2\" de fondo. El tubo de 6\" sube justo al centro, dejando solo 1-5/16\" plano a cada lado — por eso una caja cuadrada de 4\"×4\" NO cabe al lado del tubo (sobresaldría 2-11/16\" sobre el azulejo visible)." : "The stainless chimney casing above the hood is 8-5/8\" wide by 7-1/2\" deep. Because the 6\" round metal pipe rises straight up the middle, there is only 1-5/16\" of flat space on either side — which is why a chunky 4\"×4\" electrical box will NOT fit beside the pipe (it would stick 2-11/16\" out onto the visible wall tile!)."}</li>
              <li><strong>${es ? "Dónde va realmente la conexión de 15A:" : "Where the 15A power box actually goes:"}</strong> ${es ? `Esta campana se conecta directo a su propia caja interna arriba de la campana (no lleva enchufe común). Coloca una caja angosta 1-gang (2"×3") justo arriba de la campana (${boxLowAff}"–${boxHighAff}" del piso, NO hasta 100"), corrida 2-1/4" del centro hacia el lado del orificio eléctrico de la campana (${sideLabel} — revisar la caja abajo primero). Así cabe en la esquina curva detrás del tubo redondo y queda 100% oculta.` : `The Zephyr hood wires directly into its own built-in wiring compartment on top of the hood canopy (it does not plug in like a lamp). Put a slim recessed 1-gang box (2\"×3\") right above the hood canopy (${boxLowAff}\"–${boxHighAff}\" off the floor, NOT way up at 100\"), shifted 2-1/4\" off center toward whichever side the hood's top wiring hole sits on (${sideLabel} — verify on the hood downstairs first). That tucks it into the curved corner behind the round pipe while keeping the cover plate completely hidden inside the chimney casing.`}</li>
              <li><strong>${es ? "Cómo conectarse al ducto de cocina existente:" : "Tying into the existing kitchen hood pipe:"}</strong> ${es ? "Ese ducto ya era de la campana anterior y nada más lo usa (no es parte de NEXT HVAC / calefacción). Primero mide que tenga al menos 6\" de diámetro (si es de 4\", cámbialo por tubo metálico rígido de 6\" hasta la salida del techo). Subir recto al ático con dos codos suaves de 45° deja el techo limpio y mueve más aire que una toma lateral." : "That existing pipe only ever vented the old kitchen hood (nothing else uses it, and it's not furnace / NEXT HVAC work). First confirm it is at least 6\" wide — if it's smaller like 4\", replace that pipe up to the existing roof cap with 6\" smooth metal duct. Running straight up into the attic and tying in with two gentle 45° elbows keeps the kitchen ceiling clean and moves more air than cutting in from the side."}</li>
              <li><strong>${es ? "Profundidad para HardieBacker + azulejo:" : "Allow for HardieBacker + tile depth (~1\"): "}</strong> ${es ? "Porque este muro lleva HardieBacker de 1/2\" más ~3/8\"–1/2\" de pegamento y azulejo, monta la caja 1-gang ~1\" salida al frente de los postes (o con anillo de 1\") para que termine al ras del azulejo." : "Because this wall gets 1/2\" HardieBacker cement board plus ~3/8\"–1/2\" of thinset and tile, mount the 1-gang electrical box ~1\" proud of the bare studs (or use a 1\" tile extender ring) so it finishes flush with the tile face."}</li>
            </ul>
            ${manualLinksBarHtml()}
          </div>

          ${calcMaterialsBlockHtml("hood-s2", es, {})}
          ${renderSheetPager("hood-s2")}
        </div>
      `;

      document.querySelectorAll("[data-jbox]").forEach(b => b.onclick = () => { state.jboxMode = b.dataset.jbox; renderDrawer(); });
      document.querySelectorAll("[data-koside]").forEach(b => b.onclick = () => { state.koSide = b.dataset.koside; renderDrawer(); });
      document.querySelectorAll("[data-duct]").forEach(b => b.onclick = () => { state.ductMode = b.dataset.duct; renderDrawer(); });
      wireCalcMaterials();
      wireInteractiveSvgMarks("hood-s2", "s2Svg", "s2SvgWrap");

    } else if (active.kind === "interactive-sheet-4") {
      toolEl.innerHTML = `
        <span style="font-weight:600;color:var(--ink)">${es ? "Gas y Contacto de la Estufa Viking" : "Viking Stove — Gas & Outlet Check"}</span>
        <button class="mini-btn primary" id="exportSheetPdfBtn" type="button">${t("exportPdf")}</button>
      `;
      document.getElementById("exportSheetPdfBtn").onclick = () => {
        showToast(es ? "Exportando Paso 4 (Gas y Contacto) en PDF..." : "Exporting Step 4 (Gas & Outlet) PDF...");
      };

      const isRecessed = state.gasProtrusion === "recessed";
      const bandLowSub = fmtFrac(0.5625 + effT);
      const bandHighSub = fmtFrac(4.9375 + effT);

      bodyEl.innerHTML = `
        <div class="sheet-card">
          <div class="sheet-head">
            <div>
              <div class="sheet-title">${es ? "Paso 4 — Posición del Gas y Contacto de la Estufa" : "Step 4 — Stove Gas Pipe & Outlet Check"}</div>
              <div class="sheet-sub">${es ? "Solo 2 cosas que verificar atrás de la Viking de 30\": altura máx. 4-15/16\" y que el gas no salga más de 2\"" : "Just 2 things to check behind the 30\" Viking: 4-15/16\" max height & gas pokes out 2\" max"}</div>
            </div>
            <span class="compass">MAX 4-15/16"</span>
          </div>

          ${installStepNavHtml("range-gas")}
          ${topDragBarHtml()}

          <div class="ks4-svg-wrap" id="s4SvgWrap">
            <svg class="ks4-svg" id="s4Svg" viewBox="0 0 380 288" xmlns="http://www.w3.org/2000/svg">
              <text x="190" y="16" text-anchor="middle" font-size="8.2" font-weight="700" fill="#184E77">${es ? 'MURO TRASERO DETRÁS DE LA ESTUFA DE 30"' : 'BACK WALL BEHIND THE 30" STOVE'}</text>

              <rect x="65" y="26" width="250" height="122" rx="4" fill="#FAFBFD" stroke="#8C9BAB" stroke-width="1.4" stroke-dasharray="5 3"/>
              <line x1="20" y1="148" x2="360" y2="148" stroke="#131A22" stroke-width="2.2"/>
              <text x="65" y="161" text-anchor="middle" font-size="7.5" fill="#485563">${es ? 'Borde izq. (18")' : 'Left edge (18")'}</text>
              <text x="190" y="161" text-anchor="middle" font-size="7.5" font-weight="700" fill="#184E77">${es ? 'Centro (33")' : 'Center (33")'}</text>
              <text x="315" y="161" text-anchor="middle" font-size="7.5" fill="#485563">${es ? 'Borde der. (48")' : 'Right edge (48")'}</text>

              <!-- Bold RED MAX HEIGHT CEILING LINE FOR GAS & OUTLET! -->
              <line x1="48" y1="92" x2="332" y2="92" stroke="#B42318" stroke-width="1.8" stroke-dasharray="5 3"/>
              <rect x="64" y="42" width="252" height="44" rx="4" fill="#FEECEB" stroke="#B42318" stroke-width="1"/>
              <text x="190" y="55" text-anchor="middle" font-size="7.0" font-weight="800" fill="#B42318">${es ? '▲ ALTURA MÁX. GAS Y CONTACTO: 4-15/16" DEL PISO ▲' : '▲ MAX HEIGHT FOR GAS & OUTLET: 4-15/16" OFF FLOOR ▲'}</text>
              <text x="190" y="67" text-anchor="middle" font-size="7.1" font-weight="700" fill="#78350F">${state.floorInstalled ? (es ? 'NO SUBIR ARRIBA DE 4-15/16" (piso terminado)' : 'DO NOT GO ABOVE 4-15/16" (finished floor)') : (es ? `MAX ${bandHighSub}" DESDE SUBPISO CRUDO (mín. ${bandLowSub}")` : `MAX ${bandHighSub}" OFF BARE SUBFLOOR (min ${bandLowSub}")`)}</text>
              <text x="190" y="79" text-anchor="middle" font-size="6.5" fill="#485563">${es ? "Más arriba choca con el horno — la estufa no pegaría atrás" : "Anything higher hits the oven body — stove won't sit flush"}</text>

              <rect x="78" y="94" width="224" height="46" rx="5" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.6"/>
              <line x1="322" y1="92" x2="322" y2="148" stroke="#B42318" stroke-width="1.2"/>
              <line x1="318" y1="92" x2="326" y2="92" stroke="#B42318" stroke-width="1.4"/>
              <line x1="318" y1="148" x2="326" y2="148" stroke="#B42318" stroke-width="1.4"/>
              <text x="331" y="117" font-size="6.8" font-weight="800" fill="#B42318">MAX</text>
              <text x="331" y="126" font-size="6.8" font-weight="800" fill="#B42318">4-15/16"</text>
              <text x="331" y="135" font-size="6.0" fill="#485563">${state.floorInstalled ? (es ? "piso" : "floor") : `${bandHighSub}" sub`}</text>

              <rect x="114" y="100" width="70" height="30" rx="4" fill="#FFFFFF" stroke="#B42318" stroke-width="1.8"/>
              <circle cx="130" cy="115" r="7" fill="#FEECEB" stroke="#B42318" stroke-width="1.5"/>
              <line x1="124" y1="115" x2="136" y2="115" stroke="#B42318" stroke-width="1.8"/>
              <text x="160" y="113" text-anchor="middle" font-size="7.4" font-weight="700" fill="#B42318">GAS</text>
              <text x="160" y="123" text-anchor="middle" font-size="6.6" fill="#78350F">${es ? 'llave 1/2"' : '1/2" valve'}</text>

              <rect x="198" y="100" width="88" height="30" rx="4" fill="#FFFFFF" stroke="#184E77" stroke-width="1.8"/>
              <circle cx="213" cy="115" r="6" fill="#E6F0F8" stroke="#184E77" stroke-width="1.5"/>
              <text x="252" y="113" text-anchor="middle" font-size="7.3" font-weight="700" fill="#184E77">120V · 15A</text>
              <text x="252" y="123" text-anchor="middle" font-size="6.5" fill="#485563">${es ? "cable 14/2 · 3 patas" : "14/2 wire · 3-prong"}</text>

              <line x1="20" y1="176" x2="360" y2="176" stroke="#DCE2E9" stroke-width="1"/>
              <text x="190" y="193" text-anchor="middle" font-size="8" font-weight="700" fill="#184E77">${es ? "REVISIÓN LATERAL: CUÁNTO PUEDE SALIR EL GAS" : "SIDE CHECK: HOW FAR THE GAS PIPE CAN POKE OUT"}</text>

              <rect x="44" y="204" width="24" height="68" fill="#EFE6D8" stroke="#B69F82" stroke-width="1.2"/>
              <line x1="68" y1="204" x2="68" y2="272" stroke="#131A22" stroke-width="2.2"/>
              <line x1="26" y1="272" x2="354" y2="272" stroke="#131A22" stroke-width="2.2"/>
              <text x="56" y="238" text-anchor="middle" font-size="6.2" font-weight="700" fill="#485563" transform="rotate(-90 56 238)">${es ? "MURO" : "WALL"}</text>

              <path d="M 86 206 L 196 206 L 196 272 L 114 272 L 114 236 L 86 236 Z" fill="#EEF1F5" stroke="#131A22" stroke-width="1.6"/>
              <text x="155" y="242" text-anchor="middle" font-size="8" font-weight="700" fill="#131A22">${es ? "ESPALDA" : "BACK OF"}</text>
              <text x="155" y="253" text-anchor="middle" font-size="8" font-weight="700" fill="#131A22">${es ? "ESTUFA VIKING" : "VIKING STOVE"}</text>

              ${isRecessed ? `
                <rect x="52" y="242" width="16" height="22" rx="2" fill="#E5F4EC" stroke="#1B6B46" stroke-width="1.6"/>
                <rect x="68" y="248" width="16" height="9" rx="2" fill="#1B6B46"/>
                <text x="214" y="232" font-size="8.2" font-weight="700" fill="#1B6B46">${es ? '✓ EMPOTRADO O MÁX. 2"' : '✓ RECESSED OR ≤ 2" MAX'}</text>
                <text x="214" y="245" font-size="7.5" fill="#131A22">${es ? "Cabe limpio en el hueco" : "Fits cleanly in the stove's"}</text>
                <text x="214" y="256" font-size="7.5" fill="#131A22">${es ? "bajo atrás — la estufa" : "lower back pocket — stove"}</text>
                <text x="214" y="267" font-size="7.5" fill="#1B6B46">${es ? "entra al ras del muro!" : "slides all the way back flush!"}</text>
              ` : `
                <rect x="68" y="247" width="54" height="11" rx="2" fill="#FEECEB" stroke="#B42318" stroke-width="1.8"/>
                <text x="214" y="232" font-size="8.2" font-weight="700" fill="#B42318">${es ? '✗ SALE MÁS DE 2"' : '✗ POKES OUT MORE THAN 2"'}</text>
                <text x="214" y="245" font-size="7.5" fill="#B42318">${es ? "¡Choca con la estufa!" : "Hits the back of the stove!"}</text>
                <text x="214" y="256" font-size="7.5" fill="#78350F">${es ? "La estufa queda salida" : "The stove will stick out into"}</text>
                <text x="214" y="267" font-size="7.5" fill="#78350F">${es ? "o aplasta la manguera." : "the room or pinch the gas hose."}</text>
              `}

              ${svgMarksHtml("range-gas")}
            </svg>
            ${activePinSteerHtml("range-gas")}
          </div>

          <div class="ks4-controls">
            <div class="slider-row">
              <span>${es ? "Cuánto sale el gas de la pared:" : "How far the gas sticks out:"}</span>
              <div style="display:flex;gap:5px;flex-wrap:wrap">
                <button class="intent-btn ${isRecessed ? 'active' : ''}" data-gasdepth="recessed" type="button">${es ? 'Empotrado / máx. 2" (Bien)' : 'Tucked in / 2" max (Fits flush)'}</button>
                <button class="intent-btn ${!isRecessed ? 'active' : ''}" data-gasdepth="stickout" type="button">${es ? 'Sale > 2" (Choca)' : 'Sticks out > 2" (Hits stove)'}</button>
              </div>
            </div>
            ${floorStatusControlHtml(es)}
            <div class="status-strip ${isRecessed ? "pass" : "fail"}">
              <span>${isRecessed
                ? (es ? `OK · Gas y contacto bajos (máx. 4-15/16" piso / ${bandHighSub}" subpiso) y gas sale máx. 2"` : `OK · Gas & outlet stay low (max 4-15/16" off floor / ${bandHighSub}" off subfloor) and gas stays within 2" of the wall`)
                : (es ? "PROBLEMA · Si el gas sale más de 2\", la estufa no puede pegarse a la pared" : "BLOCKED · Gas sticking out more than 2\" stops the Viking stove from pushing back flush")}</span>
            </div>
          </div>

          ${markEditorAndListHtml("range-gas")}

          <div class="key-facts">
            <div class="key-facts-title">${es ? "Lo importante (en palabras simples)" : "Important Things to Check (Plain English)"}</div>
            <ul>
              <li><strong>${es ? "Altura máxima del gas y cuánto puede salir:" : "Max gas height & how far it can poke out:"}</strong> ${es ? `La tubería de gas y su llave de paso deben quedar MUY ABAJO — entre 9/16" y MÁXIMO 4-15/16" arriba del piso terminado (${bandLowSub}"–${bandHighSub}" desde el subpiso) — y metidas en la pared o saliendo MÁXIMO 2". Si pasa de 4-15/16" de alto o de 2" hacia afuera, choca con la estufa.` : `The gas pipe and its shutoff valve MUST stay very low — between 9/16" and MAX 4-15/16" off the finished floor (${bandLowSub}"–${bandHighSub}" off bare subfloor) — and tucked into a recessed wall box or poking out 2" max so the stove slides flush to the wall.`}</li>
              <li><strong>${es ? "Voltaje, cable y ubicación del contacto:" : "Stove voltage, cable & outlet placement:"}</strong> ${es ? "Esta Viking es 100% a gas, así que NO lleva 240V: solo necesita un contacto normal aterrizado de 120V en su propio circuito dedicado de 15A con cable de cobre 14/2 con tierra (usa enchufe estándar de 3 patas con cable de 4 pies). Va junto al gas en la misma franja baja (máx. 4-15/16\" de alto; deja libre el lado izquierdo a ~25-3/4\" de la esquina para el soporte antivuelco)." : "Because this Viking is all-gas, it does NOT need 240V — it only needs a standard grounded 120V 3-prong outlet on its own dedicated 15A circuit run with 14/2 copper wire with ground (its factory 4-ft cord plugs straight in for the igniters, oven light, and fan). Place it right next to the gas line in that same low strip (max 4-15/16\" high), keeping ~25-3/4\" from the left corner clear for the anti-tip bracket."}</li>
              <li><strong>${es ? "Antes de cerrar la pared:" : "Before closing the wall:"}</strong> ${es ? "Sella cualquier hueco detrás de la estufa para que no pasen corrientes de aire a los quemadores y confirma la prueba de presión de gas con la pared abierta." : "Seal any gaps around the pipes or floor behind the stove so drafts don't disturb the burners, and have the plumber pressure-test the gas pipe before the wall closes."}</li>
            </ul>
            ${manualLinksBarHtml()}
          </div>

          ${calcMaterialsBlockHtml("range-gas", es, {})}
          ${renderSheetPager("range-gas")}
        </div>
      `;

      document.querySelectorAll("[data-gasdepth]").forEach(b => b.onclick = () => { state.gasProtrusion = b.dataset.gasdepth; renderDrawer(); });
      wireFloorStatusControls();
      wireCalcMaterials();
      wireInteractiveSvgMarks("range-gas", "s4Svg", "s4SvgWrap");

    } else if (active.kind === "interactive-sheet-5") {
      toolEl.innerHTML = `
        <span style="font-weight:600;color:var(--ink)">${es ? "Plan de HardieBacker y Azulejo" : "HardieBacker & Full-Height Tile Plan"}</span>
        <button class="mini-btn primary" id="exportSheetPdfBtn" type="button">${t("exportPdf")}</button>
      `;
      document.getElementById("exportSheetPdfBtn").onclick = () => {
        showToast(es ? "Exportando Paso 5 (HardieBacker y Azulejo) en PDF..." : "Exporting Step 5 (HardieBacker & Tile Plan) PDF...");
      };

      // Wall above 36" counter to 121.5" ceiling: 66.25" W x 85.5" H = 39.34 sq ft gross (NO tiled return!)
      const wallWin = 66.25;
      const wallHin = 85.5;
      const grossSqft = +(wallWin * wallHin / 144).toFixed(1); // 39.3 sq ft

      // Neutral common tile sizes ONLY (no hardcoded Zellige/Cloe brand labels!)
      const TILE_PRESETS = {
        sub26:  { w: 2,   h: 6,  box: 10.0, waste: 15, pat: "stacked", orient: "vertical",   bnAvail: true,  en: '2"×6" Narrow',  es: 'Angosto 2"×6"' },
        sub258: { w: 2.5, h: 8,  box: 10.8, waste: 15, pat: "brick",   orient: "horizontal", bnAvail: true,  en: '2.5"×8" Slim',  es: 'Delgado 2.5"×8"' },
        sub36:  { w: 3,   h: 6,  box: 10.0, waste: 10, pat: "brick",   orient: "horizontal", bnAvail: true,  en: '3"×6" Subway',  es: 'Subway 3"×6"' },
        sub312: { w: 3,   h: 12, box: 12.0, waste: 15, pat: "third",   orient: "horizontal", bnAvail: true,  en: '3"×12" Long',   es: 'Largo 3"×12"' },
        sq44:   { w: 4,   h: 4,  box: 10.0, waste: 15, pat: "stacked", orient: "horizontal", bnAvail: false, en: '4"×4" Square',  es: 'Cuadrado 4"×4"' },
        sub412: { w: 4,   h: 12, box: 12.0, waste: 15, pat: "third",   orient: "horizontal", bnAvail: true,  en: '4"×12" Large',  es: 'Grande 4"×12"' },
        sq66:   { w: 6,   h: 6,  box: 10.0, waste: 10, pat: "stacked", orient: "horizontal", bnAvail: true,  en: '6"×6" Square',  es: 'Cuadrado 6"×6"' }
      };

      const hasTile = !!(Number(state.tileW) > 0 && Number(state.tileH) > 0);
      const tw = hasTile ? Math.max(1, Math.min(24, Number(state.tileW))) : null;
      const th = hasTile ? Math.max(1, Math.min(24, Number(state.tileH))) : null;
      const shortSide = hasTile ? Math.min(tw, th) : 3;
      const longSide = hasTile ? Math.max(tw, th) : 6;
      const isSquare = hasTile ? (Math.abs(longSide - shortSide) < 0.05) : false;
      const boxSqft = (Number(state.tileBoxSqft) > 0) ? Number(state.tileBoxSqft) : null;
      const priceSqft = (Number(state.tilePriceSqft) > 0) ? Number(state.tilePriceSqft) : null;
      const wasteMul = 1 + (Number(state.tileWastePct) || 15) / 100;
      const orderSqft = +(grossSqft * wasteMul).toFixed(1);
      const tileSqftEach = hasTile ? ((tw * th) / 144) : null;
      const boxesNeeded = (hasTile && boxSqft) ? Math.ceil(orderSqft / boxSqft) : null;
      const billedSqft = boxesNeeded ? +(boxesNeeded * boxSqft).toFixed(1) : orderSqft;
      const tilesNeeded = hasTile ? Math.ceil(billedSqft / tileSqftEach) : null;
      const hardieSheets = Math.ceil(grossSqft / 15); // 3'x5' = 15 sq ft -> 3 sheets
      const tileTotalCost = (hasTile && priceSqft != null) ? Math.round(billedSqft * priceSqft) : null;
      const hardieSuppliesCost = 176; // 3 HardieBacker + thinset/grout/silicone + tape/screws + 2x 1" rings (no 3/16" shims w/ 1/2" drywall!)

      const curPreset = TILE_PRESETS[state.tileProductKey] || null;
      const productLabel = curPreset
        ? (es ? curPreset.es : curPreset.en)
        : (state.tileCustomName || (hasTile ? (es ? `Medida ${tw}"×${th}"` : `Custom ${tw}"×${th}"`) : (es ? "Sin elegir aún" : "None selected yet")));

      // REAL UNIT 4 GEOMETRY — ZERO METAL TRIM & NO TILED RETURN:
      // Right (North, 66-1/4") = perpendicular North wall (inside 90° corner -> ZERO trim, silicone only!)
      // Left (South, 0") = tile stops against a long flat painted return wall (ONLY 1 edge = 85-1/2" = 7.1 ft!)
      const validTrims = ["bullnose", "quarter", "wood", "glazed"];
      if (!validTrims.includes(state.tileTrim)) state.tileTrim = "quarter";
      const edgeBaseIn = 85.5;
      const trimTotalIn = state.tileTrimCeiling ? (edgeBaseIn + 66.25) : edgeBaseIn;
      const trimTotalFt = +(trimTotalIn / 12).toFixed(1);

      let trimQtyLabelEn = "", trimQtyLabelEs = "", trimShortEn = "", trimShortEs = "", trimCost = 0, trimWarnEn = "", trimWarnEs = "";
      let edgeDescEn = "", edgeDescEs = "", cornerDetailSvg = "";

      if (state.tileTrim === "bullnose") {
        const bnLen = Math.max(4, longSide);
        const bnPcs = Math.ceil((trimTotalIn / bnLen) * 1.15);
        const unitBn = bnLen >= 10 ? 8.5 : 6.0;
        trimCost = Math.round(bnPcs * unitBn);
        trimQtyLabelEn = `${bnPcs} matching ceramic bullnose pieces (${bnLen}" long, Left edge = ${trimTotalFt} ft)`;
        trimQtyLabelEs = `${bnPcs} piezas bullnose cerámico (${bnLen}" largo, orilla Izq. = ${trimTotalFt} ft)`;
        trimShortEn = `${bnPcs} bullnose pcs (${bnLen}")`;
        trimShortEs = `${bnPcs} pzs bullnose (${bnLen}")`;
        edgeDescEn = "Factory rounded glazed bullnose finishes the Left edge cleanly right where the tile stops against the long flat painted wall — soft glazed edge, zero metal.";
        edgeDescEs = "El bullnose cerámico redondeado remata limpio el borde izquierdo justo donde termina el azulejo contra el muro plano pintado — borde curvo esmaltado, cero metal.";
        trimWarnEn = "Check if your chosen tile line makes matching bullnose. If NOT available, switch to Ceramic Pencil / Quarter-Round, Painted Edwardian Wood Trim, Factory Glazed-Edge, or a narrow mitered corner strip.";
        trimWarnEs = "Verifica si tu azulejo tiene bullnose en la misma línea. Si NO existe, usa Lápiz / Cuarto Bocel cerámico, Madera Pintada, Canto Esmaltado o una tira angosta con corte a 45°.";
        cornerDetailSvg = `
          <path d="M 16 42 L 106 42 L 106 32 L 198 32 L 198 56 L 16 56 Z" fill="#EFE6D8" stroke="#9C8468" stroke-width="1.2"/>
          <rect x="106" y="25" width="92" height="7" fill="#D5DEE8" stroke="#6E7D8C" stroke-width="0.9"/>
          <rect x="136" y="17" width="62" height="8" fill="#F4E3CA" stroke="#A15206" stroke-width="1.2"/>
          <path d="M 106 25 L 106 21 Q 106 17 112 17 L 136 17 L 136 25 Z" fill="#E8B878" stroke="#A15206" stroke-width="1.6"/>
          <text x="152" y="12" text-anchor="middle" font-size="6.8" font-weight="700" fill="#A15206">${es ? "BULLNOSE CERÁMICO" : "ROUNDED BULLNOSE"}</text>
          <text x="210" y="24" font-size="7.2" font-weight="700" fill="#A15206">${es ? `BULLNOSE (${bnPcs} PZS)` : `CERAMIC BULLNOSE (${bnPcs} PCS)`}</text>
          <text x="210" y="35" font-size="6.5" fill="#485563">${es ? "Borde esmaltado curvo · cero metal" : "Curved glazed edge · zero metal"}</text>
          <text x="210" y="46" font-size="6.5" fill="#485563">${es ? "Termina limpio en el muro pintado" : "Stops cleanly on flat painted wall"}</text>
          <text x="60" y="51" text-anchor="middle" font-size="6.1" fill="#485563">${es ? "MURO PLANO PINTADO" : "LONG PAINTED WALL"}</text>
          <text x="156" y="47" text-anchor="middle" font-size="6.1" fill="#485563">${es ? "MURO ESTUFA" : "RANGE WALL"}</text>
        `;
      } else if (state.tileTrim === "quarter") {
        const qrPcs = Math.ceil((trimTotalIn / 12) * 1.15);
        trimCost = Math.round(qrPcs * 9);
        trimQtyLabelEn = `${qrPcs} ceramic pencil / quarter-round liner pieces (12", Left edge = ${trimTotalFt} ft)`;
        trimQtyLabelEs = `${qrPcs} piezas moldura lápiz / cuarto bocel cerámico (12", orilla Izq. = ${trimTotalFt} ft)`;
        trimShortEn = `${qrPcs} pencil/1/4-rnd pcs (12")`;
        trimShortEs = `${qrPcs} pzs lápiz/bocel (12")`;
        edgeDescEn = "Timeless San Francisco Edwardian finish: a slim glazed ceramic pencil liner or quarter-round frames the Left edge cleanly against the long painted wall — works even when your main tile has no matching bullnose.";
        edgeDescEs = "Acabado clásico estilo Edwardian de San Francisco: una moldura lápiz o cuarto bocel cerámico enmarca limpio el borde izquierdo contra el muro pintado — funciona aunque tu azulejo no tenga bullnose.";
        cornerDetailSvg = `
          <path d="M 16 42 L 106 42 L 106 32 L 198 32 L 198 56 L 16 56 Z" fill="#EFE6D8" stroke="#9C8468" stroke-width="1.2"/>
          <rect x="106" y="25" width="92" height="7" fill="#D5DEE8" stroke="#6E7D8C" stroke-width="0.9"/>
          <rect x="118" y="17" width="80" height="8" fill="#F4E3CA" stroke="#A15206" stroke-width="1.2"/>
          <path d="M 118 17 L 118 25 L 106 25 L 106 23 Q 106 17 112 17 Z" fill="#D8B4FE" stroke="#6D28D9" stroke-width="1.6"/>
          <text x="152" y="12" text-anchor="middle" font-size="6.8" font-weight="700" fill="#6D28D9">${es ? "MOLDURA LÁPIZ / CUARTO BOCEL" : "CERAMIC PENCIL / 1/4-ROUND"}</text>
          <text x="210" y="24" font-size="7.2" font-weight="700" fill="#6D28D9">${es ? `LÁPIZ CERÁMICO (${qrPcs} PZS)` : `CERAMIC LINER (${qrPcs} PCS)`}</text>
          <text x="210" y="35" font-size="6.5" fill="#485563">${es ? "Enmarca el borde sin metal" : "Frames raw edge cleanly · zero metal"}</text>
          <text x="210" y="46" font-size="6.5" fill="#485563">${es ? "Sirve aunque no haya bullnose" : "Works even if tile has no bullnose"}</text>
          <text x="60" y="51" text-anchor="middle" font-size="6.1" fill="#485563">${es ? "MURO PLANO PINTADO" : "LONG PAINTED WALL"}</text>
          <text x="156" y="47" text-anchor="middle" font-size="6.1" fill="#485563">${es ? "MURO ESTUFA" : "RANGE WALL"}</text>
        `;
      } else if (state.tileTrim === "wood") {
        const woodStrips = state.tileTrimCeiling ? 2 : 1;
        trimCost = woodStrips * 22;
        trimQtyLabelEn = `${woodStrips} × 8' painted Edwardian wood trim strip (painted wall color)`;
        trimQtyLabelEs = `${woodStrips} tira(s) de 8' moldura de madera pintada al color del muro`;
        trimShortEn = `${woodStrips} × 8' wood trim`;
        trimShortEs = `${woodStrips} tira(s) madera`;
        edgeDescEn = "Slim painted wood vertical trim or narrow flat casing frames the Left tile edge in the exact wall color — blends into Unit 4's original Edwardian woodwork, zero metal, works with ANY tile.";
        edgeDescEs = "Moldura vertical delgada de madera pintada igual que el muro — se integra con la carpintería Edwardian original de Unit 4, cero metal, funciona con cualquier azulejo.";
        cornerDetailSvg = `
          <path d="M 16 42 L 106 42 L 106 32 L 198 32 L 198 56 L 16 56 Z" fill="#EFE6D8" stroke="#9C8468" stroke-width="1.2"/>
          <rect x="106" y="25" width="92" height="7" fill="#D5DEE8" stroke="#6E7D8C" stroke-width="0.9"/>
          <rect x="118" y="17" width="80" height="8" fill="#F4E3CA" stroke="#A15206" stroke-width="1.2"/>
          <rect x="98" y="15" width="20" height="17" rx="1.5" fill="#E6EEE8" stroke="#2D4A3E" stroke-width="1.6"/>
          <text x="152" y="12" text-anchor="middle" font-size="6.8" font-weight="700" fill="#2D4A3E">${es ? "MOLDURA DE MADERA PINTADA" : "PAINTED WOOD TRIM STRIP"}</text>
          <text x="210" y="24" font-size="7.2" font-weight="700" fill="#2D4A3E">${es ? `MADERA (${woodStrips} TIRA 8')` : `WOOD TRIM (${woodStrips} × 8' STRIP)`}</text>
          <text x="210" y="35" font-size="6.5" fill="#485563">${es ? "Pintada al color del muro · sin metal" : "Painted wall color · zero metal"}</text>
          <text x="210" y="46" font-size="6.5" fill="#485563">${es ? "Estilo Edwardian original de Unit 4" : "Matches Unit 4 Edwardian woodwork"}</text>
          <text x="60" y="51" text-anchor="middle" font-size="6.1" fill="#485563">${es ? "MURO PLANO PINTADO" : "LONG PAINTED WALL"}</text>
          <text x="156" y="47" text-anchor="middle" font-size="6.1" fill="#485563">${es ? "MURO ESTUFA" : "RANGE WALL"}</text>
        `;
      } else {
        const glLen = Math.max(2, state.tileOrient === "vertical" ? longSide : shortSide);
        const glPcs = Math.ceil((edgeBaseIn / glLen) * 1.15);
        trimCost = Math.round(glPcs * 3);
        trimQtyLabelEn = `${glPcs} factory glazed-edge tiles for Left column (0 trim pieces to buy)`;
        trimQtyLabelEs = `${glPcs} azulejos con canto esmaltado de fábrica para columna Izq. (0 molduras)`;
        trimShortEn = `${glPcs} glazed-edge pcs`;
        trimShortEs = `${glPcs} pzs canto esmalt.`;
        edgeDescEn = "Order factory-glazed edge pieces for just the single Left column — stops cleanly flush against the painted flat wall with zero extra trim pieces (check if offered for your tile).";
        edgeDescEs = "Pide piezas con canto esmaltado de fábrica solo para la columna izquierda — termina limpio contra el muro plano pintado sin molduras extra (confirma si tu marca lo ofrece).";
        cornerDetailSvg = `
          <path d="M 16 42 L 106 42 L 106 32 L 198 32 L 198 56 L 16 56 Z" fill="#EFE6D8" stroke="#9C8468" stroke-width="1.2"/>
          <rect x="106" y="25" width="92" height="7" fill="#D5DEE8" stroke="#6E7D8C" stroke-width="0.9"/>
          <rect x="106" y="17" width="92" height="8" fill="#F4E3CA" stroke="#A15206" stroke-width="1.2"/>
          <line x1="106" y1="16.5" x2="106" y2="25.5" stroke="#184E77" stroke-width="3.2" stroke-linecap="round"/>
          <text x="152" y="12" text-anchor="middle" font-size="6.8" font-weight="700" fill="#184E77">${es ? "CANTO ESMALTADO DE FÁBRICA" : "FACTORY GLAZED EDGE"}</text>
          <text x="210" y="24" font-size="7.2" font-weight="700" fill="#184E77">${es ? `CANTO ESMALTADO (${glPcs} PZS)` : `GLAZED-EDGE TILE (${glPcs} PCS)`}</text>
          <text x="210" y="35" font-size="6.5" fill="#485563">${es ? "Sin moldura · termina limpio al ras" : "Zero trim piece · clean glazed stop"}</text>
          <text x="210" y="46" font-size="6.5" fill="#485563">${es ? "Sella la unión al muro pintado" : "Caulk neat paintable bead at wall"}</text>
          <text x="60" y="51" text-anchor="middle" font-size="6.1" fill="#485563">${es ? "MURO PLANO PINTADO" : "LONG PAINTED WALL"}</text>
          <text x="156" y="47" text-anchor="middle" font-size="6.1" fill="#485563">${es ? "MURO ESTUFA" : "RANGE WALL"}</text>
        `;
      }

      const S = 2.6;
      const wx0 = +(190 - (wallWin * S) / 2).toFixed(1);
      const wpx = +(wallWin * S).toFixed(1);
      const wy0 = 24;
      const hpx = +(wallHin * S).toFixed(1);
      const counterY = +(wy0 + hpx).toFixed(1);
      const wallMidY = +(wy0 + hpx / 2).toFixed(1);

      let gridSvg = "";
      if (hasTile) {
        const effW = (state.tileOrient === "vertical") ? shortSide : longSide;
        const effH = (state.tileOrient === "vertical") ? longSide : shortSide;

        if (state.tileOrient === "horizontal") {
          const rowCount = Math.ceil(wallHin / effH);
          for (let r = 0; r <= rowCount; r++) {
            const y = +(counterY - r * effH * S).toFixed(1);
            gridSvg += `<line x1="${wx0}" y1="${y}" x2="${(wx0 + wpx).toFixed(1)}" y2="${y}" stroke="#C8B9A6" stroke-width="0.65"/>`;
            if (r < rowCount) {
              const yBot = +(counterY - r * effH * S).toFixed(1);
              const yTop = +(counterY - (r + 1) * effH * S).toFixed(1);
              let offsetIn = 0;
              if (state.tilePattern === "brick" && r % 2 === 1) offsetIn = effW / 2;
              else if (state.tilePattern === "third") offsetIn = (r % 3) * (effW / 3);
              const kMax = Math.ceil(wallWin / effW) + 2;
              for (let k = -kMax; k <= kMax; k++) {
                const x = +(190 + (k * effW + offsetIn) * S).toFixed(1);
                if (x > wx0 - 1 && x < wx0 + wpx + 1) {
                  gridSvg += `<line x1="${x}" y1="${yTop}" x2="${x}" y2="${yBot}" stroke="#C8B9A6" stroke-width="0.65"/>`;
                }
              }
            }
          }
        } else if (state.tileOrient === "vertical") {
          const colHalf = Math.ceil((wallWin / 2) / effW) + 2;
          for (let c = -colHalf; c <= colHalf; c++) {
            const x = +(190 + c * effW * S).toFixed(1);
            gridSvg += `<line x1="${x}" y1="${wy0}" x2="${x}" y2="${counterY}" stroke="#C8B9A6" stroke-width="0.65"/>`;
            const xNext = +(190 + (c + 1) * effW * S).toFixed(1);
            let yOffIn = 0;
            if (state.tilePattern === "brick" && Math.abs(c) % 2 === 1) yOffIn = effH / 2;
            else if (state.tilePattern === "third") yOffIn = (((c % 3) + 3) % 3) * (effH / 3);
            const rMax = Math.ceil(wallHin / effH) + 2;
            for (let r = -1; r <= rMax; r++) {
              const y = +(counterY - (r * effH + yOffIn) * S).toFixed(1);
              if (y > wy0 - 1 && y < counterY + 1) {
                gridSvg += `<line x1="${x}" y1="${y}" x2="${xNext}" y2="${y}" stroke="#C8B9A6" stroke-width="0.65"/>`;
              }
            }
          }
        } else if (state.tileOrient === "diagonal" || (state.tileOrient === "herringbone" && isSquare)) {
          const span = 62;
          let inner = "";
          const rMax = Math.ceil(span / effH) + 1;
          const kMax = Math.ceil(span / effW) + 1;
          for (let r = -rMax; r <= rMax; r++) {
            const y = +(wallMidY + r * effH * S).toFixed(1);
            inner += `<line x1="${(190 - span * S).toFixed(1)}" y1="${y}" x2="${(190 + span * S).toFixed(1)}" y2="${y}" stroke="#C8B9A6" stroke-width="0.65"/>`;
          }
          for (let k = -kMax; k <= kMax; k++) {
            const x = +(190 + k * effW * S).toFixed(1);
            inner += `<line x1="${x}" y1="${(wallMidY - span * S).toFixed(1)}" x2="${x}" y2="${(wallMidY + span * S).toFixed(1)}" stroke="#C8B9A6" stroke-width="0.65"/>`;
          }
          gridSvg = `<g transform="rotate(45 190 ${wallMidY})">${inner}</g>`;
        } else if (state.tileOrient === "herringbone") {
          const L = longSide, W = shortSide;
          const bound = 62;
          const pMax = Math.min(36, Math.ceil(bound / W) + 2);
          const qMax = Math.min(20, Math.ceil(bound / L) + 2);
          let rects = "";
          for (let p = -pMax; p <= pMax; p++) {
            for (let q = -qMax; q <= qMax; q++) {
              const u = p * W + q * L;
              const v = p * W - q * L;
              if (Math.abs(u) > bound || Math.abs(v) > bound) continue;
              const hx = +(190 + u * S).toFixed(1);
              const hy = +(wallMidY + v * S).toFixed(1);
              const vx = hx;
              const vy = +(wallMidY + (v + W) * S).toFixed(1);
              rects += `<rect x="${hx}" y="${hy}" width="${(L * S).toFixed(1)}" height="${(W * S).toFixed(1)}" fill="none" stroke="#C8B9A6" stroke-width="0.6"/>`;
              rects += `<rect x="${vx}" y="${vy}" width="${(W * S).toFixed(1)}" height="${(L * S).toFixed(1)}" fill="none" stroke="#C8B9A6" stroke-width="0.6"/>`;
            }
          }
          gridSvg = `<g transform="rotate(-45 190 ${wallMidY})">${rects}</g>`;
        }
      } else {
        gridSvg = "";
      }
      const emptyCalloutSvg = hasTile ? "" : `
        <g pointer-events="none">
          <rect x="${(wx0 + 8).toFixed(1)}" y="${(counterY - 58).toFixed(1)}" width="${(wpx - 16).toFixed(1)}" height="32" rx="6" fill="#FFFFFF" fill-opacity="0.97" stroke="#C2CCD6" stroke-width="1"/>
          <text x="190" y="${(counterY - 44).toFixed(1)}" text-anchor="middle" font-size="6.4" font-weight="800" fill="#184E77">${es ? '39.3 ft² — elige medida o producto abajo' : '39.3 sq ft — pick a size or product below'}</text>
          <text x="190" y="${(counterY - 33).toFixed(1)}" text-anchor="middle" font-size="5.9" fill="#485563">${es ? 'para ver el patrón en vivo aquí' : 'to preview the live pattern on this wall'}</text>
        </g>
      `;

      let leftEdgePiecesSvg = "";
      const trimColor = { bullnose: "#A15206", quarter: "#6D28D9", wood: "#2D4A3E", glazed: "#184E77" }[state.tileTrim];
      if (state.tileTrim === "bullnose" || state.tileTrim === "quarter") {
        const pcH = (state.tileTrim === "quarter" ? 12 : Math.max(4, longSide)) * S;
        const fillCol = state.tileTrim === "bullnose" ? "#F3D3A6" : "#E9D5FF";
        for (let y = counterY; y > wy0 + 1; y -= pcH) {
          const yTop = Math.max(wy0, y - pcH);
          const wStrip = state.tileTrim === "bullnose" ? 6 : 5;
          leftEdgePiecesSvg += `<rect x="${(wx0 - (state.tileTrim === 'quarter' ? 4 : 0)).toFixed(1)}" y="${yTop.toFixed(1)}" width="${wStrip}" height="${(y - yTop).toFixed(1)}" rx="1.5" fill="${fillCol}" stroke="${trimColor}" stroke-width="0.9"/>`;
        }
      } else if (state.tileTrim === "wood") {
        leftEdgePiecesSvg = `<rect x="${(wx0 - 6).toFixed(1)}" y="${wy0}" width="6" height="${hpx}" fill="#E6EEE8" stroke="#2D4A3E" stroke-width="1.4"/>`;
      } else {
        leftEdgePiecesSvg = `<line x1="${wx0}" y1="${wy0}" x2="${wx0}" y2="${counterY}" stroke="#184E77" stroke-width="3.2"/>`;
      }

      const trimSvgLabel = {
        bullnose: es ? "Bullnose" : "Bullnose",
        quarter: es ? "Lápiz / Bocel" : "Pencil / 1/4-rnd",
        wood: es ? "Madera pintada" : "Wood trim",
        glazed: es ? "Canto esmalt." : "Glazed edge"
      }[state.tileTrim];

      const orientLabelEn = { horizontal: "HORIZONTAL", vertical: "VERTICAL", diagonal: "45° DIAGONAL", herringbone: isSquare ? "45° DIAMOND" : "HERRINGBONE" }[state.tileOrient];
      const orientLabelEs = { horizontal: "HORIZONTAL", vertical: "VERTICAL", diagonal: "DIAGONAL 45°", herringbone: isSquare ? "DIAMANTE 45°" : "ESPIGA (HERRINGBONE)" }[state.tileOrient];
      const patLabelEn = (state.tileOrient === "horizontal" || state.tileOrient === "vertical")
        ? ({ stacked: "STACKED", brick: "50% BRICK", third: "1/3 OFFSET" }[state.tilePattern] || "STACKED") : "";
      const patLabelEs = (state.tileOrient === "horizontal" || state.tileOrient === "vertical")
        ? ({ stacked: "ALINEADO", brick: "LADRILLO 50%", third: "DESFASE 1/3" }[state.tilePattern] || "ALINEADO") : "";

      const w1X = +(wx0 + 9 * S).toFixed(1);
      const w2X = +(wx0 + 57 * S).toFixed(1);
      const outY = +(counterY - 6 * S).toFixed(1);
      const screwY = +(counterY - (lineBAffNum - 36) * S).toFixed(1);
      const screwDx = +(4.922 * S).toFixed(1);
      const shroudW = +(8.625 * S).toFixed(1);
      const isCalcOpen = !!state.calcOpenByStep["tile-plan"];

      bodyEl.innerHTML = `
        <div class="sheet-card">
          <div class="sheet-head">
            <div>
              <div class="sheet-title">${es ? "Paso 5 — Plan de HardieBacker y Azulejo al Techo" : "Step 5 — HardieBacker & Full-Height Tile Plan"}</div>
              <div class="sheet-sub">${es ? "Área total 39.3 ft² · elige orientación, medida o busca un producto, y calcula al final" : "39.3 sq ft total wall · pick pattern & size or search a product, then calculate"}</div>
            </div>
            <span class="compass">${grossSqft} sq ft</span>
          </div>

          ${installStepNavHtml("tile-plan")}
          ${topDragBarHtml()}

          <!-- Clean Wall Area & Selection KPI Strip (NO default fake tile numbers!) -->
          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:9px">
            <div style="padding:7px 9px;border-radius:8px;background:var(--surface);border:1px solid var(--rule)">
              <div style="font-size:10.5px;color:var(--ink-3);font-weight:600;text-transform:uppercase">${es ? "Área total pared" : "Total wall area"}</div>
              <div style="font-size:15px;font-weight:800;color:var(--cobalt)">${grossSqft} ${es ? "ft²" : "sq ft"}</div>
              <div style="font-size:10.5px;color:var(--ink-2)">66-1/4" W × 85-1/2" H</div>
            </div>
            <div style="padding:7px 9px;border-radius:8px;background:var(--surface);border:1px solid var(--rule)">
              <div style="font-size:10.5px;color:var(--ink-3);font-weight:600;text-transform:uppercase">${es ? "Azulejo elegido" : "Selected tile"}</div>
              <div style="font-size:14px;font-weight:800;color:var(--ink)">${hasTile ? `${tw}"×${th}"` : "—"}</div>
              <div style="font-size:10.5px;color:var(--ink-2)">${hasTile ? (isCalcOpen && boxesNeeded ? `${boxesNeeded} ${es ? "cajas" : "boxes"} (+${state.tileWastePct}%)` : (es ? "Listo para calcular" : "Ready to calculate")) : (es ? "Elige abajo" : "Pick size below")}</div>
            </div>
            <div style="padding:7px 9px;border-radius:8px;background:var(--surface);border:1px solid var(--rule)">
              <div style="font-size:10.5px;color:var(--ink-3);font-weight:600;text-transform:uppercase">${es ? "Cajas / cant." : "Est. qty / boxes"}</div>
              <div style="font-size:15px;font-weight:800;color:var(--pine)">${(hasTile && boxesNeeded != null) ? `${boxesNeeded} ${es ? "cajas" : "boxes"}` : (hasTile ? `${orderSqft} sq ft` : "—")}</div>
              <div style="font-size:10.5px;color:var(--ink-2)">${hasTile ? (es ? `Incluye +${state.tileWastePct}% margen` : `Includes +${state.tileWastePct}% waste`) : (es ? "Solo cantidades" : "Quantities only")}</div>
            </div>
          </div>

          <div class="ks4-svg-wrap" id="s5SvgWrap">
            <svg class="ks4-svg" id="s5Svg" viewBox="0 0 380 292" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="tileWallClip">
                  <rect x="${wx0}" y="${wy0}" width="${wpx}" height="${hpx}"/>
                </clipPath>
              </defs>

              <line x1="20" y1="${wy0}" x2="360" y2="${wy0}" stroke="#131A22" stroke-width="1.8"/>
              <text x="190" y="15" text-anchor="middle" font-size="7.2" font-weight="700" font-family="monospace" fill="#184E77">${hasTile ? (es ? `TECHO 121-1/2" · ${grossSqft} FT² · ${tw}"×${th}" ${orientLabelEs}${patLabelEs ? " · " + patLabelEs : ""}` : `CEILING 121-1/2" · ${grossSqft} SQ FT · ${tw}"×${th}" ${orientLabelEn}${patLabelEn ? " · " + patLabelEn : ""}`) : (es ? `TECHO 121-1/2" · PARED 66-1/4" × 85-1/2" = ${grossSqft} FT²` : `CEILING 121-1/2" · WALL 66-1/4" × 85-1/2" = ${grossSqft} SQ FT`)}</text>

              <!-- Long Flat Painted Wall Return on Left (NO tiled return!) -->
              <rect x="${(wx0 - 24).toFixed(1)}" y="${wy0}" width="24" height="${hpx}" fill="#F3F5F8" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="3 2"/>
              <text x="${(wx0 - 12).toFixed(1)}" y="135" text-anchor="middle" font-size="5.8" font-weight="700" fill="#64748B" transform="rotate(-90 ${(wx0 - 12).toFixed(1)} 135)">${es ? "MURO PLANO PINTADO (SIN AZULEJO)" : "LONG PAINTED FLAT WALL (UNTILED)"}</text>

              <!-- Solid Perpendicular NORTH WALL on Right (Inside 90° Corner — NO trim needed!) -->
              <rect x="${(wx0 + wpx).toFixed(1)}" y="${wy0}" width="16" height="${hpx}" fill="#E6EBF1" stroke="#64748B" stroke-width="1.1"/>
              <line x1="${(wx0 + wpx).toFixed(1)}" y1="${wy0}" x2="${(wx0 + wpx).toFixed(1)}" y2="${counterY}" stroke="#1B6B46" stroke-width="2.2"/>
              <text x="${(wx0 + wpx + 22).toFixed(1)}" y="66" font-size="6.7" font-weight="700" fill="#1B6B46">${es ? "MURO NORTE" : "NORTH WALL"}</text>
              <text x="${(wx0 + wpx + 22).toFixed(1)}" y="75" font-size="6.2" fill="#485563">${es ? "Esquina interior 90°" : "Inside 90° corner"}</text>
              <text x="${(wx0 + wpx + 22).toFixed(1)}" y="84" font-size="6.1" fill="#1B6B46">${es ? "Sin remate (silicón)" : "No trim (silicone)"}</text>

              <!-- 1/2" HardieBacker + Clipped Full-Height Tile Field (66-1/4" W x 85-1/2" H, 1:1 scale) -->
              <rect x="${wx0}" y="${wy0}" width="${wpx}" height="${hpx}" fill="#FBF6EE" stroke="#A15206" stroke-width="1.2"/>
              <g clip-path="url(#tileWallClip)">${gridSvg}</g>

              <!-- ONLY ONE Exposed Edge: Left (South) edge stopping against flat painted wall -->
              ${leftEdgePiecesSvg}
              ${state.tileTrimCeiling ? `<line x1="${wx0}" y1="${wy0}" x2="${(wx0 + wpx).toFixed(1)}" y2="${wy0}" stroke="${trimColor}" stroke-width="2.6"/>` : ""}
              <text x="${(wx0 - 28).toFixed(1)}" y="56" text-anchor="end" font-size="6.6" font-weight="700" fill="${trimColor}">${trimSvgLabel}</text>
              <text x="${(wx0 - 28).toFixed(1)}" y="65" text-anchor="end" font-size="6.1" fill="#485563">${es ? "Orilla Izq. (Sur)" : "Left edge (South)"}</text>
              <text x="${(wx0 - 28).toFixed(1)}" y="74" text-anchor="end" font-size="6.0" fill="#485563">${es ? "Solo 1 lado (7.1 ft)" : "Only 1 edge (7.1 ft)"}</text>

              <!-- Dashed 8-5/8" Chimney & 2 Wet-Diamond Screw Holes -->
              <rect x="${(190 - shroudW / 2).toFixed(1)}" y="${wy0}" width="${shroudW}" height="${Math.max(30, screwY - wy0).toFixed(1)}" fill="rgba(220,226,233,0.44)" stroke="#6E7D8C" stroke-dasharray="3 2"/>
              <circle cx="${(190 - screwDx).toFixed(1)}" cy="${screwY}" r="3" fill="#B42318" stroke="#FFFFFF" stroke-width="0.9"/>
              <circle cx="${(190 + screwDx).toFixed(1)}" cy="${screwY}" r="3" fill="#B42318" stroke="#FFFFFF" stroke-width="0.9"/>
              <line x1="${(190 + screwDx + 4).toFixed(1)}" y1="${screwY}" x2="294" y2="${screwY}" stroke="#B42318" stroke-width="0.9"/>
              <text x="297" y="${screwY - 1}" font-size="6.6" font-weight="700" fill="#B42318">${es ? "Broca diamante" : "Wet diamond drill"}</text>
              <text x="297" y="${screwY + 8}" font-size="6.2" fill="#78350F">${es ? "(sobre azulejo)" : "(mount over tile)"}</text>

              <!-- TWO COUNTERTOP OUTLETS W1 (9") & W2 (57") with 1" Tile Mud Rings -->
              <rect x="${(w1X - 9).toFixed(1)}" y="${(outY - 6).toFixed(1)}" width="18" height="12" rx="2" fill="#FFFFFF" stroke="#1B6B46" stroke-width="1.8"/>
              <circle cx="${(w1X - 3.5).toFixed(1)}" cy="${outY}" r="1.5" fill="#1B6B46"/>
              <circle cx="${(w1X + 3.5).toFixed(1)}" cy="${outY}" r="1.5" fill="#1B6B46"/>
              <line x1="76" y1="${outY}" x2="${(w1X - 10).toFixed(1)}" y2="${outY}" stroke="#1B6B46" stroke-width="1"/>
              <text x="73" y="${outY - 2}" text-anchor="end" font-size="6.8" font-weight="700" fill="#1B6B46">${es ? 'W1 (9")' : 'OUTLET W1'}</text>
              <text x="73" y="${outY + 7}" text-anchor="end" font-size="6.0" fill="#485563">${es ? '20A · anillo 1"' : '9" · 1" mud ring'}</text>

              <rect x="${(w2X - 9).toFixed(1)}" y="${(outY - 6).toFixed(1)}" width="18" height="12" rx="2" fill="#FFFFFF" stroke="#1B6B46" stroke-width="1.8"/>
              <circle cx="${(w2X - 3.5).toFixed(1)}" cy="${outY}" r="1.5" fill="#1B6B46"/>
              <circle cx="${(w2X + 3.5).toFixed(1)}" cy="${outY}" r="1.5" fill="#1B6B46"/>
              <line x1="${(w2X + 10).toFixed(1)}" y1="${outY}" x2="294" y2="${outY}" stroke="#1B6B46" stroke-width="1"/>
              <text x="297" y="${outY - 2}" font-size="6.8" font-weight="700" fill="#1B6B46">${es ? 'W2 (57")' : 'OUTLET W2'}</text>
              <text x="297" y="${outY + 7}" font-size="6.0" fill="#485563">${es ? '20A · anillo 1"' : '57" · 1" mud ring'}</text>

              <!-- Flat Countertop Plane (NO 4" stone backsplash curb!) -->
              <rect x="${wx0}" y="${counterY}" width="${(18 * S).toFixed(1)}" height="12" fill="#E6EEE8" stroke="#2D4A3E" stroke-width="1.3"/>
              <rect x="${(wx0 + 18 * S).toFixed(1)}" y="${counterY}" width="${(30 * S).toFixed(1)}" height="12" fill="#EEF1F5" stroke="#131A22" stroke-width="1.3"/>
              <rect x="${(wx0 + 48 * S).toFixed(1)}" y="${counterY}" width="${(18 * S).toFixed(1)}" height="12" fill="#E6EEE8" stroke="#2D4A3E" stroke-width="1.3"/>
              <line x1="${wx0}" y1="${counterY}" x2="${(wx0 + wpx).toFixed(1)}" y2="${counterY}" stroke="#1B6B46" stroke-width="2.4"/>
              <text x="190" y="${(counterY + 24).toFixed(1)}" text-anchor="middle" font-size="7.2" font-weight="700" fill="#1B6B46">${es ? 'CUBIERTA PLANA 36" — SIN ZOCLO DE PIEDRA 4" (silicón al color · baja 1 fila atrás de estufa)' : 'FLAT 36" COUNTER — NO 4" STONE CURB (color-matched silicone · drop 1 row behind stove)'}</text>
              <text x="190" y="${(counterY + 35).toFixed(1)}" text-anchor="middle" font-size="6.7" fill="#485563">${es ? 'HardieBacker 1/2" (0.42") junto a tablaroca 1/2" comprada (0.50") · emparejar ~1/16" en unión' : '1/2" HardieBacker 500 (0.42") next to purchased 1/2" drywall (0.50") · feather ~1/16" seam'}</text>

              ${emptyCalloutSvg}
              ${svgMarksHtml("tile-plan")}
            </svg>
            ${activePinSteerHtml("tile-plan")}
          </div>

          <div class="ks4-controls">
            <!-- 1) Main Tile Selection FIRST: Select Tile Size -> Orientation -> Pattern -> Product Lookup -> Add Custom -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;font-size:11.5px;font-weight:700;color:var(--ink-2)">
              <span>${es ? "Elegir medida de azulejo:" : "Select Tile Size:"}</span>
              <span style="font-weight:600;color:var(--cobalt)">${productLabel}</span>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              ${Object.entries(TILE_PRESETS).map(([k, p]) => `
                <button class="intent-btn ${state.tileProductKey===k ? 'active' : ''}" data-tilepreset="${k}" type="button">${p.w}"×${p.h}"</button>
              `).join("")}
            </div>

            <!-- Orientation -->
            <div class="slider-row" style="flex-wrap:wrap">
              <span>${es ? "Orientación:" : "Orientation:"}</span>
              <div style="display:flex;gap:4px;flex-wrap:wrap">
                <button class="intent-btn ${state.tileOrient==='horizontal' ? 'active' : ''}" data-torient="horizontal" type="button">${es ? "Horizontal" : "Horizontal"}</button>
                <button class="intent-btn ${state.tileOrient==='vertical' ? 'active' : ''}" data-torient="vertical" type="button">${es ? "Vertical" : "Vertical"}</button>
                <button class="intent-btn ${state.tileOrient==='diagonal' ? 'active' : ''}" data-torient="diagonal" type="button">${es ? "Diagonal 45°" : "Diagonal 45°"}</button>
                <button class="intent-btn ${state.tileOrient==='herringbone' ? 'active' : ''}" data-torient="herringbone" type="button">${es ? "Espiga (Herringbone)" : "Herringbone"}</button>
              </div>
            </div>

            <!-- Pattern & waste -->
            ${(state.tileOrient === "horizontal" || state.tileOrient === "vertical") ? `
              <div class="slider-row" style="flex-wrap:wrap">
                <span>${es ? "Patrón y cortes:" : "Pattern & waste:"}</span>
                <div style="display:flex;gap:4px;flex-wrap:wrap">
                  <button class="intent-btn ${state.tilePattern==='stacked' ? 'active' : ''}" data-tpat="stacked" type="button">${es ? "Alineado (Stacked)" : "Stacked"}</button>
                  <button class="intent-btn ${state.tilePattern==='brick' ? 'active' : ''}" data-tpat="brick" type="button">${es ? "Ladrillo 50%" : "50% Brick"}</button>
                  <button class="intent-btn ${state.tilePattern==='third' ? 'active' : ''}" data-tpat="third" type="button">${es ? "Desfase 1/3" : "1/3 Offset"}</button>
                  <button class="intent-btn ${state.tileWastePct===10 ? 'active' : ''}" data-twaste="10" type="button">+10%</button>
                  <button class="intent-btn ${state.tileWastePct===15 ? 'active' : ''}" data-twaste="15" type="button">+15%</button>
                  <button class="intent-btn ${state.tileWastePct===20 ? 'active' : ''}" data-twaste="20" type="button">+20%</button>
                </div>
              </div>
            ` : `
              <div class="slider-row" style="flex-wrap:wrap">
                <span>${es ? "Patrón y cortes diagonales:" : "Pattern & diagonal waste:"}</span>
                <div style="display:flex;gap:4px;flex-wrap:wrap">
                  <button class="intent-btn ${state.tileWastePct===15 ? 'active' : ''}" data-twaste="15" type="button">+15%</button>
                  <button class="intent-btn ${state.tileWastePct===20 ? 'active' : ''}" data-twaste="20" type="button">+20% ${es ? "(rec.)" : "(rec.)"}</button>
                  <button class="intent-btn ${state.tileWastePct===25 ? 'active' : ''}" data-twaste="25" type="button">+25%</button>
                </div>
              </div>
            `}
            ${(state.tileOrient === "herringbone" && hasTile && isSquare) ? `
              <div class="status-strip warn">${es ? 'Nota: El patrón espiga (Herringbone) requiere azulejo rectangular (como 2.5"×8" o 3"×6") — mostrando diamante 45° para pieza cuadrada.' : 'Note: Herringbone needs a rectangular tile (like 2.5"×8" or 3"×6") — showing 45° diamond for square tile.'}</div>
            ` : ""}

            <!-- Product lookup (Live Backend Search / URL / Camera + matching trim parts check!) -->
            <div style="font-size:11.5px;font-weight:700;color:var(--cobalt);margin-top:2px">
              ${es ? "Buscar producto (nombre, URL o cámara — revisa piezas de remate):" : "Product lookup (name, URL, or camera — checks trim parts too):"}
            </div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">
              <input id="tileUrlIn" type="text" value="${state.tileUrlInput.replace(/"/g, "&quot;")}" placeholder="${es ? "Pega link de tienda o escribe nombre / SKU del azulejo..." : "Paste store product URL or type tile name / SKU..."}" style="flex:1;min-width:170px;height:31px;padding:0 9px;border-radius:6px;border:1px solid var(--rule-strong);background:var(--surface);font-size:12px;color:var(--ink)">
              <button class="mini-btn primary" id="tileUrlFillBtn" type="button" ${state.tileLookupBusy ? "disabled" : ""}>${state.tileLookupBusy ? (es ? "Buscando..." : "Searching...") : (es ? "Buscar / Agregar" : "Search / Add")}</button>
              <button class="mini-btn" id="tileCamBtn" type="button" ${state.tileLookupBusy ? "disabled" : ""}>📷 ${es ? "Cámara / Foto" : "Camera / Photo"}</button>
              <input id="tileCamInput" type="file" accept="image/*" capture="environment" style="display:none">
            </div>
            ${(state.tileLookupNoteEn || state.tileSnapPreview) ? `
              <div style="display:flex;align-items:flex-start;gap:8px;padding:7px 9px;border-radius:6px;background:var(--surface);border:1px solid var(--rule);font-size:11.5px;color:var(--ink-2);line-height:1.45">
                ${state.tileSnapPreview ? `<img src="${state.tileSnapPreview}" alt="Tile label scan" style="width:42px;height:42px;object-fit:cover;border-radius:5px;border:1px solid var(--rule);flex-shrink:0">` : ""}
                <div>${es ? state.tileLookupNoteEs : state.tileLookupNoteEn}</div>
              </div>
            ` : ""}

            <!-- Add custom (collapsed toggle!) -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:2px">
              <span style="font-size:11.5px;font-weight:700;color:var(--ink-2)">${es ? "Medida manual y rendimiento:" : "Custom tile dimensions:"}</span>
              <button class="intent-btn ${state.tileShowCustom ? 'active' : ''}" id="toggleCustomTileBtn" type="button">${state.tileShowCustom ? "▾ " : "+ "}${es ? "Agregar medida" : "Add custom"}</button>
            </div>
            ${state.tileShowCustom ? `
              <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;font-size:11.5px;padding:7px;border-radius:7px;background:var(--surface);border:1px solid var(--rule)">
                <label style="display:grid;gap:2px;font-weight:600;color:var(--ink-2)">
                  ${es ? 'Ancho "' : 'Width "'}
                  <input id="tileWIn" type="number" step="0.25" min="1" max="24" value="${tw ?? ""}" placeholder="e.g. 3" style="height:30px;padding:0 6px;border-radius:6px;border:1px solid var(--rule-strong);background:var(--paper);color:var(--ink)">
                </label>
                <label style="display:grid;gap:2px;font-weight:600;color:var(--ink-2)">
                  ${es ? 'Alto "' : 'Height "'}
                  <input id="tileHIn" type="number" step="0.25" min="1" max="24" value="${th ?? ""}" placeholder="e.g. 6" style="height:30px;padding:0 6px;border-radius:6px;border:1px solid var(--rule-strong);background:var(--paper);color:var(--ink)">
                </label>
                <label style="display:grid;gap:2px;font-weight:600;color:var(--ink-2)">
                  ${es ? 'ft²/caja' : 'sf / box'}
                  <input id="tileBoxIn" type="number" step="0.1" min="1" max="40" value="${boxSqft ?? ""}" placeholder="e.g. 10" style="height:30px;padding:0 6px;border-radius:6px;border:1px solid var(--rule-strong);background:var(--paper);color:var(--ink)">
                </label>
                
              </div>
            ` : ""}

            <!-- 2) Whole Bullnose / Zero-Metal Edge Bubble AFTER main tile selection! -->
            <div style="padding:10px 11px;border-radius:12px;background:var(--surface);border:1.5px solid var(--rule-strong);display:grid;gap:7px;margin-top:4px">
              <div style="font-size:11.5px;font-weight:700;color:var(--ink)">
                ${es ? "Acabado de orilla SIN metal (solo borde Izq. = 7.1 ft · lado Norte muere en muro):" : "Zero-metal edge & bullnose finishes (Left edge only = 7.1 ft · North side meets wall):"}
              </div>
              <div style="display:flex;gap:4px;flex-wrap:wrap">
                <button class="intent-btn ${state.tileTrim==='bullnose' ? 'active' : ''}" data-ttrim="bullnose" type="button">${es ? "Bullnose cerámico" : "Ceramic Bullnose"}</button>
                <button class="intent-btn ${state.tileTrim==='quarter' ? 'active' : ''}" data-ttrim="quarter" type="button">${es ? "Lápiz / Cuarto bocel" : "Pencil / 1/4-Round"}</button>
                <button class="intent-btn ${state.tileTrim==='wood' ? 'active' : ''}" data-ttrim="wood" type="button">${es ? "Madera Edwardian" : "Painted Wood Trim"}</button>
                <button class="intent-btn ${state.tileTrim==='glazed' ? 'active' : ''}" data-ttrim="glazed" type="button">${es ? "Canto esmaltado" : "Glazed-Edge Tile"}</button>
                <button class="intent-btn ${state.tileTrimCeiling ? 'active' : ''}" id="tileTrimCeilBtn" type="button">${state.tileTrimCeiling ? "✓ " : "+ "}${es ? "Remate techo" : "Cap ceiling"}</button>
              </div>
              ${trimWarnEn ? `<div class="status-strip warn">${es ? trimWarnEs : trimWarnEn}</div>` : ""}
              <div>
                <div style="font-size:11px;font-weight:700;color:var(--ink-2);margin-bottom:4px">
                  ${es ? "Vista superior ampliada contra el muro plano pintado:" : "Close-up top-down mockup against the long painted flat wall:"}
                </div>
                <svg viewBox="0 0 380 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;border-radius:7px;background:var(--paper);border:1px solid var(--rule)">
                  ${cornerDetailSvg}
                </svg>
                <div style="font-size:11.3px;color:var(--ink-2);margin-top:5px;line-height:1.45">${es ? edgeDescEs : edgeDescEn}</div>
              </div>
            </div>

            <!-- 3) Calculate Button right after the bullnose/edge bubble! -->
            ${calcMaterialsBlockHtml("tile-plan", es, { hasTile, tw, th, grossSqft, orderSqft, boxesNeeded, billedSqft, tilesNeeded, tileTotalCost, hardieSheets, trimCost, hardieSuppliesCost, trimShortEn, trimShortEs })}
          </div>

          ${markEditorAndListHtml("tile-plan")}

          <div class="key-facts">
            <div class="key-facts-title">${es ? "Lo importante sobre HardieBacker, orilla sin metal, zoclo y contactos" : "Important Tile, Zero-Metal Edge, Backsplash & Outlet Facts"}</div>
            <ul>
              <li><strong>${es ? "Solo UNA orilla expuesta (cero metal, sin retorno con azulejo):" : "Only ONE exposed edge (zero metal, no tiled return):"}</strong> ${es ? "El lado derecho (Norte) muere contra el muro Norte (esquina interior de 90° — solo silicón, sin remate). El lado izquierdo (Sur) termina limpio contra el muro plano pintado — sin retorno de azulejo — usando bullnose cerámico, moldura lápiz/cuarto bocel cerámico, madera pintada estilo Edwardian o canto esmaltado. Si tu azulejo NO trae molduras a juego, usa madera pintada, un lápiz cerámico neutral o canto esmaltado (los cortes a 45° solo aplican si envolviera una esquina exterior con azulejo)." : "The Right (North) side dies cleanly into the perpendicular North wall (inside 90° corner — silicone only, zero trim). The Left (South) side stops cleanly against the long flat painted wall (no tiled return) using ceramic bullnose, ceramic pencil/quarter-round, painted Edwardian wood trim, or factory glazed-edge tile. If your chosen tile has no matching trim pieces, use painted wood trim, a coordinated ceramic liner, or glazed-edge (45° miters only apply if tiling around an outside corner)."}</li>
              <li><strong>${es ? "¿Se pone zoclo de piedra de 4\" con azulejo hasta el techo? NO:" : "Do you put a 4\" stone backsplash strip under full-height tile? NO:"}</strong> ${es ? "Con azulejo hasta el techo, la cubierta va plana directo al muro (sin tira de piedra de 4\"). La primera fila descansa sobre la cubierta con silicón flexible al color — y baja 1 fila (~3\"–4\") detrás de la estufa de 30\"." : "With counter-to-ceiling tile, tell the stone fabricator NO 4\" backsplash curb — run the flat slab straight to the wall so the first tile row sits cleanly on the counter with color-matched silicone (and drop 1 extra row ~3\"–4\" behind the 30\" stove)."}</li>
              <li><strong>${es ? "HardieBacker 1/2\" junto a tablaroca de 1/2\" y contactos W1 (9\") / W2 (57\"):" : "1/2\" HardieBacker next to purchased 1/2\" drywall & W1 (9\") / W2 (57\") outlets:"}</strong> ${es ? "Como se compró tablaroca de 1/2\" (0.50\") y el HardieBacker 500 de 1/2\" mide 0.42\", NO necesitas calzas de 3/16\" — quedan casi al ras (solo ~1/16\" de diferencia que se empareja fácil en la unión). Ambos contactos de cubierta (20A) llevan anillos extensores de 1\" para quedar al ras del azulejo." : "Because Unit 4 purchased 1/2\" drywall (0.50\") and 1/2\" HardieBacker 500 measures 0.42\", you do NOT need 3/16\" stud shims — they sit nearly flush (~1/16\" feather at the transition seam). Both 20A countertop outlets (W1 at 9\", W2 at 57\" from South) need 1\" tile mud rings."}</li>
            </ul>
            ${manualLinksBarHtml()}
          </div>

          ${renderSheetPager("tile-plan")}
        </div>
      `;

      // Wire common tile presets (tap again to deselect)
      document.querySelectorAll("[data-tilepreset]").forEach(b => {
        b.onclick = () => {
          const k = b.dataset.tilepreset;
          const p = TILE_PRESETS[k];
          if (!p) return;
          state.tileProductKey = k;
          state.tileW = p.w;
          state.tileH = p.h;
          state.tileBoxSqft = p.box;
          state.tilePriceSqft = null;
          state.tileWastePct = p.waste;
          state.tilePattern = p.pat;
          state.tileOrient = p.orient;
          state.tileCustomName = "";
          state.tileLookupNoteEn = "";
          state.tileLookupNoteEs = "";
          renderDrawer();
        };
      });

      document.getElementById("toggleCustomTileBtn").onclick = () => {
        state.tileShowCustom = !state.tileShowCustom;
        renderDrawer();
      };

      // Live Backend-Wired Product Search / URL Fetch / Camera Vision Lookup (with include_retail_estimate: true + trim parts check!)
      async function runProductLookup(payload, rawInput, fileName) {
        state.tileLookupBusy = true;
        renderDrawer();

        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 14000);
          const resp = await fetch(U4_PRODUCT_LOOKUP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.assign({
              category: "tile",
              check_matching_trim_parts: true
            }, payload)),
            signal: ctrl.signal
          });
          clearTimeout(timer);
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.ok && data.product) {
              const p = data.product;
              state.tileProductKey = "backend";
              state.tileCustomName = p.name || rawInput || fileName || "Product";
              if (Number(p.width_in) > 0) state.tileW = Number(p.width_in);
              if (Number(p.height_in) > 0) state.tileH = Number(p.height_in);
              if (Number(p.sqft_per_box) > 0) state.tileBoxSqft = Number(p.sqft_per_box);
              state.tilePriceSqft = null;
              if (p.recommended_pattern && ["stacked", "brick", "third"].includes(p.recommended_pattern)) state.tilePattern = p.recommended_pattern;

              const hasBn = !!p.bullnose_available;
              const hasGl = !!p.glazed_edge_available;
              const partsEn = hasBn
                ? `<b>Matching parts found:</b> Ceramic bullnose available${p.bullnose_length_in ? ` (${p.bullnose_length_in}")` : ""}${hasGl ? " · Glazed-edge pieces available" : ""}.`
                : (hasGl
                  ? `<b>Matching parts check:</b> No matching bullnose listed — factory <b>glazed-edge</b> pieces available. Other zero-metal options: ceramic pencil/quarter-round or painted Edwardian wood trim.`
                  : `<b>No matching trim pieces found for this tile:</b> Skip metal trim — use <b>painted Edwardian wood trim</b>, a coordinated <b>ceramic pencil / quarter-round</b>, or ask if <b>factory glazed-edge</b> is offered (a 45° mitered edge only works if wrapping an outside corner with a return strip).`);
              const partsEs = hasBn
                ? `<b>Piezas de remate encontradas:</b> Bullnose cerámico disponible${p.bullnose_length_in ? ` (${p.bullnose_length_in}")` : ""}${hasGl ? " · Canto esmaltado disponible" : ""}.`
                : (hasGl
                  ? `<b>Revisión de remates:</b> Sin bullnose — hay piezas con <b>canto esmaltado</b> de fábrica. Otras opciones sin metal: lápiz/cuarto bocel cerámico o madera pintada.`
                  : `<b>No se encontraron molduras a juego para este azulejo:</b> Sin metal — usa <b>madera pintada Edwardian</b>, un <b>lápiz / cuarto bocel cerámico</b> que combine o pregunta por <b>canto esmaltado</b> (el corte 45° solo aplica si envuelve una esquina exterior con retorno).`);

              const priceTxt = "";
              state.tileLookupNoteEn = `<b>Live lookup (${data.source || "backend"}):</b> ${state.tileCustomName} (${state.tileW}"×${state.tileH}"${state.tileBoxSqft ? `, ${state.tileBoxSqft} sf/box` : ""}${priceTxt}).<br>${partsEn}${p.notes ? `<br><span>${p.notes}</span>` : ""}`;
              state.tileLookupNoteEs = `<b>Búsqueda en vivo (${data.source || "backend"}):</b> ${state.tileCustomName} (${state.tileW}"×${state.tileH}"${state.tileBoxSqft ? `, ${state.tileBoxSqft} ft²/caja` : ""}${priceTxt}).<br>${partsEs}${p.notes ? `<br><span>${p.notes}</span>` : ""}`;
              state.tileLookupBusy = false;
              renderDrawer();
              return;
            }
          }
        } catch (_) {
          // Graceful fallback below if offline or preview sandbox blocks network
        }

        const txt = (rawInput || fileName || "").trim();
        const low = txt.toLowerCase();
        let matchedName = "", w = state.tileW, h = state.tileH, box = state.tileBoxSqft, price = state.tilePriceSqft;
        let bnAvail = true, glAvail = false;

        if (low.includes("zellige") || low.includes("cletile")) {
          w = 4; h = 4; box = 5.4; bnAvail = false; glAvail = true; matchedName = 'Handmade Square 4"×4"';
        } else if (low.includes("cloe") || low.includes("bedrosians")) {
          w = 2.5; h = 8; box = 10.8; bnAvail = true; matchedName = 'Bedrosians Cloe 2.5"×8"';
        } else if (low.includes("fireclay")) {
          w = 3; h = 12; box = 10.0; bnAvail = true; glAvail = true; matchedName = 'Fireclay 3"×12"';
        } else if (low.includes("heath")) {
          w = 2; h = 6; box = 10.0; bnAvail = false; glAvail = true; matchedName = 'Heath 2"×6"';
        } else if (low.includes("subway") || low.includes("homedepot") || low.includes("daltile") || low.includes("lowes")) {
          w = 3; h = 6; box = 10.0; bnAvail = true; matchedName = 'Ceramic Subway 3"×6"';
        }

        const dimMatch = low.match(/(\d+(?:[.\-]\d+)?)\s*(?:in\.?|-in-|-inch-)?\s*(?:x|by|-x-)\s*(\d+(?:[.\-]\d+)?)/);
        if (dimMatch) {
          const pw = parseFloat(dimMatch[1].replace("-", "."));
          const ph = parseFloat(dimMatch[2].replace("-", "."));
          if (pw >= 1 && pw <= 24 && ph >= 1 && ph <= 24) {
            w = pw; h = ph;
            if (!matchedName) matchedName = `${txt.slice(0, 34)} (${w}"×${h}")`;
          }
        }
        if (!matchedName) matchedName = fileName ? `Photo (${fileName})` : (txt.slice(0, 38) || "Custom tile");

        state.tileProductKey = "url";
        state.tileCustomName = matchedName;
        if (w) state.tileW = w;
        if (h) state.tileH = h;
        if (box) state.tileBoxSqft = box;
        state.tilePriceSqft = null;
        state.tileLookupBusy = false;

        const fallbackTrimEn = bnAvail
          ? `<b>Trim parts check:</b> Matching ceramic bullnose / quarter-round typically available — verify SKU on store page.`
          : `<b>No matching bullnose typically made for this tile:</b> Use <b>painted wood trim</b>, a coordinated <b>ceramic pencil/quarter-round</b>, or order <b>glazed-edge</b> pieces (a 45° miter only works if wrapping an outside corner).`;
        const fallbackTrimEs = bnAvail
          ? `<b>Revisión de remates:</b> Suele tener bullnose / cuarto bocel cerámico a juego — confirma en la ficha del producto.`
          : `<b>Suele NO tener bullnose a juego:</b> Usa <b>madera pintada Edwardian</b>, un <b>lápiz / cuarto bocel cerámico</b> o pide <b>canto esmaltado</b> (el corte 45° solo aplica si envuelve una esquina exterior).`;

        state.tileLookupNoteEn = `<b>${matchedName}</b>${w && h ? ` (${w}"×${h}"${box ? `, ${box} sf/box` : ""})` : ""}.<br>${fallbackTrimEn}`;
        state.tileLookupNoteEs = `<b>${matchedName}</b>${w && h ? ` (${w}"×${h}"${box ? `, ${box} ft²/caja` : ""})` : ""}.<br>${fallbackTrimEs}`;
        renderDrawer();
      }

      function triggerSearchOrUrl(raw) {
        const val = (raw || "").trim();
        state.tileUrlInput = val;
        if (!val) {
          showToast(es ? "Escribe un nombre o pega un link primero" : "Enter a product name or URL first");
          return;
        }
        const isUrl = /^https?:\/\//i.test(val) || /\.[a-z]{2,}\//i.test(val);
        runProductLookup(isUrl ? { url: val } : { query: val }, val, "");
      }
      document.getElementById("tileUrlFillBtn").onclick = () => triggerSearchOrUrl(document.getElementById("tileUrlIn").value);
      document.getElementById("tileUrlIn").onkeydown = (e) => { if (e.key === "Enter") triggerSearchOrUrl(e.target.value); };

      // Wire Camera / Photo box-label scanner to live backend + preview
      document.getElementById("tileCamBtn").onclick = () => document.getElementById("tileCamInput").click();
      document.getElementById("tileCamInput").onchange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
          state.tileSnapPreview = reader.result;
          runProductLookup({ image_base64: reader.result, image_mime: f.type || "image/jpeg" }, "", f.name || "photo.jpg");
        };
        reader.readAsDataURL(f);
      };

      // Wire custom inputs (only mounted when + Add custom is toggled open)
      const wIn = document.getElementById("tileWIn");
      const hIn = document.getElementById("tileHIn");
      const bIn = document.getElementById("tileBoxIn");
      const pIn = document.getElementById("tilePriceIn");
      if (wIn) wIn.onchange = (e) => { state.tileW = e.target.value ? Number(e.target.value) : null; state.tileProductKey = "custom"; state.tileCustomName = ""; renderDrawer(); };
      if (hIn) hIn.onchange = (e) => { state.tileH = e.target.value ? Number(e.target.value) : null; state.tileProductKey = "custom"; state.tileCustomName = ""; renderDrawer(); };
      if (bIn) bIn.onchange = (e) => { state.tileBoxSqft = e.target.value ? Number(e.target.value) : null; renderDrawer(); };
      if (pIn) pIn.onchange = (e) => { state.tilePriceSqft = e.target.value ? Number(e.target.value) : null; renderDrawer(); };

      // Wire Orientation, Pattern, Waste, Zero-Metal Edge & Collapsed Calculate Materials
      document.querySelectorAll("[data-torient]").forEach(b => {
        b.onclick = () => {
          state.tileOrient = b.dataset.torient;
          if ((state.tileOrient === "diagonal" || state.tileOrient === "herringbone") && state.tileWastePct < 20) {
            state.tileWastePct = 20;
          }
          renderDrawer();
        };
      });
      document.querySelectorAll("[data-tpat]").forEach(b => b.onclick = () => { state.tilePattern = b.dataset.tpat; renderDrawer(); });
      document.querySelectorAll("[data-twaste]").forEach(b => b.onclick = () => { state.tileWastePct = Number(b.dataset.twaste); renderDrawer(); });
      document.querySelectorAll("[data-ttrim]").forEach(b => b.onclick = () => { state.tileTrim = b.dataset.ttrim; renderDrawer(); });
      document.getElementById("tileTrimCeilBtn").onclick = () => { state.tileTrimCeiling = !state.tileTrimCeiling; renderDrawer(); };
      wireCalcMaterials();
      wireInteractiveSvgMarks("tile-plan", "s5Svg", "s5SvgWrap");

    } else {
      const backTarget = state.prevPlanBeforeManual || "ks4-live";
      toolEl.innerHTML = `
        <button class="mini-btn" id="manualBackTopBtn" type="button">← ${es ? "Volver al plan" : "Back to plan"}</button>
        <span style="font-weight:600;color:var(--ink);flex:1;text-align:center">${es ? active.titleEs : active.titleEn}</span>
        ${active.driveUrl ? `<a class="mini-btn primary" href="${active.driveUrl}" target="_blank" rel="noopener">${es ? "Abrir PDF ↗" : "Open PDF ↗"}</a>` : ""}
      `;
      document.getElementById("manualBackTopBtn").onclick = () => { state.prevPlanBeforeManual = null; openPlan(backTarget); };
      bodyEl.innerHTML = `
        <div class="sheet-card">
          <div class="sheet-head">
            <div>
              <div class="sheet-title">${es ? active.titleEs : active.titleEn}</div>
              <div class="sheet-sub">${es ? active.subEs : active.subEn}</div>
            </div>
            <button class="mini-btn" id="manualBackCardBtn" type="button">← ${es ? "Regresar" : "Back"}</button>
          </div>
          ${active.pages.map((pg) => `
            <div style="padding:10px 0;border-bottom:1px solid var(--rule)">
              <div style="font-size:13.5px;font-weight:700;color:var(--ink);margin-bottom:4px">${es ? (pg.titleEs || pg.titleEn || pg.title) : (pg.titleEn || pg.title)}</div>
              <p style="margin:0;font-size:13px;color:var(--ink-2);line-height:1.5">${es ? (pg.bodyEs || pg.bodyEn || pg.body) : (pg.bodyEn || pg.body)}</p>
            </div>
          `).join("")}
          <div class="manual-links" style="margin-top:12px">
            <button class="manual-link" id="manualBackFootBtn" type="button" style="cursor:pointer">← ${es ? "Volver a la pantalla anterior" : "Return to previous screen"}</button>
            ${active.driveUrl ? `<a class="manual-link" href="${active.driveUrl}" target="_blank" rel="noopener">↗ ${es ? "Abrir manual oficial completo" : "Open full official manual"}</a>` : ""}
            ${active.specUrl ? `<a class="manual-link" href="${active.specUrl}" target="_blank" rel="noopener">↗ ${es ? "Abrir ficha técnica" : "Open spec sheet / portal"}</a>` : ""}
          </div>
          ${renderSheetPager(active.id)}
        </div>
      `;
      document.getElementById("manualBackCardBtn").onclick = () => { state.prevPlanBeforeManual = null; openPlan(backTarget); };
      document.getElementById("manualBackFootBtn").onclick = () => { state.prevPlanBeforeManual = null; openPlan(backTarget); };
    }

    // Wire sheet-to-sheet navigation buttons inside drawer body!
    bodyEl.querySelectorAll("[data-jump-sheet]").forEach(btn => {
      btn.onclick = () => openPlan(btn.dataset.jumpSheet);
    });
  }

  function applyHashRoute() {
    const h = (window.location.hash || "").replace(/^#/, "");
    if (h === "view=blueprint") {
      setAppMode("blueprint");
      return;
    }
    const STEP_ALIASES = {
      layout: "ks4-live",
      wall: "ks4-live",
      blocking: "hood-s1",
      hood: "hood-s2",
      vent: "hood-s2",
      gas: "range-gas",
      outlet: "range-gas",
      tile: "tile-plan"
    };
    const m = h.match(/^step=([a-z0-9-]+)$/i);
    if (m) {
      const key = STEP_ALIASES[m[1].toLowerCase()] || m[1];
      if (PLANS[key]) openPlan(key);
    }
  }

  function boot5StepGuide() {
    if (params.get("print") === "1") {
      setAppMode("blueprint");
      return;
    }
    document.getElementById("u4gLangBtn")?.addEventListener("click", () => {
      state.lang = state.lang === "en" ? "es" : "en";
      if (window.U4PLAN && typeof window.U4PLAN.setLang === "function") {
        window.U4PLAN.setLang(state.lang);
      }
      renderAll();
    });
    document.getElementById("u4gThemeBtn")?.addEventListener("click", () => {
      state.theme = state.theme === "light" ? "dark" : "light";
      renderTopChrome();
    });
    document.getElementById("u4gPdfBtn")?.addEventListener("click", triggerBlueprintPdfExport);
    document.getElementById("u4gBlueprintBtn")?.addEventListener("click", () => setAppMode("blueprint"));
    document.getElementById("u4gBpReturnBtn")?.addEventListener("click", () => setAppMode("guide"));

    // Keep EN/ES toggle inside Blueprint view synced back to 5-step guide too!
    document.getElementById("btn-lang")?.addEventListener("click", () => {
      setTimeout(() => {
        if (window.U4PLAN && typeof window.U4PLAN.getLang === "function") {
          state.lang = window.U4PLAN.getLang() === "es" ? "es" : "en";
          renderAll();
        }
      }, 20);
    });

    if (window.U4PlanNav && document.getElementById("u4hTopbar")) {
      window.U4PlanNav.init({
        planId: "kitchen-west-ks4",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: (l) => {
          state.lang = l === "es" ? "es" : "en";
          if (window.U4PLAN && typeof window.U4PLAN.setLang === "function") window.U4PLAN.setLang(state.lang);
          renderAll();
          if (window.U4LiveAi) window.U4LiveAi.refreshPrompts();
        },
        onThemeChange: (th) => {
          state.theme = th === "dark" ? "dark" : "light";
          renderTopChrome();
        }
      });
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "kitchen-west-ks4",
        room: "kitchen-oven-range",
        titleEn: "Kitchen West Range & Hood Wall",
        titleEs: "Cocina: Muro de Estufa y Campana",
        getContext: () => "Step=" + (currentSheetKey() || state.activeTab) + ", HoodBottomAFF=" + state.hoodAff + "in, FloorInstalled=" + state.floorInstalled + ", StudLayout=" + state.studLayout + ", DuctMode=" + state.ductMode + ", TileTrim=" + state.tileTrim + " (zero metal trim, zero 45deg miter).",
        quickPrompts: (lang) => lang === "es"
          ? ["¿Altura del bloque 2×10 desde subpiso?", "¿Dónde va la caja 15A de la campana?", "¿Por qué cero metal en la orilla del azulejo?"]
          : ["What height is the 2×10 block off bare subfloor?", "Where does the 15A hood box go?", "Why zero metal edge trim on the tile?"]
      });
    }
    setAppMode("guide");
    renderAll();
    applyHashRoute();
    window.addEventListener("hashchange", applyHashRoute);

    window.U4GUIDE = {
      getStep: () => state.activeTab === "range-hood-plan" ? state.installStep : state.activeTab,
      openStep: (id) => openPlan(id),
      setLang: (l) => { state.lang = l === "es" ? "es" : "en"; if (window.U4PLAN) window.U4PLAN.setLang(state.lang); renderAll(); },
      setMode: (m) => setAppMode(m)
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot5StepGuide);
  } else {
    boot5StepGuide();
  }
})();
