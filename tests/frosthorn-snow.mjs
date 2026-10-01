import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';

const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
run(`MAPID='world';MD=W.maps.world;MW=MD.w;MH=MD.h;
features=[{...Frosthorn.arena}];terr=new Uint8Array(MW*MH);`);
// The northern tree border lies beyond the incoming route's snow coverage.
// Test both ordinary ground and the solid ground beneath the border trees.
for(const terrain of ['GRASS','WALL']){
  run(`terr.fill(${terrain});`);
  for(let y=0;y<=55;y++)for(let x=2515;x<=2575;x++){
    if(Math.hypot(x-2545,y-25)>26)continue;
    assert(run(`snowGround(${x},${y})`),`${terrain} stays snowy at ${x},${y}`);
  }
}
assert(!run('inWinter(2545,65)'),'Snow does not extend indefinitely from the arena');
run('features=[{...Frosthorn.arena,style:"oak"}];');
assert(!run('snowGround(2545,5)'),'Non-winter arenas keep their own ground');
console.log('PASS: the winter arena and northern tree border stay snowy.');
