/* Frosthorn's authored winter spur, approved artwork and optional boss fight. */
const Frosthorn=(()=>{
  const BASE='assets/sprites/frosthorn/',VERSION='20261001-frosthorn1';
  const REWARD='world:frosthorn:frostheart',CELL=128,HEIGHT=112,FOOT=104;
  const arena={id:9361,kind:'arena',x:2545,y:25,r:12.6,style:'winter',sideRoute:'frosthorn',frosthorn:true};
  const routes=[
    {id:9359,kind:'route',x0:2640,y0:141,x1:2649,y1:68,w:5,band:20,style:'winter',a0:null,a1:null,pts:[[2640,141],[2640,105],[2592,105],[2592,143],[2559,143],[2559,165],[2542,165],[2542,115],[2561,115],[2561,86],[2600,86],[2600,68],[2649,68]]},
    {id:9360,kind:'route',x0:2647,y0:65,x1:2545,y1:37,w:5,band:20,style:'winter',a0:null,a1:null,pts:[[2647,65],[2657,65],[2657,37],[2581,37],[2581,57],[2545,57],[2545,37]]}
  ];
  const frames={},spikes=[],waves=[];
  let loading=null,ready=false,failed=false,map='';
  const owned=()=>houseLootTaken.has(REWARD);
  const paused=()=>sceneHold()||fadeDir||doorMotion||encounterCombatPaused();
  const facing=f=>f.dir==='s'?(f.flip?'w':'e'):f.dir;
  function face(f,dx,dy){f.dir=Math.abs(dx)>Math.abs(dy)?'s':dy<0?'u':'d';f.flip=dx<0;}
  function installWorld(m){
    m.features||=[];m.foes||=[];
    for(const route of routes){
      const old=m.features.find(f=>f.id===route.id);
      // Both segments continue into another feature: no chest or end cap here.
      const spec={...route,pts:route.pts.map(p=>p.slice()),sideRoute:'frosthorn',shortcut:true};
      if(old)Object.assign(old,spec);else m.features.push(spec);
    }
    if(!m.features.some(f=>f.id===arena.id))m.features.push({...arena});
    if(!m.foes.some(f=>f.frosthorn))m.foes.push({k:'frosthorn',x:arena.x,y:arena.y-3,frosthorn:true});
  }
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  async function prepare(){
    if(loading)return loading;
    loading=(async()=>{
      for(const [dir,file]of [['d','south'],['e','east'],['u','north']]){
        const source=new Image();source.src=BASE+file+'-packed.png?v='+VERSION;await source.decode();
        frames[dir]=Array.from({length:7},(_,row)=>Array.from({length:6},(_,col)=>{
          const c=canvas(CELL,HEIGHT);c.getContext('2d').drawImage(source,col*CELL,row*HEIGHT,CELL,HEIGHT,0,0,CELL,HEIGHT);c.pixelLocked=true;return c;
        }));
      }
      // Mirror each cell, never the complete strip (which reverses time).
      frames.w=frames.e.map(row=>row.map(c=>{const out=canvas(CELL,HEIGHT),g=out.getContext('2d');g.translate(CELL,0);g.scale(-1,1);g.drawImage(c,0,0);out.pixelLocked=true;return out;}));
      const ice=new Image();ice.src=BASE+'ice-spikes-packed.png?v='+VERSION;await ice.decode();
      for(let row=0;row<2;row++)for(let col=0;col<6;col++){const c=canvas(72,72);c.getContext('2d').drawImage(ice,col*72,row*72,72,72,0,0,72,72);c.pixelLocked=true;spikes.push(c);}
      for(const dir of ['d','e','u','w']){
        const key='frosthorn_idle_'+dir,sheet=canvas(CELL*6,HEIGHT),g=sheet.getContext('2d');
        frames[dir][0].forEach((frame,i)=>g.drawImage(frame,i*CELL,0));sheet.pixelLocked=true;
        animalSheets[key]=sheet;SPR[key]=[0,0,CELL,HEIGHT,6,key];
      }
      ready=true;
    })().catch(error=>{failed=true;console.error('Frosthorn artwork:',error);throw error;});
    return loading;
  }
  function reset(){waves.length=0;map=MAPID;}
  function defeated(f){
    reset();if(owned())return;
    houseLootTaken.add(REWARD);
    toast('Corin obtained the Frostheart Relic! Ice breath damage +25%.');
    saveGame();
  }
  function enter(f,state){f.st=state;f.t=0;f.hit=0;}
  function tell(f,attack,target){
    f.frostAttack=attack;f.frostAim={x:target.x,y:target.y};
    face(f,target.x-f.x,target.y-f.y);enter(f,'wind');beginEnemyWindup(f);
    if(attack==='stomp'){
      const dx=target.x-f.x,dy=target.y-f.y,d=Math.hypot(dx,dy)||1,points=[];
      for(let i=0;i<13;i++){
        const distance=38+i*24,x=f.x+dx/d*distance,y=f.y+dy/d*distance;
        if(Math.hypot(x-(arena.x*TS+8),y-(arena.y*TS+8))>arena.r*TS-16||isSolid(x,y))break;
        points.push({x,y,delay:i*.13,size:1+i*.025});
      }
      waves.push({owner:f,t:-.9,points,playerHit:false,dragonHit:false});
      f.frostStompCool=5.5;
    }
  }
  function melee(f,range){
    const aim=f.frostAim,dx=aim.x-f.x,dy=aim.y-f.y,d=Math.hypot(dx,dy)||1;
    const hit=(x,y)=>{const px=x-f.x,py=y-f.y;return Math.hypot(px,py)<=range&&(px*dx+py*dy)/(Math.hypot(px,py)*d||1)>-.15;};
    if(hit(P.x,P.y)&&!glassShieldDeflectFoe(f))hurtPlayer(f.frostAttack==='headbutt'?3:2);
    if(!mounted&&dragonCombatHere()&&dragon.on&&!dragon.down&&hit(dragon.x,dragon.y))hurtDragon(3);
  }
  function step(f,dt){
    if(map!==MAPID)reset();
    if(f.st==='dead')return;
    if(!ready||!f._thinking||f.hold>0||paused())return;
    // A boss flag must not make him chase across the entire overworld.
    if(arenaLock?.id!==arena.id){f.st='idle';return;}
    if(!seenFoe.frosthorn)seenFoe.frosthorn=++seenCount;
    f.hurt=Math.max(0,(f.hurt||0)-dt);
    if(f.glassBlockHold>0){f.glassBlockHold=Math.max(0,f.glassBlockHold-dt);f.x=f.glassBlockAnchorX;f.y=f.glassBlockAnchorY;return;}
    f.frostCool=Math.max(0,(f.frostCool||0)-dt);f.frostStompCool=Math.max(0,(f.frostStompCool??1.4)-dt);
    if(f.st==='wind'){
      if(!f.frostAttack){tell(f,'swipe',targetFor(f));return;}
      if(f.t>=(f.frostAttack==='stomp'?.9:.65))enter(f,'swing');return;
    }
    if(f.st==='swing'){
      if(f.frostAttack==='headbutt'&&f.t<.24){const a=f.frostAim,dx=a.x-f.x,dy=a.y-f.y,d=Math.hypot(dx,dy)||1;moveCombatActor(f,dx/d*115*dt,dy/d*115*dt,false,0);}
      if(!f.hit&&f.t>=.16){f.hit=1;if(f.frostAttack!=='stomp')melee(f,f.frostAttack==='headbutt'?68:62);}
      if(f.t>=.85){finishGlassShieldParry(f);enter(f,'idle');f.frostCool=.85;f.frostAttack=null;}
      return;
    }
    const target=targetFor(f),dx=target.x-f.x,dy=target.y-f.y,d=Math.hypot(dx,dy);face(f,dx,dy);
    if(f.frostCool<=0){
      if(f.frostStompCool<=0){tell(f,'stomp',P);return;}
      if(d<100){f.frostMelee=(f.frostMelee||0)+1;tell(f,d>65||f.frostMelee%2===0?'headbutt':'swipe',target);return;}
    }
    if(d>48){moveCombatActor(f,dx/(d||1)*FOE.frosthorn.speed*dt,dy/(d||1)*FOE.frosthorn.speed*dt);if(f.st!=='walk')enter(f,'walk');}
    else if(f.st!=='idle')enter(f,'idle');
  }
  function effects(dt){
    if(map!==MAPID||foesHeld||MAPID!=='world'){reset();return;}
    if(paused())return;
    for(let i=waves.length-1;i>=0;i--){
      const w=waves[i];
      if(w.owner.st==='dead'||arenaLock?.id!==arena.id){waves.splice(i,1);continue;}
      w.t+=dt;
      for(const p of w.points){
        const age=w.t-p.delay;if(age<.24||age>.66)continue;
        const radius=13*p.size;
        if(!w.playerHit&&Math.hypot(P.x-p.x,P.y-p.y)<radius+6){w.playerHit=true;hurtPlayer(2);}
        if(!mounted&&!w.dragonHit&&dragonCombatHere()&&dragon.on&&!dragon.down&&Math.hypot(dragon.x-p.x,dragon.y-p.y)<radius+12){w.dragonHit=true;hurtDragon(2);}
      }
      if(w.t>(w.points.at(-1)?.delay||0)+1.12)waves.splice(i,1);
    }
  }
  function addEffects(list){
    if(!ready||foesHeld||MAPID!==map)return;
    for(const w of waves)for(const p of w.points){const age=w.t-p.delay;if(age<1.12)list.push({frostSpike:p,age,x:p.x,y:p.y,sy:age<.12?-1e7:p.y});}
  }
  function pose(f){
    let row=0,index=0;
    if(f.st==='dead'){row=6;index=Math.min(5,Math.floor(f.t/1.15*6));}
    else if(f.st==='wind'||f.st==='swing'){
      row={stomp:2,swipe:3,headbutt:4}[f.frostAttack]??3;
      index=f.st==='wind'?Math.min(2,Math.floor(f.t/(f.frostAttack==='stomp'?.9:.65)*3)):Math.min(5,3+Math.floor(f.t/.85*3));
    }else if(f.hurt>0){row=5;index=Math.min(5,Math.floor((.35-f.hurt)/.35*6));}
    else{row=f.st==='walk'?1:0;index=Math.floor(f.t*(row?7:3))%6;}
    return frames[facing(f)]?.[row][Math.max(0,index)];
  }
  function draw(o){
    if(!o.frosthorn&&!o.frostSpike)return false;
    if(!ready)return true;
    ctx.save();ctx.imageSmoothingEnabled=false;
    if(o.frosthorn){
      const f=o.frosthorn,frame=pose(f);
      if(f.st==='dead'&&f.t>2.4){ctx.restore();return true;}
      if(f.st==='dead')ctx.globalAlpha=Math.min(1,Math.max(0,(2.4-f.t)/.7));
      drawPixelImage(ctx,frame,0,0,CELL,HEIGHT,Math.round(f.x-CELL/2),Math.round(f.y-FOOT),CELL,HEIGHT);
      if(f.st!=='dead'){
        const y=Math.round(f.y-101);ctx.fillStyle='#182c40';ctx.fillRect(f.x-31,y,62,5);
        ctx.fillStyle='#a5eaff';ctx.fillRect(f.x-30,y+1,60*Math.max(0,f.hp/enemyMaxHp(f.kind,f.x)),3);
      }
    }else{
      const p=o.frostSpike,age=o.age;
      if(age<0){ctx.strokeStyle='#a1edff';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.ellipse(p.x,p.y-2,12*p.size,5*p.size,0,0,Math.PI*2);ctx.stroke();}
      else{
        const index=age<.42?Math.min(5,Math.floor(age/.07)):Math.min(11,6+Math.floor((age-.42)/.115));
        const size=72*p.size;drawPixelImage(ctx,spikes[index],0,0,72,72,Math.round(p.x-size/2),Math.round(p.y-68*p.size),Math.round(size),Math.round(size));
      }
    }
    ctx.restore();return true;
  }
  FOE.frosthorn={hp:65,speed:43,sight:999,reach:62,ring:68,dmg:2,swingT:.85,hitAt:.16,rest:.85,groupRest:1,wind:.65};
  FOE_ART.frosthorn='frosthorn';WORTH.frosthorn=80;
  return {routes,arena,installWorld,prepare,reset,owned,defeated,step,effects,addEffects,draw,pose,
    power:(el,power)=>el==='ice'&&owned()?power*1.25:power,
    travelPlace:()=>({name:'Frosthorn — Winter Arena',kind:'Boss',map:'world',x:2545,y:39}),
    inspect:()=>({ready,failed,waves:waves.map(({owner,...w})=>({...w,points:w.points.map(p=>({...p}))}))})};
})();
