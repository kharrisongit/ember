import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const p2=read('js/generated/game-part-2.js'),p3=read('js/generated/game-part-3.js');
const section=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)+a.length));
const e={x:40,y:120,away:0},door={x:150,y:90,w:20,h:26};
const c=vm.createContext({elder:()=>e,MD:{doors:[{to:'house22'}]},doorRect:()=>door,MAD_DOOR:[900,900],TS:16,
 canNpcStand:(x,y)=>!(x>=75&&x<=100&&y>=80&&y<=155),faceToward:(m,x,y)=>{m.f=y<m.y?'u':'d';},
 P:{x:40,y:160},cam:{x:12,y:90,z:2},VW:400,VH:300,MAPID:'world',clampCam(){},toast(){},
 dragon:{},Q:{DONE:9},quest:8,dragonIntroArmed:false});
const run=s=>vm.runInContext(s,c);
run('let goingIn=false,hatchExit=false,camFree=true,hatchCamera={zoom:3,returnT:0},hatchScene={dragonX:40,dragonY:140};');
run(section(p2,'function maddockDoor()','function northShut()'));
run(section(p2,'function lockHatchCamera(','function beginHatchScene('));
run(section(p2,'function finishHatchScene()','function standableNear('));
run('finishHatchScene()');
assert(e.houseWalk.path.length>1,'Maddock routes around an obstacle instead of teleporting through it');
assert.deepEqual(JSON.parse(JSON.stringify(e.houseWalk.door)),{x:160,y:128},'Uses the edited doorway, not the old constant');
const camera=JSON.stringify(c.cam);let seenDoor=false,entered=false;
for(let i=0;i<1000&&!e.away;i++){
 const before=[e.x,e.y];run('stepElder(1/60)');
 assert(Math.hypot(e.x-before[0],e.y-before[1])<=52/60+.001,'Exit keeps a walking speed without snapping');
 if(!e.houseEntry)assert(c.canNpcStand(e.x,e.y),'Walking path stays clear');
 if(Math.abs(e.x-160)<.001&&Math.abs(e.y-128)<.001)seenDoor=true;
 if(e.houseEntry){assert(seenDoor,'Reaches threshold before entering');entered=true;assert.equal(e.f,'u');}
 if(!e.away){run('stepHatchCamera(1/60)');assert.equal(JSON.stringify(c.cam),camera,'Camera stays exactly fixed throughout the walk and entrance');}
}
assert(seenDoor&&entered&&e.away,'Maddock visibly walks into his house');
assert.equal(run('hatchExit'),false);assert(run('hatchCamera'),'Camera waits until the entrance has finished');
run('stepHatchCamera(.1)');assert(c.cam.z>2&&c.cam.z<3,'Normal zoom resumes smoothly after entering');
for(let i=0;i<90;i++)run('stepHatchCamera(1/60)');assert.equal(run('hatchCamera'),null);assert.equal(c.cam.z,3);
console.log('PASS: Maddock walks around obstacles into the edited doorway; the camera remains fixed until he enters, then returns to normal zoom.');

let clear=()=>true,notices=[];
const d=vm.createContext({dragon:{on:true,x:200,y:200,dir:'s',air:true},P:{x:200,y:226,moving:true,act:{}},MAPID:'world',
 fishing:null,dragonHere:()=>true,dragonSprite:()=>[0,0,176,176],DRAGON_DRAW_SCALE:.42,playerFacing4:()=>d.dir,
 canStand:(x,y)=>{assert.equal(vm.runInContext('mounted',d),false,'Uses on-foot collision when choosing a landing');return clear(x,y);},
 dragonHover:()=>d.dragon.air?26:0,setDragonAir:on=>{d.dragon.air=on;},toast:s=>notices.push(s),chunks:new Map()});
