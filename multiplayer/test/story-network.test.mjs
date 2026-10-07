import test from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@colyseus/sdk';
import {matchMaker} from '@colyseus/core';
import {startServer} from '../src/server.mjs';
import {PROTOCOL} from '../src/world.mjs';
import {storyGrid,doorPoint} from '../src/story.mjs';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check){for(let i=0;i<160;i++){if(check())return;await pause(25);}throw Error('Story network state did not arrive');}
function track(room){const state={};room.reconnection.enabled=false;for(const type of ['snapshot','inventory','nearby-pickups','pickup-result','welcome','ended'])room.onMessage(type,data=>state[type]=data);room.send('ready');return state;}
test('story room synchronizes dialogue, reconnect recovery and two-phase party map loading',{timeout:20000},async()=>{
 const server=await startServer({port:0,host:'127.0.0.1',verifyIdentity:async token=>({uid:token})});
 const make=token=>{const c=new Client('http://127.0.0.1:'+server.port);c.auth.token=token;return c;},rooms=[];
 try{
  const host=await make('host').create('story_coop_preview',{protocol:PROTOCOL,mode:'story'});rooms.push(host);const hs=track(host);
  const guestClient=make('guest'),guest=await guestClient.joinById(host.roomId,{protocol:PROTOCOL});rooms.push(guest);let gs=track(guest),gr=guest;
  await until(()=>hs.snapshot?.story&&gs.snapshot?.story);
  const live=matchMaker.getLocalRoomById(host.roomId),loaded=r=>r.send('map-loaded',{epoch:live.story.epoch,map:live.story.map});
  assert.equal(hs.snapshot.story.map,'house26_bedroom');assert(hs.snapshot.story.held);
  loaded(host);await pause(80);assert(hs.snapshot.story.held);loaded(guest);await until(()=>!hs.snapshot.story.waiting);
  for(const [i,m]of [...live.members.values()].entries())Object.assign(m.rider,{x:100+i*8,y:174});
  host.send('interact','chapter:gear');await until(()=>hs.snapshot.story.scene);
  const scene=hs.snapshot.story.scene;host.send('story-next',{id:scene.id,line:scene.line});
  await pause(400);assert.equal(hs.snapshot.story.scene.line,0);assert(!hs.inventory.story.includes('travelGear'));
  const token=guest.reconnectionToken;guest.connection.close();await until(()=>hs.snapshot.story.waiting);
  await pause(400);assert.equal(hs.snapshot.story.scene.line,0);
  gr=await guestClient.reconnect(token);rooms.push(gr);gs=track(gr);await until(()=>gs.snapshot?.story);
  assert.equal(gs.snapshot.story.scene.line,0);assert(gs.snapshot.story.held);loaded(gr);await until(()=>!hs.snapshot.story.waiting);
  gr.send('story-next',{id:scene.id,line:0});await until(()=>hs.snapshot.story.scene.line===1);
  gr.send('story-next',{id:scene.id,line:0});await pause(80);assert.equal(hs.snapshot.story.scene.line,1);
  for(const r of [host,gr])r.send('story-next',{id:scene.id,line:1});
  await until(()=>hs.snapshot.story.step==='nan'&&gs.inventory?.story.includes('travelGear'));
  assert(hs.inventory.story.includes('travelGear'));
  const d=storyGrid(live.story).doors[0],p=doorPoint(d);
  for(const [i,m]of [...live.members.values()].entries())Object.assign(m.rider,{x:p.x+i*20,y:p.y});
  host.send('interact',d.id);await until(()=>hs.snapshot.story.travel?.ready.length===1);assert.equal(live.story.map,'house26_bedroom');
  gr.send('interact',d.id);await until(()=>hs.snapshot.story.map==='house26');assert(hs.snapshot.story.held);
  const member=live.members.get(host.sessionId),x=member.rider.x;
  host.send('input',{seq:0,x:1,y:0});loaded(host);await pause(120);assert.equal(member.rider.x,x);
  loaded(gr);await until(()=>!hs.snapshot.story.held);assert.equal(gs.snapshot.story.map,'house26');
  assert(!JSON.stringify(hs.snapshot.story).includes('guest-account'));
  await host.leave();
 }finally{for(const r of rooms)r.connection?.close();await server.close();}
});
