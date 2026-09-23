"""Recompose authored crops and compare every pixel with the original atlas rooms."""
import base64, gzip, io, json, re
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
source = (root / 'js/generated/game-part-1.js').read_text()
sprites = json.loads(gzip.decompress(base64.b64decode(re.search(r'const ATLAS_GZ = "([^"]+)', source)[1])))['sprites']
source = (root / 'assets/game-assets.js').read_text()
pages = json.loads(re.search(r'window.EMBER_ASSETS.ATLAS_PAGES = (.*);', source)[1])
folder = root / 'assets/interiors/millwood'
layouts = json.loads((folder / 'layouts.json').read_text())
sheet = Image.open(folder / 'layers.png')
def cut(rect):
    x,y,w,h = rect
    return sheet.crop((x,y,x+w,y+h))
for name, layout in layouts.items():
    x,y,w,h,*_ = sprites[name + '_room']
    original = Image.new('RGBA', (w,h))
    for px,py,pw,ph,url in pages:
        if px < x+w and py < y+h and px+pw > x and py+ph > y:
            image = Image.open(io.BytesIO(base64.b64decode(url.split(',')[1])))
            original.paste(image, (px-x,py-y))
    result = cut(layout['baseRect'])
    for obj in layout['objects']:
        result.alpha_composite(cut(obj['rect']), (obj['x'],obj['y']))
    assert result.tobytes() == original.tobytes(), name
print(f'PASS: all {len(layouts)} rooms match their original art pixel for pixel.')
