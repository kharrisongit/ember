import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {context:c,run}=await loadEditorGame();
// Use prepared map identities: the library pupil is Tamsin, the upstairs
// scholar is Brin, and the tavern musician is Puck. Retired actors are excluded.
run(`for(const [id,m] of Object.entries(W.maps)){prepareHollybeckVillagers(m,id);prepareDialoguePortraitCast(m,id);}`);
const cast=run(`Object.values(W.maps).flatMap(m=>m.npcs||[]).filter(n=>!n.pettable&&!n.noTalk&&!n.editorDeleted&&!n.publishedDeleted)`);
const profiles=run('NPC_WORLD_TALKS');
const names=[...new Set(cast.map(n=>n.n))];
for(const name of names)if(name!=='King Halvard')assert(profiles[name],name+' has an opinion of Halvard');
assert.deepEqual(JSON.parse(fs.readFileSync('assets/dialogue/npc-world-talks.json')),JSON.parse(JSON.stringify(profiles)),'Authored source matches shipped dialogue');
const distinct=new Set();
for(const [name,p] of Object.entries(profiles)){
 assert.equal(p.halvard.length,2,name+' has both stages');
 for(const text of p.halvard){assert(text.length>35);assert(!distinct.has(text),name+' repeats another opinion');distinct.add(text);}
 if(p.history){assert.equal(p.history.length,4);for(const text of [p.history[1],p.history[3]]){assert(!distinct.has(text),name+' repeats history');distinct.add(text);}}
}
run(`quest=Q.NOISE;templeCompass.owned=true;templeCompass.meatGiven=true;fishingPole=true;odoRodReferral=true;glassShield=true;smithUpgrade=true;charm.edge=true;brambleQuest=3;dragon.on=true;`);
// Normal journey: outside Millwood the egg has already hatched. Test the
// companion both beside the speaker and waiting outside an interior.
run(`quest=Q.DONE;dragonOff=false;`);
const saved={playScene:c.playScene,askDraw:c.askDraw,faceToward:c.faceToward};
let spoken=null;c.playScene=(lines,options)=>{spoken={lines,options};};c.askDraw=()=>{};c.faceToward=()=>{};
for(const victory of [false,true]){
 c.victory= victory;run('wonAll=victory');
 for(const npc of cast){
  if(npc.n==='King Halvard')continue;
  c.actor=npc;run(`MAPID='world';if(actor.charm)charm[actor.charm]=true;if(actor.gift)breathHas[actor.gift]=true;dragon.x=actor.x;dragon.y=actor.y;`);
  assert(run('openNpcTopics(actor)'),npc.n+' menu');
  const opts=run('ask.opts');
  const label=victory?'After Halvard’s defeat':'King Halvard';
  assert.equal(opts.filter(o=>o.n===label).length,1,npc.n+' one political topic');
  assert(!opts.some(o=>['Life after Halvard','Another thing I meant to ask','A dragon on the road','How are things?'].includes(o.n)));
  opts.find(o=>o.n===label).go();
  assert.equal(Array.from(spoken.lines,line=>line.slice(npc.n.length+2)).join(' '),profiles[npc.n].halvard[victory?1:0]);
  assert.equal(spoken.options.npcActor,npc,'Speaker survives choosing topic');
  const greeting=run('npcContextDialogue(actor,false)');assert.notDeepEqual(Array.from(greeting),Array.from(spoken.lines),'Politics do not duplicate Hello');
  if(profiles[npc.n].history){
   run('openNpcTopics(actor)');run('ask.opts').find(o=>o.n===profiles[npc.n].history[0]).go();
   assert.equal(spoken.lines.length,3);assert(spoken.lines[1].startsWith('Corin: '));
  }
 }
}
// The real early-game gates apply only to Millwood and the initial quest.
run(`wonAll=false;quest=Q.NOISE-1;`);
assert.equal(run(`openNpcTopics({n:'Hettie'})`),false,'Egg errand comes before optional chats');
assert.equal(run(`npcStoryTopics({n:'Nan Ferrow'}).length`),0,'Nan personal stories wait for hatching');
run(`quest=Q.DONE;MAPID='world';brambleQuest=0;`);
// Corrected hatch history, standalone exchanges and outdoor positioning.
for(const name of ['Pip','Mycella','Truffle','Orin','Hask','Bevan','Marek']){
 c.actor={n:name,x:0,y:0,d:['Old'],dd:['Old']};run('dragon.x=0;dragon.y=0');
 const lines=run('npcContextDialogue(actor,false)');assert(!lines.includes('Old'),name+' uses audited greeting');
 assert(!lines.some(l=>/hurt when I found|one from the field|Out, out|Keep it by the door/.test(l)),name+' no obsolete scene');
}
c.actor={n:'Linna',x:0,y:0,d:['Old'],dragonRumor:['duplicated line']};run("MAPID='house01'");
assert.match(run('npcContextDialogue(actor,true).join(" ")'),/waiting outside/);
for(const [name,key] of [['Fen','twin'],['Rashida','brand'],['The Shroom King','spore']]){
 c.actor={n:name,charm:key,x:0,y:0,d:['Old'],dd:['Old']};run("wonAll=true;brambleQuest=1;MAPID='tavern';charm[actor.charm]=false;");
 run('beginNpcTalk(actor,true)');assert.equal(run('sayNpc.said.length'),name==='Fen'?4:3,name+' first gift explained even after victory or during another quest');
 run('wonAll=false;charm[actor.charm]=true;brambleQuest=3');
 assert(!run('npcContextDialogue(actor,false).some(l=>/Take this|Take a spore/.test(l))'),name+' no repeated gift offer');
}
// Completed quest hints must acknowledge the reward, not send Corin to get it again.
for(const [name,key] of [['Mira','lamp'],['Oren','wake'],['Tamsin','ward']]){
 c.hintName=name;c.hintKey=key;run('charm[hintKey]=false');const before=run('libraryQuestHint({n:hintName})');
 run('charm[hintKey]=true');const after=run('libraryQuestHint({n:hintName})');assert.notEqual(before.title,after.title);assert.notDeepEqual(Array.from(before.lines),Array.from(after.lines));
}
assert.doesNotMatch(run("libraryQuestHint({n:'Mira'}).lines.join(' ')"),/equip/i,'Lantern works by carrying it');
run('breathHas.lightning=true;breathHas.ice=true;breathHas.shadow=true');assert.equal(run("libraryQuestHint({n:'Brin'}).title"),'The three Heartstones');
Object.assign(c,saved);
console.log(`PASS: ${names.length} prepared NPC identities; 142 unique opinions before/after victory, 31 histories, real story gates, gift timing, completed hints and hatch continuity.`);
// Roadwork reports and the first personal topic both update once the route opens.
for(const name of ['Cartwright Oswin','Miner Marn','Miner Nerik','Snowbuilder Nessa']){
 c.actor={n:name,d:['Work in progress.']};
 run('wonAll=false;brambleQuest=0;breathHas.lightning=false;breathHas.ice=false;breathHas.shadow=false');
 assert.equal(run('npcFinishedRoadwork(actor)'),null);
 run('wonAll=true');assert(run('npcFinishedRoadwork(actor)'));
 assert.equal(run('npcStoryTopics(actor)[0].title'),profiles[name].roadwork[1]);
 assert.equal(run('npcContextDialogue(actor,false)[0]'),name+': '+profiles[name].roadwork[2]);
}
c.actor={n:'Truffle',d:['Hello'],dv:['Welcome'],dv2:['I felt that first landing in the north field.']};run('wonAll=true');
assert.doesNotMatch(run('npcContextDialogue(actor,true).join(" ")'),/landing|field/);
assert(run('DRAGON_LONG_TALKS.self().some(line=>line.includes("feel at home again"))'));
console.log('PASS: reopened roads, post-victory hatch continuity, and Aurelius future dialogue.');
