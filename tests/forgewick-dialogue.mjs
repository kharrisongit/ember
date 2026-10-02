import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:true});
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
const reset=()=>run(`askShut();scene=null;sayNpc=null;revealing=null;wonAll=false;MAPID='world';MD=W.maps.world;
 MW=MD.w;MH=MD.h;terr=new Uint8Array(MW*MH);mode='play';gameplayStarted=true;quest=Q.DONE;
 dragon.on=true;dragonOff=false;dragonIntroDone=true;dragon.x=12000;dragon.y=3300;mounted=false;
 templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;
 fishingPole=true;charm.twin=true;smithUpgrade=true;charm.edge=true;glassShield=false;brambleQuest=3;thornwellRoyal.stage=7;
 P.x=12000;P.y=3320;P.act=null;faceToward=()=>{};dragonConversationReaction=()=>{};saveGame=()=>{};
 discussedTopics.clear();dragonBanterSeen.clear();breathHas.lightning=false;breathHas.ice=false;breathHas.shadow=false;
 EmberFriendship.restore({tutorialSeen:true});DragonChapels.restore(false);EmberRiding.skip();EmberEquipmentTutorial.skip();`);
reset();
await run('loadPublishedEditorLayouts()');
run(`for(const [id,m]of Object.entries(W.maps)){prepareEditorEntities(m,id);prepareMarketNpcCast(m,id);applyPublishedEditorLayout(m,id);prepareMarketNpcRoles(m,id);preparePlacedNpcDialogue(m);prepareDialoguePortraitCast(m,id);}npcs=[];prepareJourneyGates();`);
const residents=json(`Object.entries(W.maps).flatMap(([map,m])=>(m.npcs||[]).filter(n=>!n.noTalk&&!n.pettable&&!n.editorDeleted&&!n.publishedDeleted&&
 (map==='world'?n.x>=8500&&n.x<17000:/Forgewick/.test(m.title||''))).map(n=>({map,n:n.n}))).concat(npcs.filter(n=>n.progressionWorker==='forgewick').map(n=>({map:'world',n:n.n})))`);
