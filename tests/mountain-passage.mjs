import fs from 'node:fs';import vm from 'node:vm';import zlib from 'node:zlib';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const part1=read('js/generated/game-part-1.js'),game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
const W=JSON.parse(zlib.gunzipSync(Buffer.from(part1.match(/const W_GZ = "([^"]+)"/)[1],'base64')));
const oldEnds=['passage','passage3'].map(id=>({...W.maps[id].doors.find(d=>d.to==='world')}));
const c=vm.createContext({W,TS:16,DIRT:0,terrRLE:a=>'0.'+a.length,
 window:{EMBER_ASSETS:{DOCK_ORIGINAL_ASSETS:[]}},fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url.split('?')[0]))}),Image:class{async decode(){}},
 breathHas:{shadow:true,ice:true,lightning:true},chestOpen:{},MAPID:'passage',MD:null,P:{},foes:[],foesHeld:false,bossGone:{},
 sceneHold:()=>false,fadeDir:0,tAcc:0,hurtPlayer(){c.hits++;},hits:0,saveGame(){},toast(){},chunks:new Map(),
 FOE:{ghost3:{hp:6},wraith:{hp:8},devil:{hp:22}},NO_RESPAWN:/devil/,royalDefeated:{},knightEncounterDone:false,
 houseLootTaken:new Set(),lootChestAnimations:new Map()});
const run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('const CHESTS = ['),game.indexOf('function chestHere()')));
for(const path of ['js/first-temple.js','js/sandspire-temple.js','js/hollybeck-temple.js','js/mountain-passage.js'])run(read(path));
await run('prepareExpandedMountainPassage()');await run('prepareExpandedMountainPassage()');
const plans=JSON.parse(read('assets/interiors/mountain-passage/layout.json')),holly=JSON.parse(read('assets/interiors/hollybeck-temple/layout.json'));
const maps=Object.entries(W.maps).filter(([,m])=>m.mountainPassage);
const area=ps=>Object.values(ps).reduce((n,m)=>n+new Set(m.floors.flatMap(([l,t,r,b])=>Array.from({length:(r-l)/16*(b-t)/16},(_,i)=>[l+i%((r-l)/16)*16,t+Math.floor(i/((r-l)/16))*16].join(',')))).size,0);
assert.equal(maps.length,20);assert.equal(area(plans),area(holly));assert.equal(maps.reduce((n,[,m])=>n+m.templePlan.chambers.length,0),89);
const clear=(m,x,y,gate=false)=>[[x-6,y-12],[x+6,y-12],[x-6,y-1],[x+6,y-1]].every(([px,py])=>
 m.templeFloors.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&!m.roomBlocks.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&
 !(gate&&m.templePlan.gate&&px>=m.templePlan.gate[0]&&px<m.templePlan.gate[2]&&py>=m.templePlan.gate[1]&&py<m.templePlan.gate[3]));
function flood(m,gate=false){const start=m.spawn.map(n=>Math.round(n/8)*8),seen=new Set([start.join(',')]),q=[start];for(let i=0;i<q.length;i++){
 const [x,y]=q[i];for(const n of [[x-8,y],[x+8,y],[x,y-8],[x,y+8]]){const k=n.join(',');if(!seen.has(k)&&clear(m,...n,gate)){seen.add(k);q.push(n);}}}return seen;}
