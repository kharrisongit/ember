/* The atlas follows saved story/knowledge state; it never advances a quest. */
let atlasTrackedQuest='main',atlasQuests=[],atlasPan={x:0,y:0,z:1.6},atlasPointers=new Map();
let atlasGesture=null,atlasTab='quest',atlasJournalKnown={},atlasIgnoreClick=false,atlasCompassTutorialSeen=false;
function atlasQuestKind(q){return q?.id==='main'||q?.id==='thornwell-royals'||q?.id?.startsWith('temple:')?'main':q?.id==='trials'?'trial':'side';}
function atlasObjective(id,title,place,detail){return {id,title,place,detail};}
function atlasMainObjective(){
 const o=(title,place,detail)=>atlasObjective('main',title,place,detail);
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
 const royal=typeof thornwellStoryObjective==='function'&&thornwellStoryObjective();if(royal)return o(...royal);
 if(brambleQuest<2)return o(brambleQuest===1?'Find Bramble’s owner':'Follow the eastern road','Thornwell',brambleQuest===1?'Ask about Bramble in Thornwell. Rowan the Hunter is in the Copper Cup tavern.':'Travel east through the camps to Thornwell and speak with the people you meet.');
 if(!smithUpgrade)return o('Visit Dunstan','Forgewick','Speak with the blacksmith about improving Maddock’s sword and your armour.');
 if(!charm.edge)return o('Finish with Dunstan','Forgewick','Speak with Dunstan again about the gift that strengthens your blade.');
 if(!glassShield)return o('Visit Sela','Forgewick','Ask the glassblower about her protective shield.');
 if(!breathHas.lightning)return o('The Lightning Heartstone','Forgewick Temple','Explore the temple southeast of Forgewick and claim its Heartstone.');
 if(!breathHas.ice)return o('The Ice Heartstone','Sandspire Temple','Follow the road east to Sandspire. Explore its temple to the southeast.');
 if(!breathHas.shadow)return o('The Shadow Heartstone','Hollybeck Temple','Travel through Coralmere to Hollybeck. Follow the temple trail east and north.');
 return o('Face King Halvard','Cinderhold Castle','Cross the highlands through Frostcrag and Ashcrag, then follow the volcanic road to Cinderhold.');
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
 const out=[atlasMainObjective()],add=(...args)=>out.push(atlasObjective(...args));
 const royal=typeof thornwellStoryObjective==='function'&&thornwellStoryObjective();
 if(royal)add('thornwell-royals',...royal);
 if((dragonLearned('fishing')||odoRodReferral)&&!fishingPole)add('fishing','Calder’s spare rod','Route 1','Ask Calder at the first camp on the road from Millwood to Thornwell for his spare fishing rod.');
 if((dragonLearned('bramble')||brambleQuest===1)&&brambleQuest<2)add('bramble','Find Bramble’s person','Thornwell',dragonLearned('bramble-owner')?'Bring Bramble to Rowan the Hunter in the Copper Cup tavern.':'Ask the people of Thornwell who the friendly dog belongs to.');
 if(dragonLearned('smith')&&!smithUpgrade)add('smith','Dunstan’s craftsmanship','Forgewick','Visit Dunstan at his forge to improve your sword and armour.');
 if(dragonLearned('shield')&&!glassShield)add('shield','Sela’s glasswork','Forgewick','Speak to Sela in the glass shop about her shield.');
 if(dragonLearned('lantern')&&!charm.lamp)add('gift:lamp','Torvald’s lantern for the mines','Hollybeck','Find Sverre in Hollybeck and ask for Torvald’s Hollybeck Lantern. Carry it to see in the dark mine galleries.');
 if(dragonLearned('graveyard')&&!charm.wake)add('graveyard','Unlock summoning: Book of the Dead','Hollybeck Graveyard','Defeat every wave of ghosts and claim the Book of the Dead to summon two allied wraiths in battle.');
 for(const {n,map} of dragonGiftLeads()){
  if(n.charm==='lamp'&&dragonLearned('lantern'))continue;
  const place=atlasPlaceFor(map,n);
  if(place)add('gift:'+n.charm,n.n+'’s gift',place,'Return to '+n.n+' and finish the conversation about their gift.');
 }
 for(const [key,town] of [['lightning','Forgewick'],['ice','Sandspire'],['shadow','Hollybeck']])
  if(dragonLearned('temple:'+town)&&!breathHas[key])add('temple:'+town,town+' Heartstone',town+' Temple','Explore the temple and claim the '+key+' Heartstone.');
 if(dragonLearned('trials'))add('trials','The demon’s trials',cinderSeal?'Cinderhold Castle':'Witchmoor',!cinderSeal?'Speak with the demon at Witchmoor after defeating Halvard.':!trialSealPlaced?'Place the Cinderhold Seal in the chamber adjoining the throne room.':'Return to the throne room to challenge the demon.');
 return out;
}
// Resolve the journal's destination in game coordinates, never in the
// illustrated atlas's deliberately compressed picture coordinates.
function atlasQuestTarget(q){
 if(!q)return null;
 const element={'Forgewick Temple':'lightning','Sandspire Temple':'ice','Hollybeck Temple':'shadow'}[q.place];
 if(element){const c=CHESTS.find(c=>c.gift===element);if(c)return {map:c.map,x:c.x*TS+TS/2,y:c.y*TS+TS+24,heartstone:true};}
 if(q.id==='bramble'||q.id==='main'&&/Return Bramble|Bramble.*owner/.test(q.title)){
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
 'Elder’s Home':['Maddock','The elder’s house and the clearing where Aurelius hatched.'],
 'Northern Woods':['Opening journey','The northern trail, the sword lesson, and the dragon’s crash site.'],
 'Thornwell':['School · Tavern · Inn','Ask at the school for local knowledge. Rowan the Hunter visits the Copper Cup.'],
 'Forgefalls':['Fishing pools','Fish the quiet pools below the falls once you have a rod.'],
 'Forgewick':['Blacksmith · Glassblower','Dunstan works at the forge; Sela’s glasswork is nearby.'],
 'Forgewick Temple':['Lightning Heartstone','An ancient rider temple southeast of Forgewick.'],
 'Sandspire':['Desert market','Caravans, shaded streets, water, and local supplies.'],
 'The Oasis':['Desert refuge','A green landmark southwest of Sandspire.'],
 'Sandspire Temple':['Ice Heartstone','The winding temple trail leads southeast from Sandspire.'],
 'Coralmere':['Harbor · Fish','A coastal town with blossom trees, fishing docks, and supplies for the road.'],
 'Witchmoor':['Maelis · Ferry','Maelis lives north of Dreadmarsh. Reach her side of the marsh by ferry.'],
 'Dreadmarsh':['Wetlands','The deep marsh lies south of Witchmoor.'],
 'Hollybeck':['Winter village','A place to prepare before the highlands. Sverre carries Torvald’s lantern.'],
 'Hollybeck Graveyard':['Restless dead','The graveyard lies northwest of Hollybeck.'],
 'Hollybeck Temple':['Shadow Heartstone','Follow the trail east and north from Hollybeck.'],
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
 ];}
