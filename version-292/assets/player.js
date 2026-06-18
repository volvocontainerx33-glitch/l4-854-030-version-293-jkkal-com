import { H as Hls } from './hls-vendor-dru42stk.js';

var playerBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

playerBlocks.forEach(function (block) {
  var video = block.querySelector('video');
  var layer = block.querySelector('.play-layer');
  var started = false;
  var hlsInstance = null;

  if (!video) {
    return;
  }

  function begin() {
    if (started) {
      video.play().catch(function () {});
      return;
    }

    started = true;

    if (layer) {
      layer.hidden = true;
    }

    var streamUrl = video.getAttribute('data-video');

    if (!streamUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(function () {});
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = streamUrl;
    video.play().catch(function () {});
  }

  if (layer) {
    layer.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (!started) {
      begin();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
});
