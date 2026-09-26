import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const c=vm.createContext({hasDragon:()=>c.hatched,hatched:false,wonAll:false,
 templeCompass:{owned:false},glassShield:true,smithUpgrade:true,hasSword:()=>true,charm:{edge:true},breathHas:{},
 canCamperGiveFishingPole:n=>n.n==='Calder'&&!c.fishingPole,fishingPole:false,
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
assert(!c.npcStoryGiftPending({n:'Odo'}));assert(c.npcStoryGiftPending({n:'Calder'}));c.fishingPole=true;assert(!c.npcStoryGiftPending({n:'Calder'}));
const stockSource=read('js/generated/game-part-2.js').split('const STOCK = {')[1].split('\n};')[0];
c.STOCK=Object.fromEntries([...stockSource.matchAll(/^  (\w+):/gm)].map(m=>[m[1],{}]));
vm.runInContext(read('js/merchant-shop.js'),c);
assert.deepEqual(Array.from(c.merchantStock({n:'Wren'})),['potion','birdMeat','salt']);
for(const name of ['Toft','Idris','Nerissa','Astrid'])assert.deepEqual(Array.from(c.merchantStock({n:name})),Object.keys(c.STOCK).filter(k=>k!=='bomb'));
assert.deepEqual(Array.from(c.merchantStock({n:'Maelis'})),['bomb']);
console.log('PASS: all speaking portraits have distinct personal stories, quest gifts precede topics, Nan and victory topics respect progress, and merchant stock follows town/exclusivity rules.');
