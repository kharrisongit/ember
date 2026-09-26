"""Build deterministic idle poses from Runa's approved first frame.
Only translate the upper body by one native pixel and edit the eyelids.
Run from the repository root. Requires Pillow.
"""
from PIL import Image
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SPRITES = ROOT / 'assets/sprites'
base = Image.open(SPRITES / 'hollybeck-runa-idle-base.png').convert('RGBA')
assert base.size == (24, 30)
def pose(breathe=False, blink=0):
    frame = base.copy()
    if blink:
        # Both eyes close completely. Hair, cheeks and nose stay untouched.
        for xs, skin in [((8, 9), base.getpixel((10, 12))), ((13, 14), base.getpixel((12, 12)))]:
            for x in xs:
                frame.putpixel((x, 11), skin)
                frame.putpixel((x, 12), base.getpixel((10, 5)) if blink == 2 else base.getpixel((9, 11)))
    if breathe:
        # A one-pixel settling of head, scarf and hands; coat hem/feet stay fixed.
        upper = frame.crop((0, 0, 24, 21))
        frame.paste((0, 0, 0, 0), (0, 0, 24, 22))
        frame.paste(upper, (0, 1))
    return frame
frames = [pose(), pose(), pose(True), pose(True, 1), pose(True, 2), pose(True, 1), pose(True), pose()]
sheet = Image.new('RGBA', (192, 30))
for i, frame in enumerate(frames):
    sheet.paste(frame, (24*i, 0))
    assert frame.crop((0,22,24,30)).tobytes() == base.crop((0,22,24,30)).tobytes()
assert frames[0].tobytes() == frames[1].tobytes() == frames[7].tobytes()
assert frames[2].tobytes() == frames[6].tobytes()
assert frames[3].tobytes() == frames[5].tobytes()
for i in (3,4,5):
    changes = [(x,y) for y in range(30) for x in range(24) if frames[i].getpixel((x,y)) != frames[2].getpixel((x,y))]
    assert changes and all(x in (8,9,13,14) and y in (12,13) for x,y in changes)
sheet.save(SPRITES / 'hollybeck-runa-south-idle.png')
print('PASS: eight deterministic poses; fixed feet/hem; blink changes only eye pixels')
