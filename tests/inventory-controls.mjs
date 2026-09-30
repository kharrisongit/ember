import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:false});
run("quest=Q.ERRAND;bagOwned=false;gameplayStarted=true;mode='play';EmberRiding.skip();");
run("setOvl('itemm')");assert.equal(run('inventoryPromptOpens'),0,'A locked bag does not consume a hint');
run('quest=Q.DONE;bagOwned=true');
let saved,saveCount=0;c.saveGame=()=>{saved=JSON.parse(run('JSON.stringify(captureSave())'));saveCount++;};
const button=dom.element('itemFullBtn');
for(let i=1;i<=10;i++){
 run("setOvl('itemm')");assert(button.classList.contains('inventory-intro'),'Opening '+i+' glows and shakes');
 assert.equal(run('inventoryPromptOpens'),i);assert.equal(saved.inventoryPromptOpens,i);
 run("refreshOvl();setOvl('itemm')");assert.equal(run('inventoryPromptOpens'),i,'Redrawing is not another opening');
 run('setOvl(null)');assert(!button.classList.contains('inventory-intro'),'Closing removes the animation');
}
run("setOvl('itemm')");assert(!button.classList.contains('inventory-intro'),'Opening eleven is still distinct but no longer animated');
assert.equal(saveCount,10,'Only the first ten new openings save the hint count');
c.savedState=saved;run('setOvl(null);restoreInventoryPrompt(savedState);setOvl("itemm")');
assert.equal(run('inventoryPromptOpens'),10);assert(!button.classList.contains('inventory-intro'),'Saving/loading does not restart the first ten');
run('setOvl(null);restoreInventoryPrompt({})');assert.equal(run('inventoryPromptOpens'),0,'Older save slots start their own ten hints');
for(const [value,expected]of [[-2,0],[4.9,4],[99,10],[Infinity,0]]){
 c.counter=value;run('restoreInventoryPrompt({inventoryPromptOpens:counter})');assert.equal(run('inventoryPromptOpens'),expected);
}
run("setOvl('itemm')");dom.dispatch(button,'click');assert(run('bagOpen'));assert.equal(run('ovl'),null);
assert(!button.classList.contains('inventory-intro'));
for(const [id,target]of [['bagSave','savePrompt'],['bagMusic','sound'],['itemSaveBtn','savePrompt'],['itemMusicBtn','sound']]){
 run(id.startsWith('bag')?'setBag(true)':"setBag(false);setOvl('itemm')");
 dom.dispatch(dom.element(id),'click');assert.equal(run('ovl'),target,id+' keeps its existing action');assert(!run('bagOpen'));
 run('setOvl(null)');
}
const html=fs.readFileSync('index.html','utf8');
for(const [id,label]of [['bagSave','Save game'],['bagMusic','Music'],['itemSaveBtn','Save game'],['itemMusicBtn','Music']]){
 const markup=html.match(new RegExp('<button id="'+id+'"[^>]*>[\\s\\S]*?</button>'))?.[0];
 assert(markup.includes('aria-label="'+label+'"'));assert(markup.includes('<svg'));assert(!/>SAVE<|>MUSIC</.test(markup));
}
console.log('PASS: first ten bag openings only, saved hint count and legacy slots, full inventory navigation, and accessible Save/Music icon actions.');
