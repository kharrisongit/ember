/* Friendship counts completed exchanges, not taps, branches or repeat gifts.
   Topic catalogues include story-locked conversations without revealing them. */
(function(){
  const REWARD_GOLD=50,REWARD_POTIONS=1;
  let people=Object.create(null),tutorialSeen=false,legacy=[],activeName='',activeActor=null;
  const catalogues=new Map();
  function id(name,title){
    // Context-only title corrections preserve existing friendship credit.
    if(name==='Tarek'&&title==='A loyal camel')title='That camel';
    if(name==='Coral'&&title==='Mending a sail')title='Mending that sail';
    if(['King Halvard','After Halvard’s defeat'].includes(title))return 'world-halvard';
    if(name==='Aurelius'){
      if(['Why Halvard fears us','Life after Halvard'].includes(title))return 'world-halvard';
      if(['Leaving Millwood','What we want after all this'].includes(title))return 'journey-home';
    }
    const road=typeof NPC_WORLD_TALKS!=='undefined'&&NPC_WORLD_TALKS[name]?.roadwork;
    if(road&&[road[1],NPC_STORIES[name]?.[0]?.[0]].includes(title))return 'local-road';
    return String(title).normalize('NFKC').toLowerCase().replace(/[’']/g,'').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
  }
  const eligible=o=>!!o.go&&!o.head&&!o.navigation&&o.friendship!==false&&!['trade','greeting','leave'].includes(o.category);
  function person(name){
    if(!people[name]){
      people[name]={completed:[],known:[],rewarded:false};
      for(const key of legacy)if(key.startsWith(name+':'))people[name].completed.push(id(name,key.slice(name.length+1)));
      people[name].completed=[...new Set(people[name].completed)];
    }
    return people[name];
  }
  function catalogue(name,actor,menu){
    let rows=[];
    const add=(title,available=true,topicId)=>rows.push({id:topicId||id(name,title),title:playerFacingText(title),available});
    const regional=typeof MillwoodShroomDialogue!=='undefined'&&MillwoodShroomDialogue.profile(actor);
    if(typeof DialogueRenewal!=='undefined'&&DialogueRenewal.profile(actor)){
      for(const t of DialogueRenewal.topics(actor,{all:true}))add(t.title,t.available,t.friendshipId);
    }else if(typeof ForgewickDialogue!=='undefined'&&ForgewickDialogue.profile(actor)){
      for(const t of ForgewickDialogue.topics(actor,{all:true}))if(t.lines&&t.friendship!==false)add(t.title,t.available,t.friendshipId);
    }else if(typeof ThornwellDialogue!=='undefined'&&ThornwellDialogue.profile(actor)){
      for(const t of ThornwellDialogue.topics(actor,{all:true}))if(t.lines&&t.friendship!==false)add(t.title,t.available,t.friendshipId);
    }else if(actor?.thornwellRoyal&&typeof ThornwellAudienceDialogue!=='undefined'){
      for(const t of ThornwellAudienceDialogue.rows(actor))add(t.title,true,t.friendshipId);
    }else if(regional){
      for(const t of MillwoodShroomDialogue.topics(actor,{all:true}))if(t.lines&&t.friendship!==false)add(t.title,t.available,t.friendshipId);
    }else if(name==='Aurelius'){
      for(const title of ['What should we do next?','The shared dragon consciousness','Why did you choose me?','The heartstones','What do you want for yourself?','Wingfall and the seven riders','The land and its people',wonAll?'Life after Halvard':'Why Halvard fears us','Riding and flying','Fighting as partners','Food and recovery'])add(title);
      for(const group of Object.keys(DRAGON_GENERAL_TOPICS))for(const t of [...DRAGON_GENERAL_TOPICS[group],...dragonExtraTopics(group)])add(t[1]);
      for(const t of DRAGON_JOURNEY_TOPICS){
        // Story alternatives must not leave an impossible checklist after their moment has passed.
        if(t.id==='home'&&wonAll||t.id==='future'&&!wonAll||t.id==='cinderhold'&&wonAll)continue;
        if(t.id==='royal-visit'&&thornwellRoyal.stage>=7&&thornwellRoyal.answers.visit!=='yes')continue;
        add(t.name,t.when());
      }
    }else if(actor){
      const current=npcStoryTopics(actor).filter(t=>t.lines&&t.friendship!==false);
      const available=new Set(current.map(t=>id(name,t.title)));
      for(const t of NPC_STORIES[name]||[])add(t[0],available.has(id(name,t[0])));
      for(const t of NPC_EXTRA_TOPICS[name]||[])add(t.title,available.has(id(name,t.title)));
      for(const t of current)add(t.title,true,t.friendshipId);
    }
    if(menu&&!menu.replyChoices)for(const o of menu.opts)if(eligible(o))add(o.n,true,o.friendshipId);
    const unique=new Map();for(const row of rows){const prev=unique.get(row.id);if(!prev||row.available)unique.set(row.id,row);}
    return [...unique.values()];
  }
  function register(menu){
    if(menu.replyChoices)return;
    const name=menu.npcConversation||'Aurelius',actor=menu.npcActor||{n:name};
    activeName=name;activeActor=actor;
    const p=person(name),rows=catalogue(name,actor,menu);
    // Side-quest folders may be visited independently of the root menu.
    for(const old of p.known)if(!(typeof DialogueRenewal!=='undefined'&&DialogueRenewal.profile(actor))&&!rows.some(r=>r.id===old.id)&&name==='Aurelius'&&old.sideQuest)rows.push({...old,available:true});
    if(name==='Aurelius'&&menu.topicScope==='quests')for(const row of rows)if(menu.opts.some(o=>id(name,o.n)===row.id))row.sideQuest=true;
    p.known=rows.map(({id,title,available,sideQuest})=>({id,title,available,sideQuest}));
    catalogues.set(name,rows);if(award(name))saveGame();return status(name);
  }
  function status(name=activeName){
    const p=person(name),rows=catalogues.get(name)||p.known,done=new Set(p.completed);
    const completed=rows.filter(r=>done.has(r.id)).length,total=rows.length;
    const locked=rows.filter(r=>!r.available&&!done.has(r.id)).length;
    const percent=total?Math.floor(completed*100/total):0;
    return {name,completed,total,locked,remaining:total-completed-locked,percent,level:percent===100?5:Math.min(4,1+Math.floor(percent/25)),max:total>0&&completed===total,rewarded:p.rewarded,
      topics:rows.map(r=>({...r,done:done.has(r.id)}))};
  }
  function start(menu,option){
    if(!eligible(option))return null;
    const name=menu.npcConversation||'Aurelius';
    return {name,id:option.friendshipId||id(name,option.n),key:name+':'+option.n};
  }
  function award(name){
    const p=person(name),s=status(name);if(!s.max||p.rewarded)return false;
    // Mark first, then save the reward and inventory together.
    p.rewarded=true;gold+=REWARD_GOLD;potions+=REWARD_POTIONS;
    toast('Friendship with '+name+' complete! +50 gold · +1 Potion');
    window.EmberSfx?.pickup?.();return true;
  }
  function complete(topic){
    if(!topic)return false;
    const p=person(topic.name);if(p.completed.includes(topic.id))return false;
    p.completed.push(topic.id);discussedTopics.add(topic.key);award(topic.name);
    saveGame();return true;
  }
  function capture(){return {version:1,tutorialSeen,people:JSON.parse(JSON.stringify(people))};}
  function restore(saved){
    people=Object.create(null);catalogues.clear();activeName='';activeActor=null;
    tutorialSeen=!!saved?.tutorialSeen;legacy=[...discussedTopics].filter(k=>typeof k==='string'&&!k.startsWith('@'));
    for(const [name,p]of Object.entries(saved?.people||{})){
      if(!p||typeof p!=='object'||name.length>100)continue;
      const completed=[...new Set((Array.isArray(p.completed)?p.completed:[]).filter(s=>typeof s==='string'&&s.length<300))];
      const known=(Array.isArray(p.known)?p.known:[]).filter(r=>r&&typeof r.id==='string'&&typeof r.title==='string').map(r=>({id:r.id,title:r.title,available:!!r.available,sideQuest:!!r.sideQuest}));
      people[name]={completed,known,rewarded:!!p.rewarded};
    }
  }
  function readTutorial(){tutorialSeen=true;saveGame();}
  function overview(){return Object.keys(people).map(name=>status(name)).sort((a,b)=>a.name===activeName?-1:b.name===activeName?1:a.name.localeCompare(b.name));}
  window.EmberFriendship={id,eligible,register,start,complete,status,capture,restore,overview,readTutorial,needsTutorial:()=>!tutorialSeen,active:()=>({name:activeName,actor:activeActor}),reward:{gold:REWARD_GOLD,potions:REWARD_POTIONS}};
})();
