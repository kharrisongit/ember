"""Build expanded temple backdrops from the existing temple's native pixel tiles."""
import re,json,base64,io,sys
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
left_cap=left_pillar.crop((0,0,16,16));right_cap=right_pillar.crop((0,0,16,16))
# Reuse the original temple's cracked floor pixels. Each overlay keeps only
# marks that differ from the base floor, so it can be scattered safely.
floor_marks=[]
for sy in range(96,1888,16):
 for sx in range(112,208,16):
  tile=original.crop((sx,sy,sx+16,sy+16)).copy();marked=False
  for py in range(16):
   for px in range(16):
    if tile.getpixel((px,py))==(102,94,85,255):tile.putpixel((px,py),(0,0,0,0))
    else:marked=True
  if marked and sum(1 for py in range(16) for px in range(16) if tile.getpixel((px,py))[3])<=42:floor_marks.append(tile)
folder=sys.argv[1] if len(sys.argv)>1 else 'first-temple'
layout=json.loads((ROOT/f'assets/interiors/{folder}/layout.json').read_text())
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
  # Door openings cut through a horizontal face. The arch already supplies
  # its own jambs, so keep ordinary face masonry beside the narrow opening.
  if any(p['x']-16<=x<p['x']+16 and p['y']-48<=y<p['y'] for p in m.get('passages',[])):continue
  # Floor-facing aprons trim the horizontal face to the actual stone outline.
  # Preserving the face here would leave a thin strip beyond the side wall.
  if (x-16,y) not in floor:stamp_wall(im,west,(x-16,y),floor_edge=True)
  if (x+16,y) not in floor:stamp_wall(im,east,(x+16,y),floor_edge=True)
 for x,y,tile in pillars:
  # A cap belongs only on the upper edge of a wall. At stepped junctions
  # another face already rises above this endpoint: omit the extra column.
  joins_higher_face=any(l-16<=x<r+16 and bottom-46<y<=bottom+2 for l,r,bottom in wall_ends)
  if joins_higher_face:continue
  # End columns only cover the exposed silhouette. At an inside junction the
  # adjoining face supplies the masonry; a column here would leave stray stubs.
  tile=tile.copy()
  for py in range(48):
   for px in range(16):
    # On an end column this apron faces stone, not floor. Continue the
    # adjoining face into it so no black slit separates column from wall.
    if tile.getpixel((px,py)) in APRON and py<46:
     tile.putpixel((px,py),north.getpixel((px,py)))
    if any(l<=x+px<r and bottom-46<=y+py<bottom for l,r,bottom in wall_ends):
     tile.putpixel((px,py),(0,0,0,0))
  stamp_wall(im,tile,(x,y))
 # The source's last two rows are floor padding, not stone. End the side
 # columns on that same baseline. Continue masonry where another wall joins.
 for l,r,bottom in wall_ends:
  for px in range(l-16,r+16):
   for py in range(bottom,bottom+2):
    if not (0<=px<w and 0<=py<h):continue
    if (px//16*16,(bottom+2)//16*16) in floor:
     im.putpixel((px,py),(102,94,85,255))
    elif any(ol<=px<orr and ob-46<=py<ob for ol,orr,ob in wall_ends if ob!=bottom):
     im.putpixel((px,py),north.getpixel((px%16,30+py-bottom)))
    elif (px//16*16,py//16*16) not in floor:
     # Do not cut a side wall that continues along an adjacent walkable tile.
     adjacent=any((px//16*16+dx,(bottom+2)//16*16) in floor for dx in [-16,16]) or any(ol<=px<orr and ob-46<=bottom+2<ob for ol,orr,ob in wall_ends if ob!=bottom)
     if not adjacent:im.putpixel((px,py),(25,23,28,255))
     else:
      cx,cy=px//16*16,(bottom+2)//16*16
      side=west if (cx+16,cy) in floor else east if (cx-16,cy) in floor else north
      p=side.getpixel((px%16,14+py-bottom if side is not north else 30+py-bottom))
      if p not in VOID:im.putpixel((px,py),p)
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
 # A hall's side columns continue through the south face of the room above.
 # Use the native pillar pieces so their round tops make the intended gap
 # where each side wall crosses the horizontal room wall.
 for p in m.get('passages',[]):
  if not any(cb==p['y']-48 and cl<p['x']<cr for cl,ct,cr,cb in m['chambers']):continue
  l,t,r,b=next(rect for rect in m['floors'] if rect[1]==p['y'] and rect[0]<p['x']<rect[2] and rect[3]>p['y'])
  for x,tile in [(l-16,left_pillar),(r,right_pillar)]:stamp_wall(im,tile,(x,t-48))
 # Horizontal-link caps sit on the end tiles of their own wall faces.
 # Placing them beyond those tiles leaves them floating on the room floor.
 for l,t,r,b in m['floors']:
  if b-t>32 or r-l<=64:continue
  for y in [t-48,b]:
   stamp_wall(im,left_cap,(l,y));stamp_wall(im,right_cap,(r-16,y))
 # The separate guardian gate needs a fitted jamb inside its continuous hall.
 for l,r,b in ([(m['gate'][0],m['gate'][2],m['gate'][3])] if 'gate' in m else []):
  for x in [l-4,r]:
   im.alpha_composite(north.crop((0,0,4,46)),(x,b-48))
 for x,y in sorted(floor):
  if floor_marks and (x*13+y*7)%64<18:
   mark=floor_marks[(x//16*5+y//16*3)%len(floor_marks)].copy()
   for py in range(mark.height):
    for px in range(mark.width):
     if im.getpixel((x+px,y+py))!=(102,94,85,255):mark.putpixel((px,py),(0,0,0,0))
   im.alpha_composite(mark,(x,y))
  if any(min(h['lines'])-24<=(x if h['axis']=='x' else y)<=max(h['lines'])+24 and h['cross'][0]-16<=(y if h['axis']=='x' else x)<=h['cross'][1] for h in m.get('hazards',[])):continue
  treasures=[c[:2] for c in m['chests']]+([m['heartstone']] if 'heartstone' in m else [])
  if any(abs(x-cx)<32 and abs(y-cy)<32 for cx,cy in treasures):continue
  if (x*13+y*7)%704==0 and all((x+dx,y+dy) in floor for dx,dy in [(16,0),(0,16),(-16,0)]):
   detail=asset('floor78_'+str((x//16+y//16)%9))
   # Some floor decorations exceed one tile; keep their full footprint off walls.
   if all((fx,fy) in floor for fx in range(x,x+detail.width,16) for fy in range(y,y+detail.height,16)):
    im.alpha_composite(detail,(x,y))
 im.save(ROOT/f'assets/interiors/{folder}/{id}.png')
print(f'Built {len(layout)} compact {folder} interiors with original 48-pixel walls and joined corner pillars.')
