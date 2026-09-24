import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import zlib from 'node:zlib';
import {applyMoves} from '../tools/apply-editor-moves.mjs';
const empty={schema:1,maps:{},applied:[]},revision='a'.repeat(64);
const first={schema:1,id:'11111111-1111-4111-8111-111111111111',map:'tp1_sanctum',sourceRevision:revision,
  operations:[{kind:'actor',key:'statue:left',identity:'sentinel',fromX:100,fromY:200,x:100,y:170}]};
const a=applyMoves(empty,first,revision);
assert.equal(a.maps.tp1_sanctum['actor:statue:left'].y,170);
assert.deepEqual(empty,{schema:1,maps:{},applied:[]},'validation never mutates input');
assert.equal(applyMoves(a,first,revision),a,'retries are idempotent');
const next={...first,id:'22222222-2222-4222-8222-222222222222',operations:[{...first.operations[0],fromY:170,y:160}]};
const b=applyMoves(a,next,revision);assert.equal(b.maps.tp1_sanctum['actor:statue:left'].originY,200);
assert.throws(()=>applyMoves(a,{...next,sourceRevision:'old'},revision),/Game code has changed/);
assert.throws(()=>applyMoves(a,{...next,operations:[{...next.operations[0],fromY:200}]},revision),/already moved/);
assert.throws(()=>applyMoves(a,{...next,map:'__proto__'},revision),/Invalid map/);
assert.throws(()=>applyMoves(a,{...next,operations:[{...next.operations[0],x:NaN}]},revision),/coordinates/);
assert.throws(()=>applyMoves(a,{...next,operations:[{kind:'shell',key:'x'}]},revision),/Unsupported editor operation/);
const ctx=vm.createContext({console,fetch:()=>{throw Error('Local saves must not send anything');},localStorage:{getItem:()=>null,setItem:()=>{}}});
vm.runInContext(fs.readFileSync(new URL('../js/editor-drafts.js',import.meta.url),'utf8'),ctx);
vm.runInContext(`const stored=new Map();const s=EmberEditDrafts.createStore({getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)});s.put('room-a',{moves:[1]});s.put('room-b',{moves:[2]});s.remove('room-a');if(s.get('room-b').moves[0]!==2)throw Error('Drafts crossed maps');const restored=EmberEditDrafts.createStore({getItem:k=>stored.get(k),setItem:()=>{}});if(restored.get('room-b').moves[0]!==2)throw Error('Reload lost edits');`,ctx);
const actor={spr:'sentinel',editKey:'statue:left',x:100,y:200,moveBlocks:[0]};
Object.assign(ctx,{m:{roomActors:[actor],roomBlocks:[[90,180,110,200]],npcs:[],objs:[]},shiftActorData(m,o,x,y){const dx=x-o.x,dy=y-o.y;o.x=x;o.y=y;for(const i of o.moveBlocks||[]){m.roomBlocks[i]=m.roomBlocks[i].map((v,j)=>v+(j%2?dy:dx));}}});
vm.runInContext(fs.readFileSync(new URL('../js/published-editor-layouts.js',import.meta.url),'utf8'),ctx);
ctx.layouts=b;vm.runInContext(`publishedEditorLayouts=layouts;applyPublishedEditorLayout(m,'tp1_sanctum');applyPublishedEditorLayout(m,'tp1_sanctum');`,ctx);
assert.equal(actor.y,160);assert.deepEqual(ctx.m.roomBlocks[0],[90,140,110,160],'collision follows once');
console.log('PASS: manual storage, reload, map isolation, published collision, retry, stale-source, conflict and invalid-input checks.');

