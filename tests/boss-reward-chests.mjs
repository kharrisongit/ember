import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
await run('DesertPyramid.prepare()');
run(`mode='play';gameplayStarted=true;quest=Q.DONE;foesHeld=false;
Frosthorn.installWorld(W.maps.world);IceMoth.installWorld(W.maps.world);
window.EmberArenaEntry=undefined;window.EmberEncounterCard=undefined;window.EmberRiding=undefined;
loadMap('pyramid_queen');scene=null;bossScene=null;ovl=null;ask=null;fadeDir=0;doorMotion=null;
arenaLock=null;P.act=null;
const dropItems={spiderqueen:'emberheart',frosthorn:'frostheart',icemoth:'soulwing'};
const testBossChest=kind=>(MD.roomActors||[]).find(a=>a.bossRewardKind===kind);
const testOwnsPrize=kind=>BAG.find(a=>a.key===dropItems[kind]).has();`);
assert(!run('MD.roomActors.some(a=>a.houseLoot?.item==="emberheart")'),'Queen reward is not preplaced');
for(const [kind,map,fade,x,y]of [
  ['spiderqueen','pyramid_queen',1,176,184],
  ['frosthorn','world',2.4,40744,421],
  ['icemoth','world',2.5,37528,2741]
]){
  run(`houseLootTaken.clear();for(const key in bossGone)delete bossGone[key];BossRewardChests.restore({});
  MAPID='${map}';MD=W.maps[MAPID];spawnFoes();`);
  assert(run(`foes.some(f=>f.kind==='${kind}')`),'Fresh boss is present before victory');
  run(`foes=[{kind:'${kind}',idx:0,x:${x},y:${y},hp:0,st:'dead',t:0}];
  markBossGone(foes[0]);`);
  assert(!run(`testOwnsPrize('${kind}')`),kind+' does not grant the relic at death');
  assert(!run(`!!testBossChest('${kind}')`),kind+' has no chest during the death animation');
  assert.equal(run(`readSaveSlot(activeSaveSlot).bossRewardChests.${kind}.x`),x,'Death position is autosaved immediately');
  run(`const pending_${kind}=readSaveSlot(activeSaveSlot);`);
  run(`stepFoes(${fade-.01});`);
  assert(!run(`!!testBossChest('${kind}')`),kind+' waits until the entire fade ends');
  run('stepFoes(.02);');
  assert.equal(run(`testBossChest('${kind}').x`),x);
  assert.equal(run(`testBossChest('${kind}').y`),y);
  assert(!run(`testOwnsPrize('${kind}')`),kind+' chest must be opened');
  run(`foes[0].x+=10;markBossGone(foes[0]);stepFoes(.1);BossRewardChests.sync();`);
  assert.equal(run(`MD.roomActors.filter(a=>a.bossRewardKind==='${kind}').length`),1,'Repeated callbacks do not duplicate chests');
  assert.equal(run(`testBossChest('${kind}').x`),x,'Original death spot is retained');
  const goldBefore=run('gold'),potionsBefore=run('potions');
  run(`P.x=${x};P.y=${y-30};`);
  assert(run('tryHouseLootChest()'),'Drop is reachable from the north, including at arena edges');
  assert(run(`testOwnsPrize('${kind}')`),kind+' chest grants its relic');
  assert.equal(run('gold'),goldBefore+(kind==='spiderqueen'?160:0));
  assert.equal(run('potions'),potionsBefore,'Relic is not randomized into a consumable');
  const claimed=run('JSON.stringify(captureSave().houseLootTaken)');
  run('tryHouseLootChest();');
  assert.equal(run('JSON.stringify(captureSave().houseLootTaken)'),claimed,'Opening twice grants once');
  assert.equal(run('gold'),goldBefore+(kind==='spiderqueen'?160:0));

  // Return to the autosave taken on death, before the body finished fading.
  run(`pending_${kind}.map='house22';pending_${kind}.x=128;pending_${kind}.y=160;
  localStorage.setItem(saveKey(2),JSON.stringify(pending_${kind}));`);
  assert(run('loadGame(2)'),'Unclaimed chest save loads');
  assert(!run(`testOwnsPrize('${kind}')`),'Reloading does not auto-grant the prize');
  if(map==='pyramid_queen')run(`loadMap('${map}');`);
  else run(`MAPID='world';MD=W.maps.world;spawnFoes();BossRewardChests.sync();`);
  assert(!run(`foes.some(f=>f.kind==='${kind}')`),'Unclaimed prize does not respawn the boss');
  assert.equal(run(`testBossChest('${kind}').x`),x,'Returning restores the exact death location');
  assert.equal(run(`testBossChest('${kind}').y`),y);
  run(`P.x=${x};P.y=${y};tryHouseLootChest();`);
  assert(run(`testOwnsPrize('${kind}')`),'Restored chest remains collectible');
  run(`localStorage.setItem(saveKey(3),JSON.stringify({...captureSave(),map:'house22',x:128,y:160,houseLootTaken:[],templeDefeated:{},bossRewardChests:{}}));`);
  assert(run('loadGame(3)'));
  assert.equal(run('Object.keys(BossRewardChests.capture()).length'),0,'Fresh slot clears drop positions');
  assert(!run('Object.values(W.maps).some(m=>m.roomActors?.some(a=>a.bossRewardKind))'),'Fresh slot removes old chest actors');
  assert(!run(`testOwnsPrize('${kind}')`));
}
// Legacy Queen victories keep an unclaimed reward even without a death position.
run(`bossGone['pyramid_queen:0']=true;BossRewardChests.restore();loadMap('pyramid_queen');`);
assert(run('!!testBossChest("spiderqueen")&&!DesertAdventure.owned()'));
console.log('PASS: all three death fades, exact drop positions, chest-only relics, one-time rewards, autosave, return/reload, no boss respawn, legacy Queen and slot isolation.');
