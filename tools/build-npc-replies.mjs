import fs from 'node:fs';
const rows=fs.readFileSync('assets/dialogue/npc-replies.tsv','utf8').trim().split('\n').map(row=>row.split('|'));
const data={};for(const [name,reply,answer,...extra]of rows){
 if(!name||!reply||!answer||extra.length||data[name])throw new Error('Invalid or duplicate reply: '+name);
 data[name]=[reply,answer];
}
const cast=JSON.parse(fs.readFileSync('assets/dialogue/npc-extra-topics.json','utf8'));
for(const name of Object.keys(cast))if(!data[name])throw new Error('Missing reply: '+name);
fs.writeFileSync('js/npc-replies.js','/* Authored alternative replies; rebuild with tools/build-npc-replies.mjs. */\nconst NPC_REPLY_BRANCHES='+JSON.stringify(data,null,2)+';\n');
console.log('Built '+rows.length+' distinct NPC reply branches.');
