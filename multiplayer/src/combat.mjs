import {previewMap,canStand,clearLine,findClear,facing,direction,distance,moveBody} from './world.mjs';
const cooldown={sword:550,claw:2400,fire:12000,revive:2000};
export function createBattle(){
  const arena=previewMap.arenas.find(a=>a.r>=80&&canStand(a.x,a.y)&&canStand(a.x-28,a.y+40)&&canStand(a.x+28,a.y+40))||previewMap.arenas[0];
  if(!arena)throw Error('Missing co-op encounter arena');
  return {phase:'idle',round:0,now:0,startsAt:0,arena:{...arena},enemies:[],projectiles:[],effects:[],nextId:0,paused:false};
}
function effect(b,kind,actor,extra={}){b.effects.push({id:++b.nextId,kind,x:actor.x,y:actor.y,at:b.now,...extra});}
function resetActor(actor,spawn,hp){Object.assign(actor,spawn,{hp,moving:false,t:0,dir:'n',hurtUntil:0,invulnerableUntil:0,attackAt:0,attackUntil:0,command:null});}
export function setBattleReady(b,members,member,ready){
  if(!['idle','won','lost'].includes(b.phase)||typeof ready!=='boolean'||!member.connected)return false;
  member.ready=ready;
  const party=[...members.values()];
  if(party.length!==2||!party.every(m=>m.connected&&m.ready))return true;
  const a=b.arena,occupied=[];
  const spawn=(x,y)=>{const p=findClear(x,y,72,p=>distance(p,a)<a.r-18&&occupied.every(o=>distance(o,p)>=24));occupied.push(p);return p;};
  b.phase='countdown';b.round++;b.startsAt=b.now+3000;b.enemies=[];b.effects=[];b.projectiles=[];
  party.forEach((m,i)=>{
    resetActor(m.rider,spawn(a.x+(i?28:-28),a.y+40),m.rider.maxHp);
    resetActor(m.dragon,{x:m.rider.x+(i?18:-18),y:m.rider.y+14},m.dragon.maxHp);
    m.input={x:0,y:0,run:false};m.lastInput=0;m.ready=false;m.cooldowns={sword:0,claw:0,fire:0,revive:0};
  });
  for(let i=0;i<3;i++)b.enemies.push({id:'enemy-'+b.round+'-'+i,kind:'shroomBrown',...spawn(a.x+(i-1)*42,a.y-42),
    radius:11,dir:'s',hp:12,maxHp:12,state:'idle',t:0,hurtUntil:0,nextAttack:0,target:null});
  return true;
}
function damage(b,actor,amount){
  if(actor.hp<=0||(actor.invulnerableUntil||0)>b.now)return false;
  actor.hp=Math.max(0,actor.hp-amount);actor.hurtUntil=b.now+250;
  if('invulnerableUntil' in actor)actor.invulnerableUntil=b.now+650;
  effect(b,'damage',actor,{amount});
  if(actor.hp===0){actor.state='dead';actor.t=0;actor.moving=false;actor.command=null;effect(b,'down',actor);}
  return true;
}
const liveEnemies=b=>b.enemies.filter(e=>e.hp>0);
function nearestEnemy(b,from,range){return liveEnemies(b).filter(e=>distance(from,e)<=range&&clearLine(from,e)).sort((a,c)=>distance(from,a)-distance(from,c))[0];}
function inArc(source,target,reach,angle=.15){
  const len=distance(source,target);if(len>reach)return false;if(len<12)return true;
  const [dx,dy]=direction(source.dir);return ((target.x-source.x)*dx+(target.y-source.y)*dy)/len>=angle;
}
export function acceptAction(b,members,m,input){
  if(!m.connected||b.paused||b.phase!=='active'||m.rider.hp<=0||!input||!Number.isSafeInteger(input.seq)||input.seq<=m.actionSeq||input.seq>2**31-1||!Object.hasOwn(cooldown,input.kind))return false;
  m.actionSeq=input.seq;
  if(m.cooldowns[input.kind]>b.now)return false;
  const p=m.rider,d=m.dragon;
  if(input.kind==='sword'){
    const target=nearestEnemy(b,p,42);if(target)p.dir=facing(target.x-p.x,target.y-p.y);
    p.attackAt=b.now;p.attackUntil=b.now+420;
    for(const e of liveEnemies(b))if(inArc(p,e,40)&&clearLine(p,e))damage(b,e,2);
    effect(b,'sword',p,{dir:p.dir});
  }else if(input.kind==='claw'){
    if(d.hp<=0||d.attackUntil>b.now||d.command)return false;
    const target=nearestEnemy(b,d,260);if(!target)return false;
    d.command={target:target.id,expires:b.now+5000};
  }else if(input.kind==='fire'){
    if(d.hp<=0||d.attackUntil>b.now)return false;
    const target=nearestEnemy(b,d,300);if(!target)return false;
    d.command=null;d.dir=facing(target.x-d.x,target.y-d.y);d.attack='fire';d.attackAt=b.now;d.attackUntil=b.now+700;
    const len=distance(d,target)||1,vx=(target.x-d.x)/len,vy=(target.y-d.y)/len;
    b.projectiles.push({id:++b.nextId,x:d.x,y:d.y,vx,vy,owner:m.id,remaining:320});
    effect(b,'fire',d,{dir:d.dir});
  }else if(input.kind==='revive'){
    const targets=[...members.values()].filter(other=>other!==m&&other.connected&&other.rider.hp<=0&&distance(p,other.rider)<=48).map(other=>other.rider);
    if(d.hp<=0&&distance(p,d)<=56)targets.push(d);
    if(!targets.length)return false;
    for(const target of targets){target.hp=Math.ceil(target.maxHp/2);target.invulnerableUntil=b.now+2000;target.hurtUntil=0;target.attackUntil=0;target.state='idle';effect(b,'revive',target);}
  }
  m.cooldowns[input.kind]=b.now+cooldown[input.kind];return true;
}
function stepDragon(b,m,dt){
  const d=m.dragon,command=d.command;
  if(!command)return;
  const target=b.enemies.find(e=>e.id===command.target&&e.hp>0);
  if(!target||d.hp<=0||m.rider.hp<=0||command.expires<b.now||distance(d,m.rider)>300){d.command=null;return;}
  const dx=target.x-d.x,dy=target.y-d.y,len=Math.hypot(dx,dy);d.dir=facing(dx,dy);
  if(len>32){const move=Math.min(len-30,200*dt);d.x+=dx/len*move;d.y+=dy/len*move;d.moving=true;return;}
  d.command=null;d.moving=false;d.attack='claw';d.attackAt=b.now;d.attackUntil=b.now+450;
  effect(b,'claw',d,{dir:d.dir});
  for(const e of liveEnemies(b))if(inArc(d,e,48,-.1)&&clearLine(d,e))damage(b,e,3);
}
function stepProjectiles(b,dt){
  for(const shot of b.projectiles){
    const travel=Math.min(shot.remaining,280*dt),steps=Math.ceil(travel/4);
    for(let i=0;i<steps;i++){
      shot.x+=shot.vx*travel/steps;shot.y+=shot.vy*travel/steps;shot.remaining-=travel/steps;
      const target=liveEnemies(b).find(e=>distance(e,shot)<16);
      if(target){damage(b,target,5);effect(b,'burst',shot);shot.remaining=0;break;}
      if(!canStand(shot.x,shot.y)||distance(shot,b.arena)>b.arena.r){effect(b,'burst',shot);shot.remaining=0;break;}
    }
  }
  b.projectiles=b.projectiles.filter(p=>p.remaining>0);
}
function stepEnemy(b,e,members,dt){
  e.t+=dt;if(e.hp<=0)return;
  const targets=[...members.values()].filter(m=>m.connected&&m.rider.hp>0).flatMap(m=>[
    {id:m.id+':rider',actor:m.rider},...(m.dragon.hp>0?[{id:m.id+':dragon',actor:m.dragon}]:[])
  ]);
  if(e.state==='windup'){
    if(b.now>=e.strikesAt){
      // The orange tell fixes the attack direction. Moving out of its arc avoids it.
      e.state='attack';e.t=0;e.nextAttack=b.now+1300;
      for(const {actor} of targets)if(inArc(e,actor,34,.15)&&clearLine(e,actor))damage(b,actor,2);
      effect(b,'enemy-swing',e,{dir:e.dir});
    }return;
  }
  if(e.state==='attack'&&e.t<.4)return;
  const target=targets.sort((a,c)=>distance(e,a.actor)-distance(e,c.actor))[0];
  if(!target){e.state='idle';return;}
  const dx=target.actor.x-e.x,dy=target.actor.y-e.y,len=Math.hypot(dx,dy);
  e.dir=facing(dx,dy);
  if(len<30&&b.now>=e.nextAttack&&clearLine(e,target.actor)){e.state='windup';e.strikesAt=b.now+700;e.t=0;e.target=target.id;return;}
  if(len<=25){e.state='idle';return;}
  const old={x:e.x,y:e.y},speed=e.hurtUntil>b.now?16:42;
  const bodies=[...liveEnemies(b),...targets.filter(t=>t.id.endsWith(':rider')).map(t=>t.actor)];
  moveBody(e,dx/len*speed*dt,dy/len*speed*dt,bodies,b.arena,11);
  // Try a short sideways step around other bodies instead of sticking on a corner.
  if(distance(e,old)<.1){const side=Number(e.id.slice(-1))%2?1:-1;moveBody(e,-dy/len*speed*dt*side,dx/len*speed*dt*side,bodies,b.arena,11);}
  e.state=distance(e,old)>.05?'walk':'idle';
}
export function stepBattle(b,members,dt){
  b.paused=['active','countdown'].includes(b.phase)&&([...members.values()].some(m=>!m.connected)||members.size<2);
  if(b.paused)return;
  b.now+=dt*1000;
  b.effects=b.effects.filter(e=>b.now-e.at<800);
  if(b.phase==='countdown'&&b.now>=b.startsAt)b.phase='active';
  if(b.phase!=='active'){for(const e of b.enemies)if(e.hp<=0)e.t+=dt;return;}
  for(const m of members.values())stepDragon(b,m,dt);
  stepProjectiles(b,dt);
  for(const e of b.enemies)stepEnemy(b,e,members,dt);
  if(b.enemies.every(e=>e.hp<=0)){
    b.phase='won';b.projectiles=[];for(const m of members.values()){m.rider.hp=m.rider.maxHp;m.dragon.hp=m.dragon.maxHp;m.dragon.command=null;}
  }else if([...members.values()].every(m=>m.rider.hp<=0)){
    b.phase='lost';b.projectiles=[];for(const m of members.values())m.dragon.command=null;
  }
}
export function cancelBattle(b,members){
  if(['active','countdown'].includes(b.phase)){b.phase='lost';b.projectiles=[];b.effects=[];}
  b.paused=false;for(const m of members.values()){m.ready=false;m.dragon.command=null;}
}
export function publicBattle(b){
  return {phase:b.phase,round:b.round,now:b.now,startsAt:b.startsAt,arena:b.arena,paused:b.paused,
    enemies:b.enemies.map(({target,...e})=>({...e})),projectiles:b.projectiles.map(({owner,...p})=>({...p})),effects:b.effects.map(e=>({...e}))};
}
