import assert from 'node:assert/strict';
import {validateDraftTargets} from '../tools/editor-source-compatibility.mjs';
import {applyMoves} from '../tools/apply-editor-moves.mjs';
const B=globalThis.EmberBuildData;
const arena={kind:'arena',id:12,x:10,y:10,r:6,style:'winter',encounter:'fox'};
const state={map:{w:25,h:25,terr:'0.625',objs:[1,40,40],scatter:[2,60,60],sanim:[],
  roomActors:[],npcs:[{n:'Resident',x:80,y:80,d:['New dialogue'],packSpr:'new_art'}],
  features:[arena],doors:[{x:2,y:3,to:'room'}]},terrain:new Uint8Array(625),sprites:['unused','prop'],looks:['pack:resident'],sources:{room:[{n:'Visitor'}]}};
const operations=[{kind:'object',key:'0',sprite:1,fromX:40,fromY:40,x:56,y:40},
  {kind:'actor',key:'npc:Resident',identity:'Resident',fromX:80,fromY:80,x:96,y:80},
  {kind:'decor',key:'s0',tag:'s',index:0,sprite:2,fromX:60,fromY:60,x:76,y:60},
  {kind:'door',key:'0',index:0,to:'room',before:{x:32,y:48,w:16,h:16},rect:{x:48,y:48,w:16,h:16}},
  {kind:'paint',start:26,width:25,height:25,before:[0],values:[1]},
  {kind:'collision',key:'2,3',before:null,blocked:false},
  {kind:'arena',key:'12',id:12,before:arena,encounter:'hare'}];
const draft={schema:1,id:'11111111-1111-4111-8111-111111111111',map:'a',sourceRevision:'older-code',operations};
const empty={schema:1,maps:{},applied:[]};
const result=applyMoves(empty,draft,'new-code',(_base,d)=>validateDraftTargets(d,state));
assert.equal(result.maps.a['actor:npc:Resident'].x,96,'Changed art/dialogue does not reject valid moves');
assert.equal(result.maps.a['arena:12'].encounter,'hare');
assert.equal(state.map.features[0].encounter,'fox','Validation does not mutate game state');
for(const mutate of [s=>s.map.objs[1]++,s=>s.map.objs[0]++,s=>s.map.npcs[0].x++,s=>s.map.npcs[0].editorDeleted=true,
  s=>s.map.scatter[0]++,s=>s.map.doors[0].to='different',s=>s.map.doors[0].x+=2,s=>s.terrain[26]=2,
  s=>s.map.w=26,s=>s.map.collisionOverrides={'2,3':true},s=>s.map.features[0].r=8]){
  const changed=structuredClone(state);mutate(changed);
  assert.throws(()=>applyMoves(empty,draft,'new-code',(_base,d)=>validateDraftTargets(d,changed)),/Editor conflict/);
  assert.equal(empty.applied.length,0,'Conflicts cannot partially publish');
}
const before=B.snapshot(state.map),after=structuredClone(before);after.features[0].r=7;
const buildDraft={...draft,operations:[{kind:'build',layout:B.hash({}),before:B.hash(before),after:B.hash(after),changes:B.diff(before,after)}]};
applyMoves(empty,buildDraft,'new-code',(_base,d)=>validateDraftTargets(d,state));
assert.throws(()=>validateDraftTargets(buildDraft,{...state,map:{...state.map,objs:[1,41,40]}}),/Build baseline changed/);
const later={...draft,id:'22222222-2222-4222-8222-222222222222',operations:[{...operations.at(-1),before:{...arena,encounter:'hare'},encounter:'bird'}]};
const twice=applyMoves(result,later,'older-code');
assert.equal(twice.maps.a['arena:12'].before.encounter,'fox','Repeated sends retain the authored arena anchor');
assert.equal(twice.maps.a['arena:12'].encounter,'bird');
assert.throws(()=>applyMoves(result,{...later,operations:[operations.at(-1)]},'older-code'),/newer submission/);
console.log('PASS: compatible code changes publish; moved/deleted actors, changed scenery, doors, terrain, arenas and Build baselines fail atomically.');
