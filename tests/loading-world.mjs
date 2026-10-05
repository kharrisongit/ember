import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
context.assert=assert;
await run('loadPublishedEditorLayouts()');
run(`
loadMap('world');
assert(MD.npcs.some(n=>n.devLineup),'Editor sample definitions retain their stable keys');
assert(npcs.every(n=>!n.devLineup),'Hidden editor samples are absent from gameplay AI and collision');
const retained={terr,solid,fobjs,buckets,sbuckets,chunks,scatterChunks,blockTiles,hidden,decorGone};
const worldShape=JSON.stringify(features),worldCollision=solid.slice(),worldGround=terr.slice();
chunks.set('performance-marker',{cv:{marker:true},used:1});
let rebuilds=0;
for(const name of ['rebuildSolid','rebuildBuckets','buildGround','realizeFeatures']){
  const original=eval(name);eval(name+' = function(...args){if(MAPID==="world")rebuilds++;return original(...args)}');
}
for(const room of ['house22','house47','tp1','pyramid_entry']){
  loadMap(room);loadMap('world');
  assert(npcs.every(n=>!n.devLineup),'Returning to the world keeps editor samples out of gameplay');
  assert.equal(rebuilds,0,'Returning from '+room+' does not rebuild the overworld');
  for(const key of Object.keys(retained))assert.equal(eval(key),retained[key],key+' retained after '+room);
  assert(chunks.has('performance-marker'),'Warmed ground survives '+room);
  assert.equal(JSON.stringify(features),worldShape,'Authored routes and arenas unchanged');
  assert.deepEqual(solid,worldCollision,'Collision unchanged');assert.deepEqual(terr,worldGround,'Ground unchanged');
  assert(foes.some(f=>f.kind==='icemoth'),'Veilwing remains present');
  assert(MD.doors.some(d=>d.to==='pyramid_entry'),'Pyramid remains reachable');
}
`);
console.log('PASS: complete published map retains exact terrain, collisions, routes, arenas, indexes and ground chunks through four house/temple/pyramid return trips; Veilwing and pyramid remain present.');
