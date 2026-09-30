import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const c=vm.createContext({brambleHint:()=>null,hasDragon:()=>c.hatched,hatched:false,wonAll:false,dragonHere:()=>true,dragon:{on:true,x:0,y:0},mounted:false,MAPID:"world",
 templeCompass:{owned:false,meatGiven:false},nanGiftPending:()=>!c.templeCompass.owned||!c.templeCompass.meatGiven,glassShield:true,smithUpgrade:true,hasSword:()=>true,charm:{edge:true},breathHas:{},
 canCamperGiveFishingPole:n=>n.n==='Calder'&&!c.fishingPole,fishingPole:false,odoRodReferral:false,
 npcContextDialogue:n=>n.dd||n.d});
vm.runInContext(read('js/npc-world-talks.js'),c);
vm.runInContext(read('js/npc-conversations.js'),c);
const stories=vm.runInContext('NPC_STORIES',c),cast=JSON.parse(read('assets/portraits/cast.json'));
for(const n of cast.filter(n=>!['Corin','Aurelius','Bramble'].includes(n.name))){
 assert(stories[n.name],n.name+' has a personal story');assert.equal(stories[n.name].length,2);
 for(const topic of stories[n.name])assert.equal(topic.length,4,n.name+' has a title and a complete exchange');
}
const replies=Object.values(stories).flatMap(topics=>topics.map(t=>t[1]));assert.equal(new Set(replies).size,replies.length,'no repeated opening stories');
const nan={n:'Nan Ferrow',d:['Hello'],dd:['Aurelius'],dv:['Home again']};
assert(!c.npcStoryGiftPending(nan),'Nan has no gift before hatching');c.hatched=true;assert(c.npcStoryGiftPending(nan));
c.templeCompass.owned=true;assert(c.npcStoryGiftPending(nan),'Nan still has meat to give');c.templeCompass.meatGiven=true;assert(!c.npcStoryGiftPending(nan));
assert(c.npcStoryTopics(nan).some(t=>t.title==="Dad's compass"));assert(!c.npcStoryTopics(nan).some(t=>t.title==='After Halvard’s defeat'));
c.wonAll=true;assert(c.npcStoryTopics(nan).some(t=>t.title==='After Halvard’s defeat'));
assert(c.npcStoryGiftPending({n:'Odo'}));assert(c.npcStoryGiftPending({n:'Calder'}));
assert.match(c.fishingRodDialogue('Calder').join(' '),/Odo is my grandfather/);
c.odoRodReferral=true;assert(!c.npcStoryGiftPending({n:'Odo'}));assert(!c.npcStoryGiftPending({n:'Calder'}));
assert(c.npcStoryTopics({n:'Calder'}).some(t=>t.title==='Odo sent me for a fishing rod'));
assert.match(c.fishingRodDialogue('Calder')[0],/Odo sent me/);
assert.match(c.fishingRodDialogue('Odo')[0],/first camp on the road to Thornwell/);
c.fishingPole=true;assert(!c.npcStoryTopics({n:'Calder'}).some(t=>t.title==='Odo sent me for a fishing rod'));
assert(!c.npcStoryGiftPending({n:'Calder'}));
const stockSource=read('js/generated/game-part-2.js').split('const STOCK = {')[1].split('\n};')[0];
c.STOCK=Object.fromEntries([...stockSource.matchAll(/^  (\w+):/gm)].map(m=>[m[1],{}]));
vm.runInContext(read('js/merchant-shop.js'),c);
assert.deepEqual(Array.from(c.merchantStock({n:'Wren'})),['potion','birdMeat','salt']);
for(const name of ['Toft','Idris','Nerissa','Astrid'])assert.deepEqual(Array.from(c.merchantStock({n:name})),Object.keys(c.STOCK).filter(k=>k!=='bomb'));
assert.deepEqual(Array.from(c.merchantStock({n:'Maelis'})),['bomb']);
console.log('PASS: all speaking portraits have distinct personal stories, quest gifts precede topics, Nan and victory topics respect progress, and merchant stock follows town/exclusivity rules.');
c.hatched=false;assert.equal(c.npcStoryTopics(nan).length,0,'Nan keeps only her basic greeting before hatching');
c.hatched=true;assert(c.npcStoryTopics(nan).length>=4,'Nan personal stories unlock after hatching');
c.Q={NOISE:5};const hettie={n:'Hettie',d:['Hello'],d2:['A story']};
for(c.quest=0;c.quest<5;c.quest++){
 assert.equal(c.npcStoryTopics(hettie).length,0,'No Hettie topics before delivery');
 assert.equal(c.openNpcTopics(hettie),false,'No early Hettie menu');
}
assert(c.npcStoryTopics(hettie).length>=2,'Egg delivery unlocks Hettie stories');
const reminders=Array.from({length:4},()=>c.hettieErrandReminder());assert.equal(new Set(reminders).size,4);assert(reminders.every(s=>s.startsWith('Hettie:')));
assert(read('js/generated/game-part-2.js').includes("if(best.n==='Hettie'&&quest<Q.NOISE)"),'All direct greetings use the errand reminder gate');
console.log('PASS: Nan stories wait for hatching; Hettie menu waits for egg delivery, with four affectionate reminders beforehand.');

