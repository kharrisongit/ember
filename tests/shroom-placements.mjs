import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {loadEditorGame} from '../tools/editor-game-context.mjs';

// Build snapshots retain their old fingerprints; NPC placement is separate.
// Both generations must replay, including actor moves after a Build.
const c=vm.createContext({console,MAPID:'world',Q:{FLED:7}});c.globalThis=c;
for(const file of ['js/editor-build-data.js','js/shroom-lookout.js','js/published-editor-layouts.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
vm.runInContext(`
function shiftActorData(m,o,x,y){o.x=x;o.y=y;}
var m={w:100,h:100,terr:'0.10000',base_terr:'0.10000',objs:[],scatter:[],sanim:[],npcs:[],roomActors:[]};
var before=EmberBuildData.snapshot(m),after=JSON.parse(JSON.stringify(before));after.objs=[39,548,1304];
var oldBuild={before:EmberBuildData.hash(before),after:EmberBuildData.hash(after),changes:EmberBuildData.diff(before,after),previous:{}};
var modern=JSON.parse(JSON.stringify(after));
var latest=JSON.parse(JSON.stringify(modern));latest.objs.push(39,601,1302,39,652,1303);
var newBuild={before:EmberBuildData.hash(modern),after:EmberBuildData.hash(latest),changes:EmberBuildData.diff(modern,latest),previous:{build:oldBuild}};
var npcFixture={};prepareShroomLookoutData(npcFixture,'world');var origin=npcFixture.npcs[0];
applyPublishedEditorEntries(m,'world',{build:newBuild,move:{kind:'actor',key:origin.editKey,identity:'Mosslet',originX:origin.x,originY:origin.y,x:544,y:1400}});
`,c);
assert.deepEqual(Array.from(c.m.editorPlacedObjectIds),[0,1,2],'Tree additions in successive Build snapshots retain their stable slots');
vm.runInContext("prepareShroomLookoutData(m,'world')",c);
assert.equal(c.m.npcs.filter(n=>n.shroomLookout).length,2,'Each story placement is added only once across Build replay');
assert.equal(c.m.npcs[0].x,544);assert.equal(c.m.npcs[0].y,1400,'Published Mosslet move is applied');
vm.runInContext('npcs=m.npcs;prepareShroomLookout();prepareShroomLookout()',c);
assert.equal(c.m.npcs[0].y,1400,'Runtime preparation cannot reset a saved location');
console.log('PASS: old and new Build snapshots, persisted tree identities, published Mosslet movement and repeat preparation.');

const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
await run('loadPublishedEditorLayouts()');
run("applyPublishedEditorLayout(W.maps.world,'world')");
run(`buildGround=()=>{};reindex=()=>{};refreshBuild=()=>{};rebuildBuckets=()=>{};placeBirds=()=>{};loadMap('world',true)`);
if(process.env.EMBER_PLACEMENT_DUMP)fs.writeFileSync(process.env.EMBER_PLACEMENT_DUMP,run(`JSON.stringify({SPR,NAMES,features,objs:objs.filter(o=>!hidden.has(o.id)&&!deleted.has(o.id)),fobjs,npcs})`));
const expected=[[548,1304],[601,1302],[652,1303],[553,1203]];
for(const [x,y] of expected){
 assert.equal(run(`objs.filter(o=>NAMES[o.s]==='mw_tree'&&o.x===${x}&&o.y===${y}&&!hidden.has(o.id)&&!deleted.has(o.id)).length`),1,`Exactly one saved tree remains at ${x},${y}`);
}
assert(run('![7287,7290].some(id=>objs.some(o=>o.id===id))'),'Both copies of the extra foreground tree are removed');
assert(run(`objs.filter(isShroomEntranceTree).filter(o=>!hidden.has(o.id)).every(o=>fobjs.every(q=>NAMES[q.s]!=='mw_tree'||Math.hypot(q.x-o.x,q.y-o.y)>=48-.1))`),'Automatic trees give the authored trees their spacing');
assert(run(`(()=>{const n=npcs.find(n=>n.shroomLookout);return n&&MD.npcs.some(o=>o.editKey===n.editKey)&&T(Math.floor(n.x/TS),Math.floor(n.y/TS))===GRASS&&!isSolid(n.x,n.y,true,true);})()`),'Mosslet has an editable source and stands on walkable grass');
assert(run(`(()=>{const n=npcs.find(n=>n.shroomLookout&&npcHere(n)),blue=objs.find(o=>o.id===1097);return n.x===536&&n.y===1238&&blue&&!hidden.has(blue.id)&&Math.hypot(n.x-blue.x,n.y-blue.y)<40&&n.y<=1302-SPR.mw_tree[3];})()`),'Mosslet is north of the three tree canopies beside the visible blue mushroom');
// The encounter completion changes quest to FLED. No reload or first greeting
// is required to reveal the home placement; later save stages use the same gate.
for(const stage of ['ARMED','FLED','CARRY','DONE']){
 run('quest=Q.'+stage);
 assert.equal(run('npcs.filter(n=>n.shroomLookout&&npcHere(n)).length'),1,'Only one Mosslet is present at '+stage);
 assert.equal(run("npcs.find(n=>n.shroomLookout&&npcHere(n)).editKey"),stage==='ARMED'?'npc:shroom-lookout':'npc:shroom-lookout-home');
 assert(run(`(()=>{const n=npcs.find(n=>n.shroomLookout&&npcHere(n));return !isSolid(n.x,n.y,true,true);})()`),'Active story placement is walkable at '+stage);
}
context.playScene=(lines)=>{context.returnLines=lines;};
run('talkShroomLookout(npcs.find(n=>n.shroomLookout&&npcHere(n)))');
assert(context.returnLines.some(line=>line.includes('came back')),'Returned Mosslet acknowledges being back in the village');
run('quest=Q.ARMED');
run(`var lookout=npcs.find(n=>n.shroomLookout),px0=lookout.x,py0=lookout.y;editing=true;moveEditorActor(lookout,px0+8,py0+8,true);var exported=saveEditorDraft();`);
assert(run(`exported.operations.some(op=>op.kind==='actor'&&op.key==='npc:shroom-lookout'&&op.x===px0+8&&op.y===py0+8)`),'SEND CHANGES includes a Mosslet move');
assert(run(`exported.patch.includes('"key":"npc:shroom-lookout"')`),'COPY includes a Mosslet move');
run('prepareShroomLookout()');
assert(run('lookout.x===px0+8&&lookout.y===py0+8'),'Preparation retains the edited position');
run(`quest=Q.FLED;lookout=npcs.find(n=>n.shroomLookout&&npcHere(n));px0=lookout.x;py0=lookout.y;moveEditorActor(lookout,px0+8,py0+8,true);exported=saveEditorDraft();prepareShroomLookout()`);
assert(run(`exported.operations.some(op=>op.key==='npc:shroom-lookout-home'&&op.x===px0+8&&op.y===py0+8)&&lookout.x===px0+8&&lookout.y===py0+8`),'Village position also survives editing and exports under its own stable anchor');
console.log('PASS: three entrance trees, both extra-tree copies removed, Mosslet north beside blue mushroom, one active Mosslet throughout story progress, walkable village return and editable placements.');
