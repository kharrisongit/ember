import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
// Keep the historical regional CI entry points exercising the canonical catalogue.
export async function checkRegion(source){
 const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:false});
 dom.element('bagAsk').append(dom.element('askRows'));
 const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
 run(`mode='play';gameplayStarted=true;MAPID='world';MD=W.maps.world;quest=Q.DONE;dragon.on=true;dragonOff=false;dragonIntroDone=true;dragon.x=100;dragon.y=100;P.x=100;P.y=120;thornwellRoyal.stage=7;brambleQuest=3;templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;fishingPole=true;smithUpgrade=true;charm.edge=true;faceToward=()=>{};dragonConversationReaction=()=>{};saveGame=()=>{};EmberRiding.skip();EmberEquipmentTutorial.skip();`);
 const names=json('Object.keys('+source+')');let count=0;
 for(const name of names){
  c.actor={n:name,x:100,y:100};
  if(run('DialogueRenewal.church(actor)')){assert(!run('DialogueRenewal.profile(actor)'));assert(run('DialogueRenewal.context(actor).length>=3'));continue;}
  run('EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;revealing=null;discussedTopics.clear();EmberFriendship.restore({tutorialSeen:true});dragonOff=true;');
  const profile=json('DialogueRenewal.profile(actor)');assert(profile,name);assert(profile.topics.length>=3);
  const first=json('DialogueRenewal.introduction(actor).lines');assert.equal(first[0],name+': '+profile.greetings[0]);
  run('DialogueRenewal.introduction(actor).done()');const returning=json('DialogueRenewal.introduction(actor).lines');assert.notDeepEqual(returning,first);
  c.saved=json('captureSave().discussedTopics');run('discussedTopics.clear();saved.forEach(k=>discussedTopics.add(k))');assert.deepEqual(json('DialogueRenewal.introduction(actor).lines'),returning,'Saved meeting survives');
  run('dragonOff=false');assert.equal(run('DialogueRenewal.introduction(actor).lines[0]'),name+': '+profile.greetings[['Elder Maddock','Nan Ferrow'].includes(name)?2:4]);
  for(const victory of [false,true]){
   c.victory=victory;run('wonAll=victory;openNpcTopics(actor);EmberConversationFlow.openChat()');
   assert.equal(run('ask.npcConversation'),name);assert(run('EmberConversationFlow.active()'));
   const topics=run('npcStoryTopics(actor).filter(t=>t.lines&&t.friendship!==false)');assert.equal(topics.length,profile.topics.length);
   assert(topics.every(t=>t.friendshipId.startsWith('renewal-')),'No retired conversations enter the panel');
   c.topic=topics[0];run(`EmberConversationFlow.take({n:topic.title,friendshipId:topic.friendshipId,go:()=>EmberConversationFlow.playTopic(actor,topic)});typeAll();scene.t=1;EmberConversationFlow.advance();`);
   assert(run('ask.replyChoices'));assert.equal(run('ask.opts.filter(o=>!o.head).length'),3);
   run('askPick=3;askTake();typeAll();scene.t=1;EmberConversationFlow.advance()');assert.equal(run('typeFull'),topics[0].authoredBranches.decisions[0][1][1]);
   run('typeAll();scene.t=1;EmberConversationFlow.advance()');assert.equal(run('ask.npcConversation'),name);
  }
  run('EmberFriendship.restore({tutorialSeen:true});openNpcTopics(actor)');assert.equal(run('EmberFriendship.status().total'),profile.topics.length);
  const before=json('[gold,potions]');run('for(const o of ask.opts)if(o.friendship)EmberFriendship.complete(EmberFriendship.start(ask,o))');
  assert.deepEqual(json('[gold,potions]'),[before[0]+50,before[1]+1]);
  run('openNpcTopics(actor);for(const o of ask.opts)if(o.friendship)EmberFriendship.complete(EmberFriendship.start(ask,o))');assert.deepEqual(json('[gold,potions]'),[before[0]+50,before[1]+1]);count++;
 }
 console.log(`PASS: ${count} ${source} residents use new full conversations, saved greetings, presence-aware introductions, authored responses before/after victory and one-time rewards.`);
 return {run,c,json};
}
