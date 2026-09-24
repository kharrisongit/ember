import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const part1=read('js/generated/game-part-1.js'),game=read('js/generated/game-part-2.js');
const asset=JSON.parse(part1.match(/\{"name":"ghost_rise"[^\n]*?\}/)[0]);
assert.equal(asset.frames,18);
assert.equal(asset.cols,5);
assert.equal(asset.cellW,96);
assert.equal(asset.cellH,128);
const png=fs.readFileSync(new URL('../'+asset.src.split('?')[0],import.meta.url));
assert.equal(png.readUInt32BE(16),asset.cols*asset.cellW);
assert.equal(png.readUInt32BE(20),4*asset.cellH);

// Exercise the real loader: all four source rows become one atlas strip,
// while existing single-row crops keep their source coordinates.
const assets=[{...asset},{name:'old_crop',w:17,h:25,frames:10,cellW:32,cellH:32,cropX:8,cropY:0}];
const sprites={},pages=[],canvases=[];
class TestImage { set src(value){this.url=value;this.onload();} }
const document={createElement(){
  const calls=[],context={drawImage(...args){calls.push(args);}};
  const canvas={calls,context,getContext(){return context;}};
  canvases.push(canvas);return canvas;
}};
const loader=game.slice(0,game.indexOf('function registerDesertNpcSprites()'));
await new Function('Image','document','DOCK_ORIGINAL_ASSETS','SPR','WALL78_PIECES','registerAtlasPage',
  loader+'\nreturn loadDockOriginalAssets();')(TestImage,document,assets,sprites,[],p=>pages.push(p));
assert.equal(sprites.ghost_rise[4],18);
assert.equal(pages[0].w,96*18);
assert.equal(canvases[0].context.imageSmoothingEnabled,false);
assert.equal(canvases[0].calls.length,18);
for(let f=0;f<18;f++){
  assert.deepEqual(canvases[0].calls[f].slice(1),[(f%5)*96,Math.floor(f/5)*128,96,128,f*96,0,96,128]);
}
for(let f=0;f<10;f++){
  assert.deepEqual(canvases[1].calls[f].slice(1),[f*32+8,0,17,25,f*17,0,17,25]);
}

const chestCode=game.slice(game.indexOf('const CHESTS = ['),game.indexOf('function checkGravePrize()'))+
  game.slice(game.indexOf('function stepChest(dt)'),game.indexOf('let breathT ='));
function harness(map,gift){
  const env={map,gift,SPR:{heartstone_chest:[0,0,19,22,5],ghost_rise:[0,5000,96,128,18],it_hs_test:[0]},
    P:{x:168,y:176},breathHas:{},draws:[],rewards:[],saves:0};
  const api=new Function('env',[
    'const {SPR,P,breathHas}=env;',
    "const TS=16,ctx={},atlasImg={},HS_ICON={lightning:'it_hs_test',ice:'it_hs_test',shadow:'it_hs_test'};",
    'let MAPID=env.map;',
    'const stepLootChestOpening=()=>{},stepDark=()=>{},checkDeepPrize=()=>{},toast=()=>{};',
    'const unlockDragonBreath=gift=>{breathHas[gift]=true;};',
    'const showReveal=(...args)=>env.rewards.push(args),saveGame=()=>env.saves++;',
    'const drawGameImage=(...args)=>env.draws.push(args);',
    chestCode,
    'CHESTS.length=0;CHESTS.push({map:env.map,x:10,y:10,gift:env.gift});',
    'return {open:tryChest,step:stepChest,draw:drawChest,state:()=>chestAnim,',
    'changeMap:m=>{MAPID=m;},claimed:()=>!!chestOpen[env.map]};'
  ].join('\n'))(env);
  return {env,api};
}
for(const [map,gift] of [['tp1_sanctum','lightning'],['ds_sanctum','ice'],['sn_sanctum','shadow']]){
  const {env,api}=harness(map,gift);
  assert(api.open());assert(api.open());
  api.step(.901);
  assert.equal(api.state().phase,'ghost');
  const seen=new Set(),anchors=new Set();
  for(let tick=0;tick<90;tick++){
    assert.equal(env.rewards.length,0,'reward must wait for the full dissolve');
    api.draw();
    const draw=env.draws.at(-1);
    assert.equal(draw[3],5000,'ghost frame must be rendered');
    seen.add(draw[2]/96);anchors.add(draw.slice(6).join(','));
    api.step(1/60);
  }
  assert.deepEqual([...seen],Array.from({length:18},(_,i)=>i));
  assert.equal(anchors.size,1,'the source sheet supplies the rise; its anchor must stay fixed');
  // Floating point accumulation can land just below 1.5 seconds.
  api.step(.001);
  assert.equal(api.state(),null);assert(api.claimed());assert(env.breathHas[gift]);
  assert.equal(env.saves,1);assert.equal(env.rewards.length,1);
  api.open();api.step(1);
  assert.equal(env.rewards.length,1,'repeat input cannot duplicate the reward');
}
const abandoned=harness('tp1_sanctum','lightning');
abandoned.api.open();abandoned.api.step(.901);abandoned.api.changeMap('world');abandoned.api.step(2);
assert.equal(abandoned.api.state(),null);assert.equal(abandoned.env.rewards.length,0);
console.log('PASS: all 18 ghost frames load in order and play before the reward in all three temples; stable anchor, original crop compatibility, no duplicate or remote rewards.');
