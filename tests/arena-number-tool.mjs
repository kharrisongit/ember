import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('js/generated/game-part-2.js');
const section=(start,end)=>game.slice(game.indexOf(start),game.indexOf(end,game.indexOf(start)));
const nodes=new Map(),texts=[];
function element(){
 const el={style:{},children:[],classList:{toggle(){},add(){},remove(){}},setAttribute(){},focus(){},
  append(...children){this.children.push(...children);for(const child of children)child.parent=this;},
  appendChild(child){this.append(child);},remove(){nodes.delete(this.id);if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}};
 Object.defineProperty(el,'id',{get(){return this._id;},set(id){this._id=id;nodes.set(id,this);}});
 Object.defineProperty(el,'innerHTML',{set(){this.children=[];}});
 return el;
}
for(const id of ['arenaListGrid','arenaCountBadge','bArenas','arenasPane','geometryBar','bEdit','edit']){const e=element();e.id=id;}
const original=[{id:1,kind:'arena',x:10,y:10,r:6,style:'birch'},
 {id:2,kind:'arena',x:40,y:30,r:6.3,style:'birch',encounter:'bird'}];
const live=original.map(a=>({...a}));
live.push({id:3,kind:'arena',x:80,y:30,r:6.3,style:'winter',encounter:'fox'});
const c=vm.createContext({console,document:{getElementById:id=>nodes.get(id)||null,createElement:element,body:element()},
 W:{maps:{world:{features:original},room:{features:[{id:4,kind:'arena',x:4,y:4,r:6}]}}},
 MD:{features:original},MAPID:'world',TS:16,features:live,foes:[],loot:[],FOE:{},FOE_ART:{},isSolid:()=>false,
 cam:{x:300,y:100,z:.35},VW:800,VH:600,PXW:16000,PXH:8000,P:{x:0,y:0},
 cv:{getBoundingClientRect:()=>({left:50,top:80,width:400,height:300})},
 ctx:new Proxy({fillText:s=>texts.push(s)},{get:(o,k)=>o[k]||(()=>{})}),
 devOpen:false,editing:false,building:false,painting:false,travelling:false,doorEdit:false,collideView:false,
 touches:new Map(),dragObj:null,dragMoved:false,pinchD:0,pinchZ:0,pinchMx:null,pinchMy:null,
 grabDrag:null,grabRect:null,devUnlocked:true,camFree:true,closeOthers(){},geometryEnd(){},
 setPaint(){},setBuild(){},setTravel(){},setDevTitle(){},refreshToolbar(){},playZoom:()=>2,
 mapGesturesAllowed:()=>true,clampCam(){},setZoom(z){c.cam.z=z;},mapDirty:false,
 toast:s=>{c.notice=s;},saveEditorDraft:()=>{c.saved=(c.saved||0)+1;}});
const run=s=>vm.runInContext(s,c);
run(read('js/hunting-grounds.js'));
run(section('let arenasShowing =','window.addEventListener("load", () => {'));
run(section('function screenToWorld(','const FABRIC ='));
run(section('function mapTouchStart(','function fitZoom('));
run('arenasShowing=true;buildArenaList();spawnHuntingAnimals();');
assert.equal(run('arenaNumberEntries.length'),4,'Includes live local/published hunting additions');
assert.equal(nodes.get('arenaListGrid').children.length,4);
assert.equal(new Set(JSON.parse(run('JSON.stringify(arenaNumberEntries.map(a=>a.arenaNum))'))).size,4,'Unique display numbers');
assert(original.every(a=>!a.arenaNum&&!a.mapId)&&live.every(a=>!a.arenaNum&&!a.mapId),'Numbering does not dirty Build data');
run('drawArenaNumberOverlay()');assert(texts.includes('#2'));assert(texts.some(t=>t.startsWith('BIRD HUNT')));
const screen=(a)=>({clientX:50+((a.x*16+8)-c.cam.x)*c.cam.z/2,clientY:80+((a.y*16+8)-c.cam.y)*c.cam.z/2});
const tap=(point,id='finger')=>{c.touch={identifier:id,...point};run('mapTouchStart(touch);mapTouchEnd(touch)');};
for(const zoom of [.05,.12,.35,1,2.5]){
 c.cam.z=zoom;tap(screen(live[1]));
 const panel=nodes.get('arenaAnimalPanel');assert(panel,'Map badge opens picker at zoom '+zoom);
 assert.deepEqual(panel.children.slice(1,6).map(b=>b.textContent.replace(' — current','')),['Bird','Hare','Boar','Deer','Fox']);
 panel.children.at(-1).onclick();assert(!nodes.has('arenaAnimalPanel'));assert.equal(live[1].encounter,'bird');
}
// Finger-sized hit target is measured in CSS pixels on scaled/mobile canvases.
c.cam.z=.35;const near=screen(live[1]);tap({...near,clientY:near.clientY+20});
assert(nodes.has('arenaAnimalPanel'));run('closeArenaAnimalPicker()');
// Touch and mouse both use the canvas-relative map gesture path.
for(const id of ['finger','m']){
 c.cam.z=.35;tap(screen(live[1]),id);
 const panel=nodes.get('arenaAnimalPanel');panel.children.find(b=>b.textContent==='Deer').onclick();
 assert.equal(live[1].encounter,'deer');
 assert.equal(c.foes.filter(f=>f.huntingArena.id===2&&f.kind==='deer').length,3);
 assert.equal(c.foes.filter(f=>f.huntingArena.id===3&&f.kind==='fox').length,3,'Other herd is unchanged');
 assert(!nodes.has('arenaAnimalPanel'),'Choice closes picker');
 run("changeArenaAnimal(2,'bird')");
}
// A cooldown from the old herd must not prevent the new animal appearing.
run('for(let slot=0;slot<3;slot++)huntingRest.set(huntingKey(features[1],slot),300)');
run("changeArenaAnimal(2,'hare')");assert.equal(c.foes.filter(f=>f.huntingArena.id===2&&f.kind==='hare').length,3);
assert(c.saved>0,'Selection saves the editor draft');
const untouched=JSON.stringify(live);assert.equal(run("changeArenaAnimal(1,'fox')"),false,'Combat arena is not converted');
assert.equal(run("changeArenaAnimal(2,'dragon')"),false);assert.equal(JSON.stringify(live),untouched);
// Dragging off a number pans instead of selecting, even when released over it.
c.touch={identifier:'drag',...screen(live[1])};run('mapTouchStart(touch)');
c.touch={...c.touch,clientX:c.touch.clientX+30};run('mapTouchMove(touch);mapTouchEnd(touch)');
assert(!nodes.has('arenaAnimalPanel'),'Pan does not open picker');
c.touch={identifier:'one',...screen(live[1])};run('mapTouchStart(touch)');
c.second={identifier:'two',clientX:c.touch.clientX+60,clientY:c.touch.clientY};
run('mapTouchStart(second);mapTouchEnd(second);mapTouchEnd(touch)');
assert(!nodes.has('arenaAnimalPanel'),'Pinch does not open picker');
tap(screen(live[0]));assert(!nodes.has('arenaAnimalPanel'),'Combat number does not open animal picker');
run('setArenas(false)');tap(screen(live[1]));assert(!nodes.has('arenaAnimalPanel'),'Tool must be active');
console.log('PASS: published/local hunting numbers, mouse/touch selection at five zooms, animal picker, cancel, herd replacement, cooldown reset, combat protection and pan/pinch behavior.');
