import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';

const folder='assets/interiors/hollybeck-temple/';
const failedFile=folder+'sn1.png';
const calls='Promise.all([prepareExpandedFirstTemple(),prepareExpandedSandspireTemple(),prepareExpandedHollybeckTemple(),prepareExpandedMountainPassage()])';
async function setup(permanent=false){
  const {context:c,run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
  const stats={active:0,peak:0,requests:[],failures:0,decodeCalls:0};
  c.Image=class {
    set src(url){
      this.url=url;if(!url)return;
      stats.requests.push(url);stats.peak=Math.max(stats.peak,++stats.active);
      setImmediate(()=>{
        stats.active--;
        if(url.split('?')[0]===failedFile&&(permanent||stats.failures===0)){
          stats.failures++;this.onerror?.();return;
        }
        const png=fs.readFileSync(url.split('?')[0]);
        this.naturalWidth=this.width=png.readUInt32BE(16);
        this.naturalHeight=this.height=png.readUInt32BE(20);
        this.onload?.();
      });
    }
    decode(){stats.decodeCalls++;return Promise.reject(new Error('The source image cannot be decoded.'));}
  };
  return {c,run,stats};
}

// Exercise the real room builders and shared loader with Android's reported
// decode rejection and one failed Hollybeck request. Other callers share the cap.
const {c,run,stats}=await setup();
await Promise.all([run(calls),run("loadStartupImage('assets/interiors/hollybeck-temple/sn_sanctum.png')")]);
assert.equal(stats.peak,3,'All temple, cave and other startup callers share three request slots');
assert.equal(stats.failures,1);
assert.equal(stats.decodeCalls,0,'A successful load must not depend on the rejecting decode API');
assert(stats.requests.some(url=>url.startsWith(failedFile)&&url.includes('&retry=1-')),'The failed room retries with a fresh URL');
const maps=Object.values(run('W.maps')).filter(m=>m.templeExpanded);
assert.equal(maps.length,55);
assert.equal(maps.filter(m=>m.hollybeck).length,20);
for(const m of maps){
  assert.equal(m._roomBaseCanvas.naturalWidth,m.w*16);
  assert.equal(m._roomBaseCanvas.naturalHeight,m.h*16);
}

// A genuinely unreadable room must still stop startup, identify the file,
// and leave the old map intact instead of claiming readiness with missing art.
const bad=await setup(true),original=bad.run('W.maps.sn1');
await assert.rejects(bad.run('prepareExpandedHollybeckTemple()'),/hollybeck-temple\/sn1\.png: image request failed after 3 attempts/);
assert.equal(bad.stats.failures,3);
assert.equal(bad.run('W.maps.sn1'),original);
while(bad.run('startupImagesActive||startupImageQueue.length'))await new Promise(setImmediate);
assert.equal(bad.stats.active,0,'Failed requests release their slots');
console.log('PASS: 55 room backgrounds, shared three-image bound, Android decode rejection avoided, transient failure recovered, permanent failure identified without partial maps.');
