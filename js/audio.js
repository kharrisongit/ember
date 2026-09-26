let routeMusicIntroPlayed=false;

(()=>{
  const title=document.getElementById('lastDragonriderTitleBgm');
  const spores=document.getElementById('emberfellSporesBgm');
  const titleScreen=()=>{try{return typeof gameplayStarted==='undefined'||!gameplayStarted;}catch(e){return true;}};
  let endingMode=false,titleStage=null,titleAccepted=false;
  const bgm=document.getElementById('emberfellHomeTownBgm');
  const millwood=document.getElementById('emberfellMillwoodBgm');
  const villain=document.getElementById('emberfellVillainBgm');
  const battle=document.getElementById('emberfellBattleBgm');
  const thornwell=document.getElementById('emberfellThornwellBgm');
  const field=document.getElementById('emberfellFieldBgm');
  const desert=document.getElementById('emberfellDesertBgm');
  const sandspire=document.getElementById('emberfellSandspireBgm');
  const seatown=document.getElementById('emberfellSeatownBgm');
  const school=document.getElementById('emberfellSchoolBgm');
  const tavern=document.getElementById('emberfellTavernBgm');
  const forgewick=document.getElementById('emberfellForgewickBgm');
  const mystic=document.getElementById('emberfellMysticBgm');
  const reveal=document.getElementById('emberfellDragonRevealBgm');
  const mine=document.getElementById('emberfellMineBgm');
  const temple=document.getElementById('emberfellTempleBgm');
  const cinderhold=document.getElementById('emberfellCinderholdBgm');
  const hollybeck=document.getElementById('emberfellHollybeckBgm');
  const snowRoute=document.getElementById('emberfellSnowRouteBgm');
  const lavaRoute=document.getElementById('emberfellLavaRouteBgm');
  if(!bgm) return;
  const KEY='emberfell.musicVolume';
  let pct=35;
  try { const stored=localStorage.getItem(KEY),n=Number(stored); if(stored!==null && Number.isFinite(n) && n>=0 && n<=100) pct=n; } catch(e) {}
  let kingMode=false, millwoodMode=false, thornwellMode=false, fieldMode=false, forgewickMode=false, mysticMode=false, mineMode=false, cinderholdMode=false, hollybeckMode=false, lavaRouteMode=false, fadeToken=0;
  const target=()=>Math.max(0,Math.min(1,pct/100))*.85;
  const inNamedArea=(name)=>{
    try{
      if(MAPID!=='world')return (MD.title||'').startsWith(name)&&!/Temple|Graveyard/.test(MD.title||'');
      const x=P.x/TS,y=(P.y-1)/TS;
      return features.some(f=>f.kind==='area'&&!f.hidden&&(f.label===name||f.place===name)&&
        x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1);
    }catch(e){return false;}
  };
  const inMillwood=()=>inNamedArea('Millwood');
  const inThornwell=()=>{
    try{return MAPID==='tavern'||MAPID==='inn'||inNamedArea('Thornwell');}catch(e){return false;}
  };
  const inForgewick=()=>!inForgewickMine()&&inNamedArea('Forgewick');
  const inIntertownRoute=()=>{
    try{
      if(MAPID!=='world')return false;
      const x=P.x/TS,y=(P.y-1)/TS;
      // Use published geometry, including every bend, rather than an atlas
      // thumbnail's coordinates or the straight line between a road's ends.
      if(features.some(f=>f.kind==='area'&&!f.hidden&&!f.wild&&
        x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1))return false;
      const nearSegment=(a,b,reach)=>{
        const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
        const t=len?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/len)):0;
        return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t)<=reach;
      };
      return features.some(f=>{
        if(f.kind==='arena'&&typeof isHuntingArena==='function'&&isHuntingArena(f))
          return Math.hypot(x-f.x,y-f.y)<=(f.r||10)+6;
        // Northern Woods and the elder/Shroom paths retain the original song.
        if(f.kind!=='route'||f.entrance||[3,5,212].includes(f.id))return false;
        // Editor-built hunting loops have no road name; include their whole path.
        if(f.road&&!/^Route \d+$/.test(f.road)&&!/hunt/i.test(f.road))return false;
        const pts=f.pts?.length>1?f.pts:[[f.x0,f.y0],[f.x1,f.y1]];
        return pts.slice(1).some((p,i)=>nearSegment(pts[i],p,Math.max(12,(f.w||5)*2.2)));
      });
    }catch(e){return false;}
  };
  const inDesertRoute=()=>{
    try{
      if(MAPID!=='world'||!terr||!MW||!MH)return false;
      const x=Math.floor(P.x/TS),y=Math.floor((P.y-1)/TS);
      if(x<0||y<0||x>=MW||y>=MH)return false;
      // Use the rendered ground under Corin, never a broad nearby-desert radius.
      const towns=['Millwood','Thornwell','Forgewick','Sandspire','Coralmere','Hollybeck','Sporehollow','Cinderhold'];
      if(features.some(f=>f.kind==='area'&&!f.hidden&&towns.includes(f.label||f.place)&&x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1))return false;
      const ground=terr[y*MW+x];
      return sandHere(x,y)||(ground===PAVING2&&inDesert(x,y));
    }catch(e){return false;}
  };
  const inSeatownArea=()=>{
    try{
      if(inNamedArea('Coralmere'))return true;
      if(MAPID!=='world')return false;
      const x=Math.floor(P.x/TS),y=Math.floor((P.y-1)/TS);
      if(inDesertRoute()||inMysticArea())return false;
      if(typeof blossomBand!=='undefined'&&blossomBand&&typeof MW!=='undefined'&&blossomBand.has(y*MW+x))return true;
      // Follow authored blossom roads through clearings and edited bends.
      return features.some(f=>{
        if(f.kind!=='route'||f.style!=='blossom')return false;
        const pts=f.pts?.length>1?f.pts:[[f.x0,f.y0],[f.x1,f.y1]];
        return pts.slice(1).some((b,i)=>{
          const a=pts[i],dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
          const t=len?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/len)):0;
          return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)<=12;
        });
      });
    }catch(e){return false;}
  };
  const inForgewickMine=()=>{
    try {
      if(typeof MAPID==='undefined') return false;
      return /^mine(?:[2-5])?$/.test(MAPID);
    } catch(e) {}
    return false;
  };
  const inMysticArea=()=>{
    try {
      if(typeof MAPID==='undefined') return false;
      if(MAPID==='witch_room' || MAPID==='witch_demon') return true;
      if(typeof MD!=='undefined' && /Witchmoor|Dreadmarsh|Swamp|Marsh|Maelis/i.test(MD.title||'')) return true;
      if(MAPID==='world'&&typeof inSwamp==='function'){
        const x=Math.floor(P.x/TS),y=Math.floor((P.y-1)/TS);
        return inSwamp(x,y)&&!(typeof inWinter==='function'&&inWinter(x,y));
      }
      // Wetland/swamp stretch around Witchmoor and the Dreadmarsh on the world map.
      if(MAPID==='world' && typeof P!=='undefined' && typeof TS!=='undefined')
        return P.x>=1015*TS && P.x<=1145*TS && P.y>=205*TS && P.y<=355*TS;
    } catch(e) {}
    return false;
  };
  const inHollybeck=()=>inNamedArea('Hollybeck');

  const inMushrooms=()=>{
    try {
      if(MAPID!=='world')return /shroom|spore|mushroom/i.test(MAPID+' '+(MD.title||''));
      const x=P.x/TS,y=(P.y-1)/TS;
      return features.some(f=>f.kind==='area'&&/shroom|spore|mushroom/i.test((f.label||'')+' '+(f.place||''))&&x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1);
    } catch(e) { return false; }
  };
  const inElderWoods=()=>{
    try {const x=P.x/TS,y=(P.y-1)/TS;return MAPID==='world'&&x>=1&&x<=72&&y>=241&&y<=403;}catch(e){return false;}
  };
  const inSnowRoute=()=>{
    try { return MAPID==='world' && typeof inWinter==='function' && inWinter(Math.floor(P.x/TS),Math.floor((P.y-1)/TS)) && !inHollybeck(); } catch(e) { return false; }
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
      if(typeof MAPID==='undefined'||MAPID==='world') return false;
      if(MAPID==='cinderhold' || /^royal_/.test(MAPID)) return true;
      if(typeof MD!=='undefined' && /^Cinderhold\b/.test(MD.title||'')) return true;
    } catch(e) {}
    return false;
  };
  const tracks=[title,spores,bgm,millwood,villain,battle,thornwell,field,forgewick,mystic,mine,cinderhold,hollybeck,lavaRoute,snowRoute,reveal,temple,desert,sandspire,school,tavern,seatown].filter(Boolean);
  const hasSong=a=>{
    const src=a?.getAttribute('src')||a?.querySelector('source[src]')?.getAttribute('src')||'';
    return !!src && !/^data:[^,]*,\s*$/.test(src);
  };
  let omenPlaying=false,omenHeard=false;
  const dragonJourney=()=>{
    try{
      if(mode!=='play'||(quest<Q.ARMED&&!(quest===Q.NOISE&&omenHeard))||quest>Q.DONE||dragonJourneyEnded)return false;
      if(quest===Q.DONE&&dragonIntroDone&&MAPID==='world'&&inMillwood()){
        dragonJourneyEnded=true;saveGame();return false;
      }
      return true;
    }catch(e){return false;}
  };
  const exploreTrack=()=>{
    if(dragonJourney()&&hasSong(reveal))return reveal;
    const insideTemple=typeof MAPID!=='undefined'&&MAPID!=='world'&&typeof MD!=='undefined'&&MD&&!MD.mountainPassage&&(MD.templeExpanded||/^(?:tp|ds|sn)\d/.test(MAPID));
    const choices=[[MAPID==='school'||MAPID==='school2',school],[MAPID==='tavern',tavern],
      [insideTemple,temple],[millwoodMode,millwood],[cinderholdMode,cinderhold],[mineMode,mine],
      [inMushrooms(),spores],[inElderWoods(),millwood],[mysticMode,mystic],[inSeatownArea(),seatown],[hollybeckMode,hollybeck],[forgewickMode,forgewick],
      [thornwellMode,thornwell],[inNamedArea('Sandspire'),sandspire],[lavaRouteMode,lavaRoute],[inSnowRoute(),snowRoute],[inDesertRoute(),desert],[fieldMode,field],[true,bgm]];
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
  let kingMap=null,selected=null,unlocked=false,pending=0,fading=false,fadeDuration=900,fadeDelay=0;
  const gains=new Map(tracks.map(a=>[a,0]));
  let audioContext=null,masterGain=null,masterPct=-1;
  const channels=new Map();
  const loops=new Map([reveal,desert,sandspire,school,tavern,cinderhold,seatown,mine,hollybeck,lavaRoute,snowRoute,spores].filter(Boolean).map(a=>[a,{buffer:null,loading:null,source:null,request:0}]));
  const bufferedTrack=a=>!!(audioContext?.createBufferSource&&loops.has(a)&&!loops.get(a).failed);
  const prepareLoop=a=>{
    if(!bufferedTrack(a))return Promise.resolve(null);
    const loop=loops.get(a);
    if(!loop.loading)loop.loading=fetch(a.getAttribute('src'))
      .then(r=>{if(!r.ok)throw Error('Loop audio unavailable');return r.arrayBuffer();})
      .then(bytes=>audioContext.decodeAudioData(bytes))
      .then(buffer=>loop.buffer=buffer).catch(()=>{loop.loading=null;return null;});
    return loop.loading;
  };
  const trackPaused=a=>bufferedTrack(a)?!loops.get(a).source:a.paused;
  const pauseTrack=a=>{
    const loop=loops.get(a);
    if(loop){
      ++loop.request;
      if(loop.source){loop.source.stop();loop.source.disconnect();loop.source=null;}
    }
    a.pause();
  };
  let fieldStartPending=null;
  if(field){
    field.loop=false;
    field.addEventListener('ended',()=>{
      fieldStartPending=10;
      if(selected===field)playSelected();
    });
  }
  const playTrack=async a=>{
    if(a===field&&fieldStartPending!==null){
      a.currentTime=fieldStartPending;fieldStartPending=null;
      await a.play();
      if(!routeMusicIntroPlayed){routeMusicIntroPlayed=true;if(typeof saveGame==='function')saveGame();}
      return;
    }
    if(!bufferedTrack(a))return a.play();
    const loop=loops.get(a);
    if(loop.source)return;
    const request=++loop.request,buffer=loop.buffer||await prepareLoop(a);
    if(request!==loop.request)return;
    if(!buffer){
      // Decoding/fetch failures must not strand the selected track in silence.
      loop.failed=true;
      audioContext.createMediaElementSource(a).connect(channels.get(a));
      return a.play();
    }
    const source=audioContext.createBufferSource();source.buffer=buffer;source.loop=true;
    source.connect(channels.get(a));loop.source=source;source.start();
  };
  const applyVolumes=()=>{
    if(masterGain&&masterPct!==pct){
      const gain=masterGain.gain,now=audioContext.currentTime;
      gain.cancelScheduledValues(now);
      if(pct===0)gain.value=0;
      else gain.setTargetAtTime(target(),now,.015);
      masterPct=pct;
    }
    for(const a of tracks){
      const level=(gains.get(a)||0)*(a===reveal ? .7 : 1),channel=channels.get(a);
      if(channel){channel.gain.value=level;a.volume=1;}
      else a.volume=level*target();
    }
  };
  const openAudioGraph=()=>{
    // iPhone ignores HTMLMediaElement.volume. Route each song through its
    // own fade gain and one shared volume gain, created during a user gesture.
    const Context=window.AudioContext||window.webkitAudioContext;
    if(!Context)return;
    if(!audioContext){
      try{
        audioContext=new Context();masterGain=audioContext.createGain();
        masterGain.gain.value=target();masterPct=pct;
        masterGain.connect(audioContext.destination);
      }catch(e){audioContext=null;masterGain=null;return;}
    }
    for(const a of tracks)if(!channels.has(a)){
      try{
        const channel=audioContext.createGain();channel.gain.value=gains.get(a)||0;
        if(!bufferedTrack(a))audioContext.createMediaElementSource(a).connect(channel);
        channel.connect(masterGain);channels.set(a,channel);
      }catch(e){/* Older browsers retain the media-volume fallback. */}
    }
    applyVolumes();
    prepareLoop(titleScreen()?title:reveal);
    if(audioContext.state!=='running'){
      try{Promise.resolve(audioContext.resume()).catch(()=>{});}catch(e){}
    }
  };
  const silence=()=>{
    ++fadeToken;pending=0;fading=false;
    for(const a of tracks){gains.set(a,0);pauseTrack(a);}
    applyVolumes();
  };
  const beginFade=token=>{
    const initial=new Map(gains),started=Date.now()+fadeDelay;fading=true;
    const tick=()=>{
      if(token!==fadeToken)return;
      const u=Math.max(0,Math.min(1,(Date.now()-started)/fadeDuration)),ease=u*u*(3-2*u);
      for(const a of tracks){const from=initial.get(a)||0;gains.set(a,from+((a===selected?1:0)-from)*ease);}
      applyVolumes();
      if(u<1)setTimeout(tick,25);
      else {fading=false;for(const a of tracks)if(a!==selected)pauseTrack(a);}
    };
    tick();
  };
  const playSelected=()=>{
    if(!unlocked||pct===0||!selected||pending||fading)return;
    if(!trackPaused(selected)&&gains.get(selected)===1&&tracks.every(a=>a===selected||!gains.get(a)))return;
    const a=selected,token=++fadeToken;pending=token;
    if(a===villain&&titleStage!=='in'){
      for(const other of tracks){gains.set(other,other===a?1:0);if(other!==a)pauseTrack(other);}
    }
    applyVolumes();
    try{
      // Keep the outgoing song audible until the incoming audio actually plays.
      Promise.resolve(playTrack(a)).then(()=>{
        if(token!==fadeToken){if(pct===0||(a!==selected&&!gains.get(a)))pauseTrack(a);return;}
        pending=0;
        if(a!==villain||titleStage==='in')beginFade(token);
      },()=>{if(token===fadeToken)pending=0;});
    }catch(e){if(token===fadeToken)pending=0;}
  };
  const selectTrack=next=>{
    if(next===selected)return;
    fadeDuration=titleStage==='in'?1400:next===reveal?150:next===millwood&&selected===villain?3200:900;
    fadeDelay=next===millwood&&selected===villain?400:0;
    ++fadeToken;pending=0;fading=false;selected=next;
    for(const a of tracks)if(a!==next&&!gains.get(a))pauseTrack(a);
    if(next===field){
      const beyondMillwood=typeof P!=='undefined'&&P.x>=80*TS;
      fieldStartPending=routeMusicIntroPlayed||beyondMillwood?10:0;
    }
    if(next===villain&&titleStage!=='in'){
      next.currentTime=0;
      for(const a of tracks){gains.set(a,a===next?1:0);if(a!==next)pauseTrack(a);}
      applyVolumes();
    }
    if(!next){beginFade(fadeToken);return;}
    playSelected();
  };
  const chooseMusic=()=>{
    if(titleStage==='out')return;
    if((titleStage!=='in'&&titleScreen())||endingMode){selectTrack(hasSong(title)?title:millwood);return;}
    if(typeof deadShown!=='undefined'&&deadShown){selectTrack(null);return;}
    try{if(mode!=='play'||quest<Q.NOISE||quest>Q.DONE){omenPlaying=false;omenHeard=false;}}catch(e){}
    if(omenPlaying){selectTrack(null);return;}
    // A loaded save or a map change cannot retain an old scripted royal cue.
    try{if(kingMode&&(MAPID!==kingMap||wonAll))kingMode=false;}catch(e){}
    selectTrack((kingMode||royalConversation()||finalBattle())&&hasSong(villain)?villain:exploreTrack());
  };
  window.EmberEndingMusic={start:()=>{endingMode=true;chooseMusic();},stop:()=>{endingMode=false;chooseMusic();}};
  window.EmberKingMusic={
    start:()=>{kingMode=true;try{kingMap=MAPID;}catch(e){}chooseMusic();},
    stop:()=>{kingMode=false;chooseMusic();},
    active:()=>selected===villain
  };
  window.EmberDragonMusic={
    omen:()=>{omenPlaying=true;omenHeard=false;selected=null;silence();},
    reveal:()=>{omenPlaying=false;omenHeard=true;chooseMusic();}
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
    const wantField=inIntertownRoute();
    millwoodMode=wantMillwood; cinderholdMode=wantCinderhold; lavaRouteMode=wantLavaRoute; mineMode=wantMine; mysticMode=wantMystic; hollybeckMode=wantHollybeck; forgewickMode=wantForgewick; thornwellMode=wantTown; fieldMode=wantField;
    chooseMusic();
  };
  setInterval(syncRegionMusic,180);
  syncRegionMusic();
  const startMusic=()=>{
    if(titleScreen()&&!titleAccepted&&titleStage!=='in')return;
    // A/B, touchstart and pointerdown can all fire for one tap. Once audio is
    // running, leave its gain automation and media outputs entirely alone.
    if(unlocked&&(!audioContext||audioContext.state==='running')){
      if(selected&&trackPaused(selected))playSelected();
      return;
    }
    openAudioGraph();unlocked=true;playSelected();
  };
  window.EmberAudio={
    percent:()=>pct,
    graph:()=>audioContext&&({context:audioContext,output:masterGain}),
    set:v=>{
      pct=Math.max(0,Math.min(100,Number(v)||0));
      try{localStorage.setItem(KEY,String(pct));}catch(e){}
      if(pct===0)silence();
      else {applyVolumes();startMusic();}
    }
  };
  const waitUntil=(check,timeout)=>new Promise(resolve=>{
    const until=Date.now()+timeout;
    const tick=()=>{if(check()||Date.now()>=until)resolve();else setTimeout(tick,50);};tick();
  });
  window.EmberTitleAudio={
    begin:()=>{
      titleAccepted=true;
      // Called synchronously by the Begin gesture: Safari must see both
      // AudioContext.resume() and HTMLMediaElement.play() in that gesture.
      startMusic();
    },
    fadeOut:(ms=1200)=>{
      titleStage='out';selected=null;fadeDuration=ms;fadeDelay=0;
      ++fadeToken;pending=0;fading=false;beginFade(fadeToken);
      return waitUntil(()=>!fading,ms+200);
    },
    fadeIn:()=>{
      titleStage='in';syncRegionMusic();startMusic();
      return waitUntil(()=>pct===0||!!(selected&&!trackPaused(selected)&&gains.get(selected)>=.99&&!fading),6500);
    },
    finish:()=>{titleStage=null;syncRegionMusic();},
  };
  applyVolumes();
  // Further taps must not jump an in-progress crossfade to full volume.
  window.addEventListener('pointerdown',startMusic,{passive:true});
  window.addEventListener('keydown',startMusic);
  window.addEventListener('touchstart',startMusic,{passive:true});
  window.addEventListener('focus',()=>{if(!document.hidden)startMusic();});
  // The explicit Begin gesture starts title audio; loading stays silent.
})();
