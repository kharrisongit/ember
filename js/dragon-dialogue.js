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
function paintDragonBanter(){
  if(!dragonBanterActive)return;
  if(!dragonBanterPanel){
    dragonBanterPanel=document.createElement('div');dragonBanterPanel.id='dragonBanter';
    dragonBanterPanel.setAttribute('role','status');dragonBanterPanel.setAttribute('aria-live','polite');
    dragonBanterPanel.setAttribute('aria-label','Travel conversation. Press A to dismiss.');
    dragonBanterPanel.style.cssText='position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:max-content;max-width:calc(100% - 16px);box-sizing:border-box;padding:6px 10px;background:rgba(17,22,34,.9);border:1px solid #8292ae;border-radius:6px;color:#edf1ff;font:13px/1.35 Georgia,serif;z-index:5;pointer-events:none;white-space:normal';
    document.getElementById('stage').appendChild(dragonBanterPanel);
  }
  const reply=dragonBanterActive.time<=5;
  const text=(reply?'Corin':DRAGON_NAME)+': '+dragonBanterActive.lines[reply?1:0];
  if(dragonBanterPanel.textContent!==text)dragonBanterPanel.textContent=text;
  dragonBanterPanel.hidden=false;
}
function stepDragonBanter(dt){
  dragonNpcCooldown=Math.max(0,dragonNpcCooldown-dt);
  const paused=!!(!dragonIntroDone||!hasDragon()||!dragonHere()||fishing||mode!=='play'||sceneHold()||sayNpc||ovl||ask||bagOpen||atlasOpen||editing||fadeDir||doorMotion||deadShown);
  if(dragonBanterPanel)dragonBanterPanel.hidden=paused||!dragonBanterActive;
  if(dragonBanterActive&&(dragonBanterActive.map!==MAPID||dragonBanterActive.stage!==dragonStoryStage()))dismissDragonBanter();
  dragonBanterQueue=dragonBanterQueue.filter(b=>b.map===MAPID&&b.stage===dragonStoryStage());
  if(paused)return;
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
    'Corin: You do not fit through every doorway.',
    'Aurelius: I can accompany you into Cinderhold and the temples. At houses, taverns, the school and other interiors, I will wait outside.',
    'Corin: Sensible. I would never hear the end of it if you broke Nan’s door.',
    'Aurelius: Nor would you hear the end of it from me if you called that getting stuck a tactical decision.'
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
    fishingPole?'Corin: Odo’s fishing pole should keep us supplied.':'Corin: We should ask Odo about fishing when he has gone home to Millwood.',
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
    !cinderSeal?'Aurelius: Return to Maelis in Witchmoor. With the king gone, a keeper of old trials has answered her circle. Speak with the demon there when you are ready.':
      !trialSealPlaced?'Aurelius: You carry the Cinderhold Seal. The seal chamber adjoining the throne room is where it belongs.':
      'Aurelius: The seal is placed. The demon’s trials remain a challenge we can return to when we choose.',
    'Corin: And the ordinary things?',
    'Aurelius: They matter as much as ever. Missing companions, a useful gift, a promise to return. A victory does not make those things smaller.'
  ];
  const missing=[['lightning','Forgewick'],['shadow','Hollybeck'],['ice','Sandspire']].filter(([key])=>!breathHas[key]);
  return [
    'Corin: Help me put our next steps in order.',
    'Aurelius: Halvard threatens us and everyone living under his rule. Our goal is to reach Cinderhold ready to face him.',
    !smithUpgrade?'Aurelius: First, Dunstan in Forgewick can improve Maddock’s blade and fit you with armour. Good equipment is a sensible beginning.':'Aurelius: Dunstan’s work has given you a stronger blade and armour. Keep supplies ready as well.',
    'Corin: And the heartstones?',
    missing.length?'Aurelius: We have more to discover in the old temples near '+missing.map(([,town])=>town).join(', ')+'. Their keepers and chambers hold the powers we have not found.':'Aurelius: Fire, lightning, shadow and ice are all with us now. The heartstones have given us the choices we came looking for.',
    'Corin: Does that mean we must hurry?',
    'Aurelius: Prepare, then move with purpose. Ask people what they need, look through the side paths, and do not mistake being tired for being ready.'
  ];
}
function dragonSideQuest(topic){
  if(topic==='fishing')return fishingPole?[
    'Corin: How are our provisions looking?',
    'Aurelius: Odo has already given you the pole. Face water and press A to fish, then stop the marker in the green arc.',
    'Corin: The fish do not always cooperate.',
    'Aurelius: They have a different opinion about supper. Keep the catch in our supplies and feed me through ITEMS when I need to recover.',
    'Corin: You could offer to do the patient part.',
    'Aurelius: I am patiently waiting to be fed.'
  ]:[
    'Corin: We could use a steadier supply of food for you.',
    'Aurelius: Odo knows the water around Millwood. Now that he has left his old spot and returned home, speak to him there.',
    'Corin: He might lend me a fishing pole.',
    'Aurelius: Ask him. People sometimes disguise useful gifts as complaints.',
    'Corin: Then Odo must be the most generous man in Emberfell.',
    'Aurelius: I will reserve judgement until we see the fish.'
  ];
  if(topic==='bramble')return brambleQuest>=2?[
    'Corin: We got Bramble back to Rowan.',
    'Aurelius: And you can still visit them outside their Thornwell home. Helping someone need not end the friendship.',
    'Corin: Bramble is unusually good company after a hard road.',
    'Aurelius: Scratch his ears when you see him. Some kinds of healing do not come in bottles.',
    'Corin: Are you jealous?',
    'Aurelius: I am considering whether I need a pair of ears.'
  ]:[
    'Corin: Is there someone nearby who could use our help?',
    brambleQuest===1?'Aurelius: Bramble is travelling with us. His person, Rowan the Hunter, is in Thornwell’s tavern. Bring him there.':'Aurelius: Look for Bramble on the road near Thornwell. A friendly dog far from his person is worth stopping for.',
    'Corin: I suppose he cannot tell me his address.',
    'Aurelius: Townspeople may know who is looking for him. A question can be more useful than another mile of guessing.',
    'Corin: You will wait while I go into the tavern?',
    'Aurelius: Of course. I would hate to stand on the dog.'
  ];
  if(topic==='equipment')return [
    'Corin: What could make our equipment better?',
    smithUpgrade?'Aurelius: Dunstan has already strengthened your blade and armour. That work is done.':'Aurelius: Visit Dunstan, the blacksmith in Forgewick. Maddock’s blade gives him something to work with.',
    glassShield?'Corin: And Sela’s Glass Shield is already with us.':'Corin: What about protecting myself?',
    glassShield?'Aurelius: Hold B during battle to raise its field. A shield is useful only if you remember to use it.':'Aurelius: Speak with Sela in Forgewick. Her glasswork can offer a kind of protection ordinary metal cannot.',
    'Corin: Anything else?',
    'Aurelius: Keep talking to craftspeople and travellers. Not every helpful thing waits in a chest behind a monster.'
  ];
  const remaining=Object.values(W.maps).flatMap(map=>(map.npcs||[]).map(n=>({n,map}))).filter(({n})=>n.charm&&!charm[n.charm]&&n.charm!=='edge');
  const unique=remaining.filter((v,i,a)=>a.findIndex(q=>q.n.charm===v.n.charm)===i).slice(0,3);
  return [
    'Corin: Are there other useful things we have missed?',
    'Aurelius: Small gifts can change a long journey. We should look for people with knowledge to share, not only things to sell.',
    ...unique.map(({n,map})=>'Aurelius: '+n.n+(map.title&&map.title!=='Emberfell'&&map!==W.maps.world?' in '+map.title:'')+' may have something to offer. Speak with them when our path takes us there.'),
    ...(!unique.length?['Aurelius: You have gathered the known gifts I would have suggested. That is a good reason to thank their keepers, rather than keep asking for more.']:[]),
    'Corin: Does your shared memory tell you what everyone is carrying?',
    'Aurelius: No. Think of these as leads worth following. The people themselves will tell you what their gifts mean.'
  ];
}
function dragonCanConverse(){
  return dragonIntroDone&&hasDragon()&&dragonHere()&&dragon.on&&!dragon.down&&!dragon.air&&!mounted&&!ride&&!sceneHold()&&!sayNpc&&!doorMotion&&!fadeDir&&!editing&&!inFight();
}
function tryDragonConversation(){
  if(!dragonCanConverse()||Math.hypot(P.x-dragon.x,P.y-dragon.y)>56)return false;
  openDragonConversation();return true;
}
function openDragonConversation(category='root'){
  if(!dragonCanConverse())return;
  dismissDragonBanter();P.moving=false;P.act=null;dragon.moving=false;faceCorinAt(dragon.x,dragon.y);
  const speak=(lines,back=category)=>{askShut();playScene(typeof lines==='function'?lines():lines,{after:()=>openDragonConversation(back)});};
  const topic=(name,key)=>({n:name,go:()=>speak(DRAGON_LONG_TALKS[key])});
  const options={
    root:[
      {n:'Dragons and our bond',go:()=>openDragonConversation('dragons')},
      {n:'Emberfell and its history',go:()=>openDragonConversation('history')},
      {n:'What should we do next?',go:()=>speak(dragonCurrentQuest)},
      {n:'Side quests and useful leads',go:()=>openDragonConversation('quests')},
      {n:'Travelling and fighting together',go:()=>openDragonConversation('travelling')},
      topic('Tell me about yourself','self'),
      {n:'Let’s keep going',go:null}
    ],
    dragons:[topic('The shared dragon consciousness','consciousness'),topic('Why did you choose me?','choosing'),topic('The heartstones','heartstones')],
    history:[topic('Wingfall and the seven riders','wingfall'),topic('The land and its people','land'),topic(wonAll?'Life after Halvard':'Why Halvard fears us','halvard')],
    quests:['fishing','bramble','equipment','gifts'].map((key,i)=>({n:['Fishing and Odo',brambleQuest>=2?'Visit Rowan and Bramble':'Help Bramble find his person','Our weapons and protection','Charms and other gifts'][i],go:()=>speak(()=>dragonSideQuest(key))})),
    travelling:[topic('Riding, flying and doorways','travelling'),topic('Fighting as partners','battle'),topic('Food and recovery','care')]
  };
  if(!options[category])return;
  ask={quick:1,dragonConversation:true,back:category==='root'?null:()=>openDragonConversation(),opts:[{n:DRAGON_NAME,head:true},...options[category],...(category==='root'?[]:[{n:'Back to our other questions',go:()=>openDragonConversation()}])]};
  askPick=1;askDraw();
}
