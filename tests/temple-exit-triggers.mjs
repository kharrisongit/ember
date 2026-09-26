import fs from 'node:fs';import zlib from 'node:zlib';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js'),assets=read('js/generated/game-part-1.js');
const W=JSON.parse(zlib.gunzipSync(Buffer.from(assets.match(/const W_GZ = "([^"]+)"/)[1],'base64')));
const buttons=[],list={innerHTML:'',appendChild:b=>buttons.push(b)};
let travelClosed=false;
const c=vm.createContext({W,window:{EMBER_ASSETS:{DOCK_ORIGINAL_ASSETS:[]}},TS:16,DIRT:0,terrRLE:a=>'0.'+a.length,WALL78_PIECES:JSON.parse(assets.match(/const WALL78_PIECES=(.*);/)[1]),
 fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url.split('?')[0]))}),Image:class{async decode(){}},
 breathHas:{},chestOpen:{},features:[],MAPID:'world',MD:W.maps.world,P:{},dragon:{placed:'old'},chunks:new Map(),cam:{z:1},VW:400,VH:300,
 isArea:()=>false,playZoom:()=>1,clampCam(){},checkArea(){},setDevTitle(){},toast(){},setTravel:on=>{travelClosed=!on;},
 document:{getElementById:()=>list,createElement:()=>({handlers:{},addEventListener(type,fn){this.handlers[type]=fn;}})}});
const run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('const CHESTS = ['),game.indexOf('function chestHere()')));
run(game.slice(game.indexOf('function installFirstTemple(){'),game.indexOf('const foeVisibleTopCache82')));
run('installFirstTemple();installSecondTemple();installThirdTemple();refineSecondTemple();finishTempleLayouts77();refineTemples78();finishTempleLayouts82();');
run(read('js/first-temple.js'));run(read('js/sandspire-temple.js'));run(read('js/hollybeck-temple.js'));run(read('js/mountain-passage.js'));
await run('prepareExpandedFirstTemple()');await run('prepareExpandedSandspireTemple()');await run('prepareExpandedHollybeckTemple()');await run('prepareExpandedMountainPassage()');

Object.assign(c,{sceneHold:()=>false,sayNpc:null,dragonHere:()=>false,dragonAllowedInMap:()=>true,bossScene:null,foesHeld:true,foes:[],bossGone:{},arenaLock:null,arenaT:0,doorMotion:null,fadeDir:0,fade:0,FADE_T:.22,pendingActorStage:null,pendingDoor:null,arriveT:0,
 geometryEdits:{},actorLayouts:{},quest:2,Q:{ABED:0,ERRAND:1},bolts:[],bannerName:null,bannerT:0,lastArea:null,arrivedDoor:null,recoverTempleArrival(){}});
c.loadMap=id=>{c.MAPID=id;c.MD=W.maps[id];c.features=c.MD.features||[];};
run(game.slice(game.indexOf('function doorRect('),game.indexOf('function collisionOverride(')));
run(part3.slice(part3.indexOf('function doorExitDirection('),part3.indexOf('function drawArena(')));
run(part3.slice(part3.indexOf('function areaUnder('),part3.indexOf('let arenaLock =')));
run(part3.slice(part3.indexOf('let lastAreaTile ='),part3.indexOf('function drawBanner(')));
const reset=(id,x,y,dir,flip=false)=>{c.loadMap(id);Object.assign(c,{doorMotion:null,fadeDir:0,fade:0,pendingDoor:null,arriveT:0});Object.assign(c.P,{x,y,dir,flip,moving:true});};
const triggered=()=>c.doorMotion?.d||c.pendingDoor;
const clear=(m,x,y)=>[[x-6,y-12],[x+6,y-12],[x-6,y-1],[x+6,y-1]].every(([px,py])=>
 m.templeFloors.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&!m.roomBlocks.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b));
