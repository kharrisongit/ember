import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('assets/dialogue/npc-world-talks.json',root),'utf8'));
fs.writeFileSync(new URL('js/npc-world-talks.js',root),'/* Authored dialogue data. Rebuild with node tools/build-npc-world-talks.mjs. */\nconst NPC_WORLD_TALKS = '+JSON.stringify(data,null,2)+';\n');
console.log('Built world topics for '+Object.keys(data).length+' NPCs.');
