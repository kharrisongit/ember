/* Permanent household exploration rewards. IDs stay stable when actors are moved. */
const houseLootTaken=new Set();
let houseLootOpening=null;
async function prepareHouseLoot(){
  const response=await fetch('assets/interiors/house-loot.json?v=20260923-house-loot1');
  if(!response.ok)throw new Error('Household chest data could not load');
  const placements=await response.json();
  for(const loot of placements){
    const map=W.maps[loot.map];
    if(!map||map.roomActors?.some(o=>o.houseLoot?.id===loot.id))continue;
    const blocks=map.roomBlocks||=[];
    const block=blocks.push([loot.x-12,loot.y-10,loot.x+12,loot.y])-1;
    (map.roomActors||=[]).push({n:'chest',spr:'chest',schoolArt:true,
      x:loot.x,y:loot.y,editKey:'loot:'+loot.id,moveBlocks:[block],houseLoot:loot});
  }
}
function houseLootFrame(actor){
  if(!houseLootTaken.has(actor.houseLoot.id))return 0;
  return houseLootOpening?.id===actor.houseLoot.id
    ?Math.min(5,Math.floor((performance.now()-houseLootOpening.start)/100)):5;
}
function tryHouseLootChest(){
  const actor=(MD.roomActors||[]).filter(o=>!o.editorDeleted&&o.houseLoot&&
    Math.abs(P.x-o.x)<26&&P.y>=o.y-4&&P.y<=o.y+32)
    .sort((a,b)=>Math.hypot(P.x-a.x,P.y-a.y)-Math.hypot(P.x-b.x,P.y-b.y))[0];
  if(!actor)return false;
  const loot=actor.houseLoot;
  if(houseLootTaken.has(loot.id)){toast('This chest is empty.');return true;}
  // Claim and grant together before saving, so repeat input cannot duplicate loot.
  houseLootTaken.add(loot.id);
  houseLootOpening={id:loot.id,start:performance.now()};
  gold+=loot.gold;
  const labels={potion:'a potion',boarMeat:'boar meat',dragonFish:'a dragon fish'};
  if(loot.item==='potion')potions++;
  if(loot.item==='boarMeat')boarMeat++;
  if(loot.item==='dragonFish')dragonFish++;
  flyGold(actor.x,actor.y,loot.gold);
  showReveal('it_coin','Corin found '+loot.gold+' gold'+(loot.item?' and '+labels[loot.item]:'')+'!',3,true);
  saveGame();
  return true;
}
