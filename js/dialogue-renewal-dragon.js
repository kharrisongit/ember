/* Aurelius's optional exchanges use the same authored branches as residents. */
const DialogueRenewalDragon=(()=>{
 const actor=()=>({...dragon,n:'Aurelius'});
 function guide(){
  const n=actor();
  const opening=wonAll?'I keep expecting someone to tell us where we must go. Nobody has. Shall we try making a plan because we want to?':
   !dragonIntroDone?'We should talk about the Heartstones before we choose our road. There is quite a lot I need to tell you.':
   nanGiftPending()?'See Nan before we leave Millwood. You would spend the whole road wishing you had.':
   brambleQuest===1?'Bramble still needs his person. Ask in Thornwell; when you learn who owns him, take him all the way back.':
   !breathHas.lightning?'Forgewick first, east through Thornwell. Dunstan can improve your equipment; the temple south of town holds Lightning.':
   !breathHas.ice?'Sandspire Temple is next. We need Ice from its guardian’s chest. Take the temple approach southeast of Sandspire when we are ready.':
   !breathHas.shadow?'Hollybeck Temple, northeast of town. Shadow is the last of the three temple Heartstones.':
   'North to Frostcrag, east through its mountain passage into Ashcrag, then the volcanic road to Cinderhold. We have the stones. Now we must reach him.';
  return DialogueRenewal.lead(n,'plan','Deciding where the morning goes',opening,
   ['Have we forgotten anything practical?','Healing supplies for you, food for me. Check your health and the quest you have marked. I would rather remember something here.'],
   ['What about the people asking for help?','We can listen. Then decide what we can do. I do not want us to become so busy saving the kingdom that we stop noticing who lives in it.'],
   ['I am not ready to leave yet.','All right. We will sit for a moment. You do not need to invent an errand to ask for that.']);
 }
 function leads(){
  const n=actor(),make=(...a)=>DialogueRenewal.lead(n,...a),result=[];
  for(const t of dragonSideQuestTopics()){
   if(t.id==='fishing')result.push(make('fishing','The possibility of fresh fish',fishingPole?
    'We have Calder’s rod. A patch of safe riverbank, you facing the water, and A to begin. I am available to encourage you from a respectful distance.':
    'Calder is at the first camp east toward Thornwell. Odo said his grandson has a spare rod. We should ask before my appetite becomes your entire occupation.',
    ['Will you remember the instructions?','Wait for the float to dip, hook the fish, then hold to reel. Release during the lunges. I shall try not to shout advice.'],
    ['A respectful distance?','Far enough that my shadow does not warn the fish. Close enough to admire the catch.'],
    ['And the fish goes in Items?','Yes. Feed me fish or meat from there when I need it. Cooked food helps too.']));
   if(t.id==='bramble')result.push(make('bramble','A dog with somewhere to be',brambleQuest>=2?
    'Bramble is with Rowan again. We ought to visit without needing to solve anything. I would like to see him simply being a dog.':
    dragonLearned('bramble-owner')?'Rowan the Hunter. The Copper Cup, northern Thornwell. We have a person and a place now; take Bramble inside and find him.':
    'He follows you as though you know exactly where to go. Ask around Thornwell before he discovers how much of this is hope.',
    ['Could someone else look after him?','His owner is the person we need. Keep him with us until we find them.'],
    ['He does seem happy with us.','Good. Being lost need not be miserable every moment of the way.'],
    ['I shall miss him afterward.','Then return him to someone we can visit. That seems a fair arrangement.']));
   if(t.id==='equipment')result.push(make('equipment','What stands between us and a blade',smithUpgrade?
    'Dunstan’s work is done. Your sword and armour are better, although I remain fond of you moving out of the way.':
    'Find Dunstan’s smithy in Forgewick. He can work on your sword and fit better armour. It is a visit worth making before the next difficult road.',
    ['Should we ask about a shield?',glassShield?'We have Sela’s Glass Shield. Hold B in combat to raise the field; the glass alone is not the protection.':dragonLearned('shield')?'Dunstan sent us to Sela. Northwest Sandspire, through the glass shop into the rear workshop.':'Ask Dunstan what other protection he recommends. We do not yet have a proper lead.'],
    ['You worry about the armour.','About what is inside it, mostly. The armour itself seems quite sturdy.'],
    ['Let me check what we are wearing.','Open the Bag. Ordinary charms must be equipped; key items and boss relics work while carried.']));
   if(t.id==='lantern')result.push(make('lantern','The right light underground',charm.lamp?
    'Torvald’s Hollybeck Lantern is in our keeping. Now we can see what ordinary lamps miss in the deep mine galleries.':
    'Sverre in Hollybeck has Torvald’s lantern. Let us collect it before you try to persuade darkness to become a floor.',
    ['Could you breathe fire instead?','I can light a place. This lantern reveals things my fire cannot. I would rather admit that above ground.'],
    ['Do I equip it?','No. Carry it as a key item and use your charm slot for something else.'],
    ['What waits in the deepest part?','Mushroom creatures. Clear the chamber before searching it, preferably with enough light to see both.']));
   if(t.id==='graveyard')result.push(make('graveyard','A book with difficult company',charm.wake?
    'The Book of the Dead gives you Summon. Two wraiths will fight beside us, and the book takes no charm slot.':
    'Northwest of Hollybeck, the graveyard holds the Book of the Dead. We have to clear every wave of ghosts before we can take it.',
    ['We should carry extra healing.','Yes. Finishing one wave will not finish the graveyard.'],
    ['What are we going there to obtain?','Summon: two wraith allies. The book grants it while carried.'],
    ['I would like to postpone that visit.','So would I, until we are ready. A map marker can be patient.']));
   if(t.id==='gifts')result.push(make('gifts','Making room in the bag',
    'We should look through what people have given us. A charm buried in the Bag will not help until you equip it.',
    ['The book and lantern too?','Those are key items. Carry them; leave your charm slots free.'],
    ['How do the boss relics work?','Their benefits stay active while carried. But defeat alone is not enough: remember to open the reward chest.'],
    ['I wish I knew how to thank everyone.','Perhaps we could start by coming back alive, then spend an afternoon finding better words.']));
  }
  return result;
 }
 function open(category='root'){
  if(!dragonCanConverse())return false;
  rememberDragonConversationPlace();dismissDragonBanter();P.moving=false;P.act=null;dragon.moving=false;faceCorinAt(dragon.x,dragon.y);
  const n=actor(),p=DialogueRenewal.cast.Aurelius,groups=[...new Set(p.topics.map(t=>t.title.split(' / ')[0]))];
  const speak=t=>{askShut();playScene(t.lines,{who:'Aurelius',npcActor:n,telepathy:true,
   after:()=>openDragonConversation(category),conversationReplies:{topic:t,handled:new Set()}});};
  const options=category==='root'?[
   ...groups.map(g=>({n:g,navigation:true,category:'folder',go:()=>openDragonConversation(g)})),
   {n:"Making a plan",opening:"What do you think we should do next?",category:'lead',friendship:false,go:()=>speak(guide())},
   ...(leads().length?[{n:"Things we meant to follow up",category:'folder',navigation:true,go:()=>openDragonConversation('leads')}]:[])
  ]:(category==='leads'?leads():p.topics.map((r,i)=>({...DialogueRenewal.topic(n,r,i),group:r.title.split(' / ')[0]})).filter(t=>t.group===category))
   .map(t=>({n:t.title,opening:t.opening,category:t.category,friendship:t.friendship!==false,friendshipId:t.friendshipId,go:()=>speak(t)}));
  ask={quick:1,dragonConversation:true,npcActor:n,topicScope:category,back:category==='root'?null:()=>openDragonConversation(),
   opts:[{n:'Aurelius',head:true},...options,{n:"Ready when you are",go:null}]};askPick=1;askDraw();return true;
 }
 return {open,guide,leads};
})();
