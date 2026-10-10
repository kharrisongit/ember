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
      n.n+": We keep finding one more thing to tie down. I promise we are actually leaving.",
      "Corin: I'll tell Astrid to expect you. She'll be glad to hear it."
    ]:!safe?[
      n.n+": Stop a moment. There's an ice moth on the southern trail. Veilwing. We barely got the sled away from it.",
      "Corin: I'm Corin. Are you the supply party from Sandspire?",
      "Olin: Olin. That's Signe. Yes, supplies for Hollybeck. We've brought them all this way to sit and stare at the ropes.",
      "Signe: We tried waiting until it moved off. Apparently it has nowhere better to be.",
      "Corin: Stay here. We'll clear Veilwing from the glade, then come and tell you when it's safe."
    ]:[
      "Corin: You can take the sled south. We've defeated Veilwing; the way home is clear.",
      "Signe: Olin. Tell me you heard that too. I don't trust my ears with good news anymore.",
      "Olin: I heard. We'll need to shift the sacks before we move. My hands have nearly forgotten what they're for.",
      "Corin: Are either of you hurt? What shall I tell Astrid?",
      "Signe: That we're hungry enough to be rude about it. Nothing worse. We'll manage the walk.",
      "Olin: Tell her we're bringing everything home. I don't know what we'd have done if you hadn't come."
    ];
    playScene(lines,{who:n.n,npcActor:n,after:()=>{
      if(safe&&!rescued()){
        remember(SAFE);toast('Supply party rescued — the road home is safe.');
      }
    }});
  }
  function talk(n){if(!n.hollybeckRescue)return false;rescue(n);return true;}
  function topics(n){
    if(n.n==='Astrid')return [{title:rescued()?"News for Astrid":known()?"Where the sled went":"Two places left empty",
      category:'lead',friendship:false,questUnlock:!known()&&!rescued(),go:()=>{
        learn();sayOff();P.moving=false;faceToward(n,P.x,P.y);
        playScene(rescued()?[
          "Corin: We found them. Olin and Signe are alive, and the moth can't keep them from coming home now.",
          "Astrid: Both. You said both. Sorry. I needed to hear it twice.",
          "Corin: They're tying down the load. Signe asked me to warn you how hungry they are.",
          "Astrid: Oh, she can complain all evening if she's here to do it. There'll be food for you and your companion too."
        ]:[
          "Astrid: I keep thinking I hear a sled. Olin and Signe went for supplies in Sandspire. They should have been back by now.",
          "Corin: Which way would they come?",
          "Astrid: Follow the winding winter trail west of Hollybeck. At its far end there's a clearing out of the wind. If they had to stop, they'd stop there.",
          "Corin: We'll look. What should I tell them when we find them?",
          "Astrid: To leave the sled if they have to. We can do without sacks of flour. We can't do without them."
        ],{who:n.n,npcActor:n,after:()=>openNpcTopics(n)});
      }}];
    if(n.n==='Sverre')return [{title:Frosthorn.defeatedAlready()?"Room on the northern trail":"Hroth and the Frostheart",
      category:'lead',friendship:false,questUnlock:!frostKnown()&&!Frosthorn.defeatedAlready(),go:()=>{
        remember(FROST);sayOff();P.moving=false;faceToward(n,P.x,P.y);
        playScene(Frosthorn.defeatedAlready()?[
          "Corin: Hroth is defeated. The clearing is safe to enter.",
          "Sverre: That's a weight off this town. Did you open the chest? The Frostheart won't come to you just because its guardian fell."
        ]:[
          "Sverre: Hroth holds the clearing at the end of the winding trail northwest of Hollybeck. If you see white fur and curled horns, don't wait to see whether he's friendly.",
          "Corin: What should I watch for if we face him?",
          "Sverre: His feet. When one rises, move sideways: a line of ice follows the stamp. Up close, his horns and arms are trouble enough.",
          "Corin: And the Frostheart is in that clearing?",
          "Sverre: In the reward chest. Defeat Hroth, open it, and carry the relic. Dragon Ice gains twenty-five percent. A useful thing, provided you survive obtaining it."
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
