import fs from 'node:fs';import vm from 'node:vm';import zlib from 'node:zlib';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),game=read('js/generated/game-part-2.js');
const packed=read('js/generated/game-part-1.js'),W=JSON.parse(zlib.gunzipSync(Buffer.from(packed.match(/const W_GZ = "([^"]+)"/)[1],'base64')));
const m=W.maps.world,f=m.ferry,SPR=JSON.parse(zlib.gunzipSync(Buffer.from(packed.match(/const ATLAS_GZ = "([^"]+)"/)[1],'base64'))).sprites;
const terr=Uint8Array.from(m.terr.split('|').flatMap(p=>{const[v,n]=p.split('.').map(Number);return Array(n).fill(v);}));
const messages=[],c=vm.createContext({W,MD:m,MAPID:'world',SPR,TS:16,MW:m.w,terr,DECK:15,
 P:{},dragon:{},dragonHere:()=>true,mounted:false,ride:null,objs:[],NAME2I:{},hidden:new Set(),rebuildBuckets(){},toast:s=>messages.push(s),playScene:lines=>messages.push(...lines),playerFacing4:()=>c.P.dir8,
 hunt:null,breath:null,claw:null,linger:0,refreshWingBtn(){},direction4:(x,y)=>Math.abs(x)>Math.abs(y)?x<0?'w':'e':y<0?'n':'s'});
const run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('function installFerrySigns()'),game.indexOf('function villageStandSize()')));
run(game.slice(game.indexOf('function ferryOf()'),game.indexOf('function npcContextDialogue(')));
run(game.slice(game.indexOf('function dragonAirborne()'),game.indexOf('function dragonHover()')));
run('installFerrySigns();installFerrySigns()');const signs=m.roomActors.filter(o=>o.ferrySign);assert.equal(signs.length,2);
for(const sign of signs){
 const tx=Math.floor(sign.x/16),ty=Math.floor((sign.y-1)/16);assert.equal(terr[ty*m.w+tx],15,'sign stands on the dock');
 c.P={x:sign.x,y:sign.y+20,dir8:'n'};assert(run('tryFerrySign()'));
 assert.equal(messages.at(-1),'Press A on the boat to take a ride! Sorry, no dragons allowed in the boat!');
 c.P.dir8='s';assert(!run('tryFerrySign()'),'must face the sign');
}
for(const [start,end] of [[f.land_a,f.land_b],[f.land_b,f.land_a]]){
 c.P={x:start[0]*16+8,y:start[1]*16+16};c.mounted=true;
 assert(run('ferryTry()'));assert.equal(c.ride,null,'mounted riders cannot board');c.mounted=false;
 c.dragon={x:c.P.x-70,y:c.P.y,air:false,placed:'world',dir:'s'};
 assert(run('ferryTry()'));assert(c.ride);assert(Number.isFinite(c.ride.x)&&Number.isFinite(c.ride.y),'boat position valid before first frame');
 let frames=0;
 while(c.ride&&frames++<4000){
  run('followDragonFerry(1/60);stepFerry(1/60)');
  assert(c.dragon.air,'companion can cross water');assert(Math.hypot(c.dragon.x-c.P.x,c.dragon.y-c.P.y)<150,'companion keeps up');
  if(frames>180)assert(c.dragon.x-c.P.x>30,'dragon stays beside boat, outside its passenger seat');
 }
 assert(frames<4000,'ferry arrives');assert.equal(c.P.x,end[0]*16+8);assert.equal(c.P.y,end[1]*16+16);
 assert(Math.hypot(c.dragon.x-c.P.x,c.dragon.y-c.P.y)<90,'dragon reaches the far landing');
 assert.equal(c.P.dir8,end===f.land_b?'n':'s');
}
assert(game.indexOf('if (!sayNpc && tryFerrySign())')<game.indexOf('if (ferryTry())'),'sign gets A before nearby ferry');
console.log('PASS: both dock signs stand on planks, exact dialogue, dismount requirement, finite boarding pose, both full ferry routes with dragon alongside and correct facing.');
