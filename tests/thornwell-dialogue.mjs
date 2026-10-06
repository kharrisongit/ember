import assert from 'node:assert/strict';
import {checkRegion} from './helpers-dialogue-region.mjs';
const {run,c}=await checkRegion('THORNWELL_DIALOGUE_CAST');
run('wonAll=false;brambleQuest=1');
const clues=[];
for(const name of run('Object.keys(THORNWELL_DIALOGUE_CAST)')){
 c.actor={n:name,x:100,y:100};const clue=run('DialogueRenewal.guides(actor).find(t=>t.title==="Bramble’s missing owner")');
 if(!clue)continue;
 assert.equal(clue.friendship,false,'A temporary quest cannot block friendship');
 run('EmberConversationFlow.shut(true);scene=null;askShut()');clue.go();
 const lines=run('scene.lines');assert(lines.some(l=>/Rowan/.test(l)));assert(lines.some(l=>/Copper Cup|tavern|here|hunter by the tables/.test(l)));clues.push(lines.join(' '));
}
assert(clues.length>=40);assert.equal(new Set(clues).size,clues.length,'Town clues have individual voices');
run('brambleQuest=3');assert(!run('DialogueRenewal.guides({n:"Linna"}).some(t=>t.title==="Bramble’s missing owner")'));
console.log('PASS: distinct Bramble referrals disappear after his reunion.');