run(game.slice(game.indexOf('const ROUTE_2_HP_START_X'),game.indexOf('const FOE_ART')));
run(game.slice(game.indexOf('function spawnFoes() {'),game.indexOf('function swordOverlaps(')));
run(game.slice(game.indexOf('function markBossGone(f) {'),game.indexOf('function bossRing(')));
let chests=0,empty=0,ambush=0,seals=0;const types=new Set(),edges=new Set();
for(const [id,m]of maps){
 assert.equal(m.travel,id==='passage');assert(clear(m,...m.spawn),id+' spawn');
 const reachable=flood(m),plan=m.templePlan;
 assert.equal(m.features.length,0,'old cave arena terrain is removed');
 if(id!=='passage3')assert(plan.chambers.every(([l,t,r,b])=>r-l===128&&b-t===96));
 for(const a of m.roomActors.filter(a=>a.houseLoot)){
  chests++;if(a.houseLoot.ghost)ambush++;else if(!a.houseLoot.gold)empty++;
  const room=plan.chambers.find(([l,t,r,b])=>a.x>l&&a.x<r&&a.y>t&&a.y<b);
  assert.equal(a.y-room[1],24);assert.equal(Math.min(a.x-room[0],room[2]-a.x),24);
  assert.equal(a.spr,'temple71_chest');assert(reachable.has([a.x,a.y+24].join(',')),id+' chest approach');
  assert(!clear(m,a.x,a.y+8),id+' chest collision');
 }
 for(const d of m.doors){
  const r=d.triggerRect;assert(reachable.has([r.x+16,d.dir==='u'?r.y+r.h+16:r.y-16].join(',')),id+' door approach');
  if(d.to==='world')continue;
  edges.add([id,d.to].sort().join(':'));assert(W.maps[d.to].doors.some(back=>back.to===id));
  assert(clear(W.maps[d.to],d.tx*16+8,d.ty*16+16),id+' arrival');
  if(d.templeGuards){seals++;c.MD=m;c.MAPID=id;c.d=d;assert(d.templeGuards.length);assert(run('expandedTempleDoorLocked(d)'));
   for(const i of d.templeGuards)c.bossGone[id+':'+i]=true;assert(!run('expandedTempleDoorLocked(d)'));}
 }
 for(const p of plan.passages)for(let y=p.y-48;y<=p.y+16;y+=8)assert(reachable.has([p.x,y].join(',')),id+' arch');
 for(const h of plan.hazards){types.add(h.type);assert(reachable.has(h.lever.join(',')),id+' lever');}
 for(const f of m.foes)assert(clear(m,f.x*16+8,f.y*16+16),id+' enemy spawn');
 c.MD=m;c.MAPID=id;run('spawnFoes()');assert(c.foes.every(f=>!f.chestAmbush&&f.hp>=12),'late game HP / delayed ambush');
 assert(!m.roomActors.some(a=>a.spr==='heartstone_chest'||a.preservedHeartstoneProp));
 assert(fs.existsSync(new URL('../assets/interiors/mountain-passage/'+id+'.png',import.meta.url)));
}
assert.deepEqual([...types].sort(),['arrow','cannon','flame','saw','spikes']);assert.equal(chests,38);assert.equal(empty,8);assert.equal(ambush,8);assert.equal(seals,4);assert.equal(edges.size,19);
// Reachability of the whole graph, with exactly two original world mouths.
const visited=new Set(['passage']),queue=['passage'];for(const id of queue)for(const d of W.maps[id].doors)if(d.to!=='world'&&!visited.has(d.to)){visited.add(d.to);queue.push(d.to);}
assert.equal(visited.size,20);
for(const [i,id] of ['passage','passage3'].entries()){
 const d=W.maps[id].doors.find(d=>d.to==='world'),old=oldEnds[i];assert.equal(d.tx,old.tx);assert.equal(d.ty,old.ty);
 const entry=W.maps.world.doors.find(d=>d.to===id);assert(clear(W.maps[id],entry.tx*16+8,entry.ty*16+16));
}
const finale=W.maps.passage3;assert.equal(finale.foes.length,1);assert.equal(finale.foes[0].k,'devil');
const exit=finale.templePlan.chambers[1],exitActors=finale.roomActors.filter(a=>a.x>=exit[0]&&a.x<exit[2]&&a.y>=exit[1]&&a.y<exit[3]);
assert.equal(exitActors.length,1);assert.equal(exitActors[0].spr,'wf_cave_big','final chamber restores the original cave mouth');
assert(!flood(finale,true).has('160,208'));assert(flood(finale).has('160,208'));
c.MD=finale;c.MAPID='passage3';c.P={x:160,y:768};c.foes=[];run('stepExpandedTemple(1)');assert.equal(finale.templeGateOpen,0,'Heartstone ownership never bypasses the Ashfiend');
c.P.y=208;run('stepExpandedTemple(1)');assert.equal(finale.templeGateOpen,1,'Ashcrag reverse entrance can reach boss');
c.P.y=768;run('stepExpandedTemple(1)');assert.equal(finale.templeGateOpen,0);
c.bossGone['passage3:0']=true;run('stepExpandedTemple(1)');assert.equal(finale.templeGateOpen,1);run('spawnFoes()');assert.equal(c.foes.length,0,'original boss key still suppresses respawn');
// Every trap family damages during its active phase; its own lever silences it.
for(const [id,m]of maps)for(const h of m.templePlan.hazards){
 c.MD=m;c.MAPID=id;c.foes=[];c.tAcc=2.8;c.P={x:(h.cross[0]+h.cross[1])/2,y:h.lines[0]};
 m.templeClock=['arrow','cannon'].includes(h.type)?2.2:2;const before=c.hits,clock=m.templeClock;
 run('stepExpandedTemple(.1)');assert.equal(m.templeClock,clock+.1,'shared trap clock advances once');assert(c.hits>before,id+' '+h.type+' active damage');
 c.P={x:h.lever[0],y:h.lever[1]};assert(run('tryExpandedTempleLever()'));assert(run('expandedTrapDisabled('+JSON.stringify(h.id)+')'));
 run('stepExpandedTemple(0)');assert.equal(m.templeShots.length,0);assert(m.templeHazards.every(a=>!a.active&&a.frame===0));
}
// Save and restore new-room progress, the existing boss key and legacy positions.
let saved=null;
Object.assign(c,{quest:1,smithUpgrade:false,glassShield:false,wonAll:0,cinderSeal:false,trialSealPlaced:false,trialWins:0,thornwellMet:false,brambleQuest:0,
 gold:100,potions:1,treasuryTaken:new Set(),dragon:{hp:5,maxHp:5},elixirs:0,bombs:0,dust:0,bells:0,marks:0,breaths:0,stones:0,salts:0,boarMeat:0,hareMeat:2,dragonFish:0,fishingPole:false,trial:null,activeSaveSlot:1,
 migrateLegacySave(){},readSaveSlot:()=>saved,syncDragonVitality(){},hasSword:()=>true,
 loadMap(id){c.MAPID=id;c.MD=W.maps[id];},cam:{},clampCam(){},canStand:(x,y)=>clear(c.MD,x,y)});
