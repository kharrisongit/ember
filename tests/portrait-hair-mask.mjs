import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
// Real pixels sampled from Corin's original 192px cells (pack 1 and pack 8).
// Render through the shipped portraitSource canvas path and compare clothing.
const outfits=[
 {armored:false,hair:[[100,25,25,7,18,253],[75,70,61,35,37,157]],collar:[[74,81,46,15,0,251],[68,85,112,51,35,252],[80,90,22,5,0,253]]},
 {armored:true,hair:[[95,45,82,67,76,252],[76,79,42,23,27,244]],collar:[[73,87,56,25,20,253],[77,91,67,64,65,252],[80,100,50,21,6,252]]}
];
for(const outfit of outfits){
 const original=new Uint8ClampedArray(192*192*4);
 for(const [x,y,...rgba]of [...outfit.hair,...outfit.collar])original.set(rgba,(y*192+x)*4);
 let rendered;
 const c={Uint8ClampedArray,document:{createElement(){const data=original.slice();return {getContext:()=>({drawImage(){},getImageData:()=>({data}),putImageData(p){rendered=p.data;}}),toDataURL:()=> 'data:image/png;base64,test'};}},Image:class{width=960;height=768;set src(s){queueMicrotask(()=>this.onload());}}};c.window=c;
 vm.runInNewContext(fs.readFileSync('js/player-identity.js','utf8'),c);
 for(const color of ['brown','copper','blond','silver']){
  await c.EmberPlayerIdentity.portraitSource(c.EmberPlayerIdentity.portrait(color,outfit.armored,'blue'),'original-atlas');
  for(const [x,y]of outfit.collar){const i=(y*192+x)*4;assert.deepEqual(rendered.slice(i,i+4),original.slice(i,i+4),`${color}, armored=${outfit.armored}: collar at ${x},${y}`);}
  for(const [x,y]of outfit.hair){const i=(y*192+x)*4;assert.notDeepEqual(rendered.slice(i,i+3),original.slice(i,i+3),`${color}: both crown and rear hair recolor`);assert.equal(rendered[i+3],original[i+3]);}
 }
}
console.log('PASS: every nondefault hair color changes crown/rear hair and preserves both outfits’ collar pixels and alpha.');
