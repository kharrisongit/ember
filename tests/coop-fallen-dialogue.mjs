import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{furniture:false});
run(`window.LDRCoopRender={enable(){}};quest=Q.DONE;mode='play';loadMap('house22');[P.x,P.y]=MD.spawn;`);
await run(`LDRCampaign.start({uid:'host',players:[{uid:'host',profile:{name:'Host'}},{uid:'guest',profile:{name:'Guest'}}],onNotice:()=>{},onSave:()=>{}})`);
const press=(id,mode,down)=>run(mode==='control'?`LDRCampaign.command('${id}','control',{control:'act',down:${down}})`:`LDRCampaign.command('${id}','key',{key:'Enter',down:${down},repeat:false})`);
for(const fallen of ['host','guest'])for(const mode of ['control','key']){
 const living=fallen==='host'?'guest':'host';
 run(`scene=null;sayNpc=null;revealing=false;foes=[];arenaLock=null;ask=null;ovl=null;deadShown=false;
 LDRCampaign.withActor('${living}',()=>{pHp=6;P.act=null;P.x=100;P.y=192;});
 LDRCampaign.withActor('${fallen}',()=>{pHp=0;P.act={kind:'die',t:6.99,done:1};P.x=200;P.y=192;});
 LDRCampaign.claim('${living}','action');playScene(['Corin: Shared line.','Corin: Next line.']);typeAll();scene.t=1;`);
 assert.equal(run(`LDRCampaign.command('${fallen}','bag')`),false,'Falling still blocks gameplay menus');
 assert(press(living,mode,true));press(living,mode,false);
 assert.equal(run('scene.i'),0,'The living rider still waits for their partner');
 assert(press(fallen,mode,true));press(fallen,mode,false);
 assert.equal(run('scene.i'),1,'A fallen rider can advance through either native A or keyboard');
 assert.equal(run(`LDRCampaign.actor('${fallen}').vars.pHp`),0,'Dialogue does not silently revive a fallen rider');
 run('typeAll();scene.t=1');
 assert(press(fallen,mode,true));press(fallen,mode,false);
 assert(press(living,mode,true));press(living,mode,false);
 assert(!run('scene'),'Both riders finish the scene');
 run('sayNpc=null;revealing=false;');
 assert.equal(press(fallen,mode,true),false,'The dialogue exception cannot trigger attacks after the scene');
 assert.equal(run(`LDRCampaign.command('${fallen}','revive')`),false);
 run(`LDRCampaign.withActor('${living}',()=>{P.x=190;P.y=192;});LDRCampaign.command('${living}','revive');`);
 assert.equal(run(`LDRCampaign.actor('${fallen}').vars.pHp`),3,'The surviving rider can then approach and revive normally');
}
console.log('PASS: fallen host or guest continues shared dialogue with A/keyboard in either vote order, stays down until revived, and cannot attack or open menus.');
