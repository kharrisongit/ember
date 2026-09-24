"""Hollybeck: twenty compact sections, alternating east/west switchbacks."""
import json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
plans={}
main=[('sn1','Winter Threshold'),('sn_west','Westward Procession'),('sn_banners','Hall of Torn Banners'),
 ('sn_east','Eastern Watch'),('sn_furnaces','Frostfire Galleries'),('sn_crossing','Crossing of the Lost'),
 ('sn_saws','Grinders of the Old Order'),('sn_return','Western Return'),('sn_vigil','The Long Vigil'),('sn_ascent','Last Rider Ascent')]
branches=[('sn_offerings','Forgotten Offerings'),('sn_crypts','Buried Riders'),('sn_archive','Frozen Archive'),
 ('sn_bells','Silent Bell Hall'),('sn_ashes','Chapel of Ash'),('sn_reliquary','Broken Reliquary'),
 ('sn_tombs','Western Tombs'),('sn_watch','Abandoned Watch'),('sn_treasury','Lost Treasury')]
def vertical(m,upper,lower,idx):
 cx=(upper[0]+upper[2])//2;top=upper[3];bottom=lower[1]
 m['floors'] += [[cx-16,top,cx+16,top+48],[cx-32,top+48,cx+32,bottom-48],[cx-16,bottom-48,cx+16,bottom]]
 m['passages'] += [dict(x=cx,y=top+48,mode='open'),dict(x=cx,y=bottom,mode='door')]
 m['hazards'].append(dict(id='hall'+str(idx),type=['flame','saw','spikes'][idx%3],axis='y',
  cross=[cx-32,cx+32],lines=list(range(top+96,bottom-64,80)),lever=[cx+32,top-16],period=5.2))
def horizontal(m,a,b):
 l,r=sorted([a,b]);m['floors'].append([l[2],l[1]+32,r[0],r[1]+64])
def mirror(m):
 w=m['size'][0]
 for key in ['chambers','floors']:m[key]=[[w-r,t,w-l,b] for l,t,r,b in m[key]]
 m['spawn'][0]=w-m['spawn'][0]
 for p in m['passages']:p['x']=w-p['x']
 for h in m['hazards']:h['cross']=[w-h['cross'][1],w-h['cross'][0]];h['lever'][0]=w-h['lever'][0]
def base(title,rooms,size,mainRoute):
 return dict(title='Hollybeck Temple — '+title,size=size,spawn=[(rooms[0][0]+rooms[0][2])//2,rooms[0][3]-32],
  chambers=rooms,floors=[r[:] for r in rooms],doors=[],passages=[],hazards=[],enemies=[],chests=[],mainRoute=mainRoute)
for i,(id,title) in enumerate(main):
 rooms=[[96,1280,224,1376],[544,1280,672,1376],[544,704,672,800],[96,704,224,800],[96,112,224,208],[544,112,672,208]]
 m=base(title,rooms,[768,1440],True)
 for a,b in [(0,1),(2,3),(4,5)]:horizontal(m,rooms[a],rooms[b])
 vertical(m,rooms[2],rooms[1],i*2);vertical(m,rooms[4],rooms[3],i*2+1)
 if i%2==0:mirror(m)
 if id=='sn1':m['exit']=[m['spawn'][0],m['chambers'][0][3]]
 plans[id]=m
for i,(id,title) in enumerate(branches):
 rooms=[[96,512,224,608],[416,512,544,608],[416,112,544,208]]
 m=base(title,rooms,[640,672],False);horizontal(m,rooms[0],rooms[1]);vertical(m,rooms[2],rooms[1],20+i)
 if i%2:mirror(m)
 plans[id]=m
# Preserve the original stepped skull chamber, translated upward by 256 px.
plans['sn_sanctum']=dict(title='Hollybeck Temple — Shadow Heart Sanctum',size=[320,688],spawn=[160,592],
 chambers=[[64,512,256,624],[80,112,240,256]],floors=[[64,512,256,624],[80,112,240,256],[128,64,192,112],[144,256,176,304],[144,304,176,512]],
 chests=[],enemies=[['golem2',112,552,[64,512,256,624]],['golem2',208,576,[64,512,256,624]]],
 doors=[],passages=[dict(x=160,y=304,mode='open')],hazards=[],gate=[144,400,176,416],heartstone=[224,136],preserveChamberOffset=[0,-256],mainRoute=True)
def connect(a,roomIndex,b,sealed=False):
 room=plans[a]['chambers'][roomIndex];x=(room[0]+room[2])//2;y=room[1]
 target=plans[b];sx,sy=target['spawn'];bottom=target['chambers'][0][3]
 plans[a]['doors'].append(dict(x=x,y=y,to=b,dir='u',arrival=[sx,sy],sealed=sealed))
 target['doors'].append(dict(x=sx,y=bottom,to=a,dir='d',arrival=[x,y+32]))
for i,(id,_) in enumerate(main):
 connect(id,5,main[i+1][0] if i+1<len(main) else 'sn_sanctum',i in [1,3,5,7,9])
 if i<len(branches):connect(id,3 if i%2 else 4,branches[i][0])
count=0
for section,(id,m) in enumerate(plans.items()):
 if id=='sn_sanctum':continue
 for ri in ([1,3,5] if m['mainRoute'] else [1,2]):
  room=m['chambers'][ri];l,t,r,b=room
  kinds=['ghost3','wraith'] if section<4 else ['ghost3','ghost3','wraith']
  spots=[(l+32,t+56),(r-32,t+72),((l+r)//2,t+80)]
  for kind,(x,y) in zip(kinds,spots):m['enemies'].append([kind,x,y,room])
 for ri in ([3,5] if m['mainRoute'] else [1,2]):
  room=m['chambers'][ri];l,t,r,b=room
  kind='ghost' if count%5==2 else 'empty' if count%5==1 else 'loot'
  x=l+24 if count%2 else r-24
  m['chests'].append([x,t+24,0 if kind!='loot' else 65+section*5,kind,'ghost3' if count%2 else 'wraith']);count+=1
path=ROOT/'assets/interiors/hollybeck-temple';path.mkdir(parents=True,exist_ok=True)
(path/'layout.json').write_text(json.dumps(plans,indent=2)+'\n')
def area(ps):return sum(len({(x,y) for l,t,r,b in m['floors'] for x in range(l,r,16) for y in range(t,b,16)}) for m in ps.values())
sand=json.loads((ROOT/'assets/interiors/sandspire-temple/layout.json').read_text())
assert area(plans)>=area(sand)*2,(area(plans),area(sand))
print(f'{len(plans)} sections, {sum(len(m["chambers"]) for m in plans.values())} rooms, {area(plans)/area(sand):.3f}× Sandspire floor area, {count} chests')
subprocess.run([sys.executable,str(ROOT/'tools/build-first-temple.py'),'hollybeck-temple'],check=True)
