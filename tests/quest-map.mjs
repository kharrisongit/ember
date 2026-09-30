import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const game=fs.readFileSync(new URL('../js/generated/game-part-2.js',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../js/quest-map.js',import.meta.url),'utf8').replace(/bindQuestAtlas\(\);\s*$/,'');
const c=vm.createContext({console,Map,Set});
vm.runInContext(`const ATLAS_LOCATIONS=${game.match(/const ATLAS_LOCATIONS=(.*);/)[1]};
const Q={DONE:9};let quest=0,wonAll=false,brambleQuest=0,smithUpgrade=false,glassShield=false,odoRodReferral=false,fishingPole=false,cinderSeal=false,trialSealPlaced=false;
const charm={},breathHas={lightning:false,ice:false,shadow:false},learned=new Set(),gifts=[];
const TS=16,W={maps:{world:{features:[]}}};function dragonLearned(k){return learned.has(k)}function dragonGiftLeads(){return gifts}`,c);
vm.runInContext(source,c);
for(let stage=0;stage<10;stage++){
 const q=vm.runInContext(`quest=${stage};atlasMainObjective()`,c);
 assert(q.title&&q.detail&&q.place);
 assert(vm.runInContext(`ATLAS_LOCATIONS.some(p=>p[0]===atlasMainObjective().place)`,c));
}
assert.equal(vm.runInContext('atlasQuestOptions().length',c),1,'No undiscovered side quests leaked');
vm.runInContext("learned.add('fishing')",c);
assert(vm.runInContext("atlasQuestOptions().some(q=>q.id==='fishing'&&q.place==='Route 1')",c));
vm.runInContext('fishingPole=true',c);
assert(!vm.runInContext("atlasQuestOptions().some(q=>q.id==='fishing')",c));
vm.runInContext("learned.add('bramble');brambleQuest=1",c);
assert(vm.runInContext("atlasQuestOptions().some(q=>(q.questId||q.id)==='bramble')",c));
vm.runInContext('brambleQuest=2',c);
assert(!vm.runInContext("atlasQuestOptions().some(q=>(q.questId||q.id)==='bramble')",c));
vm.runInContext("W.maps.world.title='Millwood Valley';W.maps.world.features=[{kind:'area',label:'Sandspire',x0:100,y0:20,x1:200,y1:80}]",c);
assert.equal(vm.runInContext("atlasPlaceFor(W.maps.world,{x:1600,y:640})",c),'Sandspire','World title must not misplace every quest in Millwood');
vm.runInContext('smithUpgrade=true;charm.edge=true;glassShield=true',c);
assert.equal(vm.runInContext('atlasMainObjective().place',c),'Forgewick','Unheard temple destinations stay hidden');
assert(!vm.runInContext('atlasMilestoneData().some(([name,done])=>!done&&/Ice|Shadow|Halvard/.test(name))',c),'Milestones do not leak future chapters');
vm.runInContext("learned.add('temple:Forgewick')",c);
assert.equal(vm.runInContext('atlasMainObjective().place',c),'Forgewick Temple');
vm.runInContext("breathHas.lightning=true;learned.add('temple:Sandspire');learned.add('temple:Hollybeck')",c);
assert.equal(vm.runInContext('atlasMainObjective().place',c),'Sandspire Temple');
vm.runInContext('breathHas.ice=true',c);
assert.equal(vm.runInContext('atlasMainObjective().place',c),'Hollybeck Temple');
vm.runInContext('breathHas.shadow=true',c);
assert.equal(vm.runInContext('atlasMainObjective().place',c),'Cinderhold Castle');
console.log('PASS: opening and journey destinations, learned-only side quests, completion removal and world gift locations.');

vm.runInContext("learned.add('lantern');learned.add('graveyard')",c);
assert(vm.runInContext("atlasQuestOptions().some(q=>q.id==='gift:lamp'&&q.place==='Hollybeck'&&/Sverre/.test(q.detail))",c));
assert(vm.runInContext("atlasQuestOptions().some(q=>q.id==='graveyard'&&q.place==='Hollybeck Graveyard'&&/spirits/.test(q.detail))",c));
vm.runInContext('charm.lamp=true;charm.wake=true',c);
assert(!vm.runInContext("atlasQuestOptions().some(q=>q.id==='gift:lamp'||q.id==='graveyard')",c));

vm.runInContext("breathHas.lightning=false;breathHas.ice=false;breathHas.shadow=false;learned.add('smith');learned.add('shield');learned.add('trials');trialWins=0",c);
for(const stage of ['temples','smith','shield','bramble']){
 if(stage==='smith')vm.runInContext('smithUpgrade=false',c);
 if(stage==='shield')vm.runInContext('smithUpgrade=true;glassShield=false',c);
 if(stage==='bramble')vm.runInContext('brambleQuest=1',c);
 const quests=vm.runInContext('atlasQuestOptions()',c),ids=quests.map(q=>q.questId||q.id);
 assert.equal(ids.length,new Set(ids).size,'Each real objective appears once: '+stage);
}
vm.runInContext('trialWins=1',c);
assert(!vm.runInContext("atlasQuestOptions().some(q=>q.id==='trials')",c),'Completed trials are not still active');
