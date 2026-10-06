import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {context:c,run}=await loadEditorGame(process.cwd(),console,{furniture:false});
const shown=[];c.showScene=()=>shown.push(run('scene?scene.lines[scene.i]:null'));
c.typeDone=()=>true;c.window.EmberDragonSceneAudio={phase(){}};
run("MAPID='world';quest=Q.ARMED;scene=null;P.x=GREEN.tx*TS+8;P.y=(GREEN.ty+4)*TS;greenFly(.01)");
assert.equal(run('scene'),null,'The approach stays playable until Corin reaches the stump');
for(const dx of [-2,2]){
 c.approach=dx;run("scene=null;greenPhase='off';fade=0;fadeDir=0;pendingActorStage=null;P.x=greenAt().x+approach*TS;P.y=greenAt().y+2*TS;greenFly(.01)");
 assert.equal(run('greenPhase'),'staging','A side approach starts the positioning fade');
 assert.equal(run('fadeDir'),1);assert.equal(run('scene'),null);assert.equal(run('greenOffset()'),null,'Dragon stays hidden until the positioning fade finishes');
 run('pendingActorStage();pendingActorStage=null;fadeDir=0;fade=0;greenFly(.01)');
 assert.equal(run('P.x'),run('greenAt().x'));assert(run('scene.greenEncounter'));
}
run("scene=null;greenPhase='off';greenCamera=null;fadeDir=0;fade=0;pendingActorStage=null");
run('P.x=greenAt().x;P.y=greenAt().y+2*TS;greenFly(.01)');
for(const [w,h]of [[390,510],[844,250],[1280,680]]){
 c.size=[w,h];run('VW=size[0];VH=size[1];frameGreenEncounter()');
 assert(run('(()=>{const g=greenAt();return (g.x-48-cam.x)*cam.z>=0&&(g.x+48-cam.x)*cam.z<=VW&&(g.y-40-cam.y)*cam.z>=0&&(g.y-40-cam.y)*cam.z<VH-100})()'),'Landed dragon stays in view with close framing at '+w+'×'+h);
}
assert.equal(run('cam.z'),run('greenCamera.zoom'),'Dragon scene keeps normal gameplay zoom');
assert.equal(shown.at(-1),"Corin: That's coming straight at me!");
run('stepScene(1.5)');assert(!run('scene.greenTextHidden'),'Flight reaction has time to read');
run('stepScene(.1)');assert(run('scene.greenTextHidden'),'Flight reaction clears after 1.6 seconds');
assert(run('sceneHold()'),'Clearing the text does not release the cinematic');
run('scene.t=1;advanceScene()');assert.equal(run('scene.i'),0,'A cannot skip the flight reaction');
run('greenFly(5.5);stepScene(.1)');assert.equal(run('greenPhase'),'crash');assert.equal(run('scene.i'),0);
run('greenFly(1.1);stepScene(.1)');assert.equal(shown.at(-1),"Corin: Easy. I'm not going to hurt you.");
assert(!run('scene.greenTextHidden'),'The next reaction becomes visible');
run('greenFly(2.1);stepScene(2.1)');assert(!run('scene.greenTextHidden'));
run('greenFly(.1);stepScene(.1)');assert(run('scene.greenTextHidden'),'Concern clears after 2.2 seconds');
assert.equal(run('greenGone'),false,'Breathing continues after the text clears');
run('greenFly(2.7);stepScene(2.7)');assert.equal(run('greenGone'),false);
run('greenFly(.2);stepScene(.2)');assert.equal(run('greenGone'),true);
run('greenFly(.01);greenFly(1.2);stepScene(.1)');assert.equal(run('scene.i'),1);
run('greenFly(2);stepScene(.1)');assert.equal(shown.at(-1),"Corin: Wait—there's an egg here! Is it yours?");
assert(!run('scene.greenTextHidden'),'The final line is visible and awaits confirmation');
assert.equal(run('quest'),run('Q.ARMED'),'Egg quest waits for the final line');
run('scene.t=1;advanceScene()');assert.equal(run('quest'),run('Q.FLED'));assert.equal(run('scene'),null);assert.equal(run('greenCamera'),null,'Normal camera returns after the last line');
console.log('PASS: Corin reacts during flight, after impact, and after departure; pickup unlocks after his final line.');

