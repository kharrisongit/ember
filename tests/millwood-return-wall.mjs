import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
let messages=[];c.toast=s=>messages.push(s);
run("MAPID='world';mode='play';editing=false;P.x=480;P.y=404*TS-2;quest=Q.NOISE");
assert(run('swordReturnMoveAllowed(480,404*TS+2)'));
for(const stage of ['ARMED','FLED','CARRY']){run('quest=Q.'+stage);assert(!run('swordReturnMoveAllowed(480,404*TS+2)'));assert(run('swordReturnWall(480,404*TS+2)'));assert(run('swordReturnMoveAllowed(480,P.y-5)'),'Can continue north');}
assert.deepEqual(messages,['there’s no going back now'],'One notice while held against wall');
run('quest=Q.DONE');assert(run('swordReturnMoveAllowed(480,404*TS+2)'));assert(!run('swordReturnWall(480,404*TS+2)'));
run("prepareRegionalVillagers(W.maps.world,'world');prepareFarmResident(W.maps.world,'world');prepareFarmResident(W.maps.world,'world')");
for(const name of ['Gwil','Tilda']){c.name=name;assert(run("W.maps.world.npcs.find(n=>n.n===name).x>500"));assert(run("W.maps.world.npcs.find(n=>n.n===name).y>6700"));}
console.log('PASS: town placements, sword-stage return barrier, exact throttled message and reopening after the opening story.');
