import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document});
await run('loadPublishedEditorLayouts()');
run(`mode='play';gameplayStarted=true;quest=Q.ABED;bagOwned=false;restoreFatherCompass({});EmberRiding.skip();EmberEquipmentTutorial.skip();loadMap(W.start);[P.x,P.y]=MD.spawn;`);
assert.equal(run('MAPID'),'house26_bedroom');assert(run('canStand(P.x,P.y)'));
run('startMorning()');assert.equal(run('scene.lines[0]'),'Corin: Good morning Millwood! I should talk to Nan before I head out for the day.');
run(`scene=null;loadMap('house26');var exit=MD.doors.find(d=>d.to==='world');var r=doorRect(exit);P.x=r.x+r.w/2;P.y=r.y-2;P.dir='d';P.moving=true;useDoors(1/30);`);
assert.equal(run('doorMotion'),null);assert.equal(run('toastEl.textContent'),'Talk to Nan before you go.');assert.equal(run('fadeDir'),0);assert(run('nanMorningSolid(P.x,r.y)'));
run('beginDoorEntry(exit)');assert.equal(run('doorMotion'),null,'Direct transition cannot bypass Nan');
run("var nan=npcs.find(n=>n.n==='Nan Ferrow');EmberConversationFlow.prompt(nan)");
assert(run('scene.nanMorning'),'Actual interaction takes the morning gift path');
run('typeAll();scene.t=1;advanceScene();');assert(run('bagOwned&&worldMapUnlocked()'));assert(!run('templeCompass.owned'),'Morning Map does not grant the compass');
assert.match(run('revCap.textContent'),/Bag/);run('hideReveal()');assert.match(run('revCap.textContent'),/Map/);run('hideReveal()');
run('scene=null;saveToSlot(3,true);bagOwned=false;templeCompass.mapGiven=false');assert(run('loadGame(3)'));assert(run('bagOwned&&worldMapUnlocked()'));assert(!run('templeCompass.owned'));
assert.equal(run('giveMorningSupplies()'),false,'No repeated morning gifts');
run('scene=null;revealing=false;beginDoorEntry(MD.doors.find(d=>d.to===\'world\'))');assert(run('doorMotion'),'The house exit opens after Nan’s gifts');run('doorMotion=null');
run('var meatBefore=hareMeat;nanGiftBeat(6)');assert(run('templeCompass.owned'));assert.match(run('revCap.textContent'),/Father.s Compass/);run('hideReveal();nanGiftBeat(14);hideReveal();nanGiftBeat(14)');assert.equal(run('hareMeat-meatBefore'),3);
assert(!run('FATHER_COMPASS_GIFT.join(" ").includes("A map and a compass")'));
// Published throne footprint follows its movable actor and leaves the aisle open.
run(`quest=Q.DONE;loadMap('cinderhold');var chair=MD.roomActors.find(a=>a.throneRoomAsset);`);
assert(run('chair.moveBlocks.length>0'));assert(run('isSolid(chair.x,chair.y-4)'));assert(run('canStand(176,180)'));
run('var chairX=chair.x;shiftActorData(MD,chair,chair.x+32,chair.y,true)');assert(run('isSolid(chair.x,chair.y-4)'));run('shiftActorData(MD,chair,chairX,chair.y,true)');
assert.equal(run('SPR.throne_wall[5]'),'castle_north_wall');
assert.equal(run("W.maps.royal_seal.roomActors.find(a=>a.editKey==='royal:relocated-painting').extractedCanvas.width"),21,'Painting crop has no wall-column fragments');
for(const [x,y]of [[176,148],[214,140],[245,150]]){
 c.startX=x;c.startY=y;
 run(`lastFight=0;foes=[];scene=null;sayNpc=null;ask=null;revealing=false;foesHeld=true;wonAll=false;P.x=startX;P.y=startY;P.act=null;dragon.on=true;dragon.x=140;dragon.y=190;dragon.placed=MAPID;startLastFight();var boss=foes.find(f=>f.kind==='kdragon');var start=[boss.x,boss.y];`);
 assert(!run('foesHeld'),'Explicit confrontation resumes paused foes');assert(run('combatCanStand(boss,boss.x,boss.y,false,false)'),'Boss starts clear of people and scenery');
 run('P.x=176;P.y=390;dragon.x=140;dragon.y=430;for(let i=0;i<90;i++)stepFoes(1/30)');assert(run('Math.hypot(boss.x-start[0],boss.y-start[1])>40'),'Boss actually crosses the hall');
}
// Every added first meeting explains the person without imaginary props or prior familiarity.
let introductions=0;
run(`scene=null;ask=null;sayNpc=null;MAPID='world';MD=W.maps.world;dragon.on=true;dragonOff=false;dragonIntroDone=true;thornwellRoyal.stage=7;`);
for(const name of run('Object.keys(NpcContextAudit.cast)')){
 c.actor={n:name,x:12000,y:3300};run('discussedTopics.clear();dragon.x=12000;dragon.y=3300');
 const intro=run('NpcContextAudit.introduction(actor)');assert(!/\bCorin\b|\bAurelius\b/.test(intro.lines[0]),name+' is a stranger');assert.match(intro.lines[1],/I am Corin/);intro.done();
 assert.match(run('NpcContextAudit.introduction(actor).lines[0]'),/again, Corin/);
 run('discussedTopics.clear();dragonOff=true');const away=run('NpcContextAudit.introduction(actor).lines');assert(!/those wings|your dragon|that dragon|beside you|outside/.test(away[0]),name+' does not invent a sighting');run('dragonOff=false');introductions++;
}
assert.equal(run("THORNWELL_DIALOGUE_CAST.Isolde.role"),'Thornwell resident');
console.log(`PASS: bedroom opening, blocked exit, early Bag/Map, saved gifts, compass/meat separation, movable throne collision, three paused/overlapping final-fight starts and ${introductions} stranger introductions.`);
