import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
await run('inflateAtlas()');await run('loadPublishedEditorLayouts()');
run("applyPublishedEditorLayout(W.maps.world,'world');MAPID='world';features=W.maps.world.features;");
const routes=JSON.parse(run("JSON.stringify(features.filter(f=>f.kind==='route'&&f.style==='desert'))"));
const at=t=>JSON.parse(run(`JSON.stringify(DesertAdventure.vultures(${t}))`));
const first=at(0),next=at(.01);
for(let i=0;i<first.length;i++){
 const dx=next[i].x-first[i].x;
 if(Math.abs(dx)>.001)assert.equal(first[i].flip,dx<0,'Native east-facing artwork faces its flight direction');
}
assert(first.length>routes.length,'Long roads carry several spaced birds');
assert.deepEqual([...new Set(first.map(b=>b.route))].sort(),routes.map(r=>r.id).sort(),'Main, pyramid and chest roads all have vultures');
for(const t of [1,10,60,300,1200]){
 const birds=at(t);assert.equal(birds.length,first.length);
 assert(birds.some((b,i)=>Math.hypot(b.x-first[i].x,b.y-first[i].y)>10),'Vultures travel, rather than hover in place');
 for(const b of birds){
  const f=routes.find(f=>f.id===b.route),pts=f.pts||[[f.x0,f.y0],[f.x1,f.y1]];
  const x=(b.x-8)/16,y=(b.y-8+28)/16;
  const distance=pts.slice(1).map((v,i)=>{const a=pts[i],dx=v[0]-a[0],dy=v[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy);});
  assert(Math.min(...distance)<.2,'Flights track road bends and stay in the desert');
 }
}
const r=routes[0],points=r.pts||[[r.x0,r.y0],[r.x1,r.y1]];
const length=points.slice(1).reduce((n,b,i)=>n+Math.hypot(b[0]-points[i][0],b[1]-points[i][1])*16,0);
const start=first.find(b=>b.route===r.id),loop=at(length*2/24).find(b=>b.route===r.id);
assert(Math.abs(start.x-loop.x)<.001&&Math.abs(start.y-loop.y)<6.01,'Birds return along the road');
run("birdsUp=99;foesHeld=true;");assert.equal(at(10).length,first.length,'Tutorial bird-scattering and enemy toggles do not remove desert wildlife');
context.draws=[];run('drawGameImage=(...args)=>draws.push(args);');
run('DesertAdventure.drawVulture(DesertAdventure.vultures(1)[0],1)');
assert.equal(context.draws.length,1,'Native flight artwork renders through atlas-page resolution');
assert.equal(context.draws[0][4],48);assert.equal(context.draws[0][5],27);
run("MAPID='pyramid_entry'");assert.deepEqual(at(10),[],'No outdoor vultures inside the pyramid');
console.log('PASS: '+first.length+' animated vultures across '+routes.length+' desert roads, travelling both ways through bends, stable looping and world-only rendering.');
