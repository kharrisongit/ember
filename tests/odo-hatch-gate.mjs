import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:false});
context.assert=assert;
await run('loadPublishedEditorLayouts()');
run(`applyPublishedEditorLayout(W.maps.world,'world');
MAPID='world';MD=W.maps.world;MW=MD.w;MH=MD.h;PXW=MW*TS;PXH=MH*TS;
solid=new Uint8Array(MW*MH);terr=new Uint8Array(MW*MH);npcs=MD.npcs.map(n=>({...n}));
mode='play';gameplayStarted=true;editing=false;running=true;
// Both half-tile lanes were explicitly painted walkable in the published map.
// Exercise the real movement/collision code with those saved edits applied.
for(let stage=Q.ABED;stage<Q.DONE;stage++){
 quest=stage;
 for(const row of [865,870]){
  const y=row*8+PC_H;
  assert.equal(collisionOverride(47*TS,y-1),false,'Reproduces the published walkable bridge lane');
  assert(isSolid(47*TS,y-1),'The pre-hatch gate must win over walkable terrain edits');
  assert.equal(blockReason(47*TS,y-1),'odo','Collision overlay must show the active gate');
  P.x=44*TS;P.y=y;
  for(let tick=0;tick<40;tick++)movePlayer(1,0,.05);
  assert(P.x+PC_W/2<ODO_BRIDGE.x0*TS,'Running cannot cross either edge lane before hatching');
 }
}
const bridgeOdo=npcs.find(n=>n.n==='Odo');
const bridgeOdoX=bridgeOdo.x;
bridgeOdo.x=60*TS;
assert(odoShuts(45,433),'Moving Odo must not shrink or remove the bridge gate');
bridgeOdo.x=bridgeOdoX;
quest=Q.DONE;clearBridge();
assert(bridgeOdo.odoAtHome,'Odo returns home after the hatch');
for(const row of [865,870]){
 P.x=44*TS;P.y=row*8+PC_H;
 assert(!isSolid(47*TS,P.y-1),'The saved walkable lane reopens after hatching');
 for(let tick=0;tick<40;tick++)movePlayer(1,0,.05);
 assert(P.x>(ODO_BRIDGE.x1+1)*TS,'Corin can cross after hatching');
}
quest=Q.CARRY;bridgeOdo.x=bridgeOdoX;bridgeOdo.y=6944;
P.x=(ODO_BRIDGE.x0-1)*TS;P.y=433*TS;P.moving=true;
assert(odoTurnsYouBack(),'Odo calls out from the reachable side of the gate');
assert.deepEqual(scene.lines,["Odo: Not now Corin! I’m trying to catch a big one!"]);
assert(sceneHold()&&!P.moving,'The callout stops Corin');
const stoppedAt=P.x;movePlayer(1,0,.05);assert.equal(P.x,stoppedAt,'Movement stays locked during the line');
typeAll();scene.t=1;advanceScene();
assert(!scene&&!sayNpc&&!ask&&!sceneHold(),'Dismissing the line returns control');
odoTurnsYouBack();assert(!scene,'Standing beside Odo does not repeat the line every frame');
P.x=40*TS;odoTurnsYouBack();P.x=(ODO_BRIDGE.x0-1)*TS;
assert(odoTurnsYouBack()&&scene,'A new attempt gets the warning again');
typeAll();scene.t=1;advanceScene();
quest=Q.DONE;assert(!odoTurnsYouBack()&&!scene,'No warning after hatching');
quest=Q.CARRY;MAPID='house26';assert(!odoShuts(47,433)&&!odoTurnsYouBack(),'No bridge gate indoors');
MAPID='world';editing=true;assert(!odoTurnsYouBack(),'Editing does not launch the callout');editing=false;
`);
run(`mode='play';gameplayStarted=true;MAPID='world';MD=W.maps.world;EmberFriendship.restore({tutorialSeen:true});P.x=100;P.y=100;
const earlyOdo={n:'Odo',x:100,y:120,f:'d'};faceToward=()=>{};saveGame=()=>{};fishingPole=false;odoRodReferral=false;
for(const stage of [Q.ABED,Q.ARMED,Q.CARRY]){
 quest=stage;EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;
 beginNpcTalk(earlyOdo);assert.equal(ask.npcConversation,'Odo');assert(EmberConversationFlow.active());
 assert(npcStoryTopics(earlyOdo).some(t=>t.lines),'Odo has personal topics before the hatch');
 EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;beginNpcTalk(earlyOdo,true,true);
 assert(scene&&!sayNpc,'The early fishing request gives a short response');
 assert.deepEqual(scene.lines,["Odo: Not now Corin! I’m trying to catch a big one!"]);
 assert(!odoRodReferral&&!fishingPole,'Personal conversation cannot unlock the rod early');
}
scene=null;quest=Q.DONE;dragon.on=true;dragonOff=false;dragonIntroDone=true;thornwellRoyal.stage=7;
beginNpcTalk(earlyOdo,true,true);assert(odoRodReferral,'Referral unlocks after hatching');assert(!fishingPole);
quest=Q.CARRY;sayNpc=null;scene=null;assert(openNpcTopics(earlyOdo),'An earlier save still permits the full conversation');
`);
console.log('PASS: Odo blocks both published walkable bridge lanes until hatching, stops Corin with his exact line, releases control, and keeps conversations and the fishing referral intact.');
