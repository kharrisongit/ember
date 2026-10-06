/* Winter leads and the supply party beyond the Ice Moth. Flags use the
   existing per-save loot ledger, so reloads, slot changes and New Game agree. */
const HollybeckRescue=(()=>{
  const LEAD='quest:hollybeck-supplies:known',SAFE='quest:hollybeck-supplies:rescued',FROST='quest:frosthorn:known';
  const known=()=>houseLootTaken.has(LEAD),rescued=()=>houseLootTaken.has(SAFE),frostKnown=()=>houseLootTaken.has(FROST);
  const camp={x:2346,y:134},names=['Olin','Signe'];
  function remember(key){
    if(houseLootTaken.has(key))return;
    houseLootTaken.add(key);atlasSyncJournal();saveGame();
  }
  function learn(){remember(LEAD);}
  async function prepare(){
    if(SPR.hollybeck_supply_sled)return;
    const image=await loadStartupImage('assets/props/hollybeck-supply-sled.png?v=20261005-rescue');
    const strip=document.createElement('canvas');strip.width=112;strip.height=160;strip.spriteScale=2;strip.pixelLocked=true;
    strip.getContext('2d').drawImage(image,323,129,651,912,0,0,112,160);
    animalSheets.hollybeck_supply_sled=strip;SPR.hollybeck_supply_sled=[0,0,56,80,1,'hollybeck_supply_sled'];
  }
  function installWorld(m){
    m.npcs||=[];m.roomActors||=[];m.roomBlocks||=[];
    for(const [i,name]of names.entries()){
      const key='hollybeck-rescue:'+name;
      if(m.npcs.some(n=>n.editKey===key))continue;
      m.npcs.push({n:name,x:(camp.x-2+i*3)*16+8,y:(camp.y+1+i)*16,
        editKey:key,hollybeckRescue:true,packSpr:'hollybeck_'+(i?'runa':'tobin'),packDirections:true,packWalk:true,
        stationary:true,idleFps:4,f:'d',noTalk:false,loc:'Winter supply camp',d:['We are waiting for the road to be safe.']});
    }
    const key='hollybeck-rescue:sled';
    if(!m.roomActors.some(a=>a.editKey===key)){
      const x=(camp.x+2)*16,y=(camp.y-1)*16;
      const block=m.roomBlocks.push([x-23,y-46,x+23,y-4])-1;
      m.roomActors.push({spr:'hollybeck_supply_sled',x,y,schoolArt:true,stillFrame:0,editKey:key,moveBlocks:[block]});
    }
  }
  function rescue(n){
    learn();sayOff();P.moving=false;faceToward(n,P.x,P.y);
    const safe=IceMoth.defeatedAlready();
    const lines=rescued()?[
      n.n+': Nearly packed. After so much waiting, even hauling this sled will feel good.',
      "Corin: I'll let Astrid know you're preparing to return."
    ]:!safe?[
      n.n+": Don’t take the southern trail unprepared. Veilwing is in the glade, and it attacks anything trying to pass.",
      "Corin: Is that the supply sled from Sandspire?",
      "Olin: Flour, salt and lamp oil. Every sack made it this far, then that moth drove us off the trail.",
      "Signe: We can't move the sled quickly enough to pass it. Waiting hasn't made it any less hungry.",
      "Corin: Stay in the clearing. We'll deal with Veilwing before you try the trail again."
    ]:[
      "Corin: The moth is down. The southern trail is open for your sled.",
      "Signe: You did it? Olin, loosen the brake rope. I want to see a chimney before dark.",
      "Olin: We could almost smell Hollybeck's fires from here. That made the waiting worse.",
      "Corin: Can you both walk? Astrid needs to know how you're doing.",
      "Signe: Cold feet, empty stomachs, no injuries. Give us a moment to repack and we'll manage.",
      "Olin: Tell her the supplies survived too. And thank you for coming this far for two overdue travellers."
    ];
    playScene(lines,{who:n.n,npcActor:n,after:()=>{
      if(safe&&!rescued()){
        remember(SAFE);toast('Supply party rescued — the road home is safe.');
      }
    }});
  }
  function talk(n){if(!n.hollybeckRescue)return false;rescue(n);return true;}
  function topics(n){
    if(n.n==='Astrid')return [{title:rescued()?'The supply party is safe':known()?'The missing supply party':'You seem worried',
      category:'lead',friendship:false,questUnlock:!known()&&!rescued(),go:()=>{
        learn();sayOff();P.moving=false;faceToward(n,P.x,P.y);
        playScene(rescued()?[
          "Corin: Olin and Signe are safe. We cleared the moth from their route.",
          "Astrid: Both of them? I've been counting days and pretending it was an inventory problem.",
          "Corin: They're packing the sled. Signe was especially keen to see a chimney.",
          "Astrid: I'll put more wood on. There'll be bowls for you and Aurelius as well—you've earned a warmer ending to this trip."
        ]:[
          "Astrid: Olin and Signe are overdue from Sandspire. They know the winter roads; if they're still out there, something has stopped them.",
          "Corin: Where should we begin looking?",
          "Astrid: Take the winding winter trail west of Hollybeck. There's a sheltered clearing at the far end. They'd wait there if the route home was blocked.",
          "Corin: We'll search that way. Is there anything they need to hear from you?",
          "Astrid: Tell them to come home without the supplies if they must. I should have said that before they left."
        ],{who:n.n,npcActor:n,after:()=>openNpcTopics(n)});
      }}];
    if(n.n==='Sverre')return [{title:Frosthorn.defeatedAlready()?'The horned beast is gone':'The beast on the northern trail',
      category:'lead',friendship:false,questUnlock:!frostKnown()&&!Frosthorn.defeatedAlready(),go:()=>{
        remember(FROST);sayOff();P.moving=false;faceToward(n,P.x,P.y);
        playScene(Frosthorn.defeatedAlready()?[
          "Corin: Hroth won't block the northern clearing anymore.",
          "Sverre: Then travellers have that ground back. Search the place where it fell; the Frostheart may still be waiting in its chest."
        ]:[
          "Sverre: The trail northwest of Hollybeck winds into Hroth's clearing. White fur, curled horns, a temper you won't mistake for curiosity.",
          "Corin: Has anyone seen it leave the clearing?",
          "Sverre: It guards that ground. A stamp sends ice tearing toward you; move sideways when the foot rises. Close in, watch the horns and arms as well.",
          "Corin: Why would anyone risk going in there?",
          "Sverre: For the Frostheart. The relic strengthens dragon Ice by a quarter. Defeat Hroth, then claim it from the reward chest; winning the fight alone won't put it in your bag."
        ],{who:n.n,npcActor:n,after:()=>openNpcTopics(n)});
      }}];
    return [];
  }
  function quests(){const rows=[];
    if(known()&&!rescued())rows.push({id:'winter-rescue',title:'The Missing Supply Party',place:IceMoth.defeatedAlready()?'Veilwing':'Hollybeck',detail:IceMoth.defeatedAlready()?
      'Veilwing is defeated. Continue north to the clearing beyond its glade and tell Olin or Signe that the trail home is safe.':
      'Olin and Signe have not returned from collecting supplies in Sandspire. Follow the winding winter trail west of Hollybeck and search for them in the sheltered clearing at its far end.'});
    if((frostKnown()||Frosthorn.defeatedAlready())&&!(Frosthorn.defeatedAlready()&&Frosthorn.owned()))rows.push({id:'frosthorn',title:'The Beast on the Northern Trail',place:'Hroth',detail:Frosthorn.defeatedAlready()?'Hroth is defeated. Open the chest where it fell to recover the Frostheart.':'Follow the winding trail northwest of Hollybeck to Hroth’s clearing. Avoid the ice from its stamping feet; search for the Frostheart after victory.'});
    return rows;
  }
  function target(id){
    if(id==='winter-rescue')return {map:'world',x:(camp.x-2)*16+8,y:(IceMoth.defeatedAlready()?camp.y+1:168)*16};
    if(id==='frosthorn'&&Frosthorn.defeatedAlready())return atlasBossRewardTarget('frosthorn');
    if(id==='frosthorn')return {map:'world',x:2545*16,y:25*16};
    return null;
  }
  return {prepare,installWorld,talk,topics,quests,target,known,rescued,frostKnown,learn};
})();
// Reuse the matching winter cast portraits along with their directional art.
PORTRAIT_FILES.Olin='hollybeck-tobin';PORTRAIT_FILES.Signe='hollybeck-runa';

