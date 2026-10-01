import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({Math,Set,MD:{scatter:[]}});
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
const plain=x=>JSON.parse(JSON.stringify(x));
const road=(a,b,blossom=true)=>({a,b,half:2,band:20,blossom});
const straight=road([30,50],[120,50]);
const plan=roads=>plain(c.planBlossomRows(roads));
const rows=plan([straight]);
for(const y of [40,43,46,54,57,60]) {
  const row=rows.filter(p=>p.y===y).sort((a,b)=>a.x-b.x);
  assert(row.length>10);
  assert(row.slice(1).every((p,i)=>Math.abs((p.x-row[i].x)*16-91)<.01),'Every straight row has identical spacing');
  assert(row.every(p=>Math.round(p.x*16)%91===(p.row%2)*46),'Outer rows alternate by half the spacing');
}
assert.deepEqual(rows,plan([road(straight.b,straight.a)]),'Reversing a route cannot shift its trees');
assert.deepEqual(rows,plan([road([30,50],[72,50]),road([72,50],[120,50])]),'Splitting a straight leg cannot double its trees');
const bend=[straight,road([120,50],[120,120]),road([60,20],[60,80],false)];
const corners=plan(bend);
assert.deepEqual(corners,plan([...bend].reverse()),'Feature order cannot change junction spacing');
for(let i=0;i<corners.length;i++) {
  const p=corners[i];
  assert(bend.every(r=>c.blossomRoadDistance(p.x,p.y,r)>=r.half+2-.01),'Crossing paths stay open');
  assert(corners.slice(i+1).every(q=>Math.hypot(p.x-q.x,p.y-q.y)>=3.96),'Bends never stack neighboring bands');
}
const vertical=plan([road([50,30],[50,120])]);
for(const x of [40,43,46,54,57,60]) {
  const row=vertical.filter(p=>p.x===x).sort((a,b)=>a.y-b.y);
  assert(row.slice(1).every((p,i)=>Math.abs((p.y-row[i].y)*16-91)<.01),'Vertical avenues use the same spacing');
}
const circle={id:7,x:100,y:100,r:7.3};
const rings=[0,1,2].map(row=>plain(c.blossomArenaCandidates(circle,row)));
assert(rings.every(r=>r.length===rings[0].length),'Arena bands share one angular grid');
for(let row=0;row<3;row++)for(const p of rings[row])
  assert(Math.abs(Math.hypot(p.x-circle.x,p.y-circle.y)-(9.8+row*3))<.05,'Arena trunks follow evenly spaced concentric rings');

