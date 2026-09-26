// Buffered effects share the music mixer, including its iPhone-safe volume gain.
(()=>{
  const files={roar:'dragon-roar',distant:'dragon-distant-crash',
    crash:'dragon-crash',wings:'dragon-wings',breathing:'dragon-breathing'};
  const downloads=new Map(),buffers=new Map(),voices=new Map();
  let currentPhase='off';
  for(const [name,file]of Object.entries(files))
    downloads.set(name,fetch('assets/audio/'+file+'.m4a?v=20260926-1')
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
  };
  const play=(name,loop=false)=>{
    if(voices.has(name))return;
    const voice={requested:performance.now()};voices.set(name,voice);
    ready(name).then(buffer=>{
      if(voices.get(name)!==voice)return;
      const graph=window.EmberAudio?.graph();
      // A missed one-shot must not arrive late over an unrelated animation.
      if(!buffer||!graph||(!loop&&performance.now()-voice.requested>1500)){voices.delete(name);return;}
      const source=graph.context.createBufferSource(),gain=graph.context.createGain();
      voice.source=source;voice.gain=gain;
      source.buffer=buffer;source.loop=loop;gain.gain.value=.7;
      source.connect(gain);gain.connect(graph.output);
      source.onended=()=>{
        if(voices.get(name)===voice)voices.delete(name);
        source.disconnect();gain.disconnect();
      };
      source.start();
    });
  };
  const clear=()=>{for(const name of voices.keys())stop(name);currentPhase='off';};
  const playable=()=>{
    try{return !document.hidden&&mode==='play'&&MAPID==='world'&&quest>=Q.NOISE&&quest<=Q.ARMED;}catch(e){return false;}
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
    distant:()=>{if(playable()){play('roar');play('distant');}},
    stop:clear
  };
  const warm=()=>{for(const name of Object.keys(files))ready(name);};
  window.addEventListener('pointerdown',warm,{passive:true});
  window.addEventListener('touchstart',warm,{passive:true});
  window.addEventListener('keydown',warm);
  // Stop old scenes after loading another save, returning to the title, or
  // backgrounding the app, even when the simulation itself is paused.
  setInterval(()=>{if(!playable())clear();},180);
})();
