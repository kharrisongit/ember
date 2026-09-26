import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const p2=read('js/generated/game-part-2.js'),p3=read('js/generated/game-part-3.js');
const section=(source,start,end)=>{
  const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
  assert(a>=0&&b>a,`Source section exists: ${start}`);return source.slice(a,b);
};
class Element {
  constructor(id,parent=null){
    this.id=id;this.parentNode=parent;this.listeners={};this.style={};this.dataset={};this.children=[];
    parent?.children.push(this);
    const classes=new Set();this.classList={add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),
      toggle:(k,on)=>{if(on??!classes.has(k))classes.add(k);else classes.delete(k);}};
  }
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  closest(selector){for(let e=this;e;e=e.parentNode)if(selector.split(',').some(s=>s.trim()==='#'+e.id))return e;return null;}
  querySelectorAll(){return this.children;}
  appendChild(child){child.parentNode=this;this.children.push(child);}
  replaceChildren(){this.children=[];}
}
const body=new Element('body'),deck=new Element('deck',body),stage=new Element('stage',body);
const nodes={body,deck,stage};
for(const id of ['act','btnB','btnL','btnR','btnItems','btnMapQuick','btnDev','dpad'])nodes[id]=new Element(id,deck);
for(const id of ['cv','boot','bootNew','bootLoad','bootFill','bootMsg','bootBtns','bootLabel','bootHint','bootLoadPanel','bootLoadRows','bootLoadMsg','atkm','airm','itemm','sound','loadSlots'])nodes[id]=new Element(id,stage);
for(const [id,parent]of [['atkCloseBtn','atkm'],['airCloseBtn','airm'],['itemCloseBtn','itemm'],['itemFullBtn','itemm']])nodes[id]=new Element(id,nodes[parent]);
const up=new Element('up',nodes.dpad);up.dataset={dx:'0',dy:'-1'};
const captures={},keyboard={},intervals=[];
let interactions=0,devToggles=0,refreshes=0,loadWorks=true,loadedSlot=null;
const c=vm.createContext({
  document:{body,getElementById:id=>nodes[id]||null,createElement:()=>new Element(''),querySelectorAll:()=>[],addEventListener:(t,f)=>{(captures[t]??=[]).push(f);}},
  window:{addEventListener(){}},navigator:{maxTouchPoints:0},addEventListener:(t,f)=>{keyboard[t]=f;},
  setInterval:fn=>{intervals.push(fn);return intervals.length;},clearInterval(){},setTimeout(){},Date,
  W:null,MAPID:'world',fishing:null,atlasOpen:false,ask:null,bagOpen:false,ovl:null,deadShown:false,glassShield:false,
  sceneHold:()=>false,dismissDragonBanter:()=>false,grabGold:()=>false,interact:()=>interactions++,
  cameraOwnsView:()=>false,mapGesturesAllowed:()=>false,camFree:false,devOpen:false,
  setDev:on=>{c.devOpen=on;devToggles++;},setBag:on=>{c.bagOpen=on;},
  openAtlas:()=>{c.atlasOpen=true;},closeAtlas:()=>{c.atlasOpen=false;},
  trigHold(){},hasDragon:()=>true,refreshOvl:()=>refreshes++,
  MENUS:{atkm:{},airm:{},itemm:{},sound:{},loadSlots:{}},
  migrateLegacySave(){},readSaveSlot:slot=>slot<3?{}:null,wireBagDrag(){},SAVE_SLOT_COUNT:3,
  saveSummary:slot=>'Slot '+slot,loadGame:slot=>{loadedSlot=slot;return loadWorks;}
});
const run=code=>vm.runInContext(code,c);
run(section(p2,'let gameplayStarted =','const SCROLLERS ='));
run(section(p2,'function actionButton() {','bindHold("act"'));
run('bindHold("act",actionButton,null);padBind();');
run(section(p2,'bindHold("btnB",','{\n  const fb = document.getElementById("btnFire")'));
run(section(p3,'function setOvl(which) {','function refreshOvl()'));
run(section(p3,'const atkCloseBtn=','function soundPercent()'));
run(p3.slice(p3.lastIndexOf('(function () {'),p3.indexOf('bindAtlasAndGeometry();',p3.lastIndexOf('(function () {'))));
function dispatch(target,type,extra={}){
  const e={target,type,...extra,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;},stopImmediatePropagation(){this.stopped=true;}};
  for(const fn of captures[type]||[]){fn(e);if(e.stopped)return e;}
  for(const fn of target.listeners[type]||[]){fn(e);if(e.stopped)break;}
  return e;
}
function key(k){keyboard.keydown({key:k,preventDefault(){}});}
// A can be pressed even before BOOT and the world have been initialized.
run('actionButton()');assert.equal(interactions,0);
for(const node of [nodes.act,nodes.btnB,nodes.btnL,nodes.btnR,nodes.btnItems,nodes.btnMapQuick,nodes.btnDev,up,nodes.cv]){
  for(const type of ['pointerdown','touchstart','mousedown','click'])assert(dispatch(node,type).defaultPrevented,node.id+' is inert while loading');
}
for(const k of [' ','a','b','ArrowUp'])key(k);
assert.equal(run('Object.keys(keys).length'),0);assert.equal(interactions,0);assert.equal(devToggles,0);
assert.equal(c.ovl,null);assert.equal(c.atlasOpen,false);
run(section(p3,'const BOOT = {','const MENUS ='));
run('BOOT.close()');assert.equal(run('gameplayStarted'),false,'Cannot bypass world loading');
run('BOOT.to=async()=>{};bootBind();');
for(const start of ['act','bootNew','bootLoad']){
  run('gameplayStarted=false;gameplayReady=false;setOvl(null)');
  body.classList.remove('game-started');
  await run('BOOT.ready()');
  assert(body.classList.contains('boot-ready'));
  dispatch(nodes.btnItems,'touchstart');dispatch(nodes.btnMapQuick,'mousedown');dispatch(nodes.btnDev,'click');
  assert.equal(c.ovl,null);assert.equal(c.atlasOpen,false);assert.equal(devToggles,0);
  dispatch(nodes[start],start==='act'?'touchstart':'click');
  if(start==='bootLoad'){
    assert.equal(run('gameplayStarted'),false,'Opening title saves never starts the game');
    assert.equal(c.ovl,null,'Title saves do not open an in-game overlay');
    assert.equal(body.classList.contains('game-started'),false);
    assert.equal(nodes.bootLoadRows.children.length,4);assert(nodes.bootLoadRows.children[2].disabled,'Empty slots remain visible');
    dispatch(nodes.bootLoadRows.children[3],'click');
    assert.equal(run('gameplayStarted'),false);assert.equal(nodes.bootLabel.textContent,'LOADED!');assert(nodes.bootLoadPanel.hidden);
    dispatch(nodes.bootLoad,'click');key('b');assert.equal(run('BOOT.loading'),false,'B returns to the title');
    dispatch(nodes.bootLoad,'click');dispatch(up,'mousedown');assert.equal(run('BOOT.loadPick'),3,'Title D-pad can select Back');
    dispatch(nodes.btnB,'touchstart');assert.equal(run('BOOT.loading'),false,'Touch B also returns to the title');
    dispatch(nodes.bootLoad,'click');key('ArrowDown');assert.equal(run('BOOT.loadPick'),1);
    loadWorks=false;dispatch(nodes.act,'mousedown');
    assert.equal(run('gameplayStarted'),false);assert.equal(run('BOOT.loading'),true);assert.match(nodes.bootLoadMsg.textContent,/could not/);
    loadWorks=true;dispatch(nodes.act,'mousedown');assert.equal(loadedSlot,2,'A loads the chosen slot');
  }
  assert.equal(run('gameplayStarted'),true,start+' starts normally once ready');
  assert.equal(body.classList.contains('boot-ready'),false);assert(body.classList.contains('game-started'));
  assert.equal(nodes.boot.style.display,'none');assert.equal(interactions,0,'Starting does not also interact');
  assert.equal(c.ovl,null);
}
run('setOvl(null)');dispatch(nodes.act,'mousedown');assert.equal(interactions,1,'Fresh A press works after starting');
for(const [menu,close]of [['airm','airCloseBtn'],['atkm','atkCloseBtn'],['itemm','itemCloseBtn']]){
  run(`setOvl('${menu}')`);
  const before=devToggles;
  dispatch(nodes.btnDev,'touchstart');dispatch(nodes.btnDev,'click');dispatch(nodes.btnItems,'mousedown');
  assert.equal(devToggles,before,'Underlying DEV cannot take touches');assert.equal(c.ovl,menu);
  // Model an iPhone's touch sequence and compatibility mouse events. A
  // premature close would retarget the following events onto DEV underneath.
  for(const type of ['pointerdown','touchstart','pointerup','touchend','mousedown','mouseup']){
    dispatch(c.ovl?nodes[close]:nodes.btnDev,type);
    assert.equal(c.ovl,menu,'Menu remains the hit target through '+type);
  }
  const click=dispatch(c.ovl?nodes[close]:nodes.btnDev,'click');
  assert(click.defaultPrevented&&click.stopped);assert.equal(c.ovl,null);assert.equal(devToggles,before);
  assert.equal(body.classList.contains('deck-menu-open'),false);
  dispatch(nodes.btnDev,'click');assert.equal(devToggles,before+1,'A new deliberate DEV press still works');
}
run('setOvl("itemm")');dispatch(nodes.itemFullBtn,'click');assert.equal(c.ovl,null);assert.equal(c.bagOpen,true);
assert(dispatch(nodes.btnDev,'click').defaultPrevented,'Inventory also blocks underlying DEV');
assert.equal(dispatch(nodes.act,'pointerdown').defaultPrevented,undefined,'Inventory retains exposed A navigation');
c.bagOpen=false;
run(section(p3,'setInterval(() => {\n  const started =','const SKIN_BAND ='));
run('setOvl("atkm")');const before=refreshes;intervals.at(-1)();assert.equal(refreshes,before,'Label updates never detach a pressed attack row');
run(section(p2,'function glassHatchPosition()','function drawHettieCallout('));
assert.equal(run('glassHatchNear(0,0)'),false,'World may still be null without the reported script error');
c.W={maps:{glasshouse:{roomActors:[{glassHatch:true,x:100,y:200}]}}};c.MAPID='glasshouse';
assert.equal(run('glassHatchNear(100,196)'),true,'Published hatch position still works');
console.log('PASS: loading ignores input; title saves stay outside gameplay, Back/B return to LOADED, failed loads stay on the title, and A loads the selected slot; Cancel consumes one gesture, covered controls stay blocked, and null-world hatch lookup is safe.');

