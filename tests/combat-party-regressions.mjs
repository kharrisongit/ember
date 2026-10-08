import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false,document:dom.document});
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
function reset(){run(`mode='play';gameplayStarted=true;quest=Q.DONE;bagOwned=true;loadMap('house22');P.x=128;P.y=192;
window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEquipmentTutorial=undefined;window.EmberConversationFlow=undefined;
MD={...MD,roomBlocks:[],roomActors:[],doors:[]};solid.fill(0);npcs=[];objs=[];features=[];
scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;bagOpen=false;foes=[];arenaLock=null;fadeDir=0;fade=0;doorMotion=null;bossScene=null;
P.act=null;arriveT=0;pHp=pMax=6;pInv=0;deadShown=false;mounted=false;ride=null;fishing=null;trial=null;devSafe=false;foesHeld=false;
hatchExit=false;hatchCamera=null;saintT=0;dragonOff=true;glassShield=false;for(var k in keys)keys[k]=0;padDx=padDy=0;houseLootTaken.clear();
for(var k in worn)worn[k]=false;drawWorld=()=>{};`);}
for(const item of ['potion','elixir']){
 reset();run(`potions=elixirs=1;houseLootTaken.add(IceMoth.rewardId);pHp=1;hurtPlayer(1);setOvl('itemm');doUse(BAG.find(i=>i.key==='${item}'));`);
 assert.equal(run('pHp'),0);assert.equal(run(item==='potion'?'potions':'elixirs'),1);
 run('stepAct(1)');assert.equal(run('pHp'),6);assert.equal(run('P.act'),null);assert(!run('deadShown'));assert(!run('IceMoth.owned()'));
}
reset();run('pHp=2;potions=elixirs=1');assert(run('drinkPotion()'));assert.equal(run('pHp'),4);assert(run('drinkElixir()'));assert.equal(run('pHp'),6);
console.log('PASS: fatal-hit items remain unconsumed, Soulwing revival works, and ordinary healing still works.');
for(const menu of ['ovl','bag','ask']){
 reset();run(`keys.d=1;${menu==='ovl'?"setOvl('itemm')":menu==='bag'?'setBag(true)':'ask={opts:[]}'};stepPlayer(.05);movePlayer(1,0,.05);`);
 assert.equal(run('P.x'),128);assert(!run('P.moving'));
 run(`ovl=null;bagOpen=false;ask=null;stepPlayer(.05)`);assert(run('P.x>128'));
}
reset();run(`MAPID='world';P.dir='s';P.dir8='e';P.flip=false;mounted=true;dragonOff=false;dragon.on=true;dragon.down=false;dragon.knockdown=0;dragon.hp=20;dragon.x=P.x;dragon.y=P.y;dragon.placed=MAPID;loot=[];
var victim={kind:'plant1',x:156,y:208,hp:.5,st:'idle',t:0,hurt:0};foes=[victim];clawNow();`);
assert.equal(run('victim.st'),'dead');assert.equal(run('loot.length'),1);assert.deepEqual(json('[loot[0].x,loot[0].y]'),[156,208]);assert(run('loot[0].n>0'));
run('clawT=0;clawNow()');assert.equal(run('loot.length'),1);
console.log('PASS: menus stop movement and mounted claw kills drop collectible gold exactly once.');
reset();run(`gold=1000;marks=1;dropped=null;arenaLock={id:123,x:8,y:12,r:4};arenaT=1;useMark();graves.earned=25;pHp=0;standing=false;safeSpot={map:MAPID,x:P.x,y:P.y};standUp();`);
assert.equal(run('gold'),700);assert.equal(run('dropped.gold'),300);
run('marks=1;useMark()');assert.equal(run('gold'),1000);assert.equal(run('dropped'),null);
run('marks=1;arenaLock={id:123,x:8,y:12,r:4};arenaT=1;useMark();graves.earned=25;releaseArena()');assert.equal(run('gold'),1025);
reset();run(`MAPID='cinderhold';MD={...W.maps.cinderhold,roomBlocks:[],roomActors:[]};lastFight=2;
var guard={kind:'boneguard',x:128,y:180,hx:128,hy:180,hp:0,st:'dead',t:0,dir:'d',flip:false,hold:0,hurt:0};foes=[guard];stones=1;useStone();guard.st='swing';guard.t=FOE.boneguard.hitAt;guard.hitDone=0;stepFoes(.05);`);
assert(run('guard.ally'));assert.equal(run('pHp'),6);
console.log('PASS: defeat forfeits the Grave Marker bonus, recovery/victory still pay, and resurrected throne guards do not attack their rider.');
reset();run(`lastFight=0;window.LDRCoopRender={enable(){}};var panelsRequested=[];var players=[{uid:'host',profile:{name:'Host'}},{uid:'guest',profile:{name:'Guest'}}];`);
await run(`LDRCampaign.start({uid:'host',players,onNotice:()=>{},onSave:()=>true,onLocalPanel:(kind,id)=>panelsRequested.push({kind,id})})`);
run(`scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;bagOpen=false;LDRCampaign.claim('host','action');drawTempleCompass=()=>{};
for(var id of ['host','guest'])LDRCampaign.withActor(id,()=>{pHp=6;pInv=1;P.act=null;P.x=id==='host'?128:200;P.y=192;mounted=false;breathCooldown.fire=10;});
bagOpen=true;last=performance.now();for(var i=0;i<40;i++)LDRCampaign.mainFrame(last+50,false);`);
for(const id of ['host','guest']){
 assert.equal(run(`LDRCampaign.actor('${id}').vars.pInv`),0);assert(Math.abs(run(`LDRCampaign.actor('${id}').cooldown.fire`)-8)<1e-8);
}
run(`bagOpen=false;MAPID='cinderhold';MD=W.maps.cinderhold;foes=[];arenaLock={id:'demon-trial',x:11,y:18,r:25.2};trial={waves:[],index:0,wait:0,spawning:false};LDRCampaign.claim('host','action');pHp=0;LDRCampaign.withActor('guest',()=>pHp=6);stepTrial(.05)`);
assert(run('trial!==null'));
run(`LDRCampaign.withActor('guest',()=>pHp=0);stepTrial(.05)`);assert.equal(run('trial'),null);
console.log('PASS: both riders advance combat timers behind menus; a trial continues until the entire party falls.');
run(`loadMap('house22');foes=[];npcs=[];arenaLock=null;scene=null;hatchCamera=null;bossScene=null;revealing=false;ask=null;ovl=null;bagOpen=false;fade=fadeDir=0;
LDRCampaign.withActor('host',()=>{P.x=80;P.y=180;pHp=6;P.act=null;});LDRCampaign.withActor('guest',()=>{P.x=220;P.y=180;pHp=6;P.act=null;});LDRCampaign.claim('host','action');
var overlays=[];drawDark=()=>overlays.push({kind:'dark',x:P.x,owner:LDRCampaign.owner});drawTempleCompass=()=>overlays.push({kind:'compass',x:P.x,owner:LDRCampaign.owner});
ctx.getTransform=()=>({a:1,b:0,c:0,d:1,e:0,f:0});ctx.createLinearGradient=ctx.createRadialGradient=()=>({addColorStop(){}});LDRCampaign.renderGuest(ctx,640,480,'guest');`);
assert.deepEqual(json('overlays'),[{kind:'dark',x:220,owner:'guest'},{kind:'compass',x:220,owner:'guest'}]);assert.equal(run('LDRCampaign.owner'),'host');
// Render the real canvas fishing gauges for each interactive phase.
run(`var fishingText=[];ctx.fillText=(s)=>fishingText.push(String(s));`);
for(const phase of ['aim','hook','reel']){
 run(`fishing={phase:'${phase}',age:1,elapsed:.4,power:.5,progress:.4,tension:.3,fishX:.5,fishY:.35,tier:1,particles:[],reward:1};fishingText=[];LDRCampaign.renderGuest(ctx,640,480,'guest')`);
 assert(run('fishingText.length>0'),'Fishing canvas draws its gauges and labels on the remote screen');
}
run('fishing=null;LDRCampaign.claim("guest","ui");MENUS.savePrompt.items()[2].go()');
assert(!run('EmberCloud.isOpen()'));assert.deepEqual(json('panelsRequested.pop()'),{kind:'account',id:'guest'});
run('setOvl("sound")');assert.equal(run('ovl'),null);assert.deepEqual(json('panelsRequested.pop()'),{kind:'sound',id:'guest'});
run('LDRCampaign.claim("host","ui");MENUS.savePrompt.items()[2].go()');assert(run('EmberCloud.isOpen()'));dom.element('cloudSaveDialog').close();
run('setOvl("sound")');assert.equal(run('ovl'),'sound');
console.log('PASS: guest compass/light use the viewing rider, fishing gauges render, and guest account/audio requests target their own device.');
