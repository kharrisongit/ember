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
