/* A battle begins only after its entrance has closed and the player is ready. */
(function(){
  'use strict';
  let map=null,population=null,populationSize=-1,states=new Map(),owners=new WeakMap(),pending=null,engaged=null,cameraZoom=null,finalPending=false;
  const popup=document.createElement('section');
  popup.id='arenaReady';popup.setAttribute('role','dialog');popup.hidden=true;
  function paintReady(final=false){
    window.EmberEncounterCard.paint(popup,{title:'It’s time to fight!',kicker:final?'THE FINAL BATTLE':'ENCOUNTER READY',
      detail:final?'Halvard has called his dragon. Stand together, Corin and Aurelius.':'Your foes are waiting. The next move is yours.',
      action:final?'Defeat the king and his dragon.':'Defeat every foe to open the way.',key:'',kind:'battle'});
  }
  paintReady();
  document.body.appendChild(popup);
  const living=f=>f.st!=='dead'&&!f.ally&&!f.huntingArena;
  const holding=()=>finalPending||!!pending&&pending.phase!=='tutorial';
  const tutorial=a=>MAPID==='world'&&((a.id===208&&!window.EmberRiding?.capture().swordDone)||(a.id===11&&!window.EmberRiding?.capture().done));
  const rings=()=>{
    const all=MD?.templeExpanded?expandedTempleArenas():currentArenaFeatures().filter(a=>!['hare','boar','deer','fox','bird'].includes(a.encounter));
    return arenaLock&&!all.some(a=>a.id===arenaLock.id)?[...all,arenaLock]:all;
  };
  function finishView(){
    popup.hidden=true;
    if(cameraZoom!==null){
      restoreCameraTarget();
      cam.z=cameraZoom;cameraZoom=null;camFree=false;followCam();
    }
  }
  function reset(){
    finishView();finalPending=false;pending=null;engaged=null;states=new Map();owners=new WeakMap();map=MAPID;population=null;populationSize=-1;
    window.EmberBattleMusic?.stop();
  }
  function readyFinalBattle(){
    if(MAPID!=='cinderhold'||wonAll||lastFight||finalPending)return false;
    reset();finalPending=true;paintReady(true);popup.hidden=false;
    clearPadInputs();for(const k in keys)keys[k]=0;running=false;P.act=null;P.moving=false;
    hunt=null;breath=null;claw=null;setOvl(null);window.EmberEncounterCard.layout();
    return true;
  }
  function ensure(){if(map!==MAPID)reset();}
  function state(a){
    let s=states.get(a.id);
    if(!s){s={ring:a,phase:'waiting',side:null,foes:[],paths:new Map(),retry:0};states.set(a.id,s);}
    return s;
  }
  function bounds(a){
    if(a.templeRoom){const [l,t,r,b]=a.templeRoom;return {x:(l+r)/2,y:(t+b)/2,rx:(r-l)/2-20,ry:(b-t)/2-20};}
    return {x:a.x*TS+TS/2,y:a.y*TS+TS/2,rx:((a.r||6.3)-1.5)*TS,ry:((a.r||6.3)-1.5)*TS};
  }
  function projectRoute(route,x,y){
    let best=null,along=0;
    for(const [a,b] of route.legs){
      const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(!length)continue;
      const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(length*length)));
      const distance=Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);
      if(!best||distance<best.distance)best={distance,at:along+t*length};
      along+=length;
    }
    return best;
  }
  function approachRoute(a){
    if(a.templeRoom)return null;
    let best=null;
    for(const f of features){
      if(f.kind!=='route')continue;
      const route={legs:routeLegs(f)},p=projectRoute(route,a.x,a.y);
      if(p&&p.distance<(a.r||6.3)&&(!best||p.distance<best.distance))best={...route,...p};
    }
    return best;
  }
  function routePoint(route,at){
    for(const [a,b] of route.legs){
      const length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!length)continue;
      if(at<=length){const t=Math.max(0,at)/length;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
      at-=length;
    }
    return route.legs.at(-1)[1];
  }
  function sideOf(a,s){
    const b=bounds(a),dx=(P.x-b.x)/Math.max(1,b.rx),dy=(P.y-b.y)/Math.max(1,b.ry);
    // Follow the actual avenue around bends while the player is still outside
    // the arena. Nearby arrivals (including flying) use their physical side.
    if(s.route&&Math.hypot(P.x-b.x,P.y-b.y)>((a.r||6.3)+2.5)*TS){
      const p=projectRoute(s.route,(P.x-TS/2)/TS,(P.y-TS/2)/TS),sign=Math.sign(p.at-s.route.at);
      if(sign){
        const [x,y]=routePoint(s.route,s.route.at+sign*((a.r||6.3)+3)),rx=x-a.x,ry=y-a.y;
        if(Math.hypot(rx,ry)>.1)return Math.abs(rx)>Math.abs(ry)?[Math.sign(rx),0]:[0,Math.sign(ry)];
      }
    }
    return Math.abs(dx)>Math.abs(dy)?[Math.sign(dx)||1,0]:[0,Math.sign(dy)||1];
  }
  function faceEntrance(s,f){
    const [dx,dy]=s.side.split(',').map(Number);
    f.dir=dy<0?'u':dy>0?'d':'s';f.flip=dx<0;
  }
  function belongs(a,f){
    return a.templeRoom?expandedTempleFoeInArena(a,f):Math.hypot((f.hx??f.x)/TS-a.x,(f.hy??f.y)/TS-a.y)<a.r+5;
  }
  function register(force=false){
    ensure();
    // Wildlife upkeep may replace the array while retaining every combatant.
    // Only map loads/spawnFoes reset an encounter; array identity never does.
    if(!force&&population===foes&&populationSize===foes.length)return;
    population=foes;populationSize=foes.length;
    const all=rings(),present=new Set(foes);
    for(const s of states.values()){
      s.foes=s.foes.filter(f=>present.has(f));
      for(const f of s.paths.keys())if(!present.has(f))s.paths.delete(f);
    }
    for(const f of foes){
      if(!living(f)||owners.has(f))continue;
      const a=all.filter(a=>belongs(a,f)).sort((a,b)=>Math.hypot(f.x/TS-a.x,f.y/TS-a.y)-Math.hypot(f.x/TS-b.x,f.y/TS-b.y))[0];
      if(!a){owners.set(f,null);continue;}
      const s=state(a);s.foes.push(f);owners.set(f,s);s.dirty=true;
    }
  }
  function visible(f){return f.x>cam.x-48&&f.x<cam.x+VW/cam.z+48&&f.y>cam.y&&f.y<cam.y+VH/cam.z+80;}
  function nearby(s){
    const b=bounds(s.ring),reach=Math.max(240,Math.min(480,Math.max(VW,VH)/cam.z));
    return Math.abs(P.x-b.x)<b.rx+reach&&Math.abs(P.y-b.y)<b.ry+reach;
  }
  function stage(s){
    if(s.phase!=='waiting'||tutorial(s.ring)||(arenaLock&&arenaLock.id!==s.ring.id)||s.retry>tAcc)return;
    if(s.route===undefined)s.route=approachRoute(s.ring);
    const a=s.ring,b=bounds(a),side=sideOf(a,s),key=side.join(',');
    if(s.side===key&&!s.dirty)return;
    s.side=key;s.dirty=false;s.paths.clear();
    const [dx,dy]=side,depth=Math.min((dx?b.rx:b.ry)*.68,(dx?b.rx:b.ry)-12),slots=[],seen=new Set();
    // Line up at the opposite edge first, with additional ranks inward when
    // needed. Keep the entire formation within the arena's clear floor.
    for(let row=0;row<5;row++)for(const across of [0,-32,32,-64,64,-96,96]){
      const along=Math.max(12,depth-row*28),x=b.x-dx*along-dy*across,y=b.y-dy*along+dx*across,key=x+','+y;
      const inside=a.templeRoom?expandedTempleArenaContains(a,x,y,24):Math.hypot(x-b.x,y-b.y)<Math.min(b.rx,b.ry);
      if(!seen.has(key)&&inside&&canStand(x,y)&&Math.hypot(x-P.x,y-16-P.y)>=76){slots.push([x,y]);seen.add(key);}
    }
    if(!slots.length){s.dirty=true;s.retry=tAcc+.5;return;}
    const used=[];
    for(const f of s.foes.filter(living)){
      if(f.storyKnight||f.trial||(lastFight&&(f.kind==='kdragon'||f.kind==='lich')))continue; // His authored approach and surrender own his position.
      let target=null,path=null;
      for(const slot of slots){
        if(used.includes(slot))continue;
        if(!visible(f)){target=slot;break;}
        const route=maddockWalkPath(f,slot,canStand);
        if(route){target=slot;path=route;break;}
      }
      if(!target){s.dirty=true;s.retry=tAcc+.5;continue;}
      used.push(target);
      if(path)s.paths.set(f,path);
      else{[f.x,f.y]=target;f.hx=f.x;f.hy=f.y;}
      f.st='idle';f.t=0;f.retreat=0;f._hunt=null;
      faceEntrance(s,f);
    }
  }
  function prepare(a){
    register(true);
    // Register protection everywhere, but only arrange a nearby encounter.
    // A door exit must not run collision searches for every arena in the realm.
    for(const s of states.values())if(a?s.ring.id===a.id:nearby(s))stage(s);
  }
  function protectedEnemy(f){
    if(!living(f))return false;
    const s=owners.get(f);
    return !!s&&s.phase!=='active';
  }
  function gatherCompanion(s){
    s.companion=null;
    if(!dragonHere()||!dragon.on||mounted)return;
    const a=s.ring,b=bounds(a);
    const inside=(x,y)=>a.templeRoom?expandedTempleArenaContains(a,x,y,20):Math.hypot(x-b.x,y-b.y)<Math.min(b.rx,b.ry);
    // Prefer a horizontal pair, with checked landing spots inside every entrance.
    let target=null;
    for(const dy of [0,-8,8,-16,16,-32,32,-48,48]){
      for(const dx of [40,-40,32,-32]){
        const x=P.x+dx,y=P.y+dy;
        if(inside(x,y)&&dragonCanStand(x,y)&&!s.foes.some(f=>living(f)&&Math.hypot(f.x-x,f.y-y)<28)){
          target=[x,y];break;
        }
      }
      if(target)break;
    }
    if(!target)return;
    const path=maddockWalkPath(dragon,target,dragonCanStand);
    // A short hop also gets him across a closing entrance or a blocked ground route.
    const route=path||[target];
    let distance=0,previous=[dragon.x,dragon.y];
    for(const point of route){distance+=Math.hypot(point[0]-previous[0],point[1]-previous[1]);previous=point;}
    dragon.tr=null;dragonFacingLocked=false;
    dragon.air=!path&&!dragonTooHurtToFly();
    s.companion={path:route,speed:Math.max(280,distance/.45)};
  }
  function gather(dt){
    if(!holding())return;
    dragon.t+=dt;dragon.moving=false;
    if(mounted){dragon.x=P.x;dragon.y=P.y;stepTransition(dt);return;}
    if(finalPending||!pending)return;
    const arrival=pending.companion;if(!arrival)return;
    let left=arrival.speed*dt;
    while(arrival.path.length&&left>0){
      const [x,y]=arrival.path[0],dx=x-dragon.x,dy=y-dragon.y,d=Math.hypot(dx,dy),step=Math.min(d,left);
      dragon.dir=direction4(dx,dy,dragon.dir);dragon.moving=d>0;
      if(d<=step){dragon.x=x;dragon.y=y;arrival.path.shift();}
      else{dragon.x+=dx/d*step;dragon.y+=dy/d*step;}
      left-=step;
    }
    if(!arrival.path.length){
      const b=bounds(pending.ring);
      dragon.moving=false;dragon.air=false;dragon.placed=MAPID;
      dragon.dir=direction4(b.x-dragon.x,b.y-dragon.y,dragon.dir);
      faceCorinAt(b.x,b.y);pending.companion=null;
    }
  }
  function entered(a){
    register();const s=state(a);
    if(s.phase==='active'||pending===s)return;
    paintReady();stage(s);pending=s;s.phase=window.EmberRiding?.holding()?'tutorial':'walls';
    clearPadInputs();for(const k in keys)keys[k]=0;running=false;P.moving=false;P.act=null;
    if(s.phase!=='tutorial'){hunt=null;breath=null;claw=null;setOvl(null);gatherCompanion(s);}
    if(cameraZoom===null){restoreCameraTarget();cameraZoom=cam.z;}
  }
  function activate(a){
    const s=states.get(a?.id);if(!s)return;
    s.phase='active';s.paths.clear();engaged=s;
    for(const f of s.foes.filter(living)){f.st='idle';f.t=0;f.cool=Math.max(f.cool||0,.35);}
    if(pending===s){pending=null;finishView();clearPadInputs();for(const k in keys)keys[k]=0;}
  }
  function completed(a){
    const s=states.get(a?.id);if(engaged===s)engaged=null;if(s){s.phase='waiting';s.side=null;s.dirty=true;}
    if(pending===s){pending=null;finishView();}
    window.EmberBattleMusic?.stop();
  }
  function walk(s,dt){
    for(const [f,path]of s.paths){
      let left=100*dt;
      while(path.length&&left>0){
        const [x,y]=path[0],dx=x-f.x,dy=y-f.y,d=Math.hypot(dx,dy),step=Math.min(left,d);
        f.dir=Math.abs(dx)>Math.abs(dy)?'s':dy<0?'u':'d';f.flip=dx<0;
        if(d<=step){f.x=x;f.y=y;path.shift();}else{f.x+=dx/d*step;f.y+=dy/d*step;}
        left-=step;
      }
      f.st=path.length?'walk':'idle';f.t+=dt;f.hx=f.x;f.hy=f.y;
      if(!path.length){s.paths.delete(f);faceEntrance(s,f);}
    }
  }
  function step(dt){
    if(finalPending){if(MAPID!=='cinderhold'||wonAll||deadShown||!gameplayStarted||mode!=='play')reset();return;}
    if(!gameplayStarted||mode!=='play'||foesHeld||deadShown){if(pending||engaged||map!==MAPID)reset();return;}
    register();
    if(engaged&&(!arenaLock||arenaLock.id!==engaged.ring.id))completed(engaged.ring);
    if(pending&&(!arenaLock||arenaLock.id!==pending.ring.id)){pending=null;finishView();window.EmberBattleMusic?.stop();}
    if(arenaLock&&!pending&&state(arenaLock).phase!=='active'&&!scene&&!bossScene)entered(arenaLock);
    for(const s of states.values()){
      if(s.phase==='waiting'){
        // Running past a distant arena must not launch collision/path searches.
        if(nearby(s))stage(s);
      }
      if(s.phase!=='active')walk(s,dt);
    }
    if(!pending)return;
    if(pending.phase==='tutorial'){
      if(!window.EmberRiding?.holding())activate(pending.ring);
      return;
    }
    if(pending.phase==='walls'&&arenaT>=1&&!pending.paths.size&&!pending.companion&&!scene&&!revealing&&!bossScene){
      pending.phase='prompt';popup.hidden=false;window.EmberBattleMusic?.start();
    }
  }
  function action(){
    if(finalPending){finalPending=false;finishView();clearPadInputs();for(const k in keys)keys[k]=0;if(MAPID==='cinderhold'&&!wonAll)startLastFight();return true;}
    if(!holding())return false;
    if(pending.phase==='prompt')activate(pending.ring);
    return true;
  }
  function key(e){
    if(!holding())return false;
    e.preventDefault();e.stopImmediatePropagation();
    if(!e.repeat&&['a',' ','enter'].includes(e.key.toLowerCase()))action();
    return true;
  }
  function blockPointer(e){
    if(!holding()||e.target?.closest?.('#act,#arenaReady'))return false;
    e.preventDefault();e.stopImmediatePropagation();return true;
  }
  function frameCamera(){
    if(!pending||bossScene||hatchCamera)return;
    const cast=[P,...pending.foes.filter(living)];
    if(dragonHere())cast.push(dragon);
    const l=Math.min(...cast.map(f=>f.x-40)),r=Math.max(...cast.map(f=>f.x+40));
    const t=Math.min(...cast.map(f=>f.y-80)),b=Math.max(...cast.map(f=>f.y+8));
    // The full-screen card no longer needs an entrance-dependent top margin.
    const top=16,bottom=16,usable=Math.max(40,VH-top-bottom);
    const normal=cameraZoom||playZoom();
    cam.z=Math.max(.1,Math.min(normal,(VW-24)/(r-l),usable/(b-t)));
    cam.x=(l+r)/2-VW/cam.z/2;
    cam.y=(t+b)/2-(top+usable/2)/cam.z;
  }
  window.EmberArenaEntry={readyFinalBattle,prepare,entered,activate,completed,reset,step,gather,holding,protected:protectedEnemy,action,key,blockPointer,frameCamera};
})();
