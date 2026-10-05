import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
export function verifySideRoutes(run){
 const held=run('foesHeld');
 run(`arenaLock=null;arenaT=0;scene=null;bossScene=null;ask=null;ovl=null;fadeDir=0;
 window.EmberRiding=undefined;window.EmberArenaEntry=undefined;window.EmberEncounterCard=undefined;`);
 const report=JSON.parse(run(`JSON.stringify((()=>{
  const routes=features.filter(f=>f.sideRoute===true&&f.kind==='route'),bad=[],chests=[],arenaFloor=[];let samples=0;
  for(const f of routes){
   const chest=MD.roomActors.find(a=>a.sideRoute===f.id);
   for(let i=1;i<f.pts.length;i++){
    const a=f.pts[i-1],b=f.pts[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4);
    for(let j=0;j<=n;j++){
     const x=(a[0]+(b[0]-a[0])*j/n)*16+8,y=(a[1]+(b[1]-a[1])*j/n)*16+16;
     if(chest&&Math.hypot(x-chest.x,y-chest.y)<32)continue;samples++;
     if(!canStand(x,y))bad.push({route:f.id,x,y,why:whyBlocked(x,y-4),stamp:stampedBy(Math.floor(x/16),Math.floor((y-4)/16))});
    }
   }
   for(const c of MD.roomActors.filter(a=>a.sideRoute===f.id&&!a.editorDeleted&&!a.publishedDeleted))
    for(const [dx,dy] of [[0,-28],[28,0],[0,28],[-28,0],[20,-20],[20,20],[-20,20],[-20,-20]])
      chests.push({id:f.id,dx,dy,clear:canStand(c.x+dx,c.y+dy)});
  }
  // The former empty endpoint is now the supply camp; its sled/NPC collision
  // and accessible approach are covered by hollybeck-rescue-world.mjs.
  for(const a of features.filter(f=>f.sideRoute&&f.kind==='arena'&&!f.iceMothEnd))for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)
   if(Math.hypot(dx,dy)<=a.r-1.7&&!canStand((a.x+dx)*16+8,(a.y+dy)*16+16))arenaFloor.push({id:a.id,x:a.x+dx,y:a.y+dy,stamp:stampedBy(a.x+dx,a.y+dy)});
  const g=SideRouteAdventures.geometry(features,MW,MH),holes=[];
  const oasis=features.find(f=>f.label==='The Oasis');
  const grassJoin=key=>baseTerr[key]===GRASS&&key%MW>=oasis.x0-4&&key%MW<=oasis.x1+4&&Math.floor(key/MW)>=oasis.y0-4&&Math.floor(key/MW)<=oasis.y1+4;
  const badPaving=[...g.floor].filter(([key,style])=>style==='desert'&&terr[key]!==(grassJoin(key)?GRASS:PAVING2));
  for(const [key]of g.walls){const x=key%MW,y=Math.floor(key/MW);if(!isSolid(x*16+8,y*16+8))holes.push([x,y]);}
  return {badPaving:badPaving.length,samples,bad:bad.slice(0,30),badCount:bad.length,chests,arenaFloor:arenaFloor.slice(0,20),arenaBad:arenaFloor.length,holes:holes.slice(0,20),holeCount:holes.length,walls:g.walls.size};
 })())`));
 console.log(JSON.stringify(report));
 assert.equal(report.badPaving,0,'Desert chest lanes and arenas match the main stone paving');
 assert.equal(report.badCount,0,'Every route centerline remains traversable');
 assert(report.chests.every(c=>c.clear),'All active route chests have clear approaches from all eight directions');
 assert.equal(report.arenaBad,0,'Arena interiors clear of procedural obstacles');
 assert.equal(report.holeCount,0,'Continuous solid boundaries survive the final terrain/collision pass');
 // Every authored fight activates with real enemies; chests grant gold + the item exactly once.
 const arenas=JSON.parse(run('JSON.stringify(features.filter(f=>f.kind==="arena"&&typeof f.sideRoute==="number"))'));
 for(const a of arenas){
  run(`arenaLock=null;foesHeld=false;P.x=${a.x*16+8};P.y=${a.y*16+16};stepArena(.05);`);
  assert.equal(run('arenaLock?.id'),a.id,'Side arena enters normal combat');assert(run('arenaFoesLeft(arenaLock)'));
 }
 run('arenaLock=null;arenaT=0;foesHeld=true;');
 const chests=JSON.parse(run('JSON.stringify(MD.roomActors.filter(a=>a.sideRoute&&a.houseLoot&&!a.editorDeleted&&!a.publishedDeleted))'));
 for(const chest of chests){
  const key=JSON.stringify(chest.houseLoot.id),item=chest.houseLoot.item;
  const counter={potion:'potions',elixir:'elixirs',dragonFish:'dragonFish',bomb:'bombs',dust:'dust',bell:'bells',mark:'marks',saint:'breaths',stone:'stones',salt:'salts'}[item];
  const gold=run('gold'),count=run(counter);
  for(const [dx,dy] of [[0,-28],[28,0],[0,28],[-28,0],[20,-20],[20,20],[-20,20],[-20,-20]]){
   run(`P.x=${chest.x+dx};P.y=${chest.y+dy}`);
   assert(run('canStand(P.x,P.y)'),chest.houseLoot.id+' reachable '+dx+','+dy);
   assert(run('tryHouseLootChest()'),chest.houseLoot.id+' opens '+dx+','+dy);
  }
  assert(run(`houseLootTaken.has(${key})`));assert.equal(run('gold'),gold+chest.houseLoot.gold);assert.equal(run(counter),count+1);
 }
 // Exercise actual serialization without regenerating the huge overworld.
 const saved=JSON.parse(run('JSON.stringify(captureSave())'));
 for(const c of chests)assert(saved.houseLootTaken.includes(c.houseLoot.id));
 const count=run('fobjs.filter(o=>o.sideRouteWall).length');run('SideRouteAdventures.finishWorld();');
 assert.equal(run('fobjs.filter(o=>o.sideRouteWall).length'),count,'Repeated repairs do not duplicate trees');
 run('foesHeld='+held);
 console.log('PASS: '+report.samples+' route samples; '+arenas.length+' active encounters; '+chests.length+' reachable, once-only gold/item rewards; '+report.walls+' solid boundary tiles; stable repeated rebuild.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error});
 await run('loadPublishedEditorLayouts()');run("mode='play';gameplayStarted=true;quest=Q.DONE;wonAll=1;foesHeld=false;loadMap('world');");verifySideRoutes(run);
}
