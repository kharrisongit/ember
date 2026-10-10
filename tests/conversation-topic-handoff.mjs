import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';

const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false,document:dom.document});
const box=dom.element('bagAsk');box.append(dom.element('askRows'));
// The lightweight DOM does not parse the recipe view's innerHTML. The browser
// regression exercises that view; keep its actual state machine here.
c.CraftingView=undefined;
run(`mode='play';gameplayStarted=true;MAPID='world';quest=Q.ARMED;bagOwned=true;
 scene=null;sayNpc=null;revealing=false;fadeDir=0;doorMotion=null;foes=[];
 EmberRiding.skip();EmberEquipmentTutorial.skip();EmberFriendship.restore({tutorialSeen:true});
 templeCompass.morningMet=true;Crafting.giveKit();saveGame=()=>{};`);
const click=button=>button.onclick({stopPropagation(){}});
for(const name of ['The Shroom King','Nan Ferrow','Wren','Dunstan','Maelis','Sverre']){
 c.teacherName=name;
 run(`Crafting.close();askShut();scene=null;sayNpc=null;
   var teacher={n:teacherName,x:P.x,y:P.y-20};openNpcTopics(teacher);`);
 click(box.querySelector('.conversationChat'));
 const index=run(`ask.opts.findIndex(o=>o.n===Crafting.topics(teacher)[0].title)`);
 assert(index>0,name+' offers the lesson');
 click(box.querySelectorAll('.deckTopic').find(b=>Number(b.dataset.askIndex)===index));
 assert(run('!!scene&&!ask&&!EmberConversationFlow.active()'));
 assert.equal(box.style.display,'none',name+': the old topic panel must stop covering the lesson');
 assert.equal(dom.element('say').parentNode,c.document.body);
 assert(dom.element('say').classList.contains('on'));
 run('stepType(.1)');assert(run('typed>0'),'The lesson clock continues');
 run('for(let i=0;i<4&&scene;i++){typeAll();scene.t=1;advanceScene();}');
 assert(run('Crafting.active()'),name+': completing the lesson opens recipes');
 run('Crafting.close();openNpcTopics(teacher)');
 click(box.querySelector('.conversationChat'));
 const story=run(`ask.opts.findIndex(o=>o.friendshipId==='renewal-0')`);
 click(box.querySelectorAll('.deckTopic').find(b=>Number(b.dataset.askIndex)===story));
 assert(run('!!scene?.conversationReplies&&EmberConversationFlow.active()'));
 assert.equal(box.style.display,'grid','Ordinary stories keep their conversation panel');
 run('typeAll();scene.t=1;EmberConversationFlow.next()');
 assert(run('ask.replyChoices'),'Replies still work after returning from a lesson');
 click(box.querySelectorAll('.deckReply')[0]);
 assert.equal(run('typeWho'),'Corin');
 assert.equal(run('ask'),null);
}
console.log('PASS: all six named crafting teachers hand off visible speech and recipes, then reopen working topics and replies.');
