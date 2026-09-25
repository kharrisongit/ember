/* Runs all maintained game scripts and published layouts; only browser APIs,
   rendering and timers are stubbed. Map generation and editor loading are real. */
const fs=require('fs'),vm=require('vm'),{performance}=require('perf_hooks');
const root=require('path').resolve(__dirname,'..')+'/';

const noop=()=>{}; const ctx=new Proxy({measureText:()=>({width:40}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h})},{get:(o,k)=>k in o?o[k]:noop});
function el(){return new Proxy({style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},children:[],width:800,height:600,textContent:'',value:'',getContext:()=>ctx,getBoundingClientRect:()=>({width:800,height:600,left:0,top:0}),querySelectorAll:()=>[],appendChild:noop,querySelector:()=>el(),setAttribute:noop,addEventListener:noop},{get:(o,k)=>k in o?o[k]:noop});}
const elements=new Map();const storage=new Map();class Image{constructor(){this.width=1024;this.height=1024;this.complete=true;}decode(){return Promise.resolve()}set src(s){this._src=s;if(Image.active&&this.onload)queueMicrotask(()=>this.onload());}get src(){return this._src}}
const c=vm.createContext({console,performance,Image,Audio:class {play(){return Promise.resolve()}pause(){}addEventListener(){}},URL,Blob,Response,DecompressionStream,TextDecoder,TextEncoder,Uint8Array,Uint8ClampedArray,Uint16Array,Float32Array,ArrayBuffer,DataView,crypto:require('crypto').webcrypto,atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),setTimeout:()=>0,clearTimeout:noop,setInterval:()=>0,clearInterval:noop,requestAnimationFrame:()=>0,cancelAnimationFrame:noop,devicePixelRatio:1,innerWidth:800,innerHeight:600,navigator:{},location:{hash:'',search:'',href:'http://localhost/'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null,setItem:noop,removeItem:noop},document:{getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},createElement:()=>el(),querySelectorAll:()=>[],querySelector:()=>el(),addEventListener:noop,documentElement:el(),body:el()},addEventListener:noop,fetch:async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+path.split('?')[0],'utf8'))})});c.window=c;c.self=c;
const run=s=>vm.runInContext(s,c);
const paths=[...fs.readFileSync(root+'index.html','utf8').matchAll(/<script\b[^>]*\bsrc="([^"?#]+)/g)].map(m=>m[1]);
for(const path of paths){try{vm.runInContext(fs.readFileSync(root+path,'utf8'),c,{filename:path});}catch(e){console.error('LOAD',path,e);process.exit(1)}}
(async()=>{await run('inflateWorld()');Image.active=true;await run('buildHouseFurnitureLayers()');await run('loadPublishedEditorLayouts()');
run(`mode='play';camFree=false;let profile=[];
for(const name of ['saveEditorDraft','editorPrepareMap','restoreOverworld','realizeFeatures','spawnFoes','applyActorLayout','prepareEditorEntities','buildGround','rebuildSolid','placeBirds']){
 const original=eval(name);eval(name+' = function(...args){const t=performance.now();const out=original(...args);profile.push({name:"'+name+'",ms:performance.now()-t,result:typeof out==="boolean"?out:undefined});return out;}');
}
let worldVisits=0;
for(const [id,fresh] of [[W.start,false],['world',true],[W.start,true],['world',false],['house22',false],['world',false]]){
 const t=performance.now();loadMap(id,fresh);
 if(id==='world'){
  if(worldVisits++){
   if(!profile.some(p=>p.name==='restoreOverworld'&&p.result===true))throw Error('Published overworld was not retained');
   if(profile.some(p=>['realizeFeatures','rebuildSolid','buildGround'].includes(p.name)))throw Error('Return rebuilt the overworld');
  }
  console.log('Published world visit '+worldVisits+': '+(performance.now()-t).toFixed(1)+' ms');
 }
 profile=[];
}
console.log('PASS: current published Build layout applies, repeated interior exits retain the complete overworld, without terrain/collision rebuilding.');
`);
})().catch(e=>{console.error(e);process.exit(1)});
