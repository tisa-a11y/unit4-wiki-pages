/* ============================================================================
   Plan 2: Heating System — Furnace, Ducts & Sidewall Exhaust (R7 Dark-Mode Polish)
   Focused mechanical & airflow plan:
     View 1: Furnace & Room Duct Map (dark/light dot legend + plain-English draggable registers)
     View 2: 66" Flat-Roof Cavity & Horizontal Sidewall Exhaust (zero roof cuts)
   Zero Walkthrough Tab · Heating System Only · Zero Vibration-Pad Assumptions · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "ducts", en: "1. Furnace & Room Duct Map", es: "1. Mapa de Calefactor y Ductos" },
    { id: "exhaust", en: "2. Flat Roof & Sidewall Exhaust", es: "2. Techo Plano y Salida Lateral" }
  ];

  var SC = 0.86;
  var OX = 24;
  var OY = 38;
  function px(xIn) { return +(OX + xIn * SC).toFixed(1); }
  function py(yIn) { return +(OY + yIn * SC).toFixed(1); }

  var HATCH_DOOR4 = { x: 112, y: 74, w: 24, h: 36 };

  var DEFAULTS = {
    f1: { x: 174, y: 258 },
    r1: { x: 248, y: 114 },
    s1: { x: 168, y: 126 },
    s2: { x: 312, y: 212 },
    s3: { x: 406, y: 82 },
    jd1: { x: 352, y: 112 }
  };

  function cloneDefaults() {
    return {
      f1: { x: DEFAULTS.f1.x, y: DEFAULTS.f1.y },
      r1: { x: DEFAULTS.r1.x, y: DEFAULTS.r1.y },
      s1: { x: DEFAULTS.s1.x, y: DEFAULTS.s1.y },
      s2: { x: DEFAULTS.s2.x, y: DEFAULTS.s2.y },
      s3: { x: DEFAULTS.s3.x, y: DEFAULTS.s3.y },
      jd1: { x: DEFAULTS.jd1.x, y: DEFAULTS.jd1.y }
    };
  }

  var bootParams = new URLSearchParams(window.location.search || "");
  var bootNodes = cloneDefaults();
  var bFx = Number(bootParams.get("fx"));
  var bFy = Number(bootParams.get("fy"));
  if (isFinite(bFx) && bFx >= 160 && bFx <= 430) bootNodes.f1.x = Math.round(bFx);
  if (isFinite(bFy) && bFy >= 108 && bFy <= 274) bootNodes.f1.y = Math.round(bFy);

  function resolveStep(raw) {
    var s = String(raw || "").toLowerCase().trim();
    if (s === "2" || s === "exhaust" || s === "section" || s === "vent" || s === "roof" || s === "sidewall") return "exhaust";
    return "ducts";
  }

  var state = {
    step: resolveStep(bootParams.get("step")),
    nodes: bootNodes,
    dischargeDir: "right",
    ductMode: "trunk",
    ventMode: bootParams.get("vent") || "power_venter",
    exitWall: bootParams.get("ewall") || "south",
    southLotSetbackFt: "unknown",
    activePreset: (bootNodes.f1.x === 174 && bootNodes.f1.y === 258) ? "sw_dining" : "custom",
    dragActive: false
  };

  function isEs() {
    return window.U4PlanNav ? window.U4PlanNav.getLang() === "es" : false;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function distIn(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function pathLenIn(pts) {
    var total = 0;
    for (var i = 1; i < pts.length; i++) total += distIn(pts[i - 1], pts[i]);
    return total;
  }

  function segHitsRect(p1, p2, r) {
    var steps = 18;
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var xx = p1.x + (p2.x - p1.x) * t;
      var yy = p1.y + (p2.y - p1.y) * t;
      if (xx >= r.x - 4 && xx <= r.x + r.w + 4 && yy >= r.y - 4 && yy <= r.y + r.h + 4) return true;
    }
    return false;
  }

  function polyHitsRect(pts, r) {
    for (var i = 1; i < pts.length; i++) {
      if (segHitsRect(pts[i - 1], pts[i], r)) return true;
    }
    return false;
  }

  function smoothCornerPath(ptsIn, radiusIn) {
    if (!ptsIn || ptsIn.length < 2) return "";
    if (ptsIn.length === 2) {
      return "M " + px(ptsIn[0].x) + " " + py(ptsIn[0].y) + " L " + px(ptsIn[1].x) + " " + py(ptsIn[1].y);
    }
    var r = radiusIn || 14;
    var out = ["M " + px(ptsIn[0].x) + " " + py(ptsIn[0].y)];
    for (var i = 1; i < ptsIn.length - 1; i++) {
      var prev = ptsIn[i - 1], cur = ptsIn[i], next = ptsIn[i + 1];
      var d1 = distIn(prev, cur);
      var d2 = distIn(cur, next);
      var rr = Math.min(r, d1 * 0.45, d2 * 0.45);
      if (rr < 1.5) {
        out.push("L " + px(cur.x) + " " + py(cur.y));
        continue;
      }
      var p1 = { x: cur.x + ((prev.x - cur.x) / d1) * rr, y: cur.y + ((prev.y - cur.y) / d1) * rr };
      var p2 = { x: cur.x + ((next.x - cur.x) / d2) * rr, y: cur.y + ((next.y - cur.y) / d2) * rr };
      out.push("L " + px(p1.x) + " " + py(p1.y));
      out.push("Q " + px(cur.x) + " " + py(cur.y) + " " + px(p2.x) + " " + py(p2.y));
    }
    var last = ptsIn[ptsIn.length - 1];
    out.push("L " + px(last.x) + " " + py(last.y));
    return out.join(" ");
  }

  function computeWalkwayRef(f1) {
    var hatchEastX = HATCH_DOOR4.x + HATCH_DOOR4.w / 2;
    var hatchMidY = HATCH_DOOR4.y;
    var platCenterY = f1.y - 29.5;
    var hallSpineY = 108;
    var platEdgeY = platCenterY <= hallSpineY ? Math.min(f1.y - 14.5, platCenterY + 15) : platCenterY - 15;
    var pts;
    if (f1.x >= 162 && f1.x <= 192 && platEdgeY >= hatchMidY) {
      pts = [{ x: hatchEastX, y: hatchMidY }, { x: f1.x, y: hatchMidY }, { x: f1.x, y: platEdgeY }];
    } else {
      pts = [
        { x: hatchEastX, y: hatchMidY },
        { x: 170, y: hatchMidY },
        { x: 170, y: hallSpineY },
        { x: f1.x, y: hallSpineY },
        { x: f1.x, y: platEdgeY }
      ];
    }
    var walkIn = 0;
    for (var i = 1; i < pts.length; i++) {
      walkIn += Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
    }
    return {
      pts: pts,
      d: pts.map(function (pt, idx) { return (idx === 0 ? "M " : " L ") + px(pt.x) + " " + py(pt.y); }).join(""),
      walkFt: +(walkIn / 12).toFixed(1),
      walkPass: +(walkIn / 12).toFixed(1) <= 20.0
    };
  }

  function computeSidewallFlue(f1) {
    var effectiveWall = (state.exitWall === "south" && state.southLotSetbackFt === "lt4") ? "west" : state.exitWall;
    var pts;
    if (effectiveWall === "west") {
      if (f1.y >= 236) {
        pts = [{ x: f1.x, y: f1.y + 8 }, { x: 147, y: Math.max(246, Math.min(288, f1.y + 8)) }];
      } else {
        var safeY = Math.min(132, Math.max(114, f1.y));
        pts = [{ x: f1.x, y: f1.y }, { x: f1.x, y: safeY }, { x: 31.5, y: safeY }];
      }
    } else {
      pts = [{ x: f1.x, y: f1.y + 14.5 }, { x: f1.x, y: 297.75 }];
    }
    var runFt = +(Math.max(12, pathLenIn(pts)) / 12).toFixed(1);
    return {
      effectiveWall: effectiveWall,
      pts: pts,
      dStr: pts.map(function (pt, idx) { return (idx === 0 ? "M " : " L ") + px(pt.x) + " " + py(pt.y); }).join(""),
      termPt: pts[pts.length - 1],
      runFt: runFt,
      gravityIllegal: state.ventMode === "gravity_unassisted"
    };
  }

  function computeDucts() {
    var n = state.nodes;
    var f1 = n.f1;
    var dir = state.dischargeDir === "right" ? 1 : -1;
    var cabHalfW = 16.625;
    var plenumLen = 24;
    var supFlange = { x: f1.x + dir * cabHalfW, y: f1.y };
    var supEnd = { x: f1.x + dir * (cabHalfW + plenumLen), y: f1.y };
    var retFlange = { x: f1.x - dir * cabHalfW, y: f1.y };
    var retEnd = { x: f1.x - dir * (cabHalfW + 12), y: f1.y };

    var vents = [
      { id: "s1", name: "Kitchen", pt: n.s1 },
      { id: "s2", name: "Living", pt: n.s2 },
      { id: "s3", name: "Bedroom", pt: n.s3 }
    ];

    var trunkSegs = [];
    var branches = [];

    if (state.ductMode === "radial") {
      var extEnd = { x: f1.x + dir * (cabHalfW + 34), y: f1.y };
      trunkSegs.push({ pts: [supFlange, extEnd], d: smoothCornerPath([supFlange, extEnd], 8), strokeW: 8.5 });
      vents.forEach(function (v, idx) {
        var collarX = f1.x + dir * (cabHalfW + 12 + idx * 9);
        var dySign = v.pt.y < f1.y ? -1 : 1;
        var collarPt = { x: collarX, y: f1.y + dySign * 5 };
        var wyeExit = { x: collarPt.x + dir * 14, y: collarPt.y + dySign * 14 };
        var midPt = {
          x: (wyeExit.x + v.pt.x) / 2,
          y: Math.abs(v.pt.y - wyeExit.y) > 45 ? (wyeExit.y + v.pt.y) / 2 : wyeExit.y
        };
        var pts = [collarPt, wyeExit, midPt, v.pt];
        var dStr = "M " + px(collarPt.x) + " " + py(collarPt.y) +
                   " L " + px(wyeExit.x) + " " + py(wyeExit.y) +
                   " Q " + px(midPt.x) + " " + py(midPt.y) + " " + px(v.pt.x) + " " + py(v.pt.y);
        branches.push({ id: v.id, name: v.name, d: dStr, pts: pts, ft: +(pathLenIn(pts) / 12).toFixed(1), takeoff: collarPt });
      });
    } else {
      var forward = [];
      var behind = [];
      vents.forEach(function (v) {
        if ((v.pt.x - supEnd.x) * dir < -22) behind.push(v);
        else forward.push(v);
      });
      if (forward.length === 0) { forward = behind.slice(); behind = []; }
      var avgY = forward.reduce(function (acc, v) { return acc + v.pt.y; }, 0) / forward.length;
      var trunkY = Math.max(96, Math.min(252, Math.round(avgY)));
      if (Math.abs(trunkY - f1.y) < 18) trunkY = f1.y;

      forward.sort(function (a, b) { return ((a.pt.x - supEnd.x) * dir) - ((b.pt.x - supEnd.x) * dir); });

      var elbowX = supEnd.x + dir * (((forward[0].pt.x - supEnd.x) * dir < 0) ? 10 : 16);
      var takeoffs = forward.map(function (v) {
        var dy1 = v.pt.y - trunkY;
        var lead = Math.min(28, Math.max(10, Math.abs(dy1) * 0.42));
        return { tkPt: { x: v.pt.x - dir * lead, y: trunkY }, vent: v };
      });
      takeoffs.sort(function (a, b) { return ((a.tkPt.x - elbowX) * dir) - ((b.tkPt.x - elbowX) * dir); });

      var prePts = [supFlange, supEnd];
      if (Math.abs(trunkY - f1.y) > 4) {
        prePts.push({ x: elbowX, y: f1.y });
        prePts.push({ x: elbowX, y: trunkY });
      }
      var firstTk = takeoffs[0].tkPt;
      if (distIn(prePts[prePts.length - 1], firstTk) > 3) prePts.push(firstTk);
      trunkSegs.push({ pts: prePts, d: smoothCornerPath(prePts, 14), strokeW: 7.4 });

      var curPt = firstTk;
      for (var ti = 0; ti < takeoffs.length; ti++) {
        var tk = takeoffs[ti];
        if (ti > 0) {
          trunkSegs.push({ pts: [curPt, tk.tkPt], d: smoothCornerPath([curPt, tk.tkPt], 10), strokeW: takeoffs.length - ti >= 2 ? 5.6 : 4.0 });
          curPt = tk.tkPt;
        }
        var sv = tk.vent;
        var dySign2 = sv.pt.y >= tk.tkPt.y ? 1 : -1;
        var wyeStub = {
          x: tk.tkPt.x + dir * Math.min(16, Math.abs(sv.pt.x - tk.tkPt.x) * 0.45 + 6),
          y: tk.tkPt.y + dySign2 * Math.min(16, Math.abs(sv.pt.y - tk.tkPt.y) * 0.45 + 4)
        };
        var dStr2 = "M " + px(tk.tkPt.x) + " " + py(tk.tkPt.y) + " Q " + px(wyeStub.x) + " " + py(wyeStub.y) + " " + px(sv.pt.x) + " " + py(sv.pt.y);
        var runIn2 = pathLenIn(prePts) + distIn(firstTk, tk.tkPt) + distIn(tk.tkPt, wyeStub) + distIn(wyeStub, sv.pt);
        branches.push({ id: sv.id, name: sv.name, d: dStr2, pts: [tk.tkPt, wyeStub, sv.pt], ft: +(runIn2 / 12).toFixed(1), takeoff: tk.tkPt });
      }

      behind.forEach(function (bv) {
        var sideSign = bv.pt.y <= f1.y ? -1 : 1;
        var sideTk = { x: f1.x + dir * (cabHalfW + 14), y: f1.y + sideSign * 7 };
        var sweepY = sideSign < 0 ? Math.min(f1.y - 42, (f1.y + bv.pt.y) / 2) : Math.max(f1.y + 24, (f1.y + bv.pt.y) / 2);
        var bPts = [sideTk, { x: sideTk.x + dir * 10, y: sideTk.y + sideSign * 14 }, { x: bv.pt.x, y: sweepY }, bv.pt];
        branches.push({ id: bv.id, name: bv.name, d: smoothCornerPath(bPts, 16), pts: bPts, ft: +((14 + pathLenIn(bPts)) / 12).toFixed(1), takeoff: sideTk });
      });
    }

    var retClearX = Math.max(152, retEnd.x - dir * 8);
    var retMidY = Math.abs(n.r1.y - retEnd.y) > 25 ? Math.min(184, (n.r1.y + retEnd.y) / 2) : retEnd.y;
    var retPts = [retFlange, retEnd, { x: retClearX, y: retEnd.y }, { x: retClearX, y: retMidY }, { x: n.r1.x, y: retMidY }, n.r1];
    if ((n.r1.x - retEnd.x) * (-dir) > 12 && retEnd.x >= 152) {
      retPts = [retFlange, retEnd, { x: n.r1.x, y: retEnd.y }, n.r1];
    }
    var ra1D = smoothCornerPath(retPts, 16);
    var ra1Ft = +(pathLenIn(retPts) / 12).toFixed(1);

    var flue = computeSidewallFlue(f1);
    var walk = computeWalkwayRef(f1);
    var shortCircuitPairs = [];
    vents.forEach(function (v) {
      if (distIn(v.pt, n.r1) < 48) shortCircuitPairs.push({ a: v.pt, b: n.r1 });
      if (distIn(v.pt, n.jd1) < 42) shortCircuitPairs.push({ a: v.pt, b: n.jd1 });
    });

    var hatchRect = { x: HATCH_DOOR4.x - HATCH_DOOR4.w / 2, y: HATCH_DOOR4.y - HATCH_DOOR4.h / 2, w: HATCH_DOOR4.w, h: HATCH_DOOR4.h };
    var hatchBlocked = (Math.abs(f1.x - HATCH_DOOR4.x) < 34 && Math.abs(f1.y - HATCH_DOOR4.y) < 34) ||
      trunkSegs.some(function (ts) { return polyHitsRect(ts.pts, hatchRect); }) ||
      branches.some(function (b) { return polyHitsRect(b.pts, hatchRect); }) ||
      polyHitsRect(retPts, hatchRect);

    var byId = {};
    branches.forEach(function (b) { byId[b.id] = b; });

    return {
      dir: dir,
      trunkSegs: trunkSegs,
      branches: branches,
      byId: byId,
      ra1D: ra1D,
      ra1Ft: ra1Ft,
      flue: flue,
      walk: walk,
      shortCircuitPairs: shortCircuitPairs,
      hatchBlocked: hatchBlocked,
      sa1Ft: byId.s1 ? byId.s1.ft : 0,
      sa2Ft: byId.s2 ? byId.s2.ft : 0,
      sa3Ft: byId.s3 ? byId.s3.ft : 0
    };
  }

  function syncBlueprintAndUrl() {
    try {
      var inpFx = document.getElementById("inp-furnace-x");
      var inpFy = document.getElementById("inp-furnace-y");
      if (inpFx) { inpFx.value = String(Math.round(state.nodes.f1.x)); inpFx.dispatchEvent(new Event("change", { bubbles: true })); }
      if (inpFy) { inpFy.value = String(Math.round(state.nodes.f1.y)); inpFy.dispatchEvent(new Event("change", { bubbles: true })); }
      var selRoute = document.getElementById("sel-roof-route");
      if (selRoute) {
        selRoute.value = state.ventMode === "gravity_unassisted"
          ? "gravity_unassisted_blocked"
          : (state.ventMode === "cat4_pvc"
            ? "cat4_pvc_sidewall"
            : (state.exitWall === "west" ? "sidewall_power_venter_west" : "sidewall_power_venter_south"));
        selRoute.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } catch (_) {}
    try {
      var next = new URLSearchParams(window.location.search || "");
      next.set("step", state.step);
      next.set("fx", String(Math.round(state.nodes.f1.x)));
      next.set("fy", String(Math.round(state.nodes.f1.y)));
      next.set("vent", state.ventMode);
      next.set("ewall", state.exitWall);
      window.history.replaceState(null, "", "?" + next.toString() + (window.location.hash || ""));
    } catch (_) {}
  }

  function computeStatus(m, es) {
    if (!m.walk.walkPass) {
      return {
        cls: "is-fail",
        txt: es
          ? "✗ El calefactor queda a más de 20 pies de la escotilla (" + m.walk.walkFt + " pies) — acércalo hacia Comedor Suroeste."
          : "✗ Furnace is more than 20 ft from the Door 4 hatch (" + m.walk.walkFt + " ft) — move it closer toward Southwest Dining."
      };
    }
    if (m.hatchBlocked) {
      return {
        cls: "is-fail",
        txt: es
          ? '✗ Un ducto o equipo cruza la escotilla de 24"×36" — muévelo fuera del acceso.'
          : '✗ A duct or furnace blocks the 24" × 36" attic hatch — drag it clear of the opening.'
      };
    }
    if (m.flue.gravityIllegal) {
      return {
        cls: "is-fail",
        txt: es
          ? "✗ Salida horizontal por gravedad sin extractor no permitida — elige Extractor Lateral (Opción A) o PVC 95%+ (Opción B)."
          : "✗ Unassisted horizontal gravity exhaust is not permitted — select Listed Power Venter (Option A) or 95%+ Sealed PVC (Option B)."
      };
    }
    if (m.shortCircuitPairs.length > 0) {
      return {
        cls: "is-warn",
        txt: es
          ? "⚠ Rejilla de aire caliente a menos de 4 pies del retorno o transferencia — sepáralas para no recircular aire."
          : "⚠ Warm supply register is within 4 ft of the Hall Return or Bedroom Transfer — drag them slightly apart."
      };
    }
    var wallTxt = m.flue.effectiveWall === "west"
      ? (es ? "muro Oeste al patio trasero (≥ 4 pies libres)" : "West rear-yard wall (≥ 4 ft clear)")
      : (es ? "muro Sur exterior (verificar ≥ 4 pies a colindancia)" : "South exterior wall (verify ≥ 4 ft to property line)");
    return {
      cls: "is-pass",
      txt: es
        ? "✓ Trazado limpio: 3 inyecciones balanceadas (" + m.sa1Ft + "' / " + m.sa2Ft + "' / " + m.sa3Ft + "') · Retorno central " + m.ra1Ft + "' · Salida lateral por " + wallTxt + " (cero cortes en techo)."
        : "✓ Clean layout: 3 supply runs (" + m.sa1Ft + "' / " + m.sa2Ft + "' / " + m.sa3Ft + "') · Hall Return " + m.ra1Ft + "' · Horizontal exhaust out " + wallTxt + " (zero roof cuts)."
    };
  }

  function buildDynamicDuctsSvg(m, es) {
    var parts = [];
    m.trunkSegs.forEach(function (ts) {
      parts.push('<path d="' + ts.d + '" fill="none" stroke="#1f5f7a" stroke-width="' + ts.strokeW + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.26"/>');
      parts.push('<path d="' + ts.d + '" fill="none" stroke="#1f5f7a" stroke-width="' + Math.max(2.3, +(ts.strokeW * 0.44).toFixed(1)) + '" stroke-linecap="round" stroke-linejoin="round"/>');
    });
    m.branches.forEach(function (b) {
      var bCol = b.ft > 25 ? "#9a5b06" : "#1f5f7a";
      parts.push('<path d="' + b.d + '" fill="none" stroke="' + bCol + '" stroke-width="2.4" stroke-linecap="round"/>');
      parts.push('<circle cx="' + px(b.takeoff.x) + '" cy="' + py(b.takeoff.y) + '" r="2.7" fill="#ffffff" stroke="' + bCol + '" stroke-width="1.3"/>');
    });
    parts.push('<path d="' + m.ra1D + '" fill="none" stroke="#0f766e" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"/>');
    parts.push('<path d="' + m.ra1D + '" fill="none" stroke="#0f766e" stroke-width="2.2" stroke-dasharray="5 3" stroke-linecap="round" stroke-linejoin="round"/>');

    var flCol = m.flue.gravityIllegal ? "#a8281c" : (state.ventMode === "cat4_pvc" ? "#1f5f7a" : "#b45309");
    parts.push('<path d="' + m.flue.dStr + '" fill="none" stroke="' + flCol + '" stroke-width="3.2" stroke-dasharray="4 2"/>');
    var tx = px(m.flue.termPt.x), ty = py(m.flue.termPt.y);
    var exhaustLbl = m.flue.gravityIllegal
      ? (es ? "No válido" : "Blocked")
      : (es ? "Salida Muro" : "Wall Exhaust");
    parts.push('<rect x="' + (tx - 24).toFixed(1) + '" y="' + (ty - 7.5).toFixed(1) + '" width="48" height="15" rx="3.5" fill="' + (m.flue.gravityIllegal ? "#f9e6e4" : "#fef3c7") + '" stroke="' + flCol + '" stroke-width="1.4"/>');
    parts.push('<text x="' + tx + '" y="' + (ty + 2.4).toFixed(1) + '" text-anchor="middle" font-size="5.6" font-weight="800" fill="' + flCol + '">' + esc(exhaustLbl) + "</text>");

    m.shortCircuitPairs.forEach(function (sc) {
      parts.push('<line x1="' + px(sc.a.x) + '" y1="' + py(sc.a.y) + '" x2="' + px(sc.b.x) + '" y2="' + py(sc.b.y) + '" stroke="#a8281c" stroke-width="1.9" stroke-dasharray="2 2"/>');
    });
    return parts.join("");
  }

  function renderColorLegendHtml(es) {
    var items = [
      { col: "#1d2326", lbl: es ? "Calefactor (45k BTU)" : "Furnace (45k BTU)" },
      { col: "#1f5f7a", lbl: es ? "Aire Caliente (3 cuartos)" : "Warm Air Supply (3 rooms)" },
      { col: "#0f766e", lbl: es ? "Retorno en Pasillo" : "Hall Return Air" },
      { col: "#6d28d9", lbl: es ? "Paso Aire Recámara" : "Bedroom Air Transfer" },
      { col: "#d97706", lbl: es ? "Salida Lateral en Muro" : "Sidewall Exhaust" }
    ];
    return '<div class="u4h-legend-row">' +
      items.map(function (it) {
        return '<span class="u4h-legend-chip"><span class="u4h-legend-dot" style="background:' + it.col + '"></span>' + esc(it.lbl) + "</span>";
      }).join("") +
    "</div>";
  }

  function renderHvacEquipDrawer(es) {
    var rows = es
      ? [
          "NEXT suministra e instala: calefactor horizontal en ático, termostato de pared, plenos y ductos aislados (3 inyecciones, 1 retorno central, 1 transferencia).",
          "NEXT suministra e instala: salida lateral horizontal por muro exterior (cero cortes en el techo plano) + alimentador exterior hacia el subpanel D04.",
          'Nuestra cuadrilla construye: escotilla de 24" × 36" libres afuera de Puerta 4, pasillo continuo de 24" (15.8 pies) y plataforma nivelada de 30" × 30".',
          "Nuestra cuadrilla instala: contacto GFCI 120V a ≤ 25 pies + lámpara LED cerrada permanente con apagador junto a la escotilla."
        ]
      : [
          "NEXT supplies & installs: horizontal attic gas furnace, wall thermostat, plenums & insulated ducts (3 room supplies, 1 hall return, 1 bedroom transfer).",
          "NEXT supplies & installs: horizontal sidewall exhaust out exterior wall (zero flat-roof cuts) + exterior feeder to Unit 4 subpanel at D04.",
          'Our crew builds: 24" × 36" clear hatch outside Front Door 4, 15.8 ft continuous 24" wood walkway & level 30" × 30" service platform.',
          "Our crew installs: line-side 120V GFCI outlet within 25 ft + permanent switched enclosed LED light near hatch."
        ];
    return '<details class="u4h-equip-wrap">' +
      '<summary class="u4h-equip-btn"><span>' + (es ? "Equipo y suministros (NEXT vs. Cuadrilla)" : "Equipment & Supplies (NEXT vs. Crew)") + '</span><span>▾</span></summary>' +
      '<div class="u4h-equip-body"><ul class="u4h-info-list">' +
        rows.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") +
      "</ul></div>" +
    "</details>";
  }

  function renderDuctMapSvg(m, es) {
    var n = state.nodes;
    var f1x = px(n.f1.x), f1y = py(n.f1.y);
    var r1x = px(n.r1.x), r1y = py(n.r1.y);
    var s1x = px(n.s1.x), s1y = py(n.s1.y);
    var s2x = px(n.s2.x), s2y = py(n.s2.y);
    var s3x = px(n.s3.x), s3y = py(n.s3.y);
    var jdx = px(n.jd1.x), jdy = py(n.jd1.y);
    var dir = m.dir;

    var fW = +(33.25 * SC).toFixed(1);
    var fH = +(29 * SC).toFixed(1);
    var pS = +(30 * SC).toFixed(1);
    var supPlenW = +(24 * SC).toFixed(1);
    var retPlenW = +(12 * SC).toFixed(1);
    var supBoxX = dir > 0 ? (f1x + fW / 2) : (f1x - fW / 2 - supPlenW);
    var retBoxX = dir > 0 ? (f1x - fW / 2 - retPlenW) : (f1x + fW / 2);

    return '<svg id="hvacDuctMapSvg" viewBox="0 0 500 332" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Mapa interactivo de calefactor, ductos por cuarto y salida lateral" : "Interactive map of furnace, room supply and return ducts, and sidewall exhaust") + '" style="touch-action:none">' +
      '<text x="14" y="17" font-size="8.2" font-weight="800" fill="#1f5f7a">' +
        (es ? "MAPA DE CALEFACCIÓN Y DUCTOS · ARRASTRA EL CALEFACTOR O LAS REJILLAS POR CUARTO"
            : "HEATING & DUCTWORK MAP · DRAG FURNACE OR ROOM REGISTERS TO TEST ROUTING") + "</text>" +
      '<g transform="translate(476,21)">' +
        '<circle r="14" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-10 -3,-3.5 3,-3.5" fill="#a8281c"/>' +
        '<text x="0" y="-11" text-anchor="middle" font-size="6.2" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="11.8" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">S</text>' +
        '<text x="9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">E</text>' +
        '<text x="-9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">' + (es ? "O" : "W") + "</text>" +
      "</g>" +

      '<path d="M ' + px(31.5) + " " + py(108) + " L " + px(147) + " " + py(108) + " L " + px(147) + " " + py(234) + " L " + px(0) + " " + py(234) + " L " + px(0) + " " + py(174) + " L " + px(31.5) + " " + py(174) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.3"/>' +
      '<text x="' + px(88) + '" y="' + py(174) + '" text-anchor="middle" font-size="8.2" font-weight="700" fill="#5d686d">' + (es ? "Cocina" : "Kitchen") + "</text>" +
      '<text x="' + px(70) + '" y="' + py(254) + '" text-anchor="middle" font-size="5.8" font-weight="700" fill="#2f6b3f">' + (es ? "← Patio Oeste" : "← West Rear Yard") + "</text>" +

      '<path d="M ' + px(147) + " " + py(58) + " L " + px(207) + " " + py(58) + " L " + px(207) + " " + py(88) + " L " + px(352) + " " + py(88) + " L " + px(352) + " " + py(142) + " L " + px(147) + " " + py(142) + ' Z" fill="#f4f5f3" stroke="#8a969b" stroke-width="1.2"/>' +
      '<text x="' + px(214) + '" y="' + py(137) + '" text-anchor="middle" font-size="7.0" font-weight="700" fill="#5d686d">' + (es ? "Pasillo" : "Hallway") + "</text>" +

      '<rect x="' + px(207) + '" y="' + py(0) + '" width="' + +(72.1 * SC).toFixed(1) + '" height="' + +(88 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.3"/>' +
      '<text x="' + px(243) + '" y="' + py(44) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#5d686d">' + (es ? "Baño" : "Bathroom") + "</text>" +

      '<rect x="' + px(279.1) + '" y="' + py(5.4) + '" width="' + +(36.3 * SC).toFixed(1) + '" height="' + +(82.6 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.3"/>' +
      '<text x="' + px(297.2) + '" y="' + py(46) + '" text-anchor="middle" font-size="6.0" font-weight="700" fill="#5d686d">' + (es ? "Lav." : "Laundry") + "</text>" +

      '<rect x="' + px(315.4) + '" y="' + py(5.4) + '" width="' + +(36.6 * SC).toFixed(1) + '" height="' + +(82.6 * SC).toFixed(1) + '" rx="2" fill="#fdf6e7" stroke="#9a5b06" stroke-width="1.2" stroke-dasharray="3 2"/>' +
      '<text x="' + px(333.7) + '" y="' + py(47) + '" text-anchor="middle" font-size="5.6" font-weight="800" fill="#9a5b06">' + (es ? "Clóset" : "Closet") + "</text>" +
      '<path d="M ' + px(352) + " " + py(0) + " L " + px(437.5) + " " + py(0) + " L " + px(474) + " " + py(34) + " L " + px(474) + " " + py(96) + " L " + px(437.5) + " " + py(136) + " L " + px(352) + " " + py(136) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.3"/>' +
      '<text x="' + px(410) + '" y="' + py(52) + '" text-anchor="middle" font-size="8.2" font-weight="700" fill="#5d686d">' + (es ? "Recámara" : "Bedroom") + "</text>" +

      '<rect x="' + px(147) + '" y="' + py(142) + '" width="' + +(146.7 * SC).toFixed(1) + '" height="' + +(155.75 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.3"/>' +
      '<text x="' + px(242) + '" y="' + py(166) + '" text-anchor="middle" font-size="8.0" font-weight="700" fill="#5d686d">' + (es ? "Comedor" : "Dining") + "</text>" +

      '<path d="M ' + px(293.7) + " " + py(142) + " L " + px(473.5) + " " + py(142) + " L " + px(508) + " " + py(178) + " L " + px(508) + " " + py(258) + " L " + px(473.5) + " " + py(297.75) + " L " + px(293.7) + " " + py(297.75) + ' Z" fill="#fbfcfb" stroke="#8a969b" stroke-width="1.3"/>' +
      '<text x="' + px(400) + '" y="' + py(222) + '" text-anchor="middle" font-size="8.2" font-weight="700" fill="#5d686d">' + (es ? "Sala" : "Living Room") + "</text>" +

      '<rect x="' + (px(147) + 2) + '" y="' + (py(206) - 6) + '" width="34" height="12" rx="2" fill="#ecedea" stroke="#5d686d" stroke-width="0.9"/>' +
      '<text x="' + (px(147) + 19) + '" y="' + (py(206) + 2.5) + '" text-anchor="middle" font-size="5.2" font-weight="700" fill="#5d686d">' + (es ? "Panel D04" : "Panel D04") + "</text>" +

      '<path id="hvacWalkRef" d="' + m.walk.d + '" fill="none" stroke="#cbd5e1" stroke-width="' + +(24 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.32"/>' +
      '<rect id="hvacHatchRef" x="' + px(HATCH_DOOR4.x - HATCH_DOOR4.w / 2) + '" y="' + py(HATCH_DOOR4.y - HATCH_DOOR4.h / 2) + '" width="' + +(HATCH_DOOR4.w * SC).toFixed(1) + '" height="' + +(HATCH_DOOR4.h * SC).toFixed(1) + '" rx="2" fill="' + (m.hatchBlocked ? "#f9e6e4" : "#f8fafc") + '" stroke="' + (m.hatchBlocked ? "#a8281c" : "#94a3b8") + '" stroke-width="1.4" stroke-dasharray="3 2"/>' +
      '<text x="' + (px(HATCH_DOOR4.x - HATCH_DOOR4.w / 2) - 4).toFixed(1) + '" y="' + (py(HATCH_DOOR4.y) + 2) + '" text-anchor="end" font-size="5.6" font-weight="700" fill="#64748b">' + (es ? "Escotilla" : "Hatch") + "</text>" +

      '<g id="hvacDynamicDuctsLayer">' + buildDynamicDuctsSvg(m, es) + "</g>" +

      '<g class="u4-drag-move" data-node="s1" tabindex="0" role="application" aria-label="Drag Kitchen Warm Supply" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (s1x - 32) + '" y="' + (s1y - 8.5) + '" width="64" height="17" rx="4.5" fill="#1f5f7a" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + s1x + '" y="' + (s1y + 2.5) + '" text-anchor="middle" font-size="6.0" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "Iny. Cocina" : "Kitchen Supply") + "</text>" +
      "</g>" +
      '<g class="u4-drag-move" data-node="s2" tabindex="0" role="application" aria-label="Drag Living Room Warm Supply" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (s2x - 31) + '" y="' + (s2y - 8.5) + '" width="62" height="17" rx="4.5" fill="#1f5f7a" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + s2x + '" y="' + (s2y + 2.5) + '" text-anchor="middle" font-size="6.0" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "Iny. Sala" : "Living Supply") + "</text>" +
      "</g>" +
      '<g class="u4-drag-move" data-node="s3" tabindex="0" role="application" aria-label="Drag Bedroom Warm Supply" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (s3x - 34) + '" y="' + (s3y - 8.5) + '" width="68" height="17" rx="4.5" fill="#1f5f7a" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + s3x + '" y="' + (s3y + 2.5) + '" text-anchor="middle" font-size="6.0" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "Iny. Recámara" : "Bedroom Supply") + "</text>" +
      "</g>" +

      '<g class="u4-drag-move" data-node="r1" tabindex="0" role="application" aria-label="Drag Central Hall Return" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (r1x - 29) + '" y="' + (r1y - 8.5) + '" width="58" height="17" rx="4.5" fill="#0f766e" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + r1x + '" y="' + (r1y + 2.5) + '" text-anchor="middle" font-size="6.0" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "Retorno Pasillo" : "Hall Return") + "</text>" +
      "</g>" +

      '<g class="u4-drag-move" data-node="jd1" tabindex="0" role="application" aria-label="Drag Bedroom Air Transfer" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (jdx - 28) + '" y="' + (jdy - 8) + '" width="56" height="15.5" rx="4" fill="#6d28d9" stroke="#ffffff" stroke-width="1.1"/>' +
        '<text x="' + jdx + '" y="' + (jdy + 2) + '" text-anchor="middle" font-size="5.6" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "Paso de Aire" : "Air Transfer") + "</text>" +
      "</g>" +

      '<g class="u4-drag-move" data-node="f1" tabindex="0" role="application" aria-label="Drag Horizontal Furnace" transform="translate(0, 0)">' +
        '<rect x="' + (f1x - pS / 2).toFixed(1) + '" y="' + (f1y - fH / 2 - pS).toFixed(1) + '" width="' + pS + '" height="' + pS + '" rx="3" fill="#e4f0e6" fill-opacity="0.55" stroke="#2f6b3f" stroke-width="1.2" stroke-dasharray="3 2"/>' +
        '<rect x="' + retBoxX.toFixed(1) + '" y="' + (f1y - 8).toFixed(1) + '" width="' + retPlenW + '" height="16" rx="2" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.3"/>' +
        '<rect x="' + supBoxX.toFixed(1) + '" y="' + (f1y - 8.5).toFixed(1) + '" width="' + supPlenW + '" height="17" rx="2" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.4"/>' +
        '<rect class="u4-drag-grip" x="' + (f1x - fW / 2).toFixed(1) + '" y="' + (f1y - fH / 2).toFixed(1) + '" width="' + fW + '" height="' + fH + '" rx="3.5" fill="#1d2326" stroke="#7cc0dc" stroke-width="1.8"/>' +
        '<text x="' + f1x + '" y="' + (f1y - 1.5) + '" text-anchor="middle" font-size="5.6" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "Calefactor" : "Furnace") + "</text>" +
        '<text x="' + f1x + '" y="' + (f1y + 6.8) + '" text-anchor="middle" font-size="5.0" font-weight="700" fill="#7cc0dc" pointer-events="none">45k ' + (dir > 0 ? "→" : "←") + "</text>" +
      "</g>" +

      '<rect id="hvacSvgPill" x="14" y="303" width="472" height="20" rx="5" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
      '<text id="hvacSvgPillTxt" x="250" y="316" text-anchor="middle" font-size="7.0" font-weight="700" fill="#1d2326">' +
        (es ? "Inyecciones: Cocina " + m.sa1Ft + "' · Sala " + m.sa2Ft + "' · Recámara " + m.sa3Ft + "' | Retorno: " + m.ra1Ft + "' | Salida lateral: " + m.flue.runFt + "'"
            : "Supply runs: Kitchen " + m.sa1Ft + "' · Living " + m.sa2Ft + "' · Bedroom " + m.sa3Ft + "' | Return: " + m.ra1Ft + "' | Sidewall exhaust: " + m.flue.runFt + "'") +
      "</text>" +
    "</svg>";
  }

  function renderSidewallExhaustSvg(m, es) {
    var fl = m.flue;
    var isFail = fl.gravityIllegal;
    var isPvc = state.ventMode === "cat4_pvc";
    var ventStroke = isFail ? "#a8281c" : (isPvc ? "#1f5f7a" : "#b45309");
    var ventFill = isFail ? "#f9e6e4" : (isPvc ? "#e3eef2" : "#fef3c7");
    var wallLbl = fl.effectiveWall === "west"
      ? (es ? "SALIDA POR MURO OESTE AL PATIO TRASERO (≥ 4 PIES LIBRES)" : "WEST REAR-YARD SIDEWALL EXIT (≥ 4 FT CLEAR)")
      : (es ? "SALIDA POR MURO SUR EXTERIOR (VERIFICAR ≥ 4 PIES A COLINDANCIA)" : "SOUTH EXTERIOR SIDEWALL EXIT (VERIFY ≥ 4 FT TO PROPERTY LINE)");

    return '<svg viewBox="0 0 470 226" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Corte vertical del ático de techo plano de 66 pulgadas con salida lateral horizontal" : "66-inch flat-roof attic cross-section showing horizontal sidewall exhaust") + '">' +
      '<text x="235" y="16" text-anchor="middle" font-size="8.6" font-weight="800" fill="#1f5f7a">' +
        (es ? 'ÁTICO DE TECHO PLANO (66" LIBRES) · CERO CORTES EN TECHO · SALIDA LATERAL'
            : '66" FLAT-ROOF ATTIC · ZERO ROOF PENETRATIONS · HORIZONTAL SIDEWALL EXHAUST') + "</text>" +
      '<rect x="28" y="26" width="380" height="10" fill="#475569" stroke="#1d2326" stroke-width="1.3"/>' +
      '<rect x="28" y="36" width="380" height="11" fill="#e2e8f0" stroke="#475569" stroke-width="1.0"/>' +
      '<text x="218" y="33.5" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff">' +
        (es ? "MEMBRANA DE TECHO PLANO EXISTENTE · NO CORTAR EL TECHO" : "EXISTING FLAT ROOF MEMBRANE · DO NOT CUT ROOF") + "</text>" +
      '<rect x="28" y="47" width="12" height="125" fill="#cbd5e1" stroke="#1d2326" stroke-width="1.4"/>' +
      '<rect x="40" y="47" width="368" height="125" fill="#fbfcfb" stroke="#98a4a8" stroke-width="1"/>' +
      '<rect x="28" y="172" width="380" height="12" fill="#fde68a" stroke="#7c4d12" stroke-width="1.3"/>' +
      '<text x="286" y="180.5" text-anchor="middle" font-size="6.5" font-weight="700" fill="#7c4d12">' +
        (es ? 'Vigas de plafón + pasillo de madera de 24" (' + m.walk.walkFt + " pies)" : 'Ceiling joists + 24" wood walkway (' + m.walk.walkFt + " ft)") + "</text>" +
      '<line x1="378" y1="47" x2="378" y2="172" stroke="#1f5f7a" stroke-width="1.4" stroke-dasharray="3 2"/>' +
      '<rect x="322" y="98" width="112" height="20" rx="4" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1"/>' +
      '<text x="378" y="111" text-anchor="middle" font-size="7.4" font-weight="800" fill="#1f5f7a">' + (es ? '66" (5\'-6") libres' : '66" (5\'-6") clear') + "</text>" +
      '<rect x="176" y="165" width="112" height="7" fill="#2f6b3f"/>' +
      '<rect x="192" y="131" width="84" height="34" rx="3" fill="#1d2326" stroke="#7cc0dc" stroke-width="1.6"/>' +
      '<text x="234" y="147" text-anchor="middle" font-size="7.4" font-weight="800" fill="#ffffff">' + (es ? "Calefactor 45k" : "Furnace 45k") + "</text>" +
      '<text x="234" y="158" text-anchor="middle" font-size="6.2" font-weight="700" fill="#7cc0dc">' + (es ? 'Horizontal 14-3/16"' : 'Horizontal 14-3/16"') + "</text>" +
      '<path d="M 192 142 L 166 120 L 22 104" fill="none" stroke="' + ventStroke + '" stroke-width="6.5" stroke-linecap="round" opacity="0.26"/>' +
      '<path d="M 192 142 L 166 120 L 22 104" fill="none" stroke="' + ventStroke + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<rect x="6" y="92" width="24" height="24" rx="3" fill="' + ventFill + '" stroke="' + ventStroke + '" stroke-width="1.7"/>' +
      '<text x="18" y="107" text-anchor="middle" font-size="6.2" font-weight="800" fill="' + ventStroke + '">' + (isFail ? "NO" : (isPvc ? "PVC" : "FAN")) + "</text>" +
      '<rect x="50" y="55" width="256" height="42" rx="4" fill="' + ventFill + '" stroke="' + ventStroke + '" stroke-width="1.2"/>' +
      '<text x="58" y="68" font-size="6.9" font-weight="800" fill="' + ventStroke + '">' + esc(wallLbl) + "</text>" +
      '<text x="58" y="80" font-size="6.5" font-weight="700" fill="#1d2326">' +
        esc(isFail
          ? (es ? "No permitido: equipo 80% no puede salir horizontal sin extractor" : "Not permitted: 80% furnace cannot gravity-vent horizontally")
          : isPvc
            ? (es ? "Opción B: PVC sellado 95%+ (o bomba de calor sin chimenea)" : "Option B: 95%+ sealed PVC direct-vent (or ducted heat pump)")
            : (es ? 'Opción A: Extractor lateral listado + pendiente ≥1/4"/pie (' + fl.runFt + "')" : 'Option A: Listed sidewall power venter + ≥1/4"/ft slope (' + fl.runFt + "')")) +
      "</text>" +
      '<text x="58" y="91" font-size="6.2" font-weight="600" fill="#5d686d">' +
        (es ? "Mantener ≥ 4 pies a colindancia y ventanas · sujetar cada ≤ 5 pies" : "Maintain ≥ 4 ft from property line & windows · strap every ≤ 5 ft") +
      "</text>" +
      '<text x="235" y="213" text-anchor="middle" font-size="7.2" font-weight="700" fill="#2f6b3f">' +
        (es ? 'Plataforma de servicio Norte 30" × 30" + contacto GFCI 120V (≤ 25 pies) + luz LED con apagador'
            : '30" × 30" North service platform + 120V GFCI outlet (≤ 25 ft) + switched LED light') +
      "</text>" +
    "</svg>";
  }

  function wireDuctMapDrags() {
    var svg = document.getElementById("hvacDuctMapSvg");
    if (!svg) return;
    var es = isEs();
    var BOUNDS = {
      f1: { minX: 162, maxX: 430, minY: 118, maxY: 274 },
      r1: { minX: 156, maxX: 380, minY: 68, maxY: 266 },
      s1: { minX: 54, maxX: 310, minY: 72, maxY: 272 },
      s2: { minX: 160, maxX: 468, minY: 148, maxY: 278 },
      s3: { minX: 356, maxX: 454, minY: 24, maxY: 132 },
      jd1: { minX: 316, maxX: 400, minY: 84, maxY: 134 }
    };
    var initPos = {};
    Object.keys(state.nodes).forEach(function (k) {
      initPos[k] = { x: state.nodes[k].x, y: state.nodes[k].y };
    });

    function updateDomInPlace(nodeKey, newXIn, newYIn) {
      var b = BOUNDS[nodeKey] || { minX: 40, maxX: 460, minY: 30, maxY: 280 };
      var nx = Math.max(b.minX, Math.min(b.maxX, Math.round(newXIn)));
      var ny = Math.max(b.minY, Math.min(b.maxY, Math.round(newYIn)));
      state.nodes[nodeKey].x = nx;
      state.nodes[nodeKey].y = ny;
      state.activePreset = "custom";

      var el = svg.querySelector('[data-node="' + nodeKey + '"]');
      if (el) {
        var dxPx = +(px(nx) - px(initPos[nodeKey].x)).toFixed(1);
        var dyPx = +(py(ny) - py(initPos[nodeKey].y)).toFixed(1);
        el.setAttribute("transform", "translate(" + dxPx + ", " + dyPx + ")");
      }

      var m = computeDucts();
      var ductLayer = document.getElementById("hvacDynamicDuctsLayer");
      if (ductLayer) ductLayer.innerHTML = buildDynamicDuctsSvg(m, es);
      var walkRef = document.getElementById("hvacWalkRef");
      if (walkRef) walkRef.setAttribute("d", m.walk.d);
      var hatchRef = document.getElementById("hvacHatchRef");
      if (hatchRef) {
        hatchRef.setAttribute("fill", m.hatchBlocked ? "#f9e6e4" : "#f8fafc");
        hatchRef.setAttribute("stroke", m.hatchBlocked ? "#a8281c" : "#94a3b8");
      }

      var ptxt = document.getElementById("hvacSvgPillTxt");
      if (ptxt) {
        ptxt.textContent = es
          ? "Inyecciones: Cocina " + m.sa1Ft + "' · Sala " + m.sa2Ft + "' · Recámara " + m.sa3Ft + "' | Retorno: " + m.ra1Ft + "' | Salida lateral: " + m.flue.runFt + "'"
          : "Supply runs: Kitchen " + m.sa1Ft + "' · Living " + m.sa2Ft + "' · Bedroom " + m.sa3Ft + "' | Return: " + m.ra1Ft + "' | Sidewall exhaust: " + m.flue.runFt + "'";
      }

      var kpiSup = document.getElementById("hvacKpiSupply");
      if (kpiSup) kpiSup.textContent = m.sa1Ft + "' · " + m.sa2Ft + "' · " + m.sa3Ft + "'";
      var kpiRet = document.getElementById("hvacKpiReturn");
      if (kpiRet) kpiRet.textContent = m.ra1Ft + (es ? " pies" : " ft");
      var kpiExh = document.getElementById("hvacKpiExhaust");
      if (kpiExh) {
        kpiExh.className = "u4h-kpi-val " + (m.walk.walkPass && !m.flue.gravityIllegal ? "is-ok" : "is-fail");
        kpiExh.textContent = m.flue.runFt + (es ? " pies (" + (m.flue.effectiveWall === "west" ? "Oeste" : "Sur") + ")" : " ft (" + (m.flue.effectiveWall === "west" ? "West" : "South") + ")");
      }

      var st = document.getElementById("hvacStatusBanner");
      if (st) {
        var sObj = computeStatus(m, es);
        st.className = "u4h-status " + sObj.cls;
        st.textContent = sObj.txt;
      }
    }

    svg.querySelectorAll("[data-node]").forEach(function (handle) {
      var nodeKey = handle.getAttribute("data-node");
      handle.addEventListener("pointerdown", function (ev) {
        if (ev.button !== undefined && ev.button !== 0 && ev.pointerType === "mouse") return;
        ev.preventDefault();
        var pid = ev.pointerId;
        state.dragActive = true;
        handle.classList.add("is-dragging");
        try { handle.setPointerCapture(pid); } catch (_) {}
        var blockScroll = function (tev) { if (tev.cancelable) tev.preventDefault(); };
        window.addEventListener("touchmove", blockScroll, { passive: false });

        function onMove(e) {
          if (!state.dragActive || e.pointerId !== pid) return;
          var rect = svg.getBoundingClientRect();
          var svgX = ((e.clientX - rect.left) / (rect.width || 500)) * 500;
          var svgY = ((e.clientY - rect.top) / (rect.height || 332)) * 332;
          updateDomInPlace(nodeKey, (svgX - OX) / SC, (svgY - OY) / SC);
        }
        function finish(e) {
          if (e && e.pointerId !== pid) return;
          state.dragActive = false;
          handle.classList.remove("is-dragging");
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", finish);
          document.removeEventListener("pointercancel", finish);
          window.removeEventListener("touchmove", blockScroll);
          try { if (handle.hasPointerCapture && handle.hasPointerCapture(pid)) handle.releasePointerCapture(pid); } catch (_) {}
          syncBlueprintAndUrl();
          render();
        }
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", finish);
        document.addEventListener("pointercancel", finish);
      });
    });
  }

  function render() {
    var host = document.getElementById("u4hBody");
    var holdEl = document.getElementById("u4hHoldStrip");
    if (!host) return;
    var es = isEs();
    var m = computeDucts();
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip";
      holdEl.innerHTML = es
        ? '<strong>Plano 2 de 2 — Sistema de Calefacción, Ductos y Salida Lateral:</strong> Cero cortes en el techo plano. ¿Buscas las medidas de la escotilla de <code>24" × 36"</code> y el pasillo de madera? <a href="../attic-hatch/index.html">1. Escotilla y Pasillo &rarr;</a>'
        : '<strong>Plan 2 of 2 — Heating System, Room Ducts &amp; Sidewall Exhaust:</strong> Zero flat-roof penetrations. Need framing &amp; lumber for the <code>24" × 36"</code> hatch and wood walkway? <a href="../attic-hatch/index.html">1. Hatch &amp; Wood Walkway &rarr;</a>';
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Heating System: Furnace, Ducts & Sidewall Exhaust";
    var titleEs = "Sistema de Calefacción: Calefactor, Ductos y Salida Lateral";
    var subEn = "Drag the furnace or any room register to explore duct routing, airflow balance, and sidewall exhaust";
    var subEs = "Arrastra el calefactor o cualquier rejilla para probar el trazado de ductos, balance de aire y salida lateral";
    var inner = "";

    if (state.step === "ducts") {
      var stObj = computeStatus(m, es);
      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Inyecciones (Coc · Sala · Rec)" : "Warm Supplies (Kit · Liv · Bed)") + "</div>" +
            '<div id="hvacKpiSupply" class="u4h-kpi-val is-info">' + m.sa1Ft + "' · " + m.sa2Ft + "' · " + m.sa3Ft + "'</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "Ductos flexibles aislados (≤ 25' ideal)" : "Insulated branches (≤ 25 ft target)") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Retorno en Pasillo" : "Central Hall Return") + "</div>" +
            '<div id="hvacKpiReturn" class="u4h-kpi-val is-ok">' + m.ra1Ft + (es ? " pies" : " ft") + "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "+ Paso de aire en Recámara" : "+ Bedroom air-transfer grille") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Salida Lateral Horizontal" : "Sidewall Flue Exhaust") + "</div>" +
            '<div id="hvacKpiExhaust" class="u4h-kpi-val ' + (m.walk.walkPass && !m.flue.gravityIllegal ? "is-ok" : "is-fail") + '">' +
              m.flue.runFt + (es ? " pies (" + (m.flue.effectiveWall === "west" ? "Oeste" : "Sur") + ")" : " ft (" + (m.flue.effectiveWall === "west" ? "West" : "South") + ")") +
            "</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "Cero cortes en techo plano" : "Zero flat-roof cuts") + "</div>" +
          "</div>" +
        "</div>" +
        renderColorLegendHtml(es) +
        '<div class="u4h-svg-wrap">' + renderDuctMapSvg(m, es) + "</div>" +
        '<div class="u4h-svg-hint">' + (es ? "Consejo: Arrastra el calefactor o cualquier rejilla por cuarto para probar largos de ducto y holguras." : "Tip: Drag the furnace or any room register on the map to test duct lengths & clearances.") + "</div>" +
        '<div id="hvacStatusBanner" class="u4h-status ' + stObj.cls + '">' + esc(stObj.txt) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Ubicación del calefactor:" : "Furnace position:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.activePreset === "sw_dining" ? " is-active" : "") + '" data-preset="sw_dining">' + (es ? "Comedor SO · 15.8' (Recomendado)" : "Southwest Dining · 15.8' (Recommended)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.activePreset === "nw_dining" ? " is-active" : "") + '" data-preset="nw_dining">' + (es ? "Comedor NO · 10.6'" : "Northwest Dining · 10.6'") + "</button>" +
              '<button type="button" class="u4h-pill" data-preset="reset_all">' + (es ? "Restablecer rejillas" : "Reset all registers") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Muro de salida lateral:" : "Sidewall exhaust wall:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.exitWall === "south" ? " is-active" : "") + '" data-ewall="south">' + (es ? "Muro Sur (verificar ≥ 4' a colindancia)" : "South Wall (verify ≥ 4' to lot line)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.exitWall === "west" ? " is-active" : "") + '" data-ewall="west">' + (es ? "Muro Oeste al Patio (≥ 4' libre)" : "West Rear-Yard Wall (≥ 4' clear)") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Estilo de ductos:" : "Duct trunk & airflow:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.ductMode === "trunk" ? " is-active" : "") + '" data-dmode="trunk">' + (es ? "Troncal y ramales" : "Trunk & branch") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ductMode === "radial" ? " is-active" : "") + '" data-dmode="radial">' + (es ? "Pleno radial" : "Radial plenum") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.dischargeDir === "right" ? " is-active" : "") + '" data-ddir="right">' + (es ? "Inyección al Este →" : "Supply East →") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.dischargeDir === "left" ? " is-active" : "") + '" data-ddir="left">' + (es ? "← Inyección al Oeste" : "← Supply West") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        renderHvacEquipDrawer(es);

    } else {
      titleEn = '66" Flat-Roof Cavity & Horizontal Sidewall Exhaust';
      titleEs = 'Ático de Techo Plano (66") y Salida Lateral Horizontal';
      subEn = "Why the flat roof stays uncut — compare horizontal sidewall exhaust options and property-line clearance";
      subEs = "Por qué el techo plano no se corta — compara las opciones de salida lateral y distancia a colindancia";
      var secObj = computeStatus(m, es);
      inner =
        '<div class="u4h-svg-wrap">' + renderSidewallExhaustSvg(m, es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Sistema de salida lateral:" : "Sidewall exhaust option:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.ventMode === "power_venter" ? " is-active" : "") + '" data-vmode="power_venter">' + (es ? "Opción A: 80% + Extractor listado" : "Option A: 80% + Listed Power Venter") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ventMode === "cat4_pvc" ? " is-active" : "") + '" data-vmode="cat4_pvc">' + (es ? "Opción B: PVC sellado 95%+ / Bomba" : "Option B: 95%+ Sealed PVC / Heat Pump") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ventMode === "gravity_unassisted" ? " is-active" : "") + '" data-vmode="gravity_unassisted">' + (es ? "Gravedad sin extractor (No permitido)" : "Unassisted gravity (Not permitted)") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Distancia del muro Sur a colindancia:" : "South wall setback to property line:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.southLotSetbackFt === "unknown" ? " is-active" : "") + '" data-lot="unknown">' + (es ? "Por verificar en sitio" : "Verify on site") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.southLotSetbackFt === "gte4" ? " is-active" : "") + '" data-lot="gte4">' + (es ? "≥ 4 pies (Muro Sur OK)" : "≥ 4 ft (South Wall OK)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.southLotSetbackFt === "lt4" ? " is-active" : "") + '" data-lot="lt4">' + (es ? "< 4 pies (Salir al Patio Oeste)" : "< 4 ft (Route to West Yard)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-status ' + secObj.cls + '">' + esc(secObj.txt) + "</div>" +
        renderHvacEquipDrawer(es);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="hvacPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + (es ? "Anterior" : "Prev") + "</button>" +
      '<span class="u4h-pager-count">' + (es ? "Vista " : "View ") + (idx + 1) + (es ? " de " : " of ") + STEPS.length + "</span>" +
      '<button type="button" id="hvacNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + (es ? "Siguiente" : "Next") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(es ? titleEs : titleEn) + "</div>" +
            '<div class="u4h-sub">' + esc(es ? subEs : subEn) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">' + (es ? "Plano 2 · Calefactor y Ductos" : "Plan 2 · Furnace & Ducts") + "</span>" +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); syncBlueprintAndUrl(); render(); window.scrollTo(0, 0); });
    });
    host.querySelectorAll("[data-preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-preset");
        if (p === "reset_all" || p === "sw_dining") {
          state.nodes = cloneDefaults();
          state.dischargeDir = "right";
          state.activePreset = "sw_dining";
        } else if (p === "nw_dining") {
          state.nodes.f1 = { x: 174, y: 196 };
          state.activePreset = "nw_dining";
        }
        syncBlueprintAndUrl();
        render();
      });
    });
    host.querySelectorAll("[data-ewall]").forEach(function (b) {
      b.addEventListener("click", function () { state.exitWall = b.getAttribute("data-ewall"); syncBlueprintAndUrl(); render(); });
    });
    host.querySelectorAll("[data-dmode]").forEach(function (b) {
      b.addEventListener("click", function () { state.ductMode = b.getAttribute("data-dmode"); render(); });
    });
    host.querySelectorAll("[data-ddir]").forEach(function (b) {
      b.addEventListener("click", function () { state.dischargeDir = b.getAttribute("data-ddir"); render(); });
    });
    host.querySelectorAll("[data-vmode]").forEach(function (b) {
      b.addEventListener("click", function () { state.ventMode = b.getAttribute("data-vmode"); syncBlueprintAndUrl(); render(); });
    });
    host.querySelectorAll("[data-lot]").forEach(function (b) {
      b.addEventListener("click", function () { state.southLotSetbackFt = b.getAttribute("data-lot"); render(); });
    });

    var pBtn = document.getElementById("hvacPrevBtn");
    var nBtn = document.getElementById("hvacNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; syncBlueprintAndUrl(); render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; syncBlueprintAndUrl(); render(); window.scrollTo(0, 0); } });

    if (state.step === "ducts") wireDuctMapDrags();

    if (window.U4ZoomPan && typeof window.U4ZoomPan.refresh === "function") {
      try { window.U4ZoomPan.refresh(); } catch (_) {}
    }
    if (window.U4PinDragger && typeof window.U4PinDragger.refresh === "function") {
      try { window.U4PinDragger.refresh(); } catch (_) {}
    }
    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext();
    }
  }

  window.U4PlanControl = {
    showView: function (args) {
      args = args || {};
      if (args.step != null && args.step !== "") {
        state.step = resolveStep(args.step);
        syncBlueprintAndUrl();
        render();
        return true;
      }
      return false;
    },
    applyChange: function (args) {
      args = args || {};
      var act = String(args.action || args.target || "").toLowerCase();
      var val = String(args.value || "").toLowerCase();
      if (act === "duct_mode" || act === "mode") {
        state.ductMode = val.indexOf("rad") >= 0 ? "radial" : "trunk";
      } else if (act === "vent_mode" || act === "vent") {
        state.ventMode = val.indexOf("pvc") >= 0 || val.indexOf("95") >= 0 ? "cat4_pvc" : (val.indexOf("grav") >= 0 ? "gravity_unassisted" : "power_venter");
      } else if (act === "exit_wall" || act === "sidewall") {
        state.exitWall = val.indexOf("west") >= 0 ? "west" : "south";
      } else if (act === "discharge" || act === "discharge_dir") {
        state.dischargeDir = val.indexOf("left") >= 0 || val.indexOf("west") >= 0 ? "left" : "right";
      } else if (act === "reset") {
        state.nodes = cloneDefaults();
        state.ductMode = "trunk";
        state.dischargeDir = "right";
        state.ventMode = "power_venter";
        state.exitWall = "south";
        state.activePreset = "sw_dining";
      } else {
        return false;
      }
      syncBlueprintAndUrl();
      render();
      return true;
    },
    getState: function () {
      var m = computeDucts();
      return {
        planId: "hvac-layout",
        step: state.step,
        wall: "hvac_duct_map",
        ventMode: state.ventMode,
        exitWall: m.flue.effectiveWall,
        ductMode: state.ductMode,
        dischargeDir: state.dischargeDir,
        runs: { kitchen: m.sa1Ft, living: m.sa2Ft, bedroom: m.sa3Ft, hallReturn: m.ra1Ft, sidewallFlue: m.flue.runFt },
        nodes: state.nodes,
        summary: "Plan 2 Heating System & Ducts: view=" + state.step + ", supplies=(" + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "ft), return=" + m.ra1Ft + "ft, exhaust=" + state.ventMode + " (" + m.flue.effectiveWall + " wall)."
      };
    }
  };

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "hvac-layout",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { render(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); }
      });
      var bp = window.U4PlanNav.getBootParams ? window.U4PlanNav.getBootParams() : {};
      if (bp.step) state.step = resolveStep(bp.step);
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "hvac-layout",
        room: "hvac",
        titleEn: "Heating System: Furnace, Ducts & Sidewall Exhaust",
        titleEs: "Sistema de Calefacción: Calefactor, Ductos y Salida Lateral",
        getContext: function () {
          var m = computeDucts();
          return "Plan2=hvac-layout, View=" + state.step + ", Furnace=(" + state.nodes.f1.x + "in," + state.nodes.f1.y + "in SW Dining), Supplies=(Kitchen " + m.sa1Ft + "ft, Living " + m.sa2Ft + "ft, Bedroom " + m.sa3Ft + "ft), HallReturn=" + m.ra1Ft + "ft, SidewallExhaust=" + state.ventMode + " (" + m.flue.effectiveWall + " wall, zero flat-roof cuts).";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Cómo llegan los ductos de aire caliente a Cocina, Sala y Recámara?", "¿Cuáles son las dos opciones de salida lateral sin cortar el techo plano?", "¿Por qué debe separarse la inyección al menos 4 pies del retorno?"]
            : ["How are warm supply ducts routed to the Kitchen, Living Room, and Bedroom?", "What are the two horizontal sidewall exhaust options with zero roof cuts?", "Why keep supply registers at least 4 ft away from the Hall Return?"];
        }
      });
    }
    syncBlueprintAndUrl();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
