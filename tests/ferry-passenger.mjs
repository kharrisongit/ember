import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createCanvas,Image} from '@napi-rs/canvas';
const document={createElement:()=>createCanvas(1,1),getElementById:()=>null};
class LocalImage extends Image{set src(value){super.src=fs.readFileSync(value.split('?')[0]);}}
const c=vm.createContext({document,Image:LocalImage,console,P:{x:32,y:40,dir:'d'},ride:{turn:0,board:0,land:0},hasSword:()=>true,smithUpgrade:false});c.window=c;
const run=s=>vm.runInContext(s,c);
run(fs.readFileSync('js/player-identity.js','utf8'));
run(fs.readFileSync('js/ferry-passenger.js','utf8'));
run('FerryPassenger.prepare()');await new Promise(r=>setTimeout(r,30));
const canvas=createCanvas(64,64),g=canvas.getContext('2d');c.g=g;
const render=(hair,eyes,armor=false,dir='d')=>{
 c.smithUpgrade=armor;c.P.dir=dir;c.EmberPlayerIdentity.restore({hair,eyes});g.clearRect(0,0,64,64);
 assert(run('FerryPassenger.draw(g)'));return new Uint8ClampedArray(g.getImageData(0,0,64,64).data);
};
for(const armor of [false,true])for(const dir of ['d','u']){
 const base=render('dark','blue',armor,dir);
 for(const hair of c.EmberPlayerIdentity.colors)for(const eyes of c.EmberPlayerIdentity.eyeColors){
  const pixels=render(hair.id,eyes.id,armor,dir);
  if(hair.id!=='dark')assert(pixels.some((v,i)=>v!==base[i]),'seated hair uses every saved color');
  if(dir==='d'&&hair.id==='dark'&&eyes.id!=='blue')assert(pixels.some((v,i)=>v!==base[i]),'visible irises use every saved color');
  for(let y=32;y<64;y++)for(let x=0;x<64;x++)for(let k=0;k<4;k++)assert.equal(pixels[(y*64+x)*4+k],base[(y*64+x)*4+k],'identity changes leave clothing, armor and legs unchanged');
  for(let i=3;i<pixels.length;i+=4)assert(pixels[i]===0||pixels[i]===255,'sprite uses hard alpha');
 }
}
for(const phase of ['turn','board','land']){c.ride[phase]=.1;assert(!run('FerryPassenger.draw(g)'),'standing only during boat turn and boarding/landing');c.ride[phase]=0;}
c.ride=null;assert(!run('FerryPassenger.draw(g)'));
console.log('PASS: seated poses in both directions and outfits, all 25 hair/eye combinations, unchanged clothing, hard alpha and boarding/landing transitions.');
