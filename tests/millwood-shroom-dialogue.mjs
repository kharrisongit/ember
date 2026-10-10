import assert from 'node:assert/strict';
import {checkRegion} from './helpers-dialogue-region.mjs';
const {run,c}=await checkRegion('MillwoodShroomDialogue.cast');
for(const name of ['Nan Ferrow','Hettie','Odo']){
 c.actor={n:name,x:100,y:100};run('EmberConversationFlow.shut(true);askShut();scene=null;sayNpc=null;quest=Q.ABED;dragon.on=false;openNpcTopics(actor)');
 assert.equal(run('ask.npcConversation'),name,'Early residents also have full screens');
 assert(run('npcStoryTopics(actor).some(t=>t.lines)'));
}
run('quest=Q.EGGS');assert(!run('npcStoryTopics({n:"Elder Maddock"}).some(t=>t.friendshipId==="renewal-v2-2")'),'Hatch history does not appear early');
run('quest=Q.DONE;dragonIntroDone=true;wonAll=false;breathHas.lightning=false;breathHas.ice=false;breathHas.shadow=false');
const route=()=>run('DialogueRenewal.guides({n:"Elder Maddock"}).find(t=>t.friendshipId==="renewal-temples").lines[0]');
assert.match(route(),/Forgewick.*Lightning/);run('breathHas.lightning=true');assert.match(route(),/Next is Ice.*Sandspire/);
run('breathHas.ice=true');assert.match(route(),/need Shadow.*Hollybeck/);run('breathHas.shadow=true');assert.match(route(),/completes.*Frostcrag.*Ashcrag.*Cinderhold/);
console.log('PASS: full early conversations, retained story knowledge gates and current temple destinations.');
