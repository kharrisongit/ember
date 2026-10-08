/* Account-scoped local saves and revision-checked cloud synchronization. */
(function(root){
  'use strict';
  const validSlot=n=>Number.isInteger(n)&&n>=1&&n<=3;
  const parse=s=>{try{return JSON.parse(s);}catch{return null;}};
  function validSave(raw){
    if(typeof raw!=='string'||raw.length>262144)return false;
    const s=parse(raw);
    return !!s&&typeof s==='object'&&!Array.isArray(s)&&typeof s.map==='string'&&
      Number.isFinite(s.x)&&Number.isFinite(s.y)&&Number.isInteger(s.quest)&&Number.isFinite(s.when);
  }
  function validRemote(d){
    return d===null||!!d&&d.format===1&&typeof d.revision==='string'&&d.revision.length<=80&&
      typeof d.deleted==='boolean'&&(d.deleted?d.saveJson==='':validSave(d.saveJson));
  }
  class CloudSaveStore{
    constructor(storage,options={}){
      this.storage=storage;this.makeId=options.makeId||(()=>root.crypto.randomUUID());
      this.owner=storage.getItem('ember.cloud.owner')||'';this.conflicts=new Map();
      this.onChange=()=>{};this.onDirty=()=>{};
    }
    key(slot,owner=this.owner){if(!validSlot(slot))throw Error('Invalid save slot');return owner?'emberfell.account.'+owner+'.save.'+slot:'emberfell.save.'+slot;}
    metaKey(slot,owner=this.owner){return this.key(slot,owner)+'.cloud';}
    meta(slot,owner=this.owner){return parse(this.storage.getItem(this.metaKey(slot,owner)))||{base:null,dirty:false,writeId:null};}
    setMeta(slot,value,owner=this.owner){this.storage.setItem(this.metaKey(slot,owner),JSON.stringify(value));}
    activate(owner){this.owner=owner||'';this.storage.setItem('ember.cloud.owner',this.owner);this.conflicts.clear();this.onChange();}
    saved(slot){
      if(!this.owner)return;
      this.setMeta(slot,{...this.meta(slot),dirty:true,writeId:this.makeId()});this.onChange();this.onDirty();
    }
    removeCampaign(raw){
      const id=parse(raw)?.coop?.id;if(typeof id!=='string')return;
      const key='ldr.coop.campaigns.'+this.owner,saves=parse(this.storage.getItem(key));
      if(Array.isArray(saves))this.storage.setItem(key,JSON.stringify(saves.filter(s=>s.id!==id)));
    }
    remove(slot){
      const key=this.key(slot),raw=this.storage.getItem(key);
      this.removeCampaign(raw);
      if(!this.owner){
        // Deleted device saves must never be resurrected by legacy migration.
        this.storage.setItem('emberfell.save.migrated','1');
        if(this.storage.getItem('emberfell.save')===raw)this.storage.removeItem('emberfell.save');
      }
      this.storage.removeItem(key);
      this.saved(slot);this.onChange();
    }
    dirtySlots(){return [1,2,3].filter(n=>this.meta(n).dirty);}
    backup(slot,...values){
      const key=this.key(slot)+'.backups',old=parse(this.storage.getItem(key))||[];
      const unique=[...new Set([...values,...old].filter(v=>v!==null))].slice(0,3);
      this.storage.setItem(key,JSON.stringify(unique));
    }
    apply(slot,remote){
      if(remote&&!remote.deleted)this.storage.setItem(this.key(slot),remote.saveJson);
      else {this.removeCampaign(this.storage.getItem(this.key(slot)));this.storage.removeItem(this.key(slot));}
      this.setMeta(slot,{base:remote?.revision||null,dirty:false,writeId:null});this.conflicts.delete(slot);this.onChange();
    }
    async syncSlot(slot,transport,canPull=()=>true){
      const owner=this.owner;if(!owner)return;
      const meta=this.meta(slot),raw=this.storage.getItem(this.key(slot));
      if(raw!==null&&!validSave(raw))throw Error('This device save cannot be synced. It has been kept locally.');
      const result=await transport.transact(owner,slot,remote=>{
        if(!validRemote(remote))throw Error('The cloud save format is not supported. Nothing was overwritten.');
        const revision=remote?.revision||null;
        if(meta.dirty){
          if(revision===meta.writeId)return {kind:'ack',remote};
          if(revision!==meta.base)return {kind:'conflict',remote};
          const doc={format:1,revision:meta.writeId,parent:meta.base,deleted:raw===null,saveJson:raw||''};
          return {kind:'ack',remote:doc,write:doc};
        }
        if(revision===meta.base)return {kind:'same',remote};
        if(raw!==null&&(!remote||meta.base===null))return {kind:'conflict',remote};
        return {kind:'pull',remote};
      });
      if(owner!==this.owner)return;
      const current=this.meta(slot),currentRaw=this.storage.getItem(this.key(slot));
      if(result.kind==='ack'){
        // A new autosave during upload remains queued, based on the acknowledged revision.
        this.setMeta(slot,{...current,base:result.remote.revision,dirty:current.writeId!==meta.writeId});
        this.conflicts.delete(slot);
      }else if(result.kind==='conflict')this.conflicts.set(slot,result.remote);
      else if(result.kind==='pull'){
        if(current.writeId!==meta.writeId||currentRaw!==raw||!canPull())this.conflicts.set(slot,result.remote);
        else {this.backup(slot,raw);this.apply(slot,result.remote);}
      }
      this.onChange();
    }
    keepDevice(slot){
      if(!this.conflicts.has(slot))return;
      const remote=this.conflicts.get(slot),raw=this.storage.getItem(this.key(slot));
      this.backup(slot,raw,remote?.saveJson||null);
      this.setMeta(slot,{base:remote?.revision||null,dirty:true,writeId:this.makeId()});
      this.conflicts.delete(slot);this.onChange();this.onDirty();
    }
    async useCloud(slot,transport,canPull=()=>true){
      if(!this.conflicts.has(slot)||!canPull())return false;
      const owner=this.owner,expected=this.conflicts.get(slot),raw=this.storage.getItem(this.key(slot)),nonce=this.meta(slot).writeId;
      const result=await transport.transact(owner,slot,remote=>{
        if(!validRemote(remote))throw Error('Unsupported cloud save.');return {remote};
      });
      if(owner!==this.owner)return false;
      if((result.remote?.revision||null)!==(expected?.revision||null)||this.meta(slot).writeId!==nonce||!canPull()){
        this.conflicts.set(slot,result.remote);this.onChange();return false;
      }
      this.backup(slot,raw,result.remote?.saveJson||null);this.apply(slot,result.remote);return true;
    }
    importGuest(slot){
      if(!this.owner)return false;
      const raw=this.storage.getItem(this.key(slot,''));if(!validSave(raw))return false;
      const target=[1,2,3].find(n=>!this.storage.getItem(this.key(n))&&!this.conflicts.has(n));
      if(!target)return false;
      this.storage.setItem(this.key(target),raw);this.saved(target);return target;
    }
  }
  root.EmberCloudSaveStore=CloudSaveStore;
  root.EmberCloudSaveValid=validSave;
  try{root.EmberCloudState=new CloudSaveStore(root.localStorage);}catch(e){console.warn('Cloud save cache unavailable',e);}
})(globalThis);
