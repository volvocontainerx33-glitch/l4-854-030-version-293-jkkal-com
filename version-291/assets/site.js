(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var forms = document.querySelectorAll('[data-search-form]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var value = input ? input.value.trim() : '';
      var url = './search.html';
      if (value) {
        url += '?q=' + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }
  showSlide(0);

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  if (filterInput && query) {
    filterInput.value = query;
  }
  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var region = filterSelect ? filterSelect.value : '';
    var visibleCount = 0;
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var cardRegion = card.getAttribute('data-region') || '';
      var ok = (!keyword || haystack.indexOf(keyword) !== -1) && (!region || cardRegion === region);
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visibleCount += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }
  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }
  if (cards.length) {
    applyFilter();
  }
})();

function initPlayer(mediaUrl) {
  var video = document.querySelector('[data-player-video]');
  var mask = document.querySelector('[data-player-mask]');
  if (!video || !mediaUrl) {
    return;
  }

  var started = false;
  function attachMedia() {
    if (started) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
    } else {
      video.src = mediaUrl;
    }
  }

  function playVideo() {
    attachMedia();
    if (mask) {
      mask.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (mask) {
    mask.addEventListener('click', playVideo);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    if (mask) {
      mask.classList.add('is-hidden');
    }
  });
}
