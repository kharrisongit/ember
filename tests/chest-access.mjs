import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
c.saveGame=()=>{};c.toast=()=>{};c.flyGold=()=>{};
// Exercise the same handlers used by A, with Corin approaching each side and corner.
for(const [dx,dy] of [[0,-28],[28,0],[0,28],[-28,0],[20,-20],[20,20],[-20,20],[-20,-20]]){
 for(const boss of [false,true]){
  run(`MAPID='house22';MD={roomActors:[{x:100,y:100,houseLoot:{id:'access',gold:7,bossReward:${boss}}}]};
   P.x=${100+dx};P.y=${100+dy};houseLootTaken.clear();gold=0;`);
  assert(run('tryHouseLootChest()'),`House/boss chest accessible at ${dx},${dy}`);
  assert.equal(run('gold'),7);run('tryHouseLootChest()');assert.equal(run('gold'),7,'No duplicate reward');
 }
 run(`MAPID='royal_treasury';MD={};foes=[];foesHeld=false;treasuryTaken.clear();gold=0;
 P.x=TREASURY_CHESTS[0].x+${dx};P.y=TREASURY_CHESTS[0].y+${dy};`);
 assert(run('tryTreasuryChest()'),`Treasury accessible at ${dx},${dy}`);
 assert.equal(run('gold'),600);run('tryTreasuryChest()');assert.equal(run('gold'),600);
 for(const i of [0,1,2]){
  run(`MAPID=CHESTS[${i}].map;chestAnim=null;delete chestOpen[MAPID];breathHas[CHESTS[${i}].gift]=false;
   P.x=CHESTS[${i}].x*TS+TS/2+${dx};P.y=CHESTS[${i}].y*TS+TS+${dy};`);
  assert(run('tryChest()'),`Heartstone ${i} accessible at ${dx},${dy}`);
  assert.equal(run('chestAnim.phase'),'lid');
 }
}
run(`MAPID='house22';MD={roomActors:[{x:100,y:100,houseLoot:{id:'far',gold:7}}]};P.x=100;P.y=150`);
assert(!run('tryHouseLootChest()'),'Out-of-reach chest is ignored');
console.log('PASS: household, boss, treasury and all Heartstone chests open from all eight directions, without duplicate rewards.');
