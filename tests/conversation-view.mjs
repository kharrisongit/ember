import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),console,{document:dom.document,furniture:false});
const box=dom.element('bagAsk'),rows=dom.element('askRows');box.append(rows);
const click=node=>{assert(node);node.onclick({stopPropagation(){}});};
run(`quest=Q.DONE;dragon.on=true;dragonOff=false;thornwellRoyal.stage=7;faceToward=()=>{};
openNpcTopics({n:'Linna',x:150,y:150,d:['Hello']});`);
assert.equal(box.querySelector('.deckHeader').parentNode,box,'Banner spans the panel independently of the topic columns');
assert.equal(box.querySelector('.deckProfileHint').textContent,'View profile ▾','Profile access has a clear action label');
const original=run('askPick');
click(box.querySelector('.deckProfileToggle'));
assert.equal(run('ask._profileOpen'),true);
assert.match(box.querySelector('.deckProfile').querySelector('p').textContent||run(`EmberConversationView.profile('Linna').bio`),/mill/i);
assert.equal(run(`EmberConversationView.profile('King Halvard').role`),'King of Emberfell','Profiles never reuse obsolete sprite/editor roles');
assert.equal(run(`EmberConversationView.profile('Bess').home`),'Thornwell');
run('askStep(1)');assert.equal(run('askPick'),original,'Hidden choices cannot be selected through profile navigation');
run('askTake()');assert.equal(run('ask._profileOpen'),false,'A returns from the profile without choosing an invisible topic');
click(rows.querySelectorAll('.deckTab').find(n=>n.textContent==='The realm'));
click(box.querySelector('.deckProfileToggle'));run('askBack()');
assert.equal(run('ask._deckFilter'),'world','Profile Back preserves the previous filtered topic list');
run('askBack()');assert.equal(run('ask._deckFilter'),'all','Category Back restores all topics');
run(`askShut();MAPID='world';dragonIntroDone=true;dragon.air=false;openDragonConversation('history');`);
click(box.querySelector('.deckBack'));assert.equal(run('ask.topicScope'),'root','Folder Back returns to Aurelius’s previous topic list');
assert(!rows.querySelectorAll('.deckTopic').some(n=>/chapter/i.test(n.getAttribute('aria-label'))));
run(`askShut();thornwellRoyal.stage=3;var king={n:'King Halvard',thornwellRoyal:true,x:150,y:150};
var dismissals=0;thornwellDismissAudience=()=>{dismissals++;};
openThornwellAudience(king);ask._deckFilter='world';askDraw();`);
run('askBack()');assert.equal(run('dismissals'),0,'Leaving a filter does not dismiss the king');
click(box.querySelector('.deckProfileToggle'));run('askBack()');assert.equal(run('dismissals'),0);
click(box.querySelector('.deckClose'));assert.equal(run('dismissals'),1,'Leaving the audience still runs its required story callback');

// Phone and desktop camera fits keep bodies clear of either portrait corner,
// including the taller topic panel at every sampled point during its growth.
for(const [width,height,deck]of [[390,844,180],[844,390,180],[1363,936,240]]){
 for(const progress of [0,.2,.5,.8,1])for(const dragon of [false,true])for(const menu of [false,true]){
  const target=height*.6,panelHeight=menu?deck+(target-deck)*progress:deck+120;
  const portraitSize=height<=600?112:144,panelTop=height-panelHeight;
  c.viewport={width,height:height-deck,panelTop,portraitSize,menu};
  c.actors=[{x:100,y:100,width:28,height:40},{x:dragon?158:136,y:106,width:dragon?84:32,height:dragon?62:48}];
  const camera=run('EmberConversationView.conversationFrame(actors,viewport,3.5)');
  for(const a of c.actors){
   const left=(a.x-a.width/2-camera.x)*camera.z,right=(a.x+a.width/2-camera.x)*camera.z;
   const top=(a.y-a.height-camera.y)*camera.z,bottom=(a.y+6-camera.y)*camera.z;
   assert(left>=18-1e-6&&right<=width-18+1e-6,'Both speakers stay on screen');
   assert(top>=24-1e-6&&bottom<=panelTop-16+1e-6,'Bodies clear the growing panel');
   if(!menu)assert(bottom<=panelTop-16-portraitSize+1e-6||(left>=portraitSize+18-1e-6&&right<=width-portraitSize-18+1e-6),'Neither portrait position can cover a speaker');
  }
 }
}
// The real presenter eases both position and zoom, then restores its untouched
// logical camera before the next simulation frame. Menus draw every RAF.
dom.element('cv').getBoundingClientRect=()=>({left:0,top:0,width:800,height:420});
box.getBoundingClientRect=()=>({top:330,width:800,height:270});
run(`MAPID='world';VW=800;VH=420;P.x=100;P.y=130;mode='play';camFree=false;
scene=null;greenCamera=null;hatchCamera=null;bossScene=null;deflectCamera=null;revealing=false;
devUnlocked=false;EmberRiding.skip();cam={x:-60,y:-10,z:2.2};cameraPresentation=null;cameraLogical=null;
presentCamera(.016);openNpcTopics({n:'Linna',x:140,y:130,d:['Hello']});
var beforeCamera={...cam};var goal=EmberConversationView.frame();presentCamera(.016);`);
const before=run('beforeCamera'),goal=run('goal'),shown=run('({...cam})');
assert(goal);assert(shown.z!==before.z&&shown.z!==goal.z,'First frame eases toward its target instead of jumping');
run('restoreCameraTarget()');assert.deepEqual(run('({...cam})'),before,'Presentation never changes the gameplay camera');
run(`var paintedFrames=0;drawWorld=()=>{paintedFrames++;};frameCore(1000);frameCore(1016);`);
assert.equal(run('paintedFrames'),2,'NPC menus continue drawing throughout the opening animation');
// Existing portrait renderer remains the sole owner of the active speaker.
dom.element('say').getBoundingClientRect=()=>({left:12,top:480,width:776,height:110});
run(`askShut();portraitPackImages.set(portraitFor('Corin').pack,{src:'corin-test-portrait'});
scene={lines:['Linna: A memory from the mill.','Corin: Tell me more.'],i:0,t:1,npcActor:{n:'Linna',x:140,y:130}};
showScene();var npcFrame=EmberConversationView.frame();`);
assert.equal(dom.element('face').dataset.speaker,'Linna');
assert.equal(dom.element('face').className,'left');
assert(dom.element('sayname').classList.contains('right'),'NPC name remains opposite the left portrait');
assert.equal(dom.element('face').style.display,'block');
run('scene.i=1;showScene();var corinFrame=EmberConversationView.frame();');
assert.equal(dom.element('face').dataset.speaker,'Corin');
assert.equal(dom.element('face').className,'right');
assert(dom.element('sayname').classList.contains('left'),'Corin’s name switches back to the left');
assert.equal(dom.element('face').style.display,'block');
assert.deepEqual(run('corinFrame'),run('npcFrame'),'Speaker changes never reframe the camera');
run('var partner=scene.npcActor;scene=null;openNpcTopics(partner);EmberConversationView.frame();');
assert.equal(dom.element('face').style.display,'none','Dialogue portrait is absent from topic menus');
assert.equal(c.document.querySelectorAll('.conversationPortrait').length,0,'No paired portrait overlay is created');
run('askShut();sayOff();EmberConversationView.frame()');assert.equal(run('EmberConversationView.active()'),false);

console.log('PASS: full-width banner, profiles, safe Back/leave paths, camera fit in 60 viewport/body/animation cases, single alternating portrait, fixed speaker framing, and continuous menu frames.');
