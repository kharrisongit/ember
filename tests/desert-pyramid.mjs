import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {verifySideRoutes} from './side-route-world.mjs';
import {verifyDesertBorders} from './desert-borders.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
await run('loadPublishedEditorLayouts()');
run("mode='play';gameplayStarted=true;quest=Q.DONE;foesHeld=true;loadMap('world');");
console.log('World generated; checking road and arena access.');
const routes=JSON.parse(run('JSON.stringify(DesertPyramid.routes)'));
for(const f of routes)assert.equal(run(`JSON.stringify(features.find(f=>f.id===${f.id}))`),JSON.stringify(f),'Exact patch survives full world generation');
const approach=JSON.parse(run('JSON.stringify(features.filter(f=>f.pyramidApproach))'));
assert.equal(approach.length,5);
for(const a of approach){
 assert(run(`MD.foes.filter(f=>f.desertEncounter?.startsWith('${a.id-35}:')).length>=2`),'Arena has its authored enemies');
 for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++)assert(run(`canStand(${(a.x+x)*16+8},${(a.y+y)*16+16})`),'Clear desert arena floor '+a.id);
}
const courtReturn=JSON.parse(run('JSON.stringify(W.maps.glasshouse.doors.find(d=>d.to==="world"))'));
assert(run(`canStand(${courtReturn.tx*16+8},${courtReturn.ty*16+16})`),'Glass shop returns onto clear original Sandspire ground');
assert(run('canStand(24248,1592)'),'Sandspire quest giver can be approached');
let blocked=0,samples=0;
for(const f of routes)for(let i=1;i<f.pts.length;i++){
 const [a,b]=[f.pts[i-1],f.pts[i]],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4);
 for(let j=0;j<=n;j++){
  const x=(a[0]+(b[0]-a[0])*j/n)*16+8,y=(a[1]+(b[1]-a[1])*j/n)*16+16;samples++;
  if(!run(`canStand(${x},${y})`)){blocked++;if(blocked<12)console.log('blocked route',f.id,x,y,run(`whyBlocked(${x},${y-6})`));}
 }
}
assert.equal(blocked,0,'Entire supplied road centerline is walkable');
const ids=JSON.parse(run('JSON.stringify(Object.keys(W.maps).filter(k=>k.startsWith("pyramid_")))'));
run('foesHeld=false;window.EmberRiding=undefined;window.EmberArenaEntry=undefined;window.EmberEncounterCard=undefined;scene=null;');
for(const a of approach){
 run(`arenaLock=null;P.x=${a.x*16+8};P.y=${a.y*16+16};stepArena(.05);`);
 assert.equal(run('arenaLock?.id'),a.id,'Entering the approach clearing starts its battle');
 assert(run('arenaFoesLeft(arenaLock)'),'Arena has live combatants');
}
run('arenaLock=null;arenaT=0;foesHeld=true;');
verifyDesertBorders(run);
verifySideRoutes(run);
console.log('Five populated arenas and the supplied route are clear. Checking interiors.');
let chambers=0,mummies=0,doors=0;
for(const id of ids){
 run(`loadMap('${id}');[P.x,P.y]=MD.spawn;`);
 const m=JSON.parse(run('JSON.stringify({spawn:MD.spawn,plan:MD.templePlan,doors:MD.doors,blocks:MD.roomBlocks,actors:MD.roomActors,foes:MD.foes})'));
 chambers+=m.plan.chambers.length;mummies+=m.foes.filter(f=>f.k==='mummy').length;
 const clear=(x,y)=>[[x-6,y-12],[x+6,y-12],[x-6,y-1],[x+6,y-1]].every(([px,py])=>m.plan.floors.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&!m.blocks.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b));
 const q=[m.spawn],seen=new Set([m.spawn.join(',')]);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const n of [[x-8,y],[x+8,y],[x,y-8],[x,y+8]])if(!seen.has(n.join(','))&&clear(...n)){seen.add(n.join(','));q.push(n);}}
 assert(run('canStand(P.x,P.y)'),id+' safe spawn');
 for(const d of m.doors){
  doors++;
  const cx=d.triggerRect.x+d.triggerRect.w/2,cy=d.dir==='u'?d.triggerRect.y+d.triggerRect.h+16:d.triggerRect.y;
  assert(q.some(([x,y])=>Math.abs(x-cx)<8&&Math.abs(y-cy)<12),id+' door reachable '+d.to);
  assert(run(`W.maps[${JSON.stringify(d.to)}].doors.some(d=>d.to===${JSON.stringify(id)})`),'Return door exists');
  const back=id;run(`loadMap(${JSON.stringify(d.to)});P.x=${d.tx*16+8};P.y=${d.ty*16+16};`);assert(run('canStand(P.x,P.y)'),id+' safe door arrival in '+d.to);run(`loadMap('${back}')`);
 }
 for(const a of m.actors.filter(a=>a.houseLoot))assert(q.some(([x,y])=>Math.abs(x-a.x)<9&&Math.abs(y-a.y-24)<9),id+' treasure reachable');
 for(const f of m.foes)assert(clear(f.x*16+8,f.y*16+16),id+' enemy on clear floor');
}
assert.equal(chambers,15);assert(mummies>=10);assert.equal(doors,15);
run("loadMap('pyramid_queen');[P.x,P.y]=MD.spawn;bossGone['pyramid_queen:0']=true;bossGone['pyramid_depths:spikes:pyramid-spikes']=true;houseLootTaken.add('pyramid_cache:loot:0');");
assert(run('saveToSlot(1,true)'));
assert(run("readSaveSlot(1).templeDefeated['pyramid_queen:0']"));
run('houseLootTaken.clear();for(const k in bossGone)delete bossGone[k];');
assert(run('loadGame(1)'));assert(!run("foes.some(f=>f.kind==='spiderqueen')"),'Boss remains defeated on load');
assert(run("bossGone['pyramid_depths:spikes:pyramid-spikes']&&houseLootTaken.has('pyramid_cache:loot:0')"));
run("localStorage.setItem(saveKey(2),JSON.stringify({...captureSave(),templeDefeated:{},houseLootTaken:[]}));");
assert(run('loadGame(2)'));assert(run("foes.some(f=>f.kind==='spiderqueen')"),'Fresh slot restores living boss');
assert(!run("bossGone['pyramid_depths:spikes:pyramid-spikes']"),'Slot switch clears trap progress');
run("loadMap('world');");assert.equal(run("MD.doors.filter(d=>d.to==='pyramid_entry').length"),1);assert.equal(run("MD.roomActors.filter(a=>a.editKey==='pyramid:exterior').length"),1);
console.log(`PASS: ${samples} route samples, ${chambers} reachable chambers, ${doors} returnable doors, ${mummies} mummies, treasure access, boss/trap/loot persistence and clean save-slot switching.`);
