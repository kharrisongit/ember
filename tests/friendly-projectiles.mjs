import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
run(`mode='play';gameplayStarted=true;quest=Q.DONE;loadMap('house22');
window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEquipmentTutorial=undefined;window.EmberConversationFlow=undefined;
MD={...MD,roomBlocks:[],roomActors:[]};solid.fill(0);npcs=[];objs=[];features=[];
scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;bagOpen=false;arenaLock=null;fadeDir=0;doorMotion=null;bossScene=null;
foesHeld=false;saintT=0;glassShield=false;dragonOff=true;devSafe=false;mounted=false;`);
function launch(kind,health=20){
  run(`P.x=140;P.y=184;pHp=6;pInv=0;P.act=null;bolts.length=0;
  var caster={kind:'mage1',x:100,y:192,hx:100,hy:192,hp:0,st:'dead',t:0,dir:'s',flip:false,hold:0,hurt:0};
  var victim={kind:'plant1',x:200,y:192,hx:200,hy:192,hp:${health},st:'wind',t:0,dir:'d',hold:0};
  foes=[caster,victim];`);
  if(kind==='ally'){run('stones=1');assert(run('useStone()'));run('caster.reverseRise=0');}
  else run(`caster.hp=9;caster.st='idle';${kind==='mad'?'dust=1;useDust();':''}`);
  run(`caster.st='swing';caster.t=FOE.mage1.hitAt;caster.hit=0;turnHolder=caster;turnT=10;stepFoes(.05);`);
  assert.equal(run('bolts.length'),1);
  run('for(var i=0;i<30;i++)stepBolts(.05)');
}
launch('ally');assert.equal(run('pHp'),6);assert.equal(run('victim.hp'),18);
launch('mad');assert.equal(run('pHp'),6);assert.equal(run('victim.hp'),16,'Madness retains its double damage');
launch('ally',1);assert.equal(run('victim.st'),'dead','An allied projectile completes enemy defeat');
launch('hostile');assert.equal(run('pHp'),4);assert.equal(run('victim.hp'),20,'Ordinary hostile shots keep targeting the rider');
console.log('PASS: raised and maddened mages damage enemies without friendly fire, lethal shots finish defeat, and hostile spells still hit the rider.');
