import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const part2=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
let pendingScene=null,menu=null,saves=0,place=null;
const element=()=>({style:{},dataset:{},children:[],attributes:{},
 setAttribute(k,v){this.attributes[k]=v;},appendChild(el){this.children.push(el);},
 get textContent(){return this.children.length?this.children.map(el=>el.textContent||'').join(''):this.text||'';},
 set textContent(v){this.text=v;}});
const c=vm.createContext({
  gameplayStarted:true,MAPID:'world',MD:{},P:{x:872,y:6050,dir:'d',moving:true},MAD_DOOR:[872,5984],
  dragon:{on:true,x:850,y:6050,moving:true},hasDragon:()=>true,dragonHere:()=>c.MAPID==='world'||c.MAPID==='tp1',
  sceneHold:()=>!!pendingScene,hatchCamera:null,sayNpc:null,fadeDir:0,doorMotion:null,pendingDoor:null,editing:false,ovl:null,ride:false,arenaLock:null,
  faceCorinAt(){},playScene:(lines,options)=>{pendingScene={lines,...options};},setOvl:m=>{menu=m;},saveGame:()=>saves++,
  inFight:()=>false,wonAll:false,cinderSeal:false,brambleQuest:0,mode:'play',ask:null,bagOpen:false,atlasOpen:false,fishing:null,deadShown:false,foes:[],
  areaUnder:()=>place,document:{getElementById:()=>({appendChild(){}}),createElement:element,body:{appendChild(){}}}
});
const run=s=>vm.runInContext(s,c);
run(part2.slice(part2.indexOf('const DRAGON_NAME ='),part2.indexOf('function finishHatchScene()')));
run(read('js/dragon-dialogue.js'));
const tick=(dt=.05)=>run(`stepDragonBanter(${dt})`);
const clear=()=>{run('resetDragonBanter();dragonBanterGap=0');pendingScene=null;place=null;c.foes=[];};
const active=()=>run('dragonBanterActive');
// No dragon speech before the introduction. Walking away in any direction
// starts it, including pending introductions restored away from Maddock's house.
place='Millwood';tick();assert.equal(active(),null);
assert.equal(run('stepDragonIntroduction()'),false);
for(const [dir,dx,dy] of [['u',0,-96],['d',0,96],['s',96,0],['s',-96,0]]){
 run('dragonIntroDone=false;dragon.introOrigin=[P.x,P.y]');
 c.P.dir=dir;c.P.x+=dx;c.P.y+=dy;
 c.hatchCamera={};assert.equal(run('stepDragonIntroduction()'),false);c.hatchCamera=null;
 c.P.moving=false;assert.equal(run('stepDragonIntroduction()'),false);c.P.moving=true;
 assert.equal(run('stepDragonIntroduction()'),true,'Introduction works with displacement '+dx+','+dy);
 assert.match(pendingScene.lines[0],/voice.*inside your head/);
 assert(pendingScene.lines[1].startsWith('Aurelius:'));
 assert.equal(pendingScene.lines.filter(line=>/voice.*inside your head/.test(line)).length,1);
 assert(pendingScene.lines.join(' ').includes('share a consciousness'));
 assert(pendingScene.lines.some(line=>line.includes('COMMAND')));
 assert(!pendingScene.lines.some(line=>line.includes('Back to Millwood')),'Dialogue does not assume a route');
 pendingScene.after();pendingScene=null;assert.equal(menu,'airm');
 assert.equal(run('stepDragonIntroduction()'),false,'Introduction only happens once');
}
assert.equal(saves,4);
run('dragonIntroDone=false;dragon.introOrigin=null');c.P.x=3000;c.P.y=4000;
assert.equal(run('stepDragonIntroduction()'),false);c.P.y-=95;
assert.equal(run('stepDragonIntroduction()'),false);c.P.y--;
assert.equal(run('stepDragonIntroduction()'),true,'Older pending save introduces Aurelius after walking a short distance');
pendingScene.after();pendingScene=null;c.P.x=872;c.P.y=6130;
// First visits, a timed dismissal and the actual action-button dismissal hook.
clear();place='Millwood–Thornwell Road';tick();assert.equal(active(),null,'roads do not count as town visits');
place='Thornwell';const movement=JSON.stringify(c.P);tick();assert.match(active().key,/place:Thornwell/);
assert.equal(JSON.stringify(c.P),movement,'banter does not alter player movement');
assert.equal(run('dragonBanterPanel.speaker'),'Aurelius');assert.equal(run('dragonBanterPanel.children.length'),2);
assert.doesNotMatch(run('dragonBanterPanel.textContent'),/Corin:|mind/);
tick(5.1);assert.equal(run('dragonBanterPanel.speaker'),'Corin');
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
 dragonDoorExchange:()=>{d.handoff=(d.handoff||0)+1;},doorExitDirection:d=>d.dir,doorRect:()=>({x:32,y:32,w:16,h:16}),playScene:(lines,options)=>{pendingScene={lines,...options};},pendingDoor:null
});
const doors=s=>vm.runInContext(s,d);pendingScene=null;
doors(part3.slice(part3.indexOf('function useDoors('),part3.indexOf('function drawArena(')));
doors('useDoors(0)');assert.equal(pendingScene,null);assert.equal(d.handoff,1);
assert.equal(d.doorMotion.d,door,'entry starts without a dialogue pause');
doors('useDoors(0)');assert.equal(d.handoff,1,'one handoff per doorway');
d.doorMotion=null;d.P.moving=true;door.to='tp1';doors('useDoors(0)');
assert.equal(d.handoff,1);assert.equal(d.pendingDoor,door,'allowed interiors enter normally');
console.log('PASS: doorway exchange is nonblocking and fires only once while entry proceeds.');
// Direct A interactions use a blocking topic menu and return there after long talks.
clear();c.MAPID='world';c.P.x=872;c.P.y=6130;c.dragon.down=false;c.dragon.air=false;
Object.assign(c,{mounted:false,inFight:()=>false,heartKnown:false,fishingPole:false,smithUpgrade:false,glassShield:false,trialSealPlaced:false,
 breathHas:{fire:true,lightning:false,shadow:false,ice:false},charm:{},W:{maps:{world:{npcs:[{n:'Wren',charm:'twin'}]}}},askPick:0,askDraw(){},askShut:()=>{c.ask=null;}});
