import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const world=JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const W_GZ = "([^"]+)/)[1],'base64')));
const royal=JSON.parse(read('assets/game-assets.js').match(/window.EMBER_ASSETS.ROYAL_DATA = (.*);/)[1]);
Object.assign(world.maps,royal.maps);
const sprites=JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const ATLAS_GZ = "([^"]+)/)[1],'base64'))).sprites;Object.assign(sprites,royal.sprites);
const layouts={...JSON.parse(read('assets/interiors/millwood/layouts.json')),...JSON.parse(read('assets/interiors/thornwell/layouts.json')),...JSON.parse(read('assets/interiors/forgewick/layouts.json')),...JSON.parse(read('assets/interiors/sandspire/layouts.json')),...JSON.parse(read('assets/interiors/hollybeck/layouts.json')),...JSON.parse(read('assets/interiors/remaining/layouts.json'))};
const outside=JSON.stringify(Object.fromEntries(Object.entries(world.maps).filter(([id])=>!layouts[id]&&!world.maps[id].royal&&id!=='cinderhold')));
const ctx=vm.createContext({W:world,window:{},fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url.split('?')[0]))}),Image:class{async decode(){}},document:{createElement:()=>({getContext:()=>({drawImage(){}})})},npcs:[],actorLayouts:{},SPR:sprites,NAMES:[],throneRoomImg:{},TS:16,rebuildSolid(){},mapDirty:false});
vm.runInContext(read('js/millwood-interiors.js'),ctx);
vm.runInContext('alignHouseTableSeats=async()=>{}',ctx);
const game=read('js/generated/game-part-2.js');
for(const [start,end] of [['function editorActorInfo(', 'function shiftActorData('],['function shiftActorData(', 'function pickEditorActor(']])vm.runInContext(game.slice(game.indexOf(start),game.indexOf(end)),ctx);
await vm.runInContext('prepareMillwoodInteriors()',ctx);
let count=0;
for(const [id,layout] of Object.entries(layouts)){
 const map=world.maps[id];Object.assign(ctx,{MD:map,MAPID:id,PXW:map.w*16,PXH:map.h*16});
 const actors=map.roomActors.filter(o=>o.exactFurniture);assert.equal(actors.length,layout.objects.length);
 const assigned=actors.flatMap(o=>o.moveBlocks);assert.equal(new Set(assigned).size,assigned.length);
 for(const o of actors){
  const {x,y}=o;const before=o.moveBlocks.map(i=>map.roomBlocks[i].slice());
  ctx.subject=o;vm.runInContext('moveEditorActor(subject,subject.x+3,subject.y+3,true)',ctx);
  assert.equal(o.x,x+3);assert.equal(o.y,y+3);
  o.moveBlocks.forEach((i,j)=>assert.deepEqual(map.roomBlocks[i],before[j].map(v=>v+3)));
  vm.runInContext('applyActorLayout(MD,MAPID)',ctx);assert.equal(o.x,x+3);
  vm.runInContext('moveEditorActor(subject,subject.x-3,subject.y-3,true)',ctx);
  o.moveBlocks.forEach((i,j)=>assert.deepEqual(map.roomBlocks[i],before[j]));count++;
 }
}
assert.equal(JSON.stringify(Object.fromEntries(Object.entries(world.maps).filter(([id])=>!layouts[id]&&!world.maps[id].royal&&id!=='cinderhold'))),outside);
await vm.runInContext('prepareMillwoodInteriors()',ctx);
for(const [id,layout] of Object.entries(layouts))assert.equal(world.maps[id].roomActors.filter(o=>o.exactFurniture).length,layout.objects.length);
console.log(`PASS: ${count} furniture objects across ${Object.keys(layouts).length} rooms; movement, collision, saved layouts, idempotence and excluded maps.`);
