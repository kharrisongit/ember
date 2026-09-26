import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sources=[],listeners={},documentListeners={},timers=[],output={};
const context={
 decodeAudioData:async bytes=>bytes,
 createGain:()=>({gain:{value:1},connect(to){this.to=to;},disconnect(){}}),
 createBufferSource:()=>{const s={connect(to){this.gain=to;},start(){this.started=true;},stop(){this.stopped=true;},disconnect(){}};sources.push(s);return s;}
};
const c=vm.createContext({window:{EmberAudio:{graph:()=>({context,output})},addEventListener:(e,f)=>listeners[e]=f},
 document:{hidden:false,addEventListener:(e,f)=>documentListeners[e]=f},performance:{now:()=>0},fetch:async path=>({ok:true,arrayBuffer:async()=>[path]}),
 setInterval:f=>timers.push(f),mode:'play',MAPID:'world',quest:5,Q:{NOISE:5,ARMED:6},P:{x:488,y:320},TS:16,shake:0});
const run=s=>vm.runInContext(s,c),flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
run(read('js/dragon-scene-audio.js'));listeners.touchstart();await flush();
const api=c.window.EmberDragonSceneAudio,active=file=>sources.filter(s=>s.started&&!s.stopped&&s.buffer[0].includes(file));
const musicEvents=[];c.window.EmberDragonMusic={omen:()=>musicEvents.push('cut'),reveal:()=>musicEvents.push('reveal')};
api.distant();await flush();assert.equal(active('roar').length,1);assert.equal(active('distant').length,1);
api.distant();await flush();assert.equal(sources.length,2,'Repeated requests never double the warning');
assert.deepEqual(musicEvents,['cut']);
active('roar')[0].onended();assert.deepEqual(musicEvents,['cut'],'Music waits for the longer crash clip too');
active('distant')[0].onended();assert.deepEqual(musicEvents,['cut','reveal'],'The music starts only after both sounds finish');
const game=read('js/generated/game-part-2.js');
run(game.slice(game.indexOf('const GREEN ='),game.indexOf('\nfunction followCam()')));
run(game.slice(game.indexOf('function greenAt()'),game.indexOf('\nconst Q =')));
c.quest=6;run('greenFly(.01)');await flush();assert.equal(active('wings').length,1);
run('greenFly(2.5)');await flush();assert.equal(active('wings').length,0);assert.equal(active('dragon-crash').length,1);
run('greenFly(.2)');await flush();assert.equal(sources.filter(s=>s.buffer[0].includes('dragon-crash')).length,1,'Impact fires once');
run('greenFly(1.1)');await flush();assert.equal(active('breathing').length,1);assert(active('breathing')[0].loop);
run('greenGone=true;greenFly(.01)');await flush();assert.equal(active('breathing').length,0);assert.equal(active('wings').length,1);
const takeoff=active('wings')[0];run('greenFly(1)');await flush();assert.equal(active('wings')[0],takeoff,'Takeoff flows into departure without restarting wings');
run('greenFly(1.4)');await flush();assert.equal(active('wings').length,0);
for(const s of sources){assert.equal(s.gain.gain.value,.7);assert.equal(s.gain.to,output,'Every effect honors the shared volume control');}
c.quest=7;timers.forEach(f=>f());assert(sources.every(s=>s.stopped||s===sources[0]||s===sources[1]),'Leaving the story clears all effects');
c.quest=6;api.phase('sit');c.mode='title';timers.forEach(f=>f());await flush();assert.equal(active('breathing').length,0,'A late decode cannot leak audio into the title');
c.mode='play';api.phase('sit');await flush();assert.equal(active('breathing').length,1);c.document.hidden=true;timers.forEach(f=>f());assert.equal(active('breathing').length,0);
assert.match(game,/EmberDragonSceneAudio\?\.distant\(\);\s+scatterBirds\(\)/,'The warning is attached to the scripted stop outside Maddock’s house');
console.log('PASS: warning cues, animation-timed wings/impact/breathing, 30% reduction, shared volume, and cleanup on departure, title and background.');

