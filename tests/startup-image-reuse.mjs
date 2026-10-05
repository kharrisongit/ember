import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const requests=[],pages=[],reports=[];let active=0,peak=0,fail=false;
class Image {
  naturalWidth=16;naturalHeight=16;
  set src(url){
    this.url=url;if(!url)return;
    requests.push(url);peak=Math.max(peak,++active);
    setImmediate(()=>{active--;if(fail)this.onerror?.();else this.onload?.();});
  }
}
const c=vm.createContext({Image,setTimeout,clearTimeout,console,
  ATLAS_PAGES:['a','a','b','c','b','c'].map((src,i)=>[i*1024,0,16,16,src]),
  ATLAS_PATCHES:[[0,0,16,16,'patch']],MOUNTED_KEY_Y:new Set(),
  KNIGHT_STORY_SRC:'knight',knightStoryImg:null,
  registerAtlasPage:p=>pages.push(p),report:(done,total)=>reports.push([done,total])});
const run=code=>vm.runInContext(code,c);
run(read('js/startup-assets.js'));
for(const name of ['prepareGreenScene','loadDesertNpcAssets','loadDockOriginalAssets','loadRoyalAssets','loadInventoryIcons','loadWorkshopCraftsmen'])c[name]=async()=>{};
const game=read('js/generated/game-part-2.js');
run(game.slice(game.indexOf('async function loadAtlasPages('),game.indexOf('const stageEl =')));
await run('loadAtlasPages(report)');
assert.equal(requests.length,5,'Six virtual pages need only three source images, plus knight and patch');
assert.equal(pages.length,7,'Every virtual page and final patch still registers');
assert.equal(pages.find(p=>p.x===0).img,pages.find(p=>p.x===1024).img);
assert.equal(pages.at(-1).img.url,'patch','Patches retain final priority');
assert.deepEqual(reports.at(-1),[14,14]);
assert(peak<=3);

// An alias must never silently substitute changed artwork. Keep the original
// files for editing and verify each alias against their exact bytes.
const aliases=run('STARTUP_ROOM_ALIASES'),all=[];
for(const area of ['first-temple','sandspire-temple','hollybeck-temple','mountain-passage'])
  for(const id of Object.keys(JSON.parse(read('assets/interiors/'+area+'/layout.json'))))all.push('assets/interiors/'+area+'/'+id+'.png');
for(const [alias,canonical]of Object.entries(aliases))assert.deepEqual(fs.readFileSync(alias),fs.readFileSync(canonical),alias+' must be regenerated or unaliased if edited');
const unique=new Set(all.map(path=>aliases[path]||path));
assert.equal(all.length,55);assert.equal(unique.size,30);
const before=requests.length;
const rooms=await Promise.all(all.map(path=>c.loadStartupImage(path+'?v=test')));
assert.equal(requests.length-before,30,'All 55 room requests load only 30 images');
assert.equal(new Set(rooms).size,30);
assert(peak<=3,'Room reuse keeps the Android request bound');
const bytes=path=>{const p=fs.readFileSync(path);return p.readUInt32BE(16)*p.readUInt32BE(20)*4;};
const saved=all.reduce((n,p)=>n+bytes(p),0)-[...unique].reduce((n,p)=>n+bytes(p),0);

// A failed request is evicted, so returning to the same room can recover.
fail=true;const room='assets/interiors/hollybeck-temple/sn1.png?v=failed';
await assert.rejects(c.loadStartupImage(room),/after 3 attempts/);
fail=false;assert(await c.loadStartupImage(room));
assert.equal(active,0);
console.log('PASS: duplicate sprite pages share images, patches/progress preserved, 55 room backgrounds use 30 images, '+(saved/1048576).toFixed(1)+' MiB less raw room pixel storage, failed cache entries recover.');
