/* Executes the maintained game with inert browser APIs. No rendering, timers or network. */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {webcrypto} from 'node:crypto';
import {performance} from 'node:perf_hooks';
export async function loadEditorGame(directory=process.cwd(),logger=console){
const root=path.resolve(directory)+'/';
const noop=()=>{}; const ctx=new Proxy({measureText:()=>({width:40}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h})},{get:(o,k)=>k in o?o[k]:noop});
function el(){return new Proxy({style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},children:[],width:800,height:600,textContent:'',className:'',value:'',getContext:()=>ctx,getBoundingClientRect:()=>({width:800,height:600,left:0,top:0}),querySelectorAll:()=>[],appendChild:noop,querySelector:()=>el(),setAttribute:noop,addEventListener:noop},{get:(o,k)=>k in o?o[k]:noop});}
const elements=new Map();const storage=new Map();class Image{constructor(){this.width=1024;this.height=1024;this.complete=true;}decode(){return Promise.resolve()}set src(s){this._src=s;if(Image.active&&this.onload)queueMicrotask(()=>this.onload());}get src(){return this._src}}
const c=vm.createContext({console:logger,performance,Image,Audio:class {play(){return Promise.resolve()}pause(){}addEventListener(){}},URL,Blob,Response,DecompressionStream,TextDecoder,TextEncoder,Uint8Array,Uint8ClampedArray,Uint16Array,Float32Array,ArrayBuffer,DataView,crypto:webcrypto,atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),setTimeout:()=>0,clearTimeout:noop,setInterval:()=>0,clearInterval:noop,requestAnimationFrame:()=>0,cancelAnimationFrame:noop,devicePixelRatio:1,innerWidth:800,innerHeight:600,navigator:{},location:{hash:'',search:'',href:'http://localhost/'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null,setItem:noop,removeItem:noop},document:{getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},createElement:()=>el(),querySelectorAll:()=>[],querySelector:()=>el(),addEventListener:noop,documentElement:el(),body:el()},addEventListener:noop,fetch:async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+path.split('?')[0],'utf8'))})});c.window=c;c.self=c;

const run=source=>vm.runInContext(source,c);
const paths=[...fs.readFileSync(root+'index.html','utf8').matchAll(/<script\b[^>]*\bsrc="([^"?#]+)/g)].map(m=>m[1]);
for(const name of paths)vm.runInContext(fs.readFileSync(root+name,'utf8'),c,{filename:name});
await run('inflateWorld()');Image.active=true;await run('buildHouseFurnitureLayers()');
return {context:c,run};
}
