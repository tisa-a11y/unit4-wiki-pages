/* ============================================================================
   Unit 4 Interactive Plans — Universal Page-Wide Pin Dragger (Correct / Ask AI)
   Works on ANY element on the page: headings, paragraphs, step cards, tables,
   checklists, banners, SVGs (1:1 zoom-aware), and site photos.
   Supports Drag-and-Drop, 1-Tap Arm, Parent-Iframe postMessage, Voice Dictation,
   EN | ES | RU, and the 6-point /api/unit4/wiki-intake contract (12s timeout).
   ============================================================================ */
(function () {
  "use strict";

  var INTAKE_URL = "https://mac-mini.tailcf4007.ts.net/api/unit4/wiki-intake";
  var PLAN_TO_ROOM = {
    "bathroom-tile": "bathroom",
    "bathroom-measurements": "bathroom",
    "kitchen-west-ks4": "kitchen-oven-range",
    "kitchen-floor-plan": "kitchen",
    "kitchen-electrical": "electrical",
    "attic-hatch": "attic-access",
    "hvac-layout": "hvac",
    "attic-hvac": "hvac",
    "murphy-door": "laundry"
  };

  var STRINGS = {
    en: {
      chip: "⊕ Drag / Tap to Correct",
      shortChip: "⊕ Pin",
      hint: "Drag ⊕ onto any text, table row, step, checklist, photo, or drawing — or tap once, then click any spot",
      armedToast: "Tap anywhere on the page (text, table, step, checklist, photo, or drawing) to drop a correction pin",
      clearAll: "Clear pins",
      fixTab: "Flag Correction",
      askTab: "Ask AI",
      fixPh: "Describe what to change or fix here...",
      askPh: "Ask a question about this item...",
      sendFix: "Send Fix",
      sendAsk: "Ask AI",
      sending: "Sending...",
      emptyToast: "Type a correction or question first",
      sentAi: "Sent to AI Helper ✓",
      sentOk: "Correction sent — applying & pushing...",
      sentHeld: "Logged to triage for review ✓",
      errTimeout: "Timed out after 12s — check connection and retry",
      errNet: "Could not reach intake server — retry in a moment",
      remove: "Remove",
      micTitle: "Voice input",
      pageSpot: "Page item"
    },
    es: {
      chip: "⊕ Arrastrar / Tocar para corregir",
      shortChip: "⊕ Punto",
      hint: "Arrastra ⊕ a cualquier texto, tabla, paso, lista, foto o plano — o toca una vez y luego el punto",
      armedToast: "Toca cualquier parte de la página (texto, tabla, paso, lista, foto o dibujo) para corregir",
      clearAll: "Borrar puntos",
      fixTab: "Corregir",
      askTab: "Preguntar IA",
      fixPh: "Escribe qué se debe corregir aquí...",
      askPh: "Escribe tu pregunta sobre este punto...",
      sendFix: "Enviar ajuste",
      sendAsk: "Preguntar",
      sending: "Enviando...",
      emptyToast: "Escribe primero una corrección o pregunta",
      sentAi: "Enviado a Guía IA ✓",
      sentOk: "Corrección enviada — aplicando y publicando...",
      sentHeld: "Registrado en revisión (to-triage) ✓",
      errTimeout: "Tiempo agotado (12 s) — revisa la conexión e intenta de nuevo",
      errNet: "Sin conexión al servidor — intenta de nuevo",
      remove: "Quitar",
      micTitle: "Dictado por voz",
      pageSpot: "Elemento de página"
    },
    ru: {
      chip: "⊕ Перетащите / нажмите для правки",
      shortChip: "⊕ Метка",
      hint: "Перетащите ⊕ на любой текст, таблицу, шаг, чек-лист, фото или чертёж — или нажмите и выберите место",
      armedToast: "Нажмите на любое место страницы (текст, таблицу, шаг, чек-лист, фото или чертёж) для правки",
      clearAll: "Очистить",
      fixTab: "Исправить",
      askTab: "Спросить ИИ",
      fixPh: "Опишите, что нужно исправить здесь...",
      askPh: "Задайте вопрос по этому элементу...",
      sendFix: "Отправить",
      sendAsk: "Спросить",
      sending: "Отправка...",
      emptyToast: "Сначала введите исправление или вопрос",
      sentAi: "Отправлено в ИИ-помощник ✓",
      sentOk: "Правка отправлена — применяем и публикуем...",
      sentHeld: "Сохранено на проверку (to-triage) ✓",
      errTimeout: "Превышено время ожидания (12 с) — повторите попытку",
      errNet: "Сервер недоступен — повторите попытку",
      remove: "Удалить",
      micTitle: "Голосовой ввод",
      pageSpot: "Элемент страницы"
    }
  };

  var state = {
    armed: false,
    pins: [],
    selectedPinId: null,
    sendingId: null,
    nextId: 1,
    toastTimer: null,
    observer: null,
    langObserver: null,
    SuppressObserver: false,
    recognition: null,
    listeningPinId: null
  };

  function getLang() {
    var l = "";
    if (window.U4PlanNav && typeof window.U4PlanNav.getLang === "function") {
      l = String(window.U4PlanNav.getLang() || "").toLowerCase();
    } else if (window.U4PLAN && typeof window.U4PLAN.getLang === "function") {
      l = String(window.U4PLAN.getLang() || "").toLowerCase();
    } else {
      l = String(document.documentElement.lang || "en").toLowerCase();
    }
    if (l.indexOf("ru") === 0) return "ru";
    if (l.indexOf("es") === 0) return "es";
    return "en";
  }

  function tr(key) {
    var lang = getLang();
    return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  }

  function getPlanId() {
    if (window.U4PLAN && (window.U4PLAN.id || window.U4PLAN.planId)) {
      return String(window.U4PLAN.id || window.U4PLAN.planId);
    }
    var m = String(window.location.pathname || "").match(/plans\/([^\/]+)/);
    if (m && m[1] && m[1] !== "vendor") return m[1];
    var m2 = String(window.location.pathname || "").match(/wiki-docs\/([^\/\.]+)/);
    if (m2 && m2[1]) return m2[1];
    return "unit4-plan";
  }

  function getRoomKey() {
    if (window.U4PLAN && window.U4PLAN.roomKey) return String(window.U4PLAN.roomKey);
    var pid = getPlanId();
    return PLAN_TO_ROOM[pid] || "bathroom";
  }

  function getActiveStepKey() {
    var btn = document.querySelector(".u4b-step-btn.active, .u4h-step-btn.is-active, .segmented button[aria-pressed='true'][data-wall]");
    if (btn) {
      return btn.getAttribute("data-step") || btn.getAttribute("data-wall") || "step";
    }
    return "page";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getHostRoot() {
    return (
      document.getElementById("u4hBody") ||
      document.getElementById("u4-human-app") ||
      document.getElementById("u4App") ||
      document.querySelector("main") ||
      document.body
    );
  }

  function isOwnPinChrome(el) {
    if (!el || !el.closest) return false;
    return !!(
      el.closest(".u4-pin-bar") ||
      el.closest(".u4-pin-pop") ||
      el.closest(".u4-pin-dot") ||
      el.closest(".u4-pin-float-pill") ||
      el.closest(".u4-pin-topbar-btn") ||
      el.closest(".u4-pin-ghost") ||
      el.closest(".u4-pin-toast") ||
      el.closest("#u4PinAutoToast") ||
      el.closest(".u4h-topbar") ||
      el.closest(".u4-doc-topbar") ||
      el.closest(".u4-live-ai-root") ||
      el.closest("#u4AiFloatingDock")
    );
  }

  function findZoomableTarget(el) {
    if (!el || !el.closest) return null;
    return el.closest(".u4h-svg-wrap, .u4h-photo-card, .u4b-photo, .ks4-svg-wrap, #viewport");
  }

  function findSemanticBlock(el, host) {
    if (!el || el === host || el === document.body || el === document.documentElement) return host;
    if (el.closest) {
      var b = el.closest(
        "tr, label.u4b-check, .u4b-step-item, .u4h-step-card, .u4b-box, .u4b-kpi, .unknown-gap, " +
        ".hold, details, figure, li, h1, h2, h3, h4, p, blockquote, .u4b-ctrl-row, .u4b-card, section"
      );
      if (b && host.contains(b)) return b;
    }
    return host;
  }

  function cleanSnippet(raw) {
    return String(raw || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 110);
  }

  function extractContextSnippet(blockEl, hitEl, host) {
    var cand = "";
    if (hitEl && hitEl !== host && hitEl.getAttribute) {
      cand = hitEl.getAttribute("aria-label") || hitEl.getAttribute("alt") || "";
    }
    if (!cand && blockEl && blockEl !== host) {
      cand = blockEl.innerText || blockEl.textContent || "";
    }
    if (!cand && hitEl && hitEl !== host) {
      cand = hitEl.innerText || hitEl.textContent || "";
    }
    var cleaned = cleanSnippet(cand);
    return cleaned || tr("pageSpot");
  }

  function findSafePopoverInsertionPoint(anchorEl, host) {
    if (!anchorEl || anchorEl === host) return { parent: host, after: host.firstElementChild };
    var cur = anchorEl;
    var tableWrap = cur.closest ? (cur.closest(".u4b-table-wrap") || cur.closest("table")) : null;
    if (tableWrap && host.contains(tableWrap)) {
      cur = tableWrap;
    }
    var svgRoot = cur.closest ? cur.closest("svg") : null;
    if (svgRoot) {
      cur = svgRoot.parentElement || host;
    }
    while (cur && cur.parentElement && cur.parentElement !== host) {
      var disp = "";
      try { disp = window.getComputedStyle(cur.parentElement).display || ""; } catch (_) {}
      if (disp.indexOf("grid") >= 0 || disp.indexOf("flex") >= 0 || cur.parentElement.classList.contains("u4b-photos") || cur.parentElement.classList.contains("u4h-photo-grid")) {
        cur = cur.parentElement;
      } else {
        break;
      }
    }
    if (!cur || !cur.parentNode || !host.contains(cur)) {
      return { parent: host, after: host.firstElementChild };
    }
    return { parent: cur.parentNode, after: cur };
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
    if (!document.getElementById("u4PinFloatingPill")) {
      var fp = document.createElement("button");
      fp.type = "button";
      fp.id = "u4PinFloatingPill";
      fp.className = "u4-pin-float-pill no-print";
      fp.setAttribute("aria-pressed", state.armed ? "true" : "false");
      fp.textContent = tr("chip");
      wireDragAndArmButton(fp);
      document.body.appendChild(fp);
    }
    var topRight = document.querySelector(".u4h-topbar .u4h-nav-right, .u4-doc-topbar .u4-doc-topbar-right, header .preferences");
    if (topRight && !document.getElementById("u4TopbarPinBtn")) {
      var tb = document.createElement("button");
      tb.type = "button";
      tb.id = "u4TopbarPinBtn";
      tb.className = "u4-pin-topbar-btn no-print";
      tb.setAttribute("aria-pressed", state.armed ? "true" : "false");
      tb.textContent = tr("shortChip");
      tb.title = tr("chip");
      wireDragAndArmButton(tb);
      topRight.insertBefore(tb, topRight.firstChild);
    }
  }

  function showToast(msg) {
    ensureGlobalChrome();
    var t = document.getElementById("u4PinToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { t.classList.remove("is-show"); }, 3400);
  }

  function hideToast() {
    var t = document.getElementById("u4PinToast");
    if (t) t.classList.remove("is-show");
    clearTimeout(state.toastTimer);
  }

  function u4ShowEphemeralToast(jobId) {
    var el = document.getElementById("u4PinAutoToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "u4PinAutoToast";
      el.style.cssText = "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:99999;background:#1d2b24;color:#f4f5f3;padding:10px 16px;border-radius:8px;font:600 13px/1.4 'IBM Plex Sans',sans-serif;border:1px solid #355444;max-width:92vw;text-align:center;";
      document.body.appendChild(el);
    }
    el.textContent = tr("sentOk");
    el.style.display = "block";
    if (!jobId) {
      setTimeout(function () { el.style.display = "none"; }, 4500);
      return;
    }
    var tries = 0;
    var poll = setInterval(async function () {
      tries++;
      try {
        var r = await fetch("https://mac-mini.tailcf4007.ts.net/api/unit4/pin-jobs/" + encodeURIComponent(jobId));
        if (r.ok) {
          var j = await r.json();
          var lang = getLang();
          if (j.status === "pushed") {
            var sText = lang === "es" ? (j.summaryEs || j.summaryEn || "") : (j.summaryEn || "");
            el.textContent = (lang === "es" ? "✓ Aplicado y publicado: " : lang === "ru" ? "✓ Применено и опубликовано: " : "✓ Applied & pushed: ") + sText;
            clearInterval(poll);
            setTimeout(function () { el.style.display = "none"; }, 6500);
          } else if (j.status === "held" || j.status === "error") {
            el.textContent = tr("sentHeld");
            clearInterval(poll);
            setTimeout(function () { el.style.display = "none"; }, 5500);
          }
        }
      } catch (_) {}
      if (tries > 36) {
        clearInterval(poll);
        el.style.display = "none";
      }
    }, 2000);
  }

  function syncArmedUi() {
    var host = getHostRoot();
    if (host) {
      host.classList.toggle("u4-pin-host-surface", true);
      host.classList.toggle("is-pin-armed", state.armed);
    }
    ["u4PinArmBtn", "u4PinFloatingPill", "u4TopbarPinBtn"].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) {
        b.classList.toggle("is-armed", state.armed);
        b.setAttribute("aria-pressed", state.armed ? "true" : "false");
      }
    });
    if (host && host.querySelectorAll) {
      Array.prototype.slice.call(host.querySelectorAll(".u4h-svg-wrap, .u4h-photo-card, .u4b-photo, #viewport")).forEach(function (el) {
        el.classList.toggle("is-pin-armed", state.armed);
      });
    }
  }

  function setArmed(val, quiet) {
    state.armed = !!val;
    syncArmedUi();
    if (state.armed && !quiet) {
      showToast(tr("armedToast"));
    } else if (!state.armed) {
      hideToast();
    }
  }

  function resolveSurfaceBox(zoomEl, host) {
    if (zoomEl && zoomEl.querySelector) {
      return zoomEl.querySelector(".u4-zoom-stage") || zoomEl.querySelector("#drawing") || zoomEl;
    }
    return host;
  }

  function dropPinAnywhere(clientX, clientY, forcedHitEl) {
    var host = getHostRoot();
    if (!host) return false;

    var ghost = document.getElementById("u4PinGhost");
    var prevGhostDisp = ghost ? ghost.style.display : "";
    if (ghost) ghost.style.display = "none";
    var hitEl = forcedHitEl || (document.elementFromPoint ? document.elementFromPoint(clientX, clientY) : host);
    if (ghost) ghost.style.display = prevGhostDisp;

    if (!hitEl) hitEl = host;
    if (isOwnPinChrome(hitEl)) return false;
    if (!host.contains(hitEl) && hitEl !== document.body && hitEl !== document.documentElement) {
      var hRect = host.getBoundingClientRect();
      if (clientY < hRect.top - 24 || clientY > hRect.bottom + 40) return false;
      hitEl = host;
    }

    var zoomEl = findZoomableTarget(hitEl);
    var surfaceEl = resolveSurfaceBox(zoomEl, host);
    var blockEl = zoomEl || findSemanticBlock(hitEl, host);
    var rect = surfaceEl.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return false;

    var rawX = ((clientX - rect.left) / rect.width) * 100;
    var rawY = ((clientY - rect.top) / rect.height) * 100;
    var xPct = Math.max(2, Math.min(98, +rawX.toFixed(1)));
    var yPct = Math.max(2, Math.min(98, +rawY.toFixed(1)));

    var snippet = extractContextSnippet(blockEl, hitEl, host);
    var pin = {
      id: "u4pin-" + (state.nextId++),
      num: state.pins.length + 1,
      stepKey: getActiveStepKey(),
      isZoomSurface: !!zoomEl,
      surfaceEl: surfaceEl,
      blockEl: blockEl,
      snippet: snippet,
      xPct: xPct,
      yPct: yPct,
      intent: "fix",
      text: "",
      status: "",
      statusErr: false
    };

    state.pins.push(pin);
    state.selectedPinId = pin.id;
    setArmed(false, true);
    renderAllLayers();

    var inp = document.getElementById("u4PinInput_" + pin.id);
    if (inp && typeof inp.focus === "function") {
      try { inp.focus({ preventScroll: true }); } catch (_) { inp.focus(); }
    }
    return true;
  }

  async function submitPinCorrection(pin) {
    if (!pin || state.sendingId) return;
    var inp = document.getElementById("u4PinInput_" + pin.id);
    var liveVal = inp ? String(inp.value || "") : String(pin.text || "");
    pin.text = liveVal;
    var note = liveVal.trim();
    if (!note) {
      showToast(tr("emptyToast"));
      if (inp && inp.focus) inp.focus();
      return;
    }

    var planId = getPlanId();
    var roomKey = getRoomKey();
    var locTag = planId + " [" + pin.stepKey + " · " + pin.snippet + " @ " + pin.xPct + "%, " + pin.yPct + "%]";

    if (pin.intent === "ask") {
      if (window.U4LiveAi && typeof window.U4LiveAi.open === "function") {
        window.U4LiveAi.open(note, locTag);
        state.pins = [];
        state.selectedPinId = null;
        state.armed = false;
        renderAllLayers();
        showToast(tr("sentAi"));
        return;
      }
    }

    state.sendingId = pin.id;
    pin.status = tr("sending");
    pin.statusErr = false;
    renderAllLayers();

    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 12000) : null;

    var summaryLine = "[" + planId + " · " + pin.stepKey + "] " + note.slice(0, 120);
    var detailsBlock =
      "Plan/Page: " + planId + "\n" +
      "Step/Section: " + pin.stepKey + "\n" +
      "Pinned Element: " + pin.snippet + "\n" +
      "Coordinates: (" + pin.xPct + "%, " + pin.yPct + "%)\n" +
      "Correction: " + note;

    var payload = {
      room: roomKey === "home" ? "general" : roomKey,
      roomKey: roomKey === "home" ? "general" : roomKey,
      document_id: planId,
      edit_kind: "pin_correction",
      source: "wiki-pin-dragger",
      commandSource: "wiki_pin_correction",
      lang: getLang(),
      summary: summaryLine,
      details: detailsBlock,
      text: note,
      target_text: pin.snippet,
      step_key: pin.stepKey,
      x_pct: typeof pin.xPct === "number" ? pin.xPct : null,
      y_pct: typeof pin.yPct === "number" ? pin.yPct : null
    };

    try {
      var fetchOpts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      };
      if (ctrl) fetchOpts.signal = ctrl.signal;
      var res = await fetch(INTAKE_URL, fetchOpts);
      if (timer) clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      var resData = {};
      try { resData = await res.json(); } catch (_) {}
      state.sendingId = null;
      state.pins = [];
      state.selectedPinId = null;
      state.armed = false;
      renderAllLayers();
      u4ShowEphemeralToast(resData && resData.jobId ? resData.jobId : "");
    } catch (err) {
      if (timer) clearTimeout(timer);
      state.sendingId = null;
      pin.statusErr = true;
      pin.status = (err && err.name === "AbortError") ? tr("errTimeout") : tr("errNet");
      renderAllLayers();
    }
  }

  function startVoiceInput(pin) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast("Voice dictation not supported in this browser");
      return;
    }
    if (state.recognition && state.listeningPinId === pin.id) {
      try { state.recognition.stop(); } catch (_) {}
      state.listeningPinId = null;
      renderAllLayers();
      return;
    }
    var rec = new SR();
    var lang = getLang();
    rec.lang = lang === "es" ? "es-MX" : lang === "ru" ? "ru-RU" : "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    state.recognition = rec;
    state.listeningPinId = pin.id;
    renderAllLayers();
    rec.onresult = function (ev) {
      var txt = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : "";
      if (txt) {
        var inp = document.getElementById("u4PinInput_" + pin.id);
        var cur = inp ? inp.value : pin.text;
        pin.text = (cur ? cur + " " : "") + txt;
        if (inp) inp.value = pin.text;
      }
    };
    rec.onend = function () {
      state.listeningPinId = null;
      renderAllLayers();
    };
    rec.onerror = function () {
      state.listeningPinId = null;
      renderAllLayers();
    };
    try { rec.start(); } catch (_) { state.listeningPinId = null; renderAllLayers(); }
  }

  function wireDragAndArmButton(btn) {
    if (!btn || btn.dataset.u4PinWired === "1") return;
    btn.dataset.u4PinWired = "1";

    var dragging = false;
    var moved = false;
    var startX = 0;
    var startY = 0;

    btn.addEventListener("pointerdown", function (ev) {
      if (ev.button && ev.button !== 0) return;
      ev.preventDefault();
      dragging = true;
      moved = false;
      startX = ev.clientX;
      startY = ev.clientY;
      ensureGlobalChrome();
      try { btn.setPointerCapture(ev.pointerId); } catch (_) {}
    });

    btn.addEventListener("pointermove", function (ev) {
      if (!dragging) return;
      var dx = ev.clientX - startX;
      var dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 6) {
        moved = true;
      }
      if (moved) {
        var g = document.getElementById("u4PinGhost");
        if (g) {
          g.classList.add("is-active");
          g.style.left = ev.clientX + "px";
          g.style.top = ev.clientY + "px";
        }
      }
    });

    function finishPointer(ev, cancelled) {
      if (!dragging) return;
      dragging = false;
      try { btn.releasePointerCapture(ev.pointerId); } catch (_) {}
      var g = document.getElementById("u4PinGhost");
      if (g) g.classList.remove("is-active");
      if (cancelled) return;
      if (moved) {
        dropPinAnywhere(ev.clientX, ev.clientY, null);
      } else {
        setArmed(!state.armed, false);
      }
    }

    btn.addEventListener("pointerup", function (ev) { finishPointer(ev, false); });
    btn.addEventListener("pointercancel", function (ev) { finishPointer(ev, true); });
  }

  function buildPinDot(pin, idx) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "u4-pin-dot no-print" + (state.selectedPinId === pin.id ? " is-selected" : "");
    dot.style.left = pin.xPct + "%";
    dot.style.top = pin.yPct + "%";
    dot.title = "#" + (idx + 1) + " · " + pin.snippet;
    dot.innerHTML = '<span class="u4-pin-dot-num">' + (idx + 1) + "</span>";

    var moving = false;
    var didDrag = false;
    dot.addEventListener("pointerdown", function (ev) {
      ev.stopPropagation();
      ev.preventDefault();
      moving = true;
      didDrag = false;
      state.selectedPinId = pin.id;
      try { dot.setPointerCapture(ev.pointerId); } catch (_) {}
    });
    dot.addEventListener("pointermove", function (ev) {
      if (!moving || !pin.surfaceEl) return;
      didDrag = true;
      var r = pin.surfaceEl.getBoundingClientRect();
      if (!r.width || !r.height) return;
      pin.xPct = Math.max(2, Math.min(98, +(((ev.clientX - r.left) / r.width) * 100).toFixed(1)));
      pin.yPct = Math.max(2, Math.min(98, +(((ev.clientY - r.top) / r.height) * 100).toFixed(1)));
      dot.style.left = pin.xPct + "%";
      dot.style.top = pin.yPct + "%";
    });
    dot.addEventListener("pointerup", function (ev) {
      if (!moving) return;
      moving = false;
      try { dot.releasePointerCapture(ev.pointerId); } catch (_) {}
      if (didDrag) {
        var host = getHostRoot();
        dot.style.display = "none";
        var under = document.elementFromPoint ? document.elementFromPoint(ev.clientX, ev.clientY) : null;
        dot.style.display = "";
        if (under && host && !isOwnPinChrome(under)) {
          var blk = findZoomableTarget(under) || findSemanticBlock(under, host);
          pin.blockEl = blk;
          pin.snippet = extractContextSnippet(blk, under, host);
        }
      }
      renderAllLayers();
    });
    return dot;
  }

  function buildPopover(pin, idx) {
    var pop = document.createElement("div");
    pop.className = "u4-pin-pop no-print";
    pop.setAttribute("role", "region");
    pop.setAttribute("aria-label", "Pin #" + (idx + 1));

    var isSending = state.sendingId === pin.id;
    var isListening = state.listeningPinId === pin.id;

    pop.innerHTML =
      '<div class="u4-pin-pop-head">' +
        '<span class="u4-pin-pop-ctx">#' + (idx + 1) + " · " + esc(pin.snippet) + "</span>" +
        '<button type="button" class="u4-pin-clear-btn" data-pin-act="remove">' + esc(tr("remove")) + "</button>" +
      "</div>" +
      '<div class="u4-pin-intents">' +
        '<button type="button" class="u4-pin-int-btn' + (pin.intent === "fix" ? " is-active" : "") + '" data-pin-intent="fix">' + esc(tr("fixTab")) + "</button>" +
        '<button type="button" class="u4-pin-int-btn' + (pin.intent === "ask" ? " is-active" : "") + '" data-pin-intent="ask">' + esc(tr("askTab")) + "</button>" +
      "</div>" +
      '<div class="u4-pin-row">' +
        '<input type="text" id="u4PinInput_' + pin.id + '" value="' + esc(pin.text) + '" placeholder="' + esc(pin.intent === "fix" ? tr("fixPh") : tr("askPh")) + '" ' + (isSending ? "disabled" : "") + ">" +
        '<button type="button" class="u4-pin-act' + (isListening ? " is-listening" : "") + '" data-pin-act="mic" title="' + esc(tr("micTitle")) + '">🎤</button>' +
        '<button type="button" class="u4-pin-act is-primary" data-pin-act="submit" ' + (isSending ? "disabled" : "") + ">" +
          esc(isSending ? tr("sending") : (pin.intent === "fix" ? tr("sendFix") : tr("sendAsk"))) +
        "</button>" +
      "</div>" +
      (pin.status
        ? '<div class="u4-pin-foot"><span class="u4-pin-status' + (pin.statusErr ? " is-err" : "") + '">' + esc(pin.status) + "</span></div>"
        : "");

    var inp = pop.querySelector("input");
    if (inp) {
      inp.addEventListener("input", function () { pin.text = inp.value; });
      inp.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          ev.preventDefault();
          submitPinCorrection(pin);
        } else if (ev.key === "Escape") {
          state.selectedPinId = null;
          renderAllLayers();
        }
      });
    }

    Array.prototype.slice.call(pop.querySelectorAll("[data-pin-intent]")).forEach(function (b) {
      b.addEventListener("click", function () {
        if (inp) pin.text = inp.value;
        pin.intent = b.getAttribute("data-pin-intent") || "fix";
        renderAllLayers();
        var nextInp = document.getElementById("u4PinInput_" + pin.id);
        if (nextInp) nextInp.focus();
      });
    });

    var rmBtn = pop.querySelector("[data-pin-act='remove']");
    if (rmBtn) {
      rmBtn.addEventListener("click", function () {
        state.pins = state.pins.filter(function (p) { return p.id !== pin.id; });
        if (state.selectedPinId === pin.id) {
          state.selectedPinId = state.pins.length ? state.pins[state.pins.length - 1].id : null;
        }
        renderAllLayers();
      });
    }

    var micBtn = pop.querySelector("[data-pin-act='mic']");
    if (micBtn) {
      micBtn.addEventListener("click", function () { startVoiceInput(pin); });
    }

    var subBtn = pop.querySelector("[data-pin-act='submit']");
    if (subBtn) {
      subBtn.addEventListener("click", function () { submitPinCorrection(pin); });
    }

    return pop;
  }

  function renderAllLayers() {
    var host = getHostRoot();
    if (!host) return;

    state.SuppressObserver = true;
    try {
      ensureGlobalChrome();

      Array.prototype.slice.call(document.querySelectorAll(".u4-pin-layer, .u4-pin-page-layer, .u4-pin-pop")).forEach(function (n) {
        if (n.parentNode) n.parentNode.removeChild(n);
      });
      Array.prototype.slice.call(document.querySelectorAll(".u4-pin-highlighted-el")).forEach(function (n) {
        n.classList.remove("u4-pin-highlighted-el");
      });

      var curLangCode = getLang();
      var fp = document.getElementById("u4PinFloatingPill");
      if (fp) {
        fp.textContent = tr("chip");
        fp.dataset.lang = curLangCode;
      }
      var tb = document.getElementById("u4TopbarPinBtn");
      if (tb) {
        tb.textContent = tr("shortChip");
        tb.title = tr("chip");
        tb.dataset.lang = curLangCode;
      }

      var bar = document.getElementById("u4PinBar");
      if (!bar) {
        bar = document.createElement("div");
        bar.id = "u4PinBar";
        bar.className = "u4-pin-bar no-print";
      }
      bar.dataset.lang = curLangCode;
      var curStep = getActiveStepKey();
      var activePins = state.pins.filter(function (p) {
        return p.stepKey === curStep && p.surfaceEl && document.body.contains(p.surfaceEl);
      });

      bar.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0">' +
          '<button type="button" id="u4PinArmBtn" class="u4-pin-arm-btn' + (state.armed ? " is-armed" : "") + '" aria-pressed="' + (state.armed ? "true" : "false") + '">' +
            '<span class="u4-pin-chip">' + esc(tr("chip")) + "</span>" +
          "</button>" +
          '<span class="u4-pin-hint">' + esc(tr("hint")) + "</span>" +
        "</div>" +
        (activePins.length
          ? '<button type="button" id="u4PinClearAllBtn" class="u4-pin-clear-btn">' + esc(tr("clearAll")) + " (" + activePins.length + ")</button>"
          : "");

      if (host.firstElementChild !== bar) {
        host.insertBefore(bar, host.firstElementChild);
      }
      var armBtn = document.getElementById("u4PinArmBtn");
      if (armBtn) wireDragAndArmButton(armBtn);
      var clrBtn = document.getElementById("u4PinClearAllBtn");
      if (clrBtn) {
        clrBtn.addEventListener("click", function () {
          state.pins = [];
          state.selectedPinId = null;
          renderAllLayers();
        });
      }

      syncArmedUi();

      activePins.forEach(function (pin, idx) {
        var layerClass = pin.isZoomSurface ? "u4-pin-layer" : "u4-pin-page-layer";
        var surface = pin.surfaceEl || host;
        surface.classList.add(pin.isZoomSurface ? "u4-pin-target" : "u4-pin-host-surface");
        var layer = surface.querySelector(":scope > ." + layerClass);
        if (!layer) {
          layer = document.createElement("div");
          layer.className = layerClass + " no-print";
          surface.appendChild(layer);
        }
        layer.appendChild(buildPinDot(pin, idx));

        if (state.selectedPinId === pin.id) {
          if (pin.blockEl && pin.blockEl !== host && !pin.isZoomSurface) {
            pin.blockEl.classList.add("u4-pin-highlighted-el");
          }
          var pop = buildPopover(pin, idx);
          var ins = findSafePopoverInsertionPoint(pin.blockEl || surface, host);
          if (ins.parent && ins.after && ins.after.parentNode === ins.parent) {
            ins.parent.insertBefore(pop, ins.after.nextSibling);
          } else {
            host.insertBefore(pop, bar.nextSibling);
          }
        }
      });
    } finally {
      setTimeout(function () { state.SuppressObserver = false; }, 0);
    }
  }

  function installGlobalListeners() {
    if (window.__u4PageWidePinInstalled) return;
    window.__u4PageWidePinInstalled = true;

    document.addEventListener("click", function (ev) {
      if (!state.armed) return;
      if (isOwnPinChrome(ev.target)) return;
      ev.preventDefault();
      ev.stopPropagation();
      dropPinAnywhere(ev.clientX, ev.clientY, ev.target);
    }, true);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && state.armed) {
        setArmed(false, true);
      }
    });

    window.addEventListener("message", function (ev) {
      var d = ev && ev.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "u4:pin-arm") {
        setArmed(!!d.armed, false);
      } else if (d.type === "u4:pin-drop-client") {
        var x = typeof d.xRatio === "number" ? d.xRatio * window.innerWidth : (d.clientX || window.innerWidth / 2);
        var y = typeof d.yRatio === "number" ? d.yRatio * window.innerHeight : (d.clientY || 160);
        var ok = dropPinAnywhere(x, y, null);
        if (ev.source && typeof ev.source.postMessage === "function") {
          try {
            ev.source.postMessage({ type: "u4:pin-drop-ack", ok: ok, planId: getPlanId(), reqId: d.reqId || "" }, "*");
          } catch (_) {}
        }
      }
    });

    if (typeof MutationObserver === "function") {
      state.langObserver = new MutationObserver(function () {
        if (!state.SuppressObserver) renderAllLayers();
      });
      state.langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "data-theme"] });
    }
    window.addEventListener("u4:lang-change", function () { renderAllLayers(); });
  }

  function attach() {
    installGlobalListeners();
    var host = getHostRoot();
    if (!host) return;
    renderAllLayers();
    if (!state.observer && typeof MutationObserver === "function") {
      state.observer = new MutationObserver(function () {
        if (state.SuppressObserver) return;
        ensureGlobalChrome();
        if (!document.getElementById("u4PinBar")) {
          renderAllLayers();
        }
      });
      state.observer.observe(host, { childList: true });
      var topHeader = document.getElementById("u4hTopbar");
      if (topHeader) {
        state.observer.observe(topHeader, { childList: true });
      }
    }
    setTimeout(ensureGlobalChrome, 90);
  }

  window.U4PinDragger = {
    attach: attach,
    setArmed: setArmed,
    dropPinAnywhere: dropPinAnywhere,
    clearAll: function () {
      state.pins = [];
      state.selectedPinId = null;
      renderAllLayers();
    },
    _getState: function () { return state; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attach);
  } else {
    attach();
  }
})();
