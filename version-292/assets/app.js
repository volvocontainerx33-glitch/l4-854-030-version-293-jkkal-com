(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
      dot.setAttribute('aria-pressed', String(dotIndex === activeIndex));
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHero(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setHero(activeIndex + 1);
    }, 5200);
  }

  var searchRoot = document.querySelector('[data-search-root]');

  if (searchRoot && window.__MOVIES__) {
    var input = searchRoot.querySelector('[data-search-input]');
    var grid = searchRoot.querySelector('[data-search-grid]');
    var status = searchRoot.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function renderCard(movie) {
      var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
        '</a>',
        '<div class="card-body">',
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p class="card-meta">' + escapeHtml(movie.meta) + '</p>',
        '<p class="card-desc">' + escapeHtml(movie.desc) + '</p>',
        '<div class="tag-list">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function runSearch() {
      var query = normalize(input ? input.value : '');

      if (!query) {
        grid.innerHTML = '<div class="empty-state">输入关键词后即可浏览匹配内容</div>';
        status.textContent = '可按标题、题材、地区、年份搜索';
        return;
      }

      var words = query.split(/\s+/).filter(Boolean);
      var results = window.__MOVIES__.filter(function (movie) {
        var haystack = normalize([movie.title, movie.meta, movie.desc, (movie.tags || []).join(' ')].join(' '));
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 80);

      if (!results.length) {
        grid.innerHTML = '<div class="empty-state">没有找到匹配内容，可尝试更换关键词</div>';
        status.textContent = '当前关键词暂无匹配';
        return;
      }

      grid.innerHTML = results.map(renderCard).join('');
      status.textContent = '已展示匹配结果';
    }

    if (input) {
      input.addEventListener('input', runSearch);
    }

    runSearch();
  }
})();
