import fs from 'node:fs';import vm from 'node:vm';import zlib from 'node:zlib';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),game=read('js/generated/game-part-2.js'),source=read('js/generated/game-part-1.js');
const unpack=n=>JSON.parse(zlib.gunzipSync(Buffer.from(source.match(new RegExp('const '+n+'_GZ = "([^"]+)'))[1],'base64')));
const SPR=unpack('ATLAS').sprites,W=unpack('W'),atlasImg={},atlasPages=new Map();
const register=page=>{for(let y=Math.floor(page.y/1024);y<=Math.floor((page.y+page.h-1)/1024);y++)for(let x=Math.floor(page.x/1024);x<=Math.floor((page.x+page.w-1)/1024);x++)atlasPages.set(y*4+x,page);};
const c=vm.createContext({SPR,W,atlasImg,atlasPages,registerAtlasPage:register,sheetOf:()=>atlasImg,document:{createElement:()=>createCanvas(1,1)}}),run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('function drawPixelImage('),game.indexOf('async function loadAtlasPages()')));
run(game.slice(game.indexOf('function registerStoneGolemSprites()'),game.indexOf('function registerDesertNpcSprites()')));
const pages=JSON.parse(read('assets/game-assets.js').match(/window.EMBER_ASSETS.ATLAS_PAGES = (.*);/)[1]);
const sourceSprites=Object.entries(SPR).filter(([name])=>/^gm[123]_/.test(name));
for(const [x,y,w,h,src] of pages)if(sourceSprites.some(([,s])=>s[0]<x+w&&s[0]+s[2]*s[4]>x&&s[1]<y+h&&s[1]+s[3]>y))register({x,y,w,h,img:await loadImage(src)});
const crop=(s)=>{const im=createCanvas(s[2]*s[4],s[3]);c.drawGameImage(im.getContext('2d'),atlasImg,s[0],s[1],im.width,im.height,0,0,im.width,im.height);return im;};
const before=new Map(sourceSprites.map(([n,s])=>[n,Buffer.from(crop(s).getContext('2d').getImageData(0,0,s[2]*s[4],s[3]).data)]));
run('registerStoneGolemSprites()');let frames=0;
for(const [name,s] of sourceSprites.filter(([n])=>n.startsWith('gm1_'))){
 const gray=SPR[name.replace('gm1_','gm4_')];assert.deepEqual(Array.from(gray.slice(2,5)),Array.from(s.slice(2,5)));
 const a=before.get(name),b=crop(gray).getContext('2d').getImageData(0,0,gray[2]*gray[4],gray[3]).data;let visible=0;
 for(let i=0;i<a.length;i+=4){assert.equal(b[i+3],a[i+3],'alpha and silhouette unchanged');if(!b[i+3])continue;visible++;assert.equal(b[i],b[i+1]);assert.equal(b[i],b[i+2]);}
 assert(visible>0);frames+=gray[4];
}
for(const [name,s] of sourceSprites)assert.deepEqual(Buffer.from(crop(s).getContext('2d').getImageData(0,0,s[2]*s[4],s[3]).data),before.get(name),'original brown/crystal/ember palettes untouched');
for(const [folder,kind]of [['first-temple','golem4'],['sandspire-temple','golem1'],['hollybeck-temple','golem2']]){
 const plans=JSON.parse(read('assets/interiors/'+folder+'/layout.json'));
 assert.deepEqual([...new Set(Object.values(plans).flatMap(p=>p.enemies.map(e=>e[0])).filter(k=>k.startsWith('golem')))],[kind]);
}
const foes=W.maps.world.foes.map(f=>({...f}));run('installLavaGolem();installLavaGolem()');assert.equal(W.maps.world.foes.length,foes.length+1);assert.deepEqual(W.maps.world.foes.slice(0,foes.length),foes,'saved enemy indices retained');
const moved=W.maps.world.foes.at(-1),last=W.maps.world.features.filter(a=>a.kind==='arena'&&a.style==='volcano').sort((a,b)=>a._at-b._at).at(-1);
assert.equal(moved.k,'golem3');assert.equal(moved.x,last.x);assert.equal(moved.y,last.y);
const preview=createCanvas(400,90),g=preview.getContext('2d');g.fillStyle='#555951';g.fillRect(0,0,400,90);g.imageSmoothingEnabled=false;
for(const [i,key]of ['gm4_idle_d','gm1_idle_d','gm2_idle_d','gm3_idle_d'].entries()){const s=SPR[key];c.drawGameImage(g,atlasImg,s[0],s[1],s[2],s[3],i*100+50-s[2]/2,80-s[3],s[2],s[3]);}
if(process.env.EMBER_PREVIEW)fs.writeFileSync(process.env.EMBER_PREVIEW,preview.toBuffer('image/png'));
console.log(`PASS: all ${frames} gray golem frames preserve geometry/alpha, original palettes unchanged, correct temple variants, one Ember Golem in final lava arena without shifting saves.`);
