import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const p2=read('js/generated/game-part-2.js'),p3=read('js/generated/game-part-3.js');
const section=(text,a,b)=>text.slice(text.indexOf(a),text.indexOf(b,text.indexOf(a)));

// Keep downloads pending to verify concurrency and the furniture/loot dependency.
const started=[],release=new Map();
const pending=name=>()=>{started.push(name);return new Promise(resolve=>release.set(name,resolve));};
const names=['prepareJourneyArt','prepareMillwoodInteriors','prepareHouseLoot','prepareExpandedFirstTemple',
  'prepareExpandedSandspireTemple','prepareExpandedHollybeckTemple','prepareExpandedMountainPassage'];
const c=vm.createContext(Object.fromEntries(names.map(n=>[n,pending(n)])));
for(const name of ['DesertPyramid','Frosthorn','IceMoth'])c[name]={prepare:pending(name)};
vm.runInContext(section(p2,'async function buildHouseFurnitureLayers()','/* === end household furniture layering'),c);
let complete=false;const preparation=vm.runInContext('buildHouseFurnitureLayers()',c).then(()=>complete=true);
assert.equal(started.length,8,'Independent area requests start without serial network waits');
assert(!started.includes('prepareMillwoodInteriors')&&!started.includes('prepareHouseLoot'));
release.get('prepareJourneyArt')();await Promise.resolve();await Promise.resolve();
assert(started.includes('prepareMillwoodInteriors'));assert(!started.includes('prepareHouseLoot'));
release.get('prepareMillwoodInteriors')();
for(let i=0;i<5;i++)await Promise.resolve();
assert(started.includes('prepareHouseLoot'),'Chests are prepared after furniture');
for(const [name,resolve]of release)if(name!=='IceMoth')resolve();
for(let i=0;i<5;i++)await Promise.resolve();
assert(!complete,'Readiness still waits for every asset group');
release.get('IceMoth')();await preparation;assert(complete);

// Run the actual boot callback. loadMap owns collision and ground construction;
// the boot warmer only requests chunks and must not evict them immediately.
const visits=[],delays=[],chunks=[];let ready;
const finished=new Promise(resolve=>ready=resolve);
const bootContext=vm.createContext({console,window:{__firstFrame:true},W:{start:'home',names:[]},
  atlasImg:{width:1024,height:1024},cv:{width:800,height:600},MW:12,MH:12,TS:16,CHUNK:256,
  P:{},objs:[],fobjs:[],MAPID:'',MD:null,
  buildSkinTones(){},resize(){},frame(){},requestAnimationFrame(){},bootBind(){},
  buildHouseFurnitureLayers:async()=>{},loadAnimalSprites:async()=>{},loadPublishedEditorLayouts:async()=>{},
  loadMap(id){visits.push(id);bootContext.MAPID=id;bootContext.MD={spawn:[32,48],doors:id==='home'?[{to:'world',tx:10,ty:10}]:[]};},
  buildGround(){assert.fail('Boot must not repeat ground construction');},rebuildSolid(){assert.fail('Boot must not repeat collision construction');},
  getChunk:(x,y)=>chunks.push([x,y]),
  BOOT:{step(){},to(){assert.fail('No artificial startup wait');},ready},
  setTimeout(fn,ms){delays.push(ms);queueMicrotask(fn);}
});
vm.runInContext(section(p3,'atlasImg.onload = async () => {','atlasImg.onerror ='),bootContext);
await bootContext.atlasImg.onload();await finished;
assert.deepEqual(visits,['home','world','home']);assert.equal(chunks.length,18);
assert(delays.every(ms=>ms<=24||ms===20000),'Only paint yields and diagnostic timeout remain');

// Cached images can finish before the later classic boss/NPC scripts arrive.
let scriptsLoaded,downloadsStarted=false,bootStarted=false;
const barrier=vm.createContext({document:{readyState:'loading',addEventListener(event,resolve){assert.equal(event,'DOMContentLoaded');scriptsLoaded=resolve;}},
  loadAtlasPages:async()=>{downloadsStarted=true;},atlasImg:{onload(){bootStarted=true;},onerror(error){throw error;}}});
vm.runInContext(section(p3,'const gameScriptsReady =','window.__H ='),barrier);
for(let i=0;i<5;i++)await Promise.resolve();
assert(downloadsStarted&&!bootStarted,'Downloads overlap scripts without entering the incomplete game');
scriptsLoaded();for(let i=0;i<5;i++)await Promise.resolve();assert(bootStarted);

const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{style:{}});return nodes.get(id);};
const progress=vm.createContext({document:{getElementById:node},setInterval(){assert.fail('Progress must not run a decorative timer');}});
vm.runInContext(section(p3,'const BOOT = {','function bootBind()'),progress);
vm.runInContext('BOOT.step(45,"world");BOOT.step(12,"older stage");',progress);
assert.equal(node('bootFill').style.width,'45.0%','Progress paints real milestones and never moves backwards');

const requests=[];
const layouts=vm.createContext({fetch:async(...args)=>{requests.push(args);return {ok:true,json:async()=>({schema:1,maps:{},applied:[]})};}});
vm.runInContext(section(read('js/published-editor-layouts.js'),'let publishedEditorLayouts','function applyPublishedEditorLayout'),layouts);
await vm.runInContext('loadPublishedEditorLayouts();',layouts);
assert.equal(requests[0][0],'assets/editor-layouts.json');assert.equal(requests[0][1].cache,'no-cache');
const audio=read('index.html').match(/<audio\b[^>]*>/g);
assert(audio.every(tag=>tag.includes('preload="'+(tag.includes('lastDragonriderTitleBgm')?'auto':'none')+'"')),
  'Only title music competes with initial game downloads');
console.log('PASS: concurrent startup, ordered furniture/chests, all-assets readiness, real progress, no redundant world rebuilds or timed waits, fresh cacheable layouts, and on-demand area music.');
