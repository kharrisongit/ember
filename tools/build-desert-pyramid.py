"""Compose native 16px sandstone tiles into connected pyramid chambers."""
from PIL import Image, ImageDraw, ImageFilter
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
'pyramid_queen':plan([336,336],[[48,80,288,256]],[],[168,232])}
def link(a,x,y,b,xx,yy):
 p[a]['doors'].append(dict(x=x,y=y,dir='u',to=b,arrival=[xx,yy-24]))
 p[b]['doors'].append(dict(x=xx,y=yy,dir='d',to=a,arrival=[x,y+32]))
link('pyramid_entry',112,80,'pyramid_halls',160,576)
link('pyramid_entry',208,80,'pyramid_cache',144,256)
link('pyramid_halls',480,112,'pyramid_depths',192,576)
link('pyramid_depths',192,80,'pyramid_queen',168,256)
p['pyramid_entry']['doors'].append(dict(x=160,y=576,dir='d',to='world',arrival=[1069*16+8,30*16+48]))
for mid,room,kind,pts in [
 ('pyramid_entry',1,'mummy',[(128,152),(200,184)]),
 ('pyramid_cache',0,'mummy',[(144,176)]),
 ('pyramid_halls',0,'mummy',[(112,480),(208,504)]),
 ('pyramid_halls',1,'mummy',[(160,208)]),
 ('pyramid_halls',2,'mummy',[(440,192),(528,208)]),
 ('pyramid_depths',0,'mummy',[(136,496),(256,480)]),
 ('pyramid_depths',1,'mummy',[(144,160),(240,176)]),
 ('pyramid_queen',0,'spiderqueen',[(168,152)])]:
 for x,y in pts:p[mid]['enemies'].append([kind,x,y,p[mid]['chambers'][room]])
for mid,ch in {'pyramid_entry':[[88,424,25,'potion']], 'pyramid_cache':[[72,104,90,'elixir'],[216,104,0,None]],'pyramid_halls':[[88,136,40,'dragonFish']], 'pyramid_depths':[[280,104,60,'potion']], 'pyramid_queen':[[264,104,160,'elixir']]}.items():p[mid]['chests']=ch
p['pyramid_depths']['hazards']=[dict(id='pyramid-spikes',axis='y',cross=[168,216],lines=[288,320,352,384],lever=[256,240])]
for mid,m in p.items():
 w,h=m['size'];im=Image.new('RGBA',(w,h),'#000000')
 floors=[r[:] for r in m['floors']]
 stairs=[r[:] for r in floors[len(m['chambers']):] if r[3]-r[1]>r[2]-r[0]]
 for door in m['doors']:
  if door['dir']=='d':
   landing=[door['x']-16,door['y'],door['x']+16,door['y']+48]
   floors.append(landing);stairs.append(landing)
 m['floors']=floors
 inside=lambda x,y:any(l<=x<r and t<=y<b for l,t,r,b in floors)
 cells={(x,y) for y in range(0,h,8) for x in range(0,w,8) if inside(x+4,y+4)}
 walls=set()
 for x,y in cells:
  if (x,y-8) not in cells:
   walls.update((x,y-d) for d in range(8,49,8) if y-d>=0 and (x,y-d) not in cells)
 visible=cells|walls
 def paste(box,x,y):im.alpha_composite(sh.crop(box),(int(x),int(y)))
 # Clip complete native textures to exact footprints, including half-tile hall joins.
 # Only the center wall tile repeats; the source's edge tiles contain dark vertical borders.
 for material,area in [('wall',walls),('floor',cells)]:
  layer=Image.new('RGBA',(w,h));cut=Image.new('L',(w,h));cd=ImageDraw.Draw(cut)
  for x,y in area:cd.rectangle((x,y,x+7,y+7),fill=255)
  for y in range(0,h,16):
   for x in range(0,w,16):
    box=(16,48+(y//16%2)*16,32,64+(y//16%2)*16) if material=='wall' else (112,80,128,96)
    layer.alpha_composite(sh.crop(box),(x,y))
  im.paste(layer,(0,0),cut)
 # Connected vertical passages rise on the pack's complete stair texture.
 # The side rails join the perimeter rather than ending in floating pillar caps.
 for l,t,r,b in stairs:
  for y in range(t,b,16):
   for x in range(l,r,16):
    sx=96+((x-l)//16%4)*16;sy=96+((y-t)//16%2)*16
    paste((sx,sy,sx+16,sy+16),x,y)
 # One continuous rim follows the union of rooms, wall faces and stair passages.
 # Build the outside seven pixels as a single mask, so concave corners never leave gaps.
 mask=Image.new('L',(w,h));md=ImageDraw.Draw(mask)
 for x,y in visible:md.rectangle((x,y,x+7,y+7),fill=255)
 rim=Image.new('RGBA',(w,h))
 palette=['#b77b62','#d0915d','#e6b084','#e4a672','#e4a672','#d0915d','#452f26']
 for distance in range(7,0,-1):
  expanded=mask.filter(ImageFilter.MaxFilter(distance*2+1))
  color=Image.new('RGBA',(w,h),palette[distance-1]);rim.paste(color,(0,0),expanded)
 # Native-looking mortar joints stay inside the rim and do not cut into the floors.
 rp=rim.load();mp=mask.load()
 for y in range(h):
  for x in range(w):
   if not mp[x,y] and rp[x,y][3] and rp[x,y][:3]!=(69,47,38) and ((x%16==0 and not mp[x,max(0,y-7)] and not mp[x,min(h-1,y+7)]) or (y%16==0 and not mp[max(0,x-7),y] and not mp[min(w-1,x+7),y])):
    rp[x,y]=(208,145,93,255)
 # The mask removes the rim's interior, retaining the exact wall/floor artwork beneath.
 alpha=rim.getchannel('A');alpha.paste(0,(0,0),mask);rim.putalpha(alpha)
 im.alpha_composite(rim)
 for door in m['doors']:
  if door['dir']=='u':paste((48,80,80,128),door['x']-16,door['y']-48)
 im.save(out/(mid+'.png'),optimize=True)
(out/'layout.json').write_text(json.dumps(p,indent=2)+'\n')
