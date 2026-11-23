/* ============================================================================
   Unit 4 Interactive Plans — Universal Pin/Circle Dragger (Ask AI / Correct)
   Auto-mounts onto every .u4h-svg-wrap & .u4h-photo-card across interactive plans
   Supports BOTH Drag-and-Drop AND 1-Tap Arm · Voice Mic · Ask AI · Intake Correction
   Zero Interference with Element Dragging · Zero Storage · Zero Prices
   ============================================================================ */
(function () {
  "use strict";

  var INTAKE_URL = "https://mac-mini.tailcf4007.ts.net/api/unit4/wiki-intake";
  var state = {
    armed: false,
    pinsByKey: {},     // key = targetIdx -> [{ id, xPct, yPct, intent, text, status }]
    selectedPinId: null,
    nextId: 1,
    toastTimer: null,
    observer: null
  };

  function isEs() {
    return window.U4PlanNav ? window.U4PlanNav.getLang() === "es" : (document.documentElement.lang === "es");
  }

  function getPlanId() {
    var m = window.location.pathname.match(/plans\/([^/]+)/);
    return m ? m[1] : "unit4-plan";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureGlobalChrome() {
    if (!document.getElementById("u4PinGhost")) {
      var g = document.createElement("div");
      g.id = "u4PinGhost";
      g.className = "u4-pin-ghost no-print";
      g.textContent = "⊕";
      document.body.appendChild(g);
    }
    if (!document.getElementById("u4PinToast")) {
      var t = document.createElement("div");
      t.id = "u4PinToast";
      t.className = "u4-pin-toast no-print";
      t.setAttribute("role", "status");
      t.setAttribute("aria-live", "polite");
      document.body.appendChild(t);
    }
  }

  function showToast(msg) {
    ensureGlobalChrome();
    var t = document.getElementById("u4PinToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { t.classList.remove("is-show"); }, 3200);
  }

  function hideToast() {
    var t = document.getElementById("u4PinToast");
    if (t) t.classList.remove("is-show");
    clearTimeout(state.toastTimer);
  }

  function getTargets() {
    var host = document.getElementById("u4hBody");
    if (!host) return [];
    return Array.prototype.slice.call(host.querySelectorAll(".u4h-svg-wrap, .u4h-photo-card"));
  }

  function targetKey(el, idx) {
    var stepBtn = document.querySelector(".u4h-step-btn.is-active");
    var step = stepBtn ? (stepBtn.getAttribute("data-step") || "s") : "s";
    return step + ":" + idx;
  }

  function setArmed(val) {
    state.armed = !!val;
    var btn = document.getElementById("u4PinArmBtn");
    if (btn) {
      btn.classList.toggle("is-armed", state.armed);
      btn.setAttribute("aria-pressed", state.armed ? "true" : "false");
    }
    getTargets().forEach(function (el) {
      el.classList.toggle("is-pin-armed", state.armed);
    });
    if (state.armed) {
      showToast(isEs()
        ? "Ahora toca cualquier punto del plano o foto para preguntar o corregir"
        : "Now tap any spot on the drawing or photo to ask AI or flag a correction");
    } else {
      hideToast();
    }
  }

  function countAllPins() {
    var n = 0;
    Object.keys(state.pinsByKey).forEach(function (k) { n += (state.pinsByKey[k] || []).length; });
    return n;
  }

  function dropPinOnTarget(targetEl, idx, clientX, clientY) {
    var boxEl = (targetEl && targetEl.querySelector) ? (targetEl.querySelector(".u4-zoom-stage") || targetEl) : targetEl;
    var rect = boxEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var xPct = Math.max(4, Math.min(96, +(((clientX - rect.left) / rect.width) * 100).toFixed(1)));
    var yPct = Math.max(4, Math.min(96, +(((clientY - rect.top) / rect.height) * 100).toFixed(1)));
    var key = targetKey(targetEl, idx);
    if (!state.pinsByKey[key]) state.pinsByKey[key] = [];
    var pin = {
      id: "u4pin-" + (state.nextId++),
      xPct: xPct,
      yPct: yPct,
      intent: "ask",
      text: "",
      status: ""
    };
    state.pinsByKey[key].push(pin);
    state.selectedPinId = pin.id;
    setArmed(false);
    hideToast();
    renderAllLayers();
    var inp = document.getElementById("u4PinInput_" + pin.id);
    if (inp) inp.focus();
  }

  async function submitPinCorrection(pin, key) {
    var es = isEs();
    var note = String(pin.text || "").trim();
    if (!note) {
      showToast(es ? "Escribe una pregunta o corrección primero" : "Type a question or correction first");
      return;
    }
    var planId = getPlanId();
    var locTag = planId + " (" + key + " @ " + pin.xPct + "%, " + pin.yPct + "%)";

    if (pin.intent === "ask") {
      if (window.U4LiveAi && typeof window.U4LiveAi.open === "function") {
        window.U4LiveAi.open(note, locTag);
        state.pinsByKey = {}; state.selectedPinId = null; state.armed = false;
        renderAllLayers();
      }
      return;
    }

    pin.status = es ? "Enviando..." : "Sending...";
    renderAllLayers();
    try {
      var res = await fetch(INTAKE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: planId,
          roomKey: (window.U4PLAN && window.U4PLAN.roomKey) || planId,
          document_id: (window.U4PLAN && window.U4PLAN.documentId) || planId,
          pdf_page: (window.U4PLAN && window.U4PLAN.pdfPage) || 1,
          x_pct: typeof xPct === "number" ? xPct : null,
          y_pct: typeof yPct === "number" ? yPct : null,
          edit_kind: "pin_correction",
          summary: "[PIN " + locTag + "] " + note,
          details: "Pinned visual correction on " + locTag + "\nURL: " + window.location.href + "\nNote: " + note,
          source_page: window.location.pathname + window.location.hash,
          ui_language: es ? "es" : "en"
        })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var resData = {}; try { resData = await res.json(); } catch (_) {}
      state.pinsByKey = {}; state.selectedPinId = null; state.armed = false;
      renderAllLayers();
      u4ShowEphemeralToast(resData.jobId, es);
      return;
    } catch (_) {
      if (window.U4LiveAi && typeof window.U4LiveAi.openNote === "function") {
        window.U4LiveAi.openNote("[PIN " + locTag + "] " + note);
      }
      pin.status = es ? "Abierto en nota local (revisar conexión)" : "Opened in local note drawer";
    }
    renderAllLayers();
  }


  function u4ShowEphemeralToast(jobId, es) {
    var el = document.getElementById("u4PinAutoToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "u4PinAutoToast";
      el.style.cssText = "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:99999;background:#1d2b24;color:#f4f5f3;padding:10px 16px;border-radius:8px;font:500 13px/1.4 'IBM Plex Sans',sans-serif;border:1px solid #355444;max-width:92vw;text-align:center;";
      document.body.appendChild(el);
    }
    el.textContent = es ? "Corrección enviada — aplicando y publicando..." : "Correction sent — applying & pushing...";
    el.style.display = "block";
    if (!jobId) { setTimeout(function () { el.style.display = "none"; }, 4500); return; }
    var tries = 0;
    var poll = setInterval(async function () {
      tries++;
      try {
        var r = await fetch("https://mac-mini.tailcf4007.ts.net/api/unit4/pin-jobs/" + encodeURIComponent(jobId));
        if (r.ok) {
          var j = await r.json();
          if (j.status === "pushed") {
            el.textContent = es ? ("✓ Aplicado y publicado: " + (j.summaryEs || "")) : ("✓ Applied & pushed: " + (j.summaryEn || ""));
            clearInterval(poll);
            setTimeout(function () { el.style.display = "none"; }, 6500);
          } else if (j.status === "held" || j.status === "error") {
            el.textContent = es ? "En revisión (to-triage)" : ("Held for review: " + (j.reason || j.error || ""));
            clearInterval(poll);
            setTimeout(function () { el.style.display = "none"; }, 6500);
          }
        }
      } catch (_) {}
      if (tries > 40) { clearInterval(poll); el.style.display = "none"; }
    }, 2000);
  }

  function renderAllLayers() {
    var es = isEs();
    var targets = getTargets();
    var clrBtn = document.getElementById("u4PinClearBtn");
    if (clrBtn) clrBtn.hidden = countAllPins() === 0;

    // Remove any stale docked pin popups before rebuilding
    document.querySelectorAll(".u4-pin-pop").forEach(function (n) { n.remove(); });

    targets.forEach(function (targetEl, idx) {
      targetEl.classList.add("u4-pin-target");
      targetEl.classList.toggle("is-pin-armed", state.armed);

      var stage = targetEl.querySelector(".u4-zoom-stage") || targetEl;
      var layer = stage.querySelector(":scope > .u4-pin-layer");
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "u4-pin-layer no-print";
        layer.addEventListener("click", function (ev) {
          if (!state.armed) return;
          if (ev.target !== layer) return;
          ev.preventDefault();
          ev.stopPropagation();
          dropPinOnTarget(targetEl, idx, ev.clientX, ev.clientY);
        });
        stage.appendChild(layer);
      }

      var key = targetKey(targetEl, idx);
      var pins = state.pinsByKey[key] || [];
      var html = "";
      var selectedPin = null;
      var selectedIdx = -1;

      pins.forEach(function (pin, pIdx) {
        var sel = pin.id === state.selectedPinId;
        if (sel) { selectedPin = pin; selectedIdx = pIdx; }
        html += '<div class="u4-pin-dot' + (sel ? " is-selected" : "") + '" data-pin-id="' + pin.id + '" style="left:' + pin.xPct + "%;top:" + pin.yPct + '%" title="' + esc(es ? "Arrastra para mover o toca para abrir" : "Drag to move or tap to open") + '">' +
          '<span class="u4-pin-dot-num">' + (pIdx + 1) + "</span>" +
        "</div>";
      });

      layer.innerHTML = html;

      // Render active pin popover cleanly below the drawing/photo (never clipped by overflow:hidden or zoom!)
      var popEl = null;
      if (selectedPin) {
        popEl = document.createElement("div");
        popEl.className = "u4-pin-pop no-print";
        popEl.setAttribute("data-pop-id", selectedPin.id);
        popEl.innerHTML =
          '<div class="u4-pin-pop-head">' +
            "<span>#" + (selectedIdx + 1) + " · " + selectedPin.xPct + "%, " + selectedPin.yPct + "%</span>" +
            '<button type="button" class="u4-pin-act" data-pin-close="' + selectedPin.id + '" aria-label="Close">&times;</button>' +
          "</div>" +
          '<div class="u4-pin-intents">' +
            '<button type="button" class="u4-pin-int-btn' + (selectedPin.intent === "ask" ? " is-active" : "") + '" data-pin-int="ask" data-pid="' + selectedPin.id + '">' + (es ? "Preguntar a la IA" : "Ask AI") + "</button>" +
            '<button type="button" class="u4-pin-int-btn' + (selectedPin.intent === "fix" ? " is-active" : "") + '" data-pin-int="fix" data-pid="' + selectedPin.id + '">' + (es ? "Corregir / Reportar" : "Correct / Flag") + "</button>" +
          "</div>" +
          '<div class="u4-pin-row">' +
            '<input id="u4PinInput_' + selectedPin.id + '" type="text" data-pin-inp="' + selectedPin.id + '" value="' + esc(selectedPin.text) + '" placeholder="' + esc(selectedPin.intent === "ask" ? (es ? "¿Qué quieres preguntar de este punto?" : "Ask about this exact spot...") : (es ? "¿Qué hay que corregir aquí?" : "What needs correcting here?")) + '">' +
            '<button type="button" class="u4-pin-act" data-pin-mic="' + selectedPin.id + '" title="Voice">🎤</button>' +
          "</div>" +
          '<div class="u4-pin-foot">' +
            '<button type="button" class="u4-pin-act" data-pin-del="' + selectedPin.id + '">' + (es ? "Borrar" : "Delete") + "</button>" +
            '<button type="button" class="u4-pin-act is-primary" data-pin-send="' + selectedPin.id + '">' + (selectedPin.intent === "ask" ? (es ? "Preguntar IA →" : "Ask AI →") : (es ? "Enviar corrección" : "Send correction")) + "</button>" +
          "</div>" +
          (selectedPin.status ? '<div class="u4-pin-status">' + esc(selectedPin.status) + "</div>" : "");

        var dockAfter = targetEl.closest(".u4h-photo-grid") || targetEl;
        if (dockAfter && dockAfter.parentNode) {
          dockAfter.parentNode.insertBefore(popEl, dockAfter.nextSibling);
        }
      }

      // Wire pins (click to select + drag to reposition!)
      layer.querySelectorAll(".u4-pin-dot").forEach(function (dot) {
        var pid = dot.getAttribute("data-pin-id");
        var pin = pins.find(function (x) { return x.id === pid; });
        if (!pin) return;
        dot.addEventListener("pointerdown", function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          var startX = ev.clientX, startY = ev.clientY, moved = false;
          var ptrId = ev.pointerId;
          try { dot.setPointerCapture(ptrId); } catch (_) {}
          function onMove(e) {
            if (e.pointerId !== ptrId) return;
            if (Math.hypot(e.clientX - startX, e.clientY - startY) > 4) moved = true;
            if (!moved) return;
            var boxEl = targetEl.querySelector(".u4-zoom-stage") || targetEl;
            var r = boxEl.getBoundingClientRect();
            pin.xPct = Math.max(4, Math.min(96, +(((e.clientX - r.left) / (r.width || 1)) * 100).toFixed(1)));
            pin.yPct = Math.max(4, Math.min(96, +(((e.clientY - r.top) / (r.height || 1)) * 100).toFixed(1)));
            dot.style.left = pin.xPct + "%";
            dot.style.top = pin.yPct + "%";
          }
          function onUp(e) {
            if (e && e.pointerId !== ptrId) return;
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            document.removeEventListener("pointercancel", onUp);
            try { if (dot.hasPointerCapture && dot.hasPointerCapture(ptrId)) dot.releasePointerCapture(ptrId); } catch (_) {}
            state.selectedPinId = moved ? pin.id : (state.selectedPinId === pin.id ? null : pin.id);
            renderAllLayers();
          }
          document.addEventListener("pointermove", onMove);
          document.addEventListener("pointerup", onUp);
          document.addEventListener("pointercancel", onUp);
        });
      });

      // Wire popup buttons
      if (!popEl) return;
      popEl.querySelectorAll("[data-pin-close]").forEach(function (b) {
        b.addEventListener("click", function () { state.selectedPinId = null; renderAllLayers(); });
      });
      popEl.querySelectorAll("[data-pin-int]").forEach(function (b) {
        b.addEventListener("click", function () {
          var pin = pins.find(function (x) { return x.id === b.getAttribute("data-pid"); });
          if (pin) { pin.intent = b.getAttribute("data-pin-int"); renderAllLayers(); }
        });
      });
      popEl.querySelectorAll("[data-pin-inp]").forEach(function (inp) {
        var pin = pins.find(function (x) { return x.id === inp.getAttribute("data-pin-inp"); });
        if (!pin) return;
        inp.addEventListener("input", function () { pin.text = inp.value; });
        inp.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter") { ev.preventDefault(); submitPinCorrection(pin, key); }
          if (ev.key === "Escape") { state.selectedPinId = null; renderAllLayers(); }
        });
      });
      popEl.querySelectorAll("[data-pin-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          var pid = b.getAttribute("data-pin-del");
          state.pinsByKey[key] = (state.pinsByKey[key] || []).filter(function (x) { return x.id !== pid; });
          if (state.selectedPinId === pid) state.selectedPinId = null;
          renderAllLayers();
        });
      });
      popEl.querySelectorAll("[data-pin-send]").forEach(function (b) {
        b.addEventListener("click", function () {
          var pin = pins.find(function (x) { return x.id === b.getAttribute("data-pin-send"); });
          if (pin) submitPinCorrection(pin, key);
        });
      });
      popEl.querySelectorAll("[data-pin-mic]").forEach(function (b) {
        b.addEventListener("click", function () {
          var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SR) {
            showToast(es ? "Dictado de voz no disponible aquí — escribe tu nota" : "Voice dictation unavailable here — type your note");
            return;
          }
          var pin = pins.find(function (x) { return x.id === b.getAttribute("data-pin-mic"); });
          if (!pin) return;
          var rec = new SR();
          rec.lang = es ? "es-MX" : "en-US";
          b.classList.add("is-listening");
          rec.onresult = function (ev) {
            var tx = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : "";
            if (tx) {
              pin.text = (pin.text ? pin.text + " " : "") + tx;
              var inp = document.getElementById("u4PinInput_" + pin.id);
              if (inp) inp.value = pin.text;
            }
          };
          rec.onend = function () { b.classList.remove("is-listening"); };
          rec.onerror = function () { b.classList.remove("is-listening"); };
          try { rec.start(); } catch (_) { b.classList.remove("is-listening"); }
        });
      });
    });
  }

  function injectToolbarIfNeeded() {
    var host = document.getElementById("u4hBody");
    if (!host) return;
    var targets = getTargets();
    if (!targets.length) return;
    if (document.getElementById("u4PinBar")) {
      renderAllLayers();
      return;
    }

    var es = isEs();
    var bar = document.createElement("div");
    bar.id = "u4PinBar";
    bar.className = "u4-pin-bar no-print";
    bar.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
        '<button type="button" id="u4PinArmBtn" class="u4-pin-arm-btn' + (state.armed ? " is-armed" : "") + '" aria-pressed="' + (state.armed ? "true" : "false") + '">' +
          (es ? "⊕ Arrastrar / Tocar punto" : "⊕ Drag / Tap to Pin Spot") +
        "</button>" +
        '<span>' + (es ? "Marca cualquier parte del dibujo o foto para preguntar a la IA o corregir" : "Pin any spot on a drawing or photo to ask AI or flag a correction") + "</span>" +
      "</div>" +
      '<button type="button" id="u4PinClearBtn" class="u4-pin-clear-btn"' + (countAllPins() ? "" : " hidden") + ">" +
        (es ? "Limpiar marcas" : "Clear pins") +
      "</button>";

    // Insert cleanly right before the first visual target (or inside the card right above SVG/photo)
    var first = targets[0];
    var anchor = first.closest(".u4h-photo-grid") || first;
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(bar, anchor);
    }

    var armBtn = document.getElementById("u4PinArmBtn");
    var clrBtn = document.getElementById("u4PinClearBtn");
    if (clrBtn) {
      clrBtn.addEventListener("click", function () {
        state.pinsByKey = {};
        state.selectedPinId = null;
        renderAllLayers();
      });
    }

    // Support BOTH drag-and-drop AND 1-tap click/keyboard arm on #u4PinArmBtn!
    if (armBtn) {
      var suppressNextClick = false;
      armBtn.addEventListener("click", function (ev) {
        if (suppressNextClick) {
          suppressNextClick = false;
          ev.preventDefault();
          return;
        }
        setArmed(!state.armed);
      });
      armBtn.addEventListener("pointerdown", function (ev) {
        if (ev.button !== undefined && ev.button !== 0 && ev.pointerType === "mouse") return;
        ensureGlobalChrome();
        var ghost = document.getElementById("u4PinGhost");
        var startX = ev.clientX, startY = ev.clientY, dragged = false;
        var pid = ev.pointerId;
        try { armBtn.setPointerCapture(pid); } catch (_) {}

        function onMove(e) {
          if (e.pointerId !== pid) return;
          if (Math.hypot(e.clientX - startX, e.clientY - startY) > 7) {
            dragged = true;
            if (ghost) {
              ghost.classList.add("is-active");
              ghost.style.left = e.clientX + "px";
              ghost.style.top = e.clientY + "px";
            }
          }
        }
        function onUp(e) {
          if (e && e.pointerId !== pid) return;
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", onUp);
          try { if (armBtn.hasPointerCapture && armBtn.hasPointerCapture(pid)) armBtn.releasePointerCapture(pid); } catch (_) {}
          if (ghost) ghost.classList.remove("is-active");

          if (dragged) {
            suppressNextClick = true;
            var hit = null;
            var hitIdx = -1;
            var tlist = getTargets();
            for (var i = 0; i < tlist.length; i++) {
              var r = tlist[i].getBoundingClientRect();
              if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
                hit = tlist[i];
                hitIdx = i;
                break;
              }
            }
            if (hit) dropPinOnTarget(hit, hitIdx, e.clientX, e.clientY);
          }
        }
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
        document.addEventListener("pointercancel", onUp);
      });
    }

    renderAllLayers();
  }

  function boot() {
    ensureGlobalChrome();
    var bodyHost = document.getElementById("u4hBody");
    if (!bodyHost) return;
    injectToolbarIfNeeded();
    if (!state.observer && typeof MutationObserver === "function") {
      state.observer = new MutationObserver(function () {
        if (!document.getElementById("u4PinBar")) {
          injectToolbarIfNeeded();
        }
      });
      state.observer.observe(bodyHost, { childList: true });
    }
  }

  window.U4PinDragger = {
    attach: injectToolbarIfNeeded,
    setArmed: setArmed,
    clearPins: function () { state.pinsByKey = {}; state.selectedPinId = null; renderAllLayers(); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
