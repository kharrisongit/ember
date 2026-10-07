import test from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@colyseus/sdk';
import {startServer} from '../src/server.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<120;i++){if(fn())return;await wait(20);}throw Error('Network timeout');}
test('campaign relay authenticates two different accounts, restricts authority, expires stale commands, reconnects and preserves checkpoints',{timeout:15000},async()=>{
 const server=await startServer({port:0,host:'127.0.0.1',verifyIdentity:async token=>{if(!['host','guest','third'].includes(token))throw Error('unauthorized');return {uid:token};}});
 const rooms=[],url='http://127.0.0.1:'+server.port;
 const client=token=>{const c=new Client(url);c.auth.token=token;return c;};
 function track(r){rooms.push(r);r.reconnection.enabled=false;const messages={};for(const name of ['members','frame','texture','input','command','checkpoint','refresh','ack','need','viewport','ui','status','sfx','ended'])r.onMessage(name,data=>{messages[name]=data;});r.send('ready');return messages;}
 try{
  assert.equal((await (await fetch(url+'/healthz')).json()).protocol,6);
  await assert.rejects(()=>client('invalid').create('story_campaign',{protocol:6}),/Google/);
  await assert.rejects(()=>client('host').create('story_campaign',{protocol:4}),/Reload/);
  const h=await client('host').create('story_campaign',{protocol:6,profile:{name:'Host'}}),hs=track(h);
  await assert.rejects(()=>client('host').joinById(h.roomId,{protocol:6}),/different/);
  const gc=client('guest'),g=await gc.joinById(h.roomId,{protocol:6,profile:{name:'Guest'}}),gs=track(g);
  await until(()=>hs.members?.players.length===2&&gs.members?.players.length===2);
  await assert.rejects(()=>client('third').joinById(h.roomId,{protocol:6}),/locked|full/);
  g.send('frame',{seq:1,width:300,height:300,ops:[]});await wait(70);assert.equal(hs.frame,undefined);
  g.send('input',{seq:1,x:1,y:0});await until(()=>hs.input?.seq===1);assert.equal(hs.input.id,g.sessionId);
  g.send('input',{seq:0,x:0,y:99});await wait(60);assert.equal(hs.input.seq,1);
  g.send('command',{seq:1,kind:'ui',token:'test',version:4});await until(()=>hs.command?.seq===1);
  g.send('command',{seq:2,kind:'execute',code:'arbitrary code'});await wait(60);assert.equal(hs.command.seq,1);
  g.send('command',{seq:3,kind:'control',control:'btnB',down:true});await until(()=>hs.command?.seq===3);assert.equal(hs.command.id,g.sessionId);
  g.send('command',{seq:4,kind:'control',control:'btnDev',down:true});await wait(60);assert.equal(hs.command.seq,3,'Remote controller cannot invoke developer controls');
  g.send('command',{seq:5,kind:'control',control:'btnB',down:false});await until(()=>hs.command?.seq===5);assert.equal(hs.command.down,false);
  g.send('command',{seq:6,kind:'key',key:'ArrowRight',down:true});await until(()=>hs.command?.seq===6);
  g.send('command',{seq:7,kind:'key',key:'F12',down:true});await wait(60);assert.equal(hs.command.seq,6);
  h.send('frame',{seq:4,width:640,height:480,ops:[]});await until(()=>gs.frame?.seq===4);
  const checkpoint={version:1,id:'adventure',when:1,save:{map:'world',quest:9,x:700,y:6000,when:1},players:{host:{hp:6},guest:{hp:4}}};
  h.send('checkpoint',checkpoint);await until(()=>gs.checkpoint?.id==='adventure');
  g.send('checkpoint',{...checkpoint,id:'forged'});await wait(60);assert.equal(hs.checkpoint,undefined);
  g.send('viewport',{w:390,h:650});await until(()=>hs.viewport?.w===390);
  g.send('visibility',false);await until(()=>hs.members.players.find(p=>p.id===g.sessionId).visible===false);
  const token=g.reconnectionToken;g.connection.close();await until(()=>hs.members.players.find(p=>p.id===g.sessionId).connected===false);
  const recovered=await gc.reconnect(token),rs=track(recovered);await until(()=>rs.checkpoint?.id==='adventure');assert.equal(recovered.sessionId,g.sessionId);
  await h.leave();await until(()=>rs.ended);assert.match(rs.ended,/Resume/);
 }finally{for(const r of rooms)r.connection?.close();await server.close();}
});
