/* ============================================================================
   Attic Hatch, Walkway, Furnace & Ducts — Streamlined Unified Plan
   One calm Classic Old Wiki 4-step guide:
     1. Floor Plan & Ducts (draggable F1/ducts + clickable 24"x36" Door 4 hatch)
     2. 24"x36" Hatch & Seals (side-by-side landing photo + framing & seal diagram)
     3. Flat Roof & Sidewall Vent (66" flat cavity + sidewall exit check)
     4. Monday Walkthrough (NEXT vs. Crew phases + 4 Monday Nov 23 questions)
   Zero External CDNs · Zero Prices · Zero Code Soup · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "layout", en: "1. Floor Plan & Ducts", es: "1. Planta y Ductos" },
    { id: "hatch", en: "2. 24\"×36\" Hatch & Seals", es: "2. Escotilla y Sellos" },
    { id: "section", en: "3. Flat Roof & Sidewall Vent", es: "3. Techo Plano y Salida" },
    { id: "walkthrough", en: "4. Monday Walkthrough", es: "4. Visita del Lunes" }
  ];

  // Uniform true-scale Unit 4 floor plan geometry (inches, N=0..298", W=0..508", scaleX === scaleY = 0.86 px/in)
  var SC = 0.86;
  var OX = 24;
  var OY = 38;
  function px(xIn) { return +(OX + xIn * SC).toFixed(1); }
  function py(yIn) { return +(OY + yIn * SC).toFixed(1); }

  var HATCH_DOOR4_IN = { x: 112, y: 74, w: 24, h: 36 };
  var HATCH_HALL_IN = { x: 204, y: 108, w: 36, h: 24 };

  var RECONCILED_DEFAULTS = {
    f1: { x: 174, y: 258 },
    r1: { x: 248, y: 114 },
    s1: { x: 168, y: 126 },
    s2: { x: 312, y: 212 },
    s3: { x: 386, y: 116 },
    jd1: { x: 334, y: 80 }
  };

  function cloneDefaults() {
    return {
      f1: { x: RECONCILED_DEFAULTS.f1.x, y: RECONCILED_DEFAULTS.f1.y },
      r1: { x: RECONCILED_DEFAULTS.r1.x, y: RECONCILED_DEFAULTS.r1.y },
      s1: { x: RECONCILED_DEFAULTS.s1.x, y: RECONCILED_DEFAULTS.s1.y },
      s2: { x: RECONCILED_DEFAULTS.s2.x, y: RECONCILED_DEFAULTS.s2.y },
      s3: { x: RECONCILED_DEFAULTS.s3.x, y: RECONCILED_DEFAULTS.s3.y },
      jd1: { x: RECONCILED_DEFAULTS.jd1.x, y: RECONCILED_DEFAULTS.jd1.y }
    };
  }

  var bootParams = new URLSearchParams(window.location.search || "");
  var bootNodes = cloneDefaults();
  var bFx = Number(bootParams.get("fx"));
  var bFy = Number(bootParams.get("fy"));
  if (isFinite(bFx) && bFx >= 160 && bFx <= 430) bootNodes.f1.x = Math.round(bFx);
  if (isFinite(bFy) && bFy >= 108 && bFy <= 274) bootNodes.f1.y = Math.round(bFy);

  function resolveInitialStep(raw) {
    var s = String(raw || "").toLowerCase().trim();
    var map = {
      "1": "layout", "plan": "layout", "attic": "layout", "ducts": "layout", "walkway": "layout", "pathway": "layout",
      "2": "hatch", "hatch": "hatch", "spot": "hatch", "framing": "hatch", "seal": "hatch", "lid": "hatch",
      "3": "section", "section": "section", "vent": "section", "roof": "section", "sidewall": "section", "height": "section",
      "4": "walkthrough", "walkthrough": "walkthrough", "mon": "walkthrough", "monday": "walkthrough", "gates": "walkthrough", "checklist": "walkthrough"
    };
    return map[s] || "layout";
  }

  var state = {
    step: resolveInitialStep(bootParams.get("step")),
    nodes: bootNodes,
    hatchLocation: (bootParams.get("loc") || "").toLowerCase() === "hall" ? "hall" : "door4",
    fireRating: "unknown",
    joistBay: "unknown",
    dischargeDir: "right",
    ductMode: "trunk",
    ventMode: bootParams.get("vent") || "power_venter",
    exitWall: bootParams.get("ewall") || "south",
    southLotSetbackFt: "unknown",
    gfciOffsetFt: 3,
    flueClearIn: 1.5,
    activePreset: (bootNodes.f1.x === 174 && bootNodes.f1.y === 258) ? "reconciled" : "custom",
    moreOptsOpen: false,
    dragActive: false,
    equipOpen: false,
    qChecks: { q1: false, q2: false, q3: false, q4: false }
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

  function activeHatchBox() {
    return state.hatchLocation === "hall" ? HATCH_HALL_IN : HATCH_DOOR4_IN;
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

  function computeWalkwayPoints(f1) {
    var hatch = activeHatchBox();
    var platCenterY = f1.y - 29.5;
    var hallSpineY = 108;
    var platEdgeY = platCenterY <= hallSpineY ? Math.min(f1.y - 14.5, platCenterY + 15) : platCenterY - 15;

    if (state.hatchLocation === "hall") {
      var hEast = hatch.x + hatch.w / 2;
      if (Math.abs(f1.x - hatch.x) <= 18) {
        return [
          { x: hatch.x, y: hatch.y + hatch.h / 2 },
          { x: f1.x, y: hatch.y + hatch.h / 2 },
          { x: f1.x, y: platEdgeY }
        ];
      }
      var turnX = f1.x >= hEast ? f1.x : Math.max(166, f1.x);
      var startX = f1.x >= hatch.x ? hEast : (hatch.x - hatch.w / 2);
      return [
        { x: startX, y: hallSpineY },
        { x: turnX, y: hallSpineY },
        { x: turnX, y: platEdgeY }
      ];
    }

    var hatchEastX = hatch.x + hatch.w / 2;
    var hatchMidY = hatch.y;
    if (f1.x >= 162 && f1.x <= 192 && platEdgeY >= hatchMidY) {
      return [
        { x: hatchEastX, y: hatchMidY },
        { x: f1.x, y: hatchMidY },
        { x: f1.x, y: platEdgeY }
      ];
    }
    var entryX = 170;
    return [
      { x: hatchEastX, y: hatchMidY },
      { x: entryX, y: hatchMidY },
      { x: entryX, y: hallSpineY },
      { x: f1.x, y: hallSpineY },
      { x: f1.x, y: platEdgeY }
    ];
  }

  function pathDFromPoints(pts) {
    return pts.map(function (pt, idx) {
      return (idx === 0 ? "M " : " L ") + px(pt.x) + " " + py(pt.y);
    }).join("");
  }

  function computeSidewallFlue(f1) {
    var effectiveWall = (state.exitWall === "south" && state.southLotSetbackFt === "lt4") ? "west" : state.exitWall;
    var pts;
    if (effectiveWall === "west") {
      if (f1.y >= 236) {
        pts = [
          { x: f1.x, y: f1.y + 8 },
          { x: 147, y: Math.max(246, Math.min(288, f1.y + 8)) }
        ];
      } else {
        var safeY = Math.min(132, Math.max(114, f1.y));
        pts = [
          { x: f1.x, y: f1.y },
          { x: f1.x, y: safeY },
          { x: 31.5, y: safeY }
        ];
      }
    } else {
      pts = [
        { x: f1.x, y: f1.y + 14.5 },
        { x: f1.x, y: 297.75 }
      ];
    }

    var runIn = pathLenIn(pts);
    var runFt = +(Math.max(12, runIn) / 12).toFixed(1);
    var minRiseIn = +(runFt * 0.25).toFixed(2);
    var gravityIllegal = state.ventMode === "gravity_unassisted";
    var southLotBlocked = state.exitWall === "south" && state.southLotSetbackFt === "lt4";

    return {
      effectiveWall: effectiveWall,
      pts: pts,
      dStr: pathDFromPoints(pts),
      termPt: pts[pts.length - 1],
      runFt: runFt,
      minRiseIn: minRiseIn,
      gravityIllegal: gravityIllegal,
      southLotBlocked: southLotBlocked
    };
  }

  function computeReactiveDucts() {
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
      { id: "s1", name: "S1", pt: n.s1 },
      { id: "s2", name: "S2", pt: n.s2 },
      { id: "s3", name: "S3", pt: n.s3 }
    ];

    var trunkSegs = [];
    var branches = [];

    if (state.ductMode === "radial") {
      var extEnd = { x: f1.x + dir * (cabHalfW + 34), y: f1.y };
      trunkSegs.push({
        pts: [supFlange, extEnd],
        d: smoothCornerPath([supFlange, extEnd], 8),
        strokeW: 8.5
      });

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
        var ang = Math.atan2(wyeExit.y - collarPt.y, wyeExit.x - collarPt.x) * 180 / Math.PI;
        branches.push({
          id: v.id, name: v.name, d: dStr, pts: pts, ft: +(pathLenIn(pts) / 12).toFixed(1),
          takeoff: collarPt,
          damperPt: { x: collarPt.x + (wyeExit.x - collarPt.x) * 0.72, y: collarPt.y + (wyeExit.y - collarPt.y) * 0.72 },
          damperAngle: ang
        });
      });
    } else {
      var forward = [];
      var behind = [];
      vents.forEach(function (v) {
        var along = (v.pt.x - supEnd.x) * dir;
        if (along < -22) behind.push(v);
        else forward.push(v);
      });
      if (forward.length === 0) { forward = behind.slice(); behind = []; }

      var avgY = forward.reduce(function (acc, v) { return acc + v.pt.y; }, 0) / forward.length;
      var trunkY = Math.max(96, Math.min(252, Math.round(avgY)));
      if (Math.abs(trunkY - f1.y) < 18) trunkY = f1.y;

      forward.sort(function (a, b) {
        return ((a.pt.x - supEnd.x) * dir) - ((b.pt.x - supEnd.x) * dir);
      });

      var clusterPair = null;
      if (forward.length >= 2) {
        for (var ci = 0; ci < forward.length - 1; ci++) {
          var va = forward[ci], vb = forward[ci + 1];
          if (distIn(va.pt, vb.pt) <= 58 && ((va.pt.y - trunkY) * (vb.pt.y - trunkY) >= 0 || Math.abs(va.pt.y - vb.pt.y) <= 44)) {
            clusterPair = [va.id, vb.id];
            break;
          }
        }
      }

      var firstX = forward[0].pt.x;
      var elbowX = supEnd.x + dir * ((firstX - supEnd.x) * dir < 0 ? 10 : 16);
      var takeoffs = [];
      var handled = {};

      forward.forEach(function (v) {
        if (handled[v.id]) return;
        if (clusterPair && (v.id === clusterPair[0] || v.id === clusterPair[1])) {
          var v1 = forward.find(function (x) { return x.id === clusterPair[0]; });
          var v2 = forward.find(function (x) { return x.id === clusterPair[1]; });
          handled[v1.id] = true;
          handled[v2.id] = true;
          var midX = (v1.pt.x + v2.pt.x) / 2;
          var midY = (v1.pt.y + v2.pt.y) / 2;
          var dy = midY - trunkY;
          var tkX = midX - dir * Math.min(26, Math.abs(dy) * 0.45 + 10);
          var wyeHub = { x: midX - dir * 10, y: trunkY + dy * 0.55 };
          takeoffs.push({ tkPt: { x: tkX, y: trunkY }, weight: 2, cluster: [v1, v2], wyeHub: wyeHub });
        } else {
          var dy1 = v.pt.y - trunkY;
          var lead = Math.min(28, Math.max(10, Math.abs(dy1) * 0.42));
          takeoffs.push({ tkPt: { x: v.pt.x - dir * lead, y: trunkY }, weight: 1, vent: v });
        }
      });

      takeoffs.sort(function (a, b) {
        return ((a.tkPt.x - elbowX) * dir) - ((b.tkPt.x - elbowX) * dir);
      });

      var curPt = supFlange;
      var remWeight = forward.length;
      var prePts = [supFlange, supEnd];
      if (Math.abs(trunkY - f1.y) > 4) {
        prePts.push({ x: elbowX, y: f1.y });
        prePts.push({ x: elbowX, y: trunkY });
      }
      var firstTk = takeoffs[0].tkPt;
      if (distIn(prePts[prePts.length - 1], firstTk) > 3) prePts.push(firstTk);
      trunkSegs.push({
        pts: prePts,
        d: smoothCornerPath(prePts, 14),
        strokeW: remWeight >= 3 ? 7.6 : (remWeight === 2 ? 5.8 : 4.2)
      });
      curPt = firstTk;

      for (var ti = 0; ti < takeoffs.length; ti++) {
        var tk = takeoffs[ti];
        if (ti > 0) {
          var segPts = [curPt, tk.tkPt];
          trunkSegs.push({ pts: segPts, d: smoothCornerPath(segPts, 10), strokeW: remWeight >= 2 ? 5.6 : 3.8 });
          curPt = tk.tkPt;
        }
        remWeight -= tk.weight;

        if (tk.cluster) {
          var subPts = [tk.tkPt, tk.wyeHub];
          trunkSegs.push({ pts: subPts, d: smoothCornerPath(subPts, 8), strokeW: 4.4 });
          tk.cluster.forEach(function (cv) {
            var ctrl = { x: (tk.wyeHub.x + cv.pt.x) / 2, y: tk.wyeHub.y };
            var bPts = [tk.tkPt, tk.wyeHub, cv.pt];
            var dStr = "M " + px(tk.wyeHub.x) + " " + py(tk.wyeHub.y) +
                       " Q " + px(ctrl.x) + " " + py(ctrl.y) + " " + px(cv.pt.x) + " " + py(cv.pt.y);
            var ang = Math.atan2(cv.pt.y - tk.wyeHub.y, cv.pt.x - tk.wyeHub.x) * 180 / Math.PI;
            var dmp = { x: tk.wyeHub.x + (cv.pt.x - tk.wyeHub.x) * 0.34, y: tk.wyeHub.y + (cv.pt.y - tk.wyeHub.y) * 0.34 };
            var runIn = pathLenIn(prePts) + distIn(firstTk, tk.tkPt) + distIn(tk.tkPt, tk.wyeHub) + distIn(tk.wyeHub, cv.pt);
            branches.push({
              id: cv.id, name: cv.name, d: dStr, pts: bPts, ft: +(runIn / 12).toFixed(1),
              takeoff: tk.wyeHub, damperPt: dmp, damperAngle: ang
            });
          });
        } else {
          var sv = tk.vent;
          var dySign2 = sv.pt.y >= tk.tkPt.y ? 1 : -1;
          var wyeStub = {
            x: tk.tkPt.x + dir * Math.min(16, Math.abs(sv.pt.x - tk.tkPt.x) * 0.45 + 6),
            y: tk.tkPt.y + dySign2 * Math.min(16, Math.abs(sv.pt.y - tk.tkPt.y) * 0.45 + 4)
          };
          var dStr2 = "M " + px(tk.tkPt.x) + " " + py(tk.tkPt.y) +
                      " Q " + px(wyeStub.x) + " " + py(wyeStub.y) + " " + px(sv.pt.x) + " " + py(sv.pt.y);
          var ang2 = Math.atan2(wyeStub.y - tk.tkPt.y, wyeStub.x - tk.tkPt.x) * 180 / Math.PI;
          var dmp2 = { x: tk.tkPt.x + (wyeStub.x - tk.tkPt.x) * 0.7, y: tk.tkPt.y + (wyeStub.y - tk.tkPt.y) * 0.7 };
          var runIn2 = pathLenIn(prePts) + distIn(firstTk, tk.tkPt) + distIn(tk.tkPt, wyeStub) + distIn(wyeStub, sv.pt);
          branches.push({
            id: sv.id, name: sv.name, d: dStr2, pts: [tk.tkPt, wyeStub, sv.pt], ft: +(runIn2 / 12).toFixed(1),
            takeoff: tk.tkPt, damperPt: dmp2, damperAngle: ang2
          });
        }
      }

      behind.forEach(function (bv) {
        var sideSign = bv.pt.y <= f1.y ? -1 : 1;
        var sideTk = { x: f1.x + dir * (cabHalfW + 14), y: f1.y + sideSign * 7 };
        var sweepY = sideSign < 0 ? Math.min(f1.y - 42, (f1.y + bv.pt.y) / 2) : Math.max(f1.y + 24, (f1.y + bv.pt.y) / 2);
        var bend1 = { x: sideTk.x + dir * 10, y: sideTk.y + sideSign * 14 };
        var bend2 = { x: bv.pt.x, y: sweepY };
        var bPts = [sideTk, bend1, bend2, bv.pt];
        var angB = Math.atan2(bend1.y - sideTk.y, bend1.x - sideTk.x) * 180 / Math.PI;
        branches.push({
          id: bv.id, name: bv.name, d: smoothCornerPath(bPts, 16), pts: bPts, ft: +((14 + pathLenIn(bPts)) / 12).toFixed(1),
          takeoff: sideTk,
          damperPt: { x: sideTk.x + (bend1.x - sideTk.x) * 0.75, y: sideTk.y + (bend1.y - sideTk.y) * 0.75 },
          damperAngle: angB
        });
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
    var shortCircuitPairs = [];
    var jdB = { x: n.jd1.x + 12, y: n.jd1.y - 4 };
    var jdH = { x: n.jd1.x - 12, y: n.jd1.y + 6 };

    vents.forEach(function (v) {
      var dRet = distIn(v.pt, n.r1);
      if (dRet < 48) shortCircuitPairs.push({ a: v.pt, b: n.r1, ft: +(dRet / 12).toFixed(1), label: v.name + "-R1" });
      var dJd = Math.min(distIn(v.pt, jdB), distIn(v.pt, jdH));
      if (dJd < 42) shortCircuitPairs.push({ a: v.pt, b: n.jd1, ft: +(dJd / 12).toFixed(1), label: v.name + "-JD1" });
    });

    var byId = {};
    branches.forEach(function (b) { byId[b.id] = b; });

    var hBox = activeHatchBox();
    var hatchRect = { x: hBox.x - hBox.w / 2, y: hBox.y - hBox.h / 2, w: hBox.w, h: hBox.h };
    var hatchBlocked = (Math.abs(f1.x - hBox.x) < 34 && Math.abs(f1.y - hBox.y) < 34) ||
      trunkSegs.some(function (ts) { return polyHitsRect(ts.pts, hatchRect); }) ||
      branches.some(function (b) { return polyHitsRect(b.pts, hatchRect); }) ||
      polyHitsRect(retPts, hatchRect);

    return {
      dir: dir, trunkSegs: trunkSegs, branches: branches, byId: byId, ra1D: ra1D, ra1Ft: ra1Ft,
      flue: flue, shortCircuitPairs: shortCircuitPairs, hatchBlocked: hatchBlocked
    };
  }

  function computeMetrics() {
    var f1 = state.nodes.f1;
    var pts = computeWalkwayPoints(f1);
    var walkIn = 0;
    for (var i = 1; i < pts.length; i++) {
      walkIn += Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
    }
    var walkFt = +(walkIn / 12).toFixed(1);
    var walkPass = walkFt <= 20.0;
    var sheets = walkFt <= 7 ? 1 : (walkFt <= 14 ? 2 : (walkFt <= 20 ? 3 : Math.ceil(walkFt / 7)));
    var ducts = computeReactiveDucts();
    return {
      walkPts: pts, walkD: pathDFromPoints(pts), walkFt: walkFt, walkPass: walkPass, sheets: sheets,
      ducts: ducts, flue: ducts.flue,
      sa1Ft: ducts.byId.s1 ? ducts.byId.s1.ft : 0,
      sa2Ft: ducts.byId.s2 ? ducts.byId.s2.ft : 0,
      sa3Ft: ducts.byId.s3 ? ducts.byId.s3.ft : 0,
      ra1Ft: ducts.ra1Ft
    };
  }

  function computeSingleStatus(m, es) {
    if (!m.walkPass) {
      return {
        cls: "is-fail",
        txt: es
          ? "✗ Pasillo demasiado largo (" + m.walkFt + " pies > 20 pies máx. con 66\" de altura) — acerca F1 hacia Comedor SO."
          : "✗ Walkway over 20 ft limit (" + m.walkFt + " ft at 66\" attic height) — move F1 closer toward SW Dining."
      };
    }
    if (m.ducts.hatchBlocked) {
      return {
        cls: "is-fail",
        txt: es
          ? "✗ Conflicto con la escotilla de 24\"×36\" — mueve el equipo o ducto fuera del acceso."
          : "✗ Blocks the 24\"×36\" attic hatch — move furnace or duct clear of the opening."
      };
    }
    if (m.flue.gravityIllegal) {
      return {
        cls: "is-fail",
        txt: es
          ? "✗ Salida horizontal sin extractor no permitida — elige Extractor Lateral (Opción A) o PVC 95%+ (Opción B)."
          : "✗ Unassisted horizontal gravity vent not allowed — pick Listed Power Venter (Option A) or 95%+ PVC (Option B)."
      };
    }
    if (m.ducts.shortCircuitPairs.length > 0) {
      return {
        cls: "is-warn",
        txt: es
          ? "⚠ Rejilla de inyección muy cerca del retorno (< 4 pies) — sepáralas en el plano."
          : "⚠ Supply boot is within 4 ft of return/jump duct — drag vents slightly farther apart."
      };
    }
    var wallTxt = m.flue.effectiveWall === "west"
      ? (es ? "Muro Oeste patio (≥4 pies libres)" : "West rear-yard wall (≥4 ft clear)")
      : (es ? "Muro Sur (confirmar ≥4 pies a colindancia el lunes)" : "South wall (confirm ≥4 ft to lot line Monday)");
    return {
      cls: "is-pass",
      txt: es
        ? "✓ Cumple: Escotilla 24\"×36\" en Puerta 4 · Pasillo 24\" de " + m.walkFt + " pies (" + m.sheets + " hojas) · Salida lateral por " + wallTxt + "."
        : "✓ Clear: 24\"×36\" Door 4 hatch · " + m.walkFt + " ft walkway (" + m.sheets + " sheets) · Sidewall vent out " + wallTxt + "."
    };
  }

  function syncBlueprintHiddenState() {
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
      next.set("loc", state.hatchLocation);
      next.set("vent", state.ventMode);
      next.set("ewall", state.exitWall);
      window.history.replaceState(null, "", "?" + next.toString() + (window.location.hash || ""));
    } catch (_) {}
  }

  function buildDynamicDuctsLayerHtml(m) {
    var d = m.ducts;
    var fl = d.flue;
    var parts = [];

    d.trunkSegs.forEach(function (ts) {
      parts.push('<path d="' + ts.d + '" fill="none" stroke="#1f5f7a" stroke-width="' + ts.strokeW + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.26"/>');
      parts.push('<path d="' + ts.d + '" fill="none" stroke="#1f5f7a" stroke-width="' + Math.max(2.2, +(ts.strokeW * 0.42).toFixed(1)) + '" stroke-linecap="round" stroke-linejoin="round"/>');
    });

    d.branches.forEach(function (b) {
      var bCol = b.ft > 25 ? "#9a5b06" : "#1f5f7a";
      parts.push('<path d="' + b.d + '" fill="none" stroke="' + bCol + '" stroke-width="2.2" stroke-linecap="round"/>');
      parts.push('<circle cx="' + px(b.takeoff.x) + '" cy="' + py(b.takeoff.y) + '" r="2.6" fill="#ffffff" stroke="' + bCol + '" stroke-width="1.3"/>');
    });

    parts.push('<path d="' + d.ra1D + '" fill="none" stroke="#0f766e" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"/>');
    parts.push('<path d="' + d.ra1D + '" fill="none" stroke="#0f766e" stroke-width="2.0" stroke-dasharray="5 3" stroke-linecap="round" stroke-linejoin="round"/>');

    var flCol = fl.gravityIllegal ? "#a8281c" : (state.ventMode === "cat4_pvc" ? "#1f5f7a" : "#9a5b06");
    parts.push('<path d="' + fl.dStr + '" fill="none" stroke="' + flCol + '" stroke-width="3.0" stroke-dasharray="4 2"/>');
    var tx = px(fl.termPt.x), ty = py(fl.termPt.y);
    parts.push('<rect x="' + (tx - 16).toFixed(1) + '" y="' + (ty - 6.5).toFixed(1) + '" width="32" height="13" rx="3" fill="' + (fl.gravityIllegal ? "#f9e6e4" : "#f7ecd9") + '" stroke="' + flCol + '" stroke-width="1.4"/>');
    parts.push('<text x="' + tx + '" y="' + (ty + 2.3).toFixed(1) + '" text-anchor="middle" font-size="5.5" font-weight="800" fill="' + flCol + '">' +
      (fl.gravityIllegal ? "VENT X" : (state.ventMode === "cat4_pvc" ? "PVC OUT" : "VENT OUT")) + "</text>");

    d.shortCircuitPairs.forEach(function (sc) {
      parts.push('<line x1="' + px(sc.a.x) + '" y1="' + py(sc.a.y) + '" x2="' + px(sc.b.x) + '" y2="' + py(sc.b.y) + '" stroke="#a8281c" stroke-width="1.8" stroke-dasharray="2 2"/>');
    });

    return parts.join("");
  }

  function renderAtticPlanSvg(m, es) {
    var n = state.nodes;
    var f1x = px(n.f1.x), f1y = py(n.f1.y);
    var r1x = px(n.r1.x), r1y = py(n.r1.y);
    var s1x = px(n.s1.x), s1y = py(n.s1.y);
    var s2x = px(n.s2.x), s2y = py(n.s2.y);
    var s3x = px(n.s3.x), s3y = py(n.s3.y);
    var jdx = px(n.jd1.x), jdy = py(n.jd1.y);
    var dir = m.ducts.dir;
    var walkCol = m.walkPass ? "#2f6b3f" : "#a8281c";
    var walkFill = m.walkPass ? "#e4f0e6" : "#f9e6e4";
    var hBox = activeHatchBox();

    var fW = +(33.25 * SC).toFixed(1);
    var fH = +(29 * SC).toFixed(1);
    var pS = +(30 * SC).toFixed(1);
    var supPlenW = +(24 * SC).toFixed(1);
    var retPlenW = +(12 * SC).toFixed(1);
    var supBoxX = dir > 0 ? (f1x + fW / 2) : (f1x - fW / 2 - supPlenW);
    var retBoxX = dir > 0 ? (f1x - fW / 2 - retPlenW) : (f1x + fW / 2);

    return '<svg id="hvacHumanSvg" viewBox="0 0 500 332" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Plano interactivo unificado de escotilla, pasillo, calefactor y ductos" : "Unified interactive floor plan of hatch, walkway, furnace and ducts") + '" style="touch-action:none">' +
      '<text x="14" y="17" font-size="8.0" font-weight="800" fill="#1f5f7a">' +
        (es ? "PLANTA DEL ÁTICO · ESCOTILLA + PASILLO 24\" + EQUIPO Y DUCTOS · ← OESTE | NORTE ↑ | ESTE →"
            : "ATTIC FLOOR PLAN · HATCH + 24\" WALKWAY + FURNACE & DUCTS · ← WEST | NORTH ↑ | EAST →") + "</text>" +
      '<g transform="translate(476,21)">' +
        '<circle r="14" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-10 -3,-3.5 3,-3.5" fill="#a8281c"/>' +
        '<text x="0" y="-11" text-anchor="middle" font-size="6.2" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="11.8" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">S</text>' +
        '<text x="9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">E</text>' +
        '<text x="-9.8" y="2" text-anchor="middle" font-size="5.4" font-weight="700" fill="#5d686d">' + (es ? "O" : "W") + "</text>" +
      "</g>" +

      '<rect x="' + px(72) + '" y="' + py(38) + '" width="' + +(75 * SC).toFixed(1) + '" height="' + +(70 * SC).toFixed(1) + '" fill="#f7ecd9" fill-opacity="0.45" stroke="#9a5b06" stroke-width="1.2" stroke-dasharray="4 3"/>' +
      '<text x="' + px(110) + '" y="' + py(48) + '" text-anchor="middle" font-size="5.3" font-weight="800" fill="#9a5b06">' + (es ? "DESCANSO PTA 4" : "DOOR 4 LANDING") + "</text>" +

      '<path d="M ' + px(31.5) + " " + py(108) + " L " + px(147) + " " + py(108) + " L " + px(147) + " " + py(234) + " L " + px(0) + " " + py(234) + " L " + px(0) + " " + py(174) + " L " + px(31.5) + " " + py(174) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.4"/>' +
      '<text x="' + px(88) + '" y="' + py(166) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Cocina" : "Kitchen") + "</text>" +
      '<text x="' + px(88) + '" y="' + py(178) + '" text-anchor="middle" font-size="6.0" fill="#9a5b06">' + (es ? "(Campana 6\" aparte)" : "(6\" hood separate)") + "</text>" +
      '<text x="' + px(70) + '" y="' + py(254) + '" text-anchor="middle" font-size="5.8" font-weight="700" fill="#2f6b3f">' + (es ? "← Patio Oeste" : "← West Rear Yard") + "</text>" +

      '<path d="M ' + px(147) + " " + py(58) + " L " + px(207) + " " + py(58) + " L " + px(207) + " " + py(88) + " L " + px(352) + " " + py(88) + " L " + px(352) + " " + py(142) + " L " + px(147) + " " + py(142) + ' Z" fill="#f4f5f3" stroke="#5d686d" stroke-width="1.3"/>' +
      '<text x="' + px(216) + '" y="' + py(137) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#5d686d">' + (es ? "Pasillo" : "Hall") + "</text>" +

      '<rect x="' + px(207) + '" y="' + py(0) + '" width="' + +(72.1 * SC).toFixed(1) + '" height="' + +(88 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.4"/>' +
      '<text x="' + px(243) + '" y="' + py(44) + '" text-anchor="middle" font-size="7.2" font-weight="700" fill="#5d686d">' + (es ? "Baño" : "Bath") + "</text>" +
      '<rect x="' + px(279.1) + '" y="' + py(5.4) + '" width="' + +(36.3 * SC).toFixed(1) + '" height="' + +(82.6 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.4"/>' +
      '<text x="' + px(297.2) + '" y="' + py(46) + '" text-anchor="middle" font-size="6.0" font-weight="700" fill="#5d686d">' + (es ? "Lav." : "Ldry") + "</text>" +
      '<path d="M ' + px(315.4) + " " + py(0) + " L " + px(437.5) + " " + py(0) + " L " + px(474) + " " + py(34) + " L " + px(474) + " " + py(96) + " L " + px(437.5) + " " + py(136) + " L " + px(352) + " " + py(136) + " L " + px(352) + " " + py(88) + " L " + px(315.4) + " " + py(88) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.4"/>' +
      '<text x="' + px(396) + '" y="' + py(52) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Recámara" : "Bedroom") + "</text>" +

      '<rect x="' + px(147) + '" y="' + py(142) + '" width="' + +(146.7 * SC).toFixed(1) + '" height="' + +(155.75 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.4"/>' +
      '<text x="' + px(236) + '" y="' + py(166) + '" text-anchor="middle" font-size="7.8" font-weight="700" fill="#5d686d">' + (es ? "Comedor" : "Dining") + "</text>" +
      '<path d="M ' + px(293.7) + " " + py(142) + " L " + px(473.5) + " " + py(142) + " L " + px(508) + " " + py(178) + " L " + px(508) + " " + py(258) + " L " + px(473.5) + " " + py(297.75) + " L " + px(293.7) + " " + py(297.75) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.4"/>' +
      '<text x="' + px(400) + '" y="' + py(222) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Sala" : "Living Room") + "</text>" +

      '<rect x="' + (px(147) + 2) + '" y="' + (py(206) - 6) + '" width="24" height="12" rx="2" fill="#ecedea" stroke="#5d686d" stroke-width="0.9"/>' +
      '<text x="' + (px(147) + 14) + '" y="' + (py(206) + 2.5) + '" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">D04</text>' +

      // Clickable 24"x36" Attic Hatch (jumps directly to Step 2 Hatch & Seals!)
      '<g id="hvacHatchJump" style="cursor:pointer" role="button" tabindex="0" aria-label="' + esc(es ? "Abrir detalles de escotilla 24x36" : "Inspect 24x36 attic hatch details") + '">' +
        '<rect id="hvacHatchRect" x="' + px(hBox.x - hBox.w / 2) + '" y="' + py(hBox.y - hBox.h / 2) + '" width="' + +(hBox.w * SC).toFixed(1) + '" height="' + +(hBox.h * SC).toFixed(1) + '" rx="2.5" fill="' + (m.ducts.hatchBlocked ? "#f9e6e4" : "#f7ecd9") + '" stroke="' + (m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06") + '" stroke-width="2.0" stroke-dasharray="4 2"/>' +
        '<text x="' + px(hBox.x) + '" y="' + (py(hBox.y) - 2) + '" text-anchor="middle" font-size="6.1" font-weight="800" fill="' + (m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06") + '">24"×36"</text>' +
        '<text x="' + px(hBox.x) + '" y="' + (py(hBox.y) + 6) + '" text-anchor="middle" font-size="5.2" font-weight="700" fill="' + (m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06") + '">' + (es ? "Escotilla ↗" : "Hatch ↗") + "</text>" +
      "</g>" +

      '<path id="hvacWalkHalo" d="' + m.walkD + '" fill="none" stroke="' + walkCol + '" stroke-width="' + +(30 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.11"/>' +
      '<path id="hvacWalkBg" d="' + m.walkD + '" fill="none" stroke="' + walkCol + '" stroke-width="' + +(24 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.25"/>' +
      '<path id="hvacWalkLn" d="' + m.walkD + '" fill="none" stroke="' + walkCol + '" stroke-width="1.9" stroke-dasharray="4 3"/>' +

      '<g id="hvacDynamicDuctsLayer">' + buildDynamicDuctsLayerHtml(m) + "</g>" +

      '<g id="hvacDragS1" class="u4-drag-move" data-node="s1" tabindex="0" role="application" aria-label="Drag S1 supply" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (s1x - 23) + '" y="' + (s1y - 8) + '" width="46" height="16" rx="4" fill="#1f5f7a" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + s1x + '" y="' + (s1y + 2.5) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "S1 Coc." : "S1 Kit") + "</text>" +
      "</g>" +
      '<g id="hvacDragS2" class="u4-drag-move" data-node="s2" tabindex="0" role="application" aria-label="Drag S2 supply" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (s2x - 23) + '" y="' + (s2y - 8) + '" width="46" height="16" rx="4" fill="#1f5f7a" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + s2x + '" y="' + (s2y + 2.5) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "S2 Sala" : "S2 Liv") + "</text>" +
      "</g>" +
      '<g id="hvacDragS3" class="u4-drag-move" data-node="s3" tabindex="0" role="application" aria-label="Drag S3 supply" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (s3x - 24) + '" y="' + (s3y - 8) + '" width="48" height="16" rx="4" fill="#1f5f7a" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + s3x + '" y="' + (s3y + 2.5) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "S3 Rec." : "S3 Bed") + "</text>" +
      "</g>" +

      '<g id="hvacDragR1" class="u4-drag-move" data-node="r1" tabindex="0" role="application" aria-label="Drag R1 return" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (r1x - 25) + '" y="' + (r1y - 8) + '" width="50" height="16" rx="4" fill="#0f766e" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + r1x + '" y="' + (r1y + 2.5) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "R1 Ret." : "R1 Ret") + "</text>" +
      "</g>" +

      '<g id="hvacDragJD1" class="u4-drag-move" data-node="jd1" tabindex="0" role="application" aria-label="Drag JD-1 jump duct" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (jdx - 19) + '" y="' + (jdy - 8) + '" width="38" height="14" rx="3.5" fill="#6d28d9" stroke="#ffffff" stroke-width="1.1"/>' +
        '<text x="' + jdx + '" y="' + (jdy + 1.5) + '" text-anchor="middle" font-size="5.9" font-weight="800" fill="#ffffff" pointer-events="none">JD-1</text>' +
      "</g>" +

      '<g id="hvacDragFurnace" class="u4-drag-move" data-node="f1" tabindex="0" role="application" aria-label="Drag F1 furnace and 30x30 platform" transform="translate(0, 0)">' +
        '<rect x="' + (f1x - pS / 2).toFixed(1) + '" y="' + (f1y - fH / 2 - pS).toFixed(1) + '" width="' + pS + '" height="' + pS + '" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.5" stroke-dasharray="3 2"/>' +
        '<text x="' + f1x + '" y="' + (f1y - fH / 2 - pS / 2 + 2.5).toFixed(1) + '" text-anchor="middle" font-size="5.8" font-weight="800" fill="#2f6b3f" pointer-events="none">30"×30"</text>' +
        '<rect x="' + retBoxX.toFixed(1) + '" y="' + (f1y - 8).toFixed(1) + '" width="' + retPlenW + '" height="16" rx="2" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.3"/>' +
        '<rect x="' + supBoxX.toFixed(1) + '" y="' + (f1y - 8.5).toFixed(1) + '" width="' + supPlenW + '" height="17" rx="2" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.4"/>' +
        '<rect class="u4-drag-grip" x="' + (f1x - fW / 2).toFixed(1) + '" y="' + (f1y - fH / 2).toFixed(1) + '" width="' + fW + '" height="' + fH + '" rx="3.5" fill="#1d2326" stroke="#7cc0dc" stroke-width="1.8"/>' +
        '<text x="' + f1x + '" y="' + (f1y - 1.5) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff" pointer-events="none">F1 ' + (dir > 0 ? "→" : "←") + "</text>" +
        '<text x="' + f1x + '" y="' + (f1y + 7.2) + '" text-anchor="middle" font-size="5.4" font-weight="700" fill="#7cc0dc" pointer-events="none">45k BTU</text>' +
      "</g>" +

      '<rect id="hvacSvgPill" x="14" y="303" width="472" height="20" rx="5" fill="' + walkFill + '" stroke="' + walkCol + '" stroke-width="1"/>' +
      '<text id="hvacSvgPillTxt" x="250" y="316" text-anchor="middle" font-size="7.0" font-weight="700" fill="' + walkCol + '">' +
        (es ? "Pasillo 24\": " + m.walkFt + "' / 20' máx. (" + m.sheets + " hojas) · Salida lateral: " + m.flue.runFt + "' · Ductos " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "'"
            : "24\" Walkway: " + m.walkFt + "' / 20' max (" + m.sheets + " sheets) · Sidewall vent: " + m.flue.runFt + "' · Ducts " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "'") +
      "</text>" +
    "</svg>";
  }

  function renderHatchFramingSvg(es) {
    var bayVal = state.joistBay === "unknown" ? null : parseFloat(state.joistBay);
    var bayOk = bayVal === 27.5;
    var bayNarrow = bayVal != null && bayVal < 27.5;
    var bayWide = bayVal != null && bayVal > 27.5;
    var frameStroke = state.fireRating === "yes" ? "#a8281c" : (bayOk ? "#2f6b3f" : "#9a5b06");
    var frameLabel = state.fireRating === "yes"
      ? (es ? "PUERTA CORTAFUEGO LISTADA (24\"×36\" LIBRES)" : "LISTED FIRE-RATED DOOR (24\"×36\" CLEAR)")
      : (es ? 'Corte madera: 27-1/2" × 39-1/2" (en espera)' : 'Wood-kit rough cut: 27-1/2" × 39-1/2" (on hold)');
    var bayLabel = bayVal == null
      ? (es ? "Separación de vigas B: medir el lunes 23" : "Joist spacing B: measure Monday Nov 23")
      : (es ? 'Vigas B = ' + bayVal + '"' : 'Joist spacing B = ' + bayVal + '"');

    return '<svg viewBox="0 0 480 268" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Diagrama de escotilla 24x36 afuera de Puerta 4" : "24x36 Door 4 hatch framing and furnace fit diagram") + '">' +
      '<text x="14" y="18" font-size="8.8" font-weight="800" fill="#1f5f7a">' +
        (es ? 'ESCOTILLA 24" × 36" LIBRES · AFUERA DE PUERTA 4' : '24" × 36" CLEAR HATCH · OUTSIDE FRONT DOOR 4') + "</text>" +
      '<rect x="34" y="34" width="412" height="186" rx="6" fill="#fbfcfb" stroke="#c5ccc9" stroke-width="1.3"/>' +
      '<line x1="34" y1="62" x2="446" y2="62" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<line x1="34" y1="190" x2="446" y2="190" stroke="#d9a86c" stroke-width="6" stroke-dasharray="10 4" opacity="0.55"/>' +
      '<text x="42" y="49" font-size="7" font-weight="700" fill="#5d686d">' + (es ? "← Escaleras (Oeste)" : "← Stairs (West)") + "</text>" +
      '<text x="438" y="49" text-anchor="end" font-size="7" font-weight="800" fill="#1f5f7a">' + (es ? "Puerta 4 → (abre al Este)" : "Front Door 4 → (swings East)") + "</text>" +
      '<rect x="114" y="56" width="252" height="140" fill="#f7ecd9" fill-opacity="0.45" stroke="' + frameStroke + '" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="240" y="68" text-anchor="middle" font-size="7.3" font-weight="800" fill="' + frameStroke + '">' + esc(frameLabel) + "</text>" +
      '<rect x="130" y="76" width="220" height="106" fill="#e3eef2" stroke="#1f5f7a" stroke-width="2.3"/>' +
      '<rect x="152" y="95" width="176" height="68" rx="4" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2"/>' +
      '<text x="240" y="118" text-anchor="middle" font-size="8.8" font-weight="800" fill="#2f6b3f">' + (es ? "CALEFACTOR SUBE DE PUNTA ✓" : "FURNACE END-FIRST FIT ✓") + "</text>" +
      '<text x="240" y="132" text-anchor="middle" font-size="7.8" font-weight="700" fill="#1d2326">14-3/16" × 29" (45k BTU)</text>' +
      '<text x="240" y="146" text-anchor="middle" font-size="7.2" font-weight="700" fill="#2f6b3f">' + (es ? '+9-3/4" y +7" libres de margen' : '+9-3/4" & +7" clearance to spare') + "</text>" +
      '<text x="240" y="210" text-anchor="middle" font-size="8.2" font-weight="800" fill="#1f5f7a">' + (es ? '24" × 36" LIBRES REALES · NO REDUCIR' : '24" × 36" FINISHED CLEAR · DO NOT SHRINK') + "</text>" +
      '<text x="240" y="246" text-anchor="middle" font-size="8.0" font-weight="800" fill="' + (bayNarrow ? "#a8281c" : (bayOk ? "#2f6b3f" : "#9a5b06")) + '">' +
        esc(bayLabel + (bayOk ? (es ? " — Calza exacto" : " — Exact fit") : bayWide ? (es ? " — Agregar respaldo lateral" : " — Add solid side backing") : bayNarrow ? (es ? " — Requiere cabezal" : " — Needs header framing") : "")) +
      "</text>" +
    "</svg>";
  }

  function renderAirSealSvg(es) {
    return '<svg viewBox="0 0 460 206" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Corte de tapa sellada, colchonetas y dique" : "Cross-section of insulated lid, weatherstrip and dam") + '">' +
      '<text x="230" y="16" text-anchor="middle" font-size="8.6" font-weight="800" fill="#1f5f7a">' +
        (es ? "CORTE DE ESCOTILLA: TAPA AISLADA, EMPAQUE Y DIQUE DE 4 LADOS" : "HATCH SECTION: INSULATED LID, WEATHERSTRIP & 4-SIDED DAM") + "</text>" +
      '<rect x="24" y="84" width="90" height="54" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<rect x="346" y="84" width="90" height="54" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="69" y="115" text-anchor="middle" font-size="7.3" font-weight="700" fill="#9a5b06">' + (es ? "Aislante suelto" : "Loose insulation") + "</text>" +
      '<rect x="114" y="54" width="10" height="98" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<rect x="336" y="54" width="10" height="98" fill="#d9a86c" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<text x="352" y="68" font-size="7.4" font-weight="800" fill="#7c4d12">' + (es ? 'Dique +2" (4 lados)' : '4-sided dam (+2")') + "</text>" +
      '<rect x="134" y="72" width="192" height="44" rx="4" fill="#fce7f3" stroke="#be185d" stroke-width="1.4"/>' +
      '<text x="230" y="98" text-anchor="middle" font-size="7.9" font-weight="800" fill="#9d174d">' + (es ? "2 colchonetas sin papel + 3 lazos cal. 16" : "2 unfaced batts + 3 loose wire loops") + "</text>" +
      '<rect x="130" y="120" width="200" height="16" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.8"/>' +
      '<text x="230" y="131" text-anchor="middle" font-size="7.6" font-weight="800" fill="#1f5f7a">' + (es ? 'Tapa triplay 3/4" (junta SIN sellador)' : '3/4" plywood lid (keep seam UNCAULKED)') + "</text>" +
      '<rect x="124" y="136" width="22" height="10" fill="#2f6b3f"/>' +
      '<rect x="314" y="136" width="22" height="10" fill="#2f6b3f"/>' +
      '<line x1="24" y1="152" x2="124" y2="152" stroke="#1d2326" stroke-width="2.3"/>' +
      '<line x1="336" y1="152" x2="436" y2="152" stroke="#1d2326" stroke-width="2.3"/>' +
      '<text x="230" y="172" text-anchor="middle" font-size="7.8" font-weight="800" fill="#2f6b3f">' + (es ? 'Empaque 1/2"×1/8" en tiras 1×2 · Broches FUERA de 24"×36"' : '1/2"×1/8" foam strip on 1×2 ledges · Latches OUTSIDE 24"×36"') + "</text>" +
      '<text x="230" y="192" text-anchor="middle" font-size="7.4" font-weight="600" fill="#5d686d">' + (es ? "Verificar seca la gotera del techo plano antes de aislar" : "Confirm flat-roof leak repair is dry before placing insulation") + "</text>" +
    "</svg>";
  }

  function renderSectionSvg(m, es) {
    var fl = m.flue;
    var isFail = fl.gravityIllegal;
    var isPvc = state.ventMode === "cat4_pvc";
    var ventStroke = isFail ? "#a8281c" : (isPvc ? "#1f5f7a" : "#9a5b06");
    var ventFill = isFail ? "#f9e6e4" : (isPvc ? "#e3eef2" : "#f7ecd9");
    var wallLbl = fl.effectiveWall === "west"
      ? (es ? "SALIDA MURO OESTE (PATIO TRASERO ≥4' LIBRE)" : "WEST REAR-YARD WALL EXIT (≥4' CLEAR)")
      : (es ? "SALIDA MURO SUR (MEDIR ≥4' A COLINDANCIA)" : "SOUTH EXTERIOR WALL EXIT (CHECK ≥4' LOT LINE)");

    return '<svg viewBox="0 0 470 226" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Corte vertical del ático de techo plano de 66 pulgadas con salida lateral" : "66-inch flat-roof attic cross-section with sidewall exhaust") + '">' +
      '<text x="235" y="16" text-anchor="middle" font-size="8.8" font-weight="800" fill="#1f5f7a">' +
        (es ? 'TECHO PLANO (66" LIBRES) · CERO CORTES EN TECHO · SALIDA LATERAL'
            : 'FLAT ROOF (66" CLEAR) · ZERO ROOF CUTS · SIDEWALL VENT EXIT') + "</text>" +
      '<rect x="28" y="26" width="380" height="10" fill="#475569" stroke="#1d2326" stroke-width="1.3"/>' +
      '<rect x="28" y="36" width="380" height="11" fill="#e2e8f0" stroke="#475569" stroke-width="1.0"/>' +
      '<text x="218" y="33.5" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff">' +
        (es ? "TECHO PLANO EXISTENTE · NO CORTAR EL TECHO" : "EXISTING FLAT ROOF · DO NOT CUT ROOF") + "</text>" +
      '<rect x="28" y="47" width="12" height="125" fill="#cbd5e1" stroke="#1d2326" stroke-width="1.4"/>' +
      '<rect x="40" y="47" width="368" height="125" fill="#fbfcfb" stroke="#98a4a8" stroke-width="1"/>' +
      '<rect x="28" y="172" width="380" height="12" fill="#fde68a" stroke="#7c4d12" stroke-width="1.3"/>' +
      '<text x="286" y="180.5" text-anchor="middle" font-size="6.6" font-weight="700" fill="#7c4d12">' +
        (es ? 'Pasillo continuo 24" (' + m.walkFt + " pies ≤ 20 pies)" : 'Continuous 24" wood walkway (' + m.walkFt + " ft ≤ 20 ft max)") + "</text>" +
      '<line x1="378" y1="47" x2="378" y2="172" stroke="#1f5f7a" stroke-width="1.4" stroke-dasharray="3 2"/>' +
      '<rect x="322" y="98" width="112" height="20" rx="4" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1"/>' +
      '<text x="378" y="111" text-anchor="middle" font-size="7.5" font-weight="800" fill="#1f5f7a">' + (es ? '66" (5\'-6") alto' : '66" (5\'-6") height') + "</text>" +
      '<rect x="320" y="170" width="46" height="15" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.4" stroke-dasharray="3 2"/>' +
      '<text x="343" y="196" text-anchor="middle" font-size="6.8" font-weight="800" fill="#1f5f7a">' + (es ? 'Escotilla 24"×36"' : '24"×36" Hatch') + "</text>" +
      '<rect x="176" y="165" width="112" height="7" fill="#2f6b3f"/>' +
      '<rect x="192" y="131" width="84" height="34" rx="3" fill="#1d2326" stroke="#7cc0dc" stroke-width="1.6"/>' +
      '<text x="234" y="147" text-anchor="middle" font-size="7.6" font-weight="800" fill="#ffffff">F1 · 45k BTU</text>' +
      '<text x="234" y="158" text-anchor="middle" font-size="6.4" font-weight="700" fill="#7cc0dc">' + (es ? 'Horizontal 14-3/16"' : 'Horizontal 14-3/16"') + "</text>" +
      '<path d="M 192 142 L 166 120 L 22 104" fill="none" stroke="' + ventStroke + '" stroke-width="6.5" stroke-linecap="round" opacity="0.26"/>' +
      '<path d="M 192 142 L 166 120 L 22 104" fill="none" stroke="' + ventStroke + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<rect x="8" y="92" width="22" height="24" rx="3" fill="' + ventFill + '" stroke="' + ventStroke + '" stroke-width="1.7"/>' +
      '<text x="19" y="107" text-anchor="middle" font-size="6.6" font-weight="800" fill="' + ventStroke + '">' + (isFail ? "X" : (isPvc ? "PVC" : "FAN")) + "</text>" +
      '<rect x="50" y="55" width="248" height="42" rx="4" fill="' + ventFill + '" stroke="' + ventStroke + '" stroke-width="1.2"/>' +
      '<text x="58" y="68" font-size="7.1" font-weight="800" fill="' + ventStroke + '">' + esc(wallLbl) + "</text>" +
      '<text x="58" y="80" font-size="6.6" font-weight="700" fill="#1d2326">' +
        esc(isFail
          ? (es ? "No permitido: 80% no sale horizontal sin extractor" : "Not allowed: 80% unit cannot gravity-vent sideways")
          : isPvc
            ? (es ? "Opción B: PVC sellado 95%+ o bomba de calor" : "Option B: 95%+ sealed PVC direct-vent or heat pump")
            : (es ? 'Opción A: Extractor lateral + pendiente ≥1/4"/pie (' + fl.runFt + "')" : 'Option A: Listed power venter + ≥1/4"/ft slope (' + fl.runFt + "')")) +
      "</text>" +
      '<text x="58" y="91" font-size="6.3" font-weight="600" fill="#5d686d">' +
        (es ? "Mínimo 4 pies a colindancia y ventanas · soportes cada ≤5 pies" : "Keep ≥4 ft from property line & windows · strap every ≤5 ft") +
      "</text>" +
      '<text x="235" y="214" text-anchor="middle" font-size="7.3" font-weight="700" fill="#2f6b3f">' +
        (es ? 'Plataforma Norte 30"×30" + GFCI 120V (≤25\') + Luz con apagador · NEXT incluye gomas'
            : '30"×30" North platform + 120V GFCI (≤25\') + switched light · NEXT supplies pads') +
      "</text>" +
    "</svg>";
  }

  function renderEquip(m, es) {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="hvacEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "\uD83D\uDD27 Equipo y suministros " : "\uD83D\uDD27 Equipment & Supplies ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="hvacEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Alcance de Nuestra Cuadrilla" : "Our Crew Materials") + "</h4>" +
            "<ul>" +
              "<li>" + m.sheets + (es ? ' hojas 4×8 de OSB 23/32" o triplay 3/4" para pasillo 24" (' + m.walkFt + ' pies; nunca 3/8")' : ' sheets 4×8 of 23/32" OSB or 3/4" ply for 24" walkway (' + m.walkFt + ' ft; never 3/8")') + "</li>" +
              "<li>" + (es ? '1 hoja 4×8 para plataforma 30"×30" + dique de 4 lados (no comprar gomas antivibración)' : '1 sheet 4×8 for 30"×30" platform + 4-sided dam (do not buy vibration pads)') + "</li>" +
              "<li>" + (es ? "1 luz LED cerrada con apagador + 1 contacto GFCI 120V (≤25 pies)" : "1 switched enclosed LED light + 1 line-side 120V GFCI outlet (≤25 ft)") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Alcance de NEXT" : "NEXT Scope") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? "Calefactor horizontal, termostato, ductos aislados, salida lateral y soportes antivibración" : "Horizontal furnace, thermostat, insulated ducts, sidewall vent & vibration isolation") + "</li>" +
              "<li>" + (es ? "Alimentación exterior al subpanel D04, permisos, prueba HERS e inspecciones" : "Exterior power run to D04 subpanel, permits, HERS test & City inspections") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function wireAllNodeDrags() {
    var svg = document.getElementById("hvacHumanSvg");
    if (!svg) return;
    var es = isEs();

    var hatchJump = document.getElementById("hvacHatchJump");
    if (hatchJump) {
      hatchJump.addEventListener("click", function () {
        state.step = "hatch";
        syncBlueprintHiddenState();
        render();
        window.scrollTo(0, 0);
      });
      hatchJump.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          state.step = "hatch";
          syncBlueprintHiddenState();
          render();
          window.scrollTo(0, 0);
        }
      });
    }

    var BOUNDS = {
      f1: { minX: 162, maxX: 430, minY: 118, maxY: 274 },
      r1: { minX: 156, maxX: 380, minY: 68, maxY: 266 },
      s1: { minX: 54, maxX: 310, minY: 72, maxY: 272 },
      s2: { minX: 160, maxX: 468, minY: 148, maxY: 278 },
      s3: { minX: 318, maxX: 454, minY: 24, maxY: 132 },
      jd1: { minX: 280, maxX: 400, minY: 54, maxY: 134 }
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

      var m = computeMetrics();
      var walkCol = m.walkPass ? "#2f6b3f" : "#a8281c";
      var walkFill = m.walkPass ? "#e4f0e6" : "#f9e6e4";

      var ductLayer = document.getElementById("hvacDynamicDuctsLayer");
      if (ductLayer) ductLayer.innerHTML = buildDynamicDuctsLayerHtml(m);

      var hatchRect = document.getElementById("hvacHatchRect");
      if (hatchRect) {
        hatchRect.setAttribute("fill", m.ducts.hatchBlocked ? "#f9e6e4" : "#f7ecd9");
        hatchRect.setAttribute("stroke", m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06");
      }

      var halo = document.getElementById("hvacWalkHalo");
      var bg = document.getElementById("hvacWalkBg");
      var ln = document.getElementById("hvacWalkLn");
      if (halo) { halo.setAttribute("d", m.walkD); halo.setAttribute("stroke", walkCol); }
      if (bg) { bg.setAttribute("d", m.walkD); bg.setAttribute("stroke", walkCol); }
      if (ln) { ln.setAttribute("d", m.walkD); ln.setAttribute("stroke", walkCol); }

      var pill = document.getElementById("hvacSvgPill");
      var ptxt = document.getElementById("hvacSvgPillTxt");
      if (pill) { pill.setAttribute("fill", walkFill); pill.setAttribute("stroke", walkCol); }
      if (ptxt) {
        ptxt.setAttribute("fill", walkCol);
        ptxt.textContent = es
          ? "Pasillo 24\": " + m.walkFt + "' / 20' máx. (" + m.sheets + " hojas) · Salida lateral: " + m.flue.runFt + "' · Ductos " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "'"
          : "24\" Walkway: " + m.walkFt + "' / 20' max (" + m.sheets + " sheets) · Sidewall vent: " + m.flue.runFt + "' · Ducts " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "'";
      }

      var kpiWalk = document.getElementById("hvacKpiWalkVal");
      if (kpiWalk) {
        kpiWalk.className = "u4h-kpi-val " + (m.walkPass ? "is-ok" : "is-fail");
        kpiWalk.textContent = m.walkFt + (es ? " pies / 20" : " ft / 20 ft");
      }
      var kpiSheets = document.getElementById("hvacKpiSheetsSub");
      if (kpiSheets) kpiSheets.textContent = m.sheets + (es ? " hojas 4×8 · 30\" paso" : " sheets 4×8 · 30\" clear");
      var kpiRuns = document.getElementById("hvacKpiRunsVal");
      if (kpiRuns) kpiRuns.textContent = m.sa1Ft + " / " + m.sa2Ft + " / " + m.sa3Ft + "'";

      var st = document.getElementById("hvacStatusBanner");
      if (st) {
        var sObj = computeSingleStatus(m, es);
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
          syncBlueprintHiddenState();
          render();
        }
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", finish);
        document.addEventListener("pointercancel", finish);
      });

      handle.addEventListener("keydown", function (ev) {
        var step = 6;
        var cur = state.nodes[nodeKey];
        if (!cur) return;
        if (ev.key === "ArrowLeft") { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x - step, cur.y); syncBlueprintHiddenState(); }
        if (ev.key === "ArrowRight") { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x + step, cur.y); syncBlueprintHiddenState(); }
        if (ev.key === "ArrowUp") { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x, cur.y - step); syncBlueprintHiddenState(); }
        if (ev.key === "ArrowDown") { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x, cur.y + step); syncBlueprintHiddenState(); }
      });
    });
  }

  function renderHatchStep(m, es) {
    var statusCls = state.fireRating === "yes" || state.joistBay === "14.5" || state.joistBay === "22.5"
      ? "is-fail"
      : (state.fireRating === "no" && state.joistBay === "27.5" ? "is-pass" : "is-warn");
    var statusText = state.fireRating === "yes"
      ? (es ? "Alto: Si el descanso requiere cortafuego, pedir puerta cortafuego listada con 24\"×36\" libres reales (no armar el kit de madera ni usar puertas nominales que reduzcan el claro)."
            : "Stop: If the landing ceiling is fire-rated, order a listed fire-rated door with a full 24\"×36\" clear opening (do not build the wood kit or use nominal doors that shrink the opening).")
      : state.joistBay === "14.5" || state.joistBay === "22.5"
        ? (es ? "Requiere cabezal: Un espacio de " + state.joistBay + "\" es menor a 27-1/2\" — armar cabezal estructural sin reducir 24\"×36\" libres."
              : "Header needed: A " + state.joistBay + "\" bay is narrower than 27-1/2\" — plan a header rather than shrinking the 24\"×36\" clear opening.")
        : state.fireRating === "no" && state.joistBay === "27.5"
          ? (es ? "✓ Calza directo: Plafón estándar y vigas a 27-1/2\". Fotografiar trazo y confirmar seca la gotera antes de cortar."
                : "✓ Direct fit: Standard ceiling + 27-1/2\" bay. Photograph markout and confirm roof leak repair is dry before cutting.")
          : (es ? "Confirmar el lunes 23 nov afuera de Puerta 4: trazo de 24\"×36\" libres, si requiere cortafuego y separación de vigas B (sin cortar todavía)."
                : "Confirm Monday Nov 23 outside Front Door 4: exact 24\"×36\" clear markout, fire-rating, and joist spacing B (no cuts yet).");

    return (
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;align-items:start;margin-bottom:12px">' +
        '<div class="u4h-photo-card" style="margin:0">' +
          '<img src="./assets/attic-hatch-candidate.jpg" alt="' + esc(es ? "Plafón del descanso afuera de Puerta Principal 4" : "Common landing ceiling outside Front Door 4") + '" style="height:224px;object-fit:cover">' +
          '<div class="u4h-photo-cap"><strong>' + (es ? "Descanso afuera de Puerta 4:" : "Outside Front Door 4:") + "</strong> " +
            (es ? "Proteger la lámpara y moldura original. Conecta directo al pasillo de " + m.walkFt + " pies."
                : "Protect the existing light and trim. Connects directly to the " + m.walkFt + " ft walkway.") +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-wrap" style="margin:0">' + renderHatchFramingSvg(es) + "</div>" +
      "</div>" +
      '<div class="u4h-controls">' +
        '<div class="u4h-ctrl-row">' +
          '<span class="u4h-ctrl-lbl">' + (es ? "1. ¿El descanso requiere cortafuego?" : "1. Fire-rated ceiling required?") + "</span>" +
          '<div class="u4h-pill-group">' +
            '<button type="button" class="u4h-pill' + (state.fireRating === "unknown" ? " is-active" : "") + '" data-fire="unknown">' + (es ? "Revisar lunes" : "Check Monday") + "</button>" +
            '<button type="button" class="u4h-pill' + (state.fireRating === "no" ? " is-active" : "") + '" data-fire="no">' + (es ? "No (estándar)" : "No (standard)") + "</button>" +
            '<button type="button" class="u4h-pill' + (state.fireRating === "yes" ? " is-active" : "") + '" data-fire="yes">' + (es ? "Sí (cortafuego)" : "Yes (fire-rated)") + "</button>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-ctrl-row">' +
          '<span class="u4h-ctrl-lbl">' + (es ? "2. Separación entre vigas (B):" : "2. Joist spacing (B):") + "</span>" +
          '<div class="u4h-pill-group">' +
            [["unknown", es ? "Por medir" : "To measure"], ["14.5", '14-1/2"'], ["22.5", '22-1/2"'], ["27.5", '27-1/2"'], ["30", '> 27-1/2"']].map(function (opt) {
              return '<button type="button" class="u4h-pill' + (state.joistBay === opt[0] ? " is-active" : "") + '" data-bay="' + opt[0] + '">' + opt[1] + "</button>";
            }).join("") +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="u4h-status ' + statusCls + '">' + esc(statusText) + "</div>" +
      '<div class="u4h-svg-wrap">' + renderAirSealSvg(es) + "</div>" +
      '<div class="u4h-info-box">' +
        '<div class="u4h-info-title">' + (es ? "Cinco Reglas de Armado y Sellado" : "Five Hatch & Walkway Rules") + "</div>" +
        '<ul class="u4h-info-list">' +
          "<li>" + (es ? "Mantener las 24\" × 36\" libres reales (broches montados por fuera del claro)." : "Keep the full 24\" × 36\" clear opening (mount latches outside the clear passage).") + "</li>" +
          "<li>" + (es ? "Sellar marco fijo con cordón de 3/8\"; empaque 1/2\"×1/8\" en apoyos 1×2; dejar junta de tapa sin sellador." : "Caulk fixed frame w/ 3/8\" rod; put 1/2\"×1/8\" foam strip on 1×2 ledges; leave lid seam uncaulked.") + "</li>" +
          "<li>" + (es ? "Sujetar 2 colchonetas sin papel a la tapa con 3 lazos de alambre cal. 16 + dique de 2\" en 4 lados." : "Hold 2 unfaced batts on the lid with 3 wire loops + build a 4-sided dam 2\" above loose fill.") + "</li>" +
          "<li>" + (es ? "Pasillo de 24\" en OSB 23/32\" o triplay 3/4\" (nunca 3/8\"); plataforma Norte 30\"×30\" sin comprar gomas." : "Use 23/32\" OSB or 3/4\" plywood for the 24\" walkway (never 3/8\"); crew buys zero vibration pads.") + "</li>" +
          "<li>" + (es ? "No cerrar el techo del clóset de recámara hasta tener el cable de bajo voltaje y la escotilla lista." : "Keep the bedroom-closet ceiling open until both the low-voltage cable and permanent hatch are finished.") + "</li>" +
        "</ul>" +
      "</div>"
    );
  }

  function renderWalkthroughStep(m, es) {
    var qs = [
      {
        k: "q1",
        en: "1. Hatch & site readiness: Confirm exact 24\"×36\" clear markout outside Front Door 4, joist spacing, ceiling fire-rating, carry turn onto the " + m.walkFt + " ft walkway, and pre-start site checklist (photo markout only — no cuts yet).",
        es: "1. Escotilla y sitio listo: Confirmar trazo exacto de 24\"×36\" libres afuera de Puerta 4, separación de vigas, cortafuego del plafón, giro hacia el pasillo de " + m.walkFt + " pies y lista previa (solo foto — sin cortar)."
      },
      {
        k: "q2",
        en: "2. Sidewall vent route (flat roof — zero roof cuts): Measure whether the South wall has at least 4 ft to the property line (or route out the West rear-yard wall) and confirm Option A (listed power venter) vs. Option B (95%+ sealed PVC / heat pump).",
        es: "2. Salida lateral (techo plano — cero cortes en techo): Medir si el muro Sur tiene al menos 4 pies a la colindancia (o salir por el muro Oeste al patio) y confirmar Opción A (extractor listado) vs. Opción B (PVC 95%+ / bomba de calor)."
      },
      {
        k: "q3",
        en: "3. Panel & power run (D04): Inspect the Eaton 125A subpanel John mounted at D04 and confirm bottom vs. side wire entry. Signed NEXT scope includes an 80-amp feed to Unit 4 + conditional 100-amp main breaker if service supports it — get electrician sign-off before wiring or closing D04.",
        es: "3. Subpanel y línea (D04): Revisar el subpanel Eaton 125A montado por John en D04 y confirmar entrada inferior vs. lateral. El alcance firmado de NEXT incluye línea de 80A + principal condicional de 100A — pedir visto bueno del electricista antes de cablear o cerrar D04."
      },
      {
        k: "q4",
        en: "4. Attic light connection: Our crew installs the permanent switched enclosed LED attic light — agree with NEXT's electrician who lands the final wire connection and when.",
        es: "4. Conexión de luz en ático: Nuestra cuadrilla instala la lámpara LED cerrada con apagador — acordar con el electricista de NEXT quién hace la conexión eléctrica final y cuándo."
      }
    ];

    return (
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px;margin-bottom:14px">' +
        '<div class="u4h-info-box" style="margin:0">' +
          '<div class="u4h-info-title">' + (es ? "NEXT Instala y Prueba" : "NEXT Installs & Tests") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li>" + (es ? "Calefactor horizontal, termostato y ductos aislados (campana 6\" de cocina aparte)." : "Horizontal furnace, thermostat & insulated ducts (Kitchen 6\" hood stays separate).") + "</li>" +
            "<li>" + (es ? "Salida lateral en muro exterior (cero cortes en techo plano) + gomas antivibración." : "Horizontal sidewall exhaust (zero flat-roof cuts) + furnace vibration pads.") + "</li>" +
            "<li>" + (es ? "Línea eléctrica del tablero principal al subpanel D04, permisos, HERS e inspecciones." : "Main-to-D04 subpanel power run, permits, HERS test & City inspections.") + "</li>" +
          "</ul>" +
        "</div>" +
        '<div class="u4h-info-box" style="margin:0">' +
          '<div class="u4h-info-title">' + (es ? "Nuestra Cuadrilla (En Orden)" : "Our Crew (In Order)") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li><strong>" + (es ? "1. Antes:" : "1. Before:") + "</strong> " + (es ? "Dejar abiertos clóset y D04, secar gotera del techo plano y desconectar ozono." : "Keep bedroom closet & D04 open, fix flat-roof leak, keep ozone unplugged.") + "</li>" +
            "<li><strong>" + (es ? "2. Coordinado:" : "2. Coordinate:") + "</strong> " + (es ? 'Escotilla 24"×36" en Puerta 4, pasillo 24" (' + m.walkFt + ' pies), plataforma 30"×30", GFCI y luz.' : '24"×36" Door 4 hatch, 24" walkway (' + m.walkFt + ' ft), 30"×30" platform, GFCI & light.') + "</li>" +
            "<li><strong>" + (es ? "3. Después:" : "3. After:") + "</strong> " + (es ? "Cerrar clóset (tras cable LV + escotilla) y resanar/pintar plafones y D04." : "Close bedroom closet (after LV cable + hatch) and patch/paint ceilings & D04.") + "</li>" +
          "</ul>" +
        "</div>" +
      "</div>" +
      '<div class="u4h-info-title" style="margin:2px 0 8px;font-weight:800;color:var(--accent)">' +
        (es ? "Cuatro Respuestas para el Lunes 23 Nov (2:00–4:00 p.m. · Serge y Alex)" : "Four Answers Needed Monday, Nov 23 (2:00–4:00 p.m. · Serge & Alex)") +
      "</div>" +
      '<div class="u4h-item-list">' +
        qs.map(function (q) {
          var done = !!state.qChecks[q.k];
          return '<div class="u4h-item-card' + (done ? " is-selected" : "") + '">' +
            '<label style="display:flex;gap:10px;align-items:flex-start;flex:1;cursor:pointer">' +
              '<input type="checkbox" data-q="' + q.k + '"' + (done ? " checked" : "") + ' style="width:17px;height:17px;margin-top:2px;accent-color:var(--accent)">' +
              '<span class="u4h-item-name" style="font-size:13.5px;line-height:1.45;font-weight:600">' + esc(es ? q.es : q.en) + "</span>" +
            "</label>" +
          "</div>";
        }).join("") +
      "</div>" +
      '<div class="u4h-cta-row">' +
        '<button type="button" class="u4h-action-btn" id="hvacLogBtn">' + (es ? "\uD83D\uDCDD Guardar notas de la visita" : "\uD83D\uDCDD Save Monday walkthrough notes") + "</button>" +
      "</div>" +
      renderEquip(m, es)
    );
  }

  function render() {
    var host = document.getElementById("u4hBody");
    var holdEl = document.getElementById("u4hHoldStrip");
    if (!host) return;
    var es = isEs();
    var m = computeMetrics();
    var idx = STEPS.findIndex(function (s) { return s.id === state.step; });
    if (idx < 0) idx = 0;

    if (holdEl) {
      holdEl.className = "u4h-hold-strip";
      holdEl.innerHTML = es
        ? "<strong>Visita de planeación · Lunes 23 nov (2:00–4:00 p.m. con Serge y Alex):</strong> No cortar plafones, no cortar el techo plano ni meter cable al subpanel todavía."
        : "<strong>Planning visit · Monday, Nov 23 (2:00–4:00 p.m. with Serge &amp; Alex):</strong> Do not cut ceilings, cut the flat roof, or pull subpanel wire yet.";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Attic Hatch, Walkway, Furnace & Ducts";
    var titleEs = "Escotilla, Pasillo, Calefacción y Ductos";
    var subEn = "Drag the furnace or vents to test layout, or tap the 24\"×36\" Door 4 hatch to inspect framing & seals";
    var subEs = "Arrastra el calefactor o ductos para probar el trazo, o toca la escotilla 24\"×36\" para ver el marco y sellos";
    var inner = "";

    if (state.step === "layout") {
      var stObj = computeSingleStatus(m, es);
      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi" style="cursor:pointer" id="hvacKpiHatchCard">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Escotilla (Tocar)" : "Attic Hatch (Tap)") + "</div>" +
            '<div class="u4h-kpi-val is-info">24" × 36"</div>' +
            '<div class="u4h-kpi-sub">' + (es ? (state.hatchLocation === "door4" ? "Afuera de Puerta 4 ↗" : "Pasillo interior ↗") : (state.hatchLocation === "door4" ? "Outside Door 4 ↗" : "Interior hall ↗")) + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Pasillo 24\" Madera" : "24\" Wood Walkway") + "</div>" +
            '<div id="hvacKpiWalkVal" class="u4h-kpi-val ' + (m.walkPass ? "is-ok" : "is-fail") + '">' + m.walkFt + (es ? " pies / 20" : " ft / 20 ft") + "</div>" +
            '<div id="hvacKpiSheetsSub" class="u4h-kpi-sub">' + m.sheets + (es ? " hojas 4×8 · 30\" paso" : " sheets 4×8 · 30\" clear") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Ductos y Salida" : "Ducts & Sidewall Vent") + "</div>" +
            '<div id="hvacKpiRunsVal" class="u4h-kpi-val ' + (m.flue.gravityIllegal ? "is-fail" : "is-ok") + '">' + m.sa1Ft + " / " + m.sa2Ft + " / " + m.sa3Ft + "'</div>" +
            '<div class="u4h-kpi-sub">' + (es ? "Cero cortes en techo" : "Zero flat-roof cuts") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderAtticPlanSvg(m, es) + "</div>" +
        '<div id="hvacStatusBanner" class="u4h-status ' + stObj.cls + '">' + esc(stObj.txt) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Ubicación del calefactor:" : "Furnace spot:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.activePreset === "reconciled" ? " is-active" : "") + '" data-preset="reconciled">' + (es ? "Comedor SO · 15.8' (Base)" : "SW Dining · 15.8' (Recommended)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.activePreset === "close" ? " is-active" : "") + '" data-preset="close">' + (es ? "Comedor NO · 10.6'" : "NW Dining · 10.6'") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.activePreset === "far" ? " is-active" : "") + '" data-preset="far">' + (es ? "Sala Este · >20'" : "East Living · >20'") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Muro de salida lateral:" : "Sidewall vent exit:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.exitWall === "south" ? " is-active" : "") + '" data-ewall="south">' + (es ? "Muro Sur (revisar ≥4')" : "South Wall (check ≥4')") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.exitWall === "west" ? " is-active" : "") + '" data-ewall="west">' + (es ? "Patio Oeste (≥4' libre)" : "West Rear Yard (≥4' clear)") + "</button>" +
            "</div>" +
          "</div>" +
          '<details id="hvacMoreOpts"' + (state.moreOptsOpen ? " open" : "") + ' style="border-top:1px solid var(--line);padding-top:8px">' +
            '<summary style="cursor:pointer;font-size:12.5px;font-weight:600;color:var(--accent)">' + (es ? "Más opciones de ductos, escotilla y extractor" : "More duct, hatch & vent options") + "</summary>" +
            '<div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">' +
              '<div class="u4h-ctrl-row">' +
                '<span class="u4h-ctrl-lbl">' + (es ? "Tipo de salida lateral:" : "Vent system:") + "</span>" +
                '<div class="u4h-pill-group">' +
                  '<button type="button" class="u4h-pill' + (state.ventMode === "power_venter" ? " is-active" : "") + '" data-vmode="power_venter">' + (es ? "Opción A: Extractor listado" : "Option A: Power venter") + "</button>" +
                  '<button type="button" class="u4h-pill' + (state.ventMode === "cat4_pvc" ? " is-active" : "") + '" data-vmode="cat4_pvc">' + (es ? "Opción B: PVC 95%+ / Bomba" : "Option B: 95%+ PVC / Heat pump") + "</button>" +
                "</div>" +
              "</div>" +
              '<div class="u4h-ctrl-row">' +
                '<span class="u4h-ctrl-lbl">' + (es ? "Trazado de ductos:" : "Duct style & discharge:") + "</span>" +
                '<div class="u4h-pill-group">' +
                  '<button type="button" class="u4h-pill' + (state.ductMode === "trunk" ? " is-active" : "") + '" data-dmode="trunk">' + (es ? "Troncal" : "Trunk & branch") + "</button>" +
                  '<button type="button" class="u4h-pill' + (state.ductMode === "radial" ? " is-active" : "") + '" data-dmode="radial">Radial</button>' +
                  '<button type="button" class="u4h-pill' + (state.dischargeDir === "right" ? " is-active" : "") + '" data-ddir="right">' + (es ? "Salida Este →" : "Supply East →") + "</button>" +
                  '<button type="button" class="u4h-pill' + (state.dischargeDir === "left" ? " is-active" : "") + '" data-ddir="left">' + (es ? "← Salida Oeste" : "← Supply West") + "</button>" +
                "</div>" +
              "</div>" +
              '<div class="u4h-ctrl-row">' +
                '<span class="u4h-ctrl-lbl">' + (es ? "Sitio de escotilla:" : "Hatch spot:") + "</span>" +
                '<div class="u4h-pill-group">' +
                  '<button type="button" class="u4h-pill' + (state.hatchLocation === "door4" ? " is-active" : "") + '" data-loc="door4">' + (es ? "Afuera de Puerta 4 (Elegido)" : "Outside Door 4 (Selected)") + "</button>" +
                  '<button type="button" class="u4h-pill' + (state.hatchLocation === "hall" ? " is-active" : "") + '" data-loc="hall">' + (es ? "Pasillo interior (Ref.)" : "Interior hall (Ref.)") + "</button>" +
                "</div>" +
              "</div>" +
            "</div>" +
          "</details>" +
        "</div>";

    } else if (state.step === "hatch") {
      titleEn = "24\" × 36\" Clear Hatch, Framing & Seals";
      titleEs = "Escotilla 24\" × 36\" Libre, Marco y Sellos";
      subEn = "Common stair landing outside Front Door 4 — connected to the " + m.walkFt + " ft 24\" wood walkway";
      subEs = "Descanso común afuera de Puerta Principal 4 — conectada al pasillo de 24\" de " + m.walkFt + " pies";
      inner = renderHatchStep(m, es);

    } else if (state.step === "section") {
      titleEn = "66\" Flat-Roof Attic & Sidewall Vent";
      titleEs = "Ático de Techo Plano (66\") y Salida Lateral";
      subEn = "Zero roof cuts — compare sidewall vent options and check the 4-ft South property-line clearance";
      subEs = "Cero cortes en techo plano — compara opciones de salida lateral y revisa los 4 pies a la colindancia Sur";
      var secStatus = computeSingleStatus(m, es);
      inner =
        '<div class="u4h-svg-wrap">' + renderSectionSvg(m, es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Opción de salida lateral:" : "Sidewall vent option:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.ventMode === "power_venter" ? " is-active" : "") + '" data-vmode="power_venter">' + (es ? "Opción A: 80% + Extractor listado" : "Option A: 80% + Power venter") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ventMode === "cat4_pvc" ? " is-active" : "") + '" data-vmode="cat4_pvc">' + (es ? "Opción B: PVC 95%+ / Bomba calor" : "Option B: 95%+ PVC / Heat pump") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ventMode === "gravity_unassisted" ? " is-active" : "") + '" data-vmode="gravity_unassisted">' + (es ? "Sin extractor (No permitido)" : "No venter (Not allowed)") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Distancia del muro Sur a colindancia:" : "South wall distance to property line:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.southLotSetbackFt === "unknown" ? " is-active" : "") + '" data-lot="unknown">' + (es ? "Medir lunes 23" : "Measure Monday") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.southLotSetbackFt === "gte4" ? " is-active" : "") + '" data-lot="gte4">' + (es ? "≥ 4 pies (Muro Sur OK)" : "≥ 4 ft (South OK)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.southLotSetbackFt === "lt4" ? " is-active" : "") + '" data-lot="lt4">' + (es ? "< 4 pies (Salir al Oeste)" : "< 4 ft (Route West)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-status ' + secStatus.cls + '">' + esc(secStatus.txt) + "</div>";

    } else {
      titleEn = "Phase Split & Monday Walkthrough";
      titleEs = "Fases de Trabajo y Visita del Lunes";
      subEn = "Who owns each phase (NEXT vs. our crew) and the 4 items Monday needs to resolve";
      subEs = "Quién hace cada fase (NEXT vs. nuestra cuadrilla) y los 4 puntos a resolver el lunes";
      inner = renderWalkthroughStep(m, es);
    }

    var pager = '<div class="u4h-pager">' +
      '<button type="button" id="hvacPrevBtn" class="u4h-pager-btn"' + (idx <= 0 ? " disabled" : "") + ">&larr; " + (es ? "Anterior" : "Prev") + "</button>" +
      '<span class="u4h-pager-count">' + (es ? "Paso " : "Step ") + (idx + 1) + (es ? " de " : " of ") + STEPS.length + "</span>" +
      '<button type="button" id="hvacNextBtn" class="u4h-pager-btn is-next"' + (idx >= STEPS.length - 1 ? " disabled" : "") + ">" + (es ? "Siguiente" : "Next") + " &rarr;</button>" +
    "</div>";

    host.innerHTML =
      '<div class="u4h-card u4h-animate-in">' +
        '<div class="u4h-card-head">' +
          "<div>" +
            '<div class="u4h-title">' + esc(es ? titleEs : titleEn) + "</div>" +
            '<div class="u4h-sub">' + esc(es ? subEs : subEn) + "</div>" +
          "</div>" +
          '<span class="u4h-compass">24"×36" · 66" Attic</span>' +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    var kpiHatch = document.getElementById("hvacKpiHatchCard");
    if (kpiHatch) {
      kpiHatch.addEventListener("click", function () {
        state.step = "hatch";
        syncBlueprintHiddenState();
        render();
        window.scrollTo(0, 0);
      });
    }

    var moreDet = document.getElementById("hvacMoreOpts");
    if (moreDet) {
      moreDet.addEventListener("toggle", function () { state.moreOptsOpen = moreDet.open; });
    }

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); syncBlueprintHiddenState(); render(); window.scrollTo(0, 0); });
    });
    host.querySelectorAll("[data-loc]").forEach(function (b) {
      b.addEventListener("click", function () { state.hatchLocation = b.getAttribute("data-loc"); syncBlueprintHiddenState(); render(); });
    });
    host.querySelectorAll("[data-fire]").forEach(function (b) {
      b.addEventListener("click", function () { state.fireRating = b.getAttribute("data-fire"); render(); });
    });
    host.querySelectorAll("[data-bay]").forEach(function (b) {
      b.addEventListener("click", function () { state.joistBay = b.getAttribute("data-bay"); render(); });
    });
    host.querySelectorAll("[data-vmode]").forEach(function (b) {
      b.addEventListener("click", function () { state.ventMode = b.getAttribute("data-vmode"); syncBlueprintHiddenState(); render(); });
    });
    host.querySelectorAll("[data-ewall]").forEach(function (b) {
      b.addEventListener("click", function () { state.exitWall = b.getAttribute("data-ewall"); syncBlueprintHiddenState(); render(); });
    });
    host.querySelectorAll("[data-lot]").forEach(function (b) {
      b.addEventListener("click", function () { state.southLotSetbackFt = b.getAttribute("data-lot"); render(); });
    });
    host.querySelectorAll("[data-dmode]").forEach(function (b) {
      b.addEventListener("click", function () { state.ductMode = b.getAttribute("data-dmode"); render(); });
    });
    host.querySelectorAll("[data-ddir]").forEach(function (b) {
      b.addEventListener("click", function () { state.dischargeDir = b.getAttribute("data-ddir"); render(); });
    });
    host.querySelectorAll("[data-preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-preset");
        if (p === "reconciled") {
          state.nodes = cloneDefaults();
          state.dischargeDir = "right";
          state.activePreset = "reconciled";
        } else if (p === "close") {
          state.nodes.f1 = { x: 174, y: 196 };
          state.activePreset = "close";
        } else {
          state.nodes.f1 = { x: 350, y: 248 };
          state.activePreset = "far";
        }
        syncBlueprintHiddenState();
        render();
      });
    });
    host.querySelectorAll("[data-q]").forEach(function (cb) {
      cb.addEventListener("change", function () { state.qChecks[cb.getAttribute("data-q")] = cb.checked; render(); });
    });
    var eqBtn = document.getElementById("hvacEquipBtn");
    if (eqBtn) eqBtn.addEventListener("click", function () { state.equipOpen = !state.equipOpen; render(); });
    var logBtn = document.getElementById("hvacLogBtn");
    if (logBtn) logBtn.addEventListener("click", function () {
      if (window.U4LiveAi) {
        window.U4LiveAi.openNote(
          "Monday Nov 23 Attic + HVAC walkthrough notes — Hatch=" + state.hatchLocation +
          " (fire=" + state.fireRating + ", joist=" + state.joistBay +
          "), F1=(" + state.nodes.f1.x + "x" + state.nodes.f1.y + "in, walkway=" + m.walkFt +
          "ft), Vent=" + state.ventMode + " (" + m.flue.effectiveWall + " wall), D04 panel & attic light: "
        );
      }
    });
    var pBtn = document.getElementById("hvacPrevBtn");
    var nBtn = document.getElementById("hvacNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; syncBlueprintHiddenState(); render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; syncBlueprintHiddenState(); render(); window.scrollTo(0, 0); } });

    if (state.step === "layout") wireAllNodeDrags();

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

  function applyHvacView(args) {
    args = args || {};
    var changed = false;
    if (args.step != null && args.step !== "") {
      var nextStep = resolveInitialStep(args.step);
      if (STEPS.some(function (x) { return x.id === nextStep; })) {
        state.step = nextStep;
        changed = true;
      }
    }
    if (changed) {
      syncBlueprintHiddenState();
      render();
    }
    return changed;
  }

  window.U4PlanControl = {
    showView: function (args) { return applyHvacView(args); },
    applyChange: function (args) {
      args = args || {};
      var act = String(args.action || args.target || "").toLowerCase();
      var val = args.value;
      if (act === "duct_mode" || act === "mode") {
        state.ductMode = String(val).toLowerCase().indexOf("rad") >= 0 ? "radial" : "trunk";
      } else if (act === "vent_mode" || act === "vent") {
        var sv = String(val || "").toLowerCase();
        state.ventMode = sv.indexOf("pvc") >= 0 || sv.indexOf("95") >= 0 ? "cat4_pvc" : (sv.indexOf("grav") >= 0 ? "gravity_unassisted" : "power_venter");
      } else if (act === "exit_wall" || act === "sidewall") {
        state.exitWall = String(val || "").toLowerCase().indexOf("west") >= 0 ? "west" : "south";
      } else if (act === "hatch_location" || act === "location" || act === "spot") {
        state.hatchLocation = String(val || "").toLowerCase().indexOf("hall") >= 0 ? "hall" : "door4";
      } else if (act === "fire_rating") {
        state.fireRating = String(val || "unknown");
      } else if (act === "joist_bay") {
        state.joistBay = String(val || "unknown");
      } else if (act === "discharge" || act === "discharge_dir") {
        state.dischargeDir = String(val).toLowerCase().indexOf("left") >= 0 || String(val).toLowerCase().indexOf("west") >= 0 ? "left" : "right";
      } else if (act === "preset" || act === "furnace_preset") {
        var p = String(val || "").toLowerCase();
        if (p.indexOf("nw") >= 0 || p === "close") {
          state.nodes.f1 = { x: 174, y: 196 };
          state.activePreset = "close";
        } else if (p.indexOf("far") >= 0 || p.indexOf("east") >= 0) {
          state.nodes.f1 = { x: 350, y: 248 };
          state.activePreset = "far";
        } else {
          state.nodes = cloneDefaults();
          state.dischargeDir = "right";
          state.activePreset = "reconciled";
        }
      } else if (act === "move_node" || act === "move_f1" || state.nodes[act]) {
        var nk = act === "move_f1" ? "f1" : (state.nodes[act] ? act : String(args.target || "").toLowerCase());
        if (!state.nodes[nk]) return false;
        var pos = (val && typeof val === "object") ? val : args;
        if (pos.x != null && isFinite(Number(pos.x))) state.nodes[nk].x = Math.max(90, Math.min(440, Number(pos.x)));
        if (pos.y != null && isFinite(Number(pos.y))) state.nodes[nk].y = Math.max(40, Math.min(274, Number(pos.y)));
      } else if (act === "reset") {
        state.nodes = cloneDefaults();
        state.hatchLocation = "door4";
        state.fireRating = "unknown";
        state.joistBay = "unknown";
        state.ductMode = "trunk";
        state.dischargeDir = "right";
        state.ventMode = "power_venter";
        state.exitWall = "south";
        state.activePreset = "reconciled";
      } else {
        return false;
      }
      syncBlueprintHiddenState();
      render();
      return true;
    },
    getState: function () {
      var m = computeMetrics();
      return {
        planId: "attic-hvac",
        step: state.step,
        wall: "attic_plan",
        hatchLocation: state.hatchLocation,
        fireRating: state.fireRating,
        joistBay: state.joistBay,
        roofGeometry: "flat_roof_66in_cavity",
        ventMode: state.ventMode,
        exitWall: m.flue.effectiveWall,
        ductMode: state.ductMode,
        dischargeDir: state.dischargeDir,
        walkFt: m.walkFt,
        sheets: m.sheets,
        runs: { sa1: m.sa1Ft, sa2: m.sa2Ft, sa3: m.sa3Ft, ra1: m.ra1Ft, v1Sidewall: m.flue.runFt },
        nodes: state.nodes,
        summary: "Unified Attic + HVAC: step=" + state.step + ", hatch=" + state.hatchLocation + " (24x36in clear), F1=(" + state.nodes.f1.x + "in," + state.nodes.f1.y + "in), walkway=" + m.walkFt + "ft (" + m.sheets + " sheets), vent=" + state.ventMode + " (" + m.flue.effectiveWall + " wall)."
      };
    }
  };

  function boot() {
    if (window.U4PlanNav) {
      window.U4PlanNav.init({
        planId: "attic-hvac",
        headerEl: document.getElementById("u4hTopbar"),
        onLangChange: function () { render(); if (window.U4LiveAi) window.U4LiveAi.refreshPrompts(); }
      });
      var bp = window.U4PlanNav.getBootParams ? window.U4PlanNav.getBootParams() : {};
      if (bp.step) applyHvacView(bp);
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "attic-hvac",
        room: "hvac",
        titleEn: "Attic Hatch, Walkway, Furnace & Ducts",
        titleEs: "Escotilla, Pasillo, Calefacción y Ductos",
        getContext: function () {
          var m = computeMetrics();
          return "UnifiedPlan=attic-hvac, Step=" + state.step + ", Hatch=Outside Front Door 4 (24x36in clear, fire=" + state.fireRating + ", joistBay=" + state.joistBay + "), F1=(" + state.nodes.f1.x + "in," + state.nodes.f1.y + "in SW Dining), 24inWalkway=" + m.walkFt + "ft (" + m.sheets + " sheets), SidewallVent=" + state.ventMode + " (" + m.flue.effectiveWall + " wall), D04Subpanel=80A feed + conditional 100A main breaker, SwitchedAtticLight=crew scope (confirm tie-in w/ NEXT electrician).";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Quién hace cada fase entre NEXT y nuestra cuadrilla?", "¿Qué 4 puntos resolvemos el lunes 23?", "¿Cómo armamos la escotilla de 24×36 y el pasillo?"]
            : ["Who owns each phase between NEXT and our crew?", "What 4 items need answers on Monday Nov 23?", "How do we frame and seal the 24×36 hatch and walkway?"];
        }
      });
    }
    syncBlueprintHiddenState();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
