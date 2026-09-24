import fs from 'node:fs';import vm from 'node:vm';import zlib from 'node:zlib';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const assets=read('js/generated/game-part-1.js'),game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
const W=JSON.parse(zlib.gunzipSync(Buffer.from(assets.match(/const W_GZ = "([^"]+)"/)[1],'base64')));
const c=vm.createContext({W,TS:16,DIRT:0,terrRLE:a=>'0.'+a.length,
 WALL78_PIECES:JSON.parse(assets.match(/const WALL78_PIECES=(.*);/)[1]),window:{EMBER_ASSETS:{DOCK_ORIGINAL_ASSETS:[]}},
 fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url.split('?')[0]))}),Image:class{async decode(){}},
 breathHas:{},chestOpen:{},features:[],MAPID:'world',MD:W.maps.world,P:{},foes:[],foesHeld:false,bossGone:{},
 sceneHold:()=>c.paused,paused:false,scene:null,fadeDir:0,doorMotion:null,trial:null,tAcc:0,arenaPass:false,
 stepChest(){},settleGraves(){},recoverStrandedDragon(){},saveGame(){},toast(){},rebuildBuckets(){},showRise(){},
 FOE:new Proxy({},{get:()=>({hp:20})}),enemyMaxHp:()=>20,NO_RESPAWN:/golem|devil/,
 royalDefeated:{},knightEncounterDone:false,houseLootTaken:new Set(),lootChestAnimations:new Map(),twinSpent:false,twinKills:0});
const run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('const CHESTS = ['),game.indexOf('function chestHere()')));
run(game.slice(game.indexOf('function installFirstTemple(){'),game.indexOf('const foeVisibleTopCache82')));
run('installFirstTemple();installSecondTemple();installThirdTemple();refineSecondTemple();finishTempleLayouts77();refineTemples78();finishTempleLayouts82();');
for(const file of ['first-temple','sandspire-temple','hollybeck-temple','mountain-passage'])run(read('js/'+file+'.js'));
await run('prepareExpandedFirstTemple();');await run('prepareExpandedSandspireTemple();');
await run('prepareExpandedHollybeckTemple();');await run('prepareExpandedMountainPassage();');
run(part3.slice(part3.indexOf('let arenaLock ='),part3.indexOf('let lastChunk =')));
run(part3.slice(part3.indexOf('let arenaFeatureSource ='),part3.indexOf('let lastAreaTile =')));
run(game.slice(game.indexOf('function spawnFoes() {'),game.indexOf('function swordOverlaps(')));
run(game.slice(game.indexOf('function markBossGone(f) {'),game.indexOf('// Supplied Smoke pack')));
run(game.slice(game.indexOf('function useBomb() {'),game.indexOf('function drinkElixir()')));
run(part3.slice(part3.indexOf('function doorExitDirection('),part3.indexOf('function drawArena(half)')));
Object.assign(c,{bossScene:null,fade:0,pendingDoor:null,arriveT:0,doorRect:d=>d.triggerRect});
Object.assign(c,{collisionOverride:()=>undefined,editedTempleWallCollision:()=>undefined,blockedByTempleGate:()=>false,
 blockedByTrialPedestal:()=>false,blockedByNpcBody:()=>false,blockedByNpcBuffer:()=>false,glassHatchBlocked:()=>false,
 northShut:()=>false,quest:0,Q:{FLED:99},eggGate:-1,fieldGate:-1,fenceAt:null,blockedByGuard:()=>false,odoShuts:()=>false,
 blockedByItem:()=>false,blockedByHerd:()=>false,dragon:{}});
