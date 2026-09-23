import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
let clock=0,reveals=0,lastFrame=-1;
const c=vm.createContext({performance:{now:()=>clock},MAPID:'royal_treasury',treasuryTaken:new Set(),TREASURY_CHESTS:[{id:'test',x:100,y:100,n:600}],P:{x:100,y:120},treasuryGuarding:()=>false,gold:0,flyGold(){},showReveal(){reveals++;},saveGame(){},SPR:{chest:[0,0,26,28,6]},ctx:{},atlasImg:{},drawGameImage(g,img,sx){lastFrame=sx/26;},TS:16,MD:{templeExpanded:true},breathHas:{},chestOpen:{},chestAnim:null,chestHere:()=>({map:'tp1_sanctum',x:5,y:5,gift:'lightning'})});
vm.runInContext(read('js/house-loot.js'),c);const game=read('js/generated/game-part-2.js');
vm.runInContext(game.slice(game.indexOf('function tryTreasuryChest(){'),game.indexOf('\nlet loot =')),c);
vm.runInContext(game.slice(game.indexOf('function drawChest() {'),game.indexOf('let breathT =')),c);
const run=s=>vm.runInContext(s,c);
run('tryTreasuryChest()');assert.equal(c.gold,600);assert.equal(reveals,0);
for(let frame=0;frame<6;frame++){clock=frame*120;run('drawTreasuryChests()');assert.equal(lastFrame,frame);}
clock=800;run('stepLootChestOpening()');assert.equal(reveals,1);run('tryTreasuryChest()');assert.equal(c.gold,600);
for(let frame=0;frame<6;frame++){c.chestAnim={phase:'lid',t:(frame+.1)*.9/6};run('drawChest()');assert.equal(lastFrame,frame);}
c.chestAnim=null;c.breathHas.lightning=true;run('drawChest()');assert.equal(lastFrame,5);
console.log('PASS: treasury and temple heartstone render all six opening frames; treasury popup waits, repeat rewards blocked, acquired heartstone stays open.');
