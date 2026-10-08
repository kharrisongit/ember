/* Main-game co-op entry, authenticated transport and account-scoped saves. */
(() => {
  'use strict';
  if(typeof CanvasRenderingContext2D==='undefined')return;
  const ENDPOINT=location.hostname==='localhost'||location.hostname==='127.0.0.1'?location.origin:'https://ldr-coop-preview.onrender.com';
  const el=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
  const button=(text,fn)=>{const node=el('button',text);node.type='button';node.addEventListener('click',fn);return node;};
  let client,room,active=false,hosting=false,connecting=false,reconnecting=false,leaving=false,players=[],hostId='',uid='',seq=0,commandSeq=0,frameAt=0,syncAt=0,saveAt=0,pendingSave=false,latestSave=null,campaignId='',cloudSlot=0,remoteSize={w:640,h:480},startPromise=null,ready=false,controllerState=null;
  const pressed=new Set(),touch=new Map(),owner=()=>window.EmberCloudState?.owner||'',key=()=>`ldr.coop.campaigns.${owner()}`;
  const localSaves=()=>{try{return JSON.parse(localStorage.getItem(key()))||[];}catch{return [];}};
  const dialog=el('dialog');dialog.id='campaignLobby';const heading=el('h2','Story co-op'),description=el('p','Travel through the campaign together, with your own riders and dragons. Story progress and equipment are shared. Each rider can gather every ingredient.');
  const status=el('p','Sign in with Google, then host an adventure or join your partner.');status.setAttribute('role','status');
  const name=el('input');name.value=EmberPlayerIdentity.capture().name;name.maxLength=16;name.setAttribute('aria-label','Rider name');
  const hair=el('select'),eyes=el('select');hair.setAttribute('aria-label','Hair color');eyes.setAttribute('aria-label','Eye color');
  for(const [select,colors]of [[hair,EmberPlayerIdentity.colors],[eyes,EmberPlayerIdentity.eyeColors]])for(const color of colors){const option=el('option',color.label);option.value=color.id;select.append(option);}
  const adventure=el('select');adventure.setAttribute('aria-label','Co-op adventure');
  const code=el('input');code.placeholder='8-character room code';code.maxLength=8;code.autocapitalize='characters';code.setAttribute('aria-label','Room code');
  const host=button('Host adventure',()=>connect(true)),join=button('Join adventure',()=>connect(false));
  dialog.append(heading,description,el('label','Your rider'),name,hair,eyes,el('label','Host a new adventure or resume'),adventure,code,status,host,join,button('Google sign-in',()=>{dialog.close();EmberCloud.open();}),button('Back',()=>dialog.close()));document.body.append(dialog);
  const open=button('Story Co-op',()=>openLobby());open.id='campaignOpen';document.getElementById('bootAccountButtons')?.append(open);
  const bar=el('div');bar.id='campaignBar';bar.hidden=true;const roomLabel=el('strong'),detail=el('span');detail.setAttribute('role','status');
  bar.append(roomLabel,button('Copy code',async()=>{try{await navigator.clipboard.writeText(room.roomId);notice('Room code copied.');}catch{notice('Share '+room.roomId);}}),button('Revive',()=>send({kind:'revive'})),button('Save',()=>send({kind:'save'})),button('Leave',()=>leave()),detail);document.body.prepend(bar);
  const noticeEl=el('p');noticeEl.id='campaignNotice';noticeEl.hidden=true;noticeEl.setAttribute('role','status');document.body.append(noticeEl);let noticeUntil=0;
  function notice(text){noticeEl.textContent=text;noticeEl.hidden=false;noticeUntil=performance.now()+5000;}
  const remote=el('canvas');remote.id='campaignView';remote.hidden=true;document.getElementById('stage').append(remote);
  const menus=el('div');menus.id='campaignMenus';menus.hidden=true;document.body.append(menus);
  const menuHost=LDRCoopUI.host(),menuGuest=LDRCoopUI.guest(menus,send),display=LDRCoopRender.player(remote,n=>room?.send('ack',n),ids=>room?.send('need',ids));
  const recorder=LDRCoopRender.recorder((type,data)=>room?.send(type,data));
  const controllerSelector='#act,#btnB,#btnL,#btnR,#btnItems,#btnMapQuick';
  function dropTouch(id){
    const held=touch.get(id);if(!held)return;touch.delete(id);
    if(![...touch.values()].some(other=>other.node===held.node)){
      held.node.classList.remove('hit');
      if(held.control)send({kind:'control',control:held.control,down:false});
    }
  }
  const pressType=padTouchMode?'touchstart':'mousedown';
  window.addEventListener(pressType,event=>{
    if(!active||LDRCoopUI.dispatching)return;
    const node=event.target.closest?.(controllerSelector+',#dpad [data-dx]');if(!node)return;
    event.preventDefault();event.stopImmediatePropagation();
    const control=node.matches(controllerSelector)?node.id:null;
    const held={node,control,x:Number(node.dataset.dx)||0,y:Number(node.dataset.dy)||0,run:control==='btnB'};
    const already=[...touch.values()].some(other=>other.node===node);
    for(const id of padInputIds(event)){dropTouch(id);touch.set(id,held);}
    node.classList.add('hit');
    if(!already){
      if(control)send({kind:'control',control,down:true});
      else send({kind:held.x<0?'left':held.x>0?'right':held.y<0?'up':'down'});
    }
  },{capture:true,passive:false});
  for(const type of padTouchMode?['touchend','touchcancel']:['mouseup'])window.addEventListener(type,event=>{
    if(!active)return;const ids=padInputIds(event);if(!ids.some(id=>touch.has(id)))return;
    for(const id of ids)dropTouch(id);event.preventDefault();event.stopImmediatePropagation();
  },{capture:true,passive:false});
  function keyboard(event){
    if(LDRCoopUI.dispatching||!active||event.ctrlKey||event.metaKey||event.altKey||event.target.closest?.('input,select,textarea')||event.key==='Tab')return;
    const key=event.key.toLowerCase(),down=event.type==='keydown';
    const nativeButton=event.target.closest?.('#campaignBar button,#campaignMenus button')||event.target.closest?.('button')?.closest?.('#merchantShop');
    if(nativeButton&&['enter',' '].includes(key))return;
    if(!['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','b',' ','enter','escape','r'].includes(key))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(down)pressed.add(key);else pressed.delete(key);
    if(key==='r'){if(down&&!event.repeat)send({kind:'revive'});return;}
    send({kind:'key',key:event.key,down,repeat:event.repeat});
  }
  function viewport(){
    if(!active)return;const rect=document.getElementById('stage').getBoundingClientRect();
    document.body.style.setProperty('--campaign-bar-height',bar.getBoundingClientRect().height+'px');
    resize();
    if(!hosting)room?.send('viewport',{w:Math.max(320,Math.min(1280,rect.width)),h:Math.max(160,Math.min(960,rect.height))});
  }
  new ResizeObserver(viewport).observe(document.getElementById('stage'));
  function showController(state){if(!state)return;controllerState=state;updateDeckHealth();refreshControllerControls();}
  function options(){
    const saves=new Map(localSaves().map(s=>[s.id,s]));
    for(let slot=1;slot<=3;slot++){const s=readSaveSlot(slot);if(s?.coop?.version===1){const checkpoint={...s.coop,save:{...s,coop:undefined}};if(!saves.has(checkpoint.id)||(saves.get(checkpoint.id).when||0)<checkpoint.when)saves.set(checkpoint.id,checkpoint);}}
    return [...saves.values()].sort((a,b)=>b.when-a.when);
  }
  function restoreProfile(){const profile=options().find(s=>s.id===adventure.value)?.players?.[owner()]?.profile;if(profile){name.value=profile.name;hair.value=profile.hair;eyes.value=profile.eyes;}}
  adventure.addEventListener('change',restoreProfile);
  function openLobby(id){
    adventure.replaceChildren();const fresh=el('option','New shared story');fresh.value='new';adventure.append(fresh);
    for(const s of options()){const option=el('option','Resume · '+s.save.map.replaceAll('_',' ')+' · '+new Date(s.when).toLocaleString());option.value=s.id;adventure.append(option);}
    adventure.value=id||options()[0]?.id||'new';restoreProfile();dialog.showModal();
  }
  function persist(checkpoint){
    if(!owner()||!checkpoint||checkpoint.version!==1||typeof checkpoint.id!=='string')return;
    latestSave=checkpoint;campaignId=checkpoint.id;const saves=localSaves().filter(s=>s.id!==checkpoint.id);saves.unshift(checkpoint);
    try{
      localStorage.setItem(key(),JSON.stringify(saves.slice(0,4)));
      if(!cloudSlot)for(let slot=1;slot<=3;slot++){const existing=readSaveSlot(slot);if(existing?.coop?.id===checkpoint.id){cloudSlot=slot;break;}}
      if(!cloudSlot)for(let slot=1;slot<=3;slot++)if(!readSaveSlot(slot)){cloudSlot=slot;break;}
      if(cloudSlot){
        const existing=readSaveSlot(cloudSlot);if(existing&&existing.coop?.id!==checkpoint.id){cloudSlot=0;return;}
        const {save,...coop}=checkpoint,personal=checkpoint.players?.[uid];
        const payload={...save,when:checkpoint.when,playerIdentity:personal?.profile||save.playerIdentity,crafting:personal?.crafting||save.crafting,coop};
        const raw=JSON.stringify(payload);if(raw.length>262144)throw Error('Co-op save is too large for cloud backup.');
        localStorage.setItem(EmberCloudState.key(cloudSlot),raw);EmberCloudState.saved(cloudSlot);
      }
      return true;
    }catch(error){notice('Could not save co-op: '+error.message);return false;}
  }
  function checkpoint(force=false){
    if(!hosting){if(force)room?.send('command',{kind:'save',seq:++commandSeq});return false;}
    pendingSave=true;const data=LDRCampaign.checkpoint();if(!data){if(force)notice('Save queued until this scene or battle finishes.');return false;}
    const saved={version:1,id:campaignId,when:Date.now(),...data};if(!persist(saved))return false;
    room?.send('checkpoint',saved);pendingSave=false;saveAt=performance.now();
    if(force)notice(cloudSlot?'Co-op saved · cloud backup queued in slot '+cloudSlot:'Co-op saved on this device · all cloud slots are occupied.');
    return true;
  }
  async function connect(isHost){
    if(connecting||!gameplayReady||gameplayStarted)return;const roomCode=code.value.replace(/\s/g,'').toUpperCase();
    if(!isHost&&!/^[A-HJ-NP-Z2-9]{8}$/.test(roomCode)){status.textContent='Enter your partner’s 8-character room code.';return;}
    connecting=true;host.disabled=join.disabled=true;status.textContent='Connecting to the co-op server…';
    try{
      const token=await EmberCloud.getIdToken();uid=owner();client=new Colyseus.Client(ENDPOINT);client.auth.token=token;
      hosting=isHost;const profile=EmberPlayerIdentity.normalize({name:name.value,hair:hair.value,eyes:eyes.value});
      latestSave=isHost?options().find(s=>s.id===adventure.value)||null:null;campaignId=latestSave?.id||crypto.randomUUID();cloudSlot=0;
      room=isHost?await client.create('story_campaign',{protocol:6,profile}):await client.joinById(roomCode,{protocol:6,profile});
      wire(room);active=true;ready=false;leaving=false;dialog.close();bar.hidden=false;open.hidden=true;roomLabel.textContent='ROOM '+room.roomId;
      document.body.classList.add('campaign-active','game-started',hosting?'campaign-host':'campaign-guest');EmberPlayerIdentity.restore(profile);viewport();
      if(!hosting){gameplayStarted=true;EmberTitleAudio?.finish();remote.hidden=false;document.getElementById('boot').style.display='none';}
      room.send('ready');viewport();
    }catch(error){status.textContent=/401|token|Google/.test(error.message)?'Sign in with Google first. Each player needs a different account.':error.message||'Could not connect. The free server may need a moment to wake up.';active=false;}
    finally{connecting=false;host.disabled=join.disabled=false;}
  }
  function wire(connection){
    connection.reconnection.enabled=false;
    connection.onMessage('members',data=>{
      players=data.players;hostId=data.hostId;
      if(hosting){
        if(!startPromise){startPromise=LDRCampaign.start({uid,players,checkpoint:latestSave,onNotice:notice,onSave:checkpoint}).then(()=>{LDRCampaign.syncParty(players);ready=true;checkpoint();}).catch(error=>{notice('Co-op could not start: '+error.message);console.error(error);});}
        else if(ready)LDRCampaign.syncParty(players);
      }
      updateStatus();
    });
    connection.onMessage('input',data=>{if(hosting){const member=players.find(m=>m.id===data.id);if(member)LDRCampaign.setInput(member.uid,data);}});
    connection.onMessage('command',data=>{if(hosting){const member=players.find(m=>m.id===data.id);if(member)execute(member.uid,data);}});
    connection.onMessage('viewport',data=>{remoteSize=data;});
    connection.onMessage('refresh',()=>{if(hosting){recorder.reset();room.send('status',{reset:true});menuHost.reset();if(latestSave)room.send('checkpoint',latestSave);}else display.reset();});
    connection.onMessage('need',data=>recorder.needs(data));
    connection.onMessage('ack',data=>recorder.ack(data));
    connection.onMessage('texture',data=>{if(!hosting)display.add(data);});
    connection.onMessage('frame',data=>{if(!hosting){display.frame(data);ready=true;}});
    connection.onMessage('ui',data=>{if(!hosting)menuGuest.render(data);});
    connection.onMessage('sfx',data=>{if(!hosting&&sfxNames.includes(data.name))EmberSfx[data.name]();});
    connection.onMessage('status',data=>{if(!hosting){if(data.controller)showController(data.controller);if(data.music&&data.music!==lastMusic&&EmberAudio.tracks().includes(data.music)){lastMusic=data.music;EmberAudio.preview(data.music);}if(data.reset)display.reset();detail.textContent=data.text||'';if(data.notice&&data.notice!==lastNotice){lastNotice=data.notice;notice(data.notice);};}});
    connection.onMessage('checkpoint',data=>{if(!hosting)persist(data);});
    connection.onMessage('pong',()=>{});
    connection.onMessage('ended',text=>{notice(text);ready=false;leaving=true;detail.textContent=text;});
    connection.onError((_code,text)=>notice(text));
    connection.onLeave(async code=>{
      if(leaving)return;release();reconnecting=true;updateStatus();const deadline=Date.now()+55000;
      while(!leaving&&Date.now()<deadline){
        try{const recovered=await client.reconnect(connection.reconnectionToken);room=recovered;wire(room);reconnecting=false;room.send('ready');return;}
        catch{await new Promise(resolve=>setTimeout(resolve,1500));}
      }
      detail.textContent='Connection ended. Your last co-op save is available at the title screen.';
    });
  }
  function paused(){return reconnecting||players.length<2||players.some(m=>!m.connected||!m.visible);}
  function updateStatus(){
    detail.textContent=reconnecting?'Reconnecting · adventure paused':players.length<2?'Waiting for your partner':players.some(m=>!m.connected)?'Waiting for your partner to reconnect':players.some(m=>!m.visible)?'Paused while your partner is away':cloudSlot?'Co-op autosave · slot '+cloudSlot:'Co-op autosave on this device';
  }
  function execute(id,data){
    if(!ready||reconnecting)return;if(paused()&&!['save','release'].includes(data.kind)&&!(data.kind==='control'&&!data.down)&&!(data.kind==='key'&&!data.down)){notice('Waiting for your partner · adventure paused.');return;}
    if(data.kind==='ui'){const kind=menuHost.actionKind(data);if(kind)LDRCampaign.command(id,kind);else if(LDRCampaign.claim(id,'ui'))menuHost.act(data);}
    else LDRCampaign.command(id,data.kind,data);
  }
  function send(data){if(!active||!room||reconnecting)return;if(hosting)execute(uid,data);else room.send('command',{...data,seq:++commandSeq});}
  function release(){pressed.clear();for(const held of touch.values())held.node.classList.remove('hit');touch.clear();if(active){if(hosting)LDRCampaign.setInput(uid,{x:0,y:0});else room?.send('input',{seq:++seq,x:0,y:0});send({kind:'release'});}}
  async function leave(){
    if(hosting){if(!checkpoint(true))return false;}
    else if(latestSave&&!persist(latestSave))return false;
    leaving=true;release();const connection=room;if(connection)await connection.leave().catch(()=>{});location.reload();
    return true;
  }
  window.addEventListener('resize',viewport);
  window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(!active)return;release();room?.send('visibility',!document.hidden);if(document.hidden&&hosting)checkpoint();});
  window.addEventListener('pagehide',()=>{if(active&&hosting)checkpoint();});
  // Native host menus belong to the rider who opened them. A companion sees
  // the same menu and uses its bounded tokens; no remote DOM selectors execute.
  window.addEventListener('click',event=>{if(LDRCoopUI.dispatching||!active||!hosting||event.target.closest?.('#campaignBar,#deck,#campaignLobby'))return;if(event.target.closest?.('#say,#sayname,#face,#reveal')){event.preventDefault();event.stopImmediatePropagation();send({kind:'action'});return;}if(LDRCampaign.held&&LDRCampaign.owner!==uid){event.preventDefault();event.stopImmediatePropagation();notice('Your partner is choosing. Use A to continue shared dialogue.');}},true);
  let lastMusic='',lastNotice='';
  const sfxNames=['door','ui','coin','breathHit','dragonFire','hatch','golemHit','hit','death','stopDeath','block','sword','pickup','key'];
  for(const name of sfxNames){const original=EmberSfx[name];EmberSfx[name]=function(...args){if(active&&hosting&&room)room.send('sfx',{name});return original.apply(this,args);};}
  const baseFrame=frameCore;
  frameCore=function(ms){
    if(!active)return baseFrame(ms);
    if(!ready){last=ms;return;}
    const vector={x:Number(pressed.has('d')||pressed.has('arrowright'))-Number(pressed.has('a')||pressed.has('arrowleft')),y:Number(pressed.has('s')||pressed.has('arrowdown'))-Number(pressed.has('w')||pressed.has('arrowup')),run:pressed.has('b')};
    for(const held of touch.values()){vector.x+=held.x||0;vector.y+=held.y||0;vector.run||=held.run;}
    if(ms-frameAt>=50){frameAt=ms;if(hosting)LDRCampaign.setInput(uid,vector);else if(!reconnecting)room.send('input',{...vector,seq:++seq});}
    if(hosting){
      controllerState=LDRCampaign.controllerState(uid);
      LDRCampaign.mainFrame(ms,paused());
      updateDeckHealth();
      const guest=players.find(m=>m.id!==hostId);
      if(guest?.connected&&recorder.ready(ms))recorder.capture(remoteSize.w,remoteSize.h,g=>LDRCampaign.renderGuest(g,remoteSize.w,remoteSize.h,guest.uid),ms);
      if(ms-syncAt>180){syncAt=ms;const ui=menuHost.capture();if(ui.changed)room.send('ui',ui);updateStatus();room.send('status',{controller:guest?LDRCampaign.controllerState(guest.uid):null,text:detail.textContent,music:EmberAudio.currentTrack?.(),notice:noticeEl.hidden?'':noticeEl.textContent});}
      if(ms-saveAt>10000||pendingSave&&ms-saveAt>1500)checkpoint();
    }else last=ms;
    if(!noticeEl.hidden&&ms>noticeUntil)noticeEl.hidden=true;
  };
  const continueGame=BOOT.continueGame;BOOT.continueGame=function(){const saved=readSaveSlot(BOOT.latestSave());if(saved?.coop){openLobby(saved.coop.id);return;}return continueGame.call(this);};
  const takeLoad=BOOT.takeLoad;BOOT.takeLoad=function(pick=BOOT.loadPick){const saved=pick<3?readSaveSlot(pick+1):null;if(saved?.coop){openLobby(saved.coop.id);return;}return takeLoad.call(this,pick);};
  setInterval(()=>{open.hidden=active||gameplayStarted;open.disabled=!gameplayReady||connecting;},300);
  window.LDRCoopCampaign={get active(){return active;},get controllerState(){return controllerState;},keyboard,open:openLobby,save:checkpoint,inspect:()=>({hosting,ready,players,cloudSlot,latestSave,campaignId})};
})();
