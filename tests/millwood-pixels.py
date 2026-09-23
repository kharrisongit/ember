"""Recompose authored crops and compare every pixel with the original atlas rooms."""
import base64, gzip, io, json, re, sys
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
source = (root / 'js/generated/game-part-1.js').read_text()
sprites = json.loads(gzip.decompress(base64.b64decode(re.search(r'const ATLAS_GZ = "([^"]+)', source)[1])))['sprites']
source = (root / 'assets/game-assets.js').read_text()
pages = json.loads(re.search(r'window.EMBER_ASSETS.ATLAS_PAGES = (.*);', source)[1])
folder = root / 'assets/interiors' / (sys.argv[1] if len(sys.argv)>1 else 'millwood')
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
    for obj in sorted(layout['objects'], key=lambda o: -1000 if o['flat'] else o.get('sortY', o['y']+o['h'])):
        result.alpha_composite(cut(obj['rect']), (obj['x'],obj['y']))
    assert result.tobytes() == original.tobytes(), name
print(f'PASS: all {len(layouts)} rooms match their original art pixel for pixel.')
# A reassembled room alone cannot detect holes concealed by another object.
for layout in layouts.values():
    for obj in layout['objects']:
        piece = cut(obj['rect'])
        if obj['name'] == 'dining-table' and (folder.name in ('millwood','thornwell') or (folder.name == 'sandspire' and obj['w'] == 39)):
            assert all(piece.getpixel((x,y))[3] == 255 for y in range(34,43) for x in range(12,25)), 'Incomplete table apron'
        if obj['name'] == 'north-chair' and folder.name != 'hollybeck':
            assert piece.size == (12,22), 'Incomplete north chair'
            assert not any(r > 130 and b > 100 and g < 130 and a for r,g,b,a in piece.getdata()), 'Flower pixels attached to chair'
if folder.name in ('millwood','thornwell'):
    print('PASS: separated dining tables have complete aprons; back chairs are complete and contain no flower pixels.')
elif folder.name == 'forgewick':
    for layout in layouts.values():
        objects = {o['name']: o for o in layout['objects']}
        if 'table' in objects:
            assert cut(objects['table']['rect']).size in ((47,23),(47,25))
            assert cut(objects['chair']['rect']).size == (12,22)
        rug = cut(objects['rug']['rect'])
        # Neither table feet nor chair pixels may remain attached to the rug.
        sample = next(v for k,v in layouts.items() if k == 'house06_bedroom')
        reference = cut(next(o['rect'] for o in sample['objects'] if o['name'] == 'rug'))
        allowed = set(reference.convert('RGB').getdata())
        assert all((r,g,b) in allowed for r,g,b,a in rug.getdata() if a), 'Furniture pixels left on rug'
    print('PASS: Forgewick tables and chairs are complete; rugs contain no furniture pixels.')
elif folder.name == 'sandspire':
    palette={(174,35,52),(110,39,39),(251,107,29),(46,34,47)}
    for layout in layouts.values():
        for obj in layout['objects']:
            if obj['name']=='rug':
                assert all((r,g,b) in palette for r,g,b,a in cut(obj['rect']).getdata() if a), 'Furniture pixels left on Sandspire rug'
    print('PASS: Sandspire rugs contain no foreign furniture colours; round dining sets retain complete chairs and aprons.')
