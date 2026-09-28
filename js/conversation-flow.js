/* A conversation owns its parchment until Goodbye. `ask` still only owns an
   actual choice: speech, gifts and story callbacks keep their normal clocks. */
(function(){
  let session=null,keeping=0,pointer=null,suppressClick=0;
  const box=()=>document.getElementById('bagAsk');
  const isMenu=menu=>!!(menu?.npcConversation||menu?.dragonConversation);
  function prompt(actor,{dragon:telepathy=false,talk,leave}={}){
    clearPadInputs();running=false;P.act=null;P.moving=false;
    const name=telepathy?'Aurelius':actor.n;
    if(actor){if(!telepathy){actor.goto=null;faceToward(actor,P.x,P.y);}faceCorinAt(actor.x,actor.y);}
    const buy=actor?.sells&&!(actor.charm&&!charm[actor.charm])&&!(actor.gift&&!breathHas[actor.gift]);
    ask={quick:1,conversationPrompt:true,npcActor:actor,back:leave,opts:[{n:name,head:true},
      {n:'Talk',go:talk||(()=>telepathy?openDragonConversation():beginNpcTalk(actor))},
      ...(buy?[{n:'Buy supplies',go:()=>openMerchantShop(actor)}]:[]),
      {n:leave?'Ask leave to go':'Leave',go:leave||null}]};
    askPick=1;askDraw();return true;
  }
  function rememberLine(){
    if(!session||session.shopping||!sayEl.classList.contains('on')||!typeDone()||!typeFull)return;
    const last=session.history.at(-1);
    if(last?.speaker===typeWho&&last.text===typeFull)return;
    session.history.push({speaker:typeWho||'Narrator',text:typeFull});
    if(session.history.length>60)session.history.shift();
  }
  function sync(){
    const speaking=sayEl.classList.contains('on');
    document.body.classList.toggle('conversation-speaking',!!session&&speaking&&!session.shopping);
    const hint=session?.greeting?'Choose a topic below':ask?.replyChoices?'Choose Corin’s reply below':!typeDone()?'Tap to finish the line':'Tap to continue';
    sayEl.dataset.advanceHint=hint;
    sayEl.setAttribute('aria-label',hint);
    rememberLine();
    if(session&&!session.shopping)window.EmberConversationView?.update({
      partner:session.menu.npcConversation||'Aurelius',speaker:typeWho,
      phase:ask?.replyChoices?'reply':isMenu(ask)?'explore':'listen',subject:session.subject});
  }
  function clearGreeting(){
    if(!session?.greeting)return;
    const {name,line}=session.greeting;session.greeting=null;
    if(typeWho===name&&typeFull===playerFacingText(line))sayOff();
  }
  function greet(menu){
    if(menu.replyChoices||scene||sayNpc)return;
    const name=menu.dragonConversation?'Aurelius':menu.npcConversation;
    const actor=menu.npcActor;
    const authored=typeof NPC_TOPIC_GREETINGS!=='undefined'&&NPC_TOPIC_GREETINGS[name];
    const fallback=actor?.d?.find(line=>!line.startsWith('Corin: '));
    const line=authored||(fallback?whoSays(actor,fallback)[1]:name+' at your service. What would you like to ask?');
    if(session.greeting?.name===name&&sayEl.classList.contains('on'))return;
    session.greeting={name,line};
    typeStart(name,line);typeAll();sayIsNarr=false;sayEl.classList.remove('narr');
    showFace(name);sayOn();setDialogueTone(!!menu.dragonConversation);
  }
  function reset(){
    clearGreeting();
    window.EmberConversationView?.release();
    session=null;pointer=null;
    for(const cls of ['conversation-session','conversation-speaking','topics-open'])document.body.classList.remove(cls);
    box().classList.remove('conversationListening');
    box().removeAttribute('aria-modal');box().removeAttribute('role');
  }
  function menu(menu){
    if(!session)session={map:MAPID,menu,history:[],subject:'A moment to talk'};
    if(!menu.replyChoices&&session.menu.npcConversation!==menu.npcConversation)session.subject='A moment to talk';
    if(!menu.replyChoices)session.menu=menu;
    session.shopping=false;
    document.body.classList.add('conversation-session');
    box().classList.remove('conversationListening');box().querySelector('.conversationContinue')?.remove();greet(menu);sync();
  }
  function preserve(){return !!session&&keeping>0&&!session.shopping;}
  function shut(){if(session?.shopping)return;reset();}
  function retained(fn){keeping++;try{return fn();}finally{keeping--;sync();}}
  function listening(selected){
    if(!session||ask)return;
    const el=box();el.classList.add('conversationListening');
    for(const button of el.querySelectorAll('button'))button.disabled=true;
    for(const row of el.querySelectorAll('.deckTopic')){
      const chosen=Number(row.dataset.askIndex)===selected;
      row.dataset.selected=String(chosen);row.setAttribute('aria-pressed',String(chosen));
    }
    const status=el.querySelector('.deckProgressText');if(status)status.textContent='Tap the dialogue to continue';
    const prompt=el.querySelector('.deckReplyPrompt');if(prompt)prompt.textContent='Corin’s chosen reply';
    el.querySelector('.conversationContinue')?.remove();
    const next=document.createElement('button');next.className='conversationContinue';next.type='button';
    next.textContent='Continue conversation';next.onclick=()=>advance();
    el.querySelector('.conversationStage')?.appendChild(next);sync();
  }
  function take(option){
    if(!isMenu(ask))return false;
    const old=ask,selected=askPick;window.EmberSfx?.ui?.();
    const leave=!option.go||(old.topicScope==='thornwell-audience'&&option.category==='leave');
    if(leave){goodbye(option.go);return true;}
    rememberLine();
    if(!old.replyChoices&&!option.navigation)session.subject=option.n;
    if(option.category!=='trade'&&!option.navigation&&!old.replyChoices)discussedTopics.add(topicMemoryKey(option));
    clearGreeting();
    retained(()=>{askShut();option.go?.();});
    if(ask?.shop){
      session.shopping=true;document.body.classList.remove('topics-open');document.body.classList.remove('conversation-session');
      window.EmberConversationView?.release();
      sync();
    }else listening(selected);
    return true;
  }
  function goodbye(callback){
    callback??=session?.menu?.npcActor?.thornwellRoyal&&thornwellRoyal.stage===3?thornwellDismissAudience:null;
    // Only offered between lines: required rewards and story after-callbacks
    // cannot be interrupted by closing the parchment mid-exchange.
    askShut();if(callback)callback();
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
    if(!session||session.shopping)return false;
    if(ask?.replyChoices){
      const done=scene?.after;scene=null;sayOff();retained(()=>{askShut();if(done)done();else restore();});
    }else if(ask?.back&&ask.topicScope!=='thornwell-audience'){
      const parent=ask.back;retained(()=>{askShut();parent();});
    }
    // B / Escape at the root leaves the conversation open. Goodbye is explicit.
    return true;
  }
  function tick(){
    if(session&&(session.map!==MAPID||mode!=='play'||bossScene||atlasOpen||bagOpen||editing)){
      const hadMenu=isMenu(ask);reset();if(hadMenu)askShut();else box().style.display='none';
    }
    if(session&&!ask&&!scene&&!sayNpc&&!revealing&&!doorMotion&&!fadeDir)restore();
    sync();
  }
  function playTopic(actor,topic,alternatives=[]){
    const after=()=>openNpcTopics(actor);
    playScene(topic.lines.map(line=>{const [who,words]=whoSays(actor,line);return who?who+': '+words:words;}),
      {who:actor.n,npcActor:actor,after,conversationReplies:{topic,alternatives,handled:new Set()}});
  }
  function beforeLine(current){
    const book=current.conversationReplies,index=current.i;
    if(!session||!book||book.handled.has(index)||!current.lines[index]?.startsWith('Corin: '))return false;
    book.handled.add(index);
    const spoken=current.lines[index].slice(7),previous=session.menu;
    const choose=(words,answer)=>()=>{
      if(scene!==current)return;
      if(answer){
        current.lines=[...current.lines.slice(0,index),'Corin: '+words,...answer];
      }
      current.t=0;showScene();
    };
    const options=[{n:spoken,summary:'Corin · Follow this thread',navigation:true,go:choose(spoken)}];
    if(book.topic?.reply&&index===book.topic.lines.findIndex(l=>l.startsWith('Corin: '))){
      const [words,answer]=book.topic.reply;
      options.push({n:words,summary:'Corin · Another way to answer',navigation:true,go:choose(words,[(current.who||previous.npcConversation||'Aurelius')+': '+answer])});
    }
    const other=book.alternatives?.find(t=>t.title!==book.topic?.title&&t.lines&&!t.go);
    if(other)options.push({n:'Tell me about “'+other.title+'”.',summary:'Corin · Follow a different topic',navigation:true,go:()=>{
      discussedTopics.add(current.npcActor.n+':'+other.title);
      scene=null;sayOff();
      playScene(['Corin: Tell me about “'+other.title+'”.'],{who:current.who,npcActor:current.npcActor,after:()=>playTopic(current.npcActor,other,[])});
    }});
    if(options.length===1){
      options.push({n:'I have another question.',summary:'Corin · Return to our topics',navigation:true,go:()=>{
        scene=null;playScene(['Corin: I have another question.'],{who:current.who,npcActor:current.npcActor,telepathy:current.telepathy,after:current.after});
      }});
    }
    // Keep the NPC’s completed line visible while Corin weighs his answer.
    ask={quick:1,npcConversation:previous.npcConversation,dragonConversation:previous.dragonConversation,
      npcActor:current.npcActor||previous.npcActor,topicScope:'reply',replyChoices:true,back,
      opts:[{n:'What will Corin say?',head:true},...options]};askPick=1;askDraw();sync();return true;
  }
  function key(e){
    if(session&&!session.shopping&&e.key==='Tab'){
      const focusable=[...box().querySelectorAll('button, [tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);
      if(focusable.length){const i=focusable.indexOf(document.activeElement);e.preventDefault();focusable[(i+(e.shiftKey?-1:1)+focusable.length)%focusable.length].focus();}
      return true;
    }
    if(!session||ask)return false;
    const key=e.key.toLowerCase();
    if(!['a','enter',' ','b','escape'].includes(key))return false;
    e.preventDefault();
    if(!e.repeat&&!['b','escape'].includes(key))advance();
    return true;
  }
  function advance(){
    if(window.EmberCloud?.isOpen()||atlasOpen||bagOpen||ovl||editing)return false;
    if(ask?.replyChoices||isMenu(ask)||!sayEl.classList.contains('on')&&!revealing)return false;
    rememberLine();
    if(scene||revealing)advanceScene();else if(sayNpc)interact();else return false;
    tick();return true;
  }
  function candidate(target){
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
  sayEl.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)advance();}});
  window.EmberConversationFlow={prompt,menu,take,back,preserve,shut,tick,sync,playTopic,beforeLine,advance,input,key,goodbye,active:()=>!!session,history:()=>session?.history||[]};
})();