const dr=s=>vm.runInContext(s,d);dr(section(p3,'let mounted = false;','tap(document.getElementById("deadBtn")'));
const reset=dir=>{d.dir=dir;Object.assign(d.dragon,{x:200,y:200,dir,air:true});d.P.x=200;d.P.y=226;dr('mounted=true');};
function separated(){const {x,y}=d.P;return x+16<163||x-16>237||y<126||y-40>200;}
for(const dir of ['n','s','e','w']){reset(dir);assert(dr('setMounted(false)'));assert(separated(),dir+' dismount keeps the visible sprites apart');assert.equal(d.P.moving,false);assert.equal(d.P.act,null);assert(d.dragon.followGap>=Math.hypot(d.P.x-d.dragon.x,d.P.y-26-d.dragon.y),'Dragon keeps the new spacing afterward');}
clear=(x,y)=>x<180;reset('s');assert(dr('setMounted(false)'));assert(d.P.x<180,'Chooses a free side when the first side is blocked');
clear=()=>false;reset('s');assert.equal(dr('setMounted(false)'),false);assert.equal(dr('mounted'),true);assert.equal(d.P.x,200);assert.match(notices.at(-1),/open ground/);
d.dragonHere=()=>false;assert(dr('setMounted(false,true)'),'Entering a dragon-free interior can still clear the mount state');assert.equal(dr('mounted'),false);
console.log('PASS: Dismounts leave visible space in every direction, use an unblocked side, retain follow spacing, and refuse a landing with no safe ground.');

class Element{
 constructor(){this.children=[];this.dataset={};this.attrs={};this.handlers={};this.style={setProperty(){}};const classes=new Set();
 this.classList={add:k=>classes.add(k),remove:k=>classes.delete(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k),contains:k=>classes.has(k)};}
 set innerHTML(v){this.children=[];}setAttribute(k,v){this.attrs[k]=v;}appendChild(e){this.children.push(e);}replaceChildren(){this.children=[];}
 addEventListener(t,f){this.handlers[t]=f;}querySelectorAll(){return this.children;}
}
const nodes=Object.fromEntries(['airRows','airDesc','atkRows','atkDesc'].map(k=>[k,new Element()]));let summoned=0;
const m=vm.createContext({document:{getElementById:id=>nodes[id],createElement:()=>new Element()},ovl:'airm',mounted:false,dragon:{air:false},charm:{},wakeCool:0,
 wakeCount:()=>0,wakeTheDead:()=>{summoned++;return false;},setMounted:()=>false,breathHas:{slash:true,fire:true,lightning:true,shadow:true,ice:true},breathWait:()=>0});
const mr=s=>vm.runInContext(s,m);mr(section(p3,'const MENUS = {','let ovl = null;'));mr(section(p3,'function refreshOvl()','function updateBreathRefills()'));mr(section(p3,'function ovlStep(','const atkCloseBtn='));
mr('refreshOvl()');const blank=nodes.airRows.children[2];
assert.equal(blank.children.length,0,'Locked Summon is entirely blank');assert.equal(blank.attrs['aria-disabled'],'true');
const click={preventDefault(){},stopPropagation(){}};blank.handlers.click(click);mr('ovlTake()');assert.equal(summoned,0,'Blank row cannot activate by touch or A');
mr('MENUS.airm.pick=1;ovlStep(1)');assert.equal(mr('MENUS.airm.pick'),0,'Directional navigation skips the blank button');
const held=nodes.airRows.children[2];m.charm.wake=true;mr('updateCommandRows()');assert.equal(nodes.airRows.children[2],held,'Availability changes do not detach a pressed button');
assert.equal(held.children[0].src,'assets/icons/wake.svg?v=20260926-subtle2');assert.equal(held.children[1].textContent,'Summon');held.handlers.click(click);assert.equal(summoned,1);
m.wakeCool=10;mr('updateCommandRows()');assert.equal(held.children.length,0,'Summon goes blank while unavailable again');
mr('ovl="atkm";refreshOvl()');assert.equal(nodes.atkRows.children.length,5);
for(const row of nodes.atkRows.children){const icon=row.children.find(e=>e.className==='actionIcon');assert(icon);assert.match(read(icon.src.split('?')[0]),/<svg.*viewBox="0 0 24 24"/);}
console.log('PASS: Locked and cooling Summon buttons are blank and inert; activation updates in place; both menus load the new artwork.');