// General effects also work outside the northern encounter and inside rooms.
c.document.hidden=false;c.quest=9;c.MAPID='tp1';
const sfx=c.window.EmberSfx;
c.P={act:null,dir:'s',flip:false};c.fadeDir=0;c.worn={};c.brandHot=false;
c.hasSword=()=>true;c.playerFacing4=()=> 's';
run(game.slice(game.indexOf('function startAct('),game.indexOf('\nfunction stepAct(')));
run("startAct('swing')");await flush();assert.equal(active('sword-swing').length,1);
const firstSwing=active('sword-swing')[0],count=sources.length;
run("startAct('swing')");await flush();assert.equal(sources.length,count,'Blocked repeated A cannot duplicate the swing');
c.P.act=null;run("startAct('swing')");await flush();assert(firstSwing.stopped);assert.equal(active('sword-swing').length,1,'Each accepted attack restarts its own sound');
api.phase('off');timers.forEach(f=>f());assert.equal(active('sword-swing').length,1,'Dragon cleanup cannot silence ordinary gameplay');
sfx.pickup();sfx.pickup();await flush();assert.equal(active('item-pickup').length,1,'A batch of loot makes one pickup sound');
sfx.key();await flush();assert.equal(active('key-item').length,1);
run(game.slice(game.indexOf('function isKeyItemReveal('),game.indexOf('\nfunction showReveal(')));
for(const caption of ['Corin obtained a Heartstone!','Corin received his father’s compass.','Corin obtained a mysterious stone'])assert(c.isKeyItemReveal(caption));
assert(!c.isKeyItemReveal('Corin obtained a Potion!','inventory_potion'));
assert(!c.isKeyItemReveal('Corin planted the Grave Marker!','inventory_mark'));
assert(!c.isKeyItemReveal('THE DRAGON CHOOSES HIM'));
// Actual ground-loot collection is silent when nothing is acquired.
Object.assign(c,{loot:[],gold:0,boarMeat:0,hareMeat:0,deerMeat:0,foxMeat:0,birdMeat:0,toast(){},saveGame(){},flyGold(){},treasuryGuarding:()=>false});
c.P.x=10;c.P.y=10;
run(game.slice(game.indexOf('function grabGold()'),game.indexOf('\nfunction drawLoot()')));
const pickupsBefore=sources.filter(s=>s.buffer[0].includes('item-pickup')).length;
assert.equal(c.grabGold(),false);await flush();assert.equal(sources.filter(s=>s.buffer[0].includes('item-pickup')).length,pickupsBefore);
active('item-pickup')[0].onended();
c.loot=[{x:10,y:10,n:2,kind:'birdMeat'}];assert(c.grabGold());await flush();assert.equal(c.birdMeat,2);
assert.equal(sources.filter(s=>s.buffer[0].includes('item-pickup')).length,pickupsBefore+1);
Object.assign(c,{glassShieldActive:()=>false,glassAttackUnblockable:f=>!!f.unblockableAttack,isSolid:()=>false,tAcc:1});
run(game.slice(game.indexOf('function glassShieldDeflectFoe('),game.indexOf('\nfunction finishGlassShieldParry(')));
const foe={x:20,y:10,glassParryQueued:false};
assert.equal(c.glassShieldDeflectFoe(foe),false);await flush();assert.equal(active('shield-block').length,0,'A missed block is silent');
foe.glassParryQueued=true;foe.unblockableAttack=true;
assert.equal(c.glassShieldDeflectFoe(foe),false);await flush();assert.equal(active('shield-block').length,0,'Unblockable attacks do not play success audio');
foe.unblockableAttack=false;assert(c.glassShieldDeflectFoe(foe));await flush();assert.equal(active('shield-block').length,1);
Object.assign(c,{foesHeld:false,bossScene:null,bolts:[{x:10,y:1,sp:0,vx:0,vy:1,t:0,life:1,unblockable:false}],glassShieldActive:()=>true,burstAt(){},hurtPlayer(){assert.fail('Blocked projectile must not cause damage');}});
run(game.slice(game.indexOf('function stepBolts('),game.indexOf('\nfunction stepAnims(')));
const meleeBlock=active('shield-block')[0];c.stepBolts(.01);await flush();assert(meleeBlock.stopped,'Projectile block triggers its own impact sound');
c.deadShown=false;c.gold=0;c.document.getElementById=()=>({style:{}});c.requestAnimationFrame=f=>f();
run(game.slice(game.indexOf('function showDeath()'),game.indexOf('\nfunction getUp()')));
c.showDeath();await flush();assert.equal(active('game-over').length,1);
assert.equal(active('shield-block').length,0,'Game over clears combat sounds');
const deathCount=sources.length;c.showDeath();await flush();assert.equal(sources.length,deathCount,'Game over plays once per death');
c.deadShown=false;timers.forEach(f=>f());assert.equal(active('game-over').length,0,'Retry or loading a save stops the death sound');
c.mode='title';timers.forEach(f=>f());assert.equal(active('sword-swing').length,0);assert.equal(active('key-item').length,0);
console.log('PASS: accepted sword attacks, successful melee/projectile blocks, ordinary loot, key rewards, game over, grouped pickups, interior playback, and independent dragon/gameplay cleanup.');

