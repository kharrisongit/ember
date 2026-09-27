/* The atlas follows saved story/knowledge state; it never advances a quest. */
let atlasTrackedQuest='main',atlasQuests=[],atlasPan={x:0,y:0,z:1.6},atlasPointers=new Map();
let atlasGesture=null;
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
function atlasBegin(){
 atlasQuests=atlasQuestOptions();
 if(!atlasQuests.some(q=>q.id===atlasTrackedQuest))atlasTrackedQuest='main';
 const select=document.getElementById('atlasQuestSelect');select.replaceChildren();
 for(const q of atlasQuests){const opt=document.createElement('option');opt.value=q.id;opt.textContent=(q.id==='main'?'Main · ':'Side · ')+q.title;select.append(opt);}
 select.value=atlasTrackedQuest;
 atlasPointers.clear();atlasGesture=null;
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
}
function atlasShowDetails(){
 const p=ATLAS_LOCATIONS[atlasPick],q=atlasQuests.find(q=>q.id===atlasTrackedQuest);
 document.getElementById('atlasName').textContent=p[0];
 document.getElementById('atlasText').textContent=p[3];
 document.getElementById('atlasObjective').textContent=q?q.title+' — '+q.detail:'';
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
 const view=document.getElementById('atlasViewport'),surface=document.getElementById('atlasSurface');
 document.getElementById('atlasClose').addEventListener('click',closeAtlas);
 document.getElementById('atlasFocus').addEventListener('click',atlasFocusQuest);
 document.getElementById('atlasQuestSelect').addEventListener('change',e=>{atlasTrackedQuest=e.target.value;atlasFocusQuest();});
 const resetGesture=()=>{
  const a=[...atlasPointers.values()];
  atlasGesture=a.length>1?{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),...{panX:atlasPan.x,panY:atlasPan.y,z:atlasPan.z},moved:true}:
   a.length?{x:a[0].x,y:a[0].y,panX:atlasPan.x,panY:atlasPan.y,z:atlasPan.z,moved:false}:null;
 };
 view.addEventListener('pointerdown',e=>{if(e.button>0)return;e.preventDefault();view.setPointerCapture(e.pointerId);const r=view.getBoundingClientRect();atlasPointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});surface.classList.add('dragging');resetGesture();});
 view.addEventListener('pointermove',e=>{
  if(!atlasPointers.has(e.pointerId)||!atlasGesture)return;e.preventDefault();const r=view.getBoundingClientRect();atlasPointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});
  const a=[...atlasPointers.values()],g=atlasGesture;
  if(a.length>1){
   const x=(a[0].x+a[1].x)/2,y=(a[0].y+a[1].y)/2,z=Math.max(.65,Math.min(4,g.z*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/Math.max(1,g.d)));
   atlasPan={x:x-(g.x-g.panX)*z/g.z,y:y-(g.y-g.panY)*z/g.z,z};
  }else{const dx=a[0].x-g.x,dy=a[0].y-g.y;if(Math.hypot(dx,dy)>6)g.moved=true;atlasPan.x=g.panX+dx;atlasPan.y=g.panY+dy;}
  atlasApplyPan();
 });
 const end=e=>{
  const a=atlasPointers.get(e.pointerId),g=atlasGesture;
  if(a&&g&&!g.moved&&e.type==='pointerup'){
   const x=(a.x-atlasPan.x)/atlasPan.z,y=(a.y-atlasPan.y)/atlasPan.z;
   const picks=ATLAS_LOCATIONS.map((p,i)=>({i,d:Math.hypot(p[1]-x,p[2]-y)})).sort((a,b)=>a.d-b.d);
   if(picks[0].d*atlasPan.z<65){atlasPick=picks[0].i;atlasShowDetails();}
  }
  atlasPointers.delete(e.pointerId);resetGesture();if(atlasGesture)atlasGesture.moved=true;else surface.classList.remove('dragging');
 };
 view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);
 view.addEventListener('wheel',e=>{e.preventDefault();const r=view.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,old=atlasPan.z,z=Math.max(.65,Math.min(4,old*Math.exp(-e.deltaY*.001)));atlasPan={x:x-(x-atlasPan.x)*z/old,y:y-(y-atlasPan.y)*z/old,z};atlasApplyPan();},{passive:false});
}
bindQuestAtlas();
