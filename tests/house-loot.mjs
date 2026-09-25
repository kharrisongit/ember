import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const placements=JSON.parse(read('assets/interiors/house-loot.json'));
const W=JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const W_GZ = "([^"]+)/)[1],'base64')));
const counts={};for(const c of placements){counts[c.map.split('_')[0]]=(counts[c.map.split('_')[0]]||0)+1;assert(c.gold>=5&&c.gold<=15);}
assert.equal(Object.keys(counts).length,53);assert(Object.values(counts).every(n=>n>=1&&n<=3));
assert.equal(new Set(placements.map(c=>c.id)).size,79);
assert.equal(Object.values(counts).filter(n=>n===3).length,3);
assert.equal(placements.filter(c=>c.map.includes('_bedroom')).length,62);
let clock=0,saved=null,saves=0,notices=[];
const ctx=vm.createContext({W,fetch:async()=>({ok:true,json:async()=>placements}),performance:{now:()=>clock},
 gold:50,potions:0,elixirs:0,bombs:0,dust:0,bells:0,marks:0,breaths:0,stones:0,salts:0,boarMeat:0,dragonFish:0,P:{},toast:s=>notices.push(s),flyGold(){},showReveal(){assert.fail("Ordinary loot must not open a full-screen reveal");},saveGame(){saves++;},
 quest:0,smithUpgrade:false,glassShield:false,wonAll:0,cinderSeal:false,trialSealPlaced:false,trialWins:0,thornwellMet:false,brambleQuest:0,knightEncounterDone:false,royalDefeated:{},bossGone:{},chestOpen:{},CHESTS:[],treasuryTaken:new Set(),hareMeat:0,deerMeat:0,foxMeat:0,birdMeat:0,charm:{lamp:true,ward:true,twin:false},worn:{lamp:false,ward:true,twin:false},breathHas:{},dragon:{hp:5,maxHp:5},fishingPole:false,trial:null,MAPID:'house00',activeSaveSlot:1,
 migrateLegacySave(){},readSaveSlot:()=>saved,syncDragonVitality(){},hasSword:()=>true,loadMap(id){ctx.MAPID=id;ctx.MD=W.maps[id];},recoverTempleArrival(){},cam:{},clampCam(){},chunks:{clear(){}}});
vm.runInContext(read('js/house-loot.js'),ctx);
await vm.runInContext('prepareHouseLoot()',ctx);
await vm.runInContext('prepareHouseLoot()',ctx);
for(const c of placements){assert.equal(W.maps[c.map].roomActors.filter(o=>o.houseLoot).length,1);}
const game=read('js/generated/game-part-3.js');
vm.runInContext(game.slice(game.indexOf('function captureSave()'),game.indexOf('function saveToSlot(')),ctx);
vm.runInContext(game.slice(game.indexOf('function loadGame('),game.indexOf('let mounted =')),ctx);
const fields={potion:'potions',elixir:'elixirs',boarMeat:'boarMeat',dragonFish:'dragonFish',bomb:'bombs',dust:'dust',bell:'bells',mark:'marks',saint:'breaths',stone:'stones',salt:'salts'};
const expected=Object.fromEntries(Object.values(fields).map(k=>[k,0])),lateItems=new Set();
let total=50;
for(const c of placements){
 ctx.MD=W.maps[c.map];ctx.MAPID=c.map;ctx.actor=ctx.MD.roomActors.find(o=>o.houseLoot);ctx.P={x:c.x,y:c.y+20};
 const item=vm.runInContext('chestConsumable(actor.houseLoot)',ctx);
 assert.equal(vm.runInContext('chestConsumable(actor.houseLoot)',ctx),item,'Unopened rewards stay stable');
 if(/Millwood|Thornwell/.test(W.maps[c.map.split('_')[0]].title))assert.equal(item,c.item,'Early rewards preserved');
 else if(/Forgewick|Sandspire|Coralmere|Hollybeck/.test(W.maps[c.map.split('_')[0]].title))lateItems.add(item);
 if(item)expected[fields[item]]++;
 assert.equal(vm.runInContext('houseLootFrame(actor)',ctx),0);
 const before=notices.length;assert.equal(vm.runInContext('tryHouseLootChest()',ctx),true);total+=c.gold;
 assert.equal(notices.length,before,'Notice waits for opening animation');
 for(let i=0;i<6;i++){assert.equal(vm.runInContext('houseLootFrame(actor)',ctx),i);clock+=120;}
 clock+=60;vm.runInContext('stepLootChestOpening()',ctx);assert.equal(notices.length,before+1);
 assert(notices.at(-1).includes('+'+c.gold+' gold'));if(item)assert(notices.at(-1).includes('+1 '));
 assert.equal(vm.runInContext('tryHouseLootChest()',ctx),true);assert.equal(ctx.gold,total);
}
assert.deepEqual([...lateItems].sort(),Object.keys(fields).sort(),'Every consumable appears in later household chests');
assert.equal(saves,79);assert.equal(ctx.actor.spr,'temple71_chest');
for(const [key,count] of Object.entries(expected))assert.equal(ctx[key],count,key+' rewards');
saved=JSON.parse(JSON.stringify(vm.runInContext('captureSave()',ctx)));
assert.equal(saved.houseLootTaken.length,79);
ctx.gold=0;for(const key of Object.keys(expected))ctx[key]=0;
ctx.charm.lamp=false;ctx.charm.ward=false;ctx.worn.ward=false;
assert.equal(vm.runInContext('loadGame(1)',ctx),true);assert.equal(ctx.gold,total);
for(const [key,count] of Object.entries(expected))assert.equal(ctx[key],count,key+' saved and restored');
assert.equal(vm.runInContext('houseLootTaken.size',ctx),79);
assert.deepEqual(ctx.charm,{lamp:true,ward:true,twin:false},'Collected rewards survive reload');
assert.deepEqual(ctx.worn,{lamp:false,ward:true,twin:false},'Equipped charms survive reload');
// A different/legacy slot must not inherit another slot's inventory or claimed chests.
saved={map:'house00',x:120,y:192,gold:50,quest:0};
assert.equal(vm.runInContext('loadGame(2)',ctx),true);
assert.equal(vm.runInContext('houseLootTaken.size',ctx),0);
assert(Object.values(ctx.charm).every(v=>v===false),'Legacy/other slot does not inherit rewards');
assert(Object.values(ctx.worn).every(v=>v===false),'Legacy/other slot does not inherit equipped charms');
for(const key of Object.keys(expected))assert.equal(ctx[key],0,key+' legacy/other slot isolation');
// Moving a chest keeps its interaction attached to its actor, not its original position.
ctx.actor=W.maps.house00.roomActors.find(o=>o.houseLoot);ctx.actor.x+=24;ctx.P={x:ctx.actor.x,y:ctx.actor.y+20};
assert.equal(vm.runInContext('tryHouseLootChest()',ctx),true);
console.log('PASS: 79 chests, 53 homes, idempotent setup, six animation frames, one-time rewards, all 11 consumables, compact notices, actual save/load, slot isolation, legacy saves and moved chest interaction.');
