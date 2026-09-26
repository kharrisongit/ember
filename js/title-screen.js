/* The existing mounted Corin/Aurelius frames, rendered as a title silhouette.
   This small scene loads before the world atlas and owns no game state. */
(() => {
  const actor = document.getElementById('titleRider');
  const canvas = document.getElementById('titleRiderArt');
  if (!actor || !canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sheet = new Image();
  let frames, raf = 0, lastFrame = -1, departed = false, departure;
  let arrive;
  const arrival = new Promise(resolve => { arrive = resolve; });

  function draw(time) {
    if (departed) return;
    const frame = reduced ? 0 : Math.floor(time / 125) % 9;
    if (frame !== lastFrame) {
      lastFrame = frame;
      ctx.clearRect(0, 0, 128, 128);
      ctx.drawImage(frames, frame * 128, 0, 128, 128, 0, 0, 128, 128);
    }
    if (!reduced) raf = requestAnimationFrame(draw);
  }

  sheet.onload = () => {
    frames = document.createElement('canvas');
    frames.width = sheet.width; frames.height = sheet.height;
    const g = frames.getContext('2d', { willReadFrequently: true });
    g.drawImage(sheet, 0, 0);
    const pixels = g.getImageData(0, 0, frames.width, frames.height);
    const p = pixels.data;
    for (let i = 0; i < p.length; i += 4) {
      // Same magenta export-matte key as the in-game mounted atlas decoder.
      const purple = p[i] > p[i+1] + 24 && p[i+2] > p[i+1] + 24 &&
        p[i] > p[i+2] * .65 && p[i+2] > p[i] * .55 && Math.max(p[i], p[i+2]) > 65;
      if (purple && p[i+1] < Math.max(p[i], p[i+2]) * .5) p[i+3] = 0;
      p[i] = p[i+1] = p[i+2] = 0;
    }
    g.putImageData(pixels, 0, 0);
    draw(performance.now());
    const flight = actor.animate(reduced ? [{opacity:0}, {opacity:1}] : [
      {transform:'translate(calc(-50vw - 100%), -38px) rotate(-7deg)', opacity:1},
      {transform:'translate(12px, -5px) rotate(2deg)', opacity:1, offset:.82},
      {transform:'translate(0, 0) rotate(0)', opacity:1}
    ], {duration:reduced ? 180 : 1450, delay:reduced ? 0 : 1150,
      easing:'cubic-bezier(.18,.68,.25,1)', fill:'forwards'});
    flight.finished.catch(() => {}).then(arrive);
  };
  // An unavailable decoration must never prevent opening the title menu.
  sheet.onerror = () => { actor.hidden = true; arrive(); };
  sheet.src = 'assets/ui/title-rider-source.webp?v=20260926-1';

  window.EmberTitleScreen = {
    depart() {
      if (departure) return departure;
      departure = (async () => {
        await arrival;
        if (!actor.hidden) {
          const flight = actor.animate(reduced ? [{opacity:1}, {opacity:0}] : [
            {transform:'translate(0, 0) rotate(0)', opacity:1},
            {transform:'translate(-8px, 5px) rotate(-5deg)', opacity:1, offset:.13},
            {transform:'translate(calc(50vw + 100%), -100px) rotate(-12deg)', opacity:1}
          ], {duration:reduced ? 180 : 1000, easing:'cubic-bezier(.5,0,.8,.5)', fill:'forwards'});
          await flight.finished.catch(() => {});
        }
        departed = true;
        cancelAnimationFrame(raf);
        actor.hidden = true;
      })();
      return departure;
    }
  };
})();
