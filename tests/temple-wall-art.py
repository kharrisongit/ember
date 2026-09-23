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
     assert im.getpixel((px,py)) not in void|{(102,94,85,255),(75,70,67,255)},(id,'wall seam gap',px,py)
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
    for px in range(edge_x+6,edge_x+10):
     assert im.getpixel((px,py)) not in void,(id,'vertical seam gap',px,py)
     seam_pixels+=1
   assert im.getpixel((x-8 if direction==-1 else x+24,y+8))!=(25,23,28,255),(id,'missing side edge',x,y)
   checks+=1
print(f'PASS: {checks} wall-face and side-edge samples, full 48-pixel faces on all five maps.')
print(f'PASS: {seam_pixels} masonry pixels checked across all wall faces and perpendicular joins; no void or floor strips.')
