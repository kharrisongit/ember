/* Two actors, one campaign. Story flags, encounters and rewards remain the
 * existing game's state; actor-local movement, health and dragon attacks switch
 * synchronously around the original engine functions. No second quest engine. */
(() => {
  'use strict';
  let active=false,current=null,viewer=null,local=null,members=[],party=new Map(),notify=()=>{},save=()=>{},rendering=false,remoteRender=false,lastMap=null,lastArena=null,sharedOwner=null,voteKey='',votes=new Set(),requester=null;
  const originalFrame=frameCore,originalDraw=drawWorld,originalSave=saveToSlot,originalRead=readSaveSlot,originalLoad=loadGame;
  const originalDeath=showDeath,originalGetUp=getUp,originalPresent=presentCamera,originalImage=drawGameImage;
  const originalIdentityText=EmberPlayerIdentity.text;
  EmberPlayerIdentity.text=function(value){if(!active)return originalIdentityText(value);const name=party.get(current)?.profile?.name||'Corin';return String(value??'').replace(/(?<![\p{L}\p{N}_])Corin(?![\p{L}\p{N}_])/gu,name);};
  const spriteCache=new Map(),sourceIds=new WeakMap();let sourceSerial=0,personalPaint=null,loadingSave=null;
  const cleanObject=(target,source)=>{for(const key of Object.keys(target))if(key!=='dir'&&!(key in source))delete target[key];Object.assign(target,source);};
  function captureActor(){return {P:{...P},dragon:{...dragon},vars:{pHp,pMax,pInv,mounted,running,breath,breathT,claw,clawT,hunt,linger,dragonCombatPause,dragonRecall,dragonRecallT,dragonBossClaws,dragonBreak,dragonFacingLocked,dragonEl,breathPick,wardCarry,edgeCarry,brandCount,brandHot,twinSpent,twinKills,glassShieldHeld,glassShieldWindowUntil,glassShieldPulse,lHeld,rHeld,bothHeldSince},worn:{...worn},cooldown:{...breathCooldown}};}
  function applyActor(a){
    dragonFacingLocked=false;cleanObject(P,a.P);cleanObject(dragon,a.dragon);
    ({pHp,pMax,pInv,mounted,running,breath,breathT,claw,clawT,hunt,linger,dragonCombatPause,dragonRecall,dragonRecallT,dragonBossClaws,dragonBreak,dragonFacingLocked,dragonEl,breathPick,wardCarry,edgeCarry,brandCount,brandHot,twinSpent,twinKills,glassShieldHeld,glassShieldWindowUntil,glassShieldPulse,lHeld,rHeld,bothHeldSince}=a.vars);
    cleanObject(worn,a.worn);cleanObject(breathCooldown,a.cooldown);
  }
  function stash(){if(current&&party.has(current))Object.assign(party.get(current),captureActor());}
  function select(id){if(!id||id===current||!party.has(id))return;stash();current=id;applyActor(party.get(id));Crafting.coopSelect(id);}
  function withActor(id,fn){const previous=current;select(id);try{return fn();}finally{select(previous);}}
  function actor(id){if(id===current)stash();return party.get(id);}
  function held(){return !!(scene||sayNpc||revealing||ask||ovl||bagOpen||Crafting.active()||atlasOpen||fishing||doorMotion||fadeDir||bossScene||hatchCamera||ride||flightTravel||window.EmberConversationFlow?.active()||window.EmberArenaEntry?.holding()||window.EmberRiding?.holding());}
  const sharedDialogue=()=>!!(scene||sayNpc||revealing);
  function inputFor(id){const a=party.get(id),input=a?.input;if(!input||performance.now()-input.at>400)return {x:0,y:0,run:false};return input;}
  function setInput(id,input){const a=party.get(id);if(a)a.input={x:Math.max(-1,Math.min(1,input.x||0)),y:Math.max(-1,Math.min(1,input.y||0)),run:!!input.run,at:performance.now()};}
  function applyInput(){
    const input=inputFor(current),a=party.get(current);
    if(a?.input&&performance.now()-a.input.at>400)releaseControls(current);
    for(const key in keys)keys[key]=0;padDx=input.x;padDy=input.y;
    running=!!input.run&&!!a?.runHeld;
    glassShieldHeld=running&&!!a?.blockHeld;
  }
  const controlKinds={act:'action',btnB:'back',btnL:'dragon',btnR:'orders',btnItems:'bag',btnMapQuick:'map'};
  function releaseControls(id){
    const a=party.get(id);if(!a)return;
    withActor(id,()=>{
      for(const control of a.controls||[])nativeControllerButton(control,false);
      a.controls?.clear();
      for(const key of a.keyControls||[])window.LDRCoopEvents?.replayKey({key,down:false});
      a.keyControls?.clear();a.runHeld=false;a.blockHeld=false;running=false;glassShieldHeld=false;lHeld=rHeld=false;bothHeldSince=-1;
    });
  }
  function control(id,data){
    const a=party.get(id),kind=controlKinds[data.control];if(!a||!kind||typeof data.down!=='boolean')return false;
    a.controls??=new Set();
    // A release belongs to the rider who pressed, even after someone else opens a menu.
    if(!data.down){if(a.controls.delete(data.control))withActor(id,()=>nativeControllerButton(data.control,false));if(data.control==='btnB'){a.runHeld=false;a.blockHeld=false;}return true;}
    if(a.controls.has(data.control)||!claim(id,kind))return false;
    if((ovl||bagOpen||atlasOpen||ask)&&!['act','btnB'].includes(data.control))return false;
    const wasHeld=held();requester=id;
    try{
      if(!nativeControllerButton(data.control,true))return false;
      a.controls.add(data.control);if(data.control==='btnB'){a.runHeld=running&&!wasHeld;a.blockHeld=glassShieldHeld&&!wasHeld;}
    }finally{requester=null;stash();}
    sharedOwner=held()?current:null;return true;
  }
  function keyboard(id,data){
    const a=party.get(id);if(!a||typeof data.key!=='string')return false;
    const k=data.key.toLowerCase(),kind=k==='b'||k==='escape'?'back':['a',' ','enter'].includes(k)?'action':({arrowup:'up',arrowdown:'down',arrowleft:'left',arrowright:'right'})[k]||'key';
    a.keyControls??=new Set();
    if(!data.down){if(a.keyControls.delete(data.key))withActor(id,()=>window.LDRCoopEvents?.replayKey(data));if(k==='b'){a.runHeld=false;a.blockHeld=false;}return true;}
    if(!claim(id,kind))return false;
    const wasHeld=held();requester=id;
    try{
      if((scene||sayNpc||revealing)&&['a',' ','enter'].includes(k)){if(!data.repeat)actionButton();}
      else window.LDRCoopEvents?.replayKey(data);
      a.keyControls.add(data.key);if(k==='b'){a.runHeld=running&&!wasHeld;a.blockHeld=(glassShieldHeld||a.blockHeld)&&!wasHeld;}
    }
    finally{requester=null;stash();}
    sharedOwner=held()?current:null;return true;
  }
  function voteAction(){
    if(!active||!(scene||sayNpc||revealing)||members.length!==2)return false;
    const signature=[scene?.i,sayLine,typeFull,typeDone(),revealing,document.getElementById('revealCap')?.textContent].join('|');
    if(signature!==voteKey){voteKey=signature;votes.clear();}
    votes.add(requester||current);
    if(members.some(m=>!votes.has(m.uid))){notify('Ready · waiting for your partner to continue.');return true;}
    votes.clear();voteKey='';return false;
  }
  function controllerState(id){return withActor(id,()=>({hp:pHp,max:pMax,kit:corinKit(),dragon:hasDragon()?{hp:dragon.hp,max:dragon.maxHp}:null,dragonUnlocked:window.EmberRiding?.unlocked()??true,bag:hasBag(),map:worldMapUnlocked(),playing:gameplayStarted&&mode==='play'}));}
  function restActor(){
    P.moving=false;
    P.act=pHp>0?null:{kind:'die',t:ACT.die.frames-.01,done:1,dir:P.dir,flip:P.flip,dir8:playerFacing4()};
  }
  function placeNear(id,x=P.x,y=P.y){withActor(id,()=>{
    for(const radius of [24,40,56,8,0])for(let angle=0;angle<8;angle++){
      const nx=x+Math.cos(angle*Math.PI/4)*radius,ny=y+Math.sin(angle*Math.PI/4)*radius;
      const inside=!arenaLock||!arenaT||(arenaLock.templeRoom?expandedTempleArenaContains(arenaLock,nx,ny,10):Math.hypot(nx-(arenaLock.x*TS+8),ny-(arenaLock.y*TS+8))<(arenaLock.r-1)*TS);
      if(canStand(nx,ny)&&inside){
        P.x=nx;P.y=ny;restActor();dragon.x=nx+24;dragon.y=ny-28;dragon.placed=MAPID;hunt=null;breath=null;claw=null;return;
      }
    }
    P.x=x;P.y=y;restActor();dragon.x=x+20;dragon.y=y-20;dragon.placed=MAPID;
  });}
  function syncParty(players){
    members=players;
    if(!active)return;
    for(const member of players){
      if(!party.has(member.uid)){
        stash();const a=captureActor();a.P={...P,act:null};a.dragon={...dragon,tr:null};a.vars={...a.vars,breath:null,claw:null,hunt:null,breathT:0,clawT:0,pInv:1,pHp:pMax,mounted:false};a.cooldown={fire:0,bolt:0,shadow:0,ice:0};
        party.set(member.uid,{...a,profile:member.profile});Crafting.coopSelect(member.uid);Crafting.coopSelect(current);placeNear(member.uid);
      }
      party.get(member.uid).profile=member.profile;
    }
  }
  function living(){stash();return members.filter(m=>party.get(m.uid)?.vars.pHp>0).map(m=>party.get(m.uid));}
  function beginEnemy(f){
    if(!active||rendering)return undefined;const previous=current;stash();
    const webOwner=f.kind==='spiderqueen'?SpiderQueenBoss.coopOwner():null;
    let chosen=members.find(m=>webOwner?m.uid===webOwner:m.uid===f.coopTarget&&party.get(m.uid)?.vars.pHp>0);
    if(!chosen||!webOwner&&!['wind','swing'].includes(f.st))chosen=members.filter(m=>party.get(m.uid)?.vars.pHp>0).sort((a,b)=>{
      const pa=party.get(a.uid),pb=party.get(b.uid);
      const distance=p=>Math.min(Math.hypot(p.P.x-f.x,p.P.y-f.y),hasDragon()&&!p.dragon.down?Math.hypot(p.dragon.x-f.x,p.dragon.y-f.y):Infinity);
      return distance(pa)-distance(pb);
    })[0];
    if(chosen){f.coopTarget=chosen.uid;select(chosen.uid);}return previous;
  }
  function beginProjectile(b){if(!active||rendering)return undefined;const previous=current;if(b.coopTarget)select(b.coopTarget);else beginEnemy(b);return previous;}
  function endEnemy(previous){if(previous)select(previous);}
  const originalScene=playScene,originalDoor=beginDoorEntry;
  playScene=function(...args){if(active&&!rendering){stash();for(const m of members){const other=party.get(m.uid);if(m.uid!==current&&other&&Math.hypot(other.P.x-P.x,other.P.y-P.y)>130)placeNear(m.uid);}}return originalScene(...args);};
  beginDoorEntry=function(d){if(active){stash();if(members.some(m=>{const other=party.get(m.uid);return other&&Math.hypot(other.P.x-P.x,other.P.y-P.y)>160;})){notify('Bring your partner closer to travel through this doorway.');return;}}return originalDoor(d);};
  const pushBolt=bolts.push;bolts.push=function(...items){if(active)for(const item of items)item.coopTarget=current;return pushBolt.apply(this,items);};
  for(const [system,kind]of [[SpiderQueenBoss,'spiderqueen'],[Frosthorn,'frosthorn'],[IceMoth,'icemoth']]){
    const effects=system.effects;system.effects=function(dt){const foe=active&&foes.find(f=>f.kind===kind&&f.st!=='dead'),previous=foe?beginEnemy(foe):undefined;try{return effects(dt);}finally{endEnemy(previous);}};
  }
  const spiderDraw=SpiderQueenBoss.draw;SpiderQueenBoss.draw=function(o){const owner=SpiderQueenBoss.coopOwner();return active&&owner?withActor(owner,()=>spiderDraw(o)):spiderDraw(o);};
  showDeath=function(){if(!active)return originalDeath();stash();if(living().length)return;originalDeath();};
  ACT.die.then=showDeath;
  getUp=function(){originalGetUp();if(active){for(const m of members)withActor(m.uid,()=>{pHp=pMax;pInv=2;P.act=null;dragon.hp=dragon.maxHp;dragon.down=false;});for(const m of members)if(m.uid!==current)placeNear(m.uid);save();}};
  function revive(){
    stash();const other=members.find(m=>m.uid!==current&&party.get(m.uid)?.vars.pHp<=0&&Math.hypot(party.get(m.uid).P.x-P.x,party.get(m.uid).P.y-P.y)<60);
    if(!other){notify('Move beside your fallen partner to revive them.');return;}
    withActor(other.uid,()=>{pHp=Math.ceil(pMax/2);pInv=3;P.act=null;showHeal('player',P.x,P.y-16);});notify(other.profile.name+' is back on their feet.');save();
  }
  function claim(id,kind){
    // Falling blocks gameplay actions, but both riders still read and advance
    // shared dialogue. Otherwise a scene can trap them outside revival range.
    if(!party.has(id))return false;
    // Account management pauses gameplay for both riders; saving still works.
    if(window.EmberCloud?.isOpen()&&kind!=='save')return false;
    if(actor(id).vars.pHp<=0&&!deadShown&&kind!=='save'&&!(kind==='action'&&sharedDialogue()))return false;
    if(held()&&id!==current){
      if(['action','back','up','down','left','right','ui'].includes(kind)&&!Crafting.active()&&!bagOpen&&!ovl)return true;
      notify((party.get(current)?.profile.name||'Your partner')+' is using the menu.');return false;
    }
    select(id);return true;
  }
  function command(id,kind,data={}){
    if(!active||!party.has(id))return false;
    if(kind==='release'){releaseControls(id);return true;}
    if(kind==='control')return control(id,data);
    if(kind==='key')return keyboard(id,data);
    if(!claim(id,kind))return false;
    requester=id;
    try{
      if(kind==='action')actionButton();
      else if(kind==='back'){nativeControllerButton('btnB',true);nativeControllerButton('btnB',false);}
      else if(['bag','dragon','orders','map'].includes(kind)){
        const button=Object.keys(controlKinds).find(key=>controlKinds[key]===kind);
        nativeControllerButton(button,true);nativeControllerButton(button,false);
      }
      else if(kind==='fire'){if(!held())breatheFire();}
      else if(kind==='claw'){if(!held())clawNow();}
      else if(kind==='revive')revive();
      else if(kind==='save')save(true);
      else if(['up','down','left','right'].includes(kind))controllerDirection(kind==='left'?-1:kind==='right'?1:0,kind==='up'?-1:kind==='down'?1:0);
    }finally{requester=null;}
    sharedOwner=held()?current:null;stash();return true;
  }
  function mainFrame(ms,paused){
    if(!active)return originalFrame(ms);
    viewer=local;const dt=Math.min(.05,(ms-last)/1000||0);
    if(paused){for(const m of members)releaseControls(m.uid);last=ms;originalDraw(tAcc,0);return;}
    if(window.EmberCloud?.isOpen()){for(const m of members)releaseControls(m.uid);last=ms;return;}
    if(!held()){
      const moving=members.find(m=>{const input=inputFor(m.uid);return input.x||input.y;});
      if(moving)select(moving.uid);
    }
    const focus=current;applyInput();originalFrame(ms);stash();
    if(MAPID!==lastMap){lastMap=MAPID;for(const m of members)if(m.uid!==current)placeNear(m.uid);lastArena=null;}
    if(arenaLock&&arenaLock!==lastArena){lastArena=arenaLock;for(const m of members)if(m.uid!==current)placeNear(m.uid);}
    if(!arenaLock)lastArena=null;
    // Both riders retain independent combat actions; the shared encounter ticks once.
    for(const m of members)if(m.uid!==focus){
      const wasHeld=held();withActor(m.uid,()=>{
        applyInput();syncDragonVitality();
        if(!wasHeld&&mode==='play'&&!deadShown){stepAct(dt);stepPlayer(dt);swingHits();if(pInv>0)pInv=Math.max(0,pInv-dt);}
        if(!wasHeld){stepBreath(dt);stepDragon(dt);stepClaw(dt);}
      });
      if(!wasHeld&&!held()){
        const beforeMap=MAPID,beforeArena=arenaLock;withActor(m.uid,()=>{useDoors(0);if(!doorMotion&&!fadeDir){checkArea();stepArena(0);stepKnightEncounter(0);stepQuest(0);}});
        if(held()||MAPID!==beforeMap||arenaLock!==beforeArena){select(m.uid);break;}
      }
    }
    if(flightTravel||ride){for(const m of members)if(m.uid!==current)withActor(m.uid,()=>{const leader=party.get(focus);P.x=leader.P.x+(ride?14:28);P.y=leader.P.y+(ride?6:0);dragon.x=P.x;dragon.y=P.y;mounted=!!flightTravel;});}
    sharedOwner=held()?current:null;stash();
  }
  // Both screens use the existing camera for authored scenes. Ordinary walking
  // follows the viewing rider, so neither player has a small preview walk limit.
  presentCamera=function(dt){
    if(!active)return originalPresent(dt);
    if(!remoteRender)originalPresent(dt);
    if(!scene&&!greenCamera&&!hatchCamera&&!bossScene&&!flightTravel&&!ride&&!window.EmberArenaEntry?.holding()){
      let a=actor(viewer);if(a?.vars.pHp<=0)a=members.map(m=>actor(m.uid)).find(p=>p?.vars.pHp>0)||a;if(a){cam.z=playZoom();cam.x=a.P.x-VW/cam.z/2;cam.y=a.P.y-VH/cam.z/2;clampCam();}
    }
  };
  function tintImage(g,img,sx,sy,sw,sh,dx,dy,dw,dh){
    if(!personalPaint||dx===undefined||g!==ctx)return originalImage(g,img,sx,sy,sw,sh,dx,dy,dw,dh);
    const a=personalPaint,profile=party.get(a.id)?.profile||{},own=party.get(viewer)?.profile||{};
    const look=LDRCoopAppearance.forViewer({id:a.id,...profile},{id:viewer,...own});
    let sourceId=sourceIds.get(img);if(!sourceId){sourceId=++sourceSerial;sourceIds.set(img,sourceId);}
    const key=[a.kind,sourceId,sx,sy,sw,sh,look.hair,profile.eyes,look.dragon,mounted].join(':');
    let canvas=spriteCache.get(key);
    if(!canvas){
      canvas=document.createElement('canvas');canvas.width=sw;canvas.height=sh;const cg=canvas.getContext('2d');
      const old=EmberPlayerIdentity.spritePage;EmberPlayerIdentity.spritePage=page=>page.img;
      try{originalImage(cg,img,sx,sy,sw,sh,0,0,sw,sh);}finally{EmberPlayerIdentity.spritePage=old;}
      const pixels=cg.getImageData(0,0,sw,sh);
      if(a.kind==='rider'){EmberPlayerIdentity.recolorPixels(pixels.data,look.hair,mounted);EmberPlayerIdentity.recolorEyes(pixels.data,profile.eyes,mounted,sw);}
      if(look.dragon==='purple'&&(a.kind==='dragon'||mounted))LDRCoopAppearance.purpleDragon(pixels.data);
      cg.putImageData(pixels,0,0);spriteCache.set(key,canvas);if(spriteCache.size>600)spriteCache.delete(spriteCache.keys().next().value);
    }
    return originalImage(g,canvas,0,0,sw,sh,dx,dy,dw,dh);
  }
  drawGameImage=tintImage;
  function paintActor(id,kind){const primary=current;withActor(id,()=>{const previous=personalPaint,oldRide=ride;personalPaint={id,kind};if(kind==='rider'&&ride&&id!==primary)ride=null;ctx.save();try{if(kind==='rider')drawCorinActor();else drawDragon();}finally{ctx.restore();personalPaint=previous;ride=oldRide;}});}
  function addActors(draw){
    if(!active)return;stash();
    for(let i=draw.length-1;i>=0;i--)if(draw[i]===P||draw[i].dg)draw.splice(i,1);
    for(const m of members){const a=party.get(m.uid);if(!a)continue;
      draw.push({campaignActor:m.uid,kind:'rider',x:a.P.x,y:a.P.y});
      withActor(m.uid,()=>{if(dragonHere()&&dragon.on&&!dragonAirborne()&&!mounted)draw.push({campaignActor:m.uid,kind:'dragon',x:dragon.x,y:dragon.y});});
    }
    // A second hatchling is part of the same authored hatch scene.
    const hatch=draw.find(o=>o.hatchActor);if(hatch){draw.splice(draw.indexOf(hatch),1);for(const [i,m]of [...members].sort((a,b)=>Number(b.uid===current)-Number(a.uid===current)).entries())draw.push({campaignHatch:true,owner:m.uid,offset:i*30,x:hatch.x+i*30,y:hatch.y});}
    if(viewer!==current){for(let i=draw.length-1;i>=0;i--)if(draw[i].craftNode)draw.splice(i,1);withActor(viewer,()=>Crafting.addDraw(draw));}
  }
  function drawActor(o){
    if(!active)return false;
    if(o.campaignActor){paintActor(o.campaignActor,o.kind);return true;}
    if(o.campaignHatch){
      const h=hatchScene;if(!h)return true;const id=o.owner;
      if(h.stage<7){const sp=SPR.inventory_egg;if(sp)originalImage(ctx,sheetOf(sp),sp[0],sp[1],sp[2],sp[3],o.x-9,o.y-18,18,18);}
      else if(id){withActor(id,()=>{const old={...dragon};Object.assign(dragon,{x:h.dragonX+o.offset,y:h.dragonY,t:h.t,air:false,on:true,down:false,_dir:h.dir||'s'});const p=personalPaint;personalPaint={id,kind:'dragon'};const s=dragonSprite(dragon.dir)||SPR.dr5_idle_s;if(s){const f=Math.floor(h.t*5)%s[4],w=s[2]*DRAGON_DRAW_SCALE,hh=s[3]*DRAGON_DRAW_SCALE;tintImage(ctx,sheetOf(s),s[0]+f*s[2],s[1],s[2],s[3],dragon.x-w/2,dragon.y-hh,w,hh);}personalPaint=p;Object.assign(dragon,old);});}return true;
    }
    return false;
  }
  function drawAirborne(){
    if(!active)return;const primary=current;
    for(const m of members)withActor(m.uid,()=>{if(dragonAirborne()&&!mounted)paintActor(m.uid,'dragon');if(m.uid!==primary){drawBreath();drawClaw();drawDragonProjectile();}});
    ctx.save();ctx.font='7px sans-serif';ctx.textAlign='center';
    for(const m of members){const a=actor(m.uid);if(!a)continue;ctx.fillStyle=m.uid===viewer?'#fff2b1':'#d6bdff';ctx.fillText(a.vars.pHp<=0?m.profile.name+' · DOWN · R to revive':m.profile.name,a.P.x,a.P.y+12);}
    ctx.restore();
  }
  function renderGuest(g,width,height,uid){
    const backup={ctx,VW,VH,DPR,cam:{...cam},cameraLogical,cameraPresentation,viewer};
    rendering=remoteRender=true;ctx=g;VW=width;VH=height;DPR=1;viewer=uid;
    // Retain the authored scene center when the two screens have different sizes.
    cam.x=backup.cam.x+(backup.VW-width)/(2*cam.z);cam.y=backup.cam.y+(backup.VH-height)/(2*cam.z);
    try{ctx.setTransform(1,0,0,1,0,0);originalDraw(tAcc,0);withActor(uid,()=>drawHearts());drawDark(0);drawFade();drawBossBlack();}
    finally{ctx=backup.ctx;VW=backup.VW;VH=backup.VH;DPR=backup.DPR;Object.assign(cam,backup.cam);cameraLogical=backup.cameraLogical;cameraPresentation=backup.cameraPresentation;viewer=backup.viewer;rendering=remoteRender=false;}
  }
  saveToSlot=function(...args){
    // A queued or failed checkpoint must not authorize Save & exit to reload.
    if(active)return save(!args[1])===true;
    if(originalRead(args[0])?.coop){const free=[1,2,3].find(n=>!originalRead(n));if(!free){toast('This slot contains a co-op adventure. Choose another slot for your solo game.');return false;}activeSaveSlot=free;args[0]=free;}
    return originalSave(...args);
  };
  loadGame=function(slot){if(!active&&originalRead(slot)?.coop){if(!gameplayStarted)window.LDRCoopCampaign?.open(originalRead(slot).coop.id);else toast('Resume co-op from Story Co-op at the title screen.');return false;}return originalLoad(slot);};
  readSaveSlot=function(...args){return loadingSave||originalRead(...args);};
  function checkpoint(){
    if(!active||scene||sayNpc||revealing||doorMotion||fadeDir||bossScene||hatchCamera||flightTravel||ride||Crafting.current()?.phase==='crafting'||deadShown||arenaLock||inFight())return null;
    stash();const players={};for(const [id,a] of party)players[id]=withActor(id,()=>({profile:a.profile,P:{x:P.x,y:P.y,dir:P.dir,dir8:P.dir8,flip:P.flip},dragon:{...dragon},hp:pHp,worn:{...worn},crafting:Crafting.capture(),mounted}));
    return {save:captureSave(),players};
  }
  async function start({uid,players,checkpoint:previous,onNotice,onSave}){
    active=true;local=viewer=uid;notify=onNotice;save=onSave;members=players;party=new Map();current=uid;
    if(previous?.save){loadingSave=previous.save;try{if(!loadGame(1))throw Error('The saved adventure could not be loaded.');}finally{loadingSave=null;}}
    party.set(uid,{...captureActor(),profile:players.find(m=>m.uid===uid)?.profile});Crafting.coopRestore(uid,previous?.players?.[uid]?.crafting||previous?.save?.crafting||Crafting.capture());Crafting.coopSelect(uid);
    syncParty(players);
    if(previous?.players)for(const [id,saved]of Object.entries(previous.players)){
      if(!party.has(id))party.set(id,{...captureActor(),profile:saved.profile});
      Crafting.coopRestore(id,saved.crafting);withActor(id,()=>{Object.assign(P,saved.P);Object.assign(dragon,saved.dragon);pHp=Number.isFinite(saved.hp)?Math.max(0,Math.min(pMax,saved.hp)):pMax;restActor();Object.assign(worn,saved.worn);mounted=!!saved.mounted&&pHp>0;});
    }
    lastMap=MAPID;gameplayStarted=true;BOOT.waiting=false;BOOT.menuOpen=false;document.getElementById('boot').style.display='none';document.body.classList.remove('boot-ready','boot-menu-open');document.body.classList.add('game-started');
    EmberPlayerIdentity.restore(players.find(m=>m.uid===uid)?.profile);window.EmberTitleAudio?.finish();
    if(!previous)startMorning();last=performance.now();LDRCoopRender.enable();
  }
  window.LDRCampaign={get active(){return active;},get owner(){return current;},get uiOwner(){return sharedOwner;},get held(){return held();},get safe(){return !!checkpoint();},vitals:()=>members.map(m=>{const a=actor(m.uid);return {uid:m.uid,name:m.profile.name,hp:a?.vars.pHp||0,max:a?.vars.pMax||6,dragon:hasDragon()?{hp:a?.dragon.hp||0,max:a?.dragon.maxHp||20}:null};}),start,syncParty,setInput,command,claim,voteAction,controllerState,mainFrame,renderGuest,checkpoint,withActor,actor,beginEnemy,beginProjectile,endEnemy,inspect:()=>({current,local,map:MAPID,quest,party:[...party.entries()]})};
  window.LDRCoop={get active(){return active;},addActors,drawActor,drawAirborne};
})();
