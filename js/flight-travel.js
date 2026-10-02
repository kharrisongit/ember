/* Only actual visits unlock a landing. Flight owns its short animation and
   leaves the last grounded save intact until both riders have landed. */
let flightVisits={},flightTravel=null;
function restoreFlightTravel(saved,known=[]){
  flightTravel=null;flightVisits={};
  for(const [name,p]of Object.entries(saved||{}))if(ATLAS_LOCATIONS.some(a=>a[0]===name)&&
    Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[1]>=0&&p[0]<W.maps.world.w*TS&&p[1]<W.maps.world.h*TS)flightVisits[name]=p.slice();
  // Existing saves already record real visits for Aurelius's conversations.
  // Reuse only those visits; seeing a place on the map does not qualify.
  const world=W.maps.world;
  for(const key of known){
    const match=typeof key==='string'&&key.match(/^(?:visited:(.+)|place:(.+):(?:journey|victory))$/);
    const name=match&&atlasCanonical(match[1]||match[2]);if(!name||flightVisits[name])continue;
    const area=world.features.find(f=>f.kind==='area'&&atlasCanonical(f.place||f.label)===name);
    const landmark=world.features.find(f=>f.kind==='landmark'&&atlasCanonical(f.place||f.label)===name);
    const entry=area&&(world.doors||[]).find(d=>d.x>=area.x0&&d.x<=area.x1&&d.y>=area.y0&&d.y<=area.y1);
    const point=entry?[entry.x*TS+8,entry.y*TS+40]:area?[(area.x0+area.x1)*TS/2,(area.y0+area.y1)*TS/2]:landmark?[landmark.x*TS+8,landmark.y*TS+32]:null;
    if(point)flightVisits[name]=point;
  }
}
function flightPlaceAt(x,y){
  const tx=x/TS,ty=y/TS;
  const places=features.filter(f=>!f.hidden&&f.kind==='area'&&tx>=f.x0&&tx<=f.x1&&ty>=f.y0&&ty<=f.y1)
    .sort((a,b)=>(a.x1-a.x0)*(a.y1-a.y0)-(b.x1-b.x0)*(b.y1-b.y0));
  const landmark=features.find(f=>f.kind==='landmark'&&Math.abs(tx-f.x)<=(f.r||10)&&Math.abs(ty-f.y)<=(f.r||10)&&atlasCanonical(f.label));
  if(landmark)return atlasCanonical(landmark.label);
  for(const f of places){const name=atlasCanonical(f.place||f.label);if(name)return name;}
  const road=areaUnder(x,y);
  if(!road)return null;
  const main=ATLAS_CONNECTIONS[1];
  for(let i=1;i<main.length-1;i++)if(/^Route /.test(main[i])&&road.includes(main[i-1])&&road.includes(main[i+1]))return main[i];
  return atlasCanonical(road);
}
function flightGroundClear(x,y){
  const previousMounted=mounted,previousAir=dragon.air;
  mounted=false;dragon.air=false;
  try{return canStand(x,y)&&dragonCanStand(x,y)&&
    !features.some(f=>f.kind==='arena'&&Math.hypot(x/TS-f.x,y/TS-f.y)<(f.r||5)+3)&&
    !(MD.doors||[]).some(d=>{const r=doorRect(d);return x>=r.x-12&&x<=r.x+r.w+12&&y>=r.y-12&&y<=r.y+r.h+20;});}
  finally{mounted=previousMounted;dragon.air=previousAir;}
}
function rememberFlightVisit(){
  if(!gameplayStarted||mode!=='play'||editing||flightTravel||ride||sceneHold()||fadeDir||doorMotion)return;
  let name,point;
  if(MAPID==='world'){
    name=flightPlaceAt(P.x,P.y);if(!name||flightVisits[name]||!flightGroundClear(P.x,P.y))return;
    point=[P.x,P.y];
  }else{
    name=atlasCurrentArea();if(!name||flightVisits[name])return;
    const queue=[MAPID],seen=new Set();let exit;
    while(queue.length&&!exit){const id=queue.shift();if(seen.has(id))continue;seen.add(id);
      for(const d of W.maps[id]?.doors||[])if(d.to==='world'){exit=d;break;}else if(!seen.has(d.to))queue.push(d.to);}
    if(!exit)return;point=[exit.tx*TS+8,exit.ty*TS+TS];
  }
  flightVisits[name]=point;saveGame();
}
function flightUnavailable(name){
  if(!flightVisits[name])return 'Visit this place once to fly here.';
  if(MAPID!=='world')return 'Step outside to take flight.';
  if(!hasDragon()||!dragonHere()||!dragonIntroDone||!window.EmberRiding?.unlocked())return 'Aurelius must be with you and ready to carry you.';
  if(dragonTooHurtToFly()||dragon.knockdown>0)return 'Aurelius needs to recover before flying.';
  if(flightTravel||sceneHold()||sayNpc||ask||doorMotion||fadeDir||fade>0||revealing||ride||fishing||dying()||editing||
    arenaLock&&arenaT>0||window.EmberRiding?.holding()||window.EmberArenaEntry?.holding())return 'Finish the current encounter before flying.';
  const point=flightVisits[name];
  if(Object.values(JOURNEY_GATES).some(g=>!g.open()&&!g.inside(P.x,P.y)&&g.inside(...point)))return 'Finish the story on this side of the road first.';
  return '';
}
function flightLanding(name){
  const point=flightVisits[name];if(!point)return null;
  for(let radius=0;radius<=160;radius+=8)for(let i=0;i<(radius?16:1);i++){
    const x=point[0]+Math.cos(i*Math.PI/8)*radius,y=point[1]+Math.sin(i*Math.PI/8)*radius;
    if(flightGroundClear(x,y))return [x,y];
  }
  return null;
}
function refreshFlightOption(){
  const button=document.getElementById('atlasFly'),hint=document.getElementById('atlasFlyHint');if(!button||!hint)return;
  const visible=hasDragon();
  button.parentNode.style.display=visible?'':'none';
  button.disabled=!visible;
  if(!visible){hint.textContent='';button.onclick=null;return;}
  const name=ATLAS_LOCATIONS[atlasPick]?.[0],reason=flightUnavailable(name);
  button.disabled=!!reason;button.textContent='Fly Here';button.setAttribute('aria-label','Fly to '+atlasDisplayName(name));
  hint.textContent=reason||'Aurelius will carry you there.';
  button.onclick=()=>beginFlightTravel(name);
}
function beginFlightTravel(name){
  const reason=flightUnavailable(name);if(reason){toast(reason);return false;}
  const destination=flightLanding(name);if(!destination){toast('There is no clear landing spot here yet.');return false;}
  const origin=[P.x,P.y],alreadyMounted=mounted;
  atlasReturn='game';closeAtlas();setOvl(null);setBag(false);clearPadInputs();running=false;P.act=null;
  saveGame();
  if(!alreadyMounted&&setMounted(true,true)===false)return false;
  hunt=null;breath=null;claw=null;dragonFacingLocked=false;dragon.tr=null;dragon.air=false;
  flightTravel={name,origin,destination,phase:alreadyMounted?'takeoff':'mount',time:0,lift:0,camera:{...cam}};
  faceCorinAt(P.x-32,P.y);dragon.dir='w';P.moving=false;
  const takeoff=()=>{if(!flightTravel)return;flightTravel.phase='takeoff';flightTravel.time=0;startTransition('up',true);};
  if(alreadyMounted)takeoff();
  else showReveal('corinride_'+(smithUpgrade?'armor_':'sword_')+'idle_s','CORIN TAKES THE REINS',undefined,true,takeoff);
  return true;
}
function stepFlightTravel(dt){
  const f=flightTravel;if(!f)return;
  f.time+=dt;P.t+=dt;dragon.t+=dt;P.act=null;Object.assign(cam,f.camera);
  if(f.phase==='mount'){if(f.time>=1.4&&revealing)hideReveal();}
  else if(f.phase==='takeoff'){
    f.lift=Math.min(80,f.lift+80*dt);stepTransition(dt);
    if(!dragon.tr&&f.lift>=80){f.phase='out';P.moving=true;}
  }else if(f.phase==='out'){
    P.x-=260*dt;
    if(P.x<f.camera.x-96){P.moving=false;f.phase='fadeOut';}
  }else if(f.phase==='fadeOut'){
    fade=Math.min(1,fade+dt*2.5);
    if(fade===1){
      [P.x,P.y]=f.destination;followCam();clampCam();f.camera={...cam};
      P.x=f.camera.x+VW/f.camera.z+96;faceCorinAt(P.x-32,P.y);dragon.dir='w';dragon.air=true;
      chunks.clear();f.phase='fadeIn';
    }
  }else if(f.phase==='fadeIn'){
    fade=Math.max(0,fade-dt*2.5);if(!fade){f.phase='in';P.moving=true;}
  }else if(f.phase==='in'){
    P.x=Math.max(f.destination[0],P.x-260*dt);
    if(P.x===f.destination[0]){P.moving=false;f.phase='descend';}
  }else if(f.phase==='descend'){
    f.lift=Math.max(0,f.lift-80*dt);
    // Landing art contains its own dust: play it only after reaching the ground.
    if(!f.lift){dragon.air=false;f.phase='land';startTransition('down',false);}
  }else if(f.phase==='land'){
    stepTransition(dt);
    if(!dragon.tr&&!f.lift){
      dragon.air=false;dragon.moving=false;dragon.placed=MAPID;P.moving=false;
      flightTravel=null;clearPadInputs();running=false;arriveT=.35;fade=0;fadeDir=0;
      followCam();clampCam();checkArea();saveGame();toast('Arrived at '+f.name+'.');
    }
  }
  dragon.x=P.x;dragon.y=P.y;dragon.moving=P.moving;
}
