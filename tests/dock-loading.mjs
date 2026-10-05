import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const code=read('js/generated/game-part-2.js');
const requests=[];let failures=0;
class Image {
  set src(url){if(!url)return;requests.push(url);queueMicrotask(()=>{if(failures-->0)this.onerror();else this.onload();});}
}
const c=vm.createContext({Image,setTimeout,clearTimeout,Date});
vm.runInContext(read('js/startup-assets.js'),c);
vm.runInContext(code.slice(code.indexOf('async function loadDockImage('),code.indexOf('async function loadDockOriginalAssets(')),c);
failures=1;
await c.loadDockImage('assets/rail.png?v=1',10,'passage_rail');
assert.equal(requests.length,2);assert.match(requests[1],/\?v=1&retry=1-/);
requests.length=0;failures=3;
await assert.rejects(c.loadDockImage('assets/rail.png',10,'passage_rail'),/Dock Asset 10 \(passage_rail\): image request failed/);
assert.equal(requests.length,3);
const src=read('js/mountain-passage.js').match(/"name":"passage_rail"[^\n]+?"src":"([^"]+)"/)[1];
assert(src.startsWith('data:image/png;base64,'));
assert.deepEqual(Buffer.from(src.split(',')[1],'base64'),fs.readFileSync(new URL('../assets/interiors/mountain-passage/passage-rail.png',import.meta.url)));
requests.length=0;failures=0;
await c.loadDockImage(src,10,'passage_rail');assert.equal(requests.length,1);
console.log('PASS: embedded rail matches original PNG; external image failures retry with fresh URLs and report terminal errors.');

// Load every high-detail strip through the production Hollybeck loader.
{
 const crops=[],sheets={};
 const h=vm.createContext({SPR:{},animalSheets:sheets,
  setTimeout,clearTimeout,Date,
  Image:class{set src(url){this.url=url;if(url)queueMicrotask(()=>this.onload());}},
  document:{createElement:()=>({getContext:()=>({drawImage:(img,...rect)=>{
   const png=fs.readFileSync(new URL('../'+img.url.split('?')[0],import.meta.url));
   const [x,y,w,height]=rect;
   assert(x>=0&&y>=0&&x+w<=png.readUInt32BE(16)&&y+height<=png.readUInt32BE(20),'Every complete directional strip fits its PNG');
   crops.push([img.url,...rect]);
  }})})}});
 vm.runInContext(code.slice(code.indexOf('function villagerIdleFrame('),code.indexOf('function finishTownCast(')),h);
 vm.runInContext(read('js/startup-assets.js'),h);
 vm.runInContext(read('js/hollybeck-villagers.js'),h);
 await h.prepareHollybeckArt();
 assert.equal(Object.keys(sheets).length,24,'Three residents each load four idle and four walk directions');
 assert.equal(crops.length,24);assert.equal(new Set(crops.map(c=>c[0])).size,6);
 for(const [key,sheet]of Object.entries(sheets)){
  assert.equal(sheet.width,key.includes('_idle_')?256:384);assert.equal(sheet.height,64);
  assert.equal(sheet.spriteScale,2);assert.equal(sheet.pixelLocked,true);
 }
 const n={n:'Runa',packSpr:'hollybeck_runa'},seen=new Set();
 for(let t=0;t<12;t+=.01){
  const frame=h.hollybeckNpcFrame(n,t,'idle');seen.add(frame);
  assert.equal(frame,h.villagerIdleFrame(n,t,4),'Outdoor idle follows the indoor breathing and blinking clock');
  assert.equal(h.hollybeckNpcFrame(n,t,'walk'),Math.floor(t*8)%6);
 }
 assert.equal(seen.size,4,'Breathing and both blink states occur');
 await h.prepareHollybeckArt();assert.equal(crops.length,24,'Repeated preparation is idempotent');
 console.log('PASS: all three winter residents load 2× directional art; six walking poses and the same authored idle timing as indoor NPCs.');
}
