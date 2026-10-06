/* Shared by the live mixer and publication validator. Values are relative to
   each sound's authored level; the player's master volume stays independent. */
(function(root){
  const effects={coin:'Coins',ui:'UI / confirm',roar:'Dragon roar',distant:'Distant crash',crash:'Dragon landing',wings:'Dragon wings',breathing:'Dragon breathing',breathHit:'Dragon breath hit',hatch:'Egg hatch',golemHit:'Golem hit',hit:'Sword hit',death:'Game over',block:'Shield block',sword:'Sword swing',pickup:'Item collect',key:'Key item',door:'Door open'};
  const songs={lastDragonriderTitleBgm:'Title',emberfellIntroBgm:'Opening story',emberfellSporesBgm:'Sporehollow',emberfellHomeTownBgm:'Home / exploration',emberfellMillwoodBgm:'Millwood',emberfellVillainBgm:'King / villain',emberfellBattleBgm:'Battle',emberfellThornwellBgm:'Thornwell',emberfellFieldBgm:'Field route',emberfellDesertBgm:'Desert route',emberfellSandspireBgm:'Sandspire',emberfellSeatownBgm:'Coralmere',emberfellSchoolBgm:'School',emberfellTavernBgm:'Tavern',emberfellForgewickBgm:'Forgewick',emberfellMysticBgm:'Witchmoor',emberfellDragonRevealBgm:'Dragon reveal',emberfellMineBgm:'Mine',emberfellTempleBgm:'Temple',emberfellCinderholdBgm:'Cinderhold',emberfellHollybeckBgm:'Hollybeck',emberfellSnowRouteBgm:'Snow route',emberfellLavaRouteBgm:'Lava route'};
  const catalog=Object.fromEntries([...Object.entries(effects).map(([k,v])=>['sfx:'+k,v]),...Object.entries(songs).map(([k,v])=>['music:'+k,v])]);
  let base={},changes={},client=null,sequence=0;
  const versions={};
  const listeners=new Set(),sent=new Map(),emit=()=>listeners.forEach(f=>f());
  const valid=(key,value)=>Object.hasOwn(catalog,key)&&Number.isFinite(value)&&value>=0&&value<=2;
  const api=root.EmberAudioMix={catalog,valid,
    level:key=>changes[key]??base[key]??1,
    subscribe:f=>listeners.add(f),
    load:values=>{base=Object.fromEntries(Object.entries(values||{}).filter(([k,v])=>valid(k,v)));emit();},
    set:(key,value)=>{if(!valid(key,value))return;if(changes[key]===value)return;changes[key]=value;versions[key]=++sequence;emit();},
    operations:()=>Object.entries(changes).filter(([key,value])=>value!==(base[key]??1)).map(([key,value])=>({kind:'audio',key,value,before:base[key]??1,client:client||=(root.crypto.randomUUID()),sequence:versions[key]})),
    // Keep an immutable copy even if the player makes more changes mid-publish.
    sending:draft=>sent.set(draft.id,draft.operations.filter(o=>o.kind==='audio')),
    published:id=>{for(const op of sent.get(id)||[]){base[op.key]=op.value;if(changes[op.key]===op.value)delete changes[op.key];}sent.delete(id);emit();},
    reset:()=>{changes={};emit();}
  };
})(globalThis);
