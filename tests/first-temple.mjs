import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const plan=JSON.parse(read('assets/interiors/first-temple/layout.json'));
const W={maps:{tp1:{doors:[{to:'world',tx:958,ty:272}],npcs:[{n:'Alderic'}]},world:{doors:[{to:'tp1'}]},sn1:{unchanged:true},ds1:{unchanged:true}}};
const c=vm.createContext({W,fetch:async()=>({ok:true,json:async()=>structuredClone(plan)}),Image:class{async decode(){}},terrRLE:a=>'0.'+a.length,DIRT:0,CHESTS:[{map:'tp1',gift:'lightning'}],chestOpen:{},breathHas:{lightning:false},bossGone:{},foesHeld:false,foes:[],P:{},tAcc:0,sceneHold:()=>false,fadeDir:0,hurtPlayer(){},saveGame(){},toast(){}});
vm.runInContext(read('js/first-temple.js'),c);const run=s=>vm.runInContext(s,c);await run('prepareExpandedFirstTemple()');
assert.equal(Object.keys(W.maps).filter(k=>W.maps[k].templeExpanded).length,5);
assert.deepEqual(W.maps.sn1,{unchanged:true});assert.deepEqual(W.maps.ds1,{unchanged:true});
const inside=(m,x,y)=>m.templeFloors.some(([l,t,r,b])=>x>=l&&x<r&&y>=t&&y<b);
const clear=(m,x,y,gate=false)=>[[x-6,y-12],[x+6,y-12],[x-6,y-1],[x+6,y-1]].every(([px,py])=>inside(m,px,py)&&!m.roomBlocks.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&!(gate&&m.templePlan.gate&&px>=m.templePlan.gate[0]&&px<m.templePlan.gate[2]&&py>=m.templePlan.gate[1]&&py<m.templePlan.gate[3]));
function flood(m,gate=false){const start=m.spawn.map(n=>Math.round(n/8)*8),seen=new Set([start.join(',')]),q=[start];for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const n of [[x-8,y],[x+8,y],[x,y-8],[x,y+8]]){const key=n.join(',');if(!seen.has(key)&&clear(m,...n,gate)){seen.add(key);q.push(n);}}}return seen;}
let chests=0,doors=0;
for(const [id,m] of Object.entries(W.maps)){
 if(!m.templeExpanded)continue;
 assert(m.w>=28,`${id} preserves connected paths`);assert(m.templePlan.chambers.every(([l,t,r,b])=>r-l<=176&&b-t<=128),'original compact chamber footprint');assert(clear(m,...m.spawn));
 const reached=flood(m);
 for(const a of m.roomActors.filter(a=>a.houseLoot)){chests++;assert.equal(a.spr,'temple71_chest','loot uses standard chest');assert(reached.has([a.x,a.y+24].join(',')),id+' chest reachable');}
 for(const d of m.doors){doors++;const r=d.triggerRect;
  assert(reached.has([r.x+16,d.dir==='u'?r.y+r.h+16:r.y-16].join(',')),id+' door approach');
  if(d.to==='world')continue;
  const dest=W.maps[d.to];assert(dest.doors.some(back=>back.to===id));assert(clear(dest,d.tx*16+8,d.ty*16+16),id+' safe arrival');
 }
 for(const f of m.foes)assert(clear(m,f.x*16+8,f.y*16+16),id+' enemy spawn');
}
assert.equal(chests,8);assert.equal(doors,9);
const sanctum=W.maps.tp1_sanctum;
assert(!flood(sanctum,true).has('256,152'),'closed gate prevents reaching heartstone');
assert(flood(sanctum,false).has('256,152'),'open gate permits heartstone');
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
