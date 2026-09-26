
(()=>{
  const bgm=document.getElementById('emberfellHomeTownBgm');
  const millwood=document.getElementById('emberfellMillwoodBgm');
  const villain=document.getElementById('emberfellVillainBgm');
  const battle=document.getElementById('emberfellBattleBgm');
  const thornwell=document.getElementById('emberfellThornwellBgm');
  const field=document.getElementById('emberfellFieldBgm');
  const forgewick=document.getElementById('emberfellForgewickBgm');
  const mystic=document.getElementById('emberfellMysticBgm');
  const mine=document.getElementById('emberfellMineBgm');
  const cinderhold=document.getElementById('emberfellCinderholdBgm');
  const hollybeck=document.getElementById('emberfellHollybeckBgm');
  const lavaRoute=document.getElementById('emberfellLavaRouteBgm');
  if(!bgm) return;
  const KEY='emberfell.musicVolume';
  let pct=35;
  try { const stored=localStorage.getItem(KEY),n=Number(stored); if(stored!==null && Number.isFinite(n) && n>=0 && n<=100) pct=n; } catch(e) {}
  let kingMode=false, millwoodMode=false, thornwellMode=false, fieldMode=false, forgewickMode=false, mysticMode=false, mineMode=false, cinderholdMode=false, hollybeckMode=false, lavaRouteMode=false, fadeToken=0;
  const target=()=>Math.max(0,Math.min(1,pct/100));
  const inMillwood=()=>{
    try{
      if(typeof MAPID==='undefined')return false;
      if(MAPID!=='world')return typeof MD!=='undefined' && /^Millwood\b/.test(MD.title||'');
      if(typeof features==='undefined'||typeof P==='undefined'||typeof TS==='undefined')return false;
      const x=P.x/TS,y=(P.y-1)/TS;
      // Follow the current town boundary, including any published editor moves.
      return features.some(f=>f.kind==='area'&&!f.hidden&&(f.label==='Millwood'||f.place==='Millwood')&&
        x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1);
    }catch(e){return false;}
  };
  const inThornwell=()=>{
    try {
      if(typeof MAPID==='undefined') return false;
      if(MAPID==='tavern' || MAPID==='inn') return true;
      if(typeof MD!=='undefined' && /^Thornwell\b/.test(MD.title||'')) return true;
      if(MAPID==='world' && typeof P!=='undefined' && typeof TS!=='undefined'){
        const px=P.x/TS, py=P.y/TS;
        // Thornwell atlas center is ~171,101. Keep this tight so Route 1/2 never steal the town theme.
        return px>=145 && px<=198 && py>=72 && py<=132;
      }
    } catch(e) {}
    return false;
  };
  const inRoute1=()=>{
    try {
      if(typeof MAPID==='undefined' || MAPID!=='world' || typeof P==='undefined' || typeof TS==='undefined' || typeof features==='undefined') return false;
      const px=P.x/TS, py=P.y/TS;
      // Town zones win over the road at both ends.
      const inMillwoodTown = inMillwood();
      const inThornwellTown = px>=145 && px<=198 && py>=72 && py<=132;
      if(inMillwoodTown || inThornwellTown) return false;
      const legs=features.filter(f=>f.kind==='route' && (f.id===12 || f.id===13));
      const segDist=(x,y,x0,y0,x1,y1)=>{
        const dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy;
        if(!l2)return Math.hypot(x-x0,y-y0);
        const t=Math.max(0,Math.min(1,((x-x0)*dx+(y-y0)*dy)/l2));
        return Math.hypot(x-(x0+t*dx),y-(y0+t*dy));
      };
      return legs.some(f=>segDist(px,py,f.x0,f.y0,f.x1,f.y1)<=Math.max(10,(f.w||5)*2.2));
    } catch(e) { return false; }
  };
  const inForgewick=()=>{
    try {
      if(typeof MAPID==='undefined') return false;
      if(typeof MD!=='undefined' && /^Forgewick\b/.test(MD.title||'') && !/Temple/i.test(MD.title||'')) return true;
      if(MAPID==='world' && typeof P!=='undefined' && typeof TS!=='undefined')
        return P.x>=385*TS && P.x<=465*TS && P.y>=125*TS && P.y<=190*TS;
    } catch(e) {}
    return false;
  };
  const inForgewickMine=()=>{
    try {
      if(typeof MAPID==='undefined') return false;
      return /^mine[2-5]$/.test(MAPID);
    } catch(e) {}
    return false;
  };
  const inMysticArea=()=>{
    try {
      if(typeof MAPID==='undefined') return false;
      if(MAPID==='witch_room' || MAPID==='witch_demon') return true;
      if(typeof MD!=='undefined' && /Witchmoor|Dreadmarsh|Swamp|Marsh|Maelis/i.test(MD.title||'')) return true;
      // Wetland/swamp stretch around Witchmoor and the Dreadmarsh on the world map.
      if(MAPID==='world' && typeof P!=='undefined' && typeof TS!=='undefined')
        return P.x>=1015*TS && P.x<=1145*TS && P.y>=205*TS && P.y<=355*TS;
    } catch(e) {}
    return false;
  };
  const inHollybeck=()=>{
    try {
      if(typeof MAPID==='undefined') return false;
      if(typeof MD!=='undefined' && /^Hollybeck\b/.test(MD.title||'') && !/Temple|Graveyard/i.test(MD.title||'')) return true;
      if(MAPID==='world' && typeof P!=='undefined' && typeof TS!=='undefined')
        return P.x>=1148*TS && P.x<=1205*TS && P.y>=137*TS && P.y<=188*TS;
    } catch(e) {}
    return false;
  };

  const inLavaRoute=()=>{
    try {
      if(typeof MAPID==='undefined' || MAPID!=='world' || typeof P==='undefined' || typeof TS==='undefined') return false;
      const px=P.x/TS, py=P.y/TS;
      // Route 7: volcanic road from Ashcrag to Cinderhold Castle.
      return px>=1288 && px<=1452 && py>=70 && py<=238;
    } catch(e) {}
    return false;
  };
  const inCinderholdInterior=()=>{
    try {
      if(typeof MAPID==='undefined') return false;
      if(MAPID==='cinderhold' || /^royal_/.test(MAPID)) return true;
      if(typeof MD!=='undefined' && /^Cinderhold\b/.test(MD.title||'')) return true;
    } catch(e) {}
    return false;
  };
  const tracks=[bgm,millwood,villain,battle,thornwell,field,forgewick,mystic,mine,cinderhold,hollybeck,lavaRoute].filter(Boolean);
  const hasSong=a=>{
    const src=a?.getAttribute('src')||a?.querySelector('source[src]')?.getAttribute('src')||'';
    return !!src && !/^data:[^,]*,\s*$/.test(src);
  };
  const exploreTrack=()=>{
    const choices=[[millwoodMode,millwood],[cinderholdMode,cinderhold],[mineMode,mine],
      [mysticMode,mystic],[hollybeckMode,hollybeck],[forgewickMode,forgewick],
      [thornwellMode,thornwell],[fieldMode,field],[lavaRouteMode,lavaRoute],[true,bgm]];
    return choices.find(([on,a])=>on&&hasSong(a))?.[1] || (hasSong(millwood)?millwood:null);
  };
  const royalSpeaker=name=>/^(?:(?:King's|Royal|Black|White)\s+)?Knight\b|^(?:King )?Halvard$|^(?:Serjeant )?Bram$|^(?:Doran|Tolan)$/i.test(String(name||'').trim());
  const royalConversation=()=>{
    try{
      if(typeof sayNpc!=='undefined'&&sayNpc&&royalSpeaker(sayNpc.n))return true;
      if(typeof scene!=='undefined'&&scene){
        if(royalSpeaker(scene.who))return true;
        return (scene.lines||[]).some(line=>String(line).includes(':')&&royalSpeaker(String(line).split(':')[0]));
      }
    }catch(e){}
    return false;
  };
  const finalBattle=()=>{
    try{return MAPID==='cinderhold'&&!wonAll&&!!lastFight;}catch(e){return false;}
  };
  let kingMap=null,selected=null,unlocked=false,pending=0,fading=false;
  const gains=new Map(tracks.map(a=>[a,0]));
  const applyVolumes=()=>{for(const a of tracks)a.volume=(gains.get(a)||0)*target();};
  const silence=()=>{
    ++fadeToken;pending=0;fading=false;
    for(const a of tracks){gains.set(a,0);a.volume=0;a.pause();}
  };
  const beginFade=token=>{
    const initial=new Map(gains),started=Date.now();fading=true;
    const tick=()=>{
      if(token!==fadeToken)return;
      const u=Math.min(1,(Date.now()-started)/900),ease=u*u*(3-2*u);
      for(const a of tracks){const from=initial.get(a)||0;gains.set(a,from+((a===selected?1:0)-from)*ease);}
      applyVolumes();
      if(u<1)setTimeout(tick,25);
      else {fading=false;for(const a of tracks)if(a!==selected)a.pause();}
    };
    tick();
  };
  const playSelected=()=>{
    if(!unlocked||pct===0||!selected||pending||fading)return;
    if(!selected.paused&&gains.get(selected)===1&&tracks.every(a=>a===selected||!gains.get(a)))return;
    const a=selected,token=++fadeToken;pending=token;
    a.volume=(gains.get(a)||0)*target();
    try{
      // Keep the outgoing song audible until the incoming audio actually plays.
      Promise.resolve(a.play()).then(()=>{
        if(token!==fadeToken){if(pct===0||(a!==selected&&!gains.get(a)))a.pause();return;}
        pending=0;beginFade(token);
      },()=>{if(token===fadeToken)pending=0;});
    }catch(e){if(token===fadeToken)pending=0;}
  };
  const selectTrack=next=>{
    if(next===selected)return;
    ++fadeToken;pending=0;fading=false;selected=next;
    for(const a of tracks)if(a!==next&&!gains.get(a))a.pause();
    if(next===villain&&next.paused&&!gains.get(next))next.currentTime=0;
    if(!next){beginFade(fadeToken);return;}
    playSelected();
  };
  const chooseMusic=()=>{
    // A loaded save or a map change cannot retain an old scripted royal cue.
    try{if(kingMode&&(MAPID!==kingMap||wonAll))kingMode=false;}catch(e){}
    selectTrack((kingMode||royalConversation()||finalBattle())&&hasSong(villain)?villain:exploreTrack());
  };
  window.EmberKingMusic={
    start:()=>{kingMode=true;try{kingMap=MAPID;}catch(e){}chooseMusic();},
    stop:()=>{kingMode=false;chooseMusic();},
    active:()=>selected===villain
  };
  // Combat without a dedicated song keeps the area's music.
  window.EmberBattleMusic={start:()=>{},stop:()=>{},active:()=>false};
  const syncRegionMusic=()=>{
    const wantMillwood=inMillwood();
    const wantCinderhold=inCinderholdInterior();
    const wantLavaRoute=!wantCinderhold && inLavaRoute();
    const wantMine=!wantCinderhold && !wantLavaRoute && inForgewickMine();
    const wantMystic=!wantCinderhold && !wantLavaRoute && !wantMine && inMysticArea();
    const wantHollybeck=!wantCinderhold && !wantLavaRoute && !wantMine && !wantMystic && inHollybeck();
    const wantForgewick=!wantCinderhold && !wantLavaRoute && !wantMine && !wantMystic && !wantHollybeck && inForgewick();
    const wantTown=!wantCinderhold && !wantLavaRoute && !wantMine && !wantMystic && !wantHollybeck && !wantForgewick && inThornwell();
    const wantField=!wantCinderhold && !wantLavaRoute && !wantMine && !wantMystic && !wantHollybeck && !wantForgewick && !wantTown && inRoute1();
    millwoodMode=wantMillwood; cinderholdMode=wantCinderhold; lavaRouteMode=wantLavaRoute; mineMode=wantMine; mysticMode=wantMystic; hollybeckMode=wantHollybeck; forgewickMode=wantForgewick; thornwellMode=wantTown; fieldMode=wantField;
    chooseMusic();
  };
  setInterval(syncRegionMusic,180);
  syncRegionMusic();
  const startMusic=()=>{unlocked=true;playSelected();};
  window.EmberAudio={
    percent:()=>pct,
    set:v=>{
      pct=Math.max(0,Math.min(100,Number(v)||0));
      try{localStorage.setItem(KEY,String(pct));}catch(e){}
      if(pct===0)silence();
      else {applyVolumes();startMusic();}
    }
  };
  applyVolumes();
  // Further taps must not jump an in-progress crossfade to full volume.
  window.addEventListener('pointerdown',startMusic,{passive:true});
  window.addEventListener('keydown',startMusic);
  window.addEventListener('touchstart',startMusic,{passive:true});
  window.addEventListener('focus',()=>{if(!document.hidden)startMusic();});
})();