c.mode='play';c.deadShown=false;
Object.assign(c,{smithUpgrade:false,worn:{},seenFoe:{},seenCount:0,
 directionVector:()=>[0,1],foeBodyProfile:f=>({x:f.x,y:f.y,r:5}),swordOverlaps:()=>false,
 makeFoeRetreat(){},kingDeflect(){},dropGold(){},markBossGone(){}});
run(game.slice(game.indexOf('function swingHits()'),game.indexOf('\nlet edgeCarry')));
const hitCount=()=>sources.filter(s=>s.buffer[0].includes('sword-hit')).length;
const strike=async foes=>{c.foes=foes;c.P.act={kind:'swing',t:4};c.swingHits();await flush();};
const target=()=>({x:10,y:26,kind:'gnoll1',st:'idle',hp:3});
await strike([]);assert.equal(hitCount(),0,'Missing is silent');
await strike([{...target(),x:1000},{...target(),ally:true},{...target(),st:'dead'},{...target(),kind:'kdragon',swordGuard:1}]);
assert.equal(hitCount(),0,'Out-of-range, friendly, dead and deflecting targets do not play successful-hit audio');
const enemy=target();await strike([enemy]);assert.equal(enemy.hp,2);assert.equal(hitCount(),1);
c.swingHits();await flush();assert.equal(hitCount(),1,'A swing cannot repeat the hit sound every frame');
await strike([target(),{...target(),hp:1}]);assert.equal(hitCount(),2,'A sweep hitting several enemies, including a kill, makes one impact cue');
console.log('PASS: sword impact fires only on successful damage, once per swing; misses, allies, corpses and boss deflections stay silent.');

const golemCount=()=>sources.filter(s=>s.buffer[0].includes('golem-hit')).length;
const normalBefore=hitCount();
for(const kind of ['golem1','golem2','golem3','golem4'])await strike([{...target(),kind}]);
assert.equal(golemCount(),4);assert.equal(hitCount(),normalBefore,'Golems replace the ordinary impact sound');
await strike([{...target(),kind:'golem1',ally:true},{...target(),kind:'golem2',st:'dead'},{...target(),kind:'golem3',x:1000}]);
assert.equal(golemCount(),4,'Only a golem that actually takes sword damage produces an impact');
await strike([{...target(),kind:'golem1'},{...target(),kind:'golem4',hp:1}]);assert.equal(golemCount(),5,'One golem impact per connected swing, including kills');
await strike([target(),{...target(),kind:'golem2'}]);assert.equal(hitCount(),normalBefore+1);assert.equal(golemCount(),6,'Mixed targets each get their appropriate impact');
console.log('PASS: all four golem types use their own successful sword impact; ordinary enemies keep theirs.');

sfx.hatch();await flush();assert.equal(active('egg-hatch').length,1);assert.equal(active('egg-hatch')[0].loop,false);assert.equal(active('egg-hatch')[0].gain.to,output);

// Breath audio belongs to enemy damage, never casting, walls, or empty ground.
Object.assign(c,{foesHeld:false,bossScene:null,dragonCombatPause:0,breathCooldown:{},breathWait:()=>0,
 stepHunt(){},BREATH:{reach:152},DRAGON_BREATH:{fire:{damage:8},ice:{damage:20},bolt:{damage:12},shadow:{damage:16}},
 FOE:{gnoll1:{hp:10}},isSolid:()=>false});
run(game.slice(game.indexOf('function stepBreath('),game.indexOf('\nfunction drawLavaBubbles(')));
const breathHits=()=>sources.filter(s=>s.buffer[0].includes('dragon-breath-hit')).length;
const blast=async(foes,el='fire')=>{
 c.foes=foes;c.breath={el,t:0,x:0,y:0,vx:1,vy:0,distance:0,hit:0,impactT:0,speed:200};
 c.stepBreath(.1);await flush();
 const before=breathHits();c.stepBreath(.2);await flush();return before;
};
await blast([]);assert.equal(breathHits(),0,'An empty shot is silent');
const breathTarget=()=>({...target(),x:12,y:0,hp:10});
await blast([{...breathTarget(),ally:true},{...breathTarget(),st:'dead'},{...breathTarget(),storyPassive:true}]);
assert.equal(breathHits(),0,'Breath ignores allies, dead enemies, and story characters');
c.isSolid=()=>true;await blast([breathTarget()]);assert.equal(breathHits(),0,'A wall impact is silent');c.isSolid=()=>false;
for(const el of ['fire','ice','bolt','shadow']){
 const foe=breathTarget(),before=await blast([foe],el);
 assert.equal(breathHits(),before+1);assert(foe.hp<10,'The sound accompanies actual damage');
 c.stepBreath(.05);await flush();assert.equal(breathHits(),before+1,'An impact cannot repeat every frame');
 const sound=active('dragon-breath-hit')[0];assert.equal(sound.loop,false);assert.equal(sound.gain.gain.value,.7);assert.equal(sound.gain.to,output);
}
const injured={...breathTarget(),hp:2},beforeKill=await blast([injured]);assert.equal(injured.st,'dead');assert.equal(breathHits(),beforeKill+1,'Lethal breath also plays the impact');
console.log('PASS: breath impact plays once on successful enemy damage, including kills; casting, misses, walls, allies and corpses stay silent.');

