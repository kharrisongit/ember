"""Rebuild the remaining interior layers from the original embedded atlas art.
Run from any directory: python tools/build-remaining-interiors.py
Requires Pillow, NumPy and SciPy. No generated artwork or external image inputs.
"""
import os, json, re, base64, gzip, io
from pathlib import Path
from PIL import Image, ImageDraw
os.chdir(Path(__file__).resolve().parents[1])
source=Path('js/generated/game-part-1.js').read_text()
s=json.loads(gzip.decompress(base64.b64decode(re.search(r'const ATLAS_GZ = "([^"]+)',source)[1])))['sprites']
w=json.loads(gzip.decompress(base64.b64decode(re.search(r'const W_GZ = "([^"]+)',source)[1])))
p=Path('assets/game-assets.js').read_text()
pages=json.loads(re.search(r'window.EMBER_ASSETS.ATLAS_PAGES = (.*);',p)[1])
royal=json.loads(re.search(r'window.EMBER_ASSETS.ROYAL_DATA = (.*);',p)[1]);s.update(royal['sprites']);pages+=royal['pages'];w['maps'].update(royal['maps'])
page_images=[(x,y,ww,hh,Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGBA')) for x,y,ww,hh,url in pages]
def crop(n):
 x,y,ww,hh,*_=s[n];out=Image.new('RGBA',(ww,hh))
 for px,py,pw,ph,im in page_images:
  if px<x+ww and py<y+hh and px+pw>x and py+ph>y:out.paste(im,(px-x,py-y))
 return out

import numpy as np
from scipy.ndimage import label,find_objects,binary_dilation,binary_fill_holes,distance_transform_edt
from collections import Counter
done=set()
for town in ['millwood','thornwell','forgewick','sandspire','hollybeck']:done.update(json.load(open('assets/interiors/'+town+'/layouts.json')))
rooms={k:m for k,m in w['maps'].items() if m.get('roomArt') and k not in done};rooms['witchmoor']={**w['maps']['witchmoor'],'roomArt':'witch_room'}
ROOT=Path('assets/interiors/remaining');ROOT.mkdir(exist_ok=True)
results={};images={};report={}
def tile(im,regions,period=32):
 a=np.array(im);p=period;values={}
 for l,t,r,b in regions:
  for y in range(t,b):
   for x in range(l,r):values.setdefault((x%p,y%p),Counter())[tuple(a[y,x])]+=1
 def fill(rect):
  l,t,r,b=rect;out=np.zeros((b-t,r-l,4),dtype=np.uint8)
  for yy in range(t,b):
   for xx in range(l,r):
    cs=values.get((xx%p,yy%p))
    if not cs:raise ValueError(('tile missing phase',xx%p,yy%p,regions))
    out[yy-t,xx-l]=cs.most_common(1)[0][0]
  return out
 return fill
class Room:
 def __init__(self,id,floor,wall=None,period=32):
  self.id=id;self.im=crop(rooms[id]['roomArt']);self.a=np.array(self.im);self.base=self.a.copy();self.layers=[];self.floor=tile(self.im,floor,period);self.wall=wall
 def cut(self,name,rect,flat=False,back=None,mask=None,sortY=None):
  l,t,r,b=rect;orig=self.a[t:b,l:r].copy();floor=(back or self.floor)(rect);under=floor.copy()
  if not flat:
   for obj in self.layers:
    if not obj['flat']:continue
    x0=max(l,obj['x']);y0=max(t,obj['y']);x1=min(r,obj['x']+obj['w']);y1=min(b,obj['y']+obj['h'])
    if x0>=x1 or y0>=y1:continue
    ar=np.array(obj['image'])[y0-obj['y']:y1-obj['y'],x0-obj['x']:x1-obj['x']];ok=ar[:,:,3]>0;under[y0-t:y1-t,x0-l:x1-l][ok]=ar[ok]
  m=np.any(orig!=under,axis=2) if mask is None else mask
  m &= orig[:,:,3]>0
  palette=np.unique(self.floor((0,0,32,32)).reshape(-1,4),axis=0)
  if self.id in ['tavern','inn','innrooms'] or self.id.startswith('inn_guest'):palette=np.vstack((palette,[(119,97,91,255),(163,140,117,255),(131,113,100,255),(103,82,78,255),(123,103,94,255)]))
  background=np.any(np.all(orig[:,:,None,:]==palette[None,None,:,:],axis=3),axis=2)
  m &= ~background
  if self.id.startswith('royal_') and t<56:
   wallcolors=np.unique(np.array(crop('royal_room_guardroom'))[18:56,80:112].reshape(-1,4),axis=0)
   limit=min(b,56)-t;m[:limit] &= ~np.any(np.all(orig[:limit,:,None,:]==wallcolors[None,None,:,:],axis=3),axis=2)
  sp=orig.copy();sp[:,:,3]=np.where(m,sp[:,:,3],0)
  if flat:
   red=('runner' in name or name=='carpet');c=orig.astype(float)
   hue=(c[:,:,0]>c[:,:,1]*1.2) if red else ((c[:,:,2]>c[:,:,0]*1.10)&(c[:,:,2]>c[:,:,1]*1.03))
   valid=m&hue
   if name=='stage-rug':valid=m&((c[:,:,0]>c[:,:,1]*1.3)|(c[:,:,2]>c[:,:,0]*1.1))
   if name in ('stage-rug','bedroom-rug') and (self.id.startswith('inn') or self.id=='tavern'):
    allowed=[(92,93,138),(80,76,109),(121,114,178)]
    if name=='stage-rug':allowed += [(129,62,65),(145,65,65),(161,83,68),(80,43,50),(179,97,72),(113,57,66)]
    valid=m&np.any(np.all(orig[:,:,:3,None]==np.array(allowed).T[None,None,:,:],axis=2),axis=2)
   if name=='shop-rug':
    valid=m&np.any(np.all(orig[:,:,:3,None]==np.array([(75,73,134),(69,62,111),(81,84,152),(90,86,150)]).T[None,None,:,:],axis=2),axis=2)
   if name=='ritual-circle':valid=m&(c[:,:,0]>c[:,:,1]*1.05)&(c[:,:,2]>c[:,:,1]*1.05)
   if valid.sum()>10:
    from scipy.spatial import ConvexHull
    from PIL import ImageDraw
    ys,xs=np.where(valid);pts=np.column_stack((xs,ys));hull=ConvexHull(pts);cover=Image.new('1',(r-l,b-t));ImageDraw.Draw(cover).polygon([tuple(pts[i]) for i in hull.vertices],fill=1);inside=np.array(cover)>0
    nearest=distance_transform_edt(~valid,return_distances=False,return_indices=True);sp[inside]=orig[nearest[0][inside],nearest[1][inside]];sp[:,:,3]=np.where(inside,255,0);m=inside
  self.base[t:b,l:r][m]=floor[m]
  self.layers.append(dict(name=name,x=l,y=t,w=r-l,h=b-t,flat=flat,sortY=(-1000 if flat else b) if sortY is None else sortY,image=Image.fromarray(sp)))
 def source(self,name,im,x,y,flat=False,back=None,sortY=None):
  mask=np.array(im)[:,:,3]>0;h,ww=mask.shape;bg=(back or self.floor)((x,y,x+ww,y+h));self.base[y:y+h,x:x+ww][mask]=bg[mask]
  self.layers.append(dict(name=name,x=x,y=y,w=ww,h=h,flat=flat,sortY=(-1000 if flat else y+h) if sortY is None else sortY,image=im.copy()))
 def wallback(self,rect,sampleX=120,period=32):
  l,t,r,b=rect;v=self.floor(rect) if t>=64 else self.a[t:b,l:r].copy()
  for yy in range(t,min(b,64)):
   for xx in range(l,r):v[yy-t,xx-l]=self.a[yy,sampleX+(xx-sampleX)%period]
  if b>64:v[max(0,64-t):]=self.floor((l,max(t,64),r,b))
  return v
 def finish(self):
  if self.id in ['school','school2']:
   tables=[o for o in self.layers if o['name']=='reading-table']
   chairs=[o for o in self.layers if o['name']=='chair'];self.layers=[o for o in self.layers if o['name']!='chair']
   for table in tables:
    ta=np.array(table['image']);split=10 if self.id=='school' else 11
    for offset in [4,30]:
     x=table['x']+offset;y=table['y']-10;bottom=table['y']+26 if self.id=='school' else 187
     ar=self.a[y:bottom,x:x+15].copy();bg=self.floor((x,y,x+15,bottom));palette=np.unique(bg.reshape(-1,4),axis=0);mask=~np.any(np.all(ar[:,:,None,:]==palette[None,None,:,:],axis=3),axis=2)
     # The tabletop occludes the middle of each complete chair.
     ar[10:10+split]=ar[6:7];mask[10:10+split]=mask[6:7]
     ar[:,:,3]=np.where(mask,255,0)
     ta[split:,offset:offset+15,3]=0
     self.layers.append(dict(name='chair',x=x,y=y,w=15,h=bottom-y,flat=False,sortY=table['sortY']-1,image=Image.fromarray(ar)))
    table['image']=Image.fromarray(ta)
  if self.id=='royal_banquet':
   palette=set(tuple(c) for c in self.a[78:96,48:66].reshape(-1,4))
   palette.update(tuple(c) for c in self.a[135:154,48:66].reshape(-1,4) if c[0]>c[1]*1.1 and c[1]>c[2]*1.05)
   floorcolors=set(tuple(c) for c in self.floor((0,0,32,32)).reshape(-1,4));palette-=floorcolors
   for o in self.layers:
    if 'chair' not in o['name']:continue
    ar=np.array(o['image']);keep=np.array([tuple(c) in palette for c in ar.reshape(-1,4)]).reshape(ar.shape[:2]);ar[:,:,3]=np.where(keep,ar[:,:,3],0);o['image']=Image.fromarray(ar)
  # The counter and banquet tabletop are lower layers than their separate contents.
  if self.id in ['tavern','royal_banquet']:
   lower=next(o for o in self.layers if o['name']==('bar-counter' if self.id=='tavern' else 'banquet-table'))
   owners=[o for o in self.layers if o['name'] in (['barrel','bottle-cabinet'] if self.id=='tavern' else ['north-chair','south-chair','east-chair'])]
   ar=np.array(lower['image']);covered=np.zeros(ar.shape[:2],bool)
   for upper in owners:
    upper['sortY']=lower['sortY']+1
    l=max(lower['x'],upper['x']);t=max(lower['y'],upper['y']);r=min(lower['x']+lower['w'],upper['x']+upper['w']);b=min(lower['y']+lower['h'],upper['y']+upper['h'])
    if l>=r or t>=b:continue
    ua=np.array(upper['image'])[t-upper['y']:b-upper['y'],l-upper['x']:r-upper['x']];covered[t-lower['y']:b-lower['y'],l-lower['x']:r-lower['x']]|=ua[:,:,3]>0
   visible=(ar[:,:,3]>0)&~covered
   nearest=distance_transform_edt(~visible,return_distances=False,return_indices=True)
   # Hidden table edges continue underneath the chairs; raised bar contents do not
   # become part of the counter's silhouette.
   for yy,xx in zip(*np.where(covered)):
    worldY=yy+lower['y']
    if self.id=='royal_banquet' and 100<=worldY<=140:ar[yy,xx]=ar[nearest[0,yy,xx],nearest[1,yy,xx]]
    else:ar[yy,xx,3]=0
   lower['image']=Image.fromarray(ar)
  homes={__import__('builtins').id(o):(o['x'],o['y'],o['w'],o['h']) for o in self.layers}
  def distance(o,x,y):
   xx,yy,ww,hh=homes[__import__('builtins').id(o)];return max(xx-x,0,x-(xx+ww-1))**2+max(yy-y,0,y-(yy+hh-1))**2
  zones={'tavern':[(53,100,444,329)],'inn':[(53,100,348,244)],'inn_guest1':[(24,68,120,175)],'inn_guest2':[(24,68,120,175)],'inn_guest3':[(24,68,120,175)],'inn_guest4':[(24,68,136,175)],'glasshouse':[(12,64,196,176)],'glasswork':[(12,64,196,176)],'school':[(84,170,348,264)],'school2':[(52,100,284,188)],'smithy':[(36,132,324,271),(104,113,290,132)]}
  for l,t,r,b in zones.get(self.id,[]):
   under=self.floor((l,t,r,b));palette=np.unique(under.reshape(-1,4),axis=0);a=self.base[t:b,l:r];background=np.any(np.all(a[:,:,None,:]==palette[None,None,:,:],axis=3),axis=2);delta=~background&(a[:,:,3]>0)
   for yy,xx in zip(*np.where(delta)):
    x,y=xx+l,yy+t
    near=min(self.layers,key=lambda o:distance(o,x,y))
    if distance(near,x,y)>36:continue
    x0=min(x,near['x']);y0=min(y,near['y']);x1=max(x+1,near['x']+near['w']);y1=max(y+1,near['y']+near['h'])
    if x0!=near['x'] or y0!=near['y'] or x1-x0!=near['w'] or y1-y0!=near['h']:
     im=Image.new('RGBA',(x1-x0,y1-y0));im.alpha_composite(near['image'],(near['x']-x0,near['y']-y0));near.update(x=x0,y=y0,w=x1-x0,h=y1-y0,image=im)
    near['image'].putpixel((x-near['x'],y-near['y']),tuple(self.a[y,x]));self.base[y,x]=under[yy,xx]

  for o in self.layers:
   ar=np.array(o['image']);mask=ar[:,:,3]>0;lab,n=label(mask);counts=np.bincount(lab.ravel());counts[0]=0
   if not n:continue
   main=lab==counts.argmax();near=binary_dilation(main,iterations=5)
   for k in range(1,n+1):
    cm=lab==k
    if counts[k]<5 and not (cm&near).any():
     for yy,xx in zip(*np.where(cm)):self.base[o['y']+yy,o['x']+xx]=self.a[o['y']+yy,o['x']+xx]
     ar[:,:,3][cm]=0
   o['image']=Image.fromarray(ar)
  self.layers.sort(key=lambda o:o['sortY']);base=Image.fromarray(self.base);result=base.copy()
  for o in self.layers:result.alpha_composite(o['image'],(o['x'],o['y']))
  delta=np.any(np.array(result)!=self.a,axis=2)
  for yy,xx in zip(*np.where(delta)):
   for o in reversed(self.layers):
    x,y=o['x'],o['y'];im=o['image']
    if x<=xx<x+im.width and y<=yy<y+im.height :im.putpixel((xx-x,yy-y),tuple(self.a[yy,xx]));break
  result=base.copy()
  for o in self.layers:result.alpha_composite(o['image'],(o['x'],o['y']))
  
  if result.tobytes()!=self.im.tobytes():
   diff=np.any(np.array(result)!=self.a,axis=2);print(self.id,'diff',[(int(x),int(y),self.a[y,x].tolist(),np.array(result)[y,x].tolist()) for y,x in list(zip(*np.where(diff)))[:6]])
  assert result.tobytes()==self.im.tobytes(),self.id
  images[self.id,'base']=base;results[self.id]={'source':rooms[self.id]['roomArt'],'objects':[]}
  for i,o in enumerate(self.layers):images[self.id,i]=o.pop('image');results[self.id]['objects'].append(o)
  report[self.id]=len(self.layers)
# Simple source-cropped rural and coastal rooms.
# Load the established complete source furniture components.
candidates={k:crop(k) for k in s if re.fullmatch(r'i(?:bed|chair|fire|lamp|plant|shelf|stove|table)\d+',k)}
src=np.array(crop('millwood_base_furniture'));lab,num=label(src[:,:,3]>0)
for i,o in enumerate(find_objects(lab)):
 x,y=o[1].start,o[0].start;ww,h=o[1].stop-x,o[0].stop-y
 if ww*h<100:continue
 a=src[y:y+h,x:x+ww].copy();a[:,:,3][lab[o]!=i+1]=0;candidates['pack_'+str(x)+'_'+str(y)]=Image.fromarray(a)
def matches(room,im,threshold=.985):
 a=np.array(im);rh,rw=room.shape[:2];h,w=a.shape[:2];ys,xs=np.where(a[:,:,3]>200)
 if not len(xs) or w>rw or h>rh:return []
 # Candidate origins from a rare opaque source colour, then exact visible-pixel score.
 colors,cnt=np.unique(a[ys,xs,:3],axis=0,return_counts=True);idx=np.argsort(cnt)[len(cnt)//3]
 col=colors[idx];k=np.where(np.all(a[ys,xs,:3]==col,axis=1))[0][0]
 yy,xx=np.where(np.all(room[:,:,:3]==col,axis=2));out=[]
 for x,y in zip(xx-xs[k],yy-ys[k]):
  if x<0 or y<0 or x+w>rw or y+h>rh:continue
  score=np.mean(np.all(room[y+ys,x+xs,:3]==a[ys,xs,:3],axis=1))
  if score>=threshold:out.append((float(score),int(x),int(y)))
 return out

for id,m in rooms.items():
 if not(id.startswith('millwood_') or id.startswith('house')):continue
 im=crop(m['roomArt']);ww,hh=im.size
 coastal=id.startswith('house');bed='bedroom' in id
 floor=[(112,96,144,128)] if coastal else [(80,112,112,144)]
 if coastal and not bed:floor=[(144,80,176,112)]
 r=Room(id,floor)
 if not coastal:
  clean=Image.open('assets/interiors/millwood/layers.png');lm=json.load(open('assets/interiors/millwood/layouts.json'))['house23']['baseRect'];lx,ly,lw,lh=lm;clean=clean.crop((lx,ly,lx+lw,ly+lh));r.floor=tile(clean,[(64,64,96,96)])
 # Source art from the original furniture pack exactly matches these furnishings.
 found=[]
 for key,sp in candidates.items():
  if key in ['pack_66_373','pack_82_376','pack_163_387']:continue
  for score,x,y in matches(r.a,sp,.999):
   found.append((sp.width*sp.height,key,x,y,sp))
 occupied=np.zeros((hh,ww),bool)
 for area,key,x,y,sp in sorted(found,reverse=True):
  am=np.array(sp)[:,:,3]>0
  if (occupied[y:y+sp.height,x:x+sp.width]&am).sum()>am.sum()*.15:continue
  if key=='pack_12_280':continue
  occupied[y:y+sp.height,x:x+sp.width]|=am
  if not coastal and (key.startswith('pack_') and sp.width>40):continue
  boxes={'millwood_barn':(117,117,169,178),'millwood_shed':(38,32,96,106),'millwood_fisher':(30,32,90,106),'millwood_mill':(30,32,89,108)}
  bb=boxes.get(id)
  if bb and x<bb[2] and x+sp.width>bb[0] and y<bb[3] and y+sp.height>bb[1]:continue
  r.source(key,sp,x,y,back=lambda rect:r.wallback(rect,80 if coastal else 112))
 if not coastal:
  bb=boxes.get(id)
  def ruralback(rect):
   l,t,rr,b=rect;out=r.floor(rect)
   ca=np.array(clean)
   for yy in range(t,min(b,64)):
    for xx in range(l,rr):out[yy-t,xx-l]=ca[yy,64+(xx-64)%32]
   return out
  if bb:r.cut('supply-shelf',bb,back=ruralback)
 if coastal:
  if not bed:
   # The untouched circular rug from Millwood supplies its hidden centre.
   rug=candidates['pack_12_280'];r.source('rug',rug,77,116,True)
   obj=r.layers[-1];old=obj['image'];rect=(74,114,171,198);l,t,rrr,b=rect;under=r.floor(rect);ar=r.base[t:b,l:rrr].copy();mask=np.any(ar!=under,axis=2);ar[:,:,3]=np.where(mask,ar[:,:,3],0);r.base[t:b,l:rrr][mask]=under[mask];merged=Image.fromarray(ar);merged.alpha_composite(old,(obj['x']-l,obj['y']-t));obj.update(x=l,y=t,w=rrr-l,h=b-t,image=merged)

   # Reapply furniture over the rug in depth order.
   r.cut('wall-cabinet',(24,34,76,84),back=lambda rect:r.wallback(rect,80))
   r.cut('dock-supplies',(ww-66,124,ww-24,168))
   r.cut('plant-or-produce',(26,140,58,196))
   if id in ['house42','house45']:r.cut('hanging-herbs',(118,16,130,48),back=lambda rect:r.wallback(rect,80))
  else:
   r.cut('wardrobe',(78,34,106,78),back=lambda rect:r.wallback(rect,24))
   r.cut('bookcase',(114,34,142,78),back=lambda rect:r.wallback(rect,24))
 r.finish()
# Additional authored rooms are specified below.
royalwall=np.array(crop('royal_room_guardroom'))
for id in rooms:
 if not id.startswith('royal_'):continue
 ww,hh=crop(rooms[id]['roomArt']).size
 floor=[(16,64,ww-16,hh-16)]
 if id=='royal_banquet':floor=[(24,160,56,192)]
 if id=='royal_bedroom':floor=[(16,96,48,128),(128,96,160,128)]
 if id=='royal_salon':floor=[(16,64,ww-16,hh-16)]
 if id=='royal_study':floor=[(80,176,208,192),(80,96,208,112)]
 if id=='royal_armory':floor=[(96,80,128,112)]
 if id=='royal_seal':floor=[(16,96,208,128)]
 r=Room(id,floor,period=32)
 def wallrect(rect):
  l,t,rr,b=rect;v=r.a[t:b,l:rr].copy()
  for y in range(t,min(b,56)):
   for x in range(l,rr):v[y-t,x-l]=royalwall[y,x if (56<=x<224) else 88+(x-88)%16]
  if b>56:v[max(0,56-t):]=r.floor((l,max(56,t),rr,b))
  return v
 if id in ['royal_vestibule','royal_westhall','royal_easthall','royal_upperhall','royal_northhall']:
  r.cut('carpet',(76,84,276,138),True)
  for x in ([32,288] if id in ['royal_vestibule','royal_northhall'] else [32,96,224,288]):r.cut('painting',(x,24,x+32,56),back=wallrect)
 elif id=='royal_banquet':
  r.cut('banquet-table',(39,96,162,150))
  for x in [48,70,92,114,136]:
   r.cut('north-chair',(x,78,x+18,103));r.cut('south-chair',(x,129,x+18,154))
  r.cut('east-chair',(164,102,182,133))
 elif id=='royal_armory':
  for x in [20,160]:
   for y in [45,85,133]:r.cut('weapon-rack',(x,y,x+40,y+40),back=wallrect)
 elif id=='royal_bedroom':
  # Carpet is below the bed; reconstruct its hidden upper edge from the unobscured lower half.
  r.cut('bedroom-rug',(46,78,124,132),True)
  for name,rect in [('bed',(60,38,108,94)),('bedside-table',(31,62,58,91)),('bedside-table',(124,60,145,92))]:r.cut(name,rect,back=wallrect)
 elif id=='royal_salon':
  for name,rect in [('armchair',(20,88,68,134)),('armchair',(86,88,135,134)),('tea-table',(65,118,90,150))]:r.cut(name,rect)
 elif id=='royal_study':
  for x,y in [(23,32),(100,32),(23,116)]:r.cut('bookcase',(x,y,x+55,y+60),back=wallrect)
  r.cut('writing-desk',(115,117,179,158))
 elif id=='royal_seal':
  r.cut('carpet',(16,125,210,177),True)
  for x in [25,180]:r.cut('flower-vase',(x,48,x+25,90),back=wallrect)
 r.finish()
# Shops, public rooms and guest rooms. Each rectangle names one authored furnishing.
def rowwall(room,rect,sampleX,edge,period=16):
 l,t,rr,b=rect;v=room.floor(rect)
 for y in range(t,min(b,edge)):
  for x in range(l,rr):v[y-t,x-l]=room.a[y,sampleX+(x-sampleX)%period]
 return v
def named(room,items,back=None):
 for name,rect,*flat in items:room.cut(name,rect,flat[0] if flat else False,back=back)
# Tavern/inn stone floor is shared and keeps its original phase.
for id in ['tavern','inn','innrooms','inn_guest1','inn_guest2','inn_guest3','inn_guest4']:
 ww,hh=crop(rooms[id]['roomArt']).size
 r=Room(id,[(24,144,ww-24,hh-32)])
 # Robust floor template across many unobstructed repetitions.
 r.floor=tile(crop('innrooms_room'),[(24,64,344,144)])
 wall=lambda rect:rowwall(r,rect,56 if id in ['tavern','inn'] else 96,96 if id in ['tavern','inn'] else 64)
 if id=='tavern':
  named(r,[('bar-counter',(162,84,321,142))],wall)
  named(r,[('barrel',(177,62,207,107)),('barrel',(209,78,228,107)),('bottle-cabinet',(230,63,276,107)),('barrel',(277,69,303,107))],wall)
  for x,y in [(154,174),(274,174),(154,250),(274,250)]:
   r.cut('dining-table',(x,y,x+51,y+19))
   for xx in [x+2,x+20,x+38]:
    r.cut('stool',(xx,y-10,xx+11,y));r.cut('stool',(xx,y+19,xx+11,y+30))
  for x,y in [(91,144),(380,150),(67,210),(404,215),(91,246),(380,246)]:
   # Round tables carry their tableware. Stools are separate.
   r.cut('round-table',(x,y,x+29,y+37))
   for xx in [x-10,x+29]:r.cut('stool',(xx,y+15,xx+10,y+30))
  for x in [56,357]:
   r.cut('stage-rug',(x,277,x+85,327),True)
   r.cut('piano',(x+17,297,x+58,322))
  named(r,[('instrument',(68,242,81,258)),('musician-supplies',(148,180,175,204))])
 elif id=='inn':
  named(r,[('reception-counter',(162,85,240,138))],wall)
  r.cut('dining-table',(82,152,133,171))
  for x in [84,102,120]:
   r.cut('stool',(x,142,x+11,152));r.cut('stool',(x,171,x+11,182))
  r.cut('potted-plant',(381,122,398,147))
 elif id=='innrooms':
  pass # Fixed architectural staircase remains part of the room.
 else:
  # Rug is reconstructed under the independently moveable furnishings.
  r.cut('bedroom-rug',(40,76,112 if id=='inn_guest4' else 100,132),True)
  if id in ['inn_guest1','inn_guest2','inn_guest4']:r.cut('bed',(65 if id=='inn_guest4' else 67,62,108 if id=='inn_guest4' else 91,117))
  named(r,[('wardrobe',(35,97,59,140)),('bedside-cabinet',(48,68,63,92)),('stool',(53,112,67,126))])
  if id=='inn_guest2':named(r,[('glass-lamp',(36,48,49,79)),('floor-vase',(37,81,52,112))],wall)
  if id=='inn_guest3':named(r,[('desk-supplies',(37,80,61,124)),('candelabra',(53,62,65,83))])
  if id=='inn_guest4':named(r,[('weapon-display',(35,46,66,99))],wall)
 r.finish()
for id in ['glasshouse','glasswork']:
 r=Room(id,[(76,64,108,96)] if id=='glasshouse' else [(96,112,128,144)])
 wall=lambda rect:rowwall(r,rect,176 if id=='glasshouse' else 96,48 if id=='glasshouse' else 64)
 if id=='glasshouse':
  named(r,[('display-cabinet',(35,12,74,66)),('display-cabinet',(136,12,173,66))],wall)
  named(r,[('shop-rug',(74,116,143,150),True),('glass-counter',(88,89,161,120)),('left-display',(13,94,46,142)),('right-display',(165,92,196,142)),('flower-vase',(65,125,87,157)),('flower-vase',(122,125,144,157))])
 else:
  named(r,[('coal-bin',(46,40,68,71)),('glass-cart',(34,66,66,93)),('glass-supplies',(66,52,87,83)),('glass-vase',(125,35,149,69)),('stained-glass',(140,35,179,99)),('left-crate',(12,102,28,124)),('left-crate',(36,100,50,117)),('glass-bundle',(16,85,41,111)),('right-crate',(145,110,162,124)),('glass-bundle',(154,94,192,125)),('right-crate',(186,109,198,124))],wall)
 r.finish()
for id in ['school','school2']:
 r=Room(id,[(80,232,144,264),(304,200,344,264)] if id=='school' else [(144,160,208,184),(56,112,88,144)])
 if id=='school':
  wood=tile(r.im,[(96,96,336,128)])
  def back(rect):
   l,t,rr,b=rect;v=r.floor(rect)
   for yy in range(t,b):
    if yy<96:
     # Cream wall sampled from the side panel at the same height.
     for xx in range(l,rr):v[yy-t,xx-l]=r.a[max(52,yy),125]
    elif yy<160:v[yy-t]=wood((l,yy,rr,yy+1))[0]
   return v
  named(r,[('library-bookcase',(131,43,301,96)),('flower-vase',(100,66,120,101)),('flower-vase',(312,64,334,101))],back)
  # Furnishings in the lower reading room sit in front of its raised wall.
  def lowerback(rect):
   l,t,rr,b=rect;v=r.floor(rect)
   for yy in range(t,min(b,168)):
    for xx in range(l,rr):v[yy-t,xx-l]=r.a[yy,112+(xx-112)%16]
   return v
  named(r,[('bookcase',(143,144,196,182)),('bookcase',(239,144,292,182)),('bookcase',(78,158,109,198)),('bookcase',(325,158,353,198))],lowerback)
  r.cut('runner',(196,169,239,280),True)
  for x in [144,240]:
   for y in [184,224]:
    r.cut('reading-table',(x,y,x+51,y+22))
    for xx in [x+4,x+30]:
     r.cut('chair',(xx,y-10,xx+15,y));r.cut('chair',(xx,y+22,xx+15,y+26))
 else:
  def back(rect):return rowwall(r,rect,264,96)
  named(r,[('library-bookcase',(100,52,260,104)),('lectern',(51,85,86,116))],back)
  r.cut('runner',(89,120,272,163),True)
  for x in [63,215]:
   r.cut('reading-table',(x,162,x+49,184))
   for xx in [x+4,x+30]:
    r.cut('chair',(xx,151,xx+15,162));r.cut('chair',(xx,184,xx+15,187))
 r.finish()
# Smithy: the furnace and its light/fire are kept registered as one movable workstation.
r=Room('smithy',[(184,224,248,256),(112,160,160,192)])
def smithback(rect):
 l,t,rr,b=rect;v=r.floor(rect)
 for yy in range(t,min(b,112)):
  for xx in range(l,rr):
   if yy<64:v[yy-t,xx-l]=r.a[yy,160]
   else:v[yy-t,xx-l]=r.a[yy,152+(xx-152)%8]
 return v
named(r,[('forge',(173,32,227,112)),('wall-weapons',(108,67,152,94)),('coal-pile',(119,104,170,145)),('barrel',(102,96,119,122)),('bellows',(236,80,281,140)),('wall-weapons',(251,69,289,96)),('crate-stack',(281,91,301,126)),('tool-rack',(70,100,101,138))],smithback)
named(r,[('supply-cabinet',(37,107,72,180)),('anvil',(46,158,99,221)),('supply-crates',(105,201,139,250)),('tool-cart',(148,202,185,246)),('workbench',(182,185,221,212)),('chair',(257,172,277,212)),('grinder',(292,142,319,176)),('water-bucket',(305,134,322,155)),('stool',(281,155,294,172)),('tool-rack',(321,180,355,218)),('chair',(36,230,61,269)),('weapon-rack',(261,225,321,270)),('wood-pile',(326,239,364,270))])
def rightback(rect):
 l,t,rr,b=rect;v=r.floor(rect)
 for yy in range(t,b):
  for xx in range(l,rr):
   if 328<=xx<344:v[yy-t,xx-l]=r.a[100+(yy%8),xx]
 return v
named(r,[('wall-tools',(300,102,328,144)),('wall-cabinet',(344,116,363,169)),('hanging-tools',(332,131,359,151)),('hanging-barrel',(339,164,358,185))],rightback)
r.finish()
r=Room('witchmoor',[(112,244,144,276)])
def witchback(rect):return rowwall(r,rect,116,240,16)
named(r,[('bookcase',(76,210,112,262)),('bookcase',(208,210,245,262))],witchback)
named(r,[('writing-table',(65,272,109,303)),('moon-altar',(232,294,263,330)),('crystal-altar',(65,314,92,354)),('gold-altar',(99,318,124,356)),('book-altar',(211,330,238,367)),('crystal-ball',(178,329,206,364)),('ritual-circle',(155,269,234,330),True)])
r.finish()
sheet=Image.new('RGBA',(2048,16384));x=y=rh=0
for mid,r in results.items():
 for i in ['base']+list(range(len(r['objects']))):
  im=images[mid,i]
  if x+im.width>2048:x=0;y+=rh+2;rh=0
  sheet.alpha_composite(im,(x,y));rect=[x,y,im.width,im.height]
  if i=='base':r['baseRect']=rect
  else:r['objects'][i]['rect']=rect
  x+=im.width+2;rh=max(rh,im.height)
sheet.crop((0,0,2048,y+rh)).save(ROOT/'layers.png');(ROOT/'layouts.json').write_text(json.dumps(results,indent=2,default=int)+'\n')

print(f'Built {sum(report.values())} objects in {len(report)} rooms; all recompose exactly.')

