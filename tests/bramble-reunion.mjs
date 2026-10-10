import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),console,{furniture:false});
run(`for(const [id,m]of Object.entries(W.maps))prepareDialoguePortraitCast(m,id)`);
assert.equal(run("W.maps.world.npcs.find(n=>n.n==='Wren').charm"),undefined);
assert.equal(run("W.maps.tavern.npcs.find(n=>n.n==='Fen').charm"),'twin');
run("brambleQuest=1;MAPID='world';MD=W.maps.world;quest=Q.DONE;charm.twin=true;openNpcTopics(W.maps.world.npcs.find(n=>n.n==='Wren'))");
assert.equal(run('ask.opts[1].n'),'Who is waiting for Bramble?');run('ask.opts[1].go()');assert.match(run('scene.lines.join(" ")'),/Copper Cup/);
run("sayNpc=null;scene=null;MAPID='tavern';MD=W.maps.tavern;brambleMap='tavern';npcs=[{n:'Rowan the Hunter',x:240,y:220,brambleCompanion:true},{n:'Bramble',pettable:true,x:220,y:212,brambleCompanion:true}]");
c.canStand=c.canNpcStand=()=>true; // Reunion sequencing is independent of the room collision grid.
assert(run('tryBrambleReunion(npcs[0])'));run('scene.after();scene=null');
const dog=run('npcs[1]'),start=[dog.x,dog.y];
run("for(let i=0;i<120&&brambleDeparture.phase==='south';i++)stepThornwellWelcome(1/60)");
assert.equal(run('npcs[0].y'),276);assert.deepEqual([dog.x,dog.y],start);
assert.match(run('scene.lines[0]'),/^Rowan: .*Bramble/);
run('stepThornwellWelcome(.1)');assert.deepEqual([dog.x,dog.y],start,'Dog waits through the call');
run('scene.after();scene=null;for(let i=0;i<8;i++)stepThornwellWelcome(.1)');assert.notDeepEqual([dog.x,dog.y],start,'Dog follows after the call');
console.log('PASS: Fen owns the Twin Heart gift, Bramble hints lead the topic menu, and Rowan walks south before calling the waiting dog.');

for(let i=0;i<1200&&run('!!brambleDeparture');i++){
 run('stepThornwellWelcome(1/60)');
 if(run('!!brambleDeparture&&!brambleDeparture.hunter.away'))assert(run('Math.hypot(brambleDeparture.dog.x-brambleDeparture.hunter.x,brambleDeparture.dog.y-brambleDeparture.hunter.y)>=24'),'Rowan and Bramble keep separate bodies');
}
assert.equal(run('brambleQuest'),3,'Both finish walking through the exit');
