/* The host runs the unmodified campaign systems. This authenticated room relays
 * bounded presentation packets and guest controls; guests never submit game state. */
import {Room,ServerError} from '@colyseus/core';
import {randomInt} from 'node:crypto';
export const CAMPAIGN_PROTOCOL=6;
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const size=value=>Buffer.byteLength(JSON.stringify(value));
const profile=p=>({name:String(p?.name||'Dragonrider').replace(/[<>\x00-\x1f]/g,'').slice(0,16),hair:['dark','brown','copper','blond','silver'].includes(p?.hair)?p.hair:'brown',eyes:['brown','blue','green','gray','hazel'].includes(p?.eyes)?p.eyes:'brown'});
export function makeCampaignRoom(verifyIdentity){return class CampaignRoom extends Room{
  maxClients=2;
  async onCreate(){
    this.roomId=Array.from({length:8},()=>alphabet[randomInt(alphabet.length)]).join('');
    await this.setPrivate(true);this.members=new Map();this.hostId=null;this.checkpoint=null;this.maxMessagesPerSecond=180;
    this.onMessage('ready',client=>{this.memberList();this.host()?.send('refresh',{id:client.sessionId});if(this.checkpoint)client.send('checkpoint',this.checkpoint);});
    this.onMessage('viewport',(client,data)=>{if(client.sessionId!==this.hostId&&Number.isFinite(data?.w)&&Number.isFinite(data?.h))this.host()?.send('viewport',{w:Math.round(Math.max(320,Math.min(1280,data.w))),h:Math.round(Math.max(160,Math.min(960,data.h)))});});
    this.onMessage('input',(client,data)=>{
      const m=this.members.get(client.sessionId);if(!m||client.sessionId===this.hostId||!data||!Number.isSafeInteger(data.seq)||data.seq<=m.seq)return;
      if(!Number.isFinite(data.x)||!Number.isFinite(data.y))return;m.seq=data.seq;
      this.host()?.send('input',{id:client.sessionId,seq:data.seq,x:Math.max(-1,Math.min(1,data.x)),y:Math.max(-1,Math.min(1,data.y)),run:!!data.run});
    });
    this.onMessage('command',(client,data)=>{
      const m=this.members.get(client.sessionId);if(!m||client.sessionId===this.hostId||!data||size(data)>2048||!Number.isSafeInteger(data.seq)||data.seq<=m.commandSeq)return;
      const allowed=['action','back','bag','dragon','orders','map','fire','claw','revive','up','down','left','right','ui','release','save','control','key'];
      if(!allowed.includes(data.kind))return;
      if(data.kind==='control'&&(!['act','btnB','btnL','btnR','btnItems','btnMapQuick'].includes(data.control)||typeof data.down!=='boolean'))return;
      if(data.kind==='key'&&(typeof data.key!=='string'||!['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','b',' ','enter','escape'].includes(data.key.toLowerCase())||typeof data.down!=='boolean'))return;
      m.commandSeq=data.seq;
      this.host()?.send('command',{...data,id:client.sessionId});
    });
    for(const type of ['frame','texture','ui','status','checkpoint','sfx'])this.onMessage(type,(client,data)=>{
      if(client.sessionId!==this.hostId||!data||size(data)>(type==='frame'?450000:type==='texture'?350000:type==='checkpoint'?250000:100000))return;
      const now=Date.now();if(!this.byteAt||now-this.byteAt>1000){this.byteAt=now;this.bytes=0;}this.bytes+=size(data);if(this.bytes>4*1024*1024)return;
      if(type==='checkpoint'){
        if(data.version!==1||typeof data.id!=='string'||typeof data.save?.map!=='string'||!Number.isInteger(data.save?.quest))return;
        this.checkpoint=data;
      }
      this.broadcast(type,data,{except:client});
    });
    this.onMessage('need',(client,data)=>{if(client.sessionId!==this.hostId&&Array.isArray(data)&&data.length<=100&&data.every(id=>typeof id==='string'&&id.length<180))this.host()?.send('need',data);});
    this.onMessage('ack',(client,data)=>{if(client.sessionId!==this.hostId&&Number.isSafeInteger(data))this.host()?.send('ack',data);});
    this.onMessage('refresh',client=>{if(client.sessionId!==this.hostId)this.host()?.send('refresh',{id:client.sessionId});});
    this.onMessage('visibility',(client,visible)=>{const m=this.members.get(client.sessionId);if(m){m.visible=visible===true;this.memberList();}});
    this.onMessage('ping',client=>client.send('pong',Date.now()));
  }
  async onAuth(client,options,context){
    if(options.protocol!==CAMPAIGN_PROTOCOL)throw new ServerError(400,'Reload the game to update co-op.');
    if(typeof context.token!=='string'||context.token.length>8192)throw new ServerError(401,'Sign in with Google first.');
    let identity;try{identity=await verifyIdentity(context.token);}catch{throw new ServerError(401,'Sign in with Google again.');}
    if(!identity?.uid)throw new ServerError(401,'Sign in with Google first.');
    if([...this.members.values()].some(m=>m.uid===identity.uid))throw new ServerError(409,'Each rider needs a different Google account.');
    return identity;
  }
  onJoin(client,options,identity){
    if([...this.members.values()].some(m=>m.uid===identity.uid))throw new ServerError(409,'Each rider needs a different Google account.');
    if(!this.hostId)this.hostId=client.sessionId;
    this.members.set(client.sessionId,{id:client.sessionId,uid:identity.uid,profile:profile(options.profile),connected:true,visible:true,seq:-1,commandSeq:-1});this.memberList();
  }
  host(){return this.clients.find(c=>c.sessionId===this.hostId);}
  memberList(){this.broadcast('members',{hostId:this.hostId,players:[...this.members.values()].map(({seq,commandSeq,...m})=>m)});}
  async onDrop(client){const m=this.members.get(client.sessionId);if(!m)return;m.connected=false;this.memberList();try{await this.allowReconnection(client,60);}catch{this.remove(client.sessionId);}}
  onReconnect(client){const m=this.members.get(client.sessionId);if(m){m.connected=true;m.visible=true;this.memberList();this.host()?.send('refresh',{id:client.sessionId});}}
  onLeave(client){this.remove(client.sessionId);}
  remove(id){if(!this.members.has(id))return;this.members.delete(id);if(id===this.hostId){this.broadcast('ended','The host left. Resume the co-op save to continue.');void this.disconnect();}else this.memberList();}
};}
