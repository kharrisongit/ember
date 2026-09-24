// Raster regression: npm install --no-save @napi-rs/canvas, then run with Node.
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const code=process.env.EMBER_RENDER_SOURCE?fs.readFileSync(process.env.EMBER_RENDER_SOURCE,'utf8'):read('js/generated/game-part-2.js');
const SPR=JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const ATLAS_GZ = "([^"]+)/)[1],'base64'))).sprites;
const pages=JSON.parse(read('assets/game-assets.js').match(/window.EMBER_ASSETS.ATLAS_PAGES = (.*);/)[1]);
const atlasImg={},atlasPages=new Map(),c=vm.createContext({atlasImg,atlasPages});
const start=code.indexOf('function drawPixelImage(');
vm.runInContext(code.slice(start<0?code.indexOf('function drawGameImage('):start,code.indexOf('async function loadAtlasPages()')),c);
const draw=c.drawGameImage;
// Load the real bridge, river and animated shoreline atlas pages.
for(const [x,y,w,h,src] of pages)if(y<=3395&&y+h>3363){
  const img=await loadImage(src),page={x,y,w,h,img};
  for(let ty=Math.floor(y/1024);ty<=Math.floor((y+h-1)/1024);ty++)
    for(let tx=Math.floor(x/1024);tx<=Math.floor((x+w-1)/1024);tx++)atlasPages.set(ty*4+tx,page);
}
const crop=(name,frame=0)=>{
  const s=SPR[name],im=createCanvas(s[2],s[3]),g=im.getContext('2d');g.imageSmoothingEnabled=false;
  draw(g,atlasImg,s[0]+frame*s[2],s[1],s[2],s[3],0,0,s[2],s[3]);return im;
};
const rgba=canvas=>canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
const water=crop('water_plain'),waterColor=Array.from(rgba(water).slice(0,4));
assert.equal(waterColor[3],255);
for(let i=0,a=rgba(water);i<a.length;i+=4)assert.deepEqual(Array.from(a.slice(i,i+4)),waterColor,'Source river tile is solid');
const output=createCanvas(800,800),g=output.getContext('2d');
let cases=0;
for(const dpr of [1,1.25,2])for(const zoom of [.72,1.9382652,2.153628,2.35,3,5.5])for(const origin of [0,1024,53760]){
  const scale=dpr*zoom,ox=origin+.173,oy=origin+.417;
  g.setTransform(1,0,0,1,0,0);g.fillStyle='#548c49';g.fillRect(0,0,800,800);
  g.imageSmoothingEnabled=false;g.setTransform(scale,0,0,scale,10.37-ox*scale,11.23-oy*scale);
  // Static map pieces and animated water meet at the same fractional camera offset.
  for(let y=0;y<4;y++)for(let x=0;x<4;x++){
    const s=SPR.water_plain;
    if(y<2)draw(g,water,origin+x*16,origin+y*16);
    else draw(g,atlasImg,s[0],s[1],s[2],s[3],origin+x*16,origin+y*16,16,16);
  }
  const a=rgba(output),left=Math.round(10.37-.173*scale),top=Math.round(11.23-.417*scale);
  const right=Math.round(10.37+(64-.173)*scale),bottom=Math.round(11.23+(64-.417)*scale);
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
    const i=(y*800+x)*4;
    if(a[i]!==waterColor[0]||a[i+1]!==waterColor[1]||a[i+2]!==waterColor[2]||a[i+3]!==255)
      assert.fail(`River seam at ${x},${y}: zoom ${zoom}, DPR ${dpr}, world origin ${origin}`);
  }
  cases++;
}
// Full 256px cached chunks also meet without a line while the camera pans.
const chunk=createCanvas(256,256),ch=chunk.getContext('2d');ch.fillStyle=`rgb(${waterColor.slice(0,3).join(',')})`;ch.fillRect(0,0,256,256);
g.setTransform(1,0,0,1,0,0);g.fillStyle='#548c49';g.fillRect(0,0,800,800);g.setTransform(1.07,0,0,1.07,3.17,2.51);
for(let x=0;x<2;x++)for(let y=0;y<2;y++)draw(g,chunk,x*256,y*256);
for(let y=3,a=rgba(output);y<550;y++)for(let x=3;x<551;x++){
  const i=(y*800+x)*4;
  assert(a[i]===waterColor[0]&&a[i+1]===waterColor[1]&&a[i+2]===waterColor[2],'Cached map chunks have no visible join');
}
// All source colors stay intact at bridge joins: no green background leaks through.
const bridge=crop('brg_mf'),palette=new Set();
for(let i=0,a=rgba(bridge);i<a.length;i+=4){assert.equal(a[i+3],255);palette.add(a.slice(i,i+4).join(','));}
g.setTransform(1,0,0,1,0,0);g.fillStyle='#548c49';g.fillRect(0,0,800,800);
g.setTransform(4.5723,0,0,4.5723,.37,1.23);
for(let y=0;y<6;y++)for(let x=0;x<4;x++){const s=SPR.brg_mf;draw(g,atlasImg,s[0],s[1],16,16,x*16,y*16,16,16);}
for(let y=2,a=rgba(output);y<439;y++)for(let x=1;x<292;x++)assert(palette.has(a.slice((y*800+x)*4,(y*800+x)*4+4).join(',')),'Bridge join introduces a foreign color');