// Exercise the actual game hooks, including absolute actor/collision restoration.
const disk=new Map(),read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function gameContext(){
  const c=vm.createContext({console,crypto:webcrypto,setTimeout:()=>0,clearTimeout(){},
    localStorage:{getItem:k=>disk.get(k)||null,setItem:(k,v)=>disk.set(k,v)},
    document:{getElementById:()=>({}),addEventListener(){}},window:{addEventListener(){}},
    tap(){},toast(){},rebuildSolid(){},worldChanged(){},saveGeometry(){},
    fetch(){throw Error('Draft hooks sent data without a button press');}});
  const run=code=>vm.runInContext(code,c);
  run(read('js/editor-drafts.js'));
  run(`var actorLayouts={},geometryEdits={},MD=null,MAPID='',TS=16,PXW=400,PXH=400,mapDirty=false;
    var editing=true,building=false,painting=false,doorEdit=false,collideView=false;
    var MW=25,MH=25,terrOrig=new Uint8Array(625),npcs=[],objs=[],ORIG=[],added=[],deleted=new Set(),nextId=0,painted=new Map(),features=[],featOrig=new Map(),regionMoves=[],clearedBoxes=[],felledNew=[],decorGone=new Set(),decorDel=[],decorMoved=new Map(),scat=[],sanm=[],terr=[],felled=new Set();
    class CanvasStandIn{};
    var W={maps:{a:{w:25,h:25,objs:[1,40,40],npcs:[],doors:[],roomActors:[{editKey:'statue',spr:'sentinel',x:100,y:200,interiorFurniture:true,moveBlocks:[0],extractedCanvas:new CanvasStandIn()}],roomBlocks:[[90,180,110,200]],scatter:[2,60,60],sanim:[],features:[],terr:'0.625'},b:{w:25,h:25,objs:[1,20,20],npcs:[],roomActors:[],roomBlocks:[],doors:[],scatter:[],sanim:[],features:[],terr:'0.625'}}};
    var NAMES=['unused','prop','tree'];var TCHAR={0:'g',1:'d',4:'w'};`);
  const game=read('js/generated/game-part-2.js');
  run(game.slice(game.indexOf('function geometryPatch('),game.indexOf('// Illustrated atlas:')));
  run(game.slice(game.indexOf('function editorActorInfo('),game.indexOf('function pickEditorActor(')));
  run(game.slice(game.indexOf('function buildPatch('),game.indexOf('const dumpEl =')));
  run(read('js/published-editor-layouts.js'));run(read('js/editor-draft-integration.js'));
  run(`function visit(id,fresh=false){saveEditorDraft();editorDraftReady=false;MAPID=id;MD=W.maps[id];terr=new Uint8Array(625);const s=editorPrepareMap(id,fresh);applyActorLayout(MD,id);
    ORIG=[];for(let i=0;i<MD.objs.length;i+=3)ORIG.push({s:MD.objs[i],x:MD.objs[i+1],y:MD.objs[i+2]});objs=ORIG.map((o,id)=>({...o,id}));added=[];deleted=new Set();nextId=ORIG.length;painted=new Map();features=[];featOrig=new Map();decorGone=new Set();decorDel=[];decorMoved=new Map();scat=MD.scatter.slice();sanm=[];editorRestoreMap(s);applyEditorPaint(true);}`);
  return {c,run};
}
let g=gameContext();
g.run(`visit('a');moveEditorActor(MD.roomActors[0],110,170,true);objs[0].x=56;saveEditorDraft();visit('b');objs[0].y=32;saveEditorDraft();visit('a');`);
assert.equal(g.run('MD.roomActors[0].y'),170);assert.equal(g.run('objs[0].x'),56);assert.equal(g.run('MD.roomBlocks[0][1]'),150);
g=gameContext();g.run(`visit('a');`);
assert.equal(g.run('MD.roomActors[0].y'),170,'actor draft survives a browser reload');
assert.equal(g.run('objs[0].x'),56,'ordinary prop survives reload');
assert.equal(g.run('MD.roomBlocks[0][1]'),150,'collision restored exactly once');
g.run(`visit('a',true);`);
assert.equal(g.run('MD.roomActors[0].y'),200,'reset restores authored position');
assert.equal(g.run('MD.roomBlocks[0][1]'),180,'reset restores collision');
assert(g.run('MD.roomActors[0].extractedCanvas instanceof CanvasStandIn'),'reset preserves actual image/canvas objects');
g.run(`visit('b');`);assert.equal(g.run('objs[0].y'),32,'reset does not discard another area');
console.log('PASS: real game hooks preserve actors, props, collision and artwork across map switches, reloads and per-area reset.');

