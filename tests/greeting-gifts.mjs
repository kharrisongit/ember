import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
run(`MAPID='world';MD=W.maps.world;mode='play';gameplayStarted=true;quest=Q.DONE;dragonOff=true;
scene=null;ask=null;sayNpc=null;P.act=null;ride=null;fade=0;fadeDir=0;doorMotion=null;EmberRiding.skip();EmberEquipmentTutorial.skip();`);
for(const name of ['faceToward','faceCorinAt','dragonConversationReaction','saveGame'])c[name]=()=>{};
for(const name of ['interactTrialPedestal','tryFerrySign','ferryTry','tryHouseLootChest','tryTreasuryChest','tryExpandedTempleLever','tryTempleLever','tryCellarSupplies','tryChest','itemAt','questTalk'])c[name]=()=>false;
let rewards=0;c.showReveal=()=>rewards++;
for(const [name,key] of [['The Shroom King','spore'],['Fen','twin'],['Maelis','ward'],['Rashida','brand'],['Sverre','lamp']]){
 c.actor={n:name,charm:key,x:100,y:100,d:[name+': Take this for your journey.']};
 run('scene=null;ask=null;sayNpc=null;EmberConversationFlow.prompt(actor)');
 assert(run('sayNpc===actor'),name+' starts gift dialogue without Talk');
 assert.equal(run('ask'),null);
 for(let i=0;i<30&&run('!!sayNpc');i++)run('typeAll();interact()');
 assert(run(`charm.${key}`),name+' awards the item after greeting');
 const before=rewards;run('beginNpcTalk(actor,true)');
 for(let i=0;i<30&&run('!!sayNpc');i++)run('typeAll();interact()');
 assert.equal(rewards,before,name+' never awards the gift twice');
}
console.log('PASS: five gift greetings bypass Talk and grant each reward once.');
