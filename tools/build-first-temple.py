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
VOID={(25,23,28,255),(25,23,30,255)}
APRON={(102,94,85,255),(75,70,67,255)}
def stamp_wall(im,tile,xy,floor_edge=False):
 # Source crops include opaque exterior padding and a floor/shadow apron.
 # Neither may erase masonry already drawn at a perpendicular junction.
 tile=tile.copy();ox,oy=xy
 for y in range(tile.height):
  for x in range(tile.width):
   p=tile.getpixel((x,y));dx,dy=ox+x,oy+y
   if p in VOID or (not floor_edge and p in APRON and 0<=dx<im.width and 0<=dy<im.height and im.getpixel((dx,dy)) not in VOID|APRON):
    tile.putpixel((x,y),(0,0,0,0))
 im.alpha_composite(tile,xy)
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
 im=Image.new('RGBA',(w,h),'#19171c');pillars=[];wall_ends=[]
 # Draw complete, original 48-pixel stone faces on both north and south
 # boundaries. Continuous runs share end pillars; adjoining floors clip walls.
 for y in sorted({y for x,y in floor}):
  for direction in [-1,1]:
   edge=[x for x,fy in floor if fy==y and (x,y+direction*16) not in floor and not(direction==1 and any(y+16==ey+48 and ex-16<=x<ex+16 for ex,ey in exits))]
   for l,r in runs(edge):
    top=y-48 if direction<0 else y+16
    for x in range(l,r,16):stamp_wall(im,north,(x,top))
    pillars.extend([(l-16,top,left_pillar),(r,top,right_pillar)])
    wall_ends.append((l,r,top+46))
 for x,y in sorted(floor):
  # Floor-facing aprons trim the horizontal face to the actual stone outline.
  # Preserving the face here would leave a thin strip beyond the side wall.
  if (x-16,y) not in floor:stamp_wall(im,west,(x-16,y),floor_edge=True)
  if (x+16,y) not in floor:stamp_wall(im,east,(x+16,y),floor_edge=True)
 for x,y,tile in pillars:stamp_wall(im,tile,(x,y))
 # The source's last two rows are floor padding, not stone. End the side
 # columns on that same baseline. Continue masonry where another wall joins.
 for l,r,bottom in wall_ends:
  for px in range(l-16,r+16):
   for py in range(bottom,bottom+2):
    if not (0<=px<w and 0<=py<h):continue
    if (px//16*16,(bottom+2)//16*16) in floor:
     im.putpixel((px,py),(102,94,85,255))
    elif any(ol-16<=px<orr+16 and ob-46<=py<ob for ol,orr,ob in wall_ends if ob!=bottom):
     im.putpixel((px,py),north.getpixel((px%16,30+py-bottom)))
    elif (px//16*16,py//16*16) not in floor:
     # Do not cut a side wall that continues along an adjacent walkable tile.
     adjacent=any((px//16*16+dx,(bottom+2)//16*16) in floor for dx in [-16,16]) or any(ol-16<=px<orr+16 and ob-46<=bottom+2<ob for ol,orr,ob in wall_ends if ob!=bottom)
     if not adjacent:im.putpixel((px,py),(25,23,28,255))
 # A single floor mask prevents doubled seams or walls crossing a junction.
 for x,y in floor:im.paste((102,94,85,255),(x,y,x+16,y+16))
 # Keep floor-colored crop padding only where it actually borders floor.
 # This removes the projecting sliver beneath south walls and corner feet.
 for py in range(h):
  for px in range(w):
   if im.getpixel((px,py)) not in APRON:continue
   cx,cy=px//16*16,py//16*16
   if (cx,cy) in floor:continue
   side=((cx+16,cy) in floor and west.getpixel((px%16,py%16)) in APRON) or ((cx-16,cy) in floor and east.getpixel((px%16,py%16)) in APRON)
   below=any((cx,(py+dy)//16*16) in floor for dy in [1,2])
   if not side and not below:im.putpixel((px,py),(25,23,28,255))
 # The 32px gate sits inside the passage's side-stone outlines. Fill the
 # four-pixel floor aprons beside it with matching jamb masonry.
 if 'gate' in m:
  l,_,r,b=m['gate']
  for x in [l-4,r]:
   im.alpha_composite(north.crop((0,0,4,46)),(x,b-48))
 for x,y in sorted(floor):
  hazard=m.get('hazard')
  if hazard and min(hazard['columns'])-24<=x<=max(hazard['columns'])+24 and hazard['top']-16<=y<=hazard['bottom']:continue
  treasures=[c[:2] for c in m['chests']]+([m['heartstone']] if 'heartstone' in m else [])
  if any(abs(x-cx)<32 and abs(y-cy)<32 for cx,cy in treasures):continue
  if (x*13+y*7)%704==0 and all((x+dx,y+dy) in floor for dx,dy in [(16,0),(0,16),(-16,0)]):
   detail=asset('floor78_'+str((x//16+y//16)%9));im.alpha_composite(detail,(x,y))
 im.save(ROOT/f'assets/interiors/first-temple/{id}.png')
print('Built five compact temple interiors with original 48-pixel walls and joined corner pillars.')
