from PIL import Image
from pathlib import Path
import xml.etree.ElementTree as E
import sys, json, math, shutil
SRC=Path(sys.argv[1])/'Tiled_files'
OUT=Path(__file__).resolve().parents[1]/'assets/interiors/chapel'
OUT.mkdir(parents=True,exist_ok=True)
def read(name):
 r=E.parse(SRC/(name+'.tmx')).getroot();sets=[];layers=[]
 for ts in r.findall('tileset'):
  sets.append(dict(first=int(ts.get('firstgid')),cols=int(ts.get('columns')),name=ts.find('image').get('source'),image=Image.open(SRC/ts.find('image').get('source')).convert('RGBA'),anim={int(t.get('id')):[(int(f.get('tileid')),int(f.get('duration'))) for f in t.findall('animation/frame')] for t in ts.findall('tile')}))
 for l in r.findall('layer'):
  cells=[]
  for c in l.findall('data/chunk'):
   vals=list(map(int,c.text.replace('\n','').split(',')));x,y,w=map(int,[c.get('x'),c.get('y'),c.get('width')]);cells += [(x+i%w,y+i//w,v) for i,v in enumerate(vals) if v]
  layers.append((l.get('name'),cells))
 return sets,layers
def draw(sets,cells,bounds,t=0):
 l,u,r,b=bounds;im=Image.new('RGBA',((r-l)*16,(b-u)*16))
 for x,y,g in cells:
  gid=g&0x0fffffff;ts=next(ts for ts in reversed(sets) if ts['first']<=gid);n=gid-ts['first'];anim=ts['anim'].get(n)
  if anim:
   tick=t%sum(d for f,d in anim)
   for f,d in anim:
    if tick<d:n=f;break
    tick-=d
  sx=(n%ts['cols'])*16;sy=(n//ts['cols'])*16;tile=ts['image'].crop((sx,sy,sx+16,sy+16))
  if g&0x20000000:tile=tile.transpose(Image.Transpose.TRANSPOSE)
  if g&0x80000000:tile=tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
  if g&0x40000000:tile=tile.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
  im.alpha_composite(tile,((x-l)*16,(y-u)*16))
 return im
def components(cells,by_set=False,rows=False):
 groups=[];todo={(x,y):g for x,y,g in cells}
 while todo:
  pos=next(iter(todo));g=todo[pos];ts=next(ts for ts in reversed(sets) if ts['first']<=(g&0x0fffffff));stack=[pos];group=[]
  while stack:
   x,y=stack.pop()
   if (x,y) not in todo:continue
   v=todo[x,y];vts=next(q for q in reversed(sets) if q['first']<=(v&0x0fffffff))
   if by_set and ts is not vts:continue
   group.append((x,y,todo.pop((x,y))))
   stack += [(x-1,y),(x+1,y)] + ([] if rows else [(x,y-1),(x,y+1)])
  groups.append(group)
 return groups
plans={'sprites':{},'interior':[],'exterior':[]}
def pack(key,cells,offset,layer):
 bounds=(min(x for x,y,g in cells),min(y for x,y,g in cells),max(x for x,y,g in cells)+1,max(y for x,y,g in cells)+1)
 timings=[]
 for x,y,g in cells:
  ts=next(ts for ts in reversed(sets) if ts['first']<=(g&0x0fffffff));a=ts['anim'].get((g&0x0fffffff)-ts['first'])
  if a:timings.append(a)
 period=math.lcm(*(sum(d for f,d in a) for a in timings)) if timings else 1
 assert period<15000,(key,period)
 times={0,period}
 for a in timings:
  total=sum(d for f,d in a)
  for start in range(0,period,total):
   t=start
   for f,d in a:t+=d;times.add(t)
 times=sorted(times);frames=[draw(sets,cells,bounds,t) for t in times[:-1]]
 w,h=frames[0].size;strip=Image.new('RGBA',(w*len(frames),h))
 for i,f in enumerate(frames):strip.alpha_composite(f,(i*w,0))
 strip.save(OUT/(key+'.png'))
 plans['sprites'][key]={'w':w,'h':h,'durations':[b-a for a,b in zip(times,times[1:])]}
 return dict(spr=key,x=bounds[0]*16+offset[0]+w/2,y=bounds[1]*16+offset[1]+h,layer=layer)
sets,layers=read('Interior');bounds=(-11,-9,11,8)
base=Image.new('RGBA',(352,272))
static={'Floor1','Floor2','Carpet','Walls','Windows','Icons'}
for name,cells in layers:
 if name in static:base.alpha_composite(draw(sets,cells,bounds))
base.save(OUT/'interior.png')
for name,cells in layers:
 if name in static or name=='Priest':continue
 # Every pew is one depth-sorted row. Other objects follow connected source tiles.
 for i,group in enumerate(components(cells,by_set=True,rows=name=='benches')):
  key='chapel_'+name.lower()+str(i)
  a=pack(key,group,(176,144),name)
  a['congregation']=name.startswith(('Parishioners','Monks'))
  if name=='Fence':a['sy']=124
  if name=='Candelabra':a['sy']=124
  if name=='Walls_top':a['sy']=1000000
  plans['interior'].append(a)
sets,layers=read('Exterior')
for name,cells in layers:
 if name not in ('House','Wings','Dragon_body_head'):continue
 for i,group in enumerate(components(cells,by_set=True)):
  a=pack('chapel_ext_'+name.lower()+str(i),group,(-16,-32),name)
  a['spirit']=name!='House';plans['exterior'].append(a)
# Grave markers and their flowers are transparent objects, never a ground tile.
graves=dict(layers)['Graves'];flowers=dict(layers)['Flowers']
for i,(l,t) in enumerate([(-3,-9),(-1,-9),(1,-9),(3,-9),(-7,-7),(-5,-7),(5,-7),(7,-7),(-7,-4),(-5,-4),(5,-4),(7,-4)]):
 group=[(x,y,g) for x,y,g in graves if l<=x<l+2 and t<=y<t+2]
 cluster=group+[(x,y,g) for x,y,g in flowers if l<=x<l+2 and t<=y<t+3]
 pack('chapel_grave'+str(i),cluster,(0,0),'grave')
# Preserve all priest directions plus the complete speech/casting sequences.
for action,count in [('Idle',12),('Walk',6)]:
 src=Image.open(SRC/('Priest_'+action+'.png')).convert('RGBA')
 for row,dir in enumerate(['d','w','e','u']):
  key='chapel_priest_'+action.lower()+'_'+dir
  src.crop((0,row*48,count*32,(row+1)*48)).save(OUT/(key+'.png'))
  plans['sprites'][key]={'w':32,'h':48,'durations':[100]*count}
for action,file,w,h,count in [('speech','Priest_speech',32,48,12),('cast','Priest_making_spell',32,48,18),('spell','Priest_spell',128,96,18)]:
 src=Image.open(SRC/(file+'.png')).convert('RGBA');strip=Image.new('RGBA',(w*count,h));cols=src.width//w
 for i in range(count):strip.alpha_composite(src.crop(((i%cols)*w,(i//cols)*h,(i%cols+1)*w,(i//cols+1)*h)),(i*w,0))
 key='chapel_priest_'+action;strip.save(OUT/(key+'.png'));plans['sprites'][key]={'w':w,'h':h,'durations':[100]*count}
plans['floors']=[[112,88,240,112],[80,112,272,128],[48,128,304,192],[64,192,288,208],[96,208,256,224],[160,216,192,240]]
# One shared atlas keeps startup and publishing to two image files.
row_x=row_y=row_h=0;tiles=[]
for key,sprite in plans['sprites'].items():
 im=Image.open(OUT/(key+'.png')).convert('RGBA')
 if row_x+im.width>4096:row_y+=row_h;row_x=row_h=0
 sprite['x']=row_x;sprite['y']=row_y;tiles.append((im,row_x,row_y));row_x+=im.width;row_h=max(row_h,im.height)
atlas=Image.new('RGBA',(4096,row_y+row_h))
for im,x,y in tiles:atlas.alpha_composite(im,(x,y))
atlas.save(OUT/'sprites.png')
for key in plans['sprites']:(OUT/(key+'.png')).unlink()
(OUT/'layout.json').write_text(json.dumps(plans,separators=(',',':'))+'\n')
shutil.copyfile(SRC.parent/'License.txt',OUT/'License.txt')
print('Packed',len(plans['sprites']),'animated/static sprites; interior',len(plans['interior']),'actors; exterior',len(plans['exterior']),'actors')
