import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
run(`mode='play';gameplayStarted=true;quest=Q.DONE;wonAll=0;loadMap('cinderhold');
scene=null;bossScene=null;fadeDir=0;doorMotion=null;ovl=null;ask=null;foesHeld=false;lastFight=3;
window.EmberArenaEntry=undefined;window.EmberEncounterCard=undefined;window.EmberRiding=undefined;window.EmberEquipmentTutorial=undefined;
dragonOff=true;dragon.on=false;P.act=null;pHp=6;
const facingLich={kind:'lich',x:176,y:300,hx:176,hy:300,hp:16,st:'idle',t:0,dir:'s',flip:false,cool:99,hold:0};foes=[facingLich];`);
for(const state of ['idle','walk','wind','swing'])for(const dx of [-12,12,-24,24,-60,60]){
 run(`Object.assign(facingLich,{x:176,y:300,st:'${state}',t:0,dir:'s',flip:${dx>0},cool:99,retreat:0});P.x=176+${dx};P.y=300;stepFoes(.01);`);
 assert.equal(run('foeDir(facingLich.dir,facingLich.flip)'),dx<0?'w':'e',state+' tracks Corin at '+dx+'px');
}
console.log('PASS: Lich turns west and east at close and far range while idle, walking, winding up and casting.');
