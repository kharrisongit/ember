import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const requests=[],timers=new Map();let nextTimer=0;
class Image {
  set src(url){this.url=url;if(url)requests.push(this);}
  decode(){assert.fail('A successfully loaded image must not depend on a second decode promise');}
}
const c=vm.createContext({Image,Date,fetch:async()=>{},
  setTimeout(fn){timers.set(++nextTimer,fn);return nextTimer;},clearTimeout(id){timers.delete(id);}});
vm.runInContext(read('js/startup-assets.js'),c);
const tick=()=>new Promise(setImmediate);
const jobs=Array.from({length:5},(_,i)=>c.loadStartupImage('assets/town'+i+'.png?v=1'));
assert.equal(requests.length,3,'All callers share a three-image request bound');
requests[0].onerror();await tick();
assert.equal(requests.length,4);assert.match(requests[3].url,/town0\.png\?v=1&retry=1-/);
assert(!requests.some(img=>img.url.includes('town3')),'Retry retains its slot');
requests[3].onload();await tick();
assert(requests[4].url.includes('town3'));
for(const img of requests.slice(1,3))img.onload();await tick();
for(const img of requests.slice(4))img.onload();
assert.equal((await Promise.all(jobs)).length,5);await tick();
assert.equal(timers.size,0,'Successful and failed attempts clean up their timers');

const before=requests.length;
const failed=c.loadStartupImage('assets/pyramid.png');
const rejection=assert.rejects(failed,/assets\/pyramid\.png: image request failed after 3 attempts/);
for(let i=0;i<3;i++){requests.at(-1).onerror();await tick();}
await rejection;assert.equal(requests.length-before,3,'Permanent failures stop after bounded retries');
assert.equal(timers.size,0);

const timed=c.loadStartupImage('data:image/png;base64,broken','Nan cooking artwork');
const timeout=assert.rejects(timed,/Nan cooking artwork: image request timed out after 1 attempt/);
const lateLoad=requests.at(-1).onload;
[...timers.values()][0]();lateLoad();await timeout;await tick();
assert.equal(timers.size,0,'Timeouts release the queue and ignore late events');
const next=c.loadStartupImage('assets/recovered.png');requests.at(-1).onload();await next;

let fetches=0;const options=[];
c.fetch=async(src,opt)=>{fetches++;options.push(opt);return fetches===1?{ok:false,status:503}:{ok:true,json:async()=>({rooms:8})};};
assert.equal((await c.loadStartupJSON('assets/layout.json?v=1')).rooms,8);
assert.equal(fetches,2);assert.equal(options[1].cache,'reload');
c.fetch=async()=>({ok:false,status:404});
await assert.rejects(c.loadStartupJSON('assets/missing.json'),/assets\/missing\.json: HTTP 404 after 3 attempts/);

// A failed town subtask must remain identifiable even while pyramid work is pending.
const p2=read('js/generated/game-part-2.js');
const source=p2.slice(p2.indexOf('async function buildHouseFurnitureLayers('),p2.indexOf('/* === end household furniture layering'));
const p=vm.createContext({prepareJourneyArt:async()=>{const e=new Error('assets/sprites/regional/tilda.png: image request failed');e.startupStage='Regional villagers';throw e;},
  prepareMillwoodInteriors:async()=>{},prepareHouseLoot:async()=>{},prepareExpandedFirstTemple:async()=>{},
  prepareExpandedSandspireTemple:async()=>{},prepareExpandedHollybeckTemple:async()=>{},prepareExpandedMountainPassage:async()=>{},
  DesertPyramid:{prepare:()=>new Promise(()=>{})},Frosthorn:{prepare:async()=>{}},IceMoth:{prepare:async()=>{}}});
vm.runInContext(source,p);
await assert.rejects(p.buildHouseFurnitureLayers(),e=>e.startupStage==='Regional villagers'&&e.message.includes('tilda.png'));

// The old wall-clock watchdog cannot call a long, active startup a render failure.
const html=read('index.html'),start=html.indexOf('  window.addEventListener("load", function () {');
const watchdog=html.slice(start,html.indexOf('\n})();',start));
for(const state of ['loading','failed','ready']){
  const checks=[],messages=[];
  const w=vm.createContext({window:{addEventListener(event,fn){fn();}},
    document:{getElementById:id=>id==='boot'?{dataset:{startupState:state}}:{width:640,height:480}},
    setTimeout:fn=>checks.push(fn),show:title=>messages.push(title)});
  vm.runInContext(watchdog,w);while(checks.length)checks.shift()();
  assert.equal(messages.length,state==='ready'?1:0,'Watchdog respects '+state+' state');
}
console.log('PASS: bounded artwork loading, fresh-URL retries, timeout cleanup, precise failed files/stages, JSON recovery, and no false render warning during startup.');
