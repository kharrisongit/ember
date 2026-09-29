import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({Math,Set});
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
vm.runInContext(`
var features=[
 {id:1,kind:'area',label:'North Shroom Pass Field',style:'mystic',x0:18,y0:9,x1:42,y1:33,band:1,meadow:true},
 {id:6,kind:'area',label:'Spore Hollow',style:'mystic',x0:80,y0:62,x1:110,y1:92,band:6,no_trees:true},
 {id:8,kind:'area',label:'Shroom Pass',style:'mystic',x0:1,y0:34,x1:72,y1:240,wild:true},
 {id:9,kind:'area',label:'Northern Woods',style:'spruce',x0:1,y0:241,x1:72,y1:403,wild:true},
 {id:3,kind:'route',w:5,pts:[[30,32],[30,40],[30,397],[30,410]]},
 {id:210,kind:'arena',style:'mystic',x:30,y:195,r:6.3},
 {id:211,kind:'arena',style:'mystic',x:30,y:131,r:6.3},
 {id:212,kind:'route',style:'spruce',w:5,pts:[[30,241],[30,403]]},
 {id:17,kind:'arena',style:'birch',x:120,y:133,r:6.3}
];
var routeLegs=f=>f.pts.slice(1).map((b,i)=>[f.pts[i],b]);
var selected=treeBorderScope(features,routeLegs);
`,c);
const roads=c.selected.roads.filter(r=>r.region==='shroom');
assert.equal(roads.length,2,'Only the two road segments inside Shroom Pass are managed');
assert(roads.every(r=>r.tree==='mw_tree'&&r.a[1]>=34&&r.b[1]<=240));
assert(c.selected.roads.some(r=>r.id===3&&!r.blossom&&r.b[1]===410),'The full road still protects the route outside the region');
assert.deepEqual(Array.from(c.selected.arenas.filter(a=>a.region==='shroom'),a=>a.id).sort(),[210,211]);
assert(c.selected.arenas.some(a=>a.id===17&&a.tree==='bir_big'),'Neighboring arena retains its native birch tree type');
assert.equal(c.selected.towns.length,0,'Open clearings and the tree-free hollow are preserved');
const layout=c.planBlossomLayout(c.selected.roads,c.selected.arenas,[]);
const shrooms=layout.filter(p=>p.region==='shroom');
assert(shrooms.every(p=>p.tree==='mw_tree'&&p.y>=34&&p.y<=240));
for(const x of [21,23.5,26,34,36.5,39]) {
 const row=shrooms.filter(p=>p.kind==='route'&&p.x===x&&p.y>70&&p.y<110).sort((a,b)=>a.y-b.y);
 assert(row.length>=9,'Every straight band is filled');
 assert(row.slice(1).every((p,i)=>(p.y-row[i].y)*16===66),'Tree stems remain visible with even spacing');
 assert(row.every(p=>p.y*16%66===p.row%2*33),'Adjacent bands alternate by half a tree spacing');
}
for(let i=0;i<layout.length;i++)assert(layout.slice(i+1).every(q=>Math.hypot(layout[i].x-q.x,layout[i].y-q.y)>=Math.max(c.treeBorderSpacing(layout[i]).clearance,c.treeBorderSpacing(q).clearance)-.04),'Arena edges and biome joins do not crowd their neighbors');
const reverse=c.treeBorderClipRoad({a:[30,397],b:[30,40]},c.features[2]);
assert.equal(reverse.a[1],40);assert.equal(reverse.b[1],240);
vm.runInContext(`
var MAPID='world',MW=145,MH=450,TS=16,GRASS=0,WALL=6,ARENA_R=6;
var NAMES=['mw_tree','spr_big','rock2'],NAME2I={mw_tree:0,spr_big:1};
var SPR={mw_tree:[0,0,45,64],spr_big:[0,0,36,69],rock2:[0,0,11,8]},DEFS={2:{c:[9,6]}};
var objs=[{id:1,s:0,x:26*16+8,y:81*16},{id:2,s:1,x:67*16+8,y:251*16},
 {id:3,s:0,x:95*16+8,y:71*16},{id:4,s:2,x:20*16+8,y:101*16},
 {id:5,s:0,x:26*16+8,y:39*16},{id:6,s:0,x:26*16+8,y:21*16}];
var fobjs=[{id:-1,s:1,x:22*16+8,y:132*16}],ORIG=[],added=[],deleted=new Set(),hidden=new Set();
var publishedEditorLayouts={maps:{}},npcs=[],terr=new Uint8Array(MW*MH),rockTiles=new Set(),SCENE_WALL=new Set(),felled=new Set();
var inClearing=(x,y)=>(x>=6&&x<=54&&y<=45)||(x>=86&&x<=104&&y>=68&&y<=86);
var guards={inTownArea:(x,y)=>(x>=18&&x<=42&&y<=33)||(x>=80&&x<=110&&y>=62&&y<=92),onBuilding:()=>false};
rebuildBlossomRoutes(guards);
`,c);
assert(c.hidden.has(1)&&c.hidden.has(5),'Old route planting, including trees in the meadow buffer, is cleared');
assert([2,3,4,6].every(id=>!c.hidden.has(id)),'Distant trees, hollow, props and northern field are preserved');
const planted=c.fobjs.filter(o=>o.borderRegion==='shroom');
assert(planted.length>200&&planted.every(o=>o.s===0),'Every rebuilt Shroom Pass border uses its native tree');
assert(planted.every(o=>{
 const x=o.x/16-.5,y=o.y/16-1;
 return !(x>=18&&x<=42&&y>=9&&y<=33)&&!(x>=86&&x<=104&&y>=68&&y<=86);
}),'New trees never fill the actual meadow or hollow clearing');
for(const x of [26,34]) {
 const row=planted.filter(o=>o.blossomKind==='route'&&o.blossomRow===0&&o.x/16-.5===x)
   .map(o=>o.y/16-1).filter(y=>y<70).sort((a,b)=>a-b);
 assert.equal(row[0],37.125,'The inner path row reaches the first spacing point below the meadow');
 assert(row.slice(1).every((y,i)=>y-row[i]===66/16),'No gap remains between the meadow and the path rows');
}
assert(planted.every(o=>c.terr[Math.floor((o.y-1)/16)*c.MW+Math.floor(o.x/16)]===c.WALL),'Trunk collision cells match the pixel-aligned planting');
const positions=JSON.stringify(c.fobjs.map(o=>[o.x,o.y,o.s,o.blossomRow]));
vm.runInContext('rebuildBlossomRoutes(guards)',c);
assert.equal(JSON.stringify(c.fobjs.map(o=>[o.x,o.y,o.s,o.blossomRow])),positions,'Rebuilding does not stack new trees');
console.log('PASS: Shroom Pass route clipping, native trees, visible stems, staggered bands, arena rings, biome boundary, open clearings and repeat rebuilds.');
