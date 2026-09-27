import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../js/generated/game-part-2.js',import.meta.url),'utf8');
const draws=[];
const ctx={drawImage:(...args)=>draws.push(args),getImageData:()=>({data:new Uint8ClampedArray(4)}),putImageData(){},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){}};
const canvas=()=>({getContext:()=>ctx});
const c=vm.createContext({greenSceneImg:canvas(),greenSceneSource:{decode:async()=>{},naturalWidth:1536,naturalHeight:1024},document:{createElement:canvas}});
const run=code=>vm.runInContext(code,c);
run(source.slice(source.indexOf('const GREEN_SCENE_CEL_W'),source.indexOf('const faintDragonImg')));
await run('prepareGreenScene()');
// Test the crop actually passed to the renderer, not merely a named animation frame.
const flight=draws.slice(1,7),up=flight[2];
assert.deepEqual(up.slice(1,5),[761,719,282,218],'Raised takeoff artwork is packed into the live flight strip');
assert(run("!!GREEN_SCENE_MASKS['0:2']"),'Raised flight excludes the takeoff dust');
assert(up[6]>=0&&up[6]+up[8]<=112,'Full raised wing fits inside its animation cell');
const ax=up[5]+(862-up[1])*.32,ay=up[6]+(863-up[2])*.32;
assert(Math.abs(ax-(2*128+58))<.001&&Math.abs(ay-64)<.001,'Raised pose shares the flight shoulder anchor');
run(source.slice(source.indexOf('const GREEN ='),source.indexOf('function greenFly(')));
for(const phase of ['in','depart']){
 const frames=[];
 for(let i=0;i<6;i++)frames.push(run(`greenPhase='${phase}';greenP=(${i}+.1)/GREEN.fps/(greenPhase==='in'?GREEN_IN:GREEN_DEPART);greenFlightFrame()`));
 assert.deepEqual(frames,[0,4,2,2,4,0],phase+' visibly cycles down, middle, up and back');
}
assert.equal(run('GREEN_REST'),5,'The requested five-second resting beat is unchanged');
console.log('PASS: renderer includes the raised-wing artwork, dust mask, stable shoulder, unclipped wing, and full flaps on both arrival and departure.');
