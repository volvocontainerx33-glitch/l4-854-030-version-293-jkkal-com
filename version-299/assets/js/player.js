(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.video-player[data-src]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var source = player.getAttribute('data-src');
    var attached = false;

    if (!video || !source) {
      return;
    }

    var attach = function () {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      attached = true;
    };

    var start = function () {
      attach();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playing = video.play();

      if (playing && playing.catch) {
        playing.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  });
}());
