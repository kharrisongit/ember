import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log:console.log,warn(){}},{furniture:false});
c.assert=assert;await run('inflateAtlas()');

run(`
mode='play';quest=Q.DONE;dragonReady=true;gameplayStarted=true;EmberRiding.skip();thornwellRoyal.stage=7;
scene=null;bossScene=null;revealing=false;fadeDir=0;foesHeld=false;dragonIntroDone=true;
EmberArenaEntry={...EmberArenaEntry,holding:()=>false,protected:()=>false,prepare:()=>{}};
EmberRiding={...EmberRiding,holding:()=>false,waitingEnemy:()=>false,stageEnemies:()=>{}};
buildGround=()=>{};reindex=()=>{};refreshBuild=()=>{};rebuildBuckets=()=>{};placeBirds=()=>{};
// A controlled outdoor arena uses the real isSolid/AI code with solid scenery
// and both circular and rectangular boundaries. Temple maps below supply the
// authored masonry; tree generation is unrelated to this movement regression.
MAPID='world';MD={w:64,h:64,npcs:[],doors:[],roomActors:[],features:[]};
MW=64;MH=64;PXW=1024;PXH=1024;solid=new Uint8Array(MW*MH);terr=new Uint8Array(MW*MH);
npcs=[];objs=[];fobjs=[];fenceAt=null;features=[{id:209,kind:'arena',x:30,y:30,r:6.3}];
var combatAudit={arenas:0,frames:0,breaths:0,attacks:0};
var basePlayerHurt=hurtPlayer,baseDragonHurt=hurtDragon;
hurtPlayer=()=>{combatAudit.attacks++;};hurtDragon=()=>{combatAudit.attacks++;};
function setupFight(a){
 arenaLock=a;arenaT=1;arenaGoing=false;scene=null;bossScene=null;fadeDir=0;revealing=false;ride=null;mounted=false;
 hunt=null;breath=null;claw=null;clawT=0;linger=0;dragonBreak=null;dragonRecall=false;dragonCombatPause=0;
 dragonFacingLocked=false;turnHolder=null;turnT=0;foeCool=0;lastFight=0;bolts.length=0;bell=null;
 const box=a.templeRoom,center=box?{x:(box[0]+box[2])/2,y:(box[1]+box[3])/2}:{x:a.x*TS+8,y:a.y*TS+8};
 Object.assign(P,{...center,moving:false,act:null});
 Object.assign(dragon,{...center,placed:MAPID,on:true,down:false,hp:20,air:false,tr:null,knockdown:0,revive:0,_edgeGoal:null});
 return center;
}
function verifyBody(actor,label){
 const p=combatProject(actor,actor.x,actor.y);
 assert(Math.hypot(actor.x-p.x,actor.y-p.y)<.1,label+' stays inside the safe boundary');
 assert(combatTerrainClear(actor,actor.x,actor.y,actor===dragon&&dragon.air),label+' footprint is clear of walls');
}
// Circular arena collision at all eight edge angles,
// ground and flying companion, and both small enemies and wide bosses.
for(const a of currentArenaFeatures().filter(a=>!isHuntingArena(a)&&!a.storyKnight)){
 const center=setupFight(a);combatAudit.arenas++;
 for(let i=0;i<8;i++)for(const air of [false,true]){
  const angle=i*Math.PI/4,dx=Math.cos(angle),dy=Math.sin(angle);
  dragon.air=air;
  const edge=combatProject(dragon,center.x+dx*1000,center.y+dy*1000);
  Object.assign(dragon,edge);recoverCombatFooting(dragon,air);
  for(let frame=0;frame<5;frame++)dragonStep(dx*3,dy*3);
  verifyBody(dragon,'dragon '+a.id+'/'+i+'/'+air);
  assert(Math.hypot(dragon.x-center.x,dragon.y-center.y)<a.r*TS-24,'outward movement redirects before the wall');
  for(const kind of ['boneguard','golem3']){
   const f={kind,hx:center.x,hy:center.y,...center};
   Object.assign(f,combatProject(f,center.x+dx*1000,center.y+dy*1000));
   for(let frame=0;frame<5;frame++)moveCombatActor(f,dx*2,dy*2);
   verifyBody(f,'foe '+a.id+'/'+i+'/'+kind);
  }
 }
}
// Sustain actual combat AI in a small ring. Enemies start at the perimeter;
// Corin takes each edge in turn, while repeated hits request retreats.

var ring=currentArenaFeatures().find(a=>a.id===209)||currentArenaFeatures()[0];
var center=setupFight(ring);
foes=['boneguard','shroomRed','gnoll2','lich'].map((kind,i)=>{
 const f={kind,...center,hx:center.x,hy:center.y,hp:10000,st:'walk',t:0,dir:'d',hurt:0};
 return Object.assign(f,combatProject(f,center.x+Math.cos(i*Math.PI/2)*1000,center.y+Math.sin(i*Math.PI/2)*1000));
});
var swings=0;
for(let frame=0;frame<3600;frame++){
 const angle=Math.floor(frame/450)*Math.PI/4;
 const point=frame<900?center:{x:center.x+Math.cos(angle)*(ring.r*TS-20),y:center.y+Math.sin(angle)*(ring.r*TS-20)};
 P.x=point.x;P.y=point.y;tAcc+=1/60;
 if(frame%90===0)for(const f of foes)makeFoeRetreat(f,P.x,P.y);
 stepFoes(1/60);stepBreath(1/60);stepDragon(1/60);stepClaw(1/60);
 if(claw)swings++;
 for(const f of foes)verifyBody(f,'sustained '+f.kind);
 verifyBody(dragon,'sustained dragon');combatAudit.frames++;
}
assert(swings>10,'dragon still lands claw attacks');assert(combatAudit.attacks>5,'enemies continue attacking while retreating and orbiting');
// At each boundary, normal breath commands complete, instead of timing out.
for(let i=0;i<8;i++){
 const angle=i*Math.PI/4;setupFight(ring);dragon.air=i%2===0;
 const f={kind:'boneguard',...center,hx:center.x,hy:center.y,hp:10000,st:'idle',t:0};
 Object.assign(f,combatProject(f,center.x+Math.cos(angle)*1000,center.y+Math.sin(angle)*1000));
 foes=[f];Object.assign(dragon,combatProject(dragon,f.x+Math.cos(angle)*18,f.y+Math.sin(angle)*18));
 recoverCombatFooting(dragon,dragon.air);hunt={foe:f,t:0};
 for(let frame=0;frame<150&&!breath;frame++){stepHunt(1/60);verifyBody(dragon,'breath positioning');}
 assert(breath,'edge breath '+i+' fires before timeout');combatAudit.breaths++;
}
// Hugging a wall must not make Corin untouchable. The active attacker can
// close within its reach without using the wider idle/orbit spacing.
for(let i=0;i<8;i++){
 setupFight(ring);dragon.on=false;
 const angle=i*Math.PI/4,dx=Math.cos(angle),dy=Math.sin(angle);
 for(let d=0;d<ring.r*TS+40;d++){
  const x=center.x+dx*d,y=center.y+dy*d;if(!canStand(x,y))break;P.x=x;P.y=y;
 }
 const f={kind:'boneguard',...center,hx:center.x,hy:center.y,st:'walk',t:0,hp:100,dir:'d'};
 foes=[f];const before=combatAudit.attacks;
 for(let frame=0;frame<900&&combatAudit.attacks===before;frame++){tAcc+=1/60;stepFoes(1/60);}
 assert(combatAudit.attacks>before,'enemy can attack wall-hugging Corin at angle '+i+' (gap '+Math.hypot(P.x-f.x,P.y-f.y)+')');
 verifyBody(f,'wall-hug attacker');
}
// A frame spike must not tunnel through a wall, and an old overlapping
// position must recover using the full footprint rather than its centre only.
setupFight(ring);
const wallCol=Math.floor(center.x/TS)+2;
for(let y=0;y<MH;y++)solid[y*MW+wallCol]=1;
for(const air of [false,true]){
 Object.assign(dragon,{...center,air});dragonStep(240,40);
 assert(dragon.x<wallCol*TS,'dragon cannot tunnel through a solid wall');verifyBody(dragon,'solid wall');
}
const blockedFoe={kind:'boneguard',...center,hx:center.x,hy:center.y};
moveCombatActor(blockedFoe,240,40);assert(blockedFoe.x<wallCol*TS,'enemy cannot tunnel through a solid wall');verifyBody(blockedFoe,'solid wall foe');
blockedFoe.x=wallCol*TS+1;blockedFoe.y=center.y;
assert(recoverCombatFooting(blockedFoe),'embedded footprint is repaired');verifyBody(blockedFoe,'recovered foe');
solid.fill(0);
// An explicit breath order cancels the previous boss disengagement.
setupFight(ring);foes=[{kind:'boneguard',x:center.x+40,y:center.y,hx:center.x,hy:center.y,st:'idle',hp:100}];
breathCooldown.fire=0;dragonEl='fire';dragonBreak={foe:foes[0],t:1};breatheFire();
assert.equal(dragonBreak,null);assert(hunt);
// Short boss recovery ends even when the requested separation is impossible.
setupFight(ring);foes=[];var boss={kind:'kdragon',x:center.x,y:center.y,st:'walk'};
lastFight=1;MAPID='cinderhold';dragon.placed=MAPID;dragonBreak={foe:boss,t:.1};foes=[boss];
for(let i=0;i<30&&dragonBreak;i++){boss.x=dragon.x;boss.y=dragon.y;stepDragon(1/60);}
assert.equal(dragonBreak,null,'boss retreat has a finite end');lastFight=0;
`);
// All corners of all real temple combat rooms, with both grounded and flying
// dragons. Load full maps so masonry, gates, and edited props participate.
await run('(async()=>{await prepareExpandedFirstTemple();await prepareExpandedSandspireTemple();await prepareExpandedHollybeckTemple();await prepareExpandedMountainPassage();})()');
run(`
for(const [id,map]of Object.entries(W.maps).filter(([id,m])=>m.templeExpanded&&['tp1','ds1','sn1','passage3'].includes(id))){
 loadMap(id,true);
 for(const a of expandedTempleArenas()){
  const center=setupFight(a),[l,t,r,b]=a.templeRoom;combatAudit.arenas++;
  for(const [x,y]of [[l,t],[r,t],[l,b],[r,b]])for(const air of [false,true]){
   dragon.air=air;Object.assign(dragon,{x,y});recoverCombatFooting(dragon,air);
   for(let n=0;n<5;n++)dragonStep(Math.sign(x-center.x)*2,Math.sign(y-center.y)*2);
   verifyBody(dragon,id+' dragon corner');
   const f={kind:a.templeBoss?'golem3':'boneguard',x,y,hx:center.x,hy:center.y,expandedRoom:a.templeRoom};
   for(let n=0;n<5;n++)moveCombatActor(f,Math.sign(x-center.x)*2,Math.sign(y-center.y)*2);
   verifyBody(f,id+' foe corner');
  }
 }
}
assert(combatAudit.arenas>=5,'covers circular fights and all four dungeon families');
`);
console.log('PASS: circular and authored temple wall/corner navigation, 60 seconds of attacking AI, eight edge breath commands, command priority, and finite boss retreats.');
console.log(run('JSON.stringify(combatAudit)'));
