(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    backTop.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var index = 0;

    var activate = function (nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5000);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var reset = panel.querySelector('[data-filter-reset]');
    var scope = document.querySelector(panel.getAttribute('data-filter-panel'));
    var empty = document.querySelector('[data-filter-empty]');

    if (!scope) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var yearMatched = !yearValue || card.getAttribute('data-year') === yearValue;
        var typeMatched = !typeValue || card.getAttribute('data-type') === typeValue;
        var keywordMatched = !keyword || searchText.indexOf(keyword) !== -1;
        var matched = yearMatched && typeMatched && keywordMatched;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (type) {
          type.value = '';
        }
        apply();
      });
    }
  });

  var searchHost = document.querySelector('[data-search-results]');

  if (searchHost && window.MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var safe = function (value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    };
    var matches = window.MOVIES.filter(function (movie) {
      if (!query) {
        return true;
      }
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' '),
        movie.year
      ].join(' ').toLowerCase().indexOf(query) !== -1;
    });
    var limited = matches.slice(0, 240);

    searchHost.innerHTML = limited.length ? limited.map(function (movie) {
      return [
        '<article class="movie-card" data-title="' + safe(movie.title) + '" data-year="' + safe(movie.year) + '" data-region="' + safe(movie.region) + '" data-type="' + safe(movie.type) + '" data-genre="' + safe(movie.genre) + '">',
        '  <a href="' + safe(movie.url) + '">',
        '    <div class="card-cover">',
        '      <img src="' + safe(movie.cover) + '" alt="' + safe(movie.title) + '" loading="lazy">',
        '      <span class="cover-year">' + safe(movie.year) + '</span>',
        '      <span class="play-badge">▶</span>',
        '    </div>',
        '    <div class="card-info">',
        '      <h3>' + safe(movie.title) + '</h3>',
        '      <p>' + safe(movie.oneLine) + '</p>',
        '      <div class="meta-row">',
        '        <span>' + safe(movie.region) + '</span>',
        '        <span>' + safe(movie.type) + '</span>',
        '      </div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('\n');
    }).join('\n') : '<div class="filter-empty is-visible">没有找到相关内容</div>';

    var lead = document.querySelector('[data-search-lead]');

    if (lead) {
      lead.textContent = query ? '搜索关键词：' + params.get('q') : '输入关键词可以快速查找影片、地区、年份与类型。';
    }
  }
}());
