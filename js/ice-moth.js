/* Approved directional moth art, authored winter trail, and a ranged boss. */
const IceMoth=(()=>{
  const BASE='assets/sprites/ice-moth/',VERSION='20261001-icemoth1';
  const CELL=144,HEIGHT=144,FOOT=112,FX=96,DEFEATED='world:ice-moth:defeated';
  const arena={id:9367,kind:'arena',x:2346,y:168,r:6.3,style:'winter',sideRoute:'ice-moth',iceMoth:true};
  const endpoint={id:9368,kind:'arena',x:2346,y:134,r:6.3,style:'winter',sideRoute:'ice-moth',iceMothEnd:true};
  const routes=[
    {id:9362,x0:2632,y0:186,x1:2543,y1:279,pts:[[2632,186],[2603,186],[2603,226],[2584,226],[2584,246],[2622,246],[2622,279],[2543,279]]},
    {id:9363,x0:2543,y0:278,x1:2533,y1:231,pts:[[2543,278],[2515,278],[2515,309],[2486,309],[2486,248],[2533,248],[2533,231]]},
    {id:9364,x0:2535,y0:231,x1:2440,y1:203,pts:[[2535,231],[2535,201],[2498,201],[2498,174],[2466,174],[2466,203],[2440,203]]},
    {id:9365,x0:2443,y0:202,x1:2346,y1:199,pts:[[2443,202],[2413,202],[2413,236],[2436,236],[2436,264],[2371,264],[2371,242],[2346,242],[2346,199]]},
    {id:9366,x0:2346,y0:134,x1:2346,y1:202,pts:[[2346,134],[2346,202]]}
  ].map(f=>({...f,kind:'route',w:5,band:20,style:'winter',a0:null,a1:null,sideRoute:'ice-moth',shortcut:true}));
  const frames={},effectsArt=[],shots=[],bursts=[];
  let loading=null,ready=false,map='';
  const defeatedAlready=()=>houseLootTaken.has(DEFEATED);
  const paused=()=>sceneHold()||fadeDir||doorMotion||encounterCombatPaused();
  const direction=f=>f.dir==='s'?(f.flip?'w':'e'):f.dir;
  const windTime=f=>f.mothAttack==='gust'?.9:1.05;
  function face(f,dx,dy){f.dir=Math.abs(dx)>Math.abs(dy)?'s':dy<0?'u':'d';f.flip=dx<0;}
  function installWorld(m){
    m.features||=[];m.foes||=[];
    for(const spec of [...routes,arena,endpoint]){
      const existing=m.features.find(f=>f.id===spec.id),copy={...spec,...(spec.pts?{pts:spec.pts.map(p=>p.slice())}:{})};
      if(existing)Object.assign(existing,copy);else m.features.push(copy);
    }
    // The endpoint is deliberately reserved. Neither it nor the boss clearing
    // inherits incidental enemies from a pre-existing world spawn list.
    m.foes=m.foes.filter(f=>f.iceMoth||![arena,endpoint].some(a=>Math.hypot(f.x-a.x,f.y-a.y)<=a.r+5));
    if(!m.foes.some(f=>f.iceMoth))m.foes.push({k:'icemoth',x:arena.x,y:arena.y-3,iceMoth:true});
  }
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  async function prepare(){
    if(loading)return loading;
    loading=(async()=>{
      for(const [dir,name]of [['d','south'],['e','east'],['u','north']]){
        const source=new Image();source.src=BASE+name+'-packed.png?v='+VERSION;await source.decode();
        frames[dir]=Array.from({length:6},(_,row)=>Array.from({length:6},(_,col)=>{
          const c=canvas(CELL,HEIGHT);c.getContext('2d').drawImage(source,col*CELL,row*HEIGHT,CELL,HEIGHT,0,0,CELL,HEIGHT);c.pixelLocked=true;return c;
        }));
      }
      frames.w=frames.e.map(row=>row.map(frame=>{const c=canvas(CELL,HEIGHT),g=c.getContext('2d');g.translate(CELL,0);g.scale(-1,1);g.drawImage(frame,0,0);c.pixelLocked=true;return c;}));
      for(const dir of ['d','e','u','w']){
        const key='icemoth_idle_'+dir,c=canvas(CELL*6,HEIGHT),g=c.getContext('2d');
        frames[dir][0].forEach((frame,i)=>g.drawImage(frame,i*CELL,0));c.pixelLocked=true;
        animalSheets[key]=c;SPR[key]=[0,0,CELL,HEIGHT,6,key];
      }
      const source=new Image();source.src=BASE+'projectiles-packed.png?v='+VERSION;await source.decode();
      for(let row=0;row<4;row++)effectsArt[row]=Array.from({length:6},(_,col)=>{
        const c=canvas(FX,FX);c.getContext('2d').drawImage(source,col*FX,row*FX,FX,FX,0,0,FX,FX);c.pixelLocked=true;return c;
      });
      ready=true;
    })();return loading;
  }
  function reset(){shots.length=0;bursts.length=0;map=MAPID;}
  function defeated(){reset();if(defeatedAlready())return;houseLootTaken.add(DEFEATED);saveGame();}
  function enter(f,state){f.st=state;f.t=0;f.hit=0;}
  function tell(f,target){
    f.mothSequence=(f.mothSequence||0)+1;f.mothAttack=f.mothSequence%2?'gust':'shards';
    f.mothAim={x:target.x,y:target.y,dragon:!!target.dragon};
    face(f,target.x-f.x,target.y-f.y);enter(f,'wind');beginEnemyWindup(f);
  }
  function launch(f){
    const aim=f.mothAim,angle=Math.atan2(aim.y-f.y,aim.x-f.x),type=f.mothAttack;
    const cast={playerHit:false,dragonHit:false,blockQueued:!!f.glassParryQueued},speed=type==='gust'?110:150;
    f.glassParryQueued=false;
    const z={d:26,u:42,e:34,w:34}[direction(f)],distance=Math.hypot(aim.x-f.x,aim.y-f.y);
    for(const offset of type==='gust'?[0]:[-.28,0,.28]){
      const a=angle+offset;
      shots.push({owner:f,cast,type,x:f.x+Math.cos(a)*22,y:f.y+Math.sin(a)*22,
        vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,speed,angle:a,z,startZ:z,endZ:aim.dragon?14:10,distance:Math.max(50,distance-22),t:0,unblockable:!!f.unblockableAttack});
    }
  }
  function step(f,dt){
    if(map!==MAPID)reset();
    if(f.st==='dead'||!ready||!f._thinking||f.hold>0||paused())return;
    if(arenaLock?.id!==arena.id){f.st='idle';return;}
    if(!seenFoe.icemoth)seenFoe.icemoth=++seenCount;
    f.hurt=Math.max(0,(f.hurt||0)-dt);f.mothCool=Math.max(0,(f.mothCool??1.2)-dt);
    if(f.glassBlockHold>0){f.glassBlockHold=Math.max(0,f.glassBlockHold-dt);return;}
    if(f.st==='wind'){
      if(!f.mothAttack||!f.mothAim){tell(f,targetFor(f));return;}
      if(f.t>=windTime(f))enter(f,'swing');return;
    }
    if(f.st==='swing'){
      if(!f.hit&&f.t>=.12){f.hit=1;launch(f);}
      if(f.t>=.78){finishGlassShieldParry(f);enter(f,'idle');f.mothCool=1.7;f.mothAttack=null;f.unblockableAttack=false;}
      return;
    }
    const target=targetFor(f),dx=target.x-f.x,dy=target.y-f.y,d=Math.hypot(dx,dy)||1;
    face(f,dx,dy);
    if(f.mothCool<=0&&d<=310){tell(f,target);return;}
    // Hover into range, then weave laterally. Shared navigation keeps even
    // this flying enemy inside the arena and away from the reserved clearing.
    const radial=d>150?1:d<92?-.7:0,side=f.mothSequence%2?1:-1;
    const vx=dx/d*radial-dy/d*.45*side,vy=dy/d*radial+dx/d*.45*side;
    moveCombatActor(f,vx*FOE.icemoth.speed*dt,vy*FOE.icemoth.speed*dt,true,0);
    if(f.st!=='walk')enter(f,'walk');
  }
  function segmentDistance(x,y,nx,ny,px,py){
    const dx=nx-x,dy=ny-y,t=Math.max(0,Math.min(1,((px-x)*dx+(py-y)*dy)/(dx*dx+dy*dy||1)));
    return Math.hypot(px-x-dx*t,py-y-dy*t);
  }
  function effects(dt){
    if(map!==MAPID||MAPID!=='world'||foesHeld||arenaLock?.id!==arena.id){reset();return;}
    if(paused())return;
    for(let i=bursts.length-1;i>=0;i--){bursts[i].t+=dt;if(bursts[i].t>=.54)bursts.splice(i,1);}
    for(let i=shots.length-1;i>=0;i--){
      const s=shots[i];if(s.owner.st==='dead'){shots.splice(i,1);continue;}
      s.t+=dt;s.z=s.startZ+(s.endZ-s.startZ)*Math.min(1,s.t*s.speed/s.distance);
      const radius=s.type==='gust'?12+Math.min(8,s.t*7):7;
      const count=Math.max(1,Math.ceil(s.speed*dt/4));let end=false;
      for(let n=0;n<count&&!end;n++){
        const x=s.x,y=s.y;s.x+=s.vx*dt/count;s.y+=s.vy*dt/count;
        const outside=Math.hypot(s.x-(arena.x*TS+8),s.y-(arena.y*TS+8))>arena.r*TS-8;
        if(outside||isSolid(s.x,s.y)){end=true;break;}
        if(!s.cast.playerHit&&segmentDistance(x,y,s.x,s.y,P.x,P.y)<radius+6){
          s.cast.playerHit=true;
          if(!mounted&&!s.unblockable&&(s.cast.blockQueued||glassShieldActive())){
            glassShieldPulse=.42;glassGifStart=tAcc;globalThis.window?.EmberSfx?.block();
          }else hurtPlayer(2);
          end=true;
        }
        else if(!mounted&&!s.cast.dragonHit&&dragonCombatHere()&&dragon.on&&!dragon.down&&segmentDistance(x,y,s.x,s.y,dragon.x,dragon.y)<radius+12){s.cast.dragonHit=true;hurtDragon(2);end=true;}
      }
      if(end||s.t>=3){bursts.push({type:s.type,x:s.x,y:s.y,z:s.z,angle:s.angle,t:0});shots.splice(i,1);}
    }
  }
  function pose(f){
    let row=0,index=0;
    if(f.st==='dead'){row=5;index=Math.min(5,Math.floor(f.t/1.2*6));}
    else if(f.st==='wind'||f.st==='swing'){
      row=f.mothAttack==='shards'?3:2;
      index=f.st==='wind'?Math.min(2,Math.floor(f.t/windTime(f)*3)):Math.min(5,3+Math.floor(f.t/.78*3));
    }else if(f.hurt>0){row=4;index=Math.max(0,Math.min(5,Math.floor((.35-f.hurt)/.35*6)));}
    else{row=f.st==='walk'?1:0;index=Math.floor(f.t*(row?8:5))%6;}
    return frames[direction(f)]?.[row][index];
  }
  function addEffects(list){
    if(!ready||foesHeld||map!==MAPID)return;
    for(const f of foes)if(f.kind==='icemoth'&&f.st==='wind'&&f.mothAim&&arenaLock?.id===arena.id)list.push({mothTell:f,x:f.x,y:f.y,sy:-1e7});
    for(const s of shots)list.push({mothShot:s,x:s.x,y:s.y});
    for(const b of bursts)list.push({mothBurst:b,x:b.x,y:b.y});
  }
  function draw(o){
    if(!o.iceMoth&&!o.mothShot&&!o.mothBurst&&!o.mothTell)return false;
    if(!ready)return true;
    ctx.save();ctx.imageSmoothingEnabled=false;
    if(o.iceMoth){
      const f=o.iceMoth;
      if(f.st==='dead'&&f.t>=2.5){ctx.restore();return true;}
      const lift=f.st==='dead'?Math.max(0,10*(1-f.t/.65)):10+Math.sin(f.t*4)*1.5;
      if(f.st==='dead')ctx.globalAlpha=Math.min(1,Math.max(0,(2.5-f.t)/.6));
      ctx.fillStyle='rgba(20,42,70,.2)';ctx.beginPath();ctx.ellipse(f.x,f.y-2,18,5,0,0,Math.PI*2);ctx.fill();
      drawEnemyCombatFrame(f,pose(f),Math.round(f.x-CELL/2),Math.round(f.y-FOOT-lift),CELL,HEIGHT);
      if(f.st!=='dead'){ctx.fillStyle='#182c40';ctx.fillRect(f.x-31,f.y-91,62,5);ctx.fillStyle='#b9a6ff';ctx.fillRect(f.x-30,f.y-90,60*Math.max(0,f.hp/enemyMaxHp(f.kind,f.x)),3);}
    }else if(o.mothTell){
      const f=o.mothTell,a=f.mothAim,angle=Math.atan2(a.y-f.y,a.x-f.x),length=Math.min(260,Math.hypot(a.x-f.x,a.y-f.y));
      ctx.strokeStyle='#a9edff';ctx.globalAlpha=.5;ctx.lineWidth=1;ctx.setLineDash([3,5]);
      for(const offset of f.mothAttack==='shards'?[-.28,0,.28]:[0]){ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(angle+offset)*length,f.y+Math.sin(angle+offset)*length);ctx.stroke();}
    }else{
      const s=o.mothShot||o.mothBurst,impact=!!o.mothBurst,row=(s.type==='gust'?0:2)+(impact?1:0);
      const index=impact?Math.min(5,Math.floor(s.t/.54*6)):Math.floor(s.t*12)%6;
      const scale=s.type==='gust'?(impact?1:.8+Math.min(.3,s.t*.25)):.65,size=FX*scale;
      ctx.translate(Math.round(s.x),Math.round(s.y-s.z));ctx.rotate(s.angle);
      drawPixelImage(ctx,effectsArt[row][index],0,0,FX,FX,-Math.round(size/2),-Math.round(size/2),Math.round(size),Math.round(size));
    }
    ctx.restore();return true;
  }
  FOE.icemoth={hp:70,speed:48,sight:999,reach:180,ring:140,dmg:2,swingT:.78,hitAt:.12,rest:1.7,groupRest:1,wind:1};
  FOE_ART.icemoth='icemoth';WORTH.icemoth=100;
  return {arena,endpoint,routes,installWorld,prepare,reset,defeated,defeatedAlready,step,effects,pose,addEffects,draw,
    travelPlace:()=>({name:'Ice Moth — Winter Arena',kind:'Boss',map:'world',x:2346,y:182}),
    inspect:()=>({ready,shots:shots.map(({owner,cast,...s})=>({...s,playerHit:cast.playerHit,dragonHit:cast.dragonHit})),bursts:bursts.map(b=>({...b}))})};
})();
