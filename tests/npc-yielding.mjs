import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),console,{furniture:false});
run(`MAPID='test';mode='play';scene=null;sayNpc=null;ask=null;editing=false;P.x=100;P.y=100;
  npcHere=n=>!n.away&&!n.editorDeleted;stepHettie=()=>{};stepThornwellWelcome=()=>{};stepThornwellRoyal=()=>{};
  MD={roomBlocks:[],npcs:[],features:[]};MW=20;MH=20;solid=new Uint8Array(400);terr=new Uint8Array(400);
  npcs=[{n:'Patrol',x:100,y:60,goto:[100,140],patrol:true,patrolSpeed:24}];`);
for(let i=0;i<300;i++)run('stepWalkers(.05)');
assert(run('npcs[0].y<=76&&npcs[0].y>74'),'Patrol waits one and a half tiles away');
assert(run('npcs[0].goto[1]===140'),'Waiting never teleports or discards the patrol leg');
run('P.x=160');for(let i=0;i<120;i++)run('stepWalkers(.05)');
assert.equal(run('npcs[0].y'),140,'The same patrol resumes when Corin moves away');
for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
 run('P.x=100;P.y=100;npcs=[{n:"Overlap",x:100,y:100,goto:[120,100]}]');
 assert(run(`canStand(${100+dx},${100+dy})`),'Corin can escape an existing body overlap in every direction');
}
run('P.x=100;P.y=114;npcs=[{n:"Overlap",x:100,y:100}]');assert(run('canStand(100,115)'),'Corin escapes the foot buffer too');
run('P.x=100;P.y=100;MD.roomBlocks=[[100,0,120,200]]');assert(!run('canStand(101,100)'),'Escaping never disables walls');
run('MD.roomBlocks=[];npcs.push({n:"Other",x:114,y:100})');assert(!run('canStand(103,100)'),'Other bodies remain solid during escape');
run('P.x=100;P.y=125;npcs=[{n:"Walker",x:100,y:100,goto:[100,60]}]');assert(!run('canStand(100,108)'),'Moving NPCs keep solid bodies');
run('P.x=100;P.y=100;npcs=[{n:"Overlap",x:102,y:100,patrol:true}]');
assert(run('npcStepClearsPlayer(npcs[0],103,100)'),'An overlapping NPC can move away');
assert(!run('npcStepClearsPlayer(npcs[0],96,100)'),'It cannot move through Corin even if the endpoint is farther away');
console.log('PASS: patrol stop/wait/resume, overlap escape, wall and other-NPC protection, moving bodies and NPC outward recovery.');
