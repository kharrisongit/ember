import fs from 'node:fs';
const greetings={},seen=new Set();
for(const row of fs.readFileSync('assets/dialogue/npc-greetings.tsv','utf8').trim().split('\n')){
  const [name,line,...extra]=row.split('|');
  if(!name||!line||extra.length||greetings[name]||seen.has(line))throw Error('Invalid or repeated greeting: '+name);
  greetings[name]=line;seen.add(line);
}
const cast=JSON.parse(fs.readFileSync('assets/dialogue/npc-extra-topics.json','utf8'));
for(const name of [...Object.keys(cast),'Aurelius'])if(!greetings[name])throw Error('Missing greeting: '+name);
const replies={},replySeen=new Set();
for(const row of fs.readFileSync('assets/dialogue/corin-greetings.tsv','utf8').trim().split('\n')){
  const [name,line,...extra]=row.split('|');
  if(!greetings[name]||!line||extra.length||replies[name]||replySeen.has(line))throw Error('Invalid or repeated Corin greeting: '+name);
  replies[name]=line;replySeen.add(line);
}
for(const name of Object.keys(greetings))if(!replies[name])throw Error('Missing Corin greeting: '+name);
fs.writeFileSync('js/npc-greetings.js','/* Authored greetings; rebuild with tools/build-npc-greetings.mjs. */\nconst NPC_TOPIC_GREETINGS='+JSON.stringify(greetings,null,2)+';\nconst CORIN_TOPIC_GREETINGS='+JSON.stringify(replies,null,2)+';\n');
console.log('Built '+seen.size+' unique greeting pairs.');
