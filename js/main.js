(function () {
  "use strict";

  var THEME_KEY = "am-theme";
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch (e) {}
      });
    }

    var navToggle = document.querySelector(".nav-toggle");
    var navList = document.querySelector(".nav-list");
    if (navToggle && navList) {
      navToggle.addEventListener("click", function () {
        var open = navList.getAttribute("data-open") === "true";
        navList.setAttribute("data-open", open ? "false" : "true");
        navToggle.setAttribute("aria-expanded", open ? "false" : "true");
      });
      navList.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          navList.setAttribute("data-open", "false");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  });
})();
