/* Authored in assets/dialogue/renewal; rebuild with tools/build-dialogue-renewal.mjs. */
const DIALOGUE_RENEWAL_CAST = {
  "Hettie": {
    "name": "Hettie",
    "home": "Millwood",
    "role": "Cattle farmer",
    "source": "01-millwood.txt:2",
    "topics": [
      {
        "title": "The cow that escaped",
        "opening": "How did you keep that cow from escaping?",
        "first": "One of my cows learned to lift the gate latch. I spent a week blaming Gwil for leaving it open.",
        "replies": [
          [
            "Did you apologise to him?",
            "Yes. He has been enjoying my apology rather longer than I enjoyed making it."
          ],
          [
            "How did you catch her doing it?",
            "I hid where she couldn't see me. She waited until I moved, then lifted the latch. I had to respect that."
          ],
          [
            "Can she still get out?",
            "I changed the fastening. Now she watches my hands whenever I open it. The contest continues."
          ]
        ]
      },
      {
        "title": "Raising a calf",
        "opening": "What is it like raising a calf?",
        "first": "A newborn calf tries to stand before it knows what its legs are for. I never get tired of watching that part.",
        "replies": [
          [
            "Do you help it up?",
            "Only if it needs me. Mostly I kneel nearby and get covered in straw."
          ],
          [
            "Were you always good with animals?",
            "No. I used to rush frightened ones. My aunt made me sit beside the pen until I learned to wait."
          ],
          [
            "What do you like about the work?",
            "Knowing them. I can hear one call and tell you which cow it is. Gwil thinks that deserves its own wage."
          ]
        ]
      },
      {
        "title": "My place on the farm",
        "opening": "Do I still have a place here when I'm not helping with the work?",
        "first": "You don't have to earn your welcome here by carrying something, Corin. You've done enough mornings' work for that.",
        "replies": [
          [
            "I like being useful.",
            "I know. I also like you when you're sitting down."
          ],
          [
            "I wasn't sure you'd manage without me.",
            "We've arranged the chores between us. You may still receive complaints, but those are mostly for Gwil."
          ],
          [
            "Could I work here again someday?",
            "If you want to. Ask me then. You needn't decide the rest of your life beside a cow."
          ]
        ]
      }
    ],
    "greetings": [
      "You have that look again, Corin. What are you about to ask me?",
      "Does it always mean more work for you?",
      "There you are. I've already counted the cows, so this can be a social visit.",
      "Then I picked my moment well.",
      "Corin, there's a dragon behind you. Please say that was deliberate.",
      "Mostly. He hatched from an egg I found, and followed me home."
    ]
  },
  "Gwil": {
    "name": "Gwil",
    "home": "Millwood",
    "role": "Farmhand and woodworker",
    "source": "01-millwood.txt:7",
    "topics": [
      {
        "title": "A chair too grand",
        "opening": "Have you ever made something that turned out too grand for its purpose?",
        "first": "I once carved a chair so elaborately that no one could sit on it without snagging a sleeve. Beautiful waste of a month.",
        "replies": [
          [
            "What happened to it?",
            "I shaved the arms smooth. My mother used it for twenty years and never once admired the carving."
          ],
          [
            "Would you make another?",
            "A plainer one. I'd rather someone wore it out than kept it under a cloth."
          ],
          [
            "How did you miss the problem?",
            "I kept standing back to look at it. Sitting down should have occurred to me earlier."
          ]
        ]
      },
      {
        "title": "Working with Hettie",
        "opening": "How do you and Hettie get the work done together?",
        "first": "Hettie can tell I'm avoiding a job before I've decided how to avoid it.",
        "replies": [
          [
            "What were you avoiding?",
            "Clearing a blocked drain in the rain. I suggested waiting for better weather. She pointed out the drain's purpose."
          ],
          [
            "Does she ever avoid anything?",
            "Accounts. That's when she develops a powerful interest in checking the cattle."
          ],
          [
            "Do you ever get a quiet day together?",
            "Sometimes we finish early and say absolutely nothing for half an hour. It's rather companionable."
          ]
        ]
      },
      {
        "title": "Something worth keeping",
        "opening": "What have you made that you'd never part with?",
        "first": "My father's old saw is worn down nearly to its spine. I bought a replacement, but I haven't thrown the old one out.",
        "replies": [
          [
            "Do you still use it?",
            "For small jobs. It cuts crookedly now, so I have to be honest about what it can manage."
          ],
          [
            "Did he teach you with it?",
            "He taught me on scrap. I wasn't allowed near that saw until I could explain where both my hands would be."
          ],
          [
            "You don't have to throw it away.",
            "Perhaps I'll hang it up. Retiring a saw ought to be easier than retiring its owner."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin, settle an argument. Is fixing a stool an excuse to sit on it?",
      "I think you have to test your work.",
      "Hettie hasn't sent you to fetch me, has she?",
      "You're safe. I came on my own.",
      "I thought the noise was another cart. That's your dragon?",
      "Yes. Sorry about the rather larger surprise."
    ]
  },
  "Odo": {
    "name": "Odo",
    "home": "Millwood",
    "role": "Fisher and Calder's grandfather",
    "source": "01-millwood.txt:12",
    "topics": [
      {
        "title": "The fish you let go",
        "opening": "What's the most embarrassing catch you've ever lost?",
        "first": "I caught a fine trout once and dropped it while explaining how firmly to hold a trout. Calder was watching.",
        "replies": [
          [
            "Did he laugh?",
            "He waited until it hit the water. Very polite boy."
          ],
          [
            "Did you catch it again?",
            "Probably. Every large trout in that stretch has received a personal accusation."
          ],
          [
            "What did you tell Calder?",
            "That he had just witnessed the wrong way. A useful lesson, regrettably well illustrated."
          ]
        ]
      },
      {
        "title": "Calder's camp",
        "opening": "Do you hear much from Calder at his camp?",
        "first": "Calder writes that the camp is doing well. Then he asks whether I've eaten. I appear to have raised a second grandmother.",
        "replies": [
          [
            "Do you write back?",
            "Of course. I give him enough news to stop him coming home to inspect me."
          ],
          [
            "Do you miss having him here?",
            "Especially when something ridiculous happens. A good story needs the right listener."
          ],
          [
            "Is he good at running a camp?",
            "He notices who hasn't joined the fire. He always did. People remember being included."
          ]
        ]
      },
      {
        "title": "Fishing alone",
        "opening": "Don't you get lonely fishing out here?",
        "first": "Some days I don't care whether I catch anything. I just want an hour when nobody expects an answer.",
        "replies": [
          [
            "Am I interrupting one of those?",
            "No. I would have told you. I'm old enough to enjoy being clear about it."
          ],
          [
            "I find it hard to sit still.",
            "Watch one patch of water. You can be busy without walking anywhere."
          ],
          [
            "Doesn't an empty basket bother you?",
            "Only when I've promised supper. Peace and poor planning look very similar until evening."
          ]
        ]
      }
    ],
    "greetings": [
      "Quietly, Corin. I'm trying to convince the fish this is an unoccupied bank.",
      "Will talking in a whisper fool them?",
      "Back for another fishing report? I've prepared a shorter version.",
      "Does that mean fewer fish or smaller ones?",
      "Well, your companion has made quite a shadow over the water.",
      "This is my dragon. I can move him if he's spoiling your cast."
    ]
  },
  "Elder Maddock": {
    "name": "Elder Maddock",
    "home": "Millwood",
    "role": "Elder and Corin's mentor",
    "source": "01-millwood.txt:17",
    "topics": [
      {
        "title": "When you gave up travelling",
        "opening": "What made you stop travelling?",
        "first": "I stopped travelling after I injured my knee. For months I called it a temporary delay. Eventually I planted beans.",
        "replies": [
          [
            "Was staying here hard?",
            "At first. I missed leaving more than I missed any destination. It took me a while to notice that difference."
          ],
          [
            "Did the knee ever get better?",
            "Enough for ordinary days. Not enough to pretend I was twenty. I made that mistake twice."
          ],
          [
            "Do you regret settling down?",
            "No. I met people I'd spent years walking past. Nan, for one, improved my sense considerably."
          ]
        ]
      },
      {
        "title": "An unreliable map",
        "opening": "Have you ever trusted a bad map?",
        "first": "I once followed a map to a bridge that had washed away fifteen years earlier. The innkeeper had been trying to tell me all morning.",
        "replies": [
          [
            "Why didn't you listen?",
            "I was busy explaining my route. I was a tiresome young man."
          ],
          [
            "How did you get across?",
            "I went back and asked him. Then I walked two days to the next crossing, with a very quiet mouth."
          ],
          [
            "Should I trust our map?",
            "Use it, but listen when the road disagrees. A drawing cannot tell you what happened yesterday."
          ]
        ]
      },
      {
        "title": "The seven riders",
        "opening": "What were the seven riders like?",
        "first": "There were seven riders before Wingfall. Halvard was one of them. He betrayed the others and made a crime of the bond they shared.",
        "replies": [
          [
            "Why would a rider turn on them?",
            "He wanted the power without anyone able to challenge him. The other riders stood in his way."
          ],
          [
            "Did you see Wingfall?",
            "No. I won't pretend I did. What I know comes from survivors' accounts and what happened afterward."
          ],
          [
            "Could they have stopped him?",
            "I can't give you an honest answer to that. They trusted a man who had fought beside them."
          ]
        ]
      },
      {
        "title": "Why help me?",
        "opening": "Why did you decide to help me?",
        "first": "I gave you the sword because the woods were dangerous. I didn't expect it to put you on a road to Cinderhold.",
        "replies": [
          [
            "Do you wish you'd kept it?",
            "I wish you didn't need it. That's a different regret."
          ],
          [
            "Are you asking too much of me?",
            "Perhaps. You deserve to ask that. I can advise you, but I cannot make the danger smaller by calling it destiny."
          ],
          [
            "I'll come back when I can.",
            "Then I'll listen when you do. You won't need to arrive with a victory to tell me about."
          ]
        ]
      }
    ],
    "greetings": [
      "Ah, Corin. Shut the worries out for a moment. What brings you?",
      "I could use someone to talk things through with.",
      "You needn't have an important reason to visit me.",
      "Good. I haven't worked out whether this is one.",
      "A living dragon in Millwood. I keep checking that I'm truly awake.",
      "You and me both. He's staying close to me."
    ]
  },
  "Nan Ferrow": {
    "name": "Nan Ferrow",
    "home": "Millwood",
    "role": "Corin's grandmother",
    "source": "01-millwood.txt:23",
    "topics": [
      {
        "title": "A memory of Mum",
        "opening": "Would you tell me something you remember about Mum?",
        "first": "Your mother hated singing in front of people, but she sang while she mended clothes. If I entered, she would pretend she had been humming.",
        "replies": [
          [
            "Was she any good?",
            "Lovely voice. She thought lovely voices belonged to other people."
          ],
          [
            "What songs did she know?",
            "Old ones with too many verses. She forgot half the words and made up remarkably cheerful disasters to fill the gaps."
          ],
          [
            "I wish I remembered her voice.",
            "So do I, love. I can sing you what I remember, when you'd like that."
          ]
        ]
      },
      {
        "title": "A memory of Dad",
        "opening": "What was Dad like when he wasn't being sensible?",
        "first": "Your father once spent an entire afternoon helping a neighbour find a lost goose. It had been following him for the last hour.",
        "replies": [
          [
            "How did he miss it?",
            "He kept looking into bushes. The goose kept stopping when he stopped."
          ],
          [
            "Did Mum tease him?",
            "She asked whether he'd checked behind himself for any other livestock. He laughed until he couldn't explain the story."
          ],
          [
            "Was he always that helpful?",
            "Usually. Occasionally I had to remind him that his own supper was getting cold."
          ]
        ]
      },
      {
        "title": "Bringing me home",
        "opening": "Do you remember the first night you brought me home?",
        "first": "The first night you stayed with me, you cried whenever I put you down. I ate my supper standing up with you against my shoulder.",
        "replies": [
          [
            "Did I ever let you sleep?",
            "Eventually. I was so surprised I stayed awake listening to make sure you were all right."
          ],
          [
            "Were you frightened?",
            "Terrified. I'd lost so much, and suddenly there was someone who needed me every minute."
          ],
          [
            "I'm glad it was you.",
            "Oh, love. So am I. Even after the years when you hid beetles in the flour bin."
          ]
        ]
      },
      {
        "title": "Your own adventures",
        "opening": "Did you ever sneak off on an adventure?",
        "first": "I went to a dance in Thornwell once without telling my mother. I thought I'd be home before she noticed.",
        "replies": [
          [
            "Did you make it?",
            "I found her there. She was having a splendid time."
          ],
          [
            "Was she angry?",
            "She said I might have offered her a place on the cart. That was worse than a lecture."
          ],
          [
            "Were you a good dancer?",
            "Very. Don't look astonished, Corin. I wasn't born holding a soup spoon."
          ]
        ]
      },
      {
        "title": "Leaving home",
        "opening": "Is it hard watching me leave?",
        "first": "I want you home. I also know why you go. Both things are true, and you needn't fix that for me.",
        "replies": [
          [
            "I feel guilty when I enjoy being away.",
            "Please don't. Tell me about the good parts. I'd like to picture those too."
          ],
          [
            "What if I come back different?",
            "Then I'll get to know those parts of you. You haven't stopped changing since the day I brought you here."
          ],
          [
            "I miss the ordinary mornings.",
            "Your cup is still your cup. We'll have another ordinary morning when you're back."
          ]
        ]
      }
    ],
    "greetings": [
      "Come in, love. I've had quite enough conversation with the cooking pot.",
      "Was it disagreeing with you?",
      "Corin! Let me have a look at you before you start telling me you're fine.",
      "All right. Then I get to ask how you are.",
      "Oh, sweetheart. You really have brought a dragon home.",
      "I wanted you to meet him before anyone else told you about him."
    ]
  },
  "Winnie": {
    "name": "Winnie",
    "home": "Millwood",
    "role": "Nan's old friend",
    "source": "01-millwood.txt:30",
    "topics": [
      {
        "title": "Nan's competitive streak",
        "opening": "Has Nan always been this competitive?",
        "first": "Nan once entered a cake contest under a false name because she'd promised not to enter again.",
        "replies": [
          [
            "Why had she promised?",
            "She'd won three years running. People wanted a chance."
          ],
          [
            "Did anyone recognise her cake?",
            "Everyone. She uses enough spice to announce herself before the judging begins."
          ],
          [
            "Did you tell on her?",
            "I helped her choose the name. I am not a reliable witness."
          ]
        ]
      },
      {
        "title": "An evening with friends",
        "opening": "What do you and your friends do of an evening?",
        "first": "We used to take turns hosting suppers. The host cooked, and everyone else pretended not to notice the burnt parts.",
        "replies": [
          [
            "Was there much pretending?",
            "With me, yes. I was more interested in the company than in watching a pan."
          ],
          [
            "Why take turns?",
            "Otherwise the person with the biggest table ended up doing all the work."
          ],
          [
            "Do you still do it?",
            "Less often. I should invite Nan again before we both decide we're too busy for an evening."
          ]
        ]
      },
      {
        "title": "Growing older together",
        "opening": "What changes when you've known someone for years?",
        "first": "Your grandmother remembers the versions of me that everyone else has forgotten. Including several I'd prefer she forgot.",
        "replies": [
          [
            "Does that annoy you?",
            "Sometimes. Then she'll mention something I thought nobody had noticed, and I'm glad."
          ],
          [
            "What did she notice?",
            "That I stopped coming to supper after my husband died. She started bringing supper to me."
          ],
          [
            "I'm glad she had you too.",
            "She did. People tell her she's strong as though strength means never needing a neighbour."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin, you can stop hovering. Nan isn't the only person you're allowed to visit.",
      "I wasn't sure whether you wanted company.",
      "Back again? I'm beginning to feel fashionable.",
      "Don't tell Nan I said yours was the quieter house.",
      "So Nan wasn't exaggerating about your new companion.",
      "No. The wings are as large as she said."
    ]
  },
  "Ned": {
    "name": "Ned",
    "home": "Millwood",
    "role": "Leatherworker",
    "source": "01-millwood.txt:35",
    "topics": [
      {
        "title": "A failed bargain",
        "opening": "Have you ever come out badly in a bargain?",
        "first": "I bought cheap leather once. Finished six belts before the first buckle tore through. I had to find all six customers.",
        "replies": [
          [
            "Did you repay them?",
            "Replaced the belts. It cost more than the good leather would have."
          ],
          [
            "Were they angry?",
            "One was. His trousers had fallen during a speech. I could hardly argue."
          ],
          [
            "Why did you buy it?",
            "Wanted a bigger profit. I'd like a nobler answer, but that's the one."
          ]
        ]
      },
      {
        "title": "My father's hands",
        "opening": "Was my father good at making things?",
        "first": "Your father was good at delicate work. Huge hands, but he could pass a needle through a hole I'd missed twice.",
        "replies": [
          [
            "Did he teach you anything?",
            "To stop gripping so hard. I was wearing my hands out trying to look capable."
          ],
          [
            "Did he make things for Mum?",
            "A little leather case for her sewing needles. He asked me to check every stitch."
          ],
          [
            "Did they argue much?",
            "Enough to be married. Usually about him agreeing to help three people on the same afternoon."
          ]
        ]
      },
      {
        "title": "The repair you refused",
        "opening": "Have you ever refused a repair?",
        "first": "Someone asked me to mend a rotten harness. I told him a patch wouldn't make the rest safe. He called me lazy.",
        "replies": [
          [
            "Did he come back?",
            "With the broken harness, yes. Fortunately the horse hadn't been hurt."
          ],
          [
            "How can you tell leather's gone bad?",
            "Bend it gently. Deep cracks mean trouble. Don't mistake a shiny surface for strength."
          ],
          [
            "Would you refuse a friend too?",
            "Especially a friend. I'd rather endure an argument than see them injured by my work."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin. If you're here about a broken strap, begin with what you were carrying.",
      "For once, nothing needs repairing.",
      "Your boots have brought you back, then.",
      "They deserve a rest as much as I do.",
      "That's a very unusual travelling companion. Does he mind strangers?",
      "Give him a little room. He's still getting used to people."
    ]
  },
  "Joss": {
    "name": "Joss",
    "home": "Millwood",
    "role": "Apple grower and cider maker",
    "source": "01-millwood.txt:40",
    "topics": [
      {
        "title": "Moving to Millwood",
        "opening": "What brought you to Millwood?",
        "first": "I came from Thornwell for one harvest. Tam hired me for a week and corrected my work every day.",
        "replies": [
          [
            "Did you resent it?",
            "At first. Then I noticed how much better the fruit survived handling."
          ],
          [
            "When did you decide to stay?",
            "When I started saying 'our trees' without thinking about it."
          ],
          [
            "Did Tam ask you to stay?",
            "She asked what work I'd planned for the following spring. Subtle woman."
          ]
        ]
      },
      {
        "title": "The first cider",
        "opening": "How did your first batch of cider turn out?",
        "first": "Our first batch tasted so sour that Tam suggested cleaning the press with it. I insisted it needed time.",
        "replies": [
          [
            "Did time help?",
            "It became older sour cider. I finally admitted the apples had been wrong."
          ],
          [
            "What did you change?",
            "We tried small batches and kept notes. Fewer heroic speeches, more tasting."
          ],
          [
            "Does Tam still remind you?",
            "Only when I say I'm certain about something. So, regularly."
          ]
        ]
      },
      {
        "title": "Being a father",
        "opening": "What surprised you about being a father?",
        "first": "Our children ask why things work. I answer until I reach a question I don't know, then they look delighted.",
        "replies": [
          [
            "Do they try to catch you out?",
            "Absolutely. It's become a household sport."
          ],
          [
            "What do you do when you're wrong?",
            "Admit it before Tam gets there. She enjoys a good correction too."
          ],
          [
            "Do you like all the questions?",
            "Most of them. 'Why can't we have cake before supper?' has exhausted its possibilities."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello, Corin. Tam says I need a conversation that isn't about apples.",
      "I'm willing to try. No promises.",
      "A visitor! That gives me an excuse to stop calculating the harvest.",
      "We could discuss something less round.",
      "A dragon. Well, that should finally distract me from the orchard.",
      "I'm glad he's useful before he's even said hello."
    ]
  },
  "Tam": {
    "name": "Tam",
    "home": "Millwood",
    "role": "Apple grower and mother",
    "source": "01-millwood.txt:45",
    "topics": [
      {
        "title": "The children's harvest",
        "opening": "Do the children help with the harvest?",
        "first": "We let the children choose names for three apple trees. We now harvest from Lady Crunch, Boots, and Uncle Ned.",
        "replies": [
          [
            "Does Ned know?",
            "He receives apples from his namesake every autumn. He's taken it very seriously."
          ],
          [
            "Why name them?",
            "It helped the children remember which fruit was ready first. Boots remains a mystery to me."
          ],
          [
            "Who chose Lady Crunch?",
            "Joss. He joined in before remembering he'd called the idea silly."
          ]
        ]
      },
      {
        "title": "A useful disagreement",
        "opening": "Can a disagreement ever make the work better?",
        "first": "Joss likes to start a job immediately. I like to check whether we've promised the same afternoon to someone else.",
        "replies": [
          [
            "Who usually wins?",
            "The person holding the calendar. Which is why I keep it."
          ],
          [
            "Does he mind?",
            "Only until he discovers I'd left him time for lunch."
          ],
          [
            "Are you ever the impatient one?",
            "When I want something, certainly. Marriage doesn't make you permanently sensible."
          ]
        ]
      },
      {
        "title": "Food for Nan",
        "opening": "Do you and Nan exchange food?",
        "first": "I send Nan apple preserves, and she sends the jars back with something in them. We've been exchanging the same jars for years.",
        "replies": [
          [
            "Who started it?",
            "I've forgotten. Neither of us will let the other call it a debt."
          ],
          [
            "What's the best thing she's sent?",
            "A plum cake when I had a miserable cold. I could barely taste it, but I remember the trouble she took."
          ],
          [
            "She likes looking after people.",
            "She does. It's useful to occasionally catch her accepting the same treatment."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin, tell me you've come to talk about something besides Joss's cider.",
      "I can offer news with fewer tasting notes.",
      "Come and keep me company. I've been outnumbered by opinions today.",
      "Whose opinion was loudest?",
      "Joss told me about the dragon. He left out how hard it would be to stop staring.",
      "That's all right. I stared for quite a while myself."
    ]
  },
  "Tilda": {
    "name": "Tilda",
    "home": "Millwood",
    "role": "Spinner and knitter",
    "source": "01-millwood.txt:50",
    "topics": [
      {
        "title": "The uneven sleeves",
        "opening": "Have you ever finished something and found it didn't fit?",
        "first": "My first jumper had one sleeve longer than the other. I told my sister she'd been standing crookedly.",
        "replies": [
          [
            "Did she believe you?",
            "She put it on backwards to test the theory. I had to undo the sleeve."
          ],
          [
            "Did you finish it properly?",
            "Yes. She wore it until both elbows went. A kinder verdict than I deserved."
          ],
          [
            "Would you teach someone now?",
            "I do, and I show them my mistakes. It keeps them from hiding theirs."
          ]
        ]
      },
      {
        "title": "Wool in spring",
        "opening": "What do you do with the spring wool?",
        "first": "Everyone thinks winter is my busiest season. In spring I wash wool, sort it, and prepare for winter all over again.",
        "replies": [
          [
            "Does it ever feel finished?",
            "For about three days a year. I guard those days fiercely."
          ],
          [
            "What's the least pleasant part?",
            "Picking burrs out. Whoever invented sheep left room for improvement."
          ],
          [
            "What's the best part?",
            "Spinning a thread that stays even. I can feel when it's going well before I look."
          ]
        ]
      },
      {
        "title": "Choosing a colour",
        "opening": "How do you settle on a colour?",
        "first": "I spent years making sensible brown things. Then I made myself a bright blue scarf and wore it everywhere.",
        "replies": [
          [
            "Did people comment?",
            "They asked who I'd made it for. Apparently I wasn't an obvious candidate for a present."
          ],
          [
            "Why blue?",
            "Because I liked it. It was surprisingly difficult to let that be enough."
          ],
          [
            "Do you still wear it?",
            "Whenever it's cold enough. I don't intend to develop a dignified preference for brown again."
          ]
        ]
      }
    ],
    "greetings": [
      "I'm Tilda. If you hear me counting, wait until I lose my place. It won't be long.",
      "I'm Corin. I can try not to make it worse.",
      "Corin! I reached the end of the row this time.",
      "Then I'm less dangerous than I was.",
      "Those wings will make an ordinary knitting project seem very small.",
      "This is Aurelius. He'll leave the wool to you."
    ]
  },
  "Emmet": {
    "name": "Emmet",
    "home": "Millwood",
    "role": "Orchard worker",
    "source": "01-millwood.txt:55",
    "topics": [
      {
        "title": "The hidden apple",
        "opening": "Have you ever hidden an apple for later?",
        "first": "As a boy I hid the best apple behind a shed so my brothers wouldn't find it. When I returned, the wasps had claimed it.",
        "replies": [
          [
            "Did you get any of it?",
            "A very disappointing bite. I'd protected it from everyone I might have shared it with."
          ],
          [
            "Did your brothers find out?",
            "They saw me running from the wasps. I supplied the explanation later."
          ],
          [
            "Do you still choose the best one?",
            "Naturally. I eat it immediately now. Wisdom has its limits."
          ]
        ]
      },
      {
        "title": "A tree with two crops",
        "opening": "Can one tree really give you two kinds of crop?",
        "first": "People are surprised you can graft one apple variety onto another. They expect trees to object to the arrangement.",
        "replies": [
          [
            "How do you make it work?",
            "Fit the cut surfaces closely and protect the join. It takes care, and sometimes it fails."
          ],
          [
            "Have you tried it?",
            "Many times. The first successes felt rather like getting away with something."
          ],
          [
            "Could one tree grow every kind?",
            "I wouldn't try. It's easier to care for a tree than to win an argument with it."
          ]
        ]
      },
      {
        "title": "A neighbour's ladder",
        "opening": "Do you lend your tools to the neighbours?",
        "first": "I borrowed a neighbour's ladder for an afternoon. Kept it so long he asked if he might borrow mine.",
        "replies": [
          [
            "That got your attention?",
            "More effectively than shouting. I carried it back before he finished the sentence."
          ],
          [
            "Did you offer him anything?",
            "An apology and the first basket of fruit. He accepted both without mentioning the ladder again."
          ],
          [
            "Do you lend things yourself?",
            "Yes. I write down who has them. Memory becomes wonderfully generous around borrowed tools."
          ]
        ]
      }
    ],
    "greetings": [
      "Emmet. You look like someone who could settle a serious question about pies.",
      "Corin. I'll need to hear the question before volunteering.",
      "I've been thinking about our last conversation instead of pruning.",
      "I hope I haven't endangered the apples.",
      "Is he interested in fruit, or should I keep my fingers back?",
      "His name's Aurelius. Let's introduce you before offering food."
    ]
  },
  "Lark": {
    "name": "Lark",
    "home": "Millwood",
    "role": "Baker",
    "source": "01-millwood.txt:60",
    "topics": [
      {
        "title": "Bread before dawn",
        "opening": "How early do you have to get up to bake?",
        "first": "The hardest part of baking early is being hungry while everything still needs another quarter of an hour.",
        "replies": [
          [
            "Do you steal a little dough?",
            "No. I eat yesterday's bread and resent today's bread until it's ready."
          ],
          [
            "Why start so early?",
            "People want breakfast before their work. Mine has to happen before theirs."
          ],
          [
            "Do you like the quiet?",
            "Very much. Then a customer arrives and tells me how peaceful my life must be."
          ]
        ]
      },
      {
        "title": "The disastrous cake",
        "opening": "What's the worst thing you've baked?",
        "first": "I once iced a cake while it was warm. The decoration slid off in a magnificent white heap.",
        "replies": [
          [
            "What did you do?",
            "Cut it into pieces and served it in bowls. Everyone called it a lovely pudding."
          ],
          [
            "Did you confess?",
            "After they liked it. Timing matters in confession as well as baking."
          ],
          [
            "Would you make it again?",
            "On purpose, yes. Preferably without the first hour of panic."
          ]
        ]
      },
      {
        "title": "A recipe from home",
        "opening": "Is there a recipe that reminds you of home?",
        "first": "Nan taught me a loaf she measures mostly by touch. Writing it down was an argument between my pencil and her hands.",
        "replies": [
          [
            "Could you copy it?",
            "Eventually. 'Enough flour' became a number only after I weighed what she used."
          ],
          [
            "Does it taste the same?",
            "Nearly. She says mine is better. I think she's being generous."
          ],
          [
            "Would she like hearing that?",
            "She has heard it often enough to change the subject. You might have better luck."
          ]
        ]
      }
    ],
    "greetings": [
      "Lark. Yes, like the bird. Less cheerful before sunrise, though.",
      "Corin. I'll remember to visit after breakfast.",
      "You're back. Tell me something from outside the kitchen for once.",
      "Gladly. I've smelled enough bread to become distracted.",
      "A dragon! I'd ask whether he likes baking, but that sounds like volunteering my oven.",
      "I'm Corin, and this is Aurelius. We only came to say hello."
    ]
  },
  "Hal": {
    "name": "Hal",
    "home": "Millwood",
    "role": "Retired miller",
    "source": "01-millwood.txt:65",
    "topics": [
      {
        "title": "The mill's sound",
        "opening": "Can you tell whether the mill is working by its sound?",
        "first": "I could tell when a bearing needed attention from the sound across the yard. At home I still listen for it.",
        "replies": [
          [
            "Does that make it hard to retire?",
            "It made the first month difficult. I visited so often they gave me a chair and no tools."
          ],
          [
            "What happened if you ignored it?",
            "Heat, wear, and eventually a very expensive stoppage. Machines complain before they give up."
          ],
          [
            "Do you miss knowing every sound?",
            "Yes. I don't miss waking in the night to worry about one."
          ]
        ]
      },
      {
        "title": "A flooded morning",
        "opening": "Has the river ever flooded the mill?",
        "first": "After a heavy rain, I arrived to find a duck inside the mill. It looked thoroughly offended by the accommodation.",
        "replies": [
          [
            "How did it get in?",
            "Through an opening I'd promised to repair. The duck had inspected it more promptly."
          ],
          [
            "Did you catch it?",
            "It walked out when I stopped chasing it. I learned very little dignity that morning."
          ],
          [
            "Did you repair the opening?",
            "Before lunch. Nothing motivates maintenance like an audience of amused neighbours."
          ]
        ]
      },
      {
        "title": "Your unplanned afternoon",
        "opening": "What do you do with an afternoon you haven't planned?",
        "first": "I used to schedule every hour. Now I sometimes walk to the river without deciding when to return.",
        "replies": [
          [
            "Doesn't that feel strange?",
            "It did. I kept inventing reasons the walk was useful. Eventually I just went."
          ],
          [
            "What do you watch?",
            "Water, birds, people hurrying. The people are especially educational."
          ],
          [
            "Would you go back to work?",
            "For an emergency. Not because I feel guilty about a pleasant afternoon."
          ]
        ]
      }
    ],
    "greetings": [
      "Hal. Used to work the mill. Now I inspect the village at a more reasonable pace.",
      "Corin. Does the village pass?",
      "You caught me enjoying retirement. Don't tell anyone; they'll suggest a job.",
      "Your secret is safe for this conversation.",
      "I've seen some unusual loads arrive at the mill, but never on wings.",
      "Aurelius is travelling with me. No grain delivery today."
    ]
  },
  "Edwin": {
    "name": "Edwin",
    "home": "Millwood",
    "role": "Poultry keeper",
    "source": "01-millwood.txt:70",
    "topics": [
      {
        "title": "The missing egg",
        "opening": "Do eggs ever go missing from the coop?",
        "first": "A hen started laying in my spare boot. I found three eggs before I realised why that boot had become so popular.",
        "replies": [
          [
            "Did you move her nest?",
            "Gave her a proper box in a sheltered spot. She returned to the boot twice before accepting promotion."
          ],
          [
            "How did you discover it?",
            "Very cautiously, fortunately. I'd felt something round with my toe."
          ],
          [
            "Do you still leave boots outside?",
            "Only if I'm willing to lend them to poultry."
          ]
        ]
      },
      {
        "title": "Keeping watch",
        "opening": "What do you watch for around the farm?",
        "first": "People think watching chickens is dull. Then a fox begins coming near the fence and every small change matters.",
        "replies": [
          [
            "What do you look for?",
            "Birds bunching together, alarm calls, disturbed earth. I check the flock before guessing why."
          ],
          [
            "Have you lost any?",
            "Yes. I learned to repair the weak part of a fence before waiting for proof."
          ],
          [
            "Do the hens recognise you?",
            "They recognise my footsteps. I flatter myself it's affection; the grain bucket may contribute."
          ]
        ]
      },
      {
        "title": "A quieter ambition",
        "opening": "Is there something you'd like to do beyond the farm?",
        "first": "I'd like to learn to draw birds. Every time I try, the subject turns its back on me.",
        "replies": [
          [
            "Could you draw from memory?",
            "I do. The results suggest I've never seen a chicken."
          ],
          [
            "Why birds?",
            "I spend my days noticing them. I'd like to keep some of what I notice."
          ],
          [
            "Will you keep trying?",
            "Certainly. Eventually either I'll improve or a hen will sit still."
          ]
        ]
      }
    ],
    "greetings": [
      "Edwin. Mind the hens if you pass the coop. They're convinced every visitor brings supper.",
      "I'm Corin. I don't want to disappoint them.",
      "Corin, you arrived between feeding times. The hens may let us speak.",
      "I'll try not to sound like grain.",
      "Your dragon has their full attention. That's almost a holiday for me.",
      "Aurelius and I will give the flock some room."
    ]
  },
  "Tolan": {
    "name": "Tolan",
    "home": "Millwood",
    "role": "Village guard",
    "source": "01-millwood.txt:75",
    "topics": [
      {
        "title": "The first patrol",
        "opening": "Do you remember your first patrol?",
        "first": "On my first patrol I rehearsed what to say to a suspicious stranger. The first stranger asked where to buy bread.",
        "replies": [
          [
            "Were you able to help?",
            "I sent him the wrong way. I'd memorised the gates and forgotten the baker."
          ],
          [
            "What did your serjeant say?",
            "That local knowledge included breakfast. He made me walk every lane the next day."
          ],
          [
            "Did you get more confident?",
            "Slowly. Being useful helped more than looking stern."
          ]
        ]
      },
      {
        "title": "Why a steady wage mattered",
        "opening": "What made you join the guard?",
        "first": "My sister needed boots the winter I enlisted. We had food, but never quite enough money for the thing that broke next.",
        "replies": [
          [
            "Did the wage help?",
            "Yes. I sent most of the first one home. She wore those boots for years."
          ],
          [
            "Did you want to be a guard?",
            "I wanted my family warm. I found reasons to care about the work afterward."
          ],
          [
            "Do they worry about you?",
            "Of course. I leave the dull parts out of letters, then regret making the job sound exciting."
          ]
        ]
      },
      {
        "title": "An order you questioned",
        "opening": "Have you ever questioned an order?",
        "first": "An officer wanted a man held because he looked nervous. I asked what he'd done. The officer disliked the question.",
        "replies": [
          [
            "Was the man released?",
            "Eventually. He'd been frightened of the uniform. Holding him wouldn't have improved that."
          ],
          [
            "Did you get punished?",
            "An unpleasant shift and a lecture. It could have been worse."
          ],
          [
            "Would you ask again?",
            "Yes. But I won't pretend every guard has the same room to risk it."
          ]
        ]
      }
    ],
    "greetings": [
      "Tolan. You can speak plainly; I'm off the official questions for a moment.",
      "Corin. That's a relief.",
      "Corin. It's good to have someone approach without needing me to settle a quarrel.",
      "I'll try to keep this peaceful.",
      "A dragon beside you. I need a moment to decide what face to make.",
      "A friendly one would help. He's with me."
    ]
  },
  "Pip": {
    "name": "Pip",
    "home": "Sporehollow",
    "role": "Mushroom villager",
    "source": "02-shrooms-roads.txt:1",
    "topics": [
      {
        "title": "Hearing rain",
        "opening": "Does the rain sound different to you?",
        "first": "Rain sounds different under every cap. I like the little drops best. The heavy ones make me sneeze.",
        "replies": [
          [
            "Can you tell rain is coming?",
            "Sometimes the ground feels it before the drops reach me. Then Bolete says he already knew."
          ],
          [
            "Do you hide from it?",
            "Only when it gets too loud. You hide from thunder, don't you?"
          ],
          [
            "Can you hear snow?",
            "Not falling. That's what makes it odd. The whole wood changes without telling me."
          ]
        ]
      },
      {
        "title": "A human game",
        "opening": "Have you tried any human games?",
        "first": "A child taught me hide-and-seek. I was very good at hiding until I laughed.",
        "replies": [
          [
            "What made you laugh?",
            "He asked a perfectly ordinary mushroom where I'd gone."
          ],
          [
            "Did he find you?",
            "Yes. I tried to tell him all mushrooms laugh. He wanted another one to prove it."
          ],
          [
            "Would you play again?",
            "If the seeker doesn't pick anyone up. Some humans need that rule explained."
          ]
        ]
      },
      {
        "title": "What counts as tall",
        "opening": "Do I seem tall to you?",
        "first": "I thought humans stopped growing when they could see over grass. Then I met one taller than you.",
        "replies": [
          [
            "Adults can get taller still.",
            "How inconvenient. Do they keep needing larger doors?"
          ],
          [
            "Are you finished growing?",
            "Mostly. My cap will widen. I have plans for an excellent shadow."
          ],
          [
            "Do you want to be taller?",
            "Only long enough to see what the beetles are looking at on the high branches."
          ]
        ]
      }
    ],
    "greetings": [
      "Wait! Say something again. Your voice sounds different from your footsteps.",
      "I'm Corin. I didn't know my footsteps had introduced me.",
      "I knew that quick step was you.",
      "Should I try arriving more mysteriously?",
      "That one's footsteps are enormous. Is it going to stand there?",
      "That's Aurelius. I'll ask him to be careful."
    ]
  },
  "Mycella": {
    "name": "Mycella",
    "home": "Sporehollow",
    "role": "Keeper of the hollow's memories",
    "source": "02-shrooms-roads.txt:6",
    "topics": [
      {
        "title": "Remembering a drought",
        "opening": "How did the hollow manage during the drought?",
        "first": "One summer the streams shrank to threads. We carried wet leaves to the youngest growth every evening.",
        "replies": [
          [
            "Did everyone survive?",
            "No. We remember that summer because we lost people, not because we overcame it neatly."
          ],
          [
            "Could you have moved?",
            "Some did. The smallest could not travel far. Those of us who stayed shared the water."
          ],
          [
            "What changed afterward?",
            "We learned which hollows held moisture longest. We teach that before the old songs now."
          ]
        ]
      },
      {
        "title": "A human who listened",
        "opening": "Have humans ever stopped to listen to you?",
        "first": "A traveller once sat with me for three evenings without asking how old I was. I found that very refreshing.",
        "replies": [
          [
            "What did he ask instead?",
            "Which bird kept waking me. He was having the same difficulty."
          ],
          [
            "How old are you?",
            "Old enough to notice you waited one whole question."
          ],
          [
            "Did he return?",
            "Several times. Then his daughter came. I recognised the way she tipped her head to listen."
          ]
        ]
      },
      {
        "title": "The old dragon shadows",
        "opening": "Do you remember seeing dragons overhead?",
        "first": "I remember the shade of passing wings before I remember faces. A dragon could cross the sunlight and make the whole hollow look up.",
        "replies": [
          [
            "Did they land here?",
            "Some did, in clear ground. They learned to approach slowly; we learned not to crowd their feet."
          ],
          [
            "Were you frightened of them?",
            "Of the first, yes. Familiarity came from meetings, not from being told there was nothing to fear."
          ],
          [
            "Did they speak to you?",
            "Not as humans speak. The riders helped us understand. I remember particular kindnesses better than any grand speech."
          ]
        ]
      }
    ],
    "greetings": [
      "A visitor with questions. I am Mycella. Take your time choosing the first.",
      "Corin. I have rather a lot to choose from.",
      "You have found your way back to us.",
      "I wanted to hear something I missed before.",
      "Wings over the hollow again. I hoped to live long enough to see that.",
      "His name is Aurelius. We're still learning about one another."
    ]
  },
  "Bolete": {
    "name": "Bolete",
    "home": "Sporehollow",
    "role": "Path tender",
    "source": "02-shrooms-roads.txt:11",
    "topics": [
      {
        "title": "Roots across the path",
        "opening": "What do you do when roots grow across the path?",
        "first": "A root I cut back kept returning under the same stepping place. Finally I moved the path a little.",
        "replies": [
          [
            "Did that solve it?",
            "For now. We each have room to continue being stubborn."
          ],
          [
            "Why not cut it again?",
            "I could have. I was tired of fighting the same root every morning."
          ],
          [
            "Do all paths change like that?",
            "Slowly. A fallen tree, a wet patch, new growth. A path is a suggestion we keep repairing."
          ]
        ]
      },
      {
        "title": "A visitor in a hurry",
        "opening": "Do hurried visitors cause trouble here?",
        "first": "Someone once told me the hollow needed straight paths. He drew one directly through a patch of young shoots.",
        "replies": [
          [
            "Did he know what they were?",
            "Not until I explained. He put the drawing away very quickly."
          ],
          [
            "Was he trying to help?",
            "Yes. That's why I explained before becoming thoroughly annoyed."
          ],
          [
            "Would a straight path be easier?",
            "For him, briefly. Much less convenient for those of us growing in it."
          ]
        ]
      },
      {
        "title": "Work after rain",
        "opening": "Does the rain leave you much work?",
        "first": "After rain I check where water has carried loose soil away. People notice mud sooner than they notice a hollow beneath it.",
        "replies": [
          [
            "Can I help?",
            "By following the firm path. More feet in a soft patch make more work."
          ],
          [
            "How do you repair it?",
            "Small stones, packed earth, and time to settle. Nothing particularly impressive to watch."
          ],
          [
            "Do you enjoy the work?",
            "I like seeing people pass safely. I would enjoy it even more if fewer of them called it effortless."
          ]
        ]
      }
    ],
    "greetings": [
      "Stay on the clear ground, please. I'm Bolete; I spend rather a lot of time making it clear.",
      "I'm Corin. I'll watch where I step.",
      "You remembered the path. I appreciate an observant visitor.",
      "I've had good instructions.",
      "Those claws need a wider turning space than boots.",
      "I'll keep Aurelius away from the young growth."
    ]
  },
  "Truffle": {
    "name": "Truffle",
    "home": "Sporehollow",
    "role": "Tender of young growth",
    "source": "02-shrooms-roads.txt:16",
    "topics": [
      {
        "title": "A name that stuck",
        "opening": "How did you get your name?",
        "first": "They call me Truffle because I spent my first season refusing to come out of the soil. I wanted another week.",
        "replies": [
          [
            "Was it frightening above ground?",
            "Bright. Noisy. Far too much sky. I liked the rain better."
          ],
          [
            "Do you mind the name?",
            "No. It reminds people that shy youngsters sometimes become quite talkative."
          ],
          [
            "What made you come out?",
            "Someone described the moon. I had to see whether a thing that improbable was real."
          ]
        ]
      },
      {
        "title": "Teaching the youngest",
        "opening": "What do you teach the youngest mushrooms?",
        "first": "The young ones keep asking whether a falling leaf is alive. I spend autumn explaining the difference between a leaf and a beetle.",
        "replies": [
          [
            "Is that difficult?",
            "When the beetle is hiding under the leaf, remarkably."
          ],
          [
            "Do you get tired of the question?",
            "I get tired. The question remains reasonable."
          ],
          [
            "How do you explain it?",
            "We watch what happens. A beetle will eventually disagree with being called a leaf."
          ]
        ]
      },
      {
        "title": "A small visitor",
        "opening": "Do small creatures visit the hollow too?",
        "first": "A hedgehog used to sleep near my growing patch. I learned its route well enough to leave the crossing clear.",
        "replies": [
          [
            "Did it recognise you?",
            "It stopped curling up when I moved. That was enough of an introduction."
          ],
          [
            "Was it dangerous to the shoots?",
            "It could be clumsy. I guided it around them without expecting it to understand a lecture."
          ],
          [
            "Do you still see it?",
            "Not lately. Wild visitors don't leave forwarding addresses. I hope it found a warm place."
          ]
        ]
      }
    ],
    "greetings": [
      "Truffle. Please ask before touching the little caps. Some are younger than they look.",
      "Corin. I'll keep my hands to myself.",
      "You've come back quietly. The youngsters may stay asleep.",
      "I'll try not to ruin that achievement.",
      "A dragon! That is rather more visitor than I prepared for.",
      "Aurelius can keep back while we talk."
    ]
  },
  "The Shroom King": {
    "name": "The Shroom King",
    "home": "Sporehollow",
    "role": "Speaker for the mushroom ring",
    "source": "02-shrooms-roads.txt:21",
    "topics": [
      {
        "title": "Being called king",
        "opening": "Do you enjoy being called king?",
        "first": "The title makes humans expect commands. My people expect me to remember what everyone has already agreed.",
        "replies": [
          [
            "Can you tell them what to do?",
            "I can try. Bolete would provide a detailed account of why I shouldn't."
          ],
          [
            "Why keep the title?",
            "It saves explaining our entire arrangement to every traveller. Then, admittedly, I explain it anyway."
          ],
          [
            "Is there anything you can decide alone?",
            "When I would like a rest. Whether I get one is another matter."
          ]
        ]
      },
      {
        "title": "An argument about shade",
        "opening": "What do people here argue about?",
        "first": "Two neighbours once spent a season arguing over whose cap shaded the other. Both insisted they were being deprived of sunlight.",
        "replies": [
          [
            "How did you settle it?",
            "We watched the sun move. The shade changed sides. This offended both of them equally."
          ],
          [
            "Did they stop arguing?",
            "About shade, yes. Their next disagreement concerned fallen leaves."
          ],
          [
            "That sounds exhausting.",
            "It was. I took particular pleasure in the next quiet rainfall."
          ]
        ]
      },
      {
        "title": "Gifts and guests",
        "opening": "What makes a good guest in your hollow?",
        "first": "A gift should make a visit easier, not purchase the visitor. I distrust hosts who remember every favour aloud.",
        "replies": [
          [
            "Do people try that here?",
            "Occasionally. Usually they want someone to take their side at the next gathering."
          ],
          [
            "How should I repay kindness?",
            "You can thank someone without becoming their servant. Many guests need to hear that."
          ],
          [
            "What do you want from travellers?",
            "Care with our young, honesty about danger, and news beyond these trees. All quite practical wishes."
          ]
        ]
      },
      {
        "title": "News beyond the hollow",
        "opening": "Does much news reach you from outside?",
        "first": "We learn about humans from the people who arrive. It gives us a rather uneven picture of your kind.",
        "replies": [
          [
            "What have you concluded?",
            "That all of you are either lost, hungry, or absolutely certain you're going the right way."
          ],
          [
            "That sounds fair.",
            "I suspected so. You are welcome to improve the sample."
          ],
          [
            "What news would you like?",
            "How people live when nothing remarkable is happening. Travellers often forget to mention that part."
          ]
        ]
      }
    ],
    "greetings": [
      "Welcome, Corin. You may speak before anyone decides this needs a ceremony.",
      "I'd be grateful for that.",
      "A familiar visitor. Excellent; we can omit several formalities.",
      "How many are left?",
      "A dragon in our hollow. The ring will have questions for years.",
      "I'll begin with his name. This is Aurelius."
    ]
  },
  "Cap": {
    "name": "Cap",
    "home": "Sporehollow",
    "role": "Grower and storekeeper",
    "source": "02-shrooms-roads.txt:27",
    "topics": [
      {
        "title": "Winter stores",
        "opening": "How do you keep enough food for winter?",
        "first": "We store food in several places. One damp cellar going bad is trouble; our entire winter going bad would be disaster.",
        "replies": [
          [
            "Who checks the stores?",
            "We take turns. I dislike waiting until something smells wrong."
          ],
          [
            "Do you ever miscount?",
            "Ilsa checks my numbers. I return the favour by pretending I enjoy being corrected."
          ],
          [
            "Is winter difficult here?",
            "Growth slows and the ground hardens. We manage because the preparations began long before the cold."
          ]
        ]
      },
      {
        "title": "An adventurous recipe",
        "opening": "Have you ever tried a recipe you regretted?",
        "first": "I once added something new to supper without telling Ilsa. She noticed before the first bite.",
        "replies": [
          [
            "Was it the smell?",
            "The colour. I had made a meal of an alarming blue."
          ],
          [
            "Did you eat it?",
            "It was edible. That is the most generous review I can honestly offer."
          ],
          [
            "Would you experiment again?",
            "Certainly. In a smaller pot, and with advance warning."
          ]
        ]
      },
      {
        "title": "Living with Ilsa",
        "opening": "What's it like sharing a home with Ilsa?",
        "first": "Ilsa remembers who likes what. I remember how much we have. Together we produce a respectable supper.",
        "replies": [
          [
            "What happens when you disagree?",
            "We make separate portions. Not every household dispute needs a winner."
          ],
          [
            "Do you have many visitors?",
            "Enough that I keep a little extra. I still complain when we run short."
          ],
          [
            "Does she mind the complaining?",
            "She says she'd worry if I stopped. I try to keep it interesting for her."
          ]
        ]
      }
    ],
    "greetings": [
      "Cap. Yes, just Cap. We have complicated names too, if that disappoints you.",
      "I'm Corin. A short name seems useful.",
      "Back to our damp corner of the world?",
      "It's a pleasant change from the road.",
      "Your friend carries quite a bit of warmth with him.",
      "That's Aurelius. Let us know if we're crowding you."
    ]
  },
  "Ilsa": {
    "name": "Ilsa",
    "home": "Sporehollow",
    "role": "Grower and teacher",
    "source": "02-shrooms-roads.txt:32",
    "topics": [
      {
        "title": "A human breakfast",
        "opening": "Have you ever tried a human breakfast?",
        "first": "Do humans really eat food before they're fully awake? That seems a dangerous time to make decisions about chewing.",
        "replies": [
          [
            "Some of us need breakfast to wake up.",
            "So the first mouthful is an act of faith. Fascinating."
          ],
          [
            "Is it different for you?",
            "We take our time. You seem determined to swallow a morning and leave it behind."
          ],
          [
            "Nan would agree with you.",
            "Then I'd like her. Breakfast sounds better with someone enforcing a pause."
          ]
        ]
      },
      {
        "title": "Teaching patience",
        "opening": "How do you teach somebody to be patient?",
        "first": "I once told the young ones to watch a shoot grow. They complained that it wasn't doing anything. Then I went away and missed it opening.",
        "replies": [
          [
            "Did they tease you?",
            "Mercilessly. It was a successful lesson with an unfortunate teacher."
          ],
          [
            "What did you say?",
            "That watching requires being present. They asked whether I intended to try that next time."
          ],
          [
            "Do you still give that lesson?",
            "Yes. They love telling new pupils why I stay until the end."
          ]
        ]
      },
      {
        "title": "Food for company",
        "opening": "What do you cook when you have company?",
        "first": "Cap plans enough for dinner. I plan enough for whoever arrives. We have been disagreeing about portions for years.",
        "replies": [
          [
            "Who is usually right?",
            "Cap when no one visits. Me whenever someone does. We both keep count of our victories."
          ],
          [
            "Do you mind unexpected guests?",
            "I mind guests who announce that feeding them will be no trouble."
          ],
          [
            "I'll remember to ask.",
            "Good. Asking gives the host a chance to tell the truth."
          ]
        ]
      }
    ],
    "greetings": [
      "I'm Ilsa. Have you come to ask how we grow, or may I ask something about humans?",
      "I'm Corin. I'd like to hear your question.",
      "Corin, I thought of another thing to ask you after you left.",
      "I'll try to be a useful human.",
      "That dragon has changed all my questions about human travel.",
      "His name's Aurelius. He's changed mine too."
    ]
  },
  "Mosslet": {
    "name": "Mosslet",
    "home": "Sporehollow",
    "role": "Lookout",
    "source": "02-shrooms-roads.txt:37",
    "topics": [
      {
        "title": "Taking the lookout shift",
        "opening": "How did you become the lookout?",
        "first": "I volunteered to watch the path because I wanted to meet travellers. Then I realised most travellers would simply walk past.",
        "replies": [
          [
            "How do you stop them?",
            "I call out. Loudly. You've experienced the method."
          ],
          [
            "Do you get lonely?",
            "Sometimes. Then several people arrive together and I wish for a quiet hour."
          ],
          [
            "Would you rather stay home?",
            "Some days. I'd like to choose before the rain starts, ideally."
          ]
        ]
      },
      {
        "title": "A beetle's directions",
        "opening": "Can a beetle help you find your way?",
        "first": "I tried following a beetle to see where it lived. After an hour it returned to the same log.",
        "replies": [
          [
            "Did it live there?",
            "Apparently. I had accompanied it on an errand."
          ],
          [
            "Was it annoyed with you?",
            "Hard to say. Beetles have a very fixed expression."
          ],
          [
            "Would you follow another?",
            "Only if I had no plans. They don't respect an observer's schedule."
          ]
        ]
      },
      {
        "title": "Coming back to the hollow",
        "opening": "What do you miss when you're away from the hollow?",
        "first": "After standing beside the road, the hollow sounds crowded. You wouldn't think roots and dripping leaves could make such a fuss.",
        "replies": [
          [
            "Do you prefer it here?",
            "When I'm tired, yes. I recognise the sounds I can ignore."
          ],
          [
            "Do you tell everyone about travellers?",
            "The interesting ones. I leave out anything a visitor asked me to keep private."
          ],
          [
            "Will you tell them about me?",
            "Someone arriving with a dragon is difficult to omit. I'll try to get the details right."
          ]
        ]
      }
    ],
    "greetings": [
      "Over here—careful, you nearly walked past me. I'm Mosslet.",
      "Corin. Sorry; I'm still learning where to look.",
      "Corin! Much easier to get your attention this time.",
      "I've learned to listen for you.",
      "Those wings explain a great deal about the noise I've been hearing.",
      "This dragon is with me. His name is Aurelius."
    ]
  },
  "Weft": {
    "name": "Weft",
    "home": "Thornwell's southern road",
    "role": "Camp farmer",
    "source": "02-shrooms-roads.txt:42",
    "topics": [
      {
        "title": "Spare ground",
        "opening": "Do you leave any of your ground unplanted?",
        "first": "I kept a patch clear for passing carts. Now travellers ask whether I'll clear another. Success seems to involve less grass every year.",
        "replies": [
          [
            "Will you expand it?",
            "Only if I can keep the place decent. I don't want a queue of people regretting stopping."
          ],
          [
            "What makes people choose your camp?",
            "Space, mostly. Families like being able to unpack without performing in front of everyone."
          ],
          [
            "Do they help with the work?",
            "Some do. I remember those people rather fondly."
          ]
        ]
      },
      {
        "title": "A guest who stayed",
        "opening": "Have any travellers stayed longer than they meant to?",
        "first": "A carter hurt his ankle here and stayed a week. He was so bored he repaired three things I'd been avoiding.",
        "replies": [
          [
            "Did you pay him?",
            "Fed him, and knocked the cost off his stay. We argued until both of us felt properly generous."
          ],
          [
            "What had you been avoiding?",
            "A crooked gate, a loose bench, and an admission that I needed help."
          ],
          [
            "Did he come back?",
            "He did. Inspected the gate before saying hello."
          ]
        ]
      },
      {
        "title": "Farming beside a road",
        "opening": "What's it like farming beside a busy road?",
        "first": "People lean over a fence and tell me how they'd grow my crops. None return for the weeding.",
        "replies": [
          [
            "Do you argue with them?",
            "Only if it's a slow day. Otherwise I offer them a hoe."
          ],
          [
            "Has anyone accepted?",
            "Once. She worked twice as fast as I did. I listened to her advice afterward."
          ],
          [
            "Do you like the road being busy?",
            "Yes. I sell more, hear more, and get much better at nodding politely."
          ]
        ]
      }
    ],
    "greetings": [
      "Weft. Farmer, occasional host, and reluctant expert on muddy boots.",
      "Corin. Mine may qualify for your attention.",
      "Another visit, Corin? My camp must have made some impression.",
      "I remembered the person as well as the place.",
      "A dragon would certainly make my camp easier to spot from the road.",
      "Aurelius isn't a signpost, but I'll introduce you."
    ]
  },
  "Cartwright Oswin": {
    "name": "Cartwright Oswin",
    "home": "Western road",
    "role": "Cartwright",
    "source": "02-shrooms-roads.txt:47",
    "topics": [
      {
        "title": "A wheel's wobble",
        "opening": "How do you find what's making a wheel wobble?",
        "first": "A man asked me to straighten his wheel. The wheel was sound; he'd loaded all his stone on one side.",
        "replies": [
          [
            "Did he believe you?",
            "After we unloaded it. Before that, he described my trade to me at length."
          ],
          [
            "Could you have charged for a repair?",
            "Easily. Then he'd still have the same trouble with the next load."
          ],
          [
            "Does that happen often?",
            "Often enough that I look at the load before reaching for tools."
          ]
        ]
      },
      {
        "title": "A father's cart",
        "opening": "Did your father teach you about carts?",
        "first": "My father built carts and tested them himself. I thought that meant a pleasant ride. He made me walk beside him listening for trouble.",
        "replies": [
          [
            "What trouble?",
            "A loose joint, a binding axle, anything that should be quiet and wasn't."
          ],
          [
            "Did you like working with him?",
            "More once I stopped trying to impress him every minute."
          ],
          [
            "Do you build them the same way?",
            "Mostly. He'd complain about my shortcuts, then quietly copy the useful ones."
          ]
        ]
      },
      {
        "title": "An expensive colour",
        "opening": "Can painting a cart really cost that much?",
        "first": "A customer once demanded a red cart because red carts travelled faster. I painted it beautifully and let him enjoy the theory.",
        "replies": [
          [
            "Did you tell him he was wrong?",
            "I told him I charged for paint, not speed. He seemed content."
          ],
          [
            "Was it faster?",
            "He whipped the horse harder. I had words about that."
          ],
          [
            "What colour would you choose?",
            "One that hides mud. I prefer my improvements practical."
          ]
        ]
      }
    ],
    "greetings": [
      "Oswin. If you're in a hurry, I regret to say carts have no sympathy for it.",
      "Corin. I've discovered roads don't either.",
      "Well met, Corin. Another day, another opinion about wheels.",
      "I'll ask before supplying mine.",
      "Wings would solve some of my customers' problems. Create a few others, I expect.",
      "Aurelius still needs somewhere to land."
    ]
  },
  "Miner Marn": {
    "name": "Miner Marn",
    "home": "Forgewick's eastern road",
    "role": "Road crew leader",
    "source": "02-shrooms-roads.txt:52",
    "topics": [
      {
        "title": "A tired crew",
        "opening": "How do you know when the crew needs a rest?",
        "first": "The worst mistakes happen near the end of a shift, when everyone wants one last load finished.",
        "replies": [
          [
            "How do you stop that?",
            "I call the finish before we're exhausted. Then I argue with whoever thinks a deadline changes gravity."
          ],
          [
            "Have you made that mistake?",
            "Yes. A falling load missed Nerik by less than I'd care to measure."
          ],
          [
            "Do the crew listen?",
            "They do now. I'd prefer we had learned without the demonstration."
          ]
        ]
      },
      {
        "title": "The stone animals",
        "opening": "Why do you carve those little stone animals?",
        "first": "I carve animals from waste stone. My first duck looked like a boot, so I carved another and called them a pair.",
        "replies": [
          [
            "Did anyone want them?",
            "My niece. She said they were the finest stone boots she'd seen."
          ],
          [
            "Have you improved?",
            "Enough to make a recognisable badger. I am reluctant to risk a horse."
          ],
          [
            "Why carve after moving stone all day?",
            "This stone stays where I put it, and no foreman asks for six more by sunset."
          ]
        ]
      },
      {
        "title": "Teaching Nerik",
        "opening": "What was Nerik like when you first taught him?",
        "first": "Nerik apologises whenever he asks a question. I keep telling him an apology takes longer than the answer.",
        "replies": [
          [
            "Was someone patient with you?",
            "Eventually. My first foreman thought shouting counted as explanation."
          ],
          [
            "Do you ever lose your temper?",
            "Certainly. Then I have to decide whether the temper helped. It seldom did."
          ],
          [
            "Does he know you trust him?",
            "I give him work that matters. I should probably say it aloud occasionally too."
          ]
        ]
      }
    ],
    "greetings": [
      "Marn. Keep clear of the work until I've told you where it's safe.",
      "Corin. Where would you like me?",
      "Corin. You're welcome to talk; just don't start lifting to be polite.",
      "I'll wait for instructions.",
      "That's quite a helper you've brought. Does he understand a warning shout?",
      "Aurelius understands me. We'll keep clear of the crew."
    ]
  },
  "Miner Nerik": {
    "name": "Miner Nerik",
    "home": "Forgewick's eastern road",
    "role": "Young road worker",
    "source": "02-shrooms-roads.txt:57",
    "topics": [
      {
        "title": "The first wage",
        "opening": "What did you do with your first wages?",
        "first": "I bought my mother a good lamp with my first pay. She said it was too expensive and spent the evening trying it in every room.",
        "replies": [
          [
            "Was she proud?",
            "She didn't stop introducing me to neighbours for a week."
          ],
          [
            "What did you buy yourself?",
            "Socks. The lamp makes a better story."
          ],
          [
            "Do you still send money home?",
            "Some. She insists I keep enough to eat properly, then asks what I ate."
          ]
        ]
      },
      {
        "title": "Asking for help",
        "opening": "Is it difficult asking the other miners for help?",
        "first": "I once carried a load too heavy for me because I didn't want the crew to think I was weak. I slowed everyone down.",
        "replies": [
          [
            "Did Marn notice?",
            "Immediately. He took half and asked whether I'd prefer a useful partner or an admiring audience."
          ],
          [
            "Was that embarrassing?",
            "Very. Less embarrassing than dropping it on someone."
          ],
          [
            "Would you do it differently now?",
            "I'd ask for another pair of hands before mine started shaking."
          ]
        ]
      },
      {
        "title": "After work",
        "opening": "What do you like doing after a shift?",
        "first": "I like lying down somewhere I can't hear stones being moved. It isn't an ambitious hobby.",
        "replies": [
          [
            "It sounds reasonable after a shift.",
            "Thank you. People keep suggesting pursuits that involve further effort."
          ],
          [
            "Do you ever go anywhere?",
            "On a free day. I enjoy a road much more when I'm allowed to walk past the damaged parts."
          ],
          [
            "Will you stay in this trade?",
            "For now. I like the crew. I'm still deciding how much I like the work."
          ]
        ]
      }
    ],
    "greetings": [
      "Nerik. Marn says I can talk and work, but the evidence is still disputed.",
      "Corin. I'll keep the conversation clear of falling stones.",
      "Corin! I recognised you before Marn had to remind me.",
      "A promising start.",
      "A dragon! I'd rehearsed a sensible question, and it's completely gone.",
      "Aurelius gets that reaction more often than you might think."
    ]
  },
  "Snowbuilder Nessa": {
    "name": "Snowbuilder Nessa",
    "home": "Hollybeck's southern road",
    "role": "Snow sculptor",
    "source": "02-shrooms-roads.txt:62",
    "topics": [
      {
        "title": "A face in snow",
        "opening": "How do you choose the faces for your snow figures?",
        "first": "I give each snow figure a different expression. My brother says every one looks annoyed with him.",
        "replies": [
          [
            "Is he right?",
            "Only about two. The others are annoyed with different people."
          ],
          [
            "Do you copy real people?",
            "Sometimes. I deny it if they arrive before I've finished the nose."
          ],
          [
            "What's the hardest part?",
            "Stopping. One more adjustment can turn a dignified face into a collapsed potato."
          ]
        ]
      },
      {
        "title": "When they melt",
        "opening": "Does it bother you when your work melts?",
        "first": "I used to patch every thawing figure. Now I let the weather finish what it started.",
        "replies": [
          [
            "Doesn't that upset you?",
            "A little. Then I get my scarf back and make something else next winter."
          ],
          [
            "Do you remember the old ones?",
            "The good ones. Also a spectacularly bad horse."
          ],
          [
            "Why was the horse bad?",
            "Everyone thought it was a chair. Several people attempted to sit on it."
          ]
        ]
      },
      {
        "title": "Winter visitors",
        "opening": "Do many visitors come through in winter?",
        "first": "People stop to look at the snow figures and end up telling me who used to build them in their village.",
        "replies": [
          [
            "Do you like hearing it?",
            "Yes. Everyone has a different trick for keeping a head attached."
          ],
          [
            "Do children help?",
            "They choose most of the faces. I do the lifting."
          ],
          [
            "Does anyone complain?",
            "One neighbour claimed a figure was staring into his window. I turned it around. Apparently that was worse."
          ]
        ]
      }
    ],
    "greetings": [
      "Nessa. If anyone asks, these snow figures are a serious artistic undertaking.",
      "Corin. I'll use my most serious voice.",
      "Corin! Arrived before the thaw, I see.",
      "I didn't want to miss the exhibition.",
      "Keep your warm friend a little way back, please.",
      "Aurelius and I will admire them from here."
    ]
  },
  "Linna": {
    "name": "Linna",
    "home": "Thornwell",
    "role": "Mill bookkeeper",
    "source": "03-thornwell.txt:1",
    "topics": [
      {
        "title": "An honest shortage",
        "opening": "What happens when the mill's figures don't add up?",
        "first": "A miller reported a missing sack before I noticed. I believed his next correction much more readily.",
        "replies": [
          [
            "Did you find the sack?",
            "On the wrong wagon. Honesty made the search shorter."
          ],
          [
            "Was he embarrassed?",
            "Bright red. I didn't make him repeat himself."
          ],
          [
            "Do people often hide mistakes?",
            "Enough that finding one openly feels like cooperation."
          ]
        ]
      },
      {
        "title": "The wedding order",
        "opening": "Have you ever had trouble with a wedding order?",
        "first": "I enjoy wedding accounts. Large quantities of butter suggest someone expects happiness.",
        "replies": [
          [
            "Do you attend the weddings?",
            "When invited. I leave my sums at home."
          ],
          [
            "What's the hardest cost to predict?",
            "Relatives who announce they hardly eat, then arrive early."
          ],
          [
            "Would you plan a feast yourself?",
            "Gladly, provided someone else washed every dish."
          ]
        ]
      },
      {
        "title": "Keeping your own accounts",
        "opening": "Are your own accounts as tidy as the mill's?",
        "first": "My household accounts are a disgrace. Apparently I spend my precision at work.",
        "replies": [
          [
            "Does anything go missing?",
            "Mostly my certainty about what bread used to cost."
          ],
          [
            "Wouldn't a tidy ledger help?",
            "Yes. That sensible answer is profoundly unwelcome."
          ],
          [
            "What do you enjoy spending on?",
            "Good paper. I've decided that doesn't require defending."
          ]
        ]
      }
    ],
    "greetings": [
      "Linna. Please tell me you haven't brought another disputed invoice.",
      "Corin. Just a question, with no figures attached.",
      "Corin! A welcome interruption.",
      "I was hoping you'd say that.",
      "That's a dragon. For once I have nothing sensible to add.",
      "I'm Corin; this is Aurelius. Take your time."
    ]
  },
  "Garrow": {
    "name": "Garrow",
    "home": "Thornwell",
    "role": "Woodcutter",
    "source": "03-thornwell.txt:6",
    "topics": [
      {
        "title": "A tree left standing",
        "opening": "How do you decide which trees to leave standing?",
        "first": "I left a sound tree because birds had nested in it. My customer grumbled about the delay.",
        "replies": [
          [
            "Did you lose the job?",
            "No. I offered other timber. He liked that less dramatically."
          ],
          [
            "Do you check every tree?",
            "As well as I can. Looking first saves trouble."
          ],
          [
            "Would you always leave it?",
            "During nesting, yes. The wood can wait a season."
          ]
        ]
      },
      {
        "title": "The axe handle",
        "opening": "Do you make your own axe handles?",
        "first": "I once fitted a handle beautifully and forgot to test its grip. It twisted every time I swung.",
        "replies": [
          [
            "How did you fix it?",
            "Reshaped it. Admiration had made me stop too soon."
          ],
          [
            "Did anyone warn you?",
            "My brother. He enjoyed being right enormously."
          ],
          [
            "Do you still use it?",
            "Yes. It's less handsome and much less dangerous."
          ]
        ]
      },
      {
        "title": "An afternoon indoors",
        "opening": "What keeps you indoors on a free afternoon?",
        "first": "I mend little wooden toys when rain keeps me home. Wheels, mostly. Children are demanding drivers.",
        "replies": [
          [
            "Do you charge them?",
            "For materials if they can spare it. Not for complaints."
          ],
          [
            "What's the strangest repair?",
            "A horse missing all four legs. Optimistic owner."
          ],
          [
            "Do you enjoy it?",
            "Especially when the repaired toy immediately suffers another expedition."
          ]
        ]
      }
    ],
    "greetings": [
      "Garrow. You're welcome to talk if you don't expect me to be entertaining on command.",
      "Corin. I can manage half the work.",
      "Corin. I've had a whole morning to think of an answer for you.",
      "I hope it wasn't a difficult question.",
      "Those wings need clear space. I'll stay where he can see me.",
      "I'm Corin. Aurelius will appreciate that."
    ]
  },
  "Wren": {
    "name": "Wren",
    "home": "Thornwell",
    "role": "Herbalist and merchant",
    "source": "03-thornwell.txt:11",
    "topics": [
      {
        "title": "Learning what works",
        "opening": "How do you learn which remedies actually work?",
        "first": "I keep notes when a remedy disappoints someone. Those entries teach me more than the compliments.",
        "replies": [
          [
            "Do customers tell you plainly?",
            "Not always. I ask questions that allow an unhappy answer."
          ],
          [
            "Have you stopped selling anything?",
            "Yes. Being fond of a recipe isn't evidence it helps."
          ],
          [
            "Who taught you that?",
            "Berta. She made me explain every confident claim."
          ]
        ]
      },
      {
        "title": "A customer's cure",
        "opening": "Do customers bring you remedies of their own?",
        "first": "A customer said my tea restored his energy. Then he mentioned sleeping two extra hours each night.",
        "replies": [
          [
            "Was it the sleep?",
            "I suspect it helped considerably. I told him so."
          ],
          [
            "Did he still buy the tea?",
            "Yes. He liked the taste. An excellent reason."
          ],
          [
            "Were you disappointed?",
            "Relieved. I don't need credit for someone's sensible bedtime."
          ]
        ]
      },
      {
        "title": "Work after closing",
        "opening": "Can you stop thinking about work once you close?",
        "first": "After hearing everyone's troubles, I sometimes want an evening without being useful.",
        "replies": [
          [
            "Who looks after you?",
            "Berta notices. She invites me over and forbids remedy talk."
          ],
          [
            "What do you do instead?",
            "Argue over card games. She cheats more subtly than I do."
          ],
          [
            "Would you leave the trade?",
            "No. I'd simply like to keep some hours for myself."
          ]
        ]
      }
    ],
    "greetings": [
      "I'm Wren. Tell me what you're after before someone recommends everything I sell.",
      "Corin. I'd appreciate an honest answer.",
      "Corin, have you eaten before coming to discuss remedies?",
      "Yes. Nan would approve of that question.",
      "I know a little about people and nothing reliable about dragons.",
      "I'm Corin; this is Aurelius. We can start with introductions."
    ]
  },
  "Calder": {
    "name": "Calder",
    "home": "Road to Thornwell",
    "role": "Fisher and camp keeper",
    "source": "03-thornwell.txt:16",
    "topics": [
      {
        "title": "Odo's letters",
        "opening": "Does Odo write to you often?",
        "first": "Grandfather's letters devote three lines to his health and a whole page to a disputed fish.",
        "replies": [
          [
            "Does he exaggerate in writing?",
            "Less. He knows I can keep the evidence."
          ],
          [
            "Do you visit often?",
            "Less than I should. A camp is difficult to leave."
          ],
          [
            "What do you write back?",
            "Ordinary news. He worries if I only mention adventures."
          ]
        ]
      },
      {
        "title": "A place by the fire",
        "opening": "Is there room for anyone beside your fire?",
        "first": "I ask newcomers whether they want company before introducing them to everyone.",
        "replies": [
          [
            "Do some prefer being alone?",
            "Often. A warm fire needn't come with an interview."
          ],
          [
            "Have you had unwelcome guests?",
            "A few. Kindness doesn't oblige me to tolerate cruelty."
          ],
          [
            "What makes a good guest?",
            "Someone who asks where things belong before rearranging them."
          ]
        ]
      },
      {
        "title": "Breakfast in the rain",
        "opening": "How do you make breakfast when it's pouring?",
        "first": "I once protected breakfast from rain so carefully that I forgot the fire underneath it had gone out.",
        "replies": [
          [
            "What did you serve?",
            "Cold porridge and an explanation nobody requested."
          ],
          [
            "Did people complain?",
            "One traveller said she'd paid extra for less elsewhere."
          ],
          [
            "Have you improved the shelter?",
            "Yes. Breakfast now survives my conversations much better."
          ]
        ]
      }
    ],
    "greetings": [
      "Calder. The road's brought you to a decent stopping place.",
      "Corin. I'm glad to hear that.",
      "Corin! Tell me how the journey's treating you.",
      "Better now that I've stopped walking.",
      "I was expecting boots. Wings are a considerable surprise.",
      "I'm Corin, and this is Aurelius. Are we welcome?"
    ]
  },
  "Orin": {
    "name": "Orin",
    "home": "Thornwell",
    "role": "Gardener",
    "source": "03-thornwell.txt:21",
    "topics": [
      {
        "title": "The disappointing seeds",
        "opening": "Have you ever planted seeds that disappointed you?",
        "first": "I bought seeds with a magnificent picture on the packet. The plants looked nothing like it.",
        "replies": [
          [
            "Wrong seeds?",
            "No. Impossible picture. The artist had harvested imagination."
          ],
          [
            "Did you complain?",
            "Yes. The seller offered another packet. I declined the adventure."
          ],
          [
            "Were the plants useful?",
            "Perfectly good beans. I had wanted flowers."
          ]
        ]
      },
      {
        "title": "A borrowed garden",
        "opening": "Did you always have a garden of your own?",
        "first": "I tended a neighbour's garden while she was ill. She complained that I'd arranged everything too neatly.",
        "replies": [
          [
            "Had you changed much?",
            "Enough. I thought I was helping; she missed her own choices."
          ],
          [
            "Did you put it back?",
            "As closely as I could. Then I asked what she wanted."
          ],
          [
            "Did you stay friends?",
            "Yes. She still supervises my enthusiasm very effectively."
          ]
        ]
      },
      {
        "title": "Growing for pleasure",
        "opening": "What would you grow just for the pleasure of it?",
        "first": "I keep a corner for flowers that do nothing but please me.",
        "replies": [
          [
            "Why would they need another use?",
            "Exactly. I wish everyone asked that question."
          ],
          [
            "What colours do you choose?",
            "Whatever looks cheerful after a miserable morning."
          ],
          [
            "Do you give flowers away?",
            "Some. Keeping a few for myself took longer to learn."
          ]
        ]
      }
    ],
    "greetings": [
      "Orin. You needn't pretend to recognise plants to speak to me.",
      "Corin. That removes several possible embarrassments.",
      "Back again, Corin? I haven't assigned you any weeding.",
      "Then this is already going well.",
      "That's rather more shade than I planned for.",
      "I'm Corin. Aurelius can stand clear of the beds."
    ]
  },
  "Isolde": {
    "name": "Isolde",
    "home": "Thornwell",
    "role": "Town resident",
    "source": "03-thornwell.txt:26",
    "topics": [
      {
        "title": "A walk too far",
        "opening": "Have you ever walked farther than you meant to?",
        "first": "I followed a pleasant lane until I realised I had no idea where it joined the road.",
        "replies": [
          [
            "How did you get home?",
            "Turned around. Less impressive than discovering a shortcut, considerably quicker."
          ],
          [
            "Were you frightened?",
            "A little. Enough to stop pretending I knew the way."
          ],
          [
            "Would you take it again?",
            "Yes, with more daylight and less confidence."
          ]
        ]
      },
      {
        "title": "Your aunt's recipe",
        "opening": "How did you learn your aunt's recipe?",
        "first": "My aunt measures ingredients by the bowl she happens to use. I borrowed the bowl before asking for the recipe.",
        "replies": [
          [
            "Did that help?",
            "Enormously. She had forgotten every other bowl was different."
          ],
          [
            "Was the food good?",
            "Eventually. My first attempt could have repaired a wall."
          ],
          [
            "Have you changed the recipe?",
            "Only the measurements. Family diplomacy has limits."
          ]
        ]
      },
      {
        "title": "Knowing a town",
        "opening": "What makes a town feel familiar to you?",
        "first": "I like learning people's routes: who walks early, who stops everywhere, who always seems late.",
        "replies": [
          [
            "Do you watch me too?",
            "Only now you've given me permission to be curious."
          ],
          [
            "Does everyone have a pattern?",
            "Until something changes. Then I ask whether they're all right."
          ],
          [
            "What's your own pattern?",
            "A longer walk than necessary whenever the weather allows."
          ]
        ]
      }
    ],
    "greetings": [
      "Isolde. Are you exploring, or taking the long way to an errand?",
      "Corin. At the moment, a little of both.",
      "Corin. Another walk through town?",
      "I was hoping to find familiar company.",
      "Oh, those wings are real. I wasn't expecting that today.",
      "I'm Corin. Aurelius surprises most people at first."
    ]
  },
  "Ada": {
    "name": "Ada",
    "home": "Thornwell",
    "role": "Rowan's wife",
    "source": "03-thornwell.txt:31",
    "topics": [
      {
        "title": "Your anniversary",
        "opening": "Does Rowan remember your anniversary?",
        "first": "Rowan remembers the day we met perfectly. He remembers our wedding a day late.",
        "replies": [
          [
            "Do you remind him?",
            "The day before. I prefer a pleasant evening to proving a point."
          ],
          [
            "How did you meet?",
            "He returned a basket I'd dropped. Bramble later adopted the same habit, less helpfully."
          ],
          [
            "Is he romantic?",
            "In his own way. He remembers which paths I like walking."
          ]
        ]
      },
      {
        "title": "Bramble's loyalties",
        "opening": "Who does Bramble listen to most?",
        "first": "Bramble follows Rowan outdoors and follows me whenever food is involved. A thoroughly practical division.",
        "replies": [
          [
            "Who trained him?",
            "Both of us. He has trained us as well."
          ],
          [
            "Does he behave indoors?",
            "When he remembers he's indoors. Excitement occasionally obscures the distinction."
          ],
          [
            "Who's his favourite?",
            "Whoever is leaving. He cannot bear being excluded from a walk."
          ]
        ]
      },
      {
        "title": "Time to myself",
        "opening": "Do you get much time to yourself?",
        "first": "I like an afternoon when neither husband nor dog needs locating.",
        "replies": [
          [
            "How do you spend it?",
            "Reading, usually. Something without lost hunters."
          ],
          [
            "Does Rowan understand?",
            "He does when I explain before becoming irritated."
          ],
          [
            "Would you travel alone?",
            "For a short visit. I'd enjoy choosing every stop myself."
          ]
        ]
      }
    ],
    "greetings": [
      "Ada. If Rowan has promised you something, let me hear the exact wording.",
      "Corin. I'll remember to keep witnesses.",
      "Corin, come in. This visit needn't involve my husband.",
      "I came to speak with you.",
      "So you're the one travelling with a dragon.",
      "I'm Corin. His name is Aurelius."
    ]
  },
  "Bren": {
    "name": "Bren",
    "home": "Thornwell",
    "role": "Amateur historian",
    "source": "03-thornwell.txt:36",
    "topics": [
      {
        "title": "Ordinary history",
        "opening": "Do you keep records of ordinary people's lives?",
        "first": "A feast's records list the guests but never the people who cooked. I'd rather know how they fed so many.",
        "replies": [
          [
            "Can you find out?",
            "Sometimes household accounts survive. Butter leaves a better trail than glory."
          ],
          [
            "Why does that matter?",
            "Because a famous evening was also someone's exhausting shift."
          ],
          [
            "Would anyone read that history?",
            "I'd read it. A modest but dependable audience."
          ]
        ]
      },
      {
        "title": "The wrong date",
        "opening": "What happens when a history gives the wrong date?",
        "first": "I corrected a neighbour's date for a festival. Then found my own source had copied an error.",
        "replies": [
          [
            "Did you tell him?",
            "Immediately, though I practised a dignified version first."
          ],
          [
            "Was he pleased?",
            "Delighted. He had remembered the rain; I'd trusted the ink."
          ],
          [
            "Do you trust memory now?",
            "As evidence to examine, not an opponent to defeat."
          ]
        ]
      },
      {
        "title": "What gets remembered",
        "opening": "How do you decide which stories deserve remembering?",
        "first": "My grandmother remembered a great procession chiefly because her shoes hurt.",
        "replies": [
          [
            "Was it an important procession?",
            "Very. Her account is the only one that made me laugh."
          ],
          [
            "Did you write that down?",
            "With her permission. She insisted I include the blisters."
          ],
          [
            "Does that spoil the grandeur?",
            "It adds a person who actually stood there."
          ]
        ]
      }
    ],
    "greetings": [
      "Bren. Tell me where you're from; I promise only one question to begin.",
      "Corin, from Millwood. I'm counting.",
      "Corin! I've remembered the question I forgot last time.",
      "I suspected there would be another.",
      "A dragon. My usual questions have become inadequate.",
      "I'm Corin; this is Aurelius. Begin with an easy one."
    ]
  },
  "Berta": {
    "name": "Berta",
    "home": "Thornwell",
    "role": "Retired herbalist",
    "source": "03-thornwell.txt:41",
    "topics": [
      {
        "title": "Being a beginner",
        "opening": "Is it difficult being a beginner again?",
        "first": "I'm learning to draw. My first pear looked like a boot. It's pinned up at home.",
        "replies": [
          [
            "Why keep the bad drawing?",
            "To make the next one look encouraging."
          ],
          [
            "Who teaches you?",
            "Mostly mistakes. An extremely punctual instructor."
          ],
          [
            "Will you draw people?",
            "Eventually. I owe my neighbours better than the pear."
          ]
        ]
      },
      {
        "title": "Advice withheld",
        "opening": "Have you ever decided someone didn't need your advice?",
        "first": "I still catch myself telling Wren how to arrange her work. She lets me finish, then asks whether I've retired.",
        "replies": [
          [
            "Does that upset you?",
            "Briefly. Then I remember why I wanted time off."
          ],
          [
            "Do you help when asked?",
            "Gladly. Being asked makes a considerable difference."
          ],
          [
            "Do you miss the customers?",
            "Some. Others have improved tremendously in memory."
          ]
        ]
      },
      {
        "title": "The quiet house",
        "opening": "Does the house feel too quiet sometimes?",
        "first": "Retirement made my house unexpectedly quiet. I hadn't realised how much company came with work.",
        "replies": [
          [
            "What did you do?",
            "Invited people without offering them anything medicinal."
          ],
          [
            "Did they come?",
            "Yes. Apparently some had liked me rather than my stock."
          ],
          [
            "Was that a surprise?",
            "A pleasant one. Useful people can forget they're also enjoyable."
          ]
        ]
      }
    ],
    "greetings": [
      "Berta. If this is about remedies, Wren deserves the first question now.",
      "Corin. I was hoping to meet you.",
      "Corin, you've caught me doing something badly for pleasure.",
      "That sounds worth hearing about.",
      "Well. A dragon rather outclasses my afternoon plans.",
      "I'm Corin. Aurelius and I won't disturb them for long."
    ]
  },
  "Della": {
    "name": "Della",
    "home": "Thornwell",
    "role": "Gardener",
    "source": "03-thornwell.txt:46",
    "topics": [
      {
        "title": "The enormous marrow",
        "opening": "What's the largest thing you've grown?",
        "first": "I grew a marrow so large I couldn't carry it. For three days it was an achievement. Then it was a problem.",
        "replies": [
          [
            "How did you move it?",
            "Asked two neighbours, who demanded a share. Fair payment."
          ],
          [
            "Did it taste good?",
            "Perfectly ordinary. A humbling quantity of ordinary."
          ],
          [
            "Will you grow another?",
            "Smaller ones. Ambition should fit through the kitchen door."
          ]
        ]
      },
      {
        "title": "A plant you disliked",
        "opening": "Have you ever kept a plant you didn't like?",
        "first": "Someone gave me a plant I disliked. I kept it for years because throwing it away felt rude.",
        "replies": [
          [
            "Did the giver notice?",
            "Not once. I had constructed the entire obligation myself."
          ],
          [
            "What happened to it?",
            "A neighbour loved it. We were both relieved."
          ],
          [
            "What do you grow now?",
            "Things I actually want to look after. Revolutionary arrangement."
          ]
        ]
      },
      {
        "title": "The best garden visitor",
        "opening": "Who is your favourite visitor to the garden?",
        "first": "My favourite visitor asks one question and listens to the answer. Some ask six and leave during the first.",
        "replies": [
          [
            "Would you rather work alone?",
            "Sometimes. I say so, which surprises people."
          ],
          [
            "What's a good question?",
            "What I'm trying this year. It leaves room for an unfinished answer."
          ],
          [
            "What are you trying?",
            "Letting one patch grow less tidily. I'm resisting the urge to interfere."
          ]
        ]
      }
    ],
    "greetings": [
      "Della. Sit if you like; standing politely makes me feel I should hurry.",
      "Corin. I'm happy to stop for a while.",
      "Corin. A conversation, or a comfortable silence?",
      "Let's see which arrives first.",
      "Your companion is beautiful. I'll admire him from here.",
      "I'm Corin. Aurelius will appreciate the space."
    ]
  },
  "Ewan": {
    "name": "Ewan",
    "home": "Thornwell",
    "role": "Student of history",
    "source": "03-thornwell.txt:51",
    "topics": [
      {
        "title": "Two festival stories",
        "opening": "Can two people tell the same festival story differently?",
        "first": "One account calls a festival splendid. Another says the rain spoiled everything. Both writers attended.",
        "replies": [
          [
            "Which one is right?",
            "One watched from a balcony. The other carried food across the square."
          ],
          [
            "Did they mention each other?",
            "No. They hardly seem to describe the same afternoon."
          ],
          [
            "Does that happen often?",
            "Enough that I now ask where the writer was standing."
          ]
        ]
      },
      {
        "title": "A ridiculous book",
        "opening": "Have you read anything delightfully ridiculous lately?",
        "first": "I enjoy terrible adventure stories. The hero always recognises poison by looking offended at it.",
        "replies": [
          [
            "Does anyone ever die?",
            "Only people who ignore the hero's offended expression."
          ],
          [
            "Why keep reading?",
            "I like knowing someone will escape a ridiculous predicament."
          ],
          [
            "Would you write one?",
            "I've tried. My villain keeps becoming the most sensible person."
          ]
        ]
      },
      {
        "title": "Admitting an error",
        "opening": "Is it hard admitting you've got a story wrong?",
        "first": "I defended a story so fiercely that admitting it was wrong felt worse than the error itself.",
        "replies": [
          [
            "What changed your mind?",
            "A friend asked whether I wanted the truth or an audience."
          ],
          [
            "Did you apologise?",
            "Yes. She accepted, then made me read the whole source."
          ],
          [
            "Are you less certain now?",
            "More precise about what I'm certain of. Less entertaining at arguments."
          ]
        ]
      }
    ],
    "greetings": [
      "Ewan. I've been arguing with a book. A person would be a welcome change.",
      "Corin. I may argue back more promptly.",
      "Corin! I found another account of that story.",
      "Does this one agree with the first?",
      "A dragon makes my reading seem terribly limited.",
      "I'm Corin; this is Aurelius. Books miss quite a bit."
    ]
  },
  "Elric": {
    "name": "Elric",
    "home": "Thornwell",
    "role": "Letter writer",
    "source": "03-thornwell.txt:56",
    "topics": [
      {
        "title": "The apology letter",
        "opening": "How do you put an apology into a letter?",
        "first": "A customer wanted an apology that didn't admit fault. We spent an hour discovering what an apology was.",
        "replies": [
          [
            "Did you write it?",
            "After he agreed to say what he'd done."
          ],
          [
            "Was it accepted?",
            "I don't know. Writing the letter wasn't the whole repair."
          ],
          [
            "Did he blame you?",
            "Briefly. People sometimes expect ink to do difficult work for them."
          ]
        ]
      },
      {
        "title": "A letter never sent",
        "opening": "Have you ever written a letter and kept it?",
        "first": "I once wrote to an old friend and carried the letter for weeks. I worried it sounded foolish.",
        "replies": [
          [
            "Did you send it eventually?",
            "Yes. She replied that she'd been trying to write too."
          ],
          [
            "What had you wanted to say?",
            "That I missed our conversations. A short truth with excessive preparation."
          ],
          [
            "Do you keep her reply?",
            "Folded in a book. I know exactly which page."
          ]
        ]
      },
      {
        "title": "Difficult handwriting",
        "opening": "Can you make sense of anyone's handwriting?",
        "first": "My writing grows worse when I'm excited. Customers assume a letter writer has beautiful personal correspondence.",
        "replies": [
          [
            "Does anyone complain?",
            "My sister encloses guesses at the illegible words."
          ],
          [
            "Is she usually right?",
            "Alarmingly. She knows my news before deciphering it."
          ],
          [
            "Could you write more slowly?",
            "Certainly. Then I'd lose half the pleasure of telling her."
          ]
        ]
      }
    ],
    "greetings": [
      "Elric. Words for a letter, or words for their own sake?",
      "I'm Corin. The second sort today.",
      "Corin, have you brought news you can share?",
      "A little. Nothing requiring a seal.",
      "I could spend a page describing those wings and still fail.",
      "I'm Corin, and his name is Aurelius. That's a useful first sentence."
    ]
  },
  "Mara": {
    "name": "Mara",
    "home": "Thornwell",
    "role": "Baker",
    "source": "03-thornwell.txt:61",
    "topics": [
      {
        "title": "The unpopular loaf",
        "opening": "Have you ever baked a loaf nobody wanted?",
        "first": "I made a loaf with a flavour I adored. Nobody bought a second one. I ate my conviction for a week.",
        "replies": [
          [
            "What flavour?",
            "Far too much fennel. I now measure enthusiasm."
          ],
          [
            "Did you stop experimenting?",
            "No. Smaller batches make failure considerably more affordable."
          ],
          [
            "Did anyone like it?",
            "My uncle claimed to. He also owed me money."
          ]
        ]
      },
      {
        "title": "A borrowed recipe",
        "opening": "Do you borrow recipes from other bakers?",
        "first": "A neighbour shared a recipe and asked me to use her mother's name for it.",
        "replies": [
          [
            "Did you agree?",
            "Of course. It was easier than pretending I invented everything."
          ],
          [
            "Did it sell well?",
            "Very. The name gave people a story to ask about."
          ],
          [
            "Do you share your own?",
            "Most. A recipe isn't the same as doing the work."
          ]
        ]
      },
      {
        "title": "The last customer",
        "opening": "Do you ever stay open for one last customer?",
        "first": "One regular arrived just before closing because he disliked crowded shops. I nearly mistook it for carelessness.",
        "replies": [
          [
            "How did you find out?",
            "I asked why he always looked relieved when everyone left."
          ],
          [
            "Did you change anything?",
            "Kept his order aside. No grand arrangement needed."
          ],
          [
            "Does he talk more now?",
            "A little. He shouldn't have to become chatty to buy bread."
          ]
        ]
      }
    ],
    "greetings": [
      "Mara. If you're deciding whether to ask a question, ask before I start talking about bread.",
      "Corin. Too late for the bread warning, perhaps.",
      "Corin! I have an opinion ready, if needed.",
      "I'll try to choose a suitable subject.",
      "A dragon will certainly make my regulars forget their complaints.",
      "I'm Corin. Aurelius may inspire new ones."
    ]
  },
  "Kit": {
    "name": "Kit",
    "home": "Thornwell",
    "role": "Messenger",
    "source": "03-thornwell.txt:66",
    "topics": [
      {
        "title": "The wrong recipient",
        "opening": "Have you ever delivered a message to the wrong person?",
        "first": "Two people named Mara lived on my route. I once delivered a birthday greeting to the wrong one.",
        "replies": [
          [
            "Did she return it?",
            "After enjoying being remembered. I felt dreadful."
          ],
          [
            "What did you do?",
            "Explained, then returned on her actual birthday with a greeting."
          ],
          [
            "Do you check names now?",
            "Names, households, and occasionally relatives. Embarrassment improves a system."
          ]
        ]
      },
      {
        "title": "A slow walk",
        "opening": "Do you enjoy walking when you aren't making deliveries?",
        "first": "On free evenings I walk without anything to deliver. At first I kept speeding up out of habit.",
        "replies": [
          [
            "Can you relax now?",
            "Mostly. I still judge streets by how quickly I could cross them."
          ],
          [
            "Where do you like walking?",
            "Anywhere with enough room to stop without blocking someone."
          ],
          [
            "Would you choose different work?",
            "Some days. Then I carry good news and remember why I like it."
          ]
        ]
      },
      {
        "title": "A sealed message",
        "opening": "Are you ever curious about the messages you carry?",
        "first": "People ask what I'm carrying. I tell them whose door I'm looking for, not what's inside.",
        "replies": [
          [
            "Are you ever curious?",
            "Constantly. Curiosity doesn't open the seal."
          ],
          [
            "Has someone offered you money?",
            "Once. I remember him much better than the amount."
          ],
          [
            "What if it's urgent?",
            "Then it reaches the right person sooner. It doesn't become everyone's business."
          ]
        ]
      }
    ],
    "greetings": [
      "Kit. If this is a message, give me the name before the description of the house.",
      "Corin. Luckily, I'm delivering myself.",
      "Corin, you're standing still. An excellent idea.",
      "I thought a messenger might appreciate it.",
      "Wings! Do you know how many hills I've climbed today?",
      "I'm Corin. Aurelius isn't accepting delivery work."
    ]
  },
  "Mabel": {
    "name": "Mabel",
    "home": "Thornwell",
    "role": "Weaver",
    "source": "03-thornwell.txt:71",
    "topics": [
      {
        "title": "The itchy masterpiece",
        "opening": "Have you ever made something beautiful that nobody could bear to wear?",
        "first": "I wove a beautiful scarf from wool that irritated everyone's neck. Beauty had failed a basic inspection.",
        "replies": [
          [
            "Did you sell it?",
            "No. It became a wall hanging."
          ],
          [
            "Could you soften it?",
            "Not enough. I tried before admitting the problem."
          ],
          [
            "What do you check first now?",
            "How something feels against skin. Admiration can wait."
          ]
        ]
      },
      {
        "title": "Choosing a gift",
        "opening": "How do you choose something to make as a gift?",
        "first": "My sister likes colours I would never wear. I finally learned to make her presents she would choose.",
        "replies": [
          [
            "Was she polite before?",
            "Painfully. She wore them whenever I visited."
          ],
          [
            "Did she tell you?",
            "She asked for orange so firmly I recognised an intervention."
          ],
          [
            "Do you enjoy making orange things?",
            "For her, yes. She looks delighted instead of dutiful."
          ]
        ]
      },
      {
        "title": "A pattern remembered",
        "opening": "Are there patterns you can make from memory?",
        "first": "I recreated a pattern from my grandmother's cloth, then found the original. Mine was completely different.",
        "replies": [
          [
            "Were you disappointed?",
            "At first. Then I realised I'd remembered the colours I loved."
          ],
          [
            "Did you undo it?",
            "No. I labelled the two honestly."
          ],
          [
            "Which do you prefer?",
            "Hers for the memory, mine because I made it."
          ]
        ]
      }
    ],
    "greetings": [
      "Mabel. You can admire a colour without knowing its proper name.",
      "Corin. That's fortunate for me.",
      "Corin! You look as though you've been somewhere worth describing.",
      "I'll begin with the parts I can name.",
      "Those scales would be impossible to capture in plain thread.",
      "I'm Corin, and this is Aurelius. He changes with the light."
    ]
  },
  "Maren": {
    "name": "Maren",
    "home": "Thornwell",
    "role": "Innkeeper",
    "source": "03-thornwell.txt:76",
    "topics": [
      {
        "title": "The tired guest",
        "opening": "How can you tell when a guest needs some kindness?",
        "first": "A traveller asked the same direction three times. I finally walked him to the door instead of repeating it louder.",
        "replies": [
          [
            "Was he embarrassed?",
            "Less once I stopped acting as though he was testing me."
          ],
          [
            "Did he find his room?",
            "Yes, and slept through breakfast."
          ],
          [
            "Do you get impatient?",
            "Naturally. I try not to make tired people manage my temper too."
          ]
        ]
      },
      {
        "title": "What you can promise",
        "opening": "What can a traveller count on at your inn?",
        "first": "I can promise a prepared room. I cannot promise that every other guest will sleep without snoring.",
        "replies": [
          [
            "Do people ask that?",
            "They ask for silence while explaining loudly how lightly they sleep."
          ],
          [
            "What do you do?",
            "Offer the quietest place available and tell them its limits."
          ],
          [
            "Would you stay at your own inn?",
            "Gladly, if someone else answered the door."
          ]
        ]
      },
      {
        "title": "A returning traveller",
        "opening": "Do you remember guests when they come back?",
        "first": "A woman returned after ten years and remembered exactly where she'd sat at breakfast. I'd forgotten her name.",
        "replies": [
          [
            "Did you pretend to remember?",
            "No. She told me, and we began again."
          ],
          [
            "What had she remembered?",
            "I'd lent her dry socks after a miserable crossing."
          ],
          [
            "Did you still have the socks?",
            "She brought them back. I hadn't expected such determined honesty."
          ]
        ]
      }
    ],
    "greetings": [
      "Maren. Rest first, questions second, unless the question is where to rest.",
      "I'm Corin. That sounds like a sensible order.",
      "Corin. You needn't rent a room to say hello.",
      "Then hello, properly.",
      "A dragon is a new kind of arrival for me.",
      "I'm Corin. Aurelius can wait where there's room."
    ]
  },
  "Asta": {
    "name": "Asta",
    "home": "Thornwell",
    "role": "Student of nature",
    "source": "04-thornwell-neighbours.txt:1",
    "topics": [
      {
        "title": "Predicting rain",
        "opening": "How do you decide whether rain is coming?",
        "first": "I predicted a dry afternoon, announced it confidently, and got drenched. My notes survived better than my reputation.",
        "replies": [
          [
            "What went wrong?",
            "I trusted one sign and ignored the changing wind."
          ],
          [
            "Did anyone follow your advice?",
            "My brother. He discusses it whenever clouds appear."
          ],
          [
            "Will you try again?",
            "Yes. Next time I'll distinguish a guess from a promise."
          ]
        ]
      },
      {
        "title": "Watching snails",
        "opening": "What do you learn from watching snails?",
        "first": "Snails are surprisingly difficult subjects. They look stationary until you turn away.",
        "replies": [
          [
            "What are you studying?",
            "Which surfaces they prefer. So far, my notebook appears popular."
          ],
          [
            "Do you mark them?",
            "I recognise a few shells. I'd rather leave them undisturbed."
          ],
          [
            "Have you learned anything?",
            "That ten minutes is shorter when you're not waiting for a snail."
          ]
        ]
      },
      {
        "title": "A failed experiment",
        "opening": "Have any of your experiments gone badly?",
        "first": "I planted seeds in three different soils and forgot to label the pots.",
        "replies": [
          [
            "Could you work out which was which?",
            "Not reliably. Inventing certainty wouldn't rescue the experiment."
          ],
          [
            "Did you begin again?",
            "Yes. With labels before seeds."
          ],
          [
            "Were you annoyed?",
            "Furious. Mostly because the mistake was so preventable."
          ]
        ]
      }
    ],
    "greetings": [
      "Asta. Can you tell rain is coming, or do you just get wet like I do?",
      "I'm Corin. Usually the second.",
      "Corin! I've revised my prediction.",
      "Should I bring a coat?",
      "A dragon! I'd better ask permission before beginning the questions.",
      "I'm Corin. Aurelius and I appreciate being asked."
    ]
  },
  "Colm": {
    "name": "Colm",
    "home": "Thornwell",
    "role": "Enthusiastic cook",
    "source": "04-thornwell-neighbours.txt:6",
    "topics": [
      {
        "title": "Salt and confidence",
        "opening": "How did you learn to judge the salt in a meal?",
        "first": "I salted a soup twice because I forgot doing it the first time. Confidence made the second handful particularly generous.",
        "replies": [
          [
            "Could you save it?",
            "By making enough unsalted soup to feed the neighbours."
          ],
          [
            "Did they discover why?",
            "I told them before anyone praised my generosity."
          ],
          [
            "What do you do now?",
            "Taste before adding. A revolutionary technique I once considered unnecessary."
          ]
        ]
      },
      {
        "title": "Cooking for strangers",
        "opening": "How do you cook for people whose tastes you don't know?",
        "first": "I ask guests what they dislike. Asking what they love produces a much longer and less useful answer.",
        "replies": [
          [
            "Do people tell you honestly?",
            "Eventually. Nobody wants to offend the cook before eating."
          ],
          [
            "What's your own dislike?",
            "Being surprised by sweetness where I expected savoury food."
          ],
          [
            "Would you cook separate meals?",
            "If practical. Supper shouldn't become a test of obedience."
          ]
        ]
      },
      {
        "title": "A meal remembered",
        "opening": "Is there a meal you still think about?",
        "first": "My best meal was bread and cheese after a day walking in rain. I've failed to recreate it indoors.",
        "replies": [
          [
            "Maybe hunger was the ingredient.",
            "And dry socks. Difficult things to put in a recipe."
          ],
          [
            "What cheese was it?",
            "I don't remember. An inconvenient flaw in the research."
          ],
          [
            "Would you walk through rain again?",
            "For pleasure, no. For an exceptionally convincing cheese, perhaps."
          ]
        ]
      }
    ],
    "greetings": [
      "Colm. Have you eaten? I'm collecting opinions, not offering to feed the whole street.",
      "Corin. I can contribute an opinion.",
      "Corin! I have a new theory about supper.",
      "Is it edible yet?",
      "I was about to ask how many portions you need. Perhaps introductions first.",
      "I'm Corin. This is Aurelius, who won't fit an ordinary portion."
    ]
  },
  "Tessa": {
    "name": "Tessa",
    "home": "Thornwell and Forgewick",
    "role": "Travelling musician",
    "source": "04-thornwell-neighbours.txt:11",
    "topics": [
      {
        "title": "The wrong tempo",
        "opening": "Have you ever started a tune at completely the wrong speed?",
        "first": "I played a dance too quickly and watched everyone become cross with their feet.",
        "replies": [
          [
            "Did they ask you to slow down?",
            "One woman clapped the proper rhythm at me. Very effective criticism."
          ],
          [
            "Were you embarrassed?",
            "Briefly. Then relieved the floor was moving together again."
          ],
          [
            "Do you prefer listening music?",
            "It depends on the room. People dancing tell you immediately what works."
          ]
        ]
      },
      {
        "title": "A child's request",
        "opening": "Do children ask you for particular songs?",
        "first": "A child asked me to play a tune I'd never heard. She sang three notes and expected the rest.",
        "replies": [
          [
            "Could you recognise it?",
            "Her father eventually supplied another three. We built it together."
          ],
          [
            "Did she like your version?",
            "She corrected the ending with complete authority."
          ],
          [
            "Would you play it again?",
            "Yes. I wrote it down before everyone forgot their contribution."
          ]
        ]
      },
      {
        "title": "Practising alone",
        "opening": "Do you enjoy practising when nobody's listening?",
        "first": "The awkward part of practice is repeating the bit you dislike instead of the bit you already play well.",
        "replies": [
          [
            "How do you make yourself do it?",
            "Slowly, and before I let myself play something pleasant."
          ],
          [
            "Do mistakes still bother you?",
            "Yes. Less when I recognise one I know how to fix."
          ],
          [
            "What do you enjoy most?",
            "When a difficult passage finally feels like music instead of work."
          ]
        ]
      }
    ],
    "greetings": [
      "Tessa. You may speak; I'm not counting that as interrupting a performance.",
      "I'm Corin. I was hoping to meet you.",
      "Corin, a familiar face in a new day.",
      "It's good to hear a familiar voice.",
      "A dragon in the audience. That may test my concentration.",
      "I'm Corin. Aurelius is usually a patient listener."
    ]
  },
  "Rowan the Hunter": {
    "name": "Rowan the Hunter",
    "home": "Thornwell",
    "role": "Hunter and Bramble's owner",
    "source": "04-thornwell-neighbours.txt:16",
    "topics": [
      {
        "title": "Reading a trail",
        "opening": "What do you look for when you follow a trail?",
        "first": "A track tells you where something was. Young hunters often mistake that for knowing where it is.",
        "replies": [
          [
            "Have you followed the wrong trail?",
            "For half a day. I was following yesterday's deer with today's enthusiasm."
          ],
          [
            "How do you tell the age?",
            "Weather, disturbed ground, what crosses it. Then admit when you can't tell."
          ],
          [
            "Does Bramble help?",
            "His nose catches what my eyes miss. I still have to use my judgement."
          ]
        ]
      },
      {
        "title": "Ada's patience",
        "opening": "Does Ada mind how often you're out in the woods?",
        "first": "Ada says I can describe a woodland path perfectly and forget where I left my coat.",
        "replies": [
          [
            "Is she right?",
            "Frequently. I dislike how often that improves her argument."
          ],
          [
            "What does she enjoy doing?",
            "Reading and walking where nobody is chasing anything."
          ],
          [
            "Do you join her?",
            "When invited. A married person may still want an afternoon alone."
          ]
        ]
      },
      {
        "title": "Knowing when to stop",
        "opening": "How do you decide when to turn back?",
        "first": "I've turned back from hunts that looked promising. Bad light makes good tracks useless.",
        "replies": [
          [
            "Do you regret it?",
            "Until I get home. Warmth improves my judgement retroactively."
          ],
          [
            "What if you've walked all day?",
            "Then I'm tired enough to make worse decisions."
          ],
          [
            "Would you trust Bramble's warning?",
            "I'd stop and look. Ignoring him because I'm impatient would be foolish."
          ]
        ]
      }
    ],
    "greetings": [
      "Rowan. If Bramble has stolen your attention, I understand completely.",
      "Corin. He's very persuasive.",
      "Corin. It's good to see you without a search to organise.",
      "I prefer this sort of meeting too.",
      "So this is your dragon companion. I'll let him approach first.",
      "Aurelius appreciates that. He likes deciding his own introductions."
    ]
  },
  "Osric": {
    "name": "Osric",
    "home": "Thornwell",
    "role": "Weaver and reader",
    "source": "04-thornwell-neighbours.txt:21",
    "topics": [
      {
        "title": "A disappointing ending",
        "opening": "Has a book ever let you down at the end?",
        "first": "A hero escaped because a stranger arrived with exactly the right key. We'd never heard of him before.",
        "replies": [
          [
            "That sounds rather convenient.",
            "Convenient for the author. Infuriating for me."
          ],
          [
            "Could the ending be improved?",
            "Introduce the stranger earlier. Give me a reason to care."
          ],
          [
            "Why finish the book?",
            "I hoped the author had thought further ahead than I had."
          ]
        ]
      },
      {
        "title": "Cloth that lasts",
        "opening": "How can you tell whether a piece of cloth will last?",
        "first": "A customer wanted delicate cloth for a child's everyday coat. I suggested something that could survive a hedge.",
        "replies": [
          [
            "Did they listen?",
            "After I described washing it. Practicality won that round."
          ],
          [
            "Did the child choose anything?",
            "The colour. Bright enough to locate across a field."
          ],
          [
            "What would you choose?",
            "Something comfortable. Clothes should allow a person to forget them."
          ]
        ]
      },
      {
        "title": "Reading aloud",
        "opening": "Do you enjoy reading aloud to someone?",
        "first": "I read aloud when a sentence refuses to make sense. Sometimes it remains nonsense with more volume.",
        "replies": [
          [
            "Does that happen often?",
            "Often enough that my neighbours recognise the tone."
          ],
          [
            "Do you read to other people?",
            "Friends, if they choose the book too."
          ],
          [
            "What do you enjoy reading?",
            "Stories about difficult people who become understandable without becoming perfect."
          ]
        ]
      }
    ],
    "greetings": [
      "Osric. Cloth questions cost nothing; literary arguments may take the afternoon.",
      "Corin. I'll choose carefully.",
      "Corin! I've reached an ending worth complaining about.",
      "I'll hear the complaint.",
      "A dragon makes even my least plausible books seem modest.",
      "I'm Corin. This is Aurelius, without the book's embellishments."
    ]
  },
  "Alder": {
    "name": "Alder",
    "home": "Thornwell",
    "role": "Beekeeper",
    "source": "04-thornwell-neighbours.txt:26",
    "topics": [
      {
        "title": "A swarm overhead",
        "opening": "What do you do when the bees swarm?",
        "first": "A swarm once settled where I couldn't reach it. I spent an hour planning, then they left while I fetched help.",
        "replies": [
          [
            "Were you disappointed?",
            "At losing the swarm, yes. At not climbing, rather less."
          ],
          [
            "Why do they swarm?",
            "Part of a colony leaves to establish another. It's impressive and inconvenient."
          ],
          [
            "Could you have hurried?",
            "I could have fallen. Patience was the cheaper option."
          ]
        ]
      },
      {
        "title": "Different honey",
        "opening": "Does honey taste different from one hive to another?",
        "first": "Honey changes with the flowers. People ask for the same flavour every season as though bees follow my orders.",
        "replies": [
          [
            "Can you guide them?",
            "Only by where I keep the hives. They make the journeys."
          ],
          [
            "Do you have a favourite?",
            "A spring batch with a light floral taste. I finished it too quickly."
          ],
          [
            "Can customers tell the difference?",
            "Some can. Some prefer the label they remember."
          ]
        ]
      },
      {
        "title": "Gwyneth's limit",
        "opening": "Does Gwyneth ever tell you to stop talking about bees?",
        "first": "Gwyneth lets me speak about bees until she asks how the rest of my day went.",
        "replies": [
          [
            "Does that stop you?",
            "It reminds me I had a rest of the day."
          ],
          [
            "Do you listen to her interests?",
            "I try. She notices when I'm waiting to mention bees."
          ],
          [
            "What else interests you?",
            "Cooking. Unfortunately that sometimes leads back to honey."
          ]
        ]
      }
    ],
    "greetings": [
      "Alder. I can discuss bees briefly, despite what Gwyneth tells you.",
      "Corin. I'll give you a chance to prove it.",
      "Corin, I have prepared a shorter bee explanation.",
      "How short is shorter?",
      "Those wings would make a tremendous draught near a hive.",
      "I'm Corin. Aurelius can keep a respectful distance."
    ]
  },
  "Gwyneth": {
    "name": "Gwyneth",
    "home": "Thornwell",
    "role": "Neighbour and host",
    "source": "04-thornwell-neighbours.txt:31",
    "topics": [
      {
        "title": "A crowded supper",
        "opening": "Have you ever had more supper guests than you expected?",
        "first": "I once invited so many people that the quiet guests couldn't finish a sentence.",
        "replies": [
          [
            "Did you notice at the time?",
            "Too late. I spent the evening pleased with the noise."
          ],
          [
            "What changed afterward?",
            "Smaller suppers. More chances for each person to speak."
          ],
          [
            "Did anyone complain?",
            "A friend told me she'd hardly heard herself think. I believed her."
          ]
        ]
      },
      {
        "title": "An honest invitation",
        "opening": "How do you invite someone without making them feel obliged?",
        "first": "I tell guests they may leave early. Otherwise a pleasant invitation can become an endurance trial.",
        "replies": [
          [
            "Do people actually leave?",
            "Yes, and return another time. I prefer that bargain."
          ],
          [
            "Do you ever refuse invitations?",
            "When I'm tired. I've practised saying it without inventing an illness."
          ],
          [
            "What makes a good evening?",
            "People staying because they want to, including me."
          ]
        ]
      },
      {
        "title": "The unfinished song",
        "opening": "Is there a song you've never managed to finish?",
        "first": "I know the beginning of a song perfectly and none of the middle. Alder supplies invented verses.",
        "replies": [
          [
            "Are they good?",
            "Appalling. He rhymed 'honey' with 'more honey'."
          ],
          [
            "Have you found the real words?",
            "Not yet. I'm almost afraid they'd disappoint us."
          ],
          [
            "Do you sing it for guests?",
            "Only trusted ones. Standards matter less among friends."
          ]
        ]
      }
    ],
    "greetings": [
      "Gwyneth. If Alder has kept you talking, you may ask for a rest.",
      "Corin. I haven't needed rescuing yet.",
      "Corin, come and give me your version of the day.",
      "It's probably less organised than Alder's.",
      "A dragon! I should ask your names before asking anything else.",
      "I'm Corin. My companion is Aurelius."
    ]
  },
  "Eira": {
    "name": "Eira",
    "home": "Thornwell",
    "role": "Cider maker",
    "source": "04-thornwell-neighbours.txt:36",
    "topics": [
      {
        "title": "The disputed batch",
        "opening": "What do you do when someone disputes a batch?",
        "first": "Half my neighbours liked a new batch; half hated it. Both groups advised me to listen to everyone.",
        "replies": [
          [
            "What did you decide?",
            "Made less of it and labelled it clearly."
          ],
          [
            "Did you like it yourself?",
            "Yes. That mattered, just not more than every customer."
          ],
          [
            "Did the argument end?",
            "They found something else to discuss. People are resourceful."
          ]
        ]
      },
      {
        "title": "Work at a celebration",
        "opening": "Do you still end up working at celebrations?",
        "first": "People invite me to parties and ask me to explain the drinks. I sometimes want to simply attend.",
        "replies": [
          [
            "Do you tell them?",
            "More often now. They usually hadn't considered it work."
          ],
          [
            "What would you rather discuss?",
            "Who chose the music, where someone travelled, anything without barrels."
          ],
          [
            "Do you still enjoy parties?",
            "Very much, especially when someone pours my drink."
          ]
        ]
      },
      {
        "title": "A useful failure",
        "opening": "Has a mistake ever taught you something useful?",
        "first": "I tried copying a rival's cider and made something dull. My own worst batch had more character.",
        "replies": [
          [
            "Did you admit trying?",
            "Yes. The rival found it extremely funny."
          ],
          [
            "What did you learn?",
            "I knew my apples better than I knew his process."
          ],
          [
            "Would you collaborate instead?",
            "Gladly. Asking is less embarrassing than bad imitation."
          ]
        ]
      }
    ],
    "greetings": [
      "Eira. If you're tasting cider, tell me what you think, not what sounds polite.",
      "I'm Corin. I can offer the same service for conversation.",
      "Corin. An opinion I haven't heard this morning.",
      "I'll try to make it a useful one.",
      "A dragon would certainly complicate a tasting.",
      "I'm Corin. Aurelius and I came for company."
    ]
  },
  "Fenton": {
    "name": "Fenton",
    "home": "Thornwell",
    "role": "Traveller and storyteller",
    "source": "04-thornwell-neighbours.txt:41",
    "topics": [
      {
        "title": "Walking past the inn",
        "opening": "Have you ever kept walking when you ought to have stopped at an inn?",
        "first": "I walked past the inn I wanted because I was describing it to another traveller.",
        "replies": [
          [
            "Did they stop you?",
            "They'd never seen it. I was their supposed expert."
          ],
          [
            "How far did you go?",
            "Far enough to become hungry and less authoritative."
          ],
          [
            "Did you admit the mistake?",
            "After a brief, unsuccessful attempt to blame the sign."
          ]
        ]
      },
      {
        "title": "Someone else's rescue",
        "opening": "Has a stranger ever had to rescue you?",
        "first": "A woman once found my lost pack. I kept telling the story as though my search had been heroic.",
        "replies": [
          [
            "What did she say?",
            "That she found it where I'd put it down."
          ],
          [
            "Did you change the story?",
            "Yes. It's funnier when I'm honestly foolish."
          ],
          [
            "What was in it?",
            "Food, socks, and a map that hadn't prevented anything."
          ]
        ]
      },
      {
        "title": "Travelling for pleasure",
        "opening": "Where would you travel if you had no business to finish?",
        "first": "I like choosing a destination for no better reason than wanting to see it.",
        "replies": [
          [
            "Can you always afford that?",
            "No. Which makes the occasions precious."
          ],
          [
            "Do you ever regret a journey?",
            "Certainly. Usually the one I hurried through."
          ],
          [
            "Where would you return?",
            "Somewhere I met good company. Scenery rarely remembers you."
          ]
        ]
      }
    ],
    "greetings": [
      "Fenton. I have a story if you have time to question the details.",
      "Corin. That sounds like a fair arrangement.",
      "Corin! I've found a shorter route to the point.",
      "I'll believe it when we arrive.",
      "Well, you've brought evidence for an extraordinary story.",
      "I'm Corin. Aurelius isn't part of a performance."
    ]
  },
  "Celia": {
    "name": "Celia",
    "home": "Thornwell",
    "role": "History enthusiast",
    "source": "04-thornwell-neighbours.txt:46",
    "topics": [
      {
        "title": "A household account",
        "opening": "How do you keep track of a household's expenses?",
        "first": "I found an old household list with shoes crossed out and medicine written beneath them.",
        "replies": [
          [
            "What did that tell you?",
            "Someone had to choose. More than the grand account mentioned."
          ],
          [
            "Could you find their names?",
            "Only one. I kept looking rather than supplying a story."
          ],
          [
            "Was the family important?",
            "To each other, certainly. That's enough reason to ask."
          ]
        ]
      },
      {
        "title": "The borrowed pot",
        "opening": "Have you ever had trouble returning something you borrowed?",
        "first": "A neighbour recalled a terrible quarrel chiefly because one family never returned a cooking pot.",
        "replies": [
          [
            "Was that the cause?",
            "No. It was what she still encountered every supper."
          ],
          [
            "Did they reconcile?",
            "She didn't know. I wrote that down too."
          ],
          [
            "Do you enjoy those details?",
            "They make people less like names on a page."
          ]
        ]
      },
      {
        "title": "Learning for myself",
        "opening": "What would you like to learn just for yourself?",
        "first": "I learned a little embroidery last winter. It has nothing to do with my research.",
        "replies": [
          [
            "Are you good at it?",
            "Improving. My flowers have stopped resembling weather damage."
          ],
          [
            "Who taught you?",
            "A friend who refused to hurry the difficult part."
          ],
          [
            "Why choose embroidery?",
            "I wanted to make something I could hold afterward."
          ]
        ]
      }
    ],
    "greetings": [
      "Celia. Are you interested in history that includes washing and supper?",
      "Corin. Those sound like parts people might recognise.",
      "Corin, I have another ordinary detail nobody thought to record.",
      "I'd like to hear it.",
      "A dragon's companion must still have ordinary mornings.",
      "I'm Corin. We try to find a few."
    ]
  },
  "Archivist Elowen": {
    "name": "Archivist Elowen",
    "home": "Thornwell school",
    "role": "Archivist",
    "source": "05-school.txt:1",
    "topics": [
      {
        "title": "A damaged page",
        "opening": "Can you save a badly damaged page?",
        "first": "A missing corner can change an entire account. I once found a warning quoted as a recommendation.",
        "replies": [
          [
            "How could that happen?",
            "The surviving sentence omitted the word 'never'."
          ],
          [
            "Did you correct it?",
            "In our copy, with a note explaining the damage."
          ],
          [
            "What if you can't reconstruct it?",
            "Then I leave a gap. Certainty shouldn't be a decoration."
          ]
        ]
      },
      {
        "title": "An embarrassed reader",
        "opening": "What do you do when a reader is embarrassed to ask for help?",
        "first": "A man pretended to know a book he couldn't read. He'd come to learn and feared being laughed at.",
        "replies": [
          [
            "How did you help?",
            "Asked him to read with me privately. No audience."
          ],
          [
            "Did he return?",
            "For months. Then he brought his daughter."
          ],
          [
            "Was he a good student?",
            "Determined. He deserved instruction long before he found courage."
          ]
        ]
      },
      {
        "title": "Records under a king",
        "opening": "Does the crown interfere with what you record?",
        "first": "Official accounts can be accurate about dates and dishonest about reasons.",
        "replies": [
          [
            "How do you check reasons?",
            "Compare who benefits, who is omitted, and who could speak freely."
          ],
          [
            "Can ordinary letters help?",
            "Often. A private complaint may reveal what a proclamation hides."
          ],
          [
            "Will history remember Halvard fairly?",
            "Only if fairness includes the people his orders harmed."
          ]
        ]
      }
    ],
    "greetings": [
      "Elowen. Tell me what you're trying to find, even if you don't know what to call it.",
      "Corin. That is exactly my problem.",
      "Corin. A new question, or an old one behaving badly?",
      "I may have brought both.",
      "A living dragon. We have rather more to learn than our shelves suggest.",
      "I'm Corin. Aurelius can speak for his own experience."
    ]
  },
  "Mira": {
    "name": "Mira",
    "home": "Thornwell school",
    "role": "Student of the mines",
    "source": "05-school.txt:6",
    "topics": [
      {
        "title": "A miner's note",
        "opening": "What can you learn from a miner's notes?",
        "first": "One miner recorded a dangerous turn as 'the familiar bend'. Useless advice for anyone new.",
        "replies": [
          [
            "Could you locate it?",
            "By comparing other accounts. Familiarity had erased the detail."
          ],
          [
            "What would you write?",
            "A direction, a landmark, and what the danger was."
          ],
          [
            "Do your notes ever do that?",
            "Yes. I ask someone else to read them now."
          ]
        ]
      },
      {
        "title": "Why study underground?",
        "opening": "What drew you to studying the mines?",
        "first": "My uncle worked below ground and hated how visitors discussed mines without discussing miners.",
        "replies": [
          [
            "Did he teach you?",
            "He answered questions when I stopped interrupting with book knowledge."
          ],
          [
            "Did he enjoy mining?",
            "Some parts. He was allowed to dislike others."
          ],
          [
            "What interested you most?",
            "How much safe work depended on people noticing one another."
          ]
        ]
      },
      {
        "title": "A map without height",
        "opening": "Can a map mislead you about what's underground?",
        "first": "I copied a mine plan and forgot to mark changes in level. It looked wonderfully simple.",
        "replies": [
          [
            "Did someone catch the error?",
            "A miner asked whether I'd invented a flat mountain."
          ],
          [
            "Were you embarrassed?",
            "Very. Then grateful he hadn't let it leave the room."
          ],
          [
            "Have you corrected it?",
            "Yes. Clear drawings take more thought than tidy ones."
          ]
        ]
      }
    ],
    "greetings": [
      "Mira. If you're asking about a mine, tell me which part before I answer.",
      "I'm Corin. I appreciate the distinction.",
      "Corin! Have you brought a practical question?",
      "I usually end up with one.",
      "A dragon can fit through doors I wouldn't have guessed.",
      "I'm Corin; this is Aurelius. We still check the ceiling."
    ]
  },
  "Oren": {
    "name": "Oren",
    "home": "Thornwell school",
    "role": "Student of spirits",
    "source": "05-school.txt:11",
    "topics": [
      {
        "title": "The unnamed memorial",
        "opening": "What do you do when a memorial has no name?",
        "first": "I found a memorial described only by its stonework. Nobody had recorded whose name was worn away.",
        "replies": [
          [
            "Could you recover it?",
            "Not yet. I've been comparing family accounts."
          ],
          [
            "Why keep trying?",
            "Someone wanted that person remembered. The carving wasn't the point."
          ],
          [
            "Does that make you sad?",
            "Yes. It also gives me a specific question to pursue."
          ]
        ]
      },
      {
        "title": "A frightening story",
        "opening": "Why do people keep telling frightening stories?",
        "first": "I repeated a ghost story and discovered one listener knew the family in it.",
        "replies": [
          [
            "What did you do?",
            "Stopped. Then apologised for treating their grief as entertainment."
          ],
          [
            "Did the story change?",
            "I no longer tell it for a shiver."
          ],
          [
            "Are all ghost stories wrong?",
            "No. But their subjects may have living neighbours."
          ]
        ]
      },
      {
        "title": "Something cheerful",
        "opening": "Do you ever read anything cheerful?",
        "first": "I grow terrible little flowers at home. They lean, refuse schedules, and make me disproportionately happy.",
        "replies": [
          [
            "What kind?",
            "Whatever survives my uncertain watering. I avoid impressive labels."
          ],
          [
            "Do you talk to them?",
            "Occasionally. They're excellent at withholding criticism."
          ],
          [
            "Why call them terrible?",
            "Affection. I would defend them fiercely to anyone else."
          ]
        ]
      }
    ],
    "greetings": [
      "Oren. You may ask about ghosts, but I also know perfectly cheerful things.",
      "I'm Corin. I'm relieved to have a choice.",
      "Corin. Shall we leave something pleasant for the end this time?",
      "That seems a good arrangement.",
      "A dragon is a reassuringly living subject.",
      "I'm Corin, and Aurelius is very much alive."
    ]
  },
  "Tamsin": {
    "name": "Tamsin",
    "home": "Thornwell school",
    "role": "Reader and aspiring writer",
    "source": "05-school.txt:16",
    "topics": [
      {
        "title": "A villain with supper",
        "opening": "Do villains in books ever get an ordinary evening?",
        "first": "I wrote a villain who stopped a speech because he was hungry. My friend said it ruined the menace.",
        "replies": [
          [
            "Did you agree?",
            "No. Even dreadful people must occasionally chew."
          ],
          [
            "Was the story funny?",
            "In parts. The villain resented being laughed at."
          ],
          [
            "Did you finish it?",
            "The scene, yes. The rest is still making demands."
          ]
        ]
      },
      {
        "title": "A rumour about Maelis",
        "opening": "Do you believe the stories about Maelis?",
        "first": "People repeat frightening stories about Maelis without saying who actually met her.",
        "replies": [
          [
            "Do you believe them?",
            "I believe people are frightened. That's not the same evidence."
          ],
          [
            "Why repeat the stories?",
            "A familiar rumour feels safer than an unanswered question."
          ],
          [
            "Would you visit her?",
            "If I had a reason, I'd speak to her myself."
          ]
        ]
      },
      {
        "title": "The first page",
        "opening": "What makes you keep reading after the first page?",
        "first": "I kept rewriting an opening sentence until I forgot what happened next.",
        "replies": [
          [
            "How did you stop?",
            "Wrote the next scene badly and promised to return later."
          ],
          [
            "Did that work?",
            "I have three pages now. Some contain sentences I like."
          ],
          [
            "Could I read them someday?",
            "When I have an ending. I'm not inflicting suspense by accident."
          ]
        ]
      }
    ],
    "greetings": [
      "Tamsin. I'm choosing a book, which is easier if nobody calls it educational.",
      "I'm Corin. I won't burden it with expectations.",
      "Corin! I've found something worth arguing about.",
      "A promising recommendation.",
      "A dragon would completely spoil the surprise in my story.",
      "I'm Corin. Aurelius tends to be noticed early."
    ]
  },
  "Master Iven": {
    "name": "Master Iven",
    "home": "Thornwell school",
    "role": "Teacher",
    "source": "05-school.txt:21",
    "topics": [
      {
        "title": "The quiet student",
        "opening": "How do you know whether a quiet student understands?",
        "first": "A student understood a lesson but would never answer aloud. I mistook silence for confusion.",
        "replies": [
          [
            "How did you find out?",
            "Asked privately. He feared laughing classmates, not the question."
          ],
          [
            "What changed?",
            "I stopped making every answer a public performance."
          ],
          [
            "Did he speak more?",
            "Eventually. That wasn't the only measure of progress."
          ]
        ]
      },
      {
        "title": "Your worst lesson",
        "opening": "Have you ever taught a lesson badly?",
        "first": "I once explained a difficult idea three times using exactly the same words, louder each time.",
        "replies": [
          [
            "Did anyone tell you?",
            "A pupil asked for a different explanation, very politely."
          ],
          [
            "Could you give one?",
            "After admitting I needed a moment to think."
          ],
          [
            "Do you remember the pupil?",
            "Perfectly. Teachers remember being taught unexpectedly."
          ]
        ]
      },
      {
        "title": "Learning without school",
        "opening": "Can someone learn well without going to school?",
        "first": "People apologise for what they haven't studied, then describe work I couldn't do.",
        "replies": [
          [
            "Can experience replace books?",
            "It teaches different things. Neither excuses refusing to learn."
          ],
          [
            "What should I ask first?",
            "What you need to understand, not what sounds impressive."
          ],
          [
            "Is it too late to begin?",
            "Only if you insist it is. We can begin with one question."
          ]
        ]
      }
    ],
    "greetings": [
      "Iven. A question is welcome here, even if it's the first one in a long time.",
      "I'm Corin. I have several waiting.",
      "Corin. No examination today; you can relax.",
      "I hadn't known I needed that reassurance.",
      "A dragon! Today's lesson has become rather less theoretical.",
      "I'm Corin. Aurelius and I are still learning too."
    ]
  },
  "Brin": {
    "name": "Brin",
    "home": "Thornwell school",
    "role": "Student of rider temples",
    "source": "05-school.txt:26",
    "topics": [
      {
        "title": "The narrow doorway",
        "opening": "Have you ever found an entrance too narrow for your expedition?",
        "first": "I drew a temple entrance beautifully and much too narrow. I had copied its decoration, not its proportions.",
        "replies": [
          [
            "How did you notice?",
            "Tried placing a person beside it. Then a dragon."
          ],
          [
            "Did you start again?",
            "Yes. The second drawing was less elegant and more useful."
          ],
          [
            "Does that happen in old accounts?",
            "Often. A striking detail can crowd out an essential one."
          ]
        ]
      },
      {
        "title": "Keeping a ruin",
        "opening": "Should people leave ruins as they find them?",
        "first": "A ruined building can preserve mistakes as well as achievements. I'd like to know both.",
        "replies": [
          [
            "What sort of mistakes?",
            "Passages altered, entrances blocked, plans abandoned. People adapted them."
          ],
          [
            "Why does that interest you?",
            "It makes the builders people solving problems, not flawless ancestors."
          ],
          [
            "Would you rebuild one?",
            "I'd learn what remained before deciding what it ought to be."
          ]
        ]
      },
      {
        "title": "An expedition postponed",
        "opening": "What would make you postpone an expedition?",
        "first": "I wanted to visit a temple before learning how to prepare. I mistook wanting for readiness.",
        "replies": [
          [
            "Who stopped you?",
            "Iven asked what I'd do if someone was injured."
          ],
          [
            "Did you have an answer?",
            "No. That was the point I finally heard."
          ],
          [
            "Will you go someday?",
            "I hope so, with people equipped for the journey."
          ]
        ]
      }
    ],
    "greetings": [
      "Brin. I'm interested in the temples, but I won't pretend I've explored them all.",
      "I'm Corin. I'd rather know what you're sure of.",
      "Corin. I have questions that won't fit neatly in my notes.",
      "I'll answer the ones I can.",
      "A dragon gives those old door measurements a purpose.",
      "I'm Corin; this is Aurelius. Some doorways are still a challenge."
    ]
  },
  "Nell": {
    "name": "Nell",
    "home": "Thornwell school",
    "role": "History student",
    "source": "05-school.txt:31",
    "topics": [
      {
        "title": "The convenient word",
        "opening": "Do people ever choose a word because it helps their argument?",
        "first": "A proclamation called a new levy 'temporary'. It didn't say what would make it end.",
        "replies": [
          [
            "Did anyone ask?",
            "Not in the account I read. That's the missing question."
          ],
          [
            "Could temporary mean anything?",
            "Almost, without a condition or a date."
          ],
          [
            "Do people notice that?",
            "More readily when they're the ones paying."
          ]
        ]
      },
      {
        "title": "Winning badly",
        "opening": "Can you win an argument and still regret it?",
        "first": "I once won an argument by mocking the other person's mistake. She stopped speaking, and I called that success.",
        "replies": [
          [
            "Did you apologise?",
            "Later. She accepted without reopening the discussion."
          ],
          [
            "What would you do now?",
            "Ask what led her to the claim. I might learn something."
          ],
          [
            "Do you still like arguing?",
            "Yes. I'd like people to return for the next conversation."
          ]
        ]
      },
      {
        "title": "A question for pleasure",
        "opening": "What would you ask if you didn't need to prove anything?",
        "first": "I asked my sister what she'd do with a completely free afternoon. We spoke for an hour without debating anything.",
        "replies": [
          [
            "What did she choose?",
            "Walking somewhere new, then eating somewhere familiar."
          ],
          [
            "What would you choose?",
            "A good book that doesn't require correcting in the margins."
          ],
          [
            "Could you manage that?",
            "With effort. Apparently relaxation has prerequisites for me."
          ]
        ]
      }
    ],
    "greetings": [
      "Nell. If someone says a thing is necessary, I usually ask for whom.",
      "I'm Corin. Does that get you into arguments?",
      "Corin. I've been practising letting people finish before objecting.",
      "I'll try to earn the patience.",
      "The crown's descriptions of dragons leave out the individual entirely.",
      "I'm Corin. This one's called Aurelius."
    ]
  },
  "Sable": {
    "name": "Sable",
    "home": "Thornwell school",
    "role": "Researcher",
    "source": "05-school.txt:36",
    "topics": [
      {
        "title": "A copied error",
        "opening": "How do you spot an error everyone has copied?",
        "first": "Three books repeated the same mistake. I nearly counted them as three witnesses.",
        "replies": [
          [
            "How did you catch it?",
            "Identical unusual wording. They were copying one another."
          ],
          [
            "Was the original available?",
            "Yes. Its writer had marked the claim uncertain."
          ],
          [
            "Did you correct the copies?",
            "Added notes. Erasing the error would hide how it spread."
          ]
        ]
      },
      {
        "title": "A dreadful riddle",
        "opening": "Do you know any dreadful riddles?",
        "first": "What has a spine, no bones, and too many opinions? A history book written by my tutor.",
        "replies": [
          [
            "Would your tutor laugh?",
            "At the first half. I've tested neither half together."
          ],
          [
            "Did you invent that?",
            "Unfortunately, yes. Ownership is difficult to deny."
          ],
          [
            "Have you a better one?",
            "Almost certainly. I save this one for resilient company."
          ]
        ]
      },
      {
        "title": "Dating a memory",
        "opening": "Can you work out when an old memory happened?",
        "first": "Someone dated a storm by a wedding. The wedding had moved a week, but the family remembered both as one event.",
        "replies": [
          [
            "How did you separate them?",
            "Letters written between the two."
          ],
          [
            "Was the witness lying?",
            "No. Memory had joined two memorable days."
          ],
          [
            "Does that make memories useless?",
            "It makes them memories. Useful sources can still need checking."
          ]
        ]
      }
    ],
    "greetings": [
      "Sable. I can offer an answer with a footnote or a guess without one.",
      "I'm Corin. Tell me which it is and we'll manage.",
      "Corin. I've checked a detail you didn't ask me to check.",
      "Should I be worried?",
      "A dragon is unusually strong evidence for a dragon's existence.",
      "I'm Corin. Aurelius is pleased to settle that question."
    ]
  },
  "Pella": {
    "name": "Pella",
    "home": "Thornwell school",
    "role": "Geography student",
    "source": "05-school.txt:41",
    "topics": [
      {
        "title": "The blank patch",
        "opening": "What do you put in a part of the map nobody has explored?",
        "first": "A map left a district blank because its maker hadn't visited. Readers decided nobody lived there.",
        "replies": [
          [
            "Could you fill it in?",
            "Partly, from travellers who actually knew it."
          ],
          [
            "Why hadn't they been asked?",
            "They weren't considered authorities. An expensive prejudice for a mapmaker."
          ],
          [
            "What did you mark first?",
            "Settlements. Empty paper had hidden people's homes."
          ]
        ]
      },
      {
        "title": "Directions by memory",
        "opening": "Can you give directions without looking at a map?",
        "first": "My mother gives directions by people: past where someone lived, beside where someone fell over.",
        "replies": [
          [
            "Can strangers follow them?",
            "Rarely. Family history isn't a public signpost."
          ],
          [
            "Do you understand her?",
            "Usually. Then I translate into turns and distances."
          ],
          [
            "Which version do you prefer?",
            "Hers for company, mine when I'm trying to arrive."
          ]
        ]
      },
      {
        "title": "The way home",
        "opening": "Do you ever have trouble finding your own way home?",
        "first": "I practise giving directions back as well as onward. A place looks different when you're leaving.",
        "replies": [
          [
            "Have you been lost?",
            "In a town I'd confidently entered an hour earlier."
          ],
          [
            "What confused you?",
            "I'd remembered a shopfront facing the other direction."
          ],
          [
            "What helped?",
            "Turning around and actually looking before continuing."
          ]
        ]
      }
    ],
    "greetings": [
      "Pella. Where you're from is a better beginning than how far you've travelled.",
      "I'm Corin, from Millwood.",
      "Corin. Does Millwood feel nearer or farther away today?",
      "That changes more than I expected.",
      "Wings must change how a road looks.",
      "I'm Corin. Aurelius sees turns I miss from the ground."
    ]
  },
  "Scholar Ilyan": {
    "name": "Scholar Ilyan",
    "home": "Thornwell school and Sandspire",
    "role": "Scholar of the desert",
    "source": "05-school.txt:46",
    "topics": [
      {
        "title": "An uncertain translation",
        "opening": "How do you translate something when you aren't sure what it means?",
        "first": "One damaged phrase could mean 'heart of fire' or 'fire at the centre'. An expedition shouldn't depend on my favourite reading.",
        "replies": [
          [
            "How do you choose?",
            "Compare other uses, then record what remains uncertain."
          ],
          [
            "Have you been wrong before?",
            "Yes. A supposed royal title turned out to name a storehouse."
          ],
          [
            "Was that disappointing?",
            "To my pride. Extremely helpful to the rest of the work."
          ]
        ]
      },
      {
        "title": "Research at a distance",
        "opening": "Can you study a place without visiting it?",
        "first": "Reading about a place makes it familiar in a dangerously incomplete way.",
        "replies": [
          [
            "What gets left out?",
            "Distance, fatigue, doors that no longer open."
          ],
          [
            "Does that discourage you?",
            "It makes me listen carefully to people who've been there."
          ],
          [
            "Would you travel yourself?",
            "With preparation and suitable company. Curiosity doesn't carry supplies."
          ]
        ]
      },
      {
        "title": "Who gets the discovery?",
        "opening": "Who should get the credit for a discovery?",
        "first": "Scholars often name the person who wrote an account and omit everyone who made the journey possible.",
        "replies": [
          [
            "Would you do that?",
            "I try not to. Intentions need checking against the page."
          ],
          [
            "Who should be included?",
            "Guides, carriers, local people whose knowledge was borrowed."
          ],
          [
            "What about the people who lived there?",
            "Their history should remain theirs, however exciting our arrival feels."
          ]
        ]
      }
    ],
    "greetings": [
      "Ilyan. I study the desert's ruins. I distinguish what I've read from what I've seen.",
      "I'm Corin. That seems worth asking about.",
      "Corin, I hope you've come with a question of your own.",
      "I have. Your research can wait one moment.",
      "A dragon beside a traveller. Our records are about to feel incomplete.",
      "I'm Corin. Aurelius isn't an exhibit, but we can talk."
    ]
  },
  "Bess": {
    "name": "Bess",
    "home": "Thornwell's Copper Cup",
    "role": "Tavern keeper",
    "source": "06-copper-cup.txt:1",
    "topics": [
      {
        "title": "The expert customer",
        "opening": "Do customers often tell you how to run the tavern?",
        "first": "A customer explained how to run my tavern. I asked which shift he'd like.",
        "replies": [
          [
            "Did he volunteer?",
            "He discovered an urgent appointment elsewhere."
          ],
          [
            "Was any advice useful?",
            "One thing. I used it without adopting the lecturer."
          ],
          [
            "Do you get many experts?",
            "They arrive thirsty and become authorities after the second cup."
          ]
        ]
      },
      {
        "title": "Closing time",
        "opening": "How do you persuade people it's time to go home?",
        "first": "The last guests always tell me they're no trouble. They're standing between me and my bed.",
        "replies": [
          [
            "How do you move them along?",
            "Plainly. Hints only work on people already considering leaving."
          ],
          [
            "Does anyone take offence?",
            "Occasionally. They recover by the following evening."
          ],
          [
            "Do you enjoy the quiet afterward?",
            "For a minute. Then I notice the washing-up."
          ]
        ]
      },
      {
        "title": "Royal demands",
        "opening": "What does a royal visit cost you?",
        "first": "A royal visit means food taken from paying customers and a bill nobody wants to acknowledge.",
        "replies": [
          [
            "Can you ask for payment?",
            "I can ask. Whether a crowned guest listens is different."
          ],
          [
            "Who bears the loss?",
            "Me, the suppliers, and anyone whose supper is delayed."
          ],
          [
            "Why serve him at all?",
            "Because refusing puts the staff at risk too. I resent that calculation."
          ]
        ]
      }
    ],
    "greetings": [
      "Bess. You're welcome to talk, but please don't begin by saying you know the owner.",
      "I'm Corin. I'll begin by meeting her.",
      "Corin! Here for company this time?",
      "That's the plan.",
      "A dragon would make quite an entrance. Let's keep the entrance usable.",
      "I'm Corin. Aurelius and I can give people room."
    ]
  },
  "Ronan": {
    "name": "Ronan",
    "home": "Copper Cup",
    "role": "Cider maker",
    "source": "06-copper-cup.txt:6",
    "topics": [
      {
        "title": "Naming a batch",
        "opening": "How do you name a new batch?",
        "first": "I named a cider 'Golden Triumph' before tasting it. Confidence was the principal ingredient.",
        "replies": [
          [
            "Was it good?",
            "Mediocre. 'Acceptable Tuesday' would have been accurate."
          ],
          [
            "Did you change the name?",
            "After my friends began using it whenever I failed."
          ],
          [
            "What do you call batches now?",
            "Dates. They make fewer promises."
          ]
        ]
      },
      {
        "title": "A rival's opinion",
        "opening": "Would you ask a rival what they thought of your work?",
        "first": "A rival liked my least successful batch. I couldn't decide whether to thank him or feel insulted.",
        "replies": [
          [
            "What did you do?",
            "Asked what he liked. His answer was specific enough to believe."
          ],
          [
            "Did it change your mind?",
            "It changed what I thought he wanted from cider."
          ],
          [
            "Are you friends?",
            "Friendly competitors. We reserve the right to be irritating."
          ]
        ]
      },
      {
        "title": "Winter evenings",
        "opening": "How do you spend the long winter evenings?",
        "first": "In winter I mend things I've ignored all year. Most remain annoyed at me for waiting.",
        "replies": [
          [
            "What breaks most often?",
            "Handles. Apparently I expect wood to tolerate enthusiasm."
          ],
          [
            "Are you good at repairs?",
            "Good enough to know when to ask Hobb."
          ],
          [
            "Would you rather be working?",
            "No. I complain about the quiet while enjoying it."
          ]
        ]
      }
    ],
    "greetings": [
      "Ronan. Don't let anyone describe my cider before you've tasted it yourself.",
      "I'm Corin. Does that warning apply to your stories?",
      "Corin! An audience without a purchasing obligation.",
      "I'm happy with that arrangement.",
      "A dragon! That'll overshadow any entrance I ever make.",
      "I'm Corin; this is Aurelius. He hasn't rehearsed it."
    ]
  },
  "Venn": {
    "name": "Venn",
    "home": "Copper Cup",
    "role": "Letter carrier",
    "source": "06-copper-cup.txt:11",
    "topics": [
      {
        "title": "The doorstep you missed",
        "opening": "Have you ever walked straight past the right door?",
        "first": "A family painted their door and I walked past it twice. I knew the colour better than the address.",
        "replies": [
          [
            "Did they see you?",
            "Yes. They waved on the third pass."
          ],
          [
            "Did you admit it?",
            "Before they could helpfully repaint the door for me."
          ],
          [
            "How do you remember now?",
            "More than one feature. Memory likes shortcuts too much."
          ]
        ]
      },
      {
        "title": "Reading a message twice",
        "opening": "Do you check a message before delivering it?",
        "first": "I deliver spoken messages too. I repeat them back before leaving, however impatient the sender is.",
        "replies": [
          [
            "Have you caught errors?",
            "Wrong names, missing days, a request that sounded like an accusation."
          ],
          [
            "Does anyone mind?",
            "Until the first correction. Then they usually slow down."
          ],
          [
            "What makes a useful message?",
            "Who needs what, by when. Poetry can follow later."
          ]
        ]
      },
      {
        "title": "News of your own",
        "opening": "Do you have any news of your own for a change?",
        "first": "I carried everyone else's good news for years before announcing I'd saved enough for a holiday.",
        "replies": [
          [
            "Where did you go?",
            "Nowhere with a delivery route. That was the chief requirement."
          ],
          [
            "Did you enjoy being away?",
            "After I stopped checking the time at every turning."
          ],
          [
            "Would you go again?",
            "Yes. I didn't cease being useful by resting."
          ]
        ]
      }
    ],
    "greetings": [
      "Venn. I carry messages, though tonight I'd prefer one without a destination.",
      "I'm Corin. This one ends here.",
      "Corin. Good to see someone I don't owe a delivery.",
      "I'll keep it that way.",
      "A dragon would make my route considerably more visible.",
      "I'm Corin. Aurelius isn't a discreet companion."
    ]
  },
  "Hobb": {
    "name": "Hobb",
    "home": "Copper Cup",
    "role": "Carpenter",
    "source": "06-copper-cup.txt:16",
    "topics": [
      {
        "title": "A chair for someone",
        "opening": "Have you ever made a chair for one particular person?",
        "first": "A customer said every chair felt wrong. His feet didn't reach the floor properly.",
        "replies": [
          [
            "Could you fix that?",
            "A lower seat. The simplest part of the job."
          ],
          [
            "Why hadn't he asked before?",
            "He thought discomfort meant he was sitting badly."
          ],
          [
            "Did he like it?",
            "He stayed sitting while we discussed the payment."
          ]
        ]
      },
      {
        "title": "The borrowed saw",
        "opening": "Are you happy lending out your saw?",
        "first": "I lent a saw and got it back sharper than before. I nearly invented another reason to lend it.",
        "replies": [
          [
            "Who borrowed it?",
            "A neighbour who believes tools deserve manners."
          ],
          [
            "Did you thank them?",
            "With a repair they'd been putting off."
          ],
          [
            "Do you lend all your tools?",
            "No. Affection doesn't make every person careful."
          ]
        ]
      },
      {
        "title": "Your own unfinished shelf",
        "opening": "Does your own furniture get finished last?",
        "first": "I finish customers' shelves promptly. My own spent months as a promise.",
        "replies": [
          [
            "What stopped you?",
            "After work, more work had limited appeal."
          ],
          [
            "Did you finish it?",
            "Eventually. My household applauded with excessive ceremony."
          ],
          [
            "Was it worth the wait?",
            "A shelf rarely justifies a dramatic delay."
          ]
        ]
      }
    ],
    "greetings": [
      "Hobb. If you need a chair, describe the person before the wood.",
      "Corin. I'm here without a commission.",
      "Corin. Your timing suggests you're avoiding work too.",
      "I prefer to call it a visit.",
      "Those wings would make a remarkable carving.",
      "I'm Corin; this is Aurelius. Best ask before studying him."
    ]
  },
  "Edric": {
    "name": "Edric",
    "home": "Copper Cup",
    "role": "Traveller",
    "source": "06-copper-cup.txt:21",
    "topics": [
      {
        "title": "A poor arrival",
        "opening": "Have you ever arrived somewhere badly unprepared?",
        "first": "I once entered a town and immediately explained what my last stop did better.",
        "replies": [
          [
            "How did they respond?",
            "Very politely. Nobody invited me to stay long."
          ],
          [
            "Did you notice why?",
            "Not until a friend repeated my own words back."
          ],
          [
            "What do you do now?",
            "Ask before comparing. Then remember I'm a guest."
          ]
        ]
      },
      {
        "title": "The unnecessary luggage",
        "opening": "What have you carried that you wished you'd left behind?",
        "first": "I carried a spare cooking pot for weeks without using the first one.",
        "replies": [
          [
            "Why bring two?",
            "One nested inside the other. It looked efficient."
          ],
          [
            "When did you leave it behind?",
            "After carrying both uphill in rain."
          ],
          [
            "What do you pack now?",
            "Things whose usefulness survives an honest question."
          ]
        ]
      },
      {
        "title": "Asking directions again",
        "opening": "Do you mind asking for directions a second time?",
        "first": "I used to pretend I'd understood directions because I feared looking foolish.",
        "replies": [
          [
            "Did that help?",
            "It made me foolish farther from the person who could help."
          ],
          [
            "What do you ask now?",
            "The first turn, then the next landmark."
          ],
          [
            "Do you still get lost?",
            "Certainly. I arrive at the admission sooner."
          ]
        ]
      }
    ],
    "greetings": [
      "Edric. I've been here long enough to know one useful direction.",
      "I'm Corin. Which one?",
      "Corin! Another traveller willing to remain seated.",
      "A welcome ambition.",
      "A dragon is a rather memorable way to arrive.",
      "I'm Corin. Aurelius handles the memorable part."
    ]
  },
  "Dorr": {
    "name": "Dorr",
    "home": "Copper Cup",
    "role": "Night worker",
    "source": "06-copper-cup.txt:26",
    "topics": [
      {
        "title": "Work after dark",
        "opening": "What is it like working after everyone else has gone to bed?",
        "first": "People see me resting in daylight and offer advice about industry. I was working while they slept.",
        "replies": [
          [
            "Do you explain?",
            "If I have the energy. That's rather the problem."
          ],
          [
            "Do you like night work?",
            "The quiet, yes. The disrupted meals, less so."
          ],
          [
            "Would you change shifts?",
            "For the right work. Sleep deserves some negotiation."
          ]
        ]
      },
      {
        "title": "A tired promise",
        "opening": "Have you ever agreed to something because you were too tired to argue?",
        "first": "I once agreed to help someone move before remembering it followed my night shift.",
        "replies": [
          [
            "Did you manage?",
            "Badly. We both would have preferred an honest refusal."
          ],
          [
            "Did they forgive you?",
            "Yes. They'd have asked someone else if I'd explained."
          ],
          [
            "What do you say now?",
            "Let me check when I'll actually be awake."
          ]
        ]
      },
      {
        "title": "A small holiday",
        "opening": "What would you do with a little time off?",
        "first": "My ideal holiday includes breakfast whenever I wake, with no apology.",
        "replies": [
          [
            "No grand journey?",
            "A grand journey often begins at an offensive hour."
          ],
          [
            "What would you do afterward?",
            "Walk somewhere pleasant, then sit somewhere pleasant."
          ],
          [
            "Would you want company?",
            "Someone who doesn't consider resting a wasted day."
          ]
        ]
      }
    ],
    "greetings": [
      "Dorr. I'm awake, despite appearances. Just on a different schedule.",
      "I'm Corin. I'll keep my voice reasonable.",
      "Corin. A conversation that won't require standing?",
      "Gladly.",
      "A dragon is a powerful argument for staying awake.",
      "I'm Corin. Aurelius wasn't meant as an alarm."
    ]
  },
  "Ser Anwen": {
    "name": "Ser Anwen",
    "home": "Copper Cup",
    "role": "Knight",
    "source": "06-copper-cup.txt:31",
    "topics": [
      {
        "title": "An incomplete order",
        "opening": "What do you do when an order leaves something important unsaid?",
        "first": "An officer ordered a household searched and wouldn't explain what we were looking for.",
        "replies": [
          [
            "Did you question him?",
            "Yes. Vague suspicion gives frightened soldiers too much freedom."
          ],
          [
            "Did he answer?",
            "Enough to narrow the search. Not enough to justify his temper."
          ],
          [
            "Was questioning dangerous?",
            "Sometimes. Rank changes how safely you can object."
          ]
        ]
      },
      {
        "title": "Fear in training",
        "opening": "Do recruits admit when they're frightened?",
        "first": "I was frightened of my first practice opponent and furious with myself for showing it.",
        "replies": [
          [
            "Did it get easier?",
            "When someone taught me where to put my feet."
          ],
          [
            "What about the fear?",
            "It became something I could work through, not evidence I shouldn't be there."
          ],
          [
            "Do you still feel it?",
            "Yes. Anyone promising otherwise may be selling courage too cheaply."
          ]
        ]
      },
      {
        "title": "An unrecorded kindness",
        "opening": "Have you ever helped someone without putting it in a report?",
        "first": "A guard once gave a cold prisoner his spare coat. No one put it in the report.",
        "replies": [
          [
            "Did you?",
            "No. I've regretted that omission."
          ],
          [
            "Why remember it now?",
            "Because duty is often described as though kindness interferes with it."
          ],
          [
            "Did the prisoner thank him?",
            "He was shaking too hard. Thanks wasn't the condition."
          ]
        ]
      }
    ],
    "greetings": [
      "Anwen. You needn't stand straighter on my account.",
      "I'm Corin. I'll stop trying, then.",
      "Corin. Have we time to talk without orders interrupting?",
      "I hope so.",
      "A dragon beside a young traveller. I should hear your names first.",
      "Corin, and Aurelius. We'd welcome that approach."
    ]
  },
  "Grusk": {
    "name": "Grusk",
    "home": "Copper Cup",
    "role": "Retired haulier",
    "source": "06-copper-cup.txt:36",
    "topics": [
      {
        "title": "The small favour",
        "opening": "Do people ask you for help with small things?",
        "first": "A neighbour called moving a wardrobe a small favour. I asked which part was small.",
        "replies": [
          [
            "Did you help?",
            "After we found enough people to do it safely."
          ],
          [
            "Were they offended?",
            "Only until they tried lifting their end."
          ],
          [
            "Do people ask often?",
            "Often enough that I can hear furniture in an introduction."
          ]
        ]
      },
      {
        "title": "A delicate hobby",
        "opening": "Do you have any hobbies that would surprise people?",
        "first": "I mend small wooden boxes. People seem disappointed that I don't collect boulders.",
        "replies": [
          [
            "Why boxes?",
            "Precise work, quiet tools, a satisfying lid."
          ],
          [
            "Are your hands too large?",
            "For other people's assumptions, apparently. The boxes manage."
          ],
          [
            "Do you sell them?",
            "Sometimes. Mostly I enjoy giving them to particular friends."
          ]
        ]
      },
      {
        "title": "Being quiet",
        "opening": "Do you mind sitting quietly with someone?",
        "first": "If I don't speak in a group, people assume I'm angry. Usually I'm listening.",
        "replies": [
          [
            "Do you tell them?",
            "Yes. Then they ask what I'm thinking."
          ],
          [
            "What are you thinking?",
            "Often that somebody ought to let the quieter person finish."
          ],
          [
            "Do you like company?",
            "Very much. I simply don't need to occupy all of it."
          ]
        ]
      }
    ],
    "greetings": [
      "Grusk. Before you ask, I came here to sit, not lift something.",
      "I'm Corin. No lifting requested.",
      "Corin. A visitor with conveniently empty hands.",
      "I'm protecting your retirement.",
      "Another large fellow people will ask to move things.",
      "I'm Corin. Aurelius gets to decline as well."
    ]
  },
  "Fen": {
    "name": "Fen",
    "home": "Copper Cup",
    "role": "Dancer",
    "source": "06-copper-cup.txt:41",
    "topics": [
      {
        "title": "Missing the beat",
        "opening": "Have you ever lost the beat while dancing?",
        "first": "I once lost the rhythm and confidently led three people in the wrong direction.",
        "replies": [
          [
            "Did anyone fall?",
            "No. We became a separate, confused dance."
          ],
          [
            "What did you do?",
            "Laughed, stopped, and found the beat again."
          ],
          [
            "Were they annoyed?",
            "Less once I stopped pretending it was deliberate."
          ]
        ]
      },
      {
        "title": "Watching is joining",
        "opening": "Does watching the dancing make you feel left out?",
        "first": "I dislike pulling reluctant people into a dance. Watching can be their way of enjoying it.",
        "replies": [
          [
            "Have you done that before?",
            "Yes. Their smile didn't mean what I wanted it to."
          ],
          [
            "How do you invite now?",
            "Once, with an answer I'm willing to accept."
          ],
          [
            "What if they're merely shy?",
            "Then they know the invitation exists. I leave them room."
          ]
        ]
      },
      {
        "title": "Giving freely",
        "opening": "How do you decide when to give something away?",
        "first": "I like making gifts. I dislike hearing people list everything the recipient owes afterward.",
        "replies": [
          [
            "Have you felt indebted?",
            "Yes. It spoiled a gift I had loved."
          ],
          [
            "How do you avoid that?",
            "Give only what I'm willing to part with."
          ],
          [
            "Is thanks enough?",
            "Usually. Sometimes seeing something used is even nicer."
          ]
        ]
      }
    ],
    "greetings": [
      "Fen. You can join a celebration without proving you can dance.",
      "I'm Corin. That's an encouraging rule.",
      "Corin! Shall we leave your feet out of this conversation?",
      "They'd be grateful.",
      "A dragon! I suspect he has better balance than I do.",
      "I'm Corin, and this is Aurelius. He gets more practice landing."
    ]
  },
  "Senn": {
    "name": "Senn",
    "home": "Copper Cup",
    "role": "Game enthusiast",
    "source": "06-copper-cup.txt:46",
    "topics": [
      {
        "title": "A wager refused",
        "opening": "Have you ever refused a wager?",
        "first": "I refused a wager after noticing my opponent couldn't comfortably lose it.",
        "replies": [
          [
            "Did they insist?",
            "Yes. I suggested playing for the pleasure of winning."
          ],
          [
            "Were they insulted?",
            "Briefly. Then we had a better game."
          ],
          [
            "Do you never wager?",
            "Small things, when everyone can laugh at losing."
          ]
        ]
      },
      {
        "title": "A surprise for family",
        "opening": "Have you managed to surprise your family?",
        "first": "I organised a surprise supper for my brother. He'd planned an evening alone.",
        "replies": [
          [
            "Was he unhappy?",
            "Overwhelmed. I'd arranged what I would have liked."
          ],
          [
            "Did you apologise?",
            "Yes. Then helped people leave before he had to ask."
          ],
          [
            "Would you try again?",
            "With fewer surprises and his actual agreement."
          ]
        ]
      },
      {
        "title": "Learning a new game",
        "opening": "Do you enjoy learning games you aren't good at yet?",
        "first": "I enjoy being terrible at a new game before I begin caring about winning.",
        "replies": [
          [
            "How long does that last?",
            "About twenty minutes. I'm working on extending it."
          ],
          [
            "Do you ask for help?",
            "After exhausting several obviously poor ideas."
          ],
          [
            "What's your favourite part?",
            "The moment a rule becomes a possibility instead of an obstacle."
          ]
        ]
      }
    ],
    "greetings": [
      "Senn. You look like someone who might read the rules before disagreeing with them.",
      "I'm Corin. I can try.",
      "Corin! I've found a game without wagers.",
      "That sounds easier on my purse.",
      "A dragon would make cheating considerably more intimidating.",
      "I'm Corin. Aurelius isn't here to supervise your cards."
    ]
  },
  "Dain": {
    "name": "Dain",
    "home": "Copper Cup",
    "role": "Card player",
    "source": "06-copper-cup.txt:51",
    "topics": [
      {
        "title": "The quiet opponent",
        "opening": "Can you tell much about a quiet opponent?",
        "first": "I underestimated a quiet card player. She let me explain the game, then beat me three times.",
        "replies": [
          [
            "Did she already know it?",
            "She'd taught my teacher. I learned that last."
          ],
          [
            "Were you gracious?",
            "Not immediately. I've improved the story since."
          ],
          [
            "Did you play her again?",
            "Yes. I asked for advice before providing any."
          ]
        ]
      },
      {
        "title": "A growing story",
        "opening": "Does a story get larger every time you tell it?",
        "first": "Each time I described a victory, my opponent became more formidable. Eventually a friend asked whether I'd defeated an army.",
        "replies": [
          [
            "Had you exaggerated much?",
            "Enough that the original opponent wouldn't recognise himself."
          ],
          [
            "Did you correct it?",
            "Yes. The real game was actually interesting."
          ],
          [
            "Why add to it?",
            "I wanted the attention more than I respected the memory."
          ]
        ]
      },
      {
        "title": "Playing without money",
        "opening": "Would you still play if there were no money involved?",
        "first": "Without a wager I take risks I'd never afford otherwise. The game becomes less tidy and more fun.",
        "replies": [
          [
            "Do you still want to win?",
            "Fiercely. My purse simply gets an evening off."
          ],
          [
            "Do others agree?",
            "Some. Others miss looking solemn over tiny coins."
          ],
          [
            "Would you teach me?",
            "Gladly, if you promise to interrupt a poor explanation."
          ]
        ]
      }
    ],
    "greetings": [
      "Dain. Ignore anyone who introduces me as the fellow who lost yesterday.",
      "I'm Corin. I hadn't heard, until now.",
      "Corin! My reputation has had time to recover.",
      "Should I avoid asking from what?",
      "A dragon. Well, you've won the interesting entrance.",
      "I'm Corin. Aurelius wasn't aware of the contest."
    ]
  },
  "Rusk": {
    "name": "Rusk",
    "home": "Copper Cup",
    "role": "Experienced traveller",
    "source": "06-copper-cup.txt:56",
    "topics": [
      {
        "title": "Old advice",
        "opening": "Is there any advice you once believed and no longer do?",
        "first": "I once recommended a bridge that no longer stood. My information had been sound and had become dangerous.",
        "replies": [
          [
            "Did the traveller reach it?",
            "Yes, then sensibly turned back. I apologised when he returned."
          ],
          [
            "How do you check now?",
            "Ask recent travellers and state what I haven't confirmed."
          ],
          [
            "Do people dislike uncertainty?",
            "Some do. A confident mistake remains worse company."
          ]
        ]
      },
      {
        "title": "A journey declined",
        "opening": "Have you ever decided against taking a journey?",
        "first": "I turned down a profitable journey because the weather was worsening. Others called me timid.",
        "replies": [
          [
            "Were you proved right?",
            "I don't know. Good judgement shouldn't require someone else suffering."
          ],
          [
            "Did you lose the money?",
            "Yes. I kept the freedom to regret it somewhere warm."
          ],
          [
            "Was it an easy decision?",
            "Not remotely. Fear of looking foolish is expensive."
          ]
        ]
      },
      {
        "title": "Arriving safely",
        "opening": "What matters most when you reach the end of a trip?",
        "first": "My favourite part of a journey is taking my boots off somewhere I expect to sleep.",
        "replies": [
          [
            "Not the scenery?",
            "Scenery improves after that too."
          ],
          [
            "What do you do first?",
            "Wash, eat, then decide whether I want conversation."
          ],
          [
            "Do you miss travelling at home?",
            "After a while. I apparently require both arrival and departure."
          ]
        ]
      }
    ],
    "greetings": [
      "Rusk. Road advice comes with a date. Ask when I travelled before trusting it.",
      "I'm Corin. That's useful advice already.",
      "Corin. Arrived in one piece and willing to sit?",
      "Both, fortunately.",
      "Wings won't make every road report relevant to both of you.",
      "I'm Corin. Aurelius and I still need places to rest."
    ]
  },
  "Linnet": {
    "name": "Linnet",
    "home": "Copper Cup",
    "role": "Musician",
    "source": "06-copper-cup.txt:61",
    "topics": [
      {
        "title": "An unwelcome request",
        "opening": "Do people request songs you'd rather not play?",
        "first": "A guest requested a song another guest had asked me to avoid. I chose something else entirely.",
        "replies": [
          [
            "Did they complain?",
            "One did. I told him he wasn't the whole audience."
          ],
          [
            "Why did the other dislike it?",
            "A private reason. It didn't need public explanation."
          ],
          [
            "Was there a better solution?",
            "Perhaps. Keeping the evening pleasant seemed sufficient."
          ]
        ]
      },
      {
        "title": "Playing beside someone",
        "opening": "What's it like playing alongside another musician?",
        "first": "Another musician once slowed to match my playing instead of showing everyone I was behind.",
        "replies": [
          [
            "Did you thank them?",
            "Afterward. During the tune I was busy recovering."
          ],
          [
            "Do you do that now?",
            "Whenever I can. Music isn't improved by humiliating a partner."
          ],
          [
            "Were they the better player?",
            "Much better. Secure enough not to announce it."
          ]
        ]
      },
      {
        "title": "A wrong note",
        "opening": "What do you do when you hit a wrong note?",
        "first": "One wrong note feels enormous to the player. Listeners may already be following the next phrase.",
        "replies": [
          [
            "Can you ignore it?",
            "I notice it without stopping the whole tune."
          ],
          [
            "Do you ever start over?",
            "If I've lost the piece entirely. It happens."
          ],
          [
            "What helps you recover?",
            "Knowing the music well enough to find another entrance."
          ]
        ]
      }
    ],
    "greetings": [
      "Linnet. If you've a request, humming is more useful than describing the third verse.",
      "I'm Corin. I'll spare you my humming for now.",
      "Corin! A listener I recognise.",
      "I came to hear you talk this time.",
      "Would your companion like music, or would that startle him?",
      "I'm Corin. I'll ask Aurelius before deciding for him."
    ]
  },
  "Puck": {
    "name": "Puck",
    "home": "Copper Cup",
    "role": "Music lover",
    "source": "06-copper-cup.txt:66",
    "topics": [
      {
        "title": "The wrong chorus",
        "opening": "Have you ever sung the wrong chorus?",
        "first": "I sang a chorus wrong for years. Apparently I had been celebrating a wheelbarrow rather than a wedding.",
        "replies": [
          [
            "Who corrected you?",
            "Linnet, after trying very hard not to laugh."
          ],
          [
            "Did you change it?",
            "In public. The wheelbarrow has sentimental value."
          ],
          [
            "Were the words similar?",
            "Enough to defend my childhood, not my adulthood."
          ]
        ]
      },
      {
        "title": "Enjoying music badly",
        "opening": "Can someone enjoy music without being any good at it?",
        "first": "I sing enthusiastically and inaccurately. Those qualities occasionally compete.",
        "replies": [
          [
            "Do people mind?",
            "I ask, especially in small rooms."
          ],
          [
            "Would lessons help?",
            "Probably. I'd have to stop pretending enthusiasm was practice."
          ],
          [
            "Why do you love it?",
            "Everyone breathing toward the same next line. It's a lovely feeling."
          ]
        ]
      },
      {
        "title": "One more song",
        "opening": "How do you know when to stop asking for one more song?",
        "first": "I keep deciding to leave after the next song. Musicians are inconsiderate about playing another good one.",
        "replies": [
          [
            "Do you miss appointments?",
            "Only when I make the foolish mistake of promising punctuality."
          ],
          [
            "Is that worth staying for?",
            "Some evenings. Others I discover I'm merely avoiding going home."
          ],
          [
            "Would you perform yourself?",
            "With friends, perhaps. An audience deserves some preparation."
          ]
        ]
      }
    ],
    "greetings": [
      "Puck. Human, despite the name. My parents enjoyed making introductions longer.",
      "I'm Corin. They seem to have succeeded.",
      "Corin! I've learned most of a chorus.",
      "Should I prepare for the remaining part?",
      "A dragon! For once I won't be the loudest surprise.",
      "I'm Corin. Aurelius hasn't heard your chorus yet."
    ]
  },
  "Vale": {
    "name": "Vale",
    "home": "Copper Cup",
    "role": "Reader and traveller",
    "source": "06-copper-cup.txt:71",
    "topics": [
      {
        "title": "An obsolete word",
        "opening": "Do you find words that nobody uses anymore?",
        "first": "I found an old word for a person who promises to leave and continues talking. I've been hoping to use it.",
        "replies": [
          [
            "Will you tell me the word?",
            "I've forgotten it. A devastating failure of preparation."
          ],
          [
            "Do you collect words?",
            "Useful ones and splendidly useless ones."
          ],
          [
            "Which is this?",
            "Potentially useful, provided I remember it before the guest leaves."
          ]
        ]
      },
      {
        "title": "A reliable breakfast",
        "opening": "What makes a dependable breakfast?",
        "first": "When travelling, I prefer a breakfast I recognise. I have the rest of the day for uncertainty.",
        "replies": [
          [
            "Doesn't that seem dull?",
            "Only to someone else eating it."
          ],
          [
            "What's your preference?",
            "Bread, something warm, and no lecture about local delicacies."
          ],
          [
            "Do you ever try new food?",
            "At lunch, when discovery feels less aggressive."
          ]
        ]
      },
      {
        "title": "A question declined",
        "opening": "Do you ever decide not to answer a question?",
        "first": "A stranger once asked why I travelled alone. I told him I preferred discussing where I was going.",
        "replies": [
          [
            "Did he accept that?",
            "After trying again. I repeated myself without elaborating."
          ],
          [
            "Was he being unkind?",
            "Perhaps just curious. I still owed him no explanation."
          ],
          [
            "What may I ask you?",
            "About books, roads, and breakfast. A generous territory."
          ]
        ]
      }
    ],
    "greetings": [
      "Vale. I prefer questions that permit a short answer.",
      "I'm Corin. I'll begin with hello.",
      "Corin. An exception to my usual preference for my book.",
      "I'll try not to abuse the honour.",
      "A dragon must attract questions you didn't invite.",
      "I'm Corin. Aurelius and I have noticed that."
    ]
  },
  "Cerys": {
    "name": "Cerys",
    "home": "Copper Cup",
    "role": "Curious observer",
    "source": "06-copper-cup.txt:76",
    "topics": [
      {
        "title": "An unfair guess",
        "opening": "Have you ever judged someone unfairly?",
        "first": "I thought a quiet neighbour disliked everyone. Then discovered she was struggling to hear the conversation.",
        "replies": [
          [
            "How did you learn?",
            "She asked me to face her when speaking."
          ],
          [
            "Did you feel foolish?",
            "Yes. I'd made a personality out of missing information."
          ],
          [
            "Did you become friends?",
            "We talk more easily now. I ask rather than interpret."
          ]
        ]
      },
      {
        "title": "Your sister's complaint",
        "opening": "Does your sister enjoy being asked so many questions?",
        "first": "My sister says I turn ordinary chats into investigations. She would sometimes like to mention lunch without explaining herself.",
        "replies": [
          [
            "Is she right?",
            "Entirely. I had a follow-up question before she finished."
          ],
          [
            "What did you say?",
            "That I'd try. Then, with effort, stopped speaking."
          ],
          [
            "Do you manage better now?",
            "Some days. She reminds me with the word 'lunch'."
          ]
        ]
      },
      {
        "title": "Being mistaken",
        "opening": "What do you do when you realise you've been mistaken?",
        "first": "I enjoy a surprising answer unless I've already announced the opposite too confidently.",
        "replies": [
          [
            "What do you do then?",
            "Try to look interested while my pride catches up."
          ],
          [
            "Does anyone notice?",
            "My sister always notices."
          ],
          [
            "Why keep asking questions?",
            "Because being right about everything I already know sounds dull."
          ]
        ]
      }
    ],
    "greetings": [
      "Cerys. I ask too many questions; you're allowed to return some of them.",
      "I'm Corin. I'll remember the invitation.",
      "Corin. Shall I listen first this time?",
      "I might take you up on that.",
      "A dragon's friend must have a life beyond introducing the dragon.",
      "I'm Corin. Thank you for starting there."
    ]
  },
  "Nyra": {
    "name": "Nyra",
    "home": "Copper Cup",
    "role": "Performer and card player",
    "source": "06-copper-cup.txt:81",
    "topics": [
      {
        "title": "A failed trick",
        "opening": "Have you ever had a trick fail in front of everyone?",
        "first": "A coin fell from my sleeve before I'd asked anyone to choose a hand. The audience enjoyed it enormously.",
        "replies": [
          [
            "Did you recover?",
            "I asked them to forget what they'd just witnessed. That helped nobody."
          ],
          [
            "Were you upset?",
            "For a moment. Then I realised they were still having fun."
          ],
          [
            "Do you practise that trick?",
            "Especially that one. Affectionate laughter is still information."
          ]
        ]
      },
      {
        "title": "Knowing the secret",
        "opening": "Is a trick still enjoyable once you know how it works?",
        "first": "Some spectators enjoy a trick more after learning how it works. Others prefer the mystery.",
        "replies": [
          [
            "Which do you prefer?",
            "Knowing, then admiring the practice it took."
          ],
          [
            "Do you reveal every trick?",
            "No. I ask what kind of pleasure they came for."
          ],
          [
            "Is pretending dishonest?",
            "An agreed illusion is a game. Taking someone's money under false pretences is different."
          ]
        ]
      },
      {
        "title": "A game worth losing",
        "opening": "Can losing a game be worth it?",
        "first": "I enjoy an opponent who makes a good move I didn't anticipate. Even when it ruins my plan.",
        "replies": [
          [
            "Do you congratulate them?",
            "After a brief internal complaint."
          ],
          [
            "Would you rather win easily?",
            "Once, perhaps. Repeatedly would be tedious."
          ],
          [
            "What makes a bad opponent?",
            "Someone who treats losing as permission to be cruel."
          ]
        ]
      }
    ],
    "greetings": [
      "Nyra. You may watch my hands, though that won't necessarily help.",
      "I'm Corin. Should I watch your expression too?",
      "Corin! No performance required this evening.",
      "I'm glad to have met the person behind it.",
      "A dragon makes a disappearing coin seem rather small.",
      "I'm Corin. Aurelius leaves the coin tricks to you."
    ]
  },
  "Prue": {
    "name": "Prue",
    "home": "Forgewick",
    "role": "Stonemason",
    "source": "07-forgewick.txt:1",
    "topics": [
      {
        "title": "An arch without mortar",
        "opening": "How does an arch stand without mortar?",
        "first": "An arch can hold because each stone presses against its neighbours. Remove the wrong one and the whole arrangement objects.",
        "replies": [
          [
            "How do you build it safely?",
            "Support it from underneath until the stones are fitted."
          ],
          [
            "Who taught you?",
            "A mason who made me draw the forces before touching a chisel."
          ],
          [
            "Could you make one alone?",
            "A small one. For larger work, I'd prefer living colleagues."
          ]
        ]
      },
      {
        "title": "A commission you want",
        "opening": "What would you most like to be commissioned to build?",
        "first": "I'd like to build a covered gathering place where a person can sit without buying anything.",
        "replies": [
          [
            "Why that building?",
            "Rain shouldn't send every lonely person home."
          ],
          [
            "Who would pay for it?",
            "That's the difficult drawing. Stone is simpler than funding."
          ],
          [
            "What would you include?",
            "Broad steps, shelter, and seats with backs. Knees deserve consideration."
          ]
        ]
      },
      {
        "title": "A stubborn signature",
        "opening": "Do you put your name on your work?",
        "first": "I hide a tiny mark in finished stonework. My father said a mason shouldn't need applause.",
        "replies": [
          [
            "Did he mark his work?",
            "Of course. Underneath, where he thought nobody checked."
          ],
          [
            "Have you found his marks?",
            "Several. I feel absurdly pleased whenever I do."
          ],
          [
            "Will people find yours?",
            "I hope someone curious will, long after I've stopped explaining them."
          ]
        ]
      }
    ],
    "greetings": [
      "Prue. Mason. If you ask whether the work is heavy, I'll make you carry some.",
      "I'm Corin. I had a different question ready.",
      "Corin, you're back before I've become famous.",
      "I'll remember I knew you beforehand.",
      "A dragon. Now there's a client who would test a foundation.",
      "I'm Corin, and this is Aurelius. We're only visiting."
    ]
  },
  "Toft": {
    "name": "Toft",
    "home": "Forgewick",
    "role": "Former miner and provisions merchant",
    "source": "07-forgewick.txt:6",
    "topics": [
      {
        "title": "Leaving the mine",
        "opening": "Why did you leave the mine?",
        "first": "I left mining after my shoulder stopped forgiving me overnight. I disliked admitting it before I disliked the pain.",
        "replies": [
          [
            "Was the shop your first plan?",
            "No. I tried resting and became unbearable."
          ],
          [
            "Do you miss the crew?",
            "Yes. They visit and insult my prices affectionately."
          ],
          [
            "Is trading easier?",
            "On the shoulder. Arithmetic has found other ways to hurt me."
          ]
        ]
      },
      {
        "title": "Stock that sells slowly",
        "opening": "What happens to stock that doesn't sell?",
        "first": "A shelf full of useful goods can still bankrupt a shop if nobody needs them this month.",
        "replies": [
          [
            "How do you choose stock?",
            "Watch what people actually buy, then listen to what they couldn't find."
          ],
          [
            "Have you guessed badly?",
            "Bought far too many cooking pots. Everyone owned one already."
          ],
          [
            "What happened to them?",
            "Sold slowly. I became exceptionally knowledgeable about pots."
          ]
        ]
      },
      {
        "title": "Underground lunches",
        "opening": "What did you eat underground during a shift?",
        "first": "A warm meal after a shift could improve my opinion of the entire world.",
        "replies": [
          [
            "What did you want most?",
            "Thick stew and enough bread to clean the bowl."
          ],
          [
            "Did you cook it?",
            "Eventually. Waiting for someone else made supper unreliable."
          ],
          [
            "Are you any good?",
            "My former crew still visits at suspiciously convenient hours."
          ]
        ]
      }
    ],
    "greetings": [
      "Toft. Ask what you need, and I'll spare you a sales performance.",
      "Corin. Much appreciated.",
      "Corin! Customer, neighbour, or merely sheltering from conversation elsewhere?",
      "A visitor, if that's allowed.",
      "A dragon changes the scale of a provisions list.",
      "I'm Corin. Aurelius and I still begin with the basics."
    ]
  },
  "Ovid": {
    "name": "Ovid",
    "home": "Forgewick",
    "role": "Market organiser",
    "source": "07-forgewick.txt:11",
    "topics": [
      {
        "title": "The shared passage",
        "opening": "Do you get along with the people sharing your passage?",
        "first": "Two traders claimed the same strip of market ground. Neither had noticed customers could no longer pass.",
        "replies": [
          [
            "How did you settle it?",
            "Marked a passage before dividing the stalls."
          ],
          [
            "Were they satisfied?",
            "After business improved. Principles bend nicely around customers."
          ],
          [
            "Does it happen often?",
            "Whenever a successful stall acquires another basket."
          ]
        ]
      },
      {
        "title": "A market sound",
        "opening": "Is there a market sound you'd recognise anywhere?",
        "first": "I can tell when a delivery has arrived by the change in voices. Everyone becomes briefly optimistic.",
        "replies": [
          [
            "Even the complainers?",
            "Especially them. Fresh goods provide fresh complaints."
          ],
          [
            "What do you enjoy buying?",
            "Something I didn't have to organise personally."
          ],
          [
            "Do you ever shop elsewhere?",
            "Yes. Being anonymous is a delightful luxury."
          ]
        ]
      },
      {
        "title": "An empty stall",
        "opening": "What happens when a stall stands empty?",
        "first": "When an old trader retired, people complained about the empty space. Few had visited him lately.",
        "replies": [
          [
            "Did you tell them?",
            "I suggested visiting his home while he could enjoy it."
          ],
          [
            "Did anyone go?",
            "Several. He was pleased and pretended otherwise."
          ],
          [
            "Will someone take the stall?",
            "Eventually. I won't erase him by filling it quickly."
          ]
        ]
      }
    ],
    "greetings": [
      "Ovid. If you're disputing a stall boundary, bring measurements, not indignation.",
      "I'm Corin. No boundary dispute today.",
      "Corin. A conversation with no paperwork attached?",
      "That's my offer.",
      "Your companion could draw a crowd. Let's leave space for people to pass.",
      "I'm Corin; Aurelius and I will be careful."
    ]
  },
  "Garran": {
    "name": "Garran",
    "home": "Forgewick",
    "role": "Metalworker",
    "source": "07-forgewick.txt:16",
    "topics": [
      {
        "title": "An ordinary hinge",
        "opening": "Is an ordinary hinge harder to make than it looks?",
        "first": "A good hinge gets ignored for years. A bad one makes its maker famous by supper.",
        "replies": [
          [
            "Which do you prefer making?",
            "The forgotten sort. My customers can remember my name when paying."
          ],
          [
            "What's the hard part?",
            "Getting the fit right. Small errors become loud movements."
          ],
          [
            "Do you repair them too?",
            "Yes. It tells me where my work actually fails."
          ]
        ]
      },
      {
        "title": "Throwing contests",
        "opening": "Do you ever compete at throwing things?",
        "first": "We hold harmless throwing contests after work. Kerr says I'm too competitive about objects that aren't worth owning.",
        "replies": [
          [
            "What do you throw?",
            "Smooth stones at a mark, well away from people."
          ],
          [
            "Are you good?",
            "Good enough to notice when somebody improves."
          ],
          [
            "Does Kerr beat you?",
            "Occasionally. He insists those are the only recorded contests."
          ]
        ]
      },
      {
        "title": "A workday's noise",
        "opening": "Does the noise of work stay with you afterward?",
        "first": "After a day of metalwork, I enjoy hearing rain without hammers underneath it.",
        "replies": [
          [
            "Does silence feel strange?",
            "For a few minutes. Then my shoulders settle."
          ],
          [
            "Would you change trades?",
            "No. I'd like fewer people mistaking endurance for enjoyment."
          ],
          [
            "What sound do you like at work?",
            "A properly fitted latch. One clean click."
          ]
        ]
      }
    ],
    "greetings": [
      "Garran. Little hinges, little hooks, surprisingly large opinions.",
      "I'm Corin. I can manage the opinions.",
      "Corin! Come to discuss something bigger than a door fitting?",
      "I thought we might.",
      "I wonder how much force those claws exert.",
      "I'm Corin. Aurelius isn't volunteering for measurements."
    ]
  },
  "Nessa": {
    "name": "Nessa",
    "home": "Forgewick",
    "role": "Glass decorator",
    "source": "07-forgewick.txt:21",
    "topics": [
      {
        "title": "A painted fish",
        "opening": "Have you ever painted something that surprised its owner?",
        "first": "A customer wanted a noble-looking fish on a cup. Fish have limited access to noble expressions.",
        "replies": [
          [
            "What did you paint?",
            "A trout looking mildly offended. The customer adored it."
          ],
          [
            "Was it difficult?",
            "Less difficult once I stopped imagining eyebrows."
          ],
          [
            "Would you paint another?",
            "Gladly. Dignified vegetables are where I draw the line."
          ]
        ]
      },
      {
        "title": "Working with light",
        "opening": "How do you work with the light coming through glass?",
        "first": "A colour that looks rich indoors may look thin in sunlight. Glass refuses to stay one picture.",
        "replies": [
          [
            "How do you choose colours?",
            "Try them in different light before declaring victory."
          ],
          [
            "Do mistakes ruin a piece?",
            "Some. Others suggest an effect I'd never planned."
          ],
          [
            "Do you keep failed pieces?",
            "A few. They remind me what to test next time."
          ]
        ]
      },
      {
        "title": "A design of your own",
        "opening": "What would you design if the choice were entirely yours?",
        "first": "I'd like to make a window full of ordinary leaves, with no family crest demanding the centre.",
        "replies": [
          [
            "Why leaves?",
            "Their shapes vary without asking permission."
          ],
          [
            "Would anyone buy it?",
            "Perhaps. I want to draw it before worrying about that."
          ],
          [
            "What colours?",
            "Greens that shift toward gold. The difficult sort I keep promising myself."
          ]
        ]
      }
    ],
    "greetings": [
      "Nessa. I decorate glass; Sela makes it. People keep combining us into one very busy person.",
      "I'm Corin. I'll keep the distinction.",
      "Corin. Have you developed a scandalous preference in colours?",
      "Not yet, but there's time.",
      "Those scales would defeat a flat colour completely.",
      "I'm Corin. Aurelius changes with every angle."
    ]
  },
  "Kerr": {
    "name": "Kerr",
    "home": "Forgewick",
    "role": "Coal carrier",
    "source": "07-forgewick.txt:26",
    "topics": [
      {
        "title": "Dividing a load",
        "opening": "How do you divide a load fairly?",
        "first": "Two smaller journeys can be quicker than one load that stops you every ten steps.",
        "replies": [
          [
            "Did you learn that painfully?",
            "Yes. My back submitted the argument in writing."
          ],
          [
            "Does everyone agree?",
            "People watching from chairs favour heroic loads."
          ],
          [
            "What do you say to them?",
            "I offer them the straps. Opinions change remarkably fast."
          ]
        ]
      },
      {
        "title": "Sweet peas",
        "opening": "Do you grow sweet peas?",
        "first": "I want to grow sweet peas. Something delicate after carrying black dust all day.",
        "replies": [
          [
            "Have you started?",
            "A little. I'm learning that watering enthusiasm isn't a measurement."
          ],
          [
            "Why those flowers?",
            "The colour, the scent, and nobody orders them by the sack."
          ],
          [
            "Do neighbours tease you?",
            "Some. Then ask how the flowers are doing."
          ]
        ]
      },
      {
        "title": "Clean clothes",
        "opening": "Does keeping your clothes clean matter in your work?",
        "first": "I can wash thoroughly and still discover coal dust behind an ear. It has ambitions beyond my employment.",
        "replies": [
          [
            "Does that bother you?",
            "On special occasions. Ordinary days have surrendered."
          ],
          [
            "Do you wear black?",
            "No. That would let the coal win entirely."
          ],
          [
            "What's a special occasion?",
            "Any evening I promised someone I wouldn't discuss work."
          ]
        ]
      }
    ],
    "greetings": [
      "Kerr. If I seem cheerful, assume I've put the load down recently.",
      "I'm Corin. I'll catch you at a good moment.",
      "Corin! You arrived during the lighter half of my day.",
      "I won't add anything heavy.",
      "Those wings make a sack of coal look particularly unfair.",
      "I'm Corin. Aurelius has his own weight to carry."
    ]
  },
  "Brigid": {
    "name": "Brigid",
    "home": "Forgewick",
    "role": "Builder",
    "source": "07-forgewick.txt:31",
    "topics": [
      {
        "title": "A cold room",
        "opening": "How would you make a cold room warmer?",
        "first": "A grand room can be miserable if the door lets every gust through. People notice decoration before draughts.",
        "replies": [
          [
            "What would you change first?",
            "The gap admitting the wind. Then discuss expensive improvements."
          ],
          [
            "Do customers listen?",
            "After spending one winter with their beautiful draught."
          ],
          [
            "Can a small house be comfortable?",
            "Certainly. Planning matters more than impressing passers-by."
          ]
        ]
      },
      {
        "title": "Solving a puzzle",
        "opening": "Do you enjoy solving puzzles?",
        "first": "I enjoy fitting an awkward staircase into a plan. It's a puzzle people must safely use afterward.",
        "replies": [
          [
            "What's the common mistake?",
            "Making it fit on paper by forgetting a person's head."
          ],
          [
            "Have you done that?",
            "In a sketch. Fortunately, sketches bruise less."
          ],
          [
            "Do you like being corrected?",
            "More before the stone arrives than after."
          ]
        ]
      },
      {
        "title": "Building for neighbours",
        "opening": "Is it different building something for a neighbour?",
        "first": "A customer apologised for asking for a handrail. She thought it would spoil the appearance.",
        "replies": [
          [
            "What did you tell her?",
            "That arriving safely mattered more than an empty wall."
          ],
          [
            "Did it look awkward?",
            "No. Careful work can be useful and handsome."
          ],
          [
            "Do you have a favourite job?",
            "One someone uses every day without struggling anymore."
          ]
        ]
      }
    ],
    "greetings": [
      "Brigid. If you want a house judged, tell me where it leaks before describing the view.",
      "I'm Corin. That's a useful priority.",
      "Corin, come and interrupt an estimate.",
      "I hope it wasn't adding up nicely.",
      "A dragon would need a generous entrance.",
      "I'm Corin. Aurelius prefers room to turn around."
    ]
  },
  "Fara": {
    "name": "Fara",
    "home": "Forgewick",
    "role": "Mender",
    "source": "07-forgewick.txt:36",
    "topics": [
      {
        "title": "A sleeve's explanation",
        "opening": "Can a sleeve tell you why a garment doesn't fit?",
        "first": "A customer blamed a torn sleeve on a heroic rescue. It had caught on his own gate.",
        "replies": [
          [
            "How did you know?",
            "His wife had brought the other sleeve last month."
          ],
          [
            "Did you challenge him?",
            "I charged for the repair, not the performance."
          ],
          [
            "Was it a difficult repair?",
            "No. The explanation took longer than the stitching."
          ]
        ]
      },
      {
        "title": "Worth repairing",
        "opening": "How do you decide whether something is worth repairing?",
        "first": "I ask what an old coat means before suggesting a replacement. Sometimes the answer changes the work.",
        "replies": [
          [
            "Has that happened?",
            "A father's coat. The owner wanted the worn cuffs preserved."
          ],
          [
            "Could you manage it?",
            "Strengthened them underneath and left the familiar surface."
          ],
          [
            "Do you charge more for memories?",
            "For the work. Memories aren't an item on my bill."
          ]
        ]
      },
      {
        "title": "Choosing bright thread",
        "opening": "Do you prefer working with bright thread?",
        "first": "I sometimes mend with contrasting thread. A repair can look deliberate instead of apologetic.",
        "replies": [
          [
            "Do customers like that?",
            "When they choose it themselves. Surprise is risky on a favourite coat."
          ],
          [
            "What colour do you like?",
            "Red against dark blue. It looks confident."
          ],
          [
            "Would you do mine that way?",
            "If you brought a repair and asked. I won't invent one."
          ]
        ]
      }
    ],
    "greetings": [
      "Fara. Torn cloth tells a story; people usually tell a more flattering one.",
      "I'm Corin. I'll avoid presenting evidence.",
      "Corin! Nothing dangling from your sleeve today?",
      "Nothing I'd admit to yet.",
      "A dragon would certainly test a traveller's seams.",
      "I'm Corin. Aurelius is careful around my clothes."
    ]
  },
  "Garrick": {
    "name": "Garrick",
    "home": "Forgewick",
    "role": "Retired courier",
    "source": "07-forgewick.txt:41",
    "topics": [
      {
        "title": "The wrong household",
        "opening": "Have you ever taken a delivery to the wrong household?",
        "first": "I delivered a letter to the wrong family and learned that two brothers had married two sisters with similar names.",
        "replies": [
          [
            "How did you untangle it?",
            "Asked everyone to stop saying 'the other one'."
          ],
          [
            "Was the letter private?",
            "Fortunately it remained sealed. I checked before anything else."
          ],
          [
            "Did it happen again?",
            "Not there. Those names remain permanently engraved in my embarrassment."
          ]
        ]
      },
      {
        "title": "A good courier",
        "opening": "What makes someone a good courier?",
        "first": "A courier needs to know when a message matters more than looking brave about the weather.",
        "replies": [
          [
            "Did you ever delay one?",
            "Yes, when continuing would have lost both messenger and letter."
          ],
          [
            "Was the sender angry?",
            "Initially. The recipient preferred a living courier."
          ],
          [
            "What did you enjoy most?",
            "Seeing relief before someone even opened the message."
          ]
        ]
      },
      {
        "title": "Life after deliveries",
        "opening": "What was it like when people stopped expecting your arrival?",
        "first": "Retirement felt strange because nobody waited for my arrival. I hadn't known how much I'd miss that.",
        "replies": [
          [
            "What replaced it?",
            "Visits I arranged for myself."
          ],
          [
            "Was that difficult?",
            "Only admitting I wanted the company."
          ],
          [
            "Do you enjoy them more?",
            "I get to hear the story after delivering the news."
          ]
        ]
      }
    ],
    "greetings": [
      "Garrick. I know many roads and have no intention of walking one immediately.",
      "I'm Corin. We can talk from here.",
      "Corin! Arriving without a deadline suits you.",
      "It suits me too.",
      "A dragon courier would cause tremendous gossip.",
      "I'm Corin. Aurelius isn't collecting commissions."
    ]
  },
  "Junia": {
    "name": "Junia",
    "home": "Forgewick",
    "role": "Story writer",
    "source": "07-forgewick.txt:46",
    "topics": [
      {
        "title": "Too many beginnings",
        "opening": "Do you ever start too many stories at once?",
        "first": "I have six beginnings and one ending. Unfortunately the ending belongs to none of them.",
        "replies": [
          [
            "Could you combine them?",
            "That was my first mistake, yes."
          ],
          [
            "What happens in the ending?",
            "Someone finally admits where the missing pie went."
          ],
          [
            "I'd read that.",
            "Then I owe you enough story to make the pie matter."
          ]
        ]
      },
      {
        "title": "Your first reader",
        "opening": "Who gets to read your first drafts?",
        "first": "My friend reads my drafts and marks the places she wanted to stop.",
        "replies": [
          [
            "Does that hurt?",
            "Yes. Less than pretending every page works."
          ],
          [
            "Does she explain why?",
            "Usually. Sometimes she simply writes 'still talking about the door'."
          ],
          [
            "Do you listen?",
            "After sulking privately. I try to make the sulk brief."
          ]
        ]
      },
      {
        "title": "A comic villain",
        "opening": "Can a villain be funny without spoiling the story?",
        "first": "I gave a villain excellent manners and terrible patience. He apologised before every threat.",
        "replies": [
          [
            "Was he frightening?",
            "Until he began correcting the hero's grammar."
          ],
          [
            "Did you change him?",
            "No. I changed the sort of story I was writing."
          ],
          [
            "Is he based on someone?",
            "Several people. None would accept the comparison gracefully."
          ]
        ]
      }
    ],
    "greetings": [
      "Junia. If you ask whether I've finished my story, I reserve the right to change the subject.",
      "I'm Corin. I can begin elsewhere.",
      "Corin! I finished a paragraph I actually like.",
      "That's worth celebrating.",
      "A dragon is unfair competition for an invented adventure.",
      "I'm Corin. Aurelius brings plenty of ordinary inconveniences too."
    ]
  },
  "Kellan": {
    "name": "Kellan",
    "home": "Forgewick",
    "role": "Apprentice toolmaker",
    "source": "07-forgewick.txt:51",
    "topics": [
      {
        "title": "The first file",
        "opening": "Do you remember using a file for the first time?",
        "first": "I spent days learning to make a surface flat. Apparently 'looks flat' was an optimistic first draft.",
        "replies": [
          [
            "How do you check it?",
            "Against a known straight edge, from several angles."
          ],
          [
            "Did you get frustrated?",
            "Frequently. Then I could finally see what my teacher meant."
          ],
          [
            "Was that satisfying?",
            "Enough that I made everyone inspect a very ordinary piece of metal."
          ]
        ]
      },
      {
        "title": "Inventing a game",
        "opening": "Have you ever invented a game?",
        "first": "I designed a board game and won every trial because only I understood the rules.",
        "replies": [
          [
            "Did your friends object?",
            "They proposed a rule against explanations that changed mid-turn."
          ],
          [
            "Did you rewrite it?",
            "Yes. It became harder for me and better for everyone."
          ],
          [
            "Would you make another?",
            "After this one survives an evening without an argument."
          ]
        ]
      },
      {
        "title": "Your own workshop",
        "opening": "Would you like a workshop of your own?",
        "first": "I picture having my own workshop. In the picture, no one asks me to calculate rent.",
        "replies": [
          [
            "What would you make?",
            "Tools small enough that I could inspect every part myself."
          ],
          [
            "Would you work alone?",
            "Probably not. I learn too much from other people's questions."
          ],
          [
            "What's stopping you now?",
            "Experience, money, and an entirely reasonable shortage of both."
          ]
        ]
      }
    ],
    "greetings": [
      "Kellan. Apprentice, before you entrust me with anything expensive.",
      "I'm Corin. I appreciate the warning.",
      "Corin! I've made something that fits on the first attempt.",
      "A day worth remembering.",
      "Those claws seem like tools with opinions.",
      "I'm Corin. Aurelius would certainly have an opinion about that."
    ]
  },
  "Lysa": {
    "name": "Lysa",
    "home": "Forgewick",
    "role": "Weaver",
    "source": "07-forgewick.txt:56",
    "topics": [
      {
        "title": "A gift gone wrong",
        "opening": "Have you ever chosen a gift badly?",
        "first": "I made a friend a beautiful shawl in my favourite colour. Hers was entirely different.",
        "replies": [
          [
            "Did she tell you?",
            "She wore it only when I visited. Eventually I understood."
          ],
          [
            "What did you do?",
            "Asked what she'd actually like and made that."
          ],
          [
            "Was the first wasted?",
            "No. She gave it to someone delighted by purple."
          ]
        ]
      },
      {
        "title": "Cloth for daily use",
        "opening": "How do you choose cloth for something people use every day?",
        "first": "I like making sturdy cloth. Some customers hear 'sturdy' and imagine something ugly.",
        "replies": [
          [
            "Can it be both?",
            "Strong and beautiful, certainly. Expensive and unsuitable is also possible."
          ],
          [
            "What do you test?",
            "Edges, seams, how it behaves after washing."
          ],
          [
            "What pleases you most?",
            "Seeing a piece still used years after I forgot the order."
          ]
        ]
      },
      {
        "title": "A journey you'd choose",
        "opening": "Where would you go if you didn't have to sell anything?",
        "first": "I'd like to see the sea without having to sell anything when I arrive.",
        "replies": [
          [
            "Why the sea?",
            "A horizon nobody has divided into fields."
          ],
          [
            "Would you stay long?",
            "Long enough to stop thinking about the journey back."
          ],
          [
            "Would you go alone?",
            "With someone content to sit quietly beside water."
          ]
        ]
      }
    ],
    "greetings": [
      "Lysa. If you dislike a colour, say so before I spend an afternoon praising it.",
      "I'm Corin. I'll be honest.",
      "Corin! Another chance to discuss something besides thread counts.",
      "I can offer several subjects.",
      "A dragon's colours change whenever he moves.",
      "I'm Corin. Aurelius doesn't hold a pose for long."
    ]
  },
  "Cinder": {
    "name": "Cinder",
    "home": "Forgewick",
    "role": "Former forge tender",
    "source": "07-forgewick.txt:61",
    "topics": [
      {
        "title": "Watching the fire",
        "opening": "What do you watch for in a fire?",
        "first": "Tending a forge meant watching changes nobody else noticed until something went wrong.",
        "replies": [
          [
            "Could you leave it alone?",
            "Not for long. Heat changes work while you're distracted."
          ],
          [
            "Did you enjoy it?",
            "The skill, yes. The endless vigilance, less so."
          ],
          [
            "Why did you stop?",
            "I'd earned mornings when I could look away."
          ]
        ]
      },
      {
        "title": "A serious stew",
        "opening": "Do you take cooking as seriously as your other work?",
        "first": "I prefer food that can wait a little if someone arrives late. A stew is more forgiving than its cook.",
        "replies": [
          [
            "Who arrives late?",
            "Friends who consider supper time a philosophical suggestion."
          ],
          [
            "Do you complain?",
            "Until they eat. Then I ask whether it needs salt."
          ],
          [
            "What's the secret?",
            "Time, tasting, and not adding everything because it's available."
          ]
        ]
      },
      {
        "title": "Quiet company",
        "opening": "Do you enjoy company when nobody feels like talking?",
        "first": "I like visitors who don't assume a pause means the evening has failed.",
        "replies": [
          [
            "Do you prefer being alone?",
            "Sometimes. Quiet company is a separate pleasure."
          ],
          [
            "What do you do together?",
            "Eat, mend small things, remember an occasional story."
          ],
          [
            "Would that bore me?",
            "You'd have to sit long enough to find out."
          ]
        ]
      }
    ],
    "greetings": [
      "Cinder. Yes, the name suited the work. People discovered that joke surprisingly often.",
      "I'm Corin. I'll retire it for you.",
      "Corin, welcome. I've had enough noise for one lifetime.",
      "I'll keep the conversation gentle.",
      "A dragon's fire is rather more alive than a furnace.",
      "I'm Corin. Aurelius chooses where he puts it."
    ]
  },
  "Warden": {
    "name": "Warden",
    "home": "Forgewick",
    "role": "Neighbourhood organiser",
    "source": "08-forgewick-homes.txt:1",
    "topics": [
      {
        "title": "Sharing the work",
        "opening": "How do you make sure the work gets shared?",
        "first": "When a miner is hurt, the household still needs food and repairs. I help neighbours divide the jobs.",
        "replies": [
          [
            "Does everyone contribute?",
            "Differently. Time, food, a skill. I avoid keeping a score."
          ],
          [
            "Who helps you?",
            "People I finally learned to ask."
          ],
          [
            "Is it difficult to arrange?",
            "Less difficult when I describe the actual job instead of saying 'anything'."
          ]
        ]
      },
      {
        "title": "Your husband's silence",
        "opening": "What do you do when your husband comes home wanting quiet?",
        "first": "My husband sometimes returns from the mine wanting quiet. I once mistook that for refusing to talk to me.",
        "replies": [
          [
            "How did you sort it out?",
            "He explained after supper. Hunger hadn't improved either of us."
          ],
          [
            "What do you do now?",
            "Give him time, then ask."
          ],
          [
            "Does he ask about your day?",
            "Yes. Mine doesn't disappear because his was hard."
          ]
        ]
      },
      {
        "title": "A favour refused",
        "opening": "Have you ever had to refuse a favour?",
        "first": "I refuse tasks I can't properly do. People occasionally call that unhelpful.",
        "replies": [
          [
            "Does it bother you?",
            "Of course. Then I remember an unreliable promise helps nobody."
          ],
          [
            "What do you offer instead?",
            "A clearer request, or someone with the right skill."
          ],
          [
            "Can you ever simply rest?",
            "I'm learning. The neighbourhood survives an afternoon without supervision."
          ]
        ]
      }
    ],
    "greetings": [
      "Warden. That's my name, not a demand that you report anything.",
      "I'm Corin. A useful distinction.",
      "Corin. Have you come needing help or offering news?",
      "A little conversation first, if possible.",
      "Your friend must complicate everyone's estimate of a small favour.",
      "I'm Corin. Aurelius gets a say in favours."
    ]
  },
  "Ember": {
    "name": "Ember",
    "home": "Forgewick",
    "role": "Home baker",
    "source": "08-forgewick-homes.txt:6",
    "topics": [
      {
        "title": "A proper celebration",
        "opening": "What makes a celebration feel special to you?",
        "first": "A proper celebration needs something delicious and someone who remembers why you're gathering.",
        "replies": [
          [
            "Does it need a crowd?",
            "No. Two people can celebrate very effectively."
          ],
          [
            "What do you make?",
            "Whatever the guest actually likes, after several leading questions."
          ],
          [
            "What would you celebrate?",
            "Finishing a difficult week counts. Dagna calls that frequent."
          ]
        ]
      },
      {
        "title": "An experimental filling",
        "opening": "Have you tried any unusual fillings?",
        "first": "I tried a savoury filling in a sweet pastry. Dagna said my pastry was arguing with itself.",
        "replies": [
          [
            "Was she right?",
            "Annoyingly. I had combined two good ideas badly."
          ],
          [
            "Did you throw it out?",
            "We ate it and discussed its future, which was brief."
          ],
          [
            "Will you experiment again?",
            "Yes. In portions small enough for civil disagreement."
          ]
        ]
      },
      {
        "title": "Living with Dagna",
        "opening": "What's it like living with Dagna?",
        "first": "Dagna knows when I'm pretending a mistake was intentional. It's a terrible inconvenience.",
        "replies": [
          [
            "Do you catch her mistakes?",
            "She admits them before I can prepare a speech."
          ],
          [
            "What do you agree on?",
            "That guests should feel welcome and doors should shut properly."
          ],
          [
            "Do you enjoy the arguments?",
            "The harmless ones. We stop when they cease being harmless."
          ]
        ]
      }
    ],
    "greetings": [
      "Ember. Yes, a promising name for a baker, until something burns.",
      "I'm Corin. I'll avoid the obvious joke.",
      "Corin! An impartial witness to my latest opinion.",
      "I'll hear the evidence first.",
      "A dragon would be an alarming baking assistant.",
      "I'm Corin. Aurelius isn't applying for the position."
    ]
  },
  "Dagna": {
    "name": "Dagna",
    "home": "Forgewick",
    "role": "Launderer",
    "source": "08-forgewick-homes.txt:11",
    "topics": [
      {
        "title": "A missing garment",
        "opening": "Have you ever lost track of a garment?",
        "first": "A customer accused me of losing a shirt he was wearing. I let him finish the accusation.",
        "replies": [
          [
            "How did you answer?",
            "Asked whether I should wash that one next."
          ],
          [
            "Was he embarrassed?",
            "Thoroughly. He paid promptly afterward."
          ],
          [
            "Did he return?",
            "Yes, with considerably shorter explanations."
          ]
        ]
      },
      {
        "title": "A competitive afternoon",
        "opening": "Do you get competitive when you have an afternoon off?",
        "first": "I like games more than people expect. Ember says my pleasant face conceals ruthless arithmetic.",
        "replies": [
          [
            "Is that accurate?",
            "The arithmetic is excellent. Ruthlessness depends on the stakes."
          ],
          [
            "What do you play?",
            "Anything with rules agreed before I begin winning."
          ],
          [
            "Do you lose well?",
            "I'm quiet about it. That is not the same as enjoying it."
          ]
        ]
      },
      {
        "title": "Being called dependable",
        "opening": "Do you like being the person everyone depends on?",
        "first": "People call me dependable when they want something done. I'd enjoy hearing it occasionally afterward.",
        "replies": [
          [
            "Do you remind them?",
            "When necessary. Resentment is poor communication."
          ],
          [
            "Does Ember thank you?",
            "Yes, often with food and unnecessary ceremony."
          ],
          [
            "What would you choose for yourself?",
            "An afternoon when all the work can wait."
          ]
        ]
      }
    ],
    "greetings": [
      "Dagna. People tell me stains are mysterious. Most aren't.",
      "I'm Corin. I'll spare you a mystery.",
      "Corin, come and provide a subject Ember hasn't already debated.",
      "I'll make an attempt.",
      "I hope your dragon doesn't expect me to launder anything enormous.",
      "I'm Corin. Aurelius's scales manage without a washline."
    ]
  },
  "Lode": {
    "name": "Lode",
    "home": "Forgewick",
    "role": "Retired miner",
    "source": "08-forgewick-homes.txt:16",
    "topics": [
      {
        "title": "The sound below",
        "opening": "Could you tell what was happening below by the sound?",
        "first": "Underground, a changed sound matters. I trusted the men who stopped talking to listen.",
        "replies": [
          [
            "What were you listening for?",
            "Shifting rock, strained timber, water where none belonged."
          ],
          [
            "Did you ever turn back?",
            "Yes. The rock doesn't care whether you're embarrassed."
          ],
          [
            "Do you miss the work?",
            "Parts of it. Memory tends to clean the dust away."
          ]
        ]
      },
      {
        "title": "Your terrible riddles",
        "opening": "Are you any good at solving riddles?",
        "first": "I love riddles and solve very few. The answer always appears obvious after someone says it.",
        "replies": [
          [
            "Why keep trying?",
            "A cheap way to be surprised."
          ],
          [
            "Do you invent any?",
            "Yes. Mine are either impossible or accidentally informative."
          ],
          [
            "Would you blame the riddle?",
            "Naturally, before admitting the difficulty might be mine."
          ]
        ]
      },
      {
        "title": "Soup after retirement",
        "opening": "Has retirement changed the way you spend mealtimes?",
        "first": "I learned cooking after retirement. My first soup had excellent ingredients and no agreement between them.",
        "replies": [
          [
            "What improved it?",
            "Fewer ingredients. I had treated the pot like a collection box."
          ],
          [
            "Who taught you?",
            "Neighbours with strong opinions and generous patience."
          ],
          [
            "What's your best dish now?",
            "A broth people finish before asking about the mine."
          ]
        ]
      }
    ],
    "greetings": [
      "Lode. You're allowed to ask about things besides mining. I have other qualifications.",
      "I'm Corin. Such as?",
      "Corin! Arrived before I ran out of opinions.",
      "I suspected there would be plenty.",
      "Wings would have been of limited use in my old workplace.",
      "I'm Corin. Aurelius still watches the ceiling."
    ]
  },
  "Pike": {
    "name": "Pike",
    "home": "Forgewick",
    "role": "Basket maker",
    "source": "08-forgewick-homes.txt:21",
    "topics": [
      {
        "title": "Testing a basket",
        "opening": "How do you test whether a basket is strong enough?",
        "first": "I load a finished basket before selling it. A handsome weave must survive something heavier than admiration.",
        "replies": [
          [
            "What do you put in it?",
            "Enough weight to reveal weak joins."
          ],
          [
            "Have you broken your own work?",
            "Certainly. Better here than on a customer's road."
          ],
          [
            "What makes one last?",
            "Good material, a close weave, and sensible use afterward."
          ]
        ]
      },
      {
        "title": "A sharp bargain",
        "opening": "Have you ever regretted driving a hard bargain?",
        "first": "A trader offered half my price and called it friendship. We'd met moments earlier.",
        "replies": [
          [
            "What did you say?",
            "That friendship was developing unusually expensive habits."
          ],
          [
            "Did you sell to him?",
            "At a fair price, after the performance ended."
          ],
          [
            "Do you enjoy bargaining?",
            "When both people can walk away without being threatened."
          ]
        ]
      },
      {
        "title": "Packing for a holiday",
        "opening": "What would you pack for a holiday?",
        "first": "I'd pack less for a holiday than for a working day. I want room to return with something unexpected.",
        "replies": [
          [
            "What would you bring home?",
            "A small useful thing made by someone I met."
          ],
          [
            "Not a souvenir?",
            "That is a souvenir. It can hold onions afterward."
          ],
          [
            "Would your husband come?",
            "If his mine shift allowed it. We'd choose the timing together."
          ]
        ]
      }
    ],
    "greetings": [
      "Pike. A basket is only cheap until its bottom falls out.",
      "I'm Corin. I'll remember that while packing.",
      "Corin. Still carrying more than you meant to?",
      "Usually.",
      "A dragon's provisions would require a serious basket.",
      "I'm Corin. Aurelius requires several serious meals."
    ]
  },
  "Hallow": {
    "name": "Hallow",
    "home": "Forgewick",
    "role": "Repairer",
    "source": "08-forgewick-homes.txt:26",
    "topics": [
      {
        "title": "A clock that rushed",
        "opening": "Have you ever had a clock that wouldn't keep proper time?",
        "first": "I repaired a clock that gained time. The owner liked it because he was always late.",
        "replies": [
          [
            "Did you slow it properly?",
            "After asking. He wanted it less inaccurate, not honest."
          ],
          [
            "Was that difficult?",
            "Mechanically no. Philosophically, rather tiring."
          ],
          [
            "Would you keep such a clock?",
            "No. I'd find another way to distrust myself."
          ]
        ]
      },
      {
        "title": "Finding a fault",
        "opening": "Where do you start when something stops working?",
        "first": "I ask what changed before something broke. People often begin with what they've already hit with a hammer.",
        "replies": [
          [
            "Does hitting help?",
            "Occasionally. It complicates the evidence more reliably."
          ],
          [
            "What's your first step?",
            "Watch it work badly before taking it apart."
          ],
          [
            "Do you ever guess?",
            "Yes, then test the guess before charging for confidence."
          ]
        ]
      },
      {
        "title": "An unwanted mechanism",
        "opening": "Have you ever made a mechanism nobody wanted?",
        "first": "I keep a little broken music box. Repairing it would cost more time than anyone would pay for.",
        "replies": [
          [
            "Why keep it?",
            "I want to hear the rest of its tune."
          ],
          [
            "Do you know the tune?",
            "Only the first four notes. They're becoming irritatingly familiar."
          ],
          [
            "Will you finish it?",
            "On my own time. Some jobs deserve that freedom."
          ]
        ]
      }
    ],
    "greetings": [
      "Hallow. If it rattles, describe when, not how annoying it is.",
      "I'm Corin. Nothing rattling today but questions.",
      "Corin. Come distract me from an unreasonable mechanism.",
      "Gladly.",
      "I'm trying very hard not to ask how those wings work immediately.",
      "I'm Corin. Aurelius might appreciate hello first."
    ]
  },
  "Quarrel": {
    "name": "Quarrel",
    "home": "Forgewick",
    "role": "Opinionated neighbour",
    "source": "08-forgewick-homes.txt:31",
    "topics": [
      {
        "title": "An inherited name",
        "opening": "How did you come by your name?",
        "first": "My family thought Quarrel a fine name. Strangers regard it as instructions.",
        "replies": [
          [
            "Does it suit you?",
            "Often enough to be inconvenient."
          ],
          [
            "Would you change it?",
            "No. I'd have to introduce the new name to everyone."
          ],
          [
            "What's the worst joke?",
            "The one the teller believes is entirely original."
          ]
        ]
      },
      {
        "title": "Being contradicted",
        "opening": "Does being contradicted bother you?",
        "first": "I like a person who can explain why I'm wrong. I dislike a person who assumes that guarantees I'll enjoy hearing it.",
        "replies": [
          [
            "Do you admit mistakes?",
            "Yes, after confirming they exist."
          ],
          [
            "Does that take long?",
            "Flint says longer than necessary."
          ],
          [
            "Why argue at all?",
            "Because thinking aloud with resistance can improve an idea."
          ]
        ]
      },
      {
        "title": "Flint's patience",
        "opening": "Is Flint as patient as he seems?",
        "first": "Flint lets me finish a magnificent argument, then asks whether I want tea. It ruins the grandeur.",
        "replies": [
          [
            "Does that annoy you?",
            "Briefly. Then I usually want tea."
          ],
          [
            "Do you ever win against him?",
            "He refuses to count conversations as contests."
          ],
          [
            "Is he right about that?",
            "Possibly. I haven't surrendered the question."
          ]
        ]
      }
    ],
    "greetings": [
      "Quarrel. Yes, really. You may get the joke out of your system.",
      "I'm Corin. I'll save it for an emergency.",
      "Corin. Brought an argument or merely a greeting?",
      "Let's begin peacefully.",
      "A dragon is persuasive evidence, though not an argument.",
      "I'm Corin. Aurelius didn't come to win a debate."
    ]
  },
  "Flint": {
    "name": "Flint",
    "home": "Forgewick",
    "role": "Retired kiln worker",
    "source": "08-forgewick-homes.txt:36",
    "topics": [
      {
        "title": "A practical joke",
        "opening": "Have you ever played a joke that went wrong?",
        "first": "I once replaced a friend's empty lunch bag with a larger lunch. He spent the meal trying to locate the trick.",
        "replies": [
          [
            "Was there one?",
            "Only that I'd made him suspicious of generosity."
          ],
          [
            "Did he laugh?",
            "Eventually. Then demanded the recipe."
          ],
          [
            "What makes a bad joke?",
            "Someone becoming smaller so everyone else can laugh."
          ]
        ]
      },
      {
        "title": "Working at the kiln",
        "opening": "What do you enjoy about working at the kiln?",
        "first": "A kiln rewards preparation and punishes distraction. I learned to enjoy boring checklists.",
        "replies": [
          [
            "What did you check?",
            "Fuel, space, placement, anything heat would make harder to fix."
          ],
          [
            "Did you make mistakes?",
            "Enough to respect the checks."
          ],
          [
            "Do you miss the heat?",
            "On cold mornings. Less when carrying groceries uphill."
          ]
        ]
      },
      {
        "title": "Life with Quarrel",
        "opening": "Do you and Quarrel argue as much as the name suggests?",
        "first": "Quarrel rehearses disagreements while doing chores. I occasionally object on behalf of the absent opponent.",
        "replies": [
          [
            "Does that help?",
            "It makes the chores take longer."
          ],
          [
            "Do you always disagree?",
            "No. He has good ideas beneath the introductions."
          ],
          [
            "Why get along so well?",
            "We know when the argument matters and when supper matters more."
          ]
        ]
      }
    ],
    "greetings": [
      "Flint. Quarrel may have warned you about me; I'd like to hear the wording.",
      "I'm Corin. No warning yet.",
      "Corin! Just in time for a less serious conversation.",
      "I'm happy to oblige.",
      "A dragon should finally leave Quarrel short of an opinion.",
      "I'm Corin. Aurelius may not manage that miracle."
    ]
  },
  "Bors": {
    "name": "Bors",
    "home": "Forgewick",
    "role": "Household carpenter",
    "source": "08-forgewick-homes.txt:41",
    "topics": [
      {
        "title": "Meeting your husband",
        "opening": "How did you meet your husband?",
        "first": "I met Kiln when I complained about a crooked cup. He asked whether my mouth was perfectly straight.",
        "replies": [
          [
            "Did you like him immediately?",
            "I liked arguing with him. Recognition took longer."
          ],
          [
            "Did you buy the cup?",
            "Yes. We still use it."
          ],
          [
            "Was that his plan?",
            "He denies it. I suspect he simply enjoyed being impertinent."
          ]
        ]
      },
      {
        "title": "Useful furniture",
        "opening": "What makes a piece of furniture useful?",
        "first": "I build for elbows, knees, and people who set things down clumsily. Showroom elegance has different customers.",
        "replies": [
          [
            "Does that look plain?",
            "Sometimes. Plain doesn't mean careless."
          ],
          [
            "What are you proudest of?",
            "A table that's still steady after years of family meals."
          ],
          [
            "Do you make your own furniture?",
            "Eventually. Kiln is remarkably patient about unfinished promises."
          ]
        ]
      },
      {
        "title": "Working with different materials",
        "opening": "Do you like working with materials besides wood?",
        "first": "Kiln can reshape clay where I've already cut away wood. I find that deeply unfair.",
        "replies": [
          [
            "Can you add wood back?",
            "With a repair everyone pretends not to notice."
          ],
          [
            "Does he envy your work?",
            "Wood doesn't collapse in a kiln. He reminds me."
          ],
          [
            "Do you work together?",
            "Occasionally. Our materials cooperate better than our estimates."
          ]
        ]
      }
    ],
    "greetings": [
      "Bors. Carpenter, husband, and defender of chairs built for actual sitting.",
      "I'm Corin. The chairs have a strong advocate.",
      "Corin. No commission needed; company is welcome.",
      "I came on those terms.",
      "A dragon makes my usual furniture seem rather limited.",
      "I'm Corin. Aurelius is content with clear ground."
    ]
  },
  "Kiln": {
    "name": "Kiln",
    "home": "Forgewick",
    "role": "Potter",
    "source": "08-forgewick-homes.txt:46",
    "topics": [
      {
        "title": "A crooked cup",
        "opening": "Have you ever made a cup that wouldn't sit straight?",
        "first": "A slightly uneven cup can fit a hand beautifully. People sometimes ask me to remove exactly what they enjoy holding.",
        "replies": [
          [
            "How do you persuade them?",
            "Let them use it before judging it from across a table."
          ],
          [
            "Can unevenness be a fault?",
            "Certainly. 'Handmade' doesn't excuse a cup that spills."
          ],
          [
            "Do you keep favourites?",
            "A few. Bors keeps buying the ones I meant to sell."
          ]
        ]
      },
      {
        "title": "Teaching clay",
        "opening": "How do you teach someone to work clay?",
        "first": "Beginners press too hard, then barely touch it. Clay receives the entire argument.",
        "replies": [
          [
            "What do you tell them?",
            "Slow their hands and watch what the material does."
          ],
          [
            "Were you quick to learn?",
            "No. My teacher had excellent control of his expression."
          ],
          [
            "Why teach now?",
            "Someone was patient with my collapsing bowls. I remember."
          ]
        ]
      },
      {
        "title": "A piece to keep",
        "opening": "Have you made a piece you wanted to keep?",
        "first": "I want to make a large serving bowl for our home. No customer, no deadline, no negotiation over the glaze.",
        "replies": [
          [
            "What colour?",
            "A deep blue Bors will pretend was his suggestion."
          ],
          [
            "Why a serving bowl?",
            "It gives us a reason to invite people."
          ],
          [
            "Will you finish it soon?",
            "Ask Bors about his shelf before asking me that."
          ]
        ]
      }
    ],
    "greetings": [
      "Kiln. Yes, a potter. I saved everyone a little biographical effort.",
      "I'm Corin. Efficiently done.",
      "Corin! Bors hasn't recruited you to admire another joint, has he?",
      "I came to hear your side.",
      "A dragon's bowl would be quite a firing problem.",
      "I'm Corin. Aurelius hasn't requested tableware yet."
    ]
  },
  "Merrin": {
    "name": "Merrin",
    "home": "Thornwell and Forgewick",
    "role": "Keen walker",
    "source": "08-forgewick-homes.txt:51",
    "topics": [
      {
        "title": "A familiar detour",
        "opening": "Do you ever take a longer route just because you like it?",
        "first": "I take a longer way home because there's a stretch where the traffic quiets. People keep correcting my route.",
        "replies": [
          [
            "Do you explain?",
            "Sometimes. Sometimes I thank them and continue."
          ],
          [
            "Does it add much time?",
            "Enough to arrive less irritated."
          ],
          [
            "Would you show someone?",
            "If they weren't going to spend the walk hurrying me."
          ]
        ]
      },
      {
        "title": "The difficult name",
        "opening": "How do you remember a name you find difficult?",
        "first": "I practised a neighbour's name privately after getting it wrong. He heard me through the wall.",
        "replies": [
          [
            "Was he annoyed?",
            "He came over to help with the difficult sound."
          ],
          [
            "Did you learn it?",
            "Yes. Then we had a much easier conversation."
          ],
          [
            "Why not ask immediately?",
            "Embarrassment. It produces remarkably unnecessary work."
          ]
        ]
      },
      {
        "title": "Learning to whistle",
        "opening": "Did someone teach you to whistle?",
        "first": "I cannot whistle. Small children keep offering lessons with brutal optimism.",
        "replies": [
          [
            "Have you improved?",
            "I've become better at producing a disappointed breeze."
          ],
          [
            "Why keep trying?",
            "I want to answer a tune without words."
          ],
          [
            "Would humming work?",
            "Perfectly. Unfortunately I've become stubborn about the method."
          ]
        ]
      }
    ],
    "greetings": [
      "Merrin. I like knowing a town well enough to take the unnecessary route.",
      "I'm Corin. I do that by accident.",
      "Corin! Found any good ways to get pleasantly lost?",
      "A few less pleasant ones too.",
      "A dragon changes what counts as a narrow lane.",
      "I'm Corin. Aurelius and I plan our turns together."
    ]
  },
  "Tallis": {
    "name": "Tallis",
    "home": "Forgewick",
    "role": "Lutenist",
    "source": "08-forgewick-homes.txt:56",
    "topics": [
      {
        "title": "Forgetting a verse",
        "opening": "What do you do if you forget a verse?",
        "first": "I forgot a verse in public and repeated the previous one with greater conviction.",
        "replies": [
          [
            "Did anyone notice?",
            "A child sang the missing verse louder than me."
          ],
          [
            "What did you do?",
            "Let her finish, then thanked my newly appointed assistant."
          ],
          [
            "Did the audience mind?",
            "They preferred the rescue to a flawless performance."
          ]
        ]
      },
      {
        "title": "Choosing the tune",
        "opening": "How do you choose what to play next?",
        "first": "I begin with something familiar. It tells me whether people want to listen, sing, or continue their conversation.",
        "replies": [
          [
            "Do you mind being ignored?",
            "Not if that's the arrangement. Supper needn't stop for my feelings."
          ],
          [
            "What do you enjoy playing?",
            "A tune people remember halfway through hearing it."
          ],
          [
            "Do you write songs?",
            "Slowly. Words are less cooperative than strings."
          ]
        ]
      },
      {
        "title": "A musician's reputation",
        "opening": "Does a musician's reputation help or get in the way?",
        "first": "Someone called me the finest player in three towns. I asked which towns; he hadn't heard the others.",
        "replies": [
          [
            "Did you accept the praise?",
            "With appropriate caution and a pleased face."
          ],
          [
            "Would you want to be famous?",
            "Famous enough for work, obscure enough for breakfast."
          ],
          [
            "What should people remember?",
            "That they enjoyed the evening. My name can follow."
          ]
        ]
      }
    ],
    "greetings": [
      "Tallis. Musician. I accept requests and reserve the right to misunderstand them.",
      "I'm Corin. I'll speak clearly.",
      "Corin! Here before the difficult verse.",
      "I chose my moment.",
      "A dragon deserves his own melody, if he wants one.",
      "I'm Corin. I'll ask Aurelius before commissioning anything."
    ]
  },
  "Ivo": {
    "name": "Ivo",
    "home": "Forgewick",
    "role": "Young draughtsman",
    "source": "08-forgewick-homes.txt:61",
    "topics": [
      {
        "title": "A machine for everything",
        "opening": "Do you think every task needs a machine?",
        "first": "I drew a machine to fetch water, wash clothes, and ring a bell. Then couldn't explain how it did any one job.",
        "replies": [
          [
            "Did you abandon it?",
            "Split it into smaller drawings. Much less impressive, much more understandable."
          ],
          [
            "Why the bell?",
            "I thought every good machine should announce itself."
          ],
          [
            "What are you working on now?",
            "A latch I can make rather than merely describe."
          ]
        ]
      },
      {
        "title": "Asking craftspeople",
        "opening": "Do craftspeople welcome your questions?",
        "first": "Garran asked what material I planned to use. I'd written 'metal' as though that settled everything.",
        "replies": [
          [
            "Did he explain?",
            "Yes, after I stopped pretending I understood."
          ],
          [
            "Was that embarrassing?",
            "Less than letting him build something from a bad drawing."
          ],
          [
            "Will you ask again?",
            "Certainly. He asks questions that improve the next sketch."
          ]
        ]
      },
      {
        "title": "A drawing for pleasure",
        "opening": "Do you ever draw something with no plan to build it?",
        "first": "Sometimes I draw impossible things without intending to build them. That's allowed too.",
        "replies": [
          [
            "What sort of things?",
            "A house with rooms that rotate toward sunshine."
          ],
          [
            "Wouldn't the furniture slide?",
            "It would be a terrible breakfast. I'm keeping it a drawing."
          ],
          [
            "Do you enjoy practical work?",
            "Yes. I just don't want every page to be an estimate."
          ]
        ]
      }
    ],
    "greetings": [
      "Ivo. These are ideas, not promises that I can build them.",
      "I'm Corin. I'd like to hear one anyway.",
      "Corin! I've made an invention less impossible.",
      "That's progress worth reporting.",
      "A dragon can actually fly. My drawings remain less convincing.",
      "I'm Corin. Aurelius had a head start on wings."
    ]
  },
  "Nazim": {
    "name": "Nazim",
    "home": "Sandspire",
    "role": "Water keeper",
    "source": "09-sandspire.txt:1",
    "topics": [
      {
        "title": "Counting water",
        "opening": "How do you make sure the water measures are right?",
        "first": "I check the water measures myself. A small error repeated across a caravan becomes a serious shortage.",
        "replies": [
          [
            "Do traders object?",
            "The hurried ones. They object less after a dry journey."
          ],
          [
            "Who taught you?",
            "My father. He distrusted numbers nobody had checked."
          ],
          [
            "Do you ever miscount?",
            "Yes. That's why I check rather than admire my experience."
          ]
        ]
      },
      {
        "title": "The broken lid",
        "opening": "Can a broken cistern lid cause much trouble?",
        "first": "A cracked cistern lid spoiled more water than a week's ordinary use. People had complained about replacing it.",
        "replies": [
          [
            "Did they change their minds?",
            "Afterward. I'd have preferred agreement before the loss."
          ],
          [
            "What caused the crack?",
            "A cart struck the edge. Nobody reported it."
          ],
          [
            "What changed?",
            "People know whom to tell now, without a lecture first."
          ]
        ]
      },
      {
        "title": "An evening off",
        "opening": "What do you do when you have an evening free?",
        "first": "I like listening to musicians after work. For once, nobody asks how much remains.",
        "replies": [
          [
            "What music?",
            "Anything with a rhythm I can follow without counting."
          ],
          [
            "Do you dance?",
            "Badly and rarely. My sister disputes the order."
          ],
          [
            "Would you live elsewhere?",
            "Perhaps near rain. I'd like to complain about too much water."
          ]
        ]
      }
    ],
    "greetings": [
      "Nazim. If you need water, say that before telling me how far you've walked.",
      "I'm Corin. I'd like to hear about the town.",
      "Corin. Recovered from the crossing?",
      "Enough to ask better questions.",
      "A dragon must need a considerable drink.",
      "I'm Corin; Aurelius and I are learning to plan for that."
    ]
  },
  "Halima": {
    "name": "Halima",
    "home": "Sandspire",
    "role": "Spice trader",
    "source": "09-sandspire.txt:6",
    "topics": [
      {
        "title": "A scent from childhood",
        "opening": "Is there a smell that takes you straight back to childhood?",
        "first": "The smell of toasted cumin reminds me of my mother's kitchen before I remember a single meal.",
        "replies": [
          [
            "Did she teach you to cook?",
            "She taught me to smell spices before trusting their appearance."
          ],
          [
            "What if they look fine?",
            "Age can leave a beautiful, flavourless powder."
          ],
          [
            "Do you miss her cooking?",
            "Especially dishes I thought I'd eaten too often."
          ]
        ]
      },
      {
        "title": "The travelling sack",
        "opening": "How do you know where your spices have come from?",
        "first": "A sack can pass through many hands before reaching my stall. Each seller has a more impressive origin story.",
        "replies": [
          [
            "How do you choose whom to trust?",
            "Consistency, samples, and whether complaints get answered."
          ],
          [
            "Have you been cheated?",
            "Yes. I remember the lesson more vividly than the loss."
          ],
          [
            "Do you tell customers?",
            "What I know. Uncertain origins remain uncertain."
          ]
        ]
      },
      {
        "title": "Your least profitable habit",
        "opening": "Do your stories ever distract people from buying anything?",
        "first": "I enjoy telling stories about spices so much that customers occasionally forget to purchase any.",
        "replies": [
          [
            "Does that annoy you?",
            "Only when I notice the day's accounts."
          ],
          [
            "Do you shorten the stories?",
            "I try. Then someone asks the right question."
          ],
          [
            "What's the right question?",
            "Who grew it. That leads somewhere more interesting than price."
          ]
        ]
      }
    ],
    "greetings": [
      "Halima. I can tell you where something came from without telling you to buy it.",
      "I'm Corin. I'd enjoy hearing that.",
      "Corin! Have your travels improved your appetite?",
      "They've certainly enlarged it.",
      "I've heard traders claim to see dragons. Yours is persuasive evidence.",
      "I'm Corin. Aurelius isn't part of a sales pitch."
    ]
  },
  "Tarek": {
    "name": "Tarek",
    "home": "Sandspire",
    "role": "Caravan animal handler",
    "source": "09-sandspire.txt:11",
    "topics": [
      {
        "title": "An opinionated camel",
        "opening": "Can a camel decide how a caravan ought to run?",
        "first": "One camel refuses to move until the others are loaded. It has apparently appointed itself inspector.",
        "replies": [
          [
            "Does it delay the caravan?",
            "Less than discovering an unsecured load on the road."
          ],
          [
            "Did you train that behaviour?",
            "No. I'm accepting credit only for recognising it."
          ],
          [
            "Is it your favourite?",
            "Ask when it's cooperating. My answer varies."
          ]
        ]
      },
      {
        "title": "Learning an animal's mood",
        "opening": "How do you recognise an animal's mood?",
        "first": "I watch ears, stance, and breathing. People often notice teeth rather late in the discussion.",
        "replies": [
          [
            "Were you ever bitten?",
            "Once. I had ignored every earlier objection."
          ],
          [
            "What did you change?",
            "Stopped treating patience as permission to crowd."
          ],
          [
            "Can you always predict them?",
            "No. Knowing an animal means respecting what you don't know too."
          ]
        ]
      },
      {
        "title": "Caravan bells",
        "opening": "Why do the caravan animals wear different bells?",
        "first": "Different bells help me recognise which animal has moved before I turn around.",
        "replies": [
          [
            "Do they dislike the bells?",
            "Some do. I don't insist on one solution for all."
          ],
          [
            "Can you sleep through them?",
            "Familiar movement, yes. A sudden change wakes me."
          ],
          [
            "Does silence worry you?",
            "When I expected movement. Context matters more than the sound."
          ]
        ]
      }
    ],
    "greetings": [
      "Tarek. Let an animal notice you before trying to become its friend.",
      "I'm Corin. I'll approach slowly.",
      "Corin. Travelling well, or practising an optimistic answer?",
      "Some of each.",
      "A dragon isn't a camel. I'd rather ask than pretend I know him.",
      "I'm Corin. Aurelius will appreciate that."
    ]
  },
  "Suhaila": {
    "name": "Suhaila",
    "home": "Sandspire",
    "role": "Retired weaver",
    "source": "09-sandspire.txt:16",
    "topics": [
      {
        "title": "Your daughter's loom",
        "opening": "Does your daughter weave the same patterns you do?",
        "first": "My daughter changed a pattern I'd used for years. I prepared a criticism before seeing the finished cloth.",
        "replies": [
          [
            "Was it better?",
            "Different, and successful. A deeply inconvenient combination."
          ],
          [
            "Did you criticise it?",
            "I asked how she'd done the difficult section."
          ],
          [
            "Did she notice your change of mind?",
            "Naturally. Children recognise a swallowed lecture."
          ]
        ]
      },
      {
        "title": "Working hands",
        "opening": "Can you tell someone's work from their hands?",
        "first": "My hands tire sooner now. I dislike admitting it more than I dislike taking breaks.",
        "replies": [
          [
            "Have you stopped weaving?",
            "Large pieces. I still enjoy choosing and preparing thread."
          ],
          [
            "Do you miss the work?",
            "The feeling of a pattern appearing, yes."
          ],
          [
            "What helps?",
            "Teaching someone who actually wants the lesson."
          ]
        ]
      },
      {
        "title": "Evening conversation",
        "opening": "What do you like talking about in the evening?",
        "first": "I like evening visits when the heat eases and nobody is trying to complete a task.",
        "replies": [
          [
            "Who visits?",
            "Neighbours, relatives, people who claim they can only stay a minute."
          ],
          [
            "Do you believe them?",
            "Only until the second cup."
          ],
          [
            "What do you discuss?",
            "Everything the day was too hot to argue about."
          ]
        ]
      }
    ],
    "greetings": [
      "Suhaila. My daughter says retirement should include my opinions. I disagree.",
      "I'm Corin. I suppose she's heard that opinion.",
      "Corin! Come distract me from offering unsolicited advice.",
      "I'll choose a safe subject.",
      "Those wings have patterns no loom could easily follow.",
      "I'm Corin; this is Aurelius. He won't sit still for a pattern."
    ]
  },
  "Idris": {
    "name": "Idris",
    "home": "Sandspire",
    "role": "Travelling-supplies merchant",
    "source": "09-sandspire.txt:21",
    "topics": [
      {
        "title": "Three different sons",
        "opening": "Are your sons much like one another?",
        "first": "My three sons all claim they'll never become traders. Each bargains fiercely over chores.",
        "replies": [
          [
            "Does that disappoint you?",
            "No. I'd like them to choose their work."
          ],
          [
            "Do they help the shop?",
            "Sometimes. They have different talents and identical excuses."
          ],
          [
            "Which resembles you?",
            "Whichever has just made an excellent point, according to me."
          ]
        ]
      },
      {
        "title": "A fair price",
        "opening": "How do you agree on a fair price?",
        "first": "A fair price lets a customer return and a shop remain open. Neither side should require a rescue.",
        "replies": [
          [
            "Do you bargain?",
            "Within reason. Theatre isn't the same as business."
          ],
          [
            "Have you lost customers over it?",
            "Some. A sale can still cost too much."
          ],
          [
            "What makes you trust a buyer?",
            "Plain dealing. An honest small purchase beats a grand promise."
          ]
        ]
      },
      {
        "title": "The item forgotten",
        "opening": "Have you ever forgotten something important while packing?",
        "first": "People remember impressive equipment and forget ordinary food. Then hope the road supplies it.",
        "replies": [
          [
            "What do you suggest first?",
            "Count what you need before the next safe stop."
          ],
          [
            "Do travellers listen?",
            "Those who've gone hungry are very attentive."
          ],
          [
            "What's your own weakness?",
            "Packing extra paper. I always imagine more time to write."
          ]
        ]
      }
    ],
    "greetings": [
      "Idris. Tell me where you're going before we decide what you need.",
      "I'm Corin. A sensible beginning.",
      "Corin. How did your supplies hold up?",
      "I'll give you an honest report.",
      "A dragon makes an ordinary packing list rather incomplete.",
      "I'm Corin; Aurelius and I are still refining ours."
    ]
  },
  "Rashida": {
    "name": "Rashida",
    "home": "Sandspire",
    "role": "Glass enthusiast",
    "source": "09-sandspire.txt:26",
    "topics": [
      {
        "title": "The imperfect vase",
        "opening": "Do you ever keep a vase that isn't quite perfect?",
        "first": "I bought a vase with a small bubble in the glass. The seller apologised; it was the part I liked.",
        "replies": [
          [
            "Why that part?",
            "Light caught inside it. The flaw made me look twice."
          ],
          [
            "Was it cheaper?",
            "A little. I resisted explaining how much I wanted it."
          ],
          [
            "Do you still have it?",
            "Yes. Useful for flowers and defending my taste."
          ]
        ]
      },
      {
        "title": "Workshop rivalry",
        "opening": "Is there much rivalry between the workshops?",
        "first": "Forgewick and Sandspire argue about glass as though one good cup makes every other town incompetent.",
        "replies": [
          [
            "Which is better?",
            "Sandspire. I warned you about my enthusiasm."
          ],
          [
            "Have you bought Forgewick work?",
            "Yes. Quietly. Quality occasionally complicates loyalty."
          ],
          [
            "Does Sela share your rivalry?",
            "His brother is a smith in Forgewick. Their arguments are more personal."
          ]
        ]
      },
      {
        "title": "Choosing a keepsake",
        "opening": "How do you choose something worth keeping?",
        "first": "I prefer one object attached to a memory over a shelf of expensive things.",
        "replies": [
          [
            "What would you save first?",
            "A cup my mother used. Unremarkable to anyone else."
          ],
          [
            "Does it ever get used?",
            "Often. Keeping it untouchable would lose half the memory."
          ],
          [
            "Are you afraid of breaking it?",
            "Yes. I use it carefully and enjoy it anyway."
          ]
        ]
      }
    ],
    "greetings": [
      "Rashida. I defend Sandspire's glass with absolutely unnecessary enthusiasm.",
      "I'm Corin. I'll hear the case.",
      "Corin! Have you come prepared to admire good workmanship?",
      "I'm prepared to learn what I'm looking at.",
      "Those scales catch light better than my favourite glass.",
      "I'm Corin. Aurelius accepts admiration without a price tag."
    ]
  },
  "Bilal": {
    "name": "Bilal",
    "home": "Sandspire",
    "role": "Goatherd",
    "source": "09-sandspire.txt:31",
    "topics": [
      {
        "title": "Goat names",
        "opening": "Do all your goats have names?",
        "first": "I named one goat Patience in the hope it would help. The name now sounds like a command directed at me.",
        "replies": [
          [
            "What's it done?",
            "Learned which rope I'd replaced and tested the next one."
          ],
          [
            "Would you rename it?",
            "No. Stubbornness is established on both sides."
          ],
          [
            "Do they know their names?",
            "They know which tone predicts food. Names are optional details."
          ]
        ]
      },
      {
        "title": "A missing goat",
        "opening": "What do you do when a goat goes missing?",
        "first": "I once searched half a morning for a goat sleeping behind the water jars.",
        "replies": [
          [
            "Did it hear you?",
            "Certainly. It yawned when I found it."
          ],
          [
            "How did you miss it?",
            "Looked where a troublesome goat should be, not where a tired one was."
          ],
          [
            "Were you relieved?",
            "Enough to postpone the lecture it wouldn't have understood."
          ]
        ]
      },
      {
        "title": "Milk and neighbours",
        "opening": "Do you share the milk with your neighbours?",
        "first": "People want milk at convenient times. The goats have never attended a scheduling meeting.",
        "replies": [
          [
            "Do you keep a strict routine?",
            "As far as living creatures permit."
          ],
          [
            "Does it tie you to home?",
            "Yes. I arrange help before leaving."
          ],
          [
            "Would you change that life?",
            "Some days. Then a newborn stands up and ruins my argument."
          ]
        ]
      }
    ],
    "greetings": [
      "Bilal. If a goat has followed you, please don't encourage its ambitions.",
      "I'm Corin. No goat yet.",
      "Corin. Arriving with all your belongings?",
      "As far as I've counted.",
      "My goats would have opinions about a dragon. Loud ones.",
      "I'm Corin. Aurelius can avoid their committee."
    ]
  },
  "Jamila": {
    "name": "Jamila",
    "home": "Sandspire",
    "role": "Former road trader",
    "source": "09-sandspire.txt:36",
    "topics": [
      {
        "title": "The light parcel",
        "opening": "Have you ever carried a parcel lighter than it looked?",
        "first": "My lightest parcel caused the most trouble. A customer had wrapped it without writing whose it was.",
        "replies": [
          [
            "How did you find out?",
            "Visited three households and heard three confident guesses."
          ],
          [
            "What was inside?",
            "A wedding ribbon. The bride identified it immediately."
          ],
          [
            "Did you deliver on time?",
            "Barely. I became unreasonable about labels afterward."
          ]
        ]
      },
      {
        "title": "A stranger's kindness",
        "opening": "Has a stranger ever helped you on the road?",
        "first": "A stranger helped me lift a fallen load and left before I could learn his name.",
        "replies": [
          [
            "Did you see him again?",
            "No. I've looked at many faces expecting to."
          ],
          [
            "What did you do instead?",
            "Helped other people with fallen loads."
          ],
          [
            "Do you still remember him?",
            "His voice better than his face. He made the trouble feel manageable."
          ]
        ]
      },
      {
        "title": "Why stop travelling?",
        "opening": "What made you stop travelling?",
        "first": "I wanted to wake in one place without calculating the distance before supper.",
        "replies": [
          [
            "Do you regret stopping?",
            "On lovely mornings. Not during dust storms."
          ],
          [
            "What do you miss?",
            "Arriving somewhere that had changed since my last visit."
          ],
          [
            "Could you still take a trip?",
            "Yes. Choosing one feels different from needing the next sale."
          ]
        ]
      }
    ],
    "greetings": [
      "Jamila. I used to carry goods between towns. Now I prefer hearing about the road while seated.",
      "I'm Corin. I can provide recent impressions.",
      "Corin! Your boots look more experienced.",
      "They'd appreciate less experience tomorrow.",
      "Wings would have changed my old journeys considerably.",
      "I'm Corin. Aurelius still needs food and rest."
    ]
  },
  "Farid": {
    "name": "Farid",
    "home": "Sandspire",
    "role": "Spice trader",
    "source": "09-sandspire.txt:41",
    "topics": [
      {
        "title": "A stale bargain",
        "opening": "Have you ever bought something that looked better than it tasted?",
        "first": "I bought a cheap sack before smelling it. My father asked how cheaply I'd purchased flavourless dust.",
        "replies": [
          [
            "Could you return it?",
            "No. The seller had been very careful about that part."
          ],
          [
            "Did your father help?",
            "He helped me count the loss. I disliked the thoroughness."
          ],
          [
            "Have you repeated it?",
            "Not with spices. Other forms of optimism remain available."
          ]
        ]
      },
      {
        "title": "A family recipe",
        "opening": "Who taught you your family recipe?",
        "first": "My family argues about the exact spice mix for the same dish. Everyone cites the same grandmother.",
        "replies": [
          [
            "Who's right?",
            "She changed it according to what she had."
          ],
          [
            "Did anyone admit that?",
            "Eventually. It deprived us of a cherished argument."
          ],
          [
            "Do you keep experimenting?",
            "Yes. I call it tradition when it succeeds."
          ]
        ]
      },
      {
        "title": "A customer's memory",
        "opening": "Do customers remember what they bought from you?",
        "first": "A traveller recognised a spice by a childhood meal and nearly cried at my stall.",
        "replies": [
          [
            "What did you say?",
            "Asked if she wanted a moment. She did."
          ],
          [
            "Did she buy some?",
            "A little. Enough to try the dish again."
          ],
          [
            "Did she return?",
            "Yes, with a description that made me hungry all afternoon."
          ]
        ]
      }
    ],
    "greetings": [
      "Farid. Smell first, bargain second. That's my entire first lesson.",
      "I'm Corin. A lesson short enough to remember.",
      "Corin! Learned any new flavours on the road?",
      "A few I couldn't name.",
      "A dragon could overwhelm every scent in my working day.",
      "I'm Corin. Aurelius won't breathe on your stock."
    ]
  },
  "Samira": {
    "name": "Samira",
    "home": "Sandspire",
    "role": "Cloth weaver",
    "source": "09-sandspire.txt:46",
    "topics": [
      {
        "title": "Cloth in the heat",
        "opening": "What makes cloth comfortable in this heat?",
        "first": "Light cloth needs to shade without trapping every breath of air. Thickness alone doesn't explain comfort.",
        "replies": [
          [
            "How do you test it?",
            "Wear it while working. A flattering display proves little."
          ],
          [
            "Have you made a bad piece?",
            "A magnificent, suffocating one. My sister named it Winter."
          ],
          [
            "Did you reuse it?",
            "Yes. The material hadn't promised summer; I had."
          ]
        ]
      },
      {
        "title": "A difficult pattern",
        "opening": "Do you enjoy a difficult pattern?",
        "first": "I enjoy repeating patterns until someone asks me to explain how I keep count.",
        "replies": [
          [
            "Do you count every thread?",
            "At first. Then the rhythm helps, until an interruption."
          ],
          [
            "Have I interrupted?",
            "Only a conversation. You may relax."
          ],
          [
            "What happens after a mistake?",
            "Unpick enough to repair it. Pretending not to see it grows expensive."
          ]
        ]
      },
      {
        "title": "Clothes for myself",
        "opening": "Do you make different clothes for yourself?",
        "first": "My own clothes are usually plainer than my work. I prefer not to carry a demonstration everywhere.",
        "replies": [
          [
            "Do people expect more?",
            "They ask why I don't advertise myself."
          ],
          [
            "What do you tell them?",
            "That I know where to find my shop."
          ],
          [
            "Do you enjoy fine clothes?",
            "On an evening I choose. Choice improves finery."
          ]
        ]
      }
    ],
    "greetings": [
      "Samira. I weave travelling cloth. Fashion must negotiate with sand here.",
      "I'm Corin. Sand seems a forceful negotiator.",
      "Corin. Are your clothes still winning that negotiation?",
      "Only in sheltered conditions.",
      "Those wings have a much better drape than my work.",
      "I'm Corin. Aurelius doesn't have to hem them."
    ]
  },
  "Leila": {
    "name": "Leila",
    "home": "Sandspire",
    "role": "Caravan provisioner",
    "source": "09-sandspire.txt:51",
    "topics": [
      {
        "title": "The second count",
        "opening": "Why count a caravan's supplies twice?",
        "first": "A driver complained that I counted twice. The totals disagreed, which shortened his complaint.",
        "replies": [
          [
            "What was missing?",
            "Two water jars still beside the loading place."
          ],
          [
            "Did he thank you?",
            "He called it fortunate. I accepted that translation."
          ],
          [
            "Do you always count twice?",
            "Essential supplies, yes. Pride doesn't quench thirst."
          ]
        ]
      },
      {
        "title": "Caravans and tempers",
        "opening": "How do you deal with tempers on the road?",
        "first": "People argue most fiercely before leaving. Every small delay seems to threaten the entire journey.",
        "replies": [
          [
            "How do you calm them?",
            "Name the next task and who can do it."
          ],
          [
            "Do you ever snap?",
            "Certainly. Then I apologise without abandoning the count."
          ],
          [
            "What helps most?",
            "A plan people can understand, and something to eat."
          ]
        ]
      },
      {
        "title": "Your own journey",
        "opening": "Do you pack as carefully for your own trips?",
        "first": "I once packed for a personal trip and forgot my comb. Perfect provisions, hopeless hair.",
        "replies": [
          [
            "Did that amuse everyone?",
            "Far too much. They'd been waiting for evidence."
          ],
          [
            "What did you forget next time?",
            "Nothing essential. I'm refusing further detail."
          ],
          [
            "Do you travel often?",
            "When work allows. It's useful to be a passenger occasionally."
          ]
        ]
      }
    ],
    "greetings": [
      "Leila. I check the lists. Someone has to ask whether the water was actually loaded.",
      "I'm Corin. Better here than halfway out.",
      "Corin! Setting out, or enjoying being somewhere?",
      "Enjoying being somewhere for a moment.",
      "A dragon requires a revised list, not a guess.",
      "I'm Corin. Aurelius and I are learning that."
    ]
  },
  "Zaid": {
    "name": "Zaid",
    "home": "Sandspire",
    "role": "Desert guide",
    "source": "09-sandspire.txt:56",
    "topics": [
      {
        "title": "A short line on a map",
        "opening": "Can a short route on a map turn into a long walk?",
        "first": "A route can look short and take a miserable day. Heat and a heavy pack don't appear as ink.",
        "replies": [
          [
            "Did you learn that early?",
            "Early enough to survive being ashamed of it."
          ],
          [
            "How do you plan now?",
            "Conditions, load, and the slowest member of the party."
          ],
          [
            "What about an urgent journey?",
            "Urgency changes the need, not the body's limits."
          ]
        ]
      },
      {
        "title": "Reading the ground",
        "opening": "What can you tell from the ground ahead?",
        "first": "I look for firm ground and signs of recent passage. A clear view doesn't mean an easy walk.",
        "replies": [
          [
            "Can you always find the way?",
            "No. Then I stop before uncertainty becomes distance."
          ],
          [
            "Do people resist stopping?",
            "Often. Moving feels useful even in the wrong direction."
          ],
          [
            "Have you turned a party back?",
            "Yes. Everyone returned alive to complain."
          ]
        ]
      },
      {
        "title": "A place to rest",
        "opening": "How do you choose a good place to rest?",
        "first": "Good shade is worth planning around. I dislike arriving exhausted at a spot that only looked useful from afar.",
        "replies": [
          [
            "What do you check?",
            "Shelter, stable ground, enough space for the group."
          ],
          [
            "Do you have a favourite stop?",
            "Several. Which one depends on the journey."
          ],
          [
            "Would you live outside the desert?",
            "Perhaps. I'd have to learn which familiar warnings no longer applied."
          ]
        ]
      }
    ],
    "greetings": [
      "Zaid. If you're planning a crossing, begin with daylight and water.",
      "I'm Corin. I'd like to learn the rest.",
      "Corin. The desert let you return with questions.",
      "Quite a few.",
      "A dragon can cross distance quickly, but someone still needs to plan the landing.",
      "I'm Corin. Aurelius and I discuss that together."
    ]
  },
  "Petra": {
    "name": "Petra",
    "home": "Sandspire",
    "role": "Caravan accountant",
    "source": "10-desert-homes.txt:1",
    "topics": [
      {
        "title": "The duplicate charge",
        "opening": "Have you ever caught the same charge being entered twice?",
        "first": "A trader charged the same fee twice under different names. He called it an administrative distinction.",
        "replies": [
          [
            "Did you pay?",
            "Once. I asked what the second fee purchased."
          ],
          [
            "Could he explain?",
            "At great length, without answering."
          ],
          [
            "Did the caravan continue?",
            "Yes. Clear questions proved cheaper than an argument."
          ]
        ]
      },
      {
        "title": "Remembering a date",
        "opening": "How do you remember an important date?",
        "first": "My aunt dates everything by births and weddings. I convert them into years when writing accounts.",
        "replies": [
          [
            "Is she accurate?",
            "Remarkably. The celebrations matter more than the calendar."
          ],
          [
            "Do you enjoy the stories?",
            "Yes, after I've established which cousin married whom."
          ],
          [
            "What do you remember that way?",
            "My first paid job. I still remember the meal afterward."
          ]
        ]
      },
      {
        "title": "Work left at work",
        "opening": "Can you leave work behind at the end of the day?",
        "first": "I refuse to divide a shared supper into everyone's exact contribution. People assume I'd enjoy it.",
        "replies": [
          [
            "Wouldn't that be fair?",
            "Perhaps mathematically. Hospitality has other concerns."
          ],
          [
            "Do you always treat friends?",
            "No. We take turns without conducting an audit."
          ],
          [
            "Can you stop noticing numbers?",
            "Not entirely. I can choose not to announce them."
          ]
        ]
      }
    ],
    "greetings": [
      "Petra. If a story begins with 'everyone knows', I start taking notes.",
      "I'm Corin. I'll begin with what I know.",
      "Corin. More road behind you than last time.",
      "And more questions ahead.",
      "A dragon is one claim I can verify immediately.",
      "I'm Corin. His name is Aurelius."
    ]
  },
  "Raff": {
    "name": "Raff",
    "home": "Sandspire",
    "role": "Town resident",
    "source": "10-desert-homes.txt:6",
    "topics": [
      {
        "title": "Shutters at noon",
        "opening": "Does closing the shutters help in the midday heat?",
        "first": "I close the shutters before the heat builds. My brother waits until the room is already unbearable.",
        "replies": [
          [
            "Does he listen to you?",
            "He calls me fussy, then visits my cooler house."
          ],
          [
            "Do you let him in?",
            "Yes. Family provides continuing opportunities for smugness."
          ],
          [
            "Would thicker walls help?",
            "Perhaps. Closing a shutter is considerably cheaper."
          ]
        ]
      },
      {
        "title": "Evening errands",
        "opening": "Do you leave your errands until evening?",
        "first": "I save ordinary errands for evening whenever I can. Everyone else has the same brilliant idea.",
        "replies": [
          [
            "Does that make it busy?",
            "Very. The quiet afternoon has simply moved its noise."
          ],
          [
            "Do you enjoy meeting people?",
            "Most. A queue supplies both company and complaints."
          ],
          [
            "What errand do you dislike?",
            "One I could have combined with yesterday's trip."
          ]
        ]
      },
      {
        "title": "A guest who hurried",
        "opening": "Have you ever had a guest who was always in a hurry?",
        "first": "A guest insisted on leaving at noon to save time, then returned exhausted an hour later.",
        "replies": [
          [
            "Did you lecture him?",
            "No. I gave him water and waited for evening."
          ],
          [
            "Was he grateful?",
            "After he'd stopped being angry with himself."
          ],
          [
            "Did he listen next time?",
            "He asked when I would leave. Considerable progress."
          ]
        ]
      }
    ],
    "greetings": [
      "Raff. If you're here to praise the sunshine, I've already heard its defence.",
      "I'm Corin. I'll ask about the shade.",
      "Corin! An excuse to remain where it's comfortable.",
      "A useful purpose for a visit.",
      "Your friend makes quite a shadow.",
      "I'm Corin. Aurelius didn't bring it specifically for us."
    ]
  },
  "Suri": {
    "name": "Suri",
    "home": "Sandspire",
    "role": "Clothes mender",
    "source": "10-desert-homes.txt:11",
    "topics": [
      {
        "title": "A seam that failed",
        "opening": "What makes a seam give way?",
        "first": "I made a travelling shirt with elegant, weak seams. It came apart during its first hard day.",
        "replies": [
          [
            "Did you replace it?",
            "Yes, and changed how I reinforced the joins."
          ],
          [
            "Were you embarrassed?",
            "Enough to remember every stitch afterward."
          ],
          [
            "Did the customer return?",
            "Eventually. I had to earn that return."
          ]
        ]
      },
      {
        "title": "Repairing a favourite",
        "opening": "Is repairing a favourite garment different from other work?",
        "first": "A customer brought a coat too worn for ordinary repair. She wanted one sound pocket saved.",
        "replies": [
          [
            "Why the pocket?",
            "Her father had sewn it inside for her valuables."
          ],
          [
            "Could you keep it?",
            "Moved it carefully into a new coat."
          ],
          [
            "Did she like the result?",
            "She put her hand inside and smiled before speaking."
          ]
        ]
      },
      {
        "title": "Choosing your own clothes",
        "opening": "Do people expect your own clothes to be perfect?",
        "first": "People expect me to dress perfectly because I mend clothes. My favourite shirt contains three visible repairs.",
        "replies": [
          [
            "Why keep it?",
            "It fits, it's soft, and I know every patch."
          ],
          [
            "Does anyone criticise it?",
            "Only people who haven't worn it."
          ],
          [
            "Would you make a new one?",
            "Eventually. Familiar comfort deserves a fair contest."
          ]
        ]
      }
    ],
    "greetings": [
      "Suri. If sand has found a seam, it will have brought friends.",
      "I'm Corin. My boots can confirm that.",
      "Corin! Clothes surviving the journey?",
      "With varying enthusiasm.",
      "I won't offer to measure a dragon without asking him first.",
      "I'm Corin. Aurelius thanks you for the restraint."
    ]
  },
  "Tavin": {
    "name": "Tavin",
    "home": "Sandspire",
    "role": "Host to visiting traders",
    "source": "10-desert-homes.txt:16",
    "topics": [
      {
        "title": "Too many guests",
        "opening": "Have you ever invited more guests than you could manage?",
        "first": "I once agreed to host two families on the same night. I'd said yes before checking the first arrangement.",
        "replies": [
          [
            "Where did they sleep?",
            "With help from neighbours, after a very honest apology."
          ],
          [
            "Were they angry?",
            "Some were tired. I didn't ask them to comfort me."
          ],
          [
            "What changed afterward?",
            "I write promises down before making more."
          ]
        ]
      },
      {
        "title": "A useful guest",
        "opening": "What can a guest do to make things easier?",
        "first": "The best guests ask where to put things. The worst explain how my house should be arranged.",
        "replies": [
          [
            "Do you tell them?",
            "Politely once. Clearly after that."
          ],
          [
            "Has anyone improved the place?",
            "Certainly, after asking what I wanted."
          ],
          [
            "What help do you appreciate?",
            "Cleaning up without converting it into a public achievement."
          ]
        ]
      },
      {
        "title": "News from elsewhere",
        "opening": "Do you like hearing news from other places?",
        "first": "I hear wildly different accounts of the same town. A bad meal apparently transforms entire populations.",
        "replies": [
          [
            "Which do you believe?",
            "The details, cautiously. The sweeping conclusions, rarely."
          ],
          [
            "Do you travel yourself?",
            "Less than I'd like. Hosting brings some of the road here."
          ],
          [
            "Would you miss the visitors?",
            "After enjoying three quiet days, probably."
          ]
        ]
      }
    ],
    "greetings": [
      "Tavin. Come with a name before a story; it helps me keep the travellers straight.",
      "Corin. I'll keep the story manageable.",
      "Corin! A guest I can place without a description.",
      "That's becoming a pleasant feeling.",
      "A dragon will make this visit difficult to confuse with another.",
      "I'm Corin; this is Aurelius. We'll stay clear of the doorway."
    ]
  },
  "Una": {
    "name": "Una",
    "home": "Sandspire",
    "role": "Sister and enthusiastic correspondent",
    "source": "10-desert-homes.txt:21",
    "topics": [
      {
        "title": "The parcel exchange",
        "opening": "Have you ever received somebody else's parcel?",
        "first": "My sister and I send parcels back and forth. We both insist the other needn't send anything.",
        "replies": [
          [
            "Do either of you listen?",
            "Never. It's a highly stable arrangement."
          ],
          [
            "What's the best parcel?",
            "Ordinary things that tell me she's been thinking of home."
          ],
          [
            "What do you send?",
            "Small comforts she actually likes, after some failed experiments."
          ]
        ]
      },
      {
        "title": "A broken cup",
        "opening": "Would you mend a cup after it broke?",
        "first": "I packed a cup poorly and it arrived in pieces. My sister sent a drawing of the pieces arranged like a flower.",
        "replies": [
          [
            "Was she upset?",
            "She'd worried I'd be upset. We wasted several letters reassuring each other."
          ],
          [
            "Did you replace it?",
            "With something less fragile. I learned the practical part too."
          ],
          [
            "Did she keep the drawing?",
            "I did. It's rather better than the cup."
          ]
        ]
      },
      {
        "title": "Writing ordinary news",
        "opening": "Is ordinary news worth putting in a letter?",
        "first": "I used to wait for important news before writing. That left whole months empty.",
        "replies": [
          [
            "What do you write now?",
            "Who visited, what annoyed me, a meal that went wrong."
          ],
          [
            "Does she enjoy it?",
            "She says it lets her hear my voice."
          ],
          [
            "Would you live nearer her?",
            "I'd like to visit longer first. We have different daily lives now."
          ]
        ]
      }
    ],
    "greetings": [
      "Una. My sister says my letters are longer than her visits.",
      "I'm Corin. Is she right?",
      "Corin! Have you time for news without a destination?",
      "I'd enjoy that.",
      "A dragon. My next letter may require another page.",
      "I'm Corin. Aurelius would prefer an accurate description."
    ]
  },
  "Vela": {
    "name": "Vela",
    "home": "Sandspire",
    "role": "Rug weaver",
    "source": "10-desert-homes.txt:26",
    "topics": [
      {
        "title": "A deliberate mismatch",
        "opening": "Would you ever choose colours that didn't match?",
        "first": "I once repeated an accidental knot because I liked the shape. It became a pattern customers requested.",
        "replies": [
          [
            "Did you admit its origin?",
            "Yes. They seemed disappointed it wasn't an ancient secret."
          ],
          [
            "Could you repeat it exactly?",
            "After writing down what I'd done by accident."
          ],
          [
            "Was that frustrating?",
            "Extremely. Accidents are poor teachers until you examine them."
          ]
        ]
      },
      {
        "title": "A family route",
        "opening": "Does your family travel the same route every year?",
        "first": "One family pattern marks the places our grandparents travelled. The bends mean more than decoration to us.",
        "replies": [
          [
            "Do you know every place?",
            "Not all. Some names have changed."
          ],
          [
            "Would you visit them?",
            "I'd like to. A pattern isn't a route guide."
          ],
          [
            "Do customers learn the story?",
            "If they ask. I don't attach a lecture to every rug."
          ]
        ]
      },
      {
        "title": "Working slowly",
        "opening": "Do you mind taking your time over the work?",
        "first": "A large rug takes enough time for my opinions to change before it's finished.",
        "replies": [
          [
            "About the design?",
            "Sometimes. Usually I finish the plan before beginning another argument."
          ],
          [
            "Do you lose patience?",
            "Yes. I stop before impatience becomes bad work."
          ],
          [
            "What keeps you going?",
            "Seeing a section complete. Small finishes help a large job."
          ]
        ]
      }
    ],
    "greetings": [
      "Vela. A pattern can begin with a mistake, but please don't tell my apprentices I said so.",
      "I'm Corin. I'll keep the secret.",
      "Corin. Have you noticed any colours worth stealing?",
      "A few worth describing.",
      "Those scales contain a difficult weaving problem.",
      "I'm Corin. Aurelius isn't promising to hold still."
    ]
  },
  "Wystan": {
    "name": "Wystan",
    "home": "Sandspire",
    "role": "Retired trader",
    "source": "10-desert-homes.txt:31",
    "topics": [
      {
        "title": "A reputation's cost",
        "opening": "Has your reputation ever cost you something?",
        "first": "I once returned money after a buyer overpaid. He became a customer for years.",
        "replies": [
          [
            "Was that your reason?",
            "No. It was his money. The good consequence arrived later."
          ],
          [
            "Did everyone approve?",
            "A colleague called it foolish. He didn't keep customers long."
          ],
          [
            "Have you always been honest?",
            "I've made mistakes. I corrected the ones I could."
          ]
        ]
      },
      {
        "title": "The second cup",
        "opening": "Is a second cup an excuse to stay and talk?",
        "first": "The first cup is often business. The second is when someone finally says what troubles them.",
        "replies": [
          [
            "Do you offer it deliberately?",
            "If I have time to listen properly."
          ],
          [
            "Must a guest explain themselves?",
            "No. A cup isn't an interrogation fee."
          ],
          [
            "What do you talk about?",
            "Family, weather, the price of getting older. Ordinary subjects."
          ]
        ]
      },
      {
        "title": "An unsold treasure",
        "opening": "Have you ever kept something on the stall because you didn't want it sold?",
        "first": "I kept a small carved box because I liked it too much to sell. A poor decision for stock, an excellent one for me.",
        "replies": [
          [
            "What's inside?",
            "Letters. Nothing that improves its resale value."
          ],
          [
            "Who carved it?",
            "A woman who refused to hurry the final details."
          ],
          [
            "Would you sell it now?",
            "No. Retirement permits a certain improvement in bad business decisions."
          ]
        ]
      }
    ],
    "greetings": [
      "Wystan. I've retired from bargaining, except where conversation is concerned.",
      "I'm Corin. What's the asking price?",
      "Corin! Another chance to improve my collection of travellers' opinions.",
      "I'll try to supply an original.",
      "A dragon is a splendid way to defeat scepticism.",
      "I'm Corin. Aurelius usually lets people look twice."
    ]
  },
  "Rania": {
    "name": "Rania",
    "home": "Sandspire",
    "role": "Neighbour and household organiser",
    "source": "10-desert-homes.txt:36",
    "topics": [
      {
        "title": "Meeting Latif",
        "opening": "How did you meet Latif?",
        "first": "Latif offered to help plan a feast. He brought figures; I needed someone to move chairs.",
        "replies": [
          [
            "Did he help?",
            "After I explained that chairs were the urgent numbers."
          ],
          [
            "Were you impressed?",
            "Eventually. He stayed to wash up."
          ],
          [
            "Did he calculate that too?",
            "Yes. I married him despite considerable advance warning."
          ]
        ]
      },
      {
        "title": "Chairs after sunset",
        "opening": "Do you sit outside when the evening cools down?",
        "first": "I like taking chairs outside when the heat eases. Neighbours join without arranging a formal visit.",
        "replies": [
          [
            "Does everyone stay long?",
            "As long as they like. We don't count departures."
          ],
          [
            "What do you discuss?",
            "Whatever the first person has been waiting to tell someone."
          ],
          [
            "Who takes the chairs back?",
            "Latif and me. Hospitality has a physical conclusion."
          ]
        ]
      },
      {
        "title": "Fixing things myself",
        "opening": "Do you prefer fixing things yourself?",
        "first": "People ask whether Latif will mend something. I usually have the repair half finished.",
        "replies": [
          [
            "Does it bother you?",
            "Enough to hand them the tool I'm using."
          ],
          [
            "Is he good at repairs?",
            "Some. I'm better at others. We enjoy remaining distinct."
          ],
          [
            "What do you like fixing?",
            "A small annoying thing everyone had learned to tolerate."
          ]
        ]
      }
    ],
    "greetings": [
      "Rania. Latif may have mentioned me. I'll correct the account if necessary.",
      "I'm Corin. I'll hear yours first.",
      "Corin! Come join a conversation without an agenda.",
      "A welcome invitation.",
      "A dragon! Latif will ask about provisions before saying hello.",
      "I'm Corin. Aurelius can survive a proper introduction first."
    ]
  },
  "Latif": {
    "name": "Latif",
    "home": "Sandspire",
    "role": "Account keeper",
    "source": "10-desert-homes.txt:41",
    "topics": [
      {
        "title": "Figures in the shade",
        "opening": "Is it easier to keep accounts in the shade?",
        "first": "I work better when the room is cool. Heat makes every column seem personally unreasonable.",
        "replies": [
          [
            "Do you stop at noon?",
            "When I can. Errors cost more than a pause."
          ],
          [
            "What errors worry you?",
            "Small ones that look plausible. Large nonsense is easier to spot."
          ],
          [
            "Do you check your own work?",
            "After stepping away. Familiar numbers can hide in plain sight."
          ]
        ]
      },
      {
        "title": "Rania's repairs",
        "opening": "Does Rania repair things around the house?",
        "first": "Rania repairs things while I explain possible causes. She says my commentary is an optional extra.",
        "replies": [
          [
            "Do you stop talking?",
            "Occasionally, when handed something useful to hold."
          ],
          [
            "Does she enjoy your company?",
            "I believe so. She keeps inviting the commentary back."
          ],
          [
            "What do you do for her?",
            "The accounts she dislikes and the errands she postpones."
          ]
        ]
      },
      {
        "title": "An evening purchase",
        "opening": "Do you ever buy something just for an enjoyable evening?",
        "first": "I once bargained so long that the seller closed. Rania bought the thing elsewhere while I was still considering strategy.",
        "replies": [
          [
            "What was it?",
            "A perfectly ordinary cooking pot."
          ],
          [
            "Did you save money?",
            "No. I purchased an enduring family story."
          ],
          [
            "Have you changed?",
            "I now recognise when bargaining costs an entire evening."
          ]
        ]
      }
    ],
    "greetings": [
      "Latif. Rania says I introduce myself like an invoice. I'm trying a shorter version.",
      "I'm Corin. That one worked.",
      "Corin! Rania hasn't assigned you chair duty, has she?",
      "Not yet. Should I be prepared?",
      "A dragon's daily food must be a remarkable figure.",
      "I'm Corin. Aurelius would rather begin with hello."
    ]
  },
  "Bevan": {
    "name": "Bevan",
    "home": "Coralmere",
    "role": "Produce grower",
    "source": "11-coast.txt:1",
    "topics": [
      {
        "title": "Choosing apples",
        "opening": "How do you choose the best apples?",
        "first": "People ask for the biggest apple, then complain it tastes less sweet. Size has excellent advertising.",
        "replies": [
          [
            "How do you choose?",
            "Variety and ripeness. A small apple can win honestly."
          ],
          [
            "Do you grow them yourself?",
            "Some produce, yes. I also buy what neighbours grow well."
          ],
          [
            "What's your favourite?",
            "One eaten when I'm hungry after work. Context improves flavour."
          ]
        ]
      },
      {
        "title": "Salt in the garden",
        "opening": "Does the sea air trouble your garden?",
        "first": "Wind carries salt farther inland than visitors expect. Young plants complain before people notice.",
        "replies": [
          [
            "How do you protect them?",
            "Shelter and careful watering. Then see what actually thrives."
          ],
          [
            "Have you lost a crop?",
            "Yes. I learned which advice came from gardeners elsewhere."
          ],
          [
            "Why keep growing here?",
            "It's home. I prefer adapting to abandoning it."
          ]
        ]
      },
      {
        "title": "The crooked carrot",
        "opening": "Does a crooked carrot taste any different?",
        "first": "Children prefer my odd-shaped vegetables. Adults call them imperfect and pay more for straight ones.",
        "replies": [
          [
            "Do they taste different?",
            "No. The soup has no interest in appearances."
          ],
          [
            "What do you do with them?",
            "Sell them honestly, or eat them myself."
          ],
          [
            "Would you enter a competition?",
            "For absurd carrots, immediately. I have strong candidates."
          ]
        ]
      }
    ],
    "greetings": [
      "Bevan. I grow vegetables, despite the coast's determination to salt everything.",
      "I'm Corin. That sounds like an ongoing argument.",
      "Corin! The road brought you back before the next harvest.",
      "I'm glad it did.",
      "A dragon isn't a customer I've planned crops for.",
      "I'm Corin. Aurelius won't inspect the garden uninvited."
    ]
  },
  "Nerissa": {
    "name": "Nerissa",
    "home": "Coralmere",
    "role": "Provisions merchant",
    "source": "11-coast.txt:6",
    "topics": [
      {
        "title": "Learning to swim",
        "opening": "How did you learn to swim?",
        "first": "I learned swimming late because I was ashamed to admit living by the sea hadn't taught me.",
        "replies": [
          [
            "Who helped you?",
            "A patient friend in sheltered water."
          ],
          [
            "Was it difficult?",
            "Admitting the beginning. The learning came after."
          ],
          [
            "Do you swim far now?",
            "Within what I can manage. Confidence isn't a tide forecast."
          ]
        ]
      },
      {
        "title": "Watching the tide",
        "opening": "How do you keep track of the tide?",
        "first": "A place that was dry when you arrived may not stay your path home.",
        "replies": [
          [
            "Have people been caught?",
            "Yes. Usually while insisting they'd only stay a moment."
          ],
          [
            "What do you tell visitors?",
            "Check the return route before becoming absorbed in the shore."
          ],
          [
            "Do you ever forget?",
            "I still look, even when I think I know."
          ]
        ]
      },
      {
        "title": "A merchant's supper",
        "opening": "What does a merchant cook for supper?",
        "first": "I sell provisions and occasionally discover I've forgotten to keep my own supper.",
        "replies": [
          [
            "What do you do?",
            "Buy something back from a neighbour and endure their amusement."
          ],
          [
            "Does it happen often?",
            "Less often since I began packing my own food first."
          ],
          [
            "What would you choose?",
            "Something I can eat without discussing the price."
          ]
        ]
      }
    ],
    "greetings": [
      "Nerissa. If you're stocking up, remember the part where someone carries it.",
      "I'm Corin. My shoulders remember.",
      "Corin! Here to trade or exchange news?",
      "News first.",
      "A dragon could tempt a traveller into packing everything.",
      "I'm Corin. Aurelius still gets to object."
    ]
  },
  "Sella": {
    "name": "Sella",
    "home": "Coralmere",
    "role": "Cook",
    "source": "11-coast.txt:11",
    "topics": [
      {
        "title": "The changing stew",
        "opening": "Do you make your stew the same way every time?",
        "first": "My stew changes with the catch. My husband calls that improvisation when the fishing goes badly.",
        "replies": [
          [
            "Does it taste different each time?",
            "Enough to keep me interested."
          ],
          [
            "Do customers object?",
            "Only when I accidentally make their favourite once."
          ],
          [
            "Can you repeat that version?",
            "If the sea and my memory cooperate on the same day."
          ]
        ]
      },
      {
        "title": "Waiting for the boat",
        "opening": "What do you do while you're waiting for the boat?",
        "first": "I can usually keep busy while my husband is out. Bad weather makes ordinary chores strangely difficult.",
        "replies": [
          [
            "Do you worry every time?",
            "Some days more than others. Familiarity doesn't abolish it."
          ],
          [
            "What helps?",
            "Company that doesn't insist everything must be fine."
          ],
          [
            "What do you say when he returns?",
            "Usually something practical. Relief takes a moment to find words."
          ]
        ]
      },
      {
        "title": "Cooking for yourself",
        "opening": "Do you cook differently when it's only for you?",
        "first": "When I cook only for myself, I choose something simple and eat before it cools.",
        "replies": [
          [
            "Don't you want something special?",
            "Being spared anyone else's preferences is special."
          ],
          [
            "What's your favourite?",
            "Bread, fish, something sharp beside it."
          ],
          [
            "Do you miss company?",
            "Sometimes. Solitude and loneliness aren't always the same evening."
          ]
        ]
      }
    ],
    "greetings": [
      "Sella. My husband catches fish; I argue them into becoming supper.",
      "I'm Corin. Who wins the argument?",
      "Corin! I can offer conversation without assigning you a meal.",
      "I'll gladly accept.",
      "A dragon makes my usual idea of hungry look modest.",
      "I'm Corin. Aurelius has brought no demand for supper."
    ]
  },
  "Neri": {
    "name": "Neri",
    "home": "Coralmere",
    "role": "Net mender",
    "source": "11-coast.txt:16",
    "topics": [
      {
        "title": "The lost knife",
        "opening": "Have you ever lost a tool you depended on?",
        "first": "I dropped a good knife into the harbour and spent days looking whenever the water cleared.",
        "replies": [
          [
            "Did you find it?",
            "Three spoons, no knife. Apparently the harbour stocks cutlery."
          ],
          [
            "Why was it special?",
            "It fitted my hand after years of use."
          ],
          [
            "Will you keep searching?",
            "When I'm passing. I won't devote another whole afternoon to the sea's possessions."
          ]
        ]
      },
      {
        "title": "A net's small holes",
        "opening": "Do the little holes in a net matter much?",
        "first": "Small holes become large ones under strain. People bring me damage they could have repaired much earlier.",
        "replies": [
          [
            "Do you scold them?",
            "Only if we're friends and they're amused by it."
          ],
          [
            "What's difficult to mend?",
            "A rushed repair tied across rotten cord."
          ],
          [
            "Can you always save a net?",
            "No. I explain before charging someone to postpone the inevitable."
          ]
        ]
      },
      {
        "title": "Work by touch",
        "opening": "Can you do any of your work by touch?",
        "first": "I can feel some faults before seeing them. My hands remember the pattern.",
        "replies": [
          [
            "Can you work in darkness?",
            "Not safely with a blade. Skill has sensible limits."
          ],
          [
            "Did it take years?",
            "Enough that I stopped counting them."
          ],
          [
            "Do you enjoy the rhythm?",
            "Yes, until someone asks me to demonstrate quickly."
          ]
        ]
      }
    ],
    "greetings": [
      "Neri. If you've found a knife in the water, I have an optimistic question.",
      "I'm Corin. No knife, unfortunately.",
      "Corin! I've lost nothing important since we last spoke.",
      "A promising report.",
      "A dragon would make a difficult catch to explain.",
      "I'm Corin. Aurelius would rather avoid the net entirely."
    ]
  },
  "Finnick": {
    "name": "Finnick",
    "home": "Coralmere",
    "role": "Boat worker",
    "source": "11-coast.txt:21",
    "topics": [
      {
        "title": "A thrown fish",
        "opening": "Have you ever thrown a fish and regretted it?",
        "first": "Someone threw me a fish before I turned around. I caught it with most of my shirt.",
        "replies": [
          [
            "Did it hurt?",
            "My dignity suffered the larger injury."
          ],
          [
            "Did you throw it back?",
            "No. Supper shouldn't become ammunition."
          ],
          [
            "What did the thrower say?",
            "That he'd warned me. We discussed useful warnings."
          ]
        ]
      },
      {
        "title": "A loose mooring",
        "opening": "How do you notice when a mooring has worked loose?",
        "first": "A boat can look settled while a rope rubs itself thin. I check where the strain actually falls.",
        "replies": [
          [
            "Have you caught one in time?",
            "Yes. The owner called it luck; I called it looking."
          ],
          [
            "What happens in a storm?",
            "We prepare before one arrives. During it, choices shrink."
          ],
          [
            "Do you like the work?",
            "When preparation makes a difficult day uneventful."
          ]
        ]
      },
      {
        "title": "Your imaginary voyage",
        "opening": "Where would you go on a voyage of your own?",
        "first": "I talk about taking a long voyage. So far I've planned the food more carefully than the destination.",
        "replies": [
          [
            "Where would you go?",
            "Somewhere I couldn't reach by simply walking east."
          ],
          [
            "Would you miss home?",
            "Probably before we cleared the harbour."
          ],
          [
            "What's stopping you?",
            "Money, mostly. Also an improving appreciation for a steady bed."
          ]
        ]
      }
    ],
    "greetings": [
      "Finnick. If someone shouts 'catch', ask what they're throwing before turning.",
      "I'm Corin. That sounds learned the hard way.",
      "Corin! You arrived dry. A respectable achievement here.",
      "I'll try to preserve it.",
      "Those wings would make unloading a boat look very ordinary.",
      "I'm Corin. Aurelius isn't taking anyone's shift."
    ]
  },
  "Maris": {
    "name": "Maris",
    "home": "Coralmere",
    "role": "Home cook",
    "source": "11-coast.txt:26",
    "topics": [
      {
        "title": "The soup dispute",
        "opening": "Can people really argue over a pot of soup?",
        "first": "My mother wants fish soup thick. My father wants it clear. I serve it differently when they visit separately.",
        "replies": [
          [
            "What if they come together?",
            "I remind them they've survived this disagreement for decades."
          ],
          [
            "Which do you prefer?",
            "Thick, though I'm careful when announcing that."
          ],
          [
            "Does the argument spoil dinner?",
            "No. They enjoy having a familiar position to defend."
          ]
        ]
      },
      {
        "title": "A borrowed bowl",
        "opening": "Do you lend bowls to the neighbours?",
        "first": "I returned a borrowed bowl with food in it. It came back with something else. Neither household has seen it empty since.",
        "replies": [
          [
            "Who owns it?",
            "We have decided that's less interesting than supper."
          ],
          [
            "What have you sent?",
            "Soup, stewed fruit, a pudding that travelled poorly."
          ],
          [
            "Will you end the exchange?",
            "Not while it's pleasant. Obligation would spoil the flavour."
          ]
        ]
      },
      {
        "title": "An afternoon by the water",
        "opening": "What do you like doing down by the water?",
        "first": "I sometimes watch the sea without planning what might come out of it for dinner.",
        "replies": [
          [
            "Is that difficult?",
            "For a cook, initially."
          ],
          [
            "What do you notice?",
            "The changing light and how everyone walks differently on wet ground."
          ],
          [
            "Would you live inland?",
            "I'd miss the horizon. I'd enjoy less salt on the windows."
          ]
        ]
      }
    ],
    "greetings": [
      "Maris. You may discuss fish with me, but I reserve some conversation for other subjects.",
      "I'm Corin. I'll offer variety.",
      "Corin! A fresh audience for an old household dispute.",
      "I won't promise a verdict.",
      "A dragon would make our supper calculations rather ambitious.",
      "I'm Corin. Aurelius isn't joining unannounced."
    ]
  },
  "Perrin": {
    "name": "Perrin",
    "home": "Coralmere",
    "role": "Boat repairer",
    "source": "11-coast.txt:31",
    "topics": [
      {
        "title": "Your first oar",
        "opening": "How did your first attempt at carving an oar turn out?",
        "first": "I carved my first oar too heavily and insisted on rowing home with it. Pride supplied the extra labour.",
        "replies": [
          [
            "Did you keep it?",
            "As evidence. My next oar was considerably plainer."
          ],
          [
            "How do you judge the balance?",
            "Use it. A workshop inspection can't replace the motion."
          ],
          [
            "Was the carving good?",
            "Excellent. Entirely irrelevant to my aching arms."
          ]
        ]
      },
      {
        "title": "A hidden leak",
        "opening": "How do you find a leak you can't see?",
        "first": "Water appeared far from the damaged seam. The owner wanted me to patch where the puddle was.",
        "replies": [
          [
            "How did you trace it?",
            "Followed the water's path while the boat was still wet."
          ],
          [
            "Would the patch have helped?",
            "It would have hidden the evidence briefly."
          ],
          [
            "Do people accept the explanation?",
            "Usually after seeing it themselves."
          ]
        ]
      },
      {
        "title": "A boat of your own",
        "opening": "Would you like to build yourself a boat?",
        "first": "I'd like a little boat maintained to my own schedule. Customers' boats always get there first.",
        "replies": [
          [
            "Would you go fishing?",
            "Sometimes. Mostly I'd enjoy leaving without an invoice."
          ],
          [
            "Have you begun it?",
            "In drawings and saved pieces of wood."
          ],
          [
            "Will it be beautiful?",
            "It will float. Beauty can apply afterward."
          ]
        ]
      }
    ],
    "greetings": [
      "Perrin. Boats need repairs because people insist on putting them in water.",
      "I'm Corin. An awkward flaw in the whole arrangement.",
      "Corin! Come discuss something that isn't leaking.",
      "I'll do my best.",
      "A dragon crosses water without needing my trade. Slightly insulting.",
      "I'm Corin. Aurelius still admires a well-made boat."
    ]
  },
  "Hester": {
    "name": "Hester",
    "home": "Coralmere",
    "role": "Net maker",
    "source": "11-coast.txt:36",
    "topics": [
      {
        "title": "The first net",
        "opening": "Who taught you to make your first net?",
        "first": "My first net narrowed as I worked. I had made an impressive bag by accident.",
        "replies": [
          [
            "Could you use it?",
            "For carrying things. Not for the catch I'd imagined."
          ],
          [
            "What went wrong?",
            "Uneven spacing. Repeating a small error made a large shape."
          ],
          [
            "Did you begin again?",
            "Yes. My grandmother supervised the counting this time."
          ]
        ]
      },
      {
        "title": "A knot remembered",
        "opening": "Do you ever forget how to tie a knot?",
        "first": "My grandmother taught one knot while telling a story. I still remember the story whenever I tie it.",
        "replies": [
          [
            "What was the story?",
            "Her brother losing a boot overboard while arguing he'd never fall."
          ],
          [
            "Did he fall?",
            "Only the boot. He defended that distinction for years."
          ],
          [
            "Does the story help?",
            "It reminds my hands where to pause."
          ]
        ]
      },
      {
        "title": "Keeping spare cord",
        "opening": "Why keep spare cord with you?",
        "first": "I carry spare cord because something always needs tying when nobody expects it.",
        "replies": [
          [
            "What's it rescued?",
            "A broken strap, a parcel, a hat from a drain."
          ],
          [
            "Do people ask you first?",
            "They've begun to. Reputation can become additional luggage."
          ],
          [
            "Would you stop carrying it?",
            "After the day I don't need it, perhaps. That day remains elusive."
          ]
        ]
      }
    ],
    "greetings": [
      "Hester. My grandmother taught me knots and a few words for when they go wrong.",
      "I'm Corin. I'll ask about the knots first.",
      "Corin! Another visitor who hasn't tangled anything yet.",
      "There's still time.",
      "A dragon seems unlikely to respect the size of an ordinary net.",
      "I'm Corin. Aurelius won't be testing it."
    ]
  },
  "Yara": {
    "name": "Yara",
    "home": "Coralmere",
    "role": "Coastal resident",
    "source": "11-coast.txt:41",
    "topics": [
      {
        "title": "Salt on the hinges",
        "opening": "Does the salt get into everything here?",
        "first": "Salt works its way into everything. I oil hinges more often than visitors think reasonable.",
        "replies": [
          [
            "Does it help?",
            "Enough to make opening a door less dramatic."
          ],
          [
            "What's hardest to protect?",
            "Anything someone promises is perfectly weatherproof."
          ],
          [
            "Why stay here?",
            "Because I love the place between its maintenance demands."
          ]
        ]
      },
      {
        "title": "A storm's preparations",
        "opening": "What do you do when a storm is coming?",
        "first": "Before a storm I check ordinary things: shutters, loose objects, where water might get in.",
        "replies": [
          [
            "Do neighbours help?",
            "We check on anyone who needs another pair of hands."
          ],
          [
            "Have you missed something?",
            "A loose bucket once travelled farther than I'd planned to."
          ],
          [
            "Were you frightened?",
            "Of course. Preparation gives fear something useful to do."
          ]
        ]
      },
      {
        "title": "A familiar sound",
        "opening": "What sound tells you you're home?",
        "first": "I sleep better with the sea audible. Inland, I kept waking because something seemed missing.",
        "replies": [
          [
            "Did you get used to it?",
            "Eventually. Then coming home disturbed me in reverse."
          ],
          [
            "Do you hear every wave?",
            "No. I notice when the pattern changes."
          ],
          [
            "Would you travel again?",
            "Certainly. Missing home can be part of enjoying elsewhere."
          ]
        ]
      }
    ],
    "greetings": [
      "Yara. If you admire living by the sea, wait until we've discussed the hinges.",
      "I'm Corin. I'm ready for the less picturesque account.",
      "Corin! Come in before the wind joins us.",
      "I'd prefer a smaller conversation.",
      "A dragon makes even a coastal wind seem ordinary.",
      "I'm Corin. Aurelius will keep his wings folded nearby."
    ]
  },
  "Doryn": {
    "name": "Doryn",
    "home": "Coralmere",
    "role": "Longtime coastal resident",
    "source": "11-coast.txt:46",
    "topics": [
      {
        "title": "Reading gulls",
        "opening": "What can you learn by watching gulls?",
        "first": "People think gulls predict weather. Mine mainly predict that someone has food.",
        "replies": [
          [
            "Have they stolen yours?",
            "A bun. Directly from a moment of misplaced confidence."
          ],
          [
            "Did you chase it?",
            "Briefly. The gull had an unfair geographical advantage."
          ],
          [
            "Do you still feed them?",
            "Not deliberately. They contest the distinction."
          ]
        ]
      },
      {
        "title": "A reputation for temper",
        "opening": "Do you deserve your reputation for being bad-tempered?",
        "first": "Someone called me ill-tempered after I asked him to stop blocking my gate. He omitted the first three polite requests.",
        "replies": [
          [
            "Did you explain?",
            "To people whose opinions mattered."
          ],
          [
            "Do you lose patience quickly?",
            "With repeated preventable trouble, yes."
          ],
          [
            "What cheers you?",
            "An ordinary day in which things remain where I put them."
          ]
        ]
      },
      {
        "title": "The view you keep",
        "opening": "Is there a view here you never get tired of?",
        "first": "There's a particular evening light that still stops me mid-complaint.",
        "replies": [
          [
            "Can you describe it?",
            "Gold on the water beneath a dark horizon."
          ],
          [
            "Do you see it often?",
            "Not often enough to become tired of it."
          ],
          [
            "Would you paint it?",
            "Badly. Looking may be my proper contribution."
          ]
        ]
      }
    ],
    "greetings": [
      "Doryn. I complain about the sea because I know it well, not because I intend to leave.",
      "I'm Corin. I'll keep that distinction.",
      "Corin! The sea remains unreasonable.",
      "A consistent subject for conversation.",
      "A dragon is a better surprise than another storm.",
      "I'm Corin. Aurelius usually arrives more gently."
    ]
  },
  "Bry": {
    "name": "Bry",
    "home": "Coralmere",
    "role": "Coastal resident",
    "source": "11-coast.txt:51",
    "topics": [
      {
        "title": "The slippery step",
        "opening": "Have you ever slipped on the dock steps?",
        "first": "I stepped onto wet stone while explaining how sure-footed I'd become. The timing was exceptionally cruel.",
        "replies": [
          [
            "Were you hurt?",
            "Only enough to resent the laughter."
          ],
          [
            "Who helped you?",
            "A neighbour who laughed and offered a hand simultaneously."
          ],
          [
            "Do you watch your step now?",
            "Especially while making claims about myself."
          ]
        ]
      },
      {
        "title": "Making a home",
        "opening": "When did this place begin to feel like home?",
        "first": "I knew this was home when someone noticed I'd been absent before I told them I was away.",
        "replies": [
          [
            "Did that feel intrusive?",
            "It felt kind. They asked whether I was all right."
          ],
          [
            "Had you moved far?",
            "Far enough to miss being recognised."
          ],
          [
            "Do you welcome newcomers?",
            "I try. I remember what the first easy conversation meant."
          ]
        ]
      },
      {
        "title": "A poor sailor",
        "opening": "Are you comfortable out on a boat?",
        "first": "I enjoy looking at boats considerably more than travelling in them.",
        "replies": [
          [
            "Do you get seasick?",
            "With impressive speed."
          ],
          [
            "Have you tried again?",
            "Yes. Optimism has repeatedly misunderstood my stomach."
          ],
          [
            "Would flying be easier?",
            "I would ask about the motion before making promises."
          ]
        ]
      }
    ],
    "greetings": [
      "Bry. If someone mentions me falling in, ask which occasion before accepting the story.",
      "I'm Corin. You've made that difficult to ignore.",
      "Corin! I've remained mostly dry.",
      "A promising beginning.",
      "A dragon would have made my last rescue much more dramatic.",
      "I'm Corin. Aurelius prefers uneventful arrivals."
    ]
  },
  "Coral": {
    "name": "Coral",
    "home": "Coralmere",
    "role": "Sail mender",
    "source": "11-coast.txt:56",
    "topics": [
      {
        "title": "The crooked patch",
        "opening": "Does a patch have to be straight to do its job?",
        "first": "My husband called a sail patch crooked. I suggested he admire it while staying afloat.",
        "replies": [
          [
            "Was he right?",
            "About the angle, yes. About its usefulness, no."
          ],
          [
            "Did you redo it?",
            "When I had time, not because the sea cared."
          ],
          [
            "Did he thank you?",
            "He did. I allowed him to begin there next time."
          ]
        ]
      },
      {
        "title": "A window light",
        "opening": "Why leave a light in the window?",
        "first": "I keep a light where my husband recognises it when returning. It's become part of how we end the day.",
        "replies": [
          [
            "Does he notice?",
            "He mentions it more when the weather's been poor."
          ],
          [
            "What if you're away?",
            "I tell him beforehand. Familiar signals deserve clear changes."
          ],
          [
            "Does it comfort you too?",
            "Yes. Preparing a welcome helps with the waiting."
          ]
        ]
      },
      {
        "title": "Mending in company",
        "opening": "Do you like having company while you mend things?",
        "first": "I like working while someone tells me a story. My hands stay busy without demanding the whole conversation.",
        "replies": [
          [
            "Do mistakes happen?",
            "When the story becomes especially surprising."
          ],
          [
            "Should I avoid surprises?",
            "No. I can pause the needle."
          ],
          [
            "Who tells the best stories?",
            "People willing to admit what they got wrong."
          ]
        ]
      }
    ],
    "greetings": [
      "Coral. My husband catches fish; I keep the wind from escaping his sail through holes.",
      "I'm Corin. Both sound useful.",
      "Corin! Come and interrupt my weather predictions.",
      "I'll avoid bringing a forecast.",
      "Those wings make cloth sails look rather temporary.",
      "I'm Corin. Aurelius has to look after them too."
    ]
  },
  "Zella": {
    "name": "Zella",
    "home": "Coralmere",
    "role": "Cord worker",
    "source": "11-coast.txt:61",
    "topics": [
      {
        "title": "Leftover cord",
        "opening": "What do you do with leftover cord?",
        "first": "Short pieces of cord become ties, handles, and repairs. Eventually even I admit a piece is too short.",
        "replies": [
          [
            "Where is that limit?",
            "Further away than my neighbours would prefer."
          ],
          [
            "Have you saved something valuable?",
            "A traveller's broken bag. Mostly I save small inconveniences."
          ],
          [
            "Do you sell the scraps?",
            "No. Explaining the pricing would cost more than the cord."
          ]
        ]
      },
      {
        "title": "Your grandmother's net",
        "opening": "What did your grandmother teach you about nets?",
        "first": "My grandmother made me repair small damage before tackling the impressive tear. I thought she'd misunderstood ambition.",
        "replies": [
          [
            "Had she?",
            "No. She understood how damage spreads under strain."
          ],
          [
            "Did you listen?",
            "After the impressive repair failed beside the neglected hole."
          ],
          [
            "Do you teach that now?",
            "Yes, with the embarrassing part included."
          ]
        ]
      },
      {
        "title": "A knot contest",
        "opening": "Have you ever competed at tying knots?",
        "first": "A child challenged me to tie a knot blindfolded. I agreed before asking which knot.",
        "replies": [
          [
            "Did you win?",
            "We discovered he'd invented one."
          ],
          [
            "Could you reproduce it?",
            "Not without becoming equally confused."
          ],
          [
            "Was he pleased?",
            "Enormously. I prefer that sort of defeat."
          ]
        ]
      }
    ],
    "greetings": [
      "Zella. I mend nets and collect useful scraps. Some people reverse those priorities in describing me.",
      "I'm Corin. I'll hear your version.",
      "Corin! I've found a use for something everyone wanted thrown away.",
      "That sounds satisfying.",
      "A dragon makes my idea of useful cord rather inadequate.",
      "I'm Corin. Aurelius isn't in need of tying up."
    ]
  },
  "Kip": {
    "name": "Kip",
    "home": "Coralmere",
    "role": "Shore explorer",
    "source": "11-coast.txt:66",
    "topics": [
      {
        "title": "The wonderful shard",
        "opening": "What's the best thing you've found on the beach?",
        "first": "I found blue glass worn smooth by water. It looked precious until someone called it an old bottle.",
        "replies": [
          [
            "Did that spoil it?",
            "For a minute. Then I still liked it."
          ],
          [
            "Will you keep it?",
            "Yes. The sea did most of the work."
          ],
          [
            "What else do you collect?",
            "Shells with odd shapes. Only empty ones."
          ]
        ]
      },
      {
        "title": "A crab's objection",
        "opening": "Have you ever annoyed a crab?",
        "first": "I lifted a shell and discovered its resident strongly opposed moving house.",
        "replies": [
          [
            "Did it pinch you?",
            "Nearly. I put it back very politely."
          ],
          [
            "Do you check now?",
            "I wait and watch before touching."
          ],
          [
            "Was it frightening?",
            "Surprising. I had mistaken a home for an object."
          ]
        ]
      },
      {
        "title": "Looking down",
        "opening": "Do you find more by looking down than looking ahead?",
        "first": "I find things because I look down. I miss things because I look down. It's an inconvenient system.",
        "replies": [
          [
            "What have you missed?",
            "A friend waving for quite a long time."
          ],
          [
            "Could you alternate?",
            "That's my new method. Ground, horizon, ground."
          ],
          [
            "Has it helped?",
            "I noticed you arriving, didn't I?"
          ]
        ]
      }
    ],
    "greetings": [
      "Kip! Have you seen anything shiny on the shore?",
      "I'm Corin. Nothing I can identify yet.",
      "Corin! I found something that might be treasure.",
      "How certain is might?",
      "A dragon! That's better than anything I've found today.",
      "I'm Corin. His name is Aurelius."
    ]
  },
  "Astrid": {
    "name": "Astrid",
    "home": "Hollybeck",
    "role": "Provisions merchant",
    "source": "12-winter.txt:1",
    "topics": [
      {
        "title": "The first winter",
        "opening": "What was your first winter here like?",
        "first": "My first winter here, I stored plenty of food and nowhere near enough fuel. I had prepared for hunger and overlooked cold.",
        "replies": [
          [
            "Who helped you?",
            "Neighbours who remembered their own first winter."
          ],
          [
            "Did you repay them?",
            "Helped when I could. They hadn't opened an account."
          ],
          [
            "What do you check now?",
            "Food, fuel, and who might be too proud to ask."
          ]
        ]
      },
      {
        "title": "Feeding neighbours",
        "opening": "How do you make sure your neighbours have enough to eat?",
        "first": "When someone needs supper, I try to make the invitation ordinary. Being helped can already feel difficult.",
        "replies": [
          [
            "Do people refuse?",
            "Sometimes. I leave room for them to return."
          ],
          [
            "Who cooks for you?",
            "Runa occasionally. Her confidence exceeds her experience in interesting ways."
          ],
          [
            "Do you enjoy a crowd?",
            "With enough supplies and someone else washing bowls."
          ]
        ]
      },
      {
        "title": "A thaw's promise",
        "opening": "What do you look forward to when the thaw comes?",
        "first": "The first thaw makes everyone plan too much. Mud then provides a correction.",
        "replies": [
          [
            "What do you look forward to?",
            "Opening a door without bracing against the weather."
          ],
          [
            "Would you leave the snow?",
            "For a visit. I'd miss knowing this town's habits."
          ],
          [
            "Even the complaints?",
            "Especially the familiar ones. I know which need attention."
          ]
        ]
      }
    ],
    "greetings": [
      "Astrid. Come out of the wind before explaining that you aren't cold.",
      "I'm Corin. I won't waste time denying it.",
      "Corin! Warm enough to talk properly?",
      "Getting there.",
      "A dragon in Hollybeck. I hope you both found a manageable route.",
      "I'm Corin; this is Aurelius. We're glad to stop."
    ]
  },
  "Sverre": {
    "name": "Sverre",
    "home": "Hollybeck",
    "role": "Mountain-road veteran",
    "source": "12-winter.txt:6",
    "topics": [
      {
        "title": "Following a fence",
        "opening": "Can a fence help you find your way through snow?",
        "first": "In a blizzard I followed a fence toward a farmhouse. I could barely see the next post.",
        "replies": [
          [
            "How did you know where it led?",
            "I'd walked that boundary earlier. Guessing would have been dangerous."
          ],
          [
            "Did you reach the house?",
            "Yes, cold and ashamed I'd stayed out so late."
          ],
          [
            "What would you change?",
            "Turn back while I could still see the weather arriving."
          ]
        ]
      },
      {
        "title": "A traveller's gloves",
        "opening": "Have you ever helped a traveller who wasn't dressed for the cold?",
        "first": "A visitor once had splendid gloves packed at the bottom of a bag and numb hands opening the straps.",
        "replies": [
          [
            "Did you help?",
            "Opened the bag, then explained accessible packing."
          ],
          [
            "Was he grateful?",
            "After his fingers warmed and his pride cooled."
          ],
          [
            "What belongs near the top?",
            "What you'll need before you're comfortable unpacking everything."
          ]
        ]
      },
      {
        "title": "An ordinary welcome",
        "opening": "What makes a stranger feel welcome here?",
        "first": "I remember a stranger offering me a dry place to sit without first asking why I'd been foolish.",
        "replies": [
          [
            "Did you tell him later?",
            "Over supper. He listened without improving my shame."
          ],
          [
            "Do you offer the same?",
            "When I can. Warmth first, questions afterward."
          ],
          [
            "Did you see him again?",
            "No. I still remember where he put the spare blanket."
          ]
        ]
      }
    ],
    "greetings": [
      "Sverre. Before the mountain, check what you can still change in town.",
      "I'm Corin. I'd like to hear your advice.",
      "Corin! A face returned from the road.",
      "It's good to be recognised.",
      "A dragon can face the cold differently from a rider.",
      "I'm Corin. Aurelius is managing better than my fingers."
    ]
  },
  "Runa": {
    "name": "Runa",
    "home": "Hollybeck",
    "role": "Young cook",
    "source": "12-winter.txt:11",
    "topics": [
      {
        "title": "Your first broth",
        "opening": "How did your first broth turn out?",
        "first": "I put everything fragrant into my first broth. It smelled magnificent and tasted like an argument.",
        "replies": [
          [
            "Did Astrid eat it?",
            "A little, then asked me to identify each flavour."
          ],
          [
            "Could you?",
            "Not one. They had defeated each other."
          ],
          [
            "What do you do now?",
            "Choose fewer ingredients and taste before celebrating."
          ]
        ]
      },
      {
        "title": "The thaw",
        "opening": "What changes here when the snow starts melting?",
        "first": "I love the thaw and hate the mud. Apparently wanting spring involves accepting its entrance.",
        "replies": [
          [
            "What do you do first?",
            "Walk farther than winter allowed, then clean my boots."
          ],
          [
            "Does everyone celebrate?",
            "After checking what the melting snow has damaged."
          ],
          [
            "Would you prefer warm weather all year?",
            "I'd miss the excitement of the change. Briefly, perhaps."
          ]
        ]
      },
      {
        "title": "Learning from Astrid",
        "opening": "What have you learned from Astrid?",
        "first": "Astrid lets me try things, then asks what I think went wrong. It's much harder than being told.",
        "replies": [
          [
            "Does that annoy you?",
            "Yes. Then I remember the answer longer."
          ],
          [
            "Does she make mistakes?",
            "She admits them, which makes mine less frightening."
          ],
          [
            "What would you teach someone?",
            "How to begin again before declaring dinner ruined."
          ]
        ]
      }
    ],
    "greetings": [
      "Runa. Astrid says enthusiasm is not a substitute for measuring. I remain under review.",
      "I'm Corin. What are the findings?",
      "Corin! Nobody has complained about today's cooking yet.",
      "An encouraging report.",
      "A dragon would require a recipe I haven't attempted.",
      "I'm Corin. Aurelius isn't requesting an experiment."
    ]
  },
  "Solveig": {
    "name": "Solveig",
    "home": "Hollybeck",
    "role": "Clothing mender",
    "source": "12-winter.txt:16",
    "topics": [
      {
        "title": "The unfinished mitten",
        "opening": "Have you ever left a mitten unfinished?",
        "first": "I knitted one mitten beautifully, then couldn't remember exactly how I'd shaped it.",
        "replies": [
          [
            "Could you make its partner?",
            "After several attempts. The first pair belonged to different hands entirely."
          ],
          [
            "Did anyone wear them?",
            "My niece, who regarded asymmetry as a distinction."
          ],
          [
            "Do you keep notes now?",
            "Enough to prevent another household investigation."
          ]
        ]
      },
      {
        "title": "Mending winter clothes",
        "opening": "Do winter clothes need constant mending?",
        "first": "A small hole matters when the wind finds it. People notice the cold before they notice the seam.",
        "replies": [
          [
            "Can you fix it quickly?",
            "Often, if brought before it tears further."
          ],
          [
            "Do you dislike the work?",
            "No. A useful repair gives an immediate result."
          ],
          [
            "What's your favourite material?",
            "Wool that has been cared for. It repays the attention."
          ]
        ]
      },
      {
        "title": "Tea that never boiled",
        "opening": "Have you ever waited ages for water that wasn't heating?",
        "first": "I once knitted through the time I'd meant to heat water. The kettle had been sitting above a dead fire.",
        "replies": [
          [
            "Did you notice the quiet?",
            "Only when I grew thirsty enough to investigate."
          ],
          [
            "Was the knitting finished?",
            "A fine cuff and no tea."
          ],
          [
            "Have you repeated that?",
            "I'm refusing to provide a total."
          ]
        ]
      }
    ],
    "greetings": [
      "Solveig. Warm clothing is worth discussing before your teeth begin doing the talking.",
      "I'm Corin. I'll take that advice early.",
      "Corin! Seams holding and fingers working?",
      "Both, fortunately.",
      "Your companion doesn't appear to need a scarf.",
      "I'm Corin. Aurelius has considerable advantages in the cold."
    ]
  },
  "Nils": {
    "name": "Nils",
    "home": "Hollybeck",
    "role": "Lane keeper",
    "source": "12-winter.txt:21",
    "topics": [
      {
        "title": "Snow before breakfast",
        "opening": "Do you have to clear snow before breakfast?",
        "first": "I once postponed clearing fresh snow until after breakfast. By then it had hardened under traffic.",
        "replies": [
          [
            "Was it much harder?",
            "Enough that breakfast became my least favourite memory."
          ],
          [
            "Do you always begin early?",
            "When I can. Fresh trouble is easier than settled trouble."
          ],
          [
            "Do neighbours help?",
            "Yes, especially when their door is involved."
          ]
        ]
      },
      {
        "title": "A cleared path",
        "opening": "Is there always somebody keeping the paths clear?",
        "first": "A clear lane lets people do ordinary things again. Nobody praises it as dramatically as a new building.",
        "replies": [
          [
            "Does that bother you?",
            "Only when someone assumes it clears itself."
          ],
          [
            "What do you enjoy?",
            "Seeing a neighbour make a trip they'd postponed."
          ],
          [
            "Would you choose other work?",
            "On bitter mornings, absolutely. Then the work starts and I settle."
          ]
        ]
      },
      {
        "title": "Predicting the thaw",
        "opening": "Can you tell when the thaw is coming?",
        "first": "Everyone asks when the thaw will come. I give them the same answer as the sky: eventually.",
        "replies": [
          [
            "Can't you tell?",
            "Sometimes signs help. They don't sign a contract."
          ],
          [
            "Do people want certainty?",
            "Especially when certainty would be convenient."
          ],
          [
            "What do you hope for?",
            "A gradual melt and fewer people testing ice to prove a point."
          ]
        ]
      }
    ],
    "greetings": [
      "Nils. If you've found a slippery patch, describe where before describing the fall.",
      "I'm Corin. No fall to report yet.",
      "Corin! Still upright. Good.",
      "I'm trying to maintain the record.",
      "A dragon's feet will leave an unmistakable report in snow.",
      "I'm Corin; this is Aurelius. We'll avoid the narrowest lanes."
    ]
  },
  "Freya": {
    "name": "Freya",
    "home": "Hollybeck",
    "role": "Town resident",
    "source": "12-winter.txt:26",
    "topics": [
      {
        "title": "The red scarf",
        "opening": "Is there a story behind your red scarf?",
        "first": "I wore a red scarf while playing hide-and-seek in snow. My brother found me every time.",
        "replies": [
          [
            "Did you change scarves?",
            "No. I changed games. Some victories cost too much."
          ],
          [
            "Were you angry?",
            "Until he explained how visible I'd made myself."
          ],
          [
            "Do you still wear red?",
            "Certainly. Being found is useful when I'm not playing."
          ]
        ]
      },
      {
        "title": "A sibling's challenge",
        "opening": "Do you and your siblings challenge one another?",
        "first": "My brother challenged me to stay silent all morning. He lasted six minutes before asking whether I was still playing.",
        "replies": [
          [
            "Did you win?",
            "With considerable effort not to laugh."
          ],
          [
            "What was the prize?",
            "Choosing supper. I made a strategically irritating choice."
          ],
          [
            "Do you often compete?",
            "Enough to keep ordinary chores unnecessarily interesting."
          ]
        ]
      },
      {
        "title": "A quiet snowfall",
        "opening": "Do you like watching snow fall when everything's quiet?",
        "first": "I like the first quiet after fresh snow. Before anyone begins moving it into other people's way.",
        "replies": [
          [
            "Do you go out immediately?",
            "Sometimes. Other times I watch from somewhere warm."
          ],
          [
            "What do you notice?",
            "How familiar shapes look strange under a white edge."
          ],
          [
            "Would you paint it?",
            "I'd rather learn to describe it without saying 'beautiful' six times."
          ]
        ]
      }
    ],
    "greetings": [
      "Freya. If my brother sent you to ask where I've hidden something, I deny everything.",
      "I'm Corin. No investigation today.",
      "Corin! Arriving without my brother is a promising start.",
      "I'll try not to disappoint you.",
      "A dragon! He'll never believe this when I tell him.",
      "I'm Corin. My companion's name is Aurelius."
    ]
  },
  "Oskar": {
    "name": "Oskar",
    "home": "Hollybeck",
    "role": "Longtime resident",
    "source": "12-winter.txt:31",
    "topics": [
      {
        "title": "Your own wet boots",
        "opening": "Have you ever broken one of your own rules about wet boots?",
        "first": "I told a visitor to clean his boots and then walked in with mine covered in snow.",
        "replies": [
          [
            "Did he point it out?",
            "Handed me a cloth without a word. Devastating courtesy."
          ],
          [
            "Were you embarrassed?",
            "Enough to clean both sets of tracks."
          ],
          [
            "Do you still give that advice?",
            "Yes. I check my own feet first."
          ]
        ]
      },
      {
        "title": "Winter memories",
        "opening": "Which winter do you remember most clearly?",
        "first": "People call old winters worse. I remember being younger and having worse coats.",
        "replies": [
          [
            "Do you think they exaggerate?",
            "Sometimes. Memory compares feelings more readily than measurements."
          ],
          [
            "Were there terrible winters?",
            "Certainly. We shouldn't need to enlarge them."
          ],
          [
            "What do you remember fondly?",
            "Who sat with us when the weather kept everyone close."
          ]
        ]
      },
      {
        "title": "A visitor's pace",
        "opening": "Do visitors ever try to hurry you?",
        "first": "Visitors often rush a conversation because they assume I tire easily. Some of them exhaust me explaining that.",
        "replies": [
          [
            "Would you rather they asked?",
            "Yes. I can generally describe my own condition."
          ],
          [
            "Do you enjoy long visits?",
            "With people interested in hearing an answer."
          ],
          [
            "May I come again?",
            "Please. We can decide the length when you arrive."
          ]
        ]
      }
    ],
    "greetings": [
      "Oskar. You can stamp snow off your boots without apologising to the floor.",
      "I'm Corin. I'll do both if necessary.",
      "Corin! Come share an ordinary moment.",
      "I'd welcome one.",
      "A dragon. Give an old man time to arrange a suitable expression.",
      "I'm Corin. Aurelius isn't in a hurry."
    ]
  },
  "Edda": {
    "name": "Edda",
    "home": "Hollybeck",
    "role": "Householder",
    "source": "12-winter.txt:36",
    "topics": [
      {
        "title": "The roof repair",
        "opening": "How did you manage when the roof needed repairing?",
        "first": "I postponed a small roof repair until rain made the decision expensive.",
        "replies": [
          [
            "Did it damage much?",
            "Enough to erase the savings I imagined I'd made."
          ],
          [
            "Who repaired it?",
            "A neighbour with the right experience. I stopped guessing."
          ],
          [
            "What did you learn?",
            "Ask before a small problem begins choosing for you."
          ]
        ]
      },
      {
        "title": "Saving for pleasure",
        "opening": "Do you ever save money for something you simply want?",
        "first": "Every time I save for something pleasant, the house invents a need.",
        "replies": [
          [
            "What were you saving for?",
            "A visit to family. Less urgent than a roof, more important than I admitted."
          ],
          [
            "Will you still go?",
            "Yes, when I can. I won't let the plan disappear quietly."
          ],
          [
            "Would you leave the house?",
            "For a visit, gladly. Permanently is another question."
          ]
        ]
      },
      {
        "title": "A room repainted",
        "opening": "Can repainting a room make much difference?",
        "first": "I changed a room's colour and discovered how much I'd disliked the old one.",
        "replies": [
          [
            "Why hadn't you changed it?",
            "It was serviceable. I had mistaken that for a rule."
          ],
          [
            "What did you choose?",
            "A warmer shade that looks cheerful in winter light."
          ],
          [
            "Was it worth the work?",
            "I enjoy it every morning. A fair return."
          ]
        ]
      }
    ],
    "greetings": [
      "Edda. If you hear a repair estimate in my voice, forgive me. Houses are expensive listeners.",
      "I'm Corin. I won't request any renovations.",
      "Corin! A visitor with no ladder.",
      "A modest but dependable advantage.",
      "A dragon is a cheerful distraction from roof worries.",
      "I'm Corin. Aurelius can remain outside the fragile parts."
    ]
  },
  "Fennel": {
    "name": "Fennel",
    "home": "Hollybeck",
    "role": "Herb grower",
    "source": "12-winter.txt:41",
    "topics": [
      {
        "title": "Herbs in winter",
        "opening": "How do you keep herbs through the winter?",
        "first": "Growing herbs here involves shelter, timing, and accepting that some plants dislike my ambitions.",
        "replies": [
          [
            "What grows best?",
            "The varieties suited to the cold. Predictable, but I tested others anyway."
          ],
          [
            "Were the tests successful?",
            "Enough failures to improve my respect for neighbours' advice."
          ],
          [
            "Why keep trying?",
            "A small success smells particularly good after winter."
          ]
        ]
      },
      {
        "title": "The open back door",
        "opening": "What happens when someone leaves the back door open?",
        "first": "I once forgot the back door while carrying supplies. Spent the evening complaining about an inexplicable draught.",
        "replies": [
          [
            "Who found it?",
            "Bjorn, with considerable restraint."
          ],
          [
            "Did anything get in?",
            "Mostly cold. Fortunately."
          ],
          [
            "Do you check now?",
            "Every evening. Repetition has become cheaper than another frozen kitchen."
          ]
        ]
      },
      {
        "title": "Home before dusk",
        "opening": "Why do you like getting home before dusk?",
        "first": "I enjoy the moment the evening chores are done and the door is fastened.",
        "replies": [
          [
            "Doesn't that feel restrictive?",
            "It feels comfortable. Your preferred hour may be different."
          ],
          [
            "Do you ever stay out?",
            "For company I trust and a sensible way home."
          ],
          [
            "What do you do indoors?",
            "Read, prepare herbs, and stop pretending every minute needs employment."
          ]
        ]
      }
    ],
    "greetings": [
      "Fennel. I prefer getting home before dark. You may call it cautious after I've shut the door.",
      "I'm Corin. Cautious sounds sensible here.",
      "Corin! Still time for a conversation before I worry about the light.",
      "I'll respect your schedule.",
      "A dragon is reassuring, but I'd still watch the road.",
      "I'm Corin. Aurelius and I do both."
    ]
  },
  "Bjorn": {
    "name": "Bjorn",
    "home": "Hollybeck",
    "role": "Cook",
    "source": "12-winter.txt:46",
    "topics": [
      {
        "title": "The second helping",
        "opening": "How do you decide who needs a second helping?",
        "first": "I used to offer second helpings until people surrendered. Fennel explained that wasn't quite the same as generosity.",
        "replies": [
          [
            "Did you listen?",
            "After remembering meals where I'd felt trapped."
          ],
          [
            "What do you do now?",
            "Offer once and believe the answer."
          ],
          [
            "Do you still cook too much?",
            "Frequently. I've made peace with tomorrow's lunch."
          ]
        ]
      },
      {
        "title": "A proper broth",
        "opening": "What makes a really good broth?",
        "first": "A proper broth tastes of what you put in it, rather than everything you could find.",
        "replies": [
          [
            "Have you made that mistake?",
            "An enthusiastic attempt involving far too many herbs."
          ],
          [
            "Could you rescue it?",
            "Only by making an enormous amount of plainer broth."
          ],
          [
            "Who ate it?",
            "Neighbours who now ask how much I've made before accepting."
          ]
        ]
      },
      {
        "title": "Cooking for grief",
        "opening": "Can cooking help when someone is grieving?",
        "first": "When someone is grieving, I bring food they can warm easily. I don't expect a conversation in return.",
        "replies": [
          [
            "Who taught you that?",
            "Someone who did the same for me."
          ],
          [
            "Do people appreciate it?",
            "Usually. I ask what they can actually use."
          ],
          [
            "Why not stay and help?",
            "Sometimes they want that. Sometimes the kindest visit is short."
          ]
        ]
      }
    ],
    "greetings": [
      "Bjorn. If you've already eaten, say so before I mistake politeness for appetite.",
      "I'm Corin. I'll be honest about both.",
      "Corin! Company is welcome even when supper isn't ready.",
      "That's why I came.",
      "A dragon would require advance notice and several larger pots.",
      "I'm Corin. Aurelius isn't expecting you to feed us."
    ]
  },
  "Iris": {
    "name": "Iris",
    "home": "Hollybeck",
    "role": "Town resident",
    "source": "12-winter.txt:51",
    "topics": [
      {
        "title": "Firewood indoors",
        "opening": "Where do you keep enough firewood for winter?",
        "first": "One winter the outer door froze shut with my dry wood beyond it. I rearranged the stores before the next snowfall.",
        "replies": [
          [
            "How did you keep warm?",
            "Burned spare wood from a broken stool. Not an ideal plan."
          ],
          [
            "Was anyone hurt?",
            "No. Mostly cold and cross."
          ],
          [
            "What do you check now?",
            "What I can reach when a door refuses cooperation."
          ]
        ]
      },
      {
        "title": "A neighbour's errand",
        "opening": "Do you run errands for the neighbours?",
        "first": "A neighbour kept visiting to borrow kindling. I finally realised the tea mattered more than the wood.",
        "replies": [
          [
            "Did you tell her?",
            "I began inviting her directly."
          ],
          [
            "Did she keep coming?",
            "Yes, without having to invent a shortage."
          ],
          [
            "Do you miss those visits?",
            "When the house is quiet. I visit others now too."
          ]
        ]
      },
      {
        "title": "The spring list",
        "opening": "What do you want to do when spring comes?",
        "first": "I write a winter list of repairs for spring. By spring, some entries look like accusations.",
        "replies": [
          [
            "Do you finish them all?",
            "The necessary ones first. The heroic plans receive reconsideration."
          ],
          [
            "Who helps you?",
            "Neighbours with skills I lack. I return what help I can."
          ],
          [
            "What's a pleasant task?",
            "Opening the house to mild air after months of guarding warmth."
          ]
        ]
      }
    ],
    "greetings": [
      "Iris. Come in if you've time; doorways make poor sitting rooms.",
      "I'm Corin. I'd like to stop.",
      "Corin! A visit that wasn't postponed until spring.",
      "I'm glad I came.",
      "A dragon is quite a visitor for an ordinary day.",
      "I'm Corin. This is Aurelius, who shares the opinion."
    ]
  },
  "Dunstan": {
    "name": "Dunstan",
    "home": "Forgewick",
    "role": "Blacksmith",
    "source": "13-crafts-and-keepers.txt:1",
    "topics": [
      {
        "title": "Choosing the forge",
        "opening": "What made you choose the forge?",
        "first": "I liked the moment rough metal began doing what I intended. Took years to make that happen reliably.",
        "replies": [
          [
            "Who taught you?",
            "A smith with no patience for explanations offered before measurements."
          ],
          [
            "Was Sela there too?",
            "My brother preferred glass. We learned different ways of ruining a hot day's work."
          ],
          [
            "Do you still enjoy it?",
            "Yes. Even when I complain. Especially after a difficult piece fits."
          ]
        ]
      },
      {
        "title": "Your brother's trade",
        "opening": "Do you and Sela agree about each other's work?",
        "first": "Sela works glass in Sandspire. I tease him about fragile material; he asks why I keep buying his work.",
        "replies": [
          [
            "Do you get along?",
            "Well enough to argue honestly. That's family at its best."
          ],
          [
            "Do you visit often?",
            "Less than we should. Furnaces make demanding excuses."
          ],
          [
            "Who chose the better trade?",
            "Ask him. Then return for the accurate answer."
          ]
        ]
      },
      {
        "title": "Equipment and habit",
        "opening": "Can good equipment make up for bad habits?",
        "first": "Good equipment gives you a chance. It doesn't correct where you put your feet.",
        "replies": [
          [
            "What should I practise?",
            "Moving clear of danger before relying on protection."
          ],
          [
            "How do I judge a blade?",
            "Balance, sound condition, and whether you can control it."
          ],
          [
            "Do you blame a broken weapon?",
            "I ask how it broke. Sometimes the steel deserves the blame."
          ]
        ]
      },
      {
        "title": "A gift for the road",
        "opening": "Why give equipment to someone who's only passing through?",
        "first": "I remember needing help before I could pay for it. Someone helped anyway.",
        "replies": [
          [
            "Is that why you're helping me?",
            "Partly. I've also met you. That matters."
          ],
          [
            "Will you need repayment?",
            "No. Don't turn my choice into your debt."
          ],
          [
            "What can I do instead?",
            "Use what I give you carefully and return alive to complain about it."
          ]
        ]
      }
    ],
    "greetings": [
      "Dunstan. Smith. Tell me what the blade does wrong before telling me who sold it.",
      "I'm Corin. I'd welcome an experienced look.",
      "Corin. You and your equipment still speaking to each other?",
      "We've had disagreements.",
      "A dragon, here. That's a furnace I won't be giving orders to.",
      "I'm Corin; this is Aurelius. A sensible introduction."
    ]
  },
  "Sela": {
    "name": "Sela",
    "home": "Sandspire",
    "role": "Glassmaker and Dunstan's brother",
    "source": "13-crafts-and-keepers.txt:7",
    "topics": [
      {
        "title": "Glass in motion",
        "opening": "What do you watch for while you're shaping glass?",
        "first": "Hot glass keeps moving. Hesitate without supporting it and yesterday's confidence becomes today's strange lump.",
        "replies": [
          [
            "How do you learn the timing?",
            "Practice on pieces simple enough to understand."
          ],
          [
            "Do you still ruin things?",
            "Of course. The furnace doesn't recognise seniority."
          ],
          [
            "Can failed glass be reused?",
            "Often. Not every mistake has to remain its first shape."
          ]
        ]
      },
      {
        "title": "Dunstan's advice",
        "opening": "Does Dunstan give you much advice?",
        "first": "Dunstan tells me glass breaks. I remind him people visit his smithy because metal breaks too.",
        "replies": [
          [
            "Does he admit that?",
            "In increasingly technical language."
          ],
          [
            "Do you make things together?",
            "We exchange materials and tools. Each claims the other benefits more."
          ],
          [
            "Do you miss living near him?",
            "Yes. Arguments travel poorly in letters."
          ]
        ]
      },
      {
        "title": "Making protection",
        "opening": "How did you start making glass that could protect someone?",
        "first": "The Glass Shield uses a field to turn force aside. Treating it like an ordinary metal shield misunderstands the work.",
        "replies": [
          [
            "Does carrying it protect me?",
            "You must raise its field with B during battle."
          ],
          [
            "Can it replace moving away?",
            "No. Avoid what you can; use protection deliberately."
          ],
          [
            "Are you proud of it?",
            "Very. I'd be prouder to know it brought someone home."
          ]
        ]
      }
    ],
    "greetings": [
      "Sela. Glassmaker. If Dunstan sent you, I expect his description needs correcting.",
      "I'm Corin. I'll let you speak for yourself.",
      "Corin! Come through before I begin explaining a furnace to myself.",
      "I'd like to hear the human version.",
      "A dragon's fire and a glass furnace are very different arrangements.",
      "I'm Corin. Aurelius isn't offering a demonstration indoors."
    ]
  },
  "Meriel": {
    "name": "Meriel",
    "home": "Sandspire glass shop",
    "role": "Glass seller",
    "source": "13-crafts-and-keepers.txt:12",
    "topics": [
      {
        "title": "Explaining a price",
        "opening": "How do you explain the price of handmade glass?",
        "first": "Customers see a cup and ask why it costs more than another. I explain the work before defending the number.",
        "replies": [
          [
            "Do they understand?",
            "Sometimes. Sometimes they simply wanted the cheaper cup."
          ],
          [
            "Does that bother you?",
            "No. Taste and budget needn't agree with my enthusiasm."
          ],
          [
            "What do you enjoy selling?",
            "A piece someone clearly intends to use."
          ]
        ]
      },
      {
        "title": "A gift chosen badly",
        "opening": "Have you ever helped someone choose entirely the wrong gift?",
        "first": "Someone asked me to choose a gift for a wife he described only as 'particular'. I asked what she actually liked.",
        "replies": [
          [
            "Could he answer?",
            "After some thought. Green, simple shapes, nothing fragile for display."
          ],
          [
            "Did you find something?",
            "Yes. He returned to say she'd used it immediately."
          ],
          [
            "Was he surprised?",
            "Pleasantly. Listening improved the purchase."
          ]
        ]
      },
      {
        "title": "Working with Sela",
        "opening": "What's Sela like to work with?",
        "first": "Sela can explain a flaw for ten minutes while a customer is deciding whether a cup feels comfortable.",
        "replies": [
          [
            "Do you interrupt?",
            "When needed. He appreciates it afterward."
          ],
          [
            "Does he like selling?",
            "He likes people understanding the work. The transaction interests him less."
          ],
          [
            "Do you enjoy the partnership?",
            "Yes. We notice different things a customer needs."
          ]
        ]
      }
    ],
    "greetings": [
      "Meriel. You may look without buying; looking carefully is rather the point.",
      "I'm Corin. I'd like to learn what I'm seeing.",
      "Corin! Another visit with time to look?",
      "Yes, and time to talk.",
      "Those scales would put a window display to shame.",
      "I'm Corin. Aurelius isn't competing for customers."
    ]
  },
  "Elin": {
    "name": "Elin",
    "home": "Sandspire glass shop",
    "role": "Local visitor",
    "source": "13-crafts-and-keepers.txt:17",
    "topics": [
      {
        "title": "A flower in glass",
        "opening": "Can you make a flower look alive in glass?",
        "first": "I wanted a glass flower until I realised I preferred watching sunlight through it to owning it.",
        "replies": [
          [
            "Will you still buy it?",
            "Perhaps. Enjoying something doesn't have to become a purchase."
          ],
          [
            "What colour is your favourite?",
            "The one that changes when you move. Unhelpful answer for a shop."
          ],
          [
            "Do you visit often?",
            "When I have time. Meriel doesn't make looking feel like a debt."
          ]
        ]
      },
      {
        "title": "Your own window",
        "opening": "Would you like coloured glass in your own window?",
        "first": "I'd like a little coloured glass at home, somewhere the morning light reaches.",
        "replies": [
          [
            "A grand design?",
            "No. Just enough colour to change an ordinary wall."
          ],
          [
            "Why morning light?",
            "It's when I'm usually there to enjoy it."
          ],
          [
            "Have you chosen anything?",
            "Not yet. The imagining has been pleasant too."
          ]
        ]
      },
      {
        "title": "Taking your time",
        "opening": "Do people mind when you stop to enjoy a place?",
        "first": "People ask what I'm waiting for when I linger. Sometimes I'm simply enjoying being somewhere.",
        "replies": [
          [
            "Does that annoy you?",
            "Only when I begin explaining myself unnecessarily."
          ],
          [
            "Do you like company while looking?",
            "If they aren't selecting things on my behalf."
          ],
          [
            "Could I join you?",
            "Certainly. We can disagree about colours without consequences."
          ]
        ]
      }
    ],
    "greetings": [
      "Elin. I've been looking at glass longer than I intended.",
      "I'm Corin. Is it easy to choose?",
      "Corin! Still undecided, in case you wondered.",
      "I wasn't going to hurry you.",
      "A dragon has rather distracted me from the colours.",
      "I'm Corin. Aurelius often changes a person's plans briefly."
    ]
  },
  "Alderic": {
    "name": "Alderic",
    "home": "Forgewick Temple",
    "role": "Keeper of the Lightning sanctuary",
    "source": "13-crafts-and-keepers.txt:22",
    "topics": [
      {
        "title": "Lightning and the bond",
        "opening": "What does Lightning change about the bond?",
        "first": "The Lightning Heartstone lets Aurelius draw on another kind of power. Both of you must learn how to use it deliberately.",
        "replies": [
          [
            "Does the stone command him?",
            "No. Power doesn't transfer ownership of the creature who bears it."
          ],
          [
            "Will it make us invincible?",
            "No. It broadens what you can do; judgement remains necessary."
          ],
          [
            "Why preserve it here?",
            "So the knowledge and the power could be found together."
          ]
        ]
      },
      {
        "title": "Separate sanctuaries",
        "opening": "Why are the Heartstones kept in separate sanctuaries?",
        "first": "The Heartstones were kept in separate sanctuaries. A rider had to travel, learn, and encounter people beyond home.",
        "replies": [
          [
            "Was it a test?",
            "An education with real danger. I won't make the danger sound noble merely because it's old."
          ],
          [
            "Were the riders united?",
            "Not always. Their disagreements deserve remembering too."
          ],
          [
            "Why keep teaching after Wingfall?",
            "Because Halvard's victory shouldn't decide what future generations may learn."
          ]
        ]
      },
      {
        "title": "A keeper's doubts",
        "opening": "Have you ever doubted what you're keeping them for?",
        "first": "I spent years preserving lessons for someone who might never arrive. Some mornings the task felt foolish.",
        "replies": [
          [
            "Why continue?",
            "Abandoning it would have answered the question permanently."
          ],
          [
            "Did anyone help you?",
            "People whose quiet support rarely appears in grand histories."
          ],
          [
            "Was meeting us worth the wait?",
            "It gives the work a future. That is more than reassurance."
          ]
        ]
      },
      {
        "title": "What a rider owes",
        "opening": "What does being a rider require of me?",
        "first": "A rider owes a dragon attention and honesty. Obedience extracted through fear is a different relationship.",
        "replies": [
          [
            "What if we disagree?",
            "Then you have something to discuss, not a defect to punish."
          ],
          [
            "What if I make a mistake?",
            "Acknowledge the harm and change what caused it."
          ],
          [
            "Did the old riders always manage that?",
            "No. Their title did not make them wise by itself."
          ]
        ]
      }
    ],
    "greetings": [
      "Alderic. You've reached a place built to teach riders, though much of its welcome has been lost.",
      "I'm Corin. I want to understand what remains.",
      "Corin. The sanctuary remembers visitors less well than I do.",
      "Then I'm glad you're here.",
      "A living dragon. At last, these teachings have someone to address.",
      "I'm Corin. Aurelius and I will listen together."
    ]
  },
  "Maelis": {
    "name": "Maelis",
    "home": "Witchmoor",
    "role": "Witch and charm maker",
    "source": "13-crafts-and-keepers.txt:28",
    "topics": [
      {
        "title": "Your reputation",
        "opening": "Why do people call you wicked?",
        "first": "Someone blamed me for sour milk from a dirty pail. Apparently washing was less appealing than accusing a witch.",
        "replies": [
          [
            "Did you answer the accusation?",
            "Suggested hot water. They were disappointed by the lack of ceremony."
          ],
          [
            "Did they apologise?",
            "They stopped repeating it within earshot. A modest improvement."
          ],
          [
            "Does it hurt you?",
            "Sometimes. Repetition wears where one foolish remark would not."
          ]
        ]
      },
      {
        "title": "Learning remedies",
        "opening": "How did you learn to make remedies?",
        "first": "My first teacher made me name what I couldn't cure before explaining what I could.",
        "replies": [
          [
            "Why begin there?",
            "Because frightened people may believe a promise you shouldn't make."
          ],
          [
            "Was your teacher kind?",
            "Direct. I learned that was sometimes the kindness I needed."
          ],
          [
            "Do you teach others?",
            "Those willing to listen before collecting impressive ingredients."
          ]
        ]
      },
      {
        "title": "Life in the marsh",
        "opening": "Do you like living out here in the marsh?",
        "first": "I like living where visitors have made a deliberate effort to arrive.",
        "replies": [
          [
            "Does it get lonely?",
            "Occasionally. I invite company instead of blaming the trees."
          ],
          [
            "What do you dislike?",
            "Damp finding its way into things I'd declared protected."
          ],
          [
            "Would you move to town?",
            "And exchange frogs for neighbours discussing my laundry? Unlikely."
          ]
        ]
      },
      {
        "title": "Making a ward",
        "opening": "What goes into making a protective ward?",
        "first": "A ward is useful protection, not permission to become careless. People hear the first part more eagerly.",
        "replies": [
          [
            "What does yours do?",
            "It helps lessen harm when worn. Equip the charm; carrying a gift isn't using it."
          ],
          [
            "Why give one away?",
            "Because I can choose to help someone without selling them a mystery."
          ],
          [
            "Should I still avoid attacks?",
            "Unless you enjoy testing protection with your ribs, yes."
          ]
        ]
      }
    ],
    "greetings": [
      "Maelis. If you've come to ask whether the rumours are true, choose a specific rumour.",
      "I'm Corin. I'd rather meet you first.",
      "Corin. Returned without a crowd carrying torches. Encouraging.",
      "I came for a conversation.",
      "A dragon has chosen interesting company. Or perhaps you have.",
      "I'm Corin. Aurelius and I are working that out together."
    ]
  },
  "Sahir": {
    "name": "Sahir",
    "home": "Sandspire",
    "role": "Desert-route traveller",
    "source": "13-crafts-and-keepers.txt:34",
    "topics": [
      {
        "title": "A buried landmark",
        "opening": "Can you still find a landmark after the sand buries it?",
        "first": "A sand drift hid a landmark I'd relied on for years. I walked past the turning while feeling experienced.",
        "replies": [
          [
            "How did you recover?",
            "Stopped when the next landmark failed to appear."
          ],
          [
            "Were you far off course?",
            "Far enough. I returned before pretending it was a shortcut."
          ],
          [
            "What do you use now?",
            "Several signs together. No single stone owes me permanence."
          ]
        ]
      },
      {
        "title": "Travellers' tales",
        "opening": "How much of a traveller's tale do you believe?",
        "first": "People return from dangerous places and leave out how much time they spent afraid.",
        "replies": [
          [
            "Why do you think that is?",
            "Fear sounds less impressive after a safe meal."
          ],
          [
            "Do you leave it out?",
            "I try not to. Someone might make plans from my story."
          ],
          [
            "What should I listen for?",
            "What they actually saw, what they guessed, and when they went."
          ]
        ]
      },
      {
        "title": "A journey refused",
        "opening": "Have you ever refused to lead someone on a journey?",
        "first": "I refused a journey when my companion fell ill. The customer called the delay inconvenient.",
        "replies": [
          [
            "What did you tell him?",
            "That a sick traveller wasn't a scheduling problem to solve by shouting."
          ],
          [
            "Did you lose the work?",
            "Yes. My companion recovered."
          ],
          [
            "Would you decide differently?",
            "No. I disliked the cost, not the decision."
          ]
        ]
      }
    ],
    "greetings": [
      "Sahir. If you're considering the pyramid road, ask before setting off.",
      "I'm Corin. I'd like to know what I'm facing.",
      "Corin. Staying in town for a moment?",
      "Long enough to listen.",
      "A dragon may help on a dangerous road, but preparation still matters.",
      "I'm Corin. Aurelius and I agree on that."
    ]
  },
  "Olin": {
    "name": "Olin",
    "home": "Winter supply camp",
    "role": "Supply driver",
    "source": "13-crafts-and-keepers.txt:39",
    "topics": [
      {
        "title": "Packing the sled",
        "opening": "How do you decide what goes on the sled?",
        "first": "A sled's load needs balance, not merely enough rope. An uneven load fights every turn.",
        "replies": [
          [
            "Who packs yours?",
            "Signe and I. We check each other's work."
          ],
          [
            "Have you overturned it?",
            "Once. Repacking in snow teaches a memorable lesson."
          ],
          [
            "What's hardest to carry?",
            "Whatever must stay dry while everything around it melts."
          ]
        ]
      },
      {
        "title": "The long return",
        "opening": "Does the return journey feel longer to you?",
        "first": "Being close to home makes a delay harder. I keep thinking of the last ordinary meal before we left.",
        "replies": [
          [
            "What meal?",
            "Astrid's soup. Nothing grand; that's why I want it."
          ],
          [
            "Do you regret the journey?",
            "No. I regret underestimating the final stretch."
          ],
          [
            "What keeps you going?",
            "Signe. She notices when worry starts doing the talking."
          ]
        ]
      },
      {
        "title": "Working with Signe",
        "opening": "How do you and Signe divide the work?",
        "first": "Signe checks the plan while I want to begin moving. We prevent different mistakes.",
        "replies": [
          [
            "Do you argue?",
            "Certainly. Usually before doing something that needs two people."
          ],
          [
            "Who's usually right?",
            "She'll give you a remarkably detailed answer."
          ],
          [
            "Would you travel with someone else?",
            "Not by choice. Trust is valuable luggage."
          ]
        ]
      }
    ],
    "greetings": [
      "Olin. We brought supplies from Sandspire and encountered more winter than intended.",
      "I'm Corin. Tell me what happened.",
      "Corin! A familiar face on this trail helps.",
      "I wanted to check on you.",
      "A dragon is welcome company on a blocked winter road.",
      "I'm Corin; this is Aurelius. We'll hear you out."
    ]
  },
  "Signe": {
    "name": "Signe",
    "home": "Winter supply camp",
    "role": "Supply driver",
    "source": "13-crafts-and-keepers.txt:44",
    "topics": [
      {
        "title": "Checking the ropes",
        "opening": "Do you check every rope before setting out?",
        "first": "I check a knot after the load settles. Rope can look secure before the weight truly pulls on it.",
        "replies": [
          [
            "Did someone teach you?",
            "A driver who made me unload my careless work."
          ],
          [
            "Were you angry?",
            "Furious, then grateful when I saw what had slipped."
          ],
          [
            "Do you make Olin check?",
            "Yes. He complains while doing it correctly."
          ]
        ]
      },
      {
        "title": "Keeping watch together",
        "opening": "Is keeping watch easier with someone you trust?",
        "first": "When you're stranded, company can become short-tempered. We take turns worrying aloud.",
        "replies": [
          [
            "Does that help?",
            "It stops one person's silence from becoming the other's guess."
          ],
          [
            "What if you're both frightened?",
            "We say so and choose the next practical task."
          ],
          [
            "Do you sleep easily?",
            "Not here. I rest better knowing whose turn it is to listen."
          ]
        ]
      },
      {
        "title": "What waits at home",
        "opening": "What do you look forward to at home?",
        "first": "I want to put down the work and be Signe for an evening, rather than half of the missing supplies.",
        "replies": [
          [
            "What would you do?",
            "Eat, wash, and sit without inventorying anything."
          ],
          [
            "Will you travel again?",
            "Eventually. I won't decide while cold and exhausted."
          ],
          [
            "What will you remember?",
            "Who came looking, more than who was supposed to receive the goods."
          ]
        ]
      }
    ],
    "greetings": [
      "Signe. Olin will tell you about the distance. I'll tell you what stopped us.",
      "I'm Corin. I need to hear both.",
      "Corin, I'm glad you returned.",
      "I didn't want to leave you wondering.",
      "A dragon gives us a reason to reconsider our options.",
      "I'm Corin. Aurelius and I will help where we can."
    ]
  },
  "Dorrick": {
    "name": "Dorrick",
    "home": "Forgewick",
    "role": "Miner",
    "source": "14-remaining-cast.txt:1",
    "topics": [
      {
        "title": "The unexplored turn",
        "opening": "Have you ever left a turning in the mine unexplored?",
        "first": "I once entered a passage because I disliked admitting I'd lost my bearings. It led nowhere useful.",
        "replies": [
          [
            "How did you return?",
            "Retraced my steps while I could still recognise them."
          ],
          [
            "Did you tell the crew?",
            "Yes. They needed accurate directions, not my pride."
          ],
          [
            "What changed afterward?",
            "I mark uncertainty before it becomes a confident instruction."
          ]
        ]
      },
      {
        "title": "Miners' songs",
        "opening": "Do miners really sing while they work?",
        "first": "We sang above ground after shifts. People imagine underground work as one long heroic chorus.",
        "replies": [
          [
            "Why not sing below?",
            "You need to hear warnings and changing sounds."
          ],
          [
            "What did you sing afterward?",
            "Anything everyone knew badly enough to enjoy together."
          ],
          [
            "Do you miss that?",
            "More than I miss most of the work."
          ]
        ]
      },
      {
        "title": "A good lamp",
        "opening": "What makes a lamp safe to depend on underground?",
        "first": "A lamp isn't useful because it looks bright in a shop. It needs to keep working when conditions turn poor.",
        "replies": [
          [
            "What do you check?",
            "Fuel, condition, and whether it's suited to where we're going."
          ],
          [
            "Can dragon fire replace it?",
            "Not in every corner. Carry proper light."
          ],
          [
            "Would you enter the deep dark?",
            "Not without the Hollybeck Lantern. Ask Sverre about it."
          ]
        ]
      }
    ],
    "greetings": [
      "Dorrick. Ask about the mine before going farther than the light.",
      "I'm Corin. What should I know?",
      "Corin! Back above ground where conversation carries properly.",
      "I'm glad to be here.",
      "A dragon underground needs room as much as courage.",
      "I'm Corin. Aurelius and I check both."
    ]
  },
  "Hask": {
    "name": "Hask",
    "home": "Forgewick",
    "role": "Innkeeper",
    "source": "14-remaining-cast.txt:6",
    "topics": [
      {
        "title": "The wrong room",
        "opening": "Have you ever given someone the wrong room?",
        "first": "I once gave a guest directions to the room he'd just left. We both believed me for several steps.",
        "replies": [
          [
            "How did you notice?",
            "He recognised his own forgotten hat."
          ],
          [
            "Was he annoyed?",
            "Too tired. We laughed the following morning."
          ],
          [
            "Do you give clearer directions now?",
            "I establish where we're starting before announcing where we're going."
          ]
        ]
      },
      {
        "title": "An empty evening",
        "opening": "What do you do when the inn has no guests?",
        "first": "Quiet evenings sound pleasant until you're paying to keep an inn open.",
        "replies": [
          [
            "Do you miss the noise?",
            "After enjoying the first hour of silence."
          ],
          [
            "What do you do when it's quiet?",
            "Repairs, accounts, and excessive speculation about tomorrow."
          ],
          [
            "Why keep an inn?",
            "I like arrivals. People bring a different day through the door."
          ]
        ]
      },
      {
        "title": "A guest remembered",
        "opening": "Is there a guest you've never forgotten?",
        "first": "A traveller returned years later and remembered a meal I'd forgotten cooking.",
        "replies": [
          [
            "Was it especially good?",
            "Apparently he'd been very hungry and very lonely."
          ],
          [
            "Did that surprise you?",
            "How much an ordinary welcome had mattered."
          ],
          [
            "Do you remember every guest?",
            "No. I still try to welcome the one in front of me."
          ]
        ]
      }
    ],
    "greetings": [
      "Hask. A young visitor! My conversations have been repeating themselves lately.",
      "I'm Corin. I'll try to bring something new.",
      "Corin! Another excuse to stop predicting the weather.",
      "I'd enjoy a different subject.",
      "A dragon would certainly change the usual guest list.",
      "I'm Corin. Aurelius needs open space, not a room key."
    ]
  },
  "Marek": {
    "name": "Marek",
    "home": "Forgewick",
    "role": "Fisher",
    "source": "14-remaining-cast.txt:11",
    "topics": [
      {
        "title": "Watching the carts",
        "opening": "What do you notice when you watch the carts go by?",
        "first": "Carts pass all day and rarely stop. I used to resent that, as though every traveller owed me company.",
        "replies": [
          [
            "What changed?",
            "I remembered how often I'd passed someone while thinking of supper."
          ],
          [
            "Do you still count them?",
            "Occasionally. Old habits remain entertaining."
          ],
          [
            "Would you travel farther?",
            "I'd like to, when I can leave without worrying about home."
          ]
        ]
      },
      {
        "title": "The quiet pool",
        "opening": "Do you have a favourite quiet fishing place?",
        "first": "I prefer water where I can see the current change. Fishing becomes less guessing when I pay attention.",
        "replies": [
          [
            "Do you always catch something?",
            "No. Attention doesn't guarantee cooperation."
          ],
          [
            "What do you enjoy most?",
            "A reason to stay still outdoors."
          ],
          [
            "Do you fish alone?",
            "Often. Good company is welcome if it can tolerate waiting."
          ]
        ]
      },
      {
        "title": "A borrowed rod",
        "opening": "Has anyone ever lent you a rod?",
        "first": "I borrowed a rod and returned it with new line. The owner seemed more pleased by that than by the fish.",
        "replies": [
          [
            "Why replace the line?",
            "I'd damaged it. Returning a tool should include the damage."
          ],
          [
            "Did he lend it again?",
            "Yes, without the warning speech."
          ],
          [
            "Would you lend yours?",
            "To someone willing to ask before improvising a repair."
          ]
        ]
      }
    ],
    "greetings": [
      "Marek. I know the water better than I know the traffic passing it.",
      "I'm Corin. The water sounds a better subject.",
      "Corin! Stopping instead of hurrying through?",
      "For a while.",
      "A dragon would make a memorable fishing partner.",
      "I'm Corin. Aurelius is more interested in the catch than the waiting."
    ]
  },
  "Bregga": {
    "name": "Bregga",
    "home": "Hollybeck",
    "role": "Farmer",
    "source": "14-remaining-cast.txt:16",
    "topics": [
      {
        "title": "Winter ground",
        "opening": "Can anything grow in the winter ground?",
        "first": "Frozen ground makes yesterday's easy job impossible. I try to finish repairs before the soil hardens.",
        "replies": [
          [
            "Does that always happen?",
            "No. Then I have a long winter to resent my optimism."
          ],
          [
            "What gets priority?",
            "Anything animals or people depend on daily."
          ],
          [
            "Do you enjoy the spring?",
            "After the mud and before the new list of jobs grows teeth."
          ]
        ]
      },
      {
        "title": "A late harvest",
        "opening": "What happens when the harvest is late?",
        "first": "I once waited for a crop to improve and lost part of it to an early freeze.",
        "replies": [
          [
            "Could you save any?",
            "Enough, with neighbours helping quickly."
          ],
          [
            "Did you wait again next year?",
            "I watched conditions instead of my preferred date."
          ],
          [
            "Was the lesson expensive?",
            "Yes. Advice from others would have been cheaper."
          ]
        ]
      },
      {
        "title": "The living trees",
        "opening": "How do you look after the trees through the cold?",
        "first": "Winter trees look idle, but I dislike people treating them as spare firewood.",
        "replies": [
          [
            "Do you gather fallen wood?",
            "Where permitted and sensible. Living shelter has value too."
          ],
          [
            "Have you planted any?",
            "A few, protected while young."
          ],
          [
            "Will you see them grown?",
            "Perhaps. Someone will benefit either way."
          ]
        ]
      }
    ],
    "greetings": [
      "Bregga. Cold enough that I'm reconsidering every outdoor ambition.",
      "I'm Corin. I can sympathise.",
      "Corin! Arrived between complaints about the weather.",
      "A narrow opening.",
      "Your dragon looks better prepared for warmth than I am.",
      "I'm Corin. Aurelius has advantages I envy."
    ]
  },
  "Torvald": {
    "name": "Torvald",
    "home": "Hollybeck",
    "role": "Miner",
    "source": "14-remaining-cast.txt:21",
    "topics": [
      {
        "title": "Leaving the lantern",
        "opening": "What made you leave your lantern for another traveller?",
        "first": "I left my special lantern with Sverre. It belongs with someone who'll pass it to a traveller who needs it.",
        "replies": [
          [
            "Why not keep it?",
            "I wasn't using it where it mattered."
          ],
          [
            "Does Sverre understand it?",
            "He understands enough to explain why ordinary light won't do."
          ],
          [
            "Would you want it returned?",
            "I'd rather it kept someone alive than sat unused for my sake."
          ]
        ]
      },
      {
        "title": "The road south",
        "opening": "Do you miss travelling the southern road?",
        "first": "A passable road isn't necessarily a pleasant one. I choose my words carefully when people ask.",
        "replies": [
          [
            "What should I ask?",
            "When I last travelled it and what delayed me."
          ],
          [
            "Do you ever refuse advice?",
            "I refuse to pretend an old journey is current knowledge."
          ],
          [
            "Does that frustrate people?",
            "Less than discovering my confidence was borrowed from last year."
          ]
        ]
      },
      {
        "title": "An unexpected day off",
        "opening": "What do you do with an unexpected day off?",
        "first": "A halted shift once gave me an afternoon free. I spent half of it deciding how not to waste it.",
        "replies": [
          [
            "What did you finally do?",
            "Visited a friend. We discussed nothing important."
          ],
          [
            "Was that wasteful?",
            "It was the part I remembered afterward."
          ],
          [
            "Would you do it sooner now?",
            "I hope so. Experience ought to earn something."
          ]
        ]
      }
    ],
    "greetings": [
      "Torvald. If you're heading below ground, let's discuss light before bravery.",
      "I'm Corin. I'd prefer seeing what I'm facing.",
      "Corin! Back with daylight on your shoulders.",
      "A welcome change.",
      "A dragon brings fire, but a mine still has corners.",
      "I'm Corin. Aurelius and I won't rely on flame alone."
    ]
  },
  "Ingrid": {
    "name": "Ingrid",
    "home": "Hollybeck",
    "role": "Tavern worker",
    "source": "14-remaining-cast.txt:26",
    "topics": [
      {
        "title": "Recognising regulars",
        "opening": "How do you recognise people who come back here?",
        "first": "I remember people's usual drinks before their names. I'm working to reverse that order.",
        "replies": [
          [
            "Does anyone mind?",
            "One man changed his order to see whether I'd notice."
          ],
          [
            "Did you?",
            "Immediately. Then had to ask his name."
          ],
          [
            "Do you know it now?",
            "Yes. He's become delightfully difficult to forget."
          ]
        ]
      },
      {
        "title": "Closing in winter",
        "opening": "What does closing up involve in winter?",
        "first": "Winter customers linger because leaving means facing the cold. Unfortunately I must go home too.",
        "replies": [
          [
            "How do you persuade them?",
            "Remind them I own a coat, not an endless evening."
          ],
          [
            "Are they considerate?",
            "Most, once I say it plainly."
          ],
          [
            "Do you enjoy the work?",
            "The company, yes. The final wet floor, less so."
          ]
        ]
      },
      {
        "title": "Beyond the graves",
        "opening": "Do you ever wish your work took you somewhere beyond the graves?",
        "first": "I avoid the graveyard after dark. People occasionally challenge me to prove I'm not frightened.",
        "replies": [
          [
            "What do you tell them?",
            "That being frightened is already established. I'm proving I can choose."
          ],
          [
            "Have you seen anything there?",
            "Enough strange movement to keep my caution."
          ],
          [
            "Would you warn a traveller?",
            "Yes, without inventing a monster to make the warning exciting."
          ]
        ]
      }
    ],
    "greetings": [
      "Ingrid. Warm up before trying to convince me you're comfortable.",
      "I'm Corin. My expression has betrayed me.",
      "Corin! Come lend this day another voice.",
      "I'd like that.",
      "A dragon's warmth must be welcome on this road.",
      "I'm Corin. Aurelius has been much appreciated."
    ]
  },
  "Sigrun": {
    "name": "Sigrun",
    "home": "Hollybeck",
    "role": "Cook",
    "source": "14-remaining-cast.txt:31",
    "topics": [
      {
        "title": "Broth for a crowd",
        "opening": "How do you make enough broth for a crowd?",
        "first": "When feeding a crowd, I prepare what can wait without spoiling. Guests arrive according to their own clocks.",
        "replies": [
          [
            "Doesn't that limit the menu?",
            "It improves my temper, which improves the meal."
          ],
          [
            "What's most popular?",
            "Food served hot to people who are actually hungry."
          ],
          [
            "Do you enjoy big meals?",
            "With enough help. Generosity still creates dishes."
          ]
        ]
      },
      {
        "title": "A secret ingredient",
        "opening": "Do you have an ingredient you keep secret?",
        "first": "People keep asking for my secret ingredient. Usually I tell them patience, which disappoints shoppers.",
        "replies": [
          [
            "Is that the whole secret?",
            "Taste before serving. Another poorly kept mystery."
          ],
          [
            "Do you follow recipes?",
            "Until I understand what they're trying to achieve."
          ],
          [
            "Can anyone learn?",
            "Anyone willing to make an ordinary meal before a masterpiece."
          ]
        ]
      },
      {
        "title": "A meal remembered",
        "opening": "Is there a meal that brings back a particular memory?",
        "first": "My mother once burned supper, and we ate bread together laughing about the smoke.",
        "replies": [
          [
            "Was she upset?",
            "Initially. Then my father made the first useful joke."
          ],
          [
            "Why remember that meal?",
            "We were comfortable enough to let it go wrong."
          ],
          [
            "Do you manage that yourself?",
            "More easily when I stop treating dinner as an examination."
          ]
        ]
      }
    ],
    "greetings": [
      "Sigrun. A hot bowl helps more than an argument about how cold it is.",
      "I'm Corin. A practical philosophy.",
      "Corin! Come discuss something while I rest my feet.",
      "Gladly.",
      "A dragon would require a very different soup pot.",
      "I'm Corin. Aurelius isn't expecting catering."
    ]
  },
  "Serjeant Bram": {
    "name": "Serjeant Bram",
    "home": "Royal entourage",
    "role": "Veteran serjeant",
    "source": "14-remaining-cast.txt:36",
    "topics": [
      {
        "title": "A recruit's name",
        "opening": "Do you remember the names of new recruits?",
        "first": "I learn recruits' names before correcting them. A person should know I'm speaking to him, not merely shouting at a uniform.",
        "replies": [
          [
            "Who taught you that?",
            "A serjeant who remembered mine after a disastrous first patrol."
          ],
          [
            "What went wrong?",
            "I lost the route and tried to hide it."
          ],
          [
            "Did he punish you?",
            "Made me learn it properly. Humiliation wasn't the objective."
          ]
        ]
      },
      {
        "title": "Orders and consequences",
        "opening": "Who answers for what happens when an order is carried out?",
        "first": "An order can be clear and still be wrong. Rank makes that distinction difficult to discuss aloud.",
        "replies": [
          [
            "Have you refused one?",
            "I've questioned them. The rest isn't a tavern conversation."
          ],
          [
            "Does silence make you responsible?",
            "Sometimes. I'm not offering myself an easy answer."
          ],
          [
            "What should a soldier protect?",
            "People. Remembering which people is the difficult test."
          ]
        ]
      },
      {
        "title": "A quiet ambition",
        "opening": "Is there anything you want beyond your rank?",
        "first": "I'd like a garden small enough to finish tending before supper.",
        "replies": [
          [
            "Would you retire there?",
            "If circumstances permit. I'm tired of planning only the next duty."
          ],
          [
            "What would you grow?",
            "Food first. Flowers afterward, if I discover some patience."
          ],
          [
            "Do you think you'd enjoy peace?",
            "I'd like the opportunity to find out badly."
          ]
        ]
      },
      {
        "title": "A name in the report",
        "opening": "What happens after you put someone's name in a report?",
        "first": "I write down names while people still think the conversation is informal. Later, everyone remembers the distance differently.",
        "replies": [
          [
            "Would you record your own mistake?",
            "An officer who conceals a mistake makes himself useful to anyone who discovers it."
          ],
          [
            "That sounds like mistrust of everyone.",
            "It is a habit formed by reading explanations after something has gone wrong."
          ],
          [
            "Could an innocent person suffer for a report?",
            "They could suffer more for an inaccurate one. I take the writing seriously; you should take the questions seriously."
          ]
        ]
      }
    ],
    "greetings": [
      "Serjeant Bram. Mind your words around the crown, and don't mistake that advice for agreement.",
      "I'm Corin. I'll listen carefully.",
      "Corin. You keep finding your way into difficult company.",
      "I'm beginning to notice.",
      "A dragon beside you changes the stakes of this meeting.",
      "Aurelius is my companion. I'll speak for my own choices."
    ]
  },
  "Doran": {
    "name": "Doran",
    "home": "Royal entourage",
    "role": "Knight",
    "source": "14-remaining-cast.txt:42",
    "topics": [
      {
        "title": "Armour maintenance",
        "opening": "Does armour take much looking after?",
        "first": "People notice a polished breastplate. I notice a strap about to fail.",
        "replies": [
          [
            "What do you check first?",
            "Fastenings and fit. Appearance won't hold armour in place."
          ],
          [
            "Has yours failed?",
            "During training. I prefer that lesson to a battlefield version."
          ],
          [
            "Do you enjoy polishing?",
            "Only when it doesn't replace the useful inspections."
          ]
        ]
      },
      {
        "title": "Patrol supper",
        "opening": "What do you eat when you're out on patrol?",
        "first": "I learned cooking because our patrol treated burnt porridge as unavoidable.",
        "replies": [
          [
            "Did you improve it?",
            "By watching the pot. A startling innovation."
          ],
          [
            "Were they grateful?",
            "They gave me the next shift of cooking. Gratitude has consequences."
          ],
          [
            "Do you still cook?",
            "When I can. It's pleasant to make something that isn't a threat."
          ]
        ]
      },
      {
        "title": "A frightened horse",
        "opening": "How do you calm a frightened horse?",
        "first": "A horse once refused a bridge. I tried forcing it before noticing a loose board.",
        "replies": [
          [
            "Did you apologise to it?",
            "I loosened the reins and fixed the problem. More useful than a speech."
          ],
          [
            "Was anyone hurt?",
            "No. I had time to be merely ashamed."
          ],
          [
            "Did it change your training?",
            "I listen before deciding reluctance is disobedience."
          ]
        ]
      }
    ],
    "greetings": [
      "Doran. Keep clear of the moving party and we can speak.",
      "I'm Corin. I'll stand here.",
      "Corin. Another conversation between duties?",
      "If you have time.",
      "A dragon is a serious travelling companion.",
      "Aurelius is his name. We're learning together."
    ]
  },
  "King Halvard": {
    "name": "King Halvard",
    "home": "Cinderhold",
    "role": "King of Emberfell",
    "source": "14-remaining-cast.txt:47",
    "topics": [
      {
        "title": "A king's authority",
        "opening": "What gives you the right to rule everyone?",
        "first": "A kingdom survives because somebody can end an argument. I have spent years being that somebody.",
        "replies": [
          [
            "And if your decision is wrong?",
            "Then I bear a consequence larger than your disapproval."
          ],
          [
            "You decide who may disagree.",
            "Naturally. A challenge to the crown is never merely a difference of opinion."
          ],
          [
            "Does nobody advise you?",
            "Many people do. Few understand the burden they are advising me to carry."
          ]
        ]
      },
      {
        "title": "The old riders",
        "opening": "What happened between you and the other riders?",
        "first": "The riders mistook equal power for shared purpose. They could agree on a rescue and quarrel endlessly over what came after.",
        "replies": [
          [
            "They trusted you.",
            "They trusted that I would remain satisfied with their limitations."
          ],
          [
            "You killed people who stood beside you.",
            "You offer the accusation as though I have never heard it in my own voice."
          ],
          [
            "Were you afraid of them?",
            "I knew what seven riders could do to a kingdom. I was one of them."
          ]
        ]
      },
      {
        "title": "Keeping the roads",
        "opening": "Do your roads protect the people who use them?",
        "first": "People demand safe roads and resent the men stationed on them. They want the result without the cost.",
        "replies": [
          [
            "Your collectors leave people hungry.",
            "Every province considers its own burden exceptional."
          ],
          [
            "Fear isn't the same as safety.",
            "Fear is immediate. You may discover how useful immediacy becomes when persuasion fails."
          ],
          [
            "Who protects people from you?",
            "You seem eager to nominate yourself. Consider carefully what follows that claim."
          ]
        ]
      },
      {
        "title": "The egg errand",
        "opening": "Do you remember taking Hettie's eggs in Millwood?",
        "first": "You carried that basket through a royal escort without breaking an egg. Millwood evidently teaches useful caution.",
        "replies": [
          [
            "You helped yourself to the eggs.",
            "Your village provided refreshment to its king. I suggest you describe it that way when you return."
          ],
          [
            "Maddock was waiting for them.",
            "Then he was fortunate I left him breakfast. A minor delay is a small contribution to the crown."
          ],
          [
            "I was trying to finish a job.",
            "Continue cultivating that habit. It will serve you better than cultivating grievances."
          ]
        ]
      },
      {
        "title": "Hunting dragons",
        "opening": "Why hunt dragons that have done nothing to you?",
        "first": "One surviving dragon can give a dissatisfied subject the power to make his dissatisfaction everyone else's problem.",
        "replies": [
          [
            "A hatchling hasn't threatened your throne.",
            "A hatchling grows. I have no intention of waiting until its rider thinks himself ready."
          ],
          [
            "Could a rider choose to live quietly?",
            "Until he changes his mind, or someone persuades him the kingdom needs rescuing. I know how that story begins."
          ],
          [
            "You were a rider yourself.",
            "Which is why I require no lecture on how dangerous one can become."
          ]
        ]
      },
      {
        "title": "Reports from Millwood",
        "opening": "What are your men looking for near Millwood?",
        "first": "A heavy landing, broken branches, witnesses who suddenly remember other errands. My officers have enough to continue searching.",
        "replies": [
          [
            "Would they punish someone for being mistaken?",
            "They can distinguish confusion from an invented account. You would be wise not to test how patiently."
          ],
          [
            "What if somebody saw only part of it?",
            "Then he reports that part. I employ officers to assemble an account, not villagers to decide whether it interests me."
          ],
          [
            "People are frightened of your men.",
            "Fear can sharpen a memory. My men will ask again if the first answer is unhelpful."
          ]
        ]
      },
      {
        "title": "Shelter for an injured dragon",
        "opening": "What would you do to someone who sheltered an injured dragon?",
        "first": "Anyone finding an injured dragon should withdraw and summon my officers. An attempt to hide it would make the finder part of the investigation.",
        "replies": [
          [
            "You would criminalise helping it?",
            "I would investigate someone who chose a wild dragon's safety over obedience to his king."
          ],
          [
            "What would your officers do with it?",
            "Secure the creature and await my orders. No villager needs to appoint himself its guardian."
          ],
          [
            "Would reporting it protect the finder?",
            "Cooperation is a much better beginning than concealment. I offer no guarantees to people whose accounts I have not heard."
          ]
        ]
      },
      {
        "title": "What follows your reign?",
        "opening": "What do you expect to happen after your reign?",
        "first": "You speak of the future as though a kingdom could be left to grow like an unattended hedge. Someone must impose its shape.",
        "replies": [
          [
            "People could help choose that shape.",
            "People agree most readily on what someone else ought to surrender. Rule requires an answer after the agreement ends."
          ],
          [
            "Do you expect to rule forever?",
            "I expect you to concern yourself with the king before you, not a convenient absence you have imagined."
          ],
          [
            "Are you afraid of being forgotten?",
            "I have arranged for that to be exceedingly difficult."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin. You have a habit of appearing where decisions are being made.",
      "I prefer hearing them from the person responsible.",
      "Still here? Then ask something worth my time.",
      "I intend to.",
      "You arrive beside a dragon as though that grants you standing.",
      "It gives me a companion. I can answer for myself."
    ]
  },
  "Demon": {
    "name": "Demon",
    "home": "Witchmoor and Cinderhold",
    "role": "Keeper of the trials",
    "source": "14-remaining-cast.txt:57",
    "topics": [
      {
        "title": "The keeper's part",
        "opening": "What is your part in the trials?",
        "first": "I arrange the contest and judge its end. I do not enter the fight disguised as its referee.",
        "replies": [
          [
            "Why offer the trials?",
            "To test strength under known terms. Your kingdom supplies enough surprises already."
          ],
          [
            "Can we refuse?",
            "Before beginning, certainly. An unwilling contestant proves little worth observing."
          ],
          [
            "Do you enjoy watching us struggle?",
            "I enjoy a contest answered well. Pain alone is a dull performance."
          ]
        ]
      },
      {
        "title": "The waves you summon",
        "opening": "What exactly happens when I summon a wave?",
        "first": "Each wave joins two lesser creatures with one stronger opponent. You must account for all three.",
        "replies": [
          [
            "Is defeating the largest enough?",
            "No. The remaining creatures remain opponents, not scenery."
          ],
          [
            "Can we return for another attempt?",
            "Yes. Speak to me again when you choose."
          ],
          [
            "Should we prepare first?",
            "I recommend arriving with the supplies you intend to use rather than an explanation of those you forgot."
          ]
        ]
      },
      {
        "title": "The Cinderhold Seal",
        "opening": "What is the Cinderhold Seal for?",
        "first": "The seal calls me to the chamber adjoining Cinderhold's throne room. Place it in the pedestal there.",
        "replies": [
          [
            "Will you follow us anywhere?",
            "No. The seal has a particular purpose and a particular place."
          ],
          [
            "Does taking it begin the trial?",
            "No. You still speak to me and choose to begin."
          ],
          [
            "Why use the castle?",
            "It has room for the contest. Its former owner's opinions are no longer required."
          ]
        ]
      }
    ],
    "greetings": [
      "You have survived a king. Do you seek another contest, or merely a conversation?",
      "I would like to know who is offering it.",
      "The traveller returns. I have not mistaken that for accepting a trial.",
      "Good. I prefer choosing before the fighting starts.",
      "A dragon and rider make a suitable pair for these trials.",
      "Aurelius chooses whether to join me. Tell us what you offer."
    ]
  },
  "Aurelius": {
    "name": "Aurelius",
    "home": "Beside Corin",
    "role": "Dragon companion",
    "source": "15-aurelius.txt:1",
    "topics": [
      {
        "title": "Our bond / A voice without sound",
        "opening": "Can you hear thoughts I haven't meant to share?",
        "first": "When you speak toward me, I hear you. The rest of your thoughts aren't a room I can wander through.",
        "replies": [
          [
            "Can you tell when I'm hiding something?",
            "Sometimes from your face. You have a particularly elaborate expression for 'nothing is wrong'."
          ],
          [
            "Could someone else hear us?",
            "Not simply by standing nearby. This exchange belongs to our bond."
          ],
          [
            "What does my voice sound like?",
            "Like you, without the air between us. I still notice when you're trying not to laugh."
          ]
        ]
      },
      {
        "title": "Our bond / The memories you inherited",
        "opening": "What is it like remembering lives you haven't lived?",
        "first": "I remember places I've never stood. Then I turn my head and this body is the one that moves. That difference still surprises me.",
        "replies": [
          [
            "Do you remember being other dragons?",
            "I receive fragments of their experience. I don't become the dragon who lived each one."
          ],
          [
            "Can you choose what to remember?",
            "Not reliably. A scent or a shape sometimes brings something forward; a direct question may bring nothing."
          ],
          [
            "Does it make you lonely?",
            "Occasionally. I can miss something I never personally had. Speaking to you helps me return to the present."
          ]
        ]
      },
      {
        "title": "Our bond / Hatching beside me",
        "opening": "What do you remember about hatching beside me?",
        "first": "My first clear memory of this life is trying to stand while everyone watched. The ground felt much less cooperative than it looked.",
        "replies": [
          [
            "Were you frightened of me?",
            "Startled, mostly. You moved carefully. That gave me time to decide to stay near you."
          ],
          [
            "Did you know I'd become a rider?",
            "I didn't emerge with a schedule, Corin. I wanted warmth, steadiness, and a person who wasn't grabbing at me."
          ],
          [
            "Why did you follow me?",
            "Because I wanted to. The bond grew from being together; it wasn't permission for somebody to claim me."
          ]
        ]
      },
      {
        "title": "Our bond / When we disagree",
        "opening": "What happens when we disagree about where to go?",
        "first": "I can carry you somewhere quickly and still think going there is a mistake. I'd rather say so before taking off.",
        "replies": [
          [
            "What if I think it's urgent?",
            "Tell me why. Urgency deserves an explanation, not an end to the conversation."
          ],
          [
            "Will you ever refuse me?",
            "Yes, if I think I must. I'd like you to be able to refuse me too."
          ],
          [
            "Does that worry you?",
            "Less than a friendship where one of us is afraid to object."
          ]
        ]
      },
      {
        "title": "Dragon life / Your first rain",
        "opening": "How did your first rain compare with the memories you'd inherited?",
        "first": "Old memories told me what rain was. They failed to mention how annoying a drop inside a nostril could be.",
        "replies": [
          [
            "Did you enjoy any of it?",
            "The smell afterward. Also watching you discover your coat wasn't as waterproof as advertised."
          ],
          [
            "Do inherited memories leave out ordinary things?",
            "Constantly. Nobody seems to have preserved a useful account of itching between scales."
          ],
          [
            "Would you like another rainy walk?",
            "A short one, ending somewhere dry. Wisdom has developed remarkably specific conditions."
          ]
        ]
      },
      {
        "title": "Dragon life / Being stared at",
        "opening": "Does it bother you when people stare?",
        "first": "I understand people staring. I still get tired of every arrival becoming a demonstration that dragons exist.",
        "replies": [
          [
            "Should I ask them to stop?",
            "If they're crowding us. A little curiosity is easier when I can choose how close to stand."
          ],
          [
            "Does admiration bother you too?",
            "When it replaces listening. I can be admired and still want lunch or a quiet place."
          ],
          [
            "What sort of greeting do you prefer?",
            "My name, a little room, and a question that allows me an ordinary answer."
          ]
        ]
      },
      {
        "title": "Dragon life / A dream of landing",
        "opening": "What do you dream about?",
        "first": "I dreamed I couldn't land because every clear patch became water just before I reached it. I woke with my feet moving.",
        "replies": [
          [
            "Was that an inherited memory?",
            "I don't think so. Nan was organising the water, which seems unlikely in ancient history."
          ],
          [
            "Were you frightened?",
            "Mostly annoyed. I had apparently promised to arrive before supper."
          ],
          [
            "Do dragons always dream of flying?",
            "No. I also dreamed of a fish that gave an extremely long speech. I blame your conversations."
          ]
        ]
      },
      {
        "title": "Dragon life / What you want",
        "opening": "Where would you go if we could choose any destination?",
        "first": "I'd like to choose a place because I want to see it, without first asking whether it makes us stronger.",
        "replies": [
          [
            "Where would you choose?",
            "Somewhere with open water, good food, and no one who has prepared a prophecy for me."
          ],
          [
            "Would you want me there?",
            "Yes. That part of the choice is easy."
          ],
          [
            "What if I wanted to stay home?",
            "Then we could discuss a shorter journey. Wanting something doesn't require deciding everything today."
          ]
        ]
      },
      {
        "title": "Travelling / A rider's balance",
        "opening": "How can I make riding easier for you?",
        "first": "When you tense every muscle, I feel you fighting the movement. Let your body follow mine before trying to correct it.",
        "replies": [
          [
            "How do I learn that?",
            "Start with gentle movement and tell me when you're uncertain. I can adjust if I know."
          ],
          [
            "Do I hurt you when I grip too hard?",
            "You can make me uncomfortable. I'll tell you before discomfort turns into anger."
          ],
          [
            "Will I ever feel natural up there?",
            "You already have moments when you stop thinking about it. We can build on those."
          ]
        ]
      },
      {
        "title": "Travelling / Fighting beside you",
        "opening": "What do you need from me when we fight together?",
        "first": "In a fight, I need room to turn and a clear sense of where you are. Charging after everything makes both harder.",
        "replies": [
          [
            "Should I stay close?",
            "Close enough to coordinate, with room to dodge. We can move together without standing on each other."
          ],
          [
            "What if I need you to breathe fire?",
            "Use the breath command when it's ready. Give me a clear approach, and don't expect another breath before I've recovered."
          ],
          [
            "Do you get frightened?",
            "When I lose you among enemies. I won't disguise that as ancient wisdom."
          ]
        ]
      },
      {
        "title": "Travelling / Food and recovery",
        "opening": "How do I know when you need food or rest?",
        "first": "Food helps me recover, and carrying it matters more than remembering it once I'm already hurt.",
        "replies": [
          [
            "What should I keep for you?",
            "Fish or meat, raw or prepared. Use Items when I need healing."
          ],
          [
            "What if you're knocked down?",
            "Food that restores me can get me back up. Don't keep fighting as though I'm still beside you."
          ],
          [
            "Would you prefer catching your own supper?",
            "Some days. Your fishing rod does have a reassuring tendency to keep hooks away from my mouth."
          ]
        ]
      },
      {
        "title": "Travelling / Slowing down",
        "opening": "Will you tell me when we need to slow down?",
        "first": "I notice when your steps shorten and you insist you aren't tired. You're not particularly convincing at that point.",
        "replies": [
          [
            "Are you telling me to stop?",
            "I'm asking you to consider it before fatigue chooses for you."
          ],
          [
            "Do you need rests too?",
            "Yes. Wings and scales aren't an exemption from having a body."
          ],
          [
            "Could we have a quiet moment now?",
            "Gladly. We don't need to fill every pause with a plan."
          ]
        ]
      },
      {
        "title": "History / Wingfall",
        "opening": "What do you remember about Wingfall?",
        "first": "Halvard belonged to the seven riders. He turned against the others, then made their bond a threat his kingdom was taught to fear.",
        "replies": [
          [
            "What do the dragon memories show?",
            "Fragments of terror and broken trust. I won't pretend they form a complete witness account."
          ],
          [
            "Was he always cruel?",
            "I don't have an honest answer. Knowing what he did doesn't tell me every earlier thought he had."
          ],
          [
            "Could it happen again?",
            "Power and trust will always need care. Remembering the betrayal should make people attentive, not obedient to another tyrant."
          ]
        ]
      },
      {
        "title": "History / Ordinary rider work",
        "opening": "What did riders do when they weren't fighting?",
        "first": "The old riders carried news and searched for missing people. Songs prefer the battles because waiting and wrong turns make awkward verses.",
        "replies": [
          [
            "Would you have liked that work?",
            "Some of it. Helping someone get home sounds worthwhile without needing an audience."
          ],
          [
            "Were all the riders good people?",
            "They were people. Their abilities didn't settle their judgement for them."
          ],
          [
            "What should we copy from them?",
            "The useful work, examined honestly. We needn't inherit every custom along with the name."
          ]
        ]
      },
      {
        "title": "History / What ruins leave out",
        "opening": "What do the ruins leave out of their stories?",
        "first": "A ruined hall preserves its size better than the voices that filled it. It's easy to imagine everyone solemn all the time.",
        "replies": [
          [
            "You think they laughed there?",
            "Certainly. Somebody dropped supper in an important room. History rarely preserves the helpful details."
          ],
          [
            "Can your memories fill the gaps?",
            "Some. They also leave out things dragons didn't notice."
          ],
          [
            "How do we learn the rest?",
            "Listen to the people who kept the stories, and ask where their accounts came from."
          ]
        ]
      },
      {
        "title": "History / The other dragons",
        "opening": "What do you know about the other dragons?",
        "first": "I have memories of flight and hiding after Wingfall. I cannot turn them into a reliable map of where dragons live now.",
        "replies": [
          [
            "Do you believe some survived?",
            "I hope so. Hope isn't a location, however much I want one."
          ],
          [
            "Would you want to find them?",
            "Yes, without arriving as though they owed us a meeting."
          ],
          [
            "Do you feel alone?",
            "Sometimes. Less when you ask without immediately trying to solve it."
          ]
        ]
      },
      {
        "title": "Us / Missing home",
        "opening": "Do you miss home too?",
        "first": "Home can arrive in a smell before you've decided you miss it. Woodsmoke sometimes does that to you; I can see your expression change.",
        "replies": [
          [
            "Does Millwood feel like home to you?",
            "It's where this life began, and where people first learned my name. That matters."
          ],
          [
            "I worry Nan thinks I don't want to return.",
            "Then tell her what you miss. She deserves words more specific than 'I'm fine'."
          ],
          [
            "Can we enjoy travelling and still miss it?",
            "We seem to be managing both already. I wouldn't call that a failure."
          ]
        ]
      },
      {
        "title": "Us / A bad joke",
        "opening": "Do dragons tell jokes?",
        "first": "I've been trying to invent a joke about a dragon who hoards maps. Unfortunately every ending gets lost.",
        "replies": [
          [
            "Was that the joke?",
            "It was the best surviving attempt. You may assess it honestly."
          ],
          [
            "Why maps rather than gold?",
            "Maps promise interesting places. Gold mostly promises someone asking where you keep it."
          ],
          [
            "I think you should keep practising.",
            "A supportive answer with a merciful absence of praise. I appreciate the distinction."
          ]
        ]
      }
    ],
    "greetings": [
      "You went quiet. Was that thinking, or have you forgotten I can answer?",
      "Thinking. I was getting to the part where I ask you.",
      "There you are. I can hear you more clearly when you stop trying to ask three things at once.",
      "I'll choose one to begin with.",
      "I'm already here, Corin. You needn't introduce me to myself.",
      "Fair point. I was practising."
    ]
  }
};
