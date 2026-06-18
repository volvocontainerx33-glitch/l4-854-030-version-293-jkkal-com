(function () {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('site-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('.poster img, .hero-cover img, .compact-thumb img').forEach(function (image) {
        image.addEventListener('error', function () {
            var parent = image.parentElement;
            if (parent) {
                parent.classList.add('image-ready');
            }
            image.remove();
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards(input, list, countNode, emptyNode) {
        var keyword = normalize(input.value);
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search-text]'));
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search-text'));
            var matched = !keyword || text.indexOf(keyword) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (countNode) {
            countNode.textContent = '共 ' + visible + ' 部作品';
        }
        if (emptyNode) {
            emptyNode.hidden = visible !== 0;
        }
    }

    document.querySelectorAll('[data-page-filter]').forEach(function (input) {
        var section = input.closest('.content-section');
        var list = section ? section.querySelector('[data-filter-list]') : null;
        var emptyNode = section ? section.querySelector('[data-empty-state]') : null;

        if (list) {
            input.addEventListener('input', function () {
                filterCards(input, list, null, emptyNode);
            });
        }
    });

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var input = searchPage.querySelector('[data-search-input]');
        var list = searchPage.querySelector('[data-search-list]');
        var countNode = searchPage.querySelector('[data-results-count]');
        var emptyNode = searchPage.querySelector('[data-empty-state]');

        if (input && list) {
            input.value = params.get('q') || '';
            filterCards(input, list, countNode, emptyNode);
            input.addEventListener('input', function () {
                filterCards(input, list, countNode, emptyNode);
            });
        }
    }

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var prepared = false;
        var hlsInstance = null;

        function prepareVideo() {
            if (!video || prepared) {
                return;
            }

            var stream = video.getAttribute('data-stream');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            prepared = true;
        }

        if (button && video) {
            button.addEventListener('click', function () {
                prepareVideo();
                video.play().catch(function () {});
                button.classList.add('is-hidden');
            });

            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
