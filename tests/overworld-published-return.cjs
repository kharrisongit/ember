/* Runs all maintained game scripts and published layouts; only browser APIs,
   rendering and timers are stubbed. Map generation and editor loading are real. */
const fs=require('fs'),vm=require('vm'),{performance}=require('perf_hooks');
const root=require('path').resolve(__dirname,'..')+'/';

const noop=()=>{}; const ctx=new Proxy({measureText:()=>({width:40}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h})},{get:(o,k)=>k in o?o[k]:noop});
function el(){return new Proxy({style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},children:[],width:800,height:600,textContent:'',className:'',value:'',getContext:()=>ctx,getBoundingClientRect:()=>({width:800,height:600,left:0,top:0}),querySelectorAll:()=>[],appendChild:noop,querySelector:()=>el(),setAttribute:noop,addEventListener:noop},{get:(o,k)=>k in o?o[k]:noop});}
const elements=new Map();const storage=new Map();class Image{constructor(){this.width=1024;this.height=1024;this.complete=true;}decode(){return Promise.resolve()}set src(s){this._src=s;if(Image.active&&this.onload)queueMicrotask(()=>this.onload());}get src(){return this._src}}
const c=vm.createContext({console,performance,Image,Audio:class {play(){return Promise.resolve()}pause(){}addEventListener(){}},URL,Blob,Response,DecompressionStream,TextDecoder,TextEncoder,Uint8Array,Uint8ClampedArray,Uint16Array,Float32Array,ArrayBuffer,DataView,crypto:require('crypto').webcrypto,atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),setTimeout:()=>0,clearTimeout:noop,setInterval:()=>0,clearInterval:noop,requestAnimationFrame:()=>0,cancelAnimationFrame:noop,devicePixelRatio:1,innerWidth:800,innerHeight:600,navigator:{},location:{hash:'',search:'',href:'http://localhost/'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null,setItem:noop,removeItem:noop},document:{getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},createElement:()=>el(),querySelectorAll:()=>[],querySelector:()=>el(),addEventListener:noop,documentElement:el(),body:el()},addEventListener:noop,fetch:async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+path.split('?')[0],'utf8'))})});c.window=c;c.self=c;
c.assert=require('node:assert/strict');
const run=s=>vm.runInContext(s,c);
const paths=[...fs.readFileSync(root+'index.html','utf8').matchAll(/<script\b[^>]*\bsrc="([^"?#]+)/g)].map(m=>m[1]);
for(const path of paths){try{vm.runInContext(fs.readFileSync(root+path,'utf8'),c,{filename:path});}catch(e){console.error('LOAD',path,e);process.exit(1)}}
(async()=>{await run('inflateWorld()');Image.active=true;await run('buildHouseFurnitureLayers()');await run('loadPublishedEditorLayouts()');

c.latestRecovered=[36092284694,36093525235].map(id=>JSON.parse(fs.readFileSync(root+'tests/fixtures/recovered-'+id+'.json','utf8')));
c.thornwellRoads=JSON.parse(fs.readFileSync(root+'tests/fixtures/thornwell-road-recovery.json','utf8'));
c.graveyardPatch=JSON.parse(fs.readFileSync(root+'tests/fixtures/hollybeck-cleanup.json','utf8'));
c.winterPatch=JSON.parse(fs.readFileSync(root+'tests/fixtures/winter-hunting-patch.json','utf8'));
c.recoveredDraft=JSON.parse(fs.readFileSync(root+'tests/fixtures/recovered-editor-draft.json','utf8'));
c.hollybeckRecovery=JSON.parse(fs.readFileSync(root+'tests/fixtures/recovered-36194050376.json','utf8'));
run(`mode='play';camFree=false;let profile=[];
for(const name of ['saveEditorDraft','editorPrepareMap','restoreOverworld','realizeFeatures','spawnFoes','applyActorLayout','prepareEditorEntities','buildGround','rebuildSolid','placeBirds']){
 const original=eval(name);eval(name+' = function(...args){const t=performance.now();const out=original(...args);profile.push({name:"'+name+'",ms:performance.now()-t,result:typeof out==="boolean"?out:undefined});return out;}');
}
let worldVisits=0;
for(const [id,fresh] of [[W.start,false],['house47',true],['house50',true],['world',true],[W.start,true],['world',false],['house47',false],['house50',false],['house22',false],['world',false]]){
 const t=performance.now();loadMap(id,fresh);
 if(id==='house47'||id==='house50'){
  const n=npcs.find(n=>n.n===(id==='house47'?'Fennel':'Bjorn'));
  const chair=MD.roomActors.find(a=>a.exactFurniture&&a.n==='north chair');
  const table=MD.roomActors.find(a=>a.exactFurniture&&a.n==='dining table');
  const old=MD.roomActors.filter(a=>a.castSeat&&/^ichair/.test(a.spr||''));
  assert(old.length&&old.every(a=>a.editorDeleted&&a.publishedDeleted),'Fallback chair overlays stay hidden after real map loading');
  assert(!chair.editorDeleted&&houseChairDepth(chair,npcs)<n.sy,'Movable chair is behind seated resident');
  assert(houseChairDepth(table,npcs)>n.sy,'Table stays in front of seated resident');
 }
 if(id==='house22'){
  const mad=npcs.find(n=>n.n==='Elder Maddock');assert(!mad.seatSpr&&!mad.seatClipY);assert.equal(mad.f,'u');assert.equal(mad.x,128);assert.equal(mad.y,100);
  assert(MD.roomActors.some(a=>a.editKey==='maddock:dragon-painting'),'Dragon picture present');
 }
 if(id==='world'){
  const hettie=npcs.find(n=>n.n==='Hettie');
  assert.equal(hettie.packSpr,'guild_citizen1','Hettie uses the green-dress woman');
  assert(hettie.packDirections&&hettie.packWalk&&!hettie.stationary&&!hettie.sk,'Hettie retains story movement without the old blonde skin');
  for(const dir of ['d','u','e','w'])for(const action of ['idle','walk'])assert(SPR[hettie.packSpr+'_'+action+'_'+dir][4]>1,'Hettie has animated '+action+' '+dir);
  assert(npcLookUsed({packSpr:'hettie96'})&&npcLookUsed({packSpr:'market_bread'}),'Retired blonde appearances cannot be added again');
  const layout=publishedEditorLayouts.maps.world;
  const operations=l=>[...(l?.build?operations(l.build.previous):[]),...Object.values(l||{}).filter(o=>o.kind&&o.kind!=='build')];
  const publishedOps=operations(layout);
  const huntingSpecies={9150:'bird',9152:'hare',9154:'hare',9156:'hare',9159:'boar',9161:'boar',9163:'boar',9165:'deer',9167:'deer',9169:'deer',9171:'deer',9173:'deer',9175:'deer',9177:'fox',9179:'fox',9181:'fox'};
  for(const op of publishedOps.filter(o=>o.kind==='arena'))huntingSpecies[op.id]=op.encounter;
  assert.equal(features.filter(isHuntingArena).length,16,'All placed hunting arenas remain');
  for(const [arenaId,species] of Object.entries(huntingSpecies)){
   assert.equal(MD.features.find(a=>a.id===Number(arenaId)).encounter,species,'Published regional species '+arenaId);
   const animals=foes.filter(f=>f.huntingArena?.id===Number(arenaId));
   assert.equal(animals.length,3,'Exactly three animals in arena '+arenaId);
   assert(animals.every(f=>f.kind===species),'Live animals match the region in arena '+arenaId);
  }
  // Check authored coordinates after the real Build, move and map-loading paths.
  const miner=npcs.find(n=>n.n==='Toft'),formerSeller=npcs.find(n=>n.n==='Ovid');
  assert.equal(miner.packSpr,'npc_miner_mike_d');
  assert.equal(JSON.stringify(miner.sells),JSON.stringify(['potion','dust','saint']));
  assert(!formerSeller.sells,'Square resident no longer opens Forgewick shop');
  for(const uuid of Object.keys(PLACED_NPC_DIALOGUE)){
   const key='npc:placed:'+uuid,n=npcs.find(n=>n.editKey===key);
   assert(n&&!n.noTalk&&n.d.length>1&&n.d2.length>1,'Published NPC can talk: '+uuid);
   const op=publishedOps.filter(o=>(o.kind==='npc-add'&&o.key===uuid)||(o.kind==='actor'&&o.key===key)).at(-1);
   assert.equal(n.x,op.x,'Dialogue preserves placed NPC x');assert.equal(n.y,op.y,'Dialogue preserves placed NPC y');
  }
  for(const name of ['Sverre','Runa']){
   const n=npcs.find(n=>n.n===name);
   assert(n&&n.patrol&&n.packWalk&&n.packDirections&&!n.stationary,'Winter villager can walk: '+name);
   for(const dir of ['d','u','e','w'])for(const action of ['walk','idle'])assert.equal(SPR[n.packSpr+'_'+action+'_'+dir][4],8,'Six motion frames plus closed and half-closed eyes in every direction and state');
   assert(canNpcStand(n.x,n.y,n),'Winter villager starts on clear ground: '+name);
   assert(patrolRoute(n).length>1,'Winter villager has a clear walking route: '+name);
  }
  const lanternGivers=npcs.filter(n=>n.charm==='lamp');
  assert.equal(lanternGivers.length,1,'Lantern has exactly one giver after map loading');
  assert.equal(lanternGivers[0].n,'Sverre');
  assert(npcHere(lanternGivers[0])&&!lanternGivers[0].noTalk,'Lantern giver is present and can talk');
  for(const patch of layout.build.changes){
   if(patch.path[0]!=='objs'||!('value' in patch))continue;
   let value=MD;for(const key of patch.path)value=value[key];
   assert.equal(value,patch.value,'Exact submitted object coordinate '+patch.path.join('.'));
  }
  for(const op of Object.values(layout).filter(op=>op.kind==='object-add')){
   assert(MD.objs.some((v,i)=>i%3===0&&v===op.sprite&&MD.objs[i+1]===op.x&&MD.objs[i+2]===op.y),'Exact submitted tree placement '+op.key);
  }
  for(const patch of layout.build.changes.filter(p=>p.path[0]==='features')){
   if('value' in patch){let v=MD;for(const k of patch.path)v=v[k];const expected=patch.path[2]==='encounter'?(huntingSpecies[MD.features[patch.path[1]].id]||patch.value):patch.value;assert.equal(JSON.stringify(v),JSON.stringify(expected),'Exact submitted route/arena geometry');}
  }
  assert(publishedEditorLayouts.applied.includes(recoveredDraft.id),'Failed draft recovery receipt');
  for(const op of recoveredDraft.operations){
   assert.equal(JSON.stringify(MD.scatter.slice(op.index,op.index+3)),JSON.stringify([op.sprite,op.fromX,op.fromY]),'Recovered scenery identity');
   assert(MD.editorDeletedDecor.includes(op.key),'Recovered deletion '+op.key);
  }
  for(const expected of winterPatch.features){
   const actual=MD.features.find(f=>f.id===expected.id);
   const revised=expected.kind==='arena'?{...expected,encounter:huntingSpecies[expected.id]}:expected;
   assert.equal(JSON.stringify(actual),JSON.stringify(revised),'Supplied geometry and requested species '+expected.id);
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
  const topAdditions=Object.values(layout).filter(op=>op.kind==='object-add').length;
  const fixtureObjects=MD.objs.slice(0,MD.objs.length-topAdditions*3);
  for(const op of Object.values(layout).filter(op=>op.kind==='object')){
   if(!op.deleted){
    assert.equal(MD.objs[Number(op.key)*3+1],op.x,'Latest submitted object X');
    assert.equal(MD.objs[Number(op.key)*3+2],op.y,'Latest submitted object Y');
   }
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
   if(op.kind==='object'){const o=objs.find(o=>o.id===Number(op.key)),expected=layout['object:'+op.key]||op;assert.equal(o.x,expected.x);assert.equal(o.y,expected.y);}
   if(op.kind==='actor'){const n=npcs.find(n=>n.n===op.identity),expected=layout['actor:'+op.key]||op;assert.equal(n.x,expected.x);assert.equal(n.y,expected.y);}
  }
  const villageStalls=objs.filter(o=>/^stall[123]$/.test(NAMES[o.s]||''));
  assert.equal(villageStalls.length,4);
  for(const o of villageStalls)assert(isVillageMarketStand(o),'Published stand uses enlarged layered rendering');
  const grave=features.find(f=>f.id===207),spur=features.find(f=>f.id===80);
  assert.equal(spur.pts.at(-1)[0],grave.x,'Graveyard entry is centered');
  assert.equal(features.find(f=>f.id===81).kind,'landmark','No square clearing over the circle');
  for(const name of ['Bregga','Sigrun','Torvald'])assert(!npcs.some(n=>n.n===name&&npcHere(n)),'Recovered cast removal '+name);
  const expectedArenas=[[9150,168,67,'bird'],[9152,333,204,'hare'],[9154,453,162,'hare'],[9156,587,262,'hare'],[9159,813,281,'boar']];
  for(const [id,x,y,encounter] of expectedArenas){
   const arena=MD.features.find(f=>f.id===id);
   assert(arena,'Missing published arena '+id);
   assert.equal(JSON.stringify([arena.x,arena.y,arena.encounter]),JSON.stringify([x,y,huntingSpecies[id]||encounter]));
   assert.equal(foes.filter(f=>f.huntingArena?.id===id).length,3,'Animals in arena '+id);
  }
  for(const draft of latestRecovered){
   assert(publishedEditorLayouts.applied.includes(draft.id),'Recovered submission receipt');
   for(const op of draft.operations){
    const saved=layout[op.kind+':'+op.key];assert(saved,'Recovered operation present');
    if(op.kind==='actor'){
     const a=op.key.startsWith('npc:')?npcs.find(n=>n.n===op.identity):MD.roomActors.find(a=>a.spr===op.identity);
     const latest=publishedOps.filter(o=>o.kind==='actor'&&o.key===op.key).at(-1)||op;
     assert(a,'Recovered actor exists');assert.equal(a.x,latest.x);assert.equal(a.y,latest.y);
     if(latest.deleted)assert(a.editorDeleted,'Recovered NPC deletion');
    }
    if(op.kind==='object'){const o=objs.find(o=>o.id===Number(op.key)),latest=layout['object:'+op.key]||op;if(latest.deleted)assert(!o);else{assert.equal(o.x,latest.x);assert.equal(o.y,latest.y);}}
    if(op.kind==='door')assert.equal(JSON.stringify(MD.doors[op.index].triggerRect),JSON.stringify(op.rect),'Recovered tavern doorway');
    if(op.kind==='collision'){const [tx,ty]=op.key.split(',').map(Number);assert.equal(collisionOverride(tx*8+4,ty*8+4),op.blocked,'Recovered collision '+op.key);}
   }
  }
  for(const id of hollybeckRecovery.recoveredSubmissions)assert(publishedEditorLayouts.applied.includes(id),'Recovered/superseded send receipt');
  for(const op of hollybeckRecovery.operations){
   if(op.kind==='actor'){const n=npcs.find(n=>editorNpcKey(n)===op.key);assert.equal(n.x,op.x);assert.equal(n.y,op.y);}
   if(op.kind==='object'){const o=objs.find(o=>o.id===Number(op.key));if(op.deleted)assert(!o,'Recovered object deletion');else{assert.equal(o.x,op.x);assert.equal(o.y,op.y);}}
   if(op.kind==='paint')for(let i=0;i<op.values.length;i++)assert.equal(terr[op.start+i],op.values[i],'Recovered Hollybeck paint');
   if(op.kind==='collision'){const [tx,ty]=op.key.split(',').map(Number);const latest=publishedOps.filter(o=>o.kind==='collision'&&o.key===op.key).at(-1)||op;assert.equal(collisionOverride(tx*8+4,ty*8+4),latest.blocked,'Recovered Hollybeck collision follows latest edit '+op.key);}
   if(op.kind==='feature-delete')assert(felled.has(op.key),'Recovered scenery removal');
  }
  if(worldVisits++){
   if(!profile.some(p=>p.name==='restoreOverworld'&&p.result===true))throw Error('Published overworld was not retained');
   if(profile.some(p=>['realizeFeatures','rebuildSolid','buildGround'].includes(p.name)))throw Error('Return rebuilt the overworld');
  }
  console.log('Published world visit '+worldVisits+': '+(performance.now()-t).toFixed(1)+' ms');
 }
 profile=[];
}
// The deleted giver stays deleted; the new resident uses the existing one-time reward.
const lanternGiver=npcs.find(n=>n.n==='Sverre');
const revealBefore=showReveal,lanternReveals=[];
showReveal=(...args)=>lanternReveals.push(args);
assert(!charm.lamp,'Fresh save has no lantern');
P.x=lanternGiver.x;P.y=lanternGiver.y+20;
beginNpcTalk(lanternGiver);
assert(sayNpc.said.some(line=>line.includes('Torvald left this lantern')),'New giver explains the handoff');
for(let i=0;sayNpc&&i<20;i++){typeAll();interact();}
assert.equal(sayNpc,null,'Handoff dialogue completes');
assert(charm.lamp,'Completing the conversation grants the lantern');
assert.equal(lanternReveals.length,1,'Lantern is awarded once');
assert.equal(lanternReveals[0][1],CHARM_NOTE.lamp);
assert(readSaveSlot(activeSaveSlot).charm.lamp,'Lantern reward is immediately saved');
loadMap('house47');saveGame();
charm.lamp=false;
assert(loadGame(),'Saved game loads');
assert(charm.lamp,'Lantern ownership survives loading a saved game');
// Legacy saves have no charm record and must not inherit another slot's items.
localStorage.setItem(saveKey(2),JSON.stringify({map:'house47',x:P.x,y:P.y,quest:0}));
assert(loadGame(2));
assert(!charm.lamp,'Legacy/other slot does not inherit the lantern');
assert(loadGame(1));
assert(charm.lamp,'Returning to the original slot restores its lantern');
loadMap('world');
const returningGiver=npcs.find(n=>n.n==='Sverre');
P.x=returningGiver.x;P.y=returningGiver.y+20;
beginNpcTalk(returningGiver);
assert.equal(ask.npcConversation,'Sverre','Returning visitors get the new conversation choices');
assert.equal(sayNpc,null,'Opening topics does not restart the gift dialogue');
askPick=1;askTake();
assert(!sayNpc.said.some(line=>line.includes('Torvald left this lantern')),'Owned lantern does not repeat the handoff');
for(let i=0;sayNpc&&i<20;i++){typeAll();interact();}
assert.equal(sayNpc,null,'Follow-up conversation completes');
assert.equal(lanternReveals.length,1,'Existing owners receive no duplicate lantern');
showReveal=revealBefore;
console.log("PASS: Sverre grants the deleted Torvald's lantern once; ownership survives save/load, slot switching and map reentry.");
// Exercise the real Add/Transport buttons' actions through full map loading.
const unused=npcLineupCatalog().find(e=>e.category==='walking'&&!npcLookUsed(e));
assert(unused,'Unused animated cast is available');
camFree=true;cam.x=4000;cam.y=1600;cam.z=2;setDev(true);
const addCamera={x:cam.x,y:cam.y,z:cam.z},addPlayer={x:P.x,y:P.y};
const addCenter={x:Math.round(cam.x+VW/cam.z/2),y:Math.round(cam.y+VH/cam.z/2)};
addUnusedNpc(unused);
const addedKey=editorNpcKey(selected);assert(selected&&!selected.editorDeleted&&!selected.devLineup);
assert.equal(selected.x,addCenter.x,'Added NPC appears at the panned camera center');
assert.equal(selected.y,addCenter.y,'Added NPC appears at the panned camera center');
assert.equal(P.x,addPlayer.x,'Adding an NPC leaves the player in place');assert.equal(P.y,addPlayer.y);
assert.equal(cam.x,addCamera.x);assert.equal(cam.y,addCamera.y);assert.equal(cam.z,addCamera.z);
assert(!devOpen&&editing,'Menus close while Move stays active');
moveEditorActor(selected,4200,1850,true);saveEditorDraft();loadMap('house22');loadMap('world');
assert.equal(npcs.find(n=>editorNpcKey(n)===addedKey).x,4200,'New NPC position survives real area switches');
selected=npcs.find(n=>editorNpcKey(n)===addedKey);deleteSelected();
assert(!npcs.some(n=>editorNpcKey(n)===addedKey),'Deleting unsent addition removes it');
loadMap('tavern');selected=MD.roomActors.find(a=>a.spr==='tavern_anim_8');
assert.equal(npcSelection().n,'Hobb','Visible tavern actor resolves dialogue identity');
transportSelectedNpc({name:'Thornwell',x:261,y:116});
const transferredKey=editorNpcKey(selected);assert.equal(selected.packSpr,'tavern_anim_8');
const destination={x:selected.x,y:selected.y};
loadMap('tavern');assert(npcs.find(n=>n.n==='Hobb').editorDeleted,'Original dialogue NPC hidden');
assert(MD.roomActors.find(a=>a.spr==='tavern_anim_8').editorDeleted,'Original visible actor hidden');
loadMap('world');assert.equal(npcs.find(n=>editorNpcKey(n)===transferredKey).x,destination.x);
assert.equal(npcs.find(n=>editorNpcKey(n)===transferredKey).y,destination.y);
assert(EmberEditDrafts.store.get('world').operations.some(o=>o.kind==='npc-transfer'),'SEND CHANGES includes the transfer from its destination');
console.log('PASS: actual Add, move, delete and Transport controls survive interior/world switching and preserve animation and a single visible NPC.');
// Arena numbers use current published/local features; selecting an animal is a
// compact arena edit and must keep every other arena and path unchanged.
const beforeNumbering=JSON.stringify(features);
setArenas(true);
assert.equal(JSON.stringify(features),beforeNumbering,'Opening arena numbers does not edit the map');
assert.equal(arenaNumberEntries.filter(a=>a.mapId==='world'&&isHuntingArena(a)).length,16,'Every published hunt has a number');
const arenaBefore=JSON.parse(JSON.stringify(features.find(a=>a.id===9150)));
assert(changeArenaAnimal(9150,'fox'));
assert.equal(features.find(a=>a.id===9150).encounter,'fox');
assert.equal(JSON.stringify(features.find(a=>a.id===9150)),JSON.stringify({...arenaBefore,encounter:'fox'}),'Only the animal type changes');
assert.equal(foes.filter(f=>f.huntingArena?.id===9150&&f.kind==='fox').length,3,'New herd appears immediately');
assert(!foes.some(f=>f.huntingArena?.id===9150&&f.kind==='bird'),'Previous animal type is removed');
const huntDraft=EmberEditDrafts.store.get('world'),huntOp=huntDraft.operations.find(o=>o.kind==='arena');
assert(huntOp,'SEND CHANGES contains the animal edit');
assert(!huntDraft.operations.some(o=>o.kind==='build'),'Animal choice does not resend world Build data');
assert.equal(huntOp.encounter,'fox','Structured publishing includes the choice');
assert(JSON.stringify(huntDraft.operations).length<3000,'Hunting edits and NPC transfer fit comfortably in GitHub');
loadMap('house47');loadMap('world');
assert.equal(features.find(a=>a.id===9150).encounter,'fox','Animal choice survives map reentry');
assert.equal(foes.filter(f=>f.huntingArena?.id===9150&&f.kind==='fox').length,3);
assert(changeArenaAnimal(9150,'bird'));setArenas(false);
console.log('PASS: all hunting arenas are numbered; choosing an animal updates the herd, sends compact data and survives map reentry.');
console.log('PASS: current published Build layout applies, repeated interior exits retain the complete overworld, without terrain/collision rebuilding.');
// Use the published elder clearing and doorway for the hatch staging as well.
mode='play';editing=false;mounted=false;quest=Q.CARRY;dragon.on=false;
const hatchElder=elder();hatchElder.away=0;
for(const [dx,dy] of [[0,24],[24,0],[-24,0],[0,-24]]){
 hatchElder.x=ELDER_WELL[0]*TS+TS/2;hatchElder.y=ELDER_WELL[1]*TS+TS;hatchElder.goto=null;
 P.x=hatchElder.x+dx;P.y=hatchElder.y+dy;assert(canStand(P.x,P.y),'Corin can approach from this side');
 beginHatchScene(hatchElder);scene.i=7;scene.t=1;
 for(let i=0;i<12;i++)stepHatchScene(.05);
 for(const [start,end]of [[hatchScene.p0,hatchScene.p1],[hatchScene.m0,hatchScene.m1]]){
  assert(Math.hypot(end[0]-start[0],end[1]-start[1])>=18,'Both characters visibly step away on the actual map');
  assert(Math.hypot(end[0]-hatchScene.eggX,end[1]-hatchScene.eggY)>Math.hypot(start[0]-hatchScene.eggX,start[1]-hatchScene.eggY),'Retreat increases distance from the hatchling');
 }
 assert(canStand(P.x,P.y));assert(canNpcStand(hatchElder.x,hatchElder.y,hatchElder));
 const door=maddockDoor();assert(maddockWalkPath(hatchElder,[door.x,door.y]),'House remains reachable from each retreat');
}
for(let i=0;i<60;i++)stepHatchCamera(.05);
scene=null;finishHatchScene();const exitCamera=JSON.stringify(cam),actualDoor=maddockDoor();
for(let i=0;i<600&&!hatchElder.away;i++){
 const before=[hatchElder.x,hatchElder.y];stepWalkers(1/60);stepElder(1/60);
 assert(Math.hypot(hatchElder.x-before[0],hatchElder.y-before[1])<=52/60+.001,'No offscreen speedup or teleport during actual exit');
 if(!hatchElder.away){stepHatchCamera(1/60);assert.equal(JSON.stringify(cam),exitCamera);}
}
assert(hatchElder.away);assert.equal(hatchElder.x,actualDoor.x);assert.equal(hatchElder.y,actualDoor.y-32);
assert(hatchCamera,'Normal zoom waits for the completed entrance');
for(let i=0;i<90;i++)stepHatchCamera(1/60);assert.equal(hatchCamera,null);
console.log('PASS: On the actual map, Corin and Maddock retreat from every approach; Maddock walks into his published doorway while the camera stays fixed.');

`);
})().catch(e=>{console.error(e);process.exit(1)});
