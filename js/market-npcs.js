// These four legacy appearances are reserved for the market stands.
const MARKET_NPC_SKINS=['lumberjack_jack','chef_chloe','farmer_buba','miner_mike'];
function prepareMarketNpcCast(m,id) {
  if(m._marketNpcCastReady)return;
  m._marketNpcCastReady=true;
  const dress=(n,skin)=>{
    Object.assign(n,{marketVendor:true,packSpr:'npc_'+skin+'_d',packDirections:false,packWalk:false,
      lookId:'npc_'+skin,sk:undefined,body:undefined,school:false,seatSpr:undefined,seated:false,
      stationary:true,patrol:undefined,patrolPoints:undefined,goto:undefined,f:'d',idleFrame:0});
  };
  const villageLooks={Wren:'farmer_buba',Jamila:'chef_chloe',Nerissa:'lumberjack_jack',Astrid:'miner_mike'};
  for(const stand of m.marketStands||[]){
    const n=m.npcs.find(n=>n.counter&&Math.hypot(n.counter.x-stand.x,n.counter.y-stand.y)<4);
    if(!n)continue;
    const i=stand.objectId*3;stand.x=m.objs[i+1];stand.y=m.objs[i+2];
    const skin=villageLooks[n.n]||MARKET_NPC_SKINS[stand.objectId%4];dress(n,skin);
    const h=SPR[n.packSpr][3],edge=stand.y-18;
    Object.assign(n,{x:stand.x,y:edge+Math.max(4,h-22),sy:stand.y-1,seatClipY:edge,
      counter:{x:stand.x,y:stand.y},talkX:stand.x,talkY:stand.y+14});
  }
  if(id==='world')for(const [spr,name,skin] of [
    ['market_weapons_stall','Toft','miner_mike'],
    ['market_produce_stall','Bevan','farmer_buba'],
    ['market_bakery_stall','Prue','chef_chloe'],
    ['market_curios_stall','Ovid','lumberjack_jack'],
    ['market_drinks_stall','Isolde','chef_chloe']
  ]){
    const a=m.roomActors?.find(a=>a.spr===spr),n=m.npcs.find(n=>n.n===name);
    if(!a||!n)continue;
    dress(n,skin);
    // Stand in front of the authored counter; retain all user-edited stall positions.
    Object.assign(n,{x:a.x,y:a.y+14,sy:a.y+14,seatClipY:undefined,
      counter:{x:a.x,y:a.y+8},talkX:a.x,talkY:a.y+28});
    a.interiorNpc=n.n;
  }
  let replacement=0;
  for(const n of m.npcs||[]){
    if(n.devLineup||n.marketVendor||!MARKET_NPC_SKINS.includes(n.sk))continue;
    // Stale skin fields under a different scene/pack are not visible artwork.
    if(!n.packSpr&&!n.body&&!n.school&&!n.seatSpr){
      const pack='market_citizen'+(1+replacement++%5);
      Object.assign(n,{packSpr:pack,packDirections:true,packWalk:true,lookId:pack,idleFrame:undefined});
    }
    n.sk=undefined;
  }
}
