import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import zlib from 'node:zlib';
import {applyMoves,decodeDraft} from '../tools/apply-editor-moves.mjs';
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
export function gameContext(){
  const c=vm.createContext({console,CompressionStream,Blob,Response,TextEncoder,btoa:s=>Buffer.from(s,'binary').toString('base64'),crypto:webcrypto,setTimeout:()=>0,clearTimeout(){},
    localStorage:{getItem:k=>disk.get(k)||null,setItem:(k,v)=>disk.set(k,v)},
    document:{getElementById:()=>({}),addEventListener(){}},window:{addEventListener(){}},
    tap(){},toast(){},rebuildSolid(){},worldChanged(){},saveGeometry(){},
    fetch(){throw Error('Draft hooks sent data without a button press');}});
  const run=code=>vm.runInContext(code,c);
  run(read('js/editor-build-data.js'));run(read('js/editor-drafts.js'));
  run(`var actorLayouts={},geometryEdits={},MD=null,MAPID='',TS=16,PXW=400,PXH=400,mapDirty=false;
    var editing=true,building=false,painting=false,doorEdit=false,collideView=false;
    var MW=25,MH=25,terrOrig=new Uint8Array(625),npcs=[],objs=[],ORIG=[],added=[],deleted=new Set(),nextId=0,painted=new Map(),baseTerr=new Uint8Array(625),decks=[],features=[],featOrig=new Map(),regionMoves=[],clearedBoxes=[],felledNew=[],decorGone=new Set(),decorDel=[],decorMoved=new Map(),scat=[],sanm=[],terr=[],felled=new Set();
    class CanvasStandIn{};
    var W={maps:{a:{w:25,h:25,objs:[1,40,40],npcs:[],doors:[],roomActors:[{editKey:'statue',spr:'sentinel',x:100,y:200,interiorFurniture:true,moveBlocks:[0],extractedCanvas:new CanvasStandIn()}],roomBlocks:[[90,180,110,200]],scatter:[2,60,60],sanim:[],features:[],terr:'0.625'},b:{w:25,h:25,objs:[1,20,20],npcs:[],roomActors:[],roomBlocks:[],doors:[],scatter:[],sanim:[],features:[],terr:'0.625'}}};
    var NAMES=['unused','prop','tree'];var TCHAR={0:'g',1:'d',4:'w'};`);
  const game=read('js/generated/game-part-2.js');
  run(game.slice(game.indexOf('function geometryPatch('),game.indexOf('// Illustrated atlas:')));
  run(game.slice(game.indexOf('function editorActorInfo('),game.indexOf('function pickEditorActor(')));
  run(game.slice(game.indexOf('function buildPatch('),game.indexOf('const dumpEl =')));
  const part3=read('js/generated/game-part-3.js');run(part3.slice(part3.indexOf('function terrRLE('),part3.indexOf('const RUN_SPR =')));
  run(read('js/published-editor-layouts.js'));run(read('js/editor-draft-integration.js'));
  run(`function visit(id,fresh=false){saveEditorDraft();editorDraftReady=false;MAPID=id;MD=W.maps[id];if(typeof preparePublishedNpcPlacements==='function')applyPublishedEditorLayout(MD,id);const s=editorPrepareMap(id,fresh);if(typeof prepareLocalNpcPlacements==='function')prepareLocalNpcPlacements(MD,id,s);MW=MD.w;MH=MD.h;const decode=s=>Uint8Array.from(s.split('|').flatMap(p=>{const [v,n]=p.split('.').map(Number);return Array(n).fill(v)}));terr=decode(MD.terr);baseTerr=decode(MD.base_terr||MD.terr);decks=MD.decks||[];applyActorLayout(MD,id);
    ORIG=[];for(let i=0;i<MD.objs.length;i+=3)ORIG.push({s:MD.objs[i],x:MD.objs[i+1],y:MD.objs[i+2]});objs=ORIG.map((o,id)=>({...o,id}));added=[];deleted=new Set();nextId=ORIG.length;painted=new Map();features=EmberEditDrafts.clone(MD.features||[]);featOrig=new Map(features.map(f=>[f.id,JSON.stringify(f)]));decorGone=new Set();decorDel=[];decorMoved=new Map();scat=MD.scatter.slice();sanm=(MD.sanim||[]).slice();felled=new Set((MD.felled||[]).map(f=>Array.isArray(f)?f.join(','):f));for(const run of (MD.felled_rle||'').split('|').filter(Boolean)){const [y,xs]=run.split(':'),[a,b=a]=xs.split('-').map(Number);for(let x=a;x<=b;x++)felled.add(x+','+y)}editorRestoreMap(s);applyEditorPaint(true);}`);
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
assert(g.run("EmberEditDrafts.store.get('a').operations.some(o=>o.kind==='object'&&o.deleted)"));
console.log('PASS: generated-tree moves/additions survive reload, publish both ends, retry once, remain movable after publication, and support box deletions.');

// An old device override already merged into the authored map is not a new edit.
g=gameContext();g.run(`visit('b',true);MD.doors=[{x:2,y:3}];MD.collisionOverrides={'1,2':false};geometryEdits.b={doors:{0:{x:32,y:48,w:16,h:16}},collision:{'1,2':false}};objs[0].x=28;`);
assert.equal(g.run("geometryPatch('b').length"),0);
console.log('PASS: already-published geometry is omitted from the next submission.');

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
const marketDraft=JSON.parse(g.run("JSON.stringify(EmberEditDrafts.store.get('world'))"));
assert.equal(marketDraft.operations.length,g.run('marketActors.length+marketPeople.length'));
const marketPublished=applyMoves(empty,{...first,map:'world',operations:marketDraft.operations},revision);
g.run(`var marketFresh=JSON.parse(${JSON.stringify(JSON.stringify(market))});publishedEditorLayouts=JSON.parse(${JSON.stringify(JSON.stringify(marketPublished))});MD=null;npcs=[];applyPublishedEditorLayout(marketFresh,'world');`);
for(const op of marketDraft.operations){
  const expected=JSON.stringify({x:op.x,y:op.y});
  assert.equal(g.run(`JSON.stringify((()=>{const o=${JSON.stringify(op.key)}.startsWith('npc:')?marketFresh.npcs.find(n=>'npc:'+n.n===${JSON.stringify(op.key)}):marketFresh.roomActors.find((a,i)=>(a.editKey||'actor:'+i+':'+a.spr)===${JSON.stringify(op.key)});return {x:o.x,y:o.y};})())`),expected);
}
console.log('PASS: all five Forgewick market stalls and nearby NPC moves export and publish through the actual editor hooks.');

// Saved geometry joins ordinary moves in the actual SEND CHANGES submission.
disk.clear();g=gameContext();
g.run(`W.maps.a.doors=[{x:2,y:3,to:'b'}];visit('a');
 geometryEdits.a={doors:{0:{x:40,y:48,w:24,h:16}},collision:{'6,7':false}};
 objs[0].x=64;visit('b');visit('a');
 EmberEditDrafts.connected=()=>true;EmberEditDrafts.send=d=>{globalThis.sent=d};sendEditorChanges();`);
const geometryDraft=JSON.parse(g.run('JSON.stringify(sent)'));
assert.deepEqual(geometryDraft.operations.map(o=>o.kind),['object','door','collision']);
const geometryPublished=applyMoves(empty,{...geometryDraft,sourceRevision:revision},revision);
g.c.geometryPublished=geometryPublished;
g.run(`var doorMap=EmberEditDrafts.clone(editorDraftBases.get('a').map);publishedEditorLayouts=geometryPublished;applyPublishedEditorLayout(doorMap,'a');`);
assert.equal(g.run('doorMap.objs[1]'),64);assert.equal(g.run('doorMap.doors[0].triggerRect.x'),40);
assert.equal(g.run("doorMap.collisionOverrides['6,7']"),false);
assert.equal(applyMoves(geometryPublished,{...geometryDraft,sourceRevision:revision},revision),geometryPublished);
assert.throws(()=>applyMoves(geometryPublished,{...next,map:'a',operations:[{...geometryDraft.operations[1],before:{x:1,y:2,w:16,h:16},rect:{x:50,y:60,w:16,h:16}}]},revision),/newer submission/);
g.run(`geometryEdits.a.collision['6,7']=true;editorPrepareMap('a');`);
assert.equal(g.run('geometryEdits.a.doors[0]'),undefined,'successful publication clears the matching local door override');
assert.equal(g.run("geometryEdits.a.collision['6,7']"),true,'newer unsent collision experiments survive publication');
console.log('PASS: Send Changes includes saved Doors, Collision and moves together across map switches, validates conflicts, and clears only published geometry.');

function installBuildHooks(g){
 const s=read('js/generated/game-part-3.js');
 g.run(`var GRASS=0,WALL=2,RIM=1,MAX_SIDE=4000,MAX_AREA=4000000,solid,chunks=new Map(),buildUndo=[];
 function indexScatter(){}function indexDecks(){}function sealRim(){}function openTo(){return 0}
 function realizeFeatures(){}function isArea(f){return f.kind==='area'}`);
 for(const [start,end]of [['function growWorld(','function contentExtent('],['function moveArea(','function sowDesertRoute('],['function moveRegion(','function unfell('],['function scaleAreaContents(','function relayNorthRidge(']])g.run(s.slice(s.indexOf(start),s.indexOf(end)));
 g.run(`var RUN_SPR=/^never-match$/;`);
}
function buildFixture(g){g.run(`W.maps.a.features=[{id:1,kind:'area',x0:2,y0:2,x1:5,y1:5,carve:false}];W.maps.a.npcs=[{n:'Seller',x:40,y:48,d:'Keep my dialogue'}];W.maps.a.decks=[{x0:3,y0:3,x1:4,y1:4}];`);}
function draftOf(g){return JSON.parse(g.run("JSON.stringify(EmberEditDrafts.store.get('a'))"));}
function publishedMap(layout,base){
 const g=gameContext();g.c.layout=layout;g.c.base=structuredClone(base);
 g.run("publishedEditorLayouts=layout;applyPublishedEditorLayout(base,'a');");return JSON.parse(g.run('JSON.stringify(base)'));
}
disk.clear();g=gameContext();installBuildHooks(g);buildFixture(g);
const authored=JSON.parse(g.run('JSON.stringify(W.maps.a)'));
g.run(`visit('a');npcs=MD.npcs.map(n=>({...n}));baseTerr[3*MW+3]=1;
 moveArea(features[0],2,2,false);painted.set(7*MW+7,4);terr[7*MW+7]=4;saveEditorDraft();`);
const builtDraft=draftOf(g),buildOp=builtDraft.operations[0];
assert.equal(buildOp.kind,'build');assert.equal(builtDraft.operations[1].kind,'actor');
assert.equal(g.run('objs[0].x'),72);assert.equal(g.run('npcs[0].x'),72);
assert.equal(g.run('scat[1]'),92);assert.equal(g.run('decks[0].x0'),5);
g.run(`visit('b');visit('a');`);
assert.equal(g.run('objs[0].x'),72);assert.equal(g.run('features[0].x0'),4);
assert.equal(g.run('baseTerr[5*MW+5]'),1);assert.equal(g.run('terr[7*MW+7]'),4);
g=gameContext();buildFixture(g);g.run(`visit('a');saveEditorDraft();`);
assert.equal(g.run('objs[0].x'),72,'Build object moves survive browser reload');
assert.equal(g.run('MD.npcs[0].x'),72);assert.equal(g.run('MD.npcs[0].d'),'Keep my dialogue');
assert.equal(draftOf(g).operations[0].after,buildOp.after,'Build restore/resave is stable');
const builtLayout=applyMoves(empty,{...first,map:'a',operations:builtDraft.operations},revision);
const builtMap=publishedMap(builtLayout,authored);
assert.deepEqual(builtMap.objs,[1,72,72]);assert.equal(builtMap.features[0].x0,4);assert.equal(builtMap.decks[0].x0,5);
assert.equal(builtMap.npcs[0].x,72);assert.equal(builtMap.editorPublishedPaint[0].value,4);
g.run(`visit('a',true);`);assert.equal(g.run('objs[0].x'),40);assert.equal(g.run('features[0].x0'),2);
console.log('PASS: actual area moves carry props, NPCs, scenery, decks, terrain and paint through local map changes, reload, publishing and reset.');

// Later ordinary edits and subsequent Build submissions compose with earlier ones.
const B=globalThis.EmberBuildData;
const ordinaryLayout=applyMoves(builtLayout,{...next,map:'a',operations:[{kind:'object',key:'0',sprite:1,fromX:72,fromY:72,x:80,y:72}]},revision);
const ordinaryMap=publishedMap(ordinaryLayout,authored);assert.equal(ordinaryMap.objs[1],80);
const before=B.snapshot(ordinaryMap),after=structuredClone(before);after.features.push({id:2,kind:'route',x0:4,y0:6,x1:12,y1:6,w:4,band:2,pts:[[4,6],[12,6]]});after.features.push({id:3,kind:'arena',x:12,y:6,r:6});
const secondBuild={kind:'build',layout:B.hash(ordinaryLayout.maps.a),before:B.hash(before),after:B.hash(after),changes:B.diff(before,after)};
const secondLayout=applyMoves(ordinaryLayout,{...edits,map:'a',operations:[secondBuild]},revision);
const secondMap=publishedMap(secondLayout,authored);
assert.deepEqual(B.snapshot(secondMap),after);
assert.throws(()=>applyMoves(builtLayout,{...edits,map:'a',operations:[secondBuild]},revision),/published since/);
assert.throws(()=>B.validate([{path:['features','__proto__','polluted'],value:true}]),/Invalid Build/);
assert.throws(()=>B.validate([{path:['script'],value:'arbitrary code'}]),/Invalid Build/);
assert.throws(()=>B.apply(before,{before:B.hash(before),after:'bad',changes:[{path:['terr'],value:'0.3'}]}),/Terrain size/);
console.log('PASS: routes/arenas and repeated Build submissions preserve prior edits, and stale layouts or unsafe data are rejected.');

// Different authored/rendered ground and fractional scenery must not turn a
// small feature edit into a replacement of the entire map.
disk.clear();g=gameContext();g.run(`W.maps.a.base_terr='0.625';W.maps.a.terr='1.625';W.maps.a.objs[1]=40.25;visit('a');
 features.push({id:901,kind:'route',x0:4,y0:6,x1:12,y1:6,w:4,band:2,style:'forest',pts:[[4,6],[8,8],[12,6]]});
 features.push({id:902,kind:'arena',x:12,y:6,r:6,style:'forest'});saveEditorDraft();`);
const featureDraft=draftOf(g),featureBuild=featureDraft.operations[0];
assert(!featureBuild.changes.some(c=>['terr','base_terr','objs'].includes(c.path[0])));
const featureBase=JSON.parse(g.run("JSON.stringify(editorDraftBases.get('a').map)"));
const featureMap=publishedMap(applyMoves(empty,{...first,map:'a',operations:featureDraft.operations},revision),featureBase);
assert.deepEqual(featureMap.features.map(f=>f.kind),['route','arena']);assert.equal(featureMap.objs[1],40.25);
assert.deepEqual(featureMap.features[0].pts,[[4,6],[8,8],[12,6]]);
g.run(`EmberEditDrafts.connected=()=>true;EmberEditDrafts.send=d=>{globalThis.sent=d};sendEditorChanges();`);
assert(Buffer.byteLength(await g.run('EmberEditDrafts.encodeDraft(sent)'))<3000,'route and arena stay a small submission');
// COPY reflects the current area and forgets only the confirmed send, including
// when another edit is made while GitHub is still finishing that send.
g.run(`globalThis.confirmed={id:sent.id,map:'a',patch:sent.patch,published:true};
 features.push({id:903,kind:'arena',x:4,y:10,r:3,style:'forest'});saveEditorDraft();
 var statusPanel={children:[{},{style:{},removeAttribute(){}},{},{}]};document.getElementById=()=>statusPanel;
 editorSendStatus(true,'Published',confirmed);`);
assert(!g.run('editorCopyPatch()').includes('F route 901'));assert(g.run('editorCopyPatch()').includes('F arena 903'));
g.run(`saveEditorDraft();geometryEdits.b={collision:{'1,2':true}};`);
assert(!g.run('editorCopyPatch()').includes('COLLISION'));assert(!g.run('editorCopyPatch()').includes('F arena 902'));
g.run(`editorSendStatus(true,'Published',{...confirmed,patch:buildPatch(true)});`);
assert(g.run('editorCopyPatch()').endsWith('(no changes on this map)'));
console.log('PASS: bent routes and arenas publish compactly without rewriting terrain/scenery; COPY excludes confirmed edits and other maps.');

// Growth previously had no COPY row, so submission identity must use operations.
disk.clear();g=gameContext();installBuildHooks(g);g.run(`visit('a');growWorld(28,25);saveEditorDraft();
 EmberEditDrafts.connected=()=>true;EmberEditDrafts.send=d=>{globalThis.sent=d};sendEditorChanges();`);
const growFirst=draftOf(g);g.run(`growWorld(30,25);saveEditorDraft();`);const growSecond=draftOf(g);
assert.equal(growFirst.patch,growSecond.patch);assert.equal(growSecond.submission,null,'changed Build data must not reuse an old send ID');
g.run(`painted.set(31,4);terr[31]=4;growWorld(32,25);saveEditorDraft();visit('b');visit('a');`);
assert.equal(g.run('MW'),32);assert.equal(g.run('terr[33]'),4,'growing a map keeps paint at the same cell');
const grown=draftOf(g);const growthLayout=applyMoves(empty,{...first,map:'a',operations:grown.operations},revision);
const growthMap=publishedMap(growthLayout,{...authored,features:[],npcs:[],decks:[]});assert.equal(growthMap.w,32);
console.log('PASS: map expansion, paint indexing, saved dimensions and changed-submission identity round trip correctly.');

// The workflow decodes the same compressed payload the browser sends.
const large={...first,patch:'test'.repeat(20000),operations:secondLayout.maps.a.build.changes};g.c.large=large;
const encoded=await g.run('EmberEditDrafts.encodeDraft(large)');assert(encoded.startsWith('gzip:'));assert.deepEqual(decodeDraft(encoded),large);
assert.throws(()=>decodeDraft('x'.repeat(65001)),/submission size/);
console.log('PASS: large edit batches compress and decode exactly within GitHub input limits.');

for(const action of ['resize','region']){
 disk.clear();g=gameContext();installBuildHooks(g);buildFixture(g);g.run(`visit('a');npcs=MD.npcs.map(n=>({...n}));`);
 if(action==='resize')g.run(`scaleAreaContents({x0:32,y0:32,x1:96,y1:96},{x0:32,y0:32,x1:128,y1:128},0);features[0].x1=7;features[0].y1=7;`);
 else g.run(`moveRegion({x0:2,y0:2,x1:5,y1:5},2,2,false);`);
 g.run('saveEditorDraft();');const draft=draftOf(g),expected=JSON.parse(g.run('JSON.stringify({x:objs[0].x,y:objs[0].y,nx:npcs[0].x,ny:npcs[0].y})'));
 const layout=applyMoves(empty,{...first,map:'a',operations:draft.operations},revision),map=publishedMap(layout,authored);
 assert.equal(map.objs[1],expected.x);assert.equal(map.objs[2],expected.y);assert.equal(map.npcs[0].x,expected.nx);assert.equal(map.npcs[0].y,expected.ny);
 assert.equal(map.npcs[0].d,'Keep my dialogue');g.run(`visit('b');visit('a');saveEditorDraft();`);assert.equal(draftOf(g).operations[0].after,draft.operations[0].after);
}
console.log('PASS: actual area resize and box moves preserve their terrain, object/scenery arrangement and NPC dialogue.');

// Real world data catches large-map costs and RLE/baseline differences.
disk.clear();g=gameContext();g.c.world=structuredClone(market);g.run(`W.maps.world=world;visit('world');features.push({id:99999,kind:'arena',x:400,y:160,r:6,style:'forest'});saveEditorDraft();`);
const worldDraft=JSON.parse(g.run("JSON.stringify(EmberEditDrafts.store.get('world'))"));
const worldBuild=worldDraft.operations[0];assert.equal(worldBuild.kind,'build');assert.equal(B.encodeFelled(new Set([[2,3],'3,3','5,4'])),'3:2-3|4:5');
const worldEncoded=await g.run("EmberEditDrafts.encodeDraft(EmberEditDrafts.store.get('world'))");assert(Buffer.byteLength(worldEncoded)<65000);
const worldLayout=applyMoves(empty,{...first,map:'world',operations:worldDraft.operations},revision);
g.c.worldFresh=structuredClone(market);g.c.worldLayout=worldLayout;g.run(`publishedEditorLayouts=worldLayout;applyPublishedEditorLayout(worldFresh,'world');`);
assert.equal(g.run('worldFresh.features.at(-1).id'),99999);
console.log('PASS: an actual full-world Build edit fits the transport and applies to a clean world baseline.');

// Opening Build used to expand the entire world even when a small route was
// drawn far from its edges. Exercise the real button handler, then explicit growth.
disk.clear();g=gameContext();installBuildHooks(g);g.c.world=structuredClone(market);
g.run(`W.maps.world=world;visit('world');var oldWidth=MW,oldHeight=MH;
 var widget={style:{},classList:{add(){},remove(){},toggle(){}}};document.getElementById=()=>widget;
 var bEdit=widget,editEl=widget,drawA=null,drawB=null,drawArmed=false,areaMode=false,pickedArea=null,areaDrag=null,arenaMode=false,grabMode=false,grabRect=null,camFree=false;
 function closeOthers(){}function soloTool(){}function refreshToolbar(){}function setPaint(){}function setArmed(){}function clampCam(){}function refreshBuild(){}
 var COBBLE=2,FARM=3,WATER=4,BRIDGE=5;`);
const part3Build=read('js/generated/game-part-3.js');
g.run(part3Build.slice(part3Build.indexOf('function contentExtent('),part3Build.indexOf('const RIM =')));
g.run(bootCode.slice(bootCode.indexOf('const buildEl ='),bootCode.indexOf('tap(bBuild,')));
g.run('setBuild(true);saveEditorDraft()');
assert.equal(g.run('MW'),market.w);assert.equal(g.run('MH'),market.h,'opening Build does not expand the world');
assert.equal(g.run("EmberEditDrafts.store.get('world')"),null,'opening Build is not an edit');
g.run(`features.push({id:9155,kind:'arena',x:168,y:67,r:6.3,style:'birch',encounter:'deer'},{id:9156,kind:'arena',x:220,y:90,r:6.3,style:'birch',encounter:'fox'},{id:9157,kind:'arena',x:250,y:90,r:6.3,style:'birch',encounter:'bird'});saveEditorDraft();`);
let pending=JSON.parse(g.run("JSON.stringify(EmberEditDrafts.store.get('world'))"));
assert(!pending.operations[0].changes.some(c=>['w','h','terr','base_terr'].includes(c.path[0])));
const huntPublished=applyMoves(empty,{...first,map:'world',operations:pending.operations},revision);
g.c.huntPublished=huntPublished;g.c.huntFresh=structuredClone(market);
g.run("publishedEditorLayouts=huntPublished;applyPublishedEditorLayout(huntFresh,'world')");
assert.equal(g.run('huntFresh.features.at(-1).encounter'),'bird','hunting type survives publication');
for(const [dx,dy]of [[0,37],[60,0]]){
 g.run(`growWorld(MW+${dx},MH+${dy});saveEditorDraft();`);
 pending=JSON.parse(g.run("JSON.stringify(EmberEditDrafts.store.get('world'))"));
 const op=pending.operations[0];assert(op.changes.some(c=>c.copy==='base_terr'),'resized ground is sent once');
 g.c.transport={...first,map:'world',operations:pending.operations};
 const encoded=await g.run('EmberEditDrafts.encodeDraft(transport)');assert(Buffer.byteLength(encoded)<65000,'full-world growth fits GitHub');
 assert(zlib.gzipSync(JSON.stringify(g.c.transport),{level:1}).length<44000,'growth also fits with a browser using lower compression');
 assert.deepEqual(decodeDraft(encoded),g.c.transport);
 const before=JSON.parse(g.run("JSON.stringify(editorDraftBases.get('world').build)"));
 const restored=B.apply(before,op);assert.equal(restored.h,g.run('MH'));assert.equal(restored.w,g.run('MW'));
}
const textBefore=B.snapshot({w:25,h:25,terr:'0.625',felled_rle:'0:1-20|1:1-20'}),textAfter=structuredClone(textBefore);
textAfter.felled_rle='0:1-20|1:1-19';
const textOp={before:B.hash(textBefore),after:B.hash(textAfter),changes:[{path:['felled_rle'],start:11,deleteCount:2,text:'19'}]};
assert.deepEqual(B.apply(textBefore,textOp),textAfter);
assert.throws(()=>B.apply(textBefore,{...textOp,changes:[{path:['felled_rle'],start:999,deleteCount:0,text:'x'}]}),/text range/);
assert.throws(()=>B.validate([{path:['terr'],copy:'__proto__'}]),/Invalid Build copy/);
assert.throws(()=>B.validate([{path:['features',0],start:0,deleteCount:0,text:'x'}]),/Invalid Build text edit/);
console.log('PASS: real Build entry creates no map expansion/draft, hunting type publishes, full-world south/east growth fits GitHub, and terrain deltas validate exactly.');

// Each send from one browser is a cumulative draft, including adjustments to
// things that were already published earlier in that same session.
disk.clear();g=gameContext();g.run(`visit('a');EmberEditDrafts.sourceRevision='${revision}';EmberEditDrafts.connected=()=>true;
 var sentDrafts=[];EmberEditDrafts.send=d=>sentDrafts.push(EmberEditDrafts.clone(d));
 moveEditorActor(MD.roomActors[0],110,170,true);objs[0].x=56;painted.set(26,4);sendEditorChanges();`);
const submission=()=>JSON.parse(g.run('JSON.stringify(sentDrafts.at(-1))'));
const one=submission();let series=applyMoves(empty,one,revision);
g.run(`moveEditorActor(MD.roomActors[0],120,172,true);objs[0].x=64;painted.set(26,1);sendEditorChanges();`);
const two=submission();assert.equal(two.session.id,one.session.id);assert.equal(two.session.sequence,2);
series=applyMoves(series,two,revision);
assert.equal(series.maps.a['actor:statue'].x,120);assert.equal(series.maps.a['object:0'].x,64);assert.equal(series.maps.a['paint:26'].value,1);
assert.equal(series.maps.a['actor:statue'].originX,100,'runtime still anchors to the original authored position');
g.run('sendEditorChanges();');assert.equal(submission().id,two.id);assert.equal(applyMoves(series,submission(),revision),series);
g.run(`visit('b');objs[0].x=36;sendEditorChanges();`);series=applyMoves(series,submission(),revision);
g.run(`visit('a');added.push({id:nextId++,s:2,x:90,y:100});objs.push(added.at(-1));sendEditorChanges();`);
series=applyMoves(series,submission(),revision);const addedKey=Object.keys(series.maps.a).find(k=>k.startsWith('object-add:'));
g.run(`added[0].x=98;deleted.add(0);objs=objs.filter(o=>o.id!==0);sendEditorChanges();`);series=applyMoves(series,submission(),revision);
assert.equal(series.maps.a[addedKey].x,98);assert.equal(Object.keys(series.maps.a).filter(k=>k.startsWith('object-add:')).length,1);assert(series.maps.a['object:0'].deleted);
// Returning every edited value to the original is a valid empty replacement.
g.run(`added=[];objs=ORIG.map((o,id)=>({...o,id}));deleted.clear();painted.clear();actorLayouts.a={};sendEditorChanges();`);
const undone=submission();assert.equal(undone.operations.length,0);series=applyMoves(series,undone,revision);
assert.deepEqual(series.maps.a,{});assert.equal(series.maps.b['object:0'].x,36,'another area remains unchanged');
assert.throws(()=>applyMoves(series,{...two,id:webcrypto.randomUUID()},revision),/earlier edit/);
assert.throws(()=>applyMoves(series,{...two,id:webcrypto.randomUUID(),session:{...two.session,id:webcrypto.randomUUID(),baseHash:'stale'}},revision),/another editing session/);
let foreign=applyMoves(series,{...first,map:'a',id:webcrypto.randomUUID(),operations:[{kind:'object',key:'0',sprite:1,fromX:40,fromY:40,x:70,y:40}]},revision);
assert.throws(()=>applyMoves(foreign,{...two,id:webcrypto.randomUUID(),session:{...two.session,sequence:100}},revision),/another editing session/);
assert.throws(()=>applyMoves(series,{...two,id:webcrypto.randomUUID(),session:{...two.session,sequence:100},baseFingerprint:'changed'},revision),/map baseline/);
console.log('PASS: actual repeated SEND preserves session identity across areas, adjusts published actors/objects/paint/additions/deletions, publishes undo, retries once, and rejects other-session conflicts and old sequences.');

// Build, Doors and Collision participate in the same cumulative replacement.
const session={id:webcrypto.randomUUID(),sequence:1,baseHash:B.hash({})};
const buildStart=B.snapshot(authored),buildNext=structuredClone(buildStart);buildNext.features.push({id:45,kind:'arena',x:12,y:12,r:6});
const makeBuild=after=>({kind:'build',layout:session.baseHash,before:B.hash(buildStart),after:B.hash(after),changes:B.diff(buildStart,after)});
const door={kind:'door',key:'0',index:0,to:'b',before:{x:32,y:48,w:16,h:16},rect:{x:40,y:48,w:16,h:16}};
const cell={kind:'collision',key:'2,3',before:null,blocked:true};
let family=applyMoves(empty,{...first,map:'a',baseFingerprint:'fixture',session,operations:[makeBuild(buildNext),door,cell]},revision);
buildNext.features.at(-1).r=8;
family=applyMoves(family,{...next,map:'a',baseFingerprint:'fixture',session:{...session,sequence:2},operations:[makeBuild(buildNext),{...door,rect:{...door.rect,x:56}},{...cell,blocked:false}]},revision);
assert.deepEqual(B.snapshot(publishedMap(family,{...authored,doors:[{x:2,y:3,to:'b'}]})),buildNext);
assert.equal(family.maps.a['door:0'].rect.x,56);assert.equal(family.maps.a['collision:2,3'].blocked,false);
console.log('PASS: repeated Build, Doors and Collision sends replace their earlier result against the saved session baseline.');

// Special rewards and removable NPCs use the same draft/publication lifecycle.
{
 const game=read('js/generated/game-part-2.js');
 const packed=read('js/generated/game-part-1.js');
 const sprites=JSON.parse(zlib.gunzipSync(Buffer.from(packed.match(/const ATLAS_GZ = "([^"]+)/)[1],'base64'))).sprites;
 Object.assign(sprites,JSON.parse(game.match(/const SM_SPR = (.*);/)[1]));
 const rewardSprite=JSON.parse(packed.match(/DOCK_ORIGINAL_ASSETS.push\((\{"name":"heartstone_chest".*?\})\);/)[1]);
 sprites[rewardSprite.name]=[0,0,rewardSprite.w,rewardSprite.h,rewardSprite.frames];
 function entities(){
  const g=gameContext();g.c.SPR=sprites;
  g.run(game.slice(game.indexOf('function registerKnightStorySprites('),game.indexOf('const SPR_HANDLER')));g.run('registerKnightStorySprites()');
  g.run(read('js/editor-entities.js'));
  g.run(game.slice(game.indexOf('function npcHere('),game.indexOf('function beginHettieWalk(')));
  g.run(game.slice(game.indexOf('function pickEditorActor('),game.indexOf('function storyTeleport(')));
  g.run(game.slice(game.indexOf('function deleteSelected('),game.indexOf('tap(document.getElementById("nDel")')));
  g.run(`var selected=null,wonAll=false,quest=99;
   function refreshSel(){}function refreshHandle(){}
   var CHESTS=[{map:'a',gift:'shadow',x:9.5,y:7.5}];var TREASURY_CHESTS=[{id:'chest0',x:184,y:88}];
   Object.assign(W.maps.a.roomActors[0].extractedCanvas,{width:20,height:30});
   W.maps.a.npcs=[{n:'Removed King',x:10,y:20},{n:'Resident',sk:'farmer_bob',x:48,y:64,seated:true,sceneReserved:true}];
   W.maps.a.roomBlocks.push([150,128,170,136]);prepareEditorEntities(W.maps.a,'a');
   function visitEntities(id,fresh=false){visit(id,fresh);npcs=MD.npcs.map(n=>({...n}));}
  `);
  return g;
 }
 disk.clear();let e=entities();e.run(`visitEntities('a');npcs.shift();selected=npcs[0];deleteSelected();saveEditorDraft();visitEntities('b');visitEntities('a');`);
 assert(e.run('MD.npcs[1].editorDeleted'),'seated/story NPC deletion survives map re-entry');
 assert(!e.run('MD.npcs[0].editorDeleted'),'filtered live indices do not delete a different NPC');
 assert(!e.run('npcHere(npcs[1])'),'deleted NPC cannot render, collide or interact');
 let draft=JSON.parse(e.run("JSON.stringify(EmberEditDrafts.store.get('a'))"));
 assert.equal(draft.operations[0].key,'npc:Resident');assert(draft.operations[0].deleted);
 const published=applyMoves(empty,{...first,map:'a',operations:draft.operations},revision);
 e=entities();e.run("visitEntities('a')");assert(e.run('npcs[1].editorDeleted'),'NPC deletion survives a browser reload');
 e.run("visitEntities('a',true)");assert(!e.run('npcs[1].editorDeleted'),'RESET restores an unpublished NPC');
 e.c.layouts=published;e.run("publishedEditorLayouts=layouts;applyPublishedEditorLayout(W.maps.a,'a');applyActorLayout(W.maps.a,'a')");
 assert(e.run('MD.npcs[1].publishedDeleted&&MD.npcs[1].editorDeleted'),'published deletion applies on a fresh device');
 disk.clear();e=entities();e.run(`visitEntities('a');const chest=MD.roomActors.find(a=>a.editorChestKind);
  if(pickEditorActor(chest.x,chest.y-8)!==chest)throw Error('Heartstone chest is not selectable '+JSON.stringify({chest,pick:pickEditorActor(chest.x,chest.y-8),sprite:editorSprite(chest)}));
  moveEditorActor(chest,208,184,true);saveEditorDraft();visitEntities('b');visitEntities('a');`);
 assert.equal(e.run('CHESTS[0].x*16+8'),208);assert.equal(e.run('CHESTS[0].y*16+16'),184);
 assert.equal(e.run('MD.roomBlocks[1].join()'),'198,176,218,184','chest footprint moves exactly once');
 draft=JSON.parse(e.run("JSON.stringify(EmberEditDrafts.store.get('a'))"));
 assert.equal(draft.operations[0].key,'chest:heartstone:shadow');
 const chestLayout=applyMoves(empty,{...first,map:'a',operations:draft.operations},revision);
 e=entities();e.run("visitEntities('a')");assert.equal(e.run('CHESTS[0].y*16+16'),184,'reward position survives reload');
 e.run("visitEntities('a',true)");assert.equal(e.run('CHESTS[0].y*16+16'),136,'RESET restores reward globals as well as the proxy');
 assert.equal(e.run('MD.roomBlocks[1].join()'),'150,128,170,136');
 e.c.layouts=chestLayout;e.run("publishedEditorLayouts=layouts;applyPublishedEditorLayout(W.maps.a,'a')");
 assert.equal(e.run('CHESTS[0].x*16+8'),208,'published chest movement reaches reward logic');
 // A haunted chest carries its dormant ghost spawn and emerging smoke with it.
 disk.clear();e=entities();e.run(`W.maps.a.roomActors.push({n:'chest',spr:'temple71_chest',editKey:'loot:haunted',x:80,y:96,moveBlocks:[2],houseLoot:{id:'haunted',ghost:true,gold:0}});
  W.maps.a.roomBlocks.push([66,86,94,96]);W.maps.a.foes=[{chestAmbush:'haunted',x:5,y:6,ambushFrom:{x:80,y:96}}];
  visitEntities('a');moveEditorActor(MD.roomActors.at(-1),112,128,true);saveEditorDraft();visitEntities('b');visitEntities('a');`);
 assert.equal(e.run('JSON.stringify(MD.foes[0])'),JSON.stringify({chestAmbush:'haunted',x:7,y:8,ambushFrom:{x:112,y:128}}));
 e.run("visitEntities('a',true)");assert.equal(e.run('MD.foes[0].ambushFrom.x'),80,'RESET restores haunted chest effects');
 // Separate scene artwork disappears along with its dialogue actor.
 e.run(`MD.npcs.push({n:'Reader',school:true,lookId:'reader_art',x:70,y:80});MD.roomActors.push({spr:'reader_art',x:75,y:80});
  prepareEditorEntities(MD,'a');npcs=MD.npcs.map(n=>({...n}));selected=MD.roomActors.at(-1);deleteSelected();`);
 assert(e.run('MD.roomActors.at(-1).editorDeleted&&MD.npcs.at(-1).editorDeleted'));
 // Catalog samples stay idle and hidden until enabled, with repeat-safe IDs.
 disk.clear();e=entities();e.run(`W.maps.world={...W.maps.a,npcs:[],roomActors:[],roomBlocks:[]};prepareEditorEntities(W.maps.world,'world');`);
 const catalog=JSON.parse(e.run('JSON.stringify(npcLineupCatalog())'));
 assert(catalog.length>=40,'available four-direction appearances are included');
 for(const name of ['pack:market_citizen5','pack:maddock_smith113','body:br','skin:farmer_bob','skin:king'])assert(catalog.some(n=>n.key===name),name);
 assert(!catalog.some(n=>/corin|kd92|golem/.test(n.key)),'player/monster sheets excluded');
 assert(e.run('W.maps.world.npcs.every(n=>n.stationary&&n.noTalk&&!n.patrol&&!n.goto&&!npcHere(n))'));
 assert(e.run('W.maps.world.npcs.every(n=>n.x>=18*TS+16&&n.x<=42*TS-16&&n.y>=9*TS+48&&n.y<=33*TS-16)'),'lineup fits the egg field');
 e.run(`devNpcLineupActive=true;prepareEditorEntities(W.maps.world,'world');visitEntities('world');selected=npcs[0];deleteSelected();saveEditorDraft();`);
 assert.equal(e.run('MD.npcs.length'),catalog.length,'repeated lineup creates no duplicates');
 draft=JSON.parse(e.run("JSON.stringify(EmberEditDrafts.store.get('world'))"));assert(draft.operations.some(o=>o.deleted&&o.key.startsWith('npc:lineup:')),'sample deletion exports');
 const samples=applyMoves(empty,{...first,map:'world',operations:draft.operations},revision);
 e.c.samples=samples;e.run(`const clean={npcs:[],roomActors:[],roomBlocks:[]};prepareEditorEntities(clean,'world');publishedEditorLayouts=samples;applyPublishedEditorLayout(clean,'world');applyActorLayout(clean,'world');prepareEditorEntities(clean,'world');`);
 assert(e.run('clean.npcs[0].editorDeleted'),'published lineup deletion survives repopulation');
 // Invoke the actual tool action: locked before Skip, then opens Move at the field.
 e.run(`var devItemTest=false,scene=null,bossScene=null,fadeDir=0,doorMotion=null,P={},dragon={},mounted=true,
  cam={},VW=400,VH=600,camFree=false;
  var bEdit={classList:{add(){}}},editEl={style:{}};
  document.getElementById=()=>({style:{}});
  function loadMap(id){visitEntities(id)}function geometryEnd(){}function setPaint(){}function setBuild(){}
  function setTravel(){}function setArenas(){}function soloTool(){}function setDev(){}
  function playZoom(){return 2}function clampCam(){}function refreshToolbar(){}
  showNpcLineup();`);
 assert.equal(e.run('mounted'),true,'tool has no effect before Skip');
 e.run('devItemTest=true;showNpcLineup();showNpcLineup()');
 assert(e.run("MAPID==='world'&&editing&&camFree&&!mounted&&npcs[0].editorDeleted"));
 assert.equal(e.run('npcs.length'),catalog.length,'opening the tool twice preserves the catalog and deletions');
 // Every pack sample uses the correct image sheet while playing its idle frames.
 e.run(`var atlasImg={},knightStoryImg={},kingDragonDeathImg={},kingDragonImg={},smImg={},dragonImg={},
  sayNpc=null,t=1,sampleDraws=[];
  function drawNpcFrame(o,s,fr,img){sampleDraws.push({key:o.editKey,s,fr,img})}
 `);
 e.run(game.slice(game.indexOf('function sheetOf('),game.indexOf('function blit(')));
 const packStart=game.indexOf('    if (o.packSpr) {',game.indexOf('function drawWorld('));
 const packEnd=game.indexOf('    if (o.body && SPR[',packStart);
 e.run('for(const o of npcs.filter(n=>n.packSpr&&npcLineupVisible(n))){'+game.slice(packStart,packEnd)+'}');
 assert(e.run("sampleDraws.every(d=>d.s===SPR[npcs.find(n=>n.editKey===d.key).packSpr+'_idle_d'])"));
 assert(e.run("sampleDraws.find(d=>d.key==='npc:lineup:pack:guild_fighter_sword').img===knightStoryImg"),'knight appearance uses its dedicated sheet');

 // Browse every category/page without reviving deleted samples or stacking pages.
 for(const category of ['walking','standing','seated','scenes'])assert(catalog.some(n=>n.category===category));
 for(const key of ['sprite:pack_grandmother','sprite:villager_seated_common_a6_0','sprite:pack_pupil_1_chair','sprite:tavern_src_Dancer','sprite:school_src_Reader6','skin:villf'])assert(catalog.some(n=>n.key===key),key+' missing from catalog');
 e.run('changeNpcLineup(1)');assert.equal(e.run('devNpcLineupCategory'),'standing');
 assert(e.run("npcs.filter(n=>n.devLineup&&npcHere(n)).every(n=>n.devLineupCategory==='standing')"));
 e.run('changeNpcLineup(1);selected=npcs.find(n=>n.devLineup&&npcHere(n));globalThis.removedSeat=selected.editKey;deleteSelected();saveEditorDraft();changeNpcLineup(0,1)');
 assert(e.run("npcs.filter(n=>n.devLineup&&npcHere(n)).every(n=>n.devLineupCategory==='seated'&&n.devLineupPage===1)"));
 e.run('changeNpcLineup(0,-1)');assert(!e.run('npcHere(npcs.find(n=>n.editKey===removedSeat))'));
 e.run("visitEntities('b');visitEntities('world')");assert(e.run('npcs.find(n=>n.editKey===removedSeat).editorDeleted'),'seated deletion survives travel');
 const expandedDraft=JSON.parse(e.run("JSON.stringify(EmberEditDrafts.store.get('world'))"));
 assert(expandedDraft.operations.some(n=>n.key===e.run('removedSeat')&&n.deleted));
 e.run('changeNpcLineup(1)');assert.equal(e.run('devNpcLineupCategory'),'scenes');
 assert(e.run('npcs.filter(n=>n.devLineup&&npcHere(n)).every(n=>editorSprite(n)[2]<=40&&editorSprite(n)[3]<=52)'),'large scene art fits its selectable preview slot');
 e.run('closeNpcLineup()');assert(e.run('npcs.filter(n=>n.devLineup).every(n=>!npcHere(n))'));
 // Existing published walking edits still resolve to exactly the same samples.
 e.run('devNpcLineupActive=true;devNpcLineupCategory="walking";devNpcLineupPage=0');
 const walking=JSON.parse(e.run('JSON.stringify(walkingNpcLineupCatalog())'));
 const authored=JSON.parse(e.run('JSON.stringify(clean.npcs)'));
 for(const [i,n] of walking.entries()){
  const sample=authored.find(a=>a.editKey==='npc:lineup:'+n.key);
  assert.deepEqual([sample.x,sample.y],[344+(i%8)*40,208+Math.floor(i/8)*48]);
 }
 console.log(`PASS: chest movement, haunted effects and NPC deletion survive save/reload/reset/publication; ${catalog.length} idle NPC appearances fit the egg field with stable deletions.`);
}
