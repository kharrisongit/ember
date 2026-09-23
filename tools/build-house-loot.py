"""Author deterministic chest positions with clear furniture, door and walking space."""
import base64, gzip, json, re
from pathlib import Path
from collections import deque
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'js/generated/game-part-1.js').read_text()
def unpack(key):return json.loads(gzip.decompress(base64.b64decode(re.search(r'const '+key+r' = "([^"]+)',s)[1])))
w=unpack('W_GZ');sprites=unpack('ATLAS_GZ')['sprites'];layouts={}
for path in (ROOT/'assets/interiors').glob('*/layouts.json'):layouts.update(json.loads(path.read_text()))
def overlap(a,b,pad=0):return a[0]<b[2]+pad and a[2]>b[0]-pad and a[1]<b[3]+pad and a[3]>b[1]-pad
def objects(m):
 if isinstance(m['objs'],list):return m['objs']
 data=base64.b64decode(m['objs']['p']);out=[];acc=[0,0,0];v=shift=0
 for byte in data:
  v|=(byte&127)<<shift
  if byte&128:shift+=7;continue
  i=len(out)%3;acc[i]+=(v>>1)^-(v&1);out.append(acc[i]);v=shift=0
 return out
result=[]
for id,m in sorted(w['maps'].items()):
 if not re.fullmatch(r'house\d+(?:_bedroom2?)?',id):continue
 n=int(re.search(r'\d+',id)[0])
 bedrooms=[k for k in w['maps'] if k.startswith(id+'_bedroom')] if '_bedroom' not in id else []
 if bedrooms and not (len(bedrooms)==1 and n%4==0 or len(bedrooms)==2 and n%5==0):continue
 width,height=m['w']*16,m['h']*16
 boxes=list(m.get('roomBlocks',[]));art=[]
 if id in layouts:
  art=[[o['x'],o['y'],o['x']+o['w'],o['y']+o['h']] for o in layouts[id]['objects'] if not o.get('flat')]
 else:
  obs=objects(m)
  for i in range(0,len(obs),3):
   sid,x,y=obs[i:i+3];name=w['names'][sid]
   if name.startswith(('irug','iwall')):continue
   sp=sprites[name];art.append([x-sp[2]/2,y-sp[3],x+sp[2]/2,y]);boxes.append(art[-1])
 doors=[[d['x']*16-24,d['y']*16-32,d['x']*16+40,d['y']*16+40] for d in m['doors']]
 people=[[n['x']-19,n['y']-30,n['x']+19,n['y']+16] for n in m['npcs']]
 spawn=m['spawn'];clear=art+boxes+doors+people+[[spawn[0]-18,spawn[1]-18,spawn[0]+18,spawn[1]+18]]
 candidates=[]
 for y in range(88,height-24,4):
  for x in range(36,width-28,4):
   # Include the standing space in front, not just the chest artwork.
   rect=[x-16,y-32,x+16,y+20]
   if any(overlap(rect,b,2) for b in clear):continue
   candidates.append((min(x-24,width-24-x)*2+(y-88)*.1,x,y))
 if not candidates:raise RuntimeError('No safe chest site: '+id)
 for _,x,y in sorted(candidates):
  # Reject any placement without a player-sized route from the entrance.
  solid=boxes+[[x-14,y-10,x+14,y]]
  def free(p):return 20<=p[0]<=width-20 and 60<=p[1]<=height-16 and not any(overlap([p[0]-6,p[1]-5,p[0]+6,p[1]+5],b) for b in solid)
  target=(x,y+20);seen={target};q=deque([target])
  while q:
   px,py=q.popleft()
   for p in [(px-4,py),(px+4,py),(px,py-4),(px,py+4)]:
    if p not in seen and free(p):seen.add(p);q.append(p)
  if any(abs(px-spawn[0])<=8 and abs(py-min(spawn[1],height-20))<=8 for px,py in seen):break
 else:raise RuntimeError('No reachable chest site: '+id)
 n=int(re.search(r'\d+',id)[0]);room=2 if id.endswith('bedroom2') else 1 if '_bedroom' in id else 0
 seed=n*3+room
 item=['potion','boarMeat','dragonFish','potion'][seed//3%4] if seed%3==1 else None
 result.append(dict(id=id+':chest',map=id,x=x,y=y,gold=5+(seed*7)%11,**({'item':item} if item else {})))
counts={}
for c in result:counts[c['map'].split('_')[0]]=counts.get(c['map'].split('_')[0],0)+1
assert len(counts)==53 and all(1<=n<=3 for n in counts.values())
(ROOT/'assets/interiors/house-loot.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(result)} reachable chests in {len(counts)} homes; {sum("item" in c for c in result)} item rewards; 5–15 gold each.')
