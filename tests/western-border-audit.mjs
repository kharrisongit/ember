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
 crashMushrooms:objs.filter(o=>!hidden.has(o.id)&&!deleted.has(o.id)).concat(fobjs).filter(o=>/^sh_(big|wall|med|sml)/.test(NAMES[o.s]||'')&&o.x/16>=10&&o.x/16<=50&&o.y/16>=0&&o.y/16<=45).length,
 sporeMushrooms:objs.filter(o=>!hidden.has(o.id)&&!deleted.has(o.id)).concat(fobjs).filter(o=>/^sh_(big|wall)/.test(NAMES[o.s]||'')&&o.x/16>=80&&o.x/16<=110&&o.y/16>=62&&o.y/16<=92).length,
 trees:objs.filter(o=>!hidden.has(o.id)&&!deleted.has(o.id)).concat(fobjs).filter(o=>BLOSSOM_ROUTE_TREES.test(NAMES[o.s]||''))})`));
const routes={3:['mw_tree'],5:['spr_big'],12:['spr_big'],13:['bir_big','spr_big'],19:['bir_big'],
 24:['kt_tree_a'],25:['kt_tree_a'],26:['kt_tree_a'],31:['oak_big'],32:['deadtree0'],33:['cactus1'],
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
 169:'kt_tree_a',170:'kt_tree_a',171:'kt_tree_a',180:'kt_tree_a',9159:'kt_tree_a',172:'kt_tree_a'};
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
assert.equal(data.crashMushrooms,0,'Crash field mushroom square is absent after all passes');
assert(data.sporeMushrooms>0,'Shroom-people square remains after all passes');
const eastern=data.trees.map(o=>({...o,tx:o.x/16-.5,ty:o.y/16-1,name:data.NAMES[o.s]}));
const byHunt=eastern.filter(o=>o.tx>=1390&&o.tx<=1405&&o.ty>=205&&o.ty<=230);
assert(byHunt.length>=20&&byHunt.every(o=>o.name==='cactus1'),'No published temple trees survive north of arena 30 beside the hunting turnoff');
for(const side of [-1,1])for(const row of [0,1,2]){
 const line=eastern.filter(o=>o.blossomFeature===33&&o.blossomRow===row&&o.tx===1174+side*(4+row*1.5)&&o.ty>=138&&o.ty<=165).sort((a,b)=>a.ty-b.ty);
 assert(line.length>=7&&line.every(o=>o.name==='cactus1'),'Every cactus band continues south from the bend above arena 25');
 assert(line.slice(1).every((p,i)=>p.ty-line[i].ty<=3.01),'No final-map gaps in the north cactus connection');
}
for(const [left,right,seam,y] of [[44,45,1824,26],[45,46,1887,26],[58,61,2144,449]]){
 for(const row of [0,1,2])for(const side of [-1,1]){
  const band=id=>eastern.filter(o=>o.blossomFeature===id&&o.blossomRow===row&&Math.abs(o.tx-seam)<20&&Math.abs(o.ty-y)<12&&(o.ty-y)*side>0);
  const a=band(left).sort((a,b)=>a.tx-b.tx).at(-1),b=band(right).sort((a,b)=>a.tx-b.tx)[0];
  assert(a&&b&&Math.hypot(a.tx-b.tx,a.ty-b.ty)<=9,`Final map retains both sides of transition ${seam}, row ${row}, side ${side}`);
 }
}
console.log(`PASS: 19 routes through the desert entrance, all ${Object.keys(expected).length+1} combat/hunting arenas, split transition, spruce approach, west oak edge and dying avenue after full published-map loading.`);
console.log('PASS: eastern cactus bends and hunting turnoff, cactus/dead/blossom connection and blossom/swamp seam after all generation and saved-edit passes.');
for(const [id,x,y,step,band] of [[193,412,142,4,2.5],[33,1400,218,3,1.5],[33,1174,209,3,1.5],[37,1600,249,3,1.5]]){
 for(const row of [0,1,2]){
  const line=eastern.filter(o=>o.blossomFeature===id&&o.blossomRow===row&&Math.abs(o.tx-(x-4-row*band))<.01&&Math.abs(o.ty-y)<=10).sort((a,b)=>a.ty-b.ty);
  assert(line.length>=4&&line.slice(1).every((p,i)=>p.ty-line[i].ty<=step+.01),`Complete far verge at published hunting junction ${x},${y}, row ${row}`);
 }
}
const fallsFront=eastern.filter(o=>o.blossomFeature==='falls').sort((a,b)=>a.x-b.x);
assert(fallsFront.length>=12&&fallsFront.every(o=>o.y===327*16&&o.sy>o.y),'Forgefalls has a complete foreground tree row after all passes');
assert(fallsFront.slice(1).every((p,i)=>p.x-fallsFront[i].x===42||
 fallsFront[i].x<417.5*16&&p.x>417.5*16&&p.x-fallsFront[i].x===84),
 'The Forgefalls foreground row is evenly spaced on both sides of the waterfall opening');
console.log('PASS: published oak/desert hunting T-junctions and the actual Forgefalls cliff-front row.');
