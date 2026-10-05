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
const areaProgress=[];c.report=(done,total,left)=>areaProgress.push({done,total,left:Array.from(left)});
for(const name of ['DesertPyramid','DragonChapels','CoralmereLighthouse','Frosthorn','IceMoth'])c[name]={prepare:pending(name)};
vm.runInContext(section(p2,'async function buildHouseFurnitureLayers(','/* === end household furniture layering'),c);
let complete=false;const preparation=vm.runInContext('buildHouseFurnitureLayers(report)',c).then(()=>complete=true);
assert.equal(started.length,10,'Independent area requests start without serial network waits');
assert.equal(areaProgress[0].total,10);assert.equal(areaProgress[0].done,0);
assert(!started.includes('prepareMillwoodInteriors')&&!started.includes('prepareHouseLoot'));
release.get('prepareJourneyArt')();await new Promise(setImmediate);
assert(started.includes('prepareMillwoodInteriors'));assert(!started.includes('prepareHouseLoot'));
assert(areaProgress.at(-1).left.includes('House furniture'),'The label identifies the current household stage');
release.get('prepareMillwoodInteriors')();
for(let i=0;i<5;i++)await Promise.resolve();
assert(started.includes('prepareHouseLoot'),'Chests are prepared after furniture');
for(const [name,resolve]of release)if(name!=='IceMoth')resolve();
for(let i=0;i<5;i++)await Promise.resolve();
assert(!complete,'Readiness still waits for every asset group');
assert.deepEqual(areaProgress.at(-1),{done:9,total:10,left:['Ice Moth artwork']},'A slow remaining asset is named explicitly');
release.get('IceMoth')();await preparation;assert(complete);
assert.deepEqual(areaProgress.at(-1),{done:10,total:10,left:[]});

// Atlas progress counts registered pages and finished groups, while preserving
// the three-worker decode bound and deterministic patch ordering.
const images=[],registered=[],atlasReports=[],extraLoads=new Map();
const atlasContext=vm.createContext({console,
  Image:class{set src(value){this.url=value;images.push(this);}},
  ATLAS_PAGES:Array.from({length:4},(_,i)=>[i,0,16,16,'page'+i]),
  ATLAS_PATCHES:[[0,0,16,16,'patch']],MOUNTED_KEY_Y:new Set(),
  registerAtlasPage:p=>registered.push(p.img.url),knightStoryImg:null,KNIGHT_STORY_SRC:"knight",setTimeout,clearTimeout,
  report:(done,total,label)=>atlasReports.push({done,total,label})
});
for(const name of ['prepareGreenScene','loadDesertNpcAssets','loadDockOriginalAssets','loadRoyalAssets','loadInventoryIcons','loadWorkshopCraftsmen'])
  atlasContext[name]=()=>new Promise(resolve=>extraLoads.set(name,resolve));
vm.runInContext(read('js/startup-assets.js'),atlasContext);
vm.runInContext(section(p2,'async function loadAtlasPages(','const stageEl ='),atlasContext);
let atlasComplete=false;const atlasLoad=vm.runInContext('loadAtlasPages(report)',atlasContext).then(()=>atlasComplete=true);
assert.equal(images.length,3);images[0].onload();await new Promise(setImmediate);
assert.equal(images.length,4,'A free worker starts the next page');
for(const image of images.slice(1))image.onload();await new Promise(setImmediate);
assert.equal(images.at(-1).url,'knight');images.at(-1).onload();await new Promise(setImmediate);
assert.equal(images.at(-1).url,'patch');assert.equal(registered.length,4);
images.at(-1).onload();await new Promise(setImmediate);
assert.equal(extraLoads.size,6,'Independent artwork groups still load together');
for(const [name,resolve]of extraLoads)if(name!=='loadWorkshopCraftsmen')resolve();
await new Promise(setImmediate);assert(!atlasComplete);
assert.equal(atlasReports.at(-1).done,11);assert.equal(atlasReports.at(-1).total,12);
assert.match(atlasReports.at(-1).label,/Workshop villagers/);
extraLoads.get('loadWorkshopCraftsmen')();await atlasLoad;
assert.equal(atlasReports.at(-1).done,12);assert.equal(registered.at(-1),'patch');

// Run the actual boot callback. loadMap owns collision and ground construction;
// the boot warmer only requests chunks and must not evict them immediately.
const visits=[],delays=[],chunks=[];let ready,paletteReady=false;
const finished=new Promise(resolve=>ready=resolve);
const bootContext=vm.createContext({console,window:{__firstFrame:true},W:{start:'home',names:[]},
  atlasImg:{width:1024,height:1024},cv:{width:800,height:600},MW:12,MH:12,TS:16,CHUNK:256,
  P:{},objs:[],fobjs:[],MAPID:'',MD:null,
  prepareShroomClusterPalette:async()=>{await Promise.resolve();paletteReady=true;},
  buildSkinTones(){assert(paletteReady,'Decode the recolored static images before gameplay setup');},resize(){},frame(){},requestAnimationFrame(){assert.equal(visits.length,3,'The frame loop starts only after all staged maps finish');},bootBind(){},
  buildHouseFurnitureLayers:async()=>{},loadAnimalSprites:async()=>{},loadPublishedEditorLayouts:async()=>{},
  loadMap(id){visits.push(id);bootContext.MAPID=id;bootContext.MD={spawn:[32,48],doors:id==='home'?[{to:'world',tx:10,ty:10}]:[]};},
  buildGround(){assert.fail('Boot must not repeat ground construction');},rebuildSolid(){assert.fail('Boot must not repeat collision construction');},
  getChunk:(x,y)=>chunks.push([x,y]),
  BOOT:{step(){},map:async id=>bootContext.loadMap(id),fail:error=>{throw error;},to(){assert.fail('No artificial startup wait');},ready},
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

const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{style:{},setAttribute(){}});return nodes.get(id);};
const progress=vm.createContext({performance:{now:()=>0},document:{getElementById:node},setInterval(){assert.fail('Progress must not run a decorative timer');}});
vm.runInContext(section(p3,'const BOOT = {','function bootBind()'),progress);
vm.runInContext('BOOT.step(45,"world");BOOT.step(12,"older stage");',progress);
assert.equal(node('bootFill').style.width,'45.0%','Progress paints real milestones and never moves backwards');
assert.equal(node('bootPercent').textContent,'45%');
assert.equal(node('bootMsg').textContent,'world','Late reports must not replace the current stage');

const requests=[];
const layouts=vm.createContext({fetch:async(...args)=>{requests.push(args);return {ok:true,json:async()=>({schema:1,maps:{},applied:[]})};}});
vm.runInContext(section(read('js/published-editor-layouts.js'),'let publishedEditorLayouts','function applyPublishedEditorLayout'),layouts);
await vm.runInContext('loadPublishedEditorLayouts();',layouts);
assert.equal(requests[0][0],'assets/editor-layouts.json');assert.equal(requests[0][1].cache,'no-cache');
const audio=read('index.html').match(/<audio\b[^>]*>/g);
assert(audio.every(tag=>tag.includes('preload="'+(tag.includes('lastDragonriderTitleBgm')?'auto':'none')+'"')),
  'Only title music competes with initial game downloads');
console.log('PASS: concurrent startup, ordered furniture/chests, all-assets readiness, real progress, no redundant world rebuilds or timed waits, fresh cacheable layouts, and on-demand area music.');
