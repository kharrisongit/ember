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
const layerCode=read('js/millwood-interiors.js');
vm.runInContext(layerCode.slice(layerCode.indexOf('async function alignHouseTableSeats()')),ctx);
await vm.runInContext('alignHouseTableSeats()',ctx);
assert.equal(W.maps.world.roomActors.filter(o=>o.castSeat).length,0,'Outdoor table furniture remains');
assert.equal(W.maps.world.npcs.filter(n=>n.seated||/^(?:pack_pupil_|seated_body_|villager_seated_)/.test(n.packSpr||'')).length,0,'Outdoor seated NPC remains');
let count=0;
for(const [id,m] of Object.entries(W.maps))for(const n of m.npcs||[]){
 if(!/^villager_seated_/.test(n.packSpr||''))continue;
 assert.match(id,/^house\d/);
 ctx.subject=n;ctx.sprite=SPR[n.packSpr];
 for(let frame=0;frame<4;frame++){
  ctx.frame=frame;vm.runInContext('drawNpcFrame(subject,sprite,frame,null)',ctx);
  const [,img,sx,sy,w,h]=calls.at(-1);assert.equal(img,sheet);assert(sx>=0&&sy>=0&&sx+w<=96&&sy+h<=1080,'Portrait crop outside sheet');
 }
 assert(!n.school,'Portrait hidden by school renderer');
 if(n.seatClipY!==undefined)assert(n.seatClipY>n.y-SPR[n.packSpr][3]+8,'Portrait clipped away');count++;
}
console.log(`PASS: ${count} house portraits render from valid dedicated-sheet frames; no generated outdoor tables or seated NPCs.`);

let seats=0;for(const [id,m] of Object.entries(W.maps))for(const n of m.npcs||[]){if(!/^house\d/.test(id)||(!n.seated&&!n.seatSpr&&n.seatClipY===undefined))continue;assert(n._seatContact,`No measured table for ${id}: ${n.n}`);const c=n._seatContact;assert.equal(n.y-c.height+c.bottom,c.edge+2);assert.equal(n.seatClipY,c.edge);seats++;}
console.log(`PASS: ${seats} seated house NPCs meet their table edge with two pixels of overlap.`);
