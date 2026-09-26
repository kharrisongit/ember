import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const c=vm.createContext({hasDragon:()=>c.hatched,hatched:false,wonAll:false,
 templeCompass:{owned:false},glassShield:true,smithUpgrade:true,hasSword:()=>true,charm:{edge:true},breathHas:{},
 canCamperGiveFishingPole:n=>n.n==='Calder'&&!c.fishingPole,fishingPole:false,odoRodReferral:false,
 npcContextDialogue:n=>n.dd||n.d});
vm.runInContext(read('js/npc-conversations.js'),c);
const stories=vm.runInContext('NPC_STORIES',c),cast=JSON.parse(read('assets/portraits/cast.json'));
for(const n of cast.filter(n=>!['Corin','Aurelius','Bramble'].includes(n.name))){
 assert(stories[n.name],n.name+' has a personal story');assert.equal(stories[n.name].length,2);
 for(const topic of stories[n.name])assert.equal(topic.length,4,n.name+' has a title and a complete exchange');
}
const replies=Object.values(stories).flatMap(topics=>topics.map(t=>t[1]));assert.equal(new Set(replies).size,replies.length,'no repeated opening stories');
const nan={n:'Nan Ferrow',d:['Hello'],dd:['Aurelius'],dv:['Home again']};
assert(!c.npcStoryGiftPending(nan),'Nan has no gift before hatching');c.hatched=true;assert(c.npcStoryGiftPending(nan));
c.templeCompass.owned=true;assert(!c.npcStoryGiftPending(nan));
assert(c.npcStoryTopics(nan).some(t=>t.title==="Dad's compass"));assert(!c.npcStoryTopics(nan).some(t=>t.title==='Life after Halvard'));
c.wonAll=true;assert(c.npcStoryTopics(nan).some(t=>t.title==='Life after Halvard'));
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

// Special gifts and referrals retain their instructions while noticing the dragon.
c.hatched=true;c.dragonHere=()=>true;c.dragon={on:true,x:0,y:0};c.MAPID='world';c.mounted=false;
for(const name of ['Odo','Calder','Sela','Dunstan','Maelis','Sverre']){
 const lines=name==='Odo'||name==='Calder'?c.fishingRodDialogue(name):[name+': Here is the gift.'];
 const aware=c.npcDragonAwareDialogue({n:name,x:20,y:0},lines);
 assert(aware.length>lines.length,name+' notices the visible dragon');
 assert(/dragon|scales/i.test(aware[0]));
 assert.deepEqual(Array.from(aware.slice(1)),Array.from(lines),'Quest instructions remain intact');
 assert.equal(c.npcDragonAwareDialogue({n:name,x:20,y:0},aware),aware,'No duplicate reaction');
}
const topic=['Wren: This charm should help.'];
assert.match(c.npcDragonAwareDialogue({n:'Wren',x:20,y:0,dragonNear:['That dragon has a strong heartbeat.']},topic)[0],/^Wren:/);
c.dragon.x=500;assert.equal(c.npcDragonAwareDialogue({n:'Odo',x:20,y:0},topic),topic,'No invented sighting of an absent dragon');
c.dragon.x=0;c.hatched=false;assert.equal(c.npcDragonAwareDialogue({n:'Odo',x:20,y:0},topic),topic,'No dragon reaction before hatching');
const compass=read('js/temple-compass.js');assert.match(compass,/is that a dragon behind you/);assert.match(compass,/FATHER_COMPASS_GIFT.slice\(1\)/,'Nan’s automatic farewell includes the same reaction');
console.log('PASS: gifts, referrals and personal topics acknowledge the visible dragon without dropping quest lines or duplicating reactions.');
