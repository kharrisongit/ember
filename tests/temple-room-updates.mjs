import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
let enlarged=0,protectedRooms=0;
for(const folder of ['first-temple','sandspire-temple','hollybeck-temple']){
 const path='assets/interiors/'+folder+'/layout.json';
 const before=JSON.parse(fs.readFileSync('tests/fixtures/temple-room-baseline.json'))[folder],after=JSON.parse(fs.readFileSync(path));
 for(const [id,old] of Object.entries(before)){
  const now=after[id];
  old.chambers.forEach((r,i)=>{
   const keep=old.heartstone&&old.heartstone[0]>=r[0]&&old.heartstone[0]<r[2]&&old.heartstone[1]>=r[1]&&old.heartstone[1]<r[3]||old.enemies.some(e=>e[0].startsWith('golem')&&JSON.stringify(e[3])===JSON.stringify(r));
   if(keep){assert.deepEqual(now.chambers[i],r,id+' protected room');protectedRooms++;}
   else{const n=now.chambers[i];assert.equal(n[2]-n[0],Math.round((r[2]-r[0])*1.15/16)*16);assert.equal(n[3]-n[1],Math.round((r[3]-r[1])*1.15/16)*16);enlarged++;}
  });
  (old.hazards||[]).forEach((h,i)=>{assert.deepEqual(now.hazards[i].cross,h.cross,'No wider trap halls');assert.deepEqual(now.hazards[i].lines,h.lines,'No stretched trap spacing');});
 }
}
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){} });
await run('loadPublishedEditorLayouts()');
run(`for(const [id,m]of Object.entries(W.maps))if((m.firstTemple||m.sandspire||m.hollybeck)){prepareEditorEntities(m,id);applyPublishedEditorLayout(m,id);}`);
const maps=JSON.parse(run(`JSON.stringify(Object.entries(W.maps).filter(([,m])=>(m.firstTemple||m.sandspire||m.hollybeck)).map(([id,m])=>({id,plan:m.templePlan,actors:m.roomActors,blocks:m.roomBlocks})))`));
let levers=0,chests=0;
const clear=(m,x,y)=>[[x-5.5,y-7],[x+5.5,y-7],[x-5.5,y-1],[x+5.5,y-1]].every(([px,py])=>m.plan.floors.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&!m.blocks.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b));
for(const m of maps){
 for(const a of m.actors.filter(a=>a.houseLoot||a.editorChestKind==='heartstone')){
  const r=m.plan.chambers.find(([l,t,r,b])=>a.x>l&&a.x<r&&a.y>t&&a.y<b);assert(r,m.id+' chest belongs to room');
  assert.equal(a.y,r[1]+24,m.id+' chest against north wall');assert([r[0]+24,r[2]-24].includes(a.x),m.id+' chest in north corner');
  assert(clear(m,a.x,a.y+30),m.id+' chest can be approached');chests++;
 }
 for(const h of m.plan.hazards||[]){
  const a=m.actors.find(a=>a.expandedLever===h.id),mid=(h.cross[0]+h.cross[1])/2;
  assert.deepEqual(h.lever,[a.x,a.y],m.id+' interaction follows published actor');
  assert(a.x>mid&&a.x<h.cross[1],m.id+' lever east of exit');
  const hall=m.plan.floors.find(([l,t,r,b])=>l===h.cross[0]&&r===h.cross[1]&&t<=Math.min(...h.lines)&&b>=Math.max(...h.lines));
  assert(hall&&a.y>hall[1]&&a.y<Math.min(...h.lines),m.id+' lever inside its own trap hall');
  assert(clear(m,a.x,a.y+8),m.id+' lever accessible');levers++;
 }
}
run(`MAPID='tp1';MD=W.maps.tp1;foesHeld=false;for(const k in bossGone)delete bossGone[k];tAcc=2/1.5;`);assert.equal(run("expandedSpikeFrame({id:'pilgrim',phase:0})"),1,'Spikes warn after 1.33 seconds, not two');
run("tAcc=2.7/1.5");assert.equal(run("expandedSpikeFrame({id:'pilgrim',phase:0})"),3);
run("bossGone['tp1:spikes:pilgrim']=true");assert.equal(run("expandedSpikeFrame({id:'pilgrim',phase:0})"),0,'Levers still permanently disable faster spikes');
console.log(`PASS: ${enlarged} enlarged rooms, ${protectedRooms} unchanged Heartstone/golem rooms, unchanged hall widths/trap spacing, ${chests} reachable north-corner chests and ${levers} accessible east-exit levers after published edits; faster spikes.`);
