import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({Math,Set,Map});
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
vm.runInContext(`
var TS=16,MW=1200,MH=500,MAPID='world',GRASS=0,WALL=6,SAND=11,ARENA_R=6.3;
var features=[{id:32,kind:'route',style:'dying',w:5,pts:[[965,140],[1045,140]]},
 {id:33,kind:'route',style:'desert',w:5,pts:[[1047,138],[1174,138]]},
 {id:26,kind:'route',style:'temple',w:5,joins:['Forgewick Temple'],pts:[[977,361],[1058,361]]},
 {id:172,kind:'arena',style:'mystic',arenaNum:18,x:1002,y:361,r:6.3},
 {id:160,kind:'arena',style:'desert',x:1103,y:138,r:6.3}];
var routeLegs=f=>f.pts.slice(1).map((b,i)=>[f.pts[i],b]);
var NAMES=['deadtree0','cactus1','kt_tree_a'],NAME2I={deadtree0:0,cactus1:1,kt_tree_a:2};
var SPR={deadtree0:[0,0,36,57],cactus1:[0,0,13,26],kt_tree_a:[0,0,63,79]},DEFS={};
var MD={scatter:[]},objs=[],fobjs=[],hidden=new Set(),deleted=new Set(),npcs=[];
var terr=new Uint8Array(MW*MH),rockTiles=new Set(),SCENE_WALL=new Set(),felled=new Set(),felledNew=[];
for(let y=120;y<160;y++)for(let x=970;x<1199;x++)terr[y*MW+x]=SAND;
var inClearing=()=>false,guards={inTownArea:()=>false,onBuilding:()=>false};
rebuildBlossomRoutes(guards);
`,c);
const rows=Array.from(c.fobjs);
assert.deepEqual(Array.from(c.features.find(f=>f.id===32).pts.at(-1)),[1047,138],'Road ends physically meet');
const a22=rows.filter(o=>o.blossomFeature===172);
assert(a22.length>=18&&a22.every(o=>o.s===2),'Current arena 22 uses temple trees, independent of legacy arenaNum 18');
for(const row of [0,1,2]){
 const dead=rows.filter(o=>o.blossomFeature===32&&o.blossomRow===row);
 const cactus=rows.filter(o=>o.blossomFeature===33&&o.blossomRow===row);
 assert(dead.some(o=>o.x/16>1035),'Every dead-tree band continues across sand to the join');
 assert(dead.every(o=>o.s===0&&o.x/16-.5<1046),'Dead trees stop at the species boundary');
 assert(cactus.some(o=>o.x/16<1060)&&cactus.every(o=>o.s===1&&o.x/16-.5>=1046),'Cactus starts at the same boundary');
 for(const south of [false,true]){
  const d=dead.filter(o=>south?o.y/16>141:o.y/16<140).sort((a,b)=>a.x-b.x).at(-1);
  const k=cactus.filter(o=>south?o.y/16>139:o.y/16<138).sort((a,b)=>a.x-b.x)[0];
  assert(d&&k&&Math.hypot(k.x-d.x,k.y-d.y)<=9*16,`Band ${row} ${south?'south':'north'} has no large empty seam`);
 }
}
const first=JSON.stringify(c.fobjs),geometry=JSON.stringify(c.features);
vm.runInContext('rebuildBlossomRoutes(guards)',c);
assert.equal(JSON.stringify(c.features),geometry,'Join geometry is idempotent');
assert.equal(JSON.stringify(c.fobjs),first,'Repeated passes preserve the join and arena trees');
console.log('PASS: arena 22 temple species, connected road ends, three native bands on both sides of the sandy dead-tree/cactus join and repeated rebuilds.');
