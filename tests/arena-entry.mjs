import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false,document:dom.document});
run(`MAPID='world';MD=W.maps.world;features=MD.features;quest=Q.DONE;mode='play';gameplayStarted=true;
EmberRiding.skip();scene=null;revealing=false;fadeDir=0;fade=0;dragon.on=false;deadShown=false;
canStand=()=>true;dragonCanStand=()=>true;rebuildSolid=()=>{};rebuildBuckets=()=>{};clampCam=()=>{};
MW=4000;MH=600;solid=new Uint8Array(MW*MH);terr=new Uint8Array(MW*MH);blockedByNpcBody=()=>false;blockedByNpcBuffer=()=>false;
stepChest=()=>{};stepHuntingGrounds=()=>{};saveGame=()=>{};recoverStrandedDragon=()=>{};
const testRing=features.find(a=>a.id===209);currentArenaFeatures=()=>[testRing];
let musicStarts=0,musicStops=0;EmberBattleMusic={start(){musicStarts++;},stop(){musicStops++;}};`);
const tick=()=>run('EmberArenaEntry.step(.05);stepArena(.05);stepCombat(.05)');
for(const [name,dx,dy]of [['south',0,1],['north',0,-1],['west',-1,0],['east',1,0]]){
 c.entry=[dx,dy];
 run(`arenaLock=null;arenaT=0;arenaGoing=false;cooling.clear();holy.clear();cam.x=-1000;cam.y=-1000;cam.z=3;
P.x=testRing.x*TS+8+entry[0]*(testRing.r+2)*TS;P.y=testRing.y*TS+8+entry[1]*(testRing.r+2)*TS;P.act=null;
foes=[0,1,2].map(i=>({kind:'plant1',x:testRing.x*TS+i*20,y:testRing.y*TS,hp:8,st:'idle',t:0}));
EmberArenaEntry.prepare();`);
 assert(run('foes.every(f=>EmberArenaEntry.protected(f))'),name+' approach is protected');
 assert(run('foes.every(f=>(f.x-testRing.x*TS-8)*entry[0]+(f.y-testRing.y*TS-8)*entry[1]<0)'),name+' waits on opposite side');
 const before=run('JSON.stringify(foes.map(f=>[f.x,f.y,f.hp]))');
 run('stepFoes(.5)');assert.equal(run('JSON.stringify(foes.map(f=>[f.x,f.y,f.hp]))'),before,'No leash chasing');
 // Reproduce the original edge exploit by placing the sword exactly over a waiting target.
 run('{const oldPoint=[P.x,P.y];P.x=foes[0].x;P.y=foes[0].y;P.act={kind:"swing",t:4,dir:"u"};swingHits();[P.x,P.y]=oldPoint;P.act=null;}');
 assert(run('foes.every(f=>f.hp===8)'),name+' waiting enemies cannot take sword damage');
 run('{const oldPoint=[P.x,P.y];dragon.on=true;dragon.hp=20;dragon.down=false;dragon.knockdown=0;dragon.placed=MAPID;dragon.x=foes[0].x;dragon.y=foes[0].y;clawNow();breath={x:foes[0].x-4,y:foes[0].y-16,vx:1,vy:0,t:.2,distance:0,speed:100,el:"fire"};stepBreath(.05);breath=null;claw=null;dragon.on=false;[P.x,P.y]=oldPoint;}');
 assert(run('foes.every(f=>f.hp===8)'),name+' waiting enemies cannot take breath or claw damage');
 run('P.x=testRing.x*TS+entry[0]*(testRing.r-1.2)*TS;P.y=testRing.y*TS+entry[1]*(testRing.r-1.2)*TS;stepArena(.05)');
 assert(run('EmberArenaEntry.holding()&&sceneHold()'),'Entry locks movement');
 assert(dom.element('arenaReady').hidden,'Walls rise before the popup');
 const starts=run('musicStarts');
 for(let i=0;i<80&&dom.element('arenaReady').hidden;i++)tick();
 assert(!dom.element('arenaReady').hidden,name+' prompt appears');
 assert.equal(run('musicStarts'),starts+1,'Music begins with the popup');
 assert(run('foes.every(f=>f.st==="idle"&&f.hp===8)'),name+' enemies wait intact');
 // Portrait and landscape framing keeps enemies in view without a distant zoom.
 for(const [w,h]of [[390,510],[844,250],[1280,680]]){
  c.size=[w,h];run('VW=size[0];VH=size[1];EmberArenaEntry.frameCamera()');
  assert(run(`cam.z>Math.min(3,(VW-24)/(Math.max(P.x,...foes.map(f=>f.x))-Math.min(P.x,...foes.map(f=>f.x))+96),Math.max(40,VH-194)/(Math.max(P.y,...foes.map(f=>f.y))-Math.min(P.y,...foes.map(f=>f.y))+112))`),'Entry framing stays closer than the old padded view');
  assert(run('cam.z>=2.7-1e-6'),'Arena pause pulls back at most 10 percent');
  assert(run('foes.every(f=>(f.x-cam.x)*cam.z>=0&&(f.x-cam.x)*cam.z<=VW&&(f.y-32-cam.y)*cam.z>=0&&(f.y-32-cam.y)*cam.z<=VH)'),name+' enemies visible at '+w+'×'+h);
 }
 dom.touch(dom.element('act'));
 assert(!run('EmberArenaEntry.holding()'),'One A starts the battle');
 assert(dom.element('arenaReady').hidden);assert.equal(run('P.act'),null,'Confirm is consumed, no accidental attack');
 assert(run('foes.every(f=>!EmberArenaEntry.protected(f))'),'All combat damage is enabled');
 run('stepFoes(.05)');assert(run('foes.every(f=>f._thinking)'),'AI resumes');
 run('foes.forEach(f=>{f.st="dead";f.hp=0;})');for(let i=0;i<12;i++)tick();
 assert.equal(run('arenaLock'),null);assert(run('cooling.has(ringKey(testRing))'),'Respawn cooldown retained');
 assert(run('musicStops>0'),'Exploration music restored');
 // The next wave must be repositioned using the return direction, not the last fight.
 run(`stepArenas(301);P.x=testRing.x*TS+8-entry[0]*(testRing.r+2)*TS;P.y=testRing.y*TS+8-entry[1]*(testRing.r+2)*TS;
 cam.x=-1000;cam.y=-1000;refillRing(testRing);`);
 assert(run('foes.filter(f=>f.st!=="dead").length>0'),'Arena respawns');
 assert(run('foes.filter(f=>f.st!=="dead").every(f=>EmberArenaEntry.protected(f)&&(f.x-testRing.x*TS-8)*entry[0]+(f.y-testRing.y*TS-8)*entry[1]>0)'),name+' reverse entry has opposite formation');
 run('foes.forEach(f=>f.st="dead");holy.add(ringKey(testRing));refillRing(testRing)');
 assert(run('foes.every(f=>f.st==="dead")'),'Consecrated arenas do not respawn');
}
// A visible formation walks to the other side; it cannot jump to a new location.
run(`holy.clear();arenaLock=null;arenaT=0;P.x=testRing.x*TS+8;P.y=(testRing.y+9)*TS;cam.x=-1000;cam.y=-1000;
foes=[{kind:'plant1',x:testRing.x*TS,y:testRing.y*TS,hp:8,st:'idle',t:0}];EmberArenaEntry.prepare();
cam.x=foes[0].x-100;cam.y=foes[0].y-100;cam.z=1;VW=600;VH=400;P.y=(testRing.y-9)*TS;
const previous=[foes[0].x,foes[0].y];EmberArenaEntry.prepare();`);
assert(run('foes[0].x===previous[0]&&foes[0].y===previous[1]'),'Visible side changes never teleport');
for(let i=0;i<100;i++)run('EmberArenaEntry.step(.05)');
assert(run('foes[0].y>testRing.y*TS+8&&foes[0].st==="idle"'),'Formation finishes on new opposite side');
console.log('PASS: all four entry directions, protected approach, one-A battle start, visible phone framing, reverse respawns, consecration, and smooth visible restaging.');

