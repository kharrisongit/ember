// Export the maintained opening interiors and actor positions for server validation.
import fs from 'node:fs';
import {deflateSync} from 'node:zlib';
import {loadEditorGame} from './editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error(){}});
await run('loadPublishedEditorLayouts()');
const names=['Hettie','Nan Ferrow','Elder Maddock','King Halvard','Serjeant Bram','Doran','Tolan'];
const ids=['world','house26_bedroom','house26','house22'],maps={};
for(const id of ids){
 run(`quest=Q.ERRAND;guardsAside=false;loadMap(${JSON.stringify(id)},true)`);
 const map=JSON.parse(run(`JSON.stringify({map:MAPID,title:MD.title,tile:TS,width:MW,height:MH,spawn:MD.spawn,
   solid:Array.from(solid),overrides:{...(MD.collisionOverrides||{}),...(geometryEdits[MAPID]?.collision||{})},
   fences:Array.from(fenceAt||[]),blocks:MD.roomBlocks||[],
   npcBodies:npcs.filter(n=>npcHere(n)&&!${JSON.stringify(names)}.includes(n.n)).map(n=>[n.x-8,n.y-8,n.x+8,n.y+8]),
   npcs:npcs.filter(n=>${JSON.stringify(names)}.includes(n.n)).map(n=>({name:n.n,x:n.x,y:n.y,packSpr:n.packSpr,packDirections:n.packDirections,body:n.body,sk:n.sk,f:n.f})),
   doors:(MD.doors||[]).filter(d=>${JSON.stringify(ids)}.includes(d.to)).map((d,i)=>({id:MAPID+':door:'+i,to:d.to,rect:doorRect(d),x:d.tx*TS+TS/2,y:d.ty*TS+TS/2,dir:d.dir}))})`));
 const bits=Buffer.alloc(Math.ceil(map.solid.length/8));map.solid.forEach((v,i)=>{if(v)bits[i>>3]|=1<<(i&7);});
 map.tiles=deflateSync(bits).toString('base64');delete map.solid;maps[id]=map;
}
fs.writeFileSync('multiplayer/src/story-maps.json',JSON.stringify({version:1,maps})+'\n');
console.log('Exported opening maps:',Object.keys(maps).join(', '));
