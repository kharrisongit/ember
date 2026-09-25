/* Runs all maintained game scripts and published layouts; only browser APIs,
   rendering and timers are stubbed. Map generation and editor loading are real. */
const fs=require('fs'),vm=require('vm'),{performance}=require('perf_hooks');
const root=require('path').resolve(__dirname,'..')+'/';

const noop=()=>{}; const ctx=new Proxy({measureText:()=>({width:40}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h})},{get:(o,k)=>k in o?o[k]:noop});
function el(){return new Proxy({style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},children:[],width:800,height:600,textContent:'',value:'',getContext:()=>ctx,getBoundingClientRect:()=>({width:800,height:600,left:0,top:0}),querySelectorAll:()=>[],appendChild:noop,querySelector:()=>el(),setAttribute:noop,addEventListener:noop},{get:(o,k)=>k in o?o[k]:noop});}
const elements=new Map();const storage=new Map();class Image{constructor(){this.width=1024;this.height=1024;this.complete=true;}decode(){return Promise.resolve()}set src(s){this._src=s;if(Image.active&&this.onload)queueMicrotask(()=>this.onload());}get src(){return this._src}}
const c=vm.createContext({console,performance,Image,Audio:class {play(){return Promise.resolve()}pause(){}addEventListener(){}},URL,Blob,Response,DecompressionStream,TextDecoder,TextEncoder,Uint8Array,Uint8ClampedArray,Uint16Array,Float32Array,ArrayBuffer,DataView,crypto:require('crypto').webcrypto,atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),setTimeout:()=>0,clearTimeout:noop,setInterval:()=>0,clearInterval:noop,requestAnimationFrame:()=>0,cancelAnimationFrame:noop,devicePixelRatio:1,innerWidth:800,innerHeight:600,navigator:{},location:{hash:'',search:'',href:'http://localhost/'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null,setItem:noop,removeItem:noop},document:{getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},createElement:()=>el(),querySelectorAll:()=>[],querySelector:()=>el(),addEventListener:noop,documentElement:el(),body:el()},addEventListener:noop,fetch:async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+path.split('?')[0],'utf8'))})});c.window=c;c.self=c;
c.assert=require('node:assert/strict');
const run=s=>vm.runInContext(s,c);
const paths=[...fs.readFileSync(root+'index.html','utf8').matchAll(/<script\b[^>]*\bsrc="([^"?#]+)/g)].map(m=>m[1]);
for(const path of paths){try{vm.runInContext(fs.readFileSync(root+path,'utf8'),c,{filename:path});}catch(e){console.error('LOAD',path,e);process.exit(1)}}
(async()=>{await run('inflateWorld()');Image.active=true;await run('buildHouseFurnitureLayers()');await run('loadPublishedEditorLayouts()');

c.thornwellRoads=JSON.parse(fs.readFileSync(root+'tests/fixtures/thornwell-road-recovery.json','utf8'));
c.graveyardPatch=JSON.parse(fs.readFileSync(root+'tests/fixtures/hollybeck-cleanup.json','utf8'));
c.winterPatch=JSON.parse(fs.readFileSync(root+'tests/fixtures/winter-hunting-patch.json','utf8'));
c.recoveredDraft=JSON.parse(fs.readFileSync(root+'tests/fixtures/recovered-editor-draft.json','utf8'));
run(`mode='play';camFree=false;let profile=[];
for(const name of ['saveEditorDraft','editorPrepareMap','restoreOverworld','realizeFeatures','spawnFoes','applyActorLayout','prepareEditorEntities','buildGround','rebuildSolid','placeBirds']){
 const original=eval(name);eval(name+' = function(...args){const t=performance.now();const out=original(...args);profile.push({name:"'+name+'",ms:performance.now()-t,result:typeof out==="boolean"?out:undefined});return out;}');
}
let worldVisits=0;
for(const [id,fresh] of [[W.start,false],['world',true],[W.start,true],['world',false],['house22',false],['world',false]]){
 const t=performance.now();loadMap(id,fresh);
 if(id==='house22'){
  const mad=npcs.find(n=>n.n==='Elder Maddock');assert(!mad.seatSpr&&!mad.seatClipY);assert.equal(mad.f,'u');assert.equal(mad.x,128);assert.equal(mad.y,100);
  assert(MD.roomActors.some(a=>a.editKey==='maddock:dragon-painting'),'Dragon picture present');
 }
 if(id==='world'){
  // Check authored coordinates after the real Build, move and map-loading paths.
  const layout=publishedEditorLayouts.maps.world;
  for(const patch of layout.build.changes){
   if(patch.path[0]!=='objs'||!('value' in patch))continue;
   let value=MD;for(const key of patch.path)value=value[key];
   assert.equal(value,patch.value,'Exact submitted object coordinate '+patch.path.join('.'));
  }
  for(const op of Object.values(layout).filter(op=>op.kind==='object-add')){
   assert(MD.objs.some((v,i)=>i%3===0&&v===op.sprite&&MD.objs[i+1]===op.x&&MD.objs[i+2]===op.y),'Exact submitted tree placement '+op.key);
  }
  for(const patch of layout.build.changes.filter(p=>p.path[0]==='features')){
   if('value' in patch){let v=MD;for(const k of patch.path)v=v[k];assert.equal(JSON.stringify(v),JSON.stringify(patch.value),'Exact submitted route/arena geometry');}
  }
  assert(publishedEditorLayouts.applied.includes(recoveredDraft.id),'Failed draft recovery receipt');
  for(const op of recoveredDraft.operations){
   assert.equal(JSON.stringify(MD.scatter.slice(op.index,op.index+3)),JSON.stringify([op.sprite,op.fromX,op.fromY]),'Recovered scenery identity');
   assert(MD.editorDeletedDecor.includes(op.key),'Recovered deletion '+op.key);
  }
  for(const expected of winterPatch.features){
   const actual=MD.features.find(f=>f.id===expected.id);
   assert.equal(JSON.stringify(actual),JSON.stringify(expected),'Exact supplied feature '+expected.id);
   if(expected.kind==='arena'){
    assert.equal(foes.filter(f=>f.huntingArena?.id===expected.id).length,3,'Animals in supplied arena '+expected.id);
    if(expected.style==='winter'){
     let checked=0;
     for(let y=expected.y-6;y<=expected.y+6;y++)for(let x=expected.x-6;x<=expected.x+6;x++){
      if(Math.hypot(x-expected.x,y-expected.y)>expected.r+.5)continue;
      const tile=terr[y*MW+x];if(tile===WATER||tile===BRIDGE)continue;
      assert.equal(tile,DIRT,'Winter clearing '+expected.id+' at '+x+','+y);checked++;
     }
     assert(checked>100,'Full winter ground circle');
    }
   }
  }
  const fixtureObjects=MD.objs.slice();
  for(const op of Object.values(layout).filter(op=>op.kind==='object')){
   assert.equal(MD.objs[Number(op.key)*3+1],op.x,'Latest submitted object X');
   assert.equal(MD.objs[Number(op.key)*3+2],op.y,'Latest submitted object Y');
   fixtureObjects[Number(op.key)*3+1]=op.originX;fixtureObjects[Number(op.key)*3+2]=op.originY;
  }
  assert.equal(EmberBuildData.hash(fixtureObjects),winterPatch.objectsHash,'Prior object placements preserved beneath latest moves');
  for(const moved of winterPatch.moves){
   const o=objs.find(o=>o.id===moved.id);assert(o,'Moved object exists');
   assert.equal(JSON.stringify([o.x,o.y]),JSON.stringify([moved.x,moved.y]),'Exact live object move '+moved.id);
  }
  for(const g of graveyardPatch.graves){assert.equal(MD.objs[g.id*3+1],g.x);assert.equal(MD.objs[g.id*3+2],g.y);}
  assert(publishedEditorLayouts.applied.includes(thornwellRoads.id),'Recovered road submission receipt');
  for(const op of thornwellRoads.operations){
   if(op.kind==='paint')for(let j=0;j<op.values.length;j++)assert.equal(terr[op.start+j],op.values[j],'Exact recovered road tile '+(op.start+j));
   if(op.kind==='object'){const o=objs.find(o=>o.id===Number(op.key));assert.equal(o.x,op.x);assert.equal(o.y,op.y);}
   if(op.kind==='actor'){const n=npcs.find(n=>n.n===op.identity);assert.equal(n.x,op.x);assert.equal(n.y,op.y);}
  }
  const villageStalls=objs.filter(o=>/^stall[123]$/.test(NAMES[o.s]||''));
  assert.equal(villageStalls.length,4);
  for(const o of villageStalls)assert(isVillageMarketStand(o),'Published stand uses enlarged layered rendering');
  const grave=features.find(f=>f.id===207),spur=features.find(f=>f.id===80);
  assert.equal(spur.pts.at(-1)[0],grave.x,'Graveyard entry is centered');
  assert.equal(features.find(f=>f.id===81).kind,'landmark','No square clearing over the circle');
  for(const name of ['Bregga','Sigrun','Torvald'])assert(!npcs.some(n=>n.n===name&&npcHere(n)),'Recovered cast removal '+name);
  const expectedArenas=[[9150,168,67,'hare'],[9152,333,204,'hare'],[9154,453,162,'boar'],[9156,587,262,'boar'],[9159,813,281,'boar']];
  for(const [id,x,y,encounter] of expectedArenas){
   const arena=MD.features.find(f=>f.id===id);
   assert(arena,'Missing published arena '+id);
   assert.equal(JSON.stringify([arena.x,arena.y,arena.encounter]),JSON.stringify([x,y,encounter]));
   assert.equal(foes.filter(f=>f.huntingArena?.id===id).length,3,'Animals in arena '+id);
  }
  for(const a of MD.roomActors.filter(a=>a.interiorNpc)){
   const n=MD.npcs.find(n=>n.n===a.interiorNpc);if(!n?.marketVendor)continue;
   assert.equal(JSON.stringify([n.x,n.y]),JSON.stringify([a.x,a.y-30]),n.n+' follows published stall');
  }
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