// Aurelius catches up during the pause, including a blocked ground route.
for(const [dx,dy]of [[0,1],[0,-1],[-1,0],[1,0]]){
 c.entry=[dx,dy];
 run(`EmberArenaEntry.reset();arenaLock=null;arenaT=0;arenaGoing=false;cooling.clear();holy.clear();
 P.x=testRing.x*TS+8+entry[0]*(testRing.r-2)*TS;P.y=testRing.y*TS+8+entry[1]*(testRing.r-2)*TS;
 dragon.on=true;dragon.hp=20;dragon.down=false;dragon.air=false;dragon.placed=MAPID;
 dragon.x=P.x+entry[0]*300;dragon.y=P.y+entry[1]*300;var fromDragon=[dragon.x,dragon.y];
 foes=[{kind:'plant1',x:testRing.x*TS,y:testRing.y*TS,hp:8,st:'idle',t:0}];
 EmberArenaEntry.prepare();stepArena(.05);`);
 assert(run('dragon.x===fromDragon[0]&&dragon.y===fromDragon[1]'),'Arrival starts without teleporting');
 run('EmberArenaEntry.step(.05);stepDragon(.05)');
 assert(dom.element('arenaReady').hidden,'Prompt waits for the companion');
 assert(run('Math.hypot(dragon.x-fromDragon[0],dragon.y-fromDragon[1])>0'),'Dragon zips in during the pause');
 for(let i=0;i<100&&dom.element('arenaReady').hidden;i++){tick();run('stepDragon(.05)');}
 assert(!dom.element('arenaReady').hidden,'Prompt appears after both are staged');
 assert(run('Math.hypot(dragon.x-P.x,dragon.y-P.y)<=57&&Math.abs(dragon.y-P.y)<=16'),'Companions are side by side at the prompt');
 assert(run('dragonCanStand(dragon.x,dragon.y)&&!dragon.air&&!dragon.moving'),'Dragon lands safely');
 run('EmberArenaEntry.action()');
}
run('dragon.on=false');
console.log('PASS: companion arrival is animated and completed before the prompt from all four entrances.');

