import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const load=async()=>{
 const game=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
 // A small mine fixture lets the real dragon attacks run without an overworld build.
 game.run('W.maps.mine99={...W.maps.house22,npcs:[],doors:[],roomBlocks:[],roomActors:[]};');
 return game;
};
const {run,context:c}=await load();
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`mode='play';quest=Q.DONE;gameplayStarted=true;loadMap('mine99');[P.x,P.y]=MD.spawn;
window.EmberArenaEntry=undefined;window.EmberRiding=undefined;
scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;arenaLock=null;fadeDir=0;doorMotion=null;bossScene=null;foesHeld=false;
var enemy={kind:'plant1',x:P.x,y:P.y+16,hp:20,st:'idle',t:0};foes=[enemy];
P.act={kind:'swing',t:4,dir:'d',dir8:'s'};swingHits();saveToSlot(1,true);`);
assert.equal(run('enemy.hp'),19);
assert.deepEqual(json('readSaveSlot(1).bestiary'),['plant1']);
run('saveToSlot(2,true)');
// Exercise the real projectile collision and damage, with no sword discovery.
for(const el of ['fire','bolt','ice','shadow']){
 run(`for(const kind of Object.keys(seenFoe))delete seenFoe[kind];seenCount=0;
 P.act=null;enemy={kind:'gnoll1',x:128,y:208,hp:1,st:'idle',t:0};foes=[enemy];
 breath={dir:'s',el:'${el}',x:128,y:170,vx:0,vy:1,speed:200,t:.2,distance:0,hit:0,impactT:0};hunt=null;stepBreath(.05);`);
 assert.equal(run('enemy.st'),'dead',el+' hits and defeats the enemy');
 assert.equal(run('seenFoe.gnoll1'),1,el+' discovers its target');
}
run(`enemy={kind:'plant2',x:128,y:208,hp:2,st:'idle',t:0};foes=[enemy];breath=null;
dragon.on=true;dragon.down=false;dragon.hp=20;dragon.knockdown=0;dragon.x=128;dragon.y=192;dragon.placed=MAPID;
dragonOff=false;devDragonPassive=false;P.x=128;P.y=192;P.dir='d';mounted=false;clawNow();clawNow();`);
assert.equal(run('enemy.hp'),1);
assert.equal(run('seenFoe.plant2'),2,'Repeated claw hits discover only once');
// Autonomous companion attacks register the same way as manual claws.
run(`enemy={kind:'plant3',x:128,y:208,hp:2,st:'idle',t:0};foes=[enemy];
dragon.x=128;dragon.y=192;dragon.air=false;dragon.tr=null;dragonCombatPause=0;clawT=0;hunt=null;stepDragon(.05);`);
assert.equal(run('enemy.hp'),1.5);
assert.equal(run('seenFoe.plant3'),3);
assert(run('saveToSlot(2,true)'));
const saved=json('readSaveSlot(2)');
assert.deepEqual(saved.bestiary,['gnoll1','plant2','plant3']);
assert(run('loadGame(1)'));
assert.deepEqual(json('Object.keys(seenFoe)'),['plant1'],'Another slot cannot inherit discoveries');
assert.equal(run('seenCount'),1);
const fresh=await load();fresh.context.saved=saved;
fresh.run('localStorage.setItem(saveKey(1),JSON.stringify(saved))');
assert(fresh.run('loadGame(1)'));
assert.deepEqual(JSON.parse(fresh.run('JSON.stringify(bookOrder().filter(e=>seenFoe[e.k]).map(e=>e.k))')),saved.bestiary,'A cold load preserves discoveries and encounter order');
c.legacy={...saved};delete c.legacy.bestiary;
run('localStorage.setItem(saveKey(3),JSON.stringify(legacy))');assert(run('loadGame(3)'));
assert.equal(run('seenCount'),0,'Legacy saves load without stale discoveries');
c.invalid={...saved,bestiary:['plant1','plant1','unknown','__proto__',null,17,'icemoth']};
run('localStorage.setItem(saveKey(3),JSON.stringify(invalid))');assert(run('loadGame(3)'));
assert.deepEqual(json('Object.keys(seenFoe)'),['plant1','icemoth']);assert.equal(run('seenCount'),2);
console.log('PASS: sword, all dragon breaths, manual/automatic claws, encounter order, cold-load persistence, slot isolation, legacy saves and invalid-entry filtering.');
