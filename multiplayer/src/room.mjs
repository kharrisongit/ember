import {Room,ServerError} from '@colyseus/core';
import {randomInt} from 'node:crypto';
import {PROTOCOL,previewMap,newMember,acceptInput,stepMember,publicMember} from './world.mjs';
import {createBattle,setBattleReady,acceptAction,stepBattle,cancelBattle,publicBattle} from './combat.mjs';
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function makeCoopRoom(verifyIdentity) {
  return class CoopRoom extends Room {
    maxClients=2;
    async onAuth(client,options,context) {
      const token=context.token;
      if(options.protocol!==PROTOCOL)throw new ServerError(400,'Please reload the co-op preview.');
      if(typeof token!=='string'||token.length>8192)throw new ServerError(401,'Sign in with Google first.');
      let identity;try{identity=await verifyIdentity(token);}catch{throw new ServerError(401,'Your Google session expired. Sign in again.');}
      if([...this.members.values()].some(m=>m.uid===identity.uid))throw new ServerError(409,'Use a different Google account for the second player.');
      return identity;
    }
    async onCreate(){
      this.roomId=Array.from({length:8},()=>alphabet[randomInt(alphabet.length)]).join('');
      await this.setPrivate(true);
      this.members=new Map();this.hostId=null;this.startedAt=Date.now();this.battle=createBattle();
      this.maxMessagesPerSecond=40;
      this.onMessage('input',(client,input)=>{
        const m=this.members.get(client.sessionId);if(m)acceptInput(m,input,Date.now());
      });
      this.onMessage('action',(client,input)=>{const m=this.members.get(client.sessionId);if(m)acceptAction(this.battle,this.members,m,input);});
      this.onMessage('battle-ready',(client,ready)=>{const m=this.members.get(client.sessionId);if(m)setBattleReady(this.battle,this.members,m,ready);});
      this.onMessage('ready',client=>{client.send('welcome',{protocol:PROTOCOL,roomId:this.roomId,hostId:this.hostId,
        bounds:{x:0,y:0,w:previewMap.width*previewMap.tile,h:previewMap.height*previewMap.tile}});this.sendSnapshot();});
      this.onMessage('ping',(client)=>client.send('pong',Date.now()));
      this.setSimulationInterval(delta=>{
        const now=Date.now(),dt=Math.min(.05,Math.max(0,delta/1000)),b=this.battle;
        stepBattle(b,this.members,dt);
        if(!b.paused){const inBattle=['active','countdown'].includes(b.phase);
          for(const m of this.members.values())stepMember(m,dt,now,{time:b.now,held:b.phase==='countdown',
            arena:inBattle?b.arena:null,bodies:inBattle?b.enemies.filter(e=>e.hp>0):[]});
        }
        this.sendSnapshot();
      },50);
    }
    onJoin(client,options,auth){
      if(!auth?.uid)throw new ServerError(401,'Sign in with Google first.');
      if([...this.members.values()].some(m=>m.uid===auth.uid))throw new ServerError(409,'Use a different Google account for the second player.');
      if(this.members.size>=2)throw new ServerError(403,'This adventure already has two players.');
      if(!this.hostId)this.hostId=client.sessionId;
      const slot=this.members.size;
      this.members.set(client.sessionId,newMember(client.sessionId,auth.uid,options.profile,slot));
      this.sendSnapshot();
    }
    sendSnapshot(){this.broadcast('snapshot',{hostId:this.hostId,players:[...this.members.values()].map(publicMember),battle:publicBattle(this.battle)});}
    async onDrop(client){
      const member=this.members.get(client.sessionId);if(!member)return;
      member.connected=false;member.ready=false;member.input={x:0,y:0};
      this.battle.paused=['active','countdown'].includes(this.battle.phase);this.sendSnapshot();
      try{await this.allowReconnection(client,30);}catch{this.removeMember(client.sessionId);}
    }
    onReconnect(client){const member=this.members.get(client.sessionId);if(member){member.connected=true;member.lastInput=0;}this.sendSnapshot();}
    onLeave(client){this.removeMember(client.sessionId);}
    removeMember(id){
      if(!this.members?.has(id))return;
      this.members.delete(id);
      cancelBattle(this.battle,this.members);
      if(id===this.hostId){this.broadcast('ended','The host left. Create a new room to continue the preview.');void this.disconnect();}
      else this.sendSnapshot();
    }
  };
}
