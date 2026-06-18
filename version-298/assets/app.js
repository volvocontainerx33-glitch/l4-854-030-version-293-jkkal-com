(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var menuPanel = document.querySelector("[data-menu-panel]");

    if (menuToggle && menuPanel) {
      menuToggle.addEventListener("click", function () {
        menuPanel.classList.toggle("is-open");
      });
    }

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var sliders = document.querySelectorAll("[data-hero-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      show(0);
      start();
    });

    var scopes = document.querySelectorAll(".js-filter-scope");
    scopes.forEach(function (scope) {
      var input = scope.querySelector(".js-card-search");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (input && query) {
        input.value = query;
      }

      function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
      }

      function filter() {
        var keyword = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          card.classList.toggle("is-hidden-card", keyword && haystack.indexOf(keyword) === -1);
        });
      }

      if (input) {
        input.addEventListener("input", filter);
        filter();
      }
    });
  });
})();
