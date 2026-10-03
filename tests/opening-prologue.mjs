import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {gameDom} from './helpers-game-dom.mjs';

// Exercise the real BOOT methods, especially the explicit new-game distinction:
// a save from the bedroom is still a Continue, even with its opening quest flag.
const source=fs.readFileSync(new URL('../js/generated/game-part-3.js',import.meta.url),'utf8');
const boot=source.slice(source.indexOf('const BOOT = {'),source.indexOf('const MENUS ='));
const dom=gameDom(),events=[];
let finishPrologue;
const c=vm.createContext({console,performance,setTimeout,clearTimeout,setInterval:()=>0,clearInterval(){},
  document:dom.document({}),gameplayReady:true,gameplayStarted:false,
  clearPadInputs(){events.push('clear-input');},startMorning(){events.push('morning');},
  loadGame(){events.push('load');return true;},readSaveSlot:()=>({when:1}),SAVE_SLOT_COUNT:3,
  EmberPrologue:{play(){events.push('prologue');return new Promise(resolve=>finishPrologue=resolve);}},
  EmberTitleAudio:{fadeOut:async()=>events.push('fade-out'),fadeIn:async()=>events.push('fade-in'),finish:()=>events.push('audio-finish')}
});
c.window=c;
const run=text=>vm.runInContext(text,c);
run(boot);
run('BOOT.pause=async()=>{};bootBind();');
const settle=()=>new Promise(setImmediate);
function reset(){
  events.length=0;finishPrologue=null;
  run('gameplayReady=true;gameplayStarted=false;BOOT.menuOpen=true;BOOT.loading=false;BOOT.transitioning=false;BOOT.menuOrder=["bootNew","bootContinue","bootLoad"];BOOT.menuPick=0;');
}
async function finishNew(){
  await settle();
  assert(events.includes('prologue'));
  assert.equal(run('gameplayStarted'),false,'No gameplay beneath the prologue');
  assert.equal(run('window.__titleTransition'),true);
  assert(!events.includes('morning'),'Bedroom dialogue waits for completion or Skip');
  assert(!events.includes('fade-out'),'Title music remains under the history');
  finishPrologue();await settle();
  assert.equal(run('gameplayStarted'),true);
  assert.equal(run('window.__titleTransition'),false);
  assert(events.indexOf('prologue')<events.indexOf('fade-out'));
  assert(events.indexOf('fade-in')<events.indexOf('morning'));
  assert.equal(events.filter(x=>x==='morning').length,1);
}
reset();dom.dispatch(dom.element('bootNew'),'click');await finishNew();
reset();run('BOOT.activate()');await finishNew();
reset();run('BOOT.continueGame()');await settle();
assert(events.includes('load'));assert(!events.includes('prologue'));assert(run('gameplayStarted'));
reset();run('BOOT.loading=true;BOOT.takeLoad(0)');await settle();
assert(events.includes('load'));assert(!events.includes('prologue'));assert(run('gameplayStarted'));
reset();c.EmberPrologue=undefined;await run('BOOT.close({newGame:true})');
assert(run('gameplayStarted'),'Missing optional prologue script cannot block startup');
assert(!events.includes('prologue'));
console.log('PASS: touch and keyboard New Game await the prologue; Continue/Load bypass it; music and morning handoff remain ordered; optional-script failure is non-blocking.');
