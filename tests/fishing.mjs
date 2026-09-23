import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
let saves=0;
const ctx=vm.createContext({cv:{width:780,height:880},document:{createElement:()=>({getContext:()=>({drawImage(){}})})},Math,fishingPole:true,fishing:null,FISH_TAU:Math.PI*2,dragonFish:0,DRAGON_FISH_HEAL:35,
 P:{x:0,y:0},TS:16,MAPID:'world',W:{maps:{}},waterInReach:()=>true,fishingSafe:()=>true,
 running:false,clearPadInputs(){},padDx:0,padDy:0,keys:{},saveGame(){saves++;}});
const game=read('js/generated/game-part-2.js');
for(const [a,b] of [['function endFishing(){','function tryFishing(){'],['function fishingRegion(){','function interact() {']])vm.runInContext(game.slice(game.indexOf(a),game.indexOf(b)),ctx);
vm.runInContext(read('js/fishing.js'),ctx);
const run=s=>vm.runInContext(s,ctx),step=n=>{for(let i=0;i<n;i++)run('stepFishing(.05)');};
function cast(tier=0){ctx.P.x=[0,700,1300,1900,2500,3100][tier]*16;run('startFishing()');assert.equal(ctx.fishing.phase,'cast');run('fishingAction()');assert.equal(ctx.fishing.phase,'cast');step(24);assert.equal(ctx.fishing.phase,'hook');}
function hit(perfect=true){const f=ctx.fishing;f.angle=f.target+(perfect?0:f.halfWidth*.8);run('fishingAction()');}
for(let tier=0;tier<6;tier++){
 cast(tier);hit();assert.equal(ctx.fishing.phase,'reel');assert.equal(ctx.fishing.pulls,0);
 hit();assert.equal(ctx.fishing.pulls,0,'trailing touch is ignored');
 for(let i=0;i<3;i++){step(10);hit();}
 assert.equal(ctx.fishing.phase,'result');assert(ctx.fishing.caught);assert.equal(ctx.fishing.bonus,1);
 const count=ctx.dragonFish;run('finishFishing(true)');assert.equal(ctx.dragonFish,count,'no duplicate reward');
 run('fishingAction()');assert.equal(ctx.fishing.phase,'result');step(14);run('fishingAction()');assert.equal(ctx.fishing.phase,'cast');
}
assert.equal(saves,6);assert.equal(ctx.dragonFish,27);
cast();for(let i=0;i<2;i++){ctx.fishing.angle=ctx.fishing.target+Math.PI;run('fishingAction()');step(10);}
assert.equal(ctx.fishing.tension,2);assert.equal(ctx.fishing.phase,'hook');hit(false);
for(let i=0;i<3;i++){step(10);hit(false);}
assert(ctx.fishing.caught,'two misses are recoverable');assert.equal(ctx.fishing.bonus,0);
cast();const old=ctx.dragonFish;step(550);assert.equal(ctx.fishing.phase,'result');assert(!ctx.fishing.caught);assert.equal(ctx.dragonFish,old);
cast();const age=ctx.fishing.roundAge;run('stepFishing(60)');assert(ctx.fishing.roundAge-age<=.051);
run('endFishing()');assert.equal(ctx.fishing,null);
ctx.fishingSafe=()=>false;run('startFishing()');assert.equal(ctx.fishing,null);
console.log('PASS: all six difficulties, cast input guard, four-stage catches, repeat-input guard, bonus/normal rewards, recoverable misses, idle loss, save once, tab suspension and cancellation.');
