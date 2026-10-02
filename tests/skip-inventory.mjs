import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom();
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false,document:dom.document});
run("mode='play';gameplayStarted=true;loadMap('house22');quest=Q.ERRAND;wonAll=0;bagOwned=false;fishingPole=false;cinderSeal=false;houseLootTaken.clear();");
const missing=()=>JSON.parse(run('JSON.stringify(BAG.filter(i=>!["egg","eggs"].includes(i.key)&&!i.has()).map(i=>i.key))'));
assert(missing().includes('fishingPole'));
// Press the actual developer button, rather than duplicating its grant logic.
dom.touch(dom.element('bSkip'));
assert.deepEqual(missing(),[],'Skip grants every current usable/key/charm inventory item');
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
assert(run('ATLAS_LOCATIONS.every(p=>atlasPlaceKnown(p[0]))'),'Full map discovery survives save reload');
// Existing supplies are never reduced, and pressing Skip again is repeatable.
run('potions=42;hareMeat=37;deerMeat=26;foxMeat=15;birdMeat=9;dragonFish=11;gold=999;');
const before=run('JSON.stringify([potions,hareMeat,deerMeat,foxMeat,birdMeat,dragonFish,gold,houseLootTaken.size])');
dom.touch(dom.element('bSkip'));
assert.equal(run('JSON.stringify([potions,hareMeat,deerMeat,foxMeat,birdMeat,dragonFish,gold,houseLootTaken.size])'),before,'Repeat Skip preserves larger stacks and unique relic ownership');
assert.deepEqual(missing(),[]);
// An ordinary earlier save remains ordinary: Skip does not globally unlock items.
run('fishingPole=false;cinderSeal=false;houseLootTaken.clear();saveToSlot(3,true);');
assert(run('loadGame(3)'));assert(!run('fishingPole||cinderSeal||Frosthorn.owned()||DesertAdventure.owned()'));
console.log('PASS: real Skip touch grants the full inventory, pole, all three relics, all food and seal; save/reload, repeat grants, existing stacks, and normal-save isolation.');
