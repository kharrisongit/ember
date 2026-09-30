/* Combat uses the same four-direction poses as the north-field audition. */
const SpiderQueenBoss=(()=>{
  const shots=[],splashes=[];let map='',web=null;
  const webbed=()=>!!web&&web.phase==='trapped'&&map===MAPID&&!foesHeld;
  const aboveWeb=()=>!!web&&map===MAPID&&!foesHeld;
  const pause=()=>sceneHold()||fadeDir||doorMotion||encounterCombatPaused();
  const face=(x,y)=>Math.abs(x)>Math.abs(y)?x<0?'w':'e':y<0?'u':'d';
  const dir=f=>f.dir==='s'?(f.flip?'w':'e'):f.dir;
  function setFace(f,x,y){const d=face(x,y);f.dir=d==='e'||d==='w'?'s':d;f.flip=d==='w';}
  function reset(){shots.length=0;splashes.length=0;web=null;map=MAPID;}
  function enter(f,state){f.st=state;f.t=0;f.hit=0;}
  function launch(f){
    const d=dir(f),v={d:[0,1],u:[0,-1],e:[1,0],w:[-1,0]}[d];
    const x=f.x+v[0]*27,y=f.y-47+v[1]*7;
    const dx=f.aimX-x,dy=f.aimY-y,length=Math.hypot(dx,dy)||1;
    shots.push({x,y,vx:dx/length*105,vy:dy/length*105,dir:face(dx,dy),t:0});
  }
  function step(f,dt){
    if(map!==MAPID)reset();
    if(f.st==='dead'){if(f.t<dt*2){shots.length=0;web=null;}return;}
    if(!f._thinking||f.hold>0||!SpiderQueenDemo.inspect().ready)return;
    if(!seenFoe[f.kind])seenFoe[f.kind]=++seenCount;
    if(pause())return;
    f.hurt=Math.max(0,(f.hurt||0)-dt);
    if(f.queenStun>0){f.queenStun=Math.max(0,f.queenStun-dt);f.st='idle';f.t=0;return;}
    if(web&&web.queen===f&&web.phase!=='burning'){stepWebQueen(f,dt);return;}
    f.webCool=(f.webCool??10)-dt;
    if(f.webCool<=0&&dragonCombatHere()&&dragon.on&&!dragon.down){beginWeb(f);return;}
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
        else{
          f.impact=.3;
          if(d<=64){if(target.isDragon)hurtDragon(2);else if(target.isPlayer&&!glassShieldDeflectFoe(f))hurtPlayer(2);}
        }
      }
      if(f.t>=(f.queenAttack==='spit'?1.1:1.5)){enter(f,'idle');f.attackCool=.8;}
      return;
    }
    setFace(f,dx,dy);
    if(f.attackCool<=0&&(d<60||f.venomCool<=0&&d<260)){
      f.queenAttack=d>=60?'spit':'stomp';
      f.aimX=target.x;f.aimY=target.y-(target.isDragon?14:10);
      if(f.queenAttack==='spit')f.venomCool=4.5;
      enter(f,'wind');return;
    }
    if(d>50){
      moveCombatActor(f,dx/(d||1)*29*dt,dy/(d||1)*29*dt,false,0);
      if(f.st!=='walk')enter(f,'walk');
    }else if(f.st!=='idle')enter(f,'idle');
  }
  function effects(dt){
    if(map!==MAPID){reset();return;}
    if(!MD?.pyramid||foesHeld){reset();return;}
    if(pause())return;
    if(web?.phase==='burning'){web.t+=dt;if(web.t>=1)web=null;}
    const queen=foes.find(f=>f.kind==='spiderqueen'&&f.st!=='dead');
    if(!queen){shots.length=0;web=null;}
    for(const f of foes)if(f.impact>0)f.impact=Math.max(0,f.impact-dt);
    const segment=(s,x,y,px,py)=>{const vx=s.x-x,vy=s.y-y,t=Math.max(0,Math.min(1,((px-x)*vx+(py-y)*vy)/(vx*vx+vy*vy||1)));return Math.hypot(px-x-vx*t,py-y-vy*t);};
    for(let i=shots.length-1;i>=0;i--){
      const s=shots[i],x=s.x,y=s.y;s.t+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
      let hit=false;
      if(segment(s,x,y,P.x,P.y-10)<12){hurtPlayer(2);hit=true;}
      else if(dragonCombatHere()&&dragon.on&&!dragon.down&&segment(s,x,y,dragon.x,dragon.y-14)<20){hurtDragon(2);hit=true;}
      if(hit||s.t>2.8||isSolid(s.x,s.y)){
        splashes.push({x:s.x,y:s.y,t:0});shots.splice(i,1);
      }
    }
    for(let i=splashes.length-1;i>=0;i--){splashes[i].t+=dt;if(splashes[i].t>=.5)splashes.splice(i,1);}
  }
  function beginWeb(f){
    shots.length=0;f.queenAttack='web';enter(f,'swing');f.webCool=24;
    web={queen:f,phase:'casting',t:0,biteCool:0,source:[f.x,f.y-40],points:[]};
    const [l,t,r,b]=f.expandedRoom;
    for(let y=t+8;y<b;y+=40)for(let x=l+8;x<r;x+=40)web.points.push([x,y]);
    toast('She is covering the room in web!');
  }
  function trapParty(){
    if(mounted)setMounted(false,true);
    dragon.air=false;dragon.tr=null;dragon.knockdown=0;dragon.moving=false;dragon.placed=MAPID;
    P.moving=false;if(!dying())P.act=null;
    hunt=null;claw=null;dragonBreak=null;dragonRecall=false;breath=null;
    web.player=[P.x,P.y];web.dragon=[dragon.x,dragon.y];web.phase='trapped';web.t=0;web.biteCool=1.2;
    // Every web cast supplies its escape, even if Fire was just used.
    breathCooldown.fire=0;breathT=breathWait();
    toast('Webbed! Dragon → Fire burns the web and stuns her.');
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
    toast('The Spider Queen drains a heart!');
  }
  function stepWebQueen(f,dt){
    web.t+=dt;
    if(web.phase==='casting'){if(web.t>=1.35)trapParty();return;}
    web.biteCool=Math.max(0,web.biteCool-dt);
    const party=[P,...(dragonHere()&&dragon.on&&!dragon.down?[dragon]:[])].filter(a=>a!==P||pHp>0);
    if(!party.length){web=null;return;}
    const target=party.sort((a,b)=>Math.hypot(a.x-f.x,a.y-f.y)-Math.hypot(b.x-f.x,b.y-f.y))[0];
    const dx=target.x-f.x,dy=target.y-f.y,d=Math.hypot(dx,dy);setFace(f,dx,dy);
    if(d>43){f.st='walk';moveCombatActor(f,dx/d*13*dt,dy/d*13*dt,false,0);}
    else{f.st='swing';f.queenAttack='bite';if(web.biteCool<=0){bite(target);web.biteCool=2.5;f.t=0;}}
  }
  function holdPlayer(dt){
    if(!webbed())return false;P.x=web.player[0];P.y=web.player[1];P.moving=false;P.t+=dt;return true;
  }
  function holdDragon(){
    if(!webbed())return false;dragon.x=web.dragon[0];dragon.y=web.dragon[1];dragon.moving=false;dragon.tr=null;dragon.air=false;return true;
  }
  function commandBreath(){
    if(!webbed())return false;
    hunt=null;claw=null;clawT=0;dragonBreak=null;dragonCombatPause=0;
    if(dragonEl==='fire')breath=null;
    const f=web.queen,aim=direction4(f.x-dragon.x,f.y-dragon.y,dragon.dir);dragon.dir=aim;
    fireNow(aim,f);return true;
  }
  function fireCast(element){
    if(!webbed()||element!=='fire')return;
    const f=web.queen;web.phase='burning';web.t=0;f.queenStun=3.5;f.webCool=24;f.st='idle';f.t=0;f.hurt=.35;
    shots.length=0;toast('The web burns away! She is stunned—attack!');
  }
  function drawWeb(){
    const sp=SPR.scientist_web;if(!web||!sp)return;
    const [l,t,r,b]=web.queen.expandedRoom;
    ctx.save();ctx.beginPath();ctx.rect(l,t-32,r-l,b-t+32);ctx.clip();
    for(const [i,[x,y]]of web.points.entries()){
      const delay=(i%9)*.045,progress=Math.max(0,Math.min(1,(web.t-delay)/.65));
      if(web.phase==='casting'){
        if(!progress)continue;const xx=web.source[0]+(x-web.source[0])*progress,yy=web.source[1]+(y-web.source[1])*progress-45*Math.sin(progress*Math.PI);
        ctx.globalAlpha=.85;drawGameImage(ctx,sheetOf(sp),sp[0],sp[1],64,64,Math.round(xx-16),Math.round(yy-16),32,32);
      }else{
        ctx.globalAlpha=web.phase==='burning'?Math.max(0,.86*(1-web.t)):.86;
        // Rotate the supplied corner web into an overlapping floor-wide net.
        ctx.save();ctx.translate(x,y);ctx.rotate((i%4)*Math.PI/2);
        drawGameImage(ctx,sheetOf(sp),sp[0],sp[1],64,64,-40,-40,80,80);ctx.restore();
        if(web.phase==='burning'){
          const flame=SPR['fx_attack_fire_'+Math.floor(web.t*18+i)%10];
          if(flame){ctx.save();ctx.globalAlpha=Math.max(0,1-web.t);ctx.translate(x,y-8);ctx.rotate(-Math.PI/2);
            drawGameImage(ctx,sheetOf(flame),flame[0],flame[1],flame[2],flame[3],-16,-16,32,32);ctx.restore();}
        }
      }
    }
    if(web.phase==='trapped')for(const [x,y]of [web.player,web.dragon]){
      ctx.globalAlpha=.96;for(const flip of [-1,1]){ctx.save();ctx.translate(x,y-20);ctx.scale(flip,1);drawGameImage(ctx,sheetOf(sp),sp[0],sp[1],64,64,-40,-28,80,64);ctx.restore();}
    }
    ctx.restore();
  }
  function addEffects(list){
    if(map!==MAPID||!MD?.pyramid||foesHeld)return;
    if(web)list.push({queenWeb:true,x:0,y:0,sy:1e8});
    for(const s of shots)list.push({queenVenom:s,x:s.x,y:s.y,sy:s.y+48});
    for(const s of splashes)list.push({queenSplash:s,x:s.x,y:s.y});
  }
  function draw(o){
    if(o.queenWeb){drawWeb();return true;}
    if(!o.queenBoss&&!o.queenVenom&&!o.queenSplash)return false;
    if(!SpiderQueenDemo.inspect().ready)return true;
    ctx.save();ctx.imageSmoothingEnabled=false;
    if(o.queenBoss){
      const f=o.queenBoss;
      if(f.st==='dead'&&f.t>=1){ctx.restore();return true;}
      const action=f.st==='dead'||f.queenStun>0||f.hurt>0&&f.st!=='swing'?'hurt':f.st==='swing'?(['spit','web','bite'].includes(f.queenAttack)?'spit':'stomp'):f.st==='walk'?'walk':'idle';
      const frame=SpiderQueenDemo.frame(dir(f),action,f.t);
      if(f.st==='dead')ctx.globalAlpha=Math.max(0,1-f.t);
      ctx.fillStyle='rgba(20,9,25,.25)';ctx.beginPath();ctx.ellipse(f.x,f.y-7,35,9,0,0,Math.PI*2);ctx.fill();
      if(f.impact>0){ctx.strokeStyle='#ecd4a4';ctx.beginPath();ctx.ellipse(f.x,f.y-6,42+(1-f.impact/.3)*10,13,0,0,Math.PI*2);ctx.stroke();}
      drawPixelImage(ctx,frame,0,0,128,96,Math.round(f.x-64),Math.round(f.y-90),128,96);
      if(f.queenStun>0){
        ctx.fillStyle='#ffe8a6';for(let i=0;i<3;i++){const angle=tAcc*3+i*Math.PI*2/3;ctx.fillRect(Math.round(f.x+Math.cos(angle)*16)-1,Math.round(f.y-72+Math.sin(angle)*4)-1,3,3);}
      }
      if(f.st!=='dead'){
        const max=enemyMaxHp(f.kind,f.x),width=64;
        ctx.fillStyle='#241c27';ctx.fillRect(Math.round(f.x-width/2)-1,Math.round(f.y-80),width+2,5);
        ctx.fillStyle='#ad4767';ctx.fillRect(Math.round(f.x-width/2),Math.round(f.y-79),Math.round(width*Math.max(0,f.hp/max)),3);
      }
    }else{
      const s=o.queenVenom||o.queenSplash,frame=SpiderQueenDemo.venomFrame(o.queenVenom?s.dir:'impact',s.t);
      drawPixelImage(ctx,frame,0,0,32,32,Math.round(s.x-16),Math.round(s.y-16),32,32);
    }
    ctx.restore();return true;
  }
  return {step,effects,addEffects,draw,reset,webbed,aboveWeb,holdPlayer,holdDragon,commandBreath,fireCast,inspect:()=>({web:web?{phase:web.phase,t:web.t,player:web.player,dragon:web.dragon}:null,shots:shots.map(s=>({...s})),splashes:splashes.map(s=>({...s}))})};
})();
