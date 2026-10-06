/* Character profiles share the dialogue cast; conversations use the normal gameplay camera. */
(function(){
  const biographies={
    'Dunstan':['Blacksmith','Forgewick','Dunstan strengthens travellers’ arms and armour in Forgewick. His brother Sela works glass in Sandspire; their rivalry has never stopped them sending each other useful tools and supplies.'],
    'Sela':['Glassblower','Sandspire','Sela left Forgewick to work with Sandspire’s glassmaking sand and caravan trade. His brother Dunstan forges steel; Sela shapes glass into beautiful objects and protection for the road.'],
    'Corin':['A boy from Millwood','Millwood','Raised by Nan Ferrow, Corin knows the village paths and the weight of an ordinary errand. Curiosity and stubborn kindness keep carrying him farther from home.'],
    'Aurelius':['Dragon companion','The road with Corin','A young dragon with an old name and a keen sense of wonder. His bond with Corin lets them speak mind to mind; trust, food, and the mysteries of Emberfell give them plenty to discuss.'],
    'Hettie':['Farmer','Millwood','Hettie keeps the farm fed, the chores moving, and a watchful eye on Corin. Beneath her brisk instructions is the practical generosity that holds a village together.'],
    'Gwil':['Woodworker','Millwood','Gwil repairs fences and farm buildings, remembering his father’s rule to leave a young tree beside every stump. He and Hettie have perfected the art of arguing while getting the work done.'],
    'Odo':['Fisherman','Millwood','Odo knows the bridge, its fish, and the people who cross it. Behind his tall fishing tales are memories of quieter mornings spent across the water from his brother.'],
    'Nan Ferrow':['Corin’s grandmother','Millwood','Nan raised Corin with a steady hand and a home to return to. She guards family memories carefully, and shows her love in provisions, warnings, and small things saved for the right moment.'],
    'Elder Maddock':['Village elder','Millwood','Maddock keeps knowledge that others have forgotten or learned to fear. Patient with questions and sparing with easy answers, he asks Corin to look closely before deciding what a thing is worth.'],
    'King Halvard':['King of Emberfell','Cinderhold','Halvard expects every room to make space for him. He calls obedience peace and treats common people’s time, food, and silence as things the crown is owed. His knights make sure few people argue.'],
    'Serjeant Bram':['Royal serjeant','The king’s retinue','Bram commands the king’s escort with clipped orders and an eye for hesitation. He remembers the recruits under his command, but puts the dignity of the crown ahead of the people standing in its way.'],
    'Doran':['Royal knight','The king’s retinue','Doran has made a profession of being difficult to ignore. At the king’s table or on the road, he uses his uniform as a reason for other people to move first.'],
    'Tolan':['Royal guard','The king’s retinue','Tolan carried flour before he carried a spear. A regular wage drew him into the guard, and he watches the people hurt by an order more carefully than he admits in front of his officers.'],
    'Rowan the Hunter':['Hunter','Thornwell','Rowan knows the tracks beyond Thornwell and the habits of his wandering dog, Bramble. His dry humor rarely hides how glad he is to have his companion safely home.'],
    'Bess':['Keeper of the Copper Cup','Thornwell','Bess keeps the Copper Cup welcoming even when its guests give her little reason to. She knows when someone needs a hot meal, a listening ear, or the kindness of being left alone.'],
    'Wren':['Herbalist and merchant','Thornwell','Wren tends the greenhouse market stand and stocks remedies for the road. Comfrey, feverfew, and years of practical care make her a useful person to know before a long journey.'],
    'Linna':['Mill bookkeeper','Thornwell','Linna keeps the mill’s tallies and notices the details other people overlook. A town’s ledgers tell their own stories, particularly when the crown comes looking for its share.'],
    'Fen':['Local guide','Thornwell','Fen knows the people and paths around Thornwell. An observant neighbor with a generous streak, Fen has more to offer a traveler than a passing greeting.']
  };
  function profile(who,actor){
    const name=PORTRAIT_ALIASES[who]||who;
    const authored=(typeof ForgewickDialogue!=='undefined'&&ForgewickDialogue.dossier(name,actor))||(typeof ThornwellDialogue!=='undefined'&&ThornwellDialogue.dossier(name,actor))||(typeof ThornwellAudienceDialogue!=='undefined'&&ThornwellAudienceDialogue.dossier(name,actor))||(typeof MillwoodShroomDialogue!=='undefined'&&MillwoodShroomDialogue.dossier(name,actor));
    if(authored)return Object.fromEntries(Object.entries(authored).map(([key,value])=>[key,playerFacingText(value)]));
    const records=Object.values(W.maps).flatMap(m=>m.npcs||[]);
    const source=records.find(n=>n.n===name&&n.loc)||records.find(n=>n.n===name)||actor;
    const stories=NPC_STORIES[name]||NPC_STORIES[source?.portraitOriginalName]||[];
    const home=biographies[name]?.[1]||source?.loc||actor?.loc|| (typeof atlasCurrentArea==='function'?atlasCurrentArea():'Emberfell');
    const interests=stories.map(s=>s[0]).join(' · ')||'Life in Emberfell · The road ahead';
    const data=biographies[name]||['A familiar face in '+home,home,
      name+' is part of the everyday life of '+home+'. '+(stories.length?'Their stories of '+stories[0][0].toLowerCase()+' offer a glimpse of the memories and people that matter to them.':'A conversation may reveal what matters to them, and what has changed along the road.')];
    return Object.fromEntries(Object.entries({name,role:data[0],home:data[1],bio:data[2],interests,memory:stories[0]?.[1]||(name==='Aurelius'&&typeof NPC_TOPIC_GREETINGS!=='undefined'?NPC_TOPIC_GREETINGS.Aurelius:'')})
      .map(([key,value])=>[key,playerFacingText(value)]));
  }
  // Prefer the actual actor, then their authored home, so visitors and duplicate
  // names keep the right region even when Corin meets them away from home.
  function theme(who,actor){
    if(typeof ForgewickDialogue!=='undefined'&&ForgewickDialogue.profile(actor))return 'forgewick';
    const name=PORTRAIT_ALIASES[who]||who;
    if(name==='Aurelius')return 'aurelius';
    const entries=Object.entries(W.maps).flatMap(([map,m])=>(m.npcs||[]).map(n=>({map,n})));
    const found=entries.find(e=>e.n===actor)||entries.find(e=>e.n.n===name&&e.n.loc)||entries.find(e=>e.n.n===name);
    const map=found?.map||MAPID,source=actor||found?.n;
    const hometown=biographies[name]?.[1]||actor?.loc||found?.n.loc||'';
    const mapTown={school:'Thornwell',school2:'Thornwell',tavern:'Thornwell',inn:'Thornwell',smithy:'Forgewick',glasswork:'Sandspire',glasshouse:'Sandspire',mine:'Forgewick'}[map];
    const regions=[[/Millwood/i,'millwood'],[/Thornwell/i,'thornwell'],[/Forgewick|Forgefalls/i,'forgewick'],[/Sandspire/i,'sandspire'],[/Witchmoor|Dreadmarsh|swamp|marsh/i,'marsh'],[/Hollybeck|Frostcrag|snow/i,'snow'],[/Coralmere|coast/i,'coast'],[/Shroom|Sporehollow/i,'shroom'],[/Cinderhold|Ashcrag|king’s retinue/i,'cinderhold']];
    const match=place=>regions.find(([pattern])=>pattern.test(place||''))?.[1];
    const homeTheme=match(hometown)||match(mapTown)||match(W.maps[map]?.title)||match(map);
    if(homeTheme)return homeTheme;
    if(map==='world'&&source){
      const x=source.x/TS,y=source.y/TS;
      const areas=(W.maps.world.features||[]).filter(f=>f.kind==='area'&&match(f.label||f.place));
      const area=areas.filter(f=>x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1).sort((a,b)=>(a.x1-a.x0)*(a.y1-a.y0)-(b.x1-b.x0)*(b.y1-b.y0))[0];
      if(area)return match(area.label||area.place);
    }
    return match(typeof atlasCurrentArea==='function'?atlasCurrentArea():'')||'millwood';
  }
  const reveal=document.getElementById('reveal');
  let homes=null,room=null,lastNpc='',lastCorin='',partnerName='',npcName='';
  function mount(target){
    room=target;
    const nodes=[sayEl,faceEl,nameEl,reveal];
    if(!homes)homes=nodes.map(node=>({node,parent:node.parentNode||document.body}));
    // Keep the native typewriter and story events. Only its speech container moves.
    room.querySelector('.conversationNpcSpeech').appendChild(sayEl);
    for(const node of [faceEl,nameEl,reveal])room.appendChild(node);
    sayEl.classList.add('scrolls');sayEl.setAttribute('role','region');sayEl.tabIndex=-1;
  }
  function release(){
    if(homes)for(const {node,parent}of homes)parent.appendChild(node);
    sayEl.classList.remove('scrolls');sayEl.setAttribute('role','button');sayEl.tabIndex=0;
    homes=null;room=null;lastNpc='';lastCorin='';partnerName='';npcName='';
  }
  function update({partner,speaker,phase,canLeave,backAvailable,automatic}){
    if(!room)return;
    if(partnerName!==partner){lastNpc='';lastCorin='';partnerName=partner;npcName=partner;}
    const idle=phase==='welcome'||phase==='explore';
    if(idle){lastCorin='';npcName=partner;}
    const speaking=!idle&&sayEl.classList.contains('on'),corin=speaker==='Corin';
    if(speaking){
      const words=typeFull.slice(0,Math.floor(typed));
      if(corin)lastCorin=words;else{lastNpc=words;npcName=speaker||partner;}
    }
    const stage=room.querySelector('.conversationStage'),player=room.querySelector('.conversationPlayer');
    stage.dataset.speaker=corin?'corin':'npc';stage.dataset.phase=phase;
    const playerMode=phase==='listen'?'speech':phase==='explore'?'topics':phase==='reply'?'replies':'welcome';
    player.dataset.mode=playerMode;
    const choosing=phase==='explore'||phase==='reply';
    player.querySelector('.conversationWorkspace').hidden=!choosing;
    player.querySelector('.conversationSpeaker').hidden=choosing;
    const chat=room.querySelector('.conversationChat');
    chat.hidden=phase!=='welcome'||!!ask?._profileOpen;
    chat.disabled=chat.hidden;
    chat.setAttribute('aria-expanded',String(phase==='explore'&&!ask?._profileOpen));
    chat.setAttribute('aria-label','Chat with '+partner);
    const target=room.querySelector(corin?'.conversationCorinSpeech':'.conversationNpcSpeech');
    if(sayEl.parentNode!==target){target.appendChild(sayEl);sayEl.scrollTop=0;}
    const npcPortrait=stage.querySelector('.conversationPortrait');
    if(npcPortrait.dataset.speaker!==npcName)paintSmallPortrait(npcPortrait,npcName);
    stage.querySelector('.conversationSpeakerName').textContent=npcName;
    const npcEcho=stage.querySelector('.conversationNpcEcho'),echoWasHidden=npcEcho.hidden;
    npcEcho.hidden=speaking&&!corin;if(npcEcho.textContent!==lastNpc)npcEcho.textContent=lastNpc;
    if(npcEcho.textContent!==npcEcho._lastScrollText||echoWasHidden&&!npcEcho.hidden){npcEcho.scrollTop=npcEcho.scrollHeight;npcEcho._lastScrollText=npcEcho.textContent;}
    const corinEcho=player.querySelector('.conversationCorinEcho');
    // The empty parchment supports Corin's portrait while Chat awaits input.
    corinEcho.hidden=speaking&&corin;const reply=lastCorin;if(corinEcho.textContent!==reply)corinEcho.textContent=reply;
    if(speaking&&(sayEl._scrollLine!==typeFull||sayEl._scrollLength!==Math.floor(typed))){sayEl.scrollTop=sayEl.scrollHeight;sayEl._scrollLine=typeFull;sayEl._scrollLength=Math.floor(typed);}
    const active=phase==='listen'&&speaking&&!revealing&&!ask?._profileOpen;
    const ready=active&&!automatic&&typeDone()&&!scene?.hold;
    for(const [lane,isCorin]of [[stage,false],[player,true]]){
      const talking=active&&corin===isCorin;
      lane.classList.toggle('is-speaking',talking);
      lane.classList.toggle('is-listening',active&&!talking);
      lane.querySelector('.conversationSpeakerName').setAttribute('aria-label',playerFacingText(isCorin?'Corin':npcName)+(talking?' — speaking':''));
      lane.querySelector('.conversationAdvance').hidden=!(ready&&corin===isCorin);
    }
    const secondary=room.querySelector('.conversationGoodbye'),label=backAvailable?'Back':'Goodbye';
    if(secondary.textContent!==label)secondary.textContent=label;
    secondary.setAttribute('aria-label',label);secondary.dataset.action=backAvailable?'back':'goodbye';
    secondary.disabled=!backAvailable&&!canLeave;
    room.querySelector('.conversationNext').disabled=phase==='listen'&&!speaking&&!revealing;
    const friend=room.querySelector('.conversationFriendship');
    if(friend&&window.EmberFriendship){const s=window.EmberFriendship.status(partner);friend.querySelector('progress').value=s.percent;friend.querySelector('.friendshipMeterLabel').textContent='Lv. '+s.level+' · '+s.percent+'%';friend.setAttribute('aria-label','Friendship with '+partner+': '+s.percent+' percent. Open friendship overview');}
  }
  function clearExchange(){lastNpc='';lastCorin='';}
  function clearCorin(){lastCorin='';}
  function beginTopic(question){lastCorin=playerFacingText(question);}
  window.EmberConversationView={profile,theme,mount,release,update,beginTopic,clearExchange,clearCorin};
})();
