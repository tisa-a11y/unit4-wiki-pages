/* ============================================================================
   Attic Furnace, 24" Pathway & Reactive Manual D Ducts — Unified Guide (R3)
   Reconciled w/ Tisa Pins u4-auto-1795396710261 (SW Dining F1 + 30"×30" Platform)
   & u4-auto-1795396857428 (Flat Roof + Sidewall Exhaust Exit + 2025 SFMC §802.8)
   True-Scale Unit 4 Map · All 6 Nodes 2D Draggable · Cross-Plan Sync w/ Attic Hatch
   Zero External CDNs · Zero Prices · Zero Backend Clutter · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "layout", en: "1. Unified Floor Plan, 24\" Path & Ducts", es: "1. Planta Unificada, Pasillo 24\" y Ductos" },
    { id: "hatch", en: "2. 24\"×36\" Hatch & 5 Seals", es: "2. Escotilla 24\"×36\" y 5 Sellos" },
    { id: "section", en: "3. Flat Roof & Sidewall Vent Code", es: "3. Techo Plano y Salida Lateral" },
    { id: "walkthrough", en: "4. Mon Nov 23 & Hold Gates", es: "4. Visita Lunes 23 y Candados" }
  ];

  // Uniform true-scale Unit 4 floor plan geometry (inches, N=0..298", W=0..508")
  var SC = 0.86;
  var OX = 24;
  var OY = 38;
  function px(xIn) { return +(OX + xIn * SC).toFixed(1); }
  function py(yIn) { return +(OY + yIn * SC).toFixed(1); }

  var HATCH_DOOR4_IN = { x: 112, y: 74, w: 24, h: 36 };
  var HATCH_HALL_IN  = { x: 204, y: 108, w: 36, h: 24 };

  // Reconciled R3 Defaults (Tisa Pin u4-auto-1795396710261 -> F1 at X=174", Y=258" in SW Dining!)
  var RECONCILED_DEFAULTS = {
    f1:  { x: 174, y: 258 }, // Reconciled SW Dining spot (30"x30" North platform at X=174, Y=228.5; 15.8 ft 24" pathway!)
    r1:  { x: 248, y: 114 }, // Central Hall ceiling return (accessible filter)
    s1:  { x: 168, y: 126 }, // Hall ceiling at Kitchen threshold
    s2:  { x: 312, y: 212 }, // Living-room side at midpoint of Dining/Living pocket opening
    s3:  { x: 386, y: 116 }, // Bedroom SW corner by Bedroom entry (cleanly separated from JD-1)
    jd1: { x: 334, y: 80 }   // Short independent acoustic jump duct across Bedroom-to-Hall wall
  };

  function cloneDefaults() {
    return {
      f1:  { x: RECONCILED_DEFAULTS.f1.x,  y: RECONCILED_DEFAULTS.f1.y },
      r1:  { x: RECONCILED_DEFAULTS.r1.x,  y: RECONCILED_DEFAULTS.r1.y },
      s1:  { x: RECONCILED_DEFAULTS.s1.x,  y: RECONCILED_DEFAULTS.s1.y },
      s2:  { x: RECONCILED_DEFAULTS.s2.x,  y: RECONCILED_DEFAULTS.s2.y },
      s3:  { x: RECONCILED_DEFAULTS.s3.x,  y: RECONCILED_DEFAULTS.s3.y },
      jd1: { x: RECONCILED_DEFAULTS.jd1.x, y: RECONCILED_DEFAULTS.jd1.y }
    };
  }

  var bootParams = new URLSearchParams(window.location.search || "");
  var bootNodes = cloneDefaults();
  var bFx = Number(bootParams.get("fx"));
  var bFy = Number(bootParams.get("fy"));
  if (isFinite(bFx) && bFx >= 160 && bFx <= 430) bootNodes.f1.x = Math.round(bFx);
  if (isFinite(bFy) && bFy >= 108 && bFy <= 274) bootNodes.f1.y = Math.round(bFy);

  var state = {
    step: "layout",
    nodes: bootNodes,
    hatchLocation: (bootParams.get("loc") || "").toLowerCase() === "hall" ? "hall" : "door4",
    dischargeDir: "right",          // "right" (Supply East -> / Return West <-) | "left" (Supply West <- / Return East ->)
    ductMode: "trunk",              // "trunk" (Trunk & Branch — Manual D Rec.) | "radial" (Extended Plenum / Radial Wye)
    ventMode: bootParams.get("vent") || "power_venter", // "power_venter" | "cat4_pvc" | "gravity_unassisted"
    exitWall: bootParams.get("ewall") || "south",       // "south" (Verify >=4 ft SF lot line!) | "west" (Rear yard >=4 ft clear)
    southLotSetbackFt: "unknown",   // "unknown" | "gte4" | "lt4"
    gfciOffsetFt: 3,
    flueClearIn: 1.5,
    activePreset: (bootNodes.f1.x === 174 && bootNodes.f1.y === 258) ? "reconciled" : "custom",
    dragActive: false,
    equipOpen: false,
    qChecks: { q1: false, q2: false, q3: false, q4: false, q5: false, q6: false, q7: false }
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

  // Wall-respecting orthogonal 24" continuous walkway (identical to attic-human-guide.js!)
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
          { x: f1.x,    y: hatch.y + hatch.h / 2 },
          { x: f1.x,    y: platEdgeY }
        ];
      }
      var turnX = f1.x >= hEast ? f1.x : Math.max(166, f1.x);
      var startX = f1.x >= hatch.x ? hEast : (hatch.x - hatch.w / 2);
      return [
        { x: startX, y: hallSpineY },
        { x: turnX,  y: hallSpineY },
        { x: turnX,  y: platEdgeY }
      ];
    }

    var hatchEastX = hatch.x + hatch.w / 2; // 124"
    var hatchMidY = hatch.y;                // 74"
    if (f1.x >= 162 && f1.x <= 192 && platEdgeY >= hatchMidY) {
      return [
        { x: hatchEastX, y: hatchMidY },
        { x: f1.x,       y: hatchMidY },
        { x: f1.x,       y: platEdgeY }
      ];
    }
    var entryX = 170;
    return [
      { x: hatchEastX, y: hatchMidY },
      { x: entryX,     y: hatchMidY },
      { x: entryX,     y: hallSpineY },
      { x: f1.x,       y: hallSpineY },
      { x: f1.x,       y: platEdgeY }
    ];
  }

  function pathDFromPoints(pts) {
    return pts.map(function (pt, idx) {
      return (idx === 0 ? "M " : " L ") + px(pt.x) + " " + py(pt.y);
    }).join("");
  }

  // Reactive Horizontal Sidewall Flue Route (Flat Roof -> Exit Out Sidewall + Code & Slope Check!)
  function computeSidewallFlue(f1) {
    var effectiveWall = (state.exitWall === "south" && state.southLotSetbackFt === "lt4") ? "west" : state.exitWall;
    var pts;
    if (effectiveWall === "west") {
      // Route West above Kitchen/Dining ceiling cavity to West Rear-Yard Exterior Wall (avoiding Kitchen 6" hood chase at X=0..32, Y=155..190)
      if (f1.y >= 236) {
        // South of Kitchen South wall (Y=234) -> Dining West exterior wall IS exposed to rear yard at X=147", Y=236..296"!
        pts = [
          { x: f1.x, y: f1.y + 8 },
          { x: 147,  y: Math.max(246, Math.min(288, f1.y + 8)) }
        ];
      } else {
        // Route West across North Kitchen attic bay (Y=122", well North of Range Hood chase Y=171") to X=31.5" rear yard wall
        var safeY = Math.min(132, Math.max(114, f1.y));
        pts = [
          { x: f1.x, y: f1.y },
          { x: f1.x, y: safeY },
          { x: 31.5, y: safeY }
        ];
      }
    } else {
      // Route straight South to South Exterior Wall (Y = 297.75")
      pts = [
        { x: f1.x, y: f1.y + 14.5 },
        { x: f1.x, y: 297.75 }
      ];
    }

    var runIn = pathLenIn(pts);
    var runFt = +(Math.max(12, runIn) / 12).toFixed(1);
    var minRiseIn = +(runFt * 0.25).toFixed(2); // >= 1/4" per linear ft upward pitch (Carrier II810SA-05 p. 22)
    var straps = Math.max(1, Math.ceil(runFt / 5)); // Rigid metal straps <= 5 ft o.c.
    // Inside 66" flat-roof attic: horizontal furnace is 14.19" high on 1.5" deck (~16" top), leaving ~50" vertical space for 1/4"/ft rise!
    var headroomOk = (16 + minRiseIn + 8) <= 66;
    var gravityIllegal = state.ventMode === "gravity_unassisted";
    var southLotBlocked = state.exitWall === "south" && state.southLotSetbackFt === "lt4";
    var southLotUnverified = state.exitWall === "south" && state.southLotSetbackFt === "unknown";

    return {
      effectiveWall: effectiveWall,
      pts: pts,
      dStr: pathDFromPoints(pts),
      termPt: pts[pts.length - 1],
      runFt: runFt,
      minRiseIn: minRiseIn,
      straps: straps,
      headroomOk: headroomOk,
      gravityIllegal: gravityIllegal,
      southLotBlocked: southLotBlocked,
      southLotUnverified: southLotUnverified
    };
  }

  // ── ACCA MANUAL D + CARRIER/BRYANT HORIZONTAL REACTIVE DUCTWORK ROUTING ──
  function computeReactiveDucts() {
    var n = state.nodes;
    var f1 = n.f1;
    var dir = state.dischargeDir === "right" ? 1 : -1;

    var cabHalfW = 16.625;
    var plenumLen = 24;
    var supFlange = { x: f1.x + dir * cabHalfW, y: f1.y };
    var supEnd    = { x: f1.x + dir * (cabHalfW + plenumLen), y: f1.y };
    var retFlange = { x: f1.x - dir * cabHalfW, y: f1.y };
    var retEnd    = { x: f1.x - dir * (cabHalfW + 12), y: f1.y };

    var vents = [
      { id: "s1", name: "SA-1", pt: n.s1 },
      { id: "s2", name: "SA-2", pt: n.s2 },
      { id: "s3", name: "SA-3", pt: n.s3 }
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
          id: v.id,
          name: v.name,
          d: dStr,
          pts: pts,
          ft: +(pathLenIn(pts) / 12).toFixed(1),
          takeoff: collarPt,
          damperPt: {
            x: collarPt.x + (wyeExit.x - collarPt.x) * 0.72,
            y: collarPt.y + (wyeExit.y - collarPt.y) * 0.72
          },
          damperAngle: ang,
          isSideTakeoff: false
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

      if (forward.length === 0) {
        forward = behind.slice();
        behind = [];
      }

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
      var elbowX = supEnd.x + dir * 16;
      if ((firstX - supEnd.x) * dir < 0) elbowX = supEnd.x + dir * 10;

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
          var tkX1 = v.pt.x - dir * lead;
          takeoffs.push({ tkPt: { x: tkX1, y: trunkY }, weight: 1, vent: v });
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
          trunkSegs.push({
            pts: segPts,
            d: smoothCornerPath(segPts, 10),
            strokeW: remWeight >= 2 ? 5.6 : 3.8
          });
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
              takeoff: tk.wyeHub, damperPt: dmp, damperAngle: ang, isSideTakeoff: false
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
            takeoff: tk.tkPt, damperPt: dmp2, damperAngle: ang2, isSideTakeoff: false
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
        var dStrB = smoothCornerPath(bPts, 16);
        var angB = Math.atan2(bend1.y - sideTk.y, bend1.x - sideTk.x) * 180 / Math.PI;
        branches.push({
          id: bv.id, name: bv.name, d: dStrB, pts: bPts, ft: +((14 + pathLenIn(bPts)) / 12).toFixed(1),
          takeoff: sideTk,
          damperPt: { x: sideTk.x + (bend1.x - sideTk.x) * 0.75, y: sideTk.y + (bend1.y - sideTk.y) * 0.75 },
          damperAngle: angB, isSideTakeoff: true
        });
      });
    }

    // Sealed Return RA-1: clean sweep around Kitchen/Dining wall (x>=152) from R1 to Return End!
    var retClearX = Math.max(152, retEnd.x - dir * 8);
    var retMidY = Math.abs(n.r1.y - retEnd.y) > 25 ? Math.min(184, (n.r1.y + retEnd.y) / 2) : retEnd.y;
    var retPts = [retFlange, retEnd, { x: retClearX, y: retEnd.y }, { x: retClearX, y: retMidY }, { x: n.r1.x, y: retMidY }, n.r1];
    if ((n.r1.x - retEnd.x) * (-dir) > 12 && retEnd.x >= 152) {
      retPts = [retFlange, retEnd, { x: n.r1.x, y: retEnd.y }, n.r1];
    }
    var ra1D = smoothCornerPath(retPts, 16);
    var ra1Ft = +(pathLenIn(retPts) / 12).toFixed(1);

    var alerts = [];
    var shortCircuitPairs = [];
    var flue = computeSidewallFlue(f1);

    // Sidewall Venting Code & OEM Alerts (Carrier II810SA-05 p.22 + 2025 SFMC §802.8)
    if (flue.gravityIllegal) {
      alerts.push({
        sev: "fail",
        en: "CODE & OEM FAIL (Carrier Manual II810SA-05 p. 22 / CMC 802.6): 80% AFUE Category I furnaces CANNOT vent horizontally out a sidewall by gravity! Select Option A (Listed Sidewall Power Venter) or Option B (95%+ PVC Direct-Vent / Heat Pump).",
        es: "FALLA DE CÓDIGO Y MANUAL (Carrier II810SA-05 p. 22 / CMC 802.6): ¡Un equipo 80% AFUE Categoría I NO puede salir horizontal por gravedad en muro lateral! Usa Opción A (Extractor Mecánico Listado) u Opción B (95%+ PVC / Bomba de Calor)."
      });
    } else if (flue.southLotBlocked) {
      alerts.push({
        sev: "warn",
        en: "SFMC §802.8 Auto-Rerouted to West Rear-Yard Wall: South wall < 4 ft from property line cannot host mechanical draft termination — V1 automatically routed West to Rear-Yard exterior wall (" + flue.runFt + " ft, +" + flue.minRiseIn + "\" pitch).",
        es: "SFMC §802.8 Re-ruteado al Muro Oeste (Patio): Muro Sur a < 4 pies de colindancia no permite descarga mecánica — V1 re-ruteado automático al muro Oeste del patio (" + flue.runFt + " pies, +" + flue.minRiseIn + "\" pendiente)."
      });
    } else if (flue.southLotUnverified && state.ventMode === "power_venter") {
      alerts.push({
        sev: "warn",
        en: "Mon Nov 23 SFMC §802.8 Check: Verify South wall has ≥ 4 ft (1219 mm) clearance to South property line & ≥ 4 ft horiz/below (or ≥ 1 ft above) windows. If < 4 ft, switch Exit Wall to West Rear Yard!",
        es: "Revisión Lunes 23 (SFMC §802.8): Confirmar ≥ 4 pies (1219 mm) libres a colindancia Sur y ventanas. Si hay < 4 pies en colindancia Sur, cambiar salida al Muro Oeste (Patio Trasero)."
      });
    }

    var jdB = { x: n.jd1.x + 12, y: n.jd1.y - 4 };
    var jdH = { x: n.jd1.x - 12, y: n.jd1.y + 6 };
    vents.forEach(function (v) {
      var dRet = distIn(v.pt, n.r1);
      if (dRet < 48) {
        shortCircuitPairs.push({ a: v.pt, b: n.r1, ft: +(dRet / 12).toFixed(1), label: v.name + "↔R1" });
        alerts.push({
          sev: "fail",
          en: "Short-circuit risk: " + v.name + " is only " + (dRet / 12).toFixed(1) + " ft from R1 Return (< 4 ft) — move supply & return farther apart.",
          es: "Riesgo de cortocircuito: " + v.name + " está a solo " + (dRet / 12).toFixed(1) + " pies de R1 Retorno (< 4 pies)."
        });
      }
      var dJd = Math.min(distIn(v.pt, jdB), distIn(v.pt, jdH));
      if (dJd < 42) {
        shortCircuitPairs.push({ a: v.pt, b: n.jd1, ft: +(dJd / 12).toFixed(1), label: v.name + "↔JD-1" });
        alerts.push({
          sev: "warn",
          en: "Short-circuit check: " + v.name + " is only " + (dJd / 12).toFixed(1) + " ft from JD-1 Jump Duct (< 3.5 ft).",
          es: "Revisar cortocircuito: " + v.name + " está a solo " + (dJd / 12).toFixed(1) + " pies del Jump Duct JD-1."
        });
      }
    });

    var byId = {};
    branches.forEach(function (b) {
      byId[b.id] = b;
      if (b.ft > 25.0) {
        alerts.push({
          sev: "warn",
          en: "Long branch (" + b.name + " ≈ " + b.ft + " ft > 25 ft): check Manual D static pressure & consider upsizing branch duct.",
          es: "Ramal largo (" + b.name + " ≈ " + b.ft + " pies > 25 pies): revisar presión estática Manual D."
        });
      }
    });

    var hBox = activeHatchBox();
    var hatchRect = { x: hBox.x - hBox.w / 2, y: hBox.y - hBox.h / 2, w: hBox.w, h: hBox.h };
    var hatchBlocked = (Math.abs(f1.x - hBox.x) < 34 && Math.abs(f1.y - hBox.y) < 34) ||
      trunkSegs.some(function (ts) { return polyHitsRect(ts.pts, hatchRect); }) ||
      branches.some(function (b) { return polyHitsRect(b.pts, hatchRect); }) ||
      polyHitsRect(retPts, hatchRect);
    if (hatchBlocked) {
      alerts.push({
        sev: "fail",
        en: "Hatch conflict: F1 or ductwork crosses the 24\"×36\" Attic Hatch — reroute clear of access opening!",
        es: "Conflicto con escotilla: F1 o ductos cruzan la escotilla 24\"×36\" — liberar acceso."
      });
    }

    return {
      dir: dir, supFlange: supFlange, supEnd: supEnd, retFlange: retFlange, retEnd: retEnd,
      trunkSegs: trunkSegs, branches: branches, byId: byId, ra1D: ra1D, ra1Ft: ra1Ft,
      flue: flue, alerts: alerts, shortCircuitPairs: shortCircuitPairs, hatchBlocked: hatchBlocked
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
      ra1Ft: ducts.ra1Ft,
      gfciPass: state.gfciOffsetFt <= 25,
      fluePass: state.flueClearIn >= 1.0 && !ducts.flue.gravityIllegal
    };
  }

  function syncedAtticHref() {
    var base = window.U4PlanNav ? window.U4PlanNav.planUrl("attic-hatch") : "../attic-hatch/index.html";
    var sep = base.indexOf("?") >= 0 ? "&" : "?";
    return base + sep + "fx=" + Math.round(state.nodes.f1.x) + "&fy=" + Math.round(state.nodes.f1.y) +
      "&loc=" + encodeURIComponent(state.hatchLocation) +
      "&vent=" + encodeURIComponent(state.ventMode) +
      "&ewall=" + encodeURIComponent(state.exitWall);
  }

  function syncBlueprintHiddenState() {
    try {
      var inpFx = document.getElementById("inp-furnace-x");
      var inpFy = document.getElementById("inp-furnace-y");
      if (inpFx) { inpFx.value = String(Math.round(state.nodes.f1.x)); inpFx.dispatchEvent(new Event("change", { bubbles: true })); }
      if (inpFy) { inpFy.value = String(Math.round(state.nodes.f1.y)); inpFy.dispatchEvent(new Event("change", { bubbles: true })); }
    } catch (_) {}
    try {
      var next = new URLSearchParams(window.location.search || "");
      next.set("fx", String(Math.round(state.nodes.f1.x)));
      next.set("fy", String(Math.round(state.nodes.f1.y)));
      next.set("loc", state.hatchLocation);
      next.set("vent", state.ventMode);
      next.set("ewall", state.exitWall);
      window.history.replaceState(null, "", "?" + next.toString() + (window.location.hash || ""));
    } catch (_) {}
    if (window.U4PlanNav && typeof window.U4PlanNav.postToParent === "function") {
      window.U4PlanNav.postToParent({
        type: "u4:attic-hvac-sync",
        sourcePlan: "hvac-layout",
        f1: { x: Math.round(state.nodes.f1.x), y: Math.round(state.nodes.f1.y) },
        location: state.hatchLocation,
        ventMode: state.ventMode,
        exitWall: state.exitWall
      });
    }
  }

  function buildDynamicDuctsLayerHtml(m) {
    var d = m.ducts;
    var fl = d.flue;
    var parts = [];

    // 1. Tapered Rigid Main Supply Trunk Spine
    d.trunkSegs.forEach(function (ts) {
      parts.push('<path d="' + ts.d + '" fill="none" stroke="#1f5f7a" stroke-width="' + ts.strokeW + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.28"/>');
      parts.push('<path d="' + ts.d + '" fill="none" stroke="#1f5f7a" stroke-width="' + Math.max(2.2, +(ts.strokeW * 0.42).toFixed(1)) + '" stroke-linecap="round" stroke-linejoin="round"/>');
    });

    // 2. 45-deg Swept Wye Takeoffs + Accessible Balancing Dampers
    d.branches.forEach(function (b) {
      var bCol = b.ft > 25 ? "#9a5b06" : "#1f5f7a";
      parts.push('<path d="' + b.d + '" fill="none" stroke="' + bCol + '" stroke-width="2.2" stroke-linecap="round"/>');
      parts.push('<circle cx="' + px(b.takeoff.x) + '" cy="' + py(b.takeoff.y) + '" r="2.7" fill="#ffffff" stroke="' + bCol + '" stroke-width="1.4"/>');
      var dx = px(b.damperPt.x), dy = py(b.damperPt.y);
      parts.push(
        '<g transform="translate(' + dx + ',' + dy + ') rotate(' + Math.round(b.damperAngle) + ')">' +
          '<circle r="3.4" fill="#ffffff" stroke="#2f6b3f" stroke-width="1.2"/>' +
          '<line x1="-2.4" y1="-2.4" x2="2.4" y2="2.4" stroke="#2f6b3f" stroke-width="1.3"/>' +
        "</g>"
      );
    });

    // 3. Sealed Negative-Pressure Return RA-1
    parts.push('<path d="' + d.ra1D + '" fill="none" stroke="#0f766e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.20"/>');
    parts.push('<path d="' + d.ra1D + '" fill="none" stroke="#0f766e" stroke-width="2.1" stroke-dasharray="5 3" stroke-linecap="round" stroke-linejoin="round"/>');

    // 4. Reactive Horizontal Sidewall Flue Exit V1 (Flat Roof -> Sidewall Termination!)
    var flCol = fl.gravityIllegal ? "#a8281c" : (state.ventMode === "cat4_pvc" ? "#1f5f7a" : "#9a5b06");
    parts.push('<path d="' + fl.dStr + '" fill="none" stroke="' + flCol + '" stroke-width="3.2" stroke-dasharray="4 2"/>');
    var tx = px(fl.termPt.x), ty = py(fl.termPt.y);
    parts.push('<rect x="' + (tx - 15).toFixed(1) + '" y="' + (ty - 6.5).toFixed(1) + '" width="30" height="13" rx="3" fill="' + (fl.gravityIllegal ? "#f9e6e4" : "#f7ecd9") + '" stroke="' + flCol + '" stroke-width="1.5"/>');
    parts.push('<text x="' + tx + '" y="' + (ty + 2.4).toFixed(1) + '" text-anchor="middle" font-size="5.6" font-weight="800" fill="' + flCol + '">' +
      (fl.gravityIllegal ? "V1 FAIL" : (state.ventMode === "cat4_pvc" ? "V1 PVC" : "V1 PWR")) + "</text>");

    // 5. Short-Circuit Warning Connectors
    d.shortCircuitPairs.forEach(function (sc) {
      parts.push('<line x1="' + px(sc.a.x) + '" y1="' + py(sc.a.y) + '" x2="' + px(sc.b.x) + '" y2="' + py(sc.b.y) + '" stroke="#a8281c" stroke-width="1.8" stroke-dasharray="2 2"/>');
      parts.push('<circle cx="' + ((px(sc.a.x) + px(sc.b.x)) / 2).toFixed(1) + '" cy="' + ((py(sc.a.y) + py(sc.b.y)) / 2).toFixed(1) + '" r="5" fill="#f9e6e4" stroke="#a8281c" stroke-width="1.2"/>');
      parts.push('<text x="' + ((px(sc.a.x) + px(sc.b.x)) / 2).toFixed(1) + '" y="' + ((py(sc.a.y) + py(sc.b.y)) / 2 + 2.3).toFixed(1) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#a8281c">!</text>');
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

    return '<svg id="hvacHumanSvg" viewBox="0 0 500 344" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Plano integrado de ático, pasillo 24 pulgadas, calefacción F1, ductos Manual D y salida lateral" : "Unified attic hatch, 24-inch pathway, SW Dining F1 furnace, Manual D ducts and sidewall exit") + '" style="touch-action:none">' +
      '<text x="14" y="17" font-size="8.2" font-weight="800" fill="#1f5f7a">' +
        (es ? "PLANO INTEGRADO ÁTICO + HVAC (TECHO PLANO · SALIDA LATERAL) · ← OESTE | NORTE ↑ | ESTE →"
            : "UNIFIED ATTIC + HVAC (FLAT ROOF · SIDEWALL EXIT) · ← WEST (Door 4) | NORTH ↑ | EAST →") + "</text>" +
      '<g transform="translate(476,22)">' +
        '<circle r="15" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-11 -3.2,-4 3.2,-4" fill="#a8281c"/>' +
        '<text x="0" y="-12.2" text-anchor="middle" font-size="6.4" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="12.5" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">S</text>' +
        '<text x="10.5" y="2.2" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">E</text>' +
        '<text x="-10.5" y="2.2" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">' + (es ? "O" : "W") + "</text>" +
      "</g>" +

      // Outside Front Door 4 Landing (West of x=147")
      '<rect x="' + px(72) + '" y="' + py(38) + '" width="' + +(75 * SC).toFixed(1) + '" height="' + +(70 * SC).toFixed(1) + '" fill="#f7ecd9" fill-opacity="0.48" stroke="#9a5b06" stroke-width="1.3" stroke-dasharray="4 3"/>' +
      '<line x1="' + px(78) + '" y1="' + py(44) + '" x2="' + px(78) + '" y2="' + py(102) + '" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<line x1="' + px(84) + '" y1="' + py(44) + '" x2="' + px(84) + '" y2="' + py(102) + '" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<line x1="' + px(90) + '" y1="' + py(44) + '" x2="' + px(90) + '" y2="' + py(102) + '" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<text x="' + px(112) + '" y="' + py(48) + '" text-anchor="middle" font-size="5.3" font-weight="800" fill="#9a5b06">' + (es ? "AFUERA PTA 4" : "OUTSIDE DOOR 4") + "</text>" +

      // Kitchen (SW) + Dedicated 6" Hood Chase marker
      '<path d="M ' + px(31.5) + " " + py(108) + " L " + px(147) + " " + py(108) + " L " + px(147) + " " + py(234) + " L " + px(0) + " " + py(234) + " L " + px(0) + " " + py(174) + " L " + px(31.5) + " " + py(174) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<rect x="' + px(32) + '" y="' + py(162) + '" width="22" height="12" rx="2" fill="#f7ecd9" stroke="#9a5b06" stroke-width="0.9"/>' +
      '<text x="' + (px(32) + 11) + '" y="' + (py(162) + 8) + '" text-anchor="middle" font-size="4.9" font-weight="800" fill="#9a5b06">6"HD</text>' +
      '<text x="' + px(88) + '" y="' + py(166) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Cocina" : "Kitchen") + "</text>" +
      '<text x="' + px(88) + '" y="' + py(178) + '" text-anchor="middle" font-size="6.1" fill="#9a5b06">' + (es ? "(Campana aparte)" : "(Hood separate)") + "</text>" +

      // West Rear-Yard Setback Label (for Sidewall Exit Option)
      '<text x="' + px(70) + '" y="' + py(256) + '" text-anchor="middle" font-size="5.8" font-weight="700" fill="#2f6b3f">' +
        (es ? "← Patio Trasero Oeste (≥4' libre)" : "← West Rear Yard (≥4' clear)") + "</text>" +

      // Hallway + Door 4 Foyer
      '<path d="M ' + px(147) + " " + py(58) + " L " + px(207) + " " + py(58) + " L " + px(207) + " " + py(88) + " L " + px(352) + " " + py(88) + " L " + px(352) + " " + py(142) + " L " + px(147) + " " + py(142) + ' Z" fill="#f4f5f3" stroke="#5d686d" stroke-width="1.4"/>' +
      '<line x1="' + px(160) + '" y1="' + py(58) + '" x2="' + px(194) + '" y2="' + py(58) + '" stroke="#1f5f7a" stroke-width="3.2"/>' +
      '<line x1="' + px(147) + '" y1="' + py(68) + '" x2="' + px(147) + '" y2="' + py(100) + '" stroke="#f4f5f3" stroke-width="3.2"/>' +
      '<line x1="' + px(147) + '" y1="' + py(68) + '" x2="' + px(177) + '" y2="' + py(68) + '" stroke="#1f5f7a" stroke-width="2.1"/>' +
      '<path d="M ' + px(177) + " " + py(68) + " A " + +(30 * SC).toFixed(1) + " " + +(30 * SC).toFixed(1) + " 0 0 1 " + px(147) + " " + py(98) + '" fill="none" stroke="#1f5f7a" stroke-width="1.2" stroke-dasharray="3 2"/>' +
      '<text x="' + px(164) + '" y="' + py(85) + '" font-size="6.1" font-weight="800" fill="#1f5f7a">' + (es ? "Pta 4→" : "Front 4→") + "</text>" +
      '<text x="' + px(216) + '" y="' + py(137) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#5d686d">' + (es ? "Pasillo" : "Hall") + "</text>" +

      // Bath, Laundry, Bedroom
      '<rect x="' + px(207) + '" y="' + py(0) + '" width="' + +(72.1 * SC).toFixed(1) + '" height="' + +(88 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<text x="' + px(243) + '" y="' + py(44) + '" text-anchor="middle" font-size="7.4" font-weight="700" fill="#5d686d">' + (es ? "Baño" : "Bath") + "</text>" +
      '<rect x="' + px(279.1) + '" y="' + py(5.4) + '" width="' + +(36.3 * SC).toFixed(1) + '" height="' + +(82.6 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<text x="' + px(297.2) + '" y="' + py(46) + '" text-anchor="middle" font-size="6.2" font-weight="700" fill="#5d686d">' + (es ? "Lav." : "Ldry") + "</text>" +
      '<path d="M ' + px(315.4) + " " + py(0) + " L " + px(437.5) + " " + py(0) + " L " + px(474) + " " + py(34) + " L " + px(474) + " " + py(96) + " L " + px(437.5) + " " + py(136) + " L " + px(352) + " " + py(136) + " L " + px(352) + " " + py(88) + " L " + px(315.4) + " " + py(88) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<text x="' + px(396) + '" y="' + py(52) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Recámara" : "Bedroom") + "</text>" +

      // Dining Room & Living Room South
      '<rect x="' + px(147) + '" y="' + py(142) + '" width="' + +(146.7 * SC).toFixed(1) + '" height="' + +(155.75 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<text x="' + px(236) + '" y="' + py(166) + '" text-anchor="middle" font-size="7.8" font-weight="700" fill="#5d686d">' + (es ? "Comedor" : "Dining") + "</text>" +
      '<path d="M ' + px(293.7) + " " + py(142) + " L " + px(473.5) + " " + py(142) + " L " + px(508) + " " + py(178) + " L " + px(508) + " " + py(258) + " L " + px(473.5) + " " + py(297.75) + " L " + px(293.7) + " " + py(297.75) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<line x1="' + px(293.7) + '" y1="' + py(178) + '" x2="' + px(293.7) + '" y2="' + py(246) + '" stroke="#fbfcfb" stroke-width="3.2"/>' +
      '<line x1="' + px(293.7) + '" y1="' + py(178) + '" x2="' + px(293.7) + '" y2="' + py(246) + '" stroke="#98a4a8" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="' + px(400) + '" y="' + py(222) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Sala" : "Living Room") + "</text>" +

      // MEP Landmarks: E1/P Subpanel & G1 Gas Riser
      '<rect x="' + (px(147) + 2) + '" y="' + (py(206) - 6) + '" width="22" height="12" rx="2" fill="#ecedea" stroke="#5d686d" stroke-width="0.9"/>' +
      '<text x="' + (px(147) + 13) + '" y="' + (py(206) + 2.5) + '" text-anchor="middle" font-size="5.6" font-weight="700" fill="#5d686d">E1/P</text>' +
      '<rect x="' + (px(384) - 18) + '" y="' + (py(290) - 6) + '" width="36" height="11" rx="2" fill="#f7ecd9" stroke="#9a5b06" stroke-width="0.9"/>' +
      '<text x="' + px(384) + '" y="' + (py(290) + 2) + '" text-anchor="middle" font-size="5.6" font-weight="700" fill="#9a5b06">G1 Gas</text>' +

      // Active 24"x36" Attic Hatch
      '<rect id="hvacHatchRect" x="' + px(hBox.x - hBox.w / 2) + '" y="' + py(hBox.y - hBox.h / 2) + '" width="' + +(hBox.w * SC).toFixed(1) + '" height="' + +(hBox.h * SC).toFixed(1) + '" rx="2" fill="' + (m.ducts.hatchBlocked ? "#f9e6e4" : "#f7ecd9") + '" stroke="' + (m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06") + '" stroke-width="1.8" stroke-dasharray="4 2"/>' +
      '<text x="' + px(hBox.x) + '" y="' + (py(hBox.y) - 2) + '" text-anchor="middle" font-size="6.1" font-weight="800" fill="' + (m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06") + '">24"×36"</text>' +
      '<text x="' + px(hBox.x) + '" y="' + (py(hBox.y) + 6) + '" text-anchor="middle" font-size="5.3" font-weight="700" fill="' + (m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06") + '">' + (es ? "Escotilla" : "Hatch") + "</text>" +

      // 30" Unobstructed Passage Halo + 24" Solid Continuous Walkway (CMC 304.4)
      '<path id="hvacWalkHalo" d="' + m.walkD + '" fill="none" stroke="' + walkCol + '" stroke-width="' + +(30 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.12"/>' +
      '<path id="hvacWalkBg" d="' + m.walkD + '" fill="none" stroke="' + walkCol + '" stroke-width="' + +(24 * SC).toFixed(1) + '" stroke-linejoin="round" opacity="0.26"/>' +
      '<path id="hvacWalkLn" d="' + m.walkD + '" fill="none" stroke="' + walkCol + '" stroke-width="1.9" stroke-dasharray="4 3"/>' +

      // Dynamic Manual D Ducts + Sidewall Flue Layer
      '<g id="hvacDynamicDuctsLayer">' + buildDynamicDuctsLayerHtml(m) + "</g>" +

      // DRAGGABLE SUPPLY VENTS S1, S2, S3
      '<g id="hvacDragS1" class="u4-drag-move" data-node="s1" tabindex="0" role="application" aria-label="Drag S1 kitchen threshold supply" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (s1x - 24) + '" y="' + (s1y - 8) + '" width="48" height="16" rx="4" fill="#1f5f7a" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + s1x + '" y="' + (s1y + 2.6) + '" text-anchor="middle" font-size="6.6" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "S1 Coc." : "S1 Kit") + "</text>" +
      "</g>" +
      '<g id="hvacDragS2" class="u4-drag-move" data-node="s2" tabindex="0" role="application" aria-label="Drag S2 living/dining pocket supply" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (s2x - 24) + '" y="' + (s2y - 8) + '" width="48" height="16" rx="4" fill="#1f5f7a" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + s2x + '" y="' + (s2y + 2.6) + '" text-anchor="middle" font-size="6.6" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "S2 Sala" : "S2 Liv") + "</text>" +
      "</g>" +
      '<g id="hvacDragS3" class="u4-drag-move" data-node="s3" tabindex="0" role="application" aria-label="Drag S3 bedroom SW supply" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (s3x - 25) + '" y="' + (s3y - 8) + '" width="50" height="16" rx="4" fill="#1f5f7a" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + s3x + '" y="' + (s3y + 2.6) + '" text-anchor="middle" font-size="6.6" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "S3 Rec." : "S3 Bed") + "</text>" +
      "</g>" +

      // DRAGGABLE RETURN R1
      '<g id="hvacDragR1" class="u4-drag-move" data-node="r1" tabindex="0" role="application" aria-label="Drag R1 hall return" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (r1x - 26) + '" y="' + (r1y - 8) + '" width="52" height="16" rx="4" fill="#0f766e" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + r1x + '" y="' + (r1y + 2.6) + '" text-anchor="middle" font-size="6.6" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "R1 Ret." : "R1 Ret") + "</text>" +
      "</g>" +

      // DRAGGABLE JUMP DUCT JD-1
      '<g id="hvacDragJD1" class="u4-drag-move" data-node="jd1" tabindex="0" role="application" aria-label="Drag JD-1 bedroom-hall acoustic jump duct" transform="translate(0, 0)">' +
        '<path d="M ' + (jdx - 13) + " " + (jdy + 7) + " C " + (jdx - 14) + " " + (jdy - 14) + ", " + (jdx + 14) + " " + (jdy - 16) + ", " + (jdx + 13) + " " + (jdy - 3) + '" fill="none" stroke="#6d28d9" stroke-width="2.6" stroke-dasharray="3 2"/>' +
        '<circle cx="' + (jdx - 13) + '" cy="' + (jdy + 7) + '" r="3.2" fill="#ede9fe" stroke="#6d28d9" stroke-width="1.2"/>' +
        '<circle cx="' + (jdx + 13) + '" cy="' + (jdy - 3) + '" r="3.2" fill="#ede9fe" stroke="#6d28d9" stroke-width="1.2"/>' +
        '<rect class="u4-drag-grip" x="' + (jdx - 19) + '" y="' + (jdy - 9) + '" width="38" height="13" rx="3.5" fill="#6d28d9" stroke="#ffffff" stroke-width="1.1"/>' +
        '<text x="' + jdx + '" y="' + (jdy + 0) + '" text-anchor="middle" font-size="5.9" font-weight="800" fill="#ffffff" pointer-events="none">JD-1</text>' +
      "</g>" +

      // DRAGGABLE HORIZONTAL FURNACE F1 + NORTH 30"x30" PLATFORM (Reconciled SW Dining X=174", Y=258")
      '<g id="hvacDragFurnace" class="u4-drag-move" data-node="f1" tabindex="0" role="application" aria-label="Drag F1 horizontal furnace and 30x30 platform" transform="translate(0, 0)">' +
        '<rect x="' + (f1x - pS / 2).toFixed(1) + '" y="' + (f1y - fH / 2 - pS).toFixed(1) + '" width="' + pS + '" height="' + pS + '" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.6" stroke-dasharray="3 2"/>' +
        '<text x="' + f1x + '" y="' + (f1y - fH / 2 - pS / 2 + 2.5).toFixed(1) + '" text-anchor="middle" font-size="5.9" font-weight="800" fill="#2f6b3f" pointer-events="none">30"×30" N</text>' +
        '<rect x="' + retBoxX.toFixed(1) + '" y="' + (f1y - 8).toFixed(1) + '" width="' + retPlenW + '" height="16" rx="2" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.4"/>' +
        '<text x="' + (retBoxX + retPlenW / 2).toFixed(1) + '" y="' + (f1y + 2.2).toFixed(1) + '" text-anchor="middle" font-size="4.9" font-weight="800" fill="#0f766e" pointer-events="none">RET</text>' +
        '<rect x="' + supBoxX.toFixed(1) + '" y="' + (f1y - 8.5).toFixed(1) + '" width="' + supPlenW + '" height="17" rx="2" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.5"/>' +
        '<text x="' + (supBoxX + supPlenW / 2).toFixed(1) + '" y="' + (f1y + 2.2).toFixed(1) + '" text-anchor="middle" font-size="5.3" font-weight="800" fill="#1f5f7a" pointer-events="none">SUP</text>' +
        '<rect class="u4-drag-grip" x="' + (f1x - fW / 2).toFixed(1) + '" y="' + (f1y - fH / 2).toFixed(1) + '" width="' + fW + '" height="' + fH + '" rx="3.5" fill="#1d2326" stroke="#7cc0dc" stroke-width="1.8"/>' +
        '<text x="' + f1x + '" y="' + (f1y - 2) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff" pointer-events="none">F1 ' + (dir > 0 ? "→" : "←") + "</text>" +
        '<text x="' + f1x + '" y="' + (f1y + 7.2) + '" text-anchor="middle" font-size="5.5" font-weight="700" fill="#7cc0dc" pointer-events="none">45k BTU</text>' +
      "</g>" +

      // Bottom Live Summary Bar
      '<rect id="hvacSvgPill" x="14" y="303" width="472" height="20" rx="5" fill="' + walkFill + '" stroke="' + walkCol + '" stroke-width="1"/>' +
      '<text id="hvacSvgPillTxt" x="250" y="316" text-anchor="middle" font-size="7.1" font-weight="700" fill="' + walkCol + '">' +
        (es ? "Pasillo 24\": " + m.walkFt + "'/20' (" + (m.walkPass ? "PASA ✓" : "EXCEDE ✗") + " · " + m.sheets + " hojas) · V1 Lat: " + m.flue.runFt + "' (+" + m.flue.minRiseIn + "\") · SA " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "' · RA1 " + m.ra1Ft + "'"
            : "24\" Path: " + m.walkFt + "'/20' (" + (m.walkPass ? "PASS ✓" : "OVER ✗") + " · " + m.sheets + " shts) · Sidewall V1: " + m.flue.runFt + "' (+" + m.flue.minRiseIn + "\" rise) · SA " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "' · RA1 " + m.ra1Ft + "'") +
      "</text>" +
      '<text x="250" y="335" text-anchor="middle" font-size="6.2" font-weight="600" fill="#5d686d">' +
        (es ? 'Techo plano (cero cortes en techo) · Salida lateral exige extractor listado (SFMC §802.8 ≥4\' a colindancia) o 95%+ PVC'
            : 'Flat roof (zero roof cuts) · Sidewall exit requires listed power venter (SFMC §802.8 ≥4\' lot line) or 95%+ PVC direct-vent') +
      "</text>" +
    "</svg>";
  }

  // Step 2 SVG: TRUE FLAT-ROOF VERTICAL SECTION + HORIZONTAL SIDEWALL FLUE EXIT (Fixes Pin u4-auto-1795396857428!)
  function renderSectionSvg(m, es) {
    var fl = m.flue;
    var isFail = fl.gravityIllegal;
    var isPvc = state.ventMode === "cat4_pvc";
    var ventStroke = isFail ? "#a8281c" : (isPvc ? "#1f5f7a" : "#9a5b06");
    var ventFill = isFail ? "#f9e6e4" : (isPvc ? "#e3eef2" : "#f7ecd9");
    var wallLbl = fl.effectiveWall === "west"
      ? (es ? "MURO EXTERIOR OESTE (PATIO ≥4')" : "WEST REAR-YARD WALL (≥4' CLEAR)")
      : (es ? "MURO EXTERIOR SUR (VERIFICAR ≥4' COLINDANCIA)" : "SOUTH EXTERIOR WALL (VERIFY ≥4' LOT LINE)");

    return '<svg viewBox="0 0 470 232" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Corte vertical de techo plano 66 pulgadas con salida lateral de gases según SFMC 802.8" : "Flat-roof 66-inch vertical section with sidewall flue exit per SFMC 802.8") + '">' +
      '<text x="235" y="16" text-anchor="middle" font-size="9.0" font-weight="800" fill="#1f5f7a">' +
        (es ? 'CORTE DE TECHO PLANO (66" LIBRE) + SALIDA HORIZONTAL EN MURO LATERAL'
            : 'FLAT-ROOF ATTIC SECTION (66" CLEAR) + SIDEWALL EXHAUST EXIT') + "</text>" +

      // FLAT / LOW-SLOPE ROOF ASSEMBLY (Zero Pitched Ridge!)
      '<rect x="28" y="26" width="380" height="9" fill="#475569" stroke="#1d2326" stroke-width="1.4"/>' +
      '<rect x="28" y="35" width="380" height="12" fill="#e2e8f0" stroke="#475569" stroke-width="1.1"/>' +
      '<text x="218" y="32.8" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff">' +
        (es ? "MEMBRANA DE TECHO PLANO · CERO PENETRACIONES NUEVAS EN TECHO (GOTERA EN REPARACIÓN)"
            : "FLAT ROOF MEMBRANE · ZERO NEW ROOF PENETRATIONS (ACTIVE LEAK HOLD)") + "</text>" +

      // Attic Side Walls (Left = Exterior Sidewall Exit; Right = Interior Attic)
      '<rect x="28" y="47" width="12" height="127" fill="#cbd5e1" stroke="#1d2326" stroke-width="1.5"/>' +
      '<rect x="40" y="47" width="368" height="127" fill="#fbfcfb" stroke="#98a4a8" stroke-width="1"/>' +

      // Ceiling Joists & Floor Deck at Y=174
      '<rect x="28" y="174" width="380" height="12" fill="#fde68a" stroke="#7c4d12" stroke-width="1.4"/>' +
      '<text x="286" y="182.5" text-anchor="middle" font-size="6.6" font-weight="700" fill="#7c4d12">' +
        (es ? 'Vigas de plafón + Pasillo continuo 24" (OSB 23/32" · ' + m.walkFt + ' pies ≤ 20 pies)'
            : 'Ceiling joists + Continuous 24" OSB pathway (' + m.walkFt + ' ft ≤ 20 ft cap)') + "</text>" +

      // 66" Confirmed Clear Attic Height Callout (Right side)
      '<line x1="378" y1="47" x2="378" y2="174" stroke="#1f5f7a" stroke-width="1.5" stroke-dasharray="3 2"/>' +
      '<rect x="318" y="98" width="118" height="20" rx="4" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1"/>' +
      '<text x="377" y="111" text-anchor="middle" font-size="7.6" font-weight="800" fill="#1f5f7a">' +
        (es ? '66" (5\'-6") libre plano' : '66" (5\'-6") flat cavity') + "</text>" +

      // 24"x36" Hatch & Continuous 24" Pathway on Right -> 30"x30" Platform + Horizontal F1 Cabinet (14.19" high laid horizontally!)
      '<rect x="320" y="172" width="46" height="15" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.5" stroke-dasharray="3 2"/>' +
      '<text x="343" y="198" text-anchor="middle" font-size="6.8" font-weight="800" fill="#1f5f7a">' + (es ? 'Escotilla 24"×36"' : '24"×36" Hatch') + "</text>" +

      // 30"x30" Solid Platform + Horizontal Carrier/Bryant F1 (14-3/16" H horizontal profile x 29" D)
      '<rect x="176" y="167" width="112" height="7" fill="#2f6b3f"/>' +
      '<rect x="192" y="133" width="84" height="34" rx="3" fill="#1d2326" stroke="#7cc0dc" stroke-width="1.6"/>' +
      '<text x="234" y="148" text-anchor="middle" font-size="7.6" font-weight="800" fill="#ffffff">F1 · 45k BTU</text>' +
      '<text x="234" y="159" text-anchor="middle" font-size="6.5" font-weight="700" fill="#7cc0dc">' + (es ? 'Horizontal 14-3/16" alto' : 'Horizontal 14-3/16" H') + "</text>" +

      // SLOPED HORIZONTAL FLUE EXITING OUT EXTERIOR SIDEWALL (Left X=28, sloping UP >= 1/4" per ft toward exterior!)
      '<path d="M 192 144 L 166 122 L 22 106" fill="none" stroke="' + ventStroke + '" stroke-width="7" stroke-linecap="round" opacity="0.28"/>' +
      '<path d="M 192 144 L 166 122 L 22 106" fill="none" stroke="' + ventStroke + '" stroke-width="2.4" stroke-linecap="round"/>' +
      // Metal support straps <= 5 ft o.c. from flat roof joists
      '<line x1="94" y1="47" x2="94" y2="114" stroke="#5d686d" stroke-width="1.2" stroke-dasharray="2 2"/>' +
      '<line x1="152" y1="47" x2="152" y2="120" stroke="#5d686d" stroke-width="1.2" stroke-dasharray="2 2"/>' +

      // Exterior Sidewall Termination Hood / Power Venter Box on Left Exterior Face (X=10..28, Y=95..118)
      '<rect x="8" y="94" width="22" height="24" rx="3" fill="' + ventFill + '" stroke="' + ventStroke + '" stroke-width="1.8"/>' +
      '<text x="19" y="109" text-anchor="middle" font-size="6.8" font-weight="800" fill="' + ventStroke + '">' +
        (isFail ? "✗" : (isPvc ? "PVC" : "FAN")) + "</text>" +

      // Flue Pitch & Code Callout Box inside Attic
      '<rect x="50" y="56" width="246" height="44" rx="4" fill="' + ventFill + '" stroke="' + ventStroke + '" stroke-width="1.2"/>' +
      '<text x="58" y="69" font-size="7.2" font-weight="800" fill="' + ventStroke + '">' + esc(wallLbl) + "</text>" +
      '<text x="58" y="80" font-size="6.7" font-weight="700" fill="#1d2326">' +
        esc(isFail
          ? (es ? "PROHIBIDO: 80% AFUE NO puede salir horizontal sin extractor (Manual p.22)" : "PROHIBITED: 80% AFUE cannot gravity-vent out sidewall (Manual p.22)")
          : isPvc
            ? (es ? 'Opción B: 95%+ AFUE Categoría IV PVC sellado + drenaje condensado' : 'Option B: 95%+ AFUE Cat IV sealed PVC sidewall + condensate trap')
            : (es ? 'Opción A: Extractor lateral listado + pendiente ≥1/4"/pie (' + fl.runFt + "' → +" + fl.minRiseIn + '")' : 'Option A: Listed power venter + ≥1/4"/ft upward slope (' + fl.runFt + "' → +" + fl.minRiseIn + '")')) +
      "</text>" +
      '<text x="58" y="92" font-size="6.4" font-weight="700" fill="#5d686d">' +
        (es ? 'SFMC §802.8: ≥4\' a colindancia · ≥4\' horiz/abajo (o ≥1\' arriba) de ventanas · soportes ≤5\''
            : '2025 SFMC §802.8: ≥4\' lot line · ≥4\' horiz/below (or ≥1\' above) windows · straps ≤5\'') +
      "</text>" +

      // Bottom Caption
      '<text x="235" y="218" text-anchor="middle" font-size="7.5" font-weight="700" fill="#2f6b3f">' +
        (es ? 'Plataforma sólida 30"×30" Norte + GFCI 120V (≤25\') + Luz LED con apagador · SIN gomas de John (las trae NEXT)'
            : 'Solid 30"×30" North platform + live 120V GFCI (≤25\') + switched LED light · NO pads from John (NEXT supplies)') +
      "</text>" +
    "</svg>";
  }

  function renderEquip(m, es) {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="hvacEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "🔧 Equipo, código y suministros " : "🔧 Code Requirements & Scope Split ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="hvacEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Alcance de John / Cuadrilla (CMC 304.4)" : "John / Crew Scope (2025 CMC 304.4)") + "</h4>" +
            "<ul>" +
              "<li>" + m.sheets + (es ? ' hojas 4×8 OSB 23/32" o triplay 3/4" para pasillo continuo 24" (' + m.walkFt + " pies ≤ 20 pies; paso libre 30\"; NUNCA 3/8\")" : ' sheets 4×8 of 23/32" OSB or 3/4" ply for continuous 24" pathway (' + m.walkFt + " ft ≤ 20 ft cap; 30\" clear; NEVER 3/8\")") + "</li>" +
              "<li>" + (es ? 'Plataforma nivelada 30"×30" frente Norte en Comedor SO (SIN gomas antivibración — las trae NEXT)' : 'Level 30"×30" solid North platform in SW Dining (do NOT buy vibration pads — NEXT supplies)') + "</li>" +
              "<li>" + (es ? "Luz LED cerrada con apagador al acceso + GFCI 120V en lado línea (≤25 pies) + reparar gotera techo plano" : "Entrance-switched enclosed LED light + line-side 120V GFCI (≤25 ft) + repair active flat-roof leak") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Alcance NEXT HVAC (Calefacción y Salida Lateral)" : "NEXT HVAC Scope (Heating & Sidewall Vent)") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? "Opción A: Carrier/Bryant 45k BTU 80% AFUE + extractor lateral mecánico listado (NFPA 54 §12.4.3 / SFMC §802.8 ≥4 pies colindancia)" : "Option A: Carrier/Bryant 45k BTU 80% AFUE + listed sidewall power venter (NFPA 54 §12.4.3 / SFMC §802.8 ≥4 ft lot line)") + "</li>" +
              "<li>" + (es ? "Opción B (confirmar lun 23): Cambiar a 95%+ AFUE Categoría IV PVC lateral o bomba de calor ductada (cero humo)" : "Option B (confirm Mon Nov 23): Switch to 95%+ AFUE Cat IV PVC sidewall furnace or ducted heat-pump air handler") + "</li>" +
              "<li><strong>" + (es ? "NO incluye campana de cocina:" : "Does NOT include kitchen range hood:") + "</strong> " + (es ? "la campana Savona usa su propio ducto dedicado de 6\"." : "Zephyr Savona hood uses its own dedicated 6\" duct.") + "</li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function buildAlertsHtml(m, es) {
    var list = m.ducts.alerts || [];
    if (!list.length) {
      return '<div class="u4h-status is-pass" style="margin-bottom:10px">' +
        (es ? "✓ Ruta y código limpios: pasillo 24\" cumple ≤20 pies, salida lateral listada con ≥4 pies a colindancia, sin cortocircuitos y escotilla libre."
            : "✓ Routing & code clear: 24\" pathway ≤20 ft, listed sidewall exit w/ ≥4 ft lot-line clearance, zero short-circuits, and Door 4 hatch clear.") +
      "</div>";
    }
    return list.map(function (a) {
      return '<div class="u4h-status ' + (a.sev === "fail" ? "is-fail" : "is-warn") + '" style="margin-bottom:8px">' +
        esc(es ? a.es : a.en) +
      "</div>";
    }).join("");
  }

  function wireAllNodeDrags() {
    var svg = document.getElementById("hvacHumanSvg");
    if (!svg) return;
    var es = isEs();

    var BOUNDS = {
      f1:  { minX: 162, maxX: 430, minY: 118, maxY: 274 },
      r1:  { minX: 156, maxX: 380, minY: 68,  maxY: 266 },
      s1:  { minX: 54,  maxX: 310, minY: 72,  maxY: 272 },
      s2:  { minX: 160, maxX: 468, minY: 148, maxY: 278 },
      s3:  { minX: 318, maxX: 454, minY: 24,  maxY: 132 },
      jd1: { minX: 280, maxX: 400, minY: 54,  maxY: 134 }
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
      if (bg)   { bg.setAttribute("d", m.walkD);   bg.setAttribute("stroke", walkCol); }
      if (ln)   { ln.setAttribute("d", m.walkD);   ln.setAttribute("stroke", walkCol); }

      var pill = document.getElementById("hvacSvgPill");
      var ptxt = document.getElementById("hvacSvgPillTxt");
      if (pill) { pill.setAttribute("fill", walkFill); pill.setAttribute("stroke", walkCol); }
      if (ptxt) {
        ptxt.setAttribute("fill", walkCol);
        ptxt.textContent = es
          ? "Pasillo 24\": " + m.walkFt + "'/20' (" + (m.walkPass ? "PASA ✓" : "EXCEDE ✗") + " · " + m.sheets + " hojas) · V1 Lat: " + m.flue.runFt + "' (+" + m.flue.minRiseIn + "\") · SA " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "' · RA1 " + m.ra1Ft + "'"
          : "24\" Path: " + m.walkFt + "'/20' (" + (m.walkPass ? "PASS ✓" : "OVER ✗") + " · " + m.sheets + " shts) · Sidewall V1: " + m.flue.runFt + "' (+" + m.flue.minRiseIn + "\" rise) · SA " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "' · RA1 " + m.ra1Ft + "'";
      }

      var kpiWalk = document.getElementById("hvacKpiWalkVal");
      if (kpiWalk) {
        kpiWalk.className = "u4h-kpi-val " + (m.walkPass ? "is-ok" : "is-fail");
        kpiWalk.textContent = m.walkFt + (es ? " pies / 20" : " ft / 20 ft");
      }
      var kpiSheets = document.getElementById("hvacKpiSheetsSub");
      if (kpiSheets) kpiSheets.textContent = m.sheets + (es ? " hojas 4×8 (30\" libre)" : " shts 4×8 (30\" clear)");
      var kpiRuns = document.getElementById("hvacKpiRunsVal");
      if (kpiRuns) kpiRuns.textContent = "SA " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "'";
      var kpiRunsSub = document.getElementById("hvacKpiRunsSub");
      if (kpiRunsSub) kpiRunsSub.textContent = "RA1 " + m.ra1Ft + "' · F1 (" + state.nodes.f1.x + "\"," + state.nodes.f1.y + "\")";
      var kpiVent = document.getElementById("hvacKpiVentSub");
      if (kpiVent) kpiVent.textContent = "V1 " + m.flue.runFt + "' (+" + m.flue.minRiseIn + "\" pitch)";

      var alertHost = document.getElementById("hvacAlertsHost");
      if (alertHost) alertHost.innerHTML = buildAlertsHtml(m, es);

      var st = document.getElementById("hvacStatusBanner");
      if (st) {
        var allOk = m.walkPass && !m.flue.gravityIllegal;
        st.className = "u4h-status " + (allOk ? "is-pass" : "is-fail");
        st.textContent = !m.walkPass
          ? (es ? "✗ PASILLO EXCEDE 20 PIES (" + m.walkFt + " pies) — Con 66\" de altura libre (CMC 304.4.1), acerca F1 hacia Comedor SO."
                : "✗ PATHWAY OVER 20 FT CAP (" + m.walkFt + " ft) — At 66\" flat-roof attic height (CMC 304.4.1), move F1 closer toward SW Dining.")
          : m.flue.gravityIllegal
            ? (es ? "✗ SALIDA LATERAL POR GRAVEDAD PROHIBIDA — Selecciona Extractor Lateral Listado (Opción A) o 95%+ PVC (Opción B)."
                  : "✗ UNASSISTED GRAVITY SIDEWALL VENT PROHIBITED — Select Listed Power Venter (Option A) or 95%+ PVC Direct-Vent (Option B).")
            : (es ? "✓ PASA — Pasillo 24\": " + m.walkFt + " pies (≤20 pies, " + m.sheets + " hojas 4×8) · Salida lateral V1: " + m.flue.runFt + " pies (+" + m.flue.minRiseIn + "\" pendiente ≥1/4\"/pie)."
                  : "✓ PASS — 24\" Pathway: " + m.walkFt + " ft (≤20 ft cap, " + m.sheets + " sheets 4×8) · Sidewall V1: " + m.flue.runFt + " ft (+" + m.flue.minRiseIn + "\" rise at ≥1/4\"/ft).");
      }

      var syncLnk = document.getElementById("hvacOpenSyncedAtticLink");
      if (syncLnk) syncLnk.setAttribute("href", syncedAtticHref());
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
          var svgY = ((e.clientY - rect.top) / (rect.height || 344)) * 344;
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
        if (ev.key === "ArrowLeft")  { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x - step, cur.y); syncBlueprintHiddenState(); }
        if (ev.key === "ArrowRight") { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x + step, cur.y); syncBlueprintHiddenState(); }
        if (ev.key === "ArrowUp")    { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x, cur.y - step); syncBlueprintHiddenState(); }
        if (ev.key === "ArrowDown")  { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x, cur.y + step); syncBlueprintHiddenState(); }
      });
    });
  }

  function ventControlsHtml(es) {
    return '<div class="u4h-ctrl-row">' +
        '<span class="u4h-ctrl-lbl">' + (es ? "Salida lateral de gases (Techo plano):" : "Sidewall flue mode (Flat roof):") + "</span>" +
        '<div class="u4h-pill-group">' +
          '<button type="button" class="u4h-pill' + (state.ventMode === "power_venter" ? " is-active" : "") + '" data-vmode="power_venter">' + (es ? "Opción A: 80% + Extractor Lateral Listado" : "Option A: 80% + Listed Power Venter") + "</button>" +
          '<button type="button" class="u4h-pill' + (state.ventMode === "cat4_pvc" ? " is-active" : "") + '" data-vmode="cat4_pvc">' + (es ? "Opción B: 95%+ PVC Tiro Directo / Bomba Calor" : "Option B: 95%+ PVC Direct-Vent / Heat Pump") + "</button>" +
          '<button type="button" class="u4h-pill' + (state.ventMode === "gravity_unassisted" ? " is-active" : "") + '" data-vmode="gravity_unassisted">' + (es ? "80% Sin Extractor (FALLA CÓDIGO)" : "Unassisted 80% Gravity (CODE FAIL)") + "</button>" +
        "</div>" +
      "</div>" +
      '<div class="u4h-ctrl-row">' +
        '<span class="u4h-ctrl-lbl">' + (es ? "Muro exterior de descarga (SFMC §802.8 ≥4'):" : "Sidewall exit face (SFMC §802.8 ≥4' lot line):") + "</span>" +
        '<div class="u4h-pill-group">' +
          '<button type="button" class="u4h-pill' + (state.exitWall === "south" ? " is-active" : "") + '" data-ewall="south">' + (es ? "Muro Sur (Confirmar ≥4' colindancia)" : "South Wall (Verify ≥4' Lot Line)") + "</button>" +
          '<button type="button" class="u4h-pill' + (state.exitWall === "west" ? " is-active" : "") + '" data-ewall="west">' + (es ? "Muro Oeste Patio Trasero (≥4' libre)" : "West Rear-Yard Wall (≥4' Clear)") + "</button>" +
        "</div>" +
      "</div>";
  }


  function renderHatchStep(m, es) {
    var hatchLabel = state.hatchLocation === "hall"
      ? (es ? "Pasillo Interior (Referencia)" : "Interior Hallway (Reference)")
      : (es ? "Descanso Puerta 4 Exterior (Seleccionado)" : "Exterior Door 4 Landing (Selected)");
    return (
      '<div class="u4h-grid-2" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px">' +
        '<div class="u4h-info-box" style="margin:0">' +
          '<div class="u4h-info-title">' + (es ? 'Escotilla Fija 24" × 36" Libre Terminado y Paso Calefactor' : 'Locked 24" × 36" Finished-Clear Hatch & Furnace Pass') + '</div>' +
          '<p style="margin:6px 0 10px;font-size:0.9rem">' + (es
            ? 'Ubicación activa: <strong>' + esc(hatchLabel) + '</strong>. El calefactor Carrier/Bryant 45k BTU (<strong>33.25" × 14.19" × 29"</strong>) sube de punta (<strong>14.19" × 29"</strong>) con +9.81" y +7.00" de margen total.'
            : 'Active spot: <strong>' + esc(hatchLabel) + '</strong>. The Carrier/Bryant 45k BTU furnace (<strong>33.25" × 14.19" × 29"</strong>) passes end-first (<strong>14.19" × 29"</strong>) with +9.81" across and +7.00" along total margin.') + '</p>' +
          '<svg viewBox="0 0 420 216" width="100%" style="background:#fbfcfa;border:1px solid #cbd5e1;border-radius:6px">' +
            '<rect x="26" y="22" width="368" height="172" rx="4" fill="#f8fafc" stroke="#475569" stroke-width="1.5" stroke-dasharray="5,3"/>' +
            '<text x="210" y="16" text-anchor="middle" font-size="9.2" font-weight="700" fill="#475569">' + (es ? 'Corte propuesto kit madera: 27-1/2" × 39-1/2" (PAUSA hasta verificar fuego y vigas B)' : 'Proposed wood-kit cut: 27-1/2" × 39-1/2" (HOLD until fire rating & joist bay B verified)') + '</text>' +
            '<rect x="58" y="38" width="304" height="140" rx="3" fill="#e8f1fb" stroke="#1f5f7a" stroke-width="2.5"/>' +
            '<text x="210" y="56" text-anchor="middle" font-size="10.2" font-weight="800" fill="#1f5f7a">' + (es ? '24" × 36" LIBRE TERMINADO (NUNCA REDUCIR)' : '24" × 36" FINISHED CLEAR (LOCKED — NEVER SHRINK)') + '</text>' +
            '<rect x="98" y="68" width="224" height="88" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="2"/>' +
            '<text x="210" y="106" text-anchor="middle" font-size="10.2" font-weight="800" fill="#2f6b3f">' + (es ? 'PASO DE PUNTA CALEFACTOR: 14.19" × 29.0" (CUMPLE)' : 'FURNACE END-FIRST PASS: 14.19" × 29.0" (PASS)') + '</text>' +
            '<text x="210" y="124" text-anchor="middle" font-size="8.8" font-weight="700" fill="#1d2326">' + (es ? 'Broches de compresión y tiras 1×2 quedan 100% FUERA del claro 24"×36"' : 'Compression latches & 1×2 ledges stay 100% OUTSIDE 24"×36" clear') + '</text>' +
            '<circle cx="48" cy="76" r="4.5" fill="#9a5b06"/><circle cx="48" cy="140" r="4.5" fill="#9a5b06"/>' +
            '<circle cx="372" cy="76" r="4.5" fill="#9a5b06"/><circle cx="372" cy="140" r="4.5" fill="#9a5b06"/>' +
          '</svg>' +
        '</div>' +
        '<div class="u4h-info-box" style="margin:0">' +
          '<div class="u4h-info-title">' + (es ? '5 Reglas Obligatorias de Sellado y Candados' : '5 Mandatory Hatch Enclosure & Hold Rules') + '</div>' +
          '<ul class="u4h-info-list">' +
            '<li><strong>' + (es ? '1. Revisión cortafuego y claro B primero:' : '1. Ceiling fire-rating & joist bay B check first:') + '</strong> ' + (es ? 'Si el descanso requiere ensamble listado contra fuego, NO aplica el kit de madera de 27-1/2"×39-1/2".' : 'If Door 4 landing requires a listed fire-rated assembly, the 27-1/2"×39-1/2" wood kit does NOT apply.') + '</li>' +
            '<li><strong>' + (es ? '2. Sello continuo y 2 colchonetas:' : '2. Continuous air-seal & 2 unfaced batts:') + '</strong> ' + (es ? 'Cordón respaldo 3/8" + sellador en marco fijo; burlete 1/2"×1/8" en tiras 1×2; junta operable SIN sellador; 2 colchonetas sin papel + 3 lazos alambre cal. 16 + armellas <=1/2".' : '3/8" backer rod + paintable sealant at fixed frame; 1/2"×1/8" closed-cell weatherstrip on 1×2 ledges; uncaulked operable seam; 2 unfaced batts + 3 loose 16-ga wire loops + <=1/2" screw eyes.') + '</li>' +
            '<li><strong>' + (es ? '3. Presa de madera de 4 lados + Pasillo acoplado:' : '3. 4-sided plywood dam + Coupled pathway:') + '</strong> ' + (es ? 'Sobresale 2" arriba del aislante suelto; pasillo acoplado hacia F1 = <strong>' + m.walkFt + ' pies (' + m.sheets + ' hojas pasillo + 1 plataforma/presa)</strong>.' : 'Stands 2" above loose-fill insulation; coupled 24" pathway to F1 = <strong>' + m.walkFt + ' ft (' + m.sheets + ' walkway sheets + 1 platform/dam sheet)</strong>.') + '</li>' +
            '<li><strong>' + (es ? '4. Clóset temporal de recámara ABIERTO:' : '4. Keep temporary bedroom closet OPEN:') + '</strong> ' + (es ? 'No cerrar hasta correr cable LV del apagador Y tener lista la escotilla permanente 24"×36".' : 'Never close until BOTH the LV switch cable is run AND the permanent 24"×36" hatch exists.') + '</li>' +
            '<li><strong>' + (es ? '5. Techo plano sin goteras antes de aislar:' : '5. Flat-roof leak repair before insulating:') + '</strong> ' + (es ? 'Confirmar goteras reparadas y secas antes de cerrar/aislar; conservar moldura Edwardian de 103" y zoclos de 9-1/2".' : 'Confirm active flat-roof leak repair is dry before enclosing/insulating; preserve original 103" picture rail & 9-1/2" baseboards.') + '</li>' +
          '</ul>' +
        '</div>' +
      '</div>'
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
        ? "<strong>PLANO INTEGRADO R3 (RECONCILIADO CON ÁTICO) — LUNES 23 NOV (2–4 PM SERGE Y ALEX):</strong> Techo plano (cero cortes en techo). Plataforma F1 reconciliada en Comedor SO (pasillo 24\" = 15.8' ≤ 20'). Salida lateral exige extractor listado (SFMC §802.8 ≥4' a colindancia) o equipo 95%+ PVC / bomba de calor."
        : "<strong>UNIFIED R3 PLAN (RECONCILED W/ ATTIC HATCH) — MON NOV 23 (2–4 PM SERGE &amp; ALEX):</strong> Flat roof (zero roof cuts). F1 + 30\"×30\" platform reconciled in SW Dining (24\" pathway = 15.8' ≤ 20' cap). Sidewall exit requires listed power venter (SFMC §802.8 ≥4' lot line) or 95%+ PVC / heat pump.";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Unified Attic Hatch, 24\" Pathway, F1 & Reactive Manual D Ducts";
    var titleEs = "Plano Integrado: Escotilla, Pasillo 24\", F1 y Ductos Manual D";
    var subEn = "Reconciled SW Dining F1 (X=174\", Y=258\") — drag any node to update the 24\" pathway, Manual D ducts & sidewall flue live";
    var subEs = "F1 reconciliado en Comedor SO (X=174\", Y=258\") — arrastra cualquier nodo para recalcular pasillo 24\", ductos y salida lateral";
    var inner = "";

    if (state.step === "layout") {
      var ventOk = !m.flue.gravityIllegal;
      var allOk = m.walkPass && ventOk;

      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Pasillo 24\" (CMC 304.4)" : "24\" Pathway (CMC 304.4)") + "</div>" +
            '<div id="hvacKpiWalkVal" class="u4h-kpi-val ' + (m.walkPass ? "is-ok" : "is-fail") + '">' + m.walkFt + (es ? " pies / 20" : " ft / 20 ft") + "</div>" +
            '<div id="hvacKpiSheetsSub" class="u4h-kpi-sub">' + m.sheets + (es ? " hojas 4×8 (30\" libre)" : " shts 4×8 (30\" clear)") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Ramales Manual D" : "Manual D Duct Runs") + "</div>" +
            '<div id="hvacKpiRunsVal" class="u4h-kpi-val is-info">SA ' + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "'</div>" +
            '<div id="hvacKpiRunsSub" class="u4h-kpi-sub">RA1 ' + m.ra1Ft + "' · F1 (" + state.nodes.f1.x + "\"," + state.nodes.f1.y + "\")</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Techo Plano · Salida Lat." : "Flat Roof · Sidewall Exit") + "</div>" +
            '<div class="u4h-kpi-val ' + (ventOk ? "is-ok" : "is-fail") + '">' +
              (m.flue.gravityIllegal ? (es ? "FALLA CÓDIGO" : "CODE FAIL") : (state.ventMode === "cat4_pvc" ? "95%+ PVC" : (es ? "Extractor ≥4'" : "Pwr Vent ≥4'"))) +
            "</div>" +
            '<div id="hvacKpiVentSub" class="u4h-kpi-sub">V1 ' + m.flue.runFt + "' (+" + m.flue.minRiseIn + "\" pitch)</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-hint">' +
          "<span>" + (es ? "✋ Arrastra F1, S1, S2, S3, R1 o JD-1: el pasillo 24\", la troncal Manual D y el escape lateral V1 se recalculan en vivo:" : "✋ Drag F1, S1, S2, S3, R1, or JD-1 — 24\" pathway, Manual D trunk/wyes & sidewall flue V1 dynamically reroute live:") + "</span>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderAtticPlanSvg(m, es) + "</div>" +
        '<div class="u4h-controls">' +
          ventControlsHtml(es) +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Modo de ductos y descarga F1:" : "Duct layout & F1 discharge:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.ductMode === "trunk" ? " is-active" : "") + '" data-dmode="trunk">' + (es ? "Troncal Manual D" : "Trunk & Branch (Manual D)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.ductMode === "radial" ? " is-active" : "") + '" data-dmode="radial">' + (es ? "Radial Wye" : "Radial Wye") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.dischargeDir === "right" ? " is-active" : "") + '" data-ddir="right">' + (es ? "Descarga Este →" : "Discharge East →") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.dischargeDir === "left" ? " is-active" : "") + '" data-ddir="left">' + (es ? "← Descarga Oeste" : "← Discharge West") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Posiciones de prueba F1:" : "F1 position presets:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.activePreset === "reconciled" ? " is-active" : "") + '" data-preset="reconciled">' + (es ? "↺ Comedor SO Reconciliado (15.8')" : "↺ Reconciled SW Dining (15.8')") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.activePreset === "close" ? " is-active" : "") + '" data-preset="close">' + (es ? "Comedor NO (~10.6')" : "NW Dining (~10.6')") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.activePreset === "far" ? " is-active" : "") + '" data-preset="far">' + (es ? "Sala Este (>20' · Falla)" : "Far East (>20' · Fails)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div id="hvacAlertsHost">' + buildAlertsHtml(m, es) + "</div>" +
        '<div id="hvacStatusBanner" class="u4h-status ' + (allOk ? "is-pass" : "is-fail") + '">' +
          (!m.walkPass
            ? (es ? "✗ PASILLO EXCEDE 20 PIES (" + m.walkFt + " pies) — Con 66\" de altura libre (CMC 304.4.1), acerca F1 hacia Comedor SO."
                  : "✗ PATHWAY OVER 20 FT CAP (" + m.walkFt + " ft) — At 66\" flat-roof attic height (CMC 304.4.1), move F1 closer toward SW Dining.")
            : m.flue.gravityIllegal
              ? (es ? "✗ SALIDA LATERAL POR GRAVEDAD PROHIBIDA — Selecciona Extractor Lateral Listado (Opción A) o 95%+ PVC (Opción B)."
                    : "✗ UNASSISTED GRAVITY SIDEWALL VENT PROHIBITED — Select Listed Power Venter (Option A) or 95%+ PVC Direct-Vent (Option B).")
              : (es ? "✓ PASA — Pasillo 24\": " + m.walkFt + " pies (≤20 pies, " + m.sheets + " hojas 4×8) · Salida lateral V1: " + m.flue.runFt + " pies (+" + m.flue.minRiseIn + "\" pendiente ≥1/4\"/pie)."
                    : "✓ PASS — 24\" Pathway: " + m.walkFt + " ft (≤20 ft cap, " + m.sheets + " sheets 4×8) · Sidewall V1: " + m.flue.runFt + " ft (+" + m.flue.minRiseIn + "\" rise at ≥1/4\"/ft).")) +
        "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Requisitos de Código: 2025 CMC / SFMC + Manual Carrier/Bryant + Manual D" : "Code & OEM Requirements: 2025 CMC / SFMC + Carrier Manual + ACCA Manual D") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li><strong>" + (es ? "Pasillo 24\" y Plataforma 30\"×30\" (CMC 304.4):" : "24\" Pathway & 30\"×30\" Platform (2025 CMC 304.4):") + "</strong> " + (es ? "Con 66\" (<6 pies) bajo el techo plano, el pasillo continuo sólido de ≥24\" (OSB 23/32\" o triplay 3/4\", nunca 3/8\") con 30\" libres NO puede exceder 20 pies (actual: " + m.walkFt + " pies en Comedor SO). Incluye plataforma nivelada 30\"×30\", luz LED con apagador al acceso y GFCI 120V en lado línea ≤25 pies (CEC 210.63)." : "At 66\" (<6 ft) flat-roof cavity height, continuous ≥24\" solid wood flooring (23/32\" OSB or 3/4\" ply, never 3/8\") with 30\" clear passage is capped at ≤20 ft (reconciled SW Dining = " + m.walkFt + " ft). Requires level 30\"×30\" service platform, entrance-switched LED light (CMC 304.4.4), and line-side 120V GFCI ≤25 ft (CEC 210.63).") + "</li>" +
            "<li><strong>" + (es ? "Techo Plano y Salida Lateral (Manual II810SA-05 p.22 + SFMC §802.8):" : "Flat Roof & Sidewall Exit (Carrier Manual II810SA-05 p.22 + 2025 SFMC §802.8):") + "</strong> " + (es ? "Cero penetraciones nuevas en techo plano. Un calefactor 80% AFUE Categoría I NO está aprobado para salida horizontal por gravedad; requiere Opción A (extractor mecánico lateral listado enclavado a la válvula de gas, pendiente ≥1/4\"/pie, ≥4 pies a línea de propiedad interior excepto vía pública, ≥3 pies sobre tomas de aire a <10 pies, ≥4 pies horiz/abajo o ≥1 pie arriba de ventanas) u Opción B (equipo 95%+ Categoría IV PVC sellado o bomba de calor)." : "Zero new flat-roof penetrations. An 80% AFUE Category I furnace is NOT approved for unassisted gravity sidewall venting; sidewall exit requires Option A (listed mechanical draft sidewall power venter interlocked to gas valve, ≥1/4\"/ft upward slope, ≥4 ft from interior property line except public way per SFMC §802.8, ≥3 ft above forced-air inlets within 10 ft, ≥4 ft horiz/below or ≥1 ft above operable windows/doors) OR Option B (95%+ AFUE Cat IV sealed PVC direct-vent / ducted heat pump).") + "</li>" +
          "</ul>" +
        "</div>" +
        '<div class="u4h-cta-row" style="margin-top:10px">' +
          '<a id="hvacOpenSyncedAtticLink" class="u4h-nav-link" href="' + esc(syncedAtticHref()) + '">' +
            (es ? "← Ver Plano de Escotilla y Sellado (Posición F1 Sincronizada)" : "← Open Synced Attic Hatch & Enclosure Plan") +
          "</a>" +
        "</div>";

    } else if (state.step === "hatch") {
      titleEn = "Locked 24\" × 36\" Hatch Framing & 5 Enclosure Seals";
      titleEs = "Escotilla Fija 24\" × 36\" y 5 Reglas de Sellado";
      subEn = "Coupled live with SW Dining F1 (" + state.nodes.f1.x + "\"," + state.nodes.f1.y + "\") -> " + m.walkFt + " ft 24\" OSB pathway (" + m.sheets + " walkway sheets + 1 platform/dam)";
      subEs = "Acoplada en vivo con F1 (" + state.nodes.f1.x + "\"," + state.nodes.f1.y + "\") -> pasillo 24\" de " + m.walkFt + " pies (" + m.sheets + " hojas + 1 plataforma/presa)";
      inner = renderHatchStep(m, es);
    } else if (state.step === "section") {
      titleEn = "Flat-Roof 66\" Cavity & Sidewall Exhaust Code Check";
      titleEs = "Cavidad de Techo Plano (66\") y Código de Salida Lateral";
      subEn = "Replaces old pitched ridge diagram — test SFMC §802.8 4-ft lot-line setback & power-venter vs. 95%+ PVC options";
      subEs = "Reemplaza el antiguo techo inclinado — verifica retiro ≥4 pies a colindancia (SFMC §802.8) y opciones de venteo";

      inner =
        '<div class="u4h-svg-wrap">' + renderSectionSvg(m, es) + "</div>" +
        '<div class="u4h-controls">' +
          ventControlsHtml(es) +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Retiro medido Muro Sur a colindancia:" : "South wall setback to lot line:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" class="u4h-pill' + (state.southLotSetbackFt === "unknown" ? " is-active" : "") + '" data-lot="unknown">' + (es ? "Medir Lun 23 (Pendiente)" : "Measure Mon Nov 23 (TBD)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.southLotSetbackFt === "gte4" ? " is-active" : "") + '" data-lot="gte4">' + (es ? "≥ 4 pies libres (Pasa Sur)" : "≥ 4 ft clear (South OK)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.southLotSetbackFt === "lt4" ? " is-active" : "") + '" data-lot="lt4">' + (es ? "< 4 pies (Re-rutea al Oeste)" : "< 4 ft (Auto-routes West)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div id="hvacAlertsHost">' + buildAlertsHtml(m, es) + "</div>" +
        '<div class="u4h-photo-grid">' +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/attic-hatch-candidate.jpg" alt="' + esc(es ? "Foto real descanso exterior afuera de Puerta Principal 4" : "Real exterior landing ceiling photo outside Front Door 4") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Acceso aprobado — Afuera de Puerta Principal 4:" : "Approved access — Outside Front Door 4:") + "</strong> " +
              (es ? 'Escotilla 24"×36" libre terminado en el descanso común deja pasar el gabinete 14-3/16"×29" de punta hacia la ruta de 15.8 pies.' : 'Locked 24"×36" clear hatch on the common landing passes the 14-3/16"×29" furnace end-first onto the 15.8 ft 24" pathway.') +
            "</div>" +
          "</div>" +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/unit4-floorplan-proof.png" alt="' + esc(es ? "Planta de referencia Unidad 4" : "Unit 4 reference floor plan") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Planta completa Unidad 4:" : "Unit 4 full floor plan:") + "</strong> " +
              (es ? "Referencia de los 8 espacios debajo de la cavidad plana de 66\"." : "Reference of all 8 spaces beneath the 66\" flat-roof attic cavity.") +
            "</div>" +
          "</div>" +
        "</div>";

    } else {
      titleEn = "Mon Nov 23 Walkthrough & Code Signoff (Serge & Alex)";
      titleEs = "Visita Lunes 23 Nov y Validación de Código (Serge y Alex)";
      subEn = "Lock equipment venting option, SW Dining platform & electrical subpanel reconciliation before any cuts";
      subEs = "Confirmar opción de salida lateral, plataforma en Comedor SO y subpanel antes de cualquier corte";

      var qs = [
        { k: "q1", en: "1. Lock reconciled SW Dining spot (X=174\", Y=258\") w/ 30\"×30\" North platform & 15.8 ft continuous 24\" pathway (≤20 ft CMC 304.4.1)", es: "1. Confirmar ubicación reconciliada en Comedor SO (X=174\", Y=258\") con plataforma 30\"×30\" Norte y pasillo 24\" de 15.8 pies (≤20 pies)" },
        { k: "q2", en: "2. Flat roof = ZERO new roof penetrations: choose Option A (80% AFUE + listed sidewall power venter) OR Option B (95%+ PVC direct-vent / heat pump)", es: "2. Techo plano = CERO penetraciones en techo: elegir Opción A (80% + extractor lateral listado) u Opción B (95%+ PVC / bomba de calor)" },
        { k: "q3", en: "3. Measure 2025 SFMC §802.8 clearances: ≥4 ft from interior property line (South wall vs West rear-yard wall) & window/inlet offsets", es: "3. Medir retiros SFMC §802.8: ≥4 pies a colindancia interior (Muro Sur vs Muro Oeste patio trasero) y distancia a ventanas" },
        { k: "q4", en: "4. Confirm ≥1/4\"/ft upward flue slope, straps ≤5 ft o.c., ≥24\" rigid supply plenum & 1\" clearance first 36\"", es: "4. Confirmar pendiente ≥1/4\"/pie en escape, soportes ≤5 pies, pleno rígido ≥24\" y 1\" libre en primeros 36\"" },
        { k: "q5", en: "5. Review Manual D trunk sizing, 45° wyes, balancing dampers & S1/S2/S3/R1/JD-1 positions (keep Kitchen 6\" hood separate)", es: "5. Revisar cálculo Manual D, derivaciones 45°, compuertas y S1/S2/S3/R1/JD-1 (campana 6\" de cocina totalmente separada)" },
        { k: "q6", en: "6. Confirm 24\"×36\" hatch markout & ceiling fire-rating outside Front Door 4 + repair active flat-roof leak first", es: "6. Confirmar trazo de escotilla 24\"×36\" y cortafuego afuera de Puerta 4 + reparar gotera activa del techo plano" },
        { k: "q7", en: "7. Reconcile NEXT 80A (#4 Cu) feeder + 125A subpanel vs earlier 100A/onsite Eaton box + line-side 120V GFCI ≤25 ft", es: "7. Reconciliar alimentador NEXT 80A (#4 Cu) + subpanel 125A vs nota de 100A/caja Eaton en obra + GFCI 120V ≤25 pies" }
      ];

      inner =
        '<div class="u4h-item-list">' +
          qs.map(function (q) {
            var done = !!state.qChecks[q.k];
            return '<div class="u4h-item-card' + (done ? " is-selected" : "") + '">' +
              '<label style="display:flex;gap:10px;align-items:center;flex:1;cursor:pointer">' +
                '<input type="checkbox" data-q="' + q.k + '"' + (done ? " checked" : "") + ' style="width:17px;height:17px;accent-color:var(--accent)">' +
                '<span class="u4h-item-name" style="font-size:13.5px">' + esc(es ? q.es : q.en) + "</span>" +
              "</label>" +
            "</div>";
          }).join("") +
        "</div>" +
        '<div class="u4h-cta-row">' +
          '<button type="button" class="u4h-action-btn" id="hvacLogBtn">' + (es ? "📝 Guardar acuerdos de la visita" : "📝 Log walkthrough decisions") + "</button>" +
          '<a class="u4h-nav-link" href="' + esc(syncedAtticHref()) + '">' + (es ? "Abrir Escotilla Ático (Sincronizada) →" : "Open Synced Attic Hatch Plan →") + "</a>" +
        "</div>" +
        renderEquip(m, es);
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
          '<span class="u4h-compass">Flat Roof · CMC 304.4</span>' +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); render(); window.scrollTo(0, 0); });
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
      if (window.U4LiveAi) window.U4LiveAi.openNote("HVAC + Attic Unified R3 walkthrough notes (F1=" + state.nodes.f1.x + "x" + state.nodes.f1.y + "in, walkway=" + m.walkFt + "ft, ventMode=" + state.ventMode + ", exitWall=" + m.flue.effectiveWall + ", SA=" + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "ft): ");
    });
    var pBtn = document.getElementById("hvacPrevBtn");
    var nBtn = document.getElementById("hvacNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });

    document.querySelectorAll('[data-plan-id="attic-hatch"]').forEach(function (a) {
      a.setAttribute("href", syncedAtticHref());
    });

    if (state.step === "layout") wireAllNodeDrags();

    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext();
    }
  }

  window.addEventListener("message", function (ev) {
    var msg = ev && ev.data;
    if (!msg || msg.type !== "u4:attic-hvac-sync" || msg.sourcePlan === "hvac-layout") return;
    if (msg.f1 && isFinite(msg.f1.x) && isFinite(msg.f1.y)) {
      state.nodes.f1 = { x: Math.round(msg.f1.x), y: Math.round(msg.f1.y) };
    }
    if (msg.location === "hall" || msg.location === "door4") state.hatchLocation = msg.location;
    if (msg.ventMode) state.ventMode = msg.ventMode;
    if (msg.exitWall) state.exitWall = msg.exitWall;
    render();
  });

  function applyHvacView(args) {
    args = args || {};
    var changed = false;
    var stepRaw = args.step;
    if (stepRaw != null && stepRaw !== "") {
      var n = Number(stepRaw);
      if (isFinite(n) && n >= 1 && n <= STEPS.length) {
        state.step = STEPS[n - 1].id;
        changed = true;
      } else {
        var s = String(stepRaw).toLowerCase().trim();
        var map = { plan: "layout", attic: "layout", ducts: "layout", height: "section", vent: "section", roof: "section", sidewall: "section", clearance: "section", mon: "walkthrough", checklist: "walkthrough" };
        var id = map[s] || s;
        if (STEPS.some(function (x) { return x.id === id; })) { state.step = id; changed = true; }
      }
    }
    if (changed) render();
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
      } else if (act === "move_node" || state.nodes[act]) {
        var nk = state.nodes[act] ? act : String(args.target || "").toLowerCase();
        if (!state.nodes[nk]) return false;
        var pos = (val && typeof val === "object") ? val : args;
        if (pos.x != null && isFinite(Number(pos.x))) state.nodes[nk].x = Math.max(90, Math.min(440, Number(pos.x)));
        if (pos.y != null && isFinite(Number(pos.y))) state.nodes[nk].y = Math.max(40, Math.min(274, Number(pos.y)));
      } else if (act === "reset") {
        state.nodes = cloneDefaults();
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
        planId: "hvac-layout",
        step: state.step,
        wall: "attic_plan",
        roofGeometry: "flat_roof_66in_cavity",
        ventMode: state.ventMode,
        exitWall: m.flue.effectiveWall,
        ductMode: state.ductMode,
        dischargeDir: state.dischargeDir,
        walkFt: m.walkFt,
        sheets: m.sheets,
        runs: { sa1: m.sa1Ft, sa2: m.sa2Ft, sa3: m.sa3Ft, ra1: m.ra1Ft, v1Sidewall: m.flue.runFt },
        nodes: state.nodes,
        summary: "Unified Attic + HVAC R3: step=" + state.step + ", F1=(" + state.nodes.f1.x + "in," + state.nodes.f1.y + "in SW Dining), 24in pathway=" + m.walkFt + "ft (" + m.sheets + " sheets), flatRoof=66in, sidewallVent=" + state.ventMode + " (" + m.flue.effectiveWall + " wall, " + m.flue.runFt + "ft, +" + m.flue.minRiseIn + "in rise)."
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
      if (bp.step) applyHvacView(bp);
    }
    if (window.U4LiveAi) {
      window.U4LiveAi.init({
        planId: "hvac-layout",
        room: "hvac",
        titleEn: "Unified Attic Furnace, 24\" Pathway & Sidewall Vent",
        titleEs: "Calefacción, Pasillo 24\" y Salida Lateral Integrados",
        getContext: function () {
          var m = computeMetrics();
          return "Step=" + state.step + ", ReconciledF1=(" + state.nodes.f1.x + "in," + state.nodes.f1.y + "in SW Dining), Hatch=Outside Front Door 4 (24x36in clear), 24inPathway=" + m.walkFt + "ft (<=20ft cap at 66in flat roof, " + m.sheets + " sheets), FlatRoof=zero new penetrations, SidewallVent=" + state.ventMode + " via " + m.flue.effectiveWall + " wall (" + m.flue.runFt + "ft, +" + m.flue.minRiseIn + "in rise; SFMC 802.8 requires >=4ft from interior property line), EstRuns=SA1 " + m.sa1Ft + "ft/SA2 " + m.sa2Ft + "ft/SA3 " + m.sa3Ft + "ft/RA1 " + m.ra1Ft + "ft.";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Qué exige SFMC §802.8 para salir por el muro lateral?", "¿Por qué un equipo 80% AFUE ocupa extractor lateral?", "¿Cuánto mide el pasillo de 24\" hasta F1 en Comedor SO?"]
            : ["What does 2025 SFMC §802.8 require for sidewall venting?", "Why does an 80% AFUE furnace need a sidewall power venter?", "How long is the 24\" pathway to SW Dining F1?"];
        }
      });
    }
    syncBlueprintHiddenState();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
