/* Combat uses the same four-direction poses as the north-field audition. */
const SpiderQueenBoss=(()=>{
  const shots=[],splashes=[],waves=[];let map='',web=null,learned=false;
  const SCALE=.68,WEB_CRAWL=19;let tellCanvas=null;
  const webbed=()=>!!web&&['gathering','trapped','retreating'].includes(web.phase)&&map===MAPID&&!foesHeld;
  const aboveWeb=()=>!!web&&map===MAPID&&!foesHeld;
  const pause=()=>sceneHold()||fadeDir||doorMotion||encounterCombatPaused();
  const face=(x,y)=>Math.abs(x)>Math.abs(y)?x<0?'w':'e':y<0?'u':'d';
  const dir=f=>f.dir==='s'?(f.flip?'w':'e'):f.dir;
  function setFace(f,x,y){const d=face(x,y);f.dir=d==='e'||d==='w'?'s':d;f.flip=d==='w';}
  function clearWeb(){
    if(web&&map===MAPID&&web.cameraZoom){restoreCameraTarget();cam.z=web.cameraZoom;followCam();clampCam();}
    web=null;
  }
  function clearWaves(){for(const w of waves)finishGlassShieldParry(w.queen);waves.length=0;}
  function reset(){shots.length=0;splashes.length=0;clearWaves();clearWeb();map=MAPID;}
  const insideRoom=(f,x,y)=>!!f.expandedRoom&&x>=f.expandedRoom[0]&&y>=f.expandedRoom[1]&&x<=f.expandedRoom[2]&&y<=f.expandedRoom[3];
  function roomThreat(){return !foesHeld&&!!MD?.pyramid&&foes.some(f=>f.kind==='spiderqueen'&&f.st!=='dead'&&insideRoom(f,P.x,P.y));}
  function canBlockSlam(f){return f?.kind==='spiderqueen'&&f.st!=='dead'&&insideRoom(f,P.x,P.y)&&((f.queenAttack==='stomp'&&['wind','swing'].includes(f.st))||waves.some(w=>w.queen===f&&!w.hit));}
  function slam(f){
    const [l,t,r,b]=f.expandedRoom;
    const maxRadius=Math.max(...[[l,t],[r,t],[l,b],[r,b]].map(([x,y])=>Math.hypot(x-f.x,y-f.y)))+16;
    waves.push({queen:f,x:f.x,y:f.y,t:0,radius:0,maxRadius,hit:false});
  }
  function stepWaves(dt){
    for(let i=waves.length-1;i>=0;i--){
      const w=waves[i];
      if(w.queen.st==='dead'){finishGlassShieldParry(w.queen);waves.splice(i,1);continue;}
      w.t+=dt;w.radius=Math.min(w.maxRadius,w.maxRadius*w.t/1.05);
      // One hit as the visible front reaches Corin. Running behind it cannot dodge it.
      if(!w.hit&&insideRoom(w.queen,P.x,P.y)&&Math.hypot(P.x-w.x,P.y-w.y)<=w.radius+8){
        w.hit=true;
        if(!glassShieldDeflectFoe(w.queen))hurtPlayer(2);
      }
      if(w.t>=1.2){finishGlassShieldParry(w.queen);waves.splice(i,1);}
    }
  }
  function enter(f,state){f.st=state;f.t=0;f.hit=0;}
  function launch(f){
    const d=dir(f),v={d:[0,1],u:[0,-1],e:[1,0],w:[-1,0]}[d];
    // Collision follows the ground plane. The raised mouth is only a draw
    // offset; testing it against floor walls used to swallow north-edge shots.
    const x=f.x+v[0]*27*SCALE,y=f.y+v[1]*7*SCALE;
    const dx=f.aimX-x,dy=f.aimY-y,length=Math.hypot(dx,dy)||1;
    shots.push({x,y,z:47*SCALE,startZ:47*SCALE,endZ:f.aimDragon?14:10,length,
      vx:dx/length*105,vy:dy/length*105,dir:face(dx,dy),t:0});
  }
  function step(f,dt){
    if(map!==MAPID)reset();
    if(f.st==='dead'){if(f.t<dt*2){shots.length=0;clearWaves();clearWeb();}return;}
    if(!f._thinking||f.hold>0||!SpiderQueenDemo.inspect().ready)return;
    if(!seenFoe[f.kind])seenFoe[f.kind]=++seenCount;
    if(pause())return;
    f.hurt=Math.max(0,(f.hurt||0)-dt);
    if(f.queenStun>0){f.queenStun=Math.max(0,f.queenStun-dt);f.st='idle';f.t=0;return;}
    if(web&&web.queen===f&&web.phase!=='burning'){stepWebQueen(f,dt);return;}
    if(waves.some(w=>w.queen===f)&&f.st!=='swing')return;
    f.webCool=(f.webCool??5)-dt;
    if(f.webCool<=0&&!waves.length&&SpiderQueenWeb.ready()&&dragonCombatHere()&&dragon.on&&!dragon.down){beginWeb(f);return;}
    f.venomCool=Math.max(0,(f.venomCool||0)-dt);f.attackCool=Math.max(0,(f.attackCool||0)-dt);
    const target=targetFor(f),dx=target.x-f.x,dy=target.y-f.y,d=Math.hypot(dx,dy);
    if(f.glassBlockHold>0){f.glassBlockHold=Math.max(0,f.glassBlockHold-dt);f.x=f.glassBlockAnchorX;f.y=f.glassBlockAnchorY;return;}
    if(f.st==='wind'){
      if(f.t>=.42)enter(f,'swing');return;
    }
    if(f.st==='swing'){
      if(!f.hit&&f.t>=(f.queenAttack==='spit'?.6:.82)){
        f.hit=1;
        if(f.queenAttack==='spit')launch(f);
        else slam(f);
      }
      if(f.t>=(f.queenAttack==='spit'?1.1:1.5)){if(!waves.some(w=>w.queen===f))finishGlassShieldParry(f);enter(f,'idle');f.attackCool=.8;}
      return;
    }
    setFace(f,dx,dy);
    if(f.attackCool<=0&&(d<50||f.venomCool<=0&&d<260)){
      f.queenAttack=d>=50?'spit':'stomp';
      f.aimX=target.x;f.aimY=target.y;f.aimDragon=!!target.isDragon;
      if(f.queenAttack==='spit')f.venomCool=4.5;
      else toast('Shockwave! Press B to block the ring.');
      enter(f,'wind');return;
    }
    if(d>40){
      const speed=FOE.spiderqueen.speed;
      moveCombatActor(f,dx/(d||1)*speed*dt,dy/(d||1)*speed*dt,false,0);
      if(f.st!=='walk')enter(f,'walk');
    }else if(f.st!=='idle')enter(f,'idle');
  }
  function effects(dt){
    if(map!==MAPID){reset();return;}
    if(!MD?.pyramid||foesHeld){reset();return;}
    if(pause())return;
    if(web?.phase==='burning'){web.t+=dt;if(web.t>=1.5)clearWeb();}
    const queen=foes.find(f=>f.kind==='spiderqueen'&&f.st!=='dead');
    if(!queen){shots.length=0;clearWaves();clearWeb();}
    stepWaves(dt);
    const segment=(s,x,y,px,py)=>{const vx=s.x-x,vy=s.y-y,t=Math.max(0,Math.min(1,((px-x)*vx+(py-y)*vy)/(vx*vx+vy*vy||1)));return Math.hypot(px-x-vx*t,py-y-vy*t);};
    for(let i=shots.length-1;i>=0;i--){
      const s=shots[i],x=s.x,y=s.y;s.t+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
      s.z=s.startZ+(s.endZ-s.startZ)*Math.min(1,s.t*105/s.length);
      let hit=false;
      if(segment(s,x,y,P.x,P.y)<12){hurtPlayer(2);hit=true;}
      else if(dragonCombatHere()&&dragon.on&&!dragon.down&&segment(s,x,y,dragon.x,dragon.y)<20){hurtDragon(2);hit=true;}
      if(hit||s.t>2.8||isSolid(s.x,s.y)){
        splashes.push({x:s.x,y:s.y-s.z,t:0});shots.splice(i,1);
      }
    }
    for(let i=splashes.length-1;i>=0;i--){splashes[i].t+=dt;if(splashes[i].t>=.5)splashes.splice(i,1);}
  }
  function beginWeb(f){
    shots.length=0;f.queenAttack='web';enter(f,'swing');f.webCool=9;
    restoreCameraTarget();
    web={queen:f,phase:'casting',t:0,biteCool:0,source:[f.x,f.y-40*SCALE],points:[],cameraZoom:cam.z};
    const [l,t,r,b]=f.expandedRoom;
    // Floor silk stays beneath the party; sparse knots keep the chamber readable.
    const add=(x,y,w,h,variant,turn=0)=>web.points.push({x,y,w,h,variant,turn});
    add(l+70,t+65,226,190,1);add(r-78,t+90,232,168,2);
    add((l+r)/2,b-65,224,180,0);add(l+70,b-62,142,202,3);
    add(r-42,b-45,154,122,4,1);
    for(let i=0;i<7;i++){
      const x=l+18+(i*83)%(r-l-28),y=t+14+(i*67)%(b-t-24);
      const size=[44,64,82,112][i%4];add(x,y,size,size,[4,0,2,1,3][i%5],i%4);
    }
    web.points.sort((a,b)=>b.w*b.h-a.w*a.h);
    toast('She is covering the room in web!');
  }
  function trapParty(){
    if(mounted)setMounted(false,true);
    dragon.air=false;dragon.tr=null;dragon.knockdown=0;dragon.moving=false;dragon.placed=MAPID;
    P.moving=false;if(!dying())P.act=null;
    hunt=null;claw=null;dragonBreak=null;dragonRecall=false;breath=null;
    const f=web.queen,[l,t,r,b]=f.expandedRoom,candidates=[];
    for(let y=t+40;y<=b-32;y+=16)for(let x=l+32;x<=r-76;x+=16){
      if(!canStand(x,y)||!dragonCanStand(x+44,y))continue;
      const distance=Math.min(Math.hypot(x-f.x,y-f.y),Math.hypot(x+44-f.x,y-f.y));
      candidates.push({player:[x,y],dragon:[x+44,y],distance});
    }
    const spot=candidates.sort((a,b)=>b.distance-a.distance)[0];
    web.fromPlayer=[P.x,P.y];web.fromDragon=[dragon.x,dragon.y];
    web.player=spot?.player||[P.x,P.y];web.dragon=spot?.dragon||[dragon.x,dragon.y];
    web.phase='gathering';web.t=0;web.biteCool=1.2;web.approachOrigin=[f.x,f.y];
    // Even a cast from the room's center leaves six visible seconds to counter.
    web.crawlSpeed=Math.min(WEB_CRAWL,Math.max(1,((spot?.distance||150)-36)/6));
    faceCorinAt(f.x,f.y);dragon.faintDir=f.x<web.dragon[0]?'w':'e';
    // Every web cast supplies its escape, even if Fire was just used.
    breathCooldown.fire=0;breathT=breathWait();
    toast(learned?'Webbed! Dragon → Fire burns the web and stuns her.':'The silk sweeps you both across the chamber!');
  }
  function teachFire(){
    if(learned||web.lesson)return;
    web.lesson=true;const capture=web;
    playScene([
      "Corin: The web won't give! She's closing in!",
      "Aurelius: It has both wings. Stop pulling; the silk tightens when we struggle.",
      "Corin: Your head is free. Can you burn a way out?",
      "Aurelius: I have room for a breath. Choose Fire and I'll aim at the strands.",
      "Corin: Do it. I'll be ready when they break."
    ],{telepathy:true,spiderWebLesson:true,after:()=>{
      if(web!==capture)return;learned=true;web.t=0;web.biteCool=1.2;
      toast('Open Dragon → Fire to burn the web and stun her.');
      if(web.pendingFire)commandBreath('fire');
    }});
  }
  function bite(target){
    if(devSafe||saintT>0)return;
    if(target===dragon){
      // One complete HUD heart, regardless of the dragon’s Heartstone upgrades.
      dragon.inv=0;hurtDragon(dragon.maxHp/6);
    }else{
      // A capture bite drains a heart directly; armor does not turn it into a fraction.
      pHp=Math.max(0,pHp-pMax/6);pInv=1.1;
      P.act={kind:pHp<=0?'die':'hurt',t:0,dir:P.dir,flip:P.flip,dir8:playerFacing4()};
    }
    toast('Velyss drains a heart!');
  }
  function stepWebQueen(f,dt){
    web.t+=dt;
    if(web.phase==='casting'){if(web.t>=1.35)trapParty();return;}
    if(web.phase==='gathering'){
      f.st='idle';holdPlayer(0);holdDragon();
      if(web.t>=.65){web.phase='trapped';web.t=0;teachFire();}
      return;
    }
    if(web.phase==='retreating'){
      // One bite per approach: visibly withdraw along the path she just used.
      // The party stays pinned and Fire remains available throughout.
      if(web.t<.45){f.st='swing';return;}
      const [x,y]=web.approachOrigin,dx=x-f.x,dy=y-f.y,d=Math.hypot(dx,dy);
      if(d>2){setFace(f,dx,dy);f.st='walk';const pace=Math.min(d,60*dt);moveCombatActor(f,dx/d*pace,dy/d*pace,false,0);return;}
      web.phase='trapped';web.t=0;web.biteCool=1.2;
      const distance=Math.min(Math.hypot(P.x-f.x,P.y-f.y),Math.hypot(dragon.x-f.x,dragon.y-f.y));
      web.crawlSpeed=Math.min(WEB_CRAWL,Math.max(1,(distance-36)/6));
      f.st='idle';f.t=0;return;
    }
    web.biteCool=Math.max(0,web.biteCool-dt);
    const party=[P,...(dragonHere()&&dragon.on&&!dragon.down?[dragon]:[])].filter(a=>a!==P||pHp>0);
    if(!party.length){clearWeb();return;}
    const target=party.sort((a,b)=>Math.hypot(a.x-f.x,a.y-f.y)-Math.hypot(b.x-f.x,b.y-f.y))[0];
    const dx=target.x-f.x,dy=target.y-f.y,d=Math.hypot(dx,dy);setFace(f,dx,dy);
    if(d>36){f.st='walk';moveCombatActor(f,dx/d*web.crawlSpeed*dt,dy/d*web.crawlSpeed*dt,false,0);}
    else{f.st='swing';f.queenAttack='bite';if(web.biteCool<=0){bite(target);web.phase='retreating';web.t=0;web.biteCool=0;f.t=0;}}
  }
  function holdPlayer(dt){
    if(!webbed())return false;placeBound(P,web.fromPlayer,web.player);P.moving=false;P.t+=dt;return true;
  }
  function holdDragon(){
    if(!webbed())return false;placeBound(dragon,web.fromDragon,web.dragon);dragon.moving=false;dragon.tr=null;dragon.air=false;return true;
  }
  function placeBound(actor,from,to){
    const progress=web.phase==='gathering'?1-Math.pow(1-Math.min(1,web.t/.65),3):1;
    actor.x=from[0]+(to[0]-from[0])*progress;actor.y=from[1]+(to[1]-from[1])*progress;
  }
  function playerPose(){
    if(!webbed()||pHp<=0)return null;
    return {kind:'die',t:web.phase==='gathering'?Math.min(ACT.die.frames-.01,web.t*14):ACT.die.frames-.01,dir:P.dir,flip:P.flip,dir8:playerFacing4()};
  }
  function escapeReady(element='fire'){
    return element==='fire'&&webbed()&&dragon.on&&pHp>0&&!devDragonPassive;
  }
  function commandBreath(element=dragonEl){
    if(!escapeReady(element))return false;
    if(scene?.spiderWebLesson){web.pendingFire=true;return true;}
    if(web.phase==='gathering'){web.phase='trapped';web.t=0;holdPlayer(0);holdDragon();}
    // A web escape is a priority Fire order, even after a bite or a queued
    // attack. Do not let ordinary cooldown, knockdown or pathfinding eat it.
    hunt=null;claw=null;clawT=0;dragonBreak=null;dragonCombatPause=0;
    dragonRecall=false;dragon.knockdown=0;breath=null;fishing=null;
    dragonEl='fire';breathCooldown.fire=0;
    const f=web.queen,aim=direction4(f.x-dragon.x,f.y-dragon.y,dragon.dir);dragon.dir=aim;
    fireNow(aim,f);return true;
  }
  function fireCast(element){
    if(!webbed()||element!=='fire')return;
    const f=web.queen;web.phase='burning';web.t=0;web.fire=[dragon.x,dragon.y-16];
    f.queenStun=3.5;f.webCool=9;f.st='idle';f.t=0;f.hurt=.35;
    shots.length=0;toast('The web burns away! She is stunned—attack!');
  }
  function drawWeb(bodyOnly=false){
    if(!web||!SpiderQueenWeb.ready())return;
    const [l,t,r,b]=web.queen.expandedRoom;
    const drawNet=(net,phase=web.phase,time=web.t)=>{
      const {x,y,w,h,variant,turn=0,body=false}=net;
      if(phase==='burning'){
        const delay=Math.min(.3,Math.hypot(x-web.fire[0],y-web.fire[1])/Math.hypot(r-l,b-t)*.3);
        time-=delay;if(time<0){phase='trapped';time=0;}
      }
      const frame=SpiderQueenWeb.frame(phase,time,variant);
      ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(turn*Math.PI/2);
      const opacity=body ? .3 : w>=140 ? .38 : .45;
      ctx.globalAlpha=opacity*(phase==='burning'?Math.min(1,Math.max(0,(1.25-time)*5)):1);
      drawPixelImage(ctx,frame,0,0,frame.width,frame.height,-Math.round(w/2),-Math.round(h/2),w,h);ctx.restore();
    };
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.beginPath();ctx.rect(l,t-24,r-l,b-t+24);ctx.clip();
    if(!bodyOnly)for(const [i,net]of web.points.entries()){
      if(web.phase==='casting'){
        const delay=(i%7)*.045,progress=Math.max(0,Math.min(1,(web.t-delay)/.85));
        if(!progress)continue;
        const x=web.source[0]+(net.x-web.source[0])*progress,y=web.source[1]+(net.y-web.source[1])*progress-38*Math.sin(progress*Math.PI);
        drawNet({...net,x,y},progress<.9?'casting':'trapped',progress);
      }else drawNet(net);
    }
    if(bodyOnly&&web.phase!=='casting')for(const [i,[x,y]]of [[P.x,P.y],[dragon.x,dragon.y]].entries())drawNet({x,y:y-8,w:i?108:78,h:i?72:52,variant:i?1:2,body:true});
    ctx.restore();
  }
  function frameCamera(){
    if(!aboveWeb()||web.phase==='casting'||mode!=='play'||camFree)return;
    restoreCameraTarget();
    // Frame the three characters, not the chamber's empty corners. Tighten as she approaches.
    const actors=[web.queen,P,dragon];
    const l=Math.min(...actors.map(a=>a.x))-42,r=Math.max(...actors.map(a=>a.x))+42;
    const t=Math.min(...actors.map(a=>a.y))-78,b=Math.max(...actors.map(a=>a.y))+24;
    cam.z=Math.min(web.cameraZoom,(VW-24)/(r-l),(VH-24)/(b-t));
    cam.x=(l+r)/2-VW/cam.z/2;cam.y=(t+b)/2-VH/cam.z/2;
  }
  function addEffects(list){
    if(map!==MAPID||!MD?.pyramid||foesHeld)return;
    for(const w of waves)list.push({queenWave:w,x:w.x,y:w.y,sy:-1e7});
    if(web){
      list.push({queenWeb:true,x:0,y:0,sy:0});
      // Only a light binding overlay goes over Corin and Aurelius.
      list.push({queenWebBinding:true,x:0,y:0,sy:1e8});
    }
    for(const s of shots)list.push({queenVenom:s,x:s.x,y:s.y-s.z,sy:s.y+48});
    for(const s of splashes)list.push({queenSplash:s,x:s.x,y:s.y});
  }
  function draw(o){
    if(o.queenWeb){drawWeb();return true;}
    if(o.queenWebBinding){drawWeb(true);return true;}
    if(o.queenWave){
      const w=o.queenWave,[l,t,r,b]=w.queen.expandedRoom;
      ctx.save();ctx.beginPath();ctx.rect(l,t,r-l,b-t);ctx.clip();
      ctx.globalAlpha=Math.min(1,Math.max(0,(1.2-w.t)/.22));
      for(const [offset,width,color] of [[-10,8,'#c28c60'],[-4,4,'#e6ba80'],[0,2,'#fff0bc']]){
        ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(w.x,w.y,Math.max(0,w.radius+offset),0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();return true;
    }
    if(!o.queenBoss&&!o.queenVenom&&!o.queenSplash)return false;
    if(!SpiderQueenDemo.inspect().ready)return true;
    ctx.save();ctx.imageSmoothingEnabled=false;
    if(o.queenBoss){
      const f=o.queenBoss;
      if(f.st==='dead'&&f.t>=1){ctx.restore();return true;}
      const action=f.st==='dead'||f.queenStun>0||f.hurt>0&&f.st!=='swing'?'hurt':f.st==='swing'?(['spit','web','bite'].includes(f.queenAttack)?'spit':'stomp'):f.st==='walk'?'walk':'idle';
      const frame=SpiderQueenDemo.frame(dir(f),action,f.t);
      if(f.st==='dead')ctx.globalAlpha=Math.max(0,1-f.t);
      ctx.fillStyle='rgba(20,9,25,.25)';ctx.beginPath();ctx.ellipse(f.x,f.y-5,24,6,0,0,Math.PI*2);ctx.fill();
      drawPixelImage(ctx,frame,0,0,frame.width,frame.height,Math.round(f.x-64*SCALE),Math.round(f.y-90*SCALE),Math.round(128*SCALE),Math.round(96*SCALE));
      if(f.st==='wind'||web?.queen===f&&web.phase==='casting'){
        if(!tellCanvas){tellCanvas=document.createElement('canvas');tellCanvas.width=frame.width;tellCanvas.height=frame.height;}
        const g=tellCanvas.getContext('2d');g.clearRect(0,0,tellCanvas.width,tellCanvas.height);g.globalCompositeOperation='source-over';g.drawImage(frame,0,0);
        g.globalCompositeOperation='source-in';g.fillStyle=web?.phase==='casting'?'#ff4242':'#ff9a22';g.fillRect(0,0,tellCanvas.width,tellCanvas.height);
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25+.5*(.5+.5*Math.sin(tAcc*24));
        drawPixelImage(ctx,tellCanvas,0,0,tellCanvas.width,tellCanvas.height,Math.round(f.x-64*SCALE),Math.round(f.y-90*SCALE),Math.round(128*SCALE),Math.round(96*SCALE));ctx.restore();
      }
      if(f.queenStun>0){
        ctx.fillStyle='#ffe8a6';for(let i=0;i<3;i++){const angle=tAcc*3+i*Math.PI*2/3;ctx.fillRect(Math.round(f.x+Math.cos(angle)*16)-1,Math.round(f.y-50+Math.sin(angle)*4)-1,3,3);}
      }
      if(f.st!=='dead'){
        const max=enemyMaxHp(f.kind,f.x),width=52;
        ctx.fillStyle='#241c27';ctx.fillRect(Math.round(f.x-width/2)-1,Math.round(f.y-57),width+2,5);
        ctx.fillStyle='#ad4767';ctx.fillRect(Math.round(f.x-width/2),Math.round(f.y-56),Math.round(width*Math.max(0,f.hp/max)),3);
      }
    }else{
      const s=o.queenVenom||o.queenSplash,frame=SpiderQueenDemo.venomFrame(o.queenVenom?s.dir:'impact',s.t);
      drawPixelImage(ctx,frame,0,0,32,32,Math.round(s.x-16),Math.round(s.y-(o.queenVenom?s.z:0)-16),32,32);
    }
    ctx.restore();return true;
  }
  return {capture:()=>learned,restore:value=>{learned=value===true;},step,effects,addEffects,draw,reset,roomThreat,canBlockSlam,webbed,aboveWeb,frameCamera,holdPlayer,holdDragon,playerPose,escapeReady,commandBreath,fireCast,inspect:()=>({waves:waves.map(({queen,...w})=>({...w})),web:web?{phase:web.phase,t:web.t,player:web.player,dragon:web.dragon,crawlSpeed:web.crawlSpeed,nets:web.points.map(p=>({...p}))}:null,shots:shots.map(s=>({...s})),splashes:splashes.map(s=>({...s}))})};
})();
