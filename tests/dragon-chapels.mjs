import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
const value=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`mode='play';gameplayStarted=true;quest=Q.DONE;foesHeld=false;dragonOff=true;dragonIntroDone=true;
window.EmberArenaEntry=undefined;window.EmberEncounterCard=undefined;window.EmberRiding=undefined;
`);
await run('loadPublishedEditorLayouts()');
run(`applyPublishedEditorLayout(W.maps.world,'world');loadMap('desert_chapel');
scene=null;bossScene=null;ovl=null;ask=null;fadeDir=0;doorMotion=null;`);
assert.equal(run('npcs.length'),1,'Desert chapel has only its preacher');
assert(!run('MD.roomActors.some(a=>a.congregation)'));
assert.equal(run('W.maps.world.roomActors.filter(a=>a.spirit&&a.chapelArt).length'),4);
assert.equal(run('W.maps.world.doors.filter(d=>d.to==="desert_chapel").length'),1);
for(const route of value('DragonChapels.routes'))assert.deepEqual(value(`W.maps.world.features.find(f=>f.id===${route.id})`),route,'Exact authored path');
for(const [id,x,y]of value('DragonChapels.moves'))assert.deepEqual(value(`W.maps.world.objs.slice(${id*3+1},${id*3+3})`),[x,y]);
for(let y=216;y>=139;y--)assert(run(`canStand(176,${y})`),'Central aisle to preacher is walkable at '+y);
assert(run('canStand(176,225)'),'South exit threshold is reachable');
assert(!run('canStand(128,157)'),'Pews have collision');
assert(!run('canStand(40,160)'),'Outer wall has collision');
run('P.x=176;P.y=139;');assert.equal(run('nearestTalkNpc()?.n'),'Brother Cael','Talk from across the altar');
const priest=value('npcs[0]');assert.equal(priest.packSpr,'chapel_priest');
run(`DragonChapels.restore(false);const skyPriest=npcs[0];DragonChapels.talk(skyPriest);`);
assert(run('scene.lines.some(s=>s.includes("Aurelius"))'));
assert.equal(run('DragonChapels.sprintSpeed()'),228);
run(`scene=null;DragonChapels.beginBlessing(skyPriest);`);
assert(run('sceneHold()'),'Ritual holds player input');
run('for(let i=0;i<200;i++)DragonChapels.step(.05);');
assert(run('DragonChapels.capture()'),'Completing casting grants blessing');
assert.equal(run('DragonChapels.sprintSpeed()'),285);
assert(run('readSaveSlot(activeSaveSlot).skyBlessing'),'Blessing is immediately saved');
assert.deepEqual(value('[skyPriest.x,skyPriest.y]'),[176,112],'Preacher returns behind altar');
assert(!run('DragonChapels.beginBlessing(skyPriest)'),'No duplicate ritual');
run('scene=null;saveToSlot(1,true);DragonChapels.restore(false);');
assert(run('loadGame(1)&&DragonChapels.capture()'),'Actual save/load retains blessing');
run(`localStorage.setItem(saveKey(2),JSON.stringify({...captureSave(),skyBlessing:undefined}));scene=null;`);
assert(run('loadGame(2)&&!DragonChapels.capture()'),'Legacy/other slots do not inherit blessing');
run(`loadMap('forgewick_chapel');scene=null;P.x=176;P.y=139;`);
assert(run('MD.roomActors.filter(a=>a.congregation).length>=15'),'Populated pews and all four monks');
assert(!run('MD.roomActors.some(a=>a.spirit)'));
run('DragonChapels.talk(npcs[0]);');assert(!run('DragonChapels.capture()'),'Forgewick preacher cannot grant blessing');
assert(run('scene.lines.some(s=>s.includes("Brother Cael"))'));
for(const [name,count]of [['chapel_altar0',3],['chapel_statues0',3],['chapel_candelabra0',3],['chapel_parishioners10',12],['chapel_monks0',12],['chapel_priest_speech',12],['chapel_priest_spell',18]]){
 const frames=new Set();for(let i=0;i<600;i++)frames.add(run(`DragonChapels.frame('${name}',${i*.01})`));
 assert.equal(frames.size,count,'Full animation for '+name);
}
run(`MAPID='world';MD=W.maps.world;`);
assert.equal(run(`MD.objs.reduce((count,s,i,a)=>count+(i%3===0&&!!DragonChapels.graveSprite({s,x:a[i+1],y:a[i+2],id:i/3})),0)`),16,'All sixteen Hollybeck graves use the pack');
assert(!run(`DragonChapels.graveSprite({s:NAMES.indexOf('wf_grave1'),x:1600,y:1600,id:1})`),'Other grave markers are unchanged');
// Check the fully generated outdoor map, including doors and the edited terrain.
run(`loadMap('world');scene=null;bossScene=null;ovl=null;ask=null;fadeDir=0;fade=0;doorMotion=null;mounted=false;`);
assert(run('objs.filter(o=>DragonChapels.graveSprite(o)&&!hidden.has(o.id)&&!deleted.has(o.id)).every(o=>!canStand(o.x,o.y-8))'),
 'Every visible Hollybeck grave blocks walking');
