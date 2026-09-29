import fs from 'node:fs';
const root=new URL('../',import.meta.url),path=new URL('js/npc-conversations.js',root);
const data={};
for(const row of fs.readFileSync(new URL('assets/dialogue/npc-stories.tsv',root),'utf8').trim().split('\n')){
  const [name,...parts]=row.split('|');
  if(parts.length!==8||parts.some(s=>!s.trim())||data[name])throw Error('Invalid story row: '+name);
  data[name]=[parts.slice(0,4),parts.slice(4)];
}
const current=fs.readFileSync(path,'utf8'),runtime=current.slice(current.indexOf('\nfunction npcSeesDragon'));
fs.writeFileSync(path,'/* Generated story data from assets/dialogue/npc-stories.tsv; rebuild with tools/build-npc-stories.mjs. Runtime follows below. */\nconst NPC_STORIES = '+JSON.stringify(data,null,2)+';\n'+runtime);
console.log('Built personal stories for '+Object.keys(data).length+' characters.');
