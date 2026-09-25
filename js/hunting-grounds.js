/* Hunting clearings share confinement and loot, with species-specific art. */
function installBirchHuntingRoute(m) {
  const patch=[
    {id:9148,kind:'route',x0:145,y0:111,x1:198,y1:107,w:5,band:20,style:'birch',a0:null,a1:null,pts:[[145,111],[145,67],[198,67],[198,107]]},
    {id:9149,kind:'route',x0:198,y0:104,x1:198,y1:112,w:5,band:20,style:'birch',a0:null,a1:null},
    {id:9150,kind:'arena',x:168,y:67,r:6.3,style:'birch',encounter:'hare'}
  ];
  for(const f of patch)if(!m.features.some(q=>q.id===f.id))m.features.push(f);
  // Match Build's clearing of old tree deletions around a newly drawn route.
  const cleared=(x,y)=>(x>=118&&x<=225&&y>=40&&y<=138)||(x>=171&&x<=225&&y>=77&&y<=139);
  m.felled=(m.felled||[]).filter(k=>!cleared(...(Array.isArray(k)?k:String(k).split(',').map(Number))));
  const cells=new Set();
  for(const run of (m.felled_rle||'').split('|').filter(Boolean)){
    const [y,xs]=run.split(':'),[a,b=a]=xs.split('-').map(Number);
    for(let x=a;x<=b;x++)if(!cleared(x,Number(y)))cells.add(x+','+y);
  }
  m.felled_rle=EmberBuildData.encodeFelled(cells);
}

