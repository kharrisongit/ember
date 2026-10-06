import fs from 'node:fs';
import assert from 'node:assert/strict';
const cast={};let current;
for(const file of fs.readdirSync('assets/dialogue/renewal').filter(f=>f.endsWith('.txt')).sort()){
 for(const [i,line]of fs.readFileSync('assets/dialogue/renewal/'+file,'utf8').split('\n').entries()){
  if(!line.trim()||line.startsWith('#'))continue;
  const cells=line.slice(2).split('|').map(s=>s.trim());
  const at=file+':'+(i+1);
  if(line.startsWith('@ ')){
   const [name,home,role]=cells;assert(!cast[name],at+' duplicate '+name);
   current=cast[name]={name,home,role,source:at,topics:[]};
  }else if(line.startsWith('> ')){
   assert(current&&cells.length===6,at+' needs six greeting fields');current.greetings=cells;
  }else if(line.startsWith('= ')){
   assert(current&&cells.length===9,at+' needs title, Corin question, NPC opening and three complete reply pairs');
   const [title,opening,first,...rest]=cells;
   assert(opening&&/\?$/.test(opening),at+" needs an authored Corin opening question");
   current.topics.push({title,opening,first,replies:[rest.slice(0,2),rest.slice(2,4),rest.slice(4,6)]});
  }else throw Error(at+' unknown row');
 }
}
for(const [name,p]of Object.entries(cast)){
 assert(p.greetings&&p.topics.length>=3,name+' incomplete');
 for(const t of p.topics){assert.equal(new Set(t.replies.map(r=>r[0])).size,3,name+' repeated choices');assert(t.replies.every(r=>r.every(Boolean)));}
}
const code='/* Authored in assets/dialogue/renewal; rebuild with tools/build-dialogue-renewal.mjs. */\nconst DIALOGUE_RENEWAL_CAST = '+JSON.stringify(cast,null,2)+';\n';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync('js/dialogue-renewal-data.js','utf8'),code,'Renewal source/runtime drift');
else fs.writeFileSync('js/dialogue-renewal-data.js',code);
console.log(Object.keys(cast).length+' characters, '+Object.values(cast).reduce((n,p)=>n+p.topics.length,0)+' authored topics');
