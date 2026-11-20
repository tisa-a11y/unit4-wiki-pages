/**
 * Unit 4 K-S4 Interactive Plan — Zero-CDN Browser Vector PDF Exporter
 *
 * Uses locally bundled jsPDF + svg2pdf.js + DejaVuSans UTF-8 TTF fonts
 * (supporting full Spanish orthography áéíóúÁÉÍÓÚñÑüÜ¿¡ and engineering glyphs °×—–≤≥←→″′).
 *
 * Integration contract (exposed by the interactive plan page):
 *   window.U4KS4 = {
 *     getSvgElement(): SVGSVGElement,
 *     getState(): Object,
 *     getLang(): "en" | "es",
 *     getRevisionStamp(): string | {
 *       revId?: string,
 *       baseRev?: string,
 *       synced?: boolean,
 *       pendingEod?: boolean,
 *       isLocalOnly?: boolean,
 *       labelEn?: string,
 *       labelEs?: string,
 *       author?: string,
 *       updatedAt?: string
 *     }
 *   }
 */
(function (root) {
  "use strict";

  var SCRIPT_BASE = (function () {
    try {
      if (typeof document !== "undefined" && document.currentScript && document.currentScript.src) {
        return document.currentScript.src.replace(/[^/]+$/, "");
      }
    } catch (e) {}
    return "../vendor/";
  })();

  var fontCache = { regular: null, bold: null };

  function arrayBufferToBase64(buf) {
    var bytes = new Uint8Array(buf);
    var chunkSize = 0x8000;
    var parts = [];
    for (var i = 0; i < bytes.length; i += chunkSize) {
      parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize)));
    }
    return btoa(parts.join(""));
  }

  async function loadFontBase64(relPath, cacheKey) {
    if (fontCache[cacheKey]) return fontCache[cacheKey];
    var url = SCRIPT_BASE + relPath;
    var resp = await fetch(url);
    if (!resp.ok) {
      throw new Error("Failed to load local UTF-8 font " + url + " (HTTP " + resp.status + ")");
    }
    var buf = await resp.arrayBuffer();
    var b64 = arrayBufferToBase64(buf);
    fontCache[cacheKey] = b64;
    return b64;
  }

  async function ensureUtf8Fonts(doc) {
    if (!doc || typeof doc.addFileToVFS !== "function") return false;
    var regB64 = await loadFontBase64("fonts/DejaVuSans.ttf", "regular");
    var boldB64 = await loadFontBase64("fonts/DejaVuSans-Bold.ttf", "bold");
    doc.addFileToVFS("DejaVuSans.ttf", regB64);
    doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
    doc.addFileToVFS("DejaVuSans-Bold.ttf", boldB64);
    doc.addFont("DejaVuSans-Bold.ttf", "DejaVuSans", "bold");
    doc.setFont("DejaVuSans", "normal");
    return true;
  }

  function normalizeStamp(rawStamp, state, lang) {
    var es = lang === "es";
    var baseRev = (state && (state.base_rev || state.baseRev)) || "rev-20261120-001";
    var hasLocalOverrides = Boolean(
      state &&
      ((Array.isArray(state.field_overrides) && state.field_overrides.some(function (o) { return o && o.localOnly; })) ||
        state._localUnsynced === true)
    );
    var hasPendingEod = Boolean(
      state &&
      ((Array.isArray(state.field_overrides) && state.field_overrides.length > 0 && !hasLocalOverrides) ||
        (Array.isArray(state.pending_eod) && state.pending_eod.length > 0) ||
        state._pendingEod === true)
    );

    if (typeof rawStamp === "string" && rawStamp.trim()) {
      var trimmed = rawStamp.trim();
      var lower = trimmed.toLowerCase();
      var isLocal = hasLocalOverrides || lower.indexOf("local") !== -1 || lower.indexOf("sin sincronizar") !== -1 || lower.indexOf("not yet synced") !== -1;
      var isPending = !isLocal && (hasPendingEod || lower.indexOf("pending") !== -1 || lower.indexOf("pendiente") !== -1 || lower.indexOf("field update") !== -1);
      return {
        revId: baseRev,
        mode: isLocal ? "local" : (isPending ? "pending" : "baseline"),
        badge: trimmed,
        author: (state && state._lastAuthor) || "",
        updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC"
      };
    }

    var obj = (rawStamp && typeof rawStamp === "object") ? rawStamp : {};
    var revId = obj.revId || obj.rev_id || obj.baseRev || obj.base_rev || baseRev;
    var isLocalObj = Boolean(obj.isLocalOnly || obj.localOnly || obj.synced === false || hasLocalOverrides);
    var isPendingObj = !isLocalObj && Boolean(obj.pendingEod || obj.pending_eod || hasPendingEod);

    var defaultBadge;
    if (isLocalObj) {
      defaultBadge = es
        ? "Vista previa local — Sin sincronizar"
        : "Local Preview — Not Yet Synced";
    } else if (isPendingObj) {
      defaultBadge = es
        ? "Actualización de obra · Pendiente revisión del día"
        : "Field Update · Pending EOD Review";
    } else {
      defaultBadge = es
        ? "Solo maqueta · Retener cierre hasta revisión"
        : "Mockup Only · Hold Close-In Until Review";
    }

    var badge = es ? (obj.labelEs || obj.label || defaultBadge) : (obj.labelEn || obj.label || defaultBadge);
    return {
      revId: String(revId),
      mode: isLocalObj ? "local" : (isPendingObj ? "pending" : "baseline"),
      badge: String(badge),
      author: String(obj.author || ""),
      updatedAt: String(obj.updatedAt || obj.timestamp || new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC")
    };
  }

  function cloneSvgForVectorPdf(svgEl) {
    var clone = svgEl.cloneNode(true);
    // Ensure explicit viewBox dimensions for svg2pdf layout precision
    var vb = (clone.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
    var vbW = (vb.length === 4 && vb[2] > 0) ? vb[2] : 920;
    var vbH = (vb.length === 4 && vb[3] > 0) ? vb[3] : 1120;
    clone.setAttribute("viewBox", "0 0 " + vbW + " " + vbH);
    clone.setAttribute("width", String(vbW));
    clone.setAttribute("height", String(vbH));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    // Remap all SVG text nodes to registered UTF-8 DejaVuSans so accents & symbols never garble
    var textNodes = clone.querySelectorAll("text, tspan");
    for (var i = 0; i < textNodes.length; i++) {
      var node = textNodes[i];
      node.setAttribute("font-family", "DejaVuSans");
      if (node.style && node.style.fontFamily) {
        node.style.fontFamily = "DejaVuSans";
      }
      var fw = node.getAttribute("font-weight") || (node.style && node.style.fontWeight) || "";
      if (fw === "bold" || fw === "600" || fw === "700" || fw === "800" || Number(fw) >= 600) {
        node.setAttribute("font-weight", "bold");
      } else {
        node.setAttribute("font-weight", "normal");
      }
    }
    return { clone: clone, width: vbW, height: vbH };
  }

  function resolveJsPdfCtor() {
    if (root.jspdf && typeof root.jspdf.jsPDF === "function") return root.jspdf.jsPDF;
    if (typeof root.jsPDF === "function") return root.jsPDF;
    throw new Error("Local jsPDF bundle (plans/vendor/jspdf.umd.min.js) is not loaded.");
  }

  function resolveSvg2PdfFn() {
    if (root.svg2pdf && typeof root.svg2pdf.svg2pdf === "function") return root.svg2pdf.svg2pdf;
    if (typeof root.svg2pdf === "function") return root.svg2pdf;
    return null;
  }

  var PLAN_DEFAULTS = {
    "kitchen-west-ks4": {
      titleEn: "Kitchen West Vent Hood Wall (K-S4)",
      titleEs: "Muro Oeste de Campana y Estufa (K-S4)",
      spec: "kitchen/SPEC.md",
      filePrefix: "2026-11-20_U4_kitchen_ks4-interactive_"
    },
    "attic-hatch": {
      titleEn: "Attic Hatch & Access Plan (24\" × 36\" Clear)",
      titleEs: "Plan de Escotilla y Acceso al Ático (24\" × 36\" Libre)",
      spec: "attic/SPEC.md",
      filePrefix: "2026-11-20_U4_attic_hatch-interactive_"
    },
    "hvac-layout": {
      titleEn: "HVAC & Ductwork What-If Layout",
      titleEs: "Plano Interactivo de Clima y Ductos",
      spec: "hvac/SPEC.md",
      filePrefix: "2026-11-20_U4_hvac_layout-interactive_"
    },
    "murphy-door": {
      titleEn: "Murphy Bookcase Door — Laundry Closet",
      titleEs: "Puerta Librero Oculta — Clóset de Lavandería",
      spec: "laundry/SPEC.md",
      filePrefix: "2026-11-20_U4_laundry_murphy-door-interactive_"
    }
  };

  async function buildPdfDoc(opts) {
    var o = opts || {};
    var hook = o.hook || root.U4PLAN || root.U4KS4;
    if (!hook || typeof hook.getSvgElement !== "function") {
      throw new Error("window.U4PLAN (or window.U4KS4) hook is not registered on this page.");
    }
    var svgEl = hook.getSvgElement();
    if (!svgEl) {
      throw new Error("window.U4PLAN.getSvgElement() returned null.");
    }
    var state = typeof hook.getState === "function" ? (hook.getState() || {}) : {};
    var planId = String(
      o.planId || hook.planId || state.plan_id || state.module_id || (state.wall_id === "K-S4" ? "kitchen-west-ks4" : "kitchen-west-ks4")
    ).trim().toLowerCase();
    var meta = PLAN_DEFAULTS[planId] || {
      titleEn: state.title_en || "Unit 4 Interactive Plan",
      titleEs: state.title_es || "Plano Interactivo Unidad 4",
      spec: state.governing_spec || "START-HERE.md",
      filePrefix: "2026-11-20_U4_" + planId.replace(/[^a-z0-9_-]+/g, "-") + "_"
    };
    var lang = (o.lang || (typeof hook.getLang === "function" ? hook.getLang() : "en") || "en").toLowerCase() === "es" ? "es" : "en";
    var es = lang === "es";
    var rawStamp = typeof hook.getRevisionStamp === "function" ? hook.getRevisionStamp() : null;
    var stamp = normalizeStamp(rawStamp, state, lang);

    var JsPDF = resolveJsPdfCtor();
    var doc = new JsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
      compress: true
    });

    await ensureUtf8Fonts(doc);

    var pageW = doc.internal.pageSize.getWidth();   // 612 pt
    var pageH = doc.internal.pageSize.getHeight();  // 792 pt
    var margin = 28;
    var contentW = pageW - margin * 2;

    // 1. Clean Architectural Header Banner
    doc.setFillColor(246, 248, 250);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, margin, contentW, 56, 4, 4, "FD");

    var title = es
      ? (state.title_es || meta.titleEs)
      : (state.title_en || meta.titleEn);
    var subtitle = es
      ? "1231 11th Ave Unidad 4 · Plano interactivo paramétrico · N/S/E/O obligatorio"
      : "1231 11th Ave Unit 4 · Interactive Parametric Plan · Mandatory N/S/E/W Orientation";

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin + 10, margin + 18);

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(subtitle, margin + 10, margin + 31);

    // Revision & Status Stamp Pill inside Header (avoid duplicating revId if badge already starts with it)
    var hasRevPrefix = stamp.badge && stamp.revId && stamp.badge.indexOf(stamp.revId) === 0;
    var stampLine = (hasRevPrefix ? stamp.badge : (stamp.revId + "  ·  " + stamp.badge)) + (stamp.author ? ("  ·  " + stamp.author) : "");
    var pillBg = stamp.mode === "local" ? [254, 243, 199] : (stamp.mode === "pending" ? [219, 234, 254] : [241, 245, 249]);
    var pillFg = stamp.mode === "local" ? [146, 64, 14] : (stamp.mode === "pending" ? [30, 64, 175] : [51, 65, 85]);
    var pillBorder = stamp.mode === "local" ? [245, 158, 11] : (stamp.mode === "pending" ? [59, 130, 246] : [148, 163, 184]);

    doc.setFillColor(pillBg[0], pillBg[1], pillBg[2]);
    doc.setDrawColor(pillBorder[0], pillBorder[1], pillBorder[2]);
    doc.roundedRect(margin + 10, margin + 36, contentW - 20, 15, 3, 3, "FD");
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(pillFg[0], pillFg[1], pillFg[2]);
    doc.text(stampLine, margin + 16, margin + 46);

    // 2. Render Exact Single SVG into Vector PDF Body
    var prepared = cloneSvgForVectorPdf(svgEl);
    var svgBoxTop = margin + 64;
    var footerH = 44;
    var maxSvgH = pageH - svgBoxTop - margin - footerH;
    var scale = Math.min(contentW / prepared.width, maxSvgH / prepared.height);
    var drawW = prepared.width * scale;
    var drawH = prepared.height * scale;
    var drawX = margin + (contentW - drawW) / 2;

    doc.setDrawColor(226, 232, 240);
    doc.rect(drawX - 1, svgBoxTop - 1, drawW + 2, drawH + 2, "S");

    var svg2pdfFn = resolveSvg2PdfFn();
    if (typeof doc.svg === "function") {
      await doc.svg(prepared.clone, {
        x: drawX,
        y: svgBoxTop,
        width: drawW,
        height: drawH
      });
    } else if (svg2pdfFn) {
      await svg2pdfFn(prepared.clone, doc, {
        x: drawX,
        y: svgBoxTop,
        width: drawW,
        height: drawH
      });
    } else {
      throw new Error("Local svg2pdf.js bundle (plans/vendor/svg2pdf.umd.min.js) is not loaded.");
    }

    // 3. Optional Annotated Circle-to-Correct Canvas Overlay (if present on page)
    if (typeof hook.getAnnotationDataUrl === "function") {
      try {
        var annUrl = hook.getAnnotationDataUrl();
        if (annUrl && typeof annUrl === "string" && annUrl.indexOf("data:image/png") === 0) {
          doc.addImage(annUrl, "PNG", drawX, svgBoxTop, drawW, drawH);
        }
      } catch (e) {}
    }

    // 4. Concise Provenance & Governance Footer
    var footY = pageH - margin - 26;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, footY - 8, pageW - margin, footY - 8);

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);

    var overrideCount = Array.isArray(state.field_overrides) ? state.field_overrides.length : 0;
    var pinCount = Array.isArray(state.pins) ? state.pins.length : 0;
    var specPath = state.governing_spec || meta.spec || "START-HERE.md";
    var footLine1 = es
      ? ("Especificación gobernante: " + specPath + "  ·  Revisión: " + stamp.revId + "  ·  Ajustes de obra: " + overrideCount + "  ·  Marcas: " + pinCount)
      : ("Governing spec: " + specPath + "  ·  Revision: " + stamp.revId + "  ·  Field overrides: " + overrideCount + "  ·  Pins: " + pinCount);
    var footLine2 = es
      ? ("Exportado: " + stamp.updatedAt + "  ·  Todas las medidas etiquetadas MEDIR EN OBRA deben verificarse antes de cortar o cerrar.")
      : ("Exported: " + stamp.updatedAt + "  ·  Verify all MEASURE ON SITE dimensions before cutting or wall close-in.");

    doc.text(footLine1, margin, footY + 3);
    doc.text(footLine2, margin, footY + 14);

    var safeRev = stamp.revId.replace(/[^a-zA-Z0-9._-]+/g, "_");
    var filename = o.filename || (meta.filePrefix + lang.toUpperCase() + "_" + safeRev + ".pdf");
    return { doc: doc, filename: filename, stamp: stamp, lang: lang, planId: planId };
  }

  async function exportPdf(opts) {
    var built = await buildPdfDoc(opts);
    // Standard save works cleanly on Desktop Chrome/Safari & modern iOS Safari
    built.doc.save(built.filename);
    return {
      ok: true,
      planId: built.planId,
      filename: built.filename,
      revId: built.stamp.revId,
      mode: built.stamp.mode,
      badge: built.stamp.badge,
      lang: built.lang
    };
  }

  var api = {
    version: "2.0.0",
    buildPdfDoc: buildPdfDoc,
    exportPdf: exportPdf,
    normalizeStamp: normalizeStamp,
    planDefaults: PLAN_DEFAULTS
  };

  root.U4PlanPdfExport = api;
  root.U4KS4PdfExport = api;
})(typeof window !== "undefined" ? window : globalThis);
