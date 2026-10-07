import fs from 'node:fs';
export const previewMap=JSON.parse(fs.readFileSync(new URL('./preview-map.json',import.meta.url)));
export const PROTOCOL=1;
export function profileOf(value={}) {
  const name=Array.from(String(value.name||'Dragonrider').normalize('NFC').replace(/[^\p{L}\p{M}\p{N} '\u2019-]/gu,'').replace(/\s+/g,' ').trim()).slice(0,16).join('')||'Dragonrider';
  const hair=['dark','brown','copper','blond','silver'].includes(value.hair)?value.hair:'dark';
  const eyes=['blue','green','brown','hazel','gray'].includes(value.eyes)?value.eyes:'blue';
  return {name,hair,eyes};
}
export function canStand(x,y,grid=previewMap) {
  if(!Number.isFinite(x)||!Number.isFinite(y))return false;
  const gx=Math.round((x-grid.x0)/grid.step),gy=Math.round((y-grid.y0)/grid.step);
  return gx>=0&&gy>=0&&gx<grid.width&&gy<grid.height&&grid.rows[gy][gx]==='1';
}
export function newMember(id,uid,profile,slot) {
  const spawn=previewMap.spawns[slot];
  return {id,uid,profile:profileOf(profile),connected:true,input:{x:0,y:0},lastInput:0,seq:-1,
    rider:{...spawn,dir:'s',moving:false,t:0},dragon:{x:spawn.x+24,y:spawn.y-24,dir:'s',moving:false,t:0}};
}
export function acceptInput(member,input,now) {
  if(!input||!Number.isSafeInteger(input.seq)||input.seq<=member.seq||input.seq>2**31-1||
    !Number.isFinite(input.x)||!Number.isFinite(input.y)||Math.abs(input.x)>1||Math.abs(input.y)>1)return false;
  const length=Math.max(1,Math.hypot(input.x,input.y));
  member.input={x:input.x/length,y:input.y/length};member.seq=input.seq;member.lastInput=now;return true;
}
const facing=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?dx<0?'w':'e':dy<0?'n':'s';
export function stepMember(member,dt,now) {
  dt=Math.max(0,Math.min(.05,dt));
  const input=member.connected&&now-member.lastInput<300?member.input:{x:0,y:0};
  const p=member.rider,oldX=p.x,oldY=p.y;
  // Movement comes only from validated direction inputs, never client positions.
  // Small substeps prevent skipping a thin wall on a delayed server tick.
  const n=Math.max(1,Math.ceil(64*dt/2));
  for(let i=0;i<n;i++){
    const dx=input.x*64*dt/n,dy=input.y*64*dt/n;
    if(canStand(p.x+dx,p.y))p.x+=dx;
    if(canStand(p.x,p.y+dy))p.y+=dy;
  }
  p.moving=Math.hypot(p.x-oldX,p.y-oldY)>.001;
  if(input.x||input.y)p.dir=facing(input.x,input.y);
  p.t+=dt;
  const d=member.dragon,dx=p.x+24-d.x,dy=p.y-24-d.y,distance=Math.hypot(dx,dy);
  // Hovering companions are decorative in this first movement-only milestone.
  d.moving=member.connected&&distance>2;
  if(d.moving){const amount=Math.min(distance,76*dt);d.x+=dx/distance*amount;d.y+=dy/distance*amount;d.dir=facing(dx,dy);}
  d.t+=dt;
}
export function publicMember(m){return {id:m.id,...m.profile,connected:m.connected,rider:{...m.rider},dragon:{...m.dragon}};}
