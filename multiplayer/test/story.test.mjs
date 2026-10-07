import test from 'node:test';
import assert from 'node:assert/strict';
import {newMember,findClear,canStand,stepMember,clearLine} from '../src/world.mjs';
import {createPickupStore,publicInventory,collectPickup} from '../src/pickups.mjs';
import {createStory,storyMaps,chapter,chapters,storyGrid,joinStory,mapLoaded,storyHeld,storyInteract,advanceStory,stepStory,publicStory,storyPickupAllowed,storyPickedUp,storyBattleAllowed,forgetStoryVote,doorPoint} from '../src/story.mjs';
function fixture(){
 const s=createStory(),store=createPickupStore(),a=newMember('host','host-account',{name:'Host'},0),b=newMember('guest','guest-account',{name:'Guest'},1),members=new Map();
 for(const m of [a,b]){members.set(m.id,m);joinStory(s,m,members);mapLoaded(s,m,{epoch:s.epoch,map:s.map});}
 return {s,store,a,b,members};
}
function approach(f,p){for(const [i,m]of [...f.members.values()].entries())Object.assign(m.rider,findClear(p.x+18+i*8,p.y+18,80,q=>{const len=Math.hypot(q.x-p.x,q.y-p.y)||1,edge={x:p.x+(q.x-p.x)/len*18,y:p.y+(q.y-p.y)/len*18};return len<=36&&(clearLine(q,p,storyGrid(f.s))||clearLine(q,edge,storyGrid(f.s)));},storyGrid(f.s)));}
function finish(f){
 const {s,members,store}=f;
 while(s.scene){const data={id:s.scene.id,line:s.scene.line};for(const m of members.values())assert(advanceStory(s,members,m,data));stepStory(s,store,members,3,{phase:'idle'});}
}
function travel(f,to){
 const {s,members}=f,d=storyGrid(s).doors.find(d=>d.to===to);assert(d,'Door to '+to);
 approach(f,doorPoint(d));
 for(const m of members.values())assert.equal(storyInteract(s,members,m,d.id),null);
 assert.equal(s.map,to);assert(storyHeld(s,members));
 for(const m of members.values()){assert(canStand(m.rider.x,m.rider.y,storyGrid(s)));mapLoaded(s,m,{epoch:s.epoch,map:s.map});}
 assert(!storyHeld(s,members));
}
test('opening rooms use real furniture collision and both players must acknowledge loading',()=>{
 const f=fixture(),{s,a,b,members}=f;
 assert.equal(s.map,'house26_bedroom');assert(!canStand(65,151,storyGrid(s)),'Desk remains solid');
 assert(canStand(a.rider.x,a.rider.y,storyGrid(s)));b.loading=true;
 assert(!mapLoaded(s,b,{epoch:999,map:s.map}));assert(storyHeld(s,members));
 const before={...a.rider};a.input={x:1,y:0};a.lastInput=1000;
 stepMember(a,.05,1010,{grid:storyGrid(s),held:storyHeld(s,members)});assert.equal(a.rider.x,before.x);
 assert(mapLoaded(s,b,{epoch:s.epoch,map:s.map}));assert(!storyHeld(s,members));
 assert(storyInteract(s,members,a,'not-a-real-event'));
});
test('dialogue requires two distinct players, validates the line token and pauses across disconnects',()=>{
 const f=fixture(),{s,store,a,b,members}=f;approach(f,chapter(s));
 assert.equal(storyInteract(s,members,a,'chapter:gear'),null);
 const data={id:s.scene.id,line:0};assert(advanceStory(s,members,a,data));assert(advanceStory(s,members,a,data));
 stepStory(s,store,members,5,{phase:'idle'});assert.equal(s.scene.line,0);assert.equal(publicInventory(store,a.uid).story.length,0);
 assert(!advanceStory(s,members,b,{id:999,line:0}));
 b.connected=false;forgetStoryVote(s,b.uid);const clock=s.clock;
 stepStory(s,store,members,5,{phase:'idle'});assert.equal(s.clock,clock);
 b.connected=true;b.loading=true;assert(!advanceStory(s,members,b,data));
 mapLoaded(s,b,{epoch:s.epoch,map:s.map});assert(advanceStory(s,members,b,data));stepStory(s,store,members,1,{phase:'idle'});
 assert.equal(s.scene.line,1);assert(!advanceStory(s,members,a,data));finish(f);
 assert.equal(chapter(s).id,'nan');assert(publicInventory(store,b.uid).story.includes('travelGear'));
 assert(!JSON.stringify(publicStory(s,members)).includes('account'));
});
test('two players complete the opening, travel together, share delivery and hatch separate dragons',()=>{
 const f=fixture(),{s,store,a,b,members}=f;
 const battle={phase:'idle',arena:{x:488,y:5448,r:84.8}};
 assert(!storyPickupAllowed(s,a,members,'egg'));
 for(let index=0;index<chapters.length-1;index++){
  const c=chapter(s);assert.equal(s.step,index);
  if(s.map!==c.map){
   if(s.map==='house26_bedroom')travel(f,'house26');
   if(s.map!==c.map&&s.map!=='world')travel(f,'world');
   if(s.map!==c.map)travel(f,c.map);
  }
  approach(f,c);
  if(c.battle){
   assert(storyBattleAllowed(s,members,a,battle));battle.phase='won';stepStory(s,store,members,.05,battle);continue;
  }
  if(c.pickup){
   assert(storyPickupAllowed(s,a,members,c.pickup));
   assert(collectPickup(store,a,'story:'+c.pickup,1000,battle,storyGrid(s)).ok,c.id);storyPickedUp(s,a);
  }else assert.equal(storyInteract(s,members,a,'chapter:'+c.id),null,c.id);
  finish(f);
  if(c.reward)for(const m of members.values())assert(publicInventory(store,m.uid).story.includes(c.reward));
  if(c.consume)for(const m of members.values())assert(!publicInventory(store,m.uid).story.includes(c.consume));
 }
 assert.equal(chapter(s).id,'complete');assert(s.hasDragon);
 assert(publicInventory(store,a.uid).story.includes('sword'));assert(publicInventory(store,b.uid).story.includes('heart'));
 assert(!storyPickupAllowed(s,a,members,'egg'));
 const late=newMember('returning','new-account',{},1);members.delete(b.id);members.set(late.id,late);joinStory(s,late,members);
 assert(publicInventory(store,late.uid).story.includes('heart'));assert.equal(publicStory(s,members).step,'complete');
});
test('remote actors cannot start scenes or drag their partner through doors',()=>{
 const f=fixture(),{s,a,b,members}=f;
 assert(storyInteract(s,members,a,'chapter:hatch'));
 a.rider={...a.rider,x:10000,y:10000};assert(storyInteract(s,members,a,'chapter:gear'));
 approach(f,chapter(s));b.rider.x=10000;assert(storyInteract(s,members,a,'chapter:gear'));
 approach(f,chapter(s));assert.equal(storyInteract(s,members,a,'chapter:gear'),null);finish(f);
 const d=storyGrid(s).doors[0];approach(f,doorPoint(d));
 assert.equal(storyInteract(s,members,a,d.id),null);assert.equal(s.map,'house26_bedroom');
 b.rider.x=10000;assert(storyInteract(s,members,b,d.id));assert.equal(s.map,'house26_bedroom');
});
