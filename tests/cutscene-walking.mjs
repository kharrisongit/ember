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
// Walking actors face the route, even when Corin stands in another direction.
c.stepHettie=()=>{};c.stepThornwellWelcome=()=>{};c.canNpcStand=()=>true;c.npcHere=()=>true;
for(const name of ['Nan Ferrow','Elder Maddock']){
 c.actor={n:name,x:0,y:0,f:'s',flip:false,packDirections:true,scriptWalking:true,goto:[80,40]};
 run("editing=false;MAPID='world';npcs=[actor];walker=actor;scene={who:actor.n};sayNpc=null;ask=null;P.x=-100;P.y=100;stepWalkers(1/60)");
 assert.equal(c.actor.f,'s');assert.equal(c.actor.flip,false,'Actor faces east along the route, not west toward Corin');
 run('faceToward(actor,actor.x,actor.y)');assert.equal(c.actor.f,'s','An exact waypoint preserves facing');
}
console.log('PASS: cutscene routes straighten without crossing obstacles; Nan and Maddock keep their travel direction at and between waypoints.');
