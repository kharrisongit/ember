/* Conversation framing is a presentation layer: it never moves actors or changes
   the logical gameplay camera. Story cinematics keep their own camera. */
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
    return {name,role:data[0],home:data[1],bio:data[2],interests,memory:stories[0]?.[1]||''};
  }
  // All inputs and outputs use canvas pixels; CSS viewport geometry is converted
  // at the boundary. Fitting the complete bodies keeps heads and feet visible.
  function framing(actors,safe,preferred){
    const left=Math.min(...actors.map(a=>a.x-(a.width||28)/2));
    const right=Math.max(...actors.map(a=>a.x+(a.width||28)/2));
    const top=Math.min(...actors.map(a=>a.y-(a.height||48)));
    const bottom=Math.max(...actors.map(a=>a.y+6));
    const z=Math.max(.1,Math.min(preferred,(safe.right-safe.left)/Math.max(1,right-left+12),(safe.bottom-safe.top)/Math.max(1,bottom-top+12)));
    return {z,x:(left+right)/2-(safe.left+safe.right)/2/z,y:(top+bottom)/2-(safe.top+safe.bottom)/2/z};
  }
  // Reserve both possible dialogue portrait positions. The single #face remains
  // owned by showDialoguePortrait, so changing speakers never changes the camera.
  function conversationFrame(actors,viewport,preferred){
    const {width,height,panelTop,portraitSize,menu}=viewport;
    const bottom=Math.min(height,panelTop)-16;
    const middle={left:portraitSize+18,right:width-portraitSize-18,top:24,bottom};
    if(menu)return framing(actors,{left:18,right:width-18,top:24,bottom},preferred);
    const between=framing(actors,middle,preferred);
    // On narrow phones there is more room above the portrait corners. Keep the
    // pair horizontally centered there rather than shrinking them to fit a slit.
    const above={left:18,right:width-18,top:24,bottom:bottom-portraitSize};
    if(above.bottom<=above.top+48)return between;
    const upper=framing(actors,above,preferred);
    return upper.z>between.z+.01?upper:between;
  }
  let active=false;
  function hide(){active=false;return null;}
  function frame(){
    const menu=!!(ask?.npcConversation||ask?.dragonConversation);
    const dialogue=sayEl.classList.contains('on');
    if(mode!=='play'||editing||atlasOpen||(!menu&&!dialogue)||greenCamera||hatchCamera||bossScene||deflectCamera||fishing||
       window.EmberArenaEntry?.holding()||window.EmberRiding?.holding()||scene?.offscreen||scene?.arriving||scene?.silent||scene?.hold||revealing)return hide();
    let actor=ask?.npcActor||sayNpc||scene?.npcActor;
    const telepathy=ask?.dragonConversation||scene?.telepathy;
    if(telepathy)actor=dragonHere()&&dragon.on&&!dragon.air?dragon:null;
    if(!actor&&scene?.who)actor=speakerNamed(scene.who);
    if(!actor&&typeWho&&typeWho!=='Corin')actor=speakerNamed(typeWho);
    // A voice from afar should not pull the camera through the map.
    if(!actor||!Number.isFinite(actor.x)||Math.hypot(actor.x-P.x,actor.y-P.y)>220)return hide();
    const name=actor===dragon?'Aurelius':actor.n;
    if(!name||!portraitFor(name))return hide();
    const canvas=cv.getBoundingClientRect(),panel=document.getElementById(menu?'bagAsk':'say').getBoundingClientRect();
    if(!canvas.width||!canvas.height)return hide();
    active=true;
    const sx=VW/canvas.width,sy=VH/canvas.height;
    const portraitSize=innerHeight<=600?112:144;
    const actors=[{x:P.x,y:P.y,width:28,height:40},
      {x:actor.x,y:actor.y,width:actor===dragon?84:32,height:actor===dragon?62:48}];
    return conversationFrame(actors,{width:VW,height:VH,panelTop:(panel.top-canvas.top)*sy,
      portraitSize:portraitSize*Math.max(sx,sy),menu},Math.min(5.5,playZoom()*1.22));
  }
  window.EmberConversationView={frame,framing,conversationFrame,profile,active:()=>active};
})();
