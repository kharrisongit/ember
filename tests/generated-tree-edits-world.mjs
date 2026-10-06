import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
export function verifyGeneratedTreeEdits(run){
 const signs=JSON.parse(run('JSON.stringify(MD.roomActors.filter(o=>o.ferrySign))'));
 for(const p of signs){
  assert.equal(run(`terr[Math.floor((${p.y}-1)/TS)*MW+Math.floor(${p.x}/TS)]`),0);
  assert(!run(`objs.filter(o=>!hidden.has(o.id)).concat(fobjs).some(o=>{
   if(!/^sw_tree/.test(NAMES[o.s]||''))return false;const s=SPR[NAMES[o.s]];
   return o.x+s[2]/2>${p.x}-22&&o.x-s[2]/2<${p.x}+22&&o.y>${p.y}-28&&o.y-s[3]<${p.y}+18;
  })`),'no swamp canopy obscures either dock sign');
 }
 run(`editing=true;building=false;painting=false;finePlace=true;cam.z=1;
  var editTreeSources=fobjs.filter(o=>o.sideRouteWall&&/^sw_tree/.test(NAMES[o.s]||'')).slice(0,3).map(o=>({...o}));
  var editedTrees=[];
  // Reproduce the old case: authored data says felled, but a repair replanted it.
  felled.add(editorSceneryCell(editTreeSources[0]));`);
 assert.equal(run('editTreeSources.length'),3);
 for(let i=0;i<3;i++){
  run(`dragObj=fobjs.find(o=>o.x===editTreeSources[${i}].x&&o.y===editTreeSources[${i}].y);selected=dragObj;
    touches.clear();touches.set(1,{x:0,y:0,sx:0,sy:0});
    mapTouchMove({identifier:1,clientX:80,clientY:32});editedTrees.push(dragObj.id);
    mapTouchEnd({identifier:1});`);
  assert(run(`felledNew.includes(editorSceneryCell(editTreeSources[${i}]))`),'even a historically felled cell exports its new removal');
  assert(!run('fobjs.some(o=>editTreeSources.slice(0,editedTrees.length).some(s=>editorSceneryCell(o)===editorSceneryCell(s)))'),'previous trees never reappear while moving another');
 }
 run('SideRouteAdventures.finishWorld();reindex();saveEditorDraft();');
 assert(run('editedTrees.every(id=>objs.some(o=>o.id===id)&&!hidden.has(id))'),'late border repair preserves all manual destinations');
 assert(!run('fobjs.some(o=>editTreeSources.some(s=>editorSceneryCell(o)===editorSceneryCell(s)))'),'late border repair preserves every original removal');
 const draft=JSON.parse(run("JSON.stringify(EmberEditDrafts.store.get('world'))"));
 for(const id of JSON.parse(run('JSON.stringify(editedTrees)')))assert(draft.state.added.some(o=>o.id===id));
 assert(draft.operations.filter(o=>o.kind==='feature-delete').length>=3);
 assert(draft.operations.filter(o=>o.kind==='object-add').length>=3);
 run("editing=false;loadMap('house26');loadMap('world');");
 assert(run('editedTrees.every(id=>objs.some(o=>o.id===id)&&!hidden.has(id))'),'moved trees survive an interior round trip');
 assert(!run('fobjs.some(o=>editTreeSources.some(s=>editorSceneryCell(o)===editorSceneryCell(s)))'),'originals remain removed after returning');
 console.log('PASS: actual three-tree touch drags, legacy felled cells, late border repair, both ends in the exported draft, interior return, and clear dock signs.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
 await run('loadPublishedEditorLayouts()');
 run("mode='play';gameplayStarted=true;quest=Q.DONE;foesHeld=true;loadMap('world');");
 verifyGeneratedTreeEdits(run);
}
