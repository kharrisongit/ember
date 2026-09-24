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
