import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom();
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false,document:dom.document});
await run('Promise.all([DesertPyramid.prepare(),prepareExpandedFirstTemple(),prepareExpandedSandspireTemple(),prepareExpandedHollybeckTemple(),prepareExpandedMountainPassage()])');
run("mode='play';gameplayStarted=true;loadMap('house22');quest=Q.ERRAND;wonAll=0;bagOwned=false;fishingPole=false;cinderSeal=false;houseLootTaken.clear();");
const missing=()=>JSON.parse(run('JSON.stringify(BAG.filter(i=>!["egg","eggs"].includes(i.key)&&!i.has()).map(i=>i.key))'));
assert(missing().includes('fishingPole'));
// Press the actual developer button, rather than duplicating its grant logic.
dom.touch(dom.element('bSkip'));
assert.deepEqual(missing(),[],'Skip grants every current usable/key/charm inventory item');
assert(!run('Frosthorn.defeatedAlready()||IceMoth.defeatedAlready()||DesertAdventure.won()'),'Granted relics do not count as boss victories');
assert(run('ATLAS_LOCATIONS.every(p=>atlasPlaceKnown(p[0]))'),'Skip reveals the entire atlas');
for(const key of ['emberheart','frostheart','soulwing'])assert.equal(run('BAG.find(i=>i.key==='+JSON.stringify(key)+').icon()'),'inventory_'+key,'Relics display their own artwork in the bag');
assert.equal(run('wonAll'),0,'Granting items does not mark the king defeated');
assert.equal(run('trialSealPlaced'),false,'The seal is carried, not pre-placed');
assert.equal(run('DesertAdventure.firePower("fire",8)'),10);
assert.equal(run('Frosthorn.power("ice",8)'),10);
const saved=JSON.parse(run('JSON.stringify(readSaveSlot(activeSaveSlot))'));
assert(saved.fishingPole&&saved.cinderSeal,'New key items are saved');
assert(saved.houseLootTaken.includes(run('DesertAdventure.rewardId'))&&saved.houseLootTaken.includes(run('Frosthorn.rewardId'))&&saved.houseLootTaken.includes(run('IceMoth.rewardId')),'Relics use their normal ownership records');
for(const key of ['boarMeat','hareMeat','deerMeat','foxMeat','birdMeat','dragonFish'])assert(saved[key]>=3,key+' available to feed Aurelius');
assert(run('loadGame(activeSaveSlot)'),'Skip save loads');
assert.deepEqual(missing(),[],'Every granted item survives a real save reload');
assert(!run('Frosthorn.defeatedAlready()||IceMoth.defeatedAlready()||DesertAdventure.won()'),'Reloading a Skip save keeps relic ownership separate from boss victories');
assert(run('ATLAS_LOCATIONS.every(p=>atlasPlaceKnown(p[0]))'),'Full map discovery survives save reload');
// Existing supplies are never reduced, and pressing Skip again is repeatable.
run('potions=42;hareMeat=37;deerMeat=26;foxMeat=15;birdMeat=9;dragonFish=11;gold=999;');
const before=run('JSON.stringify([potions,hareMeat,deerMeat,foxMeat,birdMeat,dragonFish,gold,houseLootTaken.size])');
dom.touch(dom.element('bSkip'));
assert.equal(run('JSON.stringify([potions,hareMeat,deerMeat,foxMeat,birdMeat,dragonFish,gold,houseLootTaken.size])'),before,'Repeat Skip preserves larger stacks and unique relic ownership');
assert.deepEqual(missing(),[]);
// Exercise the authored spawns with all items owned, including the temple
// guardians, Queen, winter bosses and knights. Skip must not retire any of them.
run(`Frosthorn.installWorld(W.maps.world);IceMoth.installWorld(W.maps.world);
const skipBossKinds=new Set();
for(const [mapId,map] of Object.entries(W.maps)){
  const expected=(map.foes||[]).map((f,idx)=>({f,idx})).filter(({f})=>BOSS_KIND.test(f.k)&&!f.retiredEncounter&&!f.chestAmbush);
  if(!expected.length)continue;
  MAPID=mapId;MD=map;spawnFoes();
  for(const {f,idx} of expected){
    if(!foes.some(active=>active.idx===idx&&active.kind===f.k&&active.hp>0&&active.st!=='dead'))
      throw Error('Skip disabled '+f.k+' in '+mapId);
    skipBossKinds.add(f.k);
  }
}`);
for(const kind of ['frosthorn','icemoth','spiderqueen','knight','treasuryknight','golem1','golem2','golem3','golem4'])
  assert(run(`skipBossKinds.has(${JSON.stringify(kind)})`),'Spawn audit covers '+kind);
run("loadMap('cinderhold');scene=null;bossScene=null;startLastFight();");
assert(run("lastFight===1&&foes.some(f=>f.kind==='kdragon'&&f.hp>0)"),'Halvard confrontation remains playable with all items');
run("lastFight=0;loadMap('house22');");
// Spending a granted Soulwing also must not remove the moth. Genuine victories
// still persist independently of the items through saves and map respawns.
run('houseLootTaken.add(IceMoth.spentId);saveGame();');
assert(run('loadGame(activeSaveSlot)&&!IceMoth.owned()&&!IceMoth.defeatedAlready()'));
run("Frosthorn.defeated();IceMoth.defeated();bossGone['pyramid_queen:0']=true;saveGame();");
assert(run('loadGame(activeSaveSlot)&&Frosthorn.defeatedAlready()&&IceMoth.defeatedAlready()&&DesertAdventure.won()'));
run("MAPID='world';MD=W.maps.world;spawnFoes();");
assert(!run("foes.some(f=>f.kind==='frosthorn'||f.kind==='icemoth')"),'Actually defeated winter bosses remain defeated');
run("loadMap('pyramid_queen');");
assert(!run("foes.some(f=>f.kind==='spiderqueen')"),'Actually defeated Queen remains defeated');
run("loadMap('house22');");
// An ordinary earlier save remains ordinary: Skip does not globally unlock items.
run('fishingPole=false;cinderSeal=false;houseLootTaken.clear();saveToSlot(3,true);');
assert(run('loadGame(3)'));assert(!run('fishingPole||cinderSeal||Frosthorn.owned()||DesertAdventure.owned()'));
console.log('PASS: Skip grants the full inventory while all authored bosses and Halvard remain playable; reload, spent Soulwing, genuine victories, repeat grants, existing stacks and normal-save isolation.');
