import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
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
assert.throws(()=>applyMoves(a,{...next,operations:[{kind:'shell',key:'x'}]},revision),/Only moves/);
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
  const c=vm.createContext({console,setTimeout:()=>0,clearTimeout(){},
    localStorage:{getItem:k=>disk.get(k)||null,setItem:(k,v)=>disk.set(k,v)},
    document:{getElementById:()=>({}),addEventListener(){}},window:{addEventListener(){}},
    tap(){},toast(){},rebuildSolid(){},worldChanged(){},saveGeometry(){},
    fetch(){throw Error('Draft hooks sent data without a button press');}});
  const run=code=>vm.runInContext(code,c);
  run(read('js/editor-drafts.js'));
  run(`var actorLayouts={},geometryEdits={},MD=null,MAPID='',TS=16,PXW=400,PXH=400,mapDirty=false;
    var editing=true,building=false,painting=false,doorEdit=false,collideView=false;
    var npcs=[],objs=[],ORIG=[],added=[],deleted=new Set(),nextId=0,painted=new Map(),features=[],featOrig=new Map(),regionMoves=[],clearedBoxes=[],felledNew=[],decorGone=new Set(),decorDel=[],decorMoved=new Map(),scat=[],sanm=[],terr=[],felled=new Set();
    class CanvasStandIn{};
    var W={maps:{a:{w:25,h:25,objs:[1,40,40],npcs:[],doors:[],roomActors:[{editKey:'statue',spr:'sentinel',x:100,y:200,moveBlocks:[0],extractedCanvas:new CanvasStandIn()}],roomBlocks:[[90,180,110,200]],scatter:[2,60,60],sanim:[],features:[],terr:'0.625'},b:{w:25,h:25,objs:[1,20,20],npcs:[],roomActors:[],roomBlocks:[],doors:[],scatter:[],sanim:[],features:[],terr:'0.625'}}};
    function geometryPatch(){return []} var TCHAR=[];`);
  const game=read('js/generated/game-part-2.js');
  run(game.slice(game.indexOf('function editorActorInfo('),game.indexOf('function pickEditorActor(')));
  run(game.slice(game.indexOf('function buildPatch('),game.indexOf('const dumpEl =')));
  run(read('js/published-editor-layouts.js'));run(read('js/editor-draft-integration.js'));
  run(`function visit(id,fresh=false){saveEditorDraft();editorDraftReady=false;MAPID=id;MD=W.maps[id];const s=editorPrepareMap(id,fresh);applyActorLayout(MD,id);
    ORIG=[];for(let i=0;i<MD.objs.length;i+=3)ORIG.push({s:MD.objs[i],x:MD.objs[i+1],y:MD.objs[i+2]});objs=ORIG.map((o,id)=>({...o,id}));added=[];deleted=new Set();nextId=ORIG.length;painted=new Map();features=[];featOrig=new Map();decorGone=new Set();decorDel=[];decorMoved=new Map();scat=MD.scatter.slice();sanm=[];editorRestoreMap(s);}`);
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
