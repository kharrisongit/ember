import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),console,{document:dom.document,furniture:false});
run('EmberFriendship.restore({tutorialSeen:true})');
const json=code=>JSON.parse(run(`JSON.stringify(${code})`));
const reset=()=>run(`askShut();scene=null;sayNpc=null;revealing=null;wonAll=false;MAPID='world';MD=W.maps.world;
 MW=MD.w;MH=MD.h;terr=new Uint8Array(MW*MH);mode='play';gameplayStarted=true;quest=Q.DONE;
 dragon.on=true;dragonOff=false;dragonIntroDone=false;dragon.x=100;dragon.y=100;mounted=false;
 templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;
 fishingPole=true;odoRodReferral=true;charm.spore=true;brambleQuest=0;thornwellRoyal.stage=7;
 P.x=100;P.y=120;P.act=null;faceToward=()=>{};dragonConversationReaction=()=>{};saveGame=()=>{};
 discussedTopics.clear();breathHas.lightning=false;breathHas.ice=false;breathHas.shadow=false;`);
reset();
run(`prepareRegionalVillagers(W.maps.world,'world');prepareFarmResident(W.maps.world,'world');
 for(const [id,m] of Object.entries(W.maps))prepareDialoguePortraitCast(m,id);`);
const names=json('Object.keys(MillwoodShroomDialogue.cast)');
assert.equal(names.length,22);
const localCast=json(`Object.entries(W.maps).flatMap(([map,m])=>(m.npcs||[]).filter(n=>!n.noTalk&&!n.pettable&&!n.editorDeleted&&!n.publishedDeleted&&(/Millwood|Shroom|Spore/.test(n.loc||'')||n.n==='The Shroom King')).map(n=>({map,n:n.n})))`);
assert.deepEqual([...new Set(localCast.map(n=>n.n))].sort(),[...names].sort(),'Every active local speaker, including indoor and generated villagers, is covered');
assert.equal(run(`MillwoodShroomDialogue.profile({n:'Pip',school:true,lookId:'tavern_anim_20'})`),null,'Tavern Pip cannot become the Shroom');
assert.equal(run(`MillwoodShroomDialogue.profile({n:'King Halvard',noTalk:true})`),null,'Royal cinematic stays in its story system');
assert.equal(run(`MillwoodShroomDialogue.topics({n:'Calder'})`),null,'Next-town/route cast stays outside this rewrite');

