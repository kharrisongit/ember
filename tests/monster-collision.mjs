import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
context.assert=assert;await run('inflateAtlas()');
run(`
mode='play';quest=Q.DONE;gameplayStarted=true;dragonReady=true;EmberRiding.skip();thornwellRoyal.stage=7;
scene=null;bossScene=null;ask=null;ovl=null;revealing=false;fadeDir=0;foesHeld=false;dragonIntroDone=true;
EmberArenaEntry={...EmberArenaEntry,holding:()=>false,protected:()=>false};
MAPID='world';MD={w:64,h:64,npcs:[],doors:[],roomActors:[],features:[]};
MW=64;MH=64;PXW=1024;PXH=1024;solid=new Uint8Array(MW*MH);terr=new Uint8Array(MW*MH);
npcs=[];objs=[];fobjs=[];features=[];fenceAt=null;arenaLock=null;arenaT=0;mounted=false;running=false;dragon.on=false;
var testedKinds=[...new Set([...Object.keys(FOE),'frosthorn','icemoth','spiderqueen'])];
for(const kind of testedKinds){
 const f={kind,x:480,y:480,hx:480,hy:480,hp:100,st:'idle'};foes=[f];
 const body=combatBody(f),player=combatBody(P);
 // Walk into each solid side through the real player movement function.
 for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
  P.x=f.x-dx*80;P.y=f.y-dy*80;
  for(let i=0;i<110;i++)movePlayer(dx,dy,1/60);
  assert(!combatBodyBlocks(P,P.x,P.y,f,false),kind+' blocks without embedding Corin');
  assert(Math.hypot(P.x-f.x,P.y-f.y)<body.h+player.w+8,kind+' stops at its body, not a large invisible wall');
  assert(dx?Math.sign(P.x-f.x)===-dx:Math.sign(P.y-f.y)===-dy,kind+' cannot be walked through');
 }
 // Large frames cannot jump from one clear side to the other.
 P.x=400;P.y=475;movePlayer(1,0,2);assert.equal(P.x,400,kind+' swept horizontal collision');
 P.x=480;P.y=400;movePlayer(0,1,2);assert.equal(P.y,400,kind+' swept vertical collision');
 // Corin can pass behind its upper artwork, above the lower body.
 P.x=440;P.y=480-body.h-2;movePlayer(1,0,80/118);assert.equal(P.x,520,kind+' upper body is passable');
 // Diagonal contact slides around the lower box instead of clipping through it.
 P.x=480-body.w-player.w-1;P.y=472;
 movePlayer(1,-1,1/60);assert(!combatBodyBlocks(P,P.x,P.y,f,false));assert(P.y<472);
 // Old overlapping positions may escape, but cannot cross the body's centre.
 P.x=480-body.w-player.w+2;P.y=472;
 const before=P.x;movePlayer(1,0,1/60);assert.equal(P.x,before);movePlayer(-1,0,1/60);assert(P.x<before);
 // The other half of collision: an approaching monster cannot enter Corin.
 P.x=520;P.y=480;f.x=480;
 assert(!combatBodiesClear(f,550,480),kind+' cannot sweep through Corin');
 for(let i=0;i<45;i++)moveCombatActor(f,2,0);
 assert(!combatBodyBlocks(f,f.x,f.y,P,false),kind+' AI preserves body separation');
 for(const state of [{st:'dead'},{hp:0},{ally:true},{storyPassive:true}]){
  Object.assign(f,{x:480,y:480,hp:100,st:'idle',ally:false,storyPassive:false},state);
  P.x=400;P.y=475;movePlayer(1,0,160/118);assert.equal(P.x,560,kind+' inactive/friendly body is passable');
 }
}
// Companion movement and scenery repair preserve the same separation.
foes=[{kind:'boneguard',x:480,y:480,hp:100,st:'idle'}];
Object.assign(dragon,{x:400,y:475,on:true,placed:'world',down:false});
assert(!combatBodiesClear(dragon,560,475));
foesHeld=true;P.x=400;P.y=475;movePlayer(1,0,160/118);assert.equal(P.x,560);
foesHeld=false;foes[0].x=P.x;foes[0].y=P.y;
arenaLock={x:35,y:29,r:6.8};arenaT=1;
const before={x:foes[0].x,y:foes[0].y};recoverCombatFooting(foes[0]);
assert.equal(foes[0].x,before.x);assert.equal(foes[0].y,before.y,'Body contact never teleports a monster');
`);
console.log('PASS: '+run('testedKinds.length')+' monster types, four sides, sliding, fast movement, upper-body clearance, overlap escape, reciprocal AI/dragon collision and inactive bodies.');
