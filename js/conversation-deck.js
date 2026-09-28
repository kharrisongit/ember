/* The conversation deck renders the existing choices; story callbacks remain
   responsible for gifts, knowledge and progression. */
(function(){
  const groups={all:'All topics',new:'Unheard',lead:'Leads',story:'Personal',world:'The realm'};
  const icons={lead:'compass',story:'chat',world:'book',trade:'coin',greeting:'sun',leave:'arrow',folder:'book'};
  const paths={compass:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM16 8l-3 5-5 3 3-5Z',chat:'M4 4h16v12H9l-5 4V4Zm4 5h8M8 12h5',book:'M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15',coin:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3 6H9v4h6v4H9m3-11v14',sun:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-6v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2',arrow:'M4 12h15m-6-6 6 6-6 6'};
  function symbol(kind){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[icons[kind]||'chat']+'"/></svg>';}
  const category=o=>o.category||(o.navigation?'folder':!o.go?'leave':/^(Hello|I came for)/.test(o.n)?'greeting':/supplies/.test(o.n)?'trade':/Halvard|Wingfall|history|land and/.test(o.n)?'world':/quest|next\?|lead|temple|Heartstone|rod|lantern|ward|Bramble|summon/i.test(o.n)?'lead':'story');
  const seen=o=>discussedTopics.has(topicMemoryKey(o));
  function visible(o,filter){
    if(o.head)return false;
    const cat=category(o);
    if(['leave','greeting','trade','folder'].includes(cat))return true;
    return filter==='all'||filter==='new'&&!seen(o)||filter===cat;
  }
  function node(tag,cls,text){const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=playerFacingText(text);return e;}
  function back(){
    if(ask?._historyOpen){ask._historyOpen=false;askDraw();return true;}
    if(ask?._profileOpen){ask._profileOpen=false;askDraw();return true;}
    if(ask?._deckFilter&&ask._deckFilter!=='all'){ask._deckFilter='all';askDraw();return true;}
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
    box.appendChild(node('small','conversationPromptHint','Choose an action · A to confirm · B to leave'));
  }
  function makeStage(){
    const stage=node('section','conversationStage');stage.setAttribute('aria-label','Conversation');
    const ribbon=node('div','conversationRibbon');
    for(const [phase,label]of [['explore','Explore'],['listen','Listen'],['reply','Your reply']]){
      const chip=node('span','conversationPhase',label);chip.dataset.phase=phase;ribbon.appendChild(chip);
    }
    stage.append(ribbon,node('p','conversationSubject','A moment to talk'),node('small','conversationTurn','Where will the conversation go?'));
    return stage;
  }
  function draw(box,rows){
    const scope=typeof topicMenuKey==='function'?topicMenuKey():ask.npcConversation||'Aurelius';
    const memory=!ask._topicDrawn?topicMenuPositions.get(scope):null;
    if(memory){ask._deckFilter=memory.filter||'all';const i=ask.opts.findIndex(o=>!o.head&&o.n===memory.name);if(i>=0)askPick=i;}
    const filter=ask.replyChoices?'all':ask._deckFilter||'all',enter=!ask._topicDrawn||ask._deckLastFilter!==filter;
    const workspace=box.querySelector('.conversationWorkspace')||node('div','conversationWorkspace');
    const stage=box.querySelector('.conversationStage')||makeStage();
    const oldScroll=memory?.scroll??workspace.scrollTop;
    ask._topicDrawn=true;ask._deckLastFilter=filter;
    box.moved=false;box.classList.add('journalDeck');box.classList.toggle('deckEntering',enter);
    box.style.display='grid';box.style.width='100%';rows.replaceChildren();
    const name=ask.npcConversation||'Aurelius';
    box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Conversation with '+name);
    const topics=ask.opts.filter(o=>!o.head&&o.go&&!o.navigation&&category(o)!=='trade');
    const read=topics.filter(seen).length;
    box.querySelector('.deckHeader')?.remove();box.querySelector('.deckProfile')?.remove();
    const header=node('header','deckHeader');
    const profileButton=node('button','deckProfileToggle');profileButton.type='button';
    profileButton.setAttribute('aria-label','Character profile: '+name);
    profileButton.setAttribute('aria-expanded',String(!!ask._profileOpen));
    profileButton.setAttribute('aria-controls','conversationProfile');
    profileButton.onclick=()=>{ask._profileOpen=!ask._profileOpen;ask._historyOpen=false;askDraw();};
    const portrait=node('span','journalPortrait');portrait.setAttribute('aria-hidden','true');paintSmallPortrait(portrait,name);
    const identity=node('div','deckIdentity');identity.append(node('small','deckEyebrow',ask.dragonConversation?'A voice within · '+(ask.topicScope==='root'?'Aurelius':ask.topicScope||'Conversation'):'A moment to talk'));
    identity.append(node('strong','deckName',name));
    const sub=node('span','deckProgressText',ask.replyChoices?'Choose Corin’s reply':`${Math.max(0,topics.length-read)} unheard · ${read} explored`);identity.append(sub);
    const ring=node('span','deckReadRing');ring.style.setProperty('--read',topics.length?read/topics.length*100+'%':'0%');ring.append(node('span','',`${read}/${topics.length}`));ring.setAttribute('aria-label',`${read} of ${topics.length} topics explored`);
    identity.append(node('span','deckProfileHint',ask._profileOpen?'Close profile ▴':'View profile ▾'));
    profileButton.title=ask._profileOpen?'Tap the banner to return to topics':'Tap the banner for biography and character details';
    profileButton.append(portrait,identity);if(!ask.replyChoices)profileButton.append(ring);
    const controls=node('div','deckHeaderControls');
    const parent=ask.back&&ask.topicScope!=='thornwell-audience';
    if(ask._profileOpen||ask._historyOpen||filter!=='all'||parent){
      const previous=node('button','deckBack','‹ Back');previous.type='button';previous.setAttribute('aria-label','Back to previous topic list');
      previous.onclick=e=>{e.stopPropagation();askBack();};controls.append(previous);
    }
    const historyToggle=node('button','deckHistoryToggle','History');historyToggle.type='button';
    historyToggle.setAttribute('aria-expanded',String(!!ask._historyOpen));historyToggle.setAttribute('aria-controls','conversationHistory');
    historyToggle.onclick=()=>{ask._historyOpen=!ask._historyOpen;ask._profileOpen=false;askDraw();};controls.append(historyToggle);
    const close=node('button','deckClose','Goodbye');close.type='button';close.setAttribute('aria-label','Leave conversation');
    close.onclick=e=>{e.stopPropagation();if(ask.replyChoices){askBack();return;}if(window.EmberConversationFlow){window.EmberConversationFlow.goodbye();return;}const leave=ask.npcActor?.thornwellRoyal&&thornwellRoyal.stage===3?thornwellDismissAudience:null;askShut();if(leave)leave();};if(!ask.replyChoices)controls.append(close);
    header.append(profileButton,controls);
    const profile=node('section','deckProfile');profile.id='conversationProfile';profile.hidden=!ask._profileOpen;
    if(ask._profileOpen){
      const info=window.EmberConversationView.profile(name,ask.npcActor);
      profile.append(node('small','deckEyebrow',info.role),node('h2','',name),node('p','',info.bio));
      const facts=node('dl','deckProfileFacts');
      for(const [label,value]of [['Home',info.home],['Conversation',`${read} of ${topics.length} topics explored`],['Ask about',info.interests]]){facts.append(node('dt','',label),node('dd','',value));}
      profile.append(facts);
      if(info.memory){profile.append(node('small','deckEyebrow','In their own words'),node('blockquote','',info.memory));}
    }
    const history=node('section','deckHistory');history.id='conversationHistory';history.hidden=!ask._historyOpen;
    history.append(node('small','deckEyebrow','This conversation'),node('h2','','Conversation so far'));
    const lines=window.EmberConversationFlow?.history()||[];
    for(const line of lines){const entry=node('article','conversationMemory');entry.append(node('strong','',line.speaker),node('p','',line.text));history.appendChild(entry);}
    if(!lines.length)history.appendChild(node('p','','Your conversation will be recorded here as you talk.'));
    const hint=document.getElementById('topicScrollHint');
    workspace.replaceChildren(profile,history,rows,...(hint?[hint]:[]));
    box.replaceChildren(header,stage,workspace);window.EmberConversationView?.mount(stage);
    if(!workspace.scrollWired){workspace.scrollWired=true;workspace.addEventListener('scroll',updateTopicScrollHint,{passive:true});}
    box.classList.toggle('profileOpen',!!ask._profileOpen);
    box.classList.toggle('historyOpen',!!ask._historyOpen);
    const tabs=node('nav','deckTabs');tabs.setAttribute('aria-label','Conversation categories');
    for(const [key,label]of Object.entries(groups)){
      const count=topics.filter(o=>key==='all'||key==='new'&&!seen(o)||category(o)===key).length;
      if(key!=='all'&&key!=='new'&&!count)continue;
      const b=node('button','deckTab',label);b.type='button';b.setAttribute('aria-pressed',String(key===filter));
      b.append(node('span','deckTabCount',String(count)));
      b.onclick=e=>{e.stopPropagation();ask._deckFilter=key;askPick=ask.opts.findIndex(o=>visible(o,key));workspace.scrollTop=0;askDraw();};tabs.append(b);
    }
    if(!ask.replyChoices)rows.append(tabs);
    else rows.append(node('p','deckReplyPrompt','What will Corin say?'));
    const choices=ask.opts.map((o,i)=>({o,i})).filter(({o})=>visible(o,filter));
    if(!choices.some(({i})=>i===askPick))askPick=choices[0]?.i??0;
    let animated=0;
    for(const {o,i}of choices){
      const cat=category(o),read=seen(o),b=node('button','deckTopic deckTopic-'+cat);
      b.type='button';b.dataset.askIndex=i;b.dataset.selected=String(i===askPick);b.setAttribute('aria-pressed',String(i===askPick));
      b.style.setProperty('--topic-delay',Math.min(animated++,7)*24+'ms');
      const mark=node('span','deckTopicIcon');mark.innerHTML=symbol(cat);
      const copy=node('span','deckTopicCopy');copy.append(node('strong','',o.n));
      const detail=o.summary||({lead:'A direction worth following',story:'A story in their own words',world:'People, places & old memories',trade:'See what is available',greeting:'See what is on their mind',leave:'Return to the journey',folder:'Open this topic'})[cat];
      copy.append(node('small','',detail));
      const badge=node('span','deckTopicBadge',ask.replyChoices?'↵':cat==='leave'?'↗':o.navigation?'›':cat==='trade'?'›':read?'✓':'•');
      badge.setAttribute('aria-hidden','true');b.append(mark,copy,badge);
      b.setAttribute('aria-label',playerFacingText(o.n)+(ask.replyChoices?' — Corin’s reply':o.navigation?' — open topic':o.go&&cat!=='trade'?(read?' — discussed':' — unheard'):''));
      b.onclick=e=>{e.stopPropagation();if(box.moved)return;askPick=i;askTake();};
      b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();askPick=i;askTake();}};
      rows.append(b);
    }
    if(filter==='new'&&!topics.some(o=>!seen(o)))rows.append(node('p','deckEmpty','Every story here has been heard. Revisit a favorite, or see what the road brings next.'));
    workspace.scrollTop=oldScroll||0;updateTopicScrollHint();
  }
  window.EmberConversationDeck={draw,prompt,visible,category,back};
})();
