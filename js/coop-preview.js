/* Loaded only by the separate multiplayer server, never by the live Pages build. */
(() => {
  'use strict';
  const el=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
  const button=(text,fn)=>{const node=el('button',text);node.type='button';node.addEventListener('click',fn);return node;};
  let client=null,room=null,active=false,connecting=false,leaving=false,reconnecting=false,seq=0,lastInput=0,lastFrame=0;
  let snapshots=[],bounds=null,roomCode='',message='Sign in with Google, then create or join a preview room.';
  try{message=sessionStorage.getItem('ldr.coop.message')||message;sessionStorage.removeItem('ldr.coop.message');}catch{}
  const held=new Set(),touch=new Map(),spriteCache=new Map();
  const dialog=el('dialog');dialog.id='coopDialog';dialog.setAttribute('aria-labelledby','coopTitle');
  const heading=el('h2','Story co-op · connection preview');heading.id='coopTitle';
  const description=el('p','Meet in Millwood with a dragon each. This first test checks movement and connections. Battles, quests and saving are not enabled in this preview.');
  const status=el('p',message);status.setAttribute('role','status');status.className='coop-status';
  const nameLabel=el('label','Rider name'),name=el('input');name.value='Dragonrider';name.maxLength=16;name.autocomplete='nickname';nameLabel.append(name);
  const hairLabel=el('label','Hair'),hair=el('select');hair.setAttribute('aria-label','Hair color');
  for(const color of window.EmberPlayerIdentity.colors){const option=el('option',color.label);option.value=color.id;hair.append(option);}hairLabel.append(hair);
  const eyeLabel=el('label','Eyes'),eyes=el('select');eyes.setAttribute('aria-label','Eye color');
  for(const color of window.EmberPlayerIdentity.eyeColors){const option=el('option',color.label);option.value=color.id;eyes.append(option);}eyeLabel.append(eyes);
  const profileRow=el('div');profileRow.className='coop-profile';profileRow.append(nameLabel,hairLabel,eyeLabel);
  const joinLabel=el('label','Room code'),code=el('input');code.maxLength=8;code.autocomplete='off';code.autocapitalize='characters';code.spellcheck=false;code.placeholder='8-character code';joinLabel.append(code);
  const actions=el('div');actions.className='coop-actions';
  const sign=button('Google sign-in',()=>{dialog.close();window.EmberCloud.open();});
  const host=button('Host preview',()=>connect(true)),join=button('Join preview',()=>connect(false));
  const close=button('Back',()=>dialog.close());actions.append(sign,host,join,close);
  dialog.append(heading,description,profileRow,joinLabel,status,actions);document.body.append(dialog);
  const open=button('Co-op Preview',()=>{status.textContent=message;dialog.showModal();});open.id='coopOpen';document.body.append(open);
  const hud=el('div');hud.id='coopHud';hud.hidden=true;
  const label=el('strong'),detail=el('span');detail.setAttribute('role','status');
  const copy=button('Copy code',async()=>{try{await navigator.clipboard.writeText(roomCode);detail.textContent='Room code copied.';}catch{detail.textContent='Share this code: '+roomCode;}});
  hud.append(label,detail,copy,button('Leave',()=>leave()));document.body.append(hud);
  const pad=el('div');pad.id='coopPad';pad.hidden=true;pad.setAttribute('aria-label','Movement controls');
  for(const [caption,key]of [['↑','arrowup'],['←','arrowleft'],['↓','arrowdown'],['→','arrowright']]){
    const b=button(caption,()=>{});b.dataset.direction=key;b.setAttribute('aria-label','Move '+key.slice(5));
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();b.setPointerCapture(e.pointerId);touch.set(e.pointerId,key);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{touch.delete(e.pointerId);});pad.append(b);
  }
  document.body.append(pad);
  function release(){held.clear();touch.clear();if(room&&!reconnecting)room.send('input',{seq:++seq,x:0,y:0});}
  window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
  for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{
    if(!active)return;
    const key=e.key.toLowerCase();
    if(e.key==='Tab'||e.target.closest?.('input,select')||(e.target.closest?.('button')&&['Enter',' '].includes(e.key)))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(type==='keydown')held.add(key);else held.delete(key);
  },true);
  function errorText(error){
    const raw=String(error?.message||'');
    if(/401|Google|token/i.test(raw))return 'Sign in with Google at the title screen, then try again.';
    if(/409|different Google/.test(raw))return 'Each player needs a different Google account.';
    if(/not found|not exist|invalid room|4212/i.test(raw))return 'That room is no longer available. Check the code or ask the host to create a new room.';
    if(/locked|full|403/i.test(raw))return 'This room already has two players.';
    return raw||'Could not connect. The free server may be waking up. Try again in a minute.';
  }
  async function connect(isHost){
    if(connecting)return;
    if(!gameplayReady||gameplayStarted){status.textContent='Open the preview from the title screen after the game finishes loading.';return;}
    const roomId=code.value.replace(/\s/g,'').toUpperCase();
    if(!isHost&&!/^[A-HJ-NP-Z2-9]{8}$/.test(roomId)){status.textContent='Enter the host’s 8-character room code.';return;}
    connecting=true;host.disabled=join.disabled=true;status.textContent='Connecting…';
    try{
      const token=await window.EmberCloud.getIdToken();
      client=new Colyseus.Client(location.origin);client.auth.token=token;
      const profile=window.EmberPlayerIdentity.normalize({name:name.value,hair:hair.value,eyes:eyes.value});
      const options={protocol:1,profile};
      room=isHost?await client.create('story_coop_preview',options):await client.joinById(roomId,options);
      leaving=false;seq=0;roomCode=room.roomId;wire(room);
      // Loading the map does not run a campaign or touch any save slot.
      if(MAPID!=='world')await BOOT.map('world',true,100,100,'Preparing Millwood co-op preview');
      active=true;lastFrame=performance.now();lastInput=0;
      document.body.classList.add('coop-preview-active');dialog.close();hud.hidden=pad.hidden=false;
      label.textContent='ROOM '+roomCode;detail.textContent='Waiting for your partner · movement test only';
      room.send('ready');
    }catch(error){if(room){leaving=true;await room.leave().catch(()=>{});room=null;}status.textContent=errorText(error);}
    finally{connecting=false;host.disabled=join.disabled=false;}
  }
  function wire(connection){
    connection.reconnection.enabled=false;
    connection.onMessage('welcome',data=>{bounds=data.bounds;});
    connection.onMessage('snapshot',data=>{
      snapshots.push({at:performance.now(),players:data.players});if(snapshots.length>4)snapshots.shift();
      const connected=data.players.filter(p=>p.connected).length;
      detail.textContent=connected===2?'Two riders connected · movement test only':'Waiting for your partner · movement test only';
    });
    connection.onMessage('pong',()=>{});
    connection.onMessage('ended',reason=>{message=reason;leaving=true;finish();});
    connection.onError((_code,text)=>{detail.textContent=text||'Connection interrupted.';});
    connection.onLeave(async closeCode=>{
      if(leaving)return;
      release();
      if(closeCode===1000||closeCode===4000||closeCode===4001){message='The room ended or the server restarted. Create or join a new room.';finish();return;}
      reconnecting=true;detail.textContent='Connection lost · trying to reconnect…';
      const deadline=Date.now()+28000;let delay=500;
      while(!leaving&&Date.now()<deadline){
        try{const recovered=await client.reconnect(connection.reconnectionToken);if(leaving){await recovered.leave();return;}room=recovered;wire(room);reconnecting=false;room.send('ready');return;}
        catch{await new Promise(resolve=>setTimeout(resolve,delay));delay=Math.min(3000,delay*2);}
      }
      if(!leaving){message='Could not reconnect. Your campaign saves are unchanged.';finish();}
    });
  }
  function finish(){
    active=false;reconnecting=false;room=null;snapshots=[];bounds=null;held.clear();touch.clear();spriteCache.clear();
    document.body.classList.remove('coop-preview-active');hud.hidden=pad.hidden=true;
    try{sessionStorage.setItem('ldr.coop.message',message);}catch{}
    location.reload();
  }
  async function leave(){leaving=true;const old=room;message='You left the preview. Your campaign saves are unchanged.';finish();if(old)await old.leave().catch(()=>{});}
  function players(){
    if(!snapshots.length)return [];
    const latest=snapshots[snapshots.length-1],previous=snapshots[snapshots.length-2]||latest;
    const a=Math.max(0,Math.min(1,(performance.now()-latest.at)/50));
    return latest.players.map(p=>{
      const before=previous.players.find(q=>q.id===p.id)||p;
      const lerp=key=>({...p[key],x:before[key].x+(p[key].x-before[key].x)*a,y:before[key].y+(p[key].y-before[key].y)*a});
      return {...p,rider:lerp('rider'),dragon:lerp('dragon')};
    });
  }
  let renderPlayers=[];
  function frame(ms){
    if(!active)return false;
    const dt=Math.min(.05,(ms-lastFrame)/1000||0);lastFrame=ms;last=ms;tAcc+=dt;
    if(!reconnecting&&room&&ms-lastInput>=50){
      lastInput=ms;const keysNow=new Set([...held,...touch.values()]);
      const x=Number(keysNow.has('arrowright')||keysNow.has('d'))-Number(keysNow.has('arrowleft')||keysNow.has('a'));
      const y=Number(keysNow.has('arrowdown')||keysNow.has('s'))-Number(keysNow.has('arrowup')||keysNow.has('w'));
      room.send('input',{seq:++seq,x,y});
    }
    renderPlayers=players();const own=renderPlayers.find(p=>p.id===room?.sessionId);
    if(own){P.x=own.rider.x;P.y=own.rider.y;P.moving=false;cam.z=playZoom();cam.x=P.x-VW/cam.z/2;cam.y=P.y-VH/cam.z/2;clampCam();}
    drawWorld(tAcc,dt);return true;
  }
  const originalFrame=frameCore;frameCore=function(ms){if(!frame(ms))return originalFrame(ms);};
  const originalSave=saveToSlot;saveToSlot=function(...args){if(active)return false;return originalSave(...args);};
  function addActors(draw){
    if(!active)return;
    for(let i=draw.length-1;i>=0;i--)if(draw[i]===P||draw[i].dg)draw.splice(i,1);
    for(const member of renderPlayers){
      draw.push({coop:member,kind:'rider',x:member.rider.x,y:member.rider.y});
    }
    if(bounds)draw.push({coopBoundary:true,x:bounds.x,y:bounds.y,sy:-1e9});
  }
  function riderCanvas(sprite,frame,member){
    const key=[sprite[0],sprite[1],frame,member.hair,member.eyes].join(':');if(spriteCache.has(key))return spriteCache.get(key);
    const canvas=document.createElement('canvas');canvas.width=sprite[2];canvas.height=sprite[3];const g=canvas.getContext('2d');
    const sx=sprite[0]+frame*sprite[2],sy=sprite[1];
    for(const page of atlasPages.values()){
      const left=Math.max(sx,page.x),top=Math.max(sy,page.y),right=Math.min(sx+sprite[2],page.x+page.w),bottom=Math.min(sy+sprite[3],page.y+page.h);
      if(right>left&&bottom>top)g.drawImage(page.img,left-page.x,top-page.y,right-left,bottom-top,left-sx,top-sy,right-left,bottom-top);
    }
    const pixels=g.getImageData(0,0,canvas.width,canvas.height);
    window.EmberPlayerIdentity.recolorPixels(pixels.data,member.hair,false);
    window.EmberPlayerIdentity.recolorEyes(pixels.data,member.eyes,false,canvas.width);g.putImageData(pixels,0,0);
    if(spriteCache.size>160)spriteCache.delete(spriteCache.keys().next().value);spriteCache.set(key,canvas);return canvas;
  }
  function drawActor(actor){
    if(!active)return false;
    if(actor.coopBoundary){ctx.save();ctx.strokeStyle='#e7c977';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.strokeRect(bounds.x,bounds.y,bounds.w,bounds.h);ctx.restore();return true;}
    const member=actor.coop;if(!member)return false;
    const pose=member[actor.kind];ctx.save();ctx.globalAlpha=member.connected?1:.45;
    if(actor.kind==='rider'){
      const dir=pose.dir==='n'?'u':pose.dir==='s'?'d':pose.dir;
      const sprite=SPR['corin_bare_'+(pose.moving?'walk':'idle')+'_'+dir];
      if(sprite){const frame=Math.floor(pose.t*(pose.moving?9:6))%sprite[4];ctx.imageSmoothingEnabled=false;ctx.drawImage(riderCanvas(sprite,frame,member),Math.round(pose.x-sprite[2]/2),Math.round(pose.y-sprite[3]+corinFeetOffset()));}
    }else{
      const direction=pose.dir==='w'?'e':pose.dir,action=pose.moving?'fly':'hover';
      const sprite=SPR['dr5_'+action+'_'+direction]||SPR['dr5_fly_'+direction]||SPR.dr5_idle_s;
      if(sprite){const frame=Math.floor(pose.t*6)%sprite[4],scale=DRAGON_DRAW_SCALE,w=Math.round(sprite[2]*scale),h=Math.round(sprite[3]*scale),bob=Math.sin(pose.t*2)*2;
        ctx.globalAlpha*=.25;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(pose.x,pose.y+3,11,3,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=member.connected?1:.45;
        ctx.translate(Math.round(pose.x-w/2),Math.round(pose.y-h-12+bob));if(pose.dir==='w'){ctx.translate(w,0);ctx.scale(-1,1);}ctx.imageSmoothingEnabled=false;
        drawGameImage(ctx,sheetOf(sprite),sprite[0]+frame*sprite[2],sprite[1],sprite[2],sprite[3],0,0,w,h);
      }
    }
    ctx.restore();return true;
  }
  window.LDRCoop={get active(){return active;},addActors,drawActor,drawAirborne(){
    if(!active)return;
    for(const member of renderPlayers)drawActor({coop:member,kind:'dragon'});
    ctx.save();ctx.font='6px sans-serif';ctx.textAlign='center';
    for(const member of renderPlayers){const pose=member.rider,width=Math.ceil(ctx.measureText(member.name).width)+6;
      ctx.fillStyle='#191614';ctx.fillRect(pose.x-width/2,pose.y+3,width,9);
      ctx.fillStyle=member.id===room?.sessionId?'#ffe29a':'#a1e8ef';ctx.fillText(member.name,pose.x,pose.y+10);
    }ctx.restore();
  }};
  const originalOpen=BOOT.close;BOOT.close=async function(...args){if(active||connecting)return;return originalOpen.apply(this,args);};
  const refresh=setInterval(()=>{open.hidden=gameplayStarted||active;open.disabled=!gameplayReady||connecting;},300);
  window.addEventListener('pagehide',()=>{release();clearInterval(refresh);});
})();
