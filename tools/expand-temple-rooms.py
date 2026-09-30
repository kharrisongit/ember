"""One-time room expansion on the native tile grid; halls and sanctums stay narrow."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
for folder in ['first-temple','sandspire-temple','hollybeck-temple']:
 path=ROOT/'assets/interiors'/folder/'layout.json'
 plans=json.loads(path.read_text());changes={};count=0
 for id,m in plans.items():
  if m.get('roomSpaceVersion')==1:continue
  changes[id]=[]
  for room in m['chambers']:
   l,t,r,b=room
   if ('heartstone' in m and l<=m['heartstone'][0]<r and t<=m['heartstone'][1]<b) or any(e[0].startswith('golem') and e[3]==room for e in m['enemies']):continue
   nr=l+round((r-l)*1.15/16)*16;nb=t+round((b-t)*1.15/16)*16
   old=room[:];new=[l,t,nr,nb];changes[id].append((old,new));count+=1
   room[:]=new
   for floor in m['floors']:
    if floor==old:floor[:]=new
   for e in m['enemies']:
    if e[3]==old:e[3]=new[:]
   # Keep the doorway and hall width. Move only the short neck to the new
   # south wall; the long trap hall's lines and timing remain independent.
   for p in m.get('passages',[]):
    if l<p['x']<r and p['y']==b+48:
     p['y']=nb+48
     for f in m['floors']:
      if f[0]<p['x']<f[2] and f[1]==b and f[3]==b+48:f[1]=nb;f[3]=nb+48
      elif f[0]<p['x']<f[2] and f[1]==b+48:f[1]=nb+48
   for d in m['doors']:
    if d['dir']=='d' and d['y']==b and l<d['x']<r:d['y']=nb
   if 'exit' in m and m['exit'][1]==b and l<m['exit'][0]<r:m['exit'][1]=nb
   if m['spawn'][1]==b-32 and l<m['spawn'][0]<r:m['spawn'][1]+=nb-b
  for chest in m['chests']:
   room=next(r for r in m['chambers'] if r[0]<chest[0]<r[2] and r[1]<chest[1]<r[3])
   l,t,r,b=room;chest[0]=l+24 if chest[0]<(l+r)/2 else r-24;chest[1]=t+24
  m['roomSpaceVersion']=1
 # A return arrival keeps the same distance from its destination's south exit.
 for m in plans.values():
  for d in m['doors']:
   for old,new in changes.get(d['to'],[]):
    if old[0]<d['arrival'][0]<old[2] and d['arrival'][1]==old[3]-32:d['arrival'][1]+=new[3]-old[3]
 path.write_text(json.dumps(plans,indent=2)+'\n')
 print(folder, count, 'ordinary rooms enlarged; native halls and protected rooms retained')
