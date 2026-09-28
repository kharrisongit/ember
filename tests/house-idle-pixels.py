"""Check the actual packed pixels, including face stability and house scope."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
people = json.loads((root / 'assets/interiors/house-idle-manifest.json').read_text())
sheet = Image.open(root / 'assets/interiors/house-seated-v2.png').convert('RGBA')
assert sheet.size == (192, 2400)
assert len(people) == 44
assert len({p['sprite'] for p in people}) == 44
for person in people:
    assert person['map'].startswith('house'), person['name']
    y = person['row'] * 48
    frames = [sheet.crop((f * 48, y, (f + 1) * 48, y + 48)) for f in range(4)]
    assert set(frames[0].getchannel('A').tobytes()) <= {0, 255}
    for f in (1, 2, 3):
        changed = 0
        for yy in range(48):
            for xx in range(48):
                if frames[0].getpixel((xx, yy)) == frames[f].getpixel((xx, yy)):
                    continue
                changed += 1
                allowed = yy >= person['breathTop'] if f == 1 else any(
                    x <= xx < right and top <= yy < bottom
                    for x, top, right, bottom in person['eyes'])
                assert allowed, (person['name'], f, xx, yy)
        assert changed, (person['name'], 'static animation', f)
        assert frames[0].crop((0, 45, 48, 48)).tobytes() == frames[f].crop((0, 45, 48, 48)).tobytes()
    assert frames[0].crop((0, 0, 48, person['breathTop'])).tobytes() == frames[1].crop((0, 0, 48, person['breathTop'])).tobytes()
print('PASS: 44 unique house sprites; fixed faces during breathing, eyelid-only blinks, and identical table contact.')
