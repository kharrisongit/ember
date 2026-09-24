import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js'),assets=read('js/generated/game-part-1.js');
const W={maps:{world:{npcs:[],doors:['tp1','ds1','sn1'].map(to=>({to}))}}};
for(const prefix of ['tp','ds','sn'])for(let i=1;i<=4;i++)W.maps[prefix+i]={doors:[{to:'world',tx:1,ty:1}],npcs:[],travel:i===1};
W.maps.tp4.npcs.push({n:'Alderic'});
const buttons=[],list={innerHTML:'',appendChild:b=>buttons.push(b)};
let travelClosed=false;
const c=vm.createContext({W,TS:16,DIRT:0,terrRLE:a=>'0.'+a.length,WALL78_PIECES:JSON.parse(assets.match(/const WALL78_PIECES=(.*);/)[1]),
 fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url.split('?')[0]))}),Image:class{async decode(){}},
 breathHas:{},chestOpen:{},features:[],MAPID:'world',MD:W.maps.world,P:{},dragon:{placed:'old'},chunks:new Map(),cam:{z:1},VW:400,VH:300,
 isArea:()=>false,playZoom:()=>1,clampCam(){},checkArea(){},setDevTitle(){},toast(){},setTravel:on=>{travelClosed=!on;},
 document:{getElementById:()=>list,createElement:()=>({handlers:{},addEventListener(type,fn){this.handlers[type]=fn;}})}});
const run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('const CHESTS = ['),game.indexOf('function chestHere()')));
run(game.slice(game.indexOf('function installFirstTemple(){'),game.indexOf('const foeVisibleTopCache82')));
run('installFirstTemple();installSecondTemple();installThirdTemple();refineSecondTemple();finishTempleLayouts77();refineTemples78();finishTempleLayouts82();');
run(read('js/first-temple.js'));run(read('js/sandspire-temple.js'));run(read('js/hollybeck-temple.js'));
await run('prepareExpandedFirstTemple()');await run('prepareExpandedSandspireTemple()');const originalChamber=JSON.parse(JSON.stringify({actors:W.maps.sn1.roomActors.filter(a=>!a.editableWall&&a.y<512),blocks:W.maps.sn1.roomBlocks.filter(b=>b[1]<512)}));
const originalChest=JSON.parse(JSON.stringify(run('CHESTS.find(c=>c.gift==="shadow")')));
await run('prepareExpandedHollybeckTemple()');await run('prepareExpandedHollybeckTemple()');
const plan=JSON.parse(read('assets/interiors/hollybeck-temple/layout.json')),sand=JSON.parse(read('assets/interiors/sandspire-temple/layout.json'));
const maps=Object.entries(W.maps).filter(([id,m])=>m.hollybeck);
const area=plans=>Object.values(plans).reduce((n,m)=>n+new Set(m.floors.flatMap(([l,t,r,b])=>Array.from({length:(r-l)/16*(b-t)/16},(_,i)=>[l+i%((r-l)/16)*16,t+Math.floor(i/((r-l)/16))*16].join(',')))).size,0);
assert.equal(maps.length,20);assert(area(plan)>=area(sand)*2);assert.equal(maps.reduce((n,[id,m])=>n+m.templePlan.chambers.length,0),89);
const clear=(m,x,y,gate=false)=>[[x-6,y-12],[x+6,y-12],[x-6,y-1],[x+6,y-1]].every(([px,py])=>
 m.templeFloors.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&!m.roomBlocks.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&
 !(gate&&m.templePlan.gate&&px>=m.templePlan.gate[0]&&px<m.templePlan.gate[2]&&py>=m.templePlan.gate[1]&&py<m.templePlan.gate[3]));
function flood(m,gate=false){const start=m.spawn.map(n=>Math.round(n/8)*8),dist=new Map([[start.join(','),0]]),q=[start];for(let i=0;i<q.length;i++){
 const [x,y]=q[i];for(const n of [[x-8,y],[x+8,y],[x,y-8],[x,y+8]]){const k=n.join(',');if(!dist.has(k)&&clear(m,...n,gate)){dist.set(k,dist.get(q[i].join(','))+8);q.push(n);}}}return dist;}