await import('./editor-direct-send.mjs');

const edits={...first,id:'33333333-3333-4333-8333-333333333333',operations:[
  {...first.operations[0],deleted:true},
  {kind:'object',key:'0',sprite:1,fromX:40,fromY:40,x:40,y:40,deleted:true},
  {kind:'decor',key:'s0',tag:'s',index:0,sprite:2,fromX:60,fromY:60,x:60,y:60,deleted:true},
  {kind:'feature-delete',key:'3,4',tx:3,ty:4},
  {kind:'paint',start:26,width:25,height:25,values:[4,4,1],before:[0,0,0]},
]};
const changed=applyMoves(empty,edits,revision);
assert.equal(changed.maps.tp1_sanctum['paint:27'].value,4);
assert(changed.maps.tp1_sanctum['object:0'].deleted);
assert.equal(applyMoves(changed,edits,revision),changed,'delete/paint retries are idempotent');
assert.throws(()=>applyMoves(changed,{...edits,id:next.id,operations:[{kind:'paint',start:26,width:25,height:25,values:[1],before:[0]}]},revision),/newer submission/);
assert.throws(()=>applyMoves(empty,{...edits,operations:[{kind:'paint',start:26,width:25,height:25,values:[90],before:[0]}]},revision),/terrain type/);
assert.throws(()=>applyMoves(empty,{...edits,operations:[{kind:'paint',start:624,width:25,height:25,values:[1,1],before:[0,0]}]},revision),/paint run/);
const paintContext=vm.createContext({console});
vm.runInContext(read('js/published-editor-layouts.js'),paintContext);
paintContext.data=changed;
vm.runInContext(`var MW=25,MH=25,terr=new Uint8Array(625),terrOrig=null,painted=new Map();
 var MD={w:25,h:25,roomActors:[{editKey:'statue:left',spr:'sentinel',x:100,y:200,interiorFurniture:true,moveBlocks:[0]}],roomBlocks:[[90,180,110,200]],objs:[1,40,40],scatter:[2,60,60],sanim:[],npcs:[]};
 function shiftActorData(m,a,x,y){a.x=x;a.y=y;}publishedEditorLayouts=data;applyPublishedEditorLayout(MD,'tp1_sanctum');applyEditorPaint(true);`,paintContext);
assert(vm.runInContext('MD.roomActors[0].editorDeleted',paintContext));
assert.equal(vm.runInContext('MD.roomBlocks[0][0]',paintContext),-99999,'deleted furniture collision is removed');
assert.equal(vm.runInContext('MD.editorDeletedObjects[0]',paintContext),0,'object index retained as a tombstone');
assert.equal(vm.runInContext('MD.editorDeletedDecor[0]',paintContext),'s0');
assert.equal(vm.runInContext('MD.felled[0]',paintContext),'3,4');
assert.equal(vm.runInContext('terr[26]',paintContext),4);
assert.equal(vm.runInContext('terrOrig[26]',paintContext),4,'published paint is the next local draft baseline');
vm.runInContext('painted.set(27,1);terr.fill(0);applyEditorPaint();',paintContext);
assert.equal(vm.runInContext('terr[26]',paintContext),4,'published paint survives terrain regeneration');
assert.equal(vm.runInContext('terr[27]',paintContext),1,'local experiment stays above published paint');
console.log('PASS: Delete and Paint round trips, furniture collision removal, object/scenery tombstones, generated-tree deletion, paint regeneration, stale-tile conflicts and retry.');
g=gameContext();g.run(`visit('a',true);deleted.add(0);objs=[];decorGone.add('s0');decorDel.push(['s',60,60]);painted.set(26,4);terr[26]=4;actorLayouts.a={statue:{x:100,y:200,deleted:true}};saveEditorDraft();visit('b');visit('a');`);
assert.equal(g.run('objs.length'),0);assert(g.run("decorGone.has('s0')"));assert.equal(g.run('terr[26]'),4);
g=gameContext();g.run("visit('a');");assert.equal(g.run('objs.length'),0);assert.equal(g.run('terr[26]'),4);assert(g.run('MD.roomActors[0].editorDeleted'));
assert.equal(g.run('terrOrig[26]'),0,'unsent paint does not become the published baseline');
assert.equal(g.run("EmberEditDrafts.store.get('a').operations.find(o=>o.kind==='paint').before[0]"),0);
g.run("visit('a',true);");assert.equal(g.run('terr[26]'),0);assert.equal(g.run('objs.length'),1);assert(!g.run('MD.roomActors[0].editorDeleted'));
console.log('PASS: unsent Delete and Paint survive map switches and reloads, keep their original baseline, and reset only the current area.');

