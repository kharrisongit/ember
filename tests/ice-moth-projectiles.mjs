import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
await run('IceMoth.prepare()');
run(`MAPID='world';MD={...W.maps.world,roomBlocks:[],collisionOverrides:{}};MW=3000;MH=600;PXW=MW*TS;PXH=MH*TS;solid=new Uint8Array(MW*MH);npcs=[];objs=[];fenceAt=null;quest=Q.DONE;wonAll=1;scene=null;bossScene=null;ovl=null;ask=null;fadeDir=0;doorMotion=null;foesHeld=false;
window.EmberArenaEntry=undefined;window.EmberEncounterCard=undefined;window.EmberRiding=undefined;
const mothHits={player:0,dragon:0};hurtPlayer=()=>mothHits.player++;hurtDragon=()=>mothHits.dragon++;
dragonCombatHere=()=>true;
const spellMoth={kind:'icemoth',x:2346*16+8,y:168*16+8,dir:'d',flip:false,_thinking:true,hold:0};
arenaLock=IceMoth.arena;arenaT=1;foes=[spellMoth];`);
function cast(type='shards',distance=80,dragonTarget=false){
 run(`IceMoth.reset();mothHits.player=0;mothHits.dragon=0;solid.fill(0);mounted=false;dragon.on=false;dragon.down=false;glassShield=false;glassShieldHeld=false;
 P.x=spellMoth.x;P.y=spellMoth.y+${distance};dragon.x=spellMoth.x;dragon.y=spellMoth.y+${distance};
 Object.assign(spellMoth,{st:'swing',t:.13,hit:0,glassParryQueued:false,unblockableAttack:false,mothAttack:'${type}',mothAim:{x:P.x,y:P.y,dragon:${dragonTarget}}});IceMoth.step(spellMoth,0);`);
}
const advance=n=>{for(let i=0;i<n;i++)run('IceMoth.effects(.05)');};
cast('shards',40);advance(12);assert.equal(run('mothHits.player'),1,'All three nearby shards share a single player hit');
cast('gust');run('dragon.on=true;P.x+=200;');advance(45);assert.equal(run('mothHits.dragon'),1,'The visible gust can hit Aurelius');
cast('shards');run('dragon.on=true;mounted=true;');advance(45);assert.equal(run('mothHits.player'),1);assert.equal(run('mothHits.dragon'),0,'Mounted contact is not counted twice');
cast('shards');run('const mothWallRow=Math.floor((spellMoth.y+48)/TS);solid.fill(1,mothWallRow*MW,(mothWallRow+1)*MW);');advance(50);assert.equal(run('mothHits.player'),0,'Walls intercept shots before the player');assert.equal(run('IceMoth.inspect().shots.length'),0);
cast('gust');run('glassShield=true;glassShieldHeld=true;glassShieldWindowUntil=tAcc+1;');advance(30);
assert.equal(run('mothHits.player'),0,'A timed shield blocks a yellow attack');assert.equal(run('glassShieldPulse'),.42);
cast('shards');run('IceMoth.reset();spellMoth.unblockableAttack=true;spellMoth.hit=0;IceMoth.step(spellMoth,0);spellMoth.unblockableAttack=false;glassShield=true;glassShieldHeld=true;glassShieldWindowUntil=tAcc+1;');advance(30);
assert.equal(run('mothHits.player'),1,'Orange projectiles remain unblockable after the caster recovers');
cast('shards');run('IceMoth.reset();spellMoth.hit=0;spellMoth.glassParryQueued=true;IceMoth.step(spellMoth,0);');advance(30);
assert.equal(run('mothHits.player'),0,'A block queued during windup protects against the whole volley');
cast('gust');run("spellMoth.st='dead';IceMoth.effects(.05);");assert.equal(run('IceMoth.inspect().shots.length'),0,'Dead casters cannot leave damaging spells behind');
for(let sequence=0;sequence<4;sequence++){
 cast('gust');run(`Object.assign(spellMoth,{st:'idle',t:0,mothCool:0,attackSeq:${sequence},mothAttack:null});IceMoth.step(spellMoth,0);`);
 assert.equal(run('spellMoth.st'),'wind');assert.equal(run('spellMoth.unblockableAttack'),sequence===3,'Every fourth cast warns about its heavy, unblockable projectile');
}
console.log('PASS: player/dragon projectile collision, yellow shield blocks, orange unblockable casts, queued volley blocks, mounted damage, walls and cleanup.');
