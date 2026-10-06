/* Aurelius's optional exchanges use the same authored branches as residents. */
const DialogueRenewalDragon=(()=>{
 const actor=()=>({...dragon,n:'Aurelius'});
 function guide(){
  const n=actor(),current=atlasJourneyObjective(),missing=[['lightning','Forgewick'],['ice','Sandspire'],['shadow','Hollybeck']].filter(([k])=>!breathHas[k]);
  const opening=wonAll?'Halvard is defeated. We can choose our journey now, including returning home. Unfinished errands remain ours to accept, not a king’s orders.':
   current?.detail||(!missing.length?'All three temple Heartstones are ours. Reach Frostcrag, cross the mountain passage east into Ashcrag, then follow the volcanic road toward Cinderhold.':
   'Our next unclaimed temple Heartstone is in '+missing[0][1]+'. We should prepare for that sanctuary before trying to continue east.');
  return DialogueRenewal.lead(n,'plan','Putting our next steps in order',opening,
   ['What should we check before leaving?','Your health, my food, healing supplies, and which quest is tracked. A minute here can prevent a difficult return.'],
   ['Can we stop to help other people?','Yes. Ask what they need and decide what we can manage. The main journey need not make us deaf to everyone beside it.'],
   ['I need a little more time.','Then take it. I would rather leave with you prepared than carry you forward while you pretend you are.']);
 }
 function leads(){
  const n=actor(),make=(...a)=>DialogueRenewal.lead(n,...a),result=[];
  for(const t of dragonSideQuestTopics()){
   if(t.id==='fishing')result.push(make('fishing','A reliable supper',fishingPole?
    'Calder’s rod gives us another way to gather food. Face water and press A; keep the catch for when I need to recover.':
    'Odo’s grandson Calder keeps the first camp on the road to Thornwell. We can ask about his spare fishing rod there.',
    ['What happens after the cast?','Hook when the float dips. Hold to reel, then release during a lunge so the line can survive the fight.'],
    ['Do you mind waiting while I fish?','I can manage waiting for someone to obtain my supper. I reserve the right to look hopeful.'],
    ['How do I feed you afterward?','Use the fish or meat in Items. Prepared food is useful too.']));
   if(t.id==='bramble')result.push(make('bramble','Bramble and his home',brambleQuest>=2?
    'Bramble has been reunited with Rowan. Visiting them again could be an ordinary pleasure rather than another search.':
    dragonLearned('bramble-owner')?'We learned that Rowan owns Bramble. Find the hunter at the Copper Cup in northern Thornwell.':
    'The dog has joined us, but we still need to find his person. Ask people in Thornwell who recognises him.',
    ['Should we leave him somewhere safe?','While he needs his owner, keep him following us until we find the right person. An empty doorstep is not a reunion.'],
    ['He seems very trusting.','Then let us be worthy of the inconvenience. He did not choose to be lost.'],
    ['I like having him around.','So do I. Someone at home probably feels that more strongly.']));
   if(t.id==='equipment')result.push(make('equipment','Our equipment',smithUpgrade?
    'Dunstan improved your sword and armour. Equipment still needs you to avoid blows rather than simply tolerate them.':
    'Dunstan in Forgewick can help with your sword and armour. Ask him directly when we reach his smithy.',
    ['And the Glass Shield?',glassShield?'Hold B during battle to raise its field. It does not block while merely carried.':dragonLearned('shield')?'Dunstan referred us to Sela in Sandspire. Go through the northwest glass shop to the workshop at the back.':'We have not been given its proper lead yet. Ask Dunstan about other protection.'],
    ['Will better armour make fighting easy?','Easier to survive, perhaps. I would still prefer your feet to your armour as the first defence.'],
    ['I should check my charms too.','Yes. A charm in the Bag needs to be equipped unless it is a carried key item or relic.']));
   if(t.id==='lantern')result.push(make('lantern','Seeing into the mine',charm.lamp?
    'The Hollybeck Lantern is with us. Its light reveals things ordinary lamps miss in the deep galleries.':
    'We heard that Sverre in Hollybeck keeps Torvald’s lantern. Speak with him before returning to the dark mine galleries.',
    ['Can your fire replace it?','Not for what the special lantern reveals. We should carry the right light.'],
    ['Does the lantern need a charm slot?','No. Its place is among the carried key items.'],
    ['What do we do at the bottom?','Clear the mushroom creatures from the deepest chamber and search it once the fighting is finished.']));
   if(t.id==='graveyard')result.push(make('graveyard','The graveyard and its book',charm.wake?
    'The Book of the Dead lets you use Summon for two wraith allies. It does not occupy an equipped charm slot.':
    'The graveyard northwest of Hollybeck holds the Book of the Dead. Every wave of ghosts must be defeated before the reward is yours.',
    ['Should we prepare for several fights?','Yes. One cleared wave does not finish the encounter.'],
    ['What does the book actually grant?','The Summon ability, calling two wraiths to fight alongside us.'],
    ['Can we leave that for later?','Certainly. Knowing about a dangerous place is not a promise to enter it today.']));
   if(t.id==='gifts')result.push(make('gifts','Using what people gave us',
    'A charm needs to be equipped before its effect helps us. The Bag shows what we carry and what we are wearing.',
    ['What about the lantern and book?','Those are carried key items. They do not compete for a charm slot.'],
    ['And the boss relics?','Their benefits work while carried. We still need to open the reward chest after winning the fight.'],
    ['People have helped us a great deal.','Yes. When we return, I would like to hear about their lives as well as their gifts.']));
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
   {n:'Our next step',category:'lead',friendship:false,go:()=>speak(guide())},
   ...(leads().length?[{n:'The leads we know',category:'folder',navigation:true,go:()=>openDragonConversation('leads')}]:[])
  ]:(category==='leads'?leads():p.topics.map((r,i)=>({...DialogueRenewal.topic(n,r,i),group:r.title.split(' / ')[0]})).filter(t=>t.group===category))
   .map(t=>({n:t.title,category:t.category,friendship:t.friendship!==false,friendshipId:t.friendshipId,go:()=>speak(t)}));
  ask={quick:1,dragonConversation:true,npcActor:n,topicScope:category,back:category==='root'?null:()=>openDragonConversation(),
   opts:[{n:'Aurelius',head:true},...options,{n:'Let’s move on',go:null}]};askPick=1;askDraw();return true;
 }
 return {open,guide,leads};
})();
