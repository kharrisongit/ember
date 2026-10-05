/* The atlas follows saved story/knowledge state; it never advances a quest. */
let atlasTrackedQuest='main',atlasQuests=[],atlasPan={x:0,y:0,z:1.6},atlasPointers=new Map();
let atlasPanFrame=0,atlasPanScale=null,atlasViewBounds=null;
let atlasGesture=null,atlasJournalKnown={},atlasIgnoreClick=false,atlasCompassTutorialSeen=false;
let atlasJournalOpen=false,atlasSelectedQuest='main',atlasSelectedComplete=false;
function atlasQuestKind(q){return ['main','highland-passage','bramble','smith','shield','thornwell-royals'].includes(q?.id)||q?.id?.startsWith('temple:')?'main':q?.id==='trials'?'trial':'side';}
function atlasQuestTrackLock(q){
 if(q?.id==='trials'&&!wonAll)return 'Defeat King Halvard before seeking the keeper of trials in Witchmoor.';
 const desert=['pyramid','desert-church','sky-blessing','shield','gift:brand'].includes(q?.id);
 const winter=['winter-rescue','frosthorn','soulwing','graveyard','gift:lamp','gift:ward'].includes(q?.id)||q?.id==='deep-mines'&&!charm.lamp&&dragonLearned('lantern');
 if(!wonAll&&(desert||winter)&&(!breathHas.lightning||!smithUpgrade||!charm.edge))return 'Prepare with Dunstan in Forgewick and claim the Lightning Heartstone to open the road into the desert.';
 if(!wonAll&&winter&&!breathHas.ice)return 'Claim the Ice Heartstone in Sandspire, then travel through Coralmere to Hollybeck.';

 if(q?.id==='temple:Sandspire'&&!breathHas.lightning)return 'Complete Forgewick Temple and claim its Lightning Heartstone before tracking Sandspire Temple.';
 if(q?.id==='temple:Hollybeck'&&!breathHas.ice)return 'Complete Sandspire Temple and claim its Ice Heartstone before tracking Hollybeck Temple.';
 return '';
}
function atlasJournalAllowed(id){return ['sky-blessing','soulwing','deep-mines','highland-passage','winter-rescue','frosthorn','desert-church','pyramid','main','bramble','smith','shield','thornwell-royals','graveyard','gift:lamp','trials','temple:Forgewick','temple:Sandspire','temple:Hollybeck'].includes(id)||id==='fishing'&&odoRodReferral||['gift:ward','gift:spore','gift:twin','gift:brand'].includes(id);}
function atlasObjective(id,title,place,detail){return {id,title,place,detail};}
function atlasBrambleClue(){return dragonLearned('bramble-owner')?'Bring Bramble to Rowan the Hunter in the Copper Cup tavern.':'Ask the people of Thornwell who the friendly dog belongs to.';}
// Arrival is saved separately from map discovery: hearing a place name is not a visit.
let atlasJourneyVisits=new Set();
const ATLAS_TEMPLE_JOURNEYS={
 Forgewick:{element:'lightning',entry:'tp1',prefix:'tp',stone:'Lightning',road:'Follow the eastern road from Thornwell through Forgefalls to Forgewick.',trail:'Follow the trail southeast of Forgewick to the temple entrance.'},
 Sandspire:{element:'ice',entry:'ds1',prefix:'ds',stone:'Ice',road:'Leave Forgewick by the eastern road and cross the desert past the Oasis to Sandspire.',trail:'Follow the winding trail southeast from Sandspire to its temple.'},
 Hollybeck:{element:'shadow',entry:'sn1',prefix:'sn',stone:'Shadow',road:'Leave Sandspire along the eastern road to Coralmere, then follow the road through the wetlands into snowy Hollybeck.',trail:'Follow the temple trail east and then north from Hollybeck.'}
};
function atlasRememberJourneyVisits(){
 for(const [town,t]of Object.entries(ATLAS_TEMPLE_JOURNEYS)){
  if(MD&&dragonKnowsPlace(town))atlasJourneyVisits.add(town);
  if(W.maps[MAPID]?.title===town+' Temple'||Object.keys(bossGone).some(k=>k.startsWith(t.prefix)&&bossGone[k])||breathHas[t.element]){
   atlasJourneyVisits.add(town);atlasJourneyVisits.add(town+' Temple');
  }
 }
}
function atlasTempleGuardians(town){
 const out=[];
 for(const [map,m]of Object.entries(W.maps))if(!m.templeLegacy&&m.title===town+' Temple')
  (m.foes||[]).forEach((f,i)=>{if(/^golem[1-4]$/.test(f.k))out.push({map,i,x:f.x*TS+8,y:f.y*TS+16,dead:!!bossGone[map+':'+i]||!!bossGone[map+':room:golem']||!!(m.templeContinuous&&bossGone[(m.templeOldGolem||'tp3')+':'+(i-4)])});});
 return out;
}
function atlasTempleProgress(town){
 atlasRememberJourneyVisits();
 const t=ATLAS_TEMPLE_JOURNEYS[town],guards=atlasTempleGuardians(town),claimed=!!breathHas[t.element];
 return {town:claimed||atlasJourneyVisits.has(town),entered:claimed||atlasJourneyVisits.has(town+' Temple'),defeated:claimed||guards.length>0&&guards.every(g=>g.dead),claimed,guards};
}
function atlasTempleObjective(town){
 const t=ATLAS_TEMPLE_JOURNEYS[town],p=atlasTempleProgress(town),id='temple:'+town;
 if(town!=='Forgewick'&&breathHas.lightning&&(!smithUpgrade||!charm.edge))return {...atlasObjective(id,'Finish preparing with Dunstan','Forgewick','Return to Dunstan in Forgewick. Receive the sword and armour improvements and finish his conversation for the Whetstone before taking the desert road.'),journeyStage:'smith'};
 if(!p.town)return {...atlasObjective(id,'Travel to '+town,town,t.road+' Reach the town before seeking its temple.'),journeyStage:'town'};
 if(!p.entered)return {...atlasObjective(id,'Enter '+town+' Temple',town+' Temple',t.trail+' Explore its halls, defeat the guardian golems and recover the '+t.stone+' Heartstone.'),journeyStage:'entrance'};
 if(!p.defeated)return {...atlasObjective(id,'Defeat the '+town+' temple golems',town+' Temple','Make your way through the temple halls and defeat its guardian golems to reach the '+t.stone+' Heartstone.'),journeyStage:'golems'};
 return {...atlasObjective(id,'Collect the '+t.stone+' Heartstone',town+' Temple','The guardian golems are defeated. Continue to the Heartstone chamber and open its chest to strengthen Aurelius.'),journeyStage:'heartstone'};
}
function atlasTempleTarget(q){
 const town=(q.questId||q.id).slice(7),t=ATLAS_TEMPLE_JOURNEYS[town];if(!t)return null;
 const stage=atlasTempleObjective(town).journeyStage;
 if(stage==='smith')return atlasNpcTarget(['Dunstan']);
 if(stage==='town'){
  const a=W.maps.world.features.find(f=>f.kind==='area'&&(f.label||f.place)===town);
  return a?{map:'world',x:(a.x0+a.x1)/2*TS,y:(a.y0+a.y1)/2*TS}:null;
 }
 if(stage==='entrance')return {map:t.entry,x:W.maps[t.entry].spawn[0],y:W.maps[t.entry].spawn[1]};
 if(stage==='golems'){const g=atlasTempleGuardians(town).find(g=>!g.dead);if(g)return {map:g.map,x:g.x,y:g.y};}
 const c=CHESTS.find(c=>c.gift===t.element);return c?{map:c.map,x:c.x*TS+8,y:c.y*TS+TS+24,heartstone:true}:null;
}
function atlasJourneyObjective(){
 const o=(title,place,detail,questId='main')=>({...atlasObjective('main',title,place,detail),questId});
 const opening=[
  [templeCompass.morningMet?'Speak with Hettie':'Get ready for the day','Millwood',templeCompass.morningMet?'Find Hettie by the cows near the mill.':'Pick up your Travel Gear from your bedroom desk, then speak with Nan.'],
  ['Speak with Hettie','Millwood','Find Hettie by the cows near the mill.'],
  ['Collect six eggs','Millwood','Pick up the basket of eggs at the coop behind the mill.'],
  ['Take the eggs to Maddock','Elder’s Home','Follow the northern lane. Speak to the guards blocking the road.'],
  ['Visit Elder Maddock','Elder’s Home','Enter Maddock’s house and deliver the eggs.'],
  ['Leave Maddock’s house','Elder’s Home','Step outside and speak with Maddock before going north.'],
  ['Investigate the crash','Northern Woods','Follow the path north of Maddock’s house toward the crash.'],
  ['Find the mysterious egg','Northern Woods','Approach the crash site and collect the mysterious egg.'],
  ['Bring the mysterious egg to Maddock','Elder’s Home','Maddock is waiting outside his house. Speak with him.']
 ];
 if(quest<Q.DONE)return o(...opening[quest]);
 if(wonAll)return o('A free Emberfell','Millwood','Return to your friends, or select an unfinished side quest below.');
 const royal=typeof thornwellStoryObjective==='function'&&thornwellStoryObjective();if(royal)return o(...royal,brambleQuest<2?'bramble':'thornwell-royals');
 if(brambleQuest<2)return o(brambleQuest===1?'Find Bramble’s owner':'Follow the eastern road','Thornwell',brambleQuest===1?atlasBrambleClue():'Travel east through the camps to Thornwell and speak with the people you meet.',brambleQuest===1?'bramble':'main');
 atlasRememberJourneyVisits();
 if((atlasJourneyVisits.has('Forgewick')||breathHas.lightning)&&(!smithUpgrade||!charm.edge))return o(!smithUpgrade?'Visit Dunstan':'Finish with Dunstan','Forgewick','Speak with Dunstan to improve your sword and armour, then finish his conversation to receive the Whetstone. You need these and the Lightning Heartstone before leaving for Sandspire.','smith');
 if(atlasJourneyVisits.has('Sandspire')&&!glassShield&&dragonLearned('shield')&&breathHas.lightning)return o('Visit Sela','Sandspire','Visit Dunstan’s brother at the glass shop in northwest Sandspire before continuing to the temple.','shield');
 for(const [town,t]of Object.entries(ATLAS_TEMPLE_JOURNEYS)){
  if(!breathHas[t.element]&&dragonLearned('temple:'+town)){const q=atlasTempleObjective(town);return {...q,id:'main',questId:q.id};}
 }
 if(!breathHas.lightning||!breathHas.ice||!breathHas.shadow)return o('Ask about the road ahead',breathHas.lightning?'Forgewick Temple':'Forgewick',breathHas.lightning?'Speak with Alderic about what you found.':'Speak with the people of Forgewick and follow the leads they share.');
 if(typeof FrostcragJourney!=='undefined'&&!FrostcragJourney.arrived())return o('Cross Frostcrag into Ashcrag','Frostcrag','Follow the road north from Hollybeck to the cave in Frostcrag. Cross the mountain passage east into Ashcrag. Prepare for stronger enemies.','highland-passage');
 return o('Face King Halvard','Cinderhold Castle','Follow the volcanic road east through Ashcrag to Cinderhold. Enter the castle and make your way to King Halvard.');
}
function atlasMainObjective(){return atlasJourneyObjective();}
function atlasPlaceFor(map,n){
 const title=map.title||'';
 const named=ATLAS_LOCATIONS.filter(p=>title.includes(p[0])).sort((a,b)=>b[0].length-a[0].length)[0];
 if(map!==W.maps.world&&named)return named[0];
 if(map===W.maps.world&&n){
  const x=n.x/TS,y=n.y/TS;
  const canonical=label=>ATLAS_LOCATIONS.find(p=>p[0].replace(/\s/g,'').toLowerCase()===String(label||'').replace(/\s/g,'').toLowerCase())?.[0];
  const area=(map.features||[]).filter(f=>f.kind==='area'&&x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1)
   .sort((a,b)=>(a.x1-a.x0)*(a.y1-a.y0)-(b.x1-b.x0)*(b.y1-b.y0)).find(f=>canonical(f.label||f.place));
  if(area)return canonical(area.label||area.place);
 }
 return null;
}
function atlasQuestOptions(){
 const main=atlasMainObjective(),out=[main],seen=new Set([main.questId]),add=(id,...args)=>{if(!seen.has(id)){seen.add(id);out.push(atlasObjective(id,...args));}};
 if(DragonChapels.known()&&!DragonChapels.found())add('desert-church','The Secret Dragon Church','Desert Church','Brother Edrin’s brother Cael keeps a secret church beyond Sandspire. Follow the winding path south from the eastern desert road, then west through the dunes.');
 if((DesertAdventure.accepted()||DesertAdventure.won())&&!DesertAdventure.owned())add('pyramid','The Emberheart of the Sands','Sunken Pyramid',DesertAdventure.won()?'Open the chest in the guardian’s chamber. The relic permanently strengthens Aurelius’s Fire while carried.':'Follow the western desert detour, explore the Sunken Pyramid and defeat its guardian. Recover the Emberheart from the treasure chest.');
 if(typeof HollybeckRescue!=='undefined')for(const q of HollybeckRescue.quests())add(q.id,q.title,q.place,q.detail);
 const royal=typeof thornwellStoryObjective==='function'&&thornwellStoryObjective();
 if(royal&&brambleQuest>=2)add('thornwell-royals',...royal);
 if(odoRodReferral&&!fishingPole)add('fishing','Calder’s spare rod','Route 1','Ask Calder at the first camp on the road from Millwood to Thornwell for his spare fishing rod.');
 if((dragonLearned('bramble')||brambleQuest===1)&&brambleQuest<2)add('bramble','Find Bramble’s person','Thornwell',atlasBrambleClue());
 if(dragonLearned('smith')&&(!smithUpgrade||!charm.edge))add('smith','Dunstan’s craftsmanship','Forgewick','Visit Dunstan at his forge to improve your sword and armour.');
 if(dragonLearned('shield')&&!glassShield)add('shield','Sela’s glasswork','Sandspire','Dunstan’s brother Sela works behind the glass shop in northwest Sandspire. Ask him about the Glass Shield.');
 if(dragonLearned('lantern')&&!charm.lamp)add('gift:lamp','Torvald’s lantern for the mines','Hollybeck','Find Sverre in Hollybeck and ask for Torvald’s Hollybeck Lantern. Carry it to see in the dark mine galleries.');
 if(dragonLearned('graveyard')&&!charm.wake)add('graveyard','The restless graveyard','Hollybeck Graveyard','Follow the trail northwest of Hollybeck into the graveyard. Defeat every wave of spirits to receive the Book of the Dead; the first wave is only the beginning.');
 if(DragonChapels.found()&&!DragonChapels.capture())add('sky-blessing','A blessing for the road','Desert Church','Speak with Brother Cael inside the secret desert church and stay for his blessing. It increases Aurelius’s flying sprint speed.');
 if(IceMoth.defeatedAlready()&&!IceMoth.owned())add('soulwing','Collect the Soulwing','Ice Moth','Open the chest where the Ice Moth fell to recover the Soulwing. You can then continue north to greet the stranded travelers.');
 if(dragonLearned('mines')&&!charm.flame)add('deep-mines',charm.lamp?'Return to the deep mines':'Find light for the deep mines',charm.lamp||!dragonLearned('lantern')?'Forgewick':'Hollybeck',!charm.lamp&&!dragonLearned('lantern')?'Ask Toft, the former miner at Forgewick’s market, how to light the deep galleries.':charm.lamp?'Return to the mine in Forgewick. Descend through the galleries and clear every creature from the deepest chamber to recover its treasure.':'The deepest mine galleries are too dark to explore. Continue the main journey through Sandspire and Coralmere to Hollybeck, ask Sverre for Torvald’s lantern, then return to Forgewick’s mine.');
 for(const [town,t]of Object.entries(ATLAS_TEMPLE_JOURNEYS))
  if(dragonLearned('temple:'+town)&&!breathHas[t.element]&&!seen.has('temple:'+town)){seen.add('temple:'+town);out.push(atlasTempleObjective(town));}
 for(const {n,map}of dragonGiftLeads()){
  const id='gift:'+n.charm;if(!['gift:ward','gift:spore','gift:twin','gift:brand'].includes(id))continue;
  const place=atlasPlaceFor(map,n);if(place)add(id,'Visit '+n.n,place,'Follow the lead to '+n.n+' in '+place+' and ask about the gift they can offer.');
 }
 if((wonAll||dragonLearned('trials')||cinderSeal)&&!atlasQuestComplete('trials'))add('trials','The demon’s trials',cinderSeal?'Cinderhold Castle':'Witchmoor',!cinderSeal?'Return through Hollybeck toward the wetlands. Take the mainland ferry to Witchmoor and speak with Maelis and the keeper of trials.':!trialSealPlaced?'Return to Cinderhold. Enter the seal chamber adjoining the throne room and place the Cinderhold Seal in its pedestal.':'Return to Cinderhold’s throne room and speak with the keeper. Accept his challenge and defeat all summoned waves; the keeper himself is not your enemy.');
 return out;
}
// Resolve the journal's destination in game coordinates, never in the
// illustrated atlas's deliberately compressed picture coordinates.
function atlasNpcTarget(names,preferred){
 const order=[MAPID,...Object.keys(W.maps).filter(id=>id!==MAPID)];
 for(const id of order){
  if(preferred&&id!==preferred)continue;
  const map=W.maps[id];if(map.templeLegacy)continue;
  const actor=(id===MAPID?npcs:map.npcs||[]).find(n=>names.includes(n.n)&&!n.away&&!n.editorDeleted);
  if(actor)return {map:id,x:actor.x,y:actor.y};
 }
 return null;
}
function atlasOpeningTarget(){
 const spot=name=>({map:'world',x:SPOT[name][0]*TS,y:SPOT[name][1]*TS});
 const item=key=>{const it=ITEMS.find(i=>i.key===key);return {map:it.map||'world',x:it.tx*TS+8,y:it.ty*TS+16};};
 switch(quest){
  case Q.ABED:
   if(morningSuppliesPending()){const it=morningDeskItems()[0];return {map:it.map,x:it.x,y:it.y+16};}
   if(!templeCompass.morningMet)return atlasNpcTarget(['Nan Ferrow'],'house26');
   return atlasNpcTarget(['Hettie'],'world');
  case Q.ERRAND:return atlasNpcTarget(['Hettie'],'world');
  case Q.EGGS:return item('eggs');
  case Q.KING:return atlasNpcTarget(['Maddock','Elder Maddock'],'house22');
  case Q.ELDER:return atlasNpcTarget(['Maddock','Elder Maddock'],'house22');
  case Q.NOISE:return spot('path');
  case Q.ARMED:return spot('north');
  case Q.FLED:return item('egg');
  case Q.CARRY:return atlasNpcTarget(['Elder Maddock'],'world')||{map:'world',x:ELDER_WELL[0]*TS,y:ELDER_WELL[1]*TS};
 }
 return null;
}
function atlasBossRewardTarget(kind){
 const drop=BossRewardChests.capture()[kind];if(drop)return {...drop};
 const map=kind==='spiderqueen'?'pyramid_queen':'world';
 const actor=W.maps[map]?.roomActors?.find(a=>a.bossRewardKind===kind);
 if(actor)return {map,x:actor.x,y:actor.y};
 const foe=W.maps[map]?.foes?.find(f=>f.k===kind);
 if(foe)return {map,x:foe.x*TS+8,y:foe.y*TS+16};
 const a=kind==='frosthorn'?Frosthorn.arena:IceMoth.arena;
 return {map,x:a.x*TS,y:a.y*TS};
}
function atlasQuestTarget(q){
 if(!q)return null;
 if(q.id==='main'){
  if(quest<Q.DONE)return atlasOpeningTarget();
  q=atlasJourneyObjective();
 }
 if((q.questId||q.id).startsWith('temple:'))return atlasTempleTarget(q);
 if(typeof HollybeckRescue!=='undefined'){const target=HollybeckRescue.target(q.id);if(target)return target;}
 if(q.id==='highland-passage'||q.questId==='highland-passage')return FrostcragJourney.target();
 if(q.id==='trials')return !cinderSeal?{map:'witchmoor',x:196,y:304}:!trialSealPlaced?{map:'royal_seal',x:TRIAL_PEDESTAL.x,y:TRIAL_PEDESTAL.y+24}:{map:'cinderhold',...THRONE_DEMON};
 if(q.id==='graveyard'){const a=W.maps.world.features.find(f=>f.id===207);if(a)return {map:'world',x:a.x*TS,y:a.y*TS};}
 if(['main','thornwell-royals'].includes(q.id)){
  if(/Leave the Copper Cup|Make way for royalty/.test(q.title)){const d=W.maps.tavern.doors.find(d=>d.to==='world');if(d)return {map:'world',x:d.tx*TS+8,y:d.ty*TS+16};}
  if(/Aurelius at Forgefalls/.test(q.title)){const p=thornwellForgefalls();if(p)return {map:'world',x:p.x,y:p.y};}
  if(/Face King Halvard/.test(q.title))return atlasNpcTarget(['King Halvard'],'cinderhold');
  if(/A free Emberfell/.test(q.title))return atlasNpcTarget(['Nan Ferrow'],'house26');
  if(/Ask about the road ahead/.test(q.title))return breathHas.lightning?atlasNpcTarget(['Alderic','Aldric']):atlasNpcTarget(['Dunstan']);
 }
 if(q.id==='deep-mines'&&!charm.lamp&&!dragonLearned('lantern'))return atlasNpcTarget(['Toft']);
 if(q.id==='deep-mines')return !charm.lamp?atlasNpcTarget(['Sverre','Torvald']):{map:'mine5',x:W.maps.mine5.spawn[0],y:W.maps.mine5.spawn[1]};
 if(q.id==='soulwing')return atlasBossRewardTarget('icemoth');
 if(q.id==='sky-blessing')return atlasNpcTarget(['Brother Cael'],'desert_chapel');
 if(q.id==='desert-church')return {map:'desert_chapel',x:176,y:216};
 if(q.id==='pyramid')return DesertAdventure.won()?atlasBossRewardTarget('spiderqueen'):{map:'pyramid_queen',x:144,y:160};
 const element={'Forgewick Temple':'lightning','Sandspire Temple':'ice','Hollybeck Temple':'shadow'}[q.place];
 if(element&&q.title!=='Ask about the road ahead'){const c=CHESTS.find(c=>c.gift===element);if(c)return {map:c.map,x:c.x*TS+TS/2,y:c.y*TS+TS+24,heartstone:true};}
 if(q.id==='bramble'||['main','thornwell-royals'].includes(q.id)&&/Return Bramble|Bramble.*owner/.test(q.title)){
  if(!dragonLearned('bramble-owner')&&brambleQuest<2){
   const town=W.maps.world.features.find(f=>f.kind==='area'&&atlasCanonical(f.label||f.place)==='Thornwell');
   return town?{map:'world',x:(town.x0+town.x1)/2*TS,y:(town.y0+town.y1)/2*TS}:null;
  }
  const rowan=MAPID==='tavern'&&npcs.find(n=>n.n==='Rowan the Hunter');return {map:'tavern',x:rowan?.x??256,y:(rowan?.y??220)};
 }
 if((q.id==='main'||q.id==='thornwell-royals')&&/king’s summons/.test(q.title)){const king=typeof thornwellKing==='function'&&thornwellKing();return {map:'tavern',x:king?.x??396,y:(king?.y??170)};}
 const named={fishing:'Calder',bramble:'Rowan the Hunter',smith:'Dunstan',shield:'Sela','gift:lamp':'Sverre'};
 let name=named[q.id];
 if(q.id==='main'){
  if(q.questId&&named[q.questId])name=named[q.questId];
  if(/Hettie/.test(q.title))name='Hettie';
  else if(/Dunstan/.test(q.title))name='Dunstan';
  else if(/Sela/.test(q.title))name='Sela';
  else if(/Bramble.*owner|Return Bramble/.test(q.title))name='Rowan the Hunter';
 }
 for(const [id,map] of Object.entries(W.maps)){
  if(map.templeLegacy)continue;
  const list=id===MAPID?npcs:map.npcs||[];
  const n=list.find(n=>!n.away&&!n.editorDeleted&&(name?n.n===name:q.id.startsWith('gift:')&&n.charm===q.id.slice(5)));
  if(n)return {map:id,x:n.x,y:n.y};
 }
 const world=W.maps.world,area=(world.features||[]).find(f=>f.kind==='area'&&atlasCanonical(f.label||f.place)===q.place);
 if(area)return {map:'world',x:(area.x0+area.x1)/2*TS,y:(area.y0+area.y1)/2*TS};
 const landmark=(world.features||[]).find(f=>atlasCanonical(f.label||f.place)===q.place);
 if(landmark)return {map:'world',x:landmark.x*TS+8,y:landmark.y*TS+16};
 const interior=Object.entries(W.maps).find(([id,map])=>id!=='world'&&!map.templeLegacy&&atlasPlaceFor(map)===q.place);
 if(interior)return {map:interior[0],x:interior[1].spawn[0],y:interior[1].spawn[1]};
 return null;
}
const ATLAS_CONNECTIONS=[
 ['Millwood','Elder’s Home','Northern Woods','Shroom Pass','Sporewood','Sporehollow','Northern Shroom Field'],
 ['Millwood','Route 1','Thornwell','Forgefalls','Route 2','Forgewick','Route 3','The Oasis','Sandspire','Route 4','Coralmere','Route 5','Hollybeck','Route 6','Frostcrag','Ashcrag','Route 7','Cinderhold Castle'],
 ['Sandspire','Sunken Pyramid','Spider Queen'],['Sandspire','Desert Church'],['Hollybeck','Ice Moth'],['Hollybeck','Frosthorn'],
 ['Forgewick','Forgewick Temple'],['Sandspire','Sandspire Temple'],
 ['Route 5','Witchmoor','Dreadmarsh'],['Hollybeck','Hollybeck Graveyard'],['Hollybeck','Hollybeck Temple']
];
const ATLAS_PLACE_NOTES={
 'Millwood':['Home & farm','Nan and Corin’s home, Hettie’s farm, and Odo by the water.'],
 'Elder’s Home':['Maddock','The elder’s house beside the northern lane.'],
 'Northern Woods':['Northern trail','The woods north of Millwood.'],
 'Thornwell':['School · Tavern · Inn','Visit the school, tavern and inn, and ask the townspeople for local knowledge.'],
 'Desert Church':['Brother Cael · Dragon shrine','A secret place of dragon worship south of Sandspire.'],
 'Sunken Pyramid':['Ancient burial chambers','Weathered burial chambers lie beneath the desert sands.'],
 'Spider Queen':['Pyramid depths','A chamber deep beneath the desert sands.'],
 'Frosthorn':['Snowbound clearing','A remote clearing at the end of a winding winter trail.'],
 'Ice Moth':['Frozen glade','A secluded glade surrounded by snow and ice.'],
 'Forgefalls':['Fishing pools','Fish the quiet pools below the falls once you have a rod.'],
 'Forgewick':['Blacksmith','Dunstan works at the forge. Ask him about his brother’s glasswork in Sandspire.'],
 'Forgewick Temple':['Ancient temple','An old stone hall southeast of Forgewick.'],
 'Sandspire':['Desert market · Glassblower','Sela’s glass shop stands in the northwest corner of town, with the tall chimney and coloured windows.'],
 'The Oasis':['Desert refuge','A green landmark southwest of Sandspire.'],
 'Sandspire Temple':['Ancient temple','The winding temple trail leads southeast from Sandspire.'],
 'Coralmere':['Harbor · Fish','A coastal town with blossom trees, fishing docks, and supplies for the road.'],
 'Witchmoor':['Maelis · Ferry','Maelis lives north of Dreadmarsh. Reach her side of the marsh by ferry.'],
 'Dreadmarsh':['Wetlands','The deep marsh lies south of Witchmoor.'],
 'Hollybeck':['Winter village','A place to prepare before the highlands.'],
 'Hollybeck Graveyard':['Restless dead','The graveyard lies northwest of Hollybeck.'],
 'Hollybeck Temple':['Ancient temple','Follow the trail east and north from Hollybeck.'],
 'Frostcrag':['Mountain passage','The snowy western approach to the passage.'],
 'Ashcrag':['Volcanic approach','Beyond the mountain passage, the road bends toward the volcanic east.'],
 'Cinderhold Castle':['King Halvard’s fortress','The eastern end of the journey.'],
 'Sporehollow':['Mushroom settlement','A community among the giant caps.'],
 'Sporewood':['Mushroom woodland','Old woodland beneath the giant caps.'],
 'Shroom Pass':['Northern path','The passage between the northern woods and mushroom country.'],
 'Northern Shroom Field':['Northern fields','The far northern edge of the mushroom country.']
};
function atlasMilestoneData(){return [
 ['A bond begins',quest>=Q.DONE],['Bramble home',brambleQuest>=2],
 ['Ready for the road',!!(smithUpgrade&&charm.edge&&glassShield)],
 ['Lightning',!!breathHas.lightning],['Ice',!!breathHas.ice],['Shadow',!!breathHas.shadow],['Face Halvard',!!wonAll]
 ].filter(([,complete])=>complete).concat(wonAll?[]:[[atlasJourneyObjective().title,false]]);}
