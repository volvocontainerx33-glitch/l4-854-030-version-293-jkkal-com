(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let active = 0;

        function showSlide(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        const input = panel.querySelector('.filter-input');
        const select = panel.querySelector('.filter-select');
        const list = document.querySelector('[data-card-list]');
        if (!list) {
            return;
        }
        const cards = Array.from(list.querySelectorAll('.video-card'));

        function applyFilter() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            const year = select ? select.value.trim() : '';
            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title || '',
                    card.dataset.tags || '',
                    card.dataset.category || '',
                    card.dataset.year || ''
                ].join(' ').toLowerCase();
                const yearMatch = !year || (card.dataset.year || '').indexOf(year) !== -1;
                const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle('is-filtered-out', !(yearMatch && keywordMatch));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (select) {
            select.addEventListener('change', applyFilter);
        }
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        const video = player.querySelector('video');
        const overlay = player.querySelector('[data-play-overlay]');
        const button = player.querySelector('[data-play-button]');
        const url = player.getAttribute('data-video-url');
        let started = false;
        let hls = null;

        function playVideo() {
            if (!video || !url) {
                return;
            }
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.setAttribute('controls', 'controls');
            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = url;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                playVideo();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', function () {
                playVideo();
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });

    const searchPage = document.querySelector('[data-search-page]');
    if (searchPage && Array.isArray(window.SEARCH_DATA)) {
        const input = document.getElementById('searchInput');
        const button = document.getElementById('searchButton');
        const results = searchPage.querySelector('[data-search-results]');
        const status = searchPage.querySelector('[data-search-status]');
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';

        function escapeHtml(value) {
            return String(value).replace(/[&<>'"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[char];
            });
        }

        function cardTemplate(item) {
            const tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="video-card">',
                '<a class="card-cover" href="' + escapeHtml(item.url) + '">',
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="card-badge">' + escapeHtml(item.category) + '</span>',
                '</a>',
                '<div class="card-body">',
                '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
                '<p class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></p>',
                '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
                '<div class="tag-row">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function doSearch() {
            const keyword = input.value.trim().toLowerCase();
            if (!keyword) {
                results.innerHTML = '';
                status.textContent = '输入关键词查看相关影视内容';
                return;
            }
            const terms = keyword.split(/\s+/).filter(Boolean);
            const matched = window.SEARCH_DATA.filter(function (item) {
                const haystack = [
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.category,
                    item.oneLine,
                    (item.tags || []).join(' ')
                ].join(' ').toLowerCase();
                return terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });
            }).slice(0, 120);
            results.innerHTML = matched.map(cardTemplate).join('');
            status.textContent = matched.length ? '为你找到相关内容' : '暂无匹配内容';
        }

        input.value = initial;
        button.addEventListener('click', doSearch);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                doSearch();
            }
        });
        doSearch();
    }
})();
