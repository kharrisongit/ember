import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');let saves=0;
const c=vm.createContext({cv:{width:780,height:880},document:{createElement:()=>({getContext:()=>({drawImage(){}})})},Math,
 fishingPole:true,fishing:null,FISH_TAU:Math.PI*2,dragonFish:0,DRAGON_FISH_HEAL:35,
 P:{x:0,y:0},TS:16,MAPID:'world',W:{maps:{}},waterInReach:()=>true,fishingSafe:()=>true,
 running:false,clearPadInputs(){},padDx:0,padDy:0,keys:{},saveGame(){saves++;}});
const game=read('js/generated/game-part-2.js');
for(const [a,b]of [['function endFishing(){','function tryFishing(){'],['function fishingRegion(){','function interact() {']])vm.runInContext(game.slice(game.indexOf(a),game.indexOf(b)),c);
vm.runInContext(read('js/fishing.js'),c);
const run=s=>vm.runInContext(s,c),step=n=>{for(let i=0;i<n;i++)run('stepFishing(.05)');};
function cast(tier=0){c.P.x=[0,700,1300,1900,2500,3100][tier]*16;run('startFishing()');assert.equal(c.fishing.phase,'aim');c.fishing.power=.72;run('fishingAction()');assert.equal(c.fishing.phase,'cast');run('fishingAction()');assert.equal(c.fishing.phase,'cast');step(15);assert.equal(c.fishing.phase,'wait');run('fishingAction()');assert.equal(c.fishing.phase,'wait');while(c.fishing.phase==='wait')step(1);assert.equal(c.fishing.phase,'hook');}
function hook(){run('fishingAction()');assert.equal(c.fishing.phase,'reel');assert(c.fishing.requireRelease);run('fishingAction()');assert(!c.fishing.held,'The hook press cannot accidentally start straining the line');run('fishingRelease()');}
for(let tier=0;tier<6;tier++){
 cast(tier);hook();
 for(let i=0;i<1000&&c.fishing.phase==='reel';i++){
  if(c.fishing.surging||c.fishing.warning||c.fishing.tension>.58)run('fishingRelease()');else run('fishingAction()');step(1);
 }
 assert(c.fishing.caught,'Controlled fishing lands tier '+tier);assert.equal(c.fishing.bonus,1);
 const count=c.dragonFish;run('finishFishing(true)');assert.equal(c.dragonFish,count,'No duplicate rewards');
 run('fishingAction()');assert.equal(c.fishing.phase,'result');step(20);run('fishingAction()');assert.equal(c.fishing.phase,'result','Lift animation cannot be skipped by a trailing press');step(20);run('fishingAction()');assert.equal(c.fishing.phase,'aim');
}
assert.equal(saves,6);assert.equal(c.dragonFish,27);
cast();step(50);assert.equal(c.fishing.phase,'result');assert(!c.fishing.caught);assert.match(c.fishing.reason,/bite/);
cast();hook();run('fishingAction()');step(300);assert(!c.fishing.caught);assert.match(c.fishing.reason,/snapped/);
cast();hook();step(115);assert(!c.fishing.caught);assert.match(c.fishing.reason,/slack/);
cast();hook();run('fishingAction()');step(15);const tension=c.fishing.tension;run('fishingRelease()');step(10);assert(c.fishing.tension<tension,'Release relieves tension');
const age=c.fishing.age;run('stepFishing(60)');assert(c.fishing.age-age<=.051,'Suspension cannot fast-forward a fight');
run('endFishing()');assert.equal(c.fishing,null);assert.equal(run('fishingBackdrop'),null);
c.fishingSafe=()=>false;run('startFishing()');assert.equal(c.fishing,null);
console.log('PASS: six fishing regions, cast and hook input guards, live tension control, bonuses, single rewards, missed bites, line breaks, slack, retry, suspension and cancellation.');
