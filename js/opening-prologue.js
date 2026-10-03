/* New-game history. Owns its temporary presentation only; never changes a save,
   quest, character, or world clock. BOOT keeps gameplay locked until it resolves. */
(() => {
  const chapters = [
    {
      title: 'The age of riders', era: 'Emberfell · Before Wingfall', image: '01-seven-riders', duration: 17000,
      alt: 'Seven dragonriders fly above the fields, roads and villages of Emberfell.',
      text: 'Once, seven Dragonriders watched over Emberfell. Dragon and rider were companions, bound by trust. Together they drove monsters from the roads, and people could travel between the towns without fear. Halvard rode among them.'
    },
    {
      title: 'Wingfall', era: 'Fifty years ago', image: '02-wingfall', duration: 15500,
      alt: 'A rider turns against his companions amid storm clouds and dragonfire.',
      text: 'Then Halvard turned on the other six. The fellowship that had guarded Emberfell was broken by one of its own. The betrayal became known as Wingfall. In its wake, the riders no longer watched over the land.'
    },
    {
      title: 'The usurper king', era: 'Cinderhold', image: '03-halvard', duration: 17000,
      alt: 'King Halvard sits on the throne of Cinderhold beneath his winged crown.',
      text: 'Halvard seized the throne. He spent the years that followed making certain no new rider could challenge him. Worship of dragons was forbidden. Those who remembered the old days learned to choose their words carefully.'
    },
    {
      title: 'Fifty silent years', era: 'A kingdom under Halvard', image: '04-silenced-realm', duration: 17000,
      alt: 'An overgrown road passes a deserted rider temple and a weathered dragon statue.',
      text: 'No dragon was seen openly in Emberfell. Monsters spread from the wilds onto the roads, and the towns grew isolated. Yet the past survived—in old books, whispered stories, and the memories of people who refused to forget.'
    },
    {
      title: 'An ordinary morning', era: 'Millwood · The present day', image: '05-millwood-dawn', duration: 14500,
      alt: 'Dawn reaches a home in Millwood, with a windmill and golden fields beyond.',
      text: 'Far from the throne, life went on in Millwood. Corin, a miller’s son, had grown up beneath a sky without riders. This morning, he had every reason to expect another ordinary day.'
    }
  ];
  const imageURL = chapter => 'assets/prologue/' + chapter.image + '.webp?v=20261003-1';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = false, playing = null;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Load only when New Game is selected. A missing picture gets a painted-dark
  // fallback without holding up the captions, skip control, or game startup.
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
    root.id = 'openingPrologue';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'prologueTitle');
    root.innerHTML = `
      <header class="prologue-top"><span>THE CHRONICLE OF EMBERFELL</span><button id="prologueSkip" type="button">Skip intro</button></header>
      <div class="prologue-art"><div class="prologue-image"></div><div class="prologue-vignette" aria-hidden="true"></div></div>
      <article class="prologue-copy scrolls" aria-live="polite" aria-atomic="true"><p class="prologue-era"></p><h2 id="prologueTitle"></h2><p class="prologue-narration"></p></article>
      <footer class="prologue-bottom"><div class="prologue-progress" aria-hidden="true">${chapters.map(() => '<span><i></i></span>').join('')}</div><div class="prologue-controls"><span class="prologue-count"></span><button id="prologuePause" type="button" aria-pressed="false">Pause</button><button id="prologueNext" type="button">Next <span aria-hidden="true">→</span></button></div></footer>`;
    const pictureHost = root.querySelector('.prologue-image');
    const copy = root.querySelector('.prologue-copy');
    const era = root.querySelector('.prologue-era');
    const title = root.querySelector('h2');
    const narration = root.querySelector('.prologue-narration');
    const counter = root.querySelector('.prologue-count');
    const segments = [...root.querySelectorAll('.prologue-progress span')];
    const skip = root.querySelector('#prologueSkip');
    const next = root.querySelector('#prologueNext');
    const pause = root.querySelector('#prologuePause');
    let index = -1, ended = false, changing = false, paused = false;
    let elapsed = 0, lastTick = performance.now(), timer = 0, transition = 0;
    const animations = [];
    let resolveDone;
    const done = new Promise(resolve => { resolveDone = resolve; });
    const loads = new AbortController();
    const pictures = chapters.map(chapter => loadPicture(chapter, loads.signal));
    const suspended = [document.getElementById('stage'), document.getElementById('deck')]
      .filter(Boolean).map(el => ({ el, inert: el.inert }));
    const moving = () => paused || document.hidden || ended || changing;
    function cancelAnimations() { animations.splice(0).forEach(animation => animation.cancel()); }
    function syncPause() {
      pause.textContent = paused ? 'Resume' : 'Pause';
      pause.setAttribute('aria-pressed', String(paused));
      lastTick = performance.now();
      for (const animation of animations) moving() ? animation.pause() : animation.play();
    }
    function togglePause() { if (!ended) { paused = !paused; syncPause(); } }
    async function finish() {
      if (ended) return;
      ended = true; ++transition; clearInterval(timer); cancelAnimations();
      root.classList.remove('is-visible');
      next.disabled = pause.disabled = skip.disabled = true;
      await wait(reduced ? 80 : 650);
      resolveDone();
    }
    async function showChapter(nextIndex) {
      if (ended || changing) return;
      if (nextIndex >= chapters.length) { void finish(); return; }
      changing = true;
      next.disabled = true;
      const token = ++transition;
      root.classList.add('is-changing');
      // Let the current illustration fade before replacing it. At most one
      // photograph-sized layer moves; no canvas particles or perpetual effects.
      const [picture] = await Promise.all([pictures[nextIndex], wait(index < 0 ? 0 : reduced ? 50 : 350)]);
      if (ended || token !== transition) return;
      cancelAnimations();
      index = nextIndex; elapsed = 0;
      const chapter = chapters[index];
      pictureHost.replaceChildren();
      if (picture) { picture.alt = chapter.alt; pictureHost.appendChild(picture); }
      era.textContent = chapter.era;
      title.textContent = chapter.title;
      narration.textContent = chapter.text;
      copy.scrollTop = 0;
      counter.textContent = (index + 1) + ' / ' + chapters.length;
      next.textContent = index === chapters.length - 1 ? 'Begin →' : 'Next →';
      segments.forEach((segment, n) => {
        segment.classList.toggle('complete', n < index);
        segment.classList.toggle('current', n === index);
      });
      if (picture && !reduced && picture.animate) {
        animations.push(picture.animate([
          { transform: 'scale(1.015) translateY(0)' },
          { transform: 'scale(1.075) translateY(-1%)' }
        ], { duration: chapter.duration + 1000, easing: 'linear', fill: 'forwards' }));
      }
      if (segments[index]?.firstElementChild?.animate) {
        animations.push(segments[index].firstElementChild.animate([
          { transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }
        ], { duration: chapter.duration, easing: 'linear', fill: 'forwards' }));
      }
      root.classList.remove('is-changing');
      changing = false; next.disabled = false;
      syncPause();
      if (index === 0) next.focus({ preventScroll: true });
    }
    function keydown(event) {
      if (event.key === 'Tab') {
        const buttons = [skip, pause, next].filter(button => !button.disabled);
        const current = buttons.indexOf(document.activeElement);
        const step = event.shiftKey ? -1 : 1;
        buttons[(current + step + buttons.length) % buttons.length]?.focus();
        event.preventDefault(); event.stopImmediatePropagation(); return;
      }
      // Capture on window before the game's controls, including movement keys.
      event.stopImmediatePropagation();
      const key = event.key.toLowerCase();
      if (['a', ' ', 'enter', 'arrowright', 'escape', 'b', 'p'].includes(key)) event.preventDefault();
      if (event.repeat) return;
      if (key === 'escape' || key === 'b') void finish();
      else if (key === 'p') togglePause();
      else if ((key === 'enter' || key === ' ') && event.target === skip) void finish();
      else if ((key === 'enter' || key === ' ') && event.target === pause) togglePause();
      else if (['a', ' ', 'enter', 'arrowright'].includes(key)) void showChapter(index + 1);
    }
    skip.addEventListener('click', finish);
    next.addEventListener('click', () => void showChapter(index + 1));
    pause.addEventListener('click', togglePause);
    try {
      document.body.appendChild(root);
      document.body.classList.add('prologue-active');
      suspended.forEach(({ el }) => { el.inert = true; });
      window.addEventListener('keydown', keydown, true);
      document.addEventListener('visibilitychange', syncPause);
      root.getBoundingClientRect();
      root.classList.add('is-visible');
      skip.focus({ preventScroll: true });
      // Do not await image loading here: Skip must work even on a slow network.
      void showChapter(0).catch(error => { console.warn('Prologue chapter unavailable', error); void finish(); });
      timer = setInterval(() => {
        const now = performance.now(), dt = Math.min(300, now - lastTick); lastTick = now;
        if (moving() || index < 0) return;
        elapsed += dt;
        if (elapsed >= chapters[index].duration) void showChapter(index + 1);
      }, 100);
      await done;
    } finally {
      ended = true; ++transition; clearInterval(timer); cancelAnimations();
      loads.abort();
      window.removeEventListener('keydown', keydown, true);
      document.removeEventListener('visibilitychange', syncPause);
      suspended.forEach(({ el, inert }) => { el.inert = inert; });
      root.remove(); document.body.classList.remove('prologue-active');
      active = false;
    }
  }
  window.EmberPrologue = { play, get active() { return active; } };
})();
