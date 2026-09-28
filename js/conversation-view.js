/* Character profiles share the dialogue cast; conversations use the normal gameplay camera. */
(function(){
  const biographies={
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
    const records=Object.values(W.maps).flatMap(m=>m.npcs||[]);
    const source=records.find(n=>n.n===name&&n.loc)||records.find(n=>n.n===name)||actor;
    const stories=NPC_STORIES[name]||NPC_STORIES[source?.portraitOriginalName]||[];
    const home=biographies[name]?.[1]||source?.loc||actor?.loc|| (typeof atlasCurrentArea==='function'?atlasCurrentArea():'Emberfell');
    const interests=stories.map(s=>s[0]).join(' · ')||'Life in Emberfell · The road ahead';
    const data=biographies[name]||['A familiar face in '+home,home,
      name+' is part of the everyday life of '+home+'. '+(stories.length?'Their stories of '+stories[0][0].toLowerCase()+' offer a glimpse of the memories and people that matter to them.':'A conversation may reveal what matters to them, and what has changed along the road.')];
    return Object.fromEntries(Object.entries({name,role:data[0],home:data[1],bio:data[2],interests,memory:stories[0]?.[1]||''})
      .map(([key,value])=>[key,playerFacingText(value)]));
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
  function update({partner,speaker,phase,subject,canLeave}){
    if(!room)return;
    if(partnerName!==partner){lastNpc='';lastCorin='';partnerName=partner;npcName=partner;}
    if(phase==='explore')lastCorin='';
    const speaking=sayEl.classList.contains('on'),corin=speaker==='Corin';
    if(speaking){
      const words=typeFull.slice(0,Math.floor(typed));
      if(corin)lastCorin=words;else{lastNpc=words;npcName=speaker||partner;}
    }
    const stage=room.querySelector('.conversationStage'),player=room.querySelector('.conversationPlayer');
    stage.dataset.speaker=corin?'corin':'npc';stage.dataset.phase=phase;
    player.dataset.mode=phase==='listen'?'speech':'choices';
    const target=room.querySelector(corin?'.conversationCorinSpeech':'.conversationNpcSpeech');
    if(sayEl.parentNode!==target){target.appendChild(sayEl);sayEl.scrollTop=0;}
    const npcPortrait=stage.querySelector('.conversationPortrait');
    if(npcPortrait.dataset.speaker!==npcName)paintSmallPortrait(npcPortrait,npcName);
    stage.querySelector('.conversationSpeakerName').textContent=npcName;
    const npcEcho=stage.querySelector('.conversationNpcEcho');
    npcEcho.hidden=speaking&&!corin;if(npcEcho.textContent!==lastNpc)npcEcho.textContent=lastNpc;
    const corinEcho=player.querySelector('.conversationCorinEcho');
    corinEcho.hidden=speaking&&corin;const reply=lastCorin||'Listening…';if(corinEcho.textContent!==reply)corinEcho.textContent=reply;
    player.querySelector('.conversationPlayerTurn').textContent=phase==='reply'?'Your reply':phase==='explore'?'Your topics':corin?'Your words':'Listening';
    const title=room.querySelector('.conversationSubject');
    if(title)title.textContent=playerFacingText(subject||'A moment to talk');
    const turn=room.querySelector('.conversationTurn');
    if(turn)turn.textContent=ask?._profileOpen?'Character profile':ask?._historyOpen?'Conversation history':phase==='reply'?'Choose Corin’s reply':phase==='explore'?'Choose a topic':canLeave?'A · Next line':'Finish this exchange before saying goodbye';
    room.querySelector('.conversationGoodbye').disabled=!canLeave;
    room.querySelector('.conversationNext').disabled=phase==='listen'&&!speaking&&!revealing;
  }
  window.EmberConversationView={profile,mount,release,update};
})();
