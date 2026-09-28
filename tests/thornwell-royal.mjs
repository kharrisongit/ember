import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),console);
await run('loadPublishedEditorLayouts()');
const spoken=[];const originalScene=c.playScene;
c.playScene=(lines,opts)=>{spoken.push(...lines);return originalScene(lines,opts);};
// Time moves normally; only the player's dialogue taps are automated.
const tick=(frames=1)=>run(`for(let i=0;i<${frames};i++){
 useDoors(1/30);stepScene(1/30);stepWalkers(1/30);stepDragon(1/30);
 if(scene&&!scene.silent&&!scene.hold&&!scene.arriving){typeAll();scene.t=1;advanceScene();}
}`);
run(`mode='play';quest=Q.DONE;dragon.on=true;dragonIntroDone=true;templeCompass.owned=true;templeCompass.meatGiven=true;
for(const [id,m]of Object.entries(W.maps)){prepareMarketNpcCast(m,id);prepareDialoguePortraitCast(m,id)}
loadMap('tavern');brambleQuest=1;thornwellRoyal.stage=1;P.x=250;P.y=250;syncBrambleParty();syncThornwellRoyals();`);
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),4,'Royal party is visible during the handoff');
assert.equal(run('thornwellKing().x'),396,'Royal table is the unoccupied northeast table, not Fen’s table');
assert(run(`npcs.filter(n=>n.thornwellRoyal&&n.n!=='King Halvard').every(n=>n.packSpr.startsWith('royal_intro_guard_')&&!n.packWalk&&!n.packDirections)`),'Ceremonial guard identities use idle art');
run(`var dragonDraws=0;var originalDraw=drawGameImage;drawGameImage=()=>dragonDraws++;drawKingDragon();drawGameImage=originalDraw;`);
assert.equal(run('dragonDraws'),0,'King’s dragon never renders inside the tavern');
assert.equal(run('dragonHere()'),false);
assert.equal(run('setDragonAir(true)'),false,'Flight button cannot recall the absent dragon');
assert.equal(run('thornwellAudiencePending()'),false);
// Every actual resident, plus identities that can be moved by the editor.
const residents=run(`Object.entries(W.maps).flatMap(([map,m])=>(m.npcs||[]).filter(n=>!n.noTalk&&!n.pettable&&!n.editorDeleted&&!n.publishedDeleted&&(/Thornwell|Copper Cup/.test(m.title||'')||(map==='world'&&n.x>=220*TS&&n.x<=322*TS&&n.y>=44*TS&&n.y<=150*TS))).map(n=>({map,n})))`);
const disclose=/Aurelius|your dragon|dragon (travelling|traveling|following|beside|with) you|you (have|brought|and) a dragon|you and (the|your) dragon/i;
for(const {map,n} of residents){
 c.actor=n;c.place=map;
 run('MAPID=place;MD=W.maps[place];sayNpc=null;ask=null;scene=null;');
 for(const alt of [false,true])assert.doesNotMatch(run(`npcContextDialogue(actor,${alt}).join(' ')`),disclose,n.n+' greeting keeps the secret');
 assert.doesNotMatch(JSON.stringify(run('npcStoryTopics(actor)')),disclose,n.n+' topics keep the secret');
 assert.doesNotMatch(JSON.stringify(run('libraryQuestHint(actor)')),disclose,n.n+' school hint keeps the secret');
 run('beginNpcTalk(actor,true)');
 assert.doesNotMatch(run("(sayNpc?.said||scene?.lines||[]).join(' ')"),disclose,n.n+' actual greeting/gift route keeps the secret');
}
run(`MAPID='tavern';MD=W.maps.tavern;scene=null;ask=null;sayNpc=null;`);
const firstLinna=run("npcContextDialogue({n:'Linna',d:['Hello']},false).join(' ')");
run('thornwellRoyal.stage=7');assert.notEqual(run("npcContextDialogue({n:'Linna',d:['Hello']},false).join(' ')"),firstLinna);
run('thornwellRoyal.stage=1');
// Actual save and load keeps the dragon separated and reconstructs the cast.
run('saveToSlot(3,true);thornwellRoyal.stage=7');assert(run('loadGame(3)'));
assert.equal(run('thornwellRoyal.stage'),1);assert.equal(run('dragonHere()'),false);
run('syncBrambleParty();syncThornwellRoyals();');
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),4);
run(`tryBrambleReunion(npcs.find(n=>n.n==='Rowan the Hunter'));`);
tick(800);
assert.equal(run('brambleQuest'),3,'Rowan and Bramble leave before the summons');
assert.equal(run('thornwellRoyal.stage'),3);
assert(run('thornwellAudiencePending()'),'The exit waits for the mandatory audience');
assert(run('ask?.conversationPrompt'),'The king’s opening scene waits for confirmation before full conversation');
run("askPick=ask.opts.findIndex(o=>o.n==='Talk');askTake()");
assert.equal(run('ask?.npcConversation'),'King Halvard');
assert(run('Math.hypot(P.x-thornwellKing().x,P.y-thornwellKing().y)<55'),'Corin actually walks to the corner table');
assert(spoken.some(s=>s.includes('boy with the eggs')));
assert(!spoken.some(s=>s.includes('hear you have a dragon')));
let choices=0;
for(const name of ['King Halvard','Serjeant Bram','Doran','Tolan']){
 c.royalName=name;
 run('openThornwellAudience(npcs.find(n=>n.thornwellRoyal&&n.n===royalName))');
 const titles=Array.from(run('ask.opts.filter(o=>o.go&&!o.navigation&&!o.head).map(o=>o.n)'));
 assert(titles.length>=(name==='King Halvard'?6:3),name+' has distinct topics');
 for(const title of titles){
  c.topicTitle=title;
  run('openThornwellAudience(npcs.find(n=>n.thornwellRoyal&&n.n===royalName));askPick=ask.opts.findIndex(o=>o.n===topicTitle);askTake();');tick(30);
  if(run("ask?.topicScope!=='thornwell-audience'")){
   const replies=Array.from(run('ask.opts.filter(o=>o.go&&!o.navigation&&!o.head).map(o=>o.n)'));
   assert.equal(replies.length,3);
   for(const reply of replies){
    c.replyTitle=reply;
    run('openThornwellAudience(npcs.find(n=>n.thornwellRoyal&&n.n===royalName));askPick=ask.opts.findIndex(o=>o.n===topicTitle);askTake();');tick(30);
    run('askPick=ask.opts.findIndex(o=>o.n===replyTitle);askTake();');tick(30);choices++;
    assert.equal(run('ask.topicScope'),'thornwell-audience','Answer returns to the speaker’s topics');
   }
  }
 }
}
assert.equal(choices,12,'Four branching exchanges with three responses apiece');
run(`thornwellRoyal.answers.tax='defiant';openThornwellAudience(thornwellKing());askBack();`);
assert.equal(run('thornwellRoyal.stage'),3,'Back stays at the royal topic list');
run(`askPick=ask.opts.findIndex(o=>o.n==='Ask leave to go');askTake();`);tick(30);
assert.equal(run('thornwellRoyal.stage'),4,'Goodbye dismisses the audience safely');
assert.equal(run('thornwellAudiencePending()'),false,'Dismissal unlocks the tavern exit');
assert(spoken.some(s=>s.includes('finishing your thoughts aloud')),'Choices affect the dismissal');
assert.equal(run('atlasMainObjective().title'),'Leave the Copper Cup');
run('atlasSyncJournal();saveToSlot(3,true)');
assert.equal(run('captureSave().thornwellRoyal.answers.tax'),'defiant');
// Legacy saves past Bramble must not be pulled backwards into a new scene.
run('restoreThornwellRoyal(null,{brambleQuest:3})');assert.equal(run('thornwellRoyal.stage'),7);
run('restoreThornwellRoyal(null,{brambleQuest:1})');assert.equal(run('thornwellRoyal.stage'),1);
run('restoreThornwellRoyal({stage:3,answers:{tax:"defiant"}})');assert.equal(run('thornwellRoyal.stage'),2);
assert.equal(run('thornwellRoyal.answers.tax'),'defiant');
assert(run('loadGame(3)'));run('scene=null;ask=null;sayNpc=null;');
console.log(`PASS: ${residents.length} residents keep Aurelius secret; four royals, 12 branches, forced approach, real save/load and legacy migration.`);
// Use real published outdoor collision, exits and landmarks for all motion.
console.log('Checking the published outdoor route…');
run(`loadMap('world');const royalExit=W.maps.tavern.doors.find(d=>d.to==='world');P.x=royalExit.tx*TS+8;P.y=royalExit.ty*TS+TS;cam.x=P.x-200;cam.y=P.y-150;thornwellDoorArrived('tavern');`);
assert.equal(run('thornwellRoyal.stage'),5);
assert.deepEqual(Array.from(run(`MD.roomActors.filter(a=>/^tavern_patio_table_/.test(a.spr)).map(a=>a.x)`)),[3814.5,3846.5,3990.5,4022.5],'Outdoor tables are moved two tiles away from the entrance path');
assert(run(`canStand(3913,1068)&&canStand(3913,1080)`),'The actual entrance corridor stays walkable');
const before=run('[P.x,P.y]');
run('thornwellDeparture()');
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),0,'Party does not appear before black');
run('useDoors(2)');assert.equal(run('fade'),1);
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),4,'Party appears at full black');
assert(run('npcs.filter(n=>n.thornwellRoyal).every(n=>!n.moving&&!n.path&&!n.goto)'));
run('dragonDraws=0;drawGameImage=()=>dragonDraws++;drawKingDragon();drawGameImage=originalDraw');
assert.equal(run('dragonDraws'),1,'King’s dragon is present with him outdoors');
tick(200);
assert.equal(run('thornwellRoyal.stage'),6,'All royals leave and unlock the urgent objective');
assert.notDeepEqual(Array.from(run('[P.x,P.y]')),Array.from(before),'The player is physically moved aside');
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),0);
assert.equal(run('dragonHere()'),false,'Aurelius stays absent after the royal departure');
assert.equal(run('atlasMainObjective().place'),'Forgefalls');
assert(spoken.includes('Serjeant Bram: Make way for royalty!'));
assert(spoken.includes('Out of my way, boy!'));
assert(spoken.some(s=>s.includes('past Forgefalls and back to Cinderhold')));
run('restoreThornwellRoyal(captureThornwellRoyal());');tick(5);assert.equal(run('thornwellRoyal.stage'),6,'Reloaded departure does not repeat');
run(`const meeting=thornwellForgefalls();P.x=meeting.x;P.y=meeting.y;dragon.hp=4;`);tick(80);
assert.equal(run('thornwellRoyal.stage'),7);assert(run('dragonHere()'));
assert.equal(run('dragon.hp'),4,'Reunion does not heal or reset dragon progress');
assert(run("atlasQuestComplete('thornwell-royals')"));
assert(spoken.some(s=>s.includes('I saw them pass')));
const linesAfter=spoken.length;tick(100);assert.equal(spoken.length,linesAfter,'Reunion plays once');
// Departure animation: ownership stays intact; normal following cannot pull
// the dragon back to Corin while the flight is in progress or after it ends.
run(`restoreThornwellRoyal({stage:0});brambleQuest=1;P.x=230*TS;P.y=100*TS;dragon.x=P.x+28;dragon.y=P.y;dragon.hp=dragon.maxHp;beginThornwellDetour();`);
const xBefore=run('dragon.x');tick(900);
assert.equal(run('thornwellRoyal.stage'),1);assert.equal(run('thornwellFlight'),null);
assert(run('dragon.x')>xBefore+250);assert(run('hasDragon()'));assert.equal(run('dragonHere()'),false);
assert.equal(run('atlasMainObjective().title'),'Return Bramble quietly');
run('skipBrambleForTest()');assert.equal(run('thornwellRoyal.stage'),7);assert(run('dragonHere()'));
run('devUnlocked=true');assert(run('replayThornwellForTest()'));assert.equal(run('thornwellRoyal.stage'),0);assert(run('brambleWelcomeInside()'));
assert(run('welcomePath()'),'The replay position has a real approach even beside the town fence');
tick(1200);
assert.equal(run('brambleQuest'),1,'Bramble actually reaches Corin');
assert.equal(run('thornwellRoyal.stage'),1,'The real Bramble arrival starts the detour');
assert.equal(run('dragonHere()'),false,'The entire replay opening finishes with Aurelius away');
console.log('PASS: northeast table, original idle guards, indoor dragon exclusion, wider patio, two royal blackouts, Forgefalls reunion, completed journal, discreet flight and developer skip.');
