import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {loadEditorGame} from '../tools/editor-game-context.mjs';

export function verifyDesertBorders(run){
  const report=JSON.parse(run(`JSON.stringify((()=>{
    const plan=DesertBorders.plan(features,MD.roomActors,MW,MH);
    const palms=fobjs.filter(o=>o.desertBorder==='oasis');
    const missing=[...plan.walls].filter(k=>!isSolid((k%MW)*16+8,Math.floor(k/MW)*16+8));
    const openings=[[1275,242],[1297,242],[1287,262]].map(([x,y])=>canStand(x*16+8,y*16+16));
    const pyramid=MD.roomActors.find(a=>a.editKey==='pyramid:exterior'),cx=(pyramid.x-8)/16,cy=pyramid.y/16;
    const queue=[[cx,cy+4]],seen=new Set();let escape=false;
    for(let i=0;i<queue.length;i++){
      const [x,y]=queue[i],key=x+','+y;if(seen.has(key))continue;seen.add(key);
      if(x<cx-14||x>cx+14||y<cy-17||y>cy+8||!canStand(x*16+8,y*16+16))continue;
      if(y<cy-8)escape=true;
      for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])queue.push([x+dx,y+dy]);
    }
    const oasis=features.find(f=>f.label==='The Oasis'),g=SideRouteAdventures.geometry(features,MW,MH);
    const grass=[...g.floor.keys()].filter(k=>baseTerr[k]===GRASS&&k%MW>=oasis.x0-4&&k%MW<=oasis.x1+4&&Math.floor(k/MW)>=oasis.y0-4&&Math.floor(k/MW)<=oasis.y1+4);
    return {grass:grass.length,damagedGrass:grass.filter(k=>terr[k]!==GRASS).length,
      missing:missing.length,openings,escape,palms:palms.map(o=>[o.x,o.y,o.borderRow]),
      duplicateTrees:palms.length-new Set(palms.map(o=>o.x+','+o.y)).size,
      entrance:canStand(pyramid.x,pyramid.y),behind:canStand(pyramid.x,pyramid.y-144)};
  })())`));
  assert.equal(report.missing,0,'All authored border tiles are solid');
  assert(report.openings.every(Boolean),'Both oasis loop mouths and the south entrance stay open');
  assert(report.entrance,'Pyramid door is reachable');assert(!report.behind,'Rear cactus cap is solid');
  assert(!report.escape,'No path around the pyramid into the open map');
  assert.equal(report.duplicateTrees,0);
  assert(report.grass>20,'Exercise both formerly paved grass joins');
  assert.equal(report.damagedGrass,0,'Chest route preserves the original oasis grass contour');
  assert(report.palms.length>15&&report.palms.length<40,'One band of palms around the oasis');
  assert(report.palms.every(p=>p[2]===0),'No outer palm rows remain');
  for(const [x,y]of report.palms){assert((x-8-1274*16)%48===0);assert((y-238*16)%48===0);}
  const before=run('JSON.stringify(fobjs.filter(o=>o.desertBorder).map(({id,...o})=>o))');
  run('DesertBorders.finishWorld();rebuildBuckets();rebuildSolid();');
  assert.equal(run('JSON.stringify(fobjs.filter(o=>o.desertBorder).map(({id,...o})=>o))'),before,'Repeatable border repair');
  console.log('PASS: single oasis palm band, intact grass joins, three open entrances, solid pyramid rear and repeatable borders.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
  await run('loadPublishedEditorLayouts()');
  run("mode='play';gameplayStarted=true;quest=Q.DONE;foesHeld=true;loadMap('world');");
  verifyDesertBorders(run);
}
