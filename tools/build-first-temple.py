"""Build expanded temple backdrops from the existing temple's native pixel tiles."""
import re,json,base64,io
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'js/generated/game-part-1.js').read_text()
def asset(name):
 a=json.loads(re.search(r'\{"name":"'+name+r'"[^\n]*?\}',s)[0]);return Image.open(io.BytesIO(base64.b64decode(a['src'].split(',')[1]))).convert('RGBA')
original=asset('first_temple_continuous');sheet=asset('wall78_sheet')
for map,x,y,sx,sy,*_ in json.loads(re.search(r'const WALL78_PIECES=(.*);',s)[1]):
 if map=='tp1':original.alpha_composite(sheet.crop((sx,sy,sx+16,sy+16)),(x,y))
north=original.crop((112,32,128,80));west=original.crop((64,96,80,112));east=original.crop((240,96,256,112));cap=original.crop((112,32,128,40))
layout=json.loads((ROOT/'assets/interiors/first-temple/layout.json').read_text())
for id,m in layout.items():
 w,h=m['size'];floor=set()
 m['floors'] += [[d['x']-16,d['y'],d['x']+16,d['y']+16] for d in m['doors'] if d['dir']=='d']
 if id=='tp1':m['floors'].append([432,736,464,752])
 for l,t,r,b in m['floors']:
  floor.update((x,y) for x in range(l,r,16) for y in range(t,b,16))
 im=Image.new('RGBA',(w,h),'#19171c')
 # Only exterior tiles receive walls, so shared passages remain fully open.
 for x,y in sorted(floor):
  if (x,y-16) not in floor:
   if (x-16,y) not in floor:im.alpha_composite(original.crop((64,32,80,80)),(x-16,y-48))
   if (x+16,y) not in floor:im.alpha_composite(original.crop((240,32,256,80)),(x+16,y-48))
   for dy in [-48,-32,-16]:
    if (x,y+dy) not in floor:im.alpha_composite(north.crop((0,dy+48,16,dy+64)),(x,y+dy))
  if (x-16,y) not in floor:im.alpha_composite(west,(x-16,y))
  if (x+16,y) not in floor:im.alpha_composite(east,(x+16,y))
  if (x,y+16) not in floor:im.alpha_composite(cap,(x,y+16))
 for x,y in floor:im.paste((102,94,85,255),(x,y,x+16,y+16))
 for x,y in sorted(floor):
  if (x*13+y*7)%704==0 and all((x+dx,y+dy) in floor for dx,dy in [(16,0),(0,16),(-16,0)]):
   detail=asset('floor78_'+str((x//16+y//16)%9));im.alpha_composite(detail,(x,y))
 im.save(ROOT/f'assets/interiors/first-temple/{id}.png')
print('Built five temple interiors with shared floor and collision geometry.')
