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
      n.n+': We are tightening the ropes and getting the sled ready. Thank you for clearing the trail.',
      'Corin: Astrid will be glad to hear you are all right.'
    ]:!safe?[
      n.n+': Please stay back from the southern trail. That enormous moth attacks anything that moves through its glade.',
      'Corin: Did you come from Sandspire?',
      'Olin: With flour, lamp oil and enough salt to last the winter. The moth drove us off the road into this clearing.',
      'Signe: We are unhurt, but we cannot pull the sled past it. We tried waiting for it to leave.',
      'Corin: Stay together. Aurelius and I will clear a way.'
    ]:[
      'Corin: The Ice Moth is defeated. You can take the southern trail back now.',
      'Signe: Truly? We heard the fighting, but we dared not leave the supplies.',
      'Olin: We brought these all the way from Sandspire. Being trapped so close to home was the worst part.',
      'Corin: Astrid is worried about you. Are either of you hurt?',
      'Signe: Only cold and very tired. We will rest a moment, then get this sled moving.',
      'Olin: Thank you, both of you. Hollybeck will have its supplies after all.'
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
          'Corin: We found Olin and Signe. They are unhurt, and the trail is clear.',
          'Astrid: Oh, thank goodness. I can replace sacks of flour. I cannot replace those two.',
          'Corin: They are getting their sled ready to come home.',
          'Astrid: Then I had better keep the soup hot. Thank you, Corin. And you, Aurelius.'
        ]:[
          'Astrid: Olin and Signe went to Sandspire for supplies. They should have been back days ago. I keep wondering whether one of them is hurt.',
          'Corin: Do you know which way they were coming?',
          'Astrid: Their last message said they had reached the winter roads. They meant to follow the winding trail west of Hollybeck. There is a sheltered clearing at its far end where they could have stopped.',
          'Corin: Aurelius and I will look for them.',
          'Astrid: Please do. I do not care if they have lost every sack. I just want to know they are all right.'
        ],{who:n.n,npcActor:n,after:()=>openNpcTopics(n)});
      }}];
    if(n.n==='Sverre')return [{title:Frosthorn.defeatedAlready()?'The horned beast is gone':'The beast on the northern trail',
      category:'lead',friendship:false,questUnlock:!frostKnown()&&!Frosthorn.defeatedAlready(),go:()=>{
        remember(FROST);sayOff();P.moving=false;faceToward(n,P.x,P.y);
        playScene(Frosthorn.defeatedAlready()?[
          'Corin: We defeated Frosthorn.',
          'Sverre: Then the clearing at the end of that trail is safe again. If you have not already, look for what it left behind.'
        ]:[
          'Sverre: Take care on the winding trail northwest of Hollybeck. At its far end is a white beast with curling horns. We call it Frosthorn.',
          'Corin: Does it come down toward the town?',
          'Sverre: It keeps to its clearing, but it will not let anyone cross. Watch its feet: when it stamps, ice tears through the ground ahead of it. Move sideways.',
          'Corin: Is there something in the clearing?',
          'Sverre: The old stories place a Frostheart there. They say it strengthens a dragon’s ice. If you face the beast, look for the relic afterward.'
        ],{who:n.n,npcActor:n,after:()=>openNpcTopics(n)});
      }}];
    return [];
  }
  function quests(){const rows=[];
    if(known()&&!rescued())rows.push({id:'winter-rescue',title:'The Missing Supply Party',place:IceMoth.defeatedAlready()?'Ice Moth':'Hollybeck',detail:IceMoth.defeatedAlready()?
      'The Ice Moth is defeated. Continue north to the clearing beyond its glade and tell Olin or Signe that the trail home is safe.':
      'Olin and Signe have not returned from collecting supplies in Sandspire. Follow the winding winter trail west of Hollybeck and search for them in the sheltered clearing at its far end.'});
    if(frostKnown()&&!Frosthorn.defeatedAlready())rows.push({id:'frosthorn',title:'The Beast on the Northern Trail',place:'Frosthorn',detail:'Follow the winding trail northwest of Hollybeck to Frosthorn’s clearing. Avoid the ice from its stamping feet; search for the Frostheart after victory.'});
    return rows;
  }
  function target(id){
    if(id==='winter-rescue')return {map:'world',x:(camp.x-2)*16+8,y:(IceMoth.defeatedAlready()?camp.y+1:168)*16};
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
  function target(){const d=W.maps.world.doors.find(d=>d.to==='passage');return d?{map:'world',x:d.x*TS+8,y:d.y*TS+24}:null;}
  return {arrived,step,target,lines};
})();
