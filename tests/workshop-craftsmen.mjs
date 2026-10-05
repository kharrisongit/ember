import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const draw=[];
const c=vm.createContext({sayNpc:null,scene:null,ask:null,MAPID:'smithy',
  window:{EmberConversationFlow:{partner:()=>null}},ctx:{imageSmoothingEnabled:true},
  SPR:{glassnew_anim_4:[0,47104,64,80,45]},sheetOf:()=>({native:true}),
  drawGameImage:(...args)=>draw.push(args),Image:class{async decode(){}}});
c.loadStartupImage=async src=>({src});
const run=s=>vm.runInContext(s,c);
run(read('js/workshop-craftsmen.js'));await run('loadWorkshopCraftsmen()');
run("var smith={spr:'smithy_anim_8',x:200.25,y:192.25},sela={spr:'glassnew_anim_4',x:160,y:176}");
assert(run('drawWorkshopCraftsman(smith,.751)'));
assert.equal(draw.at(-1)[2],8*96,'Original .15 second cadence, starting at the first hammer stroke');
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
assert.equal(draw.at(-1)[2],21*96,'Conversation first finishes the in-progress hammer stroke');
for(const [time,frame]of [[10.751,26],[10.901,27],[11.051,40],[11.201,41]]){
  run(`drawWorkshopCraftsman(smith,${time})`);
  assert.equal(draw.at(-1)[2],frame*96,'Lower the hammer once after the final strike');
}
run('drawWorkshopCraftsman(smith,11.351)');
assert.equal(draw.at(-1)[1],run('workshopImages.idle'),'Conversation holds idle after putting the hammer down');
assert.equal(run('workshopAnimation(smith,14.551,true).frame'),3,'Blink is brief and reachable');
assert.equal(run('workshopAnimation(smith,14.851,true).frame'),0,'Rest pose returns after blink');
assert.equal(run('workshopAnimation(smith,60,true).action'),'idle','Long conversations do not repeat the put-down');
run('sayNpc=null;drawWorkshopCraftsman(smith,15)');
assert.equal(draw.at(-1)[1],run('workshopImages.work'));
assert.equal(draw.at(-1)[2],0,'Leaving starts the one-time pickup');
for(const [time,frame]of [[15.151,1],[15.301,2],[15.451,3]]){
  run(`drawWorkshopCraftsman(smith,${time})`);assert.equal(draw.at(-1)[2],frame*96);
}
for(let i=0;i<120;i++){
  const pose=run(`workshopAnimation(smith,${15.451+i*.15},false)`);
  assert.equal(pose.action,'work');assert.equal(pose.frame,3+i%24,'Continuous strokes never put the hammer down');
}
run("var interrupted={spr:'smithy_anim_8'};workshopAnimation(interrupted,0,true);workshopAnimation(interrupted,2,false);workshopAnimation(interrupted,2.151,true)");
assert.equal(run('workshopAnimation(interrupted,2.152,true).frame'),1,'Reopening during pickup lowers the tool safely');
assert.equal(run('workshopAnimation(interrupted,2.452,true).action'),'idle');

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
console.log('PASS: continuous hammer strokes, one-time put-down/pickup, conversation holds, workshop art, Sela’s native loop and Rowan’s shield referral.');
