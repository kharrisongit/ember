// Exercise the real custom boss renderers with their decoded artwork.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {createCanvas,Image:CanvasImage}=require(runtime?runtime+'/@napi-rs/canvas':'@napi-rs/canvas');
const {PNG}=require(runtime?runtime+'/pngjs':'pngjs');
class LocalImage extends CanvasImage{
 set src(path){super.src=PNG.sync.write(PNG.sync.read(fs.readFileSync(path.split('?')[0])));}
}
const canvas=createCanvas(180,180),ctx=canvas.getContext('2d');
const c=vm.createContext({console,Image:LocalImage,document:{createElement:()=>createCanvas(1,1)},
 ctx,FOE:{},FOE_ART:{},WORTH:{},animalSheets:{},SPR:{},houseLootTaken:new Set(),
 tAcc:Math.PI/48,enemyMaxHp:()=>140,glassAttackUnblockable:f=>!!f.unblockableAttack,
 drawPixelImage:(g,...args)=>g.drawImage(...args)});
for(const file of ['combat-navigation','frosthorn','ice-moth'])vm.runInContext(fs.readFileSync('js/'+file+'.js','utf8'),c);
const sheet=createCanvas(720,360),g=sheet.getContext('2d');
for(const [row,name,prop,kind]of [[0,'Frosthorn','frosthorn','frosthorn'],[1,'IceMoth','iceMoth','icemoth']]){
 const boss=vm.runInContext(name,c);await boss.prepare();
 const map={features:[{...boss.arena,r:12.6}],foes:[]};boss.installWorld(map);boss.installWorld(map);
 assert.equal(map.features.filter(a=>a.id===boss.arena.id).length,1,'No duplicated boss arena');
 assert.equal(map.features.find(a=>a.id===boss.arena.id).r,6.3,'Existing layouts adopt the normal radius');
 const f={kind,x:90,y:160,hp:140,dir:'d',flip:false,st:'wind',t:.3,hurt:0,frostAttack:'swipe',mothAttack:'gust'};
 const renders=[];
 for(const [column,label,hurt,unblockable]of [[0,'Normal',0,false],[1,'Damage',.25,true],[2,'Blockable',0,false],[3,'Unblockable',0,true]]){
  Object.assign(f,{st:column?'wind':'idle',hurt,unblockableAttack:unblockable});
  ctx.clearRect(0,0,180,180);boss.draw({[prop]:f});
  renders.push(new Uint8Array(ctx.getImageData(0,0,180,180).data));
  g.fillStyle='#34404a';g.fillRect(column*180,row*180,180,180);g.drawImage(canvas,column*180,row*180);
  g.fillStyle='#fff';g.font='12px sans-serif';g.fillText(name+' · '+label,column*180+8,row*180+16);
 }
 const average=p=>{const sum=[0,0,0];let count=0;for(let i=0;i<p.length;i+=4)if(p[i+3]>240){count++;for(let j=0;j<3;j++)sum[j]+=p[i+j];}return sum.map(x=>x/count);};
 const red=average(renders[1]),yellow=average(renders[2]),orange=average(renders[3]);
 assert(red[0]>red[1]+75&&red[0]>red[2]+75,name+' flashes red even during an attack');
 assert(yellow[0]>yellow[2]+70&&yellow[1]>yellow[2]+70,name+' flashes yellow for a blockable attack');
 assert(orange[0]>orange[1]+60&&orange[1]>orange[2]+40,name+' flashes orange for an unblockable attack');
 Object.assign(f,{st:'wind',hurt:0,unblockableAttack:false});c.tAcc=Math.PI/16;
 ctx.clearRect(0,0,180,180);boss.draw({[prop]:f});
 const dim=average(ctx.getImageData(0,0,180,180).data);
 assert(yellow[0]-dim[0]>20,name+' attack warning visibly pulses');c.tAcc=Math.PI/48;
}
// Tinting must preserve transparent margins, rather than flashing a rectangle.
const source=createCanvas(16,16);source.getContext('2d').fillRect(4,4,8,8);c.source=source;
ctx.clearRect(0,0,180,180);vm.runInContext("drawEnemyCombatFrame({st:'idle',hurt:.25},source,0,0,16,16)",c);
assert.equal(ctx.getImageData(0,0,1,1).data[3],0);assert.equal(ctx.getImageData(8,8,1,1).data[3],255);
if(process.env.WINTER_BOSS_PREVIEW)fs.writeFileSync(process.env.WINTER_BOSS_PREVIEW,sheet.toBuffer('image/png'));
console.log('PASS: real Frosthorn and ice moth art, red damage priority, yellow/orange attack pulses and transparent silhouettes.');
