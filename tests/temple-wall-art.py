"""Check full-height original-style wall faces around every new floor boundary."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
plans=json.loads((ROOT/'assets/interiors/first-temple/layout.json').read_text())
checks=0
seam_pixels=0
void={(25,23,28,255),(25,23,30,255)}
for id,m in plans.items():
 im=Image.open(ROOT/f'assets/interiors/first-temple/{id}.png').convert('RGBA');floor=set()
 exits=[(d['x'],d['y']) for d in m['doors'] if d['dir']=='d']
 if 'exit' in m:exits.append(m['exit'])
 for l,t,r,b in m['floors']+[[x-16,y,x+16,y+48] for x,y in exits]:
  floor.update((x,y) for x in range(l,r,16) for y in range(t,b,16))
 # Native side stones have a narrow, irregular floor-facing silhouette.
 # Horizontal masonry must stop there, rather than fill the crop's apron.
 trim=set()
 for x,y in floor:
  if (x-16,y) not in floor:trim.update((px,py) for px in range(x-4,x) for py in range(y,y+16))
  if (x+16,y) not in floor:trim.update((px,py) for px in range(x+16,x+20) for py in range(y,y+16))
 for x,y in floor:
  for direction in [-1,1]:
   if (x,y+direction*16) in floor:continue
   if direction==1 and any(y+16==ey+48 and ex-16<=x<ex+16 for ex,ey in exits):continue
   top=y-48 if direction==-1 else y+16
   # Audit the entire stone face, especially the outer columns where side
   # crops and pillars used to punch opaque void strips through the wall.
   for py in range(top,top+46):
    for px in range(x,x+16):
     if (px//16*16,py//16*16) in floor:continue
     forbidden=void if (px,py) in trim else void|{(102,94,85,255),(75,70,67,255)}
     assert im.getpixel((px,py)) not in forbidden,(id,'wall seam gap',px,py)
     seam_pixels+=1
   for offset in [8,24,40]:
    py=top+offset;tile=(x,(py//16)*16)
    if tile in floor:continue
    assert im.getpixel((x+8,py))!=(25,23,28,255),(id,'incomplete wall',x,py)
    checks+=1
  for direction in [-1,1]:
   if (x+direction*16,y) in floor:continue
   edge_x=x-16 if direction==-1 else x+16
   for py in range(y,y+16):
    if py>=y+14 and any(y+16==ey+48 for _,ey in exits):continue
    for px in range(edge_x+6,edge_x+10):
     assert im.getpixel((px,py)) not in void,(id,'vertical seam gap',px,py)
     seam_pixels+=1
   assert im.getpixel((x-8 if direction==-1 else x+24,y+8))!=(25,23,28,255),(id,'missing side edge',x,y)
   checks+=1
print(f'PASS: {checks} wall-face and side-edge samples, 46-pixel stone faces in 48-pixel tiles on all five maps.')
print(f'PASS: {seam_pixels} masonry pixels checked across all wall faces and perpendicular joins; floor trim confined to native side outlines.')
sanctum=plans['tp1_sanctum'];im=Image.open(ROOT/'assets/interiors/first-temple/tp1_sanctum.png').convert('RGBA')
l,t,r,b=sanctum['chambers'][1]
for y in [b+46,b+47]:
 for x in list(range(l+16,sanctum['floors'][2][0]-16))+list(range(sanctum['floors'][2][2]+16,r-16)):
  assert im.getpixel((x,y)) in void,('floor protrudes below heartstone room',x,y)
l,_,r,b=sanctum['gate']
for x in [l-3,r+2]:
 for y in range(b-48,b-2):
  assert im.getpixel((x,y)) not in void|{(102,94,85,255)},('gate jamb gap',x,y)
print('PASS: heartstone south wall has no projecting floor; gate jambs meet both passage walls.')
# Compare lower passage junctions with a real, intentionally retained upper cap.
entry=Image.open(ROOT/'assets/interiors/first-temple/tp1.png').convert('RGBA')
cap=entry.crop((84,20,92,28)).tobytes()
assert entry.getpixel((88,24)) not in void|{(102,94,85,255)},'cap reference contains masonry'
face=entry.crop((96,16,112,62)).tobytes()
passages=0;hall_joins=0;horizontal_caps=0
for id,m in plans.items():
 im=Image.open(ROOT/f'assets/interiors/first-temple/{id}.png').convert('RGBA')
 for p in m.get('passages',[]):
  x,b=p['x'],p['y'];passages+=1
  for px in [x-19,x+18]:
   for py in range(b-48,b-2):
    assert im.getpixel((px,py)) not in void|{(102,94,85,255)},(id,'doorway jamb gap',px,py)
  for px in [x-32,x+16]:
   assert im.crop((px,b-48,px+16,b-2)).tobytes()==face,(id,'unwanted vertical strip beside door',px,b)
   assert im.crop((px+4,b+4,px+12,b+12)).tobytes()!=cap,(id,'extra lower pillar cap',px,b)
  if any(cb==b-48 and cl<x<cr for cl,ct,cr,cb in m['chambers']):
   hall=next(rect for rect in m['floors'] if rect[1]==b and rect[0]<x<rect[2] and rect[3]>b)
   hall_joins+=1
   for px in [hall[0]-12,hall[2]+4]:
    assert im.crop((px,b-44,px+8,b-36)).tobytes()==cap,(id,'missing pillar top at south-wall hall join',px,b)
 for l,t,r,b in m['floors']:
  if b-t>32 or r-l<=64:continue
  for px,py in [(l+4,t-44),(r-12,t-44),(l+4,b+4),(r-12,b+4)]:
   assert im.crop((px,py,px+8,py+8)).tobytes()==cap,(id,'missing pillar top at horizontal room join',px,py)
   horizontal_caps+=1
  for px,py in [(l-12,t-44),(r+4,t-44),(l-12,b+4),(r+4,b+4)]:
   assert im.crop((px,py,px+8,py+8)).tobytes()!=cap,(id,'floating cap beyond wall end',px,py)
print(f'PASS: {passages} connected doorways fit their jambs with no extra lower pillar caps.')
print(f'PASS: {hall_joins} hall side-wall pairs meet south walls with pillar tops; {horizontal_caps} horizontal-link ends have matching caps.')
# The rebuilt floor keeps the original temple's cracked-tile texture throughout.
for id,m in plans.items():
 im=Image.open(ROOT/f'assets/interiors/first-temple/{id}.png').convert('RGBA');textured=walkable=0
 for l,t,r,b in m['floors']:
  for y in range(t,b):
   for x in range(l,r):
    walkable+=1;textured+=im.getpixel((x,y))!=(102,94,85,255)
 assert textured>walkable*.035,(id,'too few floor texture pixels',textured,walkable)
print('PASS: original cracked-floor texture is distributed through all five temple maps.')
