import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const plan=JSON.parse(read('assets/interiors/first-temple/layout.json'));
const W={maps:{tp1:{doors:[{to:'world',tx:958,ty:272}],npcs:[{n:'Alderic'}]},world:{doors:[{to:'tp1'}]},sn1:{unchanged:true},ds1:{unchanged:true}}};
const c=vm.createContext({W,fetch:async()=>({ok:true,json:async()=>structuredClone(plan)}),Image:class{async decode(){}},terrRLE:a=>'0.'+a.length,DIRT:0,CHESTS:[{map:'tp1',gift:'lightning'}],chestOpen:{},breathHas:{lightning:false},bossGone:{},foesHeld:false,foes:[],P:{},tAcc:0,sceneHold:()=>false,fadeDir:0,hurtPlayer(){},saveGame(){},toast(){}});
vm.runInContext(read('js/first-temple.js'),c);vm.runInContext(read('js/sandspire-temple.js'),c);const run=s=>vm.runInContext(s,c);await run('prepareExpandedFirstTemple()');
assert.equal(Object.keys(W.maps).filter(k=>W.maps[k].templeExpanded).length,5);
assert.deepEqual(W.maps.sn1,{unchanged:true});assert.deepEqual(W.maps.ds1,{unchanged:true});
const inside=(m,x,y)=>m.templeFloors.some(([l,t,r,b])=>x>=l&&x<r&&y>=t&&y<b);
const clear=(m,x,y,gate=false)=>[[x-6,y-12],[x+6,y-12],[x-6,y-1],[x+6,y-1]].every(([px,py])=>inside(m,px,py)&&!m.roomBlocks.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&!(gate&&m.templePlan.gate&&px>=m.templePlan.gate[0]&&px<m.templePlan.gate[2]&&py>=m.templePlan.gate[1]&&py<m.templePlan.gate[3]));
function flood(m,gate=false){const start=m.spawn.map(n=>Math.round(n/8)*8),seen=new Set([start.join(',')]),q=[start];for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const n of [[x-8,y],[x+8,y],[x,y-8],[x,y+8]]){const key=n.join(',');if(!seen.has(key)&&clear(m,...n,gate)){seen.add(key);q.push(n);}}}return seen;}
let chests=0,doors=0;
for(const [id,m] of Object.entries(W.maps)){
 if(!m.templeExpanded)continue;
 if(id!=='tp1_sanctum')assert(m.templePlan.chambers.every(([l,t,r,b])=>r-l<=128&&b-t<=96),'compact chamber footprint');assert(clear(m,...m.spawn));
 const reached=flood(m);
 for(const a of m.roomActors.filter(a=>a.houseLoot)){chests++;assert.equal(a.spr,'temple71_chest','loot uses standard chest');assert(reached.has([a.x,a.y+24].join(',')),id+' chest reachable');assert(!clear(m,a.x,a.y+8),id+' chest blocks movement');}
 for(const d of m.doors){doors++;const r=d.triggerRect;
  assert(reached.has([r.x+16,d.dir==='u'?r.y+r.h+16:r.y-16].join(',')),id+' door approach');
  if(d.to==='world')continue;
  const dest=W.maps[d.to];assert(dest.doors.some(back=>back.to===id));assert(clear(dest,d.tx*16+8,d.ty*16+16),id+' safe arrival');
 }
 for(const f of m.foes)assert(clear(m,f.x*16+8,f.y*16+16),id+' enemy spawn');
 for(const p of m.templePlan.passages||[]){
  const actor=m.roomActors.find(a=>a.inlineTempleDoor&&a.x===p.x&&a.y===p.y);assert(actor,'connected archway exists');
  assert(p.mode==='open'?actor.stillFrame===3:actor.templePassDoor,'open arches and approaching-player doors');
  for(let y=p.y-48;y<=p.y+16;y+=8)assert(reached.has([p.x,y].join(',')),id+' doorway connects both sides');
  assert(!m.doors.some(d=>d.triggerRect.x<=p.x&&p.x<d.triggerRect.x+d.triggerRect.w&&Math.abs(d.triggerRect.y-p.y)<64),'inline doorway does not change maps');
 }
}
assert.equal(chests,8);assert.equal(doors,9);
const corridors=Object.values(plan).flatMap(m=>m.floors.filter(([l,t,r,b])=>r-l<=64||b-t<=32));
const northLength=corridors.filter(([l,t,r,b])=>b-t>r-l).reduce((n,[l,t,r,b])=>n+b-t,0);
const sideways=corridors.filter(([l,t,r,b])=>r-l>b-t);
assert.equal(sideways.length,3,'occasional horizontal links between northern wings');
assert(northLength>4*sideways.reduce((n,[l,t,r,b])=>n+r-l,0),'north-running halls dominate the layout');
assert.deepEqual(plan.tp1_sanctum.chambers,[[80,288,272,400],[112,64,256,160]],'guardian and heartstone room sizes preserved');
const sanctum=W.maps.tp1_sanctum;
assert.deepEqual([...new Set(Object.values(plan).flatMap(m=>m.enemies.map(f=>f[0])).filter(k=>k.startsWith('golem')))],['golem2'],'Forgewick uses only its Iron Golem');
const ornaments=sanctum.roomActors.filter(a=>a.entranceOrnament);
for(const spr of ['first_temple_torch','first_temple_dragon_head','temple67_sentinel']){
 const pair=ornaments.filter(a=>a.spr===spr);assert.equal(pair.length,2);
 assert.equal(pair[0].x+pair[1].x,plan.tp1_sanctum.gate[0]+plan.tp1_sanctum.gate[2],'entrance ornaments mirrored');
 for(const a of pair)assert(a.x+8<=plan.tp1_sanctum.gate[0]||a.x-8>=plan.tp1_sanctum.gate[2],'hallway remains free of ornaments');
}
assert.equal(sanctum.roomActors.filter(a=>a.spr==='first_temple_dragon_head'&&a.y>=240).length,2,'no extra head in entrance passage');
assert(!flood(sanctum,true).has([plan.tp1_sanctum.heartstone[0],plan.tp1_sanctum.heartstone[1]+24].join(',')),'closed gate prevents reaching heartstone');
assert(flood(sanctum,false).has([plan.tp1_sanctum.heartstone[0],plan.tp1_sanctum.heartstone[1]+24].join(',')),'open gate permits heartstone');
c.MD=sanctum;c.MAPID='tp1_sanctum';assert.equal(run('expandedSanctumCleared()'),false);
c.bossGone['tp1_sanctum:0']=true;assert.equal(run('expandedSanctumCleared()'),false);
c.bossGone['tp1_sanctum:1']=true;assert.equal(run('expandedSanctumCleared()'),true);run('stepExpandedTemple(1)');assert.equal(sanctum.templeGateOpen,1);
assert.equal(c.CHESTS[0].map,'tp1_sanctum');assert.equal(sanctum.npcs[0].n,'Alderic');
// All map links form a tree: side areas cannot provide an alternate boss route.
const edges=new Set();for(const [id,m] of Object.entries(W.maps))if(m.templeExpanded)for(const d of m.doors)if(d.to!=='world')edges.add([id,d.to].sort().join(':'));
assert.equal(edges.size,4);assert.equal(W.maps.tp1_reliquary.doors.length,1);assert.equal(W.maps.tp1_crypt.doors.length,1);assert.equal(sanctum.doors.length,1);
console.log('PASS: five compact branching maps, all door approaches and arrivals, eight reachable chests, valid enemy spawns, guardian gate, single progression route, optional dead ends and untouched other temples.');
// Exercise the real spawn/death hooks: cleared encounters stay cleared on return.
const game=read('js/generated/game-part-2.js');
Object.assign(c,{FOE:{ghost:{},golem1:{},golem2:{}},enemyMaxHp:()=>10,TS:16,NO_RESPAWN:/golem/,royalDefeated:{},knightEncounterDone:false,saveGame(){}});
vm.runInContext(game.slice(game.indexOf('function spawnFoes() {'),game.indexOf('function swordOverlaps(')),c);
vm.runInContext(game.slice(game.indexOf('function markBossGone(f) {'),game.indexOf('function bossRing(')),c);
c.MD=W.maps.tp1_crypt;c.MAPID='tp1_crypt';run('spawnFoes()');assert.equal(c.foes.length,3);
assert(c.foes.every(f=>f.expandedRoom));run('markBossGone(foes[0]);spawnFoes()');assert.equal(c.foes.length,2);
assert(c.foes.every(f=>f.idx!==0));
console.log('PASS: actual encounter spawn/death hooks preserve cleared ghosts between room visits.');
// Only the final guardian chamber contains golems; the restored statue animates.
for(const [id,m] of Object.entries(plan))if(id!=='tp1_sanctum')assert(m.enemies.every(f=>!f[0].startsWith('golem')));
const effigy=sanctum.roomActors.find(a=>a.spr==='temple73_fire_statue');assert(effigy);assert.equal(effigy.stillFrame,undefined);
assert(plan.tp1_sanctum.heartstone[0]-effigy.x>=40,'chest remains clear of the statue');
assert.equal(sanctum.roomActors.filter(a=>a.spr==='first_temple_torch'&&a.y<160).length,0,'statue room uses only the statue flames');
assert(sanctum.roomBlocks.some(([l,t,r,b])=>l<plan.tp1_sanctum.heartstone[0]&&r>plan.tp1_sanctum.heartstone[0]&&t<plan.tp1_sanctum.heartstone[1]&&b>plan.tp1_sanctum.heartstone[1]),'heartstone chest blocks movement');
const asset=JSON.parse(read('js/generated/game-part-1.js').match(/\{"name":"temple73_fire_statue"[^\n]*?\}/)[0]);assert.equal(asset.frames,6);
let halls=0,hits=0;c.hurtPlayer=()=>hits++;c.foes=[];c.foesHeld=false;
for(const [id,m] of Object.entries(W.maps))for(const h of m.templePlan?.hazards||[]){
 halls++;c.MD=m;c.MAPID=id;c.tAcc=2.8;
 assert.equal(h.axis,'y','spike artwork is reserved for north-running halls');
 assert(h.lines.at(-1)-h.lines[0]>=320,'long trap crossing');
 for(const a of m.roomActors.filter(a=>a.expandedSpike?.id===h.id))assert(inside(m,a.x,a.y),'trap within hall');
 c.P=h.axis==='x'?{x:h.lines[0],y:(h.cross[0]+h.cross[1])/2}:{x:(h.cross[0]+h.cross[1])/2,y:h.lines[0]};
 const before=hits;run('stepExpandedTemple(0)');assert.equal(hits,before+1,'active spikes hurt along the north hall');
 const pos=c.P;c.P={x:h.lever[0],y:h.lever[1]};assert(run('tryExpandedTempleLever()'));
 c.P=pos;run('stepExpandedTemple(0)');assert.equal(hits,before+1,'lever disables its hall');
 assert(c.bossGone[id+':spikes:'+h.id]);
}
assert.equal(halls,4);
// A living enemy beside a treasure chest must not prevent claiming or duplicate rewards.
Object.assign(c,{performance:{now:()=>0},gold:0,potions:0,boarMeat:0,dragonFish:0,flyGold(){},showReveal(){}});
vm.runInContext(read('js/house-loot.js'),c);c.MD=W.maps.tp1;c.MAPID='tp1';
const loot=c.MD.roomActors.find(a=>a.houseLoot);c.P={x:loot.x,y:loot.y+24};c.foes=[{x:loot.x,y:loot.y,st:'idle',ally:false}];
assert(run('tryHouseLootChest()'));assert.equal(c.gold,loot.houseLoot.gold);
assert(run('tryHouseLootChest()'));assert.equal(c.gold,loot.houseLoot.gold);
console.log('PASS: golems only at the heartstone entrance, animated statue and adjacent chest, four long trap halls with independent levers, and loot accessible beside living enemies.');

