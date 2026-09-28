import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../js/generated/game-part-2.js',import.meta.url),'utf8');
const mapButton={style:{},setAttribute(k,v){this[k]=v;}},bagButton={style:{},setAttribute(k,v){this[k]=v;}};
const panel={style:{display:'none'}},state={bag:false,overlay:null};
const ctx=vm.createContext({gameplayStarted:true,saveGame(){},toast(){},atlasOpen:false,atlasReturn:'game',padDx:1,padDy:1,P:{moving:true},keys:{ArrowUp:1},document:{getElementById:id=>id==='btnMapQuick'?mapButton:id==='bagMap'?bagButton:panel},requestAnimationFrame(){},renderAtlas(){},setBag:on=>state.bag=on,setOvl:name=>{assert.notEqual(name,'menu','Removed Start menu must not be reopened');state.overlay=name;}});
vm.runInContext(fs.readFileSync(new URL('../js/temple-compass.js',import.meta.url),'utf8'),ctx);
vm.runInContext(code.slice(code.indexOf('function openAtlas('),code.indexOf('\n',code.indexOf('function closeAtlas('))),ctx);
vm.runInContext('refreshMapControls();openAtlas()',ctx);
assert(!ctx.atlasOpen);assert.equal(mapButton['aria-disabled'],'true');assert(bagButton.disabled);
vm.runInContext("openAtlas('bag')",ctx);assert(!ctx.atlasOpen,'Inventory cannot bypass the locked map');
vm.runInContext('nanGiftBeat(12)',ctx);
assert.equal(mapButton['aria-disabled'],'false');assert(!bagButton.disabled);
for(let i=0;i<3;i++){
 vm.runInContext('openAtlas()',ctx);assert(ctx.atlasOpen);assert.equal(panel.style.display,'flex');
 vm.runInContext('closeAtlas()',ctx);assert(!ctx.atlasOpen);assert.equal(panel.style.display,'none');assert.equal(state.overlay,null);assert.equal(ctx.keys.ArrowUp,0);
}
vm.runInContext("openAtlas('bag');closeAtlas()",ctx);assert(state.bag);
console.log('PASS: repeated map open/close returns to gameplay; inventory map returns to inventory.');
