document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
            document.body.classList.toggle('no-scroll', panel.classList.contains('open'));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    filters.forEach(function (input) {
        var scope = document.querySelector(input.getAttribute('data-filter-scope')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = document.querySelector(input.getAttribute('data-empty-target'));

        function applyFilter() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent).toLowerCase();
                var match = !value || text.indexOf(value) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }

        input.addEventListener('input', applyFilter);

        if (input.hasAttribute('data-query-input')) {
            var query = new URLSearchParams(window.location.search).get('q');
            if (query) {
                input.value = query;
            }
        }

        applyFilter();
    });
});
