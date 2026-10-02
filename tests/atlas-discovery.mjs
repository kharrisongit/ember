import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document});
const value=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`mode='play';gameplayStarted=true;quest=Q.ABED;loadMap('house26_bedroom');[P.x,P.y]=MD.spawn;
scene=null;fade=0;fadeDir=0;restoreQuestJournal();restoreFlightTravel();dragonBanterSeen.clear();
templeCompass.mapGiven=true;templeCompass.owned=true;atlasBegin();`);
assert.deepEqual(value('[...atlasDiscovered]'),['Millwood']);
assert.deepEqual(dom.element('atlasPlaces').children.map(b=>b.textContent),['Millwood']);
assert(dom.element('atlasFog').getAttribute('aria-hidden')==='true');
assert.equal(run('atlasNeighbor(1,0)'),-1,'Directional navigation cannot browse covered regions');
run("atlasSelectPlace(ATLAS_LOCATIONS.findIndex(p=>p[0]==='Spider Queen'))");
assert.equal(dom.element('atlasName').textContent,'Millwood','Direct hidden-area selection is blocked');
// An actual NPC referral reveals just its destination, with no free flight landing.
run("rememberDragonKnowledge('Dunstan','My brother Sela makes a glass shield in Sandspire.');atlasSyncJournal();atlasBuildPlaces();atlasRenderFog()");
assert(run("atlasPlaceKnown('Sandspire')"));assert(!run("atlasPlaceKnown('Coralmere')"));assert(!run("atlasPlaceKnown('Spider Queen')"));
assert(!run('flightVisits.Sandspire'),'Quest discovery never grants flight');
assert(run("flightUnavailable('Sandspire')").startsWith('Visit'));
// Reaching an area works even without ever opening the map, and is saved.
let saves=0;c.saveGame=()=>saves++;
run(`closeAtlas();MAPID='world';MD=W.maps.world;features=MD.features;var town=features.find(f=>f.kind==='area'&&atlasCanonical(f.label)==='Thornwell');P.x=(town.x0+town.x1)/2*TS;P.y=(town.y0+town.y1)/2*TS;`);
assert(run('rememberAtlasVisit()'));assert.equal(saves,1);assert(run("atlasPlaceKnown('Thornwell')"));
assert(!run('rememberAtlasVisit()'));assert.equal(saves,1,'No repeated save on an already known area');
run(`flightTravel={};P.x=0;P.y=0;var before=atlasDiscovered.size;rememberAtlasVisit();flightTravel=null;`);
assert.equal(run('atlasDiscovered.size'),run('before'),'Flight animation cannot discover intermediate regions');
// Later roads have no joins; their authored route IDs still reveal the road.
run("var originalFeatures=features;features=[{kind:'route',id:31,w:5,pts:[[100,100],[120,100]]}];P.x=110*TS;P.y=100*TS;");
assert.equal(run('atlasEnteredArea()'),'Route 3');
assert.equal(run('atlasCurrentArea()'),'Route 3','Current-area marker uses the same entered region');
run("features=[{kind:'route',id:99001,w:5,band:20,style:'swamp',pts:[[100,100],[120,100]]}];P.y=110*TS");
assert.equal(run('atlasEnteredArea()'),'Dreadmarsh');
run('features=originalFeatures');
// Save round-trip, slot isolation and migration from real visits.
const journal=value('captureQuestJournal()');c.journal=journal;
run("atlasRevealPlace('Coralmere');restoreQuestJournal(journal)");assert(!run("atlasPlaceKnown('Coralmere')"));assert(run("atlasPlaceKnown('Sandspire')"));
run("restoreQuestJournal();restoreFlightTravel({'Forgewick':[12000,1700]},['visited:Coralmere']);atlasSyncJournal()");
assert(run("atlasPlaceKnown('Forgewick')&&atlasPlaceKnown('Coralmere')"));assert(!run("atlasPlaceKnown('Ice Moth')"));
// Discovering a clearing doesn't disclose its guardian or prize. An encounter
// names the guardian; only opening the chest reveals its reward in the atlas.
run("atlasRevealPlace('Ice Moth');atlasPick=ATLAS_LOCATIONS.findIndex(p=>p[0]==='Ice Moth');atlasShowDetails()");
assert.equal(dom.element('atlasName').textContent,'Frozen Glade');assert(!/Ice Moth|Soulwing/.test(dom.element('atlasText').textContent));
run("MAPID='world';W.maps.world.features.push(IceMoth.arena);P.x=IceMoth.arena.x*TS;P.y=IceMoth.arena.y*TS;seenFoe.icemoth=1;atlasSyncJournal();atlasShowDetails()");
assert.equal(dom.element('atlasName').textContent,'Ice Moth');assert(!/Soulwing/.test(dom.element('atlasText').textContent));
const encountered=value('captureQuestJournal()');c.encountered=encountered;
run("restoreQuestJournal(encountered);delete seenFoe.icemoth;atlasShowDetails()");assert.equal(dom.element('atlasName').textContent,'Ice Moth','Encounter identity survives loading');
run("houseLootTaken.add(IceMoth.rewardId);atlasShowDetails()");assert.match(dom.element('atlasText').textContent,/Soulwing/);
run("houseLootTaken.add(IceMoth.spentId);atlasShowDetails()");assert.match(dom.element('atlasText').textContent,/Soulwing/,'Spent relic remains historical knowledge');
run("restoreQuestJournal();MAPID='house26_bedroom';houseLootTaken.clear();seenFoe.frosthorn=1;atlasSyncJournal()");
assert(!run("atlasPlaceKnown('Frosthorn')"),'Bestiary state left over from another slot cannot uncover a boss');
for(const name of ['Spider Queen','Frosthorn']){
 c.name=name;run("atlasRevealPlace(name);atlasPick=ATLAS_LOCATIONS.findIndex(p=>p[0]===name);atlasShowDetails()");
 assert(!/Emberheart|Frostheart|Soulwing|Spider Queen|Frosthorn/.test(dom.element('atlasText').textContent));
}
// Desk items sort above the replacement table, have separate silhouettes,
// and follow it when the editor moves the actor.
run("var desk=W.maps.house26_bedroom.roomActors.find(a=>a.morningDesk);var supplies=morningDeskItems()");
assert.equal(run('desk.extractedCanvas.width'),48);assert(run('supplies.every(i=>i.sy>desk.sy)'));
assert(run('supplies[0].x+supplies[0].width/2<supplies[1].x-supplies[1].width/2'));
assert(run('supplies[1].x+supplies[1].width/2<supplies[2].x-supplies[2].width/2'));
run('var firstX=supplies[0].x;shiftActorData(W.maps.house26_bedroom,desk,desk.x+16,desk.y,true)');
assert.equal(run('morningDeskItems()[0].x-firstX'),16);
console.log('PASS: cloud discovery, NPC referral, actual visits, hidden selection, flight isolation, save migration, boss/reward spoiler gates and visible movable desk pickups.');
