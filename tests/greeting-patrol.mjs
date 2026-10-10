import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:false});
dom.element('bagAsk').append(dom.element('askRows'));
run(`MAPID='world';MD=W.maps.world;MW=MD.w;MH=MD.h;terr=new Uint8Array(MW*MH);mode='play';gameplayStarted=true;quest=Q.DONE;
 templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;templeCompass.morningMet=true;
 dragonIntroDone=true;dragon.on=false;dragonOff=true;thornwellRoyal.stage=7;
 saveGame=()=>{};canNpcStand=()=>true;EmberRiding.skip();EmberEquipmentTutorial.skip();EmberFriendship.restore({tutorialSeen:true});`);
const tick=()=>run('stepWalkers(.05);stepScene(.05);stepType(.05)');
const close=()=>run('EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;walker=null;revealing=false;P.act=null;P.x=100;P.y=120;P.dir="u";');
for(const name of ['Hettie','Gwil','Orin']){
 close();c.name=name;
 run(`var actor={n:name,x:100,y:100,d:[name+': Hello.'],home:[100,156],goto:[100,156],patrol:[5,5,8,10],hettieDeparted:true};npcs=[actor];`);
 assert(!run('npcStepClearsPlayer(actor,100,102)'),'Corin really blocks the pending patrol');
 run('actionButton()');
 assert(run('scene?.conversationGreeting'),name+' enters through the actual interaction button');
 assert.equal(run('scene.arriving'),false,name+' must not wait for a patrol blocked by the player');
 assert(dom.element('say').classList.contains('on'),name+' greeting is immediately visible');
 assert.equal(run('typeWho'),name);
 for(let i=0;i<240;i++)tick();
 assert.deepEqual(JSON.parse(run('JSON.stringify([actor.x,actor.y,P.x,P.y])')),[100,100,100,120],'Neither actor has to move for the greeting');
 for(let i=0;i<3&&run('!!scene');i++)run('typeAll();scene.t=1;actionButton()');
 assert(run('ask?.conversationPrompt'),name+' greeting finishes');
 run('askPick=ask.opts.findIndex(o=>o.n==="Talk");askTake()');
 assert(run('EmberConversationFlow.active()'),name+' conversation opens');
 run('EmberConversationFlow.goodbye()');
 assert(!run('sceneHold()||ask||sayNpc'),name+' goodbye releases control');
 run('P.x=300');for(let i=0;i<60;i++)tick();
 assert(!run('scene||ask||sayNpc'),'Leaving does not reveal a delayed conversation');
 assert(!dom.element('say').classList.contains('on'));
}
// Hettie can restore the route paused for Nan on the very next walking tick.
close();run(`var actor={n:'Hettie',x:100,y:100,d:['Hettie: Hello.'],home:[100,156],goto:null,patrol:[5,5,8,10],hettieDeparted:true,nanSceneAside:true,nanResume:[100,156]};npcs=[actor];
 EmberConversationFlow.prompt(actor);`);
tick();assert(!run('actor.nanSceneAside'),'The farewell route resumes its ordinary state');
assert.equal(run('scene.arriving'),false);assert(dom.element('say').classList.contains('on'));
for(let i=0;i<60;i++)tick();assert.equal(run('actor.y'),100,'The speaker stays put even when the route is restored');
// Scripted approaches keep their arrival gate; this change is only for greetings.
close();run(`var actor={n:'Nan Ferrow',x:100,y:60,goto:[100,84],straightSceneWalk:true,scriptWalking:true};npcs=[actor];
 playScene(['Nan Ferrow: Here I am.'],{who:actor.n,npcActor:actor,nanGifts:true});`);
assert.equal(run('scene.arriving'),true);assert(!dom.element('say').classList.contains('on'));
for(let i=0;i<30;i++)tick();
assert.equal(run('scene.arriving'),false);assert.equal(run('actor.y'),84);assert(dom.element('say').classList.contains('on'));
console.log('PASS: blocked Hettie/Gwil/Orin patrols greet immediately, finish and release input; Nan route restoration cannot delay speech; scripted approaches still wait.');
