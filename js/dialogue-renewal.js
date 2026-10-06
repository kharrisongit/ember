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
  const reply=sight&&met?p.greetings[3]:sight&&!dragonIntroDone?p.greetings[1]:p.greetings[i+1];
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
  return {title,category:'story',friendshipId:'renewal-'+id,available:true,
   lines:[n.n+': '+row.first,'Corin: '+row.replies[0][0],n.n+': '+row.replies[0][1]],
   authoredBranches:{decisions:{0:row.replies.slice(1)}},...extra};
 }
 const row=(title,first,...replies)=>({title,first,replies});
 const lead=(n,id,title,first,...replies)=>topic(n,row(title,first,...replies),id,{category:'lead',friendship:false});
 function pyramid(n){
  if(DesertAdventure.owned())return lead(n,'pyramid','The recovered Emberheart',
   'The Emberheart you found strengthens Aurelius’s Fire by twenty-five percent while you carry it. Leave your charm slots for other equipment.',
   ['Does it affect Ice as well?','Only Fire. The relic has a specific power.'],
   ['Do I need to activate it?','No. Carrying the recovered relic is enough.'],
   ['We made it through the chambers.','Then take time to enjoy having returned. Research can wait for your account.']);
  if(DesertAdventure.accepted())return lead(n,'pyramid','Our route to the pyramid',
   DesertAdventure.won()?'The guardian is defeated. The Emberheart still needs to be collected from the chest in her chamber.':
   'Follow the winding western desert detour from Sandspire to the Sunken Pyramid. The burial chambers lead toward its guardian and the Emberheart chest.',
   ['Where can I track that?','Choose The Emberheart of the Sands in Map → Quest List.'],
   ['What are we collecting?','The Emberheart relic. Carrying it strengthens dragon Fire by a quarter.'],
   ['We will prepare before going farther.','Do. Knowing where a reward waits does not oblige you to rush toward it.']);
  const t=lead(n,'pyramid','A relic beneath the pyramid',
   n.n==='Sahir'?'The western detour leads to a dangerous pyramid. Its Emberheart relic can strengthen dragon Fire. Would you like me to mark the expedition?':
   'My research points to the Emberheart in the Sunken Pyramid west of Sandspire. It strengthens dragon Fire, but reaching it means facing the chambers and their guardian. Shall we record the expedition?',
   ['Yes. Record the expedition for us.','The Emberheart of the Sands is now on your quest list. Follow the western desert detour when prepared, defeat the guardian, and claim the chest.'],
   ['Tell me the risks before I decide.','Hostile creatures guard the approach, and mummies remain inside. You have not accepted anything by asking.'],
   ['We have enough to handle already.','Then leave the expedition for another visit. I will not mistake a question for a promise.']);
  t.questUnlock=true;t.onReply=words=>{if(words==='Yes. Record the expedition for us.')DesertAdventure.accept(n.n==='Sahir'?'sandspire':'school');};return t;
 }
 const brambleLeads={
  "Orin": [
    "Rowan's been at the Copper Cup since the morning. That dog is usually his shadow.",
    "Then I'll take the shadow back to him.",
    "Northern end of Thornwell. Ask for the hunter if the room's busy."
  ],
  "Mella": [
    "Bramble! Rowan passed my hives without him. I assumed they'd found each other.",
    "Not yet. Where did Rowan go?",
    "The Copper Cup, up in northern Thornwell. The dog knows the smell of its kitchen."
  ],
  "Sennet": [
    "That collar belongs to Rowan's dog. I saw the hunter looking toward the door at the Copper Cup.",
    "I'd better give him a reason to stop looking.",
    "Take Bramble along. A description won't be nearly as welcome as the dog."
  ],
  "Ada": [
    "Bramble! Rowan took him out this morning. My husband is at the Copper Cup in northern Thornwell.",
    "Should I bring Bramble home to you?",
    "Take him to Rowan at the tavern first. Otherwise I'll gain a dog and lose a husband to a search party."
  ],
  "Linna": [
    "Rowan bought supplies, then went to the Copper Cup. His dog appears to have added an unplanned stop.",
    "I'll take him back before the route gets longer.",
    "You'll find the tavern in northern Thornwell. Rowan the Hunter is the name to ask for."
  ],
  "Linnet": [
    "I saw Rowan scanning the room between songs. If that is Bramble, I know what he was hoping to see.",
    "It is. I'll bring him into the tavern.",
    "Find Rowan among the Copper Cup tables. I'll keep the next tune quiet enough to hear a happy dog."
  ],
  "Garrow": [
    "Rowan went past toward the Copper Cup. Didn't have Bramble at his heels, which was odd.",
    "Bramble found me outside town.",
    "Then you've the right half of the explanation. Bring him north to the tavern."
  ],
  "Wren": [
    "Bramble's collar looks sound. Rowan must have lost sight of him somewhere.",
    "Do you know where Rowan is waiting?",
    "At the Copper Cup in northern Thornwell. Keep Bramble with you until you've reached him."
  ],
  "Berta": [
    "There's only one hunter whose dog examines my stock so carefully. Rowan is at the Copper Cup.",
    "I'll return your troublesome customer to him.",
    "He's no trouble if he keeps his nose out of the biscuits. Take him north to the tavern."
  ],
  "Merrin": [
    "Rowan asked whether I'd seen Bramble. I couldn't help then; apparently you can.",
    "I found him on the road. Where is Rowan now?",
    "The Copper Cup. Go north through town, and take this splendid muddy answer with you."
  ],
  "Asta": [
    "Those ears belong to Bramble. Rowan has been searching near the Copper Cup.",
    "I'll deliver the rest of the dog as well.",
    "He'll be glad of a complete portrait. The tavern is in northern Thornwell."
  ],
  "Colm": [
    "Bramble is Rowan's. If the hunter hasn't left the Copper Cup, you can settle this over a meal.",
    "I'll settle it before ordering anything.",
    "Wise. The dog would consider a meal an entirely separate arrangement."
  ],
  "Bren": [
    "For this question I don't need a book. Rowan is at the Copper Cup, and that is his dog.",
    "A short piece of research, then.",
    "North through town to the tavern. Take Bramble directly to the hunter."
  ],
  "Della": [
    "Rowan will be relieved. He's at the Copper Cup, trying to work out where Bramble went.",
    "Bramble didn't offer much of an account.",
    "The wagging tail is usually his entire defence. Bring him to Rowan at the northern tavern."
  ],
  "Ewan": [
    "A dog leads a traveller into town; the traveller asks a question. Fortunately I know this ending.",
    "Does it involve finding Rowan?",
    "At the Copper Cup. Northern Thornwell. A reunion, with very little need for narration."
  ],
  "Osric": [
    "You can solve this without leaving town. Rowan the Hunter is at the Copper Cup.",
    "That's a welcome change from the other directions I've had.",
    "The northern tavern. Keep Bramble beside you until Rowan sees him."
  ],
  "Alder": [
    "Bramble was nosing around the orchard earlier. Rowan had already gone on to the Copper Cup.",
    "That explains where they parted.",
    "Take him to the tavern in northern Thornwell. Rowan ought to hear the orchard part too."
  ],
  "Gwyneth": [
    "Rowan has the other end of this dog's journey. He's at the Copper Cup, north through town.",
    "I'll make sure the two ends meet.",
    "Thank you. Leave Bramble with Rowan himself, not outside the tavern door."
  ],
  "Archivist Elowen": [
    "Bramble has no business among our books, though he's welcome to the path. Rowan is at the Copper Cup.",
    "We'll try the tavern before he develops scholarly interests.",
    "West of the school, in northern Thornwell. His owner answers to Rowan the Hunter."
  ],
  "Mira": [
    "Rowan asked after his dog on my way from the Copper Cup. He was staying there to wait.",
    "Then we can save him another search.",
    "Bring Bramble to him in the tavern. I can stop worrying about the road now."
  ],
  "Oren": [
    "I know this animal. Bramble, belonging to Rowan, who is presently at the Copper Cup.",
    "That sounded almost like an entry in your notes.",
    "It was a refreshingly simple question. Take him to the northern tavern."
  ],
  "Tessa": [
    "I saw Rowan at the Copper Cup. He was listening to footsteps more than music.",
    "These paws may be the sound he wanted.",
    "Take Bramble over to him. I won't hold it against either of them if they miss a song."
  ],
  "Master Iven": [
    "Rowan the Hunter owns Bramble. You'll find him at the Copper Cup, west of the school.",
    "Thank you. We've been asking our way through town.",
    "Then this can be your last question on the subject. Bring the dog to Rowan inside."
  ],
  "Bram": [
    "Rowan is at the Copper Cup. He usually has Bramble with him; today he was asking everyone else.",
    "The dog found me. I had to find the name.",
    "You've both now. Take Bramble to the tavern in northern Thornwell."
  ],
  "Nell": [
    "I saw Rowan go into the Copper Cup. His dog wasn't following, and now I know why.",
    "Bramble had stopped to collect a traveller.",
    "You can take him back together. Rowan's the hunter waiting in the tavern."
  ],
  "Sable": [
    "Rowan asked me to send anyone who found Bramble to the Copper Cup.",
    "Then I finally have a message to deliver in person.",
    "The message is welcome to wag its tail. You'll find Rowan inside the northern tavern."
  ],
  "Pella": [
    "You won't need my globe. Bramble's owner is only at the Copper Cup.",
    "A town-sized journey suits me today.",
    "Northern Thornwell, west of the school. Ask for Rowan the Hunter."
  ],
  "Bess": [
    "That is Bramble, and Rowan is in my tavern worrying about him. Take the dog straight over.",
    "I'll keep him out of your kitchen on the way.",
    "Much appreciated. A reunion can happen without sampling every plate."
  ],
  "Ronan": [
    "Rowan's drink has been sitting untouched while he looks for that dog. He's here in the Copper Cup.",
    "I'll give him something better to do than stare at the door.",
    "Bring Bramble to the hunter. I'll see whether the drink needs replacing afterward."
  ],
  "Venn": [
    "For once I can deliver good news across a room. Rowan's here, and you've brought Bramble.",
    "Point me toward him before the news wanders away.",
    "Look for the hunter among the Copper Cup tables. He'll recognise the dog first."
  ],
  "Hobb": [
    "Rowan is right here in the tavern. That dog has made his walk longer than expected.",
    "Both of them have, from the sound of it.",
    "Bring Bramble over. They can discuss whose idea it was on the way home."
  ],
  "Edric": [
    "The hunter by the tables is Rowan. He's been watching the entrance for Bramble.",
    "I'll take him over quietly.",
    "Quietly may be beyond the dog. Happily will do."
  ],
  "Dorr": [
    "Rowan. Here in the Copper Cup. That's his dog. Please make the happy noise over there.",
    "We'll try to leave your nap intact.",
    "A considerate ambition. I wish you success with it."
  ],
  "Ser Anwen": [
    "Bramble belongs to Rowan. The hunter is here in the Copper Cup.",
    "I'll bring him over before asking anything else.",
    "Good. A worried owner should hear the answer before the rest of the room."
  ],
  "Grusk": [
    "That is Rowan's dog. Rowan's in here, though he's had no attention for our game.",
    "I expect he'll prefer this interruption.",
    "A living companion generally beats a clever hand. Take Bramble to him."
  ],
  "Fen": [
    "Rowan is at the Copper Cup. He's looked up every time somebody has come in.",
    "Bramble has come back with an escort.",
    "Then take your escort duty all the way to the hunter. I'd like to see that reunion."
  ],
  "Tobin": [
    "I've heard Rowan ask for Bramble more than once today. He's inside the northern tavern.",
    "I'll go to the Copper Cup with him.",
    "Yes. Seeing Bramble safe will be better than another hopeful answer."
  ],
  "Senn": [
    "Rowan is in the Copper Cup. If you've found his dog, you've improved the odds on his afternoon.",
    "I'll avoid wagering on the reunion.",
    "Sensible. The result ought to belong to Rowan and Bramble."
  ],
  "Dain": [
    "I'd recognise Bramble without the collar. Rowan is right here in the tavern.",
    "No need for me to buy directions, then.",
    "I wasn't going to charge. This particular kindness is entirely affordable."
  ],
  "Rusk": [
    "Rowan stopped at the Copper Cup. Bramble evidently continued until he found you.",
    "We'll finish the journey at Rowan's table.",
    "Good. Keep the dog with you; a tavern doorway is no place to leave a reunion half done."
  ],
  "Pip": [
    "Bramble's paws! I've heard Rowan calling for him. The hunter is here in the Copper Cup.",
    "You recognised him by the footsteps?",
    "And the impatient breathing. Take him over before he starts making his case aloud."
  ],
  "Vale": [
    "Rowan is at the Copper Cup. Bramble is his. A gratifyingly brief mystery.",
    "I'll let you return to your book.",
    "Thank you. Take the dog to Rowan, and we may all finish our interrupted business."
  ],
  "Cerys": [
    "Rowan has been looking for Bramble here at the Copper Cup. I finally have an answer to give him.",
    "Let me bring the answer over before you ask it questions.",
    "Fair. His owner deserves the first conversation."
  ],
  "Nyra": [
    "Bramble has appeared, and Rowan is here in the tavern. No trick required.",
    "That's the kind of disappearance I like reversed.",
    "Then take him to the hunter. I'll leave the applause to them."
  ],
  "Maren": [
    "Rowan went to the Copper Cup instead of the docks. His dog has clearly taken another route.",
    "Northern Thornwell, isn't it?",
    "Yes, the tavern west of the school. Keep Bramble following you until Rowan sees him."
  ],
  "Celia": [
    "Rowan was asking about a missing dog at the Copper Cup. Bramble matches every anxious detail.",
    "I'll bring him there before the story grows longer.",
    "A welcome ending. Find Rowan the Hunter inside the northern tavern."
  ],
  "Isolde": [
    "Rowan passed here on his way to the Copper Cup. I'd wondered why Bramble wasn't with him.",
    "We've been trying to answer the same question.",
    "Take the dog to the northern tavern. Rowan can supply his half of the account."
  ],
  "Cartwright Oswin": [
    "That dog belongs with Rowan, not under a cart. His owner's at the Copper Cup.",
    "I'll get Bramble out of your wheels and back to him.",
    "Thank you. The northern tavern, west of the school. Mind the traffic on your way."
  ],
  "Brin": [
    "Rowan is at the Copper Cup. Bramble is a much shorter expedition than the temples, fortunately.",
    "We still needed someone who knew the destination.",
    "Then consider the route confirmed. Take him west of the school to the tavern."
  ],
  "Tamsin": [
    "Bramble has found a helpful stranger. His owner, Rowan, is waiting at the Copper Cup.",
    "He did rather assume I'd help.",
    "Dogs can be persuasive without saying a word. Bring him to the northern tavern."
  ],
  "Puck": [
    "Bramble! Rowan's here in the Copper Cup. I can call him if you like.",
    "I'll bring the dog over. That ought to be loud enough.",
    "True. I won't compete with a proper reunion."
  ]
};
 function guides(n){
  const list=[],action=(title,go)=>list.push({title,category:'lead',friendship:false,go});
  if(n.n==='Demon')action(cinderSeal?(trialSealPlaced?'Choose a trial':'Where to place the seal'):'The trial seal',()=>talkTrialDemon(true));
  if(n.n==='Mosslet')action(quest>=Q.FLED?'The noise in the northern woods':'What shook the woods?',()=>talkShroomLookout(n));
  if(n.hollybeckRescue)action(HollybeckRescue.rescued()?'Preparing for the road home':'The blocked supply trail',()=>HollybeckRescue.talk(n));
  if(['Scholar Ilyan','Sahir'].includes(n.n))list.push(pyramid(n));
  if(n.n==='Odo'&&!fishingPole)action(hasDragon()?'Finding a fishing rod':'A moment by the river',()=>beginNpcTalk(n,true,true));
  if(n.n==='Calder'&&!fishingPole)action(odoRodReferral?'Odo suggested your spare rod':'Could I have a fishing rod?',()=>beginNpcTalk(n,true,true));
  if(n.n==='Nan Ferrow'){
   if(!hasDragon())action('Before I set out',()=>beginNpcTalk(n,true));
   else if(nanGiftPending())action('Preparing to leave Millwood',()=>beginNpcTalk(n,true));
   if(typeof nanCookingHere==='function'&&nanCookingHere(n))action('How is the next elixir coming?',()=>giveNanElixir(n));
  }
  if(n.n==='Hettie'&&quest<Q.NOISE)action('The eggs for Maddock',()=>beginNpcTalk(n,true));
  if(n.n==='Dunstan'){
   if(hasSword()&&(!smithUpgrade||!charm.edge))action('Help with my equipment',()=>beginNpcTalk(n,true));
   list.push(lead(n,'shield','Sela’s protective glass',glassShield?
    'You found my brother’s Glass Shield. Remember to raise its field with B during battle; it cannot help while you leave it unused.':
    'My brother Sela makes a Glass Shield in Sandspire. Find the glass shop in the northwest of town, then go through to his workshop at the back.',
    ['What makes it a shield?','Its field can turn a blow aside when you hold B. Sela can explain his own work.'],
    ['Can I head east immediately?',JOURNEY_GATES.forgewick.open()?'The road is open. Check your supplies before continuing toward Sandspire.':'Collect my equipment and the Lightning Heartstone from Forgewick Temple before the east road opens.'],
    ['I will speak to Sela.','Tell him Dunstan sent you for the shield. He will enjoy evidence that I consider glass useful.']));
  }
  if(n.n==='Sela'&&!glassShield&&dragonLearned('shield'))action('Dunstan sent me for the Glass Shield',()=>beginNpcTalk(n,true));
  if(n.n!=='Dunstan'&&n.charm&&!charm[n.charm])action('Something you wanted to give me',()=>beginNpcTalk(n,true));
  if(n.gift&&!breathHas[n.gift])action('The Heartstone in your keeping',()=>beginNpcTalk(n,true));
  if(['Mira','Toft','Dorrick'].includes(n.n))list.push(lead(n,'lantern','Light for the deep mines',charm.lamp?
   'You have the Hollybeck Lantern. Carry it into the dark galleries; it reveals what ordinary light misses and uses no charm slot.':
   'Sverre in Hollybeck keeps Torvald’s lantern. Ask him for it before exploring the deep mine galleries. Ordinary lamps will not reveal everything below.',
   ['Can I explore before finding it?','Stay in the lit galleries. Return to the deep workings with the lantern.'],
   ['What waits in the deepest chamber?','Mushroom creatures have overrun it. Clear the chamber and search it once you can see properly.'],
   ['Does it need to be equipped?','No. The Hollybeck Lantern works as a carried key item.']));
  if(n.n==='Oren')list.push(lead(n,'graveyard','The Book of the Dead',charm.wake?
   'The book you recovered unlocks Summon. It calls two wraith allies and leaves your charm slot free.':
   'The graveyard northwest of Hollybeck holds the Book of the Dead. Defeat every wave of ghosts and claim it to unlock two wraith allies through Summon.',
   ['Can one victory finish the graveyard?','No. The whole sequence of waves must be cleared.'],
   ['Is the book an equipped charm?','It is a carried key item. Summon becomes available once you have it.'],
   ['I will wait until we are prepared.','A sensible choice. You can remember the lead without treating it as today’s task.']));
  if(n.n==='Tamsin')list.push(lead(n,'witch','Meeting Maelis',
   'Maelis lives in Witchmoor, north of Dreadmarsh. Her protective ward is a practical reason to speak to her yourself.',
   ['What does the ward do?','It lessens damage from enemy attacks while equipped in your Bag.'],
   ['Does she sell anything?','Bombs. Bring coin if you want to buy them.'],
   ['Is she as frightening as people say?','I would rather you met her than inherited another person’s rumour.']));
  if(n.n==='Brin'||n.n==='Elder Maddock'&&dragonIntroDone||n.n==='Alderic')list.push(lead(n,'temples','Our route through the sanctuaries',
   'The temple near Forgewick holds Lightning, Sandspire holds Ice, and Hollybeck holds Shadow. Claim them in that order before the road through Frostcrag and Ashcrag to Cinderhold.',
   ['Does reaching a temple count?','You must clear its guardian and collect the Heartstone. The entrance is only the beginning.'],
   ['Where should we begin?','Forgewick Temple, south of Forgewick. Ask locally and check the tracked quest on your map.'],
   ['What if we already have a stone?','Continue to the next sanctuary. The quest list follows which stones you have actually claimed.']));
  if(n.n==='Astrid'||n.n==='Sverre')list.push(...HollybeckRescue.topics(n));
  if(n.n==='King Halvard'&&!n.thornwellRoyal&&MAPID==='cinderhold'&&!wonAll)action('We came to end your rule',()=>beginNpcTalk(n,true));
  if(brambleQuest===1&&brambleLeads[n.n])list.unshift({title:'Bramble’s missing owner',category:'lead',friendship:false,go:()=>{
   const [clue,reply,answer]=brambleLeads[n.n];
   playScene([n.n+': '+clue,'Corin: '+reply,n.n+': '+answer],{who:n.n,npcActor:n,after:()=>openNpcTopics(n)});
  }});
  return list;
 }
 function topics(n,{all=false}={}){
  const p=profile(n);if(!p)return null;
  const rows=p.topics.map((r,i)=>topic(n,r,i));
  // Past-tense alternatives keep changed world conditions coherent.
  if(n.n==='Bess'&&wonAll)rows[2]=topic(n,row('The unpaid royal meals','Now Halvard is gone, I want the people who supplied those meals to be paid. Relief does not settle their bills.',
   ['Where would you begin?','With the households that lost the most. Ask them what they need.'],['Will the tavern feel different?','Yes. An important guest can arrive without owning my evening.'],['I hope the next feast is your choice.','So do I. I have plans that include payment and an ordinary closing time.']),2);
  if(n.n==='Elder Maddock')rows[2].available=quest>=Q.NOISE;
  const optional=all?rows:rows.filter(r=>r.available);
  if(all)return optional;
  return [...guides(n),...(typeof Crafting!=='undefined'?Crafting.topics(n):[]),...optional];
 }
 function open(n){
  if(!profile(n))return false;
  if(n.thornwellRoyal)return openThornwellAudience(n);
  n.goto=null;n.arrived=true;n.scriptWalking=false;P.moving=false;sayOff();showFace(null);faceToward(n,P.x,P.y);
  const options=topics(n).map(t=>({n:t.title,category:t.category,friendship:!!t.lines&&t.friendship!==false,friendshipId:t.friendshipId,questUnlock:t.questUnlock,
   go:()=>t.go?t.go():EmberConversationFlow.playTopic(n,t)}));
  ask={quick:1,npcConversation:n.n,npcActor:n,repaintWorld:true,opts:[{n:n.n,head:true},...options,
   ...(n.sells?[{n:'See your stock',category:'trade',friendship:false,go:()=>openMerchantShop(n)}]:[]),{n:'Goodbye',go:null}]};
  askPick=1;askDraw();return true;
 }
 function prompt(n,{dragon:telepathy=false,talk,leave,greeted=false}={}){
  if(!profile(n))return false;
  clearPadInputs();running=false;P.act=null;P.moving=false;
  const map=MAPID;
  const invite=()=>{
   if(MAPID!==map||mode!=='play')return;
   ask={quick:1,conversationPrompt:true,npcActor:n,back:leave,opts:[{n:n.n,head:true},
    {n:'Talk',go:talk||(()=>telepathy?openDragonConversation():open(n))},
    ...(n.sells?[{n:'Purchase',go:()=>openMerchantShop(n)}]:[]),{n:'Maybe Another Time',go:leave||null}]};askPick=1;askDraw();
  };
  if(greeted){invite();return true;}
  const intro=introduction(n);playScene(intro.lines,{who:n.n,npcActor:n,telepathy,conversationGreeting:true,after:()=>{intro.done();invite();}});return true;
 }
 function service(n){
  const say=(...lines)=>lines.map(s=>s.startsWith('Corin: ')?s:n.n+': '+s);
  if(n.n==='Dunstan'&&hasSword()&&(!smithUpgrade||!charm.edge))return smithUpgrade?say(
   'Your equipment is finished. I still owe you the Whetstone charm that goes with it.','Corin: How do I use it?',
   'Equip it in your Bag. It strengthens your sword strikes. Keep practising where you put them.'):say(
   'Maddock’s blade has served a long time. I can improve it and fit you with armour for the road.',
   'Corin: I need the help. Can you do it here?','Yes. Hold still while I check the fit. This is a gift; you needn’t bargain.',
   'Corin: Thank you, Dunstan.','Finished. A stronger sword and better armour. Avoiding a blow remains your best option.');
  if(n.n==='Sela'&&!glassShield&&dragonLearned('shield'))return say('So Dunstan sent you for the Glass Shield. I shall enjoy reminding him.',
   'Corin: He said your work could protect me.','The glass raises a field that turns force aside. Hold B during battle to use it; carrying it alone does nothing.',
   'Corin: I will practise the timing.','Take it, then. I made it to protect a traveller, not decorate a shelf.');
  if(n.n==='Maelis'&&!charm.ward)return say('I have a ward you can use. Your journey sounds likely to test it.',
   'Corin: What should I do with it?','Equip the ward in your Bag to reduce harm from enemy blows. It is protection, not invulnerability.',
   'Corin: What do I owe you?','Nothing. I can give a gift without concealing a bargain in it.');
  if(n.charm==='lamp'&&!charm.lamp)return say('Torvald entrusted his Hollybeck Lantern to me. Take it into the deep mine galleries; ordinary light will not do there.',
   'Corin: Does it take a charm slot?','No. Keep it with you as a key item. Its light reveals what other lamps miss.',
   'Corin: I will take care of it.','Use it well. Torvald wanted a traveller to benefit from it.');
  const gifts={
   spore:['A Spore from the deep ring. Equip it in your Bag, and each enemy you defeat restores one of your hearts.','Then it can help me recover between attacks.','Exactly. Do not mistake recovery for permission to stand in danger.'],
   twin:['Take my Twin Heart charm. When equipped, it lets a dragon intercept a blow meant for the rider once in a fight.','That is a remarkable thing to part with.','I would rather it help someone than keep it unused. You owe me no errand.'],
   brand:['I have a Flamebrand charm for you. Equip it in your Bag to add fire to your sword strikes.','I should check my equipment before trying it.','Please do. A gift works better when its owner knows which end is dangerous.']
  };
  if(n.charm&&!charm[n.charm]&&gifts[n.charm]){const g=gifts[n.charm];return say(g[0],'Corin: '+g[1],g[2]);}
  return null;
 }
 function rod(name){return name==='Odo'?(odoRodReferral?[
  'Corin: Which camp did you mean, Odo?','Odo: The first camp on the eastern road from Millwood to Thornwell. Ask my grandson Calder for his spare rod.',
  'Corin: I know where to start now.']:[
  'Corin: Do you know where I could find a fishing rod?','Odo: Calder has a spare. He is my grandson, and he keeps the first camp on the road east to Thornwell.',
  'Corin: May I tell him you sent me?','Odo: Please do. He has kept that spare long enough; it ought to spend time beside water.']):[
  odoRodReferral?'Corin: Your grandfather Odo suggested I ask about your spare rod.':'Corin: Have you a rod I could use to begin fishing?',
  'Calder: You can have my spare. Odo gave it to me to pass along when someone needed it.',
  'Corin: Where would you start?','Calder: Try the pools below Forgefalls, southeast of Thornwell. Face the water and press A. Cast, hook the fish when the float dips, then hold to reel and release during its lunges.',
  'Corin: I will give myself time to learn.','Calder: Good. The rod has survived beginners before. Keep your own feet on safe ground.'];}
 function dossier(name){const p=cast[name];return p?{name,role:p.role,home:p.home,bio:p.role+' from '+p.home+'.',interests:p.topics.slice(0,3).map(t=>t.title.split(' / ').at(-1)).join(' · '),memory:''}:null;}
 return {cast,church,profile,introduction,context,topic,row,lead,topics,guides,open,prompt,service,rod,dossier,pyramid};
})();
