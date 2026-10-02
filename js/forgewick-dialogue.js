/* Forgewick begins with Aurelius already part of the journey. Physical
   visibility still matters: news of a companion is not an eyewitness meeting. */
const ForgewickDialogue=(()=>{
  const cast=FORGEWICK_DIALOGUE_CAST,t=(title,first,...replies)=>({title,first,replies});
  function profile(n){
    if(!n||n.noTalk||n.pettable||n.thornwellRoyal||!cast[n.n])return null;
    // Tessa performs in two towns. Merrin can be moved back to Thornwell in
    // the editor. Keep the earlier town's authored conversations there.
    if(['Tessa','Merrin'].includes(n.n)&&(/Thornwell/.test(n.loc||'')||MAPID==='tavern'||
      MAPID==='world'&&Number.isFinite(n.x)&&n.x<7000))return null;
    return cast[n.n];
  }
  const shared=n=>['Tessa','Merrin'].includes(n.n);
  const key=(n,kind)=>(shared(n)?'@thornwell-v2:':'@forgewick-v1:')+n.n+':'+kind;
  const remembers=(n,kind)=>discussedTopics.has(key(n,kind));
  const topicId=(n,i)=>(shared(n)?'thornwell-':'forgewick-')+i;
  const value=v=>typeof v==='function'?v():v;
  function introduction(n){
    const p=profile(n);if(!p)return null;
    const met=remembers(n,'met'),known=remembers(n,'dragon'),seen=remembers(n,'seen');
    const near=npcSeesDragon(n),companion=hasDragon();let lines;
    if(!met&&near)lines=p.meeting.map((s,i)=>(i===1?'Corin':n.n)+': '+s);
    else if(!met)lines=[n.n+': '+p.hello,'Corin: I’m Corin, from Millwood.'+
      (companion?' I travel with a dragon named Aurelius.':''),...(companion?[n.n+': '+p.news]:[])];
    else if(companion&&!known){
      lines=near?[n.n+': '+(n.n==='Tessa'?'You have a dragon companion now! I would like a proper introduction.':'You have brought a dragon companion. Will you introduce us?'),
        'Corin: This is Aurelius. We are travelling together, and I wanted you to meet him.']:
        [n.n+': '+value(p.back),'Corin: There is someone I should tell you about. I travel with a dragon named Aurelius.',n.n+': '+p.news];
    }else if(near&&!seen){
      lines=[n.n+': '+(n.n==='Orris Reed'?'So this is your companion. Give me a moment, and I would like to say hello.':
        n.n==='Brother Edrin'?'So this is the dragon you told me about. Welcome to the chapel; I am glad we can meet.':'So this is the companion you told me about. I am glad we can finally meet.'),
        'Corin: Yes, this is Aurelius. We thought we would stop and say hello together.'];
    }else lines=[n.n+': '+value(p.back),'Corin: It is good to see you. I have a little time to talk.'];
    return {lines,done(){
      if(met)discussedTopics.add(key(n,'return'));
      discussedTopics.add(key(n,'met'));
      if(companion)discussedTopics.add(key(n,'dragon'));
      if(near)discussedTopics.add(key(n,'seen'));
      saveGame();
    }};
  }
  function context(n){
    const p=profile(n);if(!p)return null;
    if(!remembers(n,'met')||hasDragon()&&!remembers(n,'dragon')||npcSeesDragon(n)&&!remembers(n,'seen'))return introduction(n).lines;
    return [n.n+': '+value(p.back)];
  }
  function topic(n,row,id,category='story'){
    const pairs=row.replies.map(([q,a])=>[value(q),value(a)]);
    return {title:row.title,category,friendshipId:topicId(n,id),
      lines:[n.n+': '+value(row.first),'Corin: '+pairs[0][0],n.n+': '+pairs[0][1]],
      authoredBranches:{decisions:{0:pairs.slice(1)}}};
  }
  const peace={
    Prue:t('What work can come first now?', 'With Halvard gone, I want our first decisions to include the households whose repairs kept being postponed.',
      ['Where would you begin?', 'With unsafe roofs and steps. A celebration should not be the only improvement people see.'],
      ['Would the meeting place have to wait?', 'For urgent repairs, yes. I want a useful town project, not another grand job that pushes people aside.'],
      ['Does the work feel different?', 'The work itself is familiar. Having a say in what comes first is the welcome change.']),
    Toft:t('Can you recover what the crown took?', 'I have kept the figures. Whether anyone can repay the old requisitions is another question, but I can stop subtracting the next one from my stock.',
      ['Will you change what you sell?', 'I can plan supplies around what people need. That is a better business than guessing when an officer will arrive.'],
      ['Are you relieved?', 'Very. I still have bills to settle, but they no longer arrive with the same royal threat behind them.'],
      ['I hope trade improves.', 'So do I. A few uneventful, properly paid deliveries would be a splendid beginning.']),
    Ovid:t('Who decides the market rules now?', 'We can discuss the rules without a royal officer claiming an exception before we finish the first sentence.',
      ['Will everyone agree?', 'Certainly not. Disagreement is easier to manage when nobody can end it by threatening the other person.'],
      ['What will you change first?', 'Make the fees clear and keep the same passages clear for everyone.'],
      ['That sounds less exhausting.', 'Ask me after the first meeting. But yes, it is a much better sort of work.']),
    Garran:t('What can the workshops choose now?', 'The royal orders no longer swallow the day. I would like to catch up on the small repairs people have been waiting for.',
      ['Would you prefer a grand commission?', 'Somebody getting a working tool back is grand enough to them.'],
      ['Do you feel relieved?', 'Yes. I can plan a week without wondering who will arrive to erase it.'],
      ['Will the workshops help each other?', 'We already do. It will be pleasant to arrange that cooperation without an emergency.']),
    Nessa:t('What will you paint after the ban?', 'I want people to choose their own designs again. Some will want dragons, and some will want the flowers they would have chosen anyway.',
      ['Would you display your dragon work?', 'Yes. It will be good to discuss the colours without first checking who is listening.'],
      ['What if a customer wants something ordinary?', 'Then I will make it gladly. Freedom should not become a new required design.'],
      ['Will the chapel ask for new glass?', 'Perhaps. I would listen to what the congregation wants before sketching their future for them.']),
    Kerr:t('Can workers take a rest now?', 'Without the royal quotas, we have a chance to arrange the work more fairly. I intend to ask for actual time off, not simply a kinder explanation of why it is impossible.',
      ['What would you do with it?', 'Enjoy my garden while it is light. I have decided that is not an extravagant request.'],
      ['Will the change happen by itself?', 'No. We will still need to speak up and keep the agreement clear.'],
      ['I hope you get your rest.', 'Thank you. I hope you and Aurelius do as well.']),
    Brigid:t('Which homes will be repaired first?', 'I would like the people living with unsafe steps and leaking roofs to help decide. They know what cannot wait.',
      ['Will everyone listen?', 'We will need to make room for them. The end of a reign does not automatically change every habit.'],
      ['Could the town look different?', 'Yes, but I would rather it become better to live in before it becomes better to admire.'],
      ['Are you looking forward to the work?', 'Very much. It is a pleasure to make practical plans without a royal deadline interrupting them.']),
    Tallis:t('Which songs will you bring back?', 'The songs people were afraid to request. I want to hear the crowd choose them, not give a lecture about how brave I am for playing them now.',
      ['Will you write something new too?', 'Probably. I shall try not to make it so long that everybody regrets asking.'],
      ['What if people want a quiet evening?', 'Then they shall have one. We have won the right to be ordinary as well as celebratory.'],
      ['I would enjoy hearing the crowd sing.', 'So would I. It is a very different sound when nobody is checking the doorway.']),
    Tessa:t('What does it feel like to sing freely?', 'People can choose a song without first deciding whether the choice puts their neighbours at risk. I had almost forgotten how relaxed a chorus could sound.',
      ['Do you have a favourite to bring back?', 'Several. I will leave room for the audience’s favourites too.'],
      ['Would you write about what happened?', 'In time, and with care. I want to hear the people involved before making a version everyone sings.'],
      ['We would like a song with no grand meaning.', 'Then something pleasant it is. You have earned an evening that does not retell your life.'])
  };
  function shield(n){
    const row=glassShield?t('The shield Sela gave me', 'You have Sela’s Glass Shield now. Hold B during battle to raise its field; simply carrying it does not block a blow.',
      ['I am glad you sent us to him.', 'So am I. It is his work, and I hope you told him it helped.'],
      ['Should I still move out of danger?', 'Yes. Use the shield deliberately; do not make it your excuse to stand in every attack.'],
      ['Will you admit his glass is useful?', 'I already sent you to him. I believe that constitutes a fairly public admission.']):
      t(dragonLearned('shield')?'Where can I find your brother’s shield?':'Can you recommend other protection?', 'My brother Sela makes protective glasswork in Sandspire. Visit his shop in the northwest of town, then go through to the workshop at the back and ask him about the Glass Shield.',
      ['What does a Glass Shield do?', 'Its field can turn an attack aside when you raise it with B. Sela will explain when he gives it to you.'],
      ['Should I head straight to Sandspire?', ()=>JOURNEY_GATES.forgewick.open()?'The east road is open. You can continue towards Sandspire when you are ready.':!smithUpgrade||!charm.edge?'Finish collecting the equipment I offer first. You also need to claim the Lightning Heartstone from Forgewick Temple before continuing east.':'You have my equipment. Claim the Lightning Heartstone in Forgewick Temple before continuing east.'],
      ['I will look for Sela when we reach Sandspire.', 'Good. The shop’s tall chimney helps you find it. Tell him his brother thought the work worth sending a traveller to see.']);
    return {...topic(n,row,'shield','lead'),friendship:false,questUnlock:!glassShield&&!dragonLearned('shield')};
  }
  function church(n){
    const found=DragonChapels.found(),known=DragonChapels.known();
    const row=found?t('I found the church in the desert', 'Then you have reached the chapel my brother Cael keeps. I am glad you found the way through the desert.',
      ['Does Cael still offer a blessing?', ()=>DragonChapels.capture()?'You have received his Sky Blessing. Hold your sprint control while flying with Aurelius to use its increased speed.':'Speak with Cael inside if you have not received his Sky Blessing. It improves Aurelius’s flying sprint.'],
      ['Is Cael really your brother?', 'Yes. We chose different places to keep a welcome alive, but I am glad travellers can visit us both.'],
      ['I am glad you told us where to look.', 'So am I. A hidden refuge does little good if nobody who needs it can find it.']):
      t(known?'Remind me how to find Cael’s church.':'Is there anywhere you would recommend visiting?', ()=>wonAll?'My brother Cael kept a hidden dragon church through Halvard’s reign. It stands beyond Sandspire, and he still welcomes visitors.':'My brother Cael keeps a secret church in the desert beyond Sandspire. People still worship dragons there despite Halvard’s ban.',
      ['Please mark where we should look.', 'Take the winding path south from the eastern desert road beyond Sandspire, then follow it west through the dunes. The church is crowned by a dragon. I will put the lead in your Quest List.'],
      ['What would we find there?', 'Cael can offer the Sky Blessing, which strengthens Aurelius’s flying sprint. The route goes south from the eastern desert road beyond Sandspire, then west. I will record it so you need not memorise every turn.'],
      ['I would like to keep that in mind for later.', 'Of course. I will record The Secret Dragon Church in your Quest List. Visit when you are ready; you owe us no pilgrimage.']);
    return {...topic(n,row,'church','lead'),friendship:false,questUnlock:!known&&!found,
      onReply:()=>{if(!DragonChapels.known())DragonChapels.learnChurch();}};
  }
  function topics(n,{all=false}={}){
    const p=profile(n);if(!p)return null;
    const completed=new Set(window.EmberFriendship?.capture().people[n.n]?.completed||[]);
    const familiar=[0,1,2,3].every(i=>completed.has(topicId(n,i)));
    const rows=p.rows.map((original,i)=>{
      const row=wonAll&&i===3&&peace[n.n]?peace[n.n]:original;
      const available=i<4||(breathHas.lightning&&remembers(n,'return')&&familiar);
      return {...topic(n,row,i),available};
    }).filter(row=>all||row.available);
    if(n.n==='Dunstan'){
      rows.unshift(shield(n));
      if(hasSword()&&(!smithUpgrade||!charm.edge))rows.unshift({title:smithUpgrade?'May I collect the Whetstone?':'Could you improve my sword and armour?',
        category:'lead',friendship:false,go:()=>beginNpcTalk(n,true)});
    }
    if(n.n==='Brother Edrin')rows.unshift(church(n));
    return rows;
  }
  function service(n){
    if(!profile(n)||n.n!=='Dunstan'||!hasSword()||smithUpgrade&&charm.edge)return null;
    const intro=!remembers(n,'met')?introduction(n):null;
    if(intro)intro.done();
    return [...(intro?.lines||[]),...(smithUpgrade?[
      'Dunstan: Your sword and armour are already improved. There is still something I meant to give you.',
      'Corin: What is it?',
      'Dunstan: A Whetstone charm. Equip it in the Bag to make your sword blows stronger.'
    ]:[
      'Dunstan: Let me inspect the fit and the blade before I promise you anything.',
      'Corin: I have been doing my best with them, but I am still learning.',
      'Dunstan: Then I can help. I will improve your sword and fit you with armour for the road. This is a gift, not a debt.',
      'Corin: Thank you. Better protection would make a difference.',
      'Dunstan: There. Keep avoiding the blows you can; better armour is no reason to let somebody hit you.'
    ])];
  }
  function dossier(name,actor){
    const n=actor?.n===name?actor:{n:name},p=profile(n);if(!p)return null;
    return {name,role:p.role,home:name==='Alderic'?'Forgewick Temple':name.startsWith('Miner ')?'Forgewick’s eastern road':'Forgewick',
      bio:p.bio,interests:p.rows.slice(0,3).map(r=>r.title).join(' · '),memory:''};
  }
  return {cast,profile,introduction,context,topics,service,dossier,remembers,topicId};
})();
