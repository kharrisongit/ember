const FROSTCRAG_BRIEFING=[
  "Aurelius: That makes three. Lightning, Ice, Shadow. There is no more temple we must visit before facing him.",
  "Corin: I liked having one more temple to visit.",
  "Aurelius: I know. We still have the mountains. Find the entrance at Frostcrag and take the passage east to Ashcrag.",
  "Corin: Then the volcanic road to Cinderhold.",
  "Aurelius: Yes. But first, food and healing supplies. Fear is difficult enough without an empty bag.",
  "Corin: Let me count what we have. My hands could use something ordinary to do.",
  "Aurelius: I shall stay here while you count."
];
/* Aurelius's optional telepathic banter never opens a blocking game dialogue. */
const dragonBanterSeen=new Set();
let dragonBanterQueue=[],dragonBanterActive=null,dragonBanterGap=0,dragonBanterPanel=null,dragonNpcCooldown=0;
let dragonBanterQuiet=0;
const DRAGON_PLACE_LINES={
  "Millwood": [
    "Which house were you born in?",
    "Ours. Nan says the whole village heard me introduce myself."
  ],
  "Thornwell": [
    "You are looking at every face.",
    "Nobody here knows me. It's a strange feeling."
  ],
  "Forgewick": [
    "Does the sound ever stop?",
    "Perhaps they take turns keeping the town awake."
  ],
  "Forgefalls": [
    "Say something. Can I hear you over the waterfall?",
    "I'm thinking it very loudly. Does that help?"
  ],
  "Sandspire": [
    "Your shadow has become rather small.",
    "It's trying to get out of the heat too."
  ],
  "Coralmere": [
    "I could follow that smell for miles.",
    "I'd rather follow someone who knows which fish stall is good."
  ],
  "Hollybeck": [
    "You can warm your hands against me.",
    "If you start purring, neither of us mentions it afterward."
  ],
  "Infernia": [
    "There is fire under this country.",
    "I'd be happier if it stayed under it."
  ],
  "Shroom Pass": [
    "Do their children hide beneath the caps?",
    "Let's ask one. You sound as though you'd like to try."
  ],
  "Frostcrag": [
    "The snow holds every footstep.",
    "I wish mine looked a little less uncertain."
  ],
  "Ashcrag": [
    "Walk where I walk. Some of this stone is loose.",
    "Your feet are wider than mine. I'll do my best."
  ],
  "Witchmoor": [
    "You are holding your breath.",
    "I can't decide whether that smell belongs in medicine or soup."
  ],
  "Dreadmarsh": [
    "That was a frog, Corin.",
    "I know. I was moving aside out of respect."
  ],
  "Sporehollow": [
    "I had not imagined a village like this.",
    "Neither had I. I'm trying not to stare into people's houses."
  ],
  "Sporewood": [
    "Close your mouth when the wind comes this way.",
    "I wasn't planning to taste the scenery."
  ],
  "Northern Woods": [
    "The trees look very tall from down here.",
    "I suppose your first view was from an egg."
  ],
  "Hollybeck Graveyard": [
    "Something heard us.",
    "Then I wish my boots were quieter."
  ],
  "Forgewick Temple": [
    "For a moment, this place felt familiar.",
    "Your memories, or someone else's?"
  ],
  "Hollybeck Temple": [
    "Your hand went straight to your sword.",
    "Yes. It can stay there until the shadows behave."
  ],
  "Sandspire Temple": [
    "The air changes beyond the entrance.",
    "Cooler. I'd enjoy that more without the guardian."
  ],
  "Cinderhold Castle": [
    "You have gone very quiet.",
    "I'm trying to leave room to hear you."
  ],
  "Cinderhold": [
    "We can still take a breath before we go on.",
    "Just one. Then stand beside me."
  ]
};
const DRAGON_POST_PLACE_LINES={
  "Millwood": [
    "Shall I wait while you decide what to tell Nan?",
    "No. You're helping with the explanation."
  ],
  "Thornwell": [
    "You aren't counting the guards today.",
    "I hadn't noticed I'd stopped."
  ],
  "Forgewick": [
    "What will they make when fewer people need swords?",
    "Hinges. Cooking pots. I'd like to ask."
  ],
  "Forgefalls": [
    "This was a miserable place to wait for you.",
    "It's a lovely place to stop together."
  ],
  "Sandspire": [
    "We could stay until the heat eases.",
    "Listen to us, making plans around the weather."
  ],
  "Coralmere": [
    "Would you take a boat simply to see the other shore?",
    "If you'd agree not to criticise it for being slow."
  ],
  "Hollybeck": [
    "They still need firewood.",
    "Then we can help with something smaller than a kingdom."
  ],
  "Infernia": [
    "The earth hasn't cooled on our account.",
    "It would have been a nice gesture."
  ],
  "Shroom Pass": [
    "We have time to visit now.",
    "And nobody gets to call it a detour."
  ],
  "Frostcrag": [
    "You are walking more slowly.",
    "I can finally spare a glance for the mountains."
  ],
  "Ashcrag": [
    "This road remembers nothing of us.",
    "My knees remember plenty of it."
  ],
  "Witchmoor": [
    "Will you ask Maelis how she has been?",
    "Yes. A conversation that doesn't begin with needing something."
  ],
  "Dreadmarsh": [
    "You still dislike the mud.",
    "Victory hasn't improved my boots."
  ],
  "Sporehollow": [
    "Do you think they will mind another visit?",
    "We can knock and find out."
  ],
  "Sporewood": [
    "There is room for a quiet life here.",
    "A damp one. But yes."
  ],
  "Northern Woods": [
    "You keep looking at the place where we began.",
    "I was only meant to carry eggs that day."
  ],
  "Hollybeck Graveyard": [
    "Some places will need watching for a long time.",
    "We haven't forgotten them."
  ],
  "Forgewick Temple": [
    "I wonder how long the doors stood without a rider.",
    "Perhaps somebody can come to study them now."
  ],
  "Hollybeck Temple": [
    "Would you have come back without me?",
    "No. I wouldn't have come the first time without you."
  ],
  "Sandspire Temple": [
    "You are checking your pockets.",
    "Habit. I don't want to leave anything precious behind."
  ],
  "Cinderhold Castle": [
    "Does it feel smaller?",
    "It feels like a building. That will do."
  ],
  "Cinderhold": [
    "We needn't stay to prove anything.",
    "Then let's go somewhere with a window that opens."
  ]
};
const DRAGON_ENEMY_LINES={
  "skeleton": [
    "The bones are holding a weapon.",
    "I was hoping they'd have enough to do holding together."
  ],
  "skeleton1": [
    "There. Between the trees.",
    "Seen it. I won't let it get behind us."
  ],
  "skeleton3": [
    "That one is still coming.",
    "Then we keep moving too."
  ],
  "wraith": [
    "I dislike the way it slips out of sight.",
    "Tell me where you see it next."
  ],
  "mage1": [
    "The caster has room to aim.",
    "I'll make that less comfortable."
  ],
  "mage2": [
    "Watch the spell, not the robe.",
    "A shame. The robe is much easier to dislike."
  ],
  "devil1": [
    "It wants us to retreat into the others.",
    "We're going round, then."
  ],
  "devil3": [
    "Mind the space beside it.",
    "I would mind several more feet of space, happily."
  ],
  "boneguard": [
    "It has planted its feet.",
    "Then I won't plant mine."
  ],
  "ent": [
    "That tree has decided to object.",
    "I could have accepted a strongly worded rustle."
  ],
  "ent1": [
    "The roots move with it.",
    "I'll watch where I land."
  ],
  "ent2": [
    "Do not stand beneath the swing.",
    "I have no wish to become part of the soil."
  ],
  "eye2": [
    "It is following your movement.",
    "There's plenty more movement where that came from."
  ],
  "eyePurple": [
    "Now would be a good time to step aside.",
    "Already stepping."
  ],
  "eyeRed": [
    "I think we have its attention.",
    "I'd like to return it."
  ],
  "ghost": [
    "Cold, to your left.",
    "Thank you. Keep telling me."
  ],
  "ghost3": [
    "It has noticed the sword.",
    "Let's hope that's discouraging."
  ],
  "gnoll1": [
    "You are too close to the edge.",
    "Moving in. I see a way through."
  ],
  "gnoll2": [
    "It is waiting for you to overreach.",
    "It may have a longer wait than it expected."
  ],
  "gnoll3": [
    "We need to separate them.",
    "I'll draw this one away."
  ],
  "plant1": [
    "Those leaves have teeth behind them.",
    "Nan never warned me about that sort of weeding."
  ],
  "plant2": [
    "There is movement at your feet.",
    "My least favourite height for surprises."
  ],
  "plant3": [
    "It is reaching again.",
    "Then it can reach into empty air."
  ],
  "reptile": [
    "Its weight has shifted forward.",
    "I'll let it go past."
  ],
  "reptile2": [
    "Careful. It has turned toward you.",
    "I haven't stopped watching."
  ],
  "reptile3": [
    "Keep away from the wall.",
    "Yes. I'd like another direction to choose."
  ],
  "shroomBrown": [
    "This one will not talk to us.",
    "I gathered that from its manners."
  ],
  "shroomPurple": [
    "Don't breathe the cloud.",
    "An excellent argument for leaving it behind."
  ],
  "shroomRed": [
    "It has cut across our path.",
    "Then we'll make another path."
  ],
  "royalguard": [
    "His sword is coming up.",
    "I wish he'd given us a moment to speak."
  ]
};
const DRAGON_BOSS_LINES={
  "ghost": [
    "Stay with me. We can follow its movement together.",
    "I'm here. Which way first?"
  ],
  "ghost3": [
    "The room gives us space. Use the corners carefully.",
    "And don't get trapped in one. Understood."
  ],
  "golem1": [
    "Wait until its weight has committed.",
    "Then move in. I can do that."
  ],
  "golem2": [
    "Listen for the strike behind you before turning.",
    "I'd rather listen than feel it."
  ],
  "golem3": [
    "It is larger than the last thing we fought.",
    "You could have kept that observation to yourself."
  ],
  "golem4": [
    "Steady. It cannot occupy the whole room.",
    "It seems willing to try."
  ],
  "devil": [
    "Keep your next step in mind.",
    "Preferably somewhere less hot."
  ],
  "lich": [
    "He is trying to make you watch everything at once.",
    "I'll watch him. Help me with the rest."
  ],
  "knight": [
    "Your hand is shaking.",
    "It can shake and hold a sword."
  ],
  "treasuryknight": [
    "He means to keep us from that chest.",
    "Then let's give him something else to think about."
  ],
  "kdragon": [
    "I am with you, Corin. Whatever he does.",
    "I know. I won't let go of that."
  ]
};
const DRAGON_BOSS_DEFEAT_LINES={
  "ghost": [
    "Corin, lower your shoulders.",
    "Had I put them up that far?"
  ],
  "ghost3": [
    "We have a moment to ourselves.",
    "I'd like two, if nothing objects."
  ],
  "golem1": [
    "The chest is still waiting.",
    "Good. It can wait while I get my breath."
  ],
  "golem2": [
    "Look there. We can reach the reward now.",
    "I nearly forgot the chest. Nearly."
  ],
  "golem3": [
    "We should collect what the guardian kept.",
    "Remind me to use my hand gently on the lid."
  ],
  "golem4": [
    "You can loosen your grip.",
    "Tell my fingers. They seem to have made a decision."
  ],
  "devil": [
    "The fighting has stopped.",
    "My heart could do with hearing that."
  ],
  "lich": [
    "His hold on this place has broken.",
    "Let's collect what we came for and leave him to it."
  ],
  "knight": [
    "He cannot fight us any longer.",
    "Then he doesn't have to."
  ],
  "treasuryknight": [
    "We have earned a look inside.",
    "If it's another knight, I'm closing the lid."
  ],
  "kdragon": [
    "Listen to my voice. I haven't left you.",
    "Don't stop. Not quite yet."
  ]
};
const DRAGON_NPC_THOUGHTS={
  "Odo": [
    "Does he always make you wait for an answer?",
    "Since I was small. I used to think fish could hear questions."
  ],
  "Hettie": [
    "You stood straighter when she spoke.",
    "Old habit. She can find a chore for a crooked back."
  ],
  "Nan": [
    "She tucked that loose bit of cloth into your collar.",
    "She'll still do it when I'm older than Maddock."
  ],
  "Maddock": [
    "You waited for him to finish even when he hesitated.",
    "He used to wait for me when I stumbled over reading."
  ],
  "Sela": [
    "I liked the care he took with his words.",
    "The same care as with the glass, I think."
  ],
  "Dunstan": [
    "His hands hardly stop working when he talks.",
    "I wonder whether sitting still makes him uncomfortable."
  ],
  "Toft": [
    "He looked at our boots.",
    "A miner has good reason to notice where people stand."
  ],
  "Maelis": [
    "You found it easier once you started speaking.",
    "Yes. I was making a much worse conversation in my head."
  ],
  "Wren": [
    "She does not seem afraid of other people's pain.",
    "Perhaps she is. She still helps."
  ],
  "Rowan": [
    "He keeps an ear turned toward Bramble.",
    "I suspect the dog considers that a basic duty."
  ],
  "Iven": [
    "He wanted to know what you thought.",
    "I wasn't expecting to be asked. I liked it."
  ],
  "Elowen": [
    "Would you enjoy working among those books?",
    "Until somebody asked me to put the one I was reading away."
  ],
  "Idris": [
    "There is pleasure in knowing how to mend something.",
    "I can manage a button. On a patient shirt."
  ],
  "Linna": [
    "She made sure you understood the price.",
    "I'd rather that than discover it while counting my coins."
  ],
  "Orin": [
    "You wanted to sit and talk to Orin a little longer.",
    "He makes a bench sound like an excellent use of an afternoon."
  ],
  "Gwil": [
    "He seems pleased to have someone to talk to.",
    "So am I. The road can get quiet even with us both on it."
  ],
  "Halvard": [
    "He watched what you did with your hands.",
    "Then I hope he enjoyed the effort of keeping them still."
  ]
};
const DRAGON_REACTION_LINES={
  "freedom": [
    "Somebody can disagree out loud now.",
    "I hope the first argument is over something wonderfully dull."
  ],
  "rebuilding": [
    "They are already thinking about what comes next.",
    "Good. I want there to be a next."
  ],
  "fishing": [
    "We could try the water when there is time.",
    "You mean when there is room in your stomach."
  ],
  "shield": [
    "Will you practise with the Glass Shield?",
    "Until raising it feels less like remembering a lesson."
  ],
  "bond": [
    "It is odd hearing other people describe us.",
    "They should try sharing a headache before they write a ballad."
  ],
  "reunion": [
    "That dog has a very effective way of thanking people.",
    "Yes. I'll dry my face in a moment."
  ],
  "missing": [
    "Someone is waiting for an answer.",
    "Then we should be careful about the answer we bring."
  ],
  "king": [
    "They lowered their voice.",
    "I hate how normal that has become."
  ],
  "memory": [
    "I have never heard that part told before.",
    "Then it was a good thing we asked."
  ],
  "food": [
    "Could we stop for something to eat soon?",
    "There it is. I wondered how long you'd manage."
  ],
  "depths": [
    "We need Torvald's lantern before going farther into the mine.",
    "I'll check the bag while there's light enough to see it."
  ],
  "home": [
    "They spoke differently when they mentioned home.",
    "You probably hear me do that too."
  ]
};
function dragonStoryStage(){return wonAll?'victory':'journey';}
function dragonLearned(key){
  if(key==='king-plan')return dragonBanterSeen.has('learned:king-plan')||quest>=Q.DONE;
  // Old saves that already heard the introduction receive the same plan.
  if(key==='heartstone-plan'||key.startsWith('temple:'))return dragonIntroDone||dragonBanterSeen.has('learned:heartstone-plan');
  return dragonBanterSeen.has('learned:'+key);
}
function learnHeartstonePlan(){
  heartKnown=true;dragonBanterSeen.add('learned:heartstone-plan');
  for(const town of ['Forgewick','Sandspire','Hollybeck'])dragonBanterSeen.add('learned:temple:'+town);
}
// The first conversation introduces the Heartstones as one plan. Optional
// suggestions and other NPCs cannot discover them ahead of Aurelius.
function rememberDragonKnowledge(who,text,persist=true){
  if(!text||who==='Aurelius')return;
  const before=dragonBanterSeen.size,words=String(text);
  const learn=key=>dragonBanterSeen.add('learned:'+key);
  if(who==='Alderic')learn('alderic');
  if(/Maddock/.test(who)&&/overthrow|end.{0,12}rule/i.test(words))learn('king-plan');
  if(/\bBramble\b/i.test(words))learn('bramble');
  if(/demon|trials/i.test(words)&&/Maelis|Witchmoor/.test(who+' '+words))learn('trials');
  if(/\bRowan\b/i.test(words)&&/tavern|Copper Cup/i.test(words))learn('bramble-owner');
  if(/fishing|\brod\b|\bpole\b/i.test(words)&&/Odo|Calder/i.test(who+' '+words))learn('fishing');
  if(/Dunstan/i.test(who+' '+words)&&/blade|armour|armor|blacksmith|sword|smith/i.test(words))learn('smith');
  // Mentioning Sela's trade is family conversation, not the shield referral.
  if(who==='Dunstan'&&/Sela/i.test(words)&&/shield/i.test(words))learn('shield');
  if(who&&who!=='Corin'&&/charm|amulet|ward|lantern/i.test(words)){
    learn('gift:'+who);
    for(const map of Object.values(W.maps))for(const n of map.npcs||[])
      if(n.charm&&words.toLowerCase().includes(n.n.toLowerCase()))learn('gift:'+n.n);
  }
  if(/Torvald|Hollybeck Lantern/i.test(words)&&/lantern|light/i.test(words))learn('lantern');
  if(/\bmines?\b|deep galleries/i.test(words))learn('mines');
  if(/graveyard|Book of the Dead/i.test(words)&&/ghost|wraith|summon/i.test(words))learn('graveyard');
  if(persist&&before!==dragonBanterSeen.size)persistDragonBanterSeen();
}
function dragonGiftLeads(){
  const seen=new Set();
  return Object.values(W.maps).flatMap(map=>(map.npcs||[]).map(n=>({n,map})))
    .filter(({n})=>{
      if(!n.charm||n.charm==='edge'||charm[n.charm]||seen.has(n.charm)||!dragonLearned('gift:'+n.n))return false;
      seen.add(n.charm);return true;
    });
}
function dragonSideQuestTopics(){
  return [
    {id:'fishing',name:fishingPole?'Fishing with Calder’s rod':'Odo and Calder’s spare rod',known:fishingPole||(typeof odoRodReferral!=='undefined'&&odoRodReferral)||dragonLearned('fishing')},
    {id:'bramble',name:brambleQuest>=2?'Visit Rowan and Bramble':dragonLearned('bramble')?'Help Bramble find his person':'Help our new dog find his person',known:brambleQuest>0||dragonLearned('bramble')},
    {id:'equipment',name:'Our weapons and protection',known:smithUpgrade||glassShield||dragonLearned('smith')||dragonLearned('shield')},
    {id:'lantern',name:'Torvald’s lantern for the mines',known:charm.lamp||dragonLearned('lantern')},
    {id:'graveyard',name:'The Book of the Dead and summoning',known:charm.wake||dragonLearned('graveyard')},
    {id:'gifts',name:'Charms and other gifts',known:Object.entries(charm).some(([key,value])=>key!=='edge'&&value)||dragonGiftLeads().length>0}
  ].filter(topic=>topic.known);
}
function dragonLineKey(line){return 'line:'+line.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
function persistDragonBanterSeen(){
  // Remember only dialogue history; never move the player's saved position.
  try{
    const key=saveKey(activeSaveSlot),saved=JSON.parse(localStorage.getItem(key)||'null');
    if(!saved?.dragonIntroDone)return;
    saved.dragonBanterSeen=[...dragonBanterSeen];
    localStorage.setItem(key,JSON.stringify(saved));
    window.EmberCloudState?.saved(activeSaveSlot);
  }catch(e){}
}
function dragonConversationReaction(n){
  if(MAPID!=='world'||!dragonIntroDone||!n?.n||n.n.includes(DRAGON_NAME))return;
  const spoken=(n.said||n.d||[]).join(' ').toLowerCase();
  if(!spoken)return;
  const heard='heard:'+n.n+':'+dragonLineKey(spoken);
  if(dragonBanterSeen.has(heard))return;
  dragonBanterSeen.add(heard);persistDragonBanterSeen();
  const stage=dragonStoryStage(),personKey='npc-comment:'+n.n+':'+stage;
  if(dragonNpcCooldown>0||dragonBanterActive||dragonBanterQueue.length||dragonBanterSeen.has(personKey))return;
  let topic='person',lines;
  if(stage==='victory'&&/king|halvard|crown|free|celebrat|levy|patrol|rebuild/.test(spoken))topic=/rebuild/.test(spoken)?'rebuilding':'freedom';
  else if(/fishing pole|green arc|catch a fish/.test(spoken))topic='fishing';
  else if(/glass shield|force field/.test(spoken))topic='shield';
  else if(/heartstone|bond|rider/.test(spoken))topic='bond';
  else if(/bramble|dog/.test(spoken)&&brambleQuest>=2)topic='reunion';
  else if(/missing|lost|bramble|dog/.test(spoken))topic='missing';
  else if(/king|halvard|levy|royal|soldier|crown/.test(spoken))topic='king';
  else if(/temple|ruin|dragon|history|book/.test(spoken))topic='memory';
  else{
    const person=Object.keys(DRAGON_NPC_THOUGHTS).find(k=>n.n.includes(k));
    if(person)lines=DRAGON_NPC_THOUGHTS[person];
    else if(/food|soup|bread|meal|hungry/.test(spoken))topic='food';
    else if(/mine|dark|lamp|stone/.test(spoken))topic='depths';
    else if(/home|family|child|mother|father/.test(spoken))topic='home';
    else return;
  }
  const sharedKey='reaction:'+stage+':'+topic;
  if(topic!=='person'&&dragonBanterSeen.has(sharedKey))return;
  if(queueDragonBanter('npc:'+n.n+':'+stage+':'+topic,lines||DRAGON_REACTION_LINES[topic])){
    dragonBanterSeen.add(personKey);
    if(topic!=='person')dragonBanterSeen.add(sharedKey);
    dragonNpcCooldown=90;persistDragonBanterSeen();
  }
}
function queueDragonBanter(key,lines){
  if(!dragonIntroDone||!lines||dragonBanterSeen.has(key)||dragonBanterActive?.key===key||dragonBanterQueue.some(b=>b.key===key)||dragonBanterQueue.length>=3)return false;
  const lineKeys=lines.map(dragonLineKey);
  if(lineKeys.some(k=>dragonBanterSeen.has(k)||dragonBanterQueue.some(b=>b.lines.some(line=>dragonLineKey(line)===k))))return false;
  dragonBanterQueue.push({key,lines,map:MAPID,stage:dragonStoryStage()});return true;
}
function dragonBossBanter(f,defeated=false){
  if(!f||f.ally||f.huntingArena)return;
  if(defeated){
    const facing='boss:'+f.kind;
    dragonBanterQueue=dragonBanterQueue.filter(b=>b.key!==facing);
    if(dragonBanterActive?.key===facing)dismissDragonBanter();
  }
  queueDragonBanter((defeated?'victory:':'boss:')+f.kind,(defeated?DRAGON_BOSS_DEFEAT_LINES:DRAGON_BOSS_LINES)[f.kind]);
}
function dismissDragonBanter(){
  if(!dragonBanterActive)return false;
  dragonBanterActive=null;dragonBanterGap=18;
  if(dragonBanterPanel)dragonBanterPanel.hidden=true;
  return true;
}
function quietDragonBanter(){
  dragonBanterQuiet=10;
  dismissDragonBanter();
}
function resetDragonBanter(seen=[]){
  dragonBanterSeen.clear();
  for(const key of seen)if(typeof key==='string'){
    dragonBanterSeen.add(key.replace(':sealed',':victory'));
    const heard=key.match(/^heard:([^:]+):line:(.*)$/);
    if(heard)rememberDragonKnowledge(heard[1],heard[2],false);
    // Upgrade history from the original per-NPC/per-boss IDs.
    const npc=key.match(/^npc:(.*):(journey|victory|sealed):([^:]+)$/);
    if(npc){
      const stage=npc[2]==='sealed'?'victory':npc[2];
      dragonBanterSeen.add('npc-comment:'+npc[1]+':'+stage);
      if(npc[3]!=='person')dragonBanterSeen.add('reaction:'+stage+':'+npc[3]);
    }
    const boss=key.match(/^(boss|victory):[^:]+:([^:]+):[^:]+$/);
    if(boss)dragonBanterSeen.add(boss[1]+':'+boss[2]);
  }
  dragonBanterQueue=[];dismissDragonBanter();dragonBanterGap=0;dragonBanterQuiet=0;
  dragonNpcCooldown=seen.some(key=>typeof key==='string'&&key.startsWith('npc:'))?90:0;
}
const DRAGON_DOOR_EXCHANGES=[
  [
    "Try not to frighten anyone while I am in there.",
    "I shall look thoughtfully at something else."
  ],
  [
    "You can hear me if I need you?",
    "Even through an exceptionally ordinary wall."
  ],
  [
    "There is barely room for my shoulders in that doorway.",
    "A flaw in human architecture. I shall wait."
  ],
  [
    "A short visit, I think.",
    "You thought that about the last one. Take your time."
  ],
  [
    "Save me a patch of sun.",
    "I make no promises if the sun moves."
  ],
  [
    "I hope I remember what I came to ask.",
    "Begin with hello. The rest may follow."
  ],
  [
    "Stay here a moment.",
    "That is generally what a closed door asks of me."
  ],
  [
    "I'll see whether they have food.",
    "A fine opening to any visit."
  ],
  [
    "Don't let me leave the bag behind when I come out.",
    "I will mention it before you accuse the door."
  ],
  [
    "I don't like leaving you out here.",
    "I am quite capable of enjoying a little fresh air."
  ],
  [
    "Would you like me to describe the inside?",
    "Only if it contains something better than chairs."
  ],
  [
    "Right. Wish me luck.",
    "For a conversation? All the luck you require."
  ]
];
function dragonDoorExchange(){
  if(!dragonIntroDone||dragonBanterQuiet||sceneHold()||dragonCombatActive())return;
  const index=DRAGON_DOOR_EXCHANGES.findIndex((_,i)=>!dragonBanterSeen.has('renewal:door:'+i));
  if(index<0)return;
  dismissDragonBanter();dragonBanterSeen.add('renewal:door:'+index);persistDragonBanterSeen();
  dragonBanterActive={key:'doorway',lines:DRAGON_DOOR_EXCHANGES[index],speakers:['Corin',DRAGON_NAME],time:7,handoff:true};
  paintDragonBanter();
}

function setDialogueTone(telepathy){
  for(const el of [sayEl,nameEl,faceEl])el.dataset.telepathy=telepathy?'true':'false';
}
function paintDragonBanter(){
  if(!dragonBanterActive)return;
  if(!dragonBanterPanel){
    dragonBanterPanel=document.createElement('div');dragonBanterPanel.id='dragonBanter';
    dragonBanterPanel.setAttribute('role','status');dragonBanterPanel.setAttribute('aria-live','polite');
    const portrait=document.createElement('span');portrait.className='telepathyPortrait';
    portrait.setAttribute('aria-hidden','true');
    const words=document.createElement('span');words.className='telepathyWords';
    dragonBanterPanel.appendChild(portrait);dragonBanterPanel.appendChild(words);
    dragonBanterPanel.portraitEl=portrait;dragonBanterPanel.wordsEl=words;
    document.getElementById('stage').appendChild(dragonBanterPanel);
  }
  const reply=dragonBanterActive.time<=(dragonBanterActive.handoff?4:5),index=reply?1:0;
  const speaker=(dragonBanterActive.speakers||[DRAGON_NAME,'Corin'])[index];
  const text=dragonBanterActive.lines[index];
  dragonBanterPanel.setAttribute('aria-label',speaker+': '+text);
  dragonBanterPanel.wordsEl.textContent=text;
  if(dragonBanterPanel.speaker!==speaker){
    dragonBanterPanel.speaker=speaker;
    if(typeof paintSmallPortrait==='function')paintSmallPortrait(dragonBanterPanel.portraitEl,speaker);
  }
  dragonBanterPanel.hidden=false;
}
function stepDragonBanter(dt){
  if(typeof thornwellDragonHidden==="function"&&thornwellDragonHidden()){quietDragonBanter();return;}
  dragonNpcCooldown=Math.max(0,dragonNpcCooldown-dt);
  const interrupted=sceneHold()||!!sayNpc||dragonCombatActive();
  if(interrupted){
    quietDragonBanter();
    return;
  }
  dragonBanterQuiet=Math.max(0,dragonBanterQuiet-dt);
  if(dragonBanterQuiet){
    if(dragonBanterPanel)dragonBanterPanel.hidden=true;
    return;
  }
  if(dragonBanterActive?.handoff){
    const hidden=mode!=='play'||sceneHold()||sayNpc||ovl||ask||bagOpen||atlasOpen||editing||deadShown;
    dragonBanterActive.time-=dt;
    if(dragonBanterActive.time<=0)dismissDragonBanter();
    else {paintDragonBanter();dragonBanterPanel.hidden=!!hidden;}
    return;
  }
  const paused=!!(!dragonIntroDone||!hasDragon()||!dragonHere()||fishing||mode!=='play'||sceneHold()||sayNpc||ovl||ask||bagOpen||atlasOpen||editing||fadeDir||doorMotion||deadShown);
  if(dragonBanterPanel)dragonBanterPanel.hidden=paused||!dragonBanterActive;
  if(dragonBanterActive&&(dragonBanterActive.map!==MAPID||dragonBanterActive.stage!==dragonStoryStage()))dismissDragonBanter();
  dragonBanterQueue=dragonBanterQueue.filter(b=>b.map===MAPID&&b.stage===dragonStoryStage());
  if(paused)return;
  if(typeof FrostcragJourney!=='undefined'&&FrostcragJourney.step())return;
  rememberDragonConversationPlace();
  const place=MAPID==='world'?areaUnder(P.x,P.y):(MD.title||MAPID);
  const title=MAPID==='world'?(DRAGON_PLACE_LINES[place]?place:null):Object.keys(DRAGON_PLACE_LINES).sort((a,b)=>b.length-a.length).find(k=>place?.includes(k));
  if(title)queueDragonBanter('place:'+title+':'+dragonStoryStage(),(wonAll?DRAGON_POST_PLACE_LINES:DRAGON_PLACE_LINES)[title]);
  for(const f of foes){
    if(f.ally||f.huntingArena||f.st==='dead'||f.hp<=0||Math.hypot(f.x-P.x,f.y-P.y)>180)continue;
    if(DRAGON_BOSS_LINES[f.kind])dragonBossBanter(f);
    else queueDragonBanter('enemy:'+f.kind,DRAGON_ENEMY_LINES[f.kind]);
  }
  if(wonAll)queueDragonBanter('story:halvard-fallen',['We can decide where to go tomorrow.','I keep forgetting we no longer have to ask how it helps us fight him.']);
  if(cinderSeal)queueDragonBanter('story:seal',['That seal is an invitation, not an obligation.','We’ll choose the trial when we’re ready for it.']);
  if(dragonBanterActive){
    dragonBanterActive.time-=dt;
    if(dragonBanterActive.time<=0)dismissDragonBanter();else paintDragonBanter();
    return;
  }
  dragonBanterGap=Math.max(0,dragonBanterGap-dt);
  if(dragonBanterGap||!dragonBanterQueue.length)return;
  const next=dragonBanterQueue.shift();
  if(next.lines.some(line=>dragonBanterSeen.has(dragonLineKey(line))))return;
  dragonBanterActive={...next,time:10};
  dragonBanterSeen.add(next.key);
  for(const line of next.lines)dragonBanterSeen.add(dragonLineKey(line));
  persistDragonBanterSeen();paintDragonBanter();
}

// Deliberate conversations use the game's regular topic menu and dialogue controls.
// Their answers are built when selected, so saved quest progress stays authoritative.
const DRAGON_LONG_TALKS={
  consciousness:[
    'Corin: When you say dragons share a consciousness, is somebody else thinking for you?',
    'Aurelius: No. Imagine waking in a library where you understand the language of every book. The reading is yours. So are the questions.',
    'Corin: And every dragon leaves a book there?',
    'Aurelius: Impressions, knowledge, memories. Not tidy books with dates on their spines. Some things arrive as feelings before I understand their words.',
    'Corin: That sounds rather inconvenient.',
    'Aurelius: It is how I knew what rain was before a drop touched me. Knowing did not tell me how this rain would feel on my own scales.',
    'Corin: So there are still first times for you.',
    'Aurelius: Every day. An inherited memory cannot walk this road for me. It certainly cannot tell me what you will say next.',
    'Corin: I was going to ask whether you are hungry.',
    'Aurelius: Some mysteries are easier than others.'
  ],
  choosing:[
    'Corin: Maddock said dragons chose their riders. Why did you choose me?',
    'Aurelius: You found something you did not understand, and carried it to someone who might help. You did not break it open to see whether it was valuable.',
    'Corin: I thought I had found a strange stone. Maddock knew more about it than I did.',
    'Aurelius: You were curious without deciding that being able to break something gave you a reason to do it. I wanted to know you.',
    'Corin: Before this began, I was a miller’s son who had never led anyone anywhere.',
    'Aurelius: A rider is a companion, Corin. Not a person made taller by sitting above another living thing.',
    'Corin: And if I make the wrong choice?',
    'Aurelius: I will tell you. You may do the same for me. A bond without disagreement would be a very lonely kind of obedience.',
    'Corin: You have made an unusually complicated choice of rider.',
    'Aurelius: I have made an interesting one.'
  ],
  heartstones:()=>[
    'Corin: Tell me about the stone from your shell.',
    'Aurelius: A heartstone joins a rider’s intent to a dragon’s power. You carry it; I answer. It is a connection, not a leash.',
    'Corin: Then gathering them makes us stronger together?',
    'Aurelius: Yes. Fire was with us at the beginning. Lightning, shadow and ice each open another way to meet what lies ahead.',
    dragonLearned('alderic')?'Corin: Alderic said the stones came from the first dragon.':'Corin: Do your memories tell you where the Heartstones came from?',
    'Aurelius: Our shared memory speaks of the first dragon. Its ancient power was divided into stones a rider could carry. The temple keepers have guarded that knowledge too.',
    'Corin: Could I order you to use them?',
    'Aurelius: You can ask. You should also listen. Power that cannot hear an answer becomes the sort of power we should never accept.',
    'Corin: I would rather have you than a collection of weapons.',
    'Aurelius: Good. Weapons make poor conversation.'
  ],
  wingfall:()=>[
    'Corin: What was Wingfall?',
    'Aurelius: Before it, seven Dragonriders kept the peace in Emberfell. Halvard was one of them. Fifty years ago, he turned on the other six and took the throne.',
    'Corin: One of their own. They must have trusted him.',
    'Aurelius: Betrayal needs something to break. Trust was not their foolishness; breaking it was his choice.',
    'Corin: Why do people tell different stories about it?',
    'Aurelius: A ruler can punish a witness and pay a writer. Over time, a frightened silence can look like agreement.',
    'Corin: But some of the old accounts survived.',
    'Aurelius: Thornwell’s school keeps histories. Ask questions there. Compare what people preserved with what they were ordered to repeat.',
    wonAll?'Corin: Now his rule has ended. We can make the truth easier to tell.':'Corin: He cannot have every copy, every song, every memory.',
    wonAll?'Aurelius: Yes. Keep the accounts available, including the ones that ask difficult questions about us.':'Aurelius: No. And we should protect those things as carefully as we protect each other.'
  ],
  land:()=>[
    'Corin: What does your memory tell you about Emberfell?',
    'Aurelius: That a land is more than the borders a ruler draws. Millwood’s fields, Forgewick’s furnaces, the coast at Coralmere: each depends on people beyond its own horizon.',
    'Corin: It does not always feel that way on the roads.',
    'Aurelius: Fear narrows the world. A family begins by guarding its door, and ends by wondering whether every stranger is an enemy.',
    'Corin: There are places that seem older than all of this.',
    'Aurelius: The rider temples near Forgewick, Sandspire and Hollybeck stood before Wingfall. The kingdom’s troubles are a chapter in their story, not its beginning.',
    'Corin: And Sporehollow?',
    'Aurelius: A reminder that your way of living is not the only one. Approach another people’s home with curiosity before certainty.',
    wonAll?'Corin: Perhaps the roads can start connecting people again.':'Corin: I would like people to travel because they want to, rather than because they have to flee.',
    'Aurelius: Then that is a worthy future to work toward.'
  ],
  halvard:()=>wonAll?[
    'Corin: I keep expecting to hear that Halvard has sent someone after us.',
    'Aurelius: Your body learned to listen for danger. It may take longer than a battle to learn the silence that follows.',
    'Corin: People call us heroes. I mostly remember being frightened.',
    'Aurelius: Courage did not require you to enjoy any of it.',
    'Corin: What do we owe them now?',
    'Aurelius: The truth. Help where we can give it. And the humility to let them decide what their lives should become.',
    'Corin: No throne for a miller’s son?',
    'Aurelius: You already complain about sitting still. Let us begin by visiting the people who helped us.'
  ]:[
    'Corin: Why would Halvard fear a young dragon like you?',
    'Aurelius: Because I chose someone without asking his permission. A bond freely given is a thing he cannot manufacture by decree.',
    'Corin: Maddock thinks he will take you, or kill us both.',
    'Aurelius: Then we must prepare. Being right will not turn aside a blade. Friends, equipment and the heartstones can help us reach him alive.',
    'Corin: Do you hate him?',
    'Aurelius: I oppose what he does. I do not need hatred to know that people should be safe from him.',
    'Corin: I do not want to become someone who solves everything with a sword.',
    'Aurelius: Keep that concern with you. Having strength does not make force the right answer to every problem.'
  ],
  travelling:[
    'Corin: Run me through travelling together again.',
    'Aurelius: Open COMMAND and choose Mount to climb onto my back. Choose Dismount there when you want your own feet on the ground.',
    'Corin: And flying?',
    'Aurelius: COMMAND also has Take off and Land. Use your movement controls to guide us. We should come down when you need to speak to people or examine something closely.',
    'Corin: What does it feel like, flying with someone on your back?',
    'Aurelius: At the moment, rather like carrying someone who expects to fall off.',
    'Corin: I am working on that.',
    'Aurelius: I know. We can stay low until you feel steadier.'
  ],
  battle:[
    'Corin: How do we fight as partners?',
    'Aurelius: Watch what the enemy is preparing. Its windup tells you more than its noise. Keep room to move, and ask for an attack when it can matter.',
    'Corin: You cannot breathe fire constantly.',
    'Aurelius: No. Each breath needs time to recover; the attack menu shows when it is ready. Slash gives us another way to strike nearby.',
    'Corin: And the heartstones give us more choices.',
    'Aurelius: More choices, not a reason to stop thinking. A powerful attack aimed at empty ground is merely an impressive mistake.',
    'Corin: I feel that last remark was directed at me.',
    'Aurelius: It was directed at empty ground. You happened to be standing beside it.'
  ],
  care:()=>[
    'Corin: What should I do when you are hurt?',
    'Aurelius: Give me food before we face the next danger. Meat and fish help me recover. Open ITEMS to feed me what you are carrying.',
    'Corin: And if you cannot get up?',
    'Aurelius: Come close and press A with meat or fish in your supplies. I will need your help then.',
    fishingPole?'Corin: The fishing rod Calder gave us should keep us supplied.':(typeof odoRodReferral!=='undefined'&&odoRodReferral)?'Corin: We should ask Calder for the spare rod Odo mentioned.':'Corin: We should keep enough food with us before setting out.',
    'Aurelius: Yes. Looking after each other is part of the journey, not an interruption to it.',
    'Corin: You have made eating sound very noble.',
    'Aurelius: I have a gift for explaining important things.'
  ],
  self:()=>[
    'Corin: What do you want, Aurelius? Apart from supper.',
    'Aurelius: To learn which parts of the world I love for myself. To see a place my inherited memories describe and discover what they missed.',
    'Corin: Such as?',
    'Aurelius: The smell of bread at a particular door. Whether snow is worth getting cold for. What makes you laugh when you have forgotten to be worried.',
    'Corin: Those are rather small things for a dragon.',
    'Aurelius: Only if you measure them by size. What do you want?',
    wonAll?'Corin: To go home and have enough time to feel at home again.':'Corin: To come home without bringing danger to everyone there.',
    wonAll?'Aurelius: Then let us give ourselves that time.':'Aurelius: Then I would like to see that day with you.',
    'Corin: And after that?',
    'Aurelius: We can have the luxury of deciding after that.'
  ]
};
function dragonCurrentQuest(){
  if(wonAll)return [
    'Corin: Where should we go now?',
    'Aurelius: Halvard is defeated. We can return to the people who helped us and hear what freedom has changed for them.',
    'Corin: We still have unfinished business in places.',
    !cinderSeal?(dragonLearned('trials')?'Aurelius: We heard about the trials at Witchmoor. We can return there when we feel ready.':'Aurelius: Let us revisit the people we helped and follow up on anything they tell us. We will learn what has changed by listening.'):
      !trialSealPlaced?'Aurelius: You carry the Cinderhold Seal. The seal chamber adjoining the throne room is where it belongs.':
      'Aurelius: The seal is placed. The demon’s trials remain a challenge we can return to when we choose.',
    'Corin: And the ordinary things?',
    'Aurelius: They matter as much as ever. Missing companions, a useful gift, a promise to return. A victory does not make those things smaller.'
  ];
  const current=typeof atlasJourneyObjective==='function'?atlasJourneyObjective():null;
  const missing=[['lightning','Forgewick'],['ice','Sandspire'],['shadow','Hollybeck']].filter(([key])=>!breathHas[key]);
  const knownTemples=missing.filter(([,town])=>dragonLearned('temple:'+town));
  return [
    'Corin: Help me put our next steps in order.',
    'Aurelius: Halvard threatens us and everyone living under his rule. Our goal is to reach Cinderhold ready to face him.',
    smithUpgrade?'Aurelius: Dunstan’s work has given you a stronger blade and armour. Keep supplies ready as well.':dragonLearned('smith')?'Aurelius: We heard that Dunstan can improve your equipment. Following up with him would be a sensible beginning.':'Aurelius: Keep food and supplies ready. We can ask the people we meet about the road ahead.',
    current?'Aurelius: '+current.detail:!missing.length?'Aurelius: Fire, lightning, shadow and ice are all with us now. The heartstones have given us the choices we came looking for.':
      knownTemples.length?'Aurelius: The Heartstones we still need are in '+knownTemples.map(([,town])=>town).join(', ')+'. We should seek '+knownTemples[0][1]+' Temple next. Each stone prepares us for the next temple.':
      'Aurelius: Let us follow the road Maddock described and ask questions as we go. We still have much to learn together.',
    'Corin: Does that mean we must hurry?',
    'Aurelius: Prepare, then move with purpose. Ask people what they need, look through the side paths, and do not mistake being tired for being ready.'
  ];
}
function dragonSideQuest(topic){
  if(!dragonSideQuestTopics().some(t=>t.id===topic))return [
    'Corin: Have we heard of anyone who needs our help?',
    'Aurelius: No new leads yet. Let us listen to the people we meet.'
  ];
  if(topic==='fishing')return fishingPole?[
    'Corin: How are our provisions looking?',
    'Aurelius: Calder gave you his spare rod. Face water and press A to fish. Cast, hook when the float dips, then hold to reel. Let the line run when the fish lunges.',
    'Corin: The fish do not always cooperate.',
    'Aurelius: They have a different opinion about supper. Keep the catch in our supplies and feed me through ITEMS when I need to recover.',
    'Corin: You could offer to do the patient part.',
    'Aurelius: I am patiently waiting to be fed.'
  ]:[
    'Corin: We could use a steadier supply of food for you.',
    (typeof odoRodReferral!=='undefined'&&odoRodReferral)?'Aurelius: Odo told us his grandson Calder has a spare rod. Ask him at the first camp on the road to Thornwell.':'Aurelius: We heard about a fishing rod. Let us finish that conversation and see whether one is available.',
    'Corin: A little patience might save us some provisions.',
    'Aurelius: I can offer encouragement from a respectful distance from the hook.'
  ];
  if(topic==='bramble')return brambleQuest>=2?[
    'Corin: We got Bramble back to Rowan.',
    'Aurelius: And you can still visit them outside their Thornwell home. Helping someone need not end the friendship.',
    'Corin: Bramble is unusually good company after a hard road.',
    'Aurelius: Scratch his ears when you see him. Some kinds of healing do not come in bottles.',
    'Corin: Are you jealous?',
    'Aurelius: I am considering whether I need a pair of ears.'
  ]:[
    brambleQuest===1?'Corin: We should help our new companion find his way home.':'Corin: We heard about a dog called Bramble.',
    dragonLearned('bramble-owner')?'Aurelius: We were told Rowan the Hunter is in Thornwell’s tavern. Let us ask him about the dog.':
      'Aurelius: We do not know where his person is yet. Someone nearby may recognise him; let us ask.',
    'Corin: Better than guessing which way he came from.',
    'Aurelius: And we can keep him company while we find out.'
  ];
  if(topic==='equipment')return [
    'Corin: What could make our equipment better?',
    ...(smithUpgrade?['Aurelius: Dunstan has already strengthened your blade and armour. That work is done.']:
      dragonLearned('smith')?['Aurelius: We heard that Dunstan can work on your equipment. We should speak with him about Maddock’s blade.']:[]),
    ...(glassShield?['Corin: Sela’s Glass Shield is with us.','Aurelius: Hold B during battle to raise its field. A shield is useful only if you remember to use it.']:
      dragonLearned('shield')?['Aurelius: We heard that Sela makes a glass shield. We should ask him about its protection.']:[]),
    'Corin: Anything else?',
    'Aurelius: Keep talking to craftspeople and travellers. We will know more when we hear what they can offer.'
  ];
  if(topic==='lantern')return charm.lamp?[
    'Corin: We have the Hollybeck Lantern now.',
    'Aurelius: Carry it into the dark mine galleries. Its steady light lets you explore the deep workings.',
    'Corin: Does the light make the galleries safe?',
    'Aurelius: It helps us see. It does not remove the creatures or bad footing.'
  ]:[
    'Corin: We heard about a way to see in the mines.',
    'Aurelius: Torvald left his special lantern with Sverre in Hollybeck. Let us ask Sverre for it before we go deep underground.',
    'Corin: Does the light make the galleries safe?',
    'Aurelius: It helps us see. It does not remove the creatures or bad footing.'
  ];
  if(topic==='graveyard')return charm.wake?[
    'Corin: We earned the Book of the Dead.',
    'Aurelius: You can now summon two wraiths to fight beside us. You only need to carry the book; it does not use a charm slot.',
    'Corin: So I can keep using my other charms?',
    'Aurelius: Yes. Carry the book and use Summon in battle; your equipped charms can stay as they are.'
  ]:[
    'Corin: How do we learn to summon allies?',
    'Aurelius: Defeat every wave of ghosts in the graveyard northwest of Hollybeck. The reward is the Book of the Dead, which lets you summon two wraiths in battle.',
    'Corin: We should stay until the whole challenge is finished.',
    'Aurelius: Yes. The book is the reward for completing all the waves, not merely the first fight.'
  ];
  const remaining=dragonGiftLeads().slice(0,3);
  return [
    'Corin: What about the gifts people have mentioned?',
    ...remaining.map(({n})=>'Aurelius: '+n.n+' has a gift we heard about. We should visit and ask about it.'),
    ...(!remaining.length?['Aurelius: We have collected the gifts we know about so far. Other people may have stories to share when we meet them.']:[]),
    'Corin: Your shared memory cannot tell you what everyone is carrying.',
    'Aurelius: No. These are people we are getting to know together, just as you are getting to know me.'
  ];
}
// Record actual areas, never the names of towns mentioned by a road label.
const DRAGON_VISIT_PLACES=['Millwood','Thornwell','Forgewick','Sandspire','Coralmere','Hollybeck','Sporehollow','Ashcrag','Cinderhold'];
function dragonPlaceIdentity(name){
  if(typeof name!=='string'||/road|route|path|temple|graveyard|passage/i.test(name))return null;
  return DRAGON_VISIT_PLACES.find(place=>name===place||name.startsWith(place+' — ')||name.startsWith(place+' – ')||name.startsWith(place+': '))||null;
}
function dragonConversationPlace(){
  if(MAPID==='cinderhold'||MAPID.startsWith('royal_'))return 'Cinderhold';
  if(MAPID!=='world')return dragonPlaceIdentity(MD.title||'');
  if(typeof features==='undefined')return dragonPlaceIdentity(areaUnder(P.x,P.y));
  const x=P.x/TS,y=(P.y-1)/TS;
  const area=features.filter(f=>f.kind==='area'&&!f.hidden&&x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1)
    .sort((a,b)=>(a.x1-a.x0)*(a.y1-a.y0)-(b.x1-b.x0)*(b.y1-b.y0))
    .find(f=>DRAGON_VISIT_PLACES.includes(f.label||f.place));
  return area?(area.label||area.place):null;
}
function rememberDragonConversationPlace(){
  const place=dragonConversationPlace();
  if(!place)return;
  const key='visited:'+place;
  if(!dragonBanterSeen.has(key)){dragonBanterSeen.add(key);persistDragonBanterSeen();}
}
function dragonKnowsPlace(place){
  if(dragonConversationPlace()===place)return true;
  return [...dragonBanterSeen].some(key=>
    key.startsWith('visited:')&&dragonPlaceIdentity(key.slice(8))===place||
    key==='place:'+place+':journey'||key==='place:'+place+':victory');
}
const DRAGON_JOURNEY_TOPICS=[
  {id:'frostcrag-road',name:'The road through Frostcrag',when:()=>breathHas.shadow&&!wonAll,lines:()=>FROSTCRAG_BRIEFING.slice()},
  {id:'home',name:'Leaving Millwood',when:()=>!wonAll,lines:()=>[
    'Corin: I keep thinking I have forgotten something at home.',
    'Aurelius: Have you?',
    'Corin: Probably. But that is not really what I mean. Everyone there is carrying on without me.',
    'Aurelius: Would you rather they stopped until we returned?',
    'Corin: No. I just wish I could see Nan put the lamp out tonight.',
    'Aurelius: Tell me about her while we walk. I would like to know more about the ordinary evenings you miss.'
  ]},
  {id:'monsters',name:'Why the roads became dangerous',when:()=>true,lines:()=>[
    'Corin: Maddock remembers these roads before the monsters.',
    'Aurelius: Dragons hunted here once. Larger creatures kept their distance, and riders dealt with those that threatened the settlements.',
    'Corin: Then the dragons disappeared.',
    'Aurelius: And over fifty years, the creatures they held back spread into places people had thought safe.',
    wonAll?'Corin: Defeating Halvard has not driven them away.':'Corin: Can one dragon make the roads safe again?',
    'Aurelius: We can help, but it will take time. People need safe crossings, patrols they can trust, and neighbours willing to help them.'
  ]},
  {id:'thornwell',name:'The people in Thornwell',when:()=>dragonKnowsPlace('Thornwell'),lines:()=>[
    'Corin: I used to think Thornwell was terribly far from home.',
    'Aurelius: And now?',
    'Corin: Having reached Thornwell, I want to learn more about it. The school seems a good place to begin.',
    'Aurelius: You could ask the same question in every room and leave with a different answer.',
    'Corin: Would that help?',
    'Aurelius: I think I would enjoy finding out with you.'
  ]},
  {id:'forgewick',name:'A town full of furnaces',when:()=>dragonKnowsPlace('Forgewick'),lines:()=>[
    'Corin: Does all that heat in Forgewick feel comfortable to you?',
    'Aurelius: The heat does. The hammering makes my teeth itch.',
    'Corin: I thought dragons would like a forge.',
    'Aurelius: I like watching the work. Dunstan turns the same piece of metal over and over, noticing something different each time.',
    smithUpgrade?'Corin: He noticed every nick in Maddock’s sword.':'Corin: I should ask him to look at Maddock’s sword.',
    smithUpgrade?'Aurelius: I noticed you trying to explain them before he had asked.':'Aurelius: He may ask how the edge got that way. You have time to prepare your explanation.'
  ]},
  {id:'sandspire',name:'Crossing the desert',when:()=>dragonKnowsPlace('Sandspire'),lines:()=>[
    'Corin: Sandspire taught me how many places sand can hide in a boot.',
    'Aurelius: It found its way beneath my scales too. I tried to be dignified about it.',
    'Corin: How did that go?',
    'Aurelius: Badly. I was much happier after finding shade and shaking some of it loose.',
    'Corin: We should ask people in Sandspire how they keep it out of their clothes.',
    'Aurelius: Yes. Their cloth wraps suddenly seem much more sensible than scales.'
  ]},
  {id:'coralmere',name:'Seeing the sea',when:()=>dragonKnowsPlace('Coralmere'),lines:()=>[
    'Corin: Did you know the sea would smell like that?',
    'Aurelius: I remembered salt. I did not remember the fish being quite so insistent.',
    'Corin: Those are the docks. It is different out on the beach.',
    'Aurelius: Then let us go there when we have time. I want to watch the water without a fisherman asking whether I frightened his catch.',
    'Corin: Did you?',
    'Aurelius: I was only looking. They reached their own conclusions.'
  ]},
  {id:'hollybeck',name:'The cold in Hollybeck',when:()=>dragonKnowsPlace('Hollybeck'),lines:()=>[
    'Corin: People in Hollybeck seemed to know when snow was coming.',
    'Aurelius: They have practice reading the weather. You were rather occupied watching your feet.',
    'Corin: My feet kept disappearing into the snow.',
    'Aurelius: Come close when we stop. I can keep you warm while you dry your gloves.',
    'Corin: You do not mind?',
    'Aurelius: I would mind carrying a rider who had frozen to my back.'
  ]},
  {id:'sporehollow',name:'The mushroom village',when:()=>dragonKnowsPlace('Sporehollow'),lines:()=>[
    'Corin: I cannot tell whether the mushrooms are looking at me.',
    'Aurelius: They notice our footsteps before they notice our faces.',
    'Corin: Am I walking too loudly?',
    'Aurelius: Compared with me, you are wonderfully discreet.',
    'Corin: We should ask where it is safe to stand. Some of those little shoots might be somebody.',
    'Aurelius: That would be a thoughtful question.'
  ]},
  {id:'mountains',name:'Beyond the mountain pass',when:()=>dragonKnowsPlace('Ashcrag'),lines:()=>[
    'Corin: The change from Frostcrag to Ashcrag surprised me. Snow on one side, smoke on the other.',
    'Aurelius: The warmth rising through the stone was hard to miss. There is heat beneath that part of the range.',
    'Corin: And Cinderhold beyond it.',
    wonAll?'Aurelius: His rule has ended, though the road still deserves care.':'Aurelius: Yes. If you need to rest before we go farther, tell me.',
    'Corin: I would like a moment.',
    'Aurelius: Then we will have one.'
  ]},
  {id:'cinderhold',name:'Inside Cinderhold',when:()=>!wonAll&&(dragonKnowsPlace('Cinderhold')||MAPID.startsWith('royal_')),lines:()=>[
    'Corin: He has all these rooms, and people still go hungry outside his walls.',
    'Aurelius: You are angry.',
    'Corin: Yes. More than I expected.',
    'Aurelius: Stay beside me. We need to see who is in front of us, even here.',
    'Corin: You think I might hurt someone who does not deserve it?',
    'Aurelius: I think you would never forgive yourself. Let us be careful together.'
  ]},
  {id:'alderic',name:'What Alderic told us',when:()=>dragonLearned('alderic'),lines:()=>[
    'Corin: Alderic spoke as though he had been waiting for us for years.',
    'Aurelius: He was waiting for a rider. I wonder how often he thought nobody would come.',
    'Corin: I wish I had known what to say.',
    'Aurelius: You listened. He had kept that knowledge for someone who would listen.',
    'Corin: We ought to go back someday.',
    'Aurelius: I would like to tell him what we learned.'
  ]},
  {id:'lightning',name:'Learning to wield lightning',when:()=>breathHas.lightning,lines:()=>[
    'Corin: I can still feel that lightning in my fingers.',
    'Aurelius: I felt you pull away just before it struck.',
    'Corin: I thought it was going to hit us.',
    'Aurelius: So did I, the first time. Let us practise where there is nothing nearby to hurt.',
    'Corin: Preferably nothing Nan owns.',
    'Aurelius: We should make that a firm rule.'
  ]},
  {id:'ice',name:'Fire and ice',when:()=>breathHas.ice,lines:()=>[
    'Corin: How can you breathe ice when you are warm enough to dry my gloves?',
    'Aurelius: The heartstone changes what I can draw on. It feels strange to me as well.',
    'Corin: Does it hurt?',
    'Aurelius: No. But the cold lingers at the back of my throat.',
    'Corin: Should we pause until that feeling passes?',
    'Aurelius: A short rest sounds welcome. I do not want every new power to become a reason to hurry.'
  ]},
  {id:'shadow',name:'The shadow heartstone',when:()=>breathHas.shadow,lines:()=>[
    'Corin: The Shadow breath frightens me more than the fire did.',
    'Aurelius: What frightens you about it?',
    'Corin: The way it gathers around a target is difficult to follow.',
    'Aurelius: Then we should practise with a clear space around the target. Listen for me if the effect makes it hard to follow the fight.',
    'Corin: Keep talking, then.',
    'Aurelius: I can do that. You may regret asking.'
  ]},
  {id:'royal-visit',name:'Halvard at the Copper Cup',when:()=>typeof thornwellRoyal!=='undefined'&&thornwellRoyal.stage>=7&&thornwellRoyal.answers.visit==='yes',lines:()=>[
    'Corin: I keep hearing him tell Bess to feed everyone else less.',
    'Aurelius: And nobody stopped him?',
    'Corin: His men were sitting there smiling. They made it sound ordinary.',
    'Aurelius: You know it was not right. Keep hold of that.',
    typeof thornwellRoyal!=='undefined'&&thornwellRoyal.answers.tax==='defiant'?'Corin: I argued with him. He threatened to send the collector. Bess would have paid for my words.':'Corin: I wanted to do more than stand there.',
    'Aurelius: We will need more than brave words. But I would rather travel with someone who wants to help than someone who laughs at that table.'
  ]},
  {id:'bramble',name:'After bringing Bramble home',when:()=>brambleQuest>=2,lines:()=>[
    'Corin: I keep thinking about Bramble when he saw Rowan.',
    'Aurelius: Did he nearly pull you off your feet?',
    'Corin: I did not mind. It was good to know we had done something right.',
    'Aurelius: We should visit them again.',
    'Corin: You like him, do you not?',
    'Aurelius: He greeted me without asking what I could do for the kingdom. I appreciated that.'
  ]},
  {id:'ward',name:'Maelis’s gift',when:()=>!!charm.ward,lines:()=>[
    'Corin: People made Maelis sound frightening. She helped us.',
    'Aurelius: Did any of them say they had met her?',
    'Corin: Not many. I suppose I should have asked.',
    'Aurelius: We have met her now. We can tell people what happened.',
    'Corin: I hope she knows we are grateful.',
    'Aurelius: Tell her when we next pass through the marsh.'
  ]},
  {id:'future',name:'What we want after all this',when:()=>wonAll,lines:()=>[
    'Corin: I keep trying to work out where we need to go, then remembering we can choose.',
    'Aurelius: Where would you like to go?',
    'Corin: Nowhere, for a while. Is that awful?',
    'Aurelius: I would happily spend an afternoon watching a beetle. You will hear no complaint from me.',
    'Corin: Nan would like us to stay near home.',
    'Aurelius: So would I. When we travel again, I would like you to choose somewhere you want to see.'
  ]},
  {id:'trials',name:'The keeper’s challenge',when:()=>wonAll&&cinderSeal,lines:()=>[
    'Corin: After everything, I am not sure I want another fight.',
    'Aurelius: Then we need not accept one today.',
    trialSealPlaced?'Corin: Even with the seal already in its place?':'Corin: Even though we took the seal?',
    'Aurelius: The keeper offered a trial. We can decide when we are ready for it.',
    'Corin: A quiet afternoon, then?',
    'Aurelius: I would welcome one.'
  ]}
];
function dragonJourneyTopics(){return DRAGON_JOURNEY_TOPICS.filter(topic=>topic.when());}

const DRAGON_GENERAL_TOPICS={
  history:[
    ['roads','Who built the old roads?',[
      'Corin: Some of these roads are wider than anything in Millwood. Who needed all that room?',
      'Aurelius: Carters, traders, families travelling together. The riders kept the routes open; they did not lay every stone themselves.',
      'Corin: It must have been busy.',
      'Aurelius: I remember arguments over whose wagon should move first. A remarkably cheerful sort of trouble, compared with being afraid to leave home.',
      'Corin: People argued even then?',
      'Aurelius: Of course. Peace is very noisy when it is going well.'
    ]],
    ['riders','What did riders do all day?',[
      'Corin: Were the old riders always fighting?',
      'Aurelius: They watched the roads, carried news and answered calls for help. A missing traveller could take more of their time than a battle.',
      'Corin: Nobody puts that in the songs.',
      'Aurelius: Searching the wrong valley for an afternoon is difficult to rhyme.',
      'Corin: So there was ordinary work, too.',
      'Aurelius: Much of it. I think I would have liked those days.'
    ]],
    ['ruins','Why keep the old temples?',[
      'Corin: Why did people build temples for riders?',
      'Aurelius: To preserve what they learned about dragons and the heartstones. A rider could teach someone they would never live to meet.',
      'Corin: By leaving a stone building?',
      'Aurelius: By leaving knowledge where someone could find it. Stone helped it survive the weather.',
      'Corin: And some of it survived Halvard.',
      'Aurelius: People cared for it when doing so was dangerous. We owe them more than a hurried look around.'
    ]],
    ['accounts','Whose version of history is true?',[
      'Corin: If two people tell us different things about the past, who do we believe?',
      'Aurelius: Ask how they know. Someone who saw a thing may remember it badly; someone repeating it may have changed it without meaning to.',
      'Corin: Even your memories could be wrong?',
      'Aurelius: Incomplete, certainly. I remember what dragons noticed. There was a great deal happening below their eye level.',
      'Corin: Most of my life, for instance.',
      'Aurelius: Yes. You will have to be the authority on that.'
    ]],
    ['absence','Where did the dragons go?',[
      'Corin: Do you know where the other dragons went after Wingfall?',
      'Aurelius: I have fragments of flight and fear. I cannot turn them into a map of where every dragon is now.',
      'Corin: But some might still be out there.',
      'Aurelius: They might. I want to know as much as you do.',
      'Corin: I thought you would have an answer.',
      'Aurelius: So did I. Being born with old memories has given me some unreasonable expectations of myself.'
    ]]
  ],
  personal:[
    ['dreams','Do dragons dream?',[
      'Corin: Your feet move when you sleep. Are you dreaming?',
      'Aurelius: Sometimes I dream of trying to land on a hill that keeps becoming a sheep.',
      'Corin: Ancient dragon wisdom?',
      'Aurelius: I suspect supper was involved.',
      'Corin: When I dream, I am usually back at the mill.',
      'Aurelius: Did it stay a mill? You are doing better than I am.'
    ]],
    ['age','How can you know so much so young?',[
      'Corin: Sometimes you sound older than Maddock. Then you chase a beetle.',
      'Aurelius: I can remember a hundred winters and still be meeting my first beetle.',
      'Corin: Does that get confusing?',
      'Aurelius: Often. Knowing how something happened to another dragon is different from having it happen to me.',
      'Corin: So I am allowed to explain things to you.',
      'Aurelius: Please do. Especially beetles. That one surprised me.'
    ]],
    ['fear','Do you ever get frightened?',[
      'Corin: You always sound so calm. Are you ever afraid?',
      'Aurelius: Yes. When I lose sight of you in a fight, I am very afraid.',
      'Corin: You never said.',
      'Aurelius: I was trying to help you stay steady. I may have made it seem easier than it was.',
      'Corin: You can tell me, you know.',
      'Aurelius: I would like that. Perhaps we will both breathe a little easier.'
    ]],
    ['habits','What is strange about humans?',[
      'Corin: What is the strangest thing about us?',
      'Aurelius: You put your feet in little houses, then complain that your feet are hot.',
      'Corin: Boots keep the stones out.',
      'Aurelius: I have seen you empty them. Their success seems mixed.',
      'Corin: Anything else?',
      'Aurelius: You ask whether I am hungry as if the answer might have changed.'
    ]],
    ['joke','Tell me something funny',[
      'Corin: You must remember a few dragon jokes.',
      'Aurelius: A rider asks a dragon to guard his gold. When he returns, the dragon says nobody has touched a coin.',
      'Corin: What happened?',
      'Aurelius: The dragon ate the purse.',
      'Corin: That is a terrible joke.',
      'Aurelius: You are missing the expression on the dragon’s face. I have been practising it.'
    ]],
    ['friendship','What makes someone a good companion?',[
      'Corin: Apart from carrying enough food, what do you want from a rider?',
      'Aurelius: Tell me when I have hurt your feelings. I cannot mend something you insist is fine.',
      'Corin: Is that from an old memory?',
      'Aurelius: It is something I need to remember myself. I might laugh at a landing without realising how hard you were trying.',
      'Corin: I would rather you helped me get better at it.',
      'Aurelius: Then tell me. I would rather learn than leave you feeling hurt.'
    ]],
    ['thoughts','Can you hear everything I think?',[
      'Corin: When we speak like this, can you hear everything else in my head?',
      'Aurelius: I hear what you send toward me. I am not sitting among your thoughts opening cupboards.',
      'Corin: Good. Some of those cupboards are untidy.',
      'Aurelius: Mine contain a surprising number of fish.',
      'Corin: That does not surprise me at all.',
      'Aurelius: Then you understand me without needing to look.'
    ]]
  ]
};

function dragonCombatActive(){
  return inFight()||!!arenaLock||typeof arenaT!=='undefined'&&arenaT>0||
    typeof bossScene!=='undefined'&&!!bossScene||typeof trial!=='undefined'&&!!trial||
    foes.some(f=>!f.ally&&!f.storyPassive&&f.hp>0&&['wind','swing'].includes(f.st));
}
function playerFacesDragon(){
  const dx=dragon.x-P.x,dy=dragon.y-P.y,d=Math.hypot(dx,dy);
  if(d<6||d>36)return false;
  const facing=P.dir==='s'?(P.flip?'l':'r'):P.dir;
  const forward=facing==='u'?-dy:facing==='d'?dy:facing==='l'?-dx:dx;
  return forward/d>=0.72;
}
function dragonCanConverse(){
  return dragonIntroDone&&hasDragon()&&dragonHere()&&dragon.on&&!dragon.down&&!dragon.air&&!mounted&&!ride&&!sceneHold()&&!sayNpc&&!doorMotion&&!fadeDir&&!editing&&!P.act&&!dragonCombatActive();
}
function tryDragonConversation(){
  if(!dragonCanConverse()||!playerFacesDragon())return false;
  if(globalThis.window?.EmberConversationFlow?.prompt(dragon,{dragon:true}))return true;
  openDragonConversation();return true;
}
function openDragonConversation(category='root'){
  if(typeof DialogueRenewalDragon!=='undefined')return DialogueRenewalDragon.open(category);
  if(!dragonCanConverse())return;
  rememberDragonConversationPlace();
  dismissDragonBanter();P.moving=false;P.act=null;dragon.moving=false;faceCorinAt(dragon.x,dragon.y);
  const speak=(lines,branchKey,back=category)=>{askShut();const raw=typeof lines==='function'?lines():lines,topic={lines:raw,branchKey};const spoken=window.EmberConversationBranches.prepare(raw,'Aurelius',topic);playScene(spoken,{telepathy:true,after:()=>openDragonConversation(back),conversationReplies:{topic,handled:new Set()}});};
  const topic=(name,key)=>({n:name,go:()=>speak(DRAGON_LONG_TALKS[key],'Aurelius/long/'+key+(key==='halvard'&&wonAll?'-victory':''))});
  const general=group=>[...(DRAGON_GENERAL_TOPICS[group]||[]),...(typeof dragonExtraTopics==='function'?dragonExtraTopics(group):[])].map(([id,name,lines])=>({n:name,go:()=>speak(lines,'Aurelius/'+group+'/'+id)}));
  const options={
    root:[
      {n:'What we have seen together',navigation:true,go:()=>openDragonConversation('journey')},
      {n:'Dragons and our bond',navigation:true,go:()=>openDragonConversation('dragons')},
      {n:'Emberfell and its history',navigation:true,go:()=>openDragonConversation('history')},
      {n:'What should we do next?',go:()=>speak(dragonCurrentQuest,'Aurelius/quest'+(wonAll?'-victory':''))},
      ...(dragonSideQuestTopics().length?[{n:'Side quests and useful leads',navigation:true,go:()=>openDragonConversation('quests')}]:[]),
      {n:'Travelling and fighting together',navigation:true,go:()=>openDragonConversation('travelling')},
      {n:'You, me, and other mysteries',navigation:true,go:()=>openDragonConversation('personal')},
      {n:'Let’s keep going',go:null}
    ],
    journey:dragonJourneyTopics().map(t=>({n:t.name,go:()=>speak(t.lines,'Aurelius/journey/'+t.id)})),
    dragons:[topic('The shared dragon consciousness','consciousness'),topic('Why did you choose me?','choosing'),topic('The heartstones','heartstones')],
    personal:[topic('What do you want for yourself?','self'),...general('personal')],
    history:[...general('history'),topic('Wingfall and the seven riders','wingfall'),topic('The land and its people','land'),topic(wonAll?'Life after Halvard':'Why Halvard fears us','halvard')],
    quests:dragonSideQuestTopics().map(t=>({n:t.name,go:()=>speak(()=>dragonSideQuest(t.id),'Aurelius/side/'+t.id)})),
    travelling:[topic('Riding and flying','travelling'),topic('Fighting as partners','battle'),topic('Food and recovery','care')]
  };
  if(!options[category])return;
  if(category==='history'||category==='quests')for(const o of options[category])o.category=category==='history'?'world':'lead';
  ask={quick:1,dragonConversation:true,topicScope:category,back:category==='root'?null:()=>openDragonConversation(),opts:[{n:DRAGON_NAME,head:true},...options[category],...(category==='root'?[]:[{n:'Back to our other questions',navigation:true,backNavigation:true,go:()=>openDragonConversation()}])]};
  askPick=1;askDraw();
}
