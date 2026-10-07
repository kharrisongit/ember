import test from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@colyseus/sdk';
import {matchMaker} from '@colyseus/core';
import {startServer} from '../src/server.mjs';
import {PROTOCOL,newMember,acceptInput,stepMember,canStand,profileOf,publicMember} from '../src/world.mjs';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,timeout=2500){const end=Date.now()+timeout;while(Date.now()<end){const value=check();if(value)return value;await pause(25);}throw Error('Timed out waiting for network state');}
function track(room){room.reconnection.enabled=false;let latest;const read=()=>latest;room.onMessage('snapshot',value=>latest=value);room.onMessage('welcome',()=>{});room.onMessage('inventory',value=>read.inventory=value);room.onMessage('nearby-pickups',value=>read.pickups=value);room.onMessage('pickup-result',value=>read.result=value);room.onMessage('ended',()=>{});room.onMessage('pong',()=>{});room.send('ready');return read;}
function client(url,token){const c=new Client(url);c.auth.token=token;return c;}
test('movement validates input, respects world walls and expires stale controls',()=>{
 const p=newMember('id','uid',{name:'<script>bad</script>',hair:'silver'},0);
 assert.equal(profileOf({name:'<script>'}).name,'script');
 assert.equal(acceptInput(p,{seq:0,x:Infinity,y:0},1000),false);
 assert.equal(acceptInput(p,{seq:0,x:2,y:0},1000),false);
 assert.equal(acceptInput(p,{seq:0,x:1,y:0,position:{x:1e9}},1000),true);
 assert.equal(acceptInput(p,{seq:0,x:0,y:0},1001),false);
 const x=p.rider.x;stepMember(p,.05,1050);assert(p.rider.x>x&&p.rider.x<=x+5.9);
 const stopped=p.rider.x;stepMember(p,.05,1400);assert.equal(p.rider.x,stopped);
 for(let n=1;n<1000;n++){acceptInput(p,{seq:n,x:-1,y:0},2000+n*50);stepMember(p,.05,2000+n*50);assert(canStand(p.rider.x,p.rider.y));}
 assert(!('uid' in publicMember(p)));assert(!('input' in publicMember(p)));
});
test('private authenticated room, movement, independent ingredients, shared story, combat and reconnect',{timeout:20000},async()=>{
 const server=await startServer({port:0,host:'127.0.0.1',verifyIdentity:async token=>{if(!['host','guest','third'].includes(token))throw Error('invalid');return {uid:token};}});
 const url='http://127.0.0.1:'+server.port;const rooms=[];
 try{
  assert.equal((await fetch(url+'/healthz')).status,200);
  assert.equal((await fetch(url+'/multiplayer/src/server.mjs')).status,404);
  const html=await (await fetch(url)).text();assert(html.includes('/js/coop-preview.js'));
  await assert.rejects(()=>client(url,'bad').create('story_coop_preview',{protocol:PROTOCOL}),/Google|401/);
  await assert.rejects(()=>client(url,'host').create('story_coop_preview',{protocol:0}),/reload|400/);
  const host=await client(url,'host').create('story_coop_preview',{protocol:PROTOCOL,profile:{name:'Host'}});rooms.push(host);const hs=track(host);
  assert.match(host.roomId,/^[A-HJ-NP-Z2-9]{8}$/);
  await assert.rejects(()=>client(url,'host').joinById(host.roomId,{protocol:PROTOCOL}),/different Google|409/);
  const guestClient=client(url,'guest'),guest=await guestClient.joinById(host.roomId,{protocol:PROTOCOL,profile:{name:'Guest',hair:'blond'}});rooms.push(guest);const gs=track(guest);
  await until(()=>hs()?.players.length===2&&gs()?.players.length===2);
  await assert.rejects(()=>client(url,'third').joinById(host.roomId,{protocol:PROTOCOL}),/locked|full/);
  const initial=hs().players.find(p=>p.id===host.sessionId).rider.x;
  host.send('input',{seq:0,x:1,y:0});
  await until(()=>gs()?.players.find(p=>p.id===host.sessionId).rider.x>initial);
  const live=matchMaker.getLocalRoomById(host.roomId);
  for(const m of live.members.values()){Object.assign(m.rider,{x:768,y:4920});m.input={x:0,y:0};}
  await until(()=>hs.pickups?.some(n=>n.id==='craft:intro:herb')&&gs.pickups?.some(n=>n.id==='craft:intro:herb'));
  host.send('pickup','craft:intro:herb');
  await until(()=>hs.inventory?.ingredients.herb===2);
  assert.equal(gs.inventory.ingredients.herb,undefined);
  assert(gs.pickups.some(n=>n.id==='craft:intro:herb'));
  guest.send('pickup','craft:intro:herb');
  await until(()=>gs.inventory?.ingredients.herb===2);
  Object.assign(live.members.get(host.sessionId).rider,{x:184,y:6896});
  host.send('pickup','story:eggs');
  await until(()=>hs.inventory.story.includes('eggs')&&gs.inventory.story.includes('eggs'));
  assert.equal(gs.inventory.story.filter(item=>item==='eggs').length,1);
  host.send('battle-ready',true);guest.send('battle-ready',true);
  await until(()=>hs()?.battle.phase==='countdown');
  await until(()=>hs()?.battle.phase==='active',5000);
  host.send('action',{seq:0,kind:'fire',damage:9999,target:'fake'});
  await until(()=>gs()?.battle.enemies.some(e=>e.hp<e.maxHp));
  assert(gs().battle.enemies.every(e=>e.hp>=7));
  assert(hs().players.find(p=>p.id===host.sessionId).cooldowns.fire>hs().battle.now);
  assert.equal(hs().players.find(p=>p.id===guest.sessionId).cooldowns.fire,0);
  const token=guest.reconnectionToken;guest.connection.close();
  await until(()=>hs()?.players.find(p=>p.id===guest.sessionId)?.connected===false);
  await until(()=>hs()?.battle.paused===true);
  const paused=hs().battle.now;await pause(150);assert.equal(hs().battle.now,paused);
  const recovered=await guestClient.reconnect(token);rooms.push(recovered);const rs=track(recovered);
  await until(()=>hs()?.players.find(p=>p.id===guest.sessionId)?.connected===true);
  await until(()=>rs.inventory?.ingredients.herb===2&&rs.inventory.story.includes('eggs'));
  assert.equal(recovered.sessionId,guest.sessionId);
  const closed=new Promise(resolve=>recovered.onLeave(resolve));await host.leave();await closed;
 }finally{for(const room of rooms)room.connection?.close();await server.close();}
});
