/* One conversation catalogue for the complete named cast. Story/service actions
   retain their existing completion callbacks; prose never grants an item. */
const DialogueRenewal=(()=>{
 const cast=DIALOGUE_RENEWAL_CAST;
 const church=n=>!!n&&(!!DIALOGUE_CHURCH_LINES[n.n]||/^chapel_/.test(n.packSpr||'')||n.chapelArt);
 const profile=n=>n&&!n.noTalk&&!n.pettable&&!church(n)?cast[n.n]||null:null;
 const key=(n,kind)=>'@renewal-v1:'+n.n+':'+kind;
 const state=(n,kind)=>discussedTopics.has(key(n,kind));
 function introduction(n){
  const p=profile(n);if(!p)return null;
  const met=state(n,'met'),near=n.n!=='Aurelius'&&npcSeesDragon(n);
  // Maddock witnessed the hatch; Nan has her own compulsory farewell.
  const witnessed=n.n==='Elder Maddock'||n.n==='Nan Ferrow';
  const sight=near&&!witnessed&&!state(n,'seen');
  const i=sight?4:met?2:0;
  // A new dragon sighting does not erase a previous human introduction.
  const reply=sight&&met?p.greetings[5].replace(/(?:I['’]m Corin, and |I['’]m Corin[.;,]\s*|^Corin[.;,]\s*)/,''):p.greetings[i+1];
  return {lines:[n.n+': '+p.greetings[i],'Corin: '+reply],done(){
   discussedTopics.add(key(n,'met'));if(near)discussedTopics.add(key(n,'seen'));
   // Existing quest scripts consult these flags, independently of prose.
   for(const prefix of ['@thornwell-v2:','@forgewick-v1:']){
    discussedTopics.add(prefix+n.n+':met');if(met)discussedTopics.add(prefix+n.n+':return');
    if(near){discussedTopics.add(prefix+n.n+':dragon');discussedTopics.add(prefix+n.n+':seen');}
   }
   saveGame();
  }};
 }
 function context(n){
  if(church(n))return (DIALOGUE_CHURCH_LINES[n.n]||[]).map(s=>s.startsWith('Corin: ')?s:n.n+': '+s);
  return introduction(n)?.lines||null;
 }
 function topic(n,row,id,extra={}){
  const title=row.title.includes(' / ')?row.title.split(' / ')[1]:row.title;
  return {title,opening:row.opening||'',category:'story',friendshipId:'renewal-'+(typeof id==='number'?'v2-':'')+id,available:true,
   lines:[n.n+': '+row.first,'Corin: '+row.replies[0][0],n.n+': '+row.replies[0][1]],
   authoredBranches:{decisions:{0:row.replies.slice(1)}},...extra};
 }
 const row=(title,first,...replies)=>({title,first,replies});
 const lead=(n,id,title,first,...replies)=>topic(n,row(title,first,...replies),id,{category:'lead',friendship:false,opening:{
  pyramid:DesertAdventure.owned()?'What have we brought back from the pyramid?':DesertAdventure.accepted()?'Can we go over the pyramid expedition again?':'Why are you interested in the old pyramid?',
  shield:glassShield?'Did Sela tell you about the shield?':'You mentioned your brother; could his work help me?',
  lantern:charm.lamp?'Where should we try the lantern?':'How do people see in the deep workings?',
  graveyard:charm.wake?'What should I know before using the book?':'What is troubling the graveyard?',
  witch:'Would Maelis be willing to help a traveller?',
  temples:wonAll?'What will happen to the sanctuaries now?':'Can you help me choose our next sanctuary?',
  road:'What is keeping the road closed?',plan:'Can we work out what to do next?',
  fishing:fishingPole?'Shall we put the rod to use?':'How could we keep ourselves supplied with fish?',
  bramble:'What do you think we should do about the dog?',equipment:'Are we carrying what we need?',gifts:'Have we overlooked anything people gave us?'
 }[id]||''});
 function pyramid(n){
  if(DesertAdventure.owned())return lead(n,'pyramid','The scarab we carried out',
   'So that is the Emberheart. All those pages, and you brought back something I could hold. Carry it and dragon Fire gains a quarter of its strength again.',
   ['Should I put it in a charm slot?','Keep those slots free. The Emberheart works simply by remaining with you.'],
   ['Does it strengthen every breath?','Fire alone. A particular old power, not an answer to everything.'],
   ['I wish you had seen the chamber.','Tell me when you can. I should like the parts my research failed to prepare you for.']);
  if(DesertAdventure.accepted())return lead(n,'pyramid','Finishing the expedition',
   DesertAdventure.won()?'The guardian is gone, but the Emberheart is still in her reward chest. Go back and open it; a victory cannot carry a relic home for you.':
   'The Sunken Pyramid lies west of Sandspire, along the winding desert detour. Through the burial chambers, past the guardian, then the Emberheart chest. Saying it is much easier than doing it.',
   ['Where did we record the route?','In Map, open Quest List and choose The Emberheart of the Sands.'],
   ['Remind me why the relic matters.','It strengthens dragon Fire by twenty-five percent while carried. You will not need to equip it.'],
   ['We may need more time.','Take it. I would rather have a late account from you than an early account about you.']);
  const t=lead(n,'pyramid','An expedition worth considering',
   n.n==='Sahir'?'West of Sandspire, the desert detour reaches a dangerous old pyramid. Its Emberheart relic strengthens dragon Fire. Shall I put the expedition on your map?':
   'There may be an Emberheart beneath the Sunken Pyramid, west of Sandspire. It strengthens dragon Fire. I can mark the expedition, but I want an answer from you, not from your curiosity.',
   ['Mark it. We will take the expedition.','Then look for The Emberheart of the Sands in your quests. Follow the western detour, defeat the guardian, and open the chest in her chamber.'],
   ['What danger are you asking us to face?','Creatures on the approach, mummies inside, and the guardian deeper in. Asking does not commit you.'],
   ['We cannot take on another journey yet.','Then we leave it here. A refusal is more useful than a promise made reluctantly.']);
  t.questUnlock=true;t.onReply=words=>{if(words===t.lines[1].slice(7))DesertAdventure.accept(n.n==='Sahir'?'sandspire':'school');};return t;
 }
 const brambleLeads={
  "Orin": [
    "That is Bramble, unless Rowan has acquired a second dog with the same talent for wandering.",
    "Where should I take him?",
    "To Rowan at the Copper Cup, in northern Thornwell. Take the whole dog, muddy parts included."
  ],
  "Mella": [
    "Rowan came asking after that dog. I rather wish he'd looked behind you.",
    "Where is he now?",
    "The Copper Cup in northern Thornwell. He'll be relieved to see you both."
  ],
  "Sennet": [
    "I recognise the collar. Rowan's dog has found himself an escort.",
    "I'm trying to find his owner.",
    "Rowan the Hunter, at the Copper Cup. The tavern is north through town."
  ],
  "Ada": [
    "Bramble! Oh, Rowan will be beside himself. He went to the Copper Cup to ask if anyone had seen him.",
    "Rowan is your husband?",
    "Yes. Please take Bramble to him in the northern tavern before he starts another search."
  ],
  "Linna": [
    "Rowan has been looking for this dog. The Copper Cup was his next stop.",
    "Then we have somewhere to go.",
    "North through Thornwell, west of the school. Bring Bramble to Rowan himself."
  ],
  "Linnet": [
    "That tail ought to improve Rowan's evening considerably. He's at the Copper Cup.",
    "Is the hunter still there?",
    "He was waiting for news. Take Bramble into the tavern; a dog is better than a message."
  ],
  "Garrow": [
    "Rowan's missing dog. Well, that's one question answered.",
    "Can you answer where Rowan is?",
    "At the Copper Cup, northern Thornwell. You'll find the hunter inside."
  ],
  "Wren": [
    "Is that Bramble? Rowan asked me whether I'd seen him. I can stop worrying now.",
    "Where can we find Rowan?",
    "The Copper Cup in the north of town. Keep Bramble with you until they're reunited."
  ],
  "Berta": [
    "Bramble, you troublesome creature. Rowan's at the Copper Cup, asking after you.",
    "I'll take him straight there.",
    "The northern tavern, dear. Rowan will thank you more warmly than the dog can manage."
  ],
  "Merrin": [
    "I passed Rowan at the Copper Cup. He was missing a dog of precisely this description.",
    "A rather friendly description.",
    "Bramble. Bring him north to the tavern and let Rowan finish counting his companions."
  ],
  "Asta": [
    "Those ears! That's Rowan's Bramble. He described them very anxiously.",
    "Where did you speak to him?",
    "At the Copper Cup. Northern Thornwell, west of the school."
  ],
  "Colm": [
    "Rowan has been asking everyone at the Copper Cup about his dog. You've brought the answer.",
    "I'd better deliver it.",
    "Take Bramble into the tavern. Rowan the Hunter will be delighted to receive him."
  ],
  "Bren": [
    "No research needed: Bramble belongs to Rowan. The hunter's at the Copper Cup.",
    "For once, a simple question.",
    "And a simple route. North through town to the tavern, with Bramble beside you."
  ],
  "Della": [
    "I've seen that dog stealing a smell of my garden. Bramble, Rowan's.",
    "Do you know where Rowan went?",
    "The Copper Cup in northern Thornwell. Give him his wandering gardener back."
  ],
  "Ewan": [
    "Rowan is waiting at the Copper Cup for news of Bramble. That looks like excellent news.",
    "I'll let him see for himself.",
    "North to the tavern. The reunion needs no historian's assistance."
  ],
  "Osric": [
    "Bramble has finally found someone with a sense of direction, then.",
    "Only because I'm asking people.",
    "Ask no farther: Rowan the Hunter is at the Copper Cup in northern Thornwell."
  ],
  "Alder": [
    "Rowan came past without Bramble. Said he'd ask at the Copper Cup.",
    "That's the tavern, isn't it?",
    "Yes, north through town. Bring Bramble inside to the hunter."
  ],
  "Gwyneth": [
    "Poor Rowan has been looking for that dog. The Copper Cup was where he meant to wait.",
    "Then I'll take Bramble there.",
    "The tavern in northern Thornwell. You'll be bringing a very welcome interruption."
  ],
  "Archivist Elowen": [
    "Bramble? Rowan asked after him here, then went to the Copper Cup.",
    "I'll leave your books safe from his paws.",
    "Much appreciated. The tavern is west of the school, in northern Thornwell."
  ],
  "Mira": [
    "Rowan's at the Copper Cup. I remember because he kept asking whether anyone had seen his dog.",
    "We've managed that part.",
    "Then take Bramble to the northern tavern and spare Rowan another worried walk."
  ],
  "Oren": [
    "I can identify this particular living creature. Bramble, belonging to Rowan.",
    "Where's the other half of the pair?",
    "The Copper Cup in northern Thornwell. The hunter is waiting inside."
  ],
  "Tessa": [
    "Rowan's missing a dog, and that dog looks determined to be his.",
    "Where did you see Rowan?",
    "At the Copper Cup. North through town; bring Bramble into the tavern."
  ],
  "Master Iven": [
    "You need Rowan the Hunter. He's asking after Bramble at the Copper Cup.",
    "We've been asking after Rowan.",
    "Then the questions can meet in the northern tavern, west of this school."
  ],
  "Bram": [
    "That is Rowan's dog. The hunter is at the Copper Cup.",
    "Thank you. We'll go there.",
    "North through Thornwell. Return him to Rowan, not merely the tavern door."
  ],
  "Nell": [
    "Bramble! Rowan will be relieved. He's at the Copper Cup.",
    "Have you seen him recently?",
    "He was looking for the dog. Try the tavern in northern Thornwell."
  ],
  "Sable": [
    "Rowan left word that he would wait at the Copper Cup if anyone found Bramble.",
    "We can answer that message.",
    "Take the dog to him at the northern tavern. He'll want evidence with a wagging tail."
  ],
  "Pella": [
    "For this route, you need the Copper Cup. Rowan's there, missing that dog.",
    "North through town?",
    "Exactly. The tavern west of the school. Bring Bramble inside."
  ],
  "Bess": [
    "Bramble! At last. Rowan's been worrying a hole in my floor over you.",
    "I'll bring him to Rowan.",
    "Please do. The hunter's here in the Copper Cup; don't leave the dog at the door."
  ],
  "Ronan": [
    "Rowan will be pleased to see those paws. He's here at the Copper Cup.",
    "I'll make the introduction brief.",
    "The dog will probably handle most of it. Take Bramble to the hunter."
  ],
  "Venn": [
    "I've been carrying Rowan's question around: has anyone seen Bramble? You've answered beautifully.",
    "Where should the answer go?",
    "To Rowan here in the Copper Cup. Bring the dog over yourself."
  ],
  "Hobb": [
    "That's the dog Rowan's been looking for. He came to the Copper Cup to ask around.",
    "Then we arrived at the right place.",
    "Find the hunter inside and let Bramble do the greeting."
  ],
  "Edric": [
    "Rowan's here at the Copper Cup, waiting for news of that dog.",
    "I can offer better than news.",
    "Quite. Take Bramble to the hunter before either finds another detour."
  ],
  "Dorr": [
    "Rowan asked about his dog. I was awake enough to remember that much.",
    "Where can I find him?",
    "Here at the Copper Cup. Bring Bramble over; it'll make a better answer than mine."
  ],
  "Ser Anwen": [
    "Bramble belongs to Rowan. The hunter's been asking for him at this tavern.",
    "I'll return him directly.",
    "Good. Keep him with you until Rowan sees him. The Copper Cup is busy enough to lose someone twice."
  ],
  "Grusk": [
    "Rowan's dog. Good. I was getting tired of having no news for him.",
    "Can I find Rowan here?",
    "Yes, in the Copper Cup. Take Bramble to the hunter and let him stop worrying."
  ],
  "Fen": [
    "Oh, Bramble! Rowan's here at the Copper Cup. You've made somebody very happy without knowing it yet.",
    "I'll take him over.",
    "Please do. Rowan deserves the first enthusiastic greeting."
  ],
  "Tobin": [
    "That's Bramble! Rowan's been looking for him.",
    "Where's Rowan waiting?",
    "The Copper Cup, the tavern in northern Thornwell. Bring the dog!"
  ],
  "Senn": [
    "Rowan is here at the Copper Cup. I'd wager he'll recognise that dog faster than you can explain.",
    "No wager needed.",
    "Agreed. Take Bramble to the hunter; this ought to end pleasantly."
  ],
  "Dain": [
    "That dog belongs to Rowan. He's been at the Copper Cup asking after him.",
    "I'll settle the question.",
    "With all four paws present, if possible. Find the hunter inside."
  ],
  "Rusk": [
    "Rowan's waiting here at the Copper Cup. Bramble has given him an anxious afternoon.",
    "I found him outside town.",
    "Tell Rowan that when you bring the dog over. He'll want to know where they parted."
  ],
  "Pip": [
    "That dog is Bramble. I've heard people say Rowan is at the Copper Cup looking for him.",
    "Then we'll head there.",
    "Northern Thornwell, the tavern. Bring Bramble all the way to Rowan."
  ],
  "Vale": [
    "Rowan's at the Copper Cup, and that is his missing Bramble. A satisfactory connection.",
    "We'll let him enjoy it.",
    "Take the dog to the hunter. No need to turn the answer into suspense."
  ],
  "Cerys": [
    "Bramble! Rowan's been asking everyone here whether they've seen him.",
    "Now someone can say yes.",
    "Bring him to Rowan at the Copper Cup. I'd rather let the hunter see the happy part himself."
  ],
  "Nyra": [
    "The missing dog returns, accompanied by a helpful stranger. Rowan's here at the Copper Cup.",
    "No trick involved, I promise.",
    "Then take Bramble to the hunter. Real reunions require less explanation than my work."
  ],
  "Maren": [
    "Rowan went to the Copper Cup to find news of his dog. I see the news has found you.",
    "Can you point us there?",
    "North through Thornwell, west of the school. Bring Bramble into the tavern."
  ],
  "Celia": [
    "Rowan described this dog at the Copper Cup. The description grew more worried as he spoke.",
    "We'd better shorten his wait.",
    "The northern tavern. Find Rowan the Hunter and bring Bramble to him."
  ],
  "Isolde": [
    "I wondered why Rowan had no dog with him. He was going to the Copper Cup.",
    "Bramble found me on the road.",
    "Then you can finish the journey together. Rowan's at the tavern in northern Thornwell."
  ],
  "Cartwright Oswin": [
    "Please take that dog to Rowan before he investigates my wheels. His owner's at the Copper Cup.",
    "We'll leave your wheels alone.",
    "Thank you. Northern Thornwell, west of the school. Rowan the Hunter."
  ],
  "Brin": [
    "Rowan's at the Copper Cup. Bramble has rather shortened the distance between my studies and an actual lost creature.",
    "I can return this one.",
    "Take him to the northern tavern, west of the school. Rowan will be glad you did."
  ],
  "Tamsin": [
    "Bramble has found a stranger willing to help. Rowan's waiting at the Copper Cup.",
    "The dog made a persuasive case.",
    "Then give him his ending: Rowan the Hunter, inside the northern tavern."
  ],
  "Puck": [
    "Oh, that's Bramble! Rowan's here in the Copper Cup, asking where he's gone.",
    "We can stop the asking.",
    "Bring the dog to him. I'll save my commentary for afterward."
  ]
};
 function guides(n){
  const list=[],action=(title,go)=>list.push({title,category:'lead',friendship:false,go});
  if(n.n==='Demon')action(cinderSeal?(trialSealPlaced?'Arrange a contest':'A place for our visitor'):'An invitation in stone',()=>talkTrialDemon(true));
  if(n.n==='Mosslet')action(quest>=Q.FLED?'What fell beyond the trees':'A trembling path',()=>talkShroomLookout(n));
  if(n.hollybeckRescue)action(HollybeckRescue.rescued()?'Tying down the sled':'Stranded with the supplies',()=>HollybeckRescue.talk(n));
  if(['Scholar Ilyan','Sahir'].includes(n.n))list.push(pyramid(n));
  if(n.n==='Odo'&&!fishingPole)action(hasDragon()?'A rod to take travelling':'Keeping the fish company',()=>beginNpcTalk(n,true,true));
  if(n.n==='Calder'&&!fishingPole)action(odoRodReferral?'Your grandfather sent me':'Learning to cast',()=>beginNpcTalk(n,true,true));
  if(n.n==='Nan Ferrow'){
   if(!hasDragon())action('The morning errand',()=>beginNpcTalk(n,true));
   else if(nanGiftPending())action('One difficult goodbye',()=>beginNpcTalk(n,true));
   if(typeof nanCookingHere==='function'&&nanCookingHere(n))action('Something cooling on the stove',()=>giveNanElixir(n));
  }
  if(n.n==='Hettie'&&quest<Q.NOISE)action('A basket to deliver',()=>beginNpcTalk(n,true));
  if(n.n==='Dunstan'){
   if(hasSword()&&(!smithUpgrade||!charm.edge))action('A blade worth improving',()=>beginNpcTalk(n,true));
   list.push(lead(n,'shield','My brother’s sort of protection',glassShield?
    'Sela let you have the Glass Shield, then. He makes clever things. Raise its field with B in a fight; cleverness needs a hand to help it.':
    'My brother Sela works in Sandspire. Northwest glass shop, workshop through the back. Ask for his Glass Shield. Yes, glass. Let him explain before you make the face I made.',
    ['You doubted it?','I work with steel. He enjoyed showing me what its field could turn aside. Hold B to raise it.'],
    ['Is the road to Sandspire ready?',JOURNEY_GATES.forgewick.open()?'Clear enough to travel. Buy what you need before the desert begins.':'Not yet. Get my equipment and Lightning from Forgewick Temple while the east road is being cleared.'],
    ['Shall I mention your name?','Tell Sela that Dunstan sent you for the shield. It will improve his entire afternoon.']));
  }
  if(n.n==='Sela'&&!glassShield&&dragonLearned('shield'))action('A recommendation from Dunstan',()=>beginNpcTalk(n,true));
  if(n.n!=='Dunstan'&&n.charm&&!charm[n.charm])action('A gift for the journey',()=>beginNpcTalk(n,true));
  if(n.gift&&!breathHas[n.gift])action('What the stone can teach us',()=>beginNpcTalk(n,true));
  if(['Mira','Toft','Dorrick'].includes(n.n))list.push(lead(n,'lantern','Below the reach of ordinary lamps',charm.lamp?
   'That Hollybeck Lantern will serve you in the deep galleries. Carry it with you; it shows what ordinary lamps cannot. You need not give up a charm slot.':
   'Ask Sverre in Hollybeck for Torvald’s lantern before you try the deep mine galleries. People go down with perfectly good lamps and discover they are the wrong sort of light.',
   ['Could we look around the upper workings?','Keep to the lit galleries. Leave the deeper passages until you have the lantern.'],
   ['What will we find at the bottom?','Mushroom creatures have taken the deepest chamber. Clear them out before you search it.'],
   ['Where should I keep the lantern?','Among your key items. Carrying it is enough; keep your charm slots for other things.']));
  if(n.n==='Oren')list.push(lead(n,'graveyard','An uncomfortable reading list',charm.wake?
   'The Book of the Dead is an unusual addition to a bag. It gives you Summon: two wraiths to fight with you. No charm slot required.':
   'There is a Book of the Dead in the graveyard northwest of Hollybeck. You must defeat every wave of ghosts to claim it. The reward is Summon, which calls two wraith allies.',
   ['Every wave?','Yes. Count on several fights, not a single ghost obligingly guarding the cover.'],
   ['Must the book be equipped?','No. Keep it as a key item and the Summon ability is yours.'],
   ['That sounds like a trip to prepare for.','An excellent response to a title like that. I would be worried if you went running straight off.']));
  if(n.n==='Tamsin')list.push(lead(n,'witch','A person beyond the rumours',charm.ward?
   'You have Maelis’s ward already. Put it on through your Bag when you need it. Protection tucked beneath a spare shirt helps nobody.':
   'Maelis lives in Witchmoor, north of Dreadmarsh. Ask her about her ward. You can decide what you think of her after hearing her own voice.',
   ['How does her ward protect someone?','It reduces the harm from enemy attacks while equipped. You can still be hurt.'],
   ['Should I bring money?','If you want bombs, yes. She sells those.'],
   ['People sound nervous when they mention her.','People enjoy being frightened at a safe distance. They often forget there is a person on the other end of the story.']));
  if(n.n==='Brin'||n.n==='Elder Maddock'&&dragonIntroDone||n.n==='Alderic')list.push(lead(n,'temples','One sanctuary at a time',
   wonAll?'The sanctuaries are still there, but you can visit without measuring every step against Halvard. I hope somebody goes simply to learn.':breathHas.shadow?'Shadow completes the temple stones. North to Frostcrag now, through the passage east into Ashcrag, then the volcanic road to Cinderhold.':breathHas.ice?'With Lightning and Ice collected, you need Shadow. Hollybeck Temple is northeast of town.':breathHas.lightning?'Lightning is yours. Next is Ice, in Sandspire Temple. Prepare in Sandspire, then take the approach southeast of town.':'Start at Forgewick Temple, south of Forgewick. The road from Millwood reaches Thornwell first; Forgewick is farther east. Lightning waits in its temple.',
   ['What must we do inside?','Defeat the guardian and take the Heartstone. Coming as far as the door is brave, but it will not give your dragon its power.'],
   ['What should I mark on the map?',wonAll?'Somewhere you want to go. You are allowed that choice now.':breathHas.shadow?'Cinderhold. The way goes through Frostcrag and Ashcrag. Take supplies.':breathHas.ice?'Hollybeck Temple. Find the trail northeast of Hollybeck and collect Shadow.':breathHas.lightning?'Sandspire Temple. Its southeastern approach leads to Ice.':'Forgewick Temple. Follow the separate southern trail for Lightning.'],
   ['And after each Heartstone?','Check what you actually took from the temple, then plan for the next. Leave no stone behind in a chest.']));
  const road={
   'Cartwright Oswin':['thornwell','I cannot get this cart clear yet. You were looking for Rowan, weren’t you? Find him in Thornwell and return his dog before continuing to Forgefalls.','There. A cart is a much better thing beside the road than across it. The way east to Forgefalls is yours.','Was anything broken?','My temper, briefly. The wheel fared better.'],
   'Miner Marn':['forgewick','Still shifting the last of it. See Dunstan for equipment and claim Lightning in Forgewick Temple; we should be finished when you are.','That is the last obstruction. With Dunstan’s equipment and Lightning collected, you can take the desert road toward Sandspire.','What happens to the rubble?','Somebody will find a use for it. They usually tell us after we have carried it somewhere else.'],
   'Miner Nerik':['sandspire','The caravan needs more room before it can move. Have you collected Ice from Sandspire Temple? Make that your next stop while we finish.','The caravan is out of the way. East toward Coralmere, if that is where you are bound.','Was the load too heavy?','Not until it moved where nobody wanted it. Weight becomes very personal when you have to lift it.'],
   'Snowbuilder Nessa':['hollybeck','There is work left on the northern passage. Collect Shadow from Hollybeck Temple first; you will need it beyond Frostcrag.','You can take the mountain road now. North to Frostcrag, then through the eastern passage to Ashcrag.','Can we rely on it?','Today, yes. Tomorrow I make the weather answer for itself.']
  }[n.n];
  if(road){const [gate,blocked,clear,question,answer]=road,opened=JOURNEY_GATES[gate].open();list.push(lead(n,'road','Making a way through',opened?clear:blocked,
   [question,answer],['Is the way behind us still clear?','You can go back. No shame in collecting supplies you know you will need.'],
   ['I ought to check our route.',opened?'A good moment to do it. Roads are easier to understand before you choose the wrong turning.':'Keep your local task marked for now. We have our work, and you have yours.']));}
  if(n.n==='Astrid'||n.n==='Sverre')list.push(...HollybeckRescue.topics(n));
  if(brambleQuest===1&&brambleLeads[n.n])list.unshift({title:'Who is waiting for Bramble?',category:'lead',friendship:false,go:()=>{
   const [clue,reply,answer]=brambleLeads[n.n];
   playScene([n.n+': '+clue,'Corin: '+reply,n.n+': '+answer],{who:n.n,npcActor:n,after:()=>openNpcTopics(n)});
  }});
  for(const t of list){
   if(t.friendshipId==='renewal-shield')t.questUnlock=!glassShield&&!dragonLearned('shield');
   if(t.friendshipId==='renewal-lantern')t.questUnlock=!charm.lamp&&!dragonLearned('lantern');
   if(t.friendshipId==='renewal-graveyard')t.questUnlock=!charm.wake&&!dragonLearned('graveyard');
   if(t.friendshipId==='renewal-witch')t.questUnlock=!charm.ward&&!dragonLearned('gift:Maelis');
  }
  return list;
 }
 function topics(n,{all=false}={}){
  const p=profile(n);if(!p)return null;
  const rows=p.topics.map((r,i)=>topic(n,r,i));
  // Past-tense alternatives keep changed world conditions coherent.
  if(n.n==='Bess'&&wonAll)rows[2]=topic(n,row('Choosing the guest list',"I used to dread hearing a carriage stop outside. Yesterday I caught myself hoping it was a customer. Imagine that.",
   ["What would make a good evening now?","People paying, eating, and going home pleased. I've lowered my ambitions to something wonderful."],["Will you keep the king's table?","It's a perfectly good table. I'll put a family at it."],["You should have an evening off.","I intend to. Someone else can discover how many people need a spoon at once."]),2,{opening:'What would a good evening look like now?'});
  if(n.n==='Elder Maddock')rows[2].available=quest>=Q.NOISE;
  const optional=all?rows:rows.filter(r=>r.available);
  if(all)return optional;
  return [...guides(n),...(typeof Crafting!=='undefined'?Crafting.topics(n):[]),...optional];
 }
 function open(n){
  if(throneRoomKing(n))return false;
  if(!profile(n))return false;
  if(n.thornwellRoyal)return openThornwellAudience(n);
  n.goto=null;n.arrived=true;n.scriptWalking=false;P.moving=false;sayOff();showFace(null);faceToward(n,P.x,P.y);
  const options=topics(n).map(t=>({n:t.title,opening:t.opening,category:t.category,friendship:!!t.lines&&t.friendship!==false,friendshipId:t.friendshipId,questUnlock:t.questUnlock,
   go:()=>t.go?t.go():EmberConversationFlow.playTopic(n,t)}));
  ask={quick:1,npcConversation:n.n,npcActor:n,repaintWorld:true,opts:[{n:n.n,head:true},...options,
   ...(n.sells?[{n:'See your stock',category:'trade',friendship:false,go:()=>openMerchantShop(n)}]:[]),{n:'Goodbye',go:null}]};
  askPick=1;askDraw();return true;
 }
 function prompt(n,{dragon:telepathy=false,talk,leave,greeted=false}={}){
  if(!telepathy&&beginThroneConfrontation(n))return true;
  if(!profile(n))return false;
  clearPadInputs();running=false;P.act=null;P.moving=false;
  const map=MAPID;
  const invite=()=>{
   if(MAPID!==map||mode!=='play')return;
   ask={quick:1,conversationPrompt:true,npcActor:n,back:leave,opts:[{n:n.n,head:true},
    {n:'Talk',go:talk||(()=>telepathy?openDragonConversation():open(n))},
    ...(n.sells?[{n:'Purchase',go:()=>openMerchantShop(n)}]:[]),{n:'Maybe Another Time',go:leave||null}]};askPick=1;askDraw();
  };
  if(greeted){introduction(n)?.done();invite();return true;}
  const intro=introduction(n);playScene(intro.lines,{who:n.n,npcActor:n,telepathy,conversationGreeting:true,after:()=>{intro.done();invite();}});return true;
 }
 function service(n){
  const say=(...lines)=>lines.map(s=>s.startsWith('Corin: ')?s:n.n+': '+s);
  if(n.n==='Dunstan'&&hasSword()&&(!smithUpgrade||!charm.edge))return smithUpgrade?say(
   'Wait. The sword and armour are done, but this Whetstone charm should have gone with them.','Corin: Does it work like an ordinary whetstone?',
   'Equip it in the Bag. It strengthens each sword strike. Less elbow grease, though I would not grow lazy.'):say(
   'Let me look at that sword. Maddock kept a decent blade. There is still better work in it.',
   'Corin: Can you bring it out?','Yes. Armour too, while you are here. Stand straight; I cannot fit it to a question mark.',
   'Corin: Sorry. I was wondering what it would cost.','Nothing. There: stronger sword, better armour. Bring yourself back in one piece and we can call it good work.');
  if(n.n==='Sela'&&!glassShield&&dragonLearned('shield'))return say('Dunstan recommended my Glass Shield? You must give me a moment to enjoy that.',
   'Corin: He seemed quite certain it would help.','It will. Hold B in battle and the glass raises a protective field. The field turns the blow aside; do not simply offer a blade the glass.',
   'Corin: I had wondered about that part.','Understandable. Take it. I should rather see it save a traveller than impress my brother twice.');
  if(n.n==='Maelis'&&!charm.ward)return say('Hold still. I have a ward here that is doing nobody any good in my pocket.',
   'Corin: What should I do with it?','Equip it through your Bag. Enemy blows will hurt less. They will still hurt, so keep your sense.',
   'Corin: Is there a price?','For this? No. You can be given something without owing a piece of yourself afterward.');
  if(n.charm==='lamp'&&!charm.lamp)return say('This is Torvald’s Hollybeck Lantern. I have kept it safe long enough. Take it into the deep mine galleries; it shows what ordinary light misses.',
   'Corin: Must I equip it instead of a charm?','No, it is a carried key item. Keep it in your bag and leave the charm slot free.',
   'Corin: Are you sure you want to part with it?','Torvald made it for the dark. It has seen quite enough of my house.');
  const gifts={
   spore:['A traveller, is it? Come closer. I have a Spore from the deep ring that may be of use to you.','I’m Corin, from Millwood. What does it do?','Equip it in your Bag. Each defeated enemy restores one heart. A modest advantage, but I am fond of advantages that bring people home.'],
   twin:['I would like you to take my Twin Heart charm. Before you ask, there is no errand attached.','Then I had better ask how to use it.','Equip it in your Bag. Once in a fight, a dragon can intercept a blow meant for its rider. Look after each other beyond that, too.'],
   brand:['This Flamebrand belongs on a journey. Yours will do, if you are willing.','What happens when I equip it?','Your sword strikes gain fire. Put it on through the Bag, and be quite certain you know which way you are swinging.']
  };
  if(n.charm&&!charm[n.charm]&&gifts[n.charm]){const g=gifts[n.charm];return say(g[0],'Corin: '+g[1],g[2]);}
  return null;
 }
 function rod(name){return name==='Odo'?(odoRodReferral?[
  'Corin: Which turning takes me to Calder?','Odo: Stay on the road east from Millwood toward Thornwell. His is the first camp. Ask the lad for that spare rod.',
  'Corin: First camp. I can remember that.']:[
  'Corin: Odo, could I get hold of a fishing rod somewhere?','Odo: My grandson Calder has two. First camp on the road east to Thornwell. One rod has spent quite enough time doing nothing.',
  'Corin: Does Calder agree with that?','Odo: He will when you tell him I sent you. Ask politely; it is his rod, whatever I say about it.']):[
  odoRodReferral?'Corin: Odo told me you had a rod that needed some exercise.':'Corin: Could you spare a rod for someone who has plenty to learn?',
  'Calder: My grandfather’s spare. Take it. He gave it to me for exactly this sort of conversation.',
  'Corin: Is there a good place for a first attempt?','Calder: Below Forgefalls, southeast of Thornwell. Face the water and press A. Cast, wait for the float to dip, then hook. Hold to reel, release when the fish lunges.',
  'Corin: That sounds manageable when you say it.','Calder: It will become manageable when you try it. Keep your feet dry and forgive yourself the first few fish.'];}
 function dossier(name){const p=cast[name];return p?{name,role:p.role,home:p.home,bio:p.role+' from '+p.home+'.',interests:p.topics.slice(0,3).map(t=>t.title.split(' / ').at(-1)).join(' · '),memory:''}:null;}
 return {cast,church,profile,introduction,context,topic,row,lead,topics,guides,open,prompt,service,rod,dossier,pyramid};
})();
