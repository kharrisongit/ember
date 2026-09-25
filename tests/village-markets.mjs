import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';import zlib from 'node:zlib';
const root=new URL('../',import.meta.url).pathname;const read=p=>fs.readFileSync(root+p,'utf8');
const source=read('js/generated/game-part-1.js'),code=read('js/generated/game-part-2.js');const unpack=n=>JSON.parse(zlib.gunzipSync(Buffer.from(source.match(new RegExp('const '+n+'_GZ = "([^"]+)'))[1],'base64')));
const W=unpack('W'),SPR=unpack('ATLAS').sprites;const c=vm.createContext({W,SPR,atob:s=>Buffer.from(s,'base64').toString('binary'),NPC_VOICES:{}});const run=s=>vm.runInContext(s,c);
run(code.slice(code.indexOf('  for (const mid in W.maps) {'),code.indexOf('  installKnightEncounter(); numberAllArenas();')));
for(const [a,b] of [['function arrangeNpcCast()','function applyWorld('],['function dressSandspire()','function individualizeDialogue()'],['function installFishingVillager()','function installFirstTemple()'],['function registerKnightStorySprites()','const SPR_HANDLER'],['function registerDesertNpcSprites()','async function loadDesertNpcAssets()'],['function repairCoralmere()','function npcTalkDistance(']])run(code.slice(code.indexOf(a),code.indexOf(b)));
run('registerKnightStorySprites(); registerDesertNpcSprites(); dressSandspire(); installFishingVillager(); installMarketCounters(); arrangeNpcCast(); repairCoralmere();');
Object.assign(SPR,JSON.parse(read('assets/game-assets.js').match(/window.EMBER_ASSETS.ROYAL_DATA = (.*);/)[1]).sprites);
const start=code.indexOf(' for(const [mapId,name,spr]'),end=code.indexOf('\n}\n',start);run(code.slice(start,end));

const forgewick=JSON.stringify(W.maps.world.roomActors.filter(a=>/^market_/.test(a.spr||'')));
run('prepareVillageStands()');const stands=W.maps.world.marketStands;assert.equal(stands.length,4);
assert.equal(JSON.stringify(W.maps.world.roomActors.filter(a=>/^market_/.test(a.spr||''))),forgewick,'Forgewick stalls unchanged');
for(const stand of stands){
 const n=W.maps.world.npcs.find(n=>n.counter?.x===stand.x&&n.counter?.y===stand.y);assert(n,'merchant belongs to counter');
 assert(n.stationary);assert.equal(n.sy,stand.y-1);assert.equal(n.seatClipY,stand.y-18);
 const s=SPR[n.packSpr+'_idle_d']||SPR[n.packSpr]||SPR['npc_'+n.sk+'_d'];assert(s);
 assert.equal(n.y-s[3],stand.y-40,'face starts below canopy');
 assert.equal(n.talkY,stand.y+14,'merchant reachable from south');
}
console.log('PASS: four larger village stands; all merchants in visible south-facing openings with counter occlusion; Forgewick untouched.');
if(process.env.EMBER_PREVIEW_DATA)fs.writeFileSync(process.env.EMBER_PREVIEW_DATA,JSON.stringify({W,SPR}));

// User-selected legacy looks belong to market vendors only.
run('var TS=16,MD=null,npcs=[],actorLayouts={};');
run(code.slice(code.indexOf('function editorActorInfo('),code.indexOf('function pickEditorActor(')));
const authoredStart=code.indexOf('    const positions={"actor:14:market_weapons_stall"');
run('{const m=W.maps.world;'+code.slice(authoredStart,code.indexOf('    const rashida=',authoredStart))+'}');

run(read('js/market-npcs.js'));
const story=new Map(Object.entries(W.maps).flatMap(([id,m])=>(m.npcs||[]).map(n=>[id+':'+n.n,JSON.stringify([n.d,n.sells])])));
run("for(const [id,m] of Object.entries(W.maps))prepareMarketNpcCast(m,id)");
const vendorOrigins=Object.fromEntries(W.maps.world.npcs.filter(n=>n.marketVendor).map(n=>[n.n,{x:n.x,y:n.y}]));
if(process.env.EMBER_VENDOR_ORIGINS)fs.writeFileSync(process.env.EMBER_VENDOR_ORIGINS,JSON.stringify(vendorOrigins));
for(const [id,m] of Object.entries(W.maps))for(const n of m.npcs||[]){
 assert.equal(JSON.stringify([n.d,n.sells]),story.get(id+':'+n.n),'dialogue and inventory preserved for '+n.n);
 if(n.marketVendor){
  assert.match(n.packSpr,/^npc_(lumberjack_jack|chef_chloe|farmer_buba|miner_mike)_d$/);
  assert(n.stationary&&!n.patrol&&!n.patrolPoints&&!n.goto&&n.counter,'vendor stays at its counter');
 }else assert(!['lumberjack_jack','chef_chloe','farmer_buba','miner_mike'].includes(n.sk),'market appearance outside a stand: '+n.n);
}
assert.equal(W.maps.world.npcs.filter(n=>n.marketVendor).length,9);
for(const stand of stands){const n=W.maps.world.npcs.find(n=>n.counter?.x===stand.x&&n.counter?.y===stand.y);assert(n.y>n.seatClipY,'small legacy sprite feet stay behind counter');assert(n.y-SPR[n.packSpr][3]>=stand.y-40);}
run(read('js/editor-build-data.js'));run(read('js/published-editor-layouts.js'));
c.layout=JSON.parse(read('assets/editor-layouts.json'));
// This isolated fixture has no Build terrain; exercise the vendor layer here.
// The full published Build and its vendors are covered by overworld-published-return.
while(c.layout.maps.world.build)c.layout.maps.world=c.layout.maps.world.build.previous;
for(const name of ['Toft','Prue','Ovid']){
 const op=c.layout.maps.world['actor:npc:'+name],n=W.maps.world.npcs.find(n=>n.n===name);
 assert.deepEqual([op.originX,op.originY],[n.x,n.y],'published vendor anchor matches new role: '+name);
}
run('publishedEditorLayouts=layout;applyPublishedEditorLayout(W.maps.world,"world")');
for(const a of W.maps.world.roomActors.filter(a=>a.interiorNpc)){
 const n=W.maps.world.npcs.find(n=>n.n===a.interiorNpc);if(!n?.marketVendor)continue;
 assert.deepEqual([n.x,n.y],[a.x,a.y+14],n.n+' follows the published stall placement');
 c.a=a;run('MD=W.maps.world;npcs=MD.npcs.map(n=>({...n}));shiftActorData(W.maps.world,a,a.x+16,a.y+8,true)');
 assert.deepEqual([n.x,n.y],[a.x,a.y+14],'dragging a stall carries its vendor');
 assert.deepEqual([n.talkX,n.talkY],[a.x,a.y+28]);assert.deepEqual([n.counter.x,n.counter.y],[a.x,a.y+8]);
 const live=c.npcs.find(v=>v.n===n.n);assert.deepEqual([live.counter.x,live.counter.y],[n.counter.x,n.counter.y],'live counter shifts once');
}
console.log('PASS: the four chosen appearances serve all nine market stands, with published placements, linked movement, working counters and no use elsewhere in the cast.');