// Page splits remain fully covered when mirrored, including translucent effects.
const stripe=createCanvas(32,16),sg=stripe.getContext('2d');
sg.fillStyle='#e39b3b';sg.fillRect(0,0,16,16);sg.fillStyle='#354bcf';sg.fillRect(16,0,16,16);
for(let i=0;i<2;i++){
  const page=createCanvas(1024,16),pg=page.getContext('2d');pg.drawImage(stripe,i*16,0,16,16,i?0:1008,0,16,16);
  atlasPages.set(i,{img:page,x:i*1024,y:0,w:1024,h:16});
}
for(const flip of [1,-1])for(const scale of [2,3.876,5.17]){
  const actual=createCanvas(200,120),expected=createCanvas(200,120);
  for(const canvas of [actual,expected]){const cg=canvas.getContext('2d');cg.imageSmoothingEnabled=false;cg.globalAlpha=.5;cg.setTransform(scale*flip,0,0,scale,flip>0?3.31:181.31,4.27);}
  draw(actual.getContext('2d'),atlasImg,1008,0,32,16,0,0,32,16);
  draw(expected.getContext('2d'),stripe,0,0);
  const a=rgba(actual),b=rgba(expected),colors=new Set();
  for(let i=0;i<b.length;i+=4)colors.add(b.slice(i,i+4).join(','));
  for(let i=0;i<a.length;i+=4){
    assert.equal(a[i+3],b[i+3],'No crack or doubled opacity at a mirrored atlas-page boundary');
    assert(colors.has(a.slice(i,i+4).join(',')),'Page edge contains only original sprite colors');
  }
  const x=Math.round((flip>0?3.31:181.31)+flip*8*scale),y=Math.round(4.27+8*scale),i=(y*200+x)*4;
  assert.deepEqual(Array.from(a.slice(i,i+4)),Array.from(b.slice(i,i+4)),'Mirrored sprite orientation is unchanged');
}
// Transparency, source crop and sampling for smoothed/rotated art are preserved.
const calls=[],matrix={a:2.13,b:0,c:0,d:2.13,e:.37,f:.23};
const mock={imageSmoothingEnabled:true,getTransform:()=>matrix,drawImage:(...a)=>calls.push(a)};
draw(mock,stripe,3,4,10,7,5.1,6.2,15.3,11.4);
assert.deepEqual(calls.pop().slice(1),[3,4,10,7,5.1,6.2,15.3,11.4]);
mock.imageSmoothingEnabled=false;matrix.b=.3;
draw(mock,stripe,3,4,10,7,5.1,6.2,15.3,11.4);
assert.deepEqual(calls.pop().slice(1),[3,4,10,7,5.1,6.2,15.3,11.4]);
const transparent=createCanvas(16,16),tg=transparent.getContext('2d');tg.fillStyle='#e39b3b';tg.fillRect(4,4,8,8);
g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,800,800);g.setTransform(3.87,0,0,3.87,.17,.39);
draw(g,transparent,0,0);const pixels=rgba(output);assert.equal(pixels[3],0,'Transparent sprite corners stay transparent');
assert.equal(pixels[(30*800+30)*4+3],255,'Sprite body stays opaque');
g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,800,800);g.save();
g.beginPath();g.rect(0,0,20,20);g.clip();g.setTransform(3.87,0,0,3.87,.17,.39);
const before=g.getTransform();draw(g,water,0,0);const after=g.getTransform();
for(const key of ['a','b','c','d','e','f'])assert.equal(after[key],before[key],'Drawing restores the camera transform');
assert.equal(rgba(output)[(10*800+25)*4+3],0,'Existing sprite/table clipping stays in place');g.restore();
console.log(`PASS: ${cases} real river renders without seams, bridge and chunk joins, atlas-page boundaries, mirrored sprites, transparency/clipping, and untouched smoothed/rotated sampling.`);
