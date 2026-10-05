import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
context.assert=assert;
run(`
quest=Q.DONE;brambleQuest=3;thornwellRoyal.stage=7;dragonIntroDone=true;
smithUpgrade=true;charm.edge=true;glassShield=true;wonAll=0;
dragonBanterSeen.clear();atlasJourneyVisits.clear();for(const k of Object.keys(bossGone))delete bossGone[k];MAPID='world';MD=W.maps.world;P.x=0;P.y=0;
for(const town of ['Forgewick','Sandspire','Hollybeck']){
 const t=ATLAS_TEMPLE_JOURNEYS[town];breathHas[t.element]=false;
 assert.equal(atlasJourneyObjective().title,'Travel to '+town);
 let q=atlasTempleObjective(town);
 assert.equal(q.place,town);assert.equal(atlasQuestTarget(q).map,'world');
 const area=W.maps.world.features.find(f=>f.kind==='area'&&(f.label||f.place)===town);
 MAPID='world';MD=W.maps.world;features=MD.features;P.x=(area.x0+area.x1)/2*TS;P.y=(area.y0+area.y1)/2*TS;
 assert.equal(atlasTempleObjective(town).journeyStage,'entrance','Arrival changes compass stage');
 const saved=captureQuestJournal();atlasJourneyVisits.clear();P.x=0;P.y=0;restoreQuestJournal(saved);
 assert.equal(atlasTempleObjective(town).journeyStage,'entrance','Town visit survives leaving and save reload');
 assert.equal(atlasQuestTarget(q).map,t.entry);
 MAPID=t.entry;MD=W.maps[MAPID];
 assert.equal(atlasTempleObjective(town).journeyStage,'golems');
 const guards=atlasTempleGuardians(town);assert(guards.length>=2,'Real authored golems are required');
 assert.equal(atlasQuestTarget(q).map,guards[0].map);
 bossGone[guards[0].map+':'+guards[0].i]=true;
 assert.equal(atlasTempleObjective(town).journeyStage,'golems','One guardian is not the whole fight');
 for(const g of guards)bossGone[g.map+':'+g.i]=true;
 assert.equal(atlasTempleObjective(town).journeyStage,'heartstone');
 assert.equal(atlasQuestComplete(q.id),false,'Victory does not claim the stone');
 assert.equal(atlasQuestTarget(q).map,CHESTS.find(c=>c.gift===t.element).map);
 assert.equal(atlasQuestStages(q).at(-2)[1],true);assert.equal(atlasQuestStages(q).at(-1)[1],false);
 breathHas[t.element]=true;assert(atlasQuestComplete(q.id));
 MAPID='world';MD=W.maps.world;P.x=0;P.y=0;
}
breathHas.ice=false;breathHas.shadow=false;smithUpgrade=false;charm.edge=false;dragonBanterSeen.clear();
assert.equal(atlasJourneyObjective().questId,'smith','Required smith lead does not depend on asking an NPC first');
assert.equal(atlasTempleObjective('Sandspire').journeyStage,'smith','Explicit temple tracking also respects the blocked road');
assert.deepEqual(atlasQuestTarget({id:'temple:Sandspire'}),atlasNpcTarget(['Dunstan']));
smithUpgrade=true;assert.equal(atlasJourneyObjective().title,'Finish with Dunstan');
charm.edge=true;assert.equal(atlasJourneyObjective().questId,'temple:Sandspire');
// Existing saves with temple combat progress do not get sent back to visit town.
atlasJourneyVisits.clear();assert(atlasTempleProgress('Sandspire').entered);
`);
console.log('PASS: all three town arrivals, saved visits, temple entrances, complete golem fights, separate chest claims, old-save progress, and mandatory road equipment.');
