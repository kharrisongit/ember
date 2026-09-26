import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c=vm.createContext({MAPID:'world',foeClock:0,P:{x:0,y:0,dir:'s'}});vm.runInContext(fs.readFileSync('js/ghost-following.js','utf8'),c);
const a={x:-90,y:18,slot:0},b={x:-118,y:-18,slot:1};
for(let i=0;i<180;i++){c.foeClock+=1/60;c.P.x+=2;c.spiritFollowTarget(a);c.spiritFollowTarget(b);}
const before=c.spiritFollowTarget(a),other=c.spiritFollowTarget(b);assert(before.x<c.P.x-65);assert(other.x<before.x-20,'different following distances');
c.P.dir='u';const turned=c.spiritFollowTarget(a);assert.equal(turned.x,before.x);assert.equal(turned.y,before.y,'turning in place does not snap the spirit');
for(let i=0;i<6;i++){c.foeClock+=1/60;c.P.y-=2;c.spiritFollowTarget(a);}
const bend=c.spiritFollowTarget(a);assert(Math.abs(bend.y-before.y)<3,'corner is followed after a delay');
let pos=c.spiritFollowVelocity(a,100,0,100,1/60);assert(pos.x-a.x<1,'accelerates gently');
a.x=pos.x;a.y=pos.y;const vx=a.spiritVX;pos=c.spiritFollowVelocity(a,0,-100,100,1/60);assert(a.spiritVX>vx*.9,'turn keeps momentum');assert(Math.abs(a.spiritVY)<20);
c.MAPID='tp1';c.P.x=20;c.P.y=30;const reset=c.spiritFollowTarget(a);assert(Math.abs(reset.x-c.P.x)<150,'old world trail is discarded on map changes');
console.log('PASS: spaced spirit trails, delayed corners, no facing mirroring, smooth acceleration and map resets.');
