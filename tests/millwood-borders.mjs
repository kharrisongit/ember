import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({Math,Set});
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
vm.runInContext(`
var features=[
 {id:2,kind:'area',label:'Millwood',style:'spruce',x0:0,y0:404,x1:62,y1:453,band:6},
 {id:4,kind:'area',label:'Elders Home',style:'spruce',x0:40,y0:361,x1:65,y1:386,band:6},
 {id:9,kind:'area',label:'Northern Woods',style:'spruce',x0:1,y0:241,x1:72,y1:403,band:2,wild:true},
 {id:212,kind:'route',style:'spruce',w:5,pts:[[30,241],[30,403]]},
 {id:5,kind:'route',style:'spruce',w:5,joins:['Elders Home'],pts:[[32,374],[46,374]]},
 {id:12,kind:'route',style:'spruce',w:5,joins:['Millwood','Thornwell'],pts:[[57,433],[99,433],[99,361]]},
 {id:13,kind:'route',style:'birch',w:5,pts:[[98,367],[98,291]]},
 {id:208,kind:'arena',style:'spruce',x:30,y:340,r:6.3},
 {id:209,kind:'arena',style:'spruce',x:30,y:277,r:6.3},
 {id:11,kind:'arena',style:'spruce',x:98,y:352,r:6.3},
 {id:210,kind:'arena',style:'mystic',x:30,y:195,r:6.3},
 {id:500,kind:'route',style:'spruce',w:5,pts:[[500,241],[500,400]]},
 {id:501,kind:'arena',style:'spruce',x:500,y:300,r:6.3}
];
var routeLegs=f=>f.pts.slice(1).map((b,i)=>[f.pts[i],b]);
var selected=treeBorderScope(features,routeLegs);
`,c);
const ids=xs=>Array.from(new Set(xs.map(x=>x.id))).sort((a,b)=>a-b);
assert.deepEqual(ids(c.selected.roads.filter(r=>r.blossom)),[5,12,212]);
assert.deepEqual(ids(c.selected.arenas),[11,208,209]);
assert.deepEqual(ids(c.selected.towns),[2,4]);
const plan=c.planBlossomLayout(c.selected.roads,c.selected.arenas,c.selected.towns);
assert(plan.every(p=>p.tree==='spr_big'&&p.region==='millwood'));
assert(plan.filter(p=>p.kind==='route').every(p=>p.y>=241),'Spruce rows stop at the mushroom biome boundary');
// Smaller spruce canopies need the close spacing in every row, including the
// inner border. Check an uninterrupted stretch separately from junctions.
const straight=c.planBlossomLayout([{a:[30,50],b:[30,100],id:1,half:2,blossom:true,region:'millwood',tree:'spr_big'}],[],[]);
for(const x of [22,24,26,34,36,38]) {
 const row=straight.filter(p=>p.x===x).sort((a,b)=>a.y-b.y);
 assert(row.length>18);
 assert(row.slice(1).every((p,i)=>(p.y-row[i].y)*16===42),'Inner and outer spruce lines all use close, even spacing');
 assert(row.every(p=>p.y*16%42===p.row%2*21),'Neighboring spruce bands keep a half-step stagger');
}
const innerArena=c.blossomArenaCandidates(c.selected.arenas[0],0);
assert(innerArena.length>=20,'The inner arena ring uses the same close spruce spacing');
for(let i=0;i<plan.length;i++)assert(plan.slice(i+1).every(q=>Math.hypot(plan[i].x-q.x,plan[i].y-q.y)>=2.21),'Closer bands still leave distinct trunks at corners and entrances');
vm.runInContext(`
var MAPID='world',MW=150,MH=475,TS=16,GRASS=0,WALL=6,ARENA_R=6;
var NAMES=['spr_big','mw_tree','blo_big','house'],NAME2I={spr_big:0,mw_tree:1,blo_big:2};
var SPR={spr_big:[0,0,36,69],mw_tree:[0,0,45,64],blo_big:[0,0,58,71],house:[0,0,80,80]},DEFS={3:{c:[0,0,80,80]}};
var objs=[{id:1,s:0,x:5*16+8,y:425*16},{id:2,s:1,x:26*16+8,y:237*16},{id:3,s:3,x:20*16,y:430*16}];
var fobjs=[{id:-1,s:0,x:26*16+8,y:261*16},{id:-2,s:2,x:38*16+8,y:278*16}];
var ORIG=[],added=[],deleted=new Set(),hidden=new Set(),publishedEditorLayouts={maps:{}},npcs=[];
var terr=new Uint8Array(MW*MH),rockTiles=new Set(),SCENE_WALL=new Set(),felled=new Set();
var townAreas=features.filter(f=>f.kind==='area'&&!f.wild);
var inClearing=(x,y)=>townAreas.some(a=>x>=a.x0+a.band&&x<=a.x1-a.band&&y>=a.y0+a.band&&y<=a.y1-a.band);
var guards={inTownArea:(x,y)=>townAreas.some(a=>x>=a.x0&&x<=a.x1&&y>=a.y0&&y<=a.y1),onBuilding:()=>false};
rebuildBlossomRoutes(guards);
`,c);
assert(c.hidden.has(1),'Legacy Millwood border trees are replaced');
assert(!c.hidden.has(2),'The neighboring mushroom tree remains');
assert(!c.hidden.has(3),'Town buildings remain');
assert(c.fobjs.length>200);
assert(c.fobjs.every(o=>o.s===0&&o.borderRegion==='millwood'),'All managed borders use the native spruce art');
assert(c.fobjs.some(o=>o.blossomKind==='town'&&o.blossomFeature===4),'The Elder clearing has an orderly border');
assert(c.fobjs.every(o=>c.terr[Math.floor((o.y-1)/16)*c.MW+Math.floor(o.x/16)]===c.WALL));
const positions=JSON.stringify(c.fobjs.map(o=>[o.x,o.y,o.blossomKind,o.blossomRow]));
vm.runInContext('rebuildBlossomRoutes(guards)',c);
assert.equal(JSON.stringify(c.fobjs.map(o=>[o.x,o.y,o.blossomKind,o.blossomRow])),positions);
console.log('PASS: Millwood/Northern Woods scope, spruce borders, arena rings, Elder clearing, biome boundary and repeat rebuilds.');
