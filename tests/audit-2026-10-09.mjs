import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom();
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false,document:dom.document});
c.CraftingView=undefined;
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
let failures=0,checks=0;
async function test(number,name,fn){checks++;try{await fn();console.log(`PASS ${number}: ${name}`);}catch(e){failures++;console.error(`FAIL ${number}: ${name}: ${e.message}`);}}
function reset(){run(`Crafting.close();Crafting.restore(null);mode='play';gameplayStarted=true;quest=Q.DONE;bagOwned=true;loadMap('house22');P.x=128;P.y=192;
window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEquipmentTutorial=undefined;window.EmberConversationFlow=undefined;
MD={...MD,roomBlocks:[],roomActors:[],doors:[]};solid.fill(0);npcs=[];objs=[];features=[];
scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;bagOpen=false;foes=[];arenaLock=null;arenaT=0;arenaGoing=false;fadeDir=0;fade=0;doorMotion=null;bossScene=null;
P.act=null;arriveT=0;pHp=pMax=6;pInv=0;deadShown=false;mounted=false;ride=null;fishing=null;trial=null;devSafe=false;foesHeld=false;devItemTest=false;
hatchExit=false;hatchCamera=null;saintT=0;wakeCool=0;dragonOff=true;glassShield=false;for(var k in keys)keys[k]=0;padDx=padDy=0;houseLootTaken.clear();
for(var k in worn)worn[k]=false;for(var k in charm)charm[k]=false;activeSaveSlot=1;EmberCloudState.conflicts.clear();`);}
await test(1,'Consumable use saves the changed inventory and health',()=>{
 reset();run('pHp=1;potions=2;breaths=2;saveGame();drinkPotion()');assert.equal(run('readSaveSlot(1).potions'),1);assert.equal(run('readSaveSlot(1).playerHp'),3);
 run('useSaint()');assert.equal(run('readSaveSlot(1).breaths'),1);
 for(const [field,action,setup]of [['elixirs','drinkElixir()','pHp=1'],['bells','useBell()',''],['dust','useDust()',"foes=[{kind:'plant1',x:P.x,y:P.y,st:'idle',hp:5},{kind:'plant2',x:P.x+40,y:P.y,st:'idle',hp:5}]"],['stones','useStone()',"foes=[{kind:'plant1',x:P.x,y:P.y,st:'dead',hp:0}]"],['bombs','useBomb()',"arenaLock={id:987,x:8,y:12,r:6}"]]){
  reset();run(`${field}=2;${setup};saveGame()`);assert(run(action));assert.equal(run(`readSaveSlot(1).${field}`),1,field);
 }
});
await test(2,'Equipping and unequipping charms survives an immediate reload',()=>{
 reset();run(`charm.ward=true;saveGame();bagPick=bagHeld().findIndex(i=>i.key==='ward');bagUse();askTake()`);
 assert(run('readSaveSlot(1).worn.ward'));
 run('loadGame(1);bagPick=bagHeld().findIndex(i=>i.key==="ward");bagUse();askTake()');assert(!run('readSaveSlot(1).worn.ward'));
 run('setBag(true);bagPick=bagHeld().findIndex(i=>i.key==="ward");refreshBag()');
 dom.dispatch(dom.element('bagDesc').querySelector('.equipBtn'),'click');assert(run('readSaveSlot(1).worn.ward'),'The touch equip button saves too');
});
await test(3,'Gold pickups and treasury chest claims are saved together',()=>{
 reset();run(`gold=100;saveGame();loot=[{x:P.x,y:P.y,n:25,t:1,treasuryId:'audit-chest'}];grabGold()`);
 assert.equal(run('readSaveSlot(1).gold'),125);assert(run('readSaveSlot(1).treasuryTaken.includes("audit-chest")'));
});
await test(4,'Ordinary arena victory pays the Grave Marker bonus once',()=>{
 reset();run(`gold=100;marks=1;var ring={kind:'arena',id:987,x:8,y:12,r:6};features=[ring];arenaLock=ring;arenaT=.01;arenaGoing=true;useMark();graves.earned=25;stepArena(.05)`);
 assert.equal(run('arenaLock'),null);assert.equal(run('gold'),125);assert.equal(run('graves'),null);run('stepArena(.05)');assert.equal(run('gold'),125);
 assert.equal(run('readSaveSlot(1).gold'),125,'The earned bonus is durable');
});
await test(5,'Allied projectile and melee kills drop collectible gold',()=>{
 reset();run(`var caster={kind:'mage1',ally:1,x:100,y:192,hp:5,st:'idle',t:0};var victim={kind:'plant1',x:200,y:192,hp:1,st:'idle',t:0};foes=[caster,victim];loot=[];
var body=foeBodyProfile(victim);bolts.length=0;bolts.push({x:body.x,y:body.y,vx:0,vy:0,sp:0,t:0,life:1,dmg:2,art:'fire',dir:'d',foeShot:true,sourceFoe:caster});stepBolts(.05)`);
 assert.equal(run('victim.st'),'dead');assert.equal(run('loot.length'),1);run('stepBolts(.05)');assert.equal(run('loot.length'),1);
 reset();run(`var caster={kind:'boneguard',ally:1,x:160,y:192,hx:160,hy:192,hp:5,st:'swing',t:FOE.boneguard.hitAt,hit:0,hold:0};var victim={kind:'plant1',x:174,y:192,hx:174,hy:192,hp:1,st:'idle',t:0};foes=[caster,victim];loot=[];turnHolder=caster;turnT=10;stepFoes(.01)`);
 assert.equal(run('victim.st'),'dead');assert.equal(run('loot.length'),1);
});
await test(6,'Cached enemy targets are discarded when resurrected as allies',()=>{
 reset();run(`var spirit={kind:'wraith',ally:1,x:128,y:192,hp:8,st:'idle',t:0};var victim={kind:'plant1',x:150,y:192,hp:1,st:'idle',t:0};foes=[spirit,victim];targetFor(spirit);victim.st='dead';victim.hp=0;stones=1;useStone()`);
 assert(run('victim.ally'));assert.equal(run('targetFor(spirit).foe===victim'),false);
});
await test(7,'Summons ignore passive story actors',()=>{
 reset();run(`var spirit={kind:'wraith',ally:1,x:128,y:192,hp:8,st:'idle',t:0};var knight={kind:'knight',storyPassive:true,x:145,y:192,hp:8,st:'idle',t:0};foes=[spirit,knight]`);
 assert.equal(run('targetFor(spirit).foe===knight'),false);
});
await test(8,'Changing rooms clears old projectiles and bell lures',()=>{
 reset();run(`bolts.push({x:128,y:192,t:0});bells=1;useBell();loadMap('house23')`);
 assert.equal(run('bolts.length'),0);assert.equal(run('bell'),null);
});
await test(9,'Loading another adventure resets accumulated charm combat counters',()=>{
 reset();run(`saveGame();brandCount=2;brandHot=true;wardCarry=.75;edgeCarry=.8;twinSpent=true;twinKills=3;loadGame(1)`);
 assert.deepEqual(json('[brandCount,brandHot,wardCarry,edgeCarry,twinSpent,twinKills]'),[0,false,0,0,false,0]);
});
await test(10,'Dunstan teaches the real Grave Marker recipe',()=>{
 reset();assert.equal(run('Crafting.recipe("mark").cost.mineral'),2);assert.match(run('Crafting.teachers.smith.line'),/Two (?:measures )?with a mushroom/i);
});
await test(11,'Cooking cannot consume ingredients beyond finished-food capacity',()=>{
 reset();run(`templeCompass.meatGiven=true;Crafting.restore({kit:true,learned:['nan'],ingredients:{herb:10},cooked:{cooked_boarMeat:9998}});boarMeat=5;Crafting.open()`);
 assert.equal(run('Crafting.maxBatch(Crafting.recipe("cooked_boarMeat"))'),1);assert.equal(run('Crafting.start("cooked_boarMeat",2)'),false);assert.equal(run('boarMeat'),5);
 assert(run('Crafting.start("cooked_boarMeat",1)'));run('Crafting.slide(1);Crafting.finish();for(var i=0;i<91;i++)Crafting.tick(.05)');assert.equal(run('Crafting.count("cooked_boarMeat")'),9999);
});
await test(12,'A full ingredient pouch does not consume a harvest patch',()=>{
 reset();run(`Crafting.restore({ingredients:{herb:9999}});MAPID='world';MD=W.maps.world;Crafting.inspect().nodes.splice(0);Crafting.inspect().nodes.push({id:'craft:intro:herb',material:'herb',amount:2,once:true,x:P.x,y:P.y})`);
 assert.equal(run('Crafting.gather()'),false);assert.equal(run('Crafting.capture().harvested["craft:intro:herb"]'),undefined);
 run('Crafting.inspect().ingredients.herb=9998');assert.equal(run('Crafting.gather()'),false,'A two-herb patch is never partly discarded');
 run('Crafting.inspect().ingredients.herb=9997');assert(run('Crafting.gather()'));assert.equal(run('Crafting.count("herb")'),9999);
});
await test(20,'Blocking a projectile triggers the Glass Shield impact animation',()=>{
 reset();run(`glassShield=true;glassShieldHeld=true;glassShieldWindowUntil=tAcc+1;glassGifStart=-99;
foes=[{kind:'mage1',x:P.x+50,y:P.y,st:'idle',hp:5}];bolts.length=0;bolts.push({x:P.x,y:P.y-8,vx:1,vy:0,sp:0,t:0,life:1,dmg:2,art:'fire',dir:'s'});stepBolts(.01)`);
 assert.equal(run('pHp'),6);assert.equal(run('glassGifStart'),run('tAcc'));
});
reset();run(`window.LDRCoopRender={enable(){}};var players=[{uid:'host',profile:{name:'Host'}},{uid:'guest',profile:{name:'Guest'}}];`);
await run(`LDRCampaign.start({uid:'host',players,onNotice:()=>{},onSave:()=>true})`);
function partyReset(){run(`scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;bagOpen=false;foes=[];arenaLock=null;arenaT=0;arenaGoing=false;bossScene=null;fadeDir=fade=0;P.act=null;hatchCamera=null;ride=null;flightTravel=null;Crafting.close();
MAPID='house22';MD={...W.maps.house22,templeExpanded:false,roomBlocks:[],roomActors:[],doors:[]};features=[];npcs=[];solid.fill(0);mounted=false;dragonOff=true;foesHeld=false;devSafe=false;deadShown=false;
for(var id of ['host','guest'])LDRCampaign.withActor(id,()=>{P.x=id==='host'?80:240;P.y=192;pHp=6;pInv=0;P.act=null;mounted=false;saintT=0;wakeCool=0;twinSpent=false;twinKills=0;});LDRCampaign.claim('host','action');`);}
await test(13,'Saint’s Breath protects only the rider who used it',()=>{
 partyReset();run(`breaths=1;LDRCampaign.withActor('host',()=>useSaint());LDRCampaign.withActor('guest',()=>hurtPlayer(1))`);
 assert.equal(run('LDRCampaign.actor("guest").vars.pHp'),5);run(`LDRCampaign.withActor('host',()=>hurtPlayer(1))`);assert.equal(run('LDRCampaign.actor("host").vars.pHp'),6);
 run(`drawWorld=()=>{};drawTempleCompass=()=>{};for(var id of ['host','guest'])LDRCampaign.withActor(id,()=>{saintT=16;wakeCool=24;P.act=null;});last=performance.now();for(var i=0;i<40;i++)LDRCampaign.mainFrame(last+50,false)`);
 for(const id of ['host','guest']){assert(Math.abs(run(`LDRCampaign.actor('${id}').vars.saintT`)-14)<1e-8);assert(Math.abs(run(`LDRCampaign.actor('${id}').vars.wakeCool`)-22)<1e-8);}
});
await test(14,'Book of the Dead cooldown and summon limit belong to each rider',()=>{
 partyReset();run(`charm.wake=true;LDRCampaign.withActor('host',()=>wakeTheDead())`);
 assert(run(`LDRCampaign.withActor('guest',()=>wakeTheDead())`));assert.equal(run('foes.filter(f=>f.ally).length'),4);
});
await test(15,'Summoned spirits keep following their summoner when the partner is closer',()=>{
 partyReset();run(`charm.wake=true;LDRCampaign.withActor('host',()=>wakeTheDead());var spirit=foes[0];spirit.x=240;spirit.y=192;var previous=LDRCampaign.beginEnemy(spirit);var followed=LDRCampaign.owner;LDRCampaign.endEnemy(previous)`);
 assert.equal(run('followed'),'host');
 run(`LDRCampaign.withActor('guest',()=>wakeTheDead());var otherSpirit=foes.find(f=>f.summoner==='guest');foeClock+=1;LDRCampaign.withActor('host',()=>spiritFollowTarget(spirit));LDRCampaign.withActor('guest',()=>spiritFollowTarget(otherSpirit))`);
 assert.notDeepEqual(json('spiritTrails.get("host").points'),json('spiritTrails.get("guest").points'),'Each summoner has an independent movement trail');
});
function arenaFinish(){run(`var ring={kind:'arena',id:987,x:8,y:12,r:6};features=[ring];arenaLock=ring;arenaT=.01;arenaGoing=true;stepArena(.05)`);}
await test(16,'Arena completion recharges both riders’ Twin Heart charms',()=>{
 partyReset();run(`for(var id of ['host','guest'])LDRCampaign.withActor(id,()=>{twinSpent=true;twinKills=2;})`);arenaFinish();
 assert.equal(run('LDRCampaign.actor("guest").vars.twinSpent'),false);assert.equal(run('LDRCampaign.actor("guest").vars.twinKills'),0);
});
await test(17,'Arena completion rescues both stranded dragons',()=>{
 partyReset();run(`MAPID='world';dragonOff=false;boarMeat=hareMeat=deerMeat=foxMeat=birdMeat=dragonFish=0;
for(var id of ['host','guest'])LDRCampaign.withActor(id,()=>{dragon.on=true;dragon.hp=0;dragon.down=true;dragon.revive=0;dragon.placed=MAPID;})`);arenaFinish();
 assert(run('LDRCampaign.actor("guest").dragon.hp>0'));assert(!run('LDRCampaign.actor("guest").dragon.down'));
});
await test(18,'Enemies collide with the other rider, not just their current target',()=>{
 partyReset();run(`var monster={kind:'plant1',x:220,y:192,hp:10,st:'walk'};foes=[monster]`);
 assert.equal(run('combatBodiesClear(monster,240,192)'),false);
 assert.equal(run('LDRCampaign.owner'),'host','Collision testing restores actor ownership');
 run(`LDRCampaign.withActor('guest',()=>{P.x=320;dragon.x=240;dragon.y=192;dragon.on=true;dragon.down=false;dragon.placed=MAPID;})`);
 assert.equal(run('combatBodiesClear(monster,240,192)'),false,'The other dragon also blocks enemies');
});
await test(19,'Automatic co-op saves do not occupy unresolved cloud-conflict slots',()=>{
 run(`EmberCloudState.activate('host');for(var slot=1;slot<=3;slot++)localStorage.removeItem(saveKey(slot));EmberCloudState.conflicts.set(1,{revision:'remote',deleted:false});
 var uid='host',cloudSlot=0,latestSave=null,campaignId='audit',owner=()=>EmberCloudState.owner,key=()=> 'ldr.coop.campaigns.'+owner(),localSaves=()=>JSON.parse(localStorage.getItem(key())||'[]'),notice=()=>{};`);
 const source=fs.readFileSync('js/coop-campaign.js','utf8');run(source.slice(source.indexOf('  function persist('),source.indexOf('  function checkpoint(')));
 assert(run(`persist({version:1,id:'audit',when:Date.now(),save:captureSave(),players:{}})`));assert.equal(run('readSaveSlot(1)'),null);assert.equal(run('cloudSlot'),2);
});
console.log(`${checks-failures}/${checks} audit regressions passed`);
if(failures)process.exitCode=1;
