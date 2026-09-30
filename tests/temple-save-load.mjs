import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){}});
run("quest=Q.DONE;mode='play';gameplayStarted=true;giveFatherCompass();");
for(const [map,version,gift]of [['tp1_halls','templeLayoutVersion','lightning'],['ds_west','sandspireLayoutVersion','ice'],['sn_west','hollybeckLayoutVersion','shadow']]){
 run(`loadMap('${map}');[P.x,P.y]=MD.spawn;bossGone['${map}:0']=true;bossGone['${map}:spikes:hall']=true;houseLootTaken.add('${map}:chest');atlasCompassTutorialSeen=true;`);
 assert(run('saveToSlot(1,true)'),'Actual serializer succeeds');
 const saved=JSON.parse(run('JSON.stringify(readSaveSlot(1))'));
 assert.equal(saved[version],version==='templeLayoutVersion'?2:1);
 assert(saved.templeDefeated[map+':0']);assert(saved.templeDefeated[map+':spikes:hall']);
 run('houseLootTaken.clear();for(const k in bossGone)delete bossGone[k];atlasCompassTutorialSeen=false;');
 assert(run('loadGame(1)'),'Actual loader succeeds');
 assert(run(`bossGone['${map}:0']&&bossGone['${map}:spikes:hall']&&houseLootTaken.has('${map}:chest')`));
 assert(run('templeCompass.owned&&templeCompass.awakened&&atlasCompassTutorialSeen'));
 run(`breathHas.${gift}=true;chestAnim={c:CHESTS.find(c=>c.gift==='${gift}'),t:0};chestOpen[CHESTS.find(c=>c.gift==='${gift}').map]=true;`);
 const old={map,x:1,y:1,gold:0,quest:9,breathHas:{},fatherCompass:{owned:true,awakened:false}};
 run(`localStorage.setItem(saveKey(2),${JSON.stringify(JSON.stringify(old))});`);
 assert(run('loadGame(2)'),'Old slot loads and relocates safely');
 assert(run('canStand(P.x,P.y)'),'Legacy position moves to clear floor');
 assert(run(`!breathHas.${gift}&&!chestOpen[CHESTS.find(c=>c.gift==='${gift}').map]&&chestAnim===null`));
 assert.equal(run('houseLootTaken.size'),0);assert.equal(run('Object.keys(bossGone).length'),0);
 assert(run('templeCompass.owned&&templeCompass.awakened&&!atlasCompassTutorialSeen'));
}
console.log('PASS: actual save/load across all temples, trap/chest persistence, clean slot switching, legacy relocation and compass tutorial migration.');