// Exercise the menu callbacks themselves: personal topics must start with their
// authored exchange, while the general greeting accounts for the companion.
const game=read('js/generated/game-part-2.js');
vm.runInContext(game.slice(game.indexOf('function brambleHint('),game.indexOf('\nfunction ',game.indexOf('function npcContextDialogue(')+10)),c);
vm.runInContext(game.slice(game.indexOf('function beginNpcTalk('),game.indexOf('\nconst esc =')),c);
vm.runInContext(read('js/story-dialogue.js'),c);
Object.assign(c,{hatched:true,wonAll:false,quest:5,brambleQuest:0,TS:16,MD:{},P:{x:0,y:0},window:{},
 sayOff(){},showFace(){},faceToward(){},askDraw(){},saveGame(){},typeStart(){},typePaint(){},sayOn(){},
 sayEl:{classList:{remove(){}}},whoSays(n,line){const i=line.indexOf(': ');return i>0?[line.slice(0,i),line.slice(i+2)]:[n.n,line];},
 playScene:(lines,opts)=>c.scene={lines,...opts}});
const farm={n:'Hettie',x:20,y:0,...vm.runInContext('MILLWOOD_STORY_DIALOGUE.Hettie',c)};
assert(!c.npcStoryTopics(farm).some(t=>t.title==='Another thing I meant to ask'),'Completed egg errand is not offered again');
for(let visit=0;visit<2;visit++)for(const [title,first,question,last] of stories.Hettie){
 assert(c.openNpcTopics(farm));c.ask.opts.find(o=>o.n===title).go();
 assert.deepEqual(Array.from(c.scene.lines),['Hettie: '+first,'Corin: '+question,'Hettie: '+last]);
 c.scene.after();assert.equal(c.ask.npcConversation,'Hettie','Returning to the menu preserves the selected speaker');
}
for(const expected of [farm.dd,farm.dd2]){
 c.openNpcTopics(farm);c.ask.opts.find(o=>o.n==='Hello!').go();
 assert.deepEqual(Array.from(c.sayNpc.said),Array.from(expected));
}
c.hatched=false;c.beginNpcTalk(farm,true);c.beginNpcTalk(farm,true);
assert.notEqual(c.sayNpc.said,farm.d2,'Post-delivery greeting never assigns the egg errand again');c.hatched=true;
const gran={n:'Nan Ferrow',x:20,y:0,...vm.runInContext('MILLWOOD_STORY_DIALOGUE["Nan Ferrow"]',c)};
c.openNpcTopics(gran);c.ask.opts.find(o=>o.n==='What was Dad like?').go();
assert.match(c.scene.lines[0],/Patient with a frightened animal/);assert(!c.scene.lines.some(l=>/dragon|Aurelius/i.test(l)));
c.dragon.x=500;assert.equal(c.npcContextDialogue(farm,false),farm.dragonRumor,'Absent dragon is not described as standing beside Corin');
c.dragon.x=0;c.brambleQuest=1;c.MAPID='tavern';c.BRAMBLE_HINTS={Hettie:['Lost dog']};
assert.deepEqual(Array.from(c.brambleHint(farm).lines),['Hettie: Lost dog']);
assert(!c.npcStoryTopics(farm).some(t=>t.title==='A dragon on the road'),'The greeting must not also appear under a dragon topic');
c.wonAll=true;assert.equal(c.npcContextDialogue(farm,false),farm.dv,'Victory takes priority over earlier quest worries');
c.wonAll=false;c.brambleQuest=0;c.MAPID='world';c.fishingPole=false;c.odoRodReferral=false;
const odo={n:'Odo',x:20,y:0,d:['Odo: Morning.'],dd:['Odo: Mind that tail near my line.'],dd2:['Odo: Does your dragon like fish?']};
c.beginNpcTalk(odo,true);assert.match(c.sayNpc.said[0],/dragon/);assert(c.sayNpc.said.some(l=>/grandson Calder/.test(l)));
assert(c.odoRodReferral);c.beginNpcTalk(odo,true);assert.equal(c.sayNpc.said,odo.dd2,'Repeat general greeting does not restart the fishing referral');
c.openNpcTopics(odo);c.ask.opts.find(o=>o.n==='Where can I get a fishing rod?').go();
assert.match(c.sayNpc.said[0],/first camp/);assert(!c.sayNpc.said.some(l=>/grandson|dragon/.test(l)),'Specific follow-up gives directions without repeating introductions');
const calder={n:'Calder',x:20,y:0};
assert.match(c.fishingRodDialogue('Calder',calder)[0],/Odo sent me/);
assert(c.fishingRodDialogue('Calder',calder).some(l=>/dragon/.test(l)));
c.odoRodReferral=false;assert.match(c.fishingRodDialogue('Calder',calder)[0],/dragon walk into my camp/);
c.dragon.x=500;
for(const name of ['Odo','Calder'])assert(!c.fishingRodDialogue(name,{n:name,x:20,y:0}).some(l=>/dragon/.test(l)),'Absent companion does not trigger a sighting');
console.log('PASS: repeated topic selections preserve personal exchanges, general greetings react to presence/progress, and fishing referrals remember prior conversations.');

