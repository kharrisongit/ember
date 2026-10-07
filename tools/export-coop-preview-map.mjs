// Export static overworld collision once; rooms share this compact immutable map.
import fs from 'node:fs';
import {deflateSync} from 'node:zlib';
import {loadEditorGame} from './editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error(){}});
await run('loadPublishedEditorLayouts()');
run('quest=Q.DONE;greenPhase="gone";bridgeCleared=true;guardsAside=true;loadMap("world",true)');
const data=JSON.parse(run(`JSON.stringify((()=>{
  const spawn={x:MD.spawn[0],y:MD.spawn[1]};
  const arenas=features.filter(f=>f.kind==='arena'&&!['hare','boar','deer','fox','bird'].includes(f.encounter))
    .map(a=>({x:a.x*TS+TS/2,y:a.y*TS+TS/2,r:Math.max(64,(a.r-1)*TS)}))
    .sort((a,b)=>Math.hypot(a.x-spawn.x,a.y-spawn.y)-Math.hypot(b.x-spawn.x,b.y-spawn.y));
  return {version:2,map:'world',tile:TS,width:MW,height:MH,solid:Array.from(solid),
    overrides:{...(MD.collisionOverrides||{}),...(geometryEdits.world?.collision||{})},
    fences:Array.from(fenceAt||[]),
    blocks:[...(MD.roomBlocks||[]),...Object.values(JOURNEY_GATES).filter(g=>!g.open()).map(g=>g.rect)],
    npcBodies:npcs.filter(n=>npcHere(n)&&!n.leaving&&!n.brambleCompanion).map(n=>[n.x-8,n.y-8,n.x+8,n.y+8]),
    spawns:[spawn,{x:spawn.x-28,y:spawn.y}],arenas};
})())`));
const bits=Buffer.alloc(Math.ceil(data.solid.length/8));
data.solid.forEach((v,i)=>{if(v)bits[i>>3]|=1<<(i&7);});
data.tiles=deflateSync(bits).toString('base64');delete data.solid;
fs.writeFileSync('multiplayer/src/preview-map.json',JSON.stringify(data)+'\n');
console.log('Exported overworld:',data.width*data.tile,'×',data.height*data.tile,'pixels;',data.arenas.length,'arenas;',data.tiles.length,'collision bytes (base64)');
