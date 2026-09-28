/* In-topic alternatives for every optional exchange. These branch endings do
   not grant items, change quests, or invent facts about the speaker's past. */
(function(){
  const specific={
    'Hettie|How did you persuade it?':[
      ['I would have waited for it to come to me.','You would still be standing in that field. Patience is useful, but so is knowing when a cow has more of it than you.'],
      ['Perhaps it missed your aunt.','I expect it did. Animals notice when their world changes, even when we think we have only moved them to another field.']
    ],
    'Hettie|Even the hens?':[
      ['I could do the morning feeding.','You could, love. Start with the hens before they organise a complaint. Then we might both get a warm breakfast.'],
      ['You deserve a morning to yourself.','I do. And I ought to stop waiting for the farm to give me permission to take one.']
    ],
    'Nan Ferrow|I do that.':[
      ['I wish I could remember him doing it.','I wish you could too, love. I can lend you my memories, but I know that is not quite the same.'],
      ['Did Mum ever get cross with him?','Of course. Loving somebody does not make a tangled knot less irritating. It does give you reasons to laugh about it afterwards.']
    ],
    'Nan Ferrow|Did it get better?':[
      ['I must have ruined your baking.','For that morning. There were other mornings to bake, love. You were terribly worried about that little creature.'],
      ['You let me keep it anyway?','I let you care for it. Next time I would have preferred a tin without the flour still inside.']
    ],
    'Odo|Do you miss that?':[
      ['We could sit here quietly for a while.','We could. No need to manufacture a conversation on my account. Keep an eye on that float for me.'],
      ['I never know what to say when someone misses somebody.','You need not mend it, lad. Asking and staying a moment are quite enough.']
    ],
    'Aurelius|What if I disappoint you?':[
      ['I want us to be honest when things go wrong.','Then let us begin there. Neither of us has to become flawless before we can trust the other.'],
      ['I still worry that you chose the wrong person.','I chose you, Corin. Your worry is something we can talk about, not proof that I made a mistake.']
    ]
  };
  // Match the subject of the current exchange, not a different topic in its menu.
  const subjects=[
    [/\b(halvard|crown|king|royal|tax|collector|tyran|obedien)/i,[
      ['Being powerful does not make someone right.','No. People with very little power still have to live with the consequences. Their judgment ought to count for something.'],
      ['What if speaking up makes things worse?','It can. Choose who can hear you, and consider who will bear the cost. Caution need not mean agreement.']]],
    [/\b(guard|knight|uniform|orders|rank|patrol|serjeant)/i,[
      ['An order should not spare someone from thinking.','It should not. That is harder to remember when everyone beside you has already begun to obey.'],
      ['I would want to know who the order might hurt.','Then keep asking that before you act. It is an uncomfortable question for a reason.']]],
    [/\b(heartstone|lightning|shadow|ice breath|elemental)/i,[
      ['I want to understand that power before trusting it.','A sensible beginning. Learning what a power can do is only part of learning when to use it.'],
      ['More strength will not decide everything for us.','No. You will still have to make choices, and live with them after the danger has passed.']]],
    [/\b(temple|ruin|golem|trap|chamber|gate)/i,[
      ['I would rather turn back than rush in unprepared.','There is no shame in returning better prepared. An old doorway will not be offended if you make it wait.'],
      ['I want to know what those places were like before.','So do I. Try to notice what remains around the dangers, not only what stands in your way.']]],
    [/\b(wingfall|riders|histor|chronicle|ancient)/i,[
      ['Who gets left out when that story is told?','Often the people who had to carry on afterwards. A grand account can make ordinary lives very difficult to see.'],
      ['I would like to hear more than one account.','Good. Pay attention to where the accounts differ, and who has reason to prefer each one.']]],
    [/\b(bond|thoughts|consciousness|inherited|memories.*dragon)/i,[
      ['I want us to have room for our own thoughts.','I do too. Being close should not mean giving up every quiet corner of ourselves.'],
      ['Tell me if I expect too much from you.','I will try. You must tell me as well; neither of us can guess everything the other needs.']]],
    [/\b(afraid|fear|frighten|courage|brave|worr)/i,[
      ['I get frightened too. I usually try to hide it.','You need not hide it from everyone. Being understood can make a frightening thing a little easier to face.'],
      ['I do not think being afraid makes someone weak.','Nor do I. Fear deserves to be heard, even when we decide it cannot make the whole decision for us.']]],
    [/\b(mother|father|mum|dad|grandmother|parents|family|sister|brother)/i,[
      ['It makes me think about my own family.','Then hold on to that thought. Sometimes another person’s story reminds us of something we have been meaning to say at home.'],
      ['Families can make things complicated, can’t they?','They can. Knowing somebody well does not mean always knowing how to help them.']]],
    [/\b(miss|grief|grave|remember.*name|lost someone|funeral)/i,[
      ['You do not have to make it sound less sad for me.','Thank you. It is tiring, sometimes, trying to make a difficult memory comfortable for everyone else.'],
      ['I could stay a little longer, if you like.','I would like that. There is no need to find the perfect thing to say.']]],
    [/\b(friend|companion|trust|choos.*me|together|company)/i,[
      ['I think being able to disagree matters too.','Yes. Company becomes a lonely thing if one person is never allowed a different thought.'],
      ['I would rather be dependable than impressive.','Dependable is easily overlooked until it is needed. Then it can matter more than anything grand.']]],
    [/\b(cow|calf|herd|hen|chicken|sheep|goat|cattle|animal)/i,[
      ['I think animals notice more than we give them credit for.','They certainly notice whether we are patient with them. That is a useful place to begin.'],
      ['I would probably make a mess of that.','At first, perhaps. Pay attention to the creature instead of worrying how clever you look, and you stand a better chance.']]],
    [/\b(bramble|dog|hound)/i,[
      ['A dog ought to be able to trust the person beside it.','Yes. Food helps, but being patient and coming back when you are needed matter too.'],
      ['I would worry about letting him out of my sight.','Understandable. Worrying and watching are different things, though. One tires you out; the other might help.']]],
    [/\b(fish|river|water|bridge|bucket|ferry|boat|sea|tide)/i,[
      ['I think I would enjoy just watching the water.','There is plenty to notice when you stop requiring it to entertain you. Give yourself a little time.'],
      ['I would be too impatient, wouldn’t I?','Perhaps at first. Being impatient does not mean you cannot learn to wait.']]],
    [/\b(wood|tree|root|forest|spore|mushroom|stump|seed|garden|plant)/i,[
      ['I like the thought of leaving something growing behind me.','Then give it more than a hopeful beginning. A living thing needs care after the interesting part is over.'],
      ['It is hard to wait for something to grow.','It is. Looking closely helps; slow change is easier to see when you know what was there yesterday.']]],
    [/\b(food|bread|supper|breakfast|cook|porridge|hungry|meal|bake|flour|feeding|grain)/i,[
      ['A decent meal can change a whole day.','It can. People are often kinder to one another when nobody is trying to ignore an empty stomach.'],
      ['I tend to forget how much work goes into it.','Most people do until it is their turn. Remembering to thank the person doing it is a good start.']]],
    [/\b(work|tool|craft|hammer|forge|smith|glass|repair|stitch|sew|build)/i,[
      ['I would want to try doing it myself.','Then begin with something you can afford to get wrong. Enthusiasm is useful; practice is what makes it reliable.'],
      ['People probably notice the work only when it fails.','Often enough. A thing working properly can make all the effort behind it almost invisible.']]],
    [/\b(book|library|school|teach|lesson|learn|read|pupil)/i,[
      ['I learn more when I am allowed to ask foolish questions.','A question is usually less foolish than pretending you already understand. Keep asking.'],
      ['Knowing the words is different from understanding them.','Very different. Try explaining the thought in your own words; you soon discover where the gaps are.']]],
    [/\b(map|road|path|journey|travel|direction|compass|home)/i,[
      ['I would like to notice more along the way.','Leave yourself a little time for it. A journey can become nothing but the next place if you hurry every step.'],
      ['I worry about losing my way.','Then pay attention before you are lost. Asking a careful question is easier than pretending you recognise a turning.']]],
    [/\b(sword|fight|battle|weapon|armou?r|shield|enemy|enemies)/i,[
      ['I would rather avoid a fight when I can.','That is a sensible wish. Remember it before anger makes the decision for you.'],
      ['I worry about freezing when it matters.','Practise what you can while you have time to think. Courage is easier to find when every movement is not a surprise.']]],
    [/\b(heal|herb|remed|salve|wound|hurt|medicine|care)/i,[
      ['I wish helping were always as simple as wanting to.','So do I. Wanting to help is a beginning; listening to what is needed comes next.'],
      ['I would be afraid of making things worse.','Then be honest about what you know. Asking for help can be the most useful thing you do.']]],
    [/\b(coin|money|price|sell|trade|market|merchant|purse)/i,[
      ['A fair price ought to be fair for both people.','It ought to. That is easier to forget when only one of them can afford to walk away.'],
      ['I never know when I should bargain.','Ask questions first. Understanding what you are buying matters more than sounding like an experienced trader.']]],
    [/\b(rest|sleep|dream|quiet|morning|day off)/i,[
      ['I find it difficult to stop when there is more to do.','There is nearly always more to do. If that is your rule, you will never give yourself a quiet hour.'],
      ['I think I could use a little of that myself.','Then try to make room for it. You need not earn every moment of rest by wearing yourself out.']]],
    [/\b(song|music|dance|sing|flute|tune|bell)/i,[
      ['I like that people can share it without owning it.','So do I. A tune does not become less yours because somebody else carries it away.'],
      ['I would be embarrassed to try in front of people.','Then begin where you feel comfortable. Enjoying it need not wait until you are ready for an audience.']]],
    [/\b(joke|funny|laugh|silly)/i,[
      ['I think I like the telling more than the joke.','That may be the kindest way anyone has put it. I shall try not to let the distinction trouble me.'],
      ['I am not sure I should encourage you.','A little late for that. You stayed to hear the end, and I have chosen to take it as encouragement.']]]
  ];
  const fallback=[
    ['I had not thought about it from your side.','Then I am glad we talked. You do not have to agree with everything to understand a little more of where I am coming from.'],
    ['I am not sure I know what to make of that yet.','You can take your time. I would rather hear an honest uncertainty than an answer chosen just to please me.'],
    ['I think I would have seen it differently.','You might. We bring different experiences to a conversation; that is one reason to have it.']
  ];
  const royal={
    'King Halvard':[
      ['You speak as though nobody else matters.','They matter in their proper places. Your difficulty, boy, is imagining that you are entitled to choose yours.'],
      ['That does not sound fair.','Fairness is a word people reach for when they dislike their portion. I have a realm to govern, not a nursery to soothe.']
    ],
    'Serjeant Bram':[
      ['A uniform does not make that right.','It does make it my duty. You may dislike the answer as quietly as you please.'],
      ['Would you say the same without the king listening?','The king need not be listening for an officer to remember whose authority he carries. Mind your tone.']
    ],
    Doran:[
      ['It is easy to say that from your side of the table.','Then you have noticed which side is comfortable. A useful lesson, if you can resist complaining about it.'],
      ['You could choose to be kinder.','And you could choose to finish this conversation before Bram decides I am being indulgent.']
    ],
    Tolan:[
      ['You sound as though you are trying to convince yourself.','Keep your voice down. Thinking something and announcing it beside the king are different sorts of bravery.'],
      ['I would not want to get used to that.','Then be careful what you agree to at the beginning. It becomes harder to draw the line afterwards.']
    ]
  };
  function choices(current,index){
    const name=current.npcActor?.n||current.who||(current.telepathy?'Aurelius':''),spoken=current.lines[index]?.replace(/^Corin: /,'')||'';
    if(current.npcActor?.thornwellRoyal||name==='King Halvard')return [...(royal[name]||[]),...fallback];
    const exact=specific[name+'|'+spoken];if(exact)return [...exact,...fallback];
    const topic=current.conversationReplies?.topic?.title||'';
    const nearby=current.lines.slice(Math.max(0,index-1),index+2).join(' ');
    const match=subjects.find(([pattern])=>pattern.test(topic))||subjects.find(([pattern])=>pattern.test(nearby));
    return [...(match?.[1]||[]),...fallback];
  }
  function prepare(lines,name){
    const result=lines.slice();
    // Even short monologues offer a response before returning to the greeting.
    if(!result.some(line=>line.startsWith('Corin: '))){
      const current={lines:result,npcActor:{n:name},conversationReplies:{topic:{}}};
      const [words,answer]=choices(current,result.length)[0];
      result.push('Corin: '+words,name+': '+answer);
    }
    if(result.at(-1)?.startsWith('Corin: '))result.push(name+': I am glad we had a chance to talk about this.');
    return result;
  }
  window.EmberConversationBranches={choices,prepare};
})();
