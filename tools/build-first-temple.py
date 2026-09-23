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
north=original.crop((112,32,128,80))
west=original.crop((64,96,80,112));east=original.crop((240,96,256,112))
left_pillar=original.crop((64,32,80,80));right_pillar=original.crop((240,32,256,80))
layout=json.loads((ROOT/'assets/interiors/first-temple/layout.json').read_text())
def runs(values):
 values=sorted(values)
 if not values:return
 start=last=values[0]
 for value in values[1:]:
  if value!=last+16:yield start,last+16;start=value
  last=value
 yield start,last+16
for id,m in layout.items():
 w,h=m['size'];floor=set();exits=[(d['x'],d['y']) for d in m['doors'] if d['dir']=='d']
 if 'exit' in m:exits.append(m['exit'])
 for l,t,r,b in m['floors']+[[x-16,y,x+16,y+48] for x,y in exits]:
  floor.update((x,y) for x in range(l,r,16) for y in range(t,b,16))
 im=Image.new('RGBA',(w,h),'#19171c');pillars=[]
 # Draw complete, original 48-pixel stone faces on both north and south
 # boundaries. Continuous runs share end pillars; adjoining floors clip walls.
 for y in sorted({y for x,y in floor}):
  for direction in [-1,1]:
   edge=[x for x,fy in floor if fy==y and (x,y+direction*16) not in floor and not(direction==1 and any(y+16==ey+48 and ex-16<=x<ex+16 for ex,ey in exits))]
   for l,r in runs(edge):
    top=y-48 if direction<0 else y+16
    for x in range(l,r,16):im.alpha_composite(north,(x,top))
    pillars.extend([(l-16,top,left_pillar),(r,top,right_pillar)])
 for x,y in sorted(floor):
  if (x-16,y) not in floor:im.alpha_composite(west,(x-16,y))
  if (x+16,y) not in floor:im.alpha_composite(east,(x+16,y))
 for x,y,tile in pillars:im.alpha_composite(tile,(x,y))
 # A single floor mask prevents doubled seams or walls crossing a junction.
 for x,y in floor:im.paste((102,94,85,255),(x,y,x+16,y+16))
 for x,y in sorted(floor):
  hazard=m.get('hazard')
  if hazard and min(hazard['columns'])-24<=x<=max(hazard['columns'])+24 and hazard['top']-16<=y<=hazard['bottom']:continue
  treasures=[c[:2] for c in m['chests']]+([m['heartstone']] if 'heartstone' in m else [])
  if any(abs(x-cx)<32 and abs(y-cy)<32 for cx,cy in treasures):continue
  if (x*13+y*7)%704==0 and all((x+dx,y+dy) in floor for dx,dy in [(16,0),(0,16),(-16,0)]):
   detail=asset('floor78_'+str((x//16+y//16)%9));im.alpha_composite(detail,(x,y))
 im.save(ROOT/f'assets/interiors/first-temple/{id}.png')
print('Built five compact temple interiors with original 48-pixel walls and joined corner pillars.')
