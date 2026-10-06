import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
await run('SpiderQueenWeb.ensureArt()');
run(`const bossTestSystems={EmberArenaEntry,EmberRiding,EmberEncounterCard};
window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEncounterCard=undefined;
SpiderQueenDemo.inspect=()=>({ready:true});SpiderQueenBoss.restore(true);
mode='play';VW=800;VH=600;camFree=false;gameplayStarted=true;quest=Q.DONE;foesHeld=false;dragonOff=true;devSafe=false;glassShield=false;
loadMap('pyramid_queen');scene=null;bossScene=null;P.x=168;P.y=196;
Object.assign(foes[0],{x:168,y:165,st:'idle',t:0});pHp=6;pInv=0;P.act=null;`);
const states=new Set();
for(let i=0;i<55;i++){run('stepCombat(.05)');states.add(run('foes[0].st'));}
assert(states.has('wind')&&states.has('swing')&&states.has('idle'),'Telegraphed stomp and recovery');
assert(run('pHp<6'),'Stomp damages Corin');
run(`loadMap('pyramid_queen');P.x=233;P.y=218;Object.assign(foes[0],{x:124,y:146,st:'idle',t:0});pHp=6;pInv=0;P.act=null;`);
let launched=false,splash=false;
for(let i=0;i<110;i++){run('stepCombat(.05)');launched||=run('SpiderQueenBoss.inspect().shots.length>0');splash||=run('SpiderQueenBoss.inspect().splashes.length>0');}
assert(launched&&splash,'Venom launches and produces an impact');assert(run('pHp<6'),'Aimed venom damages Corin at range');
run(`Object.assign(foes[0],{x:168,y:162,st:'idle',t:0,hp:20});P.x=168;P.y=184;P.dir='u';P.act={kind:'swing',t:4,dir:'u',dir8:'n',hit:0};swingHits();`);
assert(run('foes[0].hp<20&&foes[0].hurt>0'),'Sword damages the queen and triggers hurt art');
run(`P.act=null;devSafe=true;pHp=6;Object.assign(foes[0],{st:'idle',t:0});arenaLock=expandedTempleArenas()[0];arenaT=1;`);
for(const [x,y]of [[64,100],[224,100],[64,208],[224,208]]){
 run(`P.x=${x};P.y=${y};`);
 for(let i=0;i<300;i++)run('stepCombat(.05)');
 assert(run('combatCanStand(foes[0],foes[0].x,foes[0].y)'),'Queen remains inside walls when chasing corners');
}
run("window.EmberEncounterCard={blocking:()=>true};");const before=run('JSON.stringify({f:foes[0],fx:SpiderQueenBoss.inspect()})');run('stepCombat(.2)');assert.equal(run('JSON.stringify({f:foes[0],fx:SpiderQueenBoss.inspect()})'),before,'Encounter prompt pauses boss and venom');
run("window.EmberEncounterCard=undefined;foesHeld=true;");const held=run('JSON.stringify(foes[0])');run('stepCombat(.2)');assert.equal(run('JSON.stringify(foes[0])'),held,'Foes toggle stops boss attacks');
run("foesHeld=false;foes[0].hp=0;foes[0].st='dead';foes[0].t=0;markBossGone(foes[0]);stepCombat(.05);");
assert(run("bossGone['pyramid_queen:0']"));assert.equal(run('SpiderQueenBoss.inspect().shots.length'),0,'Defeat clears remaining venom');
run("loadMap('pyramid_entry');");assert.equal(run('SpiderQueenBoss.inspect().shots.length'),0,'Leaving room clears all projectiles');
console.log('PASS: telegraphed stomp, aimed venom and impact, player damage, sword/hurt response, full-size corner navigation, prompt/Foes pauses, persistent death and projectile cleanup.');
// The slam reaches every corner once; the real B parry works beyond melee range.
function prepareSlam(x,y){
 run(`delete bossGone['pyramid_queen:0'];loadMap('pyramid_queen');scene=null;bossScene=null;ovl=null;fadeDir=0;foesHeld=false;devSafe=false;dragonOff=true;glassShield=false;glassShieldHeld=false;glassShieldWindowUntil=-1;mounted=false;
 P.x=${x};P.y=${y};P.act=null;pHp=6;pInv=0;tAcc=0;smithUpgrade=false;worn.ward=false;worn.twin=false;
 Object.assign(foes[0],{x:168,y:168,st:'swing',t:.8,queenAttack:'stomp',webCool:1000,hit:0,hold:0});stepCombat(.05);`);
}
for(const [x,y]of [[64,100],[224,100],[64,208],[224,208]]){
 prepareSlam(x,y);assert.equal(run('SpiderQueenBoss.inspect().waves.length'),1);
 assert.equal(run('pHp'),6,'Distant damage waits for the visible ring');
 for(let i=0;i<24;i++)run('tAcc+=.05;stepCombat(.05)');
 assert.equal(run('pHp'),4,'A corner cannot escape the full-room slam');
 assert.equal(run('SpiderQueenBoss.inspect().waves.length'),0,'Shockwave finishes cleanly');
}
prepareSlam(224,208);
run(`glassShield=true;Object.assign(foes[0],{x:81,y:108,st:'wind',t:0,hit:0});SpiderQueenBoss.reset();`);
assert(run('inFight()'),'B stays in combat mode across the room');
assert(run('tryGlassShieldParry()'),'A B press during windup queues a block at room-wide range');
for(let i=0;i<52;i++)run('tAcc+=.05;stepCombat(.05)');
assert.equal(run('pHp'),6,'Queued distant block prevents slam damage');assert(run('glassGifStart>0'),'Successful block plays existing shield feedback');
prepareSlam(224,208);run('glassShield=true;glassShieldHeld=true;glassShieldWindowUntil=-1;');
for(let i=0;i<24;i++)run('tAcc+=.05;stepCombat(.05)');assert.equal(run('pHp'),4,'An expired held block does not grant immunity');
prepareSlam(224,208);run('glassShield=true;');
for(let i=0;i<5;i++)run('tAcc+=.05;stepCombat(.05)');
run('glassShieldHeld=true;glassShieldWindowUntil=tAcc+GLASS_BLOCK_WINDOW;tryGlassShieldParry();');
for(let i=0;i<19;i++)run('tAcc+=.05;stepCombat(.05)');assert.equal(run('pHp'),6,'Block after launch also stops the approaching ring');
prepareSlam(224,208);run('scene={lines:[],i:0};');
const pausedWave=run('JSON.stringify(SpiderQueenBoss.inspect().waves)');run('stepCombat(.5)');
assert.equal(run('JSON.stringify(SpiderQueenBoss.inspect().waves)'),pausedWave,'Dialogue pauses the shockwave');
run("scene=null;loadMap('pyramid_entry');");assert.equal(run('SpiderQueenBoss.inspect().waves.length'),0,'Changing rooms clears the slam');
prepareSlam(224,208);run("foes[0].st='dead';stepCombat(.1)");assert.equal(run('SpiderQueenBoss.inspect().waves.length'),0,'Queen defeat clears the slam');
run('glassShield=false;glassShieldHeld=false;');
console.log('PASS: room-wide slam in all corners, single hit, distant windup and post-launch B blocks, expired shield rejection, pause and cleanup.');
// The special attack must be escapable through the actual Dragon → Fire action.
run(`delete bossGone['pyramid_queen:0'];loadMap('pyramid_queen');scene=null;bossScene=null;ovl=null;fadeDir=0;foesHeld=false;devSafe=false;dragonOff=false;devDragonPassive=false;dragonIntroDone=true;dragonReady=true;
P.x=103;P.y=200;P.act=null;pHp=6;pMax=6;pInv=0;
Object.assign(dragon,{on:true,down:false,x:228,y:200,placed:MAPID,air:false,knockdown:0,hp:40,maxHp:40,inv:0});
Object.assign(foes[0],{x:168,y:135,st:'idle',t:0,webCool:0});breathCooldown.fire=11;cam.z=3.2;`);
for(let i=0;i<50;i++)run('stepCombat(.05)');
assert(run('SpiderQueenBoss.webbed()'),'Room-wide cast traps both party members');
assert.equal(run('dragon.x-P.x'),44,'Party lands side by side');assert.equal(run('P.y'),run('dragon.y'),'Shared capture area');
assert(run('canStand(P.x,P.y)&&dragonCanStand(dragon.x,dragon.y)'), 'Both capture destinations are clear');
assert(run('SpiderQueenBoss.playerPose()?.kind==="die"&&P.act===null&&!dragon.down&&dragon.knockdown===0'),'Lying poses do not kill, faint or disable Fire');
const nets=JSON.parse(run('JSON.stringify(SpiderQueenBoss.inspect().web.nets)'));assert(new Set(nets.map(n=>n.w)).size>=6&&new Set(nets.map(n=>n.variant)).size===5,'Layered web scales and five silhouettes');
const webLayers=JSON.parse(run(`JSON.stringify((()=>{
  const entries=[];SpiderQueenBoss.addEffects(entries);
  const original=drawPixelImage,alphas=[];
  try{
    drawPixelImage=()=>alphas.push(ctx.globalAlpha);
    SpiderQueenBoss.draw(entries.find(o=>o.queenWeb));
    const floor=alphas.splice(0);
    SpiderQueenBoss.draw(entries.find(o=>o.queenWebBinding));
    return {floor,bindings:alphas};
  }finally{drawPixelImage=original;}
})())`));
assert.equal(webLayers.floor.length,nets.length,'Room silk is a separate floor pass');
assert.equal(webLayers.bindings.length,2,'Only one binding per character overlays the party');
assert(webLayers.bindings.every(a=>a<=.3),'Bindings keep the trapped characters visible');
assert(webLayers.floor.every(a=>a<=.45),'Overlapping room silk is softened');
assert.equal(run('breathWait("fire")'),0,'Escape Fire is available even after a recent cast');
const zoomBeforeWeb=run('cam.z');run('SpiderQueenBoss.frameCamera();');
assert(run('cam.z>Math.min(3.2,(VW-24)/(192+40),(VH-24)/(144+96))'),'Capture camera stays closer than a whole-room view');
assert(run('[P,dragon,foes[0]].every(a=>a.x>cam.x&&a.x<cam.x+VW/cam.z&&a.y-65>cam.y&&a.y<cam.y+VH/cam.z)'), 'Camera keeps both victims and the approaching queen in view');
const anchors=run('JSON.stringify([P.x,P.y,dragon.x,dragon.y])');
run('padDx=1;padDy=1;stepPlayer(.5);stepDragon(.5);dragonStep(90,90);');
assert.equal(run('JSON.stringify([P.x,P.y,dragon.x,dragon.y])'),anchors,'Player input, following and direct dragon movement cannot escape');
assert.equal(run('setMounted(true,true)'),false,'Mounting cannot bypass webs');
assert.equal(run('setDragonAir(true)'),false,'Flight cannot bypass webs');
run('P.act=null;startAct("swing");');assert.equal(run('P.act'),null,'Bound Corin cannot swing through webs');
run('clawNow();');assert.equal(run('claw'),null,'Bound dragon cannot claw through webs');
// A successful capture takes exactly one displayed heart from either actor.
run('foes[0].x=P.x-35;foes[0].y=P.y;');
for(let i=0;i<25;i++)run('stepCombat(.05)');assert.equal(run('pHp'),5);
assert.equal(run('SpiderQueenBoss.inspect().web.phase'),'retreating','Each bite starts a retreat');
const bittenAt=run('Math.min(Math.hypot(foes[0].x-P.x,foes[0].y-P.y),Math.hypot(foes[0].x-dragon.x,foes[0].y-dragon.y))');
for(let i=0;i<45;i++)run('stepDragon(.05);stepCombat(.05);');
assert.equal(run('pHp'),5);assert.equal(run('dragon.hp'),40,'No repeat bite during retreat');
assert(run('Math.min(Math.hypot(foes[0].x-P.x,foes[0].y-P.y),Math.hypot(foes[0].x-dragon.x,foes[0].y-dragon.y))')>bittenAt+20,'Retreat is visibly away from the pinned pair');
for(let i=0;i<100&&run('SpiderQueenBoss.inspect().web.phase')==='retreating';i++)run('stepDragon(.05);stepCombat(.05);');
assert.equal(run('SpiderQueenBoss.inspect().web.phase'),'trapped');
for(let i=0;i<75;i++)run('stepDragon(.05);stepCombat(.05);');
assert.equal(run('pHp'),5);assert.equal(run('dragon.hp'),40,'A new slow approach gives time for Fire');
run('foes[0].x=dragon.x+35;foes[0].y=dragon.y;');
run('stepCombat(.05)');
assert(Math.abs(run('dragon.hp')-(40-40/6))<1e-8,'Dragon bite also removes exactly one of its six HUD hearts');
const left=run('foes[0].x');
run('breath={el:"ice",t:.1};breathCooldown.fire=12;dragon.knockdown=1;ATTACKS.find(a=>a.el==="fire").go();');
assert(!run('SpiderQueenBoss.webbed()'),'Real Fire menu action frees both actors');
assert.equal(run('SpiderQueenBoss.inspect().web.phase'),'burning');
assert.equal(run('foes[0].queenStun'),3.5);assert.equal(run('breath.el'),'fire');
assert.equal(run('hunt'),null,'Fire casts from the trapped position without walking toward queen');
run('stepCombat(.5);');assert.equal(run('foes[0].x'),left,'Stunned queen cannot move');
run('stepCombat(1.1);');assert.equal(run('SpiderQueenBoss.inspect().web'),null,'Burn animation clears completely');assert.equal(run('cam.z'),zoomBeforeWeb,'Normal zoom returns after the web burns');
for(let i=0;i<55;i++)run('stepCombat(.05)');assert.equal(run('foes[0].queenStun'),0,'Stun ends after its recovery window');
run('breath=null;foes[0].webCool=0;');for(let i=0;i<50;i++)run('stepCombat(.05)');
assert(run('SpiderQueenBoss.webbed()'));run("loadMap('pyramid_entry')");assert(!run('SpiderQueenBoss.webbed()'),'Map changes cannot retain movement locks');
console.log('PASS: room-wide web, both movement locks, no mount/flight/sword escape, single-heart bite/retreat cycles, cooldown/knockdown-safe Fire menu counter, burn/release, 3.5-second stun and reset.');
// Exercise the actual encounter gate as well as the isolated combat states.
run(`Object.assign(window,bossTestSystems);EmberRiding.skip();devSafe=true;revealing=false;
loadMap('pyramid_queen');P.x=168;P.y=200;P.act=null;dragon.x=195;dragon.y=200;dragon.placed=MAPID;
EmberArenaEntry.prepare();stepArena(.05);`);
for(let i=0;i<40;i++)run('tAcc+=.05;EmberArenaEntry.step(.05);stepDragon(.05);stepArena(.05);stepCombat(.05);');
assert(run('EmberArenaEntry.holding()'),'Queen encounter waits for player readiness');
assert(!run('SpiderQueenBoss.webbed()'),'Readiness pause cannot capture player');
run('EmberArenaEntry.action();foes[0].webCool=0;');
assert(!run('EmberArenaEntry.holding()'),'Ready action starts queen battle');
for(let i=0;i<31;i++)run('tAcc+=.05;EmberArenaEntry.step(.05);stepCombat(.05);');
assert(run('SpiderQueenBoss.webbed()'),'Special works inside the real encounter gate');
run('setFoesEnabled(false);stepCombat(.05);');
assert.equal(run('SpiderQueenBoss.inspect().web'),null,'Disabling foes clears capture without leaving a stale web');
console.log('PASS: real encounter readiness, activation, web capture, and developer pause cleanup.');

