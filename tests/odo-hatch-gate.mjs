import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:false});
context.assert=assert;
run(`mode='play';gameplayStarted=true;MAPID='world';MD=W.maps.world;EmberFriendship.restore({tutorialSeen:true});P.x=100;P.y=100;
const earlyOdo={n:'Odo',x:100,y:120,f:'d'};faceToward=()=>{};saveGame=()=>{};fishingPole=false;odoRodReferral=false;
for(const stage of [Q.ABED,Q.ARMED,Q.CARRY]){
 quest=stage;EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;
 beginNpcTalk(earlyOdo);assert.equal(ask.npcConversation,'Odo');assert(EmberConversationFlow.active());
 assert(npcStoryTopics(earlyOdo).some(t=>t.lines),'Odo has personal topics before the hatch');
 EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;beginNpcTalk(earlyOdo,true,true);
 assert(scene&&!sayNpc,'The early fishing request gives a short response');
 assert(!odoRodReferral&&!fishingPole,'Personal conversation cannot unlock the rod early');
}
scene=null;quest=Q.DONE;dragon.on=true;dragonOff=false;dragonIntroDone=true;thornwellRoyal.stage=7;
beginNpcTalk(earlyOdo,true,true);assert(odoRodReferral,'Referral unlocks after hatching');assert(!fishingPole);
quest=Q.CARRY;sayNpc=null;scene=null;assert(openNpcTopics(earlyOdo),'An earlier save still permits the full conversation');
`);
console.log('PASS: Odo has a full screen at every story stage while the fishing referral remains hatch-gated.');
