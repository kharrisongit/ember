/* Thornwell's first visit: keep the dragon secret, endure the royal audience,
   then reunite at Forgefalls. Only durable checkpoints belong in a save.
   0: not met, 1: separated, 2: summoned, 3: audience, 4: dismissed,
   5: royal departure, 6: hurry to the falls, 7: reunited (or legacy complete). */
let thornwellRoyal={stage:0,answers:{}};
let thornwellMotion=null,thornwellFlight=null;
const THORNWELL_ROYALS=['King Halvard','Serjeant Bram','Doran','Tolan'];
const THORNWELL_RESIDENTS=new Set(['Orin','Linna','Isolde','Cartwright Oswin','Garrow','Wren','Merrin','Asta','Colm','Rowan the Hunter','Ada','Bren','Berta','Della','Ewan','Osric','Alder','Gwyneth','Archivist Elowen','Mira','Oren','Tamsin','Tessa','Master Iven','Brin','Bram','Nell','Sable','Pella','Bess','Ronan','Venn','Hobb','Edric','Dorr','Ser Anwen','Grusk','Fen','Senn','Dain','Rusk','Linnet','Puck','Pip','Vale','Cerys','Nyra','Maren','Celia']);
function captureThornwellRoyal(){return {stage:thornwellRoyal.stage,answers:{...thornwellRoyal.answers}};}
function restoreThornwellRoyal(saved,legacy={}){
  const stage=saved&&Number.isInteger(saved.stage)?Math.max(0,Math.min(7,saved.stage)):
    legacy.wonAll||legacy.brambleQuest>=2?7:legacy.brambleQuest===1?1:0;
  thornwellRoyal={stage:stage===3?2:stage,answers:{}};
  for(const key of ['eggs','tax','riders','search','visit'])if(typeof saved?.answers?.[key]==='string')thornwellRoyal.answers[key]=saved.answers[key];
  thornwellMotion=null;thornwellFlight=null;
  if(scene?.thornwellRoyal){scene=null;walker=null;sayOff();showFace(null);}
  if(ask?.npcActor?.thornwellRoyal)askShut();
  npcs=npcs.filter(n=>!n.thornwellRoyal);
}
function skipThornwellRoyal(){restoreThornwellRoyal({stage:7});}
function thornwellDragonHidden(){return thornwellRoyal.stage>0&&thornwellRoyal.stage<7&&!thornwellFlight;}
function thornwellResident(n){
  if(!n||n.thornwellRoyal)return false;
  return THORNWELL_RESIDENTS.has(n.n)||THORNWELL_RESIDENTS.has(n.portraitOriginalName)||
    /Thornwell|Copper Cup/.test(n.loc||'')||/Thornwell|Copper Cup/.test(MD?.title||'')||
    MAPID==='world'&&n.x>=220*TS&&n.x<=322*TS&&n.y>=44*TS&&n.y<=150*TS;
}
function thornwellKnowledgeHidden(n){return !wonAll&&thornwellRoyal.stage<7&&thornwellResident(n);}
function thornwellQuietGreeting(n){
  if(!thornwellKnowledgeHidden(n))return null;
  if(n.n==='Fen'&&!charm.twin)return [
    brambleQuest>=2?'Fen: You brought Rowan his dog. That deserves a little kindness in return.':'Fen: Bramble seems to trust you. Dogs are often better judges than kings.',
    'Fen: Take this Twin Heart. It is an old charm for two companions who look after one another.',
    'Corin: You are giving it to me?',
    'Fen: I can choose who receives a gift. Whatever Halvard thinks.'];
  const p=typeof npcWorldProfile==='function'?npcWorldProfile(n):null;
  const lines=p?.greetings?.d||n.d||[n.n+': Keep your voice down. The king is visiting Thornwell.'];
  return lines.map(line=>/^[^:]{1,24}: /.test(line)?line:n.n+': '+line);
}
function thornwellVisitTopic(n){
  if(!thornwellKnowledgeHidden(n))return null;
  const after=thornwellRoyal.stage>=5;
  const group=n.n==='Bess'?'host':n.n==='Rowan the Hunter'?'hunter':/Elowen|Iven|Sable|Celia|Bren|Ewan/.test(n.n)?'records':/Maren|Linna|Isolde|Wren|Oswin/.test(n.n)?'supplies':/Nell|Brin|Mira|Oren|Tamsin|Pella/.test(n.n)?'students':'neighbours';
  const first=n.n==='Bess'?'He took the corner table and ordered four suppers. When I named the price, his serjeant asked how much I valued my licence.':
    n.n==='Rowan the Hunter'?'His men have been searching around Thornwell. A hunter notices when strangers begin inspecting familiar ground.':
    /Elowen|Iven|Sable|Celia|Bren|Ewan/.test(n.n)?'The royal men asked which histories we teach. They seemed more troubled by the books than by anything on the road.':
    /Maren|Linna|Isolde|Wren|Oswin/.test(n.n)?'His men call it a royal visit. Those of us supplying the food have another name for it.':
    /Nell|Brin|Mira|Oren|Tamsin|Pella/.test(n.n)?'We were told not to ask the king any questions. Apparently that is the proper way to learn about him.':
    'People have been measuring every word since the royal party arrived. A quiet room is not always a happy one.';
  return {branchKey:'visit/'+group+'/'+(after?'after':'before'),title:after?'After the royal visit':'The king in Thornwell',category:'world',lines:[n.n+': '+first,
    'Corin: '+(after?'They have gone east.':'Does nobody tell him to stop?'),
    n.n+': '+(after?'Then let us hope they keep going. Take care on the road; a crown does not make its wearer kind.':'Not with three armed men waiting to teach us manners. Be careful in there.') ]};
}
function thornwellCheckpoint(stage){thornwellRoyal.stage=stage;saveGame();}
function thornwellScene(lines,after,actor){
  sayNpc=null;sayOff();
  playScene(lines,{thornwellRoyal:true,offscreen:!actor,npcActor:actor,after,...(!lines.length?{silent:true,until:()=>false}:{})});
}
function beginThornwellDetour(){
  if(thornwellRoyal.stage||!hasDragon())return false;
  // Save the separation before its animation so reloading cannot summon him
  // into town. His health, equipment and ownership are left intact.
  thornwellRoyal.stage=1;
  if(MAPID==='world')thornwellFlight={kind:'depart',phase:'talk',distance:0};
  thornwellScene([
    'Aurelius: That dog is going to introduce you to everyone in Thornwell. I would rather not be the second thing they notice.',
    'Corin: You want to go around?',
    'Aurelius: I can fly low beyond the trees, well clear of the roofs. Return Bramble to his owner. I will meet you on the bridge at Forgefalls.',
    'Corin: No circling the town. And stay out of sight.',
    'Aurelius: Discreetly, Corin. I know what that means.',
    'Corin: I will see you at the falls.'
  ],()=>{
    if(!thornwellFlight){saveGame();return;}
    thornwellFlight.phase='lift';dragon.dir='e';dragon.moving=false;
    startTransition('up',true);
    thornwellScene([],()=>{saveGame();toast('Return Bramble to Rowan at the Copper Cup. Aurelius will wait at Forgefalls.');});
    scene.silent=true;scene.until=()=>!thornwellFlight;showScene();
  });
  saveGame();return true;
}
function stepThornwellDragon(dt){
  if(thornwellFlight){
    dragon.t+=dt;dragon.moving=false;
    if(thornwellFlight.phase==='talk')return true;
    if(dragon.tr){stepTransition(dt);return true;}
    if(thornwellFlight.kind==='reunion'){
      if(thornwellFlight.phase==='fly'){
        const [x,y]=thornwellFlight.target,dx=x-dragon.x,dy=y-dragon.y;
        const distance=Math.hypot(dx,dy),step=Math.min(distance,145*dt);
        dragon.air=true;dragon.moving=true;dragon.dir=direction4(dx,dy,'w');
        if(distance>0){dragon.x+=dx/distance*step;dragon.y+=dy/distance*step;}
        faceCorinAt(dragon.x,dragon.y);
        if(distance<=step){
          dragon.moving=false;dragon.dir=P.x<dragon.x?'w':'e';
          thornwellFlight.phase='land';startTransition('down',false);
        }
      }else if(thornwellFlight.phase==='land'){
        thornwellFlight.phase='talk';dragon.air=false;dragon.moving=false;
        faceCorinAt(dragon.x,dragon.y);
      }
      return true;
    }
    if(thornwellFlight.kind==='depart'){
      dragon.air=true;dragon.dir='e';dragon.moving=true;
      dragon.x+=145*dt;dragon.y-=25*dt;thornwellFlight.distance+=145*dt;
      if(thornwellFlight.distance>Math.max(300,VW/cam.z+120)){
        thornwellFlight=null;dragon.air=false;dragon.tr=null;dragon.moving=false;refreshWingBtn();
      }
    }
    return true;
  }
  if(thornwellDragonHidden()){dragon.moving=false;return true;}
  return false;
}
function thornwellRoyalActor(name,x,y){
  const king=name==='King Halvard';
  return {id:'thornwell-royal-'+name,n:name,x,y,px:x,py:y,t:0,f:'d',kf:'d',
    thornwellRoyal:true,sceneReserved:true,stationary:true,noTalk:false,
    ...(king?{body:'kg',seatSpr:MAPID==='tavern'?'king_seated':null}:{packSpr:'royal_intro_guard_'+(name==='Serjeant Bram'?'black':'white'),packDirections:false,packWalk:false,idleFps:6}),
    d:[name+': His Majesty is not finished here.'],loc:'Thornwell — Copper Cup'};
}
function syncThornwellRoyals(){
  const visible=MAPID==='tavern'&&thornwellRoyal.stage>=1&&thornwellRoyal.stage<=4&&!wonAll;
  if(!visible){if(MAPID!=='world'||thornwellRoyal.stage!==5)npcs=npcs.filter(n=>!n.thornwellRoyal);return;}
  if(npcs.some(n=>n.thornwellRoyal))return;
  // The northeast round table is unoccupied. Follow its published position
  // when the editor's extracted furniture is available.
  const table=(MD.roomActors||[]).find(o=>o.editKey==='remaining:tavern:18');
  const dx=table?table.x-396:0,dy=table?table.y-187:0;
  for(const [i,pos]of [[396,170],[369,181],[426,181],[440,210]].entries())
    npcs.push(thornwellRoyalActor(THORNWELL_ROYALS[i],pos[0]+dx,pos[1]+dy));
}
function thornwellKing(){return npcs.find(n=>n.thornwellRoyal&&n.n==='King Halvard');}
function thornwellClear(x,y,actor){
  if(actor===P)return canStand(x,y);
  // Stage the group along the same corridor. Their timed starts keep them
  // apart; a guard waiting in the doorway must not invalidate the next route.
  const others=actor.thornwellRoyal?npcs.filter(n=>n!==actor&&n.thornwellRoyal&&!n.away):[];
  for(const other of others)other.away=true;
  try{return canNpcStand(x,y,actor);}
  finally{for(const other of others)other.away=false;}
}
function thornwellPath(actor,target){return maddockWalkPath(actor,target,(x,y)=>thornwellClear(x,y,actor));}
function thornwellReachable(actor,targets){
  for(const target of targets){if(!thornwellClear(...target,actor))continue;const path=thornwellPath(actor,target);if(path)return path;}
  return null;
}
function thornwellMove(actor,path,speed,dt){
  if(!path?.length){actor.moving=false;actor.scriptWalking=false;return;}
  if(actor===P)faceCorinAt(...path[0]);
  moveBrambleActor(actor,path,speed,dt);
  actor.moving=!!path.length;actor.scriptWalking=!!path.length;actor.t+=dt;
}
function thornwellWalkPlayer(path,after,kind='approach'){
  thornwellMotion={kind,path,after};
  thornwellScene([],()=>{const done=thornwellMotion?.after;thornwellMotion=null;P.moving=false;if(done)done();});
  scene.silent=true;scene.until=()=>!thornwellMotion?.path?.length;showScene();
}
function thornwellSummon(){
  const king=thornwellKing();if(!king)return;
  const path=thornwellReachable(P,[[king.x-13,king.y+43],[king.x-32,king.y+38],[king.x+30,king.y+46],[king.x-48,king.y+30]]);
  if(!path)return; // Retry a real route; never teleport through edited furniture.
  thornwellCheckpoint(2);
  thornwellScene([
    'King Halvard: You. The boy with the eggs. I remember that face.',
    'Corin: Your Majesty.',
    'King Halvard: Over here. I dislike having to raise my voice to be obeyed.',
    'Serjeant Bram: You heard the king. Move.'
  ],()=>thornwellWalkPlayer(path,()=>{
    faceCorinAt(king.x,king.y);thornwellRoyal.stage=3;thornwellRoyal.answers.visit='yes';
    thornwellScene([
      'King Halvard: Still running errands, then. A useful habit in a boy. Keep it.',
      'King Halvard: Bess! More cider. And put the meal under service to the crown.',
      'Bess: Those stores have to last us the week, sire.',
      'King Halvard: Then serve smaller portions to everyone else. There. A king has solved your difficulty.',
      'Doran: Generous of you, sire.',
      'King Halvard: Now, boy. Tell me what you have been doing with yourself.'
    ],()=>{
      if(globalThis.window?.EmberConversationFlow)window.EmberConversationFlow.prompt(king,{talk:()=>openThornwellAudience(king),leave:thornwellDismissAudience});
      else openThornwellAudience(king);
    },king);
  }),king);
}
function thornwellAudienceLines(actor,lines,after){thornwellScene(lines,after||(()=>openThornwellAudience(actor)),actor);}
function thornwellAnswer(actor,key,question,options){
  thornwellAudienceLines(actor,question,()=>{
    const back=()=>openThornwellAudience(actor);
    ask={quick:1,npcConversation:actor.n,npcActor:actor,topicScope:'thornwell-'+key,replyChoices:true,repaintWorld:true,back,
      opts:[{n:'Choose your words',head:true},...options.map(([title,value,lines])=>({n:title,category:'story',go:()=>{
        thornwellRoyal.answers[key]=value;saveGame();thornwellAudienceLines(actor,lines);
      }})),{n:'Let the subject drop',category:'leave',navigation:true,go:back}]};askPick=1;askDraw();
  });
}
function thornwellDismissAudience(){
  const king=thornwellKing();
  thornwellAudienceLines(king,[
    thornwellRoyal.answers.tax==='defiant'||thornwellRoyal.answers.riders==='defiant'?
      'King Halvard: You have a troublesome habit of finishing your thoughts aloud. Lose it before we meet again.':
      'King Halvard: There. You may tell your village the king gave you his time. They should be grateful.',
    'King Halvard: Run along, egg boy. And if you hear anything unusual on the road, you will tell my men first.',
    'Corin: I should be going.',
    'Serjeant Bram: You should have been going before he had to say it.'
  ],()=>{thornwellCheckpoint(4);toast('Leave the Copper Cup, then meet Aurelius at Forgefalls.');});
}
function openThornwellAudience(actor){
  if(!actor?.thornwellRoyal)return false;
  if(thornwellRoyal.stage<3){thornwellScene([actor.n+': His Majesty is eating. Finish your errand.'],null,actor);return true;}
  if(thornwellRoyal.stage>4)return false;
  sayNpc=null;sayOff();showFace(null);P.moving=false;
  const king=actor.n==='King Halvard',back=thornwellRoyal.stage===3?thornwellDismissAudience:()=>{};
  const topics=king?thornwellKingTopics(actor):thornwellKnightTopics(actor);
  ask={quick:1,npcConversation:actor.n,npcActor:actor,topicScope:'thornwell-audience',repaintWorld:true,back,
    opts:[{n:actor.n,head:true},...topics,...THORNWELL_ROYALS.filter(name=>name!==actor.n).map(name=>({
      n:'Speak to '+name,navigation:true,category:'folder',summary:name==='King Halvard'?'Return to the king':'An armed man at the king’s table',
      go:()=>openThornwellAudience(npcs.find(n=>n.thornwellRoyal&&n.n===name))
    })),{n:thornwellRoyal.stage===3?'May I leave?':'Leave the table',category:'leave',navigation:true,go:back}]};
  askPick=1;askDraw();return true;
}
function thornwellKingTopics(n){
  const topic=(title,summary,lines)=>({n:title,summary,category:'world',go:()=>window.EmberConversationFlow.playTopic(n,{title,lines})});
  return [
    {n:'You remember the eggs?',category:'story',summary:'The king remembers an errand better than a name',go:()=>thornwellAnswer(n,'eggs',[
      'King Halvard: Six eggs and a boy who insisted they had somewhere more important to be. Quite an impression.',
      'Corin: They were for Elder Maddock.',
      'King Halvard: And mine were questions from your king. Which mattered more?'
    ],[
      ['I was trying to finish my errand.','careful',['Corin: I was trying to finish my errand.','King Halvard: A small duty. You will find mine take precedence.','Serjeant Bram: There is your lesson for the day.']],
      ['Maddock was waiting for his food.','defiant',['Corin: Maddock was waiting for his food.','King Halvard: Then hunger taught him patience. A useful lesson at any age.','Corin: He had done nothing wrong.','King Halvard: Neither have you. Yet you are beginning to tire me.']],
      ['Your questions, Your Majesty.','polite',['Corin: Your questions, Your Majesty.','King Halvard: Better. There is hope for the boy.','Doran: A natural courtier, sire.','King Halvard: Let us not spoil him.']]
    ])},
    {n:'Who pays for this meal?',category:'story',summary:'Bess’s stores become the crown’s tribute',go:()=>thornwellAnswer(n,'tax',[
      'Corin: Will Bess be paid for feeding all of you?',
      'King Halvard: She enjoys my protection. She has a roof, a licence and the privilege of serving me. Must I buy her gratitude too?'
    ],[
      ['She still has to buy the food.','defiant',['Corin: She still has to buy the food.','King Halvard: Then she will work harder. It is astonishing how often that solves a commoner’s problem.','Corin: And if there is nothing left?','King Halvard: Bram, make a note. Thornwell apparently has enough leisure to debate its obligations.','Serjeant Bram: I will remind the collector, sire.']],
      ['Could you pay her this once?','plead',['Corin: Could you pay her this once?','King Halvard: You ask favours with somebody else’s purse. That is a dangerous habit.','King Halvard: No. Kindness is expensive when people begin to expect it.']],
      ['Say nothing.','quiet',['Corin looks at Bess. She keeps wiping the same clean cup.','King Halvard: Good. You are learning when a matter does not concern you.','Corin: I heard you.']]
    ])},
    {n:'What are your men searching for?',category:'lead',summary:'Find out how much Halvard knows',go:()=>thornwellAnswer(n,'search',[
      'King Halvard: Rumours. Wings over the trees. A noise in the northern woods. Peasants do enjoy frightening each other.',
      'Corin: Is that why you stopped us in Millwood?',
      'King Halvard: I ask the questions. Have you seen anything since?'
    ],[
      ['Only the dog I brought back.','dog',['Corin: Only the dog I brought back.','King Halvard: Then for once a creature has been returned to its proper owner.','King Halvard: Remember that. Anything of consequence in this realm belongs to the crown.']],
      ['What would you do if you found a dragon?','probe',['Corin: What would you do if you found one?','King Halvard: Put it beyond the reach of fools. A dragon is power, boy. Power requires a master.','Corin: And if it would not obey?','King Halvard: Then it would be of no use to me.']],
      ['I have heard no reports in town.','careful',['Corin: I have heard no reports in town.','Doran: Nor have we, after all that walking.','King Halvard: You are paid to search, Doran, not to announce your failures.']]
    ])},
    {n:'The riders before Wingfall',category:'world',summary:'Hear the history the king wants remembered',go:()=>thornwellAnswer(n,'riders',[
      'Corin: The school has books about the seven riders.',
      'King Halvard: Six traitors and one man willing to do what was necessary. I trust the books make that clear.'
    ],[
      ['Some books call them protectors.','defiant',['Corin: Some books call them protectors.','King Halvard: Then somebody has been careless with the school’s shelves.','Corin: A book cannot threaten you.','King Halvard: A boy repeats a sentence. A village repeats the boy. Bram, you see why carelessness matters.','Serjeant Bram: Perfectly, sire.']],
      ['What made them traitors?','question',['Corin: What made them traitors?','King Halvard: They disagreed with me when agreement was required.','Corin: That is all?','King Halvard: You say “all” as though obedience were a small thing.']],
      ['Listen without agreeing.','quiet',['King Halvard: Emberfell needs one will. One crown. I spared it the confusion of seven.','Corin says nothing. Halvard takes the silence for approval.']]
    ])},
    topic('Why visit Thornwell yourself?','A royal inspection with a hungry entourage',[
      'King Halvard: A seal on a letter is too easy to resent in private. A king at your table reminds you to smile.',
      'Corin: People seem frightened.',
      'King Halvard: Good. Fear travels faster than gratitude and costs considerably less.'
    ]),
    topic('Life at Cinderhold','The comfort bought with everyone else’s work',[
      'King Halvard: Proper stone walls. Servants who understand a gesture. Wine that does not taste of fallen apples.',
      'Corin: Then why drink Bess’s cider?',
      'King Halvard: Because she has it, and I have asked for it. You do like making simple matters difficult.'
    ])
  ];
}
function thornwellKnightTopics(n){
  const data={
    'Serjeant Bram':[
      ['Following orders','Where he chooses to put the blame',[
        'Corin: Do you ever refuse an order?',
        'Serjeant Bram: My duty is to carry it out. His Majesty decides what is right.',
        'Corin: That is convenient for you.',
        'Serjeant Bram: It is convenient for you that we are sitting at a table. Remember the difference.'
      ]],
      ['The roadblocks','Who gets to pass, and who has to wait',[
        'Serjeant Bram: A road stays closed until I open it. Not until the market starts. Not until someone’s child gets hungry.',
        'Corin: People have lives on both sides of your rope.',
        'Serjeant Bram: Then they should plan around the crown.'
      ]],
      ['What do you write in those reports?','The cost of being noticed',[
        'Corin: Would you really report the school over a book?',
        'Serjeant Bram: I record names. His Majesty decides what to do with them.',
        'Corin: You make it sound like copying a shopping list.',
        'Serjeant Bram: A short list is easier on everyone. Do not add yourself.'
      ]]
    ],
    Doran:[
      ['Still hunting things that do not exist?','Remind him of the road outside Millwood',[
        'Corin: You said you had spent fifty years hunting something that did not exist.',
        'Doran: The crown has. I have not been marching for fifty years. Feels like it, mind.',
        'King Halvard: Is this an amusing conversation?',
        'Doran: I was praising your persistence, sire.',
        'Corin: That was quick.',
        'Doran: It has to be.'
      ]],
      ['You laughed at Bess','A joke with someone else paying for it',[
        'Corin: You thought it was funny when he refused to pay her.',
        'Doran: A man laughs when his king makes a joke.',
        'Corin: Was it a joke?',
        'Doran: Eat at the right table, boy. You will worry less about the bill.'
      ]],
      ['Did you search the whole town?','A careless answer about the royal patrol',[
        'Doran: Orchards. Yards. Stables. Tolan looked under a cart. Very thorough.',
        'Corin: And you found nothing?',
        'Doran: A hen that bit Bram. Best lead of the morning.',
        'Serjeant Bram: Enough.',
        'Doran: As you say.'
      ]]
    ],
    Tolan:[
      ['Is this what being a knight means?','The uniform and what he uses it for',[
        'Tolan: Hot food, dry boots, and people moving when you tell them.',
        'Corin: What about protecting them?',
        'Tolan: From trouble. Usually begins when they stop moving.'
      ]],
      ['Are you afraid of the king?','A question he does not want overheard',[
        'Tolan: Keep your voice down.',
        'Corin: That answers it.',
        'Tolan: I know which side of the table to stand on. Learn that and you might grow old.',
        'Corin: At somebody else’s expense?',
        'Tolan: Better theirs than mine.'
      ]],
      ['The man waiting at the roadblock','He remembers the people he delayed',[
        'Corin: Back in Millwood, you kept people waiting as though their time meant nothing.',
        'Tolan: To His Majesty, it did not.',
        'Corin: I asked what it meant to you.',
        'Tolan: I heard you. I chose my answer.'
      ]]
    ]
  };
  return (data[n.n]||[]).map(([title,summary,lines])=>({n:title,summary,category:'story',go:()=>window.EmberConversationFlow.playTopic(n,{title,lines})}));
}
function thornwellDoorArrived(from){
  if(from==='tavern'&&MAPID==='world'&&thornwellRoyal.stage===4)thornwellCheckpoint(5);
}
function thornwellAudiencePending(){return MAPID==='tavern'&&brambleQuest>=2&&thornwellRoyal.stage>=1&&thornwellRoyal.stage<=3;}
function thornwellDeparture(){
  const exit=W.maps.tavern.doors.find(d=>d.to==='world');if(!exit)return;
  const origin=[exit.tx*TS+8,exit.ty*TS+TS];
  // The ceremonial escort has idle art only. Stage the entire party while
  // black, just as in Millwood; never swap them for the Cinderhold fighters.
  thornwellScene([]);thornwellMotion={kind:'blackout'};
  royalBlackout('Serjeant Bram: Make way for royalty!',()=>{
    npcs=npcs.filter(n=>!n.thornwellRoyal);
    const forward=[[P.x,P.y+32],[P.x+16,P.y+32],[P.x-16,P.y+32]].find(p=>canStand(...p));
    if(forward)[P.x,P.y]=forward;
    for(const [i,name]of THORNWELL_ROYALS.entries()){
      const offsets=[[0,8],[-28,28],[28,28],[48,8]];
      const actor=thornwellRoyalActor(name,origin[0]+offsets[i][0],origin[1]+offsets[i][1]);
      const spot=[[actor.x,actor.y],[actor.x,actor.y+16],[actor.x,actor.y-16],origin].find(p=>thornwellClear(...p,actor));
      if(spot){[actor.x,actor.y]=spot;actor.px=actor.x;actor.py=actor.y;}
      npcs.push(actor);
    }
    const king=thornwellKing();faceCorinAt(king.x,king.y);
  },()=>{
    const king=thornwellKing();thornwellMotion=null;
    thornwellScene([
      'King Halvard: Come on, boys. There’s no dragon here. Let’s make our way past Forgefalls and back to Cinderhold.',
      'Doran: At last. A road with an end to it.'
    ],thornwellRoyalExit,king);
    scene.hold=()=>fade<=0;showScene();
    // Reveal the party only after Bram's announcement has been read in black.
  });
}
function thornwellRoyalExit(){
  thornwellMotion={kind:'blackout'};
  royalBlackout('Out of my way, boy!',()=>{
    // Change positions only under full black, with the same published collision
    // checks used by ordinary movement. No knight plays a walking animation.
    const aside=[[P.x-28,P.y+8],[P.x+28,P.y+8],[P.x-24,P.y+24],[P.x+24,P.y+24]].find(p=>canStand(...p));
    if(aside)[P.x,P.y]=aside;
    P.moving=false;npcs=npcs.filter(n=>!n.thornwellRoyal);
  },()=>{
    thornwellMotion=null;thornwellCheckpoint(6);
    thornwellScene([
      'Corin: Forgefalls. That is where Aurelius is waiting.',
      'Corin: If they find him… I have to get there. Now.'
    ],()=>{saveGame();toast('Meet Aurelius on the bridge at Forgefalls.');});
    scene.hold=()=>fade<=0;showScene();
  });
}
function thornwellForgefalls(){
  const mark=W.maps.world.features?.find(f=>f.kind==='landmark'&&f.label==='Forgefalls');
  const x=mark?.x??417,y=mark?.y??328;
  const bridge=(W.maps.world.decks||[]).filter(d=>
    Math.hypot((d.x0+d.x1)/2-x,(d.y0+d.y1)/2-y)<16)
    .sort((a,b)=>Math.hypot((a.x0+a.x1)/2-x,(a.y0+a.y1)/2-y)-Math.hypot((b.x0+b.x1)/2-x,(b.y0+b.y1)/2-y))[0];
  if(!bridge)return null;
  return {x:(bridge.x0+bridge.x1+1)*TS/2,y:(bridge.y0+bridge.y1+1)*TS/2,
    left:bridge.x0*TS+8,right:(bridge.x1+1)*TS-8,top:bridge.y0*TS+8,bottom:(bridge.y1+1)*TS-8};
}
function thornwellReunion(){
  const bridge=thornwellForgefalls();
  if(!bridge)return;
  const spot=[[P.x+42,P.y],[P.x-42,P.y],[P.x,P.y+42],[P.x,P.y-42]].find(([x,y])=>
    x>=bridge.left&&x<=bridge.right&&y>=bridge.top&&y<=bridge.bottom&&dragonCanStand(x,y));
  if(!spot)return; // Wait for enough clear bridge deck to land beside Corin.
  clearPadInputs();running=false;P.act=null;P.moving=false;
  thornwellFlight={kind:'reunion',phase:'fly',target:spot};
  // Enter from beyond both the current view and the camera's following view.
  dragon.x=Math.max(cam.x+VW/cam.z,P.x+VW/cam.z/2,spot[0])+128;
  dragon.y=spot[1];dragon.air=true;dragon.tr=null;dragon.moving=true;dragon.placed=MAPID;
  dragon.dir='w';faceCorinAt(dragon.x,dragon.y);
  thornwellScene([],thornwellReunionDialogue);
  scene.until=()=>thornwellFlight?.phase==='talk';showScene();
}
function thornwellReunionDialogue(){
  thornwellScene([
    'Corin: Aurelius! Are you all right?',
    'Aurelius: Yes. Why are you looking at me as though I have fallen apart?',
    'Corin: Halvard was in the tavern. He remembered me from Millwood. His men left just ahead of me. They said they were coming this way.',
    'Aurelius: I saw them pass. Three knights and a king complaining about the road. I stayed behind the trees until they were gone.',
    'Corin: He talked about dragons as though they were things he could take. I thought they might find you.',
    'Aurelius: They did not. And I have no intention of belonging to him.',
    'Corin: We need to be careful. In towns, on the road… everywhere his men might be watching.',
    'Aurelius: Then we watch for each other. Next time we separate, we agree where to hide as well as where to meet.',
    'Corin: Agreed. I am glad you are here.',
    'Aurelius: I am glad you returned the dog. Now, let us go together.'
  ],()=>{thornwellFlight=null;thornwellCheckpoint(7);refreshWingBtn();toast('Reunited at Forgefalls. Aurelius travels with you again.');});
}
function stepThornwellRoyal(dt){
  if(mode!=='play'||editing)return;
  syncThornwellRoyals();
  if(thornwellMotion){
    const motion=thornwellMotion;
    if(motion.kind==='blackout')return;
    if(motion.path)thornwellMove(P,motion.path,motion.kind==='shove'?180:82,dt);
    for(const item of motion.actors||[]){
      item.delay-=dt;if(item.delay>0)continue;
      item.actor.away=false;thornwellMove(item.actor,item.path,68,dt);
      if(motion.kind==='march'&&!item.path.length)item.actor.away=true;
    }
    return;
  }
  if(sceneHold()||sayNpc||ask||doorMotion||fadeDir||fade>0||ride||mounted)return;
  if(!thornwellRoyal.stage&&brambleQuest>=1&&brambleQuest<3){beginThornwellDetour();return;}
  if(MAPID==='tavern'&&brambleQuest===3&&thornwellRoyal.stage>=1&&thornwellRoyal.stage<=3){thornwellSummon();return;}
  if(MAPID==='world'&&thornwellRoyal.stage===5){thornwellDeparture();return;}
  if(MAPID==='world'&&thornwellRoyal.stage===6){
    const falls=thornwellForgefalls();
    if(falls&&P.x>=falls.left&&P.x<=falls.right&&P.y>=falls.top&&P.y<=falls.bottom)thornwellReunion();
  }
}
function thornwellStoryObjective(){
  const stage=thornwellRoyal.stage;
  if(stage<1||stage>=7)return null;
  if(stage===1&&brambleQuest<3)return ['Return Bramble quietly','Thornwell','Bring Bramble to Rowan at the Copper Cup. Aurelius is staying out of sight and will meet you at Forgefalls.'];
  if(stage<=3)return ['The king’s summons','Thornwell','Return to the Copper Cup and speak with King Halvard and his knights at the corner table.'];
  if(stage===4)return ['Leave the Copper Cup','Thornwell','Halvard has dismissed you. Leave the tavern to continue toward Forgefalls.'];
  if(stage===5)return ['Make way for royalty','Thornwell','The royal party is leaving the Copper Cup. Wait for them to pass.'];
  return ['Find Aurelius at Forgefalls','Forgefalls','Halvard’s men are heading past Forgefalls. Follow the road east from Thornwell, then south to the falls. Meet Aurelius on the bridge at the falls.'];
}
function replayThornwellForTest(){
  if(!devUnlocked)return false;
  if(!hasDragon()||wonAll){toast('Use a journey save after Aurelius hatches and before Halvard is defeated.');return false;}
  if(sceneHold()||ask||sayNpc||inFight()||arenaLock||doorMotion||fadeDir||mounted||ride){toast('Finish the current conversation, ride or encounter first.');return false;}
  if(MAPID!=='world')loadMap('world');
  const town=MD.regions?.find(r=>r.name==='Thornwell')||{x0:220,y0:44,y1:150};
  const x=(town.x0+10)*TS,y=(town.y0+(town.y1-town.y0)*.55)*TS;
  let spot=null;
  for(let r=0;r<=96&&!spot;r+=8)for(const [dx,dy]of [[r,0],[-r,0],[0,r],[0,-r]])if(canStand(x+dx,y+dy)){spot=[x+dx,y+dy];break;}
  if(!spot){toast('The Thornwell approach is blocked by the current layout.');return false;}
  restoreThornwellRoyal({stage:0});brambleQuest=0;brambleMap='';brambleDeparture=null;thornwellArrival=null;thornwellMet=false;
  [P.x,P.y]=spot;P.act=null;P.moving=false;camFree=false;cam.z=playZoom();
  dragon.x=P.x+32;dragon.y=P.y;dragon.air=false;dragon.tr=null;
  cam.x=P.x-VW/cam.z/2;cam.y=P.y-VH/cam.z/2;clampCam();syncBrambleParty();
  toast('Replaying the Thornwell visit in this save. Bramble is coming to meet you.');return true;
}
