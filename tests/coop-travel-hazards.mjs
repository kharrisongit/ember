import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false,document:dom.document});
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`mode='play';gameplayStarted=true;quest=Q.DONE;loadMap('house22');P.x=128;P.y=192;
window.EmberArenaEntry=undefined;window.EmberEquipmentTutorial=undefined;window.EmberConversationFlow=undefined;
var ridingModule=window.EmberRiding;window.EmberRiding=undefined;window.LDRCoopRender={enable(){}};
var players=[{uid:'host',profile:{name:'Host'}},{uid:'guest',profile:{name:'Guest'}}];`);
await run(`LDRCampaign.start({uid:'host',players,onNotice:()=>{},onSave:()=>true})`);
run(`scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;bagOpen=false;foes=[];arenaLock=null;fadeDir=0;fade=0;doorMotion=null;bossScene=null;
arriveT=0;deadShown=false;ride=null;fishing=null;trial=null;devSafe=false;foesHeld=false;hatchExit=false;hatchCamera=null;saintT=0;dragonOff=true;`);
function resetRiders(){run(`for(const id of ['host','guest'])LDRCampaign.withActor(id,()=>{pHp=6;pInv=0;P.act=null;P.x=id==='host'?128:180;P.y=192;mounted=false;});`);}
for(const fallen of ['host','guest']){
  resetRiders();run(`houseLootTaken.add(IceMoth.rewardId);houseLootTaken.delete(IceMoth.spentId);
  LDRCampaign.withActor('${fallen}',()=>{pHp=0;P.act={kind:'die',t:6.99,done:0};stepAct(.05)});`);
  assert.equal(run(`LDRCampaign.actor('${fallen}').vars.pHp`),6);
  assert.equal(run(`LDRCampaign.actor('${fallen}').P.act`),null);
  assert(run('houseLootTaken.has(IceMoth.spentId)'));assert(!run('deadShown'));
  run(`LDRCampaign.withActor('${fallen}',()=>{pHp=0;P.act={kind:'die',t:6.99,done:0};stepAct(.05)});`);
  assert.equal(run(`LDRCampaign.actor('${fallen}').vars.pHp`),0,'The relic cannot revive twice');
  assert(!run('deadShown'),'A surviving partner still prevents a party defeat');
}
resetRiders();run(`LDRCampaign.claim('host','action');
MD={...MD,templeExpanded:true,hollybeck:true,templePlan:{hazards:[],chambers:[]},templeFloors:[[0,0,1000,1000]],templeClock:1.8,
templeHazards:[{type:'flame',hall:'test',y:192,minX:100,maxX:250,offset:0,period:6}]};
drawWorld=()=>{};drawTempleCompass=()=>{};last=performance.now();LDRCampaign.mainFrame(last+50,false);`);
assert.deepEqual(json('LDRCampaign.vitals().map(p=>p.hp)'),[5,5],'Both riders are hit by the same active flame');
assert(Math.abs(run('MD.templeClock')-1.85)<1e-9,'The trap clock advances only once');
run('LDRCampaign.mainFrame(last+50,false)');assert.deepEqual(json('LDRCampaign.vitals().map(p=>p.hp)'),[5,5],'Both riders retain damage immunity');
resetRiders();run(`MD.hollybeck=false;MD.templePlan.hazards=[{id:'spike-test',axis:'y',cross:[100,250],lines:[192]}];tAcc=2;stepExpandedTemple(0);`);
assert.deepEqual(json('LDRCampaign.vitals().map(p=>p.hp)'),[5,5],'Spikes check both riders');
resetRiders();run(`MD.templeClock=2;MD.templeHazards=[{type:'saw',hall:'saw-test',y:192,minX:100,maxX:250,x:120,offset:0,period:6}];stepExpandedDragonHazards(.05);`);
assert.deepEqual(json('LDRCampaign.vitals().map(p=>p.hp)'),[5,5],'A swept saw checks both riders');
for(const target of ['host','guest']){
  resetRiders();run(`LDRCampaign.withActor('${target==='host'?'guest':'host'}',()=>P.y=240);
  MD.templeMachines=[];MD.templeShots=[{type:'arrow',hall:'arrow-test',x:${target==='host'?120:172},y:192,dir:1,age:0,minX:100,maxX:250}];
  stepExpandedTempleMachines(.05);`);
  assert.equal(run(`LDRCampaign.actor('${target}').vars.pHp`),5,'Arrows hit either rider');
  assert.equal(run('MD.templeShots.length'),0,'An impacting arrow is consumed');
}
console.log('PASS: Soulwing revives either rider once; flames, spikes, saws and arrows hit both players without duplicating trap time.');

// Complete real flight frames over a small terrain fixture with a wall exactly
// where the old fixed guest offset would have landed.
run(`MAPID='world';MD={...W.maps.world,doors:[]};PXW=3200;PXH=3200;MW=200;MH=200;solid=new Uint8Array(MW*MH);npcs=[];foes=[];features=[
{kind:'area',label:'Millwood',x0:0,y0:0,x1:60,y1:60},{kind:'area',label:'Thornwell',x0:70,y0:0,x1:100,y1:60}];
window.EmberRiding=ridingModule;EmberRiding.skip();
areaUnder=(x,y)=>x<960?'Millwood':x>=1120&&x<=1600?'Thornwell':'Millwood–Thornwell Road';
VW=800;VH=600;cam.z=2;dragonIntroDone=true;dragonOff=false;thornwellRoyal.stage=7;saintT=0;
for(const id of ['host','guest'])LDRCampaign.withActor(id,()=>{pHp=6;pInv=0;P.act=null;P.x=600;P.y=600;P.moving=false;mounted=true;dragon.on=true;dragon.placed='world';dragon.hp=20;dragon.maxHp=20;dragon.air=false;dragon.down=false;dragon.knockdown=0;dragon.tr=null;});
followCam();clampCam();restoreFlightTravel({Millwood:[600,600],Thornwell:[1280,600]});solid[37*MW+81]=1;`);
for(const leader of ['host','guest']){
  run(`LDRCampaign.claim('${leader}','action');`);
  assert(run(`beginFlightTravel('${leader==='host'?'Thornwell':'Millwood'}')`));
  run('for(var frames=0;frames<1000&&flightTravel;frames++)LDRCampaign.mainFrame(last+50,false)');
  assert(!run('flightTravel'));
  for(const id of ['host','guest'])assert(run(`LDRCampaign.withActor('${id}',()=>mounted&&!dragon.air&&canStand(P.x,P.y)&&dragonCanStand(dragon.x,dragon.y))`),id+' lands on clear terrain');
  const checkpoint=json('LDRCampaign.checkpoint()');assert(checkpoint);
  for(const id of ['host','guest'])assert.deepEqual(checkpoint.players[id].P.x,run(`LDRCampaign.actor('${id}').P.x`),'The safe position reaches the checkpoint');
}
console.log('PASS: either co-op rider can lead a complete flight, both land clear of obstacles, and checkpoints preserve the safe landing.');