let clock=0,notices=0,rises=0,hits=0,saved=null;
Object.assign(c,{performance:{now:()=>clock},FOE:{ghost3:{hp:6},wraith:{hp:8},golem2:{hp:16}},NO_RESPAWN:/golem/,
 bossGone:{},royalDefeated:{},knightEncounterDone:false,foesHeld:false,foes:[],gold:0,potions:0,elixirs:0,bombs:0,dust:0,bells:0,marks:0,breaths:0,stones:0,salts:0,boarMeat:0,dragonFish:0,tAcc:0,
 sceneHold:()=>false,fadeDir:0,flyGold(){},showReveal(){assert.fail("Loot must not open a full-screen reveal");},toast(){notices++;},showRise(){rises++;},rebuildBuckets(){},hurtPlayer(){hits++;},saveGame(){}});
run(read('js/house-loot.js'));
run(game.slice(game.indexOf('const ROUTE_2_HP_START_X'),game.indexOf('const FOE_ART')));
run(game.slice(game.indexOf('function spawnFoes() {'),game.indexOf('function swordOverlaps(')));
run(game.slice(game.indexOf('function markBossGone(f) {'),game.indexOf('function bossRing(')));
const distances={},edges=new Set();let chests=0,empty=0,ambush=0,horizontal=0,seals=0,traps=0;
for(const [id,m] of maps){
 assert.equal(m.travel,id==='sn1');assert(clear(m,...m.spawn));const p=m.templePlan;distances[id]=flood(m);
 if(id!=='sn_sanctum')assert(p.chambers.every(([l,t,r,b])=>r-l===128&&b-t===96),'compact rooms');
 horizontal+=p.floors.filter(([l,t,r,b])=>b-t===32&&r-l>=160).length;
 for(const a of m.roomActors.filter(a=>a.houseLoot)){
  chests++;if(a.houseLoot.ghost)ambush++;else if(a.houseLoot.gold===0)empty++;
  const room=p.chambers.find(([l,t,r,b])=>a.x>l&&a.x<r&&a.y>t&&a.y<b);
  assert.equal(a.spr,'temple71_chest');assert.equal(a.y-room[1],24);assert.equal(Math.min(a.x-room[0],room[2]-a.x),24);
  assert(distances[id].has([a.x,a.y+24].join(',')),id+' chest approach');assert(!clear(m,a.x,a.y+8),id+' chest collision');
 }
 for(const d of m.doors){
  const r=d.triggerRect;assert(distances[id].has([r.x+16,d.dir==='u'?r.y+r.h+16:r.y-16].join(',')),id+' doorway reachable');
  if(d.to==='world')continue;
  edges.add([id,d.to].sort().join(':'));assert(W.maps[d.to].doors.some(back=>back.to===id));assert(clear(W.maps[d.to],d.tx*16+8,d.ty*16+16),id+' arrival');
  if(d.dir==='u')assert(m.roomActors.some(a=>a.templeExit&&a.x===r.x+16&&a.y===r.y+r.h),'cross-level door has black opening');
  if(d.templeGuards){seals++;c.MD=m;c.MAPID=id;c.d=d;assert(run('expandedTempleDoorLocked(d)'));for(const i of d.templeGuards)c.bossGone[id+':'+i]=true;assert(!run('expandedTempleDoorLocked(d)'));}
 }
 for(const f of m.foes)assert(clear(m,f.x*16+8,f.y*16+16),id+' enemy spawn');
 for(const pass of p.passages)for(let y=pass.y-48;y<=pass.y+16;y+=8)assert(distances[id].has([pass.x,y].join(',')),id+' connected arch');
 for(const h of p.hazards){traps++;assert(distances[id].has(h.lever.join(',')),id+' lever reachable');}
 c.MD=m;c.MAPID=id;run('spawnFoes()');assert(c.foes.every(f=>!f.chestAmbush&&f.hp>=12));
}
assert.equal(chests,38);assert.equal(empty,8);assert.equal(ambush,8);assert.equal(horizontal,39);assert.equal(seals,5);assert.equal(traps,29);assert.equal(edges.size,19,'single path through branching tree');
const route=['sn1','sn_west','sn_banners','sn_east','sn_furnaces','sn_crossing','sn_saws','sn_return','sn_vigil','sn_ascent','sn_sanctum'];
let routeLength=0;
for(let i=0;i<route.length-1;i++){const id=route[i],m=W.maps[id],d=m.doors.find(d=>d.to===route[i+1]);assert(d);routeLength+=distances[id].get([d.triggerRect.x+16,d.triggerRect.y+32].join(','));
 const rooms=m.templePlan.chambers;assert((rooms[1][0]-rooms[0][0])*(rooms[3][0]-rooms[2][0])<0,'every main wing turns east AND west');}
