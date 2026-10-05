// Render every shipped bestiary entry with real pixels, including auxiliary boss sheets.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const require = createRequire(import.meta.url);
const {createCanvas, Image, loadImage} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/@napi-rs/canvas' : '@napi-rs/canvas');
const sharp = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/sharp' : 'sharp');
const {run, context: c} = await loadEditorGame(process.cwd(), console, {furniture: false});
const originalCreate = c.document.createElement;
c.document.createElement = tag => tag === 'canvas' ? createCanvas(300, 150) : originalCreate(tag);
c.Image = class extends Image {
  set src(value) {
    const bytes = value.startsWith('data:') ? Buffer.from(value.split(',')[1], 'base64') : fs.readFileSync(value.split('?')[0]);
    // The native decoder can mistake embedded provenance SVGs for the PNG.
    this.pending = sharp(bytes).png().toBuffer().then(pixels => { super.src = pixels; });
  }
  get src() { return super.src; }
  async decode() { await this.pending; return super.decode(); }
};
await run('Promise.all([Frosthorn.prepare(), IceMoth.prepare(), DesertPyramid.prepare(), DesertPyramid.prepareSpiderArt()])');
const entries = run(`BESTIARY.map(entry => {
  const art = FOE_ART[entry.k];
  const sp = SPR[art + '_idle_d'] || SPR[art + '_walk_d'] || SPR[art + '_idle'] || SPR[art + '_walk'];
  return {entry, sp};
})`);
for (const {entry, sp} of entries) assert(sp, entry.k + ' has artwork');
const pages = run('[...ATLAS_PAGES, ...ATLAS_PATCHES]');
for (const [x, y, w, h, src] of pages) {
  if (!entries.some(({sp}) => !sp[5] && sp[0] < x + w && sp[0] + sp[2] > x && sp[1] < y + h && sp[1] + sp[3] > y)) continue;
  c.pageData = {img: await loadImage(src), x, y, w, h};
  run('registerAtlasPage(pageData)');
}
run('registerStoneGolemSprites()');
function bounds(image) {
  const {width, height} = image;
  const pixels = image.getContext('2d').getImageData(0, 0, width, height).data;
  let l = width, t = height, r = -1, b = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (pixels[(y * width + x) * 4 + 3] <= 8) continue;
    l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y);
  }
  return {l, t, r, b, w: r - l + 1, h: b - t + 1, pixels};
}
const preview = createCanvas(760, Math.ceil(entries.length / 6) * 136);
const g = preview.getContext('2d');
g.fillStyle = '#eee4cd'; g.fillRect(0, 0, preview.width, preview.height);
let auxiliaries = 0;
for (const [index, {entry, sp}] of entries.entries()) {
  c.entry = entry; c.spec = sp;
  const frame = run('bookArtFrame(spec)');
  assert(frame, entry.k + ' produces visible pixels');
  assert.equal(frame.source, run('sheetOf(spec)'), entry.k + ' uses its own sheet');
  if (typeof sp[5] === 'string') {
    auxiliaries++;
    assert.notEqual(frame.source, run('atlasImg'), entry.k + ' must not sample scenery');
  }
  for (const size of [96, 260]) {
    const cv = createCanvas(size, size); c.target = cv;
    run('drawBookArt(target, entry, true)');
    const result = bounds(cv);
    assert(result.w > 0 && result.h > 0, entry.k + ' is not blank');
    assert(Math.abs((result.l + result.r + 1) / 2 - size / 2) <= 1, entry.k + ' centered horizontally');
    assert(Math.abs((result.t + result.b + 1) / 2 - size / 2) <= 1, entry.k + ' centered vertically');
    assert(Math.max(result.w, result.h) >= size * .8, entry.k + ' fills its icon');
    assert(result.l > 0 && result.t > 0 && result.r < size - 1 && result.b < size - 1, entry.k + ' is not clipped');
    if (size === 96) {
      const x = (index % 6) * 126 + 15, y = Math.floor(index / 6) * 136 + 6;
      g.drawImage(cv, x, y); g.fillStyle = '#352b2c'; g.font = '11px sans-serif'; g.textAlign = 'center';
      g.fillText(entry.n, x + 48, y + 113, 122);
    }
    run('drawBookArt(target, entry, false)');
    const hidden = bounds(cv);
    assert.deepEqual([hidden.l, hidden.t, hidden.r, hidden.b], [result.l, result.t, result.r, result.b], entry.k + ' keeps the unknown silhouette');
    for (let p = 0; p < hidden.pixels.length; p += 4) if (hidden.pixels[p + 3] === 255)
      assert.deepEqual(Array.from(hidden.pixels.slice(p, p + 3)), [10, 11, 16], entry.k + ' hides undiscovered colors');
  }
  assert.equal(run('bookArtFrame(spec)'), frame, 'Repeated selections reuse measured pixels');
}
assert.equal(auxiliaries, 4, 'Velyss, mummy, Hroth and Veilwing use independent sheets');
// A temporarily empty sheet must recover instead of caching an invisible icon.
c.spec = [0, 0, 12, 12, 1, 'bestiary_test']; c.target = createCanvas(12, 12);
run('animalSheets.bestiary_test = target');
assert.equal(run('bookArtFrame(spec)'), null);
c.target.getContext('2d').fillRect(3, 4, 5, 6);
assert(run('bookArtFrame(spec)'));
if (process.env.EMBER_BESTIARY_PREVIEW) fs.writeFileSync(process.env.EMBER_BESTIARY_PREVIEW, preview.toBuffer('image/png'));
console.log(`PASS: ${entries.length} creatures, ${auxiliaries} auxiliary sheets, centered and fitted 96/260px art, unknown silhouettes, cache reuse and loading recovery.`);
