import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document});
await run('loadPublishedEditorLayouts()');
run(`mode='play';gameplayStarted=true;quest=Q.ABED;bagOwned=false;restoreFatherCompass({});EmberRiding.skip();EmberEquipmentTutorial.skip();loadMap(W.start);[P.x,P.y]=MD.spawn;`);
assert.equal(run('MAPID'),'house26_bedroom');assert(run('canStand(P.x,P.y)'));
run('startMorning()');assert.match(run('scene.lines[0]'),/bag, map and compass are on the desk/);
run(`scene=null;var exit=MD.doors.find(d=>d.to==='house26');beginDoorEntry(exit);`);
assert.equal(run('doorMotion'),null,'Bedroom exit waits for the desk supplies');
assert(run('morningSuppliesPending()'));
for(const key of ['morningBag','morningMap','morningCompass']){
 run('bagOwned=false;templeCompass.mapGiven=false;templeCompass.owned=false');
 c.pickupKey=key;
 assert(run(`(()=>{const it=morningDeskItems().find(i=>i.key===pickupKey);for(let y=it.y;y<it.y+42;y+=2)for(let x=it.x-28;x<it.x+28;x+=2)if(canStand(x,y)&&itemAt(x,y)?.key===pickupKey){P.x=x;P.y=y;return true;}return false;})()`),'Supply can be reached from a walkable floor');
 run('interact()');assert(run('revealing'));run('hideReveal()');
 assert(run('morningDeskItems().every(i=>i.owned())'),'Any desk item collects all three supplies');
 assert(!run('itemHere(morningDeskItems().find(i=>i.key===pickupKey))'),'Picked supply disappears');
}
assert(run('bagOwned&&worldMapUnlocked()&&templeCompass.owned'));
assert(!run('templeCompass.meatGiven'),'Desk compass does not consume Nan’s later meat gift');
run('beginDoorEntry(exit)');assert(run('doorMotion'),'Bedroom exit opens after pickups');run('doorMotion=null');
run(`loadMap('house26');var arrival=MD.doors.find(d=>d.to==='house26_bedroom');P.x=(arrival.x+.5)*TS;P.y=(arrival.y+2)*TS;fade=0;fadeDir=0;stepNanMorning();var nan=npcs.find(n=>n.n==='Nan Ferrow');var nanStart=[nan.x,nan.y];`);
assert(run('scene.nanMorning'),'Nan approaches automatically when Corin enters the main room');
run('for(let i=0;i<240&&scene.arriving;i++){stepWalkers(1/30);stepScene(1/30);}');
assert(!run('scene.arriving'),'Nan reaches Corin and begins talking');
assert(run('Math.hypot(nan.x-nanStart[0],nan.y-nanStart[1])>5'),'Nan visibly approaches');
assert.match(run('scene.lines[0]'),/Hettie was looking for you/);
run('while(scene){typeAll();scene.t=1;advanceScene();}');assert(run('templeCompass.morningMet'));
run('stepNanMorning()');assert.equal(run('scene'),null,'Morning meeting does not repeat');
run('saveToSlot(3,true);bagOwned=false;templeCompass.mapGiven=false;templeCompass.owned=false');assert(run('loadGame(3)'));assert(run('bagOwned&&worldMapUnlocked()&&templeCompass.owned&&templeCompass.morningMet'));
run('var meatBefore=hareMeat;playScene(FATHER_COMPASS_GIFT,{nanGifts:true,i:14});typeAll();scene.t=1;advanceScene()');assert(run('revealing'));assert.equal(run('scene.i'),14);
run('hideReveal()');assert.equal(run('scene.i'),15,'Dismissing the gift opens the next line without another action');
run('nanGiftBeat(14)');assert.equal(run('hareMeat-meatBefore'),3);
// A queue advances once, after its final item, and callbacks cannot skip a new conversation.
run(`playScene(['Nan Ferrow: Two gifts.','Corin: Thank you.']);showReveal('inventory_mapCompass','Map');showReveal('inventory_compass','Compass');hideReveal()`);
assert.equal(run('scene.i'),0);assert(run('revealing'));run('hideReveal()');assert.equal(run('scene.i'),1);
run(`showReveal('inventory_compass','Compass',1,true,()=>playScene(['Corin: A new thought.','Corin: Continue.']));hideReveal()`);assert.equal(run('scene.i'),0);
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
console.log(`PASS: bedroom pickups and saved supplies, automatic Nan approach, queued gift continuation, movable throne collision, three paused/overlapping final-fight starts and ${introductions} stranger introductions.`);
