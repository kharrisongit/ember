import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
await run('DesertPyramid.prepare()');await run('DesertAdventure.prepare()');
const data=code=>JSON.parse(run('JSON.stringify('+code+')'));
const ids=data('Object.keys(W.maps).filter(k=>W.maps[k].pyramid)');
let count=0,mummies=0;
for(const id of ids){
 const actors=data(`W.maps['${id}'].roomActors`),scarabs=actors.filter(a=>a.scarab);
 assert(!actors.some(a=>a.spr==='dd_mummy'),'Standing mummy decoration removed from '+id);
 mummies+=run(`W.maps['${id}'].foes.filter(f=>f.k==='mummy').length`);
 if(!scarabs.length)continue;
 count+=scarabs.length;
 run(`var map=W.maps['${id}'];var beetles=map.roomActors.filter(a=>a.scarab);var moved=beetles.map(()=>0);var starts=beetles.map(a=>[a.x,a.y]);`);
 // Exercise two minutes, including room boundaries and solid furnishings.
 for(let frame=0;frame<2400;frame++){
  run('DesertAdventure.stepScarabs(.05,map);beetles.forEach((a,i)=>moved[i]=Math.max(moved[i],Math.hypot(a.x-starts[i][0],a.y-starts[i][1])))');
  assert(run(`beetles.every(a=>{const [l,t,r,b]=a.scarab.bounds;return a.x>=l&&a.x<=r&&a.y>=t&&a.y<=b&&!map.roomBlocks.some(([x0,y0,x1,y1])=>a.x+5>x0&&a.x-5<x1&&a.y+5>y0&&a.y-5<y1)})`),'Scarabs avoid walls and furnishings in '+id);
 }
 assert(data('moved').every(d=>d>32),'Every scarab visibly traverses the room: '+id);
 const before=data('beetles.map(a=>[a.x,a.y])');run('DesertAdventure.stepScarabs(0,map)');assert.deepEqual(data('beetles.map(a=>[a.x,a.y])'),before);
 assert(scarabs.every(a=>a.sy===-10000&&!a.moveBlocks),'Scarabs remain passable floor creatures');
}
assert.equal(count,8);assert(mummies>0,'Actual combat mummies remain');
console.log(`PASS: all ${count} scarabs travel, bounce safely around rooms and furnishings, remain passable, and stationary mummy props are removed; ${mummies} combat mummies preserved.`);
