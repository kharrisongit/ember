/* Millwood and the mushroom folk: one authored source for introductions,
   topics and every reply. Each choice finishes its own exchange; no shared
   continuation can contradict the choice the player just made. */
const MillwoodShroomDialogue=(()=>{
  // topic(title, NPC opening, [Corin reply, NPC answer], ...)
  const t=(title,first,...replies)=>({title,first,replies});
  const cast={
    'Hettie':{
      pre:['How did your visit to Maddock go, love?','He had quite a lot to tell me.','He usually does. You can tell me about it when you have a moment.'],
      first:['Corin, stop a moment. Is that a real dragon with you?','He hatched from an egg I found. I think he wants to stay with me.','Well, I can see why you took him in. Give the cattle a little space while they get used to him, would you?'],
      heard:'A dragon? You went out with six eggs and found a seventh? Tell me what happened, love.',
      back:['Hello, you two. I hope you have both had something to eat.','Good to see you, Corin. How are you getting on?'],
      topics:[
        t('Will you manage the farm without me?', 'I will miss your help, but Gwil, Edwin and I can keep things going. You do not owe us an apology every time you leave the village.',
          ['I feel as though I am leaving you with my work.','You have helped here for years. Let us help you by taking that worry off your mind.'],
          ['I would like to help when I come home.','Then come and find me. There is always something to do, and I would rather have your company than a guilty promise.'],
          ['Are you sure you do not need me to stay?','I am sure, love. Just come home because you want to see us, not because you think we cannot manage.']),
        t('How did you start keeping cattle?', 'My aunt gave me my first cow. The cow followed her home twice before accepting that I was the one bringing breakfast.',
          ['How did you finally win her over?','By arriving with feed at the same time every morning. She liked knowing what to expect. Eventually she waited for me instead of looking for my aunt.'],
          ['Were you worried you could not look after her?','Terrified. I asked my aunt so many questions she started coming round before I could go and fetch her.'],
          ['Was she as stubborn as our cattle?','Worse. Our lot learned from an expert. I still check a gate twice because of her.']),
        t('Do you ever take a day off?', 'Gwil offers to do the morning feeding sometimes. The difficult part is staying indoors instead of going out to supervise him.',
          ['Do you not trust him?','I do. I am used to being responsible for everything. It takes practice to let someone else get on with it.'],
          ['What would you do with a whole free morning?','Have breakfast with Nan while it is still warm. We usually spend half our visits calling through doorways.'],
          ['Perhaps the animals could feed you for once.','The hens would serve grain and the cows would eat the tablecloth. I shall ask Nan.']),
        t('What was Millwood like when you were young?', 'Harvest days brought everyone to the mill. We waited with our carts and argued about whose grain should go first. Then somebody would bring food, and nobody was in such a hurry.',
          ['Did everyone get along?','Not always. But we still helped unload each other’s carts. You can be cross with a neighbour and see that they need a hand.'],
          ['What do you miss most?','People having time to stay after the work was done. I would like us to have more of that again.'],
          ['Were you already giving everyone jobs?','Somebody had to. I was shorter then, so I had to be considerably louder.'])
      ],
      dragon:t('Are you worried about my dragon?', 'A little. I have never cared for a dragon, and neither have you. I am glad you are asking questions instead of pretending you know everything.',
        ['I do not want him to frighten the animals.','Let them get used to him at a distance. Stay with him and give them room; they do not understand that he is your friend.'],
        ['What if I get something wrong?','Then stop and work out what he needs. You have always been patient with animals. Keep that patience when looking after him gets difficult.'],
        ['He is more than an animal to me.','I can hear that. I am not asking you to care less about him, love. I am asking you to take care of yourself as well.']),
      politics:t('King Halvard', 'The crown takes grain even when our own stores are low. I can count what we grow. I cannot make another harvest arrive because his collector wants more.',
        ['What happens if there is not enough?','We share what we have. That keeps people fed for a while, but it leaves us with less to plant and less to save for winter.'],
        ['Can the village refuse?','A single farm refusing would face his men alone. I will not tell you it is simple when my neighbours would bear the cost.'],
        ['Does the king know how little he leaves?','His collectors keep records. Whether he reads them or cares is another question.']),
      peace:t('After Halvard’s defeat', 'I am relieved he cannot keep taking from us. I still want to see what happens with the next harvest before I make promises about plenty.',
        ['What would you change first?','Keep a village store for lean weeks. Nobody should have to wait until their cupboard is empty before asking for help.'],
        ['Will you finally take that morning off?','Yes. And if you are home, you can join Nan and me for breakfast. You have earned a morning without an errand.'])
    },
    'Gwil':{
      pre:['Hello, Corin. Taking a break from Hettie’s errands?','Long enough to say hello.','A sensible length of break. Stay much longer and she will find work for both of us.'],
      first:['Corin... those are wings. You have brought an actual dragon home.','I did not plan it. He hatched, and he stayed with me.','That is rather more than a stray cat. Is he all right with me standing this close?'],
      heard:'A dragon has chosen to follow you? I believe you, but I shall need a moment to get used to the idea.',
      back:['Good to see you both. I am still getting used to seeing wings beside you.','Corin. How have you been keeping?'],
      topics:[
        t('Are you still working with wood?', 'When the farm does not need me. Gates and tools keep breaking whether I spend the morning with a saw or a hoe.',
          ['Do you prefer one job to the other?','Woodwork. I like fitting two awkward pieces together and finding they hold. Plants do not let you know quite so quickly.'],
          ['Does Hettie choose your jobs?','She tells me what needs doing. I tell her how long it will take. Then we have our usual discussion about the meaning of “urgent”.'],
          ['Who taught you the woodwork?','My father. He let me spoil offcuts until I could make a joint fit, then trusted me with something somebody actually needed.']),
        t('Why did your father plant trees?', 'He wanted there to be timber after he was gone. Each time we felled a tree, he made room for young ones to grow.',
          ['Did you understand that as a boy?','I understood that I wanted to go home and he wanted another hole dug. Seeing those trees grown changed my mind.'],
          ['Do you still plant them?','Yes. Some will outlive anything I build. That seems a fair return for the wood I use.'],
          ['Did all the saplings survive?','No. We checked them in dry weather and replaced the ones that failed. Planting was the beginning of the job.']),
        t('How can you tell a repair will last?', 'I look at why the old part broke. There is no sense putting a stronger latch on a gate whose post is falling over.',
          ['I tend to fix the first thing I notice.','So did I. Try moving the whole thing gently before you choose a tool. The broken piece may only be where the strain ended up.'],
          ['Have you ever had to redo your own work?','Often. Hettie remembers a gate I hung backwards. It shut beautifully, provided nobody wanted to enter the field.'],
          ['Would you teach me sometime?','Gladly, when you are home. Start with a loose handle; it is useful work and less embarrassing than a backwards gate.'])
      ],
      dragon:t('Could a dragon help with farm work?', 'Perhaps, but I would want to know what he is comfortable doing before we give him a task. Strong claws are not the same as knowing how to lift something.',
        ['I do not want people treating him like a cart horse.','Then say so when they ask. Being willing to help does not mean he owes everyone his strength.'],
        ['He is still learning how to move around us.','Give him room. You would not teach a person to carry timber in the middle of a crowded lane either.'],
        ['I think he would enjoy being useful.','Find something you can do together and stop if it troubles him. We can manage our own work while you two find your feet.']),
      politics:t('King Halvard', 'Royal orders take good timber at whatever price the crown decides to pay. A seal on a page does not replace the roof beam a family needed.',
        ['Can you keep wood back for the village?','I finish urgent repairs first when I can. I cannot hide a whole timber stack from men who came to count it.'],
        ['Does he pay you anything?','Enough to call it a purchase. Not enough to cover the work or leave us a choice.'],
        ['Why do the orders keep coming?','Fortifications, wagons, repairs for his men. Those needs always seem to come before ours.']),
      peace:t('After Halvard’s defeat', 'I would like our next load of timber to go where the village needs it. That will be a satisfying change.',
        ['Who decides which repair comes first?','The people who live with the damage. I can inspect the work, but I should ask before deciding what they can wait for.'],
        ['And after the repairs?','A day in the woods without counting what the crown will take. I have missed enjoying my own trade.'])
    },
    'Odo':{
      pre:['Corin! Have you time for an old fisherman?','For a chat, yes. I make no promises about believing the size of your last catch.','Then I shall begin with its entirely respectable length.'],
      first:['I have told some unlikely stories, Corin, but you have arrived with a dragon. Where did you find him?','His egg was left in the woods. It hatched near Maddock’s house.','And he followed you home? Well. This is going to make my fishing stories very difficult to tell with a straight face.'],
      heard:'A dragon hatched from an egg you found? I was expecting news about your errand. Start at the beginning; I want to hear this properly.',
      back:['Hello, Corin. And hello to your unusual travelling companion.','There you are, lad. What news have you brought?'],
      topics:[
        t('What is the biggest thing you ever caught?', 'The heaviest thing I hooked was my own bucket. I had already called two neighbours over to help land it before I saw the handle.',
          ['Did you admit it was yours?','My name was scratched on the side. I had very little room to negotiate.'],
          ['Did you at least get the bucket back?','I did. A splendid catch once I stopped promising everyone a fish supper.'],
          ['Have you ever caught a fish that big?','No. But I have described several that way, which may be why you asked.']),
        t('Who taught you to fish?', 'My older brother. He showed me how to cast, then made me untangle the line myself. We spent years fishing on opposite banks.',
          ['Did you talk much across the water?','Sometimes. Most days it was enough to know he was there. I miss that easy company.'],
          ['Do you still think of him when you fish?','Often. Something will amuse me and I will turn to tell him. Then I remember. I am glad you asked about him.'],
          ['Was he better at it than you?','He was more patient. I used to mistake that for luck, especially when he caught supper and I caught a branch.']),
        t('Tell me about Calder.', 'My grandson runs the first camp on the road from Millwood to Thornwell. He has a knack for making tired people feel they chose the right place to stop.',
          ['Did you teach him to fish too?','I did. He counted every fish before carrying them home, then counted again at the door in case one had escaped.'],
          ['Do you get to see him often?','Less often than I would like. A busy camp is good for him, but I miss having him to myself for an afternoon.'],
          ['Is the camp easy to find?','Take the eastern road towards Thornwell. His is the first camp along that road. Ask for Calder when you arrive.']),
        t('What makes a good fishing spot?', 'Look for water where a fish can rest without fighting the current. The pools below Forgefalls are worth trying if your journey takes you southeast of Thornwell.',
          ['Should I cast into the fastest water?','Try the quieter water beside it. And keep your own feet on firm ground; a fish supper is not worth being swept away.'],
          ['What if I do not catch anything?','Give it some time, then try another spot. Even an old fisherman comes home hungry now and then.'],
          ['Will you want to hear what I catch?','Every bit of it. You may even tell me the actual size. I will try to cope.'])
      ],
      dragon:t('Feeding a dragon', 'A companion that size gives you a good reason to learn fishing. I would not plan a journey on the hope of finding scraps.',
        ['I want to carry food before he needs it.','Sensible. Keep some in your Bag and check your supplies before leaving a town. Hunting and fishing can help you stock up.'],
        ['Are you offering him your next catch?','I am offering advice. If my next catch is another bucket, he will be disappointed anyway.'],
        ['I would rather fish than keep asking people for food.','Then ask for help learning. You need not do everything alone just because you want to look after him.']),
      politics:t('King Halvard', 'His men have asked me who comes through Millwood. I will tell them about river levels. I will not turn a neighbour’s visit into a report.',
        ['Does that get you into trouble?','It can. I answer slowly and stick to what they actually asked. I would rather they found me tiresome than useful.'],
        ['What are they looking for?','They do not always say. That is another reason not to fill in the gaps with somebody else’s name.'],
        ['Do you ever feel afraid?','Yes. Courage does not make a uniform stop being frightening. It helps to remember who might be hurt by an easy answer.']),
      peace:t('After Halvard’s defeat', 'If people can travel without being questioned at every turn, perhaps I will get a proper visit from Calder.',
        ['You could visit his camp.','I could. I have spent so long waiting for people to come home that I forget the road runs both ways.'],
        ['Would you leave your fishing for that?','For my grandson? Gladly. Do not look so surprised, Corin. The fish will still be there to ignore me afterwards.'])
    },
    'Elder Maddock':{
      pre:['Hello, Corin. Was there something you wanted to ask me?','A few things, if you have time.','Of course. Start with the one that is troubling you most.'],
      first:['How are you both faring, Corin? A hatching is a great deal to take in.', 'I keep wondering whether I am doing the right thing for him.','You stayed with him and you are paying attention. That is a good beginning. We can talk through the rest.'],
      heard:'I have been thinking about the hatching too. There is much I cannot tell you about your dragon, but you can still bring your questions to me.',
      back:['It is good to see you both. What have you come to ask?','Come and talk, Corin. You need not have everything worked out before you ask.'],
      topics:[
        t('Why have the roads become so dangerous?', 'The riders once helped drive monsters away from the settlements and roads. Since Wingfall, creatures from the wilds have spread into places where people used to travel safely.',
          ['Why do the king’s patrols not stop them?','Some try. But Halvard uses much of his strength to keep people obedient and protect his own interests. A patrol’s presence is no promise of a safe road.'],
          ['Were there no monsters before Wingfall?','There were. The difference was that the towns could call on the riders for help. People still had to maintain roads and look after one another.'],
          ['Should I turn back if I cannot get through?','Yes. Learn what you can, return to safety and prepare. There is no shame in surviving a road you were not ready for.']),
        t('What happened at Wingfall?', 'Seven dragonriders once watched over Emberfell. Fifty years ago, Halvard betrayed the other six and took the throne. That betrayal is what we call Wingfall.',
          ['Why did people trust him?', 'He had ridden beside them. They had reason to think he shared their purpose. His betrayal does not make their trust foolish.'],
          ['Did you know the riders?', 'I remember their time and what changed after it. I was not present for the betrayal itself. I will tell you what I know, and be clear about what I do not.'],
          ['Why is this not the story everyone tells?', 'Speaking against the king has consequences. Some people repeat his account because they believe it; others because they are afraid to say anything else.']),
        t('Did you always live in Millwood?', 'I travelled when I was younger. My first journey took me through Thornwell with two maps, three shirts and not one dry pair of spare socks.',
          ['Did you learn to pack better?', 'Immediately. A cold walk gives an ordinary pair of socks rather more importance than it has at home.'],
          ['Why did you come back?', 'I wanted a place where I could be useful and people knew me well enough to disagree with me. Millwood has never failed at either.'],
          ['Were you afraid to leave?', 'Yes. I thought that meant I should not go. Later I learned it could mean I needed to prepare and ask for help.']),
        t('Why do you keep old maps?', 'A map can show a path people no longer use, or a place whose name has changed. I compare them because none tells the whole story alone.',
          ['Can I trust an old route?', 'Use it as a clue. A bridge may have fallen or a path become overgrown. Look at the country in front of you as well as the page.'],
          ['What if two maps disagree?', 'Ask when they were drawn and who used them. A changed river can make two honest maps look as though one is a lie.'],
          ['Do you keep the damaged ones?', 'Some. There is one I soaked on that first journey. It is a useful reminder to put a map somewhere dry.'])
      ],
      dragon:t('How do I know what my dragon needs?', 'Watch how he responds to you. Offer food and rest, and give him time to investigate things safely. The bond is something you will learn together.',
        ['What if I misunderstand him?', 'You will sometimes. Stop and pay attention when something seems wrong. You do not have to understand everything on the first day.'],
        ['Does choosing me mean I have to be a rider?', 'It means he chose you. What you do with that trust is a decision you make together. The old title need not decide every part of your life.'],
        ['I wish you could come with us.', 'I wish I could make the journey easier for you. I can help you prepare and be here when you return. Ask others for help along the way too.']),
      politics:t('King Halvard', 'Halvard was a rider before he was king. That is why I take his interest in dragons seriously. He knows what another rider could mean for his rule.',
        ['Where does he rule from?', 'Cinderhold, far to the east. Knowing where he is does not make going there wise. Prepare before you approach his stronghold.'],
        ['Do you think he is afraid of another rider?', 'I think he wants to control anything that could challenge him. I cannot promise how he will act if he believes that control is slipping.'],
        ['Can we believe anything in his histories?', 'Compare them with other accounts. A lie is often easier to spread when some of its details are true. Ask what has been left out.']),
      peace:t('After Halvard’s defeat', 'You have done something I scarcely dared hope to see. Now I would like to hear how you are, without asking what you will do for the kingdom next.',
        ['I do not know what to do with myself yet.', 'Then give yourself time. You need not replace a dangerous journey with another duty the moment it ends.'],
        ['There will still be people who need help.', 'There will. Let others share that work. You helped give them the chance.'])
    },
    'Nan Ferrow':{
      pre:['Morning, love. Are you off to see Hettie?','I thought I would find out what she needs.','Then take care on the lane. I will be here when you get back.'],
      first:['There you are, love. How are you managing with your new companion?', 'There is a lot I did not think about until he was depending on me.','Then tell me. I cannot promise to know all the answers, but you do not have to keep the worries to yourself.'],
      heard:'I have been wondering how you two are getting along. Sit with me a while, love, if you have time.',
      back:['It is good to see you both, love. How have you been?','Hello, my darling. I am glad you came by.'],
      topics:[
        t('What was Mum like?', 'She was curious, and very patient with frightened animals. She would wait for one to come to her even when everybody else had given up.',
          ['Do I remind you of her?', 'Yes. Sometimes you listen with exactly the same expression. You are your own person, love, but I am glad to see things I remember in you.'],
          ['Do you have a favourite memory of her?', 'She brought me the first flowers she found each spring, roots and all. She worried a cut flower would miss its home. Winnie remembers those visits too.'],
          ['Does talking about her make you sad?', 'Sometimes. It makes me happy too. You are allowed to ask about your mother. I do not want grief to make her a stranger to you.']),
        t('What was Dad like?', 'He could sit quietly with somebody who was upset, but he could not be patient with a tangled knot. Your mother found that very funny.',
          ['I get cross with knots too.', 'I know, love. He would insist he was nearly finished while making the knot twice its original size.'],
          ['What did Mum do?', 'Took the knot away and gave him something else to hold. Then he followed her about explaining how he would have untied it.'],
          ['Was he kind to people?', 'Yes. Ned knew him. If you want a story about your father from someone besides me, ask Ned about the cart in the rain.']),
        t('How did you manage when I was a baby?', 'I was frightened I had forgotten how to care for someone so small. Then you needed feeding, and that gave me something I knew how to do.',
          ['Was it very hard?', 'Some days were. I missed your parents and I worried about getting things wrong. Loving you was never the difficult part.'],
          ['Did anyone help you?', 'Our neighbours did. Food, washing, an hour while I slept. Little things that were not little to me at all.'],
          ['I am glad I grew up with you.', 'So am I, Corin. I wish your parents could have watched you grow, but I am grateful for every year I have had with you.']),
        t('What was I like as a child?', 'You put an injured moth in my flour tin once. I opened it to start baking and found you had made a little bed of leaves inside.',
          ['Did the moth recover?', 'It flew straight past my nose. You were so pleased that you forgot to be sorry about the flour.'],
          ['I am sorry about the flour.', 'You have apologised for that before, love. I keep the story because it makes me smile, not because you still owe me a loaf.'],
          ['Did I bring home a lot of creatures?', 'Enough that I learned to look before picking up a basket. You always thought there would be room for one more.']),
        t('Do you worry when I am away?', 'Of course. I cannot stop being your grandmother because you are old enough to leave home. But I do not want every visit to become a list of things I fear.',
          ['I worry about leaving you here.', 'I have neighbours and a life of my own, love. I miss you, but you are allowed to go and have yours.'],
          ['What would you like me to tell you?', 'Something you enjoyed as well as the difficult parts. I want to know what makes you laugh out there.'],
          ['Sometimes I just want to come home.', 'Then come home. You do not need to finish every task in the world before you are welcome here.'])
      ],
      dragon:t('Are you all right with me caring for a dragon?', 'I am trying to get used to it. I see how much you care for him, and I would never ask you to leave him simply because I am worried.',
        ['I did not mean to frighten you.', 'I know. You did the kind thing when you found him. Let me be surprised for a little while; it does not mean I am cross with you.'],
        ['I am afraid I will not be enough for him.', 'Then let people help you. Caring for someone does not require knowing everything, Corin. You taught me that when you were very small.'],
        ['I will make sure we both get some rest.', 'Good. And do it before you are both worn out. Looking after him includes looking after the person he trusts.']),
      politics:t('King Halvard', 'I have heard people excuse his cruelty for years because they fear what might happen without him. Fear does not make the cruelty easier to live with.',
        ['Were you afraid to tell me about him?', 'I wanted you safe, and I chose my words carefully. I also wanted you to recognise an unkind thing even when a powerful person called it necessary.'],
        ['Are you asking me to stay out of his way?', 'I am asking you to take the danger seriously. I know I cannot choose your whole life for you.'],
        ['I am angry about what he has done.', 'You have reason to be. Just leave room for the people you are trying to help, so anger is not the only thing carrying you.']),
      peace:t('After Halvard’s defeat', 'I am proud of you, love. I am also very glad that I can say it with you here to hear me.',
        ['I would like to stay home for a while.', 'Then stay. You do not have to earn a quiet day in your own home.'],
        ['I still feel as though I should be doing something.', 'You have spent a long time being needed. It may take a while to feel comfortable resting. I can keep you company while you practise.'])
    },
    'Edwin':{
      pre:['Hello, Corin. How is your morning going?', 'It seems to have become rather busy.','Hettie has that effect on a morning. I hope you get a moment to yourself.'],
      first:['Corin, is that a dragon? I thought I was seeing things for a moment.', 'He is real. I am still getting used to it myself.','I imagine you are. Could you keep him a little way from the hens until we know how they will react?'],
      heard:'You are looking after a dragon? I was going to ask about Hettie’s errand, but this sounds rather more pressing.',
      back:['Hello again, both of you. Nothing about the farm seems quite as surprising now.','Hello, Corin. Have you a moment to talk?'],
      topics:[
        t('How do you keep track of the hens?', 'Count them while they settle, then check the places where they like to hide. Counting eggs will not tell you whether a hen is missing.',
          ['Do they hide from you?', 'One slips behind my boots when I approach. I used to count her twice as she changed sides.'],
          ['What happens if you cannot find one?', 'I check the shelter and the edges of the yard before I assume she has escaped. I would rather spend time looking than leave her out.'],
          ['Does Hettie help?', 'She knows their habits better than anyone. She usually asks where I last saw the missing one before she starts searching.']),
        t('Do you like working on the farm?', 'Yes. There is always something that needs doing, and I can usually see whether I have done it properly. That suits me.',
          ['Even when the hens refuse to cooperate?', 'Especially then. Getting a nervous bird settled feels better than winning an argument it cannot understand.'],
          ['What is the hardest part?', 'Noticing a small problem while there are three noisy ones demanding attention. A loose latch can wait quietly until it causes a much bigger job.'],
          ['Would you ever want to travel?', 'Perhaps for a visit. I like hearing about other places, but I do not think I need to leave Millwood to have a life worth talking about.']),
        t('How can I help the farm?', 'Tell us when something seems wrong, even if you cannot fix it yourself. A damaged gate is easier to mend before the animals discover it.',
          ['I do not always know what to look for.', 'Ask. Hettie would much rather explain a job than have someone get hurt trying to guess.'],
          ['I worry about being in the way.', 'You can say that too. We can find a useful job without pretending you already know how to do everything.'])
      ],
      dragon:t('Will my dragon frighten the hens?', 'He might. Hens do not know what a dragon is, but they know to be cautious about a large creature coming towards them.',
        ['I can keep him back from the coop.', 'Thank you. Let them get used to his presence without making them feel trapped.'],
        ['He would not mean to scare them.', 'I believe you. They still need space. Being gentle includes noticing when a smaller creature is frightened.'],
        ['I had not thought about how they would see him.', 'It is easy to forget when you know him. We can take it slowly. Nobody needs to get used to a dragon in one morning.']),
      politics:t('King Halvard', 'I want the food we raise to feed people. It is hard watching a royal levy take supplies we have already planned to use.',
        ['Does Hettie argue with the collectors?', 'She makes her case. They seldom have the power, or the inclination, to change the amount.'],
        ['What can you do afterwards?', 'Help work out what is left and what the animals need. Worry does not finish the feeding, so we start there.']),
      peace:t('After Halvard’s defeat', 'I hope we can plan the farm around what it needs now. I would like a season with fewer unpleasant surprises.',
        ['There will still be escaped hens.', 'True. I was hoping for fewer surprises, not an entirely different kind of hen.'],
        ['What would help most?', 'Enough feed kept back for a difficult winter. That would make more difference than a day of celebration.'])
    },
    'Winnie':{
      pre:['Corin! How lovely to see you. How is Nan?', 'Keeping busy, as usual.','That sounds like her. I hope she lets herself sit down sometimes.'],
      first:['Good heavens, Corin. Is that a dragon beside you?', 'Yes. He hatched from an egg I found.','Nan must have had a shock. So have I, for that matter. Are you both getting on all right?'],
      heard:'A dragon? Oh, Corin. That is wonderful and rather frightening at once. How are you managing?',
      back:['Hello, Corin. It is nice to see you and your companion again.','Come and chat, Corin. I am pleased to see you.'],
      topics:[
        t('What was Nan like when she was younger?', 'She loved dancing. When the musicians wanted to stop, she would ask for one more tune as though she had not asked the same thing three times already.',
          ['She has never told me that.', 'Ask her about the midsummer dances. She may tell you the musicians were the ones who kept her there.'],
          ['Were you there with her?', 'Whenever I could be. I did not have her stamina, but she always came back to sit with me between tunes.'],
          ['I would like to see her that happy.', 'She still has happy days, love. You might ask what she would enjoy doing instead of deciding it must all be in the past.']),
        t('Do you remember my mother?', 'Very well. She brought me flowers with the roots still attached, worried they would not live if she cut them. I used to find a pot before she reached the door.',
          ['I would like to ask Nan about that.', 'Do. There was often soil on her doorstep as well as mine. She may remember where your mother found the flowers.'],
          ['What did you like most about her?', 'She noticed when someone was left out. She would draw them into a conversation without making a performance of it.'],
          ['May I ask about her again sometime?', 'Whenever you like. You need not fit all your questions into one visit.']),
        t('What should I tell Nan about my travels?', 'Tell her about the people who are kind to you. She will want to picture you having company and a place to rest.',
          ['I do not want to upset her with the difficult parts.', 'You can be honest without telling everything at once. Let her ask questions too; she knows when you are trying to protect her.'],
          ['Will you visit her while I am away?', 'Of course. She is my friend as well as your grandmother. We will have plenty to talk about besides worrying over you.'])
      ],
      dragon:t('Does this seem strange to you?', 'Very. I remember you as a child, and now you are caring for a dragon. I am trying to see the person you are becoming instead of only the little boy I knew.',
        ['I still feel like that boy sometimes.', 'You do not have to lose him. Growing up can leave room for being uncertain and needing company.'],
        ['I do not know what people expect of me.', 'Then start by telling them what you can actually do. A remarkable companion does not make you responsible for everyone’s wishes.']),
      politics:t('King Halvard', 'I have lived long enough to see people learn which questions they must not ask aloud. That is a sad thing for a village to teach its children.',
        ['Did you ever stop yourself speaking?', 'Many times. I will not pretend I was braver than everyone else. I tried to make sure the people closest to me knew what I thought.'],
        ['How do we change that?', 'By listening when someone risks an honest answer. They may need a welcome before they need another argument.']),
      peace:t('After Halvard’s defeat', 'I hope Nan gets more of your news from you now. And I hope some of it is pleasantly ordinary.',
        ['Such as what I had for breakfast?', 'Exactly. After worrying about someone, an uneventful breakfast can sound like the finest news in the world.'],
        ['I would like a quiet visit with you both.', 'Then we should arrange one. Nan will claim she has jobs to finish, and I shall remind her how she used to demand one more tune.'])
    },
    'Ned':{
      pre:['Hello, Corin. How are things at home?', 'All right. I thought I would stop and see you.','I am glad you did. It is good to have a visit that does not begin with something broken.'],
      first:['Corin, that is a dragon. I do not suppose you are about to ask me to make him a harness?', 'No. I wanted to say hello, if we are not frightening you.','Startled is nearer the truth. Give me a moment; I have never had to look this far up to greet a neighbour’s companion.'],
      heard:'A dragon has come into your care? I can help with worn straps, lad. I shall leave the advice about dragons to someone better informed.',
      back:['Hello to both of you. How is the journey treating you?','Corin. A pleasure to see you.'],
      topics:[
        t('How do you know a strap needs mending?', 'Look for cracks and worn stitching, especially where the leather bends. Most straps show damage before they fail.',
          ['What if it still feels strong?', 'Do not wait until your whole weight depends on it. Ask someone who knows leather to look at the damaged part.'],
          ['Did my father know how to mend things?', 'He could manage ordinary repairs. He also knew when to bring something to me, which saved him a good deal of wasted leather.'],
          ['Do people usually notice in time?', 'Often they notice and hope it will last one more day. Then they arrive asking whether I can mend it yesterday.']),
        t('How did you know my father?', 'He helped me get a cart out of a ditch in pouring rain. I hardly knew him then. He stayed until it was on the road and would not take a copper.',
          ['Did he ever tell you why he stopped?', 'He said he would have wanted someone to stop for him. Then he helped check the wheel before we went our separate ways.'],
          ['Did you become friends?', 'Yes. It is difficult to remain strangers after spending an afternoon soaked through and covered in the same mud.'],
          ['Thank you for telling me about him.', 'You are welcome. I mend things for Nan when I can. It is a small way to remember a man who gave his time so freely.']),
        t('Do you enjoy repairing old things?', 'I do. People bring an old belt or a worn bag and apologise for it. Often there are years left in it if the damage is put right.',
          ['Why do they apologise?', 'They think I would rather make something new. But a well-used thing has already proved it belongs in someone’s life.'],
          ['Have you kept anything for a long time?', 'My first decent awl. I have replaced its handle twice. I know exactly how it feels in my hand.'])
      ],
      dragon:t('I worry about keeping us both safe.', 'I cannot tell you how to care for a dragon. I can tell you to check your own equipment before you rely on it. Being carried does not make a loose strap less dangerous.',
        ['I can at least do that much.', 'It is worth doing. Small preparations prevent troubles that bravery cannot fix in the moment.'],
        ['I wish there were someone who knew everything we need.', 'So do I. Until then, ask each person for what they actually know. You will get better help than from one very confident guess.']),
      politics:t('King Halvard', 'When his men need leather, they call it a requisition. When a farmer needs a repair afterwards, I have to explain why my supplies are gone.',
        ['Can you charge the crown more?', 'I do not get much say in the price. That is what makes it different from a customer asking for my work.'],
        ['Who goes without?', 'People who can least afford a replacement. I patch what I can, but a patch cannot solve every shortage.']),
      peace:t('After Halvard’s defeat', 'I hope the next work I agree to will actually be an agreement. That is not an extravagant wish for a craftsman.',
        ['Will you make something new?', 'When it is needed. There are plenty of things worth saving first.'],
        ['I hope you get some rest as well.', 'Thank you. I shall try to take that advice before telling you the same thing.'])
    },
    'Joss':{
      pre:['Corin. You are welcome to stop for a chat.', 'Thank you. How are you getting on?','Well enough. Tam says I can make that answer last an hour if anyone lets me.'],
      first:['I was about to ask what was new, but the dragon answers quite a lot of that.', 'I found his egg. I did not expect to come home with him either.','Is he comfortable here? I am not sure what counts as a proper welcome for a dragon.'],
      heard:'You have a dragon travelling with you? I thought moving from Thornwell to Millwood was a large change. I may need to reconsider.',
      back:['Hello, Corin. I hope you and your dragon are settling into the journey.','Hello again. It is good to have you visit.'],
      topics:[
        t('Why did you leave Thornwell?', 'I came to Millwood for a winter and stayed. I missed Thornwell, but I liked the life Tam and I were making here.',
          ['Do you still miss it?', 'Yes. That does not mean I wish I had stayed there. You can be happy somewhere and still miss another place.'],
          ['What did you leave behind?', 'Friends, familiar streets, and my good cups with a neighbour. I expect she considers them her cups by now.'],
          ['Will you go back for a visit?', 'I would like to. I kept waiting until I stopped feeling divided about it. That may have been a rather silly condition.']),
        t('How did Millwood become home?', 'At first I kept thinking of the date I would leave. Then Tam made room for my things without asking how long I needed it.',
          ['Did that change your mind?', 'It made staying feel like a choice I was welcome to make. That mattered more than a grand speech would have.'],
          ['Were you nervous about staying?', 'Certainly. A temporary visit cannot fail in quite the same way as a life you choose. I am glad I chose it.'],
          ['I hope I always feel at home here.', 'You can change and still belong, Corin. Give the people who love you a chance to know who you become.']),
        t('How is the apple press doing?', 'I got the old screw turning again. It took two afternoons, and Tam watched my confidence shrink every time it stuck.',
          ['What finally worked?', 'Cleaning it properly instead of trying to force it. An embarrassing answer after all the force I had applied.'],
          ['Does Tam let you forget that?', 'No. But she also tells everyone I repaired it. I think that is a fair arrangement.'])
      ],
      dragon:t('How do I keep things ordinary with a dragon?', 'You may not manage ordinary. Familiar is still possible: people who know you, time to eat, somewhere you can stop explaining yourself.',
        ['I miss being able to arrive without a crowd.', 'I can understand that. You can ask for a quiet visit here. Curiosity does not oblige you to answer every question.'],
        ['I want him to feel he belongs somewhere too.', 'Then let home include him in whatever way is comfortable for you both. Belonging takes time even without wings.']),
      politics:t('King Halvard', 'I have spent too long treating a visit to my old home as something that needs courage. A road between towns should not feel like a favour from the crown.',
        ['What makes you reluctant to travel?', 'The danger on the roads, and the uncertainty of meeting his patrols. There is always a reason to put the visit off another week.'],
        ['Do you blame him for all of that?', 'For the patrols, yes. For the monsters, I blame him for taking obedience more seriously than protecting the people who use those roads.']),
      peace:t('After Halvard’s defeat', 'I think I should visit Thornwell before I invent another reason to delay. I would like to take Tam with me.',
        ['Is there someone you want to see?', 'An old friend kept some cups for me when I left Thornwell. I would like to thank them, and find out how their life has changed.'],
        ['Will you come back to Millwood?', 'Yes. A visit to where I used to live does not change where I want to come home.'])
    },
    'Tam':{
      pre:['Corin! It is nice to see you. How is Nan?', 'Well, thank you. How are things with you and Joss?','Busy, but good. I am pleased you stopped by.'],
      first:['Oh! Corin, is your companion really a dragon?', 'He is. I hope his being here is all right.','Give me a moment to take it in. You know, I had several ordinary questions ready and I have forgotten every one.'],
      heard:'You found a dragon’s egg and it hatched? That explains why your day has become rather more complicated than ours.',
      back:['Hello, both of you. I am getting better at not staring, I promise.','Hello, Corin. Have you come for a chat?'],
      topics:[
        t('How did you and Joss start making cider?', 'We already had the apples, and an old press I had been using to hang aprons. Joss insisted the press had not yet retired.',
          ['Was he right?', 'He was, after he stopped trying to force the screw. I was happy to find another place for the aprons.'],
          ['Who does most of the work?', 'We do different parts. Joss likes the equipment; I prefer working out what to do with the fruit. We both volunteer to taste the result.'],
          ['Do you argue while you work?', 'Occasionally. We are learning to finish a sentence before explaining why the other person is wrong.']),
        t('Why do you keep making things for Nan?', 'She brought soup when I was ill and refused payment. Now I send her cider and she finds another excuse to feed us. Neither of us is very good at settling the account.',
          ['Does either of you really want it settled?', 'No. It is a pleasant way to keep looking after one another.'],
          ['She is always trying to feed me too.', 'She wants something good to happen to you that she can actually arrange. Accepting it now and then is a kindness.'],
          ['Can I tell her you said thank you?', 'Please do. Though I expect she will answer by asking whether we have eaten.']),
        t('Does Joss still miss Thornwell?', 'He does. I try to let him talk about it without hearing it as a complaint about our life here.',
          ['Is that difficult?', 'Sometimes. But missing old friends does not mean he loves us any less. It helps to ask what he misses instead of guessing.'],
          ['Would you go with him to visit?', 'Gladly. I would like to know the people and places he keeps telling me about.'])
      ],
      dragon:t('Everyone has so many questions about him.', 'I can imagine. Seeing a dragon makes people curious, but you are allowed to be tired of explaining the same thing.',
        ['I do want people to understand him.', 'Then take one conversation at a time. You do not have to become an expert before you can tell someone to give him space.'],
        ['Sometimes I want to talk about something else.', 'Then we shall. Joss and I make cider together. I can tell you about his attempts to repair our apple press, if you would like a change of subject.']),
      politics:t('King Halvard', 'I resent having to plan ordinary work around what the crown might demand next. It makes a good harvest feel uncertain before we even bring it in.',
        ['How do you plan at all?', 'We keep what we can and help our neighbours. It is easier when people tell one another honestly what they need.'],
        ['Does he know people live like this?', 'He receives what he takes. I do not know whether he ever thinks about the people left counting what remains.']),
      peace:t('After Halvard’s defeat', 'I would like to make something for our neighbours simply because we have enough to share. No levy to count first.',
        ['Nan will try to repay you.', 'Naturally. I look forward to failing to stop her.'],
        ['What would you and Joss like to do?', 'Visit Thornwell together. Then come home with a few new stories and, if he gets his way, some extremely old cups.'])
    },
    'Tilda':{
      pre:['Hello, Corin. How is Nan keeping?', 'She is well. I will tell her you asked.','Thank you. And how are you? I should not greet you only as somebody’s messenger.'],
      first:['My goodness. I thought I knew every creature that might follow you home, Corin.', 'This is a dragon. I found his egg in the woods.','I can see I underestimated you. Is he comfortable with people coming close, or should I stay where I am?'],
      heard:'A dragon? I have mended clothes after quite a few of your adventures. I suspect this one is going to need more explanation.',
      back:['Hello, Corin. And hello to your dragon. I hope the journey has been kind to you.','Corin, how are you getting along?'],
      topics:[
        t('How did you learn to work with wool?', 'By pulling too hard, tangling it and learning that hurrying made the work take longer. I was not pleased to discover patience was part of the trade.',
          ['Did anyone help you untangle it?', 'My mother showed me where to start, then let me do it. She knew I would remember better if she did not rescue every mistake.'],
          ['Do you still get it tangled?', 'Of course. I am better at noticing before I have made the problem enormous.'],
          ['I find it hard to slow down too.', 'Try stopping before you are cross with the thing in your hands. A short pause costs less time than starting again.']),
        t('Do you make things for the neighbours?', 'Quite often. People bring something worn and tell me which part still feels comfortable. That is usually the part I try to preserve.',
          ['Why not make a whole new one?', 'Sometimes that is best. Sometimes a person wants their old scarf back, not an improved scarf that feels like somebody else’s.'],
          ['What do you enjoy making most?', 'Things people actually use. It is lovely to recognise a piece of my work coming towards me on a cold day.']),
        t('What do you do with the scraps?', 'Keep the useful lengths for mending. The very small pieces remind me which colours I have used, so I can match a later repair.',
          ['That sounds like a lot to keep track of.', 'It is, but it saves me guessing. I would rather label a bundle once than wonder about it every winter.'],
          ['Do you have a favourite colour?', 'A warm red. A little can make a plain garment feel like somebody chose it with pleasure.'])
      ],
      dragon:t('What do you make of my new companion?', 'I am curious about him, but I do not want to reach towards a creature that has never met me. You know him better than I do.',
        ['Thank you for asking before coming close.', 'It seems only fair. People dislike being crowded by strangers too.'],
        ['We are still learning about each other.', 'Then you can tell me that. I would rather hear an honest uncertainty than a promise neither of you can keep.']),
      politics:t('King Halvard', 'The crown demands wool while families are mending the same winter clothes again. I see the shortage one worn sleeve at a time.',
        ['Can you make the clothes last?', 'Often, with care. But a repair should be a choice, not the only way a child gets another winter out of a coat.'],
        ['Who helps those families?', 'Neighbours bring materials and I give time when I can. It helps, but it should not have to make up for everything the king takes.']),
      peace:t('After Halvard’s defeat', 'I hope I can make something because a neighbour wants it, not only because their last warm garment is falling apart.',
        ['What would you make first?', 'I would ask what they like. People have had enough of accepting whatever is left.'],
        ['Something in your favourite red?', 'If they wanted red. There you are, catching me before I choose for somebody else.'])
    },
    'Emmet':{
      pre:['Corin. Good to see you about.', 'How are things, Emmet?','There is always something to do, but I can spare a little time for you.'],
      first:['Corin, I need to ask before I spend the rest of the day wondering: is that a dragon?', 'Yes. He hatched from an egg I brought to Maddock.','Right. I shall try to accept that before asking another dozen questions. Are you managing all right?'],
      heard:'You are travelling with a dragon? I would have thought you were teasing if you had not looked quite so serious about it.',
      back:['Hello again, you two. How is life beyond the farm treating you?','Hello, Corin. What is on your mind?'],
      topics:[
        t('How do you know when apples are ready?', 'You learn the variety and check the fruit. The sunny side can ripen sooner. Looking at one apple is not the same as looking at the whole tree.',
          ['Did you learn that the hard way?', 'With a basket of fruit I should have left alone. My impatience made a great deal of extra work.'],
          ['Do the children help you check?', 'They are eager to inspect the sweetest fruit. Less eager to explain where their samples went.'],
          ['What happens to the bruised apples?', 'We sort them from the sound fruit and use what can be used. Letting damaged fruit spoil the rest would waste both.']),
        t('Have you grown apples all your life?', 'Most of it. I remember helping plant a tree when I was scarcely taller than its stake. Waiting for it to bear fruit felt impossible.',
          ['Was it worth waiting?', 'Yes. I wish I could show my younger self how ordinary it became to stand in its shade. He would have been impressed.'],
          ['Do you ever want faster work?', 'Sometimes. Then something ripens before I am ready and I get all the hurry I could wish for.']),
        t('What makes a good neighbour?', 'Someone who tells you a fence has broken before coming to complain about the animal that got through it.',
          ['That sounds like experience.', 'It is. I have been on both sides of the conversation. Being annoyed is easier than being helpful.'],
          ['Do people help each other here?', 'Often. We also grumble. I do not think the grumbling cancels out the help, provided the help actually arrives.'])
      ],
      dragon:t('Were you frightened when you saw him?', 'Startled, certainly. I have spent my life learning what familiar animals might do. A dragon is a very large gap in that knowledge.',
        ['I do not expect you to trust him immediately.', 'Thank you. Give me time to get used to him, and I will give him the same courtesy.'],
        ['He is still getting used to all of us too.', 'I had not thought of it that way. We must seem a very nosy village to a creature that only recently hatched.']),
      politics:t('King Halvard', 'A poor crop is hard enough without a collector counting what he expects instead of what actually grew.',
        ['Can you show him the difference?', 'We can show it. Getting him to change the levy is the difficult part. His tally does not ripen more fruit.'],
        ['Do people blame the farmers?', 'Sometimes. We explain what happened, but they are still hungry. It is hard to argue with that part.']),
      peace:t('After Halvard’s defeat', 'I hope keeping enough from a harvest can become ordinary again. I would like to worry about weather without adding royal demands.',
        ['Will you plant more trees?', 'Where there is space and someone to tend them. It is easier to plan for years ahead when I expect the harvest to remain ours.'],
        ['Will you have time to rest?', 'After the work that needs doing. I shall try to remember that there is always more work, and that is not a reason never to stop.'])
    },
    'Lark':{
      pre:['Corin! How is your day treating you?', 'It has given me plenty to do.','Then I am glad you have stopped long enough to say hello.'],
      first:['Oh, Corin. That is a dragon. I was going to ask whether you had eaten, and now I do not know which of you to ask first.', 'Me, probably. I have been thinking so much about him that I nearly forgot.','Then remember yourself as well. He will need you in better shape than an empty stomach allows.'],
      heard:'You found a dragon? I think you had better tell me that story before I try to make ordinary conversation.',
      back:['Good to see you both. Remembered to eat, Corin?','Hello, Corin. How have you been?'],
      topics:[
        t('Why do you like baking?', 'You can learn the same recipe for years and still notice something new. A colder morning or a different batch of flour asks you to pay attention.',
          ['I thought a recipe told you exactly what to do.', 'It gives you a place to start. You still have to notice how the dough feels instead of obeying the page with your eyes shut.'],
          ['Do you ever ruin a loaf?', 'Yes. Less often than I used to. The early ones could have held a door open through a gale.'],
          ['What is your favourite part?', 'Hearing a good crust crackle as it cools. For a moment I have finished one job and have not started the next.']),
        t('How early do you get up?', 'Earlier than I would choose for leisure. Bread needs time, and hungry people are not especially interested in that explanation.',
          ['Does anyone keep you company?', 'Occasionally. Quiet company is welcome before I have properly woken up. Complicated questions are less welcome.'],
          ['Would you like a later start?', 'Now and then. A morning when somebody else has thought about breakfast would be a treat.']),
        t('What food travels well?', 'Something you can carry without crushing or spilling it, and something you will actually eat. Packing an admirable meal is no use if you keep putting it off.',
          ['I forget to stop when I am busy.', 'Then stop before you are exhausted. Looking after yourself is easier before hunger makes every decision irritating.'],
          ['That sounds like something Nan would say.', 'Nan has had considerably more practice at getting you to listen. You should probably believe her.'])
      ],
      dragon:t('I am learning to look after him.', 'I can see you take it seriously. Just remember that caring for a dragon does not mean your own meals and rest stop mattering.',
        ['I feel selfish when I think about myself.', 'Eating is not taking something away from him. You both need care.'],
        ['I wish there were a recipe for all this.', 'So do I. Even then, you would have to look at the creature in front of you and notice what he needed.']),
      politics:t('King Halvard', 'When grain is taken for the crown, people ask why bread is harder to come by. I can explain it, but I cannot bake an explanation.',
        ['Can the village spare enough for everyone?', 'We try. A poor harvest and a heavy levy together make trying very difficult.'],
        ['Does the king ever go hungry?', 'I doubt his table is where a shortage is first felt. Mine is closer to the people who feel it.']),
      peace:t('After Halvard’s defeat', 'I would like a village meal where nobody quietly wonders what they will have to go without tomorrow.',
        ['What would you bake?', 'Good bread, enough of it, and something sweet if the stores allow. Plenty need not be elaborate to feel special.'],
        ['Could I join in?', 'I would be delighted. You can begin by staying long enough to eat.'])
    },
    'Hal':{
      pre:['Hello, Corin. No need to hurry past me.', 'I can stop for a little while.','Good. Retirement leaves plenty of time to notice people racing through theirs.'],
      first:['Well, I have lived long enough to see a dragon in Millwood. I did not expect you to be the one bringing him.', 'Neither did I. Are you all right?', 'Quite. Surprised is not the same as unwell, lad. Let me enjoy being surprised.'],
      heard:'A dragon, you say? I thought I had heard every unlikely thing that could happen to someone running a village errand.',
      back:['Hello, Corin. Your companion still gives an old man something remarkable to see.','There you are. Have you time for a chat?'],
      topics:[
        t('Do you miss working at the mill?', 'I miss being useful in a way I understood. I do not miss every early morning. People seem disappointed when I give them both answers.',
          ['Could you teach someone what you know?', 'When they ask. I am learning that offering advice and taking over are different things.'],
          ['Do you still wake up early?', 'Most days. Forty years of habit does not consult a retirement date. At least I can turn over now.'],
          ['You are still useful to people.', 'Thank you, Corin. I know that on good days. It helps to hear it on the others.']),
        t('What did you enjoy about the work?', 'Keeping something running that everyone depended on. A good day could look uneventful, which was usually a sign we had done our jobs.',
          ['Was it dangerous?', 'It could be if you stopped paying attention. I learned to stop machinery before reaching into places where my hands did not belong.'],
          ['Did you make mistakes?', 'Enough to become patient with apprentices. Pretending I had never been new would not have made them learn faster.']),
        t('What do you do with your time now?', 'Visit people, listen, and try not to begin every sentence with how we used to do things. You may tell me if I fail.',
          ['Was the old way always better?', 'Certainly not. Sometimes it was merely the way I knew. It is embarrassing how easily those two can be confused.'],
          ['Do you enjoy having time to talk?', 'Very much. I used to promise myself I would visit once the work was finished. Work can be very good at never finishing.'])
      ],
      dragon:t('Did you ever see dragons before?', 'Not close enough to tell you anything useful about caring for one. I would rather admit that than dress an old memory up as expertise.',
        ['I appreciate that.', 'At my age, people sometimes expect certainty as part of the furniture. They ought to allow us to say we do not know.'],
        ['Does seeing one now make you hopeful?', 'Yes. It reminds me there are still things ahead that I could not have predicted. That is a pleasant feeling.']),
      politics:t('King Halvard', 'I remember people travelling more freely. I also remember hard winters. I do not need the past to have been perfect to know that Halvard has made life harsher.',
        ['What changed most?', 'People began measuring what they said as carefully as what they could afford. That is a tiring way to live.'],
        ['Do you think things can improve?', 'I do. I am less certain how quickly. Repairing a village’s trust will take more than a change of orders.']),
      peace:t('After Halvard’s defeat', 'I am glad I lived to hear this. Now I hope the young get enough peace to grow old without becoming experts in fear.',
        ['What will you do now?', 'Visit someone I have been meaning to see. It seems a good day to stop putting that off.'],
        ['Will you keep telling us your stories?', 'If you keep asking. I might even shorten the ones you have heard twice.'])
    }
  };
  Object.assign(cast,{
    'Pip':{
      pre:['Hello! I felt your footsteps before I saw you. I am Pip.', 'I am Corin, from Millwood. Am I allowed to stop here?', 'Of course. I only meant you were easy to hear coming.'],
      first:['There is a dragon following you! Is he meant to be there?', 'Yes. I am Corin. He hatched from an egg I found, and we are travelling together.', 'I am Pip. I have never met a dragon before. Do you think he would mind me watching him for a little while?'],
      heard:'You travel with a dragon? I am Pip, and I would very much like to meet him sometime. Only if he wants to meet me too.',
      back:['Hello again, Corin! I am glad you have both come to visit.','Hello, Corin. What have you come to ask?'],
      topics:[
        t('How did you hear my footsteps?', 'I feel little vibrations through the ground. Footsteps are quite different from rain, especially when someone keeps stopping and starting.',
          ['Can you tell who is walking?', 'Sometimes, if I know them well. Heavy steps are easier to notice. I could not tell you a stranger’s name from their feet.'],
          ['Does rain make it difficult?', 'Very. Everything is tapping at once. I like the rain, but it is not a good time to ask me who is approaching.'],
          ['What do my steps sound like?', 'Quick, then still, then quick again. You seem to find a lot worth stopping for. I like that.']),
        t('What do you like about the hollow?', 'There are small things happening everywhere if you wait. A beetle deciding where to go can keep me interested for quite a while.',
          ['What if it does not go anywhere?', 'Then perhaps it found a good place. Not every interesting thing has to be on its way somewhere else.'],
          ['Do the beetles mind you watching?', 'They usually carry on. I try not to block them. A very large stranger standing in my way would annoy me too.'],
          ['I would probably get impatient.', 'You could start with a short wait. Nobody is making you watch an entire beetle afternoon.']),
        t('Do many humans visit you?', 'A few. I like the ones who ask about us instead of deciding we are all the same because we have caps.',
          ['What should I know about you?', 'My name is Pip, I ask too many questions, and Mycella says that last part is not a fault unless I forget to listen.'],
          ['I am worried I will say something foolish.', 'Then we can explain it. I have already asked whether your dragon was following you by accident.'],
          ['Who else should I talk to?', 'Mycella has old memories, Bolete knows the paths, and the Shroom King will hear you if you want to speak with him.'])
      ],
      dragon:t('What would you like to know about my dragon?', 'Does he choose where to go, or does he wait for you? I am trying to understand how travelling together works when only one of you knows the road.',
        ['We are still working that out.', 'That sounds fair. I would not know all the rules on my first journey either.'],
        ['I try to notice what interests him.', 'Good. I would like a travelling companion who stopped for things I wanted to see.'],
        ['I worry people only see something frightening.', 'I was surprised by how large he is. Then you told me he was your companion. That helped me know how to begin meeting him.']),
      politics:t('King Halvard', 'I have seen people go quiet when his soldiers come. I do not like wondering whether a visitor expects us to be afraid.',
        ['Do they bother you?', 'I keep out of their way. I would rather meet someone because we both want to talk.'],
        ['Do all humans make you nervous?', 'No. You stopped to introduce yourself. That is a very different sort of arrival.']),
      peace:t('After Halvard’s defeat', 'I hope visitors will come because they want to meet us, without anyone following to ask why.',
        ['What would you show them first?', 'I would ask what they wanted to see. Bolete says my favourite beetle may not be everyone’s first choice.'],
        ['I would still like to visit you.', 'Then please do. You do not need to bring important news every time.'])
    },
    'Mycella':{
      pre:['Welcome, traveller. I am Mycella. Have you come from the southern woods?', 'I am Corin, from Millwood. I wanted to meet the people here.', 'Then take your time. A visit need not begin with a favour to ask.'],
      first:['A young dragon. I remember wings above these woods, but I never expected to meet one like this.', 'I am Corin. He hatched near Millwood, and we have stayed together.', 'I am Mycella. Welcome to you both. There is much here he has never seen; let him take his time.'],
      heard:'A dragon has hatched in your care? I am Mycella. I remember seeing dragons long ago, and I am glad to hear there is another.',
      back:['Welcome back, Corin. It is good to see you both.','Welcome back. What would you like to talk about?'],
      topics:[
        t('What do you remember of dragons?', 'Their shadows passed over the canopy when I was young. I watched them from below. I did not know their names or the people who rode with them.',
          ['Were you frightened of them?', 'The first time. Later I came to recognise the shadow and wait for a glimpse between the branches.'],
          ['Did one ever land near you?', 'Not close enough for a meeting. I would not claim to know what they thought because I once saw them cross the sky.'],
          ['What did you miss when they were gone?', 'At first, the sight of them. Later, people began bringing news of dangerous roads. Their absence became something larger than an empty sky.']),
        t('How old is this community?', 'Older than any of us remembers it beginning. My mother taught me paths she had learned from her elders, and I have taught them to others.',
          ['Do those paths stay the same?', 'No. Trees fall, water moves, and we find another way. Remembering an old path includes knowing when it is no longer safe.'],
          ['How do you keep the memories?', 'By telling one another what we experienced. We sometimes disagree. Age does not make every recollection perfect.'],
          ['Would you like humans to remember your stories too?', 'If they listen carefully and tell whose story it was. We are people to meet, not scenery for somebody else’s tale.']),
        t('How should I behave while I am here?', 'Keep to clear ground, take care around the small growth, and ask before taking anything. You need not be frightened of making a mistake if you are willing to listen.',
          ['I do not always know what is important to you.', 'Then ask, as you are doing now. We should not expect a visitor to know customs nobody has explained.'],
          ['Are the wild Shrooms on the paths your people?', 'They are not members of our community. Some creatures in the woods are dangerous. Judge the ones you meet by what they do, not simply by having a cap.'],
          ['Would it be better if I kept away?', 'You are welcome, Corin. Care is not the same as absence. We would rather be known than avoided.'])
      ],
      dragon:t('Do you think he remembers other dragons?', 'I cannot know that by looking at him. If he finds a way to share what he knows with you, listen. Until then, let him be a young creature discovering his own life.',
        ['Everyone seems to want him to mean something.', 'I understand the hope. It can still be a heavy thing to put on someone who has only just arrived.'],
        ['I want him to enjoy being alive.', 'Then leave room for curiosity and rest. A life should contain more than what others need from it.'],
        ['Did the old riders understand that?', 'I did not know them well enough to say. Their stories cannot answer every question about the companion you have now.']),
      politics:t('King Halvard', 'I remember these woods before his reign. When his men speak as though the land began with his crown, I know at least that much is untrue.',
        ['Why does that matter?', 'Because calling something yours can make taking from it sound reasonable. People were living here before he decided he owned their obedience.'],
        ['Have you ever met him?', 'No. I know the effects of his rule and the words his men bring. I will not pretend I have looked into his thoughts.']),
      peace:t('After Halvard’s defeat', 'I am glad his rule has ended. I hope people will ask how to live with their neighbours before deciding how to rule them.',
        ['Will it take a long time to recover?', 'Some things will. Relief can come quickly; trust and damaged places need longer.'],
        ['What would you like to see next?', 'Visitors who have time to listen. New stories to remember, alongside the old ones.'])
    },
    'Bolete':{
      pre:['Keep to the clear ground when you can, traveller. I work hard to keep a way through.', 'I am Corin. I will watch where I put my feet.', 'Bolete. Thank you for asking nothing more difficult of me than an introduction.'],
      first:['A dragon on our paths. Before you bring him closer, does he have room to turn?', 'I am Corin. We can stay here if that is easier.', 'Thank you. I am Bolete. You are both welcome; I just prefer to make room before somebody has to apologise.'],
      heard:'You are travelling with a dragon? I am Bolete. If you bring him through the hollow, use clear ground and give him room to turn.',
      back:['Welcome back, you two. Thank you for taking care on the paths.','Hello, Corin. What do you need to know?'],
      topics:[
        t('What work do you do here?', 'I keep paths open. Roots grow, branches fall, and travellers understandably prefer not to crawl through everything.',
          ['Does it bother you that the roots grow back?', 'No. I work around the living growth where I can. The point is to make a way through, not win a quarrel with the forest.'],
          ['Do you work alone?', 'Not always. Others help when there is a heavy job. People are more willing if you tell them what needs doing before you are exhausted and cross.'],
          ['Could I help sometime?', 'You can begin by using the paths instead of making new shortcuts. That saves more work than you might think.']),
        t('Are the paths safe?', 'Some are watched and maintained. Others pass through wild country where creatures gather. An open path is not a promise that nothing will attack you.',
          ['What should I do if something blocks the way?', 'Keep yourself a route back. You can prepare and return; being halfway to a place does not oblige you to finish the journey today.'],
          ['Are the creatures on the paths like you?', 'Some have caps, but they do not live as part of our ring. Do not mistake their attacks for a welcome from us.'],
          ['Which way leads back towards Millwood?', 'Follow the southern paths down through Shroom Pass and the northern woods. Use your map if you have one; the wooded turns are easy to confuse.']),
        t('Do people take many shortcuts?', 'Enough that I can usually tell where somebody decided a few steps were more valuable than the growth they trampled.',
          ['Do you stop them?', 'I explain why the path bends. Most listen better when they know it goes around something, not merely away from where they want to be.'],
          ['What if they do not care?', 'Then I ask again more firmly. Being a visitor does not make the damage disappear.'])
      ],
      dragon:t('Is my dragon too large to visit?', 'No. We need to think about where he can move, that is all. A large guest deserves a usable path just as much as a small one.',
        ['Tell me if we are in the way.', 'I will. Thank you for making that easy to say.'],
        ['I was worried you wanted us to leave.', 'I would have said so. I am asking you to move carefully because I am willing to have you here.'],
        ['He can get over places I cannot.', 'Then remember the people who still use the ground. Being able to avoid a broken path does not mend it for everyone else.']),
      politics:t('King Halvard', 'A patrol once cut through young growth to save time. When I objected, they pointed to the king’s mark as though it could repair what their boots had done.',
        ['Did they listen to you?', 'Not that time. I want you to understand why I ask travellers to be careful; I have seen what happens when nobody thinks they need to listen.'],
        ['Were you able to repair the damage?', 'We could help the ground recover. We could not make it unharmed again by the next morning.']),
      peace:t('After Halvard’s defeat', 'I hope a request to mind the path can be heard as a request now, without someone deciding it is a challenge to a crown.',
        ['There is still work for you, then.', 'There will always be roots and rain. I would be happy to have only ordinary reasons to repair a path for a while.'],
        ['Would you welcome more travellers?', 'Yes, provided we make room for one another. A good path is meant to be used.'])
    },
    'Truffle':{
      pre:['Oh, hello. I was not sure whether you wanted to speak to me.', 'I am Corin. I would like to, if that is all right.', 'It is. I am Truffle. I take a little time with new people.'],
      first:['I have never been this close to a dragon. Will you stay with him while we talk?', 'Of course. I am Corin; he is travelling with me.', 'I am Truffle. Thank you for staying. I want to meet him, even if I need a little room at first.'],
      heard:'You have a dragon companion? I am Truffle. I would like to meet him someday, from a comfortable distance to begin with.',
      back:['Hello, Corin. I am pleased you have both come back.','Hello again. It is easier to begin a conversation once I know someone’s name.'],
      topics:[
        t('What do you tend in the fields?', 'Small growing caps, especially where the ground does not hold much moisture. The youngest ones need shelter before they can stand much sun.',
          ['How do you shelter something so small?', 'Sometimes with a fallen leaf. Carefully placed, it gives shade without pressing on the new growth.'],
          ['Does it take a lot of patience?', 'Yes. I like having time to notice a small change. Not everyone would enjoy it.'],
          ['How do you know when they no longer need help?', 'I check how they are growing and remove shelter a little at a time. Helping them does not mean leaving everything the same forever.']),
        t('Are you always cautious with visitors?', 'Until I know what they want. Some come to look, some to talk, and some have already decided what sort of creature I am.',
          ['What would you like me to know?', 'That being quiet does not mean I have nothing to say. I am grateful when someone waits for the answer.'],
          ['I am sorry if I startled you.', 'Thank you. You have given me time, so there is no need to keep apologising.'],
          ['Would you rather I came back later?', 'No, I would like you to stay. I can be nervous and still want company.']),
        t('Have animals ever kept you company?', 'A fox rested near me through a cold season once. I stayed still, and after a while it stopped treating every movement as a reason to leave.',
          ['Did it become tame?', 'No. It was still a wild fox. I liked that it felt safe enough to rest without needing it to belong to me.'],
          ['Did you miss it when it left?', 'Yes. I hoped its leaving meant it had found what it needed. I could be pleased for it and miss it at the same time.'])
      ],
      dragon:t('What would help you feel comfortable around him?', 'Let me choose how close to come, and tell me before asking him to move towards me. I do better when I know what is about to happen.',
        ['We can do that.', 'Thank you. It makes meeting someone large much easier when the person beside him listens.'],
        ['He is curious about new people too.', 'Then perhaps we are both working out how to meet a stranger. I had only thought about my side of it.'],
        ['You do not have to touch him.', 'I am glad. People sometimes treat being brave as agreeing to something you did not want to do.'])
      ,politics:t('King Halvard', 'I dislike hearing someone say that being small is a reason to move aside for his men. There ought to be room for us without asking permission to exist.',
        ['Have his soldiers said that to you?', 'I have heard them say it to others. That was enough to make me wary when I heard boots approaching.'],
        ['I will try to give you room.', 'You already have. It helps more to be asked what I need than to be told I should not be afraid.']),
      peace:t('After Halvard’s defeat', 'I am relieved. I do not expect to stop being cautious all at once, but perhaps I can learn to welcome footsteps more easily.',
        ['You can take your time.', 'Thank you. I would rather become comfortable than pretend that I already am.'],
        ['Would you like us to visit again?', 'Yes. Familiar visitors are a good place to begin.'])
    },
    'The Shroom King':{
      pre:['Welcome to our ring, traveller. What name shall we know you by?', 'Corin, from Millwood. Should I bow?', 'Only if you wish. I would rather hear you comfortably than have you worry about the angle.'],
      first:['A dragon and a young traveller. There has not been a welcome quite like this in my time.', 'I am Corin. His egg hatched in my care, and we have stayed together.', 'Then welcome, Corin, and welcome to your companion. You may speak to me without ceremony.'],
      heard:'A dragon has joined your journey? Welcome, Corin. I hope you will tell me about him, and about yourself as well.',
      back:['Welcome back, Corin. There is time to hear you both.','Welcome back. What would you like to discuss?'],
      topics:[
        t('What do you mean by the ring?', 'Our community. We use the word for the people who care for this place and for one another. You need not find a particular circle on the ground to meet it.',
          ['Can a visitor belong to it?', 'A visitor can become a friend. Belonging grows from how we treat one another, not from a title I grant in a moment.'],
          ['Does everyone agree about everything?', 'Certainly not. A community with no disagreements has either stopped thinking or stopped listening.'],
          ['Do humans visit often?', 'Some do. We welcome care and curiosity. We are less fond of people who arrive already certain they understand us.']),
        t('How did you become king?', 'The others chose me to speak for the ring. I had a reputation for hearing an argument through before offering an answer.',
          ['Did you want the crown?', 'I wanted people to reach an answer they could live with. The crown came with more arguments than I had expected.'],
          ['Can they choose someone else?', 'Yes. If I stop listening, they should. The work matters more than my keeping the title.'],
          ['Must have been a very long argument.', 'Long enough for me to regret looking so attentive. Still, we settled it without losing a neighbour, which was the point.']),
        t('How do you settle a disagreement?', 'First I ask what each person needs. That can be quite different from the thing they began by demanding.',
          ['What if both needs are reasonable?', 'Then we look for what can be shared, changed or postponed. I do not assume a disagreement requires a winner and a loser.'],
          ['What if someone refuses to listen?', 'We can set limits without pretending we have persuaded them. Listening is not permission to harm the people beside you.'],
          ['Do you ever get it wrong?', 'Yes. Then I explain what I misunderstood and help put it right. A crown should not make an apology impossible.']),
        t('What would you like from Millwood?', 'To be known as neighbours. It is easier to protect a shared wood when people on either side understand that the other lives there too.',
          ['Who should I tell about you?', 'Anyone who is willing to listen. You need not promise anything on their behalf. An honest account of meeting us is enough to begin.'],
          ['Some people might be afraid of Shrooms.', 'Then tell them what you actually saw and heard. We cannot ask them to understand us through a story that confuses us with creatures that attack on the paths.'],
          ['Could our people visit one another?', 'I would welcome careful visitors. Friendship will need ordinary meetings, not only messages carried by someone on a great journey.'])
      ],
      dragon:t('What do you expect of me and my dragon?', 'I expect the same care from you that I ask of every guest. Your companion does not make you owe us a great deed in exchange for a welcome.',
        ['That is a relief to hear.', 'Then rest from being useful for a moment. Tell me something because you wish to, not because a king has asked for a service.'],
        ['I would still like to help when I can.', 'And I would be grateful. Help freely offered is worth more when someone is also free to say they cannot give it.'],
        ['Do you think he makes me a rider?', 'Perhaps that is the name people will use. You and he will have to decide what the life behind that name should be.']),
      politics:t('King Halvard', 'I object to the way Halvard treats refusal as disobedience. A ruler who cannot hear “no” cannot learn what his people truly need.',
        ['Is ruling here different?', 'Our ring can replace me. I answer to the people whose concerns I carry. The title does not put me beyond them.'],
        ['Would you stand against his men?', 'I would first consider how to protect the ring. A brave speech that leaves my neighbours to suffer would not be good leadership.'],
        ['What should a king be for?', 'Helping people do together what they cannot do alone. If the crown serves only the person wearing it, something has gone badly wrong.']),
      peace:t('After Halvard’s defeat', 'I am glad his rule is over. I hope the people of Emberfell will have a real voice in what follows.',
        ['I do not want to decide everyone’s future.', 'Then do not mistake their gratitude for a demand that you do so. You can help them be heard.'],
        ['Will your ring work with the towns?', 'I would welcome the conversation. We should hear what each community needs before making promises for all of them.'])
    },
    'Cap':{
      pre:['Hello. I am Cap. Have you come to ask about growing things?', 'I am Corin. I would like to hear about your work.', 'Then you are welcome. It is pleasant to be asked before someone offers advice.'],
      first:['A dragon? I have never had to consider how much room to leave for wings before.', 'I am Corin. We can keep back if you need us to.', 'Thank you. I am Cap. I would like to meet you both without making the smaller growth pay for my curiosity.'],
      heard:'You have a dragon companion? I am Cap. Most of my days are spent tending things much smaller, but I would like to hear about him.',
      back:['Welcome back, Corin. How are you both getting along?','Hello, Corin. I have time to talk.'],
      topics:[
        t('What do you grow?', 'Mostly moss and the smaller growth we use around our homes. I watch how each patch responds instead of assuming everything wants the same amount of light.',
          ['Did you always know how to care for it?', 'No. I once moved a healthy moss bed into brighter light because I thought more light must mean more growth. It began to fail.'],
          ['How did you put that right?', 'Returned it to shade and gave it time. Doing more of the wrong thing would not have helped.'],
          ['What do you look for each day?', 'Changes in colour, dryness, and how new growth is coming along. Small differences are useful if you know what it looked like before.']),
        t('How do you keep supplies through winter?', 'We keep some food dried, and tend living beds so we are not relying on one store. Both need care in different ways.',
          ['Why not dry everything?', 'Because a growing bed can provide more later. It is useful to have more than one way of feeding ourselves.'],
          ['What happens if a bed fails?', 'We find out why, use other stores, and ask for help if we need it. Pretending there is no problem would only delay the help.']),
        t('Do you like having visitors?', 'Yes, when they are interested. I get a little tired of being told how I could improve things by someone who arrived a moment ago.',
          ['I may ask very basic questions.', 'Those are welcome. Asking means you have left space for an answer.'],
          ['Can somebody new notice something you missed?', 'Certainly. I will listen to what they noticed. I just want us to look together before deciding what it means.'])
      ],
      dragon:t('Would my dragon harm what you grow?', 'His size could make an accident easy, so give him room. I do not know enough about dragon warmth or breath to pretend I can predict more than that.',
        ['I can keep him clear of the growing beds.', 'Thank you. That is useful care without anybody needing to invent an explanation.'],
        ['I am glad you do not assume he will destroy things.', 'I tend living things. I know there is a difference between noticing a risk and deciding a creature means harm.']),
      politics:t('King Halvard', 'I mistrust anyone who counts what a place can give him without asking what it needs to keep living. Halvard’s demands seem very much like that.',
        ['Do his men understand the harm?', 'Some might. I cannot tell from an order. Understanding ought to show in what they leave and how they behave.'],
        ['What should they ask instead?', 'What we can spare, and what must remain. Taking the next season’s growth is not the same as taking a surplus.']),
      peace:t('After Halvard’s defeat', 'I hope the towns can plan for what they need to keep growing, instead of what someone more powerful might take.',
        ['Will things recover quickly?', 'Some will; others need time and attention. I would be wary of anyone promising everything at once.'],
        ['Is that what you will keep doing?', 'Yes. Ordinary care does not stop mattering when something extraordinary happens.'])
    },
    'Ilsa':{
      pre:['Welcome. I am Ilsa. Are you passing through or staying to talk?', 'I am Corin. I would like a conversation.', 'Then let us have one. You do not need to arrive with a purpose more impressive than that.'],
      first:['A dragon with a visitor. I hope nobody has made you feel you must explain everything before you can be welcome.', 'Thank you. I am Corin, and there is a great deal I do not know yet.', 'I am Ilsa. Then we shall begin with what you do know, whenever you feel like telling me.'],
      heard:'You are caring for a young dragon? I am Ilsa. That sounds like a great deal to learn in a short time.',
      back:['Hello, Corin. I am glad to see you and your companion again.','Welcome back. How are you keeping?'],
      topics:[
        t('Why do you save the young shoots?', 'Some need to grow before we gather them. Eating every new shoot can leave us full today and hungry later.',
          ['Is it difficult to leave food when people are hungry?', 'Very. That is why we make the decision together and share what is ready. A rule without help would only punish the hungriest person.'],
          ['How do people know which ones to leave?', 'I mark the growth we are keeping and explain why. Clear marks are better than expecting everyone to remember the same patch.'],
          ['Have you ever had to use what you meant to save?', 'Yes. A hard season can force a difficult choice. We plan to restore what we use instead of pretending the choice cost nothing.']),
        t('How do you teach children to be patient?', 'Give them something they can do while they wait. Watching growth is easier when they have a small task and can see why it matters.',
          ['Do they always listen?', 'No. Neither do adults. I try to find out whether they understood before deciding they ignored me.'],
          ['I was not very patient as a child.', 'Are you now? No need to answer quickly; this seems a good opportunity to practise.'],
          ['What if they make a mistake?', 'We put it right together where we can. Fear of admitting a mistake makes the next one harder to fix.']),
        t('What do you like about sharing food?', 'It gives people a reason to stay long enough to notice how the others are doing. Not every difficulty announces itself.',
          ['Do people tell you what is wrong?', 'Sometimes. Others need company before they can find the words. I try not to make a meal feel like an interrogation.'],
          ['That reminds me of my grandmother.', 'Then perhaps we would understand one another. Looking after people can have familiar parts even in very different homes.'])
      ],
      dragon:t('How do I stop worrying about making mistakes?', 'You may not stop altogether. Try to make it easy to ask for help, and to notice when something needs to change. Worry is most useful when it leads to care you can actually give.',
        ['Sometimes I think I should know more already.', 'He has not been in your life for very long. You would not demand a lifetime of experience from someone else on their first day.'],
        ['I want him to feel safe with me.', 'Then be patient when he is uncertain, as you would hope someone would be with you. You can learn the rest a little at a time.']),
      politics:t('King Halvard', 'I cannot admire someone who calls a demand reasonable without considering whether people have enough left to live on.',
        ['What would a fair demand look like?', 'An agreement people can question, with care for those who cannot give as much. Hunger does not become fair because a king ordered it.'],
        ['Do you talk about this openly here?', 'We need to discuss what affects our lives. I am glad the ring lets people ask difficult questions.']),
      peace:t('After Halvard’s defeat', 'I hope relief becomes something people can feel in their daily lives: enough food, a safer visit, a question they no longer fear asking.',
        ['Those sound like small changes.', 'Small enough to happen to an ordinary person. That is why they matter.'],
        ['I want to see people enjoying themselves.', 'So do I. Let us leave room for that alongside all the work that still needs doing.'])
    }
  });
  // Tolan can be approached during the Millwood visit; the other members of
  // the royal procession are scripted, non-conversational actors here.
  cast.Tolan={
    pre:['If you need to pass, keep the lane clear for the king’s party.', 'I live here. I am only doing an errand.', 'Then finish your errand. I do not need to make your morning more difficult.'],
    first:['That is a dragon. Corin, do you understand the attention that will bring?', 'I know the king is looking for dragons. I am trying to keep us safe.', 'Then be careful whom you trust. I cannot promise what another guard would do.'],
    heard:'You are telling a royal guard that you have a dragon? Be careful, Corin. My uniform should give you a reason to think before you speak.',
    back:['Keep your companion close, Corin. I cannot speak for every man wearing this badge.','What do you need, Corin?'],
    topics:[
      t('Why did you become a guard?', 'A regular wage. I used to carry flour, but there was not always work. My family needed money more reliably than that.',
        ['Is the work what you expected?', 'Some of it. Keeping order sounded simpler before I was told which people to inconvenience.'],
        ['Do you miss carrying flour?', 'People were generally pleased to see it arrive. I miss that part.'],
        ['Do you still help your family?', 'Yes. That is why leaving is not as simple as disliking an order.']),
      t('Do you have to follow every order?', 'I have to answer for refusing one. That does not make every order right, but I will not pretend there is no cost to saying so.',
        ['What happens if someone innocent gets hurt?', 'Then saying I was ordered to do it does not undo the harm. I know that.'],
        ['Can you help people without refusing?', 'Sometimes a clear explanation or a little patience is enough. Sometimes it is not. I have to make the choice in front of me.']),
      t('What makes a good guard?', 'Noticing when someone needs help instead of treating everyone as a problem to be moved along.',
        ['Do you manage that?', 'Some days better than others. You have reason to judge the uniform by what it has done to you.'],
        ['Then why did you stop me?', 'Because that was my task with the royal party. I can explain it without expecting you to be grateful for the interruption.'])
    ],
    dragon:t('Would you report my dragon?', 'I cannot offer safety for you or your companion. I can tell you that news travels quickly among patrols. Think carefully before approaching the king’s men.',
      ['Then I should keep moving.', 'Prepare before you do. Being in a hurry will not make the next patrol kinder.'],
      ['He has done nothing wrong.', 'I have not said he has. I am warning you about what others may decide before they give you a chance to speak.']),
    politics:t('King Halvard', 'I serve in his guard. You should bear that in mind before asking me to speak about him.',
      ['Do you think his orders are always right?', 'No person is right every time. That is as far as I am prepared to go in this conversation.'],
      ['I wanted to know what you thought.', 'I understand. I also have to think about what happens after an honest answer.']),
    peace:t('After Halvard’s defeat', 'I still need a living, and people still need protection. I would like those two facts to lead to better work than stopping them on their own roads.',
      ['Will people trust you?', 'Not simply because I ask. I will have to give them reasons.'],
      ['Would you stay a guard?', 'If the work is protecting people. I want to understand whose orders I would be following first.'])
  };

  function profile(n){
    if(!n||n.pettable||n.noTalk)return null;
    // The original atlas also contains a tavern patron called Pip. He is
    // renamed Puck during preparation and must never inherit the Shroom voice.
    if(n.n==='Pip'&&(MAPID!=='world'||n.school||n.lookId?.startsWith('tavern_')))return null;
    if(n.n==='Tolan'&&(MAPID!=='world'||n.loc&&!/Millwood/.test(n.loc)))return null;
    return cast[n.n]||null;
  }
  const memory=(n,kind)=>'@millwood-shrooms-v1:'+n.n+':'+kind;
  const remembered=(n,kind)=>discussedTopics.has(memory(n,kind));
  function mark(n,...kinds){for(const kind of kinds)discussedTopics.add(memory(n,kind));}
  const speak=(n,words)=>words.map((line,i)=>(i%2?'Corin':n.n)+': '+line);
  const shrooms=new Set(['Pip','Mycella','Bolete','Truffle','The Shroom King','Cap','Ilsa']);
  const knownDragonMeeting={
    Pip:['Corin! Is that a dragon travelling with you?','Yes. He hatched from an egg I found.','I would like to meet him properly. Would he mind if I watched him for a little while?'],
    Mycella:['Corin, I hoped to see you again. I did not expect you to return with a young dragon.','He hatched near Millwood. We have stayed together.','Welcome to you both. Let him take his time here; there is a great deal he has never seen.'],
    Bolete:['Corin, you have brought a rather larger companion this time. Does he have room to turn?','We can keep back until he does.','Thank you. Make room first and we can enjoy the visit without worrying about the smaller growth.'],
    Truffle:['Oh, Corin. I am glad it is you beside that dragon. Will you stay with him while we talk?','Of course. There is no need to come any closer than you want.','Thank you. I would like to meet him, if we can take a little time.'],
    'The Shroom King':['Welcome back, Corin. A dragon has joined your journey since we last met?','He hatched from an egg I found. We have stayed together.','Then my welcome extends to him as well. Tell me how you are both faring.'],
    Cap:['Corin, that is a dragon with you. I think we should leave more room than we needed on your last visit.','We can stay back while you tell us where it is comfortable.','Thank you. I want to meet him without making the small growth pay for my curiosity.'],
    Ilsa:['Corin! You have rather remarkable company this time.','His egg hatched in my care. There is a great deal I am still learning.','I should think so. You need not explain everything before you are both welcome.']
  };
  const knownDragonNews={
    Pip:'A dragon? You have a great deal more to tell me than I expected! I would like to meet him when you can both visit.',
    Mycella:'A new dragon, in your care. I am glad you came to tell me, Corin. I had wondered whether I would ever hear such news again.',
    Bolete:'Then give him room when you bring him through the hollow. You know you are welcome; we can make a careful visit work for a larger guest too.',
    Truffle:'A dragon? I am surprised, Corin. I would like to meet him when I feel ready, if you would stay with him while we talk.',
    'The Shroom King':'That is remarkable news, Corin. He will be welcome with you. I hope you can both find what you need for the journey.',
    Cap:'You are caring for a dragon now? Most of my days are spent tending things much smaller. Tell me how you are managing.',
    Ilsa:'That is a great deal to learn in a short time, Corin. I hope you are finding people who can help you look after him.'
  };
  function repeat(n,p){
    return [n.n+': '+p.back[npcSeesDragon(n)?0:1]];
  }
  function introduction(n){
    const p=profile(n);if(!p)return null;
    if(!hasDragon())return {lines:remembered(n,'met')?[n.n+': '+p.back[1]]:speak(n,p.pre),done:()=>mark(n,'met')};
    // Maddock witnessed the hatching and Nan's compulsory farewell is her
    // first dragon conversation; never make either discover him a second time.
    const witnessed=n.n==='Elder Maddock'||n.n==='Nan Ferrow'&&!nanGiftPending();
    const visible=npcSeesDragon(n),knew=remembered(n,'dragon')||witnessed;
    if(visible&&!remembered(n,'seen')&&!witnessed){
      const lines=knew?[n.n+': So this is the dragon you told me about. It is good to meet him in person.',
        'Corin: I thought you might like to see him when we visited again.',n.n+': '+p.back[0]]:
        speak(n,remembered(n,'met')&&knownDragonMeeting[n.n]||p.first);
      return {lines,done:()=>mark(n,'met','dragon','seen')};
    }
    if(!knew){
      // Only Corin supplies news of an absent companion. No unexplained
      // rumours, claims to see through walls, or invented location outside.
      const familiar=remembered(n,'met')||!shrooms.has(n.n)&&n.n!=='Tolan';
      const answer=remembered(n,'met')&&knownDragonNews[n.n]||p.heard;
      return {lines:[`Corin: ${familiar?'I have something to tell you.':'Hello. I am Corin.'} I found a dragon’s egg, and it hatched. The young dragon is travelling with me.`,n.n+': '+answer],done:()=>mark(n,'met','dragon')};
    }
    if(wonAll&&!remembered(n,'victory'))return {lines:['Corin: Halvard has been defeated. I wanted you to hear it from me.',n.n+': '+p.peace.first],done:()=>mark(n,'met','dragon','victory',...(visible?['seen']:[]))};
    return {lines:witnessed&&!remembered(n,'dragon')?speak(n,p.first):repeat(n,p),done:()=>mark(n,'met','dragon',...(visible?['seen']:[]))};
  }
  function context(n){
    const p=profile(n);if(!p)return null;
    if(!hasDragon()){
      if(n.n==='Elder Maddock'&&quest===Q.CARRY)return ['Elder Maddock: You have brought something back from the woods, Corin. Let us have a look at it together.'];
      return speak(n,p.pre);
    }
    // Hello inside an already opened conversation is a check-in, never a
    // replay of the surprised world introduction.
    return repeat(n,p);
  }
  function topic(n,row,category='story'){
    return {title:row.title,category,lines:[n.n+': '+row.first,'Corin: '+row.replies[0][0],n.n+': '+row.replies[0][1]],
      authoredBranches:{decisions:{0:row.replies.slice(1)}}};
  }
  function topics(n,{all=false}={}){
    const p=profile(n);if(!p)return null;
    if(!all&&(n.n==='Nan Ferrow'&&!hasDragon()||n.n==='Hettie'&&quest<Q.NOISE))return [];
    const rows=p.topics.filter(row=>{
      if(all)return true;
      if(n.n==='Hettie'&&row.title==='Will you manage the farm without me?')return hasDragon();
      if(n.n==='Elder Maddock'&&['Why have the roads become so dangerous?','What happened at Wingfall?'].includes(row.title))return quest>=Q.NOISE;
      return true;
    });
    const result=rows.map(row=>topic(n,row));
    if(all||hasDragon())result.push(topic(n,p.dragon));
    // The name and telepathy are not known until Aurelius introduces himself.
    if((all||hasDragon()&&dragonIntroDone)&&['Nan Ferrow','Elder Maddock'].includes(n.n))result.push(topic(n,t('He told me his name is Aurelius.',
      n.n==='Nan Ferrow'?'Aurelius. That is a lovely name. When you say he told you, do you mean he spoke?':'Aurelius. Tell me what happened when he gave you that name.',
      ['I heard him in my thoughts, as clearly as I hear you.',n.n==='Nan Ferrow'?'Then I am glad he can tell you what he needs. I cannot hear him, love; you will have to tell me what you want to share.':'The old accounts describe a bond between rider and dragon. Yours is becoming something you can experience for yourself. I cannot hear what passes between you.'],
      ['It surprised me. I had not known what to expect.',n.n==='Nan Ferrow'?'I should think it did. You can be pleased to hear him and still need time to get used to it.':'Understandably. Let him explain his own experience as well. A story about other riders cannot replace a conversation with him.'])));
    if(n.n==='Nan Ferrow'){
      if(all||templeCompass.owned)result.push(topic(n,t('Did Dad use this compass?', 'He carried it even on walks he knew. He liked knowing where home lay, though he sometimes pretended he was checking a more important direction.',
        ['I wish he could tell me where he went.', 'So do I, love. I can tell you the journeys I remember, and you can bring me stories of your own.'],
        ['I will look after it.', 'I am glad it means something to you. But look after yourself first. Your father would want you home more than he would want a perfect compass.'])));
      if(nanCookingHere(n))result.unshift({title:Date.now()>=nanElixirReadyAt?'Is an elixir ready?':'How is the next elixir coming along?',category:'lead',go:()=>giveNanElixir(n)});
    }
    if(n.n==='Elder Maddock'){
      if(all||hasSword())result.unshift(topic(n,t('The sword you gave me', 'It belonged to my father. I kept the blade cared for because I hoped it could still protect someone. I would prefer you never needed it, but the roads are dangerous.',
        ['I am still not confident using it.', 'Pay attention to an enemy’s movements and give yourself room. If you are overwhelmed, retreat and prepare. Confidence should follow practice, not replace it.'],
        ['Do you want it back when this is over?', 'Keep it while you need it. I would be happier to see you safely home than to have the sword hanging here unused.'],
        ['Thank you for trusting me with it.', 'You are welcome, Corin. You can honour that trust by taking care of yourself, not by looking for reasons to draw it.'])));
      if(hasDragon()&&!wonAll){
        const all=breathHas.lightning&&breathHas.ice&&breathHas.shadow;
        result.unshift(topic(n,t(all?'We found all three temple Heartstones.':'Where should we go next?',
          all?'Then you and your dragon have learned what the three temples held. Cinderhold is Halvard’s stronghold, far to the east. Take supplies and rest before you approach it.':
          !breathHas.lightning?'Start with the old rider temple near Forgewick, southeast of the town. Forgewick is east of Thornwell. Follow the eastern road from Millwood through Thornwell to reach it.':
          !breathHas.ice?'You have already found the Lightning Heartstone. The temple near Sandspire holds the Ice Heartstone. Continue east from Forgewick towards the desert and ask about the temple there.':
          'You have found Lightning and Ice. The temple near Hollybeck holds the Shadow Heartstone. Continue towards Hollybeck and prepare for the colder country.',
          ['And where is King Halvard?', 'He rules from Cinderhold, far to the east. Go prepared. Reaching a stronghold and being ready to face what is inside are different things.'],
          ['I do not want to rush past people who need help.', 'Then make time for them where you can. Food, rest and friendships will matter on this journey as much as the destination.'],
          ['I will check our supplies before setting out.', 'Good. If you lack something, ask while you are still among people who can help.']), 'lead'));
      }
    }
    if(n.n==='Odo'){
      if(!fishingPole)result.unshift({title:odoRodReferral?'Where is Calder’s camp again?':'Where can I get a fishing rod?',category:'lead',questUnlock:!odoRodReferral,go:()=>beginNpcTalk(n,true,true)});
      if(all||fishingPole)result.unshift(topic(n,t('I have a fishing rod now.', 'Good. A rod is far more useful by the water than left as somebody’s spare. I hope it serves you well.',
        ['Thank you for helping me get started.', 'You are welcome. Come and tell me how you get on; an old fisherman can still enjoy somebody else’s catch.'],
        ['Where would you suggest trying it?', 'The pools at Forgefalls, southeast of Thornwell. Look for quieter water beside the current and keep your feet somewhere safe.']), 'lead'));
    }
    if(n.n==='The Shroom King'&&(all||charm.spore))result.unshift(topic(n,t('How do I use the Spore of the deep ring?', 'Equip the spore as a charm from your Bag. While you wear it, defeating an enemy restores one heart to you, up to your usual maximum.',
      ['Does simply carrying it help?', 'No. It must be equipped to work. Check your charms before entering a dangerous place.'],
      ['Does it heal my dragon as well?', 'No, it restores your strength. You must still tend your companion and carry the food he needs.'],
      ['Does it replace bringing medicine?', 'No. It helps after a victory; it does not promise that you will survive the fight. Keep medicine for when you need healing sooner.']), 'lead'));
    // Political questions may be asked at any stage, but do not reveal
    // Maddock's rider history before his compulsory account of Wingfall.
    if(all||n.n!=='Elder Maddock'||quest>=Q.NOISE)result.push(topic(n,wonAll?p.peace:p.politics,'world'));
    if(typeof MillwoodFriendshipTopics!=='undefined')for(const row of MillwoodFriendshipTopics.rows[n.n]||[]){
      if(all||MillwoodFriendshipTopics.available(row))result.push({...topic(n,row),friendshipId:row.id});
    }
    // Repeatable supplies and changing route reminders are practical services.
    // They remain useful without becoming repeatable friendship points.
    for(const row of result)if(!row.lines||['Where should we go next?','We found all three temple Heartstones.'].includes(row.title))row.friendship=false;
    if(all){const open=new Set(topics(n).map(row=>row.title));for(const row of result)row.available=open.has(row.title);}
    return result;
  }
  function gift(n){
    if(!profile(n)||n.n!=='The Shroom King'||charm.spore)return null;
    return [
      'The Shroom King: I would like you to have a Spore of the deep ring. Equip it as a charm in your Bag; while you wear it, defeating an enemy restores one heart to you.',
      'Corin: Thank you. Is there something you need me to do in return?',
      'The Shroom King: No task and no debt. It is a gift for the road. Take care, and come back to visit when you can.'
    ];
  }
  function rod(n){
    if(!profile(n)||n.n!=='Odo')return null;
    return odoRodReferral?[
      'Corin: Could you remind me where to find Calder?',
      'Odo: The first camp on the eastern road from Millwood to Thornwell. Ask Calder for his spare fishing rod and tell him I sent you.',
      'Corin: Thank you. I will look for him there.'
    ]:[
      'Corin: Odo, do you know where I could get a fishing rod?',
      'Odo: Ask my grandson Calder. He keeps the first camp on the eastern road from Millwood to Thornwell. I gave him a spare rod when he set out.',
      'Corin: Would he mind letting me have it?',
      'Odo: Tell him I sent you. I gave him two so he would have one to share, and that spare has waited long enough.',
      'Corin: Thank you. I will ask him when I reach the camp.'
    ];
  }
  const biographies={
    Hettie:['Farmer','Millwood','Hettie runs the farm with practical kindness. She knows Corin well enough to notice when he is worrying and to tell him plainly when she can manage without him.'],
    Gwil:['Woodworker and farmhand','Millwood','Gwil helps on the farm and repairs what the village needs. His father taught him both the craft of working wood and the patience to grow its replacement.'],
    Odo:['Fisherman','Millwood','Odo has a fondness for exaggerated catches, an honest memory of his brother, and a grandson named Calder who keeps a camp on the road to Thornwell.'],
    'Elder Maddock':['Village elder','Millwood','Maddock knows the history of the riders and the dangers beyond Millwood. He offers Corin what help he can while admitting the limits of his knowledge.'],
    'Nan Ferrow':['Corin’s grandmother','Millwood','Nan raised Corin and keeps his parents’ memories alive. Her home is somewhere he can ask questions, admit his worries, and be welcomed without having to earn it.'],
    Edwin:['Farm worker','Millwood','Edwin tends the hens and values careful, useful work. He has learned to notice small problems before they become noisy ones.'],
    Winnie:['Family friend','Millwood','Winnie remembers Nan’s dancing and Corin’s mother’s gifts of flowers. She welcomes questions about the family Corin never had the chance to know.'],
    Ned:['Leatherworker','Millwood','Ned repairs straps and harnesses. A friendship with Corin’s father began with a stranded cart and has become a lasting kindness towards Nan’s household.'],
    Joss:['Cider maker','Millwood','Joss came from Thornwell for a winter and made a home with Tam. He can love his life in Millwood while still missing the place he left.'],
    Tam:['Cider maker','Millwood','Tam and Joss share the work of making cider. She and Nan maintain a cheerful, unsettled account of meals, gifts, and neighbourly kindness.'],
    Tilda:['Wool worker','Millwood','Tilda makes and mends things people use. She likes a repair that preserves what its owner loved about the original.'],
    Emmet:['Apple grower','Millwood','Emmet knows the patience of tending trees and the hurry of a ripe harvest. He appreciates a neighbour who offers help before a complaint.'],
    Lark:['Baker','Millwood','Lark finds pleasure in a good loaf and knows that a recipe still requires attention. Looking after people includes reminding Corin to feed himself.'],
    Hal:['Retired mill worker','Millwood','Hal is finding new ways to be useful after years at the mill. He enjoys a visit and tries to distinguish experience from the belief that the old way was always better.'],
    Tolan:['Royal guard','Millwood · The king’s retinue','A steady wage brought Tolan into the guard. He is cautious about what he says in uniform and knows that following an order does not remove its consequences.'],
    Pip:['Curious neighbour','Sporehollow','Pip notices vibrations in the ground and finds small creatures worth watching. Eager questions come with a willingness to listen.'],
    Mycella:['Keeper of memories','Sporehollow','Mycella remembers dragons above the canopy long ago. She distinguishes what she witnessed from what she cannot know, and welcomes visitors willing to learn.'],
    Bolete:['Path keeper','Sporehollow','Bolete makes room for travellers while protecting the growth beside the paths. A clear warning is part of a sincere welcome.'],
    Truffle:['Tender of young growth','Sporehollow','Truffle looks after small caps and takes time to feel comfortable with strangers. Being cautious does not mean wanting to be left alone.'],
    'The Shroom King':['Voice of the ring','Sporehollow','The Shroom King speaks for his community and answers to it. He values a guest’s own concerns and treats a gift as a kindness, not a hidden bargain.'],
    Cap:['Grower','Sporehollow','Cap tends moss and living stores by observing what they need. Questions are welcome; confident advice from an uninformed visitor gets a more careful hearing.'],
    Ilsa:['Keeper of food stores','Sporehollow','Ilsa helps the community balance today’s needs with future growth. Sharing food is also a way to notice how others are faring.']
  };
  function dossier(name,actor){
    const n=actor?.n===name?actor:{n:name};if(!profile(n))return null;
    const [role,home,bio]=biographies[name];
    return {name,role,home,bio,interests:topics(n).filter(t=>t.category==='story').slice(0,3).map(t=>t.title).join(' · '),memory:''};
  }
  return {cast,profile,introduction,context,topics,gift,rod,dossier};
})();