// The UI shares the mixer, but is also available while choosing a title save.
let uiTime=100;c.performance.now=()=>uiTime;
const uiCount=()=>sources.filter(s=>s.buffer[0].includes('ui-click')).length;
c.mode='title';sfx.ui();sfx.ui();await flush();assert.equal(uiCount(),1,'One gesture can reach several handlers without doubling its click');
let uiSound=active('ui-click')[0];assert.equal(uiSound.gain.gain.value,.7);assert.equal(uiSound.gain.to,output);
timers.forEach(f=>f());assert(!uiSound.stopped,'Title cleanup lets the short UI sound finish');
uiTime+=100;sfx.ui();await flush();assert(uiSound.stopped);assert.equal(uiCount(),2,'A new press promptly restarts the click');
c.document.hidden=true;timers.forEach(f=>f());assert.equal(active('ui-click').length,0);uiTime+=100;sfx.ui();await flush();assert.equal(uiCount(),2);
c.document.hidden=false;c.mode='play';
const part3=read('js/generated/game-part-3.js');
run(part3.slice(part3.indexOf('function askTake()'),part3.indexOf('\nconst HEALS =')));
c.askShut=()=>{c.ask=null;};c.askPick=0;let chosen=0;
const button={disabled:false,getAttribute:()=>null,closest:()=>null};
uiTime+=100;documentListeners.click({target:{closest:()=>button}});
c.ask={quick:true,opts:[{go:()=>chosen++}]};c.askTake();await flush();
assert.equal(chosen,1);assert.equal(uiCount(),3,'A tapped shop/topic option gets just one click');
uiTime+=100;button.disabled=true;documentListeners.click({target:{closest:()=>button}});await flush();assert.equal(uiCount(),3,'Disabled menu buttons stay silent');
button.disabled=false;button.closest=selector=>selector==='#dpad,#act,#btnB'?button:null;
documentListeners.click({target:{closest:()=>button}});await flush();assert.equal(uiCount(),3,'Gameplay controls are excluded from generic clicks');
Object.assign(c,{revealing:false,scene:{i:0,t:1,lines:['hello','goodbye']},typeDone:()=>true,showScene(){},sendWalkerHome(){}});
run(game.slice(game.indexOf('function advanceScene()'),game.indexOf('\nconst HERD_Y')));
uiTime+=100;c.advanceScene();await flush();assert.equal(c.scene.i,1);assert.equal(uiCount(),4,'Advancing a conversation clicks');
uiTime+=100;c.scene.hold=true;c.advanceScene();await flush();assert.equal(uiCount(),4,'An unavailable cutscene advance is silent');
c.scene.hold=false;c.typeDone=()=>false;let completedText=false;c.typeAll=()=>{completedText=true;};
uiTime+=100;c.advanceScene();await flush();assert(completedText);assert.equal(uiCount(),5,'Revealing a typing line clicks');
console.log('PASS: dialogue/typing advances, menu taps, title playback, one click per gesture, reduced shared volume, and no clicks on disabled controls or gameplay A/B.');

const coinCount=()=>sources.filter(s=>s.buffer[0].includes('coin-collect')).length;
const itemsBefore=sources.filter(s=>s.buffer[0].includes('item-pickup')).length;
c.loot=[{x:10,y:10,n:5},{x:11,y:10,n:7}];const goldBefore=c.gold;
assert(c.grabGold());await flush();assert.equal(c.gold,goldBefore+12);assert.equal(coinCount(),1);
assert.equal(sources.filter(s=>s.buffer[0].includes('item-pickup')).length,itemsBefore,'Coins have their own sound');
assert(!c.grabGold());await flush();assert.equal(coinCount(),1,'No duplicate cue for an empty pickup');
active('coin-collect')[0].onended();c.loot=[{x:10,y:10,n:1,kind:'birdMeat'},{x:10,y:10,n:1}];
c.grabGold();await flush();assert.equal(coinCount(),2);
console.log('PASS: a pile of coins plays one collection sound, separate from food pickups.');
