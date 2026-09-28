/* A battle begins only after its entrance has closed and the player is ready. */
(function(){
  'use strict';
  let map=null,population=null,populationSize=-1,states=new Map(),owners=new WeakMap(),pending=null,engaged=null,cameraZoom=null;
  const popup=document.createElement('button');
  popup.id='arenaReady';popup.type='button';popup.hidden=true;
  popup.setAttribute('aria-label','It’s time to fight! Press A to begin');
  popup.innerHTML='<span class="battle-kicker">BATTLE READY</span><strong>It’s time to fight!</strong><span class="battle-confirm">Press <b>A</b> to begin</span>';
  document.body.appendChild(popup);
  const living=f=>f.st!=='dead'&&!f.ally&&!f.huntingArena;
  const holding=()=>!!pending&&pending.phase!=='tutorial';
  const tutorial=a=>MAPID==='world'&&((a.id===208&&!window.EmberRiding?.capture().swordDone)||(a.id===11&&!window.EmberRiding?.capture().done));
  const rings=()=>{
    const all=MD?.templeExpanded?expandedTempleArenas():currentArenaFeatures().filter(a=>!['hare','boar','deer','fox','bird'].includes(a.encounter));
    return arenaLock&&!all.some(a=>a.id===arenaLock.id)?[...all,arenaLock]:all;
  };
  function finishView(){
    popup.hidden=true;
    if(cameraZoom!==null){cam.z=cameraZoom;cameraZoom=null;camFree=false;followCam();}
  }
  function reset(){
    finishView();pending=null;engaged=null;states=new Map();owners=new WeakMap();map=MAPID;population=null;populationSize=-1;
    window.EmberBattleMusic?.stop();
  }
  function ensure(){if(map!==MAPID)reset();}
  function state(a){
    let s=states.get(a.id);
    if(!s){s={ring:a,phase:'waiting',side:null,foes:[],paths:new Map(),retry:0};states.set(a.id,s);}
    return s;
  }
  function bounds(a){
    if(a.templeRoom){const [l,t,r,b]=a.templeRoom;return {x:(l+r)/2,y:(t+b)/2,rx:(r-l)/2-20,ry:(b-t)/2-20};}
    return {x:a.x*TS+TS/2,y:a.y*TS+TS/2,rx:(a.r-1.5)*TS,ry:(a.r-1.5)*TS};
  }
  function sideOf(a){
    const b=bounds(a),dx=(P.x-b.x)/Math.max(1,b.rx),dy=(P.y-b.y)/Math.max(1,b.ry);
    return Math.abs(dx)>Math.abs(dy)?[Math.sign(dx)||1,0]:[0,Math.sign(dy)||1];
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
  function stage(s){
    if(s.phase!=='waiting'||tutorial(s.ring)||(arenaLock&&arenaLock.id!==s.ring.id)||s.retry>tAcc)return;
    const a=s.ring,b=bounds(a),side=sideOf(a),key=side.join(',');
    if(s.side===key&&!s.dirty)return;
    s.side=key;s.dirty=false;s.paths.clear();
    const [dx,dy]=side,depth=Math.min(24,(dx?b.rx:b.ry)*.22),slots=[];
    // Compact rows just beyond the center, never on the far leash boundary.
    for(let row=0;row<5;row++)for(const across of [0,-32,32,-64,64,-96,96]){
      const along=depth+row*24,x=b.x-dx*along-dy*across,y=b.y-dy*along+dx*across;
      const inside=a.templeRoom?expandedTempleArenaContains(a,x,y,24):Math.hypot(x-b.x,y-b.y)<Math.min(b.rx,b.ry);
      if(inside&&canStand(x,y)&&Math.hypot(x-P.x,y-16-P.y)>=76)slots.push([x,y]);
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
      if(!target)continue;
      used.push(target);
      if(path)s.paths.set(f,path);
      else{[f.x,f.y]=target;f.hx=f.x;f.hy=f.y;}
      f.st='idle';f.t=0;f.retreat=0;f._hunt=null;
      f.dir=dy<0?'u':dy>0?'d':'s';f.flip=dx<0;
    }
  }
  function prepare(a){register(true);for(const s of states.values())if(!a||s.ring.id===a.id)stage(s);}
  function protectedEnemy(f){
    if(!living(f))return false;
    const s=owners.get(f);
    return !!s&&s.phase!=='active';
  }
  function entered(a){
    register();const s=state(a);
    if(s.phase==='active'||pending===s)return;
    stage(s);pending=s;s.phase=window.EmberRiding?.holding()?'tutorial':'walls';
    clearPadInputs();for(const k in keys)keys[k]=0;running=false;P.moving=false;P.act=null;
    if(s.phase!=='tutorial'){hunt=null;breath=null;claw=null;setOvl(null);}
    if(cameraZoom===null)cameraZoom=cam.z;
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
      if(!path.length)s.paths.delete(f);
    }
  }
  function step(dt){
    if(!gameplayStarted||mode!=='play'||foesHeld||deadShown){if(pending||engaged||map!==MAPID)reset();return;}
    register();
    if(engaged&&(!arenaLock||arenaLock.id!==engaged.ring.id))completed(engaged.ring);
    if(pending&&(!arenaLock||arenaLock.id!==pending.ring.id)){pending=null;finishView();window.EmberBattleMusic?.stop();}
    if(arenaLock&&!pending&&state(arenaLock).phase!=='active'&&!scene&&!bossScene)entered(arenaLock);
    for(const s of states.values()){
      if(s.phase==='waiting'){
        // Running past a distant arena must not launch collision/path searches.
        const b=bounds(s.ring),reach=Math.max(240,Math.min(480,Math.max(VW,VH)/cam.z));
        if(Math.abs(P.x-b.x)<b.rx+reach&&Math.abs(P.y-b.y)<b.ry+reach)stage(s);
      }
      if(s.phase!=='active')walk(s,dt);
    }
    if(!pending)return;
    if(pending.phase==='tutorial'){
      if(!window.EmberRiding?.holding())activate(pending.ring);
      return;
    }
    if(pending.phase==='walls'&&arenaT>=1&&!pending.paths.size&&!scene&&!revealing&&!bossScene){
      pending.phase='prompt';popup.hidden=false;window.EmberBattleMusic?.start();
    }
  }
  function action(){
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
    if(window.EmberRiding?.holding()&&dragonHere())cast.push(dragon);
    const l=Math.min(...cast.map(f=>f.x-48)),r=Math.max(...cast.map(f=>f.x+48));
    const t=Math.min(...cast.map(f=>f.y-96)),b=Math.max(...cast.map(f=>f.y+16));
    // Leave the top HUD and the bottom prompt/dialogue clear on phone screens.
    const top=44,bottom=150,usable=Math.max(40,VH-top-bottom);
    cam.z=Math.min(cameraZoom||playZoom(),(VW-24)/(r-l),usable/(b-t));
    cam.x=(l+r)/2-VW/cam.z/2;cam.y=(t+b)/2-(top+usable/2)/cam.z;
  }
  popup.addEventListener('click',e=>{e.preventDefault();action();});
  window.EmberArenaEntry={prepare,entered,activate,completed,reset,step,holding,protected:protectedEnemy,action,key,blockPointer,frameCamera};
})();
