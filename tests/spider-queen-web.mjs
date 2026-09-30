import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),prefix=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {createCanvas,Image}=require(prefix?prefix+'/@napi-rs/canvas':'@napi-rs/canvas');
const {PNG}=require(prefix?prefix+'/pngjs':'pngjs');
const canvases=[];
class LocalImage extends Image{set src(path){super.src=PNG.sync.write(PNG.sync.read(fs.readFileSync(path.split('?')[0])));}}
const context=vm.createContext({Image:LocalImage,document:{createElement(){const c=createCanvas(1,1);canvases.push(c);return c;}}});
vm.runInContext(fs.readFileSync('js/spider-queen-web.js','utf8'),context);
const art=vm.runInContext('SpiderQueenWeb',context);await art.ensureArt();
assert(art.ready());assert.equal(canvases.filter(c=>c.pixelLocked).length,36);
const poses=canvases.filter(c=>c.pixelLocked),counts=poses.map(c=>{
  const p=c.getContext('2d').getImageData(0,0,96,96).data;let n=0;
  for(let i=3;i<p.length;i+=4){assert(p[i]===0||p[i]===255,'Hard alpha');if(p[i]){n++;const x=(i-3)/4%96,y=Math.floor((i-3)/4/96);assert(x>0&&x<95&&y>0&&y<95,'No clipped cell edge');}}
  assert(n>0,'No empty animation pose');return n;
});
assert(counts[3]>counts[0]*2,'Spreading silk grows into a full net');
for(const n of counts.slice(4,8))assert(n<96*96*.4,'Web holes stay open, not opaque panels');
assert(counts[15]<counts[8]*.15,'Burn sequence consumes the net into a few embers');
assert.equal(art.frame('burning',9),poses[15],'Burn clamps to the final ember pose');
assert.equal(art.frame('trapped',0),art.frame('trapped',4/3),'Taut web loops continuously');
for(let v=1;v<=4;v++){assert(art.frame('trapped',0,v)!==art.frame('trapped',0,v-1),'Distinct silhouette');assert(art.frame('burning',2,v)!==art.frame('trapped',0,v),'Every shape has burn poses');}
console.log('PASS: 36 generated web poses, crisp transparent edges, open silk holes, spreading, idle loop and consuming-fire sequence.',counts);
