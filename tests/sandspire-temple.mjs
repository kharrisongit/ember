import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const plan=JSON.parse(read('assets/interiors/sandspire-temple/layout.json'));
const first=JSON.parse(read('assets/interiors/first-temple/layout.json'));
const W={maps:{ds1:{doors:[{to:'world',tx:1846,ty:317}]},world:{doors:[{to:'ds1'}]},tp1:{unchanged:true},sn1:{unchanged:true}}};
let clock=0,reveals=0,rises=0,hits=0,saved=null;
const c=vm.createContext({W,fetch:async()=>({ok:true,json:async()=>structuredClone(plan)}),Image:class{async decode(){}},terrRLE:a=>'0.'+a.length,DIRT:0,
 CHESTS:[{map:'ds1',gift:'ice'}],chestOpen:{},breathHas:{ice:false,lightning:false},bossGone:{},foesHeld:false,foes:[],P:{},tAcc:0,sceneHold:()=>false,fadeDir:0,
 performance:{now:()=>clock},gold:0,potions:0,boarMeat:0,dragonFish:0,flyGold(){},showReveal(){reveals++;},showRise(){rises++;},rebuildBuckets(){},hurtPlayer(){hits++;},saveGame(){},toast(){},
 FOE:{ghost:{hp:6},wraith:{hp:8},golem1:{hp:12}},TS:16,NO_RESPAWN:/golem/,royalDefeated:{},knightEncounterDone:false,MAPID:'world'});
