import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:false});
dom.element('bagAsk').append(dom.element('askRows'));
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`mode='play';gameplayStarted=true;MAPID='world';MD=W.maps.world;quest=Q.DONE;
 dragonIntroDone=true;dragon.on=true;dragon.placed=MAPID;dragonOff=false;dragon.down=false;dragon.air=false;
 mounted=false;thornwellRoyal.stage=7;P.x=12000;P.y=3300;dragon.x=12000;dragon.y=3300;
 saveGame=()=>{};faceToward=()=>{};EmberRiding.skip();EmberEquipmentTutorial.skip();`);
const strangers=json("Object.values(DialogueRenewal.cast).filter(p=>p.home!=='Millwood'&&p.name!=='Aurelius').map(p=>p.name)");
for(const name of strangers){
 c.actor={n:name,x:12000,y:3320};
 for(const won of [false,true]){
  c.victory=won;run('discussedTopics.clear();wonAll=victory;dragon.x=14000;');
  const p=json('DialogueRenewal.profile(actor)');
  const first=json('DialogueRenewal.introduction(actor).lines');
  assert.equal(first[0],name+': '+p.greetings[0],name+' unseen even after victory');
  assert.doesNotMatch(first[0],/\bCorin\b/,name+' cannot know the name');
  assert.match(first[1],/\bCorin\b/,name+' hears an introduction');
  assert(!run("discussedTopics.has('@renewal-v1:'+actor.n+':met')"),'Opening a greeting is not finishing one');
  run('DialogueRenewal.introduction(actor).done()');
  assert.equal(run('DialogueRenewal.introduction(actor).lines[0]'),name+': '+p.greetings[2]);
  run('dragon.x=12000');assert(run('npcSeesDragon(actor)'));
  const sight=json('DialogueRenewal.introduction(actor).lines');
  assert.equal(sight[0],name+': '+p.greetings[4]);
  assert.doesNotMatch(sight[1].slice(7),/\bCorin\b/,name+' remembers the human when first seeing the dragon');
  run('DialogueRenewal.introduction(actor).done()');
  const known=json('DialogueRenewal.introduction(actor).lines');
  c.saved=json('[...discussedTopics]');run('discussedTopics.clear();saved.forEach(k=>discussedTopics.add(k))');
  assert.deepEqual(json('DialogueRenewal.introduction(actor).lines'),known,name+' remembers after reload');
  run('discussedTopics.clear()');
  const withDragon=json('DialogueRenewal.introduction(actor).lines');
  assert.doesNotMatch(withDragon[0],/\bCorin\b/);assert.match(withDragon[1],/\bCorin\b/);
 }
}
// Scripted meetings obey the same name rule and persist the social introduction.
run(`wonAll=false;dragon.x=14000;discussedTopics.clear();actor={n:'Rowan the Hunter',x:12000,y:3320};`);
const reunion=json('ThornwellDialogue.reunion(actor)');
assert.doesNotMatch(reunion[0],/\bCorin\b/);assert.match(reunion[1],/I'm Corin/);
run('ThornwellDialogue.rememberReunion(actor)');
assert.equal(run('DialogueRenewal.introduction(actor).lines[0]'),'Rowan the Hunter: '+run('DialogueRenewal.cast[actor.n].greetings[2]'));
run(`discussedTopics.clear();quest=Q.ARMED;actor={n:'Mosslet',shroomLookout:true,x:12000,y:3320};talkShroomLookout(actor);`);
assert.match(run('scene.lines[1]'),/I'm Corin/);assert(!run("discussedTopics.has('@renewal-v1:Mosslet:met')"));
run('scene.after();scene=null');assert(run("discussedTopics.has('@renewal-v1:Mosslet:met')"));
// A save with old topic completions still offers the new stories unread.
run(`EmberFriendship.restore({tutorialSeen:true,people:{Hettie:{completed:['renewal-0'],known:[],rewarded:true}}});openNpcTopics({n:'Hettie',x:12000,y:3320});`);
assert(run('ask.opts.filter(o=>o.friendship).every(o=>o.friendshipId.startsWith("renewal-v2-"))'));
assert.equal(run('EmberFriendship.status().completed'),0);
console.log(`PASS: ${strangers.length} strangers before/after victory, with/without a dragon, completed introductions, return visits, reloads, Rowan/Mosslet scenes and old topic migration.`);
