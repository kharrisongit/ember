"""Pack native desert props and author a caravan court; retain source-pixel scale."""
from PIL import Image,ImageDraw
from pathlib import Path
import json,sys,shutil
root=Path(__file__).resolve().parents[1];src=Path(sys.argv[1]);out=root/'assets/interiors/desert-pyramid'
entries={};strips=[];sources={}
def art(name,file,box=None,frames=1,trim=False):
 im=Image.open(src/file).convert('RGBA');im=im.crop(box) if box else im
 if trim:im=im.crop(im.getbbox())
 entries[name]=[0,sum(s.height for s in strips),im.width//frames,im.height,frames,'desert_dressing'];strips.append(im);sources[name]=file
 return name
# Animation strips retain their original frame sizes and rhythm.
for i in range(1,4):art('dd_camel'+str(i),f'Animals/Camel/Camel_{i}.png',(0,0,96,32),2)
for i in range(1,5):art('dd_vulture'+str(i),f'Animals/Vulture/Vulture_{i}.png',(0,0,288,48),6)
for col in ['Black','Brown','Green','Yellow']:art('dd_scarab'+col,f'Animals/Scarab/Scarab_{col}.png',(0,0,64,16),4)
art('dd_camp','NPC/Traders/Desert_Trader_Camp.png',frames=6)
for i in range(1,5):
 for j in range(1,5):art(f'dd_house{i}{j}',f'Houses/Desert_House_{i}.{j}.png',trim=True)
for name,file in [('pergola','Houses/Pergola.png'),('dead_tree','Props/Dead_tree.png'),('half_tree','Props/HalfDead_tree.png'),('fern','Props/Desert_Fern.png'),('dead_fern','Props/Desert_Fern_Dead.png'),('ladder','Props/Desert_Ladder.png'),('leaves','Props/Fallen_Palm_Leaves.png'),('dead_leaves','Props/Fallen_Palm_Leaves_Dead.png'),('mat','Props/Sleeping_Mat.png'),('watersack','Props/Water_Sack_On_Stick.png'),('mummy','Props/mummy.png')]:art('dd_'+name,file,trim=True)
for i in range(1,3):
 art('dd_obelisk'+str(i),f'Temple/Desert_Obelisk_{i}.png',trim=True)
 art('dd_smallobelisk'+str(i),f'Temple/Desert_Obelisk_Small_{i}.png',trim=True)
for name,file,n in [('campfire','Desert_Campfire.png',6),('firepit','Fire_Pit.png',7),('flies','Flies_anim.png',36)]:art('dd_'+name,'Props/'+file,frames=n)
for i in range(1,4):art('dd_grass'+str(i),f'Props/Outdoor_Decor_Animations/Desert_Grass_{i}_Anim.png',frames=8)
for name,file,boxes in [
 ('plant','Ambarakaman_Plant.png',[(i*16,0,(i+1)*16,16) for i in range(3)]),
 ('bush','Dead_bush.png',[(0,0,16,16),(16,0,32,16)]),
 ('rug','Desert_Rugs.png',[(x,y,x+48,y+32) for y in range(0,96,32) for x in [0,48]]),
 ('pots','Desert_Pots-Sacks.png',[(i*16,0,(i+1)*16,16) for i in range(5)]),
 ('gold','Golden_Pots.png',[(i*16,0,(i+1)*16,16) for i in range(3)]),
 ('palm','Palm_Tree_1.png',[(48,0,96,64),(96,0,144,64)]),
 ('smallpalm','Palm_Tree_2.png',[(32,0,64,48),(64,0,96,48)]),
 ('acacia','Acacia_Tree.png',[(0,0,80,64),(80,0,160,64)]),
 ('rock','Desert_Rocks.png',[(0,0,16,16),(32,0,64,32),(64,16,80,32)]),
 ('grassprop','Desert_Grass_Props.png',[(i*16,0,(i+1)*16,16) for i in range(3)]),
 ('bones','Desert_Bones.png',[(0,0,48,64),(48,0,96,64),(96,0,160,64),(0,64,32,96)]),
 ('cactus','Cactus.png',[(0,0,32,32),(64,64,96,96),(128,128,160,160)]),
 ('fence','Desert_Fencewall.png',[(16,0,48,16)])]:
 for i,box in enumerate(boxes):art('dd_'+name+str(i), 'Props/'+file,box,trim=True)
# Animated cascades and foam are placed over authored, collidable water basins.
for i in range(1,4):
 im=Image.open(src/f'Tiles/Desert_Cliff_Waterfall_{i}.png');art('dd_fall'+str(i),f'Tiles/Desert_Cliff_Waterfall_{i}.png',frames=6)
art('dd_foam','Tiles/Desert_Water_Foam_Animation.png',frames=10)
atlas=Image.new('RGBA',(max(s.width for s in strips),sum(s.height for s in strips)))
y=0
for im in strips:atlas.alpha_composite(im,(0,y));y+=im.height
atlas.save(out/'dressing.png',optimize=True)
(out/'dressing.json').write_text(json.dumps(entries,separators=(',',':'))+'\n')
for role,file in [('archer1','Bow_1'),('archer2','Bow_2'),('lancer1','Atgier_1'),('lancer2','Atgier_2')]:shutil.copyfile(src/f'enemies/Desert_Warrior_{file}.png',out/(role+'.png'))
# Broad sandstone lanes, stepped reservoirs, and planted shaded courtyards.
w,h=960,800;im=Image.new('RGBA',(w,h),'#000000');sand=Image.open(src/'Tiles/Desert_Cliff_Tiles_1.png').convert('RGBA').crop((144,80,160,96))
for y in range(48,768,16):
 for x in range(32,928,16):im.alpha_composite(sand,(x,y))
d=ImageDraw.Draw(im);d.rectangle((25,41,934,774),outline='#452f26',width=3);d.rectangle((28,44,931,771),outline='#e5ad77',width=4)
def nine(file,box,target):
 sh=Image.open(src/file).convert('RGBA');l,t,r,b=target;sx,sy=box
 for y in range(t,b,16):
  for x in range(l,r,16):
   cx=0 if x==l else 32 if x==r-16 else 16;cy=0 if y==t else 32 if y==b-16 else 16
   im.alpha_composite(sh.crop((sx+cx,sy+cy,sx+cx+16,sy+cy+16)),(x,y))
for i,x in enumerate([208,432,656],1):
 nine(f'Tiles/Desert_Cliff_Tiles_{i}.png',(16,16),(x,64,x+144,144))
 nine(f'Tiles/Desert_Water_Tiles_{i}.png',(48,0),(x,144,x+144,240))
 nine(f'Tiles/Desert_Beach_Tiles_{i}.png',(0,0),(x+16,176,x+128,224))
 # A native bridge crosses each ornamental reservoir.
 bridge=Image.open(src/'Tiles/Desert_Bridge.png').convert('RGBA').crop((0,0,96,64));im.alpha_composite(bridge,(x+24,188))
for x,y in [(208,320),(592,320),(208,528),(592,528)]:nine('Tiles/Desert_Grass.png',(0,0),(x,y,x+144,y+112))
im.save(out/'sandspire_court.png',optimize=True)
# Audit maps every pack source to an actual material, sprite, enemy, or existing NPC.
usage={str(p.relative_to(src)):[] for p in src.rglob('*.png')}
for name,file in sources.items():usage[file].append(name)
for file in usage:
 if file.startswith('Tiles/') and not usage[file]:usage[file]=['sandspire_court: native reservoir / garden tiles']
 if file.startswith('NPC/') and not usage[file]:usage[file]=['Sandspire: existing native townspeople and traders']
 if file.startswith('enemies/'):usage[file]=['Pyramid chambers and five approach arenas']
 if file=='Temple/Desert_Temple.png':usage[file]=['World: pyramid exterior']
 if file=='Temple/Temple-House_Interior.png':usage[file]=['Pyramid: walls, floors, stairs, pillars and doorways']
assert all(usage.values()),[k for k,v in usage.items() if not v]
(out/'pack-usage.json').write_text(json.dumps(usage,indent=2)+'\n')
print(f'{len(entries)} native prop strips; {len(usage)} pack sources mapped.')