// First capture teaches the counter through the real telepathic scene, once per save.
run(`window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEncounterCard=undefined;
setFoesEnabled(true);SpiderQueenBoss.restore(false);loadMap('pyramid_queen');devSafe=false;scene=null;P.act=null;pHp=6;
P.x=168;P.y=204;Object.assign(dragon,{on:true,down:false,x:186,y:204,placed:MAPID,hp:40,maxHp:40});
Object.assign(foes[0],{x:168,y:168,st:'idle',t:0,webCool:0});`);
for(let i=0;i<50;i++)run('stepCombat(.05)');
assert(run('scene?.telepathy&&scene.spiderWebLesson'),'First capture opens telepathy');
assert(run('scene.lines.some(s=>s.startsWith("Corin:"))&&scene.lines.some(s=>s.startsWith("Aurelius:")&&/fire/i.test(s))'),'Both characters discover fire');
const waiting=run('JSON.stringify([foes[0].x,foes[0].y,pHp,dragon.hp,SpiderQueenBoss.inspect().web.t])');
for(let i=0;i<100;i++)run('stepCombat(.05)');
assert.equal(run('JSON.stringify([foes[0].x,foes[0].y,pHp,dragon.hp,SpiderQueenBoss.inspect().web.t])'),waiting,'Reading time does not consume the escape window');
for(let i=0;i<5;i++)run('typeAll();scene.t=.3;advanceScene();');
assert.equal(run('scene'),null);assert(run('SpiderQueenBoss.capture()'),'Lesson completes only after the exchange');
assert(run('captureSave().spiderWebLesson'),'Lesson is included in normal save data');
const startDistance=run('Math.min(Math.hypot(foes[0].x-P.x,foes[0].y-P.y),Math.hypot(foes[0].x-dragon.x,foes[0].y-dragon.y))');
for(let i=0;i<100;i++)run('stepCombat(.05)');
assert.equal(run('pHp'),6);assert.equal(run('dragon.hp'),40,'No bite during the first five seconds after the conversation');
assert(run('Math.min(Math.hypot(foes[0].x-P.x,foes[0].y-P.y),Math.hypot(foes[0].x-dragon.x,foes[0].y-dragon.y))')<startDistance-20,'Her slow approach is visibly moving');
run('ATTACKS.find(a=>a.el==="fire").go();');assert(!run('SpiderQueenBoss.webbed()'));assert.equal(run('SpiderQueenBoss.playerPose()'),null);
run('breath=null;foes[0].queenStun=0;foes[0].webCool=0;');for(let i=0;i<50;i++)run('stepCombat(.05)');
assert(run('SpiderQueenBoss.webbed()'));assert.equal(run('scene'),null,'Later captures do not repeat the exchange');
run('SpiderQueenBoss.restore(false);');assert(!run('SpiderQueenBoss.capture()'),'A different legacy/new save can teach it again');
console.log('PASS: paired safe landings, lying poses without death, varied web layers, first-capture telepathy, reading pause, saved lesson, visible six-second approach and repeat suppression.');