// Check the rendered menu and its callbacks across the whole authored cast at
// each story stage, rather than testing only the list of topic titles.
Object.assign(c,{fishingPole:true,odoRodReferral:true,templeCompass:{owned:true,meatGiven:true},quest:5,brambleQuest:0});
for(const hatched of [false,true])for(const victory of [false,true]){
 c.hatched=hatched;c.wonAll=victory;
 for(const [name,profile] of Object.entries(stories)){
  c.MAPID='world';
  if(name==='King Halvard'){
   assert(!c.openNpcTopics({n:name}),'King uses the scripted Thornwell audience, not the generic town menu');
   continue;
  }
  const npc={n:name,x:20,y:0,d:[name+': Morning.'],dd:[name+': Your companion is welcome.'],dv:[name+': Peace at last.']};
  assert(c.openNpcTopics(npc),name+' menu opens');
  const labels=c.ask.opts.map(o=>o.n);
  assert(!labels.includes('A dragon on the road')&&!labels.includes('How are things?'),name+' has no duplicate greeting topic');
  const label=c.libraryQuestHint(npc)?.title||(name==='King Halvard'?'I came for the stolen eggs.':'Hello!');
  assert.equal(labels.filter(l=>l===label).length,1,name+' has one greeting/quest entry');
  if(name==='King Halvard')continue;
  c.ask.opts.find(o=>o.n===label).go();
  assert.equal(c.sayNpc,npc,name+' greeting addresses the selected NPC');
  if(c.libraryQuestHint(npc))assert.equal(c.sayNpc.said,c.libraryQuestHint(npc).lines,'Pupils retain direct quest guidance');
  if(name==='Nan Ferrow'&&!hatched)continue;
  for(const [title,first,question,last] of profile){
   c.openNpcTopics(npc);c.ask.opts.find(o=>o.n===title).go();
   assert.deepEqual(Array.from(c.scene.lines),[name+': '+first,'Corin: '+question,name+': '+last],name+' personal topic stays distinct from greeting');
  }
 }
}
console.log('PASS: every authored NPC menu has one contextual greeting or quest entry, no duplicate dragon option, and distinct personal-topic callbacks across story stages.');
