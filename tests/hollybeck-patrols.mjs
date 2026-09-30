import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
run(`MAPID='world';MD=W.maps.world;quest=Q.DONE;scene=null;ask=null;sayNpc=null;
canNpcStand=()=>true;stepHettie=()=>{};stepThornwellWelcome=()=>{};stepThornwellRoyal=()=>{};
var villagers=['sverre','runa','tobin'].map((name,i)=>({n:name,packSpr:'hollybeck_'+name,x:100+i*100,y:200,patrol:true,patrolPoints:[[100+i*100,200],[150+i*100,220]],routeSeed:i,patrolSpeed:24}));
npcs=villagers;`);
for(let i=0;i<3;i++){
 const route=run(`patrolRoute(villagers[${i}])`),start=run(`[villagers[${i}].x,villagers[${i}].y]`);
 assert(route.length>1);assert(route.every(p=>p[0]===start[0]),'Patrol ignores legacy east/west route points');
 c.routePoint=route[1];run(`villagers[${i}].goto=routePoint;stepWalkers(1/30)`);
 assert.equal(run(`villagers[${i}].x`),start[0]);assert.notEqual(run(`villagers[${i}].y`),start[1]);
 run(`faceToward(villagers[${i}],villagers[${i}].x+100,villagers[${i}].y)`);
 assert.equal(run(`villagers[${i}].kf`),'e','Idle NPC can face east toward Corin');
 run(`faceToward(villagers[${i}],villagers[${i}].x-100,villagers[${i}].y)`);
 assert.equal(run(`villagers[${i}].kf`),'w','Idle NPC can face west toward Corin');
 run(`villagers[${i}].goto=[villagers[${i}].x+20,villagers[${i}].y];stepWalkers(1/30)`);
 assert.equal(run(`villagers[${i}].x`),start[0],'Stale horizontal destinations never cause a side step');
}
for(const name of ['Sverre','Runa','Tobin']){
 assert.match(run(`portraitFor('${name}').src`),new RegExp('hollybeck-'+name.toLowerCase()+'\\.webp'));
}
console.log('PASS: Hollybeck north/south patrols, free east/west facing, old route rejection and matching portrait files.');
