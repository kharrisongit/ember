import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false,document:dom.document});
run(`MAPID='world';MD=W.maps.world;features=MD.features;quest=Q.DONE;mode='play';gameplayStarted=true;
EmberRiding.skip();scene=null;revealing=false;fadeDir=0;fade=0;dragon.on=false;deadShown=false;devSafe=true;
canStand=()=>true;dragonCanStand=()=>true;rebuildSolid=()=>{};rebuildBuckets=()=>{};clampCam=()=>{};
MW=4000;MH=600;solid=new Uint8Array(MW*MH);terr=new Uint8Array(MW*MH);blockedByNpcBody=()=>false;blockedByNpcBuffer=()=>false;
stepChest=()=>{};saveGame=()=>{};recoverStrandedDragon=()=>{};
const readyRing=features.find(a=>a.id===209);features=[readyRing];
P.x=readyRing.x*TS;P.y=(readyRing.y+readyRing.r-1.2)*TS;P.act=null;cam.x=-1000;cam.y=-1000;cam.z=3;
foes=[{kind:'plant1',x:readyRing.x*TS,y:readyRing.y*TS,hp:8,st:'idle',t:0}];
let musicStarts=0,musicStops=0;EmberBattleMusic={start(){musicStarts++;},stop(){musicStops++;}};
EmberArenaEntry.prepare();stepArena(.05);`);
const tick=()=>run('tAcc+=.05;EmberArenaEntry.step(.05);stepArena(.05);stepCombat(.05);EmberArenaEntry.frameCamera()');
for(let i=0;i<12;i++)tick();
assert(!dom.element('arenaReady').hidden,'Initial readiness prompt appears');
const starts=run('musicStarts'),stops=run('musicStops'),zoom=run('cam.z');
for(let i=0;i<80;i++)tick();
assert.equal(run('musicStarts'),starts,'Wildlife maintenance must not replay the readiness cue');
assert.equal(run('musicStops'),stops,'Wildlife maintenance must not stop the cue');
assert.equal(run('cam.z'),zoom,'Waiting camera stays stable across wildlife refreshes');
dom.touch(dom.element('act'));
assert(!run('EmberArenaEntry.holding()'),'One A starts combat');
for(let i=0;i<400;i++){
 tick();
 assert(!run('EmberArenaEntry.holding()'),'A confirmed battle stays active after wildlife maintenance');
 assert(dom.element('arenaReady').hidden,'The prompt cannot reopen during combat');
}
assert.equal(run('musicStarts'),starts,'The battle song starts once per encounter');
// A harmless array rebuild, including removal of wildlife, is not a new encounter.
run('foes=foes.filter(f=>!f.huntingArena);EmberArenaEntry.step(.05)');
assert(!run('EmberArenaEntry.holding()'),'Retaining combatants in a new array preserves the battle');
assert(run('foes.every(f=>!EmberArenaEntry.protected(f))'),'Existing combatants remain active');
// A real map population rebuild intentionally restarts the encounter.
run('spawnFoes();arenaLock=null;arenaT=0;EmberArenaEntry.prepare();stepArena(.05)');
assert(run('EmberArenaEntry.holding()'),'A new spawned encounter still requires confirmation');
console.log('PASS: real wildlife refreshes cannot replay readiness, restart music, move the camera, or relock a confirmed battle; true respawns still reset.');
// A running frame does no collision or path work for distant formations.
run(`arenaLock=null;arenaT=0;EmberArenaEntry.reset();P.x=0;P.y=0;cam.x=-1000;cam.y=-1000;cam.z=3;
features=Array.from({length:60},(_,i)=>({id:30000+i,kind:'arena',x:1000+i*40,y:1000+i*30,r:6.3}));
foes=features.map(a=>({kind:'plant1',x:a.x*TS,y:a.y*TS,hp:8,st:'idle',t:0}));
let collisionReads=0;canStand=()=>{collisionReads++;return true;};
EmberArenaEntry.prepare();const stablePopulation=foes;`);
assert.equal(run('collisionReads'),0,'Door loading cannot arrange distant arenas');
assert(run('foes.every(f=>EmberArenaEntry.protected(f))'),'Deferred formations still protect waiting enemies');
for(let i=0;i<240;i++)run('P.x+=4;P.y+=1;tAcc+=.05;stepHuntingGrounds(.05);EmberArenaEntry.step(.05)');
assert.equal(run('collisionReads'),0,'Running cannot restage distant arenas or launch global collision searches');
assert(run('foes===stablePopulation'),'Periodic wildlife upkeep does not rebuild the enemy array');
console.log('PASS: running past 60 distant arenas performs zero formation collision searches and keeps the population stable across 12 wildlife refreshes.');
run(`P.x=features[0].x*TS+8;P.y=(features[0].y+8)*TS+8;EmberArenaEntry.step(.05);`);
assert(run('collisionReads>0'),'Approaching a deferred arena prepares its formation');
assert(run('foes[0].y<features[0].y*TS+8'),'Deferred enemies wait across from the approaching player');
