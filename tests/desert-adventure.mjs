import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{document:gameDom().document});
run(`EmberFriendship.restore({tutorialSeen:true});mode='play';gameplayStarted=true;quest=Q.DONE;foesHeld=false;window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEncounterCard=undefined;
DesertAdventure.installWorld(W.maps.world);loadMap('school2');scene=null;bossScene=null;fadeDir=0;`);
function finish(){for(let i=0;run('!!scene')&&i<20;i++)run('typeAll();scene.t=.3;advanceScene();');assert(!run('!!scene'));}
function scholarOffer(){
 run(`askShut();scene=null;sayNpc=null;openNpcTopics(npcs.find(n=>n.n==='Scholar Ilyan'));EmberConversationFlow.openChat();askPick=ask.opts.findIndex(o=>o.n==='A relic beneath the pyramid');askTake();typeAll();scene.t=1;EmberConversationFlow.advance();`);
 assert(run('ask.replyChoices'),'School scholar actually offers the expedition through authored replies');
}
function scholarReply(index){run(`askPick=${index};askTake();typeAll();scene.t=1;EmberConversationFlow.advance();typeAll();scene.t=1;EmberConversationFlow.advance();`);}
scholarOffer();scholarReply(3);assert(!run('DesertAdventure.accepted()'),'Declining leaves quest available');
scholarOffer();scholarReply(1);run('askShut();scene=null;sayNpc=null');
assert.equal(run('DesertAdventure.capture()'),'school');
assert.equal(run('atlasQuestKind(atlasQuestOptions().find(q=>q.id==="pyramid"))'),'side');
assert(run('atlasJournalAllowed("pyramid")'),'Accepted expedition is recorded before the desert road opens');
assert(!run('atlasTrack("pyramid")'),'Compass cannot send the player past the closed desert road');
assert.equal(run('atlasTrackedQuest'),'main');
run('smithUpgrade=1;charm.edge=true;breathHas.lightning=true');
assert(run('atlasTrack("pyramid")'),'Expedition can be tracked after its travel requirements are met');
assert.equal(run('atlasTrackedQuest'),'pyramid');
assert.equal(run('atlasQuestTarget(atlasQuestOptions().find(q=>q.id==="pyramid")).map'),'pyramid_queen');
run(`beginNpcTalk(W.maps.world.npcs.find(n=>n.n==='Sahir'));`);assert(run('ask.npcConversation==="Sahir"'),'Town giver has a complete conversation');assert(run('!DialogueRenewal.pyramid({n:"Sahir"}).questUnlock'),'Town giver does not offer a duplicate');
assert.equal(run('DesertAdventure.capture()'),'school');
run('saveToSlot(1,true);DesertAdventure.restore(null);');assert(run('loadGame(1)'));assert.equal(run('DesertAdventure.capture()'),'school');
run(`localStorage.setItem(saveKey(2),JSON.stringify({...captureSave(),pyramidQuest:null,houseLootTaken:[],templeDefeated:{}}));`);
assert(run('loadGame(2)'));assert(!run('DesertAdventure.accepted()'));
run(`askShut();scene=null;sayNpc=null;beginNpcTalk(W.maps.world.npcs.find(n=>n.n==='Sahir'));EmberConversationFlow.openChat();askPick=ask.opts.findIndex(o=>o.n==='A relic beneath the pyramid');askTake();typeAll();scene.t=1;EmberConversationFlow.advance();`);scholarReply(1);run('askShut();scene=null;sayNpc=null');assert.equal(run('DesertAdventure.capture()'),'sandspire');
assert(!run('DesertAdventure.accept("school")'),'Source remains whichever giver was accepted first');
console.log('PASS: school and Sandspire offers, decline/reoffer, no duplicates, side-quest journal and save-slot isolation.');
run(`loadMap('pyramid_queen');scene=null;bossScene=null;ovl=null;fadeDir=0;P.x=216;P.y=128;P.act=null;
houseLootTaken.add('pyramid_queen:loot:0');const rewardGold=gold;tryHouseLootChest();`);
assert(!run('DesertAdventure.owned()'));assert.equal(run('gold'),run('rewardGold'),'Chest remains locked before victory');
assert(!run('MD.roomActors.some(a=>a.houseLoot?.item==="emberheart")'),'No preplaced Queen reward');
run(`const queenRewardBoss=foes.find(f=>f.kind==='spiderqueen');
Object.assign(queenRewardBoss,{x:176,y:184,hp:0,st:'dead',t:0});markBossGone(queenRewardBoss);
stepFoes(1);P.x=176;P.y=184;tryHouseLootChest();`);
assert(run('DesertAdventure.owned()'),'Legacy ordinary chest claim cannot consume the new relic');
assert.equal(run('gold-rewardGold'),160);
assert(run('atlasQuestComplete("pyramid")&&atlasCompletedEntries().some(q=>q.id==="pyramid")'));
assert(run('BAG.find(it=>it.key==="emberheart").has()&&!USABLE.emberheart'),'Relic is carried, not equipped or consumed');
const savedGold=run('gold');run('tryHouseLootChest();');assert.equal(run('gold'),savedGold,'Reward grants once');
function damage(el,owned){
 run(`houseLootTaken.${owned?'add':'delete'}(DesertAdventure.rewardId);foes=[{kind:'spiderqueen',x:144,y:168,hp:100,st:'idle',t:0}];
 breath={el:${JSON.stringify(el)},t:.2,x:120,y:152,vx:1,vy:0,distance:0,speed:160,hit:0,impactT:0};stepBreath(.05);`);
 return 100-run('foes[0].hp');
}
assert.equal(damage('fire',true),damage('fire',false)*1.25,'Actual projectile damage receives exactly 25% Fire boost');
assert.equal(damage('ice',true),damage('ice',false),'Other elements retain their damage');
run(`houseLootTaken.add(DesertAdventure.rewardId);saveToSlot(1,true);houseLootTaken.clear();DesertAdventure.restore(null);`);
assert(run('loadGame(1)'));assert(run('DesertAdventure.owned()'));assert.equal(run('DesertAdventure.capture()'),'sandspire');
run(`localStorage.setItem(saveKey(2),JSON.stringify({...captureSave(),houseLootTaken:[],pyramidQuest:null,templeDefeated:{}}));`);
assert(run('loadGame(2)'));assert(!run('DesertAdventure.owned()||DesertAdventure.accepted()'));
console.log('PASS: victory lock, old-save chest migration, one-time passive reward, real Fire damage, other elements and persistence.');
const kinds=['mummy'];
assert(run('Object.values(W.maps).filter(m=>m.pyramid).every(m=>m.foes.every(f=>f.k==="mummy"||f.k==="spiderqueen"))'));
assert(run('W.maps.world.foes.filter(f=>f.desertEncounter).every(f=>/^reptile[23]?$/.test(f.k))'));
assert(run('Object.values(W.maps).filter(m=>m.pyramid).every(m=>m.roomActors.every(a=>!/obelisk|rug/.test(a.spr)))'));
assert(!run('W.maps.sandspire_court'));
assert(run('W.maps.world.roomActors.some(a=>a.spr==="dd_rug1")'),'Original town furnishings remain');
assert(run('!BESTIARY.some(e=>/^desert(archer|lancer)/.test(e.k))'));
for(const kind of kinds){
 assert(run(`FOE[${JSON.stringify(kind)}]&&BESTIARY.some(e=>e.k===${JSON.stringify(kind)})`));
 assert(run(`Object.values(W.maps).filter(m=>m.pyramid).some(m=>m.foes.some(f=>f.k===${JSON.stringify(kind)}))`));
 for(const action of ['idle','walk','atk','hurt','die'])for(const dir of ['d','u','e','w'])assert(run(`!!SPR[FOE_ART[${JSON.stringify(kind)}]+'_${action}_${dir}']`));
}
assert.equal(run('W.maps.world.features.filter(f=>f.pyramidApproach).length'),5);
assert.equal(run('W.maps.world.foes.filter(f=>f.desertEncounter).length'),15);
run('DesertAdventure.installWorld(W.maps.world);');assert.equal(run('W.maps.world.features.filter(f=>f.pyramidApproach).length'),5);
const usage=JSON.parse(fs.readFileSync('assets/interiors/desert-pyramid/pack-usage.json','utf8'));
run('DragonChapels.installWorld(W.maps.world);');
const used=new Set(JSON.parse(run('JSON.stringify(Object.values(W.maps).flatMap(m=>[...(m.roomActors||[]).map(a=>a.spr),...Object.values(m.desertHouseSprites||{})]))')));
for(const refs of Object.values(usage))for(const ref of refs)if(ref==='dd_mummy')assert(!used.has(ref),'Stationary mummy dressing is retired');else if(ref.startsWith('dd_'))assert(used.has(ref),'Native asset placed: '+ref);
assert.equal(Object.keys(usage).length,92);
assert(!run('W.maps.world.doors.some(d=>d.to==="sandspire_court")'));
assert.equal(run('W.maps.world.roomActors.filter(a=>a.spr==="dd_fall1").length'),0);
console.log('PASS: five reptile approach arenas, mummies confined to the pyramid, no pyramid rugs or obelisks, original town preserved, current bestiary, no added oasis waterfall.');
