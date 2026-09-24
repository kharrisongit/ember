"""Author the Frostcrag–Ashcrag passage with Hollybeck's exact floor area and room count."""
import base64, io, json, re, subprocess, sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/interiors/mountain-passage'
OUT.mkdir(parents=True,exist_ok=True)
plans={}
main=['passage','passage_west','passage_fault','passage_high','passage2',
      'passage_lower','passage_switchback','passage_forge','passage_rift','passage_ascent']
branches=['passage_cache','passage_drift','passage_lookout','passage_well','passage_stores',
          'passage_burrows','passage_gallery','passage_workshop','passage_hollow']
def base(rooms,size,main_route):
 return dict(title='Mountain Passage',size=size,spawn=[(rooms[0][0]+rooms[0][2])//2,rooms[0][3]-32],
  chambers=rooms,floors=[r[:] for r in rooms],doors=[],passages=[],hazards=[],enemies=[],chests=[],mainRoute=main_route)
def horizontal(m,a,b):
 l,r=sorted([a,b]);m['floors'].append([l[2],l[1]+32,r[0],r[1]+64])
def vertical(m,upper,lower,idx):
 x=(upper[0]+upper[2])//2;top,bottom=upper[3],lower[1]
 m['floors'] += [[x-16,top,x+16,top+48],[x-32,top+48,x+32,bottom-48],[x-16,bottom-48,x+16,bottom]]
 m['passages'] += [dict(x=x,y=top+48,mode='open'),dict(x=x,y=bottom,mode='door')]
 m['hazards'].append(dict(id='crossing'+str(idx),type=['spikes','arrow','cannon','flame','saw'][idx%5],axis='y',
  cross=[x-32,x+32],lines=list(range(top+96,bottom-64,80)),lever=[x+32,top-16],period=5.2))
def mirror(m):
 w=m['size'][0]
 for key in ['chambers','floors']:m[key]=[[w-r,t,w-l,b] for l,t,r,b in m[key]]
 m['spawn'][0]=w-m['spawn'][0]
 for p in m['passages']:p['x']=w-p['x']
 for h in m['hazards']:h['cross']=[w-h['cross'][1],w-h['cross'][0]];h['lever'][0]=w-h['lever'][0]
# Three columns / two tiers instead of Hollybeck's two columns / three tiers.
# Vary the two horizontal stretches and the height of the return tier without
# changing total floor area. Each section travels both east and west.
for i,id in enumerate(main):
 shift=[0,64,-64,32,-32][i%5]
 xs=[96,480+shift,832 if i<9 else 864]
 top=112+(i%3)*32;bottom=top+992
 rooms=[[x,bottom,x+128,bottom+96] for x in xs]+[[x,top,x+128,top+96] for x in reversed(xs)]
 m=base(rooms,[1088,bottom+160],True)
 for a,b in [(0,1),(1,2),(3,4),(4,5)]:horizontal(m,rooms[a],rooms[b])
 vertical(m,rooms[3],rooms[2],i)
 if i%2:mirror(m)
 if id=='passage':m['exit']=[m['spawn'][0],m['chambers'][0][3]]
 plans[id]=m
for i,id in enumerate(branches):
 # Climb first, then turn into a hidden upper room; the return door is below.
 rooms=[[96,512,224,608],[96,112,224,208],[416,112,544,208]]
 m=base(rooms,[640,672],False)
 vertical(m,rooms[1],rooms[0],10+i);horizontal(m,rooms[1],rooms[2])
 if i%2==0:mirror(m)
 plans[id]=m
# A single original Ashfiend guards the climb to an undecorated exit chamber.
# Keeping passage3 and foe index zero preserves the existing boss identity.
plans['passage3']=dict(title='Mountain Passage',size=[320,864],spawn=[160,768],
 chambers=[[64,640,256,800],[96,144,224,240]],
 floors=[[64,640,256,800],[96,144,224,240],[144,240,176,288],[144,288,176,592],[144,592,176,640]],
 doors=[],passages=[dict(x=160,y=288,mode='open'),dict(x=160,y=640,mode='door')],hazards=[],chests=[],
 enemies=[['devil',160,712,[64,640,256,800]]],gate=[144,448,176,464],exitChamber=1,
 ashcragExit=[160,144],ashcragArrival=[160,208],mainRoute=True)
def connect(a,ri,b,sealed=False):
 room=plans[a]['chambers'][ri];x,y=(room[0]+room[2])//2,room[1]
 dest=plans[b];sx,sy=dest['spawn'];bottom=dest['chambers'][0][3]
 plans[a]['doors'].append(dict(x=x,y=y,to=b,dir='u',arrival=[sx,sy],sealed=sealed))
 dest['doors'].append(dict(x=sx,y=bottom,to=a,dir='d',arrival=[x,y+32]))
for i,id in enumerate(main):
 connect(id,5,main[i+1] if i+1<len(main) else 'passage3',i in [2,4,6,8])
 # Some dead ends occur before the climb, others after the long upper return.
 if i<len(branches):connect(id,[1,3,4][i%3],branches[i])
count=0
for section,(id,m) in enumerate(plans.items()):
 if id=='passage3':continue
 for ri in ([1,3,5] if m['mainRoute'] else [1,2]):
  room=m['chambers'][ri];l,t,r,b=room
  kinds=['wraith','ghost3'] if section%3 else ['ghost3','wraith','ghost3']
  for kind,(x,y) in zip(kinds,[(l+32,t+56),(r-32,t+72),((l+r)//2,t+80)]):m['enemies'].append([kind,x,y,room])
 for ri in ([2,4] if m['mainRoute'] else [1,2]):
  l,t,r,b=m['chambers'][ri]
  kind='ghost' if count%5==2 else 'empty' if count%5==1 else 'loot'
  m['chests'].append([l+24 if count%2 else r-24,t+24,0 if kind!='loot' else 90+section*5,kind,'wraith' if count%2 else 'ghost3'])
  count+=1
# Recess cannons exactly as in Sandspire; their solid bases leave the central
# walking lane free. The slightly shorter east spans offset these pockets.
for m in plans.values():
 for h in m['hazards']:
  if h['type']=='cannon':
   for i,y in enumerate(h['lines'][::2]):
    l,r=h['cross'];m['floors'].append([l-48,y-16,l,y+16] if i%2==0 else [r,y-16,r+48,y+16])
(OUT/'layout.json').write_text(json.dumps(plans,indent=2)+'\n')
def area(ps):return sum(len({(x,y) for l,t,r,b in m['floors'] for x in range(l,r,16) for y in range(t,b,16)}) for m in ps.values())
holly=json.loads((ROOT/'assets/interiors/hollybeck-temple/layout.json').read_text())
assert len(plans)==20
assert sum(len(m['chambers']) for m in plans.values())==89
assert area(plans)==area(holly),(area(plans),area(holly))
# Reuse the masonry builder so all pillar joints, floor marks and recesses obey
# the same construction rules as the three existing temples.
subprocess.run([sys.executable,str(ROOT/'tools/build-first-temple.py'),'mountain-passage'],check=True)
s=(ROOT/'js/generated/game-part-1.js').read_text()
def asset(name):
 a=json.loads(re.search(r'\{"name":"'+name+r'"[^\n]*?\}',s)[0])
 return a,Image.open(io.BytesIO(base64.b64decode(a['src'].split(',')[1]))).convert('RGBA')
def tint(image,flame=False):
 out=image.copy();data=[]
 for r,g,b,a in out.get_flattened_data():
  if not a:data.append((r,g,b,a));continue
  light=(r*54+g*183+b*19)/256
  if flame:rgb=(round(light*.64+14),round(light*.95+15),round(light*.54+16))
  elif (r,g,b)==(83,93,111):rgb=(round(light*.48+7),round(light*.52+8),round(light*.44+8))
  else:rgb=(round(light*.88+16),round(light*.72+12),round(light*.48+8))
  data.append(tuple(min(255,max(0,v)) for v in rgb)+(a,))
 out.putdata(data);return out
specs=[]
for name,source,flame in [('torch','torch77_sn1',True),('door','dragon77_door',False),('bars','dragon77_bars',False),
                         ('vent','flame78_vent',False),('flame_r','dragon75_flame_r',True),('saw','dragon75_saw',False),('rail','dragon75_rail',False)]:
 a,im=asset(source);file='passage-'+name+'.png';tint(im,flame).save(OUT/file)
 specs.append(dict(name='passage_'+name,w=a['w'],h=a['h'],frames=a['frames'],src='assets/interiors/mountain-passage/'+file+'?v=20260924-passage2'))
(OUT/'sprites.json').write_text(json.dumps(specs,indent=2)+'\n')
print(f'{len(plans)} sections, 89 rooms, {area(plans)} floor tiles (exactly Hollybeck), {count} chests, one original Ashfiend.')