assert(routeLength>20000);
const sanctum=W.maps.sn_sanctum,preserved=sanctum.roomActors.filter(a=>a.preservedHeartstoneProp);
assert.equal(preserved.length,12);assert(!preserved.some(a=>a.spr==='scientist_gold'));
for(const [i,b]of originalChamber.actors.entries()){
 if(b.spr==='scientist_gold')continue;
 const a=preserved.find(a=>a.editKey==='sn_sanctum:original:'+i);assert(a);assert.equal(a.spr,b.spr);
 assert.equal(a.x,b.x+(b.spr==='dragon75_banner_red'?(b.x<160?14:-14):0));assert.equal(a.y,b.y-256);
}
for(const [l,t,r,b]of originalChamber.blocks){
 const isChest=Math.abs((l+r)/2-(originalChest.x*16+8))<3&&Math.abs(b-(originalChest.y*16+16))<2&&r-l<32;
 const expected=isChest?[150,128,170,136]:[l,t-256,r,b-256];
 assert(sanctum.roomBlocks.some(box=>box.join(',')===expected.join(',')));
}
const heart=plan.sn_sanctum.heartstone;assert(!flood(sanctum,true).has([heart[0],heart[1]+32].join(',')));assert(flood(sanctum).has([heart[0],heart[1]+32].join(',')));
c.MD=sanctum;c.MAPID='sn_sanctum';run('stepExpandedTemple(1)');assert.equal(sanctum.templeGateOpen,0);
c.bossGone['sn_sanctum:0']=true;run('stepExpandedTemple(1)');assert.equal(sanctum.templeGateOpen,0);
c.bossGone['sn_sanctum:1']=true;run('stepExpandedTemple(1)');assert.equal(sanctum.templeGateOpen,1);
assert(sanctum.foes.every(f=>f.k==='golem2'));assert.equal(run('CHESTS.find(c=>c.gift==="shadow").map'),'sn_sanctum');
console.log(`PASS: ${maps.length} sections / 89 compact rooms, ${(area(plan)/area(sand)).toFixed(2)}× Sandspire, ${routeLength}px main route, 39 horizontal links, 9 side branches; all doors, chests, enemies and levers reachable; gold removed, banners inset and chest collision moved with the chest.`);
for(const [id,m] of maps)for(const a of m.roomActors.filter(a=>a.houseLoot)){
 c.MD=m;c.MAPID=id;run('spawnFoes()');c.P={x:a.x,y:a.y+24};const before=c.foes.length,noticeCount=notices,riseCount=rises,oldGold=c.gold;
 assert(run('tryHouseLootChest()'));assert(run('tryHouseLootChest()'));assert.equal(c.gold,oldGold+a.houseLoot.gold);assert.equal(c.foes.length,before);
 clock+=740;run('stepLootChestOpening()');assert.equal(c.foes.length,before);clock+=20;run('stepLootChestOpening()');
 if(a.houseLoot.ghost){
  assert.equal(c.foes.length,before+1);assert.equal(rises,riseCount+1);assert.equal(notices,noticeCount+2);
  let f=c.foes.find(f=>f.chestAmbush===a.houseLoot.id);assert(f&&!f.ally&&f.hold>0);assert(clear(m,f.x,f.y));
  run('spawnFoes()');f=c.foes.find(f=>f.chestAmbush===a.houseLoot.id);assert(f,'unbeaten ambush returns after reload');
  c.f=f;run('markBossGone(f);spawnFoes()');assert(!c.foes.some(f=>f.chestAmbush===a.houseLoot.id));
 }else assert.equal(notices,noticeCount+2);
}
for(const [id,m] of maps)for(const h of m.templePlan.hazards){
 c.MD=m;c.MAPID=id;c.foes=[];c.tAcc=2.8;c.P={x:(h.cross[0]+h.cross[1])/2,y:h.lines[0]};m.templeClock=2;
 const before=hits;run('stepExpandedTemple(0)');assert(hits>before,id+' '+h.type+' damages only while active');
 for(let i=0;i<100;i++){run('stepHollybeckTemple(.05)');assert(m.templeHazards.every(a=>a.x>=a.minX&&a.x<a.maxX),'saws stay inside corridor');}
 c.P={x:h.lever[0],y:h.lever[1]};assert(run('tryExpandedTempleLever()'));assert(run('expandedTrapDisabled('+JSON.stringify(h.id)+')'));
 run('stepHollybeckTemple(0)');assert(m.templeHazards.filter(a=>a.hall===h.id).every(a=>!a.active&&a.frame===0));
}
Object.assign(c,{quest:1,smithUpgrade:false,glassShield:false,wonAll:0,cinderSeal:false,trialSealPlaced:false,trialWins:0,thornwellMet:false,brambleQuest:0,
 treasuryTaken:new Set(),dragon:{hp:5,maxHp:5},fishingPole:false,trial:null,activeSaveSlot:1,migrateLegacySave(){},readSaveSlot:()=>saved,
 syncDragonVitality(){},hasSword:()=>true,loadMap(id){c.MAPID=W.maps[id].templeLegacy||id;c.MD=W.maps[c.MAPID];},cam:{},clampCam(){},chunks:{clear(){}},
 canStand:(x,y)=>clear(c.MD,x,y)});