const names=json('Object.keys(ForgewickDialogue.cast)');assert.equal(names.length,48);
for(const resident of residents)assert(names.includes(resident.n),resident.n+' in '+resident.map+' is covered');
assert.equal(run("ForgewickDialogue.profile({n:'Sela'})"),null,'Sandspire is out of scope');
assert.equal(run("ForgewickDialogue.profile({n:'Tessa',loc:'Thornwell — the Copper Cup'})"),null);
let exchanges=0,choices=0;
const prepareTopic=(actor,topic,option)=>{
 c.actor=actor;c.topic=topic;c.optionIndex=option+1;
 run(`askShut();scene=null;sayNpc=null;ask={quick:1,npcConversation:actor.n,npcActor:actor,opts:[{n:'Goodbye'}]};askDraw();EmberConversationFlow.openChat();
 EmberConversationFlow.take({n:topic.title,friendship:topic.friendship,friendshipId:topic.friendshipId,go:()=>EmberConversationFlow.playTopic(actor,topic)});
 typeAll();scene.t=1;EmberConversationFlow.advance();`);
 assert(run('ask.replyChoices'),actor.n+' '+topic.title+' reaches actual choices');
 assert.equal(run('ask.opts.length'),4);assert.equal(new Set(json('ask.opts.filter(o=>!o.head).map(o=>o.n)')).size,3);
 run('askPick=optionIndex;askTake();typeAll();scene.t=1;EmberConversationFlow.advance()');
 const expected=option===0?topic.lines[2].slice(actor.n.length+2):topic.authoredBranches.decisions[0][option-1][1];
 assert.equal(run('typeFull'),expected,actor.n+' '+topic.title+' reply '+option);
 run('typeAll();scene.t=1;EmberConversationFlow.advance()');assert.equal(run('ask.npcConversation'),actor.n);choices++;
};
for(const name of names){
 reset();c.actor={n:name,x:12000,y:3300};
 const first=json('ForgewickDialogue.introduction(actor).lines');
 assert(!/\bCorin\b|\bAurelius\b/.test(first[0]),name+' does not know either name before introductions');
 assert(first[1].startsWith('Corin: '));assert.match(first[1],/Corin/);assert.match(first[1],/Aurelius/);
 run('ForgewickDialogue.introduction(actor).done()');
 assert(!json('ForgewickDialogue.introduction(actor).lines').some(l=>/I[’a-z ]*m Corin/.test(l)),name+' remembers meeting Corin');
 c.memory=json('[...discussedTopics]');const remembered=json('ForgewickDialogue.introduction(actor).lines');
 run('discussedTopics.clear();memory.forEach(k=>discussedTopics.add(k))');assert.deepEqual(json('ForgewickDialogue.introduction(actor).lines'),remembered);
 run('discussedTopics.clear();dragonOff=true');const news=json('ForgewickDialogue.introduction(actor).lines');
 assert(!/Corin|Aurelius|your dragon/.test(news[0]),name+' does not recognise an unintroduced rider indoors');
 assert.match(news[1],/I travel with a dragon named Aurelius/);
 assert(!/beside you|those wings|that tail|waiting outside|in the aisle|through the door|in this room/i.test(news.join(' ')),name+' does not invent a dragon sighting');
 run('ForgewickDialogue.introduction(actor).done();dragonOff=false');assert.match(run('ForgewickDialogue.introduction(actor).lines[0]'),/companion|told me/);
 run('ForgewickDialogue.introduction(actor).done();breathHas.lightning=true;openNpcTopics(actor)');
 assert.equal(run('EmberFriendship.status().total'),5,name+' has exactly five friendship slots');
 assert.equal(run('EmberFriendship.status().locked'),1,name+' follow-up waits for earlier conversations');
 run('for(const o of ask.opts)if(o.friendship)EmberFriendship.complete(EmberFriendship.start(ask,o));openNpcTopics(actor)');
 assert.equal(run('EmberFriendship.status().locked'),0,name+' follow-up unlocks when its prerequisites are met');
 for(const victory of [false,true]){
  c.victory=victory;run('wonAll=victory');
  const topics=run('npcStoryTopics(actor)').filter(t=>t.lines);
  assert.equal(topics.filter(t=>t.friendship!==false).length,5);
  for(const topic of topics){
   assert.equal(topic.lines.length,3);assert.equal(topic.authoredBranches.decisions[0].length,2);
   assert(topic.lines.every(l=>typeof l==='string'&&!/undefined|\[object/.test(l)));
   for(let option=0;option<3;option++)prepareTopic({n:name,x:12000,y:3300},topic,option);
   exchanges++;
  }
 }
}
// Tessa remembers the Copper Cup introduction and uses the same friendship slots.
reset();run(`actor={n:'Tessa',x:12000,y:3300};discussedTopics.add('@thornwell-v2:Tessa:met');discussedTopics.add('@thornwell-v2:Tessa:dragon');discussedTopics.add('@thornwell-v2:Tessa:seen');`);
assert(!run('ForgewickDialogue.introduction(actor).lines.join(" ").includes("I’m Corin")'));
assert.equal(run('ForgewickDialogue.topics(actor)[0].friendshipId'),'thornwell-0');
// First visits do not invent a later meeting, and reward once after all five exchanges.
reset();run(`actor={n:'Prue',x:12000,y:3300};breathHas.lightning=true;ForgewickDialogue.introduction(actor).done();openNpcTopics(actor);
 for(const o of ask.opts)if(o.friendship)EmberFriendship.complete(EmberFriendship.start(ask,o));openNpcTopics(actor);`);
assert.equal(run('EmberFriendship.status().locked'),1,'Must actually return, not merely finish topics');
const before=json('[gold,potions]');
run('ForgewickDialogue.introduction(actor).done();openNpcTopics(actor);for(const o of ask.opts)if(o.friendship)EmberFriendship.complete(EmberFriendship.start(ask,o));openNpcTopics(actor)');
assert.deepEqual(json('[gold,potions]'),[before[0]+50,before[1]+1]);
run('for(const o of ask.opts)if(o.friendship)EmberFriendship.complete(EmberFriendship.start(ask,o))');
assert.deepEqual(json('[gold,potions]'),[before[0]+50,before[1]+1]);
// Dunstan's service keeps the actual upgrade and Whetstone reveals, with no forced old referral.
reset();run(`MAPID='smithy';MD=W.maps.smithy;actor=MD.npcs.find(n=>n.n==='Dunstan');smithUpgrade=false;charm.edge=false;
 ForgewickDialogue.introduction(actor).done();openNpcTopics(actor);`);
assert(run('ask.opts.some(o=>/improve my sword/.test(o.n))'),'Equipment does not hide the full topic menu');
run(`beginNpcTalk(actor,true);`);assert(run('sayNpc.said.some(l=>l.includes("gift, not a debt"))'));
run('for(let i=0;i<20&&sayNpc;i++){typeAll();interact();}');assert(run('smithUpgrade'));
run('if(revealing)hideReveal();for(let i=0;i<20&&scene;i++){typeAll();scene.t=1;advanceScene();}');
assert(run('charm.edge'),'Actual Whetstone reward is received');run('if(revealing)hideReveal();scene=null;askShut();');
assert.equal(run('ForgewickDialogue.service(actor)'),null,'Upgrade cannot be offered twice');
// Family talk alone does not discover a shield that nobody has mentioned.
reset();run("actor={n:'Dunstan',x:12000,y:3300}");
const family=run('ForgewickDialogue.topics(actor).find(t=>t.friendshipId==="forgewick-1")');
prepareTopic({n:'Dunstan',x:12000,y:3300},family,0);assert(!run('dragonLearned("shield")'));
// Learn the Glass Shield from the actual new topic; gold label vanishes once known.
reset();run(`actor={n:'Dunstan',x:12000,y:3300};openNpcTopics(actor);`);
assert(run('ask.opts.some(o=>o.questUnlock)'));
const lead=run('ForgewickDialogue.topics(actor).find(t=>t.questUnlock)');prepareTopic({n:'Dunstan',x:12000,y:3300},lead,2);
assert(run('dragonLearned("shield")'));assert(run('atlasQuestOptions().some(q=>q.id==="shield")'));
assert(!run('ForgewickDialogue.topics(actor).some(t=>t.questUnlock)'));
// Every chapel resident enters the standard conversation flow. Edrin's lead is optional and saved.
reset();run("MAPID='forgewick_chapel';MD=W.maps.forgewick_chapel;npcs=MD.npcs;dragon.x=176;dragon.y=150");
for(const actor of run('npcs')){c.actor=actor;assert.equal(run('DragonChapels.talk(actor)'),false);assert(run('openNpcTopics(actor)'),actor.n+' opens full conversation');}
run('actor=npcs.find(n=>n.n==="Brother Edrin");DragonChapels.restore(false);openNpcTopics(actor)');
assert(!run('DragonChapels.known()'),'Merely opening Edrin’s panel does not force a quest');
const church=run('ForgewickDialogue.topics(actor).find(t=>t.questUnlock)');prepareTopic(run('actor'),church,2);
assert(run('DragonChapels.known()&&!DragonChapels.found()'));assert(run('atlasQuestOptions().some(q=>q.id==="desert-church")'));
c.saved=json('DragonChapels.captureQuest()');run('DragonChapels.restore(false,saved)');assert(run('DragonChapels.known()'));
run('DragonChapels.restore(true,{known:true,found:true})');
assert(run('ForgewickDialogue.topics(actor)[0].lines[0].includes("reached the chapel")'));
assert(!run('ForgewickDialogue.topics(actor)[0].questUnlock'));
// Road guidance agrees with both gates, and Alderic never sends an owner back to collect Lightning.
reset();run(`actor={n:'Miner Marn',x:12000,y:3300};smithUpgrade=false;charm.edge=false;`);
assert.match(run('ForgewickDialogue.topics(actor)[0].lines[0]'),/still clearing/);
run('smithUpgrade=true;charm.edge=true;breathHas.lightning=true');assert.match(run('ForgewickDialogue.topics(actor)[0].lines[0]'),/road is clear/);
run('actor={n:"Alderic",x:12000,y:3300}');assert.match(run('ForgewickDialogue.topics(actor)[0].lines[0]'),/You have claimed Lightning/);
// Complete rewrite: none of the new authored openings reuse a legacy opening.
const old=new Set(json('Object.values(NPC_STORIES).flat().map(t=>t[1])'));
for(const name of names){c.actor={n:name,x:12000,y:3300};for(const t of run('ForgewickDialogue.topics(actor,{all:true})').filter(t=>t.lines))assert(!old.has(t.lines[0].slice(name.length+2)),name+' does not reuse old story prose');}
assert(fs.readFileSync('index.html','utf8').includes('forgewick-dialogue-data.js'));
console.log(`PASS: ${residents.length} published/road placements, ${names.length} Forgewick speakers, ${exchanges} topic/state exchanges and ${choices} actual replies; introductions/presence, saved meetings, quest leads, upgrades, road/temple states, chapel routing and one-time friendship rewards.`);
