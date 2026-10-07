import fs from 'node:fs';
import {inflateSync} from 'node:zlib';
export const previewMap=JSON.parse(fs.readFileSync(new URL('./preview-map.json',import.meta.url)));
export const PROTOCOL=4;
const collisionCache=new WeakMap();
function collisionFor(map){
 if(collisionCache.has(map))return collisionCache.get(map);
 const bits=map.tiles?inflateSync(Buffer.from(map.tiles,'base64')):null;
 const fences=new Set(map.fences||[]),rectBuckets=new Map();
 for(const rect of [...map.blocks||[],...map.npcBodies||[]]){
  for(let y=Math.floor(rect[1]/256);y<=Math.floor(rect[3]/256);y++)for(let x=Math.floor(rect[0]/256);x<=Math.floor(rect[2]/256);x++){
    const key=x+','+y;if(!rectBuckets.has(key))rectBuckets.set(key,[]);rectBuckets.get(key).push(rect);
  }
 }
 const result={bits,fences,rectBuckets};collisionCache.set(map,result);return result;
}
export const facing=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?dx<0?'w':'e':dy<0?'n':'s';
export const direction=d=>({n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]})[d]||[0,1];
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function profileOf(value={}) {
  const name=Array.from(String(value.name||'Dragonrider').normalize('NFC').replace(/[^\p{L}\p{M}\p{N} '\u2019-]/gu,'').replace(/\s+/g,' ').trim()).slice(0,16).join('')||'Dragonrider';
  const hair=['dark','brown','copper','blond','silver'].includes(value.hair)?value.hair:'dark';
  const eyes=['blue','green','brown','hazel','gray'].includes(value.eyes)?value.eyes:'blue';
  return {name,hair,eyes};
}
function solidAt(x,y,m=previewMap){
  const {bits,fences,rectBuckets}=collisionFor(m),tx=Math.floor(x/m.tile),ty=Math.floor(y/m.tile);
  if(tx<0||ty<0||tx>=m.width||ty>=m.height)return true;
  const override=m.overrides[Math.floor(x/8)+','+Math.floor(y/8)];
  if(override!==undefined)return override;
  const i=ty*m.width+tx;
  if((bits[i>>3]&(1<<(i&7)))||fences.has(i))return true;
  return (rectBuckets.get(Math.floor(x/256)+','+Math.floor(y/256))||[]).some(r=>x>=r[0]&&x<r[2]&&y>=r[1]&&y<r[3]);
}
export function canStand(x,y,grid=previewMap) {
  if(!Number.isFinite(x)||!Number.isFinite(y))return false;
  if(grid.rows){const gx=Math.round((x-grid.x0)/grid.step),gy=Math.round((y-grid.y0)/grid.step);return gx>=0&&gy>=0&&gx<grid.width&&gy<grid.height&&grid.rows[gy][gx]==='1';}
  return !solidAt(x-5.5,y-7,grid)&&!solidAt(x+5.5,y-7,grid)&&!solidAt(x-5.5,y-1,grid)&&!solidAt(x+5.5,y-1,grid);
}
export function clearLine(a,b,grid=previewMap){
  const steps=Math.ceil(distance(a,b)/4);
  for(let i=1;i<=steps;i++)if(!canStand(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,grid))return false;
  return true;
}
export function findClear(x,y,radius=80,allowed=()=>true,grid=previewMap){
  for(let r=0;r<=radius;r+=8)for(let i=0;i<(r?24:1);i++){
    const p={x:x+Math.cos(i*Math.PI/12)*r,y:y+Math.sin(i*Math.PI/12)*r};
    if(canStand(p.x,p.y,grid)&&allowed(p))return p;
  }
  throw Error('No clear co-op spawn');
}
export function newMember(id,uid,profile,slot) {
  const spawn=findClear(previewMap.spawns[slot].x,previewMap.spawns[slot].y);
  return {id,uid,profile:profileOf(profile),connected:true,ready:false,input:{x:0,y:0,run:false},lastInput:0,seq:-1,actionSeq:-1,
    cooldowns:{sword:0,claw:0,fire:0,revive:0},
    rider:{...spawn,dir:'s',moving:false,running:false,t:0,hp:10,maxHp:10,hurtUntil:0,invulnerableUntil:0,attackUntil:0,attackAt:0},
    dragon:{x:spawn.x+24,y:spawn.y-24,dir:'s',moving:false,t:0,hp:14,maxHp:14,hurtUntil:0,invulnerableUntil:0,attackUntil:0,attackAt:0,attack:'',command:null}};
}
export function acceptInput(member,input,now) {
  if(!input||!Number.isSafeInteger(input.seq)||input.seq<=member.seq||input.seq>2**31-1||
    !Number.isFinite(input.x)||!Number.isFinite(input.y)||Math.abs(input.x)>1||Math.abs(input.y)>1||
    (input.run!==undefined&&typeof input.run!=='boolean'))return false;
  const length=Math.max(1,Math.hypot(input.x,input.y));
  member.input={x:input.x/length,y:input.y/length,run:input.run===true};member.seq=input.seq;member.lastInput=now;return true;
}
export function moveBody(body,dx,dy,bodies=[],arena=null,radius=10,grid=previewMap){
  const fits=(x,y)=>canStand(x,y,grid)&&(!arena||Math.hypot(x-arena.x,y-arena.y)<=arena.r-8)&&bodies.every(other=>{
    if(other===body||other.hp<=0)return true;
    const old=distance(body,other),next=Math.hypot(x-other.x,y-other.y);
    return next>=radius+(other.radius||10)||next>old+.001;
  });
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/2));
  for(let i=0;i<steps;i++){if(fits(body.x+dx/steps,body.y))body.x+=dx/steps;if(fits(body.x,body.y+dy/steps))body.y+=dy/steps;}
}
export function stepMember(member,dt,now,{bodies=[],arena=null,time=0,held=false,grid=previewMap}={}) {
  dt=Math.max(0,Math.min(.05,dt));
  const p=member.rider,d=member.dragon;
  const input=member.connected&&p.hp>0&&!held&&now-member.lastInput<300?member.input:{x:0,y:0,run:false};
  const oldX=p.x,oldY=p.y,speed=input.run?190:118;
  moveBody(p,input.x*speed*dt,input.y*speed*dt,bodies,arena,10,grid);
  p.moving=Math.hypot(p.x-oldX,p.y-oldY)>.001;p.running=p.moving&&input.run;
  if((input.x||input.y)&&p.attackUntil<=time)p.dir=facing(input.x,input.y);
  p.t+=dt;d.t+=dt;
  if(d.hp<=0){d.moving=false;return;}
  if(d.command||d.attackUntil>time){d.moving=false;return;}
  const [fx,fy]=direction(p.dir),target={x:p.x-fx*28+fy*18,y:p.y-fy*28-fx*18};
  if(arena){const length=distance(target,arena),limit=arena.r-14;if(length>limit){target.x=arena.x+(target.x-arena.x)/length*limit;target.y=arena.y+(target.y-arena.y)/length*limit;}}
  const dx=target.x-d.x,dy=target.y-d.y,len=Math.hypot(dx,dy);
  d.moving=member.connected&&len>3;
  if(d.moving){const amount=Math.min(len,240*dt);d.x+=dx/len*amount;d.y+=dy/len*amount;d.dir=facing(dx,dy);}
  else d.dir=p.dir;
}
export function publicMember(m){
  const {command,...dragon}=m.dragon;
  return {id:m.id,...m.profile,connected:m.connected,ready:m.ready,cooldowns:{...m.cooldowns},rider:{...m.rider},dragon};
}
