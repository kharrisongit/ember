/* Permanent household exploration rewards. IDs stay stable when actors are moved. */
const houseLootTaken=new Set();
const lootChestAnimations=new Map();
const CHEST_CONSUMABLES={
  potion:['Potion',()=>potions++],elixir:['Elixir',()=>elixirs++],
  boarMeat:['Boar Meat',()=>boarMeat++],dragonFish:['Fresh Fish',()=>dragonFish++],
  bomb:["Maelis’s Curse",()=>bombs++],dust:['Madness Dust',()=>dust++],
  bell:['Bell Stake',()=>bells++],mark:['Grave Marker',()=>marks++],
  saint:["Saint’s Breath",()=>breaths++],stone:['Resurrection Stone',()=>stones++],
  salt:['Consecration',()=>salts++]
};
function chestConsumable(loot){
  // Keep empty and haunted chests intact, and preserve the early-town rewards.
  if(loot.ghost||(!loot.gold&&!loot.item))return null;
  const home=W.maps[MAPID.split('_')[0]];
  const late=MD.templeExpanded||MD.royal||MAPID==='cinderhold'||
    /Forgewick|Sandspire|Coralmere|Hollybeck|Frostcrag|Ashcrag/.test(home?.title||MD.title||'');
  if(!late)return loot.item;
  // A stable chest ID gives the same reward after reloading an unopened chest.
  let seed=2166136261;
  for(const c of loot.id)seed=Math.imul(seed^c.charCodeAt(0),16777619);
  seed=Math.imul(seed^(seed>>>16),0x7feb352d);seed^=seed>>>15;
  const items=Object.keys(CHEST_CONSUMABLES);
  return items[(seed>>>0)%items.length];
}
function beginLootChestOpening(id,caption,icon='it_coin',ghost=false){lootChestAnimations.set(id,{start:performance.now(),caption,icon,ghost,map:MAPID});}
function lootChestFrame(id,opened,frames=6){
  if(!opened)return 0;
  const a=lootChestAnimations.get(id);
  return a?Math.min(frames-1,Math.floor((performance.now()-a.start)/700*frames)):frames-1;
}
function stepLootChestOpening(){
  for(const [id,a] of lootChestAnimations)if(performance.now()-a.start>=750){
    lootChestAnimations.delete(id);
    if(a.map===MAPID){if(a.ghost)releaseChestGhost(id);else {if(a.caption.startsWith('+'))globalThis.window?.EmberSfx?.pickup();toast(a.caption);}}
  }
}
async function prepareHouseLoot(){
  const response=await fetch('assets/interiors/house-loot.json?v=20260923-temple1');
  if(!response.ok)throw new Error('Household chest data could not load');
  const placements=await response.json();
  // Retire decorative, single-frame chest cutouts so every visible household
  // chest is an actual animated reward, and the per-home count is accurate.
  for(const [id,map] of Object.entries(W.maps))if(/^house\d+(?:_bedroom2?)?$/.test(id)){
    for(const actor of map.roomActors||[])if(actor.exactFurniture&&/chest/i.test(actor.n))
      for(const i of actor.moveBlocks||[])map.roomBlocks[i]=[-99999,-99999,-99999,-99999];
    map.roomActors=(map.roomActors||[]).filter(a=>!(a.exactFurniture&&/chest/i.test(a.n)));
  }
  for(const loot of placements){
    const map=W.maps[loot.map];
    if(!map||map.roomActors?.some(o=>o.houseLoot?.id===loot.id))continue;
    const blocks=map.roomBlocks||=[];
    const block=blocks.push([loot.x-14,loot.y-10,loot.x+14,loot.y])-1;
    (map.roomActors||=[]).push({n:'chest',spr:'temple71_chest',schoolArt:true,
      x:loot.x,y:loot.y,editKey:'loot:'+loot.id,moveBlocks:[block],houseLoot:loot});
  }
}
function houseLootFrame(actor){
  return lootChestFrame(actor.houseLoot.id,houseLootTaken.has(actor.houseLoot.id));
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
  gold+=loot.gold;
  const item=CHEST_CONSUMABLES[chestConsumable(loot)];
  if(item)item[1]();
  if(loot.gold>0)flyGold(actor.x,actor.y,loot.gold);
  const rewards=[];
  if(loot.gold>0)rewards.push('+'+loot.gold+' gold');
  if(item)rewards.push('+1 '+item[0]);
  beginLootChestOpening(loot.id,rewards.join(' · ')||'This chest is empty.','it_coin',!!loot.ghost);
  saveGame();
  return true;
}
