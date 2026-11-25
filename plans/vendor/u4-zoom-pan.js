/* ============================================================================
   Unit 4 Interactive Plans — Smooth Zoom & Pan Engine
   Auto-mounts onto .u4h-svg-wrap, .ks4-svg-wrap & .u4h-photo-card across all 7 plans
   - Classic old-wiki [ − | 100% | + ] bar (100% to 300%, click % to reset)
   - Ctrl/⌘ + Wheel zoom around cursor (normal vertical scroll untouched!)
   - 2-Finger touch pinch-to-zoom around midpoint
   - Drag-to-pan ONLY when scale > 1× AND not armed for pin drop / dragging fixture
   - Keeps U4PinDragger pins & KS4 SVG marks locked 1:1 inside .u4-zoom-stage
   - Full EN | ES | RU localization
   ============================================================================ */
(function () {
  "use strict";

  var MIN_ZOOM = 1;
  var MAX_ZOOM = 3;
  var STEP = 0.5;
  var INTERACTIVE_SEL = [
    ".u4-drag-ns",
    ".u4-drag-ew",
    ".u4-drag-move",
    "[data-node]",
    "[data-mark-id]",
    "[data-resize-id]",
    "[data-r4-pt]",
    "[data-inspect]",
    ".u4-svg-clickable",
    ".mark-group",
    ".u4-pin-dot",
    ".u4-pin-pop",
    ".pin-steer",
    "button",
    "input",
    "select",
    "textarea",
    "a",
    '[role="button"]'
  ].join(", ");

  var instances = new WeakMap();
  var savedByKey = {};
  var lastActiveStepKey = "";
  var initialZoomApplied = false;
  var observers = [];

  function getActiveStepKey() {
    var btn = document.querySelector(".u4h-step-btn.is-active, .u4g-step-btn.is-active, .u4-step-tab.active, .step-tab.active");
    if (btn) return btn.getAttribute("data-step") || btn.textContent.trim().slice(0, 18);
    return "s0";
  }

  function parseZoomVal(v) {
    if (v == null || v === "") return null;
    var s = String(v).trim().toLowerCase();
    if (s === "reset" || s === "fit" || s === "100%") return 1;
    if (s.endsWith("%")) s = s.slice(0, -1).trim();
    var n = Number(s);
    if (!isFinite(n) || n <= 0) return null;
    if (n > 10) n = n / 100; // allow 150 or 200 percent!
    return clamp(n, MIN_ZOOM, MAX_ZOOM);
  }

  function getLang() {
    var raw = (window.U4PlanNav && typeof window.U4PlanNav.getLang === "function")
      ? window.U4PlanNav.getLang()
      : (document.documentElement.lang || "en");
    var s = String(raw || "").trim().toLowerCase();
    if (s === "ru" || s.indexOf("ru-") === 0) return "ru";
    if (s === "es" || s.indexOf("es-") === 0) return "es";
    return "en";
  }

  function isEs() { return getLang() === "es"; }
  function isRu() { return getLang() === "ru"; }

  function L(en, es, ru) {
    if (isRu()) return ru != null ? ru : en;
    if (isEs()) return es != null ? es : en;
    return en;
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function isArmedForPin(hostEl) {
    return hostEl.classList.contains("is-pin-armed") || hostEl.classList.contains("drop-target");
  }

  function attachOne(hostEl, idx) {
    if (!hostEl || instances.has(hostEl)) return;
    if (hostEl.querySelector(":scope > .u4-zoom-viewport")) return;

    var isPhoto = hostEl.classList.contains("u4h-photo-card");
    var mediaEl = isPhoto
      ? hostEl.querySelector(":scope > img")
      : hostEl.querySelector(":scope > svg");
    if (!mediaEl) return;

    var stepKey = getActiveStepKey();
    var storeKey = hostEl.id ? (stepKey + "#" + hostEl.id) : (stepKey + ":" + (isPhoto ? "p" : "s") + ":" + (idx || 0));
    var prevSaved = savedByKey[storeKey] || null;

    var ctrlAria = L("Zoom controls", "Controles de zoom", "Управление масштабом");
    var outAria = L("Zoom out", "Alejar", "Уменьшить масштаб");
    var resetAria = L("Reset zoom to 100%", "Restablecer zoom a 100%", "Сбросить масштаб до 100%");
    var resetTitle = L("Reset to 100%", "Restablecer a 100%", "Сбросить до 100%");
    var inAria = L("Zoom in", "Acercar", "Увеличить масштаб");

    // Create slim classic old-wiki zoom toolbar right above the visual frame
    var bar = document.createElement("div");
    bar.className = "u4-zoom-bar no-print";
    bar.setAttribute("data-u4-zoom-bar", "1");
    bar.innerHTML =
      '<span class="u4-zoom-hint">' +
        (isPhoto
          ? L("🔍 Photo zoom (pinch or Ctrl+scroll)", "🔍 Zoom en foto (pellizca o Ctrl+rueda)", "🔍 Масштаб фото (щипок или Ctrl+колесо)")
          : L("🔍 Zoom plan (pinch or Ctrl+scroll)", "🔍 Acercar plano (pellizca o Ctrl+rueda)", "🔍 Масштаб плана (щипок или Ctrl+колесо)")) +
      "</span>" +
      '<div class="u4-zoom-ctrl" role="group" aria-label="' + ctrlAria + '">' +
        '<button type="button" class="u4-zoom-btn" data-u4-zoom="out" aria-label="' + outAria + '" title="' + outAria + '" disabled>&minus;</button>' +
        '<button type="button" class="u4-zoom-btn u4-zoom-pct" data-u4-zoom="reset" aria-label="' + resetAria + '" title="' + resetTitle + '">100%</button>' +
        '<button type="button" class="u4-zoom-btn" data-u4-zoom="in" aria-label="' + inAria + '" title="' + inAria + '">+</button>' +
      "</div>";

    var viewport = document.createElement("div");
    viewport.className = "u4-zoom-viewport";

    var stage = document.createElement("div");
    stage.className = "u4-zoom-stage";
    stage.style.setProperty("--u4-zoom", "1");
    stage.style.setProperty("--u4-inv-scale", "1");

    // Insert bar + viewport right where mediaEl was, then move mediaEl (and any existing .u4-pin-layer!) into stage
    hostEl.insertBefore(bar, mediaEl);
    hostEl.insertBefore(viewport, mediaEl);
    viewport.appendChild(stage);
    stage.appendChild(mediaEl);

    var existingPinLayer = hostEl.querySelector(":scope > .u4-pin-layer");
    if (existingPinLayer) {
      stage.appendChild(existingPinLayer);
    }

    var ctrlGroup = bar.querySelector(".u4-zoom-ctrl");
    var btnOut = bar.querySelector('[data-u4-zoom="out"]');
    var btnReset = bar.querySelector('[data-u4-zoom="reset"]');
    var btnIn = bar.querySelector('[data-u4-zoom="in"]');
    var hintEl = bar.querySelector(".u4-zoom-hint");

    var zState = {
      scale: prevSaved ? prevSaved.scale : 1,
      tx: prevSaved ? prevSaved.tx : 0,
      ty: prevSaved ? prevSaved.ty : 0,
      panPtrId: null,
      panStartX: 0,
      panStartY: 0,
      panStartTx: 0,
      panStartTy: 0,
      activePtrs: new Map(),
      pinchStartDist: 0,
      pinchStartScale: 1,
      pinchStartTx: 0,
      pinchStartTy: 0,
      pinchStartMidX: 0,
      pinchStartMidY: 0
    };

    function clampTranslation() {
      var w = viewport.clientWidth || 1;
      var h = viewport.clientHeight || 1;
      if (zState.scale <= 1.001) {
        zState.scale = 1;
        zState.tx = 0;
        zState.ty = 0;
        return;
      }
      var minTx = w - w * zState.scale;
      var minTy = h - h * zState.scale;
      zState.tx = clamp(zState.tx, minTx, 0);
      zState.ty = clamp(zState.ty, minTy, 0);
    }

    function applyTransform() {
      clampTranslation();
      savedByKey[storeKey] = { scale: zState.scale, tx: zState.tx, ty: zState.ty };
      var zoomed = zState.scale > 1.01;
      if (zoomed) {
        stage.style.transform =
          "translate3d(" + zState.tx.toFixed(1) + "px, " + zState.ty.toFixed(1) + "px, 0) scale(" + zState.scale.toFixed(4) + ")";
      } else {
        stage.style.transform = "";
      }
      stage.style.setProperty("--u4-zoom", zState.scale.toFixed(4));
      stage.style.setProperty("--u4-inv-scale", (1 / zState.scale).toFixed(4));
      stage.setAttribute("data-zoom", zState.scale.toFixed(2));
      viewport.classList.toggle("is-zoomed", zoomed);

      var pct = Math.round(zState.scale * 100);
      if (btnReset) {
        btnReset.textContent = pct + "%";
        btnReset.classList.toggle("is-zoomed", zoomed);
      }
      if (btnOut) btnOut.disabled = zState.scale <= MIN_ZOOM + 0.01;
      if (btnIn) btnIn.disabled = zState.scale >= MAX_ZOOM - 0.01;
      if (hintEl) {
        if (zoomed) {
          hintEl.textContent = L(
            "✋ Drag background to pan · click " + pct + "% to reset",
            "✋ Arrastra el fondo para mover · toca " + pct + "% para restablecer",
            "✋ Тяните фон для сдвига · нажмите " + pct + "% для сброса"
          );
        } else {
          hintEl.textContent = isPhoto
            ? L("🔍 Photo zoom (pinch or Ctrl+scroll)", "🔍 Zoom en foto (pellizca o Ctrl+rueda)", "🔍 Масштаб фото (щипок или Ctrl+колесо)")
            : L("🔍 Zoom plan (pinch or Ctrl+scroll)", "🔍 Acercar plano (pellizca o Ctrl+rueda)", "🔍 Масштаб плана (щипок или Ctrl+колесо)");
        }
      }
    }

    function setZoomAt(nextScale, focalViewportX, focalViewportY) {
      var prev = zState.scale;
      var clamped = clamp(Math.round(nextScale * 100) / 100, MIN_ZOOM, MAX_ZOOM);
      if (clamped <= 1.01) {
        zState.scale = 1;
        zState.tx = 0;
        zState.ty = 0;
        applyTransform();
        return;
      }
      var fx = focalViewportX != null ? focalViewportX : (viewport.clientWidth || 1) / 2;
      var fy = focalViewportY != null ? focalViewportY : (viewport.clientHeight || 1) / 2;
      var stageX = (fx - zState.tx) / prev;
      var stageY = (fy - zState.ty) / prev;
      zState.scale = clamped;
      zState.tx = fx - stageX * clamped;
      zState.ty = fy - stageY * clamped;
      applyTransform();
    }

    if (btnIn) {
      btnIn.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        setZoomAt(zState.scale + STEP);
      });
    }
    if (btnOut) {
      btnOut.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        setZoomAt(zState.scale - STEP);
      });
    }
    if (btnReset) {
      btnReset.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        setZoomAt(1);
      });
    }

    // Ctrl / ⌘ + Wheel zoom (NEVER intercepts ordinary vertical scroll!)
    viewport.addEventListener("wheel", function (ev) {
      if (!ev.ctrlKey && !ev.metaKey) return;
      ev.preventDefault();
      var r = viewport.getBoundingClientRect();
      var fx = ev.clientX - r.left;
      var fy = ev.clientY - r.top;
      var factor = ev.deltaY < 0 ? 1.16 : 1 / 1.16;
      setZoomAt(zState.scale * factor, fx, fy);
    }, { passive: false });

    // Pointer Events: 2-finger pinch-to-zoom + 1-pointer drag-to-pan ONLY when zoomed & on non-interactive background
    viewport.addEventListener("pointerdown", function (ev) {
      if (ev.pointerType === "touch") {
        zState.activePtrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
        if (zState.activePtrs.size === 2) {
          zState.panPtrId = null;
          viewport.classList.remove("is-panning");
          var pts = Array.from(zState.activePtrs.values());
          var r = viewport.getBoundingClientRect();
          zState.pinchStartDist = Math.max(10, Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y));
          zState.pinchStartScale = zState.scale;
          zState.pinchStartTx = zState.tx;
          zState.pinchStartTy = zState.ty;
          zState.pinchStartMidX = (pts[0].x + pts[1].x) / 2 - r.left;
          zState.pinchStartMidY = (pts[0].y + pts[1].y) / 2 - r.top;
          ev.preventDefault();
          return;
        }
      }

      if (zState.scale <= 1.01) return;
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      if (isArmedForPin(hostEl)) return;
      if (ev.target && ev.target.closest && ev.target.closest(INTERACTIVE_SEL)) return;

      ev.preventDefault();
      zState.panPtrId = ev.pointerId;
      zState.panStartX = ev.clientX;
      zState.panStartY = ev.clientY;
      zState.panStartTx = zState.tx;
      zState.panStartTy = zState.ty;
      viewport.classList.add("is-panning");
      try { viewport.setPointerCapture(ev.pointerId); } catch (_) {}
    });

    viewport.addEventListener("pointermove", function (ev) {
      if (ev.pointerType === "touch" && zState.activePtrs.has(ev.pointerId)) {
        zState.activePtrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
        if (zState.activePtrs.size === 2 && zState.pinchStartDist > 0) {
          ev.preventDefault();
          var pts = Array.from(zState.activePtrs.values());
          var r = viewport.getBoundingClientRect();
          var dist = Math.max(10, Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y));
          var midX = (pts[0].x + pts[1].x) / 2 - r.left;
          var midY = (pts[0].y + pts[1].y) / 2 - r.top;
          var nextScale = clamp(zState.pinchStartScale * (dist / zState.pinchStartDist), MIN_ZOOM, MAX_ZOOM);
          var stageX = (zState.pinchStartMidX - zState.pinchStartTx) / zState.pinchStartScale;
          var stageY = (zState.pinchStartMidY - zState.pinchStartTy) / zState.pinchStartScale;
          zState.scale = nextScale;
          zState.tx = midX - stageX * nextScale;
          zState.ty = midY - stageY * nextScale;
          applyTransform();
          return;
        }
      }

      if (zState.panPtrId !== null && ev.pointerId === zState.panPtrId) {
        ev.preventDefault();
        zState.tx = zState.panStartTx + (ev.clientX - zState.panStartX);
        zState.ty = zState.panStartTy + (ev.clientY - zState.panStartY);
        applyTransform();
      }
    });

    function endPointer(ev) {
      if (zState.activePtrs.has(ev.pointerId)) {
        zState.activePtrs.delete(ev.pointerId);
        if (zState.activePtrs.size < 2) {
          zState.pinchStartDist = 0;
        }
      }
      if (zState.panPtrId === ev.pointerId) {
        zState.panPtrId = null;
        viewport.classList.remove("is-panning");
        try {
          if (viewport.hasPointerCapture && viewport.hasPointerCapture(ev.pointerId)) {
            viewport.releasePointerCapture(ev.pointerId);
          }
        } catch (_) {}
      }
    }

    viewport.addEventListener("pointerup", endPointer);
    viewport.addEventListener("pointercancel", endPointer);

    instances.set(hostEl, {
      setZoom: function (z) { setZoomAt(z); },
      reset: function () { setZoomAt(1); },
      refreshLabels: function () {
        var oLbl = L("Zoom out", "Alejar", "Уменьшить масштаб");
        var rAria = L("Reset zoom to 100%", "Restablecer zoom a 100%", "Сбросить масштаб до 100%");
        var rTitle = L("Reset to 100%", "Restablecer a 100%", "Сбросить до 100%");
        var iLbl = L("Zoom in", "Acercar", "Увеличить масштаб");
        var gLbl = L("Zoom controls", "Controles de zoom", "Управление масштабом");
        if (ctrlGroup) ctrlGroup.setAttribute("aria-label", gLbl);
        if (btnOut) { btnOut.setAttribute("aria-label", oLbl); btnOut.title = oLbl; }
        if (btnReset) { btnReset.setAttribute("aria-label", rAria); btnReset.title = rTitle; }
        if (btnIn) { btnIn.setAttribute("aria-label", iLbl); btnIn.title = iLbl; }
        applyTransform();
      },
      getState: function () { return { scale: zState.scale, tx: zState.tx, ty: zState.ty }; },
      stage: stage,
      viewport: viewport
    });

    applyTransform();
  }

  function attachAll() {
    var curStep = getActiveStepKey();
    if (lastActiveStepKey && curStep !== lastActiveStepKey) {
      savedByKey = {};
    }
    lastActiveStepKey = curStep;

    var targets = document.querySelectorAll("#u4hBody .u4h-svg-wrap, #u4hBody .u4h-photo-card, #u4gBody .ks4-svg-wrap, #u4gBody .u4h-photo-card");
    for (var i = 0; i < targets.length; i++) {
      attachOne(targets[i], i);
    }

    if (!initialZoomApplied && targets.length) {
      initialZoomApplied = true;
      var qz = null;
      try {
        var sp = new URLSearchParams(window.location.search || "");
        qz = parseZoomVal(sp.get("zoom"));
      } catch (_) {}
      if (qz && qz > 1.01) {
        var primary = document.querySelector("#u4hBody .u4h-svg-wrap, #u4gBody .ks4-svg-wrap") || targets[0];
        var inst = instances.get(primary);
        if (inst) inst.setZoom(qz);
      }
    }
  }

  function refreshAllLabels() {
    document.querySelectorAll("#u4hBody .u4h-svg-wrap, #u4hBody .u4h-photo-card, #u4gBody .ks4-svg-wrap, #u4gBody .u4h-photo-card").forEach(function (el) {
      var inst = instances.get(el);
      if (inst && inst.refreshLabels) inst.refreshLabels();
    });
  }

  function observeRoot(rootEl) {
    if (!rootEl || typeof MutationObserver !== "function") return;
    var obs = new MutationObserver(function () {
      attachAll();
    });
    obs.observe(rootEl, { childList: true });
    observers.push(obs);
  }

  function boot() {
    attachAll();
    observeRoot(document.getElementById("u4hBody"));
    observeRoot(document.getElementById("u4gBody"));
    if (typeof MutationObserver === "function") {
      var langObs = new MutationObserver(refreshAllLabels);
      langObs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
      observers.push(langObs);
    }
    window.addEventListener("u4:lang-change", refreshAllLabels);
  }

  window.U4ZoomPan = {
    attach: attachAll,
    refreshLabels: refreshAllLabels,
    setZoom: function (hostEl, z) {
      var inst = instances.get(hostEl);
      if (!inst) return;
      var cur = inst.getState().scale;
      if (z === "in") inst.setZoom(cur + STEP);
      else if (z === "out") inst.setZoom(cur - STEP);
      else {
        var n = parseZoomVal(z);
        if (n != null) inst.setZoom(n);
      }
    },
    setPrimaryZoom: function (z) {
      attachAll();
      var primary = document.querySelector("#u4hBody .u4h-svg-wrap, #u4gBody .ks4-svg-wrap, #u4hBody .u4h-photo-card");
      if (primary) window.U4ZoomPan.setZoom(primary, z);
    },
    getPrimaryZoom: function () {
      var primary = document.querySelector("#u4hBody .u4h-svg-wrap, #u4gBody .ks4-svg-wrap, #u4hBody .u4h-photo-card");
      var inst = primary ? instances.get(primary) : null;
      return inst ? inst.getState().scale : 1;
    },
    getState: function (hostEl) {
      var inst = instances.get(hostEl);
      return inst ? inst.getState() : null;
    },
    resetAll: function () {
      savedByKey = {};
      document.querySelectorAll("#u4hBody .u4h-svg-wrap, #u4hBody .u4h-photo-card, #u4gBody .ks4-svg-wrap").forEach(function (el) {
        var inst = instances.get(el);
        if (inst) inst.reset();
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