let exchanges=0,choices=0;
for(const name of names){
 c.actor={n:name,x:100,y:100};
 reset();
 // Before hatching, even a dragon sprite left by an editor does not create knowledge.
 run('quest=Q.ARMED');
  const early=json('MillwoodShroomDialogue.introduction(actor).lines');
  assert(!early.some(s=>/Aurelius|dragon|hatched/i.test(s)),name+' has an ordinary pre-hatch introduction');
  run('MillwoodShroomDialogue.introduction(actor).done()');
 run('quest=Q.DONE');
  const first=json('MillwoodShroomDialogue.introduction(actor).lines');
  assert(!first.some(s=>/Aurelius|in my thoughts|mind to mind/.test(s)),name+' cannot know the dragon name/bond yet');
  assert(!first.some(s=>s.includes('I am Corin')),name+' does not reintroduce Corin after meeting him');
 run('MillwoodShroomDialogue.introduction(actor).done()');
 const returning=json('MillwoodShroomDialogue.introduction(actor).lines');
 assert.notDeepEqual(returning,first,name+' remembers first meeting');
  const saved=json('[...discussedTopics]');c.savedMemory=saved;
  assert.deepEqual(json('captureSave().discussedTopics'),saved,'Actual save payload includes meeting memory');
 run('discussedTopics.clear();for(const key of savedMemory)discussedTopics.add(key)');
 assert.deepEqual(json('MillwoodShroomDialogue.introduction(actor).lines'),returning,name+' saved topic memory retains introduction state');
 // An unseen companion is introduced by Corin, not by clairvoyant villagers.
 run('discussedTopics.clear();dragonOff=true');
 const absent=json('MillwoodShroomDialogue.introduction(actor).lines');
 if(!['Nan Ferrow','Elder Maddock'].includes(name))assert(absent[0].startsWith('Corin: '),name+' first hears news from Corin');
 assert(!absent.some(s=>/standing beside|waiting outside|those wings|that tail/i.test(s)),name+' no claim to see an absent dragon');
 run('MillwoodShroomDialogue.introduction(actor).done();dragonOff=false');
 const sight=json('MillwoodShroomDialogue.introduction(actor).lines');
 if(!['Nan Ferrow','Elder Maddock'].includes(name))assert.match(sight[0],/you told me/,'Hearing and seeing are distinct introductions');
 for(const victory of [false,true]){
  c.victory=victory;run('wonAll=victory');
  const topics=run('npcStoryTopics(actor)').filter(t=>t.lines);
  assert(topics.length>=4,name+' has a full set of topics');
  assert.equal(topics.filter(t=>t.title===(victory?'After Halvard’s defeat':'King Halvard')).length,1);
  assert(!topics.some(t=>t.title===(victory?'King Halvard':'After Halvard’s defeat')));
  for(const topic of topics){
   c.topic=topic;
   const lines=json('EmberConversationBranches.prepare(topic.lines,actor.n,topic)');
   assert.equal(lines.length,3,name+' '+topic.title+' is a complete exchange');
   const replies=[lines[1].slice(7),...json('EmberConversationBranches.choices({lines:topic.lines,npcActor:actor,conversationReplies:{topic}},1)').map(r=>r[0])];
   assert(replies.length>=2&&replies.length<=3);
   assert.equal(new Set(replies).size,replies.length,'Choices are distinct');
   // Exercise the real UI choice/splice path for EVERY response, not just data shape.
   for(let option=0;option<replies.length;option++){
    run(`askShut();scene=null;sayNpc=null;ask={quick:1,npcConversation:actor.n,npcActor:actor,opts:[{n:'Goodbye'}]};askDraw();
      EmberConversationFlow.openChat();EmberConversationFlow.take({n:topic.title,go:()=>EmberConversationFlow.playTopic(actor,topic)});
      typeAll();scene.t=1;EmberConversationFlow.advance();`);
    assert(run('ask.replyChoices'),name+' '+topic.title+' enters reply menu');
    c.optionIndex=option+1;
    const chosen=run('ask.opts[optionIndex].n');
    const expected=option===0?lines[2].slice(name.length+2):topic.authoredBranches.decisions[0][option-1][1];
    run('askPick=optionIndex;askTake();typeAll();scene.t=1;EmberConversationFlow.advance();');
    assert.equal(run('typeFull'),expected,name+' answers the selected reply: '+chosen);
    assert.equal(run('scene.lines.length'),3,'No stale continuation survives the choice');
    run('typeAll();scene.t=1;EmberConversationFlow.advance()');
    assert.equal(run('ask.npcConversation'),name,'Final answer returns to same NPC menu');
    choices++;
   }
   exchanges++;
  }
 }
}
reset();c.actor={n:'Elder Maddock',x:100,y:100};
run('quest=Q.EGGS');assert(!json('npcStoryTopics(actor).map(t=>t.title)').includes('What happened at Wingfall?'));
run('quest=Q.NOISE');assert(json('npcStoryTopics(actor).map(t=>t.title)').includes('What happened at Wingfall?'));
run('quest=Q.DONE');assert.match(run('npcStoryTopics(actor)[0].lines[0]'),/Forgewick.*Thornwell/);
run('breathHas.lightning=true');assert.match(run('npcStoryTopics(actor)[0].lines[0]'),/Sandspire/);
run('breathHas.ice=true');assert.match(run('npcStoryTopics(actor)[0].lines[0]'),/Hollybeck/);
run('breathHas.shadow=true');assert.match(run('npcStoryTopics(actor)[0].title'),/all three/);
for(const name of ['Elder Maddock','Nan Ferrow']){
 c.actor={n:name,x:100,y:100};run('dragonIntroDone=false');assert(!json('npcStoryTopics(actor).map(t=>t.title)').some(t=>t.includes('Aurelius')));
 run('dragonIntroDone=true');assert(json('npcStoryTopics(actor).map(t=>t.title)').some(t=>t.includes('Aurelius')));
}
c.actor={n:'Nan Ferrow',x:100,y:100};run(`MAPID='house26';templeCompass.owned=false;quest=Q.ERRAND`);
assert.equal(run('npcStoryTopics(actor).length'),0);assert.equal(run('openNpcTopics(actor)'),false,'Nan does not open an empty pre-hatch menu');
run(`quest=Q.DONE;templeCompass.owned=true;nanElixirReadyAt=0`);
assert.equal(run('npcStoryTopics(actor)[0].title'),'Is an elixir ready?');
run('nanElixirReadyAt=Date.now()+600000');assert.equal(run('npcStoryTopics(actor)[0].title'),'How is the next elixir coming along?');
assert(json('npcStoryTopics(actor).map(t=>t.title)').includes('Did Dad use this compass?'));
run('templeCompass.owned=false');assert(!json('npcStoryTopics(actor).map(t=>t.title)').includes('Did Dad use this compass?'));

reset();c.actor={n:'The Shroom King',charm:'spore',x:100,y:100};
for(const victory of [false,true]){
 c.victory=victory;run('wonAll=victory;charm.spore=false;beginNpcTalk(actor,true)');
 assert.match(run('sayNpc.said.join(" ")'),/Equip.*Bag.*one heart/);
 assert(!run('charm.spore'),'Reward is not granted before the dialogue finishes');
 for(let i=0;i<10&&run('!!sayNpc');i++)run('typeAll();interact()');
 assert(run('charm.spore'),'Gift completes through normal reward logic, including after victory');
 run('revealing=null;hideReveal();scene=null;sayNpc=null');
 assert.equal(run('MillwoodShroomDialogue.gift(actor)'),null,'Spore cannot be reoffered');
 assert(json('npcStoryTopics(actor).map(t=>t.title)').includes('How do I use the Spore of the deep ring?'));
}
reset();c.actor={n:'Odo',x:100,y:100};run('fishingPole=false;odoRodReferral=false;beginNpcTalk(actor,true)');
assert(run('odoRodReferral'),'Odo still unlocks the existing rod referral');
assert.match(run('sayNpc.said.join(" ")'),/first camp.*Millwood to Thornwell/);
assert(!/dragon/.test(run('sayNpc.said.join(" ")')),'The rod exchange does not repeat the dragon introduction');
run('sayNpc=null;beginNpcTalk(actor,true,true)');assert.match(run('sayNpc.said[0]'),/remind me/);
run('sayNpc=null;fishingPole=true');assert(json('npcStoryTopics(actor).map(t=>t.title)').includes('I have a fishing rod now.'));
assert(!json('npcStoryTopics(actor).map(t=>t.title)').includes('Where can I get a fishing rod?'));
console.log(`PASS: 22 live local speakers, ${exchanges} topic/state exchanges and ${choices} actual reply selections; presence, prior meetings, save memory, story knowledge, destinations, elixirs, compass, spore rewards and fishing referrals.`);
