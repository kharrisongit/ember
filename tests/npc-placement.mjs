import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {applyMoves} from '../tools/apply-editor-moves.mjs';
import {gameContext} from './editor-moves.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function setup(){
 const g=gameContext();g.run(`var SPR={pack_unused:[0,0,16,32,4],tavern_anim_8:[0,0,32,32,6]};
 W.maps.a.npcs=[{n:'Sleeper',editKey:'npc:Sleeper',school:true,lookId:'tavern_anim_8',x:64,y:80,d:['Hello'],seatClipY:70,sy:71}];
 W.maps.a.roomActors.push({spr:'tavern_anim_8',editorNpcKey:'npc:Sleeper',x:64,y:80});
 function npcLineupCatalog(){return [{key:'sprite:pack_unused',packSpr:'pack_unused',packDirections:false,packWalk:false,category:'standing'}];}
 function syncEditorNpcArt(m){for(const a of m.roomActors||[])if(a.editorNpcKey)a.editorDeleted=!!m.npcs.find(n=>editorNpcKey(n)===a.editorNpcKey)?.editorDeleted;}
 `);
 const code=read('js/npc-placement.js');g.run(code.slice(0,code.lastIndexOf('installNpcPlacementControls();')));return g;
}
let g=setup();g.run(`visit('a',true);visit('b',true);
const add={kind:'npc-add',key:'11111111-1111-4111-8111-111111111111',look:'sprite:pack_unused',name:'New resident',x:120,y:130};
const transfer={kind:'npc-transfer',key:'22222222-2222-4222-8222-222222222222',sourceMap:'a',sourceKey:'npc:Sleeper',identity:'Sleeper',x:200,y:200};
npcEditorOps.b=[add,transfer];for(const op of npcEditorOps.b)npcCreatePlacement(MD,op);saveEditorDraft();visit('a');`);
assert(g.run('MD.npcs[0].editorDeleted'),'Transfer hides original NPC locally');
assert(g.run('MD.roomActors[1].editorDeleted'),'Transfer hides linked scene artwork');
g.run(`visit('b');npcs=MD.npcs.map(n=>({...n}));moveEditorActor(npcs[0],144,160,true);saveEditorDraft();`);
assert.equal(g.run('EmberEditDrafts.store.get("b").operations[0].x'),144,'Moving unsent addition changes saved placement');
assert.equal(g.run('MD.npcs[1].packSpr'),'tavern_anim_8','Transferred scene NPC keeps animation');
assert.equal(g.run('MD.npcs[1].school'),undefined,'Transferred visible sprite replaces hidden dialogue proxy');
assert.equal(g.run('MD.npcs[1].seatClipY'),undefined,'Old tabletop clipping does not travel');
assert.equal(g.run('MD.npcs[1].d[0]'),'Hello','Dialogue preserved');
g=setup();g.run(`visit('b');`);assert.equal(g.run('MD.npcs.length'),2,'Additions and transfer survive full reload');
assert.equal(g.run('MD.npcs[0].x'),144);
const draft=g.run('EmberEditDrafts.store.get("b")');
const submission={schema:1,id:'33333333-3333-4333-8333-333333333333',map:'b',sourceRevision:'test',operations:JSON.parse(JSON.stringify(draft.operations))};
const empty={schema:1,maps:{},applied:[]},layout=applyMoves(empty,submission,'test');
assert.deepEqual(applyMoves(layout,submission,'test'),layout,'Retry is idempotent');
assert.throws(()=>applyMoves(layout,{...submission,id:'44444444-4444-4444-8444-444444444444',map:'c'},'test'),/already transported/,'Cannot duplicate a transferred character');
g=setup();g.c.layout=layout;g.run(`EmberEditDrafts.store.remove('a');EmberEditDrafts.store.remove('b');publishedEditorLayouts=layout;visit('b');visit('a');`);
assert(g.run('MD.npcs[0].editorDeleted'),'Published origin hidden even when destination loaded first');
g.run(`visit('b');npcs=MD.npcs.map(n=>({...n}));moveEditorActor(npcs[1],208,220,true);saveEditorDraft();`);
const nextDraft=JSON.parse(JSON.stringify(g.run('EmberEditDrafts.store.get("b").operations')));
assert(nextDraft.some(o=>o.kind==='actor'&&o.x===208),'Published transferred NPC supports ordinary subsequent moves');
const updated=applyMoves(layout,{...submission,id:'55555555-5555-4555-8555-555555555555',operations:nextDraft},'test');
g=setup();g.c.layout=updated;g.run(`EmberEditDrafts.store.remove('a');EmberEditDrafts.store.remove('b');publishedEditorLayouts=layout;visit('b');`);
assert.equal(g.run('MD.npcs[1].y'),220,'Subsequent movement restores after publication');
g.run(`visit('a');visit('b',true);`);assert.equal(g.run('MD.npcs.length'),2,'Reset preserves published NPCs');
const game=read('js/generated/game-part-2.js'),c=vm.createContext({});
vm.runInContext(game.slice(game.indexOf('function houseChairDepth('),game.indexOf('function libraryActorDepth(')),c);
const chair={exactFurniture:true,n:'north chair',x:80,y:90,sy:100,extractedCanvas:{width:24,height:32}};
const resident={x:80,y:92,sy:76,seated:true};
assert(c.houseChairDepth(chair,[resident])<76);resident.y+=8;resident.sy+=8;assert(c.houseChairDepth(chair,[resident])<84);
resident.editorDeleted=true;assert.equal(c.houseChairDepth(chair,[resident]),100);resident.editorDeleted=false;resident.x+=100;assert.equal(c.houseChairDepth(chair,[resident]),100);
console.log('PASS: NPC additions/transfers retain animation/dialogue through reload, publishing, retry, independent movement and reset; original NPC/art hidden once; house chairs follow seated people.');

