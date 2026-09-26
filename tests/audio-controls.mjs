import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const p2=read('js/generated/game-part-2.js'),p3=read('js/generated/game-part-3.js'),html=read('index.html');
const nodes={};
for(const id of ['soundVolume','soundPct','soundMute','soundClose'])nodes[id]={value:'35',style:{setProperty(k,v){this[k]=v;}},listeners:{},addEventListener(k,f){this.listeners[k]=f;}};
let volume=63,closed=false;
const c=vm.createContext({document:{getElementById:id=>nodes[id]},window:{EmberAudio:{percent:()=>volume,set:v=>{volume=v;}}},setOvl:()=>{closed=true;}});
vm.runInContext(p3.slice(p3.indexOf('function soundPercent(){'),p3.indexOf('const SAVE_SLOT_COUNT')),c);
c.syncSoundDial();assert.equal(nodes.soundVolume.value,'63');assert.equal(nodes.soundPct.textContent,'63%');
for(const value of [25,73,100,0,48]){
 nodes.soundVolume.value=String(value);nodes.soundVolume.listeners.input();
 assert.equal(volume,value);assert.equal(nodes.soundPct.textContent,value+'%');assert.equal(nodes.soundVolume.style['--volume'],value+'%');
 assert.equal(nodes.soundMute.textContent,value===0?'UNMUTE':'MUTE');
}
nodes.soundMute.listeners.click({preventDefault(){}});assert.equal(volume,0);
nodes.soundMute.listeners.click({preventDefault(){}});assert.equal(volume,48,'Unmute restores the actual slider setting');
volume=81;c.syncSoundDial();assert.equal(nodes.soundVolume.value,'81','Reopening synchronizes the saved volume');
const close={preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
nodes.soundClose.listeners.click(close);assert(closed&&close.prevented&&close.stopped);
const input=html.match(/<input id="soundVolume"[^>]+>/)?.[0];assert(input);assert.match(input,/type="range"/);assert.match(input,/min="0"/);assert.match(input,/max="100"/);
// The document's touch suppression must leave the native slider gesture alone.
let move;
const touch=vm.createContext({document:{addEventListener:(type,f)=>{if(type==='touchmove')move=f;}},lockEl:null,scrollerFor:()=>null});
vm.runInContext(p2.slice(p2.indexOf('document.addEventListener("touchmove", e => {'),p2.indexOf('document.addEventListener("touchend", () => { lockEl')),touch);
const e={cancelable:true,target:{closest:selector=>selector==='input[type="range"]'?{}:null},preventDefault(){this.prevented=true;}};
move(e);assert(!e.prevented,'Safari can deliver the slider drag instead of the page swallowing it');
e.target.closest=()=>null;move(e);assert(e.prevented,'Ordinary game touches keep their existing scroll protection');
console.log('PASS: native volume input updates audio, fill and percentage; mute restores the selected value; reopening synchronizes volume; touch drag is not swallowed by the game.');
