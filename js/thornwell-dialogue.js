/* Authoritative Thornwell dialogue routes. Before Forgefalls the townspeople
   do not know Corin has a dragon. Meeting Corin, hearing about his companion,
   seeing that companion, and returning for a visit are separate saved facts. */
const ThornwellDialogue = (()=>{
  const cast=THORNWELL_DIALOGUE_CAST;
  const t=(title,first,...replies)=>({title,first,replies});
  const profile=n=>n&&!n.noTalk&&!n.pettable&&!n.thornwellRoyal?cast[n.n]||null:null;
  const key=(n,kind)=>'@thornwell-v2:'+n.n+':'+kind;
  const remembers=(n,kind)=>discussedTopics.has(key(n,kind));
  const publicDragon=()=>hasDragon()&&(wonAll||thornwellRoyal.stage>=7);
  const visible=n=>publicDragon()&&npcSeesDragon(n);
  const shortName=n=>({'Rowan the Hunter':'Rowan','Archivist Elowen':'Elowen','Master Iven':'Iven','Ser Anwen':'Anwen','Cartwright Oswin':'Oswin'})[n.n]||n.n;
  function namedOpening(n,line){
    const name=shortName(n);
    return line.includes(name)?line:'I am '+name+'. '+line;
  }
  const firstDragonReplies={
    Garrow:'Give him a little room to approach you. We are only stopping to talk.',
    Wren:'We are all right, thank you. I wanted to say hello before asking about supplies.',
    Asta:'Let him choose whether to come closer. You can ask a question while he gets comfortable.',
    'Rowan the Hunter':'A little room would help, thank you. I wanted you to meet him without either of you feeling crowded.',
    Bess:'We are just saying hello. Thank you for thinking about giving him space.',
    Dorr:'Yes, he is real. I can see why you asked.',
    Linnet:'I would have to ask him what he enjoys listening to. You are welcome to tell us about your music.',
    'Ser Anwen':'Thank you. I would like this to be a friendly introduction too.',
    Mabel:'It took me a while to stop staring as well. I wanted to give you a chance to meet him.',
    Fen:'A wave seems a good place to start. I wanted him to meet people in his own time.'
  };
  function introduction(n){
    const p=profile(n);if(!p)return null;
    const met=remembers(n,'met'),known=remembers(n,'dragon'),seen=remembers(n,'seen'),near=visible(n),open=publicDragon();
    const self=met?'':'I am Corin, from Millwood. ';
    let lines;
    if(open&&!known){
      if(near)lines=[n.n+': '+(met?p.sight:p.sight+' I am '+shortName(n)+'.'),
        'Corin: '+self+(dragonIntroDone?'This is Aurelius. ':'')+'We are travelling together. '+(firstDragonReplies[n.n]||'I would like you to get to know him.')];
      else lines=[n.n+': '+(met?p.back:namedOpening(n,p.pre)),
        'Corin: '+self+'I am travelling with a dragon.'+(dragonIntroDone?' His name is Aurelius.':' We are getting to know each other.'),n.n+': '+p.news];
    }else if(open&&near&&!seen){
      lines=[n.n+': You told me about your companion. '+p.sight,
        'Corin: Yes, this is the dragon I told you about. I wanted you to meet him when we had the chance.'];
    }else if(!met){
      lines=[n.n+': '+namedOpening(n,p.pre),'Corin: I am Corin, from Millwood. I would enjoy a chance to talk.'];
    }else lines=[n.n+': '+p.back,'Corin: It is good to see you again. Have you a moment?'];
    return {lines,done(){
      if(met)discussedTopics.add(key(n,'return'));
      discussedTopics.add(key(n,'met'));
      if(open)discussedTopics.add(key(n,'dragon'));
      if(near)discussedTopics.add(key(n,'seen'));
      saveGame();
    }};
  }
  function context(n){
    const p=profile(n);if(!p)return null;
    if(!remembers(n,'met')||publicDragon()&&!remembers(n,'dragon'))return introduction(n).lines;
    return [n.n+': '+p.back];
  }
  function topic(n,row,id,category='story'){
    return {title:row.title,category,friendshipId:'thornwell-'+id,
      lines:[n.n+': '+row.first,'Corin: '+row.replies[0][0],n.n+': '+row.replies[0][1]],
      authoredBranches:{decisions:{0:row.replies.slice(1)}}};
  }
  function topics(n,{all=false}={}){
    const p=profile(n);if(!p)return null;
    const rows=p.rows.map((row,i)=>({row,i,available:i<3||i===3&&publicDragon()||i===4&&breathHas.lightning&&remembers(n,'return')&&(n.n!=='Rowan the Hunter'||brambleQuest>=2)}));
    // The same friendship slot changes with the world instead of leaving an
    // impossible pre-victory checklist in an old save.
    if(n.n==='Bess'&&wonAll)rows[2].row=t('The meals Halvard never paid for','Now that Halvard has been defeated, I would like the people who supplied those royal meals to be paid. Relief does not settle their bills.',
      ['What can the town do?','Agree what was taken and help the households that need it most. We should ask them, not guess.'],
      ['Does it feel different working now?','I no longer expect a royal demand every time someone important enters. I am still getting used to that.'],
      ['I hope you get an ordinary busy evening.','So do I. Customers ordering supper and paying for it would be a fine celebration.']);
    if(n.n==='Nell'&&wonAll)rows[3].row=t('After the crown’s accusations','Halvard called other dragons a threat. I hope people now make room to learn who your companion actually is.',
      ['He deserves an ordinary welcome.','Yes. Admiration can become another way of deciding someone’s life for them.'],
      ['Some people will need time.','They will. I hope they use it to listen, not simply repeat an old fear more quietly.'],
      ['We would both like some peace.','Then I will stop asking enormous questions for a while. You have earned a conversation about supper.']);
    const result=rows.filter(r=>all||r.available).map(({row,i,available})=>({...topic(n,row,i),available}));
    const lead=library(n);if(lead)result.unshift(lead);
    if(n.n==='Scholar Ilyan')result.unshift(pyramid(n));
    if(n.n==='Calder'&&!fishingPole)result.unshift({title:odoRodReferral?'Odo said you might have a spare rod.':'Could you help me start fishing?',category:'lead',friendship:false,go:()=>beginNpcTalk(n,true,true)});
    return result;
  }
  function bramble(n){
    const p=profile(n);if(!p||brambleQuest!==1||n.n==='Rowan the Hunter')return null;
    const inside=MAPID==='tavern';
    const route=inside?'Rowan is in the Copper Cup. Bring Bramble over to the hunter here in the tavern.':'Look for Rowan at the Copper Cup, the tavern in northern Thornwell, west of the school.';
    const row=t('Do you know Bramble?',p.bramble+' '+route,
      ['He followed me. I want to make sure he gets home.','You have the right idea. '+route+' You do not need to search the woodland for his owner.'],
      ['Should I take him to Rowan’s house instead?',brambleQuest===1?'Find Rowan at the Copper Cup first. The important thing is to reunite them, rather than leave Bramble at an empty doorstep.':'Rowan and Bramble have already been reunited.'],
      ['Is he safe to approach?','He is a friendly dog, but give him time to come to you. You have already done the useful thing by asking whose companion he is.']);
    return {...topic(n,row,'bramble','lead'),friendship:false};
  }
  function library(n){
    if(!profile(n))return null;
    let row;
    if(n.n==='Mira')row=charm.lamp?t('What the Hollybeck Lantern reveals','The lantern you recovered is a key item. Carrying it helps you see hidden things in the dark workings; it does not need a charm slot.',
      ['Can I rely on its light to keep me safe?','It helps you see. You still need to watch enemies and the ground ahead.'],
      ['Where would it be most useful?','In the dark mine galleries around Hollybeck. Look carefully as you explore.'],
      ['I am glad I went looking for it.','So am I. A useful discovery should make the next visit easier to understand.']):t('A light for the Hollybeck workings','Sverre in Hollybeck keeps Torvald’s lantern. Speak with him to receive it before exploring the dark mine galleries.',
      ['What makes the lantern worth finding?','Its light reveals things ordinary lamps miss in the dark galleries. It is useful for exploring, not a promise of safety.'],
      ['Is Hollybeck my next stop?','It is farther along the road. You need not abandon what you are doing now to remember the lead.'],
      ['Should I prepare before exploring a mine?','Yes. Bring supplies and pay attention to the miners’ warnings. A promising item is not a reason to rush into danger.']);
    if(n.n==='Oren')row=charm.wake?t('Reading the Book of the Dead','The Book of the Dead unlocks Summon. You can call two wraiths to fight alongside you without equipping a charm.',
      ['So it leaves my charm slot free?','Yes. Carrying the book unlocks the ability; it is not an equipped charm.'],
      ['How many allies does it call?','Two wraiths. Use Summon when you want their help in a fight.'],
      ['That was a difficult place to clear.','I am glad you got through it. You need not make the difficulty sound entertaining for me.']):t('The graveyard’s reward','The graveyard northwest of Hollybeck holds the Book of the Dead. It is awarded after every wave of ghosts has been defeated.',
      ['What does the book let me do?','Use Summon to call two wraith allies in battle. The book does not occupy a charm slot.'],
      ['Would defeating one group be enough?','No. You must finish all the waves and claim the book. Prepare for a sequence of fights.'],
      ['Should I head there immediately?','No. It is a lead for when you reach Hollybeck and are prepared. Knowing a reward exists is not an instruction to rush.']);
    if(n.n==='Tamsin')row=charm.ward?t('Equipping Maelis’s ward','Maelis’s ward reduces harm from enemy attacks while you wear it. Make sure it is equipped in your Bag.',
      ['Just carrying it is not enough?','Correct. It is a charm, so you need to equip it for its protection.'],
      ['Does it prevent all damage?','No. It reduces harm; you still need to avoid attacks and heal when necessary.'],
      ['I am glad I spoke to her.','Meeting a person gives you a better beginning than inheriting everybody else’s rumours.']):t('A practical reason to visit Maelis','Maelis lives in Witchmoor, north of Dreadmarsh. Speak with her there about the protective ward she gives travellers.',
      ['What does the ward do?','It reduces harm from enemy blows while equipped. It is useful protection, though it does not make you invulnerable.'],
      ['Does she sell supplies as well?','She sells bombs. Bring coin if you plan to buy them.'],
      ['Can I keep that in mind for later?','Of course. It is a destination to remember, not a reason to forget your current journey.']);
    if(n.n==='Brin'){
      const complete=breathHas.lightning&&breathHas.ice&&breathHas.shadow;
      row=t(complete?'Beyond the three temple Heartstones':'Where the elemental temples stand',complete?'You have recovered Lightning, Ice, and Shadow. The three temple Heartstones are accounted for; you do not need to search those temples for another element.':'The three elemental Heartstones are in the temples near Forgewick, Sandspire, and Hollybeck: Lightning, Ice, and Shadow respectively.',
        ['Which one lies nearest Thornwell?',complete?'You already recovered the one near Forgewick. If you return, it need not be because you missed a fourth elemental Heartstone.':'The temple near Forgewick, east of Thornwell. Its Heartstone holds Lightning.'],
        ['What should I expect from a Heartstone?',publicDragon()?'Claiming an elemental Heartstone teaches your companion its breath attack. Reaching the temple alone is not enough; you need to clear it and claim the stone.':'The records connect each stone to an elemental power used by dragons. I can tell you the locations; I cannot promise the ruins are safe.'],
        ['I would like clear directions, without guesses.','Forgewick for Lightning, Sandspire for Ice, Hollybeck for Shadow. Ask locally as you approach each temple, and bring supplies.']);
    }
    const questUnlock=n.n==='Mira'?!charm.lamp&&!dragonLearned('lantern'):n.n==='Oren'?!charm.wake&&!dragonLearned('graveyard'):false;
    return row?{...topic(n,row,'guide','lead'),friendship:false,questUnlock}:null;
  }
  function pyramid(n){
    let row;
    if(DesertAdventure.owned())row=t('The Emberheart you recovered','You recovered the Emberheart of the Sands. Carrying it increases a dragon’s Fire power by a quarter; it does not need to be equipped as a charm.',
      ['So it leaves our charm slots free?','Yes. Its benefit comes from carrying the relic. You can keep your chosen charms equipped.'],
      ['Does it strengthen every breath attack?','No. The Emberheart strengthens Fire by twenty-five percent. The other elements are unchanged.'],
      ['I am glad we chose to investigate.','So am I. I hope you found the journey worth making, beyond satisfying my curiosity.']);
    else if(DesertAdventure.accepted())row=t('Our pyramid expedition',DesertAdventure.won()?'The guardian has fallen, but the expedition’s reward is still in the chest in her chamber. Open it to claim the Emberheart.':'Your quest leads to the Sunken Pyramid at the end of the winding road west of Sandspire. Explore the chambers, defeat the guardian, and open the treasure chest.',
      ['What will the relic do?','Carrying the Emberheart increases dragon Fire power by twenty-five percent, without taking a charm slot.'],
      ['Where should I check the route?','Open the Map and Quest List. The Emberheart of the Sands is recorded there, and you can choose it to track.'],
      ['I will continue when I am prepared.','That is your decision. The record does not require you to hurry into danger.']);
    else row=t('An expedition for the future','The Sunken Pyramid west of Sandspire holds the Emberheart of the Sands. Records say carrying it strengthens dragon Fire by a quarter. The approach and the chambers are dangerous; would you like the expedition recorded for later?',
      ['Add it to my quest list.','I have recorded The Emberheart of the Sands on your Map and Quest List. Follow the western desert detour when you are ready, defeat the pyramid guardian, and open the chest.'],
      ['I would like to understand the danger first.','Hostile creatures patrol the approach, and guards remain in the burial chambers. Consider the expedition when you have reached Sandspire and prepared. You have not accepted it yet.'],
      ['I have enough to do for now.','Then leave the decision for another visit. You do not owe me an expedition because we have discussed one.']);
    const result={...topic(n,row,'pyramid','lead'),friendship:false,questUnlock:!DesertAdventure.accepted()&&!DesertAdventure.owned()};
    if(!DesertAdventure.accepted()&&!DesertAdventure.owned())result.onReply=words=>{if(words===row.replies[0][0])DesertAdventure.accept('school');};
    return result;
  }
  function gift(n){
    if(!profile(n)||n.n!=='Fen'||charm.twin)return null;
    return ['Fen: I would like you to have my Twin Heart charm. You do not owe me an errand for it.',
      'Corin: Thank you. What does it do?',
      'Fen: It was made for a rider and a dragon. With it equipped, the dragon can intercept a blow meant for the rider once in a fight.',
      publicDragon()?'Corin: That could help us look after each other. I will check my charms in the Bag.':'Corin: That is an unusual thing to give a traveller. Are you sure?',
      publicDragon()?'Fen: Then use it with care. A charm helps a friendship; it does not replace looking after one another.':'Fen: Yes. I would rather it find a use on somebody’s journey than keep it simply because it is unusual.'];
  }
  function rod(n){
    if(!profile(n)||n.n!=='Calder')return null;
    return [odoRodReferral?'Corin: Odo sent me. He said you might have a spare fishing rod.':'Corin: Could you help me get started with fishing?',
      odoRodReferral?'Calder: He did? Then you have found his grandson. I have a spare rod, and you are welcome to it.':'Calder: Certainly. My grandfather Odo gave me a spare rod so I could share one. You are welcome to it.',
      'Corin: Thank you. Where would you suggest I try it?',
      'Calder: The pools below Forgefalls, southeast of Thornwell. Find a safe place facing the water, then press A to start fishing.',
      'Calder: Cast into the gold zone. When you hook a fish, hold to reel and release during its lunges. Give yourself time to learn.'];
  }
  function reunion(n){
    const met=remembers(n,'met');
    return ['Rowan: Bramble! You found someone to bring you back. I have been wondering where you had got to.',
      met?'Corin: He caught up with me on the road. I wanted to make sure he reached you.':'Corin: I am Corin, from Millwood. He caught up with me on the road, so I asked around for his owner.',
      met?'Rowan: Thank you, Corin. Ada and I would have had a miserable evening searching for him.':'Rowan: Rowan. Thank you for taking the trouble, Corin. Ada and I would have been out searching for him.',
      smithUpgrade?'Rowan: You have already had that sword improved. I am glad you are preparing for the road.':'Rowan: If you are heading east, speak to Dunstan in Forgewick about improving your sword and armour. A safer journey is a better thank-you than another speech from me.',
      !glassShield?'Rowan: Ask Dunstan about other protection too. He knows craftspeople farther along the road.':'Rowan: You have found a Glass Shield as well. Keep your equipment ready, and give yourself time to rest.',
      'Rowan: We are going home now. You are welcome to visit us in Thornwell; Bramble would certainly be pleased.'];
  }
  function rememberReunion(n){discussedTopics.add(key(n,'met'));saveGame();}
  function dossier(name,actor){
    const n=actor?.n===name?actor:{n:name},p=profile(n);if(!p)return null;
    return {name,role:p.role,home:name==='Calder'?'Road from Millwood to Thornwell':'Thornwell',bio:p.bio,interests:p.rows.slice(0,3).map(r=>r.title).join(' · '),memory:''};
  }
  return {cast,profile,introduction,context,topics,bramble,library,gift,rod,reunion,rememberReunion,dossier,publicDragon,remembers,topic,t};
})();
