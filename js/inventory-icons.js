/* Generated inventory artwork shares the normal sprite pipeline, including shops and reveals. */
// Image pages must start in separate 1024px atlas buckets.
async function loadInventoryIcons() {
  for (const [file,y] of [['icons.webp',3000320],['icons-rest.webp',3001344],['map-compass.png',3002368],['bag-painted.png',3003392],['travel-gear.webp',3005440],['relics.webp',3004416],['cooked-foods.webp',3006464],['crafting-kit.webp',3007488]]) {
  const image=await loadStartupImage('assets/inventory/'+file+'?v=20261006-cooked');

  // Single-item art is sampled into the same 128px atlas cell as other rewards.
  // Keep the high-resolution source intact for future inventory sizes.
  let page=image;
  if(file==='bag-painted.png'||file==='travel-gear.webp'){
    page=document.createElement('canvas');page.width=page.height=128;
    const context=page.getContext('2d');context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
    const scale=128/Math.max(image.width,image.height),w=image.width*scale,h=image.height*scale;
    context.drawImage(image,(128-w)/2,(128-h)/2,w,h);
  }
  registerAtlasPage({img:page,x:0,y,w:page.width,h:page.height});
  }
  registerInventorySprites();
}
function registerInventorySprites() {
  const y = 3000320, cell = 128;
  const keys = ['saint','stone','salt','dust','glassShield','smithEquipment',
    'boarMeat','hareMeat','deerMeat','foxMeat','birdMeat','dragonFish','compass'];
  keys.forEach((key,i) => { SPR['inventory_'+key] = [(i%4)*cell,y+Math.floor(i/4)*cell,cell,cell,1]; });
  const remaining = ["hs_light", "hs_shadow", "hs_ice", "bell", "mark", "bomb", "elixir", "potion", "fishingPole", "wake", "flame", "lamp", "twin", "brand", "spore", "ward", "edge", "sword", "cinderSeal", "egg", "heart", "eggs"];
  remaining.forEach((key,i) => { SPR['inventory_'+key] = [(i%4)*cell,3001344+Math.floor(i/4)*cell,cell,cell,1]; });
  SPR.inventory_travelGear=[0,3005440,128,128,1];
  SPR.inventory_craftingKit=[0,3007488,128,128,1];
  SPR.inventory_bag=[0,3003392,128,128,1];
  SPR.inventory_mapCompass=[0,3002368,128,128,1];
  SPR.inventory_emberheart=[0,3004416,128,128,1];
  SPR.inventory_frostheart=[128,3004416,128,128,1];
  SPR.inventory_cinderSeal=[256,3004416,128,128,1];
  SPR.inventory_soulwing=[384,3004416,128,128,1];
  ['boarMeat','hareMeat','deerMeat','foxMeat','birdMeat','dragonFish'].forEach((key,i)=>{
    SPR['inventory_cooked_'+key]=[(i%3)*cell,3006464+Math.floor(i/3)*cell,cell,cell,1];
  });
  for (const [alias,key] of Object.entries({it_saint:'saint',it_res:'stone',it_salt:'salt',it_dust:'dust'}))
    SPR[alias] = SPR['inventory_'+key];
}

function isInventorySprite(sprite) { return !!sprite && ((sprite[1] >= 3000320 && sprite[1] < 3000832) || (sprite[1] >= 3001344 && sprite[1] < 3002112) || sprite[1]===3002368 || sprite[1]===3003392 || sprite[1]===3004416 || sprite[1]===3005440 || sprite[1]===3007488 || (sprite[1]>=3006464 && sprite[1]<3006720)); }

// Resolve only UI art; world pickups retain their original sprite sizes.
const INVENTORY_UI_ALIASES = {
  "it_hs_light": "hs_light",
  "it_hs_shadow": "hs_shadow",
  "it_hs_ice": "hs_ice",
  "it_bell": "bell",
  "it_mark": "mark",
  "it_bomb": "bomb",
  "it_elixir": "elixir",
  "it_potion": "potion",
  "fishing_rod": "fishingPole",
  "it_wake": "wake",
  "it_twinflame": "flame",
  "it_lamp": "lamp",
  "it_twin": "twin",
  "it_brand": "brand",
  "it_spore": "spore",
  "it_ward": "ward",
  "it_edge": "edge",
  "it_sword": "sword",
  "it_cinderseal": "cinderSeal",
  "it_egg": "egg",
  "it_hs_flame": "heart",
  "nest2": "eggs"
};
function inventoryIconName(name) { return INVENTORY_UI_ALIASES[name] ? "inventory_"+INVENTORY_UI_ALIASES[name] : name; }
