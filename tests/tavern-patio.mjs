import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),console,{furniture:false});
c.rebuildSolid=()=>{};c.scheduleEditorDraft=()=>{};
run(`function patioFixture(){return {objs:[W.names.indexOf('ifloor_tavern_patio'),3920,1104],roomActors:[],npcs:[],roomBlocks:[[3975,1053,4009,1067],[3831,1053,3865,1067],[3863,1069,3897,1083],[3943,1069,3977,1083]]};}
const patioLayout={group:{kind:'object',key:'0',sprite:W.names.indexOf('ifloor_tavern_patio'),originX:3920,originY:1104,x:3984,y:1136}};
const patio=patioFixture();applyPublishedEditorEntries(patio,'world',patioLayout);
MAPID='world';MD=patio;npcs=[];PXW=10000;PXH=10000;`);
const actors=run('patio.roomActors');assert.equal(actors.length,4);
assert.equal(new Set(actors.map(a=>a.editKey)).size,4);
assert.deepEqual(Array.from(run('patio.editorDeletedObjects')),[0],'Retire the combined sprite without reindexing objects');
for(const a of actors)assert.equal(a.moveBlocks.length,1,'Each table owns only its collision footprint');
const before=actors.map(a=>[a.x,a.y]);
const blocks=JSON.parse(run('JSON.stringify(patio.roomBlocks)'));
run('moveEditorActor(patio.roomActors[1],patio.roomActors[1].x+80,patio.roomActors[1].y+48,true)');
for(let i=0;i<4;i++)assert.deepEqual([actors[i].x,actors[i].y],before[i].map((n,k)=>n+(i===1?(k?48:80):0)));
for(let i=0;i<4;i++)assert.deepEqual(Array.from(run('patio.roomBlocks')[i]),blocks[i].map((n,k)=>n+(actors[1].moveBlocks.includes(i)?(k%2?48:80):0)));
assert.equal(run('pickEditorActor(patio.roomActors[1].x,patio.roomActors[1].y-12)'),actors[1]);
run(`const restored=patioFixture();applyPublishedEditorEntries(restored,'world',patioLayout);applyActorLayout(restored,'world');`);
assert.deepEqual(run('restored.roomActors.map(a=>[a.x,a.y])'),run('patio.roomActors.map(a=>[a.x,a.y])'),'Local saved positions restore independently');
run(`const a=patio.roomActors[1];const published=patioFixture();applyPublishedEditorEntries(published,'world',{...patioLayout,table:{kind:'actor',key:a.editKey,identity:a.spr,originX:${before[1][0]},originY:${before[1][1]},x:a.x,y:a.y}});`);
assert.deepEqual(run('published.roomActors.map(a=>[a.x,a.y])'),run('patio.roomActors.map(a=>[a.x,a.y])'),'Published table edits restore after an older whole-patio move');
run("prepareTavernPatio(published,'world')");assert.equal(run('published.roomActors.length'),4,'Revisiting does not duplicate tables');
console.log('PASS: four independently selectable patio tables preserve old group moves, move only their own collision, and restore local/published positions.');
run(`
const oldPatio=Object.assign(patioFixture(),{w:200,h:200,terr:'0.40000',base_terr:'0.40000'});
const oldBase=EmberBuildData.snapshot(oldPatio),oldAfter={...oldBase,w:201,terr:'0.40200',base_terr:'0.40200'};
const oldBuild={build:{kind:'build',previous:{},before:EmberBuildData.hash(oldBase),after:EmberBuildData.hash(oldAfter),changes:EmberBuildData.diff(oldBase,oldAfter)}};
applyPublishedEditorEntries(oldPatio,'world',oldBuild);
const newBase=EmberBuildData.snapshot(oldPatio),newAfter={...newBase,w:202,terr:'0.40400',base_terr:'0.40400'};
const newBuild={build:{kind:'build',previous:oldBuild,before:EmberBuildData.hash(newBase),after:EmberBuildData.hash(newAfter),changes:EmberBuildData.diff(newBase,newAfter)}};
const reloaded=Object.assign(patioFixture(),{w:200,h:200,terr:'0.40000',base_terr:'0.40000'});
applyPublishedEditorEntries(reloaded,'world',newBuild);
`);
assert.equal(run('reloaded.w'),202);assert.equal(run('reloaded.roomActors.length'),4);
console.log('PASS: legacy Build history loads before migration, and newer Build snapshots restore independent tables exactly once.');

// Patio performers are separate from the indoor tavern actor set. The table
// crops include their chairs, so each patron must sort above the whole crop.
run(`const patioDepthMap=patioFixture();prepareTavernPatio(patioDepthMap,'world');
const patioEater=W.maps.world.roomActors.find(a=>a.spr==='tavernpatio_anim_9');`);
const tables=run('patioDepthMap.roomActors');
for(const table of tables){
  for(const person of [{n:'Merrin'},{n:'Asta'},{spr:'tavernpatio_anim_9'},
    {packSpr:'tavern_src_Drinker1'},{packSpr:'tavern_src_Drinker2'}]){
    const patron={...person,x:table.x,y:table.y-12};
    assert(c.patioPatronDepth(patron,tables)>table.y,'Outdoor patron above both table and chair');
    const y=table.y;table.y+=8;
    assert(c.patioPatronDepth(patron,tables)>table.y,'Moved furniture keeps correct depth');
    table.editorDeleted=true;
    assert.equal(c.patioPatronDepth(patron,[table]),patron.y,'Deleted table cannot affect depth');
    table.editorDeleted=false;table.y=y;
    assert.equal(c.patioPatronDepth({...patron,x:table.x+1000},tables),patron.y,'Moved-away patron regains normal depth');
  }
}
const eater=run('patioEater');assert(eater);
assert(c.patioPatronDepth(eater,tables)>eater.y,'Actual outdoor eating animation clears its table');
assert.equal(c.patioPatronDepth({x:tables[0].x,y:tables[0].y-12,n:'Corin'},tables),tables[0].y-12,'Player still walks behind furniture normally');
console.log('PASS: outdoor tavern patrons and the authored eater sort above their tables/chairs, including moved and deleted furniture.');
// Legacy single-sprite drinkers remain valid editor placements even though
// the current published scene no longer contains the old npc-add records.
for(const [i,sprite]of ['tavern_src_Drinker1','tavern_src_Drinker2'].entries()){
 const table=tables[i],patron={packSpr:'npc_single_'+sprite,x:table.x,y:table.y-12};
 assert(c.isPatioPatron(patron),'Single-sprite drinking actor is recognized');
 assert(c.patioPatronDepth(patron,tables)>patron.y,'Drinker clears the nearby chair crop');
}
console.log('PASS: both legacy single-sprite Drinker placements sort above patio chairs.');
