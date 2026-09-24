import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js'),assets=read('js/generated/game-part-1.js');
const W={maps:{world:{npcs:[],doors:['tp1','ds1','sn1'].map(to=>({to}))}}};
for(const prefix of ['tp','ds','sn'])for(let i=1;i<=4;i++)W.maps[prefix+i]={doors:[{to:'world',tx:1,ty:1}],npcs:[],travel:i===1};
W.maps.tp4.npcs.push({n:'Alderic'});
const buttons=[],list={innerHTML:'',appendChild:b=>buttons.push(b)};
let travelClosed=false;
const c=vm.createContext({W,TS:16,DIRT:0,terrRLE:a=>'0.'+a.length,WALL78_PIECES:JSON.parse(assets.match(/const WALL78_PIECES=(.*);/)[1]),
 fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url.split('?')[0]))}),Image:class{async decode(){}},
 breathHas:{},chestOpen:{},features:[],MAPID:'world',MD:W.maps.world,P:{},dragon:{placed:'old'},chunks:new Map(),cam:{z:1},VW:400,VH:300,
 isArea:()=>false,playZoom:()=>1,clampCam(){},checkArea(){},setDevTitle(){},toast(){},setTravel:on=>{travelClosed=!on;},
 document:{getElementById:()=>list,createElement:()=>({handlers:{},addEventListener(type,fn){this.handlers[type]=fn;}})}});
const run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('const CHESTS = ['),game.indexOf('function chestHere()')));
run(game.slice(game.indexOf('function installFirstTemple(){'),game.indexOf('const foeVisibleTopCache82')));
run('installFirstTemple();installSecondTemple();installThirdTemple();refineSecondTemple();finishTempleLayouts77();refineTemples78();finishTempleLayouts82();');
run(read('js/first-temple.js'));run(read('js/sandspire-temple.js'));run(read('js/hollybeck-temple.js'));
await run('prepareExpandedFirstTemple()');await run('prepareExpandedSandspireTemple()');await run('prepareExpandedHollybeckTemple()');
c.canStand=(x,y)=>[[x-6,y-12],[x+6,y-12],[x-6,y-1],[x+6,y-1]].every(([px,py])=>
 c.MD.templeFloors.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&
 !c.MD.roomBlocks.some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b)&&
 !(c.MD.templeWalls||[]).some(([l,t,r,b])=>px>=l&&px<r&&py>=t&&py<b));
c.loadMap=id=>{c.MAPID=id;c.MD=W.maps[id];};
run(game.slice(game.indexOf('function recoverTempleArrival('),game.indexOf('function blockedByTempleGate(')));
run(game.slice(game.indexOf('function storyTeleport(id) {'),game.indexOf('const KING_DRAGON_SPR')));
run(part3.slice(part3.indexOf('function placesOf() {'),part3.indexOf('function refreshBuild() {')));
for(const chest of run('CHESTS'))for(const sameMap of [false,true]){
 c.MAPID=sameMap?chest.map:'world';c.MD=W.maps[c.MAPID];buttons.length=0;travelClosed=false;
 c.P.x=0;c.P.y=0;c.dragon.placed='old';run('buildTravel()');
 const name={lightning:'Forgewick',ice:'Sandspire',shadow:'Hollybeck'}[chest.gift]+' Temple — Heartstone Chamber';
 const button=buttons.find(b=>b.textContent===name);assert(button,name+' listed');
 button.handlers.click({preventDefault(){},stopPropagation(){}});
 assert.equal(c.MAPID,chest.map);assert(c.canStand(c.P.x,c.P.y),name+' safe landing');
 assert(Math.hypot(c.P.x-(chest.x*16+8),c.P.y-(chest.y*16+16))<=44,name+' arrives in chest interaction range');
 assert.notDeepEqual([c.P.x,c.P.y],c.MD.spawn,'does not return to entrance');
 assert.equal(c.P.dir,'u');assert.equal(c.dragon.placed,null);assert(travelClosed);
}
console.log('PASS: actual travel buttons enter all three Heartstone chambers on clear floor beside the chests, from other maps and within the current temple.');
