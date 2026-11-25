(function () {
  "use strict";
  function bootBridge() {
    var topbar = document.getElementById("u4hTopbar");
    if (window.U4PlanNav && topbar) {
      window.U4PlanNav.init({
        planId: "bathroom-measurements",
        headerEl: topbar,
        onLangChange: function (l) {
          var wantEs = l === "es";
          var curEs = document.documentElement.lang === "es";
          var btn = document.getElementById("language");
          if (btn && wantEs !== curEs) btn.click();
          if (window.U4PinDragger && window.U4PinDragger.attach) window.U4PinDragger.attach();
        },
        onThemeChange: function (th) {
          var wantDark = th === "dark";
          var curDark = document.documentElement.dataset.theme === "dark";
          var tBtn = document.getElementById("theme");
          if (tBtn && wantDark !== curDark) tBtn.click();
        }
      });
    }
    if (window.U4LiveAi && typeof window.U4LiveAi.init === "function") {
      window.U4LiveAi.init({
        planId: "bathroom-measurements",
        room: "bathroom",
        titleEn: "Bathroom Field Measurements",
        titleEs: "Medidas de Campo del Baño",
        getContext: function () {
          var st = window.U4PLAN && window.U4PLAN.getViewState ? window.U4PLAN.getViewState() : {};
          return "View=" + (st.wall || "tub") + "/" + (st.view || "photo") + ", Door=28in outward hinged hallway door, EastStop=35in locked.";
        }
      });
    }
    if (window.U4PinDragger && typeof window.U4PinDragger.attach === "function") {
      window.U4PinDragger.attach();
    }
  }
  window.addEventListener("u4plan:ready", bootBridge);
  if (document.readyState === "complete") setTimeout(bootBridge, 120);
  else window.addEventListener("load", function () { setTimeout(bootBridge, 120); });
})();
