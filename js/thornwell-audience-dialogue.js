/* The royal party has already seen Corin in Millwood. They recognise the egg
   errand, not the hidden dragon. Every audience reply is a complete branch. */
const ThornwellAudienceDialogue=(()=>{
  const t=ThornwellDialogue.t;
  const king=[
    ['eggs',t('You remember the Millwood errand?','I remember a boy holding eggs as if the entire morning depended on delivering them. Did your elder at least appreciate your diligence?',
      ['He was expecting them.','Then you completed a modest task. People who do so reliably are considerably more useful than people who imagine themselves important.'],
      ['They belonged to Hettie. You took some.','I recall accepting a village’s contribution. You would do well to learn how an audience with your king is described.'],
      ['I have come to return a lost dog today.','And you found its owner. An agreeable habit: returning things to the person entitled to possess them.'])],
    ['conquest',t('What gave you the right to rule?','When the riders disagreed, they expected every decision to survive an argument between seven people. I stopped waiting for their permission.',
      ['You chose to attack people who trusted you.','I chose a kingdom I could govern. They chose to obstruct it. Trust is not an agreement to remain weak for someone else’s comfort.'],
      ['Could you have reached an agreement?','An agreement that left six dragons outside my command would have lasted only until its first inconvenience. I preferred a settlement they could not revoke.'],
      ['What do you want people to remember about Wingfall?','That the uncertainty ended. They may dislike the cost; they have nevertheless lived for fifty years in the realm it purchased.'])],
    ['hunt',t('Why must every other dragon be hunted?','A dragon gives an ordinary person the means to refuse a king. I have no intention of distributing that opportunity at random.',
      ['Being born does not make a creature your enemy.','No. Its potential makes it my concern. I do not wait for a rival to announce himself before preventing the rivalry.'],
      ['What if a dragon wanted nothing to do with ruling?','Intentions change. Power remains. I would be a poor guardian of my throne if I depended on a stranger continuing to be modest.'],
      ['Your own dragon gives you that same power.','Exactly. You have identified why I understand the problem better than the people complaining about my solution.'])],
    ['search',t('How far has your search reached?','My men are following reports from the woods north of Millwood. A witness need not understand what he saw to give us something useful.',
      ['What happens to someone who reports a mistake?','If it was honest, my officers decide whether the report still has value. If it was an attempt to mislead them, the conversation becomes less pleasant.'],
      ['What signs are they looking for?','A heavy landing, scorched growth, a flight low enough to break branches. You need not explain such a thing. You need only report it.'],
      ['I have been asking about Bramble, not the woods.','Then keep your ears open while you ask. A useful answer may arrive in a conversation you thought concerned something smaller.'])],
    ['riders',t('What did the other riders refuse?','They refused to put their dragons under one command. They called it preserving an oath. I called it preserving six private armies.',
      ['An oath should mean something when it becomes inconvenient.','It means what those with the strength to enforce it can require. The others discovered the limit of demanding obedience from me.'],
      ['Did all six disagree with you?','In the end. Earlier objections were more cautiously phrased. I saved them the trouble of pretending compromise would satisfy either side.'],
      ['Did their dragons have any say?','A dragon’s loyalty makes its rider dangerous. That is why separating the two is not a kindness I can afford to extend to a rival.'])],
    ['tax',t('Who pays for the royal party?','A town provides for the crown that keeps it governed. Calling every contribution a purchase mistakes the relationship.',
      ['The people providing the food still need to eat.','Then they must organise their stores more competently. I do not divide a kingdom into exemptions whenever a subject describes an inconvenience.'],
      ['Can a town say it cannot afford the visit?','It can petition an officer. The visit proceeds while the petition is considered.'],
      ['Does anyone keep a record of what is taken?','Bram keeps the record I require. Merchants are welcome to keep whatever additional accounts occupy them.'])],
    ['shelter',t('What if someone found an injured dragon?','They should summon my officers and keep other people away. Attempting to treat it privately would give a simple report the appearance of concealment.',
      ['Helping an injured creature should not be a crime.','Helping it evade my authority would be. Do not expect me to admire a subject for making that distinction difficult on purpose.'],
      ['Would your officers help it?','They would secure it and await orders. Its condition would be reported to me, along with the names of everyone involved.'],
      ['Would that person be safe after reporting it?','An honest witness who cooperates has less to fear than someone who bargains with information. Remember the useful half of that answer.'])],
    ['future',t('What do you want for Emberfell now?','Continuity. No village should wake wondering whether some newly ambitious rider has decided to found a different kingdom.',
      ['People might want a choice in how they live.','They make choices every day within the law. You are confusing that freedom with permission to dispute who sets its limits.'],
      ['Do you believe everyone is content?','Contentment is not the same as stability. I know which one prevents a rival banner appearing over a town.'],
      ['That sounds like a future with no room to change.','There is room for changes I judge useful. I have not invited the realm to judge me in return.'])]
  ];
  const knight=[
    ['duty',t('What is your role during the visit?','I keep the king’s route clear, account for the people brought before him, and make certain an instruction remains an instruction after he leaves.',
      ['Do you ask whether an instruction is fair?','I ask what it requires. You may find that distinction unpleasant; it still describes my job.'],
      ['Who answers if somebody gets hurt?','My report records what happened. The crown decides whether the action was justified. Choose carefully how much you wish to feature in such a report.'],
      ['So you will be busy after the king departs.','Yes. A royal departure does not cancel the obligations left behind.'])],
    ['passage',t('How do you decide who can pass a roadblock?','By the orders for that crossing. A traveller’s opinion of the delay is not part of the instruction.',
      ['What about somebody needing urgent help?','They can state the urgency to the officer present. Trying to force the crossing makes the decision considerably less favourable.'],
      ['Would you tell people how long they must wait?','If I knew and was permitted to say. I do not invent a promise to make a queue quieter.'],
      ['You could treat them courteously while they wait.','I could. You should not mistake that possibility for permission to debate the closure with me.'])],
    ['report',t('Why record a witness’s name?','So a report can be checked, and so the witness can be found when the account needs explaining.',
      ['What if they are simply frightened?','Then they should say what they saw rather than what they think will please the questioner.'],
      ['People may be afraid of what your report will do.','That does not make an unnamed rumour useful to me. I require a person who can answer for it.'],
      ['Do you ever correct a report?','When the facts require it. An inaccurate record causes work for me as well as trouble for the person named.'])],
    ['judgement',t('Do you enjoy frightening people?','I prefer people who understand a boundary before I have to enforce it. You may decide what that says about my disposition.',
      ['Fear is not the same as respect.','They need not be identical to produce the same immediate result.'],
      ['Would you speak like this without the uniform?','You are speaking to me while I am wearing it. Answering an imaginary version of this conversation would waste both our time.'],
      ['I would like to finish this visit without trouble.','Then say what you mean plainly, follow the directions you are given, and leave when you are dismissed.'])]
  ];
  function rows(n){
    if(typeof DialogueRenewal!=="undefined"&&DialogueRenewal.profile(n))return DialogueRenewal.topics(n,{all:true}).map((t,i)=>({...t,onReply:words=>{
      if(n.n!=='King Halvard')return;
      const key=['conquest','riders','tax','eggs','hunt','search','shelter','future'][i],row=DialogueRenewal.cast[n.n].topics[i];
      if(!['conquest','riders','tax','eggs','hunt','search'].includes(key))return;
      const index=row.replies.findIndex(r=>r[0]===words);
      thornwellRoyal.answers[key]=index<2?'defiant':'careful';saveGame();
    }}));
    return (n.n==='King Halvard'?king:knight).map(([key,row])=>{
      const topic=ThornwellDialogue.topic(n,row,'royal-'+key,'world');
      topic.onReply=words=>{
        const index=row.replies.findIndex(r=>r[0]===words);
        // Persist only the keys the existing story save understands.
        if(['eggs','tax','conquest','hunt','riders','search'].includes(key)){
          thornwellRoyal.answers[key]=index===0&&['tax','conquest','hunt','riders'].includes(key)?'defiant':index===2?'careful':'question';saveGame();
        }
      };
      return topic;
    });
  }
  function options(n){return rows(n).map(topic=>({n:topic.title,category:topic.category,friendship:true,friendshipId:topic.friendshipId,go:()=>EmberConversationFlow.playTopic(n,topic)}));}
  function dossier(name,actor){
    if(!actor?.thornwellRoyal)return null;
    return {name,role:name==='King Halvard'?'King of Emberfell':'Royal serjeant',home:'The royal party · visiting Thornwell',
      bio:name==='King Halvard'?'Halvard remembers Corin’s egg errand in Millwood. He is hunting signs of another dragon and expects his questions to be answered.':'Bram manages the royal visit and records the names of people the crown questions. His formal manner leaves little room for disagreement.',
      interests:rows(actor).slice(0,3).map(r=>r.title).join(' · '),memory:''};
  }
  return {rows,options,dossier};
})();
