import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const calls=[];let copies=0;
const canvas={width:780,height:880};
const g=new Proxy({setTransform(...a){calls.push(['transform',...a]);},drawImage(...a){calls.push(['image',...a]);},measureText(){return {width:1};}}, {get:(o,k)=>k in o?o[k]:()=>{}});
const c=vm.createContext({window:{},ctx:g,cv:canvas,VW:390,VH:440,DPR:2,
 document:{createElement:()=>({getContext:()=>({drawImage(){copies++;}})})},
 updateDeckHealth(){},drawHearts(){},drawWorld(){throw Error('Fishing must not re-enter world rendering');},drawDark(){throw Error('Backdrop already contains darkness');},
 ovl:null,last:0,atlasOpen:false,tAcc:5,fishing:null,fishingPole:true,
 waterInReach:()=>true,fishingSafe:()=>true,fishingRegion:()=>({tier:1,reward:1,speed:2.4,halfWidth:.4}),
 clearPadInputs(){},keys:{},P:{},padDx:0,padDy:0,running:false,
 FISH_TAU:Math.PI*2,DRAGON_FISH_HEAL:35,dragonFish:0,saveGame(){}});
const part2=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
vm.runInContext(part2.slice(part2.indexOf('function endFishing(){'),part2.indexOf('function tryFishing(){')),c);
vm.runInContext(read('js/fishing.js'),c);
vm.runInContext(part3.slice(part3.indexOf('function frameCore(ms) {'),part3.indexOf('\nlet doorCooldown')),c);
const run=s=>vm.runInContext(s,c);
c.fishing={phase:'prompt'};run('frameCore(100)');assert.equal(copies,1);
const first=run('fishingBackdrop');
run('startFishing()');assert.equal(run('fishingBackdrop'),first);
for(let ms=116;ms<1600;ms+=16)run(`frameCore(${ms})`);
assert.equal(copies,1,'frames do not recursively capture their own overlays');
assert.equal(c.fishing.phase,'hook');
c.fishing.phase='result';c.fishing.resultAge=1;run('fishingAction()');
assert.equal(run('fishingBackdrop'),first,'retry keeps the original world image');
c.VW=844;c.VH=300;c.DPR=3;canvas.width=2532;canvas.height=900;calls.length=0;
run('frameCore(1700)');assert.deepEqual(calls[0],['transform',3,0,0,3,0,0]);
assert.deepEqual(calls[1].slice(-4),[0,0,844,300]);
run('endFishing()');assert.equal(run('fishingBackdrop'),null);
run('startFishing()');assert.equal(copies,2);assert.notEqual(run('fishingBackdrop'),first);
console.log('PASS: actual fishing frame branch, prompt, repeated frames, retry, DPR 2/3, viewport resize, cancellation and fresh capture. World renderer never entered.');
