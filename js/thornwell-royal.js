/* Thornwell's first visit: keep the dragon secret, endure the royal audience,
   then reunite at Forgefalls. Only durable checkpoints belong in a save.
   0: not met, 1: separated, 2: summoned, 3: audience, 4: dismissed,
   5: royal departure, 6: hurry to the falls, 7: reunited (or legacy complete). */
let thornwellRoyal={stage:0,answers:{}};
let thornwellMotion=null,thornwellFlight=null,thornwellSummonZoom=null,thornwellRoyalDragon=null;
let thornwellBartenderState=null;
const THORNWELL_ROYALS=['King Halvard','Serjeant Bram'];
const THORNWELL_RESIDENTS=new Set(['Orin','Linna','Isolde','Cartwright Oswin','Garrow','Wren','Merrin','Asta','Colm','Rowan the Hunter','Ada','Bren','Berta','Della','Ewan','Osric','Alder','Gwyneth','Archivist Elowen','Mira','Oren','Tamsin','Tessa','Master Iven','Brin','Bram','Nell','Sable','Pella','Bess','Ronan','Venn','Hobb','Edric','Dorr','Ser Anwen','Grusk','Fen','Senn','Dain','Rusk','Linnet','Puck','Pip','Vale','Cerys','Nyra','Maren','Celia']);
function captureThornwellRoyal(){return {stage:thornwellRoyal.stage,answers:{...thornwellRoyal.answers}};}
function restoreThornwellRoyal(saved,legacy={}){
  restoreThornwellBartender();
  const stage=saved&&Number.isInteger(saved.stage)?Math.max(0,Math.min(7,saved.stage)):
    legacy.wonAll||legacy.brambleQuest>=2?7:legacy.brambleQuest===1?1:0;
  thornwellRoyal={stage:stage===3?2:stage,answers:{}};
  for(const key of ['eggs','tax','conquest','hunt','riders','search','visit'])if(typeof saved?.answers?.[key]==='string')thornwellRoyal.answers[key]=saved.answers[key];
  releaseThornwellSummonCamera();thornwellMotion=null;thornwellFlight=null;thornwellRoyalDragon=null;
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
  if(typeof ThornwellDialogue!=='undefined'&&ThornwellDialogue.profile(n))return ThornwellDialogue.gift(n)||ThornwellDialogue.context(n);
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
  const first=n.n==='Bess'?'He took the corner table and ordered two suppers. When I named the price, his serjeant asked how much I valued my licence.':
    n.n==='Rowan the Hunter'?'His men have been searching around Thornwell. A hunter notices when strangers begin inspecting familiar ground.':
    /Elowen|Iven|Sable|Celia|Bren|Ewan/.test(n.n)?'The royal men asked which histories we teach. They seemed more troubled by the books than by anything on the road.':
    /Maren|Linna|Isolde|Wren|Oswin/.test(n.n)?'His men call it a royal visit. Those of us supplying the food have another name for it.':
    /Nell|Brin|Mira|Oren|Tamsin|Pella/.test(n.n)?'We were told not to ask the king any questions. Apparently that is the proper way to learn about him.':
    'People have been measuring every word since the royal party arrived. A quiet room is not always a happy one.';
  return {branchKey:'visit/'+group+'/'+(after?'after':'before'),title:after?'After the royal visit':'The king in Thornwell',category:'world',lines:[n.n+': '+first,
    'Corin: '+(after?'They have gone east.':'Does nobody tell him to stop?'),
    n.n+': '+(after?'Then let us hope they keep going. Take care on the road; a crown does not make its wearer kind.':'Not with the king’s knight waiting to teach us manners. Be careful in there.') ]};
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
    'Aurelius: Before we enter Thornwell, we should decide how much attention we can afford. We cannot know how everyone will react.',
    'Corin: I need to find this dog’s owner. That will mean asking people.',
    'Aurelius: Then go in without me. I can stay beyond the town and meet you at the bridge over Forgefalls, southeast of Thornwell.',
    'Corin: If I am delayed, stay hidden near the bridge. I will come as soon as I can.',
    'Aurelius: Agreed. Do not let being on your own persuade you that you have to solve everything alone.',
    'Corin: And do not come looking for me just because I am taking longer than expected. We will meet at Forgefalls.'
  ],()=>{
    if(!thornwellFlight){saveGame();return;}
    thornwellFlight.phase='lift';dragon.dir='e';dragon.moving=false;
    startTransition('up',true);
    thornwellScene([],()=>{saveGame();toast('Find out who Bramble belongs to. Aurelius will wait at Forgefalls.');});
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
  // Keep the seated king at the north edge of the replacement square table,
  // following the editor's published position.
  const table=(MD.roomActors||[]).find(o=>o.editKey==='remaining:tavern:18');
  const x=table?.x??396,top=(table?.y??187)-(table?.extractedCanvas?.height??19);
  const king=thornwellRoyalActor(THORNWELL_ROYALS[0],x,top+5);
  king.seatClipY=top+2;king.sy=top-1;
  npcs.push(king,thornwellRoyalActor(THORNWELL_ROYALS[1],x+38,top+17));
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
  thornwellScene([],()=>{const done=thornwellMotion?.after;thornwellMotion=null;P.moving=false;P.scriptWalking=false;if(done)done();});
  scene.silent=true;scene.until=()=>!thornwellMotion?.path?.length;showScene();
}
function beginRowanReunion(){
  if(MAPID!=='tavern'||brambleQuest!==1||sceneHold()||sayNpc||ask||doorMotion||fadeDir||fade>0)return false;
  const rowan=npcs.find(n=>n.n==='Rowan the Hunter'),dog=npcs.find(n=>n.pettable);
  if(!rowan||!dog)return false;
  // Finish beside Rowan at speaking distance, rather than stopping diagonally
  // below him. Try the other sides only when edited furniture blocks the seat.
  const path=thornwellReachable(P,[[rowan.x-28,rowan.y],[rowan.x+28,rowan.y],[rowan.x,rowan.y+28],[rowan.x,rowan.y-28]]);
  const trail=maddockWalkPath(dog,[P.x,P.y],(x,y)=>canNpcStand(x,y,dog));
  if(!path||!trail)return false;
  const end=path.at(-1),dogSpot=[end[0],end[1]+28];
  const dogTarget=canNpcStand(...dogSpot,dog)?dogSpot:null;
  faceToward(rowan,P.x,P.y);
  thornwellScene(['Rowan: Is that Bramble with you? Bring him over, please!'],()=>{
    thornwellWalkPlayer(path,()=>{brambleTrail=[];faceCorinAt(rowan.x,rowan.y);faceToward(rowan,P.x,P.y);tryBrambleReunion(rowan);},'rowan');
    thornwellMotion.dog=dog;thornwellMotion.trail=trail;thornwellMotion.rowan=rowan;
    thornwellMotion.dogTarget=dogTarget;
    scene.until=()=>!thornwellMotion?.path?.length&&(dogTarget?thornwellMotion?.dogArrived:Math.hypot(dog.x-P.x,dog.y-P.y)<=40);
  },rowan);
  return true;
}
function releaseThornwellSummonCamera(){
  if(thornwellSummonZoom===null)return;
  restoreCameraTarget();cam.z=thornwellSummonZoom;thornwellSummonZoom=null;followCam();clampCam();
}
function frameThornwellCamera(){
  if(!scene?.thornwellSummons){releaseThornwellSummonCamera();return;}
  const king=thornwellKing();if(!king)return;
  if(thornwellSummonZoom===null){restoreCameraTarget();thornwellSummonZoom=cam.z;}
  cam.z=thornwellSummonZoom;
  cam.x=king.x-VW/cam.z/2;cam.y=king.y-16-VH/cam.z/2;
}
function thornwellSummon(){
  const king=thornwellKing();if(!king)return;
  const path=thornwellReachable(P,[[king.x-13,king.y+43],[king.x-32,king.y+38],[king.x+30,king.y+46],[king.x-48,king.y+30]]);
  if(!path)return; // Retry a real route; never teleport through edited furniture.
  thornwellCheckpoint(2);
  thornwellScene([
    'King Halvard: I know that face. Millwood, was it? You were carrying the elder’s eggs.',
    'Corin: I was, Your Majesty.',
    'King Halvard: Come to the table. I would like to hear what has brought you farther from home.',
    'Serjeant Bram: The king has asked you to approach.'
  ],()=>{releaseThornwellSummonCamera();thornwellWalkPlayer(path,()=>{
    faceCorinAt(king.x,king.y);thornwellRoyal.stage=3;thornwellRoyal.answers.visit='yes';
    thornwellScene([
      'King Halvard: Your name, boy. I remember the errand better than the introduction.',
      'Corin: Corin, from Millwood. I brought a lost dog back to its owner.',
      'King Halvard: A useful morning, then. Bess, a moment. There is something I want to establish before we continue.'
    ],()=>thornwellCallBartender(king),king);
  });},king);
  scene.thornwellSummons=true;
}
function thornwellAudienceLines(actor,lines,after){thornwellScene(lines,after||(()=>openThornwellAudience(actor)),actor);}
function prepareBessWalkingArt(){
  if(SPR.tavern_bess_walk_d)return;
  // The counter actor contains only the visible head and shoulders. Give him
  // the apron/boots and directional steps from the matching craftsman set.
  for(const action of ['idle','walk'])for(const dir of ['d','u','e','w']){
    const source=SPR['pack_smith_'+action+'_'+dir],key='tavern_bess_'+action+'_'+dir;
    const strip=document.createElement('canvas');strip.width=source[4]*32;strip.height=32;
    const g=strip.getContext('2d');g.imageSmoothingEnabled=false;
    for(let frame=0;frame<source[4];frame++){
      drawGameImage(g,sheetOf(source),source[0]+frame*source[2],source[1],source[2],source[3],frame*32+(32-source[2])/2,32-source[3],source[2],source[3]);
      if(dir==='d'){
        g.clearRect(frame*32,0,32,22);
        const head=SPR.tavern_anim_9;
        drawGameImage(g,sheetOf(head),head[0]+(frame%head[4])*head[2],head[1],head[2],22,frame*32,0,32,22);
      }
    }
    animalSheets[key]=strip;SPR[key]=[0,0,32,32,source[4],key];
  }
}
function thornwellBartenderWalk(bess,path,after){
  thornwellMotion={kind:'bartender',actors:[{actor:bess,path,delay:0}]};
  thornwellScene([],()=>{thornwellMotion=null;bess.scriptWalking=false;bess.moving=false;after();});
  scene.until=()=>!path.length;
}
function restoreThornwellBartender(){
  const state=thornwellBartenderState;if(!state)return;
  Object.keys(state.actor).forEach(k=>delete state.actor[k]);Object.assign(state.actor,state.saved);
  state.art.editorDeleted=false;thornwellBartenderState=null;
}
function thornwellCallBartender(king){
  const prompt=()=>{
    thornwellScene(['King Halvard: Now, Corin. You may ask your questions. I will decide which deserve an answer.'],()=>{
      if(globalThis.window?.EmberConversationFlow)window.EmberConversationFlow.prompt(king,{greeted:true,talk:()=>openThornwellAudience(king),leave:thornwellDismissAudience});
      else openThornwellAudience(king);
    },king);
  };
  const bess=npcs.find(n=>n.n==='Bess'&&npcHere(n)),art=MD.roomActors.find(a=>a.spr==='tavern_anim_9'&&!a.editorDeleted);
  if(!bess||!art){prompt();return;}
  const home=[bess.x,bess.y],saved={...bess};
  const counter=MD.roomBlocks.find(r=>home[0]>=r[0]&&home[0]<=r[2]&&home[1]>=r[1]&&home[1]<=r[3]);
  const side=counter?[counter[2]+14,home[1]]:home;
  const proxy={...bess,x:side[0],y:side[1]};
  const route=thornwellReachable(proxy,[[king.x-36,king.y+24],[king.x-44,king.y+38],[king.x,king.y+44]]);
  if(!route){prompt();return;}
  const path=[...(counter?[side]:[]),...route],back=[...path.slice(0,-1).reverse().map(p=>p.slice()),home];
  prepareBessWalkingArt();art.editorDeleted=true;
  thornwellBartenderState={actor:bess,saved,art};
  Object.assign(bess,{school:false,packSpr:'tavern_bess',packWalk:true,packDirections:true,stationary:true,px:bess.x,py:bess.y});
  delete bess.talkX;delete bess.talkY;
  thornwellBartenderWalk(bess,path,()=>{
    faceToward(bess,king.x,king.y);
    thornwellScene([
      'King Halvard: Bess, my officers are following reports from the northern woods. Has a guest described a dragon landing there?',
      'Bess: I have heard people guessing, sire. No guest has given me an account I could vouch for.',
      'King Halvard: You are not required to judge the account. You are required to remember the speaker’s name and tell Bram.',
      'Bess: I understand what you are asking.',
      'King Halvard: Good. You may return to your work.'
    ],()=>thornwellBartenderWalk(bess,back,()=>{
      restoreThornwellBartender();prompt();
    }),king);
  });
}
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
    ['tax','conquest','hunt','riders'].some(key=>thornwellRoyal.answers[key]==='defiant')?
      'King Halvard: You have used my invitation to question rather freely. Do not assume every officer will extend the same patience.':
      'King Halvard: You have had your answers. I expect you to remember the parts that concern your responsibilities.',
    'Corin: May I continue my journey, Your Majesty?',
    'King Halvard: Yes. If you hear a report of a dragon, give it to my officers before turning it into a village tale.',
    'Serjeant Bram: You are dismissed. Leave the king room to finish his visit.'
  ],()=>{thornwellCheckpoint(4);toast('Leave the Copper Cup, then meet Aurelius at Forgefalls.');});
}
function openThornwellAudience(actor){
  if(!actor?.thornwellRoyal)return false;
  if(brambleQuest<3){if(brambleQuest===1)beginRowanReunion();return true;}
  if(thornwellRoyal.stage<3){thornwellScene([actor.n+': Return the dog to his owner first. The king’s table will still be here.'],null,actor);return true;}
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
function thornwellKingTopics(n){return ThornwellAudienceDialogue.options(n);}
function thornwellKnightTopics(n){return ThornwellAudienceDialogue.options(n);}
function thornwellDoorArrived(from){
  if(from==='tavern'&&MAPID==='world'&&thornwellRoyal.stage===4)thornwellCheckpoint(5);
}
function thornwellAudiencePending(){return MAPID==='tavern'&&brambleQuest>=2&&thornwellRoyal.stage>=1&&thornwellRoyal.stage<=3;}
function thornwellDeparture(){
  const exit=W.maps.tavern.doors.find(d=>d.to==='world');if(!exit)return;
  const origin=[exit.tx*TS+8,exit.ty*TS+TS];
  // The ceremonial escort has idle art only. Stage the entire party while
  // black, just as in Millwood; never swap them for the Cinderhold fighters.
  thornwellScene([]);thornwellMotion={kind:'blackout'};thornwellRoyalDragon=null;
  royalBlackout('Serjeant Bram: Keep this road clear for the king!',()=>{
    npcs=npcs.filter(n=>!n.thornwellRoyal);
    const forward=[[P.x,P.y+32],[P.x+16,P.y+32],[P.x-16,P.y+32]].find(p=>canStand(...p));
    if(forward)[P.x,P.y]=forward;
    for(const [i,name]of THORNWELL_ROYALS.entries()){
      const offsets=[[0,8],[-30,20]];
      const actor=thornwellRoyalActor(name,origin[0]+offsets[i][0],origin[1]+offsets[i][1]);
      const spot=[[actor.x,actor.y],[actor.x,actor.y+16],[actor.x,actor.y-16],origin].find(p=>thornwellClear(...p,actor));
      if(spot){[actor.x,actor.y]=spot;actor.px=actor.x;actor.py=actor.y;}
      npcs.push(actor);
    }
    const king=thornwellKing();faceCorinAt(king.x,king.y);
  },()=>{
    const king=thornwellKing();thornwellMotion=null;
    thornwellScene([
      'King Halvard: We have spent enough time here, Bram. The road past Forgefalls will take us towards Cinderhold.',
      'Serjeant Bram: Your dragon is approaching, Your Majesty. I will clear the departure.'
    ],thornwellRoyalArrival,king);
    scene.hold=()=>fade<=0;showScene();
    // Reveal the party only after Bram's announcement has been read in black.
  });
}
function thornwellRoyalArrival(){
  const king=thornwellKing();if(!king){thornwellRoyalExit();return;}
  const target=[king.x+58,king.y+8],start=[Math.max(cam.x+VW/cam.z,target[0])+160,target[1]-72];
  thornwellRoyalDragon={x:start[0],y:start[1],target,dir:'w',arrived:false};
  thornwellMotion={kind:'dragonArrival',pause:0};
  thornwellScene([]);scene.silent=true;
}
function thornwellRoyalExit(){
  thornwellMotion={kind:'blackout'};
  royalBlackout('Stand back. The king needs this space.',()=>{
    // Change positions only under full black, with the same published collision
    // checks used by ordinary movement. No knight plays a walking animation.
    // Stay in the entrance lane, clear of Merrin's western patio table.
    const safe=(x,y)=>canStand(x,y)&&npcs.every(n=>n.thornwellRoyal||n.editorDeleted||Math.hypot(n.x-x,n.y-y)>40);
    const aside=[[P.x+8,P.y+12],[P.x,P.y+16],[P.x+16,P.y+16],[P.x,P.y]].find(p=>safe(...p));
    if(aside)[P.x,P.y]=aside;
    P.moving=false;npcs=npcs.filter(n=>!n.thornwellRoyal);thornwellRoyalDragon=null;
  },()=>{
    thornwellMotion=null;thornwellCheckpoint(6);
    thornwellScene([
      'Corin: They are taking the road to Forgefalls. I told Aurelius to wait near that bridge.',
      'Corin: He knows to stay hidden, but I need to reach him before they do.'
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
    'Corin: Aurelius! I was afraid I would reach the bridge too late.',
    'Aurelius: I stayed under cover, as we agreed. What happened in Thornwell?',
    'Corin: Halvard was at the Copper Cup. He recognised me from the egg errand and called me over. He is searching for signs of a dragon in the northern woods.',
    'Aurelius: Did he learn anything about us?',
    'Corin: I did not tell him. Bess had no sighting to report. Then he left by this road, and I thought he might find you waiting.',
    'Aurelius: I saw his party pass and kept still until they were gone. He did not see me.',
    'Corin: I kept wanting to hurry. It was difficult to sit there and listen to him talk about hunting dragons.',
    'Aurelius: You got away without leading him to me. I am grateful you trusted me to keep our agreement.',
    'Corin: I returned the dog too. His name is Bramble, and Rowan was very glad to see him.',
    'Aurelius: Then we have both kept somebody waiting long enough. Let us go on together. I would rather meet the next town beside you.'
  ],()=>{thornwellFlight=null;thornwellCheckpoint(7);refreshWingBtn();toast('Reunited at Forgefalls. Aurelius travels with you again.');});
}
function stepThornwellRoyal(dt){
  if(mode!=='play'||editing)return;
  syncThornwellRoyals();
  if(thornwellMotion){
    const motion=thornwellMotion;
    if(motion.kind==='blackout')return;
    if(motion.kind==='dragonArrival'){
      const d=thornwellRoyalDragon;if(!d)return;
      const dx=d.target[0]-d.x,dy=d.target[1]-d.y,dist=Math.hypot(dx,dy),step=Math.min(dist,125*dt);
      if(dist>0){d.x+=dx/dist*step;d.y+=dy/dist*step;}
      if(dist<=step){d.arrived=true;d.dir='s';motion.pause+=dt;}
      if(motion.pause>=.7){
        thornwellMotion=null;
        thornwellScene(['King Halvard: The visit is concluded. Bram, attend me.','Serjeant Bram: Stand clear while His Majesty departs.'],thornwellRoyalExit,thornwellKing());
      }
      return;
    }
    if(motion.path)thornwellMove(P,motion.path,motion.kind==='shove'?180:82,dt);
    if(motion.rowan)faceToward(motion.rowan,P.x,P.y);
    if(motion.dog){
      if(!motion.path?.length&&motion.dogTarget){
        if(!motion.dogArrival)motion.dogArrival=maddockWalkPath(motion.dog,motion.dogTarget);
        moveBrambleActor(motion.dog,motion.dogArrival,70,dt);
        motion.dogArrived=!!motion.dogArrival&&!motion.dogArrival.length;
      }else{
      const last=motion.trail.at(-1);
      if(!last||Math.hypot(P.x-last[0],P.y-last[1])>=4)motion.trail.push([P.x,P.y]);
      const gap=Math.hypot(motion.dog.x-P.x,motion.dog.y-P.y);
      if(gap>28)moveBrambleActor(motion.dog,motion.trail,Math.min(90,(gap-28)/dt),dt);
      }
    }
    for(const item of motion.actors||[]){
      item.delay-=dt;if(item.delay>0)continue;
      item.actor.away=false;thornwellMove(item.actor,item.path,68,dt);
      if(motion.kind==='march'&&!item.path.length)item.actor.away=true;
    }
    return;
  }
  if(sceneHold()||sayNpc||ask||doorMotion||fadeDir||fade>0||ride||mounted)return;
  if(MAPID==='tavern'&&brambleQuest===1){beginRowanReunion();return;}
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
  if(stage===1&&brambleQuest<3)return ['Find Bramble’s owner','Thornwell',brambleQuest>=2?'Wait for Bramble and his owner to leave together.':atlasBrambleClue()+' Aurelius is staying out of sight and will meet you at Forgefalls.'];
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
