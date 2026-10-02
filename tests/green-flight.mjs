import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../js/generated/game-part-2.js',import.meta.url),'utf8');
const draws=[],packed=[],dustPacked=[];
const canvas=calls=>({getContext:()=>({drawImage:(...args)=>calls.push(args)})});
const c=vm.createContext({greenSceneImg:canvas(packed),greenDustImg:canvas(dustPacked),
 greenSceneSource:{decode:async()=>{}},greenDustSource:{decode:async()=>{}},
 ctx:{save(){},restore(){}},drawGameImage:(...args)=>draws.push(args)});
const run=code=>vm.runInContext(code,c);
run(source.slice(source.indexOf('const GREEN_SCENE_CEL_W'),source.indexOf('const faintDragonImg')));
await run('prepareGreenScene()');
assert.equal(packed.length,24,'All four animation strips are packed');
assert.equal(dustPacked.length,6,'The crash has a six-frame dust effect');
for(const [i,d]of packed.entries()){
 const [,, ,sw,sh,x,y,w,h]=d;
 assert(sw>0&&sh>0);
 const cellX=(i%6)*128,cellY=Math.floor(i/6)*112;
 assert(x>=cellX&&y>=cellY&&x+w<=cellX+128&&y+h<=cellY+112,'Complete dragon fits cell '+i);
}
for(const [i,d]of dustPacked.entries())assert(d[5]>=i*192&&d[5]+d[7]<=(i+1)*192&&d[6]>=0&&d[6]+d[8]<=128,'Complete dust plume fits cell '+i);
for(const name of ['wounded-green-v2.png','crash-dust-v2.png']){
 const png=fs.readFileSync(new URL('../assets/dragons/'+name,import.meta.url));
 assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
 assert.equal(png[25],6,'Art uses RGBA transparency, not JPEG matting');
}
const localDraw=i=>packed[i].slice(1).map((v,k)=>k===4?v-(i%6)*128:k===5?v-Math.floor(i/6)*112:v).map(v=>Math.round(v*1e6)/1e6);
assert.deepEqual(localDraw(11),localDraw(12),'Landing ends on the resting pose without a position jump');
assert.deepEqual(localDraw(18),localDraw(12),'Takeoff starts on the resting pose');
assert.deepEqual(localDraw(23),localDraw(0),'Takeoff ends on the first flight pose');
run(source.slice(source.indexOf('const GREEN ='),source.indexOf('function greenFly(')));
run(source.slice(source.indexOf('function greenOffset()'),source.indexOf('function followCam()')));
for(const phase of ['in','depart']){
 const frames=[];
 for(let i=0;i<6;i++)frames.push(run(`greenPhase='${phase}';greenP=(${i}+.1)/GREEN.fps/(greenPhase==='in'?GREEN_IN:GREEN_DEPART);greenFlightFrame()`));
 assert.deepEqual(frames,[0,1,2,3,4,5],phase+' uses the full authored wingbeat');
}
for(const [time,frame]of [[0,0],[.13,1],[.31,2],[.61,3],[1.01,4]])assert.equal(run(`greenPhase='crash';greenP=${time}/GREEN_CRASH;greenDustFrame()`),frame);
assert.equal(run("greenPhase='sit';greenP=.4;greenDustFrame()"),5,'Final wisps settle during rest');
assert.equal(run("greenP=.91;greenDustFrame()"),-1,'Dust clears instead of looping');
for(const phase of ['off','in','rise','depart','gone'])assert.equal(run(`greenPhase='${phase}';greenDustFrame()`),-1,'No impact dust in '+phase);
run("greenPhase='crash';greenP=.4;drawGreenScene(200,300)");
assert.equal(draws.length,2);assert.equal(draws[0][1],c.greenDustImg,'Dust is behind the readable dragon');
assert.deepEqual(draws[0].slice(6),[128,204,144,96],'Dust remains at the ground anchor');
assert.equal(draws[1][1],c.greenSceneImg);
draws.length=0;run("greenPhase='sit';greenP=2;drawGreenScene(200,300)");
assert.equal(draws.length,1);assert.deepEqual(draws[0].slice(-2),[96,84],'Breathing uses authored frames, not whole-body stretching');
const rest=[];for(let i=0;i<6;i++)rest.push(run(`greenP=${i}/4;greenSceneFrame()[1]`));assert.deepEqual(rest,[0,1,2,3,4,5]);
assert.equal(run('GREEN_REST'),5,'Five-second resting beat stays unchanged');
console.log('PASS: transparent art, unclipped frames, matching transitions, six-pose wingbeat/breathing, and grounded one-shot crash dust.');
