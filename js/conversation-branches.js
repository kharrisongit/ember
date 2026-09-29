/* Choices are authored for an explicit topic and decision ordinal. No keyword
   matching, generic moral endings or automatic first-story reply injection. */
(function(){
  function record(name,topic={}){
    const key=topic.branchKey||CONVERSATION_BRANCH_DATA.aliases[name+'|'+topic.title];
    return key?CONVERSATION_BRANCH_DATA.topics[key]:null;
  }
  function prepare(lines,name,topic={}){
    const result=lines.slice(),data=record(name,topic);
    if(!result.some(line=>line.startsWith('Corin: '))&&data?.monologue){
      const first=data.decisions[0]?.[0];
      if(first)result.push('Corin: '+first[0],name+': '+first[1]);
    }
    return result;
  }
  function choices(current,index){
    const name=current.npcActor?.n||current.who||(current.telepathy?'Aurelius':''),topic=current.conversationReplies?.topic||{};
    const data=record(name,topic);
    // An opening question is already chosen in the topic list. Later Corin
    // lines are responses, each with its own authored decision record.
    const ordinal=current.lines.slice(0,index).filter((l,i)=>i>0&&l.startsWith('Corin: ')).length;
    return data?.decisions[current.lines[index]?.slice(7)]||data?.decisions[ordinal]||[];
  }
  window.EmberConversationBranches={record,choices,prepare};
})();