const run=s=>vm.runInContext(s,c),game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
run(read('js/first-temple.js'));run(read('js/house-loot.js'));run(read('js/sandspire-temple.js'));
run(game.slice(game.indexOf('const ROUTE_2_HP_START_X'),game.indexOf('const FOE_ART')));
run(game.slice(game.indexOf('function spawnFoes() {'),game.indexOf('function swordOverlaps(')));
run(game.slice(game.indexOf('function markBossGone(f) {'),game.indexOf('function bossRing(')));
await run('prepareExpandedSandspireTemple()');await run('prepareExpandedSandspireTemple()');
assert.deepEqual(W.maps.tp1,{unchanged:true});assert.deepEqual(W.maps.sn1,{unchanged:true});
const inside=(m,x,y)=>m.templeFloors.some(([l,t,r,b])=>x>=l&&x<r&&y>=t&&y<b);
const clear=(m,x,y,gate=false)=>[[x-6,y-12],[x+6,y-12],[x-6,y-1],[x+6,y-1]].every(([px,py])=>inside(m,px,py)&&!m.roomBlocks.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&!(gate&&m.templePlan.gate&&px>=m.templePlan.gate[0]&&px<m.templePlan.gate[2]&&py>=m.templePlan.gate[1]&&py<m.templePlan.gate[3]));
function flood(m,gate=false){const start=m.spawn.map(n=>Math.round(n/8)*8),dist=new Map([[start.join(','),0]]),q=[start];for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const n of [[x-8,y],[x+8,y],[x,y-8],[x,y+8]]){const key=n.join(',');if(!dist.has(key)&&clear(m,...n,gate)){dist.set(key,dist.get(q[i].join(','))+8);q.push(n);}}}return dist;}
const area=plans=>Object.values(plans).reduce((sum,m)=>{const tiles=new Set();for(const [l,t,r,b] of m.floors)for(let y=t;y<b;y+=16)for(let x=l;x<r;x+=16)tiles.add(x+','+y);return sum+tiles.size;},0);
assert.equal(Object.keys(plan).length,10);assert.equal(Object.values(plan).reduce((n,m)=>n+m.chambers.length,0),40);assert(area(plan)>=area(first)*2);
let chests=0,empty=0,ambush=0,doors=0,west=0,east=0,trapCount=0;const distances={};
for(const [id,p] of Object.entries(plan)){
 const m=W.maps[id];assert.equal(m.travel,id==='ds1');assert(clear(m,...m.spawn),id+' spawn');distances[id]=flood(m);
 if(id!=='ds_sanctum')assert(p.chambers.every(([l,t,r,b])=>r-l===128&&b-t===96));
 const n=p.chambers[0],far=p.chambers.at(-1);if(far[0]<n[0])west++;else if(far[0]>n[0])east++;
 for(const a of m.roomActors.filter(a=>a.houseLoot)){
  chests++;if(a.houseLoot.ghost)ambush++;else if(a.houseLoot.gold===0)empty++;
  assert.equal(a.spr,'temple71_chest');const room=p.chambers.find(([l,t,r,b])=>a.x>l&&a.x<r&&a.y>t&&a.y<b);
  assert(a.y-room[1]===24&&Math.min(a.x-room[0],room[2]-a.x)===24,id+' upper corner');
  assert(distances[id].has([a.x,a.y+24].join(',')),id+' chest reachable');assert(!clear(m,a.x,a.y+8),id+' chest collision');
 }
 for(const d of m.doors){
  doors++;const rect=d.triggerRect;
  assert(distances[id].has([rect.x+16,d.dir==='u'?rect.y+rect.h+16:rect.y-16].join(',')),id+' door reachable');
  if(d.to!=='world'){assert(W.maps[d.to].doors.some(back=>back.to===id));assert(clear(W.maps[d.to],d.tx*16+8,d.ty*16+16),id+' arrival');}
 }
 for(const f of m.foes)assert(clear(m,f.x*16+8,f.y*16+16),id+' foe spawn');
 for(const p of m.templePlan.passages||[])for(let y=p.y-48;y<=p.y+16;y+=8)assert(distances[id].has([p.x,y].join(',')),id+' connected doorway');
 for(const h of p.hazards||[]){trapCount++;assert(distances[id].has(h.lever.join(',')),id+' reachable lever');}
 c.MD=m;c.MAPID=id;run('spawnFoes()');assert(c.foes.every(f=>!f.chestAmbush),'closed chests do not spawn ghosts');assert(c.foes.every(f=>f.hp>=12),'late-game HP applies in every section');
}
assert.equal(chests,18);assert.equal(empty,4);assert.equal(ambush,3);assert.equal(doors,19);assert(west>=3&&east>=3);assert.equal(trapCount,9);
const graph=new Set();for(const [id,m]of Object.entries(plan))for(const d of m.doors)graph.add([id,d.to].sort().join(':'));assert.equal(graph.size,9,'tree topology: one path to boss');
const route=['ds1','ds_west','ds_foundry','ds_winding','ds_deepworks','ds_approach','ds_sanctum'];
let distance=0;for(let i=0;i<route.length-1;i++){const id=route[i],d=plan[id].doors.find(d=>d.to===route[i+1]);assert(d);distance+=distances[id].get([d.x,d.y+16].join(','));}
assert(distance>7000,'boss requires a long seven-section route');
console.log(`PASS: 10 sections / 40 compact rooms, ${(area(plan)/area(first)).toFixed(2)}× Forgewick floor area, ${distance}px main route, ${west} westward / ${east} eastward wings; all chests, levers, doorways and enemy placements reachable.`);
// Sealed passages require the exact chamber's guards; side encounters are optional.
for(const id of ['ds_west','ds_deepworks']){
 c.MD=W.maps[id];c.MAPID=id;c.d=c.MD.doors.find(d=>d.sandspireGuards);assert(c.d.sandspireGuards.length>=2);assert(run('sandspireDoorLocked(d)'));
 for(const i of c.d.sandspireGuards)c.bossGone[id+':'+i]=true;
 assert(!run('sandspireDoorLocked(d)'));
}
c.MD=W.maps.ds_sanctum;c.MAPID='ds_sanctum';const heart=plan.ds_sanctum.heartstone;
assert(!flood(c.MD,true).has([heart[0],heart[1]+24].join(',')));assert(flood(c.MD).has([heart[0],heart[1]+24].join(',')));
run('stepExpandedTemple(1)');assert.equal(c.MD.templeGateOpen,0);c.bossGone['ds_sanctum:0']=true;run('stepExpandedTemple(1)');assert.equal(c.MD.templeGateOpen,0);
c.bossGone['ds_sanctum:1']=true;run('stepExpandedTemple(1)');assert.equal(c.MD.templeGateOpen,1);assert.equal(c.CHESTS[0].map,'ds_sanctum');
assert(c.MD.foes.every(f=>f.k==='golem1'));assert.equal(c.MD.roomActors.filter(a=>a.spr==='first_temple_torch'&&a.y<160).length,0);
const jars=c.MD.roomActors.filter(a=>a.spr==='scientist_flask');assert.equal(jars.length,2,'original floating creature jars restored');
assert(jars.every(a=>a.stillFrame===undefined&&a.moveBlocks?.length),'jars animate and retain their own collision');
const jarArt=JSON.parse(read('js/generated/game-part-1.js').match(/\{"name":"scientist_flask"[^\n]*?\}/)[0]);assert.equal(jarArt.frames,6);
const webs=Object.values(W.maps).flatMap(m=>(m.roomActors||[]).filter(a=>a.spr==='scientist_web'));
assert(webs.length>=60&&webs.some(a=>a.templeWebFlip),'cobwebs occupy both left and right wall corners throughout Sandspire');
// Each ghost waits for its lid, is hostile, spawns once, and survives a map reload until killed.
for(const [id,m] of Object.entries(W.maps))for(const a of m.roomActors?.filter(a=>a.houseLoot?.ghost)||[]){
 c.MD=m;c.MAPID=id;run('spawnFoes()');c.P={x:a.x,y:a.y+24};const before=c.foes.length,revealCount=reveals,riseCount=rises;
 assert(run('tryHouseLootChest()'));assert(run('tryHouseLootChest()'));assert.equal(c.foes.length,before);
 clock+=740;run('stepLootChestOpening()');assert.equal(c.foes.length,before);
 clock+=20;run('stepLootChestOpening()');assert.equal(c.foes.length,before+1);assert.equal(rises,riseCount+1);assert.equal(reveals,revealCount);
 let f=c.foes.find(f=>f.chestAmbush===a.houseLoot.id);assert(f&&!f.ally&&f.hold>0&&f.emerge===0);assert(clear(m,f.x,f.y));
 // Killing a ghost during its emergence must cancel the hold, never revive it.
 c.rising={...f};run('markBossGone(rising)');assert.equal(c.rising.hold,0);assert.equal(c.rising.emerge,1);delete c.bossGone[id+':'+f.idx];
 run('spawnFoes()');f=c.foes.find(f=>f.chestAmbush===a.houseLoot.id);assert(f,'unbeaten ghost returns with the opened chest');
 c.f=f;run('markBossGone(f);spawnFoes()');assert(!c.foes.some(f=>f.chestAmbush===a.houseLoot.id));
}
// Arrow/cannon hazards cannot act as invisible spikes, cross walls, or survive their lever.
for(const [id,m] of Object.entries(W.maps))for(const h of m.templePlan?.hazards||[]){
 c.MD=m;c.MAPID=id;c.foes=[];c.tAcc=2.8;c.P={x:(h.cross[0]+h.cross[1])/2,y:h.lines[0]};const before=hits;
 run('stepExpandedTemple(0)');assert.equal(hits-before,h.type==='spikes'?1:0);
 if(h.type!=='spikes'){
  m.templeClock=2.3;run('stepSandspireTemple(0)');assert(m.templeShots.some(s=>s.hall===h.id));
  m.templeMachines.forEach(a=>a.lastCycle=100);run('stepSandspireTemple(1)');assert(m.templeShots.every(s=>s.x>s.minX&&s.x<s.maxX));
 }
 c.P={x:h.lever[0],y:h.lever[1]};assert(run('tryExpandedTempleLever()'));assert(run('expandedTrapDisabled('+JSON.stringify(h.id)+')'));
 run('stepSandspireTemple(0)');assert(m.templeShots.every(s=>s.hall!==h.id));
}
// Save persistence and slot isolation use the actual game serializer/loader.
Object.assign(c,{quest:1,smithUpgrade:false,glassShield:false,wonAll:0,cinderSeal:false,trialSealPlaced:false,trialWins:0,thornwellMet:false,brambleQuest:0,
 treasuryTaken:new Set(),dragon:{hp:5,maxHp:5},fishingPole:false,trial:null,activeSaveSlot:1,migrateLegacySave(){},readSaveSlot:()=>saved,
 syncDragonVitality(){},hasSword:()=>true,loadMap(id){c.MAPID=id;c.MD=W.maps[id];},recoverTempleArrival(){},cam:{},clampCam(){},chunks:{clear(){}}});
