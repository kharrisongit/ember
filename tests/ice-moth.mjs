import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
await run('IceMoth.prepare()');await run('loadPublishedEditorLayouts()');
console.log('Artwork prepared. Building the published overworld.');
run(`mode='play';gameplayStarted=true;quest=Q.DONE;wonAll=1;foesHeld=false;dragonOff=true;devSafe=false;
window.EmberArenaEntry=undefined;window.EmberEncounterCard=undefined;window.EmberRiding=undefined;
loadMap('world');scene=null;bossScene=null;ovl=null;ask=null;fadeDir=0;doorMotion=null;`);
console.log('World generated. Checking the full trail and both arenas.');
const report=JSON.parse(run(`JSON.stringify((()=>{
 const bad=[];let samples=0;
 for(const route of IceMoth.routes){
  const actual=features.find(f=>f.id===route.id);
  if(JSON.stringify(actual.pts)!==JSON.stringify(route.pts))throw Error('Route changed');
  for(let i=1;i<route.pts.length;i++){
   const a=route.pts[i-1],b=route.pts[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4);
   for(let j=0;j<=n;j++){const x=(a[0]+(b[0]-a[0])*j/n)*16+8,y=(a[1]+(b[1]-a[1])*j/n)*16+16;
    samples++;if(!canStand(x,y))bad.push({route:route.id,x,y,why:whyBlocked(x,y-4)});}
  }
 }
 const floor=[],snow=[];
 for(const arena of [IceMoth.arena,IceMoth.endpoint])for(let dy=-Math.ceil(arena.r);dy<=Math.ceil(arena.r);dy++)for(let dx=-Math.ceil(arena.r);dx<=Math.ceil(arena.r);dx++){
  if(Math.hypot(dx,dy)>=arena.r-1)continue;
  if(!canStand((arena.x+dx)*16+8,(arena.y+dy)*16+16))floor.push([arena.id,dx,dy]);
  if(!inWinter(arena.x+dx,arena.y+dy))snow.push([arena.id,dx,dy]);
 }
 const gate=[];for(let y=134;y<=202;y+=.25)if(!canStand(2346*16+8,y*16+16))gate.push(y);
 const empty=foes.filter(f=>Math.hypot(f.x/16-IceMoth.endpoint.x,f.y/16-IceMoth.endpoint.y)<=IceMoth.endpoint.r+5).map(f=>f.kind);
 return {samples,bad:bad.slice(0,10),badCount:bad.length,floor,snow,gate,empty,bosses:foes.filter(f=>f.kind==='icemoth').length};
})())`));
console.log(JSON.stringify(report));
assert.equal(report.badCount,0);assert.deepEqual(report.floor,[]);assert.deepEqual(report.snow,[]);assert.deepEqual(report.gate,[]);assert.deepEqual(report.empty,[]);assert.equal(report.bosses,1);
assert.equal(run('features.find(f=>f.id===9367).r'),6.8);assert.equal(run('features.find(f=>f.id===9368).r'),6.3);
assert(run('isSolid(2346*16+8,126*16+8)'),'The far end closes into a tree wall');
run(`const mothTest=foes.find(f=>f.kind==='icemoth');
P.x=2346*16+8;P.y=134*16+16;arenaLock=null;arenaT=0;refillRing(IceMoth.endpoint);stepArena(.05);`);
assert.equal(run('arenaLock'),null,'The reserved endpoint stays peaceful and does not refill');
run('P.y=171*16+16;stepArena(.05);');assert.equal(run('arenaLock?.id'),9367,'The midpoint arena starts the moth encounter');
run(`P.x=0;P.y=0;arenaLock=null;const mothHome=[mothTest.x,mothTest.y];stepCombat(.1);`);
assert.equal(run('JSON.stringify([mothTest.x,mothTest.y])'),run('JSON.stringify(mothHome)'),'The boss waits in its own arena');
function setup(x=0,y=88,sequence=0){
 run(`IceMoth.reset();scene=null;bossScene=null;ovl=null;ask=null;fadeDir=0;foesHeld=false;devSafe=false;glassShield=false;mounted=false;
 dragonOff=true;P.act=null;pHp=20;pMax=20;pInv=0;saintT=0;smithUpgrade=false;worn.ward=false;worn.twin=false;
 arenaLock=features.find(f=>f.id===9367);arenaT=1;
 Object.assign(mothTest,{x:2346*16+8,y:168*16+8,hp:140,st:'idle',t:0,hold:0,hurt:0,mothCool:0,mothSequence:${sequence},mothAttack:null,mothAim:null,glassBlockHold:0});
 P.x=mothTest.x+${x};P.y=mothTest.y+${y};`);
}
const step=n=>{for(let i=0;i<n;i++)run('tAcc+=.05;stepCombat(.05)');};
setup();step(1);assert.equal(run('mothTest.mothAttack'),'gust');assert.equal(run('IceMoth.inspect().shots.length'),0,'Windup has no projectile');
const aim=run('JSON.stringify(mothTest.mothAim)');run('P.x+=30');step(24);
assert.equal(run('JSON.stringify(mothTest.mothAim)'),aim,'Aim locks during the tell');
assert.equal(run('IceMoth.inspect().shots.length'),1,'The frost gust launches');step(32);assert.equal(run('pHp'),20,'A sideways dodge avoids the gust');
setup();step(56);assert.equal(run('pHp'),18,'The gust deals one hit');
setup(0,88,1);step(28);assert.equal(run('mothTest.mothAttack'),'shards');assert.equal(run('IceMoth.inspect().shots.length'),3,'A volley has three separate crystals');step(26);assert.equal(run('pHp'),18,'A volley does not drain multiple hearts');
for(const [x,y]of [[88,0],[-88,0],[0,-88],[0,88]]){
 setup(x,y,1);step(28);
 assert.equal(run('IceMoth.inspect().shots.length'),3,'Projectiles survive launch in every direction');
 const s=JSON.parse(run('JSON.stringify(IceMoth.inspect().shots[1])'));
 assert(s.vx*x+s.vy*y>0,'The central shard travels toward the locked target');
}
setup();step(26);const moving=run('JSON.stringify(IceMoth.inspect().shots)');
run('scene={lines:[],i:0};IceMoth.effects(.5);');assert.equal(run('JSON.stringify(IceMoth.inspect().shots)'),moving,'Cutscenes pause projectiles');
run('scene=null;foesHeld=true;stepCombat(.1);');assert.equal(run('IceMoth.inspect().shots.length'),0,'Foes toggle clears spells');
setup(0,-1000);run('mothTest.mothCool=99;');step(150);
assert(run('Math.hypot(mothTest.x-(2346*16+8),mothTest.y-(168*16+8))<=6.8*16-38*.85+.1'),'Flight cannot leave the arena');
setup();step(26);run(`mothTest.hp=0;mothTest.st='dead';mothTest.t=0;markBossGone(mothTest);`);
assert(run('IceMoth.defeatedAlready()'));assert.equal(run('IceMoth.inspect().shots.length'),0);
assert(run('saveToSlot(1,true)'));assert(run('readSaveSlot(1).houseLootTaken.includes("world:ice-moth:defeated")'));
run('spawnFoes();refillRing(IceMoth.arena);');assert(!run('foes.some(f=>f.kind==="icemoth")'),'The defeated boss does not refill');
run(`const mothSaved=readSaveSlot(1);localStorage.setItem(saveKey(1),JSON.stringify({...mothSaved,map:'house1',x:128,y:160}));
localStorage.setItem(saveKey(2),JSON.stringify({...captureSave(),houseLootTaken:[],map:'house1',x:128,y:160}));`);
assert(run('loadGame(2)'));assert(!run('IceMoth.defeatedAlready()'));
run(`MAPID='world';MD=W.maps.world;spawnFoes();`);assert(run('foes.some(f=>f.kind==="icemoth")'),'A fresh save restores the boss');
assert(run('loadGame(1)'));assert(run('IceMoth.defeatedAlready()'));
run(`MAPID='world';MD=W.maps.world;spawnFoes();`);assert(!run('foes.some(f=>f.kind==="icemoth")'),'Save reload preserves victory');
console.log('PASS: exact trail, both arena floors, peaceful endpoint, cap, both attacks, dodging, all four firing directions, pause/cleanup, flight bounds and save-slot persistence.');
