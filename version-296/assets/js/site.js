(function () {
    var activeHls = new WeakMap();

    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector('.nav-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector('.hero-carousel');
        if (!carousel) {
            return;
        }
        var slides = all('.hero-slide', carousel);
        var dots = all('[data-slide-to]', carousel);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide-to')) || 0);
                start();
            });
        });

        show(0);
        start();
    }

    function cardMatches(card, query) {
        if (!query || query === 'all') {
            return true;
        }
        var source = [
            card.getAttribute('data-title'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.textContent
        ].join(' ');
        return normalize(source).indexOf(normalize(query)) !== -1;
    }

    function filterCards(query) {
        var list = document.querySelector('[data-card-list]');
        var cards = list ? all('.movie-card, .rank-row', list) : [];
        if (!cards.length) {
            return false;
        }
        cards.forEach(function (card) {
            card.classList.toggle('is-hidden', !cardMatches(card, query));
        });
        return true;
    }

    function setupSearch() {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('search') || '';
        if (initial) {
            all('[data-search-form] input[name="search"]').forEach(function (input) {
                input.value = initial;
            });
            filterCards(initial);
            var library = document.querySelector('[data-card-list]');
            if (library) {
                window.setTimeout(function () {
                    library.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 120);
            }
        }

        all('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="search"]');
                var query = input ? input.value.trim() : '';
                if (!query) {
                    filterCards('all');
                    return;
                }
                if (filterCards(query)) {
                    var list = document.querySelector('[data-card-list]');
                    if (list) {
                        list.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    return;
                }
                var target = form.getAttribute('data-search-target') || './index.html';
                window.location.href = target + '?search=' + encodeURIComponent(query);
            });
        });
    }

    function setupFilters() {
        all('.filter-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                all('.filter-chip', chip.parentNode).forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                filterCards(chip.getAttribute('data-filter') || 'all');
            });
        });
    }

    function attachSource(shell) {
        var video = shell.querySelector('video');
        var source = shell.getAttribute('data-source');
        if (!video || !source || activeHls.has(video)) {
            return video;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            activeHls.set(video, hls);
        } else {
            video.src = source;
            activeHls.set(video, true);
        }
        return video;
    }

    function playVideo(shell) {
        var video = attachSource(shell);
        if (!video) {
            return;
        }
        var promise = video.play();
        shell.classList.add('is-playing');
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                shell.classList.remove('is-playing');
            });
        }
    }

    function setupPlayers() {
        all('[data-player]').forEach(function (shell) {
            var start = shell.querySelector('.player-start');
            var play = shell.querySelector('.control-play');
            var mute = shell.querySelector('.control-mute');
            var full = shell.querySelector('.control-fullscreen');
            var video = shell.querySelector('video');

            if (start) {
                start.addEventListener('click', function () {
                    playVideo(shell);
                });
            }
            if (play) {
                play.addEventListener('click', function () {
                    var activeVideo = attachSource(shell);
                    if (!activeVideo) {
                        return;
                    }
                    if (activeVideo.paused) {
                        playVideo(shell);
                    } else {
                        activeVideo.pause();
                    }
                });
            }
            if (mute) {
                mute.addEventListener('click', function () {
                    var activeVideo = attachSource(shell);
                    if (!activeVideo) {
                        return;
                    }
                    activeVideo.muted = !activeVideo.muted;
                    mute.textContent = activeVideo.muted ? '取消静音' : '静音';
                });
            }
            if (full) {
                full.addEventListener('click', function () {
                    var target = video || shell;
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (target.requestFullscreen) {
                        target.requestFullscreen();
                    }
                });
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        playVideo(shell);
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener('play', function () {
                    shell.classList.add('is-playing');
                    if (play) {
                        play.textContent = '暂停';
                    }
                });
                video.addEventListener('pause', function () {
                    if (play) {
                        play.textContent = '播放';
                    }
                });
            }
        });
    }

    function setupBackTop() {
        all('.back-top').forEach(function (button) {
            button.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupCarousel();
        setupSearch();
        setupFilters();
        setupPlayers();
        setupBackTop();
    });
}());
