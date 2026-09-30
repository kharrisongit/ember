"""Extract the supplied Herbalist stirring animation without repainting its art."""
import base64
import io
import json
from pathlib import Path
import struct
import sys
import zipfile
import zlib
from PIL import Image

root = Path(__file__).resolve().parents[1]
with zipfile.ZipFile(sys.argv[1]) as pack:
    data = pack.read('ASEPRITE/Herbalist/Herbalist_boiler_stirring/Herbalist_boiler_stirring.aseprite')
_, magic, count, width, height, depth = struct.unpack_from('<IHHHHH', data)
assert magic == 0xA5E0 and depth == 32
layers, frames, durations = [], [], []
offset = 128
for frame in range(count):
    size, magic, chunks, duration = struct.unpack_from('<IHHH', data, offset)
    assert magic == 0xF1FA
    cursor, cels = offset + 16, {}
    for _ in range(chunks):
        length, kind = struct.unpack_from('<IH', data, cursor)
        chunk = data[cursor+6:cursor+length]
        if kind == 0x2004:
            flags, layer_type, _, _, _, blend, opacity = struct.unpack_from('<HHHHHHB', chunk)
            assert blend == 0
            layers.append((flags & 1, layer_type, opacity))
        elif kind == 0x2005:
            layer, x, y, opacity, cel_type = struct.unpack_from('<HhhBH', chunk)
            assert cel_type in (0, 2)
            w, h = struct.unpack_from('<HH', chunk, 16)
            pixels = zlib.decompress(chunk[20:]) if cel_type == 2 else chunk[20:]
            cel = Image.frombytes('RGBA', (w, h), pixels)
            alpha = opacity * layers[layer][2] / 65025
            if alpha < 1:
                cel.putalpha(cel.getchannel('A').point(lambda v: round(v * alpha)))
            cels[layer] = (cel, x, y)
        cursor += length
    output = Image.new('RGBA', (width, height))
    for layer, (visible, layer_type, _) in enumerate(layers):
        if visible and not layer_type and layer in cels:
            cel, x, y = cels[layer]
            output.alpha_composite(cel, (x, y))
    frames.append(output)
    durations.append(duration)
    offset += size
# Remove only the common transparent rows below the hearth; all twelve cells
# retain the same origin, including the highest bubbles and stirring ladle.
height = max(frame.getbbox()[3] for frame in frames)
strip = Image.new('RGBA', (width * count, height))
for i, frame in enumerate(frames):
    strip.paste(frame.crop((0, 0, width, height)), (i * width, 0))
encoded = io.BytesIO()
strip.save(encoded, format='PNG', optimize=True)
asset = {'width': width, 'height': height, 'frames': count, 'durations': durations,
         'image': 'data:image/png;base64,' + base64.b64encode(encoded.getvalue()).decode()}
(root/'assets/nan-cooking.js').write_text('/* Supplied CraftPix Herbalist pack: full stirring cycle. */\nwindow.NAN_COOKING_DATA = '+json.dumps(asset)+';\n')
print(f'Extracted {count} RGBA frames at {width}×{height}, {sum(durations)} ms per loop.')