function atlasQuestComplete(id){
 if(id==='main')return !!wonAll;
 if(id==='fishing')return !!fishingPole;
 if(id==='bramble')return brambleQuest>=2;
 if(id==='thornwell-royals')return typeof thornwellRoyal!=='undefined'&&thornwellRoyal.stage>=7;
 if(id==='smith')return !!smithUpgrade;
 if(id==='shield')return !!glassShield;
 if(id==='graveyard')return !!charm.wake;
 if(id==='trials')return typeof trialWins!=='undefined'&&trialWins>0;
 if(id.startsWith('gift:'))return !!charm[id.slice(5)];
 const element={'temple:Forgewick':'lightning','temple:Sandspire':'ice','temple:Hollybeck':'shadow'}[id];
 return element?!!breathHas[element]:false;
}
function atlasSyncJournal(){
 atlasQuests=[...new Map(atlasQuestOptions().map(q=>[q.id,q])).values()];
 for(const q of atlasQuests)if(q.id!=='main')atlasJournalKnown[q.id]={...q};
 if(!atlasQuests.some(q=>q.id===atlasTrackedQuest))atlasTrackedQuest='main';
}
function atlasQuestStages(q){
 if(q?.id==='main')return atlasMilestoneData();
 if(q?.id==='thornwell-royals')return [['Return Bramble',brambleQuest>=3],['Endure the royal audience',thornwellRoyal.stage>=4],['Follow the royal party',thornwellRoyal.stage>=6],['Reunite at Forgefalls',thornwellRoyal.stage>=7]];
 if(q?.id==='bramble')return [['Meet Bramble',brambleQuest>=1],['Find his owner',dragonLearned('bramble-owner')||brambleQuest>=2],['Bring him home',brambleQuest>=2]];
 if(q?.id==='trials')return [['Receive the seal',!!cinderSeal],['Place the seal',!!trialSealPlaced],['Win the trial',atlasQuestComplete('trials')]];
 return [['Learn the lead',true],['Reach '+(q?.place||'the destination'),atlasCurrentArea()===q?.place||atlasQuestComplete(q?.id||'')],['Collect the reward',atlasQuestComplete(q?.id||'')]];
}
function captureQuestJournal(){atlasSyncJournal();return {tracked:atlasTrackedQuest,known:atlasJournalKnown,compassTutorialSeen:atlasCompassTutorialSeen};}
function restoreQuestJournal(saved){
 atlasCompassTutorialSeen=!!saved?.compassTutorialSeen;atlasTrackedQuest=typeof saved?.tracked==='string'?saved.tracked:'main';atlasJournalKnown={};atlasTab='quest';
 for(const [id,q]of Object.entries(saved?.known||{}))if(q&&typeof q.title==='string'&&typeof q.detail==='string'&&ATLAS_LOCATIONS.some(p=>p[0]===q.place))atlasJournalKnown[id]={id,title:q.title,detail:q.detail,place:q.place};
}
function atlasCompletedEntries(){
 const known={...atlasJournalKnown};
 const earned=[['fishing','Calder’s spare rod','Route 1','Received Calder’s fishing rod.'],['bramble','Bramble’s homecoming','Thornwell','Reunited Bramble with Rowan.'],['smith','Dunstan’s craftsmanship','Forgewick','Improved Corin’s sword and armor.'],['shield','Sela’s glasswork','Forgewick','Received Sela’s protective shield.'],['graveyard','Book of the Dead','Hollybeck Graveyard','Unlocked allied-wraith summoning.'],['gift:lamp','Torvald’s lantern','Hollybeck','Obtained the lantern carried by Sverre.'],...['Forgewick','Sandspire','Hollybeck'].map(t=>['temple:'+t,t+' Heartstone',t+' Temple','Recovered the temple Heartstone.'])];
 for(const [id,title,place,detail]of earned)if(atlasQuestComplete(id))known[id]={id,title,place,detail};
 return Object.values(known).filter(q=>atlasQuestComplete(q.id));
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
function atlasSetTab(tab){
 atlasTab=tab;
 for(const id of ['quest','place','completed'])document.getElementById('atlas'+id[0].toUpperCase()+id.slice(1)+'Page').hidden=id!==tab;
 document.querySelectorAll('[data-atlas-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.atlasTab===tab)));
 document.getElementById('atlasDetails').scrollTop=0;
}
function atlasTrack(id){templeCompass.cache=null;atlasTrackedQuest=id;atlasSetTab('quest');atlasBegin();if(typeof saveGame==='function')saveGame();}
function atlasBuildPlaces(){
 const places=document.getElementById('atlasPlaces');places.replaceChildren();
 for(const [i,p]of ATLAS_LOCATIONS.entries()){
  const b=atlasElement('button','atlasPlace'+(/^Route/.test(p[0])?' routePlace':['Millwood','Thornwell','Forgewick','Sandspire','Coralmere','Hollybeck','Cinderhold Castle'].includes(p[0])?' townPlace':''),p[0]);b.type='button';b.style.left=p[1]+'px';b.style.top=p[2]+'px';b.dataset.placeIndex=i;
  b.setAttribute('aria-label','Explore '+p[0]);b.onclick=e=>{e.stopPropagation();if(e.detail&&atlasIgnoreClick)return;atlasPick=i;atlasSetTab('place');atlasShowDetails();};places.append(b);
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
 window.EmberEncounterCard?.layout();
 document.getElementById('atlasCompassTutorial').hidden=atlasCompassTutorialSeen;
 atlasSyncJournal();atlasBuildPlaces();
 const select=document.getElementById('atlasQuestSelect');select.replaceChildren();
 for(const q of atlasQuests){const opt=document.createElement('option');opt.value=q.id;opt.textContent=(atlasQuestKind(q)==='main'?'Main · ':atlasQuestKind(q)==='trial'?'Trial · ':'Side · ')+q.title;select.append(opt);}
 select.value=atlasTrackedQuest;
 atlasPointers.clear();atlasGesture=null;
 atlasSetTab(atlasTab);
 atlasFocusQuest();
}
function atlasFocusQuest(){
 const q=atlasQuests.find(q=>q.id===atlasTrackedQuest)||atlasQuests[0];
 if(!q)return;
 const i=ATLAS_LOCATIONS.findIndex(p=>p[0]===q.place);if(i>=0)atlasPick=i;
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
function atlasShowDetails(){
 const p=ATLAS_LOCATIONS[atlasPick],q=atlasQuests.find(q=>q.id===atlasTrackedQuest);
 document.getElementById('atlasName').textContent=p[0];
 document.getElementById('atlasText').textContent=p[3];
 const $=id=>document.getElementById(id),completed=atlasCompletedEntries(),area=atlasCurrentArea();
 $('atlasQuestCount').textContent=atlasQuests.length+' active · '+completed.length+' complete';
 $('atlasQuestTitle').textContent=q?.title||'The road ahead';
 $('atlasObjective').textContent=q?.detail||'';
 $('atlasQuestKind').textContent=atlasQuestKind(q)==='main'?'MAIN QUEST':atlasQuestKind(q)==='trial'?'REPEATABLE TRIAL':'SIDE QUEST';
 $('atlasQuestDestination').textContent=q?'◆ '+q.place:'';
 const path=atlasRouteBetween(area,q?.place);
 const via=path.slice(1,-1).filter(x=>!/^Route/.test(x));
 $('atlasRouteHint').textContent=!area?'':area===q?.place?'You are in this area. Follow the objective above.':via.length?'From '+area+' · via '+via.slice(0,3).join(' → ')+(via.length>3?' → …':''):'From '+area+' · toward '+(q?.place||p[0]);
 const line=$('atlasTrackedRoute');if(line)line.setAttribute('d',path.map(name=>ATLAS_LOCATIONS.find(p=>p[0]===name)).filter(Boolean).map((p,i)=>(i?'L':'M')+p[1]+','+p[2]).join(' '));
 const steps=$('atlasQuestSteps');steps.replaceChildren();
 const stages=atlasQuestStages(q);
 const active=stages.findIndex(([,done])=>!done);
 if(q?.id==='main'){
  const current=active<0?stages.at(-1):stages[active];
  steps.append(atlasElement('span','questStep current',active<0?'✓ Main journey complete':'◉ Current chapter: '+current[0]));
 }else for(const [i,[label,done]]of stages.entries())steps.append(atlasElement('span','questStep'+(done?' done':i===active?' current':''),(done?'✓ ':i===active?'◉ ':'○ ')+label));
 const milestones=$('atlasMilestones');milestones.replaceChildren();
 const all=atlasMilestoneData(),done=all.filter(x=>x[1]).length;
 milestones.append(atlasElement('small','',`JOURNEY MILESTONES · ${done} / ${all.length}`));
 const rail=atlasElement('div','milestoneRail');for(const [name,complete]of all){const dot=atlasElement('span',complete?'complete':'');dot.title=name;dot.setAttribute('aria-label',name+(complete?' complete':' ahead'));rail.append(dot);}milestones.append(rail);
 const notes=ATLAS_PLACE_NOTES[p[0]]||['The roads of Emberfell',p[3]];
 $('atlasServices').replaceChildren(atlasElement('strong','',notes[0]),atlasElement('p','',notes[1]));
 const local=$('atlasLocalQuests');local.replaceChildren();
 const nearby=atlasQuests.filter(q=>q.place===p[0]);local.append(atlasElement('small','',nearby.length?'QUESTS IN THIS AREA':'No known active quests here'));
 for(const lead of nearby){const b=atlasElement('button','localQuest',lead.title+' →');b.type='button';b.onclick=()=>atlasTrack(lead.id);local.append(b);}
 const history=$('atlasCompletedPage');history.replaceChildren();
 if(!completed.length)history.append(atlasElement('p','journalEmpty','Your finished quests will be recorded here as the journey unfolds.'));
 for(const entry of completed){const b=atlasElement('button','completedQuest');b.type='button';b.append(atlasElement('strong','','✓ '+entry.title),atlasElement('small','',entry.place+' · Completed'));b.onclick=()=>{atlasPick=ATLAS_LOCATIONS.findIndex(p=>p[0]===entry.place);atlasSetTab('place');renderQuestAtlas();};history.append(b);}
 const you=$('atlasPlayerMarker'),where=ATLAS_LOCATIONS.find(p=>p[0]===area);you.hidden=!where;
 if(where){you.style.left=where[1]+'px';you.style.top=where[2]+'px';you.setAttribute('aria-label','Your current area: '+area);}
 document.querySelectorAll('.atlasPlace').forEach(b=>b.classList.toggle('selected',Number(b.dataset.placeIndex)===atlasPick));
 const card=$('atlasQuestCard'),key=q?.id+':'+q?.title;if(card.dataset.questKey!==key){card.dataset.questKey=key;if(!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)card.animate?.([{opacity:.25,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});}
 document.getElementById('atlasDetails').classList.add('settled');
 const cursor=document.getElementById('atlasCursor');cursor.style.left=p[1]+'px';cursor.style.top=p[2]+'px';
 const target=q&&ATLAS_LOCATIONS.find(p=>p[0]===q.place),marker=document.getElementById('atlasQuestMarker');
 marker.hidden=!target;if(target){marker.style.left=target[1]+'px';marker.style.top=target[2]+'px';marker.title=q.title;marker.setAttribute('aria-label',q.title+' at '+q.place);}
}
function renderQuestAtlas(){
 const p=ATLAS_LOCATIONS[atlasPick],view=document.getElementById('atlasViewport');
 atlasPan.z=Math.max(1.2,Math.min(2.6,view.clientHeight/340));
 atlasPan.x=view.clientWidth/2-p[1]*atlasPan.z;atlasPan.y=view.clientHeight/2-p[2]*atlasPan.z;
 atlasApplyPan();atlasShowDetails();
}
function bindQuestAtlas(){
 document.getElementById('atlasCompassGotIt').addEventListener('click',atlasDismissCompassTutorial);
 const view=document.getElementById('atlasViewport'),surface=document.getElementById('atlasSurface');
 document.getElementById('atlasClose').addEventListener('click',closeAtlas);
 document.getElementById('atlasFocus').addEventListener('click',atlasFocusQuest);
 document.getElementById('atlasQuestSelect').addEventListener('change',e=>atlasTrack(e.target.value));
 document.querySelectorAll('[data-atlas-tab]').forEach(b=>b.addEventListener('click',()=>{atlasSetTab(b.dataset.atlasTab);atlasShowDetails();}));
 document.getElementById('atlasWhole').addEventListener('click',atlasShowWhole);
 document.getElementById('atlasHere').addEventListener('click',()=>{const area=atlasCurrentArea(),i=ATLAS_LOCATIONS.findIndex(p=>p[0]===area);if(i>=0){atlasPick=i;atlasSetTab('place');renderQuestAtlas();}});
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
   if(g.placeIndex!==undefined&&ATLAS_LOCATIONS[labeled]||picks[0].d*atlasPan.z<45){atlasPick=g.placeIndex!==undefined?labeled:picks[0].i;atlasSetTab('place');atlasShowDetails();}
  }
  atlasPointers.delete(e.pointerId);resetGesture();if(atlasGesture)atlasGesture.moved=true;else surface.classList.remove('dragging');
 };
 view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);
 view.addEventListener('wheel',e=>{e.preventDefault();const r=view.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,old=atlasPan.z,z=Math.max(.22,Math.min(4,old*Math.exp(-e.deltaY*.001)));atlasPan={x:x-(x-atlasPan.x)*z/old,y:y-(y-atlasPan.y)*z/old,z};atlasApplyPan();},{passive:false});
}
bindQuestAtlas();
