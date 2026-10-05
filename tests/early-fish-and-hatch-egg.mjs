import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
assert.equal(run('dragonFish'),0,'A fresh game starts with no fish');
await run('prepareHouseLoot()');
run("MAPID='house22_bedroom';MD=W.maps[MAPID];quest=Q.ELDER;potions=0;dragonFish=0;gold=0;P.x=160;P.y=108;");
assert(run('tryHouseLootChest()'));
assert.equal(run('dragonFish'),0,'Maddock’s early chest does not grant fish');
assert.equal(run('potions'),1);assert.equal(run('gold'),12);
run('tryHouseLootChest()');assert.equal(run('potions'),1,'The reward remains one-time');
assert(run('!W.maps.house26_bedroom.roomActors.some(a=>a.houseLoot)'),'Corin’s bedroom has no reward chest');

// Exercise the actual renderer branch: generated art keeps the same ground
// anchor/size as the egg on the stump and retains both shaking phases.
const game=fs.readFileSync('js/generated/game-part-2.js','utf8'),draws=[];
const art=[256,3001344,128,128,1],old=[0,0,16,16,1];
const c=vm.createContext({ctx:{},SPR:{inventory_egg:art,it_egg:old},hatchScene:null,
  sheetOf:sp=>sp,drawGameImage:(...args)=>draws.push(args)});
const branch=game.slice(game.indexOf('    if (o.hatchActor) {'),game.indexOf('    if (o.dg) {',game.indexOf('    if (o.hatchActor) {')));
vm.runInContext('function drawEgg(){for(const o of [{hatchActor:true}]){'+branch+'}}',c);
for(const stage of [3,5,6]){
  c.hatchScene={stage,t:.1,x:100,y:100};c.drawEgg();
  const args=draws.at(-1);assert.equal(args[1],art,'Hatching uses the inventory egg, never the orange icon');
  assert.deepEqual(args.slice(2,6),art.slice(0,4));
  assert.deepEqual(args.slice(-3),[82,18,18],'The 128px source renders at the intended world size');
}
assert.notEqual(draws[0][6],draws[1][6],'The generated egg still shakes');
console.log('PASS: fresh inventory has no fish; Maddock’s chest gives a one-time potion; hatch scene draws the generated egg at world scale with its shake animation.');
