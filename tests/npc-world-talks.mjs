import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
await import('./dialogue-renewal-services.mjs');
const dom=gameDom(),{run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{document:dom.document,furniture:false});
run(`quest=Q.DONE;dragonIntroDone=true;thornwellRoyal.stage=7;MAPID='world';MD=W.maps.world;`);
for(const [name,id,item,knowledge]of [['Dunstan','shield','shield','shield'],['Mira','lantern','lamp','lantern'],['Oren','graveyard','wake','graveyard'],['Tamsin','witch','ward','gift:Maelis']]){
 c.actor={n:name};c.id=id;c.item=item;c.knowledge=knowledge;
 run('glassShield=false;charm[item]=false;dragonBanterSeen.clear()');
 const get=()=>run('DialogueRenewal.guides(actor).find(t=>t.friendshipId==="renewal-"+id)');
 assert(get().questUnlock,name+' flags an undiscovered quest');
 c.opening=get().lines[0];run('rememberDragonKnowledge(actor.n,opening,false)');assert(run('dragonLearned(knowledge)'),name+' actual speech records the lead');
 assert(!get().questUnlock,name+' stops showing New quest once learned');
 const before=get().lines[0];run('if(item==="shield")glassShield=true;else charm[item]=true');assert.notEqual(get().lines[0],before,name+' acknowledges an owned reward');
}
for(const name of ['Cartwright Oswin','Miner Marn','Miner Nerik','Snowbuilder Nessa']){
 c.actor={n:name};run('wonAll=false;brambleQuest=0;smithUpgrade=false;charm.edge=false;breathHas.lightning=false;breathHas.ice=false;breathHas.shadow=false');
 const before=run('DialogueRenewal.guides(actor).find(t=>t.friendshipId==="renewal-road").lines[0]');
 run('brambleQuest=3;smithUpgrade=true;charm.edge=true;breathHas.lightning=true;breathHas.ice=true;breathHas.shadow=true');
 const after=run('DialogueRenewal.guides(actor).find(t=>t.friendshipId==="renewal-road").lines[0]');assert.notEqual(after,before);assert.match(after,/clear|open|moved aside/);
}
console.log('PASS: actual quest discovery, completed reward guidance and all four roadwork stages.');
