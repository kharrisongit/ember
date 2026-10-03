import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
let screen,target,layer,created=0,draws=[];
const g={setTransform(){},clearRect(){draws=[];}};
const c=vm.createContext({SPR:{it_coin:[0,0,12,12,1]},atlasImg:{},cam:{x:900,y:1600,z:2},VW:390,VH:540,
 cv:{getBoundingClientRect:()=>screen},window:{innerWidth:390,innerHeight:800,devicePixelRatio:3},
 document:{getElementById:()=>({getBoundingClientRect:()=>target}),createElement:()=>{created++;return layer={style:{},setAttribute(){},getContext:()=>g};},body:{appendChild(){}}},
 drawGameImage:(ctx,img,sx,sy,sw,sh,x,y,w,h)=>{assert.equal(ctx,g);draws.push({x:x+w/2,y:y+h/2});},
 restoreCameraTarget(){},stepHeal(){},stepDragonBanter(){},updateDeckHealth(){},ask:null,fishing:false,ovl:null,last:0,atlasOpen:true});
const run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('let flying = [];'),game.indexOf('function grabGold()')));
run(part3.slice(part3.indexOf('function frameCore(ms) {'),part3.indexOf('let doorCooldown =')));
for(const layout of [
 {w:390,h:800,dpr:3,screen:{left:0,top:0,width:390,height:540},target:{left:18,top:560,width:28,height:28}},
 {w:844,h:390,dpr:2,screen:{left:0,top:0,width:844,height:214},target:{left:24,top:230,width:32,height:32}},
 {w:1363,h:936,dpr:1,screen:{left:0,top:0,width:1363,height:696},target:{left:18,top:713,width:34,height:34}},
 {w:1024,h:900,dpr:2,screen:{left:24,top:20,width:976,height:620},target:{left:30,top:670,width:32,height:32}}
]){
 Object.assign(c.window,{innerWidth:layout.w,innerHeight:layout.h,devicePixelRatio:layout.dpr});
 screen=layout.screen;target=layout.target;c.VW=screen.width;c.VH=screen.height;
 run('flying=[{sx:1000,sy:1700,t:0,life:.62,lift:30}];drawFly()');
 assert(Math.abs(draws[0].x-(screen.left+200))<=.5);assert(Math.abs(draws[0].y-(screen.top+200))<=.5);
 run('flying[0].t=.62;drawFly()');
 assert(Math.abs(draws[0].x-(target.left+target.width/2))<=.5,'lands on current portrait');
 assert(Math.abs(draws[0].y-(target.top+target.height/2))<=.5,'lands below game canvas');
 assert(draws[0].y>screen.top+screen.height,'coin is visible beyond the game canvas');
 assert.equal(layer.width,layout.w*Math.min(2,layout.dpr));assert.equal(layer.height,layout.h*Math.min(2,layout.dpr));
 assert(layer.style.cssText.includes('pointer-events:none'),'does not steal controller taps');
 run('frameCore(16)');assert.equal(layer.style.display,'none','menu early return clears old coins');
 run('stepFly(1)');assert.equal(run('flying.length'),0);
}
assert.equal(created,1,'reuses one overlay through resizes');
console.log('PASS: coins start at the world pickup and finish at the current lower HUD in portrait, landscape, desktop and offset layouts; resize, pixel ratio and menu cleanup are covered.');

// Exercise the actual world comparator, including its whole-loot batch at sy=-1e9.
// Corpses must precede that batch regardless of their position or boss type.
const sorting=game.slice(game.indexOf('  const mouth = (o) =>'),game.indexOf('\n  for (const o of draw) {',game.indexOf('  const mouth = (o) =>')));
for(const y of [-200,0,200,8000]){
 const corpseKeys=['foe','frosthorn','iceMoth','queenBoss'];
 const floor={floor:true,y},live={foe:{st:'walk'},y:y-100},roof={villageCanopy:true,y};
 const bodies=corpseKeys.map(key=>({[key]:{st:'dead'},y}));
 const sortingContext=vm.createContext({draw:[roof,live,...bodies,floor],MD:{},NAMES:[],P:{},
   underfoot:o=>!!o.floor,sortY:o=>o.sy??o.y,topOf:()=>0});
 vm.runInContext(sorting,sortingContext);
 const order=sortingContext.draw,goldIndex=order.findIndex(o=>o.looseGold);
 assert(bodies.every(o=>order.indexOf(o)>order.indexOf(floor)&&order.indexOf(o)<goldIndex),'All corpses draw above floors and below gold');
 assert(goldIndex<order.indexOf(live)&&order.indexOf(live)<order.indexOf(roof),'Gold remains beneath living actors and roofs');
}
console.log('PASS: loose gold renders above ordinary and boss corpses at every depth, while floors, actors and roofs retain their order.');
