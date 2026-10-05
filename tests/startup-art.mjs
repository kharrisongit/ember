import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';

async function setup(permanent=false){
  const {context:c,run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
  const stats={active:0,peak:0,failed:0,decodes:0,urls:[]};
  c.Image=class {
    width=1024;height=1024;naturalWidth=1024;naturalHeight=1024;complete=true;
    get src(){return this.url;}
    set src(url){
      this.url=url;if(!url)return;
      stats.urls.push(url);stats.peak=Math.max(stats.peak,++stats.active);
      setImmediate(()=>{
        stats.active--;
        if(url.startsWith('assets/dragons/wounded-green-v2.png')&&(permanent||stats.failed===0)){
          stats.failed++;this.onerror?.();
        }else this.onload?.();
      });
    }
    decode(){stats.decodes++;return Promise.reject(new Error('The source image cannot be decoded.'));}
  };
  return {c,run,stats};
}

const {run,stats}=await setup();
await run('loadAtlasPages()');
await run('Promise.all([loadInventoryIcons(),loadWorkshopCraftsmen(),Frosthorn.prepare(),IceMoth.prepare(),SpiderQueenDemo.ensureArt(),SpiderQueenWeb.ensureArt()])');
assert.equal(stats.decodes,0,'No startup art depends on the failing decode API');
assert.equal(stats.peak,3,'All remaining artwork shares the three-image request limit');
assert.equal(stats.failed,1);
assert(stats.urls.some(url=>url.includes('wounded-green-v2.png?retry=1-')));
for(const fragment of ['crash-dust-v2.png','assets/inventory/','dunstan-idle.png','frosthorn/','ice-moth/','spider-queen/'])
  assert(stats.urls.some(url=>url.includes(fragment)),fragment+' is exercised');
assert.equal(run('startupImagesActive'),0);

const bad=await setup(true);
await assert.rejects(bad.run('loadAtlasPages()'),error=>{
  assert.equal(error.startupStage,'Story scenes');
  assert.match(error.message,/assets\/dragons\/wounded-green-v2\.png: image request failed after 3 attempts/);
  return true;
});
while(bad.run('startupImagesActive||startupImageQueue.length'))await new Promise(setImmediate);
console.log('PASS: full atlas/story/villager/item/workshop/boss loaders avoid decode rejections, share three slots, recover failed story art and identify permanent failures precisely.');
