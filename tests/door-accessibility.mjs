import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
await run('loadPublishedEditorLayouts()');
run(`mode='play';gameplayStarted=true;quest=Q.DONE;wonAll=1;foesHeld=true;
window.EmberArenaEntry=undefined;window.EmberEncounterCard=undefined;window.EmberRiding=undefined;window.EmberEquipmentTutorial=undefined;
thornwellRoyal.stage=7;dragon.on=false;`);
const maps=JSON.parse(run(`JSON.stringify(Object.entries(W.maps).filter(([id,m])=>!m.templeLegacy&&(m.royal||id==='cinderhold'||m.templeExpanded||/^mine/.test(id))).map(([id])=>id))`));
const failures=[];let checked=0;
for(const id of maps){
 const report=JSON.parse(run(`JSON.stringify((()=>{
 loadMap(${JSON.stringify(id)});scene=null;sayNpc=null;bossScene=null;ovl=null;ask=null;fadeDir=0;doorMotion=null;pendingDoor=null;arriveT=0;arenaLock=null;foes=[];P.act=null;
 [P.x,P.y]=MD.spawn;const origin=[P.x,P.y],bad=[],passed=[];
 // Flood the real collision map from the room entrance, rather than accepting
 // a trigger position stranded on the far side of a wall.
 const step=4,width=Math.ceil(PXW/step),height=Math.ceil(PXH/step),seen=new Uint8Array(width*height),queue=[];
 const visit=(x,y)=>{
  if(x<0||y<0||x>=width||y>=height)return;
  const key=y*width+x;if(seen[key])return;seen[key]=1;
  if(!canStand(x*step,y*step))return;seen[key]=2;queue.push(key);
 };
 visit(Math.round(origin[0]/step),Math.round(origin[1]/step));
 for(let i=0;i<queue.length;i++){
  const key=queue[i],x=key%width,y=Math.floor(key/width);P.x=x*step;P.y=y*step;
  visit(x-1,y);visit(x+1,y);visit(x,y-1);visit(x,y+1);
 }
 const connected=(x,y)=>{
  for(let gy=Math.floor(y/step);gy<=Math.ceil(y/step);gy++)for(let gx=Math.floor(x/step);gx<=Math.ceil(x/step);gx++)
   if(seen[gy*width+gx]===2&&canStand((x+gx*step)/2,(y+gy*step)/2))return true;
  return false;
 };
 if(!queue.length)bad.push({spawn:origin,reason:'Spawn is blocked'});
 for(const [from,source] of Object.entries(W.maps))for(const entry of source.doors||[])if(entry.to===MAPID){
  P.x=entry.tx*16+8;P.y=entry.ty*16+16;recoverTempleArrival(!!MD.templeContinuous);
  if(!canStand(P.x,P.y)||!connected(P.x,P.y))bad.push({from,arrival:[P.x,P.y],reason:'Arrival cannot reach room floor'});
 }

 for(const [index,d]of MD.doors.entries()){
  const r=doorRect(d,index),want=doorExitDirection(d);let found=null,standable=0;
  for(let y=Math.floor(r.y-24);y<=r.y+r.h+32&&!found;y+=2)for(let x=Math.floor(r.x-24);x<=r.x+r.w+24&&!found;x+=2){
   if(!canStand(x,y)||!connected(x,y))continue;standable++;
   P.x=x;P.y=y;P.moving=true;P.dir=want==='l'||want==='r'?'s':want;P.flip=want==='l';
   doorMotion=null;pendingDoor=null;fadeDir=0;useDoors(0);
   if((doorMotion?.d||pendingDoor)===d)found=[x,y];
  }
  doorMotion=null;pendingDoor=null;fadeDir=0;
  if(found)passed.push({index,to:d.to,point:found});else bad.push({index,to:d.to,rect:r,dir:want,standable});
 }
 return {id:MAPID,origin,doors:MD.doors.length,bad,passed};
})())`));
 checked+=report.doors;if(report.bad.length)failures.push(report);
}
console.log(JSON.stringify({maps:maps.length,checked,failures},null,2));
assert.equal(failures.length,0,'Every interior door has a walkable position which activates the actual door handler');
// Exterior entrances must activate from an approach connected to open ground.
const outside=JSON.parse(run(`JSON.stringify((()=>{
 loadMap('world');scene=null;sayNpc=null;bossScene=null;fadeDir=0;doorMotion=null;pendingDoor=null;arriveT=0;arenaLock=null;P.act=null;
 const targets=new Set(${JSON.stringify(maps)}),bad=[];let count=0;
 for(const [index,d]of MD.doors.entries()){
  if(!targets.has(d.to))continue;count++;
  const r=doorRect(d,index),want=doorExitDirection(d),away={u:[0,1],d:[0,-1],l:[1,0],r:[-1,0]}[want];let found=false;
  for(let y=Math.floor(r.y-24);y<=r.y+r.h+32&&!found;y+=2)for(let x=Math.floor(r.x-24);x<=r.x+r.w+24&&!found;x+=2){
   P.x=x;P.y=y;if(!canStand(x,y))continue;
   let approach=true;for(let dist=4;dist<=24;dist+=4)if(!canStand(x+away[0]*dist,y+away[1]*dist)){approach=false;break;}
   if(!approach)continue;
   P.moving=true;P.dir=want==='l'||want==='r'?'s':want;P.flip=want==='l';doorMotion=null;pendingDoor=null;fadeDir=0;useDoors(0);
   found=(doorMotion?.d||pendingDoor)===d;
  }
  doorMotion=null;pendingDoor=null;fadeDir=0;
  if(!found)bad.push({to:d.to,rect:r,reason:'No connected exterior approach'});
 }
 for(const id of targets)for(const d of W.maps[id].doors||[])if(d.to==='world'){
  P.x=d.tx*16+8;P.y=d.ty*16+16;
  if(!canStand(P.x,P.y))bad.push({from:id,point:[P.x,P.y],reason:'Exterior arrival blocked'});
 }
 return {count,bad};
})())`));
assert.deepEqual(outside.bad,[],'Exterior entrances and return positions are walkable');
console.log(`PASS: ${maps.length} interiors, ${checked} connected interior triggers and their arrivals, plus ${outside.count} exterior entrances and return positions.`);
