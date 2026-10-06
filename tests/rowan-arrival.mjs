import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){}});
await run('loadPublishedEditorLayouts()');
run(`mode='play';quest=Q.DONE;dragon.on=true;dragonIntroDone=true;templeCompass.owned=true;
loadMap('tavern');[P.x,P.y]=MD.spawn;brambleQuest=1;thornwellRoyal.stage=1;syncBrambleParty();syncThornwellRoyals();fadeDir=0;fade=0;doorMotion=null;scene=null;ask=null;sayNpc=null;
var startAt=[P.x,P.y];stepThornwellRoyal(1/30);`);
assert.match(run('scene?.lines[0]||""'),/^Rowan: Bramble! Corin, is he with you\?/ ,'Rowan stops the player automatically on arrival');
run('var rowan=npcs.find(n=>n.n==="Rowan the Hunter"),rowanStart=[rowan.x,rowan.y];scene.after();var approachEnd=thornwellMotion.path.at(-1).slice()');assert.equal(run('thornwellMotion.kind'),'rowan');
assert(run('Math.hypot(approachEnd[0]-rowan.x,approachEnd[1]-rowan.y)<=28.01'),'Approach ends within speaking distance');
assert.deepEqual(Array.from(run('[P.x,P.y]')),Array.from(run('startAt')),'No teleport to Rowan');
let walked=false,kingCall=false,faced=false,calledDog=false,straightExit=false;
for(let i=0;i<2400;i++){
 const prior=Array.from(run('[P.x,P.y]'));
 run(`if(scene?.silent)advanceScene();stepScene(1/30);stepWalkers(1/30);stepDragon(1/30);`);
 if(run('thornwellMotion?.kind==="rowan"')){
  assert.deepEqual(Array.from(run('[npcs.find(n=>n.n==="Rowan the Hunter").x,npcs.find(n=>n.n==="Rowan the Hunter").y]')),Array.from(run('rowanStart')),'Rowan stays at his tavern spot during the approach');
  const now=Array.from(run('[P.x,P.y]'));assert(Math.hypot(now[0]-prior[0],now[1]-prior[1])<=82/30+.01);walked||=now[0]!==prior[0]||now[1]!==prior[1];
  const expected=run("Math.abs(P.x-rowan.x)>Math.abs(P.y-rowan.y)?(P.x<rowan.x?'w':'e'):(P.y<rowan.y?'u':'d')");
  assert.equal(run('rowan.kf'),expected,'Rowan watches Corin throughout the approach');
 }
 if(run('scene?.npcActor?.n==="Rowan the Hunter"&&scene.lines[0]?.includes("Bramble!")')){
  assert.deepEqual(Array.from(run('[P.x,P.y]')),Array.from(run('approachEnd')),'Dialogue waits for the complete approach');
  const expected=run("Math.abs(P.x-rowan.x)>Math.abs(P.y-rowan.y)?(P.x<rowan.x?'w':'e'):(P.y<rowan.y?'u':'d')");
  assert.equal(run('rowan.kf'),expected,'Rowan faces Corin throughout every dialogue line');
  assert.equal(run("rowan.f==='s'?(rowan.flip?'w':'e'):rowan.f"),expected,'Rendered sprite direction matches his facing');
  assert.equal(run('P.moving||P.scriptWalking'),false,'Corin stops walking before talking');faced=true;
 }
 if(run('brambleDeparture?.phase==="calling"')){
  assert(run('scene.faceTarget===brambleDeparture.dog'),'Rowan calls Bramble, not Corin');
  assert.equal(run('brambleDeparture.hunter.kf'),'u','Rowan turns back toward the waiting dog');
  assert(!run('brambleDeparture.hunter.scriptWalking||brambleDeparture.dog.scriptWalking'),'Both stop during the call');calledDog=true;
 }
 if(run('brambleDeparture?.phase==="leaving"&&!!brambleDeparture.path')){
  assert(run('brambleDeparture.parallel'),'The real forced approach gives both a clear straight lane');
  assert.equal(run('brambleDeparture.hunter.x'),256);assert.equal(run('brambleDeparture.dog.x'),228);
  assert(run('Math.abs(brambleDeparture.hunter.x-brambleDeparture.dog.x)>=24'),'Their bodies remain separate');straightExit=true;
 }
 if(run('!!scene?.thornwellSummons')){kingCall=true;break;}
 run(`if(scene&&!scene.silent&&!scene.hold&&!scene.arriving){typeAll();scene.t=1;advanceScene();}`);
}
assert(faced,'Rowan turns to face Corin for their conversation');assert(walked,'Corin walks along the actual tavern floor');assert(kingCall,'Reunion and departure complete before the king calls');assert.equal(run('brambleQuest'),3);
assert(calledDog&&straightExit,'The stop, turn, call and straight departure all run in the real scene');
run('VW=390;VH=420;cam.z=playZoom();followCam();var normalZoom=cam.z;frameThornwellCamera()');
assert.equal(run('cam.z'),run('normalZoom'),'Summons preserves the normal zoom');
assert(run('thornwellKing().x>=cam.x&&thornwellKing().x<=cam.x+VW/cam.z&&thornwellKing().y-48>=cam.y&&thornwellKing().y<=cam.y+VH/cam.z'),'King is visible while calling');
assert.equal(run('cam.x+VW/cam.z/2'),run('thornwellKing().x'),'Camera centers the king while he calls');
run('scene.after()');assert.equal(run('cam.z'),run('normalZoom'),'Normal target zoom restores as walking starts');assert.equal(run('thornwellMotion.kind'),'approach');
console.log('PASS: forced approach, Rowan turns back to call Bramble, both leave straight, and the camera pans to the king without zooming before following Corin.');
