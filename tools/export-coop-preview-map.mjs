// Freeze a small, collision-checked Millwood area for the first network test.
import fs from 'node:fs';
import {loadEditorGame} from './editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error(){}});
await run('loadPublishedEditorLayouts()');
run('loadMap("world",true)');
const grid=run(`JSON.stringify((()=>{
  const [sx,sy]=W.maps.world.spawn, step=4;
  const x0=sx-112,y0=sy-112,width=57,height=57;
  const rows=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>{
    const px=x0+x*step,py=y0+y*step;
    return [-2,0,2].every(dx=>[-2,0,2].every(dy=>canStand(px+dx,py+dy)))?'1':'0';
  }).join(''));
  const candidates=[];
  for(let y=3;y<height-3;y++)for(let x=3;x<width-3;x++)if(rows[y][x]==='1')candidates.push({x:x0+x*step,y:y0+y*step});
  candidates.sort((a,b)=>Math.hypot(a.x-sx,a.y-sy)-Math.hypot(b.x-sx,b.y-sy));
  const first=candidates[0],second=candidates.find(p=>Math.hypot(p.x-first.x,p.y-first.y)>=28);
  return {version:1,map:'world',x0,y0,step,width,height,rows,spawns:[first,second]};
})())`);
fs.writeFileSync('multiplayer/src/preview-map.json',JSON.stringify(JSON.parse(grid),null,2)+'\n');
console.log('Exported Millwood co-op movement area:',JSON.parse(grid).spawns);