// Exercise the real cutscene setup, animation, render queue, and advance gate.
const maddock={x:100,y:100},h=vm.createContext({
  P:{x:100,y:140},TS:16,cam:{z:2},canStand:()=>true,faceCorinAt(){},faceToward(){},dragon:{on:true},
  HATCH_LINES:Array.from({length:20},()=>''),finishHatchScene(){},elder:()=>maddock,MAPID:'world',
  revealing:false,typeDone:()=>true,showScene(){},standableNear:(x,y)=>[x,y],rebuildSolid(){},
  playScene:(lines,opts)=>{h.scene={lines,i:0,t:0,...opts};},draw:[]
});
const hr=code=>vm.runInContext(code,h);
hr('let hatchScene=null,hatchCamera=null,camFree=false;');
hr(section(p2,'function beginHatchScene(','const DRAGON_NAME ='));
hr(section(p2,'function advanceScene() {','const HERD_Y ='));
h.m=maddock;hr('beginHatchScene(m)');
const drawHatch=section(p2,'  if (hatchScene && hatchScene.stage','  if (bell)');
function hatchFrame(i,t){h.scene.i=i;h.scene.t=t;h.draw=[];hr('stepHatchScene(.016)');hr(drawHatch);return h.draw[0];}
for(let i=0;i<3;i++)for(const t of [0,.5,30])assert.equal(hatchFrame(i,t),undefined,'Egg stays hidden throughout dialogue '+i);
const landing=hr('hatchScene.eggY');
assert.equal(hatchFrame(3,0).y,landing-18);
const midway=hatchFrame(3,.36).y;assert(midway>landing-18&&midway<landing,'Egg lowers during put-it-down line');
hr('advanceScene()');assert.equal(h.scene.i,3,'Rapid A cannot skip the lowering motion');
assert.equal(hatchFrame(3,.6).y,landing);hr('advanceScene()');assert.equal(h.scene.i,4);
for(const i of [4,5,6])assert.equal(hatchFrame(i,20).y,landing,'Egg rests on ground for the remaining dialogue');
const dragonActor=hatchFrame(7,.1);assert.equal(dragonActor.x,hr('hatchScene.dragonX'));assert.equal(dragonActor.y,hr('hatchScene.dragonY'));
console.log('PASS: egg is hidden for the first three lines, lowers at Maddock’s instruction, finishes before advancing, stays grounded, and becomes the hatchling at the original beat.');
