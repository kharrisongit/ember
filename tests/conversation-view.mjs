import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),console,{document:dom.document,furniture:false});
const box=dom.element('bagAsk'),rows=dom.element('askRows');box.append(rows);
const click=node=>{assert(node);node.onclick({stopPropagation(){}});};
run(`quest=Q.DONE;dragon.on=true;dragonOff=false;thornwellRoyal.stage=7;faceToward=()=>{};
openNpcTopics({n:'Linna',x:150,y:150,d:['Hello']});`);
assert.equal(box.querySelector('.deckHeader').parentNode,box,'Banner spans the panel independently of the topic columns');
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

// Portrait, landscape, short screens, and dragon bodies all fit between the
// portraits and above the animated panel at every sampled opening height.
for(const [width,height,deck]of [[390,844,180],[844,390,180],[1363,936,240]]){
 for(const progress of [0,.2,.5,.8,1])for(const dragon of [false,true]){
  const target=Math.min(height*.52,Math.max(330,height*.44));
  const panelHeight=deck+(target-deck)*progress;
  const pw=height<=520?82:Math.min(144,Math.max(82,width*.13));
  c.safe={left:pw+18,right:width-pw-18,top:24,bottom:height-panelHeight-16};
  c.actors=[{x:100,y:100,width:28,height:40},{x:dragon?158:136,y:106,width:dragon?84:32,height:dragon?62:48}];
  const camera=run('EmberConversationView.framing(actors,safe,3.5)');
  for(const a of c.actors){
   assert((a.x-a.width/2-camera.x)*camera.z>=c.safe.left-1e-6);
   assert((a.x+a.width/2-camera.x)*camera.z<=c.safe.right+1e-6);
   assert((a.y-a.height-camera.y)*camera.z>=c.safe.top-1e-6);
   assert((a.y+6-camera.y)*camera.z<=c.safe.bottom+1e-6);
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
run('askShut();sayOff();EmberConversationView.frame()');assert.equal(run('EmberConversationView.active()'),false);
assert(dom.element('conversationPortraits').hidden,'Portraits leave with the conversation');
console.log('PASS: full-width banner, profiles, safe Back/leave paths, camera fit in 30 viewport/body/animation cases, smooth presentation, and continuous menu frames.');
