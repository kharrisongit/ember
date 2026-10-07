import express from 'express';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import {Server} from '@colyseus/core';
import {WebSocketTransport} from '@colyseus/ws-transport';
import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {makeCoopRoom} from './room.mjs';
import {PROTOCOL} from './world.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
export async function startServer({port=Number(process.env.PORT)||2567,host='0.0.0.0',verifyIdentity}={}){
  if(!verifyIdentity){
    if(process.env.FIREBASE_AUTH_EMULATOR_HOST)throw Error('The deployed co-op server must verify real Firebase tokens.');
    const projectId=process.env.FIREBASE_PROJECT_ID||'lastdragonridergame';
    const firebase=initializeApp({projectId},'ldr-coop-'+port);
    // Public Google signing certificates suffice for ID-token validation.
    // This service has no Firebase database access or service-account key.
    verifyIdentity=async token=>{const user=await getAuth(firebase).verifyIdToken(token);if(!user.uid||user.firebase?.sign_in_provider!=='google.com')throw Error('Google sign-in required');return {uid:user.uid};};
  }
  const app=express();app.disable('x-powered-by');
  app.use((req,res,next)=>{res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');next();});
  // Bound anonymous matchmaking traffic; tokens are verified by Room.onAuth.
  const attempts=new Map();
  app.use('/matchmake',(req,res,next)=>{
    const now=Date.now(),key=req.socket.remoteAddress||'unknown';
    if(attempts.size>10000)attempts.clear();
    let item=attempts.get(key);if(!item||now-item.time>60000){item={time:now,n:0};attempts.set(key,item);}
    if(++item.n>120)return res.status(429).json({error:'Too many room requests. Wait a minute and try again.'});next();
  });
  app.get('/healthz',(_req,res)=>res.json({ok:true,game:'The Last Dragonrider',milestone:'shared-combat-preview',protocol:PROTOCOL}));
  app.get('/coop-sdk.js',(_req,res)=>res.sendFile(path.join(root,'multiplayer/node_modules/@colyseus/sdk/dist/colyseus.js')));
  app.get(['/', '/index.html'],(_req,res)=>{
    const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('</body>',
      '<link rel="stylesheet" href="/css/coop-preview.css"><script src="/coop-sdk.js"></script><script src="/js/coop-preview.js"></script></body>');
    res.setHeader('Cache-Control','no-store');res.type('html').send(html);
  });
  // Serve game assets only: server code, environment files and dependencies stay private.
  for(const dir of ['assets','css','js'])app.use('/'+dir,express.static(path.join(root,dir),{dotfiles:'deny',maxAge:dir==='assets'?'1h':0}));
  const http=createServer(app);
  const gameServer=new Server({transport:new WebSocketTransport({server:http,maxPayload:16*1024}),greet:false});
  gameServer.define('story_coop_preview',makeCoopRoom(verifyIdentity));
  await gameServer.listen(port,host);
  return {gameServer,http,port:http.address().port,close:()=>gameServer.gracefullyShutdown(false)};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const server=await startServer();console.log(`LDR co-op combat preview listening on ${server.port}`);
}
