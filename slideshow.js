(function () {
    const VIDEO_FALLBACK_MS = 60000;
    const GHOST_OPACITY = '0.2';

    const container = document.querySelector('.stack-container[data-steps]');
    if (!container) return;

    const IMAGE_MIN_MS = Number(container.dataset.dwellMin) || 5000;
    const IMAGE_MAX_MS = Number(container.dataset.dwellMax) || 8000;
    const FIRST_MS = Number(container.dataset.firstMs) || null;
    let firstDone = false;
    const imageMs = () => {
        if (!firstDone && FIRST_MS) {
            firstDone = true;
            return FIRST_MS;
        }
        firstDone = true;
        return IMAGE_MIN_MS + Math.random() * (IMAGE_MAX_MS - IMAGE_MIN_MS);
    };

    const zone = document.getElementById('discovery-zone');
    const steps = container.dataset.steps.split(';').map(s => s.split(','));
    const cache = {};

    function getMedia(id) {
        if (cache[id]) return cache[id];
        const el = document.getElementById(id);
        const video = el.querySelector('video');
        const iframe = el.querySelector('iframe');
        const vimeo = iframe && window.Vimeo ? new Vimeo.Player(iframe) : null;
        const entry = { el, video, iframe, vimeo };
        if (video) video.addEventListener('ended', () => done(id));
        if (vimeo) vimeo.on('ended', () => done(id));
        cache[id] = entry;
        return entry;
    }

    const allIds = [...new Set(steps.flat())];
    allIds.forEach(getMedia);

    let index = 0;
    let active = new Set();
    let paused = false;
    let pending = false;
    let timer = null;
    let armId = 0;

    function playMedia(m) {
        if (m.video) {
            m.video.currentTime = 0;
            m.video.play().catch(() => {});
        }
        if (m.vimeo) {
            m.vimeo.setCurrentTime(0).catch(() => {});
            m.vimeo.play().catch(() => {});
        }
    }

    function stopMedia(m) {
        if (m.video) m.video.pause();
        if (m.vimeo) m.vimeo.pause().catch(() => {});
    }

    function show(ids) {
        const leaving = active;
        active = new Set(ids);
        allIds.forEach(id => {
            const m = getMedia(id);
            m.el.classList.remove('as-pair-1', 'as-pair-2');
            if (active.has(id)) {
                m.el.classList.add('vivid');
                m.el.style.opacity = '1';
                playMedia(m);
            } else {
                m.el.classList.remove('vivid');
                m.el.style.opacity = leaving.has(id) ? GHOST_OPACITY : '0';
                stopMedia(m);
            }
        });
        if (ids.length > 1) {
            getMedia(ids[0]).el.classList.add('as-pair-1');
            getMedia(ids[1]).el.classList.add('as-pair-2');
        }
    }

    function hasVideo(ids) {
        return ids.some(id => getMedia(id).video || getMedia(id).iframe);
    }

    function videoLimitMs(ids) {
        const limits = ids.map(id => {
            const m = getMedia(id);
            if (m.vimeo) {
                return m.vimeo.getDuration()
                    .then(d => d * 1000 + 1500)
                    .catch(() => VIDEO_FALLBACK_MS);
            }
            if (m.video) {
                const d = m.video.duration;
                return Promise.resolve(d && isFinite(d) ? d * 1000 + 1500 : VIDEO_FALLBACK_MS);
            }
            return Promise.resolve(0);
        });
        return Promise.all(limits).then(ms => Math.max(...ms, IMAGE_MIN_MS));
    }

    function arm() {
        clearTimeout(timer);
        armId += 1;
        if (paused) return;
        const ids = steps[index];
        if (!hasVideo(ids)) {
            timer = setTimeout(next, imageMs());
            return;
        }
        // Safety net in case a video never fires "ended".
        const myArm = armId;
        videoLimitMs(ids).then(ms => {
            if (paused || armId !== myArm) return;
            timer = setTimeout(next, ms);
        });
    }

    function done(id) {
        if (!active.has(id)) return;
        if (paused) {
            pending = true;
            return;
        }
        next();
    }

    function next() {
        index = (index + 1) % steps.length;
        show(steps[index]);
        arm();
    }

    function pause() {
        paused = true;
        clearTimeout(timer);
    }

    function resume() {
        paused = false;
        if (pending) {
            pending = false;
            next();
        } else {
            arm();
        }
    }

    zone.addEventListener('mouseenter', pause);
    zone.addEventListener('mouseleave', resume);

    document.querySelectorAll('.fragment-link').forEach(link => {
        const ids = link.dataset.target.split(',').map(s => s.trim());
        link.addEventListener('mouseenter', () => {
            pause();
            const match = steps.findIndex(s => s.join(',') === ids.join(','));
            if (match !== -1) index = match;
            show(ids);
        });
        link.addEventListener('mouseleave', resume);
    });

    show(steps[0]);
    arm();
})();