run(game.slice(game.indexOf('const isSolid ='),game.indexOf('const CELL =')));
run(game.slice(game.indexOf('const DG_FOOT_W ='),game.indexOf('function dragonAirborne()')));
run(game.slice(game.indexOf('function dragonGround('),game.indexOf('function refreshWingBtn()')));
const lock=()=>run('arenaLock');
const reset=()=>run('arenaLock=null;arenaT=0;arenaGoing=false;falling=null;');
const tick=(dt=.05)=>run('stepArena('+dt+')');
const maps=Object.entries(W.maps).filter(([,m])=>m.templeExpanded);
let rooms=0,bosses=0,openings=0,ambushes=0;
for(const [id,m] of maps){
 Object.assign(c,{MAPID:id,MD:m,features:m.features,MW:m.w,MH:m.h,solid:new Uint8Array(m.w*m.h)});
 const rings=run('expandedTempleArenas()');
 for(const ring of rings){
  rooms++;if(ring.templeBoss)bosses++;
  const [l,t,r,b]=ring.templeRoom;reset();c.bossGone={};c.houseLootTaken.clear();c.lootChestAnimations.clear();
  run('spawnFoes()');c.ring=ring;
  const own=()=>c.foes.filter(f=>{c.f=f;return run('expandedTempleFoeInArena(ring,f)');});
  let defenders=own();
  c.P={x:(l+r)/2,y:(t+b)/2,moving:false};
  if(!defenders.length){
   tick();assert.equal(lock(),null,id+' unopened ambush chest does not seal the room');
   const source=m.foes.find(f=>f.chestAmbush&&f.expandedRoom.every((v,i)=>v===ring.templeRoom[i]));assert(source);
   c.lootChestAnimations.set(source.chestAmbush,{});tick();assert.equal(lock(),ring,'opening an ambush chest seals its room');
   c.lootChestAnimations.delete(source.chestAmbush);c.ambushId=source.chestAmbush;
   run('releaseChestGhost(ambushId)');defenders=own();ambushes++;
  }
  for(let i=0;i<8;i++)tick();assert.equal(lock(),ring,id+' enemy room starts an arena');assert.equal(run('arenaT'),1);
  assert.equal(run('bossRing(ring)'),ring.templeBoss,id+' boss identity');
  const rim=run('arenaRim(ring)');assert(rim.length,id+' has visible battle walls');openings+=rim.length;
  for(const [x,y] of [[l-1,(t+b)/2],[r,(t+b)/2],[(l+r)/2,t-1],[(l+r)/2,b]]){
   c.point=[x,y];assert(run('arenaFenceBlocks(...point)'),id+' escape is blocked');
  }
  c.point=[(l+r)/2,(t+b)/2];assert(!run('arenaFenceBlocks(...point)'),id+' room interior stays open');
  // Verify all continuous floor openings have a visible post at the boundary.
  const floor=(x,y)=>m.templeFloors.some(([fl,ft,fr,fb])=>x>=fl&&x<fr&&y>=ft&&y<fb);
  const bases=rim.map(([x,y])=>[x*16+8,y*16+16]);
  for(let y=t+8;y<b;y+=16)for(const x of [l,r])if(floor(x===l?x-1:x,y))
   assert(bases.some(([bx,by])=>bx===x&&Math.abs(by-y)<=8),id+' side hall sealed visually');
  for(let x=l+8;x<r;x+=16)for(const y of [t,b])if(floor(x,y===t?y-1:y))
   assert(bases.some(([bx,by])=>bx===x&&by===(y===b?y+32:y)),id+' vertical hall sealed visually');
  const hallPoints=[];
  for(let y=t+8;y<b;y+=16)for(const x of [l-1,r])if(floor(x,y))hallPoints.push([x,y]);
  for(let x=l+8;x<r;x+=16)for(const y of [t-1,b])if(floor(x,y))hallPoints.push([x,y]);
  for(const point of hallPoints){c.point=point;assert(run('isSolid(...point)'),id+' real movement collision seals the hall');}
  const topDoor=m.doors.find(d=>d.dir==='u'&&d.triggerRect.y+16===t&&d.triggerRect.x>=l&&d.triggerRect.x<r);
  if(topDoor){
   c.P={x:topDoor.triggerRect.x+16,y:t+12,dir:'u',flip:false,moving:true};run('useDoors(.05)');
   assert.equal(c.doorMotion,null,id+' door cannot bypass the battle wall');assert.equal(c.pendingDoor,null);
  }
  for(const f of defenders){f.st='dead';c.f=f;run('markBossGone(f)');}
  for(let i=0;i<10;i++)tick();assert.equal(lock(),null,id+' only this room must be cleared');
  c.point=[l-1,(t+b)/2];assert(!run('arenaFenceBlocks(...point)'),id+' walls reopen');
  for(const point of hallPoints){c.point=point;assert(!run('isSolid(...point)'),id+' real hall collision reopens');}
  c.P={x:(l+r)/2,y:(t+b)/2,moving:false};run('spawnFoes()');tick();
  assert.equal(lock(),null,id+' saved defeated enemies do not reseal the room');
 }
 // Empty rooms and Heartstone chambers never gain arena walls.
 reset();c.foes=[];c.lootChestAnimations.clear();c.P={x:m.spawn[0],y:m.spawn[1]};tick();assert.equal(lock(),null);
}
assert.equal(bosses,4,'one boss chamber in each temple and the passage');assert(ambushes>0);

