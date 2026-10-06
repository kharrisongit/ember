import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:true});
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
dom.element('bagAsk').append(dom.element('askRows'));
await run('loadPublishedEditorLayouts()');
run(`for(const [id,m]of Object.entries(W.maps)){prepareEditorEntities(m,id);prepareMarketNpcCast(m,id);applyPublishedEditorLayout(m,id);prepareMarketNpcRoles(m,id);preparePlacedNpcDialogue(m);prepareDialoguePortraitCast(m,id);prepareHollybeckVillagers(m,id);prepareRegionalVillagers(m,id);prepareShroomLookoutData(m,id);}HollybeckRescue.installWorld(W.maps.world);npcs=[];prepareJourneyGates();`);
const placed=json(`Object.values(W.maps).flatMap(m=>(m.npcs||[])).concat(npcs).filter(n=>!n.noTalk&&!n.pettable&&!n.editorDeleted&&!n.publishedDeleted).map(n=>({n:n.n,packSpr:n.packSpr,chapelArt:n.chapelArt}))`);
for(const actor of placed){c.actor=actor;assert(run('DialogueRenewal.church(actor)||!!DialogueRenewal.profile(actor)'),actor.n+' needs a complete conversation');}
const reset=()=>run(`EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;revealing=null;wonAll=false;MAPID='world';MD=W.maps.world;MW=MD.w;MH=MD.h;terr=new Uint8Array(MW*MH);mode='play';gameplayStarted=true;quest=Q.DONE;dragon.on=true;dragonOff=false;dragonIntroDone=true;dragon.x=12000;dragon.y=3300;mounted=false;templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;fishingPole=true;charm.twin=true;smithUpgrade=true;charm.edge=true;glassShield=false;brambleQuest=3;thornwellRoyal.stage=7;P.x=12000;P.y=3320;P.act=null;faceToward=()=>{};dragonConversationReaction=()=>{};saveGame=()=>{};discussedTopics.clear();dragonBanterSeen.clear();breathHas.lightning=false;breathHas.ice=false;breathHas.shadow=false;EmberFriendship.restore({tutorialSeen:true});DragonChapels.restore(false);EmberRiding.skip();EmberEquipmentTutorial.skip();`);
reset();
const names=json('Object.keys(DialogueRenewal.cast)');assert.equal(names.length,174);
const openings=new Set(),greetings=new Set();let exchanges=0;
for(const name of names){
 reset();c.actor={n:name,x:12000,y:3300};
 const data=json('DialogueRenewal.profile(actor)');
 assert(data.topics.length>=3,name);assert.equal(data.greetings.length,6);
 for(const index of [0,2,4]){assert(!greetings.has(data.greetings[index]),name+' duplicate NPC greeting');greetings.add(data.greetings[index]);}
 const first=json('DialogueRenewal.introduction(actor).lines');run('DialogueRenewal.introduction(actor).done()');
 const second=json('DialogueRenewal.introduction(actor).lines');assert.notDeepEqual(first,second,name+' remembers greeting');
 const saved=json('[...discussedTopics]');c.saved=saved;run('discussedTopics.clear();saved.forEach(k=>discussedTopics.add(k))');assert.deepEqual(json('DialogueRenewal.introduction(actor).lines'),second);
 run('openNpcTopics(actor)');assert.equal(run('ask?.npcConversation'),name);assert(run('EmberConversationFlow.active()'),name+' full-screen');assert.equal(dom.element('bagAsk').getAttribute('aria-modal'),'true');
 assert.equal(run('EmberFriendship.status().total'),data.topics.length,name+' only new friendship topics');
 for(const [index,row]of data.topics.entries()){
  assert(!openings.has(row.first),name+' repeats another opening');openings.add(row.first);
  c.topic=run('DialogueRenewal.topics(actor,{all:true})')[index];
  for(let branch=0;branch<3;branch++){
   c.branch=branch;
   run(`EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;openNpcTopics(actor);EmberConversationFlow.openChat();EmberConversationFlow.take({n:topic.title,friendshipId:topic.friendshipId,go:()=>EmberConversationFlow.playTopic(actor,topic)});typeAll();scene.t=1;EmberConversationFlow.advance();`);
   assert(run('ask?.replyChoices'),name+' / '+row.title+' reaches choices');
   assert.deepEqual(json('ask.opts.filter(o=>!o.head).map(o=>o.n)'),row.replies.map(r=>r[0]));
   run('askPick=branch+1;askTake()');assert.equal(run('typeFull'),row.replies[branch][0],name+' Corin response');
   run('typeAll();scene.t=1;EmberConversationFlow.advance()');assert.equal(run('typeFull'),row.replies[branch][1],name+' distinct NPC answer');
   run('typeAll();scene.t=1;EmberConversationFlow.advance()');assert.equal(run('ask.npcConversation'),name,name+' returns to conversation');exchanges++;
  }
 }
}
// Church NPCs remain world conversations, including their ritual.
reset();for(const name of json('Object.keys(DIALOGUE_CHURCH_LINES)')){
 c.actor={n:name,x:12000,y:3300,packSpr:name==='Brother Cael'?'chapel_priest':'chapel_parishioners1'};
 run('EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;beginNpcTalk(actor)');
 assert(run('!!scene'),name+' speaks');assert(!run('EmberConversationFlow.active()'),name+' stays in the world');assert(!run('ask?.npcConversation'));
}
// Aurelius uses the full telepathic screen and real choice branches.
reset();run(`npcs=[];dragon.down=false;dragon.air=false;dragon.placed=MAPID;ride=null;doorMotion=null;fadeDir=0;editing=false;arenaLock=null;foes=[];lastFight=0;openDragonConversation();`);assert(run('ask.dragonConversation&&EmberConversationFlow.active()'));
run(`EmberConversationFlow.openChat();askPick=ask.opts.findIndex(o=>o.n==='Our bond');askTake();EmberConversationFlow.openChat();askPick=1;askTake();typeAll();scene.t=1;EmberConversationFlow.advance()`);assert(run('ask.replyChoices&&scene.telepathy'));
run('askPick=2;askTake();typeAll();scene.t=1;EmberConversationFlow.advance()');assert.equal(run('typeWho'),'Aurelius');
// Waiting at doors does not repeat a single automatic exchange, including after save restoration.
reset();run('dragonBanterQuiet=0');
const doors=[];for(let i=0;i<12;i++){run('dragonDoorExchange()');doors.push(json('dragonBanterActive.lines'));run('dismissDragonBanter()');}
assert.equal(new Set(doors.flat()).size,24);run('dragonDoorExchange()');assert.equal(run('dragonBanterActive'),null);
c.saved=json('[...dragonBanterSeen]');run('resetDragonBanter(saved);dragonDoorExchange()');assert.equal(run('dragonBanterActive'),null);
// Completing old friendship rewards does not mint another reward for the rewrite.
reset();run(`EmberFriendship.restore({tutorialSeen:true,people:{Hettie:{completed:['old-topic'],known:[],rewarded:true}}});actor={n:'Hettie',x:12000,y:3300};openNpcTopics(actor)`);
const before=json('[gold,potions]');run('for(const o of ask.opts)if(o.friendship)EmberFriendship.complete(EmberFriendship.start(ask,o))');assert.deepEqual(json('[gold,potions]'),before);
// New royal replies still survive save sanitization and affect dismissal.
reset();run(`actor={n:'King Halvard',thornwellRoyal:true,x:12000,y:3300};thornwellRoyal.stage=3;ThornwellAudienceDialogue.rows(actor)[1].onReply(DialogueRenewal.cast['King Halvard'].topics[1].replies[0][0]);var royalSave=captureThornwellRoyal();restoreThornwellRoyal(royalSave);`);
assert.equal(run('thornwellRoyal.answers.riders'),'defiant');
// Asking about the pyramid is not consent to start the optional quest.
reset();run(`houseLootTaken.clear();actor={n:'Scholar Ilyan'};var pyramidTopic=DialogueRenewal.pyramid(actor);`);
for(const branch of [1,2]){c.branch=branch;run('pyramidTopic.onReply(DialogueRenewal.cast[actor.n].name&&[pyramidTopic.lines[1].slice(7),...pyramidTopic.authoredBranches.decisions[0].map(r=>r[0])][branch])');assert(!run('DesertAdventure.accepted()'));}
run('pyramidTopic.onReply(pyramidTopic.lines[1].slice(7))');assert(run('DesertAdventure.accepted()'));
// No old topic arrays are returned for any published resident.
for(const actor of placed){c.actor=actor;if(run('DialogueRenewal.church(actor)'))continue;assert(run('npcStoryTopics(actor).filter(t=>t.lines&&t.friendship!==false).every(t=>t.friendshipId.startsWith("renewal-"))'));}
console.log(`PASS: ${names.length} conversation profiles; ${exchanges} played reply branches; all published NPCs covered; church exception; Aurelius; greeting persistence; royal saves; quest acceptance; reward migration.`);
