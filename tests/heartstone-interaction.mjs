import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
const first=JSON.parse(read('assets/interiors/first-temple/layout.json')).tp1_sanctum;
const second=JSON.parse(read('assets/interiors/sandspire-temple/layout.json')).ds_sanctum;
let rewards=[],saves=0,swings=0,notices=[];
const c=vm.createContext({TS:16,MAPID:'tp1_sanctum',MD:{},P:{},breathHas:{lightning:false,ice:false,shadow:false},
 SPR:{it_hs_light:[0],it_hs_ice:[0],it_hs_shadow:[0],heartstone_chest:[0,0,19,22,5]},HS_ICON:{lightning:'it_hs_light',ice:'it_hs_ice',shadow:'it_hs_shadow'},
 dragon:{hp:8,maxHp:8,down:false},dragonMaxHp:()=>8,syncDragonVitality(){},stepLootChestOpening(){},stepDark(){},checkDeepPrize(){},
 showReveal:(icon,caption)=>rewards.push({icon,caption}),saveGame:()=>saves++,toast:s=>notices.push(s),
 atlasOpen:false,fishing:null,BOOT:{waiting:false},deadShown:false,ovl:null,ask:null,bagOpen:false,grabGold:()=>false,
 sayNpc:null,glassHatchNear:()=>false,doorMotion:null,sceneHold:()=>false,ride:null,trialDemonHere:()=>false,trial:null,
 interactTrialPedestal:()=>false,ferryTry:()=>false,tryHouseLootChest:()=>false,tryTreasuryChest:()=>false,tryExpandedTempleLever:()=>false,
 tryTempleLever:()=>false,tryCellarSupplies:()=>false,itemAt:()=>null,questTalk:()=>false,npcs:[],tryFishing:()=>false,
 mounted:false,hasSword:()=>true,startAct:()=>swings++,currentArenaFeatures:()=>[],foesHeld:true,
 arenaLock:null,arenaT:0,arenaGoing:false,falling:null});
const run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('const CHESTS = ['),game.indexOf('function checkGravePrize()')));
run(game.slice(game.indexOf('function unlockDragonBreath('),game.indexOf('function recoverStrandedDragon(')));
run(game.slice(game.indexOf('function stepChest(dt)'),game.indexOf('function drawChest()')));
run(game.slice(game.indexOf('function interact() {'),game.indexOf('function beginNpcTalk(')));
run(game.slice(game.indexOf('function actionButton() {'),game.indexOf('bindHold("act"')));
run(part3.slice(part3.indexOf('function stepArena(dt)'),part3.indexOf('function arenaRim(')));
run(`Object.assign(CHESTS[0],{map:'tp1_sanctum',x:${(first.heartstone[0]-8)/16},y:${(first.heartstone[1]-16)/16}});
 Object.assign(CHESTS[2],{map:'ds_sanctum',x:${(second.heartstone[0]-8)/16},y:${(second.heartstone[1]-16)/16}});`);
const chests=run('CHESTS');
function complete(){for(let i=0;i<150;i++)run('stepArena(1/60)');}
for(const disabled of [true,false])for(const chest of chests){
 c.MAPID=chest.map;c.foesHeld=disabled;c.P={x:chest.x*16+8,y:chest.y*16+16+24};c.breathHas[chest.gift]=false;
 run('chestAnim=null;delete chestOpen[MAPID]');const before=rewards.length,saveCount=saves;
 run('actionButton()');assert.equal(run('chestAnim?.phase'),'lid');
 run('actionButton()');assert.equal(swings,0,'pressing A during opening never falls through to a sword swing');
 complete();assert.equal(c.breathHas[chest.gift],true,`${chest.map}: Heartstone must finish opening with FOES ${disabled?'OFF':'ON'}`);
 assert.equal(run('chestAnim'),null);assert(run('chestOpen[MAPID]'));assert.equal(rewards.length,before+1);assert.equal(saves,saveCount+1);
 run('actionButton()');complete();assert.equal(swings,0);assert.equal(rewards.length,before+1,'claimed Heartstone never grants again');
 assert(notices.at(-1)?.includes('already'),'opened chest responds to A');
}
// An abandoned animation from a different temple cannot block the next chest.
c.MAPID='ds_sanctum';c.breathHas.ice=false;run("delete chestOpen.ds_sanctum;chestAnim={c:CHESTS[0],phase:'lid',t:0}");
c.P={x:second.heartstone[0],y:second.heartstone[1]+24};run('actionButton()');assert.equal(run('chestAnim.c.map'),'ds_sanctum');
// Leaving before the reveal does not award a remote chest or animate another room's chest.
c.MAPID='sn1';complete();assert.equal(run('chestAnim'),null);assert.equal(c.breathHas.ice,false);
console.log('PASS: actual A-button → interaction → arena tick completes every Heartstone with foes on/off, saves once, consumes repeated input, and recovers abandoned openings.');
