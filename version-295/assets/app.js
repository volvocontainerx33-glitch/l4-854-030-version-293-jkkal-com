(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (!value) {
                return;
            }
            var root = form.getAttribute('data-root') || './';
            window.location.href = root + 'search.html?q=' + encodeURIComponent(value);
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-note]');

    var applyFilter = function () {
        if (!cards.length) {
            return;
        }
        var q = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region')).toLowerCase();
            var okText = !q || text.indexOf(q) > -1;
            var okType = !type || card.getAttribute('data-type') === type;
            var okYear = !year || card.getAttribute('data-year') === year;
            var ok = okText && okType && okYear;
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    };

    if (filterInput || typeSelect || yearSelect) {
        [filterInput, typeSelect, yearSelect].forEach(function (item) {
            if (item) {
                item.addEventListener('input', applyFilter);
                item.addEventListener('change', applyFilter);
            }
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && filterInput) {
            filterInput.value = q;
        }
        applyFilter();
    }

    var preparePlayer = function (frame) {
        var video = frame.querySelector('video[data-stream]');
        if (!video) {
            return Promise.resolve();
        }
        var stream = video.getAttribute('data-stream');
        if (!video.getAttribute('data-ready')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.hlsEngine = hls;
            } else {
                video.src = stream;
            }
            video.setAttribute('data-ready', '1');
        }
        frame.classList.add('is-playing');
        video.controls = true;
        return video.play().catch(function () {});
    };

    document.querySelectorAll('.player-frame').forEach(function (frame) {
        var cover = frame.querySelector('.player-cover');
        if (cover) {
            cover.addEventListener('click', function (event) {
                event.preventDefault();
                preparePlayer(frame);
            });
        }
        frame.addEventListener('click', function (event) {
            if (event.target === frame) {
                preparePlayer(frame);
            }
        });
    });

    var backtop = document.querySelector('[data-backtop]');
    if (backtop) {
        backtop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
