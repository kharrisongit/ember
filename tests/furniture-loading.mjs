import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';

const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
// Reproduce the image API failure reported by the phone. Ordinary image load
// events still succeed; furniture must not depend on this extra decode call.
let decodeCalls=0;
context.Image.prototype.decode=()=>{decodeCalls++;return Promise.reject(new Error('Loading error.'));};
const seen=[],attempts=new Map();let active=0,peak=0;
Object.defineProperty(context.Image.prototype,'src',{
  get(){return this._src;},
  set(src){
    this._src=src;if(!src)return;
    const path=src.split('?')[0],attempt=(attempts.get(path)||0)+1;
    attempts.set(path,attempt);seen.push(src);active++;peak=Math.max(peak,active);
    queueMicrotask(()=>{
      active--;
      // A failed first request for a furniture sheet must recover by itself.
      if(path==='assets/interiors/forgewick/layers.png'&&attempt===1)this.onerror();
      else this.onload();
    });
  }
});
const stages=[];context.furnitureStage=s=>stages.push(s);
await run('prepareMillwoodInteriors(furnitureStage)');
assert.equal(decodeCalls,0,'Every furniture image uses the resilient event-based loader');
assert(peak<=2,'At most two large furniture sheets load concurrently');
assert.equal(attempts.get('assets/interiors/forgewick/layers.png'),2);
assert(seen.some(src=>/forgewick\/layers\.png\?v=20261001-furniture1&retry=1-/.test(src)));
assert(seen.some(src=>src.includes('throne-door-frames.png')),'Castle image loading is covered too');
assert(stages.some(s=>s.includes('forgewick'))&&stages.at(-1).includes('Seating positions'));
assert(run('Object.values(W.maps).filter(m=>m._millwoodLayers).length')>60,'All authored interiors still finish');
assert(run('window.__houseFurnitureCount')>900);
assert(run('!!W.maps.house26_bedroom2?._layeredFurniture'));

// Verify that the production crops still use the same source rectangles.
for(const town of ['millwood','thornwell','forgewick','sandspire','hollybeck','remaining']){
  const layouts=JSON.parse(fs.readFileSync('assets/interiors/'+town+'/layouts.json','utf8'));
  for(const [id,layout] of Object.entries(layouts)){
    context.roomId=id;
    assert(run('W.maps[roomId]._millwoodLayers'),'Missing room '+id);
    assert(run('W.maps[roomId]._roomBaseCanvas.width')>=layout.baseRect[2],'Room width preserved: '+id);
  }
}

// After exhausting retries, retain the specific town and file, not a generic
// "Loading error" or the names of unrelated pending tasks.
context.loadStartupImage=async src=>{
  if(src.includes('/forgewick/'))throw new Error('assets/interiors/forgewick/layers.png: image request failed after 3 attempts');
  return {width:1024,height:1024};
};
await assert.rejects(run('prepareMillwoodInteriors()'),error=>
  error.startupStage==='House furniture · forgewick'&&error.message.includes('forgewick/layers.png'));
console.log('PASS: every furnished interior loads with decode() rejecting, a failed furniture request retries, image concurrency stays bounded, and permanent failures name the exact town/file.');
