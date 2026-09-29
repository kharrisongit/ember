/* Full published-map load: keep generation, editor replay and border passes real;
   skip only drawing and object indexing, which cannot alter tree placement. */
import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
await run('loadPublishedEditorLayouts()');
run("applyPublishedEditorLayout(W.maps.world,'world')");
run(`buildGround=()=>{};reindex=()=>{};refreshBuild=()=>{};
 rebuildSolid=()=>{};rebuildBuckets=()=>{};placeBirds=()=>{};loadMap('world',true);`);
const data=JSON.parse(run(`JSON.stringify({features,NAMES,roads:treeBorderScope(features,routeLegs).roads,
 trees:objs.filter(o=>!hidden.has(o.id)&&!deleted.has(o.id)).concat(fobjs).filter(o=>BLOSSOM_ROUTE_TREES.test(NAMES[o.s]||''))})`));
const routes={3:['mw_tree'],5:['spr_big'],12:['spr_big'],13:['bir_big','spr_big'],19:['bir_big'],
 24:['kt_tree_a'],25:['kt_tree_a'],26:['kt_tree_a','mw_tree'],31:['oak_big'],32:['deadtree0'],
 193:['bir_big','oak_big'],212:['spr_big'],9148:['bir_big'],9151:['bir_big'],9153:['oak_big'],9155:['oak_big'],9158:['kt_tree_a']};
for(const [id,species] of Object.entries(routes)){
 const trees=data.trees.filter(o=>o.blossomKind==='route'&&o.blossomFeature===Number(id));
 assert(trees.length>0,`Route ${id} retains border planting`);
 assert(trees.every(o=>species.includes(data.NAMES[o.s])),`Route ${id} retains its native species`);
 for(const row of [0,1,2])assert(trees.some(o=>o.blossomRow===row),`Route ${id} has border band ${row}`);
}
// The eight-tile connector is inside the adjacent birch avenue's junction;
// its overlapping rows are intentionally owned by the longer avenue.
const connector=data.roads.find(r=>r.id===9149);
assert(connector&&data.trees.filter(o=>Math.hypot(o.x/16-.5-connector.a[0],o.y/16-1-connector.a[1])<14&&data.NAMES[o.s]==='bir_big').length>=6,'Short birch connector has continuous shared planting');
const expected={11:'spr_big',208:'spr_big',209:'spr_big',210:'mw_tree',211:'mw_tree',
 17:'bir_big',9001:'bir_big',9002:'bir_big',9147:'bir_big',9150:'bir_big',9152:'bir_big',
 176:'oak_big',177:'oak_big',178:'oak_big',9154:'oak_big',9156:'oak_big',
 169:'kt_tree_a',170:'kt_tree_a',171:'kt_tree_a',180:'kt_tree_a',9159:'kt_tree_a',172:'mw_tree'};
for(const a of data.features.filter(a=>expected[a.id]||a.id===175)){
 const trees=data.trees.filter(o=>Math.hypot(o.x/16-.5-a.x,o.y/16-1-a.y)<(a.r||6.3)+11);
 assert(trees.length>=18,`Arena ${a.id} has complete border planting`);
 assert(trees.every(o=>data.NAMES[o.s]===(a.id===175?(o.y/16-1<a.y?'bir_big':'oak_big'):expected[a.id])),`Arena ${a.id} uses only the correct border species after every pass`);
 for(const row of [0,1,2])assert(trees.some(o=>o.blossomRow===row),`Arena ${a.id} has border band ${row}`);
}
const spruceSouth=data.trees.filter(o=>o.x/16>86&&o.x/16<110&&o.y/16>352&&o.y/16<386);
assert(spruceSouth.every(o=>data.NAMES[o.s]==='spr_big'),'No three residual birches in the spruce approach');
const west=data.trees.filter(o=>o.x/16>398&&o.x/16<410&&o.y/16>128&&o.y/16<141);
assert(west.length>=6&&west.every(o=>data.NAMES[o.s]==='oak_big'),'West oak edge below the transition is filled with oaks');
assert(data.trees.filter(o=>o.blossomKind==='route'&&o.blossomFeature===32).every(o=>data.NAMES[o.s]==='deadtree0'),'Dying approach to the desert retains native trees');
console.log(`PASS: 18 western routes, all ${Object.keys(expected).length+1} combat/hunting arenas, split transition, spruce approach, west oak edge and dying avenue after full published-map loading.`);