// Trigger after the full player footprint crosses a threshold, from any side.
c.MAPID='passage3';c.MD=W.maps.passage3;c.features=[];c.bossGone={};c.MW=c.MD.w;c.MH=c.MD.h;c.solid=new Uint8Array(c.MW*c.MH);run('spawnFoes()');
const boss=run('expandedTempleArenas()[0]'),[l,t,r,b]=boss.templeRoom;
for(const [outside,inside] of [
 [[l-1,(t+b)/2],[l+16,(t+b)/2]],[[r+1,(t+b)/2],[r-16,(t+b)/2]],
 [[(l+r)/2,t-1],[(l+r)/2,t+24]],[[(l+r)/2,b+1],[(l+r)/2,b-16]]]){
 reset();c.P={x:outside[0],y:outside[1]};tick();assert.equal(lock(),null);
 c.P={x:inside[0],y:inside[1]};tick();assert.equal(lock(),boss);c.point=outside;
 assert(run('arenaFenceBlocks(...point)'),'cannot slip out while the walls rise');
 assert(run('dragonGround(...point)'),'dragon can land in the rectangular arena');
 c.ring=boss;assert(run('expandedTempleArenaContains(ring,dragon.x,dragon.y,8)'),'dragon lands inside the room');
}
c.foesHeld=true;tick();assert.equal(lock(),null,'combat-off mode releases the room');c.foesHeld=false;
c.paused=true;tick();assert.equal(lock(),null,'dialogue pauses room activation');c.paused=false;
c.fadeDir=-1;tick();assert.equal(lock(),null,'arrival fade finishes before walls rise');c.fadeDir=0;
tick();assert.equal(lock(),boss);c.bombs=1;c.devSafe=false;c.devItemTest=false;c.castSkull=(_x,_y,_h,after)=>after();
run('useBomb()');assert(c.foes.some(f=>f.kind==='devil'&&f.st!=='dead'),'boss remains immune to arena curse');

// Arena curse affects and permanently clears only the active normal room.
c.MAPID='passage_west';c.MD=W.maps.passage_west;c.bossGone={};run('spawnFoes()');reset();
const normal=run('expandedTempleArenas()[0]');c.ring=normal;
c.P={x:(normal.templeRoom[0]+normal.templeRoom[2])/2,y:(normal.templeRoom[1]+normal.templeRoom[3])/2};tick();
const neighbors=c.foes.filter(f=>!f.expandedRoom.every((v,i)=>v===normal.templeRoom[i]));assert(neighbors.length);
c.bombs=1;run('useBomb()');assert.equal(lock(),null);assert(neighbors.every(f=>f.st!=='dead'));
run('spawnFoes()');tick();assert.equal(lock(),null,'cursed room remains clear after a reload');

// Keep the original circular collision rule for ordinary outdoor arenas.
run('arenaLock={x:20,y:20,r:6};arenaT=1;');c.MAPID='world';c.MD=W.maps.world;
for(const [x,y] of [[320,320],[400,320],[440,320],[200,200]]){
 c.point=[x,y];assert.equal(run('arenaFenceBlocks(...point)'),Math.hypot(Math.floor(x/16)-20,Math.floor(y/16)-20)>6.5);
}
console.log(`PASS: ${rooms} combat rooms across ${maps.length} temple maps, ${bosses} boss chambers, ${openings} wall posts, ${ambushes} chest-only ambush rooms; clear/revisit persistence, all entry directions, door locks, curse scope and legacy arena collision.`);
