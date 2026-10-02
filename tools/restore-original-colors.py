#!/usr/bin/env python3
"""Restore reviewed Cute Fantasy RGB pixels without changing sprite geometry.

Usage: python tools/restore-original-colors.py /path/to/Cute_Fantasy.zip [--check]
Requires Pillow. The manifest records exact source crops and before/after hashes;
custom recolors and unmatched artwork are deliberately absent. --check verifies
already restored pixels. The supplied source archive is not redistributed.
"""
import argparse
import base64
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
manifest = json.loads((root / 'tools/original-color-restoration.json').read_text())
assert hashlib.sha256(args.archive.read_bytes()).hexdigest() == manifest['archive_sha256'], 'Wrong source archive'
asset_path = root / 'assets/game-assets.js'
text = asset_path.read_text()
match = re.search(r'window.EMBER_ASSETS.ATLAS_PAGES = (.*);', text)
pages = json.loads(match[1])
base_pages = [page.copy() for page in pages]
loader_path = root / 'assets/original-colors.js'
if args.check:
    loader = loader_path.read_text()
    for i, bounds, length, expected_hash, source in json.loads(re.search(r'const replacements = (.*);', loader)[1]):
        assert pages[i][:4] == bounds and len(pages[i][4]) == length, 'Base atlas changed'
        pages[i][4] = source
replacements = []
def fingerprint(source):
    value = 2166136261
    for char in source:
        value = ((value ^ ord(char)) * 16777619) & 0xffffffff
    return value
images, originals, allowed, sources = {}, {}, {}, {}
archive = zipfile.ZipFile(args.archive)

def image(index):
    if index not in images:
        images[index] = Image.open(io.BytesIO(base64.b64decode(pages[index][4].split(',')[1]))).convert('RGBA')
        originals[index] = images[index].copy()
        allowed[index] = set()
    return images[index]

def read_rect(box):
    x, y, right, bottom = box
    out = Image.new('RGBA', (right-x, bottom-y))
    hits = []
    for i, (px, py, w, h, _) in enumerate(pages):
        left, top, r, b = max(x, px), max(y, py), min(right, px+w), min(bottom, py+h)
        if r > left and b > top:
            out.paste(image(i).crop((left-px, top-py, r-px, b-py)), (left-x, top-y))
            hits.append((i, left, top, r, b))
    assert hits, ('Missing atlas pixels', box)
    return out, hits

changed = 0
for entry in manifest['restorations']:
    name = entry['sprite']
    box = entry['atlas_box']
    old, hits = read_rect(box)
    digest = hashlib.sha256(old.tobytes()).hexdigest()
    assert digest in (entry['before_sha256'], entry['after_sha256']), ('Artwork changed since review', name, entry['frame'])
    if args.check:
        assert digest == entry['after_sha256'], ('Not restored', name, entry['frame'])
    if entry['source'] not in sources:
        sources[entry['source']] = Image.open(io.BytesIO(archive.read(entry['source']))).convert('RGBA')
    original = sources[entry['source']].crop(entry['source_box'])
    assert original.size == old.size
    pixels = []
    for source, current in zip(original.get_flattened_data(), old.get_flattened_data()):
        # Keep the game's alpha, including its existing shadow removal.
        assert (source[3] >= 128) == (current[3] > 0), ('Silhouette mismatch', name)
        pixels.append((*source[:3], current[3]) if current[3] else current)
    restored = Image.new('RGBA', old.size)
    restored.putdata(pixels)
    assert hashlib.sha256(restored.tobytes()).hexdigest() == entry['after_sha256'], ('Source mismatch', name)
    x, y, _, _ = box
    for i, left, top, right, bottom in hits:
        px, py, _, _, _ = pages[i]
        part = restored.crop((left-x, top-y, right-x, bottom-y))
        image(i).paste(part, (left-px, top-py))
        allowed[i].update((xx-px, yy-py) for yy in range(top, bottom) for xx in range(left, right))
    changed += digest != entry['after_sha256']

for i, im in images.items():
    before = originals[i]
    assert before.size == im.size
    assert before.getchannel('A').tobytes() == im.getchannel('A').tobytes(), 'Transparency changed'
    # Prove that no neighboring sprite or unrelated pixel was altered.
    for pos, (a, b) in enumerate(zip(before.get_flattened_data(), im.get_flattened_data())):
        if a != b:
            assert (pos % im.width, pos // im.width) in allowed[i], 'Pixel outside reviewed rectangles changed'
    if not args.check and before.tobytes() != im.tobytes():
        buffer = io.BytesIO()
        im.save(buffer, format='WEBP', lossless=True, exact=True, method=6)
        encoded = buffer.getvalue()
        assert Image.open(io.BytesIO(encoded)).convert('RGBA').tobytes() == im.tobytes(), 'Lossy encode'
        old_url = pages[i][4]
        new_url = 'data:image/webp;base64,' + base64.b64encode(encoded).decode()
        replacements.append([i, pages[i][:4], len(old_url), fingerprint(old_url), new_url])
if not args.check:
    header = '/* Original Cute Fantasy colors, restored from the supplied source pack.\n * Only replace reviewed atlas pages. A fingerprint guard protects later edits\n * to the base artwork; sprite metadata, shadows and animation layout are intact.\n * Generated by tools/restore-original-colors.py. */\n(function () {\n  const replacements = '
    footer = ";\n  const pages = window.EMBER_ASSETS.ATLAS_PAGES;\n  function fingerprint(source) {\n    let hash = 2166136261;\n    for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);\n    return hash >>> 0;\n  }\n  for (const [index, bounds, length, hash, source] of replacements) {\n    const page = pages[index];\n    if (!page || bounds.some((v, i) => page[i] !== v) || page[4].length !== length || fingerprint(page[4]) !== hash) {\n      console.warn('Original color restoration skipped: base atlas page changed', index);\n      continue;\n    }\n    page[4] = source;\n  }\n})();\n"
    loader_path.write_text(header + json.dumps(replacements, separators=(',', ':')) + footer)
print(f"{'Verified' if args.check else 'Restored'} {len(manifest['restorations'])} frames across "
      f"{len(set(e['sprite'] for e in manifest['restorations']))} sprites; "
      f"{len(images)} atlas pages checked, {changed} frames updated. Alpha and unrelated pixels preserved.")
