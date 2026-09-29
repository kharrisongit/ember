import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({Math,Set});
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
const plain=x=>JSON.parse(JSON.stringify(x));
const road=(a,b,blossom=true)=>({a,b,half:2,band:20,blossom});
const straight=road([30,50],[120,50]);
const plan=roads=>plain(c.planBlossomRows(roads));
const rows=plan([straight]);
for(const y of [36,41,46,54,59,64]) {
  const row=rows.filter(p=>p.y===y).sort((a,b)=>a.x-b.x);
  assert(row.length>10);
  assert(row.slice(1).every((p,i)=>p.x-row[i].x===6),'Every straight row has identical spacing');
  assert(row.every(p=>p.x%6===(p.row%2)*3),'Outer rows alternate by half the spacing');
}
assert.deepEqual(rows,plan([road(straight.b,straight.a)]),'Reversing a route cannot shift its trees');
assert.deepEqual(rows,plan([road([30,50],[72,50]),road([72,50],[120,50])]),'Splitting a straight leg cannot double its trees');
const bend=[straight,road([120,50],[120,120]),road([60,20],[60,80],false)];
const corners=plan(bend);
assert.deepEqual(corners,plan([...bend].reverse()),'Feature order cannot change junction spacing');
for(let i=0;i<corners.length;i++) {
  const p=corners[i];
  assert(bend.every(r=>c.blossomRoadDistance(p.x,p.y,r)>=r.half+2-.01),'Crossing paths stay open');
  assert(corners.slice(i+1).every(q=>Math.hypot(p.x-q.x,p.y-q.y)>=5),'Bends never stack neighboring bands');
}
const vertical=plan([road([50,30],[50,120])]);
for(const x of [36,41,46,54,59,64]) {
  const row=vertical.filter(p=>p.x===x).sort((a,b)=>a.y-b.y);
  assert(row.slice(1).every((p,i)=>p.y-row[i].y===6),'Vertical avenues use the same spacing');
}

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
var terr=new Uint8Array(MW*MH),rockTiles=new Set(['84,46']),SCENE_WALL=new Set([46*MW+90]),felled=new Set(['60,46']);
terr[46*MW+66]=WATER;
var guards={inTownArea:(x,y)=>x>=110&&x<=120,onBuilding:()=>false};
rebuildBlossomRoutes(guards);
`,c);
assert(c.hidden.has(1),'Old authored route trees are hidden without destroying their identity');
assert(!c.hidden.has(2),'Unrelated trees are preserved');
assert(!c.hidden.has(4)&&!c.hidden.has(5),'Local and published tree strokes survive a rebuild');
assert(c.objs.some(o=>o.id===3),'Route props survive');
const planted=()=>plain(c.fobjs.filter(o=>o.blossomRow!==undefined));
assert(planted().length>30);
assert(c.fobjs.every(o=>o.s===0),'Generic forest trees cannot crowd the new rows');
for(const x of [60,66,72,84,90,114,120])assert(!planted().some(o=>o.x===x*16+8&&o.y===47*16),'Deleted trees, water, props, cliffs and towns remain clear');
const coordinates=planted().map(({x,y,blossomRow})=>[x,y,blossomRow]);
vm.runInContext('rebuildBlossomRoutes(guards)',c);
assert.deepEqual(planted().map(({x,y,blossomRow})=>[x,y,blossomRow]),coordinates,'Rebuilding cannot accumulate duplicates');
console.log('PASS: blossom spacing, half-step bands, vertical rows, bends, junctions, legacy cleanup and protected map edits.');
