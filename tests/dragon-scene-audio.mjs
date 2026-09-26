import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sources=[],listeners={},timers=[],output={};
const context={
 decodeAudioData:async bytes=>bytes,
 createGain:()=>({gain:{value:1},connect(to){this.to=to;},disconnect(){}}),
 createBufferSource:()=>{const s={connect(to){this.gain=to;},start(){this.started=true;},stop(){this.stopped=true;},disconnect(){}};sources.push(s);return s;}
};
const c=vm.createContext({window:{EmberAudio:{graph:()=>({context,output})},addEventListener:(e,f)=>listeners[e]=f},
 document:{hidden:false},performance:{now:()=>0},fetch:async path=>({ok:true,arrayBuffer:async()=>[path]}),
 setInterval:f=>timers.push(f),mode:'play',MAPID:'world',quest:5,Q:{NOISE:5,ARMED:6},P:{x:488,y:320},TS:16,shake:0});
const run=s=>vm.runInContext(s,c),flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
run(read('js/dragon-scene-audio.js'));listeners.touchstart();await flush();
const api=c.window.EmberDragonSceneAudio,active=file=>sources.filter(s=>s.started&&!s.stopped&&s.buffer[0].includes(file));
api.distant();await flush();assert.equal(active('roar').length,1);assert.equal(active('distant').length,1);
api.distant();await flush();assert.equal(sources.length,2,'Repeated requests never double the warning');
const game=read('js/generated/game-part-2.js');
run(game.slice(game.indexOf('const GREEN ='),game.indexOf('\nfunction followCam()')));
run(game.slice(game.indexOf('function greenAt()'),game.indexOf('\nconst Q =')));
c.quest=6;run('greenFly(.01)');await flush();assert.equal(active('wings').length,1);
run('greenFly(2.5)');await flush();assert.equal(active('wings').length,0);assert.equal(active('dragon-crash').length,1);
run('greenFly(.2)');await flush();assert.equal(sources.filter(s=>s.buffer[0].includes('dragon-crash')).length,1,'Impact fires once');
run('greenFly(1.1)');await flush();assert.equal(active('breathing').length,1);assert(active('breathing')[0].loop);
run('greenGone=true;greenFly(.01)');await flush();assert.equal(active('breathing').length,0);assert.equal(active('wings').length,1);
const takeoff=active('wings')[0];run('greenFly(1)');await flush();assert.equal(active('wings')[0],takeoff,'Takeoff flows into departure without restarting wings');
run('greenFly(1.4)');await flush();assert.equal(active('wings').length,0);
for(const s of sources){assert.equal(s.gain.gain.value,.7);assert.equal(s.gain.to,output,'Every effect honors the shared volume control');}
c.quest=7;timers.forEach(f=>f());assert(sources.every(s=>s.stopped),'Leaving the story clears all effects');
c.quest=6;api.phase('sit');c.mode='title';timers.forEach(f=>f());await flush();assert.equal(active('breathing').length,0,'A late decode cannot leak audio into the title');
c.mode='play';api.phase('sit');await flush();assert.equal(active('breathing').length,1);c.document.hidden=true;timers.forEach(f=>f());assert.equal(active('breathing').length,0);
assert.match(game,/EmberDragonSceneAudio\?\.distant\(\);\s+scatterBirds\(\)/,'The warning is attached to the scripted stop outside Maddock’s house');
console.log('PASS: warning cues, animation-timed wings/impact/breathing, 30% reduction, shared volume, and cleanup on departure, title and background.');
