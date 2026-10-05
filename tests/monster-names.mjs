import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context}=await loadEditorGame(process.cwd(),{log(){},warn(){}});
context.assert=assert;
context.expectedNames={plant2:'Thornlash Vinemaw',ent1:'Briar Ent',ent2:'Ironbark Ent',ent:'Elder Ent',gnoll1:'Snowfang Gnoll',gnoll2:'Frostclaw Gnoll',gnoll3:'Direfang Gnoll',eyeRed:'Ember Eye',eye2:'Blazing Eye',eyePurple:'Dread Eye',spiderqueen:'Velyss, the Broodmother',frosthorn:'Hroth, the Winter Beast',icemoth:'Veilwing',devil1:'Cinder Imp',devil3:'Dreadfiend',skeleton1:'Risen Swordsman',skeleton3:'Crypt Warden',mage1:'Ash Mage',mage2:'Hexweaver',golem4:'Stone Golem',golem1:'Sand Golem',golem2:'Ice Golem',golem3:'Fire Golem'};
run(`
for(const [key,name]of Object.entries(expectedNames)){assert.equal(BESTIARY.find(e=>e.k===key)?.n,name);assert(FOE[key],'Stable enemy ID remains valid: '+key);}
restoreQuestJournal({tracked:'frosthorn',discovered:['Spider Queen','Frosthorn','Ice Moth'],encounteredBosses:['Spider Queen','Frosthorn','Ice Moth'],known:{frosthorn:{title:'Defeat Frosthorn',place:'Frosthorn',detail:'Find Frosthorn on the winter trail.'}}});
for(const name of ['Velyss','Hroth','Veilwing']){assert(atlasPlaceKnown(name));assert(atlasEncounteredBosses.has(name));assert.equal(atlasDisplayName(name),name);}
assert.equal(atlasJournalKnown.frosthorn.place,'Hroth');assert.equal(atlasJournalKnown.frosthorn.title,'Defeat Hroth');assert.equal(atlasTrackedQuest,'frosthorn');
restoreQuestJournal(null);assert(!atlasPlaceKnown('Veilwing'));assert.equal(atlasDisplayName('Veilwing'),'Frozen Glade');
assert.equal(typeof Frosthorn.defeatedAlready,'function');assert.equal(typeof IceMoth.defeatedAlready,'function');
`);
console.log('PASS: all 23 approved enemy names, stable gameplay IDs, old map/quest migration, and unencountered boss secrecy.');
