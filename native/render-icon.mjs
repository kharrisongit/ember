// Regenerate with the same rest pose and matte key as js/title-screen.js.
// Run with @napi-rs/canvas installed: node native/render-icon.mjs
import {createRequire} from 'node:module';
import {readFile, writeFile} from 'node:fs/promises';
const require = createRequire(import.meta.url);
const {createCanvas, loadImage} = require('@napi-rs/canvas');
const source = await readFile(new URL('../assets/ui/title-rider-source.webp', import.meta.url));
async function render(source) {
    const sheet = await loadImage(source);
    const pose = createCanvas(128, 128);
    const pctx = pose.getContext('2d');
    pctx.drawImage(sheet, 2 * 128, 0, 128, 128, 0, 0, 128, 128);
    const pixels = pctx.getImageData(0, 0, 128, 128), p = pixels.data;
    for (let i = 0; i < p.length; i += 4) {
      const purple = p[i] > p[i+1] + 24 && p[i+2] > p[i+1] + 24 &&
        p[i] > p[i+2] * .65 && p[i+2] > p[i] * .55 && Math.max(p[i], p[i+2]) > 65;
      if (purple && p[i+1] < Math.max(p[i], p[i+2]) * .5) p[i+3] = 0;
      p[i] = p[i+1] = p[i+2] = 0;
    }
    pctx.putImageData(pixels, 0, 0);
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d', {alpha: false});
    ctx.fillStyle = '#0b1c2c'; ctx.fillRect(0, 0, 1024, 1024);
    const sky = ctx.createRadialGradient(512, 490, 60, 512, 490, 640);
    sky.addColorStop(0, '#426663'); sky.addColorStop(.55, '#183b48'); sky.addColorStop(1, '#071524');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1024, 1024);
    // Sparse stars and green-gold halo echo the existing title screen.
    for (const [x, y, size] of [[145,220,4], [810,150,7], [869,660,4], [227,860,5], [665,893,3]]) {
      ctx.fillStyle = '#d9e5c0';
      ctx.beginPath(); ctx.moveTo(x,y-size); ctx.lineTo(x+size*.28,y-size*.28);
      ctx.lineTo(x+size,y); ctx.lineTo(x+size*.28,y+size*.28);
      ctx.lineTo(x,y+size); ctx.lineTo(x-size*.28,y+size*.28);
      ctx.lineTo(x-size,y); ctx.lineTo(x-size*.28,y-size*.28); ctx.closePath(); ctx.fill();
    }
    const silhouette = createCanvas(1024, 1024);
    const sctx = silhouette.getContext('2d');
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(pose, 128, 40, 800, 800);
    // Filter the full padded canvas so the halo is not clipped to the sprite rectangle.
    ctx.filter = 'drop-shadow(0 0 7px #d8e5ba) drop-shadow(0 0 34px #a0d2c499)';
    ctx.drawImage(silhouette, 0, 0);
    return canvas.toBuffer('image/png');
}
await writeFile(new URL('Resources/AppIcon.png', import.meta.url), await render(source));
