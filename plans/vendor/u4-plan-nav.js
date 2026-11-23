/* ============================================================================
   Unit 4 Interactive Plans — Unified Top Bar, Sibling Switcher, Print Bridge
   & Persistent Shell Iframe Bridge (Two Distinct Attic & HVAC Plans)
   ============================================================================ */
(function () {
  "use strict";

  var LEGACY_PLAN_ALIASES = {
    "attic-hvac": "hvac-layout"
  };

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
      roomEn: "Attic Access",
      roomEs: "Acceso Ático",
      shortEn: "1. Hatch & Wood Walkway",
      shortEs: "1. Escotilla y Pasillo",
      labelEn: "Attic Hatch, Wood Walkway & Platform",
      labelEs: "Escotilla del Ático, Pasillo de Madera y Plataforma",
      group: "attic-hvac"
    },
    {
      id: "hvac-layout",
      rel: "../hvac-layout/index.html",
      roomHash: "hvac",
      roomEn: "Heating / HVAC",
      roomEs: "Calefacción",
      shortEn: "2. Furnace, Ducts & Exhaust",
      shortEs: "2. Calefactor, Ductos y Salida",
      labelEn: "Heating System: Furnace, Ducts & Sidewall Exhaust",
      labelEs: "Sistema de Calefacción: Calefactor, Ductos y Salida Lateral",
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

  function normalizePlanId(id) {
    var clean = String(id || "").trim();
    return LEGACY_PLAN_ALIASES[clean] || clean;
  }

  function readPref(key) {
    return null;
  }

  function writePref(key, val) {

  }

  function resolveInitialLang(urlParams) {
    var q = (urlParams.get("lang") || "").toLowerCase();
    if (q === "es" || q.indexOf("es-") === 0 || q === "en" || q.indexOf("en-") === 0) {
      var norm = q.indexOf("es") === 0 ? "es" : "en";
      writePref("u4_lang", norm);
      return norm;
    }
    var stored = (readPref("u4_lang") || "").toLowerCase();
    if (stored === "es" || stored === "en") return stored;
    return "en";
  }

  function resolveInitialTheme(urlParams) {
    var q = (urlParams.get("theme") || "").toLowerCase();
    if (q === "dark" || q === "light") {
      writePref("u4_theme", q);
      return q;
    }
    var stored = (readPref("u4_theme") || "").toLowerCase();
    if (stored === "dark" || stored === "light") return stored;
    try {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch (_) {}
    return "light";
  }

  function detectPlanIdFromPath() {
    var path = String(window.location.pathname || "");
    if (path.indexOf("/attic-hatch/") >= 0) return "attic-hatch";
    if (path.indexOf("/hvac-layout/") >= 0 || path.indexOf("/attic-hvac/") >= 0) return "hvac-layout";
    for (var i = 0; i < ALL_PLANS.length; i++) {
      if (path.indexOf("/" + ALL_PLANS[i].id + "/") >= 0) return ALL_PLANS[i].id;
    }
    return "kitchen-floor-plan";
  }

  var params = new URLSearchParams(window.location.search || "");
  var initialPlanId = detectPlanIdFromPath();
  var initialLang = resolveInitialLang(params);
  var initialTheme = resolveInitialTheme(params);
  var isTopLevel = false;
  try { isTopLevel = (window.self === window.top); } catch (_) { isTopLevel = false; }
  var isEmbedded = !isTopLevel || params.has("embedded");

  if (
    isTopLevel &&
    !params.has("print") &&
    !params.has("standalone") &&
    !params.has("embedded") &&
    window.location.hash !== "#view=blueprint" &&
    window.location.protocol !== "file:"
  ) {
    var hashParts = [];
    if (params.get("step")) hashParts.push("step=" + encodeURIComponent(params.get("step")));
    if (params.get("wall")) hashParts.push("wall=" + encodeURIComponent(params.get("wall")));
    if (params.get("zoom")) hashParts.push("zoom=" + encodeURIComponent(params.get("zoom")));
    var wrapTarget =
      "../../index.html?lang=" + encodeURIComponent(initialLang) +
      "&theme=" + encodeURIComponent(initialTheme) +
      "#plan:" + encodeURIComponent(initialPlanId) +
      (hashParts.length ? "?" + hashParts.join("&") : "");
    try {
      window.location.replace(wrapTarget);
    } catch (_) {}
  }

  var state = {
    planId: initialPlanId,
    lang: initialLang,
    theme: initialTheme,
    mode: params.get("print") === "1" ? "blueprint" : "human",
    menuOpen: false,
    onLangChange: null,
    onThemeChange: null,
    headerEl: null,
    ctxTimer: null
  };

  document.documentElement.lang = state.lang;
  document.documentElement.setAttribute("data-theme", state.theme);
  if (isEmbedded) {
    document.documentElement.setAttribute("data-u4-embedded", "1");
  }

  function postToParent(payload) {
    if (!isEmbedded || !window.parent || window.parent === window) return;
    try {
      window.parent.postMessage(payload, "*");
    } catch (_) {}
  }

  function getPlanMeta(id) {
    var norm = normalizePlanId(id);
    for (var i = 0; i < ALL_PLANS.length; i++) {
      if (ALL_PLANS[i].id === norm) return ALL_PLANS[i];
    }
    return ALL_PLANS[0];
  }

  function matchPlanIdFromHref(href) {
    if (!href) return null;
    if (href.indexOf("/attic-hatch/") >= 0 || href.indexOf("attic-hatch/index.html") >= 0) return "attic-hatch";
    if (
      href.indexOf("/hvac-layout/") >= 0 || href.indexOf("hvac-layout/index.html") >= 0 ||
      href.indexOf("/attic-hvac/") >= 0 || href.indexOf("attic-hvac/index.html") >= 0
    ) {
      return "hvac-layout";
    }
    for (var i = 0; i < ALL_PLANS.length; i++) {
      if (href.indexOf("/" + ALL_PLANS[i].id + "/") >= 0 || href.indexOf(ALL_PLANS[i].id + "/index.html") >= 0) {
        return ALL_PLANS[i].id;
      }
    }
    return null;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function planUrl(id) {
    var norm = normalizePlanId(id);
    var m = getPlanMeta(norm);
    var suffix = params.has("standalone") ? "&standalone=1" : (params.has("embedded") ? "&embedded=1" : "");
    return m.rel + "?lang=" + state.lang + "&theme=" + state.theme + suffix;
  }

  function wikiBackUrl() {
    var m = getPlanMeta(state.planId);
    return "../../index.html?lang=" + state.lang + "&theme=" + state.theme + "#" + m.roomHash;
  }

  function syncUrlSearchParams() {
    try {
      var next = new URLSearchParams(window.location.search || "");
      next.set("lang", state.lang);
      next.set("theme", state.theme);
      var nextUrl = "?" + next.toString() + (window.location.hash || "");
      window.history.replaceState(null, "", nextUrl);
    } catch (_) {}
  }

  function applyThemeAndLang() {
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-theme", state.theme);
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
        try { btnPdf.click(); } catch (_) { window.print(); }
      } else {
        window.print();
      }
      setTimeout(function () {
        if (prev === "human" && params.get("print") !== "1") setMode("human");
      }, 900);
    }, 120);
  }

  function closeAllPlansMenu(returnFocus) {
    if (!state.menuOpen) return;
    state.menuOpen = false;
    var pop = document.getElementById("u4hAllPlansPop");
    var btn = document.getElementById("u4hAllPlansBtn");
    if (pop) pop.hidden = true;
    if (btn) {
      btn.setAttribute("aria-expanded", "false");
      if (returnFocus) btn.focus();
    }
  }

  function getFullPlanState() {
    var cur = getPlanMeta(state.planId);
    var ctrlState = (window.U4PlanControl && typeof window.U4PlanControl.getState === "function")
      ? window.U4PlanControl.getState()
      : {};
    var zoom = (window.U4ZoomPan && typeof window.U4ZoomPan.getPrimaryZoom === "function")
      ? window.U4ZoomPan.getPrimaryZoom()
      : 1;
    return Object.assign({
      planId: state.planId,
      room: cur.roomHash,
      title: state.lang === "es" ? cur.labelEs : cur.labelEn,
      lang: state.lang,
      theme: state.theme,
      zoom: Math.round(zoom * 100) + "%",
      zoomScale: zoom
    }, ctrlState || {});
  }

  function reportPlanContext(extra) {
    if (!isEmbedded) return;
    clearTimeout(state.ctxTimer);
    state.ctxTimer = setTimeout(function () {
      var full = getFullPlanState();
      if (extra && typeof extra === "object") Object.assign(full, extra);
      postToParent({
        type: "u4:plan-context",
        planId: full.planId,
        room: full.room,
        title: full.title,
        step: full.step || "",
        wall: full.wall || "",
        zoom: full.zoom || "100%",
        summary: full.summary || "",
        state: full
      });
    }, 40);
  }

  function drawPinOverlaysOnCanvas(ctx, hostEl, canvasW, canvasH) {
    if (!hostEl) return;
    var dots = hostEl.querySelectorAll(".u4-pin-dot");
    if (!dots || !dots.length) return;
    for (var i = 0; i < dots.length; i++) {
      var xPct = parseFloat(dots[i].style.left);
      var yPct = parseFloat(dots[i].style.top);
      if (!isFinite(xPct) || !isFinite(yPct)) continue;
      var cx = (xPct / 100) * canvasW;
      var cy = (yPct / 100) * canvasH;
      var r = Math.max(14, Math.round(canvasW * 0.018));
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(168, 40, 28, 0.16)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = "#a8281c";
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(9, Math.round(r * 0.56)), 0, Math.PI * 2);
      ctx.fillStyle = "#a8281c";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold " + Math.max(11, Math.round(r * 0.72)) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), cx, cy + 1);
      ctx.restore();
    }
  }

  function captureActivePlanSnapshot(opts) {
    opts = opts || {};
    var full = getFullPlanState();
    var targetPref = String(opts.target || "").toLowerCase();
    var root = document.getElementById("u4hBody") || document.getElementById("u4gBody") || document.body;
    var svgEl = null;
    var imgEl = null;

    if (targetPref === "photo") imgEl = root.querySelector(".u4h-photo-card img");
    if (!imgEl) {
      var svgs = root.querySelectorAll(".u4h-svg-wrap svg, .ks4-svg-wrap svg, svg");
      for (var i = 0; i < svgs.length; i++) {
        var r = svgs[i].getBoundingClientRect();
        if (r.width > 40 && r.height > 40) { svgEl = svgs[i]; break; }
      }
      if (!svgEl) imgEl = root.querySelector(".u4h-photo-card img, img");
    }

    var label = opts.label || (full.title + (full.wall ? " (" + full.wall + ")" : "") + (full.step ? " — " + full.step : ""));

    return new Promise(function (resolve) {
      function fallbackCanvas(errNote) {
        var c = document.createElement("canvas");
        c.width = 800;
        c.height = 420;
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.strokeStyle = "#1f5f7a";
        ctx.lineWidth = 4;
        ctx.strokeRect(12, 12, c.width - 24, c.height - 24);
        ctx.fillStyle = "#1d2326";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(label.slice(0, 60), 32, 70);
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#5d686d";
        ctx.fillText(String(full.summary || errNote || "Unit 4 Interactive Plan").slice(0, 96), 32, 118);
        var dataUrl = c.toDataURL("image/jpeg", 0.85);
        resolve({
          dataUrl: dataUrl, base64: dataUrl.split(",")[1] || "", mimeType: "image/jpeg",
          width: c.width, height: c.height, planId: full.planId, step: full.step || "", wall: full.wall || "", label: label
        });
      }

      if (svgEl) {
        try {
          var hostEl = svgEl.closest(".u4h-svg-wrap, .ks4-svg-wrap");
          var vb = svgEl.viewBox && svgEl.viewBox.baseVal;
          var vbW = (vb && vb.width) ? vb.width : (svgEl.getBoundingClientRect().width || 460);
          var vbH = (vb && vb.height) ? vb.height : (svgEl.getBoundingClientRect().height || 300);
          var outW = Math.min(1200, Math.max(640, Math.round(vbW * 2)));
          var outH = Math.max(320, Math.round((outW / vbW) * vbH));

          var clone = svgEl.cloneNode(true);
          clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          clone.setAttribute("width", String(outW));
          clone.setAttribute("height", String(outH));
          if (!clone.getAttribute("viewBox")) clone.setAttribute("viewBox", "0 0 " + vbW + " " + vbH);
          var styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
          styleEl.textContent = "text{font-family:'IBM Plex Sans',-apple-system,BlinkMacSystemFont,Arial,sans-serif;}";
          clone.insertBefore(styleEl, clone.firstChild);

          var xml = new XMLSerializer().serializeToString(clone);
          var svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
          var img = new Image();
          img.onload = function () {
            try {
              var canvas = document.createElement("canvas");
              canvas.width = outW;
              canvas.height = outH;
              var ctx = canvas.getContext("2d");
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, outW, outH);
              ctx.drawImage(img, 0, 0, outW, outH);
              drawPinOverlaysOnCanvas(ctx, hostEl, outW, outH);
              var dataUrl = canvas.toDataURL("image/jpeg", 0.86);
              resolve({
                dataUrl: dataUrl, base64: dataUrl.split(",")[1] || "", mimeType: "image/jpeg",
                width: outW, height: outH, planId: full.planId, step: full.step || "", wall: full.wall || "", label: label
              });
            } catch (e) { fallbackCanvas(String(e)); }
          };
          img.onerror = function () { fallbackCanvas("svg_render_error"); };
          img.src = svgDataUrl;
          return;
        } catch (e) { fallbackCanvas(String(e)); return; }
      }

      if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
        try {
          var photoHost = imgEl.closest(".u4h-photo-card");
          var scale = Math.min(1, 1200 / imgEl.naturalWidth);
          var pw = Math.max(320, Math.round(imgEl.naturalWidth * scale));
          var ph = Math.max(240, Math.round(imgEl.naturalHeight * scale));
          var c2 = document.createElement("canvas");
          c2.width = pw;
          c2.height = ph;
          var ctx2 = c2.getContext("2d");
          ctx2.fillStyle = "#ffffff";
          ctx2.fillRect(0, 0, pw, ph);
          ctx2.drawImage(imgEl, 0, 0, pw, ph);
          drawPinOverlaysOnCanvas(ctx2, photoHost, pw, ph);
          var d2 = c2.toDataURL("image/jpeg", 0.86);
          resolve({
            dataUrl: d2, base64: d2.split(",")[1] || "", mimeType: "image/jpeg",
            width: pw, height: ph, planId: full.planId, step: full.step || "", wall: full.wall || "", label: label
          });
          return;
        } catch (e) { fallbackCanvas(String(e)); return; }
      }

      fallbackCanvas("no_visual_element");
    });
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
          return '<a class="u4h-seg-item' + (active ? " is-active" : "") + '" data-plan-id="' + s.id + '" href="' + esc(planUrl(s.id)) + '"' + (active ? ' aria-current="page"' : "") + '>' +
            esc(es ? s.shortEs : s.shortEn) + '</a>';
        }).join("") +
      "</div>";
    }

    var menuHtml = '<div class="u4h-plans-menu">' +
      '<button type="button" id="u4hAllPlansBtn" class="u4h-plans-btn" aria-expanded="' + (state.menuOpen ? "true" : "false") + '" aria-controls="u4hAllPlansPop">' +
        (es ? "Todos los planos ▾" : "All Plans ▾") +
      "</button>" +
      '<div id="u4hAllPlansPop" class="u4h-plans-pop"' + (state.menuOpen ? "" : " hidden") + ">" +
        ALL_PLANS.map(function (p) {
          var isCur = p.id === cur.id;
          return '<a href="' + esc(planUrl(p.id)) + '" data-plan-id="' + p.id + '" class="' + (isCur ? "is-current" : "") + '">' +
            '<span>' + (isCur ? "✓ " : "") + esc(es ? p.labelEs : p.labelEn) + "</span>" +
            '<span class="u4h-pop-room">' + esc(es ? p.roomEs : p.roomEn) + "</span>" +
          "</a>";
        }).join("") +
      "</div>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-nav-left">' +
        '<a class="u4h-nav-link" id="u4hBackLink" href="' + esc(wikiBackUrl()) + '">&larr; ' + esc(es ? ("Volver a " + cur.roomEs) : ("Back to " + cur.roomEn)) + "</a>" +
        segHtml +
        menuHtml +
      "</div>" +
      '<div class="u4h-nav-right">' +
        '<button type="button" id="u4hLangBtn" class="u4h-lang-btn u4h-seg-switch" role="switch" aria-checked="' + (es ? "true" : "false") + '" aria-label="' + (es ? "Switch to English" : "Cambiar a español") + '"><span class="u4-seg-thumb" aria-hidden="true"></span><span class="u4-seg-opt is-a">EN</span><span class="u4-seg-opt is-b">ES</span></button>' +
        '<button type="button" id="u4hThemeBtn" class="u4h-mini-btn u4h-seg-switch" role="switch" aria-checked="' + (state.theme === "dark" ? "true" : "false") + '" aria-label="' + (state.theme === "dark" ? (es ? "Cambiar a modo claro" : "Switch to light mode") : (es ? "Cambiar a modo oscuro" : "Switch to dark mode")) + '"><span class="u4-seg-thumb" aria-hidden="true"></span><span class="u4-seg-opt is-a"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"/></svg></span><span class="u4-seg-opt is-b"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.2 9.9A5.4 5.4 0 0 1 6.1 2.8a5.5 5.5 0 1 0 7.1 7.1Z"/></svg></span></button>' +
        '<button type="button" id="u4hPdfBtn" class="u4h-mini-btn primary u4h-pdf-compact" aria-label="' + (es ? "Imprimir o guardar PDF" : "Print or save PDF") + '"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6V2.5h8V6M4 11.5H2.5v-4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v4H12"/><rect x="4" y="9.5" width="8" height="4" rx="0.5"/></svg><span>PDF</span></button>' +
      "</div>";

    var backLink = document.getElementById("u4hBackLink");
    if (backLink && isEmbedded) {
      backLink.addEventListener("click", function (ev) {
        ev.preventDefault();
        postToParent({ type: "u4:nav-wiki", room: cur.roomHash, href: wikiBackUrl() });
      });
    }

    if (isEmbedded) {
      host.querySelectorAll("[data-plan-id]").forEach(function (a) {
        a.addEventListener("click", function (ev) {
          var targetId = normalizePlanId(a.getAttribute("data-plan-id"));
          if (!targetId) return;
          ev.preventDefault();
          closeAllPlansMenu(false);
          if (targetId !== state.planId) {
            postToParent({ type: "u4:nav-plan", planId: targetId });
          }
        });
      });
    }

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
      writePref("u4_lang", state.lang);
      syncUrlSearchParams();
      applyThemeAndLang();
      renderHeader();
      if (typeof state.onLangChange === "function") state.onLangChange(state.lang);
      postToParent({ type: "u4:sync-pref", lang: state.lang, theme: state.theme });
      reportPlanContext();
    });

    document.getElementById("u4hThemeBtn").addEventListener("click", function () {
      state.theme = state.theme === "dark" ? "light" : "dark";
      writePref("u4_theme", state.theme);
      syncUrlSearchParams();
      applyThemeAndLang();
      renderHeader();
      if (typeof state.onThemeChange === "function") state.onThemeChange(state.theme);
      postToParent({ type: "u4:sync-pref", lang: state.lang, theme: state.theme });
    });

    document.getElementById("u4hPdfBtn").addEventListener("click", triggerPrintPdf);
  }

  document.addEventListener("click", function (ev) {
    if (state.menuOpen) {
      var pop = document.getElementById("u4hAllPlansPop");
      var btn = document.getElementById("u4hAllPlansBtn");
      if (pop && !pop.contains(ev.target) && btn && !btn.contains(ev.target)) {
        closeAllPlansMenu(false);
      }
    }
    if (!isEmbedded) return;
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a || (state.headerEl && state.headerEl.contains(a))) return;
    var href = a.getAttribute("href") || "";
    var targetPlan = matchPlanIdFromHref(href);
    if (targetPlan) {
      ev.preventDefault();
      postToParent({ type: "u4:nav-plan", planId: targetPlan });
      return;
    }
    if (href.indexOf("../../index.html") === 0) {
      ev.preventDefault();
      var hashPart = href.indexOf("#") >= 0 ? href.split("#")[1] : getPlanMeta(state.planId).roomHash;
      postToParent({ type: "u4:nav-wiki", room: hashPart, href: href });
    }
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && state.menuOpen) {
      ev.preventDefault();
      closeAllPlansMenu(true);
    }
  });

  window.addEventListener("message", async function (ev) {
    var msg = ev && ev.data;
    if (!msg || typeof msg !== "object" || typeof msg.type !== "string") return;

    if (msg.type === "u4:set-pref") {
      var langChanged = false;
      var themeChanged = false;
      if ((msg.lang === "en" || msg.lang === "es") && msg.lang !== state.lang) {
        state.lang = msg.lang;
        writePref("u4_lang", state.lang);
        langChanged = true;
      }
      if ((msg.theme === "light" || msg.theme === "dark") && msg.theme !== state.theme) {
        state.theme = msg.theme;
        writePref("u4_theme", state.theme);
        themeChanged = true;
      }
      if (langChanged || themeChanged) {
        syncUrlSearchParams();
        applyThemeAndLang();
        renderHeader();
        if (langChanged && typeof state.onLangChange === "function") state.onLangChange(state.lang);
        if (themeChanged && typeof state.onThemeChange === "function") state.onThemeChange(state.theme);
        reportPlanContext();
      }
      return;
    }

    if (msg.type === "u4:plan-cmd") {
      var cmd = String(msg.cmd || "");
      var reqId = msg.id || null;
      var args = (msg.args && typeof msg.args === "object") ? msg.args : msg;
      try {
        if (cmd === "show_plan_view") {
          if (window.U4PlanControl && typeof window.U4PlanControl.showView === "function") {
            window.U4PlanControl.showView(args);
          }
          if (args.zoom != null && args.zoom !== "" && window.U4ZoomPan) {
            window.U4ZoomPan.setPrimaryZoom(args.zoom);
          }
          var stView = getFullPlanState();
          reportPlanContext();
          postToParent({ type: "u4:plan-cmd-result", id: reqId, ok: true, cmd: cmd, result: stView });
          return;
        }

        if (cmd === "update_plan_state") {
          var handled = false;
          if (window.U4PlanControl && typeof window.U4PlanControl.applyChange === "function") {
            handled = window.U4PlanControl.applyChange(args) !== false;
          }
          var actLow = String(args.action || "").toLowerCase();
          if ((actLow === "zoom" || actLow === "set_zoom" || String(args.target || "").toLowerCase() === "zoom") && window.U4ZoomPan) {
            window.U4ZoomPan.setPrimaryZoom(args.value != null ? args.value : args.zoom);
            handled = true;
          }
          var stUpd = getFullPlanState();
          reportPlanContext();
          postToParent({ type: "u4:plan-cmd-result", id: reqId, ok: true, cmd: cmd, handled: handled, result: stUpd });
          return;
        }

        if (cmd === "get_plan_state") {
          postToParent({ type: "u4:plan-cmd-result", id: reqId, ok: true, cmd: cmd, result: getFullPlanState() });
          return;
        }

        if (cmd === "capture_snapshot" || cmd === "capture_screen_snapshot") {
          var snap = await captureActivePlanSnapshot(args);
          postToParent({ type: "u4:plan-cmd-result", id: reqId, ok: true, cmd: cmd, result: snap });
          return;
        }

        postToParent({ type: "u4:plan-cmd-result", id: reqId, ok: false, cmd: cmd, error: "unknown_cmd" });
      } catch (err) {
        postToParent({ type: "u4:plan-cmd-result", id: reqId, ok: false, cmd: cmd, error: String(err && err.message ? err.message : err) });
      }
    }
  });

  window.addEventListener("storage", function (ev) {
    if (!ev || !ev.key) return;
    if (ev.key === "u4_lang" && (ev.newValue === "en" || ev.newValue === "es") && ev.newValue !== state.lang) {
      state.lang = ev.newValue;
      syncUrlSearchParams();
      applyThemeAndLang();
      renderHeader();
      if (typeof state.onLangChange === "function") state.onLangChange(state.lang);
    } else if (ev.key === "u4_theme" && (ev.newValue === "light" || ev.newValue === "dark") && ev.newValue !== state.theme) {
      state.theme = ev.newValue;
      syncUrlSearchParams();
      applyThemeAndLang();
      renderHeader();
      if (typeof state.onThemeChange === "function") state.onThemeChange(state.theme);
    }
  });

  window.U4PlanNav = {
    ALL_PLANS: ALL_PLANS,
    init: function (opts) {
      opts = opts || {};
      if (opts.planId) state.planId = normalizePlanId(opts.planId);
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
        if (params.get("print") !== "1" && window.location.hash !== "#view=blueprint") setMode("human");
      });

      reportPlanContext();
    },
    getLang: function () { return state.lang; },
    getTheme: function () { return state.theme; },
    getPlanId: function () { return state.planId; },
    isEmbedded: function () { return isEmbedded; },
    getBootParams: function () {
      return {
        step: params.get("step") || "",
        wall: params.get("wall") || "",
        zoom: params.get("zoom") || ""
      };
    },
    postToParent: postToParent,
    reportPlanContext: reportPlanContext,
    captureActivePlanSnapshot: captureActivePlanSnapshot,
    planUrl: planUrl,
    wikiBackUrl: wikiBackUrl,
    renderHeader: renderHeader,
    setMode: setMode,
    triggerPrintPdf: triggerPrintPdf
  };
})();