run(part3.slice(part3.indexOf('function captureSave()'),part3.indexOf('function saveToSlot(')));
run(part3.slice(part3.indexOf('function loadGame('),part3.indexOf('let mounted =')));
c.MAPID='ds_west';c.MD=W.maps.ds_west;c.P={x:544,y:1536};saved=JSON.parse(JSON.stringify(run('captureSave()')));
assert.equal(saved.sandspireLayoutVersion,1);assert(Object.keys(saved.templeDefeated).some(k=>k.startsWith('ds_')));assert.equal(saved.houseLootTaken.length,3);
for(const k of Object.keys(c.bossGone))delete c.bossGone[k];run('houseLootTaken.clear()');assert(run('loadGame(1)'));
assert.deepEqual(c.bossGone,saved.templeDefeated);assert.equal(run('houseLootTaken.size'),3);
// A different slot must discard an unfinished opening and another slot's claimed Heartstone.
c.breathHas.ice=true;c.breathHas.shadow=true;c.chestOpen.ds_sanctum=true;c.chestOpen.sn1=true;c.chestAnim={c:{map:'ds_sanctum'},t:0,phase:'lid'};
saved={map:'ds1',x:160,y:1000,gold:0,quest:1,templeLayoutVersion:2,breathHas:{ice:false,lightning:false}};
assert(run('loadGame(2)'));assert.deepEqual([c.P.x,c.P.y],plan.ds1.spawn);assert.equal(run('houseLootTaken.size'),0);assert.equal(Object.keys(c.bossGone).length,0);
assert.equal(c.chestAnim,null);assert.equal(c.chestOpen.ds_sanctum,false);assert(!c.chestOpen.sn1);assert.equal(c.breathHas.ice,false);assert.equal(c.breathHas.shadow,false);
console.log('PASS: chamber seals, two Stone Golems guarding Ice Heartstone, three delayed one-time ghost ambushes, projectile bounds, all trap levers, actual save/load, old-save relocation and slot isolation.');
// Retain the actual interior teleport entry and safe destination.
run(game.slice(game.indexOf('function storyTeleport(id) {'),game.indexOf('const KING_DRAGON_SPR')));
run(part3.slice(part3.indexOf('function placesOf() {'),part3.indexOf('function buildTravel() {')));
Object.assign(c,{features:[],MAPID:'world',isArea:()=>false});const place=run('placesOf()').find(p=>p.map==='ds1');assert(place);assert(clear(W.maps.ds1,place.x*16+8,place.y*16+16));
console.log('PASS: Sandspire interior is listed in dev teleport and lands on clear floor.');
