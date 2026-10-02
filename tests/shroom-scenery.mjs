import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {loadEditorGame} from '../tools/editor-game-context.mjs';

const unit=vm.createContext({});
vm.runInContext(fs.readFileSync('js/shroom-scenery.js','utf8'),unit);
const names=['sh_big_blue0','mw_tree','sh_house0','sh_sml_red0'];
const sprites={sh_big_blue0:[0,0,32,47,1],mw_tree:[0,0,45,64,1],sh_house0:[0,0,60,67,1],sh_sml_red0:[0,0,8,11,1]};
const bounds={x0:1,y0:34,x1:72,y1:240};
const items=[{key:'o1',s:0,x:160,y:1000},{key:'o2',s:0,x:161,y:1000},
 {key:'o3',s:0,x:320,y:1000},{key:'f4',s:1,x:320,y:1010},
 {key:'o5',s:0,x:1600,y:1000},{key:'o6',s:2,x:400,y:1000},
 {key:'o7',s:3,x:430,y:1000}];
const removed=unit.planShroomThinning(items,sprites,names,bounds);
assert.equal([...removed].filter(k=>['o1','o2'].includes(k)).length,1,'One overlapping cap survives');
assert(removed.has('o3'),'A cap hidden behind a tree canopy is removed');
assert(['o5','o6','o7','f4'].every(k=>!removed.has(k)),'Outside mushrooms, houses, small open caps and trees survive');
assert.deepEqual([...unit.planShroomThinning([...items].reverse(),sprites,names,bounds)].sort(),[...removed].sort(),'Input ordering cannot change the grove');

const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
await run('loadPublishedEditorLayouts()');
run("applyPublishedEditorLayout(W.maps.world,'world')");
const assetPages=run('window.EMBER_ASSETS.ATLAS_PAGES.map(p=>p[4]).filter(s=>s.startsWith("assets/sprites/shroom-restored/"))');
assert.equal(assetPages.length,6,'All restored pages are installed after the earlier color restoration');
for(const path of assetPages)assert(fs.statSync(path.split('?')[0]).size>0,'Restored page exists');
context.capture={};
run(`const originalThinning=thinShroomPass,originalRebuildSolid=rebuildSolid;
thinShroomPass=()=>{
 capture.features=JSON.stringify(features);capture.terrain=BufferlessHash(terr);
 capture.objects=JSON.stringify(objs);capture.oldHidden=new Set(hidden);
 capture.trees=JSON.stringify(fobjs);originalThinning();
 capture.newHidden=[...hidden].filter(id=>!capture.oldHidden.has(id));
 capture.afterFeatures=JSON.stringify(features);capture.afterTerrain=BufferlessHash(terr);
 capture.afterObjects=JSON.stringify(objs);capture.afterTrees=JSON.stringify(fobjs);
};
function BufferlessHash(a){let h=2166136261;for(const v of a)h=Math.imul(h^v,16777619);return h>>>0;}
buildGround=()=>{};reindex=()=>{};refreshBuild=()=>{};
rebuildSolid=()=>{};rebuildBuckets=()=>{};placeBirds=()=>{};loadMap('world',true);`);
const result=context.capture;
assert.equal(result.features,result.afterFeatures,'Arena positions, routes and clearings are unchanged');
assert.equal(result.terrain,result.afterTerrain,'Terrain and route boundaries are unchanged');
assert.equal(result.objects,result.afterObjects,'Authored positions and stable object IDs remain intact');
assert.equal(result.trees,result.afterTrees,'The complete tree border is unchanged');
assert(result.newHidden.length>500&&result.newHidden.length<1300,'Actual crowded map is thinned without stripping the grove');
assert(run(`capture.newHidden.every(id=>{
 const o=objs.find(o=>o.id===id);return o&&SHROOM_SCENERY.test(NAMES[o.s])&&
 o.x>=16&&o.x<=72*16&&o.y>=34*16&&o.y<=240*16;
})`),'Only Shroom Pass mushrooms are removed; hollow and other areas are preserved');
const stable=run('JSON.stringify([[...hidden],fobjs,[...decorGone]])');
run('originalThinning()');
assert.equal(run('JSON.stringify([[...hidden],fobjs,[...decorGone]])'),stable,'Repeated preparation cannot thin the grove further');
// Exercise the real collision builder: a removed wall mushroom cannot leave
// an invisible obstacle; a neighboring surviving mushroom keeps its collision.
run(`MAPID='shroom-collision-check';MW=20;MH=20;
 terr=new Uint8Array(400).fill(GRASS);baseTerr=terr.slice();solid=new Uint8Array(400);
 blockTiles=[];decks=[];fobjs=[];deleted=new Set();hidden=new Set([1]);
 objs=[{id:1,s:NAME2I.sh_wall_blue0,x:88,y:96},{id:2,s:NAME2I.sh_wall_blue0,x:168,y:96}];
 originalRebuildSolid();`);
assert.equal(run('solid[5*MW+5]'),0,'Removed cap no longer blocks walking');
assert.equal(run('solid[5*MW+10]'),1,'Visible wall cap retains collision');
console.log(`PASS: original atlas pages, exact scope, stable IDs, unchanged terrain/arenas/tree borders, ${result.newHidden.length} hidden or crowded mushrooms removed, and repeat preparation.`);
