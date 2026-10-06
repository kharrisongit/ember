import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:true});
await run('loadPublishedEditorLayouts()');
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`mode='play';gameplayStarted=true;quest=Q.DONE;wonAll=false;lastFight=0;dragon.on=true;dragonIntroDone=true;dragonOff=false;breathHas.lightning=true;breathHas.ice=true;breathHas.shadow=true;smithUpgrade=true;charm.edge=true;templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;EmberRiding.skip();EmberEquipmentTutorial.skip();EmberFriendship.restore({tutorialSeen:true});loadMap('cinderhold');[P.x,P.y]=MD.spawn;P.act=null;fadeDir=0;fade=0;deadShown=false;devSafe=false;scene=null;sayNpc=null;askShut();npcs.find(n=>n.n==='King Halvard').away=0;`);
const entrance=json('MD.spawn');assert(run('canStand(P.x,P.y)'),'The published entrance is walkable');
function encounter(){
 run(`var king=npcs.find(n=>n.n==='King Halvard');P.x=king.x;P.y=king.y+28;P.dir='u';P.act=null;dragon.x=P.x-48;dragon.y=P.y+20;dragon.placed=MAPID;quietDragonBanter();beginNpcTalk(king);`);
 assert(run('scene.finalBattleIntro'),'Meeting Halvard starts the short confrontation');assert(!run('ask||EmberConversationFlow.active()'),'No invitation or full conversation panel');assert.equal(run('scene.lines.length'),4);
 for(let i=0;i<5&&run('!!scene');i++)run('typeAll();scene.t=1;actionButton()');
 assert(!run('scene||sayNpc||ask'));assert(run('EmberArenaEntry.holding()'));assert.equal(run('lastFight'),0,'The battle waits for readiness');
 assert(!dom.element('arenaReady').hidden);assert(dom.element('arenaReady').getAttribute('aria-label').includes('It’s time to fight!'));
 assert(dom.element('arenaReady').querySelector('.encounter-kicker').textContent.includes('FINAL BATTLE'));
 run('stepDragon(.1);EmberArenaEntry.step(.1)');assert(run('sceneHold()'),'Readiness pauses gameplay');
 run(`EmberArenaEntry.key({key:'b',preventDefault(){},stopImmediatePropagation(){}})`);assert.equal(run('lastFight'),0,'B cannot dismiss the fight card');
 run('actionButton()');assert.equal(run('lastFight'),1);assert(dom.element('arenaReady').hidden);assert(!run('EmberArenaEntry.holding()'));
 assert.equal(run('foes.filter(f=>f.kind==="kdragon"&&f.st!=="dead").length'),1,'Exactly one living king dragon spawns');
 run('beginNpcTalk(king)');assert(!run('scene||ask'),'Re-interacting cannot repeat the introduction during combat');
}
function dieAndRetry(){
 run(`safeSpot={map:MAPID,x:P.x,y:P.y};pInv=0;devSafe=false;worn.ward=false;standing=false;P.act=null;hurtPlayer(pMax+100);showDeath();`);
 assert(run('deadShown&&dying()'));run('actionButton()');
 assert.equal(run('MAPID'),'cinderhold');assert.deepEqual(json('[P.x,P.y]'),entrance,'Retry uses the entrance rather than the last combat position');
 assert.equal(run('lastFight'),0);assert(!run('bossScene||grief||risePend||scene||sayNpc||ask||arenaLock||mounted||ride||EmberArenaEntry.holding()'));
 assert(!run('EmberConversationFlow.active()'));assert(dom.element('arenaReady').hidden);
 assert(run('npcs.some(n=>n.n==="King Halvard"&&!n.away&&npcHere(n))'),'Halvard returns to the throne');
 assert(!run('foes.some(f=>["kdragon","lich","boneguard"].includes(f.kind))'),'Old phases do not survive retry');
 assert(run('pHp===pMax&&dragon.hp===dragon.maxHp&&!dragon.down&&dragonHere()'),'Both partners can start over');
 assert(run('canStand(P.x,P.y)&&dragonCanStand(dragon.x,dragon.y)'),'Neither partner restarts in scenery');
 assert(run('bolts.length===0&&risings.length===0&&!breath&&!spell&&!claw&&!hunt&&!camFree'));
 assert.deepEqual(json('[safeSpot.x,safeSpot.y]'),entrance);
}
encounter();run('P.x=210;P.y=240;dragon.hp=0;dragon.down=true;boarMeat=2;bolts.push({x:210,y:240});');dieAndRetry();
encounter();run('foes.find(f=>f.kind==="kdragon").st="dead";foes.find(f=>f.kind==="kdragon").t=2;lastFightHold();');assert.equal(run('lastFight'),2);assert(run('bossScene'));
run('risePhase();bossScene=null;stepLichTransition(2);P.x=150;P.y=260;');assert(run('foes.some(f=>f.kind==="lich")&&npcs.find(n=>n.n==="King Halvard").away'));
dieAndRetry();encounter();
// A same-room load cannot retain a phase flag after its dynamic enemy is discarded.
run('loadMap("cinderhold");[P.x,P.y]=MD.spawn;');assert.equal(run('lastFight'),0);assert(!run('bossScene||risePend'));encounter();
// Leaving at the readiness screen also clears the card and its input lock.
run('resetFinalBattle();beginNpcTalk(npcs.find(n=>n.n==="King Halvard"));');for(let i=0;i<5&&run('!!scene');i++)run('typeAll();scene.t=1;actionButton()');
assert(run('EmberArenaEntry.holding()'));run('loadMap("royal_seal")');assert(!run('EmberArenaEntry.holding()'));assert(dom.element('arenaReady').hidden);
run('wonAll=true;loadMap("cinderhold")');assert(!run('npcs.some(n=>/Halvard/.test(n.n))'));assert(!run('EmberArenaEntry.readyFinalBattle()'),'Victory stays complete');
console.log('PASS: short throne confrontation, final-battle readiness, A-only launch, deaths in both phases, restored king/dragon, entrance checkpoint, clean same-room reload and preserved victory.');
