"""Compose native 16px sandstone tiles into connected pyramid chambers."""
from PIL import Image, ImageDraw
from pathlib import Path
import json, shutil, sys
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1])
out=root/'assets/interiors/desert-pyramid';out.mkdir(parents=True,exist_ok=True)
sh=Image.open(source/'Temple/Temple-House_Interior.png').convert('RGBA')
# Retain the supplied source art for the reproducible tile compositor.
for src,dst in [('Temple/Temple-House_Interior.png','tiles.png'),('Temple/Desert_Temple.png','pyramid.png'),('Temple/Desert_Obelisk_2.png','obelisk.png'),('Props/Golden_Pots.png','gold-pots.png'),('Props/Desert_Pots-Sacks.png','pots.png'),('enemies/Mummy.png','mummy.png')]:shutil.copyfile(source/src,out/dst)
def plan(size,rooms,halls,spawn):return dict(size=size,chambers=rooms,floors=rooms+halls,spawn=spawn,doors=[],enemies=[],chests=[],hazards=[])
p={
'pyramid_entry':plan([320,640],[[64,400,256,576],[64,80,256,240]],[[136,240,184,400]],[160,552]),
'pyramid_cache':plan([288,320],[[48,80,240,256]],[],[144,232]),
'pyramid_halls':plan([640,640],[[64,416,256,576],[64,112,256,272],[384,112,576,272]],[[136,272,184,416],[256,176,384,224]],[160,552]),
'pyramid_depths':plan([384,640],[[80,416,304,576],[80,80,304,256]],[[168,256,216,416]],[192,552]),
'pyramid_queen':plan([448,416],[[48,80,400,336]],[],[224,312])}
def link(a,x,y,b,xx,yy):
 p[a]['doors'].append(dict(x=x,y=y,dir='u',to=b,arrival=[xx,yy-24]))
 p[b]['doors'].append(dict(x=xx,y=yy,dir='d',to=a,arrival=[x,y+32]))
link('pyramid_entry',112,80,'pyramid_halls',160,576)
link('pyramid_entry',208,80,'pyramid_cache',144,256)
link('pyramid_halls',480,112,'pyramid_depths',192,576)
link('pyramid_depths',192,80,'pyramid_queen',224,336)
p['pyramid_entry']['doors'].append(dict(x=160,y=576,dir='d',to='world',arrival=[1069*16+8,30*16+48]))
for mid,room,kind,pts in [
 ('pyramid_entry',1,'mummy',[(128,152),(200,184)]),
 ('pyramid_cache',0,'mummy',[(144,176)]),
 ('pyramid_halls',0,'mummy',[(112,480),(208,504)]),
 ('pyramid_halls',1,'mummy',[(160,208)]),
 ('pyramid_halls',2,'mummy',[(440,192),(528,208)]),
 ('pyramid_depths',0,'mummy',[(136,496),(256,480)]),
 ('pyramid_depths',1,'mummy',[(144,160),(240,176)]),
 ('pyramid_queen',0,'spiderqueen',[(224,184)])]:
 for x,y in pts:p[mid]['enemies'].append([kind,x,y,p[mid]['chambers'][room]])
for mid,ch in {'pyramid_entry':[[88,424,25,'potion']], 'pyramid_cache':[[72,104,90,'elixir'],[216,104,0,None]],'pyramid_halls':[[88,136,40,'dragonFish']], 'pyramid_depths':[[280,104,60,'potion']], 'pyramid_queen':[[376,104,160,'elixir']]}.items():p[mid]['chests']=ch
p['pyramid_depths']['hazards']=[dict(id='pyramid-spikes',axis='y',cross=[168,216],lines=[288,320,352,384],lever=[256,240])]
for mid,m in p.items():
 w,h=m['size'];im=Image.new('RGBA',(w,h),'#21191b');d=ImageDraw.Draw(im)
 floors=[r[:] for r in m['floors']]
 for door in m['doors']:
  if door['dir']=='d':floors.append([door['x']-16,door['y'],door['x']+16,door['y']+48])
 m['floors']=floors
 inside=lambda x,y:any(l<=x<r and t<=y<b for l,t,r,b in floors)
 def paste(box,x,y):im.alpha_composite(sh.crop(box),(int(x),int(y)))
 # Wall faces rise three tiles above a north boundary. All seams follow the union of rooms/halls.
 for y in range(0,h,16):
  for x in range(0,w,16):
   if not inside(x+8,y+8):continue
   if not inside(x+8,y-8):
    for yy in range(y-48,y,16):
     if yy>=0:paste((16,48,32,64),x,yy)
    if y>=48:paste((16,12,32,16),x,y-48)
   if not inside(x+8,y+24):
    for yy in [y+16,y+32]:
     if yy<h:paste((112,96,128,112),x,yy)
   if not inside(x-8,y+8):paste((10,16,16,32),x-6,y)
   if not inside(x+24,y+8):paste((32,16,38,32),x+16,y)
 # Floors overdraw only their own footprints, avoiding wall slivers at joins.
 for y in range(0,h,16):
  for x in range(0,w,16):
   if inside(x+8,y+8):
    paste((128,48,144,64),x,y)
    n=(x//16*7+y//16*13)%19
    if n in (0,1,2):paste((96+(n%2)*16,32,112+(n%2)*16,48),x,y)
 # Cap vertical-wall ends and draw the source's dark archways.
 for l,t,r,b in m['chambers']:
  for x in [l-8,r]:
   paste((0,80,16,128),x-4,t-48)
 for door in m['doors']:
  x,y=door['x'],door['y']
  if door['dir']=='u':paste((48,80,80,128),x-16,y-48)
  else:
   d.rectangle((x-10,y+32,x+9,y+47),fill='#342321')
   for yy in [y+4,y+16,y+28]:paste((112,104,128,112),x-16,yy);paste((112,104,128,112),x,yy)
 im.save(out/(mid+'.png'),optimize=True)
(out/'layout.json').write_text(json.dumps(p,indent=2)+'\n')
