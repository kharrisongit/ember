/* Loaded only by the separate multiplayer server, never by the live Pages build. */
(() => {
  'use strict';
  const el=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
  const button=(text,fn)=>{const node=el('button',text);node.type='button';node.addEventListener('click',fn);return node;};
  let client=null,room=null,active=false,connecting=false,leaving=false,reconnecting=false,seq=0,actionSeq=0,lastInput=0,lastFrame=0;
  let snapshots=[],bounds=null,roomCode='',message='Sign in with Google, then create or join a preview room.';
  let battle=null,story=null,seenEffect=0,renderEnemies=[];
  let pickups=[],inventory={ingredients:{},story:[]},pickupCatalog={materials:{},storyItems:{}},noticeUntil=0;
  const ingredientArt=new Image();ingredientArt.src='/assets/crafting/ingredients.webp?v=20261005';
  try{message=sessionStorage.getItem('ldr.coop.message')||message;sessionStorage.removeItem('ldr.coop.message');}catch{}
  const held=new Set(),touch=new Map(),spriteCache=new Map(),dragonCache=new Map();
  const dialog=el('dialog');dialog.id='coopDialog';dialog.setAttribute('aria-labelledby','coopTitle');
  const heading=el('h2','Story co-op · opening chapter');heading.id='coopTitle';
  const description=el('p','Start the story together, from Nan’s house to your two dragons hatching. Conversations wait for both players. Your partner’s dragon is purple; ingredients are personal and story rewards are shared. Progress currently lasts for this room.');
  const status=el('p',message);status.setAttribute('role','status');status.className='coop-status';
  const nameLabel=el('label','Rider name'),name=el('input');name.value='Dragonrider';name.maxLength=16;name.autocomplete='nickname';nameLabel.append(name);
  const hairLabel=el('label','Hair'),hair=el('select');hair.setAttribute('aria-label','Hair color');
  for(const color of window.EmberPlayerIdentity.colors){const option=el('option',color.label);option.value=color.id;hair.append(option);}hairLabel.append(hair);
  const eyeLabel=el('label','Eyes'),eyes=el('select');eyes.setAttribute('aria-label','Eye color');
  for(const color of window.EmberPlayerIdentity.eyeColors){const option=el('option',color.label);option.value=color.id;eyes.append(option);}eyeLabel.append(eyes);
  const profileRow=el('div');profileRow.className='coop-profile';profileRow.append(nameLabel,hairLabel,eyeLabel);
  const adventureLabel=el('label','Host adventure'),adventure=el('select');adventure.setAttribute('aria-label','Host adventure');
  for(const [value,caption]of [['story','Story opening · start together'],['explore','Free exploration · dragons and practice battle']]){const o=el('option',caption);o.value=value;adventure.append(o);}adventureLabel.append(adventure);
  const joinLabel=el('label','Room code'),code=el('input');code.maxLength=8;code.autocomplete='off';code.autocapitalize='characters';code.spellcheck=false;code.placeholder='8-character code';joinLabel.append(code);
  const actions=el('div');actions.className='coop-actions';
  const sign=button('Google sign-in',()=>{dialog.close();window.EmberCloud.open();});
  const host=button('Host preview',()=>connect(true)),join=button('Join preview',()=>connect(false));
  const close=button('Back',()=>dialog.close());actions.append(sign,host,join,close);
  dialog.append(heading,description,profileRow,adventureLabel,joinLabel,status,actions);document.body.append(dialog);
  const open=button('Co-op Preview',()=>{status.textContent=message;dialog.showModal();});open.id='coopOpen';document.body.append(open);
  const hud=el('div');hud.id='coopHud';hud.hidden=true;
  const label=el('strong'),detail=el('span');detail.setAttribute('role','status');
  const copy=button('Copy code',async()=>{try{await navigator.clipboard.writeText(roomCode);detail.textContent='Room code copied.';}catch{detail.textContent='Share this code: '+roomCode;}});
  const ready=button('Ready for battle',()=>{const own=latestOwn();if(room&&own&&!reconnecting)room.send('battle-ready',!own.ready);});
  const bagButton=button('Bag',()=>showBag());
  const party=el('div');party.id='coopParty';
  hud.append(label,bagButton,copy,button('Leave',()=>leave()),detail,ready,party);document.body.append(hud);
  const bag=el('dialog');bag.id='coopBag';bag.setAttribute('aria-labelledby','coopBagTitle');
  const bagTitle=el('h2','Co-op Bag');bagTitle.id='coopBagTitle';
  const bagContents=el('div');bag.append(bagTitle,el('p','Your ingredients are yours to gather. Story items are available to both riders.'),bagContents,button('Close bag',()=>bag.close()));
  bag.addEventListener('close',release);document.body.append(bag);
  const storyClient=window.LDRCoopStory.create({send:(type,data)=>room?.send(type,data),release,notify:showNotice,
    session:()=>room?.sessionId,members:()=>snapshots[snapshots.length-1]?.players||[],closeBag:()=>{if(bag.open)bag.close();},leave});
  const notice=el('div');notice.id='coopNotice';notice.hidden=true;notice.setAttribute('role','status');document.body.append(notice);
  const combatControls=el('div');combatControls.id='coopCombat';combatControls.hidden=true;
  const actionButtons=new Map();
  for(const [kind,caption,key]of [['sword','Sword','Space'],['claw','Dragon claw','Q'],['fire','Dragon fire','E'],['revive','Revive','R']]){
    const b=button(caption,()=>sendAction(kind));b.dataset.action=kind;b.title=caption+' ('+key+')';b.dataset.caption=caption;
    actionButtons.set(kind,b);combatControls.append(b);
  }
  const gather=button('Pick up',()=>collectNearest());gather.id='coopGather';gather.title='Pick up (F or Space)';combatControls.append(gather);
  document.body.append(combatControls);
  const sprint=button('Run',()=>{});sprint.id='coopRun';sprint.hidden=true;sprint.setAttribute('aria-label','Hold to run');
  sprint.addEventListener('pointerdown',e=>{e.preventDefault();sprint.setPointerCapture(e.pointerId);touch.set(e.pointerId,'shift');});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])sprint.addEventListener(event,e=>touch.delete(e.pointerId));
  document.body.append(sprint);
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
    if(story?.scene){
      if(e.target.closest?.('#coopHud button'))return;
      if(type==='keydown'&&!e.repeat&&[' ','enter'].includes(key))storyClient.advance();
      e.preventDefault();e.stopImmediatePropagation();return;
    }
    if(bag.open){
      if(type==='keydown'&&(key==='escape'||key==='i'))bag.close();
      if(!['tab','enter',' '].includes(key))e.preventDefault();e.stopImmediatePropagation();return;
    }
    if(e.key==='Tab'||e.target.closest?.('input,select')||(e.target.closest?.('button')&&['Enter',' '].includes(e.key)))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(type==='keydown'&&!e.repeat){
      if(key==='i')showBag();
      else if(key==='f'||(key===' '&&battle?.phase!=='active'))collectNearest();
      else{const kind=({' ':'sword',q:'claw',e:'fire',r:'revive'})[key];if(kind)sendAction(kind);}
    }
    if(type==='keydown')held.add(key);else held.delete(key);
  },true);
  function errorText(error){
    const raw=String(error?.message||'');
    if(/409|different Google/.test(raw))return 'Each player needs a different Google account.';
    if(/401|Google|token/i.test(raw))return 'Sign in with Google at the title screen, then try again.';
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
      const options={protocol:4,profile,mode:adventure.value};
      room=isHost?await client.create('story_coop_preview',options):await client.joinById(roomId,options);
      leaving=false;seq=0;actionSeq=0;seenEffect=0;snapshots=[];roomCode=room.roomId;wire(room);
      // Loading the map does not run a campaign or touch any save slot.
      quest=Q.DONE;greenPhase='gone';bridgeCleared=true;guardsAside=true;
      if(MAPID!=='world')await BOOT.map('world',true,100,100,'Preparing co-op overworld');
      active=true;lastFrame=performance.now();lastInput=0;
      document.body.classList.add('coop-preview-active');dialog.close();hud.hidden=pad.hidden=combatControls.hidden=sprint.hidden=false;
      label.textContent='ROOM '+roomCode;detail.textContent='Waiting for your partner';
      room.send('ready');
    }catch(error){if(room){leaving=true;await room.leave().catch(()=>{});room=null;}status.textContent=errorText(error);}
    finally{connecting=false;host.disabled=join.disabled=false;}
  }
  function wire(connection){
    connection.reconnection.enabled=false;
    connection.onMessage('welcome',data=>{bounds=data.bounds;pickupCatalog=data.pickupCatalog;storyClient.resetMap();});
    connection.onMessage('inventory',data=>{inventory=data;if(bag.open)renderBag();});
    connection.onMessage('nearby-pickups',data=>{pickups=data;});
    connection.onMessage('pickup-result',data=>{
      showNotice(data.ok?(data.kind==='story'?data.by+' found '+data.name+' · shared with both riders':'+'+data.amount+' '+data.name):data.reason);
      if(data.ok){if(data.kind==='story')window.EmberSfx?.key?.();else window.EmberSfx?.pickup?.();}
    });
    connection.onMessage('snapshot',data=>{
      snapshots.push({at:performance.now(),players:data.players,enemies:data.battle.enemies});if(snapshots.length>4)snapshots.shift();
      battle=data.battle;story=data.story||null;if(active)storyClient.update(story);updateHud(data.players);playEffects();
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
    active=false;reconnecting=false;room=null;snapshots=[];bounds=null;battle=null;story=null;storyClient.reset();pickups=[];held.clear();touch.clear();spriteCache.clear();dragonCache.clear();bag.close();notice.hidden=true;
    document.body.classList.remove('coop-preview-active');hud.hidden=pad.hidden=combatControls.hidden=sprint.hidden=true;
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
      const lerp=key=>{const old=Math.hypot(p[key].x-before[key].x,p[key].y-before[key].y)>128?p[key]:before[key];return {...p[key],x:old.x+(p[key].x-old.x)*a,y:old.y+(p[key].y-old.y)*a};};
      return {...p,rider:lerp('rider'),dragon:lerp('dragon')};
    });
  }
  function latestOwn(){return snapshots[snapshots.length-1]?.players.find(p=>p.id===room?.sessionId);}
  function showNotice(text){notice.textContent=text;notice.style.top=Math.round(hud.getBoundingClientRect().bottom+8)+'px';notice.hidden=false;noticeUntil=performance.now()+4500;}
  function gatheringAllowed(){return active&&!reconnecting&&storyClient.mapReady&&!story?.scene&&!story?.held&&!battle?.paused&&!['active','countdown'].includes(battle?.phase)&&latestOwn()?.rider.hp>0;}
  function nearestPickup(){const p=latestOwn()?.rider;if(!p)return null;return pickups.filter(n=>Math.hypot(n.x-p.x,n.y-p.y)<=36).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;}
  function collectNearest(){if(!gatheringAllowed()||bag.open)return;const action=storyClient.nearest(latestOwn()),node=nearestPickup();if(node)room.send('pickup',node.id);else if(action)room.send('interact',action.id);else showNotice('Move close to an ingredient, story item, person or doorway.');}
  function showBag(){if(!gatheringAllowed())return;release();renderBag();bag.showModal();}
  function renderBag(){
    bagContents.replaceChildren();
    storyClient.journal(bagContents);
    for(const [title,entries,empty]of [
      ['Your ingredients',Object.entries(inventory.ingredients).filter(([,amount])=>amount>0).map(([key,amount])=>({key,amount,kind:'ingredient',name:pickupCatalog.materials[key]?.name||key})),'Nothing gathered yet. Look beside woodland roads and the trail north of Millwood.'],
      ['Shared story items',inventory.story.map(key=>({key,kind:'story',name:pickupCatalog.storyItems[key]?.name||key})),'When either rider finds a story item, it will appear here for both of you.']
    ]){
      bagContents.append(el('h3',title));
      if(!entries.length){bagContents.append(el('p',empty));continue;}
      const list=el('ul');
      for(const item of entries){const row=el('li');row.dataset.item=item.key;
        const art=el('canvas');art.width=art.height=40;art.setAttribute('aria-hidden','true');
        const g=art.getContext('2d');g.imageSmoothingEnabled=false;
        if(item.kind==='ingredient'){
          const i=Object.keys(pickupCatalog.materials).indexOf(item.key),w=ingredientArt.naturalWidth/5,h=ingredientArt.naturalHeight/2;
          if(w&&h)g.drawImage(ingredientArt,i%5*w,Math.floor(i/5)*h,w,h,0,0,40,40);
        }else{const sprite=SPR[pickupCatalog.storyItems[item.key]?.icon];if(sprite)drawGameImage(g,sheetOf(sprite),sprite[0],sprite[1],sprite[2],sprite[3],0,0,40,40);}
        row.append(art,el('span',item.name),el('strong',item.kind==='story'?'Both riders':'×'+item.amount));list.append(row);
      }bagContents.append(list);
    }
  }
  function sendAction(kind){if(room&&active&&!reconnecting&&battle?.phase==='active'&&!battle.paused)room.send('action',{seq:++actionSeq,kind});}
  const partyCards=new Map();
  function updateHud(members){
    const own=members.find(p=>p.id===room?.sessionId),connected=members.filter(p=>p.connected).length;
    if(reconnecting)detail.textContent='Connection lost · reconnecting…';
    else if(battle.paused)detail.textContent='Battle paused · waiting for your partner to reconnect';
    else if(battle.phase==='countdown')detail.textContent='Woodland skirmish · '+Math.max(1,Math.ceil((battle.startsAt-battle.now)/1000));
    else if(battle.phase==='active')detail.textContent='Defeat the mushrooms · '+battle.enemies.filter(e=>e.hp>0).length+' remaining'+(own?.rider.hp<=0?' · Your partner can revive you':'');
    else if(battle.phase==='won')detail.textContent='Victory! Both riders and dragons healed. Ready again to replay, or keep exploring.';
    else if(battle.phase==='lost')detail.textContent='Battle ended. Both choose Ready to retry with full health.';
    else detail.textContent=story?(story.waiting?'Waiting for your partner · ':'')+story.objective:connected<2?'Explore while you wait for your partner.':'Explore, or both choose Ready to enter the shared battle.';
    const canReady=['idle','won','lost'].includes(battle.phase);
    const fighting=['active','countdown'].includes(battle.phase);
    if(fighting&&bag.open)bag.close();bagButton.disabled=fighting||reconnecting||!own||own.rider.hp<=0;
    ready.disabled=!canReady||reconnecting;ready.textContent=own?.ready?'Ready ✓ · waiting for partner':'Ready for battle';
    if(story){ready.hidden=!['skirmish','complete'].includes(story.step)||story.map!=='world';ready.disabled=ready.disabled||story.held||story.waiting||!own||Math.hypot(own.rider.x-battle.arena.x,own.rider.y-battle.arena.y)>battle.arena.r+140;}
    else ready.hidden=false;
    if(!canReady)ready.textContent=battle.paused?'Battle paused':'Battle in progress';
    for(const m of members){
      let card=partyCards.get(m.id);
      if(!card){card=el('div');card.className='coop-vitals';card.append(el('strong'),el('span'),el('span'));partyCards.set(m.id,card);party.append(card);}
      card.classList.toggle('coop-own',m.id===room?.sessionId);
      card.children[0].textContent=(m.id===room?.sessionId?'You · ':'')+m.name+(m.connected?'':' · reconnecting');
      card.children[1].textContent='Rider '+m.rider.hp+'/'+m.rider.maxHp+(m.rider.hp<=0?' · DOWN':'');
      card.children[2].textContent=story&&!story.hasDragon?'Dragon bond · not yet formed':'Dragon '+m.dragon.hp+'/'+m.dragon.maxHp+(m.dragon.hp<=0?' · DOWN':'');
    }
    for(const [id,card]of partyCards)if(!members.some(m=>m.id===id)){card.remove();partyCards.delete(id);}
    for(const [kind,b]of actionButtons){
      b.hidden=!fighting||story&&!story.hasDragon&&['claw','fire'].includes(kind);
      const remaining=Math.max(0,(own?.cooldowns[kind]||0)-battle.now);
      b.disabled=!own||own.rider.hp<=0||battle.phase!=='active'||battle.paused||reconnecting||remaining>0||(['claw','fire'].includes(kind)&&(own.dragon.hp<=0||own.dragon.attackUntil>battle.now));
      b.textContent=b.dataset.caption+(remaining>0?' · '+Math.ceil(remaining/1000)+'s':'');
    }
    gather.hidden=fighting;
  }
  function playEffects(){
    for(const event of battle.effects){
      if(event.id<=seenEffect)continue;
      if(event.kind==='sword')window.EmberSfx?.sword?.();
      if(event.kind==='fire')window.EmberSfx?.dragonFire?.();
      if(event.kind==='burst')window.EmberSfx?.breathHit?.();
      seenEffect=Math.max(seenEffect,event.id);
    }
  }
  function interpolatedEnemies(){
    const latest=snapshots[snapshots.length-1];if(!latest)return [];
    const previous=snapshots[snapshots.length-2]||latest,a=Math.max(0,Math.min(1,(performance.now()-latest.at)/50));
    return latest.enemies.map(e=>{const old=previous.enemies.find(p=>p.id===e.id)||e;return {...e,x:old.x+(e.x-old.x)*a,y:old.y+(e.y-old.y)*a};});
  }
  function healthBar(x,y,width,hp,max,color){
    ctx.fillStyle='#16171b';ctx.fillRect(Math.round(x-width/2)-1,Math.round(y)-1,width+2,5);
    ctx.fillStyle='#4c3234';ctx.fillRect(Math.round(x-width/2),Math.round(y),width,3);
    ctx.fillStyle=color;ctx.fillRect(Math.round(x-width/2),Math.round(y),Math.round(width*hp/max),3);
  }
  function drawArena(){
    const a=battle.arena;ctx.save();ctx.strokeStyle=battle.phase==='active'?'#ed9d51':'#e8d194';ctx.lineWidth=2;
    ctx.setLineDash([5,6]);ctx.beginPath();ctx.arc(a.x,a.y,a.r-8,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  function drawEnemy(e){
    const dir=e.dir==='n'?'u':e.dir==='s'?'d':e.dir;
    const action=e.hp<=0?'die':e.hurtUntil>battle.now?'hurt':e.state==='attack'?'atk':e.state==='walk'?'walk':'idle';
    const sprite=SPR['ms1_'+action+'_'+dir]||SPR.ms1_idle_d;if(!sprite)return;
    const frame=e.hp<=0?Math.min(sprite[4]-1,Math.floor(e.t/.6*sprite[4])):action==='atk'?Math.min(sprite[4]-1,Math.floor(e.t/.4*sprite[4])):Math.floor(e.t*8)%sprite[4];
    const x=Math.round(e.x-sprite[2]/2),y=Math.round(e.y-sprite[3]);
    ctx.save();
    if(e.state==='windup'){
      const angle=({n:-Math.PI/2,s:Math.PI/2,w:Math.PI,e:0})[e.dir];
      ctx.fillStyle='#ff992c66';ctx.beginPath();ctx.moveTo(e.x,e.y-3);ctx.arc(e.x,e.y-3,34,angle-1.3,angle+1.3);ctx.closePath();ctx.fill();
    }
    if(e.hurtUntil>battle.now||e.state==='windup'){
      const tint=e.hurtUntil>battle.now?'#ff4030':'#ffb347';
      drawGameImage(ctx,tintFoe(sprite,frame,tint,.6),x,y);
    }else drawGameImage(ctx,sheetOf(sprite),sprite[0]+frame*sprite[2],sprite[1],sprite[2],sprite[3],x,y,sprite[2],sprite[3]);
    if(e.hp>0)healthBar(e.x,y+5,25,e.hp,e.maxHp,'#a5ce6b');
    ctx.restore();
  }
  function drawCombatEffects(){
    if(!battle)return;ctx.save();
    for(const shot of battle.projectiles){
      const sprite=SPR['fx_attack_fire_'+(Math.floor(battle.now/1000*24)%DRAGON_PROJECTILE.fire)];
      if(sprite){ctx.save();ctx.translate(shot.x,shot.y-12);ctx.rotate(Math.atan2(shot.vy,shot.vx));
        drawGameImage(ctx,sheetOf(sprite),sprite[0],sprite[1],sprite[2],sprite[3],-20,-20,40,40);ctx.restore();continue;}
      const gradient=ctx.createRadialGradient(shot.x,shot.y-12,1,shot.x,shot.y-12,11);
      gradient.addColorStop(0,'#fffad8');gradient.addColorStop(.35,'#ffc35c');gradient.addColorStop(1,'#ff501000');
      ctx.fillStyle=gradient;ctx.fillRect(shot.x-12,shot.y-24,24,24);
      ctx.strokeStyle='#ef652a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(shot.x-shot.vx*14,shot.y-12-shot.vy*14);ctx.lineTo(shot.x,shot.y-12);ctx.stroke();
    }
    for(const e of battle.effects){
      const age=Math.max(0,(battle.now-e.at)/1000),fade=1-age/.8;ctx.globalAlpha=Math.max(0,fade);
      if(e.kind==='damage'){ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff1d5';ctx.fillText('−'+e.amount,e.x,e.y-30-age*18);}
      else if(e.kind==='claw'||e.kind==='sword'||e.kind==='enemy-swing'){
        if(age>.3)continue;
        const angle=({n:-Math.PI/2,s:Math.PI/2,w:Math.PI,e:0})[e.dir],reach=e.kind==='claw'?32:24;
        ctx.strokeStyle=e.kind==='enemy-swing'?'#ff9e49':e.kind==='claw'?'#ffdfa3':'#d9f3ff';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(e.x,e.y-10,reach,angle-1+age*3,angle+.7+age*3);ctx.stroke();
      }else if(e.kind==='burst'||e.kind==='revive'){
        ctx.strokeStyle=e.kind==='revive'?'#99f6b7':'#ffb756';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y-12,4+age*24,0,Math.PI*2);ctx.stroke();
      }
    }ctx.restore();
  }
  let renderPlayers=[];
  function frame(ms){
    if(!active)return false;
    const dt=Math.min(.05,(ms-lastFrame)/1000||0);lastFrame=ms;last=ms;tAcc+=dt;
    if(!reconnecting&&room&&ms-lastInput>=50){
      lastInput=ms;const keysNow=new Set([...held,...touch.values()]);
      const x=Number(keysNow.has('arrowright')||keysNow.has('d'))-Number(keysNow.has('arrowleft')||keysNow.has('a'));
      const y=Number(keysNow.has('arrowdown')||keysNow.has('s'))-Number(keysNow.has('arrowup')||keysNow.has('w'));
      const blocked=bag.open||story?.held||!storyClient.mapReady;
      room.send('input',{seq:++seq,x:blocked?0:x,y:blocked?0:y,run:!blocked&&keysNow.has('shift')});
    }
    renderPlayers=players();const own=renderPlayers.find(p=>p.id===room?.sessionId);
    const pickup=nearestPickup(),action=storyClient.nearest(own);gather.disabled=!gatheringAllowed()||(!pickup&&!action);
    gather.textContent=pickup?(pickup.kind==='ingredient'?'Gather ':'Pick up ')+(pickup.kind==='ingredient'?pickupCatalog.materials[pickup.item]?.name:pickupCatalog.storyItems[pickup.item]?.name):action?(story?.travel?.id===action.id&&story.travel.ready.includes(room?.sessionId)?'Ready ✓ · waiting for partner':action.label):story?'Move closer to interact':'Move close to pick up';
    pad.style.visibility=sprint.style.visibility=combatControls.style.visibility=story?.scene?'hidden':'';
    if(!notice.hidden&&ms>noticeUntil)notice.hidden=true;
    renderEnemies=interpolatedEnemies();
    if(story&&!storyClient.mapReady)return true;
    if(own){
      P.x=own.rider.x;P.y=own.rider.y;P.moving=false;
      const arena=battle?.arena,framing=arena&&battle.phase!=='idle'&&Math.hypot(P.x-arena.x,P.y-arena.y)<arena.r+40;
      if(framing){
        // Keep the whole shared fight below the HUD and above the touch controls.
        const top=hud.getBoundingClientRect().bottom+8,bottom=VW>=660?VH-12:Math.min(pad.getBoundingClientRect().top,combatControls.getBoundingClientRect().top)-10;
        const available=Math.max(110,bottom-top);
        cam.z=Math.min(playZoom(),(VW-24)/(arena.r*2+54),available/(arena.r*2+60));
        cam.x=arena.x-VW/cam.z/2;cam.y=arena.y-20-(top+available/2)/cam.z;
      }else if(!storyClient.frameCamera(own)){cam.z=playZoom();cam.x=P.x-VW/cam.z/2;cam.y=P.y-VH/cam.z/2;}
      if(!story||story.map==='world')clampCam();
    }
    drawWorld(tAcc,dt);return true;
  }
  const originalFrame=frameCore;frameCore=function(ms){if(!frame(ms))return originalFrame(ms);};
  const originalSave=saveToSlot;saveToSlot=function(...args){if(active)return false;return originalSave(...args);};
  function addActors(draw){
    if(!active)return;
    for(let i=draw.length-1;i>=0;i--)if(draw[i]===P||draw[i].dg||draw[i].foe||draw[i].frosthorn||draw[i].iceMoth||draw[i].queenBoss||draw[i].queenWeb||draw[i].bolt||draw[i].green||draw[i].craftNode||draw[i].item?.took)draw.splice(i,1);
    for(const member of renderPlayers){
      draw.push({coop:member,kind:'rider',x:member.rider.x,y:member.rider.y});
    }
    for(const enemy of renderEnemies)draw.push({coopEnemy:enemy,x:enemy.x,y:enemy.y,sy:enemy.hp>0?enemy.y:-1e8});
    for(const node of pickups)if(node.x>=cam.x-48&&node.x<=cam.x+VW/cam.z+48&&node.y>=cam.y-48&&node.y<=cam.y+VH/cam.z+48)draw.push({coopPickup:node,x:node.x,y:node.y});
    storyClient.addActors(draw);
    if(battle&&battle.phase!=='idle')draw.push({coopBoundary:true,x:battle.arena.x,y:battle.arena.y,sy:-1e9});
  }
  function riderCanvas(sprite,frame,member){
    const hair=window.LDRCoopAppearance.forViewer(member,latestOwn()).hair;
    const key=[sprite[0],sprite[1],frame,hair,member.eyes].join(':');if(spriteCache.has(key))return spriteCache.get(key);
    const canvas=document.createElement('canvas');canvas.width=sprite[2];canvas.height=sprite[3];const g=canvas.getContext('2d');
    const sx=sprite[0]+frame*sprite[2],sy=sprite[1];
    for(const page of atlasPages.values()){
      const left=Math.max(sx,page.x),top=Math.max(sy,page.y),right=Math.min(sx+sprite[2],page.x+page.w),bottom=Math.min(sy+sprite[3],page.y+page.h);
      if(right>left&&bottom>top)g.drawImage(page.img,left-page.x,top-page.y,right-left,bottom-top,left-sx,top-sy,right-left,bottom-top);
    }
    const pixels=g.getImageData(0,0,canvas.width,canvas.height);
    window.EmberPlayerIdentity.recolorPixels(pixels.data,hair,false);
    window.EmberPlayerIdentity.recolorEyes(pixels.data,member.eyes,false,canvas.width);g.putImageData(pixels,0,0);
    if(spriteCache.size>160)spriteCache.delete(spriteCache.keys().next().value);spriteCache.set(key,canvas);return canvas;
  }
  function dragonCanvas(sprite,frame){
    const key=[sprite[0],sprite[1],frame].join(':');if(dragonCache.has(key))return dragonCache.get(key);
    const source=sheetOf(sprite);if(!source||source.complete===false||source.naturalWidth===0)return null;
    const canvas=document.createElement('canvas');canvas.width=sprite[2];canvas.height=sprite[3];
    const g=canvas.getContext('2d');drawGameImage(g,source,sprite[0]+frame*sprite[2],sprite[1],sprite[2],sprite[3],0,0,sprite[2],sprite[3]);
    const pixels=g.getImageData(0,0,canvas.width,canvas.height);window.LDRCoopAppearance.purpleDragon(pixels.data);g.putImageData(pixels,0,0);
    if(dragonCache.size>=96)dragonCache.delete(dragonCache.keys().next().value);dragonCache.set(key,canvas);return canvas;
  }
  function drawPickup(node){
    ctx.save();ctx.imageSmoothingEnabled=false;let top=node.y-18;
    if(node.kind==='ingredient'){
      const i=Object.keys(pickupCatalog.materials).indexOf(node.item),w=ingredientArt.naturalWidth/5,h=ingredientArt.naturalHeight/2;
      ctx.fillStyle='#14201a55';ctx.beginPath();ctx.ellipse(node.x,node.y,7,2,0,0,Math.PI*2);ctx.fill();
      if(w&&h)ctx.drawImage(ingredientArt,i%5*w,Math.floor(i/5)*h,w,h,node.x-9,node.y-17,18,18);
      else{ctx.fillStyle=pickupCatalog.materials[node.item]?.color||'#87ac67';ctx.fillRect(node.x-3,node.y-8,6,6);}
    }else{
      const sprite=SPR[node.sprite];if(sprite){
        let y=node.y;const prop=SPR[node.onTop];if(prop)y-=prop[3]-((ATLAS.flattop&&ATLAS.flattop[node.onTop])||2);
        const w=node.width||sprite[2],h=w*sprite[3]/sprite[2];top=y-h;
        for(const offset of story&&node.item==='egg'?[-8,8]:[0])drawGameImage(ctx,sheetOf(sprite),sprite[0],sprite[1],sprite[2],sprite[3],Math.round(node.x+offset-w/2),Math.round(y-h),w,h);
      }
    }
    const nearest=gatheringAllowed()&&nearestPickup()?.id===node.id;
    ctx.fillStyle='#fff2ad';ctx.globalAlpha=.6+.3*Math.sin(tAcc*3+node.x);ctx.fillRect(node.x+5,top-3,2,2);ctx.globalAlpha=1;
    if(nearest){ctx.font='bold 6px sans-serif';ctx.textAlign='center';ctx.fillText(node.kind==='ingredient'?'Gather':'Pick up · shared',node.x,top-7);}
    ctx.restore();
  }
  function drawActor(actor){
    if(!active)return false;
    if(storyClient.drawActor(actor))return true;
    if(actor.coopBoundary){drawArena();return true;}
    if(actor.coopEnemy){drawEnemy(actor.coopEnemy);return true;}
    if(actor.coopPickup){drawPickup(actor.coopPickup);return true;}
    const member=actor.coop;if(!member)return false;
    const pose=member[actor.kind];ctx.save();ctx.globalAlpha=member.connected?1:.45;
    if(actor.kind==='rider'){
      const dir=pose.dir==='n'?'u':pose.dir==='s'?'d':pose.dir;
      const attacking=pose.attackUntil>battle.now,down=pose.hp<=0;
      const action=down?'die':attacking?'atk':pose.moving?(pose.running?'run':'walk'):'idle';
      const sprite=SPR[(story&&!story.hasSword?'corin_bare_':'corin_sword_')+action+'_'+dir];
      if(sprite){const frame=down?sprite[4]-1:attacking?Math.min(sprite[4]-1,Math.floor((battle.now-pose.attackAt)/420*sprite[4])):Math.floor(pose.t*(pose.moving?9:6))%sprite[4];
        ctx.imageSmoothingEnabled=false;if(pose.hurtUntil>battle.now)ctx.globalAlpha*=.55;
        ctx.drawImage(riderCanvas(sprite,frame,member),Math.round(pose.x-sprite[2]/2),Math.round(pose.y-sprite[3]+corinFeetOffset()));}
    }else{
      const attacking=pose.attackUntil>battle.now,down=pose.hp<=0;
      const sprite=SPR[(down?'dr5_idle_':attacking&&pose.attack==='fire'?'drf_fire_':'drf_')+pose.dir]||SPR['dr5_idle_'+pose.dir];
      if(sprite){const frame=attacking?Math.min(sprite[4]-1,Math.floor((battle.now-pose.attackAt)/700*sprite[4])):Math.floor(pose.t*4)%sprite[4],scale=DRAGON_DRAW_SCALE,w=Math.round(sprite[2]*scale),h=Math.round(sprite[3]*scale),bob=down?0:Math.sin(pose.t*2)*2;
        ctx.globalAlpha*=.25;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(pose.x,pose.y+3,11,3,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=member.connected?1:.45;
        ctx.translate(Math.round(pose.x-w/2),Math.round(pose.y-h-(down?0:12)+bob));ctx.imageSmoothingEnabled=false;
        if(down)ctx.globalAlpha*=.4;else if(pose.hurtUntil>battle.now)ctx.globalAlpha*=.5;
        const purple=window.LDRCoopAppearance.forViewer(member,latestOwn()).dragon==='purple',canvas=purple?dragonCanvas(sprite,frame):null;
        if(canvas)drawGameImage(ctx,canvas,0,0,sprite[2],sprite[3],0,0,w,h);
        else drawGameImage(ctx,sheetOf(sprite),sprite[0]+frame*sprite[2],sprite[1],sprite[2],sprite[3],0,0,w,h);
      }
    }
    ctx.restore();return true;
  }
  window.LDRCoop={get active(){return active;},addActors,drawActor,drawAirborne(){
    if(!active)return;
    if(!story||story.hasDragon)for(const member of renderPlayers)drawActor({coop:member,kind:'dragon'});
    drawCombatEffects();
    storyClient.drawWaypoint(renderPlayers.find(m=>m.id===room?.sessionId));
    ctx.save();ctx.font='6px sans-serif';ctx.textAlign='center';
    for(const member of renderPlayers){const pose=member.rider,width=Math.ceil(ctx.measureText(member.name).width)+6;
      ctx.fillStyle='#191614';ctx.fillRect(pose.x-width/2,pose.y+3,width,9);
      ctx.fillStyle=member.id===room?.sessionId?'#ffe29a':'#a1e8ef';ctx.fillText(member.name,pose.x,pose.y+10);
      if(member.rider.hp<=0){ctx.fillStyle='#ffc6a1';ctx.fillText('DOWN · revive nearby',pose.x,pose.y+20);}
      const d=member.dragon;if(!story||story.hasDragon)healthBar(d.x,d.y+5,22,d.hp,d.maxHp,member.id===room?.sessionId?'#e6b461':'#b892ec');
    }ctx.restore();
  }};
  const originalOpen=BOOT.close;BOOT.close=async function(...args){if(active||connecting)return;return originalOpen.apply(this,args);};
  const refresh=setInterval(()=>{open.hidden=gameplayStarted||active;open.disabled=!gameplayReady||connecting;},300);
  window.addEventListener('pagehide',()=>{release();clearInterval(refresh);});
})();
