/* Shared combat navigation. AI goals, retreat and collision use the same arena
   inset; neither flight nor an old cached axis result can bypass a battle wall. */
function combatArena(actor) {
  if (typeof arenaLock === 'undefined' || !arenaLock || arenaT <= 0 || foesHeld || actor.huntingArena) return null;
  const a = arenaLock;
  if (a.templeRoom) {
    if (a.templeMap !== MAPID) return null;
    if (actor === dragon || actor.ally || actor.expandedRoom?.every((v,i)=>v===a.templeRoom[i])) return a;
    return null;
  }
  if (actor === dragon || actor.ally || actor.trial) return a;
  return Math.hypot((actor.hx??actor.x)/TS-a.x,(actor.hy??actor.y)/TS-a.y) <= a.r+3 ? a : null;
}
function combatFootprint(actor) {
  if (actor === dragon) return {w:4.5,h:5,pad:18};
  if (actor.kind === 'kdragon') return {w:30,h:34,pad:34};
  const art = SPR[(FOE_ART[actor.kind] || 'sk')+'_idle_d'];
  const w = actor.halfW ?? (art ? Math.max(6,Math.min(15,Math.round(art[2]*.22))) : 7);
  // The navigation body is the feet, not the transparent height of the sprite.
  return {w,h:8,pad:w+5};
}
function combatProject(actor, x, y, extra=0, arena=combatArena(actor)) {
  if (!arena) return {x,y};
  const pad = combatFootprint(actor).pad + extra;
  if (arena.templeRoom) {
    const [l,t,r,b]=arena.templeRoom;
    const px=Math.min(pad,(r-l)/2-2),py=Math.min(pad,(b-t)/2-2);
    return {x:Math.max(l+px,Math.min(r-px,x)),y:Math.max(t+py,Math.min(b-py,y))};
  }
  const cx=arena.x*TS+TS/2,cy=arena.y*TS+TS/2,limit=Math.max(8,arena.r*TS-pad);
  const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy);
  return d>limit ? {x:cx+dx/d*limit,y:cy+dy/d*limit} : {x,y};
}
function combatTerrainClear(actor,x,y,air=false) {
  if (air && !combatArena(actor)) return x>=8&&y>=8&&x<PXW-8&&y<PXH-8;
  const {w,h}=combatFootprint(actor),previous=arenaPass;
  // Arena bounds are tested continuously in pixels by combatProject. Keep
  // terrain separate so an actor caught by a rising wall can escape inward.
  arenaPass=true;
  try {
    return !isSolid(x-w,y-1)&&!isSolid(x+w,y-1)&&!isSolid(x-w,y-h)&&!isSolid(x+w,y-h)&&!isSolid(x,y-h/2);
  } finally { arenaPass=previous; }
}
function combatCanStand(actor,x,y,air=false) {
  const p=combatProject(actor,x,y);
  return Math.hypot(p.x-x,p.y-y)<.01&&combatTerrainClear(actor,x,y,air);
}
function recoverCombatFooting(actor,air=false) {
  if (!combatArena(actor) || combatCanStand(actor,actor.x,actor.y,air)) return false;
  const base=combatProject(actor,actor.x,actor.y,4);
  if (combatCanStand(actor,base.x,base.y,air)) { actor.x=base.x;actor.y=base.y;return true; }
  // Only repair an already invalid position (old saves, wall activation or
  // knockback). Normal movement never teleports or drops footprint checks.
  for(let radius=4;radius<=64;radius+=4)for(let i=0;i<16;i++){
    const a=i*Math.PI/8,x=base.x+Math.cos(a)*radius,y=base.y+Math.sin(a)*radius;
    if(combatCanStand(actor,x,y,air)){actor.x=x;actor.y=y;return true;}
  }
  return false;
}
function combatEdgeTarget(actor) {
  const a=combatArena(actor);
  if(!a){actor._edgeArena=null;actor._edgeGoal=null;return null;}
  if(actor._edgeArena!==a){actor._edgeArena=a;actor._edgeGoal=null;}
  if(actor._edgeGoal){
    if(Math.hypot(actor.x-actor._edgeGoal.x,actor.y-actor._edgeGoal.y)>4)return actor._edgeGoal;
    actor._edgeGoal=null;
  }
  const near=combatProject(actor,actor.x,actor.y,8,a);
  if(Math.hypot(near.x-actor.x,near.y-actor.y)>.1){
    actor._edgeGoal=combatProject(actor,actor.x,actor.y,30,a);
    return actor._edgeGoal;
  }
  return null;
}
function moveCombatActor(actor,dx,dy,air=false,edgeSpace=12) {
  recoverCombatFooting(actor,air);
  const distance=Math.hypot(dx,dy);
  if(distance<.0001)return 0;
  const startX=actor.x,startY=actor.y,steps=Math.max(1,Math.ceil(distance/3));
  const step=distance/steps;
  let vx=dx/distance,vy=dy/distance;
  // Look ahead into the safe area. An outward retreat becomes an inward or
  // tangential step before reaching the hard boundary.
  const ahead=combatProject(actor,actor.x+vx*24,actor.y+vy*24,edgeSpace);
  const ax=ahead.x-actor.x,ay=ahead.y-actor.y,ad=Math.hypot(ax,ay);
  if(ad>.1){vx=ax/ad;vy=ay/ad;}
  for(let i=0;i<steps;i++){
    const x=actor.x,y=actor.y,nx=x+vx*step,ny=y+vy*step;
    if(combatCanStand(actor,nx,ny,air)){actor.x=nx;actor.y=ny;continue;}
    // Recheck the second axis at the actual updated position, never against
    // last frame's result or the old diagonal origin.
    if(Math.abs(vx)>.001&&combatCanStand(actor,nx,actor.y,air))actor.x=nx;
    if(Math.abs(vy)>.001&&combatCanStand(actor,actor.x,ny,air))actor.y=ny;
    if(Math.hypot(actor.x-x,actor.y-y)>step*.15)continue;
    const side=actor._navSide||1,angle=Math.atan2(vy,vx);
    let moved=false;
    for(const turn of [side*.65,-side*.65,side*1.2,-side*1.2,side*1.57,-side*1.57]){
      const tx=x+Math.cos(angle+turn)*step,ty=y+Math.sin(angle+turn)*step;
      if(!combatCanStand(actor,tx,ty,air))continue;
      actor.x=tx;actor.y=ty;actor._navSide=Math.sign(turn);moved=true;break;
    }
    if(!moved)break;
  }
  return Math.hypot(actor.x-startX,actor.y-startY);
}
function combatAttackPoint(actor,target,range) {
  const arena=combatArena(actor),center=arena?(arena.templeRoom?
    {x:(arena.templeRoom[0]+arena.templeRoom[2])/2,y:(arena.templeRoom[1]+arena.templeRoom[3])/2}:
    {x:arena.x*TS+TS/2,y:arena.y*TS+TS/2}):actor;
  const inset=combatProject(actor,target.x,target.y,range+12,arena);
  const edge=Math.hypot(inset.x-target.x,inset.y-target.y)>1;
  const dx=(edge?center.x:actor.x)-target.x,dy=(edge?center.y:actor.y)-target.y;
  const d=Math.hypot(dx,dy)||1;
  return combatProject(actor,target.x+dx/d*range,target.y+dy/d*range,16,arena);
}
function dragonBreathPoint(target) {
  const preferred=combatAttackPoint(dragon,target,88);
  let best=null,score=Infinity;
  for(let i=0;i<16;i++){
    const angle=i*Math.PI/8;
    const p=combatProject(dragon,target.x+Math.cos(angle)*88,target.y+Math.sin(angle)*88,16);
    if(!combatCanStand(dragon,p.x,p.y,dragonAirborne()))continue;
    const range=Math.hypot(p.x-target.x,p.y-target.y);
    if(range<28)continue;
    const cost=Math.hypot(p.x-preferred.x,p.y-preferred.y)+Math.hypot(p.x-dragon.x,p.y-dragon.y)*.35;
    if(cost<score){best=p;score=cost;}
  }
  return best;
}
