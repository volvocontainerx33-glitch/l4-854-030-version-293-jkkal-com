(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = document.body.classList.toggle('menu-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
      button.textContent = opened ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCardFilters() {
    qsa('[data-card-filter], [data-rank-filter]').forEach(function (form) {
      var section = form.closest('main');
      var scope = section ? qs('[data-filter-scope]', section) : null;
      if (!scope) {
        return;
      }
      var keyword = qs('input[name="keyword"]', form);
      var year = qs('select[name="year"]', form);
      var cards = qsa('.movie-card, .ranking-item', scope);

      function apply() {
        var key = normalize(keyword && keyword.value);
        var selectedYear = normalize(year && year.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region')
          ].join(' '));
          var yearText = normalize(card.getAttribute('data-year'));
          var matchedKeyword = !key || text.indexOf(key) !== -1;
          var matchedYear = !selectedYear || yearText === selectedYear;
          card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear));
        });
      }

      form.addEventListener('input', apply);
      form.addEventListener('change', apply);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  function createSearchCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.setAttribute('data-title', movie.title || '');
    article.setAttribute('data-year', movie.year || '');
    article.setAttribute('data-genre', movie.genre || '');
    article.setAttribute('data-region', movie.region || '');
    article.innerHTML = [
      '<a class="poster-link" href="' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-chip">播放</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '<h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var results = qs('#search-results');
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q'));
    var formInput = qs('.search-page-form input[name="q"]');
    var summary = qs('.search-summary');
    if (formInput) {
      formInput.value = params.get('q') || '';
    }
    results.innerHTML = '';
    if (!query) {
      return;
    }
    var matched = window.SITE_MOVIES.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.region,
        movie.year,
        movie.genre,
        movie.category,
        movie.oneLine
      ].join(' '));
      return text.indexOf(query) !== -1;
    }).slice(0, 120);
    if (summary) {
      summary.textContent = matched.length ? '为你找到相关影视内容。' : '未找到匹配内容，请更换关键词。';
    }
    matched.forEach(function (movie) {
      results.appendChild(createSearchCard(movie));
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.2/dist/hls.min.js';
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = qs('#movie-player');
    var cover = qs('.player-cover');
    if (!video || !streamUrl) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function hideCover() {
      if (cover) {
        cover.classList.add('hidden');
      }
    }

    function playVideo() {
      hideCover();
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {});
      }
    }

    function attachNative() {
      video.src = streamUrl;
      attached = true;
      playVideo();
    }

    function attachHls() {
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            attached = true;
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
        } else {
          attachNative();
        }
      });
    }

    function start() {
      if (attached) {
        playVideo();
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachNative();
      } else {
        attachHls();
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', hideCover);
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();
