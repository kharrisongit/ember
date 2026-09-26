/* Spirits remember the path rather than mirroring the player's facing. */
const spiritTrail={map:null,points:[],sample:-1};
function spiritFollowTarget(f){
  const trail=spiritTrail;
  if(trail.map!==MAPID||trail.sample>foeClock){trail.map=MAPID;trail.points=[];trail.sample=-1;}
  if(foeClock-trail.sample>=.1||!trail.points.length){
    trail.sample=foeClock;
    const last=trail.points.at(-1);
    if(!last||Math.hypot(P.x-last.x,P.y-last.y)>3)trail.points.push({x:P.x,y:P.y});
    if(trail.points.length>120)trail.points.shift();
  }
  const slot=f.slot||0,side=slot%2?-1:1;
  let remaining=84+(slot%2)*28,point=trail.points[0]||P,dx=0,dy=1;
  for(let i=trail.points.length-1;i>0;i--){
    const a=trail.points[i],b=trail.points[i-1],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d<.01)continue;
    dx=(a.x-b.x)/d;dy=(a.y-b.y)/d;
    if(remaining<=d){point={x:a.x-dx*remaining,y:a.y-dy*remaining};remaining=0;break;}
    remaining-=d;point=b;
  }
  if(remaining>0)point={x:point.x-dx*remaining,y:point.y-dy*remaining};
  const desired={x:point.x-dy*side*18,y:point.y+dx*side*18};
  const elapsed=Math.max(0,Math.min(.1,foeClock-(f.spiritAimTime??foeClock)));
  f.spiritAimTime=foeClock;
  if(!f.spiritAim||f.spiritMap!==MAPID){f.spiritAim={...desired};f.spiritMap=MAPID;f.spiritVX=f.spiritVY=0;}
  const ease=1-Math.exp(-elapsed/ (.28+(slot%2)*.12));
  f.spiritAim.x+=(desired.x-f.spiritAim.x)*ease;f.spiritAim.y+=(desired.y-f.spiritAim.y)*ease;
  return {...f.spiritAim,d:Math.hypot(f.spiritAim.x-f.x,f.spiritAim.y-f.y),isPlayer:false,follow:1};
}
function spiritFollowVelocity(f,rx,ry,distance,dt){
  const speed=Math.min(235,105+distance*.9),ease=1-Math.exp(-dt/.3);
  f.spiritVX=(f.spiritVX||0)+(rx/distance*speed-(f.spiritVX||0))*ease;
  f.spiritVY=(f.spiritVY||0)+(ry/distance*speed-(f.spiritVY||0))*ease;
  return {x:f.x+f.spiritVX*dt,y:f.y+f.spiritVY*dt};
}
