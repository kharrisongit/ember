import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({Math,Set,Map});
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
vm.runInContext(`
var TS=16,MW=2300,MH=520,MAPID='world',GRASS=0,WALL=6,SAND=11,ARENA_R=6.3;
var features=[
 {id:33,kind:'route',style:'desert',w:5,pts:[[1047,138],[1174,138],[1174,300],[1400,300],[1400,200]]},
 {id:9160,kind:'route',style:'desert',w:5,pts:[[1399,218],[1441,218],[1441,282],[1402,282]]},
 {id:161,kind:'arena',style:'desert',x:1174,y:180,r:6.3},
 {id:194,kind:'arena',style:'desert',x:1385,y:300,r:6.3},
 {id:9161,kind:'arena',style:'desert',x:1441,y:252,r:6.3,encounter:'boar'},
 {id:44,kind:'route',style:'desert',w:5,pts:[[1745,26],[1824,26]]},
 {id:45,kind:'route',style:'dying',w:5,pts:[[1824,26],[1887,26]]},
 {id:46,kind:'route',style:'blossom',w:5,pts:[[1887,26],[2000,26]]},
 {id:58,kind:'route',style:'blossom',w:5,pts:[[2050,450],[2144,450]]},
 {id:61,kind:'route',style:'swamp',w:5,pts:[[2143,449],[2256,449]]},
 {id:133,kind:'arena',style:'spruce',x:2176,y:449,r:7.245}];
var routeLegs=f=>f.pts.slice(1).map((b,i)=>[f.pts[i],b]);
var NAMES=['deadtree0','cactus1','blo_big','sw_tree3_3','kt_tree_a'],NAME2I=Object.fromEntries(NAMES.map((n,i)=>[n,i]));
var SPR={deadtree0:[0,0,36,57],cactus1:[0,0,13,26],blo_big:[0,0,58,71],sw_tree3_3:[0,0,48,74],kt_tree_a:[0,0,63,79]},DEFS={};
var MD={scatter:[]},objs=[214,222,224].map((y,i)=>({id:7130+i,s:4,x:1395.5*TS,y:(y+1)*TS}));
objs.push({id:8000,s:3,x:2210.5*TS,y:446*TS});
var fobjs=[],hidden=new Set(),deleted=new Set(),npcs=[];
var terr=new Uint8Array(MW*MH),rockTiles=new Set(),SCENE_WALL=new Set(),felledNew=[];
for(let y=0;y<320;y++)for(let x=1040;x<1892;x++)terr[y*MW+x]=SAND;
var inClearing=()=>false,guards={inTownArea:()=>false,onBuilding:()=>false};
rebuildBlossomRoutes(guards);
`,c);
const rows=()=>Array.from(c.fobjs).map(o=>({...o,x:o.x/16-.5,y:o.y/16-1,name:c.NAMES[o.s]}));
for(const id of [7130,7131,7132])assert(c.hidden.has(id),'Published temple trees are removed from the cactus avenue');
assert(!c.hidden.has(8000),'Distant swamp planting stays untouched');
const trees=rows();
for(const side of [-1,1])for(const row of [0,1,2]){
 const line=trees.filter(o=>o.blossomFeature===33&&o.blossomRow===row&&o.x===1174+side*(4+row*1.5)&&o.y>=138&&o.y<=165).sort((a,b)=>a.y-b.y);
 assert(line.length>=7,'Every cactus band turns south toward arena 25');
 assert(line.every(o=>o.name==='cactus1'));
 assert(line.slice(1).every((p,i)=>p.y-line[i].y<=3.01),'No skipped cactus grid positions above arena 25');
}
for(const [left,right,seam,y,leftName,rightName] of [[44,45,1824,26,'cactus1','deadtree0'],[45,46,1887,26,'deadtree0','blo_big'],[58,61,2144,449,'blo_big','sw_tree3_3']]){
 for(const row of [0,1,2])for(const side of [-1,1]){
  const band=id=>trees.filter(o=>o.blossomFeature===id&&o.blossomRow===row&&(o.y-y)*side>0);
  const a=band(left).sort((a,b)=>a.x-b.x).at(-1),b=band(right).sort((a,b)=>a.x-b.x)[0];
  assert(a&&b,`Both species have band ${row} on side ${side} at ${seam}`);
  assert(a.x<seam&&b.x>=seam,'Species meet at a single boundary');
  assert.equal(a.name,leftName);assert.equal(b.name,rightName);
  assert(Math.hypot(a.x-b.x,a.y-b.y)<=9,`No empty seam at ${seam}, band ${row}, side ${side}: ${JSON.stringify([a,b])}`);
 }
}
assert.deepEqual(Array.from(c.features.find(f=>f.id===58).pts.at(-1)),Array.from(c.features.find(f=>f.id===61).pts[0]),'The blossom path physically meets the swamp path');
const roads=c.treeBorderScope(c.features,c.routeLegs).roads;
for(const o of trees){
 assert(roads.every(r=>c.blossomRoadDistance(o.x,o.y,r)>=r.half+2-.04),'Transition trees keep the walkable road open');
}
const first=JSON.stringify(c.fobjs),geometry=JSON.stringify(c.features);
vm.runInContext('rebuildBlossomRoutes(guards)',c);
assert.equal(JSON.stringify(c.features),geometry,'Connection geometry is stable across rebuilds');
assert.equal(JSON.stringify(c.fobjs),first,'All eastern border trees survive repeated passes without duplicates');
console.log('PASS: native cactus by arenas 25/30, connected cactus/dead/blossom/swamp bands, clear paths and repeatable rebuilds.');
