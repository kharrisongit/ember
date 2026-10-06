/* First meetings for towns awaiting their full dialogue rewrite. These are
   personal introductions, not guesses based on an actor's appearance or props. */
function corinFirstGreeting(n){
  const replies={
    Wren:'I could use some advice about supplies for the road.',Fen:'I am glad I stopped. I am still finding my way around.',
    Linna:'I hope I am not interrupting your work.',Garrow:'I can wait until you have finished that.',Bess:'It is good to get off the road for a while.',
    'Rowan the Hunter':'I was hoping to catch you here.',Dunstan:'I have heard you are the person to see about a good blade.',
    Sela:'Your glasswork caught my eye.',Maelis:'I would like to hear about your remedies from you.',
    'Brother Edrin':'Thank you for making room for me.','Brother Cael':'It is peaceful here.',
    Astrid:'It is good to be somewhere warm.',Sverre:'I could use some advice before heading into the mountains.',
    Nazim:'I am glad to have reached the town.',Nerissa:'A chance to stop and rest sounds good.',
    Sahir:'I would like to hear what you know about the roads here.',Edwin:'I hope the farm is treating you well.'
  };
  const name=({'Rowan the Hunter':'Rowan','Archivist Elowen':'Elowen','Master Iven':'Iven','Cartwright Oswin':'Oswin'})[n.n]||n.n;
  const greetings=['Have you a moment?','I thought I would stop and say hello.','How is your day going?','Do you mind some company?',
    'I have a little time before I head on.','It is good to meet you.','I hope I have caught you at a good time.','May I join you for a moment?'];
  const index=[...name].reduce((v,c)=>(v*31+c.charCodeAt(0))>>>0,0)%greetings.length;
  return 'Hello, '+name+'. '+(replies[n.n]||greetings[index]);
}
const NpcContextAudit=(()=>{
  const cast={};
  const p=(name,about,sight,reply)=>cast[name]={about,sight,reply};
  p('Brother Cael','I keep this chapel for the return of dragon riders.','A living dragon, here in the chapel. I have hoped for this for years, and still find myself lost for words.','His name is Aurelius. We would like to learn about this place.');
  p('Bevan','I grow vegetables and sell produce in Coralmere.','A dragon! I was about to ask whether you wanted apples. That suddenly seems a very small question.','His name is Aurelius. I can answer the apple question for myself, at least.');
  p('Nazim','I help look after Sandspire’s water supply. My father taught me the work.','Is that dragon travelling with you? I have never had to think about how much water a dragon needs.','Yes. This is Aurelius. We are still learning what to pack for a journey together.');
  p('Halima','I trade in spices. It is work that gives you a good reason to ask where people have been.','Those wings are real. Forgive me; I have heard many unlikely travellers’ tales, but none arrived with proof like this.','This is Aurelius. We have had an unusual journey, but I would like an ordinary conversation.');
  p('Tarek','I work with caravan animals. Most days that calls for patience more than strength.','A dragon. I know how to greet a camel, but I would rather ask before trying anything with your friend.','His name is Aurelius. Give him a little room and let him decide whether to approach.');
  p('Suhaila','My daughter weaves, and I help choose her threads. My hands have retired before my opinions.','What beautiful wings. Is your companion comfortable with someone looking at him?','This is Aurelius. Looking is all right; please ask before coming closer.');
  p('Idris','I sell travelling supplies in Sandspire. I can answer a question without expecting a sale.','A dragon at my shop. I should ask what you need before pretending I know how to supply a rider.','His name is Aurelius. I would like to get to know the people here as well as buy supplies.');
  p('Bilal','I keep goats. If I seem patient, they have had years to practise on me.','A dragon! I am trying to imagine introducing him to my goats, and deciding it can wait.','This is Aurelius. We are happy to start by meeting you.');
  p('Sella','I cook for people in Coralmere. My husband fishes; we have fairly strong opinions about supper.','That is a dragon, isn’t it? I nearly asked how many you wanted me to cook for.','This is Aurelius. We are stopping to talk; you do not have to feed both of us.');
  p('Jamila','I used to carry supplies between towns. I still enjoy hearing about the road.','I thought I knew what travelling light looked like. Does having a dragon for company make packing easier?','This is Aurelius. There is more food to carry, for a start.');
  p('Nerissa','I sell provisions by the coast. Travellers and fishers keep me busy.','A dragon! Are you both stopping in Coralmere, or just passing through?','This is Aurelius. We would like to stop long enough to meet people.');
  p('Astrid','I sell supplies in Hollybeck and help feed our neighbours through the winter.','You have brought a dragon through the cold? Are you both managing all right?','This is Aurelius. We are all right, thank you. A chance to rest is welcome.');
  p('Sverre','I live in Hollybeck. I help travellers prepare for the mountain roads.','A dragon. I had a whole warning about the north road ready, and now I have forgotten the first sentence.','His name is Aurelius. We could still use advice about the road.');
  p('Runa','I grew up in Hollybeck. Astrid taught me to cook, though she still questions some of my ideas.','A dragon! Does he mind if I say hello to him as well?','Not at all. His name is Aurelius.');
  p('Farid','I trade spices in Sandspire. I learned the work from my family.','I have met traders who claimed they had seen dragons. None mentioned how startling the first meeting would be.','This is Aurelius. You can take a moment; I certainly needed one when we met.');
  p('Samira','I weave light cloth for people crossing the desert.','A dragon. I am going to resist asking whether his wings feel like cloth. That would be a dreadful introduction.','His name is Aurelius. Saying hello will do very well.');
  p('Leila','I check supplies for caravans before they leave Sandspire.','Your travelling companion has wings. That is going to make every caravan I see today seem rather ordinary.','This is Aurelius. We still have to stop for food and rest.');
  p('Zaid','I help travellers find water and plan their desert journeys.','A dragon! I hope the crossing has treated both of you kindly.','His name is Aurelius. We are glad to have reached people we can talk to.');
  p('Neri','I mend fishing nets in Coralmere.','I was expecting a visitor, but not one with a dragon following them. Is he comfortable here?','This is Aurelius. We will give you space; we only wanted to say hello.');
  p('Finnick','I work around Coralmere’s fishing boats.','Well, that is larger than anything I have helped unload from a boat. Is your dragon coming to meet people?','His name is Aurelius. Yes, if people would like to meet him.');
  p('Maris','I cook in Coralmere. Fish soup is a frequent subject of conversation in my family.','A dragon! I was thinking about supper, and now I cannot remember what an ordinary appetite looks like.','This is Aurelius. Please do not feel you have to offer him a meal.');
  p('Perrin','I repair boats. It is satisfying work until someone asks why the sea has damaged them again.','Those wings make a boat look a very complicated way of crossing water. Is he with you?','He is. His name is Aurelius. We are travelling together.');
  p('Solveig','I help our Hollybeck neighbours keep warm clothing in repair.','A dragon! I hope you have both found a way to keep comfortable in our weather.','This is Aurelius. I am getting used to the cold more slowly than he is.');
  p('Nils','I help keep the Hollybeck lanes passable in winter.','I had not expected a dragon on the lane today. Should I stand farther back?','His name is Aurelius. A little space is welcome, thank you.');
  p('Freya','I live in Hollybeck with my family. You have arrived somewhere with plenty of opinions about snow.','A dragon! My brother will insist I imagined this. What is your companion called?','Aurelius. You can tell your brother we introduced ourselves properly.');
  p('Oskar','Hollybeck is home. I have spent enough winters here to appreciate a quiet visit.','A dragon is quite a surprise. Give me a moment to stop staring before I try to be welcoming.','This is Aurelius. Take your time; I am glad you want to meet him.');
  p('Kip','I like searching the shore for things the tide has left behind.','A dragon! For once I looked up before I looked down. Does he have a name?','Aurelius. I would like to hear about what you find on the shore, too.');
  p('Sahir','I know the roads around Sandspire, including the dangerous route to the pyramid.','You have a dragon with you. Are you planning to explore, or looking for somewhere to rest?','His name is Aurelius. I would like to hear what you know before deciding where we go.');
  p('Hester','I make and mend fishing nets. My grandmother taught me.','A dragon! Let me get over my surprise before asking you a dozen questions at once.','This is Aurelius. One question at a time would help.');
  p('Petra','I keep caravan accounts. I enjoy a story, but I usually ask when it happened.','A dragon. That is one thing about your journey I will not need a second witness to believe.','His name is Aurelius. You are welcome to ask about the rest.');
  p('Raff','I live in Sandspire. I have strong opinions about trying to work through the noon heat.','A dragon! I was going to complain about the weather, but that can wait.','This is Aurelius. He will not mind a conversation about ordinary things.');
  p('Suri','I sew and repair travelling clothes. I learned about good seams by making some very bad ones.','I have never met a traveller with a dragon before. You must both attract plenty of questions.','His name is Aurelius. We do, but I would like to hear about you as well.');
  p('Tavin','I often put up visiting traders. I enjoy the company as much as the news.','A dragon is a new kind of visitor for me. Is there anything I should know before saying hello?','His name is Aurelius. Let him have a little space while he gets to know you.');
  p('Una','My sister lives away from Sandspire. We keep sending parcels back and forth.','A dragon! I had a perfectly ordinary greeting ready, and you have quite driven it out of my head.','This is Aurelius. Hello is still a good place to start.');
  p('Vela','I weave rugs. Some of my patterns come from journeys my family made.','A dragon. I am wondering how I would weave those wings, but I should ask his name first.','His name is Aurelius. I would like to hear about your weaving.');
  p('Wystan','I have spent most of my working life trading goods. I enjoy the conversations more than the bargaining now.','I have heard some extravagant claims from traders. None of them arrived beside a dragon to prove a point.','This is Aurelius. We are not here to sell you an unlikely story.');
  p('Rania','Latif and I live in Sandspire. We enjoy having neighbours to talk to.','A dragon! Latif will be sorry if he misses meeting your companion.','His name is Aurelius. I am happy to introduce you.');
  p('Latif','I keep accounts in Sandspire. My wife Rania says I also keep talking while she does the repairs.','A dragon. I can already hear Rania asking why I started with arithmetic instead of his name.','His name is Aurelius. I am curious about your family too.');
  p('Yara','I live by the coast. Keeping salt out of a house is practically another occupation.','A dragon! I should stop staring and introduce myself.','This is Aurelius. It took me time to get used to him, too.');
  p('Doryn','I have lived by the sea long enough to complain about it in considerable detail.','A dragon. That is a better surprise than the storm I was expecting today.','His name is Aurelius. I hope we are welcome to stop and talk.');
  p('Bry','I live in Coralmere. I am rather better at laughing about accidents after my clothes have dried.','Oh! A dragon. Is he as interested in meeting people as they are in meeting him?','This is Aurelius. Let him take his time and find out.');
  p('Coral','My husband fishes. I mend his sails, though we disagree about what counts as a neat patch.','A dragon! I have spent years watching for sails, and still forgot to look up until you arrived.','This is Aurelius. We are glad to meet you.');
  p('Edda','I look after this home. Repairs have a habit of spending money I had other plans for.','A dragon. You will have to forgive me for taking a moment to believe my eyes.','His name is Aurelius. There is no hurry; we came to say hello.');
  p('Fennel','I grow herbs in Hollybeck. I am also the neighbour who is always home before dark.','A dragon! I am trying not to startle him by being startled myself.','This is Aurelius. You do not have to come closer until you feel comfortable.');
  p('Bjorn','I cook for my household and whoever happens to arrive hungry.','A dragon! I hope I have not just volunteered to feed everybody travelling with you.','This is Aurelius. We came for a conversation; you can keep supper as planned.');
  p('Meriel','I help sell Sela’s glasswork. Ask if you would like to hear about it.','A dragon. I wonder what Sela would make of those scales, but that can wait until we have said hello.','His name is Aurelius. I would like to hear about the people here too.');
  p('Elin','I live in Sandspire. I came to look at glasswork and have been enjoying taking my time.','A dragon! For a moment I forgot everything I meant to look at today.','This is Aurelius. He does tend to make an entrance.');
  p('Maelis','I make remedies and protective charms. You can ask me directly about either.','A dragon, and someone he has chosen to travel with. What brings the two of you to me?','His name is Aurelius. I would rather hear about your work from you than rely on rumours.');
  p('Sela','I am a glassmaker here in Sandspire. Dunstan, the Forgewick smith, is my brother.','A dragon. I have worked beside furnaces all my life, but that is a very different sort of fire.','His name is Aurelius. I would like to learn about your glasswork.');
  p('Zella','I mend nets and enjoy finding uses for the cord left over.','A dragon! I thought I had a story worth telling today, but you should certainly go first.','This is Aurelius. I would still like to hear your story.');
  p('Iris','I live in Hollybeck. Winter has made me very fond of doing chores before they become emergencies.','A dragon! What a visitor to find on an ordinary day. Have you both travelled far?','His name is Aurelius. We started in Millwood, and there has been a great deal of road since then.');
  // These roaming residents use brief world conversations until their towns'
  // full topic rewrites. Keep each anecdote understandable without a prop.
  const visits={
    Farid:['I learned to test a spice by its smell before arguing about the price. My father enjoyed watching me bargain over a stale sack.','He let you buy it?','No. He stopped me, then made me explain what I had forgotten to check.'],
    Samira:['I weave cloth for desert journeys. Keeping out sand without trapping all the heat took me years to learn.','What was your first attempt like?','Beautiful, heavy, and deeply unpopular by noon. My family still reminds me.'],
    Leila:['I check water, grain and spare rope before a caravan leaves. Counting twice feels foolish until the totals disagree.','Do people mind waiting?','Sometimes. I ask whether they would rather discover a missing water jar here or halfway across the desert.'],
    Zaid:['I once planned a desert journey by distance alone. I reached the next well exhausted and several hours later than I expected.','What do you check now?','The heat, the weight we carry, and who needs a rest. A short line on a map can still be a long day.'],
    Neri:['I dropped my best net-mending knife into the harbour last autumn. I still look for it when the tide goes out.','Have you found anything else?','Three spoons. Apparently I am not the only person in town who needs a firmer grip.'],
    Finnick:['Someone on a fishing boat once shouted “catch” and threw me a fish before I had turned round.','Did you catch it?','With most of my shirt. I ask what is coming before offering to help now.'],
    Maris:['My fish soup changes with the catch. My mother used to call that imagination; my father called it avoiding another trip to the market.','Which was it?','Both. Supper can have more than one reason for turning out well.'],
    Perrin:['I made my first oar too heavy. I was so proud of the carving that I insisted on rowing all the way home.','Did you finish?','Eventually. I made the second oar plainer, and considerably easier to lift.'],
    Solveig:['I knit while the kettle heats at home. Last winter I finished a mitten before the water boiled.','Was the fire that slow?','I had forgotten to add wood. The mitten was useful; the tea required another attempt.'],
    Nils:['I clear the Hollybeck lanes before fresh snow hardens. Once I put it off until after breakfast and spent the afternoon regretting it.','Was breakfast worth it?','Not remotely. I had burnt the porridge as well.'],
    Freya:['My brother and I used to play hide-and-seek in the snow. I insisted on wearing my favourite red scarf and could never understand how he found me.','Did you ever change the scarf?','No. I changed the game. There are limits to what I will sacrifice for a victory.'],
    Oskar:['I once told a visitor to knock the snow off his boots, then walked inside with mine still covered.','Did he say anything?','He handed me a cloth. A very civil way to win an argument.']
  };
  const key=(n,kind)=>'@context-v1:'+n.n+':'+kind;
  function profile(n){return n&&!n.noTalk&&!n.pettable&&!n.thornwellRoyal?cast[n.n]:null;}
  function introduction(n){
    const p=profile(n);if(!p)return null;
    const met=discussedTopics.has(key(n,'met')),seen=discussedTopics.has(key(n,'seen')),known=discussedTopics.has(key(n,'dragon'));
    const companion=hasDragon(),visible=companion&&npcSeesDragon(n);
    let lines;
    if(!met){
      lines=[n.n+': '+(visible?p.sight+' ':'')+'I am '+n.n+'. '+p.about,
        'Corin: '+(visible?p.reply:corinFirstGreeting(n)+(hasDragon()?' My travelling companion is a dragon called Aurelius.':''))];
      if(!visible&&hasDragon())lines.push(n.n+': A dragon? That is quite a travelling companion. I am glad you stopped to introduce yourself.');
    }else if(visible&&!seen)lines=known?[n.n+': You told me about Aurelius. Seeing a dragon for myself is rather different from trying to imagine one.','Corin: Yes, this is him. I wanted you to have a chance to meet.']:[n.n+': '+p.sight,'Corin: '+p.reply];
    else if(companion&&!known)lines=['Corin: I have a travelling companion now: a dragon named Aurelius.',n.n+': A dragon? That is remarkable news. How are you both managing?'];
    else lines=[n.n+': Hello again, Corin. How have you been?','Corin: I am glad to see you. Have you time to talk?'];
    return {lines,first:!met,done(){discussedTopics.add(key(n,'met'));if(companion)discussedTopics.add(key(n,'dragon'));if(visible)discussedTopics.add(key(n,'seen'));saveGame();}};
  }
  function context(n){
    const intro=introduction(n);if(!intro)return null;
    const visit=visits[n.n];
    return !intro.first&&visit?visit.map((line,i)=>(i===1?'Corin':n.n)+': '+line):intro.lines;
  }
  return {cast,profile,introduction,context};
})();
