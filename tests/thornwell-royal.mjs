import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),console,{document:gameDom().document});
await run('loadPublishedEditorLayouts()');
const spoken=[];const originalScene=c.playScene;
c.playScene=(lines,opts)=>{spoken.push(...lines);return originalScene(lines,opts);};
// Time moves normally; only the player's dialogue taps are automated.
const tick=(frames=1)=>run(`for(let i=0;i<${frames};i++){
 useDoors(1/30);stepScene(1/30);stepWalkers(1/30);stepDragon(1/30);
 if(scene&&!ask?.replyChoices&&!scene.silent&&!scene.hold&&!scene.arriving){typeAll();scene.t=1;if(scene.conversationReplies)EmberConversationFlow.advance();else advanceScene();}
}`);
run(`EmberFriendship.restore({tutorialSeen:true});mode='play';quest=Q.DONE;dragon.on=true;dragonIntroDone=true;templeCompass.owned=true;templeCompass.meatGiven=true;
for(const [id,m]of Object.entries(W.maps)){prepareMarketNpcCast(m,id);prepareDialoguePortraitCast(m,id)}
loadMap('tavern');brambleQuest=1;thornwellRoyal.stage=1;P.x=250;P.y=250;syncBrambleParty();syncThornwellRoyals();`);
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),2,'Royal party is visible during the handoff');
assert.equal(run('thornwellKing().y'),run("{const t=MD.roomActors.find(a=>a.editKey==='remaining:tavern:18');t.y-t.extractedCanvas.height+5}"),'King uses a north-edge seat offset');
assert.equal(run('thornwellKing().x'),396,'Royal table is the unoccupied northeast table, not Fen’s table');
assert(run("tavernActorDepth(thornwellKing(),MD.roomActors)<tavernActorDepth(MD.roomActors.find(a=>a.editKey==='remaining:tavern:18'),MD.roomActors)"),'Tabletop covers the seated king’s lap');
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
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),2);
run(`tryBrambleReunion(npcs.find(n=>n.n==='Rowan the Hunter'));`);
tick(800);
assert.equal(run('brambleQuest'),3,'Rowan and Bramble leave before the summons');
assert.equal(run('thornwellRoyal.stage'),3);
assert(run('thornwellAudiencePending()'),'The exit waits for the mandatory audience');
assert(run('ask?.conversationPrompt'),'The king’s opening scene waits for confirmation before full conversation');
run("askPick=ask.opts.findIndex(o=>o.n==='Talk');askTake()");
assert.equal(run('ask?.npcConversation'),'King Halvard');
assert(run('Math.hypot(P.x-thornwellKing().x,P.y-thornwellKing().y)<55'),'Corin actually walks to the corner table');
assert(spoken.some(s=>s.includes('carrying the elder’s eggs')));
assert(!spoken.some(s=>s.includes('hear you have a dragon')));
let choices=0;
for(const name of ['King Halvard','Serjeant Bram']){
 c.royalName=name;
 run('openThornwellAudience(npcs.find(n=>n.thornwellRoyal&&n.n===royalName))');
 const titles=Array.from(run('ask.opts.filter(o=>o.go&&!o.navigation&&!o.head).map(o=>o.n)'));
 assert(titles.length>=(name==='King Halvard'?6:3),name+' has distinct topics');
 for(const title of titles){
  c.topicTitle=title;
  run('openThornwellAudience(npcs.find(n=>n.thornwellRoyal&&n.n===royalName));EmberConversationFlow.openChat();askPick=ask.opts.findIndex(o=>o.n===topicTitle);askTake();');tick(30);
  if(run("ask?.topicScope!=='thornwell-audience'")){
   const replies=Array.from(run('ask.opts.filter(o=>o.go&&!o.head).map(o=>o.n)'));
   assert.equal(replies.length,3);
   for(const reply of replies){
    c.replyTitle=reply;
    run('openThornwellAudience(npcs.find(n=>n.thornwellRoyal&&n.n===royalName));EmberConversationFlow.openChat();askPick=ask.opts.findIndex(o=>o.n===topicTitle);askTake();');tick(30);
    run('askPick=ask.opts.findIndex(o=>o.n===replyTitle);askTake();');tick(30);choices++;
    assert.equal(run('ask.topicScope'),'thornwell-audience','Answer returns to the speaker’s topics');
   }
  }
 }
}
assert.equal(choices,36,'Twelve authored exchanges with three responses apiece');
run(`thornwellRoyal.answers.tax='defiant';openThornwellAudience(thornwellKing());askBack();`);
assert.equal(run('thornwellRoyal.stage'),3,'Back stays at the royal topic list');
run(`EmberConversationFlow.openChat();askPick=ask.opts.findIndex(o=>o.n==='May I leave?');askTake();`);tick(30);
assert.equal(run('thornwellRoyal.stage'),4,'Goodbye dismisses the audience safely');
assert.equal(run('thornwellAudiencePending()'),false,'Dismissal unlocks the tavern exit');
assert(spoken.some(s=>s.includes('question rather freely')),'Choices affect the dismissal');
assert.equal(run('atlasJourneyObjective().title'),'Leave the Copper Cup');
run('atlasSyncJournal();saveToSlot(3,true)');
assert.equal(run('captureSave().thornwellRoyal.answers.tax'),'defiant');
// Legacy saves past Bramble must not be pulled backwards into a new scene.
run('restoreThornwellRoyal(null,{brambleQuest:3})');assert.equal(run('thornwellRoyal.stage'),7);
run('restoreThornwellRoyal(null,{brambleQuest:1})');assert.equal(run('thornwellRoyal.stage'),1);
run('restoreThornwellRoyal({stage:3,answers:{tax:"defiant"}})');assert.equal(run('thornwellRoyal.stage'),2);
assert.equal(run('thornwellRoyal.answers.tax'),'defiant');
assert(run('loadGame(3)'));run('scene=null;ask=null;sayNpc=null;');
console.log(`PASS: ${residents.length} residents keep Aurelius secret; king and one knight, 36 replies, forced approach, real save/load and legacy migration.`);
// Use real published outdoor collision, exits and landmarks for all motion.
console.log('Checking the published outdoor route…');
run(`loadMap('world');const royalExit=W.maps.tavern.doors.find(d=>d.to==='world');P.x=royalExit.tx*TS+8;P.y=royalExit.ty*TS+TS;cam.x=P.x-200;cam.y=P.y-150;thornwellDoorArrived('tavern');`);
assert.equal(run('thornwellRoyal.stage'),5);
assert.deepEqual(Array.from(run(`MD.roomActors.filter(a=>/^tavern_patio_table_/.test(a.spr)).map(a=>a.x)`)),[3814.5,3830.5,3990.5,4022.5],'Published outdoor table positions preserve the entrance path');
assert.deepEqual(Array.from(run(`{const n=npcs.find(n=>n.editKey==='npc:placed:f30b6b62-a107-47b7-95ad-7cc27ab5c605');[n.x,n.y]}`)),[3854,1095],'White-haired drinker is one tile west and south');
assert(run(`canStand(3913,1068)&&canStand(3913,1080)`),'The actual entrance corridor stays walkable');
const before=run('[P.x,P.y]');
run('thornwellDeparture()');
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),0,'Party does not appear before black');
run('useDoors(2)');assert.equal(run('fade'),1);
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),2,'Party appears at full black');
assert.equal(run('fadeDir'),0,'The blackout waits for the knight’s announcement');
assert.equal(run('scene.lines[0]'),'Serjeant Bram: Keep this road clear for the king!');
assert.equal(run('typeFull'),'Keep this road clear for the king!','The announcement is visible during the blackout');
run('useDoors(2)');assert.equal(run('fade'),1,'The party stays hidden until the announcement is advanced');
run('typeAll();scene.t=1;advanceScene()');
assert.equal(run('fadeDir'),-1,'Advancing the announcement starts the reveal');
assert(run("scene.lines[0].startsWith('King Halvard:')"),'The king speaks after the announcement');
assert(run('!!scene.hold'),'The king’s dialogue waits for the fade to finish');
assert(run('npcs.filter(n=>n.thornwellRoyal).every(n=>!n.moving&&!n.path&&!n.goto)'));
run('dragonDraws=0;drawGameImage=()=>dragonDraws++;drawKingDragon();drawGameImage=originalDraw');
assert.equal(run('dragonDraws'),0,'The party initially appears without the dragon');
assert(run("npcs.find(n=>n.n==='Serjeant Bram'&&n.thornwellRoyal).x<thornwellKing().x"),'Bram stands west of the king');
for(let i=0;i<240&&!run("thornwellMotion?.kind==='dragonArrival'");i++)tick();
assert(run("thornwellMotion?.kind==='dragonArrival'"),'The king’s conversation starts the arrival automatically');
const dragonStart=run('thornwellRoyalDragon.x');
run('stepThornwellRoyal(.2)');assert(run('thornwellRoyalDragon.x')<dragonStart,'Dragon flies in from the east');
run('dragonDraws=0;drawGameImage=()=>dragonDraws++;drawKingDragon();drawGameImage=originalDraw');
assert.equal(run('dragonDraws'),1,'Arrival draws the dragon');
tick(450);
assert.equal(run('thornwellRoyal.stage'),6,'All royals leave and unlock the urgent objective');
assert.notDeepEqual(Array.from(run('[P.x,P.y]')),Array.from(before),'The player is physically moved aside');
assert.equal(run('npcs.filter(n=>n.thornwellRoyal).length'),0);
assert.equal(run('thornwellRoyalDragon'),null);
assert(run("npcs.filter(n=>n.editKey==='npc:placed:f30b6b62-a107-47b7-95ad-7cc27ab5c605').every(n=>Math.hypot(n.x-P.x,n.y-P.y)>40)"),'Departure keeps Corin away from the drinker');
assert.equal(run('dragonHere()'),false,'Aurelius stays absent after the royal departure');
assert.equal(run('atlasJourneyObjective().place'),'Forgefalls');
assert(spoken.includes('Serjeant Bram: Keep this road clear for the king!'));
assert.equal(spoken.filter(s=>s==='Serjeant Bram: Keep this road clear for the king!').length,1,'The announcement is not repeated after the reveal');
assert(spoken.includes('Stand back. The king needs this space.'));
assert(spoken.some(s=>/Forgefalls.*Cinderhold/.test(s)));
run('restoreThornwellRoyal(captureThornwellRoyal());');tick(5);assert.equal(run('thornwellRoyal.stage'),6,'Reloaded departure does not repeat');
run(`const meeting=thornwellForgefalls();P.x=meeting.left-16;P.y=meeting.y;dragon.hp=4;`);tick(5);
assert.equal(run('thornwellFlight'),null,'The riverbank does not trigger the reunion');
run(`P.x=meeting.x;P.y=meeting.y;P.moving=true;padDx=1;VW=800;VH=600;cam.z=2.5;cam.x=P.x-VW/cam.z/2;cam.y=P.y-VH/cam.z/2;`);tick(1);
assert.equal(run('P.moving'),false,'Corin stops as the flight begins');
assert.equal(run('padDx'),0,'Held touch input is cleared');
assert(run('scene.silent&&dragon.air&&thornwellFlight.phase==="fly"'),'Flight owns input before dialogue');
assert(run('dragon.x>cam.x+VW/cam.z+80'),'Aurelius starts fully off screen');
const corinAt=Array.from(run('[P.x,P.y]'));
let enteredView=false,landed=false;
for(let i=0;i<300&&run('thornwellFlight?.phase!=="talk"');i++){
 const previous=run('dragon.x');
 run('keys.d=true;stepPlayer(1/30);advanceScene();stepScene(1/30);stepDragon(1/30)');
 assert.deepEqual(Array.from(run('[P.x,P.y]')),corinAt,'Held keyboard input cannot move Corin during the flight');
 assert(Math.abs(run('dragon.x')-previous)<=145/30+.001,'Aurelius flies continuously without teleporting');
 enteredView ||= run('dragon.x<cam.x+VW/cam.z');
 landed ||= run('dragon.tr?.kind==="down"');
 assert.equal(run('thornwellRoyal.stage'),6,'The journey checkpoint waits for the reunion dialogue');
}
run('keys.d=false');
assert(enteredView&&landed,'Visible flight is followed by the landing animation');
assert.equal(run('thornwellFlight.phase'),'talk');assert.equal(run('dragon.air'),false);
assert(run('dragon.x>=meeting.left&&dragon.x<=meeting.right&&dragon.y>=meeting.top&&dragon.y<=meeting.bottom'),'Aurelius lands on the bridge');
tick(80);
assert.equal(run('thornwellRoyal.stage'),7);assert(run('dragonHere()'));
assert.equal(run('dragon.hp'),4,'Reunion does not heal or reset dragon progress');
assert(run("atlasQuestComplete('thornwell-royals')"));
assert(spoken.some(s=>s.includes('I saw his party pass')));
const linesAfter=spoken.length;tick(100);assert.equal(spoken.length,linesAfter,'Reunion plays once');
// Departure animation: ownership stays intact; normal following cannot pull
// the dragon back to Corin while the flight is in progress or after it ends.
run(`restoreThornwellRoyal({stage:0});brambleQuest=1;P.x=230*TS;P.y=100*TS;dragon.x=P.x+28;dragon.y=P.y;dragon.hp=dragon.maxHp;beginThornwellDetour();`);
const xBefore=run('dragon.x');tick(900);
assert.equal(run('thornwellRoyal.stage'),1);assert.equal(run('thornwellFlight'),null);
assert(run('dragon.x')>xBefore+250);assert(run('hasDragon()'));assert.equal(run('dragonHere()'),false);
assert.equal(run('atlasJourneyObjective().title'),'Find Bramble’s owner');
run('skipBrambleForTest()');assert.equal(run('thornwellRoyal.stage'),7);assert(run('dragonHere()'));
run('devUnlocked=true');assert(run('replayThornwellForTest()'));assert.equal(run('thornwellRoyal.stage'),0);assert(run('brambleWelcomeInside()'));
assert(run('welcomePath()'),'The replay position has a real approach even beside the town fence');
tick(1200);
assert.equal(run('brambleQuest'),1,'Bramble actually reaches Corin');
assert.equal(run('thornwellRoyal.stage'),1,'The real Bramble arrival starts the detour');
assert.equal(run('dragonHere()'),false,'The entire replay opening finishes with Aurelius away');
console.log('PASS: northeast table, original idle guards, indoor dragon exclusion, wider patio, two royal blackouts, Forgefalls reunion, completed journal, discreet flight and developer skip.');
