/* Generated inventory artwork shares the normal sprite pipeline, including shops and reveals. */
async function loadInventoryIcons() {
  const image = new Image();
  image.src = 'assets/inventory/icons.webp?v=20260926-compass1';
  await image.decode();
  const y = 3000320;
  registerAtlasPage({img:image,x:0,y,w:image.width,h:image.height});
  registerInventorySprites();
}
function registerInventorySprites() {
  const y = 3000320, cell = 128;
  const keys = ['saint','stone','salt','dust','glassShield','smithEquipment',
    'boarMeat','hareMeat','deerMeat','foxMeat','birdMeat','dragonFish','compass'];
  keys.forEach((key,i) => { SPR['inventory_'+key] = [(i%4)*cell,y+Math.floor(i/4)*cell,cell,cell,1]; });
  for (const [alias,key] of Object.entries({it_saint:'saint',it_res:'stone',it_salt:'salt',it_dust:'dust'}))
    SPR[alias] = SPR['inventory_'+key];
}

function isInventorySprite(sprite) { return !!sprite && sprite[1] >= 3000320 && sprite[1] < 3000832; }
