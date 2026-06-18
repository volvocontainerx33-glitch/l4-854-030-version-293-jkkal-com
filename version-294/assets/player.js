document.addEventListener('DOMContentLoaded', function () {
    var holder = document.querySelector('[data-player]');
    if (!holder) {
        return;
    }

    var video = holder.querySelector('video');
    var layer = holder.querySelector('[data-play-layer]');
    var button = holder.querySelector('[data-play-button]');
    var stream = holder.getAttribute('data-stream');
    var started = false;
    var hls = null;

    function startPlayer() {
        if (!video || !stream) {
            return;
        }

        if (!started) {
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            video.controls = true;
            if (layer) {
                layer.classList.add('is-hidden');
            }
        }

        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', startPlayer);
    }
    if (layer) {
        layer.addEventListener('click', startPlayer);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (!started) {
                startPlayer();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
});
