/* Aurelius's optional telepathic banter never opens a blocking game dialogue. */
const dragonBanterSeen=new Set();
let dragonBanterQueue=[],dragonBanterActive=null,dragonBanterGap=0,dragonBanterPanel=null;
const DRAGON_PLACE_LINES={
  Millwood:['Your home smells of apples and chimney smoke.','And Nan will notice if either smells singed.'],
  Thornwell:['So many lives beneath these branches. I can almost hear the town thinking.','Please do not repeat anything embarrassing.'],
  Forgewick:['The hammers sound like rain on an iron roof.','Wait until you hear what they charge for repairs.'],
  Forgefalls:['The water has been falling here longer than either of us can remember.','One of us has only had a very short time to forget.'],
  Sandspire:['Keep water for yourself, Corin. Wonder is thirsty work.','I was wondering where the shade went.'],
  Coralmere:['The sea keeps moving, yet never leaves.','You have just described Odo on a fishing day.'],
  Hollybeck:['Come closer if the cold reaches your fingers.','A travelling hearth. Nan would approve of you.'],
  Infernia:['The air tastes of old fires and unfinished anger.','Then let us finish what brought us here.'],
  'Shroom Pass':['Even the path has a talent for growing things.','I would prefer it did not grow more enemies.'],
  Frostcrag:['Even the wind lowers its voice here.','Mine is staying inside my scarf.'],
  Ashcrag:['The stone remembers fire. I can feel it beneath us.','Let us hope it keeps remembering instead of starting again.'],
  Witchmoor:['There is old knowledge here, tangled like roots.','Then we ask politely before touching anything.'],
  Dreadmarsh:['The ground is not as still as it pretends.','Neither will I be if it reaches for my boots.'],
  Sporehollow:['A village growing from the forest itself.','Try not to sneeze on anybody’s roof.'],
  Sporewood:['These spores carry farther than seeds.','I would rather they travelled without my lungs.'],
  'Northern Woods':['Every branch has heard something.','Then perhaps one could tell us where the path went.'],
  'Hollybeck Graveyard':['We should pass gently. These names belonged to people.','I will remember that. Even if something rises.'],
  'Forgewick Temple':['Our shared memory stirs here. Riders once walked these halls.','Then let us leave them fit for someone to walk again.'],
  'Hollybeck Temple':['There is warmth in the memory of this place, beneath all the cold.','We will have to look deeper than the walls.'],
  'Sandspire Temple':['The sand has hidden the doors, but not their purpose.','I would settle for it not hiding the floor.'],
  'Cinderhold Castle':['Halvard has made a cage of something that should have sheltered people.','Then we open it.'],
  Cinderhold:['I am with you, Corin. Not because an old memory tells me to be.','I know. That is why I am still walking.']
};
const DRAGON_ENEMY_LINES={
  skeleton:['No lungs, yet somehow it still sounds angry.','Perhaps it is tired of rattling.'],
  skeleton1:['Those bones have endured more than one ending.','I can arrange another.'],
  skeleton3:['Armour outlives its wearer. Sometimes it forgets to stop walking.','We will remind it.'],
  wraith:['It follows warmth. Yours, I suspect.','For once, being cold might be useful.'],
  mage1:['Watch the hands. The spell begins before the light appears.','A useful warning. Keep those coming.'],
  mage2:['That one is gathering more than a little power.','Then I will give it less than a little time.'],
  devil1:['It has brought its own heat.','How considerate. I was just thinking this fight needed more fire.'],
  devil3:['That flame burns with a particularly bad temper.','Your manners are much better.'],
  boneguard:['Those bones are being held together by something that should have let go.','I will help them come apart.'],
  ent:['That tree is choosing its steps.','I preferred them when they stayed rooted.'],
  ent1:['Its roots are moving before its branches.','I will watch where I put my feet.'],
  ent2:['Old bark can hide a quick temper.','And rather large fists.'],
  eye2:['It has noticed us.','With an eye that size, I would be offended if it hadn’t.'],
  eyePurple:['Do not let its stare draw you still.','Moving. Very much moving.'],
  eyeRed:['That red eye is gathering light.','Let us not be where it sends it.'],
  ghost:['A life has ended here, but something still refuses the silence.','We will give it peace if we can.'],
  ghost3:['There is an old grief beneath that crown.','I see it. I also see the claws.'],
  gnoll1:['It is watching your hands.','Good. It might miss your teeth.'],
  gnoll2:['It keeps shifting its weight.','Then I will not trust the first swing.'],
  gnoll3:['This one has survived other fights.','So have we.'],
  plant1:['Not every flower waits for rain.','That one looks as though it is waiting for lunch.'],
  plant2:['The leaves move against the wind.','I noticed the teeth before the leaves.'],
  plant3:['There is hunger beneath those petals.','I am never weeding Nan’s garden without a sword again.'],
  reptile:['Low to the ground. Watch its first lunge.','You watch the rest of it.'],
  reptile2:['Its scales turn with the light.','I will aim where they meet.'],
  reptile3:['It thinks this stretch of road belongs to it.','We only need to borrow it.'],
  shroomBrown:['That mushroom has decided to travel.','It could have chosen a different direction.'],
  shroomPurple:['Give the spores room.','I was planning to give the whole thing room.'],
  shroomRed:['A bright cap is not an invitation.','Not even if it waves first?'],
  royalguard:['A uniform cannot decide what is right for the person inside it.','Then he still has time to stand aside.']
};
const DRAGON_BOSS_LINES={
  ghost:['There is a grief here that has learned to strike.','Then we keep our guard up, even if we pity it.'],
  ghost3:['That crown has become a prison.','We will break its hold.'],
  golem1:['Stone remembers its orders. We must be more adaptable.','Together, then.'],
  golem2:['The crystal is awake. Keep your eyes on its movement.','I will keep my shield ready too.'],
  golem3:['That guardian has waited longer than this kingdom has stood.','Let us make this its last watch.'],
  golem4:['Something ancient is driving that shell.','Then we break the shell first.'],
  devil:['It wears fire as though fire belongs to it.','You are allowed to disagree.'],
  lich:['That mind has forgotten how to let anything go.','Including us, by the look of it.'],
  knight:['He sees a prize where I see a bond.','He is not taking you.'],
  treasuryknight:['Gold behind him. A choice before him.','I wish he had chosen to move.'],
  kdragon:['Whatever Halvard has made of this, stay beside me.','I am here, Aurelius.']
};
const DRAGON_NPC_THOUGHTS={
  Odo:['He hides kindness beneath a very convincing grumble.','Years of practice. The fish have heard most of it.'],
  Hettie:['She speaks as though she has already decided you are coming home.','Then I had better not disappoint her.'],
  Nan:['She is measuring the danger by how much she loves you.','I know. That makes leaving harder.'],
  Maddock:['He carries more of the past than he says aloud.','I am beginning to understand how heavy that must be.'],
  Sela:['She made protection where another craftsperson might have made a weapon.','I intend to make good use of it.'],
  Dunstan:['He trusts the work of his hands more than grand promises.','So do I, when I am the one wearing the armour.'],
  Toft:['Experience has taught him to prepare for the dark.','We should listen before we go down there.'],
  Maelis:['She chooses each word as carefully as an ingredient.','Then let us hope we are not ingredients.'],
  Wren:['A small gift can carry a long memory.','I will take care of it.'],
  Rowan:['He speaks of the dog as though part of himself has gone missing.','Then we help him find that part.'],
  Iven:['He leaves room for a question instead of closing it with an answer.','You would like the school. From outside.'],
  Elowen:['A written memory can survive the person who tried to forbid it.','We had better read carefully.'],
  Idris:['There is pride in how he speaks of this place.','And every reason to want it protected.'],
  Linna:['Numbers can tell a story people would rather hide.','Especially when the missing things are theirs.'],
  Orin:['He sees someone he remembers when he looks at you.','I hope he can see me as well.'],
  Gwil:['He measures a good day in useful work.','Something we could all stand to learn.'],
  Halvard:['He mistakes being obeyed for being understood.','I understood him. I simply refuse.']
};
function dragonStoryStage(){return wonAll?(cinderSeal?'sealed':'victory'):'journey';}
function dragonConversationReaction(n){
  if(MAPID!=='world'||!dragonIntroDone||!n?.n||n.n.includes('Aurelius'))return;
  const spoken=(n.said||n.d||[]).join(' ').toLowerCase();
  if(!spoken)return;
  const stage=dragonStoryStage();let topic='person',lines;
  if(stage!=='journey'&&/king|halvard|crown|free|celebrat|levy|patrol|rebuild/.test(spoken)){
    topic=/rebuild/.test(spoken)?'rebuilding':'freedom';
    lines=topic==='freedom'?['Listen to how differently they speak now. The fear no longer finishes their sentences.','Let us make sure it stays that way.']:
      ['Defeating Halvard gave them a tomorrow. They still have to live it.','We can help with more than a sword.'];
  }else if(/fishing pole|green arc|catch a fish/.test(spoken)){
    topic='fishing';lines=['I approve of this plan, particularly the part where I eat.','You can practise patience while I practise fishing.'];
  }else if(/glass shield|force field/.test(spoken)){
    topic='shield';lines=['A moment of patience can turn a blow aside.','Remind me before the blow, please.'];
  }else if(/heartstone|bond|rider/.test(spoken)){
    topic='bond';lines=['They can describe our bond. They cannot choose what we make of it.','That part belongs to us.'];
  }else if(/bramble|dog/.test(spoken)&&brambleQuest>=2){
    topic='reunion';lines=['Listen to him now. Worry has made room for ordinary happiness.','Bramble seems to have made room for another scratch behind the ears.'];
  }else if(/missing|lost|bramble|dog/.test(spoken)){
    topic='missing';lines=['That is not a small worry to the person carrying it.','Then we do not treat it like one.'];
  }else if(/king|halvard|levy|royal|soldier|crown/.test(spoken)){
    topic='king';lines=['Fear makes ordinary words sound dangerous.','They should not have to live like this.'];
  }else if(/temple|ruin|dragon|history|book/.test(spoken)){
    topic='memory';lines=['My inherited memories are only one part of the story. We should hear theirs too.','Even when stories disagree, I will keep listening.'];
  }else{
    const person=Object.keys(DRAGON_NPC_THOUGHTS).find(k=>n.n.includes(k));
    if(person)lines=DRAGON_NPC_THOUGHTS[person];
    else if(/food|soup|bread|meal|hungry/.test(spoken)){topic='food';lines=['Mortals speak beautifully about supper.','You have found a subject we can all agree on.'];}
    else if(/mine|dark|lamp|stone/.test(spoken)){topic='depths';lines=['I can still hear you through the bond when you go below.','Good. I would rather not be alone with every echo.'];}
    else if(/home|family|child|mother|father/.test(spoken)){topic='home';lines=['Everyone is protecting a world small enough to call home.','That does not make it any less worth protecting.'];}
    else return;
  }
  queueDragonBanter('npc:'+n.n+':'+stage+':'+topic,lines);
}
function queueDragonBanter(key,lines){
  if(!dragonIntroDone||dragonBanterSeen.has(key)||dragonBanterActive?.key===key||dragonBanterQueue.some(b=>b.key===key)||dragonBanterQueue.length>=6)return;
  dragonBanterQueue.push({key,lines,map:MAPID,stage:dragonStoryStage()});
}
function dragonBossBanter(f,defeated=false){
  if(!f||f.ally||f.huntingArena)return;
  const lines=DRAGON_BOSS_LINES[f.kind];if(!lines)return;
  if(defeated){
    const facing='boss:'+MAPID+':'+f.kind+':'+(f.idx??'story');
    dragonBanterQueue=dragonBanterQueue.filter(b=>b.key!==facing);
    if(dragonBanterActive?.key===facing)dismissDragonBanter();
  }
  const key=(defeated?'victory:':'boss:')+MAPID+':'+f.kind+':'+(f.idx??'story');
  queueDragonBanter(key,defeated?[
    ({knight:'He is beaten. Let him carry the lesson home.',treasuryknight:'The treasure is quiet now. So is its keeper.',devil:'Its fire is fading. Ours is still our own.',lich:'That silence belongs to the living again.',kdragon:'Breathe, Corin. You are still here.'}[f.kind]||'The guardian has fallen. Take a breath before the next door.'),
    ({knight:'As long as he leaves you out of his story.',treasuryknight:'Let us see what he was guarding.',devil:'I prefer yours.',lich:'Then let us not waste it.',kdragon:'So are you. That matters more.'}[f.kind]||'Only if you take one with me.')
  ]:lines);
}
function dismissDragonBanter(){
  if(!dragonBanterActive)return false;
  dragonBanterActive=null;dragonBanterGap=5;
  if(dragonBanterPanel)dragonBanterPanel.hidden=true;
  return true;
}
function resetDragonBanter(seen=[]){
  dragonBanterSeen.clear();for(const key of seen)if(typeof key==='string')dragonBanterSeen.add(key);
  dragonBanterQueue=[];dismissDragonBanter();
}
function stepDragonBanter(dt){
  const paused=!!(!dragonIntroDone||!hasDragon()||!dragonHere()||fishing||mode!=='play'||sceneHold()||sayNpc||ovl||ask||bagOpen||atlasOpen||editing||fadeDir||doorMotion||deadShown);
  if(dragonBanterPanel)dragonBanterPanel.hidden=paused||!dragonBanterActive;
  if(dragonBanterActive&&(dragonBanterActive.map!==MAPID||dragonBanterActive.stage!==dragonStoryStage()))dismissDragonBanter();
  dragonBanterQueue=dragonBanterQueue.filter(b=>b.map===MAPID&&b.stage===dragonStoryStage());
  if(paused)return;
  const place=MAPID==='world'?areaUnder(P.x,P.y):(MD.title||MAPID);
  const title=MAPID==='world'?(DRAGON_PLACE_LINES[place]?place:null):Object.keys(DRAGON_PLACE_LINES).sort((a,b)=>b.length-a.length).find(k=>place?.includes(k));
  if(title){
    const stage=dragonStoryStage();
    const lines=stage==='journey'?DRAGON_PLACE_LINES[title]:
      /Temple|Cinderhold/.test(title)?['The danger has passed, but this place still has a history to reckon with.','We will not let Halvard be the last thing it remembers.']:
      ['There is a different feeling in '+title+' now. People are making plans.','That is what we wanted them to have. A future.'];
    queueDragonBanter('place:'+title+':'+stage,lines);
  }
  for(const f of foes){
    if(f.ally||f.huntingArena||f.st==='dead'||f.hp<=0||Math.hypot(f.x-P.x,f.y-P.y)>180)continue;
    if(DRAGON_BOSS_LINES[f.kind])dragonBossBanter(f);
    else if(!dragonBanterSeen.has('enemy:'+f.kind)){
      const lines=DRAGON_ENEMY_LINES[f.kind]||['Something unfamiliar ahead. Let us learn before we rush.','I am watching it. Stay close.'];
      queueDragonBanter('enemy:'+f.kind,lines);
    }
  }
  if(wonAll)queueDragonBanter('story:halvard-fallen',['No crown can command what we are to each other.','Then let us find out what we can be without him.']);
  if(cinderSeal)queueDragonBanter('story:seal',['This seal is a promise of another trial. Victory has not finished teaching us.','Then we finish what we came to do.']);
  if(dragonBanterActive){dragonBanterActive.time-=dt;if(dragonBanterActive.time<=0)dismissDragonBanter();return;}
  dragonBanterGap=Math.max(0,dragonBanterGap-dt);
  if(dragonBanterGap||!dragonBanterQueue.length)return;
  dragonBanterActive={...dragonBanterQueue.shift(),time:11};
  dragonBanterSeen.add(dragonBanterActive.key);
  if(!dragonBanterPanel){
    dragonBanterPanel=document.createElement('div');dragonBanterPanel.id='dragonBanter';
    dragonBanterPanel.setAttribute('role','status');dragonBanterPanel.setAttribute('aria-live','polite');
    dragonBanterPanel.style.cssText='position:fixed;top:75px;left:50%;transform:translateX(-50%);width:min(420px,85vw);box-sizing:border-box;padding:10px 14px;background:rgba(17,22,34,.91);border:1px solid #9baed0;border-radius:8px;color:#edf1ff;font:14px/1.45 Georgia,serif;z-index:35;pointer-events:none;white-space:pre-line';
    document.body.appendChild(dragonBanterPanel);
  }
  dragonBanterPanel.textContent=DRAGON_NAME+' · in your mind\n'+dragonBanterActive.lines[0]+'\nCorin: '+dragonBanterActive.lines[1]+'\n[A] dismiss';
  dragonBanterPanel.hidden=false;
}