// The render layer eases every visible zoom without changing simulation targets.
run("cameraPresentation=null;cameraLogical=null;fade=0;mode='play';VW=390;VH=510;greenCamera={zoom:3};cam={x:0,y:0,z:3};presentCamera(1/60)");
run('cam={x:50,y:60,z:2.7};presentCamera(1/60)');
assert(run('cam.z>2.7&&cam.z<3'),'Entry zoom moves partway, never jumps');
run('restoreCameraTarget()');assert.equal(run('cam.z'),2.7,'Simulation retains its intended zoom');
for(let i=0;i<90;i++)run('presentCamera(1/60);restoreCameraTarget()');
run('greenCamera=null;cam={x:0,y:0,z:3};presentCamera(1/60)');
assert(run('cam.z>2.7&&cam.z<3'),'Return zoom also eases');
for(let i=0;i<90;i++)run('restoreCameraTarget();presentCamera(1/60)');
assert(run('Math.abs(cam.z-3)<.001'),'Camera settles at normal zoom');
run('restoreCameraTarget();cam.x+=10;presentCamera(1/60)');
assert.equal(run('cam.x'),10,'Ordinary movement has no camera smoothing lag');
console.log('PASS: zoom entry and return are smooth, simulation targets survive, and normal running stays responsive.');

run("MAPID='world';MW=64;MH=64;terr=new Uint8Array(MW*MH);fobjs=[{id:-1,s:undefined,x:424,y:528}];blockTiles=[];extendStumpTreeLine()");
assert.equal(run('fobjs.filter(o=>o.stumpBorder).length'),26,'Both existing tree rows extend to the stump');
assert(run('[26,34].every(x=>Array.from({length:37},(_,i)=>terr[(20+i)*MW+x]).every(t=>t===WALL))'),'Borders block side exits continuously');
assert(run('Array.from({length:37},(_,i)=>terr[(20+i)*MW+30]).every(t=>t!==WALL)'),'Path to the stump stays open');
run('extendStumpTreeLine()');assert.equal(run('fobjs.length'),26,'Rebuild does not duplicate trees');
console.log('PASS: stump corridor has continuous collision, matching tree rows, and an open approach.');

run('restoreCameraTarget();editing=true;cam.z=1.5;presentCamera(1/60)');
assert.equal(run('cam.z'),1.5,'Editor zoom is immediate');
run('editing=false;cam.z=2;presentCamera(1/60)');
assert.equal(run('cam.z'),2,'Ordinary camera changes are not treated as cutscenes');
run('PXW=1024;PXH=1024;greenCamera={zoom:2};cam.z=1.8;presentCamera(1/60);setZoom(1.4,100,100);restoreCameraTarget()');
assert.equal(run('cam.z'),1.4,'Pinch overrides a pending cinematic frame without restoring its stale target');
run('greenCamera=null');
console.log('PASS: editing zoom is immediate, including interruption of cinematic easing.');

assert(run('fobjs.every(o=>SPR[NAMES[o.s]]&&DEFS[o.s])'),'Every tree in the extended row has drawable art and collision');
assert(run('[26,34].every(x=>Array.from({length:13},(_,i)=>20+i*3).every(y=>fobjs.some(o=>o.x===x*TS+TS/2&&o.y===(y+1)*TS)))'),'Both rows cover the whole previous gap up to the stump');

run("restoreCameraTarget();cameraPresentation=null;cameraLogical=null;greenCamera=null;editing=false;fade=0;cam={x:0,y:0,z:3};presentCamera(1/60);greenCamera={zoom:3};cam.x=70;cam.y=90;presentCamera(1/60)");
assert(run('cam.x>0&&cam.x<70&&cam.y>0&&cam.y<90'),'Stump framing eases position even with unchanged zoom');assert.equal(run('cam.z'),3);
console.log('PASS: same-zoom stump entry pans smoothly without a first-frame jump.');
