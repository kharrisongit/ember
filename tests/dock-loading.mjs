import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const code=read('js/generated/game-part-2.js');
const requests=[];let failures=0;
class Image {
  set src(url){requests.push(url);queueMicrotask(()=>{if(failures-->0)this.onerror();else this.onload();});}
}
const c=vm.createContext({Image,setTimeout,clearTimeout,Date});
vm.runInContext(code.slice(code.indexOf('async function loadDockImage('),code.indexOf('async function loadDockOriginalAssets(')),c);
failures=1;
await c.loadDockImage('assets/rail.png?v=1',10,'passage_rail');
assert.equal(requests.length,2);assert.match(requests[1],/\?v=1&retry=1-/);
requests.length=0;failures=3;
await assert.rejects(c.loadDockImage('assets/rail.png',10,'passage_rail'),/Dock Asset 10 \(passage_rail\) failed/);
assert.equal(requests.length,3);
const src=read('js/mountain-passage.js').match(/"name":"passage_rail"[^\n]+?"src":"([^"]+)"/)[1];
assert(src.startsWith('data:image/png;base64,'));
assert.deepEqual(Buffer.from(src.split(',')[1],'base64'),fs.readFileSync(new URL('../assets/interiors/mountain-passage/passage-rail.png',import.meta.url)));
requests.length=0;failures=0;
await c.loadDockImage(src,10,'passage_rail');assert.equal(requests.length,1);
console.log('PASS: embedded rail matches original PNG; external image failures retry with fresh URLs and report terminal errors.');

// Check the new four-direction sheets through the actual atlas crop loader.
{
 const crops=[],pages=[];
 const h=vm.createContext({DOCK_ORIGINAL_ASSETS:[],SPR:{wall78_sheet:[0,0]},WALL78_PIECES:[],
  Image:class {set src(url){this.url=url;queueMicrotask(()=>this.onload());}},
  setTimeout,clearTimeout,Date,registerAtlasPage:p=>pages.push(p),
  document:{createElement:()=>({getContext:()=>({drawImage:(img,...rect)=>{
   const png=fs.readFileSync(new URL('../'+img.url.split('?')[0],import.meta.url));
   const [x,y,w,h]=rect;
   assert(x>=0&&y>=0&&x+w<=png.readUInt32BE(16)&&y+h<=png.readUInt32BE(20),'Every frame crop stays inside its PNG');
   crops.push([img.url,...rect]);
  }})})}});
 vm.runInContext(read('js/hollybeck-villagers.js'),h);
 vm.runInContext(code.slice(0,code.indexOf('// Gray stone')),h);
 await h.loadDockOriginalAssets();
 assert.equal(pages.length,16,'Two residents each have four walk and four idle strips');
 assert.equal(crops.length,128,'All 128 animation and blink frames load');
 for(const p of pages){assert.equal(p.w,192);assert.equal(p.h,30);}
 assert.equal(new Set(crops.map(c=>c[0])).size,4,'Standing idles use separate artwork from walking');
 for(const action of ['walk','idle']){
  assert.equal(h.hollybeckNpcFrame({t:0},.04,action),7,'Half-closed eyes ease into blink');
  assert.equal(h.hollybeckNpcFrame({t:0},.12,action),6,'Fully closed eyes in middle of blink');
  assert.equal(h.hollybeckNpcFrame({t:0},.22,action),7,'Half-closed eyes ease out of blink');
  assert.equal(h.hollybeckNpcFrame({t:0},3.92,action),6,'Blinks repeat in both animation states');
  for(const t of [.3,.7,1.2,2.4,3.6])assert(h.hollybeckNpcFrame({t:0},t,action)<6,'Ordinary motion frames between blinks');
 }
 assert.notEqual(h.hollybeckNpcFrame({t:1},.08,'idle'),6,'Residents blink at independent times');
 console.log('PASS: all 128 winter frames load; walking and idle blinks ease through half-closed, closed, half-closed and open eyes at the same speed.');
}