// Exercise ownership against old authored and generated vegetation, obstacles,
// clearings and player edits. Nothing outside the route is rewritten.
vm.runInContext(`
var MAPID='world',MW=160,MH=160,TS=16,GRASS=0,WALL=6,WATER=4,ARENA_R=6;
var features=[{kind:'route',style:'blossom',w:5,band:20,pts:[[30,50],[120,50]]}];
var routeLegs=f=>[[f.pts[0],f.pts[1]]],inClearing=()=>false;
var NAMES=['blo_big','spr_big','sign'],NAME2I={blo_big:0},SPR={blo_big:[0,0,58,71],spr_big:[0,0,40,60],sign:[0,0,16,16]},DEFS={2:{c:[0,0,16,16]}};
var objs=[{id:1,s:0,x:40*16+8,y:47*16},{id:2,s:0,x:145*16+8,y:141*16},{id:3,s:2,x:72*16+8,y:47*16}];
var added=[{id:4,s:0,x:42*16+8,y:42*16}],ORIG=[],publishedEditorLayouts={maps:{world:{stroke:{kind:'object-add',sprite:0,x:96*16+8,y:47*16}}}};
objs.push(...added,{id:5,s:0,x:96*16+8,y:47*16});
var fobjs=[{id:-1,s:1,x:43*16+8,y:47*16}],hidden=new Set(),deleted=new Set(),npcs=[];
var terr=new Uint8Array(MW*MH),rockTiles=new Set(['85,46']),SCENE_WALL=new Set([46*MW+91]),felled=new Set(['63,46']);
terr[46*MW+68]=WATER;
var guards={inTownArea:(x,y)=>x>=110&&x<=120,onBuilding:()=>false};
rebuildBlossomRoutes(guards);
`,c);
assert(c.hidden.has(1),'Old authored route trees are hidden without destroying their identity');
assert(!c.hidden.has(2),'Unrelated trees are preserved');
assert(c.hidden.has(4)&&c.hidden.has(5),'Stale local and published trees cannot override managed border spacing');
assert(c.objs.some(o=>o.id===3),'Route props survive');
const planted=()=>plain(c.fobjs.filter(o=>o.blossomRow!==undefined));
assert(planted().length>30);
assert(c.fobjs.every(o=>o.s===0),'Generic forest trees cannot crowd the new rows');
for(const x of [68,72,85,91,114,120])assert(!planted().some(o=>Math.floor(o.x/16)===x&&Math.floor((o.y-1)/16)===46),'Water, props, cliffs and towns remain clear');
const coordinates=planted().map(({x,y,blossomRow})=>[x,y,blossomRow]);
vm.runInContext('rebuildBlossomRoutes(guards)',c);
assert.deepEqual(planted().map(({x,y,blossomRow})=>[x,y,blossomRow]),coordinates,'Rebuilding cannot accumulate duplicates');
// The real arena repair pass must not substitute winter trees for an explicitly
// blossom arena, even when the broad biome test calls this location winter.
const game=fs.readFileSync('js/generated/game-part-3.js','utf8');
vm.runInContext(game.slice(game.indexOf('function repairArenaTreeEdges()'),game.indexOf('function clearForgefallsCliffTrees()')),c);
vm.runInContext(`
var MD={forest_style:'spruce'},DWATER=13,SEA=14,BRIDGE=5,DECK=15,COBBLE=2,PAVING2=8,MARBLE=9,TERRACE=10,ROADSAND=12;
var STYLE_TREE={blossom:['blo_big','blo_med'],winter:'kt_tree_a'},inWinter=()=>true,sandRefuses=()=>false;
NAMES.push('blo_med','kt_tree_a');NAME2I.blo_med=3;NAME2I.kt_tree_a=4;
SPR.blo_med=[0,0,47,58];SPR.kt_tree_a=[0,0,48,64];
var felledNew=[],blockTiles=[];objs=[];fobjs=[];hidden=new Set();terr.fill(GRASS);
features=[{id:7,kind:'arena',style:'blossom',x:80,y:80,r:7.3}];
repairArenaTreeEdges();
`,c);
assert(c.fobjs.length>15,'The arena ring is restored');
assert(c.fobjs.every(o=>c.NAMES[o.s].startsWith('blo_')),'Blossom arenas never inherit winter trees');
// The earlier ring pass also needs to accept a list of blossom sprite names;
// looking up the whole list used to fall back to the nearest winter tree.
vm.runInContext(`
var noPlant=()=>false,isArea=()=>false,onBody=()=>false,inTown=()=>false,atOasis=()=>false,refusesTrunk=()=>false;
var speciesNear=()=>NAME2I.kt_tree_a,baseTerr=null,SAND=11,DIRT=1;
fobjs=[{id:-1,s:NAME2I.kt_tree_a,x:90*16+8,y:81*16}];terr.fill(GRASS);
`,c);
// World construction now yields between stages; execute the extracted stage as a generator.
vm.runInContext('[...(function*(){'+game.slice(game.indexOf('  {\n    const want = new Set(), band = new Set();'),game.indexOf('  {\n    const AVENUE ='))+'})()]',c);
assert(c.fobjs.length>15);
assert(c.fobjs.every(o=>c.NAMES[o.s].startsWith('blo_')),'The initial ring replaces wrong species and plants only blossom variants');
// Final planting owns the entire arena ring and town border, including the
// old authored trees which used to overlap several generated planting passes.
vm.runInContext(`
features=[{id:7,kind:'arena',style:'blossom',x:100,y:100,r:7.3},
 {id:8,kind:'area',label:'Coralmere',style:'blossom',x0:20,y0:20,x1:65,y1:60,band:6},
 {id:9,kind:'route',style:'blossom',w:5,pts:[[100,70],[100,130]]}];
fobjs=Array.from({length:36},(_,i)=>({id:-1-i,s:i%2?0:4,
 x:(100+9.8*Math.cos(i*Math.PI/18))*16+8,y:(101+9.8*Math.sin(i*Math.PI/18))*16}));
objs=[{id:1,s:0,x:25.25*16+8,y:41*16},{id:2,s:0,x:40*16+8,y:41*16}];
hidden=new Set();added=[];ORIG=[];publishedEditorLayouts={maps:{}};felled.clear();terr.fill(GRASS);
guards={inTownArea:(x,y)=>x>=20&&x<=65&&y>=20&&y<=60,onBuilding:()=>false};
rebuildBlossomRoutes(guards);
`,c);
assert(c.hidden.has(1),'Town-edge trees with old jitter are removed');
assert(!c.hidden.has(2),'Interior garden trees remain');
const arenaTrees=planted().filter(o=>o.blossomKind==='arena');
assert(arenaTrees.filter(o=>o.blossomRow===0).length>=6);
assert(arenaTrees.filter(o=>o.blossomRow===0).length<=10,'A single evenly spaced inner ring replaces the crowded arena border');
assert(arenaTrees.every(o=>c.NAMES[o.s]==='blo_big'));
assert(c.fobjs.every(o=>o.blossomKind),'No legacy arena planting remains');
const townTrees=planted().filter(o=>o.blossomKind==='town');
assert(townTrees.length>30);
assert.deepEqual([...new Set(townTrees.map(o=>o.blossomRow))].sort(),[0,1,2],'Town borders have two staggered outer bands');
const all=planted();
for(let i=0;i<all.length;i++) {
 const o=all[i],tx=Math.floor(o.x/16),ty=Math.floor((o.y-1)/16);
 assert(Number.isInteger(o.x)&&Number.isInteger(o.y),'Trees stay pixel aligned');
 assert.equal(c.terr[ty*c.MW+tx],c.WALL,'Fractional tile spacing stamps the actual trunk cell');
  assert(all.slice(i+1).every(p=>Math.hypot(o.x-p.x,o.y-p.y)>=3.96*16),'Rows and rings do not crowd each other');
}
const borderPositions=all.map(({x,y,blossomKind,blossomRow})=>[x,y,blossomKind,blossomRow]);
vm.runInContext('rebuildBlossomRoutes(guards)',c);
assert.deepEqual(planted().map(({x,y,blossomKind,blossomRow})=>[x,y,blossomKind,blossomRow]),borderPositions,'Arena and town borders do not accumulate trees after rebuilding');
console.log('PASS: 91px blossom spacing, staggered routes/town borders, even arena rings, pixel-aligned collision and protected edits.');
