/* Aurelius's optional telepathic banter never opens a blocking game dialogue. */
const dragonBanterSeen=new Set();
let dragonBanterQueue=[],dragonBanterActive=null,dragonBanterGap=0,dragonBanterPanel=null,dragonNpcCooldown=0;
const DRAGON_PLACE_LINES={
  "Millwood":["Apples and chimney smoke. This is home.", "Nan will notice if anything smells singed."],
  "Thornwell":["A busy town beneath quiet branches.", "The branches hear plenty of gossip."],
  "Forgewick":["Those hammers never seem to rest.", "Neither do the repair bills."],
  "Forgefalls":["That water has outlived kingdoms.", "And still has somewhere to be."],
  "Sandspire":["Wonder is thirsty work. Keep some water.", "I was wondering where the shade went."],
  "Coralmere":["The sea moves, yet never leaves.", "Rather like Odo on a fishing day."],
  "Hollybeck":["Come closer if your fingers get cold.", "A travelling hearth. Nan would approve."],
  "Infernia":["Old fires. Unfinished anger.", "Let us finish what brought us here."],
  "Shroom Pass":["Even the path is growing things.", "I hope it stops growing enemies."],
  "Frostcrag":["Even the wind lowers its voice here.", "Mine is staying inside my scarf."],
  "Ashcrag":["This stone remembers fire.", "Let us hope it sticks to remembering."],
  "Witchmoor":["Old knowledge grows tangled roots.", "Then we ask before touching anything."],
  "Dreadmarsh":["That ground is pretending to be still.", "It had better leave my boots alone."],
  "Sporehollow":["The forest grew itself a village.", "Try not to sneeze on anybody’s roof."],
  "Sporewood":["These spores travel far.", "They can travel without my lungs."],
  "Northern Woods":["Every branch has heard something.", "Has one heard where the path went?"],
  "Hollybeck Graveyard":["Pass gently. These names were people.", "I will remember, even if something rises."],
  "Forgewick Temple":["Riders once walked these halls.", "Let us make them safe to walk again."],
  "Hollybeck Temple":["There is warmth beneath these memories.", "We will have to look past the ice."],
  "Sandspire Temple":["Sand hid the doors, not their purpose.", "I hope it spared the floor."],
  "Cinderhold Castle":["Halvard made a cage of this place.", "Then we open it."],
  "Cinderhold":["I am beside you because I choose to be.", "That is why I am still walking."]
};
const DRAGON_POST_PLACE_LINES={
  "Millwood":["Home sounds different without fear.", "I had forgotten how quiet it could be."],
  "Thornwell":["They can teach the whole history now.", "Even the parts kings dislike."],
  "Forgewick":["Those hammers build for their owners now.", "May the work be lighter."],
  "Forgefalls":["The water never bowed to Halvard.", "Now the people need not either."],
  "Sandspire":["The sun has outlasted another tyrant.", "It could celebrate with a little shade."],
  "Coralmere":["Perhaps the boats will carry more visitors.", "And fewer people fleeing home."],
  "Hollybeck":["Cold streets. Warmer voices.", "There is something hopeful in the air."],
  "Infernia":["His shadow is shorter than this land.", "Time to see what grows beyond it."],
  "Shroom Pass":["A road can become a promise again.", "We still ought to watch our footing."],
  "Frostcrag":["The peaks look unchanged. We are not.", "My legs certainly remember the climb."],
  "Ashcrag":["Even burned ground can begin again.", "We should give it the chance."],
  "Witchmoor":["Freedom brings questions of its own.", "Maelis may have a few answers."],
  "Dreadmarsh":["Halvard fell. The marsh remains stubborn.", "I never expected polite mud."],
  "Sporehollow":["Their deep ring will remember this.", "I hope they remember who helped, too."],
  "Sporewood":["A new season will reach even here.", "Preferably one with fewer spores."],
  "Northern Woods":["The trees have a new story to overhear.", "Let us give them a happier one."],
  "Hollybeck Graveyard":["The living can speak their names freely.", "That much, at least, we brought back."],
  "Forgewick Temple":["These halls outlasted his reign.", "Now their keepers can hope again."],
  "Hollybeck Temple":["No crown can bury this memory now.", "Nor can all this snow."],
  "Sandspire Temple":["The old purpose survived the king.", "Let us leave the doors open to it."],
  "Cinderhold Castle":["A fortress needs more than a new ruler.", "It needs people who feel safe here."],
  "Cinderhold":["This hall no longer belongs to his fear.", "I would like to hear laughter here someday."]
};
const DRAGON_ENEMY_LINES={
  "skeleton":["No lungs, yet it still sounds angry.", "Perhaps it is tired of rattling."],
  "skeleton1":["Those bones have endured several endings.", "I can arrange another."],
  "skeleton3":["Its armour forgot to stop walking.", "We will remind it."],
  "wraith":["It is following your warmth.", "For once, being cold might help."],
  "mage1":["Watch its hands before the spell.", "Keep those warnings coming."],
  "mage2":["That one is gathering power.", "Then I will give it less time."],
  "devil1":["It brought its own heat.", "This fight hardly needed more fire."],
  "devil3":["That flame has a dreadful temper.", "Your manners are much better."],
  "boneguard":["Something refuses to let those bones rest.", "I will help them come apart."],
  "ent":["That tree is choosing its steps.", "I preferred them rooted."],
  "ent1":["Watch the roots before the branches.", "I will mind my feet."],
  "ent2":["Old bark. Quick temper.", "And rather large fists."],
  "eye2":["It has noticed us.", "With that eye, I would hope so."],
  "eyePurple":["Do not let its stare stop you.", "Moving. Very much moving."],
  "eyeRed":["That red eye is gathering light.", "Let us avoid the receiving end."],
  "ghost":["Something here refuses the silence.", "We will give it peace if we can."],
  "ghost3":["Old grief beneath that crown.", "I also see the claws."],
  "gnoll1":["It is watching your hands.", "Good. It might miss your teeth."],
  "gnoll2":["Do not trust its first swing.", "That shifting weight gave it away."],
  "gnoll3":["This one has survived other fights.", "So have we."],
  "plant1":["Not every flower waits for rain.", "That one is waiting for lunch."],
  "plant2":["Its leaves move against the wind.", "I noticed the teeth first."],
  "plant3":["Hunger beneath those petals.", "Nan’s weeds had better behave."],
  "reptile":["Watch its first lunge.", "You watch the rest of it."],
  "reptile2":["Its scales turn with the light.", "I will aim where they meet."],
  "reptile3":["It thinks it owns this road.", "We only need to borrow it."],
  "shroomBrown":["That mushroom has decided to travel.", "It could choose another direction."],
  "shroomPurple":["Give those spores room.", "I was giving the whole thing room."],
  "shroomRed":["A bright cap is not an invitation.", "Not even if it waves first?"],
  "royalguard":["A uniform cannot choose what is right.", "He still has time to stand aside."]
};
const DRAGON_BOSS_LINES={
  "ghost":["That grief has learned to strike.", "Pity it. Keep your guard up."],
  "ghost3":["Its crown has become a prison.", "We will break its hold."],
  "golem1":["Stone remembers its orders.", "Then we must think faster."],
  "golem2":["The crystal is awake.", "My shield is ready."],
  "golem3":["That guardian has waited centuries.", "Let us end its watch."],
  "golem4":["Something ancient drives that shell.", "We break the shell first."],
  "devil":["It acts as though it owns fire.", "You may disagree."],
  "lich":["That mind has forgotten how to let go.", "Including us, apparently."],
  "knight":["He sees a prize where I see our bond.", "He is not taking you."],
  "treasuryknight":["Gold behind him. A choice before him.", "I wish he had chosen to move."],
  "kdragon":["Whatever Halvard became, stay beside me.", "I am here, Aurelius."]
};
const DRAGON_BOSS_DEFEAT_LINES={
  "ghost":["That sorrow can finally rest.", "Let us leave it in peace."],
  "ghost3":["The crown has lost its captive.", "One less prison in this world."],
  "golem1":["Its orders end here.", "I could use a moment’s rest."],
  "golem2":["The crystal has gone quiet.", "My ears are grateful."],
  "golem3":["A long watch, finally finished.", "We will remember who waited here."],
  "golem4":["The ancient shell is empty.", "The way ahead is ours."],
  "devil":["Its fire fades. Ours is still our own.", "I prefer yours."],
  "lich":["That silence belongs to the living again.", "Then let us not waste it."],
  "knight":["He is beaten. Let him carry the lesson home.", "As long as he leaves you out of it."],
  "treasuryknight":["The treasure’s keeper is still.", "Let us see what he guarded."],
  "kdragon":["Breathe, Corin. You are still here.", "So are you. That matters more."]
};
const DRAGON_NPC_THOUGHTS={
  "Odo":["Kindness beneath a convincing grumble.", "Years of practice."],
  "Hettie":["She has decided you are coming home.", "I had better not disappoint her."],
  "Nan":["Her worry measures how much she loves you.", "That makes leaving harder."],
  "Maddock":["He carries more than he says aloud.", "The past must be heavy."],
  "Sela":["She chose to make protection.", "I intend to use it well."],
  "Dunstan":["He trusts his hands over grand promises.", "So do I, wearing his armour."],
  "Toft":["Experience taught him to prepare.", "We should listen before going below."],
  "Maelis":["She measures words like ingredients.", "I hope we are not ingredients."],
  "Wren":["A small gift carries a long memory.", "I will take care of it."],
  "Rowan":["He speaks like part of him is missing.", "Then we help him find it."],
  "Iven":["He leaves room for questions.", "You would like the school. From outside."],
  "Elowen":["Written memory can outlive a tyrant.", "We had better read carefully."],
  "Idris":["He is proud of this place.", "It deserves protecting."],
  "Linna":["Numbers reveal what people hide.", "Especially what went missing."],
  "Orin":["He sees someone he remembers in you.", "I hope he sees me as well."],
  "Gwil":["He measures a day in useful work.", "We could learn from that."],
  "Halvard":["He confuses obedience with understanding.", "I understood. I refuse."]
};
const DRAGON_REACTION_LINES={
  "freedom":["Fear no longer finishes their sentences.", "Let us keep it that way."],
  "rebuilding":["They have a tomorrow to build.", "We can help with more than a sword."],
  "fishing":["I approve of the part where I eat.", "Practise patience while I practise fishing."],
  "shield":["Patience can turn a blow aside.", "Remind me before the blow."],
  "bond":["Our bond is ours to shape.", "That choice belongs to us."],
  "reunion":["Worry has made room for happiness.", "Bramble has room for another ear scratch."],
  "missing":["That worry is not small to its owner.", "We will not treat it like it is."],
  "king":["Fear makes ordinary words dangerous.", "They should not live like this."],
  "memory":["My memories are only part of the story.", "I will keep listening to theirs."],
  "food":["Mortals speak beautifully about supper.", "A subject we all agree on."],
  "depths":["Those workings deserve a steady light.", "I would rather see what made that echo."],
  "home":["Everyone protects a world called home.", "Small does not mean unimportant."]
};
function dragonStoryStage(){return wonAll?'victory':'journey';}
function dragonLearned(key){return dragonBanterSeen.has('learned:'+key);}
// Learn from lines Corin actually sees, including conversations before hatching
// and inside houses. Aurelius's own suggestions cannot unlock further leads.
function rememberDragonKnowledge(who,text,persist=true){
  if(!text||who==='Aurelius')return;
  const before=dragonBanterSeen.size,words=String(text);
  const learn=key=>dragonBanterSeen.add('learned:'+key);
  if(/\bBramble\b/i.test(words))learn('bramble');
  if(/demon|trials/i.test(words)&&/Maelis|Witchmoor/.test(who+' '+words))learn('trials');
  if(/\bRowan\b/i.test(words)&&/tavern|Copper Cup/i.test(words))learn('bramble-owner');
  if(/fishing|\brod\b|\bpole\b/i.test(words)&&/Odo|Calder/i.test(who+' '+words))learn('fishing');
  if(/Dunstan/i.test(who+' '+words)&&/blade|armour|armor|blacksmith|sword|smith/i.test(words))learn('smith');
  if(/Sela/i.test(who+' '+words)&&/shield|glass|protect/i.test(words))learn('shield');
  if(who&&who!=='Corin'&&/charm|amulet|ward|lantern/i.test(words))learn('gift:'+who);
  if(/temple|heartstone/i.test(words))for(const town of ['Forgewick','Hollybeck','Sandspire'])if(words.toLowerCase().includes(town.toLowerCase()))learn('temple:'+town);
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
  dragonBanterQueue=[];dismissDragonBanter();dragonBanterGap=0;
  dragonNpcCooldown=seen.some(key=>typeof key==='string'&&key.startsWith('npc:'))?90:0;
}
const DRAGON_DOOR_REPLIES=[
  'Hurry back, little one.', 'I’ll be here.', 'Take your time, Corin.',
  'Try not to come back with another egg.', 'I will keep an eye on the road.',
  'Bring back a story. Or a fish.', 'Go on. I could use a rest.',
  'I will try to leave the flowers standing.', 'Give my regards to anyone kind.',
  'I’ll save you a patch of sunshine.', 'Call if you need me.',
  'I promise not to eat anything important.'
];
let dragonDoorReply=0;
function dragonDoorExchange(){
  if(!dragonIntroDone)return;
  dismissDragonBanter();
  dragonBanterActive={key:'doorway',lines:["Wait here, I’ll be right back.",DRAGON_DOOR_REPLIES[dragonDoorReply++%DRAGON_DOOR_REPLIES.length]],
    speakers:['Corin',DRAGON_NAME],time:7,handoff:true};
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
  dragonNpcCooldown=Math.max(0,dragonNpcCooldown-dt);
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
  rememberDragonConversationPlace();
  const place=MAPID==='world'?areaUnder(P.x,P.y):(MD.title||MAPID);
  const title=MAPID==='world'?(DRAGON_PLACE_LINES[place]?place:null):Object.keys(DRAGON_PLACE_LINES).sort((a,b)=>b.length-a.length).find(k=>place?.includes(k));
  if(title)queueDragonBanter('place:'+title+':'+dragonStoryStage(),(wonAll?DRAGON_POST_PLACE_LINES:DRAGON_PLACE_LINES)[title]);
  for(const f of foes){
    if(f.ally||f.huntingArena||f.st==='dead'||f.hp<=0||Math.hypot(f.x-P.x,f.y-P.y)>180)continue;
    if(DRAGON_BOSS_LINES[f.kind])dragonBossBanter(f);
    else queueDragonBanter('enemy:'+f.kind,DRAGON_ENEMY_LINES[f.kind]);
  }
  if(wonAll)queueDragonBanter('story:halvard-fallen',['No crown can command our bond.','We have a future without him.']);
  if(cinderSeal)queueDragonBanter('story:seal',['Victory has more to teach us.','We can face another trial together.']);
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
    'Corin: It was an egg. I thought that would be rather cruel.',
    'Aurelius: You say that as though everyone would agree. That is part of my answer.',
    'Corin: I am still a miller’s son. I have never led anyone anywhere.',
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
    heartKnown?'Corin: Alderic said the stones came from the first dragon.':'Corin: Maddock thought the old temples might have answers.',
    heartKnown?'Aurelius: That account lives in our shared memory too. Something ancient was divided into powers that could be carried. The knowledge deserves care.':'Aurelius: Then we should listen to the keepers who have waited there. An inherited memory is no excuse to ignore a living witness.',
    'Corin: Could I order you to use them?',
    'Aurelius: You can ask. You should also listen. Power that cannot hear an answer becomes the sort of power we are resisting.',
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
    'Aurelius: No. And we should protect those things as carefully as we protect each other.'
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
    'Corin: Why would Halvard fear a dragon that has only just hatched?',
    'Aurelius: Because I chose someone without asking his permission. A bond freely given is a thing he cannot manufacture by decree.',
    'Corin: Maddock thinks he will take you, or kill us both.',
    'Aurelius: Then we must prepare. Being right will not turn aside a blade. Friends, equipment and the heartstones can help us reach him alive.',
    'Corin: Do you hate him?',
    'Aurelius: I oppose what he does. I do not need hatred to know that people should be safe from him.',
    'Corin: I do not want to become someone who solves everything with a sword.',
    'Aurelius: Keep asking that question. It is a good defence against becoming comfortable with power.'
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
  self:[
    'Corin: What do you want, Aurelius? Apart from supper.',
    'Aurelius: To learn which parts of the world I love for myself. To see a place my inherited memories describe and discover what they missed.',
    'Corin: Such as?',
    'Aurelius: The smell of bread at a particular door. Whether snow is worth getting cold for. What makes you laugh when you have forgotten to be worried.',
    'Corin: Those are rather small things for a dragon.',
    'Aurelius: Only if you measure them by size. What do you want?',
    'Corin: To come home without bringing danger to everyone there.',
    'Aurelius: Then I would like to see that day with you.',
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
  const missing=[['lightning','Forgewick'],['shadow','Hollybeck'],['ice','Sandspire']].filter(([key])=>!breathHas[key]);
  const knownTemples=missing.filter(([,town])=>dragonLearned('temple:'+town));
  return [
    'Corin: Help me put our next steps in order.',
    'Aurelius: Halvard threatens us and everyone living under his rule. Our goal is to reach Cinderhold ready to face him.',
    smithUpgrade?'Aurelius: Dunstan’s work has given you a stronger blade and armour. Keep supplies ready as well.':dragonLearned('smith')?'Aurelius: We heard that Dunstan can improve your equipment. Following up with him would be a sensible beginning.':'Aurelius: Keep food and supplies ready. We can ask the people we meet about the road ahead.',
    !missing.length?'Aurelius: Fire, lightning, shadow and ice are all with us now. The heartstones have given us the choices we came looking for.':
      knownTemples.length?'Aurelius: We have heard about the old temples near '+knownTemples.map(([,town])=>town).join(', ')+'. We can follow those leads and learn what their keepers know.':
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
    'Aurelius: Calder gave you his spare rod. Face water and press A to fish, then stop the marker in the green arc.',
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
      dragonLearned('shield')?['Aurelius: Sela told us about her glasswork. Let us ask her about the protection it can offer.']:[]),
    'Corin: Anything else?',
    'Aurelius: Keep talking to craftspeople and travellers. We will know more when we hear what they can offer.'
  ];
  const remaining=dragonGiftLeads().slice(0,3);
  return [
    'Corin: What about the gifts people have mentioned?',
    ...remaining.map(({n})=>'Aurelius: '+n.n+' spoke about something that might help. We can finish that conversation when we return.'),
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
  {id:'home',name:'Leaving Millwood',when:()=>!wonAll,lines:()=>[
    'Corin: I keep thinking I have forgotten something at home.',
    'Aurelius: Have you?',
    'Corin: Probably. But that is not really what I mean. Everyone there is carrying on without me.',
    'Aurelius: Would you rather they stopped until we returned?',
    'Corin: No. I just wish I could see Nan put the lamp out tonight.',
    'Aurelius: Tell me about her while we walk. I have only met her through your worry.'
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
    'Corin: Now that we have made it here, I want to look around. I would like to see the school.',
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
    'Corin: Sand has got into places I did not know my boots had.',
    'Aurelius: There is some beneath my scales. I am trying to be dignified about it.',
    'Corin: How is that going?',
    'Aurelius: Badly. When we find shade, I need you to scratch just below my left wing.',
    'Corin: We should ask how people here keep it out of their clothes.',
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
    'Corin: Everyone here seems to know when snow is coming.',
    'Aurelius: They are watching the clouds while you are watching your feet.',
    'Corin: My feet keep disappearing into it.',
    'Aurelius: Come close when we stop. I can keep you warm while you dry your gloves.',
    'Corin: You do not mind?',
    'Aurelius: I would mind carrying a rider who had frozen to the saddle.'
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
    'Corin: Snow behind us, smoke ahead. I can hardly believe it is the same mountain.',
    'Aurelius: Feel the air coming through the stone. There is heat below us.',
    'Corin: And Cinderhold beyond it.',
    wonAll?'Aurelius: We can take that road without wondering whether we will return.':'Aurelius: Yes. If you need to rest before we go farther, tell me.',
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
  {id:'alderic',name:'What Alderic told us',when:()=>heartKnown,lines:()=>[
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
    'Corin: Would something warm help?',
    'Aurelius: We could find out. You have made tea sound very inviting.'
  ]},
  {id:'shadow',name:'The shadow heartstone',when:()=>breathHas.shadow,lines:()=>[
    'Corin: That shadow frightens me more than the fire did.',
    'Aurelius: What frightens you about it?',
    'Corin: For a moment I could not see where you ended.',
    'Aurelius: I was still beside you. Reach for my voice if it happens again.',
    'Corin: Keep talking, then.',
    'Aurelius: I can do that. You may regret asking.'
  ]},
  {id:'bramble',name:'After bringing Bramble home',when:()=>brambleQuest>=2,lines:()=>[
    'Corin: I keep thinking about Bramble when he saw Rowan.',
    'Aurelius: He nearly pulled you off your feet.',
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
    'Corin: Yesterday I woke up and could not remember where we needed to go.',
    'Aurelius: Where did you decide?',
    'Corin: Nowhere, for a while. Is that awful?',
    'Aurelius: I spent the morning watching a beetle. I am in no position to judge.',
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
      'Aurelius: Last night I was trying to land on a hill that kept becoming a sheep.',
      'Corin: Ancient dragon wisdom?',
      'Aurelius: I suspect supper was involved.',
      'Corin: I dreamed I was back at the mill.',
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
      'Aurelius: It is from yesterday. You went very quiet when I laughed at your landing.',
      'Corin: I was trying quite hard.',
      'Aurelius: I know that now. I am sorry, Corin.'
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
  openDragonConversation();return true;
}
function openDragonConversation(category='root'){
  if(!dragonCanConverse())return;
  rememberDragonConversationPlace();
  dismissDragonBanter();P.moving=false;P.act=null;dragon.moving=false;faceCorinAt(dragon.x,dragon.y);
  const speak=(lines,back=category)=>{askShut();playScene(typeof lines==='function'?lines():lines,{telepathy:true,after:()=>openDragonConversation(back)});};
  const topic=(name,key)=>({n:name,go:()=>speak(DRAGON_LONG_TALKS[key])});
  const general=category=>(DRAGON_GENERAL_TOPICS[category]||[]).map(([id,name,lines])=>({n:name,go:()=>speak(lines)}));
  const options={
    root:[
      {n:'What we have seen together',go:()=>openDragonConversation('journey')},
      {n:'Dragons and our bond',go:()=>openDragonConversation('dragons')},
      {n:'Emberfell and its history',go:()=>openDragonConversation('history')},
      {n:'What should we do next?',go:()=>speak(dragonCurrentQuest)},
      ...(dragonSideQuestTopics().length?[{n:'Side quests and useful leads',go:()=>openDragonConversation('quests')}]:[]),
      {n:'Travelling and fighting together',go:()=>openDragonConversation('travelling')},
      {n:'You, me, and other mysteries',go:()=>openDragonConversation('personal')},
      {n:'Let’s keep going',go:null}
    ],
    journey:dragonJourneyTopics().map(t=>({n:t.name,go:()=>speak(t.lines)})),
    dragons:[topic('The shared dragon consciousness','consciousness'),topic('Why did you choose me?','choosing'),topic('The heartstones','heartstones')],
    personal:[topic('What do you want for yourself?','self'),...general('personal')],
    history:[...general('history'),topic('Wingfall and the seven riders','wingfall'),topic('The land and its people','land'),topic(wonAll?'Life after Halvard':'Why Halvard fears us','halvard')],
    quests:dragonSideQuestTopics().map(t=>({n:t.name,go:()=>speak(()=>dragonSideQuest(t.id))})),
    travelling:[topic('Riding and flying','travelling'),topic('Fighting as partners','battle'),topic('Food and recovery','care')]
  };
  if(!options[category])return;
  ask={quick:1,dragonConversation:true,back:category==='root'?null:()=>openDragonConversation(),opts:[{n:DRAGON_NAME,head:true},...options[category],...(category==='root'?[]:[{n:'Back to our other questions',go:()=>openDragonConversation()}])]};
  askPick=1;askDraw();
}
