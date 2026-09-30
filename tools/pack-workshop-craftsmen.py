"""Register generated Dunstan poses on the existing 48px workshop footprint.

Source art is generated, not painted by this packer. Nearest-neighbour sampling,
hard alpha and a shared station keep the game pixels and prop contacts steady.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/sprites/workshops'


def components(path, columns, count):
    image = np.array(Image.open(path).convert('RGBA'))
    image[:, :, 3] = np.where(image[:, :, 3] >= 180, 255, 0)
    labels, _ = label(image[:, :, 3] > 0)
    parts = []
    for identity, bounds in enumerate(find_objects(labels), 1):
        if np.count_nonzero(labels[bounds] == identity) < 1500:
            continue
        y, x = bounds
        crop = image[y, x].copy()
        crop[:, :, 3] = np.where(labels[bounds] == identity, 255, 0)
        parts.append((y.stop, x.start, Image.fromarray(crop)))
    parts.sort(key=lambda p: p[0])
    ordered = []
    for start in range(0, len(parts), columns):
        ordered.extend(sorted(parts[start:start + columns], key=lambda p: p[1]))
    assert len(ordered) == count, (path, len(ordered))
    return [p[2] for p in ordered]


def register(pose, height=None):
    width = 64
    height = height or round(pose.height * width / pose.width)
    result = Image.new('RGBA', (96, 96))
    result.paste(pose.resize((width, height), Image.Resampling.NEAREST), (16, 94-height))
    return np.array(result)


primary = components(OUT/'source/dunstan-work-idle.png', 7, 39)
finish = components(OUT/'source/dunstan-finish.png', 4, 7)
work = [register(p) for p in primary[:35]] + [register(p, 76) for p in finish]

# The generated cell positions vary slightly; one common station prevents anvil
# and feet shimmer. Lift the moving steel/sparks back above it frame by frame.
station = work[5].copy()
for y in range(65, 86):
    for x in range(16, 80):
        r, g, b, a = map(int, station[y, x])
        if a and (b > r or min(r, g, b) > 115):
            samples = []
            for frame in work:
                rr, gg, bb, aa = map(int, frame[y, x])
                if aa and bb > rr+12 and gg > rr and rr < 125:
                    samples.append(frame[y, x])
            if samples:
                station[y, x] = np.median(samples, axis=0).astype('uint8')

for frame in work:
    moving = frame.copy()
    frame[65:] = station[65:]
    rgb = moving[:, :, :3].astype(int)
    steel = (rgb.min(axis=2) > 145) & (rgb.max(axis=2)-rgb.min(axis=2) < 90) & (moving[:, :, 3] > 0)
    steel[:65] = False
    steel[86:] = False
    frame[steel] = moving[steel]

# Register the generated four conversation poses to one face and fixed station.
# The breathing pose only moves the apron/shoulders by one source pixel. Eyelid
# crops come from the generated half/closed blink, without changing the hair.
idle_sources = [register(p, 76) for p in primary[35:]]
rest = idle_sources[0].copy()
rest[65:] = station[65:]
idle = [rest.copy() for _ in range(4)]
idle[1][48:64, 25:72] = rest[49:65, 25:72]
for index in (2, 3):
    idle[index][38:45, 33:63] = idle_sources[index][38:45, 33:63]

# A shared palette removes coloured generation fringes without introducing
# interpolation. Derive it from opaque interior pixels, not the edge matte.
from scipy.ndimage import binary_erosion
pixels = np.concatenate([f[binary_erosion(f[:, :, 3] > 0, iterations=2), :3]
                         for f in work+idle])
palette = Image.fromarray(pixels.reshape((1, len(pixels), 3))).quantize(colors=48)
for name, frames in [('work', work), ('idle', idle)]:
    strip = Image.fromarray(np.concatenate(frames, axis=1))
    alpha = strip.getchannel('A')
    strip = strip.convert('RGB').quantize(palette=palette, dither=Image.Dither.NONE).convert('RGBA')
    strip.putalpha(alpha)
    strip.save(OUT/f'dunstan-{name}.png', optimize=True)

(OUT/'animation.json').write_text(json.dumps({
    'cell': [96, 96], 'draw': [48, 48], 'workFrames': 42,
    'frameSeconds': 0.15, 'idleFrames': 4,
    'sources': {'work': ['dunstan-work-idle.png:0-34', 'dunstan-finish.png:0-6'],
                'idle': 'dunstan-work-idle.png:35-38'},
    'selaNativeIdleFrames': [0, 1, 2, 3, 39, 40, 0]
}, indent=2)+'\n')
print('Packed Dunstan: 42 work poses, 4 registered conversation poses.')
