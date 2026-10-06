import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:false});
dom.element('bagAsk').append(dom.element('askRows'));
run(`mode='play';gameplayStarted=true;quest=Q.DONE;MAPID='world';MD=W.maps.world;MW=MD.w;MH=MD.h;terr=new Uint8Array(MW*MH);P.x=100;P.y=120;dragon.on=true;dragon.placed='world';dragonIntroDone=true;thornwellRoyal.stage=7;brambleQuest=3;templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;EmberFriendship.restore({tutorialSeen:true});EmberRiding.skip();EmberEquipmentTutorial.skip();faceToward=()=>{};saveGame=()=>{};`);
const close=()=>run('EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;revealing=null;P.act=null;');
const open=(name,extra={})=>{close();c.actor={n:name,x:100,y:100,...extra};run('openNpcTopics(actor);EmberConversationFlow.openChat()');assert(run('EmberConversationFlow.active()'));};
const choose=title=>{c.title=title;run('if(EmberConversationFlow.welcoming())EmberConversationFlow.openChat();askPick=ask.opts.findIndex(o=>o.n===title)');assert(run('askPick>0'),title);run('askTake()');};
const finish=()=>{for(let i=0;i<80&&run('!!scene||!!sayNpc||!!revealing');i++)run('if(revealing)hideReveal();else {typeAll();if(scene)scene.t=1;EmberConversationFlow.advance();}EmberConversationFlow.tick(performance.now());');assert(!run('scene||sayNpc||revealing'),'Service finishes without trapping input');};
run('fishingPole=false;odoRodReferral=false');open('Odo');choose('Finding a fishing rod');assert(!run('fishingPole'));finish();assert(run('odoRodReferral&&!fishingPole'));
open('Calder');choose('Odo suggested your spare rod');assert(!run('fishingPole'),'Rod waits for the offer');finish();assert(run('fishingPole'),'Calder gives the actual rod');open('Calder');assert(!run('ask.opts.some(o=>/rod\?/.test(o.n)&&o.category==="lead")'));
run('smithUpgrade=false;charm.edge=false');open('Dunstan',{charm:'edge'});choose('Help with my equipment');assert(!run('smithUpgrade||charm.edge'));finish();assert(run('smithUpgrade&&charm.edge'),'Both smith rewards complete through retained screen');open('Dunstan',{charm:'edge'});assert(!run('ask.opts.some(o=>o.n==="Help with my equipment")'));
run('glassShield=false;dragonBanterSeen.delete("learned:shield")');open('Sela');assert(!run('ask.opts.some(o=>o.n.includes("Dunstan sent"))'));
open('Dunstan');choose('Sela’s protective glass');assert(run('dragonLearned("shield")'),'Hearing the referral records its real quest flag');close();open('Sela');choose('Dunstan sent me for the Glass Shield');assert(!run('glassShield'));finish();assert(run('glassShield'));
// The throne keeper can be inspected without receiving a seal or entering a trial.
run('wonAll=true;cinderSeal=false;trialSealPlaced=false;trial=null;MAPID="witchmoor";MD=W.maps.witchmoor');open('Demon');assert(!run('cinderSeal||trial'));choose('The trial seal');assert(!run('cinderSeal'),'Seal is granted after its explanation');finish();assert(run('cinderSeal&&!trial'));
run('MAPID="cinderhold";MD=W.maps.cinderhold;trialSealPlaced=true');open('Demon');choose('Choose a trial');finish();assert(run('ask.npcConversation==="Demon"&&!trial'),'Trial confirmation retains the conversation screen');choose('I need to prepare');assert(!run('trial'));choose('Choose a trial');finish();choose('Begin the trial');assert(run('!!trial'));assert(!run('EmberConversationFlow.active()'),'Battle releases the full-screen conversation');
// A retired optional quest must not remain an impossible friendship checkbox.
close();run(`trial=null;EmberFriendship.restore({tutorialSeen:true,people:{Aurelius:{completed:[],rewarded:false,known:[{id:'old-side-quest',title:'Old dialogue',sideQuest:true}]}}});actor={n:'Aurelius',x:100,y:100};openNpcTopics(actor);`);
assert.equal(run('EmberFriendship.status().total'),18);assert(!run('EmberFriendship.status().topics.some(t=>t.sideQuest)'));
console.log('PASS: full-screen fishing rod, smith upgrade/Whetstone, shield referral and gift, trial seal/decline/start, and legacy Aurelius friendship migration.');