// Rectangular temple rooms use the same readiness gate from every doorway.
run("EmberArenaEntry.reset();EmberRiding.skip();MAPID='test-temple';const room=[320,320,640,640];const templeRing={id:'temple-room:0',kind:'arena',templeRoom:room,templeMap:MAPID,x:30,y:30,r:10};MD={templeExpanded:true,templeRoomArenas:[templeRing],foes:[],templePlan:{hazards:[]},templeFloors:[room]};features=[];");
for(const [dx,dy]of [[0,1],[0,-1],[-1,0],[1,0]]){
 c.entry=[dx,dy];
 run(`arenaLock=null;arenaT=0;arenaGoing=false;P.x=480+entry[0]*140;P.y=486+entry[1]*140;
 cam.x=-1000;cam.y=-1000;foes=[{kind:'ghost',x:480,y:480,hp:8,st:'idle',t:0,expandedRoom:room}];
 EmberArenaEntry.prepare();stepArena(.05);`);
 assert.equal(run('arenaLock.id'),'temple-room:0');assert(run('EmberArenaEntry.holding()'));
 for(let i=0;i<12;i++)tick();
 assert.equal(run('arenaT'),1,'Temple walls rise while player movement is held');
 assert(!dom.element('arenaReady').hidden,'Temple readiness prompt appears');
 dom.touch(dom.element('act'));assert(!run('EmberArenaEntry.holding()'));
 run('foes[0].st="dead"');for(let i=0;i<12;i++)tick();
 assert.equal(run('arenaLock'),null,'Cleared temple releases normally');
}
console.log('PASS: rectangular temple rooms pause, seal, confirm and clear from all four entry sides.');
