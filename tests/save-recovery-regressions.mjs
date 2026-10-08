import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';

const load=()=>loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
const {run,context:c}=await load();
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`mode='play';loadMap(W.start);[P.x,P.y]=MD.spawn;
BOOT.pause=async()=>{};EmberPrologue.play=async()=>{};EmberIris.reveal=async()=>{};EmberTitleAudio=undefined;
EmberPlayerIdentity.choose=async()=>({name:'New Rider',hair:'brown',eyes:'green'});`);
function title(){run(`gameplayReady=true;gameplayStarted=false;BOOT.menuOpen=true;BOOT.loading=false;BOOT.transitioning=false;BOOT.creating=false;`);}
const original=json('({...captureSave(),quest:Q.DONE,gold:9876})');
c.original=original;
run('localStorage.setItem(saveKey(1),JSON.stringify(original))');title();
await run('BOOT.close({newGame:true})');
assert.equal(run('activeSaveSlot'),2);
assert.equal(run('readSaveSlot(2).playerIdentity.name'),'New Rider','New Game reserves its own slot before the first story autosave');
run('takeMorningSupply({deskPickup:true})');
assert.deepEqual(json('readSaveSlot(1)'),original,'Starting gear cannot overwrite the previous adventure');
assert(run('readSaveSlot(2).bagOwned'));

run('localStorage.setItem(saveKey(3),JSON.stringify(original))');
const full=json('[1,2,3].map(readSaveSlot)');title();
await run('BOOT.close({newGame:true})');
assert(!run('gameplayStarted||BOOT.transitioning'));
assert.match(run("document.getElementById('bootHint').textContent"),/All save slots are full/);
assert.deepEqual(json('[1,2,3].map(readSaveSlot)'),full,'Full slots block creation without overwriting');
run(`localStorage.removeItem(saveKey(2));localStorage.removeItem(saveKey(3));EmberPlayerIdentity.choose=async()=>null;`);title();
await run('BOOT.close({newGame:true})');
assert.equal(run('readSaveSlot(2)'),null,'Cancelling character creation does not reserve a slot');
// An account download can arrive while the asynchronous creator is open.
run(`EmberPlayerIdentity.choose=async()=>{localStorage.setItem(saveKey(2),JSON.stringify(original));return {name:'Cloud Race'};};`);title();
await run('BOOT.close({newGame:true})');
assert.equal(run('activeSaveSlot'),3);assert.deepEqual(json('readSaveSlot(2)'),original);
run(`localStorage.removeItem(saveKey(3));EmberCloudState.conflicts.set(3,{revision:'cloud'});`);
assert.equal(run('firstEmptySaveSlot()'),0,'Unresolved cloud versions are not empty new-game slots');
run('EmberCloudState.conflicts.clear()');
console.log('PASS: new-game slot reservation, starter autosave, full slots, cancellation, and cloud arrival/conflict protection.');

run(`scene=null;sayNpc=null;revealing=null;quest=Q.DONE;gameplayStarted=true;
loadMap('house22');[P.x,P.y]=MD.spawn;pHp=2;saveToSlot(1,true);
pHp=5;saveToSlot(2,true);pHp=0;pInv=99;P.act={kind:'die',t:0};deadShown=true;standing=true;
safeSpot={map:'world',x:777,y:888};`);
assert(run('loadGame(1)'));assert.equal(run('pHp'),2);
assert(!run('P.act||P.moving||deadShown||standing||pInv'));
assert.deepEqual(json('safeSpot'),json('({map:MAPID,x:P.x,y:P.y})'));
run('stepAct(1)');assert(!run('deadShown'),'Loading clears the old death animation');
assert(run('loadGame(2)'));assert.equal(run('pHp'),5);
const healthSave=json('readSaveSlot(1)');
for(const hp of [undefined,0,-1,null]){
 c.legacy={...healthSave,playerHp:hp};run('localStorage.setItem(saveKey(3),JSON.stringify(legacy));pHp=0;');
 assert(run('loadGame(3)'));assert.equal(run('pHp'),6,'Legacy and defeated checkpoints resume alive');
}
const fresh=await load();fresh.context.saved=healthSave;
fresh.run('localStorage.setItem(saveKey(1),JSON.stringify(saved))');
assert(fresh.run('loadGame(1)'));assert.equal(fresh.run('pHp'),2,'Health survives a new engine instance');
console.log('PASS: health round-trip, clean death state, per-slot checkpoints, cold load and legacy migration.');

