import test from 'node:test';
import assert from 'node:assert/strict';
import {previewMap,newMember,canStand,acceptInput,stepMember,clearLine,distance} from '../src/world.mjs';
import {createBattle,setBattleReady,acceptAction,stepBattle,publicBattle} from '../src/combat.mjs';
function fixture(){
 const members=new Map([['a',newMember('a','user-a',{},0)],['b',newMember('b','user-b',{},1)]]);
 const a=members.get('a'),b=members.get('b'),battle=createBattle();
 setBattleReady(battle,members,a,true);assert.equal(battle.phase,'idle');
 setBattleReady(battle,members,b,true);assert.equal(battle.phase,'countdown');
 for(let i=0;i<61;i++)stepBattle(battle,members,.05);
 assert.equal(battle.phase,'active');return {members,a,b,battle};
}
test('overworld collision extends beyond the old crop, preserves walls, and supports sprint and four dragon directions',()=>{
 assert.equal(previewMap.version,2);assert(previewMap.width*previewMap.tile>50000);
 const m=newMember('a','a',{},0),arena=createBattle().arena;
 assert(canStand(arena.x,arena.y));assert(arena.y<6656);assert(!canStand(-1,0));
 const blocked=Object.entries(previewMap.overrides).find(([,v])=>v===true);
 if(blocked){const [x,y]=blocked[0].split(',').map(Number);assert(!canStand(x*8+4,y*8+6));}
 for(const [dir,x,y]of [['n',0,-1],['s',0,1],['e',1,0],['w',-1,0]]){
  Object.assign(m.rider,{x:arena.x,y:arena.y});Object.assign(m.dragon,{x:arena.x,y:arena.y});
  acceptInput(m,{seq:m.seq+1,x,y,run:true},1000);
  stepMember(m,.05,1000,{time:0});assert.equal(m.rider.dir,dir);assert(distance(m.rider,arena)>9);
  acceptInput(m,{seq:m.seq+1,x:0,y:0},1050);
  for(let i=0;i<30;i++)stepMember(m,.05,1100+i*50,{time:0});
  assert.equal(m.dragon.dir,dir);
 }
 assert(!acceptInput(m,{seq:m.seq+1,x:0,y:0,run:'fast'},5000));
});
test('actions are server validated, cool down independently, and never hurt the partner',()=>{
 const {members,a,b,battle}=fixture(),e=battle.enemies[0];
 Object.assign(a.rider,{x:e.x,y:e.y+28});Object.assign(b.rider,{x:e.x+4,y:e.y+28});
 assert(clearLine(a.rider,e));const hp=e.hp;
 assert(acceptAction(battle,members,a,{seq:1,kind:'sword',damage:1e9}));assert.equal(e.hp,hp-2);
 assert.equal(b.rider.hp,10);assert.equal(b.cooldowns.sword,0);
 assert(!acceptAction(battle,members,a,{seq:2,kind:'sword'}));assert.equal(e.hp,hp-2);
 assert(!acceptAction(battle,members,a,{seq:1,kind:'fire'}));
 assert(!acceptAction(battle,members,a,{seq:3,kind:'teleport'}));
 assert(!acceptAction(battle,members,a,{seq:NaN,kind:'sword'}));
 a.rider.hp=0;assert(!acceptAction(battle,members,a,{seq:4,kind:'fire'}));
});
test('both dragons can hit shared enemies and fire cannot be spammed',()=>{
 const {members,a,b,battle}=fixture();
 const e=battle.enemies[1];Object.assign(a.dragon,{x:e.x,y:e.y+48});Object.assign(b.dragon,{x:e.x-20,y:e.y+48});
 assert(acceptAction(battle,members,a,{seq:1,kind:'fire'}));assert(acceptAction(battle,members,b,{seq:1,kind:'fire'}));
 assert(!acceptAction(battle,members,a,{seq:2,kind:'fire'}));assert.equal(battle.projectiles.length,2);
 for(let i=0;i<12;i++)stepBattle(battle,members,.05);
 assert(battle.enemies.reduce((sum,e)=>sum+e.hp,0)<=26);
 const target=battle.enemies.find(e=>e.hp>0);battle.now+=12000;
 Object.assign(a.dragon,{x:target.x,y:target.y+38,attackUntil:0});
 assert(acceptAction(battle,members,a,{seq:3,kind:'claw'}));
 const before=battle.enemies.reduce((sum,e)=>sum+e.hp,0);
 for(let i=0;i<10;i++)stepBattle(battle,members,.05);
 assert(battle.enemies.reduce((sum,e)=>sum+e.hp,0)<before);
});
test('telegraphed attacks can be dodged, hurt riders and dragons, and respect invulnerability',()=>{
 const {members,a,b,battle}=fixture(),e=battle.enemies[0];
 for(const other of battle.enemies)if(other!==e)other.hp=0;
 Object.assign(a.rider,{x:e.x,y:e.y+26});Object.assign(a.dragon,{x:e.x,y:e.y+70});
 Object.assign(b.rider,{x:e.x+70,y:e.y});Object.assign(b.dragon,{x:e.x+70,y:e.y+30});
 stepBattle(battle,members,.05);assert.equal(e.state,'windup');
 const hp=a.rider.hp;a.rider.x+=65;
 for(let i=0;i<15;i++)stepBattle(battle,members,.05);assert.equal(a.rider.hp,hp);
 e.state='idle';e.nextAttack=0;Object.assign(a.rider,{x:e.x,y:e.y+26});Object.assign(a.dragon,{x:e.x+2,y:e.y+26});
 for(let i=0;i<16;i++)stepBattle(battle,members,.05);
 assert.equal(a.rider.hp,hp-2);assert.equal(a.dragon.hp,12);
});
test('revive needs proximity; a party wipe can restart; disconnect freezes combat',()=>{
 const {members,a,b,battle}=fixture();
 b.rider.hp=0;Object.assign(a.rider,{x:b.rider.x+60,y:b.rider.y});
 assert(!acceptAction(battle,members,a,{seq:1,kind:'revive'}));
 a.rider.x=b.rider.x+20;assert(acceptAction(battle,members,a,{seq:2,kind:'revive'}));assert.equal(b.rider.hp,5);
 a.dragon.hp=0;Object.assign(a.dragon,{x:a.rider.x,y:a.rider.y});battle.now+=2000;
 assert(acceptAction(battle,members,a,{seq:3,kind:'revive'}));assert.equal(a.dragon.hp,7);
 b.connected=false;const now=battle.now,hp=a.rider.hp;stepBattle(battle,members,.05);
 assert.equal(battle.now,now);assert.equal(a.rider.hp,hp);assert(battle.paused);
 assert(!acceptAction(battle,members,a,{seq:4,kind:'fire'}));
 b.connected=true;a.rider.hp=b.rider.hp=0;stepBattle(battle,members,.05);assert.equal(battle.phase,'lost');
 setBattleReady(battle,members,a,true);setBattleReady(battle,members,b,true);
 assert.equal(battle.phase,'countdown');assert.equal(a.rider.hp,10);assert.equal(a.dragon.hp,14);assert.equal(b.rider.hp,10);
 assert(battle.enemies.every(e=>e.hp===12));assert.equal(battle.round,2);
 assert(!JSON.stringify(publicBattle(battle)).includes('user-a'));
});
test('movement cannot pass through an enemy or leave an active battle circle',()=>{
 const {a,battle}=fixture(),e=battle.enemies[1];
 Object.assign(a.rider,{x:e.x,y:e.y+28});
 for(let i=0;i<80;i++){
  acceptInput(a,{seq:i,x:0,y:-1,run:true},1000+i*50);
  stepMember(a,.05,1000+i*50,{bodies:battle.enemies,arena:battle.arena,time:battle.now});
 }
 assert(distance(a.rider,e)>=20);assert(a.rider.y>e.y);
 Object.assign(a.rider,{x:battle.arena.x,y:battle.arena.y});
 for(let i=80;i<180;i++){
  acceptInput(a,{seq:i,x:1,y:0,run:true},1000+i*50);
  stepMember(a,.05,1000+i*50,{arena:battle.arena,time:battle.now});
 }
 assert(distance(a.rider,battle.arena)<=battle.arena.r-8+.001);
});
test('victory heals both riders and dragons, finishes death animations, and allows a fresh round',()=>{
 const {members,a,b,battle}=fixture();a.rider.hp=2;a.dragon.hp=0;b.rider.hp=0;
 for(const e of battle.enemies)e.hp=0;
 stepBattle(battle,members,.05);assert.equal(battle.phase,'won');
 assert.equal(a.rider.hp,10);assert.equal(a.dragon.hp,14);assert.equal(b.rider.hp,10);
 const before=battle.enemies[0].t;stepBattle(battle,members,.05);assert(battle.enemies[0].t>before);
 setBattleReady(battle,members,a,true);setBattleReady(battle,members,b,true);assert.equal(battle.phase,'countdown');assert.equal(battle.round,2);
});
