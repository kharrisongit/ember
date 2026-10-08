import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const logger={log(){},warn(){},error:console.error};
const make=async()=>{
  const game=await loadEditorGame(process.cwd(),logger,{furniture:false});
  game.run(`window.CraftingView=undefined;window.LDRCoopRender={enable(){}};
  window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEquipmentTutorial=undefined;
  var players=[{uid:'host',profile:{name:'Host'}},{uid:'guest',profile:{name:'Guest'}}];`);
  return {...game,json:expr=>JSON.parse(game.run('JSON.stringify('+expr+')'))};
};
const game=await make(),{run,context:c,json}=game;
run(`mode='play';gameplayStarted=true;quest=Q.DONE;loadMap('house22');P.x=128;P.y=192;`);
await run(`LDRCampaign.start({uid:'host',players,onNotice:()=>{},onSave:()=>true})`);
const clear=()=>run(`scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;foes=[];arenaLock=null;fadeDir=0;doorMotion=null;bossScene=null;P.act=null;arriveT=0;pHp=6;deadShown=false;`);
clear();run('Crafting.giveKit();Crafting.skip();var template=Crafting.capture();');
for(const food of ['dragonFish','boarMeat','hareMeat','deerMeat','foxMeat','birdMeat'])for(const cook of ['host','guest']){
  clear();
  for(const id of ['host','guest'])run(`Crafting.coopRestore('${id}',{...template,ingredients:{herb:${id==='host'?11:17}},cooked:{},pending:null});`);
  run(`LDRCampaign.claim('${cook}','ui');${food}=5;`);
  assert(run('Crafting.open()'));
  assert(run(`Crafting.start('cooked_${food}',2)`));assert.equal(run(food),3);
  const previous=json('LDRCampaign.checkpoint()');assert(previous,'Confirmation can be checkpointed');
  assert.equal(previous.players[cook].crafting.pending.qty,2);
  const serialized=JSON.stringify(previous);
  for(const uid of ['host','guest']){
    const fresh=await make();fresh.context.previous=previous;
    await fresh.run(`LDRCampaign.start({uid:'${uid}',players,checkpoint:previous,onNotice:()=>{},onSave:()=>true})`);
    assert.equal(fresh.run(food),5,food+' refunded once for '+cook+', resumed by '+uid);
    for(const id of ['host','guest']){
      assert.equal(fresh.run(`LDRCampaign.withActor('${id}',()=>Crafting.count('herb'))`),id==='host'?11:17,'Personal herbs refund to the correct rider');
      assert.equal(fresh.run(`LDRCampaign.withActor('${id}',()=>Crafting.capture().pending)`),null);
      assert.equal(fresh.run(`LDRCampaign.withActor('${id}',()=>Crafting.count('cooked_${food}'))`),0,'Cancelled batches produce no food');
    }
    fresh.context.previous=fresh.json('LDRCampaign.checkpoint()');
    await fresh.run(`LDRCampaign.start({uid:'${uid}',players,checkpoint:previous,onNotice:()=>{},onSave:()=>true})`);
    assert.equal(fresh.run(food),5,'Saving and resuming again does not refund again');
  }
  assert.equal(JSON.stringify(previous),serialized,'Resume does not mutate the stored checkpoint');
  // Resuming within the same runtime must also replace the selected rider's state.
  c.previous=previous;
  await run(`LDRCampaign.start({uid:'host',players,checkpoint:previous,onNotice:()=>{},onSave:()=>true})`);
  assert.equal(run(food),5);assert.equal(run(`LDRCampaign.withActor('${cook}',()=>Crafting.capture().pending)`),null);
}
console.log('PASS: all six cooking ingredients refund once for either rider, either resume owner, fresh/reused runtimes and repeated save/load; personal ingredients stay separate.');
