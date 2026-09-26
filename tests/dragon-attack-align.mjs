import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('js/generated/game-part-2.js');
const atlas=JSON.parse(gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const ATLAS_GZ = "([^"]+)"/)[1],'base64')));
Object.assign(atlas.sprites,JSON.parse(game.match(/const DRAGON_SPR = (\{[^;]+\});/)[1]));
const elements={},warnings=[],draws=[];let raf;
const g=new Proxy({fillText:t=>warnings.push(t)},{get:(o,k)=>o[k]??(()=>{})});
function element(id){return elements[id]??=( {value:'',hidden:false,disabled:false,classList:{add(){},remove(){}},addEventListener(){},focus(){doc.activeElement=this;},select(){},getContext:()=>g,setPointerCapture(){},getBoundingClientRect:()=>({width:240,height:180}),querySelector:s=>element(s.slice(1)),querySelectorAll:()=>Object.values(elements)});}
const doc={head:{append(){}},body:{append(){}},createElement:()=>element('root'+Object.keys(elements).length),getElementById:element,activeElement:null};
const c=vm.createContext({window:{addEventListener(){}},document:doc,requestAnimationFrame:f=>raf=f,navigator:{clipboard:{writeText:async()=>{}}},SPR:atlas.sprites,DRAGON_DRAW_SCALE:.42,DRAGON_PROJECTILE:{fire:10,ice:13,bolt:17,shadow:17},atlasImg:{},sheetOf:()=>({}),drawGameImage:(...a)=>{assert(a.slice(2).every(Number.isFinite));draws.push(a);},exitTools(){},clearPadInputs(){},P:{},toast(){},DIR8:['e','se','s','sw','w','nw','n','ne'],MOUTH:{n:[.4,.2],e:[.8,.5],s:[.4,.6],w:[.2,.5]}});
c.MOUTH_GND=c.MOUTH;
function extract(name){const start=game.indexOf('function '+name+'(');let brace=game.indexOf('{',start),depth=1,end=brace+1;while(depth){if(game[end]==='{')depth++;if(game[end]==='}')depth--;end++;}return game.slice(start,end);}
for(const name of ['cardinalDirection','directionVector','dragonFlip'])vm.runInContext(extract(name),c);
for(const name of ['CLAW_GND','CLAW_AIR'])c[name]=JSON.parse(game.match(new RegExp('const '+name+' = (\\{[^;]+\\});'))[1]);
vm.runInContext(read('js/dragon-attack-align.js'),c);
const api=c.window.EmberAttackAlign;
const published=JSON.stringify(api.export());
assert.equal(Object.keys(api.export().offsets.ground).length,14);
assert.equal(Object.keys(api.export().offsets.air).length,4);
assert.deepEqual(Array.from(api.offset('slash','n',false)),[1,17]);
assert.deepEqual(Array.from(api.offset('fire','w',false)),[-2,7]);
assert.deepEqual(Array.from(api.offset('slash','w',true)),[14,18]);
api.open();assert(api.isOpen());
for(const air of [false,true])for(const dir of ['n','ne','e','se','s','sw','w','nw'])for(const kind of ['slash','fire','ice','bolt','shadow']){
 elements.daStance.onchange({target:{value:air?'air':'ground'}});elements.daDirection.onchange({target:{value:dir}});elements.daKind.onchange({target:{value:kind}});
 raf(1000);assert(!warnings.some(t=>t.includes('loading')),'Preview renderer failed');
 const starting=Array.from(api.offset(kind,dir,air));
 elements.daCanvas.onpointerdown({preventDefault(){},pointerId:1,clientX:100,clientY:100});elements.daCanvas.onpointermove({preventDefault(){},pointerId:1,clientX:115,clientY:94});elements.daCanvas.onpointerup({pointerId:1});
 assert.deepEqual(Array.from(api.offset(kind,dir,air)),[starting[0]+10,starting[1]-4]);
}
assert(draws.length>=160);const exported=api.export();assert.equal(Object.keys(exported.offsets.ground).length,40);assert.equal(Object.keys(exported.offsets.air).length,40);
// Exercise the actual spawn function: every element/direction/stance receives the chosen delta.
c.dragon={x:100,y:200};c.dragonSprite=()=>[0,0,176,176,4];c.dragonBob=()=>2;vm.runInContext(extract('mouthOf'),c);
for(const air of [false,true])for(const dir of ['n','ne','e','se','s','sw','w','nw'])for(const kind of ['fire','ice','bolt','shadow']){
 c.dragonEl=kind;c.dragonAirborne=()=>air;api.set(kind,dir,air,0,0);const before=c.mouthOf(dir);api.set(kind,dir,air,10,-4);const after=c.mouthOf(dir);assert(Math.abs(after[0]-before[0]-10)<1e-8);assert(Math.abs(after[1]-before[1]+4)<1e-8);
}
elements.daReset.onclick();assert.deepEqual(Array.from(api.offset('shadow','nw',true)),[0,0]);assert.deepEqual(Array.from(api.offset('shadow','nw',false)),[10,-4]);
elements.daResetAll.onclick();assert.equal(JSON.stringify(api.export()),published,'Reset all restores the published alignments');elements.daClose.onclick();assert(!api.isOpen());
console.log('PASS: all 80 previews; touch-scaled dragging; isolated offsets; actual projectile origins; reset and close.');

const fresh=vm.createContext({window:{}});vm.runInContext(read('js/dragon-attack-align.js'),fresh);assert.equal(JSON.stringify(fresh.window.EmberAttackAlign.export()),published,'Reload restores published alignments without session edits');
