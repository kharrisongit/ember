// Run with Node and @napi-rs/canvas, as with map-pixel-seams.mjs.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createCanvas,Image:CanvasImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas');
const {PNG}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/pngjs':'pngjs');
const root=new URL('../',import.meta.url),created=[],samples=new Map();
class LocalImage extends CanvasImage {
  // The native test decoder rejects the generated PNG provenance chunk.
  // Decode the same RGBA pixels without changing the browser's source assets.
  set src(path){super.src=PNG.sync.write(PNG.sync.read(fs.readFileSync(new URL(path.split('?')[0],root))));}
}
const output=createCanvas(128,112),ctx=output.getContext('2d');
const context=vm.createContext({console,Image:LocalImage,
  document:{createElement:()=>{const c=createCanvas(1,1);created.push(c);return c;}},
  fetch:async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(path.split('?')[0],root)))}),
  MAPID:'world',P:{x:480,y:160},cam:{x:320,y:0,z:1},VW:480,VH:320,
  mode:'play',scene:null,bossScene:null,ovl:null,ask:null,bagOpen:false,atlasOpen:false,
  fishing:false,fadeDir:0,doorMotion:null,ctx,
  drawPixelImage:(g,...args)=>g.drawImage(...args),
});
vm.runInContext(fs.readFileSync(new URL('js/spider-queen-demo.js',root),'utf8'),context);
const demo=vm.runInContext('SpiderQueenDemo',context);
await demo.ensureArt();
assert.equal(demo.inspect().ready,true,'All five source sheets load and decode');
assert.equal(demo.inspect().failed,false);
const packed=created.filter(c=>c.pixelLocked);
assert.equal(packed.length,132,'Every authored pose and projectile frame is imported');
for(const c of packed){
  const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  let opaque=0;
  for(let p=3;p<pixels.length;p+=4){
    assert(pixels[p]===0||pixels[p]===255,'Every imported edge uses binary alpha');
    if(pixels[p]){
      opaque++;
      const x=((p-3)/4)%c.width,y=Math.floor((p-3)/4/c.width);
      assert(x>0&&x<c.width-1&&y>0&&y<c.height-1,'Pose fits without touching a frame boundary');
      if(c.width===128)assert(y<90,'All queen feet use the shared ground baseline');
    }
  }
  assert(opaque>20,'No pose is empty after extraction');
}
const actions=new Set(),directions=new Set(),venom=new Set();let splashSeen=false,maxShots=0;
for(let tick=0;tick<3000;tick++){
  demo.step(.05);
  const state=demo.inspect(),a=state.actor;
  actions.add(a.state);directions.add(a.dir);
  assert(a.x>=432&&a.x<=544&&a.y>=88&&a.y<=120,'Patrol stays above the north field');
  maxShots=Math.max(maxShots,state.shots.length);
  splashSeen||=state.splashes.length>0;
  for(const s of state.shots){
    venom.add(s.dir);
    assert.equal(Math.hypot(s.vx,s.vy),74,'Venom keeps a constant travel speed');
    assert(s.t<1.3,'Venom expires instead of accumulating');
  }
  const poseTime=a.state==='stomp'?.85:a.state==='spit'?.7:.25;
  const key=a.dir+' '+a.state;
  if(['idle','walk','stomp','spit'].includes(a.state)&&a.t>=poseTime&&!samples.has(key)){
    ctx.clearRect(0,0,128,112);ctx.save();ctx.translate(64-a.x,100-a.y);
    demo.draw({spiderQueen:true});ctx.restore();
    const c=createCanvas(128,112);c.getContext('2d').drawImage(output,0,0);samples.set(key,c);
  }
}
assert.deepEqual([...directions].sort(),['d','e','u','w']);
assert.deepEqual([...venom].sort(),['d','e','u','w'],'Spit launches in all four facing directions');
for(const action of ['idle','walk','pause','stomp','recover','spit','rest'])assert(actions.has(action));
assert.equal(maxShots,1,'Each spit releases only one projectile');
assert(splashSeen,'Expired projectiles produce the splash animation');
const before=JSON.stringify(demo.inspect());context.bagOpen=true;demo.step(.05);
assert.equal(JSON.stringify(demo.inspect()),before,'Menus pause the entire demo');
context.bagOpen=false;context.MAPID='millwood';demo.step(.05);
assert.equal(demo.inspect().shots.length,0,'Projectiles clear on map exit');
const list=[];demo.addToDraw(list);assert.equal(list.length,0,'The queen never appears inside another map');
context.MAPID='world';demo.addToDraw(list);assert(list.some(o=>o.spiderQueen));
if(process.env.SPIDER_PREVIEW){
  const sheet=createCanvas(512*2,4*132*2),g=sheet.getContext('2d');
  g.scale(2,2);g.imageSmoothingEnabled=false;g.fillStyle='#45593e';g.fillRect(0,0,512,528);
  ['d','e','w','u'].forEach((dir,row)=>['idle','walk','stomp','spit'].forEach((action,col)=>{
    g.drawImage(samples.get(dir+' '+action),col*128,row*132);
    g.fillStyle='#fff';g.font='10px monospace';g.fillText(dir+' '+action,col*128+6,row*132+125);
  }));
  fs.writeFileSync(process.env.SPIDER_PREVIEW,sheet.toBuffer('image/png'));
}
console.log('PASS: 132 crisp, unclipped poses; four-direction patrol, stomp/spit cycle, venom lifetime, menu pause and map isolation.');
