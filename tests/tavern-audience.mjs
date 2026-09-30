import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
await run('loadPublishedEditorLayouts()');
run(`mode='play';quest=Q.DONE;loadMap('tavern');brambleQuest=3;thornwellRoyal.stage=3;syncBrambleParty();syncThornwellRoyals();
P.x=383;P.y=216;scene=null;ask=null;sayNpc=null;fade=0;fadeDir=0;arriveT=0;
var bess=npcs.find(n=>n.n==='Bess'),bessHome=[bess.x,bess.y];thornwellCallBartender(thornwellKing());`);
assert.equal(run('thornwellMotion.kind'),'bartender');
assert(run('bess.packWalk&&bess.packDirections&&!bess.school'),'Bartender uses full directional walking frames');
assert(run("MD.roomActors.find(a=>a.spr==='tavern_anim_9').editorDeleted"),'Counter copy hides during the walk');
let approached=false,returned=false;
for(let i=0;i<800&&!run('!!ask?.conversationPrompt');i++){
 const before=run('[bess.x,bess.y]');
 run(`stepScene(1/30);stepWalkers(1/30);`);
 const after=run('[bess.x,bess.y]');
 assert(Math.hypot(after[0]-before[0],after[1]-before[1])<=68/30+.001,'Bess walks continuously');
 if(run('!!scene?.lines[0]?.includes("Travellers talk")')){
  assert(run('Math.hypot(bess.x-thornwellKing().x,bess.y-thornwellKing().y)<55'),'Interrogation waits until Bess reaches the table');approached=true;
 }
 if(approached&&after[0]<before[0])returned=true;
 run(`if(scene&&!scene.silent&&!scene.hold&&!scene.arriving){typeAll();scene.t=1;advanceScene();}`);
}
assert(approached&&returned);assert.deepEqual(Array.from(run('[bess.x,bess.y]')),Array.from(run('bessHome')));
assert(run("bess.school&&!MD.roomActors.find(a=>a.spr==='tavern_anim_9').editorDeleted"),'One original bartender is restored behind the counter');
assert(run('!!ask?.conversationPrompt'),'Normal audience opens after dismissal');
const scripts=[];c.thornwellAnswer=(n,key,lines,options)=>scripts.push({key,lines,options});
run('for(const t of thornwellKingTopics(thornwellKing()))if(t.category!=="world"||t.n==="The riders before Wingfall")t.go()');
assert.equal(scripts.length,4);for(const t of scripts)assert.equal(t.options.length,3);
assert.match(JSON.stringify(scripts),/fifty years|Fifty years/);assert.match(JSON.stringify(scripts),/hatchling|hunters/);
assert.doesNotMatch(JSON.stringify(scripts),/pays for this meal|pay her|buy the food/);
run(`restoreThornwellRoyal({stage:4,answers:{conquest:'defiant',hunt:'question'}})`);
assert.equal(run('captureThornwellRoyal().answers.conquest'),'defiant');assert.equal(run('captureThornwellRoyal().answers.hunt'),'question');
run(`scene=null;ask=null;sayNpc=null;walker=null;doorMotion=null;fade=0;fadeDir=0;arriveT=0;P.x=256;P.dir='d';P.moving=true;`);
for(const y of [312,320,328,334,335]){c.edgeY=y;run('P.y=edgeY;useDoors(0)');assert.equal(run('doorMotion'),null,'No exit before the edge at '+y);}
run('P.y=336;useDoors(0)');assert(run('doorMotion?.d.to==="world"'),'Exit begins at the last visible floor pixel');
console.log('PASS: Bess walks to the king and returns after dismissal, royal history/hunting choices persist, and the tavern exit waits for the floor edge.');
