import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
c.document.getElementById('atlasClose').parentNode={hidden:false};
c.document.getElementById('atlasFly').parentNode={style:{}};
const value=s=>JSON.parse(run('JSON.stringify('+s+')'));
// Small clear outdoor fixture exercises production visits, transitions, movement,
// controls and saves without generating the entire overworld's terrain.
run(`mode='play';gameplayStarted=true;quest=Q.DONE;MAPID='world';MD=W.maps.world;
PXW=3200;PXH=3200;MW=200;MH=200;solid=new Uint8Array(MW*MH);npcs=[];foes=[];features=[
{kind:'area',label:'Millwood',x0:0,y0:0,x1:60,y1:60},
{kind:'area',label:'Thornwell',x0:70,y0:0,x1:100,y1:60}];
MD.doors=[];P.x=600;P.y=600;P.moving=false;VW=800;VH=600;cam.z=2;
scene=null;ask=null;sayNpc=null;hatchExit=false;hatchCamera=null;fade=0;fadeDir=0;doorMotion=null;arenaLock=null;
dragonIntroDone=true;dragonOff=false;dragon.on=true;dragon.placed='world';dragon.hp=20;dragon.maxHp=20;dragon.air=false;dragon.down=false;dragon.knockdown=0;
thornwellRoyal.stage=7;EmberRiding.skip();followCam();clampCam();`);

c.areaUnder=(x,y)=>x<960?'Millwood':x>=1120&&x<=1600?'Thornwell':'Millwood–Thornwell Road';
let saves=[],notice='';c.saveGame=()=>saves.push(value('captureSave()'));c.toast=t=>notice=t;
run("restoreFlightTravel(null,['visited:Thornwell']);");assert(run('!!flightVisits.Thornwell'),'Existing recorded visits migrate');
run('restoreFlightTravel(null);rememberFlightVisit()');assert.deepEqual(value('flightVisits.Millwood'),[600,600]);
assert.match(run("flightUnavailable('Thornwell')"),/Visit this place/);
run("atlasPick=ATLAS_LOCATIONS.findIndex(p=>p[0]==='Thornwell');refreshFlightOption()");assert(!run('flightVisits.Thornwell'),'Map selection never counts as a visit');
run('P.x=1000;rememberFlightVisit()');assert(!run('flightVisits.Thornwell'),'A nearby road does not visit the town');
run('P.x=1280;rememberFlightVisit()');assert.deepEqual(value('flightVisits.Thornwell'),[1280,600]);
run('P.x=600;mounted=false;followCam();clampCam()');
const visits=value('captureSave().flightVisits');run('restoreFlightTravel('+JSON.stringify(visits)+')');
assert.equal(run("flightUnavailable('Thornwell')"),'');
assert(run("beginFlightTravel('Thornwell')"));assert.equal(run('flightTravel.phase'),'mount');assert(run('revealing'));
assert(run('mounted'));assert(!run('atlasOpen'));assert(run('sceneHold()'));
run('setBag(true);setOvl("airm");openAtlas()');assert(!run('bagOpen||ovl||atlasOpen'),'Menus cannot interrupt transit');
let phases=new Set(),sawBlack=false,originSafe=false,sawLeft=false,sawRight=false,sawGroundedLanding=false;
for(let i=0;i<1000&&run('!!flightTravel');i++){
 const before=value('[P.x,P.y,flightTravel.phase]');
 phases.add(before[2]);run('stepFlightTravel(1/30)');
 if(['out','in'].includes(before[2])){
  assert(run('P.x')<=before[0],'Both horizontal flight passes face and travel left');
  assert.equal(run('P.y'),before[1],'Cruising stays on the same horizontal line');
  assert.equal(run('playerFacing4()'),'w');assert.equal(run('dragon.dir'),'w');
 }
 if(run("flightTravel?.phase==='fadeOut'")){assert(run('P.x<flightTravel.camera.x-64'));sawLeft=true;}
 if(run("flightTravel?.phase==='fadeIn'")){assert(run('P.x>flightTravel.camera.x+VW/flightTravel.camera.z+64'));sawRight=true;}
 if(run("flightTravel?.phase==='descend'"))assert(run("!dragon.tr&&dragon.air"),'Descent uses airborne art without landing dust');
 if(run("dragon.tr?.kind==='down'")){assert.equal(run('flightTravel.lift'),0,'Dust frames only play at ground level');assert(!run('dragon.air'));sawGroundedLanding=true;}

 if(run('fade')===1)sawBlack=true;
 if(run("flightTravel?.phase==='in'")){
  const s=value('captureSave()');assert.deepEqual([s.x,s.y],[600,600],'Mid-flight saves retain the departure point');originSafe=true;
 }
}
assert(!run('flightTravel'),'Flight finishes');
assert.deepEqual([...phases],['mount','takeoff','out','fadeOut','fadeIn','in','descend','land']);assert(sawBlack&&originSafe&&sawLeft&&sawRight&&sawGroundedLanding);
assert.deepEqual(value('[P.x,P.y,dragon.x,dragon.y]'),[1280,600,1280,600]);
assert(run('mounted&&!dragon.air&&!dragon.tr'));assert.equal(run('dragon.hp'),20);assert.match(notice,/Arrived at Thornwell/);
assert.deepEqual([saves.at(-1).x,saves.at(-1).y],[1280,600]);
// Mounted travel skips the mounting reveal; unhealthy/story-gated travel is refused.
assert(run("beginFlightTravel('Millwood')"));assert.equal(run('flightTravel.phase'),'takeoff');assert(!run('revealing'));
for(let i=0;i<1000&&run('!!flightTravel');i++)run('stepFlightTravel(1/30)');assert(!run('flightTravel'));
run('dragon.hp=1');assert(!run("beginFlightTravel('Thornwell')"));assert.match(notice,/recover/);
run("dragon.hp=20;flightVisits.Forgewick=[12000,1600];brambleQuest=0");assert.match(run("flightUnavailable('Forgewick')"),/story/);
// A changed destination is checked again rather than landing inside a new wall.
run('for(let y=36;y<=38;y++)for(let x=78;x<=81;x++)solid[y*MW+x]=1');
const landing=value("flightLanding('Thornwell')");assert(landing);assert(Math.hypot(landing[0]-1280,landing[1]-600)>20);
// Actual movement confirms 228 flight sprint versus 190 on foot.
run('P.x=600;P.y=600;mounted=false;running=true;dragon.air=false;dragon.tr=null;movePlayer(1,0,1)');const foot=run('P.x-600');
run('P.x=600;mounted=true;dragon.air=true;movePlayer(1,0,1)');const flight=run('P.x-600');
assert.equal(foot,190);assert.equal(flight,228);
console.log('PASS: real visits only, saved destinations, mounting/reveal, complete flight/fade/landing, safe mid-flight saves, gates, health, landing collision and 20% faster mounted sprint.');
