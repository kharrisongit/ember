/* The conversation deck renders the existing choices; story callbacks remain
   responsible for gifts, knowledge and progression. */
(function(){
  const icons={lead:'compass',story:'chat',world:'book',trade:'coin',greeting:'sun',leave:'arrow',folder:'book'};
  const paths={compass:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM16 8l-3 5-5 3 3-5Z',chat:'M4 4h16v12H9l-5 4V4Zm4 5h8M8 12h5',book:'M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15',coin:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3 6H9v4h6v4H9m3-11v14',sun:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-6v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2',arrow:'M4 12h15m-6-6 6 6-6 6'};
  function symbol(kind){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[icons[kind]||'chat']+'"/></svg>';}
  const category=o=>o.category||(o.navigation?'folder':!o.go?'leave':/^(Hello|I came for)/.test(o.n)?'greeting':/supplies/.test(o.n)?'trade':/Halvard|Wingfall|history|land and/.test(o.n)?'world':/quest|next\?|lead|temple|Heartstone|rod|lantern|ward|Bramble|summon/i.test(o.n)?'lead':'story');
  const seen=o=>discussedTopics.has(topicMemoryKey(o));
  const visible=o=>!o.head&&!o.backNavigation&&category(o)!=='leave';
  function node(tag,cls,text){const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=playerFacingText(text);return e;}
  function back(){
    if(ask?._profileOpen){ask._profileOpen=false;askDraw();return true;}
    return false;
  }
  function prompt(box,rows){
    box.classList.add('conversationPrompt');box.style.display='block';box.style.width='';
    box.setAttribute('role','dialog');box.setAttribute('aria-label',ask.opts[0].n+' — interact');
    const heading=node('div','conversationPromptHeading',ask.opts[0].n);
    const hint=document.getElementById('topicScrollHint');if(hint)hint.hidden=true;
    rows.replaceChildren();box.replaceChildren(heading,rows,...(hint?[hint]:[]));
    ask.opts.forEach((option,i)=>{
      if(option.head)return;
      const button=node('button','conversationPromptChoice');button.type='button';button.dataset.askIndex=i;
      button.dataset.selected=String(i===askPick);button.setAttribute('aria-pressed',String(i===askPick));
      button.append(node('span','',option.n),node('kbd','',i===askPick?'A':' '));
      button.onclick=e=>{e.stopPropagation();askPick=i;askTake();};
      button.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat){askPick=i;askTake();}}};rows.appendChild(button);
    });
    box.appendChild(node('small','conversationPromptHint','A to select · B to close'));
  }
  function portrait(who){
    const image=node('span','conversationPortrait');image.setAttribute('aria-hidden','true');paintSmallPortrait(image,who);return image;
  }
  function advanceCue(){
    const cue=node('div','conversationAdvance');cue.hidden=true;
    const arrow=node('span','conversationAdvanceArrow','▼');arrow.setAttribute('aria-hidden','true');
    cue.append(arrow,node('span','','Press Next to continue'));return cue;
  }
  function makeStage(name){
    const stage=node('section','conversationStage');stage.setAttribute('aria-label','Their words');
    const speech=node('div','conversationNpcSpeech');speech.append(node('div','conversationNpcEcho scrolls'),advanceCue());
    const identity=node('div','conversationSpeaker');identity.append(portrait(name),node('strong','conversationSpeakerName',name));
    speech.append(identity);stage.append(speech);return stage;
  }
  function makePlayer(workspace){
    const player=node('section','conversationPlayer');player.setAttribute('aria-label','Corin’s side of the conversation');
    const identity=node('div','conversationSpeaker');identity.append(portrait('Corin'),node('strong','conversationSpeakerName','Corin'));
    const body=node('div','conversationPlayerBody');
    const speech=node('div','conversationCorinSpeech');speech.append(node('div','conversationCorinEcho scrolls'),advanceCue());
    speech.append(identity,makeChat());body.append(workspace,speech);player.append(body);return player;
  }
  function makeStars(){
    const sky=node('div','conversationStars');sky.setAttribute('aria-hidden','true');
    for(let i=0;i<22;i++){
      const star=node('i','');
      for(const [key,value]of Object.entries({x:(7+i*37)%97+'%',y:(11+i*29)%91+'%',size:(i%5===0?3:2)+'px',duration:(2.8+i%7*.43)+'s',delay:(-i*.73)+'s'}))star.style.setProperty('--star-'+key,value);
      sky.append(star);
    }
    return sky;
  }
  function makeChat(){
    const chat=node('button','conversationChat','Press To Chat');chat.type='button';
    chat.setAttribute('aria-controls','askRows');
    chat.onclick=e=>{e.stopPropagation();window.EmberConversationFlow.openChat();};
    chat.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)window.EmberConversationFlow.openChat();}};
    return chat;
  }
  function makeControls(profileButton){
    const footer=node('footer','conversationFooter');
    const controls=node('div','conversationAB');
    for(const [label,cls,action]of [['Goodbye','conversationGoodbye',()=>window.EmberConversationFlow.secondary()],['Next','conversationNext',()=>window.EmberConversationFlow.next()]]){
      const button=node('button','conversationControl '+cls,label);button.type='button';button.setAttribute('aria-label',label);
      button.onclick=e=>{e.stopPropagation();action();};
      button.onkeydown=e=>{if(['Enter',' ','a','b'].includes(e.key.toLowerCase())){e.preventDefault();e.stopPropagation();if(!e.repeat){if(e.key.toLowerCase()==='b')window.EmberConversationFlow.secondary();else if(e.key.toLowerCase()==='a')window.EmberConversationFlow.next();else action();}}};
      controls.append(button);
    }
    const friend=node('button','conversationFriendship');friend.type='button';
    const meter=node('progress','friendshipProgress');meter.max=100;meter.value=0;meter.setAttribute('aria-hidden','true');
    friend.append(node('strong','','Friendship'),meter,node('small','friendshipMeterLabel','Lv. 1 · 0%'));
    friend.onclick=e=>{e.stopPropagation();window.EmberConversationPanels.open('friendship');};
    friend.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)window.EmberConversationPanels.open('friendship');}};
    footer.append(profileButton,controls,friend);return footer;
  }
  function draw(box,rows){
    const scope=typeof topicMenuKey==='function'?topicMenuKey():ask.npcConversation||'Aurelius';
    const memory=!ask._topicDrawn?topicMenuPositions.get(scope):null;
    if(memory){const i=ask.opts.findIndex(o=>!o.head&&o.n===memory.name);if(i>=0)askPick=i;}
    const enter=!ask._topicDrawn;ask._deckFilter='all';
    const workspace=box.querySelector('.conversationWorkspace')||node('div','conversationWorkspace scrolls');
    const stage=box.querySelector('.conversationStage')||makeStage(ask.npcConversation||'Aurelius');
    const player=box.querySelector('.conversationPlayer')||makePlayer(workspace);
    const oldScroll=memory?.scroll??workspace.scrollTop;
    ask._topicDrawn=true;
    box.moved=false;box.classList.add('journalDeck');box.classList.toggle('deckEntering',enter);
    box.style.display='grid';box.style.width='100%';rows.replaceChildren();
    rows.classList.toggle('replyMenu',!!ask.replyChoices);
    rows.setAttribute('role','group');rows.setAttribute('aria-label',ask.replyChoices?'Choose Corin’s reply':'Conversation topics');
    const name=ask.npcConversation||'Aurelius';
    box.dataset.conversationTheme=window.EmberConversationView.theme(name,ask.npcActor);
    for(const lane of [stage,player]){
      if(name==='Aurelius'&&!lane.querySelector('.conversationStars'))lane.append(makeStars());
      else if(name!=='Aurelius')lane.querySelector('.conversationStars')?.remove();
    }
    box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Conversation with '+name);
    const topics=ask.opts.filter(o=>!o.head&&o.go&&!o.navigation&&category(o)!=='trade');
    const read=topics.filter(seen).length;
    box.querySelector('.deckHeader')?.remove();box.querySelector('.deckProfile')?.remove();
    const profileButton=node('button','deckProfileToggle','Profile');profileButton.type='button';
    profileButton.setAttribute('aria-label','Character profile: '+name);
    profileButton.setAttribute('aria-expanded',String(!!ask._profileOpen));
    profileButton.setAttribute('aria-controls','conversationProfile');
    profileButton.onclick=e=>{e?.stopPropagation();if(!ask)return;ask._profileOpen=!ask._profileOpen;askDraw();};
    profileButton.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)profileButton.onclick();}};
    stage.querySelector('.deckProfileToggle')?.remove();
    const profile=node('section','deckProfile');profile.id='conversationProfile';profile.hidden=!ask._profileOpen;
    if(ask._profileOpen){
      const info=window.EmberConversationView.profile(name,ask.npcActor);
      const hero=node('div','deckProfileHero');
      const identity=node('div','deckProfileIdentity');identity.append(node('small','deckEyebrow','Character profile'),node('h2','',name),node('p','deckProfileRole',info.role));
      hero.append(portrait(name),identity);profile.append(hero,node('h3','','Biography'),node('p','',info.bio));
      const facts=node('dl','deckProfileFacts');
      for(const [label,value]of [['Home',info.home],['Conversation',`${read} of ${topics.length} topics explored`],['Ask about',info.interests]]){facts.append(node('dt','',label),node('dd','',value));}
      profile.append(facts);
      if(info.memory){
        const quote=node('figure','deckProfileQuote');
        quote.append(node('figcaption','deckEyebrow','In their own words'),node('blockquote','',info.memory));profile.append(quote);
      }
    }
    const hint=document.getElementById('topicScrollHint');
    workspace.replaceChildren(rows,...(hint?[hint]:[]));
    const dossier=node('div','conversationDossier scrolls');dossier.hidden=!ask._profileOpen;dossier.append(profile);
    box.replaceChildren(stage,player,dossier,makeControls(profileButton));window.EmberConversationView?.mount(box);
    if(!workspace.scrollWired){workspace.scrollWired=true;workspace.addEventListener('scroll',updateTopicScrollHint,{passive:true});}
    box.classList.toggle('profileOpen',!!ask._profileOpen);
    if(ask.replyChoices){
      const heading=node('header','deckReplyHeading');heading.append(node('small','deckEyebrow','Corin’s reply'),node('h2','deckReplyPrompt','What do you say?'));rows.append(heading);
    }
    const choices=ask.opts.map((o,i)=>({o,i})).filter(({o})=>visible(o));
    if(!choices.some(({i})=>i===askPick))askPick=choices[0]?.i??0;
    let animated=0;
    for(const {o,i}of choices){
      const cat=category(o),read=seen(o),b=node('button',ask.replyChoices?'deckReply':'deckTopic deckTopic-'+cat);
      b.type='button';b.dataset.askIndex=i;b.dataset.selected=String(i===askPick);b.setAttribute('aria-pressed',String(i===askPick));
      b.style.setProperty('--topic-delay',Math.min(animated++,7)*24+'ms');
      if(ask.replyChoices){
        const number=node('span','deckReplyNumber',String(animated));number.setAttribute('aria-hidden','true');
        const words=node('span','deckReplyWords',o.n);
        b.append(number,words);
      }else{
        const mark=node('span','deckTopicIcon');mark.innerHTML=symbol(cat);
        const copy=node('span','deckTopicCopy');copy.append(node('strong','',o.n));
        const detail=o.summary||({lead:'A direction worth following',story:'A story in their own words',world:'People, places & old memories',trade:'See what is available',greeting:'See what is on their mind',leave:'Return to the journey',folder:'Open this topic'})[cat];
        copy.append(node('small','',detail));
        const badge=node('span','deckTopicBadge',ask.replyChoices?'↵':cat==='leave'?'↗':o.navigation?'›':cat==='trade'?'›':read?'✓':'•');
        badge.setAttribute('aria-hidden','true');b.append(mark,copy,badge);
      }
      b.setAttribute('aria-label',playerFacingText(o.n)+(ask.replyChoices?' — Corin’s reply':o.navigation?' — open topic':o.go&&cat!=='trade'?(read?' — discussed':' — unheard'):''));
      b.onclick=e=>{e.stopPropagation();if(box.moved)return;askPick=i;askTake();};
      b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();askPick=i;askTake();}};
      rows.append(b);
    }
    workspace.scrollTop=oldScroll||0;updateTopicScrollHint();
  }
  window.EmberConversationDeck={draw,prompt,visible,category,back};
})();
