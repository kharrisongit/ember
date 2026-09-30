import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
assert.equal(run("Object.values(W.maps).flatMap(m=>m.npcs||[]).some(n=>n.n==='Greta')"),false,'Greta is absent from every map');
assert.equal(run("DOCK_ORIGINAL_ASSETS.some(a=>a.name==='greta_idle')"),false,'Her retired sprite is not loaded');
assert.equal(run("[NPC_STORIES,NPC_EXTRA_TOPICS,NPC_WORLD_TALKS,NPC_TOPIC_GREETINGS,CORIN_TOPIC_GREETINGS,DIALOGUE_PORTRAITS].some(cast=>cast.Greta)"),false,'Her dialogue and portrait are retired');
assert.equal(run("Object.values(CONVERSATION_BRANCH_DATA.topics).some(t=>t.name==='Greta')"),false);
run("mode='play';quest=Q.DONE;dragonOff=false;dragon.on=true;thornwellRoyal.stage=7;brambleQuest=3;dragonIntroDone=true");
const ids=run("Object.keys(W.maps).filter(id=>/^mine/.test(id))");
assert.equal(ids.length,5);
// Enter each gallery through its real door and tick the actual companion code.
// Loading only the mine avoids the expensive overworld scenery preparation.
run("loadMap('mine');scene=null;ask=null;sayNpc=null;dragon.placed='world'");
let transitions=0;
for(const id of [...ids,...ids.slice(0,-1).reverse()]){
  c.targetMap=id;
  if(run('MAPID!==targetMap')){
    assert(run('MD.doors.some(d=>d.to===targetMap)'),id+' is connected');
    run("pendingDoor=MD.doors.find(d=>d.to===targetMap);fade=1;fadeDir=1;useDoors(0);fade=0;fadeDir=0");
    transitions++;
  }
  assert.equal(run('MAPID'),id);
  assert(run('dragonAllowedInMap(MAPID)&&dragonHere()'),id+' keeps Aurelius present');
  run('scene=null;ask=null;sayNpc=null;stepDragon(1/60)');
  assert.equal(run('dragon.placed'),id,id+' places him in the new gallery');
  assert(run('Number.isFinite(dragon.x)&&Number.isFinite(dragon.y)'),id+' has a valid position');
  assert(run('Math.hypot(dragon.x-P.x,dragon.y-P.y)<100'),id+' places him beside Corin');
}
assert.equal(transitions,8);
for(const id of ['world','tp1','ds1','sn1','cinderhold']){c.targetMap=id;assert(run('dragonAllowedInMap(targetMap)'),id+' remains allowed');}
for(const id of ['tavern','school','inn','house22','smithy']){c.targetMap=id;assert.equal(run('dragonAllowedInMap(targetMap)'),false,id+' remains restricted');}
console.log('PASS: Greta is removed; Aurelius accompanies Corin through all five mine levels and eight forward/return transitions.');
