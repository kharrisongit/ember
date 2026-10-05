import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){}});
const value=s=>JSON.parse(run('JSON.stringify('+s+')'));
run("prepareHollybeckVillagers(W.maps.world,'world');MAPID='world';MD=W.maps.world;npcs=MD.npcs;quest=Q.DONE;brambleQuest=3;restoreThornwellRoyal({stage:7});smithUpgrade=true;charm.edge=true;glassShield=true;");
for(const [town,gift]of [['Forgewick','lightning'],['Sandspire','ice'],['Hollybeck','shadow']]){
 run(`atlasJourneyVisits.add('${town}');atlasJourneyVisits.add('${town} Temple');for(const g of atlasTempleGuardians('${town}'))bossGone[g.map+':'+g.i]=true;`);
 const q={id:'temple:'+town,place:town+' Temple'};const target=value('atlasQuestTarget('+JSON.stringify(q)+')');
 assert.equal(run('atlasQuestKind('+JSON.stringify(q)+')'),'main');
 assert.equal(target.map,run(`CHESTS.find(c=>c.gift==='${gift}').map`));
 const guide=value('compassQuestRoute(W.maps,"world",'+JSON.stringify(target)+')');assert(guide&&Number.isFinite(guide.x));
 const entry=value(`W.maps.world.doors.find(d=>d.to===${JSON.stringify({Forgewick:'tp1',Sandspire:'ds1',Hollybeck:'sn1'}[town])})`);
 assert(Math.hypot(guide.x-entry.x*16,guide.y-entry.y*16)<160,'World needle points to the correct temple entrance');
 const inside=value(`compassQuestRoute(W.maps,'${target.map}',${JSON.stringify(target)})`);assert.equal(inside.heartstone,true);
}
for(const [id,name]of [['fishing','Calder'],['smith','Dunstan'],['shield','Sela'],['gift:lamp','Sverre']]){
 const t=value('atlasQuestTarget('+JSON.stringify({id,place:id==='fishing'?'Route 1':'Forgewick'})+')');assert(t,id+' has a destination');
 const n=value(`W.maps['${t.map}'].npcs.find(n=>n.n==='${name}')`);assert.equal(t.x,n.x);assert.equal(t.y,n.y);
}
run("brambleQuest=1;thornwellRoyal.stage=1;");
assert.equal(value("atlasQuestTarget({id:'bramble',place:'Thornwell'})").map,'world','Unknown owner points to town, not the tavern');
for(const q of value('atlasQuestOptions()').filter(q=>['main','bramble','thornwell-royals'].includes(q.id))){
 assert.doesNotMatch(q.detail,/Rowan|Copper Cup|tavern/i,'The journal does not reveal the owner');
 assert.equal(value('atlasQuestTarget('+JSON.stringify(q)+')').map,'world');
}
run("rememberDragonKnowledge('Orin','Rowan is in the Copper Cup tavern.',false)");
assert.equal(value("atlasQuestTarget({id:'bramble',place:'Thornwell'})").map,'tavern','A learned clue reveals the destination');
assert.match(run('atlasJourneyObjective().detail'),/Rowan/);
run("brambleQuest=3;thornwellRoyal.stage=7;");
run("atlasTrackedQuest='temple:Sandspire';breathHas.ice=true;");
assert(value('compassSelectedTarget()'));assert.equal(run('atlasTrackedQuest'),'main','Completed target falls back to main quest');
run('atlasCompassTutorialSeen=true');const journal=value('captureQuestJournal()');run('restoreQuestJournal(null)');assert(!run('atlasCompassTutorialSeen'));
run('restoreQuestJournal('+JSON.stringify(journal)+')');assert(run('atlasCompassTutorialSeen'));
const maps={a:{doors:[{to:'b',x:3,y:4}]},b:{doors:[{to:'a',x:1,y:1},{to:'c',x:8,y:4}]},c:{doors:[]}};
const route=value(`compassQuestRoute(${JSON.stringify(maps)},'a',{map:'c',x:100,y:100})`);assert.equal(route.x,56,'Interior route uses first connecting door');
console.log('PASS: main-quest temples, selected quest destinations, temple/interior/world guidance, completion fallback and saved map tutorial.');

// The early objective follows Hettie herself, including her movement by the cows.
run("quest=Q.ERRAND;bagOwned=true;templeCompass.mapGiven=true;templeCompass.owned=true;templeCompass.morningMet=true;atlasTrackedQuest='main';MAPID='world';npcs=W.maps.world.npcs;");
for(const stage of ['0','Q.ERRAND']){
 run('quest='+stage);
 const hettie=value("npcs.find(n=>n.n==='Hettie')");
 assert(hettie);
 const target=value('compassSelectedTarget()');
 assert.equal(target.map,'world');assert.equal(target.x,hettie.x);assert.equal(target.y,hettie.y);
 run("npcs.find(n=>n.n==='Hettie').y-=16");
 assert.equal(value('compassSelectedTarget()').y,hettie.y-16,'Tracks her live position');
}
