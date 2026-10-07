import {Room,ServerError} from '@colyseus/core';
import {randomInt} from 'node:crypto';
import {PROTOCOL,previewMap,newMember,acceptInput,stepMember,publicMember} from './world.mjs';
import {createBattle,setBattleReady,acceptAction,stepBattle,cancelBattle,publicBattle} from './combat.mjs';
import {createPickupStore,pickupCatalog,pickupNodes,collectPickup,publicInventory,nearbyPickups} from './pickups.mjs';
import {createStory,chapter,storyGrid,joinStory,mapLoaded,storyHeld,storyInteract,advanceStory,stepStory,publicStory,storyPickupAllowed,storyPickedUp,storyBattleAllowed,storyNpcs,forgetStoryVote} from './story.mjs';
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
    async onCreate(options={}){
      this.roomId=Array.from({length:8},()=>alphabet[randomInt(alphabet.length)]).join('');
      await this.setPrivate(true);
      this.members=new Map();this.hostId=null;this.startedAt=Date.now();this.battle=createBattle();
      this.pickups=createPickupStore();this.pickupViews=new Map();
      this.story=options.mode==='story'?createStory():null;
      this.maxMessagesPerSecond=40;
      this.onMessage('input',(client,input)=>{
        const m=this.members.get(client.sessionId);if(m)acceptInput(m,input,Date.now());
      });
      this.onMessage('action',(client,input)=>{const m=this.members.get(client.sessionId);if(m)acceptAction(this.battle,this.members,m,input);});
      this.onMessage('battle-ready',(client,ready)=>{const m=this.members.get(client.sessionId);if(m&&(!this.story||storyBattleAllowed(this.story,this.members,m,this.battle)))setBattleReady(this.battle,this.members,m,ready);});
      this.onMessage('map-loaded',(client,data)=>{const m=this.members.get(client.sessionId);if(m&&this.story)mapLoaded(this.story,m,data);});
      this.onMessage('story-next',(client,data)=>{const m=this.members.get(client.sessionId);if(m&&this.story)advanceStory(this.story,this.members,m,data);});
      this.onMessage('interact',(client,id)=>{
        const m=this.members.get(client.sessionId);if(!m||!this.story||['active','countdown'].includes(this.battle.phase))return;
        const reason=storyInteract(this.story,this.members,m,id);
        if(reason)client.send('pickup-result',{ok:false,reason});this.sendSnapshot();
      });
      this.onMessage('pickup',(client,id)=>{
        const member=this.members.get(client.sessionId);if(!member)return;
        const node=pickupNodes.get(id),s=this.story;
        if(s&&(s.map!=='world'||storyHeld(s,this.members)||node?.kind==='story'&&!storyPickupAllowed(s,member,this.members,node.item))){
          client.send('pickup-result',{ok:false,reason:s.scene?'Finish the conversation first.':'Follow the current story objective and bring your partner nearby.'});return;
        }
        const result=collectPickup(this.pickups,member,id,Date.now(),this.battle,s?storyGrid(s):previewMap);
        if(result.ok&&result.kind==='story'&&s)storyPickedUp(s,member);
        if(result.ok&&result.kind==='story')this.broadcast('pickup-result',{...result,by:member.profile.name});
        else client.send('pickup-result',result);
        if(result.ok)for(const peer of this.clients)this.sendPickups(peer);
      });
      this.onMessage('ready',client=>{client.send('welcome',{protocol:PROTOCOL,roomId:this.roomId,hostId:this.hostId,
        bounds:{x:0,y:0,w:previewMap.width*previewMap.tile,h:previewMap.height*previewMap.tile},
        pickupCatalog:{materials:pickupCatalog.materials,storyItems:this.story?{...pickupCatalog.storyItems,egg:{...pickupCatalog.storyItems.egg,name:'Two dragon eggs'}}:pickupCatalog.storyItems}});this.sendPickups(client,true);this.sendSnapshot();});
      this.onMessage('ping',(client)=>client.send('pong',Date.now()));
      this.setSimulationInterval(delta=>{
        const now=Date.now(),dt=Math.min(.05,Math.max(0,delta/1000)),b=this.battle;
        stepBattle(b,this.members,dt);
        if(this.story){stepStory(this.story,this.pickups,this.members,dt,b);for(const m of this.members.values())m.dragon.available=this.story.hasDragon;}
        if(!b.paused){const inBattle=['active','countdown'].includes(b.phase);
          const s=this.story,npcs=s?storyNpcs(s).map(n=>({...n,hp:1,radius:7})):[];
          for(const m of this.members.values())stepMember(m,dt,now,{time:b.now,held:b.phase==='countdown'||s&&storyHeld(s,this.members),
            grid:s?storyGrid(s):previewMap,arena:inBattle?b.arena:null,bodies:inBattle?b.enemies.filter(e=>e.hp>0):npcs});
        }
        this.sendSnapshot();
        if(now-(this.lastPickupSync||0)>=250){this.lastPickupSync=now;for(const client of this.clients)this.sendPickups(client);}
      },50);
    }
    onJoin(client,options,auth){
      if(!auth?.uid)throw new ServerError(401,'Sign in with Google first.');
      if([...this.members.values()].some(m=>m.uid===auth.uid))throw new ServerError(409,'Use a different Google account for the second player.');
      if(this.members.size>=2)throw new ServerError(403,'This adventure already has two players.');
      if(!this.hostId)this.hostId=client.sessionId;
      const slot=this.members.size;
      const member=newMember(client.sessionId,auth.uid,options.profile,slot);this.members.set(client.sessionId,member);
      if(this.story){joinStory(this.story,member,this.members);member.dragon.available=this.story.hasDragon;}
      this.sendSnapshot();
    }
    sendSnapshot(){this.broadcast('snapshot',{hostId:this.hostId,players:[...this.members.values()].map(publicMember),battle:publicBattle(this.battle),story:this.story?publicStory(this.story,this.members):null});}
    sendPickups(client,force=false){
      const member=this.members.get(client.sessionId);if(!member?.connected)return;
      const inventory=publicInventory(this.pickups,member.uid),s=this.story;
      const nodes=s&&s.map!=='world'?[]:nearbyPickups(this.pickups,member,Date.now()).filter(n=>!s||n.kind!=='story'||chapter(s).pickup===n.item);
      const old=this.pickupViews.get(client.sessionId)||{},key=nodes.map(n=>n.id).join('|');
      if(force||old.revision!==inventory.revision)client.send('inventory',inventory);
      if(force||old.key!==key)client.send('nearby-pickups',nodes);
      this.pickupViews.set(client.sessionId,{revision:inventory.revision,key});
    }
    async onDrop(client){
      const member=this.members.get(client.sessionId);if(!member)return;
      member.connected=false;member.ready=false;member.input={x:0,y:0};
      if(this.story){member.loading=true;forgetStoryVote(this.story,member.uid);}
      this.battle.paused=['active','countdown'].includes(this.battle.phase);this.sendSnapshot();
      try{await this.allowReconnection(client,30);}catch{this.removeMember(client.sessionId);}
    }
    onReconnect(client){const member=this.members.get(client.sessionId);if(member){member.connected=true;member.lastInput=0;}this.sendSnapshot();}
    onLeave(client){this.removeMember(client.sessionId);}
    removeMember(id){
      if(!this.members?.has(id))return;
      if(this.story)forgetStoryVote(this.story,this.members.get(id).uid);
      this.members.delete(id);
      this.pickupViews.delete(id);
      cancelBattle(this.battle,this.members);
      if(id===this.hostId){this.broadcast('ended','The host left. Create a new room to continue the preview.');void this.disconnect();}
      else this.sendSnapshot();
    }
  };
}
