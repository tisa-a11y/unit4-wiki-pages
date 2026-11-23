/* ============================================================================
   Unit 4 Interactive Plans — Live AI Chat & Voice Guidance Widget (Wave G)
   - Embedded in Persistent Shell (iframe / ?embedded=1): ZERO duplicate DOM/WS;
     forwards Ask AI / Field Note triggers via window.parent.postMessage('u4:ai-open')
   - Standalone (?standalone=1 / local): Full R9 msg.toolCall handler
     (show_plan_view, update_plan_state, capture_screen_snapshot, knowledge, intake),
     single shared AudioContext resumed AFTER getUserMedia, box-averaged 16kHz PCM,
     AudioWorklet (ScriptProcessor 2048 -> GainNode(0) fallback), 5-bar RMS meter,
     audioStreamEnd on Mute, strict single-language context & Classic 3-State UI
   ============================================================================ */
(function () {
  "use strict";

  var BACKEND_ORIGIN = "https://mac-mini.tailcf4007.ts.net";
  var VOICE_TOKEN_URL = BACKEND_ORIGIN + "/api/unit4/voice-token";
  var KNOWLEDGE_URL = BACKEND_ORIGIN + "/api/unit4/knowledge";
  var INTAKE_URL = BACKEND_ORIGIN + "/api/unit4/wiki-intake";

  var params = new URLSearchParams(window.location.search || "");
  var isEmbedded = false;
  try { isEmbedded = (window.self !== window.top) || params.has("embedded"); } catch (_) { isEmbedded = true; }

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
    hasUserMsg: false,
    ws: null,
    micStream: null,
    audioCtx: null,
    captureNode: null,
    muteGain: null,
    workletUrl: null,
    playCursor: 0,
    playSources: [],
    generation: 0,
    stagedPhoto: null,
    noteMode: false,
    streamBubble: null,
    streamRole: "",
    resumptionHandle: "",
    reconnecting: false
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

  /* Anti-aliased box-averaged downsampler (e.g. 48kHz -> 16kHz PCM16LE base64) + RMS */
  function downsampleBoxAvg16k(float32Arr, inRate) {
    var outRate = 16000;
    var ratio = inRate / outRate;
    var outLen = Math.max(1, Math.floor(float32Arr.length / ratio));
    var buf = new ArrayBuffer(outLen * 2);
    var view = new DataView(buf);
    var sumSq = 0;

    for (var i = 0; i < outLen; i++) {
      var start = Math.floor(i * ratio);
      var end = Math.min(float32Arr.length, Math.max(start + 1, Math.floor((i + 1) * ratio)));
      var acc = 0;
      for (var k = start; k < end; k++) acc += float32Arr[k];
      var sample = Math.max(-1, Math.min(1, acc / (end - start)));
      sumSq += sample * sample;
      view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    var rms = Math.sqrt(sumSq / outLen);
    var bytes = new Uint8Array(buf);
    var bin = "";
    for (var j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
    return { base64: btoa(bin), rms: rms };
  }

  function updateRmsBars(rms) {
    var lvl = state.muted ? 0 : Math.min(1, rms * 7.5);
    var weights = [0.55, 0.85, 1.0, 0.8, 0.5];
    document.querySelectorAll(".u4-lai-rms").forEach(function (meter) {
      var bars = meter.querySelectorAll("span");
      for (var i = 0; i < bars.length; i++) {
        var h = Math.round(4 + lvl * 14 * (weights[i] || 0.7));
        bars[i].style.height = h + "px";
      }
    });
  }

  function playBase64Pcm24k(b64) {
    if (!state.audioCtx || state.muted) return;
    try {
      if (state.audioCtx.state === "suspended") state.audioCtx.resume().catch(function () {});
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
      var abuf = state.audioCtx.createBuffer(1, len, 24000);
      abuf.getChannelData(0).set(f32);
      var src = state.audioCtx.createBufferSource();
      src.buffer = abuf;
      src.connect(state.audioCtx.destination);
      var now = state.audioCtx.currentTime;
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
    if (state.audioCtx) state.playCursor = state.audioCtx.currentTime;
  }

  function appendMsg(role, text) {
    var log = document.getElementById("u4LaiLog");
    if (!log) return null;
    if (role === "user") {
      state.hasUserMsg = true;
      var chips = document.getElementById("u4LaiChips");
      if (chips) chips.hidden = true;
    }
    state.streamBubble = null;
    state.streamRole = "";
    var div = document.createElement("div");
    div.className = "u4-lai-msg is-" + role;
    div.textContent = String(text || "");
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function appendSnapshotCard(dataUrl, label) {
    var log = document.getElementById("u4LaiLog");
    if (!log || !dataUrl) return;
    var card = document.createElement("div");
    card.className = "u4-lai-snap-card";
    card.innerHTML =
      '<img src="' + dataUrl + '" alt="' + escHtml(label || "Plan snapshot") + '">' +
      '<div class="u4-lai-snap-cap">' + escHtml(label || "Active plan snapshot") + "</div>";
    log.appendChild(card);
    log.scrollTop = log.scrollHeight;
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
    var el = document.getElementById("u4LaiStatusTxt");
    if (el) el.textContent = text;
  }

  function syncUi() {
    if (isEmbedded) return;
    var root = document.getElementById("u4LiveAiRoot");
    var dlg = document.getElementById("u4LaiDialog");
    var mini = document.getElementById("u4LaiMiniBar");
    var pill = document.getElementById("u4LaiPill");
    var pillLbl = document.getElementById("u4LaiPillLbl");
    var badge = document.getElementById("u4LaiBadge");
    var titleEl = document.getElementById("u4LaiTitle");
    var voiceBtn = document.getElementById("u4LaiVoiceBtn");
    var muteBtn = document.getElementById("u4LaiMuteBtn");
    var miniMute = document.getElementById("u4LaiMiniMute");
    var miniOpen = document.getElementById("u4LaiMiniOpen");
    var miniEnd = document.getElementById("u4LaiMiniEnd");
    var inp = document.getElementById("u4LaiInput");
    var noteBtn = document.getElementById("u4LaiNoteBtn");
    var chips = document.getElementById("u4LaiChips");
    var es = isEs();

    if (root) {
      root.setAttribute("data-live", state.liveActive ? "on" : "off");
      root.setAttribute("data-open", state.open ? "true" : "false");
    }
    if (dlg) dlg.hidden = !state.open;
    if (mini) mini.hidden = !state.liveActive || state.open;
    if (pill) pill.setAttribute("aria-expanded", state.open ? "true" : "false");
    if (pillLbl) pillLbl.textContent = es ? "Ayuda IA / Voz" : "AI Helper / Voice";
    if (badge) badge.textContent = state.liveConnecting ? "..." : (es ? "CHAT" : "ASK");
    if (titleEl) titleEl.textContent = es ? "Guía IA · Unidad 4" : "Live AI · Unit 4";

    if (voiceBtn) {
      voiceBtn.setAttribute("aria-pressed", state.liveActive ? "true" : "false");
      voiceBtn.textContent = state.liveConnecting
        ? (es ? "Conectando..." : "Connecting...")
        : (state.liveActive ? (es ? "Detener" : "End") : (es ? "Voz" : "Voice"));
    }
    if (muteBtn) {
      muteBtn.hidden = !state.liveActive;
      muteBtn.setAttribute("aria-pressed", state.muted ? "true" : "false");
      muteBtn.textContent = state.muted ? (es ? "Activar" : "Unmute") : (es ? "Silenciar" : "Mute");
    }
    if (miniMute) {
      miniMute.setAttribute("aria-pressed", state.muted ? "true" : "false");
      miniMute.textContent = state.muted ? (es ? "🔇 Silenciado" : "🔇 Muted") : (es ? "🎙 Silenciar" : "🎙 Mute");
    }
    if (miniOpen) miniOpen.textContent = es ? "Abrir" : "Open";
    if (miniEnd) miniEnd.textContent = es ? "Fin" : "End";
    if (noteBtn) {
      noteBtn.classList.toggle("is-active", state.noteMode);
      noteBtn.title = es ? "Modo nota de obra" : "Field note mode";
    }
    if (chips) chips.hidden = state.hasUserMsg;
    if (inp) {
      inp.placeholder = state.noteMode
        ? (es ? "Escribe nota o medida para PM..." : "Type field measurement or note...")
        : (es ? "Pregunta sobre este plano..." : "Ask about this plan...");
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
          es ? "¿Qué medir antes de cortar?" : "What must we measure first?",
          es ? "¿Qué bloqueos hay aquí?" : "What holds apply here?",
          es ? "¿Qué herramientas ocupo?" : "What tools do I need?"
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

  function buildSingleLangContext() {
    var extra = "";
    if (typeof cfg.getContext === "function") {
      try { extra = String(cfg.getContext(state.lang) || ""); } catch (_) {}
    }
    var ctrlSummary = "";
    if (window.U4PlanControl && typeof window.U4PlanControl.getState === "function") {
      try {
        var st = window.U4PlanControl.getState();
        if (st && st.summary) ctrlSummary = " " + st.summary;
      } catch (_) {}
    }
    if (isEs()) {
      return "Plano interactivo activo: " + cfg.titleEs + " (" + cfg.planId + ", cuarto=" + cfg.room + "). " + extra + ctrlSummary;
    }
    return "Active Interactive Plan: " + cfg.titleEn + " (" + cfg.planId + ", room=" + cfg.room + "). " + extra + ctrlSummary;
  }

  function stopVoiceSession() {
    state.generation += 1;
    state.liveActive = false;
    state.liveConnecting = false;
    state.muted = false;
    stopAudioPlayback();
    updateRmsBars(0);
    if (state.ws) { try { state.ws.close(); } catch (_) {} state.ws = null; }
    if (state.captureNode) { try { state.captureNode.disconnect(); } catch (_) {} state.captureNode = null; }
    if (state.muteGain) { try { state.muteGain.disconnect(); } catch (_) {} state.muteGain = null; }
    if (state.workletUrl) { try { URL.revokeObjectURL(state.workletUrl); } catch (_) {} state.workletUrl = null; }
    if (state.micStream) {
      state.micStream.getTracks().forEach(function (t) { try { t.stop(); } catch (_) {} });
      state.micStream = null;
    }
    if (state.audioCtx) { try { state.audioCtx.close(); } catch (_) {} state.audioCtx = null; }
    setStatus(isEs() ? "Listo · Toca Voz para hablar en vivo." : "Ready · Tap Voice to talk live.");
    syncUi();
  }

  function toggleMute() {
    if (!state.liveActive) return;
    state.muted = !state.muted;
    if (state.micStream) state.micStream.getAudioTracks().forEach(function (t) { t.enabled = !state.muted; });
    if (state.muted) {
      stopAudioPlayback();
      updateRmsBars(0);
      if (state.ws && state.ws.readyState === WebSocket.OPEN) {
        try { state.ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } })); } catch (_) {}
      }
    }
    setStatus(state.muted
      ? (isEs() ? "Micrófono silenciado." : "Microphone muted.")
      : (isEs() ? "Escuchando en vivo..." : "Listening live..."));
    syncUi();
  }

  async function wireMicCapture(ctx, stream, ws, isReadyFn) {
    var srcNode = ctx.createMediaStreamSource(stream);
    var zeroGain = ctx.createGain();
    zeroGain.gain.value = 0;
    state.muteGain = zeroGain;

    function sendChunk(f32) {
      if (!state.liveActive || state.muted || !isReadyFn() || ws.readyState !== WebSocket.OPEN) return;
      var out = downsampleBoxAvg16k(f32, ctx.sampleRate);
      updateRmsBars(out.rms);
      ws.send(JSON.stringify({ realtimeInput: { audio: { mimeType: "audio/pcm;rate=16000", data: out.base64 } } }));
    }

    if (ctx.audioWorklet && typeof AudioWorkletNode === "function") {
      try {
        var workletCode =
          "class U4PcmCap extends AudioWorkletProcessor {" +
          "  constructor(){ super(); this._buf = []; this._len = 0; }" +
          "  process(inputs){" +
          "    const ch = inputs[0] && inputs[0][0];" +
          "    if (!ch) return true;" +
          "    this._buf.push(new Float32Array(ch)); this._len += ch.length;" +
          "    if (this._len >= 1024){" +
          "      const out = new Float32Array(this._len); let off = 0;" +
          "      for (const b of this._buf){ out.set(b, off); off += b.length; }" +
          "      this._buf = []; this._len = 0;" +
          "      this.port.postMessage(out, [out.buffer]);" +
          "    }" +
          "    return true;" +
          "  }" +
          "}" +
          "registerProcessor('u4-pcm-cap', U4PcmCap);";
        var blob = new Blob([workletCode], { type: "application/javascript" });
        state.workletUrl = URL.createObjectURL(blob);
        await ctx.audioWorklet.addModule(state.workletUrl);
        var wn = new AudioWorkletNode(ctx, "u4-pcm-cap");
        wn.port.onmessage = function (ev) {
          if (ev.data) sendChunk(ev.data);
        };
        state.captureNode = wn;
        srcNode.connect(wn);
        wn.connect(zeroGain);
        zeroGain.connect(ctx.destination);
        return;
      } catch (_) {
        /* Fallback to ScriptProcessorNode(2048) -> GainNode(0) */
      }
    }

    var proc = ctx.createScriptProcessor(1024, 1, 1);
    state.captureNode = proc;
    proc.onaudioprocess = function (aev) {
      sendChunk(aev.inputBuffer.getChannelData(0));
    };
    srcNode.connect(proc);
    proc.connect(zeroGain);
    zeroGain.connect(ctx.destination);
  }

  async function executeToolCall(fc, ws) {
    var name = String(fc.name || "");
    var args = (fc.args && typeof fc.args === "object") ? fc.args : {};
    var respObj = { ok: true };

    try {
      if (name === "show_plan_view") {
        if (args.plan && args.plan !== cfg.planId && window.U4PlanNav) {
          var targetUrl = window.U4PlanNav.planUrl(args.plan);
          if (args.step) targetUrl += "&step=" + encodeURIComponent(args.step);
          if (args.wall) targetUrl += "&wall=" + encodeURIComponent(args.wall);
          if (args.zoom) targetUrl += "&zoom=" + encodeURIComponent(args.zoom);
          respObj = { ok: true, navigating: args.plan, url: targetUrl };
          setTimeout(function () { window.location.href = targetUrl; }, 250);
        } else {
          if (window.U4PlanControl && typeof window.U4PlanControl.showView === "function") {
            window.U4PlanControl.showView(args);
          }
          if (args.zoom != null && args.zoom !== "" && window.U4ZoomPan) {
            window.U4ZoomPan.setPrimaryZoom(args.zoom);
          }
          respObj = {
            ok: true,
            state: window.U4PlanControl ? window.U4PlanControl.getState() : { planId: cfg.planId }
          };
        }
      } else if (name === "update_plan_state") {
        if (window.U4PlanControl && typeof window.U4PlanControl.applyChange === "function") {
          window.U4PlanControl.applyChange(args);
        }
        if ((String(args.action || "").toLowerCase() === "zoom" || String(args.target || "").toLowerCase() === "zoom") && window.U4ZoomPan) {
          window.U4ZoomPan.setPrimaryZoom(args.value);
        }
        respObj = {
          ok: true,
          state: window.U4PlanControl ? window.U4PlanControl.getState() : { planId: cfg.planId }
        };
      } else if (name === "capture_screen_snapshot" || name === "capture_snapshot") {
        if (window.U4PlanNav && typeof window.U4PlanNav.captureActivePlanSnapshot === "function") {
          var snap = await window.U4PlanNav.captureActivePlanSnapshot(args);
          appendSnapshotCard(snap.dataUrl, snap.label);
          if (ws && ws.readyState === WebSocket.OPEN && snap.base64) {
            ws.send(JSON.stringify({
              realtimeInput: { video: { mimeType: snap.mimeType || "image/jpeg", data: snap.base64 } }
            }));
          }
          respObj = { ok: true, captured: true, label: snap.label, planId: snap.planId, step: snap.step, wall: snap.wall, width: snap.width, height: snap.height };
        } else {
          respObj = { ok: false, error: "snapshot_unavailable" };
        }
      } else if (name === "query_wiki_and_backend_knowledge" || name === "search_project_knowledge") {
        var q = args.query || args.q || "";
        var r = args.room || cfg.room;
        var scScope = args.scope || "all";
        var kRes = await fetch(KNOWLEDGE_URL + "?q=" + encodeURIComponent(q) + "&room=" + encodeURIComponent(r) + "&scope=" + encodeURIComponent(scScope));
        if (kRes.ok) {
          var kJson = await kRes.json();
          var kHits = ((kJson && kJson.results) || []).slice(0, 4).map(function (it) {
            return { id: it.id, room: it.room, title: it.title, excerpt: String(it.excerpt || "").slice(0, 900) };
          });
          respObj = { ok: true, count: kHits.length, results: kHits };
        } else {
          respObj = { ok: false, fallback: buildSingleLangContext() };
        }
      } else if (name === "query_todoist_cards") {
        var tdRes = await fetch(BACKEND_ORIGIN + "/api/unit4/todoist");
        var tdJson = tdRes.ok ? await tdRes.json() : {};
        var wantRoom = String(args.room || cfg.room || "all").toLowerCase();
        var kw = String(args.query || "").toLowerCase();
        var cards = [];
        ((tdJson && tdJson.rooms) || []).forEach(function (rm) {
          if (wantRoom !== "all" && String(rm.key || "").toLowerCase() !== wantRoom) return;
          ((rm && rm.items) || []).forEach(function (it) {
            if (args.status === "open" && it.done) return;
            if (args.status === "done" && !it.done) return;
            var txt = isEs() ? (it.es || it.en) : it.en;
            if (kw && String(txt).toLowerCase().indexOf(kw) < 0) return;
            cards.push({ room: rm.key, done: !!it.done, text: txt });
          });
        });
        respObj = { ok: true, count: cards.length, items: cards.slice(0, 12) };
      } else if (name === "get_pm_standup_brief") {
        var sbRes = await fetch(BACKEND_ORIGIN + "/api/unit4/pm-standup");
        var sb = sbRes.ok ? await sbRes.json() : {};
        respObj = { ok: sbRes.ok, statusNowExcerpt: String(sb.statusNowExcerpt || "").slice(0, 2400), roomChecklistSummary: sb.roomChecklistSummary || [] };
      } else if (name === "show_room_renders") {
        var rrRes = await fetch(BACKEND_ORIGIN + "/api/unit4/renders?room=" + encodeURIComponent(args.room || cfg.room || "all"));
        var rr = rrRes.ok ? await rrRes.json() : {};
        var renList = (rr && rr.renders) || [];
        renList.slice(0, 3).forEach(function (ren) { appendSnapshotCard(ren.thumbUrl || ren.driveUrl, isEs() ? ren.titleEs : ren.titleEn); });
        respObj = { ok: rrRes.ok, count: renList.length };
      } else if (name === "set_language") {
        var nl = String(args.language || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en";
        state.lang = nl;
        syncUi();
        respObj = { ok: true, language: nl };
      } else if (name === "navigate_room") {
        var dr = String(args.room || "home");
        setTimeout(function () { window.location.href = "../../#" + encodeURIComponent(dr); }, 250);
        respObj = { ok: true, navigatingToRoom: dr };
      } else if (name === "read_active_document" || name === "focus_section" || name === "open_document" || name === "go_to_document_page") {
        var mEl = document.querySelector("main") || document.body;
        respObj = { ok: true, context: buildSingleLangContext(), screenText: String((mEl && mEl.innerText) || "").replace(/\s+/g, " ").slice(0, 2000) };
      } else if (name === "fill_draft_note") {
        state.noteMode = true;
        syncUi();
        var dIn = document.getElementById("u4LaiInput");
        if (dIn) dIn.value = String(args.text || "");
        respObj = { ok: true, draftFilled: true, nextStep: "Read back in 1 short sentence and confirm before submitting." };
      } else if (name === "submit_voice_memo" || name === "propose_wiki_or_plan_edit" || name === "log_field_note") {
        if (name !== "log_field_note" && !args.spoken_confirmation) {
          state.noteMode = true;
          syncUi();
          var pIn = document.getElementById("u4LaiInput");
          if (pIn) pIn.value = String(args.verbatim_request || args.text || args.new_value || "");
          respObj = { ok: false, needsConfirmation: true, message: "Read back room, item, value, and boundary first." };
        } else {
          var pb = {
            room: args.room || cfg.room,
            edit_kind: args.edit_kind || (name === "propose_wiki_or_plan_edit" ? "plan_correction" : "field_note"),
            target_item: args.target_item || args.item || "",
            new_value: args.new_value || args.measurement || "",
            measure_boundary: args.measure_boundary || args.datum || "n_a",
            verbatim_request: args.verbatim_request || args.text || args.summary || "",
            text: args.text || args.verbatim_request || args.summary || "",
            language: args.language || state.lang,
            spoken_confirmation: true
          };
          if (state.stagedPhoto && state.stagedPhoto.dataUrl) {
            pb.photo = { name: state.stagedPhoto.name || "site-photo.jpg", type: state.stagedPhoto.mime || "image/jpeg", data: state.stagedPhoto.dataUrl };
          }
          var iRes = await fetch(INTAKE_URL + "/voice-memo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pb) });
          if (iRes.ok) { clearStagedPhoto(); state.noteMode = false; syncUi(); }
          respObj = { ok: iRes.ok, status: iRes.status };
        }
      } else {
        respObj = { ok: true, context: buildSingleLangContext() };
      }
    } catch (err) {
      respObj = { ok: false, error: String(err && err.message ? err.message : err) };
    }

    return { id: fc.id, name: name, response: respObj };
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
      /* Wave G: Parallel fetch(voice-token) + getUserMedia (zero serial wait!) */
      var pair = await Promise.all([
        fetch(VOICE_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: cfg.room, uiLanguage: state.lang })
        }).then(function (r) {
          return r.json().catch(function () { return null; }).then(function (d) { return { ok: r.ok, status: r.status, data: d }; });
        }),
        navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }
        })
      ]);

      if (gen !== state.generation) {
        if (pair[1]) pair[1].getTracks().forEach(function (t) { t.stop(); });
        return;
      }

      var tokWrap = pair[0];
      var stream = pair[1];
      if (!tokWrap.ok || !tokWrap.data || !tokWrap.data.wsUrl) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        throw new Error((tokWrap.data && tokWrap.data.error) || ("HTTP " + tokWrap.status));
      }
      var tokData = tokWrap.data;
      state.micStream = stream;

      /* Single shared AudioContext created & resumed AFTER getUserMedia (fixes iOS AVAudioSession suspend!) */
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AudioCtx();
      state.audioCtx.addEventListener("statechange", function () {
        if (state.liveActive && state.audioCtx && state.audioCtx.state === "suspended") {
          state.audioCtx.resume().catch(function () {});
        }
      });
      if (state.audioCtx.state === "suspended") await state.audioCtx.resume();
      state.playCursor = state.audioCtx.currentTime;

      var ws = new WebSocket(tokData.wsUrl);
      state.ws = ws;
      var setupDone = false;

      ws.onopen = function () {
        var setupPayload = tokData.setup ? Object.assign({}, tokData.setup) : { model: tokData.model || "models/gemini-3.8-live" };
        setupPayload.inputAudioTranscription = setupPayload.inputAudioTranscription || {};
        setupPayload.outputAudioTranscription = setupPayload.outputAudioTranscription || {};
        setupPayload.contextWindowCompression = setupPayload.contextWindowCompression || { slidingWindow: {} };
        setupPayload.sessionResumption = state.resumptionHandle ? { handle: state.resumptionHandle } : (setupPayload.sessionResumption || {});
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
          setStatus(es ? "Escuchando en vivo..." : "Listening live...");
          syncUi();

          /* Wire mic BEFORE sending initial context so first spoken words are never missed! */
          await wireMicCapture(state.audioCtx, stream, ws, function () { return setupDone; });

          var ctxPrompt = isEs()
            ? ("Contexto del plano activo (responde en español de México en 1-2 frases concisas, sin precios ni datos privados): " +
                buildSingleLangContext() + (initialPrompt ? ("\nPregunta: " + initialPrompt) : ""))
            : ("Active plan context (reply in English only in 1-2 concise sentences; never switch to Spanish unless spoken to in a clear Spanish sentence; never mention prices): " +
                buildSingleLangContext() + (initialPrompt ? ("\nQuestion: " + initialPrompt) : ""));

          ws.send(JSON.stringify({
            clientContent: {
              turns: [{ role: "user", parts: [{ text: ctxPrompt }] }],
              turnComplete: Boolean(initialPrompt)
            }
          }));
          return;
        }

        if (msg.sessionResumptionUpdate && msg.sessionResumptionUpdate.resumable && msg.sessionResumptionUpdate.newHandle) state.resumptionHandle = String(msg.sessionResumptionUpdate.newHandle);
        if (msg.goAway && state.liveActive && !state.reconnecting) { state.reconnecting = true; setTimeout(function () { state.reconnecting = false; startVoiceSession(''); }, 150); return; }
        /* Full Wave G msg.toolCall handler! */
        if (msg.toolCall && Array.isArray(msg.toolCall.functionCalls)) {
          var responses = [];
          for (var i = 0; i < msg.toolCall.functionCalls.length; i++) {
            responses.push(await executeToolCall(msg.toolCall.functionCalls[i], ws));
          }
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ toolResponse: { functionResponses: responses } }));
          }
          return;
        }

        if (msg.sessionResumptionUpdate && msg.sessionResumptionUpdate.newHandle) {
          state.sessionResumptionHandle = msg.sessionResumptionUpdate.newHandle;
        }
        if (msg.goAway) {
          state.goAwayTimeLeft = msg.goAway.timeLeft || null;
        }
        if (msg.serverContent) {
          var sc = msg.serverContent;
          if (sc.generationComplete) {
            state.streamBubble = null;
          }
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
          if (sc.turnComplete || sc.generationComplete) {
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
      ? "Si el navegador bloquea la conexión en vivo, toca Configuración del sitio → Acceso a red local → Permitir. La guía local sigue activa."
      : "Live helper blocked by browser? Open Site Settings → Local network access → Allow. Built-in plan guidance still works.";
  }

  async function sendFieldNote(text) {
    var es = isEs();
    appendMsg("user", (es ? "📝 Nota: " : "📝 Note: ") + text);
    setStatus(es ? "Enviando nota al proyecto..." : "Sending field note...");
    try {
      var payload = {
        room: cfg.room,
        edit_kind: "field_note",
        summary: "[" + cfg.planId + "] " + text,
        details: buildSingleLangContext() + "\nMessage: " + text,
        source_page: window.location.pathname + window.location.hash,
        ui_language: state.lang
      };
      if (state.stagedPhoto && state.stagedPhoto.dataUrl) {
        payload.photo = { name: state.stagedPhoto.name || "site-photo.jpg", type: state.stagedPhoto.mime || "image/jpeg", data: state.stagedPhoto.dataUrl };
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
        ? "✓ Listo — nota guardada en la bandeja del proyecto para Tisa y John."
        : "✓ Saved — field note logged for Tisa & John to review.");
      setStatus(es ? "Nota guardada." : "Note saved.");
    } catch (_) {
      appendMsg("sys", lnaTipText());
      setStatus(es ? "No se pudo conectar ahora." : "Could not reach intake right now.");
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
      var parts = [{ text: buildSingleLangContext() + "\n" + text }];
      if (state.stagedPhoto && state.stagedPhoto.base64) {
        parts.push({ inlineData: { mimeType: state.stagedPhoto.mime || "image/jpeg", data: state.stagedPhoto.base64 } });
        clearStagedPhoto();
      }
      state.ws.send(JSON.stringify({
        clientContent: { turns: [{ role: "user", parts: parts }], turnComplete: true }
      }));
      return;
    }

    setStatus(es ? "Buscando guía del proyecto..." : "Searching project guidance...");
    try {
      var ctl = new AbortController();
      var timer = setTimeout(function () { ctl.abort(); }, 1200);
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
        appendMsg("ai", localFallbackAnswer());
      }
      setStatus(es ? "Listo · Toca Voz para conversar." : "Ready · Tap Voice for hands-free help.");
    } catch (_) {
      appendMsg("ai", localFallbackAnswer());
      setStatus(es ? "Mostrando guía local de este plano." : "Showing built-in plan guidance.");
    }
  }

  function localFallbackAnswer() {
    var es = isEs();
    var ctx = buildSingleLangContext();
    return es
      ? (ctx + "\n\nTisa aprueba cualquier cambio abierto de diseño o compra. Toca 📝 para enviar una medida.")
      : (ctx + "\n\nOpen design or purchase choices always need Tisa's approval. Tap 📝 to log a field measurement.");
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

  function forwardToParentAi(mode, promptText, zoneLabel) {
    var ctrl = (window.U4PlanControl && typeof window.U4PlanControl.getState === "function")
      ? window.U4PlanControl.getState()
      : {};
    var fullText = (zoneLabel && promptText)
      ? ("[" + zoneLabel + "] " + promptText)
      : (promptText || (zoneLabel ? ((isEs() ? "Sobre " : "About ") + zoneLabel + ": ") : ""));
    try {
      window.parent.postMessage({
        type: "u4:ai-open",
        mode: mode || "ask",
        prompt: String(promptText || ""),
        text: fullText,
        locationTag: String(zoneLabel || ""),
        planId: cfg.planId,
        room: cfg.room,
        step: ctrl.step || "",
        wall: ctrl.wall || ""
      }, "*");
    } catch (_) {}
  }

  function mount() {
    if (isEmbedded) return; /* Persistent parent wiki shell owns the single Live AI UI! */
    if (document.getElementById("u4LiveAiRoot")) return;

    var root = document.createElement("div");
    root.id = "u4LiveAiRoot";
    root.className = "u4-live-ai-root no-print";
    root.setAttribute("data-live", "off");
    root.setAttribute("data-open", "false");
    root.innerHTML =
      '<div id="u4LaiDock" class="u4-lai-dock">' +
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
      '<div id="u4LaiMiniBar" class="u4-lai-minibar" hidden>' +
        '<span class="u4-lai-dot" aria-hidden="true"></span>' +
        '<span class="u4-lai-rms" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span>' +
        '<button type="button" id="u4LaiMiniMute" class="u4-lai-btn is-mute" aria-pressed="false">🎙 Mute</button>' +
        '<button type="button" id="u4LaiMiniOpen" class="u4-lai-btn">Open</button>' +
        '<button type="button" id="u4LaiMiniEnd" class="u4-lai-btn is-voice" aria-pressed="true">End</button>' +
      "</div>" +
      '<aside id="u4LaiDialog" class="u4-lai-dialog" role="dialog" aria-label="Unit 4 Live AI Guidance" hidden>' +
        '<div class="u4-lai-head">' +
          '<div class="u4-lai-title-wrap">' +
            '<span class="u4-lai-dot" aria-hidden="true"></span>' +
            '<span id="u4LaiTitle" class="u4-lai-title">Live AI · Unit 4</span>' +
          "</div>" +
          '<div class="u4-lai-head-btns">' +
            '<button type="button" id="u4LaiMuteBtn" class="u4-lai-btn is-mute" aria-pressed="false" hidden>Mute</button>' +
            '<button type="button" id="u4LaiVoiceBtn" class="u4-lai-btn is-voice" aria-pressed="false">Voice</button>' +
            '<button type="button" id="u4LaiCloseBtn" class="u4-lai-close" aria-label="Close AI Helper">&times;</button>' +
          "</div>" +
        "</div>" +
        '<div class="u4-lai-status" role="status" aria-live="polite">' +
          '<span id="u4LaiStatusTxt"></span>' +
          '<span class="u4-lai-rms" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span>' +
        "</div>" +
        '<div id="u4LaiLog" class="u4-lai-log" role="log" aria-live="polite"></div>' +
        '<div class="u4-lai-foot">' +
          '<div id="u4LaiChips" class="u4-lai-chips"></div>' +
          '<div id="u4LaiPhotoBar" class="u4-lai-photo-bar" hidden>' +
            '<img id="u4LaiPhotoThumb" alt="Attached site photo">' +
            '<span id="u4LaiPhotoName" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span>' +
            '<button type="button" id="u4LaiPhotoClear" class="u4-lai-close" aria-label="Remove photo">&times;</button>' +
          "</div>" +
          '<form id="u4LaiForm" class="u4-lai-form" novalidate>' +
            '<button type="button" id="u4LaiNoteBtn" class="u4-lai-icon-btn" title="Field note">📝</button>' +
            '<button type="button" id="u4LaiPhotoBtn" class="u4-lai-icon-btn" title="Photo">📎</button>' +
            '<button type="button" id="u4LaiCamBtn" class="u4-lai-icon-btn" title="Camera">📷</button>' +
            '<input id="u4LaiPhotoIn" type="file" accept="image/*" hidden>' +
            '<input id="u4LaiCamIn" type="file" accept="image/*" capture="environment" hidden>' +
            '<input id="u4LaiInput" class="u4-lai-input" type="text" autocomplete="off">' +
            '<button type="submit" class="u4-lai-send" aria-label="Send">&uarr;</button>' +
          "</form>" +
        "</div>" +
      "</aside>";

    document.body.appendChild(root);

    function openDialog() {
      state.open = true;
      syncUi();
      var log = document.getElementById("u4LaiLog");
      /* clean empty start without robotic welcome bubble */
      if (!state.liveActive && !state.liveConnecting) {
        setStatus(isEs() ? "Listo · Toca Voz para hablar en vivo." : "Ready · Tap Voice to talk live.");
      }
    }

    document.getElementById("u4LaiPill").addEventListener("click", function () {
      if (state.open) { state.open = false; syncUi(); }
      else openDialog();
    });

    document.getElementById("u4LaiCloseBtn").addEventListener("click", function () {
      state.open = false;
      syncUi();
    });

    document.getElementById("u4LaiMiniOpen").addEventListener("click", openDialog);
    document.getElementById("u4LaiMiniMute").addEventListener("click", toggleMute);
    document.getElementById("u4LaiMiniEnd").addEventListener("click", stopVoiceSession);

    document.getElementById("u4LaiVoiceBtn").addEventListener("click", function () {
      if (state.liveActive || state.liveConnecting) stopVoiceSession();
      else startVoiceSession("");
    });

    document.getElementById("u4LaiMuteBtn").addEventListener("click", toggleMute);

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

    /* U4_M_KEY_AND_LANG */
    document.addEventListener('keydown', function (e) {
      if (!state.liveActive || e.metaKey || e.ctrlKey || e.altKey) return;
      var tg = e.target;
      if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
      if (e.key === 'm' || e.key === 'M') { e.preventDefault(); toggleMute(); }
    });
    window.addEventListener('u4:lang-change', function () {
      var dl = String(document.documentElement.lang || '').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
      if (dl !== state.lang) { state.lang = dl; syncUi(); }
    });
    syncUi();
  }

  window.U4LiveAi = {
    init: function (options) {
      if (options && typeof options === "object") {
        Object.assign(cfg, options);
      }
      var storedLang = "";
      try { storedLang = window.localStorage.getItem("u4_lang") || ""; } catch (_) {}
      var navLang = (window.U4PlanNav && typeof window.U4PlanNav.getLang === "function") ? window.U4PlanNav.getLang() : "";
      var qLang = params.get("lang") || navLang || storedLang || document.documentElement.lang || "en";
      state.lang = qLang.toLowerCase().indexOf("es") === 0 ? "es" : "en";
      if (isEmbedded) return;
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mount, { once: true });
      } else {
        mount();
      }
    },
    isEmbedded: function () { return isEmbedded; },
    setLang: function (lang) {
      state.lang = String(lang || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en";
      syncUi();
    },
    refreshPrompts: function () {
      if (!isEmbedded) renderChips();
    },
    open: function (promptText, zoneLabel) {
      if (isEmbedded) {
        forwardToParentAi("ask", promptText, zoneLabel);
        return;
      }
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
      if (isEmbedded) {
        forwardToParentAi("note", prefillText, "");
        return;
      }
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
