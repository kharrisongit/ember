import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sources=[],listeners={},timers=[],output={};
const context={
 decodeAudioData:async bytes=>bytes,
 createGain:()=>({gain:{value:1},connect(to){this.to=to;},disconnect(){}}),
 createBufferSource:()=>{const s={connect(to){this.gain=to;},start(){this.started=true;},stop(){this.stopped=true;},disconnect(){}};sources.push(s);return s;}
};
const c=vm.createContext({window:{EmberAudio:{graph:()=>({context,output})},addEventListener:(e,f)=>listeners[e]=f},
 document:{hidden:false},performance:{now:()=>0},fetch:async path=>({ok:true,arrayBuffer:async()=>[path]}),
 setInterval:f=>timers.push(f),mode:'play',MAPID:'world',quest:5,Q:{NOISE:5,ARMED:6},P:{x:488,y:320},TS:16,shake:0});
const run=s=>vm.runInContext(s,c),flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
run(read('js/dragon-scene-audio.js'));listeners.touchstart();await flush();
const api=c.window.EmberDragonSceneAudio,active=file=>sources.filter(s=>s.started&&!s.stopped&&s.buffer[0].includes(file));
api.distant();await flush();assert.equal(active('roar').length,1);assert.equal(active('distant').length,1);
api.distant();await flush();assert.equal(sources.length,2,'Repeated requests never double the warning');
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
c.quest=7;timers.forEach(f=>f());assert(sources.every(s=>s.stopped),'Leaving the story clears all effects');
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
