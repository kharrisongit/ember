import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),console,{furniture:false});
await run('loadPublishedEditorLayouts()');
run("quest=Q.DONE;brambleQuest=1;P.x=256;P.y=250;loadMap('tavern',true);syncBrambleParty()");
const realClear=c.canNpcStand;
for(const dogPosition of [[260,254],[264,248],[240,270],[296,230]]){
 c.dogPosition=dogPosition;
 run(`{scene=null;walker=null;brambleQuest=1;brambleDeparture=null;
 const hunter=brambleActor('Rowan the Hunter'),dog=brambleActor('Bramble');hunter.x=256;hunter.y=220;dog.x=dogPosition[0];dog.y=dogPosition[1];
 npcs=npcs.filter(n=>!n.brambleCompanion);npcs.push(hunter,dog);brambleMap='tavern';
 tryBrambleReunion(hunter);scene.after();scene=null;
 for(let i=0;i<600&&brambleDeparture.phase!=='calling';i++)stepThornwellWelcome(1/60);}`);
 assert.equal(run('brambleDeparture.phase'),'calling');
 // Simulate a temporary obstruction at the first route attempt.
 c.canNpcStand=()=>false;run('scene.after();scene=null');
 assert.equal(run('brambleDeparture.path'),null);
 c.canNpcStand=realClear;
 for(let i=0;i<2400&&run('brambleDeparture!==null');i++)run('stepThornwellWelcome(1/60)');
 assert.equal(run('brambleDeparture'),null,'Both actors finish leaving from '+dogPosition);
 assert.equal(run('brambleQuest'),3);
 assert.equal(run('npcs.some(n=>n.brambleCompanion)'),false);
}
console.log('PASS: close, overlapping and separated Bramble positions leave the real tavern with Rowan, including recovery after a blocked route.');
