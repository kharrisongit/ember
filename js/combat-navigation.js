// Custom boss frames do not pass through the normal sprite-atlas renderer.
// Tint their opaque pixels so damage and shield warnings remain just as clear.
const WINTER_BOSS_SCALE=.85;
let enemyFeedbackCanvas=null;
function drawEnemyCombatFrame(f,frame,x,y,width,height,scale=1){
  let color=null,amount=0;
  if(f.st!=='dead'){
    if(f.hurt>0){color='#ff3030';amount=.6+.25*(.5+.5*Math.cos(f.hurt*48));}
    else if(f.st==='wind'){
      color=glassAttackUnblockable(f)?'#ff8a24':'#ffe34d';
      amount=.24+.58*(.5+.5*Math.sin(tAcc*24));
    }
  }
  if(color){
    if(!enemyFeedbackCanvas)enemyFeedbackCanvas=document.createElement('canvas');
    const c=enemyFeedbackCanvas;
    if(c.width!==width||c.height!==height){c.width=width;c.height=height;}
    const g=c.getContext('2d');g.clearRect(0,0,width,height);
    g.imageSmoothingEnabled=false;g.drawImage(frame,0,0,width,height);
    g.globalCompositeOperation='source-atop';g.globalAlpha=amount;
    g.fillStyle=color;g.fillRect(0,0,width,height);
    g.globalCompositeOperation='source-over';g.globalAlpha=1;frame=c;
  }
  drawPixelImage(ctx,frame,0,0,width,height,x,y,Math.round(width*scale),Math.round(height*scale));
}

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
  if (actor.kind === 'spiderqueen') return {w:20,h:9,pad:26};
  if (actor.kind === 'frosthorn') return {w:19.55*WINTER_BOSS_SCALE,h:10.2*WINTER_BOSS_SCALE,pad:25.5*WINTER_BOSS_SCALE};
  if (actor.kind === 'icemoth') return {w:21*WINTER_BOSS_SCALE,h:10*WINTER_BOSS_SCALE,pad:38*WINTER_BOSS_SCALE};
  if (actor.kind === 'kdragon') return {w:30,h:34,pad:34};
  const art = SPR[(FOE_ART[actor.kind] || 'sk')+'_idle_d'];
  const w = actor.halfW ?? (art ? Math.max(6,Math.min(15,Math.round(art[2]*.22))) : 7);
  // The navigation body is the feet, not the transparent height of the sprite.
  return {w,h:8,pad:w+5};
}
// Dynamic body collision is separate from scenery: sprites, missiles and
// scripted pathfinding can still pass behind the upper half of an enemy.
function solidCombatFoe(f){
  return !!f&&!!f.kind&&!f.ally&&!f.storyPassive&&f.st!=='dead'&&!(f.hp<=0);
}
function combatBody(actor){
  if(actor===P)return {w:PC_W/2,h:PC_H};
  const foot=combatFootprint(actor);
  if(actor===dragon)return {w:foot.w,h:foot.h};
  // Use the lower half, independent of transparent sprite-sheet padding.
  const h=actor.kind==='frosthorn'?25.5*WINTER_BOSS_SCALE:
    actor.kind==='icemoth'?30*WINTER_BOSS_SCALE:
    actor.kind==='spiderqueen'?20:actor.kind==='kdragon'?34:
    /^golem[1234]$/.test(actor.kind)?24:actor.huntingArena?12:16;
  return {w:foot.w,h:Math.max(foot.h,h)};
}
function combatBodyBlocks(actor,x,y,other,sweep=true){
  const a=combatBody(actor),b=combatBody(other);
  // Expand the obstacle by the moving footprint and sweep its foot anchor.
  const l=other.x-b.w-a.w,r=other.x+b.w+a.w;
  const t=other.y-b.h,bt=other.y+a.h;
  if(!sweep)return x>l&&x<r&&y>t&&y<bt;
  if(Math.max(actor.x,x)<=l||Math.min(actor.x,x)>=r||Math.max(actor.y,y)<=t||Math.min(actor.y,y)>=bt)return false;
  const dx=x-actor.x,dy=y-actor.y;
  if(actor.x>l&&actor.x<r&&actor.y>t&&actor.y<bt){
    // An old save, summon or knockback can start overlapped. Only outward
    // movement is allowed; crossing the other body is still blocked.
    const rx=(r-l)/2,ry=(bt-t)/2,ox=(actor.x-(l+r)/2)/rx,oy=(actor.y-(t+bt)/2)/ry;
    const vx=dx/rx,vy=dy/ry;
    return !(ox*vx+oy*vy>=0&&(ox+vx)**2+(oy+vy)**2>ox*ox+oy*oy+1e-9);
  }
  let enter=0,leave=1;
  for(const [start,delta,low,high]of [[actor.x,dx,l,r],[actor.y,dy,t,bt]]){
    if(Math.abs(delta)<1e-9){if(start<=low||start>=high)return false;continue;}
    const a=(low-start)/delta,b=(high-start)/delta;
    enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));
  }
  return enter<leave&&leave>0&&enter<1;
}
function combatBodiesClear(actor,x,y,sweep=true){
  if(typeof foes==='undefined'||foesHeld||typeof sceneHold==='function'&&sceneHold())return true;
  if(actor===P||actor===dragon||actor.ally){
    for(const f of foes)if(f!==actor&&solidCombatFoe(f)&&combatBodyBlocks(actor,x,y,f,sweep))return false;
  }else if(solidCombatFoe(actor)){
    if(globalThis.window?.LDRCampaign?.active)return window.LDRCampaign.combatPartyClear(actor,x,y,sweep);
    if(combatBodyBlocks(actor,x,y,P,sweep))return false;
    if(!mounted&&dragon.on&&!dragon.down&&dragon.placed===MAPID&&combatBodyBlocks(actor,x,y,dragon,sweep))return false;
  }
  return true;
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
function combatCanStand(actor,x,y,air=false,sweep=true) {
  const p=combatProject(actor,x,y);
  return Math.hypot(p.x-x,p.y-y)<.01&&combatTerrainClear(actor,x,y,air)&&combatBodiesClear(actor,x,y,sweep);
}
function recoverCombatFooting(actor,air=false) {
  if (!combatArena(actor)) return false;
  const projected=combatProject(actor,actor.x,actor.y);
  // Body contact must never trigger a teleport. Repair only scenery/boundary
  // overlaps, testing the destination independently of the invalid start.
  if(Math.hypot(projected.x-actor.x,projected.y-actor.y)<.01&&combatTerrainClear(actor,actor.x,actor.y,air))return false;
  const base=combatProject(actor,actor.x,actor.y,4);
  if (combatCanStand(actor,base.x,base.y,air,false)) { actor.x=base.x;actor.y=base.y;return true; }
  // Only repair an already invalid position (old saves, wall activation or
  // knockback). Normal movement never teleports or drops footprint checks.
  for(let radius=4;radius<=64;radius+=4)for(let i=0;i<16;i++){
    const a=i*Math.PI/8,x=base.x+Math.cos(a)*radius,y=base.y+Math.sin(a)*radius;
    if(combatCanStand(actor,x,y,air,false)){actor.x=x;actor.y=y;return true;}
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
