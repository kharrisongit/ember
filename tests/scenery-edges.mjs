import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../js/generated/game-part-2.js',import.meta.url),'utf8');
const c=vm.createContext({cam:{x:0,y:0,z:2.5},DEFS:{0:{f:6,fj:.2}},NAMES:['oak'],SPR:{oak:[0,0,96,120,8]}});
const run=s=>vm.runInContext(s,c);
run(source.slice(source.indexOf('function frameOf('),source.indexOf('const PLAY_ACROSS')));
run(source.slice(source.indexOf('function worldArtVisible('),source.indexOf('function drawWorld(')));
// Generated IDs are negative; even at startup their source frames stay in-strip.
for(const id of [-1,-23,-18000])for(const t of [0,.05,3,30,1800]){
  const f=c.frameOf(0,t,id*.37);
  assert(Number.isInteger(f)&&f>=0&&f<8);
}
// Sweep both ways across the left edge: flowers and broad oak canopies stay
// present until their last screen pixel has left, including fractional zoom.
for(const z of [1.25,2.5,3.876])for(const w of [16,96,288]){
  c.cam.z=z;c.cam.y=100;
  const seen=[];
  for(let x=450;x<=850;x+=.25){
    c.cam.x=x;
    const visible=c.worldArtVisible(500,120,w,120,320,200);
    if(500+w>=x&&500<=x+320)assert(visible,'Partly visible scenery must be drawn');
    seen.push(visible);
  }
  for(let i=seen.length-1;i>=0;i--){c.cam.x=450+i*.25;assert.equal(c.worldArtVisible(500,120,w,120,320,200),seen[i]);}
}
console.log('PASS: valid procedural animation frames and symmetric east/west scenery visibility at fractional zoom.');