// Tree moves were encoded as K + A, so the old gate wrongly called them Build.
g=gameContext();g.run(`visit('a',true);felledNew=['3,4'];added=[{id:1,s:2,x:80,y:96}];objs.push(added[0]);nextId=1;saveEditorDraft();`);
const treeDraft=JSON.parse(g.run("JSON.stringify(EmberEditDrafts.store.get('a'))"));
assert.equal(g.run("editorUnsupportedEdits(buildPatch(true))"),'');
assert(treeDraft.operations.some(o=>o.kind==='object-add'));assert(treeDraft.operations.some(o=>o.kind==='feature-delete'));
const treeKey=treeDraft.operations.find(o=>o.kind==='object-add').key;
g.run('saveEditorDraft();');assert.equal(g.run("EmberEditDrafts.store.get('a').operations.find(o=>o.kind==='object-add').key"),treeKey);
g=gameContext();g.run("visit('a');");assert.equal(g.run('added[0].editorKey'),treeKey);assert.equal(g.run('nextId'),2,'old tree-move drafts cannot reuse an object ID');
const treeSubmission={...first,map:'a',operations:treeDraft.operations};
const treeLayout=applyMoves(empty,treeSubmission,revision);
assert.equal(applyMoves(treeLayout,treeSubmission,revision),treeLayout);
const treeMap={objs:[1,40,40],scatter:[],sanim:[],roomActors:[],npcs:[]};
const treeVm=vm.createContext({console,m:treeMap,data:treeLayout});vm.runInContext(read('js/published-editor-layouts.js'),treeVm);
vm.runInContext("publishedEditorLayouts=data;applyPublishedEditorLayout(m,'a');applyPublishedEditorLayout(m,'a');",treeVm);
assert.deepEqual(treeMap.objs,[1,40,40,2,80,96]);assert.deepEqual([...treeMap.felled],['3,4']);
const treeLater=applyMoves(treeLayout,{...next,map:'a',operations:[{kind:'object',key:'1',sprite:2,fromX:80,fromY:96,x:88,y:96}]},revision);
const laterMap={objs:[1,40,40],scatter:[],sanim:[],roomActors:[],npcs:[]};treeVm.m=laterMap;treeVm.data=treeLater;
vm.runInContext("publishedEditorLayouts=data;applyPublishedEditorLayout(m,'a');",treeVm);assert.deepEqual(laterMap.objs,[1,40,40,2,88,96]);
assert.throws(()=>applyMoves(empty,{...first,operations:[{kind:'object-add',key:treeKey,sprite:2,x:NaN,y:12}]},revision),/coordinates/);
assert.throws(()=>applyMoves(empty,{...first,operations:[{kind:'object-add',key:'__proto__',sprite:2,x:10,y:12}]},revision),/identity/);
// Box deletion already expands into structured deletions and paint operations.
g.run(`clearedBoxes=[[2,2,4,4]];deleted.add(0);objs=objs.filter(o=>o.id!==0);saveEditorDraft();`);
assert.equal(g.run('editorUnsupportedEdits(buildPatch(true))'),'');
assert(g.run("EmberEditDrafts.store.get('a').operations.some(o=>o.kind==='object'&&o.deleted)"));
console.log('PASS: generated-tree moves/additions survive reload, publish both ends, retry once, remain movable after publication, and support box deletions.');