function arenaFixture(run){run(`
var testMap=W.maps.house22;
testMap.features=[{kind:'arena',id:987,x:8,y:8,r:3}];
testMap.foes=[{k:'plant1',x:8,y:8},{k:'plant1',x:18,y:18}];
quest=Q.DONE;mode='play';gameplayStarted=true;loadMap('house22');P.x=128;P.y=128;
scene=null;sayNpc=null;revealing=null;arenaLock=null;arenaT=0;foes=[];devSafe=false;
`);}
arenaFixture(run);
run('salts=2;holy.clear();saveToSlot(2,true)');
assert(run('useSalt()'));assert.equal(run('salts'),1);
assert.equal(run('useSalt()'),false);assert.equal(run('salts'),1,'Already protected ground does not consume another item');
assert.deepEqual(json('readSaveSlot(2).consecratedArenas'),['house22:987'],'The item use itself saves the effect');
assert(run('saveToSlot(1,true)'));
const consecrated=json('readSaveSlot(1)');
// Give slot 2 a separate unprotected adventure.
run('holy.clear();salts=2;saveToSlot(2,true);cooling.set("house22:987",300)');
assert(run('loadGame(1)'));assert.equal(run('salts'),1);
assert.equal(run('foes.length'),1,'Map reconstruction does not respawn consecrated foes');
run('refillRing(features.find(a=>a.id===987))');assert.equal(run('foes.length'),1);
assert(run('loadGame(2)'));assert.equal(run('holy.size'),0);assert.equal(run('cooling.size'),0);
assert.equal(run('foes.length'),2,'Another slot keeps its own encounters');
arenaFixture(fresh.run);fresh.context.saved=consecrated;
fresh.run('localStorage.setItem(saveKey(1),JSON.stringify(saved))');assert(fresh.run('loadGame(1)'));
assert.equal(fresh.run('foes.length'),1,'Consecration survives a cold load');
console.log('PASS: Consecration autosave, reload/return spawning, refill protection, no duplicate consumption and slot isolation.');

run(`holy.clear();arenaLock=null;foes=[];P.x=128;P.y=128;gold=1000;pHp=0;standing=false;
safeSpot={map:MAPID,x:P.x,y:P.y};standUp();marks=2;saveGame();`);
assert.equal(run('gold'),700);assert.equal(run('readSaveSlot(activeSaveSlot).droppedGold'),300);
const lost=json('readSaveSlot(activeSaveSlot)');
fresh.context.saved=lost;fresh.run('localStorage.setItem(saveKey(1),JSON.stringify(saved))');assert(fresh.run('loadGame(1)'));
assert(fresh.run('useMark()'),'Recoverable gold works after a restart, outside a battle');
assert.equal(fresh.run('gold'),1000);assert.equal(fresh.run('marks'),1);assert.equal(fresh.run('dropped'),null);
assert(fresh.run('loadGame(1)'));assert.equal(fresh.run('gold'),1000);assert.equal(fresh.run('dropped'),null);
assert.equal(fresh.run('useMark()'),false);assert.equal(fresh.run('marks'),1,'Repeated use cannot duplicate recovered gold or waste a marker');
fresh.context.other={...lost,droppedGold:undefined};fresh.run('localStorage.setItem(saveKey(2),JSON.stringify(other))');assert(fresh.run('loadGame(2)'));
assert.equal(fresh.run('dropped'),null,'Legacy and unrelated slots cannot inherit recoverable gold');
fresh.run(`arenaLock={id:987,x:8,y:8,r:3};marks=1;foes=[];var beforeGold=gold;useMark();var earned=dropGold(P.x,P.y,'plant1');settleGraves();settleGraves();`);
assert.equal(fresh.run('gold-beforeGold'),fresh.run('earned'),'The existing battle bonus still pays once when there is no lost gold');
console.log('PASS: death penalty persistence, one-time Grave Marker recovery after restart, slot isolation and retained battle bonus.');
