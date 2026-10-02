import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
const value=s=>JSON.parse(run('JSON.stringify('+s+')'));
run("prepareHollybeckVillagers(W.maps.world,'world');MAPID='world';MD=W.maps.world;npcs=MD.npcs;atlasTrackedQuest='main';templeCompass.morningMet=true;bagOwned=true;templeCompass.mapGiven=true;templeCompass.owned=true;");
const target=()=>value('compassSelectedTarget()');
for(const [stage,expected] of [['ABED','world'],['ERRAND','world'],['EGGS','world'],['KING','house22'],['ELDER','house22'],['NOISE','world'],['ARMED','world'],['FLED','world'],['CARRY','world']]){
 run('quest=Q.'+stage);const t=target();assert(t&&Number.isFinite(t.x)&&Number.isFinite(t.y),stage);assert.equal(t.map,expected,stage);
}
run('quest=Q.EGGS');let t=target();assert.equal(t.x,run("ITEMS.find(i=>i.key==='eggs').tx*TS+8"));assert.equal(t.y,run("ITEMS.find(i=>i.key==='eggs').ty*TS+16"));
run('P.x=488;P.y=6712');assert(t.x<run('P.x')&&t.y>run('P.y'),'Egg basket lies southwest of Hettie, not toward Millwood center');
run('quest=Q.FLED');assert.equal(target().y,run("ITEMS.find(i=>i.key==='egg').ty*TS+16"));
run('quest=Q.ABED;bagOwned=false;templeCompass.morningMet=false');assert.equal(target().map,'house26_bedroom');
run('bagOwned=true');assert.equal(target().map,'house26','Desk completion automatically tracks Nan');
run('templeCompass.morningMet=true');assert.equal(target().map,'world','Nan automatically tracks Hettie');
run('quest=Q.DONE;brambleQuest=3;thornwellRoyal.stage=2');assert.equal(target().map,'tavern');
run('thornwellRoyal.stage=4');assert.equal(target().map,'world','Leaving tavern tracks its exterior doorway');
run('thornwellRoyal.stage=6');t=target();assert.equal(t.x,run('thornwellForgefalls().x'));assert.equal(t.y,run('thornwellForgefalls().y'));
run("thornwellRoyal.stage=7;rememberDragonKnowledge('Maddock','We must overthrow King Halvard.',false);smithUpgrade=false;rememberDragonKnowledge('Maddock','Visit Dunstan the blacksmith in Forgewick.',false)");
// The broad journal title must never replace the next concrete story objective.
assert.deepEqual(target(),value('atlasQuestTarget(atlasJourneyObjective())'));
for(const [id,name]of [['fishing','Calder'],['smith','Dunstan'],['shield','Sela'],['gift:lamp','Sverre']]){
 c.q={id};const t=value('atlasQuestTarget(q)');assert(t,id);assert.equal(t.y,run(`W.maps[${JSON.stringify(t.map)}].npcs.find(n=>n.n===${JSON.stringify(name)}).y`));
}
for(const town of ['Forgewick','Sandspire','Hollybeck']){c.q={id:'temple:'+town,place:town+' Temple'};assert(value('atlasQuestTarget(q)').heartstone);}
for(const id of ['pyramid','desert-church','graveyard']){c.q={id};assert(value('atlasQuestTarget(q)'),id);}
run('cinderSeal=false');assert.equal(value("atlasQuestTarget({id:'trials'})").map,'witchmoor');
run('cinderSeal=true;trialSealPlaced=false');assert.equal(value("atlasQuestTarget({id:'trials'})").x,run('TRIAL_PEDESTAL.x'));
run('trialSealPlaced=true');assert.equal(value("atlasQuestTarget({id:'trials'})").x,run('THRONE_DEMON.x'));
run("atlasTrackedQuest='fishing';fishingPole=true");target();assert.equal(run('atlasTrackedQuest'),'main','Completed optional quest returns to automatic story tracking');
run("EmberQuestNotifications.restore({version:1,seen:[],pending:[]});EmberQuestNotifications.scan([{id:'main',title:'Story',detail:'next',place:'Millwood'},{id:'fishing',title:'Rod',detail:'rod',place:'Route 1'}])");assert.equal(value('EmberQuestNotifications.capture().pending').length,0,'Quest progression never queues popups');
console.log('PASS: all opening stages, automatic story targets, royal stages, gifts, temples, side quests, trials and silent progression.');
