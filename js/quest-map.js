/* The atlas follows saved story/knowledge state; it never advances a quest. */
let atlasTrackedQuest='main',atlasQuests=[],atlasPan={x:0,y:0,z:1.6},atlasPointers=new Map();
let atlasGesture=null,atlasJournalKnown={},atlasIgnoreClick=false,atlasCompassTutorialSeen=false;
let atlasJournalOpen=false,atlasSelectedQuest='main',atlasSelectedComplete=false;
function atlasQuestKind(q){return ['main','bramble','smith','shield','thornwell-royals'].includes(q?.id)||q?.id?.startsWith('temple:')?'main':q?.id==='trials'?'trial':'side';}
function atlasQuestTrackLock(q){
 if(q?.id==='temple:Sandspire'&&!breathHas.lightning)return 'Complete Forgewick Temple and claim its Lightning Heartstone before tracking Sandspire Temple.';
 if(q?.id==='temple:Hollybeck'&&!breathHas.ice)return 'Complete Sandspire Temple and claim its Ice Heartstone before tracking Hollybeck Temple.';
 return '';
}
function atlasJournalAllowed(id){return ['main','bramble','smith','shield','thornwell-royals','graveyard','gift:lamp','trials','temple:Forgewick','temple:Sandspire','temple:Hollybeck'].includes(id)||id==='fishing'&&odoRodReferral;}
function atlasObjective(id,title,place,detail){return {id,title,place,detail};}
function atlasBrambleClue(){return dragonLearned('bramble-owner')?'Bring Bramble to Rowan the Hunter in the Copper Cup tavern.':'Ask the people of Thornwell who the friendly dog belongs to.';}
function atlasJourneyObjective(){
 const o=(title,place,detail,questId='main')=>({...atlasObjective('main',title,place,detail),questId});
 const opening=[
  ['Start the morning','Millwood','Leave home and speak with Hettie by the cows.'],
  ['Speak with Hettie','Millwood','Find Hettie by the cows near the mill.'],
  ['Collect six eggs','Millwood','Pick up the basket of eggs at the coop behind the mill.'],
  ['Take the eggs to Maddock','Elder’s Home','Follow the northern lane. Speak to the guards blocking the road.'],
  ['Visit Elder Maddock','Elder’s Home','Enter Maddock’s house and deliver the eggs.'],
  ['Leave Maddock’s house','Elder’s Home','Step outside and speak with Maddock before going north.'],
  ['Investigate the crash','Northern Woods','Follow the path north of Maddock’s house toward the crash.'],
  ['Find what the dragon left','Northern Woods','Approach the crash site and collect the egg.'],
  ['Bring the egg to Maddock','Elder’s Home','Maddock is waiting outside his house. Speak with him.']
 ];
 if(quest<Q.DONE)return o(...opening[quest]);
 if(wonAll)return o('A free Emberfell','Millwood','Return to your friends, or select an unfinished side quest below.');
 const royal=typeof thornwellStoryObjective==='function'&&thornwellStoryObjective();if(royal)return o(...royal,brambleQuest<2?'bramble':'thornwell-royals');
 if(brambleQuest<2)return o(brambleQuest===1?'Find Bramble’s owner':'Follow the eastern road','Thornwell',brambleQuest===1?atlasBrambleClue():'Travel east through the camps to Thornwell and speak with the people you meet.',brambleQuest===1?'bramble':'main');
 if(!smithUpgrade&&dragonLearned('smith'))return o('Visit Dunstan','Forgewick','Speak with the blacksmith about improving Maddock’s sword and your armour.','smith');
 if(smithUpgrade&&!charm.edge)return o('Finish with Dunstan','Forgewick','Finish your conversation with Dunstan.','smith');
 if(!glassShield&&dragonLearned('shield'))return o('Visit Sela','Forgewick','Ask the glassblower about his protective shield.','shield');
 for(const [key,town]of [['lightning','Forgewick'],['ice','Sandspire'],['shadow','Hollybeck']]){
  if(!breathHas[key]&&dragonLearned('temple:'+town))return o(town+' Heartstone',town+' Temple','Claim the '+({lightning:'Lightning',ice:'Ice',shadow:'Shadow'}[key])+' Heartstone in '+town+' Temple to strengthen Aurelius.','temple:'+town);
 }
 if(!breathHas.lightning||!breathHas.ice||!breathHas.shadow)return o('Ask about the road ahead',breathHas.lightning?'Forgewick Temple':'Forgewick',breathHas.lightning?'Speak with Alderic about what you found.':'Speak with the people of Forgewick and follow the leads they share.');
 return o('Face King Halvard','Cinderhold Castle','Cross the highlands through Frostcrag and Ashcrag, then follow the volcanic road to Cinderhold.');
}
function atlasMainObjective(){
 if(!dragonLearned('king-plan')||wonAll)return atlasJourneyObjective();
 return {...atlasObjective('main','Overthrow King Halvard','Cinderhold Castle',
  dragonLearned('heartstone-plan')?'End the dragon hunter’s fifty-year rule. Strengthen Aurelius with the three temple Heartstones, then face Halvard at Cinderhold.':'Maddock believes we must end the dragon hunter’s fifty-year rule. Grow stronger together before facing Halvard at Cinderhold.'),questId:'main'};
}
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
 const royal=typeof thornwellStoryObjective==='function'&&thornwellStoryObjective();
 if(royal&&brambleQuest>=2)add('thornwell-royals',...royal);
 if(odoRodReferral&&!fishingPole)add('fishing','Calder’s spare rod','Route 1','Ask Calder at the first camp on the road from Millwood to Thornwell for his spare fishing rod.');
 if((dragonLearned('bramble')||brambleQuest===1)&&brambleQuest<2)add('bramble','Find Bramble’s person','Thornwell',atlasBrambleClue());
 if(dragonLearned('smith')&&(!smithUpgrade||!charm.edge))add('smith','Dunstan’s craftsmanship','Forgewick','Visit Dunstan at his forge to improve your sword and armour.');
 if(dragonLearned('shield')&&!glassShield)add('shield','Sela’s glasswork','Forgewick','Speak to Sela in his workshop behind the glass shop about his shield.');
 if(dragonLearned('lantern')&&!charm.lamp)add('gift:lamp','Torvald’s lantern for the mines','Hollybeck','Find Sverre in Hollybeck and ask for Torvald’s Hollybeck Lantern. Carry it to see in the dark mine galleries.');
 if(dragonLearned('graveyard')&&!charm.wake)add('graveyard','The restless graveyard','Hollybeck Graveyard','Investigate the reports of restless spirits in the graveyard.');
 for(const [key,town] of [['lightning','Forgewick'],['ice','Sandspire'],['shadow','Hollybeck']])
  if(dragonLearned('temple:'+town)&&!breathHas[key])add('temple:'+town,town+' Heartstone',town+' Temple','Claim the '+({lightning:'Lightning',ice:'Ice',shadow:'Shadow'}[key])+' Heartstone in '+town+' Temple to strengthen Aurelius.');
 if(dragonLearned('trials')&&!atlasQuestComplete('trials'))add('trials','The demon’s trials',cinderSeal?'Cinderhold Castle':'Witchmoor',!cinderSeal?'Return to Witchmoor and ask about the trials.':!trialSealPlaced?'Find where the Cinderhold Seal belongs.':'Return to the throne room to challenge the demon.');
 return out;
}
// Resolve the journal's destination in game coordinates, never in the
// illustrated atlas's deliberately compressed picture coordinates.
function atlasQuestTarget(q){
 if(!q)return null;
 const element={'Forgewick Temple':'lightning','Sandspire Temple':'ice','Hollybeck Temple':'shadow'}[q.place];
 if(element){const c=CHESTS.find(c=>c.gift===element);if(c)return {map:c.map,x:c.x*TS+TS/2,y:c.y*TS+TS+24,heartstone:true};}
 if(q.id==='bramble'||['main','thornwell-royals'].includes(q.id)&&/Return Bramble|Bramble.*owner/.test(q.title)){
  if(!dragonLearned('bramble-owner')&&brambleQuest<2){
   const town=W.maps.world.features.find(f=>f.kind==='area'&&atlasCanonical(f.label||f.place)==='Thornwell');
   return town?{map:'world',x:(town.x0+town.x1)/2*TS,y:(town.y0+town.y1)/2*TS}:null;
  }
  const rowan=MAPID==='tavern'&&npcs.find(n=>n.n==='Rowan the Hunter');return {map:'tavern',x:rowan?.x??256,y:(rowan?.y??220)+32};
 }
 if((q.id==='main'||q.id==='thornwell-royals')&&/king’s summons/.test(q.title)){const king=typeof thornwellKing==='function'&&thornwellKing();return {map:'tavern',x:king?.x??396,y:(king?.y??170)+43};}
 const named={fishing:'Calder',bramble:'Rowan the Hunter',smith:'Dunstan',shield:'Sela','gift:lamp':'Sverre'};
 let name=named[q.id];
 if(q.id==='main'){
  if(/Dunstan/.test(q.title))name='Dunstan';
  else if(/Sela/.test(q.title))name='Sela';
  else if(/Bramble.*owner|Return Bramble/.test(q.title))name='Rowan the Hunter';
 }
 for(const [id,map] of Object.entries(W.maps)){
  if(map.templeLegacy)continue;
  const list=id===MAPID?npcs:map.npcs||[];
  const n=list.find(n=>!n.away&&!n.editorDeleted&&(name?n.n===name:q.id.startsWith('gift:')&&n.charm===q.id.slice(5)));
  if(n)return {map:id,x:n.x,y:n.y+32};
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
 ['Millwood','Route 1','Thornwell','Route 2','Forgewick','Route 3','The Oasis','Sandspire','Route 4','Coralmere','Route 5','Hollybeck','Route 6','Frostcrag','Ashcrag','Route 7','Cinderhold Castle'],
 ['Thornwell','Forgefalls'],['Forgewick','Forgewick Temple'],['Sandspire','Sandspire Temple'],
 ['Route 5','Witchmoor','Dreadmarsh'],['Hollybeck','Hollybeck Graveyard'],['Hollybeck','Hollybeck Temple']
];
const ATLAS_PLACE_NOTES={
 'Millwood':['Home & farm','Nan and Corin’s home, Hettie’s farm, and Odo by the water.'],
 'Elder’s Home':['Maddock','The elder’s house beside the northern lane.'],
 'Northern Woods':['Northern trail','The woods north of Millwood.'],
 'Thornwell':['School · Tavern · Inn','Visit the school, tavern and inn, and ask the townspeople for local knowledge.'],
 'Forgefalls':['Fishing pools','Fish the quiet pools below the falls once you have a rod.'],
 'Forgewick':['Blacksmith · Glassblower','Dunstan works at the forge; Sela’s glasswork is nearby.'],
 'Forgewick Temple':['Ancient temple','An old stone hall southeast of Forgewick.'],
 'Sandspire':['Desert market','Caravans, shaded streets, water, and local supplies.'],
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
 for(const q of atlasQuests){const id=q.questId||q.id;if(id!=='main')atlasJournalKnown[id]={...q,id};}
 if(!atlasQuests.some(q=>q.id===atlasTrackedQuest&&!atlasQuestTrackLock(q)))atlasTrackedQuest='main';
}
function atlasQuestStages(q){
 if(q?.id==='main')return atlasMilestoneData();
 if(q?.id==='thornwell-royals')return [['Return Bramble',brambleQuest>=3],...(thornwellRoyal.stage>=2?[['Answer the king’s summons',thornwellRoyal.stage>=4]]:[]),...(thornwellRoyal.stage>=5?[['Wait for the royal party',thornwellRoyal.stage>=6]]:[]),...(thornwellRoyal.stage>=6?[['Meet Aurelius at Forgefalls',thornwellRoyal.stage>=7]]:[])];
 if(q?.id==='bramble')return [['Meet Bramble',brambleQuest>=1],['Find his owner',dragonLearned('bramble-owner')||brambleQuest>=2],['Bring him home',brambleQuest>=2]];
 if(q?.id==='trials')return [['Ask about the trials',!!cinderSeal],...(cinderSeal?[['Place the seal',!!trialSealPlaced]]:[]),...(trialSealPlaced?[['Win the trial',atlasQuestComplete('trials')]]:[])];
 return [['Learn the lead',true],['Reach '+(q?.place||'the destination'),atlasCurrentArea()===q?.place||atlasQuestComplete(q?.id||'')],['Collect the reward',atlasQuestComplete(q?.id||'')]];
}
function captureQuestJournal(){atlasSyncJournal();return {tracked:atlasTrackedQuest,known:atlasJournalKnown,compassTutorialSeen:atlasCompassTutorialSeen};}
function restoreQuestJournal(saved){
 atlasCompassTutorialSeen=!!saved?.compassTutorialSeen;atlasTrackedQuest=typeof saved?.tracked==='string'?saved.tracked:'main';atlasJournalKnown={};atlasJournalOpen=false;atlasSelectedQuest=atlasTrackedQuest;atlasSelectedComplete=false;
 for(const [id,q]of Object.entries(saved?.known||{}))if(q&&typeof q.title==='string'&&typeof q.detail==='string'&&ATLAS_LOCATIONS.some(p=>p[0]===q.place))atlasJournalKnown[id]={id,title:q.title,detail:q.detail,place:q.place};
}
function atlasCompletedEntries(){
 const known={...atlasJournalKnown};
 const earned=[['fishing','Calder’s spare rod','Route 1','Received Calder’s fishing rod.'],['bramble','Bramble’s homecoming','Thornwell','Reunited Bramble with Rowan.'],['smith','Dunstan’s craftsmanship','Forgewick','Improved Corin’s sword and armor.'],['shield','Sela’s glasswork','Forgewick','Received Sela’s protective shield.'],['graveyard','Book of the Dead','Hollybeck Graveyard','Unlocked allied-wraith summoning.'],['gift:lamp','Torvald’s lantern','Hollybeck','Obtained the lantern carried by Sverre.'],...['Forgewick','Sandspire','Hollybeck'].map(t=>['temple:'+t,t+' Heartstone',t+' Temple','Recovered the temple Heartstone.'])];
 for(const [id,title,place,detail]of earned)if(atlasQuestComplete(id))known[id]={id,title,place,detail};
 return [...new Map(Object.values(known).filter(q=>atlasQuestComplete(q.id)).map(q=>{
  const id=q.id==='gift:wake'?'graveyard':q.id==='gift:edge'?'smith':q.id;return [id,{...q,id}];
 })).values()].filter(q=>atlasJournalAllowed(q.id));
}
function atlasCanonical(label){
 const aliases={'eldershome':'Elder’s Home','sporehollow':'Sporehollow','northshroompassfield':'Northern Shroom Field','cinderhold':'Cinderhold Castle'};
 const key=String(label||'').replace(/[^a-z]/gi,'').toLowerCase();
 return aliases[key]||ATLAS_LOCATIONS.find(p=>p[0].replace(/[^a-z]/gi,'').toLowerCase()===key)?.[0]||null;
}
function atlasCurrentArea(){
 if(typeof MAPID==='undefined'||typeof P==='undefined')return null;
 const world=W.maps.world;
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
 templeCompass.cache=null;atlasTrackedQuest=q.id;atlasCompassTutorialSeen=true;
 if(typeof saveGame==='function')saveGame();
 // Tracking always resumes play, including when the map came from inventory.
 atlasReturn='game';closeAtlas();
 if(typeof compassCelebrateTracking==='function')compassCelebrateTracking();
 toast('Tracking quest: '+q.title+' — follow the compass.');
 return true;
}
function atlasBuildPlaces(){
 const places=document.getElementById('atlasPlaces');places.replaceChildren();
 for(const [i,p]of ATLAS_LOCATIONS.entries()){
  const b=atlasElement('button','atlasPlace'+(/^Route/.test(p[0])?' routePlace':['Millwood','Thornwell','Forgewick','Sandspire','Coralmere','Hollybeck','Cinderhold Castle'].includes(p[0])?' townPlace':''),p[0]);b.type='button';b.style.left=p[1]+'px';b.style.top=p[2]+'px';b.dataset.placeIndex=i;
  b.setAttribute('aria-label','Explore '+p[0]);b.onclick=e=>{e.stopPropagation();if(e.detail&&atlasIgnoreClick)return;atlasPick=i;atlasShowDetails();};places.append(b);
 }
 const point=name=>ATLAS_LOCATIONS.find(p=>p[0]===name);
 const paths=ATLAS_CONNECTIONS.map(route=>route.map(point).filter(Boolean).map((p,i)=>(i?'L':'M')+p[1]+','+p[2]).join(' '));
 document.getElementById('atlasRoutes').innerHTML='<svg viewBox="0 0 1536 512" aria-hidden="true">'+paths.map(d=>'<path class="realmRoad" d="'+d+'"/>').join('')+'<path id="atlasTrackedRoute" d=""/></svg>';
}
function atlasZoom(amount){
 const view=document.getElementById('atlasViewport'),x=view.clientWidth/2,y=view.clientHeight/2,old=atlasPan.z,z=Math.max(.22,Math.min(4,old*amount));
 atlasPan={x:x-(x-atlasPan.x)*z/old,y:y-(y-atlasPan.y)*z/old,z};atlasApplyPan();
}
function atlasShowWhole(){
 const view=document.getElementById('atlasViewport');atlasPan.z=Math.max(.22,Math.min(view.clientWidth/1536,view.clientHeight/512)*.97);atlasPan.x=0;atlasPan.y=0;atlasApplyPan();
}
function atlasDismissCompassTutorial(){
 const tutorial=document.getElementById('atlasCompassTutorial');
 if(tutorial.hidden)return false;
 atlasCompassTutorialSeen=true;tutorial.hidden=true;saveGame();return true;
}
function atlasBegin(){
 if(typeof rememberFlightVisit==='function')rememberFlightVisit();
 window.EmberEncounterCard?.layout();
 document.getElementById('atlasCompassTutorial').hidden=atlasCompassTutorialSeen;
 atlasSyncJournal();atlasBuildPlaces();
 atlasPointers.clear();atlasGesture=null;
 atlasSetJournal(false);document.getElementById('atlasDetails').scrollTop=0;
 const i=ATLAS_LOCATIONS.findIndex(p=>p[0]===atlasCurrentArea());atlasPick=i>=0?i:0;
 renderAtlas();
}
function atlasApplyPan(){
 const view=document.getElementById('atlasViewport'),s=document.getElementById('atlasSurface'),z=atlasPan.z;
 const limit=(v,extent,size)=>extent<=size?(size-extent)/2:Math.max(size-extent,Math.min(0,v));
 atlasPan.x=limit(atlasPan.x,1536*z,view.clientWidth);atlasPan.y=limit(atlasPan.y,512*z,view.clientHeight);
 s.style.transform=`translate(${atlasPan.x}px,${atlasPan.y}px) scale(${z})`;
 s.style.setProperty('--map-label-scale',String(Math.min(2.5,Math.max(.5,1/z))));
 s.classList.toggle('mapOverview',z<1.05);
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
 const area=atlasCurrentArea(),path=atlasRouteBetween(area,q?.place),via=path.slice(1,-1).filter(x=>!/^Route/.test(x));
 $('atlasRouteHint').textContent=atlasSelectedComplete||!q||!area?'':area===q.place?'You are in this area. Follow the objective above.':via.length?'From '+area+' · via '+via.slice(0,3).join(' → ')+(via.length>3?' → …':''):'From '+area+' · toward '+q.place;
 const steps=$('atlasQuestSteps');steps.replaceChildren();
 if(q&&!atlasSelectedComplete){
  const stages=atlasQuestStages(q),active=stages.findIndex(([,done])=>!done);
  if(q.id==='main'){
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
 const p=ATLAS_LOCATIONS[atlasPick],q=atlasQuests.find(q=>q.id===atlasTrackedQuest);
 const $=id=>document.getElementById(id),area=atlasCurrentArea();
 $('atlasAreaLabel').textContent=p[0]===area?'YOUR CURRENT AREA':'SELECTED AREA';
 $('atlasName').textContent=p[0];$('atlasText').textContent=p[3];
 const notes=ATLAS_PLACE_NOTES[p[0]]||['The roads of Emberfell',p[3]];
 $('atlasServices').replaceChildren(atlasElement('strong','',notes[0]));
 if(typeof refreshFlightOption==='function')refreshFlightOption();
 $('atlasTrackedTitle').textContent=q?.title||'No quest tracked';
 $('atlasTrackedObjective').textContent=q?.detail||'Open Quests to choose your next objective.';
 $('atlasTrackedDestination').textContent=q?'◆ '+q.place:'';
 const path=atlasRouteBetween(area,q?.place),line=$('atlasTrackedRoute');
 if(line)line.setAttribute('d',path.map(name=>ATLAS_LOCATIONS.find(p=>p[0]===name)).filter(Boolean).map((p,i)=>(i?'L':'M')+p[1]+','+p[2]).join(' '));
 const you=$('atlasPlayerMarker'),where=ATLAS_LOCATIONS.find(p=>p[0]===area);you.hidden=!where;
 if(where){you.style.left=where[1]+'px';you.style.top=where[2]+'px';you.setAttribute('aria-label','Your current area: '+area);}
 document.querySelectorAll('.atlasPlace').forEach(b=>b.classList.toggle('selected',Number(b.dataset.placeIndex)===atlasPick));
 $('atlasDetails').classList.add('settled');
 const cursor=$('atlasCursor');cursor.style.left=p[1]+'px';cursor.style.top=p[2]+'px';
 const target=q&&ATLAS_LOCATIONS.find(p=>p[0]===q.place),marker=$('atlasQuestMarker');
 marker.hidden=!target;if(target){marker.style.left=target[1]+'px';marker.style.top=target[2]+'px';marker.title=q.title;marker.setAttribute('aria-label',q.title+' at '+q.place);}
}
function renderQuestAtlas(){
 if(atlasJournalOpen)return;
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
 document.getElementById('atlasHere').addEventListener('click',()=>{const area=atlasCurrentArea(),i=ATLAS_LOCATIONS.findIndex(p=>p[0]===area);if(i>=0){atlasPick=i;renderQuestAtlas();}});
 document.getElementById('atlasZoomIn').addEventListener('click',()=>atlasZoom(1.3));
 document.getElementById('atlasZoomOut').addEventListener('click',()=>atlasZoom(1/1.3));
 for(const type of ['pointerdown','pointermove','pointerup'])document.getElementById('atlasMapTools').addEventListener(type,e=>e.stopPropagation());
 const resetGesture=()=>{
  const a=[...atlasPointers.values()];
  atlasGesture=a.length>1?{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),...{panX:atlasPan.x,panY:atlasPan.y,z:atlasPan.z},moved:true}:
   a.length?{x:a[0].x,y:a[0].y,panX:atlasPan.x,panY:atlasPan.y,z:atlasPan.z,moved:false}:null;
 };
 view.addEventListener('pointerdown',e=>{if(e.button>0)return;atlasIgnoreClick=false;e.preventDefault();view.setPointerCapture(e.pointerId);const r=view.getBoundingClientRect();atlasPointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});surface.classList.add('dragging');resetGesture();atlasGesture.placeIndex=e.target.closest?.('.atlasPlace')?.dataset.placeIndex;});
 view.addEventListener('pointermove',e=>{
  if(!atlasPointers.has(e.pointerId)||!atlasGesture)return;e.preventDefault();const r=view.getBoundingClientRect();atlasPointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});
  const a=[...atlasPointers.values()],g=atlasGesture;
  if(a.length>1){
   const x=(a[0].x+a[1].x)/2,y=(a[0].y+a[1].y)/2,z=Math.max(.22,Math.min(4,g.z*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/Math.max(1,g.d)));
   atlasPan={x:x-(g.x-g.panX)*z/g.z,y:y-(g.y-g.panY)*z/g.z,z};
  }else{const dx=a[0].x-g.x,dy=a[0].y-g.y;if(Math.hypot(dx,dy)>6)g.moved=true;atlasPan.x=g.panX+dx;atlasPan.y=g.panY+dy;}
  atlasApplyPan();
 });
 const end=e=>{
  const a=atlasPointers.get(e.pointerId),g=atlasGesture;atlasIgnoreClick=!!g?.moved||e.type==='pointercancel';
  if(a&&g&&!g.moved&&e.type==='pointerup'){
   const x=(a.x-atlasPan.x)/atlasPan.z,y=(a.y-atlasPan.y)/atlasPan.z;
   const picks=ATLAS_LOCATIONS.map((p,i)=>({i,d:Math.hypot(p[1]-x,p[2]-y)})).sort((a,b)=>a.d-b.d);
   const labeled=Number(g.placeIndex);
   if(g.placeIndex!==undefined&&ATLAS_LOCATIONS[labeled]||picks[0].d*atlasPan.z<45){atlasPick=g.placeIndex!==undefined?labeled:picks[0].i;atlasShowDetails();}
  }
  atlasPointers.delete(e.pointerId);resetGesture();if(atlasGesture)atlasGesture.moved=true;else surface.classList.remove('dragging');
 };
 view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);
 view.addEventListener('wheel',e=>{e.preventDefault();const r=view.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,old=atlasPan.z,z=Math.max(.22,Math.min(4,old*Math.exp(-e.deltaY*.001)));atlasPan={x:x-(x-atlasPan.x)*z/old,y:y-(y-atlasPan.y)*z/old,z};atlasApplyPan();},{passive:false});
}
bindQuestAtlas();
