/* Generated inventory artwork shares the normal sprite pipeline, including shops and reveals. */
async function loadInventoryIcons() {
  for (const [file,y] of [['icons.webp',3000320],['icons-rest.webp',3001344]]) {
  const image = new Image();
  image.src = 'assets/inventory/'+file+'?v=20260926-all-items';
  await image.decode();

  registerAtlasPage({img:image,x:0,y,w:image.width,h:image.height});
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
  for (const [alias,key] of Object.entries({it_saint:'saint',it_res:'stone',it_salt:'salt',it_dust:'dust'}))
    SPR[alias] = SPR['inventory_'+key];
}

function isInventorySprite(sprite) { return !!sprite && ((sprite[1] >= 3000320 && sprite[1] < 3000832) || (sprite[1] >= 3001344 && sprite[1] < 3002112)); }

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
