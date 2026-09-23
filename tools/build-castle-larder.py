"""Build the larder backdrop from the existing Cinderhold gallery tiles."""
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
sheet = Image.open(root / 'assets/interiors/remaining/layers.png').convert('RGBA')
layouts = json.loads((root / 'assets/interiors/remaining/layouts.json').read_text())

def room(name):
    x, y, w, h = layouts[name]['baseRect']
    return sheet.crop((x, y, x+w, y+h))

gallery = room('royal_westhall')
guardroom = room('royal_guardroom')
out = Image.new('RGBA', (320, 288))

# Reuse Cinderhold's red wall, ivory columns and cornice. Fill in the gallery's
# central doorway because the storeroom has only its existing southern exit.
wall = gallery.crop((0, 0, 352, 64))
wall.paste(gallery.crop((64, 0, 128, 64)), (144, 0))
out.paste(wall.crop((0, 0, 224, 64)), (0, 0))
out.paste(wall.crop((256, 0, 352, 64)), (224, 0))

floor_tile = guardroom.crop((16, 64, 48, 96))
for y in range(64, 288, 32):
    for x in range(16, 304, 32):
        out.paste(floor_tile, (x, y))

# The gallery's side trim and guardroom's bottom border enclose the larger
# larder. Keep the existing centered exit clear at the bottom.
for y in range(64, 272, 32):
    out.paste(guardroom.crop((0, 64, 16, 96)), (0, y))
    out.paste(guardroom.crop((208, 64, 224, 96)), (304, y))
for x in range(0, 320, 32):
    out.paste(guardroom.crop((32, 192, 64, 208)), (x, 272))
out.paste(floor_tile.crop((0, 0, 32, 16)), (144, 272))

target = root / 'assets/interiors/royal-cellar.png'
out.save(target)
