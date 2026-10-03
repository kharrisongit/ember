import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),console,{document:dom.document,furniture:true});
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
const reset=()=>run(`askShut();scene=null;sayNpc=null;revealing=null;wonAll=false;MAPID='world';MD=W.maps.world;
 MW=MD.w;MH=MD.h;terr=new Uint8Array(MW*MH);mode='play';gameplayStarted=true;quest=Q.DONE;
 dragon.on=true;dragonOff=false;dragonIntroDone=true;dragon.x=100;dragon.y=100;mounted=false;
 templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;
 fishingPole=true;odoRodReferral=true;charm.twin=true;brambleQuest=1;thornwellRoyal.stage=1;
 P.x=100;P.y=120;P.act=null;faceToward=()=>{};dragonConversationReaction=()=>{};saveGame=()=>{};
 discussedTopics.clear();breathHas.lightning=false;breathHas.ice=false;breathHas.shadow=false;
 EmberFriendship.restore({tutorialSeen:true});`);
reset();
await run('loadPublishedEditorLayouts()');
run(`for(const [id,m] of Object.entries(W.maps)){prepareEditorEntities(m,id);prepareMarketNpcCast(m,id);applyPublishedEditorLayout(m,id);prepareMarketNpcRoles(m,id);preparePlacedNpcDialogue(m);prepareDialoguePortraitCast(m,id);}`);
const residents=json(`Object.entries(W.maps).flatMap(([map,m])=>(m.npcs||[]).filter(n=>!n.noTalk&&!n.pettable&&!n.editorDeleted&&!n.publishedDeleted&&(/Thornwell|Copper Cup/.test((m.title||'')+' '+(n.loc||''))||(map==='world'&&n.x>=220*TS&&n.x<=322*TS&&n.y>=44*TS&&n.y<=150*TS))).map(n=>({map,n:n.n})))`);
const names=json('Object.keys(ThornwellDialogue.cast)');
assert.equal(names.length,55);
for(const n of residents)assert(names.includes(n.n),n.n+' in '+n.map+' is covered');
assert.equal(run("ThornwellDialogue.profile({n:'Dunstan'})"),null,'Later town remains out of scope');
assert.equal(run("ThornwellDialogue.profile({n:'Pip'})"),null,'Puck remains distinct from the Shroom Pip');
const directions=names.filter(n=>n!=='Rowan the Hunter').map(n=>{
 c.leadName=n;return run("ThornwellDialogue.bramble({n:leadName}).lines[0].slice((leadName+': '+ThornwellDialogue.cast[leadName].bramble+' ').length)");
});
assert.equal(new Set(directions).size,directions.length,'Every outdoor Bramble direction has its own wording');
reset();run("charm.twin=false;var firstFen={n:'Fen',charm:'twin',x:100,y:100};EmberConversationFlow.prompt(firstFen)");
assert(run('scene?.conversationGreeting'),'The first Fen gift starts with an introduction');
assert(!run("scene.lines[0].includes('Corin')"),'Fen cannot know Corin’s name before he introduces himself');
assert(run("scene.lines.some(line=>line.startsWith('Corin: I am Corin'))"),'Corin introduces himself');
assert(!run('charm.twin'),'Introduction cannot grant the charm early');
run('var finishFenIntroduction=scene.after;scene=null;finishFenIntroduction()');
assert(run("ThornwellDialogue.remembers(firstFen,'met')&&sayNpc===firstFen"),'Finishing the introduction starts the normal gift conversation');
assert(run("firstFen.said.some(line=>line.includes('Twin Heart'))"),'The gift remains available after meeting');
reset();
let exchanges=0,choices=0;
for(const name of names){
 reset();c.actor={n:name,x:100,y:100};
 const first=json('ThornwellDialogue.introduction(actor).lines');
 const firstCorin=first.findIndex(l=>l.startsWith('Corin: '));
 assert(firstCorin>0);assert(!first.slice(0,firstCorin).some(l=>/\bCorin\b/.test(l)),name+' does not know a stranger’s name');
 assert.match(first[firstCorin],/I am Corin, from Millwood/);
 assert(!/Aurelius|dragon/i.test(first.join(' ')),name+' secret first introduction');
 run('ThornwellDialogue.introduction(actor).done()');
 assert.notDeepEqual(json('ThornwellDialogue.introduction(actor).lines'),first,name+' remembers meeting Corin');
 for(const stage of [0,1,3,5,6]){
  c.stage=stage;run('thornwellRoyal.stage=stage');
  assert(!/Aurelius|your dragon|your companion|dragon travels with you/i.test(JSON.stringify(json('npcStoryTopics(actor)'))),name+' secret topics at stage '+stage);
 }
 run('thornwellRoyal.stage=7');
 const reveal=json('ThornwellDialogue.introduction(actor).lines');
 assert(!reveal.some(l=>l.includes('I am Corin')),name+' does not introduce himself twice');
 assert(reveal.some(l=>/dragon|wings/i.test(l)),name+' reacts to the actual dragon');
 run('ThornwellDialogue.introduction(actor).done()');
 const remembered=json('ThornwellDialogue.introduction(actor).lines');
 c.memory=json('[...discussedTopics]');run('discussedTopics.clear();memory.forEach(k=>discussedTopics.add(k))');
 assert.deepEqual(json('ThornwellDialogue.introduction(actor).lines'),remembered,'Meeting memories survive saved data');
 run('discussedTopics.clear();dragonOff=true');
 const heard=json('ThornwellDialogue.introduction(actor).lines');
 assert(heard[1].startsWith('Corin: I am Corin'));
 assert(!/beside you|those wings|that tail|waiting outside/i.test(heard.join(' ')),name+' cannot see an absent dragon');
 run('ThornwellDialogue.introduction(actor).done();dragonOff=false');
 assert.match(run('ThornwellDialogue.introduction(actor).lines[0]'),/You told me/,'Hearing and seeing are separate');
 run('ThornwellDialogue.introduction(actor).done();breathHas.lightning=true;brambleQuest=3');
 for(const victory of [false,true]){
  c.victory=victory;run('wonAll=victory');
  const topics=run('npcStoryTopics(actor)').filter(t=>t.lines);
  assert(topics.filter(t=>t.friendship!==false).length===5,name+' has all five permanent friendship topics');
  for(const topic of topics){
   c.topic=topic;const lines=json('EmberConversationBranches.prepare(topic.lines,actor.n,topic)');
   assert.equal(lines.length,3);assert.equal(topic.authoredBranches.decisions[0].length,2);
   const expected=[lines[2].slice(name.length+2),...topic.authoredBranches.decisions[0].map(r=>r[1])];
   for(let option=0;option<3;option++){
    c.optionIndex=option+1;
    run(`askShut();scene=null;sayNpc=null;ask={quick:1,npcConversation:actor.n,npcActor:actor,opts:[{n:'Goodbye'}]};askDraw();EmberConversationFlow.openChat();
      EmberConversationFlow.take({n:topic.title,friendship:topic.friendship,friendshipId:topic.friendshipId,go:()=>EmberConversationFlow.playTopic(actor,topic)});
      typeAll();scene.t=1;EmberConversationFlow.advance();`);
    assert(run('ask.replyChoices'),name+' '+topic.title+' reaches choices');
    assert.equal(new Set(json('ask.opts.filter(o=>!o.head).map(o=>o.n)')).size,3);
    run('askPick=optionIndex;askTake();typeAll();scene.t=1;EmberConversationFlow.advance()');
    assert.equal(run('typeFull'),expected[option],name+' '+topic.title+' answer '+option);
    run('typeAll();scene.t=1;EmberConversationFlow.advance()');
    assert.equal(run('ask.npcConversation'),name);choices++;
   }
   exchanges++;
  }
 }
 reset();c.actor={n:name,x:100,y:100};
 if(name!=='Rowan the Hunter'){
  run('openNpcTopics(actor)');assert.equal(run('ask.opts[1].n'),'Do you know Bramble?');
  assert.equal(run('ask.opts[1].friendship'),false,'Missable lead never blocks maximum friendship');
  assert.match(run('brambleHint(actor).lines[0]'),/Copper Cup/);
  run('brambleQuest=3');assert.equal(run('brambleHint(actor)'),null);
 }
}
// The same royal choices use normal branch playback and persist the dismissal consequence.
reset();run("MAPID='tavern';MD=W.maps.tavern;thornwellRoyal.stage=3;brambleQuest=3");
for(const name of ['King Halvard','Serjeant Bram']){
 c.actor={n:name,thornwellRoyal:true,x:100,y:100};run('npcs=[actor]');
 for(const topic of run('ThornwellAudienceDialogue.rows(actor)')){
  c.topic=topic;
  for(let i=0;i<3;i++){
   c.optionIndex=i+1;
   run(`openThornwellAudience(actor);EmberConversationFlow.openChat();EmberConversationFlow.take({n:topic.title,friendshipId:topic.friendshipId,go:()=>EmberConversationFlow.playTopic(actor,topic)});typeAll();scene.t=1;EmberConversationFlow.advance();`);
   assert.equal(run('ask.opts.length'),4);run('askPick=optionIndex;askTake();typeAll();scene.t=1;EmberConversationFlow.advance()');
   assert.equal(run('typeFull'),i===0?topic.lines[2].slice(name.length+2):topic.authoredBranches.decisions[0][i-1][1]);
   run('typeAll();scene.t=1;EmberConversationFlow.advance()');assert.equal(run('ask.npcConversation'),name);choices++;
  }
 }
}
reset();c.actor={n:'Linna',x:100,y:100};run('openNpcTopics(actor)');
assert.equal(run('EmberFriendship.status().total'),5);assert.equal(run('EmberFriendship.status().locked'),2);
run('thornwellRoyal.stage=7;breathHas.lightning=true;ThornwellDialogue.introduction(actor).done();openNpcTopics(actor)');
assert.equal(run('EmberFriendship.status().locked'),1,'A later visit is not invented at a first meeting');
run('ThornwellDialogue.introduction(actor).done();openNpcTopics(actor)');assert.equal(run('EmberFriendship.status().locked'),0);
const rewardBefore=json('[gold,potions]');
run('for(const o of ask.opts)if(o.friendship)EmberFriendship.complete(EmberFriendship.start(ask,o))');
assert.deepEqual(json('[gold,potions]'),[rewardBefore[0]+50,rewardBefore[1]+1]);
run('for(const o of ask.opts)if(o.friendship)EmberFriendship.complete(EmberFriendship.start(ask,o))');assert.deepEqual(json('[gold,potions]'),[rewardBefore[0]+50,rewardBefore[1]+1]);
console.log(`PASS: ${residents.length} published local placements, 55 authored residents, ${exchanges} topic/state exchanges and ${choices} actual replies; stranger introductions, saved meetings, dragon secrecy/presence, Bramble leads, royal responses and one-time friendship reward.`);
