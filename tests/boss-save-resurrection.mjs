import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const load=()=>loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
const {run,context:c}=await load();
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`mode='play';gameplayStarted=true;quest=Q.DONE;loadMap('house22');[P.x,P.y]=MD.spawn;
window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEquipmentTutorial=undefined;
scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;fadeDir=0;doorMotion=null;bossScene=null;
foesHeld=false;devSafe=false;stones=2;`);
await run('DesertPyramid.prepare()');
await run('SpiderQueenDemo.ensureArt()');
run(`loadMap('pyramid_queen');var queen=foes.find(f=>f.kind==='spiderqueen');
queen.hp=0;queen.st='dead';queen.t=0;markBossGone(queen);arenaLock=null;arenaT=0;
P.x=queen.x;P.y=queen.y+32;P.act=null;pHp=pMax=6;pInv=0;dragonOff=true;saintT=0;`);
assert.equal(run('useStone()'),false,'A boss corpse cannot become a hostile ally');
assert.equal(run('stones'),2,'A rejected resurrection preserves the stone');
run(`for(var i=0;i<200;i++){tAcc+=.05;stepArena(.05);stepCombat(.05);}`);
assert.equal(run('pHp'),6);assert.equal(run('queen.st'),'dead');
assert(run(`MD.roomActors.some(a=>a.bossRewardKind==='spiderqueen')`),'The boss still yields its reward chest');
// A nearer boss must not hide an ordinary corpse that is still within range.
run(`var ordinary={kind:'plant1',x:P.x+50,y:P.y,hp:0,st:'dead',t:0};foes.push(ordinary);`);
assert(run('useStone()'));assert.equal(run('stones'),1);
assert(run(`ordinary.ally===1&&ordinary.raised===1&&ordinary.hp>0&&queen.st==='dead'`));
console.log('PASS: boss resurrection is rejected without consuming the item; ordinary targets and boss rewards still work.');

// Put the authored lava golem in a small non-temple room to exercise the
// complete map/save lifecycle without rebuilding overworld terrain each time.
function bossRoom(r){r(`var lavaSpawn=W.maps.world.foes.find(f=>f.lavaGolem);
W.maps.house22.foes=[{...lavaSpawn,x:8,y:8}];loadMap('house22');[P.x,P.y]=MD.spawn;`);}
bossRoom(run);
assert(run("lavaSpawn.k==='golem3'&&foes.some(f=>f.idx===0)"));
assert(run('saveToSlot(2,true)'));
run('activeSaveSlot=1');
const writes=[],setItem=c.localStorage.setItem;
c.localStorage.setItem=(key,value)=>{if(key===run('saveKey(1)'))writes.push(JSON.parse(value));return setItem(key,value);};
run(`var lava=foes.find(f=>f.idx===0);lava.hp=0;lava.st='dead';markBossGone(lava);`);
c.localStorage.setItem=setItem;
assert(writes.length>0,'Defeat autosaves without a later manual save');
assert(writes.every(s=>s.templeDefeated['house22:0']&&s.crafting.ingredients.mineral===2),'Every reward/defeat autosave includes both the boss flag and its material reward');
const saved=json('readSaveSlot(1)');
assert(saved.templeDefeated['house22:0']);
assert(run('loadGame(2)'));
assert(run('foes.some(f=>f.idx===0)'),'A different slot retains its undefeated boss');
assert(run('loadGame(1)'));
assert(!run('foes.some(f=>f.idx===0)'),'A saved defeat suppresses the authored spawn');
const cold=await load();cold.context.saved=saved;
bossRoom(cold.run);
cold.run(`localStorage.setItem(saveKey(1),JSON.stringify(saved));`);
assert(cold.run('loadGame(1)'));
assert(!cold.run(`foes.some(f=>f.kind==='golem3')`),'Defeat survives a fresh engine');
c.legacy={...saved};delete c.legacy.templeDefeated;
run(`localStorage.setItem(saveKey(3),JSON.stringify(legacy))`);
assert(run('loadGame(3)'));
assert(run('foes.some(f=>f.idx===0)'),'Legacy saves do not inherit in-memory defeats');
console.log('PASS: lava golem defeat survives save/load and a fresh engine, with slot isolation and legacy handling.');