let south=0,joins=0;
for(const [id,m] of Object.entries(W.maps).filter(([id,m])=>m.templeExpanded)){
 assert.equal(m.title,id.startsWith('tp')?'Forgewick Temple':id.startsWith('ds')?'Sandspire Temple':id.startsWith('sn')?'Hollybeck Temple':'Mountain Passage');
 for(const d of m.doors){
  if(d.dir==='d'){
   south++;const r=d.triggerRect,x=r.x+r.w/2,mouth=r.y-32;
   for(const depth of [-4,0,8,16,24,32]){reset(id,x,mouth+depth,'d');run('useDoors(0)');assert(!triggered(),id+' south exit too early at '+depth);}
   for(const depth of [33,36,40]){assert(clear(m,x,mouth+depth),id+' deeper trigger reachable');reset(id,x,mouth+depth,'d');run('useDoors(0)');assert.equal(triggered(),d,id+' south exit works inside recess');}
  }
  if(!W.maps[d.to].templeExpanded)continue;
  joins++;reset(id,0,0,'u');c.bannerName='Old room sign';c.pendingDoor=d;c.fadeDir=1;c.fade=1;
  run('useDoors(0)');assert.equal(c.MAPID,d.to);assert.equal(c.bannerName,null,'no sign on temple room transition');
  run('checkArea()');assert.equal(c.bannerName,null,'area check does not restore room sign');
  c.fadeDir=0;c.fade=0;c.doorMotion=null;c.P.moving=true;run('useDoors(0)');assert(!triggered(),'arrival cooldown prevents bounce');
 }
}
for(const id of ['tp1','ds1','sn1']){
 reset('world',0,0,'u');c.pendingDoor=W.maps.world.doors.find(d=>d.to===id);c.fadeDir=1;c.fade=1;c.bannerName=null;
 run('useDoors(0)');assert.equal(c.bannerName,W.maps[id].title,'temple entrance retains its sign');
}
const royal=JSON.parse(read('assets/game-assets.js').match(/window.EMBER_ASSETS.ROYAL_DATA = (.*);/)[1]);
c.ROYAL_DATA=royal;
run(game.slice(game.indexOf('function shiftActorData('),game.indexOf('function moveEditorActor(')));
run(game.slice(game.indexOf('function installRoyalCastle('),game.indexOf('const KNIGHT_ARENA_ID')));run('installRoyalCastle()');
run(game.slice(game.indexOf('function installCastleCellar()'),game.indexOf('function tryCellarSupplies()')));run('installCastleCellar()');
let stairs=0;
for(const [id,m] of Object.entries(W.maps).filter(([id,m])=>m.royal))for(const a of m.roomActors.filter(a=>a.stairTo)){
 const d=m.doors.find(d=>d.stairDown&&d.to===a.stairTo),east=d.dir==='r',r=d.triggerRect,y=r.y+r.h/2+4,edge=east?r.x-5.5:r.x+r.w+5.5;
 for(const distance of [24,16,8,1]){reset(id,edge+(east?-distance:distance),y,'s',!east);run('useDoors(0)');assert(!triggered(),id+' stair triggers before inner tread');}
 reset(id,edge,y,'s',!east);run('useDoors(0)');assert.equal(triggered(),d,id+' stair inner tread triggers');assert.equal(c.doorMotion.duration,.65);
 assert(Math.abs(edge-a.x)<12,'trigger inside staircase sprite');
 reset(id,edge,y,'s',east);run('useDoors(0)');assert(!triggered(),'walking away does not descend');
 const back=W.maps[d.to].doors.find(b=>b.to===id);reset(id,back.tx*16+8,back.ty*16+16,'s',!east);run('useDoors(0)');assert(!triggered(),'stair arrival safely outside trigger');stairs++;
}
assert(stairs>=8);console.log(`PASS: ${south} south exits trigger inside reachable recesses; ${stairs} castle stairs trigger at their inner tread; ${joins} temple transitions show no room signs.`);

