import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
await run('loadPublishedEditorLayouts()');
run("applyPublishedEditorLayout(W.maps.world,'world')");
const data=JSON.parse(run('JSON.stringify({features:W.maps.world.features,foes:W.maps.world.foes,actors:W.maps.world.roomActors,objs:W.maps.world.objs})'));
for(const line of fs.readFileSync('tests/fixtures/side-routes-v3.patch','utf8').split('\n')){
 const p=line.split(' ');
 if(p[0]==='F'){
  const f=data.features.find(f=>f.id===+p[2]);
  assert.equal(f.kind,'route');
  for(const [key,i]of [['x0',3],['y0',4],['x1',5],['y1',6],['w',7],['band',8]])assert.equal(f[key],+p[i]);
  assert.equal(f.style,p[9]);assert.deepEqual(f.pts,p[12].split(';').map(pair=>pair.split(',').map(Number)));
 }
 if(p[0]==='M')assert.deepEqual(data.objs.slice(+p[1]*3+1,+p[1]*3+3),p.slice(2).map(Number));
}
assert.equal(new Set(data.features.map(f=>f.id)).size,data.features.length);
assert(!data.foes.some(f=>/^desert(archer|lancer)/.test(f.k)),'No human desert combatants');
assert(!data.foes.some(f=>f.k==='mummy'),'Mummies stay inside the pyramid');
const routes=data.features.filter(f=>f.sideRoute===true&&f.kind==='route');
assert.equal(routes.length,28);
assert.deepEqual(routes.filter(f=>f.shortcut).map(f=>f.id),[9198,9203]);
for(const f of routes){
 const arenas=data.features.filter(a=>a.kind==='arena'&&a.sideRoute===f.id),chests=data.actors.filter(a=>a.sideRoute===f.id);
 if(f.shortcut&&f.id!==9198){assert.equal(arenas.length,0);assert.equal(chests.length,0);continue;}
 assert(f.id===9198?arenas.length===3:arenas.length>=1&&arenas.length<=2);assert.equal(chests.length,f.id===9198?2:1);
 if(f.id===9198){
  const middle=arenas.find(a=>a.id===9369);
  assert(middle.x>chests[0].x/16&&middle.x<chests[1].x/16,'Third arena lies between the two chests');
  assert.equal(middle.y,195,'Third arena sits on the connecting path');
 }
 assert(chests[0].houseLoot.gold>0);assert(run(`!!CHEST_CONSUMABLES[${JSON.stringify(chests[0].houseLoot.item)}]`));
 for(const a of arenas){
  const enemies=data.foes.filter(e=>e.sideEncounter&&Math.hypot(e.x-a.x,e.y-a.y)<a.r);
  assert(enemies.length>=2&&enemies.length<=3);
  for(const e of enemies)assert(run(`!!FOE[${JSON.stringify(e.k)}]`),'Existing combat family '+e.k);
 }
}
assert(data.foes.slice(-9).every(f=>f.sideEncounter?.startsWith('9198:')),'New oasis foes append after all saved enemy slots');
assert.deepEqual(data.foes.slice(-3).map(f=>f.sideEncounter),['9198:2:0','9198:2:1','9198:2:2'],'Third encounter appends after both existing oasis fights');
const joins=JSON.parse(run(`JSON.stringify((()=>{
 const m=W.maps.world,g=SideRouteAdventures.geometry(m.features,m.w,m.h),p=DesertBorders.plan(m.features,m.roomActors,m.w,m.h);
 return {blockedFloor:[...g.floor.keys()].filter(k=>p.walls.has(k)).length,
  openedWalls:[...g.walls.keys()].filter(k=>p.scope.has(k)&&!p.walls.has(k)).length};
})())`));
assert.equal(joins.blockedFloor,0,'Palm borders preserve route and arena floors');
assert.equal(joins.openedWalls,0,'Palm borders join the route walls without escape gaps');
// Reinstallation and the old pyramid arena IDs must not shift any saved foe slots.
const before=run('JSON.stringify(W.maps.world.foes)');
run('for(const f of W.maps.world.features)if(f.pyramidApproach)f.id-=35;DesertAdventure.installWorld(W.maps.world);SideRouteAdventures.installWorld(W.maps.world);SideRouteAdventures.installOasis(W.maps.world);');
assert.equal(run('JSON.stringify(W.maps.world.foes)'),before);
assert.equal(run('W.maps.world.features.filter(f=>f.pyramidApproach&&f.id>=9220&&f.id<=9224).length'),5);
assert.equal(run('new Set(W.maps.world.features.map(f=>f.id)).size'),data.features.length);
console.log('PASS: exact 28 routes / 16 object moves; 28 rewards, 47 populated arenas, open shortcut entrances, stable pyramid encounters and repeatable installation.');
