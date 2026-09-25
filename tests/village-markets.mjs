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

c.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
run(read('js/market-npcs.js'));
const sandspireStock=W.maps.world.npcs.find(n=>n.n==='Jamila').sells;
const story=new Map(Object.entries(W.maps).flatMap(([id,m])=>(m.npcs||[]).map(n=>[id+':'+n.n,JSON.stringify([n.d,n.sells])])));
run("for(const [id,m] of Object.entries(W.maps))prepareMarketNpcCast(m,id)");
const vendorOrigins=Object.fromEntries(W.maps.world.npcs.filter(n=>n.marketVendor).map(n=>[n.n,{x:n.x,y:n.y}]));
if(process.env.EMBER_VENDOR_ORIGINS)fs.writeFileSync(process.env.EMBER_VENDOR_ORIGINS,JSON.stringify(vendorOrigins));
for(const [id,m] of Object.entries(W.maps))for(const n of m.npcs||[]){
 if(id==='world'&&['Idris','Jamila'].includes(n.n)){
  assert.equal(JSON.stringify(n.d),JSON.stringify(JSON.parse(story.get(id+':'+n.n))[0]),'Sandspire dialogue preserved');
  assert.equal(n.sells,n.n==='Idris'?sandspireStock:undefined,'Sandspire shop role transferred to pharaoh');
 }else assert.equal(JSON.stringify([n.d,n.sells]),story.get(id+':'+n.n),'dialogue and inventory preserved for '+n.n);
 if(n.marketVendor){
  assert.match(n.packSpr,/^(npc_(chef_chloe|farmer_buba|miner_mike)_d|npc_pharaoh_idle|market_citizen[1-5]_idle_d)$/);
  assert.equal(n.idleFrame,undefined,'vendor idle animation is not frozen');
  assert(SPR[n.packSpr][4]>1,'vendor has animated frames');
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
const wanted={Wren:'npc_farmer_buba_d',Astrid:'npc_chef_chloe_d',Toft:'npc_miner_mike_d',Idris:'npc_pharaoh_idle'};
for(const [name,sprite]of Object.entries(wanted))assert.equal(W.maps.world.npcs.find(n=>n.n===name).packSpr,sprite,name+' requested market role');
const keeper=W.maps.inn.npcs.find(n=>n.n==='Maren');assert.equal(keeper.packSpr,'npc_lumberjack_jack_d');assert.equal(keeper.seatClipY,112);assert.equal(keeper.y,114);assert.equal(keeper.talkY,147);
for(const skin of ['farmer_buba','chef_chloe','miner_mike','lumberjack_jack']){
 const users=Object.values(W.maps).flatMap(m=>m.npcs).filter(n=>!n.devLineup&&n.packSpr==='npc_'+skin+'_d');
 assert.equal(users.length,1,skin+' is reserved for one requested role');
}
// Execute the renderer's actual idle-frame selection at two times.
const frameStart=code.indexOf("        let fr = action==='idle'"),frameEnd=code.indexOf('        if(/^villager_seated_',frameStart);
for(const n of [...W.maps.world.npcs.filter(n=>n.marketVendor),keeper]){
 Object.assign(c,{o:n,sp:SPR[n.packSpr],action:'idle',t:0});run('{'+code.slice(frameStart,frameEnd)+'selectedFrame=fr;}');const first=c.selectedFrame;
 c.t=.4;run('{'+code.slice(frameStart,frameEnd)+'selectedFrame=fr;}');assert.notEqual(c.selectedFrame,first,n.n+' idle frames advance');
}
console.log('PASS: requested market/inn appearances, pharaoh shop transfer, unique selected skins, animated idles, published placements and linked counters.');

const reserved= /^(?:npc_(?:farmer_buba|chef_chloe|miner_mike|lumberjack_jack|pharaoh)_(?:d|idle)|market_citizen[1-5](?:_idle_d)?)$/;
for(const m of Object.values(W.maps))for(const n of m.npcs||[]){if(n.devLineup||n.editorDeleted)continue;const visible=n.seatSpr||n.packSpr||(n.sk?'npc_'+n.sk+'_d':'');if(reserved.test(visible))assert(n.serviceAppearance,'Market appearance used outside its role: '+n.n);}

// Dragging a stand must leave its merchant in place, including after publication.
Object.assign(c,{MAPID:'world',PXW:60000,PXH:10000,scheduleEditorDraft(){},rebuildSolid(){},mapDirty:false});
c.a=W.maps.world.roomActors.find(a=>a.spr==='market_weapons_stall');
const merchant=W.maps.world.npcs.find(n=>n.n===c.a.interiorNpc),position=[merchant.x,merchant.y];
run('moveEditorActor(a,a.x+120,a.y+30,true)');
assert.deepEqual([merchant.x,merchant.y],position,'stand can move independently');
const key=c.a.editKey||'actor:'+W.maps.world.roomActors.indexOf(c.a)+':'+c.a.spr;
assert.equal(c.actorLayouts.world[key].independent,true);
const {applyMoves}=await import('../tools/apply-editor-moves.mjs');
const op={kind:'actor',key,identity:c.a.spr,fromX:c.a.x,fromY:c.a.y,x:c.a.x+80,y:c.a.y,independent:true};
c.independentLayout=applyMoves({schema:1,applied:[],maps:{}},{schema:1,id:'bfc0c944-e791-42a0-9331-9a52eb97c5ff',map:'world',sourceRevision:'test',operations:[op]},'test');
run('publishedEditorMaps.delete(W.maps.world);publishedEditorLayouts=independentLayout;applyPublishedEditorLayout(W.maps.world,"world")');
assert.equal(c.a.x,op.x);assert.deepEqual([merchant.x,merchant.y],position,'published stand move preserves merchant');

// Actual NPC drawing must submit the entire sprite with no permanent clipping.
let clips=0,drawn;
Object.assign(c,{ctx:{save(){},restore(){},beginPath(){},rect(){},clip(){clips++;}},scene:null,bossScene:null,hatchExit:false,drawGameImage(...args){drawn=args;},houseSeatedSheet:null});
run(code.slice(code.indexOf('function drawNpcFrame('),code.indexOf('function millwoodSpriteFamily(')));
c.vendor={...merchant,seatClipY:merchant.y-18};c.sprite=SPR[merchant.packSpr];
run('drawNpcFrame(vendor,sprite,0,{})');
assert.equal(clips,0);assert.equal(drawn[5],c.sprite[3],'complete source height');assert.equal(drawn[9],c.sprite[3],'complete rendered height');
c.vendor={...merchant,x:100,y:100};c.front={marketActorFront:{spr:'market_weapons_stall',x:100,y:130}};
assert.equal(run('marketVendorDepth(vendor,[front])'),129.5,'merchant is behind actual counter');
c.front.marketActorFront.x=400;assert.equal(run('marketVendorDepth(vendor,[front])'),100,'moving stand away restores normal depth');
console.log('PASS: independent stand movement survives publication; whole merchant sprites remain visible when counters move away.');

// Draw a stand whose saved object index changed, using the real split renderer.
c.NAMES=W.names;c.stand={id:7014,s:W.names.indexOf('stall1'),x:100,y:150};
assert(run('isVillageMarketStand(stand)'));
const calls=[];c.drawGameImage=(...args)=>calls.push(args);c.sheetOf=()=>({});
run('drawVillageStand(stand);drawVillageStand(stand,true)');
const canopy=calls[1],counter=calls[2];
assert(counter[7]-(canopy[7]+canopy[9])>=32,'Opening clears full hats and upper bodies');
console.log('PASS: reindexed village stand uses the raised canopy and separate counter.');
