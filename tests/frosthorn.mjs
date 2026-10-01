import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
console.log('Core loaded. Preparing Frosthorn.');
await run('Frosthorn.prepare()');
console.log('Artwork prepared. Loading published map.');
await run('loadPublishedEditorLayouts()');
console.log('Building overworld.');
run(`mode='play';gameplayStarted=true;quest=Q.DONE;wonAll=1;foesHeld=false;dragonOff=true;devSafe=false;
window.EmberArenaEntry=undefined;window.EmberEncounterCard=undefined;window.EmberRiding=undefined;
loadMap('world');scene=null;bossScene=null;ovl=null;ask=null;fadeDir=0;doorMotion=null;`);
console.log('World generated. Checking Frosthorn route and arena.');
const report=JSON.parse(run(`JSON.stringify((()=>{
 const bad=[];let samples=0;
 for(const route of Frosthorn.routes){
  const actual=features.find(f=>f.id===route.id);
  if(JSON.stringify(actual.pts)!==JSON.stringify(route.pts))throw Error('Route changed');
  for(let i=1;i<route.pts.length;i++){
   const a=route.pts[i-1],b=route.pts[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4);
   for(let j=0;j<=n;j++){const x=(a[0]+(b[0]-a[0])*j/n)*16+8,y=(a[1]+(b[1]-a[1])*j/n)*16+16;
    samples++;if(!canStand(x,y))bad.push({route:route.id,x,y,why:whyBlocked(x,y-4)});}
  }
 }
 const floor=[];for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++)if(Math.hypot(dx,dy)<5.3){
  const x=(2545+dx)*16+8,y=(25+dy)*16+16;if(!canStand(x,y))floor.push([dx,dy]);}
 const gate=[];for(let y=24;y<=40;y+=.25)if(!canStand(2545*16+8,y*16+16))gate.push(y);
 return {samples,bad:bad.slice(0,12),badCount:bad.length,floor,gate,bosses:foes.filter(f=>f.kind==='frosthorn').length};
})())`));
console.log(JSON.stringify(report));
assert.equal(report.badCount,0,'Exact route centerlines stay walkable');
assert.equal(report.floor.length,0,'Normal-sized arena floor is clear');
assert.equal(report.gate.length,0,'Route opens into arena');assert.equal(report.bosses,1);
assert.equal(run('features.find(f=>f.id===9361).r'),6.3);
run(`P.x=2545*16+8;P.y=28*16+16;arenaLock=null;arenaT=0;stepArena(.05);`);
assert.equal(run('arenaLock?.id'),9361,'Existing arena system starts this battle');
run(`const frostTest=foes.find(f=>f.kind==='frosthorn');
P.x=0;P.y=0;arenaLock=null;const frostHome=[frostTest.x,frostTest.y];stepCombat(.1);`);
assert.equal(run('JSON.stringify([frostTest.x,frostTest.y])'),run('JSON.stringify(frostHome)'),'Boss waits in his arena');
function setup(x=0,y=65){
 run(`Frosthorn.reset();scene=null;bossScene=null;ovl=null;ask=null;fadeDir=0;foesHeld=false;devSafe=false;glassShield=false;mounted=false;
 P.act=null;pHp=20;pMax=20;pInv=0;saintT=0;smithUpgrade=false;worn.ward=false;worn.twin=false;
 arenaLock=features.find(f=>f.id===9361);arenaT=1;
 Object.assign(frostTest,{x:2545*16+8,y:25*16+8,hp:130,st:'idle',t:0,hold:0,hurt:0,frostCool:0,frostStompCool:0,frostAttack:null,glassBlockHold:0});
 P.x=frostTest.x+${x};P.y=frostTest.y+${y};`);
}
const step=n=>{for(let i=0;i<n;i++)run('tAcc+=.05;stepCombat(.05)');};
setup();step(1);assert.equal(run('frostTest.frostAttack'),'stomp');
assert(run('Frosthorn.inspect().waves[0].points.length>=2'),'Ice chain fits the smaller arena');
assert.equal(run('pHp'),20,'Windup has no damage');
const aim=run('JSON.stringify(Frosthorn.inspect().waves[0].points)');
run('P.x+=55');step(10);
assert.equal(run('JSON.stringify(Frosthorn.inspect().waves[0].points)'),aim,'Ice line does not home after tell');
step(35);assert.equal(run('pHp'),20,'Sideways dodge avoids the full line');
setup();step(46);assert.equal(run('pHp'),18,'Standing in ice takes one hit per wave');
setup(0,50);run('frostTest.frostStompCool=99;frostTest.frostMelee=0;');step(1);
assert.equal(run('frostTest.frostAttack'),'swipe');step(17);assert(run('pHp<20'),'Arm swipe deals damage');
setup(0,76);run('frostTest.frostStompCool=99;');step(1);
assert.equal(run('frostTest.frostAttack'),'headbutt');step(21);assert(run('pHp<20'),'Horn headbutt closes and hits');
setup();step(1);run('scene={lines:[],i:0};');
const paused=run('JSON.stringify(Frosthorn.inspect().waves)');run('Frosthorn.effects(.5)');assert.equal(run('JSON.stringify(Frosthorn.inspect().waves)'),paused);
run('scene=null;foesHeld=true;stepCombat(.1)');assert.equal(run('Frosthorn.inspect().waves.length'),0,'Foes toggle clears ice');
setup();step(1);
run(`frostTest.hp=0;frostTest.st='dead';frostTest.t=0;markBossGone(frostTest);`);
assert(run('Frosthorn.owned()'));assert.equal(run('Frosthorn.power("ice",8)'),10);assert.equal(run('Frosthorn.power("fire",8)'),8);
assert.equal(run('Frosthorn.inspect().waves.length'),0,'Death clears attack');
assert(run('BAG.find(i=>i.key==="frostheart").has()'),'Reward appears in inventory');
run('markBossGone(frostTest);');assert.equal(run('houseLootTaken.size'),new Set(JSON.parse(run('JSON.stringify([...houseLootTaken])'))).size);
assert(run('saveToSlot(1,true)'));assert(run('readSaveSlot(1).houseLootTaken.includes("world:frosthorn:frostheart")'));
run('spawnFoes();refillRing(features.find(f=>f.id===9361));');assert(!run('foes.some(f=>f.kind==="frosthorn")'),'Defeated boss stays gone');
run(`const frostSaved=readSaveSlot(1);localStorage.setItem(saveKey(1),JSON.stringify({...frostSaved,map:'house1',x:128,y:160}));
localStorage.setItem(saveKey(2),JSON.stringify({...captureSave(),houseLootTaken:[],map:'house1',x:128,y:160}));`);
assert(run('loadGame(2)'));assert(!run('Frosthorn.owned()'),'Different slot does not inherit relic');
run(`MAPID='world';MD=W.maps.world;spawnFoes();`);assert(run('foes.some(f=>f.kind==="frosthorn")'),'Fresh save restores boss despite old numeric bossGone entry');
assert(run('loadGame(1)'));assert(run('Frosthorn.owned()'));run("MAPID='world';MD=W.maps.world;spawnFoes();");assert(!run('foes.some(f=>f.kind==="frosthorn")'),'Save reload preserves relic and defeated boss');
console.log('PASS: exact route, normal arena, entry, all three attacks, growing ice warning/dodge/single-hit, pause/cleanup, relic and save-slot persistence.');
