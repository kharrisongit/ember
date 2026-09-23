"""Author Sandspire's ten sections using the proven compact temple masonry grid."""
import copy,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=json.loads((ROOT/'assets/interiors/first-temple/layout.json').read_text())
plans={}
specs=[('ds1','tp1',True,'Sunken Entry'),('ds_west','tp1_halls',True,'Western Galleries'),
 ('ds_foundry','tp1_halls',False,'Alchemical Works'),('ds_winding','tp1_crypt',True,'Buried Switchback'),
 ('ds_deepworks','tp1_halls',False,'Deep Engine Halls'),('ds_approach','tp1_crypt',False,'Last Ascent'),
 ('ds_sanctum','tp1_sanctum',False,'Frozen Heart Vault'),
 ('ds_archive','tp1_reliquary',False,'Dustbound Archive'),('ds_cells','tp1_reliquary',False,'Specimen Cells'),
 ('ds_ossuary','tp1_reliquary',True,'Sealed Ossuary')]
for id,template,mirror,title in specs:
 m=copy.deepcopy(source[template]);w=m['size'][0]
 m['title']='Sandspire Temple — '+title
 for k in ['doors','enemies']:m[k]=[]
 if id!='ds1':m.pop('exit',None)
 if mirror:
  for key in ['chambers','floors']:m[key]=[[w-r,t,w-l,b] for l,t,r,b in m[key]]
  m['spawn'][0]=w-m['spawn'][0]
  for c in m['chests']:c[0]=w-c[0]
  for p in m.get('passages',[]):p['x']=w-p['x']
  for h in m.get('hazards',[]):h['cross']=[w-h['cross'][1],w-h['cross'][0]];h['lever'][0]=w-h['lever'][0]
  if 'exit' in m:m['exit'][0]=w-m['exit'][0]
 m['mainRoute']=id not in ['ds_archive','ds_cells','ds_ossuary']
 plans[id]=m
def connect(a,x,y,b,locked=False):
 dest=plans[b];sx,sy=dest['spawn'];bottom=dest['chambers'][0][3]
 plans[a]['doors'].append(dict(x=x,y=y,to=b,dir='u',arrival=[sx,sy],sealed=locked))
 dest['doors'].append(dict(x=sx,y=bottom,to=a,dir='d',arrival=[x,y+32]))
connect('ds1',96,64,'ds_west');connect('ds1',448,64,'ds_archive')
connect('ds_west',96,112,'ds_foundry',True);connect('ds_west',544,448,'ds_cells')
connect('ds_foundry',608,112,'ds_winding');connect('ds_foundry',160,448,'ds_ossuary')
connect('ds_winding',96,112,'ds_deepworks')
connect('ds_deepworks',608,112,'ds_approach',True)
connect('ds_approach',480,112,'ds_sanctum')
chest_number=0;trap_number=0
for section,(id,m) in enumerate(plans.items()):
 if id=='ds_sanctum':
  m['enemies']=[['golem1',160,320,m['chambers'][0]],['golem1',224,352,m['chambers'][0]]]
  m.pop('elder',None);m.pop('statue',None)
  continue
 rooms=[m['chambers'][1],m['chambers'][-1]] if m['mainRoute'] else [m['chambers'][1]]
 for room in rooms:
  l,t,r,b=room
  m['enemies'].extend([['ghost',l+32,t+48,room],['ghost',r-32,t+64,room]])
  if 2<=section<=5:m['enemies'].append(['wraith',(l+r)//2,t+80,room])
 for c in m['chests']:
  # Four empty chests and three one-time ambushes among eighteen regular chests.
  kind='ghost' if chest_number in [3,9,15] else 'empty' if chest_number in [1,5,11,16] else 'loot'
  c[2]=0 if kind!='loot' else 38+chest_number*3
  c.append(kind);chest_number+=1
 for h in m.get('hazards',[]):
  h['type']=['arrow','cannon','spikes'][trap_number%3];trap_number+=1
  h['period']=4.8 if section<3 else 4.4
  if h['type']=='cannon':
   # Recess the original wide cannon art, leaving a clear central walking lane.
   for i,line in enumerate(h['lines'][::2]):
    l,r=h['cross'];m['floors'].append([l-48,line-16,l,line+16] if i%2==0 else [r,line-16,r+48,line+16])
path=ROOT/'assets/interiors/sandspire-temple';path.mkdir(parents=True,exist_ok=True)
(path/'layout.json').write_text(json.dumps(plans,indent=2)+'\n')
print(f'{len(plans)} sections, {sum(len(m["chambers"]) for m in plans.values())} rooms, {chest_number} chests, {trap_number} trap halls')
subprocess.run([sys.executable,str(ROOT/'tools/build-first-temple.py'),'sandspire-temple'],check=True)
