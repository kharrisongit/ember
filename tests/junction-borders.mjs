import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({Math,Set,Map});
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
for(const region of ['oak','birch','desert','forgewick-temple','blossom','millwood','shroom']){
 for(const turn of [0,1,2,3])for(const overhang of [-1,0,1,2]){
  const rotate=([x,y])=>{for(let i=0;i<turn;i++)[x,y]=[-y,x];return [x+200,y+200];};
  const road=(id,a,b)=>({id,a:rotate(a),b:rotate(b),half:2,band:20,blossom:true,region});
  const main=road(1,[0,-50],[0,50]),branch=road(2,[-overhang,0],[40,0]);
  const plain=Array.from(c.planBlossomRows([main]));
  const joined=Array.from(c.planBlossomRows([main,branch]));
  const back=p=>{let [x,y]=[p.x-200,p.y-200];for(let i=0;i<turn;i++)[x,y]=[y,-x];return x<0&&Math.abs(y)<14;};
  for(const p of plain.filter(back))assert(joined.some(q=>q.x===p.x&&q.y===p.y&&q.row===p.row),`${region} keeps its entire far verge at T-junction ${turn}/${overhang}`);
  const [mx,my]=rotate([0,0]),[bx,by]=rotate([10,0]);
  assert(!joined.some(p=>Math.hypot(p.x-mx,p.y-my)<3||Math.hypot(p.x-bx,p.y-by)<3),'Both route centres remain open');
 }
}
// Forgefalls is a cliff sprite immediately above the road, not the scatter
// mountain used by Forgewick. The row must survive its real rock footprint.
vm.runInContext(`
var MAPID='world',TS=16,MW=600,MH=400,GRASS=0,WALL=6,ARENA_R=6.3;
var features=[{id:193,kind:'route',style:'oak',w:5,pts:[[372,330],[462,330]]},
 {id:28,kind:'landmark',label:'Forgefalls',x:417,y:328}];
var routeLegs=f=>f.pts.slice(1).map((b,i)=>[f.pts[i],b]);
var NAMES=['oak_big','cliff_fall'],NAME2I={oak_big:0,cliff_fall:1};
var SPR={oak_big:[0,0,41,63],cliff_fall:[0,0,528,87]},DEFS={1:{c:[528,87]}};
var MD={scatter:[]},objs=[{id:4202,s:1,x:417.5*TS,y:327*TS}],fobjs=[],hidden=new Set(),deleted=new Set(),npcs=[];
var terr=new Uint8Array(MW*MH),rockTiles=new Set(),SCENE_WALL=new Set(),felledNew=[];
for(let x=401;x<=433;x++)for(let y=321;y<327;y++){rockTiles.add(x+','+y);terr[y*MW+x]=WALL;}
for(let x=372;x<=462;x++)for(let y=328;y<=332;y++)terr[y*MW+x]=1;
var inClearing=()=>false,guards={inTownArea:()=>false,onBuilding:()=>false};
rebuildBlossomRoutes(guards);
`,c);
const front=Array.from(c.fobjs).filter(o=>o.blossomFeature==='falls').sort((a,b)=>a.x-b.x);
assert(front.length>=12,'The full Forgefalls cliff gets a single front row');
assert(front.every(o=>o.y===328*16&&o.sy>c.objs[0].y),'Trees stand one tile in front of the cliff and render in front');
assert(front.slice(1).every((o,i)=>o.x-front[i].x===42),'No missing trees in the single row');
for(let x=401;x<=433;x++)for(let y=328;y<=332;y++)assert.equal(c.terr[y*c.MW+x],1,'The road below stays clear');
const first=JSON.stringify(c.fobjs);vm.runInContext('rebuildBlossomRoutes(guards)',c);assert.equal(JSON.stringify(c.fobjs),first);
console.log('PASS: uninterrupted far-side rows for 112 native T-junction variants; Forgefalls cliff row, foreground depth, clear road and repeated rebuild.');
