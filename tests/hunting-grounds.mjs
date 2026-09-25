import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
for(const species of ['hare','boar','deer','fox','bird']){
const c=vm.createContext({console,TS:16,MAPID:'world',MD:{foes:[],features:[],felled:['130,60','900,500'],felled_rle:'60:131-133|500:901'},
 P:{x:2696,y:1080,act:null},foes:[],features:[],loot:[],FOE_ART:{},FOE:{},live:[],foeClock:0,wakeCool:0,turnT:0,turnHolder:null,foeCool:0,lastFight:0,
 isSolid:(x,y)=>x>2750&&y<1080,thinks:()=>true,targetFor(){throw Error('Hunting animals must not pursue combat targets');},
 houseLootTaken:new Set(),lootChestAnimations:new Map(),royalDefeated:{},wonAll:false,knightEncounterDone:true,bossGone:{},NO_RESPAWN:/^never$/,
 enemyMaxHp:()=>3,saveGame(){c.saved=(c.saved||0)+1},toast:s=>{c.message=s},flyGold(){},treasuryGuarding:()=>false,
 boarMeat:0,hareMeat:0,deerMeat:0,foxMeat:0,birdMeat:0,dragonFish:0,gold:50,graves:null,BOSS_KIND:/^never$/,WORTH:{},GOLD_DROP_MULTIPLIER:1.8,
 directionVector:()=>[0,-1],playerFacing4:()=> 'n',PC_W:16,PC_H:18,seenFoe:{},seenCount:0,smithUpgrade:false,worn:{},pHp:6,pMax:6,
 makeFoeRetreat(){},devSafe:false,devItemTest:false,dragon:{hp:1,maxHp:8,down:false,x:0,y:0},BOAR_MEAT_HEAL:4,DRAGON_FISH_HEAL:4,
 hasDragon:()=>true,dragonHere:()=>true,syncDragonVitality(){},showHeal(){},
 foesHeld:false,trial:null,arenaLock:null,arenaT:0,arenaGoing:false,falling:null,cooling:new Map(),holy:new Set(),stepChest(){},
 currentArenaFeatures:()=>c.features.filter(f=>f.kind==='arena'),ringKey:a=>'world:'+a.id,
 arenaFoesLeft(){throw Error('Hunts must not enter battle-wall logic');},
 ctx:{fillStyle:'',fillRect(){c.meatPixels=(c.meatPixels||0)+1}}
});
const run=s=>vm.runInContext(s,c);
const section=(source,start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
run(read('js/editor-build-data.js'));run(read('js/hunting-grounds.js'));
run(section(game,'function spawnFoes()', 'function swordOverlaps('));
run(section(game,'function foeBodyProfile(', 'function stepBreath('));
run(section(game,'function swordOverlaps(', 'function deflectClearance('));
run(section(game,'function swingHits()', 'let edgeCarry ='));
run(section(game,'function dropGold(', 'function takeGold('));
run(section(game,'function markBossGone(', 'function bossRing('));
run(section(game,'function grabGold()', 'function drawLoot('));
run(section(game,'function feedDragon(', 'let saintT ='));
run(section(game,'function stepFoes(dt)', 'let pHp ='));
run(section(part3,'function stepArena(', 'function arenaRim('));
run(section(part3,'function arenaRim(', 'let lastAreaTile ='));
run('installBirchHuntingRoute(MD);installBirchHuntingRoute(MD);features=MD.features;spawnFoes();');
assert.equal(c.features.length,3,'manual patch installs once');
assert.equal(run("JSON.stringify(features[0].pts)"),'[[145,111],[145,67],[198,67],[198,107]]');
assert.deepEqual([c.features[1].x0,c.features[1].y0,c.features[1].x1,c.features[1].y1],[198,104,198,112]);
assert.deepEqual([c.features[2].x,c.features[2].y,c.features[2].r,c.features[2].style,c.features[2].encounter],[168,67,6.3,'birch','hare']);
assert.equal(run('JSON.stringify(MD.felled)'),JSON.stringify(['900,500']));assert.equal(c.MD.felled_rle,'500:901');
if(species!=='hare')run("features[2].encounter='"+species+"';spawnHuntingAnimals()");
assert.equal(c.foes.length,3);assert(c.foes.every(f=>f.kind===species&&f.hp===(['hare','bird'].includes(species)?2:species==='deer'?4:3)));assert.equal(c.FOE_ART.hare,'hare');assert.equal(c.FOE_ART.boar,'br');
run('spawnFoes()');assert.equal(c.foes.length,3,'reloading creates exactly one herd');
const ring=c.features[2],bounds=run('huntingBounds(features[2])');
if(species==='bird'){
 const bird=c.foes[0];bird.x=bounds.x;bird.y=bounds.y;
 bird.wanderTarget={x:bounds.x-20,y:bounds.y};bird.wanderFlying=true;
 c.f=bird;run('stepHuntingAnimal(f,.1)');assert.equal(bird.st,'escape','short flights use the flight animation');
}

for(let i=0;i<2400;i++){
 c.P.x=bounds.x+Math.cos(i/100)*240;c.P.y=bounds.y+Math.sin(i/100)*240;
 if(i%120===0)c.foes[0].hurt=.25;
 run('stepFoes(1/30);stepArena(1/30)');
 for(const f of c.foes){assert(Math.hypot(f.x-bounds.x,f.y-bounds.y)<=bounds.r+.0001);assert(!c.isSolid(f.x,f.y));assert((species==='bird'?['idle','walk','escape']:['idle','walk']).includes(f.st));}
 assert.equal(c.arenaLock,null,'player can enter/leave without walls');
}
assert.equal(run('arenaRim(features[2]).length'),0);
// Actual sword swings kill, play the br death sheet, and drop meat once.
const f=c.foes[0];f.x=bounds.x+40;f.y=bounds.y;
for(const q of c.foes.slice(1)){q.x=bounds.x-40;q.y=bounds.y;}
c.P.x=f.x;c.P.y=f.y+8;c.f=f;
for(let i=0;i<(['hare','bird'].includes(species)?2:species==='deer'?4:3);i++){c.P.act={kind:'swing',t:4,hit:0};run('swingHits()');}
assert.equal(f.st,'dead');assert.equal(c.loot.filter(g=>g.kind===species+'Meat').length,1);assert.equal(c.gold,50);
run('markBossGone(f);stepFoes(.1);spawnHuntingAnimals()');assert.equal(c.loot.length,1,'no duplicate meat from repeated death handling');
run('grabGold()');assert.equal(c[species+'Meat'],1);assert.equal(c.loot.length,0);assert(c.saved>0);
run("feedDragon('"+(species==='boar'?'meat':species)+"')");assert.equal(c[species+'Meat'],0);assert.equal(c.dragon.hp,5,'hunted meat uses dragon healing');
run('drawHuntingMeat(20,20)');assert(c.meatPixels>20,'meat pickup has visible art');
run('stepHuntingGrounds(299);spawnFoes()');assert.equal(c.foes.length,2,'travel cannot reset the hunt cooldown');
run('stepHuntingGrounds(1.1)');assert.equal(c.foes.length,3,'boars return after five minutes');
// New Build hunting spots populate automatically; removing one removes its herd.
run("features.push({id:9151,kind:'arena',x:220,y:90,r:6.3,style:'birch',encounter:'boar'});spawnHuntingAnimals()");
assert.equal(c.foes.length,6);
run('features.pop();spawnHuntingAnimals()');assert.equal(c.foes.length,3);
}
console.log('PASS: hare, boar, deer, fox and bird hunts: exact route patch, species art, confinement, no walls, sword kills, meat collection, healing, timed respawn and additional hunting spots.');