assert(run(`(()=>{const r=12,x0=2634,y0=152;for(let y=y0-r;y<=y0+r;y++)for(let x=x0-r;x<=x0+r;x++)
 if(Math.hypot(x-x0,y-y0)<=r+.5&&terr[y*MW+x]!==DIRT)return false;return true;})()`),'Entire graveyard clearing is dirt, including its old paved strip');
assert(run('MD.roomActors.filter(a=>a.chapelCactus).every(a=>!canStand(a.x,a.y))'),'All cactus border segments have collision');
assert(run(`(()=>{const [x,y]=DragonChapels.inspect().location;
 for(let dx=-160;dx<=160;dx++)if(!isSolid(x+dx,y-230))return false;
 for(let dy=-224;dy<=64;dy++)if(!isSolid(x-160,y+dy)||!isSolid(x+160,y+dy))return false;
 return canStand(x,y+32)&&canStand(x,y+64);})()`),'No gaps behind or beside the church; the southern entrance remains open');
assert(run(`MD.roomActors.filter(a=>a.spirit&&a.chapelArt).every(a=>a.stillFrame===0)`));
assert(run(`(()=>{const old=drawGameImage,calls=[];try{drawGameImage=(...a)=>calls.push(a.slice(2));
 for(const o of MD.roomActors.filter(a=>a.spirit&&a.chapelArt)){
  calls.length=0;DragonChapels.draw(o,0);DragonChapels.draw(o,1.7);
  if(JSON.stringify(calls[0])!==JSON.stringify(calls[1]))return false;
 }return true;}finally{drawGameImage=old;}})()`),'The actual dragon drawing stays identical over time');
assert(run(`placesOf().some(p=>p.map==='world'&&/Desert Church/.test(p.name)&&canStand(p.x*16+8,p.y*16+16))`),'Dev teleport has a safe outdoor Desert Church destination');
assert(run(`placesOf().some(p=>p.map==='desert_chapel')`),'Dev tools also include the chapel interior');
for(const to of ['desert_chapel','forgewick_chapel']){
 run(`globalThis.chapelDoor=MD.doors.find(d=>d.to==='${to}');P.x=chapelDoor.x*16+8;P.y=chapelDoor.y*16+40;
 P.dir='u';P.moving=true;arriveT=0;for(let i=0;i<40;i++){if(canStand(P.x,P.y-1))P.y--;else break;}useDoors(0);`);
 assert(run('pendingDoor===chapelDoor||doorMotion?.d===chapelDoor'),'Walk up to '+to);
 run('doorMotion=null;pendingDoor=chapelDoor;fadeDir=1;fade=1;useDoors(0);fadeDir=0;scene=null;bossScene=null;');
 assert.equal(run('MAPID'),to);assert(run('canStand(P.x,P.y)'));
 run('pendingDoor=MD.doors[0];doorMotion=null;fadeDir=1;fade=1;useDoors(0);fadeDir=0;scene=null;bossScene=null;');
 assert.equal(run('MAPID'),'world');assert(run('canStand(P.x,P.y)'),'Safe church return');
}
// Exercise the actual movement calculation, including unchanged non-sprint flight.
run(`MAPID='world';MD={...W.maps.world,roomBlocks:[],doors:[]};MW=300;MH=300;PXW=4800;PXH=4800;
solid=new Uint8Array(MW*MH);terr=new Uint8Array(MW*MH);npcs=[];foes=[];features=[];
scene=null;ask=null;sayNpc=null;hatchExit=false;bossScene=null;revealing=false;fade=0;fadeDir=0;doorMotion=null;arenaLock=null;
mounted=true;dragon.air=true;dragon.tr=null;dragonOff=false;dragon.down=false;dragon.knockdown=0;dragon.hp=20;dragon.maxHp=20;
P.x=2400;P.y=2400;P.act=null;keys.ArrowRight=true;running=true;padDx=padDy=0;`);
run('DragonChapels.restore(false);movePlayer(1,0,.1);');assert(Math.abs(run('P.x')-2422.8)<.001);
run('DragonChapels.restore(true);movePlayer(1,0,.1);');assert(Math.abs(run('P.x')-2451.3)<.001);
run('running=false;movePlayer(1,0,.1);');assert(Math.abs(run('P.x')-2468.3)<.001);
console.log('PASS: both chapel layouts, exact route and object moves, interior collision/interaction, statue, cactus enclosure, dev teleport, grave collision/dirt, full interior animation cycles, blessing ceremony, autosave/load and slot isolation, 228→285 flying sprint with 170 cruise unchanged.');