// Walk deeper into every castle south exit, including the throne room and larder.
let royalSouth=0;
for(const [id,m] of Object.entries(W.maps).filter(([id,m])=>m.royal||id==='cinderhold'))for(const d of m.doors||[]){
 if(d.dir!=='d'||d.stairDown)continue;
 const r=d.triggerRect;assert(r&&d.royalRecess,id+' recessed south threshold');
 const x=r.x+r.w/2,mouth=r.y-8;
 for(const depth of [-8,0,4,8]){reset(id,x,mouth+depth,'d');run('useDoors(0)');assert(!triggered(),id+' south threshold too early');}
 for(const depth of [9,12,15]){
  const y=mouth+depth;assert(y<m.h*16,id+' trigger stays on the map');
  assert(!(m.roomBlocks||[]).some(([l,t,r,b])=>x>=l&&x<r&&y-1>=t&&y-1<b),id+' exit floor is reachable');
  reset(id,x,y,'d');run('useDoors(0)');assert.equal(triggered(),d,id+' deep south exit triggers');
 }
 royalSouth++;
}
// Exercise the actual transition across every installed door, including all four
// directions, both exterior passage entrances and stairs that turn on arrival.
let transitions=0;const directions=new Set(),opposite={u:'d',d:'u',l:'r',r:'l'},cardinal={u:'n',d:'s',l:'w',r:'e'};
const exitDir=(d,id)=>d.explicitDir?d.dir:id==='world'?(d.dir||'u'):'d';
for(const [id,m] of Object.entries(W.maps)){
 if(m.templeLegacy)continue;
 for(const d of m.doors||[]){
  if(!W.maps[d.to]||W.maps[d.to].templeLegacy)continue;
  reset(id,0,0,'d');c.pendingDoor=d;c.fadeDir=1;c.fade=1;run('useDoors(0)');
  assert.equal(c.MAPID,d.to);
  const backs=(c.MD.doors||[]).filter(b=>b.to===id);
  backs.sort((a,b)=>{
   c.door=a;const ra=run('doorRect(door)');c.door=b;const rb=run('doorRect(door)');
   return Math.hypot(c.P.x-ra.x-ra.w/2,c.P.y-4-ra.y-ra.h/2)-Math.hypot(c.P.x-rb.x-rb.w/2,c.P.y-4-rb.y-rb.h/2);
  });
  const direction=backs.length?opposite[exitDir(backs[0],d.to)]:exitDir(d,id);
  assert.equal(c.P.dir8,cardinal[direction],id+' → '+d.to+' faces away from destination threshold');
  assert.equal(c.P.dir,direction==='l'||direction==='r'?'s':direction);
  assert.equal(c.P.flip,direction==='l');directions.add(c.P.dir8);transitions++;
  if(m.templeExpanded&&c.MD.templeExpanded)assert.equal(c.P.dir8,cardinal[d.dir],'Connected temple rooms preserve travel direction');
 }
}
assert.deepEqual([...directions].sort(),['e','n','s','w']);
// A one-way exit keeps the direction of passage even without a reciprocal door.
for(const dir of ['u','d','l','r']){
 W.maps.oneway={doors:[]};reset('world',0,0,'d');c.pendingDoor={to:'oneway',tx:5,ty:5,dir,explicitDir:true};c.fadeDir=1;c.fade=1;
 run('useDoors(0)');assert.equal(c.P.dir8,cardinal[dir]);
}
assert(royalSouth>=8);assert(transitions>200);
console.log(`PASS: ${royalSouth} deeper castle exits; correct arrival facing through ${transitions} installed doors and all four one-way directions.`);

