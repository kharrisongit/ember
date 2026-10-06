import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const pages=[],samples=[];
const document={createElement:()=>({width:0,height:0,getContext:()=>({drawImage:(...args)=>samples.push(args)})})};
const c=vm.createContext({SPR:{},document,Image:class {width=512;height=512;async decode(){if(this.src.includes('rest'))this.height=768;if(this.src.includes('map-compass'))this.width=this.height=128;if(this.src.includes('bag-painted')){this.width=1300;this.height=1200;}if(this.src.includes('cooked-foods.webp')){this.width=384;this.height=256;}if(this.src.includes('relics.webp')){this.width=512;this.height=128;}}},registerAtlasPage:page=>pages.push(page)});
c.loadStartupImage=async src=>{const image=new c.Image();image.src=src;await image.decode();return image;};
// Exercise the real atlas lookup: two separate images cannot own the same
// 1024px bucket even if their individual sprite rectangles do not overlap.
const game=fs.readFileSync('js/generated/game-part-2.js','utf8');
vm.runInContext('const atlasPages=new Map();\n'+game.slice(game.indexOf('function registerAtlasPage('),game.indexOf('\nfunction drawPixelImage(')),c);
const register=c.registerAtlasPage;
c.registerAtlasPage=page=>{pages.push(page);register(page);};
vm.runInContext(fs.readFileSync('js/inventory-icons.js','utf8'),c);
await c.loadInventoryIcons();
assert.equal(pages.length,7);
assert.equal(samples.length,2,'The painted bag and travel gear each get their own 128px page');
assert.equal(samples[0][3],128);assert(samples[0][4]<128,'Bag proportions are preserved');
assert.equal(pages[3].w,128);assert.equal(pages[3].h,128);
const manifest=JSON.parse(fs.readFileSync('assets/inventory/manifest.json','utf8'));
const initial=JSON.stringify(c.SPR);
c.SPR={};c.registerInventorySprites();assert.equal(JSON.stringify(c.SPR),initial,'atlas inflation cannot discard inventory sprites');
const positions=new Set();
const rest=JSON.parse(fs.readFileSync('assets/inventory/manifest-rest.json','utf8'));
const relics=JSON.parse(fs.readFileSync('assets/inventory/manifest-relics.json','utf8'));
const cooked=['boarMeat','hareMeat','deerMeat','foxMeat','birdMeat','dragonFish'].map(key=>'cooked_'+key);
for(const key of [...manifest.keys,...rest.keys,...relics.keys,"mapCompass","bag","travelGear",...cooked]){
 const sprite=c.SPR['inventory_'+key];assert(c.isInventorySprite(sprite));
 positions.add(sprite.slice(0,2).join(','));assert.equal(sprite[2],128);assert.equal(sprite[4],1);
 const page=pages.find(p=>sprite[1]>=p.y&&sprite[1]<p.y+p.h);assert(page);
 assert(sprite[0]+sprite[2]<=page.w);assert(sprite[1]+sprite[3]<=page.y+page.h);
 c.sprite=sprite;assert.equal(vm.runInContext('atlasPages.get(Math.floor(sprite[1]/1024)*4+Math.floor(sprite[0]/1024))',c),page,key+' resolves to its own image page');
}
assert.equal(positions.size,47);
for(const key of cooked)assert.notDeepEqual(c.SPR['inventory_'+key],c.SPR['inventory_'+key.slice(7)],'Cooked meals have distinct art from raw ingredients');
assert.equal(c.inventoryIconName('it_cinderseal'),'inventory_cinderSeal','Reward reveals use the new seal');
assert.equal(c.SPR.inventory_cinderSeal[1],c.SPR.inventory_emberheart[1],'Seal uses the new relic artwork page');
assert.notDeepEqual(c.SPR.inventory_emberheart,c.SPR.inventory_flame,'Emberheart has its own artwork');
assert.notDeepEqual(c.SPR.inventory_frostheart,c.SPR.inventory_hs_ice,'Frostheart has its own artwork');
for(const [alias,key] of Object.entries({it_saint:'saint',it_res:'stone',it_salt:'salt',it_dust:'dust'}))assert.equal(c.SPR[alias],c.SPR['inventory_'+key]);
assert(fs.readFileSync('js/generated/game-part-2.js','utf8').includes('registerAnimalSprites();\n  registerInventorySprites();'));
console.log('PASS: 47 distinct item icons including six cooked foods, original relics, shop aliases, atlas bounds and registration in either asset-loading order.');
