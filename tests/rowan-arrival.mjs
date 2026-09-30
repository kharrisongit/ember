import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){}});
await run('loadPublishedEditorLayouts()');
run(`mode='play';quest=Q.DONE;dragon.on=true;dragonIntroDone=true;templeCompass.owned=true;
loadMap('tavern');[P.x,P.y]=MD.spawn;brambleQuest=1;thornwellRoyal.stage=1;syncBrambleParty();syncThornwellRoyals();fadeDir=0;fade=0;doorMotion=null;scene=null;ask=null;sayNpc=null;
var startAt=[P.x,P.y];stepThornwellRoyal(1/30);`);
assert.match(run('scene?.lines[0]||""'),/^Rowan: Hey, over here!/ ,'Rowan stops the player automatically on arrival');
run('var rowanStart=[npcs.find(n=>n.n==="Rowan the Hunter").x,npcs.find(n=>n.n==="Rowan the Hunter").y];scene.after()');assert.equal(run('thornwellMotion.kind'),'rowan');
assert.deepEqual(Array.from(run('[P.x,P.y]')),Array.from(run('startAt')),'No teleport to Rowan');
let walked=false,kingCall=false,faced=false;
for(let i=0;i<2400;i++){
 const prior=Array.from(run('[P.x,P.y]'));
 run(`stepScene(1/30);stepWalkers(1/30);stepDragon(1/30);`);
 if(run('thornwellMotion?.kind==="rowan"')){
  assert.deepEqual(Array.from(run('[npcs.find(n=>n.n==="Rowan the Hunter").x,npcs.find(n=>n.n==="Rowan the Hunter").y]')),Array.from(run('rowanStart')),'Rowan stays at his tavern spot during the approach');
  const now=Array.from(run('[P.x,P.y]'));assert(Math.hypot(now[0]-prior[0],now[1]-prior[1])<=82/30+.01);walked||=now[0]!==prior[0]||now[1]!==prior[1];
 }
 if(run('scene?.npcActor?.n==="Rowan the Hunter"&&scene.lines[0]?.includes("Thank you")')){
  const before=run('scene.npcActor.f');run('faceToward(scene.npcActor,P.x,P.y)');assert.equal(run('scene.npcActor.f'),before,'Rowan faces Corin throughout the conversation');faced=true;
 }
 if(run('!!scene?.thornwellSummons')){kingCall=true;break;}
 run(`if(scene&&!scene.silent&&!scene.hold&&!scene.arriving){typeAll();scene.t=1;advanceScene();}`);
}
assert(faced,'Rowan turns to face Corin for their conversation');assert(walked,'Corin walks along the actual tavern floor');assert(kingCall,'Reunion and departure complete before the king calls');assert.equal(run('brambleQuest'),3);
run('VW=390;VH=420;cam.z=playZoom();followCam();var normalZoom=cam.z;frameThornwellCamera()');
assert(run('cam.z<=normalZoom'),'Summons widens the view');
assert(run('thornwellKing().x>=cam.x&&thornwellKing().x<=cam.x+VW/cam.z&&thornwellKing().y-48>=cam.y&&thornwellKing().y<=cam.y+VH/cam.z'),'King is visible while calling');
assert(run('P.x>=cam.x&&P.x<=cam.x+VW/cam.z&&P.y>=cam.y&&P.y<=cam.y+VH/cam.z'),'Corin remains in frame');
run('scene.after()');assert.equal(run('cam.z'),run('normalZoom'),'Normal target zoom restores as walking starts');assert.equal(run('thornwellMotion.kind'),'approach');
console.log('PASS: automatic Rowan stop, continuous forced walk with Bramble, reunion/departure before royal summons, king-visible camera and normal zoom on the walk.');