run('SpiderQueenBoss.restore(true);saveToSlot(1,true);SpiderQueenBoss.restore(false);');assert(run('loadGame(1)'));assert(run('SpiderQueenBoss.capture()'),'Completed lesson restores from its save slot');
run('localStorage.setItem(saveKey(2),JSON.stringify({...captureSave(),spiderWebLesson:false}));');assert(run('loadGame(2)'));assert(!run('SpiderQueenBoss.capture()'),'Switching saves resets the first-capture lesson correctly');
console.log('PASS: camera framing/recovery and actual lesson persistence across save slots.');

run("localStorage.setItem(saveKey(2),JSON.stringify({...captureSave(),map:'pyramid_queen',x:384,y:316,pyramidLayoutVersion:1}));");
assert(run('loadGame(2)'));assert(run('canStand(P.x,P.y)&&P.x===MD.spawn[0]&&P.y===MD.spawn[1]'),'Old boss-room saves load on safe floor after shrinking');
console.log('PASS: old boss-room save migrates safely to the smaller chamber.');

// Raised venom artwork must not collide with the wall behind its mouth.
for(const [qx,qy,px,py]of [[80,108,224,148],[208,108,80,148],[144,108,144,208],[144,198,144,100]]){
 run(`delete bossGone['pyramid_queen:0'];loadMap('pyramid_queen');scene=null;bossScene=null;ovl=null;fadeDir=0;foesHeld=false;devSafe=false;dragonOff=true;P.act=null;pHp=6;pInv=0;P.x=${px};P.y=${py};
 Object.assign(foes[0],{x:${qx},y:${qy},st:'idle',t:0,webCool:1000,venomCool:0,attackCool:0,hold:0});`);
 let visibleAge=0;
 for(let i=0;i<64;i++){run('stepCombat(.05)');visibleAge=Math.max(visibleAge,run('Math.max(0,...SpiderQueenBoss.inspect().shots.map(s=>s.t))'));}
 assert(visibleAge>=.3,'Venom survives its mouth and visibly travels at the room edge');
 assert(run('pHp<6'),'Travelling venom damages its target '+[qx,qy,px,py].join(','));
}
console.log('PASS: visible, damaging venom in all four directions from room-edge positions.');