run(game.slice(game.indexOf('function recoverTempleArrival('),game.indexOf('function blockedByTempleGate(')));
run(part3.slice(part3.indexOf('function captureSave()'),part3.indexOf('function saveToSlot(')));
run(part3.slice(part3.indexOf('function loadGame('),part3.indexOf('let mounted =')));
c.MAPID='passage_west';c.MD=W.maps.passage_west;c.P={x:c.MD.spawn[0],y:c.MD.spawn[1]};saved=JSON.parse(JSON.stringify(run('captureSave()')));
assert.equal(saved.hareMeat,2);c.hareMeat=0;assert.equal(saved.passageLayoutVersion,1);assert(saved.templeDefeated['passage3:0']);assert(Object.keys(saved.templeDefeated).some(k=>k.includes(':spikes:')));
for(const k of Object.keys(c.bossGone))delete c.bossGone[k];assert(run('loadGame(1)'));assert.deepEqual(c.bossGone,saved.templeDefeated);assert.equal(c.hareMeat,2,'hare meat survives reload');
for(const id of ['passage','passage2','passage3']){
 saved={map:id,x:40,y:80,quest:1,templeLayoutVersion:2,breathHas:{}};assert(run('loadGame(1)'));
 assert.equal(c.hareMeat,0,'older saves default to no hare meat');assert.deepEqual([c.P.x,c.P.y],Array.from(W.maps[id].spawn));assert.equal(Object.keys(c.bossGone).length,0,'save slots do not share passage defeats');
}
console.log('PASS: 20 sections, 89 rooms, exact Hollybeck area, all doors/chests/levers/enemies reachable, all five traps active and disableable, two world mouths, original Ashfiend, plain exit chamber, reverse traversal and save migration.');
