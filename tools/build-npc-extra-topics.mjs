import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('assets/dialogue/npc-extra-topics.json',root),'utf8'));
const seen=new Set();
for(const [name,topics]of Object.entries(data))for(const t of topics){
  if(!t.title||!['story','world'].includes(t.category)||t.exchange.length!==3)throw Error('Invalid topic: '+name);
  for(const line of [t.exchange[0],t.exchange[2]]){if(seen.has(line))throw Error('Repeated reply: '+name);seen.add(line);}
}
const runtime=fs.readFileSync(new URL('tools/npc-extra-runtime.txt',root),'utf8');
fs.writeFileSync(new URL('js/npc-extra-topics.js',root),'/* Generated from assets/dialogue/npc-extra-topics.json; rebuild with tools/build-npc-extra-topics.mjs. */\nconst NPC_EXTRA_TOPICS='+JSON.stringify(data,null,2)+';\n'+runtime);
console.log(Object.keys(data).length+' characters, '+Object.values(data).flat().length+' authored topics.');
