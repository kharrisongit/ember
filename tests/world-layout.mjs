import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const p2=read('js/generated/game-part-2.js'),p3=read('js/generated/game-part-3.js');
const section=(source,start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
const c=vm.createContext({assert});
vm.runInContext(`
let editStamp=0;
const RCELL=4;
let MD={winter_regions:[[-90,-80,-64,-64]],swamp_regions:[[300,300,310,310]],
        volcano_regions:[[200,-70,220,-50]]};
let features=[
  {id:1,kind:'route',style:'winter',pts:[[-20,5],[90,5],[90,96]],w:5,band:7},
  {id:2,kind:'route',style:'winter',pts:[[160,160],[190,180]],w:0,band:0},
  {id:3,kind:'arena',style:'winter',x:64,y:64,r:7.3,band:12},
  {id:4,kind:'arena',style:'winter',x:260,y:110},
  {id:5,kind:'area',style:'winter',x0:130,y0:-20,x1:145,y1:20},
  {id:6,kind:'route',style:'swamp',pts:[[-30,-40],[40,35],[40,150]],w:4,band:8},
  {id:7,kind:'route',style:'swamp',x0:200,y0:200,x1:200,y1:200},
  {id:8,kind:'area',style:'swamp',x0:350,y0:350,x1:360,y1:360},
  {id:9,kind:'route',style:'volcano',pts:[[100,220],[230,220],[230,260]],w:8,band:10},
  {id:10,kind:'area',style:'volcano',x0:30,y0:280,x1:70,y1:320},
  {id:11,kind:'arena',style:'volcano',x:350,y:350,r:20}
];
const onLava=(x,y)=>x===390&&y===390;
${section(p3,'const _legCache =','function inClearing(')}
${section(p2,'function inWinter(','function hash2(')}
${section(p2,'function inSwamp(','let arenaRings =')}
${section(p3,'function inVolcano(','function snowGround(')}
function compareQueries(){
  const queries=['winter','swamp','volcano'].map(createBiomeQuery);
  const check=(x,y)=>{
    assert.equal(queries[0](x,y),inWinter(x,y),'Winter at '+x+','+y);
    assert.equal(queries[1](x,y),inSwamp(x,y),'Swamp at '+x+','+y);
    assert.equal(onLava(x,y)||queries[2](x,y),inVolcano(x,y),'Volcano at '+x+','+y);
  };
  // Negative coordinates, fractional tree positions and spatial-cell seams.
  for(let y=-100;y<=400;y+=4.125)for(let x=-100;x<=400;x+=3.875)check(x,y);
  for(const [x,y]of [[-90,-80],[-64,-64],[64,64],[64+19.3,64],[90,107],
    [123,5],[190,160],[200+24,200],[300,310],[350,350],[390,390]])
    for(const d of [-0.001,0,0.001]){check(x+d,y);check(x,y+d);}
  return queries;
}
const initial=compareQueries();
// Queries are temporary snapshots. The next pass sees current editor data.
const copied=routeLegs(features[0]);copied[0][0][0]=9999;copied.push([[0,0],[1,1]]);
assert.equal(routeLegs(features[0])[0][0][0],-20,'Editable route copies cannot corrupt shared geometry');
features[0].pts=[[-20,250],[90,250]];features[2].x=320;features[4].style='oak';editStamp++;
assert(initial[0](0,5),'An existing synchronous pass keeps its snapshot');
assert(!compareQueries()[0](0,5),'The next pass sees the moved route');
MD.features=features;features=[];compareQueries();
MD.features=undefined;compareQueries();
// Tile lookups must not reconstruct routes or scan the feature list again.
const originalRead=readRouteLegs;
readRouteLegs=()=>assert.fail('A prepared query must reuse its geometry');
for(let i=0;i<20000;i++)initial[i%3](i%400,(i*7)%400);
readRouteLegs=originalRead;
`,c);

// Small avenue fixture recorded from the previous layout implementation.
// Preserve object order and IDs, including removing multiple trees on one tile,
// retaining off-route trees, and leaving authored/generated props alone.
const avenue=section(p3,'  {\n    const AVENUE =','\n  {\n    const cov =');
const a=vm.createContext({Uint8Array});
vm.runInContext(`
const TS=16,MW=42,MH=42,TREE_STEP=3,GRASS=0,SAND=11;
const NAMES=['spr_big','oak_big','cactus1','sign'],NAME2I={spr_big:0,cactus1:2},SPR={spr_big:[1],cactus1:[1]};
const features=[{kind:'route',style:'spruce',pts:[[10,20],[26,20]],w:5}];
const isArea=()=>false,sows=()=>false,inTownArea=()=>false,routeLegs=f=>[[f.pts[0],f.pts[1]]];
const tree=(id,s,x,y)=>({id,s,x:x*TS+TS/2,y:y*TS+TS,feat:1});
const objs=[tree(9,3,14,16)];
let fobjs=[tree(-1,0,20,16),tree(-2,1,20,16),tree(-3,3,26,16),tree(-4,1,39,39)];
const terr=new Uint8Array(MW*MH);
${avenue}
`,a);
const output=vm.runInContext('JSON.stringify(fobjs)',a);
assert.equal(createHash('sha256').update(output).digest('hex'),
  'd3f71c694f5e65d66f71a7e3de319b3872a37e3b922b079f17e983e7038d4a14',
  'Batched avenue replacements preserve the complete previous layout');
console.log('PASS: indexed biome boundaries match live queries, fresh passes reflect edits, route copies remain safe, and batched tree replacement preserves layout and IDs.');
