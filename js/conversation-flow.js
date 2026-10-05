/* A conversation owns its parchment until Goodbye. `ask` still only owns an
   actual choice: speech, gifts and story callbacks keep their normal clocks. */
(function(){
  let session=null,keeping=0,pointer=null,suppressClick=0,autoReply=null;
  const box=()=>document.getElementById('bagAsk');
  const isMenu=menu=>!!(menu?.npcConversation||menu?.dragonConversation);
  function prompt(actor,{dragon:telepathy=false,talk,leave,greeted=false}={}){
    if(!telepathy&&talkShroomLookout(actor))return true;
    if(!telepathy&&actor?.n==='King Halvard'&&MAPID!=='tavern')return false;
    clearPadInputs();running=false;P.act=null;P.moving=false;
    // Fen's gift used to bypass introductions and prepend a familiar greeting.
    // Learn Corin's name through the actual first meeting before offering it.
    if(!telepathy&&actor?.n==='Fen'&&!charm.twin&&!ThornwellDialogue.remembers(actor,'met')){
      const introduction=ThornwellDialogue.introduction(actor);
      playScene(introduction.lines,{who:actor.n,npcActor:actor,conversationGreeting:true,
        after:()=>{introduction.done();prompt(actor,{talk,leave,greeted:true});}});
      return true;
    }
    // Unclaimed gifts are the greeting, before optional Talk or shopping.
    // Use the existing dialogue and completion callback so grants stay once-only.
    if(!telepathy&&(npcStoryGiftPending(actor)||
      (actor.n!=='Dunstan'&&actor.charm&&!charm[actor.charm])||
      (actor.gift&&!breathHas[actor.gift])||canCamperGiveFishingPole(actor))){
      beginNpcTalk(actor,true,canCamperGiveFishingPole(actor));
      if(sayNpc===actor){
        const greeting=typeof NPC_TOPIC_GREETINGS!=='undefined'&&NPC_TOPIC_GREETINGS[actor.n]||'Hello, Corin. It is good to see you.';
        const gift=actor.charm&&!charm[actor.charm]?CHARM_NOTE[actor.charm]?.replace(/^Corin obtained (?:the )?/, '').replace(/!$/, ''):
          actor.gift&&!breathHas[actor.gift]?actor.gift+' Heartstone':null;
        actor.said=[actor.n+': '+greeting,...actor.said,
          ...(gift?[actor.n+': Here, take this '+gift+'. It is yours.']:[])];
        const [who,words]=whoSays(actor,actor.said[0]);
        typeStart(who,words);showFace(who);typePaint();
      }
      return true;
    }
    const name=telepathy?'Aurelius':actor.n,map=MAPID;
    if(actor){if(!telepathy){actor.goto=null;faceToward(actor,P.x,P.y);}faceCorinAt(actor.x,actor.y);}
    const merchant=!!actor?.sells;
    const invite=()=>{
      if(MAPID!==map||mode!=='play')return;
      ask={quick:1,conversationPrompt:true,npcActor:actor,back:leave,opts:[{n:name,head:true},
        {n:'Talk',go:talk||(()=>telepathy?openDragonConversation():beginNpcTalk(actor))},
        ...(merchant?[{n:'Purchase',go:()=>openMerchantShop(actor)}]:[]),
        {n:'Maybe Another Time',go:leave||null}]};
      askPick=1;askDraw();
    };
    // Greetings belong to the world, before either full-screen conversation
    // or shopping. A merchant speaks once; other characters hear Corin reply.
    if(greeted){invite();return true;}
    const author=(typeof ForgewickDialogue!=='undefined'&&ForgewickDialogue.profile(actor))?ForgewickDialogue:
      (typeof ThornwellDialogue!=='undefined'&&ThornwellDialogue.profile(actor))?ThornwellDialogue:
      (typeof MillwoodShroomDialogue!=='undefined'&&MillwoodShroomDialogue.profile(actor))?MillwoodShroomDialogue:null;
    const regional=!!author;
    // Required introductions already own these early story beats. In
    // particular, Nan must not discover the dragon twice before her gift.
    if(regional&&((name==='Nan Ferrow'&&(!hasDragon()||nanGiftPending()))||
      (name==='Hettie'&&quest<Q.NOISE))){beginNpcTalk(actor);return true;}
    const introduction=regional?author.introduction(actor):NpcContextAudit.introduction(actor);
    if(introduction){
      playScene(introduction.lines,{who:name,npcActor:actor,conversationGreeting:true,
        after:()=>{introduction.done();invite();}});
      return true;
    }
    const authored=typeof NPC_TOPIC_GREETINGS!=='undefined'&&NPC_TOPIC_GREETINGS[name];
    const fallback=actor?.d?.find(line=>!line.startsWith('Corin: '));
    const line=authored||(fallback?whoSays(actor,fallback)[1]:'Hello, Corin.');
    const reply=typeof CORIN_TOPIC_GREETINGS!=='undefined'&&CORIN_TOPIC_GREETINGS[name]||'Hello, '+name+'. Have you a moment to talk?';
    playScene([name+': '+line,...(merchant?[]:['Corin: '+reply])],
      {who:name,npcActor:actor,telepathy,conversationGreeting:true,after:invite});
    return true;
  }
  function sync(){
    const speaking=sayEl.classList.contains('on');
    document.body.classList.toggle('conversation-speaking',!!session&&speaking&&!session.shopping);
    const hint=session?(welcoming()?'Choose Chat to begin':session.browsing?'Choose a topic below':ask?.replyChoices?'Choose Corin’s reply below':'Next'):!typeDone()?'Tap to finish the line':'Tap to continue';
    sayEl.dataset.advanceHint=hint;
    sayEl.setAttribute('aria-label',hint);
    if(session&&!session.shopping)window.EmberConversationView?.update({
      partner:session.menu.npcConversation||'Aurelius',speaker:typeWho,
      phase:ask?.replyChoices?'reply':isMenu(ask)?session.browsing?'explore':'welcome':'listen',canLeave:canGoodbye(),backAvailable:needsBack(),automatic:!!autoReply});
  }
  function idle(menu){
    if(menu.replyChoices||scene||sayNpc)return;
    if(session.exchanged){session.exchanged=false;session.browsing=false;}
    window.EmberConversationView?.clearCorin();
    sayOff();showFace(null);setDialogueTone(!!menu.dragonConversation);
  }
  function reset(){
    window.EmberConversationPanels?.close(false);
    if(!scene&&!sayNpc&&!revealing)sayOff();
    window.EmberConversationView?.release();
    session=null;pointer=null;autoReply=null;
    for(const cls of ['conversation-session','conversation-speaking','topics-open'])document.body.classList.remove(cls);
    box().classList.remove('conversationListening');
    box().removeAttribute('aria-modal');box().removeAttribute('role');
  }
  function menu(menu){
    const first=!session;
    window.EmberFriendship?.register(menu);
    if(!session)session={map:MAPID,menu,browsing:false,exchanged:false};
    if(!menu.replyChoices&&session.menu.npcConversation!==menu.npcConversation){session.exchanged=false;session.browsing=false;}
    if(!menu.replyChoices)session.menu=menu;
    session.shopping=false;
    document.body.classList.add('conversation-session');
    box().classList.remove('conversationListening');idle(menu);sync();
    if(first&&window.EmberFriendship?.needsTutorial())window.EmberConversationPanels?.open('tutorial');
  }
  function preserve(){return !!session&&keeping>0&&!session.shopping;}
  function shut(){if(session?.shopping)return;reset();}
  function retained(fn){keeping++;try{return fn();}finally{keeping--;sync();}}
  function listening(selected){
    if(!session||ask)return;
    const el=box();el.classList.add('conversationListening');
    for(const button of el.querySelectorAll('.deckProfileToggle, .deckTopic, .deckReply'))button.disabled=true;
    for(const row of el.querySelectorAll('.deckTopic, .deckReply')){
      const chosen=Number(row.dataset.askIndex)===selected;
      row.dataset.selected=String(chosen);row.setAttribute('aria-pressed',String(chosen));
    }
    sync();
  }

  function openingQuestion(option){
    const title=playerFacingText(option.opening||option.n).trim();
    if(/[?!.]$/.test(title))return title;
    if(/^(who|what|when|where|why|how|can|could|do|does|did|have|has|is|are|will|would|may)\b/i.test(title))return title+'?';
    if(/^(I|we|hello|hi|tell|let[’']s)\b/i.test(title))return title+'.';
    return 'Tell me about '+title.replace(/^(The|A|An|Your|Our|My)\b/,word=>word.toLowerCase())+'.';
  }
  function take(option){
    if(window.EmberConversationPanels?.isOpen())return true;
    if(!isMenu(ask))return false;
    if(welcoming()){openChat();return true;}
    autoReply=null;
    const old=ask,selected=askPick;window.EmberSfx?.ui?.();
    const leave=!option.go||(old.topicScope==='thornwell-audience'&&option.category==='leave');
    if(leave){goodbye(option.go);return true;}
    if(!old.replyChoices&&!option.navigation&&option.category!=='trade'){
      session.exchanged=true;session.topicReadKey=topicMemoryKey(option);session.friendshipTopic=window.EmberFriendship?.start(old,option);
      window.EmberConversationView?.beginTopic(openingQuestion(option));
    }
    if(!option.navigation||old.replyChoices)session.browsing=false;
    retained(()=>{askShut();option.go?.();});
    if(old.replyChoices&&scene&&!ask){session.exchanged=true;autoReply={scene,index:scene.i,read:0,last:performance.now()};}
    if(ask?.shop){
      session.shopping=true;document.body.classList.remove('topics-open');document.body.classList.remove('conversation-session');
      window.EmberConversationView?.release();
      sync();
    }else listening(selected);
    return true;
  }
  function canGoodbye(){
    // Authored topic branches can end immediately. Finish required story
    // dialogue and item reveals first so their rewards/callbacks still run.
    return !!session&&!session.shopping&&!revealing&&!sayNpc&&(!scene||!!scene.conversationReplies);
  }
  function welcoming(){return !!session&&!session.shopping&&isMenu(ask)&&!ask.replyChoices&&!session.browsing&&!ask._profileOpen;}
  function openChat(){
    if(window.EmberConversationPanels?.isOpen()||!welcoming())return false;
    session.browsing=true;window.EmberSfx?.ui?.();sync();return true;
  }
  function needsBack(){
    return !!session&&!session.shopping&&isMenu(ask)&&!!(ask._profileOpen||ask.replyChoices||session.browsing);
  }
  function secondary(){
    if(window.EmberConversationPanels?.isOpen())return window.EmberConversationPanels.close();
    if(needsBack()){askBack();sync();return true;}
    return goodbye();
  }
  function goodbye(callback){
    if(!canGoodbye())return false;
    // Leaving after the final answer has fully appeared still finishes the
    // topic; leaving mid-exchange or backing out of a choice does not.
    if(scene?.conversationReplies&&scene.i===scene.lines.length-1&&typeDone()){
      if(session.topicReadKey)discussedTopics.add(session.topicReadKey);
      if(session.friendshipTopic)window.EmberFriendship?.complete(session.friendshipTopic);
      else if(session.topicReadKey)saveGame();
      session.friendshipTopic=null;session.topicReadKey=null;
    }
    const farewellNpc=session?.menu?.npcActor;
    callback??=session?.menu?.npcActor?.thornwellRoyal&&thornwellRoyal.stage===3?thornwellDismissAudience:null;
    if(scene?.conversationReplies){scene=null;sayOff();}
    askShut();if(callback)callback();
    if(farewellNpc?.n==='Nan Ferrow')playScene([
      'Corin: I’ll be off then, Nan.',
      'Nan Ferrow: Take care, love. Stop by sometime and I’ll whip you up something special.'
    ],{who:farewellNpc.n,npcActor:farewellNpc});
    return true;
  }
  function next(){
    if(window.EmberConversationPanels?.isOpen())return window.EmberConversationPanels.close();
    if(!session||session.shopping)return false;
    if(welcoming())return openChat();
    if(isMenu(ask)){askTake();return true;}
    return advance();
  }
  function restore(){
    if(!session)return;
    const previous=session.menu;
    if(previous.dragonConversation){ask=null;openDragonConversation(previous.topicScope||'root');}
    else if(previous.npcActor?.thornwellRoyal)openThornwellAudience(previous.npcActor);
    else if(previous.npcActor&&!npcStoryGiftPending(previous.npcActor))openNpcTopics(previous.npcActor);
    else{ask=previous;askDraw();}
  }
  function back(){
    autoReply=null;
    if(!session||session.shopping)return false;
    session.friendshipTopic=null;session.topicReadKey=null;
    if(ask?.replyChoices){
      const done=scene?.after;scene=null;sayOff();retained(()=>{askShut();if(done)done();else restore();});
    }else if(ask?.back&&ask.topicScope!=='thornwell-audience'){
      const parent=ask.back;retained(()=>{askShut();parent();});
    }else if(session.browsing){session.browsing=false;sync();}
    // Internal Back navigation never closes the root; the secondary control does.
    return true;
  }
  function tick(now=performance.now()){
    if(session&&(session.map!==MAPID||mode!=='play'||bossScene||atlasOpen||bagOpen||editing)){
      const hadMenu=isMenu(ask);reset();if(hadMenu)askShut();else box().style.display='none';
    }
    if(autoReply){
      const playback=autoReply,current=scene;
      const dt=Math.max(0,Math.min(50,now-playback.last));playback.last=now;
      // The final answer stays on screen; Next restores Chat beneath that answer.
      if(current!==playback.scene||ask||!session||current.i>=current.lines.length-1)autoReply=null;
      else if(!document.hidden&&!window.EmberConversationPanels?.isOpen()&&!window.EmberCloud?.isOpen()&&!revealing&&!current.hold&&!current.silent&&!current.arriving&&sayEl.classList.contains('on')){
        if(playback.index!==current.i){playback.index=current.i;playback.read=0;}
        if(typeDone()){
          playback.read+=dt;
          // Leave each completed line long enough to read; Next can still hurry it.
          const pause=Math.max(1100,Math.min(4500,typeFull.length*24));
          if(playback.read>=pause){sync();advanceScene();playback.read=0;}
        }else playback.read=0;
      }
    }
    if(session&&!ask&&!scene&&!sayNpc&&!revealing&&!doorMotion&&!fadeDir)restore();
    sync();
  }
  function playTopic(actor,topic){
    if(actor.thornwellRoyal)topic={...topic,branchKey:'royal/'+actor.n+'/'+topic.title};
    const after=()=>openNpcTopics(actor);
    playScene(window.EmberConversationBranches.prepare(topic.lines,actor.n,topic).map(line=>{const [who,words]=whoSays(actor,line);return who?who+': '+words:words;}),
      {who:actor.n,npcActor:actor,after,conversationReplies:{topic,handled:new Set()}});
  }
  function beforeLine(current){
    const book=current.conversationReplies,index=current.i;
    if(!session||!book||index===0||book.handled.has(index)||!current.lines[index]?.startsWith('Corin: '))return false;
    autoReply=null;book.handled.add(index);
    const spoken=current.lines[index].slice(7),previous=session.menu;
    const choose=(words,answer)=>()=>{
      if(scene!==current)return;
      book.topic.onReply?.(words);
      if(answer){
        const next=current.lines.findIndex((line,i)=>i>index&&line.startsWith('Corin: '));
        const end=next<0?current.lines.length:next;
        current.lines.splice(index,end-index,'Corin: '+words,...answer);
      }
      current.t=0;showScene();
    };
    const options=[{n:spoken,summary:'Corin · Follow this thread',navigation:true,go:choose(spoken)}];
    for(const [words,answer]of window.EmberConversationBranches.choices(current,index)){
      if(options.some(o=>o.n===words))continue;
      options.push({n:words,navigation:true,go:choose(words,[(current.who||previous.npcConversation||'Aurelius')+': '+answer])});
      if(options.length>=3)break;
    }
    // Keep the NPC’s completed line visible while Corin weighs his answer.
    ask={quick:1,npcConversation:previous.npcConversation,dragonConversation:previous.dragonConversation,
      npcActor:current.npcActor||previous.npcActor,topicScope:'reply',replyChoices:true,back,
      opts:[{n:'What will Corin say?',head:true},...options]};askPick=1;askDraw();sync();return true;
  }
  function key(e){
    if(window.EmberConversationPanels?.isOpen())return window.EmberConversationPanels.key(e);
    if(session&&!session.shopping&&e.key==='Tab'){
      const focusable=[...box().querySelectorAll('button, [tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);
      if(focusable.length){const i=focusable.indexOf(document.activeElement);e.preventDefault();focusable[(i+(e.shiftKey?-1:1)+focusable.length)%focusable.length].focus();}
      return true;
    }
    if(!session||session.shopping)return false;
    const key=e.key.toLowerCase();
    if(welcoming()&&key.startsWith('arrow')){e.preventDefault();return true;}
    if(!['a','enter',' ','b','escape'].includes(key))return false;
    e.preventDefault();
    if(!e.repeat){if(['b','escape'].includes(key))secondary();else next();}
    return true;
  }
  function advance(){
    if(window.EmberCloud?.isOpen()||atlasOpen||bagOpen||ovl||editing)return false;
    if(ask?.replyChoices||isMenu(ask)||!sayEl.classList.contains('on')&&!revealing)return false;
    if(window.EmberConversationPanels?.isOpen())return false;
    sync(); // Capture the completed line before the next speaker replaces it.
    const current=scene,finished=!!(current&&current.i===current.lines.length-1&&typeDone()&&current.t>=.2&&!current.hold&&!current.silent&&!current.arriving&&!revealing);
    const credit=finished?session?.friendshipTopic:null,readKey=finished?session?.topicReadKey:null;
    if(scene||revealing)advanceScene();else if(sayNpc)interact();else return false;
    if(finished&&scene!==current){
      if(readKey)discussedTopics.add(readKey);
      if(session){session.friendshipTopic=null;session.topicReadKey=null;}
      if(credit)window.EmberFriendship?.complete(credit);else if(readKey)saveGame();
      // The scene callback rendered its menu before this completion was saved.
      if(isMenu(ask))askDraw();
      sync();
    }
    tick();return true;
  }
  function candidate(target){
    if(session&&!session.shopping)return false; // Full conversations use their A / B controls.
    if(target?.closest?.('button, input, select, textarea, a'))return false;
    if(!target?.closest?.('.conversationStage')&&target?.closest?.('#bagAsk, #deck, #merchantShop, #cloudSaveDialog'))return false;
    return gameplayStarted&&!window.EmberCloud?.isOpen()&&!editing&&!atlasOpen&&!bagOpen&&!ovl&&!ask?.shop&&
      (sayEl.classList.contains('on')||revealing)&&!!target?.closest?.('#say, #sayname, #face, #cv, #stage, #reveal, #revealCap, .conversationStage');
  }
  function input(e){
    const target=candidate(e.target),stop=()=>{e.preventDefault();e.stopImmediatePropagation();return true;};
    const start=()=>{if(e.target?.closest?.('.conversationStage')){e.stopImmediatePropagation();return true;}return stop();};
    if(e.type==='pointerdown'){
      if(pointer){pointer.cancelled=true;return target?stop():false;}
      if(!target)return false;
      pointer={id:e.pointerId,x:e.clientX,y:e.clientY,cancelled:e.isPrimary===false};return start();
    }
    if(e.type==='pointermove'&&pointer){
      if(e.pointerId!==pointer.id||Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>12)pointer.cancelled=true;
    }
    if((e.type==='pointerup'||e.type==='pointercancel')&&pointer){
      const tap=pointer;pointer=null;suppressClick=performance.now()+650;
      if(e.type==='pointerup'&&!tap.cancelled&&e.pointerId===tap.id&&target&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<=12)advance();
      return stop();
    }
    if(target&&['touchstart','mousedown','click'].includes(e.type)){
      if(e.type==='click'&&e.detail===0&&performance.now()>suppressClick)advance();
      return e.type==='click'?stop():start();
    }
    return false;
  }
  for(const kind of ['pointermove','pointerup','pointercancel'])document.addEventListener(kind,input,{capture:true,passive:false});
  sayEl.setAttribute('role','button');sayEl.tabIndex=0;
  sayEl.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat){if(session)next();else advance();}}});
  window.EmberConversationFlow={prompt,menu,take,back,preserve,shut,tick,sync,playTopic,beforeLine,advance,next,input,key,goodbye,canGoodbye,needsBack,secondary,welcoming,openChat,active:()=>!!session,partner:()=>session?.map===MAPID&&!session.shopping?session.menu.npcActor?.n||session.menu.npcConversation:null};
})();
