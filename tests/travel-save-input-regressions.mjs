import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),events={};
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{
  furniture:false,document:dom.document,windowEvents:(type,fn)=>(events[type]??=[]).push(fn)
});
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
const key=(key,target=c.document.body)=>{
  const e={key,target,preventDefault(){this.defaultPrevented=true;},stopPropagation(){},stopImmediatePropagation(){this.stopped=true;}};
  for(const fn of events.keydown||[]){fn(e);if(e.stopped)break;}return e;
};
run(`mode='play';gameplayStarted=true;quest=Q.DONE;bagOwned=true;loadMap('house22');P.x=128;P.y=192;
window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEquipmentTutorial=undefined;window.EmberConversationFlow=undefined;
scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;bagOpen=false;foes=[];arenaLock=null;fadeDir=0;doorMotion=null;bossScene=null;
P.act=null;arriveT=0;pHp=pMax=6;deadShown=false;mounted=false;ride=null;fishing=null;devSafe=false;foesHeld=false;hatchExit=false;hatchCamera=null;`);
for(const back of ['b','Escape']){
  run('setBag(true)');key(back);assert(!run('bagOpen||running||glassShieldHeld'));
  for(const menu of ['itemm','sound','savePrompt']){
    run(`setOvl('${menu}')`);key(back);assert.equal(run('ovl'),null,menu+' closes with '+back);
    assert(!run('running||glassShieldHeld'),'Back never starts sprint or block');
  }
}
run('setBag(true);potions=3;elixirs=2');key('ArrowRight');assert.equal(run('bagPick'),1);
assert(!run('keys.arrowright'),'Menu navigation does not become walking input');
run('setBag(false);setOvl("savePrompt")');key('ArrowDown');assert.equal(run('MENUS.savePrompt.pick'),1);
const button=c.document.createElement('button');
for(const k of ['Enter',' '])assert(!key(k,button).defaultPrevented,'Focused buttons retain native activation');
run('setOvl("sound")');const volume=c.document.createElement('input');volume.type='range';
for(const k of ['ArrowLeft','ArrowRight'])assert(!key(k,volume).defaultPrevented,'Volume sliders retain native arrow controls');
key('Escape',volume);assert.equal(run('ovl'),null,'Escape still closes a menu from its slider');
run('setOvl(null);saintT=0;breaths=0;saveToSlot(1,true);breaths=1;useSaint();saveToSlot(2,true)');
assert.equal(run('saintT'),16,'Saving must not cancel an active effect');
run('wakeCool=24;bell={x:100,y:100,t:12};breathCooldown.fire=12;loadGame(1)');
assert.deepEqual(json('[saintT,wakeCool,bell,breathCooldown.fire,breaths]'),[0,0,null,0,0]);
run('hurtPlayer(2)');assert.equal(run('pHp'),4,'The loaded adventure cannot inherit immunity');
console.log('PASS: keyboard Back/navigation, native button activation, and temporary combat-state isolation on load.');

// A short ferry route in the normal save/load room keeps this test fast.
// The full published-world crossing is also exercised during manual validation.
run(`pHp=6;P.act=null;P.x=128;P.y=192;ovl=null;
MD.ferry={boat:'hb_rowboat',a:[7.5,10],b:[16,10],land_a:[7.5,11],land_b:[16,11],pts:[[7.5,10],[16,10]]};
objs.push({id:900001,s:NAME2I.hb_rowboat,x:128,y:176});`);
assert(run('ferryTry()'));assert(run('hidden.has(900001)'));
run('for(var i=0;i<35;i++)stepFerry(.05)');assert(run('!!ride&&P.x!==128'));
run('inventoryPromptOpens=0;setOvl("itemm")');
assert.deepEqual(json('[readSaveSlot(1).x,readSaveSlot(1).y]'),[128,192],'Mid-crossing autosave keeps the departure point');
const saved=json('readSaveSlot(1)');
assert(run('loadGame(1)'));assert(!run('ride||hidden.has(900001)'),'Loading cancels the old ride and restores the boat');
assert.deepEqual(json('[P.x,P.y]'),[128,192]);
const cold=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});cold.context.saved=saved;
cold.run('localStorage.setItem(saveKey(1),JSON.stringify(saved))');assert(cold.run('loadGame(1)'));
assert(cold.run('ride===null&&P.x===128&&P.y===192&&canStand(P.x,P.y)'),'Cold reload returns to walkable land');
console.log('PASS: a ferry inventory autosave reloads at its safe departure in both the current and a fresh engine.');