// Deliberate conversations use the game's regular topic menu and dialogue controls.
// Their answers are built when selected, so saved quest progress stays authoritative.
const DRAGON_LONG_TALKS={
  consciousness:[
    'Corin: When you say dragons share a consciousness, is somebody else thinking for you?',
    'Aurelius (mind): No. Imagine waking in a library where you understand the language of every book. The reading is yours. So are the questions.',
    'Corin: And every dragon leaves a book there?',
    'Aurelius (mind): Impressions, knowledge, memories. Not tidy books with dates on their spines. Some things arrive as feelings before I understand their words.',
    'Corin: That sounds rather inconvenient.',
    'Aurelius (mind): It is how I knew what rain was before a drop touched me. Knowing did not tell me how this rain would feel on my own scales.',
    'Corin: So there are still first times for you.',
    'Aurelius (mind): Every day. An inherited memory cannot walk this road for me. It certainly cannot tell me what you will say next.',
    'Corin: I was going to ask whether you are hungry.',
    'Aurelius (mind): Some mysteries are easier than others.'
  ],
  choosing:[
    'Corin: Maddock said dragons chose their riders. Why did you choose me?',
    'Aurelius (mind): You found something you did not understand, and carried it to someone who might help. You did not break it open to see whether it was valuable.',
    'Corin: It was an egg. I thought that would be rather cruel.',
    'Aurelius (mind): You say that as though everyone would agree. That is part of my answer.',
    'Corin: I am still a miller’s son. I have never led anyone anywhere.',
    'Aurelius (mind): A rider is a companion, Corin. Not a person made taller by sitting above another living thing.',
    'Corin: And if I make the wrong choice?',
    'Aurelius (mind): I will tell you. You may do the same for me. A bond without disagreement would be a very lonely kind of obedience.',
    'Corin: You have made an unusually complicated choice of rider.',
    'Aurelius (mind): I have made an interesting one.'
  ],
  heartstones:()=>[
    'Corin: Tell me about the stone from your shell.',
    'Aurelius (mind): A heartstone joins a rider’s intent to a dragon’s power. You carry it; I answer. It is a connection, not a leash.',
    'Corin: Then gathering them makes us stronger together?',
    'Aurelius (mind): Yes. Fire was with us at the beginning. Lightning, shadow and ice each open another way to meet what lies ahead.',
    heartKnown?'Corin: Alderic said the stones came from the first dragon.':'Corin: Maddock thought the old temples might have answers.',
    heartKnown?'Aurelius (mind): That account lives in our shared memory too. Something ancient was divided into powers that could be carried. The knowledge deserves care.':'Aurelius (mind): Then we should listen to the keepers who have waited there. An inherited memory is no excuse to ignore a living witness.',
    'Corin: Could I order you to use them?',
    'Aurelius (mind): You can ask. You should also listen. Power that cannot hear an answer becomes the sort of power we are resisting.',
    'Corin: I would rather have you than a collection of weapons.',
    'Aurelius (mind): Good. Weapons make poor conversation.'
  ],
  wingfall:()=>[
    'Corin: What was Wingfall?',
    'Aurelius (mind): Before it, seven Dragonriders kept the peace in Emberfell. Halvard was one of them. Fifty years ago, he turned on the other six and took the throne.',
    'Corin: One of their own. They must have trusted him.',
    'Aurelius (mind): Betrayal needs something to break. Trust was not their foolishness; breaking it was his choice.',
    'Corin: Why do people tell different stories about it?',
    'Aurelius (mind): A ruler can punish a witness and pay a writer. Over time, a frightened silence can look like agreement.',
    'Corin: But some of the old accounts survived.',
    'Aurelius (mind): Thornwell’s school keeps histories. Ask questions there. Compare what people preserved with what they were ordered to repeat.',
    wonAll?'Corin: Now his rule has ended. We can make the truth easier to tell.':'Corin: He cannot have every copy, every song, every memory.',
    'Aurelius (mind): No. And we should protect those things as carefully as we protect each other.'
  ],
  land:()=>[
    'Corin: What does your memory tell you about Emberfell?',
    'Aurelius (mind): That a land is more than the borders a ruler draws. Millwood’s fields, Forgewick’s furnaces, the coast at Coralmere: each depends on people beyond its own horizon.',
    'Corin: It does not always feel that way on the roads.',
    'Aurelius (mind): Fear narrows the world. A family begins by guarding its door, and ends by wondering whether every stranger is an enemy.',
    'Corin: There are places that seem older than all of this.',
    'Aurelius (mind): The rider temples near Forgewick, Sandspire and Hollybeck stood before Wingfall. The kingdom’s troubles are a chapter in their story, not its beginning.',
    'Corin: And Sporehollow?',
    'Aurelius (mind): A reminder that your way of living is not the only one. Approach another people’s home with curiosity before certainty.',
    wonAll?'Corin: Perhaps the roads can start connecting people again.':'Corin: I would like people to travel because they want to, rather than because they have to flee.',
    'Aurelius (mind): Then that is a worthy future to work toward.'
  ],
  halvard:()=>wonAll?[
    'Corin: I keep expecting to hear that Halvard has sent someone after us.',
    'Aurelius (mind): Your body learned to listen for danger. It may take longer than a battle to learn the silence that follows.',
    'Corin: People call us heroes. I mostly remember being frightened.',
    'Aurelius (mind): Courage did not require you to enjoy any of it.',
    'Corin: What do we owe them now?',
    'Aurelius (mind): The truth. Help where we can give it. And the humility to let them decide what their lives should become.',
    'Corin: No throne for a miller’s son?',
    'Aurelius (mind): You already complain about sitting still. Let us begin by visiting the people who helped us.'
  ]:[
    'Corin: Why would Halvard fear a dragon that has only just hatched?',
    'Aurelius (mind): Because I chose someone without asking his permission. A bond freely given is a thing he cannot manufacture by decree.',
    'Corin: Maddock thinks he will take you, or kill us both.',
    'Aurelius (mind): Then we must prepare. Being right will not turn aside a blade. Friends, equipment and the heartstones can help us reach him alive.',
    'Corin: Do you hate him?',
    'Aurelius (mind): I oppose what he does. I do not need hatred to know that people should be safe from him.',
    'Corin: I do not want to become someone who solves everything with a sword.',
    'Aurelius (mind): Keep asking that question. It is a good defence against becoming comfortable with power.'
  ],
  travelling:[
    'Corin: Run me through travelling together again.',
    'Aurelius (mind): Open COMMAND and choose Mount to climb onto my back. Choose Dismount there when you want your own feet on the ground.',
    'Corin: And flying?',
    'Aurelius (mind): COMMAND also has Take off and Land. Use your movement controls to guide us. We should come down when you need to speak to people or examine something closely.',
    'Corin: You do not fit through every doorway.',
    'Aurelius (mind): I can accompany you into Cinderhold and the temples. At houses, taverns, the school and other interiors, I will wait outside.',
    'Corin: Sensible. I would never hear the end of it if you broke Nan’s door.',
    'Aurelius (mind): Nor would you hear the end of it from me if you called that getting stuck a tactical decision.'
  ],
  battle:[
    'Corin: How do we fight as partners?',
    'Aurelius (mind): Watch what the enemy is preparing. Its windup tells you more than its noise. Keep room to move, and ask for an attack when it can matter.',
    'Corin: You cannot breathe fire constantly.',
    'Aurelius (mind): No. Each breath needs time to recover; the attack menu shows when it is ready. Slash gives us another way to strike nearby.',
    'Corin: And the heartstones give us more choices.',
    'Aurelius (mind): More choices, not a reason to stop thinking. A powerful attack aimed at empty ground is merely an impressive mistake.',
    'Corin: I feel that last remark was directed at me.',
    'Aurelius (mind): It was directed at empty ground. You happened to be standing beside it.'
  ],
  care:()=>[
    'Corin: What should I do when you are hurt?',
    'Aurelius (mind): Give me food before we face the next danger. Meat and fish help me recover. Open ITEMS to feed me what you are carrying.',
    'Corin: And if you cannot get up?',
    'Aurelius (mind): Come close and press A with meat or fish in your supplies. I will need your help then.',
    fishingPole?'Corin: Odo’s fishing pole should keep us supplied.':'Corin: We should ask Odo about fishing when he has gone home to Millwood.',
    'Aurelius (mind): Yes. Looking after each other is part of the journey, not an interruption to it.',
    'Corin: You have made eating sound very noble.',
    'Aurelius (mind): I have a gift for explaining important things.'
  ],
  self:[
    'Corin: What do you want, Aurelius? Apart from supper.',
    'Aurelius (mind): To learn which parts of the world I love for myself. To see a place my inherited memories describe and discover what they missed.',
    'Corin: Such as?',
    'Aurelius (mind): The smell of bread at a particular door. Whether snow is worth getting cold for. What makes you laugh when you have forgotten to be worried.',
    'Corin: Those are rather small things for a dragon.',
    'Aurelius (mind): Only if you measure them by size. What do you want?',
    'Corin: To come home without bringing danger to everyone there.',
    'Aurelius (mind): Then I would like to see that day with you.',
    'Corin: And after that?',
    'Aurelius (mind): We can have the luxury of deciding after that.'
  ]
};
function dragonCurrentQuest(){
  if(wonAll)return [
    'Corin: Where should we go now?',
    'Aurelius (mind): Halvard is defeated. We can return to the people who helped us and hear what freedom has changed for them.',
    'Corin: We still have unfinished business in places.',
    !cinderSeal?'Aurelius (mind): Return to Maelis in Witchmoor. With the king gone, a keeper of old trials has answered her circle. Speak with the demon there when you are ready.':
      !trialSealPlaced?'Aurelius (mind): You carry the Cinderhold Seal. The seal chamber adjoining the throne room is where it belongs.':
      'Aurelius (mind): The seal is placed. The demon’s trials remain a challenge we can return to when we choose.',
    'Corin: And the ordinary things?',
    'Aurelius (mind): They matter as much as ever. Missing companions, a useful gift, a promise to return. A victory does not make those things smaller.'
  ];
  const missing=[['lightning','Forgewick'],['shadow','Hollybeck'],['ice','Sandspire']].filter(([key])=>!breathHas[key]);
  return [
    'Corin: Help me put our next steps in order.',
    'Aurelius (mind): Halvard threatens us and everyone living under his rule. Our goal is to reach Cinderhold ready to face him.',
    !smithUpgrade?'Aurelius (mind): First, Dunstan in Forgewick can improve Maddock’s blade and fit you with armour. Good equipment is a sensible beginning.':'Aurelius (mind): Dunstan’s work has given you a stronger blade and armour. Keep supplies ready as well.',
    'Corin: And the heartstones?',
    missing.length?'Aurelius (mind): We have more to discover in the old temples near '+missing.map(([,town])=>town).join(', ')+'. Their keepers and chambers hold the powers we have not found.':'Aurelius (mind): Fire, lightning, shadow and ice are all with us now. The heartstones have given us the choices we came looking for.',
    'Corin: Does that mean we must hurry?',
    'Aurelius (mind): Prepare, then move with purpose. Ask people what they need, look through the side paths, and do not mistake being tired for being ready.'
  ];
}
function dragonSideQuest(topic){
  if(topic==='fishing')return fishingPole?[
    'Corin: How are our provisions looking?',
    'Aurelius (mind): Odo has already given you the pole. Face water and press A to fish, then stop the marker in the green arc.',
    'Corin: The fish do not always cooperate.',
    'Aurelius (mind): They have a different opinion about supper. Keep the catch in our supplies and feed me through ITEMS when I need to recover.',
    'Corin: You could offer to do the patient part.',
    'Aurelius (mind): I am patiently waiting to be fed.'
  ]:[
    'Corin: We could use a steadier supply of food for you.',
    'Aurelius (mind): Odo knows the water around Millwood. Now that he has left his old spot and returned home, speak to him there.',
    'Corin: He might lend me a fishing pole.',
    'Aurelius (mind): Ask him. People sometimes disguise useful gifts as complaints.',
    'Corin: Then Odo must be the most generous man in Emberfell.',
    'Aurelius (mind): I will reserve judgement until we see the fish.'
  ];
  if(topic==='bramble')return brambleQuest>=2?[
    'Corin: We got Bramble back to Rowan.',
    'Aurelius (mind): And you can still visit them outside their Thornwell home. Helping someone need not end the friendship.',
    'Corin: Bramble is unusually good company after a hard road.',
    'Aurelius (mind): Scratch his ears when you see him. Some kinds of healing do not come in bottles.',
    'Corin: Are you jealous?',
    'Aurelius (mind): I am considering whether I need a pair of ears.'
  ]:[
    'Corin: Is there someone nearby who could use our help?',
    brambleQuest===1?'Aurelius (mind): Bramble is travelling with us. His person, Rowan the Hunter, is in Thornwell’s tavern. Bring him there.':'Aurelius (mind): Look for Bramble on the road near Thornwell. A friendly dog far from his person is worth stopping for.',
    'Corin: I suppose he cannot tell me his address.',
    'Aurelius (mind): Townspeople may know who is looking for him. A question can be more useful than another mile of guessing.',
    'Corin: You will wait while I go into the tavern?',
    'Aurelius (mind): Of course. I would hate to stand on the dog.'
  ];
  if(topic==='equipment')return [
    'Corin: What could make our equipment better?',
    smithUpgrade?'Aurelius (mind): Dunstan has already strengthened your blade and armour. That work is done.':'Aurelius (mind): Visit Dunstan, the blacksmith in Forgewick. Maddock’s blade gives him something to work with.',
    glassShield?'Corin: And Sela’s Glass Shield is already with us.':'Corin: What about protecting myself?',
    glassShield?'Aurelius (mind): Hold B during battle to raise its field. A shield is useful only if you remember to use it.':'Aurelius (mind): Speak with Sela in Forgewick. Her glasswork can offer a kind of protection ordinary metal cannot.',
    'Corin: Anything else?',
    'Aurelius (mind): Keep talking to craftspeople and travellers. Not every helpful thing waits in a chest behind a monster.'
  ];
  const remaining=Object.values(W.maps).flatMap(map=>(map.npcs||[]).map(n=>({n,map}))).filter(({n})=>n.charm&&!charm[n.charm]&&n.charm!=='edge');
  const unique=remaining.filter((v,i,a)=>a.findIndex(q=>q.n.charm===v.n.charm)===i).slice(0,3);
  return [
    'Corin: Are there other useful things we have missed?',
    'Aurelius (mind): Small gifts can change a long journey. We should look for people with knowledge to share, not only things to sell.',
    ...unique.map(({n,map})=>'Aurelius (mind): '+n.n+(map.title&&map.title!=='Emberfell'&&map!==W.maps.world?' in '+map.title:'')+' may have something to offer. Speak with them when our path takes us there.'),
    ...(!unique.length?['Aurelius (mind): You have gathered the known gifts I would have suggested. That is a good reason to thank their keepers, rather than keep asking for more.']:[]),
    'Corin: Does your shared memory tell you what everyone is carrying?',
    'Aurelius (mind): No. Think of these as leads worth following. The people themselves will tell you what their gifts mean.'
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
  ask={quick:1,dragonConversation:true,back:category==='root'?null:()=>openDragonConversation(),opts:[{n:DRAGON_NAME+' · in your mind',head:true},...options[category],...(category==='root'?[]:[{n:'Back to our other questions',go:()=>openDragonConversation()}])]};
  askPick=1;askDraw();
}