c.sceneHold=()=>!!pendingScene||!!c.ask?.dragonConversation;
// Use the actual menu selection controller, not a duplicate of it.
run(part3.slice(part3.indexOf('function askTake()'),part3.indexOf('function askTake()')+part3.slice(part3.indexOf('function askTake()')).indexOf('\nfunction ')));
for(const [dx,dy]of [[30,0],[-30,0],[0,30],[0,-30]]){
 c.dragon.x=c.P.x+dx;c.dragon.y=c.P.y+dy;
 c.P.dir=dx?'s':dy>0?'d':'u';c.P.flip=dx<0;
 assert.equal(run('tryDragonConversation()'),true,'A works on every side of the dragon');
 assert.equal(c.P.moving,false);assert.equal(c.ask.dragonConversation,true);c.askShut();
}
c.dragon.x=c.P.x+100;assert.equal(run('tryDragonConversation()'),false,'must approach');c.dragon.x=c.P.x+30;c.dragon.y=c.P.y;c.P.dir='s';c.P.flip=false;
run('tryDragonConversation()');run("askPick=ask.opts.findIndex(o=>o.n==='Dragons and our bond');askTake()");assert(c.ask.opts.some(o=>o.n==='The shared dragon consciousness'));
run('askTake()');assert(pendingScene.lines.length>=8);assert.equal(c.ask,null);
assert(pendingScene.lines.every(line=>/^(Corin|Aurelius):/.test(line)));
const long=pendingScene;pendingScene=null;long.after();assert(c.ask.opts.some(o=>o.n==='The heartstones'),'returns to its topic menu');
c.askShut();
const lock=vm.createContext({scene:null,revealing:false,hatchExit:false,bossScene:null,ask:{dragonConversation:true}});
vm.runInContext(part2.match(/function sceneHold\(\) \{[^\n]+/)[0],lock);
assert.equal(vm.runInContext('sceneHold()',lock),true,'topic menu pauses normal gameplay');
// Leads unlock from conversations and progress, never from undiscovered NPC data.
c.wonAll=false;c.brambleQuest=0;run('resetDragonBanter()');
assert.deepEqual(Array.from(run('dragonSideQuestTopics().map(t=>t.id)')),[]);
assert.doesNotMatch(run("dragonCurrentQuest().join(' ')"),/Dunstan|Sela|Sandspire|Hollybeck/);
for(const key of ['fishing','bramble','equipment','gifts'])assert.match(run("dragonSideQuest('"+key+"').join(' ')"),/No new leads yet/);
c.odoRodReferral=true;
assert.match(run("dragonSideQuest('fishing').join(' ')"),/grandson Calder/);
c.fishingPole=true;assert.match(run("dragonSideQuest('fishing').join(' ')"),/Calder gave you/);
c.brambleQuest=1;
assert.doesNotMatch(run("dragonSideQuest('bramble').join(' ')"),/Rowan|tavern/);
run("rememberDragonKnowledge('Aurelius','Rowan is in the tavern.')");
assert.doesNotMatch(run("dragonSideQuest('bramble').join(' ')"),/Rowan|tavern/,'Aurelius cannot invent a lead');
c.MAPID='tavern';run("rememberDragonKnowledge('Local','Bramble belongs to Rowan. He is in the tavern.')");
assert.match(run("dragonSideQuest('bramble').join(' ')"),/Rowan.*tavern/);
c.brambleQuest=3;assert.match(run("dragonSideQuest('bramble').join(' ')"),/visit them outside/);
assert.doesNotMatch(run("dragonSideQuest('gifts').join(' ')"),/Wren/);
run("rememberDragonKnowledge('Wren','I have a charm that could help you.')");
assert.match(run("dragonSideQuest('gifts').join(' ')"),/Wren/);
c.charm.twin=true;assert.doesNotMatch(run("dragonSideQuest('gifts').join(' ')"),/Wren/);
run("rememberDragonKnowledge('Maddock','Dunstan the blacksmith can strengthen your blade.')");
assert.match(run("dragonSideQuest('equipment').join(' ')"),/Dunstan/);
assert.doesNotMatch(run("dragonSideQuest('equipment').join(' ')"),/Sela/);
run("rememberDragonKnowledge('Sela','My glass can protect you with a shield.')");
assert.match(run("dragonSideQuest('equipment').join(' ')"),/Sela/);
c.learned=run('[...dragonBanterSeen]');run('resetDragonBanter(learned)');
assert(run("dragonLearned('bramble-owner')&&dragonLearned('smith')&&dragonLearned('shield')"),'learned leads survive saves');
run("resetDragonBanter(['heard:Wren:line:i have a charm','heard:Local:line:rowan is in the tavern'])");
assert(run("dragonLearned('gift:Wren')&&dragonLearned('bramble-owner')"),'migrate actual conversations from older saves');
c.MAPID='world';
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
assert.match(read('css/game.css'),/#dragonBanter[\s\S]*position:absolute;bottom:8px/);
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
c.P.dir='s';c.P.flip=false;c.dragon.x=c.P.x+30;c.dragon.y=c.P.y;
assert.equal(run('tryDragonConversation()'),true,'Skip makes direct conversations available immediately');c.askShut();
place='Millwood';tick();assert(active(),'Skip also enables travel thoughts');
console.log('PASS: actual Skip grants and saves Aurelius dialogue; direct conversations and travel thoughts work without replaying the introduction.');

// Journey topics unlock from saved visits and real quest rewards, with no future spoilers.
clear();c.wonAll=false;c.cinderSeal=false;c.trialSealPlaced=false;c.brambleQuest=0;
c.heartKnown=false;c.breathHas={fire:true};c.charm={};c.MAPID='world';
const topicIds=()=>Array.from(run('dragonJourneyTopics().map(t=>t.id)'));
assert.deepEqual(topicIds(),['home','monsters']);
place='Sandspire';run('rememberDragonConversationPlace()');place='Millwood';
assert(topicIds().includes('sandspire'));assert(!topicIds().includes('coralmere'));
const visits=run('[...dragonBanterSeen]');c.visits=visits;run('resetDragonBanter(visits)');
assert(topicIds().includes('sandspire'),'visited topics survive restoring save history');
run("resetDragonBanter(['place:Thornwell:journey'])");
assert(topicIds().includes('thornwell'),'existing saves inherit their known places');
c.heartKnown=true;c.breathHas.lightning=true;c.breathHas.ice=true;c.breathHas.shadow=true;
c.brambleQuest=2;c.charm.ward=true;
for(const id of ['alderic','lightning','ice','shadow','bramble','ward'])assert(topicIds().includes(id),id);
c.MAPID='royal_hall';assert(topicIds().includes('cinderhold'));
c.wonAll=true;assert(!topicIds().includes('cinderhold'));assert(!topicIds().includes('home'));
assert(topicIds().includes('future'));assert(!topicIds().includes('trials'));
c.cinderSeal=true;assert(topicIds().includes('trials'));
assert.doesNotMatch(run("DRAGON_LONG_TALKS.travelling.join(' ')"),/interiors|doorway|Cinderhold|temples/);
// Every authored journey exchange is valid and has its own wording.
const written=new Set();
for(const t of run('DRAGON_JOURNEY_TOPICS'))for(const line of t.lines()){
 assert.match(line,/^(Corin|Aurelius): /);assert(!written.has(line),'Repeated line: '+line);written.add(line);
}
c.MAPID='world';c.ask=null;pendingScene=null;run("openDragonConversation('journey')");
const choice=c.ask.opts.find(o=>o.n==='What we want after all this');assert(choice);choice.go();
assert(pendingScene.lines.some(line=>line.includes('watching a beetle')));
const returnFromTalk=pendingScene.after;pendingScene=null;returnFromTalk();
assert(c.ask.opts.some(o=>o.n==='What we want after all this'));
console.log('PASS: journey topics unlock from visits, saved history, heartstones, quests and victory; dialogue returns to its topic menu.');

// Facing and combat gates prevent a following dragon from stealing attack input.
c.ask=null;pendingScene=null;c.MAPID='world';c.P={x:100,y:100,dir:'d',moving:true};
c.dragon={on:true,x:100,y:70};c.foes=[];c.arenaLock=null;
assert.equal(run('tryDragonConversation()'),false,'following behind while walking');
c.P.dir='u';assert.equal(run('tryDragonConversation()'),true,'deliberately face the nearby dragon');c.askShut();
c.dragon.y=60;assert.equal(run('tryDragonConversation()'),false,'outside close range');c.dragon.y=70;
for(const [key,value]of [['arenaLock',{}],['arenaT',1],['bossScene',{}],['trial',{}]]){
 c[key]=value;assert.equal(run('tryDragonConversation()'),false,key+' blocks talking');c[key]=null;
}
c.inFight=()=>true;assert.equal(run('tryDragonConversation()'),false,'nearby fight');c.inFight=()=>false;
c.foes=[{hp:10,st:'wind',x:800,y:800}];assert.equal(run('tryDragonConversation()'),false,'active distant attack');c.foes=[];
c.P.act={kind:'swing'};assert.equal(run('tryDragonConversation()'),false,'attack animation');c.P.act=null;
run('dragonDoorExchange()');assert.equal(active().handoff,true);assert.equal(run('dragonBanterPanel.speaker'),'Corin');
c.MAPID='tavern';c.fadeDir=1;tick(3.2);assert.equal(run('dragonBanterPanel.speaker'),'Aurelius');
assert.equal(run('dragonBanterPanel.hidden'),false,'telepathy survives crossing into an interior');
assert.equal(pendingScene,null,'handoff never opens a scene');tick(5);assert.equal(active(),null);c.fadeDir=0;
const replies=new Set();for(let i=0;i<12;i++){run('dragonDoorExchange()');replies.add(active().lines[1]);}
assert.equal(replies.size,12);
assert.equal(run('DRAGON_GENERAL_TOPICS.history.length+DRAGON_GENERAL_TOPICS.personal.length'),12);
console.log('PASS: facing, short range, combat locks, 12 general topics, and 12 nonblocking doorway replies.');
// A road mentioning a town is not a visit, including history from older builds.
clear();c.MAPID='world';c.wonAll=false;place='Millwood–Thornwell Road';
run("resetDragonBanter(['visited:Millwood–Thornwell Road','visited:Thornwell–Forgewick Road'])");
assert(!topicIds().includes('thornwell'));assert(!topicIds().includes('forgewick'));
c.TS=16;c.features=[{kind:'area',label:'Thornwell',x0:100,y0:100,x1:120,y1:120}];
c.P={x:99*16,y:110*16+1};place='Thornwell';
run('rememberDragonConversationPlace()');assert(!topicIds().includes('thornwell'),'nearby label cannot substitute for entering town');
c.P.x=100*16;run('rememberDragonConversationPlace()');assert(topicIds().includes('thornwell'),'actual boundary unlocks town');
c.P.x=99*16;assert(topicIds().includes('thornwell'),'a real visit remains known after leaving');
run("resetDragonBanter(['visited:Hollybeck Graveyard','visited:Forgewick Temple','visited:Cinderhold Castle'])");
assert(!topicIds().includes('hollybeck'));assert(!topicIds().includes('forgewick'));assert(!topicIds().includes('cinderhold'));
console.log('PASS: exact town boundaries, persistent real visits, and rejection of road, temple and graveyard false visits.');
