import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const game=fs.readFileSync(new URL('../js/generated/game-part-2.js',import.meta.url),'utf8');
const c=vm.createContext({TS:16,MAPID:'passage3',MD:{},P:{x:100,y:100,act:{kind:'swing'}},foes:[],live:[],foeClock:0,wakeCool:0,turnT:0,turnHolder:null,foeCool:0,tAcc:0,
 lastFight:0,features:[],bell:null,SPR:{},FOE_ART:{},isSolid:()=>false,thinks:()=>true,facing:()=>true,
 targetFor:f=>({x:c.P.x,y:c.P.y,d:Math.hypot(c.P.x-f.x,c.P.y-f.y),isPlayer:true}),
 hurtPlayer:n=>{c.playerHp-=n;c.landed++;},glassShieldDeflectFoe:()=>false,finishGlassShieldParry(){},hurtDragon(){},bolts:[],
 playerHp:6,landed:0,BOSS_KIND:/^(golem[1234]|devil|lich|ghost3?|knight|treasuryknight)$/});
const run=s=>vm.runInContext(s,c);
run(game.slice(game.indexOf('const FOE = {'),game.indexOf('const FOE_ART =')));
run(game.slice(game.indexOf('function heavyFoe('),game.indexOf('function swingHits()')));
run(game.slice(game.indexOf('function beginEnemyWindup('),game.indexOf('function queueGlassShieldBlock(')));
run(game.slice(game.indexOf('function stepFoes(dt)'),game.indexOf('let pHp =')));
for(const kind of ['golem1','golem2','golem3','golem4','devil','lich','knight','treasuryknight']){
 c.kind=kind;const k=run('FOE[kind]');c.foes=[{kind,x:100,y:120,hx:100,hy:120,st:'walk',t:0,hp:run('enemyMaxHp(kind,100)'),hurt:0,ring:0}];c.f=c.foes[0];
 Object.assign(c,{playerHp:6,landed:0,turnT:0,turnHolder:null,foeCool:0,tAcc:0});
 // Corin never stops attacking. Boss windups must still begin and finish.
 for(let i=0;i<600&&c.landed===0;i++){
  c.tAcc+=1/60;run('stepFoes(1/60)');
  if(i%30===0){const st=c.f.st,t=c.f.t;run('makeFoeRetreat(f,P.x,P.y)');if(st==='wind'||st==='swing'){assert.equal(c.f.st,st);assert.equal(c.f.t,t,'sword hits never reset committed attack timing');}}
 }
 assert(c.landed>0||c.bolts.length>0,kind+' retaliates during endless slashes');
 // Reset for a real health race: upgraded sword at two full swings/second,
 // with a stronger third strike. The temple bosses must punish standing still.
 if(!/^(golem[1234]|devil)$/.test(kind))continue;
 Object.assign(c.f,{st:'walk',t:0,hp:run('enemyMaxHp(kind,100)'),retreat:0,pressureHits:0});
 Object.assign(c,{playerHp:6,landed:0,turnT:0,turnHolder:null,foeCool:0,tAcc:0});
 let swings=0;
 for(let i=0;i<1800&&c.playerHp>0&&c.f.hp>0;i++){
  c.tAcc+=1/60;run('stepFoes(1/60)');
  if(i%30===12){swings++;c.f.hp-=swings%3===0?3:2;if(c.f.hp>0)run('makeFoeRetreat(f,P.x,P.y)');}
 }
 assert(c.playerHp<=0&&c.f.hp>0,kind+' requires defense or movement, not stationary sword spam');
}
console.log('PASS: eight heavy enemy types attack through sword spam; hits preserve committed windups; all four golems and Ashfiend defeat stationary upgraded-sword mashing.');
