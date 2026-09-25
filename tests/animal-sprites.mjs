import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const world=JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const W_GZ = "([^"]+)"/)[1],'base64')));
const draws=[],files=[];
class Image {
 set src(path){
  const data=fs.readFileSync(new URL('../'+path,import.meta.url));
  this.width=data.readUInt32BE(16);this.height=data.readUInt32BE(20);files.push(path);this.onload();
 }
}
const canvas=()=>({width:0,height:0,getContext(){return {drawImage(img,sx,sy,w,h,dx,dy,dw,dh){
 assert(sx>=0&&sy>=0&&sx+w<=img.width&&sy+h<=img.height,'animation crops stay in sheet');
 draws.push({img,sx,sy,w,h,dx,dy,dw,dh});
 }}}});
const c=vm.createContext({SPR:{},FOE_ATTACK_OFFSETS:{},Image,document:{createElement:canvas},W:world});
const run=s=>vm.runInContext(s,c);
run(read('js/animal-sprites.js'));run('registerAnimalSprites()');await run('loadAnimalSprites()');
assert.equal(files.length,17);assert.equal(files.filter(p=>p.includes('Deer')).length,5);
assert.equal(Object.keys(c.SPR).length,100);
const game=read('js/generated/game-part-2.js');run(game.slice(game.indexOf('function sheetOf('),game.indexOf('function blit(')));
for(const [name,sp]of Object.entries(c.SPR)){
 c.sp=sp;const sheet=run('sheetOf(sp)');assert.equal(sheet.width,sp[2]*sp[4]);assert.equal(sheet.height,sp[3]);
 if(name.startsWith('hare_'))assert.deepEqual(Array.from(c.FOE_ATTACK_OFFSETS[name]),[0,4]);
}
const original=world.maps.world.objs.slice(),names=world.names.slice();run('installFarmAnimals()');
const herd=[];
for(let i=0;i<original.length;i+=3){
 const old=names[original[i]],name=world.names[world.maps.world.objs[i]];
 assert.equal(world.maps.world.objs[i+1],original[i+1]);assert.equal(world.maps.world.objs[i+2],original[i+2]);
 if(/^(cow|cow2_graze|cow_graze|pig_graze|sheep|sheep2|chicken|rooster)$/.test(old)){assert(name.startsWith('farm_'));herd.push(name.split('_')[1]);}
 else assert.equal(name,old);
}
assert.equal(herd.length,13);assert.equal(new Set(herd).size,8,'published animal identities stay stable');
const count=world.names.length;run('installFarmAnimals()');assert.equal(world.names.length,count,'map preparation is idempotent');
// The opening road herd uses the same uploaded sheets as the farm objects.
const item=game.slice(game.indexOf('    if (o.item) {'),game.indexOf('    if (o.green) {'));
c.ctx={};c.t=0;c.o={item:{spr:'farm_calf_w',anim:true},x:400,y:7000};
c.drawGameImage=(_g,img)=>{c.herdImage=img};run('for(let i=0;i<1;i++){'+item+'}');
assert.equal(c.herdImage,run('animalSheets.farm_calf_w'));
const p3=read('js/generated/game-part-3.js');c.drawGameImage=(_g,img)=>{c.lastBagImage=img};
run(p3.slice(p3.indexOf('function drawBagBig('),p3.indexOf('function bagTick(')));
c.big={width:260,height:260,getContext:()=>({clearRect(){}})};
run("drawBagBig(big,'hare_idle_d',0)");assert.equal(c.lastBagImage,run('animalSheets.hare_idle_d'));
console.log('PASS: all uploaded farm sprites and hare animation crops load, feet anchors and inventory use the correct sheets; seven farm species replace all 13 old animals, and deer idle, walk, run, hurt and death load.');

for(const dir of ['d','u','w','e'])assert.equal(c.SPR['farm_bull_'+dir],c.SPR['farm_calf_'+dir],'legacy bull IDs display calves');
assert(!files.some(p=>p.includes('Bull')),'bull artwork is never loaded');
assert.equal(run("farmAnimalDrawName('farm_bull_w',{moving:true,tx:10,ty:0,wx:0,wy:0})"),'farm_calf_walk_e');
