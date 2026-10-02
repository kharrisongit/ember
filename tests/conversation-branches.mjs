import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),console,{furniture:false});
const tested=new Map(),bad=[];
c.checkTopic=(name,topic)=>{
 c.checkedName=name;c.checkedTopic=topic;
 const result=JSON.parse(run(`JSON.stringify((()=>{
  const lines=EmberConversationBranches.prepare(checkedTopic.lines,checkedName,checkedTopic),data=EmberConversationBranches.record(checkedName,checkedTopic),points=[];
  lines.forEach((line,index)=>{if(index===0||!line.startsWith('Corin: '))return;
   const alternatives=EmberConversationBranches.choices({lines,npcActor:{n:checkedName},conversationReplies:{topic:checkedTopic}},index);
   points.push({index,line,alternatives,answer:lines[index+1]});
  });
  return {points,record:!!data};
 })())`));
 const key=topic.branchKey||name+'|'+topic.title;
 if(result.points.length&&!result.record)bad.push(key+': missing topic');
 for(const p of result.points){
  if(new Set([p.line.slice(7),...p.alternatives.map(a=>a[0])]).size<(topic.authoredBranches?2:3))bad.push(key+' @'+p.index+': missing alternatives');
  if(!p.answer||p.answer.startsWith('Corin: '))bad.push(key+' @'+p.index+': no NPC answer');
  if(p.alternatives.some(([q,a])=>!q.trim()||!a.trim()))bad.push(key+': empty response');
 }
 tested.set(key+'|'+JSON.stringify(topic.lines),{key,decisions:result.points.length});
};
run(`quest=Q.DONE;dragon.on=true;dragonOff=false;templeCompass.owned=true;odoRodReferral=true;
for(const victory of [false,true])for(const phase of [1,5,7]){
 wonAll=victory;thornwellRoyal.stage=phase;heartKnown=victory;fishingPole=victory;smithUpgrade=victory;glassShield=victory;brambleQuest=victory?2:1;charm.lamp=victory;charm.wake=victory;cinderSeal=victory;trialSealPlaced=victory;breathHas.lightning=victory;breathHas.ice=victory;breathHas.shadow=victory;
 for(const name of Object.keys(NPC_TOPIC_GREETINGS).filter(n=>n!=='Aurelius'))for(const topic of npcStoryTopics({n:name}))if(topic.lines)checkTopic(name,topic);
 for(const [id,value]of Object.entries(DRAGON_LONG_TALKS))checkTopic('Aurelius',{branchKey:'Aurelius/long/'+id+(id==='halvard'&&wonAll?'-victory':''),lines:typeof value==='function'?value():value});
 for(const [group,ts]of Object.entries(DRAGON_GENERAL_TOPICS))for(const [id,title,lines]of [...ts,...dragonExtraTopics(group)])checkTopic('Aurelius',{branchKey:'Aurelius/'+group+'/'+id,title,lines});
 for(const t of DRAGON_JOURNEY_TOPICS)checkTopic('Aurelius',{branchKey:'Aurelius/journey/'+t.id,lines:typeof t.lines==='function'?t.lines():t.lines});
 checkTopic('Aurelius',{branchKey:'Aurelius/quest'+(wonAll?'-victory':''),lines:dragonCurrentQuest()});
 for(const known of [false,true]){
  dragonBanterSeen.clear();if(known)['fishing','bramble','bramble-owner','smith','shield','lantern','graveyard','trials'].forEach(k=>dragonBanterSeen.add('learned:'+k));
  for(const t of dragonSideQuestTopics())checkTopic('Aurelius',{branchKey:'Aurelius/side/'+t.id,lines:dragonSideQuest(t.id)});
 }
}
// Equipment adds a decision when the shield is owned, regardless of sword state.
for(const smith of [false,true])for(const shield of [false,true]){smithUpgrade=smith;glassShield=shield;dragonBanterSeen.add('learned:smith');checkTopic('Aurelius',{branchKey:'Aurelius/side/equipment',lines:dragonSideQuest('equipment')});}
EmberConversationFlow.playTopic=(n,t)=>checkTopic(n.n,{...t,branchKey:'royal/'+n.n+'/'+t.title});thornwellAnswer=()=>{};
for(const name of THORNWELL_ROYALS){const n={n:name,thornwellRoyal:true};for(const t of name==='King Halvard'?thornwellKingTopics(n):thornwellKnightTopics(n))t.go();}
`);
assert.deepEqual([...new Set(bad)],[]);
// The source sheets, rather than an unrelated fallback, define every shipped decision.
const data=JSON.parse(run('JSON.stringify(CONVERSATION_BRANCH_DATA)'));
let authored=0;
for(const file of fs.readdirSync('assets/dialogue/branches').filter(f=>f.endsWith('.tsv'))){
 for(const row of fs.readFileSync('assets/dialogue/branches/'+file,'utf8').split('\n').filter(l=>l.trim()&&!l.startsWith('#'))){
  const [tag,...parts]=row.split('|'),[key,ordinal='0']=tag.split('#');
  assert.deepEqual(data.topics[key].decisions[ordinal],Array.from({length:parts.length/2},(_,i)=>parts.slice(i*2,i*2+2)));authored++;
 }
}
for(const [key,t]of Object.entries(data.topics))assert(Object.keys(t.decisions).length,key+' is authored');
const variants=[...tested.values()],decisions=variants.reduce((n,t)=>n+t.decisions,0);
assert(authored>1000);assert(variants.length>950);
console.log(`PASS: ${variants.length} topic/state variants, ${decisions} reply points, ${authored} authored decision records; two or three distinct authored choices, NPC answers, source parity, royal visits and equipment combinations.`);
