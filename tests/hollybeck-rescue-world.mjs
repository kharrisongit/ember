import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
context.assert=assert;
await run('loadPublishedEditorLayouts()');
run(`
mode='play';gameplayStarted=true;quest=Q.DONE;loadMap('world');
const party=npcs.filter(n=>n.hollybeckRescue);
assert.equal(party.length,2);assert(party.every(n=>npcHere(n)&&!n.noTalk));
for(const n of party){
 assert(SPR[n.packSpr+'_idle_d'],'Winter sprite loaded for '+n.n);
 assert(canNpcStand(n.x,n.y,n),'Clear standing position for '+n.n);
 assert(canStand(n.x,n.y+24),'Accessible talking position for '+n.n);
}
const sled=MD.roomActors.find(a=>a.editKey==='hollybeck-rescue:sled');
assert(sled&&SPR[sled.spr]);assert(!canStand(sled.x,sled.y-20),'Sled has physical collision');
// Verify an actual walkable route from the north edge of the boss glade to
// both conversation positions, using the real published collision map.
const x0=2339*16,y0=127*16,x1=2353*16,y1=164*16;
const queue=[[2346*16,163*16]],seen=new Set();
for(let i=0;i<queue.length;i++){
 const [x,y]=queue[i];
 for(const [dx,dy]of [[8,0],[-8,0],[0,8],[0,-8]]){
  const nx=x+dx,ny=y+dy,key=nx+','+ny;
  if(nx<x0||nx>x1||ny<y0||ny>y1||seen.has(key)||!canStand(nx,ny))continue;
  seen.add(key);queue.push([nx,ny]);
 }
}
for(const n of party)assert(queue.some(([x,y])=>Math.hypot(x-n.x,y-(n.y+24))<=8),'Path from moth glade to '+n.n);
assert(npcStoryTopics(npcs.find(n=>n.n==='Astrid')).some(t=>t.title==='You seem worried'));
assert(npcStoryTopics(npcs.find(n=>n.n==='Sverre')).some(t=>t.title==='The beast on the northern trail'));
const before=[MD.npcs.length,MD.roomActors.length,MD.roomBlocks.length];HollybeckRescue.installWorld(MD);
assert.deepEqual([MD.npcs.length,MD.roomActors.length,MD.roomBlocks.length],before,'Reinstall never duplicates party or props');
loadMap('house22');loadMap('world');assert.equal(npcs.filter(n=>n.hollybeckRescue).length,2,'Retained map return keeps both travelers');
`);
console.log('PASS: published winter camp, sprite readiness, sled collision, walkable rescue approach, live Hollybeck topics, idempotent installation and interior return.');
