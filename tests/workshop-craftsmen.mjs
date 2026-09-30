import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const draw=[];
const c=vm.createContext({sayNpc:null,scene:null,ask:null,MAPID:'smithy',
  window:{EmberConversationFlow:{partner:()=>null}},ctx:{imageSmoothingEnabled:true},
  SPR:{glassnew_anim_4:[0,47104,64,80,45]},sheetOf:()=>({native:true}),
  drawGameImage:(...args)=>draw.push(args),Image:class{async decode(){}}});
const run=s=>vm.runInContext(s,c);
run(read('js/workshop-craftsmen.js'));await run('loadWorkshopCraftsmen()');
run("var smith={spr:'smithy_anim_8',x:200.25,y:192.25},sela={spr:'glassnew_anim_4',x:160,y:176}");
assert(run('drawWorkshopCraftsman(smith,.751)'));
assert.equal(draw.at(-1)[2],5*96,'Original .15 second work cadence');
assert.deepEqual(draw.at(-1).slice(-4),[176,144,48,70],'Complete station drawn from the original worker anchor, including the bench front');
assert.equal(draw.at(-1)[5],140,'Source frame includes the whole station, not just the upper 48px');
assert.equal(run("workshopImages.work.src"),'assets/sprites/workshops/dunstan-work.png?v=20260930-complete-station');

for(const state of ["sayNpc={n:'Dunstan'}", "scene={npcActor:{n:'Dunstan'}}", "scene={who:'Dunstan'}",
  "ask={npcActor:{n:'Dunstan'}}", "ask={npcConversation:'Dunstan'}", "window.EmberConversationFlow.partner=()=> 'Dunstan'"]){
  run('sayNpc=null;scene=null;ask=null;window.EmberConversationFlow.partner=()=>null');run(state);
  assert(run("workshopIsTalking('Dunstan')"),state);
  assert(!run("workshopIsTalking('Sela')"),'Other craftsman is unaffected');
}
run("sayNpc={n:'Dunstan'};window.EmberConversationFlow.partner=()=>null;drawWorkshopCraftsman(smith,10)");
assert.equal(draw.at(-1)[1],run('workshopImages.idle'),'Conversation replaces work sheet');
assert.equal(run('workshopAnimation(smith,13.2,true).frame'),3,'Blink is brief and reachable');
assert.equal(run('workshopAnimation(smith,13.5,true).frame'),0,'Rest pose returns after blink');
run('sayNpc=null;drawWorkshopCraftsman(smith,15)');
assert.equal(draw.at(-1)[1],run('workshopImages.work'));
assert.equal(draw.at(-1)[2],0,'Leaving restarts at the resting tool pose');
run('drawWorkshopCraftsman(smith,21.151)');assert.equal(draw.at(-1)[2],41*96);
run('drawWorkshopCraftsman(smith,21.301)');assert.equal(draw.at(-1)[2],0,'All 42 frames loop');

run("MAPID='glasswork';sayNpc={n:'Sela'};drawWorkshopCraftsman(sela,20)");
assert.equal(draw.at(-1)[2],0);assert.equal(draw.at(-1)[3],47104,'Sela keeps native table/artwork');
run('drawWorkshopCraftsman(sela,23.2)');assert.equal(draw.at(-1)[2],39*64);
run('sayNpc=null;drawWorkshopCraftsman(sela,25)');assert.equal(draw.at(-1)[2],0);
run('drawWorkshopCraftsman(sela,31.601)');assert.equal(draw.at(-1)[2],44*64,'Native 45-frame glasswork loop retained');
assert(!run('drawWorkshopCraftsman(smith,32)'),'Map identity prevents unrelated actor overrides');

// Execute Rowan's authored referral and the same knowledge hook used by typeStart.
const game=read('js/generated/game-part-2.js');
run(`var npcs=[],P={x:0,y:0},brambleQuest=1,smithUpgrade=false,glassShield=false;
  function faceToward(){};function faceCorinAt(){};function playScene(lines){scene={lines}};MAPID='tavern';`);
run(game.slice(game.indexOf('function tryBrambleReunion('),game.indexOf('function planBrambleDeparture(')));
assert(run("tryBrambleReunion({n:'Rowan the Hunter'})"));
const clue=run("scene.lines.find(line=>line.includes('visit Sela'))");
assert.match(clue,/Forgewick.*workshop behind the glass shop.*Ask him.*Glass Shield/);
const dragon=read('js/dragon-dialogue.js');
run('var dragonBanterSeen=new Set();function persistDragonBanterSeen(){}');
run(dragon.slice(dragon.indexOf('function dragonLearned('),dragon.indexOf('function dragonGiftLeads')));
c.clue=clue;run("rememberDragonKnowledge('Rowan',clue)");
assert(run("dragonLearned('shield')"),'Hearing the clue unlocks the real saved journal lead');
run("glassShield=true;tryBrambleReunion({n:'Rowan the Hunter'})");
assert(run("scene.lines.some(line=>line.includes('That Glass Shield is Sela’s work. He'))"),'Already owned shield is acknowledged');
console.log('PASS: workshop art, all work frames, conversation/menu holds, brief idles, map isolation, safe resume and Rowan’s shield referral.');
