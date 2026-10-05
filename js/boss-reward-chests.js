/* Relic chests replace fallen bosses once their death artwork has faded. */
const BossRewardChests=(()=>{
  const prizes={
    spiderqueen:{map:'pyramid_queen',id:'pyramid_queen:emberheart',item:'emberheart',gold:160,fade:1},
    frosthorn:{map:'world',id:'world:frosthorn:frostheart',item:'frostheart',gold:0,fade:2.4},
    icemoth:{map:'world',id:'world:ice-moth:soulwing',item:'soulwing',gold:0,fade:2.5}
  };
  let drops={};
  const won=kind=>kind==='spiderqueen'?DesertAdventure.won():kind==='frosthorn'?Frosthorn.defeatedAlready():IceMoth.defeatedAlready();
  function defeated(f){
    const prize=prizes[f.kind];
    if(!prize||f.ally||MAPID!==prize.map||drops[f.kind]||houseLootTaken.has(prize.id))return false;
    // Capture the actual ground position before another frame or map change.
    drops[f.kind]={map:MAPID,x:f.x,y:f.y};
    return true;
  }
  function place(kind){
    const drop=drops[kind],prize=prizes[kind];
    if(!drop||drop.map!==MAPID)return;
    const actors=MD.roomActors||=[];
    if(actors.some(a=>a.bossRewardKind===kind))return;
    // No collision block: a boss may fall directly beneath Corin or Aurelius.
    actors.push({n:'chest',spr:'temple71_chest',schoolArt:true,x:drop.x,y:drop.y,
      editKey:'boss-reward:'+kind,bossRewardKind:kind,
      houseLoot:{id:prize.id,item:prize.item,gold:prize.gold,bossReward:true}});
  }
  function afterFade(f){
    const prize=prizes[f.kind];
    if(prize&&f.st==='dead'&&f.t>=prize.fade)place(f.kind);
  }
  function sync(){
    for(const kind of Object.keys(drops)){
      const body=foes.find(f=>f.kind===kind&&!f.ally);
      // Reloading/returning removes the corpse; the saved chest remains.
      if(!body||(body.st==='dead'&&body.t>=prizes[kind].fade))place(kind);
    }
  }
  function capture(){return Object.fromEntries(Object.entries(drops).map(([kind,drop])=>[kind,{...drop}]));}
  function restore(data){
    for(const map of Object.values(W.maps))if(map.roomActors)map.roomActors=map.roomActors.filter(a=>!a.bossRewardKind);
    drops={};
    for(const [kind,prize]of Object.entries(prizes)){
      const drop=data?.[kind];
      if(drop?.map===prize.map&&Number.isFinite(drop.x)&&Number.isFinite(drop.y)&&won(kind))drops[kind]={map:drop.map,x:drop.x,y:drop.y};
    }
    // Older Ice Moth saves granted the relic on victory, before chest drops.
    if(!data&&IceMoth.defeatedAlready())houseLootTaken.add(IceMoth.rewardId);
    // Older Queen saves have no death position. Preserve their unclaimed prize
    // at her authored resting spot instead of leaving an inaccessible reward.
    if(Frosthorn.defeatedAlready()&&!Frosthorn.owned()&&!drops.frosthorn)drops.frosthorn={map:'world',x:Frosthorn.arena.x*16,y:Frosthorn.arena.y*16};
    if(DesertAdventure.won()&&!DesertAdventure.owned()&&!drops.spiderqueen){
      const foe=W.maps.pyramid_queen?.foes.find(f=>f.k==='spiderqueen');
      if(foe)drops.spiderqueen={map:'pyramid_queen',x:foe.x*16+8,y:foe.y*16+16};
    }
  }
  return {defeated,afterFade,sync,capture,restore};
})();