// An old device override already merged into the authored map is not a new edit.
g=gameContext();g.run(`visit('b',true);MD.doors=[{x:2,y:3}];MD.collisionOverrides={'1,2':false};geometryEdits.b={doors:{0:{x:32,y:48,w:16,h:16}},collision:{'1,2':false}};objs[0].x=28;`);
assert.equal(g.run("geometryPatch('b').length"),0);
assert.equal(g.run('editorUnsupportedEdits(buildPatch(true))'),'');
g.run("geometryEdits.b.doors[0].x=40;");assert.equal(g.run('editorUnsupportedEdits(buildPatch(true))'),'1 door edit');
g.run("geometryEdits.b.collision['1,2']=true;");assert.equal(g.run('editorUnsupportedEdits(buildPatch(true))'),'1 door edit, 1 collision edit');
assert.equal(g.run("editorUnsupportedEdits('EMBERFELL PATCH v3\\nMAP b\\nR 1 2 3 4 5 6\\nF arena 1 2 3 4 5')"),'2 Build/area edits');
console.log('PASS: already-published geometry does not block moves; genuinely unsent door/collision/area edits are identified precisely.');

// Exercise real Forgewick market actors and NPCs through the draft/apply path.
const worldSource=read('js/generated/game-part-1.js'),worldData=JSON.parse(zlib.gunzipSync(Buffer.from(worldSource.match(/const W_GZ = "([^"]+)"/)[1],'base64')));
const bootCode=read('js/generated/game-part-2.js'),worldVm=vm.createContext({W:worldData,atob:s=>Buffer.from(s,'base64').toString('binary')});
vm.runInContext(bootCode.slice(bootCode.indexOf('  for (const mid in W.maps) {'),bootCode.indexOf('  installKnightEncounter(); numberAllArenas();')),worldVm);
const market=worldData.maps.world;
g=gameContext();g.run(`W.maps.world=JSON.parse(${JSON.stringify(JSON.stringify(market))});NAMES=JSON.parse(${JSON.stringify(JSON.stringify(worldData.names))});visit('world');PXW=MD.w*16;PXH=MD.h*16;npcs=MD.npcs.map(n=>({...n}));
 var marketActors=MD.roomActors.filter(a=>/^market_/.test(a.spr||''));
 var marketPeople=npcs.filter(n=>n.x>11500&&n.x<14000&&n.y>2400&&n.y<4200);
 for(const a of marketActors)moveEditorActor(a,Math.round(a.x+12),Math.round(a.y+16),true);
 for(const n of marketPeople)moveEditorActor(n,Math.round(n.x+8),Math.round(n.y+12),true);
 saveEditorDraft();`);
assert.equal(g.run('marketActors.length'),5);assert(g.run('marketPeople.length')>=5);
assert.equal(g.run('editorUnsupportedEdits(buildPatch(true))'),'','market actors and NPCs must not trigger unsupported-edit warning');
const marketDraft=JSON.parse(g.run("JSON.stringify(EmberEditDrafts.store.get('world'))"));
assert.equal(marketDraft.operations.length,g.run('marketActors.length+marketPeople.length'));
const marketPublished=applyMoves(empty,{...first,map:'world',operations:marketDraft.operations},revision);
g.run(`var marketFresh=JSON.parse(${JSON.stringify(JSON.stringify(market))});publishedEditorLayouts=JSON.parse(${JSON.stringify(JSON.stringify(marketPublished))});MD=null;npcs=[];applyPublishedEditorLayout(marketFresh,'world');`);
for(const op of marketDraft.operations){
  const expected=JSON.stringify({x:op.x,y:op.y});
  assert.equal(g.run(`JSON.stringify((()=>{const o=${JSON.stringify(op.key)}.startsWith('npc:')?marketFresh.npcs.find(n=>'npc:'+n.n===${JSON.stringify(op.key)}):marketFresh.roomActors.find((a,i)=>(a.editKey||'actor:'+i+':'+a.spr)===${JSON.stringify(op.key)});return {x:o.x,y:o.y};})())`),expected);
}
console.log('PASS: all five Forgewick market stalls and nearby NPC moves export and publish through the actual editor hooks.');
