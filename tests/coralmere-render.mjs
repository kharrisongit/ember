import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const packed=read('js/generated/game-part-1.js');
const unpack=name=>JSON.parse(zlib.gunzipSync(Buffer.from(packed.match(new RegExp('const '+name+'_GZ = "([^"]+)'))[1],'base64')));
const W=unpack('W'),SPR=unpack('ATLAS').sprites,code=read('js/generated/game-part-2.js');
const calls=[],sheet={width:96,height:1080};
const ctx=vm.createContext({fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url.split('?')[0]))}),W,SPR,NPC_VOICES:{},houseSeatedSheet:sheet,scene:null,bossScene:null,hatchExit:null,console,
 ctx:{save(){},restore(){},beginPath(){},rect(){},clip(){}},drawGameImage:(...args)=>calls.push(args),performance:{now:()=>0}});
for(const [a,b] of [['function arrangeNpcCast()','function applyWorld('],['function dressSandspire()','function individualizeDialogue()'],['function installFishingVillager()','function installFirstTemple()']])vm.runInContext(code.slice(code.indexOf(a),code.indexOf(b)),ctx);
vm.runInContext('dressSandspire();installFishingVillager();installMarketCounters();arrangeNpcCast()',ctx);
const royal=JSON.parse(read('assets/game-assets.js').match(/window.EMBER_ASSETS.ROYAL_DATA = (.*);/)[1]);
Object.assign(SPR,royal.sprites);
const start=code.indexOf(' for(const [mapId,name,spr]');const end=code.indexOf('\n}\n',start);vm.runInContext(code.slice(start,end),ctx);
vm.runInContext(code.slice(code.indexOf('function repairCoralmere()'),code.indexOf('function npcTalkDistance(')),ctx);
vm.runInContext('repairCoralmere()',ctx);

// Exercise the actual legacy drawWorld branch, rather than a duplicate resolver.
const drawStart=code.indexOf('    if (o.sk !== undefined) {',code.indexOf('function drawWorld('));
const drawEnd=code.indexOf('    const nm = NAMES[o.s], s = SPR[nm], od = DEFS[o.s];',drawStart);
ctx.atlasImg={};ctx.ATLAS={};ctx.t=1;
vm.runInContext('function renderLegacy(o){for(const entry of [o]){'+code.slice(drawStart,drawEnd)+'}}',ctx);
for(const name of ['Nerissa','Merrin','Asta']){
 const n=W.maps.world.npcs.find(n=>n.n===name);assert(n,name+' must remain outdoors');
 assert(SPR['npc_'+n.sk+'_d'],name+' needs an existing standing skin');
 assert(!n.seated&&!n.seatSpr&&!n.packSpr,name+' must not regain a table pose');
 for(const f of ['d','s','u'])for(const moving of [false,true]){
  ctx.subject={...n,f,t:0,flip:false,px:n.x-(moving?1:0),py:n.y};
  const before=calls.length;vm.runInContext('renderLegacy(subject)',ctx);
  assert.equal(calls.length,before+1,name+' remains visible');
  assert(calls.at(-1).slice(2).every(Number.isFinite),name+' draw coordinates/frame must be finite');
 }
}
const seller=W.maps.world.npcs.find(n=>n.n==='Nerissa');
assert.equal(seller.x,32472);assert.equal(seller.y,8380);assert.deepEqual(Array.from(seller.sells),['potion','bell']);
// Saved/legacy cast records and missing directional variants also remain drawable.
for(const sk of ['bartender_katy','villager','missing_legacy_skin']){
 ctx.subject={sk,x:100,y:100,px:99,py:100,f:'s',t:0};const before=calls.length;
 vm.runInContext('renderLegacy(subject)',ctx);assert.equal(calls.length,before+1);
}
console.log('PASS: Coralmere seller and restored outdoor NPCs render idle/walking in every legacy direction; missing skin fallback stays visible; seller position and inventory retained.');
