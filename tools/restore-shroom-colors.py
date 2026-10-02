#!/usr/bin/env python3
"""Restore reviewed ShroomLands crops, retaining the game's alpha and geometry.

Usage: python tools/restore-shroom-colors.py Cute_Fantasy_ShroomLands.zip [--check]
The original archive is not redistributed. Green mushroom props become coral;
green Shroomlings become violet, using the source shading in every frame.
"""
import argparse
import base64
import colorsys
import hashlib
import io
import json
from pathlib import Path
import re
import zipfile
from PIL import Image

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('archive', type=Path)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
manifest = json.loads((root / 'tools/shroom-color-restoration.json').read_text())
assert hashlib.sha256(args.archive.read_bytes()).hexdigest() == manifest['archive_sha256'], 'Wrong source archive'
pages = json.loads(re.search(r'window.EMBER_ASSETS.ATLAS_PAGES = (.*);', (root / 'assets/game-assets.js').read_text())[1])
# Compose after the earlier Cute Fantasy restoration; never revert those colors.
for i, bounds, length, digest, source in json.loads(re.search(r'const replacements = (.*);', (root / 'assets/original-colors.js').read_text())[1]):
    assert pages[i][:4] == bounds and len(pages[i][4]) == length
    pages[i][4] = source
images, before, allowed = {}, {}, {}
archive = zipfile.ZipFile(args.archive)
sources = {Path(n).name: n for n in archive.namelist() if n.endswith('.png')}

def fingerprint(source):
    value = 2166136261
    for char in source:
        value = ((value ^ ord(char)) * 16777619) & 0xffffffff
    return value

def page_image(i):
    if i not in images:
        images[i] = Image.open(io.BytesIO(base64.b64decode(pages[i][4].split(',')[1]))).convert('RGBA')
        before[i] = images[i].copy()
        allowed[i] = set()
    return images[i]

def contrasting_pixel(pixel, npc):
    r, g, b, alpha = pixel
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if .19 <= h <= .55 and s > .12:
        hue = (.78 if npc else .035) + (h - .33) * .25
        r, g, b = [round(c * 255) for c in colorsys.hsv_to_rgb(hue, s, v)]
    return r, g, b, alpha

for entry in manifest['restorations']:
    x, y, right, bottom = entry['atlas_box']
    current = Image.new('RGBA', (right-x, bottom-y))
    hits = []
    for i, (px, py, w, h, _) in enumerate(pages):
        l, t, r, b = max(x, px), max(y, py), min(right, px+w), min(bottom, py+h)
        if r > l and b > t:
            current.paste(page_image(i).crop((l-px, t-py, r-px, b-py)), (l-x, t-y))
            hits.append((i, l, t, r, b))
    assert hits and hashlib.sha256(current.tobytes()).hexdigest() == entry['before_sha256'], ('Base sprite changed', entry['sprite'])
    source = Image.open(io.BytesIO(archive.read(sources[entry['source']]))).convert('RGBA').crop(entry['source_box'])
    pixels = []
    for original, old in zip(source.get_flattened_data(), current.get_flattened_data()):
        assert (original[3] >= 128) == (old[3] > 0), ('Silhouette changed', entry['sprite'])
        if 'green' in entry['sprite'] or entry['sprite'] == 'sh_glow':
            original = contrasting_pixel(original, entry['sprite'].startswith('npc_') or entry['sprite'] == 'sh_glow')
        pixels.append((*original[:3], old[3]) if old[3] else old)
    restored = Image.new('RGBA', current.size)
    restored.putdata(pixels)
    if not entry['sprite'].startswith(('sh_rock', 'sh_snail', 'sh_house')):
        assert not any(a and g > r+8 and g > b+5 for r, g, b, a in pixels), ('Green mushroom pixel remains', entry['sprite'])
    for i, l, t, r, b in hits:
        px, py = pages[i][:2]
        page_image(i).paste(restored.crop((l-x, t-y, r-x, b-y)), (l-px, t-py))
        allowed[i].update((xx-px, yy-py) for yy in range(t, b) for xx in range(l, r))

replacements = []
destination = root / 'assets/sprites/shroom-restored'
if not args.check:
    destination.mkdir(parents=True, exist_ok=True)
for i, im in images.items():
    old = before[i]
    assert im.getchannel('A').tobytes() == old.getchannel('A').tobytes(), 'Alpha changed'
    for pos, (a, b) in enumerate(zip(old.get_flattened_data(), im.get_flattened_data())):
        if a != b:
            assert (pos % im.width, pos // im.width) in allowed[i], 'Unrelated pixel changed'
    filename = f'page-{i}.webp'
    if args.check:
        assert Image.open(destination / filename).convert('RGBA').tobytes() == im.tobytes(), ('Restoration mismatch', filename)
    else:
        encoded = io.BytesIO()
        im.save(encoded, format='WEBP', lossless=True, exact=True, method=6)
        temporary = destination / (filename + '.tmp')
        temporary.write_bytes(encoded.getvalue())
        temporary.replace(destination / filename)
        assert Image.open(destination / filename).convert('RGBA').tobytes() == im.tobytes(), 'Lossy encoding'
    content_hash = hashlib.sha256((destination / filename).read_bytes()).hexdigest()[:12]
    replacements.append([i, pages[i][:4], len(pages[i][4]), fingerprint(pages[i][4]), f'assets/sprites/shroom-restored/{filename}?v={content_hash}'])
if not args.check:
    loader = '''/* Original ShroomLands colors. Generated by tools/restore-shroom-colors.py.
   Loaded after original-colors.js; protects all existing source restorations. */
(function () {
  const replacements = REPLACEMENTS;
  const pages = window.EMBER_ASSETS.ATLAS_PAGES;
  function fingerprint(source) {
    let hash = 2166136261;
    for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
    return hash >>> 0;
  }
  for (const [index, bounds, length, hash, source] of replacements) {
    const page = pages[index];
    if (!page || bounds.some((v, i) => page[i] !== v) || page[4].length !== length || fingerprint(page[4]) !== hash) {
      console.warn('Shroom color restoration skipped: base atlas page changed', index);
      continue;
    }
    page[4] = source;
  }
})();
'''
    (root / 'assets/shroom-original-colors.js').write_text(loader.replace('REPLACEMENTS', json.dumps(replacements, separators=(',', ':'))))
print(f"{'Verified' if args.check else 'Restored'} {len(manifest['restorations'])} frames on {len(images)} pages; alpha and all unrelated pixels preserved.")