function atlasQuestComplete(id){
 if(id==='highland-passage')return FrostcragJourney.arrived();
 if(id==='winter-rescue')return typeof HollybeckRescue!=='undefined'&&HollybeckRescue.rescued();
 if(id==='frosthorn')return Frosthorn.defeatedAlready()&&Frosthorn.owned();
 if(id==='soulwing')return IceMoth.owned();
 if(id==='sky-blessing')return DragonChapels.capture();
 if(id==='deep-mines')return !!charm.flame;
 if(id==='desert-church')return DragonChapels.known()&&DragonChapels.found();
 if(id==='pyramid')return DesertAdventure.owned();
 if(id==='main')return !!wonAll;
 if(id==='fishing')return !!fishingPole;
 if(id==='bramble')return brambleQuest>=2;
 if(id==='thornwell-royals')return typeof thornwellRoyal!=='undefined'&&thornwellRoyal.stage>=7;
 if(id==='smith')return !!(smithUpgrade&&charm.edge);
 if(id==='shield')return !!glassShield;
 if(id==='graveyard')return !!charm.wake;
 if(id==='trials')return typeof trialWins!=='undefined'&&trialWins>0;
 if(id.startsWith('gift:'))return !!charm[id.slice(5)];
 const element={'temple:Forgewick':'lightning','temple:Sandspire':'ice','temple:Hollybeck':'shadow'}[id];
 return element?!!breathHas[element]:false;
}
function atlasSyncJournal(){
 atlasQuests=[...new Map(atlasQuestOptions().map(q=>[q.id,q])).values()];
 window.EmberQuestNotifications?.scan(atlasQuests);
 for(const q of atlasQuests){const id=q.questId||q.id;if(id!=='main')atlasJournalKnown[id]={...q,id};}
 if(!atlasQuests.some(q=>q.id===atlasTrackedQuest&&!atlasQuestTrackLock(q)))atlasTrackedQuest='main';
 if(typeof atlasSyncDiscovery==='function')atlasSyncDiscovery();
}
function atlasQuestStages(q){
 const templeTown=(q?.questId||q?.id||'').replace(/^temple:/,'');
 if(ATLAS_TEMPLE_JOURNEYS[templeTown]){const p=atlasTempleProgress(templeTown),t=ATLAS_TEMPLE_JOURNEYS[templeTown];return [
  ...(templeTown!=='Forgewick'?[['Prepare with Dunstan and claim the Lightning Heartstone',!!(smithUpgrade&&charm.edge&&breathHas.lightning)]]:[]),
  ...(templeTown==='Hollybeck'?[['Claim the Ice Heartstone in Sandspire',!!breathHas.ice]]:[]),
  ['Reach '+templeTown,p.town],['Enter '+templeTown+' Temple',p.entered],['Defeat the guardian golems',p.defeated],['Collect the '+t.stone+' Heartstone',p.claimed]];}

 if(q?.id==='highland-passage'||q?.questId==='highland-passage')return [['Claim the snow temple Heartstone',!!breathHas.shadow],['Cross the mountain into Ashcrag',FrostcragJourney.arrived()]];
 if(q?.id==='winter-rescue')return [['Learn about the missing party',HollybeckRescue.known()],[IceMoth.defeatedAlready()||seenFoe.icemoth?'Defeat the Ice Moth':'Make the route home safe',IceMoth.defeatedAlready()],['Tell the travelers the trail is safe',HollybeckRescue.rescued()]];
 if(q?.id==='frosthorn')return [['Hear Sverre’s warning',HollybeckRescue.frostKnown()],['Defeat Frosthorn',Frosthorn.defeatedAlready()],['Open the Frostheart chest',Frosthorn.owned()]];
 if(q?.id==='soulwing')return [['Defeat the Ice Moth',IceMoth.defeatedAlready()],['Open the Soulwing chest',IceMoth.owned()]];
 if(q?.id==='sky-blessing')return [['Find the desert church',DragonChapels.found()],['Receive Brother Cael’s blessing',DragonChapels.capture()]];
 if(q?.id==='deep-mines')return [['Obtain Torvald’s lantern from Sverre',!!charm.lamp],['Clear the deepest mine chamber',!!charm.flame]];
 if(q?.id==='graveyard')return [['Learn about the restless spirits',dragonLearned('graveyard')],['Defeat every ghost wave and receive the Book of the Dead',!!charm.wake]];
 if(q?.id==='fishing')return [['Ask Odo about a fishing rod',!!odoRodReferral],['Find Calder at the first camp and ask for his spare rod',!!fishingPole]];
 if(q?.id==='smith'||q?.questId==='smith')return [['Receive Dunstan’s sword and armour improvements',!!smithUpgrade],['Finish speaking with Dunstan and receive the Whetstone',!!charm.edge]];
 if(q?.id==='shield'||q?.questId==='shield')return [['Hear Dunstan’s referral',dragonLearned('shield')||glassShield],['Visit Sela in northwest Sandspire and receive the Glass Shield',!!glassShield]];
 if(q?.id==='desert-church')return [['Hear Brother Edrin’s secret',DragonChapels.known()],['Find the desert church',DragonChapels.found()]];
 if(q?.id==='pyramid')return [['Accept the expedition',DesertAdventure.accepted()||DesertAdventure.owned()],['Defeat the pyramid guardian',DesertAdventure.won()],['Open the Emberheart chest',DesertAdventure.owned()]];
 if(q?.id==='main')return atlasMilestoneData();
 if(q?.id==='thornwell-royals')return [['Return Bramble',brambleQuest>=3],...(thornwellRoyal.stage>=2?[['Answer the king’s summons',thornwellRoyal.stage>=4]]:[]),...(thornwellRoyal.stage>=5?[['Wait for the royal party',thornwellRoyal.stage>=6]]:[]),...(thornwellRoyal.stage>=6?[['Meet Aurelius at Forgefalls',thornwellRoyal.stage>=7]]:[])];
 if(q?.id==='bramble')return [['Meet Bramble',brambleQuest>=1],['Find his owner',dragonLearned('bramble-owner')||brambleQuest>=2],['Bring him home',brambleQuest>=2]];
 if(q?.id==='trials')return [['Ask about the trials',!!cinderSeal],...(cinderSeal?[['Place the seal',!!trialSealPlaced]]:[]),...(trialSealPlaced?[['Win the trial',atlasQuestComplete('trials')]]:[])];
 return [['Learn the lead',true],['Reach '+(q?.place||'the destination'),atlasCurrentArea()===q?.place||atlasQuestComplete(q?.id||'')],['Collect the reward',atlasQuestComplete(q?.id||'')]];
}
function captureQuestJournal(){atlasSyncJournal();return {journeyVisits:[...atlasJourneyVisits],tracked:atlasTrackedQuest,known:atlasJournalKnown,encounteredBosses:typeof atlasEncounteredBosses!=='undefined'?[...atlasEncounteredBosses]:[],discovered:typeof atlasDiscovered!=='undefined'?[...atlasDiscovered]:[],compassTutorialSeen:atlasCompassTutorialSeen,notifications:window.EmberQuestNotifications?.capture()};}
function restoreQuestJournal(saved){
 atlasJourneyVisits=new Set((saved?.journeyVisits||[]).filter(p=>Object.keys(ATLAS_TEMPLE_JOURNEYS).some(t=>p===t||p===t+' Temple')));
 if(typeof restoreAtlasDiscovery==='function')restoreAtlasDiscovery(saved?.discovered,saved?.encounteredBosses);
 window.EmberQuestNotifications?.restore(saved?.notifications);
 atlasCompassTutorialSeen=!!saved?.compassTutorialSeen;atlasTrackedQuest=typeof saved?.tracked==='string'?saved.tracked:'main';atlasJournalKnown={};atlasJournalOpen=false;atlasSelectedQuest=atlasTrackedQuest;atlasSelectedComplete=false;
 for(const [id,q]of Object.entries(saved?.known||{}))if(q&&typeof q.title==='string'&&typeof q.detail==='string'&&ATLAS_LOCATIONS.some(p=>p[0]===q.place))atlasJournalKnown[id]={id,title:q.title,detail:q.detail,place:q.place};
}
function atlasCompletedEntries(){
 const known={...atlasJournalKnown};
 const earned=[['sky-blessing','A blessing for the road','Desert Church','Received Brother Cael’s Sky Blessing.'],['soulwing','The Soulwing','Ice Moth','Recovered the Ice Moth’s relic.'],['deep-mines','The deep mines','Forgewick','Cleared the deepest chamber and recovered its treasure.'],['frosthorn','The Beast on the Northern Trail','Frosthorn','Defeated Frosthorn and collected the Frostheart.'],['desert-church','The Secret Dragon Church','Desert Church','Found Brother Cael’s secret church beyond the dunes, where dragon worship endures.'],['pyramid','The Emberheart of the Sands','Sunken Pyramid','Recovered the Emberheart Relic. Aurelius’s Fire damage is permanently increased by 25% while carrying it.'],['fishing','Calder’s spare rod','Route 1','Received Calder’s fishing rod.'],['bramble','Bramble’s homecoming','Thornwell','Reunited Bramble with Rowan.'],['smith','Dunstan’s craftsmanship','Forgewick','Improved Corin’s sword and armor.'],['shield','Sela’s glasswork','Sandspire','Received Sela’s protective shield.'],['graveyard','Book of the Dead','Hollybeck Graveyard','Unlocked allied-wraith summoning.'],['gift:lamp','Torvald’s lantern','Hollybeck','Obtained the lantern carried by Sverre.'],...['Forgewick','Sandspire','Hollybeck'].map(t=>['temple:'+t,t+' Heartstone',t+' Temple','Recovered the temple Heartstone.'])];
 for(const [id,title,place,detail]of earned)if(atlasQuestComplete(id))known[id]={id,title,place,detail};
 return [...new Map(Object.values(known).filter(q=>atlasQuestComplete(q.id)).map(q=>{
  const id=q.id==='gift:wake'?'graveyard':q.id==='gift:edge'?'smith':q.id;return [id,{...q,id}];
 })).values()].filter(q=>atlasJournalAllowed(q.id));
}
function atlasCanonical(label){
 const aliases={'eldershome':'Elder’s Home','sporehollow':'Sporehollow','northshroompassfield':'Northern Shroom Field','cinderhold':'Cinderhold Castle'};
 const key=String(label||'').replace(/[^a-z0-9]/gi,'').toLowerCase();
 return aliases[key]||ATLAS_LOCATIONS.find(p=>p[0].replace(/[^a-z0-9]/gi,'').toLowerCase()===key)?.[0]||null;
}
function atlasCurrentArea(){
 if(typeof MAPID==='undefined'||typeof P==='undefined')return null;
 const world=W.maps.world;
 if(MAPID==='world'&&typeof atlasEnteredArea==='function'){const entered=atlasEnteredArea();if(entered)return entered;}
 if(MAPID==='pyramid_queen')return 'Spider Queen';
 if(MAPID==='desert_chapel')return 'Desert Church';
 if(MAPID==='world'){const boss=(world.features||[]).find(f=>(f.frosthorn||f.iceMoth)&&Math.hypot(P.x/TS-f.x,P.y/TS-f.y)<f.r+4);if(boss)return boss.frosthorn?'Frosthorn':'Ice Moth';}
 let x=P.x/TS,y=P.y/TS;
 if(MAPID!=='world'){
  const map=W.maps[MAPID]||{},direct=atlasPlaceFor(map,null)||atlasCanonical((map.title||'').split(/ [—–] /)[0]);if(direct)return direct;
  const pending=[MAPID],visited=new Set();let entry=null;
  while(pending.length&&!entry){const id=pending.shift();if(visited.has(id))continue;visited.add(id);entry=(world.doors||[]).find(d=>d.to===id);if(!entry)for(const d of W.maps[id]?.doors||[])if(d.to!=='world'&&!visited.has(d.to))pending.push(d.to);}
  if(!entry)return null;x=entry.x;y=entry.y;
 }
 const places=(world.features||[]).filter(f=>f.kind==='area'&&atlasCanonical(f.label||f.place));
 const inside=places.filter(f=>x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1).sort((a,b)=>(a.x1-a.x0)*(a.y1-a.y0)-(b.x1-b.x0)*(b.y1-b.y0))[0];
 if(inside)return atlasCanonical(inside.label||inside.place);
 // Roads use the nearest named area/landmark, not an invented GPS position.
 const anchors=places.map(f=>({name:atlasCanonical(f.label||f.place),x:(f.x0+f.x1)/2,y:(f.y0+f.y1)/2}));
 for(const f of world.features||[])if(f.kind==='landmark'&&atlasCanonical(f.label||f.place)){
  const door=f.label==='Witchmoor'?(world.doors||[]).find(d=>d.to==='witchmoor'):null;
  anchors.push({name:atlasCanonical(f.label||f.place),x:door?.x??f.x,y:door?.y??f.y});
 }
 return anchors.sort((a,b)=>Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y))[0]?.name||null;
}
function atlasRouteBetween(from,to){
 if(!from||!to)return [];
 const edges=new Map();for(const route of ATLAS_CONNECTIONS)for(let i=1;i<route.length;i++)for(const [a,b]of [[route[i-1],route[i]],[route[i],route[i-1]]]){if(!edges.has(a))edges.set(a,[]);edges.get(a).push(b);}
 const queue=[[from]],seen=new Set([from]);while(queue.length){const path=queue.shift(),last=path.at(-1);if(last===to)return path;for(const next of edges.get(last)||[])if(!seen.has(next)){seen.add(next);queue.push([...path,next]);}}
 return [];
}
function atlasElement(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function atlasSetJournal(open){
 atlasJournalOpen=open;
 document.getElementById('atlasQuestsScreen').hidden=!open;
 document.getElementById('atlasBody').hidden=open;
 document.getElementById('atlasClose').parentNode.hidden=open;
}
function atlasOpenJournal(){
 atlasSyncJournal();atlasSelectedQuest=atlasTrackedQuest;atlasSelectedComplete=false;
 atlasSetJournal(true);atlasRenderJournal();
 document.getElementById('atlasQuestList').scrollTop=0;
 document.getElementById('atlasQuestsBack').focus();
}
function atlasBack(){
 if(!atlasJournalOpen){closeAtlas();return;}
 atlasSetJournal(false);atlasShowDetails();atlasApplyPan();
 document.getElementById('atlasQuests').focus();
}
function atlasChooseQuest(id,completed=false){
 atlasSelectedQuest=id;atlasSelectedComplete=completed;atlasRenderJournal();
 document.getElementById('atlasQuestInfo').scrollTop=0;
 document.querySelector('.atlasQuestEntry.selected')?.focus({preventScroll:true});
}
function atlasJournalEntries(){return [...atlasQuests.map(q=>({...q,completed:false})),...atlasCompletedEntries().map(q=>({...q,completed:true}))];}
function atlasJournalMove(direction){
 const entries=atlasJournalEntries(),index=entries.findIndex(q=>q.id===atlasSelectedQuest&&q.completed===atlasSelectedComplete);
 const next=entries[Math.max(0,Math.min(entries.length-1,index+direction))];
 if(next){atlasChooseQuest(next.id,next.completed);document.querySelector('.atlasQuestEntry.selected')?.scrollIntoView({block:'nearest'});}
}
function atlasAction(){
 if(atlasJournalOpen){if(!atlasSelectedComplete)atlasTrack(atlasSelectedQuest);}
 else if(!atlasDismissCompassTutorial())atlasOpenJournal();
}
function atlasTrack(id){
 atlasSyncJournal();const q=atlasQuests.find(q=>q.id===id);
 if(!q||atlasQuestComplete(q.id))return false;
 const lock=atlasQuestTrackLock(q);if(lock){document.getElementById('atlasQuestStatus').textContent=lock;toast(lock);return false;}
 const isDefault=q.id==='main'||q.id===atlasJourneyObjective().questId;
 templeCompass.cache=null;atlasTrackedQuest=isDefault?'main':q.id;atlasCompassTutorialSeen=true;
 if(typeof saveGame==='function')saveGame();
 // Tracking always resumes play, including when the map came from inventory.
 atlasReturn='game';closeAtlas();
 if(!isDefault){
  if(typeof compassCelebrateTracking==='function')compassCelebrateTracking();
  toast('Tracking: '+q.title);
 }
 const compassRect=cv.getBoundingClientRect();
 toastEl.classList.add('compass-safe');
 toastEl.style.setProperty('--compass-notice-top',(compassRect.top+compassRect.height/VH*64)+'px');
 return true;
}
function atlasExpandDetails(expanded){
 document.getElementById('atlasDetails').classList.toggle('details-expanded',!!expanded);
}
function atlasSelectPlace(index){if(!atlasPlaceKnown(ATLAS_LOCATIONS[index]?.[0]))return;atlasPick=index;atlasExpandDetails(true);atlasShowDetails();}
function atlasBuildPlaces(){
 const places=document.getElementById('atlasPlaces');places.replaceChildren();
 for(const [i,p]of ATLAS_LOCATIONS.entries()){
  if(!atlasPlaceKnown(p[0]))continue;
  const label=atlasDisplayName(p[0]);
  const b=atlasElement('button','atlasPlace'+(/^Route/.test(p[0])?' routePlace':['Millwood','Thornwell','Forgewick','Sandspire','Coralmere','Hollybeck','Cinderhold Castle'].includes(p[0])?' townPlace':['Spider Queen','Frosthorn','Ice Moth'].includes(p[0])?' bossPlace':''),label);b.type='button';b.style.left=p[1]+'px';b.style.top=p[2]+'px';b.dataset.placeIndex=i;
  b.setAttribute('aria-label','Explore '+label);b.onclick=e=>{e.stopPropagation();if(e.detail&&atlasIgnoreClick)return;atlasSelectPlace(i);};places.append(b);
 }
 // Roads belong to the finished illustration. Only the tracked journey is overlaid.
 document.getElementById('atlasRoutes').innerHTML='<svg viewBox="0 0 1536 512" aria-hidden="true"><path id="atlasTrackedRoute" d=""/></svg>';
}
function atlasZoom(amount){
 const view=document.getElementById('atlasViewport'),x=view.clientWidth/2,y=view.clientHeight/2,old=atlasPan.z,z=Math.max(.22,Math.min(4,old*amount));
 atlasPan={x:x-(x-atlasPan.x)*z/old,y:y-(y-atlasPan.y)*z/old,z};atlasApplyPan();
}
function atlasShowWhole(){
 atlasExpandDetails(false);
 const view=document.getElementById('atlasViewport');atlasPan.z=Math.max(.22,Math.min(view.clientWidth/1536,view.clientHeight/512)*.97);atlasPan.x=0;atlasPan.y=0;atlasApplyPan();
}
function atlasDismissCompassTutorial(){
 const tutorial=document.getElementById('atlasCompassTutorial');
 if(tutorial.hidden)return false;
 atlasCompassTutorialSeen=true;tutorial.hidden=true;
 document.getElementById('atlasBody').inert=false;document.getElementById('atlasClose').focus?.();saveGame();return true;
}
function atlasBegin(){
 EmberAtlasMotion.start();
 if(typeof rememberFlightVisit==='function')rememberFlightVisit();
 window.EmberEncounterCard?.layout();
 const tutorial=document.getElementById('atlasCompassTutorial');
 document.getElementById('worldAtlas').appendChild(tutorial);tutorial.hidden=atlasCompassTutorialSeen;
 document.getElementById('atlasBody').inert=!atlasCompassTutorialSeen;
 if(!atlasCompassTutorialSeen)document.getElementById('atlasCompassGotIt').focus?.();
 atlasViewBounds=null;
 atlasSyncJournal();atlasBuildPlaces();atlasRenderFog();
 atlasPointers.clear();atlasGesture=null;atlasExpandDetails(false);
 atlasSetJournal(false);document.getElementById('atlasDetails').scrollTop=0;
 const i=ATLAS_LOCATIONS.findIndex(p=>p[0]===atlasCurrentArea()&&atlasPlaceKnown(p[0]));atlasPick=i>=0?i:0;
 renderAtlas();
}
function atlasSchedulePan(){
 if(!atlasPanFrame)atlasPanFrame=requestAnimationFrame(()=>{atlasPanFrame=0;atlasApplyPan();});
}
function atlasApplyPan(){
 const view=document.getElementById('atlasViewport'),s=document.getElementById('atlasSurface'),z=atlasPan.z;
 const limit=(v,extent,size)=>extent<=size?(size-extent)/2:Math.max(size-extent,Math.min(0,v));
 const bounds=atlasViewBounds||view.getBoundingClientRect();
 atlasPan.x=limit(atlasPan.x,1536*z,bounds.width);atlasPan.y=limit(atlasPan.y,512*z,bounds.height);
 s.style.transform=`translate3d(${atlasPan.x}px,${atlasPan.y}px,0) scale(${z})`;
 if(atlasPanScale!==z){atlasPanScale=z;
  s.style.setProperty('--map-label-scale',String(Math.min(2.5,Math.max(.5,1/z))));
  s.classList.toggle('mapOverview',z<1.05);
 }
}
function atlasRenderJournal(){
 const $=id=>document.getElementById(id),completed=atlasCompletedEntries();
 const list=atlasSelectedComplete?completed:atlasQuests;
 let q=list.find(q=>q.id===atlasSelectedQuest);
 if(!q){q=atlasQuests.find(q=>q.id===atlasTrackedQuest)||atlasQuests[0];atlasSelectedQuest=q?.id;atlasSelectedComplete=false;}
 $('atlasQuestCount').textContent=atlasQuests.length+' active · '+completed.length+' complete';
 for(const [id,entries,done]of [['atlasActiveQuests',atlasQuests,false],['atlasCompletedQuests',completed,true]]){
  const root=$(id);root.replaceChildren();
  if(!entries.length)root.append(atlasElement('p','journalEmpty',done?'No completed quests yet.':'No active quests.'));
  for(const entry of entries){
   const selected=entry.id===atlasSelectedQuest&&done===atlasSelectedComplete;
   const tracked=!done&&entry.id===atlasTrackedQuest;
   const button=atlasElement('button','atlasQuestEntry'+(selected?' selected':''));button.type='button';
   button.dataset.questId=entry.id;button.dataset.completed=String(done);button.setAttribute('aria-pressed',String(selected));
   button.append(atlasElement('strong','',entry.title),atlasElement('small','',done?'✓ Completed':tracked?'◆ Tracked':atlasQuestKind(entry)==='main'?'Main quest':atlasQuestKind(entry)==='trial'?'Trial':'Side quest'));
   button.onclick=()=>atlasChooseQuest(entry.id,done);root.append(button);
  }
 }
 $('atlasQuestTitle').textContent=q?.title||'Your journey';
 $('atlasObjective').textContent=q?.detail||'Known quests will appear here as you explore.';
 $('atlasQuestKind').textContent=atlasQuestKind(q)==='main'?'MAIN QUEST':atlasQuestKind(q)==='trial'?'TRIAL':'SIDE QUEST';
 $('atlasQuestDestination').textContent=q?'◆ '+q.place:'';
 const area=atlasCurrentArea(),path=atlasRouteBetween(area,q?.place),via=path.slice(1,-1).filter(x=>!/^Route/.test(x)&&atlasPlaceKnown(x)).map(atlasDisplayName);
 $('atlasRouteHint').textContent=atlasSelectedComplete||!q||!area?'':area===q.place?'You are in this area. Follow the objective above.':via.length?'From '+atlasDisplayName(area)+' · via '+via.slice(0,3).join(' → ')+(via.length>3?' → …':''):'From '+atlasDisplayName(area)+' · toward '+q.place;
 const steps=$('atlasQuestSteps');steps.replaceChildren();
 if(q&&!atlasSelectedComplete){
  const stages=atlasQuestStages(q),active=stages.findIndex(([,done])=>!done);
  if(q.id==='main'&&!ATLAS_TEMPLE_JOURNEYS[(q.questId||'').slice(7)]){
   const current=active<0?stages.at(-1):stages[active];
   if(current)steps.append(atlasElement('span','questStep current',active<0?'✓ Main journey complete':'◉ Current chapter: '+current[0]));
  }else for(const [i,[label,done]]of stages.entries())steps.append(atlasElement('span','questStep'+(done?' done':i===active?' current':''),(done?'✓ ':i===active?'◉ ':'○ ')+label));
 }
 const finished=atlasSelectedComplete||!!q&&atlasQuestComplete(q.id),lock=!finished&&atlasQuestTrackLock(q);
 $('atlasQuestStatus').textContent=finished?'✓ Quest complete':lock|| (q?.id===atlasTrackedQuest?'◆ Currently tracked':'');
 $('atlasFocus').hidden=finished||!q;$('atlasFocus').disabled=finished||!q;
 // Keep locked controls tappable so mouse, touch and A all explain the prerequisite.
 $('atlasFocus').setAttribute('aria-disabled',String(!!lock||finished||!q));
 $('atlasFocus').setAttribute('aria-describedby','atlasQuestStatus');
 const milestones=$('atlasMilestones');milestones.replaceChildren();
 const all=atlasMilestoneData(),done=all.filter(x=>x[1]).length;
 milestones.append(atlasElement('small','',`JOURNEY MILESTONES · ${done} / ${all.length}`));
 const rail=atlasElement('div','milestoneRail');for(const [name,complete]of all){const dot=atlasElement('span',complete?'complete':'');dot.title=name;dot.setAttribute('aria-label',name+(complete?' complete':' ahead'));rail.append(dot);}milestones.append(rail);
}
function atlasShowDetails(){
 if(!atlasPlaceKnown(ATLAS_LOCATIONS[atlasPick]?.[0]))atlasPick=0;
 const p=ATLAS_LOCATIONS[atlasPick],q=atlasQuests.find(q=>q.id===atlasTrackedQuest);
 const $=id=>document.getElementById(id),area=atlasCurrentArea();
 $('atlasAreaLabel').textContent=p[0]===area?'YOUR CURRENT AREA':'SELECTED AREA';
 const description=atlasPlaceDescription(p);
 $('atlasName').textContent=description.title;$('atlasText').textContent=description.detail;
 $('atlasServices').replaceChildren(atlasElement('strong','',description.service));
 if(typeof refreshFlightOption==='function')refreshFlightOption();
 $('atlasTrackedTitle').textContent=q?.title||'No quest tracked';
 $('atlasTrackedObjective').textContent=q?.detail||'Open Quests to choose your next objective.';
 $('atlasTrackedDestination').textContent=q?'◆ '+q.place:'';
 const path=atlasRouteBetween(area,q?.place),line=$('atlasTrackedRoute');
 if(line){let connected=false;line.setAttribute('d',path.map(name=>{if(!atlasPlaceKnown(name)){connected=false;return '';}const p=ATLAS_LOCATIONS.find(p=>p[0]===name);if(!p)return '';const segment=(connected?'L':'M')+p[1]+','+p[2];connected=true;return segment;}).join(' '));}
 const you=$('atlasPlayerMarker'),where=ATLAS_LOCATIONS.find(p=>p[0]===area&&atlasPlaceKnown(p[0]));you.hidden=!where;
 if(where){you.style.left=where[1]+'px';you.style.top=where[2]+'px';you.setAttribute('aria-label','Your current area: '+atlasDisplayName(area));}
 document.querySelectorAll('.atlasPlace').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.placeIndex)===atlasPick);b.classList.toggle('tracked-place',ATLAS_LOCATIONS[Number(b.dataset.placeIndex)]?.[0]===q?.place);});
 $('atlasDetails').classList.add('settled');
 const cursor=$('atlasCursor');cursor.style.left=p[1]+'px';cursor.style.top=p[2]+'px';
 const target=q&&atlasPlaceKnown(q.place)&&ATLAS_LOCATIONS.find(p=>p[0]===q.place),marker=$('atlasQuestMarker');
 marker.hidden=true;if(target){marker.style.left=target[1]+'px';marker.style.top=target[2]+'px';marker.title=q.title;marker.setAttribute('aria-label',q.title+' at '+q.place);}
}
function renderQuestAtlas(){
 if(atlasJournalOpen)return;
 if(!atlasPlaceKnown(ATLAS_LOCATIONS[atlasPick]?.[0]))atlasPick=0;
 const p=ATLAS_LOCATIONS[atlasPick],view=document.getElementById('atlasViewport');
 atlasPan.z=Math.max(1.2,Math.min(2.6,view.clientHeight/340));
 atlasPan.x=view.clientWidth/2-p[1]*atlasPan.z;atlasPan.y=view.clientHeight/2-p[2]*atlasPan.z;
 atlasApplyPan();atlasShowDetails();
}
function bindQuestAtlas(){
 document.getElementById('atlasCompassGotIt').addEventListener('click',atlasDismissCompassTutorial);
 const view=document.getElementById('atlasViewport'),surface=document.getElementById('atlasSurface');
 document.getElementById('atlasClose').addEventListener('click',closeAtlas);
 document.getElementById('atlasQuests').addEventListener('click',atlasOpenJournal);
 document.getElementById('atlasQuestsBack').addEventListener('click',atlasBack);
 document.getElementById('atlasQuestsClose').addEventListener('click',closeAtlas);
 document.getElementById('atlasFocus').addEventListener('click',()=>{if(!atlasSelectedComplete)atlasTrack(atlasSelectedQuest);});
 document.getElementById('atlasWhole').addEventListener('click',atlasShowWhole);
 document.getElementById('atlasHere').addEventListener('click',()=>{const area=atlasCurrentArea(),i=ATLAS_LOCATIONS.findIndex(p=>p[0]===area);if(i>=0){atlasPick=i;atlasExpandDetails(false);renderQuestAtlas();}});

 for(const type of ['pointerdown','pointermove','pointerup'])document.getElementById('atlasMapTools').addEventListener(type,e=>e.stopPropagation());
 const resetGesture=()=>{
  const a=[...atlasPointers.values()];
  atlasGesture=a.length>1?{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),...{panX:atlasPan.x,panY:atlasPan.y,z:atlasPan.z},moved:true}:
   a.length?{x:a[0].x,y:a[0].y,panX:atlasPan.x,panY:atlasPan.y,z:atlasPan.z,moved:false}:null;
 };
 view.addEventListener('pointerdown',e=>{if(e.button>0)return;atlasIgnoreClick=false;e.preventDefault();view.setPointerCapture(e.pointerId);const r=atlasViewBounds||(atlasViewBounds=view.getBoundingClientRect());atlasPointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});surface.classList.add('dragging');EmberAtlasMotion.gesture(true);resetGesture();atlasGesture.placeIndex=e.target.closest?.('.atlasPlace')?.dataset.placeIndex;});
 view.addEventListener('pointermove',e=>{
  if(!atlasPointers.has(e.pointerId)||!atlasGesture)return;e.preventDefault();const r=atlasViewBounds||(atlasViewBounds=view.getBoundingClientRect());atlasPointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});
  const a=[...atlasPointers.values()],g=atlasGesture;
  if(a.length>1){
   const x=(a[0].x+a[1].x)/2,y=(a[0].y+a[1].y)/2,z=Math.max(.22,Math.min(4,g.z*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/Math.max(1,g.d)));
   atlasPan={x:x-(g.x-g.panX)*z/g.z,y:y-(g.y-g.panY)*z/g.z,z};
  }else{const dx=a[0].x-g.x,dy=a[0].y-g.y;if(Math.hypot(dx,dy)>6)g.moved=true;atlasPan.x=g.panX+dx;atlasPan.y=g.panY+dy;}
  if(g.moved||a.length>1)atlasExpandDetails(false);
  atlasSchedulePan();
 });
 const end=e=>{
  const a=atlasPointers.get(e.pointerId),g=atlasGesture;atlasIgnoreClick=!!g?.moved||e.type==='pointercancel';
  if(a&&g&&!g.moved&&e.type==='pointerup'){
   const x=(a.x-atlasPan.x)/atlasPan.z,y=(a.y-atlasPan.y)/atlasPan.z;
   const picks=ATLAS_LOCATIONS.map((p,i)=>({i,known:atlasPlaceKnown(p[0]),d:Math.hypot(p[1]-x,p[2]-y)})).filter(p=>p.known).sort((a,b)=>a.d-b.d);
   const labeled=Number(g.placeIndex);
   if(g.placeIndex!==undefined&&atlasPlaceKnown(ATLAS_LOCATIONS[labeled]?.[0])||picks[0]?.d*atlasPan.z<45){atlasSelectPlace(g.placeIndex!==undefined?labeled:picks[0].i);}
  }
  atlasPointers.delete(e.pointerId);resetGesture();if(atlasGesture)atlasGesture.moved=true;else {surface.classList.remove('dragging');atlasViewBounds=null;EmberAtlasMotion.gesture(false);}
 };
 view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);
 view.addEventListener('wheel',e=>{e.preventDefault();atlasExpandDetails(false);const r=view.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,old=atlasPan.z,z=Math.max(.22,Math.min(4,old*Math.exp(-e.deltaY*.001)));atlasPan={x:x-(x-atlasPan.x)*z/old,y:y-(y-atlasPan.y)*z/old,z};EmberAtlasMotion.gesture(true);atlasSchedulePan();},{passive:false});
}
bindQuestAtlas();