run(game.slice(game.indexOf('function recoverTempleArrival('),game.indexOf('function blockedByTempleGate(')));
run(part3.slice(part3.indexOf('function captureSave()'),part3.indexOf('function saveToSlot(')));
run(part3.slice(part3.indexOf('function loadGame('),part3.indexOf('let mounted =')));
c.MAPID='sn_west';c.MD=W.maps.sn_west;c.P={x:c.MD.spawn[0],y:c.MD.spawn[1]};saved=JSON.parse(JSON.stringify(run('captureSave()')));
assert.equal(saved.hollybeckLayoutVersion,1);assert(Object.keys(saved.templeDefeated).some(k=>k.startsWith('sn_')));assert.equal(saved.houseLootTaken.length,38);
for(const k of Object.keys(c.bossGone))delete c.bossGone[k];run('houseLootTaken.clear()');assert(run('loadGame(1)'));assert.deepEqual(c.bossGone,saved.templeDefeated);assert.equal(run('houseLootTaken.size'),38);
for(const map of ['sn1','sn4']){
 c.breathHas.shadow=true;run('chestOpen.sn_sanctum=true;chestAnim={c:CHESTS[1],t:0}');
 saved={map,x:160,y:1000,gold:0,quest:1,templeLayoutVersion:2,breathHas:{shadow:false}};
 assert(run('loadGame(2)'));assert.equal(c.MAPID,'sn1');assert.deepEqual([c.P.x,c.P.y],plan.sn1.spawn);
 assert.equal(run('houseLootTaken.size'),0);assert.equal(Object.keys(c.bossGone).length,0);assert(!c.breathHas.shadow);assert(!run('chestOpen.sn_sanctum'));assert.equal(run('chestAnim'),null);
}
console.log('PASS: 38 one-time chests, eight empty chests, eight delayed hostile ambushes, five guarded exits, two Frost Golems, all 29 trap levers, save persistence, slot isolation and legacy-save relocation.');