const FrostcragJourney=(()=>{
  const BRIEFED='quest:frostcrag:briefed',ARRIVED='quest:frostcrag:arrived';
  const arrived=()=>houseLootTaken.has(ARRIVED)||wonAll||dragonKnowsPlace('Ashcrag');
  const lines=FROSTCRAG_BRIEFING;
  function step(){
    if(!breathHas.shadow||wonAll||MAPID!=='world')return false;
    if(areaUnder(P.x,P.y)==='Ashcrag'&&!houseLootTaken.has(ARRIVED)){
      houseLootTaken.add(ARRIVED);atlasSyncJournal();saveGame();
    }
    if(arrived()||houseLootTaken.has(BRIEFED)||revealing||chestAnim)return false;
    quietDragonBanter();P.moving=false;
    houseLootTaken.add(BRIEFED);atlasSyncJournal();saveGame();
    playScene(lines.slice(),{who:'Aurelius',after:()=>{atlasTrackedQuest='main';atlasSyncJournal();saveGame();}});
    return true;
  }
  function target(){
    if(W.maps[MAPID]?.mountainPassage||/^passage/.test(MAPID)){const d=W.maps.passage3.doors.find(d=>d.to==='world');return d?{map:'passage3',x:d.x*TS+8,y:d.y*TS+16}:null;}
    const d=W.maps.world.doors.find(d=>d.to==='passage');return d?{map:'world',x:d.x*TS+8,y:d.y*TS+24}:null;}
  return {arrived,step,target,lines};
})();