const HUNT_RESPAWN=300,HUNT_COUNT=3,huntingRest=new Map();
let huntingCheck=0;
Object.assign(FOE,{boar:{hp:3,speed:22,sight:0,reach:0,ring:0,dmg:0,swingT:1,hitAt:.5,rest:2,wind:.5}});
FOE.hare={...FOE.boar,hp:2,speed:28};
FOE.deer={...FOE.boar,hp:4,speed:25};
FOE.fox={...FOE.boar,hp:3,speed:30};
FOE.bird={...FOE.boar,hp:2,speed:22};
FOE_ART.boar='br';FOE_ART.hare='hare';FOE_ART.deer='deer';FOE_ART.fox='fox';FOE_ART.bird='bird';
const isHuntingArena=a=>a?.kind==='arena'&&['boar','hare','deer','fox','bird'].includes(a.encounter);
const huntingKey=(a,slot)=>MAPID+':hunt:'+a.id+':'+slot;
function huntingBounds(a){return {x:a.x*TS+TS/2,y:a.y*TS+TS/2,r:Math.max(8,(a.r||6.3)*TS-26)};}
function huntingPointClear(b,x,y){
  return Math.hypot(x-b.x,y-b.y)<=b.r&&!isSolid(x,y)&&!isSolid(x-9,y)&&!isSolid(x+9,y)&&!isSolid(x,y-8);
}
function spawnHuntingAnimals() {
  const rings=new Map(features.filter(a=>isHuntingArena(a)).map(a=>[a.id,a]));
  foes=foes.filter(f=>!f.huntingArena||rings.get(f.huntingArena.id)?.encounter===f.kind);
  for(const a of rings.values())for(let slot=0;slot<HUNT_COUNT;slot++){
    const key=huntingKey(a,slot),existing=foes.find(f=>f.huntingKey===key);
    if(existing&&existing.st!=='dead'){existing.huntingArena=a;continue;}
    if(existing&&!existing.meatDropped)dropHuntedMeat(existing);
    if(huntingRest.has(key))continue;
    const b=huntingBounds(a);let point=null;
    for(let i=0;i<24;i++){
      const angle=slot*Math.PI*2/HUNT_COUNT+i*.73,r=b.r*(i<12?.55:.18);
      const x=b.x+Math.cos(angle)*r,y=b.y+Math.sin(angle)*r;
      if(huntingPointClear(b,x,y)){point={x,y};break;}
    }
    if(!point)continue;
    if(existing)foes.splice(foes.indexOf(existing),1);
    foes.push({kind:a.encounter,...point,hx:point.x,hy:point.y,hp:FOE[a.encounter].hp,st:'idle',t:0,dir:'d',flip:false,hurt:0,
      huntingArena:a,huntingKey:key,wanderWait:slot*.6+1});
  }
}
function stepHuntingGrounds(dt) {
  for(const [key,remaining]of huntingRest){if(remaining<=dt)huntingRest.delete(key);else huntingRest.set(key,remaining-dt);}
  huntingCheck-=dt;
  if(huntingCheck<=0){huntingCheck=1;spawnHuntingAnimals();}
}
function dropHuntedMeat(f) {
  if(!f.huntingArena||f.meatDropped)return;
  f.meatDropped=true;
  huntingRest.set(f.huntingKey,HUNT_RESPAWN);
  loot.push({kind:f.kind+'Meat',x:f.x,y:f.y,n:1,t:0});
}
function stepHuntingAnimal(f,dt) {
  if(f.st==='dead'){dropHuntedMeat(f);return;}
  const b=huntingBounds(f.huntingArena);
  // Enforce the boundary before movement too, including external displacement.
  const distance=Math.hypot(f.x-b.x,f.y-b.y);
  if(distance>b.r){f.x=b.x+(f.x-b.x)/distance*b.r;f.y=b.y+(f.y-b.y)/distance*b.r;f.wanderTarget=null;}
  if(Math.hypot(P.x-f.x,P.y-f.y)>480){f.st='idle';return;}
  f.hurt=Math.max(0,f.hurt-dt);f.wanderWait=(f.wanderWait||0)-dt;
  if(f.hurt>0){
    const angle=Math.atan2(f.y-P.y,f.x-P.x);
    f.wanderTarget={x:b.x+Math.cos(angle)*b.r*.85,y:b.y+Math.sin(angle)*b.r*.85};f.wanderWait=0;if(f.kind==='bird')f.wanderFlying=true;
  }
  if(!f.wanderTarget&&f.wanderWait<=0){
    const angle=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*b.r*.9;
    const x=b.x+Math.cos(angle)*r,y=b.y+Math.sin(angle)*r;
    if(huntingPointClear(b,x,y)){f.wanderTarget={x,y};if(f.kind==='bird')f.wanderFlying=Math.random()<.35;}else f.wanderWait=.5;
  }
  if(!f.wanderTarget){f.st='idle';return;}
  const dx=f.wanderTarget.x-f.x,dy=f.wanderTarget.y-f.y,d=Math.hypot(dx,dy);
  if(d<2){f.wanderTarget=null;f.wanderWait=1+Math.random()*3;f.st='idle';return;}
  const step=Math.min(d,(f.hurt>0||f.kind==='bird'&&f.wanderFlying?34:FOE[f.kind].speed)*dt),x=f.x+dx/d*step,y=f.y+dy/d*step;
  if(!huntingPointClear(b,x,y)){f.wanderTarget=null;f.wanderWait=.5;f.st='idle';return;}
  f.x=x;f.y=y;f.st=f.kind==='bird'&&f.wanderFlying?'escape':'walk';f.dir=Math.abs(dx)>Math.abs(dy)?'s':dy>0?'d':'u';f.flip=dx<0;
}
function drawHuntingMeat(x,y) {
  // Small pixel drumstick, kept in code like the game's other item symbols.
  const pixels=['    oooo    ','  oorrroo   ',' oorrllrro  ',' orrllrrro  ',' orrrrrroo  ','  orrroo    ','   ooeeo    ','     oeeo   ','     oeeeo  ','      ooo   '];
  const colors={o:'#392321',r:'#a44835',l:'#d78260',e:'#ead7a1'};
  x=Math.round(x-6);y=Math.round(y-10);
  for(let row=0;row<pixels.length;row++)for(let col=0;col<pixels[row].length;col++){
    const color=colors[pixels[row][col]];if(!color)continue;
    ctx.fillStyle=color;ctx.fillRect(x+col,y+row,1,1);
  }
}
