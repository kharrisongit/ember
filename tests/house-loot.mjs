import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const placements=JSON.parse(read('assets/interiors/house-loot.json'));
const W=JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const W_GZ = "([^"]+)/)[1],'base64')));
const counts={};for(const c of placements){counts[c.map.split('_')[0]]=(counts[c.map.split('_')[0]]||0)+1;assert(c.gold>=5&&c.gold<=15);}
assert.equal(Object.keys(counts).length,53);assert(Object.values(counts).every(n=>n>=1&&n<=3));
assert.equal(new Set(placements.map(c=>c.id)).size,115);
let clock=0,saved=null,saves=0;
const ctx=vm.createContext({W,fetch:async()=>({ok:true,json:async()=>placements}),performance:{now:()=>clock},
 gold:50,potions:0,boarMeat:0,dragonFish:0,P:{},toast(){},flyGold(){},showReveal(){},saveGame(){saves++;},
 quest:0,smithUpgrade:false,glassShield:false,wonAll:0,cinderSeal:false,trialSealPlaced:false,trialWins:0,thornwellMet:false,brambleQuest:0,knightEncounterDone:false,royalDefeated:{},treasuryTaken:new Set(),breathHas:{},dragon:{hp:5,maxHp:5},fishingPole:false,trial:null,MAPID:'house00',activeSaveSlot:1,
 migrateLegacySave(){},readSaveSlot:()=>saved,syncDragonVitality(){},hasSword:()=>true,loadMap(id){ctx.MAPID=id;ctx.MD=W.maps[id];},recoverTempleArrival(){},cam:{},clampCam(){},chunks:{clear(){}}});
vm.runInContext(read('js/house-loot.js'),ctx);
await vm.runInContext('prepareHouseLoot()',ctx);
await vm.runInContext('prepareHouseLoot()',ctx);
for(const c of placements){assert.equal(W.maps[c.map].roomActors.filter(o=>o.houseLoot).length,1);}
const game=read('js/generated/game-part-3.js');
vm.runInContext(game.slice(game.indexOf('function captureSave()'),game.indexOf('function saveToSlot(')),ctx);
vm.runInContext(game.slice(game.indexOf('function loadGame('),game.indexOf('let mounted =')),ctx);
let total=50,potions=0,meat=0,fish=0;
for(const c of placements){
 ctx.MD=W.maps[c.map];ctx.MAPID=c.map;ctx.actor=ctx.MD.roomActors.find(o=>o.houseLoot);ctx.P={x:c.x,y:c.y+20};
 assert.equal(vm.runInContext('houseLootFrame(actor)',ctx),0);
 assert.equal(vm.runInContext('tryHouseLootChest()',ctx),true);total+=c.gold;
 if(c.item==='potion')potions++;if(c.item==='boarMeat')meat++;if(c.item==='dragonFish')fish++;
 for(let i=0;i<6;i++){assert.equal(vm.runInContext('houseLootFrame(actor)',ctx),i);clock+=100;}
 assert.equal(vm.runInContext('tryHouseLootChest()',ctx),true);assert.equal(ctx.gold,total);
}
assert.equal(saves,115);assert.equal(ctx.potions,potions);assert.equal(ctx.boarMeat,meat);assert.equal(ctx.dragonFish,fish);
saved=JSON.parse(JSON.stringify(vm.runInContext('captureSave()',ctx)));
assert.equal(saved.houseLootTaken.length,115);assert.equal(saved.potions,potions);
ctx.gold=0;ctx.potions=0;ctx.boarMeat=0;ctx.dragonFish=0;
assert.equal(vm.runInContext('loadGame(1)',ctx),true);
assert.equal(ctx.gold,total);assert.equal(ctx.potions,potions);assert.equal(ctx.boarMeat,meat);assert.equal(ctx.dragonFish,fish);
assert.equal(vm.runInContext('houseLootTaken.size',ctx),115);
// A different/legacy slot must not inherit another slot's claimed chests or potions.
saved={map:'house00',x:120,y:192,gold:50,quest:0};
assert.equal(vm.runInContext('loadGame(2)',ctx),true);
assert.equal(vm.runInContext('houseLootTaken.size',ctx),0);assert.equal(ctx.potions,0);
// Moving a chest keeps its interaction attached to its actor, not its original position.
ctx.actor=W.maps.house00.roomActors.find(o=>o.houseLoot);ctx.actor.x+=24;ctx.P={x:ctx.actor.x,y:ctx.actor.y+20};
assert.equal(vm.runInContext('tryHouseLootChest()',ctx),true);
console.log('PASS: 115 chests, 53 homes, idempotent setup, six animation frames, one-time rewards, actual save/load, slot isolation, legacy saves and moved chest interaction.');
