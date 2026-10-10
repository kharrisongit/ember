import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const source=fs.readFileSync('js/generated/game-part-2.js','utf8');
const game=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
const world=JSON.parse(game.run('JSON.stringify(W.maps.world)'));
const c=vm.createContext({MAPID:'world',MD:world,TS:16,P:{x:0,y:0},Q:{ARMED:6,FLED:7},
 npcs:world.npcs.filter(n=>/^shroom_/.test(n.sk||'')),discussedTopics:new Set(),isSolid:()=>false,
 geometryEdits:{},npcCollisionActor:null,clearPadInputs(){},faceToward(){},saveGame(){}});
const run=s=>vm.runInContext(s,c);
run(source.slice(source.indexOf('function doorRect('),source.indexOf('function collisionOverride(')));
run(source.slice(source.indexOf('function canNpcStand('),source.indexOf('function repairSeating(')));
run(fs.readFileSync('js/shroom-lookout.js','utf8'));
run('prepareShroomPatrols()');
const people=run('npcs');
for(const n of people){
 c.testNpc=n;
 assert(!run('shroomPatrolBlocksEntrance(testNpc.x,testNpc.y,testNpc)'),n.n+' starts clear');
 const route=run('patrolRoute(testNpc)');
 for(let i=0;i<route.length;i++){
  const a=route[i],b=route[(i+1)%route.length];
  for(let t=0;t<=1;t+=.025)assert(!run(`shroomPatrolBlocksEntrance(${a[0]+(b[0]-a[0])*t},${a[1]+(b[1]-a[1])*t},testNpc)`),n.n+' never crosses an entrance');
 }
 assert(route.length>1,n.n+' still walks');
}
// The walking-step collision check rejects the full doorstep as well.
for(const door of world.doors.filter(d=>['house28','house29','house51','house52'].includes(d.to))){
 c.testDoor=door;
 assert(!run('canNpcStand(doorRect(testDoor).x+8,doorRect(testDoor).y+8,npcs[0])'));
}
c.playScene=lines=>c.lines=lines;c.faceToward=()=>{};
for(const heard of [false,true]){
 run(`quest=Q.ARMED;discussedTopics.clear();${heard?"discussedTopics.add('Mosslet:crash');":''}talkShroomLookout({n:'Mosslet',shroomLookout:true})`);
 assert(c.lines.some(line=>/Speak with the Shroom King before going on|before you head farther north/i.test(line)), 'King hint appears on first and repeat visits');
}
console.log('PASS: shroom patrols and walking collision checks leave house entrances clear; Mosslet recommends the king before continuing north.');