// Raw scene sheets contain multiple poses per frame. Both the picker and saved
// additions must resolve to exactly one person, with the original frame stride.
{
 const draws=[],sheets={},sprites={tavern_src_Drinker1:[20,100,64,80,8],tavern_src_Drinker3:[0,0,64,80,8],tavern_anim_7:[100,200,32,32,12]};
 const doc={createElement:()=>({getContext:()=>({})})};
 const h=vm.createContext({SPR:sprites,animalSheets:sheets,document:doc,sheetOf:()=>({}),drawGameImage:(...args)=>draws.push(args)});
 const code=read('js/npc-placement.js');vm.runInContext(code.slice(0,code.indexOf('function npcLayoutOps(')),h);
 assert.equal(h.npcSingleSprite('tavern_src_Drinker3'),'tavern_anim_7','Use the existing isolated actor');
 const key=h.npcSingleSprite('tavern_src_Drinker1'),sp=sprites[key];
 assert.deepEqual(Array.from(sp),[0,0,32,40,8,key]);assert.equal(sheets[key].width,256);assert.equal(draws.length,8);
 for(let frame=0;frame<8;frame++)assert.deepEqual(draws[frame].slice(2),[20+frame*64,100,32,40,frame*32,0,32,40]);
 h.npcSingleSprite('tavern_src_Drinker1');assert.equal(draws.length,8,'Reuse the prepared strip');
 assert.equal(h.npcAppearance({packSpr:'tavern_src_Drinker3'}),h.npcAppearance({packSpr:'tavern_anim_7'}),'Aliases count as the same person');
 assert.equal(h.npcAppearance({sk:'villf'}),'skin:villf');
}
console.log('PASS: scene NPCs use one isolated character in every frame; source aliases share the same appearance.');

// Use the game's actual document touch handlers: the picker must be recognized
// as a scroll container even when a swipe starts on an NPC button.
{
 const listeners={};
 const doc={body:null,getElementById:()=>null,addEventListener:(name,fn)=>listeners[name]=fn};
 doc.createElement=()=>{const e={style:{},className:'',append(...children){for(const child of children)child.parentNode=e;}};
   e.classList={contains:name=>e.className.split(' ').includes(name)};return e;};
 doc.body=doc.createElement();
 const h=vm.createContext({document:doc});
 const source=read('js/npc-placement.js');vm.runInContext(source.slice(source.indexOf('function npcOpenPanel('),source.indexOf('function npcEditingAt(')),h);
 const game=read('js/generated/game-part-2.js');vm.runInContext(game.slice(game.indexOf('const SCROLLERS ='),game.indexOf('cv.addEventListener("touchstart", e => {',game.indexOf('const SCROLLERS ='))),h);
 const panel=h.npcOpenPanel('Add an unused NPC'),button=doc.createElement();panel.append(button);
 Object.assign(panel,{scrollTop:0,scrollHeight:1600,clientHeight:500});
 assert.equal(h.scrollerFor(button),panel,'Swipe on an NPC card resolves its scroll container');
 assert(panel.style.cssText.includes('touch-action:pan-y'),'Native vertical touch scrolling is enabled');
 listeners.touchstart({target:button,touches:[{clientX:100,clientY:400}]});
 let blocked=false;listeners.touchmove({target:button,touches:[{clientX:100,clientY:200}],cancelable:true,preventDefault(){blocked=true}});
 assert(!blocked,'The game must not cancel a swipe through the NPC list');
 listeners.touchend();
}
console.log('PASS: swipes starting on NPC cards pass through the real game touch handler for native scrolling.');
