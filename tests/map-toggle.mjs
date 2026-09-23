import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../js/generated/game-part-2.js',import.meta.url),'utf8');
const panel={style:{display:'none'}},state={bag:false,overlay:null};
const ctx=vm.createContext({atlasOpen:false,atlasReturn:'game',padDx:1,padDy:1,P:{moving:true},keys:{ArrowUp:1},document:{getElementById:()=>panel},requestAnimationFrame(){},renderAtlas(){},setBag:on=>state.bag=on,setOvl:name=>{assert.notEqual(name,'menu','Removed Start menu must not be reopened');state.overlay=name;}});
vm.runInContext(code.slice(code.indexOf('function openAtlas('),code.indexOf('\n',code.indexOf('function closeAtlas('))),ctx);
for(let i=0;i<3;i++){
 vm.runInContext('openAtlas()',ctx);assert(ctx.atlasOpen);assert.equal(panel.style.display,'flex');
 vm.runInContext('closeAtlas()',ctx);assert(!ctx.atlasOpen);assert.equal(panel.style.display,'none');assert.equal(state.overlay,null);assert.equal(ctx.keys.ArrowUp,0);
}
vm.runInContext("openAtlas('bag');closeAtlas()",ctx);assert(state.bag);
console.log('PASS: repeated map open/close returns to gameplay; inventory map returns to inventory.');
