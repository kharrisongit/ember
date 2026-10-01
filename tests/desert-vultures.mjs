import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
await run('loadPublishedEditorLayouts()');
run("applyPublishedEditorLayout(W.maps.world,'world');MAPID='world';features=W.maps.world.features;");
const value=s=>JSON.parse(run(`JSON.stringify(${s})`));
const at=t=>value(`DesertAdventure.vultures(${t})`);
const routes=value("features.filter(f=>f.kind==='route'&&f.style==='desert')");
const rings=value("features.filter(f=>f.kind==='arena'||f.kind==='camp')");
const first=at(0);let legCount=0,oldCount=0;
const eligible=new Set();
for(const f of routes){
 const pts=f.pts||[[f.x0,f.y0],[f.x1,f.y1]];let length=0;
 for(let i=1;i<pts.length;i++){
  length+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1])*16;
  if(legCount++%2===0)eligible.add(f.id+':'+(i-1));
 }
 oldCount+=Math.max(1,Math.ceil(length/480));
}
assert(first.length>0&&first.length<=Math.ceil(legCount/2));
assert(first.length<oldCount/2,'Substantially fewer birds than the former 30-tile spacing');
assert.equal(new Set(first.map(b=>b.id)).size,first.length,'One bird per occupied leg');
assert(first.every(b=>eligible.has(b.id)),'Only alternating authored legs are populated');
assert.deepEqual([...new Set(first.map(b=>b.state))].sort(),['fly','idle','sit']);
const clearance=birds=>{
 for(const b of birds){
  assert(rings.every(a=>{
   const cx=a.x*16+8,cy=a.y*16+8;
   const x=Math.max(b.x-24,Math.min(b.x+24,cx)),y=Math.max(b.y-27,Math.min(b.y+1,cy));
   return Math.hypot(x-cx,y-cy)>(a.r||6)*16;
  }),'Full bird silhouette stays outside every arena');
  const f=routes.find(f=>f.id===b.route),pts=f.pts||[[f.x0,f.y0],[f.x1,f.y1]],a=pts[b.leg],z=pts[b.leg+1];
  const dx=z[0]-a[0],dy=z[1]-a[1],x=(b.gx-8)/16,y=(b.gy-8)/16;
  const u=((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy);
  assert(u>=0&&u<=1&&Math.abs((x-a[0])*dy-(y-a[1])*dx)<.001,'Birds remain on their assigned road leg');
 }
};
for(let t=0;t<120;t+=.25)clearance(at(t));
// Drive the actual sword-hit function. Wildlife has no health or rewards and
// never enters the foes array, so combat targeting and the bestiary ignore it.
const bird=first.find(b=>b.state==='sit');
run(`P.x=${bird.gx};P.y=${bird.gy+20};P.dir='u';P.dir8='n';P.act={kind:'swing',t:4};tAcc=0;foes=[];swingHits();`);
assert.equal(at(0).find(b=>b.id===bird.id).state,'flee');
for(let t=0;t<1.8;t+=.05)clearance(at(t));
assert(!at(2).some(b=>b.id===bird.id),'Startled bird leaves instead of dying');
assert(!at(60).some(b=>b.id===bird.id),'Does not reappear beside the attacking player');
assert.equal(run('foes.length'),0);assert.equal(run('birdMeat'),0);assert.equal(run('gold'),50);
run('P.x=0;P.y=0;');assert(at(61).some(b=>b.id===bird.id),'Wildlife can return after the player has left');
// Breath and claw both scare birds through the same production combat hooks.
const target=at(70)[0];
run(`tAcc=70;foesHeld=false;bossScene=null;scene=null;breath={el:'fire',t:.2,x:${target.x},y:${target.y},distance:0,speed:0,hit:0};stepBreath(.01);`);
assert.equal(at(70).find(b=>b.id===target.id).state,'flee');
const target2=at(75).find(b=>b.state!=='flee');
run(`tAcc=75;claw={x:${target2.x},y:${target2.y},t:0};stepClaw(.01);`);
assert.equal(at(75).find(b=>b.id===target2.id).state,'flee');
run('features=features.slice();P.x=0;P.y=0;DesertAdventure.scareVultures(0,0,Infinity,1200);');
for(let t=1200;t<1201.8;t+=.05)clearance(at(t));
context.draws=[];run('drawGameImage=(...args)=>draws.push(args);');
for(const state of ['sit','idle','fly','flee']){
 context.draws.length=0;context.bird={...first[0],state};run('DesertAdventure.drawVulture(bird,1)');
 assert.equal(context.draws.length,1);const call=context.draws[0];
 assert.equal(call[4],48);assert.equal(call[5],state==='idle'?22:27);
 if(state==='fly'||state==='flee')assert(call[3]===3251&&call[2]>=80&&call[2]<=224,'Only wing-beat frames repeat');
}
run("MAPID='pyramid_entry'");assert.deepEqual(at(10),[]);
console.log(`PASS: ${first.length} birds (previously ${oldCount}) across ${legCount} desert legs; varied poses, arena-safe patrols/escapes, sword/breath/claw reactions, no hunting rewards.`);
