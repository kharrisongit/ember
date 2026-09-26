
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
  const exploreTrack=()=>millwoodMode&&millwood?millwood:cinderholdMode&&cinderhold?cinderhold:(mineMode&&mine?mine:(mysticMode&&mystic?mystic:(hollybeckMode&&hollybeck?hollybeck:(forgewickMode&&forgewick?forgewick:(thornwellMode&&thornwell?thornwell:(fieldMode&&field?field:(lavaRouteMode&&lavaRoute?lavaRoute:bgm)))))));
  const safePlay=(a)=>{ if(!a || pct===0) return; const p=a.play(); if(p&&typeof p.catch==='function') p.catch(()=>{}); };
  const fade=(from,to,done)=>{
    const token=++fadeToken, steps=18, ms=28, goal=target(); let i=0;
    if(from===to){if(to){to.volume=goal;safePlay(to);}return;}
    if(to){to.volume=0; safePlay(to);}
    const fromStart=from ? from.volume : 0;
    const tick=()=>{
      if(token!==fadeToken) return; i++; const q=i/steps;
      if(from) from.volume=Math.max(0,fromStart*(1-q));
      if(to) to.volume=Math.max(0,goal*q);
      if(i<steps) setTimeout(tick,ms); else { if(from){from.pause();from.volume=goal;} if(to)to.volume=goal; if(done)done(); }
    }; tick();
  };
  const tracks=[bgm,millwood,villain,battle,thornwell,field,forgewick,mystic,mine,cinderhold,hollybeck,lavaRoute].filter(Boolean);
  const apply=()=>{
    ++fadeToken; // A volume change or mute cancels an unfinished crossfade.
    const active=pct===0?null:kingMode&&villain?villain:exploreTrack();
    for(const track of tracks){if(track!==active)track.pause();else track.volume=target();}
  };
  const startMusic=()=>{
    if(pct===0) return;
    const a=kingMode&&villain?villain:exploreTrack(); a.volume=target(); safePlay(a);
  };
  window.EmberKingMusic={
    start:()=>{ if(kingMode||!villain)return; kingMode=true; const from=exploreTrack(); villain.currentTime=0; fade(from,villain); },
    stop:()=>{ if(!kingMode)return; kingMode=false; fade(villain,exploreTrack()); },
    active:()=>kingMode
  };
  // Kept as a harmless compatibility shim for existing combat code. No battle track is played.
  window.EmberBattleMusic={start:()=>{},stop:()=>{},active:()=>false};
  if(battle) battle.pause();
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
    if(wantMillwood===millwoodMode && wantCinderhold===cinderholdMode && wantLavaRoute===lavaRouteMode && wantMine===mineMode && wantMystic===mysticMode && wantHollybeck===hollybeckMode && wantTown===thornwellMode && wantField===fieldMode && wantForgewick===forgewickMode) return;
    const old=exploreTrack();
    millwoodMode=wantMillwood; cinderholdMode=wantCinderhold; lavaRouteMode=wantLavaRoute; mineMode=wantMine; mysticMode=wantMystic; hollybeckMode=wantHollybeck; forgewickMode=wantForgewick; thornwellMode=wantTown; fieldMode=wantField;
    const next=exploreTrack();
    if(!kingMode&&pct>0) fade(old,next);
    else if(old!==next) old.pause();
  };
  setInterval(syncRegionMusic,180);
  syncRegionMusic();
  window.EmberAudio={
    percent:()=>pct,
    set:(v)=>{
      pct=Math.max(0,Math.min(100,Number(v)||0));
      try { localStorage.setItem(KEY,String(pct)); } catch(e) {}
      apply();
      if(pct>0) startMusic();
    }
  };
  apply();
  // Browsers require a player gesture before audio can begin. Any normal game input starts it.
  window.addEventListener('pointerdown',startMusic,{passive:true});
  window.addEventListener('keydown',startMusic);
  window.addEventListener('touchstart',startMusic,{passive:true});
  window.addEventListener('focus',()=>{ if(!document.hidden) startMusic(); });
})();
