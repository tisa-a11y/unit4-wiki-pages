/* ============================================================================
   Attic Furnace & Ducts — Real-World Human-First Interactive Guide
   ACCA Manual D + Carrier/Bryant 80% AFUE Horizontal Reactive Ductwork Engine
   Rev P2 Owner Plan Default · Hatch Outside Front Door 4 · All 6 Nodes Draggable
   Zero External CDNs · Zero Prices · Zero Backend Clutter · EN / MX-ES
   ============================================================================ */
(function () {
  "use strict";

  var STEPS = [
    { id: "layout", en: "1. Attic Layout", es: "1. Plano en Ático" },
    { id: "section", en: "2. Height & Vent", es: "2. Altura y Flujo" },
    { id: "walkthrough", en: "3. Mon Walkthrough", es: "3. Visita Lunes 23" }
  ];

  // Uniform true-scale Unit 4 floor plan geometry (inches, matching unit4-floorplan-proof.png & render-EN.png)
  // N = UP (y=0), S = DOWN (y=298), W = LEFT (x=0), E = RIGHT (x=508)
  // SVG viewBox 0 0 500 340 -> SC = 0.86 px/in (scaleX === scaleY)
  var SC = 0.86;
  var OX = 24;
  var OY = 38;
  function px(xIn) { return +(OX + xIn * SC).toFixed(1); }
  function py(yIn) { return +(OY + yIn * SC).toFixed(1); }

  // 24"x36" Attic Hatch OUTSIDE Front Door 4 (on exterior stair landing WEST of Front Door 4 wall x=147")
  var HATCH_IN = { x: 112, y: 74, w: 24, h: 36 };

  // Exact Rev P2 Owner Plan Defaults (Unit-4-Proposed-Attic-Ductwork-Coordination-Rev-P2.pdf M1/M2/M3)
  var REV_P2_DEFAULTS = {
    f1:  { x: 198, y: 262 }, // Horizontal furnace above Dining near South exterior sidewall (service face North)
    r1:  { x: 248, y: 114 }, // Central Hall ceiling return (accessible filter)
    s1:  { x: 168, y: 126 }, // Hall ceiling immediately at Kitchen threshold
    s2:  { x: 312, y: 212 }, // Living-room side at midpoint of Dining/Living pocket opening
    s3:  { x: 386, y: 116 }, // Bedroom SW corner by Bedroom entry (cleanly separated from JD-1)
    jd1: { x: 334, y: 80 }   // Short independent acoustic jump duct across Bedroom-to-Hall entry wall
  };

  function cloneRevP2() {
    return {
      f1:  { x: REV_P2_DEFAULTS.f1.x,  y: REV_P2_DEFAULTS.f1.y },
      r1:  { x: REV_P2_DEFAULTS.r1.x,  y: REV_P2_DEFAULTS.r1.y },
      s1:  { x: REV_P2_DEFAULTS.s1.x,  y: REV_P2_DEFAULTS.s1.y },
      s2:  { x: REV_P2_DEFAULTS.s2.x,  y: REV_P2_DEFAULTS.s2.y },
      s3:  { x: REV_P2_DEFAULTS.s3.x,  y: REV_P2_DEFAULTS.s3.y },
      jd1: { x: REV_P2_DEFAULTS.jd1.x, y: REV_P2_DEFAULTS.jd1.y }
    };
  }

  var state = {
    step: "layout",
    nodes: cloneRevP2(),
    dischargeDir: "right",  // "right" (Supply East -> / Return West <-) | "left" (Supply West <- / Return East ->)
    ductMode: "trunk",      // "trunk" (Trunk & Branch — Manual D Recommended) | "radial" (Extended Plenum / Radial Wye)
    gfciOffsetFt: 3,
    flueClearIn: 1.5,
    activePreset: "revp2",
    dragActive: false,
    equipOpen: false,
    qChecks: { q1: false, q2: false, q3: false, q4: false, q5: false, q6: false }
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

  // Smooth rounded SVG path through polyline vertices (for swept-radius rigid bends, never harsh sharp corners)
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

  // Staggered L-shaped 24" walkway from Exterior Hatch (OUTSIDE Front Door 4) -> East across Door 4 -> Hall spine -> F1 North Platform
  function computeWalkwayPoints(f1) {
    var hatchEastX = HATCH_IN.x + HATCH_IN.w / 2; // 124" (east edge of outside hatch)
    var hatchMidY = HATCH_IN.y;                   // 74"
    var entryX = 166;                             // inside Hallway just East of Front Door 4
    var hallSpineY = 108;                         // Hallway centerline spine
    var platCenterY = f1.y - 29.5;                // 30"x30" service platform on NORTH face of F1
    var platEdgeY = platCenterY <= hallSpineY ? platCenterY + 15 : platCenterY - 15;
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

  // ── ACCA MANUAL D + CARRIER/BRYANT HORIZONTAL REACTIVE DUCTWORK ROUTING ──
  function computeReactiveDucts() {
    var n = state.nodes;
    var f1 = n.f1;
    var dir = state.dischargeDir === "right" ? 1 : -1;

    // True horizontal Carrier/Bryant cabinet (33.25" E-W x 29" N-S)
    // Supply End Plenum extends >=24" past discharge side; Return End + Filter Rack sits on OPPOSITE side!
    var cabHalfW = 16.625;
    var plenumLen = 24;
    var supFlange = { x: f1.x + dir * cabHalfW, y: f1.y };
    var supEnd    = { x: f1.x + dir * (cabHalfW + plenumLen), y: f1.y };
    var retFlange = { x: f1.x - dir * cabHalfW, y: f1.y };
    var retEnd    = { x: f1.x - dir * (cabHalfW + 14), y: f1.y };

    var vents = [
      { id: "s1", name: "SA-1", pt: n.s1 },
      { id: "s2", name: "SA-2", pt: n.s2 },
      { id: "s3", name: "SA-3", pt: n.s3 }
    ];

    var trunkSegs = [];   // [{ d, strokeW, pts }]
    var branches = [];    // [{ id, name, d, pts, ft, takeoff, damperPt, damperAngle, isSideTakeoff }]

    if (state.ductMode === "radial") {
      // Extended Plenum / Radial Wye: wide plenum box + smooth swept wye branches directly from plenum collars
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
        // Smooth 45-deg swept exit off plenum collar -> taut curve to register boot
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
          damperPt: { x: (collarPt.x + wyeExit.x) * 0.55 + wyeExit.x * 0.45 - wyeExit.x * 0.45 + wyeExit.x * 0.45, y: (collarPt.y + wyeExit.y) / 2 },
          damperAngle: ang,
          isSideTakeoff: false
        });
        branches[branches.length - 1].damperPt = {
          x: collarPt.x + (wyeExit.x - collarPt.x) * 0.72,
          y: collarPt.y + (wyeExit.y - collarPt.y) * 0.72
        };
      });
    } else {
      // TRUNK & BRANCH — MANUAL D RECOMMENDED
      // Split vents into:
      //  - forward vents: downstream in discharge direction (share tapered rigid trunk spine + 45-deg swept wyes!)
      //  - behind vents: dragged behind/opposite discharge side -> upstream side takeoff off Supply Plenum!
      var forward = [];
      var behind = [];
      vents.forEach(function (v) {
        var along = (v.pt.x - supEnd.x) * dir;
        if (along < -22) behind.push(v);
        else forward.push(v);
      });

      // Fallback: if ALL 3 vents were dragged behind the supply end, route main trunk sweeping around North toward them!
      if (forward.length === 0) {
        forward = behind.slice();
        behind = [];
      }

      // Compute rigid trunk spine Y-corridor (weighted average of forward vents, bounded to clean corridor north of F1 if vents are north)
      var avgY = forward.reduce(function (acc, v) { return acc + v.pt.y; }, 0) / forward.length;
      var trunkY = Math.max(96, Math.min(252, Math.round(avgY)));
      // Keep trunk corridor clear of F1's North service platform edge when rising north
      if (Math.abs(trunkY - f1.y) < 18) trunkY = f1.y;

      // Sort forward vents by projected run distance along discharge axis
      forward.sort(function (a, b) {
        return ((a.pt.x - supEnd.x) * dir) - ((b.pt.x - supEnd.x) * dir);
      });

      // Detect clustered wing (2 vents within 48" of each other on same side of trunk) -> shared sub-trunk + 45-deg Y-split!
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

      // Build trunk entry bend from supFlange -> supEnd -> elbow -> trunkStart on trunkY
      var firstX = forward[0].pt.x;
      var elbowX = supEnd.x + dir * 16;
      if ((firstX - supEnd.x) * dir < 0) elbowX = supEnd.x + dir * 10;

      // Compute takeoff X for each forward vent along trunkY (45-deg swept angle ahead of boot)
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
          takeoffs.push({
            tkPt: { x: tkX, y: trunkY },
            weight: 2,
            cluster: [v1, v2],
            wyeHub: wyeHub
          });
        } else {
          var dy1 = v.pt.y - trunkY;
          var lead = Math.min(28, Math.max(10, Math.abs(dy1) * 0.42));
          var tkX1 = v.pt.x - dir * lead;
          takeoffs.push({
            tkPt: { x: tkX1, y: trunkY },
            weight: 1,
            vent: v
          });
        }
      });

      // Sort takeoffs along discharge axis (or reverse if all behind)
      takeoffs.sort(function (a, b) {
        return ((a.tkPt.x - elbowX) * dir) - ((b.tkPt.x - elbowX) * dir);
      });

      // Build Tapered Rigid Main Trunk Segments!
      var curPt = supFlange;
      var remWeight = forward.length;
      // Straight >=24" supply plenum + smooth sweep onto trunkY
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

        // Build 45-deg swept Y-wye takeoff + balancing damper + smooth branch!
        if (tk.cluster) {
          // Shared sub-leg to Y-wye hub, then 2 swept branches!
          var subPts = [tk.tkPt, tk.wyeHub];
          trunkSegs.push({
            pts: subPts,
            d: smoothCornerPath(subPts, 8),
            strokeW: 4.4
          });
          tk.cluster.forEach(function (cv) {
            var ctrl = { x: (tk.wyeHub.x + cv.pt.x) / 2, y: tk.wyeHub.y };
            var bPts = [tk.tkPt, tk.wyeHub, cv.pt];
            var dStr = "M " + px(tk.wyeHub.x) + " " + py(tk.wyeHub.y) +
              " Q " + px(ctrl.x) + " " + py(ctrl.y) + " " + px(cv.pt.x) + " " + py(cv.pt.y);
            var ang = Math.atan2(cv.pt.y - tk.wyeHub.y, cv.pt.x - tk.wyeHub.x) * 180 / Math.PI;
            var dmp = { x: tk.wyeHub.x + (cv.pt.x - tk.wyeHub.x) * 0.34, y: tk.wyeHub.y + (cv.pt.y - tk.wyeHub.y) * 0.34 };
            // Total routed length from plenum to boot
            var runIn = pathLenIn(prePts) + distIn(firstTk, tk.tkPt) + distIn(tk.tkPt, tk.wyeHub) + distIn(tk.wyeHub, cv.pt);
            branches.push({
              id: cv.id,
              name: cv.name,
              d: dStr,
              pts: bPts,
              ft: +(runIn / 12).toFixed(1),
              takeoff: tk.wyeHub,
              damperPt: dmp,
              damperAngle: ang,
              isSideTakeoff: false
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
          var dmp2 = {
            x: tk.tkPt.x + (wyeStub.x - tk.tkPt.x) * 0.7,
            y: tk.tkPt.y + (wyeStub.y - tk.tkPt.y) * 0.7
          };
          var runIn2 = pathLenIn(prePts) + distIn(firstTk, tk.tkPt) + distIn(tk.tkPt, wyeStub) + distIn(wyeStub, sv.pt);
          branches.push({
            id: sv.id,
            name: sv.name,
            d: dStr2,
            pts: [tk.tkPt, wyeStub, sv.pt],
            ft: +(runIn2 / 12).toFixed(1),
            takeoff: tk.tkPt,
            damperPt: dmp2,
            damperAngle: ang2,
            isSideTakeoff: false
          });
        }
      }

      // Route any behind/opposite vents off an upstream side takeoff on the Supply Plenum!
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
          id: bv.id,
          name: bv.name,
          d: dStrB,
          pts: bPts,
          ft: +((14 + pathLenIn(bPts)) / 12).toFixed(1),
          takeoff: sideTk,
          damperPt: { x: sideTk.x + (bend1.x - sideTk.x) * 0.75, y: sideTk.y + (bend1.y - sideTk.y) * 0.75 },
          damperAngle: angB,
          isSideTakeoff: true
        });
      });
    }

    // Dedicated Sealed Return RA-1: strictly routes from R1 to OPPOSITE Return End Plenum!
    var retClearX = retEnd.x - dir * 14;
    var retMidY = Math.abs(n.r1.y - retEnd.y) > 25 ? (n.r1.y + retEnd.y) / 2 : retEnd.y;
    var retPts = [retFlange, retEnd, { x: retClearX, y: retEnd.y }, { x: retClearX, y: retMidY }, { x: n.r1.x, y: retMidY }, n.r1];
    // Simplify redundant collinear return bends when R1 is already on the return side
    if ((n.r1.x - retEnd.x) * (-dir) > 12) {
      retPts = [retFlange, retEnd, { x: n.r1.x, y: retEnd.y }, n.r1];
    }
    var ra1D = smoothCornerPath(retPts, 18);
    var ra1Ft = +(pathLenIn(retPts) / 12).toFixed(1);

    // Live Engineering Alerts (Short-Circuit <4 ft, Long Run >25 ft, Hatch/Walkway Conflict)
    var alerts = [];
    var shortCircuitPairs = [];

    // 1. Short-circuit check (< 48" = 4 ft schematic between Return R1 or Jump JD-1 and any Supply S1/S2/S3)
    var jdB = { x: n.jd1.x + 12, y: n.jd1.y - 4 };
    var jdH = { x: n.jd1.x - 12, y: n.jd1.y + 6 };
    vents.forEach(function (v) {
      var dRet = distIn(v.pt, n.r1);
      if (dRet < 48) {
        shortCircuitPairs.push({ a: v.pt, b: n.r1, ft: +(dRet / 12).toFixed(1), label: v.name + "↔R1" });
        alerts.push({
          sev: "fail",
          en: "Short-circuit risk: " + v.name + " is only " + (dRet / 12).toFixed(1) + " ft from R1 Return (< 4 ft) — move supply & return farther apart.",
          es: "Riesgo de cortocircuito de aire: " + v.name + " está a solo " + (dRet / 12).toFixed(1) + " pies de R1 Retorno (< 4 pies) — sepáralos más."
        });
      }
      var dJd = Math.min(distIn(v.pt, jdB), distIn(v.pt, jdH));
      if (dJd < 42) {
        shortCircuitPairs.push({ a: v.pt, b: n.jd1, ft: +(dJd / 12).toFixed(1), label: v.name + "↔JD-1" });
        alerts.push({
          sev: "warn",
          en: "Short-circuit check: " + v.name + " is only " + (dJd / 12).toFixed(1) + " ft from JD-1 Jump Duct (< 3.5 ft) — keep S3 separated from JD-B.",
          es: "Revisar cortocircuito: " + v.name + " está a solo " + (dJd / 12).toFixed(1) + " pies del Jump Duct JD-1 — separa S3 de JD-B."
        });
      }
    });

    // 2. Long branch / static-pressure caution (> 25 ft schematic)
    var byId = {};
    branches.forEach(function (b) {
      byId[b.id] = b;
      if (b.ft > 25.0) {
        alerts.push({
          sev: "warn",
          en: "Long branch (" + b.name + " ≈ " + b.ft + " ft > 25 ft): check Manual D static pressure & consider upsizing branch duct.",
          es: "Ramal largo (" + b.name + " ≈ " + b.ft + " pies > 25 pies): revisar caída de presión Manual D o subir diámetro."
        });
      }
    });

    // 3. Exterior Door 4 Hatch obstruction check (F1 or any duct crossing Hatch box!)
    var hatchRect = {
      x: HATCH_IN.x - HATCH_IN.w / 2,
      y: HATCH_IN.y - HATCH_IN.h / 2,
      w: HATCH_IN.w,
      h: HATCH_IN.h
    };
    var hatchBlocked = (Math.abs(f1.x - HATCH_IN.x) < 34 && Math.abs(f1.y - HATCH_IN.y) < 34) ||
      trunkSegs.some(function (ts) { return polyHitsRect(ts.pts, hatchRect); }) ||
      branches.some(function (b) { return polyHitsRect(b.pts, hatchRect); }) ||
      polyHitsRect(retPts, hatchRect);
    if (hatchBlocked) {
      alerts.push({
        sev: "fail",
        en: "Hatch conflict: F1 or ductwork crosses the 24\"×36\" Attic Hatch outside Front Door 4 — reroute clear of access opening!",
        es: "Conflicto con escotilla: F1 o ductos cruzan sobre la escotilla 24\"×36\" afuera de Puerta 4 — dejar libre el acceso."
      });
    }

    return {
      dir: dir,
      supFlange: supFlange,
      supEnd: supEnd,
      retFlange: retFlange,
      retEnd: retEnd,
      trunkSegs: trunkSegs,
      branches: branches,
      byId: byId,
      ra1D: ra1D,
      ra1Ft: ra1Ft,
      alerts: alerts,
      shortCircuitPairs: shortCircuitPairs,
      hatchBlocked: hatchBlocked
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
      walkPts: pts,
      walkD: pathDFromPoints(pts),
      walkFt: walkFt,
      walkPass: walkPass,
      sheets: sheets,
      ducts: ducts,
      sa1Ft: ducts.byId.s1 ? ducts.byId.s1.ft : 0,
      sa2Ft: ducts.byId.s2 ? ducts.byId.s2.ft : 0,
      sa3Ft: ducts.byId.s3 ? ducts.byId.s3.ft : 0,
      ra1Ft: ducts.ra1Ft,
      gfciPass: state.gfciOffsetFt <= 25,
      fluePass: state.flueClearIn >= 1.0
    };
  }

  function syncBlueprintHiddenState() {
    try {
      var inpFx = document.getElementById("inp-fx");
      var inpFy = document.getElementById("inp-fy");
      if (inpFx) inpFx.value = String(Math.round(state.nodes.f1.x));
      if (inpFy) inpFy.value = String(Math.round(state.nodes.f1.y));
    } catch (_) {}
  }

  // Build ONLY the dynamic SVG layer markup (ductwork, dampers, short-circuit rings) so pointermove can update it cleanly in place!
  function buildDynamicDuctsLayerHtml(m) {
    var d = m.ducts;
    var parts = [];

    // 1. Tapered Rigid Main Supply Trunk Spine (smooth swept bends)
    d.trunkSegs.forEach(function (ts) {
      parts.push('<path d="' + ts.d + '" fill="none" stroke="#1f5f7a" stroke-width="' + ts.strokeW + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.28"/>');
      parts.push('<path d="' + ts.d + '" fill="none" stroke="#1f5f7a" stroke-width="' + Math.max(2.2, +(ts.strokeW * 0.42).toFixed(1)) + '" stroke-linecap="round" stroke-linejoin="round"/>');
    });

    // 2. 45-deg Swept Y-Wye Takeoffs + Taut Smooth Branches + Accessible Balancing Damper Icons!
    d.branches.forEach(function (b) {
      var bCol = b.ft > 25 ? "#9a5b06" : "#1f5f7a";
      parts.push('<path d="' + b.d + '" fill="none" stroke="' + bCol + '" stroke-width="2.2" stroke-linecap="round"/>');
      // Takeoff collar dot
      parts.push('<circle cx="' + px(b.takeoff.x) + '" cy="' + py(b.takeoff.y) + '" r="2.7" fill="#ffffff" stroke="' + bCol + '" stroke-width="1.4"/>');
      // Accessible Balancing Damper symbol (circle + angled blade lever near takeoff)
      var dx = px(b.damperPt.x), dy = py(b.damperPt.y);
      parts.push(
        '<g transform="translate(' + dx + ',' + dy + ') rotate(' + Math.round(b.damperAngle) + ')">' +
          '<circle r="3.4" fill="#ffffff" stroke="#2f6b3f" stroke-width="1.2"/>' +
          '<line x1="-2.4" y1="-2.4" x2="2.4" y2="2.4" stroke="#2f6b3f" stroke-width="1.3"/>' +
        "</g>"
      );
    });

    // 3. Dedicated Sealed Negative-Pressure Return RA-1 (swept teal double-line/dashed strictly to Return End!)
    parts.push('<path d="' + d.ra1D + '" fill="none" stroke="#0f766e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.20"/>');
    parts.push('<path d="' + d.ra1D + '" fill="none" stroke="#0f766e" stroke-width="2.1" stroke-dasharray="5 3" stroke-linecap="round" stroke-linejoin="round"/>');

    // 4. Short-Circuit Warning Connectors (if R1 or JD-1 is dragged too close to any supply register)
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

    // Horizontal F1 cabinet + Supply End Plenum (blue, >=24") + Return End Filter Rack (teal, opposite end!)
    var fW = +(33.25 * SC).toFixed(1); // 28.6 px
    var fH = +(29 * SC).toFixed(1);    // 24.9 px
    var pS = +(30 * SC).toFixed(1);    // 25.8 px
    var supPlenW = +(24 * SC).toFixed(1); // 20.6 px
    var retPlenW = +(14 * SC).toFixed(1); // 12.0 px
    var supBoxX = dir > 0 ? (f1x + fW / 2) : (f1x - fW / 2 - supPlenW);
    var retBoxX = dir > 0 ? (f1x - fW / 2 - retPlenW) : (f1x + fW / 2);
    var v1Y = Math.min(py(295), f1y + fH / 2 + 10);

    return '<svg id="hvacHumanSvg" viewBox="0 0 500 342" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(es ? "Plano interactivo Rev P2 y Manual D de calefacción y ductos en el ático" : "Interactive Rev P2 and Manual D attic furnace and ductwork plan") + '" style="touch-action:none">' +
      // Top orientation bar & mandatory N/S/E/W compass rose
      '<text x="14" y="17" font-size="8.4" font-weight="800" fill="#1f5f7a">' +
        (es ? "ÁTICO UNIDAD 4 (REV P2 · MANUAL D) · ← OESTE (Afuera Puerta 4) | NORTE ↑ | ESTE (Bahía) →"
            : "UNIT 4 ATTIC (REV P2 · MANUAL D) · ← WEST (Outside Front Door 4) | NORTH ↑ | EAST (Bay) →") + "</text>" +
      '<g transform="translate(476,22)">' +
        '<circle r="15" fill="#f4f5f3" stroke="#98a4a8" stroke-width="1"/>' +
        '<polygon points="0,-11 -3.2,-4 3.2,-4" fill="#a8281c"/>' +
        '<text x="0" y="-12.2" text-anchor="middle" font-size="6.4" font-weight="800" fill="#a8281c">N</text>' +
        '<text x="0" y="12.5" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">S</text>' +
        '<text x="10.5" y="2.2" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">E</text>' +
        '<text x="-10.5" y="2.2" text-anchor="middle" font-size="5.5" font-weight="700" fill="#5d686d">' + (es ? "O" : "W") + "</text>" +
      "</g>" +

      // ── OUTSIDE FRONT DOOR 4 (COMMON STAIR LANDING WEST OF x=147") ──
      '<rect x="' + px(72) + '" y="' + py(38) + '" width="' + +(75 * SC).toFixed(1) + '" height="' + +(70 * SC).toFixed(1) + '" fill="#f7ecd9" fill-opacity="0.48" stroke="#9a5b06" stroke-width="1.3" stroke-dasharray="4 3"/>' +
      // Stair treads along West edge of exterior landing (matching attic-hatch-candidate.jpg railing!)
      '<line x1="' + px(78) + '" y1="' + py(44) + '" x2="' + px(78) + '" y2="' + py(102) + '" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<line x1="' + px(84) + '" y1="' + py(44) + '" x2="' + px(84) + '" y2="' + py(102) + '" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<line x1="' + px(90) + '" y1="' + py(44) + '" x2="' + px(90) + '" y2="' + py(102) + '" stroke="#9a5b06" stroke-width="0.9" opacity="0.6"/>' +
      '<text x="' + px(112) + '" y="' + py(48) + '" text-anchor="middle" font-size="5.3" font-weight="800" fill="#9a5b06">' + (es ? "AFUERA PTA 4" : "OUTSIDE DOOR 4") + "</text>" +

      // Kitchen (SW — 147" W x 126" N-S w/ West rear notch)
      '<path d="M ' + px(31.5) + " " + py(108) + " L " + px(147) + " " + py(108) + " L " + px(147) + " " + py(234) + " L " + px(0) + " " + py(234) + " L " + px(0) + " " + py(174) + " L " + px(31.5) + " " + py(174) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<text x="' + px(82) + '" y="' + py(166) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Cocina" : "Kitchen") + "</text>" +
      '<text x="' + px(82) + '" y="' + py(178) + '" text-anchor="middle" font-size="6.4" fill="#9a5b06">' + (es ? "(Campana aparte)" : "(Hood separate)") + "</text>" +

      // Hallway + 60" Front Door Entry Foyer (x=147..352)
      '<path d="M ' + px(147) + " " + py(58) + " L " + px(207) + " " + py(58) + " L " + px(207) + " " + py(88) + " L " + px(352) + " " + py(88) + " L " + px(352) + " " + py(142) + " L " + px(147) + " " + py(142) + ' Z" fill="#f4f5f3" stroke="#5d686d" stroke-width="1.4"/>' +
      // Frosted window North of Front Door 4
      '<line x1="' + px(160) + '" y1="' + py(58) + '" x2="' + px(194) + '" y2="' + py(58) + '" stroke="#1f5f7a" stroke-width="3.2"/>' +
      // FRONT DOOR 4 ON WEST WALL OF HALLWAY (x=147, y=68..100, hinged North, swinging INWARD EAST!)
      '<line x1="' + px(147) + '" y1="' + py(68) + '" x2="' + px(147) + '" y2="' + py(100) + '" stroke="#f4f5f3" stroke-width="3.2"/>' +
      '<line x1="' + px(147) + '" y1="' + py(68) + '" x2="' + px(177) + '" y2="' + py(68) + '" stroke="#1f5f7a" stroke-width="2.1"/>' +
      '<path d="M ' + px(177) + " " + py(68) + " A " + +(30 * SC).toFixed(1) + " " + +(30 * SC).toFixed(1) + " 0 0 1 " + px(147) + " " + py(98) + '" fill="none" stroke="#1f5f7a" stroke-width="1.2" stroke-dasharray="3 2"/>' +
      '<text x="' + px(164) + '" y="' + py(85) + '" font-size="6.1" font-weight="800" fill="#1f5f7a">' + (es ? "Pta 4→" : "Front 4→") + "</text>" +
      '<text x="' + px(216) + '" y="' + py(137) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#5d686d">' + (es ? "Pasillo" : "Hall") + "</text>" +

      // Bathroom (72-1/8" W x 88" N-S)
      '<rect x="' + px(207) + '" y="' + py(0) + '" width="' + +(72.1 * SC).toFixed(1) + '" height="' + +(88 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<text x="' + px(243) + '" y="' + py(44) + '" text-anchor="middle" font-size="7.4" font-weight="700" fill="#5d686d">' + (es ? "Baño" : "Bath") + "</text>" +

      // Laundry Closet (deep vertical shaft: 36-5/16" W x 82-5/8" D)
      '<rect x="' + px(279.1) + '" y="' + py(5.4) + '" width="' + +(36.3 * SC).toFixed(1) + '" height="' + +(82.6 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<text x="' + px(297.2) + '" y="' + py(46) + '" text-anchor="middle" font-size="6.2" font-weight="700" fill="#5d686d">' + (es ? "Lav." : "Ldry") + "</text>" +

      // Bedroom + NE Bay (122-1/8" + Bay)
      '<path d="M ' + px(315.4) + " " + py(0) + " L " + px(437.5) + " " + py(0) + " L " + px(474) + " " + py(34) + " L " + px(474) + " " + py(96) + " L " + px(437.5) + " " + py(136) + " L " + px(352) + " " + py(136) + " L " + px(352) + " " + py(88) + " L " + px(315.4) + " " + py(88) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<text x="' + px(396) + '" y="' + py(52) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Recámara" : "Bedroom") + "</text>" +

      // Dining Room (146-11/16" E-W x 155-3/4" N-S)
      '<rect x="' + px(147) + '" y="' + py(142) + '" width="' + +(146.7 * SC).toFixed(1) + '" height="' + +(155.75 * SC).toFixed(1) + '" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<text x="' + px(218) + '" y="' + py(166) + '" text-anchor="middle" font-size="7.8" font-weight="700" fill="#5d686d">' + (es ? "Comedor" : "Dining") + "</text>" +

      // Living Room + SE Bay (179-3/4" + Bay x 155-3/4" N-S)
      '<path d="M ' + px(293.7) + " " + py(142) + " L " + px(473.5) + " " + py(142) + " L " + px(508) + " " + py(178) + " L " + px(508) + " " + py(258) + " L " + px(473.5) + " " + py(297.75) + " L " + px(293.7) + " " + py(297.75) + ' Z" fill="#fbfcfb" stroke="#5d686d" stroke-width="1.5"/>' +
      '<line x1="' + px(293.7) + '" y1="' + py(178) + '" x2="' + px(293.7) + '" y2="' + py(246) + '" stroke="#fbfcfb" stroke-width="3.2"/>' +
      '<line x1="' + px(293.7) + '" y1="' + py(178) + '" x2="' + px(293.7) + '" y2="' + py(246) + '" stroke="#98a4a8" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="' + px(400) + '" y="' + py(222) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#5d686d">' + (es ? "Sala" : "Living Room") + "</text>" +

      // Subtle MEP Landmarks: E1/P Subpanel & G1 Gas Riser
      '<rect x="' + (px(147) + 2) + '" y="' + (py(206) - 6) + '" width="22" height="12" rx="2" fill="#ecedea" stroke="#5d686d" stroke-width="0.9"/>' +
      '<text x="' + (px(147) + 13) + '" y="' + (py(206) + 2.5) + '" text-anchor="middle" font-size="5.6" font-weight="700" fill="#5d686d">E1/P</text>' +
      '<rect x="' + (px(384) - 18) + '" y="' + (py(290) - 6) + '" width="36" height="11" rx="2" fill="#f7ecd9" stroke="#9a5b06" stroke-width="0.9"/>' +
      '<text x="' + px(384) + '" y="' + (py(290) + 2) + '" text-anchor="middle" font-size="5.6" font-weight="700" fill="#9a5b06">G1 Gas</text>' +

      // 24"x36" Attic Hatch STRICTLY OUTSIDE FRONT DOOR 4 (WEST of x=147"!)
      '<rect id="hvacHatchRect" x="' + px(HATCH_IN.x - HATCH_IN.w / 2) + '" y="' + py(HATCH_IN.y - HATCH_IN.h / 2) + '" width="' + +(HATCH_IN.w * SC).toFixed(1) + '" height="' + +(HATCH_IN.h * SC).toFixed(1) + '" rx="2" fill="' + (m.ducts.hatchBlocked ? "#f9e6e4" : "#f7ecd9") + '" stroke="' + (m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06") + '" stroke-width="1.8" stroke-dasharray="4 2"/>' +
      '<text x="' + px(HATCH_IN.x) + '" y="' + (py(HATCH_IN.y) - 2) + '" text-anchor="middle" font-size="6.1" font-weight="800" fill="' + (m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06") + '">24"×36"</text>' +
      '<text x="' + px(HATCH_IN.x) + '" y="' + (py(HATCH_IN.y) + 6) + '" text-anchor="middle" font-size="5.3" font-weight="700" fill="' + (m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06") + '">' + (es ? "Escotilla" : "Hatch") + "</text>" +

      // Staggered L-shaped Continuous 24" Walkway (Outside Door 4 Hatch -> East across Door 4 -> Hall spine -> F1 North Platform)
      '<path id="hvacWalkBg" d="' + m.walkD + '" fill="none" stroke="' + walkCol + '" stroke-width="11" stroke-linejoin="round" opacity="0.22"/>' +
      '<path id="hvacWalkLn" d="' + m.walkD + '" fill="none" stroke="' + walkCol + '" stroke-width="1.8" stroke-dasharray="4 3"/>' +

      // Dynamic ACCA Manual D Ductwork Layer (mutated cleanly in place during Pointer Events drag!)
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

      // DRAGGABLE RETURN R1 (Central Hall Ceiling)
      '<g id="hvacDragR1" class="u4-drag-move" data-node="r1" tabindex="0" role="application" aria-label="Drag R1 hall return" transform="translate(0, 0)">' +
        '<rect class="u4-drag-grip" x="' + (r1x - 26) + '" y="' + (r1y - 8) + '" width="52" height="16" rx="4" fill="#0f766e" stroke="#ffffff" stroke-width="1.2"/>' +
        '<text x="' + r1x + '" y="' + (r1y + 2.6) + '" text-anchor="middle" font-size="6.6" font-weight="800" fill="#ffffff" pointer-events="none">' + (es ? "R1 Ret." : "R1 Ret") + "</text>" +
      "</g>" +

      // DRAGGABLE INDEPENDENT ACOUSTIC JUMP DUCT JD-1 (Curved S/U-bend across Bedroom-Hall wall, NEVER connected to F1!)
      '<g id="hvacDragJD1" class="u4-drag-move" data-node="jd1" tabindex="0" role="application" aria-label="Drag JD-1 bedroom-hall acoustic jump duct" transform="translate(0, 0)">' +
        '<path d="M ' + (jdx - 13) + " " + (jdy + 7) + " C " + (jdx - 14) + " " + (jdy - 14) + ", " + (jdx + 14) + " " + (jdy - 16) + ", " + (jdx + 13) + " " + (jdy - 3) + '" fill="none" stroke="#6d28d9" stroke-width="2.6" stroke-dasharray="3 2"/>' +
        '<circle cx="' + (jdx - 13) + '" cy="' + (jdy + 7) + '" r="3.2" fill="#ede9fe" stroke="#6d28d9" stroke-width="1.2"/>' +
        '<circle cx="' + (jdx + 13) + '" cy="' + (jdy - 3) + '" r="3.2" fill="#ede9fe" stroke="#6d28d9" stroke-width="1.2"/>' +
        '<rect class="u4-drag-grip" x="' + (jdx - 19) + '" y="' + (jdy - 9) + '" width="38" height="13" rx="3.5" fill="#6d28d9" stroke="#ffffff" stroke-width="1.1"/>' +
        '<text x="' + jdx + '" y="' + (jdy + 0) + '" text-anchor="middle" font-size="5.9" font-weight="800" fill="#ffffff" pointer-events="none">JD-1</text>' +
      "</g>" +

      // DRAGGABLE HORIZONTAL FURNACE F1 WITH TRUE SUPPLY END PLENUM (>=24") & OPPOSITE RETURN END + FILTER RACK!
      '<g id="hvacDragFurnace" class="u4-drag-move" data-node="f1" tabindex="0" role="application" aria-label="Drag F1 horizontal furnace with supply and return plenums" transform="translate(0, 0)">' +
        // North 30"x30" Service Platform (facing Hall/attic walkway)
        '<rect x="' + (f1x - pS / 2).toFixed(1) + '" y="' + (f1y - fH / 2 - pS).toFixed(1) + '" width="' + pS + '" height="' + pS + '" rx="3" fill="#e4f0e6" stroke="#2f6b3f" stroke-width="1.4" stroke-dasharray="3 2"/>' +
        '<text x="' + f1x + '" y="' + (f1y - fH / 2 - pS / 2 + 2.5).toFixed(1) + '" text-anchor="middle" font-size="5.9" font-weight="800" fill="#2f6b3f" pointer-events="none">30"×30" N</text>' +
        // Return End Plenum + Filter Rack (Teal, OPPOSITE Supply End)
        '<rect x="' + retBoxX.toFixed(1) + '" y="' + (f1y - 8).toFixed(1) + '" width="' + retPlenW + '" height="16" rx="2" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.4"/>' +
        '<line x1="' + (dir > 0 ? (retBoxX + retPlenW - 3.5) : (retBoxX + 3.5)).toFixed(1) + '" y1="' + (f1y - 8).toFixed(1) + '" x2="' + (dir > 0 ? (retBoxX + retPlenW - 3.5) : (retBoxX + 3.5)).toFixed(1) + '" y2="' + (f1y + 8).toFixed(1) + '" stroke="#0f766e" stroke-width="1.8" stroke-dasharray="2 1"/>' +
        '<text x="' + (retBoxX + retPlenW / 2).toFixed(1) + '" y="' + (f1y + 2.2).toFixed(1) + '" text-anchor="middle" font-size="5.2" font-weight="800" fill="#0f766e" pointer-events="none">RET</text>' +
        // Supply End Plenum (Blue, >=24" rigid plenum + flex collar vibration break!)
        '<rect x="' + supBoxX.toFixed(1) + '" y="' + (f1y - 8.5).toFixed(1) + '" width="' + supPlenW + '" height="17" rx="2" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1.5"/>' +
        '<line x1="' + (dir > 0 ? (supBoxX + 3) : (supBoxX + supPlenW - 3)).toFixed(1) + '" y1="' + (f1y - 8.5).toFixed(1) + '" x2="' + (dir > 0 ? (supBoxX + 3) : (supBoxX + supPlenW - 3)).toFixed(1) + '" y2="' + (f1y + 8.5).toFixed(1) + '" stroke="#9a5b06" stroke-width="1.8"/>' +
        '<text x="' + (supBoxX + supPlenW / 2).toFixed(1) + '" y="' + (f1y + 2.2).toFixed(1) + '" text-anchor="middle" font-size="5.3" font-weight="800" fill="#1f5f7a" pointer-events="none">SUP</text>' +
        // Horizontal F1 Cabinet
        '<rect class="u4-drag-grip" x="' + (f1x - fW / 2).toFixed(1) + '" y="' + (f1y - fH / 2).toFixed(1) + '" width="' + fW + '" height="' + fH + '" rx="3.5" fill="#1d2326" stroke="#7cc0dc" stroke-width="1.8"/>' +
        '<text x="' + f1x + '" y="' + (f1y - 2) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#ffffff" pointer-events="none">F1 ' + (dir > 0 ? "→" : "←") + "</text>" +
        '<text x="' + f1x + '" y="' + (f1y + 7.2) + '" text-anchor="middle" font-size="5.7" font-weight="700" fill="#7cc0dc" pointer-events="none">45k BTU</text>' +
        // V1 Type B Flue collar cue on South side
        '<line x1="' + f1x + '" y1="' + (f1y + fH / 2).toFixed(1) + '" x2="' + f1x + '" y2="' + v1Y.toFixed(1) + '" stroke="#9a5b06" stroke-width="1.8" stroke-dasharray="3 2"/>' +
        '<circle cx="' + f1x + '" cy="' + v1Y.toFixed(1) + '" r="6" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1.3"/>' +
        '<text x="' + f1x + '" y="' + (v1Y + 2.2).toFixed(1) + '" text-anchor="middle" font-size="5.9" font-weight="800" fill="#9a5b06" pointer-events="none">V1</text>' +
      "</g>" +

      // Clean legend + live Manual D schematic run lengths bar at bottom clear of all rooms
      '<rect id="hvacSvgPill" x="14" y="302" width="472" height="20" rx="5" fill="' + walkFill + '" stroke="' + walkCol + '" stroke-width="1"/>' +
      '<text id="hvacSvgPillTxt" x="250" y="315" text-anchor="middle" font-size="7.4" font-weight="700" fill="' + walkCol + '">' +
        (es ? "Pasillo 24\": " + m.walkFt + "' / 20' (" + (m.walkPass ? "PASA ✓" : "EXCEDE ✗") + ") · " + m.sheets + " hojas · Est. Manual D: SA1 " + m.sa1Ft + "' · SA2 " + m.sa2Ft + "' · SA3 " + m.sa3Ft + "' · RA1 " + m.ra1Ft + "'"
            : "24\" Walkway: " + m.walkFt + "' / 20' (" + (m.walkPass ? "PASS ✓" : "OVER ✗") + ") · " + m.sheets + " shts · Est. Runs: SA1 " + m.sa1Ft + "' · SA2 " + m.sa2Ft + "' · SA3 " + m.sa3Ft + "' · RA1 " + m.ra1Ft + "'") +
      "</text>" +
      '<text x="250" y="334" text-anchor="middle" font-size="6.4" font-weight="600" fill="#5d686d">' +
        (es ? 'Estimación de planeación (Manual D final por NEXT) · Círculos verdes = compuertas de balanceo · ≥24" pleno rígido (1" libre en primeros 36")'
            : 'Planning estimate (Final Manual D by NEXT) · Green circles = accessible balancing dampers · ≥24" straight plenum (1" clear first 36")') +
      "</text>" +
    "</svg>";
  }

  function renderSectionSvg(es) {
    return '<svg viewBox="0 0 460 210" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="230" y="18" text-anchor="middle" font-size="9.6" font-weight="800" fill="#1f5f7a">' +
        (es ? 'CORTE VERTICAL DEL ÁTICO (ALTURA 66" · DUCTO TIPO B ≥ 1" LIBRE)' : 'ATTIC VERTICAL SECTION (66" RIDGE HEIGHT · TYPE B FLUE ≥ 1" CLEAR)') + "</text>" +
      '<polygon points="30,174 230,36 430,174" fill="#f4f5f3" stroke="#1d2326" stroke-width="2"/>' +
      '<line x1="30" y1="174" x2="430" y2="174" stroke="#1d2326" stroke-width="2.4"/>' +
      '<line x1="168" y1="78" x2="168" y2="174" stroke="#1f5f7a" stroke-width="1.4" stroke-dasharray="3 2"/>' +
      '<rect x="116" y="114" width="96" height="18" rx="4" fill="#e3eef2" stroke="#1f5f7a" stroke-width="1"/>' +
      '<text x="164" y="126" text-anchor="middle" font-size="8" font-weight="800" fill="#1f5f7a">' + (es ? '66" altura ático' : '66" attic height') + "</text>" +
      '<rect x="260" y="34" width="14" height="106" fill="#f7ecd9" stroke="#9a5b06" stroke-width="1.8"/>' +
      '<text x="282" y="64" font-size="8.2" font-weight="800" fill="#9a5b06">' + (es ? "V1 Ducto Tipo B (doble pared)" : "V1 Type B double-wall flue") + "</text>" +
      '<text x="282" y="76" font-size="7.4" font-weight="700" fill="#2f6b3f">' + (es ? '≥ 1" libre a madera · definir ruta lun 23' : '≥ 1" clear to wood · confirm route Mon 23') + "</text>" +
      '<rect x="220" y="136" width="60" height="30" rx="3" fill="#1d2326" stroke="#7cc0dc" stroke-width="1.6"/>' +
      '<text x="250" y="150" text-anchor="middle" font-size="7.6" font-weight="800" fill="#ffffff">45k BTU</text>' +
      '<text x="250" y="160" text-anchor="middle" font-size="6.8" fill="#7cc0dc">14-3/16"×29"</text>' +
      '<rect x="206" y="166" width="88" height="8" fill="#2f6b3f"/>' +
      '<text x="250" y="192" text-anchor="middle" font-size="8" font-weight="700" fill="#2f6b3f">' +
        (es ? 'Plataforma sólida 30"×30" lado Norte (obra John · SIN gomas — las trae NEXT)' : 'Solid 30"×30" North platform (John builds · NO vibration pads — NEXT provides)') +
      "</text>" +
    "</svg>";
  }

  function renderEquip(m, es) {
    return '<div class="u4h-equip-wrap">' +
      '<button type="button" id="hvacEquipBtn" class="u4h-equip-toggle" aria-expanded="' + (state.equipOpen ? "true" : "false") + '">' +
        (es ? "🔧 Equipo y suministros " : "🔧 Equipment & Supplies ") + (state.equipOpen ? "▴" : "▾") +
      "</button>" +
      '<div id="hvacEquipBody" class="u4h-equip-body"' + (state.equipOpen ? "" : " hidden") + ">" +
        '<div class="u4h-equip-grid">' +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Alcance de John (carpintería y eléctrico)" : "John / Crew Scope (Prep Only)") + "</h4>" +
            "<ul>" +
              "<li>" + m.sheets + (es ? ' hojas 4×8 OSB 23/32" o triplay 3/4" (pasillo ' + m.walkFt + " pies)" : ' sheets 4×8 of 23/32" OSB or 3/4" ply (' + m.walkFt + " ft walkway)") + "</li>" +
              "<li>" + (es ? 'Plataforma nivelada 30"×30" frente Norte (NO comprar gomas antivibración)' : 'Level 30"×30" solid North platform (do NOT buy vibration pads)') + "</li>" +
              "<li>" + (es ? "Luz LED con apagador en acceso + contacto GFCI 120V (≤25 pies) + desconectador" : "Switched LED attic light + line-side 120V GFCI (≤25 ft) + furnace disconnect") + "</li>" +
            "</ul>" +
          "</div>" +
          '<div class="u4h-equip-col">' +
            "<h4>" + (es ? "Alcance de NEXT HVAC (SOLO calefacción)" : "NEXT HVAC Scope (Heating ONLY)") + "</h4>" +
            "<ul>" +
              "<li>" + (es ? "Equipo horizontal Carrier/Bryant Legacy 45k BTU (80% AFUE, Low NOx)" : "Horizontal Carrier/Bryant Legacy 45k BTU furnace (80% AFUE, Low NOx)") + "</li>" +
              "<li>" + (es ? "Pleno suministro rígido ≥24\" + troncal con derivaciones 45° + compuertas balanceo + retorno sellado + JD-1 + V1 Tipo B" : "≥24\" rigid supply plenum + tapered trunk w/ 45° wyes & balancing dampers + sealed return + JD-1 + V1 Type B") + "</li>" +
              "<li><strong>" + (es ? "NO incluye campana de cocina:" : "Does NOT include kitchen range hood:") + "</strong> " + (es ? "la campana va aparte por su propio ducto." : "range hood uses its own dedicated duct.") + "</li>" +
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
        (es ? "✓ Geometría Manual D limpia: sin cortocircuitos (<4 pies), sin ramales largos (>25 pies) y escotilla exterior Puerta 4 libre."
            : "✓ Manual D geometry clear: zero short-circuits (<4 ft), zero long runs (>25 ft), and outside Front Door 4 Hatch stays clear.") +
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
      f1:  { minX: 170, maxX: 430, minY: 108, maxY: 274 },
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

      // Update reactive Manual D ductwork layer directly in DOM (zero innerHTML wipe on drag handle!)
      var ductLayer = document.getElementById("hvacDynamicDuctsLayer");
      if (ductLayer) ductLayer.innerHTML = buildDynamicDuctsLayerHtml(m);

      // Update hatch conflict tint
      var hatchRect = document.getElementById("hvacHatchRect");
      if (hatchRect) {
        hatchRect.setAttribute("fill", m.ducts.hatchBlocked ? "#f9e6e4" : "#f7ecd9");
        hatchRect.setAttribute("stroke", m.ducts.hatchBlocked ? "#a8281c" : "#9a5b06");
      }

      // Update staggered L-walkway path live
      var bg = document.getElementById("hvacWalkBg");
      var ln = document.getElementById("hvacWalkLn");
      if (bg) { bg.setAttribute("d", m.walkD); bg.setAttribute("stroke", walkCol); }
      if (ln) { ln.setAttribute("d", m.walkD); ln.setAttribute("stroke", walkCol); }

      // Update bottom SVG pill + top KPIs + alerts live
      var pill = document.getElementById("hvacSvgPill");
      var ptxt = document.getElementById("hvacSvgPillTxt");
      if (pill) { pill.setAttribute("fill", walkFill); pill.setAttribute("stroke", walkCol); }
      if (ptxt) {
        ptxt.setAttribute("fill", walkCol);
        ptxt.textContent = es
          ? "Pasillo 24\": " + m.walkFt + "' / 20' (" + (m.walkPass ? "PASA ✓" : "EXCEDE ✗") + ") · " + m.sheets + " hojas · Est. Manual D: SA1 " + m.sa1Ft + "' · SA2 " + m.sa2Ft + "' · SA3 " + m.sa3Ft + "' · RA1 " + m.ra1Ft + "'"
          : "24\" Walkway: " + m.walkFt + "' / 20' (" + (m.walkPass ? "PASS ✓" : "OVER ✗") + ") · " + m.sheets + " shts · Est. Runs: SA1 " + m.sa1Ft + "' · SA2 " + m.sa2Ft + "' · SA3 " + m.sa3Ft + "' · RA1 " + m.ra1Ft + "'";
      }
      var kpiVal = document.getElementById("hvacKpiWalkVal");
      if (kpiVal) {
        kpiVal.className = "u4h-kpi-val " + (m.walkPass ? "is-ok" : "is-fail");
        kpiVal.textContent = m.walkFt + (es ? " pies / 20" : " ft / 20 ft");
      }
      var kpiSub = document.getElementById("hvacKpiSheetsSub");
      if (kpiSub) kpiSub.textContent = m.sheets + (es ? " hojas 4×8 OSB/triplay" : " sheets 4×8 OSB/ply");
      var kpiRuns = document.getElementById("hvacKpiRunsVal");
      if (kpiRuns) kpiRuns.textContent = "SA " + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "'";
      var kpiRunsSub = document.getElementById("hvacKpiRunsSub");
      if (kpiRunsSub) kpiRunsSub.textContent = "RA1 " + m.ra1Ft + "' · " + (es ? "Est. Manual D" : "Manual D est.");

      var alertHost = document.getElementById("hvacAlertsHost");
      if (alertHost) alertHost.innerHTML = buildAlertsHtml(m, es);

      var st = document.getElementById("hvacStatusBanner");
      if (st) {
        st.className = "u4h-status " + (m.walkPass ? "is-pass" : "is-fail");
        st.textContent = m.walkPass
          ? (es ? "✓ PASA — Pasillo desde escotilla afuera de Puerta 4: " + m.walkFt + " pies (≤ 20 pies, altura ático 66\"). Requiere " + m.sheets + " hoja(s) de 4×8."
                : "✓ PASS — Walkway from outside Front Door 4 Hatch: " + m.walkFt + " ft (≤ 20 ft max at 66\" attic height). Plan " + m.sheets + " sheet(s) of 4×8 OSB/ply.")
          : (es ? "✗ DEMASIADO LEJOS (" + m.walkFt + " pies > 20 pies) — Acerca la calefacción F1 hacia la escotilla exterior de Puerta 4."
                : "✗ TOO FAR (" + m.walkFt + " ft > 20 ft max) — Move F1 furnace closer to the outside Front Door 4 hatch.");
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
          var svgY = ((e.clientY - rect.top) / (rect.height || 342)) * 342;
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
        if (ev.key === "ArrowLeft")  { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x - step, cur.y); }
        if (ev.key === "ArrowRight") { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x + step, cur.y); }
        if (ev.key === "ArrowUp")    { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x, cur.y - step); }
        if (ev.key === "ArrowDown")  { ev.preventDefault(); updateDomInPlace(nodeKey, cur.x, cur.y + step); }
      });
    });
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
        ? "<strong>PLANIFICACIÓN REV P2 · MANUAL D — VISITA LUNES 23 NOV (2–4 PM CON SERGE Y ALEX):</strong> Cero cortes en techo todavía. <strong>NEXT HVAC es SOLO calefacción y ductos de aire</strong> (NO la campana de la estufa)."
        : "<strong>REV P2 · MANUAL D SANDBOX — MON NOV 23 WALKTHROUGH (2–4 PM WITH SERGE &amp; ALEX):</strong> No ceiling cuts yet. <strong>NEXT HVAC is heating furnace &amp; ducts ONLY</strong> (NOT the kitchen range hood exhaust).";
    }

    var stepPills = '<div class="u4h-steps" role="tablist">' +
      STEPS.map(function (s) {
        var act = s.id === state.step;
        return '<button type="button" class="u4h-step-btn' + (act ? " is-active" : "") + '" data-step="' + s.id + '" role="tab" aria-selected="' + (act ? "true" : "false") + '">' + esc(es ? s.es : s.en) + "</button>";
      }).join("") +
    "</div>";

    var titleEn = "Attic Furnace & Reactive Manual D Ducts (Rev P2)";
    var titleEs = "Calefacción y Ductos Reactivos Manual D (Rev P2)";
    var subEn = "Drag F1, S1/S2/S3, R1, or JD-1 to reshape the tapered rigid trunk, 45° wyes, dampers & return live";
    var subEs = "Arrastra F1, S1/S2/S3, R1 o JD-1 para recalcular troncal rígida, derivaciones 45°, compuertas y retorno";
    var inner = "";

    if (state.step === "layout") {
      inner =
        '<div class="u4h-kpi-grid">' +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Pasillo (Afuera Pta 4)" : "Walkway (Outside Door 4)") + "</div>" +
            '<div id="hvacKpiWalkVal" class="u4h-kpi-val ' + (m.walkPass ? "is-ok" : "is-fail") + '">' + m.walkFt + (es ? " pies / 20" : " ft / 20 ft") + "</div>" +
            '<div id="hvacKpiSheetsSub" class="u4h-kpi-sub">' + m.sheets + (es ? " hojas 4×8 OSB/triplay" : " sheets 4×8 OSB/ply") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Ramales Est. (Manual D)" : "Est. Runs (Manual D)") + "</div>" +
            '<div id="hvacKpiRunsVal" class="u4h-kpi-val is-info">SA ' + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "'</div>" +
            '<div id="hvacKpiRunsSub" class="u4h-kpi-sub">RA1 ' + m.ra1Ft + "' · " + (es ? "Estimado NEXT" : "Planning est.") + "</div>" +
          "</div>" +
          '<div class="u4h-kpi">' +
            '<div class="u4h-kpi-lbl">' + (es ? "Pleno / Ducto V1" : "Plenum / V1 Flue") + "</div>" +
            '<div class="u4h-kpi-val is-ok">≥24" · 1" clr</div>' +
            '<div class="u4h-kpi-sub">' + (es ? "GFCI " + state.gfciOffsetFt + "' (≤25') · ver lun 23" : "GFCI " + state.gfciOffsetFt + "' (≤25') · check Mon 23") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="u4h-svg-hint">' +
          "<span>" + (es ? "✋ Arrastra F1, S1, S2, S3, R1 o JD-1: los ductos y derivaciones 45° se recalculan en vivo desde el pleno correcto:" : "✋ Drag F1, S1, S2, S3, R1, or JD-1 — trunk spine, 45° wyes & dampers actively reroute off true Supply/Return ends:") + "</span>" +
        "</div>" +
        '<div class="u4h-svg-wrap">' + renderAtticPlanSvg(m, es) + "</div>" +
        '<div class="u4h-controls">' +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Modo de ductos (Manual D):" : "Supply duct layout:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" id="hvacModeTrunkBtn" class="u4h-pill' + (state.ductMode === "trunk" ? " is-active" : "") + '" data-dmode="trunk">' + (es ? "Troncal y Ramales (Manual D rec.)" : "Trunk & Branch (Manual D Rec.)") + "</button>" +
              '<button type="button" id="hvacModeRadialBtn" class="u4h-pill' + (state.ductMode === "radial" ? " is-active" : "") + '" data-dmode="radial">' + (es ? "Pleno Extendido / Radial Wye" : "Extended Plenum / Radial Wye") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Descarga horizontal F1:" : "F1 horizontal discharge:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" id="hvacDirRightBtn" class="u4h-pill' + (state.dischargeDir === "right" ? " is-active" : "") + '" data-ddir="right">' + (es ? "Descarga Este → (Retorno Oeste)" : "Discharge Right / East →") + "</button>" +
              '<button type="button" id="hvacDirLeftBtn" class="u4h-pill' + (state.dischargeDir === "left" ? " is-active" : "") + '" data-ddir="left">' + (es ? "← Descarga Oeste (Retorno Este)" : "← Discharge Left / West") + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="u4h-ctrl-row">' +
            '<span class="u4h-ctrl-lbl">' + (es ? "Disposición rápida:" : "Quick placement:") + "</span>" +
            '<div class="u4h-pill-group">' +
              '<button type="button" id="hvacResetRevP2Btn" class="u4h-pill' + (state.activePreset === "revp2" ? " is-active" : "") + '" data-preset="revp2">' + (es ? "↺ Restaurar Plan Rev P2" : "↺ Reset to Rev P2 Plan") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.activePreset === "close" ? " is-active" : "") + '" data-preset="close">' + (es ? "Pasillo central (~12.6 pies)" : "Central Hall (~12.6 ft)") + "</button>" +
              '<button type="button" class="u4h-pill' + (state.activePreset === "far" ? " is-active" : "") + '" data-preset="far">' + (es ? "Sala Este (>20 pies · Falla)" : "Far East (>20 ft · Fails)") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div id="hvacAlertsHost">' + buildAlertsHtml(m, es) + "</div>" +
        '<div id="hvacStatusBanner" class="u4h-status ' + (m.walkPass ? "is-pass" : "is-fail") + '">' +
          (m.walkPass
            ? (es ? "✓ PASA — Pasillo desde escotilla afuera de Puerta 4: " + m.walkFt + " pies (≤ 20 pies, altura ático 66\"). Requiere " + m.sheets + " hoja(s) de 4×8."
                  : "✓ PASS — Walkway from outside Front Door 4 Hatch: " + m.walkFt + " ft (≤ 20 ft max at 66\" attic height). Plan " + m.sheets + " sheet(s) of 4×8 OSB/ply.")
            : (es ? "✗ DEMASIADO LEJOS (" + m.walkFt + " pies > 20 pies) — Acerca la calefacción F1 hacia la escotilla exterior de Puerta 4."
                  : "✗ TOO FAR (" + m.walkFt + " ft > 20 ft max) — Move F1 furnace closer to the outside Front Door 4 hatch.")) +
        "</div>" +
        '<div class="u4h-info-box">' +
          '<div class="u4h-info-title">' + (es ? "Base técnica: Manual Carrier/Bryant + ACCA Manual D + Rev P2" : "Engineering Basis: Carrier/Bryant Horizontal Manual + ACCA Manual D + Rev P2") + "</div>" +
          '<ul class="u4h-info-list">' +
            "<li><strong>" + (es ? "Pleno de Suministro vs Retorno:" : "True Supply vs. Return Ends:") + "</strong> " + (es ? "El pleno de suministro rígido sale por un extremo de F1 con junta flexible antivibración, ≥24\" rectos antes de la primera derivación y 1\" libre a madera en los primeros 36\". El retorno sellado RA-1 con portafiltro accesible entra por el extremo opuesto." : "Rigid supply plenum exits ONE end of F1 with a flex vibration collar, ≥24\" straight plenum before the first takeoff, and 1\" clearance to combustibles over the first 36\". Sealed negative-pressure return RA-1 + filter rack connects strictly to the OPPOSITE end.") + "</li>" +
            "<li><strong>" + (es ? "Troncal Manual D y Compuertas:" : "Manual D Tapered Trunk & Dampers:") + "</strong> " + (es ? "La troncal reduce sección tras cada derivación 45° (nunca tes secas a 90°) e incluye compuertas de balanceo accesibles en cada ramal. JD-1 es un ducto acústico independiente en S/U sobre el muro de la Recámara (nunca conectado a F1)." : "Rigid trunk tapers after each 45° swept Y-wye/conical takeoff (never abrupt 90° bullhead tees) with accessible balancing dampers near each takeoff. JD-1 is an independent acoustic S/U-bend across the Bedroom/Hall doorway (never connected to F1).") + "</li>" +
            "<li><strong>" + (es ? "Referencia:" : "Reference:") + "</strong> <code>Unit-4-Proposed-Attic-Ductwork-Coordination-Rev-P2.pdf</code> (Rev P2 M1/M2/M3) · " + (es ? "Escotilla 24\"×36\" en el descanso exterior AFUERA de Puerta Principal 4 · Longitudes mostradas son estimados de planeación (Manual D final por NEXT)." : "24\"×36\" Attic Hatch located on exterior landing OUTSIDE Front Door 4 · Run lengths are Planning Estimates (Final Manual D by NEXT).") + "</li>" +
          "</ul>" +
        "</div>";

    } else if (state.step === "section") {
      titleEn = '66" Attic Height, Flue & Access Photo';
      titleEs = 'Altura de 66", Escape V1 y Foto de Acceso';
      subEn = "Why walkway maxes out at 20 ft and how Carrier/Bryant 45k BTU passes outside Front Door 4 hatch";
      subEs = "Por qué el pasillo tiene tope de 20 pies y cómo entra el equipo por la escotilla afuera de Puerta 4";

      inner =
        '<div class="u4h-svg-wrap">' + renderSectionSvg(es) + "</div>" +
        '<div class="u4h-photo-grid">' +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/attic-hatch-candidate.jpg" alt="' + esc(es ? "Foto real descanso exterior afuera de Puerta Principal 4" : "Real exterior landing ceiling photo outside Front Door 4") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Acceso candidato — Afuera de Puerta Principal 4:" : "Candidate access — Outside Front Door 4:") + "</strong> " +
              (es ? 'Escotilla 24"×36" libre en el techo del descanso exterior (afuera al Oeste de Puerta 4) deja pasar el equipo 14-3/16"×29" de punta.' : 'Locked 24"×36" clear hatch on the exterior landing ceiling (outside West of Front Door 4) passes the 14-3/16"×29" furnace end-first.') +
            "</div>" +
          "</div>" +
          '<div class="u4h-photo-card">' +
            '<img src="./assets/unit4-floorplan-proof.png" alt="' + esc(es ? "Planta de referencia Unidad 4" : "Unit 4 reference floor plan") + '">' +
            '<div class="u4h-photo-cap"><strong>' + (es ? "Planta completa Unidad 4:" : "Unit 4 full floor plan:") + "</strong> " +
              (es ? "Referencia de cuartos debajo del ático (Puerta Principal 4 en muro Oeste del Pasillo abriendo al Este)." : "Reference of all 8 rooms below the attic (Front Door 4 on West Hall wall swinging East).") +
            "</div>" +
          "</div>" +
        "</div>";

    } else {
      titleEn = "Mon Nov 23 Walkthrough Questions (Serge & Alex)";
      titleEs = "Preguntas para Visita Lunes 23 Nov (Serge y Alex)";
      subEn = "Check off each decision live on site and log answers straight to the project record";
      subEs = "Confirma cada punto en la visita y guarda las respuestas directo al proyecto";

      var qs = [
        { k: "q1", en: "1. Confirm exact Carrier/Bryant 45k BTU SKU, horizontal discharge direction & ≥24\" plenum", es: "1. Confirmar modelo exacto Carrier/Bryant 45k BTU, lado de descarga y pleno ≥24\"" },
        { k: "q2", en: "2. Lock F1 above South Dining (Rev P2) keeping staggered 24\" walkway ≤ 20 ft from outside Door 4 hatch", es: "2. Confirmar F1 sobre Comedor Sur (Rev P2) manteniendo pasillo 24\" ≤ 20 pies desde escotilla afuera de Puerta 4" },
        { k: "q3", en: "3. Verify V1 Type B flue route (South sidewall out-then-up vs existing roof jack) & 1\" clear first 36\"", es: "3. Verificar ruta de ducto V1 Tipo B (lateral Sur hacia arriba vs techo) y 1\" libre en primeros 36\"" },
        { k: "q4", en: "4. Review Manual D trunk sizing, 45° wyes, balancing dampers & spots for S1/S2/S3/R1/JD-1", es: "4. Revisar cálculo Manual D, derivaciones 45°, compuertas y ubicación de S1/S2/S3/R1/JD-1" },
        { k: "q5", en: "5. Confirm attic hatch outside Front Door 4 & ceiling fire-rating with Tisa before cutting", es: "5. Confirmar escotilla afuera de Puerta Principal 4 y clasificación cortafuego con Tisa" },
        { k: "q6", en: "6. Confirm dedicated furnace circuit, disconnect in sight & line-side GFCI", es: "6. Confirmar circuito dedicado, desconectador a la vista y GFCI 120V" }
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
          '<button type="button" class="u4h-action-btn" id="hvacLogBtn">' + (es ? "📝 Guardar notas de la visita" : "📝 Log walkthrough answers") + "</button>" +
          '<a class="u4h-nav-link" href="' + esc(window.U4PlanNav.planUrl("attic-hatch")) + '">' + (es ? "Abrir Escotilla Ático →" : "Open Attic Hatch Plan →") + "</a>" +
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
          '<span class="u4h-compass">Rev P2 · Manual D</span>' +
        "</div>" +
        stepPills +
        inner +
        pager +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { state.step = b.getAttribute("data-step"); render(); window.scrollTo(0, 0); });
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
        if (p === "revp2") {
          state.nodes = cloneRevP2();
          state.dischargeDir = "right";
          state.activePreset = "revp2";
        } else if (p === "close") {
          state.nodes.f1 = { x: 204, y: 198 };
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
      if (window.U4LiveAi) window.U4LiveAi.openNote("HVAC Rev P2 Manual D walkthrough notes (mode=" + state.ductMode + ", discharge=" + state.dischargeDir + ", walkway=" + m.walkFt + "ft, SA1/2/3=" + m.sa1Ft + "/" + m.sa2Ft + "/" + m.sa3Ft + "ft): ");
    });
    var pBtn = document.getElementById("hvacPrevBtn");
    var nBtn = document.getElementById("hvacNextBtn");
    if (pBtn) pBtn.addEventListener("click", function () { if (idx > 0) { state.step = STEPS[idx - 1].id; render(); window.scrollTo(0, 0); } });
    if (nBtn) nBtn.addEventListener("click", function () { if (idx < STEPS.length - 1) { state.step = STEPS[idx + 1].id; render(); window.scrollTo(0, 0); } });

    if (state.step === "layout") wireAllNodeDrags();

    if (window.U4PlanNav && typeof window.U4PlanNav.reportPlanContext === "function") {
      window.U4PlanNav.reportPlanContext();
    }
  }

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
        var map = { plan: "layout", attic: "layout", ducts: "layout", height: "section", vent: "section", clearance: "section", mon: "walkthrough", checklist: "walkthrough" };
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
      } else if (act === "discharge" || act === "discharge_dir") {
        state.dischargeDir = String(val).toLowerCase().indexOf("left") >= 0 || String(val).toLowerCase().indexOf("west") >= 0 ? "left" : "right";
      } else if (act === "preset" || act === "furnace_preset") {
        var p = String(val || "").toLowerCase();
        if (p.indexOf("cent") >= 0 || p === "close") {
          state.nodes.f1 = { x: 204, y: 198 };
          state.activePreset = "close";
        } else if (p.indexOf("far") >= 0 || p.indexOf("east") >= 0) {
          state.nodes.f1 = { x: 350, y: 248 };
          state.activePreset = "far";
        } else {
          state.nodes = cloneRevP2();
          state.dischargeDir = "right";
          state.activePreset = "revp2";
        }
      } else if (act === "move_node" || state.nodes[act]) {
        var nk = state.nodes[act] ? act : String(args.target || "").toLowerCase();
        if (!state.nodes[nk]) return false;
        var pos = (val && typeof val === "object") ? val : args;
        if (pos.x != null && isFinite(Number(pos.x))) state.nodes[nk].x = Math.max(90, Math.min(440, Number(pos.x)));
        if (pos.y != null && isFinite(Number(pos.y))) state.nodes[nk].y = Math.max(40, Math.min(272, Number(pos.y)));
      } else if (act === "reset") {
        state.nodes = cloneRevP2();
        state.ductMode = "trunk";
        state.dischargeDir = "right";
        state.activePreset = "revp2";
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
        ductMode: state.ductMode,
        dischargeDir: state.dischargeDir,
        walkFt: m.walkFt,
        runs: { sa1: m.sa1Ft, sa2: m.sa2Ft, sa3: m.sa3Ft, ra1: m.ra1Ft },
        nodes: state.nodes,
        summary: "HVAC Rev P2 Manual D: step=" + state.step + ", mode=" + state.ductMode + ", discharge=" + state.dischargeDir + ", hatch=outside Front Door 4, walkway=" + m.walkFt + "ft, runs=SA1 " + m.sa1Ft + "'/SA2 " + m.sa2Ft + "'/SA3 " + m.sa3Ft + "'/RA1 " + m.ra1Ft + "'."
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
        titleEn: "Attic Furnace & Reactive Manual D Ducts",
        titleEs: "Calefacción y Ductos Reactivos Manual D",
        getContext: function () {
          var m = computeMetrics();
          return "Step=" + state.step + ", Basis=Rev P2 + Carrier/Bryant Horizontal + ACCA Manual D, DuctMode=" + state.ductMode + ", Discharge=" + state.dischargeDir + ", Hatch=Outside Front Door 4 Landing (West of Front Door 4), Walkway=" + m.walkFt + "ft (20ft cap at 66in attic height, " + m.sheets + " sheets), EstRuns=SA1 " + m.sa1Ft + "ft/SA2 " + m.sa2Ft + "ft/SA3 " + m.sa3Ft + "ft/RA1 " + m.ra1Ft + "ft, NEXT HVAC=heating ONLY (not kitchen hood), Mon Nov 23 2-4pm walkthrough with Serge & Alex.";
        },
        quickPrompts: function (lang) {
          return lang === "es"
            ? ["¿Por qué troncal con derivaciones 45° (Manual D)?", "¿Dónde va exactamente la escotilla afuera de Puerta 4?", "¿NEXT HVAC conecta la campana de cocina?"]
            : ["Why Manual D tapered trunk & 45° wyes?", "Where exactly is the hatch outside Front Door 4?", "Does NEXT HVAC connect the kitchen range hood?"];
        }
      });
    }
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
