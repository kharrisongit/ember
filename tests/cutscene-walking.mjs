import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {context:c,run}=await loadEditorGame(process.cwd(),console,{furniture:false});
// A diagonal detour used to alternate directions at every grid cell.
const clear=(x,y)=>!(x>=24&&x<=48&&y>=-8&&y<=32);
c.clearRoute=clear;
const path=run('maddockWalkPath({x:0,y:0},[96,48],clearRoute)');
assert(path&&path.length<=4,'Clear stretches collapse into long straight legs');
let from=[0,0];
for(const to of path){
 const count=Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1])*2);
 for(let i=1;i<=count;i++)assert(clear(from[0]+(to[0]-from[0])*i/count,from[1]+(to[1]-from[1])*i/count),'Smoothing preserves obstacle clearance');
 from=to;
}
assert.deepEqual(Array.from(path.at(-1)),[96,48]);
// Hettie has already left before Corin returns, including an old save with
// her still beside the entrance. Completing Nan's gifts cannot pop her back in.
run(`MAPID='world';quest=Q.DONE;scene=null;restoreFatherCompass();
var farmHettie={n:'Hettie',x:424,y:6672};npcs=[farmHettie];cam.x=350;cam.y=6580;cam.z=2.5;`);
assert.equal(run('npcHere(farmHettie)'),false,'Hettie is absent even before the farewell begins');
run('stepHettie();scene={nanGifts:true};templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;stepHettie()');
assert.equal(run('npcHere(farmHettie)'),false,'Hettie stays absent during Nan’s final lines');
run('scene=null;stepHettie()');assert.equal(run('npcHere(farmHettie)'),false,'Hettie cannot reappear in the current view');
run('cam.x=2000;stepHettie()');assert(run('npcHere(farmHettie)'),'The farm routine resumes after Corin leaves');
console.log('PASS: Hettie is already absent on the return with Aurelius and never walks through Nan’s farewell.');
// Both gifts may be recorded while Nan still has dialogue to deliver.
c.actor={n:'Nan Ferrow',fatherCompassVisitor:true,x:0,y:40,straightSceneWalk:true,goto:[80,40]};
run("restoreFatherCompass({owned:true,meatGiven:false});scene={nanGifts:true,npcActor:actor}");
assert(run('npcHere(actor)'),'Nan stays after the compass');
run('templeCompass.meatGiven=true');
assert(run('npcHere(actor)'),'Nan stays through the last dialogue after both gifts');
run('scene=null');assert.equal(run('npcHere(actor)'),false,'Visitor hides only after the scene');
c.stepHettie=()=>{};c.stepThornwellWelcome=()=>{};
run("editing=false;MAPID='world';npcs=[actor];scene={nanGifts:true,npcActor:actor};fadeDir=0;fade=0;sayNpc=null;ask=null;P.x=102;P.y=40");
for(let i=0;i<60;i++){
 const previous=c.actor.x;run('stepWalkers(1/60)');
 assert.equal(c.actor.y,40,'Nan never sidesteps');
 assert(c.actor.x>=previous&&c.actor.x-previous<=110/60+.001,'Nan walks east without teleporting');
}
assert.equal(c.actor.x,80);assert.equal(c.actor.goto,null);
// Nan returns south after dialogue and disappears only when her full sprite exits.
run('scene=null;actor.nanDeparting=true;actor.scriptWalking=true;actor.noTalk=true;cam.y=0;VH=300;cam.z=2');
assert(run('npcHere(actor)'),'Gift completion does not hide a departing Nan');
for(let i=0;i<160&&!c.actor.away;i++){
 const previous=c.actor.y;run('stepWalkers(1/60)');
 assert.equal(c.actor.x,80);assert(Math.abs(c.actor.y-previous-72/60)<.001,'Steady southward walk-off');
 if(c.actor.y-64<=150)assert(!c.actor.away,'Nan stays visible until her whole sprite exits');
}
assert(c.actor.away);assert.equal(c.actor.nanDeparting,false);
// Walking actors face the route, even when Corin stands in another direction.
c.stepHettie=()=>{};c.stepThornwellWelcome=()=>{};c.canNpcStand=()=>true;c.npcHere=()=>true;
for(const name of ['Nan Ferrow','Elder Maddock']){
 c.actor={n:name,x:0,y:0,f:'s',flip:false,packDirections:true,scriptWalking:true,goto:[80,40]};
 run("editing=false;MAPID='world';npcs=[actor];walker=actor;scene={who:actor.n,arriving:true};sayNpc=null;ask=null;P.x=-100;P.y=100;stepWalkers(1/60)");
 assert.equal(c.actor.f,'s');assert.equal(c.actor.flip,false,'Actor faces east along the route, not west toward Corin');
 run('faceToward(actor,actor.x,actor.y)');assert.equal(c.actor.f,'s','An exact waypoint preserves facing');
}
console.log('PASS: cutscene routes straighten without crossing obstacles; Nan and Maddock keep their travel direction at and between waypoints.');

// Ordinary scene approaches must withstand repeated A presses before arrival.
const spoken=[];c.typeStart=(who,text)=>spoken.push(text);c.typeDone=()=>true;
for(const explicit of [false,true]){
 c.actor={n:'Elder Maddock',x:200,y:100,stationary:false,packDirections:true};
 c.explicit=explicit;spoken.length=0;
 run("npcs=[actor];scene=null;walker=null;P.x=100;P.y=100;revealing=false;hatchScene=null;if(explicit)actor.goto=[130,100];playScene(['Maddock: First line.','Corin: Second line.'],{who:'Maddock',...(explicit?{npcActor:actor}:{})})");
 assert.equal(run('scene.arriving'),true);assert.equal(spoken.length,0,'Text waits for arrival');
 for(let i=0;i<600&&run('scene.arriving');i++){
  run('advanceScene();stepWalkers(1/60);stepScene(1/60)');
  assert.equal(run('scene.i'),0,'Walking cannot consume the opening line');
 }
 assert.equal(run('scene.arriving'),false,'Approach completes for automatic and explicit actors');
 assert.equal(spoken[0],'First line.');
 run('scene.t=1;advanceScene()');assert.equal(run('scene.i'),1);
}
console.log('PASS: automatic and explicit NPC approaches hide dialogue and reject A until arrival, then advance normally.');
