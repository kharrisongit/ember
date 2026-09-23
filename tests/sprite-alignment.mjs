import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const code=read('js/millwood-interiors.js'),game=read('js/generated/game-part-2.js');
const draws=[],door={royalDoor:true,x:312,y:64,sy:96};
const W={maps:{cinderhold:{roomActors:[door]},royal_seal:{roomActors:[]}}};
const ctx=vm.createContext({W,SPR:{throne_wall:[0,12177,328,51]},atlasImg:{},document:{createElement:()=>({getContext:()=>({})})},drawGameImage:(...a)=>draws.push(a)});
vm.runInContext(code,ctx);vm.runInContext('prepareThroneGallery();prepareThroneGallery()',ctx);
assert.equal(W.maps.cinderhold.roomActors.length,1);assert.equal(W.maps.royal_seal.roomActors.length,1);
assert.deepEqual(door,{royalDoor:true,x:312,y:64,sy:96});
const painting=W.maps.royal_seal.roomActors[0];assert(painting.editorMovable);
assert.deepEqual(draws[0].slice(2),[280,12187,26,31,0,0,26,31]);
assert.equal(draws.length,1);
const raw=execFileSync('python',['-c',"from PIL import Image;import sys;sys.stdout.buffer.write(Image.open(sys.argv[1]).convert('RGBA').tobytes())",new URL('assets/interiors/house-seated.png',root).pathname]);
ctx.source=new Uint32Array(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
const result=vm.runInContext('seatedPixels2x(source,96,1080)',ctx);
assert.equal(result.length,192*2160);
let changed=0;
for(let cy=0;cy<45;cy++)for(let cx=0;cx<4;cx++){
 const palette=new Set();for(let y=0;y<24;y++)for(let x=0;x<24;x++)palette.add(ctx.source[(cy*24+y)*96+cx*24+x]);
 for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  const pixel=result[(cy*48+y)*192+cx*48+x];assert(palette.has(pixel),'Colours leaked between animation cells');
  if(pixel!==ctx.source[(cy*24+(y>>1))*96+cx*24+(x>>1)])changed++;
 }
}
assert(changed>1000,'Refinement did not change pixel edges');
vm.runInContext(game.slice(game.indexOf('const ENT_ATTACK_OFFSETS='),game.indexOf('function golemFrame(')),ctx);
const offsets=vm.runInContext('ENT_ATTACK_OFFSETS',ctx);assert.equal(Object.keys(offsets).length,12);
// Execute the actual renderer positioning with a south attack cell and compare
// its trunk baseline (74px tall) with the smaller idle cell.
const positioning=game.slice(game.indexOf('      const anchor=ENT_ATTACK_OFFSETS'),game.indexOf('      if (f.hurt > 0',game.indexOf('      const anchor=ENT_ATTACK_OFFSETS')));
for(let variant=1;variant<=3;variant++){
 Object.assign(ctx,{f:{x:200,y:200,kind:'ent'+variant},s2:[0,0,128,122],o:{nm:`ent${variant}_atk_d`}});
 assert.equal(vm.runInContext(`{${positioning};dy+74}`,ctx),200,'Ent trunk rises when its vine cell starts');
}
console.log(`PASS: throne painting relocation and layering; ${changed} refined seated pixels with isolated palettes; ent attack body baseline.`);
