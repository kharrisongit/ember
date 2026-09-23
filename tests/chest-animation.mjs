import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
let clock=0,reveals=0,lastFrame=-1;
const asset=JSON.parse(read('js/generated/game-part-1.js').match(/\{"name":"heartstone_chest"[^\n]*?\}/)[0]);
assert.equal(asset.frames,5);assert(fs.existsSync(new URL('../'+asset.src.split('?')[0],import.meta.url)));
const c=vm.createContext({performance:{now:()=>clock},MAPID:'royal_treasury',treasuryTaken:new Set(),TREASURY_CHESTS:[{id:'test',x:100,y:100,n:600}],P:{x:100,y:120},treasuryGuarding:()=>false,gold:0,flyGold(){},showReveal(){reveals++;},saveGame(){},SPR:{heartstone_chest:[0,0,asset.w,asset.h,asset.frames],temple71_chest:[0,0,32,32,6]},ctx:{},atlasImg:{},drawGameImage(g,img,sx,sy,sw){lastFrame=sx/sw;},TS:16,MD:{templeExpanded:true},breathHas:{},chestOpen:{},chestAnim:null,chestHere:()=>({map:'tp1_sanctum',x:5,y:5,gift:'lightning'})});
vm.runInContext(read('js/house-loot.js'),c);const game=read('js/generated/game-part-2.js');
vm.runInContext(game.slice(game.indexOf('function tryTreasuryChest(){'),game.indexOf('\nlet loot =')),c);
vm.runInContext(game.slice(game.indexOf('function drawChest() {'),game.indexOf('let breathT =')),c);
vm.runInContext(game.slice(game.indexOf('function tryChest() {'),game.indexOf('function checkGravePrize()')),c);
const run=s=>vm.runInContext(s,c);
run('tryTreasuryChest()');assert.equal(c.gold,600);assert.equal(reveals,0);
for(let frame=0;frame<6;frame++){clock=frame*120;run('drawTreasuryChests()');assert.equal(lastFrame,frame);}
clock=800;run('stepLootChestOpening()');assert.equal(reveals,1);run('tryTreasuryChest()');assert.equal(c.gold,600);
for(let frame=0;frame<5;frame++){c.chestAnim={phase:'lid',t:(frame+.1)*.9/5};run('drawChest()');assert.equal(lastFrame,frame);}
c.chestAnim=null;c.breathHas.lightning=true;run('drawChest()');assert.equal(lastFrame,4);
c.breathHas.lightning=false;c.chestOpen={};c.P={x:88,y:128};assert(run('tryChest()'));assert.equal(c.chestAnim.phase,'lid');
console.log('PASS: treasury keeps six frames and uploaded Heartstone chest renders all five opening frames; treasury popup waits, repeat rewards blocked, acquired heartstone stays open.');
