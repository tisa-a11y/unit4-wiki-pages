/* ============================================================================
   Unit 4 Interactive Plans — Unified Top Bar, Sibling Switcher & Print Bridge
   Seamless ?lang= & ?theme= Handoff · Zero Storage · Zero External CDNs
   ============================================================================ */
(function () {
  "use strict";

  var ALL_PLANS = [
    {
      id: "kitchen-west-ks4",
      rel: "../kitchen-west-ks4/index.html",
      roomHash: "kitchen-oven-range",
      roomEn: "Kitchen",
      roomEs: "Cocina",
      shortEn: "Range & Hood Wall",
      shortEs: "Estufa y Campana",
      labelEn: "Kitchen West Range & Hood Wall",
      labelEs: "Cocina: Muro de Estufa y Campana",
      group: "kitchen"
    },
    {
      id: "kitchen-floor-plan",
      rel: "../kitchen-floor-plan/index.html",
      roomHash: "kitchen",
      roomEn: "Kitchen",
      roomEs: "Cocina",
      shortEn: "Floor Plan & Cabinets",
      shortEs: "Planta y Gabinetes",
      labelEn: "Kitchen Floor Plan & Cabinet Schedule",
      labelEs: "Cocina: Planta y Lista de Gabinetes",
      group: "kitchen"
    },
    {
      id: "kitchen-electrical",
      rel: "../kitchen-electrical/index.html",
      roomHash: "electrical",
      roomEn: "Kitchen / Elec",
      roomEs: "Cocina / Eléc.",
      shortEn: "Kitchen Electrical",
      shortEs: "Eléctrico Cocina",
      labelEn: "Kitchen Electrical & Subpanel D04",
      labelEs: "Cocina: Eléctrico y Subpanel D04",
      group: "kitchen"
    },
    {
      id: "attic-hatch",
      rel: "../attic-hatch/index.html",
      roomHash: "attic-access",
      roomEn: "Attic",
      roomEs: "Ático",
      shortEn: "Attic Hatch",
      shortEs: "Escotilla Ático",
      labelEn: "Permanent Attic Hatch & Walkway",
      labelEs: "Escotilla Permanente del Ático y Pasillo",
      group: "attic-hvac"
    },
    {
      id: "hvac-layout",
      rel: "../hvac-layout/index.html",
      roomHash: "hvac",
      roomEn: "HVAC",
      roomEs: "Calefacción",
      shortEn: "Furnace & Ducts",
      shortEs: "Calefacción y Ductos",
      labelEn: "Attic Furnace & Ductwork Layout",
      labelEs: "Calefacción y Ductos en Ático",
      group: "attic-hvac"
    },
    {
      id: "murphy-door",
      rel: "../murphy-door/index.html",
      roomHash: "laundry",
      roomEn: "Laundry Closet",
      roomEs: "Lavandería",
      shortEn: "Murphy Bookcase Door",
      shortEs: "Puerta Librero Murphy",
      labelEn: "Murphy Bookcase Door (Hallway B)",
      labelEs: "Puerta Librero Murphy (Pasillo B)",
      group: "laundry"
    }
  ];

  var params = new URLSearchParams(window.location.search || "");
  var state = {
    planId: "kitchen-floor-plan",
    lang: (params.get("lang") || "").toLowerCase().indexOf("es") === 0 ? "es" : "en",
    theme: (params.get("theme") || "").toLowerCase() === "dark" ? "dark" : "light",
    mode: params.get("print") === "1" ? "blueprint" : "human",
    menuOpen: false,
    onLangChange: null,
    onThemeChange: null,
    headerEl: null
  };

  function getPlanMeta(id) {
    for (var i = 0; i < ALL_PLANS.length; i++) {
      if (ALL_PLANS[i].id === id) return ALL_PLANS[i];
    }
    return ALL_PLANS[0];
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function planUrl(id) {
    var m = getPlanMeta(id);
    return m.rel + "?lang=" + state.lang + "&theme=" + state.theme;
  }

  function wikiBackUrl() {
    var m = getPlanMeta(state.planId);
    return "../../index.html?lang=" + state.lang + "&theme=" + state.theme + "#" + m.roomHash;
  }

  function applyThemeAndLang() {
    document.documentElement.lang = state.lang;
    if (state.theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    if (window.U4LiveAi && typeof window.U4LiveAi.setLang === "function") {
      window.U4LiveAi.setLang(state.lang);
    }
    if (window.U4PLAN && typeof window.U4PLAN.setLang === "function") {
      try {
        if (typeof window.U4PLAN.getLang !== "function" || window.U4PLAN.getLang() !== state.lang) {
          window.U4PLAN.setLang(state.lang);
        }
      } catch (_) {}
    }
  }

  function setMode(mode) {
    state.mode = mode === "blueprint" ? "blueprint" : "human";
    document.body.classList.toggle("u4-mode-human", state.mode === "human");
    document.body.classList.toggle("u4-mode-blueprint", state.mode === "blueprint");
    var bpShell = document.getElementById("blueprint-sheet-shell");
    if (bpShell) bpShell.hidden = state.mode !== "blueprint";
    var retLbl = document.getElementById("u4gBpReturnLabel");
    var retBtn = document.getElementById("u4gBpReturnBtn");
    if (retLbl) retLbl.textContent = state.lang === "es" ? "Viendo plano técnico de impresión" : "Viewing Technical Print Blueprint";
    if (retBtn) retBtn.textContent = state.lang === "es" ? "← Volver a la guía interactiva" : "← Back to Interactive Guide";
    if (state.mode === "blueprint" && window.U4PLAN && typeof window.U4PLAN.render === "function") {
      try { window.U4PLAN.render(); } catch (_) {}
    }
  }

  function triggerPrintPdf() {
    var prev = state.mode;
    setMode("blueprint");
    setTimeout(function () {
      var btnPdf = document.getElementById("btn-download-pdf");
      if (btnPdf && window.U4KS4_PDF && typeof window.U4KS4_PDF.exportPdf === "function") {
        try {
          btnPdf.click();
        } catch (_) {
          window.print();
        }
      } else {
        window.print();
      }
      setTimeout(function () {
        if (prev === "human" && params.get("print") !== "1") {
          setMode("human");
        }
      }, 900);
    }, 120);
  }

  function renderHeader() {
    var host = state.headerEl;
    if (!host) return;
    var es = state.lang === "es";
    var cur = getPlanMeta(state.planId);
    var siblings = ALL_PLANS.filter(function (p) { return p.group === cur.group; });

    var segHtml = "";
    if (siblings.length > 1) {
      segHtml = '<div class="u4h-seg-switch" role="navigation" aria-label="' + (es ? "Planos relacionados" : "Related plans") + '">' +
        siblings.map(function (s) {
          var active = s.id === cur.id;
          return '<a class="u4h-seg-item' + (active ? " is-active" : "") + '" href="' + esc(planUrl(s.id)) + '"' + (active ? ' aria-current="page"' : "") + '>' +
            esc(es ? s.shortEs : s.shortEn) + '</a>';
        }).join("") +
        "</div>";
    }

    var menuHtml = '<div class="u4h-plans-menu">' +
      '<button type="button" id="u4hAllPlansBtn" class="u4h-plans-btn" aria-expanded="' + (state.menuOpen ? "true" : "false") + '">' +
        (es ? "Todos los planos ▾" : "All Plans ▾") +
      "</button>" +
      '<div id="u4hAllPlansPop" class="u4h-plans-pop"' + (state.menuOpen ? "" : " hidden") + ">" +
        ALL_PLANS.map(function (p) {
          var isCur = p.id === cur.id;
          return '<a href="' + esc(planUrl(p.id)) + '" class="' + (isCur ? "is-current" : "") + '">' +
            '<span>' + (isCur ? "✓ " : "") + esc(es ? p.labelEs : p.labelEn) + "</span>" +
            '<span class="u4h-pop-room">' + esc(es ? p.roomEs : p.roomEn) + "</span>" +
          "</a>";
        }).join("") +
      "</div>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-nav-left">' +
        '<a class="u4h-nav-link" href="' + esc(wikiBackUrl()) + '">&larr; ' + esc(es ? ("Volver a " + cur.roomEs) : ("Back to " + cur.roomEn)) + "</a>" +
        segHtml +
        menuHtml +
      "</div>" +
      '<div class="u4h-nav-right">' +
        '<button type="button" id="u4hLangBtn" class="u4h-lang-btn">' + (es ? "English (EN)" : "Español (MX)") + "</button>" +
        '<button type="button" id="u4hThemeBtn" class="u4h-mini-btn">' + (state.theme === "dark" ? (es ? "☀ Claro" : "☀ Light") : (es ? "☾ Oscuro" : "☾ Dark")) + "</button>" +
        '<button type="button" id="u4hPdfBtn" class="u4h-mini-btn primary">' + (es ? "Imprimir / PDF" : "Print / PDF") + "</button>" +
      "</div>";

    var allBtn = document.getElementById("u4hAllPlansBtn");
    var pop = document.getElementById("u4hAllPlansPop");
    if (allBtn && pop) {
      allBtn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        state.menuOpen = !state.menuOpen;
        pop.hidden = !state.menuOpen;
        allBtn.setAttribute("aria-expanded", state.menuOpen ? "true" : "false");
      });
    }

    document.getElementById("u4hLangBtn").addEventListener("click", function () {
      state.lang = state.lang === "en" ? "es" : "en";
      applyThemeAndLang();
      renderHeader();
      if (typeof state.onLangChange === "function") state.onLangChange(state.lang);
    });

    document.getElementById("u4hThemeBtn").addEventListener("click", function () {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyThemeAndLang();
      renderHeader();
      if (typeof state.onThemeChange === "function") state.onThemeChange(state.theme);
    });

    document.getElementById("u4hPdfBtn").addEventListener("click", triggerPrintPdf);
  }

  document.addEventListener("click", function (ev) {
    if (!state.menuOpen) return;
    var pop = document.getElementById("u4hAllPlansPop");
    var btn = document.getElementById("u4hAllPlansBtn");
    if (pop && !pop.contains(ev.target) && btn && !btn.contains(ev.target)) {
      state.menuOpen = false;
      pop.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });

  window.U4PlanNav = {
    ALL_PLANS: ALL_PLANS,
    init: function (opts) {
      opts = opts || {};
      if (opts.planId) state.planId = opts.planId;
      if (opts.headerEl) state.headerEl = opts.headerEl;
      if (opts.onLangChange) state.onLangChange = opts.onLangChange;
      if (opts.onThemeChange) state.onThemeChange = opts.onThemeChange;

      var retBtn = document.getElementById("u4gBpReturnBtn");
      if (retBtn) retBtn.addEventListener("click", function () { setMode("human"); });

      applyThemeAndLang();
      setMode(params.get("print") === "1" || window.location.hash === "#view=blueprint" ? "blueprint" : "human");
      renderHeader();

      window.addEventListener("beforeprint", function () {
        if (state.mode !== "blueprint") setMode("blueprint");
      });
      window.addEventListener("afterprint", function () {
        if (params.get("print") !== "1" && window.location.hash !== "#view=blueprint") {
          setMode("human");
        }
      });
    },
    getLang: function () { return state.lang; },
    getTheme: function () { return state.theme; },
    planUrl: planUrl,
    renderHeader: renderHeader,
    setMode: setMode,
    triggerPrintPdf: triggerPrintPdf
  };
})();