// Temple treasure belongs in the upper corners, with some genuinely empty chests.
let emptyCount=0;
for(const [id,m]of Object.entries(W.maps))if(m.templeExpanded){
 for(const a of m.roomActors.filter(a=>a.houseLoot)){
  const room=m.templePlan.chambers.find(([l,t,r,b])=>a.x>l&&a.x<r&&a.y>t&&a.y<b);assert(room);
  assert(a.y-room[1]<=24&&Math.min(a.x-room[0],room[2]-a.x)<=24,id+' chest in upper corner');
  if(a.houseLoot.gold===0){emptyCount++;assert(!a.houseLoot.item);}
 }
}
assert.equal(emptyCount,2);
assert.equal(plan.tp1_sanctum.heartstone[1]-plan.tp1_sanctum.chambers[1][1],24);
assert.equal(plan.tp1_sanctum.chambers[1][2]-plan.tp1_sanctum.heartstone[0],24);
run('lootChestAnimations.clear()');
let clock=0,popups=[],coins=0;c.performance={now:()=>clock};c.showReveal=(icon,caption)=>popups.push({icon,caption});c.flyGold=()=>coins++;
c.MD=W.maps.tp1;c.MAPID='tp1';const empty=c.MD.roomActors.find(a=>a.houseLoot&&a.houseLoot.gold===0);
c.P={x:empty.x,y:empty.y+24};const before=[c.gold,c.potions,c.boarMeat,c.dragonFish];
assert(run('tryHouseLootChest()'));assert.deepEqual([c.gold,c.potions,c.boarMeat,c.dragonFish],before);assert.equal(coins,0);
assert.equal(run('houseLootFrame(MD.roomActors.find(a=>a.houseLoot&&a.houseLoot.gold===0))'),0);
clock=800;run('stepLootChestOpening()');assert.equal(popups.length,1);assert.equal(popups[0].caption,'This chest is empty.');assert.equal(popups[0].icon,'temple71_chest');
assert(run('tryHouseLootChest()'));assert.deepEqual([c.gold,c.potions,c.boarMeat,c.dragonFish],before);assert.equal(popups.length,1);
// Exercise the actual teleport-list builder so the interior cannot silently disappear again.
vm.runInContext(game.slice(game.indexOf('function storyTeleport(id) {'),game.indexOf('const KING_DRAGON_SPR')),c);
const part3=read('js/generated/game-part-3.js');vm.runInContext(part3.slice(part3.indexOf('function placesOf() {'),part3.indexOf('function buildTravel() {')),c);
Object.assign(c,{features:[],MAPID:'world',isArea:()=>false});
const entry=run('placesOf()').find(p=>p.map==='tp1');assert(entry,'Forgewick interior appears in teleport list');assert.equal(entry.kind,'Temple');assert(clear(W.maps.tp1,entry.x*16+8,entry.y*16+16));
console.log('PASS: all temple loot and Heartstone positions occupy upper corners; two empty chests animate without rewards; Forgewick interior teleport is present and lands safely.');
