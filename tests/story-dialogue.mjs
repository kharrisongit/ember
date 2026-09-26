import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const c=vm.createContext({W:{maps:{}}});
const run=s=>vm.runInContext(s,c);
run(read('js/story-dialogue.js'));
const names=['Hettie','Elder Maddock','Nan Ferrow'];
c.W.maps={world:{npcs:names.map(n=>({n,d:['Old line'],dd:['Old dragon line']}))},house22:{npcs:[{n:'Elder Maddock'}]}};
run('applyMillwoodStoryDialogue()');
for(const npc of [...c.W.maps.world.npcs,...c.W.maps.house22.npcs]){
 for(const key of ['d','d2','dm','dd','dd2','dv','dv2','dragonNear','dragonRumor','dragonRumor2']){
  assert(npc[key]?.length,npc.n+' '+key);
  assert(npc[key].every(line=>/^(Corin|Maddock|Hettie|Nan Ferrow): /.test(line)));
  assert(!npc[key].some(line=>line.startsWith('Old')));
 }
}
assert.notEqual(c.W.maps.world.npcs[1].d,c.W.maps.house22.npcs[0].d,'map copies keep independent dialogue arrays');
const maddock=c.W.maps.house22.npcs[0];
for(const key of ['dd','dragonRumor']){
 assert.match(maddock[key].join(' '),/east of Thornwell/);
 assert.match(maddock[key].join(' '),/Cinderhold/);
}
for(const file of ['js/game.js','js/generated/game-part-2.js']){
 const source=read(file);
 assert(source.includes('individualizeDialogue();\n  applyMillwoodStoryDialogue();'));
 const hatch=vm.runInNewContext(source.slice(source.indexOf('const HATCH_LINES ='),source.indexOf('\nlet hatchScene ='))+'\nHATCH_LINES');
 assert.match(hatch[3],/Set it here/);assert.match(hatch[7],/shell splits/);assert.match(hatch[10],/stone/);
 assert.match(hatch.join(' '),/Cinderhold/);assert.match(hatch.join(' '),/east of Thornwell/);
 assert.doesNotMatch(source,/roads full of dead things|Shroom Pass has the dead walking|Not that way\. Not unarmed/);
}
console.log('PASS: all story dialogue states replaced, indoor/outdoor Maddock directions agree, and hatch choreography stays aligned.');
