import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({Math,Set,Map});
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
vm.runInContext(`
var MAPID='world',TS=16,MW=1000,MH=500,GRASS=0,WALL=6,ARENA_R=6;
var features=[{id:1,kind:'route',style:'oak',w:5,pts:[[50,50],[50,100]]},
 {id:28,kind:'landmark',label:'Forgefalls',x:417,y:328}];
var routeLegs=f=>f.pts.slice(1).map((b,i)=>[f.pts[i],b]);
var NAMES=['oak_big','mtn_4_1','cliff_fall'],NAME2I={oak_big:0};
var SPR={oak_big:[0,0,41,63],mtn_4_1:[0,0,16,16],cliff_fall:[0,0,528,87]},DEFS={};
var MD={scatter:[]};for(let x=685;x<=817;x++)MD.scatter.push(1,(x+.5)*TS,129*TS);
var objs=[{id:1,s:2,x:417.5*TS,y:327*TS}];
var fobjs=[{id:-1,s:0,x:700*TS+8,y:130*TS}],ORIG=[],added=[],deleted=new Set(),hidden=new Set();
var publishedEditorLayouts={maps:{}},npcs=[],terr=new Uint8Array(MW*MH),rockTiles=new Set(),SCENE_WALL=new Set(),felled=new Set();
var inClearing=()=>false,guards={inTownArea:()=>false,onBuilding:()=>false};
rebuildBlossomRoutes(guards);
`,c);
const rows=()=>Array.from(c.fobjs).filter(o=>o.blossomKind==='scenery');
for(const source of ['mine','falls']){
 const row=rows().filter(o=>o.blossomFeature===source).sort((a,b)=>a.x-b.x);
 assert(row.length>10,'Complete scenery row is planted');
 assert(row.slice(1).every((o,i)=>o.x-row[i].x===42),'Horizontal canopy spacing has no skipped trees');
 assert(row.every(o=>o.s===0),'Scenery rows use oak');
 if(source==='mine')assert(row.at(-1).x/16>815,'Mine row reaches the eastern mountain edge');
}
const before=JSON.stringify(c.fobjs);
vm.runInContext('rebuildBlossomRoutes(guards)',c);
assert.equal(JSON.stringify(c.fobjs),before,'Repeated rebuilds preserve the scenery rows');
const selected=c.treeBorderScope([13,15,17].map((n,i)=>({id:i,arenaNum:n,kind:'arena',style:'birch',x:100,y:100,r:6.3})),()=>[]);
assert(selected.arenas.every(a=>a.tree==='oak_big'),'Arenas 13, 15 and 17 remain oak');
assert.equal(selected.arenas.length,3,'Old birch labels do not exclude the oak arenas');
assert.equal(c.blossomArenaCandidates({r:6.3,x:100,y:100,region:'forgewick-temple'},0).length,12,'Temple arena rows have twelve evenly spaced trees');
console.log('PASS: complete oak rows at Forgefalls and the mine, eastern coverage, repeat rebuilds, oak arena types and denser temple rings.');
