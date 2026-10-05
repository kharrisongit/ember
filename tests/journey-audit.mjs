import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
context.assert=assert;
await run('loadPublishedEditorLayouts()');
run(`
quest=Q.DONE;loadMap('world');
prepareHollybeckVillagers(W.maps.world,'world');Frosthorn.installWorld(W.maps.world);IceMoth.installWorld(W.maps.world);
MAPID='world';MD=W.maps.world;npcs=MD.npcs;features=MD.features;P.x=0;P.y=0;
const checked=new Set();
function checkObjective(q){
 assert(q&&q.title&&q.detail&&q.place,'Readable objective');
 const target=atlasQuestTarget(q);assert(target&&W.maps[target.map]&&Number.isFinite(target.x)&&Number.isFinite(target.y),q.id+' has a real target');
 assert(compassQuestRoute(W.maps,'world',target),q.id+' has a connected map route');
 assert(atlasQuestStages(q).length,q.id+' has completion instructions');checked.add(q.questId||q.id);
}
for(let i=0;i<Q.DONE;i++){quest=i;checkObjective(atlasJourneyObjective());}
quest=Q.DONE;dragonIntroDone=true;smithUpgrade=true;charm.edge=true;glassShield=true;wonAll=false;
for(let i=1;i<=7;i++){thornwellRoyal.stage=i;brambleQuest=i===1?1:3;checkObjective(atlasJourneyObjective());}
for(const key of ['fishing','bramble-owner','smith','shield','lantern','graveyard','trials','mines','gift:Maelis','gift:The Shroom King'])dragonBanterSeen.add('learned:'+key);
breathHas.lightning=true;breathHas.ice=true;breathHas.shadow=false;
odoRodReferral=true;fishingPole=false;glassShield=false;charm.lamp=false;charm.flame=false;charm.wake=false;charm.ward=false;charm.spore=false;
DesertAdventure.restore('school');DragonChapels.restore(false,{known:true,found:false});
HollybeckRescue.learn();houseLootTaken.add('quest:frosthorn:known');
for(const q of atlasQuestOptions())checkObjective(q);
assert(checked.has('gift:ward')&&checked.has('gift:spore'),'Heard gift leads are trackable');
// Unknown mines lead asks a local miner; learning the lantern lead creates the travel step.
dragonBanterSeen.delete('learned:lantern');
let mine=atlasQuestOptions().find(q=>q.id==='deep-mines');assert.equal(mine.place,'Forgewick');assert.deepEqual(atlasQuestTarget(mine),atlasNpcTarget(['Toft']));
const lead=ForgewickDialogue.topics({n:'Toft'}).find(t=>t.title==='Light for the deep mines');assert(lead);
rememberDragonKnowledge('Toft',lead.lines.join(' '),false);
mine=atlasQuestOptions().find(q=>q.id==='deep-mines');assert.equal(mine.place,'Hollybeck');assert.deepEqual(atlasQuestTarget(mine),atlasNpcTarget(['Sverre','Torvald']));
charm.lamp=true;assert.equal(atlasQuestTarget(mine).map,'mine5');charm.flame=true;assert(atlasQuestComplete('deep-mines'));
// Church discovery and the blessing are distinct actions.
DragonChapels.restore(false,{known:true,found:true});assert(atlasQuestComplete('desert-church'));
checkObjective(atlasQuestOptions().find(q=>q.id==='sky-blessing'));assert(!atlasQuestComplete('sky-blessing'));
DragonChapels.restore(true,{known:true,found:true});assert(atlasQuestComplete('sky-blessing'));
// All three reward objectives follow saved death positions, not old fixed chest coordinates.
for(const [kind,map,x,y]of [['spiderqueen','pyramid_queen',177,183],['frosthorn','world',40737,435],['icemoth','world',37519,2701]]){
 MAPID=map;MD=W.maps[map];BossRewardChests.defeated({kind,x,y});
 if(kind==='spiderqueen'){DesertAdventure.restore(null);bossGone['pyramid_queen:0']=true;}else if(kind==='frosthorn')Frosthorn.defeated();else IceMoth.defeated();
 const id={spiderqueen:'pyramid',frosthorn:'frosthorn',icemoth:'soulwing'}[kind];
 const q=atlasQuestOptions().find(q=>q.id===id);checkObjective(q);assert.deepEqual(atlasQuestTarget(q),{map,x,y});assert(!atlasQuestComplete(id));
 const ledger=BossRewardChests.capture();BossRewardChests.restore(ledger);assert.deepEqual(atlasQuestTarget(q),{map,x,y});
 houseLootTaken.add({spiderqueen:DesertAdventure.rewardId,frosthorn:Frosthorn.rewardId,icemoth:IceMoth.rewardId}[kind]);assert(atlasQuestComplete(id));
}
MAPID='world';MD=W.maps.world;npcs=MD.npcs;
// The rescue still needs the traveler conversation even after taking the moth reward.
assert(!atlasQuestComplete('winter-rescue'));checkObjective(atlasQuestOptions().find(q=>q.id==='winter-rescue'));
assert.equal(atlasQuestTarget({id:'winter-rescue'}).y,135*16);
// The final passage must use its internal route instead of returning through the entrance.
MAPID='passage';MD=W.maps.passage;const cross=FrostcragJourney.target();assert.equal(cross.map,'passage3');
const route=compassQuestRoute(W.maps,MAPID,cross),exit=MD.doors.find(d=>d.to==='world');
assert(route);assert(Math.abs(route.y-exit.y*TS)>100,'Needle leads into the mountain, not back out');
for(const [id,m]of Object.entries(W.maps).filter(([id,m])=>m.mountainPassage))assert(compassQuestRoute(W.maps,id,cross),'Every passage branch reconnects: '+id);
// Trials are introduced after the ending even without an earlier optional conversation.
MAPID='world';MD=W.maps.world;wonAll=true;cinderSeal=false;trialSealPlaced=false;trialWins=0;dragonBanterSeen.delete('learned:trials');
checkObjective(atlasQuestOptions().find(q=>q.id==='trials'));assert.equal(atlasQuestTarget({id:'trials'}).map,'witchmoor');
cinderSeal=true;assert.equal(atlasQuestTarget({id:'trials'}).map,'royal_seal');
trialSealPlaced=true;assert.equal(atlasQuestTarget({id:'trials'}).map,'cinderhold');trialWins=1;assert(atlasQuestComplete('trials'));
// Distant optional leads explain the same road prerequisites as the main story.
wonAll=false;breathHas.lightning=false;smithUpgrade=false;
assert(atlasQuestTrackLock({id:'pyramid'}));assert(atlasQuestTrackLock({id:'shield'}));
breathHas.lightning=true;smithUpgrade=true;charm.edge=true;breathHas.ice=false;
assert(atlasQuestTrackLock({id:'graveyard'}));assert(atlasQuestTrackLock({id:'gift:ward'}));
breathHas.ice=true;assert.equal(atlasQuestTrackLock({id:'graveyard'}),'');
assert(atlasQuestOptions().every(q=>atlasJournalAllowed(q.questId||q.id)));
const saved=captureQuestJournal();restoreQuestJournal(saved);assert(atlasCompletedEntries().some(q=>q.id==='deep-mines'));
assert(checked.size>=12,'Audit covers story, travel, gifts, and optional quests');
`);
console.log('PASS: opening, royal stages, all active quest destinations, local mine referral/lantern/return, blessing, three moving reward chests and reloads, rescue handoff, every mountain branch, postgame seal route, gift leads, road locks and completion history.');
