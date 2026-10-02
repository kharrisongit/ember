import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
context.calls=[];
run(`MAPID='world';MW=40;MH=40;PXW=MW*TS;PXH=MH*TS;
MD={...W.maps.world,roomArt:null,shroom:null,swamp_regions:[],volcano_regions:[],winter_regions:[],world_water:[],oasis:null};
features=[{kind:'arena',x:20,y:20,r:6.3,style:'desert'}];
baseTerr=new Uint8Array(MW*MH).fill(SAND);terr=baseTerr.slice();
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
 const d=Math.hypot(x-20,y-20),road=Math.abs(y-20)<=2;
 if(d<=6||road)baseTerr[y*MW+x]=ROADSAND;
 if(d<=6.8||road)terr[y*MW+x]=PAVING2;
}
arenaRings=[[20,20,7.3]];soilAreas=[];decks=[];rockTiles=new Set();scatterChunks=new Map();
blit=(g,n,f,x,y)=>calls.push({n,f,x,y});`);
function render(){context.calls.length=0;run('renderChunk(Math.floor(20*TS/CHUNK),Math.floor(20*TS/CHUNK))');return context.calls.filter(c=>Math.abs(c.x-320)<=32&&Math.abs(c.y-320)<=32);}
// The old corner pass places eight grass corners in four tiles even though
// every tile in the arena is paved. Keep that exact reproduction as a control.
run('arenaRings=null');const old=render();
assert.equal(old.filter(c=>/^gr_ic/.test(c.n)).length,8,'Fixture reproduces the reported four patches');
run('arenaRings=[[20,20,7.3]]');const clean=render();
assert(!clean.some(c=>/^gr_ic/.test(c.n)),'No false grass corners on an arena floor');
assert(clean.some(c=>c.n==='cb2_c'),'Existing desert paving remains visible');
run("features[0].style='birch';baseTerr.fill(GRASS);for(let i=0;i<terr.length;i++)terr[i]=terr[i]===PAVING2?DIRT:GRASS;");
assert(!render().some(c=>/^gr_ic/.test(c.n)),'Forest arena centers also stay clear');
assert(context.calls.some(c=>/^gr_ic/.test(c.n)),'Forest arena edges retain their rounded grass corners');
console.log('PASS: reproduced four phantom grass patches; desert and forest arena centers now render clear paving/soil.');
