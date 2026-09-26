import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const part2=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
let pendingScene=null,menu=null,saves=0,place=null;
const c=vm.createContext({
  gameplayStarted:true,MAPID:'world',MD:{},P:{x:872,y:6050,dir:'d',moving:true},MAD_DOOR:[872,5984],
  dragon:{on:true,x:850,y:6050,moving:true},hasDragon:()=>true,dragonHere:()=>c.MAPID==='world'||c.MAPID==='tp1',
  sceneHold:()=>!!pendingScene,hatchCamera:null,sayNpc:null,fadeDir:0,doorMotion:null,pendingDoor:null,editing:false,ovl:null,ride:false,arenaLock:null,
  faceCorinAt(){},playScene:(lines,options)=>{pendingScene={lines,...options};},setOvl:m=>{menu=m;},saveGame:()=>saves++,
  wonAll:false,cinderSeal:false,brambleQuest:0,mode:'play',ask:null,bagOpen:false,atlasOpen:false,fishing:null,deadShown:false,foes:[],
  areaUnder:()=>place,document:{getElementById:()=>({appendChild(){}}),createElement:()=>({style:{},setAttribute(){}}),body:{appendChild(){}}}
});
const run=s=>vm.runInContext(s,c);
run(part2.slice(part2.indexOf('const DRAGON_NAME ='),part2.indexOf('function finishHatchScene()')));
run(read('js/dragon-dialogue.js'));
const tick=(dt=.05)=>run(`stepDragonBanter(${dt})`);
const clear=()=>{run('resetDragonBanter();dragonBanterGap=0');pendingScene=null;place=null;c.foes=[];};
const active=()=>run('dragonBanterActive');
// No dragon speech before the introduction. It starts only on the southbound road.
place='Millwood';tick();assert.equal(active(),null);
assert.equal(run('stepDragonIntroduction()'),false);
c.P.y=6130;c.hatchCamera={};assert.equal(run('stepDragonIntroduction()'),false);c.hatchCamera=null;
c.P.dir='u';assert.equal(run('stepDragonIntroduction()'),false);c.P.dir='d';
assert.equal(run('stepDragonIntroduction()'),true);
assert.match(pendingScene.lines[0],/voice.*inside your head/);
assert(pendingScene.lines[1].startsWith('Aurelius:'));
assert.equal(pendingScene.lines.filter(line=>/voice.*inside your head/.test(line)).length,1);
assert(pendingScene.lines.join(' ').includes('share a consciousness'));
assert(pendingScene.lines.some(line=>line.includes('COMMAND')));
pendingScene.after();pendingScene=null;assert.equal(menu,'airm');assert.equal(saves,1);
assert.equal(run('stepDragonIntroduction()'),false);
// First visits, a timed dismissal and the actual action-button dismissal hook.
clear();place='Millwood–Thornwell Road';tick();assert.equal(active(),null,'roads do not count as town visits');
place='Thornwell';const movement=JSON.stringify(c.P);tick();assert.match(active().key,/place:Thornwell/);
assert.equal(JSON.stringify(c.P),movement,'banter does not alter player movement');
assert.match(run('dragonBanterPanel.textContent'),/^Aurelius:/);
assert.doesNotMatch(run('dragonBanterPanel.textContent'),/Corin:|mind/);
tick(5.1);assert.match(run('dragonBanterPanel.textContent'),/^Corin:/);
const dismissHook=part2.match(/if\(!sceneHold\(\)&&typeof dismissDragonBanter[^\n]+/)[0];
run('(function(){'+dismissHook+'})()');assert.equal(active(),null);
tick(19);assert.equal(active(),null,'same town does not repeat');
place='Forgewick';tick();assert(active());tick(12);assert.equal(active(),null,'times out without input');
// Hiding on atlas/fishing and leaving allowed maps must also clear stale lines.
clear();place='Millwood';tick();c.atlasOpen=true;tick();assert.equal(run('dragonBanterPanel.hidden'),true);c.atlasOpen=false;
c.fishing={};tick();assert.equal(run('dragonBanterPanel.hidden'),true);c.fishing=null;
c.MAPID='tavern';tick();assert.equal(active(),null);assert.equal(run('dragonBanterPanel.hidden'),true);
// NPC reactions are outdoors only, including exclusion inside temples where he is present.
clear();for(const map of ['tavern','school','tp1']){c.MAPID=map;run("dragonConversationReaction({n:'Odo',said:['Take this fishing pole.']})");assert.equal(run('dragonBanterQueue.length'),0,map);}
c.MAPID='world';run("dragonConversationReaction({n:'Odo',said:['Take this fishing pole.']})");tick();assert.match(active().key,/fishing/);
clear();c.brambleQuest=3;run("dragonConversationReaction({n:'Rowan the Hunter',said:['Bramble is home again.']})");tick();assert.match(active().key,/reunion/);
// Use the spoken dialogue and current story stage, discarding pre-victory assumptions.
clear();run("dragonConversationReaction({n:'Orin',said:['Halvard demands another levy.']})");tick();assert.match(active().lines[0],/Fear/);
c.wonAll=true;tick();assert(!active()||active().stage==='victory');
clear();run("dragonConversationReaction({n:'Orin',said:['The king is defeated. We are free.']})");tick();assert.match(active().key,/victory:freedom/);
assert.doesNotMatch(active().lines.join(' '),/demands|live like this/);
// New enemy types and boss outcomes, with no stale facing warning after a kill.
c.wonAll=false;clear();c.foes=[{kind:'mage1',x:872,y:6140,hp:9,st:'idle'}];tick();assert.equal(active().key,'enemy:mage1');
run('dismissDragonBanter()');tick(19);assert.equal(active(),null);
clear();run("dragonBossBanter({kind:'golem1',idx:4})");run("dragonBossBanter({kind:'golem1',idx:4},true)");tick();assert.match(active().key,/^victory:/);
const seen=run('[...dragonBanterSeen]');clear();c.restored=seen;run('resetDragonBanter(restored)');run("dragonBossBanter({kind:'golem1',idx:4},true)");tick(19);assert.equal(active(),null,'saved events do not repeat');
// Every current combat type has authored dialogue.
const foeScope=vm.createContext({});
vm.runInContext(part2.slice(part2.indexOf('const FOE = {'),part2.indexOf('const ROUTE_2_HP_START_X')),foeScope);
for(const kind of vm.runInContext('Object.keys(FOE)',foeScope)){c.kind=kind;assert(run('DRAGON_ENEMY_LINES[kind]||DRAGON_BOSS_LINES[kind]'),kind+' has an authored exchange');}
console.log('PASS: Aurelius introduction, riding tutorial, outdoor NPC reactions, story context, every enemy type, boss outcomes, nonblocking banter, dismissal and restored event history.');
// Exercise the door handoff itself: one Corin line, then the normal entry animation.
const door={to:'tavern',dir:'u'},d=vm.createContext({
 W:{maps:{tavern:{},tp1:{}}},MD:{doors:[door]},MAPID:'world',P:{x:40,y:52,dir:'u',moving:true},TS:16,
 bossScene:null,foesHeld:false,doorMotion:null,fadeDir:0,arriveT:0,sayNpc:null,arenaLock:null,arenaT:0,foes:[],dragon:{on:true},
 dragonHere:()=>true,dragonAllowedInMap:id=>id==='tp1',sceneHold:()=>!!pendingScene,
 doorExitDirection:d=>d.dir,doorRect:()=>({x:32,y:32,w:16,h:16}),playScene:(lines,options)=>{pendingScene={lines,...options};},pendingDoor:null
});
const doors=s=>vm.runInContext(s,d);pendingScene=null;
doors(part3.slice(part3.indexOf('function useDoors('),part3.indexOf('function drawArena(')));
doors('useDoors(0)');assert.equal(pendingScene.lines[0],"Corin: Wait here, I'll be right back.");assert.equal(d.doorMotion,null);
const first=pendingScene;doors('useDoors(0)');assert.equal(pendingScene,first,'does not repeatedly open the line');
first.after();pendingScene=null;assert.equal(d.doorMotion.d,door);
d.doorMotion=null;d.P.moving=true;door.to='tp1';doors('useDoors(0)');assert.equal(pendingScene,null);assert.equal(d.pendingDoor,door,'allowed interiors have no wait line');
console.log('PASS: Corin waits for dismissal before entering a house or tavern; permitted interiors keep normal entry.');
// Direct A interactions use a blocking topic menu and return there after long talks.
clear();c.MAPID='world';c.P.x=872;c.P.y=6130;c.dragon.down=false;c.dragon.air=false;
Object.assign(c,{mounted:false,inFight:()=>false,heartKnown:false,fishingPole:false,smithUpgrade:false,glassShield:false,trialSealPlaced:false,
 breathHas:{fire:true,lightning:false,shadow:false,ice:false},charm:{},W:{maps:{world:{npcs:[{n:'Wren',charm:'twin'}]}}},askPick:0,askDraw(){},askShut:()=>{c.ask=null;}});
c.sceneHold=()=>!!pendingScene||!!c.ask?.dragonConversation;
// Use the actual menu selection controller, not a duplicate of it.
run(part3.slice(part3.indexOf('function askTake()'),part3.indexOf('function askTake()')+part3.slice(part3.indexOf('function askTake()')).indexOf('\nfunction ')));
for(const [dx,dy]of [[40,0],[-40,0],[0,40],[0,-40]]){
 c.dragon.x=c.P.x+dx;c.dragon.y=c.P.y+dy;
 assert.equal(run('tryDragonConversation()'),true,'A works on every side of the dragon');
 assert.equal(c.P.moving,false);assert.equal(c.ask.dragonConversation,true);c.askShut();
}
c.dragon.x=c.P.x+100;assert.equal(run('tryDragonConversation()'),false,'must approach');c.dragon.x=c.P.x+30;
run('tryDragonConversation()');run('askTake()');assert(c.ask.opts.some(o=>o.n==='The shared dragon consciousness'));
run('askTake()');assert(pendingScene.lines.length>=8);assert.equal(c.ask,null);
assert(pendingScene.lines.every(line=>/^(Corin|Aurelius):/.test(line)));
const long=pendingScene;pendingScene=null;long.after();assert(c.ask.opts.some(o=>o.n==='The heartstones'),'returns to its topic menu');
c.askShut();
const lock=vm.createContext({scene:null,revealing:false,hatchExit:false,bossScene:null,ask:{dragonConversation:true}});
vm.runInContext(part2.match(/function sceneHold\(\) \{[^\n]+/)[0],lock);
assert.equal(vm.runInContext('sceneHold()',lock),true,'topic menu pauses normal gameplay');
// Clues match completion flags and do not send players after gifts they already have.
c.wonAll=false;assert.match(run("dragonSideQuest('fishing').join(' ')"),/speak to him there/i);
c.fishingPole=true;assert.match(run("dragonSideQuest('fishing').join(' ')"),/already given/);
c.brambleQuest=1;assert.match(run("dragonSideQuest('bramble').join(' ')"),/tavern/);
c.brambleQuest=3;assert.match(run("dragonSideQuest('bramble').join(' ')"),/visit them outside/);
assert.match(run("dragonSideQuest('gifts').join(' ')"),/Wren/);c.charm.twin=true;assert.doesNotMatch(run("dragonSideQuest('gifts').join(' ')"),/Wren/);
c.breathHas.lightning=true;c.breathHas.shadow=true;c.breathHas.ice=true;
assert.match(run("dragonCurrentQuest().join(' ')"),/all with us now/);
c.wonAll=true;assert.match(run("dragonCurrentQuest().join(' ')"),/Halvard is defeated/);
c.cinderSeal=true;c.trialSealPlaced=true;assert.match(run("dragonCurrentQuest().join(' ')"),/seal is placed/);
console.log('PASS: Direct conversations from all sides, blocking menus, lengthy exchanges, return navigation and progress-aware quest clues.');
// Ambient remarks are concise, unique by wording, and occasional after NPCs.
c.wonAll=false;c.cinderSeal=false;c.ask=null;c.MAPID='world';clear();
for(const table of ['DRAGON_PLACE_LINES','DRAGON_POST_PLACE_LINES','DRAGON_ENEMY_LINES','DRAGON_BOSS_LINES','DRAGON_BOSS_DEFEAT_LINES','DRAGON_NPC_THOUGHTS','DRAGON_REACTION_LINES']){
 for(const pair of run('Object.values('+table+')'))for(const line of pair)assert(line.length<=64,table+': '+line);
}
run("queueDragonBanter('one',['A short thought.','A short reply.'])");tick();
assert.equal(run("queueDragonBanter('another-event',['A short thought.','A new reply.'])"),false,'same wording never repeats under a new event ID');
assert.equal(run("queueDragonBanter('another-reply',['A different thought.','A short reply.'])"),false,'Corin does not repeat his reply either');
assert.match(run('dragonBanterPanel.style.cssText'),/position:absolute;bottom:8px/);
assert.doesNotMatch(run('dragonBanterPanel.textContent'),/\n|mind/,'one speaker at a time without a mind suffix');
clear();run("dragonBossBanter({kind:'golem1',idx:1})");tick();run('dismissDragonBanter()');
c.MAPID='tp1';run("dragonBossBanter({kind:'golem1',idx:99})");tick(19);assert.equal(active(),null,'another guardian of the same kind does not repeat its line');
c.MAPID='world';clear();run("dragonConversationReaction({n:'Odo',said:['This weather suits me.']})");tick();run('dismissDragonBanter()');
run("dragonConversationReaction({n:'Wren',said:['Have a restful day.']})");assert.equal(run('dragonBanterQueue.length'),0,'nearby conversations do not create a stream of remarks');
tick(100);run("dragonConversationReaction({n:'Wren',said:['Have a restful day.']})");assert.equal(run('dragonBanterQueue.length'),0,'a conversation heard during cooldown stays remembered');
run("dragonConversationReaction({n:'Odo',said:['Different weather today.']})");assert.equal(run('dragonBanterQueue.length'),0,'one reaction per NPC per story stage');
clear();run("resetDragonBanter(['npc:Orin:journey:king','boss:world:golem2:4'])");tick(100);
run("dragonConversationReaction({n:'Another villager',said:['The king takes another levy.']})");assert.equal(run('dragonBanterQueue.length'),0,'older save histories suppress the same topic from another NPC');
run("dragonBossBanter({kind:'golem2',idx:42})");assert.equal(run('dragonBanterQueue.length'),0,'old boss IDs migrate to a unique type');
// History is persisted immediately without autosaving the player's position or quest.
clear();const disk=new Map();disk.set('test.slot.2',JSON.stringify({dragonIntroDone:true,quest:8,x:100,y:200}));
Object.assign(c,{activeSaveSlot:2,saveKey:slot=>'test.slot.'+slot,localStorage:{getItem:k=>disk.get(k)||null,setItem:(k,v)=>disk.set(k,v)}});
run("queueDragonBanter('persistent',['A thought worth remembering.','I will remember it.'])");tick();
const stored=JSON.parse(disk.get('test.slot.2'));assert.equal(stored.x,100);assert.equal(stored.quest,8);assert(stored.dragonBanterSeen.includes('persistent'));
c.restoreHistory=stored.dragonBanterSeen;clear();run('resetDragonBanter(restoreHistory)');run("queueDragonBanter('new-id',['A thought worth remembering.','A different answer.'])");tick(20);assert.equal(active(),null,'reloading does not repeat a shown remark');
console.log('PASS: short bottom captions, unique wording across events and saves, NPC cooldowns and old-history migration.');
// The actual Skip button grants dialogue immediately, without the hatch introduction.
clear();c.ask=null;c.MAPID='world';c.wonAll=false;c.cinderSeal=false;c.P={x:872,y:6130,moving:false};c.dragon={on:false};
c.document.getElementById=()=>({style:{},appendChild(){}});
Object.assign(c,{tap:(el,fn)=>{c.pressSkip=fn;},skipBrambleForTest(){},Q:{DONE:9},kingsMen:()=>[],WORN_MAX:2,worn:{},
 dragonGround:()=>true,charm:{},breathHas:{fire:true},syncDragonVitality(){c.dragon.maxHp=5;},potions:0,elixirs:0,boarMeat:0,dragonFish:0,bombs:0,dust:0,bells:0,marks:0,breaths:0,stones:0,salts:0,gold:0,
 BESTIARY:[],seenFoe:{},seenCount:0,rebuildBuckets(){},reindex(){},chunks:new Map(),toast(){},saveGame(){c.savedSkipIntro=run('dragonIntroDone');}});
run('dragonIntroDone=false;dragonIntroArmed=true');
run(part3.slice(part3.indexOf('tap(document.getElementById("bSkip")'),part3.indexOf('let bothHeldSince')));
c.pressSkip();assert.equal(run('dragonIntroDone'),true);assert.equal(run('dragonIntroArmed'),false);assert.equal(c.savedSkipIntro,true);
assert.equal(run('tryDragonConversation()'),true,'Skip makes direct conversations available immediately');c.askShut();
place='Millwood';tick();assert(active(),'Skip also enables travel thoughts');
console.log('PASS: actual Skip grants and saves Aurelius dialogue; direct conversations and travel thoughts work without replaying the introduction.');
