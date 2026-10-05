import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{document:dom.document,furniture:false});
context.assert=assert;
run(`
mode='play';gameplayStarted=true;MAPID='world';MD=W.maps.world;
EmberFriendship.restore({tutorialSeen:true});P.x=100;P.y=100;
const earlyOdo={n:'Odo',x:100,y:120,f:'d'};
let odoScenes=[];playScene=(lines,options)=>odoScenes.push({lines,options});
faceToward=()=>{};saveGame=()=>{};fishingPole=false;odoRodReferral=false;
for(const stage of [Q.ABED,Q.ARMED,Q.CARRY]){
 quest=stage;
 for(const args of [[false,false],[true,false],[true,true]]){
  beginNpcTalk(earlyOdo,...args);
  assert.deepEqual(odoScenes.at(-1).lines,['Odo: Not now, lad. I am going to catch a big one.']);
  assert(!ask,'No topic or reply menu before hatch');
  assert(!odoScenes.at(-1).options.npcActor,'No full conversation session for the one-line refusal');
  assert.equal(openNpcTopics(earlyOdo),false);assert.equal(npcStoryTopics(earlyOdo).length,0);
  assert(!odoRodReferral&&!fishingPole,'No early fishing quest or item');
 }
}
quest=Q.DONE;dragon.on=true;dragonOff=false;dragonIntroDone=true;thornwellRoyal.stage=7;
assert(npcStoryTopics(earlyOdo).length>0,'Normal topics unlock after hatch');
beginNpcTalk(earlyOdo,true,true);
assert(odoRodReferral,'Fishing referral becomes available after hatch');
quest=Q.CARRY;assert.equal(openNpcTopics(earlyOdo),false,'Loading an earlier story state restores the restriction');
`);
console.log('PASS: repeated pre-hatch interactions only give the big-one line, with no topics or fishing lead; normal dialogue unlocks after hatching.');
