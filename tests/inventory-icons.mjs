import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const pages=[];
const c=vm.createContext({SPR:{},Image:class {width=512;height=512;async decode(){if(this.src.includes('rest'))this.height=768;if(this.src.match(/map-compass|bag\.svg/))this.width=this.height=128;}},registerAtlasPage:page=>pages.push(page)});
// Exercise the real atlas lookup: two separate images cannot own the same
// 1024px bucket even if their individual sprite rectangles do not overlap.
const game=fs.readFileSync('js/generated/game-part-2.js','utf8');
vm.runInContext('const atlasPages=new Map();\n'+game.slice(game.indexOf('function registerAtlasPage('),game.indexOf('\nfunction drawPixelImage(')),c);
const register=c.registerAtlasPage;
c.registerAtlasPage=page=>{pages.push(page);register(page);};
vm.runInContext(fs.readFileSync('js/inventory-icons.js','utf8'),c);
await c.loadInventoryIcons();
assert.equal(pages.length,4);
const manifest=JSON.parse(fs.readFileSync('assets/inventory/manifest.json','utf8'));
const initial=JSON.stringify(c.SPR);
c.SPR={};c.registerInventorySprites();assert.equal(JSON.stringify(c.SPR),initial,'atlas inflation cannot discard inventory sprites');
const positions=new Set();
const rest=JSON.parse(fs.readFileSync('assets/inventory/manifest-rest.json','utf8'));
for(const key of [...manifest.keys,...rest.keys,"mapCompass","bag"]){
 const sprite=c.SPR['inventory_'+key];assert(c.isInventorySprite(sprite));
 positions.add(sprite.slice(0,2).join(','));assert.equal(sprite[2],128);assert.equal(sprite[4],1);
 const page=pages.find(p=>sprite[1]>=p.y&&sprite[1]<p.y+p.h);assert(page);
 assert(sprite[0]+sprite[2]<=page.w);assert(sprite[1]+sprite[3]<=page.y+page.h);
 c.sprite=sprite;assert.equal(vm.runInContext('atlasPages.get(Math.floor(sprite[1]/1024)*4+Math.floor(sprite[0]/1024))',c),page,key+' resolves to its own image page');
}
assert.equal(positions.size,37);
for(const [alias,key] of Object.entries({it_saint:'saint',it_res:'stone',it_salt:'salt',it_dust:'dust'}))assert.equal(c.SPR[alias],c.SPR['inventory_'+key]);
assert(fs.readFileSync('js/generated/game-part-2.js','utf8').includes('registerAnimalSprites();\n  registerInventorySprites();'));
console.log('PASS: 37 distinct item icons, shop aliases, atlas bounds and registration in either asset-loading order.');
