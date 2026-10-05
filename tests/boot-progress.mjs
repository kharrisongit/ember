import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../js/generated/game-part-3.js',import.meta.url),'utf8');
const boot=source.slice(source.indexOf('const BOOT = {'),source.indexOf('function bootBind()'));
let now=4250,clockId=0;
const clocks=new Map(),pauses=[],events=[],nodes=new Map();
const node=id=>{
  if(!nodes.has(id))nodes.set(id,{style:{},dataset:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;}});
  return nodes.get(id);
};
const c=vm.createContext({performance:{now:()=>now},console:{error(){}},gameplayReady:false,
  document:{getElementById:node,body:{classList:{add(){}}}},
  setInterval(fn,ms){assert.equal(ms,250);clocks.set(++clockId,fn);return clockId;},
  clearInterval(id){clocks.delete(id);},setTimeout(fn,ms){pauses.push({fn,ms});},
  *loadMapSteps(id,fresh,discard,progressive){
    assert.equal(id,'world');assert.equal(progressive,true);
    events.push('read');yield [0,'Reading map data'];
    events.push('forest');yield [.5,'Planting forests'];
    events.push('complete');yield [1,'Map ready'];
  }
});
const run=code=>vm.runInContext(code,c);
run(boot);
run('BOOT.startClock();BOOT.startClock();');
assert.equal(clocks.size,1,'Only one elapsed-time clock runs');
assert.equal(node('boot').dataset.startupState,'loading');
assert.equal(node('bootTime').textContent,'4.3s elapsed','Includes time before game code started');
const map=run("BOOT.map('world',true,70,92,'Overworld')");
assert.deepEqual(events,['read'],'Heavy map work waits until its stage has painted');
assert.equal(node('bootPercent').textContent,'70%');
assert.equal(node('bootBar').attributes['aria-valuenow'],'70');
assert.equal(node('bootMsg').textContent,'Overworld · Reading map data');

now=12120;for(const fn of clocks.values())fn();
assert.equal(node('bootTime').textContent,'12.1s elapsed','Elapsed time follows the clock, including a long pause');
assert.equal(node('bootPercent').textContent,'70%','The timer cannot invent loading progress');
pauses.shift().fn();await new Promise(setImmediate);
assert.deepEqual(events,['read','forest']);
assert.equal(node('bootPercent').textContent,'81%');
assert.equal(node('bootMsg').textContent,'Overworld · Planting forests');
run('BOOT.step(45,"Old asset callback");');
assert.equal(node('bootMsg').textContent,'Overworld · Planting forests');
pauses.shift().fn();await new Promise(setImmediate);
assert.equal(node('bootPercent').textContent,'92%');
pauses.shift().fn();await map;
assert.equal(run('gameplayReady'),false,'Finishing one map cannot bypass overall startup readiness');
assert(run('BOOT.stages.every((s,i,a)=>i===0||s.percent>=a[i-1].percent)'));

now=59996;run('BOOT.time();');
assert.equal(node('bootTime').textContent,'1m 0.0s elapsed','Minute rollover never displays 60 seconds');
now=73420;await run('BOOT.ready();');
assert.equal(run('gameplayReady'),true);assert.equal(clocks.size,0);
assert.equal(node('boot').dataset.startupState,'ready');
assert.equal(node('bootTime').textContent,'Loaded in 1m 13.4s');
assert.equal(node('bootBegin').hidden,false);
assert.equal(node('bootBar').style.display,'none');
now=90000;run('BOOT.time();');
assert.equal(node('bootTime').textContent,'Loaded in 1m 13.4s','The final startup time stays visible and stops changing');

// Failed downloads retain the stage and percentage instead of claiming ready.
run('BOOT.finishedAt=null;BOOT.waiting=false;gameplayReady=false;BOOT.at=0;BOOT.startClock();BOOT.step(54,"Loading Veilwing artwork");');
now=95000;run('BOOT.fail(new Error("network error"));BOOT.step(99,"Late completion");BOOT.ready();');
assert.equal(run('gameplayReady'),false);assert.equal(clocks.size,0);
assert.equal(node('bootPercent').textContent,'54%');
assert.equal(node('bootMsg').textContent,'Loading stopped: Loading Veilwing artwork');
assert.equal(node('bootTime').textContent,'Stopped after 1m 35.0s');
assert.match(node('bootHint').textContent,/reload/);
assert.match(node('bootHint').textContent,/network error/,'The actual failure is visible without developer tools');
assert.equal(node('boot').dataset.startupState,'failed');
run('BOOT.failed=false;BOOT.fail(Object.assign(new Error("assets/pyramid.png: image request failed after 3 attempts"),{startupStage:"Desert pyramid"}));');
assert.equal(node('bootMsg').textContent,'Loading stopped: Desert pyramid');
assert.match(node('bootHint').textContent,/assets\/pyramid\.png/,'The failing task and exact file replace the ambiguous pending-task list');
console.log('PASS: percentage and accessible progress match completed stages, staged maps yield before work, real elapsed time includes startup and pauses, completion freezes the timer, and failures retain diagnostics.');
