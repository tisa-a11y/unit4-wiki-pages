/* ============================================================================
   Unit 4 Interactive Plans — Live AI Chat & Voice Guidance Widget
   Zero External CDNs · Zero Prices · Zero Storage · Bilingual EN / MX-ES
   Wired to Mac mini :8791 (/api/unit4/voice-token, /knowledge, /wiki-intake)
   ============================================================================ */
(function () {
  "use strict";

  var BACKEND_ORIGIN = "https://mac-mini.tailcf4007.ts.net";
  var VOICE_TOKEN_URL = BACKEND_ORIGIN + "/api/unit4/voice-token";
  var KNOWLEDGE_URL = BACKEND_ORIGIN + "/api/unit4/knowledge";
  var INTAKE_URL = BACKEND_ORIGIN + "/api/unit4/wiki-intake";

  var cfg = {
    planId: "unit4-plan",
    room: "kitchen",
    titleEn: "Unit 4 Interactive Plan",
    titleEs: "Plano Interactivo Unidad 4",
    getContext: null,
    quickPrompts: null
  };

  var state = {
    lang: "en",
    open: false,
    liveActive: false,
    liveConnecting: false,
    muted: false,
    ws: null,
    micStream: null,
    inCtx: null,
    outCtx: null,
    processor: null,
    playCursor: 0,
    playSources: [],
    generation: 0,
    stagedPhoto: null,
    noteMode: false,
    streamBubble: null,
    streamRole: ""
  };

  function isEs() {
    return state.lang === "es";
  }

  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pcm16ToBase64(float32Arr, inRate) {
    var outRate = 16000;
    var ratio = inRate / outRate;
    var outLen = Math.max(1, Math.floor(float32Arr.length / ratio));
    var buf = new ArrayBuffer(outLen * 2);
    var view = new DataView(buf);
    for (var i = 0; i < outLen; i++) {
      var idx = Math.min(float32Arr.length - 1, Math.floor(i * ratio));
      var sample = Math.max(-1, Math.min(1, float32Arr[idx]));
      view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }
    var bytes = new Uint8Array(buf);
    var bin = "";
    for (var j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
    return btoa(bin);
  }

  function playBase64Pcm24k(b64) {
    if (!state.outCtx || state.muted) return;
    try {
      var bin = atob(b64);
      var len = Math.floor(bin.length / 2);
      var f32 = new Float32Array(len);
      for (var i = 0; i < len; i++) {
        var lo = bin.charCodeAt(i * 2);
        var hi = bin.charCodeAt(i * 2 + 1);
        var val = (hi << 8) | lo;
        if (val >= 0x8000) val -= 0x10000;
        f32[i] = val / 0x8000;
      }
      var abuf = state.outCtx.createBuffer(1, len, 24000);
      abuf.getChannelData(0).set(f32);
      var src = state.outCtx.createBufferSource();
      src.buffer = abuf;
      src.connect(state.outCtx.destination);
      var now = state.outCtx.currentTime;
      if (state.playCursor < now) state.playCursor = now + 0.02;
      src.start(state.playCursor);
      state.playCursor += abuf.duration;
      state.playSources.push(src);
      src.onended = function () {
        var idx = state.playSources.indexOf(src);
        if (idx >= 0) state.playSources.splice(idx, 1);
      };
    } catch (_) {}
  }

  function stopAudioPlayback() {
    state.playSources.forEach(function (s) { try { s.stop(); } catch (_) {} });
    state.playSources = [];
    if (state.outCtx) state.playCursor = state.outCtx.currentTime;
  }

  function appendMsg(role, text) {
    var log = document.getElementById("u4LaiLog");
    if (!log) return null;
    state.streamBubble = null;
    state.streamRole = "";
    var div = document.createElement("div");
    div.className = "u4-lai-msg is-" + role;
    div.textContent = String(text || "");
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function appendStreamChunk(role, chunk) {
    var log = document.getElementById("u4LaiLog");
    if (!log || !chunk) return;
    if (state.streamBubble && state.streamRole === role) {
      state.streamBubble.textContent += chunk;
    } else {
      state.streamBubble = appendMsg(role, chunk);
      state.streamRole = role;
    }
    log.scrollTop = log.scrollHeight;
  }

  function setStatus(text) {
    var el = document.getElementById("u4LaiStatus");
    if (el) el.textContent = text;
  }

  function syncUi() {
    var dock = document.getElementById("u4LaiDock");
    var dlg = document.getElementById("u4LaiDialog");
    var pillLbl = document.getElementById("u4LaiPillLbl");
    var badge = document.getElementById("u4LaiBadge");
    var qMute = document.getElementById("u4LaiQuickMute");
    var titleEl = document.getElementById("u4LaiTitle");
    var voiceBtn = document.getElementById("u4LaiVoiceBtn");
    var muteBtn = document.getElementById("u4LaiMuteBtn");
    var inp = document.getElementById("u4LaiInput");
    var photoBtn = document.getElementById("u4LaiPhotoBtn");
    var camBtn = document.getElementById("u4LaiCamBtn");
    var noteBtn = document.getElementById("u4LaiNoteBtn");
    var es = isEs();

    if (dock) dock.setAttribute("data-live", state.liveActive ? "on" : "off");
    if (dlg) {
      dlg.setAttribute("data-live", state.liveActive ? "on" : "off");
      dlg.hidden = !state.open;
    }
    if (pillLbl) pillLbl.textContent = es ? "Ayuda IA / Voz" : "AI Helper / Voice";
    if (badge) badge.textContent = state.liveActive ? (es ? "VIVO" : "LIVE") : (state.liveConnecting ? "..." : (es ? "CHAT" : "ASK"));
    if (titleEl) titleEl.textContent = es ? "Guía IA en Vivo · Unidad 4" : "Live AI Guidance · Unit 4";

    if (voiceBtn) {
      voiceBtn.setAttribute("aria-pressed", state.liveActive ? "true" : "false");
      voiceBtn.textContent = state.liveConnecting
        ? (es ? "Conectando..." : "Connecting...")
        : (state.liveActive ? (es ? "Detener voz" : "Stop voice") : (es ? "Iniciar voz" : "Start voice"));
    }
    if (muteBtn) {
      muteBtn.hidden = !state.liveActive;
      muteBtn.setAttribute("aria-pressed", state.muted ? "true" : "false");
      muteBtn.textContent = state.muted ? (es ? "Activar mic" : "Unmute") : (es ? "Silenciar" : "Mute");
    }
    if (qMute) {
      qMute.hidden = !state.liveActive;
      qMute.setAttribute("aria-pressed", state.muted ? "true" : "false");
      qMute.textContent = state.muted ? (es ? "🔇 Silenciado" : "🔇 Muted") : (es ? "🎙 Silenciar" : "🎙 Mute");
    }
    if (photoBtn) photoBtn.textContent = es ? "📎 Foto" : "📎 Photo";
    if (camBtn) camBtn.textContent = es ? "📷 Cámara" : "📷 Camera";
    if (noteBtn) {
      noteBtn.textContent = state.noteMode
        ? (es ? "✓ Modo nota de obra" : "✓ Field note mode")
        : (es ? "📝 Enviar nota / medida" : "📝 Log note / measurement");
    }
    if (inp) {
      inp.placeholder = state.noteMode
        ? (es ? "Escribe medida o nota para enviar al PM..." : "Type field measurement or note to log for PM...")
        : (es ? "Pregunta sobre este plano o toca Iniciar voz..." : "Ask a question about this plan or tap Start voice...");
    }

    renderChips();
  }

  function renderChips() {
    var box = document.getElementById("u4LaiChips");
    if (!box) return;
    var es = isEs();
    var prompts = typeof cfg.quickPrompts === "function"
      ? cfg.quickPrompts(state.lang)
      : (Array.isArray(cfg.quickPrompts) ? cfg.quickPrompts : [
          es ? "¿Qué debemos medir antes de cortar?" : "What must we measure before cutting?",
          es ? "¿Qué bloqueos activos hay aquí?" : "What holds apply on this plan?",
          es ? "¿Qué herramientas y suministros ocupo?" : "What tools and supplies do I need?"
        ]);
    box.innerHTML = (prompts || []).slice(0, 3).map(function (p) {
      return '<button type="button" class="u4-lai-chip">' + escHtml(p) + "</button>";
    }).join("");
    Array.prototype.slice.call(box.querySelectorAll(".u4-lai-chip")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.noteMode = false;
        syncUi();
        handleUserText(btn.textContent);
      });
    });
  }

  function buildContextSummary() {
    var extra = "";
    if (typeof cfg.getContext === "function") {
      try { extra = String(cfg.getContext(state.lang) || ""); } catch (_) {}
    }
    return "Active Interactive Plan: " + cfg.titleEn + " (" + cfg.planId + ", room=" + cfg.room + "). " + extra;
  }

  function stopVoiceSession() {
    state.generation += 1;
    state.liveActive = false;
    state.liveConnecting = false;
    state.muted = false;
    stopAudioPlayback();
    if (state.ws) { try { state.ws.close(); } catch (_) {} state.ws = null; }
    if (state.processor) { try { state.processor.disconnect(); } catch (_) {} state.processor = null; }
    if (state.micStream) {
      state.micStream.getTracks().forEach(function (t) { try { t.stop(); } catch (_) {} });
      state.micStream = null;
    }
    if (state.inCtx) { try { state.inCtx.close(); } catch (_) {} state.inCtx = null; }
    if (state.outCtx) { try { state.outCtx.close(); } catch (_) {} state.outCtx = null; }
    setStatus(isEs() ? "Chat listo · Toca Iniciar voz para hablar en vivo." : "Chat ready · Tap Start voice to talk live.");
    syncUi();
  }

  function toggleMute() {
    if (!state.liveActive) return;
    state.muted = !state.muted;
    if (state.muted) stopAudioPlayback();
    setStatus(state.muted
      ? (isEs() ? "Micrófono silenciado." : "Microphone muted.")
      : (isEs() ? "Escuchando en vivo..." : "Listening live..."));
    syncUi();
  }

  async function startVoiceSession(initialPrompt) {
    var es = isEs();
    if (typeof WebSocket !== "function" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      appendMsg("sys", es ? "Este navegador no soporta audio en vivo. Usa el chat escrito abajo." : "Live audio is not supported in this browser. Use text chat below.");
      return;
    }
    stopVoiceSession();
    var gen = state.generation;
    state.liveConnecting = true;
    setStatus(es ? "Conectando voz en vivo..." : "Connecting live voice...");
    syncUi();

    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.inCtx = new AudioCtx();
      state.outCtx = new AudioCtx({ sampleRate: 24000 });
      if (state.inCtx.state === "suspended") await state.inCtx.resume();
      if (state.outCtx.state === "suspended") await state.outCtx.resume();
      state.playCursor = state.outCtx.currentTime;

      var tokResp = await fetch(VOICE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: cfg.room, uiLanguage: state.lang })
      });
      var tokData = await tokResp.json().catch(function () { return null; });
      if (!tokResp.ok || !tokData || !tokData.wsUrl) {
        throw new Error((tokData && tokData.error) || ("HTTP " + tokResp.status));
      }
      if (gen !== state.generation) return;

      var stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }
      });
      if (gen !== state.generation) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        return;
      }
      state.micStream = stream;

      var ws = new WebSocket(tokData.wsUrl);
      state.ws = ws;
      var setupDone = false;

      ws.onopen = function () {
        var setupPayload = tokData.setup ? Object.assign({}, tokData.setup) : { model: tokData.model || "models/gemini-3.8-live" };
        setupPayload.inputAudioTranscription = setupPayload.inputAudioTranscription || {};
        setupPayload.outputAudioTranscription = setupPayload.outputAudioTranscription || {};
        ws.send(JSON.stringify({ setup: setupPayload }));
      };

      ws.onmessage = async function (ev) {
        if (gen !== state.generation) return;
        var raw = typeof ev.data === "string" ? ev.data : await ev.data.text();
        var msg;
        try { msg = JSON.parse(raw); } catch (_) { return; }

        if (msg.setupComplete && !setupDone) {
          setupDone = true;
          state.liveConnecting = false;
          state.liveActive = true;
          setStatus(es ? "Voz en vivo conectada — habla o escribe." : "Live voice connected — speak or type.");
          syncUi();

          ws.send(JSON.stringify({
            clientContent: {
              turns: [{
                role: "user",
                parts: [{
                  text: "Context for Unit 4 Interactive Plan Helper:\n" +
                    "- Reply concisely in the user's language (English or Mexican Spanish).\n" +
                    "- Never mention prices or private owner info. Always remind that Tisa approves open design/purchase choices.\n" +
                    "- " + buildContextSummary() +
                    (initialPrompt ? ("\nUser question: " + initialPrompt) : "")
                }]
              }],
              turnComplete: Boolean(initialPrompt)
            }
          }));

          var srcNode = state.inCtx.createMediaStreamSource(stream);
          var proc = state.inCtx.createScriptProcessor(4096, 1, 1);
          state.processor = proc;
          proc.onaudioprocess = function (aev) {
            if (!state.liveActive || state.muted || !setupDone || ws.readyState !== WebSocket.OPEN) return;
            var b64 = pcm16ToBase64(aev.inputBuffer.getChannelData(0), state.inCtx.sampleRate);
            ws.send(JSON.stringify({ realtimeInput: { audio: { mimeType: "audio/pcm;rate=16000", data: b64 } } }));
          };
          srcNode.connect(proc);
          proc.connect(state.inCtx.destination);
          return;
        }

        if (msg.serverContent) {
          var sc = msg.serverContent;
          if (sc.interrupted) {
            stopAudioPlayback();
            state.streamBubble = null;
          }
          if (!state.muted && sc.inputTranscription && sc.inputTranscription.text) {
            appendStreamChunk("user", sc.inputTranscription.text);
          }
          if (sc.outputTranscription && sc.outputTranscription.text) {
            appendStreamChunk("ai", sc.outputTranscription.text);
          }
          if (sc.modelTurn && Array.isArray(sc.modelTurn.parts)) {
            sc.modelTurn.parts.forEach(function (pt) {
              if (pt && pt.inlineData && pt.inlineData.data && String(pt.inlineData.mimeType || "").indexOf("audio/pcm") === 0) {
                playBase64Pcm24k(pt.inlineData.data);
              } else if (pt && pt.text && !pt.thought && !(sc.outputTranscription && sc.outputTranscription.text)) {
                appendStreamChunk("ai", pt.text);
              }
            });
          }
          if (sc.turnComplete) {
            state.streamBubble = null;
            state.streamRole = "";
          }
        }
      };

      ws.onerror = function () {
        if (gen !== state.generation) return;
        stopVoiceSession();
        appendMsg("sys", lnaTipText());
      };
      ws.onclose = function () {
        if ((state.liveActive || state.liveConnecting) && gen === state.generation) {
          stopVoiceSession();
        }
      };
    } catch (_) {
      if (gen !== state.generation) return;
      stopVoiceSession();
      appendMsg("sys", lnaTipText());
    }
  }

  function lnaTipText() {
    return isEs()
      ? "Si el navegador bloquea la conexión en vivo, toca el ícono a la izquierda de la dirección → Acceso a red local → Permitir. Abajo puedes seguir usando la guía local."
      : "Live helper blocked by browser? Click Site Settings left of the address bar → Local network access → Allow. Local plan guidance still works below.";
  }

  async function sendFieldNote(text) {
    var es = isEs();
    appendMsg("user", (es ? "📝 Nota: " : "📝 Note: ") + text);
    setStatus(es ? "Enviando nota al registro del proyecto..." : "Sending field note to project intake...");
    try {
      var payload = {
        room: cfg.room,
        edit_kind: "field_note",
        summary: "[" + cfg.planId + "] " + text,
        details: buildContextSummary() + "\nMessage: " + text,
        source_page: window.location.pathname + window.location.hash,
        ui_language: state.lang
      };
      if (state.stagedPhoto && state.stagedPhoto.dataUrl) {
        payload.photo_data_url = state.stagedPhoto.dataUrl;
        payload.photo_filename = state.stagedPhoto.name || "site-photo.jpg";
      }
      var res = await fetch(INTAKE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      clearStagedPhoto();
      state.noteMode = false;
      syncUi();
      appendMsg("ai", es
        ? "✓ Listo — guardamos tu nota en la bandeja del proyecto para revisión de Tisa y John."
        : "✓ Saved — your field note was sent to project intake for Tisa & John to review.");
      setStatus(es ? "Nota guardada." : "Note saved.");
    } catch (_) {
      appendMsg("sys", lnaTipText());
      setStatus(es ? "No se pudo conectar ahora." : "Could not reach live intake right now.");
    }
  }

  async function handleUserText(raw) {
    var text = String(raw || "").trim();
    if (!text) return;
    var es = isEs();

    if (state.noteMode) {
      await sendFieldNote(text);
      return;
    }

    appendMsg("user", text);

    if (state.liveActive && state.ws && state.ws.readyState === WebSocket.OPEN) {
      var parts = [{ text: buildContextSummary() + "\n" + text }];
      if (state.stagedPhoto && state.stagedPhoto.base64) {
        parts.push({ inlineData: { mimeType: state.stagedPhoto.mime || "image/jpeg", data: state.stagedPhoto.base64 } });
        clearStagedPhoto();
      }
      state.ws.send(JSON.stringify({
        clientContent: { turns: [{ role: "user", parts: parts }], turnComplete: true }
      }));
      return;
    }

    setStatus(es ? "Buscando en la guía del proyecto..." : "Searching project guidance...");
    try {
      var ctl = new AbortController();
      var timer = setTimeout(function () { ctl.abort(); }, 3600);
      var url = KNOWLEDGE_URL + "?q=" + encodeURIComponent(text) + "&room=" + encodeURIComponent(cfg.room) + "&limit=3";
      var res = await fetch(url, { signal: ctl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      var hits = (data && (data.results || data.matches || data.records)) || [];
      if (hits.length) {
        var lines = hits.slice(0, 3).map(function (h) {
          var t = h.title || h.heading || h.id || "";
          var s = h.snippet || h.summary || h.content || "";
          return (t ? "• " + t + ": " : "• ") + String(s).slice(0, 220);
        });
        appendMsg("ai", lines.join("\n\n"));
      } else {
        appendMsg("ai", localFallbackAnswer(text));
      }
      setStatus(es ? "Listo · Toca Iniciar voz para conversar." : "Ready · Tap Start voice for hands-free help.");
    } catch (_) {
      appendMsg("ai", localFallbackAnswer(text));
      appendMsg("sys", lnaTipText());
      setStatus(es ? "Mostrando guía local de este plano." : "Showing built-in plan guidance.");
    }
  }

  function localFallbackAnswer(question) {
    var es = isEs();
    var ctx = buildContextSummary();
    return (es
      ? "Contexto actual del plano:\n" + ctx + "\n\nRecuerda: ninguna decisión abierta de diseño o compra se confirma sin aprobación de Tisa. Toca '📝 Enviar nota / medida' si quieres registrar una medida de obra."
      : "Current plan guidance:\n" + ctx + "\n\nReminder: open design/finish choices or purchases always require Tisa's approval. Tap '📝 Log note / measurement' to record a field measurement.");
  }

  function clearStagedPhoto() {
    state.stagedPhoto = null;
    var bar = document.getElementById("u4LaiPhotoBar");
    if (bar) bar.hidden = true;
  }

  function handlePhotoFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var dataUrl = String(reader.result || "");
      var base64 = dataUrl.indexOf(",") >= 0 ? dataUrl.split(",")[1] : "";
      state.stagedPhoto = { name: file.name, mime: file.type || "image/jpeg", dataUrl: dataUrl, base64: base64 };
      var bar = document.getElementById("u4LaiPhotoBar");
      var img = document.getElementById("u4LaiPhotoThumb");
      var lbl = document.getElementById("u4LaiPhotoName");
      if (img) img.src = dataUrl;
      if (lbl) lbl.textContent = file.name;
      if (bar) bar.hidden = false;
      state.noteMode = true;
      syncUi();
    };
    reader.readAsDataURL(file);
  }

  function mount() {
    if (document.getElementById("u4LiveAiRoot")) return;
    var root = document.createElement("div");
    root.id = "u4LiveAiRoot";
    root.className = "u4-live-ai-root no-print";
    root.innerHTML =
      '<div id="u4LaiDock" class="u4-lai-dock" data-live="off">' +
        '<button type="button" id="u4LaiQuickMute" class="u4-lai-qmute" aria-pressed="false" hidden>🎙 Mute</button>' +
        '<button type="button" id="u4LaiPill" class="u4-lai-pill" aria-expanded="false" aria-controls="u4LaiDialog">' +
          '<span class="u4-lai-orb-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 28 28" width="22" height="22" fill="none">' +
              '<rect x="4" y="10" width="2.6" height="8" rx="1.3" fill="currentColor"/>' +
              '<rect x="8.5" y="7" width="2.6" height="14" rx="1.3" fill="currentColor"/>' +
              '<rect x="13" y="4.5" width="2.8" height="19" rx="1.4" fill="currentColor"/>' +
              '<rect x="17.5" y="8" width="2.6" height="12" rx="1.3" fill="currentColor"/>' +
              '<rect x="22" y="11" width="2.4" height="6" rx="1.2" fill="currentColor"/>' +
            "</svg>" +
          "</span>" +
          '<span id="u4LaiPillLbl">AI Helper / Voice</span>' +
          '<span id="u4LaiBadge" class="u4-lai-badge">ASK</span>' +
        "</button>" +
      "</div>" +
      '<aside id="u4LaiDialog" class="u4-lai-dialog" role="dialog" aria-label="Unit 4 Live AI Guidance" hidden>' +
        '<div class="u4-lai-head">' +
          '<div class="u4-lai-title-wrap">' +
            '<span class="u4-lai-dot" aria-hidden="true"></span>' +
            '<span id="u4LaiTitle" class="u4-lai-title">Live AI Guidance · Unit 4</span>' +
          "</div>" +
          '<div class="u4-lai-head-btns">' +
            '<button type="button" id="u4LaiMuteBtn" class="u4-lai-btn is-mute" aria-pressed="false" hidden>Mute</button>' +
            '<button type="button" id="u4LaiVoiceBtn" class="u4-lai-btn is-voice" aria-pressed="false">Start voice</button>' +
            '<button type="button" id="u4LaiCloseBtn" class="u4-lai-close" aria-label="Close AI Helper">&times;</button>' +
          "</div>" +
        "</div>" +
        '<p id="u4LaiStatus" class="u4-lai-status" role="status" aria-live="polite"></p>' +
        '<div id="u4LaiLog" class="u4-lai-log" role="log" aria-live="polite"></div>' +
        '<div class="u4-lai-foot">' +
          '<div id="u4LaiChips" class="u4-lai-chips"></div>' +
          '<div id="u4LaiPhotoBar" class="u4-lai-photo-bar" hidden>' +
            '<img id="u4LaiPhotoThumb" alt="Attached site photo">' +
            '<span id="u4LaiPhotoName" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span>' +
            '<button type="button" id="u4LaiPhotoClear" class="u4-lai-close" aria-label="Remove photo">&times;</button>' +
          "</div>" +
          '<div class="u4-lai-tools-row">' +
            '<button type="button" id="u4LaiNoteBtn" class="u4-lai-tool-btn">📝 Log note / measurement</button>' +
            '<button type="button" id="u4LaiPhotoBtn" class="u4-lai-tool-btn">📎 Photo</button>' +
            '<button type="button" id="u4LaiCamBtn" class="u4-lai-tool-btn">📷 Camera</button>' +
            '<input id="u4LaiPhotoIn" type="file" accept="image/*" hidden>' +
            '<input id="u4LaiCamIn" type="file" accept="image/*" capture="environment" hidden>' +
          "</div>" +
          '<form id="u4LaiForm" class="u4-lai-form" novalidate>' +
            '<input id="u4LaiInput" class="u4-lai-input" type="text" autocomplete="off">' +
            '<button type="submit" class="u4-lai-send" aria-label="Send">&uarr;</button>' +
          "</form>" +
        "</div>" +
      "</aside>";

    document.body.appendChild(root);

    document.getElementById("u4LaiPill").addEventListener("click", function () {
      state.open = !state.open;
      document.getElementById("u4LaiPill").setAttribute("aria-expanded", state.open ? "true" : "false");
      syncUi();
      if (state.open) {
        var log = document.getElementById("u4LaiLog");
        if (log && !log.children.length) {
          appendMsg("ai", isEs()
            ? "¡Hola! Pregúntame cualquier medida, paso o bloqueo de este plano, o toca Iniciar voz para hablar manos libres."
            : "Hi! Ask me any measurement, step, or hold on this plan, or tap Start voice for hands-free help.");
        }
        setStatus(isEs() ? "Chat listo · Toca Iniciar voz para hablar en vivo." : "Chat ready · Tap Start voice to talk live.");
      }
    });

    document.getElementById("u4LaiCloseBtn").addEventListener("click", function () {
      state.open = false;
      document.getElementById("u4LaiPill").setAttribute("aria-expanded", "false");
      syncUi();
    });

    document.getElementById("u4LaiVoiceBtn").addEventListener("click", function () {
      if (state.liveActive || state.liveConnecting) stopVoiceSession();
      else startVoiceSession("");
    });

    document.getElementById("u4LaiMuteBtn").addEventListener("click", toggleMute);
    document.getElementById("u4LaiQuickMute").addEventListener("click", toggleMute);

    document.getElementById("u4LaiNoteBtn").addEventListener("click", function () {
      state.noteMode = !state.noteMode;
      syncUi();
      var inp = document.getElementById("u4LaiInput");
      if (inp) inp.focus();
    });

    document.getElementById("u4LaiPhotoBtn").addEventListener("click", function () {
      document.getElementById("u4LaiPhotoIn").click();
    });
    document.getElementById("u4LaiCamBtn").addEventListener("click", function () {
      document.getElementById("u4LaiCamIn").click();
    });
    document.getElementById("u4LaiPhotoIn").addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) handlePhotoFile(e.target.files[0]);
      e.target.value = "";
    });
    document.getElementById("u4LaiCamIn").addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) handlePhotoFile(e.target.files[0]);
      e.target.value = "";
    });
    document.getElementById("u4LaiPhotoClear").addEventListener("click", clearStagedPhoto);

    document.getElementById("u4LaiForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var inp = document.getElementById("u4LaiInput");
      if (!inp) return;
      var q = inp.value.trim();
      if (!q) return;
      inp.value = "";
      handleUserText(q);
    });

    syncUi();
  }

  window.U4LiveAi = {
    init: function (options) {
      if (options && typeof options === "object") {
        Object.assign(cfg, options);
      }
      var params = new URLSearchParams(window.location.search || "");
      var storedLang = "";
      try { storedLang = window.localStorage.getItem("u4_lang") || ""; } catch (_) {}
      var navLang = (window.U4PlanNav && typeof window.U4PlanNav.getLang === "function") ? window.U4PlanNav.getLang() : "";
      var qLang = params.get("lang") || navLang || storedLang || document.documentElement.lang || "en";
      state.lang = qLang.toLowerCase().indexOf("es") === 0 ? "es" : "en";
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mount, { once: true });
      } else {
        mount();
      }
    },
    setLang: function (lang) {
      state.lang = String(lang || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en";
      syncUi();
    },
    refreshPrompts: function () {
      renderChips();
    },
    open: function (promptText, zoneLabel) {
      mount();
      state.open = true;
      state.noteMode = false;
      syncUi();
      var q = String(promptText || "").trim();
      if (zoneLabel && q) {
        handleUserText("[" + zoneLabel + "] " + q);
      } else if (q) {
        handleUserText(q);
      } else if (zoneLabel) {
        var inp = document.getElementById("u4LaiInput");
        if (inp) {
          inp.value = (isEs() ? "Sobre " : "About ") + zoneLabel + ": ";
          inp.focus();
        }
      }
    },
    openNote: function (prefillText) {
      mount();
      state.open = true;
      state.noteMode = true;
      syncUi();
      var inp = document.getElementById("u4LaiInput");
      if (inp) {
        inp.value = String(prefillText || "");
        inp.focus();
      }
    }
  };
})();
