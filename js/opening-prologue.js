/* Temporary cinema surface. BOOT owns the world lock and bedroom handoff.
   Only the current and next illustrations are retained/decoded. */
(() => {
  const chapters = window.EmberPrologueChapters;
  if (!Array.isArray(chapters) || !chapters.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const imageURL = chapter => 'assets/prologue/' + chapter.image + '.webp?v=20261003-2';
  let active = false, playing = null;

  function loadPicture(chapter, signal) {
    return new Promise(resolve => {
      const picture = new Image();
      let settled = false;
      const abort = () => finish(false);
      const finish = ok => {
        if (settled) return;
        settled = true; clearTimeout(timeout);
        signal.removeEventListener('abort', abort);
        picture.onload = picture.onerror = null;
        if (!ok) picture.removeAttribute('src');
        resolve(ok ? picture : null);
      };
      const timeout = setTimeout(() => finish(false), 10000);
      picture.onload = () => finish(true);
      picture.onerror = () => finish(false);
      signal.addEventListener('abort', abort, { once: true });
      picture.src = imageURL(chapter);
    });
  }

  async function play() {
    if (playing) return playing;
    playing = run();
    try { await playing; } finally { playing = null; }
  }

  async function run() {
    active = true;
    const root = document.createElement('section');
    root.id = 'openingPrologue'; root.tabIndex = -1;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'prologueTitle');
    root.setAttribute('aria-describedby', 'prologueInstructions');
    root.innerHTML = `
      <div class="prologue-art"><div class="prologue-image"></div></div>
      <div class="prologue-shade" aria-hidden="true"></div>
      <article class="prologue-copy scrolls">
        <p class="prologue-era"></p><h2 id="prologueTitle"></h2>
        <div class="prologue-rule" aria-hidden="true"><i></i><span>◆</span><i></i></div>
        <p class="prologue-narration" aria-live="polite" aria-atomic="true"></p>
      </article>
      <div class="prologue-hud" inert aria-hidden="true">
        <header class="prologue-top"><span>THE CHRONICLE OF EMBERFELL</span><button id="prologueSkip" type="button">Skip intro</button></header>
        <footer class="prologue-bottom">
          <div class="prologue-progress" aria-hidden="true"><i></i></div>
          <div class="prologue-controls"><span class="prologue-count"></span>
            <button id="prologueBack" type="button" aria-label="Previous scene">‹</button>
            <button id="prologuePause" type="button" aria-pressed="false">Pause</button>
            <button id="prologueNext" type="button">Next →</button>
          </div>
        </footer>
      </div>
      <p class="prologue-sr" id="prologueInstructions">Tap the picture to briefly show controls. A or Right Arrow advances. P pauses. Escape skips. Tab reveals keyboard controls.</p>`;
    const art = root.querySelector('.prologue-art');
    const pictureHost = root.querySelector('.prologue-image');
    const copy = root.querySelector('.prologue-copy');
    const era = root.querySelector('.prologue-era');
    const title = root.querySelector('h2');
    const narration = root.querySelector('.prologue-narration');
    const hud = root.querySelector('.prologue-hud');
    const counter = root.querySelector('.prologue-count');
    const progress = root.querySelector('.prologue-progress i');
    const skip = root.querySelector('#prologueSkip');
    const back = root.querySelector('#prologueBack');
    const next = root.querySelector('#prologueNext');
    const pause = root.querySelector('#prologuePause');
    let index = -1, beat = -1, ended = false, changing = false, paused = false;
    let elapsed = 0, lastTick = performance.now(), timer = 0, transition = 0, controlsTimer = 0;
    let keyboardControls = false, panAnimation = null, captionAnimation = null, resizeObserver;
    const pictures = new Map();
    let resolveDone;
    const done = new Promise(resolve => { resolveDone = resolve; });
    const suspended = [document.getElementById('stage'), document.getElementById('deck')]
      .filter(Boolean).map(el => ({ el, inert: el.inert }));
    const moving = () => paused || document.hidden || ended || changing;
    function prepare(n) {
      if (n < 0 || n >= chapters.length) return Promise.resolve(null);
      if (!pictures.has(n)) {
        const controller = new AbortController();
        pictures.set(n, { controller, promise: loadPicture(chapters[n], controller.signal) });
      }
      return pictures.get(n).promise;
    }
    function trimPictures() {
      for (const [n, picture] of pictures) {
        if (n === index || n === index + 1) continue;
        picture.controller.abort(); pictures.delete(n);
      }
    }
    function syncPause() {
      pause.textContent = paused ? 'Resume' : 'Pause';
      pause.setAttribute('aria-pressed', String(paused));
      root.dataset.paused = String(paused);
      lastTick = performance.now();
      if (panAnimation) moving() ? panAnimation.pause() : panAnimation.play();
    }
    function hideControls() {
      if (keyboardControls || ended) return;
      root.classList.remove('controls-visible');
      if (hud.contains(document.activeElement)) root.focus({ preventScroll: true });
      hud.inert = true; hud.setAttribute('aria-hidden', 'true');
    }
    function revealControls(keyboard = false) {
      if (ended) return;
      keyboardControls = keyboard;
      clearTimeout(controlsTimer);
      hud.inert = false; hud.setAttribute('aria-hidden', 'false');
      root.classList.add('controls-visible');
      if (!keyboard) controlsTimer = setTimeout(hideControls, 1200);
    }
    function togglePause() { if (!ended) { paused = !paused; syncPause(); } }
    function cancelAnimations() {
      panAnimation?.cancel(); captionAnimation?.cancel();
      panAnimation = captionAnimation = null;
    }
    // Size the image to cover the entire viewport. A portrait phone travels
    // through the wide scene instead of displaying a small letterboxed image.
    // The only continuous visual work is this one compositor transform.
    function framePan() {
      const picture = pictureHost.querySelector('img');
      if (!picture || index < 0 || ended) return;
      panAnimation?.cancel(); panAnimation = null;
      const bounds = art.getBoundingClientRect();
      const scale = Math.max(bounds.width / picture.naturalWidth, bounds.height / picture.naturalHeight) * 1.035;
      const width = picture.naturalWidth * scale, height = picture.naturalHeight * scale;
      picture.style.width = width + 'px'; picture.style.height = height + 'px';
      const [from, to] = chapters[index].pan || [.35, .65];
      const x = u => -(width - bounds.width) * u;
      const y = -(height - bounds.height) * .36;
      const transform = u => 'translate3d(' + x(u) + 'px,' + y + 'px,0)';
      picture.style.transform = transform(reduced ? (from + to) / 2 : from);
      if (!reduced && picture.animate) {
        panAnimation = picture.animate([{ transform: transform(from) }, { transform: transform(to) }],
          { duration: chapters[index].duration, easing: 'linear', fill: 'forwards' });
        panAnimation.currentTime = elapsed;
        if (moving()) panAnimation.pause();
      }
    }
    function showBeat(n) {
      if (n === beat || index < 0) return;
      beat = n;
      captionAnimation?.cancel(); captionAnimation = null;
      narration.textContent = chapters[index].lines[n];
      if (!reduced && narration.animate) {
        captionAnimation = narration.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 600, easing: 'ease-out', fill: 'both' });
      }
    }
    async function finish() {
      if (ended) return;
      ended = true; ++transition; clearInterval(timer); clearTimeout(controlsTimer); cancelAnimations();
      root.classList.remove('is-visible');
      next.disabled = back.disabled = pause.disabled = skip.disabled = true;
      await wait(reduced ? 80 : 650);
      resolveDone();
    }
    async function showChapter(n) {
      if (ended || changing) return;
      if (n >= chapters.length) { void finish(); return; }
      if (n < 0) return;
      changing = true; next.disabled = back.disabled = true;
      const token = ++transition;
      syncPause(); root.classList.add('is-changing');
      const [picture] = await Promise.all([prepare(n), wait(index < 0 ? 0 : reduced ? 50 : 500)]);
      if (ended || token !== transition) return;
      cancelAnimations(); index = n; elapsed = 0; beat = -1;
      const chapter = chapters[index];
      pictureHost.replaceChildren();
      if (picture) { picture.alt = chapter.alt; pictureHost.appendChild(picture); }
      era.textContent = chapter.era; title.textContent = chapter.title;
      copy.scrollTop = 0;
      counter.textContent = (index + 1) + ' / ' + chapters.length;
      next.textContent = index === chapters.length - 1 ? 'Begin →' : 'Next →';
      progress.style.transform = 'scaleX(' + index / chapters.length + ')';
      framePan(); showBeat(0);
      root.classList.remove('is-changing');
      changing = false; next.disabled = false; back.disabled = index === 0;
      syncPause();
      trimPictures(); void prepare(index + 1);
    }
    function advance(n) {
      void showChapter(n).catch(error => { console.warn('Prologue scene unavailable', error); void finish(); });
    }
    function keydown(event) {
      event.stopImmediatePropagation();
      const key = event.key.toLowerCase();
      revealControls(true);
      if (key === 'tab') {
        const buttons = [skip, back, pause, next].filter(button => !button.disabled);
        const current = buttons.indexOf(document.activeElement), step = event.shiftKey ? -1 : 1;
        buttons[(current + step + buttons.length) % buttons.length]?.focus();
        event.preventDefault(); return;
      }
      if (['a', ' ', 'enter', 'arrowright', 'arrowleft', 'escape', 'b', 'p'].includes(key)) event.preventDefault();
      if (event.repeat) return;
      if (key === 'escape' || key === 'b') void finish();
      else if (key === 'p') togglePause();
      else if ((key === 'enter' || key === ' ') && event.target === skip) void finish();
      else if ((key === 'enter' || key === ' ') && event.target === pause) togglePause();
      else if (key === 'arrowleft' || ((key === 'enter' || key === ' ') && event.target === back)) advance(index - 1);
      else if (['a', ' ', 'enter', 'arrowright'].includes(key)) advance(index + 1);
    }
    // A tap ONLY reveals controls; it never also skips a scene. Click handlers
    // on the actual buttons perform the action and renew the brief reveal.
    root.addEventListener('pointerdown', () => revealControls(false), { passive: true });
    root.addEventListener('pointerup', () => revealControls(false), { passive: true });
    skip.addEventListener('click', finish);
    next.addEventListener('click', () => advance(index + 1));
    back.addEventListener('click', () => advance(index - 1));
    pause.addEventListener('click', togglePause);
    try {
      document.body.appendChild(root);
      document.body.classList.add('prologue-active');
      hud.inert = true;
      suspended.forEach(({ el }) => { el.inert = true; });
      window.addEventListener('keydown', keydown, true);
      document.addEventListener('visibilitychange', syncPause);
      window.addEventListener('resize', framePan);
      if (typeof ResizeObserver !== 'undefined') { resizeObserver = new ResizeObserver(framePan); resizeObserver.observe(art); }
      root.getBoundingClientRect(); root.classList.add('is-visible'); root.focus({ preventScroll: true });
      advance(0);
      timer = setInterval(() => {
        const now = performance.now(), dt = Math.min(300, now - lastTick); lastTick = now;
        if (moving() || index < 0) return;
        elapsed += dt;
        const chapter = chapters[index];
        showBeat(Math.min(chapter.lines.length - 1, Math.floor(elapsed / chapter.duration * chapter.lines.length)));
        progress.style.transform = 'scaleX(' + (index + Math.min(1, elapsed / chapter.duration)) / chapters.length + ')';
        if (elapsed >= chapter.duration) advance(index + 1);
      }, 100);
      await done;
    } finally {
      ended = true; ++transition; clearInterval(timer); clearTimeout(controlsTimer); cancelAnimations();
      for (const { controller } of pictures.values()) controller.abort();
      pictures.clear(); resizeObserver?.disconnect();
      window.removeEventListener('keydown', keydown, true);
      document.removeEventListener('visibilitychange', syncPause);
      window.removeEventListener('resize', framePan);
      suspended.forEach(({ el, inert }) => { el.inert = inert; });
      root.remove(); document.body.classList.remove('prologue-active'); active = false;
    }
  }
  window.EmberPrologue = { play, get active() { return active; } };
})();
