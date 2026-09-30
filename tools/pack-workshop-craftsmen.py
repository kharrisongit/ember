"""Join Dunstan's restyled upper body to the original smithing station.

The original 42 frames own the anvil, tools at contact, sparks and bench join.
Never infer these pixels by colour or replace them with a median station.
"""
from pathlib import Path
import base64
import gzip
import io
import json
import re
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/sprites/workshops'


def original_station():
    source = (ROOT/'js/generated/game-part-1.js').read_text()
    sprites = json.loads(gzip.decompress(base64.b64decode(
        re.search(r'const ATLAS_GZ = "([^"]+)"', source)[1])))['sprites']
    x, y, w, h, count = sprites['smithy_anim_8']
    pages = json.loads(re.search(r'window.EMBER_ASSETS.ATLAS_PAGES = (.*);',
        (ROOT/'assets/game-assets.js').read_text())[1])
    # The unpatched native Smith_forge_full.png supplies the original geometry.
    strip = Image.new('RGBA', (w*count, h))
    for px, py, pw, ph, url in pages:
        if px < x+w*count and px+pw > x and py < y+h and py+ph > y:
            page = Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGBA')
            strip.paste(page, (px-x, py-y))
    layout = json.loads((ROOT/'assets/interiors/remaining/layouts.json').read_text())['smithy']
    bench = next(o for o in layout['objects'] if o['name'] == 'workbench')
    bx, by, bw, bh = bench['rect']
    art = Image.open(ROOT/'assets/interiors/remaining/layers.png').convert('RGBA')
    return strip, art.crop((bx, by, bx+bw, by+bh))


def steel_hammer(frame, index):
    # Only the raised hammer head changes palette. The anvil and all native
    # contact/impact pixels are copied afterward, completely unchanged.
    if index not in (3, 4, 5, 9, 10, 11, 15, 16, 17, 21, 22, 23):
        return frame
    bounds = [(55, 28, 74, 44), (59, 15, 80, 35), (62, 0, 86, 24)][(index-3) % 6]
    l, t, r, b = bounds
    region = frame[t:b, l:r]
    rgb = region[:, :, :3].astype(int)
    metal = (rgb[:, :, 2] > rgb[:, :, 0]+7) & (region[:, :, 3] > 0)
    # Neutral steel highlights, distinct from the blue-black anvil surface.
    value = np.clip(rgb.mean(axis=2)*1.2+30, 0, 235).astype('uint8')
    for channel, lift in enumerate((0, 3, 10)):
        region[:, :, channel][metal] = np.minimum(value[metal].astype(int)+lift, 255)
    return frame


def pack():
    native, bench = original_station()
    for action, count in [('work', 42), ('idle', 4)]:
        upper = Image.open(OUT/f'source/dunstan-upper-{action}.png').convert('RGBA')
        frames = []
        for index in range(count):
            source_index = index if action == 'work' else 0
            frame = native.crop((source_index*48, 0, (source_index+1)*48, 48))
            frame = np.array(frame.resize((96, 96), Image.Resampling.NEAREST))
            new_body = np.array(upper.crop((index*96, 0, (index+1)*96, 64)))
            if action == 'work':
                new_body = steel_hammer(new_body, index)
            frame[:64] = new_body
            # Original world anchors: worker (200,192), native frame (176,144),
            # bench (182,185). Their seven-row overlap is part of the artwork.
            joined = Image.new('RGBA', (96, 140))
            joined.alpha_composite(bench.resize((78, 54), Image.Resampling.NEAREST), (12, 82))
            joined.alpha_composite(Image.fromarray(frame))
            frames.append(joined)
        output = Image.new('RGBA', (96*count, 140))
        for index, frame in enumerate(frames):
            output.paste(frame, (index*96, 0))
        output.save(OUT/f'dunstan-{action}.png', optimize=True)
    (OUT/'animation.json').write_text(json.dumps({
        'cell': [96, 140], 'draw': [48, 70], 'origin': [24, 48],
        'workFrames': 42, 'frameSeconds': 0.15, 'idleFrames': 4,
        'nativeStationFromRow': 32, 'benchOffset': [6, 41],
        'collision': [-18, -16, 21, 20],
        'sources': {'work': 'source/dunstan-upper-work.png',
                    'idle': 'source/dunstan-upper-idle.png',
                    'station': 'original smithy_anim_8 and remaining:smithy:16'},
        'selaNativeIdleFrames': [0, 1, 2, 3, 39, 40, 0]
    }, indent=2)+'\n')
    print('Packed 42 work and 4 idle frames with the complete original station.')


if __name__ == '__main__':
    pack()