// Every doorway has one moving door, and ordinary doors only respond to contact.
c.PC_H=7;
c.foesHeld=false;
let contactDoors=0,northExits=0;
for(const [id,m] of Object.entries(W.maps).filter(([,m])=>m.templeExpanded)){
 const seen=new Set();
 for(const o of m.roomActors.filter(o=>o.templeExit||o.inlineTempleDoor)){
  const key=o.x+','+o.y;assert(!seen.has(key),id+' duplicate closed door behind animated door');seen.add(key);
  if(!o.templePassDoor)continue;
  contactDoors++;c.o=o;
  reset(id,o.x,o.y+40,'u');assert(!run('touchExpandedTempleDoor(P.x,P.y-2,-1)'));assert(!o.entered,'proximity alone must not open');
  reset(id,o.x,o.y+8,'u');assert(run('touchExpandedTempleDoor(P.x,P.y-2,-1)'));assert(o.entered,'contact starts northward opening');
  o.openT=.3;assert(!run('touchExpandedTempleDoor(P.x,P.y-2,-1)'),'fully opened leaf permits movement');
  o.openT=0;o.entered=false;reset(id,o.x,o.y-32,'d');assert(run('touchExpandedTempleDoor(P.x,P.y+2,1)'));assert(o.entered,'southward contact also opens');
  o.openT=0;o.entered=false;reset(id,o.x+32,o.y+8,'u');assert(!run('touchExpandedTempleDoor(P.x,P.y-2,-1)'));assert(!o.entered,'walking alongside door does not open it');
 }
 for(const d of m.doors.filter(d=>d.dir==='u')){
  northExits++;const r=d.triggerRect,x=r.x+r.w/2,y=r.y+r.h;
  reset(id,x,y+8,'u');run('useDoors(0)');assert(!triggered(),id+' north exit must not open before contact');
  reset(id,x,y+7,'u');run('useDoors(0)');
  if(!(d.templeGuards||d.sandspireGuards)?.length)assert.equal(triggered(),d,id+' north threshold opens on contact');
 }
}
console.log(`PASS: ${contactDoors} contact-only passage doors, no duplicate door layers, ${northExits} north exits require contact.`);

// The dev bypass applies immediately, without waiting for a draw or gate tick.
run(game.slice(game.indexOf('function blockedByTempleGate('),game.indexOf('function repairCoralmere(')));
c.foesHeld=true;
let bypassDoors=0,bypassGates=0;
for(const [id,m] of Object.entries(W.maps).filter(([,m])=>m.templeExpanded)){
  c.MD=m;c.MAPID=id;m.templeGateOpen=0;
  for(const o of m.roomActors.filter(o=>o.templePassDoor)){
    o.openT=0;o.entered=false;c.P={x:o.x,y:o.y+8};
    assert(!run('touchExpandedTempleDoor(P.x,P.y-2,-1)'),id+' paused foes bypass north leaf');
    c.P.y=o.y-32;assert(!run('touchExpandedTempleDoor(P.x,P.y+2,1)'),id+' paused foes bypass south leaf');
    assert.equal(o.entered,false,'dev bypass does not mark a door used');bypassDoors++;
  }
  for(const d of m.doors){c.d=d;assert(!run('expandedTempleDoorLocked(d)'),id+' guard lock bypass');}
  if(m.templePlan.gate){const [l,t,r,b]=m.templePlan.gate;c.point=[(l+r)/2,(t+b)/2];
    assert(!run('expandedTempleSolid(...point)'),id+' bars immediately traversable');
    c.foesHeld=false;assert(run('expandedTempleSolid(...point)'),id+' bars restore with foes enabled');c.foesHeld=true;bypassGates++;
  }
}
c.MD={templeContinuous:true,templeGates:[{y:100,open:0}]};
assert(!run('blockedByTempleGate(160,92)'));c.foesHeld=false;assert(run('blockedByTempleGate(160,92)'));
console.log(`PASS: FOES bypasses ${bypassDoors} passage leaves in both directions, all guard locks, ${bypassGates} boss gates and legacy gates; normal locks restore.`);
