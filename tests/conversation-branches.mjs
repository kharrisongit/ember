import assert from 'node:assert/strict';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),console,{furniture:false});
run(`quest=Q.DONE;dragon.on=true;dragonOff=false;thornwellRoyal.stage=7;`);
const result=JSON.parse(run(`JSON.stringify((()=>{
  const topics=[];
  for(const name of Object.keys(NPC_TOPIC_GREETINGS).filter(n=>n!=='Aurelius')){
    for(const topic of npcStoryTopics({n:name}))if(topic.lines)topics.push({name,topic});
  }
  for(const [title,value]of Object.entries(DRAGON_LONG_TALKS))topics.push({name:'Aurelius',topic:{title,lines:typeof value==='function'?value():value}});
  for(const group of ['history','personal'])for(const [id,title,lines]of [...DRAGON_GENERAL_TOPICS[group],...dragonExtraTopics(group)])topics.push({name:'Aurelius',topic:{title,lines}});
  let decisions=0;const bad=[];
  for(const {name,topic}of topics){
    const lines=EmberConversationBranches.prepare(topic.lines,name);
    if(!lines.some(l=>l.startsWith('Corin: ')))bad.push(name+': no response');
    lines.forEach((line,index)=>{
      if(!line.startsWith('Corin: '))return;
      decisions++;
      const choices=EmberConversationBranches.choices({lines,npcActor:{n:name},conversationReplies:{topic}},index);
      const words=new Set([line.slice(7),...choices.map(c=>c[0])]);
      if(words.size<3||choices.some(([q,a])=>!q||!a||/another question|Tell me about “/.test(q)))bad.push(name+': '+topic.title);
    });
  }
  return {topics:topics.length,decisions,bad};
})())`));
assert.deepEqual(result.bad,[]);
assert(result.topics>600);assert(result.decisions>700);
console.log(`PASS: ${result.topics} optional topics / ${result.decisions} reply points have at least three distinct in-topic replies, including monologues and Aurelius.`);
