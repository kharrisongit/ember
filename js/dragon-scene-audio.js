// Gameplay and dragon-scene effects share the music mixer, including its iPhone-safe volume gain.
(()=>{
  const files={coin:'coin-collect',ui:'ui-click',roar:'dragon-roar',distant:'dragon-distant-crash',
    crash:'dragon-crash',wings:'dragon-wings',breathing:'dragon-breathing',
    breathHit:'dragon-breath-hit',hatch:'egg-hatch',golemHit:'golem-hit',hit:'sword-hit',death:'game-over',block:'shield-block',sword:'sword-swing',pickup:'item-pickup',key:'key-item'};
  const dragonEffects=['roar','distant','crash','wings','breathing'];
  const downloads=new Map(),buffers=new Map(),voices=new Map();
  let currentPhase='off';
  for(const [name,file]of Object.entries(files))
    downloads.set(name,fetch('assets/audio/'+file+'.m4a?v='+(name==='distant'?'20260926-trim':'20260926-1'))
      .then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();}).catch(()=>null));
  const ready=name=>{
    const graph=window.EmberAudio?.graph();
    if(!graph)return Promise.resolve(null);
    if(!buffers.has(name))buffers.set(name,downloads.get(name).then(bytes=>
      bytes?graph.context.decodeAudioData(bytes.slice(0)):null).catch(()=>null));
    return buffers.get(name);
  };
  const stop=name=>{
    const voice=voices.get(name);voices.delete(name);
    if(voice?.source){try{voice.source.stop();}catch(e){}voice.source.disconnect();voice.gain.disconnect();}
    voice?.done?.();
  };
  const play=(name,loop=false,restart=false,done=null)=>{
    if(voices.has(name)){if(!restart)return;stop(name);}
    const voice={requested:performance.now(),done};voices.set(name,voice);
    ready(name).then(buffer=>{
      if(voices.get(name)!==voice)return;
      const graph=window.EmberAudio?.graph();
      // A missed one-shot must not arrive late over an unrelated animation.
      if(!buffer||!graph||(!loop&&performance.now()-voice.requested>1500)){voices.delete(name);done?.();return;}
      const source=graph.context.createBufferSource(),gain=graph.context.createGain();
      voice.source=source;voice.gain=gain;
      source.buffer=buffer;source.loop=loop;gain.gain.value=.7;
      source.connect(gain);gain.connect(graph.output);
      source.onended=()=>{
        if(voices.get(name)===voice){voices.delete(name);done?.();}
        source.disconnect();gain.disconnect();
      };
      source.start();
    });
  };
  const clear=()=>{for(const name of dragonEffects)stop(name);currentPhase='off';};
  const inGame=()=>{try{return !document.hidden&&mode==='play';}catch(e){return false;}};
  const playable=()=>{
    try{return inGame()&&MAPID==='world'&&quest>=Q.NOISE&&quest<=Q.ARMED;}catch(e){return false;}
  };
  const phase=next=>{
    if(!playable()){clear();return;}
    if(next===currentPhase)return;
    currentPhase=next;
    if(!['in','rise','depart'].includes(next))stop('wings');
    if(next!=='sit')stop('breathing');
    if(['in','rise','depart'].includes(next))play('wings',true);
    if(next==='crash')play('crash');
    if(next==='sit')play('breathing',true);
  };
  window.EmberDragonSceneAudio={
    phase,
    distant:()=>{
      if(!playable()||voices.has('roar')||voices.has('distant'))return;
      window.EmberDragonMusic?.omen();
      let remaining=2;
      const finished=()=>{if(--remaining===0)window.EmberDragonMusic?.reveal();};
      play('roar',false,false,finished);play('distant',false,false,finished);
    },
    stop:clear
  };
  let lastUi=-Infinity;
  const uiClick=()=>{
    if(document.hidden||performance.now()-lastUi<40)return;
    lastUi=performance.now();
    // Wait for the gesture's audio-unlock listener, including the first title tap.
    Promise.resolve().then(()=>{if(!document.hidden)play('ui',false,true);});
  };
  window.EmberSfx={
    ui:uiClick,
    coin:()=>{if(inGame())play('coin');},
    breathHit:()=>{if(inGame())play('breathHit',false,true);},
    hatch:()=>{if(inGame())play('hatch',false,true);},
    golemHit:()=>{if(inGame())play('golemHit',false,true);},
    hit:()=>{if(inGame())play('hit',false,true);},
    death:()=>{if(inGame()){for(const name of voices.keys())stop(name);play('death');}},
    stopDeath:()=>stop('death'),
    block:()=>{if(inGame())play('block',false,true);},
    sword:()=>{if(inGame())play('sword',false,true);},
    pickup:()=>{if(inGame())play('pickup');},
    key:()=>{if(inGame())play('key',false,true);}
  };
  // Menu controls also include clickable divs and inventory cells. A/B and the
  // D-pad call the semantic handlers below, so movement/combat never clicks.
  document.addEventListener('click',e=>{
    const target=e.target?.closest?.('button,[role="button"],.btn,.equipBtn,#bagRows .slot:not(.empty),#bagBook,#bootNew,#bootLoad');
    if(!target||target.disabled||target.getAttribute('aria-disabled')==='true')return;
    if(target.closest('#dpad,#act,#btnB'))return;
    if(target.id==='bootLoad'&&!target.dataset.on)return;
    if(target.closest('#bagRows')&&typeof bagDragged==='function'&&bagDragged())return;
    uiClick();
  },true);
  const warm=()=>{for(const name of Object.keys(files))ready(name);};
  window.addEventListener('pointerdown',warm,{passive:true});
  window.addEventListener('touchstart',warm,{passive:true});
  window.addEventListener('keydown',warm);
  // Stop old scenes after loading another save, returning to the title, or
  // backgrounding the app, even when the simulation itself is paused.
  setInterval(()=>{
    if(!inGame()){for(const name of voices.keys())if(name!=='ui'||document.hidden)stop(name);currentPhase='off';}
    else if(!playable())clear();
    if(typeof deadShown!=='undefined'&&!deadShown)stop('death');
  },180);
})();
