// Reserve the selected appearances for their requested service roles.
const MARKET_NPC_SKINS=['lumberjack_jack','chef_chloe','farmer_buba','miner_mike'];
function prepareMarketNpcCast(m,id) {
  if(m._marketNpcCastReady)return;
  m._marketNpcCastReady=true;
  const dress=(n,sprite,marketVendor=true)=>{
    Object.assign(n,{marketVendor,serviceAppearance:true,packSpr:sprite,packDirections:false,packWalk:false,
      lookId:sprite,sk:undefined,body:undefined,school:false,seatSpr:undefined,seated:false,
      stationary:true,patrol:undefined,patrolPoints:undefined,goto:undefined,f:'d',idleFrame:undefined,idleFps:3.2});
  };
  // Idris is the existing Sandspire pharaoh. Exchange positions and the shop
  // role with Jamila, retaining each character's dialogue and identity.
  if(id==='world'){
    const pharaoh=m.npcs.find(n=>n.n==='Idris'),seller=m.npcs.find(n=>n.n==='Jamila');
    if(pharaoh&&seller?.counter){
      const old={x:pharaoh.x,y:pharaoh.y};
      Object.assign(pharaoh,{x:seller.x,y:seller.y,counter:{...seller.counter},sells:seller.sells});
      Object.assign(seller,{...old,counter:undefined,sells:undefined,talkX:undefined,talkY:undefined,
        seatClipY:undefined,sy:undefined,packSpr:'desert_trader3',packDirections:false,packWalk:false,
        lookId:'desert_trader3',sk:undefined,stationary:true,patrol:undefined,patrolPoints:undefined,goto:undefined,idleFrame:undefined});
    }
  }
  const villageLooks={Wren:'npc_farmer_buba_d',Idris:'npc_pharaoh_idle',
    Nerissa:'market_citizen5_idle_d',Astrid:'npc_chef_chloe_d'};
  for(const stand of m.marketStands||[]){
    const n=m.npcs.find(n=>n.counter&&Math.hypot(n.counter.x-stand.x,n.counter.y-stand.y)<4);
    if(!n)continue;
    const i=stand.objectId*3;stand.x=m.objs[i+1];stand.y=m.objs[i+2];
    dress(n,villageLooks[n.n]||'market_citizen5_idle_d');
    const h=SPR[n.packSpr][3],edge=stand.y-18;
    Object.assign(n,{x:stand.x,y:edge+Math.max(4,h-22),sy:stand.y-1,seatClipY:edge,
      counter:{x:stand.x,y:stand.y},talkX:stand.x,talkY:stand.y+14});
  }
  if(id==='world')for(const [spr,name,sprite] of [
    ['market_weapons_stall','Toft','npc_miner_mike_d'],
    ['market_produce_stall','Bevan','market_citizen1_idle_d'],
    ['market_bakery_stall','Prue','market_citizen2_idle_d'],
    ['market_curios_stall','Ovid','market_citizen3_idle_d'],
    ['market_drinks_stall','Isolde','market_citizen4_idle_d']
  ]){
    const a=m.roomActors?.find(a=>a.spr===spr),n=m.npcs.find(n=>n.n===name);
    if(!a||!n)continue;
    dress(n,sprite);
    Object.assign(n,{x:a.x,y:a.y+14,sy:a.y+14,seatClipY:undefined,
      counter:{x:a.x,y:a.y+8},talkX:a.x,talkY:a.y+28});
    a.interiorNpc=n.n;
  }
  if(id==='inn'){
    const keeper=m.npcs.find(n=>n.n==='Maren');
    if(keeper){
      dress(keeper,'npc_lumberjack_jack_d',false);
      // Keep the authored counter position, clipping and reachable talk point.
      keeper.seatClipY=112;keeper.y=114;keeper.talkY=147;
    }
  }
  let replacement=0;
  for(const n of m.npcs||[]){
    if(n.devLineup||n.serviceAppearance||!MARKET_NPC_SKINS.includes(n.sk))continue;
    if(!n.packSpr&&!n.body&&!n.school&&!n.seatSpr){
      const pack='market_citizen'+(1+replacement++%5);
      Object.assign(n,{packSpr:pack,packDirections:true,packWalk:true,lookId:pack,idleFrame:undefined});
    }
    n.sk=undefined;
  }
}
