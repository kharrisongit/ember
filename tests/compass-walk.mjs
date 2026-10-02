import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
const source=fs.readFileSync('js/temple-compass.js','utf8');
const c=vm.createContext({performance,Map,Math,arenaPass:false,MAPID:'world',PXW:320,PXH:240,tAcc:0,
 isSolid:(x,y)=>x<0||y<0||x>=320||y>=240||(x>=144&&x<176&&y<176)});
vm.runInContext(source.slice(source.indexOf('function compassWalkClear'),source.indexOf('function drawTempleCompass')),c);
const run=s=>vm.runInContext(s,c);
run('var player={x:104,y:80},target={x:232,y:80,heartstone:true},cache={target};');
let guide;
for(let i=0;i<150;i++){guide=run('compassWalkGuide(cache,player)');if(guide)break;}
assert(guide,'A route is found around the wall');assert.equal(guide.y,80,'Follow the first straight leg before the corner');
run('player={x:128,y:80}');guide=run('compassWalkGuide(cache,player)');assert(guide.x>128);assert.equal(guide.y,80,'Do not anticipate the south turn');
run('player={x:136,y:80}');guide=run('compassWalkGuide(cache,player)');assert.equal(guide.x,136);assert(guide.y>80,'Turn south at the corner');
assert.equal(run('arenaPass'),false,'Collision flags always restored');
assert(run('cache.navigation.path.every((p,i,path)=>!i||compassWalkVisible(path[i-1],p))'),'Every segment is walkable');
run('player={x:184,y:208}');guide=run('compassWalkGuide(cache,player)');
assert(guide.x>184,'Follow east leg before the north turn');assert.equal(guide.y,208);
run('player={x:224,y:192}');guide=run('compassWalkGuide(cache,player)');assert.equal(guide.y,192,'Stay east until north corner');
run('player={x:232,y:192}');guide=run('compassWalkGuide(cache,player)');assert.equal(guide.x,232);assert(guide.y<192,'Turn north at the actual corner');
run('player={x:224,y:80}');assert(run('compassWalkGuide(cache,player).arrived'));
console.log('PASS: compass follows a winding walkable path, turns at corners, and recognizes arrival.');
